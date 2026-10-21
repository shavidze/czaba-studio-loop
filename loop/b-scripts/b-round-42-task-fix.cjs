const fs = require('fs');
const f = 'C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) { console.error('MISSING', a.slice(0, 60)); process.exit(1); } s = s.replace(a, b); };
const startHT = s.indexOf('### 4.1 R43-HT');
const endHT = s.indexOf('### 4.2 R43-U');
if (startHT < 0 || endHT < 0) { console.error('HT section'); process.exit(1); }
const ht = [
  '### 4.1 R43-HT — the Master hold tick (REAL playback, measured geometry)',
  '',
  '**Timing (important):** the meter **floors on stop** (`floorMasterMeter`, `meter.ts` l.93–101: `holdDb` → floor, so the hold layer is hidden), and while playing the hold falls back to the level `METER_PEAK_HOLD_MS` (1500 ms) after the peak. The latched thing after stop is the Peak/Clip button, not the hold tick. So the geometry is measured **during playback, inside the hold window**:',
  '- before Space, install a read-only page-side sampler (label it **SYNTHETIC instrumentation**, same class as the `window.__c` reader; no source change): a `MutationObserver` on the meter\'s `data-hold-db`, or a rAF loop, that records `{ t, holdDb, meterRect, tickRect, markRect, transform }` on every change;',
  '- REAL Space → let the `Soft impact` hit at 4 s pass → REAL Space **before 7 s**;',
  '- evaluate the sample with the **maximum** `holdDb` (and, for HT-TOP, every sample with `holdDb ≥ +6`).',
  '',
  'Record per case: the meter rect, the tick rect (the inner tick element of the hold layer), the 0 dBFS mark rect, `data-hold-db` and the computed `transform`.',
  '',
  '| Case | Steps | Expected |',
  '|---|---|---|',
  '| HT-TOP (1440) | REAL keyboard on Master until the readout is `+6.0 dB` (or a SYNTHETIC native setter + `change`; name it) → sampler → REAL Space → past the hit → REAL Space before 7 s | In every sample with `holdDb ≥ +6.0`: `tick.left ≥ meter.left`, `tick.right ≤ meter.right`, tick width 2 px (± 0.1). A zoomed screenshot of the meter taken **during** the hold window |',
  '| HT-ZERO | Fresh load, Master 0 dB, sampler, play past the hit, stop before 7 s | Max-hold sample ≈ `+0.0` (round-26 fixture): the tick overlaps the 0 dBFS mark; tick centre within 0.5 px of `meter.left + (60/66) × W` |',
  '| HT-LOW | Master −12 dB, same | Max-hold sample ≈ −12: tick centre within 0.5 px of `meter.left + (48/66) × W` |',
  '| HT-FLOOR | After any stop above | The tick is hidden (floor on stop, unchanged); the Peak button keeps its latch; a REAL click on Master Peak resets it; 0 entries |',
  '| HT-1280 | HT-TOP once at 1280×720 | As HT-TOP |',
  '| HT-TRACK | During HT-TOP, the same sampler on the SFX track meter | Its tick stays fully inside its own box (unchanged since round 27); record the rects |',
  '',
  '',
].join('\n');
s = s.slice(0, startHT) + ht + s.slice(endHT);
rep('- **Browser smoke** (A; one run if the server and daemon are up; `a-browse.json` or a fresh state file; not a PASS claim): Master +6 dB, play the demo `Soft impact` past the SFX hit, then read the tick and meter rects once at 1440×900.',
    '- **Browser smoke** (A; one run if the server and daemon are up; `a-browse.json` or a fresh state file; not a PASS claim): Master +6 dB, a read-only sampler on `data-hold-db`, play past the `Soft impact` hit and stop before 7 s, then report the tick and meter rects of the max-hold sample at 1440×900. The meter floors on stop, so rects read after stop show a hidden tick.');
rep('**Red/green runs:**\n- Write (a) first and run it against the snapshot `ArrangementMaster.tsx` → `a-round-43/red-run.txt`.',
    '**Red/green runs:**\n- For (a): write HT2/HT3 first and run them against the snapshot. Then choose the §0.1 form, write HT1 for that form, and run HT1–HT3 against the snapshot `ArrangementMaster.tsx` (HT1 must be red) → `a-round-43/red-run.txt`. Report this order.');
fs.writeFileSync(f, s);
console.log('task fixed');
