import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCollegeAdminGuard } from "@/features/auth/guards";
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
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">College Admin Console</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-card via-card to-indigo-500/5 p-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                College Coordinator
              </span>
              <span className="text-xs text-muted-foreground">{user.college?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              College Administration Console
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Campus governance: assign Class Admins, manage 3-strike user safety policies, mediate task disputes with balanced ledger settlement, and inspect audit logs.
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
