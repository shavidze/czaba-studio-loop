// LM-OPEN-205 + LM-TAB-205. usage: node opentab.cjs <port> <W> <tag>
const L = require('./lib.cjs'); const path = require('path');
const [port, W, tag] = [process.argv[2], +process.argv[3], process.argv[4] || 'tree'];
(async () => {
  const browser = await L.launch();
  const { ctx, page, log } = await L.newPage(browser, W);
  const out = { port, W, tag, steps: [] };
  const snap = async (label) => { const a = await L.describeActive(page); const s = await L.state(page); out.steps.push({ label, active: a, ...s }); return a; };
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1200);
  await L.scrollTo55(page);
  out.preFocus = await L.focusMidLink(page); await L.sleep(300);
  await snap('before-open');
  const w = await L.waitPopup(page); out.wait = { ...w, sinceLoadMs: Date.now() - t0 };
  await L.sleep(500);
  out.dialogByName = await page.getByRole('dialog', { name: 'Get Your Tracks, Sound Effects & More' }).count();
  out.dialogAny = await page.getByRole('dialog').count();
  await snap('open');
  await page.screenshot({ path: path.join(L.SHOTS, `open-${tag}-${W}.png`) });
  for (const k of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) { await page.keyboard.press(k); await L.sleep(1200); await snap(k); }
  await page.screenshot({ path: path.join(L.SHOTS, `tab-${tag}-${W}.png`) });
  // mouse click on the CZABA wordmark (non-focusable)
  const wm = await page.evaluate(() => { const s = [...document.querySelectorAll('span')].find((x) => x.textContent.trim() === 'CZABA' && x.closest('div.fixed')); if (!s) return null; const r = s.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  out.wordmark = wm;
  if (wm) { await page.mouse.click(wm[0], wm[1]); await L.sleep(400); await snap('wordmark-click'); }
  for (const k of ['Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) { await page.keyboard.press(k); await L.sleep(1200); await snap('post-click ' + k); }
  out.log = log;
  L.save(path.join(L.OUT, 'opentab', `${tag}-${W}.json`), out);
  console.log(tag, W, 'wait', JSON.stringify(out.wait), 'byName', out.dialogByName, 'any', out.dialogAny, 'pre', out.preFocus);
  for (const s of out.steps) console.log(' ', s.label.padEnd(18), s.active && `${s.active.tag}:${s.active.name}`, 'in', s.active && s.active.inDialog, 'fv', s.active && s.active.fv, s.active && `${s.active.os} ${s.active.ow} ${s.active.oc} off ${s.active.oo}`, 'y', s.scrollY, 'top', s.body.top, 'dlg', s.dialogs, s.modal.join());
  console.log(' errors', JSON.stringify(log.errors));
  await browser.close();
})();
