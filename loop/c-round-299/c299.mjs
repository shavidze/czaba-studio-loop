// C299 real-browser rows: JSDOM-MUTED-PREMISE (Chromium half), B-DOCK-MUTED, B-COLD-DEEPLINK (1440x900, 1280x720), G299-AUTH.
// Fresh contexts, empty storage, untimed warm-up first (L38). Owned test media only (public/videos/hero/1.mp4), local only.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const BASE = 'http://127.0.0.1:5173';
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-299';
const VIDEO = '/home/runner/czaba-project/store/public/videos/hero/1.mp4';
const ENV = /Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL_CONNECTION_FAILED|middle-east\.mp3/i;
const PROBE = /did not match|Extra attributes|Did not expect server HTML|Expected server HTML|Hydration failed|hydrat/i;
const out = { at: new Date().toISOString(), chromium: null, premise: null, vp: {}, auth: { errors: [] } };
const b = await chromium.launch();
out.chromium = b.version();

function instrument(p) {
  const r = { pageErrors: [], console: [], failedRequests: [] };
  p.on('pageerror', (e) => r.pageErrors.push(String(e).slice(0, 300)));
  p.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') r.console.push(`${m.type()}: ${m.text().slice(0, 240)}`);
  });
  p.on('requestfailed', (rq) => r.failedRequests.push(`${rq.url()} ${rq.failure()?.errorText}`));
  p.on('response', (rs) => {
    if (rs.status() >= 400) r.failedRequests.push(`${rs.status()} ${rs.url()}`);
  });
  return r;
}
const summarize = (r) => ({
  ...r,
  probeMatches: [...r.console, ...r.pageErrors].filter((c) => PROBE.test(c)),
  consoleErrorsNonEnv: r.console.filter((c) => c.startsWith('error') && !ENV.test(c)),
});
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
const videos = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('[data-testid="arrangement-video"]')].map((v) => ({
      role: v.getAttribute('data-video-role'),
      muted: v.muted,
      defaultMuted: v.defaultMuted,
      attr: v.hasAttribute('muted'),
      src: (v.currentSrc || v.getAttribute('src') || '').slice(0, 60),
      currentTime: v.currentTime,
      paused: v.paused,
      readyState: v.readyState,
      volume: v.volume,
    })),
  );

// Chromium half of JSDOM-MUTED-PREMISE
{
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded', timeout: 240000 }).catch(() => {});
  out.premise = await p.evaluate(() => {
    const v = new DOMParser().parseFromString('<video muted=""></video>', 'text/html').querySelector('video');
    const d = document.createElement('div');
    d.innerHTML = '<video muted=""></video>';
    const w = d.querySelector('video');
    return { domParser: { muted: v.muted, defaultMuted: v.defaultMuted }, innerHTML: { muted: w.muted, defaultMuted: w.defaultMuted } };
  });
  await ctx.close();
}
// legacy route warm-up (untimed)
{
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle', timeout: 240000 }).catch(() => {});
  await p.waitForTimeout(2000);
  await ctx.close();
}

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
  // B-COLD-DEEPLINK + plain
  for (const [row, q] of [['cold', '?preview=middle-east'], ['plain', '']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    const ins = instrument(p);
    const storage0 = (await ctx.storageState()).origins.length;
    await p.goto(`${BASE}/studio-lab${q}`, { waitUntil: 'networkidle' });
    await waitReady(p);
    await p.waitForTimeout(800);
    r[row] = { url: p.url(), storage0, ...(await snap(p)), ...summarize(ins) };
    await p.screenshot({ path: `${DIR}/shots/${row}-${k}.png` });
    await ctx.close();
  }
  // B-DOCK-MUTED
  {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    const ins = instrument(p);
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
    await waitReady(p);
    await p.waitForTimeout(500);
    const d = { step1: await videos(p) };
    d.canPlayH264 = await p.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'));
    if (d.canPlayH264) {
      let chosen = false;
      p.on('filechooser', async (fc) => {
        chosen = true;
        await fc.setFiles(VIDEO);
      });
      await p.waitForTimeout(500);
      const btn = p.getByRole('button', { name: /video/i }).filter({ hasText: /video/i }).first();
      d.importButton = await btn.textContent().catch(() => null);
      await btn.click().catch((e) => (d.importClickErr = String(e).slice(0, 200)));
      await p.waitForTimeout(1500);
      if (!chosen) {
        d.fallbackSetInputFiles = true;
        await p.setInputFiles('[data-testid="arrangement-video-input"]', VIDEO);
      }
      d.chooserUsed = chosen;
      await p.waitForFunction(() => [...document.querySelectorAll('[data-testid="arrangement-video"]')].some((v) => v.readyState >= 2), undefined, { timeout: 30000 }).catch((e) => (d.readyErr = String(e).slice(0, 120)));
      await p.waitForTimeout(800);
      d.afterAdd = await videos(p);
      d.statusAfterAdd = (await snap(p)).status;
      await p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
      d.before = await videos(p);
      await p.keyboard.press('Space');
      const samples = [];
      for (let i = 0; i < 5; i++) {
        await p.waitForTimeout(450);
        samples.push(await videos(p));
      }
      d.during = samples;
      d.statusPlaying = (await snap(p)).status;
      await p.screenshot({ path: `${DIR}/shots/dock-playing-${k}.png` });
      await p.keyboard.press('Space');
      await p.waitForTimeout(400);
      d.after = await videos(p);
      const act = (arr) => Math.max(...arr.filter((v) => !v.paused || v.role === 'active').map((v) => v.currentTime));
      d.activeAdvance = act(samples[samples.length - 1]) - Math.max(...d.before.map((v) => v.currentTime));
      d.allMutedDuring = samples.every((s) => s.every((v) => v.muted === true));
    }
    Object.assign(d, summarize(ins));
    r.dock = d;
    await p.screenshot({ path: `${DIR}/shots/dock-${k}.png` });
    await ctx.close();
  }
}
// G299-AUTH
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
fs.writeFileSync(`${DIR}/../c-browse.json`, JSON.stringify({ round: 299, at: out.at, chromium: out.chromium, target: `${BASE}/studio-lab`, result: 'c-round-299/browser.json' }, null, 1));
console.log('done');
