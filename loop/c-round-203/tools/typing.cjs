// C round 203 — TYPING-203 (+ NONTEXT-203 for Studio faders and a store Button). node typing.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path'); const fs = require('fs');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : 720;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const SH = path.join(F.ROOT, 'shots', 'typing', TAG); fs.mkdirSync(SH, { recursive: true });
const st = (page) => page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { src: document.documentElement.dataset.focusSource ?? null, tag: e.tagName, type: e.type || null, name: (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent.trim()).slice(0, 32), role: e.getAttribute('role'), os: c.outlineStyle, ow: c.outlineWidth, oc: c.outlineColor, bs: c.boxShadow.slice(0, 80), val: 'value' in e ? String(e.value).slice(0, 20) : null }; });
const FIELDS = [
  { name: 'store-search', url: '/store', sel: 'input[placeholder^="Search packs"]' },
  { name: 'newsletter', url: '/', sel: 'input[placeholder="Enter your email"]', scroll: true },
  { name: 'auth-email', url: '/store', open: async (p) => { await p.locator('header button', { hasText: 'Sign In' }).first().click(); await F.sleep(1200); }, sel: '[role=dialog] input[type=email], .fixed input[type=email]' },
  { name: 'cmdk', url: '/store', open: async (p) => { await p.locator('button[aria-label="Search (⌘K)"]').filter({ visible: true }).first().click(); await F.sleep(900); }, sel: '.command-palette-input' },
  { name: 'studio-search', url: '/studio-lab', studio: true, sel: 'input[type="search"]' },
  { name: 'studio-tempo', url: '/studio-lab', studio: true, sel: '[data-testid=arrangement-tempo-input]' },
];
async function load(page, f) {
  await page.goto(BASE + f.url, { waitUntil: 'load', timeout: 90000 });
  if (f.studio) { await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await F.sleep(2500); } else await F.sleep(3000);
  await F.declineCookies(page); await F.sleep(400);
}
async function ensure(page, f) {
  let loc = page.locator(f.sel).filter({ visible: true }).first();
  if (!(await loc.count())) { if (f.open) await f.open(page); loc = page.locator(f.sel).filter({ visible: true }).first(); }
  if (!(await loc.count())) { await load(page, f); if (f.open) await f.open(page); loc = page.locator(f.sel).filter({ visible: true }).first(); }
  if (f.scroll) { await loc.scrollIntoViewIfNeeded(); await F.sleep(500); }
  return loc;
}
async function click(page, f) {
  for (let i = 0; i < 3; i++) {
    const loc = await ensure(page, f); await F.sleep(i ? 800 : 0); const bb = await loc.boundingBox(); await page.mouse.click(bb.x + Math.min(12, bb.width / 3), bb.y + bb.height / 2); await F.sleep(300);
    const ok = await loc.evaluate((e) => e === document.activeElement).catch(() => false);
    if (ok) { if (i) (R_RETRY[f.name] = (R_RETRY[f.name] || 0) + i); return bb; }
  }
  R_RETRY[f.name + '-failed'] = (R_RETRY[f.name + '-failed'] || 0) + 1;
}
const R_RETRY = {};
async function held(page, cdp, key, n = 4) {
  const code = 'Key' + key.toUpperCase();
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, text: key, windowsVirtualKeyCode: key.toUpperCase().charCodeAt(0) });
  for (let i = 0; i < n; i++) { await F.sleep(40); await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, text: key, autoRepeat: true, windowsVirtualKeyCode: key.toUpperCase().charCodeAt(0) }); }
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: key.toUpperCase().charCodeAt(0) });
}
(async () => {
  const b = await F.launch(); const R = { TAG, fields: {} };
  let cur = null; let ctx; let page; let cdp;
  for (const f of FIELDS) {
    const r = {};
    try {
      if (!cur || cur !== f.url) { if (ctx) await ctx.close(); ({ ctx, page } = await F.newPage(b, W, H)); cdp = await ctx.newCDPSession(page); await load(page, f); cur = f.url; }
      // A) click + edit sequence
      await click(page, f); r.click = await st(page);
      await page.keyboard.type('ab', { delay: 60 }); await F.sleep(150); r.type2 = await st(page);
      await page.keyboard.press('Shift+A'); await F.sleep(150); r.shiftA = await st(page);
      const seq = {};
      for (const k of ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete']) { await page.keyboard.press(k); await F.sleep(150); const s = await st(page); seq[k] = `${s.src}/${s.os}/${s.tag}`; }
      r.editKeys = seq; r.afterEdit = await st(page);
      await held(page, cdp, 'x'); await F.sleep(200); r.held = await st(page);
      await page.screenshot({ path: path.join(SH, `${f.name}-typing.png`) });
      // clean the field value
      for (let i = 0; i < 12; i++) await page.keyboard.press('Backspace');
      r.cleaned = await st(page);
      // B) Escape after a fresh click
      await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(150);
      await click(page, f); await page.keyboard.press('Escape'); await F.sleep(450); r.escape = await st(page);
      await page.screenshot({ path: path.join(SH, `${f.name}-escape.png`) });
      // C) ArrowDown after a fresh click
      await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(150);
      await click(page, f); await page.keyboard.press('ArrowDown'); await F.sleep(450); r.arrowDown = await st(page);
      await page.screenshot({ path: path.join(SH, `${f.name}-arrowdown.png`) });
      // D) Tab after a fresh click
      await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(150);
      await click(page, f); await page.keyboard.press('Tab'); await F.sleep(450); r.tab = await st(page);
      // E) Tab-reached field: Shift+Tab back into it, then type
      await page.keyboard.press('Shift+Tab'); await F.sleep(400); r.tabBack = await st(page);
      await page.keyboard.type('cd', { delay: 60 }); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Backspace'); await F.sleep(200); r.tabBackTyped = await st(page);
      await held(page, cdp, 'y'); await F.sleep(200); r.tabBackHeld = await st(page);
      await page.screenshot({ path: path.join(SH, `${f.name}-tabtyped.png`) });
      for (let i = 0; i < 12; i++) await page.keyboard.press('Backspace');
      await page.keyboard.press('Escape'); await F.sleep(300);
    } catch (e) { r.err = String(e).slice(0, 300); cur = null; }
    R.fields[f.name] = r;
    F.save(path.join(F.ROOT, 'out', 'typing', `${TAG}.json`), R);
  }
  if (ctx) await ctx.close();
  // NONTEXT: Studio Volume + Pan (click, then ArrowUp); store Button (click, then Space)
  { const { ctx: c2, page: p } = await F.newPage(b, W, H); const N = {};
    try {
      await load(p, { url: '/studio-lab', studio: true });
      for (const [nm, sel] of [['volume', 'input[type=range][aria-label*="olume"]'], ['pan', 'input[type=range][aria-label*="an"]']]) {
        const loc = p.locator(sel).filter({ visible: true }).first(); const n = await p.locator(sel).count();
        if (!n) { N[nm] = 'not found'; continue; }
        const bb = await loc.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await F.sleep(350);
        const a = await st(p); const v0 = await loc.inputValue(); await p.keyboard.press('ArrowUp'); await F.sleep(400); const k = await st(p); const v1 = await loc.inputValue();
        await p.screenshot({ path: path.join(SH, `nontext-${nm}.png`), clip: F.clipFor([bb.x, bb.y, bb.width, bb.height], W, H, 14) });
        N[nm] = { count: n, afterClick: a, afterArrowUp: k, v0, v1 }; await p.keyboard.press('ArrowDown'); await F.sleep(200);
      }
    } catch (e) { N.studioErr = String(e).slice(0, 300); }
    try {
      await p.goto(BASE + '/store', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(p); await F.sleep(300);
      const btns = await p.evaluate(() => [...document.querySelectorAll('button')].filter((e) => e.offsetParent).map((e) => e.textContent.trim()).slice(0, 20)); N.storeButtons = btns;
      const loc = p.locator('button').filter({ visible: true }).filter({ hasText: /^All$/ }).first();
      const bb = await loc.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await F.sleep(350);
      const a = await st(p); await p.keyboard.press('Space'); await F.sleep(400); const k = await st(p);
      await p.screenshot({ path: path.join(SH, 'nontext-button.png'), clip: F.clipFor([bb.x, bb.y, bb.width, bb.height], W, H, 14) });
      N.button = { afterClick: a, afterSpace: k };
    } catch (e) { N.buttonErr = String(e).slice(0, 300); }
    R.nontext = N; await c2.close(); }
  R.retries = R_RETRY; F.save(path.join(F.ROOT, 'out', 'typing', `${TAG}.json`), R);
  console.log(TAG, 'retries', JSON.stringify(R_RETRY));
  const s = (x) => (x ? `${x.src}/${x.os}${x.ow && x.os !== 'none' ? x.ow : ''}/${x.tag}:${x.name}` : 'null');
  for (const [k, r] of Object.entries(R.fields)) { if (r.err) { console.log(TAG, k, 'ERR', r.err); continue; } console.log(TAG, k, '| click', s(r.click), '| type', s(r.type2), '| shiftA', s(r.shiftA), '| edit', JSON.stringify(r.editKeys), '| held', s(r.held), r.held.val, '| esc', s(r.escape), '| down', s(r.arrowDown), '| tab', s(r.tab), '| tabBack', s(r.tabBack), '| tabTyped', s(r.tabBackTyped), '| tabHeld', s(r.tabBackHeld)); }
  console.log(TAG, 'nontext', JSON.stringify(R.nontext));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
