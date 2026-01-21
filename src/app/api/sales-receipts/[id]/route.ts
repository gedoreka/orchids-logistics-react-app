import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const receipts = await query<any>(
      `SELECT sr.*, c.customer_name as system_client_name, c.vat_number as system_client_vat, 
              c.short_address as system_client_address, c.phone as system_client_phone, 
              c.email as system_client_email
       FROM sales_receipts sr
       LEFT JOIN customers c ON sr.client_id = c.id
       WHERE sr.id = ?`,
      [id]
    );

    if (receipts.length === 0) {
      return NextResponse.json({ error: "سند المبيعات غير موجود" }, { status: 404 });
    }

    const receipt = receipts[0];

    // Fetch items
    const items = await query<any>(
      `SELECT * FROM sales_receipt_items WHERE receipt_id = ?`,
      [id]
    );

    // Normalize customer data
    const finalData = {
      ...receipt,
      client_name: receipt.use_custom_client ? receipt.client_name : (receipt.system_client_name || receipt.client_name),
      client_vat: receipt.use_custom_client ? receipt.client_vat : receipt.system_client_vat,
      client_address: receipt.use_custom_client ? receipt.client_address : receipt.system_client_address,
      items: items
    };

    return NextResponse.json(finalData);
  } catch (error) {
    console.error("Error fetching sales receipt:", error);
    return NextResponse.json({ error: "Failed to fetch sales receipt" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await execute(`DELETE FROM sales_receipt_items WHERE receipt_id = ?`, [id]);
    await execute(`DELETE FROM sales_receipts WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sales receipt:", error);
    return NextResponse.json({ error: "Failed to delete sales receipt" }, { status: 500 });
  }
}
