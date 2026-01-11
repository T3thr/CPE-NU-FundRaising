// =============================================================================
// Enterprise Middleware - OWASP Compliant Security
// Based on: OWASP Top 10, WSS Security Standards
// =============================================================================

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security Headers (OWASP Recommended)
const securityHeaders = {
  // Prevent XSS attacks
  "X-XSS-Protection": "1; mode=block",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join("; "),
  // HTTP Strict Transport Security
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Permissions Policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

// Routes configuration
const PUBLIC_ROUTES = ["/login", "/api/auth"];
const ADMIN_ROUTES = ["/admin"];
const PROTECTED_ROUTES = ["/", "/pay", "/status"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Skip auth check for API routes (except our own auth routes)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    return response;
  }

  // Skip auth check for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Allow public routes without authentication
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    // If logged in and trying to access login, redirect to home
    if (pathname === "/login" && session?.user) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return response;
  }

  // Check if user is authenticated for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Not authenticated - redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access
  if (isAdminRoute) {
    const userRole = (session.user as { role?: string })?.role;
    
    if (userRole !== "super_admin") {
      // Non-admin users cannot access admin routes
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
