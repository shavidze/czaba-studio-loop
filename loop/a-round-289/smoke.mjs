import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const out = process.argv[2];
const browser = await chromium.launch();
const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (document.querySelector('[data-testid=arrangement-status]')?.textContent ?? '').includes('Demo collection ready'), null, { timeout: 90000 }).catch(async (e) => { await page.screenshot({ path: `${out}/a-smoke-fail-${w}.png` }); console.error('status:', await page.evaluate(() => document.querySelector('[data-testid=arrangement-status]')?.textContent)); throw e; });
  const r = await page.evaluate(() => {
    const lb = document.querySelector('[role=listbox][data-testid=arrangement-library-list]');
    const groups = [...lb.querySelectorAll('[role=group]')].map((g) => {
      const hd = document.getElementById(g.getAttribute('aria-labelledby'));
      return { name: hd.textContent, h: hd.getBoundingClientRect().height, trunc: hd.scrollWidth > hd.clientWidth };
    });
    const geo = /[Ⴀ-ჿ]/;
    const attrs = [...document.querySelectorAll('*')].flatMap((el) => [...el.attributes].filter((a) => /^(title|aria-|alt|placeholder)/.test(a.name) && geo.test(a.value)).map((a) => a.value));
    return {
      groups,
      options: [...lb.querySelectorAll('[role=option]')].map((o) => [o.dataset.sourceId, o.title, o.getBoundingClientRect().height]),
      context: document.querySelectorAll('[data-testid=arrangement-library-option-context]').length,
      georgianText: document.body.innerText.split('\n').filter((l) => geo.test(l)),
      georgianAttrs: attrs,
      scrollHeight: lb.scrollHeight,
    };
  });
  await page.screenshot({ path: `${out}/a-smoke-${w}.png` });
  if (w === 1440) await ctx.storageState({ path: `${out}/../a-browse.json` });
  res[w] = r;
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(res, null, 1));
