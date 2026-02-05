import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { AddEmployeesClient } from "./add-employees-client";

export default async function AddEmployeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;
  const packageId = parseInt(id);

  const packages = await query<any>(
    "SELECT * FROM employee_packages WHERE id = ? AND company_id = ?",
    [packageId, companyId]
  );

  if (packages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-slate-800">الباقة غير موجودة</h1>
          <p className="text-slate-500 font-bold">Package not found</p>
        </div>
      </div>
    );
  }

  const pkg = packages[0];

  return (
    <AddEmployeesClient 
      package={pkg}
      companyId={companyId}
    />
  );
}
