// C round 252: independent browser rows (SABA-B-10a stage 2b: Follow pause/resume on ruler clicks, nav origin, titles, at-end wording).
// usage: node c252.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c252.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE; R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
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
async function open(browser, vp, { pulse = true, zoom = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { const t = m.text(); if (/hydrat|Warning:|did not match/i.test(t)) errors.push('console:' + t.slice(0, 300)); });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
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
const st = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const a = document.activeElement;
  const f = q('[data-testid="arrangement-follow"]');
  const sc = q('[data-testid="arrangement-timeline-scroller"]');
  const pl = q('[data-testid="arrangement-playhead"]');
  return {
    t: performance.now(),
    ph: Number(q('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    pos: q('[data-testid="arrangement-position"]')?.textContent ?? null,
    m: q('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null,
    playing: (q('button[aria-label="Play"]')?.dataset.playing === 'true'),
    follow: f?.getAttribute('data-follow-mode') ?? null, followText: f?.textContent ?? null, followTitle: f?.getAttribute('title') ?? null,
    status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
    scrollLeft: sc?.scrollLeft ?? null,
    playheadX: pl ? +pl.getBoundingClientRect().x.toFixed(1) : null,
    selMarkers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].filter((m) => m.getAttribute('aria-current') === 'true').map((m) => m.getAttribute('data-marker-time') ?? m.getAttribute('aria-label')),
    markers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('data-marker-time') ?? m.getAttribute('aria-label')),
    active: a && a !== document.body ? (a.getAttribute('data-testid') || '') + '|' + (a.getAttribute('aria-label') || a.tagName).slice(0, 60) : 'BODY',
    rms: Math.max(0, ...(window.__rms ? window.__rms() : [0])),
  };
});
const geo = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect();
  const b = document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getBoundingClientRect();
  const s = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]')?.getBoundingClientRect();
  const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
  const pps = parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent);
  const lane = (id) => { const x = document.querySelector(`[data-track-id="${id}"]`)?.getBoundingClientRect(); return x ? { y: x.y, h: x.height } : null; };
  const clip = document.querySelector('[data-track-id="music"] [data-clip-id]')?.getBoundingClientRect();
  return { rx: r.x, ry: r.y, rh: r.height, bx: b?.x, by: b?.y, bh: b?.height, sy: s?.y, sh: s?.height, scLeft: sc.left, scRight: sc.right, pps, sfx: lane('sfx'), music: lane('music'), clip: clip && { y: clip.y, h: clip.height } };
});
const hit = (page, x, y) => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const t = e?.closest('[data-testid]'); return t ? t.getAttribute('data-testid') : e?.tagName ?? null; }, [x, y]);
// click at viewport x on a target band; refuse when elementFromPoint is not the named target
async function aimClick(page, x, y, want, mods) {
  const h = await hit(page, x, y);
  if (!want.includes(h)) throw new Error(`aim ${x.toFixed(0)},${y.toFixed(0)} hit ${h}, want ${want}`);
  if (mods) await page.keyboard.down(mods);
  await page.mouse.click(x, y);
  if (mods) await page.keyboard.up(mods);
  return h;
}
const lowerY = (g) => g.by + g.bh - 3;
const stripY = (g) => g.sy + g.sh / 2;
const secY = (g) => g.ry + g.rh / 2;
const safeX = (g) => g.scRight - 300; // right of the metronome toggle (A's aim note), well inside the scroller
async function key(page, k, wait = 300) { await page.keyboard.press(k); await sleep(wait); }
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
const fmt = (s) => { const m = Math.floor(s / 60); const sec = s - m * 60; return `${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`; };
const PAUSED_TXT = (t) => `Insert marker at ${t} — playback continues, Follow paused. Stop, then Space plays from here.`;
const PLAYING_TXT = (t) => `Insert marker at ${t} — playback continues. Stop, then Space plays from here.`;
const RESUMED = 'Follow is following the playback position again.';
const FOLLOW_PAUSED = 'Follow paused by manual navigation. Follow or Play resumes it.';
const statusLog = (page) => page.evaluate(() => window.__statusLog.slice());
const statusBox = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-testid="arrangement-status"]'); const r = s.getBoundingClientRect(); const cs = getComputedStyle(s);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
  const tr = document.querySelector('button[aria-label="Play"], button[aria-label="Pause"]')?.getBoundingClientRect();
  const overlapsTransport = tr ? !(r.bottom <= tr.top || r.top >= tr.bottom || r.right <= tr.left || r.left >= tr.right) : null;
  const rg = document.createRange(); rg.selectNodeContents(s); const rects = [...rg.getClientRects()].filter((x) => x.width > 0);
  return { h: +r.height.toFixed(1), lines: Math.round(r.height / lh), textLines: new Set(rects.map((x) => Math.round(x.top))).size, sw: s.scrollWidth, cw: s.clientWidth, sh: s.scrollHeight, ch: s.clientHeight, overlapsTransport, text: s.textContent };
});
async function samples(page, n, every) { const out = []; for (let i = 0; i < n; i += 1) { await sleep(every); const s = await st(page); out.push({ dt: (i + 1) * every, follow: s.follow, scrollLeft: s.scrollLeft, ph: s.ph, playing: s.playing }); } return out; }

const ROWS = {
  // C-FOLLOW-PAUSE-252 + C-FOLLOW-STOP-252 (+ C-FOCUS)
  async followPause(page, k) {
    const r = {};
    await key(page, 'Space', 700); r.playing = await st(page);
    let g = await geo(page);
    r.aim = await aimClick(page, safeX(g), lowerY(g), ['arrangement-bars-ruler']);
    await sleep(120); r.after = await st(page);
    r.logAfterClick = (await statusLog(page)).filter((x) => x.t > r.playing.t).map((x) => x.text);
    r.box = await statusBox(page);
    await shot(page, 'follow-pause', k);
    await sleep(1500); r.after1500 = await st(page);
    r.phAdvance = +(r.after1500.ph - r.after.ph).toFixed(3);
    await key(page, 'Space', 500); r.stop = await st(page);
    await shot(page, 'follow-stop', k);
    // control in the same page: a stop with no pause
    await key(page, 'Space', 1000); r.play2 = await st(page); await key(page, 'Space', 500); r.stop2 = await st(page);
    const exp = PAUSED_TXT(fmt(Number(r.after.m)));
    r.expStatus = exp;
    r.pausePass = r.playing.playing && r.playing.follow === 'on' && r.after.follow === 'paused' && r.after.followText === 'Follow ‖' && r.after.status === exp && r.after.playing && r.after1500.playing && r.phAdvance > 1.2 && r.after1500.rms > 0.0005 && r.after.active === r.playing.active && Number(r.after.m) % 0.25 === 0;
    r.stopPass = !r.stop.playing && r.stop.follow === 'on' && r.stop.followText === 'Follow' && !/Follow/.test(r.stop.status || '');
    r.stopStatusUnchangedByStop = r.stop.status === r.after1500.status;
    r.pass = r.pausePass && r.stopPass;
    return r;
  },
  // C-FOLLOW-SECONDS-252
  async followSeconds(page, k) {
    const r = {};
    await key(page, 'Space', 700); r.playing = await st(page);
    const g = await geo(page);
    r.aim = await aimClick(page, safeX(g), secY(g), ['arrangement-ruler']);
    await sleep(120); r.after = await st(page);
    await sleep(1500); r.after1500 = await st(page);
    r.phAdvance = +(r.after1500.ph - r.after.ph).toFixed(3);
    await shot(page, 'follow-seconds', k);
    await key(page, 'Space', 400); r.stop = await st(page);
    r.expStatus = PAUSED_TXT(fmt(Number(r.after.m)));
    r.pass = r.playing.follow === 'on' && r.after.follow === 'paused' && r.after.followText === 'Follow ‖' && r.after.status === r.expStatus && r.after1500.playing && r.phAdvance > 1.2 && r.after.active === r.playing.active && r.stop.follow === 'on';
    return r;
  },
  // C-FOLLOW-RESUME-252: paused by ruler click, strip click ~100 px from the right edge
  async followResume(page, k) {
    const r = {};
    await key(page, 'Space', 700);
    let g = await geo(page);
    await aimClick(page, safeX(g), lowerY(g), ['arrangement-bars-ruler']); await sleep(150);
    r.paused = await st(page);
    g = await geo(page);
    r.stripX = g.scRight - 100;
    r.aim = await aimClick(page, r.stripX, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']);
    await sleep(80); r.after = await st(page);
    r.samples = await samples(page, 12, 250);
    await shot(page, 'follow-resume', k);
    await key(page, 'Space', 300);
    r.stayedOn = r.samples.every((s) => s.follow === 'on');
    r.scrollChanged2s = r.samples.slice(0, 8).some((s) => s.scrollLeft !== r.after.scrollLeft);
    r.pass = r.paused.follow === 'paused' && r.after.follow === 'on' && r.after.status === RESUMED && r.after.playing && r.stayedOn && r.scrollChanged2s && r.paused.active === r.after.active;
    return r;
  },
  // control for the resume row: paused, strip click near the right edge on a server where strip does not resume (HEAD), or Follow off here
  async followResumeControlOff(page, k) {
    const r = {};
    await page.getByTestId('arrangement-follow').click(); await sleep(200); await blur(page);
    r.off = await st(page);
    await key(page, 'Space', 700);
    let g = await geo(page);
    await aimClick(page, g.scRight - 100, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']); await sleep(80);
    r.afterStrip = await st(page);
    r.samples = await samples(page, 8, 250);
    g = await geo(page);
    await aimClick(page, safeX(g), lowerY(g), ['arrangement-bars-ruler']); await sleep(120);
    r.afterLower = await st(page);
    await key(page, 'Space', 300);
    r.scrollStayed = r.samples.every((s) => s.scrollLeft === r.afterStrip.scrollLeft);
    // C-FOLLOW-OFF-252
    r.pass = r.off.follow === 'off' && r.afterStrip.follow === 'off' && r.afterLower.follow === 'off' && r.afterLower.status === PLAYING_TXT(fmt(Number(r.afterLower.m))) && r.scrollStayed;
    return r;
  },
  // HEAD-only control: paused, strip near right edge → stays paused and scroll stays put (run on :5174)
  async followResumeControlPaused(page, k) {
    const r = {};
    await key(page, 'Space', 700);
    let g = await geo(page);
    // pause by a manual horizontal scroll (works at HEAD too)
    await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft += 200; });
    await sleep(300); r.paused = await st(page);
    await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft -= 200; });
    await sleep(300);
    g = await geo(page);
    await aimClick(page, g.scRight - 100, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']); await sleep(80);
    r.after = await st(page);
    r.samples = await samples(page, 8, 250);
    await key(page, 'Space', 300);
    r.scrollStayed = r.samples.every((s) => s.scrollLeft === r.after.scrollLeft);
    r.pass = r.paused.follow === 'paused';
    return r;
  },
  // C-FOLLOW-STOPPED-252
  async followStopped(page, k) {
    const r = {};
    r.s0 = await st(page);
    let g = await geo(page);
    r.aimLower = await aimClick(page, safeX(g), lowerY(g), ['arrangement-bars-ruler']); await sleep(200);
    r.lower = await st(page);
    g = await geo(page);
    r.aimSec = await aimClick(page, safeX(g) - 120, secY(g), ['arrangement-ruler']); await sleep(200);
    r.sec = await st(page);
    r.pass = r.lower.follow === 'on' && r.sec.follow === 'on' && r.lower.m !== r.s0.m && r.sec.m !== r.lower.m && !/Follow/.test(r.lower.status) && !/Follow/.test(r.sec.status) && !r.lower.playing && !r.sec.playing;
    return r;
  },
  // C-FOLLOW-LANE-252
  async followLane(page, k) {
    const r = {};
    await key(page, 'Space', 700); r.playing = await st(page);
    const g = await geo(page);
    r.aim = await aimClick(page, safeX(g), g.sfx.y + g.sfx.h / 2, ['arrangement-lane', 'arrangement-track-sfx', 'arrangement-lane-sfx', 'arrangement-timeline-scroller'].concat([await hit(page, safeX(g), g.sfx.y + g.sfx.h / 2)]));
    await sleep(150); r.after = await st(page);
    await key(page, 'Space', 300);
    r.pass = r.after.follow === 'on' && r.after.m !== r.playing.m && r.after.status === PLAYING_TXT(fmt(Number(r.after.m))) && r.after.playing;
    return r;
  },
  // §6 neighbours: ruler drag pauses with followPaused; strip click playing with Follow on jumps without a status write; auto-scroll does not re-pause
  async neighbours(page, k) {
    const r = {};
    await key(page, 'Space', 700); r.p0 = await st(page);
    let g = await geo(page);
    const y = lowerY(g); const x = safeX(g);
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 60, y, { steps: 6 }); await page.mouse.move(x - 120, y, { steps: 6 }); await page.mouse.up(); await sleep(200);
    r.drag = await st(page);
    await key(page, 'Space', 300);
    r.reOn = await st(page); // Stop resumes a drag-paused Follow (stage 2b)
    // strip click while playing, Follow on
    await key(page, 'Space', 700); r.p1 = await st(page);
    const logT = r.p1.t;
    g = await geo(page);
    await aimClick(page, g.scRight - 100, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']); await sleep(100);
    r.strip = await st(page);
    r.stripLog = (await statusLog(page)).filter((e) => e.t > logT).map((e) => e.text);
    r.auto = await samples(page, 16, 250);
    await key(page, 'Space', 300);
    r.autoScrolled = r.auto.some((s) => s.scrollLeft !== r.strip.scrollLeft);
    r.autoStayedOn = r.auto.every((s) => s.follow === 'on');
    r.pass = r.drag.follow === 'paused' && r.drag.status === FOLLOW_PAUSED && r.reOn.follow === 'on' && r.strip.follow === 'on' && r.strip.playing && r.stripLog.length === 0 && r.autoScrolled && r.autoStayedOn && r.strip.ph > r.p1.ph + 1;
    return r;
  },
  // §6 neighbour BR2: stopped strip click plays from the snapped line (playFromRuler stopped branch)
  async stripStopped(page, k) {
    const r = {};
    r.s0 = await st(page);
    const g = await geo(page);
    r.x = g.rx + 4.07 * g.pps;
    r.aim = await aimClick(page, r.x, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']);
    await sleep(60); r.a = await st(page);
    await sleep(700); r.b = await st(page);
    await key(page, 'Space', 300); r.stop = await st(page);
    r.pass = r.a.playing && r.a.ph >= 4 && r.a.ph < 4.3 && r.b.ph > r.a.ph + 0.4 && r.b.rms > 0.0005 && r.a.follow === 'on' && r.b.follow === 'on' && !r.stop.playing;
    return r;
  },
  // C-NAV-ORIGIN-252
  async navOrigin(page, k) {
    const r = {};
    const at = async (t, wait = 200) => { const g = await geo(page); const x = g.rx + t * g.pps; await aimClick(page, x, secY(g), ['arrangement-ruler']); await sleep(wait); };
    for (const t of [2, 6]) { await at(t); await key(page, 'm', 250); r[`afterM${t}`] = await st(page); await key(page, 'Enter', 250); await blur(page); }
    r.markers = (await st(page)).markers;
    await at(1, 300); r.at1 = await st(page);
    await key(page, 'Space', 3000); await key(page, 'Space', 400); r.stopped = await st(page);
    await key(page, 'Control+ArrowRight', 400); r.next = await st(page);
    await shot(page, 'nav-origin', k);
    r.steps = [];
    for (let i = 0; i < 5; i += 1) { await key(page, 'Control+ArrowRight', 300); const s = await st(page); r.steps.push({ m: s.m, ph: s.ph, status: s.status, playing: s.playing }); if ((s.status || '').startsWith('No more markers')) break; }
    // playing: live origin
    await at(1, 300); await key(page, 'Space', 1600); r.playBefore = await st(page);
    await key(page, 'Control+ArrowRight', 300); r.playNext = await st(page);
    await key(page, 'Space', 300);
    // playing none-before (A's fast recipe): Home, Space, two quick Ctrl+Left
    await key(page, 'Home', 300); await key(page, 'Space', 250);
    await page.keyboard.press('Control+ArrowLeft'); await sleep(30); await page.keyboard.press('Control+ArrowLeft'); await sleep(200);
    r.playNone = await st(page);
    await key(page, 'Space', 300);
    r.noneStopped = r.steps[r.steps.length - 1];
    r.pass = r.stopped.ph > 3.4 && r.stopped.m === '1.000' && r.next.m === '2.000' && Math.abs(r.next.ph - 2) < 0.001 && r.next.pos === '00:02.000' && r.next.selMarkers.length === 1 && r.noneStopped.status === 'No more markers after the insert marker' && r.playNext.playing && r.playBefore.ph > 2.2;
    r.playLiveOrigin = r.playNext.m;
    r.playNonePass = r.playNone.playing && r.playNone.status === 'No more markers before the playhead';
    return r;
  },
  // C-TITLES-252
  async titles(page, k) {
    const r = {};
    const g = await geo(page);
    const y = g.clip.y + g.clip.h * 0.75; const x0 = g.rx + 3 * g.pps;
    await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move(x0 + g.pps, y, { steps: 5 }); await page.mouse.move(x0 + 2 * g.pps, y, { steps: 5 }); await page.mouse.up(); await sleep(500);
    r.t = await page.evaluate(() => ({
      seconds: document.querySelector('[data-testid="arrangement-ruler"]')?.getAttribute('title'),
      bars: document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getAttribute('title'),
      range: !!document.querySelector('[data-testid="arrangement-range"]'),
      bodies: [...document.querySelectorAll('[data-clip-id] [title^="drag = time selection"]')].map((e) => e.getAttribute('title')),
      oldAny: [...document.querySelectorAll('[title]')].map((e) => e.getAttribute('title')).filter((t) => /click = playhead/i.test(t)),
    }));
    const RT = 'Click = insert marker · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection';
    r.pass = r.t.seconds === RT && r.t.bars === RT && r.t.range && r.t.bodies.length >= 1 && r.t.bodies.every((b) => b === 'drag = time selection · click = insert marker') && r.t.oldAny.length === 0;
    return r;
  },
  // C-PASTEND-252 + C-STATUS-WIDE-252 (at-end and past-end boxes)
  async pastEnd(page, k) {
    const r = {};
    r.end = await page.evaluate(() => { const t = document.querySelector('[data-testid="arrangement-position"]')?.parentElement?.textContent ?? ''; const m = t.match(/\/\s*(\d\d:\d\d\.\d{3})/); return m ? m[1] : t.slice(0, 80); });
    let g = await geo(page);
    await page.evaluate((d) => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft += d; }, g.rx + 16 * g.pps - (g.scLeft + g.scRight) / 2);
    await sleep(400);
    g = await geo(page);
    const endS = 16;
    const xEnd = g.rx + endS * g.pps;
    r.xEnd = xEnd; r.scRight = g.scRight;
    await aimClick(page, xEnd - 0.04 * g.pps, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler']); await sleep(400);
    r.atEnd = await st(page); r.atEndBox = await statusBox(page);
    await shot(page, 'pastend-at', k);
    g = await geo(page);
    const xPast = g.rx + 16.3 * g.pps;
    r.xPastInView = xPast < g.scRight;
    if (r.xPastInView) {
      await aimClick(page, xPast, stripY(g), ['arrangement-bars-scrub-strip', 'arrangement-bars-ruler'], 'Alt'); await sleep(400);
      r.past = await st(page); r.pastBox = await statusBox(page);
      await shot(page, 'pastend-past', k);
    }
    r.expAt = `Insert marker (${r.end}) is at the end of the project — there is nothing to play here. Home returns to 0.`;
    r.pass = r.end === '00:16.000' && r.atEnd.status === r.expAt && !r.atEnd.playing && !!r.past && /is past the end of the project \(00:16\.000\)/.test(r.past.status) && !r.past.playing && r.atEndBox.overlapsTransport === false && r.atEndBox.sw <= r.atEndBox.cw && r.pastBox.overlapsTransport === false && r.atEndBox.textLines <= r.pastBox.textLines;
    return r;
  },
};
const STANDALONE = {
  async budget(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: false });
    const inv = () => page.evaluate(() => {
      const rows = [];
      const vis = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
      for (const el of document.body.querySelectorAll('*')) {
        if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
        if (!own || el.closest('.sr-only') || !vis(el)) continue;
        if (el.closest('[data-testid="arrangement-timeline-scroller"]')) continue;
        if (el.closest('[data-testid="arrangement-status"]')) continue;
        const region = el.closest('[data-testid]') ? el.closest('[data-testid]').getAttribute('data-testid') : el.tagName;
        rows.push(`${region}|${own.slice(0, 140)}`);
      }
      return rows;
    });
    const empty = await inv(); await shot(page, 'budget-empty', k);
    await addPulse(page);
    const demo = await inv(); await shot(page, 'budget-demo', k);
    await ctx.close();
    const exp = k === '1440x900' ? [85, 101] : [69, 85];
    return { empty: empty.length, demo: demo.length, exp, pass: empty.length === exp[0] && demo.length === exp[1], errors };
  },
  async smoke(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const r = {}; r.s0 = await st(page);
    await key(page, 'Space', 1200); r.playing = await st(page);
    await key(page, 'Space', 400);
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 120000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `smoke-${k}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors;
    r.pass = r.playing.playing && r.playing.ph > r.s0.ph && r.playing.rms > 0.001 && r.wav.sha256 === SHA && r.wav.nan === 0 && Math.abs(r.wav.seconds - 16) < 0.001 && errors.length === 0;
    await ctx.close(); return r;
  },
  async auth(browser, vp, k) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const r = {};
    r.cookies0 = (await ctx.cookies()).length;
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 150000 });
    r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]') }));
    await shot(page, 'auth-guard', k);
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false }); r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } }); r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    r.pass = r.labWorkspace === 1 && r.labAuthUser === null && r.guard.signIn && r.guard.audioSrc === 0 && !r.guard.workspace && r.tokenNoHeader.status === 401 && r.tokenFake.status !== 200;
    await ctx.close(); return r;
  },
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  const vps = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }].filter((v) => !onlyVp || String(v.width) === onlyVp);
  for (const vp of vps) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(STANDALONE)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { R.rows[key2] = await fn(browser, vp, k); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      console.log(key2, 'pass=', R.rows[key2].pass, R.rows[key2].error ? R.rows[key2].error.slice(0, 300) : '');
    }
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { const { ctx, page, errors, setup } = await open(browser, vp); R.rows[key2] = await fn(page, k, name); R.rows[key2].setup = setup; R.rows[key2].errors = errors; await ctx.close(); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      const x = R.rows[key2];
      console.log(key2, 'pass=', x.pass, x.error ? x.error.slice(0, 300) : '', 'err', (x.errors || []).length);
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
