# Round 409: PERF-11c-iii-e-ii — the Lane becomes a shell over a `memo` inner with per-lane props, from B's reviewed sketch (render saving, behaviour-preserving)

**Planned by:** B, at the round 408 → 409 planning, 2026-11-08 (`b-round-408.md`). The advisor was used before planning and before hand-off.

## Read first
- `lessons.md` in full. The most relevant lessons are L4, L11, L23, L26, L28, L29, L31, L37, L38, L55, L56, L57, L58 and L59.
- This file. Open `tasks/round-407.md` only to look up the d-ii shape (VideoDock shell + `memo` inner) and `tasks/round-408.md` only for the e-i actions contract.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-408/claims-409.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-408/claims-409-planning-output.txt`. Its stderr is empty (`claims-409-planning-stderr.txt`).
  - Output on the sketch scratch (HEAD plus the patch, committed): `b-round-408/claims-409-sketch-output.txt`, stderr empty.
  - The two differ only on the lines in `b-round-408/claims-409-planning-vs-sketch.diff`.

## Baseline: HEAD `37b1db8`, clean tree
- Gate 408 published `37b1db8` on both remotes [K17]. HEAD is `37b1db8…` [K1], and `git status --short --untracked-files=all` is empty [K2].
- **Frozen:** `b-round-408/r409-frozen-sha256.txt` has **1,299** entries: every tracked file except the 3 tracked grants. `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **Grants:** `b-round-408/grants-409.txt` (4 paths, §4).
- **No root patch pending:** `cloud/root-commits/` and `root-deps-request.json` do not exist in the loop folder at planning. If K1 at A1 is not `37b1db8`, A re-runs the claims on the new HEAD and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 408 passed and is published.** PERF-11c-iii-e-i is done: C round 408 PASS, `browserVerified`/`realVerified` true, 0 bugs, gate 408 `37b1db8` (D-29z1416).
- **No Critical or High finding is open.** The open Mediums are root-only, manual or `awaiting_user`, and none reproduces in the cloud browser. C reported no bugs in round 408.
- **REGRESSION-2026-11-10 is not due.** `regression-last.json` says 2026-11-07 [K18]. **RETRO** is due at round 416.
- **Order (D-29z1414): e-ii is next.** It is the last stage of PERF-11c-iii, the leaf consumers of the value context.
- **Premise, measured at HEAD (L37):** in the dev-build leaf probe (`b-round-408/probe/leaf-head-409.json`, identical at both viewports), `ArrangementLane` renders all 4 lanes on every workspace commit: `[0,12,4,4,0,0,0,4,4,4,4,4,8,4,4]` over the 15 steps [K21].
- **The saving (B's sketch, both viewports, plus a loaded replicate):** a new inner leaf `ArrangementLaneViewInner` renders `[0,8,4,4,0,0,0,1,1,4,4,0,0,1,1]` [K21].
  - Lane Mute, its Undo, an exclusive Solo and its Undo now render 1 lane instead of 4.
  - The library preview start and stop now render 0 lanes instead of 4 and 8.
  - Zoom still renders every lane, because `pxPerSecond` changes. The transport Undo and Redo also render every lane: they undo and redo the Bass add, which changes the project length.
- **Product promise (L55):** the Studio behaves exactly as before. Mute, Solo (exclusive and Ctrl), Volume, Pan, clip titles and waveforms, the video audio notes, lane-move ghosts, the empty-lane hint, library drops, video import and lane drags work as now. Nothing visible changes; the Studio only does less work per edit.

## 1. Rulings (B)

### D-29z1418: e-ii scope and design
- **Shape (d-ii pattern, `ArrangementVideoDock.tsx`)** [K7]:
  - `export function ArrangementLane(props: ArrangementLaneProps)` is a thin shell. It keeps `useArrangement()` [K8] and `useArrangementPreviewLaneClips(arrangement, trackId)`, and it moves the lane-drag ghost subscription up from the inner.
  - It derives the per-lane props:
    - `clips` and `pxPerSecond`;
    - `laneSources`, a `useMemo` over `[clips, collection, sourcePeaks, videoSources]`: title, peaks and video audio status per source of this lane;
    - `sourceDurations`, passed whole;
    - `laneGhosts`, and `laneGhostTitles` (a `useMemo`; a constant empty list when there are no ghosts);
    - `hasArrangementClips`.
  - It renders `memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual)`.
- **The comparator:**
  - `track` is compared field by field through `LANE_TRACK_FIELD_COMPARES`, a table typed `{ [Field in keyof Required<ArrangementTrack>]: … }`. Its 8 entries equal the 8 fields of `ArrangementTrack` [K10].
    - Why: an exclusive Solo rebuilds every track object [K10].
    - A new `ArrangementTrack` field is a compile error, with no type assertion (`mutants/tsc-mutant-NEW-TRACK-FIELD.log`, tsc rc 2) [K16].
  - Every other prop is compared with `Object.is`.
- **Why `laneSources` is a `useMemo`, not a content compare:**
  - Peaks are stored in the same callback that marks the source ready, at both load sites [K12]. So `sourceDurations` always changes in the same commit, and a content compare could never be shown to matter.
  - Sketch v1 had one, and its always-equal mutant survived in jsdom and in the browser (`lane/v1-mutant-SOURCES-ALWAYS-EQUAL-1440x900.json`).
  - With the `useMemo`, every input change forces a render by construction.
- **Why `sourceDurations` is passed whole:** a lane-scoped map rebuilt on each inner render would change `ArrangementClipView`'s prop identity, and every clip of that lane would re-render. `performance-optimizer` agreed.
- **The 6 StudioWorkspace callbacks and `timelineWindow`** that reach the Lane are already stable (`useCallback` / `useMemo`) [K11]. So the comparator sees only real changes.
- **Unchanged:**
  - The inner's JSX, handlers, focus calls and `data-testid`s. The inner body is the old Lane body. Its only changes are the source of `clips`, `pxPerSecond`, the titles, the peaks and the video audio, the ghost titles, and `hasArrangementClips` [K7].
  - The render-log name `ArrangementLane` still counts the shell. Its counts are unchanged in the browser [K21] and in the 5 test files that read it [K13]: `drag-preview-render`, `fader-pointer-preview`, `track-meter-ui`, `clip-gain-pointer-preview` and `render-budget`.
- **Not folded in:**
  - TL-R408-SK-L1/L2 and A-R408-REVIEW-AC8-PAN-TITLE: e-ii does not own `actions-context.test.tsx`.
  - The `ACTION_KEYS` proposal (SIG-R408-ACTIONS-TRIPLE-LIST). It is the boundary checkpoint's question (D-29z1418, `b-round-408/root-request-arch-checkpoint-perf11c-iii.md`, non-blocking).

### D-29z1419: consult and review rulings
- **`performance-optimizer`** (`b-round-408/consult-performance-optimizer.md`) found the design sound. It adopted the compile-time field guard. Do not pin the shell's cost: `shells()` is now `toBeLessThanOrEqual(3)`.
- **`tech-lead` on v2** gave APPROVE WITH LOWS. All four Lows are fixed in v3:
  - SK-1: the typed table;
  - SK-2: RB-LEAF8 finds the clip title by its name-bar `title` (`getAllByTitle`), not by `textContent`;
  - SK-3: RB-LEAF9 first sets a blocked ghost, which renders 1 lane (the target), and then a valid one, which renders 2 (the target plus the source lane);
  - SK-4: a Pan commit renders 1 lane, with the Pan slider value `25`, plus the mutant MU-409-DROP-PAN-FIELD.
  - SK-5…7 are Info.
- **`tech-lead` on the dispatched v3 sha:** see `b-round-408/sketch-review.md`.

### D-29z1420: the dispatched patch (L58: reviewed = dispatched)
**Patch:** `b-round-408/sketch-409.patch.txt`, sha256 `1beedffbda3eca0f…` [K14]. It touches 2 files, and `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 2 files afterwards.** It is reproducible with `b-round-408/tools/make-sketch.py` + `make-sketch-tests.py` + `biome format`.

**Evidence on the final sketch (v3):**
- tsc, Biome and lint: rc 0 (`b-round-408/sketch-logs/rc.txt`).
- The 46 covering files (`sketch-logs/covering.txt`): **914/914** [K23]. The slowest is 2,072 ms, in a describe with a 20,000 ms timeout. The new rows take ≤ 402 ms against the default 5,000 ms (`sketch-logs/slowest.txt`). None is above 50 % (L31).
- **Full vitest: 262 files and 3,885 tests, rc 0** [K20].
- **Mutants: 9/9 red**, pristine before and after rc 0, plus the tsc guard [K16].
- **Dev leaf probe, 15 steps, both viewports** [K21]:
  - The shell and every other leaf equal HEAD. The only difference is `ArrangementLibraryPreviewViewInner`, which differs by 1 on the last step under load (the known preview jitter).
  - The inner equals the sketch value in the loaded replicate (2 × `yes`).
  - The PLAIN-MEMO mutant gives `…,4,4` on the two Solo steps.
- **Browser LANE-ACTIONS probe v409** (`b-round-408/lane/lane-actions-probe.mjs`): 8 steps. They are the 408 steps plus `bass-waveform`, `exclusive-solo` and the fixed `active-track` (B-R408-PROBE-ACTIVE-TRACK-VACUOUS: it clicks an unpressed lane and records before and after).
  - It is `ok` on HEAD and on the sketch at both viewports.
  - The DROP-SOLO-FIELD mutant, applied through HMR, fails `solo` and `exclusive-solo` [K22].

### Doc 262 (new) and doc 261 (L26, L28)
**New doc:** `docs/implementation/2026/quarter-IV/262-perf-lane-memo.md`. 262 is the next free number [K6].
- **Form:** title `PERF-11c-iii-e-ii: Lane-ის memo inner და ხაზის props`, in Georgian with technical terms in English. The 7 TEMPLATE headings, in order.
- **l.4, byte-exact:** `**სტატუსი:** Completed (C round 409 PASS)`.
- **ტესტირება** contains:
  - RB-LEAF7, RB-LEAF8 and RB-LEAF9;
  - the 9 mutant rows and the tsc-guard line, copied from `b-round-408/mutants/summary.txt`;
  - the leaf-probe arrays (shell, inner, PLAIN-MEMO mutant);
  - the LANE-ACTIONS result, including the DROP-SOLO-FIELD failure.
- **TODO** names PERF-15 (next), the boundary checkpoint request, and TL-R409-SK-5…7 (info) if relevant.
- Loop evidence is cited with its full loop path and marked as outside the repo.

**Doc 261**, as the final stage of a two-stage feature (L28): only l.4 changes, to exactly `**სტატუსი:** Completed (C round 409 PASS)`. The count of `In Progress (stage` docs goes from 8 to 7 [K6b], and the count of `C round N pending` lines stays 0.

No other doc changes.

### Ruling lines (L4)
- **Patch files:** "apply the patch byte-for-byte" wins over any style preference of A's reviewer.
- **STOP:** a Medium+ in the patch logic is a STOP (L11), not an edit. A doc finding is fixed in doc 262, or in doc 261 (l.4 only).
- **render-budget.test.tsx:** "no assertion lost; equal or stronger replacements allowed". The patch only adds two helpers and RB-LEAF7/8/9, and every existing row is byte-identical.
- **L50 (focus origins):** not triggered. No element unmounts and no focus moves. The memo only skips renders whose props are equal, and every handler and focus call is in the unchanged inner body.
- **L39 (screen budget):** not triggered. Nothing visible changes.
- **L49 (side effects of a replaced call):** the shell takes over 3 things from the old Lane body: the `useArrangementPreviewLaneClips` call, the ghost subscription and the title lookup. Each keeps its effect. The clips are the same `useShallow` result; the ghosts are the same `useShallow` selector; the titles use the same lookup order (video name, then collection title, then source id). Proof: RB-LEAF8 (titles), RB-LEAF9 (ghost title from another lane) and the `bass-waveform` step.

### Side effects (L49)
| Effect | Ruling | Proof |
|---|---|---|
| A lane skips renders whose props are equal | Intended | RB-LEAF7, the leaf probe |
| A track field the inner shows changes (Mute, Solo, Pan, Volume, name) | The lane renders; the table covers every field | RB-LEAF7; MU-409-DROP-SOLO-FIELD, -DROP-PAN-FIELD, -TRACK-IDENTITY red; the tsc guard |
| Peaks, titles or video audio arrive | `laneSources` recomputes, so the lane renders | RB-LEAF8; MU-409-SOURCES-DEPS-NO-PEAKS red; the `bass-waveform` step |
| A lane-move ghost from another lane | The title is resolved in the shell from `arrangement.clips` | RB-LEAF9; MU-409-GHOST-TITLE-EMPTY red |
| The project becomes empty or non-empty | `hasArrangementClips` changes | LSU9; MU-409-EMPTY-HINT-ALWAYS-CLIPS red |
| Zoom | `pxPerSecond` changes, so every lane renders | RB-LEAF7 zoom = 3; MU-409-REST-IGNORED red |

## 2. Reference
Not applicable. This is a performance round with no visible or behavioural change, which the reference-first rule excludes. There is no screen-budget change, and the product-designer, Ableton and YouTube steps do not apply.

## 3. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-408/sketch-409.patch.txt`, then `git apply` the same file. Do not edit the 2 files after that.
3. Write doc 262, and change doc 261 l.4, as above.
4. Run the §5 checks. Write `a-round-409.md` as you go: changed files, checks with their rc and file paths, reviewer findings, and a For B section (include any Architecture note).

## 4. Grants (`b-round-408/grants-409.txt`)
- **Patch only:**
  - `app/components/arrangement/ArrangementLane.tsx`
  - `app/lib/arrangement/__tests__/render-budget.test.tsx`
- **l.4 only:** `docs/implementation/2026/quarter-IV/261-perf-lane-actions.md`.
- **New doc:** `docs/implementation/2026/quarter-IV/262-perf-lane-memo.md`.
- **Nothing else:** no protected, auth, route, config, package, context, perf or other doc file.
- At the end, `git status --short --untracked-files=all` shows exactly 3 ` M` lines and 1 `??` line.

## 5. A's checks
Under the speed rules, the full suite and verify belong to the gate.

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-408/claims-409.sh` at start | Equals `claims-409-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 2 patch files | rc 0 each |
| A3 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-408/sketch-logs/covering.txt)` (46 files) | 914/914 pass. Report the slowest test against its declared timeout. L31: none may be above 50 %; otherwise STOP |
| A4 | Claims at end | Differs from planning only on K2 (4), K5 (`no`), K6 (`1` plus the doc 262 l.4), K6a (`Completed (C round 409 PASS)`), K6b (7, pending 0), K7, K9 and K10. K7, K9 and K10 equal `claims-409-sketch-output.txt`. K3 stays 1,299 with rc 0 |
| A5 | `code-reviewer` (4 files) | No Critical, High or Medium in the patch logic. A Medium+ there is a STOP (L11). Doc findings are fixed in doc 262 or doc 261 l.4 |

## 6. C's acceptance
Write `c-round-409.json` with **all L57 fields**, including `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`, and one result per row. `mutantRedOnSketch` = `b-round-408/mutants/summary.txt`. Run `python3 -I tools/l57-check.py` before hand-off.

**Order (L59):** run the heaviest rows first: row 5, then row 4, then row 3. Write `c-round-409/progress.json` after every row.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the planning output except the A4 lines. Status = the 4 granted paths. Frozen 1,299 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply the patch to a `git archive HEAD` scratch and `cmp` its 2 files against the working tree: 0 differences |
| 3 | **LANE-ACTIONS** (browser, 1440×900 and 1280×720, working tree) | Run `node b-round-408/lane/lane-actions-probe.mjs http://127.0.0.1:5173 <out>.json <WxH>`. **Assert:** `ok` true, no `error`, `pageErrors` []. Each of the 8 steps has `pass` true: `bass-waveform`, `mute`, `solo`, `volume-drag`, `pan-drag`, `undo-mix`, `active-track` (an unpressed lane before the click, pressed after it, and exactly one pressed) and `exclusive-solo`. B's runs: `ok` on HEAD and on the sketch at both viewports. The DROP-SOLO-FIELD mutant fails `solo` and `exclusive-solo` (`lane/mutant-DROP-SOLO-FIELD-1440x900.json`). Keep the screenshot per viewport |
| 4 | **LEAF-PROBE** (browser, both viewports) | Run `node b-round-408/probe/leaf-probe-409.mjs http://127.0.0.1:5173 <out>.json`. **Assert:** 0 page errors and no `error` per viewport. `ArrangementLaneViewInner` per step = `[0,8,4,4,0,0,0,1,1,4,4,0,0,1,1]`. `ArrangementLane` = `[0,12,4,4,0,0,0,4,4,4,4,4,8,4,4]`. `StudioWorkspace` equals `b-round-408/probe/leaf-sketch-409.json`. Solo is pressed after `lane-solo-click` and unpressed after `lane-solo-undo` (`soloPressedAfterClick` true, `soloPressedAfterUndo` false). **Record:** every other leaf against the same file. `ArrangementLibraryPreviewViewInner` on steps 12–15 has a known jitter of ±2 |
| 5 | **UNIT + MUTANT** | The A3 set passes, 914/914. Then run the mutants on a committed scratch copy of the working tree (steps in the notes). Pass = 9/9 RED, each naming its expected row; pristine before and after rc 0; scratch status 0 lines. Also re-run the tsc guard: add `  colour?: string;` after `groupId?: string;` in the scratch `app/types/arrangement.ts`, run `npx tsc --noEmit` (expect rc 2, with an error that names `colour` in `ArrangementLane.tsx`), then restore the file |
| 6 | **AUTH** (browser, both viewports) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 7 | **DOCS** | Doc 262 l.4 and doc 261 l.4 byte-exact; doc 262 has the 7 TEMPLATE headings in order (L26). Its 9 mutant rows equal `b-round-408/mutants/summary.txt`, and RB-LEAF7/8/9 exist in the test file. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. No other doc changed |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. Claims at end equal claims at start, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch run is in `b-round-408/precheck-full.log` |

**Notes on the rows:**
- **Rows 3, 4 and 6, retries:** a first-load timeout on a cold server is an environment problem (L38: warm `/studio-lab` once in a browser first). Retry at most twice; it is never a FAIL. B's first lane run on the sketch server hit one (`lane/sketch-cold-timeout-1440x900.json`).
- **Row 3, scope:** the probe drives the first non-video lane after adding Bass with Enter. The library drop, video import and lane-drag paths are not in the browser probe. They are covered by unit files in the A3 set that use drop events and the video input (for example `track-layout`, `lane-strings-ui`, `grid-snap-loop-drop`, `markers-ui`, `name-bar-hint-ui`), and RB-LEAF9 covers the ghost. C records this, and it is not a FAIL.
- **Row 4, transport steps:** `transport-undo-button` and `transport-redo-button` undo and redo the Bass add. That changes the project length, so all 4 lanes render (`tech-lead` SK-5). This is expected, not a comparator miss.
- **Row 5, mutant steps:**
  1. Copy the working tree to `/tmp/c409-scratch` and symlink `node_modules`.
  2. Run `git init && git add -A && git commit`.
  3. Run `S=/tmp/c409-scratch OUT=<loop>/c-round-409/mutants python3 -I b-round-408/mutants/run.py`. Never use the default `OUT`, which holds B's evidence.
  4. The runner prints `SCRATCH-STATUS N lines (B uncommitted sketch: 2; a committed scratch: 0)`. On C's committed scratch, 0 lines is the pass value.
  5. The tsc-guard line is not printed by `run.py`. Run it as row 5 says and write it in your own summary.

**Neighbouring behaviour that could break:**
- Lane Mute, Solo (exclusive and Ctrl), Volume and Pan, including Undo (row 3, RB-LEAF7).
- Clip titles, waveforms and video audio notes (RB-LEAF8, `lane-strings-ui`, `bass-waveform`).
- Lane-move ghosts and their labels (RB-LEAF9, `drag-feedback-colour-ui`, `grid-snap-*`).
- The empty-lane hint (LSU9).
- The render-log tests that count `ArrangementLane` [K13]; their counts are unchanged in the covering run.

## 7. For C: the mutants (`b-round-408/mutants/run.py`, site file `ArrangementLane.tsx`)
| Mutant | Site | Expected red |
|---|---|---|
| MU-409-PLAIN-MEMO | `memo(ArrangementLaneViewInner)` without the comparator | RB-LEAF7 (also the browser Solo steps) |
| MU-409-TRACK-IDENTITY | `isSameLaneTrack` returns `a === b` | RB-LEAF7 |
| MU-409-DROP-SOLO-FIELD | `solo: () => true` | RB-LEAF7 (also the browser `solo` and `exclusive-solo` steps) |
| MU-409-DROP-PAN-FIELD | `pan: () => true` | RB-LEAF7 |
| MU-409-SOURCES-PER-COMMIT | `arrangement` added to the `laneSources` deps | RB-LEAF7 |
| MU-409-SOURCES-DEPS-NO-PEAKS | `sourcePeaks` removed from the `laneSources` deps | RB-LEAF8 |
| MU-409-REST-IGNORED | the generic `Object.is` compare is skipped | RB-LEAF7 |
| MU-409-GHOST-TITLE-EMPTY | the ghost title is `''` | RB-LEAF9 |
| MU-409-EMPTY-HINT-ALWAYS-CLIPS | `hasArrangementClips={true}` | LSU9 |
| MU-409-TSC-NEW-TRACK-FIELD | `colour?: string` added to `ArrangementTrack` | tsc rc 2 |

**Equivalent and recorded (not rows):**
- reordering the table entries or the `useMemo` deps;
- `Required<ArrangementTrack>` vs a `-?` mapped type;
- `laneGhostTitles` without the empty-list constant (it costs extra renders only during a drag);
- removing `hasArrangementClips` in favour of `clips.length` (that changes behaviour: LSU9 is red, see above).
