// CSS colour string -> sRGB 0-255 + alpha (no canvas; exact for low alpha).
const g = (v) => { v = Math.max(0, Math.min(1, v)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055); };
const num = (s, scale = 1) => (s.endsWith('%') ? (parseFloat(s) / 100) * scale : parseFloat(s));
function oklab(Lc, a, b) {
  const l_ = Lc + 0.3963377774 * a + 0.2158037573 * b, m_ = Lc - 0.1055613458 * a - 0.0638541728 * b, s_ = Lc - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return { r: g(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), g: g(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), b: g(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) };
}
function parse(str) {
  if (!str) return null; const s = str.trim();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) { let h = m[1]; if (h.length <= 4) h = [...h].map((c) => c + c).join(''); const v = (i) => parseInt(h.slice(i, i + 2), 16); return { r: v(0), g: v(2), b: v(4), a: h.length === 8 ? v(6) / 255 : 1 }; }
  m = /^(rgba?|color|oklab|oklch)\((.*)\)$/i.exec(s); if (!m) return { unparsed: s };
  const fn = m[1].toLowerCase(); let body = m[2].trim(); let alpha = 1;
  const sl = body.split('/'); if (sl.length > 1) { alpha = num(sl[1].trim()); body = sl[0].trim(); }
  let parts = body.split(/[\s,]+/).filter(Boolean);
  if (fn === 'rgb' || fn === 'rgba') { if (parts.length === 4) alpha = num(parts[3]); return { r: num(parts[0], 255), g: num(parts[1], 255), b: num(parts[2], 255), a: alpha }; }
  if (fn === 'color') { const sp = parts.shift(); if (sp !== 'srgb') return { unparsed: s }; return { r: num(parts[0]) * 255, g: num(parts[1]) * 255, b: num(parts[2]) * 255, a: alpha }; }
  if (fn === 'oklab') { const c = oklab(num(parts[0]), num(parts[1], 0.4), num(parts[2], 0.4)); return { ...c, a: alpha }; }
  if (fn === 'oklch') { const Lc = num(parts[0]), Cc = num(parts[1], 0.4), h = (parseFloat(parts[2]) * Math.PI) / 180; const c = oklab(Lc, Cc * Math.cos(h), Cc * Math.sin(h)); return { ...c, a: alpha }; }
  return { unparsed: s };
}
const over = (t, b) => { const a = t.a + b.a * (1 - t.a); if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }; return { r: (t.r * t.a + b.r * b.a * (1 - t.a)) / a, g: (t.g * t.a + b.g * b.a * (1 - t.a)) / a, b: (t.b * t.a + b.b * b.a * (1 - t.a)) / a, a }; };
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// is colour c equal to ref (rgb) at alpha a (alpha ±0.005, channels ±1 when a > 0)?
function eq(c, ref, a, tolA = 0.005, tolC = 1) {
  if (!c || c.unparsed || !ref) return false; if (Math.abs(c.a - a) > tolA) return false; if (a === 0) return true;
  return Math.abs(c.r - ref.r) <= tolC && Math.abs(c.g - ref.g) <= tolC && Math.abs(c.b - ref.b) <= tolC;
}
function composite(btnBg, chain) { const layers = [parse(btnBg)]; for (const s of chain) { const c = parse(s); layers.push(c); if (c && c.a >= 1) break; } let bg = { r: 255, g: 255, b: 255, a: 1 }; if (layers[layers.length - 1] && layers[layers.length - 1].a >= 1) bg = { r: 0, g: 0, b: 0, a: 0 }; for (let i = layers.length - 1; i >= 0; i--) if (layers[i] && !layers[i].unparsed) bg = over(layers[i], bg); return bg; }
const fmt = (c) => (c && !c.unparsed ? `rgb(${c.r.toFixed(1)},${c.g.toFixed(1)},${c.b.toFixed(1)})/${c.a.toFixed(3)}` : JSON.stringify(c));
module.exports = { parse, over, lum, ratio, eq, composite, fmt };
