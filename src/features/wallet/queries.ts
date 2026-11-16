import { db } from "@/lib/db";
import { getOrCreateWallet } from "./service";
import { verifyCollegeLedgerBalance } from "./ledger";

/**
 * Returns the user's wallet with cached balances and recent activity.
 */
export async function getUserWalletOverview(collegeId: string, userId: string) {
  const wallet = await getOrCreateWallet(collegeId, userId);

  const [ledgerEntries, payouts] = await Promise.all([
    db.ledgerEntry.findMany({
      where: {
        collegeId,
        userId,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        task: {
          select: { id: true, title: true, type: true },
        },
      },
    }),
    db.payout.findMany({
      where: {
        collegeId,
        userId,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    wallet,
    ledgerEntries,
    payouts,
  };
}

/**
 * Super/College Admin overview of platform financial health.
 */
export async function getFinancialAuditMetrics(collegeId?: string | null) {
  const where = collegeId ? { collegeId } : {};

  const [revenueAggregation, escrowHolds, payouts, balanceCheck] = await Promise.all([
    db.ledgerEntry.aggregate({
      where: {
        ...where,
        account: "PLATFORM_REVENUE",
      },
      _sum: { creditPaise: true },
    }),
    db.escrowHold.aggregate({
      where: {
        ...where,
        status: "HELD",
      },
      _sum: { amountPaise: true },
    }),
    db.payout.aggregate({
      where: {
        ...where,
        status: "PAID",
      },
      _sum: { amountPaise: true },
    }),
    collegeId ? verifyCollegeLedgerBalance(collegeId) : Promise.resolve({ isBalanced: true, discrepancy: 0 }),
  ]);

  return {
    totalRevenuePaise: revenueAggregation._sum.creditPaise ?? 0,
    activeEscrowPaise: escrowHolds._sum.amountPaise ?? 0,
    totalSettledPayoutsPaise: payouts._sum.amountPaise ?? 0,
    ledgerStatus: balanceCheck.isBalanced ? ("BALANCED" as const) : ("DISCREPANCY" as const),
    discrepancyPaise: balanceCheck.discrepancy,
  };
}
