// C round 238: independent race/refusal rows on /studio-lab.
// usage: node race238.cjs <base> <outJson> <modes,comma> [shotPrefix]
// modes: refusal, refusalfail, refusalready, delay, fail, idle, placement, l1probe
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const [base, outFile, modesArg, shotPrefix] = process.argv.slice(2);
const modes = modesArg.split(',');
const sel = '[data-testid="arrangement-status"]';
const LOADING = 'Loading the demo collection…';
const READY = 'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.';
const UNDO_REFUSAL = 'Undo/Redo does not work while dragging — let go first.';
const FAILED1 = '1 sound in the demo collection failed to load — details are in the library.';
const shotDir = path.join(__dirname, 'shots');
fs.mkdirSync(shotDir, { recursive: true });
const st = (page) => page.locator(sel).textContent();
const now = (page) => page.evaluate(() => Math.round(performance.now()));

async function attempt(browser, w, h, mode, delayMs) {
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const delayed = !['idle', 'refusalready'].includes(mode);
  if (delayed) {
    for (const pat of ['**/middle-east.mp3', '**/hero-music.mp3']) {
      await page.route(pat, async (route) => {
        await new Promise((r) => setTimeout(r, delayMs));
        if ((mode === 'fail' || mode === 'refusalfail') && pat.includes('hero')) await route.fulfill({ status: 404, body: '' });
        else await route.continue().catch(() => {});
      });
    }
  }
  const row = { w, h, mode, delayMs: delayed ? delayMs : 0 };
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
    row.readyText = await st(page);
    row.valid = true;
    const item = page.locator('[data-source-id="demo-stem-pulse"]');
    for (let i = 0; i < 40 && (await item.getAttribute('aria-selected')) !== 'true'; i += 1) { await item.click(); await page.waitForTimeout(100); }
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
    await page.waitForTimeout(1500);
  } else if (mode.startsWith('refusal') || mode === 'l1probe') {
    const fader = page.getByRole('slider', { name: /^Volume — / }).first();
    await fader.waitFor({ timeout: 60000 });
    if (mode === 'refusalready' || mode === 'l1probe') await page.waitForFunction((q) => document.querySelector(q).textContent.startsWith('Demo collection ready'), sel, { timeout: 60000 });
    await page.waitForTimeout(800);
    row.statusBefore = await st(page);
    const b = await fader.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 4, b.y + b.height / 2, { steps: 3 });
    await page.keyboard.press('Control+z');
    row.refusalShown = await page.waitForFunction((a) => document.querySelector(a[0]).textContent === a[1], [sel, UNDO_REFUSAL], { timeout: 1500 }).then(() => true).catch(() => false);
    row.statusAfterCtrlZ = await st(page);
    row.refusalAt = await now(page);
    if (mode === 'l1probe') {
      // try a UI path that adds a seeding clip while the gesture is held
      await page.locator('[data-source-id="demo-stem-pulse"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(800);
      row.statusAfterEnterDuringHold = await st(page);
      row.clipsDuringHold = await page.locator('[data-clip-kind="audio"]').count();
      row.valid = row.refusalShown;
    } else if (mode === 'refusalfail') {
      row.settledWhileHeld = await page.waitForFunction((a) => document.querySelector(a[0]).textContent === a[1], [sel, FAILED1], { timeout: 60000 }).then(() => true).catch(() => false);
      await page.waitForTimeout(1500);
      row.valid = row.statusBefore === LOADING && row.refusalShown && row.settledWhileHeld;
    } else if (mode === 'refusal') {
      row.heroDecodedBeforeRelease = await page.waitForFunction(() => {
        const r = document.querySelector('[data-source-id="demo-hero-music"]');
        return r && /\d\d:\d\d\.\d{3}/.test(r.textContent);
      }, null, { timeout: 60000 }).then(() => true).catch(() => false);
      await page.waitForTimeout(1500);
      row.valid = row.statusBefore === LOADING && row.refusalShown && row.heroDecodedBeforeRelease;
    } else {
      await page.waitForTimeout(1500);
      row.valid = row.statusBefore === READY && row.refusalShown;
    }
    row.statusAtRelease = await st(page);
    row.heroRowAtRelease = await page.locator('[data-source-id="demo-hero-music"]').innerText().catch(() => null);
    row.releaseAt = await now(page);
    await page.mouse.up();
    await page.waitForTimeout(3000);
  } else {
    const sourceId = mode === 'placement' ? 'demo-soft-impact' : 'demo-stem-pulse';
    const item = page.locator(`[data-source-id="${sourceId}"]`);
    for (let i = 0; i < 40 && (await item.getAttribute('aria-selected')) !== 'true'; i += 1) { await item.click({ timeout: 60000 }); await page.waitForTimeout(100); }
    row.bpmBefore = await page.locator('[data-testid="arrangement-bars-ruler"]').getAttribute('data-bpm').catch(() => 'absent');
    row.snapBefore = await page.locator('[data-testid="arrangement-grid-control"]').getAttribute('data-snap');
    row.statusBefore = await st(page);
    row.valid = row.statusBefore === LOADING;
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click({ timeout: 60000 });
    row.addedAt = await now(page);
    await page.waitForTimeout(Math.max(7000, delayMs + 3000));
  }
  const status = page.locator(sel);
  const box = await status.boundingBox();
  row.final = await status.textContent();
  row.boxHeight = box ? box.height : null;
  row.bpm = await page.locator('[data-testid="arrangement-bars-ruler"]').getAttribute('data-bpm').catch(() => 'absent');
  row.snap = await page.locator('[data-testid="arrangement-grid-control"]').getAttribute('data-snap');
  row.history = await page.evaluate(() => window.__st);
  if (row.addedAt) row.readyAfterAdd = row.history.filter(([t, s]) => t >= row.addedAt && s.startsWith('Demo collection ready')).length;
  if (row.releaseAt) {
    row.afterRelease = row.history.filter(([t]) => t >= row.releaseAt).map(([, s]) => s);
    row.loadingAfterRelease = row.afterRelease.filter((s) => s === LOADING).length;
    row.loadingAfterRefusal = row.history.filter(([t, s]) => t >= row.refusalAt && s === LOADING).length;
  }
  row.leadingSpace = row.history.some(([, s]) => s.startsWith(' '));
  if (mode === 'fail' || mode === 'refusalfail') row.heroRow = await page.locator('[data-source-id="demo-hero-music"]').innerText().catch(() => 'not-found');
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
  const out = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : { base, rows: [] };
  out.chromium = browser.version();
  out.startedUtc = new Date().toISOString();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const mode of modes) {
      let delay = mode.startsWith('refusal') ? 6000 : 4000;
      for (let n = 0; n < 3; n += 1) {
        const row = await attempt(browser, w, h, mode, delay);
        row.attempt = n + 1;
        out.rows.push(row);
        fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
        console.log(mode, w, 'attempt', n + 1, 'valid', row.valid, '|', row.final);
        if (row.valid) break;
        delay = mode.startsWith('refusal') ? 10000 : 8000;
      }
    }
  }
  await browser.close();
})();
