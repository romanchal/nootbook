import { db } from "@/lib/db";
import { studentRole } from "@/features/auth/roles";
import { getAuthUser } from "@/features/auth/current-user";

export interface EnsureUserInput {
  /** The Supabase Auth user id (auth.uid()). */
  authUserId: string;
  email: string;
  name?: string | null;
  /** The college the user is joining. */
  collegeId: string;
}

/**
 * Creates (or refreshes) the application record for a freshly-authenticated
 * user, assigns the default STUDENT role scoped to their college, and makes
 * sure they have a wallet. Idempotent — safe to call on every sign-in.
 *
 * Real money stays with the payment partner; the wallet is only a ledger view.
 */
export async function ensureUserRecord(input: EnsureUserInput) {
  const { authUserId, email, name, collegeId } = input;
  const role = studentRole(collegeId);

  return db.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { id: authUserId },
      create: {
        id: authUserId,
        email,
        name: name ?? email,
        collegeId,
        status: "ACTIVE",
      },
      // On later sign-ins, refresh contact details but never move the user
      // to a different college.
      update: {
        email,
        ...(name ? { name } : {}),
      },
    });

    const existingRole = await tx.role.findFirst({
      where: { userId: authUserId, name: role.name, collegeId: role.collegeId },
    });
    if (!existingRole) {
      await tx.role.create({
        data: {
          userId: authUserId,
          name: role.name,
          collegeId: role.collegeId,
          departmentId: role.departmentId,
          classId: role.classId,
        },
      });
    }

    await tx.wallet.upsert({
      where: { userId: authUserId },
      create: { userId: authUserId, collegeId },
      update: {},
    });

    return user;
  });
}

/**
 * Called right after a successful sign-in. If the user has no application
 * record yet, create one with the default STUDENT role + wallet, scoped to the
 * first active college (the seeded pilot college). Safe to call every sign-in.
 */
export async function provisionOnFirstSignIn() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const existing = await db.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;

  const college = await db.college.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!college) return null;

  const metadata = authUser.user_metadata as { name?: string } | undefined;

  return ensureUserRecord({
    authUserId: authUser.id,
    email: authUser.email ?? "",
    name: metadata?.name ?? null,
    collegeId: college.id,
  });
}
