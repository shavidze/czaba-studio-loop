// C324 copy of c-round-323/c323-rows.mjs (output dir changed). // C323 copy of c-round-322/c322-rows.mjs (output dir changed). // C322 selection rows: identical action sequence per server; run on HEAD (:5197) and A (:5173), then diff.
// usage: node c322-rows.mjs <BASE> <tag> [1440x900,1280x720]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.argv[2];
const TAG = process.argv[3];
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-324';
const SHOT = `${DIR}/shots`;
mkdirSync(SHOT, { recursive: true });
const VPS = (process.argv[4] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const OUT = `${DIR}/rows-${TAG}${process.env.ROWS_SUFFIX ?? ''}.json`;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const res = { base: BASE, tag: TAG, startedUtc: new Date().toISOString() };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));

const read = (page) => page.evaluate(() => {
  const v = (id) => document.querySelector(`[data-testid="${id}"]`);
  const txt = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const tr = v('arrangement-transport');
  const gain = v('arrangement-detail-clip-gain-fader');
  return {
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => {
      const cs = getComputedStyle(c);
      return `${c.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '-'}@${c.getAttribute('data-clip-start')}|sel=${cs.boxShadow !== 'none'}|z=${cs.zIndex}`;
    }),
    status: txt(v('arrangement-status')),
    count: v('arrangement-selection-count') ? txt(v('arrangement-selection-count')) : null,
    selectedClip: v('arrangement-selected-clip') ? txt(v('arrangement-selected-clip')) : null,
    detail: txt(v('arrangement-detail-panel')).slice(0, 300),
    gain: gain ? { dis: gain.getAttribute('aria-disabled') ?? String(gain.disabled ?? ''), val: gain.getAttribute('aria-valuetext') ?? gain.value ?? null } : null,
    range: v('arrangement-range') ? txt(v('arrangement-range')) : null,
    transport: tr ? [...tr.querySelectorAll('button')].map((b) => `${b.getAttribute('aria-label') ?? txt(b)}|${b.getAttribute('title') ?? ''}|dis=${b.getAttribute('aria-disabled') ?? b.disabled}`) : null,
    groups: [...document.querySelectorAll('[data-testid="arrangement-group-header"]')].map((g) => `${txt(g.querySelector('[data-testid="arrangement-group-name"]'))}|exp=${g.querySelector('[data-testid="arrangement-group-fold"]')?.getAttribute('aria-expanded')}`),
  };
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
  for (let i = 0; i < n; i += 7) { const o = out.dataOffset + i * bps; const x = bps === 2 ? buf.readInt16LE(o) / 32768 : bps === 3 ? buf.readIntLE(o, 3) / 8388608 : buf.readFloatLE(o); if (x !== 0) nz++; peak = Math.max(peak, Math.abs(x)); }
  out.peak = Number(peak.toFixed(4)); out.nonzeroSampled = nz; delete out.dataOffset;
  return out;
}

for (const [w, h] of VPS) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await ctx.newPage(); const errors = []; r.errors = errors;
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`); });
  const step = async (name, fn) => { try { r[name] = await fn(); } catch (e) { r[name] = { error: String(e).slice(0, 200) }; } save(); };
  const key = async (k, ms = 450) => { await page.keyboard.press(k); await page.waitForTimeout(ms); return read(page); };
  const nameBar = (i) => page.locator('[data-clip-id]').nth(i).getByTitle(/ — drag to move$/).first();
  const clickBar = async (i, mods = []) => { const b = await nameBar(i).boundingBox({ timeout: 5000 }); for (const m of mods) await page.keyboard.down(m); await page.mouse.click(b.x + Math.min(30, b.width / 2), b.y + b.height / 2); for (const m of mods) await page.keyboard.up(m); await page.waitForTimeout(400); return read(page); };
  const setup = async () => {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
    await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 });
    await page.waitForTimeout(800);
    await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
    await clickBar(0); await key('Control+KeyD', 700); await key('Control+KeyD', 700);
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(150); }
    await page.waitForTimeout(500); await key('Escape', 250); await key('Escape', 250);
  };
  await setup();
  const own = 'music';
  r.setup = await read(page); await page.screenshot({ path: `${SHOT}/${TAG}-setup-${vp}.png` });
  // S-TRANSPORT + S-CLICK + S-DETAIL
  await step('noSel', async () => { await key('Escape', 300); return key('Escape', 300); });
  await step('click0', () => clickBar(0));
  await step('ctrlClick1', () => clickBar(1, ['Control']));
  await step('shiftClick2', () => clickBar(2, ['Shift']));
  await page.screenshot({ path: `${SHOT}/${TAG}-multi-${vp}.png` });
  await step('ctrlClick1off', () => clickBar(1, ['Control']));
  await step('reclick0', async () => { await clickBar(0); return clickBar(0); });
  await step('ctrlA', () => key('Control+KeyA'));
  await step('esc', () => key('Escape'));
  await step('marquee', async () => {
    const a = await page.locator('[data-clip-id]').nth(0).boundingBox(); const b = await page.locator('[data-clip-id]').nth(2).boundingBox();
    const ob2 = await page.locator(`[data-track-id="${own}"]`).first().boundingBox();
    const x0 = Math.min(a.x, b.x) + 20; const y0 = ob2.y + ob2.height * 0.75; const x1 = Math.max(a.x, b.x) + 60; const y1 = Math.max(a.y, b.y) + b.height * 0.75;
    await page.keyboard.down('Control'); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 8 }); await page.mouse.up(); await page.keyboard.up('Control');
    await page.waitForTimeout(400); return read(page);
  });
  await step('esc2', () => key('Escape'));
  // S-RANGE: body-drag on selected clip, then click another clip
  await step('rangeDrag', async () => {
    await clickBar(0); const c = await page.locator('[data-clip-id]').nth(0).boundingBox(); const yy = c.y + c.height * 0.7;
    await page.mouse.move(c.x + 40, yy); await page.mouse.down(); await page.mouse.move(c.x + 160, yy, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(400); return read(page);
  });
  await step('transportRange', () => read(page));
  await step('rangeThenClick1', () => clickBar(1));
  if (process.env.CLICK_ONLY) { await ctx.close(); continue; }
  // S-EDIT on 1 clip and on 2 clips
  for (const [nm, k] of [['DUP', 'Control+KeyD'], ['COPYPASTE', null], ['CUT', 'Control+KeyX'], ['SPLIT', 'Control+KeyE'], ['DELETE', 'Delete']]) {
    for (const n of [1, 2]) {
      await step(`${nm}${n}`, async () => {
        await setup();
        await clickBar(0); if (n === 2) await clickBar(1, ['Control']);
        const before = await read(page);
        let doIt;
        if (k) doIt = await key(k, 700); else { await key('Control+KeyC', 400); doIt = await key('Control+KeyV', 700); }
        const undo = await key('Control+KeyZ', 600); const redo = await key('Control+Shift+KeyZ', 600); const undo2 = await key('Control+KeyZ', 600);
        return { before, doIt, undo, redo, undo2 };
      });
    }
  }
  // S-GROUP: collapse a group containing a selected clip, then select another clip
  await step('group', async () => {
    const fold = page.locator('[data-testid="arrangement-group-fold"]');
    if (!(await fold.count())) return { noGroup: true };
    await key('Escape', 250);
    const gid = await page.locator('[data-testid="arrangement-group-row"]').first().evaluate((g) => g.closest('[data-track-group-id], [data-group-id]')?.outerHTML.slice(0, 120) ?? null);
    // select a clip in the first lane of the group if any, else clip 0
    await clickBar(0);
    await fold.first().click(); await page.waitForTimeout(500);
    const row = page.locator('[data-testid="arrangement-group-row"]').first();
    await row.screenshot({ path: `${SHOT}/${TAG}-group-a-${vp}.png` });
    const s1 = await read(page);
    const visible = await page.locator('[data-clip-id]').count();
    if (visible > 0) { const bar = page.locator('[data-clip-id]').last().getByTitle(/ — drag to move$/); const b = await bar.boundingBox().catch(() => null); if (b) { await page.mouse.click(b.x + 10, b.y + b.height / 2); await page.waitForTimeout(400); } }
    await row.screenshot({ path: `${SHOT}/${TAG}-group-b-${vp}.png` });
    const s2 = await read(page);
    await fold.first().click(); await page.waitForTimeout(400);
    return { gid, s1, s2, visible };
  });
  // Export WAV (project) for data integrity
  await step('export', async () => {
    await key('Escape', 250); await key('Escape', 250);
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(700);
    await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
    const sel = page.locator('input[name="arrangement-export-scope"][data-testid$="project"]');
    if (await sel.count()) await sel.click().catch(() => {});
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const d = await dl; const p = `/tmp/c322/${TAG}-project-${vp}.wav`; await d.saveAs(p);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    return { file: d.suggestedFilename(), path: p, info: parseWav(readFileSync(p)) };
  });
  await page.screenshot({ path: `${SHOT}/${TAG}-final-${vp}.png` });
  await ctx.close();
}
res.endedUtc = new Date().toISOString(); save();
await browser.close();
