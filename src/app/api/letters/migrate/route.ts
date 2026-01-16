import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function GET() {
  try {
    // Add columns to companies table if they don't exist
    await execute(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS letterhead_path VARCHAR(255),
      ADD COLUMN IF NOT EXISTS letterhead_top_margin INT DEFAULT 100,
      ADD COLUMN IF NOT EXISTS letterhead_bottom_margin INT DEFAULT 100
    `);

    return NextResponse.json({ success: true, message: "Database schema updated successfully" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
