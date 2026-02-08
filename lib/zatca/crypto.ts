/**
 * ZATCA Phase 2 - Cryptographic Operations
 * Uses OpenSSL CLI for ZATCA-compliant key generation and CSR creation
 * ECDSA secp256k1 signing via elliptic library
 */
import crypto from "crypto";
import { ec as EC } from "elliptic";
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import type { ZatcaCSRConfig } from "./types";

const ec = new EC("secp256k1");

// ─── Key Generation (OpenSSL) ─────────────────────────────────
export function generateKeyPair(): { privateKey: string; publicKey: string; privateKeyPEM: string } {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zatca-"));
  const keyFile = path.join(tmpDir, "private.pem");

  try {
        // Generate secp256k1 private key using OpenSSL - required by ZATCA
        execSync(`openssl ecparam -name secp256k1 -genkey -noout -out "${keyFile}"`, { stdio: "pipe" });
    const privateKeyPEM = fs.readFileSync(keyFile, "utf8");

    // Extract hex private key for elliptic library compatibility
    const pubOut = execSync(`openssl ec -in "${keyFile}" -text -noout 2>&1`, { encoding: "utf8" });

    // Parse private key hex from OpenSSL text output
    const privMatch = pubOut.match(/priv:\s*([\s\S]*?)pub:/);
    let privateKeyHex = "";
    if (privMatch) {
      privateKeyHex = privMatch[1].replace(/[\s:]/g, "").replace(/^00/, "");
    }

    // Parse public key hex
    const pubMatch = pubOut.match(/pub:\s*([\s\S]*?)ASN1/);
    let publicKeyHex = "";
    if (pubMatch) {
      publicKeyHex = pubMatch[1].replace(/[\s:]/g, "");
    } else {
      // Fallback: derive from private key
      const keyPair = ec.keyFromPrivate(privateKeyHex, "hex");
      publicKeyHex = keyPair.getPublic(false, "hex");
    }

    return {
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      privateKeyPEM,
    };
  } finally {
    // Clean up temp files
    try { fs.rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
  }
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
  const raw = publicKeyHex.startsWith("04") ? publicKeyHex.slice(2) : publicKeyHex;
  return Buffer.from(raw, "hex");
}

// ─── CSR Generation (OpenSSL CLI - ZATCA compliant) ───────────
export function generateCSR(privateKeyPEMOrHex: string, config: ZatcaCSRConfig): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "zatca-csr-"));
  const keyFile = path.join(tmpDir, "private.pem");
  const csrFile = path.join(tmpDir, "csr.pem");
  const configFile = path.join(tmpDir, "csr.cnf");

  try {
    // If it's a PEM key, write directly; otherwise convert hex to PEM
    if (privateKeyPEMOrHex.includes("-----BEGIN")) {
      fs.writeFileSync(keyFile, privateKeyPEMOrHex);
    } else {
      // Convert hex private key to PEM using elliptic + OpenSSL
      const keyPair = ec.keyFromPrivate(privateKeyPEMOrHex, "hex");
      const privHex = keyPair.getPrivate("hex").padStart(64, "0");
      const pubHex = keyPair.getPublic(false, "hex");

        // Build raw EC key DER manually: SEQUENCE { INTEGER(1), OCTET STRING(privKey), [0] OID(prime256v1), [1] BIT STRING(pubKey) }
      const privBytes = Buffer.from(privHex, "hex");
      const pubBytes = Buffer.from(pubHex, "hex");

      // Use OpenSSL asn1parse to construct the key, or build DER directly
      const ecPrivKeyDER = buildECPrivateKeyDER(privBytes, pubBytes);
      const derFile = path.join(tmpDir, "private.der");
      fs.writeFileSync(derFile, ecPrivKeyDER);

        // Convert DER to PEM
        execSync(`openssl ec -inform DER -in "${derFile}" -out "${keyFile}"`, { stdio: "pipe" });
    }

    // Determine template name based on environment
    const templateName = config.environment === "production"
      ? "ZATCA-Code-Signing"
      : "PREZATCA-Code-Signing";

      // Build OpenSSL config file matching ZATCA requirements
      const opensslConfig = `
oid_section = OIDs

[ OIDs ]
certificateTemplateName = 1.3.6.1.4.1.311.20.2

[ req ]
default_bits = 2048
req_extensions = v3_req
prompt = no
default_md = sha256
utf8 = yes
distinguished_name = dn

[ dn ]
C = ${config.countryName}
OU = ${config.organizationUnit || config.organizationName}
O = ${config.organizationName}
CN = ${config.commonName}

[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation
certificateTemplateName = ASN1:PRINTABLESTRING:${templateName}
subjectAltName = dirName:alt_dn

[ alt_dn ]
SN = ${config.serialNumber}
UID = ${config.organizationIdentifier}
title = ${config.invoiceType}
registeredAddress = ${config.location}
businessCategory = ${config.industry}
`;

    fs.writeFileSync(configFile, opensslConfig);

    // Generate CSR using OpenSSL
      const csrOutput = execSync(
          `openssl req -new -sha256 -key "${keyFile}" -extensions v3_req -config "${configFile}" -out "${csrFile}" -utf8 2>&1`,
        { encoding: "utf8" }
      );
      if (csrOutput && csrOutput.includes("error")) {
        throw new Error(`OpenSSL CSR generation failed: ${csrOutput}`);
      }

      // Verify CSR is valid
      try {
        execSync(`openssl req -in "${csrFile}" -verify -noout 2>&1`, { encoding: "utf8" });
      } catch (verifyErr: any) {
        console.error("[ZATCA CSR] Verification failed:", verifyErr.message);
        throw new Error(`Generated CSR failed verification: ${verifyErr.message}`);
      }

    const csrPEM = fs.readFileSync(csrFile, "utf8").trim();
    return csrPEM;
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
  }
}

export function getCSRBase64(csrPEM: string): string {
  return csrPEM
    .replace("-----BEGIN CERTIFICATE REQUEST-----", "")
    .replace("-----END CERTIFICATE REQUEST-----", "")
    .replace(/\n/g, "")
    .trim();
}

// ─── Build EC Private Key DER ─────────────────────────────────
function buildECPrivateKeyDER(privBytes: Buffer, pubBytes: Buffer): Buffer {
  // ECPrivateKey ::= SEQUENCE {
  //   version        INTEGER { ecPrivkeyVer1(1) },
  //   privateKey     OCTET STRING,
  //   parameters [0] ECParameters OPTIONAL,
  //   publicKey  [1] BIT STRING OPTIONAL
  // }
  const version = Buffer.from([0x02, 0x01, 0x01]); // INTEGER 1
  const privOctet = Buffer.concat([Buffer.from([0x04, privBytes.length]), privBytes]);
  
    // prime256v1 (P-256/secp256r1) OID: 1.2.840.10045.3.1.7
    const curveOID = Buffer.from([0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]);
  const params = Buffer.concat([Buffer.from([0xa0, curveOID.length]), curveOID]);
  
  // Public key as BIT STRING
  const pubBitString = Buffer.concat([Buffer.from([0x03, pubBytes.length + 1, 0x00]), pubBytes]);
  const pubContext = Buffer.concat([Buffer.from([0xa1, pubBitString.length]), pubBitString]);
  
  const content = Buffer.concat([version, privOctet, params, pubContext]);
  const totalLen = derLengthBuf(content.length);
  return Buffer.concat([Buffer.from([0x30]), totalLen, content]);
}

function derLengthBuf(length: number): Buffer {
  if (length < 0x80) {
    return Buffer.from([length]);
  } else if (length < 0x100) {
    return Buffer.from([0x81, length]);
  } else {
    return Buffer.from([0x82, (length >> 8) & 0xff, length & 0xff]);
  }
}

// ─── Certificate Parsing ──────────────────────────────────────
export function extractPublicKeyFromCertificate(certBase64: string): string {
  try {
    const certDER = Buffer.from(certBase64, "base64");
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
    offset++;
    length--;
    return certDER.subarray(offset, offset + length);
  } catch {
    return Buffer.alloc(0);
  }
}
