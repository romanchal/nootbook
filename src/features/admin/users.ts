import { db } from "@/lib/db";
import type { Prisma, RoleName, UserStatus } from "@/generated/prisma/client";

export interface AssignRoleInput {
  targetUserId: string;
  roleName: RoleName;
  collegeId?: string | null;
  adminId: string;
  departmentId?: string | null;
  classId?: string | null;
}

export interface RevokeRoleInput {
  roleId: string;
  adminId: string;
  collegeId?: string | null;
}

export interface UpdateUserStatusInput {
  targetUserId: string;
  status: UserStatus;
  reason: string;
  adminId: string;
  collegeId?: string | null;
}

/**
 * Returns users with their assigned roles and college affiliation.
 * Scoped by collegeId for College Admins; platform-wide for Super Admins.
 */
export async function getUsersWithRoles(
  collegeId?: string | null,
  search?: string,
) {
  const where: Prisma.UserWhereInput = {};
  if (collegeId) {
    where.collegeId = collegeId;
  }
  if (search && search.trim().length > 0) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  return db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      college: { select: { id: true, name: true, slug: true } },
      department: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, semester: true } },
      roles: {
        include: {
          department: { select: { name: true, code: true } },
          class: { select: { semester: true } },
        },
      },
      _count: {
        select: {
          uploadedResources: true,
          bookmarks: true,
        },
      },
    },
  });
}

/**
 * Assigns an administrative or specialized role (e.g., CLASS_ADMIN, EARNER, COLLEGE_ADMIN).
 * Writes an immutable record to AuditLog.
 */
export async function assignUserRole(input: AssignRoleInput) {
  const { targetUserId, roleName, collegeId, adminId, departmentId, classId } = input;

  return db.$transaction(async (tx) => {
    // 1. Check target user exists
    const user = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, collegeId: true },
    });

    if (!user) {
      throw new Error("Target user not found.");
    }

    if (collegeId && user.collegeId && user.collegeId !== collegeId) {
      throw new Error("Cannot assign role to a student from another college.");
    }

    const effectiveCollegeId = collegeId || user.collegeId || null;

    // 2. Prevent duplicate identical role assignment
    const existing = await tx.role.findFirst({
      where: {
        userId: targetUserId,
        name: roleName,
        collegeId: effectiveCollegeId,
        departmentId: departmentId || null,
        classId: classId || null,
      },
    });

    if (existing) {
      throw new Error(`User already holds role ${roleName} for this scope.`);
    }

    // 3. Create role
    const newRole = await tx.role.create({
      data: {
        userId: targetUserId,
        name: roleName,
        collegeId: effectiveCollegeId,
        departmentId: departmentId || null,
        classId: classId || null,
      },
    });

    // 4. Log role assignment in AuditLog
    await tx.auditLog.create({
      data: {
        collegeId: effectiveCollegeId,
        actorId: adminId,
        action: "ROLE_ASSIGN",
        entity: "Role",
        entityId: newRole.id,
        metadata: {
          targetUserId,
          targetUserName: user.name,
          roleName,
          departmentId: departmentId || null,
          classId: classId || null,
        },
      },
    });

    return newRole;
  });
}

/**
 * Revokes a user's role and logs the action in AuditLog.
 */
export async function revokeUserRole(input: RevokeRoleInput) {
  const { roleId, adminId, collegeId } = input;

  return db.$transaction(async (tx) => {
    const role = await tx.role.findUnique({
      where: { id: roleId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!role) {
      throw new Error("Role record not found.");
    }

    if (collegeId && role.collegeId && role.collegeId !== collegeId) {
      throw new Error("Access denied: Role belongs to another college.");
    }

    await tx.role.delete({
      where: { id: roleId },
    });

    await tx.auditLog.create({
      data: {
        collegeId: role.collegeId,
        actorId: adminId,
        action: "ROLE_REVOKE",
        entity: "Role",
        entityId: role.id,
        metadata: {
          targetUserId: role.userId,
          targetUserName: role.user.name,
          roleName: role.name,
        },
      },
    });

    return { success: true };
  });
}

/**
 * Updates a user's account status (e.g. SUSPENDED or ACTIVE) and logs the action in AuditLog.
 */
export async function updateUserStatus(input: UpdateUserStatusInput) {
  const { targetUserId, status, reason, adminId, collegeId } = input;

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, collegeId: true, status: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (collegeId && user.collegeId && user.collegeId !== collegeId) {
      throw new Error("Cannot alter status of a user from another college.");
    }

    const previousStatus = user.status;

    const updated = await tx.user.update({
      where: { id: targetUserId },
      data: { status },
    });

    await tx.auditLog.create({
      data: {
        collegeId: user.collegeId,
        actorId: adminId,
        action: "USER_STATUS_CHANGE",
        entity: "User",
        entityId: user.id,
        metadata: {
          previousStatus,
          newStatus: status,
          reason,
        },
      },
    });

    return updated;
  });
}
