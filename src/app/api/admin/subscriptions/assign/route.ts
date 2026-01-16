import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

function generateSubscriptionCode() {
  const prefix = 'SUB';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, plan_id, start_date, end_date, assigned_by, notes } = body;

    const plans = await query<any>(`SELECT * FROM subscription_plans WHERE id = ?`, [plan_id]);
    if (plans.length === 0) {
      return NextResponse.json({ success: false, error: "الباقة غير موجودة" }, { status: 404 });
    }

    const plan = plans[0];
    const subscriptionCode = generateSubscriptionCode();

    const subResult = await execute(`
      INSERT INTO company_subscriptions 
      (company_id, plan_id, subscription_code, start_date, end_date, status, amount_paid, is_manual_assignment, assigned_by, notes)
      VALUES (?, ?, ?, ?, ?, 'active', ?, 1, ?, ?)
    `, [
      company_id,
      plan_id,
      subscriptionCode,
      start_date,
      end_date,
      plan.price,
      assigned_by,
      notes || 'تعيين يدوي من المدير'
    ]);

    await execute(`
      UPDATE companies SET 
        current_subscription_id = ?,
        subscription_end_date = ?,
        is_subscription_active = 1
      WHERE id = ?
    `, [subResult.insertId, end_date, company_id]);

    await execute(`
      INSERT INTO payment_requests 
      (company_id, plan_id, amount, status, processed_by, processed_at, subscription_id, request_type, notes)
      VALUES (?, ?, ?, 'approved', ?, NOW(), ?, 'new', 'تعيين يدوي من المدير')
    `, [
      company_id,
      plan_id,
      plan.price,
      assigned_by,
      subResult.insertId
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "تم تعيين الباقة بنجاح",
      subscription_code: subscriptionCode,
      subscription_id: subResult.insertId
    });
  } catch (error: any) {
    console.error("Error assigning plan:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    let sql = `
      SELECT 
        cs.*,
        sp.name as plan_name,
        sp.price as plan_price,
        c.name as company_name
      FROM company_subscriptions cs
      LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
      LEFT JOIN companies c ON cs.company_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (company_id) {
      sql += ` AND cs.company_id = ?`;
      params.push(company_id);
    }

    sql += ` ORDER BY cs.created_at DESC`;

    const subscriptions = await query(sql, params);

    return NextResponse.json({ success: true, subscriptions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
