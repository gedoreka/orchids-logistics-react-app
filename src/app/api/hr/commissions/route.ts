import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company_id = searchParams.get("company_id");
  const month = searchParams.get("month");
  const package_id = searchParams.get("package_id");
  const mode = searchParams.get("mode");

  if (!company_id) {
    return NextResponse.json({ error: "Missing company_id" }, { status: 400 });
  }

  try {
    // 1. Fetch Packages
    const packages = await query(
      "SELECT id, group_name, work_type FROM employee_packages WHERE company_id = ? AND work_type IN ('commission', 'target')",
      [company_id]
    );

    // 2. Fetch Saved Commission Groups for the month
    const savedGroups = await query(
      "SELECT DISTINCT package_id, mode, MAX(created_at) as created_at FROM employee_commissions WHERE company_id = ? AND month = ? GROUP BY package_id, mode ORDER BY created_at DESC",
      [company_id, month]
    );

    // 3. Fetch Employees for a specific package if provided
    let employees: any[] = [];
    if (package_id) {
      employees = await query(
        "SELECT id, name, iqama_number, nationality, phone, user_code FROM employees WHERE company_id = ? AND package_id = ?",
        [company_id, package_id]
      );
    }

    // 4. Fetch Loaded Commissions for a specific group if filters are provided
    let loadedCommissions: any[] = [];
    if (package_id && mode && month) {
      loadedCommissions = await query(
        "SELECT * FROM employee_commissions WHERE company_id = ? AND month = ? AND package_id = ? AND mode = ?",
        [company_id, month, package_id, mode]
      );
    }

    return NextResponse.json({
      packages,
      savedGroups,
      employees,
      loadedCommissions
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_id, month, mode, package_id, commissions } = body;

    if (!company_id || !month || !mode || !package_id || !commissions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // First, delete existing entries for this specific group to update
    await execute(
      "DELETE FROM employee_commissions WHERE company_id = ? AND month = ? AND package_id = ? AND mode = ?",
      [company_id, month, package_id, mode]
    );

    // Insert new entries
    for (const comm of commissions) {
      await execute(
        `INSERT INTO employee_commissions 
        (company_id, employee_id, package_id, month, mode, start_date, daily_amount, days, total, percentage, revenue, commission, remaining, deduction, bonus, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company_id,
          comm.employee_id,
          package_id,
          month,
          mode,
          comm.start_date || null,
          comm.daily_amount || 0,
          comm.days || 0,
          comm.total || 0,
          comm.percentage || 0,
          comm.revenue || 0,
          comm.commission || 0,
          comm.remaining || 0,
          comm.deduction || 0,
          comm.bonus || 0,
          comm.status || 'unpaid'
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company_id = searchParams.get("company_id");
  const month = searchParams.get("month");
  const package_id = searchParams.get("package_id");
  const mode = searchParams.get("mode");

  if (!company_id || !month || !package_id || !mode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await execute(
      "DELETE FROM employee_commissions WHERE company_id = ? AND month = ? AND package_id = ? AND mode = ?",
      [company_id, month, package_id, mode]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
