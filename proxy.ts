import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

function hasSession(request: NextRequest): boolean {
  return (
    !!request.cookies.get("better-auth.session_token")?.value ||
    !!request.cookies.get("__Secure-better-auth.session_token")?.value
  );
}

function safeCallbackUrl(url: string): string {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return "/";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = hasSession(request);

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (authenticated) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      return NextResponse.redirect(
        new URL(callbackUrl ? safeCallbackUrl(callbackUrl) : "/", request.url)
      );
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/",
    "/symptoms/:path*",
    "/medications/:path*",
    "/appointments/:path*",
    "/conditions/:path*",
    "/patterns/:path*",
    "/settings/:path*",
  ],
};
