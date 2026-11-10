// C round 195 — GUEST-BORDER-195 error state + field boxes, tree (:5173) vs ref (:5174, round-194 tree) vs head (:5175). node guest195.cjs <W>
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const VPS = { 1440: [1440, 900], 1280: [1280, 720], 375: [375, 812] };
const BASES = { tree: 'http://127.0.0.1:5173' };
const SH = path.join(L.ROOT, 'shots', 'guest'); fs.mkdirSync(SH, { recursive: true });
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] }); const res = { W, utc: new Date().toISOString(), tags: {} };
  for (const [tag, base] of Object.entries(BASES)) {
    const ctx = await b.newContext({ viewport: { width: VPS[W][0], height: VPS[W][1] }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
    const page = await ctx.newPage(); const ev = { pageerror: [], hyd: [], auth: [], remote: [] };
    page.on('pageerror', (e) => ev.pageerror.push(String(e).slice(0, 200)));
    page.on('console', (m) => { const t = m.text(); if (/hydrat|did not match|server rendered/i.test(t)) ev.hyd.push(t.slice(0, 200)); });
    page.on('request', (q) => { const u = q.url(); if (q.headers().authorization) ev.auth.push(u); if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(u) && !/^data:|^blob:/.test(u) && !/fonts\.(googleapis|gstatic)\.com/.test(u)) ev.remote.push(u); });
    const r = { ev };
    try {
      for (let a = 0; a < 2; a++) { try { await page.goto(base + '/support', { waitUntil: 'load', timeout: 90000 }); await L.sleep(3000); await page.locator('button', { hasText: 'Live Chat' }).first().click({ timeout: 30000 }); break; } catch (e) { r[`retry${a}`] = String(e).slice(0, 120); } }
      await page.waitForSelector('#guest-name', { timeout: 15000 }); await L.sleep(1200); await page.mouse.move(1, 1);
      const snap = () => page.evaluate(() => ['#guest-name', '#guest-email'].map((s) => { const e = document.querySelector(s); const bb = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { s, cls: e.className, box: [bb.x, bb.y, bb.width, bb.height].map((v) => +v.toFixed(2)), bc: cs.borderTopColor, ph: e.placeholder }; }));
      r.rest = await snap(); const form = page.locator('form:has(#guest-name)'); const fb = await form.boundingBox(); r.formBox = fb && [fb.x, fb.y, fb.width, fb.height].map((v) => +v.toFixed(2));
      r.formText = (await form.innerText()).slice(0, 400);
      await page.screenshot({ path: path.join(SH, `${W}-${tag}-rest.png`) });
      await form.locator('button[type=submit]').first().click(); await L.sleep(800); await page.mouse.move(1, 1); await L.sleep(300);
      r.error = await snap(); r.errorText = await page.evaluate(() => [...document.querySelectorAll('form [role=alert], form p')].map((e) => e.textContent.trim()).filter(Boolean));
      await page.screenshot({ path: path.join(SH, `${W}-${tag}-error.png`) });
    } catch (e) { r.err = String(e).slice(0, 300); }
    res.tags[tag] = r; await ctx.close();
    console.log(W, tag, r.err || JSON.stringify({ rest: r.rest.map((x) => [x.box, x.bc]), err: r.error.map((x) => [x.bc, x.cls.match(/border-\S+/g)]), t: r.errorText, ev: [ev.pageerror.length, ev.hyd.length, ev.auth.length, ev.remote.length] }));
  }
  await b.close(); L.save(L.OUT, `guest195-${W}.json`, res);
})();
