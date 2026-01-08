"use server";
// =============================================================================
// Organization Server Actions
// =============================================================================

import { createSupabaseServerClient } from "@utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Organization } from "@/types/database";

/**
 * Get all organizations
 */
export async function getOrganizations() {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });
  
  if (error) {
    console.error("Error fetching organizations:", error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data: data as Organization[] };
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();
  
  if (error) {
    console.error("Error fetching organization:", error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data: data as Organization };
}

/**
 * Create a new organization
 */
export async function createOrganization(input: {
  name: string;
  slug: string;
  logo_url?: string;
  bank_name: string;
  bank_account_no: string;
  bank_account_name: string;
}) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating organization:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/super-admin/organizations");
  return { success: true, data: data as Organization };
}

/**
 * Update an organization
 */
export async function updateOrganization(
  id: string,
  input: Partial<Omit<Organization, "id" | "created_at">>
) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("organizations")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating organization:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/super-admin/organizations");
  return { success: true, data: data as Organization };
}

/**
 * Delete an organization (soft delete by deactivating)
 */
export async function deleteOrganization(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // Check for dependent cohorts
  const { count } = await supabase
    .from("cohorts")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", id);
  
  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete organization with ${count} active cohort(s)`,
    };
  }
  
  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting organization:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/super-admin/organizations");
  return { success: true };
}
