import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCollegeAdminGuard } from "@/features/auth/guards";
import { isSuperAdmin } from "@/lib/authz";
import { getAuditLogs } from "@/features/admin/audit";
import { getAdminReports } from "@/features/admin/reports";
import { getUsersWithRoles } from "@/features/admin/users";
import { getCollegeDepartments } from "@/features/library/queries";
import { getCollegeDisputes } from "@/features/disputes/service";
import { CollegeAdminTabs } from "@/features/admin/college-admin-tabs";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

export default async function CollegeAdminPage() {
  const user = await requireCollegeAdminGuard();

  if (!user.collegeId) {
    notFound();
  }

  const userIsSuper = isSuperAdmin(user.roles);

  const [logs, reports, users, departments, disputes] = await Promise.all([
    getAuditLogs({ collegeId: user.collegeId, limit: 50 }),
    getAdminReports(user.collegeId),
    getUsersWithRoles(user.collegeId),
    getCollegeDepartments(user.collegeId, { includeAll: true }),
    getCollegeDisputes(user.collegeId),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
      <AppNavbar
        user={{
          id: user.id,
          name: user.name || "College Admin",
          email: user.email,
          collegeName: user.college?.name,
          collegeCity: user.college?.city,
          roles: user.roles,
        }}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-blue-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">College Admin Console</span>
          </div>

          {userIsSuper && (
            <Link
              href="/admin/super"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/60 px-3 py-1 font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors shadow-2xs"
            >
              <span>👑</span>
              <span>Open Global Super Admin →</span>
            </Link>
          )}
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-700 text-white px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                🏛️ PBCOE College Administration
              </span>
              <span className="text-xs text-muted-foreground">{user.college?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              College Administration Console
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Campus governance: Manage 8 engineering branches (AI active), assign Class Admins, moderate student uploaded exam papers, resolve task dispute escrows, and inspect audit trails.
            </p>
          </div>
        </div>

        <CollegeAdminTabs
          logs={logs}
          reports={reports}
          users={users}
          disputes={disputes}
          deptCount={departments.length}
        />
      </main>
    </div>
  );
}
