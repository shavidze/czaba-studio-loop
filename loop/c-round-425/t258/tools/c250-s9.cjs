// C round 250: independent browser rows for SABA-B-10a stage 2a (edit commands at the Insert Marker).
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
const resultFile = path.join(outDir, 'c250.json');
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
  page.on('pageerror', (e) => errors.push(String(e)));
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
  async splitRefusal(page, k) {
    const r = {};
    await lane(page, 'sfx', 3); r.lane = await st(page);
    r.selected = await page.evaluate(() => document.querySelectorAll('[data-clip-id][aria-pressed="true"], [data-clip-id][data-selected="true"]').length);
    r.splitBtn = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Split/.test(x.getAttribute('title') || '')); return b ? { title: b.title, disabled: b.disabled } : null; });
    await key(page, 'Control+e', 500); r.after = await st(page); r.box = await statusBox(page);
    await shot(page, 'split-refusal', k);
    r.pass = r.after.status === SPLIT_NEEDS && r.box.sw === r.box.cw && r.box.lines === 1 && r.box.fontSize === '16px' && JSON.stringify(r.after.clips) === JSON.stringify(r.lane.clips);
    return r;
  },
  async addStopped(page, k) {
    const r = {};
    await lane(page, 'sfx', 3); r.lane = await st(page);
    await playStop(page); r.stop = await st(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().focus(); await sleep(200);
    await key(page, 'Enter', 900); r.add = await st(page); r.added = newClips(r.stop, r.add);
    await shot(page, 'add-stopped', k);
    r.pass = r.stop.ph > 4 && r.added.length === 1 && r.added[0] === 'sfx@3.000' && r.add.status === '“Soft impact” added to the SFX track at 00:03.000.';
    return r;
  },
  async addPlaying(page, k) {
    const r = {};
    await lane(page, 'sfx', 3);
    await key(page, 'Space', 1500); r.playing = await st(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().focus(); await sleep(150);
    await key(page, 'Enter', 700); r.add = await st(page); r.added = newClips(r.playing, r.add);
    await blur(page); await key(page, 'Space');
    r.pass = r.playing.playing && r.added.length === 1 && r.added[0] === 'sfx@3.000' && r.add.playing && r.add.status === '“Soft impact” added to the SFX track at 00:03.000.';
    return r;
  },
  async markerM(page, k) {
    const r = {};
    await ruler(page, 2); await playStop(page); r.stop = await st(page);
    await key(page, 'm', 400); r.editorActive = (await st(page)).active;
    await key(page, 'Enter', 600); r.m1 = await st(page);
    await blur(page);
    await key(page, 'Space', 1200); r.before = await st(page);
    await key(page, 'm', 300); await key(page, 'Enter', 500); r.m2 = await st(page);
    await blur(page); await key(page, 'Space');
    const times = r.m2.flags.map((f) => { const x = /(\d\d):(\d\d\.\d{3})$/.exec(f); return x ? +x[1] * 60 + +x[2] : null; });
    r.times = times;
    const second = times.find((t) => t !== 2);
    r.pass = r.stop.ph > 3 && r.m1.flags.some((f) => /00:02\.000$/.test(f)) && second >= 3.0 && second <= 3.4 && r.m2.playing;
    await shot(page, 'marker-m', k);
    return r;
  },
  async pastEnd(page, k) {
    const r = {};
    await ruler(page, 18); r.r = await st(page);
    await key(page, 'Space', 400); r.space = await st(page); r.boxSpace = await statusBox(page);
    await shot(page, 'pastend-space', k);
    await key(page, 'Shift+Space', 400); r.shift = await st(page);
    await blur(page); await page.mouse.click(5, 5); await sleep(300);
    await strip(page, 17.5, 600); r.strip = await st(page);
    await shot(page, 'pastend-strip', k);
    const mt = r.strip.m ? fmt(+r.strip.m) : null;
    r.pass = r.r.m === '18.000' && r.space.status === PAST('Insert marker', '00:18.000', '00:16.000') && !r.space.playing && r.shift.status === PAST('Playhead', '00:18.000', '00:16.000') && !r.shift.playing && /^Insert marker \(\d\d:\d\d\.\d{3}\) is past the end of the project \(00:16\.000\) — there is nothing to play here\. Home returns to 0\.$/.test(r.strip.status) && !r.strip.playing && r.boxSpace.lines === 1 && r.boxSpace.sw === r.boxSpace.cw;
    r.stripMarkerFmt = mt;
    return r;
  },
  async gesture(page, k) {
    const r = {};
    await ruler(page, 2); await playStop(page); r.stop = await st(page);
    const g = await geo(page); const y = g.clip.y + g.clip.h * 0.75;
    await page.mouse.move(g.rx + 6 * g.pps, y); await page.mouse.down();
    await page.mouse.move(g.rx + 7 * g.pps, y, { steps: 4 }); await page.mouse.move(g.rx + 8 * g.pps, y, { steps: 4 }); await sleep(200);
    r.mid0 = await st(page);
    await key(page, 'Control+Shift+Space', 200); await key(page, 'Home', 200);
    r.mid = await st(page);
    await page.mouse.up(); await sleep(600); r.up = await st(page);
    await shot(page, 'gesture', k);
    r.pass = r.mid0.range && r.mid.m === '2.000' && r.mid.ph === r.stop.ph && r.mid.range && r.up.m === '2.000' && r.up.ph === r.stop.ph && r.up.range && r.mid.active === r.mid0.active;
    return r;
  },
  async cmd(page, k) {
    const r = {};
    await ruler(page, 2); await playStop(page); r.stop = await st(page);
    await key(page, 'Meta+Shift+Space', 400); r.cmd = await st(page);
    const t = Math.round(r.stop.ph * 1000) / 1000;
    r.pass = r.stop.m === '2.000' && r.cmd.m === t.toFixed(3) && r.cmd.status === ST_TOPH(fmt(t)) && !r.cmd.playing;
    return r;
  },
  async keysFields(page, k) {
    const r = {};
    await ruler(page, 2); await playStop(page); r.stop = await st(page);
    r.fields = {};
    for (const [nm, sel] of [['bpm', '[data-testid="arrangement-tempo-input"]'], ['search', '[data-testid="arrangement-library-search"]']]) {
      await page.locator(sel).first().focus(); await sleep(200);
      const out = {};
      for (const kk of ['Space', 'Shift+Space', 'Control+Shift+Space', 'Meta+Shift+Space']) { await key(page, kk, 400); out[kk] = await st(page); }
      out.value = await page.locator(sel).first().inputValue();
      r.fields[nm] = out; await blur(page); await sleep(200);
    }
    r.pass = Object.values(r.fields).every((f) => ['Space', 'Shift+Space', 'Control+Shift+Space', 'Meta+Shift+Space'].every((kk) => !f[kk].playing && f[kk].m === r.stop.m && f[kk].ph === r.stop.ph));
    return r;
  },
  async titles(page, k) {
    const r = {};
    await page.mouse.click(5, 5); await blur(page);
    r.split = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Split/.test(x.getAttribute('title') || '')); return b && b.title; });
    r.add = await page.getByTestId('arrangement-marker-add').getAttribute('title');
    await key(page, '?', 700);
    r.sheet = await page.evaluate(() => ['split', 'marker', 'add-sound'].map((id) => { const row = document.querySelector(`[data-shortcut-id="${id}"]`); if (!row) return { id, missing: true }; const rr = row.getBoundingClientRect(); const over = [...row.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1).length; return { id, text: row.textContent.replace(/\s+/g, ' ').trim(), h: +rr.height.toFixed(1), over }; }));
    await shot(page, 'sheet', k);
    await key(page, 'Escape');
    r.pass = r.split === 'Split at the insert marker (Ctrl+E)' && r.add === 'Add a marker at the time selection start, the insert marker, or the playback position while playing (M)' && r.sheet[0].text.startsWith('Split at the insert marker or the selection') && r.sheet[1].text.startsWith('Add a marker at the insert marker') && r.sheet[2].text.startsWith('Add the selected sound at the insert marker') && r.sheet[0].h === 20 && r.sheet[1].h === 20 && r.sheet[2].h === 40 && r.sheet.every((s) => s.over === 0);
    return r;
  },
  async handleRange(page, k) {
    const r = {};
    await clipDrag(page, 5, 7); r.sel = await st(page);
    await page.getByTestId('arrangement-playhead-handle').focus(); await sleep(200);
    await key(page, 'ArrowRight', 500); r.after = await st(page);
    r.pass = r.sel.range && !r.after.range && Math.abs(+r.after.m - (+r.sel.m + 0.1)) < 0.0015;
    return r;
  },
  // neighbours
  async nDrop(page, k) {
    const r = {};
    await lane(page, 'sfx', 3);
    const g = await geo(page);
    const src = await page.locator('[data-source-id="demo-soft-impact"]').first().boundingBox();
    await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await page.mouse.down();
    await page.mouse.move(src.x + 60, src.y + 10, { steps: 5 });
    await page.mouse.move(g.rx + 9 * g.pps, g.sfx.y + g.sfx.h / 2, { steps: 15 }); await sleep(200);
    await page.mouse.up(); await sleep(900);
    r.after = await st(page); r.added = newClips({ clips: ['music@0.000'] }, r.after);
    r.pass = 'info';
    return r;
  },
  async nDblAdd(page, k) {
    const r = {};
    await lane(page, 'sfx', 4); await playStop(page); r.stop = await st(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().dblclick(); await sleep(900);
    r.after = await st(page); r.added = newClips(r.stop, r.after);
    r.pass = r.added.length === 1 && r.added[0] === 'sfx@4.000';
    return r;
  },
  async nRangeSplit(page, k) {
    const r = {};
    await clipDrag(page, 5, 7); r.sel = await st(page);
    await key(page, 'Control+e', 600); r.after = await st(page);
    r.undoTitle = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('title') || '').startsWith('Undo'))?.getAttribute('title'));
    r.pass = r.after.status === 'Clip split at both edges of the time selection; the middle part is selected.' && r.after.clips.filter((c) => c.startsWith('music')).length === 3;
    return r;
  },
  async nMExisting(page, k) {
    const r = {};
    await ruler(page, 2); await key(page, 'm', 400); await key(page, 'Enter', 600); await blur(page);
    await ruler(page, 6); await ruler(page, 2.0, 900); r.before = await st(page);
    await key(page, 'm', 500); r.after = await st(page);
    r.pass = r.after.flags.length === 1 && /arrangement-marker\|Marker/.test(r.after.active);
    return r;
  },
  async nCtrlArrow(page, k) {
    const r = {};
    await ruler(page, 3); await key(page, 'm', 400); await key(page, 'Enter', 600); await blur(page);
    await ruler(page, 1); await playStop(page); r.stop = await st(page);
    await key(page, 'Control+ArrowRight', 500); r.next = await st(page);
    r.pass = 'info';
    return r;
  },
};

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
