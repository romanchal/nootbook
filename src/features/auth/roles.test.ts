import { describe, expect, it } from "vitest";
import { classAdminRole, studentRole, superAdminRole } from "./roles";

describe("role drafts", () => {
  it("builds a student role scoped to a college", () => {
    expect(studentRole("c1")).toEqual({
      name: "STUDENT",
      collegeId: "c1",
      departmentId: null,
      classId: null,
    });
  });

  it("builds a class admin role scoped to a class", () => {
    expect(classAdminRole("c1", "d1", "k1")).toEqual({
      name: "CLASS_ADMIN",
      collegeId: "c1",
      departmentId: "d1",
      classId: "k1",
    });
  });

  it("builds a platform-wide super admin role", () => {
    expect(superAdminRole()).toEqual({
      name: "SUPER_ADMIN",
      collegeId: null,
      departmentId: null,
      classId: null,
    });
  });
});
