# Round 338: PERF-DRAG-PREVIEW stage c3-ii. The cross-lane drag ghosts move into a per-provider store, so a clip dragged to another lane stops re-rendering the provider and the whole workspace on every move. The lane perf rows become asserts

**Planned by:** B, at the round 337 → 338 planning, 2026-11-04.

**Decisions** (all in `backlog.json` v296 → v297 `decisions_log_b`; D-29z1031…D-29z1040):
- **D-29z1031: round 337 closed as PASS, from C's evidence.** `c-round-337.json` PASS, `browserVerified`/`realVerified` true, 9 rows, 0 bugs. Gate 337 `published` `bbc281f` on both remotes [K1]. **The baseline is `bbc281f`.** SYS-R336-PERF-DRAG-WINDOW → done; it closes its six ids.
- **D-29z1032: A's and the gate's round-337 notes.** A's reviewer Lows #1–#4 (helper renames in the perf spec) → `deferred_low_polish` as A-R337-REVIEW-HELPER-NAMES. The doc 168 l.87 wording Low ("შემდეგ" twice) [K16] is fixed in this round, because doc 168 `## მეტრიკები` is granted again (§1.4). The `make-mutant.py` Info is closed. The gate reviewer's proposal (move `dragWindow`/`componentsPerMove`/`rowWriter` into `perf/lib/`) is the architecture signal ARCH-R337-PERF-HELPERS-TO-LIB, not scheduled (it waits for ROOT-REQ-VITEST-PERF-INCLUDE).
- **D-29z1033: no regression round yet.** `regression-last.json` is 2026-11-02 [K9], and today is 2026-11-04 (2 days). The next planning on or after 2026-11-05 is REGRESSION-ROUND-2026-11-05.
- **D-29z1034: the c3-ii premise, re-measured at `bbc281f` (L37).** See §0.1. Two provider hooks change on every cross-lane move. The real cost is hook 35 (`clipLaneDrag` in the context value), not hook 0 (history).
- **D-29z1035: the consults and the sketch review** (`b-round-337/sketch-review.md`). `tech-lead` found one Medium (TL-1), fixed in the sketch. All other findings are Low and applied.
- **D-29z1036: budgets.** 7 lane rows become `assert`. See §1.3.
- **D-29z1037: tests.** 6 probe lines change; DP49, DP50 and CL1–CL4 are new. No `expect(` is removed. See §1.2.
- **D-29z1038: docs.** Doc 232 is granted whole; doc 168 `## მეტრიკები` is granted whole. Doc 014 and doc 233 stay unchanged. See §1.4.
- **D-29z1039: signals.** SIG-R338-GHOST-LAYER and SIG-R338-GROUP-CROSS-PREVIEW (the latter is input to stage c4). Escape during a cross-lane drag does not cancel it, at HEAD and on the sketch alike: this is the known C-R85-L1 / ESCAPE-CANCEL-GESTURE question, not a new finding.
- **D-29z1040: this task.**

**Read first:**
- `lessons.md`: L4, L7, L10, L23, L29, L37, L38, L49, L56, L57, L58.
- Primitives: `AUDIO_ARCHITECTURE.md` (Studio), `REACT_CONTEXT.md` (provider and store), `AGENT_DISCOVERABLE_CODE.md` (new names), `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests), `GEORGIAN_DOCS.md` (docs). `prompts/studio-feature.md` applies to the Studio change.
- No style, colour, copy, layout or audio-graph change.

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first / product-designer / screen budget:** not applicable. This is a pure performance round. The behaviour and the screen are held to HEAD, and a browser row proves that (CROSS-BEHAVIOUR). Nothing permanently visible is added.

## Baseline
- HEAD is `bbc281f` (gate 337, published), with a clean tree [K2]. Protected files: 11/11 OK [K8]. No dependency change.
- **Perf oracle:** `c-round-337/perf-results/latest-interactions.json`: 193 rows, `complete` true, 0 failures, 139 non-wallclock rows [K10].
- **Behaviour oracle:** `b-round-337/probe/head-1440.json` and `head-1280.json`, B's browser probe on the root dev server (:5173 = HEAD) [K20].

## 0. Why this round, and B's evidence

### 0.1 Premise at HEAD (L37)
The c3-ii stage (D-29z1008) moves `clipLaneDrag` out of the provider. B re-ran the HEAD probe at `bbc281f` (`b-round-337/cross-lane-probe.mjs`, dev build, 1440×900 and 1280×720):

| Phase | HEAD per commit | Provider hooks that changed |
|---|---|---|
| 4 same-lane moves | 19, 19, 101, 19 | none |
| cross-lane enter | 101, 91 | 0, 35 |
| **4 cross-lane moves** | **87, 87, 87, 87**: provider and `StudioWorkspace` rendered on every move | **0 and 35** |
| release on the next lane | 106 | 0, 16, 35 |

Where the two hooks come from:
- **Hook 35** is `const [clipLaneDrag, setClipLaneDrag] = useState<ClipLaneDragState | null>(null);` in the provider [K3]. `clipLaneDrag` is a field of the context value [K3]. `publishLaneGhosts` sets it whenever the ghost changes. `StudioWorkspace` and every `ArrangementLane` read it through `useArrangement()` [K6, K15].
- **Hook 0** is the provider's `history` state. On every cross-lane move, the single-clip branch calls `previewArrangement(gesture.before)` [K4], which runs `updateHistory` and therefore `setHistory(next)` with a new object [K5].

**Which hook costs what (B's sketch + mutant A, §0.3).** With the drag in a store but the per-move history write put back, a move costs 25.25 components, against 24.906 without the write. So the history write re-renders only the provider fiber: the context value's dependencies do not change. The 87-component commits come from hook 35. Both are removed, because TL-1 (§0.4) needs the history write gone anyway.

### 0.2 What the sketch changes
B's sketch is on a `git archive` of `bbc281f` in `/home/runner/b337-scratch/sc`, built by `apply-sketch.py`, DP49 by hand, `apply-sketch-v3.py`, `apply-sketch-v4-rename.py`, DP50 by hand and `sketch-files/clip-lane-drag-store.test.ts`. The final diff is in `b-round-337/sketch/{sketch,spec,budgets}.patch.txt`. Each patch passes `git apply --check` on HEAD.
1. A new `app/lib/arrangement/clip-lane-drag-store.ts`. It holds the `ClipLaneGhost` and `ClipLaneDragState` interfaces (moved from the context; no re-export), plus:
   - `createArrangementClipLaneDragStore()`: a zustand vanilla store `{ drag, setDrag }`, with an `Object.is` guard;
   - `selectLaneDragGhosts(drag, trackId)`: the lane's ghosts, or one shared empty array;
   - `selectLaneMoveSourceKey(drag, clipIds)`: the lane's non-blocked source clip ids, joined with `\n`;
   - `selectLaneMoveRefusal(drag)`: the first blocked ghost's message, else null.

   It follows the PERF-8a range-store pattern [K15].
2. **`ArrangementContext.tsx`:**
   - The store is created once per provider: `const [clipLaneDragStore] = useState(() => createArrangementClipLaneDragStore());`.
   - `setClipLaneDrag` is a stable `useCallback` that writes to the store. It stays in the context value.
   - The `clipLaneDrag` field leaves the interface, the value and its dependencies.
   - A new `ArrangementClipLaneDragContext` provider sits inside `ArrangementRangeContext`, with `useArrangementClipLaneDragStore()` and `useArrangementClipLaneDrag(selector)`.
   - **`previewClipGeometry` gains one branch:** when `next === publishedHistoryRef.current.present`, it sets `historyRef.current = publishedHistoryRef.current`, clears the preview store and returns. It still sets `previewActiveRef.current = true` first.
3. **`ArrangementClip.tsx`:** in the single-clip cross-lane success branch, `previewArrangement(gesture.before);` becomes `previewGeometry(gesture.before);`. `previewGeometry` is `previewClipGeometry` for audio clips [K4]. The group branch, the stale-gesture path and every other `previewArrangement(gesture.before)` call stay unchanged (HEAD has 3 calls, the sketch 2) [K4].
4. **`ArrangementLane.tsx`:**
   - `laneGhosts` comes from `useArrangementClipLaneDrag(useShallow(…selectLaneDragGhosts…))`.
   - `isLaneMoveSource` comes from a per-lane key: `selectLaneMoveSourceKey` over the lane's clip ids, parsed in a `useMemo` into a `Set`.
   - `clipLaneDrag` leaves the `useArrangement()` destructure. `setClipLaneDrag` stays.
5. **`StudioWorkspace.tsx`:**
   - `ArrangementSelectedClipReadoutInner` loses its `clipLaneDrag` and `laneMoveRefusal` props. It selects three primitives itself: `drag !== null`, `drag?.timeLocked ?? false` and `selectLaneMoveRefusal(drag)`.
   - `StudioWorkspace` no longer reads the drag: the `clipLaneDrag` destructure, `const laneMoveRefusal =` and the props are gone [K6].
6. **Tests.**
   - Six probe lines read the drag from the store, and the existing assertions are unchanged (§1.2).
   - New DP49 and DP50 in `drag-preview-render.test.tsx`.
   - New `clip-lane-drag-store.test.ts` with CL1–CL4.
7. **The perf spec.**
   - `readLaneGhosts` also returns `targetStart`, the first target-lane ghost's `data-ghost-start`.
   - `measureLaneDrag` reads the ghosts once right after the 1-step move down (the entry read).
   - Liveness gets check **(e)**: the target ghost start must advance from the entry read to the cross read. Its two values go into the liveness detail.
   - The window maths and the row ids are unchanged [K19].
8. **Budgets:** 7 lane rows become `assert` (§1.3).

### 0.3 B's sketch evidence (L58)
| Check | Result | File [K#] |
|---|---|---|
| typecheck | rc 0 | `b-round-337/sketch-typecheck.log` |
| Biome on the 12 changed `app/` files | rc 0 | `b-round-337/biome-sketch.log` |
| Covering unit files (the `clipLaneDrag`/ghost/refusal/cross-lane grep, plus the new store test) | 18 files, 446 tests, all pass [K14] | `covering-files.txt`, `covering-unit.log` |
| Unit mutants (`run-unit-mutants.py`, DP49/DP5b/DP50) | all 6 red on the named row [K13]: MU-WS-SUB (workspace subscribes to the whole drag) → DP49; MU-CLIP-GUARD (HEAD line back) → DP49; MU-GUARD-V2 (B's v2 guard, TL-1) → DP49 at `isArrangementPreviewActive()`; MU-LANE-ALL (lane subscribes to the whole drag) → DP49; MU-REFUSAL (selector returns null) → DP50; MU-CLEAR (clear branch off) → DP5b and DP49 | `unit-mutants/summary.txt`, `unit-mutants/*.log` |
| Perf run 1 (v2, all lane rows record) | lane `move-components-per-move` 58.969 → **24.906**; same-lane `interact.drag.move.*.move-components-per-move` 24.267 → **22.8**; every other non-wallclock row EQUAL | `perf-sketch.log`, `perf-rowcmp-sketch-vs-c337.txt` |
| Perf run 2 (v3, 7 asserts, lane budget `<= 26`) | rc 0; 43/43 asserted pass; 131 EQUAL, 8 DIFF (the same 8 rows), 0 NEW; `ids-equal 193`; liveness [1,1,1] at 1x and 6x; entry ghost start 1 → cross 2 | `perf-sketch2.log`, `perf-rowcmp-sketch2-vs-c337.txt` |
| **Perf mutant AE** on v3 (A: the HEAD `previewArrangement(gesture.before)` line; E: `targetStart` forced to 0) | lane per-move **25.25** (A), and `drag-lane-live` 0 at 1x and 6x (E, check (e) in every pass). That is why the budget is `<= 25` and not 26 | `perf-mutant-AE.log`, `perf-mutant-AE.patch.txt`, `perf-rowcmp-mutantAE-vs-sketch2.txt` [K21] |
| **Perf run 3** (final v4 tree, budget `<= 25`) | see [K11, K12]: expected rc 0, 43/43 asserted pass, the same 8 DIFF rows, 131 EQUAL | `perf-sketch3.log`, `perf-rowcmp-sketch3-vs-c337.txt` |
| Browser behaviour probe, sketch (own dev server, own `cacheDir`) vs HEAD (:5173), both viewports | **0 behaviour diffs** at 1440×900 and 1280×720. Cross-lane moves 87 → **5** components per commit, with neither the provider nor `StudioWorkspace` rendered. Enter 101+91 → 101. Release 106 on both, hooks [0, 16, 35] → [0, 16] | `probe/compare-1440.txt`, `probe/compare-1280.txt` [K20] |

Why the same-lane move row drops (24.267 → 22.8): at HEAD, the first same-lane move publishes `{ ghosts: [] }`, and that `null → object` change renders the provider once (about 88 components ÷ 60 moves). On the sketch it renders only the readout. This is the expected side effect. The rows are `record` (stage a owner), and their new value is the sketch's.

### 0.4 Consults (D-29z1035)
`tech-lead` reviewed the sketch, standing in for `code-reviewer`, which is not on this phase's consult list. `performance-optimizer` answered the budget questions. Both were read-only; the full table is in `b-round-337/sketch-review.md`.
- **TL-1 (Medium, fixed in v3).** A guard `if (getArrangement() !== gesture.before)` would skip `previewActiveRef = true` on a direct cross-lane drag. The video-import wait checks only `previewActiveRef` [K5]. So the sketch always calls `previewGeometry(gesture.before)`; the new clear branch makes the repeat call render-free. DP49 pins this, and MU-GUARD-V2 proves it can fail.
- **TL-2/TL-3 (Low, applied).** The names in §0.2; no type re-export.
- **TL-4 (Low, applied).** CL1–CL4.
- **TL-5 (Low, applied).** The doc grants in §1.4.
- **performance-optimizer:**
  - which rows are assertable (§1.3);
  - `move-components-max` (101 is the same-lane commit) and the wallclock `cross-`/`lane-components-per-move` stay `record`;
  - liveness check (e);
  - DP49's early `previewOf(api)` null.

## 1. What A changes (ownership)
**Fastest route:**
1. Apply the three patches: `git apply b-round-337/sketch/sketch.patch.txt b-round-337/sketch/spec.patch.txt b-round-337/sketch/budgets.patch.txt`.
2. Read every hunk against §0.2, §1.2 and §1.3.
3. Edit docs 232 and 168 by hand (§1.4).

A may write equal or stronger code than the sketch. A must not remove or weaken any assertion, and every value in §2 must hold.

**Granted files (exactly these 16):**

| File | What |
|---|---|
| `app/lib/arrangement/clip-lane-drag-store.ts` | new (§0.2.1) |
| `app/contexts/ArrangementContext.tsx` | §0.2.2 only |
| `app/components/arrangement/ArrangementClip.tsx` | §0.2.3: the one call plus the type import from the lib file |
| `app/components/arrangement/ArrangementLane.tsx` | §0.2.4 |
| `app/components/arrangement/StudioWorkspace.tsx` | §0.2.5 |
| `app/lib/arrangement/__tests__/clip-lane-drag-store.test.ts` | new, CL1–CL4 |
| `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | probe line, DP49, DP50, `CLIP_LANE_REFUSAL_MESSAGES` import |
| `gesture-guard.test.tsx`, `shortcut-sheet-ui.test.tsx`, `track-groups-ui.test.tsx`, `workspace-strings-ui.test.tsx`, `track-group-collapse-ui.test.tsx` (same folder) | probe line, probe type and imports only |
| `perf/studio-lab-interactions.perf.spec.ts` | §0.2.7 only |
| `perf/budgets.interactions.json` | §1.3 only: 7 rows' `mode`/`budget`/`owner`/`note` |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | whole (L34) |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | `## მეტრიკები` only |

Nothing else changes: no other component, no `perf/lib/**`, no config, `package.json`, protected file, or doc 014/233.

### 1.1 Ruling lines (L4)
- `previewClipGeometry`: the identity clear branch (clause §0.2.2) wins over "same-lane trim/fade/move behaviour unchanged". It fires only when `next` is the exact published `present`. For those callers that means "no preview", which is what the store's null already meant. DP5b pins it.
- `ArrangementClip.tsx` cross-lane branch: clause §0.2.3 (always `previewGeometry`) wins over any "skip when unchanged" optimisation (TL-1).
- `perf/budgets.interactions.json`: §1.3 wins over the c3-i "26 record rows" text. Only the 7 listed rows change; the other 186 rows are byte-equal.
- Test files: "no `expect(` removed" wins over "probe unchanged". A probe line may change, and an assertion may not.

### 1.2 Tests (D-29z1037)
- **Probe lines (L23 collision, granted).** The 6 files read `live(api).clipLaneDrag` 16 times [K15]. The value no longer has that field, so each probe becomes `{ ...useArrangement(), clipLaneDrag: useArrangementClipLaneDrag((state) => state.drag) }` with a local probe type. `track-group-collapse-ui` keeps its `range` field too [K7]. This is PERF-8a's precedent (the `range` probe). The 16 reads stay as they are.
- **DP49** (new; after DP5b):
  - Press on `c1`'s name bar and move straight to the SFX lane.
  - Ghost `{ trackId: 'sfx', start: 3 }`; `previewOf(api)` null; `getArrangement()` is the committed `arrangement`; `isArrangementPreviewActive()` true.
  - Clear the render log, then make two more cross-lane moves. Ghost start 5. Renders: `ArrangementProvider` 0, `StudioWorkspace` 0, `ArrangementTransport` 0, `ArrangementLibrary` 0, **`ArrangementLane` 2**.
  - The hint reads "Shift — lock the time; only the track changes". The committed clip is still `{ start: 2, trackId: 'music' }`.
  - Release: undo label "Move to track — SFX"; drag null; preview null; clip `{ start: 5, trackId: 'sfx' }`.
- **DP50** (new):
  - A cross-lane move onto `c2`'s place gives one blocked ghost with `CLIP_LANE_REFUSAL_MESSAGES.overlap` ("No room here").
  - `arrangement-lane-move-refusal` reads "No room here · ". The hint reads "No room here · Shift — lock the time; only the track changes". The status reads "No room here".
  - Release: undo label null, drag null, no refusal element, clip unchanged.
- **CL1–CL4** (new file):
  - CL1: `setDrag` keeps the state object for `null` and for the same drag, and notifies once per new drag.
  - CL2: the shared empty ghost array, and per-lane filtering.
  - CL3: the source key keeps clip order and ignores blocked ghosts.
  - CL4: the first blocked message.
- DP5b stays as it is and passes.

### 1.3 Budgets (D-29z1036; L58)
| Row | HEAD | Sketch (1x and 6x) | New |
|---|---|---|---|
| `interact.drag.lane.stopped.move-components-per-move` | 58.969 | 24.906 | **assert `<= 25`** (mutant A 25.25 is red) |
| `interact.drag.lane.playing.move-components-per-move` | 58.969 | 24.906 | **assert `<= 25`** |
| `interact.drag.lane.stopped.release-commits` | 1 | 1 | **assert `== 1`** (one history entry per gesture) |
| `interact.drag.lane.playing.release-commits` | 1 | 1 | **assert `== 1`** |
| `interact.drag.lane.playing.move-restarts` | 0 | 0 | **assert `== 0`** |
| `interact.harness.drag-lane-live` and `.6x` | 1 | 1 | **assert `== 1`** (mutant E: 0) |

Each row's owner becomes `PERF-DRAG-PREVIEW-c3-ii`, except the two liveness rows, which keep `PERF-DRAG-PREVIEW-c3-i`. Each note gains one "Asserted since … stage c3-ii (round 338)" sentence, with the measured value and the mutant. The liveness note names check (e).

These rows stay `record`, and why:
- `move-components-max` (101): the same-lane commit; it does not test c3-ii.
- `cross-` and `lane-components-per-move`: wallclock (L37).
- `release-restarts`: the commit's normal graph sync.
- All `.6x` component copies: the file's existing pattern.

The two same-lane `interact.drag.move.*.move-components-per-move` rows stay `record`, at their new value.

### 1.4 Docs (D-29z1038)
- **Doc 232, whole:**
  - l.1 title: append ", ეტაპი c3-ii — cross-lane ghost-ები store-ში".
  - l.4: `**სტატუსი:** In Progress (stage c3-ii of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4, c5; C round 338 PASS)`. Write it with the final value (L28), after C PASS, as in round 337.
  - l.5 lists `app/lib/arrangement/clip-lane-drag-store.ts`.
  - A new section `### ეტაპი c3-ii: cross-lane ghost-ები provider-იდან store-ში (round 338, D-29z1034)` after c3-i, with items 47+: the premise (§0.1, hook 35 vs hook 0), the store and the subscriber placement, TL-1, the budgets and the mutants. Item 46 (the c3-i forecast "preview store") [K23] is corrected to "own store".
  - Plus: an architecture note, a files entry, a problem → solution entry (TL-1), testing entries (DP49, DP50, CL1–CL4, perf, probe), and TODO (remove the c3-ii line; add SIG-R338-GHOST-LAYER and SIG-R338-GROUP-CROSS-PREVIEW for c4).
  - The 7 `## ` headings stay in TEMPLATE order.
- **Doc 168 `## მეტრიკები`:**
  - l.111: the 26 lane rows are no longer "ყველა `record`" [K23]. Name the 7 asserted rows and their budgets, and check (e).
  - l.87: replace "commit-ების ფანჯარა იწყება in-page pointerdown-ის შემდეგ პირველი move-ის შემდეგ" with "commit-ების ფანჯარა იწყება in-page pointerdown-ის მომდევნო პირველი move-ის შემდეგ" (A-R337 re-review Low) [K16].
- **Doc 014** (round-era history: "context-ში ინახება `clipLaneDrag`") and **doc 233** l.75 (a TODO this stage satisfies) stay unchanged [K23]. Implementation docs are history.

## 2. Acceptance

### 2.1 A rows (A writes `a-round-338.md` and `a-round-338/` as it goes)
| Row | Command | Expected |
|---|---|---|
| A-CLAIMS | `bash b-round-337/claims-338.sh > a-round-338/claims-pre.txt` before any edit; again at the end | Pre equals `b-round-337/claims-338-planning-output.txt`. Final equals `b-round-337/claims-338-sketch-output.txt` except K2 (A's tree: `bbc281f` and 16 entries) and K16 (B's sketch has no doc edits: doc 232's c3 heading count goes 1 → 2 and the doc 168 phrase 1 → 0 only on A's tree) |
| A-TYPE | `npm run typecheck` | rc 0 |
| A-LINT | `npm run lint` | rc 0; warnings ≤ gate 337's count (record it) |
| A-UNIT | From `store/`: `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-337/covering-files.txt)` (the listed paths are store-relative) | 18 files, 446 tests, all pass |
| A-MUTANT | `python3 -I b-round-337/unit-mutants/run-unit-mutants.py <A's scratch copy> a-round-338/unit-mutants` on a copy of A's tree, never `store/` | Each of the 6 is red on the row in §0.3. The copy is deleted after |
| A-PERF | Production perf **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-337/perf-results/latest-interactions.json <A's result>` and `python3 -I b-round-336/rowids-equal.py` on the same two files | rc 0; `complete` true; `failures` []; 193 rows; **43/43 asserted pass**; exactly the 8 DIFF rows of §0.3 with B's values; 131 EQUAL; 0 NEW; `ids-equal 193`; liveness [1,1,1] at 1x and 6x |
| A-SCOPE | `git status --short`, `git diff --stat` | The 16 files of §1 only: 2 untracked (store lib + test), 14 modified. Protected 11/11 |
| A-REVIEW | `code-reviewer` (3+ files) | No Medium+ open. Architecture notes go to B, not into code |

### 2.2 C rows (C writes `c-round-338.md`, `c-round-338.json` and `c-round-338/` as it goes)
C writes **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding.
- `assertsSpecified` = 13: DP49, DP50, CL1–CL4, DP5b, the 7 perf asserts counted as one PERF row, CROSS-NAMES, CROSS-BEHAVIOUR, G338-AUTH, STUDIO-SMOKE-338.
- `mutantsRecorded` = the 6 unit mutants, mutant AE, and C's own.
- `mutantRedOnSketch`: `b-round-337/unit-mutants/summary.txt` and `b-round-337/perf-rowcmp-mutantAE-vs-sketch2.txt`.
- `mutantRedOnTree`: from C's own runs.
- `gateChecksNamed` = full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke. `gateChecksRunOnSketch`: typecheck, Biome on the changed files (`b-round-337/sketch-typecheck.log`, `biome-sketch.log`).
- `chainHeadGateRunGreen` from `gates/gate-round-337.json`.
- `affectedChecksNamed`: covering units, DP49/DP50/CL, the interactions perf spec, rowcmp/rowids, the cross-lane probe, typecheck. `affectedChecksRunOnSketch`: all of them, per §0.3.

**Browser rows** compare A's tree on :5173 with HEAD `bbc281f` on a second dev server that has its own Vite `cacheDir` (L38), at **1440×900 and 1280×720**. A cold-compile timeout is environment-invalid: replace it and keep the original (L38 warm-up).

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-337/claims-338.sh`, first (L56) | Equal to A-CLAIMS final |
| SOURCE-SCOPE | `git status`, `git diff --stat`, protected sha | The 16 files only. `git apply -R --check` of the three B patches passes, except for hunks A strengthened (no `expect(` removed: compare the `expect(` counts per test file with the sketch). No diff in other `app/` files or in `perf/lib/` |
| UNIT | On C's scratch copy: the covering files ×2 | Green; DP49, DP50 and CL1–CL4 present once each |
| MUTANT | `run-unit-mutants.py` on C's copy, plus one mutant of C's own, predicted before it runs (e.g. `useShallow` removed from `laneGhosts` → DP49 `ArrangementLane` count) | As A-MUTANT; C's own is red on the predicted row |
| **PERF** | As A-PERF, alone, production build, browser warm-up first | As A-PERF. Any other DIFF is a finding, with its number |
| **CROSS-NAMES (browser, dev)** | `node b-round-337/cross-lane-probe.mjs <base> <out> <w> <h>` on A's tree and on HEAD, then `python3 -I b-round-337/probe/compare.py <head.json> <a.json>` | A's per-commit `rendered`/provider/workspace/hooks equal `b-round-337/probe/sketch-<w>.json`: 4 cross-lane moves of **5** each, provider and workspace false, hooks []; enter [101]; release [106] with hooks [0, 16]. HEAD equals `b-round-337/probe/head-<w>.json` (87 ×4) |
| **CROSS-BEHAVIOUR (browser)** | The same runs | `BEHAVIOUR-DIFFS 0` at both viewports, A vs HEAD: ghosts on the target lane, source `opacity-40` during the drag, hint and Shift hint texts, release on the target lane, the Undo title "Undo: Move to track — Stems (Ctrl+Z)", Ctrl+Z back, and Escape (no cancel, as at HEAD: C-R85-L1). Plus one screenshot per viewport mid cross-lane drag on A, in `c-round-338/shots/` |
| G338-AUTH | As G330/G337-AUTH (`c-round-337`'s copy of the auth script), fresh anonymous contexts, both viewports | `/studio-lab`: anonymous workspace and demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401 |
| STUDIO-SMOKE-338 (browser, both viewports) | On A's tree: add a clip, move it to another lane by its name bar while playing, release, Space, Export WAV | Playback continues through the drag. The clip plays from its new lane. The export completes. 0 page errors |
| DOCS | Read doc 232 and doc 168 `## მეტრიკები` | §1.4: l.4 byte-exact, the c3-ii section and items, the 7 headings in TEMPLATE order, every DP/CL id cited exists as an `it(`; doc 168 l.87 and l.111 as written; nothing outside `## მეტრიკები` changed in doc 168 |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**Ableton conformance:** not applicable. A perf round with the behaviour held to HEAD.

## 3. Neighbouring behaviour that could break
- **The cross-lane ghost, hint, refusal and source dimming** move from provider state to the store. Covered by CROSS-BEHAVIOUR, DP49, DP50 and the 16 existing reads.
- **Same-lane trim/fade/move previews** go through the changed `previewClipGeometry`. Covered by DP5b, the DP suite and the EQUAL perf rows.
- **A video import during a drag** waits on `previewActiveRef`. Covered by DP49's `isArrangementPreviewActive()` and MU-GUARD-V2.
- **Undo/redo of a cross-lane move, and playback while dragging.** Covered by DP49 release/undo, STUDIO-SMOKE-338 and `move-restarts == 0`.
- **The group cross-lane branch** is untouched; it is stage c4.

## 4. STOP conditions (A)
- A patch does not apply, or a hunk would need a file outside §1: STOP with the diff (L22).
- A-PERF shows a DIFF outside the 8 rows, a failed assert, or liveness 0: STOP with the numbers. Do not change a budget.
- A test needs an `expect(` removed or weakened: STOP.

## 5. Not in scope
- Group move (c4), video clips (c5), the ghost layer as its own memo child (SIG-R338-GHOST-LAYER), and Escape-to-cancel (ESCAPE-CANCEL-GESTURE, a product question).
- The lane `move-components-max`, wallclock or `.6x` asserts, and any other perf row.
- Renaming the perf helpers (A-R337-REVIEW-HELPER-NAMES, deferred).

## 6. Deliverables
- A: the 16 files; `a-round-338.md` with the A rows; `a-round-338/` logs.
- C: `c-round-338.md`, `c-round-338.json`, `c-round-338/`.

## 7. Claims
Run `bash b-round-337/claims-338.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). The expected output at HEAD is `b-round-337/claims-338-planning-output.txt`, and on B's sketch it is `b-round-337/claims-338-sketch-output.txt`.
- **K1:** gate 337 `published` `bbc281f`.
- **K2:** HEAD's short hash and the `git status` entry count.
- **K3:** in the context: the `clipLaneDrag` `useState` line, the interface field, the new store `useState`, `useArrangementClipLaneDrag`, the `ClipLaneDragState` interface, and a type re-export (HEAD `1 1 0 0 1 0`; sketch `0 0 1 1 0 0`).
- **K4:** in `ArrangementClip.tsx`: `previewArrangement(gesture.before);` (HEAD 3, sketch 2), `previewGeometry(gesture.before);` (0 / 1), the v2 guard (0 / 0) and the `previewGeometry` definition (1).
- **K5:** `setHistory(next);` in `updateHistory` (1), the clear branch (0 / 1) and the video-import wait condition on `previewActiveRef` (1).
- **K6:** the store file, the hook uses in the lane and in the workspace, `const laneMoveRefusal =` in the workspace, and the `clipLaneDrag={clipLaneDrag}` prop (HEAD `no-store-file 0 0 1 1`; sketch `store-file 2 3 0 0`).
- **K7:** the probe lines per test file (HEAD 1 each; sketch 0) and the number of files with the new probe (0 / 6).
- **K8:** protected sha, 11 OK. **K9:** the `regression-last` date.
- **K10:** the perf oracle (`c-round-337`). **K11:** B's final sketch run (run 3): the asserted lane rows' samples. **K12:** run 3's rowcmp counts and asserted pass.
- **K13:** the unit mutant summary. **K14:** the covering unit counts and file count.
- **K15 (SWEEP, L49):** every file under `app/`, `perf/` and `e2e/` that names `clipLaneDrag`, `ClipLaneDragState` or `ClipLaneGhost`. Each one is a granted file or a reader that §1.2 rules on.
- **K16:** a `234-` doc (0; this round writes none), doc 232's c3 headings and `## ` count, doc 168's `## ` count, and the doc 168 l.87 double-"შემდეგ" phrase (HEAD 1, A 0).
- **K17:** the budget row count, the lane row count, asserted lane rows (HEAD 0, sketch 7) and all asserted rows (36 / 43).
- **K18:** `it('DP49 `, `it('DP50 `, `it('DP5b ` and the CL rows (HEAD `0 0 1 0`, sketch `1 1 1 4`).
- **K19:** in the spec: `targetStart`, the entry read, check (e) and the old one-line `pressedGesture` destructure (HEAD `0 0 0 1`, sketch `1 1 1 0`).
- **K20:** the HEAD probe's key fields and the BEHAVIOUR-DIFFS of both compares.
- **K21:** mutant AE: DIFF count, asserted pass, the lane row's value change.
- **K22:** every cited artifact exists (L56).
- **K23:** `clipLaneDrag` in doc 014 and doc 233 (left unchanged), doc 168's "ყველა `record`, `budget: null`" lane sentence (HEAD 1, A 0), and doc 232's "(preview store)" text (HEAD 2: item 46's forecast and the Mermaid node `P[(preview store)]`, which stays; A 1).

## 8. Root notes
- **Commit readiness:** after C PASS, the 16 files of §1 are one change. The gate's full verify and review apply.
- **Still open for root:**
  - checkpoint D-29z915 (SIG-R331/SIG-R332, deadline the close of c5);
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - R80-RECORDINGS-FIELD-BORDERS (`retro-336.md` §12.4).
- **Next:** the next planning on or after 2026-11-05 is REGRESSION-ROUND-2026-11-05 (D-29z1033). Then come c4, c5, the conversions, PERF-9…15 and the rest of the queue.
