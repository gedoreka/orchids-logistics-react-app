import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, address, vat_number, commercial_number, contact_person, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await execute(
      `UPDATE customers SET name = $1, email = $2, phone = $3, address = $4, vat_number = $5, commercial_number = $6, contact_person = $7, notes = $8 WHERE id = $9`,
      [name, email || null, phone || null, address || null, vat_number || null, commercial_number || null, contact_person || null, notes || null, id]
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

    await execute("DELETE FROM customers WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
