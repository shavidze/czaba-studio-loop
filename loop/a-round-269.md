# A round 269 — SABA-B-7: clip volume envelope on the lane fader's dB scale

**STOP: none.** Slowest covering test: 1331 ms (`header-meter-envelope-strings-ui.test.tsx` HM1, first test of the file), which is 26 % of the 5000 ms vitest default and below the L11/L31 50 % line. `clip-envelope-ui.test.tsx`: 31 tests in 3903 ms total.

## Baseline (L29 drift clause)
- `git rev-parse HEAD` → `5e73fe93a19da34cb723c448c7796c5a2ae8a16d` (root commit "docs(agents): write all agents in English, add a Georgian guide" after the planned `3058a7c`).
- `git diff --stat 3058a7c HEAD -- app` → empty (0 lines). K1 differs from the task; under L29 this drift is accepted with a note.
- K2–K4 re-ran at the start and matched the task: `95:`; `122:`, `137:`, `143:`; `261:`, `267:`, `370:`, `400:`, `401:`, `402:`.

## Changed files (`git status --porcelain`, all within the grants)
```
 M app/components/arrangement/ArrangementClipEnvelope.tsx
 M app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx
 M app/lib/arrangement/__tests__/envelope.test.ts
 M app/lib/arrangement/__tests__/export-range.test.ts
 M app/lib/arrangement/envelope.ts
 M app/lib/arrangement/graph.client.ts
?? docs/implementation/2026/quarter-IV/200-saba-b-7-envelope-db-taper.md
```
Full diff: `a-round-269/diff.patch` (code and tests; regenerated at hand-over). Covering-run log: `a-round-269/covering.txt`.

## Implementation
I applied B's `b-round-268/sketch.diff` as-is (`patch -p0`). It matches §3.1–§3.5:
- `clipEnvelopeDepthFromGain` and `clipEnvelopeGainFromDepth` use `TRACK_VOLUME_DB_MIN`, imported from `track-volume-db.ts`;
- interpolation is dB-linear and unclamped when both gains are > 0, and depth-linear when either gain is 0; the stored gain is returned exactly at f = 0/1 and outside the points;
- `clipEnvelopeRampSteps` builds the steps, with `CLIP_ENVELOPE_RAMP_STEP_DB = 0.5`;
- `scheduleClipEnvelopeGain` keeps `setValueAtTime(initial)` and adds one `linearRampToValueAtTime` per step;
- the component sets `top` and the polyline y to depth, and the drag goes through depth, with dy = 0 keeping the stored gain.

**One deviation from the sketch:** I reordered the early return in `interpolateEnvelopeGain`. `fraction <= 0 || leftGain === rightGain` → leftGain, then `fraction >= 1` → rightGain. The sketch returned the same values for every input: when leftGain === rightGain, both branches return the same number. The behaviour does not change; C's HUNK-SCOPE should not read this as an unexplained diff.

**Hunk scope:**
- `graph.client.ts`: only the import block (l.1–10) and the body of `scheduleClipEnvelopeGain` changed.
- `ArrangementClipEnvelope.tsx`: only the import, the drag mapping in `handlePointPointerMove`, the point `top` and the polyline vertices changed. No class tokens changed.

## Test rewrites (§5.1). Every rewrite asserts as much as before or more; no `expect` was removed without a replacement
| Test | Old | New |
|---|---|---|
| EV1 (title tail "linear" → "dB-linear") | 0.6256 at 6/10 and clip 8 | `V_MIDPOINT_GAIN = √0.2512` (−6.0 dB) at 1e-12, plus an extra assertion: dB at 6 = half of 0.2512's dB at 1e-9. Exact at the points: unchanged |
| EV2 | 0.75; 0.6667 | `round(√½·1e4)/1e4` = 0.7071 (written this way to satisfy Biome's approximate-constant lint); 0.1 (−20 dB = depth 1/3) |
| EV4 | 0.6256 | `V_MIDPOINT_GAIN` at 1e-12 |
| EV5a, EV5b, EV5c, EV5e, EV6b | literal 3–5 call list | `expectEnvelopeSteps`: the first `set` (value and time); each knot's last ramp lands exactly on [gain, time] (rounded the same way as before); step count per segment is a **literal** (1/24/24/1; 12/24/1; 12/12; 1/13/1), independent of the helper; each consecutive raw step ≤ 0.5 dB + 1e-9 (skipped only at a 0 gain); times strictly increasing; total call count exact, so the last call is the window end. EV5b also keeps `gain.value` at 1e-12 |
| XR2 (export-range) | `set 0.5`, `ramp 1@1`, `ramp 1@5` | `value` ≈ 10^(−30/20) at 1e-12; exactly 62 calls; set at 0; for k = 1…60, step k is a ramp at time k/60 with value 10^((−30 + k/2)/20) (both at 1e-12); `['ramp',1,1]` and `['ramp',1,5]` exact |
| EU2 | `10.000:0.7500` | `10.000:0.7071` |
| EU3 quarter (title tail → "gives −15 dB (0.1778)") | 0.7500, −2.5 dB | status `−15.0 dB` (preview and after release), `data-envelope` and `data-gain` 0.1778 |
| EU3 press/cancel | `0.0012` | `0.0447` |
| EU3 A key | `6.000:0.7500;…` | `6.000:0.1778;…` |
| EU7 line (all points outside) | string `0,0.7488 80,0.7488` | `expectLineVertices`: vertex count exact, x exact, y = 0.2 ± 1e-4 (numeric compare, allowed by §5.1) |
| EU5 (title tail "y = 1 − gain" → "y = its dB depth") | string with 0.7488 | same vertex helper: 5 vertices, x exact, y 0/0/0.2/0/0 ± 1e-4. The m1 line string and the "no line" assertions are unchanged |

All K9 title prefixes are kept: `grep -c` → 8 / 6 / 1.

## New rows (§5.2)
- `envelope.test.ts`, describe `SABA-B-7 dB envelope (DB)`: DB1–DB6, as specified.
  - DB2 also covers NaN for both functions.
  - DB4 also pins the constant = 0.5, the mid-window first step at −15.5 dB and its time 1 + 3/90.
  - DB5 also pins the midpoint ≈ −33.01 dB.
  - DB6 also pins the added point `{2, 0.0316}`.
- `clip-envelope-ui.test.tsx`, describe `SABA-B-7 dB envelope UI (EUDB)`: EUDB1–EUDB3.
  - EUDB2 also checks one entry per drag (undoAll = 2 for two drags) and the full revert.
  - EUDB3 also checks the stored point `{time: 9, gain: 0.0005}` and one entry.

## Commands run, with results
- `npm run typecheck` → rc 0.
- `npm run lint` → 0 errors, 205 warnings, 1 info. `npx biome check` on the 6 changed code/test files → "No fixes applied", 0 warnings. The 205 are therefore outside my files; I did not measure HEAD's count.
- Covering run: `npx vitest run app/lib/arrangement/__tests__/{envelope.test.ts,clip-envelope-ui.test.tsx,export-range.test.ts,clip-gain-waveform.test.tsx,header-meter-envelope-strings-ui.test.tsx,clip-fades.test.ts,video-fades.test.ts}` → **7 files / 121 tests passed**.
- K9 grep → 8 / 6 / 1. LESSON grep `^41\. \*\*Perceptual axes` → 1 hit (l.26).
- Doc 200 self-check:
  - l.4 is byte-exact `**სტატუსი:** Completed (C round 269 PASS)`;
  - the `## ` headings are the 7 TEMPLATE headings in order;
  - every cited test id exists (DB1–6, EUDB1–3, EV5a/b/c/e, EV6b, EU3 and XR2: 1 hit each; XR2 has 2 because XR2 also names a fade test).

## Mutants (§7). Scratch `/tmp/a269-scratch` (rsync of store, `node_modules` symlinked); script `a-round-269/mutants.py`, output `a-round-269/mutants.txt`
| Mutant | Red |
|---|---|
| M-LINEAR | 12: DB1, DB4, DB5, DB6, EV1, EV2, EV4, EV5a/b/c/e, EV6b |
| M-NO-STEPS (count = 1) | 7: DB4, EV5a/b/c/e, EV6b, XR2 |
| M-DISPLAY (`top` = 1 − gain) | EUDB1 |
| M-DRAG (originalGain − dy/body, dy = 0 rule kept) | 4: EUDB2, EU3 quarter, EU3 press/cancel, EU3 A key |
| M-DY0 (dy = 0 rule removed) | EUDB3 |
| M-FLOOR (`TRACK_VOLUME_DB_MIN` → −40 in envelope.ts) | 6: DB1, DB2, DB3, DB4, DB6, EV2 |

Unmutated scratch: 69 / 69 passed.

## Browser smoke (A's own check, not a C row)
I ran B's `b-round-268/probe-envelope.mjs` on :5173 against the changed code. Output: `a-round-269/probe-envelope-a269.json`. Both viewports had 0 page errors and matched B's sketch column:
- mid point `5.725:0.0316`, "−30.0 dB", depth 0.5;
- quarter drag 0.1778, "−15.0 dB", depth 0.25;
- bottom `0.0000`, `−∞ dB`, depth 1;
- editor x 521, bodyHeight 50.

**Attempt 1 failed:** it timed out at the `Demo collection ready` wait after `networkidle`. A diagnostic load (`a-round-269/diag.mjs`) then read "ready" at about 5 s, and attempt 2 passed. The cause was not determined. I used fresh contexts and no persistent state file (`a-browse.json` was not needed).

## B acceptance rows A can claim
- TESTS-TARGETED (A's run);
- MUTANTS (A's red-proofs);
- CLAIMS K9 count;
- LESSON;
- DOC-200 self-check;
- SOURCE-SCOPE subset;
- HUNK-SCOPE (self-check).

**Not claimed:**
- the browser rows TAPER-EXPORT, CURVE-EXPORT, SILENCE-EXPORT, NO-CLICK-EXPORT, UNITY-EXPORT, DRAG-READOUT, LINE-THROUGH, HORIZONTAL-DRAG, UNDO, PLAY-THROUGH, PLAY-EDIT, MULTIPLY-EXPORT, SCREEN-BUDGET and G269-AUTH — these are C's;
- TEST-REWRITES (C diffs it);
- the gate rows.

## Exact next C checks
1. Re-run the §9 claims. K1 will show `5e73fe9`; apply the L29 drift clause (`git diff 3058a7c HEAD -- app` must be empty; it is empty today, before my uncommitted changes).
2. Run §8 in full. My probe is a fresh baseline for the recipe on the new code: points at `0.725 / 5.725 / 10.725`, bodyHeight 50, editor x 521 at both viewports. Do one warm-up load of `/studio-lab` before the ready-wait (see attempt 1).
3. The priority rows are TAPER-EXPORT / CURVE-EXPORT / SILENCE-EXPORT / NO-CLICK-EXPORT (round-83 WAV method), PLAY-THROUGH (the meter should reach `-inf` earlier than at HEAD, because the line is now at −30 dB at the midpoint) and MULTIPLY-EXPORT.
4. TEST-REWRITES: diff the 15 rewritten tests against HEAD using the table above.
5. MUTANTS: re-run the 6 on C's own scratch.

## Known limits (accepted in §3.6, not new gaps)
- Below about −50 dB, one 4-decimal storage step is coarser than the 0.1 dB readout (about 0.5 dB at −55 dB).
- A legacy stored gain below −60 dB is drawn at the bottom, while the sound interpolates in dB toward it (pinned by DB5). `/studio-lab` has no such point.

## Code review (the `code-reviewer` subagent ran on `a-round-269/diff.patch`; score 9/10)
No Critical, High or Medium findings. The reviewer compared each §5.1 rewrite with its old version (equal or stronger, none vacuous) and checked the step counts 24/13/12/90/60/120 by hand.

**Lows, and what I did:**
- **L1:** `ceil(span/0.5 − 1e-9)` versus the contract's `ceil(span/0.5)`. It is a float guard (60 dB → 120, not 121). **Documented** in doc 200, "პრობლემები და გადაწყვეტები".
- **L2 (perf):** each step calls `clipEnvelopeGainAtSource`, which scans every point (steps × points per clip). Scheduling runs only on play, seek or loop append, never on render. **Not changed** (B-approved sketch, microseconds today). For B: if point counts grow, compute steps from `fromGain`/`toGain` locally.
- **L3 (readability):** `segmentDepth(gain, other)` is always called as a mirrored pair. **Not changed**; for B as an optional cleanup.
- **L4:** a legacy gain below −60 dB next to a 0: both ends clamp to depth 1, so there is one ramp, and the lookup returns 0 inside (about −66 dB, inaudible, within the §3.6 accepted limit). **Documented** in doc 200.
- **L5:** knots assume the points are sorted. The old loop assumed the same, and add/move keep the order. **Not changed**; for B (optional sort for imported or corrupted data).
- **L6 (tests):** the in-between steps in EV5/EV6b are bounded rather than pinned. Even spacing and the values are pinned by XR2 (1e-12) and DB4, as §5.1 allows. **Not changed.**

**Architecture note:** none. The reviewer noted that coupling went down, because the step maths is a pure helper in `envelope.ts`.

After the doc edit, no code changed. Covering tests, typecheck, Biome and the mutants stand as reported above.
