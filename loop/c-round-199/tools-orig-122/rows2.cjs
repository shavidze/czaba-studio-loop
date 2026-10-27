const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const undoT = (p) => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /↶\s*Undo/.test(x.textContent)); return b ? `${b.getAttribute('title')}|${b.getAttribute('aria-label')}|${b.disabled}` : null; });
function srcInit() {
  const W = window; W.__src = { active: new Set(), log: [] };
  const P = AudioBufferSourceNode.prototype; const os = P.start, ost = P.stop;
  P.start = function (...a) { W.__src.active.add(this); W.__src.log.push({ k: 'start', t: performance.now(), dur: this.buffer ? this.buffer.duration : null }); this.addEventListener('ended', () => { W.__src.active.delete(this); W.__src.log.push({ k: 'ended', t: performance.now() }); }); return os.apply(this, a); };
  P.stop = function (...a) { W.__src.log.push({ k: 'stop', t: performance.now() }); return ost.apply(this, a); };
}
const rows = {
  async 'RG-09'(p, res) {
    await L.setSnapOff(p); await L.blur(p); await p.keyboard.press('-'); await sleep(400);
    await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-soft-impact', 'sfx', 6); await L.addAt(p, 'demo-stem-pulse', 'stems', 10);
    res.geo2 = await L.geo(p); res.t0 = await X.clipTable(p);
    const m = (await L.clipsDom(p)).find((c) => c.lane === 'music'); await L.selectClip(p, m.id);
    res.copy = await X.key(p, 'Control+c'); res.seek = await L.seekTo(p, 20); res.paste = await X.key(p, 'Control+v'); res.t1 = await X.clipTable(p);
    const m0 = (await L.clipsDom(p)).find((c) => c.lane === 'music' && c.start === 0);
    await X.rangeDrag(p, m0.id, 2, 3); res.rg1 = await p.evaluate(() => [document.querySelector('[data-testid=arrangement-detail-start]').value, document.querySelector('[data-testid=arrangement-detail-end]').value]);
    res.cut = await X.key(p, 'Control+x'); res.t2 = await X.clipTable(p);
    res.undo = await X.key(p, 'Control+z'); res.t3 = await X.clipTable(p);
    const m1 = (await L.clipsDom(p)).find((c) => c.lane === 'music' && c.start === 0);
    await X.rangeDrag(p, m1.id, 2, 3); res.cutTime = await X.key(p, 'Control+Shift+x'); res.t4 = await X.clipTable(p);
    await X.shot(p, `${res.id}-cut-time.png`);
    const f = (t, ln) => t.filter((r) => r.lane === ln);
    const c20 = res.t1.find((r) => r.lane === 'music' && r.start === 20);
    const others = (t) => JSON.stringify(t.filter((r) => r.lane !== 'music'));
    const mu2 = f(res.t2, 'music'), mu4 = f(res.t4, 'music');
    res.checks = {
      paste: !!c20 && c20.end === 36 && c20.offset === 0,
      cutGap: mu2.length === 3 && mu2[0].start === 0 && mu2[0].end === 2 && mu2[1].start === 3 && mu2[1].offset === 3 && mu2[2].start === 20 && others(res.t2) === others(res.t1),
      undo: X.tblKey(res.t3) === X.tblKey(res.t1),
      cutTime: mu4.length === 3 && mu4[0].end === 2 && mu4[1].start === 2 && mu4[1].end === 15 && mu4[1].offset === 3 && mu4[2].start === 19 && f(res.t4, 'sfx')[0].start === 5 && f(res.t4, 'stems')[0].start === 9,
    };
  },
  async 'RG-10'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.seekTo(p, 10);
    const hx = () => p.evaluate(() => { const h = document.querySelector('[data-testid=arrangement-playhead-handle]').getBoundingClientRect(); return +(h.left + h.width / 2).toFixed(2); });
    const z = async () => ({ pps: (await L.geo(p)).pps, sl: await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft), hx: await hx() });
    res.z0 = await z(); await L.blur(p); await p.keyboard.press('+'); await sleep(400); res.z1 = await z(); await p.keyboard.press('+'); await sleep(400); res.z2 = await z(); await p.keyboard.press('-'); await sleep(400); res.z3 = await z();
    const m = (await L.clipsDom(p)).find((c) => c.lane === 'music');
    res.preZ = await z();
    await X.rangeDrag(p, m.id, 4, 6); res.zst = await X.key(p, 'z'); await sleep(300);
    res.frame = await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const sr = s.getBoundingClientRect(); const rl = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left; const pps = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1]; const lane = document.querySelector('[data-track-id=music]').getBoundingClientRect(); const head = document.querySelector('[data-track-id=music] [data-testid=arrangement-track-header]').getBoundingClientRect(); const vx0 = head.right; const vw = sr.right - vx0 - (s.offsetWidth - s.clientWidth); const x4 = rl + 4 * pps, x6 = rl + 6 * pps; return { pps, vx0, vw, x4, x6, frac: (x6 - x4) / vw, centreErr: ((x4 + x6) / 2) - (vx0 + vw / 2) }; });
    await X.shot(p, `${res.id}-zoom-range.png`);
    res.xst = await X.key(p, 'x'); res.postX = await z();
    // ruler click with < 4 px move, stopped
    const u0 = await undoT(p); const r = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
    const g = await L.geo(p); const xs = g.rl + 7 * g.pps - (await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft)) * 0; const y = r.top + r.height / 2;
    const p0 = await L.posNow(p);
    await p.mouse.move(xs, y); await p.mouse.down(); await sleep(150); const pDown = await L.posNow(p); await p.mouse.move(xs + 2, y, { steps: 2 }); await sleep(100); await p.mouse.up(); await sleep(400);
    res.ruler = { p0, pDown, pUp: await L.posNow(p), playing: await p.evaluate(() => !!document.querySelector('button[aria-label="Pause"]')), u0, u1: await undoT(p) };
    res.checks = { anchor: [res.z1, res.z2, res.z3].every((s) => Math.abs(s.hx - res.z0.hx) <= 1) && res.z2.pps > res.z1.pps && res.z1.pps > res.z0.pps, frame: Math.abs(res.frame.frac - 0.6) <= 0.05 && Math.abs(res.frame.centreErr) <= 2, restore: res.postX.pps === res.preZ.pps && res.postX.sl === res.preZ.sl, rulerRelease: res.ruler.pDown === p0 && res.ruler.pUp !== p0, noPlay: !res.ruler.playing, noHist: res.ruler.u0 === res.ruler.u1 };
  },
  async 'RG-11A'(p, res) {
    const lw = () => p.evaluate(() => +document.querySelector('[data-testid=arrangement-library]').getBoundingClientRect().width.toFixed(1));
    const act = () => p.evaluate(() => { const a = document.activeElement; return a ? `${a.dataset.testid || a.tagName}|${a.textContent.trim().slice(0, 4)}|${a.getAttribute('aria-label')}` : null; });
    const u0 = await undoT(p);
    res.w0 = await lw(); await p.click('[data-testid=arrangement-library-collapse]'); await sleep(400); res.wc = await lw(); res.focusC = await act();
    await X.shot(p, `${res.id}-collapsed.png`);
    await p.keyboard.press('Enter'); await sleep(700); res.focusE = await act(); res.we = await lw();
    // also mouse expand path
    await p.click('[data-testid=arrangement-library-collapse]'); await sleep(300); res.focusC2 = await act(); await p.click('[data-testid=arrangement-library-expand]'); await sleep(700); res.focusE2 = await act(); res.we2 = await lw();
    const sep = p.locator('[data-testid=arrangement-library-separator]'); await sep.focus();
    const sv = () => p.evaluate(async () => { const s = document.querySelector('[data-testid=arrangement-library-separator]'); return { now: +s.getAttribute('aria-valuenow'), min: s.getAttribute('aria-valuemin'), max: s.getAttribute('aria-valuemax'), w: +document.querySelector('[data-testid=arrangement-library]').getBoundingClientRect().width.toFixed(1) }; });
    res.trans = await p.evaluate(() => getComputedStyle(document.querySelector('[data-testid=arrangement-library]')).transition); res.s0 = await sv(); await p.keyboard.press('ArrowRight'); await sleep(700); res.s1 = await sv(); await p.keyboard.press('ArrowRight'); await sleep(700); res.s2 = await sv();
    await p.keyboard.press('ArrowLeft'); await sleep(700); res.s3 = await sv(); await p.keyboard.press('ArrowLeft'); await sleep(700); res.s4 = await sv();
    for (let i = 0; i < 20; i++) { await p.keyboard.press('ArrowRight'); await sleep(40); } res.sMax = await sv();
    for (let i = 0; i < 20; i++) { await p.keyboard.press('ArrowLeft'); await sleep(40); } res.sMin = await sv();
    await p.keyboard.press('ArrowRight'); await sleep(100); await p.keyboard.press('ArrowRight'); await sleep(700); res.w320 = await lw();
    await p.click('[data-testid=arrangement-library-collapse]'); await sleep(700); res.wc2 = await lw(); await p.click('[data-testid=arrangement-library-expand]'); await sleep(700); res.we320 = await lw();
    res.u1 = await undoT(p);
    res.checks = { restore320: res.w320 === 320 && Math.abs(res.wc2 - 40) <= 1 && res.we320 === 320, collapsed: Math.abs(res.wc - 40) <= 1, restored: Math.abs(res.we - res.w0) <= 1 && Math.abs(res.we2 - res.w0) <= 1, focusC: /▶/.test(res.focusC) && /▶/.test(res.focusC2), focusE: /◀/.test(res.focusE) && /◀/.test(res.focusE2), steps: res.s1.now - res.s0.now === 16 && res.s2.now - res.s1.now === 16 && res.s3.now - res.s2.now === -16 && res.s4.now === res.s0.now, valueMatchesW: [res.s0, res.s1, res.s2, res.s3, res.s4].every((s) => Math.abs(s.now - s.w) <= 1), clamp: res.sMax.now === 480 && res.sMin.now === 288, noHist: u0 === res.u1 };
  },
  async 'RG-11B'(p, res) {
    const ph = () => p.evaluate(() => { const d = document.querySelector('[data-testid=arrangement-detail-panel]').getBoundingClientRect(); const s = document.querySelector('[data-testid=arrangement-timeline-scroller]').getBoundingClientRect(); const sep = document.querySelector('[data-testid=arrangement-detail-separator]'); return { h: +d.height.toFixed(1), top: d.top, scBottom: s.bottom, covered: s.bottom > d.top + 0.5, now: sep ? sep.getAttribute('aria-valuenow') : null }; });
    res.h0 = await ph(); res.startCollapsed = res.h0.h === 36;
    if (res.startCollapsed) { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); res.he0 = await ph(); }
    await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); res.hc = await ph(); await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); res.he = await ph();
    await p.locator('[data-testid=arrangement-detail-separator]').focus(); const seq = [];
    for (const k of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']) { await p.keyboard.press(k); await sleep(700); seq.push(await ph()); }
    for (let i = 0; i < 15; i++) { await p.keyboard.press('ArrowUp'); await sleep(40); } await sleep(700); res.hMax = await ph();
    for (let i = 0; i < 15; i++) { await p.keyboard.press('ArrowDown'); await sleep(40); } await sleep(700); res.hMin = await ph();
    res.seq = seq;
    await X.shot(p, `${res.id}-panel-min.png`);
    // S5
    await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
    await p.evaluate(() => { window.__vids = [...document.querySelectorAll('video')]; });
    res.n0 = await p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);
    await p.click('[data-testid=arrangement-video-expand]'); await sleep(800);
    res.float = await p.evaluate(() => ({ dialog: !!document.querySelector('[role=dialog]'), expanded: document.querySelector('[data-testid=arrangement-video-expand]') ? document.querySelector('[data-testid=arrangement-video-expand]').getAttribute('aria-expanded') : null, boxW: Math.round(document.querySelector('[data-testid=arrangement-video-box]').getBoundingClientRect().width) }));
    await X.shot(p, `${res.id}-floating.png`);
    await p.locator('[data-testid=arrangement-detail-toggle]').focus(); res.focusTog = await p.evaluate(() => document.activeElement.dataset.testid);
    await p.keyboard.press('Escape'); await sleep(600);
    res.afterEsc = await p.evaluate(() => ({ dialog: !!document.querySelector('[role=dialog]'), expanded: document.querySelector('[data-testid=arrangement-video-expand]') ? document.querySelector('[data-testid=arrangement-video-expand]').getAttribute('aria-expanded') : null, boxW: Math.round(document.querySelector('[data-testid=arrangement-video-box]').getBoundingClientRect().width), sameNodes: window.__vids.length === document.querySelectorAll('video').length && window.__vids.every((v, i) => v === document.querySelectorAll('video')[i] && v.isConnected), active: document.activeElement ? (document.activeElement.dataset.testid || document.activeElement.tagName) : null }));
    await p.keyboard.press('Enter'); await sleep(800);
    res.n1 = await p.evaluate(() => document.querySelectorAll('[data-clip-id]').length); res.stEnter = await L.status(p);
    res.checks = { valueNow: seq.map((s) => +s.now - +res.he.now).join() === '16,32,16,0' && res.hMax.now === '280' && res.hMin.now === '120' && seq.every((s) => Math.abs(+s.now - s.h) <= 1), collapsed: res.hc.h === 36, steps: seq[0].h - res.he.h === 16 && seq[1].h - seq[0].h === 16 && seq[3].h === res.he.h && res.he.h > 36, clamp: res.hMax.h <= 280 && res.hMin.h >= 120 && (res.hMax.h === 280) && (res.hMin.h === 120), notCovered: [res.h0, res.hc, res.he, res.hMax, res.hMin, ...seq].every((s) => !s.covered), floatOn: res.float.boxW !== res.afterEsc.boxW || res.float.expanded !== res.afterEsc.expanded, sameNodes: res.afterEsc.sameNodes, enterNoClip: res.n1 === res.n0 };
  },
  async 'RG-12'(p, res) {
    await L.setSnapOff(p); await L.seekTo(p, 3);
    const s = p.locator('[data-testid=arrangement-library-search]'); await s.click(); await s.fill(''); await p.keyboard.type('impact soft'); await sleep(500);
    res.results = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => o.offsetParent).map((o) => o.dataset.sourceId));
    await p.keyboard.press('ArrowDown'); await sleep(200); res.focus = await p.evaluate(() => (document.activeElement.dataset || {}).sourceId || document.activeElement.tagName);
    await p.keyboard.press('Enter'); await sleep(700); res.st = await L.status(p); res.tbl = await X.clipTable(p);
    // preview
    await s.click(); await s.fill(''); await sleep(400);
    const o = p.locator('[role=option][data-source-id="demo-stem-pulse"]'); await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(200);
    await p.evaluate(() => { window.__src.log = []; });
    await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(700);
    const a1 = await p.evaluate(() => ({ active: window.__src.active.size, playBtn: !!document.querySelector('button[aria-label="Pause"]'), pos: document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow'), tog: document.querySelector('[data-testid=arrangement-library-preview-toggle]').textContent.trim() }));
    await o.focus(); await p.keyboard.press('ArrowDown'); await sleep(900);
    const a2 = await p.evaluate(() => ({ active: window.__src.active.size, playBtn: !!document.querySelector('button[aria-label="Pause"]'), pos: document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow'), focus: document.activeElement.dataset.sourceId, tog: document.querySelector('[data-testid=arrangement-library-preview-toggle]').textContent.trim() }));
    const samples = []; for (let i = 0; i < 8; i++) { samples.push(await p.evaluate(() => window.__src.active.size)); await sleep(100); }
    res.preview = { a1, a2, samples, log: await p.evaluate(() => window.__src.log.slice(0, 12)) };
    await X.shot(p, `${res.id}-preview.png`);
    const add = res.tbl.find((r) => r.start === 3);
    res.checks = { found: res.results.includes('demo-soft-impact') && !res.results.includes('demo-slow-rise'), added: !!add && add.lane === 'music' && /Soft impact/.test(res.st), oneSource: a1.active === 1 && a2.active <= 1 && samples.every((n) => n <= 1), noTransport: !a1.playBtn && !a2.playBtn && a1.pos === '3' && a2.pos === '3' };
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p } = await L.openStudio(b, X.VPS[vp], id, net, { extraInit: srcInit }); res.geo = await L.geo(p); await rows[ROW](p, res); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
