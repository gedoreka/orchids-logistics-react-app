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
    // Since each line is a row, we group them by entry_number in the frontend
    // but here we can return the raw lines ordered by entry_number and date
    const { data: entries } = await supabase
      .from("journal_entries")
      .select("*, accounts(account_name, account_code)")
      .eq("company_id", companyId)
      .order("entry_date", { ascending: false })
      .order("entry_number", { ascending: false });

    return NextResponse.json({
      accounts: accounts || [],
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
