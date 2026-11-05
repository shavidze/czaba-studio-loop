# CURRENT TASK — Round 357: PERF-10a. `isPlaying` leaves the ArrangementContext value for a playback store, so Play and Stop stop re-rendering the whole workspace

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 356 → 357 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v319 → v320):
- **D-29z1149:** round 356 is closed as PASS from C's evidence. `c-round-356.json` is PASS with `browserVerified`/`realVerified` true and 0 bugs; B's L57 checker gives rc 0 (`b-round-356/l57-check-c356.txt`). Gate 356 published `d49536b` [K1].
- **D-29z1150:** routing of the gate-356 review notes (§5).
- **D-29z1151:** PERF-CAND-FADE-RELEASE-COMMITS is closed as "named, no fix" (§5).
- **D-29z1152:** PERF-9 gets a dependency note (§5). This is not a deferral.
- **D-29z1153:** this task and its rulings.
- **D-29z1154:** what comes next (§5).

**Read first:**
- `lessons.md`: A reads 11, 12, 23, 26, 28, 38, 52 and 58; C also reads 22, 37, 38, 48, 57, 59 and 60.
- Primitives: `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `AGENT_DISCOVERABLE_CODE.md` (new exports), `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md` (the new doc).
- Background: `docs/technical/performance/oss-adoption.md` (zustand/vanilla stores for PERF-10).

**L29 note:** untagged code text below is a new name, an expected value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:**
- Reference-first, product-designer, the screen budget and the YouTube request: this is a performance round, and nothing on screen, in audio or in behaviour changes.
- Ableton conformance: not applicable.

## Baseline
- HEAD is `d49536b` (gate 356, published), and the tree is clean [K2].
- **Root lanes (2026-11-05 parallel policy).** A HEAD that descends from `d49536b` through only `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` is an allowed delta, not a STOP. K2 prints that count, and it must be 0. This round touches no root-lane file.
- Protected files are 11/11 OK [K6]. There is no dependency change: zustand 5.0.16 is already installed [K9].

## 0. Why, and B's evidence

### 0.1 Premise (re-measured at HEAD, L37)
- B ran a dev names probe (`b-round-356/play-click-names-probe.mjs` → `b-round-356/play-click-names-head.json`).
  - Space play start and Space stop each make **1 commit with 70 components**.
  - The only provider hook that changes is `isPlaying`.
  - `isPlaying` lives in `useState` and is written at two sites. It sits in the context value and in that value's `useMemo` deps [K3].
- Every `useArrangement()` consumer therefore re-renders on every Play and Stop. That covers StudioWorkspace, the lanes, the ruler, the library, the video dock and the master.
- C356's production run reads the same picture. `interact.play.start-components` and `interact.play.stop-components` are 70 ×3 at 1× and 6×, and both are `record` [K8].
- The provider already keeps an `isPlayingRef` for its own logic [K3].
- Five files read `isPlaying` from the context, and they read it in three ways [K4] [K5]:
  - `ArrangementTransport` uses it in render (label, `data-playing`).
  - `ArrangementVideoDock` uses it in an effect.
  - `ArrangementMarkerRow` uses it only inside a callback and its deps.
  - The `StopPlaybackOnNarrow` component in `routes/studio-lab.tsx` uses it in an effect and renders null.
  - `StudioWorkspace` uses it in the Follow effect, plus 7 event-time reads through `workspaceRef.current.isPlaying`.
- PERF-10's target (`perf-plan.md`) is play/pause ≤ 20 components. This first slice cannot reach 20, because the Transport subtree alone renders about 22 fibers. The Transport play button becoming its own subscriber is PERF-10b (D-29z1154).

### 0.2 The change, shaped by the consults
`performance-optimizer` and `tech-lead` were consulted at this planning. Their answers are summarised in `b-round-356.md` §3.

1. **New store** `app/lib/arrangement/playback-store.ts`. It follows `status-preview-store.ts` and `selection-store.ts`: `createStore` from `zustand/vanilla`, one per provider through `useState(() => …)`, and never a module singleton (SSR).
   - State: `{ isPlaying: boolean; setPlaying(next) }`.
   - `setPlaying` returns the same state object when the value is equal, so subscribers are not notified.
2. **Provider** (`ArrangementContext.tsx`):
   - `useState(false)` for `isPlaying` becomes the store.
   - **One writer:** each of the two write sites sets `isPlayingRef.current` and `playbackStore.getState().setPlaying(…)` next to each other, in the same order as today [K3].
   - `isPlaying` is **removed** from the `ArrangementContextValue` type, from the value and from the memo deps. `playbackStore` goes into the two `useCallback` deps that Biome requires.
   - A new `ArrangementPlaybackContext` provider joins the existing store providers.
   - Two exported hooks: `useArrangementPlaybackStore()` (throws outside the provider, like its siblings) and `useArrangementIsPlaying()` (`useStore(store, (s) => s.isPlaying)`).
3. **Consumers:**
   - `ArrangementTransport` and `ArrangementVideoDock` call `useArrangementIsPlaying()`. The dock's stopped-frame effect stays byte-identical except for where `isPlaying` comes from (`tech-lead` condition; question 4 of the checkpoint).
   - `ArrangementMarkerRow` does **not** subscribe. Its callback reads `playbackStore.getState().isPlaying`, and `isPlaying` in that callback's deps becomes `playbackStore`.
   - `StopPlaybackOnNarrow` calls `useArrangementIsPlaying()`. It renders null.
4. **StudioWorkspace does not subscribe at its top.**
   - A new memo leaf (`function ArrangementPlaybackFollowSyncInner` + `const ArrangementPlaybackFollowSync = memo(…)`, the L23 naming form) is rendered beside `ArrangementStatusText`. It takes two props, `committedRef` and `onPlayingChange`, and returns null.
   - Its layout effect writes `committedRef.current = isPlaying`.
   - The leaf is rendered **after** the status `<output>`, not inside it (no DOM; the footer child counts are unchanged). Its props are typed by `interface ArrangementPlaybackFollowSyncProps` (`committedRef: MutableRefObject<boolean>`).
   - Its `useEffect` calls `onPlayingChange(isPlaying)`. That callback is today's Follow effect body, as a `useCallback` with `[setFollowMode]` deps, with one change in the stop branch (sketch-review finding 1, final form):
     1. Check the shown status exactly as HEAD does: the preview, else the committed status. If HEAD would not write, return. That means no dispatch, which keeps `stop-commits` at 1.
     2. If HEAD would write and a preview is shown, keep HEAD's string write.
     3. Otherwise write `setStatus((text) => insertMarkerStatusKind(text) !== null || text === FOLLOW_PAUSED_MESSAGE ? describeSpaceStart() : text)`.
     - The functional form re-checks text that is queued but not yet committed, so a message queued behind the stop survives. An unchanged text writes nothing, because the reducer returns the previous entry [K15].
     - The first form always dispatched the functional write, and that raised `interact.play.stop-commits` from 1 to 2 (`b-round-356/perf-sketch-final-v1-results/`). It was rejected.
   - The 7 reads of `workspaceRef.current.isPlaying` / `current.isPlaying` read `committedIsPlayingRef.current` instead [K5].
   - Why not `store.subscribe` or `getState()` (`performance-optimizer`): a synchronous subscriber fires before the provider's `setStatus`/`updatePosition` that follow the write. The position subscriber would then see "playing" before `autoScrollLeftRef` is set. The leaf keeps today's post-commit timing.
5. **Tests.** The type removal breaks 46 test files at `tsc`, all in `app/**/__tests__` and none outside [K7]: they read `.isPlaying` from probe values.
   - **Class ruling R (L23):** a shared helper `app/lib/arrangement/__tests__/helpers/workspace-probe.ts` exports `type WorkspaceProbeValue = ArrangementContextValue & { isPlaying: boolean }` and `useWorkspaceProbe()`, which returns `{ ...useArrangement(), isPlaying: useArrangementIsPlaying() }`.
   - In every one of the 46 files, `useArrangement()` becomes `useWorkspaceProbe()`, and `ArrangementContextValue` outside the import becomes `WorkspaceProbeValue`. Imports are adjusted and nothing else changes.
   - B applied R by script to the sketch (`b-round-356/probe-sweep-log.txt`, the list `b-round-356/tsc-removal-files.txt`). A applies `b-round-356/sketch/tests.patch.txt` (§1.1), or re-runs the same rule.
   - A file that `tsc` flags after R, other than these 46, is a STOP (L11).
   - **Why removal and not a getter:**
     - B's first sketch kept `get isPlaying()` on the value, which avoids the sweep. It failed TG11 and other tests, because a spread probe (`{ ...useArrangement() }`) copies the getter once and goes stale (`b-round-356/precheck-full-getter-variant-killed.log`).
     - With removal, `tsc` finds every missed reader (`tech-lead`; precedent D-29z894 for the selection store).

### 0.3 B's sketch runs (scratch `/home/runner/b356-scratch/sc`, git base `b61245b`; it does not survive the job — use the loop-folder copies `b-round-356/sketch/{source,tests}.patch.txt` (sha256 in `b-round-356/sketch/patches.sha256`), which pass `git apply --check` on `d49536b`)
The dispatched sketch is `b-round-356/sketch/source.patch.txt` + `tests.patch.txt`. Hashes are in `b-round-356/sketch/patches.sha256`, and the review with rulings is in `b-round-356/sketch-review.md`.

| Check | Result | Evidence |
|---|---|---|
| `tsc` / Biome on the changed files | 0 / 0 | — |
| Full vitest, final sketch | **246 files, 3632/3632 pass**. HEAD has 3626, and the 6 new rows are PS1–PS3, RB-PB1, RB-PB2 and FW-PB1 | `b-round-356/precheck-full-final.log` |
| Full vitest, first sketch, before the §1.2 ruling | 3625/3626. Only the ruled render-budget parent control was red | `b-round-356/precheck-full.log` |
| Covering set (render-budget, playback-store, 47 Follow files) | 48 files, 962/962 | `b-round-356/sketch-cover-postfix.log` |
| Mutants M-B1–M-B4 | red as §1.3 says | `b-round-356/mutants/` |
| Perf, final sketch (production, alone) | <ul><li>rc 0; `complete`; `failures` []; 252 rows; 84/84; `durationMs` 488158.</li><li>**`interact.play.start-components` and `stop-components` 70 → 28** (×3, 1× and 6×).</li><li>`start-commits` and `stop-commits` stay 1, and `start-sources` stays 1.</li><li>Every other non-wallclock row is equal to C356.</li></ul> | `b-round-356/perf-sketch-final-results/latest-interactions.json`, `b-round-356/perf-rowcmp-final-vs-c356.txt`, `b-round-356/perf-summary.txt` |
| Perf, M-B1 (provider re-subscribes) | play start/stop components 28 → 71 | `b-round-356/perf-mu-b1-results/latest-interactions.json` |

**Expected on A's tree:** the play start and stop component rows are 28 at 1× and 6×, and every other deterministic row is unchanged. The rows stay `record` in this round. PERF-10a-BUDGETS asserts them from C357's values. 28 is above PERF-10's ≤ 20 target, and the gap is the Transport subtree, which is PERF-10b.

## 1. Scope (A)

### 1.1 Files
| File | Change |
|---|---|
| `app/lib/arrangement/playback-store.ts` | new (§0.2 item 1) |
| `app/contexts/ArrangementContext.tsx` | §0.2 item 2 |
| `app/components/arrangement/StudioWorkspace.tsx` | §0.2 item 4 |
| `app/components/arrangement/ArrangementTransport.tsx`, `ArrangementVideoDock.tsx`, `ArrangementMarkerRow.tsx` | §0.2 item 3 |
| `app/routes/studio-lab.tsx` | §0.2 item 3 (`StopPlaybackOnNarrow` only) |
| `app/lib/arrangement/__tests__/helpers/workspace-probe.ts` | new (§0.2 item 5) |
| the 46 test files in `b-round-356/tsc-removal-files.txt` | rule R only (§0.2 item 5) |
| `app/lib/arrangement/__tests__/render-budget.test.tsx` | rule R, plus the §1.2 rulings and new rows RB-PB1 and RB-PB2 |
| `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | rule R, plus the new row FW-PB1 (§1.3) |
| `app/lib/arrangement/__tests__/playback-store.test.ts` | new: PS1–PS3 |
| `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | new (Georgian, technical terms in English; TEMPLATE order, L26; l.4 per L28: `In Progress (stage 1 of 3; C round 357 PASS)`) |

- B's sketch patches are `b-round-356/sketch/source.patch.txt` and `b-round-356/sketch/tests.patch.txt`. Their sha256 values are in `b-round-356/sketch/patches.sha256`, and they were reviewed in `b-round-356/sketch-review.md`. A may apply them with `git apply`, or write equivalent code; either way, every A row in §2.1 runs.
- `perf/budgets.interactions.json` is **not** changed in this round. Every play row stays `record`; L58 conversion is the job of PERF-10a-BUDGETS.

### 1.2 Rulings on tests the change silences (L58 positive controls)
- **`render-budget.test.tsx` "does not re-render clips, overview bars, library rows or ruler ticks over Play → Stop → Play"** (line found by `grep -n "does not re-render clips" app/lib/arrangement/__tests__/render-budget.test.tsx` [K12]).
  - Its parent loop asserted `toBeGreaterThan(0)` for `ArrangementTransport`, `ArrangementRuler`, `ArrangementLibrary` and `ArrangementLane`.
  - After the change, only the Transport renders on Play. **Ruling:** the Transport keeps `toBeGreaterThan(0)`. The other three become `toBe(0)`, which is PERF-10a's own budget and stronger than before.
  - The mount check (`WATCHED_LISTS` > 0 at mount) stays as the liveness proof.
  - The `expect(` count is not lower. It was red on B's sketch before the ruling (`b-round-356/precheck-full.log`), and it is green after.
- **The same test, memo-barrier proof** (sketch-review finding 2). Because the parents no longer render on Play, the test adds a positive control: `act(() => api.current?.setStatus('Positive control'))`. After it, Ruler, Library and Lane are each `> 0`, and `WATCHED_LISTS` stays all 0.
- **R9-L2** (sketch-review finding 3). `mountWorkspace` also mounts a raw `RawContextProbe` (`useArrangement()`) and returns `raw`.
  - R9-L2 keeps its `api.current` asserts. These now mean "the probe did not re-render".
  - It adds `expect(raw.current).toBe(rawAtPlay)` next to each of its two `toBe` asserts, and `expect(raw.current).not.toBe(rawAtPlay)` after the positive control.
- **R11-P1e** keeps its asserts unchanged through `useWorkspaceProbe()`.
- **Any other covering failure on A's tree** is a STOP (§4). B's full run on the sketch is in §0.3.

### 1.3 New test rows
- **PS1–PS3** (`playback-store.test.ts`):
  - PS1: a new store starts with `isPlaying` false.
  - PS2: `setPlaying(true)` notifies a subscriber exactly once and sets the value to true.
  - PS3: a second `setPlaying(true)` notifies nobody, and `getState()` is the same object (`toBe`).
- **RB-PB1** (`render-budget.test.tsx`): a raw probe holds `useArrangement()`, the context value itself and not the workspace probe. After Play, then Stop, then Play, it is the same object (`toBe`).
- **FW-PB1** (`bars-ruler-ui.test.tsx`, after FW8): stop through `pausePlaybackWithStatus` from a `setTimeout`, with the act environment off, while Follow is paused. The message stays, Follow returns to `on`, and `isPlaying` is false.
  - It guards the contract that a stop's own message survives a Follow pause.
  - jsdom merges the two commits, so it cannot reach the split-commit branch of finding 1. The row is green on the pre-fix sketch (`b-round-356/fw-pb1-prefix.log`), and the fix is defensive. The browser half is C's row VIDEO-FAIL-STOP.
- **RB-PB2:** over Play → Stop → Play, these components render 0 times:
  - `StudioWorkspace`, `ArrangementRuler`, `ArrangementLibrary`, `ArrangementLane`, `ArrangementDetailPanel`;
  - `ArrangementTransport` and `ArrangementPlaybackFollowSyncInner` render more than 0 times (liveness);
  - `data-playing` flips true → false → true.
- **Named mutants** (L58; B's logs are in `b-round-356/`):
  - **M-B1:** the provider adds `const playing = useStore(playbackStore, (s) => s.isPlaying)` and puts `playing` in the value memo deps. RB-PB1 and RB-PB2 go red.
  - **M-B2:** StudioWorkspace calls `useArrangementIsPlaying()` at its top. RB-PB2 goes red, because StudioWorkspace renders more than 0 times.
  - **M-B3:** the leaf's layout effect no longer writes `committedRef`. 18 Follow tests go red: FW1–FW3, FW6, FW8, FW-PB1, FW10, NS3b, LT3, LT4, LT9, LT15, IM4, GM21, GM24, GM34, MV16 and DXT3 (`b-round-356/mutants/mutant-m-b3.log`; file list `b-round-356/mutants/m-b3-files.txt`, 47 files). The sketch passes all of them.
  - **M-B4:** the HEAD pre-check is removed, and the functional write always returns `describeSpaceStart()`. FW-PB1, FW6, FW10, LT15, LT21, DP16 and the render-budget Play rows go red (`b-round-356/mutants/mutant-m-b4.log`).

## 2. Acceptance
### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-356/claims-357.sh`, run from the loop root | equals `b-round-356/claims-357-planning-output.txt` (K2 may show the allowed root-lane delta with `outside-root-lanes… 0`) |
| A-CLAIMS final | same | <ul><li>K3–K5, K7, K12, K13 (except `doc234`) and K14 equal `b-round-356/claims-357-sketch-output.txt`.</li><li>K2 = `d49536b 56 outside-root-lanes-since-d49536b 0`: the sketch's 55 entries plus the new doc.</li><li>K13 `doc234:1`.</li><li>Every other K equals the planning output.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 (`a-round-356.md`) |
| A-COVER | `npx vitest run` on the 48 changed test files plus the 47 Follow files of `b-round-356/mutants/m-b3-files.txt`, merged without duplicates | all pass. B's sketch: 3625/3626 on the full suite, with only the ruled positive control red before the ruling, and 13/13 on the two new or ruled files after it (`b-round-356/precheck-full.log`, `b-round-356/sketch-new-rows.log`) |
| A-MUTANT (jsdom, scratch only, L60) | M-B1–M-B4 (§1.3) on a scratch copy of A's tree. Build the scratch with `git archive HEAD`, then `git diff` applied, then `node_modules` symlinked. Run render-budget (M-B1, M-B2) and the M-B3 file list (M-B3, M-B4) | <ul><li>Red exactly as in `b-round-356/mutants/mutant-m-b{1,2,3,4}.log`.</li><li>`store/` `git status` is unchanged.</li></ul> |
| A-PERF (production, **alone**, L38) | `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-356/perf-results/latest-interactions.json <A's latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` []; 252 rows; 84/84 asserted pass; 0 NEW.</li><li>`interact.play.start-components` and `interact.play.stop-components` (1× and 6×) equal B's sketch values (§0.3).</li><li>Every other deterministic row equals C356 (`perf-rowcmp.py` DIFF only on the four play component rows).</li><li>`durationMs` ≤ 540000, and recorded.</li></ul> |
| A-REVIEW | `code-reviewer` on the diff (3+ files) | no unruled Medium+; any code changed after the review goes back to the reviewer (L11); the Architecture note goes to B |
| A-DOC | doc 234 | TEMPLATE `## ` order (L26); l.4 `In Progress (stage 1 of 3; C round 357 PASS)` (L28); it cites only rows that exist (L26) |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-356/claims-357.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --stat` | <ul><li>Only the §1.1 files.</li><li>`ArrangementVideoDock.tsx` differs from HEAD only in where `isPlaying` comes from (C reads the hunk).</li><li>`perf/**` and `package.json` are unchanged.</li><li>The protected files are 11/11 (K6).</li></ul> |
| READ | C reads the source diff against §0.2 | <ul><li>One writer per site: the ref and the store are next to each other.</li><li>`isPlaying` is absent from the context type, the value and the deps.</li><li>StudioWorkspace has no top-level `useArrangementIsPlaying`.</li><li>MarkerRow does not subscribe.</li><li>The 7 reads use the committed ref (K5 = 0 on A's tree).</li></ul> |
| UNIT | A-COVER's command | all pass |
| MUTANT (C's own, predicted first in `c-round-357/progress.json`) | One mutant that is **not** M-B1/2/3 and that should bring back a Play re-render. Example: the Transport passes `isPlaying` down to a non-memo child, or the leaf loses its `memo`. Run render-budget, then the perf spec alone | red on the predicted rows; scratch deleted under `c-round-357/` only (L60) |
| PERF (browser, production, alone) | A-PERF's command | <ul><li>As A-PERF.</li><li>The play rows equal §0.3.</li><li>Compared with A's file and with C356.</li></ul> |
| PLAY-BEHAVIOUR (browser, dev :5173, 1440×900 and 1280×720; L48: wait for `Demo collection ready`; warm up first, L38) | Add a clip. Then, at each viewport:<ol><li>Space plays: `data-playing` true, the playhead moves over 1 s, and the transport time advances.</li><li>Space stops: the stopped text is the HEAD text from the same recipe. Also run the recipe on HEAD before A's change, or cite C356's probe.</li><li>Click a marker-row "next marker" with no marker: the playing and stopped texts both match HEAD.</li></ol> | all match HEAD |
| FOLLOW (browser, dev, both viewports) | Zoom in so that the playhead page-turns within 10 s. Then:<ol><li>Play: the timeline scrolls with the playhead (scrollLeft grows).</li><li>Manual scroll while playing: "Follow paused" status, and Follow is dashed.</li><li>Stop: Follow resumes, and the stopped status replaces the paused text.</li></ol> | the same sequence and texts as HEAD |
| VIDEO-SYNC (browser, dev, 1440×900) | `node c-round-350/video-behaviour-probe.mjs http://127.0.0.1:5173 c-round-357/behaviour-1440x900.json 1440x900` | equal to `c-round-356/behaviour-1440x900.json` except the blob `src` |
| VIDEO-FAIL-STOP (browser, dev, 1440×900; on HEAD **and** on A's tree, same script) | <ol><li>Import the hero video at 0 s through the video lane input (as in `c-round-350/video-behaviour-probe.mjs`).</li><li>Before Play, stub `HTMLMediaElement.prototype.play` to return a rejected promise.</li><li>Press Space. If the failure stops playback at once, record that text.</li><li>Also try: play from a point before the clip, make a manual scroll so the status is "Follow paused", and let the playhead reach the clip.</li></ol> | <ul><li>The final status text equals HEAD's in each variant, including the video-failure message.</li><li>`data-playing` is false.</li><li>If C cannot reach the Follow-paused variant, it says so and keeps the first variant's comparison. That is not a FAIL.</li></ul> |
| NARROW (browser, dev) | Start playback at 1440. Resize to 800×900 | playback stops; the narrow state shows (`data-playing` false) |
| G357-AUTH (browser, both viewports) | `c-round-356/auth.mjs`, copied to `c-round-357/` | as G356-AUTH. A fake-bearer 500 that fails closed while the mock is down goes under `blocked` |
| DOCS | doc 234 | <ul><li>l.4 byte-exact (L28).</li><li>7 `## ` headings in TEMPLATE order (L26).</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified:** PERF, PLAY-BEHAVIOUR, FOLLOW, VIDEO-SYNC, VIDEO-FAIL-STOP, NARROW and G357-AUTH all run here, and none needs the backend. If any of them does not run, `browserVerified` is false.

**L57: write all L57 fields** in `c-round-357.json`, and run `python3 -I tools/l57-check.py c-round-357.json c-round-357/l57-check.txt` until it exits 0.
- `assertsSpecified`: none. No perf row changes mode in this round. The new jsdom rows are RB-PB1, RB-PB2, FW-PB1 and PS1–PS3.
- `mutantsRecorded`: M-B1–M-B4 (B), plus C's own.
- `mutantRedOnSketch`: `b-round-356/mutants/mutant-m-b{1,2,3,4}.log` and `b-round-356/perf-mu-b1-results/latest-interactions.json`.
- `gateChecksRunOnSketch`: `b-round-356/precheck-full.log` (full vitest) and the sketch's tsc/Biome (`b-round-356/sketch-review.md`).
- `affectedChecksNamed`: the covering vitest files, the interactions perf spec and the Follow tests.

## 3. Neighbouring behaviour that could break
- **Follow:** the page turn while playing, pause on navigation, resume, and the "Follow paused" status. Covered by the Follow test files (§1.2) and C's FOLLOW row.
- **Status text at Stop:** `describeSpaceStart`, and the insert-marker status kinds (DP16, insert-marker tests).
- **Video dock:** sync while playing, and the stopped frame after Stop.
- **Narrow screen:** below 900 px, `StopPlaybackOnNarrow` still stops playback.
- **Marker navigation:** the "no marker before/after" message depends on whether playback is running.
- **Perf harness:** `isPlaying(page)` reads `data-playing` from the Transport [K7]. The attribute must stay.

## 4. STOP conditions (A)
- `tsc` flags a file that is neither in the 46-file list nor in §1.1.
- After rule R, a covering test fails, and §1.2 does not rule it.
- The perf run shows a deterministic components or commits row **higher** than C356, other than ones §0.3 predicts.
- `data-playing` or any accessible name changes.
- Any edit to `ArrangementVideoDock.tsx` other than the `isPlaying` source line(s).

## 5. Routed, not in scope
- **D-29z1150, gate-356 review** (`gates/round-356/review.md`):
  - Suggestions 1–2 become GATE356-I1 (info). On a flaky red, raise only the per-move video row to ≤ 11, never the max rows.
  - Suggestion 3, the length of doc 232's title, joins GATE354-ARCH-DOC232-SPLIT.
  - The Architecture note becomes the signal GATE356-ARCH-BUDGET-NOTE-TEMPLATES and is not scheduled.
- **D-29z1151, PERF-CAND-FADE-RELEASE-COMMITS** is closed as named, with no fix. Evidence: `b-round-356/fade-release-*.json`.
  - Commit 2 renders only `ArrangementStatusTextInner`, when the status preview is cleared.
  - Commit 3 is a 0-component commit after the click. Its `setState` is **not identified**, so the commit is only partly named.
  - The rows stay `record`. The `tech-lead` suggestion of `<= 3` upper bounds goes to PERF-10a-BUDGETS.
- **D-29z1152, PERF-9:** `/studio-lab` has no network stem path. The only stem fetch is the purchased collection, which only the deferred SRW-21 route reaches. So PERF-9's browser half could not run today.
  - PERF-9 keeps its scope. At its planning, `tech-lead` chooses between a mock-api collection harness and SRW-21-PLAN.
  - This is not a deferral.
- **Architecture checkpoint.** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE has had no answer since round 339. This round's 11th store reaches the ARCH-R338-STORES-PROVIDER trigger.
  - The request is repeated with question 1b in `b-round-356/root-request-arch-checkpoint.md`.
  - It is non-blocking (D-29z1153).
- **D-29z1154, next:**
  1. REGRESSION, if the next planning is on or after 2026-11-08.
  2. PERF-10a-BUDGETS: the play rows from C357's values, and the fade release `<= 3` bounds.
  3. PERF-10b: the `activeTrackId` and selection store, SIG-R322; clip click at 83 components; the C-R320-01 required rows; and the Transport play button as its own subscriber, to reach ≤ 20.
  4. PERF-9, PERF-11 … PERF-15, then STEM-LANES, SYS-1…3 and STORE-2b…5.
- **RETRO** at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Deliverables
- A: `a-round-357.md` with every §2.1 row, its evidence files under `a-round-357/`, and the code-reviewer result (3+ files; the Architecture note goes to B).
- C: `c-round-357.md`, `c-round-357.json` with all L57 fields, and evidence under `c-round-357/`.

## 7. Claims
`bash b-round-356/claims-357.sh`, run from the loop root. Planning output: `b-round-356/claims-357-planning-output.txt`. Sketch output: `b-round-356/claims-357-sketch-output.txt`.
| Tag | What it pins | Planning (HEAD) | Sketch |
|---|---|---|---|
| K1 | gate 356 published `d49536b` | `published d49536b` | same |
| K2 | HEAD, status count, root-lane delta | `d49536b 0 … 0` | scratch git `b61245b 55 … 0`; A's tree: `d49536b 56 … 0` |
| K3 | `isPlaying` state in the provider: `useState`, 2 writes, value + deps field, type field, `isPlayingRef` uses | `1 2 2 1 30` | `0 0 0 0 30` |
| K4 | the 5 consumer files and their `isPlaying` counts | Transport 6, MarkerRow 3, VideoDock 3, StudioWorkspace 10, studio-lab 3 | MarkerRow 1, StudioWorkspace 8 |
| K5 | StudioWorkspace's 7 `workspaceRef`/`current.isPlaying` reads and the Follow effect deps | `7 1` | `0 0` |
| K6 | protected files sha256 | 11 | 11 |
| K7 | **SWEEP** (roots `app/**` tests, `perf/**`, `e2e/**`): test files naming `isPlaying`, probe-value reads, perf hits (all `isPlaying(page)` → `data-playing`), e2e | `48 262 15 0` | `49 267 15 0` |
| K8 | budgets: 252 rows, 84 asserted, the 5 `interact.play.*` rows `record` | as printed | unchanged |
| K9 | zustand 5.0.16 present | `1` | `1` |
| K10 | `regression-last.json` date | 2026-11-05 | — |
| K11 | every cited `b-round-356/` artifact exists (L56) | `0 missing` | — |
| K12 | render-budget: the ruled test's line, parent `> 0` loops (HEAD: the Play loop; sketch: only the setStatus positive-control loop), RB-PB rows, Transport `> 0` asserts | `314 1 0 1` | `322 1 2 3` |
| K13 | new files, doc 234 free, `data-playing` in the perf lib and the Transport | `0 0 2 1` | `3 0 2 1` |
| K14 | sweep list 46, helper users, raw `useArrangement()` test files, patch sha256 OK | `46 0 116 2` | `46 46 71 2` |
| K15 | the status reducer returns the previous entry for unchanged functional text; FW-PB1 present; the follow-sync props interface | `1 0 0` | `1 1 1` |

C also runs the L29 grep over this task.
