// Which glyphs fall back, post vs simulated-pre (Inter); and follow-row sibling widths post vs pre. node glyphs.cjs <vp>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
const PRE = `[data-studio-theme="obsidian"], body:has([data-studio-theme="obsidian"]) { --font-sans: var(--c151-sans) !important; --font-mono: var(--c151-mono) !important; font-family: var(--c151-body) !important; }`;
async function pre(p, on) { await p.evaluate(({ on, css }) => { if (on) { const h = getComputedStyle(document.documentElement); const r = document.documentElement.style; r.setProperty('--c151-sans', h.getPropertyValue('--font-sans')); r.setProperty('--c151-mono', h.getPropertyValue('--font-mono')); r.setProperty('--c151-body', h.fontFamily); const s = document.createElement('style'); s.id = 'c151-pre'; s.textContent = css; document.head.appendChild(s); } else document.getElementById('c151-pre')?.remove(); }, { on, css: PRE }); await p.evaluate(() => document.fonts.ready); await sleep(800); }
async function perNode(p) {
  // wrap each non-ASCII char of selected nodes? Instead: per text-bearing element, platform fonts.
  const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const n = await p.evaluate(() => { let i = 0; const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); for (const e of document.querySelectorAll('[data-g151]')) e.removeAttribute('data-g151'); for (const e of document.querySelectorAll('.studio-container *')) { const t = own(e); if (t && /[^\x20-\x7EႠ-ჿ]/.test(t)) e.setAttribute('data-g151', String(i++)); } return i; });
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-g151]' });
  const out = {};
  for (const id of nodeIds) { const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id }); const local = fonts.filter((f) => !f.isCustomFont); if (!local.length) continue; const { outerHTML } = await cdp.send('DOM.getOuterHTML', { nodeId: id }); const txt = outerHTML.replace(/<[^>]+>/g, '').slice(0, 80); const chars = [...new Set([...txt].filter((c) => /[^\x20-\x7EႠ-ჿ]/.test(c)))].map((c) => `${c} U+${c.codePointAt(0).toString(16).toUpperCase()}`); out[txt] = { local: local.map((f) => `${f.familyName}:${f.glyphCount}`), web: fonts.filter((f) => f.isCustomFont).map((f) => `${f.familyName}:${f.glyphCount}`), nonAscii: chars }; }
  await cdp.detach(); return { tagged: n, withLocalFallback: out };
}
const row = (p) => p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-follow]'); const par = f.parentElement; const cs = getComputedStyle(par); return { parentClass: par.className.slice(0, 120), justify: cs.justifyContent, kids: [...par.children].map((k) => { const b = k.getBoundingClientRect(); return `${(k.getAttribute('data-testid') || k.textContent.trim().slice(0, 14))}:${b.x.toFixed(1)}+${b.width.toFixed(1)}`; }), grand: [...par.parentElement.children].map((k) => { const b = k.getBoundingClientRect(); return `${(k.getAttribute('data-testid') || k.textContent.trim().slice(0, 14))}:${b.x.toFixed(1)}+${b.width.toFixed(1)}`; }) }; });
(async () => { const b = await L.launch(); const r = { vp: W };
  try { const { page: p } = await L.openStudio(b, X.VPS[W], `glyph-${W}`, net); await p.mouse.move(2, 2);
    await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await p.click(L.nameSel('music')); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await X.key(p, 'Control+g'); await L.blur(p); await p.mouse.move(2, 2); await sleep(400);
    r.post = await perNode(p); r.rowPost = await row(p);
    await pre(p, true); r.pre = await perNode(p); r.rowPre = await row(p); await pre(p, false);
  } catch (e) { r.error = String(e.stack || e); }
  r.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `glyphs-${W}.json`), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r, null, 1).slice(0, 6000)); await b.close(); })();
