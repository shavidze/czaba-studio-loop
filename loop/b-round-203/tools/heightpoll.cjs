const F = require('./fl.cjs'); const path = require('path');
(async () => { const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, 1280, 720, {});
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await page.mouse.move(2, 718);
  await page.keyboard.press('End'); await F.sleep(2500);
  await page.evaluate(() => { window.__p = []; const t0 = performance.now(); const f = () => { window.__p.push([Math.round(performance.now() - t0), Math.round(scrollY), document.documentElement.scrollHeight, (document.activeElement.textContent || '').trim().slice(0, 16)]); if (window.__p.length < 600) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  for (let i = 0; i < 2; i++) { await page.keyboard.press('Shift+Tab'); await F.sleep(1500); }
  const p = await page.evaluate(() => window.__p);
  const ch = p.filter((r, i) => i === 0 || r[1] !== p[i - 1][1] || r[2] !== p[i - 1][2] || r[3] !== p[i - 1][3]);
  F.save(path.join(__dirname, '..', 'out', 'heightpoll-5173-1280.json'), { changes: ch, minHeight: Math.min(...p.map((r) => r[2])) });
  console.log('minHeight', Math.min(...p.map((r) => r[2]))); for (const r of ch.slice(0, 30)) console.log(JSON.stringify(r));
  await ctx.close(); await browser.close(); })();
