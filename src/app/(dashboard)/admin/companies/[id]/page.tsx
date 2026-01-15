import React from "react";
import { query } from "@/lib/db";
import { Company } from "@/lib/types";
import { CompanyDetailsClient } from "./company-details-client";
import { notFound } from "next/navigation";

export default async function CompanyDetailsPage({
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

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <CompanyDetailsClient company={company} />
    </div>
  );
}
