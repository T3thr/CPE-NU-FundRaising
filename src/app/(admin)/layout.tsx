// =============================================================================
// Admin Layout - Wraps all admin pages
// =============================================================================

import { Metadata } from "next";
import AdminLayoutClient from "./_components/AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin - CPE Funds Hub",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
