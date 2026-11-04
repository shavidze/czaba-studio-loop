# C round 325: verification of PERF-DRAG-PREVIEW stage a — **PASS**

## Checkpoint 1 (offline rows)
- **CLAIMS** (`c-round-325/claims-c.txt`, run first, 0 s): equal to `a-round-325/claims-after.txt` byte-for-byte. Against the planning output only the expected lines differ: K2 `b925434 16`, K5 5, K7 Clip 5, K13 doc 232 l.4, K15 `48 46`, K16 `0 0`, K17 `present 1`, K22 (no `same`; C's own list diff: the only new entry is `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`, live count 51; the script prints the saved list length 50). Every other line equals planning. PASS.
- **SOURCE-SCOPE:** 16 status entries, all §2.1/§2.3 paths (5 source, 3 P1 test files, 2 new tests, store, budgets, 4 docs). Protected 11/11 (K8). Source hash at C start: `c-round-325/source-sha-start.txt`.
- **EXPECT** (`expect-b321-{head,a}.txt` identical; `expect-count-c.txt` over all 242 HEAD test files): no file loses an `expect(`; only the 2 new files are added (22, 68). The 3 edited files' hunks are pure P1 swaps (`clipStart`/`clipOf` → a `getArrangement()` reader) at mid-gesture asserts.
- **UNIT** (`c-round-325/unit-c.log`, scratch `/tmp/c325s`): A's 54-file covering set, 54/54 files, 1034/1034 tests (A's 1033 + DP5b).
- **DOCS:** doc 232 l.4 exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 325 PASS)`; 7 TEMPLATE headings in order. Doc 168 paragraph sits inside `## მეტრიკები` (l.105). Doc 230 D-29z860 line now Georgian in `- **D-29z860:**` format with the corrected meaning; doc 231 K19 problem has the D-29z912 solution and `## მიდგომა` item 8 has both sentences. l.4 of 230/231 unchanged vs HEAD.

## Checkpoint 2 (A-MUTANTS on C's scratch `/tmp/c325m`, PERF-DRAG alone)
- **Mutants** (`c-round-325/mutants/`, `summary.txt`): A's 7 all red, each on its named row (MU-NO-SHALLOW→DP1; MU-PREVIEW-THROUGH-HISTORY→DP2 (+DP5, DP8a); MU-NO-CLEAR-ON-UPDATE→DP3, DP8b (+DP4, DP5b, DP8a); MU-REF-NOT-TRACKED→DP5 (+DP3, DP5b, DP8a, DP8b); MU-READOUT-COMMITTED→DP6; MU-END-COMMITTED→DP7; MU-NO-CONVERGE→DP8a). C's own: **C-MU-VIDEO-NEW-PATH** (video clips use `previewClipGeometry`) → DP9 red; **C-MU-DETAIL-NO-SHALLOW** (detail selector without `useShallow`) → 10/10 red. Restored: 14/14 green, `diff -rq` scratch vs store/app empty.
- **PERF-DRAG** (`perf-interactions-{head,atree}-results/latest-interactions.json`, `perf-rowcmp.txt`; HEAD = `git archive b925434` in `/tmp/c325h`, A = copy of the work tree in `/tmp/c325s`; each spec run built its own production server; nothing else ran): `failures` [] on both, 167 rows each. Liveness `drag-trim-live`/`drag-move-live` = 1 on both. `interact.drag.{trim,move}.playing.move-restarts` asserted `== 0` on A: 0, pass. **Trim 1× per-move 106.2 → 24.583 (ratio 0.231)**, max 106 → 23. Deterministic: 94 equal, 8 lower (all trim), 19 rises: fade per-move 102.267→103.25 and max 104→105, zoom 98→99 and 243→244 (+1, attributed to `ArrangementOverviewWithPreviewInner`; names check in checkpoint 3), move per-move 105.317→106.85 (record, stage c). Wallclock `move.commits-per-move` 1.967 → 2 (record; info).

## Checkpoint 3 (PERF-LOAD alone; HEAD dev server)
- **PERF-LOAD** (`perf/studio-lab.perf.spec.ts`, both builds, alone; `c-round-325/perfload-rowcmp.txt`): rc 0 both, `failures` [] both, 321 rows each; **164 deterministic rows equal, 0 higher, 0 lower**; 157 wallclock rows record only.
- HEAD dev server: `/tmp/c325h` on :5197 with scratch `cacheDir /tmp/c325-head-vite-cache` (L38). First browser warm-up timed out on the cold compile (environment-invalid, replaced); second warm-up OK. :5173 warmed in a browser.
- Behaviour-row script `c-round-325/c325-rows.mjs`: debugged on A at 1440 until every drag was non-vacuous (clip zoomed out to ≤ 520 px so both edges are on screen; trimEnd first trims in and then extends past the project end; 2-clip selection fixed). Debug outputs were discarded; the counted runs are `rows-head.json` / `rows-a.json`.

## Checkpoint 4 (browser rows, HEAD :5197 vs A :5173, 1440×900 and 1280×720)
- **D-TRIM / D-MOVE / D-UNDO / D-NOFLASH / D-MIXED / D-ABORT / D-OLDPATH / D-LOOP / EXPORT** (`c325-rows.mjs`, `rows-{head,a}.json`, `rows-diff.py` → `rows-diff.txt`, `rows-summary.txt`, shots in `c-round-325/shots/`). The same scripted real-mouse sequence ran on both trees. At every sample (3 moves per drag, release, Undo, Redo) C read: every clip's lane, left, width and data attributes; the overview's inline geometry; the selected-clip readout; the detail panel; the project end; the ruler width; the scroll width; the status; lane-move ghosts and hints; the Undo/Redo labels; the playback state; and the loop. After normalising the random clip UUIDs, **HEAD vs A: 0 differences**, with no page errors on either tree.
  - Every drag is non-vacuous (`midChanges=True`). Covered: trimStart, trimEnd in, trimEnd out past the project end (then clamped by the source end, same status on both), move right past the end, move left, each stopped and playing; move with Snap on (grid 1 s); move with Alt; trimStart with Alt.
  - **D-MIXED (ii) at 1280:** the in-sequence attempt was vacuous on both trees (the clip header was off-screen). C replaced it with a fresh-setup run (`rows-{head,a}-mixed1280.json`, 0 diffs). It showed a ghost on Stems, the result "Move to track — Stems" and Undo/Redo working.
  - **D-NOFLASH (pointerup path only):** the clip box was read in the pointerup capture listener and on the next 5 rAF frames after every release. It never returned to its pre-drag geometry on either tree.
  - **D-ABORT:** window `blur` mid-trim puts the clip back to its pre-drag geometry before pointerup and adds no entry; Undo then undoes the previous entry. Equal to HEAD.
  - **D-OLDPATH:** fade-in ("Fade In: 9.313 s"), a 2-clip move ("Move (2)…") and a video clip move (owned `public/videos/hero/1.mp4`, local only) all equal HEAD.
  - **D-LOOP:** loop 00:00.250–00:01.125 on, playing; a slow trimStart drag saw 4 loop wraps. The release gives the same result as HEAD, playback is still Playing and there are no page errors. Audible correctness during the wrap is `record`.
  - The deferred `setTimeout` abort path (`ArrangementContext.tsx:1921-1924`, window-only pointerup) calls the clip's `abort`, which reverts to `gesture.before` through `updateHistory`. By construction, the store clear and `setHistory` therefore land on the same pre-drag geometry. This path was **not** driven in the browser (info).
- **EXPORT:** sequence trimStart → trimEnd in → move right → Ctrl+Z → Ctrl+Shift+Z, then the project WAV. **All 4 files have sha256 `453d1a04…a567`** (HEAD and A, both viewports). WAV PCM, 2 ch, 48 kHz, 24-bit, 118.815 s (5 703 120 frames), peak 1.0. The first audible sample is at exactly 41.910 s, the clip's start.
- **DRAG-NAMES** (`probe/c325-names-probe.mjs` = C324 probe plus a viewport argument and a zoom-keys block; `probe/names-check.txt`; both viewports):
  - HEAD `trim-moves`: every move commit has all 8 names and 4 `ArrangementLane` (106 fibers), so the check is non-vacuous.
  - A `trim-moves`: [23, 2] per move. None of the 8 names appears; `ArrangementLane` 1 and `ArrangementOverviewWithPreviewInner` 1 per commit.
  - Record: A `move-moves` drops `ArrangementProvider` but still renders `StudioWorkspace` and the whole tree (the end moves; stage c); there are 8 commits on both trees. `fade-moves` and `zoom-keys` rise by exactly `ArrangementOverviewWithPreviewInner` ×1 per commit, which explains the fade (+1) and zoom (+1) perf rises by name. The move per-move rise is the same +1 wrapper.
- **G325-AUTH** (`g325-auth.json`, `shots/lab-*.png`, `shots/legacy-*.png`): **PASS** at both viewports.
  - `/studio-lab` in a fresh anonymous context: the workspace and the demo badge show, and `auth_user` is null.
  - `/studio/middle-east`: "Sign in required" with 0 `audio[src]`.
  - `/api/studio-token`: no header → 401; fake bearer → 500 with no token; bare → 400.

- **D-MIXED source mark** (`rows-{head,a}-srcmark-{1440x900,1280x720}.json`): the first D-MIXED runs captured only `data-*`/`aria-*`. The lane-move source mark is the class `opacity-40` (`ArrangementClip.tsx:970`), so C re-ran `mixedBack` and `mixedOther` from a fresh setup on both trees with the class and the computed opacity captured: **0 diffs** at both viewports. The mark appears (opacity 0.4) exactly while the ghost is on the other lane, and clears after the move back.
- **DOCS (content):** doc 232 records all six §2.5 items: contract A (`previewClipGeometry`, `historyRef`), the subscriber list (lane clips, readout, detail, overview wrapper, `selectPreviewProjectEnd`), §1.4 convergence (`publishedHistoryRef`, `beginPointerGesture`), the stage split (b/c), HEAD vs A numbers (106.2 → 24.583) and the stage-c project-end reason.

## Checkpoint 5 (hygiene)
- The source hash at the end equals the start hash (`source-sha-{start,end}.txt`), with 16 status entries. `claims-c-end.txt` is cmp-equal to `claims-c.txt`. The mutant scratch has no diff against `store/app`. The HEAD server on :5197 (restarted once for the source-mark rerun) is stopped, and :5173 returns 200.
- Manifest: method = backticked `a-round-325/…` paths in `a-round-325.md`: 9, all present (`manifest-check.txt`). A also cites `covering-run-2.log`, `expect-count-changed.txt`, `mutants/` and `perf-rowcmp.txt` without the folder prefix; all exist in `a-round-325/`.
- Scratch only: `/tmp/c325h` (HEAD, with a cacheDir edit), `/tmp/c325s`, `/tmp/c325m`, and the WAVs in `/tmp/c325-wav`.

## Verdict
**PASS.** C found no bugs. Every C row ran, including all browser rows at both viewports. The gate rows are not claimed.

**Ableton conformance:** not applicable. Behaviour is unchanged, and HEAD-equality is the reference.

## Info for B
1. A's Low 4c is still open for a B ruling: a clip unmounted mid-drag converges in passive cleanup. C did not reproduce it in the browser.
2. The harness `move.commits-per-move` (wallclock, record) is 1.967 → 2 (A 120 vs 118 window commits). The dev probe shows 8 vs 8 move commits, so this is unexplained. A's SyncLane explanation is unverified, and the doc-168 sentence ("window-ის commit-ები 118 → 120") states the number without a verified cause.
3. The move rows stay at about 105–107 components until stage c, as ruled.
