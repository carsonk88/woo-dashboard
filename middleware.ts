import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  // Only redirect on client-specific deployments
  if (!clientId) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Pass through: already on client page, API routes, Next.js internals, static files
  if (
    pathname.startsWith(`/c/${clientId}`) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/agency"
  ) {
    return NextResponse.next();
  }

  // Redirect root and all other pages to /c/{clientId}
  // so credentials get initialized from Supabase on first load
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/c/${clientId}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
