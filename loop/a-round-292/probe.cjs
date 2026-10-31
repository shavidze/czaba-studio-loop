const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const [w, h] of [[390, 844], [899, 900], [900, 900], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const logs = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 200)); });
    const media = [];
    page.on('request', (r) => { if (/\.mp3/.test(r.url())) media.push(r.url().replace(/^https?:\/\/[^/]+/, '')); });
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
    await page.waitForTimeout(2500); await page.waitForLoadState('load');
    const r = await page.evaluate(() => ({
      active: document.activeElement?.tagName + ' ' + (document.activeElement?.getAttribute('data-testid') || ''),
      h1: [...document.querySelectorAll('h1')].filter((e) => e.offsetParent || e.getClientRects().length).map((e) => e.textContent),
      exit: !!document.querySelector('[data-testid="arrangement-exit"]'),
      narrowDisplay: (() => { const n = document.querySelector('[data-testid="studio-narrow-screen"]'); return n ? getComputedStyle(n).display : null; })(),
      scrollW: document.documentElement.scrollWidth,
      bg: getComputedStyle(document.body).backgroundColor,
      scheme: (() => { const a = document.querySelector('audio'); return a ? getComputedStyle(a).colorScheme : null; })(),
      themes: document.querySelectorAll('[data-studio-theme]').length,
    }));
    await page.screenshot({ path: `probe-${w}x${h}.png` });
    out[`${w}x${h}`] = { ...r, logs, media };
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
