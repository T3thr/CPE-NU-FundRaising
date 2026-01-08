// =============================================================================
// Admin Dashboard - Overview Page
// =============================================================================

import { Metadata } from "next";
import DashboardContent from "./_components/DashboardContent";

export const metadata: Metadata = {
  title: "ภาพรวม",
};

export default function AdminDashboardPage() {
  return <DashboardContent />;
}
