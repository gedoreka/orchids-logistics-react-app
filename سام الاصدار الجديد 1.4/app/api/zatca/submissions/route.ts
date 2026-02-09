/**
 * ZATCA Submissions API - List/query submissions
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const documentType = searchParams.get("document_type");
    const documentId = searchParams.get("document_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!companyId) {
      return NextResponse.json({ error: "company_id required" }, { status: 400 });
    }

    let query = supabase
      .from("zatca_submissions")
      .select("id, company_id, document_type, document_id, xml_hash, qr_code, invoice_counter, submission_type, submission_status, error_message, zatca_response, submitted_at, created_at", { count: "exact" })
      .eq("company_id", parseInt(companyId))
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (documentType) query = query.eq("document_type", documentType);
    if (documentId) query = query.eq("document_id", documentId);
    if (status) query = query.eq("submission_status", status);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      submissions: data || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error("ZATCA submissions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
