import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

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
