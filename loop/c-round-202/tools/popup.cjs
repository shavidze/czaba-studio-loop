// C round 202 — cookie banner + LeadMagnet focus rings (fresh profile), keep-list text. node popup.cjs <port> <W>
const F = require('./fl.cjs'); const path = require('path'); const fs = require('fs');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const SH = path.join(F.ROOT, 'shots', 'popup', TAG); fs.mkdirSync(SH, { recursive: true });
async function kbdFocus(page, loc, name) {
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(400);
  const b = await loc.boundingBox(); const box = [b.x, b.y, b.width, b.height]; const clip = F.clipFor(box, W, H);
  await page.screenshot({ path: path.join(SH, `${name}-u.png`), clip });
  const u = await loc.evaluate((e) => { const c = getComputedStyle(e); return { bs: c.boxShadow, bg: c.backgroundColor, bc: c.borderTopColor }; });
  await loc.focus(); await page.keyboard.press('Shift+Tab'); await F.sleep(100); await page.keyboard.press('Tab'); await F.sleep(450);
  const same = await loc.evaluate((e) => document.activeElement === e);
  if (!same) { await loc.focus(); await F.sleep(300); }
  const d = await F.describeActive(page);
  await page.screenshot({ path: path.join(SH, `${name}-f.png`), clip });
  const ring = F.ringStats(path.join(SH, `${name}-f.png`), path.join(SH, `${name}-u.png`), clip, box);
  return { same, name: d.name.slice(0, 24), os: d.os, ow: d.ow, oo: d.oo, oc: d.oc, fv: d.fv, fs: d.focusSource, bsSame: d.bs === u.bs, bgSame: d.bg === u.bg, bcSame: d.bc.split('|')[0] === u.bc, op: d.op, sides: ring.sides, contrast: ring.contrast, ringMed: ring.ringMed, outsideMed: ring.outsideMed };
}
(async () => {
  const browser = await F.launch(); const R = { TAG };
  const { ctx, page } = await F.newPage(browser, W, H);
  await page.goto(BASE + '/', { waitUntil: 'load' }); await F.sleep(3500);
  await page.keyboard.press('Shift'); // keyboard modality for the tree attribute
  R.cookie = {};
  for (const t of ['Decline', 'Accept All', 'Accept']) {
    const loc = page.locator('button').filter({ hasText: new RegExp(`^${t}$`) }).first();
    if (await loc.count() && await loc.isVisible()) R.cookie[t] = await kbdFocus(page, loc, 'cookie-' + t.replace(/ /g, ''));
  }
  await F.declineCookies(page); await F.sleep(500);
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55)); await F.sleep(10000);
  R.lead = await page.evaluate(() => /FREE DOWNLOAD/i.test(document.body.innerText));
  if (R.lead) {
    await F.sleep(1200);
    await page.screenshot({ path: path.join(SH, 'lead.png') });
    const root = page.locator('div.fixed.inset-0.flex.items-center.justify-center.bg-background').last();
    R.leadText = (await root.innerText()).replace(/\s+/g, ' ').slice(0, 400);
    R.leadItems = {};
    const scan = async (tag) => { const items = root.locator('button, input, a'); const n = await items.count(); for (let i = 0; i < n; i++) { const it = items.nth(i); if (!(await it.isVisible())) continue; const nm = tag + ':' + (((await it.getAttribute('aria-label')) || (await it.getAttribute('placeholder')) || (await it.innerText()) || 'x').trim().replace(/\s+/g, ' ').slice(0, 20)); try { R.leadItems[nm] = await kbdFocus(page, it, 'lead-' + tag + i); } catch (e) { R.leadItems[nm] = String(e).slice(0, 100); } } };
    await scan('s1');
    const fd = root.locator('button').filter({ hasText: 'FREE DOWNLOAD' }).first();
    if (await fd.count()) { await fd.click(); await F.sleep(1200); R.leadText2 = (await root.innerText()).replace(/\s+/g, ' ').slice(0, 300); await page.screenshot({ path: path.join(SH, 'lead2.png') }); await scan('s2'); }
  }
  await ctx.close();
  { const { ctx: c2, page: p2 } = await F.newPage(browser, W, H); await p2.goto(BASE + '/about', { waitUntil: 'load' }); await F.sleep(3000);
    for (let y = 0; y < 6000; y += 500) { await p2.evaluate((v) => window.scrollTo(0, v), y); await F.sleep(120); }
    R.about = await p2.evaluate(() => ({ happy: /2,500\+\s*Happy Customers/i.test(document.body.innerText), netflix: /Netflix Original Score/i.test(document.body.innerText) }));
    await p2.goto(BASE + '/', { waitUntil: 'load' }); await F.sleep(3000); for (let y = 0; y < 9000; y += 500) { await p2.evaluate((v) => window.scrollTo(0, v), y); await F.sleep(150); }
    R.home = await p2.evaluate(() => ({ happy: /Happy Customers/i.test(document.body.innerText), netflix: /Netflix/i.test(document.body.innerText), limited: /Limited Collection/.test(document.body.innerText), freeSamples: [...document.querySelectorAll('header a')].some((a) => a.textContent.trim() === 'Free Samples'), text: document.body.innerText.length }));
    await c2.close(); }
  F.save(path.join(F.ROOT, 'out', 'popup', `${TAG}.json`), R);
  console.log(JSON.stringify(R));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
