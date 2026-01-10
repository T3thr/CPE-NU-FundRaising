// =============================================================================
// Public Payment Page
// =============================================================================

import { Metadata } from "next";
import PayPageContent from "./_components/PayPageContent";

export const metadata: Metadata = {
  title: "แจ้งชำระเงิน",
  description: "แจ้งชำระเงินค่าธรรมเนียมกองกลางสาขา",
};

export default function PayPage() {
  return <PayPageContent />;
}
