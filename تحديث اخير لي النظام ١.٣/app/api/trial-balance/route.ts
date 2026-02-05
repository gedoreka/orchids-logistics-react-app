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
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");

    // 1. Fetch all accounts with their opening balances
    const { data: accounts, error: accError } = await supabase
      .from("accounts")
      .select("id, account_code, account_name, type, opening_balance, balance_type")
      .eq("company_id", companyId)
      .order("account_code");

    if (accError) throw accError;

    // 2. Fetch journal entries summary grouped by account
    let jeQuery = supabase
      .from("journal_entries")
      .select("account_id, debit, credit")
      .eq("company_id", companyId);

    if (fromDate) jeQuery = jeQuery.gte("entry_date", fromDate);
    if (toDate) jeQuery = jeQuery.lte("entry_date", toDate);

    const { data: journalEntries, error: jeError } = await jeQuery;
    if (jeError) throw jeError;

    // 3. Aggregate journal entries
    const jeTotals: Record<number, { debit: number, credit: number }> = {};
    journalEntries?.forEach(je => {
      if (!jeTotals[je.account_id]) jeTotals[je.account_id] = { debit: 0, credit: 0 };
      jeTotals[je.account_id].debit += Number(je.debit) || 0;
      jeTotals[je.account_id].credit += Number(je.credit) || 0;
    });

    // 4. Calculate final balances for Trial Balance
    const balances = accounts.map(acc => {
      const totals = jeTotals[acc.id] || { debit: 0, credit: 0 };
      const opening = Number(acc.opening_balance) || 0;
      
      // Calculate closing balance based on account nature
      let closingDebit = 0;
      let closingCredit = 0;
      
      const netChange = totals.debit - totals.credit;
      
      if (acc.balance_type === 'مدين' || acc.type === 'اصل' || acc.type === 'مصروف') {
        const final = opening + netChange;
        if (final >= 0) closingDebit = final;
        else closingCredit = Math.abs(final);
      } else {
        const final = opening - netChange;
        if (final >= 0) closingCredit = final;
        else closingDebit = Math.abs(final);
      }

      return {
        id: acc.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        type: acc.type,
        opening_balance: opening,
        debit: totals.debit,
        credit: totals.credit,
        closing_debit: closingDebit,
        closing_credit: closingCredit
      };
    }).filter(b => b.debit > 0 || b.credit > 0 || b.opening_balance > 0);

    const totalDebit = balances.reduce((sum, b) => sum + b.debit, 0);
    const totalCredit = balances.reduce((sum, b) => sum + b.credit, 0);
    const difference = totalDebit - totalCredit;

    return NextResponse.json({
      balances,
      stats: {
        totalDebit,
        totalCredit,
        difference,
        isBalanced: Math.abs(difference) < 0.01,
        accountsCount: balances.length,
      }
    });
  } catch (error) {
    console.error("Trial Balance API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
