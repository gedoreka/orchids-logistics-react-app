import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { HRClient } from "./hr-client";

export default async function HRPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  const packages = await query(
    "SELECT * FROM employee_packages WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  return (
    <HRClient 
      initialPackages={packages} 
      companyId={companyId}
    />
  );
}
