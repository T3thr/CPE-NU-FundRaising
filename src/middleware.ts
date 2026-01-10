import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest, NextResponse } from "next/server";
import { NextResponse as Response } from "next/server";

// Routes ที่ต้อง login
const protectedRoutes = ["/admin"];

// Routes ที่ไม่ต้อง login
const publicRoutes = ["/", "/pay", "/status", "/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    // Still update session for public routes
    return await updateSession(request);
  }

  // Check for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const result = await updateSession(request);
    
    // If session update returns a redirect, follow it
    if (result.status === 307 || result.status === 308) {
      return result;
    }
    
    return result;
  }

  // Default: update session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
