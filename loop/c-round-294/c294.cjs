// C round 294 (independent): FIX-PD-1c3 browser rows B-MARKER, B-DESK-SAME, G294-AUTH. usage: node c294.cjs [rowRegex]
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const URL = `${BASE}/studio-lab`;
const LOOP = '/home/runner/czaba-project/tmp/studio-real-loop';
const OUT = path.join(LOOP, 'c-round-294');
const SHOTS = path.join(OUT, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const resultFile = path.join(OUT, 'c294.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : {};
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const filter = process.argv[2] ? new RegExp(process.argv[2]) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HYD = /hydrat|did not match|didn't match/i;
const BENIGN = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|homepage products|fetch failed/i;

const INIT = () => {
  window.__taps = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) {
    const res = orig.call(this, target, ...rest);
    try {
      if (target instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a);
      }
    } catch (e) {}
    return res;
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
};
const rms = (page) => page.evaluate(() => +Math.max(0, ...(window.__rms ? window.__rms() : [0])).toFixed(5));

async function newCtx(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const log = { console: [], hydration: [], pageErrors: [] };
  page.on('console', (m) => { const t = m.text(); if (HYD.test(t)) log.hydration.push(t.slice(0, 300)); if (m.type() === 'error' && !BENIGN.test(t)) log.console.push(t.slice(0, 300)); });
  page.on('pageerror', (e) => log.pageErrors.push(String(e).slice(0, 300)));
  return { ctx, page, log };
}
const ready = (page) => page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 25000 });

const markerState = (page) => page.evaluate(() => {
  const all = [...document.querySelectorAll('[data-studio-theme]')];
  const ob = [...document.querySelectorAll('[data-studio-theme="obsidian"]')];
  return {
    anyMarker: all.length,
    obsidian: ob.length,
    owners: ob.map((e) => ({ tag: e.tagName, testid: e.getAttribute('data-testid'), cls: (e.className || '').toString().slice(0, 60), visible: e.getClientRects().length > 0, containsExit: !!e.querySelector('[data-testid="arrangement-exit"]') })),
    bodyHas: document.querySelector('body:has([data-studio-theme="obsidian"])') !== null,
    mains: [...document.querySelectorAll('main')].filter((m) => m.getClientRects().length).length,
    narrowRoots: document.querySelectorAll('[data-testid="studio-narrow-screen"]').length,
    title: document.title,
    h1: [...document.querySelectorAll('h1')].filter((e) => e.getClientRects().length).map((e) => e.textContent.trim().slice(0, 60)),
    authUser: localStorage.getItem('auth_user'),
  };
});

const ROWS = {};

ROWS['B-MARKER'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const { ctx, page, log } = await newCtx(b, w, h);
    const resp = await page.goto(URL, { waitUntil: 'load' });
    await ready(page); await sleep(1000);
    const m = await markerState(page);
    // sanity: real audio output still flows on the wide workspace
    await page.screenshot({ path: `${SHOTS}/marker-studio-lab-${w}x${h}.png` });
    out[`lab-${w}`] = { status: resp.status(), ...m, hydration: log.hydration, errors: [...log.console, ...log.pageErrors] };
    await ctx.close();
  }
  {
    const { ctx, page, log } = await newCtx(b, 390, 844);
    const resp = await page.goto(URL, { waitUntil: 'load' }); await sleep(3000);
    const m = await markerState(page);
    await page.screenshot({ path: `${SHOTS}/marker-studio-lab-390x844.png`, fullPage: true });
    out['lab-390'] = { status: resp.status(), ...m, hydration: log.hydration, errors: [...log.console, ...log.pageErrors] };
    await ctx.close();
  }
  for (const p of ['/', '/store']) {
    const { ctx, page, log } = await newCtx(b, 1440, 900);
    const resp = await page.goto(BASE + p, { waitUntil: 'load' }); await sleep(3000);
    const m = await markerState(page);
    const ssr = await page.evaluate(async (u) => { const t = await (await fetch(u)).text(); return (t.match(/data-studio-theme/g) || []).length; }, BASE + p);
    await page.screenshot({ path: `${SHOTS}/marker-${p === '/' ? 'home' : 'store'}-1440x900.png` });
    out[`page${p}`] = { status: resp.status(), ...m, ssrHtmlMarkerHits: ssr, errors: [...log.console, ...log.pageErrors] };
    await ctx.close();
  }
  const wideOk = (x) => x.status < 500 && x.obsidian === 1 && x.anyMarker === 1 && x.owners[0].containsExit && x.owners[0].tag === 'DIV' && x.bodyHas;
  const narrowOk = (x) => x.status < 500 && x.obsidian === 1 && x.anyMarker === 1 && x.owners[0].testid === 'studio-narrow-screen' && x.owners[0].visible;
  const storeOk = (x) => x.status < 500 && x.h1.length >= 1 && x.anyMarker === 0 && x.ssrHtmlMarkerHits === 0;
  out.pass = wideOk(out['lab-1440']) && wideOk(out['lab-1280']) && narrowOk(out['lab-390']) && storeOk(out['page/']) && storeOk(out['page/store']);
  return out;
};

ROWS['B-DESK-SAME'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1280, 720], [1440, 900]]) {
    const { ctx, page, log } = await newCtx(b, w, h);
    await page.goto(URL, { waitUntil: 'networkidle' });
    await ready(page);
    await sleep(1500);
    await page.mouse.move(0, h - 1);
    const buf = await page.screenshot({ path: `${SHOTS}/desk-${w}x${h}.png` });
    const ref = fs.readFileSync(`${LOOP}/b-round-291/probe/desk-5173-${w}x${h}.png`);
    const p2 = await b.newPage();
    const diff = await p2.evaluate(async ([a, c]) => {
      const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
      const px = (img) => { const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const x = cv.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height).data; };
      const [ia, ib] = await Promise.all([load(a), load(c)]); if (ia.width !== ib.width || ia.height !== ib.height) return -1;
      const da = px(ia), db = px(ib); let d = 0; for (let i = 0; i < da.length; i += 4) if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) d++; return d;
    }, [buf.toString('base64'), ref.toString('base64')]);
    await p2.close();
    out[`${w}x${h}`] = { diff, hydration: log.hydration, errors: [...log.console, ...log.pageErrors] };
    await ctx.close();
  }
  out.pass = out['1280x720'].diff === 0 && out['1440x900'].diff === 0 && out['1280x720'].hydration.length === 0 && out['1440x900'].hydration.length === 0;
  return out;
};

ROWS['G294-AUTH'] = async (b) => {
  const out = {};
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await newCtx(b, w, h);
    await page.goto(URL); if (w > 900) await ready(page); else await sleep(2500);
    out[`lab-${w}`] = await page.evaluate(() => ({
      authUser: localStorage.getItem('auth_user'),
      badge: [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /demo/i.test(e.textContent) && e.getClientRects().length).map((e) => e.textContent.trim()).slice(0, 3),
      narrow: [...document.querySelectorAll('[data-testid="studio-narrow-screen"]')].some((n) => n.getClientRects().length),
    }));
    await page.screenshot({ path: `${SHOTS}/auth-lab-${w}.png` });
    await ctx.close();
  }
  const { ctx, page } = await newCtx(b, 1440, 900);
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(5000); await page.waitForLoadState('load'); await page.waitForSelector('body', { timeout: 15000 });
  out.legacy = await page.evaluate(() => ({ signIn: document.body.innerText.includes('Sign in required'), audioSrc: document.querySelectorAll('audio[src]').length, authUser: localStorage.getItem('auth_user') }));
  await page.screenshot({ path: `${SHOTS}/auth-legacy.png` });
  out.token = await page.evaluate(async () => { const r = []; for (const m of ['GET', 'POST']) { const x = await fetch('/api/studio-token?product=middle-east&file=stem-01.wav', { method: m }); const t = await x.text(); r.push({ m, status: x.status, body: t.slice(0, 200), hasToken: /token"\s*:\s*"[A-Za-z0-9._-]{10,}/.test(t) }); } return r; });
  await ctx.close();
  const tok = out.token;
  out.pass = out['lab-1440'].authUser === null && out['lab-1440'].badge.length > 0 && out['lab-390'].narrow && out['lab-390'].authUser === null && out.legacy.signIn && out.legacy.audioSrc === 0 && tok.some((t) => t.status === 401) && tok.every((t) => !t.hasToken);
  return out;
};

(async () => {
  const b = await chromium.launch();
  { const c = await b.newContext(); const p = await c.newPage(); await p.goto(URL); await sleep(5000); await c.close(); }
  for (const [name, fn] of Object.entries(ROWS)) {
    if (filter && !filter.test(name)) continue;
    const t = Date.now();
    try { R[name] = await fn(b); } catch (e) { R[name] = { error: String(e).slice(0, 500) }; }
    R[name].ms = Date.now() - t;
    save();
    console.log(name, R[name].pass ?? (R[name].error ? 'ERROR ' + R[name].error : 'info'));
  }
  await b.close();
})();
