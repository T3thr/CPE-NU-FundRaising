// =============================================================================
// Public Status Check Page
// =============================================================================

import { Metadata } from "next";
import StatusPageContent from "./_components/StatusPageContent";

export const metadata: Metadata = {
  title: "ตรวจสอบสถานะ",
  description: "ตรวจสอบสถานะการชำระเงินค่าธรรมเนียมกองกลาง",
};

export default function StatusPage() {
  return <StatusPageContent />;
}
