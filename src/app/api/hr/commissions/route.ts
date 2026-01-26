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
      `SELECT 
        package_id, 
        mode, 
        serial_number,
        MAX(status) as status,
        MAX(created_at) as created_at,
        COUNT(*) as employee_count,
        SUM(CASE 
          WHEN mode LIKE 'fixed%' THEN total 
          ELSE commission 
        END + bonus - deduction) as total_amount
      FROM employee_commissions 
      WHERE company_id = ? AND month = ? 
      GROUP BY package_id, mode, serial_number 
      ORDER BY serial_number ASC, created_at DESC`,
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

    // Determine the serial number
    const existing = await query(
      "SELECT serial_number FROM employee_commissions WHERE company_id = ? AND month = ? AND package_id = ? AND mode = ? LIMIT 1",
      [company_id, month, package_id, mode]
    );

    let serial_number = existing.length > 0 ? existing[0].serial_number : null;

    if (!serial_number) {
      const lastSerial = await query(
        "SELECT MAX(serial_number) as max_sn FROM employee_commissions WHERE company_id = ? AND month = ?",
        [company_id, month]
      );
      serial_number = (lastSerial[0]?.max_sn || 0) + 1;
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
        (company_id, employee_id, package_id, month, mode, start_date, daily_amount, days, total, percentage, revenue, commission, remaining, deduction, bonus, status, serial_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          comm.status || 'unpaid',
          serial_number
        ]
      );
    }

    return NextResponse.json({ success: true, serial_number });
  } catch (error: any) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_id, month, package_id, mode, status, employee_commission_id } = body;

    if (employee_commission_id) {
      // Individual update
      await execute(
        "UPDATE employee_commissions SET status = ? WHERE id = ?",
        [status, employee_commission_id]
      );
    } else {
      // Group update
      if (!company_id || !month || !package_id || !mode || !status) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      await execute(
        "UPDATE employee_commissions SET status = ? WHERE company_id = ? AND month = ? AND package_id = ? AND mode = ?",
        [status, company_id, month, package_id, mode]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
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
