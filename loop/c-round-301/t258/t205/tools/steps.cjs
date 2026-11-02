// LM-STEPS-205 (+ DEVIATION A-1 failure path). usage: node steps.cjs <port> <W> <ok|fail> <tag>
const L = require('./lib.cjs'); const path = require('path');
const [port, W, mode, tag] = [process.argv[2], +process.argv[3], process.argv[4] || 'ok', process.argv[5] || 'tree'];
(async () => {
  const browser = await L.launch();
  const { ctx, page, log } = await L.newPage(browser, W);
  let subscribeCalls = 0;
  await page.route('**/api/subscribe', async (r) => {
    subscribeCalls++;
    if (mode === 'fail') { await L.sleep(800); return r.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false,"message":"boom"}' }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  const out = { port, W, mode, tag, steps: [] };
  const snap = async (label) => { const a = await L.describeActive(page); const s = await L.state(page);
    const alerts = await page.evaluate(() => [...document.querySelectorAll('[role="alert"]')].map((x) => x.textContent.trim()).filter(Boolean));
    out.steps.push({ label, active: a, alerts, ...s }); console.log(' ', label.padEnd(22), a && `${a.tag}:${a.name}`, 'in', a && a.inDialog, 'fv', a && a.fv, a && a.os + ' ' + a.ow, 'y', s.scrollY, 'top', s.body.top, 'alerts', JSON.stringify(alerts)); return { a, s }; };
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1200);
  await L.scrollTo55(page);
  out.preFocus = await L.focusMidLink(page); await L.sleep(1300);
  const b = await snap('before-open'); out.before = b.s.scrollY;
  out.wait = await L.waitPopup(page); await L.sleep(600);
  await snap('open');
  await page.keyboard.press('Tab'); await L.sleep(400); await snap('tab->FD');
  await page.keyboard.press('Enter'); await L.sleep(600);
  out.emailName = await page.getByRole('dialog', { name: 'CONTINUE TO CLAIM YOUR OFFER' }).count();
  await snap('email-step');
  for (const k of ['Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) { await page.keyboard.press(k); await L.sleep(400); await snap('email ' + k); }
  await page.screenshot({ path: path.join(L.SHOTS, `email-${tag}-${W}.png`) });
  // empty submit via Enter on CONTINUE
  const dlg = page.getByRole('dialog');
  await dlg.getByRole('button', { name: 'CONTINUE' }).focus(); await L.sleep(200); await page.keyboard.press('Enter'); await L.sleep(500);
  await snap('empty-submit');
  await dlg.getByPlaceholder('Enter your email address').focus(); await page.keyboard.type('c205@example.com', { delay: 10 });
  await page.keyboard.press('Tab'); await L.sleep(200); await snap('to-CONTINUE');
  await page.keyboard.press('Enter'); await L.sleep(250); await snap('in-flight+250');
  if (mode === 'fail') {
    await L.sleep(1200); await snap('after-error');
    out.afterError = out.steps.at(-1);
    await page.keyboard.press('Tab'); await L.sleep(300); await snap('err Tab');
    await page.keyboard.press('Shift+Tab'); await L.sleep(300); await snap('err Shift+Tab');
    await page.keyboard.press('Escape'); await L.sleep(400); await snap('err Escape');
    await L.sleep(1400); const f = await snap('err Escape+1800');
    out.final = { popup: f.s.popup, scrollY: f.s.scrollY, active: f.a, lm: f.s.lm };
  } else {
    await L.sleep(1200);
    out.successName = await page.getByRole('dialog', { name: "We've sent your free mystery pack to your email!" }).count();
    await snap('success-step');
    for (const k of ['Tab', 'Tab', 'Shift+Tab']) { await page.keyboard.press(k); await L.sleep(400); await snap('success ' + k); }
    await page.screenshot({ path: path.join(L.SHOTS, `success-${tag}-${W}.png`) });
    await dlg.getByRole('button', { name: 'BACK TO SITE' }).focus(); await page.keyboard.press('Enter'); await L.sleep(300); await snap('back+300');
    await L.sleep(1500); const f = await snap('back+1800');
    out.final = { popup: f.s.popup, scrollY: f.s.scrollY, active: f.a, lm: f.s.lm };
  }
  out.subscribeCalls = subscribeCalls; out.log = log;
  L.save(path.join(L.OUT, 'steps', `${mode}-${tag}-${W}.json`), out);
  console.log(tag, W, mode, 'pre', out.preFocus, 'before', out.before, 'emailName', out.emailName, 'successName', out.successName, 'calls', subscribeCalls, 'final', JSON.stringify({ ...out.final, active: out.final.active && out.final.active.name }), 'errors', JSON.stringify(log.errors));
  await browser.close();
})();
