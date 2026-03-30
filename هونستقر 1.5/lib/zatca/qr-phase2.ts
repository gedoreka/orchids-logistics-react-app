/**
 * ZATCA Phase 2 - 9-Field QR Code (TLV Encoding)
 * Tags 1-9 as per ZATCA Phase 2 specification
 */
import type { ZatcaQRPhase2 } from "./types";

// ─── TLV Encoding ────────────────────────────────────────────────
function toTLV(tag: number, value: string | Buffer): Buffer {
  const valueBuffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  // Tag is 1 byte, length can be multi-byte
  const tagBuf = Buffer.from([tag]);
  const lenBuf = encodeTLVLength(valueBuffer.length);
  return Buffer.concat([tagBuf, lenBuf, valueBuffer]);
}

function encodeTLVLength(length: number): Buffer {
  if (length < 128) {
    return Buffer.from([length]);
  } else if (length < 256) {
    return Buffer.from([0x81, length]);
  } else {
    return Buffer.from([0x82, (length >> 8) & 0xff, length & 0xff]);
  }
}

// ─── Generate Phase 2 QR code (9 tags) ──────────────────────────
export function generatePhase2QR(data: ZatcaQRPhase2): string {
  const tlvParts: Buffer[] = [];

  // Tag 1: Seller Name (UTF-8)
  tlvParts.push(toTLV(1, data.sellerName));

  // Tag 2: VAT Number (UTF-8)
  tlvParts.push(toTLV(2, data.vatNumber));

  // Tag 3: Timestamp (ISO 8601)
  tlvParts.push(toTLV(3, data.timestamp));

  // Tag 4: Total Amount (with VAT)
  tlvParts.push(toTLV(4, data.totalAmount));

  // Tag 5: VAT Amount
  tlvParts.push(toTLV(5, data.vatAmount));

  // Tag 6: SHA-256 hash of XML (hex string → raw bytes)
  const hashBytes = Buffer.from(data.documentHash, "hex");
  tlvParts.push(toTLV(6, hashBytes));

  // Tag 7: ECDSA Signature (base64 → raw bytes)
  const sigBytes = Buffer.from(data.signature, "base64");
  tlvParts.push(toTLV(7, sigBytes));

  // Tag 8: Public Key (base64 → raw bytes)
  const pubKeyBytes = Buffer.from(data.publicKey, "base64");
  tlvParts.push(toTLV(8, pubKeyBytes));

  // Tag 9: Certificate Signature (base64 → raw bytes)
  const caSigBytes = Buffer.from(data.caSignature, "base64");
  tlvParts.push(toTLV(9, caSigBytes));

  const combined = Buffer.concat(tlvParts);
  return combined.toString("base64");
}

// ─── Simple Phase 1 QR (5 tags, backward compat) ────────────────
export function generatePhase1QR(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalAmount: string | number,
  vatAmount: string | number,
): string {
  const tlvParts = [
    toTLV(1, sellerName),
    toTLV(2, vatNumber),
    toTLV(3, timestamp),
    toTLV(4, String(totalAmount)),
    toTLV(5, String(vatAmount)),
  ];
  return Buffer.concat(tlvParts).toString("base64");
}
