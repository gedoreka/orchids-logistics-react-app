import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const userId = searchParams.get("user_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    // 1. Fetch Accounts
    const accounts = await query(
      "SELECT id, account_code, account_name, account_level, parent_account FROM accounts WHERE company_id = ? ORDER BY account_code",
      [companyId]
    );

    // 2. Fetch Cost Centers
    const costCenters = await query(
      "SELECT id, center_code, center_name FROM cost_centers WHERE company_id = ? ORDER BY center_code",
      [companyId]
    );

    // 3. Fetch Subtypes (Including system defaults from company_id=1)
    const subtypes = await query(
      `SELECT DISTINCT main_type, subtype_name 
       FROM expense_subtypes 
       WHERE (company_id = ? OR (is_custom = FALSE AND company_id = 1))
       AND (is_custom = FALSE OR added_by = ? OR company_id = 1)
       ORDER BY main_type, subtype_name`,
      [companyId, userId]
    );

    // 4. Fetch Employees
    const employees = await query(
      `SELECT id, name, iqama_number, phone, package_id
       FROM employees 
       WHERE company_id = ? AND is_active = 1
       ORDER BY name`,
      [companyId]
    );

    // 5. Fetch Last ID for Voucher Number
    const lastExpense = await query<{ max_id: number }>(
      "SELECT MAX(id) as max_id FROM monthly_expenses WHERE company_id = ?",
      [companyId]
    );
    const voucherNumber = (lastExpense[0]?.max_id || 0) + 1;

    return NextResponse.json({
      accounts,
      costCenters,
      subtypes,
      employees,
      voucherNumber
    });
  } catch (error) {
    console.error("Error fetching expense metadata:", error);
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
