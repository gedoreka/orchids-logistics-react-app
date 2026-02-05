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
      // Fetch accounts from Supabase instead of MySQL
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id, account_code, account_name, account_level, parent_account")
        .eq("company_id", companyId)
        .order("account_code", { ascending: true });

      if (accountsError) throw accountsError;

      // Fetch cost centers
      const { data: costCenters, error: costCentersError } = await supabase
        .from("cost_centers")
        .select("id, center_code, center_name")
        .eq("company_id", companyId)
        .order("center_code", { ascending: true });

      if (costCentersError) throw costCentersError;

      // Get the highest entry_number to generate the next one
      const { data: latestEntry } = await supabase
        .from("journal_entries")
        .select("entry_number")
        .eq("company_id", companyId)
        .order("entry_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNumber = 1;
      if (latestEntry?.entry_number) {
        const match = latestEntry.entry_number.match(/\d+/);
        if (match) {
          nextNumber = parseInt(match[0]) + 1;
        }
      }
      const entryNumber = "JE" + String(nextNumber).padStart(5, "0");

      // Fetch grouped journal entries
      const { data: entries } = await supabase
        .from("journal_entries")
        .select("*, accounts(account_name, account_code), cost_centers(center_name, center_code)")
        .eq("company_id", companyId)
        .order("entry_date", { ascending: false })
        .order("entry_number", { ascending: false });

      return NextResponse.json({
        accounts: accounts || [],
        costCenters: costCenters || [],
        entryNumber,
        entries: entries || [],
      });
    } catch (error) {
    console.error("Error fetching journal entries metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
