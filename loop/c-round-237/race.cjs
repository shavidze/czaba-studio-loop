// C round 237: race rows on /studio-lab. usage: node race.cjs <base> <outJson> <modes,comma> [shotPrefix]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const [base, outFile, modesArg, shotPrefix] = process.argv.slice(2);
const modes = (modesArg || 'delay,fail,idle,placement,refusal').split(',');
const sel = '[data-testid="arrangement-status"]';
const LOADING = 'Loading the demo collection…';
const shotDir = path.join(__dirname, 'shots');

async function attempt(browser, w, h, mode, delayMs) {
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  if (mode !== 'idle') {
    for (const pat of ['**/middle-east.mp3', '**/hero-music.mp3']) {
      await page.route(pat, async (route) => {
        await new Promise((r) => setTimeout(r, delayMs));
        if (mode === 'fail' && pat.includes('hero')) await route.fulfill({ status: 404, body: '' });
        else await route.continue().catch(() => {});
      });
    }
  }
  const row = { w, h, mode, delayMs };
  await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(sel, { timeout: 60000 });
  await page.evaluate((s) => {
    window.__st = [];
    const el = document.querySelector(s);
    const rec = () => window.__st.push([Math.round(performance.now()), el.textContent]);
    rec();
    new MutationObserver(rec).observe(el, { childList: true, subtree: true, characterData: true });
  }, sel);
  row.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
  if (mode === 'idle') {
    await page.waitForFunction((s) => /ready/.test(document.querySelector(s).textContent), sel, { timeout: 60000 });
    row.readyText = await page.locator(sel).textContent();
    const item = page.locator('[data-source-id="demo-stem-pulse"]');
    for (let i = 0; i < 40 && (await item.getAttribute('aria-selected')) !== 'true'; i += 1) {
      await item.click(); await page.waitForTimeout(100);
    }
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
    await page.waitForTimeout(1500);
  } else if (mode === 'refusal') {
    const fader = page.getByRole('slider', { name: /^Volume — / }).first();
    await fader.waitFor({ timeout: 60000 });
    await page.waitForTimeout(800);
    row.statusBefore = await page.locator(sel).textContent();
    row.valid = row.statusBefore === LOADING;
    const b = await fader.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 4, b.y + b.height / 2, { steps: 3 });
    await page.keyboard.press('Control+z');
    row.statusAfterCtrlZ = await page.locator(sel).textContent();
    await page.waitForFunction(() => {
      const r = document.querySelector('[data-source-id="demo-hero-music"]');
      return r && /\d\d:\d\d\.\d{3}/.test(r.textContent);
    }, null, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    row.statusAtRelease = await page.locator(sel).textContent();
    row.heroRowAtRelease = await page.locator('[data-source-id="demo-hero-music"]').innerText().catch(() => null);
    await page.mouse.up();
    await page.waitForTimeout(3000);
  } else {
    const sourceId = mode === 'placement' ? 'demo-soft-impact' : 'demo-stem-pulse';
    const item = page.locator(`[data-source-id="${sourceId}"]`);
    for (let i = 0; i < 40 && (await item.getAttribute('aria-selected')) !== 'true'; i += 1) {
      await item.click({ timeout: 60000 }); await page.waitForTimeout(100);
    }
    row.selected = await item.getAttribute('aria-selected');
    row.bpmBefore = await page.locator('[data-testid="arrangement-bars-ruler"]').getAttribute('data-bpm').catch(() => 'absent');
    row.snapBefore = await page.locator('[data-testid="arrangement-grid-control"]').getAttribute('data-snap');
    row.statusBefore = await page.locator(sel).textContent();
    row.valid = row.statusBefore === LOADING;
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click({ timeout: 60000 });
    row.addedAt = await page.evaluate(() => Math.round(performance.now()));
    await page.waitForTimeout(Math.max(7000, delayMs + 3000));
  }
  const status = page.locator(sel);
  const box = await status.boundingBox();
  row.final = await status.textContent();
  row.boxHeight = box ? box.height : null;
  row.lineHeight = await status.evaluate((el) => getComputedStyle(el).lineHeight);
  row.bpm = await page.locator('[data-testid="arrangement-bars-ruler"]').getAttribute('data-bpm').catch(() => 'absent');
  row.snap = await page.locator('[data-testid="arrangement-grid-control"]').getAttribute('data-snap');
  row.history = await page.evaluate(() => window.__st);
  if (row.addedAt) row.readyAfterAdd = row.history.filter(([t, s]) => t >= row.addedAt && s.startsWith('Demo collection ready')).length;
  row.leadingSpace = row.history.some(([, s]) => s.startsWith(' '));
  if (mode === 'fail') row.heroRow = await page.locator('[data-source-id="demo-hero-music"]').innerText().catch(() => 'not-found');
  if (shotPrefix) await page.screenshot({ path: `${shotDir}/${shotPrefix}-${mode}-${w}x${h}.png` });
  row.errors = errors;
  await context.close();
  return row;
}

(async () => {
  const browser = await chromium.launch();
  const warm = await browser.newPage();
  await warm.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await warm.waitForTimeout(15000);
  await warm.close();
  const out = { base, startedUtc: new Date().toISOString(), rows: [] };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const mode of modes) {
      let delay = mode === 'refusal' ? 6000 : 4000;
      for (let n = 0; n < 3; n += 1) {
        const row = await attempt(browser, w, h, mode, delay);
        row.attempt = n + 1;
        out.rows.push(row);
        fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
        if (mode === 'idle' || row.valid) break;
        delay = 8000;
      }
    }
  }
  await browser.close();
})();
