// C round 258 RS-4B mouse half: press (no release on target) on a nav link, card Play, a field and a footer link -> no ring.
const req = require('module').createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fs = require('fs');
(async () => { const b = await chromium.launch(); const out = {};
for (const [W, H] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); } catch (e) {} });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:5173/', { waitUntil: 'load' }); await sleep(3500);
  await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Decline'); if (x) x.click(); });
  const targets = { nav: 'header a[href="/about"]', cardPlay: 'button[aria-label="Play preview"]', field: 'input[type="email"]', footer: 'footer a[href="/gift-cards"]' };
  const r = {};
  for (const [k, sel] of Object.entries(targets)) {
    const el = p.locator(sel + " >> visible=true").first(); if (!(await el.count())) { r[k] = 'missing'; continue; }
    await el.scrollIntoViewIfNeeded(); await sleep(1500);
    const bb = await el.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await sleep(250);
    r[k] = await p.evaluate(() => { const a = document.activeElement; const c = getComputedStyle(a); return { el: a.tagName + ':' + (a.getAttribute('aria-label') || a.textContent || a.getAttribute('type') || '').trim().slice(0, 30), fv: a.matches(':focus-visible'), os: c.outlineStyle, bs: c.boxShadow.slice(0, 60) }; });
    await p.mouse.move(2, 2); await p.mouse.up(); await sleep(300); await p.keyboard.press('Escape');
    if (p.url() !== 'http://127.0.0.1:5173/') { await p.goto('http://127.0.0.1:5173/', { waitUntil: 'load' }); await sleep(2500); }
  }
  r.pass = Object.values(r).every((x) => x !== 'missing' && (x.fv === false || x.os === 'none'));
  out[W] = r; console.log(W, JSON.stringify(r)); await ctx.close(); }
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-258/out/mousering.json', JSON.stringify(out, null, 1)); await b.close(); })();
