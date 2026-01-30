import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

interface Customer {
  id: number;
  company_id: number;
  customer_name: string;
  company_name: string;
  commercial_number: string;
  vat_number: string;
  unified_number?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  district?: string;
  street_name?: string;
  postal_code?: string;
  short_address?: string;
  account_id?: number;
  cost_center_id?: number;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const customers = await query<Customer>(
      `SELECT c.*, 
              a.account_name,
              cc.center_name as cost_center_name
       FROM customers c
       LEFT JOIN accounts a ON c.account_id = a.id
       LEFT JOIN cost_centers cc ON c.cost_center_id = cc.id
       WHERE c.company_id = ? 
       ORDER BY c.id DESC`,
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
      is_active = 1
    } = body;

    if (!company_id || !company_name || !commercial_number || !vat_number) {
      return NextResponse.json({ 
        error: "يجب ملء جميع الحقول الإجبارية (اسم المنشأة، السجل التجاري، الرقم الضريبي)" 
      }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO customers (
        company_id, customer_name, company_name, commercial_number, vat_number,
        unified_number, email, phone, country, city, district, street_name,
        postal_code, short_address, account_id, cost_center_id, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        company_id, 
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
        is_active ? 1 : 0
      ]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
