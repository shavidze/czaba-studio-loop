const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } }); const page = await ctx.newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto('http://127.0.0.1:5173/studio-lab'); await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(800);
    await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(800);
    await page.getByRole('button', { name: /^SFX — set as the active track/ }).click(); await sleep(200);
    await page.locator('[role="option"]').nth(3).click(); await sleep(300);
    await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(800);
    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Control+a'); await sleep(300);
    const m1 = await page.evaluate(() => [...document.querySelectorAll('footer p')].map((p) => p.textContent.slice(0, 60)));
    // body range on the music clip
    const p = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const r = c.getBoundingClientRect(); return { x: Math.max(r.left, 240) + 20, y: r.top + r.height * 0.65 }; });
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 150, p.y, { steps: 8 }); await page.mouse.up(); await sleep(300);
    await page.keyboard.press('Control+Shift+l'); await sleep(300);
    const measure = () => page.evaluate(() => {
      const f = document.querySelector('[data-testid="arrangement-status"]').closest('footer');
      const fr = f.getBoundingClientRect();
      const btn = [...f.querySelectorAll('button')].find((x) => x.textContent.includes('Shortcuts'));
      const br = btn.getBoundingClientRect(); const row = btn.parentElement.getBoundingClientRect();
      const kids = [...f.children].map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, tid: e.getAttribute('data-testid'), y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width), text: e.textContent.slice(0, 90) }; });
      let overlap = false; for (let i = 0; i < kids.length; i += 1) for (let j = i + 1; j < kids.length; j += 1) { const a = kids[i], c = kids[j]; if (a.y < c.y + c.h - 0.5 && c.y < a.y + a.h - 0.5 && a.h > 0 && c.h > 0) { const ra = f.children[i].getBoundingClientRect(), rc = f.children[j].getBoundingClientRect(); if (ra.left < rc.right && rc.left < ra.right) overlap = true; } }
      return { footer: { y: fr.y, h: fr.height, bottom: fr.bottom, vh: innerHeight }, kids, button: { h: br.height, w: br.width, visible: br.bottom <= innerHeight && br.right <= innerWidth }, rowH: row.height, overlap, scroller: document.querySelector('[data-testid="arrangement-timeline-scroller"]').clientHeight };
    });
    const sfx = await page.evaluate(() => { const c = [...document.querySelectorAll('[data-clip-kind="audio"]')].find((x) => x.closest('[data-track-id]').getAttribute('data-track-id') === 'sfx'); const r = c.getBoundingClientRect(); return { x: Math.max(r.left, 240) + Math.min(20, r.width / 2), y: r.top + 10 }; });
    await page.keyboard.down('Control'); await page.mouse.click(sfx.x, sfx.y); await page.keyboard.up('Control'); await sleep(300);
    const before = await measure();
    // also with a single selected clip + range (selected-clip line present)
    await page.screenshot({ path: path.join(__dirname, `footer-range-count-${W}x${H}.png`) });
    res[`${W}x${H}`] = { afterCtrlA: m1, rangeMulti: before, errs };
    await ctx.close();
  }
  console.log(JSON.stringify(res, null, 1)); await b.close();
})();
