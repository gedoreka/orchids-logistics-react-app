import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const lastId = parseInt(searchParams.get("last_id") || "0");

    let sql = "SELECT * FROM admin_notifications WHERE id > ? ORDER BY created_at DESC LIMIT ?";
    const notifications = await query<any>(sql, [lastId, limit]);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
