// C321 RT-SCREEN SR-321-2/3 DOM probe (mock backend running)
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) { const r = (res[`${w}x${h}`] = {}); const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/products/middle-east', { waitUntil: 'networkidle', timeout: 120000 }); await p.waitForTimeout(1000);
  const t = await p.evaluate(() => document.body.innerText); r.provenance = /What you hear in the preview is exactly what you get — no compromises, no fillers\./.test(t);
  await p.goto('http://127.0.0.1:5173/studio-lab?preview=middle-east', { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 });
  r.exitLinks = await p.locator('a').evaluateAll((as) => as.filter((a) => /CZABA/.test(a.textContent) && a.getBoundingClientRect().width > 0).map((a) => `${a.textContent.trim()} -> ${a.getAttribute('href')}`));
  r.viewInStoreVisible = await p.getByText('View in store').first().isVisible().catch(() => false);
  r.firstLibraryNotice = await p.getByText('Synthetic demo stems — not CZABA catalogue audio.').first().isVisible().catch(() => false);
  await ctx.close(); }
writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-321/sr23.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await b.close();
