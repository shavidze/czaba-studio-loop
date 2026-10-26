// C round 194 — compare store-tree-W vs store-ref-W (ref = round-193 tree on :5174): layout ±1 px, keep-list, token text contrast, events.
const fs = require('fs'); const path = require('path'); const O = path.join(__dirname, '..', 'out');
const out = { utc: new Date().toISOString(), method: 'tree :5173 vs ref :5174 (round-194 tree = 5 source grants restored from b-round-194/r195-granted-start)', vps: {} };
for (const W of [1440, 1280, 375]) {
  const tf = path.join(O, `store-tree-${W}.json`), rf = path.join(O, `store-ref-${W}.json`); if (!fs.existsSync(tf) || !fs.existsSync(rf)) { out.vps[W] = { missing: true }; continue; }
  const T = JSON.parse(fs.readFileSync(tf)), R = JSON.parse(fs.readFileSync(rf)); const v = out.vps[W] = {};
  for (const pg of Object.keys(T.pages)) {
    const t = T.pages[pg], r = R.pages[pg]; const o = v[pg] = { status: [t.status, r.status] };
    const bad = []; const keys = new Set([...Object.keys(t.boxes || {}), ...Object.keys(r.boxes || {})]);
    for (const k of keys) { const a = t.boxes[k], b = r.boxes[k]; if (k === '__docH') { if (Math.abs(a - b) > 1) bad.push({ k, tree: a, ref: b }); continue; } if (!a || !b) { bad.push({ k, tree: a || null, ref: b || null }); continue; } const d = Math.max(...a.map((x, i) => Math.abs(x - b[i]))); if (d > 1) bad.push({ k, tree: a, ref: b, d }); }
    o.layout = { boxes: keys.size, bad };
    o.keepSame = JSON.stringify(t.keep) === JSON.stringify(r.keep); if (!o.keepSame) o.keepDiff = Object.keys(t.keep).filter((k) => JSON.stringify(t.keep[k]) !== JSON.stringify(r.keep[k])).map((k) => ({ k, tree: JSON.stringify(t.keep[k]).slice(0, 300), ref: JSON.stringify(r.keep[k]).slice(0, 300) }));
    o.keep = { freeSamplesLinks: t.keep.freeSamplesLinks, limited: t.keep.limited, happy: t.keep.happy, netflix: t.keep.netflix };
    o.tokenMismatch = t.tokenMismatch; o.studioTheme = t.studioTheme;
    const rm = new Map(r.texts.map((x) => [x.key + '|' + x.text, x])); const worse = []; let matched = 0; const textSetSame = JSON.stringify(t.texts.map((x) => x.text).sort()) === JSON.stringify(r.texts.map((x) => x.text).sort());
    for (const x of t.texts) { const y = rm.get(x.key + '|' + x.text); if (!y) continue; matched++; if (x.ratio < y.ratio - 0.05) worse.push({ text: x.text.slice(0, 40), key: x.key, tree: +x.ratio.toFixed(2), ref: +y.ratio.toFixed(2), color: x.color }); }
    o.contrast = { texts: t.texts.length, refTexts: r.texts.length, matched, textSetSame, worse, lowTree: t.texts.filter((x) => x.ratio < (x.large ? 3 : 4.5)).length, lowRef: r.texts.filter((x) => x.ratio < (x.large ? 3 : 4.5)).length };
    o.ui = (t.ui || []).filter((u) => /input|placeholder|ph/i.test(JSON.stringify(u).slice(0, 80))).slice(0, 8);
    o.ev = { pageerror: t.ev.pageerror.length, hyd: t.ev.hyd.length, auth: t.ev.auth.length, remote: t.ev.remote, cons: t.ev.cons.length };
  }
  if (T.mobileMenu) v.mobileMenu = { tree: T.mobileMenu.freeSamples, ref: R.mobileMenu && R.mobileMenu.freeSamples, same: JSON.stringify(T.mobileMenu) === JSON.stringify(R.mobileMenu) };
}
fs.writeFileSync(path.join(O, 'store-compare-195.json'), JSON.stringify(out, null, 1));
for (const [W, v] of Object.entries(out.vps)) { if (v.missing) { console.log(W, 'missing'); continue; } for (const [pg, o] of Object.entries(v)) { if (pg === 'mobileMenu') { console.log(W, 'mobileMenu', JSON.stringify(o)); continue; } console.log(W, pg, 'status', o.status.join('/'), 'layoutBad', o.layout.bad.length, '/', o.layout.boxes, JSON.stringify(o.layout.bad).slice(0, 300), '| keepSame', o.keepSame, '| tok', o.tokenMismatch && o.tokenMismatch.length, '| contrast worse', o.contrast.worse.length, JSON.stringify(o.contrast.worse).slice(0, 300), 'low', o.contrast.lowTree, o.contrast.lowRef, 'textsSame', o.contrast.textSetSame, '| ev', JSON.stringify(o.ev)); } }
