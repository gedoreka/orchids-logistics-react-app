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

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const customers = await query(
      `SELECT c.*, 
              a.account_name,
              cc.center_name as cost_center_name
       FROM customers c
       LEFT JOIN accounts a ON c.account_id = a.id
       LEFT JOIN cost_centers cc ON c.cost_center_id = cc.id
       WHERE c.id = ? AND c.company_id = ?`,
      [id, companyId]
    );

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customers[0]);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
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
      customer_name,
      company_name, 
      commercial_number,
      vat_number,
      unified_number,
      email, 
      phone, 
      country,
      city,
      district,
      street_name,
      postal_code,
      short_address,
      account_id,
      cost_center_id,
      is_active
    } = body;

    if (!company_name || !commercial_number || !vat_number) {
      return NextResponse.json({ 
        error: "يجب ملء جميع الحقول الإجبارية" 
      }, { status: 400 });
    }

    await execute(
      `UPDATE customers SET 
        customer_name = ?, 
        company_name = ?, 
        commercial_number = ?,
        vat_number = ?,
        unified_number = ?,
        email = ?, 
        phone = ?, 
        country = ?,
        city = ?,
        district = ?,
        street_name = ?,
        postal_code = ?,
        short_address = ?,
        account_id = ?,
        cost_center_id = ?,
        is_active = ?,
        updated_at = NOW()
       WHERE id = ? AND company_id = ?`,
      [
        customer_name || null, 
        company_name, 
        commercial_number, 
        vat_number,
        unified_number || null,
        email || null, 
        phone || null, 
        country || null,
        city || null,
        district || null,
        street_name || null,
        postal_code || null,
        short_address || null,
        account_id || null,
        cost_center_id || null,
        is_active ? 1 : 0,
        id,
        company_id
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    await execute("DELETE FROM customers WHERE id = ? AND company_id = ?", [id, companyId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
