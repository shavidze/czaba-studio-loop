const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const RUNS = path.join(ROOT, 'runs');
const SHOTS = path.join(ROOT, 'shots');
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/';
const BASE = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|Download the React DevTools/i;
const HYD = /hydrat|did not match|server rendered|Text content does not match/i;
const FORBIDDEN = /studio-token|\/api\/recording-|\/api\/download|r2\.dev|r2\.cloudflarestorage|r2-proxy|workers\.dev|shopify|myshopify|identitytoolkit|securetoken|firebaseapp|googleapis\.com\/identity|brevo|sendinblue/i;

// In-page instrumentation, installed before any app script.
function initScript() {
  const W = window;
  W.__h = { loaf: [], media: [], seeks: [], loafSupported: false, samples: null, ctxs: [] };
  if (W.AudioContext) { const AC = W.AudioContext; W.AudioContext = class extends AC { constructor(...a) { super(...a); W.__h.ctxs.push(this); } }; }
  try {
    W.__h.loafSupported = PerformanceObserver.supportedEntryTypes.includes('long-animation-frame');
    if (W.__h.loafSupported) {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          W.__h.loaf.push({
            start: e.startTime,
            dur: e.duration,
            blocking: e.blockingDuration,
            scripts: (e.scripts || []).map((s) => ({ url: s.sourceURL, fn: s.sourceFunctionName, inv: s.invoker, dur: s.duration, start: s.startTime })),
          });
        }
      }).observe({ type: 'long-animation-frame', buffered: true });
    }
  } catch (e) { W.__h.loafErr = String(e); }
  const role = (el) => (el && el.dataset ? el.dataset.videoRole || el.tagName : '?');
  const idx = (el) => (el && el.tagName === 'VIDEO' ? [...document.querySelectorAll('video')].indexOf(el) : -1);
  const MP = HTMLMediaElement.prototype;
  const oPlay = MP.play;
  const oPause = MP.pause;
  MP.play = function () { W.__h.media.push({ k: 'play', t: performance.now(), role: role(this), i: idx(this), ct: this.currentTime }); return oPlay.apply(this, arguments); };
  MP.pause = function () { W.__h.media.push({ k: 'pause', t: performance.now(), role: role(this), i: idx(this), ct: this.currentTime }); return oPause.apply(this, arguments); };
  const d = Object.getOwnPropertyDescriptor(MP, 'currentTime');
  Object.defineProperty(MP, 'currentTime', {
    configurable: true,
    enumerable: d.enumerable,
    get() { return d.get.call(this); },
    set(v) { if (this.tagName === 'VIDEO') W.__h.media.push({ k: 'ct', t: performance.now(), role: role(this), i: idx(this), v }); d.set.call(this, v); },
  });
  const listen = () => {
    for (const v of document.querySelectorAll('video')) {
      if (v.__hl) continue;
      v.__hl = 1;
      for (const ty of ['seeking', 'seeked']) v.addEventListener(ty, () => W.__h.seeks.push({ k: ty, t: performance.now(), role: role(v), i: idx(v), ct: v.currentTime }));
    }
  };
  for (const ty of ['seeking', 'seeked']) document.addEventListener(ty, (e) => { const v = e.target; if (v && v.tagName === 'VIDEO') W.__h.seeks.push({ k: ty, t: performance.now(), role: role(v), i: idx(v), ct: v.currentTime }); }, true);
  W.__hListen = () => {};
  W.__hStart = () => {
    listen();
    const vids = [...document.querySelectorAll('video')];
    const q = (v) => { const p = v.getVideoPlaybackQuality(); return { i: idx(v), role: role(v), dropped: p.droppedVideoFrames, total: p.totalVideoFrames }; };
    W.__h.q0 = vids.map(q);
    W.__h.ctxInfo = W.__h.ctxs.map((c) => ({ sr: c.sampleRate, base: c.baseLatency, out: c.outputLatency, state: c.state }));
    const S = [];
    W.__h.samples = S;
    W.__h.on = true;
    const tick = () => {
      if (!W.__h.on) return;
      const a = document.querySelector('video[data-video-role=active]');
      const handle = document.querySelector('[data-testid=arrangement-playhead-handle]');
      const cx = W.__h.ctxs[0];
      S.push({ ctx: cx ? cx.currentTime : null, t: performance.now(), pos: handle ? Number(handle.getAttribute('aria-valuenow')) : NaN, vt: a ? a.currentTime : null, paused: a ? a.paused : null, rate: a ? a.playbackRate : null, i: a ? idx(a) : -1 });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  W.__hStop = () => {
    W.__h.on = false;
    const vids = [...document.querySelectorAll('video')];
    W.__h.q1 = vids.map((v) => { const p = v.getVideoPlaybackQuality(); return { i: idx(v), role: role(v), dropped: p.droppedVideoFrames, total: p.totalVideoFrames }; });
    const dock = document.querySelector('[data-video-swaps]');
    W.__h.dock = dock ? { swaps: dock.dataset.videoSwaps, fallbacks: dock.dataset.videoFallbacks, hardSeeks: dock.dataset.videoHardSeeks, escalations: dock.dataset.videoEscalations, settles: dock.dataset.videoSettles } : null;
    return true;
  };
  W.__hDock = () => {
    const dock = document.querySelector('[data-video-swaps]');
    return dock ? { swaps: dock.dataset.videoSwaps, fallbacks: dock.dataset.videoFallbacks, hardSeeks: dock.dataset.videoHardSeeks, escalations: dock.dataset.videoEscalations, settles: dock.dataset.videoSettles } : null;
  };
}

async function openCtx(browser, vp, label, net, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...opts });
  await ctx.addInitScript(initScript);
  const page = await ctx.newPage();
  const log = { label, vp: `${vp.width}x${vp.height}`, errors: [], hydration: [], noise: 0, forbidden: [], authHeaders: [] };
  net.push(log);
  page.on('console', (m) => {
    const t = m.text();
    if (HYD.test(t)) log.hydration.push(`${m.type()} ${t.slice(0, 300)}`);
    if (m.type() === 'error') {
      if (NOISE.test(t) && !HYD.test(t)) log.noise += 1;
      else log.errors.push(t.slice(0, 300));
    }
  });
  page.on('pageerror', (e) => log.errors.push(`pageerror ${String(e).slice(0, 300)}`));
  page.on('request', (q) => {
    if (FORBIDDEN.test(q.url())) log.forbidden.push(q.url());
    if (q.headers().authorization) log.authHeaders.push(q.url());
  });
  return { ctx, page, log };
}

async function openStudio(browser, vp, label, net, opts) {
  const o = await openCtx(browser, vp, label, net, opts);
  const { page } = o;
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(2000);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline');
    if (b) b.click();
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    const n = await page.evaluate(() => {
      const opts = [...document.querySelectorAll('[role=option][data-source-id]')];
      return opts.length === 0 ? -1 : opts.filter((x) => /იტვირთება…/.test(x.textContent)).length;
    });
    if (n === 0) break;
    await sleep(250);
  }
  await sleep(500);
  return o;
}

const blur = (p) => p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
const status = (p) => p.evaluate(() => ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim());
const geo = (p) => p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left, pps: +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1] }));
const posNow = (p) => p.evaluate(() => Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')));
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label*="აქტიური ხაზის არჩევა"]`;

async function setSnapOff(p) {
  await blur(p);
  const s = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  if (s === 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); }
  await blur(p);
  return p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
}

// Set playhead by clicking the ruler at time t (snap off); verifies via aria-valuenow.
async function seekTo(p, t) {
  await blur(p);
  if (t === 0) { await p.keyboard.press('Home'); await sleep(250); return posNow(p); }
  const g = await geo(p);
  const r = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
  await p.mouse.click(g.rl + t * g.pps, r.top + r.height / 2);
  await sleep(300);
  await blur(p);
  return posNow(p);
}

async function addAt(p, sourceId, lane, t) {
  await p.click(nameSel(lane));
  await sleep(200);
  const pos = await seekTo(p, t);
  const o = p.locator(`[role=option][data-source-id="${sourceId}"]`);
  await o.scrollIntoViewIfNeeded();
  await o.focus();
  await sleep(150);
  await p.keyboard.press('Enter');
  await sleep(700);
  const s = await status(p);
  await blur(p);
  return { sourceId, lane, t, pos, status: s };
}

async function loadVideo(p, file) {
  await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA + file);
  await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
  await sleep(2500);
}

// Clip table: start from DOM, duration from width/pps, offset from detail panel after selection.
const clipsDom = (p) => p.evaluate(() => {
  const z = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];
  return [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ id: e.getAttribute('data-clip-id'), kind: e.dataset.clipKind, lane: e.closest('[data-track-id]').getAttribute('data-track-id'), start: +e.getAttribute('data-clip-start'), wdur: +(e.getBoundingClientRect().width / z).toFixed(3), title: e.textContent.trim().slice(0, 30), sel: /ring-brand/.test(e.className) }));
});

async function selectClip(p, id, mods = []) {
  const h = p.locator(`[data-clip-id="${id}"] > div`).first();
  const b = await h.boundingBox();
  if (!b) throw new Error('clip header not visible ' + id);
  await p.mouse.move(b.x + Math.min(30, b.width / 2), b.y + b.height / 2);
  for (const m of mods) await p.keyboard.down(m);
  await p.mouse.down(); await p.mouse.up();
  for (const m of mods) await p.keyboard.up(m);
  await sleep(300);
}

const detailInfo = (p) => p.evaluate(() => {
  const c = document.querySelector('[data-testid=arrangement-detail-content]');
  const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
  return { text: c ? c.textContent.replace(/\s+/g, ' ').slice(0, 300) : null, h: panel ? +panel.getBoundingClientRect().height.toFixed(1) : null };
});

const secs = (txt) => { const m = /(\d+):(\d+(?:\.\d+)?)/.exec(txt || ''); return m ? +m[1] * 60 + +m[2] : NaN; };

function save(dir, name, data) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 1));
}

const launch = () => chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
module.exports = { launch, chromium, sleep, openCtx, openStudio, blur, status, geo, posNow, nameSel, setSnapOff, seekTo, addAt, loadVideo, clipsDom, selectClip, detailInfo, secs, save, OUT, RUNS, SHOTS, MEDIA, BASE, ROOT };
