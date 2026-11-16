import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClassAdminGuard } from "@/features/auth/guards";
import {
  getClassModerationCounts,
  getPendingUploadsQueue,
} from "@/features/library/admin-queries";
import { getAdminReports } from "@/features/admin/reports";
import { getAuditLogs } from "@/features/admin/audit";
import { ClassAdminTabs } from "@/features/library/class-admin-tabs";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

export default async function ClassAdminPage() {
  const user = await requireClassAdminGuard();

  if (!user.collegeId) {
    notFound();
  }

  const [counts, queue, reports, logs] = await Promise.all([
    getClassModerationCounts(user.collegeId),
    getPendingUploadsQueue(user.collegeId),
    getAdminReports(user.collegeId),
    getAuditLogs({ collegeId: user.collegeId, actorId: user.id, limit: 30 }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
      <AppNavbar
        user={{
          id: user.id,
          name: user.name || "Class Admin",
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
          <span className="text-foreground font-semibold">Class Admin Console</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                Class Moderator
              </span>
              <span className="text-xs text-muted-foreground">{user.college?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Class Moderation & Verification
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Inspect student uploaded exam papers, approve verified notes, resolve student content flags, and review audit records.
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Pending Approvals
            </span>
            <p className="mt-1 text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {counts.pending}
            </p>
            <span className="text-xs text-muted-foreground">Awaiting your verification</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Approved Resources
            </span>
            <p className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {counts.approved}
            </p>
            <span className="text-xs text-muted-foreground">Live in college library</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Rejected Submissions
            </span>
            <p className="mt-1 text-3xl font-extrabold text-muted-foreground font-mono">
              {counts.rejected}
            </p>
            <span className="text-xs text-muted-foreground">Returned with feedback</span>
          </div>
        </div>

        {/* Tabs */}
        <ClassAdminTabs queue={queue} reports={reports} logs={logs} />
      </main>
    </div>
  );
}
