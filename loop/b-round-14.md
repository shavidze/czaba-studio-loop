# B — Round 14 decision record (round 15 planning, bounded workflow)

Date: 2026-10-10 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. A second call after writing is in §9.

**Subagents.** B's session has no Agent tool, so the `code-reviewer` run (and the optional `design-philosopher` run) stays with A (task §7).

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- **Round 14 task.** `current-task.md` (round 14), archived unchanged as `tasks/round-14.md`:
  - no earlier `round-14` archive existed, so nothing was overwritten;
  - `cmp` confirmed the copy before the rewrite.
- **Agent reports.**
  - `a-round-14.md` (all sections);
  - `c-round-14.md` and `c-round-14.json`.
  - `b-round-14-result.json` (0 bytes) belongs to the harness and was not touched.
- **B's own records.** `b-round-13.md`, `feature-status.md`, `b-next.json` and `backlog.json` v15.
- **Plan.** `plan.md`: D-29, D-29a..D-29e, §4, §5, §6 and §10.
- **Root items.** `root-pre-push-review.md` (2026-10-07) and `publication-checkpoint.json` (2026-10-09). Both are unchanged since the last round. C added one root note this round (§3.4).
- **Source, read-only, to make the task concrete:**
  - `components/ui/Modal.tsx`: `role="dialog"` is on the backdrop. The forwarded `ref` lands on the content `div`, which renders the X before `children`. The Esc handler is a `document` listener;
  - `ArrangementLibrary.tsx` l.354–558: the body `div` holds the tree `nav` (`w-36 overflow-y-auto py-1`) and the list column; the `[role=listbox]` is `overflow-y-auto p-1`; `ArrangementLibraryPreview` renders under the body;
  - `ArrangementExportDialog.tsx` (all): the round-14 wrapper `onKeyDown` trap and effects A and B;
  - `StudioWorkspace.tsx` l.316–440: float state, `measureFloatingVideoAnchor`, expand, return, ◀ and the placement timing;
  - `panels.ts` l.156–256: the float maths.
- **Tree.** `sha256sum -c a-round-14/gates/owned-final-sha256.txt` is 7/7 OK on the live tree. `git status` shows 18 M, 16 Studio `??` and the 2 foreign files, which equals C's end status.

## 2. C's round-14 result, as evidenced

**C `taskStatus: PASS`.** All numbers below are C's own.

| Area | Result | Evidence |
|---|---|---|
| R14-P1 | **PASS.** 6 cases, Δ ≤ 0.02, 16:9, inside the body. Hit-tests on ◀, search, separator and preview return the control ×4 in every case. A real ◀ click collapses and returns. The degenerate 160 case was never reached | `c-round-14.md` §3 |
| R14-P2 | **PASS at 1440** (as specified): search "soft" → 1 row, a real click and Enter → 1 clip, 1 Undo, the box unmoved | §4 |
| R14-S | **PASS.** Every return text is verbatim; the ◀ text is unchanged; no-ops write nothing | §5 |
| R14-E | **PASS.** The original C-R13-03 repro is fixed. The Tab cycle wraps both ways, Space and Esc behave, and the keyboard WAV is 288 384 frames = the project end | §6 |
| R14-U, R14-Doc | **PASS.** 96/96. C's own guards G1–G4 match A's | §7 |
| Adjacent | R13-F2/F3/F4 quick, R11A-1 quick, dock quick, RF7-P2: **PASS** | §8 |
| Gates | G14-1 (tsc 0, vitest 945/945, Biome 0 errors, build), G14-2 (35/35 frozen OK, protected 4/4, `Header.tsx` = HEAD), G14-3 (no bypass): **PASS** | §2 |

**New bugs (not acceptance failures):**
- **C-R14-01 (Medium):** the box covers the bottom of the body, and the list has no bottom padding.
  - At 1280/480 the box covers 9/9 rows and 9/9 tree nodes at every scroll position, and a real click on the "soft" row fails ("not interactable").
  - At 1440/288, "padi" and "melodia" stay covered even at maximum scroll.
  - C attributes it to B's formula, not to A.
- **C-R14-02 (Low):** with focus on the Modal X, Shift+Tab leaves the dialog. Enter then collapses the detail panel behind it (144 → 36).

## 3. Decisions

### 3.1 Status changes, only from C evidence

| ID | Before | After | C evidence |
|---|---|---|---|
| C-R13-01, C-R13-02, C-R13-03 | open (round 14) | **closed** | `c-round-14.md` §1, §3–§6: R14-P1/P2/S/E PASS, and the round-13 repros no longer reproduce |
| C-R14-01 | — | **open (Medium)** → round 15 | `c-round-14.json` |
| C-R14-02 | — | **open (Low)** → round 15 | `c-round-14.json` |
| SRW-11B stage 3 | `acceptance_passed_bug_open` | same, with `evidence_round14` added | `c-round-14.md` |
| SRW-11B / FB-08 | ბაგია | **ბაგია**: C-R8-01 and C-R14-01 (Medium), C-R11-01..03 and C-R14-02 (Low) | same |

Nothing moved to **მზადაა**. SRW-11B is not done while bugs and polish remain.

### 3.2 Round 15 = C-R14-01 + C-R14-02, before polish 14a

- The user's rule is C bugs first. C-R14-01 is Medium and blocks the find → add flow by mouse on a mandatory viewport.
- The two bugs are closely related: both come from the round-14 floating-video and Export-focus work, in files A changed last round. That fits "at most three closely related bugs".
- Polish 14a/14b/14c shifts to rounds 16/17/18, and SRW-13 onwards shifts by one. Round numbers are orientation only (plan §5).

### 3.3 D-29f contract decisions (smallest honest behaviour; reasons in `plan.md`)

**C-R14-01 needs two mechanisms**, and the task ties each one to the case it fixes:

1. **Height cap.** It fixes 1280/480, where only 8 px of the body would stay free even with padding.
   - Rule: width = max(160, min(640, lib.width − 16, (body.h − 16) × 16/9, (body.h / 2) × 16/9)), with a new constant `FLOATING_VIDEO_BODY_SHARE = 0.5`. Everything else in D-29e stays.
   - Expected values from C's round-14 rects:

     | Case | Box | Inset |
     |---|---|---|
     | 1440/288 | 8,523 272×153 (unchanged) | 169 |
     | 1440/480 | 8,450.5 429.33×241.5 | 257.5 |
     | 1280/288 | 8,379.5 207.11×116.5 | 132.5 |
     | 1280/480 | 8,379.5 235.56×132.5 | 148.5 |

2. **Bottom inset.** It fixes the last rows at 1440/288.
   - While the video is expanded, the tree `nav` and the `[role=listbox]` get a real `padding-bottom` plus a `scroll-padding-bottom`, both = box height + 16.
   - Real padding grows `scrollHeight`; `scroll-padding` alone would not. The `scroll-padding` keeps keyboard focus out from under the box.
   - The value comes from a pure helper on the placed height, so no body rect is stored.
   - It stays during a drag (it is only extra scroll room), and it is 0, with no `style` attribute, after a return.

Alternatives considered:
- moving the box to the timeline side changes the prototype contract and covers clips;
- padding alone does not fix 1280/480;
- a cap alone does not fix the last rows.

The cost is a smaller expanded video at 1280×720 (207–236 px wide instead of 272–443). It is still larger than the compact view, and the user can still drag it.

**C-R14-02.**
- Pass a `useRef` object as `ref` to `<Modal>`. It lands on the content `div`, which contains both the X and the children.
- Attach one native `keydown` (Tab-only) listener there while the dialog is open, and remove the wrapper's React `onKeyDown`, so a Tab is never handled twice.
- Effect B's no-steal check uses the same, larger list.
- The X stays visible. `showCloseButton={false}` would change a visible control and needs the Tech Lead.
- `Modal.tsx` stays read-only.
- My first idea, a handler on `[role=dialog]`, was wrong: that is the backdrop, and it cannot be reached by a prop. The advisor corrected it.

**Frozen.** The dock, `video-sync.ts`, `Modal.tsx` and `ArrangementLibraryPreview.tsx` are frozen and sha-checked, so there are **no sync runs**. A stall or counter change seen during R15-P1/P2 opens a bug.

**A's round-14 deviations are accepted.** C confirmed each one:
- effect B and the focusable wrapper;
- the exported constants;
- ⤢-as-return writes the compact text;
- no width rounding;
- the E5 project length.

The stale `describe` title is recorded and left alone.

### 3.4 Carried items and root notes

- **New root note:** root GA sends a `scroll` event with consent denied (`root-ga-scroll-consent-denied` in `backlog.json`).
- **Updated:** the shared-Modal note now records that the X sits outside the children (C-R14-02).
- **Dirty-tree exposure:** now 18 M + 16 untracked Studio files.
- **Fake Bearer:** still partial (backend 5199 down; the route returns 500 with no token).
- **R13-RM** (real reduced motion) stays with the Tech Lead. C simulated it again.
- The `publication-checkpoint.json` requirements (library/stems/scrollbars, T12, the final commit/push) are unchanged.

## 4. Advisor advice applied

- **Decision:** CONTINUE; round 15 = C-R14-01 + C-R14-02.
- **Placement:** two explicit mechanisms, each tied to its case; the formula as the extra `(body.h/2) × 16/9` term; A pre-computes the four geometries.
- **Padding:** real `padding-bottom` on both containers, plus `scroll-padding-bottom` for keyboard focus; the inset comes from the placed height through a pure helper.
- **Acceptance:** includes the exact C repros (1280/480 real click on the "soft" row; 1440/288 last rows at max scroll), and the hit-tests and R13-F2 are re-run at the new sizes.
- **Focus:** the cycle uses the ref Modal forwards to its content element, not the backdrop. Effect B uses the same list. The X stays visible, with the rationale recorded. A guard covers each part.
- **Records:** C-R13-01..03 closed only on C's evidence; a new tree reference; vitest floor 945; the doc-023 status update is in the task; the new root GA note; plan §4/§5/§10 kept consistent; script + backup pattern.

## 5. Artifacts written

| File | Change |
|---|---|
| `tasks/round-14.md` | archive of the round-14 task (`cmp` equal to the pre-rewrite `current-task.md`) |
| `b-round-14-tree-sha256.txt` | 44 files at the C round-14 end tree: the 42 round-13 entries plus `export-dialog-focus.test.tsx` and doc 023 |
| `b-round-14-checkpoint.md` | context checkpoint |
| `backlog.json` | **v16**. Changes: C-R13-01..03 closed with evidence; C-R14-01/02 open with B decisions; SRW-11B stage-3 `evidence_round14`; D-29f in decisions; A deviations in follow-ups; round 14 `c_pass`, round 15 dispatched; planned rounds 15–18; `baseline_tree_at_round15`; `vitest_floor_round15` 945; the Modal note, dirty-tree note and new root GA note. Script: `b-scripts/status-r15.js`; backup: `b-scripts/backlog.before-r15.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-29f; §4 round column (FB-04/05/14 → 19, FB-09/11/13 → 20, FB-10 → 21, FB-12 → 22, FB-06 → 23, FB-07 → 24, FB-08 row); §5 rows 15–26; §10 round-14 result, round-15 dispatch, remaining SRW-11B line and the advisor line. Script: `b-scripts/plan-md-r15.js`; backup: `b-scripts/plan.before-r15.md` |
| `feature-status.md` | the board for round 15. Script: `b-scripts/feature-status-r15.js`; backup: `b-scripts/feature-status.before-r15.md` |
| `current-task.md` | round 15: C-R14-01 + C-R14-02 (D-29f) |
| `b-next.json` | CONTINUE (backup: `b-scripts/b-next.before-r15.json`) |

No app source, test or other agent's file was touched.

## 6. Round-15 acceptance summary (for traceability)

- **The fixes:**
  - R15-P1: the cap at 4 cases plus the temporary opening; hit-tests; a real ◀ click.
  - R15-P2: the exact 1280/480 repro by real click; the 1440/288 last rows at max scroll; every row and tree node reachable in all 4 cases; keyboard ArrowDown at 1280/480.
  - R15-P3: the inset is removed after ✕, Esc and ◀; the pending inset is 0.
  - R15-E: the exact X repro; the full 8-step cycles; Tab and Enter from the X; R14-E quick.
  - R15-U: with a four-part guard proof.
  - R15-Doc.
- **Adjacent:**
  - R13-F2 quick from 8,450.5;
  - R13-F3 and R13-F4 quick;
  - R11A-1 quick;
  - the dock quick check;
  - RF7-P2.
- **Gates:** G15-1..3; vitest floor 945; frozen reference `b-round-14-tree-sha256.txt`.

## 7. Remaining scope (not shrunk)

- **Open bugs:**
  - C-R6-02, C-R8-01 (Medium; Tech Lead);
  - C-R14-01 (Medium) and C-R14-02 (Low) (round 15);
  - C-R11-01..03 (Low; round 16);
  - C-R12-01 (Low; milestone).
- **Features:**
  - SRW-11B polish (rounds 16–18);
  - SRW-13 (FB-04/05/14 and the export 0 dBFS hard-clip);
  - SRW-14 (FB-13);
  - SRW-15 (FB-09/11; grid tempo only, never audio stretch);
  - SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06);
  - SRW-19 (FB-07, in scope);
  - SRW-20;
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
  - the shared Modal focus gap;
  - root GA `scroll` with consent denied;
  - the growing uncommitted tree.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - FB-04..07 and FB-09..14 are not started;
  - three Medium bugs are open (C-R6-02, C-R8-01, C-R14-01);
  - SRW-11B has open bugs and polish;
  - the milestone regression and the Tech Lead checks are pending.
- **Not BLOCKED:** round 15 needs no external information, approval or credentials.

## 9. Second advisor call

Made after these artifacts were written. The advisor confirmed CONTINUE, that C-R13-01..03 close only on C's evidence, that the D-29f numbers and insets recompute correctly from C's rects, and that the plan, board, `b-next.json` and sha reference are consistent. Applied before reporting:
1. **Keyboard reachability (R15-P2.4).** B grepped `ArrangementLibrary.tsx`: option focus is a plain `.focus()` (l.194 and l.325), with no `preventScroll` and no `scrollTop` arithmetic, so Chrome honours `scroll-padding-bottom`. P2.4 stays. The task §1.5 now has a pre-code mechanism probe (inline padding via `$B js` at 1280/480 plus real ArrowDown); if it fails, A stops and reports to B. Script: `b-scripts/task-r15-fix.js`.
2. **Literal readings in the task:** R15-P3 now checks after ◀ followed by ▶ (the body does not exist while the library is a rail), and R15-E1 requires a non-empty project so `WAV-ის ექსპორტი` is enabled.
3. **Checkpoint:** `b-round-14-checkpoint.md` was refreshed, because it still named the rejected backdrop mechanism.
4. **New Tech Lead item R15-SB:** in real Chrome, the tree/list scrollbars with the inset. Added to `backlog.json` and `feature-status.md` §5.
