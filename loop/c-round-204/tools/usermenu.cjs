// USERMENU-204 (signed-in seam). node usermenu.cjs <port> <W> <label>
const L = require('./lib.cjs'); const path = require('path');
const [PORT, Ws, LABEL] = process.argv.slice(2); const W = +Ws; const Hh = L.H(W);
const st = (page) => page.evaluate(`(() => { const b = document.querySelector('button[aria-label="User menu"]'); const m = document.getElementById('header-user-menu') || [...b.parentElement.querySelectorAll('div')].find((d) => d.textContent.trim().startsWith('Hi,')); const a = document.activeElement; const d = (${L.DESCRIBE})(a); return { active: d && d.name, tag: d && d.tag, eff: d && d.eff, ring: d && [d.os, d.ow, d.oo, d.oc, d.bs, d.bg], fv: d && d.fv, expanded: b.getAttribute('aria-expanded'), type: b.getAttribute('type'), menuVis: getComputedStyle(m).visibility, menuOp: getComputedStyle(m).opacity, url: location.pathname }; })()`);
(async () => {
  const browser = await L.launch(); const { ctx, page, log } = await L.newPage(browser, W, { signedIn: true });
  const go = async () => { await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(300); await page.mouse.move(2, Hh - 2); await L.sleep(300); };
  const k = async (key, ms = 400) => { await page.keyboard.press(key); await L.sleep(ms); return st(page); };
  await go(); const log2 = []; const push = async (n, s) => log2.push([n, s || (await st(page))]);
  await push('initial');
  for (let i = 0; i < 15; i++) { const s = await k('Tab', 300); if (s.active === 'User menu') { log2.push(['tab->button', s]); break; } }
  await push('tab past closed', await k('Tab'));
  await push('shift+tab back', await k('Shift+Tab'));
  await push('enter', await k('Enter'));
  for (let i = 0; i < 4; i++) await push('tab' + (i + 1), await k('Tab'));
  await page.screenshot({ path: path.join(L.SHOTS, `usermenu-${LABEL}-${W}-logout-focused.png`) });
  await push('escape', await k('Escape'));
  await page.screenshot({ path: path.join(L.SHOTS, `usermenu-${LABEL}-${W}-after-escape.png`) });
  await push('space', await k('Space'));
  await push('space2', await k('Space'));
  await push('enter again', await k('Enter'));
  for (let i = 0; i < 4; i++) await k('Tab', 300);
  await push('on logout', await st(page));
  await push('tab out past logout', await k('Tab'));
  // hover / unhover
  const b = await page.locator('button[aria-label="User menu"]').boundingBox(); const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  await page.mouse.move(cx, cy); await L.sleep(500); await push('hover');
  await page.mouse.move(2, Hh - 2); await L.sleep(500); await push('unhover');
  await page.mouse.click(cx, cy); await L.sleep(400); await page.mouse.move(600, Hh - 50); await L.sleep(500); await push('click open + away');
  await page.screenshot({ path: path.join(L.SHOTS, `usermenu-${LABEL}-${W}-click-open.png`) });
  await page.mouse.click(600, Hh - 50); await L.sleep(500); await push('click outside');
  // extra: keyboard open then click greeting text (non-focusable)
  await page.locator('button[aria-label="User menu"]').focus(); await push('kb-open', await k('Enter'));
  const g = await page.locator('text=Hi, Ana!').boundingBox();
  if (g) { await page.mouse.click(g.x + 5, g.y + g.height / 2); await L.sleep(400); await push('click greeting (pointer inside)'); await page.mouse.move(2, Hh - 2); await L.sleep(500); await push('greeting then pointer out'); }
  // click Orders: closes and navigates
  await page.mouse.click(cx, cy); await L.sleep(400); await push('click open for Orders');
  const o = await page.locator('a[href="/account/orders"]').first().boundingBox();
  await page.mouse.click(o.x + o.width / 2, o.y + o.height / 2); await L.sleep(2000); await push('clicked Orders');
  // Enter on My Account: focus landing
  await go(); await page.locator('button[aria-label="User menu"]').focus(); await k('Enter'); await push('tab->My Account', await k('Tab'));
  await push('enter on My Account', await k('Enter', 2000));
  // ring on each item while open (fresh)
  await go(); await page.locator('button[aria-label="User menu"]').focus(); await k('Enter');
  const rings = []; for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await L.sleep(400); rings.push(await L.describeActive(page)); }
  const R = { PORT, W, LABEL, log: log2, rings, errors: log.errors };
  L.save(path.join(L.OUT, 'usermenu', `${LABEL}-${W}.json`), R);
  for (const [n, s] of log2) console.log(LABEL, W, n.padEnd(32), JSON.stringify(s));
  for (const d of rings) console.log('ring', d && [d.name, d.eff, d.os, d.ow, d.oo, d.oc, d.bs, d.bg, d.fv].join(' / '));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
