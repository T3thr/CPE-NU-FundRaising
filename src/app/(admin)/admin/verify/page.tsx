// =============================================================================
// Admin Verify Slips Page
// =============================================================================

import { Metadata } from "next";
import VerifySlipsContent from "@/app/(admin)/admin/verify/_components/VerifySlipsContent";

export const metadata: Metadata = {
  title: "ตรวจสอบ Slip",
};

export default function VerifySlipsPage() {
  return <VerifySlipsContent />;
}
