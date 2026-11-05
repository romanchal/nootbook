import type { RoleName } from "@/generated/prisma/client";

/**
 * Pure helpers for building role assignments. Kept free of the database so the
 * "which roles does a signup get" rules are unit-testable.
 */
export interface RoleDraft {
  name: RoleName;
  collegeId: string | null;
  departmentId: string | null;
  classId: string | null;
}

export function studentRole(collegeId: string): RoleDraft {
  return { name: "STUDENT", collegeId, departmentId: null, classId: null };
}

export function classAdminRole(
  collegeId: string,
  departmentId: string,
  classId: string,
): RoleDraft {
  return { name: "CLASS_ADMIN", collegeId, departmentId, classId };
}

export function superAdminRole(): RoleDraft {
  return { name: "SUPER_ADMIN", collegeId: null, departmentId: null, classId: null };
}
