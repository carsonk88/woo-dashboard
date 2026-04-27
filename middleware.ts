import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const { pathname } = req.nextUrl;

  // Master/agency deploy (no CLIENT_ID): / and /login both go to /agency.
  // The per-client /login flow needs a CLIENT_ID to validate against, so it can't work here.
  if (!clientId) {
    if (pathname === "/" || pathname === "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/agency";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

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

  // Redirect root to the client dashboard; that page handles auth and sends
  // unauthenticated users to /login itself.
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/c/${clientId}`;
    return NextResponse.redirect(url);
  }

  // Allow /c/{clientId} through — LayoutShell handles client-side auth check
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
