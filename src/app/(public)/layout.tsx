// =============================================================================
// Public Layout - Wraps all public pages with Navbar
// =============================================================================

import { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";

export const metadata: Metadata = {
  title: {
    default: "CPE Funds Hub",
    template: "%s | CPE Funds Hub",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <main style={{ paddingTop: "72px" }}>{children}</main>
    </>
  );
}
