import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

interface Quotation {
  id: number;
  company_id: number;
  quotation_number: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  client_commercial_number: string;
  client_address: string;
  use_custom_client: number;
  issue_date: string;
  due_date: string;
  expiry_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface QuotationItem {
  id: number;
  quotation_id: number;
  product_name: string;
  description: string;
  quantity: number;
  price: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const quotations = await query<Quotation>(
      `SELECT q.*, 
              COALESCE(q.client_name, c.customer_name, c.company_name) as client_name, 
              COALESCE(q.client_commercial_number, q.client_vat, c.vat_number) as client_vat
       FROM quotations q
       LEFT JOIN customers c ON q.client_id = c.id
       WHERE q.company_id = ? 
       ORDER BY q.id DESC`,
      [companyId]
    );

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      company_id,
      quotation_number,
      client_id,
      client_name,
      client_commercial_number,
      client_address,
      use_custom_client = 0,
      issue_date,
      due_date,
      status = 'draft',
      items = []
    } = body;

    if (!company_id || !quotation_number) {
      return NextResponse.json({ 
        error: "يجب ملء جميع الحقول الإجبارية" 
      }, { status: 400 });
    }

    if (!use_custom_client && !client_id) {
      return NextResponse.json({ 
        error: "يرجى اختيار العميل" 
      }, { status: 400 });
    }

    if (use_custom_client && !client_name) {
      return NextResponse.json({ 
        error: "يرجى إدخال اسم العميل" 
      }, { status: 400 });
    }

    let finalClientName = client_name;
    let finalClientCommercial = client_commercial_number || '';
    let finalClientAddress = client_address || '';

    if (!use_custom_client && client_id) {
      const customers = await query<any>(
        `SELECT * FROM customers WHERE id = ?`,
        [client_id]
      );
      const client = customers[0];

      if (!client) {
        return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
      }

      finalClientName = client.customer_name || client.company_name;
      finalClientCommercial = client.vat_number || '';
      finalClientAddress = client.short_address || client.address || '';
    }

    const vatRate = 15;
    let totalAmount = 0;

    const result = await execute(
      `INSERT INTO quotations (
        company_id, quotation_number, client_id, client_name, client_vat, client_commercial_number, client_address, use_custom_client,
        issue_date, due_date, expiry_date, total_amount, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        company_id,
        quotation_number,
        use_custom_client ? null : client_id,
        finalClientName,
        finalClientCommercial,
        finalClientCommercial,
        finalClientAddress,
        use_custom_client ? 1 : 0,
        issue_date,
        due_date,
        due_date,
        0,
        status
      ]
    );

    const quotationId = result.insertId;

    for (const item of items) {
      const qty = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const total = qty * unitPrice;
      const vatAmount = (total * vatRate) / 100;
      const totalWithVat = total + vatAmount;

      totalAmount += totalWithVat;

      await execute(
        `INSERT INTO quotation_items (
          quotation_id, product_name, description, quantity, price, vat_rate, vat_amount, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotationId,
          item.product_name,
          '',
          qty,
          unitPrice,
          vatRate,
          vatAmount,
          totalWithVat
        ]
      );
    }

    await execute(
      `UPDATE quotations SET total_amount = ? WHERE id = ?`,
      [totalAmount, quotationId]
    );

    return NextResponse.json({ success: true, id: quotationId });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}
