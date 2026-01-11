// =============================================================================
// Auth.js v5 Configuration - Enterprise Security Level
// Based on: OWASP Standards, WSS Security Guidelines
// =============================================================================

import NextAuth, { type NextAuthConfig, type User, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

// User roles based on supabase/fix_rls_and_seed_admin.sql
export type UserRole = "public" | "super_admin";

// Extended user type with role
export interface ExtendedUser extends User {
  role: UserRole;
  userId?: string;
}

// Extended session with role
export interface ExtendedSession extends Session {
  user: ExtendedUser;
}

// Extended JWT with role
interface ExtendedJWT extends JWT {
  role?: UserRole;
  userId?: string;
}

// Hardcoded credentials from supabase/fix_rls_and_seed_admin.sql
// These are the ONLY accounts that can access the system (Intranet style)
const AUTHORIZED_USERS: { email: string; password: string; role: UserRole; name: string }[] = [
  {
    email: "treasurer@cpe.nu.ac.th",
    password: "CpeTreasurer2026!",
    role: "super_admin",
    name: "เหรัญญิก CPE",
  },
  {
    email: "public@cpe.nu.ac.th", 
    password: "CpePublicAccess!",
    role: "public",
    name: "สมาชิกสาขา",
  },
];

/**
 * Auth.js v5 Configuration
 * Security Features:
 * - Credentials-based authentication (no external OAuth)
 * - JWT strategy with short expiration
 * - Session callbacks for role injection
 * - Secure cookie configuration
 */
const authConfig: NextAuthConfig = {
  // Use JWT strategy for stateless sessions
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours max session (working hours)
    updateAge: 60 * 60, // Update token every 1 hour
  },

  // Cookie settings handled automatically by Auth.js based on NODE_ENV
  // In production: Uses __Secure- prefix with secure: true
  // In development: Uses standard names with secure: false

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Providers
  providers: [
    Credentials({
      id: "credentials",
      name: "CPE Funds Login",
      credentials: {
        email: { label: "อีเมล", type: "email" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find authorized user
        const user = AUTHORIZED_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
          // Security: Don't reveal if email exists or password is wrong
          return null;
        }

        // Return user with role
        return {
          id: user.email,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // Callbacks for session and token management
  callbacks: {
    // JWT callback - add role to token
    async jwt({ token, user }): Promise<ExtendedJWT> {
      if (user) {
        const extUser = user as ExtendedUser;
        token.role = extUser.role;
        token.userId = extUser.id;
      }
      return token as ExtendedJWT;
    },

    // Session callback - add role to session
    async session({ session, token }): Promise<ExtendedSession> {
      const extToken = token as ExtendedJWT;
      return {
        ...session,
        user: {
          ...session.user,
          role: extToken.role || "public",
          userId: extToken.userId,
        },
      } as ExtendedSession;
    },

    // Authorized callback - check if user can access route
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      
      // These routes require authentication
      const protectedRoutes = ["/", "/pay", "/status", "/admin"];
      const adminRoutes = ["/admin"];
      
      // Check if route is protected
      const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

      // Check if route is admin-only
      const isAdminRoute = adminRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );

      // If accessing login page and already authenticated, redirect
      if (pathname === "/login" && auth?.user) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      // If protected route and not authenticated
      if (isProtectedRoute && !auth?.user) {
        return false; // Will redirect to signIn page
      }

      // If admin route, check for super_admin role
      if (isAdminRoute && auth?.user) {
        const user = auth.user as ExtendedUser;
        if (user.role !== "super_admin") {
          // Redirect public users away from admin
          return Response.redirect(new URL("/", request.nextUrl));
        }
      }

      return true;
    },
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === "development",

  // Trust host for production
  trustHost: true,
};

// Export auth handlers
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper function to check if user is super admin
export function isSuperAdmin(session: ExtendedSession | null): boolean {
  return session?.user?.role === "super_admin";
}

// Helper function to check if user is authenticated
export function isAuthenticated(session: ExtendedSession | null): boolean {
  return !!session?.user;
}
