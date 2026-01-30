import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const accounts = await query(
      "SELECT id, account_code, account_name, type, company_id, parent_id, account_type, created_at FROM accounts WHERE id = ?",
      [id]
    );

    if (accounts.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, account: accounts[0] });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { account_code, account_name, type, company_id, parent_id, account_type } = body;

    if (!account_code || !account_name || !type) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await query(
      "SELECT id FROM accounts WHERE account_code = ? AND company_id = ? AND id != ?",
      [account_code, company_id, id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "رمز الحساب موجود مسبقاً لحساب آخر" }, { status: 400 });
    }

    await query(
      "UPDATE accounts SET account_code = ?, account_name = ?, type = ?, parent_id = ?, account_type = ? WHERE id = ?",
      [account_code, account_name, type, parent_id || null, account_type || 'sub', id]
    );

    return NextResponse.json({ success: true, message: "تم تعديل الحساب بنجاح" });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if it has children
    const children = await query("SELECT COUNT(*) as count FROM accounts WHERE parent_id = ?", [id]);
    if (Number(children[0]?.count || 0) > 0) {
      return NextResponse.json({ 
        error: "لا يمكن حذف هذا الحساب لأنه يحتوي على حسابات فرعية" 
      }, { status: 400 });
    }

    const linkedExpenses = await query(
      "SELECT COUNT(*) as count FROM monthly_expenses WHERE account_id = ?",
      [id]
    );

    const linkedDeductions = await query(
      "SELECT COUNT(*) as count FROM monthly_deductions WHERE account_id = ?",
      [id]
    );

    const expenseCount = Number(linkedExpenses[0]?.count || 0);
    const deductionCount = Number(linkedDeductions[0]?.count || 0);

    if (expenseCount > 0 || deductionCount > 0) {
      return NextResponse.json({ 
        error: "لا يمكن حذف هذا الحساب لأنه مرتبط بمصروفات أو استقطاعات" 
      }, { status: 400 });
    }

    await query("DELETE FROM accounts WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "تم حذف الحساب بنجاح" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
