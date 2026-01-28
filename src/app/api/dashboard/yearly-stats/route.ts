import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    if (!session.company_id) {
      return NextResponse.json({ error: "No company found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const invoicesResult = await query<{ total: number }>(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM sales_invoices WHERE company_id = ? AND YEAR(issue_date) = ?",
      [session.company_id, year]
    );

    const expensesResult = await query<{ total: number }>(
      "SELECT COALESCE(SUM(amount), 0) as total FROM monthly_expenses WHERE company_id = ? AND YEAR(expense_date) = ?",
      [session.company_id, year]
    );

    return NextResponse.json({
      total_invoices_amount: parseFloat(invoicesResult[0]?.total as unknown as string) || 0,
      yearly_expenses: parseFloat(expensesResult[0]?.total as unknown as string) || 0,
      year
    });
  } catch (error) {
    console.error("Error fetching yearly stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
