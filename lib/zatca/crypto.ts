/**
 * ZATCA Phase 2 - Cryptographic Operations
 * ECDSA secp256k1 key generation, CSR generation, signing, hashing
 */
import crypto from "crypto";
import { ec as EC } from "elliptic";
import type { ZatcaCSRConfig } from "./types";

const ec = new EC("secp256k1");

// ─── Key Generation ───────────────────────────────────────────
export function generateKeyPair(): { privateKey: string; publicKey: string } {
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate("hex");
  const publicKeyUncompressed = keyPair.getPublic(false, "hex"); // 04 + x + y (65 bytes)
  return {
    privateKey,
    publicKey: publicKeyUncompressed,
  };
}

export function getPublicKeyFromPrivate(privateKeyHex: string): string {
  const keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
  return keyPair.getPublic(false, "hex");
}

// ─── SHA-256 Hash ─────────────────────────────────────────────
export function sha256Hash(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

export function sha256HashBase64(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("base64");
}

export function sha256HashBuffer(data: string): Buffer {
  return crypto.createHash("sha256").update(data, "utf8").digest();
}

// ─── ECDSA Signing ────────────────────────────────────────────
export function signData(privateKeyHex: string, data: string): string {
  const hash = sha256HashBuffer(data);
  const keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
  const signature = keyPair.sign(hash);
  // DER encoded signature
  return Buffer.from(signature.toDER()).toString("base64");
}

export function signHash(privateKeyHex: string, hashHex: string): string {
  const hashBuffer = Buffer.from(hashHex, "hex");
  const keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
  const signature = keyPair.sign(hashBuffer);
  return Buffer.from(signature.toDER()).toString("base64");
}

export function verifySignature(publicKeyHex: string, data: string, signatureBase64: string): boolean {
  try {
    const hash = sha256HashBuffer(data);
    const key = ec.keyFromPublic(publicKeyHex, "hex");
    const sigDER = Buffer.from(signatureBase64, "base64");
    return key.verify(hash, sigDER);
  } catch {
    return false;
  }
}

// ─── Public Key Raw Bytes (for QR Tag 8) ──────────────────────
export function getPublicKeyRawBytes(publicKeyHex: string): Buffer {
  // Remove 04 prefix to get raw 64 bytes (x + y coordinates)
  const raw = publicKeyHex.startsWith("04") ? publicKeyHex.slice(2) : publicKeyHex;
  return Buffer.from(raw, "hex");
}

// ─── CSR Generation ───────────────────────────────────────────
export function generateCSR(privateKeyHex: string, config: ZatcaCSRConfig): string {
  // Build CSR using Node.js crypto
  // ZATCA requires specific OIDs for invoice type, location, industry
  
  const keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
  const publicKeyDER = buildECPublicKeyDER(keyPair);
  
  // Build the subject for ZATCA CSR
  const subject = buildCSRSubject(config);
  
  // Build extensions  
  const extensions = buildCSRExtensions(config);
  
  // Build CertificationRequestInfo
  const certReqInfo = buildCertificationRequestInfo(subject, publicKeyDER, extensions);
  
  // Sign the CertificationRequestInfo
  const hash = crypto.createHash("sha256").update(certReqInfo).digest();
  const signature = keyPair.sign(hash);
  const sigDER = Buffer.from(signature.toDER());
  
  // Build final CSR
  const csr = buildCSRStructure(certReqInfo, sigDER);
  
  // PEM encode
  const base64 = csr.toString("base64");
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN CERTIFICATE REQUEST-----\n${lines.join("\n")}\n-----END CERTIFICATE REQUEST-----`;
}

export function getCSRBase64(csrPEM: string): string {
  return csrPEM
    .replace("-----BEGIN CERTIFICATE REQUEST-----", "")
    .replace("-----END CERTIFICATE REQUEST-----", "")
    .replace(/\n/g, "")
    .trim();
}

// ─── Certificate Parsing ──────────────────────────────────────
export function extractPublicKeyFromCertificate(certBase64: string): string {
  try {
    const certDER = Buffer.from(certBase64, "base64");
    // Simple extraction: find the EC public key in the cert
    // EC secp256k1 public key is 65 bytes starting with 0x04
    for (let i = 0; i < certDER.length - 65; i++) {
      if (certDER[i] === 0x04) {
        const candidate = certDER.subarray(i, i + 65);
        try {
          ec.keyFromPublic(Buffer.from(candidate).toString("hex"), "hex");
          return Buffer.from(candidate).toString("hex");
        } catch {
          continue;
        }
      }
    }
    throw new Error("Could not extract public key from certificate");
  } catch (error) {
    throw new Error(`Certificate parsing failed: ${error}`);
  }
}

export function extractCertificateSignature(certBase64: string): Buffer {
  try {
    const certDER = Buffer.from(certBase64, "base64");
    // The signature is typically the last BIT STRING in the certificate
    // Find the last BIT STRING (tag 0x03)
    let lastBitStringOffset = -1;
    for (let i = certDER.length - 1; i >= 0; i--) {
      if (certDER[i] === 0x03 && i > 10) {
        lastBitStringOffset = i;
        break;
      }
    }
    if (lastBitStringOffset === -1) {
      return Buffer.alloc(0);
    }
    // Parse length
    let offset = lastBitStringOffset + 1;
    let length = certDER[offset];
    offset++;
    if (length & 0x80) {
      const numBytes = length & 0x7f;
      length = 0;
      for (let i = 0; i < numBytes; i++) {
        length = (length << 8) | certDER[offset + i];
      }
      offset += numBytes;
    }
    // Skip unused bits byte
    offset++;
    length--;
    return certDER.subarray(offset, offset + length);
  } catch {
    return Buffer.alloc(0);
  }
}

// ─── ASN.1 DER Helpers ────────────────────────────────────────
function derLength(length: number): Buffer {
  if (length < 0x80) {
    return Buffer.from([length]);
  } else if (length < 0x100) {
    return Buffer.from([0x81, length]);
  } else {
    return Buffer.from([0x82, (length >> 8) & 0xff, length & 0xff]);
  }
}

function derSequence(...items: Buffer[]): Buffer {
  const content = Buffer.concat(items);
  return Buffer.concat([Buffer.from([0x30]), derLength(content.length), content]);
}

function derSet(...items: Buffer[]): Buffer {
  const content = Buffer.concat(items);
  return Buffer.concat([Buffer.from([0x31]), derLength(content.length), content]);
}

function derOID(oid: string): Buffer {
  const parts = oid.split(".").map(Number);
  const encoded: number[] = [];
  encoded.push(parts[0] * 40 + parts[1]);
  for (let i = 2; i < parts.length; i++) {
    let val = parts[i];
    if (val < 128) {
      encoded.push(val);
    } else {
      const bytes: number[] = [];
      while (val > 0) {
        bytes.unshift(val & 0x7f);
        val >>= 7;
      }
      for (let j = 0; j < bytes.length - 1; j++) {
        bytes[j] |= 0x80;
      }
      encoded.push(...bytes);
    }
  }
  return Buffer.concat([Buffer.from([0x06]), derLength(encoded.length), Buffer.from(encoded)]);
}

function derUTF8String(str: string): Buffer {
  const buf = Buffer.from(str, "utf8");
  return Buffer.concat([Buffer.from([0x0c]), derLength(buf.length), buf]);
}

function derPrintableString(str: string): Buffer {
  const buf = Buffer.from(str, "ascii");
  return Buffer.concat([Buffer.from([0x13]), derLength(buf.length), buf]);
}

function derBitString(data: Buffer): Buffer {
  const content = Buffer.concat([Buffer.from([0x00]), data]); // 0 unused bits
  return Buffer.concat([Buffer.from([0x03]), derLength(content.length), content]);
}

function derInteger(value: number): Buffer {
  const buf = Buffer.from([value]);
  return Buffer.concat([Buffer.from([0x02, buf.length]), buf]);
}

function derContextTag(tagNum: number, data: Buffer, constructed: boolean = true): Buffer {
  const tag = (constructed ? 0xa0 : 0x80) | tagNum;
  return Buffer.concat([Buffer.from([tag]), derLength(data.length), data]);
}

function buildRDN(oid: string, value: string, useUTF8: boolean = false): Buffer {
  const attrValue = useUTF8 ? derUTF8String(value) : derPrintableString(value);
  return derSet(derSequence(derOID(oid), attrValue));
}

function buildCSRSubject(config: ZatcaCSRConfig): Buffer {
  const rdns: Buffer[] = [
    buildRDN("2.5.4.6", config.countryName),           // C
    buildRDN("2.5.4.10", config.organizationName, true), // O
    buildRDN("2.5.4.97", config.organizationIdentifier), // organizationIdentifier
    buildRDN("2.5.4.3", config.commonName, true),        // CN
    buildRDN("2.5.4.5", config.serialNumber),            // serialNumber
  ];
  return derSequence(...rdns);
}

function buildCSRExtensions(config: ZatcaCSRConfig): Buffer {
  // SAN extension with custom OIDs
  const dirName = derSequence(
    buildRDN("2.5.4.100", config.invoiceType, true),
    buildRDN("2.5.4.101", config.location, true),
    buildRDN("2.5.4.102", config.industry, true),
  );
  
  // SubjectAltName with directoryName
  const sanContent = derContextTag(4, dirName);
  const sanExtension = derSequence(
    derOID("2.5.29.17"), // subjectAltName
    Buffer.concat([
      Buffer.from([0x04]),
      derLength(derSequence(sanContent).length),
      derSequence(sanContent),
    ])
  );
  
  return derContextTag(0, derSequence(
    derSequence(
      derOID("1.2.840.113549.1.9.14"), // extensionRequest
      derSet(derSequence(sanExtension))
    )
  ));
}

function buildECPublicKeyDER(keyPair: EC.KeyPair): Buffer {
  const publicKeyBytes = Buffer.from(keyPair.getPublic(false, "hex"), "hex"); // 65 bytes: 04 + x + y
  const algorithmIdentifier = derSequence(
    derOID("1.2.840.10045.2.1"),   // ecPublicKey
    derOID("1.3.132.0.10"),         // secp256k1
  );
  return derSequence(algorithmIdentifier, derBitString(publicKeyBytes));
}

function buildCertificationRequestInfo(subject: Buffer, publicKeyDER: Buffer, extensions: Buffer): Buffer {
  return derSequence(
    derInteger(0), // version
    subject,
    publicKeyDER,
    extensions,
  );
}

function buildCSRStructure(certReqInfo: Buffer, signatureDER: Buffer): Buffer {
  const signatureAlgorithm = derSequence(
    derOID("1.2.840.10045.4.3.2"), // ecdsa-with-SHA256
  );
  return derSequence(certReqInfo, signatureAlgorithm, derBitString(signatureDER));
}
