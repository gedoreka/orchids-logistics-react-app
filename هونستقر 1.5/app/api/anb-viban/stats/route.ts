import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    if (!companyId) {
      return NextResponse.json({ error: "company_id مطلوب" }, { status: 400 });
    }

    const totalAccounts = await query<any>(
      `SELECT COUNT(*) as total FROM anb_virtual_accounts WHERE company_id = ?`,
      [companyId]
    );

    const activeAccounts = await query<any>(
      `SELECT COUNT(*) as total FROM anb_virtual_accounts WHERE company_id = ? AND status = 'active'`,
      [companyId]
    );

    const pendingAccounts = await query<any>(
      `SELECT COUNT(*) as total FROM anb_virtual_accounts WHERE company_id = ? AND status = 'pending'`,
      [companyId]
    );

    const totalReceived = await query<any>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM anb_viban_transactions WHERE company_id = ?`,
      [companyId]
    );

    const recentTransactions = await query<any>(
      `SELECT t.*, va.account_name 
       FROM anb_viban_transactions t
       LEFT JOIN anb_virtual_accounts va ON t.virtual_account_id = va.id
       WHERE t.company_id = ? 
       ORDER BY t.transaction_date DESC LIMIT 5`,
      [companyId]
    );

    const topAccounts = await query<any>(
      `SELECT id, account_name, viban, total_received, status 
       FROM anb_virtual_accounts 
       WHERE company_id = ? 
       ORDER BY total_received DESC LIMIT 5`,
      [companyId]
    );

    return NextResponse.json({
      totalAccounts: totalAccounts[0]?.total || 0,
      activeAccounts: activeAccounts[0]?.total || 0,
      pendingAccounts: pendingAccounts[0]?.total || 0,
      totalReceived: totalReceived[0]?.total || 0,
      recentTransactions,
      topAccounts
    });
  } catch (error) {
    console.error("Error fetching VIBAN stats:", error);
    return NextResponse.json({ error: "فشل في جلب الإحصائيات" }, { status: 500 });
  }
}
