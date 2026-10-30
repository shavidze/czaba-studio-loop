// SCROLL-LOCK-205 (a)-(d). usage: node scrolllock.cjs <port> <W> <tag>
const L = require('./lib.cjs'); const path = require('path');
const [port, W, tag] = [process.argv[2], +process.argv[3], process.argv[4] || 'tree'];
const base = `http://127.0.0.1:${port}`;
async function authCase(browser, urlPath, target, how) {
  const { page, log } = await L.newPage(browser, W, { suppress: true });
  await page.goto(base + urlPath, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1500);
  await page.evaluate((y) => window.scrollTo(0, y), target); await L.sleep(1500);
  const before = (await L.state(page)).scrollY;
  // programmatic click: the header is not sticky at mid-page (real pointer/Tab would scroll to 0 first; see hdr.cjs)
  await page.evaluate(() => { [...document.querySelectorAll('header button')].find((e) => e.textContent.trim() === 'Sign In').click(); }); await L.sleep(600);
  const openS = await L.state(page);
  const emailInputs = await page.locator('[aria-label="Close"]:visible').count();
  if (how === 'esc') await page.keyboard.press('Escape');
  else { const c = page.locator('[aria-label="Close"]:visible').first(); await c.click(); }
  await L.sleep(300); const s3 = await L.state(page); await L.sleep(1500); const s18 = await L.state(page);
  const modalGone = (await page.locator('[aria-label="Close"]:visible').count()) === 0;
  await page.close();
  const r = { urlPath, how, target, before, openTop: openS.body.top, emailInputsOpen: emailInputs, after300: s3.scrollY, after1800: s18.scrollY, body: s18.body, modalGone, errors: log.errors };
  r.ok = Math.abs(r.after300 - before) <= 2 && Math.abs(r.after1800 - before) <= 2 && r.openTop === `-${before}px` && emailInputs >= 1 && modalGone && ['position', 'overflow', 'top', 'width'].every((k) => s18.body[k] === '');
  return r;
}
async function exportCase(browser, how) {
  const { page, log } = await L.newPage(browser, W, { suppress: true });
  await page.goto(base + '/studio-lab', { waitUntil: 'networkidle' }).catch(() => {});
  await L.sleep(3000);
  const before = (await L.state(page)).scrollY;
  const btn = page.getByRole('button', { name: /^Export/ }).first();
  const btnName = await btn.getAttribute('aria-label') || await btn.textContent();
  await btn.click(); await L.sleep(600);
  const dlgCount = await page.getByRole('dialog', { name: 'Export' }).count();
  const openS = await L.state(page);
  if (how === 'esc') await page.keyboard.press('Escape');
  else await page.getByRole('dialog', { name: 'Export' }).getByRole('button', { name: /close/i }).first().click();
  await L.sleep(800);
  const after = await L.state(page);
  const dlgAfter = await page.getByRole('dialog', { name: 'Export' }).count();
  // workspace responds: Space toggles playback (read a play/stop button aria-pressed or label)
  const playState = () => page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label]')].find((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label'))); return b ? b.getAttribute('aria-label') + '|' + (document.activeElement && (document.activeElement.getAttribute('aria-label') || document.activeElement.tagName)) : null; });
  const p0 = await playState(); await page.keyboard.press('Space'); await L.sleep(700); const p1 = await playState(); await page.keyboard.press('Space'); await L.sleep(500); const p2 = await playState();
  await page.screenshot({ path: path.join(L.SHOTS, `export-${how}-${tag}-${W}.png`) });
  await page.close();
  const r = { how, btnName, before, dlgCount, openBody: openS.body, after: after.scrollY, body: after.body, dlgAfter, play: [p0, p1, p2], errors: log.errors };
  r.ok = dlgCount === 1 && dlgAfter === 0 && after.scrollY === before && ['position', 'overflow', 'top', 'width'].every((k) => after.body[k] === '') && p0 !== p1 && p1 !== p2;
  return r;
}
(async () => {
  const browser = await L.launch();
  const res = [];
  res.push(await authCase(browser, '/', 1500, 'esc'));
  res.push(await authCase(browser, '/', 1500, 'x'));
  res.push(await authCase(browser, '/store', 800, 'esc'));
  res.push(await authCase(browser, '/store', 800, 'x'));
  L.save(path.join(L.OUT, 'scrolllock', `${tag}-${W}.json`), res);
  for (const r of res) console.log(tag, W, JSON.stringify(r));
  await browser.close();
})();
