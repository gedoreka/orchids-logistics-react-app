import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    const quotations = await query<any>(
      `SELECT q.*, c.customer_name, c.company_name as client_company, c.vat_number as client_vat_full,
              c.short_address, c.email as client_email, c.phone as client_phone
       FROM quotations q
       LEFT JOIN customers c ON q.client_id = c.id
       WHERE q.id = ?`,
      [id]
    );

    if (quotations.length === 0) {
      return NextResponse.json({ error: "عرض السعر غير موجود" }, { status: 404 });
    }

    const items = await query<any>(
      `SELECT * FROM quotation_items WHERE quotation_id = ?`,
      [id]
    );

    return NextResponse.json({ ...quotations[0], items });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json({ error: "Failed to fetch quotation" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      company_id,
      client_id,
      issue_date,
      due_date,
      status,
      items = []
    } = body;

    const customers = await query<any>(
      `SELECT * FROM customers WHERE id = ?`,
      [client_id]
    );
    const client = customers[0];

    if (!client) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    const vatRate = 15;
    let totalAmount = 0;

    await execute(
      `UPDATE quotations SET 
        client_id = ?, client_name = ?, client_vat = ?, client_address = ?,
        issue_date = ?, due_date = ?, expiry_date = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        client.id,
        client.customer_name || client.company_name,
        client.vat_number,
        client.short_address || '',
        issue_date,
        due_date,
        due_date,
        status,
        id
      ]
    );

    await execute(`DELETE FROM quotation_items WHERE quotation_id = ?`, [id]);

    for (const item of items) {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const total = qty * price;
      const vatAmount = (total * vatRate) / 100;
      const totalWithVat = total + vatAmount;

      totalAmount += totalWithVat;

      await execute(
        `INSERT INTO quotation_items (
          quotation_id, product_name, description, quantity, price, vat_rate, vat_amount, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.product_name,
          item.description || '',
          qty,
          price,
          vatRate,
          vatAmount,
          totalWithVat
        ]
      );
    }

    await execute(
      `UPDATE quotations SET total_amount = ? WHERE id = ?`,
      [totalAmount, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating quotation:", error);
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await execute(`DELETE FROM quotation_items WHERE quotation_id = ?`, [id]);
    await execute(`DELETE FROM quotations WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 });
  }
}
