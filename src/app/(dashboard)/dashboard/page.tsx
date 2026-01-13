import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
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
      const companies = await query<Company>(
        "SELECT * FROM companies WHERE id = $1",
        [session.company_id]
      );
      
      if (companies.length > 0) {
        company = companies[0];
        
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

      const employeesResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM employees WHERE company_id = $1",
        [session.company_id]
      );
      stats.total_employees = parseInt(employeesResult[0]?.count || "0");

      const packagesResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM employee_packages WHERE company_id = $1",
        [session.company_id]
      );
      stats.total_packages = parseInt(packagesResult[0]?.count || "0");

      const activeResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM employees WHERE company_id = $1 AND is_active = 1",
        [session.company_id]
      );
      stats.active_employees = parseInt(activeResult[0]?.count || "0");

      const expiredResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM employees WHERE company_id = $1 AND iqama_expiry IS NOT NULL AND iqama_expiry <= CURRENT_DATE",
        [session.company_id]
      );
      stats.expired_iqama = parseInt(expiredResult[0]?.count || "0");
    }

    if (isAdmin) {
      const usersResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM users WHERE is_activated = 1"
      );
      stats.users_count = parseInt(usersResult[0]?.count || "0");

      const pendingResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM companies WHERE status = 'pending'"
      );
      stats.pending_requests = parseInt(pendingResult[0]?.count || "0");

      const stoppedResult = await query<{ count: string }>(
        "SELECT COUNT(*) as count FROM companies WHERE status = 'stopped'"
      );
      stats.stopped_companies = parseInt(stoppedResult[0]?.count || "0");
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  return (
    <DashboardClient
      user={{
        name: session.name || "مستخدم",
        email: session.email,
        role: session.role || "user",
      }}
      company={company ? {
        name: company.name,
        logo: company.logo_path,
        commercial_number: company.commercial_number,
        vat_number: company.vat_number,
        created_at: company.created_at,
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
