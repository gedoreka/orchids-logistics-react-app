import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const company_id = searchParams.get("company_id");
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const mode = searchParams.get("mode");
  const package_id = searchParams.get("package_id");

  if (!company_id) {
    return NextResponse.json({ error: "Missing company_id" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      // 1. Fetch Packages
      const packagesRes = await client.query(
        "SELECT id, group_name FROM employee_packages WHERE company_id = $1 AND work_type IN ('commission', 'target')",
        [company_id]
      );

      // 2. Fetch Employees if package_id is provided
      let employees = [];
      if (package_id) {
        const empRes = await client.query(
          "SELECT * FROM employees WHERE company_id = $1 AND package_id = $2",
          [company_id, package_id]
        );
        employees = empRes.rows;
      }

      // 3. Fetch Saved Groups for the month
      const savedGroupsRes = await client.query(
        "SELECT DISTINCT package_id, mode, created_at FROM employee_commissions WHERE company_id = $1 AND month = $2 ORDER BY created_at DESC",
        [company_id, month]
      );

      // 4. Fetch Loaded Commissions if package_id, mode, and month are provided
      let loadedCommissions = [];
      if (package_id && mode) {
        const commRes = await client.query(
          "SELECT * FROM employee_commissions WHERE company_id = $1 AND month = $2 AND package_id = $3 AND mode = $4",
          [company_id, month, package_id, mode]
        );
        loadedCommissions = commRes.rows;
      }

      return NextResponse.json({
        packages: packagesRes.rows,
        employees,
        savedGroups: savedGroupsRes.rows,
        loadedCommissions
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Database error:", error);
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

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Delete existing commissions for this group/month
      await client.query(
        "DELETE FROM employee_commissions WHERE company_id = $1 AND month = $2 AND package_id = $3 AND mode = $4",
        [company_id, month, package_id, mode]
      );

      // Insert new commissions
      for (const comm of commissions) {
        await client.query(
          `INSERT INTO employee_commissions (
            company_id, employee_id, package_id, month, mode, 
            start_date, daily_amount, days, total, 
            percentage, revenue, commission, remaining, 
            deduction, bonus, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            company_id, comm.employee_id, package_id, month, mode,
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

      await client.query("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error: any) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Save error:", error);
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
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(
        "DELETE FROM employee_commissions WHERE company_id = $1 AND month = $2 AND package_id = $3 AND mode = $4",
        [company_id, month, package_id, mode]
      );
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
