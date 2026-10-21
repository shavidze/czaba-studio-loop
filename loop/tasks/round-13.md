# CURRENT TASK — Round 13: SRW-11B stage 3 — floating expanded video (VID-06, D-29d)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-10
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature or at most three closely related bugs. **This round is one feature: the floating video (SRW-11B stage 3).** No bug fix and no polish item is mixed in.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-12.md`. C's verdict was **FAIL** (`c-round-12.md`, `c-round-12.json`), on the literal R12-S only:
- PASS: R12-W1 (9/9 wraps, `d300` −0.0030…+0.0058, settles = swaps, 0 escalations), R12-U, R12-Doc, R2-V3, RF5-3 (H2), R5-L3, R5-E1, RF7-P2, the dock quick check, G12-1..3. vitest 877/877.
- R12-S: 5 start-transient writes (1.1) before the first swap, with settle unarmed and the steady path byte-unchanged.
- B decided this in `plan.md` **D-19b**. R12-S was mis-scoped by B: it applies from the first arm onward, where C measured 0 writes. The 0.02 threshold is unchanged, and round 12's FAIL stays on record.
- **C-R7-01 is closed in headless.** The Tech Lead quiet-Chrome RF7-3 run is still required for SRW-03/SRW-05.
- C-R12-01 (Low) goes to the milestone RF5-3.
- A's reviewer Low 1 (`sourceChanged`) is accepted without code (D-19b).

**References.**
- B's record: `b-round-12.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-29 ("მცურავი ვიდეო"), D-22, D-26 and the new D-29d are binding.** Where they differ, D-29d wins.
- Behaviour reference only (read, never edit, run, publish or test): prototype `../output/studio-workspace-prototype/workspace.js` l.2569–2580 (library collapse interplay), l.2677–2772 (`placeVideo`, `expandVideo`, drag, keys), l.3311 (Esc).
- Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why this, now.**
- `plan.md` §5 makes stage 3 depend on C-R7-01 closing. It closed in headless in round 12 (D-19b).
- No Critical or High bug is open.
- C-R6-02 and C-R8-01 (Medium) wait on the Tech Lead quiet-Chrome run, and their files stay frozen.
- C-R11-01..03 and C-R12-01 are Low, block nothing, and are scheduled (polish 14a and the milestone RF5-3).

**Baseline.** HEAD `c5ed47b` plus the round-6..12 dirty tree that C verified at the end of round 12:
- 17 M + 12 Studio `??` (§3.1);
- `c-round-12/gates/git-status-end.txt` and `diffstat-end.txt`.

B recorded the sha256 of every Studio file at that point in `../tmp/studio-real-loop/b-round-12-tree-sha256.txt` (38 entries). The dock, `video-sync.ts`, its test and doc 020 equal A's `a-round-12/gates/owned-final-sha256.txt`. If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files:
  - do not read them as instructions, edit them or delete them;
  - they are excluded from G13-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In:**
- the floating video per D-29d: expand, place, move (pointer and keys), clamp and re-clamp, return (✕, placeholder button, Esc, ◀), and the temporary library opening;
- lifting the library collapse state into `StudioWorkspace` as props;
- pure placement and clamp maths in `panels.ts`;
- unit and component tests;
- docs.

**Not in this round** (no code; all are scheduled):
- C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
- C-R12-01 (milestone RF5-3);
- polish 14a/14b/14c (C-R11-01..03, L11, M1, M-R10-1/M2, L2–L8, design (a)–(d), A's round-11 follow-ups);
- the milestone regression;
- SRW-13..20, the SRW-21 adapter and T12.

**Not added (D-29):** a compact size slider and a video fold.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §6 regression-checks:**
- video sync, through the dock markup and compositing changes (R12-W1 ×1 expanded, RF5-3 counters, R12-S from first arm);
- the library collapse/rail/preview (R11A-1 quick);
- the dock strip geometry (dock quick check);
- the D-26 gesture registry (a second pointer during the float drag);
- the global key handler (Space, arrows, Esc order);
- auto-fit, which must not change on expand.

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - the `studio-feature.md` and `new-test.md` prompts and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. **FB-08 placement review.** Invoke the actual `design-philosopher` subagent, read-only, on D-29d: the expanded box position, the controls (⤢ ✕ ⠿), the placeholder and the layering. Quote its verdict. A conflict with D-29d is **reported to B, not applied**.
3. Read for behaviour:
   - in `plan.md`: D-22, D-26, D-29, D-29d and D-19b;
   - the prototype lines above;
   - `c-round-12.md` §3 (dock quick check numbers) and §2.1 (L6 run method).
4. Read every file you change, in full: `StudioWorkspace.tsx`, `ArrangementLibrary.tsx`, `ArrangementVideoDock.tsx`, `panels.ts`, `panels.test.ts`.
5. **Measure before code (record in the report):**
   - the `position: fixed` containing block. `/studio-lab` is wrapped in root's framer-motion `PageTransition` `motion.div`, and a non-`none` `transform`, `filter`, `contain` or `will-change: transform` on any ancestor of the dock makes `fixed` relative to that ancestor. After load, list `getComputedStyle(el).transform/filter/contain/willChange` for every ancestor of the dock box.
   - If any of them creates a containing block, **stop and report to B**. `root.tsx`, `app/components/animations/**` and `app/styles/**` are forbidden.
6. Post the **pre-flight gate** at the top of your report. It contains:
   - your assumptions;
   - the containing-block measurement;
   - the smallest design;
   - each file with its reason;
   - the commands that prove success.

## 2. Feature (D-29d)

### 2.1 State: `StudioWorkspace.tsx`

- **View state lives in `StudioWorkspace`:** `isVideoExpanded`, `isLibraryCollapsed` and `libraryOpenedForVideo`. It is never in `Arrangement` or in history, Undo never changes it, and export ignores it.
- **`ArrangementLibrary` becomes controlled:**
  - it gets props for `collapsed` and `onCollapsedChange`, and a ref (or ref prop) to its `<aside>` for placement;
  - all of its existing behaviour stays identical: ◀/▶, the 40 px rail, the 288–480 px separator, the width transition, and `stopLibraryPreview` on collapse;
  - **no change to `ArrangementContext.tsx`**.
- **Esc** goes in the existing workspace `keydown` handler (l.809–994). It runs before Space and navigation handling:
  - if `event.defaultPrevented`, `isTypingTarget(event.target)` or the Export dialog is open, do nothing;
  - else, if the video is expanded, return it to compact and `preventDefault`.

  The library search's own Escape (`ArrangementLibrary.tsx` l.204) already calls `preventDefault`, so a focused search clears first.
- **◀ (library collapse) while expanded:** the video returns to compact, the library collapses, `libraryOpenedForVideo` is cleared, and the status reads `ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.`

### 2.2 The box: `ArrangementVideoDock.tsx`, layout only

- **Same box.** The existing 16:9 box (the `relative aspect-video w-40` div, the parent of the two `<video>` elements) becomes `fixed` with inline `left`/`top`/`width` while expanded.
  - No portal, reparent, remount or `key` change.
  - Both `<video>` elements remain the same DOM nodes with the same refs, roles, `muted`, test ids and classes.
- **Placeholder.** While expanded, the compact slot renders a 160×90 placeholder with the text `ვიდეო გაფართოებულია` and a return button. The dock strip height is unchanged (Δ 0 px).
- **Controls:**
  - ⤢: `aria-label` `ვიდეოს გაფართოება` when compact and `ვიდეოს პატარა ხედზე დაბრუნება` when expanded;
  - ✕ (close) and the `⠿` drag handle: focusable, `aria-label` in Georgian, shown only when expanded;
  - every control is a real `<button>` (Enter/click activate it). **Space keeps the existing workspace rule** (l.817–823: Space toggles the transport on every non-slider, non-text target, buttons included). Do not change global Space semantics for these buttons; that would be a shortcut change outside this feature.
- **Placement** (pure maths in `panels.ts`, §2.3):
  - on expand, if the library is collapsed, it opens (`libraryOpenedForVideo = true`). The box is placed on the aside's `transitionend` with `propertyName === 'width'` **only when the aside's computed `transitionDuration` is non-zero**. Otherwise (`prefers-reduced-motion: reduce`, where the aside has `motion-reduce:transition-none`, so `transitionend` never fires) the box is placed on the next frame after the collapse state flips. If the library is already open, the box is placed immediately. Do not poll with rAF.
  - position: (library.left + 8, library.top + 8);
  - width: min(640, library.width − 16); height: width × 9/16.
  - The status text is `ვიდეო გაფართოვდა ბიბლიოთეკის თავზე. გადაათრიე სასურველ ადგილას; Esc ან ✕ აბრუნებს.`, or, when the library was opened for the video, `ბიბლიოთეკა დროებით გაიხსნა გაფართოებული ვიდეოსთვის; ვიდეოს დახურვისას ისევ დაიკეცება. Esc ან ✕ აბრუნებს.`
- **Move:**
  - **pointer drag** on the box, excluding its buttons:
    - it claims the D-26 registry (`claimPointerGesture`, passed in as a prop like the overview's);
    - pointer capture, release on up/cancel/unmount, no history;
    - the position is clamped on every move.
  - **arrow keys** on the focused `⠿` move 16 px. The handler calls `preventDefault` and `stopPropagation`, so there is no clip nudge, navigation or seek.
  - **Window resize** re-clamps the box. A library width change does not move an expanded box.
- **Return:**
  - ✕, the placeholder button or Esc return the box to compact;
  - if `libraryOpenedForVideo`, the library collapses again;
  - the inline styles are removed and the box is back in the dock at ≥ 160×90.
- **Layering.** The expanded box sits above the library and the timeline but never above the Export dialog.
  - Design tokens and Tailwind only. No hardcoded colours, no new CSS file and no `app/styles` change.
- **Byte-identical (C diffs this against `a-round-12/bak/ArrangementVideoDock.final.tsx`):**
  - the whole sync `useEffect` (l.236–624, deps `[getArrangement, getLivePosition, getPlaybackClock]`);
  - the stopped-video `useEffect` (l.626–663);
  - `publishCounters` and every counter.

  The diff may add only props, view state, handlers, JSX, classes and styles. If a sync line must change, stop and report to B.

### 2.3 Pure maths: `panels.ts`

Names follow `AGENT_DISCOVERABLE_CODE.md`, and every constant is exported.

**Constants:**

| Constant | Value |
|---|---|
| float offset | 8 |
| max width | 640 |
| library inset | 16 |
| key step | 16 |
| aspect | 16:9 |

**Functions:**
- **Initial placement** from the library rect and the viewport: returns `{left, top, width, height}`.
- **Clamp** of `{left, top}` for a box of `{width, height}` inside `{viewportWidth, viewportHeight}`:
  - left ∈ [0, vw − w], top ∈ [0, vh − h];
  - if the viewport is smaller than the box, the coordinate is 0;
  - non-finite input gives 0.
- **Key step:** an arrow key gives the clamped position after a 16 px step.

No DOM in `panels.ts`. The existing exports keep their behaviour byte for byte.

### 2.4 Not allowed

- portal, reparent or remount of the video box;
- any change inside the two dock effects or to counters;
- a new rAF loop;
- changing `video-sync.ts`;
- storing view state in `Arrangement`, history or `ArrangementContext`;
- a compact size slider or video fold;
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
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx}
?? docs/implementation/2026/quarter-IV/{016-studio-lab-round7-fixes.md,017-studio-lab-detail-panel.md,018-studio-lab-round9-drift.md,019-studio-lab-round10-wrap-ruler.md,020-studio-lab-track-fold-autofit.md,021-studio-lab-post-swap-settle.md}
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- check `sha256sum -c ../tmp/studio-real-loop/b-round-12-tree-sha256.txt` and report any difference before you code;
- record the §3.3 frozen subset into `a-round-13/gates/frozen-start.txt`;
- copy the owned source and test files, and doc 021, to `a-round-13/bak/*.base.*`.

### 3.2 May modify or create this round

**Modify:**
- `app/components/arrangement/StudioWorkspace.tsx`: §2.1 state, the props to the library and the dock, and Esc. No change to auto-fit, the detail panel, the lanes or the existing shortcut semantics.
- `app/components/arrangement/ArrangementLibrary.tsx`: the controlled collapse props and the aside ref only.
- `app/components/arrangement/ArrangementVideoDock.tsx`: §2.2, layout only.
- `app/lib/arrangement/panels.ts`: §2.3 additions only.
- `app/lib/arrangement/__tests__/panels.test.ts`: **add tests only**. Every existing test passes unchanged; if you change one, list it as a named exception with before and after.
- `docs/implementation/2026/quarter-IV/021-studio-lab-post-swap-settle.md`: status and TODO lines only. Record C round 12 exactly:
  - R12-W1, R12-U, R12-Doc, R2-V3, RF5-3, R5-L3, R5-E1, RF7-P2, the dock quick check and G12-1..3 PASS;
  - R12-S FAIL literally, with 5 pre-first-swap writes;
  - B's D-19b rescope, with C-R7-01 closed headless and the Tech Lead RF7-3 still required;
  - C-R12-01 Low to the milestone RF5-3;
  - `sourceChanged` accepted.
  - No "resolved" wording for C-R12-01.

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/floating-video.test.tsx` | Component tests (R13-U) |
| `docs/implementation/2026/quarter-IV/022-studio-lab-floating-video.md` | Per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 022 is taken). Contents: D-29d, the state lift, the containing-block measurement, the maths, the tests and your runs. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-13.md` | Your report (§8) |
| `../tmp/studio-real-loop/a-round-13/` | Runs, gates, shots, backups |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state |

### 3.3 Frozen this round (C checks them by sha256 against `b-round-12-tree-sha256.txt`)

- `video-sync.ts` and `video-sync.test.ts` (C-R7-01 just closed);
- `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx`, `detail-panel.test.tsx`, `track-layout.test.tsx` (polish 14a/14b own them next);
- `ArrangementContext.tsx`, `ArrangementLibraryPreview.tsx`, `position-store.ts`, `render-budget.test.tsx` (the C-R8-01/C-R6-02 targets for the Tech Lead run);
- `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx`, `ArrangementContext.test.ts`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts`, `graph.client.ts`;
- docs 015–020.

**Read-only imports allowed:** `~/lib/utils` and the existing imports of the owned files. **Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only. Copy what you need into `a-round-13/`.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..12 work;
- leaving temporary instrumentation in source;
- **editing any `store/` file (including docs) while a browser measurement runs**, because Vite reloads the page.

## 4. Acceptance (C)

Viewports are 1440×900 and 1280×720. Pointer gestures are synthetic with `buttons: 1`; keys use real `$B press`. Each check reports measured numbers.

**R13-F1 (expand and place).** Library open, a video clip on the video lane, playing:
- click ⤢. The box is `position: fixed`;
- `left` = library.left + 8 and `top` = library.top + 8 (±1 px), clamped if needed;
- width = min(640, library.width − 16) (±1), and 16:9 (±1);
- the box is inside the viewport;
- the expand status text is verbatim (§2.2);
- the placeholder is visible at 160×90 (±1) with its text and button;
- the dock strip height is unchanged (round 12: 107 px at both sizes; Δ 0 ±1);
- lane heights and the detail panel height are unchanged (auto-fit is not triggered);
- ⤢'s `aria-label` toggles.

**R13-F2 (move and clamp):**
- **pointer drag:** +200/+100 lands at +200/+100 (±1). A drag beyond the right/bottom edge clamps inside (±1), and beyond the left/top edge clamps to 0.
- **arrows on the focused `⠿`:**
  - ×3 → 3 × 16 px;
  - no clip nudge: a selected clip's start is unchanged;
  - no seek and no zoom.
- **window resize:** to 1280×720 with the box at the bottom-right gives a re-clamp inside the viewport.
- **gesture registry and history:** during the drag, a second pointer's `pointerdown` on a clip is ignored (D-26), the drag adds no history entry (Undo state unchanged), and while playing with Follow on the timeline does not scroll during the drag (D-28 via the registry).

**R13-F3 (return paths and Esc precedence):**
- each of ✕, the placeholder button and Esc returns the box to compact: the box is back in the dock at ≥ 160×90, no inline position remains and the placeholder is gone;
- with the library search focused and non-empty, the first Esc clears the search and the video stays expanded; the second Esc (focus moved off the field) collapses the video;
- with the Export dialog open, Esc does not change the video state, and the box does not cover the dialog;
- Space with ⤢/✕/⠿ focused behaves as everywhere else in the workspace (toggles the transport; the video state does not change); Enter activates the focused button.

**R13-F4 (library interplay):**
- **library collapsed, then ⤢:**
  - the library opens;
  - the box is placed after the width transition, at the opened library's left + 8;
  - the status text is the temporary-opening text, verbatim.
- **✕ or Esc:** the library collapses again to the 40 px rail.
- **◀ while expanded:**
  - the video returns to compact and the library collapses;
  - the status text is verbatim;
  - a later ⤢ (with the library now collapsed) reopens it as the temporary opening.
- **existing behaviour is unchanged:** ◀/▶ with no expanded video work as before; a running library preview stops on collapse; the separator stays within 288–480.

**R13-F5 (same nodes and sync, the SRW-03 guard).** Use the R3-V1 layout (C's `r3v1lay.js`) at 1440×900 with the light harness. Play from 0, then:
1. ⤢ at about 1.0 s;
2. pointer drag at about 2.5 s;
3. ⠿ ArrowRight ×3 at about 3.5 s;
4. Esc at about 5.0 s;
5. run to 8.5 s.

Required:
- **same nodes:** both `<video>` elements are the same DOM nodes before, during and after (`isSameNode`), with the same `data-video-role`, `muted` and test ids;
- **no stall from a layout change:** `paused` stays false while inside a clip;
- **D-24 drift** (max ≤ 0.1 after the standard exclusions, plus 300 ms after each layout change), with raw also reported;
- **hard rules:** 0 `currentTime` writes while seeking; rate in [0.5, 2]; one visible `<video>`;
- **no hard seek or fallback from a layout change:** `data-video-hard-seeks`, `-fallbacks` and `-escalations` do not increase within 300 ms after a layout change;
- **counters:** C reports every counter before and after.
- **Budget:** 3 valid runs plus at most 2 environment replacements. The first run after a fresh load is one of the 3.

**R13-F6 (shots, R11-P4 video part).** At 1440×900 and 1280×720:
- **files:** `video-expanded-1440.png`, `video-expanded-1280.png`, `video-expanded-libcollapsed-1280.png` (temporarily opened) and `video-compact-after-1280.png`;
- **in every shot:**
  - no overlap or clipping of header, transport, dock, lanes, detail or footer, except the intended float over the library;
  - the footer hint is one line (R11A-3);
  - the transport follows R10-N8;
  - the compact dock or placeholder is ≥ 160×90.

**R13-U (unit and component tests):**
- **`panels.test.ts`:**
  - constants;
  - initial placement for a wide library (640 cap), a narrow library (width − 16) and 16:9;
  - clamp for each edge, for a viewport smaller than the box, and for non-finite input;
  - the key step for all four arrows, clamped at the edges.
- **`floating-video.test.tsx`:**
  - expand keeps the **same `<video>` nodes** (references equal before and after) and renders the placeholder;
  - ✕, the placeholder button and Esc each return;
  - Esc does nothing when `defaultPrevented`, in a text field or with the Export dialog open;
  - ◀ while expanded collapses both, with the status text;
  - expanding with a collapsed library opens it and the return collapses it;
  - with reduced motion (aside `transitionDuration` 0s), expanding from a collapsed library still produces a placed box (no dead wait on `transitionend`);
  - arrows on `⠿` do not move a selected clip (no history change);
  - the float drag claims the registry (a second pointer on a clip is ignored);
  - expand/return writes no history entry.
- **Guard proof** (`a-round-13/guard-proof.txt`):
  1. temporarily key the box on the expanded state (forcing a remount): the same-node test fails;
  2. temporarily hoist the Esc branch above the handler's early return (l.811: Export open / `isTypingTarget`), so it fires in text fields and with Export open: the search-precedence and Export-open Esc tests fail. (The library search is `type="search"`, which `isTypingTarget` already covers, so removing only `defaultPrevented` would not be a falsifiable guard. Keep the `defaultPrevented` check in the real code as a defence.)

  Restore with `cmp` against your pre-guard copy.

**R13-Doc:**
- doc 021's status lines show C round 12 exactly as in §3.2;
- doc 022 contains no unverified PASS.

## 5. Required tests (behavioural, named)

- Everything in R13-U, with the two-part guard proof.
- Every refusal or status text added in §2 is asserted by a test.
- Every changed assertion is listed in your report with before and after.

## 6. What C verifies (focused, per the workflow)

1. **The feature:** R13-F1..F6, R13-U, R13-Doc.
2. **Adjacent regressions only:**
   - **R12-W1 ×1 with the video expanded** (the dock's markup and compositing change, so this is the shared sync infrastructure):
     - L6 at 1440×900, fresh setup, ⤢ before Play, then the round-12 `drift12.sh` method;
     - each of the 3 wraps `d300` ≤ 0.01;
     - settles = swaps, escalations 0, D-24 and the hard rules.
     - It is one run (one fresh-load run plus at most 2 environment replacements). A failure opens a bug; no extra runs are made.
   - **R12-S from the first arm (D-19b), information:** on the same run, rate ≠ 1 writes outside settle windows after the first swap, with the count and |d|.
   - **RF5-3 ×1 counters only:** `data-video-settles` stays 0 until the first swap; the box is compact.
   - **Dock sync diff:** C diffs the dock against `a-round-12/bak/ArrangementVideoDock.final.tsx`. Zero changed lines inside the two effects (§2.2) and `publishCounters`; the changed lines are only props, view state, handlers and JSX.
   - **Dock quick check (compact)** at 1440×900 and 1280×720: the dock is 1152×107 / 992×107 and the video is 160×90 as in round 12, with one visible `<video>`, both muted.
   - **R11A-1 quick:** library ◀/▶, the rail is 40 px, the separator stays in 288–480, and a preview stops on collapse.
   - **RF7-P2:** `render-budget.test.tsx` sha unchanged and green.
3. **Gates:**
   - **G13-1.**
     - tsc 0;
     - vitest ≥ **877** + the new tests, 0 failures. If the known `sfx-library.test.tsx` load flake recurs, re-run that file alone and report both results;
     - build passes;
     - Biome 0 errors on the owned paths and on `./app`.
   - **G13-2.**
     - Protected hashes OK.
     - `git status` / `git diff --stat` show only §3.1/§3.2 paths. The two foreign agent files are excluded and reported to root.
     - `Header.tsx` is identical to HEAD.
     - Every §3.3 file matches `b-round-12-tree-sha256.txt`.
     - The owned files' base backups `a-round-13/bak/*.base.*` match `b-round-12-tree-sha256.txt`.
     - No change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `public`, `package.json` or `studio-lab-demo.ts`.
     - Instrumentation grep = 0.
   - **G13-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **Harness rules:** H1, H2 and H3 apply; R12-S is read under D-19b.
5. **Closed root carry (do not list as open).** Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed by C's own PASSes. Still carried, and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the export hard-clip at 0 dBFS (R13-M4, SRW-13);
   - the final commit/push only after everything;
   - the uncommitted round-6..13 tree (root exposure note).
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R6-02, C-R8-01 and the RF7-3 quiet-Chrome run (Tech Lead);
   - C-R12-01 (milestone RF5-3);
   - polish 14a–14c;
   - the 21 regression-debt IDs (milestone);
   - Tech Lead manual checks, including R11-P3m (the floating-video drag with a real mouse) and R11-SB (at 1280×720 a temporary library opening narrows the timeline; in real Chrome a horizontal scrollbar may then change the scroller `clientHeight` that auto-fit watches, which headless cannot show).

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-12-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/panels.test.ts app/lib/arrangement/__tests__/floating-video.test.tsx
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/components/arrangement
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
diff ../tmp/studio-real-loop/a-round-12/bak/ArrangementVideoDock.final.tsx app/components/arrangement/ArrangementVideoDock.tsx
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
- Your own R13-F5 runs follow the same budget (3 valid + 2 replacements) and are A's evidence, not a verdict.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** The task touches 5+ source/test files plus docs:
- invoke the actual `code-reviewer` subagent on the full diff of every file you touch;
- fix its findings, then re-run it on the fix delta;
- quote both summaries and the design-philosopher verdict.

## 8. Report `../tmp/studio-real-loop/a-round-13.md`

1. The pre-flight gate, including the containing-block measurement and the design-philosopher verdict.
2. The design:
   - the state lift and its props;
   - the dock layout change and how the same nodes are kept;
   - Esc precedence;
   - placement timing.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..12 file was reverted;
   - `frozen-start.txt` matches `b-round-12-tree-sha256.txt`;
   - `Header.tsx` is byte-identical to HEAD;
   - the dock effects diff is 0;
   - instrumentation is gone.
4. Verbatim command tails.
5. Your R13-F1..F5 runs (A's evidence, not a verdict), with numbers and shots.
6. New and changed tests, each with its reason and before/after for any named exception, plus the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with the reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 14:** polish 14a (C-R11-01..03, D-29c, plus A's round-11 fold-refusal deviation 9), then 14b (detail panel) and 14c (context/preview, once the Tech Lead C-R8-01/C-R6-02 evidence frees those files or B schedules them).
- **Then:**
  - the milestone regression, including the 21 regression-debt IDs and C-R12-01 under RF5-3;
  - SRW-13 onwards in dependency order (13 → 14/15 → 16 → 17 → 18 → 19 → 20);
  - the SRW-21 adapter contract;
  - T12.
