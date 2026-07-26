import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Next.js 16 uses "proxy" instead of "middleware".
 * This runs on every matched request before it reaches the app.
 * We use it for lightweight auth redirection only — heavy auth
 * checks happen in the API routes themselves.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check auth session
  const session = await auth();

  // Protected routes — redirect to login if not authenticated
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
