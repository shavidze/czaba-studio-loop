const R = require('./report.cjs'); const fs = require('fs'); const MD = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-258.md';
const d = R.load();
const obs = [
  ['RP-METRO-MUTE', 'record only (rp.cjs, both vp): metronome on, Master Mute pressed -> output tap peak 0.484 before, exactly 0 over 145 frames after (music lane muted so only the click sounds); identical to round 199.'],
  ['RP-SPACE-EMPTY', 'record only: empty project, Space -> status "Nothing to play — add a clip from the library first.", playhead 0 -> 0, not playing (= B probe).'],
  ['RP-VIDEO-MARKER', 'record only: Snap on, grid 1, video clip dragged to the marker at 7.300 lands exactly at 7.300 (marker snap), one Undo restores 0.000 exactly; no lost clip, Undo intact.'],
  ['RP-NARROW', 'record only (narrow.cjs, leaf boxes of button/input/select/label>span in transport-edit/-centre/-view): 1024x768 0 pairs, 900x720 0, 864x720 1 pair (Delete × Zoom 1.2 px), 768x720 3 pairs max 48 px (Delete × Zoom (px/s)); 1280 and 1440: 0. No new overlap at >= 1024 px = GATE257-NARROW-TOOLBAR-OVERLAP stays Low as ruled (D-29z500). Evidence out/narrow/'],
];
for (const [id, t] of obs) { d.observations.push(`${id} — ${t}`); fs.appendFileSync(MD, `- **${id}** (observation): ${t}\n`); }
R.saveJ(d);
const pg = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-258/progress.json'; const p = JSON.parse(fs.readFileSync(pg)); for (const [id] of obs) if (!p.done.includes(id)) p.done.push(id); p.next = 'RR-PERF alone, then RG-SMOKE, G258-3, SOURCE-SCOPE end'; fs.writeFileSync(pg, JSON.stringify(p));
