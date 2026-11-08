const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [base, out, vp] = process.argv.slice(2);
const [w, h] = vp.split('x').map(Number);
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 180000 });
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  const audio = '[data-clip-kind="audio"]';
  await page.locator(audio).first().waitFor();
  const bar = page.locator(audio).first().getByTitle(/ — drag to move$/).first();
  const b = await bar.boundingBox();
  await page.mouse.click(b.x + 20, b.y + b.height / 2);
  await page.evaluate(() => document.activeElement?.blur?.());
  for (let n = 1; n < 40; n += 1) {
    await page.keyboard.press('Control+d');
    await page.waitForFunction((want) => Math.max(...[...document.querySelectorAll('[data-track-id][data-clip-count]')].map((l) => Number(l.getAttribute('data-clip-count')))) >= want, n + 1, { timeout: 30000 });
  }
  await page.waitForTimeout(500);
  const info = () => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, kind: a?.getAttribute?.('data-clip-kind'), testid: a?.getAttribute?.('data-testid'), id: a?.id || null, role: a?.getAttribute?.('role'), mounted: document.querySelectorAll('[data-clip-kind="audio"]').length }; });
  // focus first clip by keyboard: click it then press Tab/shift tab? use focus() on its focusable
  const focusTarget = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const f = c.matches('[tabindex]') ? c : c.querySelector('[tabindex],button'); if (!f) return null; f.focus(); return { tag: f.tagName, start: c.dataset.clipStart }; });
  const before = await info();
  await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft = s.scrollWidth; });
  await page.waitForTimeout(600);
  const after = await info();
  const firstStartNow = await page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => c.dataset.clipStart)[0]);
  // keyboard action still works? press Delete would alter; press ArrowRight on window and read status
  await page.screenshot({ path: out.replace('.json', '.png') });
  require('fs').writeFileSync(out, JSON.stringify({ vp, focusTarget, before, after, firstStartNow, errs }, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
