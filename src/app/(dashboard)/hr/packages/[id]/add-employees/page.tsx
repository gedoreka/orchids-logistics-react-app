import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { AddEmployeesClient } from "./add-employees-client";

export default async function AddEmployeesPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;
  const packageId = parseInt(params.id);

  const packages = await query(
    "SELECT * FROM employee_packages WHERE id = ? AND company_id = ?",
    [packageId, companyId]
  );

  if (packages.length === 0) {
    return <div>الباقة غير موجودة</div>;
  }

  const pkg = packages[0];

  return (
    <AddEmployeesClient 
      package={pkg}
      companyId={companyId}
    />
  );
}
