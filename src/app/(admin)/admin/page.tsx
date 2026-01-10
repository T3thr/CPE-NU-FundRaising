// =============================================================================
// Admin Dashboard - Overview Page (Server Component)
// Best Practice: Fetch data on the server, pass to client component
// =============================================================================

import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
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
