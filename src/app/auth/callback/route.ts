import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Handles the link Supabase emails for password recovery (and email
// confirmation). It establishes a session from the URL, then forwards the
// user on to `next` (the set-new-password page for recovery).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  // Behind Vercel's proxy the request origin is internal — prefer the
  // forwarded host so the redirect goes to the real site URL.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}${next}`);
  } else if (tokenHash && type) {
    // Fallback for the token_hash email-template style.
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${base}${next}`);
  }

  return NextResponse.redirect(`${base}/login?error=reset_link`);
}
