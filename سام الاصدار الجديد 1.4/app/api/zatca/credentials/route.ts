/**
 * ZATCA Credentials API
 * GET: Fetch credentials for a company
 * POST: Generate keys and CSR
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateKeyPair, generateCSR, getCSRBase64 } from "@/lib/zatca/crypto";
import { randomUUID } from "crypto";
import type { ZatcaCSRConfig } from "@/lib/zatca/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    if (!companyId) {
      return NextResponse.json({ error: "company_id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("zatca_credentials")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({
      success: true,
      credentials: data || null,
    });
  } catch (error: any) {
    console.error("ZATCA credentials GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      organization_name,
      organization_identifier,
      common_name,
      serial_number,
      country_name = "SA",
      invoice_type = "1100",
      location = "Riyadh",
      industry = "Logistics",
      environment = "sandbox",
    } = body;

    if (!company_id || !organization_name || !organization_identifier) {
      return NextResponse.json(
        { error: "company_id, organization_name, organization_identifier required" },
        { status: 400 }
      );
    }

    // Validate organization name length (OpenSSL O/OU fields limited to 64 bytes)
    const orgNameBytes = Buffer.byteLength(organization_name, "utf8");
    if (orgNameBytes > 64) {
      return NextResponse.json(
        { error: `اسم المنشأة طويل جداً (${orgNameBytes} بايت). الحد الأقصى 64 بايت. يرجى استخدام الاسم الإنجليزي القصير.` },
        { status: 400 }
      );
    }

    // Generate key pair
    const { privateKey, publicKey, privateKeyPEM } = generateKeyPair();

    // Build CSR config
    // Serial number format: 1-Name|2-Version|3-UUID (matching ZATCA spec)
    const envPrefix = environment === "production" ? "PRD" : "TST";
    const csrConfig: ZatcaCSRConfig = {
      commonName: common_name || `EGS${company_id}-${Date.now()}`,
      serialNumber: serial_number || `1-${envPrefix}|2-${envPrefix}|3-${randomUUID()}`,
      organizationIdentifier: organization_identifier,
      organizationName: organization_name,
      countryName: country_name,
      invoiceType: invoice_type,
      location,
      industry,
      environment,
    };

    // Generate CSR using OpenSSL (ZATCA-compliant)
    const csrPEM = generateCSR(privateKeyPEM, csrConfig);
    const csrBase64 = getCSRBase64(csrPEM);

    console.log("[ZATCA Credentials] CSR generated successfully, length:", csrBase64.length);
    console.log("[ZATCA Credentials] CSR base64 (first 100):", csrBase64.substring(0, 100));

    // Save to DB (store both hex and PEM private key)
    const { data, error } = await supabase
      .from("zatca_credentials")
      .upsert({
        company_id: parseInt(company_id),
        private_key: privateKey,
        private_key_pem: privateKeyPEM,
        public_key: publicKey,
        csr_content: csrBase64,
        environment,
        status: "pending",
        updated_at: new Date().toISOString(),
      }, { onConflict: "company_id" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      credentials: {
        id: data.id,
        csr: csrBase64,
        environment,
        status: "pending",
      },
    });
  } catch (error: any) {
    console.error("ZATCA credentials POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
