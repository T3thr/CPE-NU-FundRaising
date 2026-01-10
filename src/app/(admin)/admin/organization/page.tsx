import { Metadata } from "next";
import OrganizationContent from "@/app/(admin)/admin/organization/_components/OrganizationContent";

export const metadata: Metadata = {
  title: "ตั้งค่าองค์กร",
};

export default function OrganizationPage() {
  return <OrganizationContent />;
}
