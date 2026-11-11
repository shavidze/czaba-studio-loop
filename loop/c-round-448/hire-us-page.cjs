// Usage: node hire-us-page.cjs <out.json>  (HEAD on :5178, sketch/tree on :5179 by default; override HEAD_URL / TREE_URL)
// Per viewport: HEAD-vs-HEAD and HEAD-vs-tree full-page pixel diff of /hire-us, empty submit and filled submit.
const { chromium } = require(require.resolve('@playwright/test', { paths: [process.env.STORE_ROOT || '/home/runner/czaba-project/store'] }));
const fs = require('node:fs');
const out = process.argv[2] || 'hire-us-page.json';
const HEAD = process.env.HEAD_URL || 'http://127.0.0.1:5178';
const TREE = process.env.TREE_URL || 'http://127.0.0.1:5179';
const VIEWPORTS = [[1440, 900], [1280, 720], [375, 812]];
async function shot(browser, base, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(`${base}/hire-us`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const buf = await page.screenshot({ fullPage: true, caret: 'hide', animations: 'disabled', timeout: 120000 });
  await ctx.close();
  return buf;
}
async function diff(browser, a, b) {
  const page = await browser.newPage();
  const r = await page.evaluate(async ([x, y]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
    const [ia, ib] = await Promise.all([load(x), load(y)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height], diffPx: null };
    const c = (img) => { const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; };
    const da = c(ia), db = c(ib); let n = 0, minY = null, maxY = null;
    for (let i = 0; i < da.length; i += 4) { if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { n++; const yy = Math.floor(i / 4 / ia.width); minY = minY === null ? yy : Math.min(minY, yy); maxY = maxY === null ? yy : Math.max(maxY, yy); } }
    return { size: [ia.width, ia.height], diffPx: n, yRange: [minY, maxY] };
  }, [a.toString('base64'), b.toString('base64')]);
  await page.close();
  return r;
}
async function submits(browser, base, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(`${base}/hire-us`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const submit = page.locator('button[type="submit"]');
  await submit.scrollIntoViewIfNeeded();
  await submit.click();
  await page.waitForTimeout(800);
  const empty = await page.evaluate(() => ({
    url: location.pathname,
    invalid: [...document.querySelectorAll('form :invalid')].map((e) => e.getAttribute('name')),
    firstMessage: document.querySelector('form :invalid')?.validationMessage ?? null,
    errorText: [...document.querySelectorAll('p.text-destructive')].map((p) => p.textContent),
  }));
  await page.fill('input[name="name"]', 'Probe Person');
  await page.fill('input[name="email"]', 'probe@example.com');
  await page.fill('textarea[name="message"]', 'Probe message');
  await submit.click();
  let filledError = null;
  try { await page.waitForSelector('p.text-destructive', { timeout: 15000 }); filledError = await page.locator('p.text-destructive').first().textContent(); } catch { filledError = 'TIMEOUT'; }
  await ctx.close();
  return { empty, filledError };
}
(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const [w, h] of VIEWPORTS) {
    const h1 = await shot(browser, HEAD, w, h);
    const h2 = await shot(browser, HEAD, w, h);
    const t1 = await shot(browser, TREE, w, h);
    fs.writeFileSync(`hire-us-page-head-${w}.png`, h1); fs.writeFileSync(`hire-us-page-tree-${w}.png`, t1);
    res[w] = { headVsHead: await diff(browser, h1, h2), headVsTree: await diff(browser, h1, t1), head: await submits(browser, HEAD, w, h), tree: await submits(browser, TREE, w, h) };
    console.log(w, JSON.stringify(res[w]));
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify({ head: HEAD, tree: TREE, viewports: res }, null, 1));
})();
