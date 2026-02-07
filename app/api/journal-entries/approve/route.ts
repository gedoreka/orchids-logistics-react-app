import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry_number, company_id } = body;

    if (!entry_number || !company_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("journal_entries")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("entry_number", entry_number)
      .eq("company_id", company_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving journal entry:", error);
    return NextResponse.json(
      { error: "Failed to approve journal entry" },
      { status: 500 }
    );
  }
}
