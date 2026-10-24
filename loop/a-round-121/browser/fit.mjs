import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const browser = await chromium.launch();
const results = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-waveform-zoom"]', { timeout: 30000, state: 'attached' });
  const m = await page.evaluate(() => {
    const g = document.querySelector('[data-testid="arrangement-grid-control"]');
    const s = document.querySelector('[data-testid="arrangement-waveform-zoom"]');
    const gr = g.getBoundingClientRect(); const sr = s.getBoundingClientRect();
    return { gridH: gr.height, gridW: gr.width, scrollW: g.scrollWidth, clientW: g.clientWidth,
      selectRightFromGridLeft: sr.right - gr.left, selectW: sr.width, last: g.lastElementChild === s,
      attr: g.dataset.waveformZoom, value: s.value, text: s.options[s.selectedIndex].textContent };
  });
  await page.selectOption('[data-testid="arrangement-waveform-zoom"]', '2');
  m.after = await page.evaluate(() => ({ attr: document.querySelector('[data-testid="arrangement-grid-control"]').dataset.waveformZoom,
    status: Array.from(document.querySelectorAll('[role="status"],[aria-live]')).map((e) => e.textContent).join(' | ').slice(0, 300) }));
  await page.screenshot({ path: `${out}/fit-${w}.png` });
  m.pageerrors = errors;
  results[w] = m;
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
