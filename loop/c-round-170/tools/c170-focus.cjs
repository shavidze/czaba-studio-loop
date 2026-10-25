// C round 170 — FOCUS-RING-INFO (informational). 1440: D1, click From, Tab until Clip Gain; record outline + ring per stop.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const SHD = path.join(L.ROOT, 'shots', 'focus'); fs.mkdirSync(SHD, { recursive: true });
(async () => {
  const b = await L.launch(); const net = []; const res = { utc: new Date().toISOString(), stops: [] };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[1440], 'c170focus-1440', net);
  res.fonts = log.fontsReady;
  await X.openDetail(p); await L.addAt(p, 'demo-middle-east', 'music', 1); await sleep(800);
  const id = await p.evaluate(() => { const c = [...document.querySelectorAll('[data-track-id=music] [data-clip-id]')].find((e) => Math.abs(+e.getAttribute('data-clip-start') - 1) < 0.01); return c && c.getAttribute('data-clip-id'); });
  await L.selectClip(p, id); await L.blur(p);
  const bb = await p.locator('[data-testid=arrangement-detail-start]').boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(300); await p.mouse.move(2, 2);
  const rec = async (i) => { const r = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); const parent = a.parentElement; const pcs = parent ? getComputedStyle(parent) : null; return { testid: a.getAttribute('data-testid'), tag: a.tagName, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`, boxShadow: cs.boxShadow, border: `${cs.borderTopWidth} ${cs.borderTopColor}`, focusVisible: a.matches(':focus-visible'), parentShadow: pcs && pcs.boxShadow, parentOutline: pcs && `${pcs.outlineStyle} ${pcs.outlineWidth}` }; }); const l = p.locator(':focus'); const b2 = await l.boundingBox(); r.shot = `shots/focus/focus-1440-stop${i}.png`; await p.screenshot({ path: path.join(L.ROOT, r.shot), clip: { x: b2.x - 10, y: b2.y - 10, width: b2.width + 20, height: b2.height + 20 } }); return r; };
  res.stops.push(await rec(0));
  for (let i = 1; i <= 4; i++) { await p.keyboard.press('Tab'); await sleep(250); const r = await rec(i); res.stops.push(r); if (r.testid === 'arrangement-detail-clip-gain-input') break; }
  await ctx.close(); res.net = X.netOk(net); await b.close();
  fs.writeFileSync(path.join(L.ROOT, 'out', 'focus-1440.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
