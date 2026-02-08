/**
 * ZATCA Submit API - Submit real invoices/credit notes
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ZatcaApiClient } from "@/lib/zatca/api-client";
import { buildSignedXml } from "@/lib/zatca/xml-builder";
import { INITIAL_PREVIOUS_HASH, INVOICE_SUB_TYPES } from "@/lib/zatca/constants";
import type { ZatcaEnvironment } from "@/lib/zatca/constants";
import type { ZatcaInvoiceData } from "@/lib/zatca/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, document_type, document_id, invoice_data } = body;

    if (!company_id || !document_type || !document_id || !invoice_data) {
      return NextResponse.json(
        { error: "company_id, document_type, document_id, invoice_data required" },
        { status: 400 }
      );
    }

    // Get credentials
    const { data: creds, error: credErr } = await supabase
      .from("zatca_credentials")
      .select("*")
      .eq("company_id", parseInt(company_id))
      .single();

    if (credErr || !creds) {
      return NextResponse.json({ error: "No ZATCA credentials found." }, { status: 400 });
    }

    // Determine which CSID to use
    const csid = creds.pcsid || creds.ccsid;
    const secret = creds.pcsid_secret || creds.ccsid_secret;

    if (!csid || !secret) {
      return NextResponse.json({ error: "No valid CSID. Complete onboarding first." }, { status: 400 });
    }

    // Get the last submission for this company to get previous hash and counter
    const { data: lastSubmission } = await supabase
      .from("zatca_submissions")
      .select("xml_hash, invoice_counter")
      .eq("company_id", parseInt(company_id))
      .eq("submission_status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const previousHash = lastSubmission?.xml_hash || INITIAL_PREVIOUS_HASH;
    const counter = (lastSubmission?.invoice_counter || 0) + 1;

    // Add chain info to invoice data
    const zatcaData: ZatcaInvoiceData = {
      ...invoice_data,
      previousInvoiceHash: previousHash,
      invoiceCounterValue: counter,
    };

    // Build signed XML
    const signed = buildSignedXml(zatcaData, {
      privateKey: creds.private_key,
      certificate: csid,
      previousInvoiceHash: previousHash,
    });

    const invoiceXmlBase64 = Buffer.from(signed.xml, "utf8").toString("base64");

    // Determine submission type (clearance for B2B, reporting for B2C)
    const isStandard = invoice_data.invoiceSubType === INVOICE_SUB_TYPES.STANDARD_TAX_INVOICE;
    const submissionType = isStandard ? "clearance" : "reporting";

    // Submit to ZATCA
    const client = new ZatcaApiClient(creds.environment as ZatcaEnvironment);
    let result;

    if (submissionType === "clearance") {
      result = await client.submitClearance(
        csid, secret, invoiceXmlBase64, signed.invoiceHash, invoice_data.id,
      );
    } else {
      result = await client.submitReporting(
        csid, secret, invoiceXmlBase64, signed.invoiceHash, invoice_data.id,
      );
    }

    // Save submission record
    const submissionStatus = result.reportingStatus === "REPORTED" ||
      result.clearanceStatus === "CLEARED" ? "success" : "warning";

    const { data: submission, error: subErr } = await supabase
      .from("zatca_submissions")
      .insert({
        company_id: parseInt(company_id),
        document_type,
        document_id,
        xml_content: signed.xml,
        xml_hash: signed.invoiceHash,
        signature: signed.signature,
        qr_code: signed.qrBase64,
        invoice_counter: counter,
        previous_hash: previousHash,
        submission_type: submissionType,
        submission_status: submissionStatus,
        zatca_response: result,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (subErr) console.error("Failed to save submission:", subErr);

    return NextResponse.json({
      success: true,
      submission_id: submission?.id,
      qr_code: signed.qrBase64,
      invoice_hash: signed.invoiceHash,
      submission_type: submissionType,
      submission_status: submissionStatus,
      zatca_response: result,
    });
  } catch (error: any) {
    console.error("ZATCA submit error:", error);

    // Save failed submission
    try {
      const body = await request.clone().json();
      await supabase.from("zatca_submissions").insert({
        company_id: parseInt(body.company_id),
        document_type: body.document_type,
        document_id: body.document_id,
        submission_status: "failed",
        error_message: error.message,
        zatca_response: error.data,
        submitted_at: new Date().toISOString(),
      });
    } catch { /* ignore save errors */ }

    return NextResponse.json({
      error: error.message || "Submission failed",
      details: error.data,
    }, { status: error.status || 500 });
  }
}
