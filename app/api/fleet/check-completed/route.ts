import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    if (!sessionCookie) {
      return NextResponse.json({ completed: [] });
    }
    const session = JSON.parse(sessionCookie.value);

    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since"); // ISO timestamp

    if (!since) {
      return NextResponse.json({ completed: [] });
    }

    const rows = await query<any>(
      `SELECT m.id, m.maintenance_type, m.maintenance_person, m.confirmed_at, m.status,
              v.plate_number_ar, v.brand, v.model
       FROM maintenance_requests m
       LEFT JOIN vehicles v ON m.vehicle_id = v.id
       WHERE m.company_id = ? AND m.status = 'completed' AND m.confirmed_at >= ?
       ORDER BY m.confirmed_at DESC
       LIMIT 5`,
      [session.company_id, since]
    );

    return NextResponse.json({ completed: rows || [] });
  } catch {
    return NextResponse.json({ completed: [] });
  }
}
