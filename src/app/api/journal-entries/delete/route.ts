import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entry_number = searchParams.get("entry_number");
    const company_id = searchParams.get("company_id");

    if (!entry_number || !company_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("entry_number", entry_number)
      .eq("company_id", company_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
