// C round 173: O1/O2 4x corner crops with focus removed (blur) + pure-mouse focus-visible observation. node c173-o2clean.cjs <1440|1280>
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
const W = process.argv[2]; const VP = W === '1440' ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const SHD = path.join(L.SHOTS, `c173-${W}-o2clean`); fs.mkdirSync(SHD, { recursive: true }); const net = []; const res = { W };
const crop4 = async (p, tag, r) => { const o = {}; for (const [k, x, y] of [['tl', r.x - 4, r.y - 4], ['tr', r.x + r.width - 16, r.y - 4], ['br', r.x + r.width - 16, r.y + r.height - 16], ['bl', r.x - 4, r.y + r.height - 16]]) { const f = path.join(SHD, `${tag}-${k}.png`); await p.screenshot({ path: f, clip: { x, y, width: 20, height: 20 } }); o[k] = path.relative(L.ROOT, f); } return o; };
(async () => {
  const b = await L.launch(); const o = await L.openStudio(b, VP, `c173-o2clean-${W}`, net, { deviceScaleFactor: 4 }); const p = o.page; res.fonts = o.log.fontsReady.ok;
  const ovL = p.locator('[data-testid=arrangement-overview]'); let r = await ovL.boundingBox();
  await p.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await L.sleep(300);
  res.pureMouseFocus = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-overview]'); return { focused: document.activeElement === e, fv: e.matches(':focus-visible'), shadow: getComputedStyle(e).boxShadow.includes('201, 164, 106') }; });
  await L.blur(p);
  const z = p.locator('[data-testid=arrangement-zoom]'); await z.focus(); await p.keyboard.press('End'); await L.sleep(400); await p.keyboard.press('Home'); await L.sleep(400); await L.blur(p);
  res.add = await L.addAt(p, 'demo-middle-east', 'music', 1); await z.focus(); await p.keyboard.press('End'); await L.sleep(400); await L.blur(p);
  r = await ovL.boundingBox(); res.O1 = { root: r, frame: await p.locator('[data-testid=arrangement-overview-frame]').boundingBox() }; res.O1.crops = await crop4(p, 'O1-root', r);
  await p.mouse.click(r.x + r.width - 2, r.y + r.height / 2); await L.sleep(500); await L.blur(p); await p.mouse.move(5, 5); await L.sleep(300);
  res.O2 = { root: r, frame: await p.locator('[data-testid=arrangement-overview-frame]').boundingBox(), focusedAfterBlur: await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid) };
  res.O2.crops = await crop4(p, 'O2-root', r); await p.screenshot({ path: path.join(SHD, 'O2-root-full.png'), clip: { x: r.x - 4, y: r.y - 4, width: r.width + 8, height: r.height + 8 } });
  res.net = net; await o.ctx.close(); await b.close(); L.save(L.OUT, `c173-${W}-o2clean.json`, res); console.log(JSON.stringify({ fonts: res.fonts, pm: res.pureMouseFocus, o1f: res.O1.frame, o2f: res.O2.frame, foc: res.O2.focusedAfterBlur, err: net.map((l) => [l.errors.length, l.hydration.length, l.forbidden.length, l.authHeaders.length]) }));
})().catch((e) => { console.error(e); process.exit(1); });
