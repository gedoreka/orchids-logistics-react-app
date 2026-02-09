/**
 * ZATCA Phase 2 - UBL 2.1 XML Builder
 * Builds compliant XML invoices for ZATCA e-invoicing
 */
import crypto from "crypto";
import { UBL_NAMESPACES } from "./constants";
import { sha256HashBytesBase64, signHash, sha256Hash, getPublicKeyRawBytes, extractCertificateSignature, extractCertificateIssuerAndSerial } from "./crypto";
import { getInvoiceHashInput } from "./canonicalizer";
import type { ZatcaInvoiceData, ZatcaLineItem } from "./types";

interface SigningInfo {
  privateKey: string;
  certificate: string; // base64 encoded certificate
  previousInvoiceHash: string;
}

// ─── Amount formatting ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toFixed(2);
}

// ─── Build line items XML ────────────────────────────────────────
function buildLineItems(items: ZatcaLineItem[], isCredit: boolean): string {
  const tagName = isCredit ? "cac:CreditNoteLine" : "cac:InvoiceLine";
  const qtyTag = isCredit ? "cbc:CreditedQuantity" : "cbc:InvoicedQuantity";

  return items.map((item, index) => {
    const lineDiscount = item.discount || 0;
    const netAmount = item.totalBeforeVat;

    return `
    <${tagName}>
      <cbc:ID>${index + 1}</cbc:ID>
      <${qtyTag} unitCode="PCE">${item.quantity}</${qtyTag}>
      <cbc:LineExtensionAmount currencyID="SAR">${fmt(netAmount)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="SAR">${fmt(item.vatAmount)}</cbc:TaxAmount>
        <cbc:RoundingAmount currencyID="SAR">${fmt(item.totalWithVat)}</cbc:RoundingAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${escapeXml(item.name)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${item.vatCategory}</cbc:ID>
          <cbc:Percent>${fmt(item.vatRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="SAR">${fmt(item.unitPrice)}</cbc:PriceAmount>${lineDiscount > 0 ? `
        <cac:AllowanceCharge>
          <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
          <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
          <cbc:Amount currencyID="SAR">${fmt(lineDiscount)}</cbc:Amount>
        </cac:AllowanceCharge>` : ""}
      </cac:Price>
    </${tagName}>`;
  }).join("");
}

// ─── Build VAT breakdown ─────────────────────────────────────────
function buildTaxSubtotals(items: ZatcaLineItem[]): string {
  // Group by VAT category + rate
  const groups: Record<string, { taxable: number; vat: number; rate: number; category: string }> = {};
  for (const item of items) {
    const key = `${item.vatCategory}-${item.vatRate}`;
    if (!groups[key]) {
      groups[key] = { taxable: 0, vat: 0, rate: item.vatRate, category: item.vatCategory };
    }
    groups[key].taxable += item.totalBeforeVat;
    groups[key].vat += item.vatAmount;
  }

  return Object.values(groups).map(g => `
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="SAR">${fmt(g.taxable)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="SAR">${fmt(g.vat)}</cbc:TaxAmount>
          <cac:TaxCategory>
            <cbc:ID>${g.category}</cbc:ID>
            <cbc:Percent>${fmt(g.rate)}</cbc:Percent>
            <cac:TaxScheme>
              <cbc:ID>VAT</cbc:ID>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>`).join("");
}

// ─── Escape XML ──────────────────────────────────────────────────
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── Build unsigned invoice XML ──────────────────────────────────
export function buildUnsignedXml(data: ZatcaInvoiceData): string {
  const isCredit = data.invoiceTypeCode === "381";
  const rootTag = isCredit ? "CreditNote" : "Invoice";
  const rootNs = isCredit ? UBL_NAMESPACES.creditNote : UBL_NAMESPACES.invoice;
  const discount = data.discount || 0;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag}
  xmlns="${rootNs}"
  xmlns:cac="${UBL_NAMESPACES.cac}"
  xmlns:cbc="${UBL_NAMESPACES.cbc}"
  xmlns:ext="${UBL_NAMESPACES.ext}">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
      <ext:ExtensionContent>
        <!-- SIGNATURE_PLACEHOLDER -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(data.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${data.id}</cbc:UUID>
  <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${data.issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${data.invoiceSubType}">${data.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${data.currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${data.currency}</cbc:TaxCurrencyCode>
  ${data.billingReferenceId ? `<cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>${escapeXml(data.billingReferenceId)}</cbc:ID>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>` : ""}
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${data.invoiceCounterValue}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${data.previousInvoiceHash || ""}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>QR</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">QR_PLACEHOLDER</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:Signature>
    <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
    <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
  </cac:Signature>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${escapeXml(data.sellerCRNumber)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(data.sellerStreet)}</cbc:StreetName>
        ${data.sellerBuildingNumber ? `<cbc:BuildingNumber>${escapeXml(data.sellerBuildingNumber)}</cbc:BuildingNumber>` : ""}
        <cbc:CitySubdivisionName>${escapeXml(data.sellerDistrict)}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(data.sellerCity)}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(data.sellerPostalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${data.sellerCountry}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(data.sellerVatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(data.sellerName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${data.buyerVatNumber ? `<cac:PartyIdentification>
        <cbc:ID schemeID="VAT">${escapeXml(data.buyerVatNumber)}</cbc:ID>
      </cac:PartyIdentification>` : ""}
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(data.buyerStreet || "")}</cbc:StreetName>
        <cbc:CitySubdivisionName>${escapeXml(data.buyerDistrict || "")}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(data.buyerCity || "")}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(data.buyerPostalCode || "")}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${data.buyerCountry || "SA"}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ${data.buyerVatNumber ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(data.buyerVatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>` : ""}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(data.buyerName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  ${data.paymentMeansCode ? `<cac:PaymentMeans>
    <cbc:PaymentMeansCode>${data.paymentMeansCode}</cbc:PaymentMeansCode>
  </cac:PaymentMeans>` : ""}${discount > 0 ? `
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="SAR">${fmt(discount)}</cbc:Amount>
    <cac:TaxCategory>
      <cbc:ID>S</cbc:ID>
      <cbc:Percent>15.00</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:AllowanceCharge>` : ""}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${fmt(data.totalVat)}</cbc:TaxAmount>
    ${buildTaxSubtotals(data.items)}
  </cac:TaxTotal>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${fmt(data.totalVat)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${fmt(data.totalBeforeVat + discount)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${fmt(data.totalBeforeVat)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${fmt(data.totalWithVat)}</cbc:TaxInclusiveAmount>${discount > 0 ? `
    <cbc:AllowanceTotalAmount currencyID="SAR">${fmt(discount)}</cbc:AllowanceTotalAmount>` : ""}
    <cbc:PayableAmount currencyID="SAR">${fmt(data.totalWithVat)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${buildLineItems(data.items, isCredit)}
</${rootTag}>`;

  return xml;
}

// ─── Build XAdES SignedProperties block ──────────────────────────
function buildSignedProperties(
  signingTime: string,
  certDigest: string,
  issuerName: string,
  serialNumber: string,
): string {
  // Build the SignedProperties XML
  return `<xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties"><xades:SignedSignatureProperties><xades:SigningTime>${signingTime}</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certDigest}</ds:DigestValue></xades:CertDigest><xades:IssuerSerial><ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${issuerName}</ds:X509IssuerName><ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${serialNumber}</ds:X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate></xades:SignedSignatureProperties></xades:SignedProperties>`;
}

// ─── Hash SignedProperties (linearized, no whitespace between tags) ──
function hashSignedProperties(signedPropertiesXml: string): string {
  // Linearize: remove newlines/tabs and spaces between tags
  const linearized = signedPropertiesXml
    .replace(/\r|\n/g, "")
    .replace(/>\s+</g, "><")
    .trim();
  return crypto.createHash("sha256").update(linearized).digest("base64");
}

// ─── Build XMLDSig signature block ───────────────────────────────
function buildSignatureBlock(
  invoiceHashBase64: string,
  signatureValue: string,
  certificateBase64: string,
  signingTime: string,
  certDigest: string,
  issuerName: string,
  serialNumber: string,
): string {
  // Step A: Build SignedProperties
  const signedPropsXml = buildSignedProperties(signingTime, certDigest, issuerName, serialNumber);
  
  // Step B: Hash the linearized SignedProperties
  const signedPropsDigest = hashSignedProperties(signedPropsXml);

  return `
      <sig:UBLDocumentSignatures xmlns:sig="${UBL_NAMESPACES.sig}"
        xmlns:sac="${UBL_NAMESPACES.sac}"
        xmlns:sbc="${UBL_NAMESPACES.sbc}">
        <sac:SignatureInformation>
          <cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
          <sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
          <ds:Signature xmlns:ds="${UBL_NAMESPACES.ds}" Id="signature">
            <ds:SignedInfo>
              <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
              <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
              <ds:Reference Id="invoiceSignedData" URI="">
                <ds:Transforms>
                  <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                    <ds:XPath>not(//ancestor-or-self::ext:UBLExtensions)</ds:XPath>
                  </ds:Transform>
                  <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                    <ds:XPath>not(//ancestor-or-self::cac:Signature)</ds:XPath>
                  </ds:Transform>
                  <ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
                    <ds:XPath>not(//ancestor-or-self::cac:AdditionalDocumentReference[cbc:ID='QR'])</ds:XPath>
                  </ds:Transform>
                  <ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
                </ds:Transforms>
                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                <ds:DigestValue>${invoiceHashBase64}</ds:DigestValue>
              </ds:Reference>
              <ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#xadesSignedProperties">
                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                <ds:DigestValue>${signedPropsDigest}</ds:DigestValue>
              </ds:Reference>
            </ds:SignedInfo>
            <ds:SignatureValue>${signatureValue}</ds:SignatureValue>
            <ds:KeyInfo>
              <ds:X509Data>
                <ds:X509Certificate>${certificateBase64}</ds:X509Certificate>
              </ds:X509Data>
            </ds:KeyInfo>
            <ds:Object>
              <xades:QualifyingProperties xmlns:xades="${UBL_NAMESPACES.xades}" Target="signature">
                <xades:SignedProperties Id="xadesSignedProperties">
                  <xades:SignedSignatureProperties>
                    <xades:SigningTime>${signingTime}</xades:SigningTime>
                    <xades:SigningCertificate>
                      <xades:Cert>
                        <xades:CertDigest>
                          <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                          <ds:DigestValue>${certDigest}</ds:DigestValue>
                        </xades:CertDigest>
                        <xades:IssuerSerial>
                          <ds:X509IssuerName>${issuerName}</ds:X509IssuerName>
                          <ds:X509SerialNumber>${serialNumber}</ds:X509SerialNumber>
                        </xades:IssuerSerial>
                      </xades:Cert>
                    </xades:SigningCertificate>
                  </xades:SignedSignatureProperties>
                </xades:SignedProperties>
              </xades:QualifyingProperties>
            </ds:Object>
          </ds:Signature>
        </sac:SignatureInformation>
      </sig:UBLDocumentSignatures>`;
}

// ─── Build ds:SignedInfo element (for signing) ──────────────────
function buildSignedInfo(
  invoiceHashBase64: string,
  signedPropsDigest: string,
): string {
  return `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/><ds:Reference Id="invoiceSignedData" URI=""><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116"><ds:XPath>not(//ancestor-or-self::ext:UBLExtensions)</ds:XPath></ds:Transform><ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116"><ds:XPath>not(//ancestor-or-self::cac:Signature)</ds:XPath></ds:Transform><ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116"><ds:XPath>not(//ancestor-or-self::cac:AdditionalDocumentReference[cbc:ID='QR'])</ds:XPath></ds:Transform><ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${invoiceHashBase64}</ds:DigestValue></ds:Reference><ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#xadesSignedProperties"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${signedPropsDigest}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
}

// ─── Build fully signed XML ──────────────────────────────────────
export function buildSignedXml(data: ZatcaInvoiceData, signing: SigningInfo): {
  xml: string;
  invoiceHash: string;
  signature: string;
  qrBase64: string;
} {
  // Step 1: Build unsigned XML
  const unsignedXml = buildUnsignedXml(data);

  // Step 2: Get hash input (remove extensions + Signature + QR, canonicalize)
  const hashInput = getInvoiceHashInput(unsignedXml);
  const invoiceHashHex = sha256Hash(hashInput);
  const invoiceHashBase64 = Buffer.from(invoiceHashHex, "hex").toString("base64");

  // Step 3: Compute certificate digest = Base64(SHA256(DER bytes of cert))
  const certDerBytes = Buffer.from(signing.certificate, "base64");
  const certDigest = sha256HashBytesBase64(certDerBytes);

  // Step 4: Extract certificate issuer DN and serial number
  const { issuerName, serialNumber } = extractCertificateIssuerAndSerial(signing.certificate);

  // Step 5: Build and hash SignedProperties
  const signingTime = `${data.issueDate}T${data.issueTime}Z`;
  const signedPropsXml = buildSignedProperties(signingTime, certDigest, issuerName, serialNumber);
  const signedPropsDigest = hashSignedProperties(signedPropsXml);

  // Step 6: Build SignedInfo, then sign it
  const signedInfoXml = buildSignedInfo(invoiceHashBase64, signedPropsDigest);
  const signedInfoHash = crypto.createHash("sha256").update(signedInfoXml).digest("hex");
  const signatureValue = signHash(signing.privateKey, signedInfoHash);

  // Step 7: Build full signature block
  const signatureBlock = buildSignatureBlock(
    invoiceHashBase64,
    signatureValue,
    signing.certificate,
    signingTime,
    certDigest,
    issuerName,
    serialNumber,
  );

  // Step 8: Insert signature into XML
  let signedXml = unsignedXml.replace(
    "<!-- SIGNATURE_PLACEHOLDER -->",
    signatureBlock
  );

  // Step 9: Build QR code
  const { generatePhase2QR } = require("./qr-phase2");
  const qrBase64 = generatePhase2QR({
    sellerName: data.sellerName,
    vatNumber: data.sellerVatNumber,
    timestamp: signingTime,
    totalAmount: fmt(data.totalWithVat),
    vatAmount: fmt(data.totalVat),
    documentHash: invoiceHashHex,
    signature: signatureValue,
    publicKey: Buffer.from(
      getPublicKeyRawBytes(
        require("./crypto").getPublicKeyFromPrivate(signing.privateKey)
      )
    ).toString("base64"),
    caSignature: extractCertificateSignature(signing.certificate).toString("base64"),
  });

  // Step 10: Insert QR into XML
  signedXml = signedXml.replace("QR_PLACEHOLDER", qrBase64);

  return {
    xml: signedXml,
    invoiceHash: invoiceHashBase64,
    signature: signatureValue,
    qrBase64,
  };
}
