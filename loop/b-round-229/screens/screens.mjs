import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const label = process.argv[3] || 'before';
const res = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const state of ['S0', 'DEMO']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
    await page.waitForTimeout(1500);
    if (state === 'DEMO') {
      const lib = page.getByTestId('arrangement-library-list');
      const pick = async (track, item) => {
        await page.getByTestId('arrangement-track-header').filter({ hasText: track }).first().click({ position: { x: 150, y: 12 } });
        await page.waitForTimeout(300);
        await page.getByRole('button', { name: 'All' }).first().click().catch(() => {}); await page.waitForTimeout(200); await (item === 'Stem' ? page.getByText(/Stem\s*00:16/).first() : page.getByText(item, { exact: false }).first()).click();
        await page.waitForTimeout(300);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(900);
      };
      await pick('Music', 'Middle East');
      await pick('SFX', 'Soft impact');
      await pick('Stems', 'Stem');
await page.waitForTimeout(1000);
      await page.mouse.click(5, 5);
      await page.waitForTimeout(300);
    }
    res[`${w}x${h}-${state}`] = await page.evaluate(() => {
      const rows = [];
      const visible = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
          if (e.getAttribute('aria-hidden') === 'true' && e !== el) {}
        }
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      };
      for (const el of document.body.querySelectorAll('*')) {
        if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
        if (!own) continue;
        if (el.closest('.sr-only')) continue;
        if (!visible(el)) continue;
        const region = el.closest('[data-testid]')?.getAttribute('data-testid') || el.tagName;
        const inClip = !!el.closest('[data-testid^="arrangement-clip"]');
        const inLibraryList = !!el.closest('[data-testid="arrangement-library-list"], [data-testid="arrangement-library-tree"]');
        rows.push({ region, text: own.slice(0, 120), inClip, inLibraryList });
      }
      return rows;
    });
    await page.screenshot({ path: `${out}/${label}-full-${state}-${w}x${h}.png` });
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res)) console.log(k, v.length);
