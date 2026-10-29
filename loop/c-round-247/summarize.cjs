// Recompute each row verdict from saved data (fix) and compare with the HEAD control.
// usage: node summarize.cjs out-fix/c247.json out-head/c247.json > table.txt
const fs = require('node:fs');
const fix = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).rows;
const head = fs.existsSync(process.argv[3] || '') ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')).rows : {};
const starts = (a, p) => !!a && typeof a.label === 'string' && a.label.startsWith(p);
const M = 'Music — set as the active track';
const ring = (a) => a && a.focusVisible === true && a.outlineStyle !== 'none' && parseFloat(a.outlineWidth) >= 1;
const inGroup = (r) => r.before && r.before.focus.row && r.before.focus.row.startsWith('group:');
const origin = (exp) => (r) => inGroup(r) && r.before.groups > r.after.groups && exp(r.after.focus);
const music = (a) => starts(a, M);
const V = {
  groupUndo: origin(music), groupUndoNatural: origin(music), ungroupRedo: origin(music), groupUndoY: origin(music),
  foldFocusUndo: origin(music), muteFocusUndo: origin(music), soloFocusUndo: origin(music), volumeFocusUndo: origin(music),
  collapsedUndo: (r) => origin(music)(r) && r.after.order.length === 4,
  nestedOuterUndo: origin((a) => a.el === 'arrangement-group-name'),
  bottomGroupUndo: origin((a) => starts(a, 'Stems — set as the active track')),
  groupUndoTab: (r) => r.afterShiftTab.el === 'arrangement-group-fold' && r.before.focus.el === 'arrangement-group-name' && r.before.focus.focusVisible && music(r.after.focus) && ring(r.after.focus) && r.after.groups === 0,
  playingUndo: (r) => r.before.focus.el === 'arrangement-group-name' && music(r.after.focus) && r.after.groups === 0,
  ungroupPrecedence: (r) => r.after.groups === 0 && music(r.after.focus),
  plainUngroup: (r) => r.after.groups === 0 && music(r.after.focus),
  noStealVideo: (r) => starts(r.before.focus, 'Video') && starts(r.after.focus, 'Video') && r.after.groups === 0,
  noStealMember: (r) => starts(r.before.focus, 'Stems') && starts(r.after.focus, 'Stems') && r.after.groups === 0,
  noStealBody: (r) => r.before.focus.el === 'BODY' && r.after.focus.el === 'BODY' && r.after.groups === 0,
  nestedInnerUndo: (r) => r.after.groups === 1 && r.after.focus.el === 'arrangement-group-name' && r.after.focus.row === r.before.focus.row,
  ungroupUndo: (r) => music(r.before.focus) && r.after.groups === 1 && music(r.after.focus),
  groupRedoMember: (r) => r.after.groups === 1 && music(r.after.focus),
  renameUndo: (r) => r.renamed.names[0] === 'Bus' && r.after.names[0] === 'Group 1' && r.after.focus.el === 'arrangement-group-name' && /Undo: Rename Group/.test(r.after.status || ''),
  undoButton: (r) => r.afterUndo.groups === 0 && /^Redo: Group Tracks/.test(r.afterUndo.focus.label) && r.afterRedo.groups === 1,
  volumeRemoval: (r) => r.z1.groups === 1 && /Undo: Volume/.test(r.z1.status) && r.z1.focus.el === 'arrangement-group-volume' && r.z2.groups === 1 && /Undo: Volume/.test(r.z2.status) && r.z2.focus.el === 'arrangement-group-volume' && r.z3.groups === 0 && /Undo: Group Tracks/.test(r.z3.status) && music(r.z3.focus),
  collapseReg: (r) => r.afterU.focus.el === 'arrangement-group-name' && ring(r.afterU.focus) && r.afterU.order.length === 3,
  groupFocusFollow: (r) => r.afterG.focus.el === 'arrangement-group-name' && music(r.afterUngroup.focus),
  markerReg: (r) => r.flags === 1 && r.flagsAfter === 0 && r.after.focus.el === 'arrangement-marker-add' && ring(r.after.focus),
  focusStability: (r) => r.pass === true,
};
const f = (a) => (a ? `${a.el === 'BUTTON' ? '' : a.el + ' '}${(a.label || '').slice(0, 40)}${a.focusVisible ? ' [fv ' + a.outline + ']' : ''}` : '-');
const keyFacts = (r) => {
  if (!r) return null;
  const pick = (s) => s && { groups: s.groups, status: s.status, titles: s.titles && { undo: s.titles.undo, redo: s.titles.redo }, order: s.order && s.order.map((o) => (o.startsWith("G:") ? "G" : o)), names: s.names };
  if (r.z1) return JSON.stringify({ start: pick(r.start), steps: pick(r.steps), z1: pick(r.z1), z2: pick(r.z2), z3: pick(r.z3), v: [r.start.value, r.steps.value, r.z1.value, r.z2.value] });
  if (r.afterUndo) return JSON.stringify({ u: pick(r.afterUndo), r: pick(r.afterRedo), uf: r.afterUndo.focus.label, rf: r.afterRedo.focus.label });
  if (r.after) return JSON.stringify(pick(r.after));
  if (r.afterU) return JSON.stringify(pick(r.afterU));
  if (r.afterUngroup) return JSON.stringify(pick(r.afterUngroup));
  return null;
};
const out = [];
for (const key of Object.keys(fix).sort()) {
  const r = fix[key]; const name = key.split('@')[0]; const h = head[key];
  let verdict;
  if (r.error) verdict = 'ERROR';
  else if (V[name]) { try { verdict = V[name](r) ? 'PASS' : 'FAIL'; } catch (e) { verdict = 'EVAL-ERR ' + e.message; } }
  else verdict = r.pass === 'info' ? 'INFO' : r.pass ? 'PASS' : 'FAIL';
  const after = r.after ? r.after.focus : r.z3 ? r.z3.focus : r.afterU ? r.afterU.focus : r.afterUngroup ? r.afterUngroup.focus : null;
  const hAfter = h && (h.after ? h.after.focus : h.z3 ? h.z3.focus : h.afterU ? h.afterU.focus : h.afterUngroup ? h.afterUngroup.focus : null);
  const same = h ? (keyFacts(r) === keyFacts(h) ? 'facts=HEAD' : 'facts≠HEAD') : 'no-head';
  out.push(`${key.padEnd(30)} ${verdict.padEnd(6)} errs=${(r.errors || []).length} | fix: ${f(after)} | head: ${f(hAfter)} | ${same}`);
  if (h && same === 'facts≠HEAD') out.push(`    fix  ${keyFacts(r)}\n    head ${keyFacts(h)}`);
}
console.log(out.join('\n'));
