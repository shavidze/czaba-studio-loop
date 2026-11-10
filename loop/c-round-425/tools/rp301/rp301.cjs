// C301 §5 record-only rows: RP-MENU-SHEET, RP-LINK-NATIVE-MENU, RP-LINK-DRAG, SA-28. Both viewports, fresh contexts.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://127.0.0.1:5173'; const SH = path.join(__dirname, 'shots');
const ready = async (p) => { await p.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 }); await sleep(600); };
const act = (p) => p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}|${a.getAttribute('role') || ''}|${a.getAttribute('data-testid') || a.getAttribute('data-source-id') || ''}|${(a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 40)}` : null; });
const ui = (p) => p.evaluate(() => ({ dialogs: document.querySelectorAll('[role=dialog]').length, menus: [...document.querySelectorAll('[role=menu]')].filter((m) => m.getClientRects().length).length, sheet: !!document.querySelector('[role=dialog] [data-shortcut-id]'), markers: document.querySelectorAll('[data-marker-id]').length, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
(async () => { const b = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) { const k = `${w}x${h}`; const R = {}; out[k] = R; const errors = [];
  // RP-MENU-SHEET (library menu)
  { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(String(e).slice(0, 160))); await ready(p);
    const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.focus(); await p.keyboard.press('Shift+F10'); await sleep(400);
    const s = { menuOpen: await ui(p), activeMenu: await act(p) };
    await p.keyboard.press('Shift+Slash'); await sleep(500); s.afterQ = await ui(p); s.activeAfterQ = await act(p); await p.screenshot({ path: path.join(SH, `menu-sheet-lib-${k}.png`) });
    await p.keyboard.press('Escape'); await sleep(400); s.afterEsc1 = await ui(p); s.activeEsc1 = await act(p);
    await p.keyboard.press('Escape'); await sleep(400); s.afterEsc2 = await ui(p); s.activeEsc2 = await act(p);
    R.menuSheetLibrary = s;
    // marker menu variant
    await p.keyboard.press('Home'); await sleep(200); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.keyboard.press('KeyM'); await sleep(500); await p.keyboard.press('Enter'); await sleep(400);
    const m = { markers: (await ui(p)).markers };
    const flag = p.locator('[data-marker-id]').first(); const fb = await flag.boundingBox();
    if (fb) { await p.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2, { button: 'right' }); await sleep(400); m.menuOpen = await ui(p); m.activeMenu = await act(p);
      await p.keyboard.press('Shift+Slash'); await sleep(500); m.afterQ = await ui(p); m.activeAfterQ = await act(p); await p.screenshot({ path: path.join(SH, `menu-sheet-marker-${k}.png`) });
      await p.keyboard.press('Escape'); await sleep(400); m.afterEsc1 = await ui(p); m.activeEsc1 = await act(p);
      await p.keyboard.press('Escape'); await sleep(400); m.afterEsc2 = await ui(p); m.activeEsc2 = await act(p); m.markersAfter = (await ui(p)).markers; }
    R.menuSheetMarker = m; await ctx.close(); }
  // RP-LINK-NATIVE-MENU + RP-LINK-DRAG
  { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(String(e).slice(0, 160))); await ready(p);
    await p.evaluate(() => { window.__cm = []; window.addEventListener('contextmenu', (e) => window.__cm.push({ prevented: e.defaultPrevented, tag: e.target.tagName, text: (e.target.textContent || '').trim().slice(0, 30) })); });
    const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); const bb = await o.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' }); await sleep(400);
    const item = p.getByRole('menuitem', { name: 'View in store' }); const ib = await item.boundingBox(); R.itemTag = await item.evaluate((e) => ({ tag: e.tagName, href: e.getAttribute('href'), target: e.getAttribute('target'), draggable: e.draggable }));
    const pagesBefore = ctx.pages().length;
    await p.mouse.click(ib.x + ib.width / 2, ib.y + ib.height / 2, { button: 'right' }); await sleep(500);
    R.nativeMenu = { contextmenuEvents: await p.evaluate(() => window.__cm), afterUi: await ui(p), pagesAfter: ctx.pages().length - pagesBefore, url: p.url() };
    await p.screenshot({ path: path.join(SH, `native-menu-${k}.png`) });
    await p.keyboard.press('Escape'); await sleep(300);
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' }); await sleep(400);
    const search = p.locator('[data-testid=arrangement-library-search]'); const before = await search.inputValue();
    try { await p.getByRole('menuitem', { name: 'View in store' }).dragTo(search, { timeout: 8000 }); } catch (e) { R.dragError = String(e).slice(0, 160); }
    await sleep(500); R.linkDrag = { before, after: await search.inputValue(), ui: await ui(p), pages: ctx.pages().length, url: p.url(), clips: await p.locator('[data-clip-id]').count() };
    await p.screenshot({ path: path.join(SH, `link-drag-${k}.png`) }); await ctx.close(); }
  // SA-28
  { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(String(e).slice(0, 160))); await ready(p);
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000); await p.evaluate(() => document.activeElement && document.activeElement.blur());
    const g = () => p.evaluate(() => ({ ...document.querySelector('[data-testid=arrangement-grid-control]').dataset, zoom: document.querySelector('[data-testid=arrangement-zoom-readout]')?.textContent, status: document.querySelector('[data-testid=arrangement-status]')?.textContent }));
    const s = { g0: await g() }; await p.keyboard.press('Digit5'); await sleep(300); s.afterFixed = await g();
    // choose 1/4 from the grid menu
    const pt = await p.evaluate(() => { for (const f of [0.95, 0.8, 0.6, 0.4, 0.2]) for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); const x = Math.min(r.left + r.width * f, innerWidth - 230), y = r.top + r.height / 2; const e = document.elementFromPoint(x, y); if (e === body || (e && body.contains(e) && !e.closest('[data-clip-id]'))) return { x, y }; } return null; });
    await p.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400); const it = p.getByRole('menuitemradio', { name: '1/4', exact: true }); s.has14 = await it.count(); if (s.has14) { await it.click(); await sleep(300); } else await p.keyboard.press('Escape');
    s.after14 = await g();
    for (let i = 0; i < 12; i++) { const z = parseFloat((await g()).zoom); if (z <= 4.5) break; await p.keyboard.press('Minus'); await sleep(200); }
    s.atZoom = await g(); await p.keyboard.press('Digit3'); await sleep(400); s.after3 = await g(); await p.screenshot({ path: path.join(SH, `sa28-${k}.png`) });
    R.sa28 = s; await ctx.close(); }
  R.errors = errors; console.log(k, JSON.stringify(R).slice(0, 3000)); }
fs.writeFileSync(path.join(__dirname, 'rp301.json'), JSON.stringify(out, null, 1)); await b.close(); })();
