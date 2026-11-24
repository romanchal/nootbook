import { requireSuperAdminGuard } from "@/features/auth/guards";
import { getAuditLogs } from "@/features/admin/audit";
import { getAdminReports } from "@/features/admin/reports";
import { getUsersWithRoles } from "@/features/admin/users";
import { getCollegesList } from "@/features/admin/colleges";
import { getCommissionConfig } from "@/features/admin/config";
import { getCollegeDisputes } from "@/features/disputes/service";
import { SuperAdminTabs } from "@/features/admin/super-admin-tabs";

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
    <SuperAdminTabs
      user={{
        id: user.id,
        name: user.name || "Super Admin",
        email: user.email,
        collegeName: user.college?.name || "Platform Super Admin",
        collegeCity: user.college?.city || "Nagpur",
        roles: user.roles,
      }}
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
  );
}
