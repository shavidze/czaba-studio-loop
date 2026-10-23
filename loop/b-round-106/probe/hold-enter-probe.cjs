const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(500);
  await page.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    window.__p = { added: [], keys: [] };
    new MutationObserver((rs) => { for (const r of rs) for (const n of r.addedNodes) if (n.nodeType === 1) window.__p.added.push(n.textContent); }).observe(out, { childList: true, subtree: true });
    window.addEventListener('keydown', (e) => window.__p.keys.push(`${e.key}:${e.repeat}:${document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName}`), true);
  });
  return { browser, page };
}
const state = (p) => p.evaluate(() => ({
  markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((e) => `${e.getAttribute('data-marker-time')}|${e.textContent}`),
  editor: !!document.querySelector('[data-testid=arrangement-marker-name-input]'),
  active: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName,
  undo: document.querySelector('button[title^="Undo"]')?.title ?? null,
  added: window.__p.added, keys: window.__p.keys,
}));
(async () => {
  const res = {};
  for (const [name, testid] of [['plus', 'arrangement-marker-add'], ['prev', 'arrangement-marker-prev']]) {
    const { browser, page } = await open();
    await page.focus(`[data-testid=${testid}]`);
    for (let i = 0; i < 6; i++) { await page.keyboard.down('Enter'); await sleep(40); }
    await page.keyboard.up('Enter');
    await sleep(500);
    res[name] = await state(page);
    await browser.close();
  }
  console.log(JSON.stringify(res, null, 1));
})();
