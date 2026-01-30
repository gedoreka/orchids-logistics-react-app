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

    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const toDate = searchParams.get("to_date") || new Date().toISOString().split("T")[0];

    // 1. Fetch all accounts with their opening balances
    const { data: accounts, error: accError } = await supabase
      .from("accounts")
      .select("id, account_code, account_name, type, opening_balance, balance_type")
      .eq("company_id", companyId)
      .order("account_code");

    if (accError) throw accError;

    // 2. Fetch all journal entries up to toDate
    const { data: journalEntries, error: jeError } = await supabase
      .from("journal_entries")
      .select("account_id, debit, credit")
      .eq("company_id", companyId)
      .lte("entry_date", toDate);

    if (jeError) throw jeError;

    // 3. Aggregate journal entries
    const jeTotals: Record<number, { debit: number, credit: number }> = {};
    journalEntries?.forEach(je => {
      if (!jeTotals[je.account_id]) jeTotals[je.account_id] = { debit: 0, credit: 0 };
      jeTotals[je.account_id].debit += Number(je.debit) || 0;
      jeTotals[je.account_id].credit += Number(je.credit) || 0;
    });

    const assets: any[] = [];
    const liabilities: any[] = [];
    const equities: any[] = [];
    let netIncome = 0;

    // 4. Categorize and calculate net balances
    accounts.forEach(acc => {
      const totals = jeTotals[acc.id] || { debit: 0, credit: 0 };
      const opening = Number(acc.opening_balance) || 0;
      const netChange = totals.debit - totals.credit;

      if (acc.type === 'اصل') {
        const balance = opening + netChange;
        if (Math.abs(balance) > 0.01) {
          assets.push({ account_code: acc.account_code, account_name: acc.account_name, net_balance: balance });
        }
      } else if (acc.type === 'التزام') {
        const balance = opening - netChange; // Credit nature
        if (Math.abs(balance) > 0.01) {
          liabilities.push({ account_code: acc.account_code, account_name: acc.account_name, net_balance: balance });
        }
      } else if (acc.type === 'حقوق ملكية') {
        const balance = opening - netChange; // Credit nature
        if (Math.abs(balance) > 0.01) {
          equities.push({ account_code: acc.account_code, account_name: acc.account_name, net_balance: balance });
        }
      } else if (acc.type === 'ايراد') {
        netIncome += (totals.credit - totals.debit);
      } else if (acc.type === 'مصروف') {
        netIncome -= (totals.debit - totals.credit);
      }
    });

    const totalAssets = assets.reduce((sum, a) => sum + a.net_balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.net_balance, 0);
    const totalEquities = equities.reduce((sum, e) => sum + e.net_balance, 0);
    const totalEquitiesWithIncome = totalEquities + netIncome;

    const difference = totalAssets - (totalLiabilities + totalEquitiesWithIncome);

    return NextResponse.json({
      assets,
      liabilities,
      equities,
      stats: {
        totalAssets,
        totalLiabilities,
        totalEquities,
        netIncome,
        totalEquitiesWithIncome,
        difference,
        isBalanced: Math.abs(difference) < 0.01,
      },
      period: { toDate }
    });
  } catch (error) {
    console.error("Balance Sheet API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
