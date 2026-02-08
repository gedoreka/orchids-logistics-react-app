/**
 * ZATCA Phase 2 Constants
 */

// ─── ZATCA API Endpoints ──────────────────────────────────────
export const ZATCA_ENDPOINTS = {
  sandbox: {
    base: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
    compliance: "/compliance",
    complianceInvoice: "/compliance/invoices",
    productionCSID: "/production/csids",
    clearance: "/invoices/clearance/single",
    reporting: "/invoices/reporting/single",
  },
  simulation: {
    base: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
    compliance: "/compliance",
    complianceInvoice: "/compliance/invoices",
    productionCSID: "/production/csids",
    clearance: "/invoices/clearance/single",
    reporting: "/invoices/reporting/single",
  },
  production: {
    base: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
    compliance: "/compliance",
    complianceInvoice: "/compliance/invoices",
    productionCSID: "/production/csids",
    clearance: "/invoices/clearance/single",
    reporting: "/invoices/reporting/single",
  },
} as const;

export type ZatcaEnvironment = keyof typeof ZATCA_ENDPOINTS;

// ─── UBL 2.1 Namespaces ──────────────────────────────────────
export const UBL_NAMESPACES = {
  invoice: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  creditNote: "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2",
  cac: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
  cbc: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
  ext: "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2",
  sig: "urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2",
  sac: "urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2",
  sbc: "urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2",
  ds: "http://www.w3.org/2000/09/xmldsig#",
  xades: "http://uri.etsi.org/01903/v1.3.2#",
} as const;

// ─── ZATCA Invoice Type Codes ─────────────────────────────────
export const INVOICE_TYPE_CODES = {
  STANDARD_INVOICE: "388",
  CREDIT_NOTE: "381",
  DEBIT_NOTE: "383",
} as const;

// Sub-types
export const INVOICE_SUB_TYPES = {
  STANDARD_TAX_INVOICE: "0100000",    // B2B
  SIMPLIFIED_TAX_INVOICE: "0200000",  // B2C
} as const;

// ─── Payment Means Codes ──────────────────────────────────────
export const PAYMENT_MEANS_CODES = {
  CASH: "10",
  CREDIT: "30",
  BANK_TRANSFER: "42",
  BANK_CARD: "48",
} as const;

// ─── VAT Categories ──────────────────────────────────────────
export const VAT_CATEGORIES = {
  STANDARD: "S",
  ZERO_RATED: "Z",
  EXEMPT: "E",
  OUT_OF_SCOPE: "O",
} as const;

// ─── VAT Exemption Reason Codes ──────────────────────────────
export const VAT_EXEMPTION_REASONS: Record<string, string> = {
  "VATEX-SA-29": "Financial services mentioned in Article 29 of the VAT Regulations",
  "VATEX-SA-29-7": "Life insurance services mentioned in Article 29 of the VAT Regulations",
  "VATEX-SA-30": "Real estate transactions mentioned in Article 30 of the VAT Regulations",
  "VATEX-SA-32": "Export of goods",
  "VATEX-SA-33": "Export of services",
  "VATEX-SA-34-1": "The international transport of Goods",
  "VATEX-SA-34-2": "International transport of passengers",
  "VATEX-SA-34-3": "Services directly connected and incidental to a Supply of international passenger transport",
  "VATEX-SA-34-4": "Supply of a qualifying means of transport",
  "VATEX-SA-34-5": "Any services relating to Goods or passenger transportation",
  "VATEX-SA-35": "Medicines and medical equipment",
  "VATEX-SA-36": "Qualifying metals",
  "VATEX-SA-EDU": "Private education to citizen",
  "VATEX-SA-HEA": "Private healthcare to citizen",
  "VATEX-SA-MLTRY": "Supply of qualified military goods",
  "VATEX-SA-OOS": "Not subject to VAT",
};

// ─── CSR OID Extensions ──────────────────────────────────────
export const CSR_OIDS = {
  invoiceType: "2.5.4.100",
  location: "2.5.4.101",
  industry: "2.5.4.102",
} as const;

// ─── XML Canonicalization ─────────────────────────────────────
export const CANONICALIZATION_METHOD = "http://www.w3.org/2006/12/xml-c14n11";
export const SIGNATURE_METHOD = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
export const DIGEST_METHOD = "http://www.w3.org/2001/04/xmlenc#sha256";
export const TRANSFORM_METHOD = "http://www.w3.org/2006/12/xml-c14n11";

// ─── Initial hash for first invoice in chain ─────────────────
export const INITIAL_PREVIOUS_HASH = "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==";
