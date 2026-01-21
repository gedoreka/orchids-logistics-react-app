import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { generateZatcaQR } from "@/lib/zatca-qr";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const receipts = await query<any>(
      `SELECT sr.*, 
       CASE WHEN sr.use_custom_client = 1 THEN sr.client_name ELSE c.customer_name END as client_name
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
      use_custom_client,
      client_name: custom_client_name,
      client_vat,
      client_commercial_number,
      client_address,
      invoice_id,
      receipt_date,
      items = [],
      subtotal,
      tax_amount,
      total_amount,
      notes = '',
      created_by = 'مدير النظام'
    } = body;

    if (!company_id || (!client_id && !use_custom_client)) {
      return NextResponse.json({ 
        error: "يجب ملء جميع الحقول الإجبارية" 
      }, { status: 400 });
    }

    let finalClientName = custom_client_name;
    if (!use_custom_client && client_id) {
      const customers = await query<any>(
        `SELECT customer_name FROM customers WHERE id = ?`,
        [client_id]
      );
      if (customers[0]) {
        finalClientName = customers[0].customer_name;
      }
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

    // Fetch company info for ZATCA QR
    const companies = await query<any>(
      `SELECT name, vat_number FROM companies WHERE id = ?`,
      [company_id]
    );
    const company = companies[0];

    let zatcaQr = null;
    if (company && company.vat_number) {
      const timestamp = new Date(receipt_date + 'T' + new Date().toLocaleTimeString('en-GB')).toISOString();
      zatcaQr = generateZatcaQR(
        company.name,
        company.vat_number,
        timestamp,
        total_amount,
        tax_amount
      );
    }

    const receiptNumber = 'RCPT' + Math.floor(10000 + Math.random() * 90000);

    const result = await execute(
      `INSERT INTO sales_receipts (
        company_id, client_id, client_name, client_vat, client_commercial_number, 
        client_address, use_custom_client, invoice_number, 
        receipt_number, receipt_date, amount, subtotal, tax_amount, total_amount,
        zatca_qr, notes, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        company_id,
        use_custom_client ? null : client_id,
        finalClientName,
        client_vat,
        client_commercial_number,
        client_address,
        use_custom_client ? 1 : 0,
        invoiceNumber,
        receiptNumber,
        receipt_date,
        total_amount,
        subtotal,
        tax_amount,
        total_amount,
        zatcaQr,
        notes,
        created_by
      ]
    );

    const receiptId = result.insertId;

    // Insert items
    if (items && items.length > 0) {
      for (const item of items) {
        await execute(
          `INSERT INTO sales_receipt_items (
            receipt_id, product_name, product_desc, quantity, unit_price, 
            vat_rate, vat_amount, total_with_vat
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            receiptId,
            item.product_name,
            item.product_desc || '',
            item.quantity,
            item.unit_price,
            item.vat_rate || 15,
            item.vat_amount,
            item.total_with_vat
          ]
        );
      }
    }

    return NextResponse.json({ success: true, id: receiptId, receipt_number: receiptNumber });
  } catch (error) {
    console.error("Error creating sales receipt:", error);
    return NextResponse.json({ error: "Failed to create sales receipt" }, { status: 500 });
  }
}
