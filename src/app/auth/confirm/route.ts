import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { provisionOnFirstSignIn } from "@/features/auth/ensure-user";

/**
 * Handles the Supabase email magic-link / OTP redirect.
 *
 * Two flows arrive here:
 * - PKCE (default): the link carries `?code=...` to exchange for a session.
 * - Implicit: the link carries `?token_hash=...&type=...` to verify directly.
 *
 * On success we provision the app record and send the user to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await provisionOnFirstSignIn();
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      await provisionOnFirstSignIn();
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=invalid-link", request.url));
}
