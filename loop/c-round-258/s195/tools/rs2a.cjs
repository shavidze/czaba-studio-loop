const L = require('./lib.cjs'); const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path');
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const W = +process.argv[2]; const H = W === 1440 ? 900 : 720; const res = { W, pages: {} };
(async () => { const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  // guest border pixel contrast from the guest195 rest screenshot
  const g = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'out', `guest195-${W}.json`))).tags.tree.rest; const I = decode(fs.readFileSync(path.join(__dirname, '..', 'shots', 'guest', `${W}-tree-rest.png`)));
  res.guest = g.map((f) => { const [x, y, w, h] = f.box; const s = 2; const px = (cx, cy) => I.px(Math.round(cx * s), Math.round(cy * s));
    const sides = { top: [px(x + w / 2, y + 0.25), px(x + w / 2, y - 2)], bottom: [px(x + w / 2, y + h - 0.25), px(x + w / 2, y + h + 2)], left: [px(x + 0.25, y + h / 2), px(x - 2, y + h / 2)], right: [px(x + w - 0.25, y + h / 2), px(x + w + 2, y + h / 2)] };
    return { s: f.s, bc: f.bc, ratios: Object.fromEntries(Object.entries(sides).map(([k, [a, o]]) => [k, { border: a, out: o, cr: cr(a, o) }])) }; });
  for (const [name, url] of [['home', '/'], ['product', '/products/middle-east'], ['support', '/support']]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
    const p = await ctx.newPage(); const ev = { pageerror: [], hyd: [] }; p.on('pageerror', (e) => ev.pageerror.push(String(e).slice(0, 200))); p.on('console', (m) => { if (/hydrat|did not match/i.test(m.text())) ev.hyd.push(m.text().slice(0, 200)); });
    await p.goto(L.BASE + url, { waitUntil: 'load', timeout: 90000 }); await L.sleep(3000);
    res.pages[name] = await p.evaluate(() => { const cs = getComputedStyle(document.documentElement); const v = (n) => cs.getPropertyValue(n).trim();
      const body = getComputedStyle(document.body);
      const brass = [...document.querySelectorAll('button, a')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).backgroundColor === 'rgb(201, 164, 106)'; }).map((e) => ({ t: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30), color: getComputedStyle(e).color }));
      const pText = [...new Set([...document.querySelectorAll('p')].filter((e) => e.getBoundingClientRect().height > 0).map((e) => getComputedStyle(e).color))].slice(0, 8);
      return { vars: { background: v('--color-background'), brand: v('--color-brand'), foreground: v('--color-foreground'), secondary: v('--color-secondary'), surface: v('--color-surface') }, bodyColor: body.color, bodyBg: body.backgroundColor, pText, brass }; });
    res.pages[name].ev = ev; await ctx.close(); }
  await b.close(); L.save(L.OUT, `rs2a-${W}.json`, res); console.log(JSON.stringify(res, null, 1)); })();
