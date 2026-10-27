// SCROLL-LOCK-205 (d): /studio-lab Export dialog (ui/Modal) open/close + workspace responds. usage: node exportd.cjs <port> <W> <tag>
const L = require('./lib.cjs'); const path = require('path');
const [port, W, tag] = [process.argv[2], +process.argv[3], process.argv[4]];
let r0 = {};
const play = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label]')].find((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label'))); return b && b.getAttribute('aria-label'); });
const act = (page) => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ':' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 30) : null; });
(async () => {
  const browser = await L.launch(); const res = [];
  for (const how of ['esc', 'x']) {
    const { page, log } = await L.newPage(browser, W, { suppress: true });
    await page.goto(`http://127.0.0.1:${port}/studio-lab`, { waitUntil: 'networkidle' }).catch(() => {}); await L.sleep(3000);
    await page.locator('button').filter({ hasText: /^\s*Add\s*$/ }).first().click(); await L.sleep(1500);
    const clips = await page.evaluate(() => document.body.innerText.includes('Nothing to play'));
    const before = (await L.state(page)).scrollY;
    await page.getByRole('button', { name: /^Export/ }).first().click(); await L.sleep(700);
    const dlg = page.getByRole('dialog', { name: 'Export' }); const dlgCount = await dlg.count(); const openBody = (await L.state(page)).body;
    if (how === 'esc') await page.keyboard.press('Escape'); else await dlg.getByRole('button', { name: /close/i }).first().click();
    await L.sleep(800);
    const s = await L.state(page); const dlgAfter = await page.getByRole('dialog', { name: 'Export' }).count(); const focusAfter = await act(page);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const p0 = await play(page); await page.keyboard.press('Space'); await L.sleep(900); const p1 = await play(page);
    const pos1 = await page.evaluate(() => document.body.innerText.match(/\d+:\d{2}[.:]\d{1,3}/g)?.slice(0, 2));
    await page.keyboard.press('Space'); await L.sleep(600); const p2 = await play(page);
    r0 = { pos1, nothingToPlayAfterAdd: clips };
    await page.screenshot({ path: path.join(L.SHOTS, `export-${how}-${tag}-${W}.png`) });
    const r = { ...r0, how, before, dlgCount, openBody, after: s.scrollY, body: s.body, dlgAfter, focusAfter, play: [p0, p1, p2], errors: log.errors };
    r.ok = dlgCount === 1 && dlgAfter === 0 && s.scrollY === before && ['position', 'overflow', 'top', 'width'].every((k) => s.body[k] === '') && p0 === 'Play' && p1 === 'Pause' && p2 === 'Play';
    res.push(r); console.log(tag, W, JSON.stringify(r)); await page.close();
  }
  L.save(path.join(L.OUT, 'scrolllock', `export-${tag}-${W}.json`), res); await browser.close();
})();
