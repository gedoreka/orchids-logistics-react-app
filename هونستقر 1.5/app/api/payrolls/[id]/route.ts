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

    const payrolls = await query<any>(
      `SELECT p.*, pkg.group_name as package_name, pkg.work_type, pkg.monthly_target, pkg.bonus_after_target
       FROM salary_payrolls p
       LEFT JOIN employee_packages pkg ON p.package_id = pkg.id
       WHERE p.id = ?`,
      [id]
    );

    if (payrolls.length === 0) {
      return NextResponse.json({ error: "المسير غير موجود" }, { status: 404 });
    }

    const items = await query<any>(
      `SELECT * FROM salary_payroll_items WHERE payroll_id = ?`,
      [id]
    );

    let totalNet = 0;
    items.forEach((item: any) => {
      if (item.net_salary >= 0) {
        totalNet += parseFloat(item.net_salary || 0);
      }
    });

    return NextResponse.json({ ...payrolls[0], items, total_net: totalNet });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { items = [] } = body;

    let totalAmount = 0;

    for (const item of items) {
      const netSalary = parseFloat(item.net_salary || 0);
      if (netSalary >= 0) totalAmount += netSalary;

      await execute(
        `UPDATE salary_payroll_items SET 
          successful_orders = ?,
          target_deduction = ?,
          monthly_bonus = ?,
          operator_deduction = ?,
          internal_deduction = ?,
          wallet_deduction = ?,
          internal_bonus = ?,
          net_salary = ?,
          payment_method = ?,
          achieved_tier = ?,
          tier_bonus = ?,
          extra_amount = ?
         WHERE id = ? AND payroll_id = ?`,
        [
          item.successful_orders || 0,
          item.target_deduction || 0,
          item.monthly_bonus || 0,
          item.operator_deduction || 0,
          item.internal_deduction || 0,
          item.wallet_deduction || 0,
          item.internal_bonus || 0,
          item.net_salary || 0,
          item.payment_method || 'مدد',
          item.achieved_tier || '',
          item.tier_bonus || 0,
          item.extra_amount || 0,
          item.id,
          id
        ]
      );
    }

    await execute(
      `UPDATE salary_payrolls SET total_amount = ? WHERE id = ?`,
      [totalAmount, id]
    );

    return NextResponse.json({ success: true, total_amount: totalAmount });
  } catch (error) {
    console.error("Error updating payroll:", error);
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await execute(`DELETE FROM salary_payroll_items WHERE payroll_id = ?`, [id]);
    await execute(`DELETE FROM salary_payrolls WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payroll:", error);
    return NextResponse.json({ error: "Failed to delete payroll" }, { status: 500 });
  }
}
