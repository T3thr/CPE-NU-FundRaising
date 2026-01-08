// =============================================================================
// Admin Members List Page
// =============================================================================

import { Metadata } from "next";
import MembersListContent from "./_components/MembersListContent";

export const metadata: Metadata = {
  title: "จัดการสมาชิก",
};

export default function MembersPage() {
  return <MembersListContent />;
}
