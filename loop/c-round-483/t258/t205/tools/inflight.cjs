// in-flight submit: where do Tab / Escape go while isSubmitting (focus on body)? usage: node inflight.cjs <port> <W>
const L = require('./lib.cjs'); const path = require('path');
const [port, W] = [process.argv[2], +process.argv[3]];
(async () => {
  const browser = await L.launch(); const { page, log } = await L.newPage(browser, W);
  await page.route('**/api/subscribe', async (r) => { await L.sleep(4000); r.fulfill({ status: 500, contentType: 'application/json', body: '{}' }); });
  const out = { port, W, steps: [] };
  const snap = async (label) => { const a = await L.describeActive(page); const s = await L.state(page); out.steps.push({ label, active: a, ...s }); console.log(' ', label.padEnd(16), a && `${a.tag}:${a.name}`, 'in', a && a.inDialog, 'popup', s.popup, 'y', s.scrollY); };
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1200); await L.scrollTo55(page);
  await L.focusMidLink(page); await L.sleep(500);
  await L.waitPopup(page); await L.sleep(600);
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await L.sleep(600);
  await page.keyboard.type('c205@example.com'); await page.keyboard.press('Enter'); await L.sleep(300);
  await snap('in-flight');
  await page.keyboard.press('Tab'); await L.sleep(300); await snap('in-flight Tab');
  await page.keyboard.press('Tab'); await L.sleep(300); await snap('in-flight Tab2');
  await page.keyboard.press('Escape'); await L.sleep(300); await snap('in-flight Esc');
  await L.sleep(4000); await snap('after-error');
  L.save(path.join(L.OUT, 'steps', `inflight-${W}.json`), out); console.log('errors', JSON.stringify(log.errors));
  await browser.close();
})();
