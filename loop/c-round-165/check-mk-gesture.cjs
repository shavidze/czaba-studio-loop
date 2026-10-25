// C round 165: MK-GESTURE checker. Same logic for B's baseline enter-stab-probe.json and C's mk.json.
const fs = require('fs');
const BLOCKED = 'Editing does not work while dragging — let go first.';
const [, , file, prefix = ''] = process.argv;
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const out = {};
for (const W of ['1440', '1280']) {
  const r = d[prefix + W]; if (!r) { out[W] = { verdict: 'MISSING' }; continue; }
  const f = [];
  const inputOpen = r.afterF2.inputOpen === true || (r.afterF2.input !== undefined && r.afterF2.input !== null);
  if (r.duringFocus !== 'arrangement-marker') f.push('flag not reached by Shift+Tab');
  if (inputOpen) f.push('F2 opened the rename editor during the drag');
  if (r.afterF2.status !== BLOCKED) f.push(`status after F2 is not the blocked message: ${r.afterF2.status}`);
  if (r.afterF2.active !== 'arrangement-marker') f.push(`focus after F2 is ${r.afterF2.active}`);
  if (r.afterEnter) f.push('a key (Enter) was pressed during the drag');
  if (JSON.stringify(r.afterRelease.flags) !== '["Intro"]') f.push(`flags after release ${JSON.stringify(r.afterRelease.flags)}`);
  if (!/^Move clip/.test(r.afterRelease.status)) f.push('Move clip not committed');
  if (!(r.afterRelease.clipDx > 0)) f.push('clip did not move');
  if (r.afterUndo1.status !== 'Undo: Move clip') f.push(`undo1 status ${r.afterUndo1.status}`);
  if (r.afterUndo2.status !== 'Undo: Add Marker') f.push(`undo2 status ${r.afterUndo2.status}`);
  const texts = [r.afterF2, r.afterEnter, r.afterMove, r.afterRelease, r.afterUndo1, r.afterUndo2].filter(Boolean).flatMap((s) => [s.status, s.undo]).concat(r.seen || []);
  if (texts.some((t) => /Rename Marker/.test(t || ''))) f.push('Rename Marker appears in status/undo history');
  if (JSON.stringify(r.afterMove.flags) !== '["Intro"]' || (r.afterEnter && JSON.stringify(r.afterEnter.flags) !== JSON.stringify(r.afterMove.flags))) f.push('flag name changed and reverted during drag');
  out[W] = { verdict: f.length ? 'FAIL' : 'PASS', reasons: f };
}
console.log(JSON.stringify(out, null, 1));
