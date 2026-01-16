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
    const accountId = searchParams.get("account_id");
    const costCenterId = searchParams.get("cost_center_id");
    const search = searchParams.get("search");
    const entryType = searchParams.get("entry_type");

    let journalQuery = supabase
      .from("journal_entries")
      .select(`
        id,
        entry_number,
        entry_date,
        description,
        debit,
        credit,
        account_id,
        created_at,
        accounts!inner (
          id,
          account_code,
          account_name,
          type
        )
      `)
      .eq("company_id", companyId)
      .order("entry_date", { ascending: false })
      .order("id", { ascending: false });

    if (fromDate) {
      journalQuery = journalQuery.gte("entry_date", fromDate);
    }
    if (toDate) {
      journalQuery = journalQuery.lte("entry_date", toDate);
    }
    if (accountId) {
      journalQuery = journalQuery.eq("account_id", accountId);
    }
    if (search) {
      journalQuery = journalQuery.or(`description.ilike.%${search}%,entry_number.ilike.%${search}%`);
    }

    const { data: journalEntries, error: journalError } = await journalQuery;

    let expensesQuery = supabase
      .from("monthly_expenses")
      .select(`
        id,
        expense_date,
        description,
        amount,
        net_amount,
        tax_value,
        account_code,
        cost_center_code,
        employee_name,
        employee_iqama,
        expense_type,
        month_reference,
        created_at,
        accounts:account_id (
          id,
          account_code,
          account_name,
          type
        ),
        cost_centers:cost_center_id (
          id,
          center_code,
          center_name
        )
      `)
      .eq("company_id", companyId)
      .order("expense_date", { ascending: false })
      .order("id", { ascending: false });

    if (fromDate) {
      expensesQuery = expensesQuery.gte("expense_date", fromDate);
    }
    if (toDate) {
      expensesQuery = expensesQuery.lte("expense_date", toDate);
    }
    if (costCenterId) {
      expensesQuery = expensesQuery.eq("cost_center_id", costCenterId);
    }
    if (search) {
      expensesQuery = expensesQuery.or(`description.ilike.%${search}%,account_code.ilike.%${search}%,cost_center_code.ilike.%${search}%,employee_name.ilike.%${search}%`);
    }

    const { data: expenses, error: expensesError } = await expensesQuery;

    const { data: accounts } = await supabase
      .from("accounts")
      .select("id, account_code, account_name, type")
      .eq("company_id", companyId)
      .order("account_code");

    const { data: costCenters } = await supabase
      .from("cost_centers")
      .select("id, center_code, center_name")
      .eq("company_id", companyId)
      .order("center_code");

    const ledgerEntries: any[] = [];

    if (journalEntries && !journalError) {
      journalEntries.forEach((entry: any) => {
        ledgerEntries.push({
          id: `je-${entry.id}`,
          date: entry.entry_date,
          document_number: entry.entry_number || `JE-${entry.id}`,
          description: entry.description,
          account_code: entry.accounts?.account_code || "",
          account_name: entry.accounts?.account_name || "",
          account_type: entry.accounts?.type || "",
          cost_center_code: "",
          cost_center_name: "",
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0,
          source: "journal_entry",
          source_type: "قيد يومية",
          employee_name: "",
          created_at: entry.created_at,
        });
      });
    }

    if (expenses && !expensesError) {
      expenses.forEach((expense: any) => {
        ledgerEntries.push({
          id: `exp-${expense.id}`,
          date: expense.expense_date,
          document_number: `EXP-${expense.id}`,
          description: expense.description || expense.expense_type,
          account_code: expense.account_code || expense.accounts?.account_code || "",
          account_name: expense.accounts?.account_name || expense.expense_type || "",
          account_type: expense.accounts?.type || "expense",
          cost_center_code: expense.cost_center_code || expense.cost_centers?.center_code || "",
          cost_center_name: expense.cost_centers?.center_name || "",
          debit: Number(expense.net_amount) || Number(expense.amount) || 0,
          credit: 0,
          source: "expense",
          source_type: "منصرفات",
          employee_name: expense.employee_name || "",
          employee_iqama: expense.employee_iqama || "",
          month_reference: expense.month_reference || "",
          created_at: expense.created_at,
        });
      });
    }

    ledgerEntries.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (entryType && entryType !== "all") {
      const filtered = ledgerEntries.filter(entry => {
        if (entryType === "debit") return entry.debit > 0;
        if (entryType === "credit") return entry.credit > 0;
        return true;
      });
      ledgerEntries.length = 0;
      ledgerEntries.push(...filtered);
    }

    let runningBalance = 0;
    const entriesWithBalance = [...ledgerEntries].reverse().map(entry => {
      runningBalance += entry.debit - entry.credit;
      return { ...entry, balance: runningBalance };
    }).reverse();

    const totalDebit = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
    const finalBalance = totalDebit - totalCredit;

    const entriesByDate: { [key: string]: number } = {};
    ledgerEntries.forEach(entry => {
      const month = entry.date?.substring(0, 7) || "unknown";
      entriesByDate[month] = (entriesByDate[month] || 0) + entry.debit;
    });

    const accountStats: { [key: string]: { name: string; total: number } } = {};
    ledgerEntries.forEach(entry => {
      if (entry.account_code) {
        if (!accountStats[entry.account_code]) {
          accountStats[entry.account_code] = { name: entry.account_name, total: 0 };
        }
        accountStats[entry.account_code].total += entry.debit;
      }
    });

    const topAccounts = Object.entries(accountStats)
      .map(([code, data]) => ({ code, name: data.name, total: data.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const costCenterStats: { [key: string]: { name: string; total: number } } = {};
    ledgerEntries.forEach(entry => {
      if (entry.cost_center_code) {
        if (!costCenterStats[entry.cost_center_code]) {
          costCenterStats[entry.cost_center_code] = { name: entry.cost_center_name, total: 0 };
        }
        costCenterStats[entry.cost_center_code].total += entry.debit;
      }
    });

    return NextResponse.json({
      entries: entriesWithBalance,
      stats: {
        totalDebit,
        totalCredit,
        finalBalance,
        entriesCount: ledgerEntries.length,
        activeAccounts: Object.keys(accountStats).length,
      },
      chartData: {
        monthlyTrend: Object.entries(entriesByDate).map(([month, amount]) => ({ month, amount })),
        topAccounts,
        costCenterDistribution: Object.entries(costCenterStats).map(([code, data]) => ({ 
          code, 
          name: data.name, 
          total: data.total 
        })),
      },
      metadata: {
        accounts: accounts || [],
        costCenters: costCenters || [],
      },
    });
  } catch (error) {
    console.error("General Ledger API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
