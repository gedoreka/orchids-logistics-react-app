"use client";

import dynamic from "next/dynamic";

const DashboardLayout = dynamic(() => import("./dashboard-layout").then(m => m.DashboardLayout), {
  ssr: false,
  loading: () => (
    <div className="h-screen overflow-hidden bg-background text-foreground flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
    </div>
  ),
});

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  user?: {
    name: string;
    role: string;
    email: string;
    company_id?: number;
  };
  permissions?: Record<string, number>;
  userType?: string;
  subscriptionData?: {
    isActive: boolean;
    endDate: string | null;
    daysRemaining: number;
  };
}

export function DashboardLayoutWrapper(props: DashboardLayoutWrapperProps) {
  return <DashboardLayout {...props} />;
}
