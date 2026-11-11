// Usage: node email-contrast.cjs <email.html> <out.json> [shotPrefix]
// Renders an e-mail HTML fragment in Chromium on two client backgrounds and
// measures WCAG contrast for every element that owns a text node.
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.env.STORE_ROOT || process.cwd()] }));
const fs = require('node:fs');
const [file, out, shot] = process.argv.slice(2);
const html = fs.readFileSync(file, 'utf8');
const clients = { light: '#ffffff', dark: '#121212' };
(async () => {
  const browser = await chromium.launch();
  const result = { file, clients: {} };
  for (const [name, bg] of Object.entries(clients)) {
    const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:${bg}">${html}</body></html>`);
    const rows = await page.evaluate(() => {
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
      const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const effBg = (el) => { for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
      const out = [];
      for (const el of document.body.querySelectorAll('*')) {
        const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
        if (!own) continue;
        const cs = getComputedStyle(el); const fg = parse(cs.color); const bg = effBg(el);
        const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize); const bold = Number(cs.fontWeight) >= 700;
        const large = size >= 24 || (bold && size >= 18.66);
        out.push({ tag: el.tagName.toLowerCase(), text: own.slice(0, 60), color: cs.color, bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`, ratio: Math.round(ratio * 100) / 100, fontSize: size, large, pass: ratio >= (large ? 3 : 4.5) });
      }
      return out;
    });
    if (shot) await page.screenshot({ path: `${shot}-${name}.png`, fullPage: true });
    result.clients[name] = { clientBackground: bg, rows, failing: rows.filter((r) => !r.pass).length };
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(result.clients).map(([k, v]) => [k, { rows: v.rows.length, failing: v.failing }]))));
})();
