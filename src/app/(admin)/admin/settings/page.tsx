// =============================================================================
// Admin Settings Page
// =============================================================================

import { Metadata } from "next";
import SettingsContent from "@/app/(admin)/admin/settings/_components/SettingsContent";

export const metadata: Metadata = {
  title: "ตั้งค่าระบบ",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
