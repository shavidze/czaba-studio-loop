// node analyze158.cjs <c158-W.json> -> SURFACE-STYLE / ICON / CONTRAST tables (markdown + json)
const C = require('./color158.cjs'); const fs = require('fs');
const r = require(process.argv[2]);
const V = r.S0.vars; const FG = C.parse(V['--color-foreground']), BGc = C.parse(V['--color-background']), BR = C.parse(V['--color-brand']), AC = C.parse(V['--color-accent']);
const I = r.I; const rows = []; let fails = [];
const chk = (id, name, raw, ok, exp) => { rows.push({ id, name, raw, exp, ok }); if (!ok) fails.push(`${id} ${name}: got ${raw}, expected ${exp}`); };
const isFg = (s, a) => C.eq(C.parse(s), FG, a);
const isT = (s) => { const c = C.parse(s); return c && c.a === 0; };
const special = new Set([I.play, I.exp]);
// (a) rest at S0
for (const b of r.S0.btns) {
  chk('a', `${b.key} border-width`, b.bw, b.bw === '1px', '1px');
  chk('a', `${b.key} radius`, b.rad, b.rad === '8px', '8px');
  if (b.i === I.exp) { chk('f', 'Export border', b.bt, C.eq(C.parse(b.bt), BR, 1) && [b.br, b.bb, b.bl].every((x) => x === b.bt), 'brand #C9A46A'); chk('f', 'Export text', b.color, C.eq(C.parse(b.color), BR, 1), 'brand'); chk('f', 'Export bg', b.bg, isFg(b.bg, 0.05), 'fg/0.05'); continue; }
  if (b.i === I.play) { chk('e', 'Play rest bg', b.bg, isFg(b.bg, 1), 'fg opaque'); chk('e', 'Play text', b.color, C.eq(C.parse(b.color), BGc, 1), 'background #0E0D0C'); chk('a', 'Play border', b.bt, isT(b.bt), 'transparent'); continue; }
  chk('a', `${b.key} bg`, b.bg, isFg(b.bg, 0.05), 'fg/0.05');
  const cue = b.i === I.follow && b.cls.includes('text-brand');
  chk('a', `${b.key} border`, b.bt, isT(b.bt) && isT(b.br) && isT(b.bb) && isT(b.bl), 'transparent');
}
// (b)/(c)/(d) hover & press at S0
for (const [i, h] of Object.entries(r.S0hover)) {
  const b = r.S0.btns[i]; const exp = b.disabled ? 0.05 : +i === I.play ? 0.92 : 0.08;
  chk(b.disabled ? 'd' : +i === I.play ? 'e' : 'b', `${h.key} hover${b.disabled ? ' (disabled)' : ''}`, h.bg, h.hover === true && isFg(h.bg, exp), `fg/${exp}${+i === I.play ? '' : ''}`);
}
for (const [i, h] of Object.entries(r.S0press)) { const exp = +i === I.play ? 0.88 : 0.12; chk(+i === I.play ? 'e' : 'c', `${h.key} pressed`, h.bg, h.active === true && isFg(h.bg, exp), `fg/${exp}`); }
// (e) Pause
const P = r.play2s.pause; chk('e', 'Pause rest bg', P.rest.bg, isFg(P.rest.bg, 1), 'fg opaque'); chk('e', 'Pause text', P.rest.color, C.eq(C.parse(P.rest.color), BGc, 1), 'background'); chk('e', 'Pause hover', P.hover.bg, isFg(P.hover.bg, 0.92), 'fg/0.92'); chk('e', 'Pause pressed', P.press.bg, isFg(P.press.bg, 0.88), 'fg/0.88');
// S1 hover/press (range state)
for (const [i, o] of Object.entries(r.S1hoverPress)) { if (+i === I.play) continue; const b = r.S1.btns[i]; chk('b', `S1 ${o.hover.key} hover`, o.hover.bg, isFg(o.hover.bg, 0.08), 'fg/0.08'); if (o.press) chk('c', `S1 ${o.press.key} pressed`, o.press.bg, isFg(o.press.bg, 0.12), 'fg/0.12'); }
const D = r.S1.btns[I.del]; chk('cue', 'Delete with range border', D.bt, C.eq(C.parse(D.bt), AC, 1), 'accent'); chk('cue', 'Delete with range text', D.color, C.eq(C.parse(D.color), AC, 1), 'accent'); chk('cue', 'Delete with range bg', D.bg, isFg(D.bg, 0.05), 'fg/0.05');
// (g) Loop on
const LO = r.loopOn; for (const k of ['rest', 'hover', 'press']) chk('g', `Loop on ${k}`, LO[k].bg, C.eq(C.parse(LO[k].bg), AC, 0.2) && (k !== 'hover' || LO[k].hover) && (k !== 'press' || LO[k].active), 'accent/0.2');
chk('g', 'Loop on border/text', `${LO.rest.border} ${LO.rest.color}`, C.eq(C.parse(LO.rest.border), AC, 1) && C.eq(C.parse(LO.rest.color), AC, 1), 'accent');
// (h)
for (const b of r.S0.btns) { chk('h', `${b.key} transition`, `${b.tp} | ${b.td} | ${b.ttf}`, b.tp === 'background-color, color' && b.td === '0.18s, 0.18s' || (b.tp === 'background-color, color' && b.td === '0.18s'), 'background-color, color | 0.18s | cubic-bezier(0.2, 0.8, 0.2, 1)'); }
for (const b of r.S0.btns) { const ttfOk = /^cubic-bezier\(0\.2, 0\.8, 0\.2, 1\)(, cubic-bezier\(0\.2, 0\.8, 0\.2, 1\))?$/.test(b.ttf); chk('h', `${b.key} timing`, b.ttf, ttfOk, 'cubic-bezier(0.2, 0.8, 0.2, 1)'); }
for (const b of r.reducedMotion.btns) chk('h-rm', `${b.key} reduced-motion duration`, b.td, /^0s(, 0s)*$/.test(b.td) || b.tp === 'none' || b.tp === 'all' && b.td === '0s', '0s');
// (i)
for (const [i, f] of Object.entries(r.focusRing)) chk('i', `${f.key} focus ring`, `fv=${f.fv} ${f.shadow}`, f.fv && /rgb\(201, 164, 106\) 0px 0px 0px 2px/.test(f.shadow), 'focus-visible + 2px brand ring');
// ICON
const IC = []; const icon = (nm, rec, color, ax, axExp, textExp) => { const s = rec.svgs; const ok = s.length === 1 && s[0].w === 16 && s[0].h === 16 && s[0].swAttr === '1.5' && s[0].ariaHidden === 'true' && s[0].stroke === color && ax.name === axExp && rec.text === textExp; IC.push({ nm, svg: s, color, ax, text: rec.text, ok }); if (!ok) fails.push(`ICON ${nm}`); };
icon('Play', r.iconPlay.play, r.iconPlay.play.color, r.iconPlay.play.ax, 'Play', 'Play');
icon('Pause', { svgs: P.svgs, text: P.text }, P.rest.color, P.ax, 'Pause', 'Pause');
icon('Zoom to selection', r.iconPlay.zr, r.iconPlay.zr.color, r.iconPlay.zr.ax, 'Zoom to selection (Z)', '');
const EXPT = ['↤', '↶Undo', '↷Redo', '✂ Split', '⌫ Delete', '↻ Loop', 'Follow', '↩ Zoom', 'Fit', 'Export'];
const others = r.iconPlay.others.map((o) => o.text); const othersOk = JSON.stringify(others) === JSON.stringify(EXPT) && r.iconPlay.others.every((o) => o.nSvg === 0) && r.iconPlay.glyphsInTransport === false;
if (!othersOk) fails.push(`ICON others ${JSON.stringify(others)}`);
// CONTRAST (computed composite) at S0 rest, S0 hover, S2 rest (range), S2 hover
const CT = [];
const ctr = (state, b, bgStr) => { if (b.disabled) { CT.push({ state, key: b.key, disabled: true }); return; } const bg = C.composite(bgStr || b.bg, b.chain); const fg = C.parse(b.color); const ratio = +C.ratio(fg, bg).toFixed(2); const isIcon = b.svgs.length > 0; const textOk = b.text.trim() ? ratio >= 4.5 : true; const iconOk = isIcon ? ratio >= 3 : true; CT.push({ state, key: b.key, fg: C.fmt(fg), bg: C.fmt(bg), ratio, text: !!b.text.trim(), icon: isIcon, ok: textOk && iconOk }); if (!(textOk && iconOk)) fails.push(`CONTRAST ${state} ${b.key} ${ratio}`); };
for (const b of r.S0.btns) ctr('S0 rest', b);
for (const [i, h] of Object.entries(r.S0hover)) { const b = r.S0.btns[i]; ctr('S0 hover', { ...b, disabled: b.disabled }, h.bg); }
for (const b of r.S2contrast.btns) ctr('S2 rest (range)', b);
for (const [i, h] of Object.entries(r.S2hover)) { const b = r.S2contrast.btns[i]; ctr('S2 hover (range)', b, h.bg); }
const PX = r.pixels;
const out = { vp: r.vp, vars: V, hoverMQ: r.hoverMQ, rows, fails, icons: IC, othersOk, others, contrast: CT, pixels: PX };
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
const md = [];
md.push(`### SURFACE-STYLE ${r.vp} (hover MQ ${r.hoverMQ})`, '', '| (x) | Check | Raw computed | Expected | Result |', '|---|---|---|---|---|');
for (const x of rows) md.push(`| ${x.id} | ${x.name} | \`${String(x.raw).replace(/\|/g, '¦')}\` | ${x.exp} | ${x.ok ? 'PASS' : '**FAIL**'} |`);
md.push('', `### CONTRAST-V3A ${r.vp}`, '', '| State | Button | fg | composited bg | ratio | text/icon | Result |', '|---|---|---|---|---|---|---|');
for (const x of CT) md.push(x.disabled ? `| ${x.state} | ${x.key} | — | — | — | disabled (exempt) | listed |` : `| ${x.state} | ${x.key} | ${x.fg} | ${x.bg} | ${x.ratio} | ${x.text ? 'text' : ''}${x.icon ? ' icon' : ''} | ${x.ok ? 'PASS' : '**FAIL**'} |`);
md.push('', `Pixel samples ${r.vp}:`, '', '| Button | state | bg px | fg px | ratio |', '|---|---|---|---|---|');
for (const [k, v] of Object.entries(PX)) for (const st of ['rest', 'hover']) md.push(`| ${k} | ${st} | ${v[st].bg} | ${v[st].fg} | ${v[st].ratio} |`);
fs.writeFileSync(process.argv[3].replace(/\.json$/, '.md'), md.join('\n'));
console.log(JSON.stringify({ vp: r.vp, nRows: rows.length, fails, othersOk, icons: IC.map((x) => `${x.nm}:${x.ok}`) }, null, 1));
