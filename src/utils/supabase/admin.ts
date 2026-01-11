import { createClient } from "@supabase/supabase-js";

// Check for Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // In development, this might not throw immediately to check build process
  // but it's critical for functionality.
  console.warn("⚠️ Valid Supabase URL and Service Role Key are required for Admin actions.");
}

/**
 * Creates a Supabase Admin Client using the Service Role Key.
 * ⚠️ WARNING: This client bypasses RLS policies!
 * Use only in trusted server-side contexts with proper authorization checks.
 */
export const createSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
