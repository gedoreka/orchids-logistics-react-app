import React from "react";
import { query } from "@/lib/db";
import { Company } from "@/lib/types";
import { CompaniesClient } from "./companies-client";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: { filter?: string; search?: string };
}) {
  const statusFilter = searchParams.filter || "all";
  const search = searchParams.search || "";

  let sql = "SELECT * FROM companies WHERE 1=1";
  const params: any[] = [];

  if (search) {
    sql += " AND (name LIKE ? OR commercial_number LIKE ? OR vat_number LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (statusFilter === "approved") {
    sql += " AND status = 'approved'";
  } else if (statusFilter === "rejected") {
    sql += " AND status = 'rejected'";
  } else if (statusFilter === "pending") {
    sql += " AND (status IS NULL OR status NOT IN ('approved', 'rejected'))";
  }

  sql += " ORDER BY created_at DESC";

  const companies = await query<Company>(sql, params);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <CompaniesClient 
        initialCompanies={companies} 
        statusFilter={statusFilter}
        search={search}
      />
    </div>
  );
}
