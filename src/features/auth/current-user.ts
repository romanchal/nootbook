import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side auth helpers that bridge Supabase Auth and the application
 * `users`/`roles` tables.
 */

/** The signed-in Supabase Auth user, or null. No database lookup. */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Requires a signed-in user; redirects to /login otherwise. */
export async function requireUser() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * The application user (with their roles), or null. Requires both a Supabase
 * session AND a provisioned `users` row. Role/college checks should read from
 * this; the auth-only gate should use `requireUser`.
 */
export async function getCurrentUser() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }
  return db.user.findUnique({
    where: { id: authUser.id },
    include: { roles: true },
  });
}
