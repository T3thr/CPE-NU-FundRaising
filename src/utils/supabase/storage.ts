// =============================================================================
// Supabase Storage Service - File Upload & Management
// =============================================================================

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (browser-safe)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
const SLIP_BUCKET = "slips";

/**
 * Upload a slip image to Supabase Storage
 */
export async function uploadSlip(
  file: File,
  cohortId: string,
  memberId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${cohortId}/${memberId}/${timestamp}.${extension}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(SLIP_BUCKET)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Slip upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(SLIP_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Slip upload error:", error);
    return { success: false, error: "Failed to upload slip" };
  }
}

/**
 * Upload slip from Base64 string
 */
export async function uploadSlipFromBase64(
  base64Data: string,
  cohortId: string,
  memberId: string,
  mimeType: string = "image/jpeg"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    
    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = mimeType.split("/")[1] || "jpg";
    const filename = `${cohortId}/${memberId}/${timestamp}.${extension}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(SLIP_BUCKET)
      .upload(filename, bytes.buffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Slip upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(SLIP_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Slip upload error:", error);
    return { success: false, error: "Failed to upload slip" };
  }
}

/**
 * Delete a slip from storage
 */
export async function deleteSlip(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(SLIP_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error("Slip delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Slip delete error:", error);
    return { success: false, error: "Failed to delete slip" };
  }
}

/**
 * Get signed URL for private slip viewing
 */
export async function getSlipSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(SLIP_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error("Get signed URL error:", error);
    return { success: false, error: "Failed to get signed URL" };
  }
}

/**
 * List slips for a member
 */
export async function listMemberSlips(
  cohortId: string,
  memberId: string
): Promise<{ success: boolean; files?: string[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(SLIP_BUCKET)
      .list(`${cohortId}/${memberId}`, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      files: data.map((file) => `${cohortId}/${memberId}/${file.name}`),
    };
  } catch (error) {
    console.error("List slips error:", error);
    return { success: false, error: "Failed to list slips" };
  }
}

/**
 * Get storage bucket usage statistics
 */
export async function getStorageStats(): Promise<{
  success: boolean;
  totalFiles?: number;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.storage.from(SLIP_BUCKET).list("", {
      limit: 1000,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Count total files (rough estimate - would need recursive count for accurate number)
    return {
      success: true,
      totalFiles: data.length,
    };
  } catch (error) {
    console.error("Get storage stats error:", error);
    return { success: false, error: "Failed to get storage stats" };
  }
}

/**
 * Convert File to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate file before upload
 */
export function validateSlipFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "ไฟล์ต้องเป็น JPEG, PNG หรือ WebP เท่านั้น",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "ไฟล์ต้องมีขนาดไม่เกิน 5MB",
    };
  }

  return { valid: true };
}
