import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("monthly_expenses")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .eq("tax_matching_status", "pending")
      .order("expense_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, expenses: data });
  } catch (error) {
    console.error("Error fetching unmatched expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expense_id, tax_document_id, status } = body;

    if (!expense_id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("monthly_expenses")
      .update({
        tax_document_id,
        tax_matching_status: status || 'matched',
        updated_at: new Date().toISOString()
      })
      .eq("id", expense_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, expense: data });
  } catch (error) {
    console.error("Error matching expense:", error);
    return NextResponse.json({ error: "Failed to match expense" }, { status: 500 });
  }
}
