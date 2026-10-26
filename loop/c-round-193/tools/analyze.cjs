// C round 193 — compare store-tree-W vs store-head-W: tokens, layout ±1px, keep texts, fonts, text contrast below threshold.
const fs = require('fs'); const path = require('path'); const O = path.join(__dirname, '..', 'out');
const TOK = { '#ece6da': 'foreground', '#cfc7ba': 'secondary', '#a39b8e': 'muted', '#928a7d': 'dim', '#c9a46a': 'brand/accent/buy', '#d9b87f': 'brand-hover', '#0e0d0c': 'background/brand-foreground', '#d2776a': 'destructive', '#8fa382': 'positive', '#d9a35b': 'warning' };
const hex = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return s; const a = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); const h = '#' + a.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''); return a.length > 3 && a[3] < 1 ? h + '@' + a[3] : h; };
const out = { utc: new Date().toISOString(), vps: {} };
for (const W of [1440, 1280, 375]) {
  const T = JSON.parse(fs.readFileSync(path.join(O, `store-tree-${W}.json`))), H = JSON.parse(fs.readFileSync(path.join(O, `store-head-${W}.json`)));
  const v = out.vps[W] = {};
  for (const pg of ['home', 'store', 'product']) {
    const t = T.pages[pg], h = H.pages[pg]; const o = v[pg] = {};
    o.tokenMismatch = t.tokenMismatch; o.bodyBg = t.bodyBg; o.headBodyBg = h.bodyBg; o.studioTheme = t.studioTheme; o.fontsSame = JSON.stringify(t.fonts) === JSON.stringify(h.fonts); o.fonts = t.fonts;
    // layout
    const bad = []; const keys = new Set([...Object.keys(t.boxes), ...Object.keys(h.boxes)]);
    for (const k of keys) { const a = t.boxes[k], b = h.boxes[k]; if (k === '__docH') { if (a !== b) bad.push({ k, tree: a, head: b }); continue; } if (!a || !b) { bad.push({ k, tree: a || null, head: b || null }); continue; } const d = Math.max(...a.map((x, i) => Math.abs(x - b[i]))); if (d > 1) bad.push({ k, tree: a, head: b, d }); }
    o.layout = { boxes: keys.size, bad };
    // keep
    const kt = t.keep, kh = h.keep; o.keep = { same: JSON.stringify(kt) === JSON.stringify(kh), tree: { freeSamplesLinks: kt.freeSamplesLinks, limited: kt.limited, happy: kt.happy, netflix: kt.netflix, special: kt.special.map((x) => x.text.slice(0, 120)), freeDl: kt.freeDl }, head: { happy: kh.happy, netflix: kh.netflix, limited: kh.limited } };
    if (!o.keep.same) { o.keep.diffs = []; for (const k of Object.keys(kt)) if (JSON.stringify(kt[k]) !== JSON.stringify(kh[k])) o.keep.diffs.push({ k, tree: JSON.stringify(kt[k]).slice(0, 400), head: JSON.stringify(kh[k]).slice(0, 400) }); }
    // contrast
    const hm = new Map(h.texts.map((x) => [x.key + '|' + x.text, x]));
    const low = (x) => x.ratio < (x.large ? 3 : 4.5);
    o.texts = t.texts.length; o.headTexts = h.texts.length;
    o.lowTree = t.texts.filter(low).map((x) => { const hh = hm.get(x.key + '|' + x.text); const tok = TOK[hex(x.color).split('@')[0]] || null; return { text: x.text, key: x.key, color: hex(x.color), token: tok, bg: hex(x.bgEff), ratio: x.ratio, large: x.large, op: x.opacity, grad: x.grad, clipText: x.clipText, img: x.img, cls: x.cls.slice(0, 110), head: hh ? { color: hex(hh.color), bg: hex(hh.bgEff), ratio: hh.ratio, op: hh.opacity } : null, cls_: hh ? (hh.ratio >= x.ratio ? (hh.ratio < (x.large ? 3 : 4.5) ? 'pre-existing (HEAD also below)' : 'NEW below threshold (HEAD passed)') : 'pre-existing (HEAD lower)') : 'no HEAD match' }; });
    o.lowHeadCount = h.texts.filter(low).length;
    // token-coloured summary: min ratio per token colour
    const per = {}; for (const x of t.texts) { const c = hex(x.color); per[c] = per[c] || { n: 0, min: 99, tok: TOK[c.split('@')[0]] || null }; per[c].n++; per[c].min = Math.min(per[c].min, x.ratio); } o.perColour = per;
    o.ui = t.ui; o.headUi = h.ui; o.focus = t.focus.map((f) => [f.text.slice(0, 20), f.fv, f.outline, f.offset, f.ringRatio, f.bgAround]);
    o.ev = t.ev; o.headEv = h.ev;
  }
  v.product.btn = T.pages.product.btn; v.hireus = { btn: T.pages.hireus.btn, headBtn: { rest: H.pages.hireus.btn.rest.color + ' on ' + H.pages.hireus.btn.rest.bgOwn + ' ' + H.pages.hireus.btn.rest.ratio }, focus: T.pages.hireus.focus.map((f) => [f.text.slice(0, 20), f.fv, f.outline, f.ringRatio]), ev: T.pages.hireus.ev };
  v.mobileMenu = { tree: T.mobileMenu || null, head: H.mobileMenu ? H.mobileMenu.freeSamples : null };
}
fs.writeFileSync(path.join(O, 'store-compare.json'), JSON.stringify(out, null, 1));
for (const [W, v] of Object.entries(out.vps)) for (const pg of ['home', 'store', 'product']) { const o = v[pg]; console.log(W, pg, 'mism', o.tokenMismatch.length, o.bodyBg, '| fontsSame', o.fontsSame, '| layout bad', o.layout.bad.length, '/', o.layout.boxes, '| keep same', o.keep.same, o.keep.diffs ? JSON.stringify(o.keep.diffs).slice(0, 300) : '', '| happy', o.keep.tree.happy, o.keep.head.happy, 'netflix', o.keep.tree.netflix, o.keep.head.netflix, '| low tree', o.lowTree.length, 'low head', o.lowHeadCount, '/', o.texts); for (const l of o.lowTree) console.log('   LOW', l.ratio, l.color, l.token, 'on', l.bg, 'op', l.op, 'grad', !!l.grad, 'clip', !!l.clipText, '|', JSON.stringify(l.text), '| head', l.head && l.head.ratio, l.cls_); if (o.layout.bad.length) console.log('   LAYOUT', JSON.stringify(o.layout.bad).slice(0, 600)); }
