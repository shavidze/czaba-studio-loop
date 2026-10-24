const { chromium } = require(require.resolve('@playwright/test', { paths: [process.cwd()] }));
(async () => {
  const out = {};
  const browser = await chromium.launch();
  for (const mode of ['ready', 'abort']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    if (mode === 'abort') await page.route('**/middle-east.mp3', (r) => r.abort());
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-source-id]', { timeout: 30000 });
    await page.waitForFunction(() => ![...document.querySelectorAll('[data-source-id]')].some((r) => /Loading…|იტვირთება…/.test(r.textContent)), null, { timeout: 60000 });
    const rows = await page.$$eval('[data-source-id]', (rs) => rs.map((r) => [r.getAttribute('data-source-id'), r.lastElementChild ? r.lastElementChild.textContent : '']));
    const tree = await page.$$eval('[aria-label="ბიბლიოთეკის ხე"] button, [aria-label="ბიბლიოთეკის ხე"] [role="treeitem"]', (b) => b.map((x) => x.textContent.trim())).catch(() => []);
    const body = await page.evaluate(() => document.body.textContent || '');
    out[mode] = { rows, tree: [...new Set(tree)].slice(0, 12), hasNotice: body.includes('The stems are a synthetic demo — not CZABA catalogue stems and not parts extracted from a mix.'), errors };
    if (mode === 'ready') {
      const search = page.locator('input[aria-label="ბიბლიოთეკაში ძიება"]');
      for (const q of ['stems', 'sfx', 'მუსიკა']) {
        await search.fill(q);
        await page.waitForTimeout(300);
        out[mode]['search:' + q] = await page.$$eval('[data-source-id]', (rs) => rs.map((r) => r.getAttribute('data-source-id')));
      }
    }
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
