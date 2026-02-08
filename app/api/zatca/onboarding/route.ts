/**
 * ZATCA Onboarding API - Step 1: Get Compliance CSID
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
    const { company_id, otp } = await request.json();

    if (!company_id || !otp) {
      return NextResponse.json({ error: "company_id and otp required" }, { status: 400 });
    }

    // Get credentials
    const { data: creds, error: credErr } = await supabase
      .from("zatca_credentials")
      .select("*")
      .eq("company_id", parseInt(company_id))
      .single();

    if (credErr || !creds) {
      return NextResponse.json({ error: "No credentials found. Generate keys first." }, { status: 400 });
    }

    if (!creds.csr_content) {
      return NextResponse.json({ error: "CSR not generated yet." }, { status: 400 });
    }

    // Call ZATCA API
    const client = new ZatcaApiClient(creds.environment as ZatcaEnvironment);
    console.log("[ZATCA Onboarding] Sending CSR (first 100 chars):", creds.csr_content.substring(0, 100));
    console.log("[ZATCA Onboarding] OTP:", otp);
    console.log("[ZATCA Onboarding] Environment:", creds.environment);
    const result = await client.getComplianceCSID(creds.csr_content, otp);

    // Save CCSID
    const { error: updateErr } = await supabase
      .from("zatca_credentials")
      .update({
        ccsid: result.binarySecurityToken,
        ccsid_secret: result.secret,
        ccsid_request_id: result.requestID,
        certificate: result.binarySecurityToken,
        status: "compliance",
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", parseInt(company_id));

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: result.dispositionMessage,
      status: "compliance",
    });
  } catch (error: any) {
    console.error("ZATCA onboarding error:", error);
    console.error("ZATCA onboarding error data:", JSON.stringify(error.data, null, 2));
    
    // Build a more descriptive error message
      let errorMsg = error.message || "Onboarding failed";
      if (error.data) {
        const details = error.data;
        if (details.errorMessage) {
          errorMsg = details.errorMessage;
        } else if (details.errors && Array.isArray(details.errors)) {
          errorMsg = details.errors.map((e: any) => e.message || e.code).join(", ");
        } else if (details.message) {
          errorMsg = details.message;
        } else if (details.dispositionMessage) {
          errorMsg = details.dispositionMessage;
        }
      }
    
    return NextResponse.json({
      error: errorMsg,
      details: error.data,
      hint: error.status === 400 ? "CSR قد يكون غير صالح - حاول إعادة إنشاء المفاتيح أولاً" : undefined,
    }, { status: error.status || 500 });
  }
}
