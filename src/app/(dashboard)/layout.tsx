import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { query } from "@/lib/db";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const userType = session.user_type || "owner";
  
  let user: { name: string; role: string; email: string };
  
  if (userType === "sub_user" && session.sub_user_id) {
    const subUsers = await query<{ id: number; name: string; email: string }>(
      "SELECT id, name, email FROM company_sub_users WHERE id = ?",
      [session.sub_user_id]
    );
    
    if (!subUsers || subUsers.length === 0) {
      redirect("/login");
    }
    const subUser = subUsers[0];
    user = {
      name: subUser.name,
      role: "sub_user",
      email: subUser.email
    };
  } else {
    const users = await query<{ id: number; name: string; email: string; role: string; company_id: number }>(
      "SELECT id, name, email, role, company_id FROM users WHERE id = ?",
      [session.user_id]
    );
    
    if (!users || users.length === 0) {
      redirect("/login");
    }
    user = {
      name: users[0].name,
      role: users[0].role,
      email: users[0].email
    };
  }

  return (
    <DashboardLayout 
      user={user}
      permissions={session.permissions}
      userType={userType}
    >
      {children}
    </DashboardLayout>
  );
}
