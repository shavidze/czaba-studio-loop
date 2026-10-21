# CURRENT TASK — Round 8 (bounded): SRW-11B stage 1, the Clip Detail panel (PNL-01, FB-08)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-09
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature, or up to three closely related bugs.
Previous task: `tmp/studio-real-loop/tasks/round-7.md`. C's verdict was **FAIL**:
- RF7-3 failed (new bug C-R7-01, Medium);
- C-R6-02 stays open;
- new bug C-R7-02 (Low);
- every other round-7 ID passed (`c-round-7.md`, `c-round-7.json`).

B's record: `b-round-7.md`. Progress board: `feature-status.md`.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-29, the new D-29a, D-26, D-28 and D-30 are binding.**
Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why a feature and not the open sync bugs.** C-R7-01 and C-R6-02 are Medium. They block no other feature and are not security or data-loss bugs. Round 7 used the C-R6-02 run budget, and no round-7 change sits on the loop-wrap path. Under the workflow's sync-budget rule, and under round-7 §3 ("if RF7-P1 and RF7-P2 pass … the next round starts SRW-11B"), this round starts the next independent feature.

The three bugs are **not dropped**:
- each has a concrete follow-up spec in `backlog.json`;
- they are scheduled as round 9, a bug round;
- the Tech Lead quiet-Chrome run is their required next evidence.

**Baseline.** HEAD `c5ed47b` plus 14 modified and 2 untracked round-6/round-7 files, all verified by C in round 7 (`c-round-7/git-status-start.txt`). If root commits them before you start, HEAD is the baseline.
- Do not revert, re-create or reformat any of those files; edit on top of them.
- Nobody commits in this round.

## 0. Scope: one feature, stage 1 of 3

SRW-11B is three separately verifiable stages under D-29. **This round is stage 1 only: the Clip Detail panel.** The other stages are sequenced, not dropped:
- stage 2: track fold/height plus lane auto-fit (R11-P2, R11-P2a);
- stage 3: the floating expanded video (R11-P3).

Their acceptance stays in `tasks/round-7-before-bounded-policy.md` §7.2–§7.4.

**Not in this round** (no UI for any of these; all scheduled):
- track fold/height/auto-fit;
- the floating video;
- the sync bugs (round 9);
- SRW-13..SRW-20;
- the purchased-adapter contract (SRW-21);
- T12 Gain/Volume.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §8 regression-checks:**
- the timeline scroller height and the 1280×720 layout (R11A-3, R10-N8);
- Follow and Fit (R10-N4, R10-N5);
- per-frame DOM work and the Play render budget (R4-M2, RF7-P2);
- the D-26 registry with a new separator gesture (R26-*);
- keyboard shortcuts while a number input has focus;
- the footer test ids that C's scripts read.

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `SKELETON_LOADING.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
   - Prompts: `studio-feature.md`, `new-component.md`, `new-test.md`.
   - Skill: `pre-flight`.
   - Where a primitive example is stale, the code and this task win.
2. **Design-philosopher pre-step.** B's session has no Agent tool, so you invoke the real `design-philosopher` subagent in pre-flight (the SRW-11A precedent). Use it read-only, with D-29/D-29a as the binding default.
   - It may decide: the Georgian panel title and labels, the token choices, the density, and the order of the content lines.
   - It may **not** change the D-29/D-29a numbers, add controls or remove the footer line.
   - Quote its ruling in your report. A ruling that conflicts with D-29 is recorded as a follow-up and not applied.
3. Read for behaviour:
   - `plan.md` D-26, D-28, D-29, D-29a and D-30;
   - `tasks/round-7-before-bounded-policy.md` §7 (common rules and §7.1);
   - `c-round-7.md` §1, §6 and §7;
   - `c-round-7/runs/n8-1280x720.json` and `n8-1440x900.json`.
4. Read every file you change.
5. Post the **pre-flight gate** at the top of your report: your assumptions, the smallest version, each file with its reason, and the commands that prove success.

## 2. File ownership (exact; nothing else may change)

### 2.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLane,ArrangementLibrary,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/view.ts
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/lib/arrangement/__tests__/render-budget.test.tsx
?? docs/implementation/2026/quarter-IV/016-studio-lab-round7-fixes.md
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 2.2 May modify or create this round

**Create:**

| File | Responsibility |
|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | The panel (§3). |
| `app/lib/arrangement/panels.ts` | Pure maths, no DOM: the detail height clamp and key step, the D-29a default-open decision, and range-input validation (finite, end > start, inside the clip ±0.01 s). Stage 2/3 maths are **not** added now. |
| `app/lib/arrangement/__tests__/panels.test.ts` | Unit tests for `panels.ts`. |
| `app/lib/arrangement/__tests__/detail-panel.test.tsx` (name optional) | Component tests (§5). |
| `docs/implementation/2026/quarter-IV/017-studio-lab-detail-panel.md` | Per `.claude/rules/implementation-docs.md` and `docs/implementation/TEMPLATE.md`, in Georgian. Use the next free number if 017 is taken. Everything in it is "pending C". |
| `../tmp/studio-real-loop/a-round-8.md` | Your report (§9). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

**Modify** (named reasons only):
- `app/components/arrangement/StudioWorkspace.tsx`:
  - mount the panel under the timeline scroller and above the footer, in the right column;
  - layout so the scroller shrinks or grows with the panel;
  - pass the selection and range props.

  Keep every existing footer element and test id unchanged (`arrangement-status`, `arrangement-range`, `arrangement-delete-hint`, `arrangement-selection-count`, `arrangement-selected-clip`, `arrangement-lane-move-*`).
- `app/components/arrangement/ArrangementClip.tsx`: **only** to add `export` to the existing `buildPeakShape` (mini-waveform reuse). No other change. If you can reuse the peaks without it, do not touch the file.
- `app/contexts/ArrangementContext.tsx`: **only if** the panel cannot be built from the existing value members. Today it already exposes `selectedClipIds`, `range`, `setTimeRange`, `claimPointerGesture`, `isPointerGestureActive`, `sourcePeaks`, `arrangement` and `useArrangementPositionWriter`. If you change it, name the member and the reason. Panel height/collapsed state is **not** stored in the context's history or in `Arrangement`.
- `app/lib/arrangement/__tests__/render-budget.test.tsx`: add the detail-panel cases (§5). Existing assertions do not change.
- `docs/implementation/2026/quarter-IV/016-studio-lab-round7-fixes.md`: status/TODO lines only. Record C round 7 as it is:
  - FAIL on RF7-3 (C-R7-01);
  - C-R6-02 open;
  - C-R7-02 open;
  - C-R6-01 and C-R6-03 closed by C;
  - the other round-7 IDs passed.

**Do not change** `app/types/arrangement.ts`, `ArrangementLane.tsx`, `ArrangementVideoDock.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementOverview.tsx`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`, `view.ts`, `video-sync.ts` or `position-store.ts`. The stage 2/3 and sync-bug files stay out of this round, so the dock-related drift checks (RF6-1) are not adjacent.

**Read-only imports allowed:** `~/lib/sfx-edit`, `~/lib/sfx-video.client`, `~/components/ui`, `~/lib/utils`, `@remix-run/react`.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`;
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only; copy what you need into your system temp directory.

**Also not allowed:**
- new dependencies or installs;
- a new CSS file or any `app/styles` change (Tailwind and design tokens only);
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6 or round-7 work.

## 3. The feature: Clip Detail panel (D-29 §Detail panel + D-29a)

### 3.1 Placement, collapse and resize
- **Placement:** a full-width panel inside the right column, under the timeline scroller and above the footer.
  - The scroller loses exactly the panel's height. The panel never overlaps or covers the scroller, the ruler or the lanes.
  - The separator is the panel's top edge. Its hit area overlays the top of the panel header and adds **0 px** of layout height.
- **Header row (36 px):** the panel title (design-philosopher's Georgian label), the selected clip's name (or the count/hint), and a toggle button with `aria-expanded` and `aria-controls`.
  - Collapsed = 36 px, header visible. No transport button is added.
  - Expanding restores the previous expanded height.
  - Height changes use a 300 ms `motion-safe:` transition; with `prefers-reduced-motion` there is none, and there is none while dragging.
- **Resize:** the separator has `role="separator"`, `aria-orientation="horizontal"`, `aria-valuemin=120`, `aria-valuemax=280` and `aria-valuenow`.
  - Pointer drag claims the D-26 registry: `claimPointerGesture(pointerId, abort)`. The abort restores the height from before the drag.
  - Keys on the focused separator: ↑ = +16 px, ↓ = −16 px, clamped to 120–280. The keys are consumed, so there is no clip nudge and no global shortcut.
  - A drag or key on a collapsed panel opens it first.
  - While another gesture is active, a separator pointerdown is ignored (D-26 rule 1).
- **D-29a default open state** (decided once at mount from the measured lane budget; not re-evaluated afterwards):
  - Open at 144 px only if, with the panel open, the scroller's client height still holds the sticky ruler, the loop strip, every lane at its current height and the horizontal scrollbar.
  - Otherwise the panel starts collapsed.

  From C's measurements this means: **1440×900 → open; 1280×720 → collapsed.**
  - The scroller is measurable only after the first paint. Render collapsed first, decide once in a layout effect, and apply that first change **without a transition**, so no 300 ms opening animation plays on load and screenshots never catch a mid-transition state.
  - If the user opens it at 1280×720, the timeline scroller scrolls vertically. That is honest, and lane auto-fit is stage 2 (R11-P2a, carried).
  - The rule is a pure function in `panels.ts`.
- **View state only:**
  - not in `Arrangement`, not in the edit history;
  - Undo/Redo never change it;
  - export ignores it;
  - not persisted across reloads.

### 3.2 Content
- **One clip selected (the primary selection):**
  - name, lane name, start, length and source offset (`formatArrangementTime`), plus the line `წყარო უცვლელი რჩება`;
  - a mini waveform of the clip's visible part from the existing `sourcePeaks` (the same shape maths as the lane clip). A video clip shows a labelled placeholder;
  - a range overlay when the current `range` is on this clip's lane and overlaps the clip;
  - a **detail playhead** line, shown only while the live position is inside the clip. It is driven by the position store through the round-7 writer pattern (`useArrangementPositionWriter` or the same direct-DOM approach). It causes **0 React renders** per frame and **reads no layout per frame**: set `left` as a percentage of the clip span, or use a width cached by a ResizeObserver. Never call `clientWidth`, `getBoundingClientRect` or `offsetWidth` inside the writer.
- **Range inputs:** `start` and `end` in seconds (`type="number"`, `step="0.001"`), plus a `მონიშვნა` button. Enter in either input also triggers it.
  - **Valid** (both values finite, end > start, both within [clip.start − 0.01, clip.end + 0.01]): call the existing `setTimeRange({ start, end, trackId })` for the clip's lane. No history entry; the footer `arrangement-range` line and `arrangement-delete-hint` update.
  - **Invalid:** nothing changes, and the status reads exactly `მონაკვეთი კლიპის საზღვრებში უნდა იყოს; დასასრული დასაწყისზე მეტი უნდა იყოს.`
  - **During an active pointer gesture:** refused with `GESTURE_EDIT_BLOCKED_MESSAGE` (D-26 rule 3), range unchanged.
  - Enable the inputs exactly on lanes where the timeline's own waveform range selection works today. Read the code to find out. Elsewhere, disable them and put the reason in `title`.
- **Several clips selected:** `{n} კლიპი`, the lane names, the earliest start and the span length. The inputs are disabled with the reason. Add one note line (group move / Delete / Ctrl+D).
- **Nothing selected:** a hint line; the inputs are disabled.
- **Keyboard safety:**
  - number inputs are typing targets, so `+ − Z X Space Delete` and the arrows do not reach the global shortcuts (the existing `isTypingTarget` rule; verify it covers `type="number"`);
  - Space on the focused toggle activates the toggle, not the transport.
- **Footer:** `arrangement-selected-clip` and every other footer line stay unchanged (C's scripts depend on them). If the design-philosopher calls the duplication redundant, record that as a follow-up and do not apply it.
- Design tokens only, Tailwind only, Georgian UI text, no `// comments`, semicolons, TypeScript strict (no `any`, no `@ts-ignore`, no type assertions).

## 4. Acceptance (C)

- **R11-P1b (layout, collapse, resize).** At 1440×900:
  - Toggle → 36 px ↔ the previous height. The 300 ms transition is present (`motion-safe`) and absent under reduced motion.
  - Separator pointer drag ±40 px, and ↑/↓ = ±16 px: clamped at 120 and 280, and `aria-valuenow` matches the rendered height (±1 px).
  - The scroller's client height changes by the same amount (±1 px). The panel never overlaps the scroller.
  - No history entry (Undo label unchanged). Arrow keys on the separator do not move a selected clip.
  - A second pointer on a clip header during the separator drag is ignored (the clip does not move, no entry). Mute during the drag is refused with `GESTURE_EDIT_BLOCKED_MESSAGE`. After release, `isPointerGestureActive()` is false.
  - Blur or `pointercancel` mid-drag restores the pre-drag height.
- **R11-P1d (D-29a default and the layout regression).** Fresh `/studio-lab` with the demo project and a video clip:
  - 1440×900: the panel starts open at 144 px.
  - 1280×720: the panel starts collapsed (36 px).
  - In both: all 4 lane rows, the ruler and the loop strip are fully inside the scroller viewport without vertical scrolling; the footer is one line; the transport follows R10-N8; the compact dock is ≥ 160×90.
  - At 1280×720 after opening: the timeline scrolls vertically, nothing overlaps or is cut (R11-P2a carried to stage 2, not a failure here).
- **R11-P1c (content).**
  - One music clip selected: name, lane, start, length and offset match the footer `arrangement-selected-clip` line.
  - Inputs 3.5 / 7.25 + `მონიშვნა` (and the same through Enter): the range is `00:03.500 — 00:07.250` on that lane in `arrangement-range`, `arrangement-delete-hint` is visible, and there is no history entry.
  - Out-of-clip values, or end ≤ start: the exact refusal status, range unchanged.
  - Two clips: `2 კლიპი`, inputs disabled. No selection: the hint, inputs disabled. A video clip: the placeholder.
  - Typing `+`, `-`, `z`, `x`, Space and Delete in an input changes neither zoom, playback nor clips.
  - While playing across the selected clip, the detail playhead moves (monotone `left`) and is hidden outside the clip.
- **R11-P1e (render budget).** A test asserts that the panel's content component renders **0 times**:
  - over 60 position-store frames;
  - over Play→Pause→Play (the RF7-P2 pattern), with mount > 0 asserted and a positive control.

  The existing RF7-P2 assertions (clips, overview bars, library rows, ruler ticks: 0) still pass.
- **R11-P4d (shots).** `detail-1440-open.png`, `detail-1440-collapsed.png`, `detail-1280-default.png`, `detail-1280-open.png`. Each shows no overlap or clipping of the header, transport, dock, scroller, panel or footer.
- **R11-U1.**
  - `panels.test.ts`: the clamp and the ±16 step, the default-open decision (fits / does not fit / exactly at the limit), and range validation (inside ±0.01, end ≤ start, NaN/∞, outside).
  - Component tests:
    - collapse/expand and the separator keys write no history;
    - the separator claims the registry, so a second pointer on a clip is ignored;
    - the abort restores the height;
    - the refusal statuses (invalid range, during a gesture) are asserted by their exact text;
    - inputs disabled for multi-selection and for no selection;
    - Space on the focused panel toggle toggles the panel and does **not** start or stop playback. Today the global keydown handler exempts only typing targets, so a fix may be needed in `StudioWorkspace.tsx`;
    - the D-29a mount decision applies without a transition.

## 5. Required tests (behavioural, named)

- `panels.test.ts` and the component tests (R11-U1).
- The render-budget cases (R11-P1e).
- Every new status or refusal text is asserted by a test.
- At least one test must fail without the feature's guard. For example, the separator claim test fails if the pointerdown does not call `claimPointerGesture`. Say how you know (run it once against a temporary local revert of that one guard, then restore it byte for byte; no git stash or checkout).

## 6. Docs

- Doc 017 (new): context, approach (D-29 + D-29a, the design-philosopher ruling), changed files, constants (144 / 120–280 / ±16 / 36 / 0 px separator / the ±0.01 rule), tests, and TODO: stage 2/3 and the round-9 bug round. Mark everything "pending C".
- Doc 016: the status/TODO lines in §2.2.
- **R8-D1 (C):** no unverified PASS claim in doc 016 or doc 017; doc 016 shows the C round-7 result exactly as in §2.2.

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement
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

**Review.** Invoke the actual `code-reviewer` subagent on your full diff, fix its findings, then **re-run it on the fix delta** (round 7 skipped the re-run). Quote both summaries.

## 8. What C will verify (focused, per the workflow)

1. **Feature:** R11-P1b, R11-P1d, R11-P1c, R11-P1e, R11-P4d, R11-U1, R8-D1.
2. **Adjacent regressions only:**
   - R4-M2: per-frame DOM mutations only on position consumers, now including the detail playhead.
   - RF7-P2 (render test) and R10-N8 / R11A-3 (layout at both viewports, with the panel's default state).
   - R10-N4: Follow while playing, with the panel open, keeps the playhead visible.
   - R10-N5: Fit after the panel toggles. The scroller width is unchanged, so Fit is unchanged.
   - R26-1..3: the registry with the new separator gesture.
   - Keyboard shortcuts with focus in the panel inputs.
   - **R3-V1 adjacent drift, because a new per-frame consumer was added:**
     - 3 valid light-harness runs (budget: 3 plus ≤ 2 environment replacements);
     - D-24 verdict with raw and stall-excluded series, a CPU column, and LoAF scripts with `forcedStyleAndLayoutDuration`;
     - **attribution.** Position-store writers run inside the `ArrangementContext.tsx` rAF `tick`, so LoAF `sourceURL` cannot single out the panel. These rules apply instead, and a breach of any one **fails this round**:
       - any steady-playback app script with `forcedStyleAndLayoutDuration` > 1 ms, whatever its file. Round 7 proved 0, and the panel is the only new per-frame code;
       - A's report gives the per-subscriber p50/p95/max of the new detail-playhead writer, measured with a temporary harness wrapper that is removed before finishing (the round-7 method, `a-round-7.md` §4.2). It must stay within the round-7 writer envelope: p50 ≤ 0.1 ms, p95 ≤ 0.2 ms, max ≤ 1 ms excluding preempted frames;
       - `tick` + microtasks p50/p95 must not regress beyond A's round-7 "after" numbers (0.7–0.8 / 1.1–1.5 ms) by more than 0.2 ms. A reports the two side by side, and C re-checks with the same wrapper if A's numbers are missing;
     - any other D-24 drift failure is recorded as new evidence under the open C-R6-02 and does not fail stage 1;
     - tolerances are unchanged.
3. **Gates:**
   - **G8-1.** tsc 0. vitest ≥ 779 + new tests, 0 failures. Build passes. Biome 0 errors on the owned paths and on `./app`.
   - **G8-2.** Protected hashes OK. `git status` / `git diff --stat` show only paths from §2.1/§2.2. `Header.tsx` is identical to HEAD. No change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` or `studio-lab-demo.ts`.
   - **G8-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **Not this round (recorded in `feature-status.md`; not PASS):**
   - the 21 regression-debt IDs (due at the milestone after SRW-11B);
   - C-R7-01, C-R6-02 and C-R7-02 (round 9);
   - R11-P2/P2a/P3 (stages 2/3);
   - the Tech Lead real-mouse separator drag (R11-P3m) and quiet-Chrome drift/wrap.

## 9. Report `../tmp/studio-real-loop/a-round-8.md`

1. The pre-flight gate.
2. The design-philosopher ruling, quoted; anything not applied, with the reason.
3. The files actually changed (a subset of §2.2), with confirmation that no round-6/7 file was reverted and that `Header.tsx` is byte-identical to HEAD.
4. Verbatim command tails.
5. Constants and the D-29a decision, with your measured 1280/1440 numbers (scroller client height, lane total, ruler, loop strip, scrollbar).
6. New and changed tests, each with its reason, and how you know the guard test fails without the guard.
7. Both code-reviewer summaries and your fixes.
8. Your own browser checks (synthetic pointers, real `$B press`), plus your R3-V1 light runs within the budget, with the detail-writer and `tick` timing table from §8.
9. Deviations, each with the reason.
10. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 10. Next (for orientation only; not this round)

- **Round 9 (bug round),** per the specs in `backlog.json`:
  - C-R7-01: standby hand-off instrumentation at the wrap, then a fix for (a) late or unsettled pre-seek or (b) first-swap warm-up;
  - C-R6-02: named candidates, i.e. the `LibraryPlayheadText` position writer and the post-hold `isTransportRunning` re-render;
  - C-R7-02: label overflow ≤ 1 px on C's zoom sweep.
- **Round 10:** SRW-11B stage 2 (fold/height + auto-fit; it must reconcile the D-29a 1280 budget).
- **Round 11:** stage 3 (floating video).
- **Then:** the milestone regression, followed by SRW-13 onwards in dependency order.
