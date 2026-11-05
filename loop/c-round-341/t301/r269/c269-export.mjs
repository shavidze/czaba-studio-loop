// C round 269: export + play-through rows (TAPER/CURVE/SILENCE/NO-CLICK/UNITY/MULTIPLY/PLAY-THROUGH).
// usage: node c269-export.mjs <base> <W> <H> <outDir>
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, W, H, OUT] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const KEY = `${W}x${H}`;
const R = { key: KEY, base: BASE, started: new Date().toISOString(), pageErrors: [], consoleErrors: [] };
const save = () => writeFileSync(path.join(OUT, `export-${KEY}.json`), JSON.stringify(R, null, 1));

function parseWav(buf) {
  let p = 12; let fmt = null; let data = null;
  while (p + 8 <= buf.length) {
    const id = buf.toString('latin1', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(p + 8), ch: buf.readUInt16LE(p + 10), sr: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id === 'data') { data = { off: p + 8, size: Math.min(size, buf.length - p - 8) }; break; }
    p += 8 + size + (size & 1);
  }
  const bps = fmt.bits / 8; const frames = Math.floor(data.size / (bps * fmt.ch));
  const chans = Array.from({ length: fmt.ch }, () => new Float64Array(frames));
  for (let i = 0; i < frames; i++) for (let c = 0; c < fmt.ch; c++) {
    const o = data.off + (i * fmt.ch + c) * bps; let v;
    if (fmt.format === 3) v = bps === 4 ? buf.readFloatLE(o) : buf.readDoubleLE(o);
    else if (bps === 2) v = buf.readInt16LE(o) / 32768;
    else if (bps === 3) { let x = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (x & 0x800000) x -= 0x1000000; v = x / 8388608; }
    else v = buf.readInt32LE(o) / 2147483648;
    chans[c][i] = v;
  }
  return { fmt, frames, seconds: frames / fmt.sr, chans };
}

async function waitReady(page) {
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(1000);
}
async function clipInfo(page) {
  return page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return { env: c?.getAttribute('data-envelope'), start: c?.getAttribute('data-clip-start'), fadeIn: c?.getAttribute('data-fade-in'), lane: c?.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null, clipCount: document.querySelectorAll('[data-clip-id]').length, w: c?.getBoundingClientRect().width }; });
}
async function exportWav(page, name) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog');
  await dlg.waitFor();
  await page.getByTestId('arrangement-export-format-wav').click();
  await page.waitForTimeout(200);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), dlg.getByRole('button', { name: 'Export WAV', exact: true }).click()]);
  const file = path.join(OUT, `${KEY}-${name}.wav`);
  await dl.saveAs(file);
  await page.waitForTimeout(500);
  if (await dlg.isVisible()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
  if (await dlg.isVisible()) { const close = dlg.getByRole('button', { name: /Close|Done/ }); if (await close.count()) await close.first().click(); }
  await page.waitForTimeout(300);
  return file;
}
async function dragPoint(page, idx, dy, dx = 0) {
  const pt = page.getByTestId('arrangement-clip-envelope-point').nth(idx);
  const b = await pt.boundingBox();
  const x = b.x + b.width / 2; const y = b.y + b.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + (dy > 0 ? Math.min(10, dy) : dy / 2), { steps: 2 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(300);
}

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
page.on('console', (m) => { if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 200)); });
await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 }).catch(() => {});
await waitReady(page);
R.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
await page.getByRole('option').first().focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(900);
await page.evaluate(() => document.activeElement?.blur());
R.clipA = await clipInfo(page);
R.fileA = await exportWav(page, 'A');
save();
await page.getByTestId('arrangement-envelope-toggle').click();
await page.waitForTimeout(300);
const ed = await page.getByTestId('arrangement-clip-envelope-editor').first().boundingBox();
R.editor = ed;
await page.mouse.dblclick(ed.x + 20, ed.y + 5); await page.waitForTimeout(300);
await page.mouse.dblclick(ed.x + 220, ed.y + 5); await page.waitForTimeout(300);
await dragPoint(page, 1, 400);
await page.mouse.dblclick(ed.x + 420, ed.y + 5); await page.waitForTimeout(300);
R.clipB = await clipInfo(page);
await page.screenshot({ path: path.join(OUT, `${KEY}-points.png`) });
R.fileB = await exportWav(page, 'B');
save();
// PLAY-THROUGH
await page.evaluate(() => document.activeElement?.blur());
await page.keyboard.press('Home'); await page.waitForTimeout(300);
const meterIdx = await page.evaluate(() => { const ms = [...document.querySelectorAll('[data-testid="arrangement-track-meter"]')]; const lane = document.querySelector('[data-clip-id]')?.closest('[data-track-id]'); return ms.findIndex((m) => lane && lane.contains(m)); });
R.meterIdx = meterIdx;
await page.keyboard.press('Space');
const t0 = Date.now(); const samples = [];
while (Date.now() - t0 < 12500) {
  samples.push(await page.evaluate(() => ({ pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent?.trim() ?? null, meters: [...document.querySelectorAll('[data-testid="arrangement-track-meter"]')].map((m) => m.getAttribute('data-level-db')) })));
  await page.waitForTimeout(250);
}
await page.keyboard.press('Space');
R.playSamples = samples;
save();
// MULTIPLY: fade-in ~1 s + clip gain -6 dB on the same enveloped clip
await page.getByTestId('arrangement-envelope-toggle').click(); await page.waitForTimeout(300);
const clip = page.locator('[data-clip-id]').first();
const cb = await clip.boundingBox();
await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height - 6); await page.waitForTimeout(300);
const hIn = page.getByTestId('arrangement-clip-fade-in-handle').first();
R.fadeHandleCount = await hIn.count();
if (R.fadeHandleCount) {
  const hb = await hIn.boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + 5); await page.waitForTimeout(150);
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2 + 10, hb.y + hb.height / 2, { steps: 3 });
  await page.mouse.move(hb.x + hb.width / 2 + 40, hb.y + hb.height / 2, { steps: 6 });
  await page.mouse.up(); await page.waitForTimeout(300);
}
const gi = page.getByTestId('arrangement-detail-clip-gain-input');
R.gainInputCount = await gi.count();
R.gainVisible = R.gainInputCount ? await gi.isVisible() : false;
if (!R.gainVisible && R.gainInputCount) { await page.screenshot({ path: path.join(OUT, `${KEY}-gain-hidden.png`) }); R.gainBox = await gi.evaluate((el) => { const b = el.getBoundingClientRect(); const chain = []; let e = el; while (e) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.overflow !== 'visible') chain.push({ tag: e.tagName, tid: e.getAttribute('data-testid'), cls: (e.className || '').toString().slice(0, 120), display: cs.display, vis: cs.visibility, ov: cs.overflow }); e = e.parentElement; } return { x: b.x, y: b.y, w: b.width, h: b.height, chain }; }); }
if (R.gainVisible) { await gi.click(); await gi.fill('-6'); await gi.press('Enter'); await page.waitForTimeout(300); R.gainValue = await gi.inputValue(); }
R.clipM = await clipInfo(page);
R.fileM = await exportWav(page, 'M');
await page.screenshot({ path: path.join(OUT, `${KEY}-multiply.png`) });
save();
await ctx.close();
await browser.close();
R.finished = new Date().toISOString();
save();
console.log('done', KEY);
