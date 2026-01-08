"use client";
// =============================================================================
// Admin Layout Client Component
// =============================================================================

import React from "react";
import { AdminLayout } from "@/components/layout/Sidebar";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
