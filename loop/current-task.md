# Round 376: PERF-11c-iii-c1. The Transport renders only the group whose input changed

**Planned by:** B, at the round 375 → 376 planning, 2026-11-06 (`b-round-375.md`).

**Decisions** (`backlog.json` v340 → v341, `decisions_log_b`):
- **D-29z1246:** round 375 (PERF-11c-iii-b) is accepted from C's evidence (`c-round-375.json` PASS, `browserVerified` and `realVerified` true, 0 bugs). Gate 375 published `6b11be7`, the new baseline. GATE374-L2 is closed. A-R375's two test Lows are fixed in this round because it owns those files (A-R375-REVIEW-DPR-NO-POSITIVE-CONTROL, A-R375-REVIEW-RBLEAF3-PER-STEP).
- **D-29z1247:** PERF-11c-iii-c is split into **c1 = Transport (this round)** and **c2 = LoopBrace + MarkerRow (next)**. Scope is unchanged.
- **D-29z1248:** this round's design, measurements and the rulings on the `tech-lead` review (below).
- **D-29z1249:** the order after this round, REGRESSION and RETRO timing.

**What this round does:** at HEAD, every workspace commit renders the whole `ArrangementTransport` once: adding a clip, a zoom key, a lane mute, Ctrl+Z, the Undo and Redo buttons, a library preview start and stop [K24]. After this round, StudioWorkspace renders `ArrangementTransportView` (memo) with data props, and the view holds three memo groups:
- **Edit** (Undo, Redo, Split, Delete) renders when the Undo/Redo labels, the range or the clip selection change;
- **Centre** (Follow, position, project end, Play/Stop, back to start, Loop) renders when the follow mode, the committed project end, the loop or the range change;
- **View** (zoom slider and readout, zoom to selection, Zoom back, Fit, Export) renders when the zoom, `canZoomBack` or the range change.

A lane mute renders the view and the Edit group only. A zoom step renders the view and the View group only. A status write or an export reset renders none of them. What the user sees, hears and focuses is unchanged.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28, 47, 50 and 58. C also reads 22, 37, 38, 48, 56, 57, 59 and 60.
- `b-round-375/sketch.patch.txt` (the dispatched sketch), `b-round-375/sketch-review.md`.
- Primitives: `AUDIO_ARCHITECTURE.md` (Studio); `REACT_CONTEXT.md`; `FORWARDREF_COMPONENT.md` (component change); `AGENT_DISCOVERABLE_CODE.md` (new exports `ArrangementTransportView`, `ArrangementTransportViewProps`, `ArrangementTransportActions`, `useArrangementTransportActions`); `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§8).

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance refactor with no visible change (the 2026-10-27 rule).

**Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `6b11be7`, published by gate 375 [K1]. The tree is clean [K2].
- Protected files pass their sha check [K11]. No grant is a protected file.
- Frozen: every tracked file except the grants is in `b-round-375/r376-frozen-sha256.txt` (1,261 entries) [K12].
- REGRESSION: `regression-last.json` is 2026-11-05 [K21]. It is due at the first planning on or after 2026-11-08, so not this round.
- **At HEAD:**
  - `ArrangementTransport({ onOpenExport, navigation })` calls `useArrangement()` once and reads `arrangement` for `arrangement.loop` [K3, K4]. It has one focus hand-off ref and one layout effect that runs after every render; four buttons arm it (Undo→Redo, Redo→Undo, Delete→Undo, Zoom back→Fit) [K3, K4].
  - StudioWorkspace renders `<ArrangementTransport` with an inline `onOpenExport={() => setIsExportOpen(true)}` and a memoised `transportNavigation` [K5].
  - The seven transport actions are `useCallback`s in the provider [K6].
  - Name-keyed counts of `'ArrangementTransport'`: render-budget 5, selection-wrappers 3, drag-preview 7 [K7]. Two test files mount the wrapper directly, and `index.ts` exports it [K8]; its signature must not change.
  - The focus tests stub `requestAnimationFrame` to a no-op in both describes [K10].
- **Measured at HEAD:**
  - Production perf (C round 375's run on this code, `c-round-375/perf-interact.log`; the same values as `b-round-374/perf-sketch-results/latest-interactions.json`): `interact.zoom.1.components-per-key` 53, `zoom.30` 140, `click.components` 38, drag `releaseComponentsMax` 52 to 54, move/lane `move-components-max` 58.
  - Dev probe, displayName-aware (`b-round-375/probe/leaf-head-376.json`, both viewports): add 3, zoom 1, mute 1, Ctrl+Z 1, Undo button 1, Redo button 1, preview start 1, preview stop 2 Transport renders; Play/Stop render only `ArrangementTransportPlayStopInner` [K24].

## 0. B's pre-check (L23, L30, L37, L58)
| What | Command | Result |
|---|---|---|
| Sketch typecheck, Biome | `npm run typecheck`; `npx biome check` on the 6 sketch files | 0 TS errors; Biome rc 0 [K16] |
| Full suite on sketch v1 (L23) | `npx vitest run` | 252 files, 3,721 tests pass (HEAD 3,720 + RB-LEAF4) [K15] |
| Covering files on sketch v2 | `xargs -a b-round-375/covering-376.txt npx vitest run` | 140 files, 2,200 tests pass [K15] |
| Perf on sketch v2 (L58), production build, alone | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts perf/studio-lab-resources.perf.spec.ts` | <ul><li>2 passed; 0 FAIL rows [K17].</li><li>`zoom.1.components-per-key` 53 → **41** (1x and 6x); `zoom.30` 140 → **128**; `click.components` 38 → **29**.</li><li>`releaseComponentsMax`: fade/trim 52 → 44; move/lane 53 → 51; group 54 → 52; video, video-trim, video-fade 53 → 45. `move-components-max` move/lane 58 → 40, group 59 → 41.</li><li>**One accepted increase:** range and background-range `move-components-max` +2 (25 → 27, 37 → 39), per-move +0.033. The three groups each hold the range selector, so a range start renders three group leaves where HEAD rendered one Transport. Moving the subscription into the view would render four. Ruled acceptable (D-29z1248); the row stays within its budget.</li><li>Every other deterministic row equals HEAD (`b-round-375/perf-sketch-vs-head.txt`, `perf-sketch-vs-head-json-all.txt`)</li></ul> |
| Other test roots (L30) | `perf/lib` imports no changed module; `e2e/` reaches the Transport only through the UI | The two perf specs passed on v2 |
| FL11 on three trees | `self-disabling-focus.test.tsx` on a HEAD copy, on v1 and on v2 | HEAD green, v1 **red**, v2 green (`fl11-on-head.log`, `fl11-on-v1.log`, `v2-covering.log`) |
| Mutants | §4 | [K19] |
| Assertion counts | `expect(` / `it(` per changed test file, HEAD vs sketch | `b-round-375/expect-counts-376.txt` [K20] |
| Patch equals sketch | the 6 files from `git show HEAD:`, `patch -p1`, `sha256sum -c sketch-files-sha256.txt` | rc 0, 6/6 OK (`patch-equals-sketch.txt`) |
| Browser probe on the sketch (dev, port 5176, own Vite cache, both viewports) | `node b-round-375/probe/leaf-probe-376.mjs` | the wrapper 0 on every step; zoom renders View + View group; mute and Ctrl+Z View + Edit; Undo/Redo buttons View + Edit + Centre; preview start/stop 0 (HEAD 1/2) [K25]. B's separate warm-up script timed out cold (L38); the probe itself ran clean at both viewports |
| Timeout headroom (L31) | gate 375 `verify.log`, `v2-covering.log` | RB-LEAF4 and FL11 are below vitest's 300 ms report line (default 5 s limit) in `v2-covering.log`; render-budget's slowest row (Play→Stop→Play, 15 s limit) 2.01 s at gate 375 and 1.78 s on v2; the start-hold row 0.99 s / 0.93 s. No changed-file row above 50 % |
| Consult | `tech-lead`: v1 approve with changes (TL-R376-M1 Medium fixed in v2; two Lows ruled below); delta review of v2 in `b-round-375/sketch-review.md` | — |

## 1. What A changes (grants: exactly these files, `b-round-375/grants-376.txt`)
1. **Apply the sketch:** from `store/`, `patch -p1 < ../tmp/studio-real-loop/b-round-375/sketch.patch.txt` (check `sha256sum` against `sketch-dispatched.sha256` first). Then `sha256sum -c ../tmp/studio-real-loop/b-round-375/sketch-files-sha256.txt` must give 6/6 OK. Make no other edit to those six files. The sketch contains:
   - `ArrangementTransport.tsx`: `useSoftDisableFocusHandoff()` (the HEAD layout-effect body unchanged; the arm callback is a `useCallback`; a new arm cancels the previous expiry frame and schedules a `requestAnimationFrame` that clears the arm; the frame is cancelled on unmount); `ArrangementTransportActions` (Pick of the seven actions) and `useArrangementTransportActions`; `ArrangementTransportEditGroup`, `ArrangementTransportCentreGroup`, `ArrangementTransportViewGroup` (memo, each with its own range/selection selectors and, for Edit and View, its own hand-off); `ArrangementTransportView = memo(ArrangementTransportViewInner)`; the `ArrangementTransport` wrapper keeps its exported signature and renders the view.
   - `StudioWorkspace.tsx`: `openExportDialog` (`useCallback`, no deps), `transportActions`, and `<ArrangementTransportView … />` with `undoLabel`, `redoLabel`, `pxPerSecond`, `loop={arrangement.loop}`, `committedProjectEnd`.
   - `render-budget.test.tsx`: `TRANSPORT_LEAVES`, `TRANSPORT_STEP_COUNTS`, row **RB-LEAF4** (mount liveness of the four inner names; then reset 0/0/0/0, mute 1/1/0/0, zoom 1/0/0/1, range 0/1/1/1, loop 1/1/1/0, mute with a loop on 1/1/0/0, undo 1/1/0/0, as View/Edit/Centre/ViewGroup; the wrapper `ArrangementTransport` 0 at reset and zoom as a site-revert guard); `CONTEXT_CONSUMERS` uses `StudioWorkspace` instead of the wrapper; the Play/Stop rows count `ArrangementTransportViewInner`; RB-LEAF3 asserts per commit.
   - `selection-wrappers-render.test.tsx`: the two "a commit happened" controls use `StudioWorkspace`; GH1 checks `ArrangementTransportViewInner` is live at mount (> 0) and 0 on a status write.
   - `drag-preview-render.test.tsx`: the five `toBe(0)` rows count `ArrangementTransportViewInner`; DP23 adds mount controls for `ArrangementTransportViewInner` and `ArrangementLibraryViewInner` (> 0) and expects a selection change to render `ArrangementTransportEditGroupInner` and not the view.
   - `self-disabling-focus.test.tsx`: row **FL11**.
2. **Doc:** `docs/implementation/2026/quarter-IV/243-perf-transport-leaves.md` (new; no 243 exists [K14]). Line 4 is byte for byte `**სტატუსი:** Completed (C round 376 PASS)`. TEMPLATE headings in order. It records: the three groups and what renders each; the hand-off hook and why the arm expires after one frame (TL-R376-M1, FL11); the test renames and why they are required; the §0 perf numbers including the accepted range +2; the mutants. Loop artifacts are cited with their full `tmp/studio-real-loop/…` path and labelled as outside the repository.

**Rulings (D-29z1248):**
- **TL-R376-M1 (Medium, fixed in the sketch):** with separate groups, a hand-off armed by a click whose commit leaves its group's props unchanged (two Undo clicks with the same labels) stayed armed until a later commit. The one-frame expiry restores HEAD's effective lifetime. FL11 proves it on three trees.
- **TL-R376-L1 (duplicate hand-off logic):** fixed by the shared hook.
- **TL-R376-L2 (the wrapper is reached only through `index.ts` and tests):** kept as the public convenience API, as in rounds 374 and 375; GATE375-L1-UNUSED-WRAPPERS is the shared deferred Low for the wrapper policy.
- **The range +2:** accepted, see §0.
- **Name renames are required:** once StudioWorkspace renders the view, the wrapper name counts 0 under StudioWorkspace, so every `toBe(0)` on it would pass vacuously (L23). Each renamed name has a `> 0` row in the same file.

**Behaviour that must not change (neighbour risk):** every Transport button's label, title, `aria-*`, `aria-keyshortcuts`, soft-disabled state and click result; the four focus hand-offs (FL3–FL10, SD5, SD6); the Loop button's pressed state and titles; the zoom slider value and readout; the Export dialog opening and focus return; Play/Stop and the position readout during playback.

## 2. A: checks (speed rules)
- `npm run typecheck`, `npm run lint`, `npx biome check` on the 6 files.
- `xargs -a ../tmp/studio-real-loop/b-round-375/covering-376.txt npx vitest run` (140 files). Report the count and any test above 50 % of its timeout.
- `code-reviewer` on the diff (3+ files), and again on any change after its review (L11).
- A does not run the full suite, `npm run verify`, the build, perf, the mutants or the browser rows.
- Write `a-round-376.md` as you go. Report reviewer findings and any Architecture note for B.

## 3. C: what to verify
C writes `c-round-376.md` and `c-round-376.json` as it goes, with all L57 fields (`manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` = `b-round-375/mutants/`, `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`). Then `python3 -I tools/l57-check.py c-round-376.json c-round-376/l57-check.txt` must exit 0. Write `c-round-376/progress.json` after every row (L59). Destructive commands and copies stay under `c-round-376/` (L60).

**Copies:** `cp -a` for every tree copy. Run mutants and perf one at a time, never next to each other or another vitest job (L38). A HEAD copy served on another port gets its own Vite cache.

**Browser recipe (all browser rows):** after `Demo collection ready` (L48), at 1440×900 and 1280×720, on a copy of HEAD served on another port and on A's tree. **PASS means A's value equals HEAD's for the same step at both viewports**, unless the row says otherwise.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all` lists only the §1 files (6 modified, 1 new doc = 7 lines). From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-375/r376-frozen-sha256.txt` rc 0; the protected check `b-round-318/protected-sha256.txt` rc 0 | Nothing outside the grants changed |
| **CLAIMS** | First (L56), from the loop root: `bash b-round-375/claims-376.sh`; compare with `b-round-375/claims-376-output.txt` (HEAD) and `claims-376-sketch-output.txt` (sketch) | K3–K10 and K27 equal the sketch output; K2 reads 7; K14 reads `doc 243 files: 1` with doc 242 l.4 unchanged; every other line equals the HEAD output; no `MISSING` |
| **SKETCH-EQUAL** | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-375/sketch-files-sha256.txt` | rc 0, 6/6 OK |
| **ASSERT-COUNT** | `expect(` and `^\s*it\(` on A's tree vs `git show HEAD:` for the 4 test files | Equal to `b-round-375/expect-counts-376.txt`. A lower count is a Medium bug |
| **UNIT** | The 140 files of `covering-376.txt`; then `render-budget.test.tsx` and `self-disabling-focus.test.tsx` with `--sequence.shuffle --sequence.seed=42` | All pass; no covering test above 50 % of its timeout |
| **MUTANTS-TREE** | On a `cp -a` copy of A's tree under `c-round-376/`: `TREE=<copy> OUT=<abs>/c-round-376/mutants bash b-round-375/mutants/run-all-376.sh`, once, alone | Each mutant red with the same failing ids as `b-round-375/mutants/mutant-<id>.log` (§4) |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on A's tree, alone | Every assert passes; `zoom.1.components-per-key` = 41 and `zoom.30` = 128; `click.components` = 29; each drag `releaseComponentsMax` and `move-components-max` equals `b-round-375/perf-sketch-vs-head-json-all.txt` (sketch column); range `move-components-max` 27 (accepted). A value equal to HEAD's (53/140/38) is a FAIL. A value off by one is compared with `perf-sketch.log` before it is called a FAIL |
| **PERF-RESOURCES** | `…/studio-lab-resources.perf.spec.ts`, alone | Passes; `res.harness.export-1-produced` passes |
| **LEAF-PROBE (browser, dev)** | Warm up first (L38). `node b-round-375/probe/leaf-probe-376.mjs <A's dev base> c-round-376/leaf-A.json`, and the same on HEAD | On A, at both viewports, equal to `b-round-375/probe/leaf-sketch-376.json` [K25] (View/Edit/Centre/ViewGroup): `ArrangementTransport` 0 on every step; `add-bass-enter` 1/1/1/0; `zoom-in-key` and `zoom-out-key` 1/0/0/1; `lane-mute-click` and `undo-ctrl-z` 1/1/0/0; `transport-undo-button` and `transport-redo-button` 1/1/1/0 (they undo and redo the clip add, so the committed project end changes); `space-play`/`space-stop`: only `ArrangementTransportPlayStopInner` 1; `library-preview-start`/`-stop`: all 0. On HEAD the wrapper renders 1 per commit, including the preview start (1) and stop (2) [K24] |
| **TRANSPORT-BROWSER (browser)** | <ul><li>(a) Empty project: read the title and `aria-disabled` of Undo, Redo, Split, Delete, Loop, Zoom to selection, Zoom back.</li><li>(b) Add `Bass` with Enter; read the Undo text and title; click Undo, read Redo; click Redo.</li><li>(c) Select the clip; Tab to Delete, press Enter: read `document.activeElement` (Undo, ring visible).</li><li>(d) Focus Undo, press Enter until history is empty: focus lands on Redo (L47).</li><li>(e) Click Fit first (the slider alone writes no zoom history: Zoom back stays disabled, `recipe-head-376-v1-no-fit.json`); then the zoom slider ArrowRight twice, read the readout; focus Zoom back, press Enter until it is soft-disabled: focus lands on Fit.</li><li>(f) Drag a time range on the lane: Split, Delete and Zoom to selection become available with their range titles; Ctrl+L: Loop `aria-pressed="true"`; mute a lane: Loop stays pressed (B did not pre-probe (f); C runs it on both trees).</li><li>(g) Follow toggle text and `data-follow-mode`; Export opens the dialog, Escape returns focus to Export</li></ul> | Every value equals HEAD. B's recipe probe (`b-round-375/probe/recipe-probe-376.mjs`, steps a, b, d, e, g) gave equal values on HEAD and the sketch at both viewports: Enter on Undo hands focus to Redo, Enter on Redo hands it back to Undo, Zoom back hands focus to Fit (`recipe-head-376.json`, `recipe-sketch-376.json`) [K28] |
| **G376-AUTH (browser)** | Fresh anonymous context, both viewports, warmed up | `/studio-lab` shows the workspace, `localStorage.auth_user` null; `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`; `/api/studio-token` no token → 401, no token in the body. A fake bearer's fail-closed 500 goes under `blocked` (backend unavailable) |
| **STUDIO-SMOKE-376 (browser)** | Add `Bass` with Enter; Play: position ≥ 00:01.000 after 1.5 s (L48); drag the clip by its name bar to the lane below, Ctrl+Z (Undo title "Undo: Move to track — <lane>"); Master Mute click and Ctrl+Z; library preview Play and Stop | As stated, equal to HEAD |
| **DOCS** | Doc 243 l.4 byte for byte; TEMPLATE headings in order; every test and file it names exists (L26); `grep -rn 'C round [0-9]* pending' docs/implementation` 0 hits | As stated |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. List them under `"gate"` and `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if LEAF-PROBE, TRANSPORT-BROWSER, G376-AUTH and STUDIO-SMOKE-376 all ran at both viewports.

## 4. Mutants (`b-round-375/mutants/run-all-376.sh`, on the 140 covering files)
See `b-round-375/mutants/summary.txt` and `mutant-<id>.log` for the exact red ids [K19]. The first DELETE attempt in `summary.txt` (`MUTANT-NOT-APPLIED rc 4` and a traceback) was a wrong-indent anchor; it was re-run with the corrected anchor (now in `run-all-376.sh`), and `mutant-MU-T-DELETE-NO-ARM.log` is the valid record (FL5 red). Pass `TREE=` explicitly: the default `scratch/` was removed after planning (the runner exits 2 without it).

| Mutant | File: old → new | Expected red |
|---|---|---|
| MU-T-DELETE-NO-ARM | Transport: Delete stops arming the hand-off | FL5 |
| MU-T-UNDO-ARM-SELF | Transport: Undo arms `undoButtonRef` instead of Redo | FL3, SD5 |
| MU-T-HANDOFF-NO-EXPIRY | Transport: the expiry frame does not clear the arm | FL11 |
| MU-T-ACTIONS-FRESH | Transport: the actions `useMemo` gets a fresh `{}` dep | RB-LEAF4 reset |
| MU-T-EXPORT-INLINE | StudioWorkspace: `onOpenExport` inline again | RB-LEAF4 reset |
| MU-T-LOOP-CLONE | StudioWorkspace: `loop` shallow-cloned | RB-LEAF4 mute (Centre) |
| MU-T-VIEW-NO-MEMO | Transport: the view without `memo` | RB-LEAF4 reset, Play/Stop rows |
| MU-T-EDIT-NO-MEMO | Transport: the Edit group without `memo` | RB-LEAF4 zoom (Edit) |
| MU-T-SITE-REVERT | StudioWorkspace renders `<ArrangementTransport …/>` again | RB-LEAF4 wrapper 0 |
| MU-T-CANZOOMBACK-TRUE | Transport: `canZoomBack={true}` | SD1 / FL6 |

## 5. Neighbour risk
- **Render totals** may only drop, except the accepted range +2. RS4, PV1–PV4, GH1–GH5, RB-MEMO1–3, RB-LEAF1–3 and RB-PB2 pass on the sketch.
- **Focus:** the hand-off now runs per group. Every source and its partner are in the same group, so a source that becomes soft-disabled always renders its group in that commit (`tech-lead`). FL3–FL11 and SD1–SD9 cover it.
- **Stale props:** every value the old Transport read from `useArrangement()` is a prop or the group's own subscription (`tech-lead`, `sketch-review.md`).
- **The wrapper contract:** `<ArrangementTransport onOpenExport navigation>` (2 test files, `index.ts`) keeps its signature [K8].

## 6. Order after this round (D-29z1249)
1. REGRESSION first, if the round-377 planning falls on or after 2026-11-08.
2. PERF-11c-iii-c2: LoopBrace and MarkerRow (premise from the displayName-aware probe).
3. PERF-11c-iii-d (VideoDock) and -e (Lane): wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, or RETRO 384.
4. PERF-11b if root or Saba answers; PERF-12…15; SYS-R2-FAKE-FIDELITY, SYS-CLOCK-DETERMINISM.
5. STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries under the skip rule.

## 7. Root notes
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING** is still open (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`). Gate 375's architecture note is its third echo; this round is the fourth pattern-A leaf and the third `use*Actions` hook. It does not block c1 or c2.
- After C PASS this round is ready for the gate: 6 code/test files and 1 doc.

## 8. Claims (L29 + L56)
Run `bash b-round-375/claims-376.sh` from the loop root. HEAD output: `b-round-375/claims-376-output.txt`; sketch output: `b-round-375/claims-376-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 375 published `6b11be7` |
| K2 | status line count |
| K3 | Transport: wrapper form, `useArrangement()` calls, memo view, memo groups, hand-off hook, layout effects, range selectors |
| K4 | HEAD Transport reads `arrangement`, `arrangement.loop`, four arm calls |
| K5 | StudioWorkspace Transport site, export opener, actions hook, navigation memo |
| K6 | the seven transport actions are `useCallback`s |
| K7 | name-keyed counts in the three render test files |
| K8 | tests mounting the wrapper; `index.ts` export |
| K9 | row ids |
| K10 | focus tests stub rAF to a no-op |
| K11 | protected sha check |
| K12 | frozen sha check |
| K13 | the six files equal the sketch |
| K14 | doc 243 count; doc 242 l.4 |
| K15 | suite on v1, covering on v2 |
| K16 | sketch typecheck, Biome |
| K17 | perf on the sketch |
| K18 | patch sha |
| K19 | mutant failed-test counts |
| K20 | expect/it counts |
| K21 | regression date, lessons lines |
| K22 | `tasks/round-375.md` sha |
| K23 | covering file count |
| K24 | HEAD dev probe |
| K25 | sketch dev probe |
| K26 | every cited artifact exists |
| K27 | Transport testids |
| K28 | recipe probe on HEAD and the sketch |
