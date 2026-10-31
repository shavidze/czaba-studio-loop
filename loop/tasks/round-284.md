# Round 284: PERF-3a. During zoom, the lane waveform keeps one column count per zoom band instead of one per pixel. The clip envelope line is drawn in seconds, so a zoom step rewrites neither shape. Stage 1 of 2 of PERF-3; PERF-3b (windowed ruler ticks) follows

**Planned by:** B, at the round 283 → 284 planning, 2026-10-31. **Decisions:**
- D-29z671: round 283 closed with **C PASS** (`browserVerified`/`realVerified` true), and gate 283 published `54a3fcc`. PERF-2 is **მზადაა**.
- D-29z673: B re-measured PERF-3's premise at HEAD (production build, Chromium, 30 clips). See §1. The outline's claim "the waveform path is rebuilt on every zoom step" holds only below the 4096-column cap. The slowest zoom key comes from the seconds ruler, not from the waveform. **PERF-3 is split:**
  - **PERF-3a (this round):** waveform column bands, plus the envelope line drawn in seconds and memoised;
  - **PERF-3b (next PERF round):** ruler tick windowing, plus harness rows (Event Timing p95 per key, path rewrites, ruler nodes, and the Ctrl+wheel baseline of `scope_addition_d29z215`).

  PERF-3's exit target, "zoom keydown p95 < 50 ms with 30 clips", is measured at 3b. This round records wall-clock as a trend only.
- D-29z674: the column rule is the `tech-lead` consult's zoom bands (×4 at 25 / 6.25 / 1.5625 px/s). `performance-optimizer`'s rule (the next power of two ≥ the width) was rejected: it still rebuilds about every third 1.25× step, and the bands never rebuild between 25 and 320 px/s. Measured: §1.3.
- D-29z675: the envelope polyline uses `viewBox="0 0 <duration> 1"` with x in seconds, memoised on the clip object. EU5 and EU7 are rewritten from pixel x to seconds; this is an equal-strength replacement and no assertion is lost. AL1 stays unchanged and still proves the pixel alignment.
- D-29z679: the browser contract (§6).

**Kind of round:** performance. Nothing is added to the screen, and the layout does not change. Reference-first, AGREE, `product-designer` and the screen budget do not apply (policy: pure performance rounds). Ableton conformity: **does not apply**. The waveform's drawing resolution is not an Ableton contract.

**Owner:** A. **Verifier:** C. **Grants:** §4.

## Baseline: HEAD `54a3fcc` [K1], clean tree [K18]
- `gates/gate-round-283.json` is `published`, at commit `54a3fcc`.
- Claims: from `store/`, run `bash ../tmp/studio-real-loop/b-round-283/claims-284.sh` **before editing**. Its output must equal `b-round-283/claims-284-output.txt`. Any difference is a STOP (§9).

## 0. Read first
1. `lessons.md` (every role), especially L11, L23, L26, L28, L29, L31, L37 (amended this planning) and L38.
2. This task, then `b-round-283.md` §2 (the measurements).
3. A's primitives: `AUDIO_ARCHITECTURE.md` (Studio), `FORWARDREF_COMPONENT.md` (component edit), `AGENT_DISCOVERABLE_CODE.md` (new export), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/studio-feature.md`.

## 1. What B measured at HEAD (evidence `b-round-283/`)
Setup: the production build of HEAD, Chromium at 1440×900, `/studio-lab`, Add, then Ctrl+D ×29 (30 clips of 101.352 s; the probe `zoom-probe3.cjs`).

1. **Zoom in, then out** (`=` ×5, then `-` ×5; 40 → 122.1 → 40 px/s):
   - waveform `d` rewrites per key: `[30,0,0,0,0,0,0,0,0,30]`, 60 in total, in 3/3 runs (`probe-results/head-in-*.json`);
   - Event Timing keydown: 88–104 ms on keys 1 and 10 (the path rewrites), 152 ms on key 5 and 104 ms on key 6, about 40 ms on the rest.
2. **Zoom out, then in** (40 → 13.1 → 40 px/s):
   - rewrites `[30 ×10]`, 300 in total, in 3/3 runs (`probe-results/head-out-*.json`);
   - Event Timing 40–128 ms.
3. **Why:**
   - The lane waveform's column count is `round(min(width, 4096))` [K2][K3][K6], and the memo keys on it [K5].
   - Below the cap, every zoom step changes the count and rewrites all 30 paths. Above the cap (the 101-s clip is wider than 4096 px from about 41 px/s), it does not.
   - On key 5, at 122.1 px/s, the document gains **6,142 DOM nodes** (`head-detail.json`, `dNodes`). By a testid census over the five `=` keys, the `arrangement-ruler` subtree grows by 6,143 nodes with 30 clips and by 264 with 1 clip (`probe-results/nodes-head-30.json`, `nodes-head-1.json`; probe `nodes-probe.cjs`). The ruler renders one tick per step over the whole arrangement [K15]. That is PERF-3b.
4. **B's sketch** (`b-round-283/sketch-full.diff`):
   - zoom in: rewrites `[0 ×10]`, 0 in total, in 3/3 runs;
   - zoom out: `[0,0,30,0,0,0,0,30,0,0]`, 60 in total, in 3/3 runs (only where 25 px/s is crossed, once down and once up);
   - Event Timing: about 40 ms on in-band keys (keys 1 and 10 drop from 88–104 to 40 ms); the ruler keys are unchanged (144–152, 96–104);
   - envelope (probe `env-probe.cjs`; Env mode on, one point added by double-clicking the first clip's envelope editor, then three `=` keys, 40 → 50 → 62.5 → 78.1 px/s): HEAD writes 180 `points` and 90 `viewBox` attributes over the 3 keys (30 lines in Env mode × 2 polylines + 1 viewBox per key); the sketch writes 0; the dot and the vertex coincide (Δ 0 px) at every step on both builds and at 1440×900 and 1280×720; Ctrl+Z removes the point (`probe-results/head-env-*.json`, `sketch-env-*.json`);
   - pixels: the clip waveform is **pixel-identical** to HEAD at every zoom ≥ 50 px/s (`imgdiff-head-vs-sketch.json`, in-0…in-8: meanAbs 0); below the cap meanAbs is ≤ 5.001 and the share of pixels with |Δ| > 32 is ≤ 6.057 %, at 13.1 px/s (`shots/compare-out4.png`: HEAD on top, sketch below, the same shape with slightly softer spikes).
5. **B scratch:**
   - 9 covering files, 171 tests pass (`covering-9files.txt`);
   - `tsc` rc 0, Biome clean;
   - the HEAD-code control and mutants Z1–Z5 are each red at their named rows (`mutants.txt`).

## 2. The code change (exactly `b-round-283/sketch-full.diff`, code part)
1. **`app/lib/arrangement/peaks.ts`** [K9]:
   - add `export const PEAK_SHAPE_MAX_COLUMNS = 4096;` (moved here from `ArrangementClip.tsx` [K2]; that file is its only user [K10]);
   - add `export function waveformPeakColumns(duration, pxPerSecond)`, which returns 0 when the width is not finite or rounds to ≤ 0. Otherwise, `bucketsPerColumn` is the largest power of 4 with `bucketsPerColumn × 4 × (pxPerSecond / 100) ≤ 1`, and the function returns `max(1, min(4096, ceil(ceil(duration × 100) / bucketsPerColumn)))`.
   - Properties: at least one column per pixel, up to the cap and the bucket count; fewer than four columns per pixel; constant within the bands ≥ 25 px/s (exclusive), [6.25, 25] and [1.5625, 6.25].
2. **`app/components/arrangement/ArrangementClip.tsx`** [K3]:
   - `peakColumns = waveformPeakColumns(clip.duration, pxPerSecond)` replaces the HEAD formula [K3];
   - the local constant is removed [K2];
   - `buildPeakShape`, its memo, the svg, the fades svg, video, folded and gain-draft behaviour are unchanged [K4][K5].
   - The detail panel keeps its fixed column count [K14] (not touched).
3. **`app/components/arrangement/ArrangementClipEnvelope.tsx`** [K7]:
   - the visible points, the first/last gains, the polyline `points` (x = `time − sourceOffset`, in seconds, ending at `duration`, or at 1 if the duration is ≤ 0) and the editor `slots` move into one `useMemo` on `[clip]`, above the early return;
   - the viewBox becomes `0 0 <spanSeconds> 1` [K7][K8];
   - `style.width` (`max(1, width)`), the `left` offset, `vectorEffect`, the two polylines and the editor (pixel positions and handlers) are unchanged.
   - Ruling for the < 1 px clip: `lineWidth` stays `max(1, width)`, so interior vertices of a sub-pixel clip map onto 1 px. That is accepted (invisible).

**Not this round:** the ruler, the bars ruler, the fades svg, `ArrangementDetailPanel`, the perf harness and budgets, and any context split (PERF-10).

## 3. Tests (exactly `b-round-283/sketch-full.diff`, test part)
| Row | File | Asserts |
|---|---|---|
| ZQ1 | `clip-gain-waveform.test.tsx` (inside "lane and detail waveforms follow Clip Gain") | at 40 px/s the lane columns are `[1200, 200]` (m1, s1). Zoom 50 → 62.5 → 80 keeps `{d, columns}` equal, and a jsdom `MutationObserver` on both waveform svgs records 0 `d`/`viewBox` writes. 20 px/s gives m1 300 columns, `d` = `buildPeakShape(…, 300, 1)`, s1 50 columns, and exactly 2 `d` writes |
| ZQ2 | `waveform-outline-path.test.tsx` | an 18-case table of `waveformPeakColumns` (band edges 25.1/25, 6.3/6.25, 1.5625, the cap, < 1 px, NaN, 0 px/s) |
| ZQ2b | same file | sweeps 0.5…320 px/s ×1.25 over 4 durations: columns ≥ min(cap, round(width), buckets) and ≤ ceil(4 × width) + 1 |
| ZQ3 | `clip-envelope-ui.test.tsx` (new describe at the end) | viewBox `0 0 16 1`. Zoom 50 → 62.5 → 80: the same svg node, `style.width` = 16 × zoom, `points` unchanged, and 0 `points`/`viewBox` mutation records |
| EU5, EU7 | `clip-envelope-ui.test.tsx` | expected vertices in seconds: EU7 `[0,0.2],[2,0.2]`; EU5 `[0,0],[4,0],[8,0.2],[12,0],[16,0]` and `'0,0 1,0'` (were pixels at 40 px/s) |

**Named mutants** (A and C each run them on a scratch copy of the final tree; B's script is `b-round-283/mu.sh` + `mutants.py`, and the results are in `b-round-283/mutants.txt`):

| Mutant | Change | Must be red at |
|---|---|---|
| HEADCODE | HEAD's three code files (with peaks.ts kept so the tests compile) | ZQ1, ZQ3, EU5, EU7 |
| Z1 | HEAD formula in `ArrangementClip.tsx` | ZQ1 |
| Z2 | band factor 4 → 2 | ZQ2, ZQ1 |
| Z3 | envelope x in pixels inside the memo | EU5, AL1 ×2 |
| Z4 | memo deps `[]` | EU3/EU4/AL1/EUDB2 (9 rows) |
| Z5 | no bands (`min(cap, buckets)`) | ZQ2, ZQ2b, ZQ1 |

Timeout headroom (L31):
- `clip-envelope-ui` 31 tests took 5.4 s at gate 283; the largest single row is about 0.2 s against the 5 s default;
- ZQ1 is about 0.15 s and ZQ3 about 0.04 s on B's scratch.

## 4. Grants (exact)
| Path | Change |
|---|---|
| `app/lib/arrangement/peaks.ts` | M, = sketch |
| `app/components/arrangement/ArrangementClip.tsx` | M, = sketch |
| `app/components/arrangement/ArrangementClipEnvelope.tsx` | M, = sketch |
| `app/lib/arrangement/__tests__/waveform-outline-path.test.tsx` | M, = sketch |
| `app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx` | M, = sketch |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | M, = sketch |
| `docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md` | new (§5); the last doc is 211 [K16] |

- All six code and test files must match `b-round-283/sketch-sha256.txt` byte for byte. Apply the patch with `patch -p1 < ../tmp/studio-real-loop/b-round-283/sketch-full.diff` (B dry-ran it cleanly on `git archive HEAD`).
- Nothing else. In particular, these are not granted: `perf/**`, `ArrangementRuler.tsx`, `ArrangementDetailPanel.tsx`, the protected files (`backlog.json` → `global_forbidden_files`), and `package.json`.
- The full sweeps [K10]–[K14] list every consumer. The test files among the hits that this round does not edit (`waveform-zoom`, `clip-gain-pointer-preview`, `content-colour-ui`) must stay green unchanged. They parse the column count from the viewBox, and any whole number passes.

## 5. Doc 212 (Georgian, technical terms in English)
- l.4 exactly: `**სტატუსი:** In Progress (stage 1 of 2; C round 284 PASS)` (L28: PERF-3 has 2 stages; 3b's task will grant this line).
- The seven TEMPLATE headings, in order (L26).
- Contents:
  - the §1 measurements, citing their `b-round-283/` files;
  - the band rule and why it was chosen over a power of two (D-29z674);
  - the envelope in seconds (D-29z675);
  - the PERF-3a/3b split and the ruler finding (D-29z673);
  - the changed files;
  - the tests by row id (ZQ1, ZQ2, ZQ2b, ZQ3; EU5/EU7 rewritten) and the mutants;
  - the TODO: PERF-3b ruler windowing, the per-key p95 and Ctrl+wheel harness rows, and the exit target.
- Every row or mutant id cited must exist (`grep -c` in the test files or §3).

## 6. The browser contract (D-29z679)
- C builds **both** HEAD `54a3fcc` (`git archive`) and A's tree as production builds. Each gets its own port and `cacheDir` (L38), then a warm-up, and they never run alongside another job.
- B's probes are the oracle scripts: `b-round-283/zoom-probe3.cjs` (arguments: base URL, out JSON, '', mode `in`|`out`, screenshot dir) and `imgdiff.cjs`. C may copy them and add a viewport argument; C must not change their counting.
- `browserVerified`/`realVerified` are true only if every browser row in §8 ran in real Chromium.

## 7. What A runs (speed rules)
1. Run the claims (§Baseline) before any edit.
2. Apply the patch, then run `sha256sum -c ../tmp/studio-real-loop/b-round-283/sketch-sha256.txt` from `store/`.
3. `npm run typecheck`; `npm run lint` (report the counts).
4. `npx vitest run` on these nine files. Expected: **9 files / 171 tests** (B's scratch, `covering-9files.txt`):
   - `waveform-outline-path.test.tsx`
   - `clip-gain-waveform.test.tsx`
   - `waveform-zoom.test.tsx`
   - `clip-gain-pointer-preview.test.tsx`
   - `content-colour-ui.test.tsx`
   - `clip-envelope-ui.test.tsx`
   - `strings.test.ts`
   - `affordance-colour-ui.test.tsx`
   - `studio-theme-obsidian.test.tsx`

   All nine are in `app/lib/arrangement/__tests__/` [K20].
5. Run the mutants HEADCODE and Z1–Z5 (§3).
6. One browser smoke on A's own production build: `zoom-probe3.cjs` in `in` mode, sum = 0. Not a perf run (L38: alone).
7. Write doc 212.
8. Ask the code-reviewer subagent (7 paths) and pass on its notes, including any Architecture note.

**Not A's:** the full vitest suite, the build gate, `npm run verify`, `test:e2e:smoke` and `test:perf` (C's and the gate's).

## 8. C rows
| Row | Check |
|---|---|
| CLAIMS | `claims-284.sh` on a `git archive 54a3fcc` scratch equals `claims-284-output.txt` (K1 and K18 print `(archive)` / 0 outside git), plus the L29 untagged-fact sweep over this task |
| SOURCE-SCOPE | `git status` = exactly the 6 `M` + 1 `??` of §4; `sha256sum -c b-round-283/sketch-sha256.txt` rc 0, checked at the start and at the end |
| TYPECHECK | `npm run typecheck` rc 0 |
| UNIT | the nine §7 files: 9 / 171 pass; ZQ1, ZQ2, ZQ2b and ZQ3 exist by name |
| UNIT-MUTANTS | C's own HEADCODE and Z1–Z5, each red at its §3 row |
| ZOOM-PATH-IN | **browser**, 1440×900, 30 clips, `in` mode, 3 runs. A's tree: the per-key waveform `d` rewrites are all 0 (sum 0). HEAD control, 1 run: sum 60 (`[30,0,…,0,30]`), which proves the probe sees rewrites |
| ZOOM-PATH-OUT | **browser**, 1440×900, `out` mode, 3 runs. A's tree: `[0,0,30,0,0,0,0,30,0,0]` (sum 60). HEAD control, 1 run: sum 300 |
| (viewport note) | ZOOM-PATH-IN/OUT run at 1440×900 only (the harness viewport): they count DOM attribute writes, which do not depend on the viewport. WAVE-PIXELS, ENVELOPE-ZOOM and G284-AUTH carry 1280×720 |
| ZOOM-ONE-COMMIT | from PERF-RUN: `interact.zoom.1.commits-per-key` and `interact.zoom.30.commits-per-key` = 1 (no regression; HEAD is already 1) |
| WAVE-PIXELS | **browser, both viewports.** Waveform element screenshots at every probe step, A's tree vs HEAD (`imgdiff.cjs`). Steps at ≥ 50 px/s: meanAbs 0. The others: meanAbs ≤ 6.0 and the share with \|Δ\| > 32 ≤ 7.0 %. Attach the side-by-side crop at 13.1 px/s with C's visual verdict (the same shape; no stair steps, gaps or clipping) |
| ENVELOPE-ZOOM | **browser, both viewports**, recipe and oracle `b-round-283/env-probe.cjs` (30 clips; the Env toggle; one double-click on the first clip's envelope editor adds one point, status `Envelope: point added — …`; three `=` keys, 40 → 50 → 62.5 → 78.1 px/s). A's tree: 0 `points` and 0 `viewBox` writes on the envelope lines. HEAD control, 1 run: 180 and 90. The dot's centre and the polyline vertex (svg box × viewBox scale) agree within 0.5 px at every step (B measured 0 on both builds). Ctrl+Z leaves 0 points |
| ZOOM-TIMING | trend only, `record`: Event Timing keydown per key for both modes, A's tree vs HEAD; report the quiet-key and ruler-key values. No pass or fail (the exit target is PERF-3b's) |
| PERF-RUN | `npm run test:perf` once, alone, on A's tree: rc 0, 0 harness problems, every assert row within budget; record the zoom rows |
| DOC-212 | l.4 is byte-exact (§5); the TEMPLATE headings are in order; every cited id exists; every number matches its cited `b-round-283/` file |
| G284-AUTH | **browser, both viewports**, fresh context, no credentials. `/studio-lab`: the demo workspace and the badge `Demo collection — no sign-in required`, with `auth_user` null. `/studio/middle-east`: `Sign in required`, `audio[src]` 0, and no workspace. `/api/studio-token`: no header → 401; a fake bearer → not 200 and no token (a real backend 401/403 is BLOCKED: backend unavailable in cloud) |
| gate | the full vitest suite, the build, Biome, `npm run verify` and `test:e2e:smoke` belong to the root gate and are not claimed |

## 9. STOP conditions (L11)
- The claims output differs from `claims-284-output.txt`.
- The patch does not apply cleanly, a sha256 mismatches, a covering test fails, or a mutant stays green at its row.
- Any edit seems needed outside §4, including a defect the code-reviewer finds in the sketch.
- The browser smoke (§7.6) shows a sum other than 0.

## 10. Neighbour risk
1. **Waveform appearance below about 41 px/s.** There are now 1 to 4 columns per pixel instead of 1, so spikes anti-alias slightly softer. WAVE-PIXELS bounds this.
2. **Clip Gain drag preview and the vertical waveform zoom** still change `scale`, and so the path. WG3–WG8 and WZ2/WZ3 cover this.
3. **Envelope editing:**
   - the memo deps (Z4 proves that removing them breaks editing);
   - the AL1 pixel alignment;
   - the halo/line identity (EV1 rows).
4. **The `perf/**` specs read the waveform testid** [K12]: PERF-RUN covers them.

## 11. Outcome, fixed in advance
| Result | Next |
|---|---|
| C PASS and the gate publishes | PERF-3a is done, and PERF-3 stays **მუშავდება**. The next round is REGRESSION if its planning is on or after 2026-11-02 (`regression-last.json`); otherwise PERF-3b, after consults (ruler windowing that keeps `play.idle-commits`; harness rows p95, path rewrites, ruler nodes and Ctrl+wheel) |
| C FAIL on a test or doc row | a bounded fix-up with the same grants |
| ZOOM-PATH or WAVE-PIXELS fails | B re-plans the rule; no tolerance is loosened |

## 12. Deliverables
- **A:** the six files (= the sketch), doc 212, and `a-round-284.md` with the commands, the results, the mutant table, the smoke sum and the review notes.
- **C:** `c-round-284.md`, `c-round-284.json`, and evidence in `c-round-284/`.

## Claims block (L29)
From `store/` on the pre-edit tree, run `bash ../tmp/studio-real-loop/b-round-283/claims-284.sh`. The expected output is `b-round-283/claims-284-output.txt`.

| Tag | Claim | Expected |
|---|---|---|
| K1 | HEAD | `54a3fcc` |
| K2 | the cap constant in `ArrangementClip.tsx` | l.45 |
| K3 | the HEAD column formula | l.367 |
| K4 | `buildPeakShape` export | l.247 |
| K5 | the path memo deps | l.313 |
| K6 | clip width = duration × px/s | l.366 |
| K7 | the envelope `linePoints`, pixel viewBox, two polylines | l.403, l.417, count 2 |
| K8 | the visible points computed before the early return | l.395 |
| K9 | 100 buckets per second | `peaks.ts` l.1 |
| K10 | SWEEP `PEAK_SHAPE_MAX_COLUMNS`, roots `app perf` | 2 hits, 1 file |
| K11 | SWEEP `getAttribute('points'\|'viewBox')`, roots `app perf` | 10 hits, 4 test files |
| K12 | SWEEP `arrangement-clip-waveform`, roots `app perf` | 8 files (1 component, 4 tests, 3 perf specs) |
| K13 | SWEEP `arrangement-clip-envelope-line`, roots `app perf` | 2 files |
| K14 | SWEEP `ArrangementPeakPath\|buildPeakShape`, roots `app perf` | 7 files (incl. `perf/budgets.json` text) |
| K15 | the ruler maps every tick; `rulerTickMarks` | `ArrangementRuler.tsx` l.239; `view.ts` l.233 |
| K16 | the last implementation doc | `211-perf-demo-synth-worker.md` |
| K17 | `In Progress (stage` lines | 0 |
| K18 | `git status` lines | 0 |
| K19 | `interact.zoom.*` rows in `perf/budgets.interactions.json` | 12 |
| K20 | the nine covering test files exist | `111111111` |
