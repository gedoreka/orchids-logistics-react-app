import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const customers = await query(
      "SELECT * FROM customers WHERE company_id = ? ORDER BY name ASC",
      [companyId]
    );

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, name, email, phone, address, vat_number, commercial_number, contact_person, notes } = body;

    if (!company_id || !name) {
      return NextResponse.json({ error: "Company ID and name are required" }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO customers (company_id, name, email, phone, address, vat_number, commercial_number, contact_person, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [company_id, name, email || null, phone || null, address || null, vat_number || null, commercial_number || null, contact_person || null, notes || null]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
