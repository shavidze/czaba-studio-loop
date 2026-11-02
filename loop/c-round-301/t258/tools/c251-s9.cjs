// C round 251: independent browser rows (library line names the Insert Marker). Helpers forked from c-round-250/c250.cjs.
// usage: node c250.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c251.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE; R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';
const LEAD = 0.05;

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

async function open(browser, vp, withPulse = true) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { const t = m.text(); if (/hydrat|Warning:|did not match/i.test(t)) errors.push('console:' + t.slice(0, 300)); });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 150000 });
  await sleep(800);
  if (withPulse) await addPulse(page);
  return { ctx, page, errors };
}
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function addPulse(page) {
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(900);
  await blur(page);
}
const st = (page) => page.evaluate(() => {
  const a = document.activeElement;
  return {
    t: performance.now(),
    ph: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    m: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker') ?? null,
    playing: (document.querySelector('button[aria-label="Play"]')?.dataset.playing === 'true'),
    range: !!document.querySelector('[data-testid="arrangement-range"]'),
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => `${c.closest('[data-track-id]')?.getAttribute('data-track-id')}@${c.getAttribute('data-clip-start')}`),
    flags: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('aria-label')),
    active: a && a !== document.body ? (a.getAttribute('data-testid') || '') + '|' + (a.getAttribute('aria-label') || a.tagName).slice(0, 60) : 'BODY',
    rms: Math.max(0, ...(window.__rms ? window.__rms() : [0])),
  };
});
const statusBox = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-testid="arrangement-status"]'); const r = s.getBoundingClientRect(); const cs = getComputedStyle(s);
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
  const tr = document.querySelector('button[aria-label="Play"], button[aria-label="Pause"]')?.getBoundingClientRect();
  const overlapsTransport = tr ? !(r.bottom <= tr.top || r.top >= tr.bottom || r.right <= tr.left || r.left >= tr.right) : null;
  return { h: +r.height.toFixed(1), fontSize: cs.fontSize, lineHeight: cs.lineHeight, lines: Math.round(r.height / lh), sw: s.scrollWidth, cw: s.clientWidth, overlapsTransport, text: s.textContent };
});
const geo = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect();
  const pps = parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent);
  const lane = (id) => { const b = document.querySelector(`[data-track-id="${id}"]`)?.getBoundingClientRect(); return b ? { y: b.y, h: b.height } : null; };
  const strip = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]')?.getBoundingClientRect();
  const clip = document.querySelector('[data-track-id="music"] [data-clip-id]')?.getBoundingClientRect();
  return { rx: r.x, ry: r.y, rh: r.height, pps, music: lane('music'), sfx: lane('sfx'), strip: strip && { y: strip.y, h: strip.height }, clip: clip && { y: clip.y, h: clip.height } };
});
async function ruler(page, s, wait = 900) { const g = await geo(page); await page.mouse.click(g.rx + s * g.pps, g.ry + g.rh / 2); await sleep(wait); }
async function lane(page, id, s, wait = 900) { const g = await geo(page); await page.mouse.click(g.rx + s * g.pps, g[id].y + g[id].h / 2); await sleep(wait); }
async function clipLow(page, s, wait = 900) { const g = await geo(page); await page.mouse.click(g.rx + s * g.pps, g.clip.y + g.clip.h * 0.75); await sleep(wait); }
async function clipDrag(page, a, b) { const g = await geo(page); const y = g.clip.y + g.clip.h * 0.75; await page.mouse.move(g.rx + a * g.pps, y); await page.mouse.down(); await page.mouse.move(g.rx + ((a + b) / 2) * g.pps, y, { steps: 5 }); await page.mouse.move(g.rx + b * g.pps, y, { steps: 5 }); await page.mouse.up(); await sleep(900); }
async function strip(page, s, wait = 500) { const g = await geo(page); await page.mouse.click(g.rx + s * g.pps, g.strip.y + g.strip.h / 2); await sleep(wait); }
async function key(page, k, wait = 300) { await page.keyboard.press(k); await sleep(wait); }
async function playStop(page, ms = 1500) { await key(page, 'Space', ms); await key(page, 'Space', 300); }
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
const fmt = (s) => { const m = Math.floor(s / 60); const sec = s - m * 60; return `${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`; };
const newClips = (a, b) => b.clips.filter((c) => !a.clips.includes(c) || b.clips.filter((x) => x === c).length > a.clips.filter((x) => x === c).length);
const PAST = (subj, p, e) => `${subj} (${p}) is past the end of the project (${e}) — there is nothing to play here. Home returns to 0.`;
const ST_TOPH = (t) => `Insert marker moved to the playhead (${t}). Space plays from here.`;
const SPLIT_NEEDS = 'To split, click inside a clip to select it and place the insert marker, or make a time selection.';
async function exportWav(page, k, name) {
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog'); await dlg.waitFor();
  const dlP = page.waitForEvent('download', { timeout: 120000 });
  await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
  const dl = await dlP; const file = path.join(outDir, `${name}-${k}.wav`); await dl.saveAs(file);
  await page.keyboard.press('Escape'); await sleep(300);
  return file;
}

const ROWS = {
  async paste(page, k) {
    const r = {};
    await clipLow(page, 8); r.sel = await st(page);
    await key(page, 'Control+c', 400);
    await lane(page, 'sfx', 2); r.lane = await st(page);
    await playStop(page); r.stop = await st(page);
    await key(page, 'Control+v', 700); r.paste = await st(page);
    r.added = newClips(r.stop, r.paste);
    await shot(page, 'paste', k);
    // audio: export and check the pasted 16 s clip starts at 2.000 (project 18 s; residual = original shifted by 2 s)
    const f = await exportWav(page, k, 'paste'); const buf = fs.readFileSync(f); r.wav = wavInfo(buf);
    const ref = path.join(outDir, `smoke-${k}.wav`);
    if (fs.existsSync(ref)) {
      const a = readWav(buf); const o = readWav(fs.readFileSync(ref)); const sh = 2 * a.rate;
      let errBest = null;
      for (const off of [sh - 48, sh, sh + 48]) { let e = 0; let s = 0; for (let i = off; i < Math.min(a.frames, o.frames + off); i += 1) { const want = (i < o.frames ? o.data[0][i] : 0) + o.data[0][i - off]; e += (a.data[0][i] - want) ** 2; s += want * want; } const snr = 10 * Math.log10(s / (e || 1e-30)); if (!errBest || snr > errBest.snr) errBest = { off: (off - sh), snr: +snr.toFixed(1) }; }
      r.align = errBest;
    }
    fs.unlinkSync(f);
    // info: paste while playing
    await key(page, 'Control+z', 500); r.undo = await st(page);
    await key(page, 'Space', 1000); r.playingBefore = await st(page);
    await key(page, 'Control+v', 500); r.pastePlaying = await st(page); r.addedPlaying = newClips(r.undo, r.pastePlaying);
    await key(page, 'Space');
    r.pass = r.sel.m === '8.000' && r.lane.m === '2.000' && r.stop.ph > 3 && r.stop.m === '2.000' && r.added.length === 1 && r.added[0] === 'sfx@2.000' && r.paste.status === 'Paste (1): at 00:02.000 · on the SFX track.' && (!r.wav || r.wav.seconds === 18) ;
    return r;
  },
  async splitStopped(page, k) {
    const r = {};
    await clipLow(page, 5); r.sel = await st(page);
    await playStop(page); r.stop = await st(page);
    await key(page, 'Control+e', 600); r.split = await st(page);
    r.undoTitle = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith('Undo'))?.getAttribute('title'));
    await shot(page, 'split-stopped', k);
    const f = await exportWav(page, k, 'split'); r.wav = wavInfo(fs.readFileSync(f)); fs.unlinkSync(f);
    r.wavEqualsUnsplit = r.wav.sha256 === SHA;
    r.pass = r.sel.m === '5.000' && r.stop.ph > 6 && JSON.stringify(r.split.clips.filter((c) => c.startsWith('music')).sort()) === JSON.stringify(['music@0.000', 'music@5.000']) && r.split.status === 'Clip split at 00:05.000.';
    return r;
  },
  async splitPlaying(page, k) {
    const r = {};
    await clipLow(page, 5); r.sel = await st(page);
    await key(page, 'Space', 1500); r.playing = await st(page);
    await key(page, 'Control+e', 500); r.split = await st(page);
    await sleep(500); r.later = await st(page);
    await key(page, 'Space');
    r.pass = r.playing.playing && r.playing.ph > 6 && JSON.stringify(r.split.clips.filter((c) => c.startsWith('music')).sort()) === JSON.stringify(['music@0.000', 'music@5.000']) && r.split.status === 'Clip split at 00:05.000.' && r.later.playing && r.later.ph > r.split.ph && r.later.rms > 0.0005;
    return r;
  },
  async caption(page, k) {
    const r = {};
    await lane(page, 'sfx', 3); r.lane = await st(page);
    await playStop(page); r.stop = await st(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().click(); await sleep(400);
    r.line = await line(page);
    await shot(page, 'caption-stopped-before', k);
    await page.locator('button', { hasText: /^\+?\s*Add/ }).first().click(); await sleep(900);
    r.add = await st(page); r.added = newClips(r.stop, r.add);
    await shot(page, 'caption-stopped-after', k);
    r.pass = r.stop.ph > 4 && r.stop.m === '3.000' && r.line.text === 'Active track: SFX · insert marker 00:03.000' && !/playhead/i.test(r.line.text) && r.added.length === 1 && r.added[0] === 'sfx@3.000' && r.add.status === '“Soft impact” added to the SFX track at 00:03.000.';
    return r;
  },
  async captionPlaying(page, k) {
    const r = {};
    await lane(page, 'sfx', 3);
    await playStop(page); r.stop = await st(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().click(); await sleep(400);
    await blur(page);
    await key(page, 'Space', 1000); r.playing = await st(page);
    r.line = await line(page);
    await shot(page, 'caption-playing-before', k);
    await page.locator('button', { hasText: /^\+?\s*Add/ }).first().click(); await sleep(700);
    r.add = await st(page); r.added = newClips(r.playing, r.add);
    await sleep(300); r.later = await st(page);
    await blur(page); await key(page, 'Space');
    r.pass = r.playing.playing && r.playing.ph > 3.5 && r.line.text === 'Active track: SFX · insert marker 00:03.000' && r.added.length === 1 && r.added[0] === 'sfx@3.000' && r.add.status === '“Soft impact” added to the SFX track at 00:03.000.' && r.later.playing && r.later.ph > r.add.ph;
    return r;
  },
  async captionMove(page, k) {
    const r = {};
    await ruler(page, 6, 1000); r.a = await st(page); r.la = (await line(page)).span;
    await key(page, 'Space', 1000);
    await ruler(page, 9, 1000); r.b = await st(page); r.lb = (await line(page)).span;
    r.samples = [];
    for (let i = 0; i < 10; i += 1) { const s = await st(page); const l = (await line(page)).span; r.samples.push({ ph: s.ph, playing: s.playing, l, clock: await page.evaluate(() => document.querySelector('[data-testid="arrangement-time"], [data-testid="arrangement-transport-time"]')?.textContent ?? null) }); await sleep(100); }
    await key(page, 'Space', 600); r.stop = await st(page); r.lstop = (await line(page)).span;
    await key(page, 'Control+Shift+Space', 600); r.cs = await st(page); r.lcs = (await line(page)).span;
    await key(page, 'Home', 600); r.home = await st(page); r.lhome = (await line(page)).span;
    await shot(page, 'caption-move', k);
    const phs = r.samples.map((s) => s.ph);
    r.sampleTexts = [...new Set(r.samples.map((s) => s.l))];
    r.phIncreasing = phs.every((p, i) => i === 0 || p >= phs[i - 1]) && phs[9] > phs[0] + 0.5;
    r.pass = r.a.m === '6.000' && r.la === '00:06.000' && r.b.playing && r.b.m === '9.000' && r.lb === '00:09.000' && r.samples.every((s) => s.playing) && r.sampleTexts.length === 1 && r.sampleTexts[0] === '00:09.000' && r.phIncreasing && !r.stop.playing && r.lstop === '00:09.000' && r.lcs === fmt(Math.round(r.stop.ph * 1000) / 1000) && r.cs.m === (Math.round(r.stop.ph * 1000) / 1000).toFixed(3) && r.lhome === '00:00.000';
    return r;
  },
  async captionWide(page, k) {
    const r = {};
    await lane(page, 'sfx', 3);
    await page.locator('[data-source-id="demo-soft-impact"]').first().click(); await sleep(400);
    await page.locator('[data-track-id="video"] button[aria-pressed]').first().click(); await sleep(700);
    r.line = await line(page);
    r.addBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^\+?\s*Add/.test(x.textContent.trim())); return b ? { disabled: b.disabled, text: b.textContent.trim(), title: b.title } : null; });
    await shot(page, 'caption-wide', k);
    r.pass = r.line.text === 'Active track: Video (audio is not added here) · insert marker 00:03.000' && r.line.lines === 2 && r.line.lastBottom <= r.line.p.bottom + 0.5 && r.line.p.sw === r.line.p.cw && r.line.p.sh === r.line.p.ch && r.addBtn && r.addBtn.disabled;
    return r;
  },
  async addEnter(page, k) {
    const r = {};
    await lane(page, 'sfx', 3); await playStop(page); r.stop = await st(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().focus(); await sleep(250);
    r.line = await line(page);
    await key(page, 'Enter', 900); r.add = await st(page); r.added = newClips(r.stop, r.add);
    r.pass = r.stop.ph > 4 && r.line.span === '00:03.000' && r.added.length === 1 && r.added[0] === `sfx@${r.stop.m}` && r.stop.m === '3.000' && r.add.status === '“Soft impact” added to the SFX track at 00:03.000.';
    return r;
  },
  async addDbl(page, k) {
    const r = {};
    await lane(page, 'sfx', 4); await playStop(page); r.stop = await st(page);
    r.line0 = await line(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().dblclick(); await sleep(900);
    r.after = await st(page); r.added = newClips(r.stop, r.after);
    r.pass = r.stop.ph > 5 && r.line0.span === '00:04.000' && r.added.length === 1 && r.added[0] === 'sfx@4.000';
    return r;
  },
  async nDrop(page, k) {
    const r = {};
    await lane(page, 'sfx', 3);
    const g = await geo(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().scrollIntoViewIfNeeded(); await sleep(300);
    const src = await page.locator('[data-source-id="demo-soft-impact"]').first().boundingBox();
    await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await page.mouse.down();
    await page.mouse.move(src.x + 60, src.y + 10, { steps: 5 });
    await page.mouse.move(g.rx + 9 * g.pps, g.sfx.y + g.sfx.h / 2, { steps: 15 }); await sleep(200);
    await shot(page, 'ndrop-over', k);
    await page.mouse.up(); await sleep(900);
    r.after = await st(page); r.added = r.after.clips.filter((c) => c.startsWith('sfx'));
    r.pass = r.added.length === 1 && Math.abs(parseFloat(r.added[0].split('@')[1]) - 9) < 0.6 && r.added[0] !== 'sfx@3.000';
    return r;
  },
  async nReadouts(page, k) {
    const r = {};
    await lane(page, 'sfx', 3);
    await page.locator('[data-source-id="demo-soft-impact"]').first().click(); await sleep(300);
    r.title = await page.evaluate(() => document.querySelector('[data-testid="arrangement-library-insert-marker"]')?.closest('p')?.getAttribute('title'));
    await blur(page);
    const read = () => page.evaluate(() => ({
      handle: document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow'),
      clock: document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? null,
      detail: document.querySelector('[data-testid="arrangement-detail-playhead"]')?.textContent ?? null,
      overview: document.querySelector('[data-testid="arrangement-overview-playhead"]')?.getAttribute('style') ?? null,
      line2: document.querySelector('[data-testid="arrangement-playhead"]')?.getAttribute('style') ?? null,
      line: document.querySelector('[data-testid="arrangement-library-insert-marker"]')?.textContent,
    }));
    await key(page, 'Space', 600); r.r1 = await read(); await sleep(700); r.r2 = await read(); await key(page, 'Space');
    r.pass = r.title === 'Active track: SFX' && r.r1.handle !== r.r2.handle && r.r1.line === r.r2.line && r.r1.line === '00:03.000' && r.r1.clock !== r.r2.clock && r.r1.overview !== r.r2.overview && r.r1.line2 !== r.r2.line2 && (r.r1.detail === null || r.r1.detail !== r.r2.detail);
    return r;
  },
};
async function line(page) {
  return page.evaluate(() => {
    const s = document.querySelector('[data-testid="arrangement-library-insert-marker"]') || document.querySelector('[data-testid="arrangement-library-playhead"]');
    if (!s) return null;
    const p = s.closest('p'); const pr = p.getBoundingClientRect();
    const rg = document.createRange(); rg.selectNodeContents(p); const rects = [...rg.getClientRects()].filter((x) => x.width > 0);
    return { testid: s.getAttribute('data-testid'), span: s.textContent, text: p.textContent.replace(/\s+/g, ' ').trim(), title: p.getAttribute('title'), lines: new Set(rects.map((x) => Math.round(x.top))).size, lastBottom: Math.max(...rects.map((x) => x.bottom)), p: { w: pr.width, h: pr.height, bottom: pr.bottom, sw: p.scrollWidth, cw: p.clientWidth, sh: p.scrollHeight, ch: p.clientHeight }, libW: p.closest('aside, [data-testid*="library"]')?.getBoundingClientRect().width ?? null };
  });
}
const STANDALONE = {
  async budget(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, false);
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
    const { ctx, page, errors } = await open(browser, vp, true);
    const r = {}; r.s0 = await st(page);
    await key(page, 'Space', 900); r.playing = await st(page);
    await key(page, 'Space', 400); r.paused = await st(page); await sleep(500); r.paused2 = await st(page);
    await page.keyboard.press('Space'); await sleep(250); r.again = await st(page); await key(page, 'Space');
    const file = await exportWav(page, k, 'smoke');
    r.wav = wavInfo(fs.readFileSync(file)); // kept as reference for the paste alignment row
    r.errors = errors;
    r.pass = r.playing.playing && r.playing.ph > r.s0.ph && r.playing.rms > 0.001 && r.paused.ph === r.paused2.ph && r.again.ph <= 0.3 + LEAD && r.wav.sha256 === SHA && r.wav.nan === 0 && errors.length === 0;
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
      try { const { ctx, page, errors } = await open(browser, vp); R.rows[key2] = await fn(page, k, name); R.rows[key2].errors = errors; await ctx.close(); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      const x = R.rows[key2];
      console.log(key2, 'pass=', x.pass, x.error ? x.error.slice(0, 300) : '', 'err', (x.errors || []).length);
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
