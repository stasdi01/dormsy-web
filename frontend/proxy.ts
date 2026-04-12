import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/coming-soon",
  "/waitlist",
  "/terms",
  "/privacy",
  "/support",
  "/auth/callback",
];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/listings/");

  if (isPublic) return NextResponse.next();

  // Check for Supabase session cookie (optimistic check)
  const hasSbCookie = req.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  );

  if (!hasSbCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
