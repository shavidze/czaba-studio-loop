# CURRENT TASK — Round 35: C bug first — a press on a fader first releases a focused text field (C-R34-01, C-R34-02)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision record: **D-29z** in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-34.md`.
- Round size: **one Medium bug plus one doc-only Low** (workflow rule "one feature or at most three related bugs"). No feature work this round.

> **Environment prerequisite (root, not BLOCKED):** the dev server `http://127.0.0.1:5173/studio-lab` answered **200** during C round 34 (15:49–16:20 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** B counted **7 → 7** `node.exe` during its gate run. Every A and C run records the count (`tasklist | grep -ci node.exe`).
>
> **Root, before A starts (strongly recommended):** rounds 31–34 are the same 9 status lines, all C-verified, and this round touches the same 3 files for the fourth round in a row. Commit them **before A starts** or **after C passes round 35**, never in the middle of the round.

## Why this round

C round 34 (`c-round-34.md`, `c-round-34.json`) is a **PASS** on every ID: G34-1..3, R34-TS, R34-CG, R34-SB, R34-R33, R34-K, R34-S, R34-U (mutations a–g killed) and R34-Doc.

B re-ran the gates independently (`b-round-34/gates.txt`):
- HEAD `1cefea1`, the same 9 status lines, 376 OK, protected 4/4;
- tsc 0, vitest 69 files / **1247/1247**, build ✓;
- Biome: 2 baseline CRLF errors + 218 warnings + 1 info.

FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD and A-R33-REVIEW-SCROLLBAR are closed. The real-scrollbar check stays with the Tech Lead (R34-T).

C confirmed one new bug in a browser, outside the round-34 contract:

**C-R34-01 (Medium; = A-R34-REVIEW-1, now browser-confirmed):**
- **Steps (real clicks):** select the SFX clip, click Clip Gain, Ctrl+A, type `3` (no Enter), then click the music track **Volume** slider. The same happens with **Master Volume** in the header.
- **Result:**
  - the typed `3` is **lost**: SFX keeps no `gainDb` and the field shows `0.0`;
  - the status reads „რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.“;
  - the fader jumps to the click point with +1 `Volume` / `Master Volume` entry.
- **Cause (A's reviewer and B, source reading):**
  1. The range's own `onPointerDown` calls `beginTrackVolumeGesture` / `beginTrackPanGesture` / `beginMasterGainGesture`, which claim the pointer gesture.
  2. Only after that does the browser's default action move focus to the range.
  3. Clip Gain's `onBlur` then runs `commitClipGain('blur')`. That function sees `isPointerGestureActive()`, sets `GESTURE_EDIT_BLOCKED_MESSAGE` and restores the old text (`ArrangementDetailPanel.tsx` ~l.325–354).
  4. The round-34 scroller capture handler skips range targets by contract (round-34 §0 row 3). Master sits in the header, outside the scroller, so the scroller handler never sees it anyway.
- **This breaks D-29u ("blur commits")** for a range target. A status is shown, so the loss is not silent, but the typed value is still gone.
- **Evidence:** `c-round-34/runs/rec-a-r34-review-1.txt`; `a-round-34.md` §4 R1.

**Why only native ranges lose the value (A verifies this list in §1.4):**
- Every other pointer-gesture owner calls `preventDefault()` in its `pointerdown`, so focus stays in the text field and the typed value is kept for a later Enter or blur. These are: Overview (`ArrangementOverview.tsx` l.169/177), the VideoDock drag (l.760/764), the detail divider (`ArrangementDetailPanel.tsx` l.680/690), the lane height handle (`ArrangementLane.tsx` l.414/421), clips, and the loop brace.
- Inside the scroller, round 34 already blurs before those claim.
- A native range cannot `preventDefault()` its pointerdown without losing its native drag. It is the only path where focus moves **after** a gesture has been claimed.

**C-R34-02 (Low, doc):** doc 036 l.355 says "headless-ში scrollbar 0 px-ია". In fact, headless reserves a **10 px vertical gutter** (`scrollbar-gutter: stable`, `offsetWidth − clientWidth = 10`). Only the horizontal scrollbar is 0 px. The scrollbars are hidden, so hit-testing in the gutter reaches the content children. B has already corrected the same wording in its own files.

**References:**
- Backlog v36: `backlog.json` (`open_findings` C-R34-01, C-R34-02, A-R34-REVIEW-RESIDUALS; `rounds` 35; SRW-13 `decisions_round35`).
- Progress board: `feature-status.md`.
- C's material (read-only for A): `c-round-34/runs/rec-a-r34-review-1.txt`, `sb-geometry.txt`, `c-round-34/scripts/`.
- A's round-34 report: `a-round-34.md` (§4 review findings, §6 deviations).
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Previous round:** archived as `tasks/round-34.md` (`cmp`-identical to the dispatched round-34 task).

## Baseline

B verified on 2026-10-13 (16:23–16:25, `b-round-34/gates.txt`):
- HEAD is **`1cefea1`**.
- `git status --short` = **9** lines (saved in `../tmp/studio-real-loop/b-round-34-git-status.txt`):
  ```
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M app/contexts/ArrangementContext.tsx
   M app/lib/arrangement/graph.client.ts
   M app/lib/arrangement/model.ts
   M app/types/arrangement.ts
  ?? app/lib/arrangement/__tests__/fader-guards.test.tsx
  ?? app/lib/arrangement/__tests__/track-pan.test.tsx
  ?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ```
- `sha256sum -c ../tmp/studio-real-loop/b-round-34-tree-sha256.txt` → **376 OK**.
  - It is round 33's list unchanged; the same 3 files are owned again.
  - It covers every tracked or untracked file under `app/` and `docs/implementation/` **except your 3 files** below.
  - `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx` and `clip-gain.test.tsx` are in it, so they are frozen.
- Protected 4/4 OK; tsc 0; build ✓; vitest **69 files, 1247/1247**.
- Biome `./app`: **2 errors** + 218 warnings + 1 info.
  - Both errors are `format` errors (CRLF) on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. They belong to root.
  - **Do not touch those files.** Your files must add 0 errors.
- Dispatch snapshots of your 3 files are in `../tmp/studio-real-loop/b-round-34-snapshots/`. They are identical to the files C verified in round 34.

  | File | sha256 (first 8) |
  |---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `b64a2cf6` |
  | `app/lib/arrangement/__tests__/fader-guards.test.tsx` | `11a19bf6` |
  | `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | `e86072b8` |

- If root commits before you start:
  - record the new HEAD;
  - check that `b-round-34-tree-sha256.txt` is still 376 OK. If root normalises the CRLF auth files, those lines may change; report that, and do not treat it as yours;
  - check that none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules for the baseline:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's.
- Nobody but root commits or pushes.

## 0. Scope

**The contract after this round.** It amends round 34's §0 row 3 ("range target → no blur by the new code"). Rows not listed are unchanged.

| Action | Result |
|---|---|
| A **text-entry field** is focused (`isTypingTarget`: Clip Gain, library search, detail start/end, any text/number input, textarea, select, contentEditable), and a `pointerdown` lands on a **native range input anywhere in the workspace** (track Volume, track Pan, video Volume, Master Volume, Zoom), and no pointer gesture is active | The text field is **blurred before the range's own `onPointerDown` runs** (capture phase on the workspace root). Clip Gain's existing `onBlur` commits the typed value with no gesture active. The range then claims its gesture as today. |
| The same, but a pointer gesture is already active (`isPointerGestureActive()`) | **No blur** by the new code. The existing gesture-blocked behaviour is unchanged. |
| A **native range** is focused (not a text field), and a `pointerdown` lands on another range | **Unchanged.** The new code does nothing. Focused ranges belong to stage 4b (A-R32-REVIEW-1, no-jump click). |
| A text field is focused, and a `pointerdown` lands on a **non-range** element outside the scroller (library item, detail background, header, transport button, overview) | **Unchanged** (D-29y decision 4). |
| Everything inside the scroller that round 34 handles (non-range targets, gutter, empty area, active gesture) | **Unchanged.** The round-34 handler stays byte-identical. |
| Clip Gain typed `3` (no Enter), then a press on music Volume | Chronological history tail **`[Clip Gain, Volume]`**: two entries. SFX `gainDb 3`. No gesture-blocked status from the Clip Gain commit. The fader still jumps to the click point (native; the no-jump click is 4b). Two Undos restore both: Volume first, then Clip Gain. |
| The same with music Pan / Master Volume / video Volume | Tail `[Clip Gain, Pan — მუსიკა]` / `[Clip Gain, Master Volume]` / `[Clip Gain, <video Volume label>]`. |
| Clip Gain typed `3`, then a press on **Zoom** | +1 `Clip Gain`. Zoom claims no gesture, so this already committed before; it is a regression row. Zoom writes no history entry. |
| Clip Gain unchanged text / invalid text, then a press on a range | Exactly what a plain blur of the same text gives: 0 `Clip Gain` entries, plus the existing invalid status for invalid text. |
| Detail start/end typed (no Enter), then a press on a range | Focus leaves the field. The range text is **not** applied (unchanged contract: Enter or Apply). |
| Library search `ab`, then a press on a range | Focus leaves the search (the browser did this before too); the search text and filter are unchanged. |

**Decisions (B, D-29z), with the reasons:**
1. **A separate root-level capture handler, not a change to round 34's handler.**
   - Master is outside the scroller, so a scroller-only fix (A's reviewer suggested `!(isRangeInputTarget(focused) && isRangeInputTarget(event.target))` in the scroller handler) would leave Master broken.
   - A separate handler on the workspace root keeps round 34's verified handler byte-identical. It also gives C one clean mutation (remove the new handler).
   - In capture order the root runs first. If it blurs, `activeElement` becomes `document.body`, and the scroller handler then does nothing: `body` is neither a typing target nor a range.
2. **Only text fields, only range targets.**
   - This is the smallest change that closes the only loss path.
   - Widening to focused ranges would change round-32/33 fader behaviour that 4b is about to rework.
   - Widening to non-range targets outside the scroller would change D-29y decision 4.
3. **Commit, not discard** (D-29u, as in round 34). `ArrangementDetailPanel.tsx` stays frozen: no new commit path, no change to the gesture-blocked refusal.
4. **The fader jump stays.** The value jumping to the click point is native range behaviour and belongs to 4b ("no jump on click"). This round only guarantees that the typed Clip Gain is not lost. **4b must keep this root capture working.** If 4b adds `preventDefault` to range pointerdowns, this handler becomes the only way a text field is released before a range gesture.
5. **No status, no focus move, no `preventDefault`.** The browser moves focus to the range, exactly as today.

**In (A):** §2.1 (the root handler), §2.2 (doc 036), §2.3 (tests appended to `fader-guards.test.tsx`, red-first).

**In (C):** §4.

**Not in this round** (each one is queued, not deferred scope):
- **stage 4b (round 36):**
  - the no-jump fader click;
  - double-click reset (Live §18.1);
  - FADER-KEY-ENTRIES;
  - A-R29-REVIEW-1;
  - the pending-commit order;
  - MASTER-HOLD-TICK-EDGE;
  - A-R31-REVIEW-2;
  - A-R32-REVIEW-1;
  - A-R33-REVIEW-TOUCH (widened to text fields in round 34);
  - the stale refusal status;
  - the A-R34-REVIEW-RESIDUALS that touch the gesture machine (right-button press);
- **stage 4c + polish (round 37):** round-9 M1/L8, C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE;
- any change to focused-range behaviour, to outside-scroller non-range pointerdowns, to `role="slider"` handling, or to `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx` or `ArrangementTransport.tsx`.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- round 34's rows (R34-CG on clip targets, R34-TS search → clip, R34-SB empty area);
- round 33's fader rows (R33-FT subset, R33-G gesture exclusion, round-32 must-not);
- Clip Gain Enter commit, Escape revert and the 0 dB reset;
- the fader gestures themselves: Volume, Pan and Master drags still write one entry each;
- Zoom slider behaviour;
- live audio during a Clip Gain commit (the scheduler path is unchanged).

## 1. Mandatory before acting (A)

1. **Read the rules and primitives** in full, **before** the first edit:
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, then run the `pre-flight` skill.
2. **Check the baseline** and report it before any edit:
   - `git rev-parse HEAD`;
   - `git status --short` (the 9 lines above, or the post-commit equivalent);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-34-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - your 3 files against the snapshot shas;
   - protected 4/4;
   - the `node.exe` count.
3. **Read:**
   - `StudioWorkspace.tsx`:
     - the predicates (l.206–246, including `isScrollerGutterPointer`);
     - `releaseEditFocusOnTimelinePointerDown` (~l.895–910);
     - the root `studio-container` div (~l.1316);
     - the `<ArrangementMaster />` use (~l.1334) and `<ArrangementTransport>` (~l.1340);
     - the scroller JSX (~l.1379);
   - read-only:
     - `ArrangementDetailPanel.tsx` `commitClipGain` (~l.325–354);
     - `ArrangementMaster.tsx` (the range, ~l.146–170);
     - `ArrangementLane.tsx` (the Pan range ~l.580–596 and the Volume range ~l.624–640);
     - `ArrangementTransport.tsx` (Zoom, ~l.187–200);
     - `ArrangementContext.tsx` `claimPointerGesture` (~l.1329), `beginMasterGainGesture` (~l.2358), `beginTrackPanGesture` (~l.2227) and the track-volume gesture begin;
   - your own `fader-guards.test.tsx` harness (round 33/34 helpers: `typeClipGain`, `sfxGainDb`, `textField`, `pressOnActive`).
4. **Grep yourself and report:**
   - **the root div has no existing `onPointerDownCapture`/`onPointerDown`** that you would have to merge with. If it has one, stop and report;
   - **every `claimPointerGesture(` call site and every range `beginXxxGesture` site**, and whether its `pointerdown` calls `preventDefault()`. B's list: Overview, VideoDock, the detail divider, the lane height handle, clip, loop brace → preventDefault; track Volume, Pan, Master → native range, no preventDefault. If you find a **non-range** gesture owner without `preventDefault` (a second loss path), **stop and report**. Do not widen the fix yourself;
   - every native `type="range"` in the workspace (B found: Lane Pan, Lane Volume, Master, Transport Zoom);
   - every existing test that expects a typed Clip Gain to be refused, or a text field to keep focus, when a range is pressed. **If a frozen test expects that, stop and report** (a contract conflict for B);
   - whether the `fader-guards.test.tsx` fixture renders Master, the music Pan/Volume, the video Volume and Zoom. Report which ones; a missing one is covered by C only.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 The root handler (`StudioWorkspace.tsx`)

Add **one** `useCallback` handler, for example `releaseTypingFocusBeforeRangePointerDown`, and attach it as `onPointerDownCapture` on the root `studio-container` div.

- **Condition:** blur `document.activeElement` when **all** of these hold:
  - it is an `HTMLElement` and `isTypingTarget(focused)`;
  - `isRangeInputTarget(event.target)`;
  - `!workspaceRef.current.isPointerGestureActive()`.
- **Nothing else:** no `preventDefault`, no `stopPropagation`, no status, no focus moved to another element, no `event.button` filter. A right press on a range does not claim a gesture, so a blur there equals today's native blur.
- **Do not change:**
  - `releaseEditFocusOnTimelinePointerDown`, `isScrollerGutterPointer`, `isTypingTarget`, `isSliderTarget` or `isRangeInputTarget`;
  - the keydown handler, the round-32 guard, `handleLaneBackgroundPointerDown`;
  - any other branch or JSX attribute.

### 2.2 Doc 036 (`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`)

1. **Correction (C-R34-02), one line in place.** In the round-34 section (l.355), replace only the parenthesis `(headless-ში scrollbar 0 px-ია, round 11 R11-SB)` with an accurate one, for example `(headless 10 px-იან ვერტიკალურ gutter-ს იტოვებს, მაგრამ scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს; ჰორიზონტალური scrollbar 0 px-ია — C round 34)`. No other change to earlier sections.
2. **Append** one section in Georgian, with technical terms in English (for example `## Round 35 — range-ზე დაჭერამდე ტექსტური ველი თავისუფლდება`). Cover:
   - C-R34-01: the steps, the cause (claim on pointerdown → native focus move → `commitClipGain` gesture refusal), and why it affects only native ranges (the §1.4 preventDefault list);
   - the rule: the three conditions, the capture order with round 34's handler, and that focused ranges and outside-scroller non-range targets are unchanged;
   - decisions 1–5, including the 4b note (this capture must survive a no-jump rework);
   - that the doc's round-34 statement "A-R34-REVIEW-1 ბრაუზერში არ შემოწმებულა" (l.360) is superseded: C confirmed it as C-R34-01. Say this in the new section; do not rewrite l.360;
   - the new tests and the C verification IDs;
   - the Ableton note of §4.6.
3. Update the doc's header status line (l.4).

### 2.3 Tests (written first; red on the snapshot sources)

**Order:**
1. Append the tests against the **unchanged** `StudioWorkspace.tsx` (verify sha `b64a2cf6` immediately before the red run).
2. Run them and paste which fail and why.
3. Implement, then re-run.

**File:** `app/lib/arrangement/__tests__/fader-guards.test.tsx`, **append only**.
- Add one new `describe` inside the outer one, for example `'a range pointerdown first releases a focused text field (C-R34-01; D-29z)'`.
- You may add small local helpers.
- **All 54 existing tests (the vitest count; some `it` blocks are generated in loops) and the helpers they use stay byte-identical.** A helper may only gain an optional parameter; report it.
- **No other test file changes.**

jsdom does not move focus on pointerdown, so the tests assert the explicit blur and the history written **at the range `pointerDown`**, before any `change`/`pointerUp`.

At least **10** new `it` blocks, through the real `StudioWorkspace` and provider, on the existing fixture (video + music + SFX, SFX clip selected):

1. **Clip Gain → music Volume:**
   - typed `3` (no Enter), then `pointerDown` (button 0, buttons 1) on the music Volume range;
   - right after the `pointerDown`: one new `Clip Gain` entry, SFX `gainDb` 3, `activeElement` is not the Clip Gain input, and the status is not `GESTURE_EDIT_BLOCKED_MESSAGE`;
   - then `change` + `pointerUp` on the range: newest-first labels `[Volume…, Clip Gain]`;
   - two Undos restore Volume, then SFX gain to no `gainDb`.
2. **Clip Gain → music Pan:** the same; the Pan entry follows `Clip Gain`.
3. **Clip Gain → Master Volume** (outside the scroller): the same; tail `[Clip Gain, Master Volume]`.
4. **Clip Gain → video Volume**, if the fixture renders it (otherwise report it, and C covers it).
5. **Clip Gain → Zoom (regression):** +1 `Clip Gain`; no gesture-blocked status.
6. **Unchanged text → music Volume:** 0 `Clip Gain` entries.
7. **Invalid/empty text → Master:** exactly the history and status a plain `fireEvent.blur` of the same text gives (a control mount, as round-34 case 8). 0 `Clip Gain` entries.
8. **Detail start typed → Master:** focus released, no entry from the field, range not applied.
9. **Search `ab` → Master:** focus released, search value `ab`, item count unchanged.
10. **Must-not, gesture active:**
    - start a gesture with an outside-scroller owner that calls `preventDefault` (the overview drag or the detail divider; pick a reachable one and report it), so the Clip Gain input keeps focus;
    - with Clip Gain typed `3`, `pointerDown` with a second pointer id on Master;
    - the new handler does **not** blur, and no `Clip Gain` entry is written at that pointerdown.
    - If no such owner is reachable in jsdom, **report it** (do not fake it). C covers this row synthetically.
11. **Decision-4 guard:** search focused, `pointerDown` on a library item (outside the scroller, non-range) → the new handler does **not** blur. Assert the focused element is unchanged, since jsdom does not move focus. If the library item moves focus itself in jsdom, use the detail panel background or a header element instead, and report it.
12. **Must-not, focused range:** music Volume focused (with `focus()`), `pointerDown` on Master → the new handler does not blur Volume (assert `activeElement` is still Volume right after the `pointerDown`, since jsdom does not move focus).

### 2.4 After the code

- **Self-check** (report each one):
  - round 34's 17 tests and round 33's 18 tests are green and unchanged;
  - the frozen `clip-gain.test.tsx` and `master-ui.test.tsx` are green;
  - a Volume drag without any text field focused still writes exactly one entry.
- **Biome:** run `npx biome check --write` **only** on your own files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (3 files changed). Report its findings and your dispositions.
- **Mutation checks:** only in a scratch copy outside `store/`. Never mutate in place.
- **Commands:** run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `1cefea1` plus the 9 lines, or root's newer commit that contains rounds 31–34.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.1 only: one new `useCallback` handler + one `onPointerDownCapture` attribute on the root div |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | §2.3 only: append one `describe`; the 54 existing tests stay byte-identical |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | §2.2 only: the l.355 parenthesis, the header status line, and an append |
| `../tmp/studio-real-loop/a-round-35.md`, `a-round-35/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-35.md`, `c-round-35.json`, `c-round-35/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end:**
- if root has **not** committed: exactly the same **9** lines as the baseline;
- if root **has** committed all 9 files of rounds 31–34: exactly **3** lines:
  ```
   M app/components/arrangement/StudioWorkspace.tsx
   M app/lib/arrangement/__tests__/fader-guards.test.tsx
   M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ```
- any other root commit: record it, and check every line against this section.

### 3.3 Frozen this round

**Frozen:**
- all **376** files in `b-round-34-tree-sha256.txt`, and everything else under `store/`;
- that includes `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementClip.tsx`, `ArrangementOverview.tsx`, `ArrangementVideoDock.tsx`, `ArrangementContext.tsx`, `studio-scrollbar.ts`, `clip-gain.test.tsx` and `master-ui.test.tsx`;
- docs 001–035;
- **every existing test** (the 54 existing tests of `fader-guards.test.tsx` included).

**Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` and `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.github/**`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs and `../backend/**`;
- env/config files, the sitemap and `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting earlier work;
- in-place mutation of `store/` files;
- killing processes you did not start;
- starting or stopping the dev server;
- `npm run format`.

## 4. Acceptance (C)

**Viewport:** 1440×900, with the detail panel expanded (a real click on `arrangement-detail-toggle`), plus one 1280×720 spot check in R35-CR.

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press`/`$B type`.
- Range drags, blur, pointercancel, second-pointer events and any pointerdown at computed coordinates are synthetic; label them.
- C may hook browser APIs (`AudioParam.prototype.setTargetAtTime`, `AudioBufferSourceNode.prototype.start`), labelled as such. No source instrumentation.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every gate records the `node.exe` count.**

**Layout L35** = L34: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4.

Before and after every step, record:
- the clip table `[id, track, start, duration, gainDb]`;
- `history.past.length` and the tail;
- the Clip Gain field text;
- the status line;
- the fader values (music Volume, music Pan, Master);
- **`document.activeElement`** (aria-label or tag).

**Checkpoint order if the session may end:** G35 → R35-CR → R35-OT → R35-R34 → R35-CL → the rest. Write `c-round-35/checkpoint.md` as you go.

### 4.1 R35-CR — Clip Gain typed, then a real click on a range (C-R34-01)

Start each case:
1. a real click on the SFX header;
2. a real click into Clip Gain;
3. Ctrl+A;
4. real typing of `3` **without Enter**.

Then make a real click on the target.

| Target | Expected |
|---|---|
| music Volume | SFX `gainDb 3` (the field shows `3.0` when SFX is reselected); tail `[…, Clip Gain, Volume…]`; no gesture-blocked status from the commit; `activeElement` = the Volume range; the fader at the click point (record it) |
| music Pan | the same, with the Pan entry |
| Master Volume (header) | the same, with `Master Volume` |
| video Volume | the same, with the video Volume entry |
| Zoom (regression) | +1 `Clip Gain` only (Zoom writes no entry); no blocked status |

- After the music Volume case: **two Ctrl+Z** → Volume back to its value before the click, then SFX back to no `gainDb` (field `0.0`).
- **1280×720 spot check:** Clip Gain `3` → a real click on Master → SFX `+3.0`, tail `[Clip Gain, Master Volume]`.
- **PASS** = every row as stated.
- **FAIL** = any case where the typed `3` is lost, or the blocked status appears from the Clip Gain commit.

### 4.2 R35-OT — the other rows (one run each)

| Case | Expected |
|---|---|
| Clip Gain = current value (`0.0`), real click on music Volume | 0 `Clip Gain` entries; Volume entry as usual |
| an invalid text the field accepts (C picks and records it; round 34 used `-` and `1e`), real click on Master, vs a real **Tab** control from the same text | the same status and 0 `Clip Gain` entries in both |
| detail start typed (no Enter), real click on Master | focus on Master; range not applied; 0 entries from the field |
| search `ab`, real click on Master | focus on Master; search `ab`, item count unchanged |
| **gesture active (synthetic, labelled):** Clip Gain `3` focused; start a gesture with an outside-scroller owner that calls `preventDefault` (the overview drag or the detail divider; C picks and records it; `pointerdown` id 41), then `pointerdown` id 42 on Master | the new handler does not blur at id 42 (`activeElement` still Clip Gain right after the id-42 dispatch); no `Clip Gain` entry at id 42. Record what happens at the end of gesture 41 |
| **focused range (must-not):** music Volume focused with `focus()` (no click), a real click on Master | record `activeElement` and history; must equal the round-34 baseline behaviour (the new code does nothing) |
| **decision 4:** search focused, a real click on a library item | `activeElement` and what Delete does equal `c-round-34` `rec-outside` (REC-OUT-1) |

### 4.3 R35-CL — live audio (one layout; budget 3 valid runs, at most 2 replacements)

- Hooks: `AudioParam.prototype.setTargetAtTime` and `AudioBufferSourceNode.prototype.start` (labelled).
- Set a loop with a range on the **video lane** (3.5–6.0, then Ctrl+L), as in round 34 CG-6. A range on the SFX lane is refused because it must lie inside a clip.
- Start playback with Space while the body has focus.
- Then: a real click on the SFX header, a real click into Clip Gain, type `3`, and a real click on the **music Volume**. **Record the playhead at the click.**
- **Oracle (reworded from round 34):** at the click, **one clip-gain `setTargetAtTime(≈1.4125, τ 0.015)` per live or scheduled SFX source node** (2 inside the window `[4, 6)` when the next iteration is already scheduled, 1 outside), **0 restarts** (no `start` with `when` ≈ the click time), +1 `Clip Gain`. Every SFX source started afterwards has gain ≈1.4125.
- The music Volume change also re-targets the line gain; record it separately. It is not a clip-gain node.
- A run where playback was not running at the click is a replaceable invalid attempt. Report every attempt.

### 4.4 R35-R34 — short regression

- **R34-CG CG-1:** Clip Gain `3` → a real click on the music **header** → +1 `Clip Gain`, music selected, focus BODY.
- **R34-TS:** search `ab` → a real click on the SFX header → Backspace deletes the clip; the search stays `ab`.
- **R34-SB:** the empty area. Fold the lanes and make a real click on the scroller with the search focused → BODY → Delete deletes. Unfold afterwards.
- **R33-FT:** music Volume → SFX header → Delete deletes (+1).
- **R33-G** (synthetic, Pan id 41 + header id 42, playing): Pan keeps focus; 0 revert calls at id 42; +1 `Pan — მუსიკა` at `pointerup` 41.
- **Round-32 must-not:** music Volume focused with `focus()`, no click → Delete and Backspace → nothing changes.

### 4.5 R35-K — adjacent behaviour (one run each)

- With no text field focused: a music Volume drag (synthetic), a Pan drag and a Master drag each write exactly one entry. Their status and readout match round 31/33.
- Clip Gain: Enter commits once (+1); Escape reverts (0 entries); the `0 dB` reset (+1).
- Zoom slider: a real click changes zoom; no history entry.
- Master Mute toggles; music Mute/Solo toggle (the root capture ignores buttons).

### 4.6 R35-S, R35-U, R35-Doc, Ableton

**R35-S** (static, read-only): `diff -u` of `b-round-34-snapshots/` against the live files.
- `StudioWorkspace.tsx`: only the new handler and its one JSX attribute on the root div. `releaseEditFocusOnTimelinePointerDown`, `isScrollerGutterPointer`, the predicates, the keydown handler, the round-32 guard and every other branch are byte-identical.
- `fader-guards.test.tsx`: only appended lines. The 54 existing tests are byte-identical.
- Doc 036: the header line, the l.355 parenthesis, and an append.
- The other frozen files: 376 OK.
- No hardcoded colour, no `any`/`@ts-ignore`, and no new `// comment`.

**R35-U:**
- The §2.3 cases exist and are green.
- A's red-first output: jsdom never moves focus on pointerdown, so on the snapshot no text field blurs at all. Expected **red** on the snapshot: cases 1, 2, 3, 4 (if rendered), 5 (Zoom is a regression only in a real browser), 7 (the status differs from the plain-blur control, as round-34 case 8), 8 and 9. Expected **green**: 6, 10 (snapshot-dependent label), 11 and 12. A labels each one.
- C runs these mutations in a scratch copy outside `store/`. Each must make a test fail. Report how each was done:
  - (a) the new handler removed (or its JSX attribute removed) → cases 1–3 fail;
  - (b) its gesture condition removed → case 10 fails (if A built it; otherwise record "not killable in unit tests" and rely on R35-OT);
  - (c) the handler moved to the scroller (`onPointerDownCapture` on the scroller instead of the root) → case 3 (Master) fails;
  - (d) `isRangeInputTarget(event.target)` dropped → case 11 fails;
  - (e) `isTypingTarget(focused)` replaced by `isTypingTarget(focused) || isRangeInputTarget(focused)` → case 12 fails;
  - (f) in `ArrangementDetailPanel.tsx` (scratch only), `commitClipGain('blur')` made a no-op → cases 1–3 fail. This proves the oracle depends on the existing blur commit.
- Round 34's mutation set is not re-run.

**R35-Doc:** doc 036's new section covers §2.2 and matches the code; the l.355 correction is accurate against C's round-34 geometry.

**Ableton source and compliance (workflow addendum 2026-10-11).** This is a bug round.
- **Source:** the Ableton Live 12 Reference Manual §18.1 "The Live Mixer", captured as `b-round-29/ableton-mixing-20261012.txt` (gstack `/browse`, 2026-10-12).
- It describes the mixer controls and the double-click reset. It says nothing about when a typed value in a value box is committed, or about what happens to it when the user grabs a fader.
- No video is used. B did not browse a new source; no Ableton claim is made.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A typed, uncommitted value box value is committed when the user presses a fader elsewhere | none captured | **Unconfirmed** | CZABA requirement: the round-30 contract (commit on blur, D-29u) | R35-CR, R35-CL |
| A fader press jumps the value to the click point | §18.1 does not describe it | **Unconfirmed** | Native range behaviour today; no-jump is stage 4b | — (not this round) |
| Pan/Volume reset by double-click | §18.1 | **Confirmed** | Still stage 4b (round 36) | — (not this round) |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.7 Gates

**G35-1:**
- tsc 0;
- vitest = **1247** + A's new tests (≥ 10 new `it`), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome `./app` (read-only): exactly the 2 baseline CRLF errors, 0 errors in Studio files, and warnings ≤ 218 + 1 info;
- these frozen tests are green: `clip-gain.test.tsx`, `detail-panel.test.tsx`, `detail-panel-polish.test.tsx`, `track-pan.test.tsx`, `master-ui.test.tsx`, `gesture-guard.test.tsx`, `delete-selection-ui.test.tsx`, `track-layout.test.tsx`, `ArrangementContext.test.ts`, `render-budget.test.tsx`, `floating-video.test.tsx`.

**G35-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-34-tree-sha256.txt` → 376 OK (or the documented CRLF exception);
- `git status --short` = §3.2 (9 or 3 lines);
- HEAD recorded at start and end.

**G35-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (during R35-CR and a drag);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, the dev-module `GET /app/lib/r2.config.ts`, and the homepage hero image from `images.unsplash.com` before header navigation.

**Not re-run this round:** the exports, the audio graph checks (R31-PE/PV/PL), the PUI geometry, R32-BC, the video sync checks and the C-R27-01 table. Nothing in the audio graph, the export, the scheduler, the video, the layout or the lane changes; R35-S proves this. These are not PASS for this round. The full find sound → add → fit video → export flow and FB-01..FB-16 stay for the stage regression.

### 4.8 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01, C-R6-02 and C-R8-01 (all Tech Lead);
- C-R23-01 (Tech Lead). Record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab`; round 34: 2 at 28013/28014, 63 520 bytes;
- C-R30-01 (polish).

**Open low items:**
- R26-M1;
- stage 4b: MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH;
- R9-REVIEWER-M1-L8 (4c);
- A-R34-REVIEW-RESIDUALS (RTL gutter, overlay scrollbars, right-button press commits);
- DEMO-SFX-FULL-SCALE; L3; LIB-SEP-REASON; R27-T; DOC034-UNREACHABLE-NOTE; DOC035-NOTES.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `b-round-34.md` §7):
- **rounds 31–34 (all 9 status lines) are C-verified and ready for root's checkpoint commit**; root runs its own gates and review first, and commits before A starts round 35 or after C passes it;
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the CRLF Biome errors on the merged auth files;
- the tracked `frontend-architect.md` grants Write/Bash;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the fake Bearer gets 500 without a token;
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability.

**Tech Lead manual checks:**
- the `feature-status.md` §5 list, including R30-T, R31-T, R33-T and R34-T (now with a Firefox overlay-scrollbar variant of (3));
- **R35-T (new):** with a real mouse in real Chrome: type a Clip Gain `3` without Enter, then click the music Volume, a Pan or Master → SFX keeps `+3.0 dB`, and the history shows `Clip Gain`, then the fader entry;
- TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
sha256sum -c ../tmp/studio-real-loop/b-round-34-tree-sha256.txt | grep -vc ': OK$'
npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
diff -u ../tmp/studio-real-loop/b-round-34-snapshots/StudioWorkspace.tsx app/components/arrangement/StudioWorkspace.tsx
diff -u ../tmp/studio-real-loop/b-round-34-snapshots/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
diff -u ../tmp/studio-real-loop/b-round-34-snapshots/036-studio-lab-track-pan.md docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If a test path above does not exist, report it and run the rest. Do not create test files.

If the server is up, A may do one browser smoke check (`a-browse.json`): select SFX, type a Clip Gain `3` without Enter, make a real click on the music Volume → SFX `+3.0 dB`, history `Clip Gain` then `Volume`. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G35-1/2, R35-S, R35-U, R35-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-35.md`:**
1. the pre-flight gate, including the §1.4 grep results (the preventDefault list in particular);
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations and the §2.4 self-check results.

Do not claim PASS.

**C → `c-round-35.md` and `c-round-35.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R35-CR and R35-OT tables with `activeElement`, the Clip Gain text, the status and the history tail;
- the R35-CL hook counts per attempt;
- the mutation table;
- the Ableton two-verdict table (§4.6);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 36 — SRW-13 stage 4b** (fader UX for Volume, Master and Pan). It must keep the round-35 root capture. It covers:
  - no jump to the click point;
  - double-click reset (Live §18.1);
  - per-key entry coalescing;
  - A-R29-REVIEW-1;
  - the pending-commit order;
  - MASTER-HOLD-TICK-EDGE;
  - A-R31-REVIEW-2;
  - A-R32-REVIEW-1;
  - A-R33-REVIEW-TOUCH;
  - the stale refusal status.

  4b may be split into two checkable stages if B judges it too large for one round. The full scope stays.
- **Round 37:** stage 4c (round-9 M1/L8), then polish (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE).
- **Then:**
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 35 -StartPhase A` and a higher limit.
