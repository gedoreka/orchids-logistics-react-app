// Client-side helper to sanitize DOM before passing to html2canvas/html2pdf
export async function sanitizeForHtml2Canvas(element: HTMLElement): Promise<HTMLElement> {
  const clone = element.cloneNode(true) as HTMLElement;

  // remove external stylesheets and <style> tags from the clone
  clone.querySelectorAll('link[rel="stylesheet"], style').forEach(n => n.remove());

  const origNodes = [element, ...Array.from(element.querySelectorAll('*'))];
  const cloneNodes = [clone, ...Array.from(clone.querySelectorAll('*'))];

  for (let i = 0; i < origNodes.length; i++) {
    const o = origNodes[i] as HTMLElement;
    const c = cloneNodes[i] as HTMLElement;
    try {
      const cs = window.getComputedStyle(o);
      for (let j = 0; j < cs.length; j++) {
        const prop = cs[j];
        let val = cs.getPropertyValue(prop);
        if (!val) continue;
        if (/lab\(|oklab\(|color-mix\(/i.test(val)) {
          val = replaceColorFns(val, cs);
        }
        try { c.style.setProperty(prop, val, cs.getPropertyPriority(prop)); } catch { }
      }
    } catch (e) {
      // ignore computed-style issues for some nodes
    }
  }

  return clone;
}

function replaceColorFns(val: string, cs: CSSStyleDeclaration) {
  // lab(L% a b) -> rgb(r,g,b)
  val = val.replace(/lab\(([^)]+)\)/g, (_, inside) => {
    const parts = inside.trim().split(/\s+/).map(p => p.replace(/%$/, ''));
    const L = parseFloat(parts[0]);
    const a = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    const rgb = labToSRGB(L, a, b);
    return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
  });

  // oklab(L a b) -> rgb
  val = val.replace(/oklab\(([^)]+)\)/g, (_, inside) => {
    const parts = inside.trim().split(/\s+/).map(p => p.replace(/%$/, ''));
    const L = parseFloat(parts[0]);
    const a = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    const rgb = oklabToSRGB(L, a, b);
    return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
  });

  // color-mix(..., <color> <pct>%, transparent) -> approximate by returning base color or rgba
  val = val.replace(/color-mix\(([^)]+)\)/g, (m) => {
    const inside = m.slice(m.indexOf('(') + 1, -1);
    // try to extract a color token
    const varMatch = inside.match(/var\(([^)]+)\)/);
    if (varMatch) {
      const varName = varMatch[1].trim();
      const resolved = cs.getPropertyValue(varName) || cs.getPropertyValue('color') || 'transparent';
      return resolved;
    }
    // fallback: strip the function
    return inside.split(',')[0] || 'transparent';
  });

  return val;
}

// Convert CIE Lab (L in [0..100], a, b) to sRGB 0..255
function labToSRGB(L: number, a: number, b: number) {
  // convert Lab to XYZ (D65)
  const y = (L + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;

  const xr = pivotInv(x);
  const yr = pivotInv(y);
  const zr = pivotInv(z);

  // D65 reference white
  const X = xr * 0.95047;
  const Y = yr * 1.0;
  const Z = zr * 1.08883;

  return xyzToSRGB(X, Y, Z);
}

function pivotInv(n: number) {
  const n3 = n * n * n;
  return n3 > 0.008856 ? n3 : (n - 16 / 116) / 7.787;
}

function xyzToSRGB(X: number, Y: number, Z: number) {
  // linear RGB
  let r =  3.2406 * X - 1.5372 * Y - 0.4986 * Z;
  let g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
  let b =  0.0557 * X - 0.2040 * Y + 1.0570 * Z;

  // apply gamma correction
  r = compand(r);
  g = compand(g);
  b = compand(b);

  return { r: clamp(r * 255, 0, 255), g: clamp(g * 255, 0, 255), b: clamp(b * 255, 0, 255) };
}

function compand(c: number) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function clamp(v: number, a: number, b: number) { return Math.min(b, Math.max(a, v)); }

// Convert Oklab (L in 0..100) to sRGB. Implementation adapted for typical oklab ranges.
function oklabToSRGB(L: number, a: number, b: number) {
  // normalize L to 0..1
  const l = L / 100;
  const A = a / 100;
  const B = b / 100;

  // Oklab to linear sRGB (approx)
  const l_ = l + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = l - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = l - 0.0894841775 * A - 1.2914855480 * B;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  let R = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let G = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let Bc = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  R = compand(R);
  G = compand(G);
  Bc = compand(Bc);

  return { r: clamp(R * 255, 0, 255), g: clamp(G * 255, 0, 255), b: clamp(Bc * 255, 0, 255) };
}
