// LM-EXIT-205. usage: node exit.cjs <port> <W>
const L = require('./lib.cjs'); const path = require('path');
const [port, W] = [process.argv[2], +process.argv[3]];
(async () => {
  const browser = await L.launch(); const { page, log } = await L.newPage(browser, W);
  const out = { port, W, steps: [] };
  const snap = async (label) => { const a = await L.describeActive(page); const s = await L.state(page); out.steps.push({ label, active: a, ...s, t: Date.now() - t0 }); console.log(' ', label.padEnd(16), a && `${a.tag}:${a.name}`, 'in', a && a.inDialog, 'fv', a && a.fv, 'popup', s.popup, 'dlg', s.dialogs, 'y', s.scrollY, 'top', s.body.top, 't', Date.now() - t0); return { a, s }; };
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await L.sleep(1500); await L.declineCookies(page);
  await page.evaluate(() => window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.45)));
  await L.sleep(1300);
  out.preFocus = await L.focusMidLink(page); await L.sleep(300);
  const b = await snap('before'); out.before = b.s.scrollY;
  // real mouse: move inside, then up to y=0 and out of the viewport
  await page.mouse.move(W / 2, 300); await page.mouse.move(W / 2, 1, { steps: 5 }); await page.mouse.move(W / 2, -20, { steps: 3 });
  const tExit = Date.now() - t0;
  let vis = false; for (let i = 0; i < 20; i++) { if (await L.popupVisible(page)) { vis = true; break; } await L.sleep(50); }
  out.realMouseOpened = vis; out.exitAtMs = tExit;
  if (!vis) { console.log('real mouse did not trigger; dispatching document mouseleave clientY 0'); out.synthetic = true;
    await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, bubbles: false }))); await L.sleep(300); }
  await L.sleep(300);
  out.byName = await page.getByRole('dialog', { name: 'Get Your Tracks, Sound Effects & More' }).count();
  await snap('opened');
  await page.keyboard.press('Escape'); await L.sleep(300); await snap('esc+300'); await L.sleep(1500); const f = await snap('esc+1800');
  out.ok = { openedBeforeTimer: tExit < 8000, byName: out.byName === 1, focusClose: out.steps[1].active && out.steps[1].active.name === 'Close', restored: f.a && f.a.name === out.preFocus, y: Math.abs(f.s.scrollY - out.before) <= 2, gone: !f.s.popup };
  L.save(path.join(L.OUT, `exit-${W}.json`), { ...out, log }); console.log(JSON.stringify(out.ok), 'real', out.realMouseOpened, 'errors', JSON.stringify(log.errors));
  await browser.close();
})();
