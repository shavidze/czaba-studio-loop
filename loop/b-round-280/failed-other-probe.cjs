const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const out = [];
  const browser = await chromium.launch();
  for (const [name, pattern] of [['middle-east', '**/middle-east.mp3'], ['hero-music', '**/hero-music.mp3']]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.route(pattern, (r) => r.abort());
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 180000 });
    const status = page.getByTestId('arrangement-status');
    await status.filter({ hasText: /ready|failed to load/ }).waitFor({ timeout: 180000 });
    await page.waitForTimeout(3000);
    const r = await page.evaluate(() => {
      const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add');
      const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect');
      return { addFound: !!add, addAriaDisabled: add?.getAttribute('aria-disabled') ?? null, wave: wave !== null, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent };
    });
    out.push({ name, ...r });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
