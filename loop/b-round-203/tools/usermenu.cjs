// B planning probe: signed-in user menu keyboard path. node usermenu.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : 720;
const st = () => { const a = document.activeElement; const m = document.getElementById('header-user-menu') || [...document.querySelectorAll('div')].find((d) => d.textContent.trim().startsWith('Hi,') && d.className.includes('absolute')); const b = document.querySelector('button[aria-label="User menu"]'); let o = 1, n = a; while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } return { active: a && (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 20)), eff: +o.toFixed(2), outline: a && getComputedStyle(a).outlineStyle, expanded: b && b.getAttribute('aria-expanded'), menuVis: m && getComputedStyle(m).visibility, menuOp: m && getComputedStyle(m).opacity }; };
(async () => {
  const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, W, H, {});
  await page.addInitScript(() => localStorage.setItem('auth_user', JSON.stringify({ id: 7, firstName: 'Ana', lastName: 'Test', email: 'ana@example.com' })));
  await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await page.mouse.move(2, H - 2);
  const log = [];
  log.push(['initial', await page.evaluate(st)]);
  for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); await F.sleep(250); const s = await page.evaluate(st); if (s.active === 'User menu') { log.push(['tab->button', s]); break; } }
  await page.keyboard.press('Tab'); await F.sleep(300); log.push(['tab past closed', await page.evaluate(st)]);
  await page.keyboard.press('Shift+Tab'); await F.sleep(300);
  await page.keyboard.press('Enter'); await F.sleep(400); log.push(['enter', await page.evaluate(st)]);
  for (const k of ['Tab', 'Tab', 'Tab', 'Tab']) { await page.keyboard.press(k); await F.sleep(300); log.push([k, await page.evaluate(st)]); }
  await page.keyboard.press('Escape'); await F.sleep(400); log.push(['escape', await page.evaluate(st)]);
  await page.keyboard.press('Space'); await F.sleep(400); log.push(['space', await page.evaluate(st)]);
  await page.keyboard.press('Space'); await F.sleep(400); log.push(['space2', await page.evaluate(st)]);
  await page.keyboard.press('Enter'); await F.sleep(300);
  for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); await F.sleep(250); }
  log.push(['tab out x5', await page.evaluate(st)]);
  const b = await page.locator('button[aria-label="User menu"]').boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await F.sleep(500); log.push(['hover', await page.evaluate(st)]);
  await page.mouse.move(2, H - 2); await F.sleep(500); log.push(['unhover', await page.evaluate(st)]);
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await F.sleep(400); await page.mouse.move(600, 500); await F.sleep(400); log.push(['click open, mouse away', await page.evaluate(st)]);
  await page.mouse.click(600, 500); await F.sleep(400); log.push(['click outside', await page.evaluate(st)]);
  F.save(path.join(__dirname, '..', 'out', `usermenu-${PORT}-${W}.json`), log);
  for (const l of log) console.log(W, JSON.stringify(l));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
