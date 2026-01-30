import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

function generateSubscriptionCode() {
  const prefix = 'SUB';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().substring(0, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function calculateEndDate(startDate: Date, durationValue: number, durationUnit: string): Date {
  const endDate = new Date(startDate);
  switch (durationUnit) {
    case 'days':
      endDate.setDate(endDate.getDate() + durationValue);
      break;
    case 'months':
      endDate.setMonth(endDate.getMonth() + durationValue);
      break;
    case 'years':
      endDate.setFullYear(endDate.getFullYear() + durationValue);
      break;
  }
  return endDate;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, rejection_reason, processed_by } = body;

    const requests = await query<any>(
      `SELECT pr.*, sp.duration_value, sp.duration_unit, sp.price, c.name as company_name
       FROM payment_requests pr 
       JOIN subscription_plans sp ON pr.plan_id = sp.id
       JOIN companies c ON pr.company_id = c.id
       WHERE pr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return NextResponse.json({ success: false, error: "طلب الدفع غير موجود" }, { status: 404 });
    }

    const paymentRequest = requests[0];

    if (action === 'approve') {
      const startDate = new Date();
      const endDate = calculateEndDate(startDate, paymentRequest.duration_value, paymentRequest.duration_unit);
      const subscriptionCode = generateSubscriptionCode();

      const subResult = await execute(`
        INSERT INTO company_subscriptions 
        (company_id, plan_id, subscription_code, start_date, end_date, status, amount_paid, payment_method)
        VALUES (?, ?, ?, ?, ?, 'active', ?, 'bank_transfer')
      `, [
        paymentRequest.company_id,
        paymentRequest.plan_id,
        subscriptionCode,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        paymentRequest.amount
      ]);

      await execute(`
        UPDATE companies SET 
          current_subscription_id = ?,
          subscription_end_date = ?,
          is_subscription_active = 1
        WHERE id = ?
      `, [subResult.insertId, endDate.toISOString().split('T')[0], paymentRequest.company_id]);

      await execute(`
        UPDATE payment_requests SET 
          status = 'approved',
          processed_by = ?,
          processed_at = NOW(),
          subscription_id = ?
        WHERE id = ?
      `, [processed_by, subResult.insertId, id]);

      return NextResponse.json({ 
        success: true, 
        message: "تم قبول طلب الدفع وتفعيل الاشتراك",
        subscription_code: subscriptionCode,
        end_date: endDate.toISOString().split('T')[0]
      });

    } else if (action === 'reject') {
      if (!rejection_reason) {
        return NextResponse.json({ success: false, error: "يرجى إدخال سبب الرفض" }, { status: 400 });
      }

      await execute(`
        UPDATE payment_requests SET 
          status = 'rejected',
          rejection_reason = ?,
          processed_by = ?,
          processed_at = NOW()
        WHERE id = ?
      `, [rejection_reason, processed_by, id]);

      return NextResponse.json({ success: true, message: "تم رفض طلب الدفع" });
    }

    return NextResponse.json({ success: false, error: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
