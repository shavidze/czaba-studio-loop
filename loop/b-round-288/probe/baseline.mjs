import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out = {};
const browser = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 60000 }).catch(()=>{});
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const list = document.querySelector('[data-testid="arrangement-library-list"]');
    if (!list) return { list: null };
    const opts = [...list.querySelectorAll('[role="option"]')];
    const georgian = /[Ⴀ-ჿ]/;
    const lb = list.getBoundingClientRect();
    return {
      listBox: { x: lb.x, y: lb.y, w: lb.width, h: lb.height },
      options: opts.map(o => ({ id: o.dataset.sourceId, title: o.title, text: o.innerText.split('\n'), h: o.getBoundingClientRect().height })),
      contextLines: list.querySelectorAll('[data-testid="arrangement-library-option-context"]').length,
      groups: list.querySelectorAll('[role="group"]').length,
      georgianInList: georgian.test(list.innerText),
      georgianInBody: [...document.body.innerText.matchAll(/[Ⴀ-ჿ]+/g)].map(m=>m[0]).slice(0,20),
      listInnerLines: list.innerText.split('\n').filter(s=>s.trim()).length,
      treeNodes: [...document.querySelectorAll('nav button')].map(b=>b.innerText.replace(/\n/g,' ')).filter(Boolean).slice(0,20),
    };
  });
  await page.screenshot({ path: `probe/baseline-${w}.png` });
  out[w] = r;
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
