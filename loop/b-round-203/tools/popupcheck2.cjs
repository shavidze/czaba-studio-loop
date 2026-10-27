const F = require('./fl.cjs'); const path = require('path');
(async () => { const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, 1280, 720, {});
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await page.mouse.move(2, 718);
  const snap = (label) => page.evaluate((label) => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { label, t: Math.round(performance.now()), sy: Math.round(scrollY), sh: document.documentElement.scrollHeight, bodyPos: document.body.style.position, freeDl: /FREE DOWNLOAD/i.test(document.body.innerText), active: (a.textContent || a.tagName).trim().slice(0, 24), activeInPopup: !!(a.closest('[class*="fixed"]') && /FREE DOWNLOAD/i.test(a.closest('[class*="fixed"]').innerText)), activeTop: Math.round(r.top) }; }, label);
  const out = [await snap('start')];
  await page.keyboard.press('End'); for (let i = 0; i < 6; i++) { await F.sleep(1000); out.push(await snap('after End +' + (i + 1) + 's')); }
  await page.keyboard.press('Tab'); await F.sleep(600); out.push(await snap('Tab'));
  await page.keyboard.press('Tab'); await F.sleep(600); out.push(await snap('Tab2'));
  await page.screenshot({ path: path.join(__dirname, '..', 'out', 'popupcheck2-5173-1280.png') });
  F.save(path.join(__dirname, '..', 'out', 'popupcheck2-5173-1280.json'), out); for (const s of out) console.log(JSON.stringify(s));
  await ctx.close(); await browser.close(); })();
