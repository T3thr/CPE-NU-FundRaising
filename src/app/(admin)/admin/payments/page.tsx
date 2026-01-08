// =============================================================================
// Admin Payments Page - Payment Grid View
// =============================================================================

import { Metadata } from "next";
import PaymentsContent from "./_components/PaymentsContent";

export const metadata: Metadata = {
  title: "ตารางการชำระเงิน",
};

export default function PaymentsPage() {
  return <PaymentsContent />;
}
