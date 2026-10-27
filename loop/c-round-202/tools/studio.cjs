// C round 202 — STUDIO-NEIGHBOUR. node studio.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path'); const fs = require('fs');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : 720;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const DIR = path.join(F.ROOT, 'out', 'studio', TAG); fs.mkdirSync(DIR, { recursive: true });
const SEL = {
  play: 'button[aria-label="Play"]',
  volume: '[data-track-id=music] input[type=range][aria-label^="Volume — "]',
  pan: '[data-track-id=music] [data-testid=arrangement-track-pan]',
  search: '[data-testid=arrangement-library-search]',
  marker: '[data-testid=arrangement-marker]',
  tempo: '[data-testid=arrangement-tempo-input]',
};
const attr = (p) => p.evaluate(() => document.documentElement.getAttribute('data-focus-source'));
(async () => {
  const browser = await F.launch(); const R = { TAG, controls: {} };
  const { ctx, page, log } = await F.newPage(browser, W, H);
  await page.goto(BASE + '/studio-lab', { waitUntil: 'domcontentloaded' }); await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(500);
  if (!(await page.locator(SEL.marker).count())) { await page.locator('[data-testid=arrangement-marker-add]').click(); await F.sleep(500); await page.keyboard.press('Enter'); await F.sleep(600); }
  R.markers = await page.locator(SEL.marker).count();
  for (const [n, sel] of Object.entries(SEL)) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) { R.controls[n] = 'missing'; continue; }
    await loc.scrollIntoViewIfNeeded(); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(250);
    const b0 = await loc.boundingBox(); const box = [b0.x, b0.y, b0.width, b0.height]; const clip = F.clipFor(box, W, H);
    await page.screenshot({ path: path.join(DIR, `${n}-u.png`), clip });
    await loc.focus(); await page.keyboard.press('Shift+Tab'); await F.sleep(150); await page.keyboard.press('Tab'); await F.sleep(450);
    const same = await loc.evaluate((e) => document.activeElement === e);
    const k = await F.describeActive(page);
    await page.screenshot({ path: path.join(DIR, `${n}-f.png`), clip });
    const ring = F.ringStats(path.join(DIR, `${n}-f.png`), path.join(DIR, `${n}-u.png`), clip, box);
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(250);
    let m = null;
    if (n !== 'play') { // mouse press (play would start transport)
      const cx = n === 'volume' || n === 'pan' ? b0.x + b0.width / 2 : b0.x + Math.min(10, b0.width / 2);
      await page.mouse.click(cx, b0.y + b0.height / 2); await F.sleep(400);
      m = await F.describeActive(page); m = m && { name: m.name.slice(0, 24), os: m.os, ow: m.ow, bs: m.bs.slice(0, 40), fs: m.focusSource };
      await page.keyboard.press('Escape'); await F.sleep(200);
    } else {
      await page.mouse.click(b0.x + b0.width / 2, b0.y + b0.height / 2); await F.sleep(400);
      m = await F.describeActive(page); m = m && { name: m.name.slice(0, 24), os: m.os, ow: m.ow, bs: m.bs.slice(0, 40), fs: m.focusSource };
      await page.keyboard.press('Space'); await F.sleep(300); // stop transport
    }
    R.controls[n] = { same, kbd: { name: k.name.slice(0, 24), os: k.os, ow: k.ow, oo: k.oo, oc: k.oc, bs: k.bs.slice(0, 60), fs: k.focusSource }, ring: { sides: ring.sides, contrast: ring.contrast }, mouse: m };
  }
  // navigation: /studio-lab -> / via CZABA exit link, then / -> /studio-lab via nav link
  await page.mouse.click(W - 3, H - 3); await F.sleep(150);
  R.nav = { inLab: await attr(page) };
  await page.click('[data-testid=arrangement-exit]'); await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 30000 }); await F.sleep(2000);
  R.nav.afterToHome = await attr(page);
  await page.keyboard.press('Tab'); await F.sleep(300); R.nav.homeAfterTab = await attr(page);
  await page.mouse.click(5, 400); await F.sleep(300); R.nav.homeAfterClick = await attr(page);
  await page.locator('header a[href="/studio-lab"], header a[href^="/studio"]').first().click(); await page.waitForURL((u) => new URL(u).pathname.startsWith('/studio'), { timeout: 30000 });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await F.sleep(2000);
  R.nav.labPath = await page.evaluate(() => location.pathname);
  R.nav.afterToLab = await attr(page);
  await page.keyboard.press('Tab'); await F.sleep(300); R.nav.labAfterTab = await attr(page);
  await page.mouse.click(W - 3, H - 3); await F.sleep(300); R.nav.labAfterClick = await attr(page);
  R.nav.navEntries = await page.evaluate(() => performance.getEntriesByType('navigation').length);
  R.errors = log.errors;
  F.save(path.join(DIR, 'result.json'), R);
  console.log(JSON.stringify(R));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
