import { db } from "@/lib/db";
import { recordBalancedMovement, type LedgerMovementLeg } from "@/features/wallet/ledger";
import { getCommissionConfig } from "@/features/admin/config";
import { issueUserStrike } from "./safety";
import type { DisputeStatus, Prisma, TaskStatus } from "@/generated/prisma/client";

export interface OpenDisputeInput {
  collegeId: string;
  userId: string;
  taskId: string;
  reason: string;
  evidence?: string | null;
}

export interface ResolveDisputeInput {
  collegeId: string;
  adminId: string;
  isSuperAdmin?: boolean;
  disputeId: string;
  decision: "REFUND_STUDENT" | "RELEASE_EARNER" | "SPLIT";
  decisionNotes: string;
  splitStudentPaise?: number;
  splitEarnerPaise?: number;
  issueStrikeUserId?: string | null;
  strikeReason?: string | null;
}

/**
 * Allows a student or earner to open a dispute on an active/delivered task.
 *
 * Rules:
 * - Caller must be either task.studentId or task.earnerId.
 * - Task status must be ASSIGNED or DELIVERED.
 * - Only one dispute can be opened per task.
 * - Transitions Task.status to DISPUTED.
 * - Logs to immutable AuditLog.
 */
export async function openDispute(input: OpenDisputeInput) {
  const { collegeId, userId, taskId, reason, evidence } = input;

  return db.$transaction(async (tx) => {
    // 1. Fetch task and check access
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId },
      include: {
        dispute: true,
        escrowHold: true,
        student: { select: { id: true, name: true } },
        earner: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      throw new Error("Task not found or inaccessible in your college.");
    }

    const isStudent = task.studentId === userId;
    const isEarner = task.earnerId === userId;

    if (!isStudent && !isEarner) {
      throw new Error("Only the student or assigned earner can open a dispute.");
    }

    if (task.status !== "ASSIGNED" && task.status !== "DELIVERED") {
      throw new Error(
        `Disputes can only be opened for tasks in ASSIGNED or DELIVERED status. Current status is ${task.status}.`,
      );
    }

    if (task.dispute) {
      throw new Error("A dispute has already been filed for this task.");
    }

    // 2. Create Dispute
    const dispute = await tx.dispute.create({
      data: {
        taskId,
        collegeId,
        openedById: userId,
        reason,
        evidence: evidence || null,
        status: "OPEN",
      },
    });

    // 3. Update Task status to DISPUTED
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: { status: "DISPUTED" },
    });

    // 4. Record tamper-evident AuditLog
    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: userId,
        action: "DISPUTE_OPEN",
        entity: "Dispute",
        entityId: dispute.id,
        metadata: {
          taskId,
          taskTitle: task.title,
          openedByRole: isStudent ? "STUDENT" : "EARNER",
          reason,
        },
      },
    });

    return { dispute, task: updatedTask };
  });
}

/**
 * Admin resolves a dispute end-to-end.
 *
 * Supported Outcomes:
 * 1. REFUND_STUDENT:
 *    - Full refund of held escrow to the student.
 *    - Balanced ledger: Debit ESCROW_HELD, Credit USER_BALANCE for student.
 *    - EscrowHold -> REFUNDED, Task -> REFUNDED, Dispute -> RESOLVED_REFUND.
 *
 * 2. RELEASE_EARNER:
 *    - Work verified and upheld. Escrow released to earner minus commission.
 *    - Balanced ledger: Debit ESCROW_HELD, Credit USER_BALANCE for earner, Credit PLATFORM_REVENUE.
 *    - EscrowHold -> RELEASED, Task -> ACCEPTED, Dispute -> RESOLVED_RELEASE.
 *
 * 3. SPLIT:
 *    - Custom split decided by admin (e.g. partial completion).
 *    - Balanced ledger: Debit ESCROW_HELD, Credit student, Credit earner, Credit platform.
 *    - Dispute -> CLOSED.
 *
 * Optional:
 * - Can issue a strike against the offending student or earner in the same workflow.
 */
export async function resolveDispute(input: ResolveDisputeInput) {
  const {
    collegeId,
    adminId,
    isSuperAdmin = false,
    disputeId,
    decision,
    decisionNotes,
    splitStudentPaise,
    splitEarnerPaise,
    issueStrikeUserId,
    strikeReason,
  } = input;

  return db.$transaction(async (tx) => {
    // 1. Fetch dispute and task
    const dispute = await tx.dispute.findUnique({
      where: { id: disputeId },
      include: {
        task: {
          include: {
            escrowHold: true,
            student: { select: { id: true, name: true } },
            earner: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!dispute) {
      throw new Error("Dispute not found.");
    }

    if (!isSuperAdmin && dispute.collegeId !== collegeId) {
      throw new Error("Cannot resolve disputes from another college.");
    }

    if (dispute.status !== "OPEN") {
      throw new Error(`This dispute is already ${dispute.status.toLowerCase()}.`);
    }

    const task = dispute.task;
    const escrow = task.escrowHold;

    if (!escrow || escrow.status !== "HELD") {
      throw new Error("Active escrow funds not found for this disputed task.");
    }

    const totalEscrowPaise = escrow.amountPaise;
    const ledgerRef = `DISPUTE_RES_${dispute.id}`;
    let finalDisputeStatus: DisputeStatus;
    let finalTaskStatus: TaskStatus;

    if (decision === "REFUND_STUDENT") {
      // Full refund to student:
      // Balanced double-entry movement:
      // Debit ESCROW_HELD (totalEscrowPaise)
      // Credit USER_BALANCE for Student (totalEscrowPaise)
      await recordBalancedMovement(tx, dispute.collegeId, ledgerRef, [
        {
          account: "ESCROW_HELD",
          debitPaise: totalEscrowPaise,
          taskId: task.id,
          note: `Dispute refunded: ${decisionNotes}`,
        },
        {
          account: "USER_BALANCE",
          creditPaise: totalEscrowPaise,
          userId: task.studentId,
          taskId: task.id,
          note: `Full escrow refund on dispute resolution`,
        },
      ]);

      // Update student wallet
      await tx.wallet.upsert({
        where: { userId: task.studentId },
        create: {
          collegeId: dispute.collegeId,
          userId: task.studentId,
          availablePaise: totalEscrowPaise,
          status: "ACTIVE",
        },
        update: {
          availablePaise: { increment: totalEscrowPaise },
        },
      });

      // Update EscrowHold
      await tx.escrowHold.update({
        where: { id: escrow.id },
        data: {
          status: "REFUNDED",
          releasedAt: new Date(),
          releasedById: adminId,
        },
      });

      finalDisputeStatus = "RESOLVED_REFUND";
      finalTaskStatus = "REFUNDED";
    } else if (decision === "RELEASE_EARNER") {
      if (!task.earnerId) {
        throw new Error("No earner assigned to this task.");
      }

      // Calculate commission & fees
      const config = await getCommissionConfig(dispute.collegeId);
      const commissionBps = config.commissionBps;
      const fixedFeePaise = config.fixedFeePaise;

      const agreedPricePaise = totalEscrowPaise - fixedFeePaise;
      const earnerCommissionPaise = Math.round((agreedPricePaise * commissionBps) / 10000);
      const earnerNetPaise = agreedPricePaise - earnerCommissionPaise;
      const platformRevenuePaise = earnerCommissionPaise + fixedFeePaise;

      // Balanced double-entry movement:
      // Debit ESCROW_HELD (totalEscrowPaise)
      // Credit USER_BALANCE for Earner (earnerNetPaise)
      // Credit PLATFORM_REVENUE (platformRevenuePaise)
      await recordBalancedMovement(tx, dispute.collegeId, ledgerRef, [
        {
          account: "ESCROW_HELD",
          debitPaise: totalEscrowPaise,
          taskId: task.id,
          note: `Dispute released to earner: ${decisionNotes}`,
        },
        {
          account: "USER_BALANCE",
          creditPaise: earnerNetPaise,
          userId: task.earnerId,
          taskId: task.id,
          note: `Earner payout on dispute resolution`,
        },
        {
          account: "PLATFORM_REVENUE",
          creditPaise: platformRevenuePaise,
          taskId: task.id,
          note: `Platform fee and commission on dispute resolution`,
        },
      ]);

      // Update earner wallet
      await tx.wallet.upsert({
        where: { userId: task.earnerId },
        create: {
          collegeId: dispute.collegeId,
          userId: task.earnerId,
          availablePaise: earnerNetPaise,
          totalEarnedPaise: earnerNetPaise,
          status: "ACTIVE",
        },
        update: {
          availablePaise: { increment: earnerNetPaise },
          totalEarnedPaise: { increment: earnerNetPaise },
        },
      });

      // Update EscrowHold
      await tx.escrowHold.update({
        where: { id: escrow.id },
        data: {
          status: "RELEASED",
          releasedAt: new Date(),
          releasedById: adminId,
        },
      });

      finalDisputeStatus = "RESOLVED_RELEASE";
      finalTaskStatus = "ACCEPTED";
    } else if (decision === "SPLIT") {
      const studentAmount = Math.max(0, splitStudentPaise || 0);
      const earnerAmount = Math.max(0, splitEarnerPaise || 0);

      if (studentAmount + earnerAmount > totalEscrowPaise) {
        throw new Error(
          `Sum of split amounts (₹${(studentAmount + earnerAmount) / 100}) cannot exceed total held escrow (₹${totalEscrowPaise / 100}).`,
        );
      }

      const platformAmount = totalEscrowPaise - studentAmount - earnerAmount;

      const legs: LedgerMovementLeg[] = [
        {
          account: "ESCROW_HELD",
          debitPaise: totalEscrowPaise,
          creditPaise: 0,
          taskId: task.id,
          note: `Dispute split settlement: ${decisionNotes}`,
        },
      ];

      if (studentAmount > 0) {
        legs.push({
          account: "USER_BALANCE",
          debitPaise: 0,
          creditPaise: studentAmount,
          userId: task.studentId,
          taskId: task.id,
          note: "Partial dispute refund to student",
        });

        await tx.wallet.upsert({
          where: { userId: task.studentId },
          create: {
            collegeId: dispute.collegeId,
            userId: task.studentId,
            availablePaise: studentAmount,
            status: "ACTIVE",
          },
          update: {
            availablePaise: { increment: studentAmount },
          },
        });
      }

      if (earnerAmount > 0 && task.earnerId) {
        legs.push({
          account: "USER_BALANCE",
          debitPaise: 0,
          creditPaise: earnerAmount,
          userId: task.earnerId,
          taskId: task.id,
          note: "Partial dispute payment to earner",
        });

        await tx.wallet.upsert({
          where: { userId: task.earnerId },
          create: {
            collegeId: dispute.collegeId,
            userId: task.earnerId,
            availablePaise: earnerAmount,
            totalEarnedPaise: earnerAmount,
            status: "ACTIVE",
          },
          update: {
            availablePaise: { increment: earnerAmount },
            totalEarnedPaise: { increment: earnerAmount },
          },
        });
      }

      if (platformAmount > 0) {
        legs.push({
          account: "PLATFORM_REVENUE",
          debitPaise: 0,
          creditPaise: platformAmount,
          taskId: task.id,
          note: "Platform revenue share from split dispute settlement",
        });
      }

      await recordBalancedMovement(tx, dispute.collegeId, ledgerRef, legs);

      await tx.escrowHold.update({
        where: { id: escrow.id },
        data: {
          status: studentAmount > earnerAmount ? "REFUNDED" : "RELEASED",
          releasedAt: new Date(),
          releasedById: adminId,
        },
      });

      finalDisputeStatus = "CLOSED";
      finalTaskStatus = studentAmount > earnerAmount ? "REFUNDED" : "ACCEPTED";
    } else {
      throw new Error("Invalid dispute resolution decision.");
    }

    // Update Task
    const updatedTask = await tx.task.update({
      where: { id: task.id },
      data: { status: finalTaskStatus },
    });

    // Update Dispute
    const updatedDispute = await tx.dispute.update({
      where: { id: dispute.id },
      data: {
        status: finalDisputeStatus,
        decision: decisionNotes,
        decidedById: adminId,
        decidedAt: new Date(),
      },
    });

    // Optional Strike issuance
    if (issueStrikeUserId && strikeReason) {
      await issueUserStrike({
        collegeId: dispute.collegeId,
        adminId,
        targetUserId: issueStrikeUserId,
        reason: strikeReason,
        taskId: task.id,
      });
    }

    // Write AuditLog
    await tx.auditLog.create({
      data: {
        collegeId: dispute.collegeId,
        actorId: adminId,
        action: "DISPUTE_RESOLVE",
        entity: "Dispute",
        entityId: dispute.id,
        metadata: {
          taskId: task.id,
          decision,
          decisionNotes,
          finalDisputeStatus,
          finalTaskStatus,
          totalEscrowPaise,
        },
      },
    });

    return { dispute: updatedDispute, task: updatedTask };
  });
}

/**
 * Returns disputes for college admins or super admins.
 */
export async function getCollegeDisputes(
  collegeId: string,
  options: { status?: DisputeStatus; limit?: number; isSuperAdmin?: boolean } = {},
) {
  const { status, limit = 50, isSuperAdmin = false } = options;

  const where: Prisma.DisputeWhereInput = {};
  if (!isSuperAdmin) {
    where.collegeId = collegeId;
  }
  if (status) {
    where.status = status;
  }

  return db.dispute.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      openedBy: { select: { id: true, name: true, email: true } },
      decidedBy: { select: { id: true, name: true, email: true } },
      college: { select: { id: true, name: true } },
      task: {
        select: {
          id: true,
          title: true,
          type: true,
          budgetPaise: true,
          status: true,
          student: { select: { id: true, name: true, email: true } },
          earner: { select: { id: true, name: true, email: true } },
          escrowHold: { select: { id: true, amountPaise: true, status: true, paymentId: true } },
        },
      },
    },
  });
}

/**
 * Returns a single dispute by ID with strict college check.
 */
export async function getDisputeById(
  disputeId: string,
  collegeId: string,
  isSuperAdmin = false,
) {
  const where: Prisma.DisputeWhereInput = { id: disputeId };
  if (!isSuperAdmin) {
    where.collegeId = collegeId;
  }

  return db.dispute.findFirst({
    where,
    include: {
      openedBy: { select: { id: true, name: true, email: true } },
      decidedBy: { select: { id: true, name: true, email: true } },
      task: {
        include: {
          student: { select: { id: true, name: true, email: true } },
          earner: { select: { id: true, name: true, email: true } },
          escrowHold: true,
        },
      },
    },
  });
}
