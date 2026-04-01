import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayoutWrapper } from "@/components/layout/dashboard-layout-wrapper";
import { cachedQuery } from "@/lib/db";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
    const userType = session.user_type || "owner";
    
    let user: { name: string; role: string; email: string; company_id?: number };
    let subscriptionData = { isActive: false, endDate: null as string | null, daysRemaining: 0 };
    
      if (userType === "sub_user" && session.sub_user_id) {
        const subUsers = await cachedQuery<{ id: number; name: string; email: string }>(
          "SELECT id, name, email FROM company_sub_users WHERE id = ?",
          [session.sub_user_id], 30000
        );
        
        if (!subUsers || subUsers.length === 0) {
          redirect("/login");
        }
        const subUser = subUsers[0];
        user = {
          name: subUser.name,
          role: "sub_user",
          email: subUser.email,
          company_id: session.company_id
        };
      } else {
        const users = await cachedQuery<{ id: number; name: string; email: string; role: string; company_id: number }>(
          "SELECT id, name, email, role, company_id FROM users WHERE id = ?",
          [session.user_id], 30000
        );
        
        if (!users || users.length === 0) {
          redirect("/login");
        }
        user = {
          name: users[0].name,
          role: users[0].role,
          email: users[0].email,
          company_id: users[0].company_id || session.company_id
        };
      }

    // Fetch subscription data
    if (user.role !== 'admin' && user.company_id) {
      const companies = await cachedQuery<any>(
        "SELECT is_subscription_active, subscription_end_date FROM companies WHERE id = ?",
        [user.company_id], 60000
      );

      if (companies && companies.length > 0) {
        const company = companies[0];
        const endDate = company.subscription_end_date;
        const isActive = company.is_subscription_active === 1 && (endDate ? new Date(endDate) > new Date() : false);
        const daysRemaining = endDate 
          ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0;
        
        subscriptionData = { isActive, endDate, daysRemaining: daysRemaining > 0 ? daysRemaining : 0 };
      }
    } else if (user.role === 'admin') {
      subscriptionData = { isActive: true, endDate: null, daysRemaining: 9999 };
    }


    // Fetch live permissions from DB (not stale session cookie)
    let livePermissions: Record<string, number> = session.permissions || {};
    if (user.role !== 'admin' && user.company_id) {
      try {
        const companyPerms = await cachedQuery<{ feature_key: string; is_enabled: number }>(
          "SELECT feature_key, is_enabled FROM company_permissions WHERE company_id = ?",
          [user.company_id], 30000
        );
        livePermissions = {};
        (companyPerms || []).forEach(p => { livePermissions[p.feature_key] = p.is_enabled ? 1 : 0; });
      } catch {
        // Fall back to session permissions if DB query fails
        livePermissions = session.permissions || {};
      }

      if (userType === 'sub_user' && session.sub_user_id) {
        try {
          const subPerms = await cachedQuery<{ permission_key: string }>(
            "SELECT permission_key FROM sub_user_permissions WHERE sub_user_id = ?",
            [session.sub_user_id], 30000
          );
          (subPerms || []).forEach(p => { livePermissions[p.permission_key] = 1; });
        } catch {
          // sub_user_permissions table may not exist yet — silently ignore
        }
      }
    }

    return (
        <DashboardLayoutWrapper
          user={user}
          permissions={livePermissions}
          userType={userType}
          subscriptionData={subscriptionData}
        >
          {children}
        </DashboardLayoutWrapper>
      );
}
