// =============================================================================
// Admin Layout - Server-Side Protected Wrapper
// Double-layer security: Middleware + Server Component
// Based on: src/docs/STANDARD-Security.md
// =============================================================================

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminLayoutClient from "./_components/AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin - CPE Funds Hub",
  },
};

/**
 * Admin Root Layout with Server-Side Authorization
 * 
 * Security Layers:
 * 1. Middleware (src/middleware.ts) - First line of defense
 * 2. This Server Component - Double-check authorization
 * 3. Client Components - UI-level restrictions
 * 
 * This ensures that even if middleware is bypassed somehow,
 * the server component will still block unauthorized access.
 */
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authorization check (CRITICAL SECURITY)
  const session = await auth();

  // Not authenticated - redirect to login
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin&error=Unauthorized");
  }

  // Check for super_admin role
  const userRole = (session.user as { role?: string }).role;
  
  if (userRole !== "super_admin") {
    // Log unauthorized access attempt (for security monitoring)
    console.warn(`[SECURITY] Unauthorized admin access attempt by: ${session.user.email} (role: ${userRole})`);
    
    // Redirect to home with error
    redirect("/?error=AccessDenied");
  }

  // Authorized - render admin layout
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
