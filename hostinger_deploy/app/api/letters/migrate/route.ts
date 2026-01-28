import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function GET() {
  try {
    // Check if columns exist and add them one by one if missing
    const columns = await execute("SHOW COLUMNS FROM companies");
    const columnNames = (columns as any[]).map(c => c.Field);

    if (!columnNames.includes('letterhead_path')) {
      await execute("ALTER TABLE companies ADD COLUMN letterhead_path VARCHAR(255)");
    }
    if (!columnNames.includes('letterhead_top_margin')) {
      await execute("ALTER TABLE companies ADD COLUMN letterhead_top_margin INT DEFAULT 100");
    }
    if (!columnNames.includes('letterhead_bottom_margin')) {
      await execute("ALTER TABLE companies ADD COLUMN letterhead_bottom_margin INT DEFAULT 100");
    }

    return NextResponse.json({ success: true, message: "Database schema updated successfully" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
