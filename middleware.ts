import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  // Only apply auth redirect on client-specific deployments
  if (!clientId) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Always allow: login page, API routes, Next.js internals, static files, agency
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/agency"
  ) {
    return NextResponse.next();
  }

  // Redirect root to login
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow /c/{clientId} through — LayoutShell handles client-side auth check
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
