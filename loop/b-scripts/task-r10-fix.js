const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'current-task.md');
let s = fs.readFileSync(file, 'utf8');
const rep = (a, b) => {
  if (!s.includes(a)) throw new Error(`missing: ${a.slice(0, 80)}`);
  s = s.replace(a, b);
};

rep(
  '- **Intermittent:** the landing is sometimes 10–56 ms late.',
  '- **Intermittent:** the landing is sometimes 10–56 ms late.\n' +
    '- **The window is not proven tight.** Round 5\'s *passing* RF5-2 evidence was vt ∈ [2.275, 2.311], and 2.275 would fail today\'s [2.29, 2.31]. Only round 6 (5/5) and most round-7 wraps sit inside it. The window is **not** relaxed, but a (c) or (m) outcome that ends at the Tech Lead quiet-Chrome run is a legitimate end state, not an evasion.',
);

rep(
  '- On swap, `startSlotPlayback(standby)` calls `play()` (asynchronous), and `lastSample` is seeded as `{ ctxTime: due.atCtx, unclamped: due.mediaTime }`. The seed assumes the standby sits exactly at `mediaTime` and starts exactly at `atCtx`.',
  '- On swap, `startSlotPlayback(standby)` calls `play()` (asynchronous), and `lastSample` is seeded as `{ ctxTime: due.atCtx, unclamped: due.mediaTime }`.\n' +
    '  - `lastSample` feeds **only** `mappingJump` (discontinuity detection).\n' +
    '  - The rate controller works on `drift = frame − unclamped` on every playing step. It therefore does see a standby that swapped in behind, but only once `playPending` is false.\n' +
    '  - It corrects with a bounded ramp (`videoRateCorrection`, `VIDEO_RATE_STEP` 0.05 per step, band ≤ 2). L6_1\'s `rateMax 1.3` is consistent with such a correction running inside the 300 ms window.\n' +
    '  - Verify all of this in the code first.',
);

rep(
  '  - **(d) positioned tolerance:** the standby was accepted up to 40 ms behind `mediaTime`, and the `lastSample` seed hides that offset from the rate controller. Look for `currentTime − mediaTime` near −0.04 at the swap, and `d` staying behind afterwards;',
  '  - **(d) positioned tolerance plus start latency:** the standby was accepted up to `VIDEO_POSITIONED_SECONDS` (0.04 s) behind `mediaTime`, and `play()` start latency adds to that. The bounded soft-sync ramp cannot recover the sum within 300 ms.\n' +
    '    - Look for `currentTime − mediaTime` well below 0 at the swap.\n' +
    '    - Look for `d` recovering only gradually in the 500 ms series, alongside the rate writes.',
);

rep(
  '  - **(d):** seed `lastSample` from the standby\'s real `currentTime` so the rate controller sees the offset. Or tighten the readiness tolerance to one frame (`state.frameInterval`) and fall back honestly when it is not met.',
  '  - **(d):** either of these.\n' +
    '    - Tighten the readiness tolerance to one frame (`state.frameInterval`), and fall back honestly when it is not met.\n' +
    '    - Or pre-roll the standby, so the swap-instant offset is ≈ 0.\n' +
    '    - **Not** a change to the `lastSample` seed: it does not feed the rate controller, so it would be a no-op with a green test.',
);

rep(
  '  - If A claims (d), the swap-instant offset in the failing wrap must be < −0.01 s.',
  '  - If A claims (d), the swap-instant offset must be < −0.01 s in every wrap that landed below 2.29.\n' +
    '  - If none of A\'s wraps lands late, A cannot *confirm* (a), (b) or (d). A then reports "inconclusive" and does not change source on that basis. It still reports the distribution of the swap-instant readiness offset across all wraps.',
);

rep(
  '  - The last label is shown wherever it fit in round 9: C compares `nLabels` per zoom against `c-round-7/runs/n5r-*.json`.',
  '  - The last label is shown wherever it fit in round 7: C compares `nLabels` per zoom against `c-round-7/runs/n5r-*.json`.',
);

fs.writeFileSync(file, s);
console.log('current-task.md corrected');
