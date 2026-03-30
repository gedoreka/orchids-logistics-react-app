/**
 * ZATCA Phase 2 - API Client
 * Handles communication with ZATCA e-invoicing portal
 */
import { ZATCA_ENDPOINTS, type ZatcaEnvironment } from "./constants";
import type {
  ZatcaOnboardingResponse,
  ZatcaComplianceResponse,
  ZatcaProductionCSIDResponse,
} from "./types";

// ─── API Client ──────────────────────────────────────────────────
export class ZatcaApiClient {
  private baseUrl: string;
  private environment: ZatcaEnvironment;

  constructor(environment: ZatcaEnvironment = "sandbox") {
    this.environment = environment;
    this.baseUrl = ZATCA_ENDPOINTS[environment].base;
  }

  private getEndpoint(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private async request(
    url: string,
    options: RequestInit,
  ): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Accept-Language": "en",
        "Accept-Version": "V2",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { rawResponse: text };
      }

      if (!response.ok) {
        console.error("[ZATCA API] Error status:", response.status, response.statusText);
        console.error("[ZATCA API] Error URL:", url);
        console.error("[ZATCA API] Error raw text:", text.substring(0, 500));
        const errorMsg = data?.message || data?.dispositionMessage || data?.errors?.[0]?.message || `HTTP ${response.status}`;
        throw new ZatcaApiError(
          errorMsg,
          response.status,
          data,
        );
      }

    return data;
  }

  // ─── Step 1: Get Compliance CSID (CCSID) ───────────────────────
  async getComplianceCSID(csrBase64: string, otp: string): Promise<ZatcaOnboardingResponse> {
    const endpoints = ZATCA_ENDPOINTS[this.environment];
    const url = this.getEndpoint(endpoints.compliance);

    return this.request(url, {
      method: "POST",
      headers: {
        OTP: otp,
      },
      body: JSON.stringify({
        csr: csrBase64,
      }),
    });
  }

  // ─── Step 2: Submit compliance invoice ──────────────────────────
  async submitComplianceInvoice(
    ccsid: string,
    ccsidSecret: string,
    invoiceXmlBase64: string,
    invoiceHash: string,
    uuid: string,
  ): Promise<ZatcaComplianceResponse> {
    const endpoints = ZATCA_ENDPOINTS[this.environment];
    const url = this.getEndpoint(endpoints.complianceInvoice);

    const authToken = Buffer.from(`${ccsid}:${ccsidSecret}`).toString("base64");

    return this.request(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify({
        invoiceHash,
        uuid,
        invoice: invoiceXmlBase64,
      }),
    });
  }

  // ─── Step 3: Get Production CSID (PCSID) ────────────────────────
  async getProductionCSID(
    ccsid: string,
    ccsidSecret: string,
    requestId: string,
  ): Promise<ZatcaProductionCSIDResponse> {
    const endpoints = ZATCA_ENDPOINTS[this.environment];
    const url = this.getEndpoint(endpoints.productionCSID);

    const authToken = Buffer.from(`${ccsid}:${ccsidSecret}`).toString("base64");

    return this.request(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify({
        compliance_request_id: requestId,
      }),
    });
  }

  // ─── Submit invoice for clearance (B2B standard) ────────────────
  async submitClearance(
    pcsid: string,
    pcsidSecret: string,
    invoiceXmlBase64: string,
    invoiceHash: string,
    uuid: string,
  ): Promise<ZatcaComplianceResponse> {
    const endpoints = ZATCA_ENDPOINTS[this.environment];
    const url = this.getEndpoint(endpoints.clearance);

    const authToken = Buffer.from(`${pcsid}:${pcsidSecret}`).toString("base64");

    return this.request(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
        "Clearance-Status": "1",
      },
      body: JSON.stringify({
        invoiceHash,
        uuid,
        invoice: invoiceXmlBase64,
      }),
    });
  }

  // ─── Submit invoice for reporting (B2C simplified) ──────────────
  async submitReporting(
    pcsid: string,
    pcsidSecret: string,
    invoiceXmlBase64: string,
    invoiceHash: string,
    uuid: string,
  ): Promise<ZatcaComplianceResponse> {
    const endpoints = ZATCA_ENDPOINTS[this.environment];
    const url = this.getEndpoint(endpoints.reporting);

    const authToken = Buffer.from(`${pcsid}:${pcsidSecret}`).toString("base64");

    return this.request(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify({
        invoiceHash,
        uuid,
        invoice: invoiceXmlBase64,
      }),
    });
  }
}

// ─── Custom Error ────────────────────────────────────────────────
export class ZatcaApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ZatcaApiError";
    this.status = status;
    this.data = data;
  }
}
