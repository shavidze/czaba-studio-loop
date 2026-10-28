import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-226';
const res = {}; const geom = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const state of ['S0', 'S1']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
    await page.waitForTimeout(1500);
    if (state === 'S1') {
      await page.getByRole('button', { name: /^Add/ }).first().click();
      await page.waitForTimeout(1000);
      await page.mouse.click(5, 5);
      await page.waitForTimeout(300);
    }
    const dump = await page.evaluate(() => {
      const rows = [];
      const seen = new Map();
      for (const el of document.querySelectorAll('[data-testid], button, input, [role="slider"]')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const base = el.getAttribute('data-testid') || `${el.tagName.toLowerCase()}:${el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30)}`;
        const n = (seen.get(base) || 0) + 1; seen.set(base, n);
        rows.push({ key: n > 1 ? `${base}#${n}` : base, x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) });
      }
      return rows;
    });
    res[`${w}x${h}-${state}`] = dump;
    geom[`${w}x${h}-${state}`] = await page.evaluate(() => {
      const footer = document.querySelector('[data-testid="arrangement-status"]')?.closest('footer');
      const fr = footer.getBoundingClientRect();
      const btn = [...footer.querySelectorAll('button')].find((b) => b.textContent.includes('Shortcuts'));
      const row = btn?.parentElement; const rr = row?.getBoundingClientRect(); const br = btn?.getBoundingClientRect();
      const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
      const lines = [...footer.querySelectorAll('p, output')].filter((e) => e.getBoundingClientRect().height > 0).map((e) => ({ t: (e.getAttribute('data-testid') || e.tagName) , h: e.getBoundingClientRect().height, text: e.innerText.slice(0, 80), ariaHidden: e.getAttribute('aria-hidden') }));
      return { hint: !!document.querySelector('[data-testid="arrangement-shortcut-hint"]'), footerY: fr.y, footerH: fr.height, scrollerClientHeight: sc.clientHeight, rowH: rr?.height, btnH: br?.height, btnW: br?.width, footerText: footer.innerText, lines };
    });
    await page.screenshot({ path: `${out}/after-full-${state}-${w}x${h}.png`, fullPage: false });
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${out}/bbox-after.json`, JSON.stringify(res, null, 1)); writeFileSync(`${out}/geom-after.json`, JSON.stringify(geom, null, 1));
for (const [k, v] of Object.entries(res)) console.log(k, v.length);
