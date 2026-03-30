import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const company_id = searchParams.get('company_id');

    let sql = `
      SELECT 
        pr.*,
        c.name as company_name,
        sp.name as plan_name,
        sp.price as plan_price,
        ba.bank_name,
        u.name as processed_by_name
      FROM payment_requests pr
      LEFT JOIN companies c ON pr.company_id = c.id
      LEFT JOIN subscription_plans sp ON pr.plan_id = sp.id
      LEFT JOIN admin_bank_accounts ba ON pr.bank_account_id = ba.id
      LEFT JOIN users u ON pr.processed_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ` AND pr.status = ?`;
      params.push(status);
    }

    if (company_id) {
      sql += ` AND pr.company_id = ?`;
      params.push(company_id);
    }

    sql += ` ORDER BY pr.created_at DESC`;

    const requests = await query(sql, params);

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, plan_id, bank_account_id, amount, receipt_image, request_type, notes } = body;

    const result = await execute(`
      INSERT INTO payment_requests 
      (company_id, plan_id, bank_account_id, amount, receipt_image, request_type, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      company_id,
      plan_id,
      bank_account_id || null,
      amount,
      receipt_image || null,
      request_type || 'new',
      notes || null
    ]);

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
      message: "تم إرسال طلب الدفع بنجاح" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
