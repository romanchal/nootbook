import { db } from "@/lib/db";
import { containsAcademicIntegrityViolation } from "@/features/tasks/schemas";

export const STRIKE_LIMIT_FOR_SUSPENSION = 3;

export interface IssueStrikeInput {
  collegeId: string;
  adminId: string;
  targetUserId: string;
  reason: string;
  taskId?: string | null;
}

export interface ReinstatementInput {
  collegeId: string;
  adminId: string;
  targetUserId: string;
  reason: string;
}

/**
 * Counts prior strikes for a user from tamper-evident AuditLog records.
 */
export async function countUserStrikes(userId: string): Promise<number> {
  return db.auditLog.count({
    where: {
      entity: "User",
      entityId: userId,
      action: { in: ["USER_STRIKE", "USER_STRIKE_SUSPEND"] },
    },
  });
}

/**
 * Fetches all strike audit records for a user.
 */
export async function getUserStrikes(userId: string) {
  const [strikes, user] = await Promise.all([
    db.auditLog.findMany({
      where: {
        entity: "User",
        entityId: userId,
        action: { in: ["USER_STRIKE", "USER_STRIKE_SUSPEND"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, status: true },
    }),
  ]);

  return {
    count: strikes.length,
    strikes,
    isSuspended: user?.status === "SUSPENDED" || user?.status === "BANNED",
    status: user?.status ?? "ACTIVE",
  };
}

/**
 * Issues a strike against a student or earner for safety / policy violations.
 * (Academic integrity breaches, toxic conduct, bad faith disputes, off-platform payment attempts).
 *
 * Three-Strike Escalation:
 * - Strike 1: Official Warning.
 * - Strike 2: Second Warning.
 * - Strike 3: Automatic Account Suspension + Wallet Freeze.
 *
 * Writes tamper-evident record to AuditLog.
 */
export async function issueUserStrike(input: IssueStrikeInput) {
  const { collegeId, adminId, targetUserId, reason, taskId } = input;

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, status: true, collegeId: true },
    });

    if (!user) {
      throw new Error("Target user not found.");
    }

    // College isolation check
    if (user.collegeId && user.collegeId !== collegeId) {
      throw new Error("Cannot moderate users from another college.");
    }

    // Count prior strikes
    const priorStrikes = await tx.auditLog.count({
      where: {
        entity: "User",
        entityId: targetUserId,
        action: { in: ["USER_STRIKE", "USER_STRIKE_SUSPEND"] },
      },
    });

    const newStrikeCount = priorStrikes + 1;
    const shouldSuspend = newStrikeCount >= STRIKE_LIMIT_FOR_SUSPENSION;

    if (shouldSuspend) {
      // 1. Suspend User
      await tx.user.update({
        where: { id: targetUserId },
        data: { status: "SUSPENDED" },
      });

      // 2. Freeze User's Wallet if exists
      await tx.wallet.updateMany({
        where: { userId: targetUserId },
        data: { status: "FROZEN" },
      });

      // 3. Log Strike + Suspension
      const log = await tx.auditLog.create({
        data: {
          collegeId,
          actorId: adminId,
          action: "USER_STRIKE_SUSPEND",
          entity: "User",
          entityId: targetUserId,
          metadata: {
            strikeNumber: newStrikeCount,
            reason,
            taskId: taskId || null,
            automaticSuspension: true,
          },
        },
      });

      return {
        strikeCount: newStrikeCount,
        suspended: true,
        auditLogId: log.id,
      };
    }

    // Ordinary strike warning (Strike 1 or 2)
    const log = await tx.auditLog.create({
      data: {
        collegeId,
        actorId: adminId,
        action: "USER_STRIKE",
        entity: "User",
        entityId: targetUserId,
        metadata: {
          strikeNumber: newStrikeCount,
          reason,
          taskId: taskId || null,
          automaticSuspension: false,
        },
      },
    });

    return {
      strikeCount: newStrikeCount,
      suspended: false,
      auditLogId: log.id,
    };
  });
}

/**
 * Reinstates a suspended user and unfreezes their wallet.
 * Strictly logs to AuditLog.
 */
export async function reinstateUser(input: ReinstatementInput) {
  const { collegeId, adminId, targetUserId, reason } = input;

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, status: true, collegeId: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.collegeId && user.collegeId !== collegeId) {
      throw new Error("Cannot moderate users from another college.");
    }

    await tx.user.update({
      where: { id: targetUserId },
      data: { status: "ACTIVE" },
    });

    await tx.wallet.updateMany({
      where: { userId: targetUserId },
      data: { status: "ACTIVE" },
    });

    const log = await tx.auditLog.create({
      data: {
        collegeId,
        actorId: adminId,
        action: "USER_REINSTATE",
        entity: "User",
        entityId: targetUserId,
        metadata: { reason },
      },
    });

    return { success: true, auditLogId: log.id };
  });
}

/**
 * Validates text against academic integrity rules.
 */
export function verifyAcademicIntegrity(text: string): {
  isValid: boolean;
  violationMessage?: string;
} {
  if (containsAcademicIntegrityViolation(text)) {
    return {
      isValid: false,
      violationMessage:
        "Content violates Nootbook Academic Integrity policy. Prohibited: exam cheating, proxy attendance, impersonation, or test assistance.",
    };
  }
  return { isValid: true };
}
