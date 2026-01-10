// =============================================================================
// Public Layout - Wraps all public pages with Navbar
// =============================================================================

import { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicNavbar />
      <main style={{ flex: 1, paddingTop: "72px" }}>{children}</main>
      <Footer />
    </div>
  );
}
