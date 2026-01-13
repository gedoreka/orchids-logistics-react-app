import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { query } from "@/lib/db";
import { User } from "@/lib/types";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  
  // Refresh user data from DB to ensure it's up to date
  const users = await query<User>("SELECT id, name, email, role, company_id FROM users WHERE id = ?", [session.user_id]);
  
  if (users.length === 0) {
    redirect("/login");
  }

  const user = users[0];

  return (
    <DashboardLayout 
      user={{
        name: user.name,
        role: user.role,
        email: user.email
      }}
      permissions={session.permissions}
    >
      {children}
    </DashboardLayout>
  );
}
