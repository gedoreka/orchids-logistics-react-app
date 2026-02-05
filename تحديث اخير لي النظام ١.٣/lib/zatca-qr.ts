/**
 * ZATCA (E-Invoicing) Phase 1 TLV Encoding for QR Code
 * 1. Seller Name
 * 2. VAT Registration Number
 * 3. Timestamp
 * 4. Invoice Total (with VAT)
 * 5. VAT Total
 */

function toTLV(tag: number, value: string): Buffer {
  const valueBuffer = Buffer.from(value, 'utf8');
  const tagBuffer = Buffer.from([tag]);
  const lengthBuffer = Buffer.from([valueBuffer.length]);
  return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}

export function generateZatcaQR(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalAmount: string | number,
  vatAmount: string | number
): string {
  const tlv1 = toTLV(1, sellerName);
  const tlv2 = toTLV(2, vatNumber);
  const tlv3 = toTLV(3, timestamp);
  const tlv4 = toTLV(4, String(totalAmount));
  const tlv5 = toTLV(5, String(vatAmount));

  const combined = Buffer.concat([tlv1, tlv2, tlv3, tlv4, tlv5]);
  return combined.toString('base64');
}
