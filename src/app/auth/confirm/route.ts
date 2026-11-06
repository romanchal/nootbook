import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { provisionOnFirstSignIn } from "@/features/auth/ensure-user";

/**
 * Handles the Supabase email magic-link / OTP redirect.
 * Supabase appends ?token_hash=...&type=... to this URL; we verify and send the
 * user to the dashboard (or back to login on failure).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      await provisionOnFirstSignIn();
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=invalid-link", request.url));
}
