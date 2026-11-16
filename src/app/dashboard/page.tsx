import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { AppNavbar } from "@/components/layout/app-navbar";
import { db } from "@/lib/db";
import { formatPaiseToRupees } from "@/lib/money";
import {
  hasClassAdminAccess,
  hasCollegeAdminAccess,
  hasEarnerAccess,
  isSuperAdmin,
} from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAppUser();

  const collegeName = user.college?.name ?? "No college assigned";
  const collegeCity = user.college?.city ?? "Nagpur";
  const roles = user.roles;

  const canEarner = hasEarnerAccess(roles, user.collegeId ?? undefined);
  const canClassAdmin = user.collegeId
    ? hasClassAdminAccess(roles, user.collegeId)
    : false;
  const canCollegeAdmin = user.collegeId
    ? hasCollegeAdminAccess(roles, user.collegeId)
    : false;
  const canSuperAdmin = isSuperAdmin(roles);

  // Fetch student quick stats
  const [wallet, myTasksCount, bookmarksCount] = await Promise.all([
    user.collegeId
      ? db.wallet.findFirst({
          where: { userId: user.id, collegeId: user.collegeId },
          select: { availablePaise: true, pendingPaise: true },
        })
      : null,
    user.collegeId
      ? db.task.count({
          where: { studentId: user.id, collegeId: user.collegeId },
        })
      : 0,
    db.bookmark.count({
      where: { userId: user.id },
    }),
  ]);

  const availableBalancePaise = wallet?.availablePaise ?? 0;
  const pendingEscrowPaise = wallet?.pendingPaise ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
      {/* Top Navigation Bar */}
      <AppNavbar
        user={{
          id: user.id,
          name: user.name || "Student",
          email: user.email,
          collegeName,
          collegeCity,
          roles: user.roles,
        }}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        {/* Student Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <span>🎓</span>
                  <span>{collegeName}</span>
                </span>
                <span className="text-xs text-muted-foreground">· {collegeCity}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome back, {user.name ? user.name.split(" ")[0] : "Student"} 👋
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Your unified campus workspace for 3-tap exam papers, verified notes, and peer-to-peer student task assistance.
              </p>

              {/* Roles Chips */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                {roles.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                  >
                    {r.name.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Balance CTA Pill */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <Link
                href="/wallet"
                className="group flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 transition-all hover:bg-emerald-500/15 hover:border-emerald-500/40"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
                    Wallet Balance
                  </span>
                  <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                    {formatPaiseToRupees(availableBalancePaise)}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </Link>
            </div>
          </div>

          {/* Decorative ambient glow */}
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/tasks/my"
            className="group rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>My Tasks</span>
              <span className="text-base group-hover:scale-110 transition-transform">📋</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{myTasksCount}</p>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Manage & Review →
            </span>
          </Link>

          <Link
            href="/library/bookmarks"
            className="group rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Bookmarks</span>
              <span className="text-base group-hover:scale-110 transition-transform">🔖</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{bookmarksCount}</p>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
              Saved papers →
            </span>
          </Link>

          <Link
            href="/wallet"
            className="group rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Pending Escrow</span>
              <span className="text-base group-hover:scale-110 transition-transform">🛡️</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {formatPaiseToRupees(pendingEscrowPaise)}
            </p>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
              Held in tasks →
            </span>
          </Link>

          <Link
            href="/tasks/new"
            className="group flex flex-col justify-between rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 transition-all hover:bg-amber-500/10 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
              <span>Need Assistance?</span>
              <span className="text-base font-bold">+</span>
            </div>
            <p className="text-xs font-semibold text-foreground">Post a New Task</p>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Get peer bids in mins →
            </span>
          </Link>
        </div>

        {/* Bento Grid: Academic Library */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>📚</span> Academic Resource Library
            </h2>
            <Link href="/library" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold">
              Browse All Departments →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <Link
              href="/library"
              className="group rounded-2xl border border-border/80 bg-card p-5 transition-all hover:border-amber-500/40 hover:shadow-sm hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600 dark:text-amber-400">
                  📁
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  Explore →
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">Curriculum Tree</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                3-tap hierarchy: Engineering Department → Semester → Subject → Question Papers & Manuals.
              </p>
            </Link>

            <Link
              href="/library/search"
              className="group rounded-2xl border border-border/80 bg-card p-5 transition-all hover:border-amber-500/40 hover:shadow-sm hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-600 dark:text-blue-400">
                  ⚡
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  &lt;1s Index
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">Instant Search</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Fast multi-department query across university question papers, lab manuals, and syllabus files.
              </p>
            </Link>

            <Link
              href="/library/bookmarks"
              className="group rounded-2xl border border-border/80 bg-card p-5 transition-all hover:border-amber-500/40 hover:shadow-sm hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-xl text-rose-600 dark:text-rose-400">
                  🔖
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                  Saved →
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">Saved Bookmarks</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                One-tap access to your saved revision sheets and exam papers for offline preparation.
              </p>
            </Link>
          </div>
        </section>

        {/* Bento Grid: Task Marketplace */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>💼</span> Peer Task Marketplace
            </h2>
            <Link href="/tasks" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold">
              View All Bids →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {/* My Tasks Highlighted Card */}
            <Link
              href="/tasks/my"
              className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/10 p-5 transition-all hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600 dark:text-amber-400">
                  📋
                </div>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  {myTasksCount} Tasks
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                My Posted Tasks
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Review submitted bids from peers, inspect deliverables, and release escrow safely.
              </p>
            </Link>

            <Link
              href="/tasks"
              className="group rounded-2xl border border-border/80 bg-card p-5 transition-all hover:border-amber-500/40 hover:shadow-sm hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-600 dark:text-blue-400">
                  🛒
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                  Browse →
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">Task Marketplace</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Formatting, LaTeX typing, seminar PPT design, and 1-on-1 tutoring requests.
              </p>
            </Link>

            <Link
              href="/wallet"
              className="group rounded-2xl border border-border/80 bg-card p-5 transition-all hover:border-emerald-500/40 hover:shadow-sm hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-600 dark:text-emerald-400">
                  🛡️
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Paise Balanced
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">Wallet & Ledger</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Double-entry balanced student ledger, earner withdrawal requests, and escrow holds.
              </p>
            </Link>
          </div>
        </section>

        {/* Specialized Panels (Earner / Admins) */}
        {(canEarner || canClassAdmin || canCollegeAdmin || canSuperAdmin) && (
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>⚡</span> Your Specialized Roles & Consoles
            </h2>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {canEarner && (
                <Link
                  href="/earner"
                  className="group rounded-2xl border border-primary/20 bg-card p-5 transition-all hover:border-primary hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      Verified Campus Earner
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                      Workspace →
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    Earner Workspace
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submit proposals to peer requests, deliver completed work, and request earnings payout.
                  </p>
                </Link>
              )}

              {canCollegeAdmin && (
                <Link
                  href="/admin/college"
                  className="group rounded-2xl border border-blue-500/30 bg-gradient-to-br from-card via-card to-blue-500/5 p-5 transition-all hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      🏛️ College Admin Console
                    </span>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 group-hover:translate-x-0.5 transition-transform">
                      Manage PBCOE →
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    PBCOE Campus Administration
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Manage 8 engineering branches, moderate uploaded exam papers, assign Class Admins, and mediate student task dispute escrows.
                  </p>
                </Link>
              )}

              {canSuperAdmin && (
                <Link
                  href="/admin/super"
                  className="group rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-card via-card to-indigo-500/5 p-5 transition-all hover:border-indigo-600 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      👑 Platform Super Admin
                    </span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 group-hover:translate-x-0.5 transition-transform">
                      Global Console →
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-foreground group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    Global Multi-College Super Console
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Cross-college directory, platform commission & revenue ledger, global fee settings, and platform-wide security audit logs.
                  </p>
                </Link>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
