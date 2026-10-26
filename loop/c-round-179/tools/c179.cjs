// C round 179 — BADGE-BROWSER, FUNC-SMOKE-179 (+ WAV export sanity), PX-NET / REG-HYD, anon state.
// node c179.cjs <1440|1280> <attempt>   (DPR 2, fresh context, --disable-lcd-text). Helpers copied from c-round-178/tools.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const TAG = `c179-${W}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, utc: new Date().toISOString(), func: {}, errors: [] };
const save = () => L.save(L.OUT, `${TAG}.json`, { ...res, net });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { if (!a || !b) return null; const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const rgb = (s) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(s || ''); return m ? [+m[1], +m[2], +m[3]] : null; };
const D = 2;
const info = (el) => {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d');
  const mix = (layers) => { g.clearRect(0, 0, 1, 1); for (const l of layers) { g.fillStyle = '#000'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const stackOf = (e) => { const layers = []; let n = e; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; layers.unshift(b); const m = /rgba\([^)]*,\s*([\d.]+)\)$/.exec(b); const transparent = b === 'transparent' || (m && +m[1] === 0); if (!transparent && (!m || +m[1] === 1)) break; n = n.parentElement; } if (!n) layers.unshift('rgb(0,0,0)'); return layers; };
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const hdr = el.closest('header');
  return { box: [r.x, r.y, r.width, r.height], bg: cs.backgroundColor, border: cs.borderTopColor, borderWidth: cs.borderTopWidth, color: cs.color, cls: el.getAttribute('class'), text: (el.textContent || '').trim(), composite: mix(stackOf(el)), under: el.parentElement ? mix(stackOf(el.parentElement)) : null, headerBg: hdr ? mix(stackOf(hdr)) : null, inHeader: !!hdr };
};
const sig = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}:${e.dataset.clipKind}@${e.getAttribute('data-clip-start')}`).sort().join('|'));
const step = async (k, fn) => { try { res.func[k] = await fn(); } catch (e) { res.func[k] = { error: String(e).slice(0, 400) }; res.errors.push(`${k}: ${String(e).slice(0, 200)}`); } save(); };

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2, extraInit: X.tapInit }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), cookie: document.cookie, path: location.pathname }));
    res.anonCookies = (await o.ctx.cookies()).length;
    // BADGE-BROWSER
    await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
    const badge = p.locator('header span', { hasText: /^Demo collection — no sign-in required$/ });
    res.badgeCount = await badge.count();
    res.headerBadgeLikeSpans = await p.evaluate(() => [...document.querySelectorAll('header span')].map((s) => s.textContent.trim()).filter((t) => /collection/i.test(t)));
    if (res.badgeCount) {
      const i = await p.evaluate(info, await badge.first().elementHandle());
      const f = path.join(SHD, 'badge-full.png'); const img = decode(await p.screenshot({ path: f }));
      await p.screenshot({ path: path.join(SHD, 'badge-crop.png'), clip: { x: i.box[0] - 8, y: i.box[1] - 6, width: i.box[2] + 16, height: i.box[3] + 12 } });
      let n = 0, br = 0; const samples = [];
      const [x, y, w, h] = i.box;
      for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let Xp = Math.ceil(x * D); Xp < Math.floor((x + w) * D); Xp++) { if (Xp >= img.w || Y >= img.h) continue; const c = img.px(Xp, Y); n++; if (c[0] - c[2] >= 45) { br++; if (samples.length < 6) samples.push({ x: Xp / D, y: Y / D, c }); } }
      res.badge = { read: i, textRgb: rgb(i.color), borderRgb: rgb(i.border), crText: cr(rgb(i.color), i.composite), crBorder: cr(rgb(i.border), i.under || i.composite), crTextVsHeader: cr(rgb(i.color), i.headerBg), crBorderVsHeader: cr(rgb(i.border), i.headerBg), scan: { px: n, brass: br, samples }, shot: path.relative(L.ROOT, f) };
    }
    save();
    // FUNC-SMOKE-179: add a Library sound to a lane, play 1 s (real output tap), stop, export WAV, Undo
    await step('smoke', async () => {
      await L.setSnapOff(p);
      const s0 = await sig(p); const tl0 = (await L.clipsDom(p)).length;
      const add = await L.addAt(p, 'demo-middle-east', 'music', 0);
      const s1 = await sig(p); const clips = await L.clipsDom(p);
      await p.screenshot({ path: path.join(SHD, 'after-add.png') });
      await L.blur(p); await p.keyboard.press('Home'); await sleep(250);
      const pos0 = await L.posNow(p);
      await p.evaluate(() => window.__tapStart()); await p.keyboard.press('Space'); await sleep(1000); await p.keyboard.press('Space'); await sleep(150);
      const S = await p.evaluate(() => window.__tapStop());
      const pos1 = await L.posNow(p); await sleep(600); const pos2 = await L.posNow(p);
      const playPeak = +Math.max(0, ...S.map((s) => s.peak)).toFixed(4);
      const ctxs = await p.evaluate(() => (window.__h.ctxs || []).map((c) => ({ sr: c.sampleRate, state: c.state })));
      let exp = null;
      if (W === 1440) {
        const e = await X.exportWav(p, o.log, `${TAG}-proj`, { scope: 'project', format: 'wav' });
        exp = { recs: e.recs, status: e.st1 && e.st1.status, files: e.files.map((f2) => path.relative(L.ROOT, f2)) };
        if (e.files[0]) { const wv = X.wav(e.files[0]); exp.wav = { fmt: wv.fmt, frames: wv.frames, seconds: wv.seconds, peak: wv.peak, rms: wv.rms, nan: wv.nan, sha: wv.sha, first1s: X.winStats(wv.w, 0, 1), tail: X.winStats(wv.w, Math.max(0, wv.seconds - 0.5), wv.seconds) }; }
      }
      const undo = await X.key(p, 'Control+z'); const s2 = await sig(p);
      return { before: s0, clipsBefore: tl0, add, afterAdd: s1, addedClip: clips.find((c) => c.lane === 'music'), pos0, posAtStop: pos1, posAfterStop: pos2, advanced: +(pos1 - pos0).toFixed(3), stoppedStill: Math.abs(pos2 - pos1) < 1e-6, playPeak, tapSamples: S.length, ctxs, export: exp, undoStatus: undo, afterUndo: s2, undoRestored: s2 === s0 };
    });
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1200); }
  res.net = X.netOk(net); save(); await b.close();
  console.log(JSON.stringify({ W, ATT, error: res.error, errors: res.errors, fonts: res.fonts, anon: res.anon, anonCookies: res.anonCookies, badgeCount: res.badgeCount, badge: res.badge && { text: res.badge.read.text, color: res.badge.read.color, border: res.badge.read.border, crText: res.badge.crText, crBorder: res.badge.crBorder, crTextVsHeader: res.badge.crTextVsHeader, crBorderVsHeader: res.badge.crBorderVsHeader, scan: res.badge.scan }, smoke: res.func.smoke && { ...res.func.smoke, export: res.func.smoke.export }, net: res.net }, null, 1));
})();
