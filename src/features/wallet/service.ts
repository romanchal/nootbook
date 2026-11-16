import { db } from "@/lib/db";
import { getCommissionConfig } from "@/features/admin/config";
import { recordBalancedMovement } from "./ledger";

export interface DepositEscrowManualInput {
  collegeId: string;
  studentId: string;
  taskId: string;
  bidId: string;
  paymentNote?: string;
}

export interface ReleaseEscrowInput {
  collegeId: string;
  studentId: string;
  taskId: string;
}

export interface RequestPayoutInput {
  collegeId: string;
  userId: string;
  amountPaise: number;
  notes?: string;
}

export interface ProcessPayoutManualInput {
  collegeId: string;
  adminId: string;
  payoutId: string;
  reference?: string;
}

/**
 * Ensures a cached wallet row exists for the user.
 */
export async function getOrCreateWallet(collegeId: string, userId: string) {
  let wallet = await db.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await db.wallet.create({
      data: {
        collegeId,
        userId,
        availablePaise: 0,
        pendingPaise: 0,
        totalEarnedPaise: 0,
        totalWithdrawnPaise: 0,
        status: "ACTIVE",
      },
    });
  }

  return wallet;
}

/**
 * Student deposits escrow for an agreed task in Manual / Pilot Mode.
 *
 * Enforces:
 * - Task must be OPEN.
 * - Idempotent: cannot deposit escrow twice for the same task.
 * - Payer platform fee is retrieved from CommissionConfig.
 * - Double-entry ledger movement is recorded (balanced debits and credits).
 * - Winning bid is accepted, task transitions to ASSIGNED.
 */
export async function depositEscrowManual(input: DepositEscrowManualInput) {
  const { collegeId, studentId, taskId, bidId, paymentNote } = input;

  return db.$transaction(async (tx) => {
    // 1. Fetch task and verify ownership & status
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId, studentId },
    });

    if (!task) {
      throw new Error("Task not found or you are not authorized to fund it.");
    }

    if (task.status !== "OPEN") {
      throw new Error("Only open tasks can receive escrow funding.");
    }

    // 2. Check for existing escrow (idempotency guard)
    const existingEscrow = await tx.escrowHold.findUnique({
      where: { taskId },
    });

    if (existingEscrow) {
      throw new Error("An escrow hold already exists for this task.");
    }

    // 3. Fetch winning bid
    const winningBid = await tx.bid.findFirst({
      where: { id: bidId, taskId, status: "PENDING" },
      include: { earner: { select: { id: true, name: true } } },
    });

    if (!winningBid) {
      throw new Error("Selected bid is not valid or no longer pending.");
    }

    // 4. Retrieve platform fee config
    const config = await getCommissionConfig(collegeId);
    const agreedAmountPaise = winningBid.amountPaise;
    const fixedFeePaise = config.fixedFeePaise;
    const totalDepositPaise = agreedAmountPaise + fixedFeePaise;

    const paymentId = `MANUAL_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const ledgerRef = `ESCROW_DEP_${taskId}`;

    // 5. Create EscrowHold record
    const escrowHold = await tx.escrowHold.create({
      data: {
        collegeId,
        taskId,
        paymentId,
        amountPaise: totalDepositPaise,
        status: "HELD",
      },
    });

    // 6. Record balanced double-entry ledger movement:
    // Debit USER_BALANCE (payer deposit) = totalDepositPaise
    // Credit ESCROW_HELD = totalDepositPaise
    await recordBalancedMovement(tx, collegeId, ledgerRef, [
      {
        account: "USER_BALANCE",
        debitPaise: totalDepositPaise,
        userId: studentId,
        taskId,
        note: `Manual escrow deposit for task: ${task.title}`,
      },
      {
        account: "ESCROW_HELD",
        creditPaise: totalDepositPaise,
        taskId,
        note: `Escrow held (Agreed: ₹${agreedAmountPaise / 100} + Fee: ₹${fixedFeePaise / 100})`,
      },
    ]);

    // 7. Update Task to ASSIGNED with winning earner
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: "ASSIGNED",
        earnerId: winningBid.earnerId,
      },
    });

    // 8. Accept winning bid and decline others
    await tx.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    });

    await tx.bid.updateMany({
      where: {
        taskId,
        id: { not: bidId },
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });

    // 9. Write to AuditLog
    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: studentId,
        action: "ESCROW_DEPOSIT_MANUAL",
        entity: "EscrowHold",
        entityId: escrowHold.id,
        metadata: {
          taskId,
          winningBidId: bidId,
          earnerId: winningBid.earnerId,
          earnerName: winningBid.earner.name,
          agreedAmountPaise,
          fixedFeePaise,
          totalDepositPaise,
          paymentId,
          paymentNote: paymentNote || "Manual / Pilot Mode test deposit",
        },
      },
    });

    return { task: updatedTask, escrowHold };
  });
}

/**
 * Releases escrow funds upon student acceptance of completed work.
 *
 * Financial Settlement (Section 5 & 7.4):
 * - Total escrow held = Agreed Price + Payer Fee (e.g. ₹500 + ₹20 = ₹520)
 * - Commission deducted from earner (e.g. 10% of ₹500 = ₹50)
 * - Earner receives: Agreed Price - Commission (e.g. ₹500 - ₹50 = ₹450)
 * - Nootbook revenue: Commission + Payer Fee (e.g. ₹50 + ₹20 = ₹70)
 * - Double-entry ledger movement:
 *     Debit ESCROW_HELD (₹520)
 *     Credit USER_BALANCE for Earner (₹450)
 *     Credit PLATFORM_REVENUE (₹70)
 *   Sum: 520 - 450 - 70 = 0. EXACT BALANCE.
 */
export async function releaseEscrowOnAcceptance(input: ReleaseEscrowInput) {
  const { collegeId, studentId, taskId } = input;

  return db.$transaction(async (tx) => {
    // 1. Fetch task
    const task = await tx.task.findFirst({
      where: { id: taskId, collegeId, studentId },
    });

    if (!task) {
      throw new Error("Task not found or you are not authorized to accept it.");
    }

    if (task.status !== "DELIVERED") {
      throw new Error("Task must be in DELIVERED status before escrow can be released.");
    }

    if (!task.earnerId) {
      throw new Error("No assigned earner on this task.");
    }

    // 2. Fetch EscrowHold
    const escrow = await tx.escrowHold.findUnique({
      where: { taskId },
    });

    if (!escrow || escrow.status !== "HELD") {
      throw new Error("Active escrow hold not found for this task.");
    }

    // 3. Fetch commission config
    const config = await getCommissionConfig(collegeId);
    const commissionBps = config.commissionBps; // e.g. 1000 = 10%
    const fixedFeePaise = config.fixedFeePaise; // e.g. 2000 = Rs. 20

    // Agreed task amount = Total Escrow Held minus the fixed payer fee
    const agreedPricePaise = escrow.amountPaise - fixedFeePaise;
    const earnerCommissionPaise = Math.round((agreedPricePaise * commissionBps) / 10000);
    const earnerNetPaise = agreedPricePaise - earnerCommissionPaise;
    const platformRevenuePaise = earnerCommissionPaise + fixedFeePaise;

    const ledgerRef = `ESCROW_REL_${taskId}`;

    // 4. Record balanced double-entry ledger settlement
    await recordBalancedMovement(tx, collegeId, ledgerRef, [
      {
        account: "ESCROW_HELD",
        debitPaise: escrow.amountPaise,
        taskId,
        note: `Escrow released for completed task: ${task.title}`,
      },
      {
        account: "USER_BALANCE",
        creditPaise: earnerNetPaise,
        userId: task.earnerId,
        taskId,
        note: `Task payout after ${(commissionBps / 100).toFixed(1)}% commission`,
      },
      {
        account: "PLATFORM_REVENUE",
        creditPaise: platformRevenuePaise,
        taskId,
        note: `Platform revenue: Commission (₹${earnerCommissionPaise / 100}) + Fee (₹${fixedFeePaise / 100})`,
      },
    ]);

    // 5. Update EscrowHold status
    await tx.escrowHold.update({
      where: { id: escrow.id },
      data: {
        status: "RELEASED",
        releasedAt: new Date(),
        releasedById: studentId,
      },
    });

    // 6. Update Task status to ACCEPTED
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: { status: "ACCEPTED" },
    });

    // 7. Update Earner's cached Wallet atomically
    await tx.wallet.upsert({
      where: { userId: task.earnerId },
      create: {
        collegeId,
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

    // 8. Log action in AuditLog
    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: studentId,
        action: "ESCROW_RELEASE",
        entity: "EscrowHold",
        entityId: escrow.id,
        metadata: {
          taskId,
          earnerId: task.earnerId,
          totalEscrowReleasedPaise: escrow.amountPaise,
          earnerNetPaise,
          platformRevenuePaise,
          commissionBps,
        },
      },
    });

    return { task: updatedTask, earnerNetPaise, platformRevenuePaise };
  });
}

/**
 * Earner requests a payout from available wallet balance.
 * Requires KYC verification before first payout (Section 17.6).
 */
export async function requestPayout(input: RequestPayoutInput) {
  const { collegeId, userId, amountPaise, notes } = input;

  if (amountPaise < 10000) {
    throw new Error("Minimum withdrawal amount is ₹100 (10,000 paise).");
  }

  return db.$transaction(async (tx) => {
    // 1. Verify earner KYC status
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, kycVerified: true, collegeId: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.kycVerified) {
      throw new Error(
        "KYC verification required: Earner identity must be verified before requesting withdrawals.",
      );
    }

    // 2. Verify wallet available balance
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.availablePaise < amountPaise) {
      throw new Error("Insufficient available wallet balance.");
    }

    const payoutId = `PO_${Date.now()}`;
    const ledgerRef = `PAYOUT_REQ_${payoutId}`;

    // 3. Create Payout entry
    const payout = await tx.payout.create({
      data: {
        collegeId,
        userId,
        amountPaise,
        status: "REQUESTED",
        partnerPayoutId: notes || null,
      },
    });

    // 4. Double-entry movement:
    // Debit USER_BALANCE
    // Credit PAYOUTS_PENDING
    await recordBalancedMovement(tx, collegeId, ledgerRef, [
      {
        account: "USER_BALANCE",
        debitPaise: amountPaise,
        userId,
        note: `Payout withdrawal request: ₹${amountPaise / 100}`,
      },
      {
        account: "PAYOUTS_PENDING",
        creditPaise: amountPaise,
        userId,
        note: "Held in pending payouts awaiting bank transfer / UPI settlement",
      },
    ]);

    // 5. Update cached wallet balance
    await tx.wallet.update({
      where: { userId },
      data: {
        availablePaise: { decrement: amountPaise },
      },
    });

    // 6. Log to AuditLog
    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: userId,
        action: "PAYOUT_REQUEST",
        entity: "Payout",
        entityId: payout.id,
        metadata: {
          amountPaise,
          amountRupees: `₹${amountPaise / 100}`,
        },
      },
    });

    return payout;
  });
}

/**
 * Super/College Admin manually approves and settles a payout in manual mode.
 */
export async function processPayoutManual(input: ProcessPayoutManualInput) {
  const { collegeId, adminId, payoutId, reference } = input;

  return db.$transaction(async (tx) => {
    const payout = await tx.payout.findFirst({
      where: { id: payoutId, collegeId },
    });

    if (!payout) {
      throw new Error("Payout request not found.");
    }

    if (payout.status !== "REQUESTED") {
      throw new Error("Only requested payouts can be processed.");
    }

    const ledgerRef = `PAYOUT_SETTLE_${payout.id}`;

    // 1. Double-entry movement:
    // Debit PAYOUTS_PENDING
    // Credit USER_BALANCE / settlement clearing
    await recordBalancedMovement(tx, collegeId, ledgerRef, [
      {
        account: "PAYOUTS_PENDING",
        debitPaise: payout.amountPaise,
        userId: payout.userId,
        note: "Settled payout to bank/UPI",
      },
      {
        account: "USER_BALANCE",
        creditPaise: payout.amountPaise,
        userId: payout.userId,
        note: `Settled manual payout: ${reference || "UPI/Bank transfer verified"}`,
      },
    ]);

    // 2. Update payout
    const updated = await tx.payout.update({
      where: { id: payout.id },
      data: {
        status: "PAID",
        processedAt: new Date(),
        partnerPayoutId: reference || "MANUAL_SETTLED",
      },
    });

    // 3. Update wallet totalWithdrawn
    await tx.wallet.update({
      where: { userId: payout.userId },
      data: {
        totalWithdrawnPaise: { increment: payout.amountPaise },
      },
    });

    // 4. Log in AuditLog
    await tx.auditLog.create({
      data: {
        collegeId,
        actorId: adminId,
        action: "PAYOUT_PROCESS_MANUAL",
        entity: "Payout",
        entityId: payout.id,
        metadata: {
          payoutId: payout.id,
          amountPaise: payout.amountPaise,
          settledAt: new Date().toISOString(),
          reference,
        },
      },
    });

    return updated;
  });
}
