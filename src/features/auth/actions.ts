"use server";

import { redirect } from "next/navigation";
import {
  emailSchema,
  otpSchema,
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/features/auth/schemas";
import { provisionOnFirstSignIn } from "@/features/auth/ensure-user";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error?: string; message?: string };

/**
 * Sign in using email (ID) and password.
 */
export async function signInWithPassword(input: SignInInput): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login credentials." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { error: error.message };
    }

    await provisionOnFirstSignIn();
    redirect("/dashboard");
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("tenant/user")) {
      return {
        error:
          "Supabase project appears to be PAUSED. Please open https://supabase.com/dashboard and click 'Restore project' to reactivate it.",
      };
    }
    return { error: msg };
  }
}

/**
 * Sign up a new user using email, password, and name.
 */
export async function signUpWithPassword(input: SignUpInput): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid registration details." };
  }

  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { name: parsed.data.name },
        emailRedirectTo: `${origin}/auth/confirm`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // If Supabase has email confirmation disabled, session is returned immediately
    if (data.session) {
      await provisionOnFirstSignIn();
      redirect("/dashboard");
    }

    return {
      message: "Registration successful! If required, please check your email to confirm your account.",
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ENOTFOUND") || msg.includes("fetch failed") || msg.includes("tenant/user")) {
      return {
        error:
          "Supabase project appears to be PAUSED. Please open https://supabase.com/dashboard and click 'Restore project' to reactivate it.",
      };
    }
    return { error: msg };
  }
}

/**
 * Server action to generate Google OAuth URL.
 */
export async function getGoogleOAuthUrl(): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

/**
 * Legacy OTP support (kept for backward compatibility).
 */
export async function requestOtp(input: { email: string }): Promise<AuthResult> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
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

  await provisionOnFirstSignIn();
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
