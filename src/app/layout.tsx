import { DevtoolsProvider } from "@providers/devtools";
import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import React, { Suspense } from "react";

import { authProviderClient } from "@providers/auth-provider/auth-provider.client";
import { dataProvider } from "@providers/data-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import "@styles/global.css";

export const metadata: Metadata = {
  title: {
    default: "CPE Funds Hub | ระบบบริหารจัดการเงินกองกลาง",
    template: "%s | CPE Funds Hub",
  },
  description:
    "ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์ - ชำระเงิน ตรวจสอบสถานะ และจัดการข้อมูลอย่างโปร่งใส",
  keywords: ["CPE", "Funds", "Payment", "University", "Naresuan"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CPE Funds Hub | ระบบบริหารจัดการเงินกองกลาง",
    description:
      "ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์ - ชำระเงิน ตรวจสอบสถานะ และจัดการข้อมูลอย่างโปร่งใส",
    type: "website",
  },
};

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted text-sm">กำลังโหลด...</p>
      </div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Suspense fallback={<LoadingFallback />}>
          <ThemeProvider>
            <NotificationProvider>
              <RefineKbarProvider>
                <DevtoolsProvider>
                  <Refine
                    routerProvider={routerProvider}
                    authProvider={authProviderClient}
                    dataProvider={dataProvider}
                    resources={[
                      {
                        name: "members",
                        list: "/admin/members",
                        create: "/admin/members/create",
                        edit: "/admin/members/:id/edit",
                        show: "/admin/members/:id",
                        meta: {
                          label: "สมาชิก",
                          icon: "users",
                        },
                      },
                      {
                        name: "payments",
                        list: "/admin/payments",
                        show: "/admin/payments/:id",
                        meta: {
                          label: "การชำระเงิน",
                          icon: "credit-card",
                        },
                      },
                      {
                        name: "cohorts",
                        list: "/super-admin/cohorts",
                        create: "/super-admin/cohorts/create",
                        edit: "/super-admin/cohorts/:id/edit",
                        meta: {
                          label: "รุ่น",
                          icon: "users",
                        },
                      },
                      {
                        name: "organizations",
                        list: "/super-admin/organizations",
                        meta: {
                          label: "สาขา",
                          icon: "building",
                        },
                      },
                    ]}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                      projectId: "h4ixKt-MFQ5tt-ecZ8MR",
                    }}
                  >
                    {children}
                    <RefineKbar />
                  </Refine>
                </DevtoolsProvider>
              </RefineKbarProvider>
            </NotificationProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
