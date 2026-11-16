import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthUser } from "@/features/auth/current-user";
import { provisionOnFirstSignIn } from "@/features/auth/ensure-user";
import {
  hasClassAdminAccess,
  hasCollegeAdminAccess,
  hasEarnerAccess,
  isSuperAdmin,
} from "@/lib/authz";
import type { Prisma } from "@/generated/prisma/client";

export type AppUserWithDetails = Prisma.UserGetPayload<{
  include: {
    roles: true;
    college: true;
    department: true;
    class: true;
  };
}>;

/**
 * Returns the authenticated application user with their roles and college.
 * If not authenticated, redirects to /login.
 * If the user record has not been provisioned yet, provisions it before continuing.
 */
export async function requireAppUser(): Promise<AppUserWithDetails> {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login");
  }

  let user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      roles: true,
      college: true,
      department: true,
      class: true,
    },
  });

  if (!user) {
    await provisionOnFirstSignIn();
    user = await db.user.findUnique({
      where: { id: authUser.id },
      include: {
        roles: true,
        college: true,
        department: true,
        class: true,
      },
    });
  }

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Requires the user to have EARNER (or SUPER_ADMIN) privileges.
 */
export async function requireEarnerGuard(collegeId?: string): Promise<AppUserWithDetails> {
  const user = await requireAppUser();
  const targetCollegeId = collegeId ?? user.collegeId ?? undefined;
  const allowed = hasEarnerAccess(user.roles, targetCollegeId);
  if (!allowed) {
    redirect("/unauthorized?required=EARNER");
  }
  return user;
}

/**
 * Requires the user to have CLASS_ADMIN (or SUPER_ADMIN) privileges.
 */
export async function requireClassAdminGuard(classId?: string): Promise<AppUserWithDetails> {
  const user = await requireAppUser();
  if (!user.collegeId) {
    redirect("/unauthorized?required=CLASS_ADMIN");
  }
  const allowed = hasClassAdminAccess(user.roles, user.collegeId, classId);
  if (!allowed) {
    redirect("/unauthorized?required=CLASS_ADMIN");
  }
  return user;
}

/**
 * Requires the user to have COLLEGE_ADMIN (or SUPER_ADMIN) privileges for the college.
 */
export async function requireCollegeAdminGuard(
  targetCollegeId?: string,
): Promise<AppUserWithDetails> {
  const user = await requireAppUser();
  const collegeId = targetCollegeId ?? user.collegeId;
  if (!collegeId) {
    redirect("/unauthorized?required=COLLEGE_ADMIN");
  }
  const allowed = hasCollegeAdminAccess(user.roles, collegeId);
  if (!allowed) {
    redirect("/unauthorized?required=COLLEGE_ADMIN");
  }
  return user;
}

/**
 * Requires the user to be a SUPER_ADMIN.
 */
export async function requireSuperAdminGuard(): Promise<AppUserWithDetails> {
  const user = await requireAppUser();
  if (!isSuperAdmin(user.roles)) {
    redirect("/unauthorized?required=SUPER_ADMIN");
  }
  return user;
}
