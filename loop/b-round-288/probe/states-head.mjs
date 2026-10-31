import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out = {};
const browser = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(800);
  const listState = () => page.evaluate(() => {
    const list = document.querySelector('[data-testid="arrangement-library-list"]');
    return { options: [...list.querySelectorAll('[role="option"]')].map(o => o.dataset.sourceId), groups: list.querySelectorAll('[role="group"]').length, empty: !!document.querySelector('[data-testid="arrangement-library-empty"]') };
  });
  const r = { keys: [] };
  await page.locator('[role="option"]').first().focus();
  const step = async (key) => {
    if (key) await page.keyboard.press(key);
    await page.waitForTimeout(250);
    r.keys.push(await page.evaluate((key) => {
      const a = document.activeElement; const list = document.querySelector('[data-testid="arrangement-library-list"]');
      const ab = a.getBoundingClientRect(); const lb = list.getBoundingClientRect();
      const top = lb.top + list.clientTop, bottom = top + list.clientHeight;
      return { key, id: a.dataset.sourceId || a.tagName, inside: ab.top >= top - 0.5 && ab.bottom <= bottom + 0.5, aTop: +ab.top.toFixed(1), aBottom: +ab.bottom.toFixed(1), top: +top.toFixed(1), bottom: +bottom.toFixed(1) };
    }, key));
  };
  await step(null);
  for (let i = 0; i < 8; i++) await step('ArrowDown');
  for (let i = 0; i < 8; i++) await step('ArrowUp');
  const tree = page.locator('nav');
  await tree.getByRole('button', { name: /^Synthetic demo/ }).last().click(); await page.waitForTimeout(300);
  r.a = await listState();
  await tree.locator('[data-testid="arrangement-library-folder"]', { hasText: 'Stems' }).click(); await page.waitForTimeout(300);
  r.b = await listState();
  await tree.getByRole('button', { name: /^All/ }).click(); await page.waitForTimeout(300);
  const search = page.getByRole('searchbox', { name: 'Search the library' }).or(page.getByRole('textbox', { name: 'Search the library' }));
  for (const [k,q] of [['c','zzz'],['f','synthetic'],['bassHead','ბასი']]) { await search.fill(q); await page.waitForTimeout(400); r[k] = await listState(); }
  await search.fill(''); 
  out[w] = r;
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
