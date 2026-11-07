// MOBILE-204 at 375. node mobile.cjs <port> <label>
const L = require('./lib.cjs'); const path = require('path');
const [PORT, LABEL] = process.argv.slice(2); const W = 375;
const wrapSel = `(() => { const t = document.querySelector('button[aria-label="Toggle menu"]'); const hdr = t.closest('header') || document.querySelector('header'); return [...hdr.querySelectorAll(':scope > div, :scope div')].find((d) => /max-h-/.test(d.className) && d.className.includes('lg:hidden')); })()`;
const state = (page) => page.evaluate(`(() => { const w = ${wrapSel}; const items = [...w.querySelectorAll('a, button')].map((a) => { let o = 1, n = a; while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } const r = a.getBoundingClientRect(); return [a.textContent.trim().slice(0, 14), +o.toFixed(2), getComputedStyle(a).visibility, Math.round(r.height)]; }); const r = w.getBoundingClientRect(); return { expanded: document.querySelector('button[aria-label="Toggle menu"]').getAttribute('aria-expanded'), wrapId: w.id || null, wrapVis: getComputedStyle(w).visibility, wrapOp: getComputedStyle(w).opacity, wrapBox: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)), items }; })()`);
(async () => {
  const browser = await L.launch(); const R = { PORT, LABEL };
  for (const signedIn of [false, true]) {
    const { ctx, page, log } = await L.newPage(browser, W, { signedIn });
    await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(400);
    const r = {}; const tog = page.locator('button[aria-label="Toggle menu"]');
    r.closed = await state(page);
    r.headerBox = await page.evaluate(() => { const h = document.querySelector('header'); const b = h.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; });
    await page.screenshot({ path: path.join(L.SHOTS, `mobile-${LABEL}-${signedIn ? 'in' : 'anon'}-closed.png`) });
    // keyboard: Tab until toggle
    for (let i = 0; i < 15; i++) { await page.keyboard.press('Tab'); await L.sleep(250); if (await page.evaluate(() => document.activeElement.getAttribute('aria-label') === 'Toggle menu')) break; }
    r.toggleFocused = await L.describeActive(page);
    await page.keyboard.press('Enter'); await L.sleep(600); r.openKb = await state(page);
    await page.screenshot({ path: path.join(L.SHOTS, `mobile-${LABEL}-${signedIn ? 'in' : 'anon'}-open.png`) });
    r.tabSeq = []; for (let i = 0; i < 10; i++) { await page.keyboard.press('Tab'); await L.sleep(300); const d = await L.describeActive(page); r.tabSeq.push(d && [d.tag, d.name, d.eff, d.vis, d.clipped, d.onScreen, d.os, d.ow, d.oo, d.oc]); if (d && d.name && /^(Free|Ana|Search|Middle|All)/.test(d.name) && i > 6) break; }
    // back to toggle, close with Enter, sample
    await tog.focus(); await page.keyboard.press('Enter'); await L.sleep(100); r.close100 = await state(page);
    await L.sleep(500); r.close600 = await state(page);
    r.tabAfterClose = []; await tog.focus(); for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); await L.sleep(300); const d = await L.describeActive(page); r.tabAfterClose.push(d && [d.tag, d.name, d.eff]); }
    // mouse toggle
    await tog.click(); await L.sleep(600); r.openMouse = await state(page);
    await tog.click(); await L.sleep(100); r.mouseClose100 = await state(page); await L.sleep(500); r.mouseClose600 = await state(page);
    // mobile link click closes (N2)
    await tog.click(); await L.sleep(600);
    await page.evaluate(`(() => { const w = ${wrapSel}; [...w.querySelectorAll('a')].find((a) => a.textContent.trim() === 'About').click(); })()`); await L.sleep(1500);
    r.afterLinkClick = { url: page.url(), ...(await state(page)) };
    if (!signedIn) {
      await tog.click(); await L.sleep(600);
      await page.evaluate(`(() => { const w = ${wrapSel}; [...w.querySelectorAll('button')].find((a) => a.textContent.trim() === 'Sign In').click(); })()`); await L.sleep(1000);
      r.signInModal = await page.evaluate(() => ({ dialogs: document.querySelectorAll('[role="dialog"]').length, emailInputs: document.querySelectorAll('input[type="email"]').length, expanded: document.querySelector('button[aria-label="Toggle menu"]').getAttribute('aria-expanded') }));
    }
    r.errors = log.errors; R[signedIn ? 'signedIn' : 'anon'] = r; await ctx.close();
  }
  L.save(path.join(L.OUT, 'mobile', `${LABEL}.json`), R); console.log(JSON.stringify(R, null, 0).slice(0, 6000));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
