# Round 379: PERF-11c-iii-c2b. The marker row stops rendering on unrelated workspace commits

**Planned by:** B, at the round 378 → 379 planning, 2026-11-07 (`b-round-378.md`).

**Decisions** (`backlog.json` v344 → v345, `decisions_log_b`):
- **D-29z1258:** round 378 accepted. C PASS with `browserVerified` true and 0 bugs; gate 378 published `3ae2885`. PERF-11c-iii-c2a is done.
- **D-29z1259:** gate 378 review: Lows, info and one architecture signal (see `b-round-378.md`).
- **D-29z1260:**
  - REGRESSION is still not due. 2026-11-05 → 2026-11-07 is 2 days and the rule needs 3.
  - Round 377 placed c2b "after REGRESSION". That was a timing guess, not a rule, so c2b runs now.
  - REGRESSION is the next round planned on or after 2026-11-08.
- **D-29z1261:** the order after this round (§6).

**What this round does:** `ArrangementMarkerRow` becomes a pattern-A leaf, like Master, Library, Transport and LoopBrace:
- **The view:** `ArrangementMarkerRowView = memo(ArrangementMarkerRowViewInner)`. It receives `markers`, `projectEnd`, the four layout props, `actions` and `handleRef`.
- **The actions hook:** `useArrangementMarkerRowActions(workspace)`, a `useMemo` over 11 stable provider callbacks.
- **The imperative handle:** it moves from `forwardRef` to a `handleRef` prop. The test render log can only see plain function fibers, so a `forwardRef` view would read 0 there whatever it does.
- **No wrapper:** StudioWorkspace is the only consumer [K7].
- **One focus line (tech-lead TL-R379-L1):** `focusEditorSuccessor` clears `pendingFocusRef` after `focusMarkerTarget`. At HEAD, the workspace render that closing the grid menu caused cleared that pending target; the memo skips that render now, so the clear keeps the HEAD result: focus the flag if it is connected, otherwise do nothing, with no later jump.

**Result:**
- A lane mute, a Master mute, an Undo of those, and a library preview start or stop no longer render the marker row.
- A marker edit, its Undo, a zoom step and a project-end change still render it.
- The user sees, hears and focuses nothing different.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28 and 58. C also reads 22, 37, 38, 47, 48, 50, 56, 57, 59 and 60.
- `b-round-378/sketch-review.md`.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance refactor with no visible change (the 2026-10-27 rule). **Screen budget:** nothing visible is added or removed.

## Baseline
- **HEAD and tree:** HEAD is `3ae2885` (gate 378 published) and the store tree is clean, 0 status lines [K1, K2]. `context/head-sha.txt` (`79ed8a9`) is pre-gate and stale.
- **How MarkerRow reads the workspace at HEAD:**
  - It calls `useArrangement()` once [K3] and derives `markers = arrangementMarkers(arrangement)`.
  - `arrangementMarkers` returns `arrangement.markers ?? NO_MARKERS`, so the identity is stable across commits that do not touch markers [K8].
  - `useArrangementIsPlayingReader` and `useArrangementRangeStore` do not subscribe: one is a `getState` getter, the other a store object read with `getState()` [K8].
- **Mount:** StudioWorkspace mounts `<ArrangementMarkerRow ref={markerRowRef} …>` and calls 4 handle methods through `markerRowRef.current?.` [K4].
- **Premise, measured in the browser at HEAD** (`c-round-378/leaf-A.json`, re-measured in `b-round-378/probe/leaf-head-379.json`, both viewports): MarkerRow renders on every StudioWorkspace commit. Values per step: add 3, zoom 1, lane mute 1, Ctrl+Z 1, Undo/Redo button 1, preview start 1, preview stop 2 [K17].
- **Provider callbacks:** the 11 callbacks are `useCallback`s in ArrangementContext [K5].
- **Tripwires and manifests:**
  - Transition APIs on the path: 0 [K6].
  - Protected files pass [K9].
  - Frozen manifest: `b-round-378/r379-frozen-sha256.txt`. It covers every tracked file except the 3 granted ones, 1,266 entries [K10].
- **Name sweep:** 'ArrangementMarkerRow' appears in tests only as a path string, in `studio-focus-ring.test.ts` and `strings.test.ts` (source scans). There are no `counts.get('ArrangementMarkerRow…` lines [K7].

## 1. Behaviour that must not change
- **Marker row behaviour:** flags (aria-label, `aria-current`, `style.left`, text), the name editor (value, focus), the context menu items, `document.activeElement` and the status text. This covers:
  - add with M, then type and Enter;
  - lane Mute and its Ctrl+Z;
  - flag ArrowRight nudge and its Ctrl+Z;
  - F2 rename with Enter;
  - Shift+F10 menu, then Escape;
  - Ctrl+ArrowRight and Ctrl+ArrowLeft (the handle's `stepMarker`);
  - a mid-drag and a full drag of +60 px, then Ctrl+Z;
  - Delete on the focused flag, then Ctrl+Z.

  The recipe is `b-round-378/probe/marker-recipe-379.mjs`. The sketch equals HEAD on all 18 steps at both viewports [K18].
- **Focus targets (L47), as measured at HEAD by the recipe:**

  | After | Focus lands on |
  |---|---|
  | M | the name input |
  | add + Enter | the new flag |
  | F2 + Enter | the flag |
  | Escape on the menu | the flag |
  | Delete | `arrangement-marker-add` |
  | Ctrl+Z after Delete | stays on `arrangement-marker-add` |

- **Gestures:** pointer capture, snap, `claimPointerGesture`, the uncaptured-pointer watch, the unmount release, the gesture-blocked refusals for Enter and blur, and `keyRepeat` on nudge and step.
- **Every other leaf's render counts** in the leaf probe equal HEAD. Only `ArrangementMarkerRow` and `ArrangementMarkerRowViewInner` differ [K17].

## 2. What A changes (grants: `b-round-378/grants-379.txt`, exactly 4 files)
1. **Apply the sketch.**
   - Check `sha256sum ../tmp/studio-real-loop/b-round-378/sketch.patch.txt` against `b-round-378/sketch-dispatched.sha256` (`eaa1b3fd…`, sketch v2) [K13].
   - From `store/`, run `patch -p1 < ../tmp/studio-real-loop/b-round-378/sketch.patch.txt`.
   - `sha256sum -c ../tmp/studio-real-loop/b-round-378/sketch-files-sha256.txt` must give 3/3 OK [K11].
   - The patch touches three files:
     - `app/components/arrangement/ArrangementMarkerRow.tsx`: view, memo, actions hook, `handleRef`, and the pending-focus clear in `focusEditorSuccessor`;
     - `app/components/arrangement/StudioWorkspace.tsx`: import, hook call, mount with `markers`, `projectEnd` and `actions`;
     - `app/lib/arrangement/__tests__/render-budget.test.tsx`: the `addMarker` import and row RB-LEAF6 [K11, K12].
   - Make no other edit to these three files. Any edit beyond the patch is a STOP (L11).
   - **Ruled design (L10), not a STOP:** the `handleRef` prop replaces `forwardRef` and `displayName` on purpose. The reasons:
     - the test render log sees only plain function fibers;
     - StudioWorkspace is the only consumer;
     - the Master, Library, Transport and LoopBrace views are not forwardRef either.

     A code-reviewer note that this deviates from `FORWARDREF_COMPONENT.md` is recorded as info in `a-round-379.md`, not as a Medium STOP.
2. **Doc 245** (`docs/implementation/2026/quarter-IV/245-perf-marker-row-leaf.md`, new; number 245 is free [K19]):
   - l.4 is, byte for byte, `**სტატუსი:** Completed (C round 379 PASS)` (L28) [K19].
   - Include the TEMPLATE headings in order (L26).
   - Record:
     - the premise numbers;
     - the pattern-A shape;
     - why `handleRef` replaces `forwardRef`;
     - RB-LEAF6 and the four mutants, with the red line taken from `b-round-378/mutants/sketch-run/*.full.log`. HEAD-REVERT is red only because the name is absent; say so;
     - the perf result: 0 count-row differences except the known record-only video median, because the harness has no mute, undo or preview step;
     - the tech-lead review rulings from `sketch-review.md` (TL-R379-L1, -L2, -D1, -ARCH);
     - this round's L50 ruling (§4).
   - Loop paths keep their full `tmp/studio-real-loop/…` form, labelled as outside the repository.
   - Cite only rows that exist (L26).

## 3. A: checks (speed rules)
- `npm run typecheck`, `npm run lint`, and `npx biome check` on the three files.
- `npx vitest run` on the following, all of which must pass. render-budget has 20 tests [K12].
  - `app/lib/arrangement/__tests__/render-budget.test.tsx`
  - `app/lib/arrangement/__tests__/markers-ui.test.tsx`
  - `app/lib/arrangement/__tests__/markers-move-ui.test.tsx`
  - `app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx`
  - `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx`
  - `app/lib/arrangement/__tests__/studio-focus-ring.test.ts`
  - `app/lib/arrangement/__tests__/strings.test.ts`
- Report any test above 50 % of its declared timeout. Read the `describe`/`it` options first: render-budget's describe is at l.317 on the sketch [K21].
- `code-reviewer` is required (3+ files changed). Its findings go into `a-round-379.md`.
  - A Medium or above is a STOP (L11). A does not fix it.
  - An Architecture note goes to B as a signal.
- Write `a-round-379.md` as you go.

## 4. C: what to verify
C writes `c-round-379.md` and `c-round-379.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified`, `mutantsRecorded`;
- `mutantRedOnSketch` = `b-round-378/mutants/sketch-run/`;
- `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`;
- `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-379.json c-round-379/l57-check.txt` must exit 0.

Working rules:
- Write `c-round-379/progress.json` after every row (L59).
- Copies and destructive commands stay under `c-round-379/` (L60).
- Run perf and the mutants alone (L38).
- Warm up the browser before timed probes (L38).

**Browser rows:** run them at 1440×900 and 1280×720, after `Demo collection ready` (L48). Compare against a HEAD copy (`3ae2885`) on another port with its own Vite `cacheDir` (L38).
- **PASS means A's value equals HEAD's** for the same step at both viewports, unless the row says otherwise.
- Every browser row runs fresh in round 379. B's probe JSONs are reference values only.
- A cold-start timeout is environment-invalid (L38) and uses a replacement attempt.
- A ring check, if any, uses the keyboard path (`:focus-visible` only).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all`. From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-378/r379-frozen-sha256.txt` and the protected check `b-round-318/protected-sha256.txt` | 4 lines (3 M + doc 245); both rc 0 |
| **CLAIMS** | From the loop root: `bash b-round-378/claims-379.sh`. Compare with `b-round-378/claims-379-output.txt` (HEAD) and `claims-379-sketch-output.txt` (sketch) | K3, K4, K7, K11, K12 and K21 equal the sketch output. K2 reads 4 (compare K2 on `store/` only). K19 shows the l.4 string above and ≥ 1 RB-LEAF6 mention. Every other line equals the HEAD output. No `MISSING` |
| **SKETCH-EQUAL** | `sha256sum -c ../tmp/studio-real-loop/b-round-378/sketch-files-sha256.txt` from `store/` | 3/3 OK |
| **ASSERT-COUNT** | `expect(` and `^\s*it\(` on render-budget.test.tsx | 214/20 (`b-round-378/expect-counts-379.txt`). A lower count is a Medium bug |
| **UNIT** | The 145 files of `b-round-378/covering-379.txt` (K7 finds no test file outside it). Then render-budget, markers-ui and markers-move-ui with `--sequence.shuffle --sequence.seed=42` | All pass. Record the test counts (record — not run on sketch as a 145-file set; B ran the full suite on the sketch: 252 files / 3,725 tests [K14]). Report every test above 50 % of its declared timeout |
| **MUTANTS-TREE** | On a `cp -a` copy of A's tree under `c-round-379/`, alone: `TREE=<copy> OUT=<abs>/c-round-379/mutants bash b-round-378/mutants/run-mutants-379.sh` | MU-MR-NO-MEMO, MU-MR-ACTIONS-FRESH and MU-MR-MARKERS-FRESH are each red on RB-LEAF6 only, at the zero-render assert (sketch: l.981). MU-MR-HEAD-REVERT is red on RB-LEAF6 only, at the add-marker positive control (sketch: l.966, the name is absent at HEAD) [K15]. The script prints `restored` |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on A's tree, alone (it builds) | Every assert passes. Every count row (`components`, `commits`, `renders`, `restarts`) equals `c-round-378/perf-interact.log` (the 3ae2885 tree), except the record-only `interact.drag.video.playing.move-components-per-move` median, which moved in rounds 378 and 379 (INFO-C378-PERF-MEDIAN) and stays record. Sketch v1 had 0 FAIL and 1 such record difference (`b-round-378/perf-sketch-vs-head.txt`) [K16]. v2 was not re-run: its code delta is one statement no perf scenario reaches (`sketch-review.md` §4). A value off by one is compared with `b-round-378/perf-sketch.log` before it is called a FAIL |
| **LEAF-PROBE (browser, dev)** | `node b-round-378/probe/leaf-probe-379.mjs <A base> c-round-379/leaf-A.json`, and the same on the HEAD copy | At both viewports, A equals `b-round-378/probe/leaf-sketch-379.json` on every MarkerRow cell and on every cell except the preview-stop cell named below. `ArrangementMarkerRow` is 0 on every step (the name no longer exists). `ArrangementMarkerRowViewInner` is 0 on lane-mute, Ctrl+Z and library preview start/stop, and > 0 on add, zoom in and zoom out. Every other leaf equals HEAD's run in this round, except `ArrangementLibraryPreviewViewInner` on `library-preview-stop`. That cell counts preview progress frames by wallclock (≈ 315; HEAD 315, sketch v2 314/316 under load, L37), so it is record ±3, never a FAIL |
| **MARKER-BROWSER (browser)** | `node b-round-378/probe/marker-recipe-379.mjs <base> <out>` on A's tree and on the HEAD copy | Every field of steps s0–s17 equals HEAD at both viewports: flags, editor, menu, focus and status. The focus targets in §1 hold |
| **G379-AUTH (browser)** | Fresh anonymous context, both viewports, warmed up | `/studio-lab` shows the workspace with `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`. `/api/studio-token` with no token returns 401 and no token in the body. The fake bearer's 500 goes under `blocked` (backend unavailable) |
| **STUDIO-SMOKE-379 (browser)** | Add `Bass` with Enter. Play shows a position ≥ 00:01.000 after 1.5 s (L48 lead). Press M, type `A`, Enter. Drag the clip by its name bar to the lane below, then Ctrl+Z. Click Master Mute, then Ctrl+Z. Library preview Play and Stop | Equal to HEAD. The flag `A` is present after every step |
| **L50-RULING** | Re-run the grep in `b-round-378/l50-focus-origins.txt` on A's tree | 12 hits, at the sketch lines in that file (HEAD + 70). Each is covered by the ruling below |
| **DOCS** | Doc 245 | l.4 byte for byte; TEMPLATE headings in order; every row id, mutant id and file it names exists (L26); `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits [K19] |

**L50 ruling (focus origins, 12 hits [K23]).** The focus code is unchanged by the patch; only how often the view renders changes. Line numbers below are HEAD's; on the sketch each line is HEAD + 70 (`b-round-378/l50-focus-origins.txt` lists both). Hits that share a handler share a row:
- **l.205 and l.226** (`focusMarkerTarget` and the dependency-free pending-focus effect), **l.535 and l.652** (flag focus on drag and menu): MARKER-BROWSER s2, s5, s6, s10, s13–s17. `pendingFocusRef` is set only right before a marker commit, and that commit changes `markers`, so the view renders and the effect runs.
- **l.237** (editor input focus) and **l.901** (editor render): s1 and s7.
- **l.379** (restore after Escape on add) and **l.918 / l.921** (`settleEditor` on Enter, Escape and blur): s2 and s8, plus these UNIT rows:
  - markers-ui MU8c–MU8e;
  - grid-snap-menu GM44 and GM45, which cover the blur → grid-menu → `focusEditorSuccessor` handle path.
- **l.822** (flag list render) and **l.848** (flag `onPointerDown`): every step's `flags`, and s13–s15.
- **l.928** (menu render, `menu && menuMarker`): s9 (menu open, 3 items) and s10 (Escape closes it and focus returns to the flag). The workspace's scroll → `closeMenu` handle call goes through the same `closeMenu`; covered by UNIT rows markers-move-ui MV15–MV17 (horizontal scroll, Follow scroll and Ctrl+wheel zoom close the menu and return focus to the flag) and by the handle re-binding on `menu` state (§5).

**Other row rules:**
- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and e2e smoke. List them under `"gate"` and `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if LEAF-PROBE, MARKER-BROWSER, G379-AUTH and STUDIO-SMOKE-379 all ran at both viewports in this round. If the budget runs out, it is false and B plans the remainder (V2 rule).
- **Job limit:** if a row cannot finish before the job limit, mark it not run with the real stop signal (L59), never PASS.

## 5. Neighbour risk
- **Effects that now run less often.** The pending-focus `useEffect` and the detached-focus layout effect have no dependency array. They now run only when the view renders. Every write to their refs happens in a commit that changes `markers` or local state (see the L50 ruling and `sketch-review.md`).
- **A stale handle.**
  - `closeMenu` depends on `menu`, which is local state, so opening the menu renders the view and re-binds the handle.
  - `stepMarker` depends on `projectEnd`, which is a prop.
  - The workspace's 4 handle calls go through the ref at call time [K4].
- **The grid-menu focus return.** GM44 and GM45 (connected flag) must still pass. The not-connected path equals HEAD by construction (`sketch-review.md` TL-R379-L1; no mutant, reason recorded there).
- **Mutation in place.** If anything mutated `arrangement.markers` in place, the memo would hide the change. RB-LEAF6 checks identity across non-marker commits. GATE378-L2 (in-place mutation guard) stays a deferred Low.
- **Source scans.** `studio-focus-ring.test.ts` and `strings.test.ts` read ArrangementMarkerRow.tsx by path. They passed on the sketch and are in UNIT [K7].

## 6. Order after this round (D-29z1261)
1. After C PASS, round 379 goes to the gate: 3 code/test files and doc 245.
2. **REGRESSION-2026-11-08** at the next planning on or after 2026-11-08.
3. PERF-11c-iii-d (VideoDock) and -e (Lane) wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, or for RETRO 384 as the deadline (L46).
4. Then:
   - PERF-11b and PERF-12…15;
   - SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM;
   - STEM-LANES;
   - SYS-1…3;
   - STORE-2b…5;
   - REVIEW-RECOMMENDATIONS;
   - T12-ADVANCED;
   - the phase-2 entries, under the skip rule.

## 7. Root notes
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING is still unanswered.** This is its sixth echo: SIG-R378-LEAF-ACTIONS-CONVENTION from gate 378. The request is in `b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`. With c2b, all the small leaves are done, and d/e (VideoDock, Lane) wait for the answer.

## 8. Claims (L29 + L56)
Run `bash b-round-378/claims-379.sh` from the loop root.
- HEAD output: `b-round-378/claims-379-output.txt`.
- Sketch output: `b-round-378/claims-379-sketch-output.txt`.
- Their diff: `b-round-378/claims-379-allowed-delta.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 378 published `3ae2885`; store HEAD |
| K2 | status line count |
| K3 | MarkerRow: `useArrangement()` calls, forwardRef, memo, actions hook, `handleRef`, in-view markers derivation |
| K4 | StudioWorkspace: old or new mount, markers prop, hook call, handle calls |
| K5 | the 11 provider `useCallback` lines |
| K6 | 0 transition APIs (MarkerRow, Workspace, Context) |
| K7 | SWEEP of the name in `app/**/__tests__`, `perf/**`, `e2e/**`; `counts.get` lines; files outside `covering-379.txt` |
| K8 | `arrangementMarkers` body; the two non-subscribing hooks |
| K9 | protected sha |
| K10 | frozen sha (r379) |
| K11 | sketch files sha |
| K12 | render-budget expect/it counts, RB-LEAF6 |
| K13 | patch sha = dispatched = reviewed |
| K14 | B's sketch runs (full suite, tsc, Biome) |
| K15 | mutants on the sketch, with red rows and lines |
| K16 | perf sketch vs HEAD |
| K17 | leaf probe sketch vs HEAD |
| K18 | marker recipe sketch = HEAD |
| K19 | doc 245 |
| K20 | regression date, lessons lines, archive |
| K21 | render-budget describe line and file times (gate 378, sketch) |
| K22 | every cited artifact exists |
| K23 | L50 grep hit count |
