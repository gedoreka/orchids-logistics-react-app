import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
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
    const { payment_intent_id } = body;

    if (!payment_intent_id) {
      return NextResponse.json({ success: false, error: "Missing payment_intent_id" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" as any });

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === "succeeded") {
      const metadata = paymentIntent.metadata;

      if (metadata?.plan_id) {
        const planId = parseInt(metadata.plan_id);
        const plans = await query<any>(`SELECT * FROM subscription_plans WHERE id = ?`, [planId]);

        if (plans.length > 0) {
          const plan = plans[0];

          // Calculate subscription end date
          let endDate = new Date();
          if (plan.duration_unit === "days") {
            endDate.setDate(endDate.getDate() + plan.duration_value);
          } else if (plan.duration_unit === "months") {
            endDate.setMonth(endDate.getMonth() + plan.duration_value);
          } else if (plan.duration_unit === "years") {
            endDate.setFullYear(endDate.getFullYear() + plan.duration_value);
          }

          const endDateStr = endDate.toISOString().split("T")[0];

          // Check if already activated
          const existing = await query<any>(
            `SELECT id FROM company_subscriptions WHERE company_id = ? AND status = 'active' AND plan_id = ? AND start_date = CURDATE()`,
            [companyId, planId]
          );

          if (existing.length === 0) {
            // Create subscription
            try {
              await execute(
                `INSERT INTO company_subscriptions (company_id, plan_id, start_date, end_date, status, payment_method)
                 VALUES (?, ?, CURDATE(), ?, 'active', 'stripe')`,
                [companyId, planId, endDateStr]
              );
            } catch {
              await execute(
                `INSERT INTO company_subscriptions (company_id, plan_id, start_date, end_date, status)
                 VALUES (?, ?, CURDATE(), ?, 'active')`,
                [companyId, planId, endDateStr]
              );
            }

            // Update company
            await execute(
              `UPDATE companies SET 
                is_subscription_active = 1,
                subscription_end_date = ?,
                current_subscription_id = ?
              WHERE id = ?`,
              [endDateStr, planId, companyId]
            );

            // Update payment request
            await execute(
              `UPDATE payment_requests SET status = 'approved' 
               WHERE company_id = ? AND receipt_image LIKE ?`,
              [companyId, `stripe_pi:${payment_intent_id}`]
            );
          }

          return NextResponse.json({
            success: true,
            message: "تم تفعيل الاشتراك بنجاح",
            plan_name: plan.name,
            end_date: endDateStr,
          });
        }
      }
    }

    return NextResponse.json({
      success: false,
      error: "الدفع لم يكتمل بعد",
      status: paymentIntent.status,
    });
  } catch (error: any) {
    console.error("Stripe verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
