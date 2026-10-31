import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out = {};
const browser = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(800);
  const opt = page.locator('[role="option"][data-source-id="demo-stem-bass"]');
  await opt.click();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    const status = [...document.querySelectorAll('[role="status"], output, [aria-live]')].map(e => e.textContent.trim()).filter(Boolean);
    const clips = [...document.querySelectorAll('[data-clip-id]')].map(c => (c.getAttribute('aria-label') || c.title || c.textContent).trim().slice(0,120));
    const undo = [...document.querySelectorAll('button')].filter(b => /^Undo/.test(b.textContent.trim())).map(b => ({ text: b.textContent.trim(), title: b.title }));
    const geo = [...new Set([...document.body.innerText.matchAll(/[^\n]*[Ⴀ-ჿ][^\n]*/g)].map(m=>m[0].trim()))];
    return { status, clips, undo, geo, active: document.activeElement?.getAttribute('data-source-id') || document.activeElement?.tagName };
  });
  await page.keyboard.press('Space'); await page.waitForTimeout(1500);
  r.afterPlay = await page.evaluate(() => [...document.querySelectorAll('[role="status"], output, [aria-live]')].map(e => e.textContent.trim()).filter(Boolean).slice(0,4));
  await page.keyboard.press('Space');
  out[w] = r;
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
