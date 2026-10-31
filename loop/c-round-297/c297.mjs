// C297 real-browser: B-COLD-DEEPLINK at 1440x900 and 1280x720 (fresh contexts, untimed warm-up first)
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:5173'; const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-297';
const out = { at: new Date().toISOString(), chromium: null, vp: {} };
const b = await chromium.launch(); out.chromium = b.version();
const waitReady = (p) => p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
const active = (p) => p.evaluate(() => { const a = document.activeElement; const cs = a ? getComputedStyle(a) : null;
  return { tag: a?.tagName, role: a?.getAttribute('role'), sourceId: a?.getAttribute('data-source-id'), selected: a?.getAttribute('aria-selected'), tabindex: a?.getAttribute('tabindex'), focusVisible: a?.matches(':focus-visible'), outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` : null }; });
const selected = (p) => p.evaluate(() => [...document.querySelectorAll('[role="option"][aria-selected="true"]')].map((o) => o.getAttribute('data-source-id')));
const firstOpt = (p) => p.evaluate(() => document.querySelector('[role="option"]')?.getAttribute('data-source-id'));
const st = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.trim());
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const r = (out.vp[k] = {});
  { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const t0 = Date.now();
    await p.goto(`${BASE}/studio-lab?preview=middle-east`, { waitUntil: 'networkidle' }).catch(() => {}); await waitReady(p).catch(() => {}); r.warmupMs = Date.now() - t0; await ctx.close(); }
  for (const [row, q] of [['cold', '?preview=middle-east'], ['plain', '']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    const errs = [], con = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
    p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') con.push(`${m.type()}: ${m.text().slice(0, 240)}`); });
    const storage0 = (await ctx.storageState()).origins.length;
    await p.goto(`${BASE}/studio-lab${q}`, { waitUntil: 'networkidle' });
    await waitReady(p); await p.waitForTimeout(800);
    r[row] = { url: p.url(), storage0, status: await st(p), active: await active(p), selected: await selected(p), firstOption: await firstOpt(p), pageErrors: errs, console: con,
      hydrationWarnings: con.filter((c) => /hydrat|did not match|server rendered|Text content does not match/i.test(c)),
      consoleErrorsNonEnv: con.filter((c) => c.startsWith('error') && !/Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL_CONNECTION_FAILED|Failed to load resource/i.test(c)) };
    await p.screenshot({ path: `${DIR}/shots/${row}-${k}.png` });
    await ctx.close();
  }
}
await b.close(); fs.writeFileSync(`${DIR}/cold.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
