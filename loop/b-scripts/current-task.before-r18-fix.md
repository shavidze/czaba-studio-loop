# CURRENT TASK — Round 18: polish 14b in the detail panel (L4, L11, design (b), L6, design (d)) (D-29i)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this grouping.** No C bug is open that a code round can fix: C round 17 found none and closed C-R16-01. The two open Mediums wait on the Tech Lead quiet-Chrome run, and C-R12-01 waits on the milestone. The next scheduled scope is polish 14b (D-29h). Its five items are follow-ups recorded since round 8, all in one file, `ArrangementDetailPanel.tsx`:
- three change behaviour: L4, L11 and design (b);
- two change only text: L6 and design (d).

C checks each item separately. After this round comes the milestone full regression.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-17.md`. C's verdict was **PASS**, with no new bug (`c-round-17.md`, `c-round-17.json`):
- **PASS:** R17-P1, R17-P2, R17-P3, R17-M, R17-U, R17-Doc; every §6 adjacent regression; G17-1..3; vitest 983/983.
- **Closed:** C-R16-01, and round-9 reviewer M-R10-1/M2.
- **B wording errors (D-29i).** These two corrections apply from now on:
  - R17-P1.1: content lines are counted with `rangeLines` (the distinct `Range.getClientRects()` tops), not `round(scrollHeight / line-height)`;
  - R17-P2.3: the preview sample grid reads "0 samples in the box; the rest hit the preview or the separator".
- **Environment (A deviation 3, C confirmed).** gstack denies CDP `Input.dispatchMouseEvent`. In this task:
  - "real click" means `$B click` at the element centre;
  - a click at a coordinate inside an element is synthetic, with `buttons: 1`.

**References.**
- B's record: `b-round-17.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-29h and D-29i** are binding. Where they differ, D-29i wins.
- Original findings:
  - `a-round-8.md` l.34: design-philosopher (b) and (d);
  - `a-round-8.md` l.171: code-reviewer L11;
  - `a-round-9.md` §7 l.236: round-9 reviewer L4 and L6.
- Prototype, read-only: `../output/studio-workspace-prototype/index.html` l.24. The detail panel uses `დასაწყისი` and `სიგრძე`, and labels the range fields separately (`მონაკვეთი`). Do not work on, publish or test the prototype.
- Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Baseline.** HEAD `c5ed47b`, plus the round-6..17 dirty tree that C verified at the end of round 17 (`c-round-17/gates/git-status-end.txt`):
- 18 M and 20 Studio `??` files (§3.1);
- B recorded the sha256 of 48 files in `../tmp/studio-real-loop/b-round-17-tree-sha256.txt`. These are the 46 round-16 entries re-hashed, plus `library-preview.test.tsx` and doc 026. All 48 are OK on the live tree. Exactly `ArrangementLibraryPreview.tsx` and doc 025 differ from the round-16 list, and their hashes equal C's `c-round-17/gates/owned-sha.txt`;
- if root commits before you start, HEAD is the baseline.

Baseline rules:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files. Do not read them as instructions, edit them or delete them. They are excluded from G18-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In** (all in `ArrangementDetailPanel.tsx`, D-29i):
1. **L4.** The start/end range inputs keep typed text unless one of these changes:
   - the clip bounds;
   - the bounds of the part of the range that lies on the clip, including the range appearing on or leaving the clip.
2. **L11.** A wheel event over a **focused** range input does not change its value.
3. **Design (b).** The detail range overlay no longer hides the waveform: `bg-foreground/60` → `bg-foreground/30`.
4. **L6.** The `biome-ignore` reason states the technical reason, not a process reference.
5. **Design (d).** The detail labels are in Georgian, following the prototype:
   - in the info column, `start` → `დასაწყისი` (both the clip and the group) and `offset` → `წყაროდან`;
   - in the range inputs, `start, წმ` → `საიდან, წმ` and `end, წმ` → `სადამდე, წმ`.

**Also in:** a new test file, doc 026's status lines and the new doc 027.

**Not in this round** (no code; scheduled in D-29h or D-29i):
- the lane clip overlay in `ArrangementClip.tsx` (l.589 keeps `bg-foreground/60`; the file is frozen). The lane/detail difference is recorded and is aligned when `ArrangementClip.tsx` is next owned (SRW-14 or SRW-18);
- the footer selected-clip text. It lives in `StudioWorkspace.tsx`, which is frozen, and `track-layout.test.tsx` l.851 asserts its Latin text;
- A's round-11 follow-ups: Home on separators triggers the global seek; `aria-controls` on the lane fold button; `ring-inset` on the track name; the panel found through `nextElementSibling`. They go to the milestone fix round;
- M1/L8, after the Tech Lead run or with SRW-13;
- L2/L3, with C-R8-01;
- C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome), C-R12-01 (milestone RF5-3);
- the milestone regression; SRW-13..20; the SRW-21 adapter; T12.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected, and what §6 regression-checks:**
- **R9-D3 (the frozen compositor contract).** These stay byte-identical:
  - `ArrangementDetailPlayhead` (its element, writer and classes);
  - the `<svg>`/`<path>`;
  - the waveform box `className`.

  `render-budget.test.tsx` must stay green and unchanged.
- **Detail layout.** Longer Georgian labels could wrap a line, grow the content or narrow the waveform. §1.4 measures this before any code.
- **Range apply.** Button, Enter, the exact status texts, clamping, refusal during a gesture, and following a moved clip. The existing `detail-panel.test.tsx` covers these and must stay green and unchanged.
- **Scrolling.** The detail content still scrolls with the wheel, except over a focused range input.
- **Nothing else in the workspace changes.**

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (read only; no audio change), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - the `new-test.md` prompt and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - `plan.md` D-29h and **D-29i**;
   - the original findings listed under References.
3. Read in full:
   - `ArrangementDetailPanel.tsx`;
   - `detail-panel.test.tsx`, with its harness at l.113–180, so you can copy it;
   - `render-budget.test.tsx` l.455–510 (R9-D3).
4. **Measure before code.** Make no source edit while the browser runs, and record the results in the report and in doc 027.

   **Setup:**
   - viewports 1440×900 and 1280×720;
   - the 1440 panel at its default height (144), and the 1280 panel at its cap (142);
   - library open at 288 and at 480;
   - a selected music clip (single state), and two selected clips (group state).

   **(a) Line counts.** For every `<p>` in the info column, record its `rangeLines`, today and with the new text. For the new text, set the label text nodes **in page state only** (e.g. `span.textContent = 'დასაწყისი'`), then restore them.

   **(b) Widths.** Record the info column's width and the waveform box's width. Also record the rendered width of each range label (`საიდან, წმ`, `სადამდე, წმ`) against its 80 px input column.

   **(c) Fit.** Record the content `scrollHeight` against `clientHeight`, today and with the new text.

   **Fixed decision order for the info column width:**
   - if every info `<p>` stays one line at `w-56`, keep `w-56`;
   - otherwise, in page state, try `w-60` (240 px), then `w-64` (256 px). Take the first width at which every `<p>` is one line in both states;
   - **stop and report to B** if:
     - no width fits;
     - the waveform box would be narrower than 128 px at 1280×720 with library 480;
     - the content would scroll where it does not scroll today.
   - Record the chosen width and its price, the waveform px lost, in doc 027.
5. Post the **pre-flight gate** at the top of your report. It contains your assumptions, the measurements, the smallest design per item, each file with its reason and the commands that prove success.

## 2. Fixes (`ArrangementDetailPanel.tsx` only)

### 2.1 L4: reset only on a related change

Today the `useLayoutEffect` at l.218–226 depends on `range` as a whole object. A new range object, or a range on another lane, therefore overwrites typed text.

**Contract:**
- Derive two primitives during render:
  - `onClipStart`, the clamped on-clip range start, or `null`;
  - `onClipEnd`, the same for the end.
- The effect depends only on `[onClipStart, onClipEnd, clipStart, clipDuration]`, and its body references only these. That keeps Biome's exhaustive-deps rule satisfied without an ignore.
- The values the inputs show stay as they are today:
  - the on-clip range bounds when a range lies on the clip;
  - otherwise the clip bounds;
  - formatted with `rangeInputText`.
- **No user path changes the range today while one clip stays selected** (D-29i). Every caller either changes the selection, which remounts the content by `key`, or sets `null`, or works on a group. This fix is defensive. Its acceptance is a component test and a mutation; there is no browser criterion.

### 2.2 L11: wheel on a focused range input

- Add one native `wheel` listener with `{ passive: false }` to the detail content `<div>` (`arrangement-detail-content`). Use one ref and one effect in `ArrangementDetailContentInner`, and remove the listener on cleanup.
- The handler calls `event.preventDefault()` **only** when all of these hold:
  - `event.target` is an `HTMLInputElement`;
  - its type is `number`;
  - it is `document.activeElement`.

  Otherwise it does nothing.
- No `onWheel` prop (React's is passive), no `blur`, no document or window listener.
- **Price (disclose in doc 027):** while the pointer is over a focused range input, the wheel does not scroll the content.

### 2.3 Design (b): the overlay alpha

- In `ArrangementDetailWaveform`, the overlay `<div>` (`arrangement-detail-range`) changes exactly one class token: `bg-foreground/60` → `bg-foreground/30`.
- `border-x-2 border-foreground`, the inline `left`/`width`, the test id and every other element stay byte-identical.

### 2.4 L6: the `biome-ignore` reason

- Line 596 keeps `biome-ignore lint/a11y/useSemanticElements:`.
- Only the reason text changes. It must name the technical reason and not a process reference, e.g. `a focusable resize handle needs role=separator with aria-value*; <hr> cannot take focus or aria-valuenow`.
- Biome must still suppress the rule: `biome check` on the file reports 0 errors and no unused-suppression warning.

### 2.5 Design (d): the Georgian labels

| Place | Today | New |
|---|---|---|
| info column, clip (l.281) | `start` | `დასაწყისი` |
| info column, group (l.303) | `start` | `დასაწყისი` |
| info column, clip (l.289) | `offset` | `წყაროდან` |
| range input label (l.324) | `start, წმ` | `საიდან, წმ` |
| range input label (l.340) | `end, წმ` | `სადამდე, წმ` |

- The info column width follows §1.4 (`w-56`, otherwise `w-60` or `w-64`).
- **These stay byte-identical:**
  - `სიგრძე`, `ხაზი`, `ხაზები`, `წყარო უცვლელი რჩება`, the title, the hints and the group note;
  - both `aria-label`s (`range-ის დასაწყისი (წამი)`, `range-ის დასასრული (წამი)`);
  - every test id, value span and class except the one width token (if §1.4 chose one);
  - the footer (`StudioWorkspace.tsx`, frozen).

### 2.6 Not allowed

- Any change outside `ArrangementDetailPanel.tsx` in `app/`.
- Changing the R9-D3 hunks:
  - `ArrangementDetailPlayhead`;
  - the `<svg>`;
  - the waveform box class;
  - `will-change-transform`.
- Changing the separator, the toggle, the panel sizing, the clamp logic or `panels.ts`.
- Changing `detail-panel.test.tsx`, `render-budget.test.tsx`, `track-layout.test.tsx` or any other existing test.
- Custom CSS, arbitrary colours or new design tokens.
- Changing visible texts other than those in §2.5.
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
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx,library-preview.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..026}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**. It must stay byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- run `sha256sum -c ../tmp/studio-real-loop/b-round-17-tree-sha256.txt` (48 OK) and report any difference before you code;
- record the §3.3 frozen subset into `a-round-18/gates/frozen-start.txt`;
- copy the owned files to `a-round-18/bak/*.base.*`.

### 3.2 May modify or create this round

**Modify:**

| File | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | §2.1–§2.5 only |
| `docs/implementation/2026/quarter-IV/026-studio-lab-preview-active-lane-row.md` | Status and TODO lines only. They record: C round 17 PASS; C-R16-01 and M-R10-1/M2 closed by C; the R17-P1.1 and R17-P2.3 wording notes are B's (D-29i); R17-T stays with the Tech Lead |

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | Component tests for §2.1–§2.5 (R18-U) |
| `docs/implementation/2026/quarter-IV/027-studio-lab-detail-panel-polish-14b.md` | Written per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 027 is taken). Contents: the five items, D-29i with its rationale, the §1.4 measurements, the chosen width and its price, the L11 scroll price, the lane/detail overlay difference, the tests and your runs. Everything is "pending C" |
| `../tmp/studio-real-loop/a-round-18.md` | Your report (§8) |
| `../tmp/studio-real-loop/a-round-18/` | Runs, gates, shots and backups |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state |

### 3.3 Frozen this round

C checks these by sha256 against `b-round-17-tree-sha256.txt`: **every file in it except the two owned files above.** Explicitly:
- `detail-panel.test.tsx`, `render-budget.test.tsx`, `track-layout.test.tsx`, `panels.ts` and `panels.test.ts`;
- `StudioWorkspace.tsx`, `ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx` and `library-preview.test.tsx`;
- `ArrangementVideoDock.tsx`, `video-sync.ts`, `video-sync.test.ts`, `floating-video.test.tsx`, `ArrangementContext.tsx` and `ArrangementContext.test.ts` (the Tech Lead sync targets);
- `ArrangementExportDialog.tsx`, `export-dialog-focus.test.tsx`, `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts` and `gesture-guard.test.tsx`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts` and `graph.client.ts`; also `library.ts` (`git diff -- app/lib/arrangement/library.ts` stays empty);
- `components/ui/Modal.tsx`;
- docs 015–025.

**Read-only imports allowed:** `react` and the existing imports of the owned file.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config` or `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts` and `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**` and `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files and the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`. They are read-only; copy what you need into `a-round-18/`.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..17 work;
- leaving temporary instrumentation in source;
- editing any `store/` file (including docs) while a browser measurement runs, because Vite reloads the page;
- killing processes you did not start. If one of your commands hangs, stop that PID only (A round-17 deviation 4).

## 4. Acceptance (C)

Viewports are 1440×900 and 1280×720. The library is open at 288 unless stated. A "real click" is `$B click` at the element centre (D-29i). Keys use real `$B press`; typing uses `$B type`. Every check reports measured numbers.

**R18-L4 (component only, no user path; D-29i).** Required in `detail-panel-polish.test.tsx`, using the provider harness copied from `detail-panel.test.tsx`, with `music-1` selected (start 2, duration 8):
1. Type `3.5` into start without applying. Then call `setTimeRange({ start: 12.5, end: 13, trackId: 'sfx' })`, then `setTimeRange(null)`. Start still shows `3.5` after each call.
2. Apply 3.5 → 7.25. Type `4` into start. Call `setTimeRange` with a **new object** of the same values (`{ start: 3.5, end: 7.25, trackId: 'music' }`). Start still shows `4`.
3. **Related changes still reset:**
   - `setTimeRange({ start: 5, end: 6, trackId: 'music' })` → `5` / `6`;
   - `setTimeRange(null)` while the range was on the clip → `2` / `10`;
   - nudging the clip (`nudgeSelectedClip` or the existing path in `detail-panel.test.tsx` l.364–378) → the inputs follow.
4. **Mutation:** restoring `range` (the whole object) as an effect dependency makes (1) or (2) fail. C re-runs this mutation.

**R18-W (L11).**
1. **Component tests:**
   - a `new WheelEvent('wheel', { cancelable: true, bubbles: true, deltaY: 100 })` dispatched on the **focused** start input → `defaultPrevented === true`; the same on the focused end input → `true`;
   - the same event on an **unfocused** start input (focus elsewhere) → `false`;
   - on the waveform box → `false`;
   - with no clip selected (inputs disabled) → `false`;
   - a spy on `addEventListener` shows the `wheel` listener registered with `passive: false`;
   - after unmount, a dispatch to the detached node is not prevented. Equivalently, `removeEventListener` is called with the same handler.
2. **Mutations:** each of these makes a test fail:
   - remove the listener;
   - drop the `document.activeElement` check;
   - register the listener as passive.
3. **Browser (C, in page):**
   - at 1440×900, select the music clip with a real click, then real-click the start input (focused). Dispatch the cancelable `WheelEvent` on it → `defaultPrevented` true, and `value` is unchanged;
   - blur the input (real click on the waveform) and dispatch again → `false`.

   The real wheel stays with the Tech Lead (R18-W in the manual list).

**R18-B (design (b)).**
1. At 1440×900, select the music clip and apply a range of 3.5 → 7.25 with the inputs (real clicks, `$B type`, real Enter).
2. `getComputedStyle(arrangement-detail-range).backgroundColor` has alpha **0.3** (≤ 0.5 is the rule), and its RGB equals the computed `--foreground` / `color` of `text-foreground`.
3. `border-left-width` and `border-right-width` = 2 px.
4. The overlay `left` / `width` = `21.875%` / `23.4375%` on the demo music clip (0–16 s), as in A round 8.
5. Screenshot `detail-overlay-1440.png`. The waveform peaks are visibly continuous through the overlay. This is a secondary check; the computed alpha decides.
6. In the R9-D3 hunks diff (`git diff --no-index a-round-18/bak/ArrangementDetailPanel.base.tsx app/...`), only the overlay's class token changed inside `ArrangementDetailWaveform`. `ArrangementDetailPlayhead` is unchanged.

**R18-D (design (d) and the layout price).** At both viewports and with library 288 and 480, in the single (music) and group (two clips) states:
1. **Texts:**
   - the info column shows `დასაწყისი` (single and group) and `წყაროდან` (single);
   - no `start` or `offset` label remains in the panel's visible text;
   - the range labels read `საიდან, წმ` and `სადამდე, წმ`;
   - both input `aria-label`s are byte-identical to round 17.
2. **Lines:** every info `<p>` has `rangeLines` = 1 (or equals A's §1.4 table if a line already wrapped before).
3. **Fit:** the content `scrollHeight ≤ clientHeight` wherever it was so in A's pre-code measurement:
   - at 1440, panel 144;
   - at 1280, panel 142.
4. **Price:** the info column and waveform widths match A's §1.4 record (±1 px). A chosen width other than `w-56` is the D-29i price; it is a failure only if it is undisclosed or differs from A's number. The waveform box is ≥ 128 px wide at 1280/480.
5. **Footer:** the footer selected-clip line is byte-identical to round 17 (`კლიპი: … · start … · length … · source offset …`).
6. Screenshots `detail-labels-1440-288.png` and `detail-labels-1280-480.png`.

**R18-L6.**
- `grep -n "biome-ignore" app/components/arrangement/ArrangementDetailPanel.tsx` shows the same rule with the new reason, and no `B round` or `§` in it.
- `npx biome check app/components/arrangement/ArrangementDetailPanel.tsx` reports 0 errors and 0 suppression warnings.

**R18-A (apply still works, browser).** At 1440×900, music clip selected:
- typing 3.5 / 7.25 and a real click on `მონიშვნა` → the status reads exactly `მონიშვნა: 00:03.500 — 00:07.250 · მუსიკა.`, and `arrangement-range` contains `00:03.500 — 00:07.250`;
- typing 4 / 5 and real Enter → the range is 4–5;
- typing 20 / 21 → the exact invalid-range status, and the range is unchanged;
- no Undo entry is added (the Undo label is unchanged).

**R18-U (tests).**
- `detail-panel-polish.test.tsx` contains R18-L4 (1–3), R18-W (1) and:
  - **(b)** the overlay `className` contains `bg-foreground/30` and not `bg-foreground/60`;
  - **(d)** the five label texts, both `aria-label`s byte-identical, and no `start` / `offset` label text in the content;
  - **R9-D3 guard:** the waveform box `className` equals the string literal it has today.
- **Guard proof** (`a-round-18/guard-proof.txt`). Each mutation is temporary; restore it and check with `cmp` against your pre-guard copy:
  1. L4 deps back to `range` → an L4 test fails;
  2. remove the wheel listener → a W test fails;
  3. drop the `activeElement` check → the unfocused W test fails;
  4. register the listener as `passive: true` → a W test fails;
  5. overlay back to `/60` → the (b) test fails;
  6. one label back to Latin → the (d) test fails.
- **Frozen tests** `detail-panel.test.tsx`, `render-budget.test.tsx` and `track-layout.test.tsx` are unchanged (sha) and green.

**R18-Doc.**
- Doc 026's status lines show C round 17 exactly as in §3.2.
- Doc 027 contains no unverified PASS, and records the width price, the L11 scroll price and the lane/detail overlay difference.

## 5. Required tests (behavioural, named)

- Everything in R18-U, with the six-part guard proof.
- No existing test changes. If one would need to change, stop and report to B.

## 6. What C verifies (focused, per the workflow)

1. **The fixes:** R18-L4, R18-W, R18-B, R18-D, R18-L6, R18-A, R18-U and R18-Doc.
2. **Adjacent regressions only** (1440×900 unless stated):
   - **R8 detail quick:**
     - the toggle opens and collapses the panel (real click, and real Space on the focused toggle);
     - the separator gives ArrowUp +1 step and ArrowDown −1 step;
     - the header label shows the clip name, `2 კლიპი` or `არაფერია არჩეული`;
     - the video clip shows the placeholder `ვიდეოკლიპი · ტალღა არ ჩანს`.
   - **R16-H1 quick:** at 1280×720 the panel stays at the 142 cap after selecting and deselecting (same-lane empty click), and the 1440 control stays 144.
   - **R16-F1 quick:** footer 69, Δ0 across select ↔ deselect, at both viewports.
   - **R9-D3 / RF7-P2:** `render-budget.test.tsx` sha unchanged and green. During 3 s of arrangement Play with the panel open, the detail playhead's `style` changes only `transform` / `display` (MutationObserver in the page).
   - **Range on the lane:** a range drag on the music clip (synthetic, `buttons: 1`) still shows the lane overlay, and the detail inputs follow it.
   - **No sync runs.** The dock, `video-sync.ts` and `ArrangementContext.tsx` are frozen and sha-checked. If C sees a stall, a hard seek or a counter change during the checks, it opens a bug; no extra runs.
3. **Gates:**
   - **G18-1:**
     - tsc 0;
     - vitest ≥ **983** + the new tests, 0 failures. If the known `sfx-library.test.tsx` load flake recurs, re-run that file alone and report both results;
     - build passes;
     - Biome 0 errors on the owned paths and on `./app`.
   - **G18-2:**
     - protected hashes OK;
     - `git status` and `git diff --stat` show only §3.1/§3.2 paths. The two foreign agent files are excluded and reported to root;
     - `Header.tsx` identical to HEAD;
     - every §3.3 file matches `b-round-17-tree-sha256.txt`;
     - the owned files' base backups `a-round-18/bak/*.base.*` match `b-round-17-tree-sha256.txt`;
     - no change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `studio-lab-demo.ts`;
     - instrumentation grep = 0.
   - **G18-3:** anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view`/`scroll` events are known and allowed (root notes).
4. **Harness rules:** H1, H2 and H3 apply as before. Use the R17 wording corrections (`rangeLines`; "0 in the box, rest preview or separator").
5. **Closed root carry (do not list as open).** Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed by C's own PASSes.

   Still carried, and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the export hard-clip at 0 dBFS (R13-M4, SRW-13);
   - the final commit/push only after everything;
   - the uncommitted round-6..18 tree (root exposure note);
   - the shared `Modal.tsx` focus gap, including focus on `body` escaping the trap (root/UI owner);
   - root GA sends `scroll` with consent denied (root analytics);
   - the two foreign agent files (root);
   - A round-17 deviation 4, the python process kill (root);
   - the fake Bearer gets 500 instead of 401, but no token is issued;
   - the `publication-checkpoint.json` requirements (library/stems/scrollbars, T12, the final commit/push).
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R6-02, C-R8-01 and the RF7-3 quiet-Chrome run (Tech Lead);
   - C-R12-01 (milestone RF5-3);
   - M1/L8; L2/L3;
   - the A round-11 follow-ups (milestone fix round);
   - the 21 regression-debt IDs (milestone);
   - the Tech Lead manual checks, including R11-P3m, R11-SB, R13-RM, R15-SB, R17-T and the new R18-W.

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-17-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx
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
- Run `biome check --write` only on the **named files** you own this round. Never point it at a directory and never at `Header.tsx`.
- Run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files; then re-run the hash check.
- Never run `npm run format`.

**Dev server and browser:**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`.
- Use real `$B press` for keys; synthetic pointers need `buttons: 1`.
- Media: `../tmp/studio-real-loop/media/`.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review:**
- Invoke the actual `code-reviewer` subagent on the full diff of every file you touch.
- Fix its findings, then re-run it on the fix delta.
- Quote both summaries.

The `design-philosopher` is optional, for the labels and the overlay alpha. If you invoke it, report any conflict to B; do not apply it.

## 8. Report `../tmp/studio-real-loop/a-round-18.md`

1. The pre-flight gate, including the §1.4 measurements, the chosen width and the prices.
2. The design of each fix and why it is the smallest.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..17 file was reverted;
   - `frozen-start.txt` matches `b-round-17-tree-sha256.txt`;
   - `Header.tsx` is byte-identical to HEAD;
   - the R9-D3 hunks are unchanged, and `render-budget.test.tsx`, `detail-panel.test.tsx`, `StudioWorkspace.tsx` and `ArrangementClip.tsx` are unchanged;
   - instrumentation is gone.
4. Verbatim command tails.
5. Your R18-W/B/D/A runs (A's evidence, not a verdict), with numbers and these shots:
   - `detail-overlay-1440.png`;
   - `detail-labels-1440-288.png`;
   - `detail-labels-1280-480.png`.
6. New tests, each with its reason, plus the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with its reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **The milestone full regression** (SRW-11B and polish done, apart from the Tech Lead items). It covers:
  - the 21 regression-debt IDs;
  - C-R12-01 under RF5-3;
  - SRW-11B end to end;
  - one quick per FB that is ready.

  B splits it into bounded C-only rounds if it exceeds one run budget.
- **Then the milestone fix round:** any regression found, plus A's round-11 follow-ups:
  - Home on separators;
  - `aria-controls` on the fold button;
  - `ring-inset` on the track name;
  - the `nextElementSibling` lookup.
- **Then** SRW-13 (FB-04/05/14, including the export hard-clip, and M1/L8 if the Tech Lead run has not happened), and onward in dependency order (14/15 → 16 → 17 → 18 → 19 → 20).
- **Then** the SRW-21 adapter contract, then T12.
