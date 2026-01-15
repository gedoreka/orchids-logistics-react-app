import React from "react";
import { query } from "@/lib/db";
import { Company } from "@/lib/types";
import { PermissionsClient } from "./permissions-client";
import { notFound } from "next/navigation";

interface Permission {
  id: number;
  company_id: number;
  feature_key: string;
  is_enabled: number;
}

export default async function CompanyPermissionsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const companies = await query<Company>(
    "SELECT * FROM companies WHERE id = ?",
    [id]
  );

  if (!companies || companies.length === 0) {
    notFound();
  }

  const company = companies[0];
  
  const permissions = await query<Permission>(
    "SELECT * FROM company_permissions WHERE company_id = ? AND is_enabled = 1",
    [id]
  );
  
  const enabledFeatures = permissions.map(p => p.feature_key);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <PermissionsClient company={company} enabledFeatures={enabledFeatures} />
    </div>
  );
}
