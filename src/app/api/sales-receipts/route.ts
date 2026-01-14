import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

interface SalesReceipt {
  id: number;
  company_id: number;
  client_id: number;
  client_name: string;
  invoice_id: number | null;
  invoice_number: string | null;
  receipt_number: string;
  receipt_date: string;
  amount: number;
  notes: string;
  created_by: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const receipts = await query<SalesReceipt>(
      `SELECT sr.*, c.customer_name as client_name
       FROM sales_receipts sr
       LEFT JOIN customers c ON sr.client_id = c.id
       WHERE sr.company_id = ? 
       ORDER BY sr.id DESC`,
      [companyId]
    );

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Error fetching sales receipts:", error);
    return NextResponse.json({ error: "Failed to fetch sales receipts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      company_id,
      client_id,
      invoice_id,
      receipt_date,
      amount,
      notes = '',
      created_by = 'مدير النظام'
    } = body;

    if (!company_id || !client_id || !amount) {
      return NextResponse.json({ 
        error: "يجب ملء جميع الحقول الإجبارية" 
      }, { status: 400 });
    }

    const customers = await query<any>(
      `SELECT customer_name FROM customers WHERE id = ?`,
      [client_id]
    );
    const client = customers[0];

    if (!client) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    let invoiceNumber = null;
    if (invoice_id) {
      const invoices = await query<any>(
        `SELECT invoice_number FROM sales_invoices WHERE id = ? AND company_id = ?`,
        [invoice_id, company_id]
      );
      if (invoices[0]) {
        invoiceNumber = invoices[0].invoice_number;
      }
    }

    const receiptNumber = 'RCPT' + Math.floor(10000 + Math.random() * 90000);

    const result = await execute(
      `INSERT INTO sales_receipts (
        company_id, client_id, client_name, invoice_id, invoice_number, 
        receipt_number, receipt_date, amount, notes, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        company_id,
        client_id,
        client.customer_name,
        invoice_id || null,
        invoiceNumber,
        receiptNumber,
        receipt_date,
        amount,
        notes,
        created_by
      ]
    );

    return NextResponse.json({ success: true, id: result.insertId, receipt_number: receiptNumber });
  } catch (error) {
    console.error("Error creating sales receipt:", error);
    return NextResponse.json({ error: "Failed to create sales receipt" }, { status: 500 });
  }
}
