import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { CostCenter } from "@/lib/types";
import { CostCentersClient } from "./cost-centers-client";

export default async function CostCentersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  const costCenters = await query<CostCenter>(
    "SELECT * FROM cost_centers WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  return (
    <CostCentersClient 
      initialCostCenters={costCenters} 
      companyId={companyId}
    />
  );
}
