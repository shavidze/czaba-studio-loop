import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, outPath] = [process.argv[2], process.argv[3]];
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
const ae = (page) => page.evaluate(() => { const e = document.activeElement; return e ? `${e.tagName}|${e.getAttribute('role')||''}|${(e.getAttribute('aria-label')||e.getAttribute('data-testid')||e.textContent||'').slice(0,40)}` : null; });
const T = (page, id) => page.getByTestId(id).first().textContent().catch(() => null);
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const st = () => T(page, 'arrangement-status');
  const prev = page.getByTestId('arrangement-library-preview');
  const readAdd = async () => { const add = prev.getByRole('button', { name: 'Add' }).first(); const row = prev.locator('p[title^="Active track"]').first(); return { dis: await add.getAttribute('aria-disabled'), title: await add.getAttribute('title'), row: await row.getAttribute('title').catch(()=>null) }; };
  const step = async (k, fn) => { try { r[k] = await fn(); } catch (e) { r[k] = { error: String(e).slice(0, 200) }; } };
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 240000 });
    await page.waitForTimeout(800);
    r.auth_user = await page.evaluate(() => localStorage.getItem('auth_user'));
    // LIB-KEYS
    await step('keys', async () => {
      const o = {}; const list = page.getByRole('listbox', { name: 'Sounds' });
      await list.getByRole('option').first().click(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
      o.sel = await list.getByRole('option', { selected: true }).first().innerText().catch(()=>null).then(s=>s&&s.slice(0,40));
      o.ae1 = await ae(page); o.prevTitle = (await prev.innerText()).slice(0, 60);
      await page.keyboard.press('Enter'); await page.waitForTimeout(500);
      o.status = await st(); o.clips = await page.locator('[data-clip-id]').count(); o.undo = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
      await page.keyboard.press('Control+z'); await page.waitForTimeout(300); o.clipsAfterUndo = await page.locator('[data-clip-id]').count();
      const s = page.getByTestId('arrangement-library-search'); await s.focus(); await s.fill('bass'); await page.waitForTimeout(300);
      o.names = await list.getByRole('option').allInnerTexts().then(a=>a.map(x=>x.slice(0,30)));
      await page.keyboard.press('Escape'); o.escVal = await s.inputValue(); o.escAE = await ae(page);
      await s.fill('zzz'); await page.waitForTimeout(300); o.empty = await T(page, 'arrangement-library-empty');
      await page.getByTestId('arrangement-library-search-clear').click(); await page.waitForTimeout(200); o.clrVal = await s.inputValue(); o.clrAE = await ae(page);
      return o; });
    // LIB-MENU
    await step('menu', async () => {
      const o = {}; const opt = page.getByRole('option').first();
      await opt.click({ button: 'right' }); await page.waitForTimeout(300);
      const m = page.getByRole('menu'); o.menuCount = await m.count();
      if (o.menuCount) { o.menuName = await m.first().getAttribute('aria-label'); o.focusItem = await ae(page); await page.keyboard.press('Escape'); await page.waitForTimeout(200); o.aeAfter = await ae(page);
        await opt.focus(); await page.keyboard.press('Shift+F10'); await page.waitForTimeout(300); o.menu2 = await m.count(); o.focus2 = await ae(page); await page.keyboard.press('Escape'); await page.waitForTimeout(200); o.ae2 = await ae(page);
      } else o.note = 'no link/menu'; return o; });
    // LIB-PREVIEW
    await step('preview', async () => {
      const o = {}; await page.getByRole('option', { name: /Bass/ }).first().click(); await page.waitForTimeout(300);
      const tog = prev.getByRole('button', { name: /^(Preview|Stop)$/ }).first(); o.tog0 = await tog.innerText();
      await tog.click(); await page.waitForTimeout(1000); o.tog1 = await tog.innerText();
      const wave = prev.locator('[aria-valuetext]').first(); o.vt = await wave.getAttribute('aria-valuetext');
      await tog.click(); await page.waitForTimeout(300); o.tog2 = await tog.innerText();
      await wave.focus(); await page.keyboard.press('ArrowRight'); o.vtKey = await wave.getAttribute('aria-valuetext');
      const nb = (n) => page.getByRole('button', { name: new RegExp(`^${n} — set as the active track`) }).first();
      await nb('Video').click(); await page.waitForTimeout(300); o.video = await readAdd();
      await nb('Music').click(); await page.waitForTimeout(300); o.music = await readAdd();
      const add = prev.getByRole('button', { name: 'Add' }).first(); await add.focus(); const c0 = await page.locator('[data-clip-id]').count(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
      o.addStatus = await st(); o.addClips = [c0, await page.locator('[data-clip-id]').count()]; return o; });
    // LIB-LAYOUT
    await step('layout', async () => {
      const o = {}; const col = page.getByTestId('arrangement-library-collapse'); await col.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300); o.afterCollapse = await ae(page);
      await page.keyboard.press('Enter'); await page.waitForTimeout(300); o.afterExpand = await ae(page);
      const sep = page.getByTestId('arrangement-library-separator'); await sep.focus(); const v0 = await sep.getAttribute('aria-valuenow'); for (let i=0;i<3;i++) await page.keyboard.press('ArrowRight'); o.sep = [v0, await sep.getAttribute('aria-valuenow')];
      const dis = page.getByTestId('arrangement-library-notice-dismiss'); o.notice = await dis.count(); if (o.notice) { await dis.click(); await page.waitForTimeout(200); o.noticeGone = await page.getByTestId('arrangement-library-notice').count(); await page.reload({ waitUntil: 'networkidle' }); await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 }); o.noticeAfterReload = await page.getByTestId('arrangement-library-notice').count(); }
      const lane = page.locator('[data-track-id]').filter({ has: page.getByTestId('arrangement-track-header').filter({ hasText: 'Music' }) }).first().locator('[data-grid-seconds]').first();
      const b = await lane.boundingBox(); const c0 = await page.locator('[data-clip-id]').count();
      await page.getByRole('option', { name: /Bass/ }).first().dragTo(lane, { targetPosition: { x: Math.min(200, b.width - 10), y: b.height / 2 } }); await page.waitForTimeout(800);
      o.drag = { c: [c0, await page.locator('[data-clip-id]').count()], status: (await st())?.slice(0, 70) }; return o; });
    // SMOKE
    await step('smoke', async () => {
      const o = {}; await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' }); await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 }); await page.waitForTimeout(500);
      await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(600); o.clips = await page.locator('[data-clip-id]').count();
      await page.keyboard.press('Space'); await page.waitForTimeout(1500); o.pos = await page.getByTestId('arrangement-position').first().textContent().catch(()=>null); await page.keyboard.press('Space'); await page.waitForTimeout(300);
      o.clipTracks0 = await page.locator('[data-clip-id]').first().evaluate(e=>e.closest('[data-track-id]')?.getAttribute('data-track-id'));
      o.vp1=(await page.locator('[data-clip-id]').first().boundingBox());
      const clip=page.locator('[data-clip-id]').first(); const cb=await clip.boundingBox(); const trs=await page.locator('[data-track-id]').evaluateAll(es=>es.map(e=>e.getAttribute('data-track-id')));
      const lanes=page.locator('[data-track-id]'); const idx=trs.indexOf('music'); const nb=await lanes.nth(idx+1).boundingBox();
      await page.mouse.move(cb.x+cb.width/2, cb.y+6); await page.mouse.down(); await page.mouse.move(cb.x+cb.width/2, (nb.y+nb.height/2), {steps:8}); await page.mouse.up(); await page.waitForTimeout(500);
      o.afterMove = await page.locator('[data-clip-id]').first().evaluate(e=>e.closest('[data-track-id]')?.getAttribute('data-track-id')); o.undoTitle = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
      await page.keyboard.press('Control+z'); await page.waitForTimeout(400); o.afterUndo = await page.locator('[data-clip-id]').first().evaluate(e=>e.closest('[data-track-id]')?.getAttribute('data-track-id'));
      const mm = page.getByRole('button', { name: 'Master Mute' }).first(); const p0 = await mm.getAttribute('aria-pressed'); await mm.click(); await page.waitForTimeout(200); const p1 = await mm.getAttribute('aria-pressed'); await page.keyboard.press('Control+z'); await page.waitForTimeout(300); o.master=[p0,p1,await mm.getAttribute('aria-pressed')];
      return o; });
    await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  } catch (e) { r.error = String(e).slice(0, 300); }
  await ctx.close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
