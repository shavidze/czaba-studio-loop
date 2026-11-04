# Round 325: PERF-DRAG-PREVIEW stage a. Audio trim and same-lane move previews leave the React history during the gesture (preview store); doc fixes from the gate-324 review

**Planned by:** B, at the round 324 → 325 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`):
- **D-29z911: round 324 closed from evidence.** C PASS (`c-round-324.json`, `browserVerified`/`realVerified` true), gate 324 published `b925434` on both remotes. PERF-8b done, so PERF-8 is done. Closed: C-R322-01, C-R322-02, C-R323-01, C-R323-02, INFO-C323-S-GROUP-PREMISE.
- **D-29z912: C-R324-01 ruled (a).** K19 = 4 is the correct output of the round-324 command. The five §2.5 ids of `tasks/round-322.md` are present and the budgets diff only adds lines (C's direct check). It was a B-spec defect. No retroactive FAIL. Closed `closed_ruled`. Doc 231 records the ruling in this round (§5).
- **D-29z913: gate-324 review.** S1, S2 (doc half) and S6 are Lows on docs that this round's contract builds on, and they cost little, so §5 fixes them now. S3, S4 and S5 are PERF-10 signals. The Architecture note joins A-R322-ARCH-SELECTION-WRAPPERS and the checkpoint request (D-29z915).
- **D-29z914: REGRESSION is not due.** `regression-last.json` is 2026-11-02 [K9], so it is due on or after 2026-11-05; today is 2026-11-04. This round is PERF-DRAG-PREVIEW. Round 326's planning will almost certainly fall on or after 2026-11-05, which makes round 326 the REGRESSION round.
- **D-29z915: architecture checkpoint requested** (`b-round-324-checkpoint-request.md`; PERF-8 boundary). It is non-blocking.
- **D-29z916: PERF-DRAG-PREVIEW is split.** The full target is unchanged: fade, trim and move, ≤ 15 committed components per move, and 1 history entry per gesture.
  - **Stage a (this round):** trim (start and end) and same-lane single-clip move of **audio** clips.
  - **Stage b:** fade drags. They write status on every move (`setStatus` is provider state [K6], `fadePreview` [K20]).
  - **Stage c:** group move and cross-lane move (lane ghosts are provider state [K6]), video clips, and the move that extends the project end (§0.2).
- **D-29z917: budgets stay `record` this round** (L58: B ran no feature sketch). This follows the PERF-8b precedent (D-29z891/D-29z893). The pass criterion is the component-name row (DRAG-NAMES) and the unit rows with their mutants. At round 327 planning, B turns the per-move rows into asserts from A's and C's saved numbers.
- **D-29z918: lesson L56 gains the C-R324-01 clause** (a count claim runs on the sketch that holds the ids it counts). `lessons.md` stays at 59 lines.
- **D-29z919: contract A** (tech-lead consult): `historyRef` keeps tracking the preview, and only the React publication moves to a store (§2.1).

**Read first:** `lessons.md`: L11, L12, L23, L26, L28, L29, L34, L37, L38, L49, L56, L57, L58.

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§9).

## Baseline
- **HEAD `b925434`**, gate 324 published [K1]. The working tree is clean (0 status entries) [K2]. Protected files: 11/11 OK [K8].
- No dependency change. zustand 5.0.16 is already installed (gate 318 deps). No notices change.

## 0. Why this round

### 0.1 The premise, measured at HEAD (L37)
- **Production** (`c-round-324/perf-atree-results/latest-interactions.json`, i.e. C's run on the tree that is now HEAD; summary `b-round-324/head-drag-perf-rows.txt` [K14]):

  | Row | Value | Mode |
  |---|---|---|
  | `interact.drag.trim.{stopped,playing}.move-components-per-move` | 106.2 | record |
  | `interact.drag.move.{stopped,playing}.move-components-per-move` | 105.317 | record |
  | `…move-components-max` (trim / move) | 106 / 107 | record |
  | `commits-per-move` | 1.967 | record |
  | `…playing.move-restarts` | 0 | record |
  | `…playing.release-restarts` | 1 | record |

  All 48 trim and move rows are `record` [K15].
- **Dev component names** (`c-round-324/probe/names-a.json`, C's probe `c-round-324/probe/c324-names-probe.mjs`; summary `b-round-324/head-drag-names.txt` [K14]):
  - Every trim and move commit renders `ArrangementProvider` and `StudioWorkspace`, then the whole tree: Transport, Library, VideoDock, Overview, Ruler, TempoRow, LoopBrace, all 4 `ArrangementLane`s and their meters, the DetailPanel chain, Master, ExportDialog and ShortcutSheet. That is 106 fibers.
  - Each such commit is followed by a 2-fiber commit (`ArrangementDetailContentInner`'s layout effect).

### 0.2 Mechanism (consults: `tech-lead`, `performance-optimizer`; FACT unless marked)
- Each move calls `previewArrangement(next)`. That function writes `updateHistory({ ...historyRef.current, present: next })` [K3], which calls `setHistory`, so the whole context value changes.
  - It is called at 7 sites in `ArrangementClip.tsx` [K5]. Other callers are in `ArrangementClipEnvelope.tsx` and `ArrangementMarkerRow.tsx`, and one is in the context itself (`previewLoopArrangement`) [K7].
- The clip's pointerup commits `commitArrangement(getArrangement(), …)` (2 sites [K4]). `getArrangement()` returns `historyRef.current.present`.
  - The loop-wrap resync (2 sites) also reads that ref, and so does the video-import wait on `previewActiveRef` [K12].
  - In total the context reads `historyRef.current.present` 53 times [K28].
  - So the ref **must keep tracking the preview**, or a commit becomes a no-op and a loop wrap during a drag schedules the pre-drag audio.
- Every `ArrangementLane` reads `arrangement` from `useArrangement()` [K10] and is not memoised [K25]. Any `StudioWorkspace` render re-renders every lane.
- `timelineSeconds` comes from `projectEnd` [K11], and `projectEnd` comes from the React history. The overview `extent` changes on every move that moves the project end, and so does the transport's project-end readout.
  - In the harness move scenario (one clip, dragged right), every move moves the end.
  - Keeping the end live (required, §1) therefore re-renders `StudioWorkspace`, and through it every lane, on those moves. **Inference:** the harness move rows will not fall much in stage a. Stage c handles that case (lane memo or extent through the store), together with the arch-checkpoint answer.
- Clip previews never call `syncPlayback`: `previewArrangement` has no call and `previewLoopArrangement` has one [K27]. So `move-restarts` is 0 at HEAD and must stay 0.

### 0.3 What changes for the user
Nothing visible. Every frame of a trim or move shows what HEAD shows: clip geometry, overview bar, selected-clip readout, detail panel, project end, ruler width and status. The Studio only renders less while dragging.

### 0.4 Consults, reference, screen budget
- **Consults:** `tech-lead` (contract A, the subscriber set, a separate function rather than a flag, and the risks) and `performance-optimizer` (row ids, the ≤ 15 estimate of about 9–15 when `StudioWorkspace` does not render, and the assert/record split). Their answers are summarised in `b-round-324.md` §3.
- **Reference-first:** not applicable. This is a performance round with no behaviour change.
- **Screen budget:** nothing new is visible (L39 not triggered).

## 1. Rulings
1. **Contract A (D-29z919).** A new context function `previewClipGeometry(next: Arrangement)` does the following:
   - sets `previewActiveRef.current = true`;
   - sets `historyRef.current = { ...historyRef.current, present: next }` (ref only, **no `setHistory`**);
   - publishes `next` to a new per-provider preview store.

   `previewArrangement` keeps its HEAD body for every other caller.
2. **Call sites (stage a).** Only the same-lane, non-group, single-clip move preview of an **audio** clip (the `moveClip` success branch) and the `trimStart`/`trimEnd` preview of an **audio** clip call `previewClipGeometry`.
   - Video clips (`isVideo`) keep `previewArrangement`, because the VideoDock effects depend on the React arrangement.
   - These stay on `previewArrangement` with their HEAD behaviour: fade, group move, cross-lane, every revert to `gesture.before`, envelope, marker and loop brace.
3. **Clearing.** `updateHistory` clears the preview store in the same call as `setHistory`. Every history write (commit, revert to `before`, undo/redo, restore) therefore clears it in the same tick.
4. **Convergence.** When the gesture count reaches 0 (the release in `beginPointerGesture`), if `historyRef.current` differs from the last React-state history, the provider calls `setHistory(historyRef.current)` and clears the store.
   - This covers a clip unmounted mid-drag, whose cleanup releases without reverting.
   - The end state must equal HEAD's end state for the same gesture.
   - **Order on a normal release:** `finishGesture` calls `gesture.release()` (count → 0) before `commitArrangement` [K30]. Convergence therefore fires first and the commit overwrites it, inside the same pointerup event, so React batches both into one commit. A relies on that batching and adds no flush. D-NOFLASH guards it.
5. **What shows the preview live.** Each of these reads `preview ?? committed` with a selector, so a component renders only when its own slice changes:
   - the dragged clip's lane: a per-lane selector with a shallow compare over clip identity (`replaceClip` keeps untouched clips as the same objects [K26]). This also keeps the harness liveness rows live: they read the clip's `data-clip-start` [K23];
   - the overview bars and extent;
   - the selected-clip readout;
   - the detail panel (HEAD shows it live);
   - the project end: `timelineSeconds`, `extent` and the transport's `arrangement-project-end` readout.

   The project end is a **primitive** selector. When it changes, the workspace renders as at HEAD. When it does not change (for example `trimStart`, or a move left of the end), nothing outside the list above renders.
6. **No visible change, no new persistent text, no new status text.** Blocked trims and moves keep their HEAD `setStatus` calls. A repeated identical text is already ignored.
7. **Behaviour stays HEAD's:** snap, Alt, edge snap, marker snap, Undo/Redo, Esc/abort, the double-click guard, the status texts and the export.

## 2. Contract

### 2.1 Files (grants, §4)
- `app/lib/arrangement/preview-store.ts` (new; does not exist yet [K17]): a per-provider zustand vanilla store `{ preview: Arrangement | null }`.
  - `setPreview` ignores the write when the value is identical (`Object.is`).
  - `clearPreview` exists.
  - Hooks: `useArrangementPreviewStore()`, plus selector helpers for lane clips (shallow), project end (primitive) and the selected clip. These follow `range-store.ts` and `selection-store.ts` (the `useState(() => create…)` pattern in the provider).
- `app/contexts/ArrangementContext.tsx`: the store, `previewClipGeometry`, §1.3 and §1.4. `previewClipGeometry` joins the context type and value next to `previewArrangement`.
- `app/components/arrangement/ArrangementClip.tsx`: §1.2 call sites only. The prop is passed like `previewArrangement`.
- `app/components/arrangement/ArrangementLane.tsx`: the per-lane clip selector, and passing `previewClipGeometry` to the clip view.
- `app/components/arrangement/StudioWorkspace.tsx`: the overview, readout and detail wrappers read preview-or-committed; the `projectEnd` primitive selector for `timelineSeconds`/`extent`. The existing names (`…Inner` + `memo`) **must not change**: render-log tests key on them (L23 memo clause).
- `app/components/arrangement/ArrangementTransport.tsx`: the project-end readout reads the primitive selector. Nothing else changes.
- `app/components/arrangement/ArrangementOverview.tsx`: only if the overview wrapper cannot live in `StudioWorkspace.tsx`. A says which.
- Tests: new `app/lib/arrangement/__tests__/preview-store.test.ts` and `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` (§2.2), plus §2.3's pre-ruled edits.
- `perf/budgets.interactions.json`: §2.4 only.
- Docs: `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (new, number 232 is free [K17]); doc 168, the whole `## მეტრიკები` section (L34); docs 230 and 231 per §5.

### 2.2 Unit rows (jsdom; each assert row has a mutant A runs on a scratch copy)
| Row | Setup → action | Expected | Mutant that turns it red |
|---|---|---|---|
| DP1 | Store alone | `setPreview(x)` twice notifies once; a lane selector for track B is not notified when only a track-A clip changes; `clearPreview` notifies once | MU-NO-SHALLOW (plain `filter` selector) |
| DP2 | Workspace with 2 audio clips on 2 lanes; trimStart drag on clip 1, 3 pointer moves, render log cleared after the first move | Per move: `ArrangementProvider` 0, `StudioWorkspace` 0, `ArrangementTransport` 0, `ArrangementLibrary` 0, and the other lane's `ArrangementLane` 0. Positive control in the same `it`: the dragged clip's view renders > 0 | MU-PREVIEW-THROUGH-HISTORY (`previewClipGeometry` calls `updateHistory`) |
| DP3 | Same, then pointerup | Exactly 1 new history entry; Ctrl+Z restores the original start/length; the store is `null`; the context `arrangement` equals `getArrangement()` | MU-NO-CLEAR-ON-UPDATE (`updateHistory` does not clear) |
| DP4 | trimStart drag, then a window `blur` mid-drag | The clip is back at its original geometry; no history entry; `isArrangementPreviewActive()` false; store `null` | — (regression row) |
| DP5 | Same-lane move of an audio clip by 3 moves | Mid-drag: `getArrangement()` shows the moved start while the context `arrangement` still shows the original (contract A); after pointerup both show the moved start | MU-REF-NOT-TRACKED (`previewClipGeometry` skips the `historyRef` write) |
| DP6 | trimStart drag | The selected-clip readout text, the detail panel start/length and the overview bar width change between move 1 and move 3 | MU-READOUT-COMMITTED (the readout reads the committed arrangement) |
| DP7 | trimEnd drag past the project end | `arrangement-project-end` text changes between move 1 and move 3 | MU-END-COMMITTED (the end selector reads the committed arrangement) |
| DP8a | Context level (`ArrangementContext.test.ts` style, through the context API): `claimPointerGesture(…)`, then `previewClipGeometry(x)`, then the returned release, with no commit | The context `arrangement` equals `x` (= `getArrangement()`, as at HEAD, where the preview had already been set into React state), and the store is `null` | MU-NO-CONVERGE (remove §1.4) |
| DP8b | Move back to the start, then pointerup | No history entry. The store is `null` and the context `arrangement` equals `getArrangement()`. Here `commitHistory` sees equal content and returns `{ ...history, present: before }` [K24], so `updateHistory` runs and clears the store | MU-NO-CLEAR-ON-UPDATE (shared with DP3) |
| DP9 | Fade-in drag and a video clip move (old path) | The provider renders per move, as at HEAD. Status text equals HEAD's | — (guards §1.2) |

- **DP8a** is the definite §1.4 trigger. A real mid-drag unmount is a code-reviewer check, not a row.
- **Render-log names:** use the project form (`function XInner` + `const X = memo(XInner)`) for any new memoised component, and show every new name is live (> 0) in some row (L23).

### 2.3 Existing tests (pre-ruled pattern; any other test change is a STOP)
- **Covering set:** the 44 `__tests__` files in `b-round-324/pointer-move-test-files.txt` (`fireEvent.pointerMove`, `pointerMove(`, `userEvent.pointer`, `'pointermove'`; 50 entries, 6 of which are source files) [K22], plus the 6 files that name `previewArrangement` [K18], `render-budget.test.tsx`, `selection-wrappers-render.test.tsx`, `context-hygiene.test.tsx`, `ArrangementContext.test.ts`, `status-lifetime.test.tsx`, and the three files that name `arrangement-project-end`.
- **Pre-ruled pattern P1.** A test that reads the context `arrangement` (or a value derived from it outside the §1.5 subscribers) **mid-gesture** of an audio same-lane trim or move, and expects the preview, is rewritten to read `getArrangement()` or the DOM. The `expect(` count of that file does not fall. A lists each hunk old → new.
- **Pre-ruled pattern P2.** One of the 8 consumer-count positive controls [K29] (`counts.get('X') ?? 0).toBeGreaterThan(0)`) can become false because its trigger was a trim or move preview. If so, apply the round-324 §2 pattern: move the control to a consumer that still renders on that trigger, then add a `toBe(0)` row on the old subject and a mutant.
- **Expect rule:** `expect(` per file ≥ HEAD (`b-round-321/expect-count.py`). A test whose only change removes an assertion is a Medium (L23/10a).

### 2.4 Harness rows (`perf/budgets.interactions.json`)
- `interact.drag.trim.playing.move-restarts` and `interact.drag.move.playing.move-restarts` change from `record` to **assert `== 0`**. Their `.6x` copies stay `record`.
  - This is a regression guard, measured 0 at HEAD (§0.1). The mutant that turns it red is a `previewClipGeometry` that calls `syncPlayback`. A runs it on a scratch production build only if time allows; otherwise the code-reviewer checks that no `syncPlayback` call is reachable from `previewClipGeometry`.
- Every other row stays as it is (`record`, `budget: null`). Nothing else in the file changes. No harness scenario changes.

### 2.5 Doc 232 (Georgian, technical terms in English; TEMPLATE's 7 headings in order, L26; l.4 exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 325 PASS)`, L28)
It records:
- contract A;
- the subscriber list;
- §1.4 convergence;
- the stage split;
- A's measured numbers (HEAD vs A);
- the stage-c reason (the project end, §0.2).

Doc 168's `## მეტრიკები` section gains one row or paragraph with this round's trim and move numbers.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-324/claims-325.sh` from the loop root. The output equals `b-round-324/claims-325-planning-output.txt`. Any difference is a STOP |
| A-IMPL | §1, §2, §5 |
| A-CLAIMS-AFTER | K3 1 (`previewArrangement` keeps its body), K15 `48 46` (two rows asserted), K17 `present 1`, K8 11, K13 shows doc 232 only, K16 `0 0` (§5). A saves the output as `a-round-325/claims-after.txt` |
| A-TYPE / A-LINT | `npm run typecheck` rc 0; `npm run lint` rc 0 |
| A-UNIT | `npx vitest run` on the two new files and the §2.3 covering set; all pass. Also `perf/lib/report.test.ts` through a scratch vitest config that includes `perf/**`. A reports the counts |
| A-EXPECT | `python3 -I b-round-321/expect-count.py` HEAD vs after: no file loses an `expect(` |
| A-MUTANTS | Run on a scratch copy, never in `store/`. Each of the 7 named mutants in §2.2 turns its row red; restored, every row is green. A saves `a-round-325/mutants.py` and the logs |
| A-PERF (alone, L38) | Production builds of HEAD (`git archive b925434`) and of A's tree in scratch folders; `perf/studio-lab-interactions.perf.spec.ts` once each. A reports every trim and move row for both builds and `failures`. If the 1× `trim.stopped.move-components-per-move` is not strictly below HEAD's, that is a STOP with the per-component breakdown |
| A-NAMES (dev) | `c-round-324/probe/c324-names-probe.mjs`, copied to `a-round-325/`, on A's tree: the DRAG-NAMES expectation (§3.2) holds for `trim-moves` |
| A-REVIEW | `code-reviewer` (3+ files). It checks: <ul><li>no selector builds a new array or object without an equality function;</li><li>`previewClipGeometry` writes the ref, sets `previewActiveRef` and never calls `setHistory` or `syncPlayback`;</li><li>every `updateHistory` path clears the store;</li><li>§1.4 exists;</li><li>the render-log names are unchanged;</li><li>fade, group, cross-lane and video stay on `previewArrangement`;</li><li>`previewClipGeometry` is a stable `useCallback` (the clip view is `memo`).</li></ul> A Medium+ inside the grants is fixed and re-reviewed (L11). Architecture notes go to B |

### 3.2 C's rows
C writes `c-round-325.md` and `c-round-325.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified` = 10 (DP1–DP7, DP8a, DP8b, DP9) + 1 (DRAG-NAMES) + 2 (restart asserts) = 13;
- `mutantsRecorded` = 7;
- `mutantRedOnSketch` = `null`, reason "B built no feature sketch; mutants are run on A's tree (D-29z917)";
- `mutantRedOnTree` (C's re-run on A's tree);
- `gateChecksNamed` = 6;
- `gateChecksRunOnSketch` = 0, reason "no B sketch";
- `chainHeadGateRunGreen` = `null`, reason "not a fix-up chain".

**Builds.** Production builds of HEAD `b925434` (`git archive`) and of A's tree, each in its own scratch folder. Never build inside `store/`. A second dev server for HEAD gets its own Vite `cacheDir` (L38). Warm up in a browser before any timed probe.

**Browser rows** run on `/studio-lab` at 1440×900 and 1280×720, unless the row says otherwise. Each behaviour row compares A with HEAD: the same visible result and the same status text at each sampled step.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status`, the protected sha | Only §2.1 paths changed; protected 11/11 |
| CLAIMS | `bash b-round-324/claims-325.sh`, first (L56) | As A-CLAIMS-AFTER; every other line equals `claims-325-planning-output.txt` except K2 (A's entry count) |
| UNIT | A-UNIT's files on C's scratch; the 7 mutants; at least one mutant of C's own | All pass; each mutant red; restored green |
| EXPECT | `expect-count.py` HEAD vs A | No file loses an `expect(` |
| DRAG-NAMES (dev) | `c324-names-probe.mjs` (copied to `c-round-325/`) on HEAD and A | **HEAD:** every `trim-moves` move commit contains `ArrangementProvider`, `StudioWorkspace`, `ArrangementTransport`, `ArrangementLibrary`, `ArrangementRuler`, `ArrangementMaster`, `ArrangementExportDialog`, `ArrangementShortcutSheet` and 4 `ArrangementLane` (non-vacuous; `b-round-324/head-drag-names.txt`). **A:** no `trim-moves` move commit contains any of those 8 names, and `ArrangementLane` ≤ 1 per commit. `move-moves` and `fade-moves` are **record**: C lists the names per commit for both trees |
| PERF-DRAG (alone, L38) | The interactions spec on both builds | `failures` [] on both. `interact.harness.drag-trim-live` and `interact.harness.drag-move-live` = 1 on both (they read `data-clip-start` mid-drag [K23]). The two §2.4 asserts = 0. The 1× trim per-move value on A is strictly below HEAD (record the ratio). Move rows: record. **Any rise in any other deterministic row is a finding**, unless it is a §1.5 subscriber name at ≤ 1 per name per commit (C checks names with the probe) |
| PERF-LOAD (alone) | `studio-lab.perf.spec.ts` on both builds | `failures` []; deterministic rows equal, or a rise explained by the new always-mounted subscriber components (A names and counts them; C checks) |
| D-TRIM | trimStart and trimEnd drag on an audio clip, stopped and playing, 3 sampled moves + release | At each sample: clip left/width, overview bar, selected-clip readout text, detail panel start/length, project-end text, ruler width and status equal HEAD |
| D-MOVE | Same-lane move of an audio clip: to the left, to the right past the project end, with snap on, with Alt held | As D-TRIM |
| D-MIXED | (i) Same lane → another lane → back → release. (ii) Same lane → another lane → release | Ghosts, the lane-move source mark, the final placement, the history label and the status equal HEAD |
| D-ABORT | trim drag, then window blur | The clip is back; there is no history entry (Undo does what it does at HEAD) |
| D-UNDO | After each D-TRIM and D-MOVE release: Ctrl+Z, then Ctrl+Shift+Z | One entry per gesture; the geometry is restored and redone as at HEAD |
| D-NOFLASH | trim and move: the clip's box read on each of the 5 animation frames after pointerup (rAF) | The clip never shows its pre-drag geometry after release, on both trees |
| D-OLDPATH | Fade-in drag, group move (2 clips), video clip move | Equal to HEAD (§1.2) |
| D-LOOP | Playing with an enabled loop over the clip; trim across at least one loop wrap; release | No page error; playback continues; the clip and status after release equal HEAD. Audible correctness during the wrap is `record` (DP5 pins the contract) |
| EXPORT | A scripted sequence (trimStart, trimEnd, move right, Undo, Redo) and then the project WAV export, on both trees, both viewports | All 4 files byte-identical (sha256) |
| DOCS | §5 lines, doc 232 headings (L26) and l.4 (L28), doc 168 section | As specified |
| G325-AUTH | As G324-AUTH, both viewports | `/studio-lab` anonymous workspace + demo badge, `auth_user` null; `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`; `/api/studio-token` with no header → 401 |

**Gate rows.** C does not claim these; they go under `"gate"`: the full vitest, the build in `store/`, Biome, typecheck, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if every row from DRAG-NAMES through G325-AUTH ran at its stated viewports. The perf specs run at their own fixed viewport.

**Ableton conformance:** not applicable. The behaviour is unchanged, and there is no new reference.

## 4. Grants
A edits only the §2.1 paths and the §2.3 pre-ruled edits.
- Not `package.json` or the lock.
- No other `app/**` or `perf/**` file.
- No config, no protected file, no loop artifact.
- If another file seems to need changing (for example `ArrangementDetailPanel.tsx` or `ArrangementVideoDock.tsx`), A STOPs and names it.

## 5. Doc fixes from the gate-324 review (D-29z913)
- **Doc 231, `## პრობლემები და გადაწყვეტები`:** the K19 problem line [K16, first value] gets B's ruling (D-29z912) as its solution, so no open question remains under the `Completed` status.
- **Doc 231, `## მიდგომა`** gets two sentences:
  - the async rule: code after an `await` does not select a clip it just created until the history update is visible, or it defers the selection write;
  - the selector-key assumption: clip ids never contain U+0000.
- **Doc 230, `### გადაწყვეტილებები (rulings)`:** the English D-29z860 line [K16, second value] is rewritten in Georgian in the `- **D-29z860:**` format. Its meaning is corrected: since PERF-8b, range and selection are both external stores and commit together in discrete events; after an `await` they commit separately from the React history.
- Docs 230/231 l.4 stay unchanged. Nothing else in either doc changes. After A: K16 = `0 0` (the old K19 line is reworded so it no longer contains `claim K19`, and the English line is gone). If A keeps the phrase "claim K19", A states the new K16 value in A-CLAIMS-AFTER.

## 6. Neighbouring behaviour at risk (C probes)
- **A one-frame jump** at pointerup if the store clear and `setHistory` land in different commits (D-NOFLASH), including the deferred `setTimeout` abort path.
- **Ref and React state split** after an unmount or abort (DP8, D-ABORT).
- **The loop-wrap resync during a drag** must still read the preview (DP5, D-LOOP).
- **The video-import wait** depends on `previewActiveRef` (§1.1).
- **Range and selection stores, the position store, the meters and the faders:** they must not change. PERF-LOAD shows this.
- **Keyboard edits during a gesture** are refused at HEAD (`refuseEditDuringGesture`) and stay refused.

## 7. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-325.md` and changes nothing else when:
- A-CLAIMS differs;
- the 1× trim per-move value is not strictly below HEAD's, or DRAG-NAMES fails on `trim-moves` (A reports the per-commit names);
- a file outside §2.1 needs a change;
- a test change outside P1/P2 is needed;
- a HEAD behaviour cannot be kept (a frame, a status, an undo entry).

## 8. Next and commit readiness
- **After C PASS and the gate:** PERF-DRAG-PREVIEW stage a is done; root publishes the §2.1 paths on top of `b925434`.
- **Round 326:** REGRESSION (due on or after 2026-11-05). It carries C-R318-06 and CAND-R323-FOLD-CLEARS-SELECTION with a Live 12 reference question.
- **Then:** PERF-DRAG-PREVIEW stage b (fades), stage c (group, cross-lane, video and the project-end move), then PERF-9 … PERF-15 and the rest of the queue.
- **Round 327 planning** turns the stage-a per-move rows into asserts from the saved numbers (D-29z917).

## 9. Claims (L29 + L56)
Run `bash b-round-324/claims-325.sh` from the loop root (`CLAIMS_STORE` may override the store path). Planning output: `b-round-324/claims-325-planning-output.txt`.

| Tag | Claim | Now (`b925434`) | After A |
|---|---|---|---|
| K1 | gate 324 status, commit | published b925434 | same |
| K2 | HEAD, status entries | b925434 0 | b925434, §2.1 count |
| K3 | `updateHistory({ ...historyRef.current, present: next });` in the context | 1 | 1 |
| K4 | `commitArrangement(getArrangement(),` in `ArrangementClip.tsx` | 2 | 2 |
| K5 | `previewArrangement(next|gesture.before);` in `ArrangementClip.tsx` | 7 | listed by A |
| K6 | status `useReducer`; `clipLaneDrag` `useState` in the provider | 1 1 | 1 1 |
| K7 | `previewArrangement(` callers outside tests, per file | Clip 7; Envelope 2; MarkerRow 2; Context 1 | listed by A |
| K8 | protected OK | 11 | 11 |
| K9 | regression-last | 2026-11-02 | same |
| K10 | `arrangement` destructured from `useArrangement()` in `ArrangementLane` | 1 | listed by A |
| K11 | `Math.max(projectEnd + TIMELINE_TAIL_SECONDS, viewportSeconds)` | 1 | listed by A |
| K12 | loop-resync ref reads; `previewActiveRef` wait | 2 1 | 2 1 |
| K13 | `In Progress (stage` docs | none | doc 232 |
| K14 | cited artifacts exist | checked | checked |
| K15 | trim/move rows; how many `record` | 48 48 | 48 46 |
| K16 | doc 231 `claim K19`; doc 230 English D-29z860 line | 1 1 | 0 0 |
| K17 | `preview-store.ts`; doc `232-` | absent 0 | present 1 |
| K18 | test files naming `previewArrangement` | 6 | listed by A |
| K19 | `tasks/round-324.md` equals the before-copy | archive-equal | same |
| K20 | `fadePreview(` calls; `publishLaneGhosts(gesture, []);` | 1 3 | 1 3 |
| K21 | `resolveSnapStep(snapSeconds, gridSeconds, event.altKey)` | 1 | 1 |
| K22 | pointer-move files equal the saved list; count | same 50 | listed by A |
| K23 | clip `data-clip-start`; the interactions spec reads it | 1 2 | 1 2 |
| K24 | `commitHistory` equal-content branch | 1 1 | 1 1 |
| K25 | `export function ArrangementLane(`; `memo(ArrangementLane` | 1 0 | listed by A |
| K26 | `replaceClip` keeps untouched clips | 1 | 1 |
| K27 | `syncPlayback` in `previewArrangement`; `syncPlayback(next)` in `previewLoopArrangement` | 0 1 | 0 1 |
| K28 | `historyRef.current.present` reads in the context | 53 | listed by A |
| K29 | consumer-count positive controls in `app` | 8 | ≥ 8, listed by A |
| K30 | `finishGesture` order | release-before-commit | same |
