// =============================================================================
// Admin Reports Page
// =============================================================================

import { Metadata } from "next";
import ReportsContent from "./_components/ReportsContent";

export const metadata: Metadata = {
  title: "รายงาน",
};

export default function ReportsPage() {
  return <ReportsContent />;
}
