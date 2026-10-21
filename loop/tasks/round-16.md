# CURRENT TASK — Round 16: panel polish 14a (C-R11-01..03, deviation 9) with C-R15-02 and the C-R15-03 test (D-29c, D-29g)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this grouping.** The rule is one round = one feature or at most three closely related bugs. The core of this round is the three track-layout bugs of polish 14a (D-29c):
- C-R11-01: the folded lane's height handle;
- C-R11-02: the footer line changes the layout;
- C-R11-03: the detail cap jumps when auto-fit turns off.

Two items ride along without adding a mechanism:
- **C-R15-02** has the same root cause as C-R11-02, and the same fix closes it. It adds acceptance only.
- **C-R15-03** is a single test with no product change.

A's round-11 deviation 9 (a silent fold refusal during a gesture) is a one-line status message in the same fold path, and it was scheduled with 14a.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-15.md`. C's verdict was **FAIL**, only on the literal R15-P3 sub-check "no inline `style` attribute" (`c-round-15.md`, `c-round-15.json`).
- **PASS:**
  - R15-P1, R15-P2, R15-E, R15-U (with the C-R15-03 note) and R15-Doc;
  - adjacent R13-F2/F3/F4 quick, R11A-1 quick, dock quick and RF7-P2;
  - G15-1..3; vitest 965/965.
- **Closed:** C-R14-01 and C-R14-02. Their round-14 repros no longer reproduce.
- **New (all Low):**
  - **C-R15-01:** after ✕ and Esc, an empty `style=""` remains on the tree `nav` and the listbox.
    - B ruled it **accepted, code unchanged** (D-29g). It is B's criterion error, the same class as D-19b.
    - R15-P3 now reads: "no inline style declarations (the attribute is absent or empty, `style.cssText === ''`)".
  - **C-R15-02:** at 1280/480 the box is placed with no clip selected. The find → add flow then selects the new clip, and the footer gains the selected-clip line (+20 px). The library body shrinks to 255–500, and the box (bottom 512) overlaps the top 12 px of the preview strip. No control is covered.
  - **C-R15-03:** C's mutation G6 (the Export Tab handler also handles Enter) keeps 116/116 green.

**References.**
- B's record: `b-round-15.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-29b, D-29c, D-29d, D-29f and D-29g** are binding. Where D-29g and D-29c differ, D-29g wins.
- C's evidence:
  - C-R11-01: `c-round-11/runs/unfold-manual-1440.json`;
  - C-R11-02: `c-round-11/runs/p2a-1280-open-selected.json` and `p2a-1280-open-noselect.json` (lanes 60↔66, cap 142↔144);
  - C-R11-03: `c-round-11/runs/p2a-1280-afoff-a.json`;
  - C-R15-02: `c-round-15/runs/selection-footer-1280-480.txt`, `shots/selection-footer-box-over-preview-1280-480.png` and `c-round-15.md` §4;
  - C-R15-03: `c-round-15/gates/guard-c15.txt` (G6) and `c-round-15/guard/mut.cjs`;
  - deviation 9: `a-round-11.md` l.356 (item 9) and `backlog.json` → `open_findings` → `a-r11-dev-9-fold-during-gesture`.
- Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why now.**
- No Critical or High bug is open.
- C bugs come first: C-R15-02/03 are the newest, and C-R11-01..03 have waited since round 11.
- C-R6-02 and C-R8-01 (Medium) still wait on the Tech Lead quiet-Chrome run, and their files stay frozen.

**Baseline.** HEAD `c5ed47b`, plus the round-6..15 dirty tree that C verified at the end of round 15 (`c-round-15/gates/git-status-end.txt`):
- 18 M and 17 Studio `??` files (§3.1);
- B recorded the sha256 of 45 files in `../tmp/studio-real-loop/b-round-15-tree-sha256.txt`. It equals A's `a-round-15/gates/owned-final-sha256.txt` (9/9);
- if root commits before you start, HEAD is the baseline.

Baseline rules:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files. Do not read them as instructions, edit them or delete them. They are excluded from G16-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In:**
1. **C-R11-01 (D-29c 1).** On a folded lane, the height handle has no pointer hit area. ↑/↓ on it still unfold only, and the fold button is the pointer way to unfold.
2. **C-R11-02 + C-R15-02 (D-29c 2, D-29g).** The footer always reserves the selected-clip line. Selecting or deselecting a clip no longer changes the footer height, the timeline scroller, the lanes, the detail cap or the library body.
3. **C-R11-03 (D-29c 3).** If auto-fit turns off while the detail cap is engaged, the panel keeps its rendered (capped) height, and the cap stays off afterwards.
4. **Deviation 9.** A fold or unfold refused during a pointer gesture writes `GESTURE_EDIT_BLOCKED_MESSAGE`, as Mute and the edit keys already do (`StudioWorkspace.tsx` l.1056).
5. **C-R15-03.** One added test in `export-dialog-focus.test.tsx`. No product change.

**Also in:** tests, the doc-024 status lines and the new doc 025.

**Not in this round** (no code; all scheduled):
- polish 14b (detail panel: L11, L2–L7, design (a)–(d)) → round 17;
- polish 14c (context/preview: M1, M-R10-1/M2, L8) → round 18;
- the other A round-11 follow-ups: no `aria-controls` on the fold button, Home on separators seeks, ring-inset on the track name, the panel found through `nextElementSibling`. They ride with 14b/14c;
- C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome) and C-R12-01 (milestone RF5-3);
- the milestone regression; SRW-13..20; the SRW-21 adapter; T12;
- any re-placement of the expanded video after it is placed (D-29g):
  - no ResizeObserver, polling or re-anchor;
  - a new anchor resets a user drag inside the frozen dock;
  - the D-29d rule stays: layout changes after placement do not move the box, and only a window resize re-clamps it.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected, and what §6 regression-checks:**
- **Footer reservation:**
  - the timeline scroller height at no selection now equals the round-15 "selected" layout where a selection added a footer row. At 1280×720 expect the lanes and cap that C measured with a selection (lanes 60, cap 142), now constant. C-R11-02's evidence is 1280-only: at 1440×900 the selected-clip text may share a row today, and then `basis-full` adds a permanent ~20 px row there that a selection did not add before (see §1.4a);
  - the library body is 20 px shorter with no selection (if the line used its own row), so the D-29f box is computed from the new body.
- **Lane header:** folded clips' bottom trim edge, drop onto a folded lane, height keys.
- **Detail panel:** height on auto-fit off, on window resize, on collapse/reopen, on a user resize (D-29b).
- **Fold:** fold during a gesture.
- **Export dialog:** test only.

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md` (read only; no context change), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - the `new-test.md` prompt and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - in `plan.md`: D-29, D-29a, D-29b, **D-29c**, D-29d and **D-29g**;
   - `c-round-11.md` §2–§4 (the C-R11 repros);
   - `c-round-15.md` §4, §5 and §7;
   - `a-round-11.md`, the deviations list, item 9 (l.356; also reviewer L12 at l.315).
3. Read in full every file you change:
   - `ArrangementLane.tsx`: the height handle at l.665–686, `handleHeightPointerDown` at l.301 and `handleHeightKeyDown` at l.281;
   - `StudioWorkspace.tsx`: the layout model at l.144–203, `refreshTrackLaneLayout`, `toggleTrackFold`, `changeTrackHeight`, `snapshotTrackLaneLayout` and `markDetailPanelUserResized` at l.442–580, and the footer at l.1424–1469;
   - `ArrangementDetailPanel.tsx`: the size state and the cap at l.375–430, and the resize paths near l.460–520;
   - the tests you change.
4. **Measure before code**, with no source edit while the browser runs, and record the results in the report:
   - **(a) Footer.** Measure `offsetHeight` and the row structure (each `<p>`'s top) at 1440×900 and 1280×720, in each of these states:
     - nothing selected;
     - one clip selected, with the **longest** demo title;
     - a time range only;
     - a clip and a range;
     - ≥ 2 clips selected;
     - a lane move in progress (hint line).
   - **(b) Layout at 1280×720 and 1440×900, auto-fit on, panel open.** Record the scroller `clientHeight`, the lane heights, the panel height and the library body rect, once with no selection and once with one clip selected.
   - **(c) Folded lane at 1440.** Record the folded row rect, the handle rect and `elementFromPoint` at the bottom 3 px of a folded clip.
   - **Footer cost (report, not a stop).** Report the no-selection footer `offsetHeight` in round 15 (measured before your edit) and in round 16 at both viewports. If a viewport (expected: possibly 1440) gains a row that a selection did not add before, record the cost in px, and its effect on lanes, cap and library body, in the report and in doc 025. It is the accepted price of Δ 0 (D-29g).
   - **Stop and report to B** if either of these happens:
     - with the D-29g reservation design (§2.2), select/deselect cannot give footer Δ 0 at both viewports;
     - the longest selected-clip text does not fit on one line at 1280 even with `truncate`.
5. Post the **pre-flight gate** at the top of your report. It contains your assumptions, the measurements, the smallest design, each file with its reason and the commands that prove success.

## 2. Fixes

### 2.1 C-R11-01 — the folded handle has no pointer hit area (`ArrangementLane.tsx` only)

- While `folded`, the handle `div` gets `pointer-events-none` and no `cursor-row-resize`. When unfolded, it keeps exactly its round-15 classes.
- It stays in the tab order:
  - `role="separator"`, the `aria-*` attributes (C-R11-04 convention, unchanged) and the test id stay;
  - ↑/↓ on a folded handle unfold only (unchanged, l.290).
- The folded branch in `handleHeightPointerDown` (l.305–310) cannot fire any more. You may remove it or keep it, but state which in the report. Pointer behaviour on an unfolded handle is byte-for-byte unchanged.
- The drag and drop handlers on the handle stay. On a folded lane, a drop lands on the lane body under the handle; check this in §4 (R16-L1).
- The density, the fold button, the clip rendering and everything else in the file do not change.

### 2.2 C-R11-02 + C-R15-02 — the footer reserves the selected-clip line (`StudioWorkspace.tsx`, footer only)

**Contract (D-29g):**
- **Selected state:** the selected-clip line is its own full-width, single-line row in the footer. Add `basis-full truncate` to the existing `<p data-testid="arrangement-selected-clip">`. Its `title` holds the same full text the `<p>` renders. The visible text and the test id are unchanged.
- **Empty state (no single selected clip):** render one placeholder `<p>`:
  - `aria-hidden="true"`, with the same typography and line-height classes plus `basis-full`;
  - containing a single non-breaking space;
  - `data-testid="arrangement-selected-clip-reserve"`.

  The test id `arrangement-selected-clip` is never on the placeholder.
- **Result:** the footer `offsetHeight` is identical with and without a selected clip, at 1440×900 and 1280×720 (Δ 0).
- **Unchanged:**
  - the status `<output>`, range, selection-count, lane-move and shortcut lines, and every text;
  - the floating-video code: `measureFloatingVideoAnchor`, expand/return, the inset and the placement timing;
  - the dock file.
- **Not part of D-29c (2):** the range, ≥ 2-clips and lane-move lines may still change the footer height. Measure them (§1.4a) and report them; they are not this round's fix (D-29g residual).

### 2.3 C-R11-03 — the panel keeps its rendered height when auto-fit turns off under the cap (`StudioWorkspace.tsx` and `ArrangementDetailPanel.tsx`)

**Today.** `changeTrackHeight` (l.520–523) sets `autoFit: false, detailCap: null`, so the panel jumps from its capped height (142) to the stored open height (144).

**Contract:**
- When auto-fit turns off **while the cap is engaged**, the panel's stored open height becomes the rendered (capped) height. Rendered height Δ 0 on that change, with no transition.
- Afterwards, the cap stays off (unchanged rule). The panel keeps that height through:
  - a window resize;
  - a panel collapse and reopen;
  - later lane-height changes.

  It changes only on a user resize (D-29b, unchanged).
- **The undo/snapshot path.** `snapshotTrackLaneLayout` restores `autoFit` and `detailCap` on `pointercancel`. Panel collapse and reopen does not need to be undone, but state in your report what the stored height is after a cancelled height drag.
- **Mechanism: your choice, smallest honest.** For example, the panel commits `min(stored, cap)` as its stored height when the cap goes from a number to `null` with a reason flag, or the workspace passes a one-shot signal. Constraints:
  - no new context, no history entry, no effect loop;
  - the detail **playhead line**, its writer, its `contain`/`will-change`/transform classes and the waveform SVG do **not** change. That is the R9-D3 compositor-only contract for C-R8-01; C diff-checks it;
  - when the cap is released for any other reason (room grows, user resize), behaviour stays as today.
- `panels.ts` may receive an **additive** pure helper if you need one. Existing exports keep their behaviour byte for byte.

### 2.4 Deviation 9 — a fold refused during a gesture writes the status (`StudioWorkspace.tsx`, `toggleTrackFold` only)

- In `toggleTrackFold` (l.482–486): when `current.isPointerGestureActive()`, call `current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` before returning.
- The layout does not change. The constant and its text are unchanged.

### 2.5 C-R15-03 — the Export key filter test (`export-dialog-focus.test.tsx`, add only)

Add one test (or one `it.each`) with a non-empty project, so `WAV-ის ექსპორტი` is enabled:
1. Focus the **last** enabled control (`WAV-ის ექსპორტი`).
2. Dispatch keydown `Enter` on it, then keydown `' '` (Space), as in the existing tests.
3. Assert, for each key:
   - `defaultPrevented === false`;
   - `document.activeElement` is still `WAV-ის ექსპორტი`.
4. Also assert the same for `Enter` on the **first** control (the X), so both ends are covered.

`ArrangementExportDialog.tsx` does **not** change. The guard is C's G6 mutation (`event.key !== 'Tab' && event.key !== 'Enter'`): the new test must fail under it.

### 2.6 Not allowed

- Any change to `ArrangementVideoDock.tsx`, `video-sync.ts`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementExportDialog.tsx`, `ArrangementContext.tsx` or `components/ui/**`.
- Re-placing, re-anchoring or resizing the expanded video after placement. No ResizeObserver, polling or new rAF loop.
- View state in `Arrangement`, history or `ArrangementContext`.
- A compact-size slider or a video fold (D-29).
- Widening any tolerance.
- Changing visible texts other than the selected-clip line's `title` and truncation.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..024}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**. It must stay byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- run `sha256sum -c ../tmp/studio-real-loop/b-round-15-tree-sha256.txt` (45 OK) and report any difference before you code;
- record the §3.3 frozen subset into `a-round-16/gates/frozen-start.txt`;
- copy the owned files to `a-round-16/bak/*.base.*`.

### 3.2 May modify or create this round

**Modify:**

| File | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | §2.1 only |
| `app/components/arrangement/StudioWorkspace.tsx` | §2.2 (footer), §2.3 (the C-R11-03 part of `changeTrackHeight` and any prop or signal to the panel), §2.4 (`toggleTrackFold`). Nothing else. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | §2.3 only. The playhead line, its writer and the waveform stay byte-identical. |
| `app/lib/arrangement/panels.ts` | Only an **additive** pure helper for §2.3, if needed. |
| `app/lib/arrangement/__tests__/track-layout.test.tsx` | Add tests (C-R11-01, C-R11-03, deviation 9). Changed existing assertions are named exceptions, each with before and after. |
| `app/lib/arrangement/__tests__/detail-panel.test.tsx` | Add tests (C-R11-03). Same exception rule. |
| `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` | Add §2.5 only. No existing test changes. |
| `app/lib/arrangement/__tests__/panels.test.ts` | Add tests only if you add a helper. |
| `docs/implementation/2026/quarter-IV/024-studio-lab-library-rows-modal-x.md` | Status and TODO lines only. They record: C round 15 FAIL only on the literal R15-P3 attribute check; C-R14-01/02 closed by C; C-R15-01 accepted by B (D-29g); C-R15-02/03 open → round 16. No "resolved" wording for C-R15-02/03. |

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/footer-reserve.test.tsx` (optional) | Component tests for §2.2. You may instead put them in `track-layout.test.tsx`; say which you chose. |
| `docs/implementation/2026/quarter-IV/025-studio-lab-panel-polish-14a.md` | Written per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 025 is taken). Contents: the five items, D-29c and D-29g with their rationale (why no re-placement), the measurements, the residual footer lines, the tests and your runs. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-16.md` | Your report (§8) |
| `../tmp/studio-real-loop/a-round-16/` | Runs, gates, shots and backups |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state |

### 3.3 Frozen this round

C checks these by sha256 against `b-round-15-tree-sha256.txt`:
- `ArrangementVideoDock.tsx`, `video-sync.ts` and `video-sync.test.ts`;
- `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementExportDialog.tsx`, `floating-video.test.tsx` and `panels.test.ts` (unless you add a helper);
- `ArrangementContext.tsx`, `position-store.ts` and `render-budget.test.tsx` (the C-R8-01/C-R6-02 targets for the Tech Lead run);
- `ArrangementClip.tsx`, `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx` and `ArrangementContext.test.ts`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts` and `graph.client.ts`;
- `components/ui/Modal.tsx`;
- docs 015–023.

**Read-only imports allowed:** `~/lib/utils` and the existing imports of the owned files.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config` or `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts` and `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**` and `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files and the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`. They are read-only; copy what you need into `a-round-16/`.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..15 work;
- leaving temporary instrumentation in source;
- **editing any `store/` file (including docs) while a browser measurement runs**, because Vite reloads the page.

## 4. Acceptance (C)

Viewports are 1440×900 and 1280×720. Pointer gestures are synthetic with `buttons: 1` unless a real `$B click` is named. Keys use real `$B press`. Every check reports measured numbers.

**R16-L1 (C-R11-01, folded handle).** At 1440×900, fold the music lane with the fold button (real click). Then:
1. `getComputedStyle(handle).pointerEvents === 'none'` and the cursor is not `row-resize`.
2. `elementFromPoint` at the bottom 3 px of a folded clip (x at its centre and at its trim edge) returns the clip or its trim edge, not the handle.
3. A synthetic pointerdown/move/up on the folded clip's bottom trim edge trims the clip (one Undo), and the lane stays folded (36 px).
4. A synthetic pointerdown at the handle's old rect does **not** unfold the lane.
5. Focus the handle by Tab or `.focus()`, then press real ArrowDown → the lane unfolds to its stored height, and the `aria-valuetext` texts are as in C-R11-04. Real ArrowUp on a folded handle also unfolds only.
6. Unfold, then repeat a handle drag (+20 px) → the height changes as in round 11 (R11-P2 quick), with one gesture and no history entry.
7. A synthetic DragEvent drop of a library item at the folded lane's bottom 3 px adds exactly one clip to that lane.

**R16-F1 (C-R11-02, footer reservation).** At 1440×900 and 1280×720, with auto-fit on and the panel open:
1. With nothing selected, `[data-testid=arrangement-selected-clip-reserve]` exists, `aria-hidden="true"`, and `arrangement-selected-clip` does not exist.
2. Select a clip (real click), then deselect it (click the empty lane background or Esc). At each step record the footer `offsetHeight`, the scroller `clientHeight`, every lane height, the panel height and the library body rect. Required: **Δ 0** for all of them across select ↔ deselect, at both viewports.
3. The C-R11-02 repro: at 1280×720 the lanes and the cap no longer jump. Report the constant values (expect lanes 60 and cap 142 if the line used its own row).
   - **Footer cost:** compare the no-selection footer `offsetHeight` against round 15 at both viewports (C's round-15 runs or A's pre-edit measurement). Report any added row and its px, and check it against A's §1.4a record. This is the D-29g price and not a failure, unless it is undisclosed or differs from A's number.
4. The selected line shows `კლიპი: … · start … · length … · source offset …` verbatim, on one line (`scrollWidth` may exceed `clientWidth` only with ellipsis), and its `title` equals its text content.
5. **Residual (information, not pass/fail):** record the footer height with a range only, with a clip and a range, and with ≥ 2 clips. Any line other than the selected-clip line that changes the height is listed (D-29g).

**R16-F2 (expanded video placement from the new body).** At 1440/288 and 1280/480, with no selection, click ⤢ with a real `$B click`:
- the R15-P1 formula holds against the **live** rects: width = max(160, min(640, lib − 16, (h − 16)·16/9, (h/2)·16/9)), top = max(body.t + 8, body.b − 8 − h), left = lib.l + 8 (±1);
- the inset = height + 16;
- hit-tests on ◀, search, separator and preview return the control;
- report the new numbers against round 15.

**R16-F3 (the exact C-R15-02 flow).** At 1280×720, library 480 (separator ArrowRight ×14), video imported, no clip selected:
1. Click ⤢ (real), then click search (real), type `soft`, click the option (real) and press real Enter. One clip is added and selected.
2. Required:
   - the library body rect is **unchanged** by the add and select (Δ 0);
   - the box bottom ≤ body.bottom − 8 + 1;
   - `elementFromPoint` on C's round-15 preview sample points (`c-round-15/runs/selection-footer-1280-480.txt`; at least the strip's top 12 px across its width) returns the preview strip or a descendant, **not** the box;
   - the box did not move or return; one Undo entry.
3. Deselect (Esc, or a click on the empty lane) → body Δ 0, box unchanged.
4. **Residual (information):** with the video still expanded, set a time range (ruler or keyboard). Record the body change and whether the box now overlaps the preview strip. If a preview control (the wave or the toggle), ◀, search or the separator is covered, that is a **new bug** for B, not a pass.

**R16-H1 (C-R11-03, cap → auto-fit off).** At 1280×720, auto-fit on and the panel capped (open, a clip selected if needed so the cap engages; record the cap value):
1. Change one lane's height with a real ArrowDown on its handle (the first manual change, which turns auto-fit off). The panel's rendered height Δ 0 (no jump to 144), and no height transition runs on the panel.
2. Resize the window to 1440×900 and back → the panel height stays at the kept value.
3. Collapse and reopen the panel (its toggle) → it reopens at the kept value.
4. A user resize of the panel by the separator (synthetic drag +10) → the D-29b behaviour: the panel follows the drag and the stored value is the new height.
5. **Control case:** at 1440×900, where the cap is not engaged, a first manual lane change leaves the panel at its stored height (144). This is unchanged behaviour.
6. The R9-D3 static check: `git diff` on `ArrangementDetailPanel.tsx` (against `a-round-16/bak`) does not touch the playhead line element, its writer or the waveform SVG. Paste the hunk list.

**R16-G1 (deviation 9).** Start a clip drag (synthetic pointerdown + move, held). While it is held, click the fold button (synthetic, a second pointer) or press real Space on the focused fold button. Required:
- the lane does not fold;
- the status shows `GESTURE_EDIT_BLOCKED_MESSAGE` verbatim;
- after pointerup, the fold works normally (one click folds).

**R16-T1 (C-R15-03).** The new test exists and passes. C re-runs its G6 mutation (and a variant that handles every key) on a copy, and **at least one test fails** under each.

**R16-U (unit and component tests).**
- **C-R11-01:** a folded handle has the `pointer-events-none` class and no `cursor-row-resize`; unfolded is unchanged; ArrowDown/ArrowUp on a folded handle unfold.
- **C-R11-02:**
  - with no selection, the reserve placeholder is rendered, `aria-hidden`, with `basis-full` and the same text classes;
  - with a selection, the real line has `basis-full truncate` and a `title` equal to its text;
  - `arrangement-selected-clip` is never on the placeholder.
- **C-R11-03:**
  - with the cap engaged (mocked metrics), the first `changeTrackHeight` keeps the panel's rendered height and stores it;
  - a later window resize, or a collapse and reopen, does not change it;
  - a cap release for another reason (metrics grow) still restores the stored height as today.
- **Deviation 9:** `toggleTrackFold` during an active gesture writes `GESTURE_EDIT_BLOCKED_MESSAGE` and does not change `folded`.
- **C-R15-03:** §2.5.
- **Guard proof** (`a-round-16/guard-proof.txt`). Each mutation is temporary; restore it and check with `cmp` against your pre-guard copy:
  1. drop `pointer-events-none` on the folded handle → a C-R11-01 test fails;
  2. render the selected-clip row only when selected (no placeholder) → a C-R11-02 test fails;
  3. revert the C-R11-03 mechanism (auto-fit off clears the cap without keeping the height) → a C-R11-03 test fails;
  4. remove the status write in `toggleTrackFold` → the deviation-9 test fails;
  5. C's G6 mutation in `ArrangementExportDialog.tsx` → the C-R15-03 test fails.

**R16-Doc.**
- Doc 024's status lines show C round 15 exactly as in §3.2.
- Doc 025 contains no unverified PASS.

## 5. Required tests (behavioural, named)

- Everything in R16-U, with the five-part guard proof.
- List every changed assertion in your report, with before and after.

## 6. What C verifies (focused, per the workflow)

1. **The fixes:** R16-L1, R16-F1, R16-F2, R16-F3, R16-H1, R16-G1, R16-T1, R16-U and R16-Doc.
2. **Adjacent regressions only** (1440×900 unless stated):
   - **R15-P3 quick (D-29g reading):** after ✕ and after Esc, the tree `nav` and the listbox have no inline declarations (`style.cssText === ''`), padding-bottom 4 px and `scrollHeight` equal to the pre-expand value.
   - **R13-F2 quick:** drag +200/+100 from the default placement lands at +200/+100 (±1); ⠿ ArrowRight ×3 = +48; no history entry.
   - **R13-F3 quick:** ✕, the placeholder and Esc return the box to 160×90 with the same `<video>` nodes.
   - **R11-P2 / R11-P2a quick (track layout):** at both viewports:
     - fold and unfold by the fold button;
     - a handle drag on an unfolded lane;
     - auto-fit values with no selection;
     - the D-29b user resize does not jump.
   - **R14-E quick:** E1 (open → `დახურვა`, Enter closes), E4 (Esc closes and restores focus), and the Tab ×4 cycle stays inside the dialog.
   - **R11A-1 quick:** ◀/▶, the rail is 40 px, the separator stays in 288–480.
   - **Dock quick:** 1152×107 / 992×107, a 160×90 video, one visible `<video>`, both muted.
   - **RF7-P2:** `render-budget.test.tsx` sha unchanged and green.
   - **No sync runs.** The dock, `video-sync.ts` and `ArrangementContext.tsx` are frozen and sha-checked. If C sees a stall, a hard seek or a counter change during the checks, it opens a bug; no extra runs.
3. **Gates:**
   - **G16-1:**
     - tsc 0;
     - vitest ≥ **965** + the new tests, 0 failures. If the known `sfx-library.test.tsx` load flake recurs, re-run that file alone and report both results;
     - build passes;
     - Biome 0 errors on the owned paths and on `./app`.
   - **G16-2:**
     - protected hashes OK;
     - `git status` and `git diff --stat` show only §3.1/§3.2 paths. The two foreign agent files are excluded and reported to root;
     - `Header.tsx` identical to HEAD;
     - every §3.3 file matches `b-round-15-tree-sha256.txt`, including `ArrangementVideoDock.tsx`, `ArrangementLibrary.tsx`, `ArrangementExportDialog.tsx`, `ArrangementContext.tsx` and `components/ui/Modal.tsx`;
     - the owned files' base backups `a-round-16/bak/*.base.*` match `b-round-15-tree-sha256.txt`;
     - no change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `studio-lab-demo.ts`;
     - instrumentation grep = 0.
   - **G16-3:** anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view`/`scroll` events are known and allowed (root notes).
4. **Harness rules:** H1, H2 and H3 apply as before.
5. **Closed root carry (do not list as open).** Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed by C's own PASSes.

   Still carried, and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the export hard-clip at 0 dBFS (R13-M4, SRW-13);
   - the final commit/push only after everything;
   - the uncommitted round-6..16 tree (root exposure note);
   - the shared `Modal.tsx` focus gap, including focus on `body` escaping the trap (root/UI owner);
   - root GA sends `scroll` with consent denied (root analytics);
   - the two foreign agent files (root);
   - the `publication-checkpoint.json` requirements (library/stems/scrollbars, T12, the final commit/push).
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R6-02, C-R8-01 and the RF7-3 quiet-Chrome run (Tech Lead);
   - C-R12-01 (milestone RF5-3);
   - polish 14b/14c (rounds 17–18);
   - the 21 regression-debt IDs (milestone);
   - the Tech Lead manual checks, including R11-P3m, R11-SB, R13-RM and R15-SB.

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-15-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/export-dialog-focus.test.tsx
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/components/arrangement
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

If you create `footer-reserve.test.tsx` (or touch `panels.test.ts`), add it to the first vitest line.

**`/check` rule (unchanged):**
- Run `biome check --write` only on the **named files** you own this round. Never point it at a directory and never at `Header.tsx`.
- Run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files; then re-run the hash check.
- Never run `npm run format`.

**Dev server and browser:**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`.
- Use real `$B press` for keys; synthetic pointers need `buttons: 1`.
- Media: `../tmp/studio-real-loop/media/`.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** The task touches 3+ source/test files plus docs:
- invoke the actual `code-reviewer` subagent on the full diff of every file you touch;
- fix its findings, then re-run it on the fix delta;
- quote both summaries.

The `design-philosopher` is optional, for the footer row (truncate and `title`). If you invoke it, report any conflict to B; do not apply it.

## 8. Report `../tmp/studio-real-loop/a-round-16.md`

1. The pre-flight gate, including the §1.4 measurements.
2. The design of each fix, including the C-R11-03 mechanism and why it is the smallest.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..15 file was reverted;
   - `frozen-start.txt` matches `b-round-15-tree-sha256.txt`;
   - `Header.tsx` is byte-identical to HEAD;
   - the dock, `ArrangementLibrary.tsx`, `ArrangementExportDialog.tsx`, `ArrangementContext.tsx` and `Modal.tsx` are unchanged;
   - the detail playhead and waveform hunks are untouched;
   - instrumentation is gone.
4. Verbatim command tails.
5. Your R16-L1/F1/F2/F3/H1/G1 runs (A's evidence, not a verdict), with numbers and these shots:
   - `folded-handle-1440.png`;
   - `footer-select-deselect-1280.png`;
   - `c-r15-02-flow-1280-480.png`;
   - `cap-autofit-off-1280.png`.
6. New and changed tests, each with its reason, plus before and after for every named exception and the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with its reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 17:** polish 14b (detail panel: L11, L2–L7, design-philosopher (a)–(d)).
- **Round 18:** 14c (context/preview: M1, M-R10-1/M2, L8), once the Tech Lead C-R8-01/C-R6-02 evidence frees those files or B schedules them.
- **Then:**
  - the milestone regression, including the 21 regression-debt IDs and C-R12-01 under RF5-3;
  - SRW-13 onwards in dependency order (13 → 14/15 → 16 → 17 → 18 → 19 → 20);
  - the SRW-21 adapter contract;
  - T12.
