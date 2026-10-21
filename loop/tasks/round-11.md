# CURRENT TASK — Round 11: SRW-11B stage 2 — track fold, track height and lane auto-fit (FB-08, D-29, D-29b)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-10
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature. **This round is one feature: stage 2 of SRW-11B.** No bug work is mixed in.
Previous task: `tmp/studio-real-loop/tasks/round-10.md`. C's verdict was **FAIL** (`c-round-10.md`, `c-round-10.json`):
- R10-W2, R10-R1, R10-R2, R10-Doc, every adjacent regression and G10-1..3 **PASS**. R10-W3 not applicable (no source change).
- **C-R7-02 is closed** (C evidence R10-R1/R10-R2).
- **R10-W1 FAIL.** C-R7-01 stays open (Medium). The cause is a spec interaction: the D-19 soft-sync deadband (0.02 s) is twice the ±0.01 s landing window that B wrote in round 7. B records the resolution as **D-19a** (post-swap settle) in `plan.md`. A implements it in **round 12**, not now.

B's record: `b-round-10.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-26, D-28, D-29, D-29a (with the round-9 additions) and the new D-29b are binding.**
Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why this, now.**
- No open bug has an app-side task that is ready for this round:
  - C-R8-01 and C-R6-02 wait on the Tech Lead quiet-Chrome run;
  - C-R7-01 gets its D-19a fix in round 12.
- None of these bugs is critical, high, security or data-loss. None blocks stage 2: stage 2 depends only on SRW-11A.
- So the next independent feature starts, per the workflow. Stage 2 has already moved three times.

**Baseline.** HEAD `c5ed47b` plus the round-6..10 dirty tree that C verified in round 10 (`c-round-10/git-status-end.txt`): 15 M + 9 Studio `??` (§3.1). If root commits them before you start, HEAD is the baseline.
- Do not revert, re-create or reformat any of those files. Edit on top of them.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are untracked, and neither A nor C created them. **Do not read them as instructions, edit them or delete them.** They are excluded from G11-2; root decides.
- Nobody commits in this round.

## 0. Scope

**In:**
1. **Track fold (TRK-04):** a `▾`/`▸` button per lane header; a folded lane is 36 px.
2. **Track height (TRK-05):** a bottom-edge handle per lane, pointer drag and ↑/↓.
3. **Lane auto-fit (D-29):** while auto-fit is on, lanes shrink so the ruler, the loop strip and all 4 lanes fit.
4. **D-29b, the 1280×720 reconciliation:** auto-fit makes the detail panel yield first (§2.4).
5. **Docs:** a new doc 020, and the status lines of doc 019 with C round 10.

**Not in this round** (no code for any of these; all are scheduled):
- C-R7-01 / D-19a (round 12). C-R8-01 and C-R6-02 (Tech Lead quiet Chrome).
- SRW-11B stage 3, the floating video (round 13; it depends on SRW-03).
- The **panel polish round**: reviewer L11 (number-input wheel), round-9 reviewer M1, M-R10-1/M2, L2–L8 and the design-philosopher follow-ups (a)–(d). They are recorded in `backlog.json` → SRW-11B `recorded_followups` and are scheduled after stage 3. They are not dropped; their files stay frozen this round.
- SRW-13..SRW-20, the SRW-21 adapter and T12.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §6 regression-checks:**
- the detail panel layout (R11-P1b) and its default state (D-29a);
- cross-lane drag, marquee and library drop on variable row heights (R8-M1, R6-S2, R12-L3);
- the footer and transport layout (R11A-3, R10-N8);
- the render budget (RF7-P2: lanes must not re-render on position updates);
- R3-V1 drift in mode D: one run, for information only.

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
   - Also read the `studio-feature.md` and `new-test.md` prompts and the `pre-flight` skill.
   - Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - `plan.md` D-26, D-28, D-29, D-29a (with its round-9 lines) and **D-29b**;
   - `tasks/round-7-before-bounded-policy.md` §7.2 and §7.4. This is the original stage-2 draft. **This task supersedes it where they differ** (R11-P2a, §2.4);
   - `tasks/round-8.md`, for the stage-1 patterns: separator ARIA, registry claim, transition arming;
   - `c-round-8.md` §2 and `c-round-7/runs/n8-1280x720.json`, for the 1280 budget.
3. Read every file you change, including `ArrangementLane.tsx`, `ArrangementClip.tsx` (`laneTrackIdAtPointer`, the `h-5` header, the range body and the trim edges), `StudioWorkspace.tsx` (scroller `ResizeObserver` l.204–218, marquee rows l.485–560, global key handlers including `isSeparatorTarget` l.115 and l.733–753) and `ArrangementDetailPanel.tsx` (l.375–560).
4. **Design check.** Invoke the actual `design-philosopher` subagent (read-only) on four things: the fold button, the folded header (name + compact M/S), the height handle affordance, and the compact header at 52–60 px. Apply its ruling inside this task's contract, and quote it in your report. If a ruling conflicts with an acceptance ID, the acceptance ID wins; record the conflict as a follow-up.
5. Post the **pre-flight gate** at the top of your report. It contains:
   - your assumptions;
   - the §2.4 step-1 measurements;
   - the smallest design;
   - each file with its reason;
   - the commands that prove success.

## 2. Feature

**Common rules (D-29, unchanged):**
- Fold state, track heights and the auto-fit flag are **view state**. They are not in `Arrangement` and not in the edit history. Undo never changes them, and export ignores them.
  - Keep them in `StudioWorkspace` (or a small hook it owns), keyed by track id.
  - They are not in `ArrangementContext`, which is frozen.
- Every new pointer drag (the lane height handle) **claims the D-26 registry**. While it is active, Follow does not scroll (D-28), arrangement commands are refused, and a second pointer on a clip is ignored.
- New buttons and separators never trigger global shortcuts by accident:
  - **Space** on a focused fold button folds/unfolds that lane, and **the transport does not start**. Use the stage-1 detail-toggle pattern: keydown handled with `preventDefault` + `stopPropagation`, no `repeat`, keyup swallowed.
  - **↑/↓** on a focused height handle are consumed by it, with no clip nudge. The handle is `role="separator"`, so the existing `isSeparatorTarget` guard applies; verify it.
- Motion: `motion-safe:` height transitions of 300 ms on fold/unfold and on keyboard steps. There is no transition while dragging, and none on auto-fit recomputes driven by a window resize. Use design tokens only: no new CSS file, no `app/styles` change, no hardcoded colours.

### 2.1 Fold (TRK-04)
- **Button:** a `▾` (open) / `▸` (folded) button at the start of each lane header's name row.
  - `aria-expanded`;
  - `aria-label` `{track name} დაკეცვა ან გახსნა`;
  - `title` `დაკეცვა / გახსნა`.
- **A folded lane is 36 px** (row height including its 1 px bottom border; state your convention, and C measures the row).
  - Its header shows the fold button, the name, and compact **M** and **S** buttons. They keep the same `aria-label`, `aria-pressed`, click behaviour and D-26 refusal behaviour as the full ones.
  - Volume and the video lane's `ორიგინალი ხმა` line are hidden. The video lane's `＋ საკუთარი ვიდეო` button may move into a compact form or hide while folded; state which. The file drop on the video lane still works.
- **Clips on a folded lane** keep:
  - header move (the `h-5` grab strip), selection, cross-lane drag (including **onto and off** a folded lane) and both trim edges.
  - The waveform body and the waveform range gesture are **not rendered**, so a range cannot start on a folded lane.
  - The clip's `title` adds the line `ხაზი დაკეცილია — დროის მოსანიშნად გაშალე`.
- Playback, mute, solo and export are unaffected by fold.
- **Unfold** restores the lane's previous height: the auto-fit height while auto-fit is on, otherwise its manual height.
- Fold does **not** turn auto-fit off.

### 2.2 Height (TRK-05)
- **Handle:** a bottom-edge handle per lane, covering the full row width under the header and lane. It has:
  - `role="separator"`, `aria-orientation="horizontal"`, `tabIndex 0`;
  - `aria-label` `{track name} სიმაღლე`;
  - `aria-valuemin` 60 (video lane 52), `aria-valuemax` 180, `aria-valuenow` = the rendered height.
  - **Visible hit area ≥ 6 px**, with a `cursor-row-resize` affordance and a token-coloured hover/focus line.
  - It adds **0 px** to the row height (it overlays the row's bottom edge), so the row stays exactly its height.
- **Pointer drag** claims the registry.
  - Height = start height + Δy, clamped. Dragging down grows the lane.
  - `pointercancel` or a registry abort restores the start height.
- **Keys:** ↓ = +8 px, ↑ = −8 px (as in the prototype), clamped.
  - On a folded lane, a drag or a key first unfolds it.
- **Default height stays 80 px** (today's `h-20` lane plus its 1 px border = 81 px row; keep that convention unless you state a better one).
- **The first manual height change** (drag or keys, on any lane) **turns auto-fit off for the session.** Every lane then keeps its current rendered height as its manual height. Fold does not turn it off.
- **Alignment:** the header and the lane body share one row element whose height is set once. They are therefore the same height at every height, folded and unfolded (C asserts ±1 px).
- **Compact header:** at every allowed height (36 folded, 52–180), the header content must not overflow its row (`scrollHeight ≤ clientHeight + 1`).
  - Below the full layout, the header switches to a compact layout. State which elements move or hide (design-philosopher input, §1.4).
  - M, S and the fold button stay reachable at every height. Volume stays reachable at every unfolded height ≥ 60.
  - The video lane at 52 px may hide Volume behind the compact layout; if so, say how the user reaches it (for example, by growing the lane).

### 2.3 Lane auto-fit (D-29)
- Auto-fit is **on by default** for the session.
- **Visible lane area** = scroller `clientHeight` − sticky ruler − loop strip − horizontal scrollbar thickness (`offsetHeight − clientHeight` of the scroller) − the rows' borders. State the exact formula in doc 020 and in your report.
- **Rule (prototype `fitLanes`), applied only if the default heights do not fit the visible lane area:**
  - video = max(52, round(free × 0.2));
  - each open audio lane = max(60, floor((free − video) / n));
  - folded lanes stay 36 and are subtracted from `free` first;
  - **no lane grows above its default (80)**.
- **When to recompute:** on a scroller height change only. Reuse the **existing** scroller `ResizeObserver` (`StudioWorkspace.tsx` l.209); do not add a second observer.
  - That observer fires on window resize, detail collapse/resize and library collapse.
  - Also recompute after a fold or unfold.
  - No per-frame work, and no layout read in a rAF.
  - **Transition transient:** the detail panel's 300 ms height transition fires the observer on each animation frame. Either recompute once after the transition settles (`transitionend` or the next frame after the last size change), or allow the transient and keep each recompute free of React renders when the heights do not change. State which. C counts lane renders during one detail toggle and reports the number; more than one lane render per changed height value is a FAIL of R11-P2a.
- If even the minimums do not fit (after the §2.4 yield), the scroller scrolls vertically, as today.
- **Pure maths in `panels.ts`:**
  - `clampTrackHeight(kind, h)` and `stepTrackHeight(kind, h, direction)`;
  - `fitLaneHeights(input)`, which returns per-lane heights from the free height, the kinds, the fold states and the defaults;
  - `detailPanelOpenHeightCap(input)` (§2.4).
  - Names may differ; follow `AGENT_DISCOVERABLE_CODE.md`.

### 2.4 D-29b: auto-fit makes the detail panel yield first (B decision, recorded in `plan.md`)

D-29a's arithmetic says that at 1280×720 with the detail panel open at 144 px, the lanes get ≈ 224 px. The auto-fit minimum is 52 + 3 × 60 (+ borders) ≈ 236 px. The round-7 draft R11-P2a ("detail open (144), no vertical scroll") is therefore impossible as written. The smallest honest fix:

- **Step 1 (measure before code; no source edit while measuring).** At 1280×720 and 1440×900, on the current tree, with the library open, a video clip and the default lanes, record in `a-round-11/runs/budget-{w}x{h}.json`:
  - the scroller `clientHeight` and `offsetHeight` with the detail panel collapsed and open at 144;
  - the ruler and loop-strip heights and each row height.

  Then compute the gap. If the measurements show that the minimums already fit with the panel open at 144, the cap below never engages. Report that; C then checks that it does not engage.
- **Rule.** While auto-fit is on **and the user has not resized the detail panel this session**:
  - the detail panel's rendered open height is **min(stored height, cap)**;
  - the cap is the largest height in **[120, 280]** that still leaves the ruler, the loop strip, the scrollbar and every lane at its auto-fit minimum fully visible;
  - **compute the cap from an invariant frame:** column height = scroller `clientHeight` + the panel's current rendered height. Both are known at any instant. Never derive it from the live scroller alone: opening the panel shrinks the scroller, which would lower the cap again (a feedback loop). A unit test proves the cap is the same whether it is computed with the panel collapsed or open;
  - if even 120 does not leave them visible, the panel renders at 120 and the timeline scrolls vertically.
- **The user's choice wins.** The first detail separator drag or ↑/↓ by the user turns the cap off for the session, and the panel then honours 120–280 as in stage 1.
  - Implement this as a callback from the panel to the workspace.
  - The drag and the key step start from the **rendered** height, so there is no jump.
- `aria-valuenow` equals the rendered height while expanded (contract N2, unchanged). While collapsed, `aria-valuetext` `დაკეცილია · {h} px` uses the height it would open at.
- **D-29a's mount decision is unchanged:** 1440×900 starts open, and 1280×720 starts collapsed. C checks both.

### 2.5 Hit testing
- Cross-lane drag (`laneTrackIdAtPointer`), the marquee rows and the library drop target already use the real row rectangles.
- Keep it that way. Variable and folded heights must not break them. Prove it in §4 R11-P2 rather than assuming it.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/view.ts
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx}
?? docs/implementation/2026/quarter-IV/{016-studio-lab-round7-fixes.md,017-studio-lab-detail-panel.md,018-studio-lab-round9-drift.md,019-studio-lab-round10-wrap-ruler.md}
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

At the start, record sha256 of every §3.3 frozen file into `a-round-11/gates/frozen-start.txt`. C compares against it.

### 3.2 May modify or create this round

**Modify:**
- `app/components/arrangement/StudioWorkspace.tsx`:
  - the view state for fold, heights and auto-fit;
  - the recompute inside the existing `ResizeObserver` callback, and after fold/unfold;
  - the D-29b cap and the user-resize flag;
  - the props passed to `ArrangementLane` and `ArrangementDetailPanel`.

  No change to the transport, Follow, ruler, marquee maths, key handlers (beyond what §2 needs; list every change) or footer text.
- `app/components/arrangement/ArrangementLane.tsx`:
  - the fold button;
  - the height handle;
  - the row height via `style`;
  - the compact and folded header;
  - passing `folded` to the clips.
- `app/components/arrangement/ArrangementClip.tsx`: **only** a `folded` prop. It hides the waveform body and the range gesture and adds the `title` line. Header move, selection, cross-lane drag and trim are unchanged.
- `app/components/arrangement/ArrangementDetailPanel.tsx`: **only** what §2.4 needs:
  - an optional open-height cap prop;
  - a user-resize callback;
  - the drag and key step starting from the rendered height;
  - `aria-valuenow` / `aria-valuetext` per §2.4.

  **The detail playhead writer (R9-D3 contract), the waveform, the range overlay, the inputs and the content are byte-unchanged.** C diffs that region.
- `app/lib/arrangement/panels.ts`: add the pure helpers in §2.3 and §2.4. The existing exports keep their behaviour.
- `app/lib/arrangement/__tests__/panels.test.ts` and `detail-panel.test.tsx`: add tests only. Existing assertions keep their meaning; list any changed expectation as a named exception, with before and after.
- `docs/implementation/2026/quarter-IV/019-studio-lab-round10-wrap-ruler.md`: status and TODO lines only. Record C round 10 exactly:
  - R10-W2/R1/R2/Doc PASS; R10-W3 not applicable;
  - R10-W1 FAIL: 6/9 below the window; `d` at +300 between −0.017 and −0.020 in all 9 wraps;
  - C-R7-02 closed;
  - C-R7-01 open, routed to round 12 under D-19a (no PASS, no "resolved").

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/track-layout.test.tsx` | Component tests for §5 (fold, height handle, registry, keys, history, alignment, folded clip). |
| `docs/implementation/2026/quarter-IV/020-studio-lab-track-fold-autofit.md` | Per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 020 is taken). Contents: the measurements, the auto-fit formula, D-29b, the compact header, the design-philosopher ruling and the tests. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-11.md` | Your report (§8). |
| `../tmp/studio-real-loop/a-round-11/` | Runs, measurements, shots, gates and guard outputs. |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

### 3.3 Frozen this round (C checks them with sha256 against `a-round-11/gates/frozen-start.txt`)

- `ArrangementContext.tsx`, `ArrangementLibraryPreview.tsx`, `position-store.ts`, `render-budget.test.tsx` (C-R8-01/C-R6-02 target for the Tech Lead run);
- `ArrangementVideoDock.tsx`, `video-sync.ts`, `video-sync.test.ts` (C-R7-01 target for round 12);
- `ArrangementLibrary.tsx`, `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx`, `ArrangementContext.test.ts`;
- `app/types/arrangement.ts`, the scheduler, `loop.ts`, `model.ts`, `graph.client.ts`;
- docs 015, 016, 017 and 018.

**Read-only imports allowed:** `~/lib/sfx-edit`, `~/lib/sfx-video.client`, `~/components/ui`, `~/lib/utils`, `@remix-run/react`.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`;
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only. Copy what you need into `a-round-11/`.

**Also not allowed:**
- new dependencies or installs;
- a new CSS file or any `app/styles` change;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..10 work;
- leaving temporary instrumentation in source;
- **editing any `store/` file (including docs) while a browser measurement runs** (Vite reloads the page).

## 4. Acceptance (C)

Viewports: 1440×900 and 1280×720, anonymous `/studio-lab`, a fresh setup per check. Synthetic pointers need `buttons: 1`; keys use real `$B press`.

- **R11-P2 (fold and height).**
  - **Fold:** fold the music lane. Its row is 36 px (±1), and the header and lane are equal (±1).
    - The folded M and S toggle mute/solo with the same `aria-pressed`.
    - Export with music muted through the folded M: the music oracle is silent.
    - Export with music folded but not muted equals the unfolded export (maxDiff ≤ 1.2e-7).
  - **Unfold** returns the previous height.
  - **Height handle on the SFX lane:**
    - drag +60 px → 140 (±1);
    - ↑ ×3 → −24 (116 ±1);
    - clamped at 60 and 180 (video lane 52);
    - `aria-valuenow` matches each value;
    - ↑/↓ on the handle do not nudge a selected clip.
  - **Mixed heights** (music folded, SFX 140):
    - a cross-lane header drag music → stems lands on stems;
    - a header drag stems → the folded music lane lands on music;
    - a marquee from the stems lane into the SFX lane selects exactly the clips under it (R8-M1 and R6-S2, re-run on these heights);
    - a library drop on the SFX lane lands on SFX.
  - **History:** no history entry from fold, height or auto-fit. Undo after them does not change any height.
  - **Folded clip:** a pointer-down on the folded clip's lower area starts no range. The clip `title` contains `ხაზი დაკეცილია — დროის მოსანიშნად გაშალე`. Trim of a folded clip changes its length by the dragged amount, with one history entry.
- **R11-P2k (keys and registry).**
  - Space on a focused fold button folds the lane, and the transport stays stopped (position and state unchanged).
  - During a height-handle drag, a second pointer on a clip is ignored, and Mute is refused with `GESTURE_EDIT_BLOCKED_MESSAGE`.
  - `pointercancel` restores the start height.
- **R11-P2a (auto-fit, with D-29b).**
  - **At 1280×720**, library open, a video clip, detail panel opened with its toggle:
    - all 4 lane rows, the ruler and the loop strip lie fully inside the scroller viewport, with no vertical scrolling;
    - every lane is ≥ its minimum;
    - the panel's rendered height is in [120, 144] and equals its `aria-valuenow`.

    C reports every height.
  - At 1280×720 the panel still **starts collapsed**, and at 1440×900 it starts open (D-29a).
  - **User override:** at 1280×720, drag the detail separator up by 60 px. The panel honours the drag (rendered height = drag result, ±1), the cap no longer applies, and the timeline may scroll vertically.
  - **Auto-fit off:** after one manual lane height change, resizing the window does not change that lane's height.
  - **At 1440×900** the lanes are at their default 80 px if they fit. C reports the measured heights.
  - **Folding** one lane while auto-fit is on gives the freed height back to the other lanes, up to their defaults.
- **R11-P4 (fold shots).** At 1440×900 and 1280×720: `fold-1440.png` and `fold-1280.png` (music folded, SFX 140), plus `panels-1280.png` (detail opened, auto-fit).
  - In every shot there is no overlap or clipping of the header, transport, dock, lanes, detail panel or footer.
  - The footer shortcut hint is one line (R11A-3, contract N1). The transport follows R10-N8. The compact dock is ≥ 160×90.
  - Every lane header has `scrollHeight ≤ clientHeight + 1`.
- **R11-U (unit and component).**
  - **`panels.test.ts`:**
    - track clamp/step per kind (audio 60–180, video 52–180, ±8);
    - `fitLaneHeights`: fits → defaults; short → minimums; folded lanes subtracted; the video share; never above the default;
    - the D-29b cap: fits → no cap; short → the cap in [120, 280]; impossible → 120.
    - the D-29b cap is identical whether computed with the panel collapsed or open (invariant column frame).
  - **`track-layout.test.tsx`:**
    - fold keeps M/S working, with the same `aria-pressed`;
    - fold, height and auto-fit write no history;
    - the height handle claims the registry (a second pointer on a clip is ignored);
    - ↑/↓ on the handle do not nudge a selected clip;
    - Space on the fold button does not start the transport;
    - the header and lane share one height;
    - a folded clip renders no range body and has the title line;
    - the first manual height change turns auto-fit off and fold does not.
  - **`detail-panel.test.tsx`:**
    - the cap limits the rendered height;
    - a user separator step starts from the rendered height and turns the cap off;
    - `aria-valuenow` = the rendered height.
  - **Guard proof:** for `fitLaneHeights` and the cap, temporarily break one rule (for example, remove the "never above default" clamp), show the failing test and restore with `cmp`. Save the output in `a-round-11/`.
- **R11-Doc.** Doc 019 shows C round 10 exactly as in §3.2. Doc 020 contains no unverified PASS.

## 5. Required tests (behavioural, named)

- Everything in R11-U, with one guard proof.
- Any new status or `title` text is asserted by a test.
- Every changed assertion is listed in your report with before and after.

## 6. What C verifies (focused, per the workflow)

1. **Feature:** R11-P2, R11-P2k, R11-P2a, R11-P4, R11-U, R11-Doc.
2. **Adjacent regressions only:**
   - **R11-P1b:** detail collapse/expand and the separator (±16, 120/280) still work at 1440×900 with the cap not engaged;
   - **R11-P1c quick:** one music clip → name, start, length and offset match the footer;
   - **R9-D3 quick:** the MutationObserver on the detail playhead over 3 s still shows only `transform`. C also diffs the playhead-writer region of `ArrangementDetailPanel.tsx` against round 10: it must be unchanged;
   - **RF7-P2:** `render-budget.test.tsx` unchanged (sha) and green. Also a browser check: playing 3 s with the panel open → lanes and clips render 0 times on position updates (React profiler or a render-count probe in C's harness, not in source);
   - **R8-M1, R6-S2, R12-L3** on default heights: 1 run each;
   - **R10-N8 / R11A-3** shots at both viewports;
   - **R3-V1 mode D, 1 run, light harness (information only, not a C-R8-01 verdict):** it must be no worse than round 9's valid D runs. Report max, cover, app LoAF and `tick` + mt p95.
3. **Gates:**
   - **G11-1.** tsc 0. vitest ≥ **812** + new tests, 0 failures. Build passes. Biome 0 errors on the owned paths and on `./app`.
     - The `sfx-library.test.tsx` timeout seen once by A in round 10 is a known load flake. If it recurs, re-run that file alone and report both results; do not hide it.
   - **G11-2.** Protected hashes OK. `git status` / `git diff --stat` show only paths from §3.1/§3.2.
     - The two foreign agent files are excluded and reported to root.
     - `Header.tsx` is identical to HEAD.
     - Every §3.3 frozen file matches its start hash. **C uses its own round-10 end hashes** (`c-round-10/frozen-check.txt`, `c-round-10/hashes.txt`, and its `cmp` of the dock, `video-sync.ts` and `video-sync.test.ts` against `a-round-10/bak/*.base.*`) wherever they cover the file. A's `a-round-11/gates/frozen-start.txt` is used only for the rest.
     - No change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` or `studio-lab-demo.ts`.
   - **G11-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **Harness rules decided by B:**
   - **H1** and **H2** (round 10) still apply.
   - **New, H3 (wrap landing, from round 12's verdict on).** The RF5-2 regression rule is evaluated on one row: `|vt − expected(ctx)| ≤ 0.01` at the first rAF with ctx ≥ wrap + 0.300, where `expected = loop.start + (ctx − wrapCtx)`. Alternatively, interpolate `vt` to exactly wrap + 0.300. C's `wrapdetail.js` `d300` is this quantity.
     - H3 does not re-score round 10: R10-W1 fails under both formulations.
     - It is not used in round 11.
5. **Closed root carry (do not list as open).** Root review M1 (R4-B7), L1/L2/L3/L4 (round 4), **L8 (round 4, R4-B6, `c-round-4.md` §7: Web Audio failure shows a status)**, M2 (R4-M2), L6 (round 5, R5-B4), L7 (accepted) and M3 (round 6, R6-D1) are closed by C's own PASSes. C round 10 §9 listed L8 again; that listing is stale. Still carried and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - export hard-clip at 0 dBFS (R13-M4, SRW-13);
   - the final commit/push only after everything.
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R7-01 (round 12, D-19a), C-R8-01 and C-R6-02 (Tech Lead quiet Chrome);
   - R11-P3 (stage 3, round 13);
   - the panel polish round;
   - the 21 regression-debt IDs (milestone);
   - Tech Lead manual checks (R11-P3m including the new height-handle drag with a real mouse, quiet-Chrome drift/wrap and the rest).

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
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

**Review.**
- Invoke the actual `code-reviewer` subagent on the full diff of every file you touch this round.
- Fix its findings, then **re-run it on the fix delta**. Quote both summaries.

## 8. Report `../tmp/studio-real-loop/a-round-11.md`

1. The pre-flight gate, including the §2.4 step-1 measurements and the computed cap at both viewports.
2. The design:
   - the view-state shape;
   - the auto-fit formula exactly as implemented;
   - D-29b;
   - the compact and folded header layout;
   - the design-philosopher ruling, quoted.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..10 file was reverted;
   - every §3.3 file matches `frozen-start.txt`;
   - the detail playhead-writer region is unchanged;
   - `Header.tsx` is byte-identical to HEAD.
4. Verbatim command tails.
5. Your own browser checks of R11-P2/P2k/P2a/P4 (marked as A's evidence, not a verdict), with shots and the measured heights.
6. New and changed tests, each with its reason, before and after for any named exception, and the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with the reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 12: C-R7-01 under D-19a (post-swap settle; see `plan.md`).**
  - After a standby swap, the soft-sync controller uses a tighter settle band (≤ 0.008 s) and a settle gain **K ≤ 10** (D-19's K ∈ [2, 5] widens only during settle) within the unchanged rate band [0.5, 2.0]. It does so until |d| first falls inside the settle band, or for 1.0 s, or until the next seek, swap or pause; then the 0.02 s deadband and the steady-state K resume. With K = 4 the time constant is 0.25 s, which leaves about −0.02 at +300 ms (C's measurement), so about K ≈ 8 is needed.
  - The logic is a pure helper in `video-sync.ts`, with a deterministic simulation test: a modelled 30 ms post-start freeze must reach |d| ≤ 0.01 by +300 ms with **0 stall escalations** (a settle rate near 1.5 approaches `VIDEO_STALL_LAG_RATE`).
  - The dock is touched only in the swap block and at the rate write.
  - Verdict: **R12-W1** (the R10-W1 rule under H3), with 0 escalations in the verdict runs. Regressions: R3-V1 steady state (no rate hunting), RF5-3, R2-V3, and `multiPlayingMaxMs` ≤ 17.
  - The Tech Lead quiet-Chrome RF7-3 run remains required evidence.
- **Round 13:** stage 3, the floating video. It starts after C-R7-01 closes, or after the Tech Lead accepts the quiet-Chrome result.
- **Then:** the panel polish round (L11, M1, M-R10-1/M2, L2–L8, design (a)–(d)), the milestone regression (including the 21 regression-debt IDs), SRW-13 onwards in dependency order, the SRW-21 adapter contract, and T12.
