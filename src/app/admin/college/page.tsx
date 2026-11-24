import { notFound } from "next/navigation";
import { requireCollegeAdminGuard } from "@/features/auth/guards";
import { getAuditLogs } from "@/features/admin/audit";
import { getAdminReports } from "@/features/admin/reports";
import { getUsersWithRoles } from "@/features/admin/users";
import { getCollegeDepartments } from "@/features/library/queries";
import { getCollegeDisputes } from "@/features/disputes/service";
import { CollegeAdminTabs } from "@/features/admin/college-admin-tabs";

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
    <CollegeAdminTabs
      user={{
        id: user.id,
        name: user.name || "College Admin",
        email: user.email,
        collegeName: user.college?.name,
        collegeCity: user.college?.city,
        roles: user.roles,
      }}
      logs={logs}
      reports={reports}
      users={users}
      departments={departments}
      disputes={disputes}
    />
  );
}
