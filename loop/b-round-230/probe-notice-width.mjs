import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
await page.goto(process.argv[2] + '/studio-lab', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-testid="arrangement-library-notice"]');
const r = await page.evaluate(() => {
  const n = document.querySelector('[data-testid="arrangement-library-notice"]');
  const span = document.createElement('span'); span.textContent = n.textContent;
  span.style.whiteSpace = 'nowrap'; n.appendChild(span);
  const tw = span.getBoundingClientRect().width; span.remove();
  const lib = document.querySelector('[data-testid="arrangement-library"]');
  const cs = getComputedStyle(n);
  return { textWidth: tw, noticeBox: n.getBoundingClientRect().width, lib: lib?.getBoundingClientRect().width, font: cs.fontSize + ' ' + cs.fontFamily.slice(0,30), lh: cs.lineHeight, parentW: n.parentElement.getBoundingClientRect().width };
});
console.log(w, JSON.stringify(r));
}
await b.close();
