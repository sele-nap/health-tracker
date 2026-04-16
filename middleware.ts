import { NextRequest, NextResponse } from "next/server";

const PROTECTED = [
  "/",
  "/symptoms",
  "/medications",
  "/appointments",
  "/conditions",
  "/patterns",
  "/settings",
];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("better-auth.session_token");

  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect all dashboard routes. The cookie presence check is a fast
     * first-layer guard; each page still verifies the session properly
     * via auth.api.getSession() for authorization decisions.
     */
    "/",
    "/symptoms/:path*",
    "/medications/:path*",
    "/appointments/:path*",
    "/conditions/:path*",
    "/patterns/:path*",
    "/settings/:path*",
  ],
};
