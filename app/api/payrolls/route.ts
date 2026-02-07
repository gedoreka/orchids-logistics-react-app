import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const payrolls = await query<any>(
      `SELECT p.id, p.payroll_month, p.package_id, p.saved_by, p.created_at, p.is_draft, p.total_amount,
              COUNT(i.id) AS employee_count,
              pkg.group_name as package_name, pkg.work_type
       FROM salary_payrolls p
       LEFT JOIN salary_payroll_items i ON p.id = i.payroll_id
       LEFT JOIN employee_packages pkg ON p.package_id = pkg.id
       WHERE p.company_id = ?
       GROUP BY p.id
       ORDER BY p.id DESC`,
      [companyId]
    );

    return NextResponse.json(payrolls);
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    return NextResponse.json({ error: "Failed to fetch payrolls" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      company_id,
      payroll_month,
      package_id,
      saved_by,
      is_draft = 0,
      items = []
    } = body;

    if (!company_id || !payroll_month || !package_id) {
      return NextResponse.json({ 
        error: "يجب ملء جميع الحقول الإجبارية" 
      }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO salary_payrolls (company_id, payroll_month, package_id, saved_by, is_draft, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [company_id, payroll_month, package_id, saved_by, is_draft]
    );

    const payrollId = result.insertId;

    let totalAmount = 0;

      for (const item of items) {
        const netSalary = parseFloat(item.net_salary || 0);
        if (netSalary >= 0) totalAmount += netSalary;

        await execute(
          `INSERT INTO salary_payroll_items (
            payroll_id, employee_name, iqama_number, user_code, basic_salary,
            target, successful_orders, target_deduction, monthly_bonus,
            operator_deduction, internal_deduction, wallet_deduction,
            internal_bonus, net_salary, payment_method, housing_allowance,
            achieved_tier, tier_bonus, extra_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payrollId,
            item.employee_name || '',
            item.iqama_number || '',
            item.user_code || '',
            item.basic_salary || 0,
            item.target || 0,
            item.successful_orders || 0,
            item.target_deduction || 0,
            item.monthly_bonus || 0,
            item.operator_deduction || 0,
            item.internal_deduction || 0,
            item.wallet_deduction || 0,
            item.internal_bonus || 0,
            item.net_salary || 0,
            item.payment_method || 'مدد',
            item.housing_allowance || 0,
            item.achieved_tier || '',
            item.tier_bonus || 0,
            item.extra_amount || 0
          ]
        );

        if (netSalary < 0) {
          await execute(
            `INSERT INTO salary_debts (company_id, employee_name, iqama_number, month_reference, amount, resolved) 
             VALUES (?, ?, ?, ?, ?, 0)`,
            [company_id, item.employee_name, item.iqama_number, payroll_month, netSalary]
          );
        } else {
          await execute(
            `UPDATE salary_debts SET resolved = 1 WHERE company_id = ? AND iqama_number = ? AND resolved = 0`,
            [company_id, item.iqama_number]
          );
        }
      }

    await execute(
      `UPDATE salary_payrolls SET total_amount = ? WHERE id = ?`,
      [totalAmount, payrollId]
    );

    // --- Auto Journal Entry for Payroll ---
    if (totalAmount > 0 && !is_draft) {
      try {
        const { recordJournalEntry, generateNextEntryNumber, getDefaultAccounts, resolvePaymentAccount } = await import("@/lib/accounting");
        const defaults = await getDefaultAccounts(company_id);
        const salaryAccountId = defaults.salaries;
        const cashAccountId = resolvePaymentAccount(defaults);

        if (salaryAccountId && cashAccountId) {
          const entryNumber = await generateNextEntryNumber(company_id, "PAY");
          await recordJournalEntry({
            entry_date: `${payroll_month}-01`,
            entry_number: entryNumber,
            description: `رواتب شهر ${payroll_month}`,
            company_id,
            created_by: saved_by || "System",
            source_type: "payroll",
            source_id: String(payrollId),
            lines: [
              { account_id: salaryAccountId, debit: totalAmount, credit: 0, description: `رواتب شهر ${payroll_month}` },
              { account_id: cashAccountId, debit: 0, credit: totalAmount, description: `صرف رواتب شهر ${payroll_month}` }
            ]
          });
        }
      } catch (accError) {
        console.error("Error creating auto journal entry for payroll:", accError);
      }
    }

    return NextResponse.json({ success: true, id: payrollId, total_amount: totalAmount });
  } catch (error) {
    console.error("Error creating payroll:", error);
    return NextResponse.json({ error: "Failed to create payroll" }, { status: 500 });
  }
}
