# B — Round 13 decision record (round 14 planning, bounded workflow)

Date: 2026-10-10 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. A second call after writing is in §9.

**Subagents.** B's session has no Agent tool, so the `code-reviewer` run (and the optional `design-philosopher` run) stays with A (task §7).

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- **Round 13 task.** `current-task.md` (round 13), archived unchanged as `tasks/round-13.md`:
  - made with `cp -n` before any rewrite, and `cmp` confirmed it;
  - no earlier `round-13` archive existed, so nothing was overwritten.
- **Agent reports.**
  - `a-round-13.md` (all sections);
  - `c-round-13.md` and `c-round-13.json`.
  - `b-round-13-result.json` (0 bytes) belongs to the harness and was not touched.
- **B's own records.** `feature-status.md`, `b-round-12.md`, `b-next.json` and `backlog.json` v14 (SRW-11B stages, `polish_round`, `planned_rounds`, `open_findings`).
- **Plan.** `plan.md`: D-29, D-29a..D-29d, D-19b, §4, §5, §6 and §10.
- **Root items.** `root-pre-push-review.md` (2026-10-07) and `publication-checkpoint.json` (2026-10-09). Both are unchanged since the last round, so the carried list is unchanged except for one new root note (§3.4).
- **Source, read-only, to make the task concrete:**
  - `StudioWorkspace.tsx` l.316–429 (float state, `measureFloatingVideoAnchor`, expand/return/◀ handlers, placement timing);
  - `ArrangementLibrary.tsx` l.350–556 (header, search block, body region l.427, `ArrangementLibraryPreview` at l.535 under the body, separator);
  - `ArrangementExportDialog.tsx` (all);
  - `components/ui/Modal.tsx` (grep: a `document` Esc listener and a portal, no focus handling);
  - `panels.ts` l.180–244 (the float maths);
  - the prototype `workspace.js` l.2677–2772. There is no return status text, so B confirmed that one has to be defined.
- **C's library geometry** (`c-round-13/runs/f1-1440-*.json`, `f1-1280.txt`): aside 0,84, 288×767 at 1440×900 and 0,122, 288×529 at 1280×720.

## 2. C's round-13 result, as evidenced

**C `taskStatus: PASS`.** All numbers are C's own.

| Area | Result | Evidence |
|---|---|---|
| R13-F1..F4 | **PASS.** Box at 8,92 / 8,130, 272×153, placeholder 160×90, dock 107 → 107. Drag exact and clamped. Arrows +48. Resize re-clamp 1008,567. D-26 second pointer ignored. Follow does not scroll during the drag. Esc precedence correct, including Export (A's capture-phase fix works in a real browser). Temporary opening placed after 343 ms with no intermediate position | `c-round-13.md` §2.1–§2.4 |
| R13-F5 | **PASS**, 3/3 valid, 0 replacements. Max \|d\| excl. .0172/.0189/.0183; 0 counter change within 300 ms of 15 layout changes; same nodes on every frame | §2.5 |
| R13-F6, R13-U, R13-Doc | **PASS.** C's own mutations: M1 fails 25 tests, M2 fails 3, M2b fails 5 | §2.6–§2.8 |
| Adjacent | R12-W1 ×1 expanded (`d300` +.0029/+.0060/+.0035, settles = swaps), RF5-3 ×1 H2, dock sync diff 0 lines in l.212–663, dock quick check, R11A-1 quick, RF7-P2: **PASS** | §3 |
| Gates | G13-1 (tsc 0, vitest 914/914, Biome, build), G13-2 (32/38 b-round-12 hashes OK; the 6 changed are exactly the owned files), G13-3 (no bypass): **PASS** | §1, §5 |
| User flow | find → add → fit video → export works. Export compact vs expanded maxDiff 0 | §4 |

B also checked the tree: A's `owned-final-sha256.txt` is 8/8 OK on the live tree, and `git status` equals C's end status.

## 3. Decisions

### 3.1 Status changes, only from C evidence

| ID | Before | After | C evidence |
|---|---|---|---|
| SRW-11B stage 3 | dispatched | **acceptance_passed_bug_open** | `c-round-13.md` §2–§3 |
| SRW-11B / FB-08 | მუშავდება | **ბაგია**: every stage-1..3 C ID passes; C-R8-01 (Medium), C-R11-01..03 and C-R13-01..03 (Low) are open | same |
| C-R13-01, C-R13-02, C-R13-03 | — | **open (Low)** → round 14 | `c-round-13.json` |

Nothing moved to **მზადაა**: SRW-11B is not done while bugs and polish remain.

### 3.2 Round 14 = C-R13-01..03, before polish 14a

- The user's rule is C bugs first.
- C rates C-R13-01 Low but says Medium is defensible: the default placement makes the search field, the entry to find → add, unreachable.
- The three bugs are closely related. All three are about the floating video's interaction with the library and the Export dialog, in files C verified this week. That fits the workflow's "at most three closely related bugs".
- Polish 14a/14b/14c shift to rounds 15/16/17, and SRW-13.. shift by three. Round numbers are orientation only (plan §5).

### 3.3 D-29e contract decisions (smallest honest behaviour, reasons in `plan.md`)

- **C-R13-01 placement.**
  - The box goes inside the library body region (tree and list, l.427) and is anchored at its bottom: width = max(160, min(640, library.width − 16, (body.height − 16) × 16/9)), left = library.left + 8, top = max(body.top + 8, body.bottom − 8 − height), then the viewport clamp.
  - Why the bottom of the body region:
    - the top of the list holds the first search results;
    - anchoring to the aside's bottom would cover the preview bar, which renders under the body (l.535), and the advisor flagged that.
  - The box may cover only scrollable rows, never header/◀, search, the separator or the preview.
  - The 160 px minimum is D-22's compact size. A reports whether any measured case reaches it, and stops if a non-degenerate case would cover a control.
  - With C's geometry, the expected box at 288 is about 272×153 near the bottom of the list region at both sizes, well clear of search.
  - The round-13 R13-F1 numbers (top = library.top + 8) are explicitly superseded, so C does not fail the new placement against the old contract.
- **C-R13-02 return status.** The prototype has none, so B defines two verbatim texts: `ვიდეო პატარა ხედს დაუბრუნდა.` and, after a temporary opening re-collapses, `ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.`. The ◀ text is unchanged, and plain ▶/◀ gets no new text (outside the bug).
- **C-R13-03 Export focus.** `components/ui/Modal.tsx` is shared and read-only (plan §6), so the fix is in `ArrangementExportDialog.tsx` only:
  - on open, focus goes to `დახურვა`;
  - Tab and Shift+Tab cycle inside the dialog;
  - on close, focus returns to the remembered element if it is still connected.

  Without the Tab cycle, Tab from the last dialog button would leave the portal for the workspace. That would not honestly meet "keyboard input does not act on workspace controls behind it".
- **Frozen:** the dock, `video-sync.ts` and `Modal.tsx` are frozen and sha-checked, so **no sync runs**. The change only gives the same code path different coordinates, and R13-F5 already measured that path. A stall or counter change seen during R14-P1/P2 opens a bug.
- **A's round-13 deviations are accepted** and recorded in D-29e: the capture-phase Export mark, the `transitionProperty` reduced-motion gate, and the fallback timer plus `transitioncancel`.
- **R13-U guard-2 wording was B's error.** C's M2/M2b analysis is right, and round 13's PASS is unchanged.

### 3.4 Carried items and root notes

- **New Tech Lead check: R13-RM**, a real `prefers-reduced-motion` run. C's check was a simulation because gstack denies CDP emulation.
- **New root note:** the shared `Modal.tsx` has no focus management. Round 14 fixes only the Studio export dialog.
- **Fake Bearer** stays partial, as before (backend 5199 down; the route returns 500 with no token).
- **C-R12-01** has new milestone evidence: W_1 wrote at 0.041 s with harness |d| 0.012. It stays routed to the milestone RF5-3 with a dock live-position read (D-19b), not re-measured now.

## 4. Advisor advice applied

- CONTINUE; stage 3 → `acceptance_passed`; nothing to მზადაა; vitest floor 914; a new tree hash file from C's end tree.
- Round 14 = C-R13-01..03 before 14a, with the polish rounds shifted and plan §5, `planned_rounds` and the board updated.
- **Placement:** B checked where `ArrangementLibraryPreview` renders before choosing the anchor. It is under the body, so the anchor is the body region's bottom, not the aside's. The discriminating rule is "only scrollable rows may be covered". The maths stays pure, and the changed placement tests are named exceptions.
- **Status:** B checked the prototype for a return text (none), so the smallest honest texts are defined.
- **Focus:** the fix is in the arrangement dialog only. The Modal gap goes to a root note. The capture-phase Esc mark is re-verified.
- A's deviations go into D-29e; the guard-2 wording is fixed in B's record; real reduced motion goes to the Tech Lead.
- **Hygiene:** `cp -n` archive, an early checkpoint (`b-round-13-checkpoint.md`), and the harness's 0-byte result file left alone.

## 5. Artifacts written

| File | Change |
|---|---|
| `tasks/round-13.md` | archive of the round-13 task (`cp -n`, `cmp` equal) |
| `b-round-13-tree-sha256.txt` | 42 files at the C round-13 end tree: the 38 round-12 entries plus `floating-video.test.tsx`, doc 022, `ArrangementExportDialog.tsx` and `components/ui/Modal.tsx` |
| `b-round-13-checkpoint.md` | context checkpoint |
| `backlog.json` | v15. SRW-11B stage 3 `acceptance_passed_bug_open` with `evidence_round13`; item status `stage3_passed_bugs_open`; C-R13-01..03 open bugs with B decisions; D-29d/D-29e in decisions; recorded follow-ups (A deviations, guard-2 wording, reviewer Lows); round 13 `c_pass`, round 14 dispatched; `planned_rounds` 14–17; `baseline_tree_at_round14`; `vitest_floor_round14` 914; Tech Lead R13-RM; root finding `shared-modal-no-focus-management`. Script: `b-scripts/status-r14.js`; backup `b-scripts/backlog.before-r14.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-29e; §5 rows 14–25; §10 round 13 result, round 14 dispatch, the SRW-11B remaining line and the advisor line. Script: `b-scripts/plan-md-r14.js`; backup `b-scripts/plan.before-r14.md` |
| `feature-status.md` | the board for round 14 (backup `b-scripts/feature-status.before-r14.md`) |
| `current-task.md` | round 14: C-R13-01..03 (D-29e) |
| `b-next.json` | CONTINUE (backup `b-scripts/b-next.before-r14.json`) |

No app source, test or other agent's file was touched.

## 6. Round-14 acceptance summary (for traceability)

- **The fixes:**
  - R14-P1 (placement in 4+ geometries, hit-tests on ◀, search, separator and preview, real ◀ click);
  - R14-P2 (find → add while expanded);
  - R14-S (verbatim return texts);
  - R14-E (focus into the dialog, real Enter, Tab and Shift+Tab wrap, Space, Esc, focus restore, keyboard WAV export);
  - R14-U (with a four-part guard proof);
  - R14-Doc.
- **Adjacent:** R13-F2/F3/F4 quick from the new placement, R11A-1 quick, dock quick check, RF7-P2.
- **Gates:** G14-1..3; vitest floor 914; frozen reference `b-round-13-tree-sha256.txt`.

## 7. Remaining scope (not shrunk)

- **Open bugs:**
  - C-R6-02, C-R8-01 (Medium; Tech Lead);
  - C-R13-01..03 (Low; round 14);
  - C-R11-01..03 (Low; round 15);
  - C-R12-01 (Low; milestone).
- **Features:**
  - SRW-11B polish (rounds 15–17);
  - SRW-13 (FB-04/05/14 and the export 0 dBFS hard-clip);
  - SRW-14 (FB-13);
  - SRW-15 (FB-09/11; grid tempo only, never audio stretch);
  - SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07, in scope), SRW-20;
  - the SRW-21 adapter (the route mount needs approval);
  - T12 afterwards.
- **Verification:**
  - the milestone regression (21 regression-debt IDs plus C-R12-01);
  - the Tech Lead manual list: RF7-2/RF7-3 quiet Chrome, R23-1/2, R12-L4, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, Lenis.
- **Root carry:**
  - the purchased loader hardcodes middle-east;
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip;
  - the final commit/push after everything;
  - the foreign untracked agent files;
  - the shared Modal's missing focus management.

**Root exposure note.** There has been no commit since `c5ed47b`. Rounds 6–13 leave 17 M + 14 untracked Studio files. This is policy-correct, because the final commit/push is root's, but the exposure keeps growing.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - FB-04..07 and FB-09..14 are not started;
  - Medium bugs are open;
  - SRW-11B has open Low bugs and polish;
  - the milestone regression and the Tech Lead checks are pending.
- **Not BLOCKED:** round 14 needs no external information, approval or credentials.

## 9. Second advisor call

Made after these artifacts were written. The advisor confirmed CONTINUE and that the status changes stay within C's evidence. Applied before reporting:
1. **plan.md §4** round column now matches §5 (FB-04/05/14 → 18, FB-09/11/13 → 19, FB-10 → 20, FB-12 → 21, FB-06 → 22, FB-07 → 23), and the FB-08 row names round 14 (C-R13-01..03) and polish rounds 15–17. Script: `b-scripts/plan-md-r14b.js`.
2. **Degenerate-case wording** (D-29e and task §2.1): when height > body.height − 16, the box sits at body.top + 8 and extends down over the preview bar; only after the viewport clamp may it overlap search. The earlier text had the direction backwards.
3. **Task §2.3:** the dialog's keydown handler acts only on Tab, calls preventDefault only when it wraps, and never stops propagation. This protects the Modal's document Esc listener and the round-13 capture-phase Export mark (R13-F3). Script: `b-scripts/task-r14-fix.js` fixes a shell-quoting slip in that line.
4. **Task §3.2:** the StudioWorkspace row now allows the new body `useRef` and the two return-text constants, so A does not log a spurious deviation.
