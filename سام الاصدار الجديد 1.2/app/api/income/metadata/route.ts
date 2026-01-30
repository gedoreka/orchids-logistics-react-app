import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("company_id");

  if (!companyId) {
    return NextResponse.json({ error: "company_id required" }, { status: 400 });
  }

  try {
    const accounts = await query<any>(
      "SELECT id, account_code, account_name FROM accounts WHERE company_id = ? ORDER BY account_code",
      [companyId]
    );

    const costCenters = await query<any>(
      "SELECT id, center_code, center_name FROM cost_centers WHERE company_id = ? ORDER BY center_code",
      [companyId]
    );

    const { data: maxIdData } = await supabase
      .from("manual_income")
      .select("id")
      .eq("company_id", companyId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    const nextId = (maxIdData?.id || 0) + 1;
    const operationNumber = "INC" + String(nextId).padStart(5, "0");

    const { data: incomes, count } = await supabase
      .from("manual_income")
      .select("*", { count: "exact" })
      .eq("company_id", companyId)
      .order("income_date", { ascending: false })
      .limit(100);

    return NextResponse.json({
      accounts,
      costCenters,
      operationNumber,
      incomes: incomes || [],
      totalIncomes: count || 0,
    });
  } catch (error) {
    console.error("Error fetching income metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
