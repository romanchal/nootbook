import type { RoleName } from "@/generated/prisma/client";

/**
 * Authorization helpers for role + college checks.
 *
 * These are pure functions over a user's roles so they can be unit-tested
 * without a database. Every server-side data access must call these (or the
 * `require*` variants) before touching college-scoped data.
 *
 * A `ScopedRole` mirrors one row of the `Role` table: a role name plus the
 * college (and optionally department/class) it applies to. SUPER_ADMIN rows
 * have a null collegeId (platform-wide).
 */
export interface ScopedRole {
  name: RoleName;
  collegeId: string | null;
  departmentId: string | null;
  classId: string | null;
}

export class AuthorizationError extends Error {
  constructor(message = "You are not allowed to do that.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

// Admin tier for "requires at least this role" checks. STUDENT < EARNER <
// CLASS_ADMIN < DEPARTMENT_ADMIN < COLLEGE_ADMIN < SUPER_ADMIN. This is a
// working simplification; specific screens may need finer checks.
const ADMIN_TIER: Record<RoleName, number> = {
  STUDENT: 0,
  EARNER: 1,
  CLASS_ADMIN: 2,
  DEPARTMENT_ADMIN: 3,
  COLLEGE_ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function isSuperAdmin(roles: ScopedRole[]): boolean {
  return roles.some((r) => r.name === "SUPER_ADMIN");
}

export function hasRole(roles: ScopedRole[], name: RoleName): boolean {
  return roles.some((r) => r.name === name);
}

/** True when the user holds `name` scoped to a specific college. */
export function hasRoleInCollege(
  roles: ScopedRole[],
  name: RoleName,
  collegeId: string,
): boolean {
  return roles.some((r) => r.name === name && r.collegeId === collegeId);
}

/** True when the user may see or touch data belonging to `collegeId`. */
export function canAccessCollege(roles: ScopedRole[], collegeId: string): boolean {
  if (isSuperAdmin(roles)) return true;
  return roles.some((r) => r.collegeId === collegeId);
}

export function requireCollegeAccess(roles: ScopedRole[], collegeId: string): void {
  if (!canAccessCollege(roles, collegeId)) {
    throw new AuthorizationError("You do not have access to this college.");
  }
}

export function requireRole(roles: ScopedRole[], name: RoleName): void {
  if (!hasRole(roles, name)) {
    throw new AuthorizationError(`This action requires the ${name} role.`);
  }
}

/** True when the user holds a role at or above the given admin tier. */
export function hasRoleAtLeast(roles: ScopedRole[], name: RoleName): boolean {
  const required = ADMIN_TIER[name];
  return roles.some((r) => ADMIN_TIER[r.name] >= required);
}
