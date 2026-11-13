const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => { const b = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) { const k = `${w}x${h}`; const R = {}; out[k] = R;
  for (const origin of ['body', 'snapKeyboard']) { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 }); await sleep(500);
    const act = () => p.evaluate(() => { const a = document.activeElement; return `${a.tagName}|${a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.textContent.trim().slice(0, 20)}|fv=${a.matches(':focus-visible')}`; });
    if (origin === 'snapKeyboard') { await p.locator('[data-testid=arrangement-snap-toggle]').focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); } else await p.evaluate(() => document.activeElement && document.activeElement.blur());
    const r = { start: await act() };
    const pt = await p.evaluate(() => { const l = document.querySelector('[data-track-id="sfx"] [data-grid-lines]') || document.querySelector('[data-track-id="sfx"]'); const q = l.getBoundingClientRect(); return { x: q.left + q.width * 0.6, y: q.top + q.height / 2 }; });
    await p.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400); r.open = await act();
    r.menuDomIndex = await p.evaluate(() => { const m = document.querySelector('[data-testid=arrangement-grid-menu]'); const all = [...document.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])')].filter((e) => e.getClientRects().length); const i = all.findIndex((e) => m && m.contains(e)); return { i, n: all.length, after: all.slice(i).filter((e) => !m.contains(e)).map((e) => e.getAttribute('data-testid') || e.getAttribute('aria-label') || e.tagName).slice(0, 4) }; });
    await p.keyboard.press('ArrowDown'); await sleep(200); await p.keyboard.press('Tab'); await sleep(300); r.afterTab = await act(); await p.keyboard.press('Tab'); await sleep(200); r.afterTab2 = await act();
    R[origin] = r; await ctx.close(); } console.log(k, JSON.stringify(R)); }
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/out/rp-c301-01.json', JSON.stringify(out, null, 1)); await b.close(); })();
