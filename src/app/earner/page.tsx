import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEarnerGuard } from "@/features/auth/guards";
import {
  getEarnerActiveTasks,
  getEarnerCompletedTasks,
  getEarnerStats,
  getOpenMarketplaceTasks,
} from "@/features/tasks/queries";
import { TaskCard } from "@/features/tasks/task-card";
import { buttonVariants } from "@/components/ui/button";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

export default async function EarnerPage() {
  const user = await requireEarnerGuard();
  const collegeId = user.collegeId;

  if (!collegeId) {
    notFound();
  }

  const [stats, activeTasks, openTasks, completedTasks] = await Promise.all([
    getEarnerStats(collegeId, user.id),
    getEarnerActiveTasks(collegeId, user.id),
    getOpenMarketplaceTasks(collegeId, { limit: 20 }),
    getEarnerCompletedTasks(collegeId, user.id),
  ]);

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

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Earner Workspace</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Verified Earner
                </span>
                <span className="text-xs text-muted-foreground">{user.college?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Earner Workspace
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Browse campus academic assistance requests, submit proposals, track deliverables, and earn income.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/wallet"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-2xs"
              >
                <span>💰</span>
                <span>Earner Wallet</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Active Work
            </span>
            <p className="mt-1 text-3xl font-extrabold text-primary font-mono">{stats.activeCount}</p>
            <span className="text-xs text-muted-foreground">Tasks currently in progress</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Tasks Completed
            </span>
            <p className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.completedCount}
            </p>
            <span className="text-xs text-muted-foreground">Accepted student deliverables</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Campus Rating
            </span>
            <p className="mt-1 text-3xl font-extrabold text-amber-500 font-mono">
              {stats.averageRating ? `★ ${stats.averageRating}` : "--"}
            </p>
            <span className="text-xs text-muted-foreground">{stats.reviewsCount} verified student reviews</span>
          </div>
        </div>

        {/* Section 1: Active Tasks (Waiting for Delivery) */}
        {activeTasks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Active Assignments ({activeTasks.length})
              </h2>
              <span className="text-xs text-muted-foreground">Deliverables due soon</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {activeTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Open Campus Tasks Available for Bidding */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
                <span>🛒</span> Open Campus Tasks
              </h2>
              <p className="text-xs text-muted-foreground">
                Review requests from classmates and submit your proposals.
              </p>
            </div>

            <Link
              href="/tasks"
              className={buttonVariants({ variant: "outline", size: "sm", className: "rounded-xl font-semibold" })}
            >
              View All Tasks →
            </Link>
          </div>

          {openTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center text-xs text-muted-foreground">
              No open tasks currently available for bidding. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {openTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Completed Tasks */}
        {completedTasks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <span>✅</span> Completed Deliveries
            </h2>
            <div className="grid grid-cols-1 gap-3.5">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
