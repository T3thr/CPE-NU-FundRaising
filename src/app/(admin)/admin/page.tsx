// =============================================================================
// Admin Dashboard - Overview Page (Server Component)
// Best Practice: Server-side data fetching with authorization check
// Based on: src/docs/STANDARD-Security.md
// =============================================================================

import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Loading from "./loading";
import { 
  getDashboardStats, 
  getRecentPayments, 
  getUnpaidMembers, 
  getActiveCohort 
} from "./_actions/admin-actions";

// Dynamic import with loading state
const DashboardContent = dynamic(
  () => import("./_components/DashboardContent"),
  { 
    loading: () => <Loading />,
  }
);

export const metadata: Metadata = {
  title: "ภาพรวม",
};

export default async function AdminDashboardPage() {
  // Double-check authorization (Defense in Depth)
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "super_admin") {
    redirect("/?error=AccessDenied");
  }

  // Fetch data on the server (PARALLEL FETCHING)
  // This makes the initial page load contains data immediately
  const [stats, recentPayments, unpaidMembers, cohort] = await Promise.all([
    getDashboardStats(),
    getRecentPayments(6),
    getUnpaidMembers(6),
    getActiveCohort(),
  ]);

  const initialData = {
    stats,
    recentPayments,
    unpaidMembers,
    cohort,
  };

  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent initialData={initialData} />
    </Suspense>
  );
}
