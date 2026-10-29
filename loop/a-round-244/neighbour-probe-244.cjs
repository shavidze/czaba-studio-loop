// B round-244 neighbour probe (copied from b-round-242/focus-probe-243.cjs): focus return after a right-click grid menu, one origin per class
// released by releaseEditFocusOnTimelinePointerDown. usage: node focus-probe-243.cjs <base> <outFile>
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const base = process.argv[2];
const outFile = process.argv[3];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = { base, started: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(outFile, JSON.stringify(R, null, 1));

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),
    undefined,
    { timeout: 120000 },
  );
  await sleep(600);
  await page.evaluate(() => {
    window.__log = [];
    const d = (e) => { const a = e.target; return a && a.getAttribute ? (a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.tagName) : String(a); };
    for (const t of ['pointerdown', 'mousedown', 'contextmenu']) window.addEventListener(t, (e) => window.__log.push(`${t}[b${e.button}] active=${d({ target: document.activeElement })}`), true);
    window.addEventListener('focusin', (e) => window.__log.push(`in:${d(e)}`), true);
    window.addEventListener('focusout', (e) => window.__log.push(`out:${d(e)}`), true);
  });
  return { ctx, page, errors };
}
const desc = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return { el: 'BODY' };
  return { el: a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.tagName, tag: a.tagName, type: a.getAttribute('type'), label: a.getAttribute('aria-label'), focusVisible: a.matches(':focus-visible'), outline: getComputedStyle(a).outline };
});
async function emptyLanePoint(page) {
  return page.evaluate(() => {
    for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) {
      const r = body.getBoundingClientRect();
      for (const fx of [0.9, 0.75, 0.6, 0.45, 0.3]) {
        const x = r.left + r.width * fx; const y = r.top + r.height / 2;
        if (x <= 0 || x >= innerWidth - 20 || y <= 0 || y >= innerHeight - 10) continue;
        if (document.elementFromPoint(x, y) === body) return { x, y, track: body.closest('[data-track-id]').getAttribute('data-track-id') };
      }
    }
    return null;
  });
}
async function tabUntil(page, predicateSrc, max = 160) {
  await page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); document.body.focus(); });
  for (let i = 1; i <= max; i += 1) {
    await page.keyboard.press('Tab');
    const ok = await page.evaluate(predicateSrc);
    if (ok) return i;
  }
  return -1;
}
async function addPulse(page) {
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(900);
}
async function menuCycle(page, action) {
  const pt = await emptyLanePoint(page);
  if (!pt) return { error: 'no empty lane point' };
  await page.evaluate(() => { window.__log.length = 0; });
  await page.mouse.click(pt.x, pt.y, { button: 'right' });
  await sleep(400);
  const opened = await page.getByTestId('arrangement-grid-menu').count();
  if (action === 'escape') await page.keyboard.press('Escape');
  else await page.getByTestId('arrangement-grid-menu').getByRole('menuitemradio', { name: action }).click();
  await sleep(400);
  return { pt, opened, final: await desc(page), log: await page.evaluate(() => window.__log.slice()) };
}

const markersCount = (page) => page.getByTestId('arrangement-marker').count();
(async () => {
  const browser = await chromium.launch();
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const name of ['leftClick', 'choice', 'detached']) {
      const key = `${name}@${k}`;
      try {
        const { ctx, page, errors } = await open(browser, vp);
        let row = {};
        if (name === 'detached') {
          row = await page.evaluate(() => { const d = document.createElement('div'); d.setAttribute('data-group-id', 'g'); const i = document.createElement('input'); d.appendChild(i); document.body.appendChild(d); const attached = i.closest('[data-group-id]') !== null; d.removeChild(i); return { attached, detached: i.closest('[data-group-id]') !== null, isConnected: i.isConnected }; });
        } else {
          await page.evaluate(() => document.body.focus());
          await page.keyboard.press('KeyM'); await sleep(500);
          const before = await desc(page);
          if (name === 'leftClick') {
            const pt = await emptyLanePoint(page);
            await page.mouse.click(pt.x, pt.y); await sleep(400);
            row = { before, final: await desc(page), markers: await markersCount(page), menu: await page.getByTestId('arrangement-grid-menu').count() };
          } else {
            const cyc = await menuCycle(page, '0.5 s');
            row = { before, ...cyc, markers: await markersCount(page), grid: await page.getByTestId('arrangement-grid-control').getAttribute('data-grid-seconds') };
          }
        }
        await page.screenshot({ path: outFile.replace(/\.json$/, `-${name}-${k}.png`) });
        R.rows[key] = { ...row, errors };
        await ctx.close();
      } catch (e) { R.rows[key] = { error: String(e).slice(0, 400) }; }
      save();
      console.log(key, JSON.stringify(R.rows[key]).slice(0, 300));
    }
  }
  await browser.close(); save();
})();
