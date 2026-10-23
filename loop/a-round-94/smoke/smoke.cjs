const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-94/smoke';
const STATE = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const BASE = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|net::ERR|localhost:5199|firebase|React DevTools/i;
const DEMO_LOADING = 'დემო კოლექცია იტვირთება…';
const DEMO_READY = 'დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).';
(async () => {
  const out = { errors: [], noise: 0, hydration: [], audio: {}, suspicious: [], auth: 0 };
  const html = await (await fetch(BASE + '/studio-lab')).text();
  const m = html.match(/data-testid="arrangement-status"[^>]*>([^<]*)</);
  out.ssrStatus = m ? m[1].trim() : null;
  const browser = await chromium.launch({ headless: true });
  try {
    const warm = await browser.newContext({ storageState: STATE });
    const wp = await warm.newPage(); await wp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 120000 }); await sleep(3000); await warm.close();
    const ctx = await browser.newContext({ storageState: STATE, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    p.on('console', (msg) => { const t = msg.text(); if (/hydrat/i.test(t)) out.hydration.push(t.slice(0, 300)); if (msg.type() === 'error' || msg.type() === 'warning') { if (NOISE.test(t)) out.noise++; else out.errors.push(t.slice(0, 300)); } });
    p.on('pageerror', (e) => out.errors.push('pageerror ' + String(e).slice(0, 300)));
    p.on('request', (q) => { const u = q.url(); if (q.headers().authorization) out.auth++; if (/studio-token|r2\.|workers\.dev|\/api\/download|recording-|unpkg/.test(u)) out.suspicious.push(u); if (/\.(mp3|wav)(\?|$)/.test(u)) out.audio[u] = (out.audio[u] ?? 0) + 1; });
    const held = [];
    let release = null; const gate = new Promise((r) => { release = r; });
    await p.route(/\.(mp3|wav)(\?|$)/, async (route) => { held.push(route.request().url()); await gate; await route.continue(); });
    await p.goto(BASE + '/studio-lab', { waitUntil: 'domcontentloaded' });
    const statusLoc = p.locator('[data-testid=arrangement-status]');
    await statusLoc.waitFor({ timeout: 120000 });
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && held.length === 0) await sleep(200);
    await sleep(1500);
    out.heldCount = held.length;
    out.statusWhileHeld = (await statusLoc.textContent())?.trim();
    await p.screenshot({ path: DIR + '/a94-1440-held.png' });
    release();
    await p.waitForFunction(() => /მზადაა|ვერ ჩაიტვირთა/.test(document.querySelector('[data-testid=arrangement-status]')?.textContent ?? ''), null, { timeout: 120000 });
    out.statusAfterRelease = (await statusLoc.textContent())?.trim();
    await p.screenshot({ path: DIR + '/a94-1440-ready.png' });
    await sleep(2000);
  } finally {
    await browser.close();
  }
  out.checks = { ssr: out.ssrStatus === DEMO_LOADING, held: out.statusWhileHeld === DEMO_LOADING, ready: out.statusAfterRelease === DEMO_READY, noHydration: out.hydration.length === 0, noErrors: out.errors.length === 0, audioOnce: Object.values(out.audio).every((n) => n === 1), noSuspicious: out.suspicious.length === 0 && out.auth === 0 };
  fs.writeFileSync(DIR + '/smoke.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
