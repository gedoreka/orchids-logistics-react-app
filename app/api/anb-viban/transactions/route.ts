import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    if (!companyId) {
      return NextResponse.json({ error: "company_id مطلوب" }, { status: 400 });
    }

    const virtualAccountId = searchParams.get("virtual_account_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let where = "WHERE t.company_id = ?";
    const params: any[] = [companyId];

    if (virtualAccountId) {
      where += " AND t.virtual_account_id = ?";
      params.push(virtualAccountId);
    }

    const countRows = await query<any>(
      `SELECT COUNT(*) as total FROM anb_viban_transactions t ${where}`,
      params
    );

    const rows = await query<any>(
      `SELECT t.*, va.account_name, va.viban as account_viban 
       FROM anb_viban_transactions t
       LEFT JOIN anb_virtual_accounts va ON t.virtual_account_id = va.id
       ${where} ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      transactions: rows,
      total: countRows[0]?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((countRows[0]?.total || 0) / limit)
    });
  } catch (error) {
    console.error("Error fetching VIBAN transactions:", error);
    return NextResponse.json({ error: "فشل في جلب المعاملات" }, { status: 500 });
  }
}
