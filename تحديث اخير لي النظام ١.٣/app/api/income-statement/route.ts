import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from_date") || new Date().getFullYear() + "-01-01";
    const toDate = searchParams.get("to_date") || new Date().toISOString().split("T")[0];

    // 1. Fetch journal entries for revenue and expense accounts
    // We filter by account type: 'ايراد' or 'مصروف'
    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select("*, accounts:account_id(id, account_code, account_name, type), cost_centers:cost_center_id(id, center_code, center_name)")
      .eq("company_id", companyId)
      .gte("entry_date", fromDate)
      .lte("entry_date", toDate);

    if (error) throw error;

    const revenues: Record<number, any> = {};
    const expenses: Record<number, any> = {};

    entries?.forEach(entry => {
      const acc = entry.accounts;
      if (!acc) return;

      if (acc.type === 'ايراد') {
        if (!revenues[acc.id]) {
          revenues[acc.id] = { 
            account_id: acc.id, 
            account_code: acc.account_code, 
            account_name: acc.account_name, 
            net_amount: 0,
            by_center: {} 
          };
        }
        const amount = (Number(entry.credit) || 0) - (Number(entry.debit) || 0);
        revenues[acc.id].net_amount += amount;
        
        if (entry.cost_center_id) {
          const cc = entry.cost_centers;
          if (!revenues[acc.id].by_center[entry.cost_center_id]) {
            revenues[acc.id].by_center[entry.cost_center_id] = { name: cc?.center_name || "Unknown", amount: 0 };
          }
          revenues[acc.id].by_center[entry.cost_center_id].amount += amount;
        }
      } else if (acc.type === 'مصروف') {
        if (!expenses[acc.id]) {
          expenses[acc.id] = { 
            account_id: acc.id, 
            account_code: acc.account_code, 
            account_name: acc.account_name, 
            net_amount: 0,
            by_center: {} 
          };
        }
        const amount = (Number(entry.debit) || 0) - (Number(entry.credit) || 0);
        expenses[acc.id].net_amount += amount;

        if (entry.cost_center_id) {
          const cc = entry.cost_centers;
          if (!expenses[acc.id].by_center[entry.cost_center_id]) {
            expenses[acc.id].by_center[entry.cost_center_id] = { name: cc?.center_name || "Unknown", amount: 0 };
          }
          expenses[acc.id].by_center[entry.cost_center_id].amount += amount;
        }
      }
    });

    const revenueList = Object.values(revenues).filter(r => Math.abs(r.net_amount) > 0.01);
    const expenseList = Object.values(expenses).filter(e => Math.abs(e.net_amount) > 0.01);

    const totalRevenue = revenueList.reduce((sum, r) => sum + r.net_amount, 0);
    const totalExpenses = expenseList.reduce((sum, e) => sum + e.net_amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return NextResponse.json({
      revenues: revenueList,
      expenses: expenseList,
      stats: {
        totalRevenue,
        totalExpenses,
        netProfit,
        isProfit: netProfit >= 0,
      },
      period: { fromDate, toDate }
    });
  } catch (error) {
    console.error("Income Statement API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
