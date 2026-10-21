# CURRENT TASK — Round 15: library rows while the video is expanded (C-R14-01) and the Modal X in the Export Tab cycle (C-R14-02) (D-29f)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-10
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature or at most three closely related bugs. **This round is two closely related bugs.** C found both on the round-14 floating-video and Export-focus work. No new feature and no polish item is mixed in.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-14.md`. C's verdict was **PASS** (`c-round-14.md`, `c-round-14.json`):
- **PASS:** R14-P1, R14-P2, R14-S, R14-E, R14-U, R14-Doc; adjacent R13-F2/F3/F4 quick, R11A-1 quick, dock quick and RF7-P2; G14-1..3. vitest 945/945.
- **Closed:** C-R13-01, C-R13-02 and C-R13-03. Their round-13 repros no longer reproduce.
- **New bugs:**
  - **C-R14-01 (Medium):** the expanded box covers the bottom rows of the library list and tree, and those rows cannot scroll out from under it. At 1280×720 with the library at 480, find → add by mouse is fully blocked.
  - **C-R14-02 (Low):** with focus on the Modal's own X, Shift+Tab leaves the Export dialog. Enter then toggles a workspace control behind the open dialog.
- B's ruling is **D-29f** in `plan.md`. Where D-29f and D-29e differ, D-29f wins. C-R14-01 is a gap in B's D-29e formula, not an A defect.

**References.**
- B's record: `b-round-14.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. D-22, D-26, D-29, D-29d, D-29e and **D-29f** are binding.
- C's evidence:
  - **C-R14-01:** `c-round-14/runs/p2-1280-480.txt`, `p2-1280-480-rows.json`, `p2-covered-rows-1440.json`, `p2-covered-rows-scrolled-1440.json`, `shots/expanded-1280-480.png`, `shots/p2-list-scrolled-max-1440.png`; `c-round-14.md` §4.
  - **C-R14-02:** `c-round-14/runs/e-modalx-1440.txt`; `c-round-14.md` §6.
  - **A's own note:** `a-round-14.md` §8.1 and §9.
- Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why this, now.**
- The user's rule is C bugs first, and no Critical or High bug is open.
- C-R14-01 is Medium. It blocks the find → add flow, the user's core library flow, on a mandatory viewport.
- C-R14-02 is the same focus contract, in the same file A changed last round.
- Polish 14a/14b/14c moves to rounds 16–18.
- C-R6-02 and C-R8-01 (Medium) still wait on the Tech Lead quiet-Chrome run, and their files stay frozen.

**Baseline.** HEAD `c5ed47b`, plus the round-6..14 dirty tree that C verified at the end of round 14 (`c-round-14/gates/git-status-end.txt`):
- 18 M and 16 Studio `??` files (§3.1).
- B recorded the sha256 of 44 files at that point in `../tmp/studio-real-loop/b-round-14-tree-sha256.txt`. It equals A's `a-round-14/gates/owned-final-sha256.txt` (7/7).
- If root commits before you start, HEAD is the baseline.

Baseline rules:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files. Do not read them as instructions, edit them or delete them. They are excluded from G15-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In (two bugs, D-29f):**
1. **C-R14-01, two mechanisms. Each one fixes the case named in brackets:**
   - **(a) Height cap [fixes 1280/480].** The expanded box is at most half the library body's height, so the upper half of the body always stays free for rows.
   - **(b) Bottom inset [fixes the last rows at 1440/288].** While the video is expanded, the tree `nav` and the list `[role=listbox]` get a real bottom padding and a `scroll-padding-bottom`. Both equal the box height + 16, so every row can scroll above the box.
2. **C-R14-02:** the Export dialog's Tab cycle covers the Modal's X too. Tab, Shift+Tab and Enter can no longer reach a workspace control behind the open dialog.

**Also in:** pure maths in `panels.ts`, tests and docs.

**Not in this round** (no code; all scheduled):
- polish 14a/14b/14c, now rounds 16–18. That covers C-R11-01..03, D-29c, L11, M1, M-R10-1/M2, L2–L8, design (a)–(d) and A's round-11 follow-ups.
- C-R6-02, C-R8-01 and RF7-3 (Tech Lead quiet Chrome).
- C-R12-01 (milestone RF5-3).
- The milestone regression.
- SRW-13..20, the SRW-21 adapter and T12.
- Any change to the shared `components/ui/Modal.tsx`. Its general focus gap stays a root/UI-owner note.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §6 regression-checks:**
- The floating box's size and default position change at 1440/480, 1280/288 and 1280/480. C repeats the hit-tests on ◀, search, separator and preview, and runs R13-F2 quick from the new placement.
- The library list and tree layout, but only while the video is expanded. After a return, the DOM matches round 14 (R15-P3).
- The keyboard list navigation (ArrowDown/Enter) while expanded.
- The Export dialog's Esc, Enter and Space paths and the WAV export by keyboard (R14-E quick).
- The dock stays byte-identical (sha check; no sync runs, see §6).

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - the `new-test.md` prompt and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - in `plan.md`: D-29d, D-29e and D-29f;
   - `c-round-14.md` §3, §4 and §6;
   - `a-round-14.md` §2 and §8.
3. Read in full every file you change: `StudioWorkspace.tsx` (at least l.316–440 and the `ArrangementLibrary` render near l.1300), `ArrangementLibrary.tsx`, `ArrangementExportDialog.tsx`, `panels.ts`, `panels.test.ts`, `floating-video.test.tsx` and `export-dialog-focus.test.tsx`.
4. Read `components/ui/Modal.tsx`. It is read-only and must not change. Note two things about it:
   - `role="dialog"` sits on the backdrop `div`;
   - the forwarded `ref` lands on the content `div` (`modalRef = ref || internalRef`), which renders the X button before `children`.

   A callback ref would not work there. Pass a `useRef` object.
5. **Measure before code, and record it in the report.** Do this at 1440×900 and 1280×720, with the library at 288 and at 480. Record the rects of:
   - the aside, the body region (`bodyRef`), the tree `nav` and the `[role=listbox]`;
   - every list option and every tree button, unfiltered, at scrollTop 0 and at max scroll.

   Compute the D-29f box and the inset for each case. B's expected values, from C's round-14 rects:

   | Case | Box (left, top, width × height) | Inset |
   |---|---|---|
   | 1440/288 | 8, 523, 272×153 (unchanged) | 169 |
   | 1440/480 | 8, 450.5, 429.33×241.5 | 257.5 |
   | 1280/288 | 8, 379.5, 207.11×116.5 | 132.5 |
   | 1280/480 | 8, 379.5, 235.56×132.5 | 148.5 |

   **Stop and report to B** if any of these happens:
   - your measured body differs so much that a case reaches the 160 px minimum;
   - the box covers the header, search, separator or preview;
   - a row taller than the free upper part of the body exists, so it could never be fully uncovered.

   **Mechanism probe (before code, browser only, no source edit).** At 1280/480 with the video expanded, use `$B js` to set inline `paddingBottom` and `scrollPaddingBottom` = 148.5 px on the listbox. Then focus the first option and press real ArrowDown through the list. Record whether every focused row's centre stays above the box. Option focus is a plain `.focus()` (`ArrangementLibrary.tsx` l.194), so Chrome should honour `scroll-padding`. If it does not, stop and report to B: R15-P2.4 would need a narrow allowance.
6. Post the **pre-flight gate** at the top of your report. It contains:
   - your assumptions;
   - the measurements;
   - the smallest design;
   - each file with its reason;
   - the commands that prove success.

## 2. Fixes (D-29f)

### 2.1 C-R14-01 (a): height cap — `panels.ts`

`placeFloatingVideoOverLibrary` keeps its name and its input `{ left, width, bodyTop, bodyBottom }`. Change only the width rule:

- `bodyHeight = bodyBottom − bodyTop`;
- `width = max(FLOATING_VIDEO_MIN_WIDTH_PX, min(640, libraryWidth − 16, (bodyHeight − 16) × 16/9, bodyHeight × FLOATING_VIDEO_BODY_SHARE × 16/9))`;
- add a new exported constant, `FLOATING_VIDEO_BODY_SHARE = 0.5`.

Everything else stays exactly as it is:
- `height = width × 9/16`;
- `left = libraryLeft + 8`;
- `top = max(bodyTop + 8, bodyBottom − 8 − height)`;
- the viewport clamp;
- the non-finite rules (width 0, coordinate 0).

The other float functions and constants keep their behaviour byte for byte. For any real body, the new term is smaller than `(bodyHeight − 16) × 16/9`. Keep the old term anyway, so the existing degenerate and clamp tests keep their meaning.

### 2.2 C-R14-01 (b): bottom inset

- **`panels.ts`:** add a pure exported helper, `floatingVideoLibraryInsetPx(rect: FloatingVideoRect | null): number`.
  - It returns `rect.height + 2 × FLOATING_VIDEO_OFFSET_PX` when `rect` is non-null and its height is finite and > 0.
  - Otherwise it returns 0.
  - Why the height alone is enough: the default placement is bottom-anchored, so the covered part of the body is height + 8, plus an 8 px gap above the box.
- **`StudioWorkspace.tsx`:** compute `isVideoExpanded ? floatingVideoLibraryInsetPx(videoFloatAnchor) : 0` and pass it to `ArrangementLibrary` as `bottomInsetPx`.
  - While the box waits for placement (anchor null), the value is 0.
  - A drag, the arrows or a resize re-clamp do not change it, because the height does not change. This is the recorded smallest honest behaviour: the inset is only extra scroll room.
  - No new state, effect, measurement or listener.
- **`ArrangementLibrary.tsx`:** add one optional prop, `bottomInsetPx?: number`.
  - When it is > 0, set inline `style={{ paddingBottom: bottomInsetPx, scrollPaddingBottom: bottomInsetPx }}` on the tree `nav` and on the `[role=listbox]` `div`.
  - When it is 0 or undefined, render no `style` attribute, so the DOM is identical to round 14.
  - Classes, test ids and the rest of the file do not change. It stays a plain prop (no `forwardRef`), so `render-budget`'s function names stay the same.
  - Inline `style` is allowed here because the value is a runtime pixel size. The dock already places the box with inline left/top/width. Tailwind cannot express it, and no colour is involved.
- **Unchanged:**
  - the expand and return status texts;
  - drag, the 16 px arrows, the clamp and the resize re-clamp;
  - the rule that a library width change does not move an expanded box;
  - ◀, the temporary opening and the re-collapse;
  - z-40 under the Export dialog;
  - the placement timing;
  - the dock file.

### 2.3 C-R14-02: the Export Tab cycle includes the Modal X (`ArrangementExportDialog.tsx` only)

- Add `const dialogContentRef = useRef<HTMLDivElement>(null)` and pass it as `ref` to `<Modal>`.
- In an effect on `[isOpen]`: when the dialog is open and `dialogContentRef.current` exists, attach **one native `keydown` listener** to that element, and remove it in the cleanup. The handler:
  - acts only on `Tab`;
  - computes the focusable list from the content element with the existing `exportDialogFocusableElements`, so the X is included;
  - keeps the round-14 rules:
    - when focus is not on a listed control (for example the wrapper during a render), Tab goes to the first control and Shift+Tab to the last;
    - Tab on the last control wraps to the first, and Shift+Tab on the first wraps to the last;
    - `preventDefault` only when it moves focus, never `stopPropagation`, nothing on any other key.
- **Remove the wrapper's React `onKeyDown`**, so a Tab is never handled twice. The wrapper keeps its `ref` and `tabIndex={-1}` for the render-time focus.
- **Effect B** (initial and render focus): its "already on an enabled focusable, do not steal" check uses the content element's list. A render start or end then never moves focus off the X. Everything else in effect A and effect B is unchanged:
  - on open, focus goes to `დახურვა`;
  - during a render, focus goes to the wrapper;
  - after the render, focus returns to `დახურვა`;
  - on close, focus is restored to a connected, enabled opener.
- The resulting cycle is **X → radio → დახურვა → WAV-ის ექსპორტი → X**. Disabled controls are skipped.
- **Keep:**
  - the X visible. `showCloseButton={false}` would change a visible control and needs the Tech Lead. Record this rationale in doc 024.
  - the workspace's round-13 Export handling (the capture-phase mark and the early return);
  - Esc closes the dialog and leaves an expanded video expanded;
  - Space on a dialog button activates that button and leaves the transport alone;
  - the dialog's texts, options and test ids.
- **No document listener and no new dependency.** `Modal.tsx` does not change.

### 2.4 Not allowed

- Any change to `ArrangementVideoDock.tsx`, `video-sync.ts`, `ArrangementLibraryPreview.tsx` or `components/ui/**`.
- A portal, reparent or remount of the video box.
- A new rAF loop, polling, `ResizeObserver` or scroll listener.
- View state in `Arrangement`, history or `ArrangementContext`.
- A compact-size slider or a video fold (D-29).
- Moving the box to the timeline side.
- Widening any tolerance.

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
?? docs/implementation/2026/quarter-IV/{016..023}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**. It must stay byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- run `sha256sum -c ../tmp/studio-real-loop/b-round-14-tree-sha256.txt` (44 OK) and report any difference before you code;
- record the §3.3 frozen subset into `a-round-15/gates/frozen-start.txt`;
- copy the owned files to `a-round-15/bak/*.base.*`.

### 3.2 May modify or create this round

**Modify:**

| File | Allowed change |
|---|---|
| `app/lib/arrangement/panels.ts` | §2.1 (the body-share term and `FLOATING_VIDEO_BODY_SHARE`) and §2.2 (`floatingVideoLibraryInsetPx`) |
| `app/components/arrangement/ArrangementLibrary.tsx` | the `bottomInsetPx` prop and the two conditional inline styles only |
| `app/components/arrangement/StudioWorkspace.tsx` | the inset computation and the `bottomInsetPx` prop on `ArrangementLibrary`, plus the helper import. Nothing else. |
| `app/components/arrangement/ArrangementExportDialog.tsx` | §2.3 only |
| `app/lib/arrangement/__tests__/panels.test.ts` | Add tests. Existing placement tests whose expected numbers change are **named exceptions**, each with before and after. Every other existing test passes unchanged. |
| `app/lib/arrangement/__tests__/floating-video.test.tsx` | Add tests. The 1440/288 fixture (body 233–684) keeps 8,523 272×153, so existing placement assertions should not change. If one does, list it as a named exception. |
| `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` | Add tests. Wrap and first/last assertions that now include the X are named exceptions, each with before and after. |
| `docs/implementation/2026/quarter-IV/023-studio-lab-floating-video-followups.md` | Status and TODO lines only: C round 14 PASS (R14-P1/P2/S/E/U/Doc, adjacent, G14-1..3); C-R13-01..03 closed by C; C-R14-01 (Medium) and C-R14-02 (Low) open → round 15 (D-29f). No "resolved" wording for C-R14-01/02. |

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/library-inset.test.tsx` (optional) | Component tests for §2.2. You may instead add them to `floating-video.test.tsx`; say which you chose. |
| `docs/implementation/2026/quarter-IV/024-studio-lab-library-rows-modal-x.md` | Written per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 024 is taken). Contents: both bugs, D-29f and its rationale (why both mechanisms, why the X stays visible), the measurements, the tests and your runs. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-15.md` | Your report (§8) |
| `../tmp/studio-real-loop/a-round-15/` | Runs, gates, shots and backups |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state |

### 3.3 Frozen this round

C checks these by sha256 against `b-round-14-tree-sha256.txt`:
- `ArrangementVideoDock.tsx`, `video-sync.ts` and `video-sync.test.ts`;
- `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx`, `detail-panel.test.tsx` and `track-layout.test.tsx` (polish rounds 16–17 own them next);
- `ArrangementContext.tsx`, `ArrangementLibraryPreview.tsx`, `position-store.ts` and `render-budget.test.tsx` (the C-R8-01/C-R6-02 targets for the Tech Lead run);
- `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx` and `ArrangementContext.test.ts`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts` and `graph.client.ts`;
- `components/ui/Modal.tsx`;
- docs 015–022.

**Read-only imports allowed:** `~/lib/utils` and the existing imports of the owned files.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config` or `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts` and `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**` and `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files and the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`. They are read-only; copy what you need into `a-round-15/`.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..14 work;
- leaving temporary instrumentation in source;
- **editing any `store/` file (including docs) while a browser measurement runs**, because Vite reloads the page.

## 4. Acceptance (C)

Viewports are 1440×900 and 1280×720. Pointer gestures are synthetic with `buttons: 1` unless a real `$B click` is named. Keys use real `$B press`. Every check reports measured numbers.

**R15-P1 (placement, cap).** For each of the four cases (1440/288, 1440/480, 1280/288, 1280/480; set the 480 width by separator keys), plus the temporary opening at 1280/288, click ⤢ with a real `$B click` and let any transition finish. Required in every case:
- **Shape:** the box is `position: fixed` and 16:9 (±1).
- **Width:** width = max(160, min(640, library.width − 16, (body.h − 16) × 16/9, (body.h / 2) × 16/9)) (±1), computed from the live rects.
- **Position:** left = library.left + 8 and top = max(body.top + 8, body.bottom − 8 − height) (±1), clamped to the viewport.
- **Free half:** box.height ≤ body.h / 2 + 1.
- **Body:** the box lies inside the body region.
- **Controls:** `elementFromPoint` at the centre of ◀, the search input, the separator and the preview toggle returns that control.
- **◀ click:** a real `$B click` on ◀ collapses the library and returns the video, with the ◀ text verbatim.
- **Unchanged from round 14:** the placeholder (160×90), the dock strip (107, Δ 0 ±1), the lane heights, the detail height and the expand texts (verbatim).
- **Report:** whether any case reaches the 160 px minimum.

**R15-P2 (reachability, the C-R14-01 repros).** With the video expanded at its default placement:
1. **1280×720, library 480 (the exact round-14 repro):**
   - a real `$B click` on search, type `soft`, then a real `$B click` on the `[role=option]` row and a real Enter (or its add button);
   - expected: exactly one new clip and one Undo entry, and the box neither moved nor returned. The round-14 "not interactable" failure must not occur.
2. **1440×900, library 288, no filter:**
   - scroll the list to its maximum;
   - `elementFromPoint` at the centres of the last two rows ("პადი" and "მელოდია" in C's run) returns the row or a descendant, not the box.
3. **All four cases, no filter:**
   - every list option and every tree button can be brought, by scrolling only its own container, to a position where `elementFromPoint` at its centre returns it or a descendant;
   - report per case: the number of rows checked and the number reachable (must be all), the listbox and `nav` `scrollHeight` and `clientHeight`, and the computed `padding-bottom` and `scroll-padding-bottom` (= box height + 16 ±1).
4. **Keyboard, 1280×720, library 480:**
   - focus the first option and press real ArrowDown through every row;
   - after each press, the focused row's centre is not under the box. This shows `scroll-padding-bottom` at work.
   - Enter on the last row adds exactly one clip.

**R15-P3 (inset cleanup).** After each of ✕ and Esc from an expanded video, and after ◀ followed by ▶ (the body is not rendered while the library is a rail):
- the tree `nav` and the listbox have no inline `style` attribute;
- their computed `padding-bottom` equals the pre-expand value (round 14: listbox 4 px, `nav` 4 px);
- their `scrollHeight` equals the pre-expand value (±1);
- the return status texts are verbatim (R14-S quick).

During the temporary opening, before placement, the inset is 0.

**R15-E (Export focus with the X, C-R14-02).** Real keys and clicks at 1440×900:
1. **The exact round-14 repro:**
   - with a non-empty project (so `WAV-ის ექსპორტი` is enabled), open Export; focus the Modal's X (`[aria-label=Close]`) with `.focus()`; real Shift+Tab ×2, then a real Enter;
   - every step's `document.activeElement` is inside the dialog: X → `WAV-ის ექსპორტი` → `დახურვა`;
   - Enter on `დახურვა` closes the dialog and starts no render;
   - the detail panel's height is unchanged (144 → 144), and no workspace control changed.
2. **Full cycle:**
   - from open (focus on `დახურვა`), real Tab ×8 visits `WAV` → X → radio → `დახურვა` → … and wraps;
   - real Shift+Tab ×8 visits the reverse order;
   - `activeElement` stays inside the dialog at every step. Record every step.
3. **Tab from the X** goes to the radio. A real Enter on the X (reached by Tab) closes the dialog. Focus returns to the opener when it is still connected.
4. **R14-E quick:**
   - E1: open by click → focus on `დახურვა`; Enter closes; an expanded video stays expanded;
   - E3: Space on a dialog button leaves the transport alone;
   - E4: Esc closes and restores focus;
   - E5: the keyboard WAV export gives RIFF PCM, 2 ch, 48 kHz, 24-bit, with the length of the session project.
5. **Mid-render focus.** If a render can be sampled, check that focus stays inside the dialog. If it cannot, say so; the component test covers it.

**R15-U (unit and component tests):**
- **`panels.test.ts`:**
  - the new constant;
  - the body-share cap at the four measured geometries, with B's expected values (±0.01);
  - a tall body that is still capped by 640 or by library − 16;
  - the degenerate 160 case;
  - `floatingVideoLibraryInsetPx` for null, a non-finite height, 0 and a real rect (height + 16).
- **Inset component tests** (in `floating-video.test.tsx` or `library-inset.test.tsx`):
  - expanded → the `nav` and listbox styles carry `paddingBottom` and `scrollPaddingBottom` = height + 16;
  - placement pending (temporary opening) → no style;
  - return by ✕, Esc and ◀ → no `style` attribute;
  - drag and arrows do not change the value.
- **`export-dialog-focus.test.tsx`:**
  - Tab and Shift+Tab wrap through the X;
  - Shift+Tab from the X goes to the last enabled control, and Tab from the X goes to the radio;
  - Tab from the wrapper goes to the X, the first control;
  - a render start or end does not steal focus from the X;
  - only Tab is handled (Enter and Esc are not prevented or stopped);
  - the listener is removed on close (a Tab dispatched on a detached content element does nothing).
- **Guard proof** (`a-round-15/guard-proof.txt`). Each mutation is temporary; restore it and check with `cmp` against your pre-guard copy:
  1. remove the body-share term → the cap tests fail;
  2. make `floatingVideoLibraryInsetPx` always return 0 → the inset tests fail;
  3. put the Tab handler back on the wrapper (React `onKeyDown`) and remove the content listener → the X tests fail;
  4. effect B's no-steal check uses the wrapper list → the "render does not steal focus from the X" test fails.

**R15-Doc:**
- doc 023's status lines show C round 14 exactly as in §3.2;
- doc 024 contains no unverified PASS.

## 5. Required tests (behavioural, named)

- Everything in R15-U, with the four-part guard proof.
- List every changed assertion in your report, with before and after.

## 6. What C verifies (focused, per the workflow)

1. **The fixes:** R15-P1, R15-P2, R15-P3, R15-E, R15-U and R15-Doc.
2. **Adjacent regressions only** (1440×900 unless stated):
   - **R13-F2 quick, from the new 1440/480 placement (8,450.5):**
     - drag +200/+100 lands at +200/+100 (±1);
     - ⠿ ArrowRight ×3 = +48;
     - a bottom-right box re-clamps on a resize to 1280×720;
     - a second pointer on a clip during the drag is ignored;
     - no history entry.
   - **R13-F3 quick:**
     - ✕, the placeholder button and Esc each return the box to 160×90 in the dock with `style=""` and the same `<video>` nodes (`isSameNode`);
     - the search-precedence Esc behaves as in round 14.
   - **R13-F4 quick:**
     - at 1280/288, the temporary opening places the box only after the width transition, at the D-29f position;
     - the inline `transition-property: none` simulation places it on the next frame;
     - ✕ re-collapses the library.
   - **R11A-1 quick:** ◀/▶ work, the rail is 40 px, the separator stays in 288–480, and a preview stops on collapse.
   - **Dock quick check (compact):** 1152×107 / 992×107 and a 160×90 video, as in round 14. One visible `<video>`, both muted.
   - **No sync runs this round.** The dock and `video-sync.ts` are frozen and sha-checked. The change only gives the same code path a different size and position. If C sees a stall, a hard seek or a counter change during R15-P1/P2, it opens a bug; no extra runs.
   - **RF7-P2:** `render-budget.test.tsx` sha unchanged and green.
3. **Gates:**
   - **G15-1:**
     - tsc 0;
     - vitest ≥ **945** + the new tests, 0 failures. If the known `sfx-library.test.tsx` load flake recurs, re-run that file alone and report both results;
     - build passes;
     - Biome 0 errors on the owned paths and on `./app`.
   - **G15-2:**
     - protected hashes OK;
     - `git status` and `git diff --stat` show only §3.1/§3.2 paths. The two foreign agent files are excluded and reported to root;
     - `Header.tsx` identical to HEAD;
     - every §3.3 file matches `b-round-14-tree-sha256.txt`, including `ArrangementVideoDock.tsx`, `ArrangementLibraryPreview.tsx` and `components/ui/Modal.tsx`;
     - the owned files' base backups `a-round-15/bak/*.base.*` match `b-round-14-tree-sha256.txt`;
     - no change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `studio-lab-demo.ts`;
     - instrumentation grep = 0.
   - **G15-3:** anonymous `/studio-lab`, opened directly and via the header link:
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
   - the uncommitted round-6..15 tree (root exposure note);
   - the shared `Modal.tsx` focus gap (root/UI owner);
   - root GA sends `scroll` with consent denied (root analytics).
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R6-02, C-R8-01 and the RF7-3 quiet-Chrome run (Tech Lead);
   - C-R12-01 (milestone RF5-3);
   - polish rounds 16–18;
   - the 21 regression-debt IDs (milestone);
   - the Tech Lead manual checks, including R11-P3m, R11-SB and R13-RM (real `prefers-reduced-motion`).

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-14-tree-sha256.txt
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

If you create `library-inset.test.tsx`, add it to the first vitest line.

**`/check` rule (unchanged):**
- Run `biome check --write` only on the **named files** you own this round. Never point it at a directory (round 14's process slip) and never at `Header.tsx`.
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

The `design-philosopher` is optional. If you invoke it on D-29f, report any conflict to B; do not apply it.

## 8. Report `../tmp/studio-real-loop/a-round-15.md`

1. The pre-flight gate, including the §1.5 measurements.
2. The design of each fix.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..14 file was reverted;
   - `frozen-start.txt` matches `b-round-14-tree-sha256.txt`;
   - `Header.tsx` is byte-identical to HEAD;
   - the dock, `ArrangementLibraryPreview.tsx` and `Modal.tsx` are unchanged;
   - instrumentation is gone.
4. Verbatim command tails.
5. Your R15-P1/P2/P3/E runs (A's evidence, not a verdict), with numbers and these shots:
   - `video-expanded-d29f-1280-480.png`;
   - `library-rows-scrolled-1440-288.png`;
   - `export-focus-x-1440.png`.
6. New and changed tests, each with its reason, plus before and after for every named exception and the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with its reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 16:** polish 14a (C-R11-01..03, D-29c, plus A's round-11 deviation 9: the fold refusal during a gesture shows `GESTURE_EDIT_BLOCKED_MESSAGE`).
- **Round 17:** 14b (detail panel).
- **Round 18:** 14c (context/preview), once the Tech Lead C-R8-01/C-R6-02 evidence frees those files or B schedules them.
- **Then:**
  - the milestone regression, including the 21 regression-debt IDs and C-R12-01 under RF5-3;
  - SRW-13 onwards in dependency order (13 → 14/15 → 16 → 17 → 18 → 19 → 20);
  - the SRW-21 adapter contract;
  - T12.
