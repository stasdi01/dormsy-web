import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (token_hash && type) {
    // Token hash flow — works cross-browser (no code_verifier needed)
    const { data: { session }, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error || !session) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
    return handleSession(session, origin);
  }

  if (code) {
    // PKCE flow — same browser only
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !session) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
    return handleSession(session, origin);
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}

async function handleSession(session: { access_token: string }, origin: string) {

  // Call backend to create the users table profile row (idempotent)
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const response = await fetch(`${apiUrl}/auth/create-profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const user = data.user;

    // If username is not set → first login, go to profile setup
    if (!user?.username) {
      return NextResponse.redirect(`${origin}/profile-setup`);
    }

    return NextResponse.redirect(`${origin}/feed`);
  } catch {
    // Profile creation failed but session is valid — send to profile setup
    return NextResponse.redirect(`${origin}/profile-setup`);
  }
}
