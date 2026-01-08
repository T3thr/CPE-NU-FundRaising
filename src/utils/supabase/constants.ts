// =============================================================================
// Supabase Configuration Constants
// =============================================================================

/**
 * Supabase Project URL
 * @description Use environment variable for security, fallback to demo for development
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://iwdfzvfqbtokqetmbmbp.supabase.co";

/**
 * Supabase Anonymous Key (Public)
 * @description Safe to expose in client-side code
 */
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDU2NzAxMCwiZXhwIjoxOTQ2MTQzMDEwfQ._gr6kXGkQBi9BM9dx5vKaNKYj_DJN1xlkarprGpM_fU";

/**
 * Supabase Service Role Key (Server-side only)
 * @description NEVER expose this to client - used for admin operations
 */
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";
