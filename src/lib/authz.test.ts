import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  canAccessCollege,
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
});
