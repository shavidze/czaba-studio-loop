import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2], tag = process.argv[3];
const out = {};
const browser = await chromium.launch();
const ST = '[data-testid="arrangement-status"]';
const ready = async (page) => {
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
};
const st = (page) => page.locator(ST).innerText().then((s) => s.trim()).catch(() => null);
const undoTitle = (page) => page.locator('button[title^="Undo"]').first().getAttribute('title');
const addBass = async (page) => {
  await page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first().getByText(/^Stems/).first().click();
  await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click();
  await page.waitForTimeout(250); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
};
const observe = (page) => page.evaluate((sel) => { const el = document.querySelector(sel); window.__mut = 0; window.__log = []; const mo = new MutationObserver((l) => { for (const m of l) if (m.type === 'childList') { window.__mut++; window.__log.push(performance.now()); } }); mo.observe(el, { childList: true, subtree: true }); window.__mo = mo; window.__reset = () => { window.__mut = 0; window.__log = []; }; }, ST);
const muts = (page) => page.evaluate(() => window.__mut);
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`; const R = out[key] = {};
  const fresh = async () => { const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' }); await ready(page); return { ctx, page }; };
  // (a) ruler strip playFrom, empty and with Bass
  for (const withBass of [true]) {
    const { ctx, page } = await fresh(); if (withBass) await addBass(page);
    const strip = page.getByTestId('arrangement-bars-scrub-strip'); const bb = await strip.boundingBox();
    const a = {}; a.stripBox = bb; a.before = await st(page);
    await page.mouse.click(bb.x + 300, bb.y + bb.height / 2); await page.waitForTimeout(700);
    a.afterClick = await st(page); a.pos = await page.getByTestId('arrangement-position').textContent().catch(() => null);
    a.playing = await page.getByRole('button', { name: /^Play/ }).first().getAttribute('data-playing').catch(() => null);
    await page.getByRole('button', { name: /^Stop/ }).first().click(); await page.waitForTimeout(500);
    a.afterStop = await st(page);
    R[withBass ? 'a_withBass' : 'a_empty'] = a;
    if (withBass) await page.screenshot({ path: `screens/status-${tag}-a-${key}.png` });
    await ctx.close();
  }
  // (b)+(e) fade drag
  { const { ctx, page } = await fresh(); await addBass(page); await observe(page);
    const b = {}; b.afterAdd = await st(page); b.undoBefore = await undoTitle(page);
    const hnd = page.getByTestId('arrangement-clip-fade-in-handle').first(); b.handleVisible = await hnd.isVisible();
    const hb = await hnd.boundingBox(); const sx = hb.x + hb.width / 2, sy = hb.y + hb.height / 2;
    await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + 20, sy, { steps: 4 }); await page.mouse.move(sx + 40, sy, { steps: 4 }); await page.waitForTimeout(200);
    b.during = await st(page); b.undoDuring = await undoTitle(page);
    await page.evaluate(() => window.__reset()); await page.mouse.up(); await page.waitForTimeout(500);
    b.afterRelease = await st(page); b.undoAfter = await undoTitle(page); b.mutationsPointerupTo500 = await muts(page);
    R.b_fade = b; await page.screenshot({ path: `screens/status-${tag}-b-${key}.png` }); await ctx.close(); }
  // (c) name-bar drag + Ctrl+Z during
  { const { ctx, page } = await fresh(); await addBass(page);
    const c = {}; c.startUndo = await undoTitle(page);
    const bar = page.locator('[data-clip-id] > div').first(); const bb = await bar.boundingBox();
    const sx = bb.x + 40, sy = bb.y + bb.height / 2;
    await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + 30, sy, { steps: 4 }); await page.mouse.move(sx + 60, sy, { steps: 4 }); await page.waitForTimeout(200);
    c.duringDrag = await st(page);
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
    c.afterCtrlZ = await st(page); c.undoAfterCtrlZ = await undoTitle(page);
    await page.mouse.move(sx + 80, sy, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(500);
    c.afterRelease = await st(page); c.undoAfterRelease = await undoTitle(page);
    c.clips = await page.locator('[data-clip-id]').count();
    R.c_ctrlz = c; await ctx.close(); }
  // (d) hold ArrowLeft
  { const { ctx, page } = await fresh(); await addBass(page);
    const d = {}; 
    const bar = page.locator('[data-clip-id] > div').first(); const bb = await bar.boundingBox();
    await page.mouse.click(bb.x + 40, bb.y + bb.height / 2); await page.waitForTimeout(300);
    d.afterSelect = await st(page); await observe(page);
    await page.keyboard.down('ArrowLeft'); for (let i = 0; i < 9; i++) { await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(40); }
    d.duringHold = await st(page); await page.keyboard.up('ArrowLeft'); await page.waitForTimeout(500);
    d.afterHold = await st(page); d.mutations = await muts(page); d.undo = await undoTitle(page);
    R.d_arrowhold = d; await ctx.close(); }
}
await browser.close();
writeFileSync(`status-${tag}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
