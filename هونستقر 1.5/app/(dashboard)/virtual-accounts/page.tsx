import { cookies } from "next/headers";
import { cachedQuery } from "@/lib/db";
import { VirtualAccountsClient } from "./virtual-accounts-client";

async function getVibanSettings(companyId: number) {
  try {
    const rows = await cachedQuery<any>(
        `SELECT id, company_id, master_iban, client_id,
                CASE WHEN client_secret IS NOT NULL AND client_secret != '' THEN '********' ELSE '' END as client_secret_masked,
                api_base_url, is_sandbox, is_active, auto_reconcile, created_at, updated_at
         FROM anb_viban_settings WHERE company_id = ? LIMIT 1`,
        [companyId], 30000
      );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching VIBAN settings:", error);
    return null;
  }
}

async function getVirtualAccounts(companyId: number) {
  try {
    const rows = await cachedQuery<any>(
        `SELECT id, company_id, account_name, account_name_en, viban, reference_id, master_iban,
                status, total_received, transactions_count, notes, created_at, updated_at
         FROM anb_virtual_accounts WHERE company_id = ? ORDER BY created_at DESC`,
        [companyId], 15000
      );
    return rows;
  } catch (error) {
    console.error("Error fetching virtual accounts:", error);
    return [];
  }
}

async function getStats(companyId: number) {
  try {
      const accountStats = await cachedQuery<any>(
        `SELECT 
           COUNT(*) as totalAccounts,
           SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeAccounts,
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingAccounts,
           COALESCE(SUM(total_received), 0) as totalReceived
         FROM anb_virtual_accounts WHERE company_id = ?`,
        [companyId], 15000
      );

      const recentTx = await cachedQuery<any>(
        `SELECT t.id, t.amount, t.currency, t.sender_name, t.narrative, t.transaction_date, a.account_name
         FROM anb_viban_transactions t
         LEFT JOIN anb_virtual_accounts a ON t.virtual_account_id = a.id
         WHERE t.company_id = ?
         ORDER BY t.transaction_date DESC LIMIT 10`,
        [companyId], 15000
      );

      const topAccounts = await cachedQuery<any>(
        `SELECT id, account_name, viban, status, total_received, transactions_count
         FROM anb_virtual_accounts WHERE company_id = ? AND status = 'active'
         ORDER BY total_received DESC LIMIT 5`,
        [companyId], 15000
      );

    const s = accountStats[0] || {};
    return {
      totalAccounts: Number(s.totalAccounts) || 0,
      activeAccounts: Number(s.activeAccounts) || 0,
      pendingAccounts: Number(s.pendingAccounts) || 0,
      totalReceived: Number(s.totalReceived) || 0,
      recentTransactions: recentTx || [],
      topAccounts: topAccounts || [],
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalAccounts: 0,
      activeAccounts: 0,
      pendingAccounts: 0,
      totalReceived: 0,
      recentTransactions: [],
      topAccounts: [],
    };
  }
}

export default async function VirtualAccountsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const [settings, accounts, stats] = await Promise.all([
    getVibanSettings(companyId),
    getVirtualAccounts(companyId),
    getStats(companyId),
  ]);

  return (
    <VirtualAccountsClient
      companyId={companyId}
      settings={settings}
      accounts={accounts}
      stats={stats}
    />
  );
}
