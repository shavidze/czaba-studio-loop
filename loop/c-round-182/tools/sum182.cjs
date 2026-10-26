const s = JSON.stringify;
for (const f of process.argv.slice(2)) { const j = require(require('path').resolve(f)); const g = j.gap.rest;
 console.log('=====', f, 'fonts', j.fonts, 'anon', s(j.anon), j.anonCookies, 'net', s(j.net));
 console.log('LIST', s(g.list), 'client', g.client, 'scrollH', g.scrollH, 'n', g.n, 'full', g.fullCount, 'gaps', s(g.gaps));
 console.log('ROWS y', s(g.rows.map((r) => r.box[1])), 'h', s(g.rows.map((r) => r.box[3])), 'mb', s(g.rows.map((r) => r.mb)), 'x/w', s([...new Set(g.rows.map((r) => r.box[0] + '/' + r.box[2]))]));
 const L = j.layout.rest; console.log('LAYOUT', s(L)); console.log('LAYOUT final==rest', s(j.layout.final) === s(L));
 console.log('SCROLL', s(j.scroll)); console.log('ARROW', s(j.arrow.presses.map((q) => [q.press, q.activeIdx, q.selected[0], q.top, q.bottom, q.inside, q.scrollTop])));
 const st = j.state; console.log('STATE hover', s(st.hover), 'row', s(st.hoverRow)); console.log('STATE sel', s({ c: st.selected.changed, bbox: st.selected.bbox, row: st.selected.rowBox, px: st.selected.px, other: st.selected.otherSelected }));
 console.log('STATE focus', s({ idx: st.focus.idx, row: st.focus.rowBox, fv: st.focus.fv, c: st.focus.changed, bbox: st.focus.bbox, ring: st.focus.ringPx }));
 const b = j.beh; console.log('BEH', s({ click: b.click, dbl: b.dbl && [b.dbl.added, b.dbl.restored, b.dbl.undo], enter: b.enter && [b.enter.added, b.enter.restored], drag: b.drag && [b.drag.added, b.drag.music, b.drag.restored], preview: b.preview, gap: b.gapClick, fin: b.finalRestored, err: b.error }));
}
