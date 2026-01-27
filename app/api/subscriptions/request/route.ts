import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const companyId = session.company_id;
    const body = await request.json();
    const { plan_id, bank_account_id, receipt_image, request_type, notes } = body;

    const plans = await query<any>(`SELECT * FROM subscription_plans WHERE id = ?`, [plan_id]);
    if (plans.length === 0) {
      return NextResponse.json({ success: false, error: "الباقة غير موجودة" }, { status: 404 });
    }

    const plan = plans[0];

    const result = await execute(`
      INSERT INTO payment_requests 
      (company_id, plan_id, bank_account_id, amount, receipt_image, request_type, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      companyId,
      plan_id,
      bank_account_id || null,
      plan.price,
      receipt_image || null,
      request_type || 'renewal',
      notes || null
    ]);

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
      message: "تم إرسال طلب الاشتراك بنجاح. سيتم مراجعته من قبل الإدارة." 
    });
  } catch (error: any) {
    console.error("Error creating subscription request:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
