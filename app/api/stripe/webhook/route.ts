import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" as any });

    let event: Stripe.Event;

    // If webhook secret is configured, verify signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata?.company_id && metadata?.plan_id) {
        const companyId = parseInt(metadata.company_id);
        const planId = parseInt(metadata.plan_id);

        // Get the plan details
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

            // Create/update subscription
            try {
              await execute(
                `INSERT INTO company_subscriptions (company_id, plan_id, start_date, end_date, status, payment_method)
                 VALUES (?, ?, CURDATE(), ?, 'active', 'stripe')`,
                [companyId, planId, endDateStr]
              );
            } catch {
              // Fallback if payment_method column doesn't exist
              await execute(
                `INSERT INTO company_subscriptions (company_id, plan_id, start_date, end_date, status)
                 VALUES (?, ?, CURDATE(), ?, 'active')`,
                [companyId, planId, endDateStr]
              );
            }

          // Update company subscription status
          await execute(
            `UPDATE companies SET 
              is_subscription_active = 1,
              subscription_end_date = ?,
              current_subscription_id = ?
            WHERE id = ?`,
            [endDateStr, planId, companyId]
          );

          // Update payment request status
          await execute(
            `UPDATE payment_requests SET status = 'approved' 
             WHERE company_id = ? AND receipt_image LIKE ?`,
            [companyId, `stripe_session:${session.id}`]
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
