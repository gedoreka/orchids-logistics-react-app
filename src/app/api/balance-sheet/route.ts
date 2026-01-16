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
    const fromDate = searchParams.get("from_date") || new Date().getFullYear() + "-01-01";
    const toDate = searchParams.get("to_date") || new Date().toISOString().split("T")[0];

    const fetchAccounts = async (accountType: string) => {
      const { data: journalEntries, error } = await supabase
        .from("journal_entries")
        .select(`
          id,
          entry_date,
          debit,
          credit,
          account_id,
          accounts:account_id (
            id,
            account_code,
            account_name,
            type
          )
        `)
        .eq("company_id", companyId)
        .gte("entry_date", fromDate)
        .lte("entry_date", toDate);

      if (error) {
        console.error(`Error fetching ${accountType} journal entries:`, error);
        return [];
      }

      const accountBalances: { [key: string]: { account_name: string; account_code: string; net_balance: number } } = {};

      if (journalEntries) {
        journalEntries.forEach((entry: any) => {
          const account = entry.accounts;
          if (!account || account.type !== accountType) return;

          const accountId = account.id;
          if (!accountBalances[accountId]) {
            accountBalances[accountId] = {
              account_name: account.account_name,
              account_code: account.account_code || "---",
              net_balance: 0,
            };
          }

          if (accountType === "اصل") {
            accountBalances[accountId].net_balance += (Number(entry.debit) || 0) - (Number(entry.credit) || 0);
          } else {
            accountBalances[accountId].net_balance += (Number(entry.credit) || 0) - (Number(entry.debit) || 0);
          }
        });
      }

      return Object.values(accountBalances).filter(a => Math.abs(a.net_balance) > 0.01);
    };

    const assets = await fetchAccounts("اصل");
    const liabilities = await fetchAccounts("التزام");
    const equities = await fetchAccounts("حقوق ملكية");

    const { data: revenueEntries, error: revError } = await supabase
      .from("journal_entries")
      .select(`
        id,
        debit,
        credit,
        account_id,
        accounts:account_id (
          id,
          type
        )
      `)
      .eq("company_id", companyId)
      .gte("entry_date", fromDate)
      .lte("entry_date", toDate);

    let netIncome = 0;
    if (!revError && revenueEntries) {
      revenueEntries.forEach((entry: any) => {
        const account = entry.accounts;
        if (!account) return;

        if (account.type === "ايراد") {
          netIncome += (Number(entry.credit) || 0) - (Number(entry.debit) || 0);
        } else if (account.type === "مصروف") {
          netIncome -= (Number(entry.debit) || 0) - (Number(entry.credit) || 0);
        }
      });
    }

    const totalAssets = assets.reduce((sum, a) => sum + Math.abs(a.net_balance), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + Math.abs(l.net_balance), 0);
    const totalEquities = equities.reduce((sum, e) => sum + Math.abs(e.net_balance), 0);
    const totalEquitiesWithIncome = totalEquities + netIncome;

    const difference = totalAssets - (totalLiabilities + totalEquitiesWithIncome);
    const isBalanced = Math.abs(difference) < 0.01;

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
        totalLiabilitiesAndEquities: totalLiabilities + totalEquitiesWithIncome,
        difference,
        isBalanced,
        assetsCount: assets.length,
        liabilitiesCount: liabilities.length,
        equitiesCount: equities.length,
      },
      period: {
        fromDate,
        toDate,
      },
    });
  } catch (error) {
    console.error("Balance Sheet API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
