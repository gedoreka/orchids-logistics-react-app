import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import Stripe from "stripe";

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
    const { plan_id, request_type } = body;

    // Get the plan
    const plans = await query<any>(`SELECT * FROM subscription_plans WHERE id = ?`, [plan_id]);
    if (plans.length === 0) {
      return NextResponse.json({ success: false, error: "الباقة غير موجودة" }, { status: 404 });
    }

    const plan = plans[0];
    const price = parseFloat(plan.price);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripe = new Stripe(stripeSecretKey!, { apiVersion: "2025-01-27.acacia" as any });

    // Get company info
    const companies = await query<any>(`SELECT * FROM companies WHERE id = ?`, [companyId]);
    const company = companies[0];

    // Create a PaymentIntent (embedded, no redirect)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100), // halalah
      currency: "sar",
      description: `${plan.name} - ${plan.duration_value} ${plan.duration_unit === 'days' ? 'يوم' : plan.duration_unit === 'months' ? 'شهر' : 'سنة'}`,
      metadata: {
        company_id: String(companyId),
        plan_id: String(plan_id),
        plan_name: plan.name,
        request_type: request_type || "new",
      },
      receipt_email: company?.email || session.email || undefined,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create a payment request record for tracking
    await query(
      `INSERT INTO payment_requests 
       (company_id, plan_id, bank_account_id, amount, receipt_image, request_type, notes, status)
       VALUES (?, ?, NULL, ?, ?, ?, ?, 'pending')`,
      [
        companyId,
        plan_id,
        price,
        `stripe_pi:${paymentIntent.id}`,
        request_type || "new",
        `Stripe Payment - PaymentIntent: ${paymentIntent.id}`,
      ]
    );

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
