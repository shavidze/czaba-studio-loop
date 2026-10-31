// C round 281: copy of c280-smoke.cjs (outDir changed) + DETAIL-LANE(2). G281-AUTH + STUDIO-SMOKE.
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173';
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-281';
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';

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
  window.__statusLog = [];
  const hook = () => {
    const s = document.querySelector('[data-testid="arrangement-status"]');
    if (!s) { requestAnimationFrame(hook); return; }
    new MutationObserver(() => window.__statusLog.push({ t: performance.now(), text: s.textContent })).observe(s, { childList: true, subtree: true, characterData: true });
  };
  document.addEventListener('DOMContentLoaded', hook);
};

const readWav = (buf) => {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  const data = Array.from({ length: ch }, () => new Float64Array(frames));
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    data[c][f] = x;
  }
  return { ch, rate, bits, frames, data };
};
const wavInfo = (buf) => {
  const w = readWav(buf); let s = 0; let n = 0; let peak = 0; let nan = 0;
  for (const d of w.data) for (const x of d) { if (!Number.isFinite(x)) nan += 1; s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a; }
  return { bytes: buf.length, rate: w.rate, bits: w.bits, ch: w.ch, frames: w.frames, seconds: w.frames / w.rate, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), peak: +peak.toFixed(4), nan, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};

const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function addPulse(page) {
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(1000);
  await blur(page);
}
async function open(browser, vp, { pulse = true, zoom = true, rm = 'no-preference', base = BASE } = {}) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true, reducedMotion: rm });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { const t = m.text(); if (/hydrat|Warning:|did not match/i.test(t)) errors.push('console:' + t.slice(0, 300)); });
  await page.goto(`${base}/studio-lab`, { waitUntil: "load" });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 150000 });
  await sleep(800);
  const setup = {};
  if (pulse) {
    await addPulse(page);
    setup.status = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
    if (zoom) { for (let i = 0; i < 4; i += 1) { await page.keyboard.press('Equal'); await sleep(150); } await sleep(400); }
    setup.zoom = await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
    setup.bpm = await page.evaluate(() => document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getAttribute('data-bpm'));
  }
  return { ctx, page, errors, setup };
}
async function key(page, k, wait = 300) { await page.keyboard.press(k); await sleep(wait); }
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
const st = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const play = [...document.querySelectorAll('button')].find((b) => b.dataset.playing !== undefined && /^Play/.test(b.getAttribute('aria-label') || ''));
  return {
    t: Math.round(performance.now()),
    ph: Number(q('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    pos: q('[data-testid="arrangement-position"]')?.textContent ?? null,
    dp: play?.dataset.playing ?? null,
    playName: play?.getAttribute('aria-label') ?? null,
    pauseBtns: document.querySelectorAll('button[aria-label="Pause"]').length,
    status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
    rms: +Math.max(0, ...(window.__rms ? window.__rms() : [0])).toFixed(5),
  };
});
const ONLY = process.env.C260_ONLY ? new RegExp(process.env.C260_ONLY) : null;
const R = { startedAt: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(path.join(outDir, process.env.C260_OUT || 'c260.json'), JSON.stringify(R, null, 1));
async function smoke(browser, vp, k) {
  const { ctx, page, errors, setup } = await open(browser, vp, { pulse: true, zoom: false });
  const r = { setup }; r.s0 = await st(page);
  await key(page, 'Space', 1200); r.playing = await st(page);
  await sleep(500); r.playing2 = await st(page);
  await key(page, 'Space', 600); r.stopped = await st(page);
  await sleep(700); r.stopped2 = await st(page);
  await shot(page, 'smoke-stopped', k);
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog'); await dlg.waitFor();
  const dlP = page.waitForEvent('download', { timeout: 120000 });
  await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
  const dl = await dlP; const file = path.join(outDir, `smoke-${k}.wav`); await dl.saveAs(file);
  r.wav = wavInfo(fs.readFileSync(file));
  // sample integrity: per-second RMS profile + leading/trailing silence
  const w = readWav(fs.readFileSync(file)); const secs = [];
  for (let s0 = 0; s0 < w.frames; s0 += w.rate) { let s = 0, n = 0; for (const d of w.data) for (let i = s0; i < Math.min(s0 + w.rate, w.frames); i += 1) { s += d[i] * d[i]; n += 1; } secs.push(+(10 * Math.log10(s / n || 1e-20)).toFixed(1)); }
  r.wavPerSecondDb = secs; fs.unlinkSync(file);
  r.errors = errors;
  r.checks = {
    dpSeq: [r.s0.dp, r.playing.dp, r.stopped.dp].join('>'),
    nameConst: [r.s0.playName, r.playing.playName, r.stopped.playName].every((n) => n === 'Play'),
    advances: r.playing2.ph > r.playing.ph && r.playing.ph > r.s0.ph,
    holds: r.stopped2.ph === r.stopped.ph,
    audible: r.playing.rms > 0.001,
    sha: r.wav.sha256 === SHA, nan: r.wav.nan, seconds: r.wav.seconds,
  };
  r.pass = r.checks.dpSeq === 'false>true>false' && r.checks.nameConst && r.checks.advances && r.checks.holds && r.checks.audible && r.checks.sha && r.wav.nan === 0 && errors.length === 0;
  await ctx.close(); return r;
}
async function auth(browser, vp, k) {
  const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const r = {};
  const tokenResponses = []; page.on('response', (res) => { if (res.url().includes('/api/studio-token')) tokenResponses.push(res.status()); });
  r.cookies0 = (await ctx.cookies()).length;
  r.storage0 = (await ctx.storageState()).origins.length;
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 150000 });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
  r.labBadge = await page.evaluate(() => { const t = document.body.innerText; const m = t.match(/[^\n]*demo[^\n]*/i); return m ? m[0].slice(0, 120) : null; });
  r.labBadgeExact = await page.getByText('Demo collection — no sign-in required', { exact: false }).count();
  r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  await shot(page, 'auth-lab', k);
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
  r.guard = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]'), authUser: localStorage.getItem('auth_user') }));
  await shot(page, 'auth-guard', k);
  const api = `${BASE}/api/studio-token?product=middle-east&file=Music.wav`;
  const a = await ctx.request.get(api, { failOnStatusCode: false }); r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 200) };
  const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } }); r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 200) };
  r.pageTokenResponses = tokenResponses;
  const noToken = (t) => !/"token"\s*:\s*"[^"]+"|"url"\s*:\s*"http/i.test(t.body);
  r.pass = r.labWorkspace === 1 && r.labBadgeExact > 0 && r.labAuthUser === null && r.guard.signIn && r.guard.audioSrc === 0 && !r.guard.workspace && r.tokenNoHeader.status === 401 && [403, 500].includes(r.tokenFake.status) && noToken(r.tokenNoHeader) && noToken(r.tokenFake) && !tokenResponses.includes(200);
  await ctx.close(); return r;
}
async function lane(browser, vp, k) {
  const clipT = process.env.C281_CLIP || 'music'; const emptyT = process.env.C281_EMPTY || 'stems';
  const { ctx, page, errors } = await open(browser, vp, { pulse: false });
  const r = { clipT, emptyT };
  r.before = await page.evaluate(([c, e]) => ({ clip: document.querySelector(`[data-track-id="${c}"]`)?.querySelectorAll('[data-clip-kind="audio"]').length ?? null, empty: document.querySelector(`[data-track-id="${e}"]`)?.querySelectorAll('[data-clip-kind="audio"]').length ?? null }), [clipT, emptyT]);
  r.selected = await page.evaluate(() => document.querySelector('[data-source-id][aria-selected="true"], [data-source-id][aria-pressed="true"]')?.getAttribute('data-source-id') ?? null);
  await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1500);
  r.after = await page.evaluate(([c, e]) => {
    const cl = document.querySelector(`[data-track-id="${c}"]`); const em = document.querySelector(`[data-track-id="${e}"]`);
    return { clipLaneExists: !!cl, emptyLaneExists: !!em, clipAudio: cl ? cl.querySelectorAll('[data-clip-kind="audio"]').length : null, emptyAudio: em ? em.querySelectorAll('[data-clip-kind="audio"]').length : null,
      lanes: [...document.querySelectorAll('[data-track-id]')].map((n) => n.getAttribute('data-track-id') + ':' + n.querySelectorAll('[data-clip-kind="audio"]').length) };
  }, [clipT, emptyT]);
  await shot(page, 'detail-lane', k);
  r.errors = errors;
  r.pass = r.after.clipLaneExists && r.after.emptyLaneExists && r.after.clipAudio >= 1 && r.after.emptyAudio === 0 && r.before.clip === 0;
  await ctx.close(); return r;
}
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of [['auth', auth], ['smoke', smoke], ['lane', lane]]) {
      if (ONLY && !ONLY.test(`${name}@${k}`)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${k}`] = await fn(browser, vp, k); } catch (e) { R.rows[`${name}@${k}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${k}`].ms = Date.now() - t0; save();
      console.log(`${name}@${k}`, 'pass=', R.rows[`${name}@${k}`].pass, R.rows[`${name}@${k}`].error || '');
    }
  }
  await browser.close();
})();
