// LM-CLOSE-205. usage: node close.cjs <port> <W> <esc|click|enter> <tag>
const L = require('./lib.cjs'); const path = require('path');
const [port, W, method, tag] = [process.argv[2], +process.argv[3], process.argv[4], process.argv[5] || 'tree'];
(async () => {
  const browser = await L.launch();
  const { ctx, page, log } = await L.newPage(browser, W);
  const out = { port, W, method, tag, steps: [] };
  const snap = async (label) => { const a = await L.describeActive(page); const s = await L.state(page); out.steps.push({ label, active: a, ...s }); return { a, s }; };
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1200);
  await L.scrollTo55(page);
  out.preFocus = await L.focusMidLink(page); await L.sleep(1300);
  const before = await snap('before-open');
  out.before = before.s.scrollY;
  out.wait = await L.waitPopup(page); await L.sleep(600);
  const open = await snap('open');
  out.openTop = open.s.body.top;
  if (method === 'esc') await page.keyboard.press('Escape');
  else if (method === 'enter') { await page.getByRole('button', { name: 'Close' }).focus(); await page.keyboard.press('Enter'); }
  else { const b = await page.locator('button[aria-label="Close"]').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }
  await L.sleep(300); const c3 = await snap('close+300');
  await L.sleep(1500); const c18 = await snap('close+1800');
  await page.screenshot({ path: path.join(L.SHOTS, `close-${method}-${tag}-${W}.png`) });
  // Lenis wheel after close
  await page.mouse.move(W / 2, L.H(W) / 2); await page.mouse.wheel(0, 300); await L.sleep(1500);
  out.afterWheel = (await L.state(page)).scrollY;
  out.lm = c18.s.lm;
  // reload: popup must not come back
  await page.reload({ waitUntil: 'networkidle' }).catch(() => {}); await L.sleep(1200);
  await L.scrollTo55(page); await L.sleep(9500);
  out.reloadPopup = await L.popupVisible(page);
  out.log = log;
  const ok = {
    popupGone: !c3.s.popup && !c18.s.popup,
    dismissed: JSON.parse(c18.s.lm || '{}').dismissed === true,
    y300: Math.abs(c3.s.scrollY - out.before) <= 2, y1800: Math.abs(c18.s.scrollY - out.before) <= 2,
    openTop: out.openTop === `-${out.before}px`,
    bodyCleared: Object.entries(c18.s.body).filter(([k]) => k !== 'paddingRight').every(([, v]) => v === ''),
    focusBack: !!(c18.a && c18.a.name === out.preFocus && !c18.a.inDialog), onScreen: !!(c18.a && c18.a.onScreen),
    wheelMoves: out.afterWheel !== c18.s.scrollY, noReloadPopup: !out.reloadPopup,
  };
  out.ok = ok;
  L.save(path.join(L.OUT, 'close', `${method}-${tag}-${W}.json`), out);
  console.log(tag, W, method, 'pre', out.preFocus, 'before', out.before, 'openTop', out.openTop, 'y', c3.s.scrollY, c18.s.scrollY, 'wheel', out.afterWheel, 'active', c18.a && `${c18.a.tag}:${c18.a.name} fv ${c18.a.fv}`, 'body', JSON.stringify(c18.s.body), 'lm', c18.s.lm);
  console.log(' OK', JSON.stringify(ok), 'errors', JSON.stringify(log.errors));
  await browser.close();
})();
