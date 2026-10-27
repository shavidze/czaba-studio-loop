// C round 202 — NO-SHIFT boxes, KEEP-LIST, fresh-profile cookie banner + LeadMagnet focus. node noshift.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path'); const fs = require('fs');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const SH = path.join(F.ROOT, 'shots', 'fresh', TAG); fs.mkdirSync(SH, { recursive: true });
const boxes = (p) => p.evaluate(() => [...document.querySelectorAll('header, nav, header a, header button, main a, main input, main button, main select, main textarea, form input, form button, article, h1, h2, footer a')].map((e) => { const r = e.getBoundingClientRect(); return [e.tagName, (e.getAttribute('href') || e.getAttribute('placeholder') || e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 24), +r.x.toFixed(1), +(r.y + scrollY).toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; }));
(async () => {
  const browser = await F.launch(); const R = { TAG, boxes: {} };
  for (const [name, url, chat] of [['home', '/', false], ['store', '/store', false], ['support', '/support', true]]) {
    const { ctx, page } = await F.newPage(browser, W, H);
    await page.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ dismissed: true, views: 99, lastShown: Date.now(), viewsToday: 99, date: new Date().toDateString() })); } catch (e) {} });
    await page.goto(BASE + url, { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await F.sleep(600);
    if (chat) { await page.locator('button', { hasText: 'Live Chat' }).first().click(); await page.waitForSelector('#guest-name'); await F.sleep(1200); }
    await page.mouse.move(1, H - 2);
    // scroll through to trigger reveal animations, then back to top
    for (let y = 0; y < 8000; y += 600) { await page.evaluate((v) => window.scrollTo(0, v), y); await F.sleep(150); }
    await page.evaluate(() => window.scrollTo(0, 0)); await F.sleep(1500);
    R.boxes[name] = await boxes(page);
    if (name === 'home') {
      R.keep = await page.evaluate(() => ({ freeSamplesNav: [...document.querySelectorAll('header a')].map((a) => a.textContent.trim()).filter((t) => /Free Samples/i.test(t)), limited: (document.body.innerText.match(/Limited/g) || []).length, specialOffers: /Special Offers?|Exclusive|Bundle/i.test(document.body.innerText), happy: /2,500\+\s*Happy Customers/i.test(document.body.innerText), netflix: /Netflix Original Score/i.test(document.body.innerText) }));
    }
    await ctx.close();
  }
  // fresh profile: cookie banner Tab + LeadMagnet
  { const { ctx, page } = await F.newPage(browser, W, H);
    await page.goto(BASE + '/', { waitUntil: 'load' }); await F.sleep(3000);
    R.cookieBanner = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /^(Decline|Accept)/.test(b.textContent.trim())).map((b) => b.textContent.trim()));
    // Tab to cookie buttons
    R.cookieStops = [];
    for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); await F.sleep(120); const d = await F.describeActive(page); if (d && /^(Decline|Accept)/.test(d.name)) { await F.sleep(350); const d2 = await F.describeActive(page); R.cookieStops.push({ i, name: d2.name.slice(0, 20), os: d2.os, ow: d2.ow, oo: d2.oo, oc: d2.oc, bs: d2.bs.slice(0, 40), op: d2.op }); R.cookieStops[R.cookieStops.length - 1].box = d2.box; try { await page.screenshot({ path: path.join(SH, `cookie-${R.cookieStops.length}.png`), clip: F.clipFor(d2.box, W, H, 10) }); } catch (e) { R.cookieStops[R.cookieStops.length - 1].shotErr = 1; } if (R.cookieStops.length >= 2) break; } }
    await F.declineCookies(page); await F.sleep(400);
    // LeadMagnet: scroll 50%, wait 9 s
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55)); await F.sleep(10000);
    R.leadPopup = await page.evaluate(() => /FREE DOWNLOAD/i.test(document.body.innerText));
    if (!R.leadPopup) { await page.mouse.move(W / 2, 200); await page.mouse.move(W / 2, 0); await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave', { clientY: -1, bubbles: true }))); await F.sleep(1500); R.leadPopup = await page.evaluate(() => /FREE DOWNLOAD/i.test(document.body.innerText)); }
    if (R.leadPopup) {
      await page.screenshot({ path: path.join(SH, 'lead.png') });
      R.leadText = await page.evaluate(() => { const n = [...document.querySelectorAll('div')].reverse().find((d) => /FREE DOWNLOAD/.test(d.textContent) && d.querySelector('input')); return n ? n.innerText.replace(/\s+/g, ' ').slice(0, 300) : null; });
      R.leadStops = [];
      for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); await F.sleep(400); const d = await F.describeActive(page); if (!d) continue; R.leadStops.push({ name: d.name.slice(0, 24), tag: d.tag, os: d.os, ow: d.ow, oo: d.oo, bs: d.bs.slice(0, 40), bc: d.bc.split('|')[0], op: d.op }); try { await page.screenshot({ path: path.join(SH, `lead-${i}.png`), clip: F.clipFor(d.box, W, H, 10) }); } catch (e) {} }
      // measure ring contrast for the email input of the popup
      const inp = page.locator('input[type=email]').filter({ visible: true }).last();
      try { if (await inp.count()) { const b = await inp.boundingBox(); const box = [b.x, b.y, b.width, b.height]; const clip = F.clipFor(box, W, H); await page.evaluate(() => document.activeElement.blur()); await F.sleep(300); await page.screenshot({ path: path.join(SH, 'lead-in-u.png'), clip }); await inp.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(400); await page.screenshot({ path: path.join(SH, 'lead-in-f.png'), clip }); R.leadInput = { ...F.ringStats(path.join(SH, 'lead-in-f.png'), path.join(SH, 'lead-in-u.png'), clip, box), d: await F.describeActive(page) }; } } catch (e) { R.leadInputErr = String(e).slice(0, 120); R.leadInputBox = await inp.boundingBox().catch(() => null); }
    }
    await ctx.close(); }
  F.save(path.join(F.ROOT, 'out', 'noshift', `${TAG}.json`), R);
  console.log(TAG, 'keep', JSON.stringify(R.keep), 'cookie', JSON.stringify(R.cookieStops), 'lead', R.leadPopup, JSON.stringify(R.leadStops), R.leadInput && JSON.stringify({ c: R.leadInput.contrast, s: R.leadInput.sides }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
