// C298 real-browser rows: B-COLD-DEEPLINK (1440x900, 1280x720) and G298-AUTH. Fresh contexts, untimed warm-up first (L38).
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:5173';
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-298';
const ENV = /Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL_CONNECTION_FAILED/i;
const out = { at: new Date().toISOString(), chromium: null, vp: {}, auth: { errors: [] } };
const b = await chromium.launch();
out.chromium = b.version();
{
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const t0 = Date.now();
  await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle', timeout: 240000 }).catch(() => {});
  await p.waitForTimeout(3000);
  out.legacyWarmupMs = Date.now() - t0;
  await ctx.close();
}
const waitReady = (p) =>
  p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
const snap = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    return {
      status: document.querySelector('[data-testid="arrangement-status"]')?.textContent.trim(),
      active: { tag: a?.tagName, role: a?.getAttribute('role'), sourceId: a?.getAttribute('data-source-id'), selected: a?.getAttribute('aria-selected') },
      selected: [...document.querySelectorAll('[role="option"][aria-selected="true"]')].map((o) => o.getAttribute('data-source-id')),
      firstOption: document.querySelector('[role="option"]')?.getAttribute('data-source-id'),
      authUser: localStorage.getItem('auth_user'),
    };
  });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`;
  const r = (out.vp[k] = {});
  {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    const t0 = Date.now();
    await p.goto(`${BASE}/studio-lab?preview=middle-east`, { waitUntil: 'networkidle' }).catch(() => {});
    await waitReady(p).catch(() => {});
    r.warmupMs = Date.now() - t0;
    await ctx.close();
  }
  for (const [row, q] of [['cold', '?preview=middle-east'], ['plain', '']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    const errs = [];
    const con = [];
    const failedReq = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
    p.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') con.push(`${m.type()}: ${m.text().slice(0, 240)}`);
    });
    p.on('requestfailed', (rq) => failedReq.push(`${rq.url()} ${rq.failure()?.errorText}`));
    p.on('response', (rs) => {
      if (rs.status() >= 400) failedReq.push(`${rs.status()} ${rs.url()}`);
    });
    const storage0 = (await ctx.storageState()).origins.length;
    await p.goto(`${BASE}/studio-lab${q}`, { waitUntil: 'networkidle' });
    await waitReady(p);
    await p.waitForTimeout(800);
    r[row] = {
      url: p.url(),
      storage0,
      ...(await snap(p)),
      pageErrors: errs,
      console: con,
      failedRequests: failedReq,
      hydrationWarnings: con.filter((c) => /hydrat|did not match|Expected server HTML|Extra attributes|Did not expect server HTML|server rendered|Text content does not match/i.test(c)),
      consoleErrorsNonEnv: con.filter((c) => c.startsWith('error') && !ENV.test(c)),
    };
    await p.screenshot({ path: `${DIR}/shots/${row}-${k}.png` });
    await ctx.close();
  }
}
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  out.auth.cookies0 = (await ctx.cookies()).length;
  const p = await ctx.newPage();
  p.on('pageerror', (e) => out.auth.errors.push('lab: ' + String(e).slice(0, 200)));
  await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await waitReady(p);
  out.auth.lab = await p.evaluate(() => ({
    url: location.href,
    authUser: localStorage.getItem('auth_user'),
    keys: Object.keys(localStorage),
    demoTexts: [...document.querySelectorAll('*')]
      .filter((e) => e.children.length === 0 && /demo/i.test(e.textContent) && e.getClientRects().length)
      .map((e) => e.textContent.trim())
      .slice(0, 5),
    workspace: !!document.querySelector('[data-testid="arrangement-library-list"]'),
    signIn: document.body.innerText.includes('Sign in required'),
  }));
  await p.screenshot({ path: `${DIR}/shots/auth-lab-1440.png` });
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => out.auth.errors.push('legacy: ' + String(e).slice(0, 200)));
  await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.body && document.body.innerText.length > 20, undefined, { timeout: 60000 });
  await p.waitForTimeout(3000);
  out.auth.legacy = await p.evaluate(() => ({
    url: location.href,
    signIn: document.body.innerText.includes('Sign in required'),
    audioSrc: document.querySelectorAll('audio[src]').length,
    authUser: localStorage.getItem('auth_user'),
  }));
  await p.screenshot({ path: `${DIR}/shots/auth-legacy-1440.png` });
  out.auth.token = await p.evaluate(async () => {
    const x = await fetch('/api/studio-token?product=middle-east&file=stem-01.wav');
    const t = await x.text();
    return { status: x.status, hasToken: /token"\s*:\s*"[A-Za-z0-9._-]{10,}/i.test(t), body: t.slice(0, 200) };
  });
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${DIR}/browser.json`, JSON.stringify(out, null, 1));
fs.writeFileSync(`${DIR}/../c-browse.json`, JSON.stringify({ round: 298, at: out.at, chromium: out.chromium, target: `${BASE}/studio-lab`, result: 'c-round-298/browser.json' }, null, 1));
console.log(JSON.stringify(out, null, 1));
