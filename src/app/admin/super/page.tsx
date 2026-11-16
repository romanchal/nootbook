import Link from "next/link";
import { requireSuperAdminGuard } from "@/features/auth/guards";
import { getAuditLogs } from "@/features/admin/audit";
import { getAdminReports } from "@/features/admin/reports";
import { getUsersWithRoles } from "@/features/admin/users";
import { getCollegesList } from "@/features/admin/colleges";
import { getCommissionConfig } from "@/features/admin/config";
import { getCollegeDisputes } from "@/features/disputes/service";
import { SuperAdminTabs } from "@/features/admin/super-admin-tabs";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const user = await requireSuperAdminGuard();

  const [logs, reports, users, colleges, commissionConfig, disputes] = await Promise.all([
    getAuditLogs({ limit: 100 }),
    getAdminReports(),
    getUsersWithRoles(),
    getCollegesList(),
    getCommissionConfig(),
    getCollegeDisputes("", { isSuperAdmin: true }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
      <AppNavbar
        user={{
          id: user.id,
          name: user.name || "Super Admin",
          email: user.email,
          collegeName: user.college?.name || "Platform Super Admin",
          collegeCity: user.college?.city || "Nagpur",
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
            <span className="text-foreground font-semibold">Platform Super Admin</span>
          </div>

          <Link
            href="/admin/college"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/60 px-3 py-1 font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <span>🏛️</span>
            <span>Open PBCOE College Admin →</span>
          </Link>
        </nav>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-500/5 p-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20">
                Super Admin
              </span>
              <span className="text-xs text-muted-foreground">Platform Governance Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Nootbook Super Console
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Cross-college multi-tenancy: manage college campuses, global marketplace commission rates, dispute escalations, platform users, and immutable audit logs.
            </p>
          </div>
        </div>

        {/* Main Console Interface */}
        <SuperAdminTabs
          logs={logs}
          reports={reports}
          users={users}
          colleges={colleges}
          disputes={disputes}
          commissionConfig={{
            commissionBps: commissionConfig.commissionBps,
            fixedFeePaise: commissionConfig.fixedFeePaise,
          }}
        />
      </main>
    </div>
  );
}
