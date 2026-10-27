// C round 203 — TYPING-203 newsletter re-run with a fresh page per sequence (Lenis smooth scroll made the reused-page click land on body). node newsletter.cjs <port>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const TAG = PORT === '5174' ? 'ref' : 'tree';
const st = (page) => page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return `${document.documentElement.dataset.focusSource}/${c.outlineStyle}${c.outlineStyle !== 'none' ? c.outlineWidth : ''}/${e.tagName}:${(e.getAttribute('aria-label') || e.placeholder || e.textContent.trim()).slice(0, 24)}`; });
(async () => { const b = await F.launch(); const R = {};
  for (const [W, H] of [[1280, 720], [1440, 900]]) for (const seq of ['down', 'tab', 'type']) {
    const { ctx, page } = await F.newPage(b, W, H);
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page);
    const loc = page.locator('input[placeholder="Enter your email"]'); await loc.scrollIntoViewIfNeeded(); await F.sleep(1500);
    const bb = await loc.boundingBox(); await page.mouse.click(bb.x + 12, bb.y + bb.height / 2); await F.sleep(300);
    const r = { click: await st(page) };
    if (seq === 'down') { await page.keyboard.press('ArrowDown'); await F.sleep(450); r.down = await st(page); }
    if (seq === 'tab') { await page.keyboard.press('Tab'); await F.sleep(450); r.tab = await st(page); await page.keyboard.press('Shift+Tab'); await F.sleep(450); r.back = await st(page); await page.keyboard.type('cd', { delay: 60 }); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Backspace'); await F.sleep(200); r.backTyped = await st(page); }
    if (seq === 'type') { await page.keyboard.type('ab', { delay: 60 }); r.typed = await st(page); await page.keyboard.press('Shift+A'); await page.keyboard.press('Home'); await page.keyboard.press('Delete'); await F.sleep(150); r.edit = await st(page); }
    R[`${W}-${seq}`] = r; await ctx.close(); }
  F.save(path.join(F.ROOT, 'out', 'typing', `newsletter-${TAG}.json`), R); console.log(TAG, JSON.stringify(R, null, 0)); await b.close(); })();
