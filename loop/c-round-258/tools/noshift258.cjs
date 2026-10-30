// C round 258 RS-4B NO-SHIFT (same tree): boxes of the target, its parent and the parent's children before/after keyboard focus.
const req = require('module').createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fs = require('fs');
(async () => { const b = await chromium.launch(); const out = {};
for (const [W, H] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); } catch (e) {} });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:5173/', { waitUntil: 'load' }); await sleep(3500);
  await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Decline'); if (x) x.click(); });
  const r = {};
  for (const [k, sel] of Object.entries({ nav: 'header a[href="/about"]', cardPlay: 'button[aria-label="Play preview"]', field: 'input[type="email"]', footer: 'footer a[href="/gift-cards"]' })) {
    const el = p.locator(sel + ' >> visible=true').first(); await el.scrollIntoViewIfNeeded(); await sleep(1500);
    await el.evaluate((e) => { window.__t = e; });
    const boxes = () => p.evaluate(() => { const e = window.__t; const els = [e, e.parentElement, ...e.parentElement.children]; return els.map((x) => { const q = x.getBoundingClientRect(); return [q.x, q.y, q.width, q.height].map((v) => +v.toFixed(2)).join(','); }); });
    await p.keyboard.press('Shift'); const before = await boxes();
    await p.evaluate(() => window.__t.focus()); await sleep(300);
    const st = await p.evaluate(() => { const a = document.activeElement; const c = getComputedStyle(a); return { same: a === window.__t, fv: a.matches(':focus-visible'), os: c.outlineStyle, ow: c.outlineWidth }; });
    const after = await boxes();
    r[k] = { ...st, moved: before.map((v, i) => (v === after[i] ? null : [i, v, after[i]])).filter(Boolean), n: before.length };
    await p.evaluate(() => document.activeElement.blur());
  }
  r.pass = ['nav', 'cardPlay', 'field', 'footer'].every((k) => r[k].same && r[k].fv && r[k].os === 'solid' && r[k].moved.length === 0);
  out[W] = r; console.log(W, JSON.stringify(r)); await ctx.close(); }
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-258/out/noshift258.json', JSON.stringify(out, null, 1)); await b.close(); })();
