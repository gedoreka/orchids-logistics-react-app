/**
 * ZATCA Phase 2 - XML Canonicalization (C14N 1.1)
 * Simplified canonicalization for ZATCA UBL 2.1 invoices
 */

interface XMLAttribute {
  name: string;
  value: string;
}

interface XMLNode {
  type: "element" | "text" | "comment" | "pi";
  name?: string;
  attributes?: XMLAttribute[];
  children?: XMLNode[];
  text?: string;
  namespace?: string;
}

// ─── Simple XML Parser ─────────────────────────────────────────
function parseXML(xml: string): XMLNode {
  let pos = 0;
  const len = xml.length;

  function skipWhitespace() {
    while (pos < len && /\s/.test(xml[pos])) pos++;
  }

  function readUntil(ch: string): string {
    const start = pos;
    while (pos < len && xml[pos] !== ch) pos++;
    return xml.substring(start, pos);
  }

  function parseAttributes(): XMLAttribute[] {
    const attrs: XMLAttribute[] = [];
    while (pos < len) {
      skipWhitespace();
      if (xml[pos] === ">" || xml[pos] === "/" || xml[pos] === "?") break;
      const nameStart = pos;
      while (pos < len && xml[pos] !== "=" && xml[pos] !== ">" && !/\s/.test(xml[pos])) pos++;
      const name = xml.substring(nameStart, pos).trim();
      if (!name) break;
      skipWhitespace();
      if (xml[pos] === "=") {
        pos++; // skip =
        skipWhitespace();
        const quote = xml[pos];
        pos++; // skip quote
        const value = readUntil(quote);
        pos++; // skip closing quote
        attrs.push({ name, value });
      }
    }
    return attrs;
  }

  function parseNode(): XMLNode | null {
    if (pos >= len) return null;

    // Text node
    if (xml[pos] !== "<") {
      const textStart = pos;
      while (pos < len && xml[pos] !== "<") pos++;
      const text = xml.substring(textStart, pos);
      if (text.trim()) {
        return { type: "text", text };
      }
      return null;
    }

    // Skip XML declaration
    if (xml.substring(pos, pos + 5) === "<?xml") {
      while (pos < len && xml.substring(pos, pos + 2) !== "?>") pos++;
      pos += 2;
      return null;
    }

    // Skip processing instructions
    if (xml.substring(pos, pos + 2) === "<?") {
      while (pos < len && xml.substring(pos, pos + 2) !== "?>") pos++;
      pos += 2;
      return { type: "pi" };
    }

    // Skip comments
    if (xml.substring(pos, pos + 4) === "<!--") {
      while (pos < len && xml.substring(pos, pos + 3) !== "-->") pos++;
      pos += 3;
      return { type: "comment" };
    }

    // Closing tag - handled by caller
    if (xml[pos + 1] === "/") return null;

    // Element
    pos++; // skip <
    const nameStart = pos;
    while (pos < len && xml[pos] !== ">" && xml[pos] !== "/" && !/\s/.test(xml[pos])) pos++;
    const name = xml.substring(nameStart, pos);

    const attributes = parseAttributes();
    const children: XMLNode[] = [];

    skipWhitespace();

    if (xml[pos] === "/") {
      pos += 2; // skip />
      return { type: "element", name, attributes, children };
    }

    pos++; // skip >

    // Parse children
    while (pos < len) {
      skipWhitespace();
      if (pos >= len) break;

      // Check for closing tag
      if (xml[pos] === "<" && xml[pos + 1] === "/") {
        pos += 2;
        while (pos < len && xml[pos] !== ">") pos++;
        pos++; // skip >
        break;
      }

      const child = parseNode();
      if (child) children.push(child);
    }

    return { type: "element", name, attributes, children };
  }

  // Skip BOM
  if (xml.charCodeAt(0) === 0xfeff) pos++;

  const children: XMLNode[] = [];
  while (pos < len) {
    skipWhitespace();
    if (pos >= len) break;
    const node = parseNode();
    if (node && node.type === "element") return node;
  }

  return children[0] || { type: "element", name: "root", attributes: [], children: [] };
}

// ─── Escape XML special characters ──────────────────────────────
function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\t/g, "&#x9;")
    .replace(/\n/g, "&#xA;")
    .replace(/\r/g, "&#xD;");
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r/g, "&#xD;");
}

// ─── Namespace-aware attribute sorting (C14N 1.1) ────────────────
function sortAttributes(attrs: XMLAttribute[]): XMLAttribute[] {
  const nsAttrs = attrs.filter(a => a.name === "xmlns" || a.name.startsWith("xmlns:"));
  const regularAttrs = attrs.filter(a => a.name !== "xmlns" && !a.name.startsWith("xmlns:"));

  // Sort namespace declarations: default xmlns first, then by prefix
  nsAttrs.sort((a, b) => {
    if (a.name === "xmlns") return -1;
    if (b.name === "xmlns") return 1;
    return a.name.localeCompare(b.name);
  });

  // Sort regular attributes by namespace URI then local name
  regularAttrs.sort((a, b) => a.name.localeCompare(b.name));

  return [...nsAttrs, ...regularAttrs];
}

// ─── Serialize node to canonical XML ─────────────────────────────
function serializeNode(node: XMLNode): string {
  if (node.type === "text") {
    return escapeXmlText(node.text || "");
  }

  if (node.type !== "element" || !node.name) return "";

  const sortedAttrs = sortAttributes(node.attributes || []);
  const attrStr = sortedAttrs
    .map(a => ` ${a.name}="${escapeXmlAttr(a.value)}"`)
    .join("");

  const childContent = (node.children || []).map(c => serializeNode(c)).join("");

  // C14N always uses explicit close tags, never self-closing
  return `<${node.name}${attrStr}>${childContent}</${node.name}>`;
}

// ─── Main canonicalize function ──────────────────────────────────
export function canonicalizeXml(xml: string): string {
  const root = parseXML(xml.trim());
  return serializeNode(root);
}

// ─── Remove specific elements for signing ────────────────────────
export function removeSignatureElement(xml: string): string {
  // Remove UBLExtensions element for hash calculation
  return xml.replace(/<ext:UBLExtensions>[\s\S]*?<\/ext:UBLExtensions>/g, "");
}

export function removeQRElement(xml: string): string {
  // Remove QR code element
  return xml.replace(
    /<cac:AdditionalDocumentReference>\s*<cbc:ID>QR<\/cbc:ID>[\s\S]*?<\/cac:AdditionalDocumentReference>/g,
    ""
  );
}

export function removeSignatureAndQR(xml: string): string {
  let result = removeSignatureElement(xml);
  result = removeQRElement(result);
  return result;
}

/**
 * Get the invoice XML ready for hash calculation.
 * Per ZATCA spec: remove UBLExtensions and QR, then canonicalize.
 */
export function getInvoiceHashInput(xml: string): string {
  const stripped = removeSignatureAndQR(xml);
  return canonicalizeXml(stripped);
}
