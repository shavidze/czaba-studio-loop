// C round 173: preview wave click while NOT ready (audio responses delayed via page.route). node c173-w0click.cjs <1440|1280> [pattern-probe]
const L = require('./lib.cjs'); const path = require('path');
const W = process.argv[2]; const VP = W === '1440' ? { width: 1440, height: 900 } : { width: 1280, height: 720 }; const net = []; const res = { W, reqs: [] };
(async () => {
  const b = await L.launch(); const o = await L.openCtx(b, VP, `c173-w0click-${W}`, net); const p = o.page;
  p.on('request', (q) => { const t = q.resourceType(); if (!/script|stylesheet|font|document/.test(t)) res.reqs.push(`${t} ${q.url().slice(0, 160)}`); });
  await p.route(/\.(wav|mp3|ogg|m4a|flac)(\?|$)/i, (r) => { res.held = (res.held || 0) + 1; setTimeout(() => r.continue().catch(() => {}), 90000); });
  await p.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-library-preview-wave]', { timeout: 90000 }); await L.sleep(4000); res.fonts = await L.fontsWait(p);
  const st = () => p.evaluate(() => { const w = document.querySelector('[data-testid=arrangement-library-preview-wave]'); const cs = getComputedStyle(w); const b = w.getBoundingClientRect(); const h = document.elementFromPoint(b.x + b.width / 3, b.y + b.height / 2); return { now: w.getAttribute('aria-valuenow'), text: w.getAttribute('aria-valuetext'), dis: w.getAttribute('aria-disabled'), cur: cs.cursor, op: cs.opacity, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '), box: [b.x, b.y, b.width, b.height], hitSelf: h === w || w.contains(h), playing: [...document.querySelectorAll('audio')].some((a) => !a.paused) }; });
  res.before = await st(); const bx = res.before.box;
  await p.mouse.click(bx[0] + bx[2] / 3, bx[1] + bx[3] / 2); await L.sleep(600); res.after = await st();
  await p.screenshot({ path: path.join(L.SHOTS, `c173-w0click-${W}.png`), clip: { x: bx[0] - 4, y: bx[1] - 40, width: bx[2] + 8, height: bx[3] + 48 } });
  res.net = net; await o.ctx.close(); await b.close(); L.save(L.OUT, `c173-w0click-${W}.json`, res);
  console.log(JSON.stringify({ held: res.held, fonts: res.fonts.ok, before: res.before, after: res.after, reqs: res.reqs.slice(0, 15), err: net.map((l) => [l.errors, l.hydration.length, l.forbidden.length, l.authHeaders.length]) }, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
