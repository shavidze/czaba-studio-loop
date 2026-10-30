import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-266';
const SHOT = `${DIR}/shots`;
mkdirSync(SHOT, { recursive: true });
const ONLY = process.argv[2] ? process.argv[2].split(',') : null;
const VPS = process.argv[3] ? process.argv[3].split(',').map((s) => s.split('x').map(Number)) : [[1440, 900], [1280, 720]];
const OUT = process.argv[4] ?? `${DIR}/c266-browser.json`;
const want = (k) => !ONLY || ONLY.includes(k);
const browser = await chromium.launch();
const res = { startedUtc: new Date().toISOString() };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));

const read = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-testid="arrangement-status"]');
  const a = document.activeElement;
  const clipEls = [...document.querySelectorAll('[data-clip-id]')];
  return {
    clips: clipEls.map((c) => c.getAttribute('data-clip-start')),
    selected: clipEls.filter((c) => c.getAttribute('aria-selected') === 'true' || c.getAttribute('data-selected') === 'true').map((c) => c.getAttribute('data-clip-start')),
    overlays: [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((o) => ({ track: o.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null, start: o.getAttribute('data-range-start'), end: o.getAttribute('data-range-end') })),
    rangeStartEls: document.querySelectorAll('[data-range-start]').length,
    marquee: document.querySelectorAll('[data-testid="arrangement-marquee"]').length,
    hasRange: !!document.querySelector('[data-testid="arrangement-range"]'),
    range: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').trim().slice(0, 60),
    status: (s?.textContent ?? '').trim(),
    statusFits: s ? s.scrollWidth <= s.clientWidth : null,
    statusBox: s ? { w: Math.round(s.clientWidth), sw: s.scrollWidth, h: Math.round(s.getBoundingClientRect().height) } : null,
    active: !a || a === document.body ? 'BODY' : `${a.tagName}|${(a.getAttribute('aria-label') ?? a.textContent ?? '').trim().slice(0, 40)}`,
    undoTitle: [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('aria-label') ?? b.title ?? ''))?.getAttribute('title') ?? null,
  };
});

async function open(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  const s = { ctx, page, errors };
  s.setup = async () => {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 });
    await page.waitForTimeout(1000);
    const lb = await page.locator('[data-grid-seconds]:not([data-testid])').first().boundingBox();
    const y = lb.y + lb.height * 0.7;
    await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300);
    await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    const clip = await page.locator('[data-clip-id]').first().boundingBox();
    Object.assign(s, { lb, y, clip });
    return read(page);
  };
  return s;
}
async function drag(page, x0, y0, x1, y1 = y0) {
  await page.mouse.move(x0, y0); await page.mouse.down();
  await page.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 4 });
  const mid = await read(page);
  await page.mouse.move(x1, y1, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(300);
  return { mid, after: await read(page) };
}
const key = async (page, k) => { await page.keyboard.press(k); await page.waitForTimeout(350); return read(page); };
const shot = (page, n, vp) => page.screenshot({ path: `${SHOT}/${n}-${vp}.png` });

function parseWav(buf) {
  const out = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12) };
  let p = 12;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') { out.format = buf.readUInt16LE(p + 8); out.channels = buf.readUInt16LE(p + 10); out.rate = buf.readUInt32LE(p + 12); out.bits = buf.readUInt16LE(p + 22); }
    if (id === 'data') { out.dataOffset = p + 8; out.dataSize = Math.min(size, buf.length - p - 8); break; }
    p += 8 + size + (size % 2);
  }
  out.frames = out.dataSize / (out.channels * out.bits / 8);
  out.duration = out.frames / out.rate;
  return out;
}
function samples(buf, info) {
  const n = info.dataSize / (info.bits / 8); const arr = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const o = info.dataOffset + i * (info.bits / 8);
    arr[i] = info.format === 3 ? buf.readFloatLE(o) : info.bits === 16 ? buf.readInt16LE(o) / 32768 : info.bits === 24 ? buf.readIntLE(o, 3) / 8388608 : buf.readInt32LE(o) / 2147483648;
  }
  return arr;
}
async function exportWav(s, name) {
  const { page } = s;
  await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(600);
  await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
  const proj = page.locator('[data-testid="arrangement-export-scope-project"]');
  if (await proj.count()) await proj.click().catch(() => {});
  const dl = page.waitForEvent('download', { timeout: 120000 });
  await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
  const d = await dl; const path = `${DIR}/${name}.wav`; await d.saveAs(path);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  return path;
}

for (const [w, h] of VPS) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const s = await open(w, h); const { page } = s;
  const clear = async () => { await page.mouse.click(s.lb.x + 60, s.y); await page.waitForTimeout(300); };
  const gap = async () => { await drag(page, s.clip.x + 100, s.y, s.clip.x + 400); return key(page, 'Delete'); };
  save(); if (want('pastStart')) {
    r.setup = await s.setup();
    r.PAST_range = (await drag(page, s.clip.x + 100, s.y, s.clip.x - 150)).after;
    r.PAST_split = await key(page, 'Control+KeyE'); await shot(page, 'split-past-start', vp);
    r.PAST_delete = await key(page, 'Delete');
    r.PAST_undo1 = await key(page, 'Control+KeyZ');
    r.PAST_undo2 = await key(page, 'Control+KeyZ');
  }
  save(); if (want('bgInto')) {
    await s.setup();
    r.BGINTO_range = (await drag(page, s.lb.x + 40, s.y, s.clip.x + 200)).after;
    r.BGINTO_split = await key(page, 'Control+KeyE');
  }
  save(); if (want('gap2')) {
    await s.setup();
    r.GAP_made = await gap();
    await clear();
    r.GAP_range = (await drag(page, s.clip.x + 50, s.y, s.clip.x + 500)).after;
    r.GAP_split = await key(page, 'Control+KeyE'); await shot(page, 'split-gap-2', vp);
    r.GAP_delete = await key(page, 'Delete');
    r.GAP_undo1 = await key(page, 'Control+KeyZ');
    r.GAP_undo2 = await key(page, 'Control+KeyZ');
  }
  save(); if (want('noEdge')) {
    await s.setup();
    r.NOEDGE1_range = (await drag(page, s.lb.x + 40, s.y, s.lb.x + 300)).after;
    r.NOEDGE1_split = await key(page, 'Control+KeyE');
    await s.setup(); await gap(); await clear();
    r.NOEDGE2_range = (await drag(page, s.clip.x - 40, s.y, s.clip.x + 120)).after;
    r.NOEDGE2_split = await key(page, 'Control+KeyE'); await shot(page, 'split-no-edge-2', vp);
  }
  save(); if (want('marker')) {
    await s.setup();
    await page.mouse.click(s.clip.x + 200, s.y); await page.waitForTimeout(300);
    r.MARKER_before = await read(page);
    r.MARKER_split = await key(page, 'Control+KeyE');
  }
  save(); if (want('allTracks')) {
    await s.setup();
    await drag(page, s.lb.x + 40, s.y, s.lb.x + 300);
    r.ALL_lanes = await key(page, 'Control+Shift+KeyL');
    r.ALL_split = await key(page, 'Control+KeyE');
  }
  save(); if (want('focus')) {
    await s.setup();
    await drag(page, s.clip.x + 100, s.y, s.clip.x - 150);
    await page.getByRole('option').first().focus(); await page.waitForTimeout(150);
    r.FOCUS1_before = await read(page);
    r.FOCUS1_after = await key(page, 'Control+KeyE');
    await s.setup();
    await drag(page, s.clip.x + 100, s.y, s.clip.x - 150);
    const btn = page.getByRole('button', { name: /^Split/ });
    r.FOCUS2_btnCount = await btn.count();
    r.FOCUS2_before = await read(page);
    await btn.first().click(); await page.waitForTimeout(350);
    r.FOCUS2_after = await read(page);
  }
  save(); if (want('video')) {
    await s.setup();
    const vz = page.locator('[data-track-id="video"] [data-testid="arrangement-video-dropzone"]');
    r.VIDEO_count = await vz.count();
    const vb = await vz.first().boundingBox(); const vy = vb.y + vb.height * 0.5;
    await clear();
    const d = await drag(page, vb.x + 40, vy, vb.x + 300);
    r.VIDEO_mid = d.mid; r.VIDEO_after = d.after; await shot(page, 'video-bg', vp);
  }
  save(); if (want('copy')) {
    await s.setup(); await clear();
    r.COPY_beforeL = await read(page);
    r.COPY_loop = await key(page, 'Control+KeyL'); await shot(page, 'copy-loop-status', vp);
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(600);
    r.COPY_export = await page.evaluate(() => { const e = document.querySelector('[data-testid="arrangement-export-scope-range-reason"]'); if (!e) return null; const b = e.getBoundingClientRect(); return { text: e.textContent.trim(), w: Math.round(b.width), h: Math.round(b.height), lines: Math.round(b.height / parseFloat(getComputedStyle(e).lineHeight)), fits: e.scrollWidth <= e.clientWidth }; });
    await shot(page, 'copy-export-reason', vp);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }
  save(); if (want('carried') && w === 1440) {
    await s.setup();
    r.CAR_BGINTO = (await drag(page, s.lb.x + 40, s.y, s.clip.x + 200)).after;
    r.CAR_BGINTO_delete = await key(page, 'Delete');
    r.CAR_BGINTO_undo = await key(page, 'Control+KeyZ');
    await clear();
    r.CAR_INCLIP = (await drag(page, s.clip.x + 100, s.y, s.clip.x + 400)).after;
  }
  save(); if (want('audio') && w === 1440) {
    await s.setup();
    const p0 = await exportWav(s, 'wav-baseline');
    await drag(page, s.clip.x + 100, s.y, s.clip.x - 150);
    r.AUD_split = await key(page, 'Control+KeyE');
    const p1 = await exportWav(s, 'wav-after-past-start-split');
    await s.setup(); await gap(); await clear();
    await drag(page, s.clip.x + 50, s.y, s.clip.x + 500);
    r.AUD_gapSplit = await key(page, 'Control+KeyE');
    const p2 = await exportWav(s, 'wav-after-gap2-split');
    await s.setup();
    await page.mouse.click(s.clip.x + 200, s.y); await page.waitForTimeout(300);
    r.AUD_markerSplit = await key(page, 'Control+KeyE');
    const p3 = await exportWav(s, 'wav-after-marker-split');
    const b0 = readFileSync(p0), b1 = readFileSync(p1), b2 = readFileSync(p2), b3 = readFileSync(p3);
    const i0 = parseWav(b0), i1 = parseWav(b1), i2 = parseWav(b2), i3 = parseWav(b3);
    const s0 = samples(b0, i0), s1 = samples(b1, i1), s2 = samples(b2, i2), s3 = samples(b3, i3);
    const ch = i0.channels, rate = i0.rate;
    const cmp = (a, b, t0, t1) => { let max = 0, n = 0, peakA = 0; const f0 = Math.floor(t0 * rate) * ch, f1 = Math.min(Math.floor(t1 * rate) * ch, a.length, b.length); for (let k = f0; k < f1; k++) { max = Math.max(max, Math.abs(a[k] - b[k])); peakA = Math.max(peakA, Math.abs(a[k])); n++; } return { maxDiff: max, n, peakA }; };
    const peak = (a, t0, t1) => { let m = 0; for (let k = Math.floor(t0 * rate) * ch; k < Math.min(Math.floor(t1 * rate) * ch, a.length); k++) m = Math.max(m, Math.abs(a[k])); return m; };
    r.AUDIO = {
      info: { base: i0, pastStart: i1, gap2: i2, marker: i3 },
      marker_whole: cmp(s0, s3, 0, i0.duration),
      marker_aroundCut_14_9to15_1: cmp(s0, s3, 14.9, 15.1),
      pastStart_excl_cut_0to12_4: cmp(s0, s1, 0, 12.4),
      pastStart_excl_cut_12_6toEnd: cmp(s0, s1, 12.6, i0.duration),
      bytesEqual_base_vs_pastStart: b0.equals(b1),
      pastStart_whole: cmp(s0, s1, 0, i0.duration),
      pastStart_aroundCut_12_4to12_6: cmp(s0, s1, 12.4, 12.6),
      base_peak_10to12_5: peak(s0, 10, 12.5),
      base_peak_0to9_9: peak(s0, 0, 9.9),
      gap2_vs_base_10to12_5: cmp(s0, s2, 10, 12.5),
      gap2_vs_base_20to30: cmp(s0, s2, 20, 30),
      gap2_peak_12_6to19_9: peak(s2, 12.6, 19.9),
      gap2_aroundCut_11_15to11_35: cmp(s0, s2, 11.15, 11.35),
      gap2_aroundCut_22_4to22_6: cmp(s0, s2, 22.4, 22.6),
    };
  }
  save(); r.errors = s.errors;
  await s.ctx.close();
}
res.finishedUtc = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(res, null, 1));
await browser.close();
console.log('done', OUT);
