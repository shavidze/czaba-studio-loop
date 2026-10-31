# Round 285: PERF-3b. The seconds ruler renders only the three-viewport page window that the bars ruler already uses, and a Follow page flip updates both rulers before paint. Stage 2 of 3 of PERF-3; PERF-3c (the harness rows and the exit target) follows

**Planned by:** B, at the round 284 → 285 planning, 2026-10-31. **Decisions:**
- D-29z681: round 284 closed with **C PASS** (`browserVerified`/`realVerified` true), and gate 284 published `0f99960`. PERF-3a is **მზადაა**.
- D-29z682: ruling on A's L10 request in `a-round-284.md`. A-R284-REVIEW-NEG-LOOP (C reproduced it: rc 124) and A-R284-REVIEW-ZQ3-VACUITY go to `deferred_low_polish`. This round does not own `peaks.ts` or `clip-envelope-ui.test.tsx`, and under the 2026-10-23 bug gate a Low is fixed early only when the round already owns that code. C's note on the round-284 §2.1 prose ("[6.25, 25]") is acknowledged: the code, ZQ2 and doc 212 agree on (6.25, 25].
- D-29z683: the design (§2). It follows the `tech-lead` consult (option a: shared pure helpers in `view.ts`; optional props) and the `performance-optimizer` consult (build only an index range, not every tick).
  - Rejected: CSS gradient lines, because every tick carries a label, so nothing is saved.
  - Rejected: tiles with hysteresis, because the page window already has it (a scroll inside a page renders nothing, SR3).
  - Rejected: a second copy of the helpers in the ruler, because the two copies would drift.
- D-29z684: an unknown viewport (SSR, or a scroller not yet measured) renders **every** tick, the same rule the bars ruler follows today [K20].
  - `performance-optimizer`'s capped fallback was rejected. It would change the bars ruler, and it would break the jsdom rows that rely on the full render (BU1, SR1, `tempo-ui`).
  - In the browser the window replaces the full render at mount: the resize effect notifies the scroll listeners [K8], and B measured a start count of 94 at 1440 and 78 at 1280.
- D-29z685: PERF-3 has **three** stages: 3a (done), 3b (this round), and 3c.
  - 3c holds the harness rows: Event Timing p95 per zoom key, path rewrites, ruler nodes per key, the Ctrl+wheel baseline of `scope_addition_d29z215`, and the `res.dom.ruler-1/2` notes. It also makes the PERF-3 exit decision.
  - It is a separate stage because it changes the perf harness contract (`perf/**`, the doc 163 section, and 10.8-minute perf runs).
  - Doc 212 l.4, and its two lines that still describe two stages (l.17 and l.101), are granted below (L28).
- D-29z686: the browser contract (§6).
- D-29z687: ROOT-R70-ARCH-TIMELINE-TRIO is updated. The page helpers become shared. `tech-lead` says the seconds ruler is not a fourth consumer of `getTimelineView`, so no frontend-architect checkpoint is requested.
- D-29z688: this is a pure performance round. Reference-first, AGREE, `product-designer`, the screen budget and Ableton conformity **do not apply**: nothing visible changes, and RULER-PIXELS proves the ruler pixels equal HEAD's. The new tick attributes are not visible.

**Owner:** A. **Verifier:** C. **Grants:** §4.

## Baseline: HEAD `0f99960` [K1], clean tree [K16]
- `gates/gate-round-284.json` is `published`, at commit `0f99960`.
- Claims: from `store/`, run `bash ../tmp/studio-real-loop/b-round-284/claims-285.sh` **before editing**. Its output must equal `b-round-284/claims-285-output.txt`. Any difference is a STOP (§9).

## 0. Read first
1. `lessons.md` (every role), especially L11, L12, L23, L26, L28, L29, L31, L37 and L38.
2. This task, then `b-round-284.md` §2 (the measurements).
3. A's primitives: `AUDIO_ARCHITECTURE.md` (Studio), `FORWARDREF_COMPONENT.md` (component edit), `REACT_CONTEXT.md` (an external-store subscription), `AGENT_DISCOVERABLE_CODE.md` (new exports), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/studio-feature.md`.

## 1. What B measured (evidence `b-round-284/`)
Setup: production builds of HEAD (`/tmp/b284/head`, port 5311) and of B's sketch (port 5312), each with its own `cacheDir`, a warm-up run, and run alone. Chromium, `/studio-lab`, Add, then Ctrl+D ×29 (30 clips of 101.352 s). Probes: `ruler-probe.cjs` (modes `in`, `out`, `jump`, `follow`, `follow-bpm`, `follow-zoom`) and `flip-probe.cjs`.

1. **HEAD:**
   - The seconds ruler maps every tick over the whole arrangement [K2][K3]. It has **6,143** elements at 40 px/s at both viewports, and **12,286** at 122.1 px/s (zoom key 5).
   - Event Timing keydown on key 5 is 112 ms (1440) and 160 ms (1280); key 6 is 64–72 ms (`probe-results/head-in-{1440,1280}.json`).
   - Follow playback at 40 px/s and scroll jumps cause 0 ruler DOM churn (`head-follow*.json`, `head-jump-*.json`).
2. **Sketch** (`probe-results/final-*.json`):

   | Path | 1440×900 | 1280×720 |
   |---|---|---|
   | Ruler elements, `in` path (start, then 10 keys) | 94, then `[76,62,50,40,64,40,50,62,76,94]` | 78, then `[64,52,42,34,52,34,42,52,64,78]` |
   | Ruler elements, `out` path | 94, then `[60,74,92,48,60,48,92,74,60,94]` | 78, then `[50,62,78,40,50,40,78,62,50,78]` |
   | Event Timing, `in` keys | 16–24 ms | 16 ms |
   | Event Timing, `out` path maximum | 56 ms, on key 8 (the 25 px/s waveform band crossing from PERF-3a, not the ruler) | 48 ms, on the same key |
   | Jumps to 25 / 50 / 99.9 / 0 % of the scroll | 140 / 140 / 129 / 94 elements | 114 / 114 / 114 / 78 elements |

   - On every step and every jump, 0 visible ticks are missing (the probe's `coverage` field).
3. **Pixels.** Each ruler screenshot of the visible ruler at every zoom step and every jump (28 per viewport) is **pixel-identical** to HEAD: meanAbs 0 (`probe-results/final-imgdiff-{1440,1280}.json`). The `follow-zoom-stopped` shot is not comparable, because the two builds stop playback at different positions.
4. **The Follow page-flip gap, found by B and fixed in the sketch:**
   - After 9 `=` keys (about 298 px/s), Follow scrolls the view in its position-store writer by setting `scrollLeft` [K21]. The page key updates only on the next frame's scroll event [K22].
   - A post-frame check (`flip-probe.cjs`: `requestAnimationFrame` → `setTimeout 0`, so it sees what was painted) found **one painted frame with missing visible ticks** on each flip that crossed a page: `[1,1]` at 1440 and `[1,1,1]` at 1280 (`probe-results/sketch-flipT-{1440,1280}.json`, sketch without the fix).
   - **Inferred, not measured:** the bars ruler at HEAD probably has the same gap when a tempo is set, because it uses the same page key and the same scroll notification. B's post-frame probe checks the seconds ruler only. In jsdom, SR6 proves that after the fix both rulers already show the new window before any scroll event.
   - The fix: `notifyTimelineScroll()` right after the Follow writer sets `scrollLeft`. Four runs then show 0 gap frames over 18 flips (`final-flipT-{1440,1280}-{1,2}.json`). An early `rAF` check found nothing in either version (`sketch-flip-*.json`), because it runs before the Follow writer; only the post-frame check is a valid oracle.
5. **Follow playback at the default zoom**, with and without BPM 120: over 6 s there is 0 ruler and 0 bars-ruler DOM churn at both viewports (`final-follow*-*.json`; the bars ruler has 116 elements at 1440 and 96 at 1280).
6. **B scratch** (`/tmp/b284/sketch`):
   - 69 covering files / **1,261** tests pass (`covering-files.txt`, `covering-run.txt`, 77 s);
   - `tsc` rc 0, Biome clean on the 6 files;
   - the mutants are red at their rows (`mutants.txt`, §3).

## 2. The code change (exactly `b-round-284/sketch.diff`, code part)
1. **`app/lib/arrangement/view.ts`** [K3]:
   - New exports: `TimelinePxWindow`, `TimelinePage`, `readTimelinePage`, `timelinePageKey`, `getServerTimelinePageKey`, `parseTimelinePageKey` and `timelinePageWindow`. The window is `[(page − 1) × viewport, (page + 2) × viewport]`. These are the bars ruler's private helpers [K4][K5], moved and renamed; their behaviour is unchanged.
   - `rulerTickMarks(seconds, pxPerSecond, rulerWindow?)`:
     - Without a window, it returns the same list as HEAD.
     - With a window, it builds only the index range around the window (±1 or 2 indices of slack), computes each label against the **full** ruler width, and keeps exactly the marks with `fromPx ≤ x ≤ toPx`. The result therefore equals the full list filtered to the window (RW1).
     - A non-finite or inverted window gives `[]`, the same rule as `barsRulerMarks`.
2. **`app/components/arrangement/ArrangementRuler.tsx`** [K2]:
   - New optional props `getTimelineViewportPx` and `subscribeTimelineScroll`. When they are absent, the viewport is 0 and nothing subscribes, so every tick renders (the `view.test` ruler mount, which passes neither prop [K24], stays unchanged).
   - The ruler reads the page key with `useSyncExternalStore` and passes `fromPx`/`toPx` as numbers to the memoised ticks.
   - Each tick gains `data-testid="arrangement-ruler-tick"` and `data-time` (the time rounded to 1e-6 s, the same format as the bars marks). The new names are free [K13], and the HEAD ticks have no testid [K19].
   - The playhead, the navigation, `data-tick-step` and the classes are unchanged.
3. **`app/components/arrangement/ArrangementTempoRow.tsx`** [K4][K5]: it imports the shared helpers. The private copies are removed, and its behaviour is unchanged (the eight rows BU1–BU8 [K25] are unchanged and green).
4. **`app/components/arrangement/StudioWorkspace.tsx`:**
   - The `<ArrangementRuler>` element [K9] passes `getTimelineViewportPx` and `subscribeTimelineScroll`, as the overview and the tempo row already do [K6].
   - The Follow position writer calls `notifyTimelineScroll()` after it sets `scrollLeft` [K21], and its dependency list gains `notifyTimelineScroll`.
   - The scroll handler still notifies on the scroll event [K22]. That second call finds the same page key, so nothing renders.

**Side effects of the Follow notify (L49), each ruled:**
- The overview frame now updates in the same frame as the Follow scroll instead of one frame later. Kept; it is correct earlier.
- `handleTimelineScroll` is not called by the notify, so the marker-menu close and the Follow-pause logic still run only on the real scroll event. Unchanged.
- With an unchanged key there is no React render. SR5 proves this for playhead frames, and BU8 for the bars ruler.

**Not this round:** `perf/**`, the harness rows and budgets (PERF-3c), `peaks.ts`, `ArrangementOverview.tsx`, `ArrangementLane.tsx`, any context split, and the bars ruler's behaviour.

## 3. Tests (exactly `b-round-284/sketch.diff`, test part)
| Row | File | Asserts |
|---|---|---|
| RW1 | `view.test.ts` (new describe "PERF-3b windowed ruler ticks…") | Over 4 durations × 7 zooms × 5 pages (viewport 1216), the windowed list equals the full list filtered to the window, labels included. A covering window equals the full list. More than 40 checks are true partial windows. 3040.56 s at 122.1 px/s with page 0 gives 40 marks (`0:00`, `0:00.5`, `0:01` … `{19.5,'0:19.5'}`); the full list has 6,082 |
| RW2 | same | NaN, Infinity and inverted windows give `[]`; `undefined` gives the full list; `{400,400}` at 40 px/s gives `[10]` |
| RW3 | same | the page helpers: viewport 0 or NaN gives null; a negative scroll gives page 0; `'2:1216'` round-trips; `''` gives null; the window for page 2 is `{1216, 4864}`; null gives `undefined` |
| SR1 | `tempo-window-ui.test.tsx` (new describe "PERF-3b viewport-windowed seconds ruler") | an unmeasured viewport renders all 266 ticks (133 s at 320 px/s) |
| SR2 | same | a measured viewport renders exactly the page-0 window (16 ticks, fewer than the full list), and the visible span is complete |
| SR3 | same | a scroll inside page 5 renders neither `ArrangementRuler` nor `ArrangementRulerTicksInner`, and the first tick is the same node; a scroll to page 6 renders the ticks once, with the new window |
| SR4 | same | the first render after a keyboard `=` already uses the new view (page 1); `ArrangementRulerTicksInner` renders once |
| SR5 | same | a resize re-measures (window for viewport 1000); 30 playhead frames cause 0 tick renders and 0 `clientWidth` reads |
| SR6 | same | with BPM 999, playing, `setPosition(12)`: Follow scrolls past one viewport with **no scroll event**, and both the seconds-ruler ticks and the bars marks already equal the new page's window |

**Named mutants.** A and C each run them with `HEAD_TREE=<a git archive 0f99960 copy> bash b-round-284/mu.sh <NAME> <copy of the final tree>`. The script copies the tree, applies `mutants.py <NAME>`, and runs `view.test.ts` and `tempo-window-ui.test.tsx`; it writes to `/tmp/b284/`. B's results are in `b-round-284/mutants.txt`.

| Mutant | Change | Must be red at |
|---|---|---|
| HEADRULER | HEAD's `ArrangementRuler.tsx`, with only the tick testid and `data-time` added | SR2, SR3, SR4, SR5, SR6 |
| W1 | the ruler passes no window | SR2, SR3, SR4, SR5, SR6 |
| W2 | no window filter in `rulerTickMarks` | RW1, RW2, SR2 |
| W3 | the first index starts 2 too late | RW1, RW2 |
| W4 | `StudioWorkspace` does not pass the two props | SR2, SR3, SR4, SR5, SR6 |
| W5 | the page key changes on every scroll pixel | SR3 |
| W6 | window `page + 1` instead of `page + 2` | RW3, BU2–BU7, SR2, SR3, SR4, SR6 |
| W7 | no `notifyTimelineScroll()` in the Follow writer | SR6 |

**Timeout headroom (L31):**
- `tempo-window-ui` has a 15 s describe timeout [K23]; the file took 2.0 s for 8 tests at gate 284 (`gates/round-284/verify.log`). The new rows take about 40–70 ms each on B's scratch.
- `view.test.ts` took 0.3 s for 41 tests at gate 284.

## 4. Grants (exact)
| Path | Change |
|---|---|
| `app/lib/arrangement/view.ts` | M, = sketch |
| `app/components/arrangement/ArrangementRuler.tsx` | M, = sketch |
| `app/components/arrangement/ArrangementTempoRow.tsx` | M, = sketch |
| `app/components/arrangement/StudioWorkspace.tsx` | M, = sketch (2 props + 1 notify line + 1 dependency) |
| `app/lib/arrangement/__tests__/view.test.ts` | M, = sketch |
| `app/lib/arrangement/__tests__/tempo-window-ui.test.tsx` | M, = sketch |
| `docs/implementation/2026/quarter-IV/213-perf-ruler-tick-window.md` | new (§5); the last doc is 212 [K14] |
| `docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md` | **three lines only** (D-29z685, L28): l.4 [K15] to exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 284 PASS)`; l.17 [K26] to exactly `ამიტომ PERF-3 სამ ეტაპად გაიყო (D-29z685): **PERF-3a** (ეს ეტაპი) — waveform-ის column band-ები და envelope-ის ხაზი წამებში; **PERF-3b** — ruler-ის tick windowing; **PERF-3c** — harness-ის row-ები და საბოლოო მიზანი.`; l.101 [K26] to exactly `- PERF-3-ის საბოლოო მიზანი — zoom keydown p95 < 50 ms 30 clip-ით — PERF-3c-ზე იზომება; ამ ეტაპზე wall-clock მხოლოდ ტრენდად ჩაიწერა.` |

- All six code and test files must match `b-round-284/sketch-sha256.txt` byte for byte. Apply the patch with `patch -p1 < ../tmp/studio-real-loop/b-round-284/sketch.diff` (B dry-ran it cleanly on HEAD).
- Nothing else. In particular, these are not granted: `perf/**`, `peaks.ts`, the protected files (`backlog.json` → `global_forbidden_files`), and `package.json`.
- **Consumer sweeps:**
  - `arrangement-ruler` [K10]: 17 hits in 16 files;
  - the tick helpers [K11];
  - the old helper names [K12]: all 7 hits are in `ArrangementTempoRow.tsx`, which the patch rewrites;
  - every test that touches Follow, scroll, the overview or the position store: 69 files (`covering-files.txt`).

  All of them were run on the sketch and pass. `perf/studio-lab-resources.perf.spec.ts` counts the ruler subtree for `res.dom.ruler-1/2` [K17]. Those are `record` rows: the value drops, and PERF-RUN records it.

## 5. Doc 213 (Georgian, technical terms in English)
- l.4 exactly: `**სტატუსი:** In Progress (stage 2 of 3; C round 285 PASS)` (L28).
- The seven TEMPLATE headings, in order (L26).
- Contents:
  - the §1 measurements, citing their `b-round-284/` files;
  - the shared page helpers (D-29z683) and the unknown-viewport rule (D-29z684);
  - the Follow notify with its painted-gap evidence and the post-frame oracle (§1.4);
  - the 3-stage split (D-29z685);
  - the changed files;
  - the tests by row id (RW1–RW3, SR1–SR6) and the mutants (HEADRULER, W1–W7);
  - the TODO: PERF-3c harness rows, the exit target and the `res.dom.ruler` notes.
- Every row or mutant id cited must exist (`grep -c` in the test files or §3).

## 6. The browser contract (D-29z686)
- C builds **three** production trees, each with its own port and `cacheDir` (L38), each warmed up and run alone:
  - HEAD `0f99960` (`git archive`);
  - A's tree;
  - A's tree with mutant W7 applied (the control for the flip oracle).
- B's probes are the oracle scripts:
  - `b-round-284/ruler-probe.cjs` (arguments: base, out, mode, width, height, shot dir);
  - `flip-probe.cjs` (base, out, width, height, bpm);
  - `imgdiff.cjs` (dir A, dir B).

  C may copy them; C must not change their counting.
- `browserVerified`/`realVerified` are true only if every browser row in §8 ran in real Chromium.

## 7. What A runs (speed rules)
1. Run the claims (§Baseline) before any edit.
2. Apply the patch, then run `sha256sum -c ../tmp/studio-real-loop/b-round-284/sketch-sha256.txt` from `store/`.
3. `npm run typecheck`; `npm run lint` (report the counts; gate 284 found 205 warnings).
4. `npx vitest run $(cat ../tmp/studio-real-loop/b-round-284/covering-files.txt)`. Expected: **69 files / 1,261 tests**.
5. Run the mutants HEADRULER and W1–W7 (§3).
6. One browser smoke on A's own production build, run alone: `ruler-probe.cjs` in `in` mode at 1440×900. The ruler counts must equal §1.2, and the coverage must have 0 missing. This is not a perf run.
7. Write doc 213 and the three doc 212 lines (§4).
8. Ask the code-reviewer subagent (8 paths) and pass on its notes, including any Architecture note.

**Not A's:** the full vitest suite, the build gate, `npm run verify`, `test:e2e:smoke` and `test:perf` (C's and the gate's).

## 8. C rows
| Row | Check |
|---|---|
| CLAIMS | `claims-285.sh` on a `git archive 0f99960` scratch equals `claims-285-output.txt`, except that K1 prints `(archive)`. Also run the L29 untagged-fact sweep over this task |
| SOURCE-SCOPE | `git status` = exactly 7 `M` (the 6 files of §4 + doc 212) + 1 `??` (doc 213); `git diff` of doc 212 is exactly l.4, l.17 and l.101, with the §4 texts; `sha256sum -c b-round-284/sketch-sha256.txt` rc 0. Check at the start and at the end |
| TYPECHECK | `npm run typecheck` rc 0 |
| UNIT | the §7.4 list: 69 / 1,261 pass; RW1–RW3 and SR1–SR6 exist by name; BU1–BU8 are unchanged in the diff |
| UNIT-MUTANTS | C's own HEADRULER and W1–W7, each red at its §3 rows |
| RULER-NODES-IN | **browser, both viewports**, `in` mode, 3 runs on A's tree. The ruler element counts equal §1.2 at the start and at every key, and every step has `coverage.missing` 0. HEAD control, 1 run per viewport: start 6,143, key 5 12,286 |
| RULER-NODES-OUT | **browser, both viewports**, `out` mode, 1 run on A's tree: counts equal §1.2, missing 0. HEAD control: `[3073,3073,3073,1231,…,6143]` |
| RULER-PIXELS | **browser, both viewports.** `imgdiff.cjs` on the shot dirs of HEAD and A (modes `in`, `out`, `jump`): all **28** shots per viewport have meanAbs 0. `follow-zoom-stopped` is excluded (§1.3) |
| RULER-JUMP | **browser, both viewports**, `jump` mode on A's tree: counts `140/140/129/94` (1440) and `114/114/114/78` (1280), missing 0. HEAD control: 6,143 at every jump |
| RULER-FOLLOW-FLIP | **browser, both viewports**, `flip-probe.cjs`, no BPM, 2 runs each. A's tree: ≥ 3 flips (B measured 4 at 1440 and 5 at 1280; the flip count is recorded) and `secondsGapRuns` `[]`. W7 control build, 1 run per viewport: at least one gap run (this proves the oracle sees the painted gap). Then 1 run with BPM 120 on A's tree: `secondsGapRuns` `[]`. The probe checks the **seconds ruler only**; the bars-ruler half of the fix is proven by SR6 in jsdom |
| FOLLOW-IDLE | **browser, both viewports**, `follow` and `follow-bpm` modes on A's tree: over 6 s, `rm.ruler` = 0 and `rm.bars` = 0. Bars counts with BPM 120 equal HEAD's (C runs the HEAD `follow-bpm` control at both viewports; B measured 116 at 1440) |
| ZOOM-TIMING | trend only, `record`: Event Timing keydown per key for the `in` and `out` modes, A's tree vs HEAD, at both viewports. No pass or fail; the exit target belongs to PERF-3c |
| PERF-RUN | `npm run test:perf` once, alone, on A's tree: rc 0, 0 harness problems, every assert row within budget. Record `res.dom.ruler-1/2`, `play.idle-commits` and the `interact.zoom.*` rows |
| DOC-213 | l.4 is byte-exact (§5); the TEMPLATE headings are in order; every cited id exists; every number matches its cited `b-round-284/` file. Doc 212's l.4, l.17 and l.101 are byte-exact (§4) |
| G285-AUTH | **browser, both viewports**, fresh context, no credentials:<br>• `/studio-lab`: the demo workspace and the badge `Demo collection — no sign-in required`, with `auth_user` null;<br>• `/studio/middle-east`: `Sign in required`, `audio[src]` 0, and no workspace;<br>• `/api/studio-token?product=middle-east&file=stem-01.wav`: no header → 401; a fake bearer → not 200 and no token. A real backend 401/403 is BLOCKED: backend unavailable in cloud |
| gate | the full vitest suite, the build, Biome, `npm run verify` and `test:e2e:smoke` belong to the root gate and are not claimed |

## 9. STOP conditions (L11)
- The claims output differs from `claims-285-output.txt` (other than K1 on an archive).
- The patch does not apply cleanly, a sha256 mismatches, a covering test fails or exceeds 50 % of its timeout, or a mutant stays green at its row.
- Any edit seems needed outside §4, including a defect the code-reviewer finds in the sketch.
- The browser smoke (§7.6) differs from §1.2 or shows a missing tick.

## 10. Neighbour risk
1. **The bars ruler** now uses the shared helpers and the earlier Follow notify. BU1–BU8 cover it unchanged, plus SR6 and FOLLOW-IDLE.
2. **The overview** updates one frame earlier during Follow. Covered by the overview tests in the 69-file sweep.
3. **Ruler gestures** (seek, scrub, double-click Fit, the snap seeks): the ruler element, its handlers and the playhead are unchanged. The 16 files hitting `arrangement-ruler` [K10] are in the sweep.
4. **SSR and hydration:** the server key is `''`, so an unmeasured ruler renders every tick (`ssr-layout-effect` is in the sweep).
5. **The perf specs** count the ruler subtree [K17]. PERF-RUN records the new values.

## 11. Outcome, fixed in advance
| Result | Next |
|---|---|
| C PASS and the gate publishes | PERF-3b is done, and PERF-3 stays **მუშავდება**. The next round is REGRESSION if its planning is on or after 2026-11-02 (`regression-last.json`); otherwise PERF-3c, after consults (the harness rows of D-29z685; the exit decision on the measured p95; doc 212/213 l.4 → `Completed`) |
| C FAIL on a test or doc row | a bounded fix-up with the same grants |
| RULER-PIXELS, RULER-JUMP or RULER-FOLLOW-FLIP fails | B re-plans the window; no tolerance is loosened |

## 12. Deliverables
- **A:** the six files (= the sketch), doc 213, the three doc 212 lines, and `a-round-285.md` with the commands, the results, the mutant table, the smoke counts and the review notes.
- **C:** `c-round-285.md`, `c-round-285.json`, and evidence in `c-round-285/`.

## Claims block (L29)
From `store/` on the pre-edit tree, run `bash ../tmp/studio-real-loop/b-round-284/claims-285.sh`. The expected output is `b-round-284/claims-285-output.txt`.

| Tag | Claim | Expected |
|---|---|---|
| K1 | HEAD | `0f99960` |
| K2 | the ruler maps every tick | `ArrangementRuler.tsx` l.239 |
| K3 | the `rulerTickMarks` definition | `view.ts` l.233 |
| K4 | the tempo row's private page helpers | l.72, 86, 90, 98 |
| K5 | the tempo row's window props | l.336, 337 |
| K6 | `subscribeTimelineScroll={subscribeTimelineScroll}` in `StudioWorkspace.tsx` | 2, at l.2807 and 3014 |
| K7 | the `getTimelineViewportPx` definition | l.1276 |
| K8 | the resize effect notifies the scroll listeners | 1 |
| K9 | the `<ArrangementRuler` element | l.2988 |
| K10 | SWEEP `arrangement-ruler` testid, roots `app perf` | 17 hits, 16 files |
| K11 | SWEEP `rulerTickMarks\|rulerTickStep\|formatRulerLabel`, roots `app perf` | 3 files |
| K12 | SWEEP the old page-helper names, roots `app perf` | `ArrangementTempoRow.tsx`: 7 |
| K13 | SWEEP the new names, roots `app perf` | 0 |
| K14 | the last implementation doc | `212-perf-zoom-waveform-columns.md` |
| K15 | `In Progress (stage` lines | doc 212 l.4 |
| K16 | `git status` lines | 0 |
| K17 | the perf ruler rows | `res.dom.ruler-1`, `res.dom.ruler-2`, both `record` |
| K18 | `play.idle-commits` | `record` |
| K19 | the HEAD tick element has no testid | 0 |
| K20 | the bars ruler renders everything when the page is null | 2 |
| K21 | the Follow writer sets `scrollLeft`, then closes without a notify | `autoScrollLeftRef.current = target;` l.1979, next line `}),` |
| K22 | the scroll notifications | l.1262 (resize), l.1905 (scroll handler) |
| K23 | the `tempo-window-ui` describe timeout | `timeout: 15_000` |
| K24 | the `view.test.ts` ruler mount (`createElement(ArrangementRuler, {` block) passes neither new prop | starts l.367; 0 props in the block (the 2 other mentions are overview mounts) |
| K25 | `it('BU…` rows in `tempo-window-ui.test.tsx` | 8 |
| K26 | doc 212's two-stage lines | l.17 starts `ამიტომ PERF-3 ორ ეტაპად გაიყო`; l.101 ends `PERF-3b-ზე იზომება; ამ ეტაპზე wall-clock მხოლოდ ტრენდად ჩაიწერა.` |
