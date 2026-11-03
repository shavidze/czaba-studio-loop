# Round 306: PERF-3d. Rebuild a clip waveform at a zoom band crossing only when the clip is inside the timeline window (meets the PERF-3 exit), plus GATE304-M2/L3, C-R304-02 and the RT-FIX of SR-305-4

**Planned by:** B, at the round 305 → 306 planning, 2026-11-03.

**Decisions** (all in `backlog.json` → `decisions_log_b`):
- D-29z807: round 305 closure. RETRO 305 is accepted except C-R305-01, which B fixed in the review file (RT-FIX row below).
- D-29z808: PERF-3d mechanism = viewport gating on the existing timeline page window. Options (a) integer path and (d) lower cap are not used; (b) per-source cache is rejected as the gate fix.
- D-29z809: the two `== 60` rows become `== 3` (out) and `== 2` (wheel), the values of two saved sketch runs (GATE304-M2). GATE304-L3 note text. C-R304-02 text.
- D-29z810: rulings of §4 (state pattern, vertical axis not gated, visible paths byte-identical, doc 222 section grant).

**Read first:** `lessons.md` (59 lines). L23 (full suite on the sketch), L29/L56 (claims), L37 (premise re-measured), L38 (perf runs alone), L52 (asserts that can fail), L57 (C harness fields) apply directly.
- **L29 note:** untagged grep hits in this task are expected values, new ids, new-file names, grant text or descriptions of C's actions, not facts about current code. Facts about `store/` files carry `[K#]`.
- **Line-number ruling (D-29z793):** a claim that names a line in a file that a §5 grant edits is compared by **content** after A's change.
- **Loop path:** `tmp/studio-real-loop` is a symlink; search it with `find -L` (L38).

## Baseline: HEAD `adf959d`, clean tree
- Gate 304 published `adf959d`; gate 305 was `skipped` (C FAIL on a document Low), so the baseline does not move [K1]. HEAD is `adf959d`, `git status` is empty [K2].
- **Frozen list:** `b-round-305-r306-tree-sha256.txt`, **1,176** entries [K3]; each of the 7 protected auth/purchase files appears once [K4]. From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-305-r306-tree-sha256.txt` fails only on the §5 modified paths after A's change.

## 0. Why this round
- **Round 305 (RETRO) closed with C FAIL on one Low** (C-R305-01, origin B): SR-305-4 said the status line is cut at 1440; C measured it is not. Everything else passed, `browserVerified` and `realVerified` true. B corrected the sentence in `user-review/screen-review-305.md` (before-copy and diff in `b-round-305/`) and added C's note to SR-305-3. C re-checks only those lines (RT-FIX), as rounds 216, 231, 246, 261, 276 and 291 did.
- **PERF-3 exit is not met at HEAD.** C round 304: `out` keydown max 80 ms (≥ 50). The archived task fixed round 306 as PERF-3d (D-29z805). No Critical/High is open; the Mediums GATE304-M2 (this round) and GATE304-M1 (`open_root`) are the only new ones. REGRESSION is due on or after 2026-11-05 (`regression-last.json`: round 301, 2026-11-02), so not now.
- **Reference first / Ableton:** not in scope (performance round). **Screen budget:** nothing persistent is added; the visible waveform pixels do not change (row VIS-EQUIV).

## 1. Premise, re-measured at HEAD (L37)
All files under `b-round-305/probe/` unless named.

| Measurement | Result |
|---|---|
| Attribution, dev server, 1440 (`out-1440-1.json`, `wheel-out-1440-1.json`; script `zoom-attr.cjs` = round-303 probe + LoAF breakdown, viewBox columns, `d` length) | The slow steps are exactly the band crossings: 4096 ↔ 2534 columns per clip, 30 rewrites, `d` total 2.64 MB at 4096. Crossing up: keydown 104 ms, LoAF 90 = **script 84** (forced style/layout 14), render 1.3. Crossing down: 56 ms. Wheel: LoAF 54 / 86, script 50 / 79. Non-crossing keys 24 ms. Only 1–2 of the 30 clips are inside the viewport there (`scrollWidth` 80–123 k px) |
| Production builds of HEAD and of B's sketch (`prod-head-*.json`, `prod-sketch-*.json`) | HEAD out keydown per key `[16,16,56,24,16,16,16,80,16,16]`, LoAF 77 at key 8. Sketch `[16,16,16,16,24,16,16,16,16,16]`, LoAF 0, rewrites `[0,0,1,1,0,0,0,1,0,0]` at 1440 and `[0,0,1,0,1,0,0,1,0,0]` at 1280; wheel rewrites `[0,0,0,1,0,0,1,0,0,0]` at both, LoAF 0 |
| Microbench (`path-bench.json`, 30 paths × 4096 columns) | Build with `toFixed(3)`: 32–55 ms; integer + relative `h1`: 8–12 ms; `setAttribute('d')`: 12–15 ms in every format |
| Scroll after a crossing (`scroll-after-crossing.cjs`; `scroll-head-1440.json`, `scroll-sketch-1440.json`, `scroll-sketch-1280.json`) | Sketch: 29 lazy rebuilds over the whole width, **max 1 per scroll step**, LoAF 0, scroll→2 rAF max 33.4 ms (HEAD 32.6). At the end every clip has the same column count (`2534`) |
| Visible paths (`visible-d.cjs`, `vis-*.json`, `visible-d-compare.txt`) | `d` and `viewBox` of every waveform inside the viewport, at 0–3 `-` keys and back, are **byte-identical** between HEAD and the sketch at 1440 and 1280 (clip ids are random and excluded) |

**Consults** (both read-only, D-29z808):
- `performance-optimizer`: (a) alone ≈ 65–75 ms (still fails); (c) gating ≈ 30–38 ms; (d) 2048 cap ≈ 70 ms. Compute visibility in the parent from scroll position, not an IntersectionObserver (its callback would add a second commit).
- `tech-lead`: same order; (a) would need four test-file grants (`waveform-outline-path` PO1–PO4, `clip-gain-waveform`, `clip-gain-pointer-preview`, `waveform-zoom` pin `toFixed(3)`, absolute `H` and viewBox `0 0 N 2`) for no exit progress. Unmeasured viewport must mean "everything visible".

**Mechanism chosen:** the clip waveform reuses the **timeline page window** that the seconds ruler and the bars ruler already use (PERF-3b): `readTimelinePage` / `timelinePageWindow` in `app/lib/arrangement/view.ts` [K8] read through `getTimelineView` (which returns the pending zoom view during the zoom render) and `subscribeTimelineScroll` from `StudioWorkspace.tsx` [K9]. A clip whose pixel span intersects the window builds at the new band; a clip outside keeps the path it has, which `preserveAspectRatio="none"` [K29] still scales to the clip box, until a scroll brings it into the window.

## 2. B's pre-check on the sketch (L23, L56)
- **Sketch:** `b-round-305/sketch.patch.txt` (7 files: the four app files, the new test, the budgets file and the spec), applied to a scratch copy of `adf959d`. `npx tsc --noEmit` rc 0; Biome clean on the app paths.
- **Full suite on the sketch:** `b-round-305/precheck-full.log`: **232 files, 3,449 tests, all passed** (286 s).
- **Covering set on the sketch:** `b-round-305/covering-sketch.txt`: 11 files, 169 tests, all passed.
- **Perf on the sketch, alone:** `perf-sketch-run1.log/.json` (budgets unchanged): the only failures are `out.path-rewrites` 3 [3,3,3] and `wheel.path-rewrites` 2 [2,2,2] against `== 60`. `perf-sketch-run2.log/.json` (budgets as §5): **rc 0, `failures` []**, 5.4 min (36 % of the 15-minute timeout). Values: in/out keydown max medians 24/24, LoAF 0/0/0, commits per key/step 1, `zoom.30.components-per-key` 247 (C round 304 at HEAD: 247).
- **The other two perf specs were not run on the sketch.** They only count the waveform elements with `toHaveCount` [K30], and the gate never unmounts or adds a waveform SVG (it changes only the column count of off-window clips; at load every clip starts at its target value). A-PERF-RUN and PERF-RUN run all three.
- **Specified test rows run on the sketch** (`b-round-305/waveform-window-ui.test.sketch.tsx.txt`): WG0–WG4 green. **Mutants** (`b-round-305/mutants.txt`), each red on its rows: MU-GATE-OFF (WG2, WG3, WG4), MU-NO-SCROLL (WG3), MU-FALLBACK (WG0, WG1), MU-EDGE (WG0). At HEAD the file is red on WG0, WG2, WG3, WG4 and green on WG1 by design (`b-round-305/wg-at-head.txt`).

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root: `bash b-round-305/claims-306.sh` equals `b-round-305/claims-306-head-output.txt`. A difference is a STOP |
| A-UNIT | New `app/lib/arrangement/__tests__/waveform-window-ui.test.tsx` with rows **WG0–WG4** as specified in §6 (A may start from the sketch file; row ids and assertion semantics stay). Then the covering set: the new file, `view.test.ts`, `tempo-window-ui.test.tsx`, `render-budget.test.tsx` and every `app/**` hit of the K17 and K18 sweeps (`clip-gain-pointer-preview`, `clip-gain-waveform`, `content-colour-ui`, `waveform-zoom`, `clip-envelope-ui`, `video-fades-ui`, `waveform-outline-path`). All green. Report each file's time; a test above 50 % of its declared timeout is a STOP (L31) |
| A-MUTANTS | On A's own scratch copy (never in `store/`), the four mutants of §6, each red on its listed rows and green when restored. Log under `a-round-306/` |
| A-PERF-RUN | `npm run test:perf` once, **alone** (L38): rc 0, every report `failures` [], 0 problems. Report `interact.zoom.30.in/out.keydown-max-ms`, `*.loaf-max-ms`, `*.commits-per-key` / `commits-per-step` (with `detail.max`), `*.path-rewrites`, `zoom.30.components-per-key` and the interactions runtime |
| A-PERF-LIB | `vitest.config.ts` includes `app/**` only [K14], so run `perf/lib/report.test.ts` and `perf/lib/zoom-probe.test.ts` with a scratch config outside `store/` (as rounds 295 and 304). Green |
| A-TYPE/LINT | `npm run typecheck` rc 0 (covers `perf/**`, L30). `npm run lint`: no new finding in a granted path |
| A-REVIEW | `code-reviewer` on the §5 paths (≥ 3 files). Medium+ inside the grants: fix, then **re-run the reviewer on the changed lines** (L11 RETRO-305 clause). A Medium+ regression outside the grants is a STOP. The Architecture note goes to B |
| A-DOC | New `docs/implementation/2026/quarter-IV/223-perf-waveform-window.md` (223 is free [K20]): TEMPLATE's 7 headings in order (L26), l.4 exactly `**სტატუსი:** Completed (C round 306 PASS)` (L28), the §1 numbers with their files, the mechanism, the rejected options with reasons, WG0–WG4 and the mutants. Doc 222: only its `## მიდგომა` section [K21] (L34) gains one line after the bullet that names `out.path-rewrites == 60`, exactly: ``- **PERF-3d (doc 223):** band crossing-ზე მხოლოდ timeline window-ში მყოფი clip-ის waveform იგება, ამიტომ `out.path-rewrites` = 3 და `wheel.path-rewrites` = 2 (1440×900).`` |

### 3.2 C's rows
C writes `c-round-306.md` and `c-round-306.json` as it goes. The JSON carries the L57 fields; here `assertsSpecified` = 5 (WG0–WG4), `mutantsRecorded` = 4, `mutantRedOnSketch` = 4 (B's `mutants.txt`), and an `origin` per finding.

**Browser rows** (real Chromium; production builds on their own ports; L38: warm-up load first, nothing else running):
| Row | Action | Expected |
|---|---|---|
| PERF-RUN | `npm run test:perf` once, alone, on A's tree | rc 0; all three reports `complete` true, `failures` [], 0 problems, 0 page errors. `in.path-rewrites` = 0, `out.path-rewrites` = 3, `wheel.path-rewrites` = 2, every other assert row PASS (the `interact.drag.fade.30.*` rows included). `zoom.30.components-per-key` within ±5 % of 247 |
| EXIT | From PERF-RUN | The PERF-3 exit decision with numbers. **Met** only if `in` and `out` `keydown-max-ms` medians are < 50, `wheel.loaf-max-ms` median is < 50, and every `commits` `detail.max` (in, out, wheel) is ≤ 1. B expects met (sketch: 24 / 24 / 0 / 1). Not met = FAIL of this round |
| PROBE | Copy `b-round-305/probe/zoom-attr.cjs` to `c-round-306/` and run it on a production build of A's tree, modes `out` and `wheel-out`, at **1440×900 and 1280×720**, 1 run each | No step has keydown (out) or wheel→2 rAF (wheel-out) ≥ 50 ms, and no step has LoAF ≥ 50. Per-step rewrites at 1440 equal the harness `detail.perKey`/`perStep` and B's sketch (`[0,0,1,1,0,0,0,1,0,0]`, `[0,0,0,1,0,0,1,0,0,0]`); at 1280 each step rewrites ≤ 1 and the total ≤ 3 |
| SCROLL-UPGRADE | Copy `scroll-after-crossing.cjs`; run it on A's build at both viewports, and once on a HEAD build at 1440 | After the crossing and before scrolling, the `viewBox` widths hold two values (`2534`, `4096`); after the script's 200 viewport steps (its cap; the timeline keeps extending, so HEAD and the sketch both stop there) they hold **one** value, `2534`. Max rewrites per scroll step ≤ 1; total ≤ 29; LoAF max < 50; scroll→2 rAF max within +10 ms of the HEAD build run |
| VIS-EQUIV | Copy `visible-d.cjs`; run it on a HEAD build and on A's build at both viewports, 3 keys; compare with `b-round-305/probe/compare-visible-d.py` | For every step and the return, the list of `(viewBox, d)` of the waveforms inside the viewport is byte-identical between HEAD and A (clip ids excluded) |
| PLAY-SMOKE-306 | On `/studio-lab` (dev server) at both viewports, after `Demo collection ready` (L48): add `Bass` (Enter), Play; after 1.5 s `[data-testid=arrangement-position]` [K26] ≥ `00:01.000`; export a WAV | RIFF/WAVE, 48 kHz, 16.000 s, peak > 0 |
| G306-AUTH | As G305-AUTH (fresh anonymous context, both viewports, wait for a non-empty body) | `/studio-lab` works with `auth_user` null; `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`; `/api/studio-token` with no header 401; no token in any body |

**Offline rows:**
- **SOURCE-SCOPE.** `git status --short --untracked-files=all` lists exactly the §5 paths (7 modified, 2 new). `sha256sum -c` fails only on the 7 modified paths. Protected files: no diff. `ArrangementClip.tsx`: `buildPeakShape` and `ArrangementPeakPath` are byte-identical to HEAD (compare the two function bodies). `perf/budgets.interactions.json`: the diff touches only the 9 rows of §5. The spec: only the `interactionSequence` entry [K12]. Doc 222: only the one added line in `## მიდგომა`.
- **CLAIMS.** Re-run `claims-306.sh` from the loop root. The expected output after A's change is **`b-round-305/claims-306-sketch-output.txt`**: B ran the same script on the sketch-applied scratch (`CLAIMS_STORE=/tmp/b305/sketch`, with the doc-222 line and a stub doc 223) (L56). Every K that reads `store/` equals that file, by content where a granted file moved lines (D-29z793: K7, K8, K10). Exceptions: **K15** depends on A's exact code, so it only needs to be > 0 (the sketch has 27). **K2** is an environment claim: `9 adf959d` (the scratch is not a git repository). **K1, K3, K19, K22, K25** read the loop folder and keep their HEAD values.
- **TESTS-READ.** WG0–WG4 exist with the §6 semantics; A's mutant log shows each listed row red.
- **DOC.** Doc 223 per A-DOC, cites only rows that exist (L26); doc 222 one-line change.
- **RT-FIX (document).** `user-review/screen-review-305.md`: SR-305-4 no longer says the status is cut (K22 first value 0), says density, cites C's measurement and `c-round-305/screens/sr-probe-status-1440x900.png`; SR-305-3's paragraph names the "Nothing to play — add a clip from the library first." status. `diff b-round-305/screen-review-305-before.md user-review/screen-review-305.md` touches only those two lines. Nothing else in the review or in `retro-305.md` changed.
- **Gate rows** (not claimed by C; list under `"gate"`): full vitest, build, Biome, `npm run verify`, e2e smoke.

`browserVerified` is true only if PERF-RUN, PROBE, SCROLL-UPGRADE, VIS-EQUIV, PLAY-SMOKE-306 and G306-AUTH all ran (PROBE/SCROLL/VIS/SMOKE/AUTH at both viewports). **BLOCKED:** none expected; `/studio-lab` needs no backend.

## 4. Rulings
- **Mechanism (D-29z808).** Visibility comes from the existing page window (§1), read through `useSyncExternalStore` with a **per-clip boolean snapshot**, so a scroll re-renders only clips whose in-window state flips. No IntersectionObserver, no `startTransition`/`useDeferredValue`, no per-clip `getBoundingClientRect`, no new scroll listener.
- **Which columns a clip shows.** In the window: `waveformPeakColumns(clip.duration, pxPerSecond)` (today's value [K6]). Outside: the column count it showed last. The sketch keeps it with React's "adjust state while rendering" pattern (`useState` + a guarded `setState` during render), which re-renders before commit and adds no commit. A may use an equivalent; whatever it uses must keep `commits` `detail.max` ≤ 1 and components per key within ±5 % of 247. Writing a ref during render is not allowed.
- **Unmeasured viewport = everything in the window** (`readTimelinePage` returns null when the viewport width is not > 0, so `timelinePageWindow` gives `undefined` [K8]). This keeps jsdom tests and SSR unchanged (WG1).
- **Window bounds are inclusive at both edges** (WG0). The window is the rulers' three-viewport window, unchanged; no new margin constant.
- **Vertical axis not gated.** All lanes count as visible vertically; lanes are few and the 30-clip scenario is one lane. Recorded as a signal (`PERF-3D-VERTICAL-GATE`), not a task.
- **Visible paths byte-identical (VIS-EQUIV).** `buildPeakShape` and `ArrangementPeakPath` [K7] do not change; the path format, `toFixed(3)` and the viewBox stay (option (a) is not used). The detail panel's `ArrangementPeakPath` with its own columns [K16] is untouched.
- **Budgets (GATE304-M2, D-29z809).** `interact.zoom.30.out.path-rewrites` `==` 3 and `interact.zoom.30.wheel.path-rewrites` `==` 2, from `perf-sketch-run1.json` and `-run2.json` (3 samples each, stable). Both stay deterministic asserts: they turn red if the gating is lost (60) or a visible clip stops rebuilding (fewer). `in.path-rewrites` stays `== 0`.
- **Ruling line (L4):** `ArrangementClip.tsx`: "`buildPeakShape`/`ArrangementPeakPath` byte-identical" wins over "gate the columns in the clip view"; the gating lives in `ArrangementClipViewInner` only.
- **Not in this round:** a perf-harness scroll row (performance-optimizer's suggestion) and a distinct-sources variant; SCROLL-UPGRADE and the WG rows cover the behaviour. Recorded as candidate `PERF-3D-SCROLL-HARNESS-ROW`.

## 5. Grants
A edits only these paths.

**Modified (7):**
1. `app/components/arrangement/ArrangementClip.tsx`: in `ArrangementClipViewInner` only, replace the `peakColumns` line [K6] with the gating of §4; add the optional prop `timelineWindow?: TimelineWindowSource` to `ArrangementClipViewProps` and its destructuring; the React imports and the `view` import this needs; two module-level helpers (no-op subscription, always-true server snapshot).
2. `app/components/arrangement/ArrangementLane.tsx`: optional prop `timelineWindow?: TimelineWindowSource`, passed to `ArrangementClipView` next to `timelineSeconds={laneSeconds}` [K10]; the type import.
3. `app/components/arrangement/StudioWorkspace.tsx`: one `useMemo` building `{ getTimelineView, getTimelineViewportPx, subscribeTimelineScroll }` from the existing callbacks [K9], and `timelineWindow={…}` on the `<ArrangementLane` element [K10]. Nothing else.
4. `app/lib/arrangement/view.ts`: add `export interface TimelineWindowSource` (the three members above) and `export function spanInTimelineWindow(fromPx, toPx, timelineWindow?: TimelinePxWindow): boolean` (undefined → true; inclusive edges). Existing exports unchanged.
5. `perf/budgets.interactions.json`, 9 rows:
   - `interact.zoom.30.out.path-rewrites`: value 3; `note` exactly: `1x only. Waveform path d rewrites over the 10 keys (MutationObserver from perf/lib/zoom-probe.ts: attribute d on a path inside [data-testid="arrangement-clip-waveform"]; fade and envelope paths do not count). detail.perKey lists them. The out-first path crosses the 25 px/s column band on key 3 and back on key 8. Since PERF-3d (doc 223) a crossing rebuilds only the waveforms inside the three-viewport timeline window; a clip outside keeps its previous path until a scroll brings it into the window. At 1440x900 with 30 clips: key 3 rewrites 1, key 4 rewrites 1 (the anchored scroll brings one stale clip into the window), key 8 rewrites 1. Was 60 before PERF-3d (each crossing rewrote all 30).`
   - `interact.zoom.30.wheel.path-rewrites`: value 2; `note` exactly: `1x only. Waveform path d rewrites over the 10 wheel steps (zoom probe). The path crosses the 25 px/s column band on step 4 and back on step 7. Since PERF-3d (doc 223) only the waveforms inside the three-viewport timeline window rebuild: at 1440x900 with 30 clips, 1 on step 4 and 1 on step 7. detail.perStep lists them. Was 60 before PERF-3d.`
   - GATE304-L3: append exactly ` Measured with the zoom probe (perf/lib/zoom-probe.ts) connected, so not strictly comparable with interact.zoom.30.key-window-longest-ms, which is measured without it.` to the `note` of `interact.zoom.30.in.keydown-max-ms`, `.in.keydown-median-ms`, `.in.loaf-max-ms`, `.out.keydown-max-ms`, `.out.keydown-median-ms`, `.out.loaf-max-ms` and `.wheel.loaf-max-ms`. Premise: `measureZoom` runs without the probe; only `runZoomProbeSteps` installs it [K13].
6. `perf/studio-lab-interactions.perf.spec.ts`: the last `interactionSequence` entry [K12] (C-R304-02) only; the part `zoom with ${clipsTarget} clips (interact.zoom.30.*), Space` becomes exactly `zoom with ${clipsTarget} clips: keys, then the in-first path (5 x "=", 5 x "-"), the out-first path (5 x "-", 5 x "=") and Ctrl+wheel out-first (5 x deltaY +100, 5 x -100) with the zoom probe (interact.zoom.30.*, interact.zoom.30.in/out/wheel.*), Space`.
7. `docs/implementation/2026/quarter-IV/222-perf-zoom-harness-rows.md`: the one line of A-DOC inside `## მიდგომა` [K21].

**New (2):**
8. `app/lib/arrangement/__tests__/waveform-window-ui.test.tsx` (WG0–WG4, §6).
9. `docs/implementation/2026/quarter-IV/223-perf-waveform-window.md`.

Nothing else: not `peaks.ts`, `ArrangementDetailPanel.tsx`, `ArrangementRuler.tsx`, `ArrangementTempoRow.tsx`, `perf/lib/**`, `vitest.config.ts`, `playwright.perf.config.ts`, `package.json`, other docs, or any protected file.

## 6. Specified test rows (L23, L52)
File `waveform-window-ui.test.tsx`, built like `tempo-window-ui.test.tsx` (fake audio graph, `FakeResizeObserver`, and a `clientWidth` stub on the scroller returning `VIEWPORT_PX + HEADER_PX` = 1216 + 224 [K27], so the timeline viewport is 1216 px). Collection: one source, 200 s at sample rate 100. Clips on the music lane: `near` at 0 s and `far` at 150 s, both `duration` 50. Columns are read from the `viewBox` of `[data-clip-id=…]` [K28] `[data-testid="arrangement-clip-waveform"]`; expected values come from `waveformPeakColumns(50, pxPerSecond)` (4096 at 40 px/s, 1250 at 20 px/s).

| Row | Steps | Assert (`toBe`) |
|---|---|---|
| WG0 | `spanInTimelineWindow` | undefined window → true; `(0,1000)` and `(2000,3000)` vs `{1000,2000}` → true; `(2001,3000)` and `(0,999)` → false |
| WG1 | Unmeasured viewport (`clientWidth` 0); mount at 40; `setPxPerSecond(20)` | both clips at the 20 px/s value |
| WG2 | Measured; mount at 40 (both at the 40 value, and the two values differ); `setPxPerSecond(20)` | `near` at 20's value, `far` still at 40's |
| WG3 | Measured; 40 → 20; scroll the scroller to 3000 and fire `scroll` | `far` now at 20's value; `near` at 20's value |
| WG4 | Measured; 40 → 20 → 40 (both at 40's); 20 again; scroll to 4000; 40 | `near` keeps 20's value (outside the window), `far` at 40's |

**Mutants** (A on scratch; B's results in `b-round-305/mutants.txt`):
- MU-GATE-OFF: the clip always uses the target columns → WG2, WG3, WG4 red.
- MU-NO-SCROLL: the clip subscribes to a no-op instead of `subscribeTimelineScroll` → WG3 red.
- MU-FALLBACK: `spanInTimelineWindow(…, undefined)` returns false → WG0, WG1 red.
- MU-EDGE: exclusive edges → WG0 red.

## 7. A's order of work
1. A-CLAIMS. 2. Edit §5 items 1–4, then the test (§6). 3. Typecheck, lint, A-UNIT, A-PERF-LIB. 4. A-MUTANTS on scratch. 5. A-PERF-RUN alone. 6. Docs. 7. `code-reviewer` (re-review after any later change). 8. Write `a-round-306.md` as you go: per-row results, the perf values, mutant table, claims after the change, the reviewer's Architecture note.

## 8. Neighbouring behaviour at risk (C probes)
- **Scroll and Follow:** a page flip during playback (Follow) re-renders only the clips that enter or leave the window; the existing `play.*` and `drag.*` perf asserts (PERF-RUN) cover idle commits. SCROLL-UPGRADE covers manual scroll.
- **Edits on an off-screen clip** (trim, Ctrl+D, gain) keep the old column count until it enters the window; the path still covers the clip box. Visible clips are unchanged (VIS-EQUIV).
- **Detail panel waveform** and the **video lane** use their own columns; PLAY-SMOKE-306 opens the Studio after the change.
- **Tests that pin the waveform** (K17, K18 sweeps): all ran green on the sketch (§2); none is granted, so a red one is a STOP.

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-306.md` and changes nothing else when:
- A-CLAIMS differs from `claims-306-head-output.txt`;
- a change is needed outside §5, or `buildPeakShape`/`ArrangementPeakPath` must change;
- any existing test or perf assert turns red, or a new deterministic value is not stable over the 3 passes;
- the harness's `out.path-rewrites`/`wheel.path-rewrites` differ from 3/2, or `commits` `detail.max` > 1, or components per key differ from 247 by more than 5 %;
- `in`/`out` keydown-max median ≥ 50 or wheel LoAF median ≥ 50 in A-PERF-RUN;
- a covering test above 50 % of its timeout; typecheck fails; lint has a new finding in a granted path; a mutant stays green; the reviewer reports a Medium+ regression.

## 10. Next
- C PASS + gate → **PERF-3 is done** (EXIT met). The REGRESSION round (due on or after 2026-11-05) comes next when due; STUDIO-PERFORMANCE then continues with its next stage.
- A C FAIL on a Medium+ comes first; a Low goes to `deferred_low_polish` unless this round owns the code.
- For root: ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) is still open; ARCH-CHECKPOINT-STUDIO-LINK is still unanswered. **No new frontend-architect checkpoint now:** this is one bounded change (one prop passed through two components plus a gate in the clip view); signals GATE304-ARCH-ZOOM-LIVE-RULE and `PERF-3D-VERTICAL-GATE` are recorded. A checkpoint request is due at the end of STUDIO-PERFORMANCE (feature boundary), with `StudioWorkspace.tsx` size and the prop chain to the clip view on the list.

## 11. Commit readiness
After C PASS and the gate, root publishes the §5 paths. The loop-state commit carries the round-305 RT-FIX edit to `user-review/screen-review-305.md`.

## 12. Claims (L29 + L56)
Run `bash b-round-305/claims-306.sh` from the loop root. HEAD output: `b-round-305/claims-306-head-output.txt`. Output on B's sketch (the expected values after A's change): `b-round-305/claims-306-sketch-output.txt`.

| Tag | Claim | Expected at HEAD |
|---|---|---|
| K1 | gate 304 published `adf959d`; gate 305 skipped | `published adf959d \| skipped` |
| K2 | clean tree, HEAD | `0 adf959d` |
| K3 | frozen entries | `1176` |
| K4 | each protected file once | `1 1 1 1 1 1 1` |
| K5 | `peaks.ts`: cap 4096 (l.3), band factor 4 (l.5), `waveformPeakColumns` (l.7) | three hits |
| K6 | the clip view's `peakColumns` line | `366: … waveformPeakColumns(clip.duration, pxPerSecond);` |
| K7 | `ArrangementPeakPath` memo deps | `312: [peaks, clip.sourceOffset, clip.duration, columns, scale],` |
| K8 | `view.ts` page helpers | `TimelinePxWindow` l.233, `readTimelinePage` l.243, `timelinePageKey` l.257, `timelinePageWindow` l.273 |
| K9 | the three workspace callbacks | l.1246, l.1276, l.1281 |
| K10 | one `<ArrangementLane` element; the lane passes `timelineSeconds={laneSeconds}` | `1 1035: …` |
| K11 | path-rewrite budgets | `('in', '==', 0) ('out', '==', 60) ('wheel', '==', 60)` |
| K12 | `interactionSequence` entry | l.73 |
| K13 | probe installed only in `runZoomProbeSteps` | `527 423:async function measureZoom 517:async function runZoomProbeSteps` |
| K14 | vitest include | `include: ['app/**/*.test.{ts,tsx}'],` |
| K15 | new identifiers absent | `0` |
| K16 | the detail panel's own columns | `231` |
| K17 | SWEEP `arrangement-clip-waveform` in `app/**` tests, `perf/**`, `e2e/**` | 10 files (output file) |
| K18 | SWEEP viewBox/path pins in `app/**` tests | 6 files (output file) |
| K19 | round-305 archive equals the old task | `archive-equal-305` |
| K20 | last doc number; 223 free | `222-perf-zoom-harness-rows.md 0` |
| K21 | doc 222 `## მიდგომა` l.13 up to `## არქიტექტურა` l.30; the `== 60` bullet; l.4 | `13-30 1 **სტატუსი:** Completed (C round 304 PASS)` |
| K22 | RT-FIX: old truncation phrase, density word, SR-305-3 status | `0 1 1` |
| K23 | new test absent at HEAD | `absent` |
| K24 | no `In Progress (stage` doc | `0` |
| K25 | every cited artifact exists (L56) | `done` |
| K26 | `arrangement-position` testid and the `Demo collection ready` status, each defined once in `app/**` (non-test) | `1 1` |
| K27 | `tempo-window-ui.test.tsx`: `HEADER_PX = 224`, `VIEWPORT_PX = 1216`, `layout` | `204 205 206` |
| K28 | the clip root carries `data-clip-id={clip.id}` | `1` |
| K29 | `preserveAspectRatio="none"` in `ArrangementClip.tsx` | `2` |
| K30 | the other two perf specs only count waveforms | `perf/studio-lab.perf.spec.ts:168 perf/studio-lab-resources.perf.spec.ts:579` |
