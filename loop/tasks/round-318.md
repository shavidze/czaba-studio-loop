# Round 318: PERF-8a. The time selection (`range`) moves out of the ArrangementContext value into a per-provider zustand store; range drag ≤ 15 components per move

**Planned by:** B, at the round 317 → 318 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v277 → `decisions_log_b`):
- **D-29z859: round 317 ruled.** C PASS: 13/13 rows, 0 findings, `browserVerified` and `realVerified` true (`c-round-317.json`). Gate 317 `published` `a5a9c97` on both remotes [K1]. **PERF-7 is done.** C-R316-01 is closed by C round 317's BYTE-IDENTITY, FONT-BYTES and FONT-PIXEL rows.
- **D-29z860: round 318 = PERF-8a.** PERF-8 is split into two stages:
  - **8a (this round):** `range` only. It is the measured scenario.
  - **8b (later):** `selectedClipIds` into a selection store. Its row measures components in the pointerdown/select commit.
  - Clip click (102 components) and play/pause stay with PERF-10 (`scope_addition_d29z215`).
  - PERF-DRAG-PREVIEW stays a separate task. It changes `history.present`, not a transient overlay (tech-lead).
- **D-29z861: dependency.** B filed `root-deps-request.json` = `{"add": ["zustand"], "remove": []}`. `zustand` 5.0.16 is on root's allowlist (`cloud/deps-allowlist.json`, seen by B). Per L35, this task grants `THIRD_PARTY_NOTICES.md`, which A regenerates.
- **D-29z862: bookkeeping.**
  - REGRESSION is not due: `regression-last.json` is 2026-11-02, so the next falls on or after 2026-11-05 [K9].
  - RETRO is at round 320.
  - `lessons.md` is unchanged.

**Read first:** `lessons.md`. These apply directly:
- L11: STOP;
- L23: B's inventory (grep only; see §0.3);
- L29: claims;
- L34: the doc section of a changed budget;
- L35: notices;
- L37: commit counts are wallclock;
- L38: perf runs alone;
- L49: `setRange`'s side effects;
- L52: mutants that can fail;
- L56: artifacts;
- L57: C's fields.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]` (§9).

## Baseline
- **HEAD `a5a9c97`** with a clean tree [K2]. Root's job step then adds `zustand@5.0.16` as a `chore(deps): …` commit.
- **Baseline rule (oss-adoption.md):** a root `chore(deps)` commit directly on `a5a9c97` that changes only `package.json` and `package-lock.json` counts as the baseline. A and C do not stop on it.
- **Precondition, STOP if missing:** at A's start, `package.json` has `"zustand": "5.0.16"` and the lock has `node_modules/zustand` [K3 is 0/0 now; expected 1/1]. If either is missing, A writes the STOP (§6) and changes nothing. oss-adoption mandates zustand for PERF-8; **a hand-rolled store is not an allowed fallback**.
- **Protected files:** `b-round-312/protected-sha256.txt`, 11/11 OK [K8].

## 0. Why this round

### 0.1 The measurement (L37: premise re-measured)
Source: C's production-build interactions run on 2026-11-03, `c-round-306/perf/perf-1b-i-2026-11-03T01-00-39-178Z.json` (HEAD `ecb832a`). Rounds 307–317 did not touch the range path; C's baseline control in PERF-RANGE (§3.2) re-measures it on the real baseline.

**Range body drag** (time selection on a clip body, 60 moves, stopped and playing alike):

| Metric | Value |
|---|---|
| components per move | **108.167** (`componentsSum` 6,490) |
| commits per move | 1.983 (119 commits / 60 moves; wallclock, D-29z259) |
| largest commit | **105** components |
| playing restarts | 0 |

So each move makes one large commit (~105 components) and one small one (6,490 − 60×105 = 190, about 3 per move).

### 0.2 Mechanism (consults, FACT unless marked)
**Per move:**
- `ArrangementClip` `handlePointerMove` calls `setTimeRange({...})`. This goes through `setTimeRange` → `setRange` → `setRangeState`.
- `range` is a field of the one context value `useMemo` and of its dependency array [K4 = 2 lines].
- So each move rebuilds the value and every `useArrangement()` consumer re-renders.

**During the drag:**
- `setRange` skips its `setStatus(rewriteStoppedTruth)` branch, because `gestureCountRef > 0`: `claimPointerGesture` → `beginPointerGesture`.

**The small second commit:**
- It is `ArrangementDetailContentInner`'s layout effect, which calls `setStartText`/`setEndText` [K15].
- It stays: this round does not touch it, and commits per move is a wallclock row.

**Readers of `range`:**
- From the context: `StudioWorkspace`, `ArrangementTransport`, `ArrangementLane`, `ArrangementMarkerRow` (inside callbacks only) and `ArrangementExportDialog`.
- Through props: `ArrangementClip`/`ArrangementClipView`, which renders the per-clip range label the harness reads, and `ArrangementDetailPanel`.

**Imperative reads:**
- `latestRef.current.range` [K5 = 7];
- `StudioWorkspace` `.range` [K6 = 6].

**The lane passes a new object to every overlapping clip on every move** [K11]: `const clipRange = isRangeInClip(clip) ? range : null;`.

### 0.3 B's pre-check (L23): an inventory, not a scratch build
zustand is not installed yet [K3], so B could not build a scratch sketch. B ran this inventory instead:
- **22 test files** read `.range` off the context value [K10]. The list is `b-round-317/range-test-files.txt`. Together they hold 3,139 `expect(` calls (`b-round-317/expect-count-head.txt`).
- **Destructured `range`** in app code: `ArrangementClip`, `ArrangementDetailPanel`, `ArrangementExportDialog`, `ArrangementLane`, `ArrangementMarkerRow`, `ArrangementTransport`, `StudioWorkspace` and `ArrangementContext`.
- **Imperative reads:** 7 + 6 [K5, K6].

Removing `range` from the `ArrangementContextValue` type makes TypeScript flag every remaining context reader. That is A's completeness check.

### 0.4 What changes for the user
**Nothing visible.** The time selection looks, snaps, labels, plays, splits, deletes, exports and announces exactly as at the baseline. Only the render work per drag move drops.

### 0.5 Consults / reference / screen budget
- **Consults (D-29z860):**
  - `performance-optimizer` and `tech-lead` (summaries in `b-round-317.md` §3).
  - They agree on the split, the per-provider store, `getState()` for event-time reads, and selectors that return either the stored reference or primitives.
  - tech-lead's top risk: a missed imperative read compiles but acts on a stale range. It is covered by RS7 and C's R-rows.
- **Not applicable:** reference-first, `product-designer`, the screen budget and the journey row. This is a pure performance round: no visible change and no new persistent element.

## 1. Rulings
| Id | Ruling |
|---|---|
| Store location | New module `app/lib/arrangement/range-store.ts`, built on `createStore` from `zustand/vanilla` |
| Store lifetime | One store per `ArrangementProvider`, created with `useState(() => …)` like `mixDraftStore`. **Never a module singleton** (SSR, two providers in tests) |
| Exposure | A new `ArrangementRangeContext` carries the store instance. New hooks (names A may refine; names follow `AGENT_DISCOVERABLE_CODE.md`): `useArrangementRangeStore()` returns the store; `useArrangementRange(selector)` uses `useStore(store, selector)`. Both throw outside the provider, like the existing store hooks |
| `range` in the context | Removed from `ArrangementContextValue`, from the value `useMemo` and from its dependency array (K4 → 0). Removed from the `latestRef` shape (K5 → 0). The provider's `useState<TimeRange \| null>` goes (K7 → 0) |
| Writers | `setTimeRange` and `setRange` stay as stable callbacks with the same signatures. `setRange` writes the store, and **keeps its `rewriteStoppedTruth` branch exactly** (when `gestureCountRef.current === 0`) (L49) |
| Event-time reads | Every imperative read (the 7 `latestRef` reads, the 6 `StudioWorkspace` reads and any other event handler) reads `store.getState().range` at event time |
| Selectors | Each selector returns either the stored reference, `null` or primitives. **None returns a freshly built object.** Per clip, the selector returns the store's range when it overlaps that clip, else `null`, so a clip outside the range does not re-render. `useShallow` is allowed for tuples. Transport selects only what it renders (e.g. whether a range exists, `allTracks`, start/end) |
| Where subscriptions sit | `ArrangementLane` subscribes only to what it draws itself (the all-lanes/background overlay; `null` during a clip-body drag). It no longer passes a per-move `clipRange` object down [K11 → 0]. Each clip reads its own range at clip level. `StudioWorkspace` does not subscribe to the range object at its top level. Each of its render-time range uses (the `arrangement-range` readout, the `hidden` flag, the detail-panel prop) becomes a small subscriber component or selector, so a move does not re-render the workspace subtree |
| Ordering with selection | When one handler clears both range and selection, write the range store first, then call `setSelection` (tech-lead risk 1) |
| Detail panel | `ArrangementDetailPanel` keeps receiving `range` as a prop, from a subscriber. Its start/end layout effect is unchanged (K15 stays 1) |
| PERF-DRAG-PREVIEW / 8b | Not in this round |

## 2. Contract

### 2.1 Files (grants, §4)
**New:**
- `app/lib/arrangement/range-store.ts`
- `app/lib/arrangement/__tests__/range-store.test.tsx` (it may be split into a `.ts` and a `.tsx` file)
- `docs/implementation/2026/quarter-IV/230-perf-range-store.md`

**Edited:**
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/`:
  - `StudioWorkspace.tsx`
  - `ArrangementLane.tsx`
  - `ArrangementClip.tsx`
  - `ArrangementTransport.tsx`
  - `ArrangementExportDialog.tsx`
  - `ArrangementMarkerRow.tsx`
  - `ArrangementDetailPanel.tsx` (prop type only, if needed)
- The 22 test files in `b-round-317/range-test-files.txt` [K10]. **Only how they read `range` changes**; every assertion stays (§2.4).
- `perf/budgets.interactions.json`: the 5 rows of §2.5.
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: the whole `## მეტრიკები` section (L34). One paragraph names the rows that are now asserted, with owner PERF-8a.
- `THIRD_PARTY_NOTICES.md`: regenerated (§2.6).

### 2.2 Range store behaviour (unit rows, new test file)
| Row | Asserts |
|---|---|
| RS1 | `createArrangementRangeStore()` starts with `range: null`. `setRange(r)` stores exactly `r` by reference, and `getState().range === r` |
| RS2 | Subscribers are notified once per `setRange` call with a new value; setting the same reference again does not notify |
| RS3 | Two stores are independent. Two providers in one render tree hold different ranges |
| RS4 (provider re-render guard) | Inside `ArrangementProvider`, **with a pointer gesture active** (begun through the context's pointer-gesture API or a driven pointerdown, as in the harness drag), a probe that calls only `useArrangement()` and counts renders (React `Profiler` or a render counter) **does not re-render** on `setTimeRange({...})`. The precondition exists because outside a gesture `setRange` may legitimately change `status` (RS6). A states which way the gesture is begun. A probe on `useArrangementRange(s => s.range)` re-renders exactly once per call. Mutant MU-RANGE-IN-VALUE (put `range` back into the value and its deps) turns RS4 red |
| RS5 (per-clip selector) | A clip-level subscriber whose clip does not overlap the new range does not re-render when the range moves elsewhere. The overlapping one does. Mutant MU-LANE-NEW-OBJECT (the selector returns `{ ...range }`) turns RS5 red or makes it loop; A records which |
| RS6 (status branch, L49) | `setTimeRange` outside a gesture still rewrites a stopped Insert-Marker status, with the same text as the baseline. Inside a pointer gesture it does not. Mutant MU-NO-STATUS-REWRITE (drop the branch) turns RS6 red |
| RS7 (stale read) | After `setTimeRange(r)` and with no re-render in between, an event-time action that reads the range (the context's split-at-range path or Space-from-range-start, whichever A can drive in jsdom) uses `r`. Mutant MU-STALE-LATESTREF (one event-time read takes a render-time snapshot) turns RS7 red |

### 2.3 Completeness (claims after A)
K4 = 0, K5 = 0, K7 = 0, K11 = 0, K12 ≥ 1, K13 = 1. K6 becomes the count of `.range` reads A left in `StudioWorkspace`. Each one must read `getState()` or a selector value, and A lists them in the report. `npm run typecheck` rc 0 proves no context reader is left.

### 2.4 Test files (the 10a rule)
- In each of the 22 files, only the way the test reaches `range` changes: a probe that also calls the new hook, or `getState()` on the store. The `expect(` count per file stays the same or grows.
- **A test whose only change is a removed assertion is a Medium.**
- A runs `python3 -I b-round-317/expect-count.py <store>` before and after. The head output is `b-round-317/expect-count-head.txt`: 22 files, TOTAL 3,139.

### 2.5 Budgets (`perf/budgets.interactions.json`)
| Row | Change |
|---|---|
| `interact.drag.range.stopped.move-components-per-move` | `mode: "assert"`, `budget: {"op": "<=", "value": 15}`, `owner: "PERF-8a"` |
| `interact.drag.range.playing.move-components-per-move` | same |
| `interact.drag.range.stopped.move-components-max` | `mode: "assert"`, `budget: {"op": "<=", "value": 15}`, `owner: "PERF-8a"` |
| `interact.drag.range.playing.move-components-max` | same |
| `interact.drag.range.playing.move-restarts` | `mode: "assert"`, `budget: {"op": "==", "value": 0}`, `owner: "PERF-8a"` |

- The `commits-per-move` rows stay `record` (wallclock, D-29z259, L37).
- The `.6x` rows stay `record`.
- `interact.harness.drag-range-live` stays an assert `== 1`.
- If the harness validates the `budget.op` vocabulary, A uses the existing spelling (grep `"op"` in the budgets files). The meaning stays as above.

### 2.6 Notices (L35)
After root's deps commit, run `npx vitest run app/lib/__tests__/third-party-licenses.test.ts -u`, which is `THIRD_PARTY_NOTICES_REGENERATE_COMMAND`.

**Expected:**
- `THIRD_PARTY_NOTICES.md` gains exactly one table row, `zustand | 5.0.16 | MIT | …`, and the runtime package count in the heading grows by 1. Today it is 560. A records the exact count; a transitive addition is reported, not hidden.
- No other line changes.
- The licence test file does not change.

### 2.7 Doc 230 (Georgian, technical terms in English; TEMPLATE's 7 headings)
- **l.4:** `**სტატუსი:** In Progress (stage 1 of 2; C round 318 PASS)` (L28).
- **Contents:** the mechanism (§0.2), the store, the selector rule and the measured before/after numbers.
- **Testing:** it names RS1–RS7, the mutants and C's rows.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-317/claims-318.sh`. Its output equals `claims-318-head-output.txt`, except K2 (the deps commit) and K3, which must be 1/1. Any other difference is a STOP |
| A-IMPL | §1, §2.2–§2.7 |
| A-CLAIMS-AFTER | K4 0, K5 0, K7 0, K11 0, K12 ≥ 1, K13 1, K14 3 (it counts 3 of the 5 rows; all 5 must change), K15 1, K8 11 |
| A-TYPE / A-LINT | `npm run typecheck` rc 0; `npm run lint` rc 0 |
| A-UNIT | `npx vitest run` on: the new range-store test file(s), the 22 files of `range-test-files.txt`, `gesture-reentry`, `status-lifetime`, `meta-shortcuts-ui`, `shortcuts.test.ts`, `export-range-ui`, `insert-marker-ui`, and `app/lib/__tests__/third-party-licenses.test.ts`. All pass. Also `perf/lib/report.test.ts`: it reads `budgets.interactions.json` (e.g. DC-KINDS), so A runs it through a scratch vitest config that includes `perf/**`, as in rounds 312–313. A reports the counts |
| A-EXPECT | `expect-count.py` after ≥ head for every file |
| A-MUTANTS | On a scratch copy, never in `store/`: MU-RANGE-IN-VALUE, MU-LANE-NEW-OBJECT, MU-NO-STATUS-REWRITE and MU-STALE-LATESTREF each turn their row red. Restored, they are green |
| A-PERF (alone, L38) | Production build on a scratch copy, then `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` once. Report the §2.5 rows plus `drag-range-live`, and `failures` |
| A-REVIEW | `code-reviewer` (3+ files). It checks: no selector builds a new object; no event-time read uses a render snapshot; the provider never holds `range` state; the store is per provider; the test diffs only change the read path. A Medium+ inside the grants is fixed and re-reviewed (L11). Architecture notes are passed to B |

### 3.2 C's rows
C writes `c-round-318.md` and `c-round-318.json` as it goes, with the L57 fields:
- `assertsSpecified` = 7: RS1–RS7.
- `mutantsRecorded` = 4.
- `mutantRedOnSketch`: on A's tree.

Each finding carries an `origin`.

**Builds.** Production builds of the baseline (`git archive` of the deps commit, or `a5a9c97` + root's two package files) and of A's tree, each in its own scratch. Never build inside `store/`.

**Browser rows run at 1440×900 and 1280×720 on `/studio-lab` (dev server `:5173` or A's production build).** Each behaviour row compares A's build with the baseline: same visible result and the same status text.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status`, protected sha, the deps commit diff | Only the §2.1 paths changed beyond the deps commit, which touches only `package.json` and the lock. Protected 11/11 OK |
| CLAIMS | `claims-318.sh` | As A-CLAIMS-AFTER |
| UNIT | A-UNIT's files on C's scratch; the 4 mutants; at least one mutant of C's own | All pass; each mutant red; restored green |
| EXPECT | `expect-count.py` HEAD vs A | No file loses an `expect(` |
| PERF-RANGE (alone, L38) | Interactions spec on both builds | **Baseline control:** range move-components-per-move ≈ 108 (it must be > 15, or the row is vacuous). **A:** stopped and playing move-components-per-move ≤ 15; move-components-max ≤ 15; `drag-range-live` = 1; playing move-restarts 0; `failures` []. Other deterministic rows: **any rise in a drag, click, zoom or play/pause row is a finding**. A *load-time* row may rise by at most the number of new always-mounted components (the range Provider and subscriber components), which A names and counts in its report and C checks. Lower rows are listed |
| PERF-LOAD (alone) | `studio-lab.perf.spec.ts` on A's build, then `rowcmp.py` against the baseline run | `failures` []; the same tolerance as PERF-RANGE: no rise in a fader or interaction row; a load-time row rises by at most A's named new always-mounted component count |
| R-DRAG | Body-drag a time selection across a clip | The label (`mm:ss.mmm – mm:ss.mmm · n s`) updates during the drag, snaps as at the baseline (Snap on and off, Alt), and stays after release |
| R-ALLTRACKS | Ctrl+Shift+L on a selection | The all-lanes overlay appears (`data-range-start`/`data-range-end`); then Ctrl+Shift+L or Esc behaves as at the baseline |
| R-CLEAR | Click with no move on a clip body; Esc; click an empty lane | The range clears and the playhead or insert marker lands as at the baseline |
| R-SPACE | Space with a selection; Space again | Playback starts at the selection start, as in SABA-B-10a |
| R-SPLIT / R-DELETE / R-CUT-TIME | Ctrl+E, Delete, Ctrl+Shift+X on a selection, then Undo/Redo | The same clips and status as at the baseline; undo restores |
| R-LOOP / R-ZOOM | The loop-to-selection action and Z (zoom to the time selection) | The same loop brace and zoom as at the baseline |
| R-EXPORT | Export dialog with and without a selection | The range option's enabled state and the exported length match the baseline (WAV duration ±1 sample) |
| R-DETAIL | Select a clip with a selection; type From/To in the detail panel | The fields follow the drag; typing moves the range; the status text equals the baseline (RS6 in the browser) |
| R-BG / R-MARQUEE | Background time selection on an empty lane (11c); Ctrl+drag marquee | As at the baseline |
| R-TRANSPORT | Transport controls that depend on a selection (titles, enabled state) with and without a range | As at the baseline |
| G318-AUTH | As G317-AUTH, both viewports | `/studio-lab` anonymous workspace + demo badge, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; `/api/studio-token` with no header → 401 |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, the build in `store/`, Biome, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if every row from PERF-RANGE through G318-AUTH ran.

**Ableton conformance:** not applicable. The behaviour is unchanged, and there is no new reference.

## 4. Grants (D-29z860)
A edits only the §2.1 paths.
- **Nothing else:**
  - not `package.json` or the lock;
  - no other `app/**` file;
  - no other `perf/**` file;
  - no config;
  - no protected file.
- **If another file seems to need changing** (a reader outside the list, or a test outside the 22), A STOPs and names it. Exception: when typecheck flags a test for `range` on `ArrangementContextValue` (a read, or a constructed value literal such as in `detail-panel-reason`, `grid-snap-keys` or `library-focus-handoff`) and the test is missing from `range-test-files.txt`, A may change only that `range` read or literal field, and must list the file. The §2.4 `expect(` rule applies to it too.

## 5. Neighbouring behaviour at risk (C probes)
- **A stale `range` in event handlers:** Space, Ctrl+E, Delete, Ctrl+Shift+X, export, Z, loop.
- **One frame of range vs selection mismatch:** a handler that clears both.
- **Status text:** RS6 and R-DETAIL.
- **The all-lanes overlay in `ArrangementLane`.**
- **Undo clearing a range:** the existing undo path clears it; it must clear the store.
- **The fader stores (`mixDraftStore`) and `positionStore`:** they must not change. PERF-LOAD's fader rows show this.

## 6. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-318.md` and changes nothing else when:
- zustand is missing (Baseline);
- A-CLAIMS differs beyond K2/K3;
- the ≤ 15 target cannot be met without touching a file outside §4 (A reports the per-component breakdown from the profiler);
- a test assertion would have to be removed;
- the notices regeneration changes more than the zustand row and the count.

## 7. Next
- **After C PASS and gate 318:** PERF-8a is done.
- **Round 319:** REGRESSION if its planning falls on or after 2026-11-05; otherwise PERF-8b (selection store).
- **RETRO:** round 320.
- **Signals carried:**
  - C-R317 observation: `/studio-lab` FCP − DCL → PERF-11.
  - The perf warm-up "collection ready" timeout → `INFO-C317-WARMUP-TIMEOUT` (fix home: the next harness touch).
  - The source of the noto-sans-georgian-latin glyph remains undetermined.

## 8. Commit readiness
After C PASS and the gate, root publishes the §2.1 paths on top of the deps commit.

## 9. Claims (L29 + L56)
Run `bash b-round-317/claims-318.sh` (`CLAIMS_STORE` may override the path). The head output is `b-round-317/claims-318-head-output.txt`.

| Tag | Claim | Now (`a5a9c97`) | After A |
|---|---|---|---|
| K1 | gate 317 | published a5a9c97 | same |
| K2 | HEAD, status entries | a5a9c97 0 | deps commit, §2.1 count |
| K3 | zustand in package.json / lock | 0 / 0 | 1 / 1 |
| K4 | `range,` lines in the value memo/deps | 2 | 0 |
| K5 | `latestRef.current.range` | 7 | 0 |
| K6 | `.range` in StudioWorkspace | 6 | listed by A |
| K7 | provider `useState<TimeRange \| null>(null)` | 1 | 0 |
| K8 | protected OK | 11 | 11 |
| K9 | regression-last | 2026-11-02 | same |
| K10 | test files reading `.range` off the context | 22 | — |
| K11 | lane `clipRange` line | 1 | 0 |
| K12 | files importing zustand in `app/` | 0 | ≥ 1 |
| K13 | `range-store.ts` exists | 0 | 1 |
| K14 | range budget rows asserted (3 checked) | 0 | 3 |
| K15 | detail panel start/end effect | 1 | 1 |
| K16 | cited artifacts exist (L56) | 4 | 4 |

**Artifacts** (all exist): `b-round-317/claims-318.sh`, `claims-318-head-output.txt`, `range-test-files.txt`, `expect-count.py`, `expect-count-head.txt`.
