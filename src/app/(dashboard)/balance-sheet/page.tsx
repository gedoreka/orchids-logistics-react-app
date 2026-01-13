import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { BalanceSheetClient } from "./balance-sheet-client";

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: { from_date?: string; to_date?: string };
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  const fromDate = searchParams.from_date || `${new Date().getFullYear()}-01-01`;
  const toDate = searchParams.to_date || new Date().toISOString().split('T')[0];

  // Helper to fetch accounts with balances
  const fetchBalances = async (type: string) => {
    return await query<any>(`
      SELECT 
        a.account_name, 
        a.account_code,
        COALESCE(SUM(CASE WHEN je.debit > 0 THEN je.debit ELSE 0 END), 0) AS total_debit,
        COALESCE(SUM(CASE WHEN je.credit > 0 THEN je.credit ELSE 0 END), 0) AS total_credit,
        (COALESCE(SUM(je.debit), 0) - COALESCE(SUM(je.credit), 0)) AS net_balance
      FROM accounts a
      LEFT JOIN journal_entries je ON a.id = je.account_id 
          AND je.company_id = ? 
          AND je.entry_date BETWEEN ? AND ?
      WHERE a.type = ? AND a.company_id = ?
      GROUP BY a.id, a.account_name, a.account_code
      HAVING (COALESCE(SUM(je.debit), 0) - COALESCE(SUM(je.credit), 0)) != 0
      ORDER BY a.account_code ASC
    `, [companyId, fromDate, toDate, type, companyId]);
  };

  const assets = await fetchBalances('اصل');
  const liabilities = await fetchBalances('التزام');
  const equities = await fetchBalances('حقوق ملكية');

  // Net Profit/Loss from Revenue and Expenses
  const netIncomeResult = await query<{ net_income: string }>(`
    SELECT 
      (COALESCE(SUM(je.debit), 0) - COALESCE(SUM(je.credit), 0)) as net_income
    FROM journal_entries je
    JOIN accounts a ON je.account_id = a.id
    WHERE je.company_id = ? 
    AND je.entry_date BETWEEN ? AND ?
    AND a.type IN ('إيرادات', 'مصروفات')
  `, [companyId, fromDate, toDate]);

  const netIncome = Number(netIncomeResult[0]?.net_income || 0);

  const companies = await query<{ name: string }>("SELECT name FROM companies WHERE id = ?", [companyId]);
  const companyName = companies[0]?.name || "غير محدد";

  return (
    <BalanceSheetClient 
      assets={assets}
      liabilities={liabilities}
      equities={equities}
      netIncome={netIncome}
      companyName={companyName}
      fromDate={fromDate}
      toDate={toDate}
    />
  );
}
