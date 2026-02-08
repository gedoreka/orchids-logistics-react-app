/**
 * ZATCA Production CSID API - Step 3: Get Production CSID
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ZatcaApiClient } from "@/lib/zatca/api-client";
import type { ZatcaEnvironment } from "@/lib/zatca/constants";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { company_id } = await request.json();

    if (!company_id) {
      return NextResponse.json({ error: "company_id required" }, { status: 400 });
    }

    // Get credentials
    const { data: creds, error: credErr } = await supabase
      .from("zatca_credentials")
      .select("*")
      .eq("company_id", parseInt(company_id))
      .single();

    if (credErr || !creds || !creds.ccsid || !creds.ccsid_request_id) {
      return NextResponse.json({ error: "Complete compliance check first." }, { status: 400 });
    }

    // Call ZATCA API for production CSID
    const client = new ZatcaApiClient(creds.environment as ZatcaEnvironment);
    const result = await client.getProductionCSID(
      creds.ccsid,
      creds.ccsid_secret,
      creds.ccsid_request_id,
    );

    // Save PCSID
    const { error: updateErr } = await supabase
      .from("zatca_credentials")
      .update({
        pcsid: result.binarySecurityToken,
        pcsid_secret: result.secret,
        certificate: result.binarySecurityToken,
        status: "production",
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", parseInt(company_id));

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: result.dispositionMessage,
      status: "production",
    });
  } catch (error: any) {
    console.error("ZATCA production CSID error:", error);
    return NextResponse.json({
      error: error.message || "Production CSID request failed",
      details: error.data,
    }, { status: error.status || 500 });
  }
}
