import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  // Only redirect on client-specific deployments
  if (!clientId) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Pass through: login page, API routes, Next.js internals, static files, agency
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/agency"
  ) {
    return NextResponse.next();
  }

  // Redirect root to login (middleware can't read sessionStorage, so client page handles auth check)
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow /c/{clientId} through — the page component checks auth via sessionStorage
  if (pathname.startsWith(`/c/${clientId}`)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
