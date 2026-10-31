# A round 284: PERF-3a (waveform column bands + envelope in seconds)

**STATUS: DONE (A scope). Pending C round 284.** No commit, push or deploy.

> **§9 note (ruling request for B, L10):** the code-reviewer found one Low defect in the sketch: `waveformPeakColumns` in `peaks.ts` never returns when `duration` and `pxPerSecond` are both negative. **A did not invoke STOP**, for three reasons. The defect cannot be reached in the app, because `clampTimelineZoom` (`view.ts:65`) keeps px/s above its minimum, which is > 0, and clip durations are positive. Nothing changes behaviour this round. No edit was made, because the files are byte-locked to the sketch. B rules: fold the guard and a `[-12,-40,0]` ZQ2 row into PERF-3b or a fix-up (A-R284-REVIEW-NEG-LOOP). C may proceed.
>
> **§2.1 prose vs doc 212:** doc 212 follows the code and ZQ2 rows `[12,25,300]` / `[12,6.25,75]`, not §2.1's wording. The result is the largest power of 4 with `b × ppb ≤ 1`, and the bands are open at the bottom: (6.25, 25] and (1.5625, 6.25]. C's DOC-212 row should expect this.

## Changed files (= task §4; `git status`: 6 M + 1 ??)
- `app/lib/arrangement/peaks.ts` (M, = sketch)
- `app/components/arrangement/ArrangementClip.tsx` (M, = sketch)
- `app/components/arrangement/ArrangementClipEnvelope.tsx` (M, = sketch)
- `app/lib/arrangement/__tests__/waveform-outline-path.test.tsx` (M, = sketch)
- `app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx` (M, = sketch)
- `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` (M, = sketch)
- `docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md` (?? new)

Nothing else touched. No protected file, `perf/**`, `ArrangementRuler.tsx`, `ArrangementDetailPanel.tsx` or `package.json` was edited.

## Commands and results (actually run)
| Step | Command | Result |
|---|---|---|
| Claims (before edit) | `bash ../tmp/studio-real-loop/b-round-283/claims-284.sh` from `store/` | rc 0; `diff` against `claims-284-output.txt` is empty (match) |
| Patch | `patch -p1 < ../tmp/studio-real-loop/b-round-283/sketch-full.diff` | dry run and real apply clean, 6 files |
| Byte check | `sha256sum -c ../tmp/studio-real-loop/b-round-283/sketch-sha256.txt` | 6/6 OK, again after the doc edit |
| Typecheck | `npx tsc --noEmit` (`npm run typecheck`) | rc 0 |
| Lint | `npm run lint` | rc 0; 0 errors, 205 warnings, 1 info (equal to gate 283's `Found 205 warnings.`) |
| Scoped Biome | `npx biome check` on the 6 code/test paths | clean, no diagnostics |
| Covering tests | `npx vitest run` on the 9 §7 files | **9 files / 171 tests pass** (15.98 s) |

## Mutants (A's own scratch copy of the final tree, `/tmp/a284/base`; B's `mutants.py` with the paths pointed at A's copies; same 3 test files as B's `mu.sh`)
Full output: `a-round-284/mutants-a.txt`.

| Mutant | Required red | A's result |
|---|---|---|
| HEADCODE | ZQ1, ZQ3, EU5, EU7 | rc 1; red: ZQ1, EU7, EU5, ZQ3 (4 failed / 44 passed) ✓ |
| Z1 | ZQ1 | rc 1; red: ZQ1 (1 / 47) ✓ |
| Z2 | ZQ2, ZQ1 | rc 1; red: ZQ2, ZQ1 (2 / 46) ✓ |
| Z3 | EU5, AL1 ×2 | rc 1; red: EU5, AL1 40 px/s, AL1 25 px/s (3 / 45) ✓ |
| Z4 | EU3/EU4/AL1/EUDB2 (9 rows) | rc 1; red: EU3 ×3, EU4 ×2, AL1 ×2, EUDB2, EUDB3 (9 / 39) ✓ |
| Z5 | ZQ2, ZQ2b, ZQ1 | rc 1; red: ZQ2, ZQ2b, ZQ1 (3 / 45) ✓ |

## Browser smoke (§7.6)
- A's own production build of the final tree, in scratch `/tmp/a284/base` with its own `cacheDir` (`/tmp/a284/vitecache`, scratch-only vite.config edit), served by `remix-serve` on port 5291. It ran alone; the server is now stopped. The orchestrator's dev server on 5173 was not touched and still returns 200.
- `zoom-probe3.cjs http://127.0.0.1:5291 <out> '' in`, Chromium 1440×900, **30 clips**.
- Per-key waveform `d` writes: `[0,0,0,0,0,0,0,0,0,0]`, **sum 0** ✓. `viewBox` and `points` writes are 0 on every key.
- Key 5 still adds 6,142 nodes (`dNodes`). This is the ruler and belongs to PERF-3b.
- Event Timing keydown (trend only, 1 run, not a perf run): `[32,32,32,24,104,64,24,32,32,32]` ms.
- Evidence: `a-round-284/smoke-in.json`.

## Doc 212
- l.4 is byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 284 PASS)`.
- It has the seven TEMPLATE headings in order. It covers the §1 measurements with their `b-round-283/` files, D-29z673, D-29z674 and D-29z675, the changed files, rows ZQ1, ZQ2, ZQ2b, ZQ3, EU5 and EU7, the mutant table, and the PERF-3b TODO.
- Every cited test id exists (grep: ZQ1, ZQ2, ZQ2b, ZQ3, EU3, EU4, EU5, EU7, AL1, EUDB2 and EUDB3, one file each).
- After the review, the band formula wording was corrected. It now reads: the loop yields the largest power of 4 with `b × ppb ≤ 1`, so 20 px/s gives 4; the bands are open at the bottom, (6.25, 25] and (1.5625, 6.25]; and the zero-width cutoff is `round(width) ≤ 0`, that is < 0.5 px. These match the code and ZQ2 rows `[12,25,300]` and `[12,6.25,75]`.
- Note for B: the task §2.1 wording "`bucketsPerColumn × 4 × (pxPerSecond / 100) ≤ 1`" and "[6.25, 25]" describe the loop condition, not the result. The code and tests are right; only the prose is imprecise.

## Code review (real `code-reviewer` subagent, 7 paths), score 8.5/10
1. **Low, sketch code, not fixed (byte-locked; STOP rule §9). For B:** `peaks.ts:9-16` `waveformPeakColumns` never returns when `duration` and `pxPerSecond` are **both negative**. Their product is positive and passes the guard, `pixelsPerBucket < 0`, so the `while` condition stays true. The app cannot reach this: `setPxPerSecond` goes through `clampTimelineZoom` (`ArrangementContext.tsx:3505`, `view.ts:65`, min clamp > 0), and clip durations are positive. But the function is a public export. Suggested fix for a later bounded task: guard `!(pxPerSecond > 0) || !(duration > 0)` → 0, plus a ZQ2 row such as `[-12, -40, 0]`. Proposed id: **A-R284-REVIEW-NEG-LOOP (Low)**.
2. **Low, doc: fixed in doc 212** (see above).
3. **Info, test, not fixed (byte-locked). For B:** ZQ3 (`clip-envelope-ui.test.tsx:1054,1068`). If the polyline were missing, `before` would be `undefined`, and the per-zoom `points` compare would pass vacuously. The `viewBox`, node-identity and mutation-record asserts make this unlikely. One `expect(before).toBeTruthy()` would close it. Proposed id: **A-R284-REVIEW-ZQ3-VACUITY (Info)**.
4. Info: ZQ1 is non-vacuous (the 2 `d` writes at 20 px/s prove the observer sees live nodes). ZQ2b's upper bound `ceil(4w)+1` is loose but acceptable. The memo deps `[clip]` cover every input. The editor still uses pixel positions, and the alignment holds except for sub-pixel clips, as ruled. `duration = Infinity` gives `viewBox 0 0 Infinity 1`, the same as HEAD.
5. **Architecture note:** none. The reviewer judged moving the constant into `peaks.ts` a better owner, with no new state or lifecycle.

## B acceptance criteria A can honestly mark
- §7.1 claims ✓ · §7.2 patch + sha ✓ · §7.3 typecheck/lint ✓ · §7.4 9/171 ✓ · §7.5 mutants ✓ · §7.6 smoke sum 0 ✓ · §7.7 doc 212 ✓ · §7.8 review ✓ (notes above).
- Not claimed, because they are C's or the gate's: ZOOM-PATH-IN/OUT (3 runs + HEAD control), WAVE-PIXELS, ENVELOPE-ZOOM, ZOOM-TIMING, PERF-RUN, ZOOM-ONE-COMMIT, G284-AUTH, the full suite, build gate, verify and e2e smoke.

## Known gaps
- I ran no envelope browser probe and no 1280×720 run; those are C's ENVELOPE-ZOOM and WAVE-PIXELS rows.
- I ran the smoke only in `in` mode, once. I did not run `out` mode. C's ZOOM-PATH-OUT expects `[0,0,30,0,0,0,0,30,0,0]`.
- Two review notes (items 1 and 3) are left for B, because the code and test files are byte-locked to the sketch.

## Exact next C checks
1. SOURCE-SCOPE: `git status` = the 6 M listed above + `?? docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md`, and `sha256sum -c b-round-283/sketch-sha256.txt` rc 0.
2. ZOOM-PATH-IN (sum 0 ×3; HEAD control 60) and ZOOM-PATH-OUT (`[0,0,30,0,0,0,0,30,0,0]` ×3; HEAD control 300) with `zoom-probe3.cjs` on separate prod builds, each with its own `cacheDir`.
3. ENVELOPE-ZOOM with `env-probe.cjs` at 1440×900 and 1280×720: 0 `points`/`viewBox` writes, Δ ≤ 0.5 px, Ctrl+Z leaves 0 points.
4. WAVE-PIXELS with `imgdiff.cjs` (≥ 50 px/s meanAbs 0; otherwise ≤ 6.0 / ≤ 7.0 %), plus the 13.1 px/s crop verdict.
5. DOC-212: l.4 bytes, the heading order, the ids, and the numbers vs the `b-round-283/` files, including the corrected band wording.
6. PERF-RUN alone, ZOOM-ONE-COMMIT, ZOOM-TIMING (record), G284-AUTH at both viewports.
