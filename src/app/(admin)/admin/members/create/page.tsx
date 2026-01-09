// =============================================================================
// Admin Create Member Page
// =============================================================================

import { Metadata } from "next";
import CreateMemberContent from "@/app/(admin)/admin/members/create/_components/CreateMemberContent";

export const metadata: Metadata = {
  title: "เพิ่มสมาชิก",
};

export default function CreateMemberPage() {
  return <CreateMemberContent />;
}
