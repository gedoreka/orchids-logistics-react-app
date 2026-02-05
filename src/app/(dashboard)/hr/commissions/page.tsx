import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { CommissionsClient } from "./commissions-client";

export default async function CommissionsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  if (!companyId) {
    return <div className="p-8 text-center text-red-500">يرجى تسجيل الدخول للوصول إلى هذه الصفحة.</div>;
  }

  // Initial data can be fetched here or via the API on the client side.
  // We'll fetch packages here to have them ready.
  const packages = await query(
    "SELECT id, group_name, work_type FROM employee_packages WHERE company_id = ? AND work_type IN ('commission', 'target')",
    [companyId]
  );

  return (
    <CommissionsClient 
      companyId={companyId}
      initialPackages={packages}
    />
  );
}
