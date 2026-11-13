// Round 482 R482-STORE-COLOUR (b): the probe-* part of c-round-474/browser.mjs only, on one server.
// Usage: BASE=http://127.0.0.1:5173 node store-colour-482.mjs <out.json>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const outFile = process.argv[2]; if (!outFile) throw new Error('out.json required');
const b = await chromium.launch();
const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await p.goto(base + '/store', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  res[`probe-${w}`] = await p.evaluate(() => {
    const out = {};
    const mk = (cls, tagn = 'div') => { const e = document.createElement(tagn); e.className = cls; document.body.appendChild(e); return e; };
    const a = mk('stems-loader-list'); const bt = mk('audio-preview-inline-button playing', 'button'); const wb = mk('waveform-bar active');
    const cs = (e) => getComputedStyle(e);
    out.scrollbarColor = cs(a).scrollbarColor;
    out.btnShadow = cs(bt).boxShadow; out.btnBg = cs(bt).backgroundImage; out.btnAnim = cs(bt).animationName;
    out.waveBg = cs(wb).backgroundImage + ' | ' + cs(wb).backgroundColor;
    const r = getComputedStyle(document.documentElement);
    out.gradPrimary = r.getPropertyValue('--gradient-primary'); out.glowPrimary = r.getPropertyValue('--color-glow-primary');
    out.brand = r.getPropertyValue('--color-brand');
    const css = [...document.styleSheets].map((s) => { try { return [...s.cssRules].map((x) => x.cssText).join('\n'); } catch { return ''; } }).join('\n');
    out.teal19217204 = (css.match(/19,\s*217,\s*204/g) || []).length;
    return out;
  });
  res[`pageerrors-${w}`] = errs;
  await ctx.close();
}
await b.close();
fs.writeFileSync(outFile, JSON.stringify(res, null, 1));
