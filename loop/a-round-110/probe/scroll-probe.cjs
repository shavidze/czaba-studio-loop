const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = { utc: new Date().toISOString(), samples: [] };
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-library-collapse]', { timeout: 90000 });
  await sleep(2500);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await page.click('[data-testid=arrangement-library-collapse]');
  await sleep(600);
  await page.focus('[data-testid=arrangement-library-expand]');
  await page.evaluate(() => {
    const aside = document.querySelector('[data-testid=arrangement-library]');
    window.__scrollSamples = [];
    const t0 = performance.now();
    const sample = () => {
      const inner = aside.firstElementChild;
      window.__scrollSamples.push({ t: Math.round(performance.now() - t0), asideScrollLeft: aside.scrollLeft, innerScrollLeft: inner ? inner.scrollLeft : null, width: Math.round(aside.getBoundingClientRect().width), active: document.activeElement?.getAttribute('data-testid') });
      if (performance.now() - t0 < 700) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.keyboard.press('Enter');
  await sleep(900);
  out.samples = await page.evaluate(() => window.__scrollSamples);
  out.maxAsideScrollLeft = Math.max(...out.samples.map((s) => s.asideScrollLeft));
  fs.writeFileSync('scroll-probe-result.json', JSON.stringify(out, null, 1));
  console.log('maxAsideScrollLeft', out.maxAsideScrollLeft, JSON.stringify(out.samples.slice(0, 6)), JSON.stringify(out.samples.slice(-2)));
  await browser.close();
})();
