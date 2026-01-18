import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { DashboardClient } from "./dashboard-client";

interface Company {
  id: number;
  name: string;
  logo_path?: string;
  commercial_number?: string;
  vat_number?: string;
  created_at?: string;
  is_active?: number;
  access_token?: string;
  token_expiry?: string;
  status?: string;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const isAdmin = session.email === "admin@zoolspeed.com";

  let company: Company | null = null;
  let subscription = {
    message: "اشتراك دائم",
    type: "premium",
    badge: "success",
    remaining_days: undefined as number | undefined
  };

  let stats = {
    users_count: 0,
    pending_requests: 0,
    stopped_companies: 0,
    total_employees: 0,
    total_packages: 0,
    active_employees: 0,
    expired_iqama: 0,
    credit_notes_count: 0,
    credit_notes_total: 0,
  };

  const permissions = session.permissions || {};

  try {
    if (session.company_id) {
      const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("id", session.company_id);
      
      if (companies && companies.length > 0) {
        company = companies[0] as Company;
        
        const tokenExpiry = company.token_expiry;
        if (!tokenExpiry || tokenExpiry === "0000-00-00") {
          subscription = {
            message: "اشتراك دائم",
            type: "premium",
            badge: "success",
            remaining_days: undefined
          };
        } else {
          const expiryDate = new Date(tokenExpiry);
          const now = new Date();
          const remainingDays = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (remainingDays > 0) {
            subscription = {
              message: `${remainingDays} يوم متبقي`,
              type: "active",
              badge: remainingDays <= 30 ? "warning" : "primary",
              remaining_days: remainingDays
            };
          } else {
            subscription = {
              message: "الاشتراك منتهي",
              type: "expired",
              badge: "danger",
              remaining_days: 0
            };
          }
        }
      }

      const { count: empCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("company_id", session.company_id);
      stats.total_employees = empCount || 0;

      const { count: pkgCount } = await supabase
        .from("employee_packages")
        .select("*", { count: "exact", head: true })
        .eq("company_id", session.company_id);
      stats.total_packages = pkgCount || 0;

      const { count: activeCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("company_id", session.company_id)
        .eq("is_active", 1);
      stats.active_employees = activeCount || 0;

      const { count: expiredCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("company_id", session.company_id)
        .lte("iqama_expiry", new Date().toISOString().split('T')[0]);
      stats.expired_iqama = expiredCount || 0;
    }

    if (isAdmin) {
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_activated", 1);
      stats.users_count = usersCount || 0;

      const { count: pendingCount } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      stats.pending_requests = pendingCount || 0;

      const { count: stoppedCount } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true })
        .eq("status", "stopped");
      stats.stopped_companies = stoppedCount || 0;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  return (
    <DashboardClient
      user={{
        name: session.name || session.user_name || "مستخدم",
        email: session.email,
        role: session.role || "user",
      }}
        company={company ? {
          name: company.name,
          logo: company.logo_path,
          commercial_number: company.commercial_number,
          vat_number: company.vat_number,
          created_at: company.created_at ? new Date(company.created_at).toLocaleDateString("ar-SA") : undefined,
          is_active: company.is_active === 1,
          access_token: company.access_token,
        } : null}
      subscription={subscription}
      stats={stats}
      permissions={permissions}
      isAdmin={isAdmin}
    />
  );
}
