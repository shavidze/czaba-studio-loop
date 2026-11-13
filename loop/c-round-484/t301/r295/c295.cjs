// C round 295 (independent): B-LOAF-REAL + G295-AUTH. usage: node c295.cjs
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const BASE = 'http://127.0.0.1:5173';
const OUT = __dirname;
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loafRun(b, w, h, label) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => {
    window.__loaf = [];
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          window.__loaf.push({
            d: e.duration,
            n: Array.isArray(e.scripts) ? e.scripts.length : null,
            max: Array.isArray(e.scripts) ? Math.max(0, ...e.scripts.map((s) => s.duration || 0)) : null,
          });
        }
      }).observe({ type: 'long-animation-frame', buffered: true });
    } catch (err) {
      window.__loafErr = String(err);
    }
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await sleep(6000);
  const l = await page.evaluate(() => ({ list: window.__loaf, err: window.__loafErr ?? null, auth: localStorage.getItem('auth_user') }));
  if (label === 'measured') await page.screenshot({ path: `${SHOTS}/loaf-${w}x${h}.png` });
  await ctx.close();
  const list = l.list;
  return {
    vp: `${w}x${h}`,
    label,
    entries: list.length,
    withScripts: list.filter((e) => e.n > 0).length,
    emptyScripts: list.filter((e) => e.n === 0).length,
    noField: list.filter((e) => e.n === null).length,
    maxScriptMs: Math.max(0, ...list.map((e) => e.max || 0)),
    observerError: l.err,
    authUser: l.auth,
  };
}

(async () => {
  const b = await chromium.launch();
  const out = { loaf: [], auth: {} };
  // L38 warm-up: one untimed load first
  out.loaf.push(await loafRun(b, 1440, 900, 'warmup'));
  for (const [w, h] of [[1440, 900], [1280, 720]]) out.loaf.push(await loafRun(b, w, h, 'measured'));
  out.loafPass = out.loaf.filter((r) => r.label === 'measured').every((r) => r.entries >= 1 && r.withScripts >= 1 && r.observerError === null);

  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await sleep(5000);
    out.auth.lab = await page.evaluate(() => ({
      authUser: localStorage.getItem('auth_user'),
      storageKeys: Object.keys(localStorage),
      badge: [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /demo/i.test(e.textContent) && e.getClientRects().length).map((e) => e.textContent.trim()).slice(0, 4),
      lanes: document.querySelectorAll('[data-testid*="lane"]').length,
      timeline: document.querySelectorAll('[data-testid*="arrangement"], [data-testid*="timeline"]').length,
      signIn: document.body.innerText.includes('Sign in required'),
      title: document.title,
    }));
    await page.screenshot({ path: `${SHOTS}/auth-lab-1440.png` });
    await ctx.close();
  }
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' });
    await sleep(5000);
    await page.waitForLoadState('load');
    await page.waitForSelector('body', { timeout: 20000 });
    await page.waitForFunction(() => document.body && document.body.innerText.length > 0, null, { timeout: 20000 });
    out.auth.legacyUrl = page.url();
    out.auth.legacy = await page.evaluate(() => ({
      signIn: document.body.innerText.includes('Sign in required'),
      audioSrc: document.querySelectorAll('audio[src]').length,
      audio: document.querySelectorAll('audio').length,
      authUser: localStorage.getItem('auth_user'),
    }));
    await page.screenshot({ path: `${SHOTS}/auth-legacy-1440.png` });
    out.auth.token = await page.evaluate(async () => {
      const r = [];
      for (const m of ['GET', 'POST']) {
        const x = await fetch('/api/studio-token?product=middle-east&file=stem-01.wav', { method: m });
        const t = await x.text();
        r.push({ m, status: x.status, hasToken: /token"\s*:\s*"[A-Za-z0-9._-]{10,}/.test(t) });
      }
      return r;
    });
    await ctx.close();
  }
  const a = out.auth;
  out.authPass = a.lab.authUser === null && a.lab.badge.length > 0 && !a.lab.signIn && a.legacy.signIn && a.legacy.audioSrc === 0 && a.legacy.authUser === null && a.token.every((t) => !t.hasToken);
  fs.writeFileSync(path.join(OUT, 'c295.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();
