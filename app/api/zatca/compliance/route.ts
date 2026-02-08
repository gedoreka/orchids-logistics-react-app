/**
 * ZATCA Compliance API - Step 2: Submit compliance invoices
 * Runs all 6 compliance check types as required by ZATCA:
 * 1. Simplified Invoice Reporting (B2C)
 * 2. Simplified Debit Note Reporting (B2C)
 * 3. Simplified Credit Note Reporting (B2C)
 * 4. Standard Invoice Clearance (B2B)
 * 5. Standard Debit Note Clearance (B2B)
 * 6. Standard Credit Note Clearance (B2B)
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ZatcaApiClient } from "@/lib/zatca/api-client";
import { buildSignedXml } from "@/lib/zatca/xml-builder";
import { INITIAL_PREVIOUS_HASH, INVOICE_SUB_TYPES } from "@/lib/zatca/constants";
import type { ZatcaEnvironment } from "@/lib/zatca/constants";
import type { ZatcaInvoiceData } from "@/lib/zatca/types";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The 6 compliance test types
const COMPLIANCE_TESTS = [
  {
    id: "simplified_invoice",
    label_ar: "مشاركة الفاتورة المبسطة",
    label_en: "Simplified Invoice Reporting",
    typeCode: "388" as const,
    subType: INVOICE_SUB_TYPES.SIMPLIFIED_TAX_INVOICE,
    method: "reporting" as const,
  },
  {
    id: "simplified_debit_note",
    label_ar: "مشاركة الاشعار الالكتروني المدين",
    label_en: "Simplified Debit Note Reporting",
    typeCode: "383" as const,
    subType: INVOICE_SUB_TYPES.SIMPLIFIED_TAX_INVOICE,
    method: "reporting" as const,
    billingRef: true,
  },
  {
    id: "simplified_credit_note",
    label_ar: "مشاركة الاشعار الالكتروني الدائن",
    label_en: "Simplified Credit Note Reporting",
    typeCode: "381" as const,
    subType: INVOICE_SUB_TYPES.SIMPLIFIED_TAX_INVOICE,
    method: "reporting" as const,
    billingRef: true,
  },
  {
    id: "standard_invoice",
    label_ar: "إعتماد الفاتورة الضريبية",
    label_en: "Standard Invoice Clearance",
    typeCode: "388" as const,
    subType: INVOICE_SUB_TYPES.STANDARD_TAX_INVOICE,
    method: "clearance" as const,
  },
  {
    id: "standard_debit_note",
    label_ar: "إعتماد الاشعار الالكتروني المدين",
    label_en: "Standard Debit Note Clearance",
    typeCode: "383" as const,
    subType: INVOICE_SUB_TYPES.STANDARD_TAX_INVOICE,
    method: "clearance" as const,
    billingRef: true,
  },
  {
    id: "standard_credit_note",
    label_ar: "إعتماد الاشعار الالكتروني الدائن",
    label_en: "Standard Credit Note Clearance",
    typeCode: "381" as const,
    subType: INVOICE_SUB_TYPES.STANDARD_TAX_INVOICE,
    method: "clearance" as const,
    billingRef: true,
  },
];

function buildTestInvoice(
  test: typeof COMPLIANCE_TESTS[0],
  counter: number,
  prevHash: string,
  vatNumber: string,
): ZatcaInvoiceData {
  const uuid = uuidv4();
  const now = new Date();
  return {
    id: uuid,
    invoiceNumber: `COMP-${test.id}-${Date.now()}`,
    invoiceTypeCode: test.typeCode,
    invoiceSubType: test.subType,
    issueDate: now.toISOString().split("T")[0],
    issueTime: now.toTimeString().split(" ")[0],
    currency: "SAR",
    sellerName: "Test Company",
    sellerVatNumber: vatNumber || "300000000000003",
    sellerCRNumber: "1010000000",
    sellerStreet: "Test Street",
    sellerDistrict: "Test District",
    sellerCity: "Riyadh",
    sellerPostalCode: "12345",
    sellerCountry: "SA",
    buyerName: "Test Buyer",
    buyerVatNumber: test.subType === INVOICE_SUB_TYPES.STANDARD_TAX_INVOICE ? "300000000000003" : undefined,
    buyerStreet: "Buyer Street",
    buyerDistrict: "Buyer District",
    buyerCity: "Riyadh",
    buyerPostalCode: "12345",
    buyerCountry: "SA",
    totalBeforeVat: 100,
    totalVat: 15,
    totalWithVat: 115,
    paymentMeansCode: "10",
    billingReferenceId: test.billingRef ? `INV-REF-${Date.now()}` : undefined,
    items: [{
      id: "1",
      name: "Test Item",
      quantity: 1,
      unitPrice: 100,
      vatRate: 15,
      vatAmount: 15,
      totalBeforeVat: 100,
      totalWithVat: 115,
      vatCategory: "S",
    }],
    previousInvoiceHash: prevHash,
    invoiceCounterValue: counter,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, test_id } = body;

    if (!company_id) {
      return NextResponse.json({ error: "company_id required" }, { status: 400 });
    }

    // Get credentials
    const { data: creds, error: credErr } = await supabase
      .from("zatca_credentials")
      .select("*")
      .eq("company_id", parseInt(company_id))
      .single();

    if (credErr || !creds || !creds.ccsid) {
      return NextResponse.json({ error: "No CCSID found. Complete onboarding first." }, { status: 400 });
    }

    // Get company info
    const { data: taxSettings } = await supabase
      .from("tax_settings")
      .select("*")
      .eq("company_id", parseInt(company_id))
      .single();

    const vatNumber = taxSettings?.zatca_vat_number || "300000000000003";
    const client = new ZatcaApiClient(creds.environment as ZatcaEnvironment);

    // If test_id specified, run only that test; otherwise run all
    const testsToRun = test_id
      ? COMPLIANCE_TESTS.filter(t => t.id === test_id)
      : COMPLIANCE_TESTS;

    if (testsToRun.length === 0) {
      return NextResponse.json({ error: "Invalid test_id" }, { status: 400 });
    }

    const results: Array<{
      id: string;
      label_ar: string;
      label_en: string;
      status: "success" | "failed" | "warning";
      message?: string;
      details?: any;
    }> = [];

    let prevHash = INITIAL_PREVIOUS_HASH;
    let counter = 1;

    for (const test of testsToRun) {
      try {
        const testData = buildTestInvoice(test, counter, prevHash, vatNumber);

        const signed = buildSignedXml(testData, {
          privateKey: creds.private_key,
          certificate: creds.ccsid,
          previousInvoiceHash: prevHash,
        });

        const invoiceXmlBase64 = Buffer.from(signed.xml, "utf8").toString("base64");

        const result = await client.submitComplianceInvoice(
          creds.ccsid,
          creds.ccsid_secret,
          invoiceXmlBase64,
          signed.invoiceHash,
          testData.id,
        );

        const status = result.validationResults?.status === "PASS" ? "success"
          : result.validationResults?.status === "WARNING" ? "warning"
          : "failed";

        results.push({
          id: test.id,
          label_ar: test.label_ar,
          label_en: test.label_en,
          status,
          message: result.validationResults?.status || "OK",
          details: result.validationResults,
        });

        // Update hash chain
        prevHash = signed.invoiceHash;
        counter++;
      } catch (error: any) {
        results.push({
          id: test.id,
          label_ar: test.label_ar,
          label_en: test.label_en,
          status: "failed",
          message: error.message || "Failed",
          details: error.data,
        });
      }
    }

    const allPassed = results.every(r => r.status === "success" || r.status === "warning");

    return NextResponse.json({
      success: true,
      allPassed,
      results,
      tests: COMPLIANCE_TESTS.map(t => ({ id: t.id, label_ar: t.label_ar, label_en: t.label_en })),
    });
  } catch (error: any) {
    console.error("ZATCA compliance error:", error);
    return NextResponse.json({
      error: error.message || "Compliance check failed",
      details: error.data,
    }, { status: error.status || 500 });
  }
}
