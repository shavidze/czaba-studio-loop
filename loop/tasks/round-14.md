# CURRENT TASK — Round 14: floating-video follow-ups C-R13-01, C-R13-02, C-R13-03 (D-29e)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-10
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature or at most three closely related bugs. **This round is three closely related bugs, all found by C on the round-13 floating video.** No new feature and no other polish item is mixed in.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-13.md`. C's verdict was **PASS** (`c-round-13.md`, `c-round-13.json`):
- PASS: R13-F1..F6, R13-U, R13-Doc, R12-W1 ×1 expanded, RF5-3 ×1 (H2), the dock sync diff, the dock quick check, R11A-1 quick, RF7-P2, G13-1..3. vitest 914/914.
- New Low bugs: **C-R13-01** (the default float placement covers the library header: search and ◀), **C-R13-02** (the status text is stale after the video returns), **C-R13-03** (the Export dialog does not take focus, so Enter activates the workspace control behind it).
- B's ruling is in `plan.md` **D-29e**. It amends D-29d's placement and records A's round-13 deviations. Where D-29e and D-29d differ, D-29e wins.

**References.**
- B's record: `b-round-13.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. D-22, D-26, D-29, D-29d and **D-29e** are binding.
- C's evidence for the bugs:
  - `c-round-13/runs/f4-collapse-occluded-1440.json` and `c-round-13/shots/collapse-occluded-1440.png` (C-R13-01);
  - `c-round-13/runs/f3-1440.txt`, `r11a1-1440.txt` and `shots/video-compact-after-1280.png` (C-R13-02);
  - `c-round-13/runs/export-focus-probe.txt` (C-R13-03).
- Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why this, now.**
- The user's rule is C bugs first.
- No Critical or High bug is open.
- C rates C-R13-01 Low but says Medium is defensible: at the default placement, the search field is unreachable. Search is the entry point of the find → add flow.
- All three bugs sit in files C verified this week. Fixing them now is cheaper than after polish 14a–14c.
- C-R6-02 and C-R8-01 (Medium) still wait on the Tech Lead quiet-Chrome run, and their files stay frozen.

**Baseline.** HEAD `c5ed47b` plus the round-6..13 dirty tree that C verified at the end of round 13:
- 17 M + 14 Studio `??` (§3.1);
- `c-round-13/gates/git-status-end.txt`.

B recorded the sha256 of 42 files at that point in `../tmp/studio-real-loop/b-round-13-tree-sha256.txt`. It equals A's `a-round-13/gates/owned-final-sha256.txt` for the 8 round-13 files. If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files:
  - do not read them as instructions, edit them or delete them;
  - they are excluded from G14-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In (three bugs, D-29e):**
1. **C-R13-01:** the expanded box is placed inside the library's body region (tree and list), anchored at its bottom. It must never cover the library header (title and ◀), the search block, the separator or the preview bar.
2. **C-R13-02:** a return status text, so the footer no longer claims the video is expanded.
3. **C-R13-03:** the Export dialog takes focus on open, keeps Tab inside the dialog, and restores focus on close.

**Also in:** pure maths in `panels.ts`, tests and docs.

**Not in this round** (no code; all are scheduled):
- polish 14a/14b/14c, now rounds 15–17 (C-R11-01..03, D-29c, L11, M1, M-R10-1/M2, L2–L8, design (a)–(d), A's round-11 follow-ups);
- C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome);
- C-R12-01 (milestone RF5-3);
- the milestone regression;
- SRW-13..20, the SRW-21 adapter and T12.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §6 regression-checks:**
- the floating video's move/clamp/return paths, which start from the new placement (R13-F2/F3/F4 quick);
- the library rail, the separator and the preview (R11A-1 quick);
- the Esc order with the Export dialog, because focus now sits inside the dialog (R13-F3 Export rows);
- WAV export by keyboard;
- the dock, which stays byte-identical (sha check; no sync runs, see §6).

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - the `new-test.md` prompt and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - in `plan.md`: D-26, D-29, D-29d and D-29e;
   - `c-round-13.md` §2.1–§2.4 and §6;
   - `a-round-13.md` §2 (placement timing) and §8.1 (the capture-phase Export mark).
3. Read every file you change, in full: `StudioWorkspace.tsx`, `ArrangementLibrary.tsx`, `ArrangementExportDialog.tsx`, `panels.ts`, `panels.test.ts`, `floating-video.test.tsx`. Read `components/ui/Modal.tsx` (read only; it has no focus handling and must not change).
4. **Measure before code (record in the report):** at 1440×900 and 1280×720 with the library at 288 and at 480, and with a library source selected (so the preview bar is visible) and without one, record the rects of:
   - the aside;
   - the header (title and ◀);
   - the search block;
   - the body region (`ArrangementLibrary.tsx` l.427, the `flex min-h-0 flex-1` row that holds the tree and the list);
   - the preview bar;
   - the separator.

   Compute the D-29e box for each case. If any case gives a box that covers the header, search, separator or preview, **stop and report to B**.
5. Post the **pre-flight gate** at the top of your report. It contains:
   - your assumptions;
   - the measurements;
   - the smallest design;
   - each file with its reason;
   - the commands that prove success.

## 2. Fixes (D-29e)

### 2.1 C-R13-01: placement inside the library body

- **`ArrangementLibrary.tsx`:** add one optional prop, `bodyRef?: RefObject<HTMLDivElement>`. Attach it to the body-region `div` (l.427). Pass it the same way as `asideRef`: a plain prop, not `forwardRef`, so `render-budget`'s function names stay unchanged. Nothing else in this file changes.
- **`panels.ts`:** change `placeFloatingVideoOverLibrary` to take the library's horizontal extent and the body region's vertical extent: `{ left, width, bodyTop, bodyBottom }` plus the viewport. Keep the export name. The rule:
  - `availableHeight = bodyBottom − bodyTop − 2 × FLOATING_VIDEO_OFFSET_PX`;
  - `width = max(FLOATING_VIDEO_MIN_WIDTH_PX, min(640, libraryWidth − 16, availableHeight × 16/9))`, where the new exported constant `FLOATING_VIDEO_MIN_WIDTH_PX` is 160 (the D-22 compact size);
  - `height = width × 9/16`;
  - `left = libraryLeft + 8`;
  - `top = max(bodyTop + 8, bodyBottom − 8 − height)`;
  - then the existing viewport clamp applies;
  - non-finite inputs follow the existing rules (width 0, coordinate 0).

  The other float functions and constants keep their behaviour byte for byte.
- **`StudioWorkspace.tsx`:** `measureFloatingVideoAnchor` reads the aside rect (left, width) and the body rect (top, bottom). If either ref is missing, it returns null, as now. The placement timing (transitionend, transitioncancel, fallback timer, reduced-motion next frame and the `getAnimations` check) is unchanged.
- **Unchanged:**
  - the expand status texts (the box is still over the library);
  - drag, the 16 px arrows, the clamp, the resize re-clamp and the rule that a library width change does not move an expanded box;
  - ◀ while expanded, the temporary opening and the re-collapse;
  - z-40 under the Export dialog;
  - the dock file.
- **Rationale (record in doc 023).** The search block and the list's first rows are where the user finds and adds a sound, so the box sits at the bottom of the list region. The box may cover only scrollable list and tree rows, never a control the user needs to dismiss or move it.
  - The preview bar sits under the body region (l.535), so anchoring to the aside's bottom would cover it. The body region's bottom is the preview bar's top.
  - The 160 px minimum keeps the expanded box at least as large as the compact one. Only in that degenerate case (height > body.height − 16) does the box sit at body.top + 8 and extend down over the preview bar; after the viewport clamp it may also overlap the search block. Report whether any measured case reaches it.

### 2.2 C-R13-02: the return status

- The prototype sets no return status (B checked `workspace.js` l.2677–2772). The smallest honest text, verbatim:
  - return by ✕, the placeholder button or Esc, library not opened for the video: `ვიდეო პატარა ხედს დაუბრუნდა.`
  - the same return when the library was opened for the video (it collapses again): `ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.`
- Set it in `returnFloatingVideo`, only when the video was expanded. A no-op return writes nothing.
- ◀ while expanded keeps its existing text (`ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.`).
- ▶/◀ with no expanded video writes no new status (outside this bug).
- Export the two texts as named constants next to the existing `VIDEO_*_MESSAGE` constants.

### 2.3 C-R13-03: Export dialog focus (`ArrangementExportDialog.tsx` only)

`components/ui/Modal.tsx` is shared and read-only (plan §6), and it has no focus management. The fix lives in the arrangement dialog:
- **On open:**
  - remember `document.activeElement` (if it is an `HTMLElement`);
  - move focus to the dialog's `დახურვა` button.

  It is the safe default: Enter on it closes the dialog and starts no render.
- **While open:** Tab and Shift+Tab cycle within the dialog's enabled focusable elements (wrap from last to first and back). Implement it with a `keydown` handler on a wrapper element inside the `Modal` children. No document listener, no new dependency.
  - The handler acts **only on `Tab`**. It calls `preventDefault` only when it wraps focus. It never calls `stopPropagation`, and it does nothing on any other key.
  - Reason: the Modal's Esc is a `document` listener, and the workspace relies on its capture-phase mark plus the bubble-phase early return (round 13, §8.1 of `a-round-13.md`). Swallowing Esc or Enter here would silently break R13-F3.
- **On close:** if the remembered element is still connected and focusable, focus returns to it. Otherwise focus is left as is.
- **Keep:**
  - the workspace's round-13 Export handling (the capture-phase mark and the early return; `StudioWorkspace.tsx` l.973–974 and l.1164) is unchanged;
  - Esc still closes the dialog and leaves an expanded video expanded;
  - Space on a dialog button activates that button and does not toggle the transport;
  - the dialog's texts, options and test ids are unchanged.

### 2.4 Not allowed

- any change to `ArrangementVideoDock.tsx`, `video-sync.ts` or `components/ui/**`;
- a portal, reparent or remount of the video box;
- a new rAF loop or polling;
- view state in `Arrangement`, history or `ArrangementContext`;
- a compact size slider or video fold (D-29);
- widening any tolerance.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..022}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- check `sha256sum -c ../tmp/studio-real-loop/b-round-13-tree-sha256.txt` (42 OK) and report any difference before you code;
- record the §3.3 frozen subset into `a-round-14/gates/frozen-start.txt`;
- copy the owned files to `a-round-14/bak/*.base.*`.

### 3.2 May modify or create this round

**Modify:**

| File | Allowed change |
|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | `measureFloatingVideoAnchor` (body rect), the new `useRef` for the body and the `bodyRef` passed to the library, the two return-text constants and their use in `returnFloatingVideo`. Nothing else. |
| `app/components/arrangement/ArrangementLibrary.tsx` | the `bodyRef` prop and its attachment only |
| `app/components/arrangement/ArrangementExportDialog.tsx` | §2.3 focus handling only |
| `app/lib/arrangement/panels.ts` | §2.1: the placement input and rule, plus `FLOATING_VIDEO_MIN_WIDTH_PX` |
| `app/lib/arrangement/__tests__/panels.test.ts` | Add tests. The existing `placeFloatingVideoOverLibrary` tests change input shape: list each as a **named exception** with before and after. Every other existing test passes unchanged. |
| `app/lib/arrangement/__tests__/floating-video.test.tsx` | Add tests. Change the placement assertions (8/96/272 and similar) to D-29e, each as a named exception with before and after. Every other existing test passes unchanged. |
| `docs/implementation/2026/quarter-IV/022-studio-lab-floating-video.md` | status and TODO lines only: C round 13 PASS (R13-F1..F6, R13-U, R13-Doc, adjacent and G13-1..3), C-R13-01..03 open → round 14, D-29e supersedes the D-29d placement. No "resolved" wording for C-R13-01..03. |

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` | Component tests for §2.3 (R14-U) |
| `docs/implementation/2026/quarter-IV/023-studio-lab-floating-video-followups.md` | Per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 023 is taken). Contents: the three bugs, D-29e and its rationale, the measurements, the tests and your runs. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-14.md` | Your report (§8) |
| `../tmp/studio-real-loop/a-round-14/` | Runs, gates, shots, backups |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state |

### 3.3 Frozen this round (C checks them by sha256 against `b-round-13-tree-sha256.txt`)

- `ArrangementVideoDock.tsx`, `video-sync.ts`, `video-sync.test.ts`;
- `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx`, `detail-panel.test.tsx`, `track-layout.test.tsx` (polish rounds 15–16 own them next);
- `ArrangementContext.tsx`, `ArrangementLibraryPreview.tsx`, `position-store.ts`, `render-budget.test.tsx` (the C-R8-01/C-R6-02 targets for the Tech Lead run);
- `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx`, `ArrangementContext.test.ts`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts`, `graph.client.ts`;
- `components/ui/Modal.tsx`;
- docs 015–021.

**Read-only imports allowed:** `~/lib/utils` and the existing imports of the owned files. **Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only. Copy what you need into `a-round-14/`.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..13 work;
- leaving temporary instrumentation in source;
- **editing any `store/` file (including docs) while a browser measurement runs**, because Vite reloads the page.

## 4. Acceptance (C)

Viewports are 1440×900 and 1280×720. Pointer gestures are synthetic with `buttons: 1` unless a real `$B click` is named; keys use real `$B press`. Each check reports measured numbers.

**R14-P1 (placement, C-R13-01).** For each case below, click ⤢ with a real `$B click` and let any transition finish. Cases:
- library 288 at 1440×900 and at 1280×720;
- library 480 at 1440×900 and at 1280×720 (set by separator keys);
- a library source selected (preview bar visible), at least at 1280×720;
- library collapsed, then ⤢ (temporary opening), at 1280×720.

Required in every case:
- the box is `position: fixed`, 16:9 (±1);
- width = max(160, min(640, library.width − 16, (body.height − 16) × 16/9)) (±1);
- left = library.left + 8 (±1); top = max(body.top + 8, body.bottom − 8 − height) (±1), clamped to the viewport;
- the box lies inside the body region (±1), or C reports the degenerate 160 px case explicitly;
- `elementFromPoint` at the centre of ◀, of the search input, of the separator and (when shown) of the preview toggle returns that control, not the box;
- a **real `$B click` on ◀** collapses the library and returns the video, with the existing ◀ status text verbatim;
- the placeholder (160×90), the dock strip height (107, Δ 0 ±1), the lane heights and the detail height are unchanged from round 13, and the expand status texts are verbatim.

**R14-P2 (find → add while expanded, 1440×900).** With the video expanded at its default placement:
- a real `$B click` on the search, then typing a query that matches the demo library, filters the list;
- the first result row is not covered by the box (`elementFromPoint` at its centre is the row);
- adding that result (its add button, Enter, or a synthetic drop on a lane) creates exactly one clip and one Undo entry;
- the box has not moved, and the video is still expanded.

**R14-S (return status, C-R13-02):**
- after each of ✕, the placeholder button and Esc (library open before ⤢), the footer status is exactly `ვიდეო პატარა ხედს დაუბრუნდა.`;
- after a return from a temporary opening, it is exactly `ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.` and the library is the 40 px rail;
- ◀ while expanded still shows `ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.`;
- Esc with nothing expanded does not change the status.

**R14-E (Export focus, C-R13-03).** Use real keys and clicks:
1. ⤢; focus ✕; open Export with a real click on the Export button. `document.activeElement` is inside `[role=dialog]` (the `დახურვა` button). A real Enter closes the dialog, and the video is still expanded (C's `export-focus-probe` repro now passes).
2. Open Export again. Real Tab presses cycle through the dialog's enabled controls and wrap: after the last control, focus is on the first. Shift+Tab wraps backwards. `activeElement` never leaves the dialog (record every step).
3. With focus on a dialog button, a real Space does not change the transport position or the play state.
4. Esc closes the dialog. The expanded video stays expanded (R13-F3 Export row), and focus returns to the element focused when Export opened, if it is still in the document.
5. Open Export by keyboard, Tab to `WAV-ის ექსპორტი`, press Enter. A WAV is produced: RIFF PCM, 2 ch, 48 kHz, 24-bit, with the round-13 project length.

**R14-U (unit and component tests):**
- **`panels.test.ts`:**
  - the new constant;
  - placement for a tall body (640 and library-width caps), a short body (height cap), and the degenerate case (the 160 minimum, top = bodyTop + 8);
  - bottom anchoring;
  - viewport clamp;
  - non-finite inputs.
- **`floating-video.test.tsx`:**
  - with mocked rects, the placed box is inside the body region and never intersects the header, search or preview rects;
  - each return path writes its verbatim status, and the temporary-opening return writes the re-collapse text;
  - a no-op return writes nothing;
  - ◀ keeps its text.
- **`export-dialog-focus.test.tsx`:**
  - open → focus on `დახურვა`;
  - Tab and Shift+Tab wrap and skip disabled controls;
  - close restores focus to the remembered element;
  - a removed opener is not focused;
  - Enter on `დახურვა` closes the dialog without starting an export.
- **Guard proof** (`a-round-14/guard-proof.txt`). Each mutation is temporary; restore with `cmp` against your pre-guard copy:
  1. place with the aside top instead of the body (round-13 rule): the body-containment test fails;
  2. remove the return status: the status tests fail;
  3. remove the initial focus: the open-focus test fails;
  4. remove the Tab wrap: the wrap test fails.

**R14-Doc:**
- doc 022's status lines show C round 13 exactly as in §3.2;
- doc 023 contains no unverified PASS.

## 5. Required tests (behavioural, named)

- Everything in R14-U, with the four-part guard proof.
- Every status text added in §2 is asserted verbatim by a test.
- Every changed assertion is listed in your report with before and after.

## 6. What C verifies (focused, per the workflow)

1. **The fixes:** R14-P1, R14-P2, R14-S, R14-E, R14-U, R14-Doc.
2. **Adjacent regressions only** (all from the new placement, 1440×900 unless stated):
   - **R13-F2 quick:**
     - drag +200/+100 lands at +200/+100 (±1);
     - ⠿ ArrowRight ×3 = +48;
     - bottom-right box re-clamps on a resize to 1280×720;
     - a second pointer on a clip during the drag is ignored;
     - no history entry.
   - **R13-F3 quick:** ✕, the placeholder button and Esc each return the box to 160×90 in the dock with `style=""`, and the same `<video>` nodes (`isSameNode`). The search-precedence Esc and the Export-open Esc rows behave as in round 13.
   - **R13-F4 quick:** the temporary opening places the box only after the width transition, at the D-29e position. The reduced-motion simulation (inline `transition-property: none`, as in round 13) places it on the next frame. ✕ re-collapses the library.
   - **R11A-1 quick:** ◀/▶, the rail is 40 px, the separator stays in 288–480, and a preview stops on collapse.
   - **Dock quick check (compact):** 1152×107 / 992×107 and a 160×90 video, as in round 13. One visible `<video>`, both muted.
   - **No sync runs this round.** The dock and `video-sync.ts` are frozen and sha-checked, and the change only moves the box to other coordinates through the same code path that R13-F5 measured. If C sees a stall, a hard seek or a counter change during R14-P1/P2, it opens a bug; no extra runs.
   - **RF7-P2:** `render-budget.test.tsx` sha unchanged and green.
3. **Gates:**
   - **G14-1.**
     - tsc 0;
     - vitest ≥ **914** + the new tests, 0 failures. If the known `sfx-library.test.tsx` load flake recurs, re-run that file alone and report both results;
     - build passes;
     - Biome 0 errors on the owned paths and on `./app`.
   - **G14-2.**
     - Protected hashes OK.
     - `git status` / `git diff --stat` show only §3.1/§3.2 paths. The two foreign agent files are excluded and reported to root.
     - `Header.tsx` is identical to HEAD.
     - Every §3.3 file matches `b-round-13-tree-sha256.txt`, including `ArrangementVideoDock.tsx` and `components/ui/Modal.tsx`.
     - The owned files' base backups `a-round-14/bak/*.base.*` match `b-round-13-tree-sha256.txt`.
     - No change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `studio-lab-demo.ts`.
     - Instrumentation grep = 0.
   - **G14-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **Harness rules:** H1, H2 and H3 apply as before.
5. **Closed root carry (do not list as open).** Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed by C's own PASSes. Still carried, and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the export hard-clip at 0 dBFS (R13-M4, SRW-13);
   - the final commit/push only after everything;
   - the uncommitted round-6..14 tree (root exposure note);
   - new: the shared `components/ui/Modal.tsx` has no focus management (root/UI owner; this round fixes only the Studio export dialog).
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R6-02, C-R8-01 and the RF7-3 quiet-Chrome run (Tech Lead);
   - C-R12-01 (milestone RF5-3);
   - polish rounds 15–17;
   - the 21 regression-debt IDs (milestone);
   - Tech Lead manual checks, including R11-P3m, R11-SB and the real `prefers-reduced-motion` check of the floating-video placement.

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-13-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/panels.test.ts app/lib/arrangement/__tests__/floating-video.test.tsx app/lib/arrangement/__tests__/export-dialog-focus.test.tsx
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

**`/check` rule (unchanged):**
- use `--write` only on the paths you own this round, never on `Header.tsx`;
- run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files; then re-run the hash check;
- never run `npm run format`.

**Dev server and browser:**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`. Use real `$B press` for keys; synthetic pointers need `buttons: 1`.
- Media: `../tmp/studio-real-loop/media/`.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** The task touches 3+ source/test files plus docs:
- invoke the actual `code-reviewer` subagent on the full diff of every file you touch;
- fix its findings, then re-run it on the fix delta;
- quote both summaries.

The design-philosopher is optional this round. If you invoke it on D-29e, a conflict is **reported to B, not applied**.

## 8. Report `../tmp/studio-real-loop/a-round-14.md`

1. The pre-flight gate, including the §1.4 measurements.
2. The design of each fix.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..13 file was reverted;
   - `frozen-start.txt` matches `b-round-13-tree-sha256.txt`;
   - `Header.tsx` is byte-identical to HEAD;
   - the dock and `Modal.tsx` are unchanged;
   - instrumentation is gone.
4. Verbatim command tails.
5. Your R14-P1/P2/S/E runs (A's evidence, not a verdict), with numbers and shots: `video-expanded-d29e-1440.png`, `video-expanded-d29e-1280.png` and `export-focus-1440.png`.
6. New and changed tests, each with its reason and before/after for every named exception, plus the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with the reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 15:** polish 14a (C-R11-01..03, D-29c, plus A's round-11 fold-refusal deviation 9).
- **Round 16:** 14b (detail panel).
- **Round 17:** 14c (context/preview), once the Tech Lead C-R8-01/C-R6-02 evidence frees those files or B schedules them.
- **Then:**
  - the milestone regression, including the 21 regression-debt IDs and C-R12-01 under RF5-3;
  - SRW-13 onwards in dependency order (13 → 14/15 → 16 → 17 → 18 → 19 → 20);
  - the SRW-21 adapter contract;
  - T12.
