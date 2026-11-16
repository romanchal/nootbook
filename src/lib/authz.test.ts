import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  canAccessCollege,
  hasClassAdminAccess,
  hasCollegeAdminAccess,
  hasEarnerAccess,
  hasRole,
  hasRoleAtLeast,
  hasRoleInCollege,
  isSuperAdmin,
  requireCollegeAccess,
  type ScopedRole,
} from "./authz";

const student: ScopedRole = { name: "STUDENT", collegeId: "c1", departmentId: null, classId: null };
const earner: ScopedRole = { name: "EARNER", collegeId: "c1", departmentId: null, classId: null };
const classAdmin: ScopedRole = {
  name: "CLASS_ADMIN",
  collegeId: "c1",
  departmentId: "d1",
  classId: "k1",
};
const superAdmin: ScopedRole = {
  name: "SUPER_ADMIN",
  collegeId: null,
  departmentId: null,
  classId: null,
};

describe("authorization helpers", () => {
  it("detects roles and super admin", () => {
    expect(hasRole([student, earner], "EARNER")).toBe(true);
    expect(hasRole([student], "EARNER")).toBe(false);
    expect(isSuperAdmin([superAdmin])).toBe(true);
    expect(isSuperAdmin([student])).toBe(false);
  });

  it("scopes college access", () => {
    expect(canAccessCollege([student], "c1")).toBe(true);
    expect(canAccessCollege([student], "c2")).toBe(false);
    // Super admin crosses colleges.
    expect(canAccessCollege([superAdmin], "c2")).toBe(true);
  });

  it("checks a role within a specific college", () => {
    expect(hasRoleInCollege([classAdmin], "CLASS_ADMIN", "c1")).toBe(true);
    expect(hasRoleInCollege([classAdmin], "CLASS_ADMIN", "c2")).toBe(false);
  });

  it("enforces college access with a clear error", () => {
    expect(() => requireCollegeAccess([student], "c2")).toThrow(AuthorizationError);
    expect(() => requireCollegeAccess([student], "c1")).not.toThrow();
  });

  it("ranks admin tiers", () => {
    expect(hasRoleAtLeast([student], "STUDENT")).toBe(true);
    expect(hasRoleAtLeast([student], "CLASS_ADMIN")).toBe(false);
    expect(hasRoleAtLeast([classAdmin], "CLASS_ADMIN")).toBe(true);
    expect(hasRoleAtLeast([superAdmin], "COLLEGE_ADMIN")).toBe(true);
  });

  it("checks role access for earner, class admin, and college admin", () => {
    expect(hasEarnerAccess([earner], "c1")).toBe(true);
    expect(hasEarnerAccess([student], "c1")).toBe(false);
    expect(hasEarnerAccess([superAdmin], "c1")).toBe(true);

    expect(hasClassAdminAccess([classAdmin], "c1", "k1")).toBe(true);
    expect(hasClassAdminAccess([classAdmin], "c1", "other-class")).toBe(false);
    expect(hasClassAdminAccess([classAdmin], "c2", "k1")).toBe(false);
    expect(hasClassAdminAccess([student], "c1", "k1")).toBe(false);
    expect(hasClassAdminAccess([superAdmin], "c1", "k1")).toBe(true);

    const collegeAdmin: ScopedRole = {
      name: "COLLEGE_ADMIN",
      collegeId: "c1",
      departmentId: null,
      classId: null,
    };
    expect(hasCollegeAdminAccess([collegeAdmin], "c1")).toBe(true);
    expect(hasCollegeAdminAccess([collegeAdmin], "c2")).toBe(false);
    expect(hasCollegeAdminAccess([superAdmin], "c2")).toBe(true);
  });
});
