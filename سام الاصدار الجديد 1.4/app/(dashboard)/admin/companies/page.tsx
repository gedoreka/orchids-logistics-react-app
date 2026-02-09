import React from "react";
import { query } from "@/lib/db";
import { Company } from "@/lib/types";
import { CompaniesClient } from "./companies-client";

interface CompanySubscription {
  id: number;
  company_id: number;
  plan_id: number;
  plan_name: string;
  plan_price: number;
  start_date: string;
  end_date: string;
  status: string;
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string }>;
}) {
  const searchParamsResolved = await searchParams;
  const statusFilter = searchParamsResolved.filter || "all";
  const search = searchParamsResolved.search || "";

  let sql = "SELECT * FROM companies WHERE 1=1";
  const params: any[] = [];

  if (search) {
    sql += " AND (name LIKE ? OR commercial_number LIKE ? OR vat_number LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (statusFilter === "approved") {
    sql += " AND (status = 'approved' OR status = 'active')";
  } else if (statusFilter === "rejected") {
    sql += " AND status = 'rejected'";
  } else if (statusFilter === "pending") {
    sql += " AND (status = 'pending' OR (status IS NULL AND status NOT IN ('approved', 'rejected', 'active')))";
  }

  sql += " ORDER BY created_at DESC";

  const companies = await query<Company>(sql, params);

  let plans: any[] = [];
  try {
    plans = await query(`SELECT id, name, price, duration_value, duration_unit FROM subscription_plans WHERE is_active = 1 ORDER BY sort_order ASC`);
    plans = plans.map((p: any) => ({ ...p, price: parseFloat(p.price) || 0 }));
  } catch (e) {
    console.log('Plans table may not exist yet');
  }

  // جلب اشتراكات الشركات النشطة
  let subscriptionsMap: Record<number, CompanySubscription> = {};
  try {
    const subscriptions = await query<any>(`
      SELECT 
        cs.id, cs.company_id, cs.plan_id, cs.start_date, cs.end_date, cs.status,
        sp.name as plan_name, sp.price as plan_price
      FROM company_subscriptions cs
      LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE cs.status = 'active'
      ORDER BY cs.created_at DESC
    `);
    // تحويل لـ map حسب company_id (نأخذ أحدث اشتراك لكل شركة)
    for (const sub of subscriptions) {
      if (!subscriptionsMap[sub.company_id]) {
        subscriptionsMap[sub.company_id] = {
          ...sub,
          plan_price: parseFloat(sub.plan_price) || 0
        };
      }
    }
  } catch (e) {
    console.log('Subscriptions table may not exist yet');
  }

  return (
    <div className="p-6 md:p-10 bg-slate-900 min-h-screen">
      <CompaniesClient 
        initialCompanies={companies} 
        statusFilter={statusFilter}
        search={search}
        plans={plans}
        subscriptions={subscriptionsMap}
      />
    </div>
  );
}
