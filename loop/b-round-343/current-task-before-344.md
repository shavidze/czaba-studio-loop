# CURRENT TASK — Round 343: PERF-DRAG-PREVIEW stage c4-ii. A group move previews through the store, so dragging two or more selected clips no longer re-renders the provider and the whole workspace on every move. A collapsed group's overview still follows the drag. The group perf rows become asserts

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 342 → 343 planning.

## Dispatch as round 343 (B, 2026-11-05; D-29z1075 … D-29z1078)
- **D-29z1075: the regression is closed.** Round 342 is PASS from C's evidence (`c-round-342.json`):
  - all 12 rows of the closed list have an allowed result (9 PASS, 3 recorded);
  - 0 new bugs and 0 Medium+;
  - `browserVerified` and `realVerified` are true.
  
  REGRESSION-ROUND-2026-11-05 ran in rounds 340–342 and is now done. `regression-last.json` = 2026-11-05 / round 342, so the next regression is due on or after 2026-11-08.
- **D-29z1076: oracles recorded for the next regression.**
  - POSCTL: `c-round-342` run, `valid=false`, `starts=1` at both viewports.
  - FONT-PIXEL baseline: `c-round-341/out/fonts/`.
  - The three re-seen Lows (C-R186-02, C-R301-01, C-R331-01) are already deferred and stay so.
- **D-29z1077: this task is the c4-ii package, unchanged in substance.** The baseline is still `99a5912`: gates 340, 341 and 342 were `skipped` (no change). So the carry-forward needs no re-measurement, as the draft's rule (1) says. B checked this at this planning:
  - `git apply --check`: 3/3 OK on `99a5912`;
  - `b-round-339/claims-340.sh` output equals `claims-340-planning-output.txt`, before `regression-last` changed;
  - round 341's RR-PERF on this HEAD gave rowcmp 0 DIFF against `c-round-339`, so the perf oracle stands.
  
  Changes from the draft:
  - "round 340" becomes 343 in the doc and budget text;
  - the budgets patch is regenerated as `b-round-342/sketch/budgets.patch.txt` by `b-round-342/sketch/apply-budgets-343.py`. It applies cleanly; its diff to the old patch is the note text and the git header only; K6 on the patched tree is `219 26 12 55 10`;
  - the claims script is `b-round-342/claims-343.sh`, because K8 moved to 2026-11-05.
- **D-29z1078: the auth oracle follows reality.** The draft's fake-Bearer expectation of 500 is replaced by **403 while the mock is up**, as C measured in rounds 341 and 342. 500 is accepted only when the mock is down.
- `context/head-sha.txt` now reads `99a5912`. The "still says 662ed42" line in the history block below was true at the round-340 planning only.
- The scratch trees under `/home/runner/b339-scratch/` and `/home/runner/b342-scratch/` do not survive the job. Acceptance depends only on files in `b-round-339/` and `b-round-342/`.


**Planned by:** B. The package was written at the round 339 → 340 planning (2026-11-04, 23:2x UTC). It was held back while REGRESSION-ROUND-2026-11-05 ran (rounds 340–342), and is dispatched now at the round 342 → 343 planning (2026-11-05), **D-29z1077**.



**History: decisions of the round-340 planning** (`backlog.json` v298 → v299, D-29z1049…D-29z1058). They are kept as written. Where they say "round 340", that was the planned round at the time. The decisions for this dispatch are in the block "Dispatch as round 343" above.
- **D-29z1049: round 339 closed as PASS, from C's evidence.**
  - `c-round-339.json` is PASS, with `browserVerified`/`realVerified` true, 10 rows and 0 bugs.
  - Gate 339 is `published` as `99a5912` on both remotes [K1].
  - **The baseline is `99a5912`.** `context/head-sha.txt` still says `662ed42`, which is stale.
  - Stage c4-i → done.
- **D-29z1050: the round-339 notes.**
  - A's reviewer Lows go to `deferred_low_polish`: A-R339-REVIEW-E-GHOST-ORDER, A-R339-REVIEW-LANE-NOTE-ORDER, A-R339-REVIEW-OVER-UNDO and A-R339-REVIEW-NULL-SETUP. So do gate reviewer #1–#3: GATE339-S1-GROUP-CLEANUP-ON-THROW, GATE339-S2-TEARDOWN-TITLE and GATE339-S3-NUMBER-PARSE.
  - A-R339-REVIEW-TEARDOWN-ABORT (Medium on B's sketch, fixed by A) is recorded as an L58-class planning signal.
  - A's and the gate's Architecture notes are signal ARCH-R339-DRAG-MEASURE-EXTRACT: the shared window and row code of `measureLaneDrag` and `measureGroupDrag`. It is not scheduled here, and it joins ARCH-R337-PERF-HELPERS-TO-LIB.
- **D-29z1051: no regression round yet.** `regression-last.json` is 2026-11-02 [K8], and this planning runs on 2026-11-04 at 23:2x UTC (2 days). The next planning, on or after 2026-11-05, is REGRESSION-ROUND-2026-11-05.
- **D-29z1052: the c4-ii premise and B's sketch evidence** (§0).
- **D-29z1053: rulings.**
  - The collapsed-group overview must follow the drag.
  - A group that contains a video clip keeps the history path (stage c5).
  - The blocked-move status stays `setStatus`.
  - GATE338-S1 closes on C's READ row.
  - `release-restarts` stays `record`.
- **D-29z1054: consults** (`b-round-339/sketch-review.md`).
  - `tech-lead`: no Critical or High. TL-3 (Medium test gap → DP56), TL-5 and TL-6 are applied.
  - TL-1 and TL-2 are HEAD-equal and become signals.
  - `performance-optimizer` agrees with the asserted set.
- **D-29z1055: budgets.** 10 group rows become `assert` (§1.3).
- **D-29z1056: tests.** DP51–DP56 are new. GS5b moves two mid-drag reads to the shown state and adds 3 asserts. No `expect(` is removed without a replacement.
- **D-29z1057: environment note.** B's sketch dev server on :5191 re-optimized `node_modules/.vite/deps`, which is shared through the scratch symlink. Root's :5173 was re-checked with B's probe afterwards: it works and shows no page errors. B used a production build of the sketch for its browser probe instead. Rule for A and C: never start a second dev server from a tree that symlinks the store's `node_modules`.
- **D-29z1058: this task.**

**Read first:**
- `lessons.md`: L10, L11, L22, L26, L28, L29, L37, L38, L49, L51, L56, L57, L58, and for C also L59 (do not end the phase with a runnable row unrun) and L60 (destructive commands only inside `c-round-343/`, with absolute paths).
- Primitives:
  - `AUDIO_ARCHITECTURE.md` (Studio);
  - `REACT_CONTEXT.md` (preview store);
  - `AGENT_DISCOVERABLE_CODE.md` (new names);
  - `FORWARDREF_COMPONENT.md` (the touched header wrapper);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests);
  - `GEORGIAN_DOCS.md` (docs).
- `prompts/studio-feature.md` applies.
- No style, colour, copy, layout or audio-graph change.

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first / product-designer / screen budget / YouTube request:** not applicable. This is a pure performance round. Behaviour and the screen are held to HEAD, and browser rows prove that (OVERVIEW-FOLLOWS, GROUP-BEHAVIOUR, BLOCKED-STATUS). Nothing persistent is added.

## Baseline
- HEAD is `99a5912` (gate 339, published), with a clean tree [K2]. Protected files: 11/11 OK [K7]. No dependency change.
- **Perf oracle:** `c-round-339/perf-results/latest-interactions.json`: 219 rows, `complete` true, 0 failures, 45 asserted. The c4-i group values are in `c-round-339/group-rows.txt` [K12].
- **Behaviour oracles:**
  - `b-round-339/probe/head-1440.json` and `head-1280.json` (collapsed overview, HEAD on :5173);
  - `b-round-338/probe/head-1440.json` and `head-1280.json` (group move, HEAD 662ed42; the app code is unchanged to `99a5912`).

## 0. Why this round, and B's evidence

### 0.1 Premise at HEAD (L37)
- **Same-lane group move.** The group branch of `handlePointerMove` in `ArrangementClip.tsx` calls `previewArrangement(next)` on every move. A cross-lane plan calls `previewArrangement(gesture.before)` [K3]. `previewArrangement` runs `updateHistory`, which writes provider state, so `ArrangementProvider` and `StudioWorkspace` render on every move.
- **The c4-i rows measure this** (`c-round-339/group-rows.txt`):
  - group `move-components-per-move` 74.781 and `move-components-max` 106 (single-clip lane drag: 24.906);
  - lane window 110.45, cross window 16.727.
- **Single-clip moves already use the store.** They go through `previewGeometry` = `previewClipGeometry` (zustand preview store; no provider state) [K5].

### 0.2 What the sketch changes (`b-round-339/sketch/source.patch.txt`)
The sketch is a `git archive` of `99a5912` with the tools `b-round-339/sketch/*.py` applied. All three patches pass `git apply --check` on HEAD.

1. **`ArrangementClip.tsx`**
   - The gesture's `group` gains `hasVideo: boolean`, computed once at press time by a new module function `groupHasVideoClip(arrangement, ids)`. It is true when any selected clip sits on a `kind === 'video'` track (`Set` lookup).
   - In the group branch, `const previewGroup = gesture.group.hasVideo ? previewArrangement : previewGeometry;`. The cross-lane plan's `previewArrangement(gesture.before)` and the same-lane `previewArrangement(next)` become `previewGroup(...)`.
   - `setStatus(GROUP_MOVE_BLOCKED_MESSAGE)`, `publishLaneGhosts`, `groupDeltaOnGrid`, the release, `endStaleClipGesture` and every single-clip branch are unchanged. After the change: `previewArrangement(gesture.before)` appears once (the stale revert) [K3].
2. **`StudioWorkspace.tsx`, `ArrangementGroupHeaderWithSelection`**
   - It gains the prop `overviewGroupId: string` (`= row.id` at the one call site). Its `overviewClips` prop is renamed locally to `committedOverviewClips`.
   - It reads `overviewClips` through `useArrangementPreview(useEqualityStableSelector(...))`:
     - when `headerProps.collapsed` is set and a preview exists: `trackGroupOverviewClips(state.preview, overviewGroupId)`;
     - otherwise: the committed array.
   - Equality is a new `sameTrackGroupOverviewClips` (clipId, trackId, start, duration, element-wise).
   - The workspace's `trackGroupOverviews` memo is unchanged [K4].
3. **What the change does not touch:** the provider, the stores, every reader that already selects the preview (lanes, overview, timeline width, detail panel, selected-clip readout, transport end) and playback (`syncPlayback` runs on commit only).
4. **L49 (a branch that replaces a call keeps its side effects).** `previewArrangement` sets `previewActiveRef`, `historyRef`, `publishedHistoryRef` and React history, and clears the store. `previewClipGeometry` sets `previewActiveRef` and `historyRef`, and writes or clears the store. The one effect dropped is the per-move publish, which is the point of the change. Release publishes through `commitArrangement` and the gesture release, the same as the single-clip path.

### 0.3 B's sketch evidence (L58)
| Check | Result | File [K#] |
|---|---|---|
| typecheck | rc 0 | `b-round-339/sketch-typecheck.log` |
| Biome | `biome format --stdin-file-path` equal and `biome lint` clean on the 4 changed `app/` files | (command in §2.1) |
| 23 affected suites (list in §2.1 A-UNIT) | 23 files, **561 passed** | `b-round-339/sketch-targeted-vitest-final.log` |
| New tests on HEAD | DP51, DP52, DP54, DP56, GS5b **red**; DP53, DP55 green (behaviour HEAD already has) | `b-round-339/unit-head-new-tests.log` |
| MU-OVERVIEW-COMMITTED (sketch without the StudioWorkspace change) | only DP54 red (`'1.000'` vs `'4.000'`) | `b-round-339/unit-mut-ws.log` |
| MU-VIDEO-STORE (`const previewGroup = previewGeometry;`) | only DP53 red | `b-round-339/unit-mut-video.log` |
| Perf, sketch source with the c4-i budgets (overlapped B's vitest; values recorded) | rc 0, 219 rows, `failures` [], 149 EQUAL / 8 DIFF vs c-round-339, 45/45 asserts | `b-round-339/perf-sketch.log`, `perf-sketch-results/`, `perf-rowcmp-sketch-vs-c339.txt` |
| **Perf, final sketch with the c4-ii budgets, run alone (L38)** | see §0.4 | `b-round-339/perf-sketch-final.log`, `perf-sketch-final-results/latest-interactions.json`, `perf-rowcmp-sketch-final-vs-c339.txt` |
| Perf mutant MU-HEAD-SOURCE (HEAD source + c4-ii budgets, run alone) | see §0.4 | `b-round-339/perf-mutant-head-source.log`, `perf-mutant-head-source/latest-interactions.json` |
| Browser, collapsed overview (B's `overview-probe.mjs`) | HEAD on :5173 and the sketch's production build on :5192, both viewports: Stems is grouped and collapsed, Ctrl+A, the Music clip is dragged 120 px. The hidden block reads `0.000` → **`3.000` mid-drag** → `3.000` after release → `0.000` after Ctrl+Z, with Undo "Move (2)" and `pageErrors` [] (identical on HEAD and the sketch) | `b-round-339/probe/head-<w>.json`, `sketch-<w>.json`, `*-mid.png` |

**The 8 DIFF rows** (every other non-wallclock row is EQUAL). These values are the same in all 3 passes at 1× and 6×:
- `interact.drag.group.{stopped,playing}.move-components-per-move` and `.6x`: 74.781 → **26.969**;
- `interact.drag.group.{stopped,playing}.move-components-max` and `.6x`: 106 → **104**.

The wallclock rows are recorded, not compared: group lane window 110.45 → 35.45, cross window 16.727 → 14. `release-commits` 1, `move-restarts` 0, `release-restarts` 2 and `drag-group-live` 1 are unchanged.

### 0.4 Final perf runs, alone (L38, L58)
Both runs ran alone (nothing else on the machine; L38), on production builds.
- **Final sketch** (`perf-sketch-final.log`, `perf-sketch-final-results/latest-interactions.json`, `perf-rowcmp-sketch-final-vs-c339.txt`): rc 0, `complete` true, `failures` [], 219 rows, **55/55 asserted pass**; vs c-round-339 **149 EQUAL / 8 DIFF / 0 NEW**, the 8 DIFF rows exactly as in §0.3 (per-move 26.969, max 104, all 3 passes, both rates). Wallclock: lane window 35.45, cross window 14.
- **MU-HEAD-SOURCE** (HEAD source + the c4-ii budgets; `perf-mutant-head-source.log`, `perf-mutant-head-source/latest-interactions.json`): rc 1, `complete` true, 4 failures = exactly the 4 `interact.drag.group.*.move-components-per-move(.6x)` asserts (74.781 > 27); 51/55 asserted pass (release-commits, move-restarts and liveness pass at HEAD too).
- A killed earlier attempt is kept as `perf-mutant-head-source-killed-by-B.log` (B's `pkill` matched its webServer; environment-invalid, not evidence).

## 1. What A changes (exactly these 7 files)
Apply `b-round-339/sketch/source.patch.txt`, `b-round-339/sketch/tests.patch.txt` and **`b-round-342/sketch/budgets.patch.txt`** (`git apply`). The budgets patch was regenerated for round 343; it differs from `b-round-339/sketch/budgets.patch.txt` only in the "(round 343)" note text and the git header. They are the final sketch. A may strengthen a hunk only with a recorded reason, and C checks it with `git apply -R --check`, as in round 339.

### 1.1 Source (2 files)
- `app/components/arrangement/ArrangementClip.tsx` and `app/components/arrangement/StudioWorkspace.tsx`, as in §0.2.
- Nothing else in `app/`. In particular, no change to `ArrangementContext.tsx`, the stores, `ArrangementGroupHeader.tsx` or `groups.ts` [K11].

### 1.2 Tests (2 files; no `expect(` removed without a replacement)
- **`app/lib/arrangement/__tests__/drag-preview-render.test.tsx`:**
  - the import adds `GROUP_MOVE_BLOCKED_MESSAGE`;
  - a new `PROJECT_END_CLIP` fixture (`c3` on music at 20 s, so a group move does not change the project end and the timeline width);
  - `describe('PERF-DRAG-PREVIEW stage c4-ii — a group move previews through the store')` with:
    - **DP51:** a same-lane group move renders neither the provider, the workspace, the transport nor the library. Both clips show the moved start while the committed state stays put. The release adds one "Move (2)" entry, and Undo restores both.
    - **DP52:** a cross-lane group move: 2 ghosts, no store preview, provider and workspace 0 over 2 moves. The release puts both clips on SFX in one entry.
    - **DP53:** a group with a video clip keeps the history preview (store null, committed moved), as at HEAD.
    - **DP54:** a collapsed group's overview block of the hidden selected clip follows the drag with 0 workspace and 0 provider renders. It keeps the new start after release and goes back after Undo.
    - **DP55:** a blocked group move shows `GROUP_MOVE_BLOCKED_MESSAGE` and leaves both clips in place. A repeated blocked move renders 0 workspace, 0 lanes and ≤ 1 provider (TL-7).
    - **DP56:** a window blur mid group move puts both clips back with no entry, no preview and preview-active false.
- **`app/lib/arrangement/__tests__/grid-snap-ui.test.tsx`, GS5b:**
  - the two mid-drag reads move from the committed `clipOf` to a new helper `shownClipOf` (`live(api).getArrangement()`);
  - new asserts: the committed `s1` stays at 4.3 and the committed `m1` at its pre-drag start, and the DOM `data-clip-start` is `5.300`;
  - every other line is unchanged [K9].

### 1.3 Budgets (`perf/budgets.interactions.json`)
- 10 rows go from `record` to `assert`, with owner `PERF-DRAG-PREVIEW-c4-ii`. Each keeps its note and gets one appended "Asserted since PERF-DRAG-PREVIEW stage c4-ii (round 343): …" sentence:
  - `interact.drag.group.{stopped,playing}.move-components-per-move` and `.6x`: `<= 27`;
  - `interact.drag.group.{stopped,playing}.release-commits` and `.6x`: `== 1`;
  - `interact.drag.group.playing.move-restarts` and `.6x`: `== 0`.
- After the change [K6]: 219 rows, 12 asserted group rows, 55 asserted in all. No other row changes.

### 1.4 Docs
- **`docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`** (granted whole):
  - l.1: append `, ეტაპი c4-ii — group move-ის preview store-ში` inside the closing parenthesis;
  - l.4 exactly: `**სტატუსი:** In Progress (stage c4-ii of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5; C round 343 PASS)` (L28);
  - l.5 (`შეცვლილი პროექტი`) stays as it is: it already names both source files and the budget file.
  - New section `### ეტაპი c4-ii: group move-ის preview store-ში (round 343, D-29z1052, D-29z1077)` after the c4-i section. In Georgian, it covers:
    - the HEAD premise and the numbers of §0.3/§0.4;
    - the video rule and why (c5);
    - the collapsed-overview reader and its reachability through Ctrl+A;
    - the blocked status ruling;
    - GATE338-S1 (only preview content can be dropped);
    - the 10 asserted rows.
  - Entries under the files, problems (GS5b reader; dev-server cache), testing (DP51–DP56, GS5b, mutants, perf) and TODO sections. TODO: replace the c4-ii line with c5 and the signals SIG-R340-*.
  - Cite only tests that exist (L26).
- **`docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`**, section `## მეტრიკები` only: the 10 group rows are asserted since round 343, with the numbers.

## 2. Acceptance

### 2.1 A rows (A runs these; the full suite and `npm run verify` are gate rows)
| Row | Command | Pass |
|---|---|---|
| A-CLAIMS | `bash b-round-342/claims-343.sh` from the loop root, before and after | pre == `b-round-342/claims-343-planning-output.txt`; final == `b-round-342/claims-343-sketch-output.txt` except K2 (hash and status count 7) and K10 (doc 232 stage token `stage c4-ii of`, `### ეტაპი c4-ii` 1) |
| A-TYPE | `npm run typecheck` | rc 0 |
| A-LINT | `npm run lint` | rc 0, warnings ≤ gate 339's count |
| A-FORMAT | `npx biome format --stdin-file-path=<f> < <f>` equal on the 4 `app/` files | equal |
| A-UNIT | `npx vitest run` on the 23 files of `b-round-339/sketch-targeted-vitest-final.log` (background-time-selection-ui, clip-envelope-ui, clip-fades-ui, clip-strings-ui, detail-panel, drag-preview-render, gesture-reentry, grid-adaptive-ui, grid-snap-clip-edges, grid-snap-edit, grid-snap-loop-drop, grid-snap-menu, grid-snap-position, grid-snap-ui, marker-snap, markers-move-ui, shortcut-sheet-ui, track-group-collapse-ui, track-groups-ui, video-fades-ui, workspace-strings-ui, status-announcement-ui, selection-store) | 23 files, 561 passed |
| A-UNIT-HEAD | the new DP rows and GS5b on a `git archive HEAD` copy with only the two test files applied | DP51, DP52, DP54, DP56, GS5b red; DP53, DP55 green |
| A-MUTANT | MU-OVERVIEW-COMMITTED on a scratch copy of A's tree (StudioWorkspace reverted to HEAD) | only DP54 red; scratch deleted |
| A-PERF | Production perf **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-339/perf-results/latest-interactions.json <A's result>` | rc 0; `complete` true; `failures` []; 219 rows; **55/55 asserted pass**; vs c-round-339: exactly the 8 DIFF rows of §0.3 with the §0.4 values, every other non-wallclock row EQUAL |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs perf/lib/report.test.ts` (GATE304-M1) | 34/34 |
| A-SCOPE | `git status` | exactly the 7 files of §1; 0 untracked; K7 11 OK |
| A-REVIEW | code-reviewer (more than 3 files) | no open Medium+; Architecture notes go to B |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `b-round-342/claims-343.sh` at start and end | equal to A's final output |
| SOURCE-SCOPE | `git diff --stat`; `git apply -R --check` of `b-round-339/sketch/source.patch.txt`, `b-round-339/sketch/tests.patch.txt` and `b-round-342/sketch/budgets.patch.txt` | 7 files; the patches reverse-apply, or only A's recorded hunks differ |
| UNIT | A-UNIT, A-UNIT-HEAD | as A |
| MUTANT | MU-OVERVIEW-COMMITTED, plus C's own mutant predicted before running (e.g. MU-VIDEO-STORE: only DP53 red) | as predicted; store untouched |
| PERF | Production build of A's tree, spec alone (L38), then `perf-rowcmp.py` vs `c-round-339` | as A-PERF |
| READ (GATE338-S1) | Read `ArrangementContext.tsx`: list every write of `historyRef.current` | only `updateHistory` and the two `previewClipGeometry` writes, so the identity reset during a group drag can drop only preview content. PASS closes GATE338-S1 |
| GROUP-BEHAVIOUR (browser, dev :5173, 1440×900 and 1280×720) | `node b-round-338/group-probe.mjs http://127.0.0.1:5173 <out> <w> <h>` | the behaviour fields (clip tracks/starts, ghosts, status, hint, Undo titles, selected count) equal `b-round-338/probe/head-<w>.json` after dropping the per-commit counts, `top`, ids and times; `pageErrors` []. **Recorded, not a pass condition** (B has no dev-build run of the sketch, D-29z1057): `providerRendered` and `workspaceRendered` per same-lane group-move commit. DP51 predicts `providerRendered` false; if it is true on every move, that is a Medium finding |
| OVERVIEW-FOLLOWS (browser, dev :5173, both viewports) | `node b-round-339/overview-probe.mjs http://127.0.0.1:5173 <out> <w> <h> <shot-prefix>` | `collapsed` 1. The hidden block's start reads `0.000`/`3.000`/`3.000`/`0.000` (before / mid / after / undo), selected `true`. The visible clip shows `3.000` mid-drag and after. Undo title "Undo: Move (2) (Ctrl+Z)". `pageErrors` []. Equal to `b-round-339/probe/head-<w>.json` and `sketch-<w>.json` (ids differ per run). Mid-drag screenshot saved |
| BLOCKED-STATUS (browser, dev :5173, 1440×900) | C's own script: Add, click the name bar, Ctrl+D, Ctrl+click the first clip (the group-probe setup), then drag the first clip's name bar 120 px left in 20 px steps | mid-drag status line = `Group move stopped — a neighbouring clip or the start of the timeline.` (`studioLaneMoveStrings.groupMoveBlocked`); both `data-clip-start` values unchanged mid-drag and after release; Undo title unchanged; `pageErrors` [] |
| PERF-LIB | the A-PERF-LIB command | 34/34 |
| G343-AUTH (browser, fresh anonymous contexts, both viewports) | copy `c-round-340/tools/g340-auth.cjs` into `c-round-343/tools/` (sink redirect is a lookup), as in round 342 row 11 | `/studio-lab` workspace and demo badge with `auth_user` null; `/studio/middle-east` "Sign in required" with 0 `audio[src]`; `/api/studio-token`: no header → 401, bare → 400, fake Bearer → **403** while the mock answers `/__mock/health` 200 (rounds 341 and 342; D-29z1078). 500 is accepted only when the mock is down, and C records the health status. No token in any body |
| DOCS | doc 232 l.1/l.4 per §1.4, c4-ii section, cited rows exist (L26); doc 168 diff only in `## მეტრიკები` | as specified |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** GROUP-BEHAVIOUR, OVERVIEW-FOLLOWS, BLOCKED-STATUS, PERF and G343-AUTH all run here. None needs the backend.
**Ableton conformance:** not applicable. This is a render-cost change, and behaviour is held to HEAD.

## 3. Neighbouring behaviour that could break
- **Group release and Undo.** The release commits `getArrangement()`, which is now the ref preview, not React state. Covered by DP51, DP52, DP56 and GROUP-BEHAVIOUR.
- **Collapsed group header.** Its overview blocks and selected marks are covered by DP54 and OVERVIEW-FOLLOWS. Groups that are not collapsed keep the committed array, so headers do not re-render.
- **Groups with video.** They stay on the HEAD path (DP53).
- **Blocked or refused moves.** The status text and lifetime are unchanged (DP55, BLOCKED-STATUS, L51).
- **Single-clip move, trim and fade.** They are untouched. The 23 suites and the 149 EQUAL perf rows cover them.
- **GS5b.** The reader changes. The asserted values (5.3, 8, the final state, one entry, Undo) are unchanged.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside K2/K10.
- A patch does not apply, or a change is needed outside the 7 files (L22: STOP with the diff).
- A-UNIT not 561/561; A-UNIT-HEAD or A-MUTANT not as stated.
- Any perf DIFF outside the 8 rows, a value other than §0.4, or a failed assert.

## 5. Not in scope
- **c5** (video clip previews, including groups with video).
- **Signals:** SIG-R340-GROUP-PERMOVE-CPU, SIG-R340-FADER-EDIT-DURING-DRAG, SIG-R340-UNMOUNT-RELEASE-PUBLISHES, ARCH-R339-DRAG-MEASURE-EXTRACT, SIG-R338-GHOST-LAYER.
- ESCAPE-CANCEL-GESTURE.
- **Deferred Lows:** A-R339-REVIEW-*, GATE339-S1…S3, A-R338-REVIEW-*.
- **Root only:** `vitest.config.ts` (GATE304-M1); commits and pushes.

## 6. Deliverables
- A: the 7 files; `a-round-343.md` with the A rows; `a-round-343/` logs.
- C: `c-round-343.md`, `c-round-343.json` (with all L57 fields), `c-round-343/`, and `c-round-343/progress.json` after every row (L59).

## 7. Claims
Run `bash b-round-342/claims-343.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). It is `b-round-339/claims-340.sh` with K12 extended by the regenerated budgets patch and the round-342 files. Expected output at HEAD: `b-round-342/claims-343-planning-output.txt`. On B's final sketch: `b-round-342/claims-343-sketch-output.txt` (the round-339 sketch output with K8 = 2026-11-05).
- **K1:** gate 339 `published` `99a5912`. Gates 340–342 were `skipped` (no change), so 339 is still the last publication.
- **K2:** HEAD's short hash and the `git status` entry count.
- **K3:** in `ArrangementClip.tsx`:
  - `previewArrangement(gesture.before);` (HEAD 2, after 1);
  - `        previewArrangement(next);` (1 → 0);
  - the `previewGroup` line (0 → 1);
  - `previewGroup(` (0 → 2);
  - `function groupHasVideoClip(` (0 → 1);
  - `setStatus(GROUP_MOVE_BLOCKED_MESSAGE);` (1 → 1).
- **K4:** in `StudioWorkspace.tsx`:
  - the `trackGroupOverviews` reader line (1 → 1);
  - `overviewGroupId` (0 → 4);
  - `function sameTrackGroupOverviewClips(` (0 → 1);
  - the preview selector call (0 → 1).
- **K5:** in `ArrangementContext.tsx` (unchanged): the identity branch (1), `previewStore.getState().clearPreview();` (2) and `selectAllClips` (1).
- **K6:** budget rows, group rows, asserted group rows, all asserted rows, c4-ii-owned rows and their budgets (HEAD `219 26 2 45 0 []`; sketch `219 26 12 55 10` with `<=27`, `==0`, `==1`).
- **K7:** protected sha, 11 OK.
- **K8:** the `regression-last` date (2026-11-05 after this planning).
- **K9:** `it('DP5[1-6] ` (0 → 6), `function shownClipOf(` (0 → 1), and the `toBe(4.3)` line for `s1` (8 → 9).
- **K10:** doc 232 l.4 stage token, its `## ` count, and the `### ეტაპი c4-ii` count.
- **K11:** `git diff --stat HEAD` line count on the spec, `perf/lib` and `app/contexts` (0).
- **K12:** every cited artifact exists (L56).

## 8. Root notes
- **Commit readiness:** after C PASS, the 7 files of §1 are one change. The gate's full verify and review apply.
- **Still open for root:**
  - checkpoint D-29z915 (SIG-R331/SIG-R332, deadline the close of c5);
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - R80-RECORDINGS-FIELD-BORDERS (`retro-336.md` §12.4).
- **Frontend-architect checkpoint:** request it at the close of PERF-DRAG-PREVIEW, after c5. Input: ARCH-R338-STORES-PROVIDER, ARCH-R339-DRAG-MEASURE-EXTRACT, ArrangementClip's gesture size.
- **Next:** c5 (video clip previews, including groups with video), then the conversions, PERF-9…15 and the rest of the queue. The next regression round is due on or after 2026-11-08 (`regression-last.json` round 342).
