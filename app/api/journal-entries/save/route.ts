import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry_number, entry_date, lines, company_id, created_by, is_edit } = body;

    if (!entry_number || !entry_date || !lines || !company_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate balance
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: "Debit and Credit must be equal" }, { status:400 });
    }

    // If edit, delete old lines first
    if (is_edit) {
      const { error: deleteError } = await supabase
        .from("journal_entries")
        .delete()
        .eq("entry_number", entry_number)
        .eq("company_id", company_id);

      if (deleteError) throw deleteError;
    }

    // Insert new lines
    const insertData = lines
      .filter((line: any) => (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0) && line.account_id)
      .map((line: any) => ({
        company_id: parseInt(company_id),
        entry_number,
        entry_date,
        account_id: parseInt(line.account_id),
        cost_center_id: line.cost_center_id ? parseInt(line.cost_center_id) : null,
        description: line.description || "",
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        created_by: created_by || "System",
      }));

    if (insertData.length === 0) {
      return NextResponse.json({ error: "No valid lines to save" }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from("journal_entries")
      .insert(insertData);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, entry_number });
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return NextResponse.json(
      { error: "Failed to save journal entry" },
      { status: 500 }
    );
  }
}
