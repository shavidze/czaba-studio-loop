const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const undoT = (p) => p.evaluate(() => { const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return u ? `${u.getAttribute('title')}|${u.disabled}` : null; });
const sel = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).map((e) => e.closest('[data-track-id]').dataset.trackId + '@' + e.dataset.clipStart));
const rows = {
  async 'RP-RANGE'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
    const st = (await L.clipsDom(p)).find((c) => c.lane === 'stems');
    const box = () => p.evaluate((id) => { const r = document.querySelector(`[data-clip-id="${id}"]`).getBoundingClientRect(); const l = document.querySelector('[data-track-id=stems]').getBoundingClientRect(); return { y: +r.y.toFixed(2), h: +r.height.toFixed(2), laneY: +l.y.toFixed(2), laneH: +l.height.toFixed(2) }; }, st.id);
    await L.selectClip(p, st.id); res.b0 = await box();
    res.rst = await X.rangeDrag(p, st.id, 5, 8); res.b1 = await box(); res.range = await p.evaluate(() => [document.querySelector('[data-testid=arrangement-detail-start]').value, document.querySelector('[data-testid=arrangement-detail-end]').value]);
    await X.shot(p, `${res.id}.png`);
    // next pointer action: click the SFX clip header; it must select the SFX clip
    const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx'); await L.selectClip(p, sfx.id); res.after = await sel(p);
    res.dy = +(res.b1.y - res.b0.y).toFixed(2); res.dh = +(res.b1.h - res.b0.h).toFixed(2);
    res.checks = { rangeMade: res.range[0] === '5' && res.range[1] === '8', stable: Math.abs(res.dy) <= 0.5 && Math.abs(res.dh) <= 0.5, nextHits: res.after.length === 1 && res.after[0].startsWith('sfx') };
  },
  async 'RP-ROW-HANDLE'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-stem-pulse', 'music', 2); await L.addAt(p, 'demo-stem-bass', 'stems', 2);
    // smallest lane height for music (N): keyboard on its separator
    const sep = p.locator('[data-track-id=music] [data-testid=arrangement-track-height]'); await sep.focus(); for (let i = 0; i < 20; i++) { await p.keyboard.press('ArrowUp'); await sleep(30); } await sleep(400); await L.blur(p);
    res.laneH = await sep.getAttribute('aria-valuenow'); res.min = await sep.getAttribute('aria-valuemin');
    if (res.laneH !== res.min) { await sep.focus(); for (let i = 0; i < 20; i++) { await p.keyboard.press('ArrowDown'); await sleep(30); } await sleep(400); await L.blur(p); res.laneH = await sep.getAttribute('aria-valuenow'); }
    const cs = await L.clipsDom(p); const m = cs.find((c) => c.lane === 'music'), s = cs.find((c) => c.lane === 'stems');
    await L.selectClip(p, m.id); const mb = await X.clipBox(p, m.id); await p.mouse.move(mb.x + mb.width / 2, mb.y + mb.height * 0.7); await sleep(300);
    const geo = await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); const lane = e.closest('[data-track-id]').getBoundingClientRect(); const h = e.querySelector('[data-testid=arrangement-clip-fade-out-handle]').getBoundingClientRect(); const cx = h.left + h.width / 2, cy = h.top + h.height / 2; const hit = document.elementFromPoint(cx, cy); return { laneBottom: lane.bottom, handle: h.toJSON(), gapToLaneBottom: +(lane.bottom - h.bottom).toFixed(2), hit: hit ? (hit.dataset.testid || hit.tagName) + (hit.closest('[data-track-id]') ? '@' + hit.closest('[data-track-id]').dataset.trackId : '') : null, cx, cy }; }, m.id);
    res.geo = geo; res.fo0 = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.fadeOut, m.id);
    const s0 = await X.clipBox(p, s.id);
    await p.mouse.move(geo.cx, geo.cy, { steps: 2 }); await sleep(100); await p.mouse.down(); await p.mouse.move(geo.cx - 10, geo.cy, { steps: 4 }); await p.mouse.move(geo.cx - 20, geo.cy, { steps: 4 }); await sleep(150); await p.mouse.up(); await sleep(400);
    res.fo1 = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.fadeOut, m.id); res.sel = await sel(p); const s1 = await X.clipBox(p, s.id);
    res.stemsMoved = Math.abs(s1.x - s0.x) > 0.5 || Math.abs(s1.y - s0.y) > 0.5;
    // variant: drag the handle from its spot down across the row boundary into lane N+1 and further left
    const g2 = await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); const h = e.querySelector('[data-testid=arrangement-clip-fade-out-handle]').getBoundingClientRect(); const lane = e.closest('[data-track-id]').getBoundingClientRect(); return { cx: h.left + h.width / 2, cy: h.top + h.height / 2, laneBottom: lane.bottom }; }, m.id);
    const s2 = await X.clipBox(p, s.id);
    await p.mouse.move(g2.cx, g2.cy, { steps: 2 }); await sleep(100); await p.mouse.down(); await p.mouse.move(g2.cx - 10, g2.laneBottom + 15, { steps: 6 }); await p.mouse.move(g2.cx - 30, g2.laneBottom + 30, { steps: 6 }); await sleep(150);
    res.crossHit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.testid || e.tagName) + (e.closest('[data-track-id]') ? '@' + e.closest('[data-track-id]').dataset.trackId : '') : null; }, [g2.cx - 30, g2.laneBottom + 30]);
    await p.mouse.up(); await sleep(400);
    res.fo2 = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.fadeOut, m.id); res.sel2 = await sel(p); const s3 = await X.clipBox(p, s.id);
    res.cross = { stemsMoved: Math.abs(s3.x - s2.x) > 0.5 || Math.abs(s3.y - s2.y) > 0.5, fadeIncreased: +res.fo2 > +res.fo1 + 0.3 };
    await X.shot(p, `${res.id}.png`);
    res.precondition = `handle-to-lane-bottom gap ${geo.gapToLaneBottom} px at the smallest lane height ${res.laneH} px (row asks ≤ 4 px; not reachable in the current layout)`;
    res.checks = { minHeight: res.laneH === res.min, hitHandle: /fade-out-handle@music/.test(geo.hit), fadeChanged: +res.fo1 > +res.fo0 + 0.3, n1Untouched: !res.stemsMoved && !res.sel.some((x) => x.startsWith('stems')), crossKeepsFade: res.cross.fadeIncreased && !res.cross.stemsMoved && !res.sel2.some((x) => x.startsWith('stems')) };
  },
  async 'RP-TOUCH-LONG'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
    await p.evaluate(() => { window.__cm = []; document.addEventListener('contextmenu', (e) => window.__cm.push({ t: (e.target.getAttribute('aria-label') || e.target.dataset.testid || e.target.tagName), prevented: e.defaultPrevented }), true); });
    const cdp = await p.context().newCDPSession(p);
    const T = { volume: '[data-track-id=stems] input[aria-label^="Volume"]', pan: '[data-track-id=stems] input[aria-label^="Pan"]', master: 'input[aria-label="Master Volume"]' };
    res.t = {};
    for (const [k, s] of Object.entries(T)) {
      const r0 = await p.evaluate((s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { v: e.value, min: +e.min, max: +e.max, x: b.x, y: b.y, w: b.width, h: b.height }; }, s);
      const u0 = await undoT(p); const cm0 = await p.evaluate(() => window.__cm.length);
      const frac = (+r0.v - r0.min) / (r0.max - r0.min); const far = frac > 0.5 ? r0.x + r0.w * 0.15 : r0.x + r0.w * 0.85; const y = r0.y + r0.h / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: far, y }] }); await sleep(900);
      const mid = await p.evaluate((s) => document.querySelector(s).value, s);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400);
      const v1 = await p.evaluate((s) => document.querySelector(s).value, s); const u1 = await undoT(p); const cm = await p.evaluate((n) => window.__cm.slice(n), cm0);
      res.t[k] = { v0: r0.v, mid, v1, u0, u1, contextmenu: cm, menuVisible: await p.evaluate(() => !!document.querySelector('[role=menu]')) };
      await L.blur(p);
    }
    { const s = T.volume; const r0 = await p.evaluate((s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { v: e.value, x: b.x + b.width * 0.5, y: b.y + b.height / 2 }; }, s);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r0.x, y: r0.y }] }); await sleep(100);
      for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r0.x - k * 5, y: r0.y }] }); await sleep(40); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400);
      res.control = { v0: r0.v, v1: await p.evaluate((s) => document.querySelector(s).value, s), undo: await undoT(p) }; }
    await X.shot(p, `${res.id}.png`);
    res.checks = Object.fromEntries(Object.entries(res.t).map(([k, v]) => [k, v.v1 === v.v0 && v.mid === v.v0 && v.u1 === v.u0 && !v.menuVisible])); res.checks.harnessValid = res.control.v1 !== res.control.v0;
  },
  async 'RP-HEADER-WIDTH'(p, res) {
    const rows = () => p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-grid-control]'); const chrome = g.parentElement.parentElement; return { rows: [...chrome.children].map((r) => Math.round(r.getBoundingClientRect().height * 10) / 10), gridH: Math.round(g.getBoundingClientRect().height * 10) / 10, sw: g.scrollWidth, cw: g.clientWidth, ds: { ...g.dataset } }; });
    res.r0 = await rows();
    const t = p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('90'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
    res.r1 = await rows();
    res.divs = await p.$eval('[data-testid=arrangement-grid-division]', (s) => [...s.options].map((o) => `${o.value}=${o.textContent.trim()}`));
    const trip = await p.$eval('[data-testid=arrangement-grid-division]', (s) => { const ops = [...s.options].filter((o) => /T|ტრიპ|3/.test(o.textContent) && /\//.test(o.textContent)); const w = (o) => o.textContent.trim().length; return (ops.length ? ops : [...s.options]).sort((a, b) => w(b) - w(a))[0].value; });
    await p.selectOption('[data-testid=arrangement-grid-division]', '1/32'); await sleep(300); await L.blur(p); await p.keyboard.press('3'); await sleep(400); res.tripStatus = await L.status(p);
    res.divsT = await p.$eval('[data-testid=arrangement-grid-division]', (s) => [...s.options].map((o) => `${o.value}=${o.textContent.trim()}`));
    if ((await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap)) !== 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); }
    if ((await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.envelopeMode)) !== 'on') { await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(200); }
    await p.selectOption('[data-testid=arrangement-waveform-zoom]', '8'); await sleep(300); await L.blur(p);
    res.r2 = await rows(); res.divLabel = await p.$eval('[data-testid=arrangement-grid-division]', (s) => s.options[s.selectedIndex].textContent.trim());
    res.controls = await p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-grid-control]'); const gb = g.getBoundingClientRect(); return [...g.querySelectorAll('button, select, input')].map((c) => { const r = c.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: c.dataset.testid || c.tagName, l: Math.round(r.left), r: Math.round(r.right), inside: r.left >= gb.left - 0.5 && r.right <= gb.right + 0.5, hit: !!hit && (hit === c || c.contains(hit)), sw: c.scrollWidth, cw: c.clientWidth }; }); });
    const gb = await p.locator('[data-testid=arrangement-grid-control]').boundingBox();
    await p.screenshot({ path: `${L.SHOTS}/${res.id}-grid-control.png`, clip: { x: Math.max(0, gb.x - 4), y: Math.max(0, gb.y - 4), width: gb.width + 60, height: gb.height + 8 } });
    await X.shot(p, `${res.id}.png`);
    res.overflowPx = res.r2.sw - res.r2.cw; res.checks = { triplet: /T$/.test(res.divLabel), state: res.r2.ds.snap === 'on' && res.r2.ds.envelopeMode === 'on' && res.r2.ds.waveformZoom === '8', noOverflow: res.r2.sw <= res.r2.cw, gridRow28: res.r2.gridH === 28, rowsUnchanged: JSON.stringify(res.r2.rows) === JSON.stringify(res.r1.rows), controlsInside: res.controls.every((c) => c.inside), controlsOperable: res.controls.every((c) => c.hit) };
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  const opts = ROW === 'RP-TOUCH-LONG' ? { hasTouch: true, isMobile: false } : undefined;
  try { const { page: p } = await L.openStudio(b, X.VPS[vp], id, net, opts); res.geo0 = await L.geo(p); await rows[ROW](p, res); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
