const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md';
let t = fs.readFileSync(p, 'utf8');
const rep = (from, to) => {
  const n = t.split(from).length - 1;
  if (n !== 1) throw new Error(`expected 1 match, got ${n}: ${from.slice(0, 70)}`);
  t = t.replace(from, to);
};
rep(
  '- **EL:** music `50L`, set by a real drag or a keyboard End. Window [7, 23):',
  '- **EL:** music `50L`, set by a real drag or a keyboard **Home** (on a native range `min=-50`, Home = −50 = `50L`; End = `50R`). Window [7, 23):',
);
rep(
  '- Then keyboard End on the focused music Pan (one entry), and let it wrap at least twice more.',
  '- Then keyboard **Home** on the focused music Pan (→ `50L`, one entry), and let it wrap at least twice more.',
);
rep(
  '    - **It never writes `history.present`, history or React state.**',
  '    - **It never writes `history.present` or history.** The context override is a ref for audio only. The slider\'s visible value during a drag is the lane\'s local draft state (§2.4), because a controlled range whose `change` produces no state update snaps back.',
);
rep(
  '  - `commitTrackPan(trackId: string): void`\n    - Ends the gesture, clears the override, then `setTrackPan(trackId, overrideValue)`. That makes one entry, or none if the value is unchanged.\n  - `cancelTrackPan(trackId: string): void`\n    - Ends the gesture, clears the override, and pushes the stored pan back to the handle. No entry.',
  '  - `commitTrackPan(trackId: string): void`\n    - Ends the gesture, clears the override, then `setTrackPan(trackId, overrideValue)`. That makes one entry, or none if the value is unchanged.\n    - **A no-op when no pan gesture is active for that track.** `onLostPointerCapture` and the window `pointerup` can both fire, also after a blur-cancel; neither may re-commit.\n  - `cancelTrackPan(trackId: string): void`\n    - Ends the gesture, clears the override, and pushes the stored pan back to the handle. No entry.\n    - A no-op when no pan gesture is active for that track.',
);
rep(
  '   - `value={Math.round(displayPan * 50)}`, where `displayPan` = the override for this track, else `trackPanValue(track)`;',
  '   - `value={Math.round(displayPan * 50)}`, where `displayPan` = the lane\'s **local draft** (`useState` in `ArrangementLane`, set in `onChange` while this track\'s pan gesture is active, cleared on commit/cancel/blur), else `trackPanValue(track)`;',
);
rep(
  '     - if this track\'s pan gesture is active → `previewTrackPan(track.id, value / 50)`;',
  '     - if this track\'s pan gesture is active → set the local draft **and** `previewTrackPan(track.id, value / 50)`;',
);
rep(
  '   - pointer down → change ×3 → pointer up gives one entry, and the readout shows `NL`;',
  '   - pointer down → change ×3 → pointer up gives one entry, and the readout shows `NL`;\n   - **during** the pointer moves (before release), the slider\'s `value` and the readout follow the draft, while `history.past.length` and `present` are unchanged;',
);
rep(
  '  - (j) `setTrackPan` on the handle has no equal-value early return (expect the "repeated equal value" test).',
  '  - (j) `setTrackPan` on the handle has no equal-value early return (expect the "repeated equal value" test);\n  - (k) the lane drops the local draft, so the slider shows the stored value during a drag (expect the "during the pointer moves" UI test).',
);
rep(
  '- **Channels** (destination tap, as in round 30): RMS of the right channel over [12, 14) with music at 50L is ≥ 60 dB below its value at C (or at the tap floor). Report both channels at C and at 50L.',
  '- **Channels** (destination tap, as in round 30): RMS of the right channel over [12, 14) with music at 50L is ≥ 60 dB below its value at C (or at the tap floor). Report both channels at C and at 50L.\n- **Information (expected, not a bug):** at 50L the music **track** meter\'s left channel receives L+R (up to +6 dB) and may light its over-0 warning, because track meters are pre-Master. The export at Master −12 stays below full scale. Record it; do not file it.',
);
rep(
  '- If root commits again before you start, the new HEAD is the baseline.',
  '- `b-round-30-tree-sha256.txt` hashes the two CRLF auth files as they are in the worktree. If root normalises them before you start, exactly those 2 lines fail and nothing else; report that, and do not treat it as yours.\n- If root commits again before you start, the new HEAD is the baseline.',
);
fs.writeFileSync(p, t);
console.log('ok');
