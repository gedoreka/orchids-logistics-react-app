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

    const receipts = await query<any>(
      `SELECT sr.*, c.customer_name, c.vat_number as client_vat, c.short_address as client_address,
              c.phone as client_phone, c.email as client_email
       FROM sales_receipts sr
       LEFT JOIN customers c ON sr.client_id = c.id
       WHERE sr.id = ?`,
      [id]
    );

    if (receipts.length === 0) {
      return NextResponse.json({ error: "سند المبيعات غير موجود" }, { status: 404 });
    }

    return NextResponse.json(receipts[0]);
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

    await execute(`DELETE FROM sales_receipts WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sales receipt:", error);
    return NextResponse.json({ error: "Failed to delete sales receipt" }, { status: 500 });
  }
}
