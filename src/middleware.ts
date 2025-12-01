import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get("wp-reports-session")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  // Verify the session token
  const isValid = await verifySession(token);

  if (!isValid) {
    const response = redirectToLogin(request);
    response.cookies.delete("wp-reports-session");
    return response;
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);

  // Store the original URL to redirect back after login
  if (request.nextUrl.pathname !== "/") {
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
