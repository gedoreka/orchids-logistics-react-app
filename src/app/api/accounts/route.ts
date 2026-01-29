import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const accounts = await query(
      `SELECT id, account_code, account_name, type, company_id, created_at 
       FROM accounts 
       WHERE company_id = ? 
       ORDER BY created_at DESC`,
      [companyId]
    );

    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_code, account_name, type, company_id } = body;

    if (!account_code || !account_name || !type || !company_id) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await query(
      "SELECT id FROM accounts WHERE account_code = ? AND company_id = ?",
      [account_code, company_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "رمز الحساب موجود مسبقاً" }, { status: 400 });
    }

    await query(
      "INSERT INTO accounts (account_code, account_name, type, company_id) VALUES (?, ?, ?, ?)",
      [account_code, account_name, type, company_id]
    );

    return NextResponse.json({ success: true, message: "تم إضافة الحساب بنجاح" });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
