"use server";

import { redirect } from "next/navigation";
import { emailSchema, otpSchema } from "@/features/auth/schemas";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error?: string };

/**
 * Sends a one-time code to the email. A brand-new email is auto-signed-up by
 * Supabase, so this doubles as "sign up" and "log in". Role + college
 * assignment runs on the first verified sign-in (next sub-step).
 */
export async function requestOtp(input: { email: string }): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email: parsed.data.email });
  if (error) {
    return { error: error.message };
  }
  return {};
}

/** Verifies the 6-digit code and, on success, redirects. */
export async function verifyOtp(input: { email: string; code: string }): Promise<AuthResult> {
  const parsed = otpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter the 6-digit code." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });
  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
