import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { getUserWalletOverview } from "@/features/wallet/queries";
import { PayoutForm } from "@/features/wallet/payout-form";
import { formatPaiseToRupees } from "@/lib/money";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const user = await requireAppUser();
  const collegeId = user.collegeId;

  if (!collegeId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppNavbar
          user={{
            id: user.id,
            name: user.name || "Student",
            email: user.email,
            collegeName: user.college?.name,
            collegeCity: user.college?.city,
            roles: user.roles,
          }}
        />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center">
          <p className="text-sm text-destructive">No college associated with your account.</p>
        </main>
      </div>
    );
  }

  const { wallet, ledgerEntries, payouts } = await getUserWalletOverview(collegeId, user.id);
  const availableRupees = Math.round(wallet.availablePaise / 100);

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
      <AppNavbar
        user={{
          id: user.id,
          name: user.name || "Student",
          email: user.email,
          collegeName: user.college?.name,
          collegeCity: user.college?.city,
          roles: user.roles,
        }}
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Wallet & Ledger</span>
        </nav>

        {/* Manual Pilot Mode Notice */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-900 dark:text-blue-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
              <span className="text-base">🛡️</span> Double-Entry Balanced Student Ledger
            </div>
            <p className="max-w-xl text-[11px] leading-relaxed text-blue-800/80 dark:text-blue-200/80">
              Pilot simulation mode: Task escrows and payouts are strictly recorded with debit-credit equality. No bank credentials stored.
            </p>
          </div>

          <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-blue-800 dark:text-blue-300 border border-blue-500/30">
            Mathematical Balance: Verified
          </span>
        </div>

        {/* Top Wallet Hero Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Virtual Digital Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg lg:col-span-1 flex flex-col justify-between min-h-[200px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <span className="text-xs font-bold tracking-wider uppercase opacity-90">
                  Campus Student Card
                </span>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                Active
              </span>
            </div>

            <div className="my-4">
              <span className="text-[11px] font-medium uppercase tracking-wider opacity-80">
                Available to Withdraw
              </span>
              <p className="font-mono text-3xl font-extrabold tracking-tight mt-0.5">
                {formatPaiseToRupees(wallet.availablePaise)}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/20 pt-3 text-[11px] opacity-90">
              <div>
                <p className="font-semibold">{user.name || "Student"}</p>
                <p className="text-[10px] opacity-75">{user.college?.name || "Nagpur"}</p>
              </div>
              <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded">
                Paise Safe
              </span>
            </div>

            {/* Background card circle highlights */}
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          </div>

          {/* Quick Metrics & Payout Action */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Wallet Breakdown
                </h2>
                <p className="text-xs text-muted-foreground">
                  Task escrow deposits, earnings, and UPI payout simulation.
                </p>
              </div>

              <PayoutForm availableRupees={availableRupees} kycVerified={user.kycVerified} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Pending Escrow
                </span>
                <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPaiseToRupees(wallet.pendingPaise)}
                </p>
                <span className="text-[10px] text-muted-foreground">Held for active tasks</span>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total Earned
                </span>
                <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-foreground">
                  {formatPaiseToRupees(wallet.totalEarnedPaise)}
                </p>
                <span className="text-[10px] text-muted-foreground">From accepted tasks</span>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total Withdrawn
                </span>
                <p className="mt-1 font-mono text-lg sm:text-xl font-bold text-muted-foreground">
                  {formatPaiseToRupees(wallet.totalWithdrawnPaise)}
                </p>
                <span className="text-[10px] text-muted-foreground">Settled payouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Requests */}
        {payouts.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>💸</span> Withdrawal Requests
            </h3>
            <div className="rounded-2xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
              {payouts.map((po) => (
                <div key={po.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatPaiseToRupees(po.amountPaise)}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Requested on {new Date(po.createdAt).toLocaleDateString("en-IN")}{" "}
                      {po.partnerPayoutId && `(${po.partnerPayoutId})`}
                    </p>
                  </div>

                  <span
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                      po.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : po.status === "REQUESTED"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {po.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Double-Entry Ledger History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>📜</span> Immutable Double-Entry Ledger History
              </h3>
              <p className="text-xs text-muted-foreground">
                Every transaction generates matching debit and credit movements. Records cannot be edited or erased.
              </p>
            </div>

            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {ledgerEntries.length} {ledgerEntries.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {ledgerEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center text-xs text-muted-foreground">
              <span className="text-2xl block mb-2">📊</span>
              No ledger movements recorded yet. Movements appear when you deposit escrow for a task or receive earnings.
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
              {ledgerEntries.map((entry) => {
                const isCredit = entry.creditPaise > 0;
                const amount = isCredit ? entry.creditPaise : entry.debitPaise;

                return (
                  <div
                    key={entry.id}
                    className="p-4 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] rounded-md bg-muted px-2 py-0.5 text-foreground font-bold border border-border/60">
                          {entry.account}
                        </span>
                        {entry.task && (
                          <Link
                            href={`/tasks/${entry.task.id}`}
                            className="hover:underline font-semibold text-foreground hover:text-amber-600 transition-colors"
                          >
                            {entry.task.title}
                          </Link>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Ref: <span className="font-mono">{entry.reference}</span> ·{" "}
                        {new Date(entry.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        {entry.note && `· ${entry.note}`}
                      </p>
                    </div>

                    <div className="text-right font-mono font-extrabold text-sm sm:text-base">
                      <span className={isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}>
                        {isCredit ? "+" : "-"}
                        {formatPaiseToRupees(amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
