// C289: screenshot of search "bass" from All (single-run, flat) + accessible description of the option. node search-e.mjs <base> <tag>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [BASE, TAG] = process.argv.slice(2); const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-289';
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  await page.getByRole('searchbox', { name: 'Search the library' }).or(page.getByRole('textbox', { name: 'Search the library' })).fill('bass');
  await page.waitForTimeout(500);
  const cdp = await ctx.newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const opt = nodes.filter((n) => n.role?.value === 'option').map((n) => ({ name: n.name?.value, description: n.description?.value }));
  const text = await page.locator('aside').innerText();
  console.log(`${w}x${h}`, JSON.stringify({ opt, visibleHasCollection: /Night Pulse/.test(text) }));
  await page.locator('aside').screenshot({ path: `${DIR}/shots/search-bass-${TAG}-${w}x${h}.png` });
  await ctx.close();
}
await browser.close();
