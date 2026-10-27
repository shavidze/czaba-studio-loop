const F = require('./fl.cjs'); const path = require('path');
(async () => { const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, 1280, 720, {});
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await page.mouse.move(2, 718);
  const snap = () => page.evaluate(() => ({ t: Math.round(performance.now()), sh: document.documentElement.scrollHeight, bodyOv: getComputedStyle(document.body).overflow, htmlOv: getComputedStyle(document.documentElement).overflow, htmlCls: document.documentElement.className, dialogs: [...document.querySelectorAll('[role=dialog],[aria-modal=true]')].map((d) => (d.getAttribute('aria-label') || d.textContent).trim().slice(0, 50)), freeDl: document.body.innerText.includes('FREE DOWNLOAD') }));
  const out = { idle: [] };
  for (let i = 0; i < 6; i++) { out.idle.push(await snap()); await F.sleep(2000); }
  F.save(path.join(__dirname, '..', 'out', 'popupcheck-5173-1280.json'), out); for (const s of out.idle) console.log(JSON.stringify(s));
  await page.screenshot({ path: path.join(__dirname, '..', 'out', 'popupcheck-5173-1280.png') });
  await ctx.close(); await browser.close(); })();
