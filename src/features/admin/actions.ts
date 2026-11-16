"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireAppUser,
  requireSuperAdminGuard,
} from "@/features/auth/guards";
import { resolveReport } from "./reports";
import { assignUserRole, revokeUserRole, updateUserStatus } from "./users";
import { updateCommissionConfig } from "./config";
import { createCollegeTenant, toggleCollegeStatus } from "./colleges";
import type { RoleName, UserStatus } from "@/generated/prisma/client";

const resolveReportSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["RESOLVED", "DISMISSED"]),
  note: z.string().optional(),
  takedownResource: z.boolean().optional(),
});

const assignRoleSchema = z.object({
  targetUserId: z.string().min(1),
  roleName: z.enum([
    "STUDENT",
    "EARNER",
    "CLASS_ADMIN",
    "DEPARTMENT_ADMIN",
    "COLLEGE_ADMIN",
    "SUPER_ADMIN",
  ]),
  departmentId: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
});

const revokeRoleSchema = z.object({
  roleId: z.string().min(1),
});

const updateUserStatusSchema = z.object({
  targetUserId: z.string().min(1),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "BANNED"]),
  reason: z.string().min(3, "Please provide a reason of at least 3 characters."),
});

const commissionConfigSchema = z.object({
  commissionBps: z.coerce.number().min(0).max(5000),
  fixedFeePaise: z.coerce.number().min(0).max(50000),
  collegeId: z.string().optional().nullable(),
});

const createCollegeSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(2),
  emailDomain: z.string().optional().nullable(),
  city: z.string().min(2),
});

/**
 * Server action: Resolve or dismiss an academic report.
 * Accessible to Class Admins (within their college), College Admins, and Super Admins.
 */
export async function resolveReportAction(input: {
  reportId: string;
  status: "RESOLVED" | "DISMISSED";
  note?: string;
  takedownResource?: boolean;
}) {
  const user = await requireAppUser();
  const parsed = resolveReportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid report resolution input." };
  }

  // Super Admins bypass college scoping; College/Class Admins are restricted to their college
  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeOrClassAdmin = user.roles.some(
    (r) => r.name === "COLLEGE_ADMIN" || r.name === "CLASS_ADMIN",
  );

  if (!isSuperAdmin && !isCollegeOrClassAdmin) {
    return { error: "Unauthorized: Admin privileges required." };
  }

  try {
    await resolveReport({
      reportId: parsed.data.reportId,
      adminId: user.id,
      collegeId: isSuperAdmin ? null : user.collegeId,
      status: parsed.data.status,
      note: parsed.data.note,
      takedownResource: parsed.data.takedownResource,
    });

    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    revalidatePath("/admin/class");
    revalidatePath("/library");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to resolve report." };
  }
}

/**
 * Server action: Assign a role to a user.
 * College Admins can assign roles within their college; Super Admins can assign globally.
 */
export async function assignRoleAction(formData: FormData) {
  const user = await requireAppUser();
  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles.some((r) => r.name === "COLLEGE_ADMIN");

  if (!isSuperAdmin && !isCollegeAdmin) {
    return { error: "Unauthorized: College or Super Admin role required." };
  }

  const parsed = assignRoleSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    roleName: formData.get("roleName"),
    departmentId: formData.get("departmentId") || null,
    classId: formData.get("classId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid role assignment input." };
  }

  // Tenant security: College Admin cannot assign SUPER_ADMIN or COLLEGE_ADMIN
  if (!isSuperAdmin && (parsed.data.roleName === "SUPER_ADMIN" || parsed.data.roleName === "COLLEGE_ADMIN")) {
    return { error: "College Admins can only assign Student, Earner, or Class Admin roles." };
  }

  try {
    await assignUserRole({
      targetUserId: parsed.data.targetUserId,
      roleName: parsed.data.roleName as RoleName,
      collegeId: isSuperAdmin ? (formData.get("collegeId") as string) || null : user.collegeId,
      adminId: user.id,
      departmentId: parsed.data.departmentId,
      classId: parsed.data.classId,
    });

    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to assign role." };
  }
}

/**
 * Server action: Revoke a role.
 */
export async function revokeRoleAction(formData: FormData) {
  const user = await requireAppUser();
  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles.some((r) => r.name === "COLLEGE_ADMIN");

  if (!isSuperAdmin && !isCollegeAdmin) {
    return { error: "Unauthorized: Admin privileges required." };
  }

  const parsed = revokeRoleSchema.safeParse({
    roleId: formData.get("roleId"),
  });

  if (!parsed.success) {
    return { error: "Invalid role revocation request." };
  }

  try {
    await revokeUserRole({
      roleId: parsed.data.roleId,
      adminId: user.id,
      collegeId: isSuperAdmin ? null : user.collegeId,
    });

    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to revoke role." };
  }
}

/**
 * Server action: Change user status (SUSPENDED / ACTIVE).
 */
export async function updateUserStatusAction(formData: FormData) {
  const user = await requireAppUser();
  const isSuperAdmin = user.roles.some((r) => r.name === "SUPER_ADMIN");
  const isCollegeAdmin = user.roles.some((r) => r.name === "COLLEGE_ADMIN");

  if (!isSuperAdmin && !isCollegeAdmin) {
    return { error: "Unauthorized: Admin privileges required." };
  }

  const parsed = updateUserStatusSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    status: formData.get("status"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid user status update." };
  }

  try {
    await updateUserStatus({
      targetUserId: parsed.data.targetUserId,
      status: parsed.data.status as UserStatus,
      reason: parsed.data.reason,
      adminId: user.id,
      collegeId: isSuperAdmin ? null : user.collegeId,
    });

    revalidatePath("/admin/super");
    revalidatePath("/admin/college");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update user status." };
  }
}

/**
 * Server action: Update Commission & Fixed Fee configuration (Super Admin only).
 */
export async function updateCommissionConfigAction(formData: FormData) {
  const user = await requireSuperAdminGuard();

  const parsed = commissionConfigSchema.safeParse({
    commissionBps: formData.get("commissionBps"),
    fixedFeePaise: formData.get("fixedFeePaise"),
    collegeId: formData.get("collegeId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid commission configuration." };
  }

  try {
    await updateCommissionConfig({
      adminId: user.id,
      collegeId: parsed.data.collegeId,
      commissionBps: parsed.data.commissionBps,
      fixedFeePaise: parsed.data.fixedFeePaise,
    });

    revalidatePath("/admin/super");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update configuration." };
  }
}

/**
 * Server action: Create a new college tenant (Super Admin only).
 */
export async function createCollegeAction(formData: FormData) {
  const user = await requireSuperAdminGuard();

  const parsed = createCollegeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    domain: formData.get("domain"),
    city: formData.get("city"),
    state: formData.get("state"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid college details." };
  }

  try {
    await createCollegeTenant({
      name: parsed.data.name,
      slug: parsed.data.slug,
      emailDomain: parsed.data.emailDomain || undefined,
      city: parsed.data.city,
      adminId: user.id,
    });

    revalidatePath("/admin/super");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create college." };
  }
}

/**
 * Server action: Toggle college active status (Super Admin only).
 */
export async function toggleCollegeStatusAction(collegeId: string, active: boolean) {
  const user = await requireSuperAdminGuard();

  try {
    await toggleCollegeStatus({
      collegeId,
      active,
      adminId: user.id,
    });

    revalidatePath("/admin/super");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update college status." };
  }
}
