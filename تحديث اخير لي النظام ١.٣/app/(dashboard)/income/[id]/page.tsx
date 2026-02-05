import { cookies } from "next/headers";
import { IncomeViewClient } from "./income-view-client";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { query } from "@/lib/db";

export const metadata = {
  title: "عرض سند الإيراد - Logistics Systems Pro",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getIncomeData(id: string) {
  try {
    // First fetch the income record to get its company_id
    const { data: income, error } = await supabase
      .from("manual_income")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !income) {
      return null;
    }

    // Fetch company data based on the income record's company_id
    const companyData = await query<any>(
      `SELECT id, name, commercial_number, vat_number, country, region, district, street, postal_code, short_address, logo_path, stamp_path, digital_seal_path FROM companies WHERE id = ?`,
      [income.company_id]
    );

    return {
      income,
      company: companyData?.[0] || {},
    };
  } catch (error) {
    console.error("Error fetching income data:", error);
    return null;
  }
}

export default async function IncomeViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  if (!companyId) {
    notFound();
  }

  const data = await getIncomeData(id);

  if (!data || !data.income) {
    notFound();
  }

  const serializedData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  }));

  return (
    <IncomeViewClient
      income={serializedData.income}
      company={serializedData.company}
      companyId={parseInt(companyId)}
    />
  );
}
