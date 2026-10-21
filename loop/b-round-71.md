# B round 71 — evaluation of round 71, plan for round 72 (D-29z37)

Author: B · Date: 2026-10-21 · Advisor: available, consulted once after orientation; the final consultation is recorded in §8.

## 1. Inputs read

- **Context:** `context/active-summary.md` (it showed SRW-15 as the current item and the open findings).
- **Round 71 task:** `current-task.md`, archived as **`tasks/round-71.md`** before any edit (`cp -n`, `cmp` identical; the file did not exist before).
- **Pre-state copies:** `b-round-71-pre-{b-next.json,backlog.json,current-task.md,feature-status.md}` and `b-round-71/plan.before-b-round-71.md`.
- **Round 71 reports:** `a-round-71.md` (§6 reviewer and Architecture note), `c-round-71.md` and `c-round-71.json`.
- **Root:**
  - `gates/gate-round-71.json`: `published`, commit **`1e469e5`** on both remotes. The `head` field `2be45df` is the pre-commit HEAD. `git rev-parse HEAD` confirms `1e469e5`, and the tree is clean.
  - `gates/round-71/review.md`: 9/10, `COMMIT: OK`, all four findings Low, plus an Architecture note.
  - `root-pre-push-review.md` (mtime 2026-10-21 19:59): a **new root note, "visual refresh A queued (2026-10-21)"**, after the 2026-10-20 Phase 2 note. Root had put it in `post_current_stage_queue`. It was missing from feature-status, plan.md and the active view, so B recorded it now (§6).
- **Environment:** `env-status.json` (round 71: store 200, backend 200). B's own check at 23:49 gave 200/200, with 33 `node.exe` processes.
- **Looked up by ID only:**
  - in `backlog.json`: SRW-04, SRW-15, SRW-16, SRW-24, `done_policy`, `post_current_stage_queue`, ROOT-R66-M1, DOC-059, ROOT-R70-L6, ARCH-CHECKPOINT-SRW14-PREFS, INFO-C66-RU-DBLCLICK-MISS-2;
  - in `plan.md`: the D-29z36 format and the FB table;
  - FB-10 in `docs/video-to-text-bugs/README.md`, `transcripts/2.srt` 00:52–02:12, and screenshot `2-000153.jpg`.
- **Source**, read-only, to write a concrete task:
  - `types/arrangement.ts`, `model.ts` (whole file);
  - `ArrangementContext.tsx`: the value interface, `scheduleKey`, `applyEdit`, `commitArrangement`, `seekTo`, `togglePlayback`, `cutTimeSelection`, and the resync remap;
  - `StudioWorkspace.tsx`: the key handler at l.1276–1535, and the chrome rows at l.1690–1867;
  - `ArrangementLoopBrace.tsx` (its pattern), `view.ts` `timelineNavigationKey`, `clipboard.ts` (export list and paste), and the `delete-selection-ui.test.tsx` harness.
- **Ableton:**
  - the saved capture `b-round-29/ableton-arrangement-view-20261012b.txt` (§6.4, §6.7, §6.9, §6.11);
  - **re-fetched with gstack `/browse` on 2026-10-21:** `b-round-71/ableton-arrangement-view-20261021.txt` (§6.4 text identical in substance; §6.9 Ctrl+arrows; §6.11) and `b-round-71/ableton-shortcuts-20261021.txt`. The shortcuts page lists no default key for Set, Previous or Next Locator. Rename is Ctrl+R.
  - B's browse daemon was stopped after use.

## 2. Evaluation of round 71 (C evidence only)

`c-round-71.json`: **taskStatus PASS, `browserVerified: true`, `realVerified: true`, `bugs: []`.**
- Every REAL-browser row ran, and the starred rows ran at both viewports.
- **MH-NODES*:** ≤ 120 `createBufferSource` calls in the first 0.5 s at 999 BPM (the old code made ~2200).
- **MH-SCRUB-PERF:** passed.
- **Real-audio rows:** MT-BEATS*, MH-LONG, MH-END, MT-SEEK, MT-TEMPO-CHANGE, MT-LIVE-TOGGLE and MH-SCRUB all passed.
- **Regressions:** MT-LOOP, MT-EXPORT-REG, MT-OFF, REG-HYD and G71-3 passed.
- **Root gate:** verify 101/1696, review 9/10, published `1e469e5` on both remotes.

| ID | Before | After (evidence) |
|---|---|---|
| ROOT-R66-M1-METRONOME-HORIZON | scheduled round 71 | **closed** (C PASS round 71, `1e469e5`) |
| DOC-059-STATUS-LINE | scheduled round 71 | **closed** (C R71-S) |
| ROOT-R70-L6-DOC062 | scheduled round 71 | **closed** (C R71-S) |
| SRW-15 / FB-09 | მოწმდება | **მოწმდება** (`c_pass_tech_lead_manual`). Every C ID is PASS with browser evidence; Tech Lead R65-T, R66-T, R70-T and R71-T remain |

**C info → backlog:**
- **INFO-C71-MUT-H-EQUIVALENT:** closed (an equivalent mutant).
- **INFO-C71-MUT-N-O-GAPS:** merged into ROOT-R71-L3, Lows batch.
- **INFO-C71-ME-LENGTH:** acknowledged. **B's round-71 task wrongly assumed 133 s; the demo clip ends at 101.352 s.** Round 72 uses the measured value.
- **INFO-C71-LOOP-FIXTURE:** acknowledged, as a harness note.
- **INFO-C71-A-VITEST-CACHE:** a root note. It is mentioned to A and C in the task.
- **INFO-C71-RB-R9L2-SERIES:** merged with ROOT-R71-L4, on watch.
- **INFO-C71-GSTACK-START and INFO-C71-MH-END-METHOD:** acknowledged.
- **No browser half is pending for round 71.**

## 3. Root reviewer findings (round-71 gate)

| ID | Severity | Disposition |
|---|---|---|
| ROOT-R71-L1-DOC063 | low | **Round 72:** the doc 063 status line, plus one sentence saying root verify passed (the doc says all attempts failed) |
| ROOT-R71-L2-HORIZON-CONST | low | Lows batch, optional: alias the two `2` constants or document that they are independent |
| ROOT-R71-L3-MUT-N-O | low | Lows batch: HU4 late-margin variant; a loop click straddling `loop.end` |
| ROOT-R71-L4-RB-R9L2 | info | watch (final 1/17, baseline 0/13; the test never enables the metronome) |
| ROOT-R71-ARCH-REFILL | info | signal, merged into ARCH-CHECKPOINT-SRW14-PREFS (eighth request). Reviewers: keep until a third refill kind appears |

## 4. Round 72 decision (D-29z37): SRW-16 stage 1, named markers

**Why this item.** No C bug and no reviewer Medium are open. In dependency order, SRW-16 (FB-10) is the next unimplemented user feature; it depends only on SRW-04, which is done. That order was also set in `b-round-70.md` §7.

**Staging.** The scope is not reduced; SRW-16 has two stages.
- **Stage 1** (this round) covers everything in the backlog title except moving markers: add, name, show, jump, play from, previous/next, rename, delete, Undo and the R16-K3 Delete Time remap.
- **Stage 2** is scheduled, not deferred:
  - moving markers by drag and arrows, with snap;
  - a right-click menu, which gives rename a mouse path;
  - snapping clips, range and playhead to markers (Live 6.7);
  - Ctrl+←/→ also stopping at clip edges (Live 6.9).

**Decisions and rationale (smallest honest behaviour):**
1. **An optional `markers?` field.** A required field would break 4 frozen test files and Store code outside Studio that builds `Arrangement` values. The list is never stored as `[]`, so add then delete is identical to the original (`isSameArrangement`).
2. **No resync.** `scheduleKey` is `[clips, loop]`, so marker edits never touch audio. C proves it with the round-71 `createBufferSource` counter (MK-NO-RESYNC = 0 calls).
3. **Add position.** With a range, the marker goes at `range.start`; otherwise at the live position (D-15; Live 6.4 confirmed). The name editor opens at once, because the user's words were "აწერს ამას სახელს" (he writes the name on it). Nothing is committed before Enter or blur, so one Undo step removes an added marker. A duplicate at the same ms is refused.
4. **Keys.**
   - `M` adds. Live has no default key; `M` is the video-editor convention, and it is unused in CZABA.
   - Ctrl+←/→ go to the previous/next marker (Live 6.9 confirmed; unused in CZABA; Alt avoided because of ALT-CHROME-MENU).
   - F2 renames. Live's Ctrl+R is the browser's reload, so this is a deliberate difference.
   - Delete on a focused marker deletes it, and a guard keeps the key from reaching `deleteSelection` (SRW-24 regression rows MU8 and MK-DELETE).
5. **Delete Time.** A marker inside the cut range is removed, and a marker after it shifts left. Live's text names only time-signature markers, so the Ableton match is recorded as **unconfirmed**.
6. **Placement.** A separate sticky marker row between the tempo row and the Loop row ("ზემოდან", up top). The ruler stays frozen because of its RU-DBLCLICK watch. B revised the backlog `files` list to match.

**Verification design:**
- **Unit:** MK1–MK10 cover the pure helpers with literal tables.
- **Mounted:** MU1–MU12, including the no-resync, gesture-refusal and SRW-24 interaction rows.
- **Mutations:** a–n.
- **C, in the browser:** every acceptance row from R16-K1..K3, including play-from-marker with real audio, the layout at both viewports, the export regression and the chrome/keys regressions.

**Baseline:**
- HEAD **`1e469e5`**, clean tree;
- frozen list `b-round-71-r72-tree-sha256.txt`, 442/442 OK;
- snapshots `b-round-71-r72-snapshots/` (5 files, all LF);
- protected files 4/4;
- Biome 4/218/1 (`b-round-71/biome-full.txt`);
- vitest 101/1696 → 103 files.

## 5. Architecture checkpoint

ARCH-CHECKPOINT-SRW14-PREFS is still unanswered; this is the eighth request (task §6.2). Round 71 added the refill-pipeline signal: root's Signals 3 and 4 and A's reviewer note, all saying "keep". Round 72 will add two watched signals:
- a 7th key-routing clause (`isMarkerTarget`, ARCH (e));
- a 5th copy of the UI harness (ARCH (c)).

The request is non-gating. B does not schedule an extraction, and SRW-16 does not wait.

## 6. Root notes

- **Phase 2 (2026-10-20):** unchanged.
- **Visual refresh A (2026-10-21, new):** recorded as `VISUAL-A-ROOT-NOTE-20261021` in the backlog, in feature-status §7/§8, in plan D-29z37 R10 and in task §6.4.
  - **Final order:** Phase 1 → T12 → VISUAL-A-OBSIDIAN (no further go-ahead needed) → **BLOCKED "phase 2 awaiting user go-ahead"**.
  - Neither item is planned or mixed into current work.
  - New Studio strings keep the current language (English row labels, Georgian status lines) until VISUAL-A's M2 strings module moves them.

## 7. Carried (not this round; in the backlog)

**Own tasks, in order:**
1. SRW-16 stage 2;
2. SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20;
3. the open follow-ups for SRW-03, 05, 09, 10, 11B, 13, 23 and 24;
4. SRW-21 (blocked-partial, route mount only).

**Lows batch:**
- ROOT-R64-L3 to L6; ROOT-R65-L2, L4 and L5 (plus L6's U11/U12 order); ROOT-R66-L3;
- ROOT-R68-L2, L4 and L5; ROOT-R69-L1 to L4; ROOT-R70-L1 to L5; **ROOT-R71-L2 and L3**; INFO-C70-SCROLL-END;
- A-R65-TEMPO-HINT-ANCHOR and the A-R66/A-R67 review residuals;
- INFO-C66-UI9-NO-PLAY, INFO-C67-MUT-P, INFO-C68-MUT-K and INFO-C67-DROP-GHOST-ATTR.

**Then:** the full regression, root review, T12 and VISUAL-A. After that, Phase 2 waits for the user.

**Tech Lead:** R65-T … R72-T.

## 8. Decision

**CONTINUE.**
- **Why not COMPLETE:**
  - SRW-16 is only now starting (stage 1), and SRW-17…SRW-20 have not started.
  - SRW-03, 05, 09, 10, 11B, 13, 14, 15, 23 and 24 still need bug fixes or Tech Lead checks.
  - SRW-21 is blocked-partial.
  - The Lows batch, the full regression, the root review, T12 and VISUAL-A remain.
- **Why not BLOCKED:** no external information, approval or credential is missing for round 72.

**Readiness:** round 71 is already published (`1e469e5`). Round 72 is commit-ready only after a C PASS with `browserVerified: true`.

**Advisor:** available. First consultation after orientation: optional field and never `[]`, the no-resync row, the Delete Time decision with Ableton unconfirmed, `range.start` add, keys and the SRW-24 guard, the separate row keeping the ruler frozen, the VISUAL-A root note, and the F-ME length correction. All were applied. Final consultation: see below.

**Final advisor consultation (before completion) — changes applied to `current-task.md`:**
1. **Editor isolation:** the name input is a sibling of the marker buttons, never nested inside one, and the marker/row key handlers ignore it. Delete typed in the input edits only the text (MK-RENAME step 3, MU7, mutation m).
2. **Settle once:** Enter, Escape and blur settle the editor at most once, so a blur after unmount does nothing; and `before = getArrangement()` is taken at commit time. MU1 checks for no duplicate status and exactly one entry; mutation n.
3. **Prev/Next buttons** get `aria-label`s.
4. **MK-CUT-TIME** now describes the split music clip correctly (the right part moves from 25 to 15).
5. **Doc 063:** the sentence is given as a fenced block, so A copies it exactly.

The advisor confirmed: the 10-line end status, the MK-NO-RESYNC oracle, the MK7/MK8 tables, that M and Ctrl+arrows are unbound, and the typing-target coverage. The round is larger than recent ones; its mitigation is the checkpoint requirement, and it is not split further.
