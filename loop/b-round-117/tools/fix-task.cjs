const fs = require('fs');
const p = '/home/runner/czaba-project/tmp/studio-real-loop/current-task.md';
let s = fs.readFileSync(p, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) { console.error('missing:', a.slice(0, 70)); process.exit(1); } s = s.replace(a, b); };
const preStart = s.indexOf('- **TV11 pre-check (STOP rule), before editing:**');
const preEnd = s.indexOf('**`clip-gain-fader.test.tsx` — CF11**');
s = s.slice(0, preStart) + [
  '- **TV11 pre-check, before editing (record, then continue):**',
  '  - **The puzzle:** l.517–519 show the stored 0.72, slider `-2.9`, readout `−2.9`. But l.527 pins the plain −20 px result at `F(-16.4)`, which is −12 dB from **−4.4** (the fixture\'s 0.6). l.538 asserts the music readout `−4.4` after both drags are undone. Both suggest the drags saw 0.6, not the committed 0.72. The only action in between is the Master drag (l.520).',
  '  - **A triangulates three values,** with a temporary local log that A removes and verifies by sha:',
  '    1. `storedVolume(api, \'music\')` right after the Master drag (after l.522);',
  '    2. the lane slider `value` and readout at that moment;',
  '    3. the anchor the plain drag uses (`readStoredValue()` at press).',
  '  - **(a)** All three are −2.9 / 0.72, so B misread something. A writes `S` from that anchor and explains why l.527/l.538 hold.',
  '  - **(b)** They differ, for example the Master gesture reverts a preceding committed lane volume, or the anchor is stale against the display. A does **not** stop and changes no app code for it:',
  '    - A writes l.528 as `F(observed anchor − 1.2)` (still a valid Shift-fine pin) and keeps the `not.toBe(plain)` line;',
  '    - A files the finding **A-R118-TV11-ANCHOR** in `a-round-118.md`, with the three observed values, the file and line, and a suggested severity (Medium if a committed value is lost);',
  '    - A completes stage 3b. B schedules the fix in the next planning.',
  '  - C repeats the triangulation in the browser as row **TV-ANCHOR** (§5).',
  '',
  '',
].join('\n') + s.slice(preEnd);
rep('  - the TV11 pre-check gives outcome (b).\n', '');
rep('| GV6 | Shift drag −25 px on the group → `F(-1.5)`. Mid-drag Shift toggle: a plain −10 px move gives `F(-6)`; then, with Shift held, a further −10 px gives `F(-6.6)`. No jump at the toggle: the value on the toggle move equals the previous value. |',
  '| GV6 | Shift drag −25 px on the group → `F(-1.5)`. Mid-drag Shift toggle, one pointer: a plain −10 px move gives `F(-6)`; then a **zero-delta** move at the same X with Shift held leaves `F(-6)` (no jump, no new preview); then, with Shift still held, a further −10 px gives `F(-6.6)`. |');
rep('| **G-GROUP-T3** (1440) | Export WAV twice over the same range covering the stems and SFX clips: group at 0 dB, then at −6.0 dB (ArrowLeft ×60 from 0 dB on the focused group fader) | RMS ratio (−6 vs 0) over a window where only stems/SFX sound = **0.5012 ± 0.002**. Music-only window ratio = 1.000 ± 0.002 |',
  '| **G-GROUP-T3** (1440) | The round-116 G-T3 method, applied to the group. **Mute the music lane** (lane M) so only the group members sound. Export WAV with the group at 0 dB, then at −6.0 dB (ArrowLeft ×60 from `+0.0 dB` on the focused group fader; read `−6.0 dB`). **Control pair:** unmute music, press group **Mute** (UM2), export at group 0 dB and at −6.0 dB | Members: peak and RMS ratio (−6 vs 0) = `10^(−6/20)` = **0.501187 ± 0.5 %**. Control (music alone, group muted): ratio **1.000 ± 0.5 %** |');
rep('| **G-GROUP-INF** (1440) | export with the group at −∞ | Window where only stems/SFX sound: 0 non-zero samples. The music window is unchanged |',
  '| **G-GROUP-INF** (1440) | Music lane muted, group at `−∞` (far left; read `−∞ dB`), export | Every sample exactly 0 (0 LSB). A residual with peak ≤ −120 dBFS is an observation for B (candidate Low). Above −120 dBFS = FAIL (Medium). The round-116 G-INF rule |');
rep('| **DOC-100/101** | read |', '| **TV-ANCHOR** (1440) | Music lane only: set the lane to a non-grid value by keyboard (e.g. `−2.9` via arrows from a context-free start is not possible, so use ArrowLeft ×29 → `−2.9 dB`), release; drag the Master −24 px; read the lane readout; then a plain −20 px lane drag and read Δ | The lane readout stays `−2.9` after the Master drag. The lane Δ is measured from `−2.9`. Any revert = finding (Medium if a committed value is lost); compare with A\'s A-R118-TV11-ANCHOR |\n| **DOC-100/101** | read |');
fs.writeFileSync(p, s);
console.log('ok');
