import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    const plans = await query(`
      SELECT * FROM subscription_plans 
      WHERE is_active = 1 
      ORDER BY sort_order ASC
    `);

    const bankAccounts = await query(`
      SELECT * FROM admin_bank_accounts 
      WHERE is_active = 1 
      ORDER BY sort_order ASC
    `);

    const currentSubscription = await query(`
      SELECT cs.*, sp.name as plan_name, sp.price as plan_price
      FROM company_subscriptions cs
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE cs.company_id = ? AND cs.status = 'active'
      ORDER BY cs.end_date DESC
      LIMIT 1
    `, [companyId]);

    const paymentHistory = await query(`
      SELECT pr.*, sp.name as plan_name
      FROM payment_requests pr
      JOIN subscription_plans sp ON pr.plan_id = sp.id
      WHERE pr.company_id = ?
      ORDER BY pr.created_at DESC
      LIMIT 10
    `, [companyId]);

    const company = await query(`
      SELECT subscription_end_date, is_subscription_active, current_subscription_id
      FROM companies WHERE id = ?
    `, [companyId]);

    return NextResponse.json({
      success: true,
      plans: plans.map((p: any) => ({ ...p, price: parseFloat(p.price) || 0 })),
      bankAccounts,
      currentSubscription: currentSubscription[0] || null,
      paymentHistory: paymentHistory.map((p: any) => ({
        ...p,
        amount: parseFloat(p.amount) || 0,
        created_at: p.created_at ? new Date(p.created_at).toISOString() : null
      })),
      companySubscription: company[0] || null
    });
  } catch (error: any) {
    console.error("Error fetching subscription data:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
