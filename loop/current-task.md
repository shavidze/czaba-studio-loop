# Round 378: PERF-11c-iii-c2a. The loop brace stops rendering on unrelated workspace commits

**Planned by:** B, at the round 377 → 378 planning, 2026-11-07 (`b-round-377.md`).

**Decisions** (`backlog.json` v342 → v343, `decisions_log_b`):
- **D-29z1254:** round 377 accepted. C PASS with `browserVerified` true and 0 bugs; gate 377 published `79ed8a9`. PERF-11c-iii-c1 is done and A-R376-REVIEW-M1 is closed.
- **D-29z1255:** gate 377 review: Lows and architecture signals only (see `b-round-377.md`).
- **D-29z1256:**
  - REGRESSION is not due yet: 2026-11-05 → 2026-11-07 is 2 days, and the rule needs 3.
  - PERF-11c-iii-c2 is split, with its scope unchanged. **c2a (LoopBrace) is this round.** c2b (MarkerRow) comes after REGRESSION.
- **D-29z1257:** the order after this round (§6).

**What this round does:** `ArrangementLoopBrace` becomes the same leaf pattern as Master, Library and Transport (pattern A):
- a memoised view (`ArrangementLoopBraceView = memo(ArrangementLoopBraceViewInner)`) that receives `loop` plus the four layout props;
- an actions hook, `useArrangementLoopBraceActions(workspace)`: a `useMemo` over five stable provider callbacks;
- a thin wrapper, `ArrangementLoopBrace`, that keeps its old signature for `index.ts` and the standalone tests;
- `StudioWorkspace` renders the view.

Result: a lane mute, a Master mute, an Undo of those and a library preview no longer render the brace. A zoom, a project-end change and any real loop change still do. The user sees, hears and focuses nothing different.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28 and 58. C also reads 22, 37, 38, 48, 56, 57, 59 and 60.
- `b-round-377/sketch-review.md`.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance refactor with no visible change (the 2026-10-27 rule). **Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `79ed8a9` (gate 377 published). The store tree is clean: 0 status lines [K1, K2].
- At HEAD, `ArrangementLoopBrace` calls `useArrangement()` once and reads `arrangement.loop` [K3]. `StudioWorkspace` mounts the wrapper directly [K4].
- **Premise, measured in the browser at HEAD** (`c-round-377/leaf-A.json`, re-measured in `b-round-377/probe/leaf-head-378.json`, both viewports): the brace renders on every `StudioWorkspace` commit. Values per step: add 3, zoom 1, lane mute 1, Ctrl+Z 1, Undo/Redo button 1, preview start 1, preview stop 2 [K17].
- The five provider callbacks are `useCallback`s at ArrangementContext l.1901, 1954, 2074, 2089 and 2106. Their dependencies end at `[]` callbacks or `useState` stores (`sketch-review.md` §1) [K5].
- Transition APIs on the path: 0 [K6]. This is the round-377 K5 tripwire, now extended to the brace.
- Protected files pass [K9]. Frozen manifest: `b-round-377/r378-frozen-sha256.txt` (every tracked file except the 3 granted ones, 1,265 entries) [K10].
- REGRESSION: `regression-last.json` is 2026-11-05 [K20]. It is due at the first planning on or after 2026-11-08.

## 1. Behaviour that must not change
- **Brace drawing:** `aria-label`, `title`, `data-loop-enabled`, `style.left`, `style.width`, the text `Loop` / `Loop off`, and the `arrangement-loop-times` readout. This covers creation (range + Ctrl+L), a mid-drag preview, release, Ctrl+Z, ArrowRight, Shift+ArrowRight and Ctrl+L off. The recipe is `b-round-377/probe/loop-recipe-378.mjs`, and HEAD equals the sketch at both viewports [K18].
- **Gestures:** pointer capture, the 3 px threshold, snap/Alt, the marker snap targets, the `claimPointerGesture` abort, the uncaptured-pointer watch, and the unmount release. Keyboard steps keep `keyRepeat`.
- **The standalone wrapper:** `ArrangementLoopBrace` keeps its props and still works on its own. `gesture-reentry`, `gesture-guard` and `ArrangementContext.test.ts` mount it. `index.ts` keeps exporting it [K23].
- **Every other leaf's render counts** in the leaf probe equal HEAD. Only `ArrangementLoopBrace` and `ArrangementLoopBraceViewInner` differ [K17].

## 2. What A changes (grants: `b-round-377/grants-378.txt`, exactly 4 files)
1. **Apply the sketch.**
   - Check `sha256sum ../tmp/studio-real-loop/b-round-377/sketch.patch.txt` against `b-round-377/sketch-dispatched.sha256` (`28d86d7b…`) [K13].
   - From `store/`, run `patch -p1 < ../tmp/studio-real-loop/b-round-377/sketch.patch.txt`.
   - `sha256sum -c ../tmp/studio-real-loop/b-round-377/sketch-files-sha256.txt` must give 3/3 OK [K11].
   - The patch touches `app/components/arrangement/ArrangementLoopBrace.tsx`, `app/components/arrangement/StudioWorkspace.tsx` (import, hook call, mount) and `app/lib/arrangement/__tests__/render-budget.test.tsx` (row RB-LEAF5) [K11].
   - Make no other edit to these three files. Any edit beyond the patch is a STOP (L11).
2. **Doc 244** (`docs/implementation/2026/quarter-IV/244-perf-loop-brace-leaf.md`, new; number 244 is free [K19]):
   - l.4 is, byte for byte, `**სტატუსი:** Completed (C round 378 PASS)` (L28) [K19].
   - Include the TEMPLATE headings in order (L26).
   - Record:
     - the premise numbers;
     - the pattern-A shape;
     - RB-LEAF5 and the three mutants, with the red rows taken from `b-round-377/mutants/sketch-run/*.full.log`;
     - the perf result: 0 count-row differences, because the harness scenarios do not include mute or undo, so the gain shows only in jsdom and the leaf probe;
     - the reviewer's three Lows and their rulings.
   - Loop paths keep their full `tmp/studio-real-loop/…` form, labelled as outside the repository.
   - Cite only rows that exist.

## 3. A: checks (speed rules)
- `npm run typecheck`, `npm run lint`, and `npx biome check` on the three files.
- `npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/gesture-reentry.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx`: all pass. render-budget has 19 tests [K12].
- Report any test above 50 % of its declared timeout. Read the `describe`/`it` options first: render-budget's describe at l.316 has per-row options [K21].
- `code-reviewer` is required (3+ files changed). Its findings go into `a-round-378.md`.
  - A Medium or above is a STOP (L11). A does not fix it.
  - An Architecture note goes to B as a signal.
- Write `a-round-378.md` as you go.

## 4. C: what to verify
C writes `c-round-378.md` and `c-round-378.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified`, `mutantsRecorded`;
- `mutantRedOnSketch` = `b-round-377/mutants/sketch-run/`;
- `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`;
- `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-378.json c-round-378/l57-check.txt` must exit 0.

Working rules:
- Write `c-round-378/progress.json` after every row (L59).
- Copies and destructive commands stay under `c-round-378/` (L60).
- Run perf and the mutants alone (L38).
- Warm up the browser before timed probes (L38).

**Browser rows:** run them at 1440×900 and 1280×720, after `Demo collection ready` (L48). Compare against a HEAD copy (`79ed8a9`) on another port with its own Vite `cacheDir`.
- **PASS means A's value equals HEAD's** for the same step at both viewports, unless the row says otherwise.
- Every browser row runs fresh in round 378. B's probe JSONs are reference values only.
- A cold-start timeout is environment-invalid (L38) and uses a replacement attempt.
- A ring check, if any, uses the keyboard path. The ring shows on `:focus-visible` only (INFO-C377-FIT-RING-WORDING).
- Range drags start on the lane background (INFO-C377-RANGE-DRAG-ON-BODY).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all`. From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-377/r378-frozen-sha256.txt` and the protected check `b-round-318/protected-sha256.txt` | 4 lines (3 M + doc 244); both rc 0 |
| **CLAIMS** | From the loop root: `bash b-round-377/claims-378.sh`. Compare with `b-round-377/claims-378-output.txt` (HEAD) and `claims-378-sketch-output.txt` (sketch) | K3, K4, K8, K11 and K12 equal the sketch output. K2 reads 4 (compare K2 on `store/` only). K19 shows the l.4 string above and ≥ 1 RB-LEAF5 mention. Every other line equals the HEAD output. No `MISSING` |
| **SKETCH-EQUAL** | `sha256sum -c ../tmp/studio-real-loop/b-round-377/sketch-files-sha256.txt` from `store/` | 3/3 OK |
| **ASSERT-COUNT** | `expect(` and `^\s*it\(` on render-budget.test.tsx | 197/19 (`b-round-377/expect-counts-378.txt`). A lower count is a Medium bug |
| **UNIT** | The 140 files of `b-round-377/covering-378.txt` (the K7 sweep finds 18 loop files, all inside it). Then render-budget and gesture-reentry with `--sequence.shuffle --sequence.seed=42` | All pass. Record the test counts (record — not run on sketch as a 140-file set; B ran the full suite on the sketch: 252 files / 3,724 tests [K14]). Report every test above 50 % of its declared timeout |
| **MUTANTS-TREE** | On a `cp -a` copy of A's tree under `c-round-378/`, alone: `TREE=<copy> OUT=<abs>/c-round-378/mutants bash b-round-377/mutants/run-mutants-378.sh` | MU-LB-NO-MEMO, MU-LB-ACTIONS-FRESH and MU-LB-SITE-REVERT are each red on RB-LEAF5 and on no other RB-LEAF row (as in `b-round-377/mutants/sketch-run/`) [K15]. The script prints `restored` |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on A's tree, alone (it builds) | Every assert passes. Every count row (`components`, `commits`, `renders`, `restarts`) equals `c-round-377/perf-interact.log` (HEAD 79ed8a9). The sketch matched with 0 count differences (`b-round-377/perf-sketch-vs-head.txt`) [K16]. A value off by one is compared with `b-round-377/perf-sketch.log` before it is called a FAIL |
| **LEAF-PROBE (browser, dev)** | `node b-round-377/probe/leaf-probe-378.mjs <A base> c-round-378/leaf-A.json` and the same on the HEAD copy | A equals `b-round-377/probe/leaf-sketch-378.json` at both viewports. The `ArrangementLoopBrace` wrapper is 0 on every step. `ArrangementLoopBraceViewInner` is 0 on lane-mute, Ctrl+Z and library preview start/stop. Every other leaf equals HEAD's run in this round |
| **LOOP-BROWSER (browser)** | `node b-round-377/probe/loop-recipe-378.mjs <base> <out>` on A's tree and the HEAD copy | Every field of every step equals HEAD at both viewports: brace label, title, enabled, left, width, text and focus, plus the loop-times readout (created, muted, mute undone, mid-drag, dragged, drag undone, ArrowRight, Shift+ArrowRight, Ctrl+L off) |
| **G378-AUTH (browser)** | Fresh anonymous context, both viewports, warmed up | `/studio-lab` shows the workspace with `auth_user` null. `/studio/middle-east` shows "Sign in required" with no workspace and 0 `audio[src]`. `/api/studio-token` with no token returns 401 and no token in the body. The fake bearer's 500 goes under `blocked` (backend unavailable) |
| **STUDIO-SMOKE-378 (browser)** | Add `Bass` with Enter. Play shows a position ≥ 00:01.000 after 1.5 s (L48 lead). Drag the clip by its name bar to the lane below, then Ctrl+Z. Click Master Mute, then Ctrl+Z. Library preview Play and Stop | Equal to HEAD |
| **DOCS** | Doc 244 | l.4 byte for byte; TEMPLATE headings in order; every row id, mutant id and file it names exists (L26); `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits [K19] |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. List them under `"gate"` and `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if LEAF-PROBE, LOOP-BROWSER, G378-AUTH and STUDIO-SMOKE-378 all ran at both viewports in this round. If the budget runs out, it is false and B plans the remainder (V2 rule).
- If a row cannot finish before the job limit, mark it not run with the real stop signal (L59), never PASS.

## 5. Neighbour risk
- **A stale brace while dragging.** If anything ever mutated `arrangement.loop` in place, the memo would hide the change. The reviewer grep found no such write. The mid-drag step of LOOP-BROWSER, `grid-snap-loop-drop` SL10 and `marker-time-snap-ui` cover the drag and the arrow keys [K23].
- **Stale snap closures.** `snapSeconds`, `gridSeconds` and `pxPerSecond` stay props, so any change re-renders the brace and rebinds its handlers, exactly as at HEAD.
- **Name-keyed counts.** Only the gesture-reentry describe title names `ArrangementLoopBrace` at HEAD [K8]. No perf row counts it.

## 6. Order after this round (D-29z1257)
1. After C PASS, round 378 goes to the gate: 3 code/test files and doc 244.
2. **REGRESSION** at the first planning on or after 2026-11-08.
3. PERF-11c-iii-c2b (MarkerRow: forwardRef, imperative handle, editor focus; L47/L50 rows).
4. PERF-11c-iii-d (VideoDock) and -e (Lane) wait for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING or RETRO 384.
5. Then:
   - PERF-11b and PERF-12…15;
   - SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM;
   - STEM-LANES;
   - SYS-1…3;
   - STORE-2b…5;
   - REVIEW-RECOMMENDATIONS;
   - T12-ADVANCED;
   - the phase-2 entries, under the skip rule.

## 7. Root notes
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING** is still open. This is its fifth echo: SIG-R377-RENDER-COUNT-CONSTANTS from gate 377. The request is in `b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`. It blocks neither c2a nor c2b. d and e wait for it.

## 8. Claims (L29 + L56)
Run `bash b-round-377/claims-378.sh` from the loop root.
- HEAD output: `b-round-377/claims-378-output.txt`.
- Sketch output: `b-round-377/claims-378-sketch-output.txt`.
- Their diff: `b-round-377/claims-378-allowed-delta.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 377 published `79ed8a9`; store HEAD |
| K2 | status line count |
| K3 | LoopBrace: `useArrangement()` calls, `arrangement.loop` reads, memo, actions hook |
| K4 | StudioWorkspace: wrapper or view mount, `loop={arrangement.loop}`, hook call |
| K5 | the five provider `useCallback` lines |
| K6 | 0 transition APIs (Transport, Workspace, Context, LoopBrace) |
| K7 | SWEEP of loop tokens over `app/**/__tests__`, `perf/**`, `e2e/**`, all inside `covering-378.txt` |
| K8 | name-keyed `ArrangementLoopBrace` hits |
| K9 | protected sha |
| K10 | frozen sha (r378) |
| K11 | sketch files sha |
| K12 | render-budget expect/it counts, RB-LEAF5 |
| K13 | patch sha = dispatched = reviewed |
| K14 | B's sketch runs (full suite, tsc, Biome) |
| K15 | mutants on the sketch |
| K16 | perf sketch vs HEAD |
| K17 | leaf probe sketch vs HEAD |
| K18 | loop recipe sketch = HEAD |
| K19 | doc 244 |
| K20 | regression date, lessons lines, archive |
| K21 | render-budget describe line and gate-377 file time |
| K22 | every cited artifact exists |
| K23 | wrapper consumers (index export, test mounts), SL10, marker-time-snap brace testid |
