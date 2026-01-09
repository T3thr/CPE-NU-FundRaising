"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@utils/supabase/client";

/**
 * Auth Provider for CPE Funds Hub
 * 
 * This provider handles:
 * - Login with email/password via Supabase
 * - Logout and session management
 * - User identity and permissions
 * 
 * @see STANDARD-Auth.md for documentation
 */
export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: translateAuthError(error.message),
          },
        };
      }

      if (data?.session) {
        await supabaseBrowserClient.auth.setSession(data.session);

        return {
          success: true,
          redirectTo: "/admin",
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
        },
      };
    }
  },

  logout: async () => {
    const { error } = await supabaseBrowserClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: {
            name: "RegisterError",
            message: translateAuthError(error.message),
          },
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/login",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก",
        },
      };
    }

    return {
      success: false,
      error: {
        name: "RegisterError",
        message: "ไม่สามารถสมัครสมาชิกได้",
      },
    };
  },

  check: async () => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.getUser();

      if (error) {
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
        };
      }

      if (data?.user) {
        return {
          authenticated: true,
        };
      }

      return {
        authenticated: false,
        redirectTo: "/login",
      };
    } catch {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    try {
      const { data } = await supabaseBrowserClient.auth.getUser();

      if (data?.user) {
        // TODO: Fetch role from user_profiles table
        return data.user.role || "member";
      }

      return null;
    } catch {
      return null;
    }
  },

  getIdentity: async () => {
    try {
      const { data } = await supabaseBrowserClient.auth.getUser();

      if (data?.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email,
          avatar: undefined,
        };
      }

      return null;
    } catch {
      return null;
    }
  },

  forgotPassword: async ({ email }) => {
    try {
      const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: {
            name: "ForgotPasswordError",
            message: translateAuthError(error.message),
          },
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "ForgotPasswordError",
          message: error.message || "เกิดข้อผิดพลาด",
        },
      };
    }
  },

  onError: async (error) => {
    if (error?.code === "PGRST301" || error?.code === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};

/**
 * Translate Supabase auth errors to Thai
 */
function translateAuthError(message: string): string {
  const translations: Record<string, string> = {
    "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "Email not confirmed": "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
    "User already registered": "อีเมลนี้ถูกใช้งานแล้ว",
    "Password should be at least 6 characters": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    "Unable to validate email address: invalid format": "รูปแบบอีเมลไม่ถูกต้อง",
    "Too many requests": "คำขอมากเกินไป กรุณารอสักครู่",
    "Network error": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
  };

  return translations[message] || message;
}
