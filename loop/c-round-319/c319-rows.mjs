// C319 R-rows (from c318-rows.mjs + R-WAVEFORM, overlay box, detail playhead): identical action sequence against one server; run once per build (baseline / A) and diff.
// usage: node c318-rows.mjs <BASE> <tag> [vp list e.g. 1440x900,1280x720]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.argv[2];
const TAG = process.argv[3];
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-319';
const SHOT = `${DIR}/shots`;
mkdirSync(SHOT, { recursive: true });
const VPS = (process.argv[4] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const OUT = `${DIR}/rows-${TAG}${process.argv[4] ? '-' + process.argv[4] : ''}${process.env.RELOAD_BEFORE_SPLIT ? '-reload' : ''}.json`;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const res = { base: BASE, tag: TAG, startedUtc: new Date().toISOString() };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));

const read = (page) => page.evaluate(() => {
  const s = document.querySelector('[data-testid="arrangement-status"]');
  const clipEls = [...document.querySelectorAll('[data-clip-id]')];
  const tr = document.querySelector('[data-testid="arrangement-transport"]');
  const v = (id) => document.querySelector(`[data-testid="${id}"]`);
  const brace = v('arrangement-loop-brace');
  return {
    clips: clipEls.map((c) => ({ start: c.getAttribute('data-clip-start'), w: Math.round(c.getBoundingClientRect().width), sel: c.getAttribute('aria-selected') ?? c.getAttribute('data-selected'), text: (c.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 140) })),
    overlays: [...document.querySelectorAll('[data-range-start]')].map((o) => `${o.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '-'}:${o.getAttribute('data-range-start')}-${o.getAttribute('data-range-end')}:${o.getAttribute('data-testid')}`),
    rangeReadout: v('arrangement-range') ? (v('arrangement-range').textContent ?? '').trim() : null,
    status: (s?.textContent ?? '').trim(),
    transport: tr ? [...tr.querySelectorAll('button')].map((b) => `${b.getAttribute('aria-label') ?? b.textContent?.trim()}|${b.getAttribute('title') ?? ''}|dis=${b.getAttribute('aria-disabled') ?? b.disabled}|${b.className.includes('border-foreground') ? 'BF' : ''}`) : null,
    detail: { start: v('arrangement-detail-start')?.value ?? null, end: v('arrangement-detail-end')?.value ?? null, range: v('arrangement-detail-range') ? (v('arrangement-detail-range').getAttribute('style') ?? '') : null },
    insert: v('arrangement-insert-marker')?.getAttribute('data-insert-marker') ?? null,
    insertHidden: v('arrangement-insert-marker') ? getComputedStyle(v('arrangement-insert-marker')).display === 'none' || v('arrangement-insert-marker').hidden : null,
    loop: brace ? { en: brace.getAttribute('data-loop-enabled'), l: Math.round(brace.getBoundingClientRect().left), w: Math.round(brace.getBoundingClientRect().width) } : null,
    loopTimes: v('arrangement-loop-times') ? v('arrangement-loop-times').textContent.trim() : null,
    grid: document.querySelector('[data-grid-seconds]:not([data-testid])')?.getAttribute('data-grid-seconds') ?? null,
    undoTitle: [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('aria-label') ?? ''))?.getAttribute('title') ?? null,
  };
});
const wf = (page) => page.evaluate(() => {
  const h = (str) => { let x = 0; for (let i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) | 0; return `${str.length}:${x}`; };
  const paths = (sel) => [...document.querySelectorAll(sel)].map((e) => { const p = e.tagName === 'path' ? e : e.querySelector('path'); return p ? h(p.getAttribute('d') ?? '') : 'nopath'; });
  const ov = [...document.querySelectorAll('[data-clip-id] .border-x-2.bg-foreground\\/30')].map((o) => { const b = o.getBoundingClientRect(); const c = o.closest('[data-clip-id]').getBoundingClientRect(); return `${Math.round((b.left - c.left) * 10) / 10}/${Math.round(b.width * 10) / 10}|${o.textContent.trim()}`; });
  const ph = document.querySelector('[data-testid="arrangement-detail-playhead"]');
  return { clipWave: paths('[data-testid="arrangement-clip-waveform"]'), detailWave: paths('[data-testid="arrangement-detail-waveform"]'), clipOverlay: ov, detailPlayhead: ph ? `${ph.style.display}|${ph.style.transform}` : null };
});
const playhead = (page) => page.evaluate(() => {
  const p = document.querySelector('[data-testid="arrangement-playhead"]');
  const clock = [...document.querySelectorAll('[data-testid*="clock"], [data-testid*="time-display"]')].map((e) => e.textContent.trim()).join('|');
  const playBtn = [...document.querySelectorAll('[data-testid="arrangement-transport"] button')].find((b) => /^(Play|Pause|Stop playback)/.test(b.getAttribute('aria-label') ?? ''));
  return { left: p ? Math.round(p.getBoundingClientRect().left) : null, clock, play: playBtn?.getAttribute('aria-label') ?? null };
});

function parseWav(buf) {
  const out = {}; let p = 12;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') { out.format = buf.readUInt16LE(p + 8); out.channels = buf.readUInt16LE(p + 10); out.rate = buf.readUInt32LE(p + 12); out.bits = buf.readUInt16LE(p + 22); }
    if (id === 'data') { out.dataOffset = p + 8; out.dataSize = Math.min(size, buf.length - p - 8); break; }
    p += 8 + size + (size % 2);
  }
  out.frames = out.dataSize / (out.channels * out.bits / 8); out.duration = out.frames / out.rate;
  let peak = 0, nz = 0; const bps = out.bits / 8; const n = out.dataSize / bps;
  for (let i = 0; i < n; i += 7) { const o = out.dataOffset + i * bps; const x = out.format === 3 ? buf.readFloatLE(o) : bps === 2 ? buf.readInt16LE(o) / 32768 : bps === 3 ? buf.readIntLE(o, 3) / 8388608 : buf.readInt32LE(o) / 2147483648; if (x !== 0) nz++; peak = Math.max(peak, Math.abs(x)); }
  out.peak = Number(peak.toFixed(4)); out.nonzeroSampled = nz;
  return out;
}

for (const [w, h] of VPS) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await ctx.newPage(); const errors = []; r.errors = errors;
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`); });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 });
  await page.waitForTimeout(1000);
  const lanes = page.locator('[data-grid-seconds]:not([data-testid])');
  const lb = await lanes.first().boundingBox(); const y = lb.y + lb.height * 0.7;
  r.initial = await read(page);
  await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  let clip = await page.locator('[data-clip-id]').first().boundingBox();
  const key = async (k, ms = 400) => { await page.keyboard.press(k); await page.waitForTimeout(ms); return { ...(await read(page)), wf: await wf(page) }; };
  const drag = async (x0, x1, yy = y, mods = []) => {
    for (const m of mods) await page.keyboard.down(m);
    await page.mouse.move(x0, yy); await page.mouse.down();
    await page.mouse.move((x0 + x1) / 2, yy, { steps: 6 }); const mid = { ...(await read(page)), wf: await wf(page) };
    await page.mouse.move(x1, yy, { steps: 6 }); await page.mouse.up();
    for (const m of mods) await page.keyboard.up(m);
    await page.waitForTimeout(400); return { mid, after: { ...(await read(page)), wf: await wf(page) } };
  };
  const mk = () => drag(clip.x + 100, clip.x + 333);
  const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(250); await page.keyboard.press('Escape'); await page.waitForTimeout(250); };
  r.afterAdd = await read(page);
  // R-WAVEFORM (fresh context = empty cache; late peaks load)
  { const t0 = Date.now(); let w0 = await wf(page); while ((!w0.clipWave.length || w0.clipWave.every((d) => d.startsWith('0:') || d === 'nopath')) && Date.now() - t0 < 15000) { await page.waitForTimeout(250); w0 = await wf(page); }
    r.WAVE_afterAdd = { ...w0, waitedMs: Date.now() - t0 };
    r.WAVE_zoom = [];
    for (const k of ['KeyZ', 'KeyZ', 'KeyX', 'KeyX', 'KeyZ', 'KeyZ', 'KeyX', 'KeyX']) { await page.keyboard.press(k); await page.waitForTimeout(700); r.WAVE_zoom.push({ k, ...(await wf(page)), grid: (await read(page)).grid }); }
    await page.mouse.click(clip.x + 30, clip.y + 6).catch(() => {}); await page.waitForTimeout(400);
    const tg = page.locator('[data-testid="arrangement-detail-toggle"]');
    let opened = false; if (await tg.count() && (await tg.getAttribute('aria-expanded')) === 'false') { await tg.click(); opened = true; await page.waitForTimeout(600); }
    r.WAVE_detail = await wf(page); await page.screenshot({ path: `${SHOT}/${TAG}-wave-${vp}.png` });
    // R-DETAIL playhead during playback over the selected clip
    await page.keyboard.press('Space'); await page.waitForTimeout(300); const p1 = await wf(page); await page.waitForTimeout(700); const p2 = await wf(page); await page.keyboard.press('Space'); await page.waitForTimeout(400);
    r.DETAIL_playhead = { p1: p1.detailPlayhead, p2: p2.detailPlayhead, moved: p1.detailPlayhead !== p2.detailPlayhead };
    await page.keyboard.press('Home'); await page.waitForTimeout(300);
    if (opened) { await tg.click(); await page.waitForTimeout(600); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    r.WAVE_restored = await read(page);
    save(); }
  // R-DRAG + R-TRANSPORT + R-DETAIL
  r.DRAG = await mk(); await page.screenshot({ path: `${SHOT}/${TAG}-drag-${vp}.png` });
  r.DRAG_alt = await drag(clip.x + 107, clip.x + 341, y, ['Alt']);
  await key('KeyG'); r.DRAG_snapoff = await drag(clip.x + 107, clip.x + 341); await key('KeyG');
  // R-DETAIL: type From
  const from = page.locator('[data-testid="arrangement-detail-start"]');
  if (await from.count()) {
    if (!(await from.isVisible())) { const tg = page.locator('[data-testid="arrangement-detail-toggle"]'); r.DETAIL_toggleExpanded = await tg.getAttribute('aria-expanded'); await tg.click(); await page.waitForTimeout(500); }
    r.DETAIL_visible = await from.isVisible();
    r.DETAIL_before = await read(page);
    const s0 = Number(await from.inputValue()); await from.click(); await from.fill(String((s0 + 0.5).toFixed(3))); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    r.DETAIL_typed = await read(page);
    await page.locator('[data-testid="arrangement-detail-end"]').click().catch(() => {});
    await page.locator('[data-testid="arrangement-detail-end"]').fill(String((s0 + 2.75).toFixed(3))).catch(() => {}); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    r.DETAIL_typedEnd = await read(page);
    await page.mouse.click(lb.x + lb.width - 30, lb.y - 200 > 0 ? lb.y - 200 : 5).catch(() => {});
  } else r.DETAIL_before = 'no-detail-start-field';
  save();
  // R-ALLTRACKS
  await esc(); await mk();
  r.ALL_on = await key('Control+Shift+KeyL'); await page.screenshot({ path: `${SHOT}/${TAG}-alltracks-${vp}.png` });
  r.ALL_again = await key('Control+Shift+KeyL');
  await key('Control+Shift+KeyL'); r.ALL_esc = await key('Escape');
  save();
  // R-CLEAR
  await mk(); await page.mouse.click(clip.x + 200, y); await page.waitForTimeout(400); r.CLEAR_click = await read(page);
  await mk(); r.CLEAR_esc = await key('Escape');
  await mk(); const lane2 = await lanes.nth(2).boundingBox(); await page.mouse.click(lane2.x + 500, lane2.y + lane2.height * 0.6); await page.waitForTimeout(400); r.CLEAR_emptyLane = await read(page);
  save();
  // R-SPACE
  await esc(); await mk(); r.SPACE_pre = await playhead(page);
  await page.keyboard.press('Space'); await page.waitForTimeout(120); r.SPACE_play = { ...(await playhead(page)), s: await read(page) };
  await page.waitForTimeout(600); r.SPACE_play2 = await playhead(page);
  await page.keyboard.press('Space'); await page.waitForTimeout(400); r.SPACE_stop = { ...(await playhead(page)), s: await read(page) };
  await page.keyboard.press('Space'); await page.waitForTimeout(120); r.SPACE_again = await playhead(page);
  await page.keyboard.press('Space'); await page.waitForTimeout(400);
  await page.keyboard.press('Home'); await page.waitForTimeout(300);
  save();
  // R-SPLIT / R-DELETE / R-CUT-TIME
  if (process.env.RELOAD_BEFORE_SPLIT) {
    await page.reload({ waitUntil: 'networkidle' }); await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 }); await page.waitForTimeout(1000);
    await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300);
    await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    clip = await page.locator('[data-clip-id]').first().boundingBox(); r.reloadedBeforeSplit = await read(page);
  }
  for (const [name, k] of [['SPLIT', 'Control+KeyE'], ['DELETE', 'Delete'], ['CUTTIME', 'Control+Shift+KeyX']]) {
    await esc(); await mk(); r[`${name}_range`] = await read(page);
    r[`${name}_do`] = await key(k, 600);
    r[`${name}_undo`] = await key('Control+KeyZ', 600);
    r[`${name}_redo`] = await key('Control+Shift+KeyZ', 600);
    r[`${name}_undo2`] = await key('Control+KeyZ', 600);
    save();
  }
  // R-LOOP / R-ZOOM
  await esc(); await mk(); r.LOOP = await key('Control+KeyL', 500); await page.screenshot({ path: `${SHOT}/${TAG}-loop-${vp}.png` });
  r.LOOP_off = await key('Control+KeyL', 500);
  await esc(); await mk(); r.ZOOM_pre = await read(page); r.ZOOM = await key('KeyZ', 700); r.ZOOM_back = await key('KeyX', 700);
  save();
  // R-EXPORT
  await esc(); await mk();
  const exp = async (scope, name) => {
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(700);
    const dlg = await page.evaluate(() => [...document.querySelectorAll('input[name="arrangement-export-scope"]')].map((i) => `${i.getAttribute('data-testid')}|checked=${i.checked}|dis=${i.disabled}|${(i.closest('label')?.textContent ?? '').replace(/\s+/g, ' ').trim()}`));
    if (!scope) { await page.keyboard.press('Escape'); await page.waitForTimeout(400); return { dlg }; }
    await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
    const sel = page.locator(`input[name="arrangement-export-scope"][data-testid$="${scope}"]`);
    if (await sel.count()) await sel.click().catch(() => {});
    const btn = page.getByRole('button', { name: 'Export WAV', exact: true });
    if (await btn.isDisabled()) { const snap = await read(page); const extra = await page.evaluate(() => (document.querySelector('[role="dialog"]')?.textContent ?? '').replace(/\s+/g, ' ').slice(0, 600)); await page.keyboard.press('Escape'); await page.waitForTimeout(400); return { dlg, disabled: true, clips: snap.clips.length, dialogText: extra }; }
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const d = await dl; const p = `/tmp/c319-${TAG}-${name}-${vp}.wav`; await d.saveAs(p);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    const info = parseWav(readFileSync(p)); return { dlg, file: d.suggestedFilename(), info };
  };
  r.EXPORT_range = await exp('range', 'range');
  r.EXPORT_project = await exp('project', 'project');
  await esc(); await page.mouse.click(clip.x + 200, y); await page.waitForTimeout(300); await esc();
  r.EXPORT_norange = await exp(null, 'none');
  save();
  // R-BG / R-MARQUEE
  await esc();
  const l1 = await lanes.nth(1).boundingBox(); const y1 = l1.y + l1.height * 0.6;
  r.BG = await drag(l1.x + 300, l1.x + 520, y1);
  await esc();
  r.MARQUEE = await drag(clip.x + clip.width + 60, clip.x + 150, y, ['Control']);
  await page.screenshot({ path: `${SHOT}/${TAG}-marquee-${vp}.png` });
  r.final = await read(page);
  save();
  await ctx.close();
}
res.endedUtc = new Date().toISOString(); save();
await browser.close();
