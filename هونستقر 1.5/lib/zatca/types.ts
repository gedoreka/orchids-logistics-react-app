/**
 * ZATCA Phase 2 E-Invoicing Types
 */

// ─── Invoice Types ────────────────────────────────────────────
export interface ZatcaInvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceTypeCode: "388" | "381" | "383"; // 388=Invoice, 381=Credit, 383=Debit
  invoiceSubType: string; // e.g. "0100000" for standard, "0200000" for simplified
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm:ss
  currency: string;  // SAR
  
  // Seller
  sellerName: string;
  sellerVatNumber: string;
  sellerCRNumber: string;
  sellerStreet: string;
  sellerDistrict: string;
  sellerCity: string;
  sellerPostalCode: string;
  sellerCountry: string; // SA
  sellerBuildingNumber?: string;
  sellerAdditionalNumber?: string;
  
  // Buyer
  buyerName: string;
  buyerVatNumber?: string;
  buyerStreet?: string;
  buyerDistrict?: string;
  buyerCity?: string;
  buyerPostalCode?: string;
  buyerCountry?: string;
  
  // Amounts
  totalBeforeVat: number;
  totalVat: number;
  totalWithVat: number;
  discount?: number;
  
  // Payment
  paymentMeansCode?: string; // 10=Cash, 30=Credit, 42=Bank, 48=Card
  dueDate?: string;
  
  // Reference (for credit/debit notes)
  billingReferenceId?: string;
  
  // Items
  items: ZatcaLineItem[];
  
  // Previous invoice hash (for chain)
  previousInvoiceHash?: string;
  
  // Invoice counter
  invoiceCounterValue: number;
}

export interface ZatcaLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  vatRate: number;        // e.g. 15
  vatAmount: number;
  totalBeforeVat: number;
  totalWithVat: number;
  vatCategory: string;    // S=Standard, Z=Zero, E=Exempt, O=OOS
}

// ─── QR Code Phase 2 ─────────────────────────────────────────
export interface ZatcaQRPhase2 {
  sellerName: string;        // Tag 1
  vatNumber: string;         // Tag 2
  timestamp: string;         // Tag 3 (ISO8601)
  totalAmount: string;       // Tag 4
  vatAmount: string;         // Tag 5
  documentHash: string;      // Tag 6 (SHA-256 hex)
  signature: string;         // Tag 7 (ECDSA DER)
  publicKey: string;         // Tag 8 (raw 64 bytes)
  caSignature: string;       // Tag 9 (certificate signature)
}

// ─── Credentials ──────────────────────────────────────────────
export interface ZatcaCredentials {
  id?: string;
  company_id: number;
  private_key: string;
  public_key: string;
  csr_content?: string;
  ccsid?: string;
  ccsid_secret?: string;
  pcsid?: string;
  pcsid_secret?: string;
  certificate?: string;
  environment: "sandbox" | "simulation" | "production";
  status: "pending" | "compliance" | "production" | "active";
  created_at?: string;
  updated_at?: string;
}

// ─── Submission ───────────────────────────────────────────────
export interface ZatcaSubmission {
  id?: string;
  company_id: number;
  document_type: "invoice" | "credit_note" | "debit_note";
  document_id: string;
  xml_content?: string;
  xml_hash?: string;
  signature?: string;
  qr_code?: string;
  submission_type: "clearance" | "reporting";
  submission_status: "pending" | "success" | "failed" | "warning";
  zatca_response?: any;
  error_message?: string;
  submitted_at?: string;
  created_at?: string;
}

// ─── API Responses ────────────────────────────────────────────
export interface ZatcaOnboardingResponse {
  requestID: string;
  dispositionMessage: string;
  binarySecurityToken: string;
  secret: string;
}

export interface ZatcaComplianceResponse {
  reportingStatus: string;
  clearanceStatus?: string;
  validationResults: {
    status: string;
    infoMessages?: Array<{ type: string; code: string; category: string; message: string; status: string }>;
    warningMessages?: Array<{ type: string; code: string; category: string; message: string; status: string }>;
    errorMessages?: Array<{ type: string; code: string; category: string; message: string; status: string }>;
  };
}

export interface ZatcaProductionCSIDResponse {
  requestID: string;
  dispositionMessage: string;
  binarySecurityToken: string;
  secret: string;
}

// ─── CSR Config ───────────────────────────────────────────────
export interface ZatcaCSRConfig {
  commonName: string;        // CN - EGS serial number
  serialNumber: string;      // 1-TST|2-TST|3-xxxx
  organizationIdentifier: string; // e.g. 300xxxxx900003
  organizationName: string;
  organizationUnit?: string; // OU - Branch name
  countryName: string;       // SA
  invoiceType: string;       // 1100 or 0100
  location: string;          // Address
  industry: string;          // Industry
  environment?: string;      // sandbox | simulation | production
  emailAddress?: string;     // Optional email for CSR
}
