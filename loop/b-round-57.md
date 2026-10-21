# B — Round 57 result → Round 58 dispatch (D-29z23)

Dispatcher: B · 2026-10-17 22:1x → 2026-10-18 11:4x +04 · Evidence folder: `b-round-57/`.

I changed only planning artifacts: B files in `tmp/studio-real-loop/` and `docs/technical/studio-real-workspace/plan.md`. I did not touch app source.

## 1. Resume state and inputs

- **Fresh B start.** `b-round-57-result.json` was empty (the harness writes it), and there was no `b-round-57.md` and no `tasks/round-57.md`.
- **Archive:** `current-task.md` → `tasks/round-57.md` (new file, `cp -n`, `cmp` equal). No archive was overwritten.
- **Backups before any write:** `current-task.before-b-round-58.md`, `backlog.before-b-round-58.json`, `feature-status.before-b-round-58.md`, `b-next.before-b-round-58.json`, `plan.before-b-round-58.md`.
- **Checkpoint:** `b-round-57-checkpoint.md`.
- **Read:**
  - `tasks/round-57.md`, `a-round-57.md`, `c-round-57.md`, `c-round-57.json`, `b-round-56.md`;
  - `backlog.json` v59 and `feature-status.md`.
- **Root files:** `root-pre-push-review.md` (mtime 2026-10-07 18:22) and `publication-checkpoint.json` (2026-10-17 11:11) are unchanged. Their open items are carried in `current-task.md` §4.9.
- **Root activity:** none since 2026-10-17 11:11.
- **Source read (read-only):**
  - `ArrangementGridMenu.tsx` (all);
  - `StudioWorkspace.tsx`: grid-menu state, `closeGridMenu`, `handleGridMenuRequest` and the open-menu effect (l.832–889), `handleTimelineScroll` and the follow writer (l.891–951), `applyTimelineView`, and `followModeRef` (l.351, l.651);
  - `grid-snap-menu.test.tsx`: harness, GM10–GM15;
  - doc 050 (checked for the false (i) claim: there is none);
  - the `Play`/`Export` button names.
- **B's own measurements** (`b-round-57/gates.txt`, 2026-10-18 11:25):
  - HEAD `038ed5a`; 25 status lines;
  - protected 4/4; `node.exe` 9;
  - `:5173` and `:5199` `000`;
  - round-57 frozen list 0 non-OK;
  - `diff -rq store/app c-round-57/scratch/app` printed nothing, so the tree is byte-identical to the one C verified;
  - new frozen list `b-round-57-r58-tree-sha256.txt`: 414 entries, 0 non-OK;
  - snapshots `b-round-57-r58-snapshots/`: 3 files + SHA256SUMS;
  - Biome on the 2 LF owned files: rc 0.

## 2. Round 57: what C evidenced

| ID | C verdict | Evidence |
|---|---|---|
| G57-2 | PASS (HEAD `038ed5a`, 25 lines, frozen 410, snapshots 4/4, protected 4/4) | `c-round-57.md` G57-2 |
| R57-S | PASS. D1 is AST-equivalent by C's `asteq.cjs`, with a negative control. | R57-S |
| R57-U | PASS: a–g killed; d2 extra killed; durations ≤ 1.1 s | R57-U |
| G57-1 | PASS (tsc 0, Biome at baseline, 88 / 1523, build, verify rc 0 on attempt 1) | G57-1 |
| Extras h / i | survived → **C-R57-01**, **C-R57-02** (Low) | `mutations.txt`, `mut-h.json`, `mut-i.json` |
| §4.6, §4.7, G57-3 | not run (environment, sixth round) | §4.6 |

**Backlog changes, made only from that evidence** (`backlog.json` v60, `b-round-57/update_backlog.py`):
- **C-R48-01-GRID-RESIDUAL → closed** (feature-status: **დაიხურა**).
- **C-R51-02 → მოწმდება.** This follows the C-R53-01/C-R54-0x convention: fixed at unit level, browser R57-FOCUS pending. It is not closed.
- **New C bugs:** C-R57-01, C-R57-02 (Low, scheduled for round 58).
- **New A/C findings, entered with their real status:**
  - A-R57-REVIEW-DISMISS-CLICK (G1, Medium, code-reasoned and not reproduced; scheduled);
  - A-R57-REVIEW-FOLLOW-SCROLL (G6; scheduled);
  - A-R57-REVIEW-EXPORT-GUARD-TEST (G7; scheduled);
  - C-R57-PROBE-REPOSITION (G5), C-R57-PROBE-FOCUS-RING, A-R57-REVIEW-PAGE-TRANSITION (browser probes);
  - A-R57-REVIEW-MENU-TEST-GAPS (→ 4b-2);
  - A-R57-REVIEW-TAB-BODY-FOCUS and A-R57-REVIEW-CONTEXTMENU-KEY (accepted info);
  - R57-D4-FORWARDREF (accepted);
  - R58-T-TECH-LEAD.
- **Updated:**
  - ENV-DEV-SERVER-DOWN-R52 (sixth C round);
  - ROOT-COMMIT-ROUND51;
  - ARCH-CHECKPOINT-SRW14-PREFS;
  - R56-S-DEV1 (method superseded by C's AST check);
  - C-R51-01, INFO-R55, SHIFT-MIDDRAG and CTRL-DIGIT (→ round 59);
  - SRW-14 stage 4/4b; rounds; planned_rounds; floor/expected 1523 → 1529.
- **No feature was promoted to მზადაა.** 4a and 4b-1 have no browser evidence, and G-3 last passed in a browser in round 51.
- **Architecture signal (round 57)** → `architecture_signals`, not scheduled:
  - signal 4: menu state, refs and listeners in the workspace;
  - signal 3: the three-branch `releaseEditFocusOnTimelinePointerDown`.

## 3. B decisions (D-29z23)

1. **Round 58 = the 4b-1 follow-ups, not 4b-2. This is a reorder, not a cut.**
   - G1 is a Medium defect in the feature that was just built. It is a contradiction inside B's own M9: the mechanism (cancel `pointerdown`) cannot meet the requirement ("that press does nothing else") for button targets, and C asked to schedule it now.
   - C-R57-01 and C-R57-02 are C-filed and sit in the same file.
   - 4b-2's precondition (B's Chrome Ctrl+digit check) needs a browser.
   - **Round size:** three tightly related items in one feature area and one owner:
     1. G1;
     2. G6;
     3. the menu test gaps (C-R57-01/02 + G7, test-only).
2. **G1 contract D1–D3.** The C-verified GM10 consumption stays. The click swallow is a **self-removing window capture set armed at the moment of consumption**:
   - it swallows one `click`;
   - it is released on `click`, on `pointerup`/`pointercancel` plus one macrotask, or on the next `pointerdown` (untouched);
   - it never touches `contextmenu`, `auxclick`, `dblclick` or keys.
   - **The lifetime trap is written out:** the menu unmounts before the click arrives, so the swallow cannot live in the menu's effect.
   - A backdrop was rejected because it breaks the M6 reposition.
3. **G6 rule S (smallest honest).**
   - **The rule:** only user scrolls close the menu. The menu is a global, non-time-anchored, fixed-position preference, so content paging under it is coherent.
   - **The discriminator** is the existing follow classification: playing, Follow `on`, and either `|scrollLeft − autoScrollLeftRef| ≤ tolerance` or the browser clamp.
   - `handleTimelineScroll` stays unchanged.
   - **Rejected alternatives:**
     - a wheel-only rule, because it misses scrollbar and touch scrolls;
     - never closing on scroll, because it drops M8 for user scrolls.
4. **Test contract:** exactly 6 new `it` (GM16–GM21) in the existing file → **88 / 1529**. Mutations a–h name their victims. C's extras (j) and (k) are info.
5. **Doc 050 stays frozen.** Its GM3 sentence claims only what is true (same node, new position, focus unchanged). The correction of A's report claim goes into doc 051.
6. **Rulings on the round-57 deviations:**
   - D1–D6 are accepted;
   - D4 (plain function instead of `forwardRef`) is recorded as R57-D4-FORWARDREF;
   - C's AST-equivalence method becomes the standard.
7. **The CRLF trap** for `StudioWorkspace.tsx` (1746/1746) is repeated verbatim.

## 4. Scheduling

- **Round 59:** round-58 bugs or browser bugs first; otherwise 4b-2:
  - the narrow/widen keys, after B's Chrome Ctrl+digit check (recorded as unconfirmed if there is no browser);
  - the C-R51-01 probe or its debt;
  - the INFO-R55, SHIFT-MIDDRAG and A-R57-REVIEW-MENU-TEST-GAPS tests.
- **Then:** 4c (C-R52-T1), SRW-15 (+ stage 5), SRW-16..20, Lows, SRW-21, full regression and root review, T12.
- **No scope cut and nothing labelled deferred.**
  - Out of scope as before: plugins/effects, pitch, multiple video layers and time-stretch. Grid tempo is not audio stretch.
  - `/studio-lab` stays demo-only, and the protected purchase/auth files stay unchanged.

## 5. Ableton

- **Source:** the re-used capture `b-round-46/ableton-6.7-6.10-20261016.txt` (Live 12 manual ch. 6, §6.10; captured 2026-10-16, re-used 2026-10-18).
- **What I did not use:** no new capture, video or Live installation.
- **Coverage:** none of round 58's behaviours appear in the source.

| Behaviour | Ableton conformance |
|---|---|
| The dismissing press, including its click, does nothing else | **unconfirmed** (no source); a CZABA decision, by analogy with native OS menus |
| The menu persists across Follow auto-scroll | **unconfirmed** (no source) |
| Focus return after a choice or reposition | **unconfirmed**; WAI-ARIA menu pattern, not Live |
| No menu while the export dialog is open | **does not apply** |
| Grid width from the lane context menu | **confirmed** (round-57 row, unchanged) |

## 6. Requests to root

1. **Servers, seventh round:** start `:5173` and `:5199` before C, **or answer yes/no: can they be restored here?**
   - A "no" is external missing information. B would then ask the user how completion is to be evidenced without a browser.
   - On silence, B keeps dispatching offline-verifiable stages and records the browser debt per ID.
2. **Commits:**
   - Round 56 is commit-ready.
   - Round 57 is commit-ready only as an interim, unit-verified change: G1 is open, and its hunks share files with rounds 50–55.
   - Rounds 50–55 are root's decision.
3. **ARCH-CHECKPOINT-SRW14-PREFS** (bounded, non-gating): the sixth consecutive round on the `StudioWorkspace` owner, plus A's signals 4 and 3. Answer keep/extract, value, risk, ≤ 3 sentences.
4. **Optional:** a root `testTimeout` or worker cap.

## 7. Root follow-up and commit readiness

- **Round 56** (4 test files + doc 049): commit-ready on C's round-56 PASS.
- **Round 57** (menu component, menu test, doc 050, plus hunks in StudioWorkspace, ArrangementLane and the two grid-snap tests): commit-ready as an interim, unit-verified change only.
- **Rounds 50–55** (17 paths): no open offline defect and no browser evidence. Committing them is root's decision; it is not a PASS.
- **Carried unchanged from `root-pre-push-review.md` / `publication-checkpoint.json`** (task §4.9):
  - video sync RF3-1/RF3-2/R5-L6 (C-R27-01);
  - R5-L3 partial; R5-L5/R5-E1/R6-S2/R6-S3 unit-only;
  - M1 (rAF-only loop refill) and M2 (context re-renders);
  - Lows L1–L4, L6–L8;
  - SRW-21 `middle-east` hardcode; portable paths; scrollbar refinement; library/stems parity; T12.

## 8. Advisor

The advisor was available.

**Call 1, after orientation.** I applied:
- D-29z23 recorded as an explicit reorder, with the three reasons;
- the click-swallow lifetime trap, and the required self-removing form with jsdom sequences;
- G6 reusing the existing follow predicate. I first leaned toward a wheel-only rule and changed after the advisor, because the predicate keeps M8 for scrollbar and touch scrolls;
- the fixed test list with named mutations. The advisor proposed 5 tests; I kept 6 by splitting G1 into the swallow (GM16) and its release paths (GM17), so mutations b and c have distinct victims;
- the doc-050 check (no false claim, so it stays frozen);
- evidence-only backlog moves;
- the stale "current round: Round 55" pointer in feature-status, now Round 58, with round 55–57 result blocks added;
- the Ableton rows.

**Call 2, after writing:** §8.1.

## 9. Outputs

- `current-task.md` (round 58) and `tasks/round-57.md` (archive);
- `backlog.json` v60 and `feature-status.md`;
- `plan.md` D-29z23 (CRLF 1359/1359);
- `b-next.json`;
- `b-round-57-r58-tree-sha256.txt` (414) and `b-round-57-r58-snapshots/` (3 + SHA256SUMS);
- `b-round-57/` (gates, owned, frozen paths, all paths, biome-owned-lf, update scripts);
- `b-round-57-checkpoint.md`.

The harness writes `b-round-57-result.json`.

### 8.1 Addendum — second advisor call

The advisor agreed with CONTINUE, D-29z23, the evidence-only backlog moves, the 6-test/88-1529 math and the C-R51-02 status convention. I applied:
1. **D2 timing assumption, now explicit in task §0.1:**
   - the `pointerup` + macrotask release relies on Chromium dispatching `click` in the same task as `pointerup`;
   - MN-DISMISS-BUTTON is the browser check;
   - on failure, B decides a bounded safety-timeout fallback, and A does not tune the timing.
   - The task also explains why the timed release cannot be dropped: after a right-button or drag-off dismiss, a later keyboard `click` would be swallowed. GM17(a) guards this.
2. **GM21:** read `scrollLeft` just before the first scroll instead of assuming 0, because the follow writer may already have moved it.
3. **Confirmed sound without a change:** GM19's "same menu node" (React reuses the instance in the same slot) and the order of `b-next.json` `remaining` (cosmetic).
