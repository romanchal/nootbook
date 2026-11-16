import { describe, expect, it, vi } from "vitest";

const auditCreateMock = vi.fn();
const auditFindManyMock = vi.fn();

const reportFindUniqueMock = vi.fn();
const reportUpdateMock = vi.fn();
const reportFindManyMock = vi.fn();

const resourceUpdateMock = vi.fn();

const userFindUniqueMock = vi.fn();
const userUpdateMock = vi.fn();
const userFindManyMock = vi.fn();

const roleFindFirstMock = vi.fn();
const roleFindUniqueMock = vi.fn();
const roleCreateMock = vi.fn();
const roleDeleteMock = vi.fn();

const configFindFirstMock = vi.fn();
const configCreateMock = vi.fn();
const configUpdateMock = vi.fn();

const collegeFindUniqueMock = vi.fn();
const collegeCreateMock = vi.fn();
const collegeUpdateMock = vi.fn();
const collegeFindManyMock = vi.fn();

const departmentCreateManyMock = vi.fn();

vi.mock("@/lib/db", () => {
  interface MockDb {
    $transaction: (callback: (tx: MockDb) => Promise<unknown>) => Promise<unknown>;
    [key: string]: unknown;
  }
  const mockDb: MockDb = {
    $transaction: async (callback: (tx: MockDb) => Promise<unknown>) => callback(mockDb),
    auditLog: {
      create: (...args: unknown[]) => auditCreateMock(...args),
      findMany: (...args: unknown[]) => auditFindManyMock(...args),
    },
    report: {
      findUnique: (...args: unknown[]) => reportFindUniqueMock(...args),
      update: (...args: unknown[]) => reportUpdateMock(...args),
      findMany: (...args: unknown[]) => reportFindManyMock(...args),
    },
    resource: {
      update: (...args: unknown[]) => resourceUpdateMock(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => userFindUniqueMock(...args),
      update: (...args: unknown[]) => userUpdateMock(...args),
      findMany: (...args: unknown[]) => userFindManyMock(...args),
    },
    role: {
      findFirst: (...args: unknown[]) => roleFindFirstMock(...args),
      findUnique: (...args: unknown[]) => roleFindUniqueMock(...args),
      create: (...args: unknown[]) => roleCreateMock(...args),
      delete: (...args: unknown[]) => roleDeleteMock(...args),
    },
    commissionConfig: {
      findFirst: (...args: unknown[]) => configFindFirstMock(...args),
      create: (...args: unknown[]) => configCreateMock(...args),
      update: (...args: unknown[]) => configUpdateMock(...args),
    },
    college: {
      findUnique: (...args: unknown[]) => collegeFindUniqueMock(...args),
      create: (...args: unknown[]) => collegeCreateMock(...args),
      update: (...args: unknown[]) => collegeUpdateMock(...args),
      findMany: (...args: unknown[]) => collegeFindManyMock(...args),
    },
    department: {
      createMany: (...args: unknown[]) => departmentCreateManyMock(...args),
    },
  };
  return { db: mockDb };
});

import { createAuditLogEntry, getAuditLogs } from "./audit";
import { resolveReport } from "./reports";
import { assignUserRole, revokeUserRole, updateUserStatus } from "./users";
import { updateCommissionConfig } from "./config";
import { createCollegeTenant, toggleCollegeStatus } from "./colleges";

describe("Admin Console & Audit Logging (Step 6 Acceptance Criteria)", () => {
  describe("Audit Logging & Queries", () => {
    it("creates an immutable audit log entry", async () => {
      auditCreateMock.mockResolvedValueOnce({ id: "log-1" });

      await createAuditLogEntry({
        collegeId: "col-1",
        actorId: "admin-1",
        action: "TEST_ACTION",
        entity: "TestEntity",
        entityId: "ent-1",
        metadata: { info: "test" },
      });

      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            collegeId: "col-1",
            actorId: "admin-1",
            action: "TEST_ACTION",
            entity: "TestEntity",
            entityId: "ent-1",
          }),
        }),
      );
    });

    it("scopes getAuditLogs to collegeId for tenant admins", async () => {
      auditFindManyMock.mockResolvedValueOnce([]);

      await getAuditLogs({ collegeId: "college-nagpur-1" });

      expect(auditFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ collegeId: "college-nagpur-1" }),
        }),
      );
    });
  });

  describe("Report Management & Takedown", () => {
    it("resolves a report with content takedown and writes to AuditLog", async () => {
      reportFindUniqueMock.mockResolvedValueOnce({
        id: "rep-1",
        collegeId: "col-1",
        reason: "Copyright violation",
        resourceId: "res-1",
        resource: { id: "res-1", status: "APPROVED" },
      });
      resourceUpdateMock.mockResolvedValueOnce({ id: "res-1", status: "REJECTED" });
      reportUpdateMock.mockResolvedValueOnce({ id: "rep-1", status: "RESOLVED" });
      auditCreateMock.mockResolvedValue({ id: "audit-1" });

      await resolveReport({
        reportId: "rep-1",
        adminId: "admin-1",
        collegeId: "col-1",
        status: "RESOLVED",
        note: "Verified takedown notice",
        takedownResource: true,
      });

      // Assert resource status updated to REJECTED
      expect(resourceUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "res-1" },
          data: expect.objectContaining({ status: "REJECTED" }),
        }),
      );

      // Assert RESOURCE_TAKEDOWN audit log
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "RESOURCE_TAKEDOWN",
            entity: "Resource",
            entityId: "res-1",
          }),
        }),
      );

      // Assert REPORT_RESOLVE audit log
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "REPORT_RESOLVE",
            entity: "Report",
            entityId: "rep-1",
          }),
        }),
      );
    });

    it("rejects resolving a report belonging to another college", async () => {
      reportFindUniqueMock.mockResolvedValueOnce({
        id: "rep-2",
        collegeId: "col-other",
        reason: "Spam",
      });

      await expect(
        resolveReport({
          reportId: "rep-2",
          adminId: "admin-1",
          collegeId: "col-1",
          status: "DISMISSED",
        }),
      ).rejects.toThrow(/Report belongs to another college/);
    });
  });

  describe("User & Role Management", () => {
    it("assigns a role and logs ROLE_ASSIGN in AuditLog", async () => {
      userFindUniqueMock.mockResolvedValueOnce({
        id: "user-1",
        name: "Akash Sharma",
        collegeId: "col-1",
      });
      roleFindFirstMock.mockResolvedValueOnce(null);
      roleCreateMock.mockResolvedValueOnce({ id: "role-1", name: "CLASS_ADMIN" });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-role" });

      await assignUserRole({
        targetUserId: "user-1",
        roleName: "CLASS_ADMIN",
        collegeId: "col-1",
        adminId: "admin-1",
      });

      expect(roleCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            name: "CLASS_ADMIN",
            collegeId: "col-1",
          }),
        }),
      );

      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "ROLE_ASSIGN",
            entity: "Role",
            actorId: "admin-1",
          }),
        }),
      );
    });

    it("prevents assigning a role to a student from another college", async () => {
      userFindUniqueMock.mockResolvedValueOnce({
        id: "user-2",
        name: "Pooja Roy",
        collegeId: "col-other",
      });

      await expect(
        assignUserRole({
          targetUserId: "user-2",
          roleName: "CLASS_ADMIN",
          collegeId: "col-1",
          adminId: "admin-1",
        }),
      ).rejects.toThrow(/Cannot assign role to a student from another college/);
    });

    it("revokes a role and logs ROLE_REVOKE in AuditLog", async () => {
      roleFindUniqueMock.mockResolvedValueOnce({
        id: "role-1",
        name: "CLASS_ADMIN",
        userId: "user-1",
        collegeId: "col-1",
        user: { id: "user-1", name: "Akash" },
      });
      roleDeleteMock.mockResolvedValueOnce({ id: "role-1" });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-revoke" });

      await revokeUserRole({
        roleId: "role-1",
        adminId: "admin-1",
        collegeId: "col-1",
      });

      expect(roleDeleteMock).toHaveBeenCalledWith({ where: { id: "role-1" } });
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "ROLE_REVOKE",
            entity: "Role",
            entityId: "role-1",
          }),
        }),
      );
    });

    it("updates user status and logs USER_STATUS_CHANGE in AuditLog", async () => {
      userFindUniqueMock.mockResolvedValueOnce({
        id: "user-1",
        collegeId: "col-1",
        status: "ACTIVE",
      });
      userUpdateMock.mockResolvedValueOnce({ id: "user-1", status: "SUSPENDED" });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-status" });

      await updateUserStatus({
        targetUserId: "user-1",
        status: "SUSPENDED",
        reason: "Terms of service violation",
        adminId: "admin-1",
        collegeId: "col-1",
      });

      expect(userUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-1" },
          data: { status: "SUSPENDED" },
        }),
      );
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "USER_STATUS_CHANGE",
            entity: "User",
            entityId: "user-1",
          }),
        }),
      );
    });
  });

  describe("Commission Configuration (Super Admin)", () => {
    it("updates commission settings and logs COMMISSION_CONFIG_UPDATE in AuditLog", async () => {
      configFindFirstMock.mockResolvedValueOnce({ id: "cfg-1" });
      configUpdateMock.mockResolvedValueOnce({
        id: "cfg-1",
        commissionBps: 1200,
        fixedFeePaise: 2500,
      });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-cfg" });

      await updateCommissionConfig({
        adminId: "super-1",
        commissionBps: 1200,
        fixedFeePaise: 2500,
      });

      expect(configUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "cfg-1" },
          data: expect.objectContaining({
            commissionBps: 1200,
            fixedFeePaise: 2500,
            updatedById: "super-1",
          }),
        }),
      );

      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "COMMISSION_CONFIG_UPDATE",
            entity: "CommissionConfig",
          }),
        }),
      );
    });
  });

  describe("College Tenant Management", () => {
    it("creates a new college tenant, seeds standard engineering departments, and logs COLLEGE_CREATE", async () => {
      collegeFindUniqueMock.mockResolvedValue(null);
      collegeCreateMock.mockResolvedValueOnce({
        id: "col-new",
        name: "Ramdeobaba University",
        slug: "rbu-nagpur",
        emailDomain: "rbu.edu.in",
        city: "Nagpur",
      });
      departmentCreateManyMock.mockResolvedValueOnce({ count: 6 });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-col" });

      const college = await createCollegeTenant({
        name: "Ramdeobaba University",
        slug: "rbu-nagpur",
        emailDomain: "rbu.edu.in",
        city: "Nagpur",
        adminId: "super-1",
      });

      expect(college.id).toBe("col-new");
      expect(departmentCreateManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ code: "COMP" }),
            expect.objectContaining({ code: "IT" }),
          ]),
        }),
      );
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "COLLEGE_CREATE",
            entity: "College",
            entityId: "col-new",
          }),
        }),
      );
    });

    it("toggles college status and logs COLLEGE_STATUS_UPDATE", async () => {
      collegeUpdateMock.mockResolvedValueOnce({
        id: "col-1",
        name: "Pilot College",
        active: false,
      });
      auditCreateMock.mockResolvedValueOnce({ id: "audit-toggle" });

      await toggleCollegeStatus({
        collegeId: "col-1",
        active: false,
        adminId: "super-1",
      });

      expect(collegeUpdateMock).toHaveBeenCalledWith({
        where: { id: "col-1" },
        data: { active: false },
      });
      expect(auditCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "COLLEGE_STATUS_UPDATE",
            entity: "College",
            entityId: "col-1",
          }),
        }),
      );
    });
  });
});
