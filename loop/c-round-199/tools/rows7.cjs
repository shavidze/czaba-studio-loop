const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const num = (s) => Number(String(s).replace(/−/g, '-').replace(/[^\d.\-]/g, ''));
const dbOf = (s) => (s == null ? null : /∞/.test(s) ? -Infinity : num(s));
async function makeGroup(p, res) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 0); await L.addAt(p, 'demo-slow-rise', 'sfx', 0);
  await p.click(L.nameSel('music')); await sleep(150); await p.keyboard.down('Shift'); await p.click(L.nameSel('stems')); await p.keyboard.up('Shift'); await sleep(150);
  await p.keyboard.press('Control+g'); await sleep(600); res.gst = await L.status(p);
  const nm = p.locator('[data-testid=arrangement-group-name]').first(); await nm.focus(); await p.keyboard.press('F2'); await sleep(300);
  const inp = p.locator('[data-testid=arrangement-group-name-input]'); res.renameInput = await inp.count();
  if (res.renameInput) { await inp.fill('SFX ქუჩა'); await p.keyboard.press('Enter'); await sleep(400); }
  await L.blur(p);
  res.gname = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-name]')].map((g) => g.textContent.trim()));
}
const lanes = (p) => p.evaluate(() => { const row = document.querySelector('[data-testid=arrangement-group-row]'); const rb = row && row.getBoundingClientRect(); return { row: rb ? { top: rb.top, h: rb.height } : null, lanes: [...document.querySelectorAll('[data-track-id]')].map((t) => { const h = t.querySelector('[data-testid=arrangement-track-header]'); const r = t.getBoundingClientRect(); const hb = h ? h.getBoundingClientRect() : null; const nameEl = t.querySelector('[data-testid=arrangement-track-header] button[aria-label$="set as the active track"]'); return { id: t.dataset.trackId, visible: r.height > 0 && getComputedStyle(t).display !== 'none', top: Math.round(r.top), h: Math.round(r.height), nameX: nameEl ? Math.round(nameEl.getBoundingClientRect().left) : null, hdrX: hb ? Math.round(hb.left) : null, pl: h ? getComputedStyle(h).paddingLeft : null }; }) }; });
const rows = {
  async 'RG-17'(p, res) {
    await makeGroup(p, res);
    res.l0 = await lanes(p); await X.shot(p, `${res.id}-group.png`);
    const fold = p.locator('[data-testid=arrangement-group-fold]').first();
    await fold.click(); await sleep(500); res.l1 = await lanes(p); res.foldExp1 = await fold.getAttribute('aria-expanded'); await X.shot(p, `${res.id}-collapsed.png`);
    await fold.click(); await sleep(500); res.l2 = await lanes(p); res.foldExp2 = await fold.getAttribute('aria-expanded');
    // group mute while playing
    await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
    await p.evaluate(() => window.__tapStart()); await p.keyboard.press('Space'); await sleep(1000);
    const tm = await p.evaluate(() => performance.now()); await p.click('[data-testid=arrangement-group-mute]'); await sleep(3900);
    res.gm = await p.locator('[data-testid=arrangement-group-mute]').getAttribute('aria-pressed');
    const meters = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-track-id]')].map((t) => { const m = t.querySelector('[data-testid=arrangement-track-meter]'); return [t.dataset.trackId, m ? { peak: m.getAttribute('data-peak'), level: m.getAttribute('data-level-db') } : null]; })));
    await L.blur(p); await p.keyboard.press('Space'); await sleep(200);
    const T = await p.evaluate(() => window.__tapStop());
    const post = T.filter((s) => s.t >= tm + 150 && s.t <= tm + 3800); const pre = T.filter((s) => s.t < tm && s.t > tm - 800);
    const childMax = (ln, a) => Math.max(...a.map((s) => dbOf(s.meters[ln + ':lv'] === '-inf' ? '−∞' : s.meters[ln + ':lv'])).filter((x) => x !== null));
    const within4 = post.filter((s) => s.t <= tm + 4000); const last = post.filter((s) => s.t > tm + 3300 && s.t <= tm + 3800);
    res.gmute = { pressed: res.gm, metersEnd: meters, preTap: +Math.max(...pre.map((s) => s.peak)).toFixed(4), postTapMin: +Math.min(...post.map((s) => s.peak)).toFixed(5), postTapMinDb: +(20 * Math.log10(Math.min(...post.map((s) => s.peak)))).toFixed(1), musicPeakAt4s: childMax('music', last), stemsPeakAt4s: childMax('stems', last), sfxPeakAt4s: childMax('sfx', last), firstMusicBelow60: Math.round((post.find((s) => s.meters['music:lv'] === '-inf' || dbOf(s.meters['music:lv']) <= -60) || { t: NaN }).t - tm), firstStemsBelow60: Math.round((post.find((s) => s.meters['stems:lv'] === '-inf' || dbOf(s.meters['stems:lv']) <= -60) || { t: NaN }).t - tm), sfxLevelAtEnd: last.length ? last[last.length - 1].meters['sfx:lv'] : null, preTapDb: 0, method: 'children: track meter data-level-db (live, 20 dB/s release) ≤ −60 dB within 4 s — data-peak is the held max and never falls; SFX: output tap above −60 dB until 3.8 s after the mute' };
    const vis = (l, id) => l.lanes.find((x) => x.id === id).visible;
    res.checks = { named: res.gname.some((g) => g.replace(/^▣/, '') === 'SFX ქუჩა'), row: !!res.l0.row, indented: ['music', 'stems'].every((ln) => { const a = res.l0.lanes.find((x) => x.id === ln), s = res.l0.lanes.find((x) => x.id === 'sfx'); return a.nameX > s.nameX; }), collapsedHides: !res.l1.lanes.some((x) => x.id === 'music' || x.id === 'stems') && res.l1.lanes.some((x) => x.id === 'sfx'), expandShows: vis(res.l2, 'music') && vis(res.l2, 'stems'), gm: res.gm === 'true', childrenSilent: res.gmute.musicPeakAt4s <= -60 && res.gmute.stemsPeakAt4s <= -60, sfxSounds: res.gmute.postTapMinDb > -60 };
  },
  async 'RG-T3B'(p, res) {
    await makeGroup(p, res);
    const G = '[data-testid=arrangement-group-volume]'; const M = '[data-testid=arrangement-master] input[type=range]';
    const rd = (sel) => p.evaluate((sel) => { const s = document.querySelector(sel); return s ? { value: s.value, text: s.getAttribute('aria-valuetext'), w: s.getBoundingClientRect().width } : null; }, sel);
    async function drag(sel, dx, shift) { const b = await p.locator(sel).boundingBox(); const x0 = b.x + b.width / 2, y = b.y + b.height / 2; if (shift) await p.keyboard.down('Shift'); await p.mouse.move(x0, y); await p.mouse.down(); await sleep(60); for (let k = 1; k <= Math.abs(dx); k++) await p.mouse.move(x0 + Math.sign(dx) * k, y); await sleep(60); await p.mouse.up(); if (shift) await p.keyboard.up('Shift'); await sleep(300); await L.blur(p); return rd(sel); }
    res.g0 = await rd(G); res.g1 = await drag(G, -20, false); await X.key(p, 'Control+z');
    res.m0 = await rd(M); res.mPlain = await drag(M, -20, false); await X.key(p, 'Control+z'); res.mBack = await rd(M); res.mShift = await drag(M, -20, true); await X.key(p, 'Control+z');
    const dP = num(res.mPlain.value) - num(res.m0.value), dS = num(res.mShift.value) - num(res.mBack.value);
    res.master = { plain: +dP.toFixed(3), shift: +dS.toFixed(3), ratio: +(dS / dP).toFixed(4), w: res.m0.w };
    res.checks = { groupDb: /^[−-]?\d+\.\d dB$/.test(res.g1.text) && res.g1.text !== res.g0.text, masterBack: res.mBack.value === res.m0.value, shiftTenth: dP < 0 && dS < 0 && Math.abs(dS / dP - 0.1) <= 0.03 };
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p, log } = await L.openStudio(b, X.VPS[vp], id, net, { extraInit: X.tapInit }); res.geo = await L.geo(p); await rows[ROW](p, res, log); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
