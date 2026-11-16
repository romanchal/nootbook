import { db } from "@/lib/db";
import type { LedgerAccount, Prisma } from "@/generated/prisma/client";

export interface LedgerMovementLeg {
  account: LedgerAccount;
  debitPaise?: number;
  creditPaise?: number;
  userId?: string | null;
  taskId?: string | null;
  note?: string | null;
}

/**
 * Executes an immutable, balanced double-entry movement on the ledger.
 *
 * Golden Invariant (Section 5 & 7.5):
 * Every money movement creates entries whose debits and credits sum to zero.
 * Entries are NEVER edited or deleted. Corrections are new reverse entries.
 */
export async function recordBalancedMovement(
  tx: Prisma.TransactionClient | typeof db | null | undefined,
  collegeId: string,
  reference: string,
  legs: LedgerMovementLeg[],
) {
  const client = tx ?? db;
  if (legs.length < 2) {
    throw new Error("Double-entry movements require at least 2 legs.");
  }

  let totalDebits = 0;
  let totalCredits = 0;

  for (const leg of legs) {
    const debit = leg.debitPaise ?? 0;
    const credit = leg.creditPaise ?? 0;

    if (debit < 0 || credit < 0) {
      throw new Error("Debit and credit amounts must be non-negative integers.");
    }
    if (debit > 0 && credit > 0) {
      throw new Error("A single ledger leg cannot have both a debit and a credit.");
    }
    if (debit === 0 && credit === 0) {
      throw new Error("A ledger leg must have either a positive debit or a positive credit.");
    }

    totalDebits += debit;
    totalCredits += credit;
  }

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Ledger unbalance detected! Total debits (${totalDebits} paise) must equal total credits (${totalCredits} paise).`,
    );
  }

  // Insert all immutable ledger rows atomically
  await client.ledgerEntry.createMany({
    data: legs.map((leg) => ({
      collegeId,
      reference,
      account: leg.account,
      debitPaise: leg.debitPaise ?? 0,
      creditPaise: leg.creditPaise ?? 0,
      userId: leg.userId ?? null,
      taskId: leg.taskId ?? null,
      note: leg.note ?? null,
    })),
  });

  return { reference, totalAmountPaise: totalDebits };
}

/**
 * Checks whether the entire ledger for a college is in balance.
 * Used for system health audits and reconciliation.
 */
export async function verifyCollegeLedgerBalance(collegeId: string) {
  const result = await db.ledgerEntry.aggregate({
    where: { collegeId },
    _sum: {
      debitPaise: true,
      creditPaise: true,
    },
  });

  const totalDebits = result._sum.debitPaise ?? 0;
  const totalCredits = result._sum.creditPaise ?? 0;

  return {
    isBalanced: totalDebits === totalCredits,
    totalDebits,
    totalCredits,
    discrepancy: totalDebits - totalCredits,
  };
}
