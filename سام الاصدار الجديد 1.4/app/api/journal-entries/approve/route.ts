import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

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

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await execute(
      `UPDATE journal_entries SET status = 'approved', updated_at = ? WHERE entry_number = ? AND company_id = ?`,
      [now, entry_number, company_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error approving journal entry:", error);
    return NextResponse.json(
      { error: "Failed to approve journal entry" },
      { status: 500 }
    );
  }
}
