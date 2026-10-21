# CURRENT TASK — Round 36: re-dispatch of C-R34-01 + C-R34-02 with B's ruling (a press on a fader first releases a focused text field)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision records: **D-29z** (the contract, unchanged) and **D-29z1** (the ruling and clarifications) in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-35.md`.
- Round size: **one Medium bug plus one doc-only Low**, the same scope as round 35. No feature work this round.

> **Environment prerequisite (root, not BLOCKED):** the dev server `http://127.0.0.1:5173/studio-lab` answered **200** during C round 35 (16:45–17:00 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **7 → 7** during B's gate run. Every A and C run records the count (`tasklist | grep -ci node.exe`).
>
> **Root, before A starts (strongly recommended):** rounds 31–34 are the same 9 status lines, all C-verified, and this round touches the same 3 files for the fifth round in a row. Commit them **before A starts** or **after C passes round 36**, never in the middle of the round.

## Why this round

Round 35 did not land. A stopped at the §1.4 stop condition and changed nothing in `store/` (`a-round-35.md`). C reported **BLOCKED** (`c-round-35.md`, `c-round-35.json`):
- C confirmed the stop in its own scratch copy. With A's proposed handler, `app/lib/arrangement` gave **1 failed | 776 passed**. The only failure was the frozen `fader-guards.test.tsx:1265`: `expected <body> to be <input type="search">`.
- **C-R34-01 still reproduces** with real clicks on music Volume, music Pan, Master Volume and video Volume, and at 1280×720 on Master (`c-round-35/runs/cr-baseline-1440.txt`, `cr-baseline-1280.txt`). In each case the typed `3` is lost and the gesture-blocked status appears. Zoom commits the value.
- G35-2 and G35-3 **PASS**. C-R34-02 is still open, because doc 036 is unchanged.

B re-ran the gates on the unchanged tree (`b-round-35/gates.txt`, 16:57–16:58):
- HEAD `1cefea1`, the same 9 status lines, 376 OK;
- the owned files match the snapshots, and protected 4/4;
- tsc 0, vitest 69 files / **1247/1247**, build ✓;
- Biome: 2 baseline CRLF errors + 218 warnings + 1 info.

### The ruling (D-29z1): A's option 1, with exact bytes

The frozen test `'review: during an active Pan drag a clip header pointerdown keeps the search focus'` (`fader-guards.test.tsx` l.1258–1278) changes in **exactly three lines**:

| Line | Before | After |
|---|---|---|
| 1258 | `    it('review: during an active Pan drag a clip header pointerdown keeps the search focus', async () => {` | `    it('review: during an active Pan drag a clip header pointerdown edits nothing; the Pan press itself released the search (D-29z)', async () => {` |
| 1265 | `      expect(document.activeElement).toBe(search);` | `      expect(document.activeElement).not.toBe(search);` |
| 1272 | `      expect(document.activeElement).toBe(search);` | `      expect(document.activeElement).not.toBe(search);` |

Keep the indentation exactly as in the file. Every other line of that test stays, including `isPointerGestureActive()` true/false, the search value `ab` and the unchanged clip table.

**Why:**
- The assertion described a state that exists only in jsdom, where focus never moves on pointerdown.
- In a real browser, a real click on Pan or Master **already** moves focus off the search natively (C round 35, the last two blocks of `cr-baseline-1440.txt`: `activeElement` = `Pan — მუსიკა` / `Master Volume`, search `ab`). So the frozen line contradicted real behaviour, not the fix.
- The test keeps its value: during an active Pan gesture, a clip-header press edits nothing, and the search text stays `ab`.
- The intent "gesture active → the text field keeps focus" now belongs to new case 10, with a realistic owner that calls `preventDefault` (the detail separator).

**Option 2 is rejected.** Excluding the search field would contradict D-29z's own row "search `ab` → range → focus leaves the search", and today's real-browser behaviour.

### Clarifications from C round 35 §6 (also in D-29z1)

1. **The Pan centre row.** A real click at the Pan centre leaves the value at 0 → 0 and writes no Pan entry. In the browser, that row checks only the Clip Gain commit. The two-entry tail is proven by Volume, Master and video Volume. jsdom case 2 still fires `change`, so it keeps its Pan entry.
2. **The owner list (§1.4) gains the lane-background marquee** (`StudioWorkspace.tsx` ~l.917, `preventDefault` l.921). Round 34 blurs before it claims, so it is not a loss path.
3. **Mutation (c) is redefined** (§4.6). React allows one `onPointerDownCapture` per element, so the mutation composes the handlers on the scroller.
4. **A's case 6 is stricter than B predicted.** It also asserts the release, so it is red on the snapshot. That is accepted.

**References:**
- Backlog v37: `backlog.json` (`open_findings` C-R34-01, C-R34-02; `rounds` 35/36; SRW-13 `decisions_round36`).
- Progress board: `feature-status.md`.
- A's round-35 material (read it; it is the dispatched implementation):
  - `a-round-35.md`;
  - `a-round-35/proposed-StudioWorkspace.diff` (sha256 `3ec3dca1…`);
  - `a-round-35/new-describe.tsx.txt` (sha256 `ab95eb26…`, 12 `it`);
  - `a-round-35/red-run.txt`, `scratch-impl-run.txt`.
- C's material (read-only for A): `c-round-35/runs/cr-baseline-1440.txt`, `cr-baseline-1280.txt`, `scratch-impl-arrangement.txt`; `c-round-34/runs/rec-a-r34-review-1.txt`, `sb-geometry.txt`.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Previous round:** archived as `tasks/round-35.md` (`cmp`-identical to the dispatched round-35 task).

## Baseline

B verified on 2026-10-13 (16:57–16:58, `b-round-35/gates.txt`):
- HEAD is **`1cefea1`**.
- `git status --short` = **9** lines (saved in `../tmp/studio-real-loop/b-round-35-git-status.txt`):
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
- `sha256sum -c ../tmp/studio-real-loop/b-round-35-tree-sha256.txt` → **376 OK**.
  - It is round 34's list unchanged, and it excludes your 3 files.
  - `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx` and `clip-gain.test.tsx` are in it, so they are frozen.
- Protected 4/4 OK; tsc 0; build ✓; vitest **69 files, 1247/1247**.
- Biome `./app`: **2 errors** + 218 warnings + 1 info.
  - Both errors are `format` errors (CRLF) on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. They belong to root.
  - **Do not touch those files.** Your files must add 0 errors.
- Dispatch snapshots of your 3 files are in `../tmp/studio-real-loop/b-round-35-snapshots/`. They are byte-identical to round 34's snapshots and to the files C verified in round 34.

  | File | sha256 (first 8) |
  |---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `b64a2cf6` |
  | `app/lib/arrangement/__tests__/fader-guards.test.tsx` | `11a19bf6` |
  | `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | `e86072b8` |

- If root commits before you start:
  - record the new HEAD;
  - check that `b-round-35-tree-sha256.txt` is still 376 OK. If root normalises the CRLF auth files, those lines may change; report that, and do not treat it as yours;
  - check that none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules for the baseline:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's.
- Nobody but root commits or pushes.

## 0. Scope

**The contract (D-29z, unchanged; it amends round 34's §0 row 3).** Rows not listed are unchanged.

| Action | Result |
|---|---|
| A **text-entry field** is focused (`isTypingTarget`: Clip Gain, library search, detail start/end, any text/number input, textarea, select, contentEditable), a `pointerdown` lands on a **native range input anywhere in the workspace** (track Volume, track Pan, video Volume, Master Volume, Zoom), and no pointer gesture is active | The text field is **blurred before the range's own `onPointerDown` runs** (capture phase on the workspace root). Clip Gain's existing `onBlur` commits the typed value with no gesture active. The range then claims its gesture as today. |
| The same, but a pointer gesture is already active (`isPointerGestureActive()`) | **No blur** by the new code. The existing gesture-blocked behaviour is unchanged. |
| A **native range** is focused (not a text field), and a `pointerdown` lands on another range | **Unchanged.** The new code does nothing. Focused ranges belong to stage 4b (A-R32-REVIEW-1, no-jump click). |
| A text field is focused, and a `pointerdown` lands on a **non-range** element outside the scroller (library item, detail background, header, transport button, overview) | **Unchanged** (D-29y decision 4). |
| Everything inside the scroller that round 34 handles (non-range targets, gutter, empty area, active gesture) | **Unchanged.** The round-34 handler stays byte-identical. |
| Clip Gain typed `3` (no Enter), then a press on music Volume | Chronological history tail **`[Clip Gain, Volume]`**: two entries. SFX `gainDb 3`. No gesture-blocked status from the Clip Gain commit. The fader still jumps to the click point (native; the no-jump click is 4b). Two Undos restore both: Volume first, then Clip Gain. |
| The same with Master Volume / video Volume | Tail `[Clip Gain, Master Volume]` / `[Clip Gain, <video Volume label>]`. |
| The same with music Pan | SFX `gainDb 3`, +1 `Clip Gain`, no blocked status. A Pan entry follows **only if the press changes the Pan value**. A real centre click (0 → 0) writes no Pan entry (D-29z1). |
| Clip Gain typed `3`, then a press on **Zoom** | +1 `Clip Gain`. Zoom claims no gesture, so this already committed before; it is a regression row. Zoom writes no history entry. |
| Clip Gain unchanged text / invalid text, then a press on a range | Exactly what a plain blur of the same text gives: 0 `Clip Gain` entries, plus the existing invalid status for invalid text. |
| Detail start/end typed (no Enter), then a press on a range | Focus leaves the field. The range text is **not** applied (unchanged contract: Enter or Apply). |
| Library search `ab`, then a press on a range | Focus leaves the search (the real browser already does this natively, C round 35); the search text and filter are unchanged. |

**D-29z decisions (unchanged):**
1. **A separate root-level capture handler.** Round 34's scroller handler is not changed. Master is outside the scroller, so a scroller-only fix would leave it broken. In capture order the root runs first. If it blurs, `activeElement` becomes `document.body`, and the scroller handler then does nothing.
2. **Only text fields, only range targets.** Focused ranges are 4b territory. Outside-scroller non-range targets stay as D-29y decision 4.
3. **Commit, not discard** (D-29u). `ArrangementDetailPanel.tsx` stays frozen.
4. **The fader jump stays** (native; no-jump is 4b). **4b must keep this root capture working.** If 4b adds `preventDefault` to range pointerdowns, this handler becomes the only way a text field is released before a range gesture.
5. **No status, no focus move, no `preventDefault`.**

**D-29z1 (new this round):** the 3-line amendment of the frozen review test, as in the table above. Nothing else in any existing test changes.

**In (A):** §2.1 (the root handler), §2.2 (doc 036), §2.3 (the 3-line amendment plus the appended tests, red-first).

**In (C):** §4.

**Not in this round** (each one is queued, not deferred scope):
- **stage 4b (round 37):**
  - the no-jump fader click;
  - double-click reset (Live §18.1);
  - FADER-KEY-ENTRIES;
  - A-R29-REVIEW-1;
  - the pending-commit order;
  - MASTER-HOLD-TICK-EDGE;
  - A-R31-REVIEW-2;
  - A-R32-REVIEW-1;
  - A-R33-REVIEW-TOUCH;
  - the stale refusal status (C saw it again in round 35 after the Pan case);
  - the A-R34-REVIEW-RESIDUALS that touch the gesture machine;
- **stage 4c + polish (round 38):** round-9 M1/L8, C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE;
- any change to focused-range behaviour, to outside-scroller non-range pointerdowns, to `role="slider"` handling, or to `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx` or `ArrangementTransport.tsx`.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- round 34's rows (R34-CG on clip targets, R34-TS search → clip, R34-SB empty area);
- round 33's fader rows (R33-FT subset, R33-G gesture exclusion, round-32 must-not);
- Clip Gain Enter commit, Escape revert and the 0 dB reset;
- the fader gestures themselves: Volume, Pan and Master drags still write one entry each;
- Zoom slider behaviour;
- live audio during a Clip Gain commit (the scheduler path is unchanged);
- **the 32 test files outside `app/lib/arrangement`.** They have never run against the handler, because A's and C's scratch runs covered only `app/lib/arrangement`.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives** in full, **before** the first edit:
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, then run the `pre-flight` skill.
2. **Check the baseline** and report it before any edit:
   - `git rev-parse HEAD`;
   - `git status --short` (the 9 lines above, or the post-commit equivalent);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-35-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - your 3 files against the snapshot shas;
   - protected 4/4;
   - the `node.exe` count;
   - the shas of `a-round-35/proposed-StudioWorkspace.diff` (`3ec3dca1`) and `a-round-35/new-describe.tsx.txt` (`ab95eb26`). If either differs, **stop and report**.
3. **Read:**
   - `a-round-35.md` in full;
   - the proposed diff and the proposed describe;
   - in `StudioWorkspace.tsx`: the predicates (l.206–246), `releaseEditFocusOnTimelinePointerDown` (~l.895–910), `handleLaneBackgroundPointerDown` (~l.917), and the root `studio-container` div (~l.1316);
   - `fader-guards.test.tsx` l.1258–1278 (the test you amend).
4. **Re-check briefly** (A's round-35 grep stands; confirm it is still true and report):
   - the root div has no `onPointerDown`/`onPointerDownCapture`;
   - the gesture-owner list: clip, loop brace, Overview, VideoDock, detail divider, lane height handle and **lane-background marquee** call `preventDefault`; track Volume/Pan and Master are native ranges without it;
   - the four native ranges (Lane Pan, Lane Volume, Master, Zoom);
   - the only frozen test that conflicts is l.1258–1278. If you find **another** existing test that fails with the handler, **stop and report**. Do not amend any test beyond the 3 lines in the ruling.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 The root handler (`StudioWorkspace.tsx`)

**Apply `a-round-35/proposed-StudioWorkspace.diff`:** one `useCallback`, `releaseTypingFocusBeforeRangePointerDown`, and one `onPointerDownCapture` attribute on the root `studio-container` div.
- **Condition:** blur `document.activeElement` when **all** of these hold:
  - it is an `HTMLElement` and `isTypingTarget(focused)`;
  - `isRangeInputTarget(event.target)`;
  - `!workspaceRef.current.isPointerGestureActive()`.
- **Nothing else:** no `preventDefault`, no `stopPropagation`, no status, no focus moved to another element, no `event.button` filter.
- **Do not change:**
  - `releaseEditFocusOnTimelinePointerDown`, `isScrollerGutterPointer`, `isTypingTarget`, `isSliderTarget` or `isRangeInputTarget`;
  - the keydown handler, the round-32 guard, `handleLaneBackgroundPointerDown`;
  - any other branch or JSX attribute.

If the diff no longer applies cleanly against `b64a2cf6`, stop and report.

### 2.2 Doc 036 (`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`)

1. **Correction (C-R34-02), one line in place.** In the round-34 section (l.355), replace only the parenthesis `(headless-ში scrollbar 0 px-ია, round 11 R11-SB)` with an accurate one. For example: `(headless 10 px-იან ვერტიკალურ gutter-ს იტოვებს, მაგრამ scrollbar-ს მალავს და gutter-ში hit-test შვილ ელემენტებს აღწევს; ჰორიზონტალური scrollbar 0 px-ია — C round 34)`. Make no other change to earlier sections.
2. **Append** one section in Georgian, with technical terms in English (for example `## Round 35–36 — range-ზე დაჭერამდე ტექსტური ველი თავისუფლდება`). Cover:
   - C-R34-01: the steps, the cause (claim on pointerdown → native focus move → `commitClipGain` gesture refusal), and why it affects only native ranges (the §1.4 preventDefault list, **including the lane-background marquee**);
   - the rule: the three conditions, the capture order with round 34's handler, and that focused ranges and outside-scroller non-range targets are unchanged;
   - decisions 1–5, including the 4b note;
   - that round 35 stopped on the frozen test, and **the D-29z1 ruling**: the 3 lines, and why the old assertion was a jsdom-only state (C's real-browser evidence);
   - the Pan centre note (0 → 0 writes no Pan entry);
   - that the doc's round-34 statement "A-R34-REVIEW-1 ბრაუზერში არ შემოწმებულა" (l.360) is superseded: C confirmed it as C-R34-01. Say this in the new section; do not rewrite l.360;
   - the new tests and the C verification IDs;
   - the Ableton note of §4.6.
3. Update the doc's header status line (l.4).

### 2.3 Tests (red-first in `store/`)

**File:** `app/lib/arrangement/__tests__/fader-guards.test.tsx`. No other test file changes.

**Order:**
1. Verify that `StudioWorkspace.tsx` is still `b64a2cf6`.
2. Append `a-round-35/new-describe.tsx.txt` as one new `describe` inside the outer one, before the outer `});`, as A did in scratch. Make no other change yet.
3. **Red run:** `npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx`. Expected: **9 failed | 57 passed (66)**. The failures are cases 1–9; cases 10, 11 and 12 are green; the 54 existing tests are green. Paste the output. If the result differs, explain why before you go on.
4. Apply §2.1. Re-run: expected **1 failed | 65 passed (66)** — the l.1258 test fails at l.1265; the 12 new and the 53 untouched tests are green. **Paste this run too.**
5. Apply the **3-line amendment** from the ruling table. Re-run: **66/66**.

**Rules:**
- The other **53** existing tests and every helper stay byte-identical.
- In the appended describe you may fix only what is needed for Biome or tsc. Report any byte change against `new-describe.tsx.txt`.
- **Expected counts:** fader-guards 66; full vitest **1259** (1247 + 12).

The 12 cases (as in A's round-35 file; C checks them against this list):

| # | Case |
|---|---|
| 1 | Clip Gain `3` → music Volume: at `pointerDown`, +1 `Clip Gain`, SFX 3, field released, no blocked status; then `change` + `pointerUp` → `[Volume…, Clip Gain]` newest-first; two Undos restore both |
| 2 | → music Pan: the same, with the Pan entry (jsdom fires `change`) |
| 3 | → Master (outside the scroller) |
| 4 | → video Volume |
| 5 | → Zoom: +1 `Clip Gain`, no blocked status |
| 6 | unchanged `0.0` → Volume: field released, 0 `Clip Gain` |
| 7 | emptied → Master equals the plain-blur control (status + history) |
| 8 | detail start → Master: released, no entry, range not applied |
| 9 | search `ab` → Master: released, `ab`, count unchanged |
| 10 | must-not, gesture active: detail separator id 41, Master id 42 → no blur, no entry at 42 |
| 11 | decision 4: search → library `[role="option"]` → no blur |
| 12 | must-not: focused music Volume → Master → no blur |

### 2.4 After the code

- **Self-check** (report each one):
  - the 53 untouched existing tests are green and byte-identical, including round 34's and round 33's;
  - the frozen `clip-gain.test.tsx` and `master-ui.test.tsx` are green;
  - a Volume drag without any text field focused still writes exactly one entry;
  - the **full** `npx vitest run` passes (the first full run with the handler).
- **Biome:** run `npx biome check --write` **only** on your own files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (3 files changed). Report its findings and your dispositions.
- **Mutation checks:** only in a scratch copy outside `store/`. Never mutate in place. A may skip mutations; they are C's.
- **Commands:** run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `1cefea1` plus the 9 lines, or root's newer commit that contains rounds 31–34.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.1 only: one new `useCallback` handler + one `onPointerDownCapture` attribute on the root div |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | §2.3 only: the 3-line amendment (l.1258, l.1265, l.1272) + one appended `describe`; the other 53 existing tests stay byte-identical |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | §2.2 only: the l.355 parenthesis, the header status line, and an append |
| `../tmp/studio-real-loop/a-round-36.md`, `a-round-36/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-36.md`, `c-round-36.json`, `c-round-36/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

`a-round-35/` and `c-round-35/` are read-only now.

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
- all **376** files in `b-round-35-tree-sha256.txt`, and everything else under `store/`;
- that includes `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `ArrangementClip.tsx`, `ArrangementOverview.tsx`, `ArrangementVideoDock.tsx`, `ArrangementContext.tsx`, `studio-scrollbar.ts`, `clip-gain.test.tsx` and `master-ui.test.tsx`;
- docs 001–035;
- **every existing test** except the 3 ruled lines.

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

**Viewport:** 1440×900, with the detail panel expanded (a real click on `arrangement-detail-toggle`), plus one 1280×720 spot check in R36-CR.

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press`/`$B type`.
- Range drags, blur, pointercancel, second-pointer events and any pointerdown at computed coordinates are synthetic; label them.
- C may hook browser APIs (`AudioParam.prototype.setTargetAtTime`, `AudioBufferSourceNode.prototype.start`, fetch/XHR), labelled as such. No source instrumentation.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every gate records the `node.exe` count.**

**Layout L36** = L35: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4.

Before and after every step, record:
- the clip table `[id, track, start, duration, gainDb]`;
- `history.past.length` and the tail;
- the Clip Gain field text;
- the status line;
- the fader values (music Volume, music Pan, Master, video Volume);
- **`document.activeElement`** (aria-label or tag).

**Checkpoint order if the session may end:** G36 → R36-CR → R36-S → R36-OT → R36-R34 → R36-CL → the rest. Write `c-round-36/checkpoint.md` as you go.

### 4.1 R36-CR — Clip Gain typed, then a real click on a range (C-R34-01)

Start each case:
1. a real click on the SFX header;
2. a real click into Clip Gain;
3. Ctrl+A;
4. real typing of `3` **without Enter**.

Then make a real click on the target. Compare every row with C's round-35 baseline (`c-round-35/runs/cr-baseline-1440.txt`).

| Target | Expected |
|---|---|
| music Volume | SFX `gainDb 3` (the field shows `3.0` when SFX is reselected); tail `[…, Clip Gain, Volume]`; no gesture-blocked status from the commit; `activeElement` = the Volume range; the fader at the click point (record it) |
| music Pan (centre click) | SFX `gainDb 3`; +1 `Clip Gain`; no blocked status; `activeElement` = Pan; Pan 0 → 0 and **0 Pan entries** (D-29z1) |
| Master Volume (header) | the same as music Volume, with `Master Volume` |
| video Volume | the same as music Volume, with the video Volume entry |
| Zoom (regression) | +1 `Clip Gain` only (Zoom writes no entry); no blocked status |

- After the music Volume case: **two Ctrl+Z** → Volume back to its value before the click, then SFX back to no `gainDb` (field `0.0`).
- **1280×720 spot check:** Clip Gain `3` → a real click on Master → SFX `+3.0`, tail `[Clip Gain, Master Volume]`.
- **PASS** = every row as stated.
- **FAIL** = any case where the typed `3` is lost, or the blocked status appears from the Clip Gain commit.

### 4.2 R36-OT — the other rows (one run each)

| Case | Expected |
|---|---|
| Clip Gain = current value (`0.0`), real click on music Volume | 0 `Clip Gain` entries; Volume entry as usual |
| an invalid text the field accepts (C picks and records it; round 34 used `-` and `1e`), real click on Master, vs a real **Tab** control from the same text | the same status and 0 `Clip Gain` entries in both |
| detail start typed (no Enter), real click on Master | focus on Master; range not applied; 0 entries from the field |
| search `ab`, real click on Master | focus on Master; search `ab`, item count unchanged (the same as the round-35 baseline) |
| **gesture active (synthetic, labelled):** Clip Gain `3` focused; start a gesture with an outside-scroller owner that calls `preventDefault` (the detail divider, as A's case 10, or the overview drag; `pointerdown` id 41), then `pointerdown` id 42 on Master | the new handler does not blur at id 42 (`activeElement` still Clip Gain right after the id-42 dispatch); no `Clip Gain` entry at id 42. Record what happens at the end of gesture 41 |
| **focused range (must-not):** music Volume focused with `focus()` (no click), a real click on Master | record `activeElement` and history; must equal the round-34 baseline behaviour (the new code does nothing) |
| **decision 4:** search focused, a real click on a library item | `activeElement` and what Delete does equal `c-round-34` `rec-outside` (REC-OUT-1) |

### 4.3 R36-CL — live audio (one layout; budget 3 valid runs, at most 2 replacements)

- Hooks: `AudioParam.prototype.setTargetAtTime` and `AudioBufferSourceNode.prototype.start` (labelled).
- Set a loop with a range on the **video lane** (3.5–6.0, then Ctrl+L), as in round 34 CG-6. A range on the SFX lane is refused because it must lie inside a clip.
- Start playback with Space while the body has focus.
- Then: a real click on the SFX header, a real click into Clip Gain, type `3`, and a real click on the **music Volume**. **Record the playhead at the click.**
- **Oracle:** at the click, **one clip-gain `setTargetAtTime(≈1.4125, τ 0.015)` per live or scheduled SFX source node** (2 inside the window `[4, 6)` when the next iteration is already scheduled, 1 outside), **0 restarts** (no `start` with `when` ≈ the click time), +1 `Clip Gain`. Every SFX source started afterwards has gain ≈1.4125.
- The music Volume change also re-targets the line gain; record it separately. It is not a clip-gain node.
- A run where playback was not running at the click is a replaceable invalid attempt. Report every attempt.

### 4.4 R36-R34 — short regression

- **R34-CG CG-1:** Clip Gain `3` → a real click on the music **header** → +1 `Clip Gain`, music selected, focus BODY.
- **R34-TS:** search `ab` → a real click on the SFX header → Backspace deletes the clip; the search stays `ab`.
- **R34-SB:** the empty area. Fold the lanes and make a real click on the scroller with the search focused → BODY → Delete deletes. Unfold afterwards.
- **R33-FT:** music Volume → SFX header → Delete deletes (+1).
- **R33-G** (synthetic, Pan id 41 + header id 42, playing): Pan keeps focus; 0 revert calls at id 42; +1 `Pan — მუსიკა` at `pointerup` 41.
- **Round-32 must-not:** music Volume focused with `focus()`, no click → Delete and Backspace → nothing changes.

### 4.5 R36-K — adjacent behaviour (one run each)

- With no text field focused: a music Volume drag (synthetic), a Pan drag and a Master drag each write exactly one entry. Their status and readout match round 31/33.
- Clip Gain: Enter commits once (+1); Escape reverts (0 entries); the `0 dB` reset (+1).
- Zoom slider: a real click changes zoom; no history entry.
- Master Mute toggles; music Mute/Solo toggle (the root capture ignores buttons).

### 4.6 R36-S, R36-U, R36-Doc, Ableton

**R36-S** (static, read-only): `diff -u` of `b-round-35-snapshots/` against the live files.
- `StudioWorkspace.tsx`: only the new handler and its one JSX attribute on the root div. It must equal `a-round-35/proposed-StudioWorkspace.diff` in content. `releaseEditFocusOnTimelinePointerDown`, `isScrollerGutterPointer`, the predicates, the keydown handler, the round-32 guard and every other branch are byte-identical.
- `fader-guards.test.tsx`: **before the appended describe, `diff -u` shows exactly 3 changed source lines (3 `-`/`+` pairs: l.1258, l.1265, l.1272) and no other hunk**, with the bytes of the ruling table. Everything else is appended lines. Compare the appended describe with `a-round-35/new-describe.tsx.txt` and record any difference.
- Doc 036: the header line, the l.355 parenthesis, and an append.
- The other frozen files: 376 OK.
- No hardcoded colour, no `any`/`@ts-ignore`, and no new `// comment`.

**R36-U:**
- The 12 cases exist and are green.
- A's red-first output in `store/`: **9 failed | 57 passed** on the snapshot source. Red: cases 1–9. Green: 10, 11 and 12. Also check A's intermediate run (handler applied, before the amendment): 1 failed | 65 passed, only the l.1258 test.
- C runs these mutations in a scratch copy outside `store/`. Each must make a test fail. Report how each was done:
  - (a) the new handler's JSX attribute removed → cases 1–9 fail;
  - (b) its gesture condition removed → case 10 fails;
  - (c) **(redefined, D-29z1)** the root attribute removed, and the scroller's `onPointerDownCapture` replaced by a composed function that calls the new handler and then round 34's handler (round 34's handler is kept) → every Master/Zoom-target case fails: 3, 5, 7, 8 and 9 (A's scratch showed exactly these; Zoom is in the transport, outside the scroller);
  - (d) `isRangeInputTarget(event.target)` dropped → cases 10/11 fail (A saw both);
  - (e) `isTypingTarget(focused)` replaced by `isTypingTarget(focused) || isRangeInputTarget(focused)` → case 12 fails;
  - (f) in `ArrangementDetailPanel.tsx` (scratch only), `commitClipGain('blur')` made a no-op → cases 1–5 fail. This proves the oracle depends on the existing blur commit.
- Round 34's mutation set is not re-run.

**R36-Doc:** doc 036's new section covers §2.2 and matches the code. The l.355 correction is accurate against C's round-34 geometry. The ruling is described correctly.

**Ableton source and compliance (workflow addendum 2026-10-11).** This is a bug round.
- **Source:** the Ableton Live 12 Reference Manual §18.1 "The Live Mixer", captured as `b-round-29/ableton-mixing-20261012.txt` (gstack `/browse`, 2026-10-12).
- It describes the mixer controls and the double-click reset. It says nothing about when a typed value in a value box is committed, or about what happens to it when the user grabs a fader.
- No video is used. B did not browse a new source; no Ableton claim is made.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A typed, uncommitted value box value is committed when the user presses a fader elsewhere | none captured | **Unconfirmed** | CZABA requirement: the round-30 contract (commit on blur, D-29u) | R36-CR, R36-CL |
| A text field loses focus when a fader is pressed | none captured | **Unconfirmed** | Native browser behaviour (C round 35); the D-29z1 ruling aligns the tests with it | R36-OT |
| A fader press jumps the value to the click point | §18.1 does not describe it | **Unconfirmed** | Native range behaviour today; no-jump is stage 4b | — (not this round) |
| Pan/Volume reset by double-click | §18.1 | **Confirmed** | Still stage 4b (round 37) | — (not this round) |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.7 Gates

**G36-1:**
- tsc 0;
- vitest = **1259** (1247 + 12), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome `./app` (read-only): exactly the 2 baseline CRLF errors, 0 errors in Studio files, and warnings ≤ 218 + 1 info;
- these frozen tests are green: `clip-gain.test.tsx`, `detail-panel.test.tsx`, `detail-panel-polish.test.tsx`, `track-pan.test.tsx`, `master-ui.test.tsx`, `gesture-guard.test.tsx`, `delete-selection-ui.test.tsx`, `track-layout.test.tsx`, `ArrangementContext.test.ts`, `render-budget.test.tsx`, `floating-video.test.tsx`.

**G36-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-35-tree-sha256.txt` → 376 OK (or the documented CRLF exception);
- `git status --short` = §3.2 (9 or 3 lines);
- HEAD recorded at start and end.

**G36-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (during R36-CR and a drag);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, the dev-module `GET /app/lib/r2.config.ts`, and the homepage hero image from `images.unsplash.com` before header navigation.

**Not re-run this round:** the exports, the audio graph checks (R31-PE/PV/PL), the PUI geometry, R32-BC, the video sync checks and the C-R27-01 table. Nothing in the audio graph, the export, the scheduler, the video, the layout or the lane changes; R36-S proves this. These are not PASS for this round. The full find sound → add → fit video → export flow and FB-01..FB-16 stay for the stage regression.

### 4.8 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01, C-R6-02 and C-R8-01 (all Tech Lead);
- C-R23-01 (Tech Lead). Record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab`; round 35: 2 at 28013/28014, 63 520 bytes;
- C-R30-01 (polish).

**Open low items:**
- R26-M1;
- stage 4b: MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2, A-R32-REVIEW-1, A-R33-REVIEW-TOUCH, the stale refusal status;
- R9-REVIEWER-M1-L8 (4c);
- A-R34-REVIEW-RESIDUALS (RTL gutter, overlay scrollbars, right-button press commits);
- DEMO-SFX-FULL-SCALE; L3; LIB-SEP-REASON; R27-T; DOC034-UNREACHABLE-NOTE; DOC035-NOTES.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `b-round-35.md` §7):
- **rounds 31–34 (all 9 status lines) are C-verified and ready for root's checkpoint commit.** Root runs its own gates and review first, and commits before A starts round 36 or after C passes it;
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
- the `feature-status.md` §5 list, including R30-T, R31-T, R33-T and R34-T (with the Firefox overlay-scrollbar variant of (3));
- **R35-T** (meaningful after this round lands): with a real mouse in real Chrome, type a Clip Gain `3` without Enter, then click the music Volume, Pan or Master → SFX keeps `+3.0 dB`, and the history shows `Clip Gain`, then the fader entry (a centre Pan click writes none);
- TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
sha256sum -c ../tmp/studio-real-loop/b-round-35-tree-sha256.txt | grep -vc ': OK$'
sha256sum ../tmp/studio-real-loop/a-round-35/proposed-StudioWorkspace.diff ../tmp/studio-real-loop/a-round-35/new-describe.tsx.txt
npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
diff -u ../tmp/studio-real-loop/b-round-35-snapshots/StudioWorkspace.tsx app/components/arrangement/StudioWorkspace.tsx
diff -u ../tmp/studio-real-loop/b-round-35-snapshots/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
diff -u ../tmp/studio-real-loop/b-round-35-snapshots/036-studio-lab-track-pan.md docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If a test path above does not exist, report it and run the rest. Do not create test files.

If the server is up, A may do one browser smoke check (`a-browse.json`): select SFX, type a Clip Gain `3` without Enter, make a real click on the music Volume → SFX `+3.0 dB`, history `Clip Gain` then `Volume`. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G36-1/2, R36-S, R36-U, R36-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-36.md`:**
1. the pre-flight gate, including the §1.4 re-check;
2. the red run, the intermediate run (handler, before the amendment) and the green run;
3. the diff summary per file (hunk purposes), and any byte difference from the round-35 artifacts;
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations and the §2.4 self-check results.

Do not claim PASS. If you hit a new stop condition, stop and report as in round 35. Do not widen or narrow the handler to avoid it.

**C → `c-round-36.md` and `c-round-36.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R36-CR and R36-OT tables with `activeElement`, the Clip Gain text, the status and the history tail, side by side with the round-35 baseline;
- the R36-CL hook counts per attempt;
- the mutation table;
- the Ableton two-verdict table (§4.6);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 37 — SRW-13 stage 4b** (fader UX for Volume, Master and Pan). It must keep the round-36 root capture. It covers:
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

  B may split 4b into two checkable stages if it judges it too large for one round. The full scope stays.
- **Round 38:** stage 4c (round-9 M1/L8), then polish (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE).
- **Then:**
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 36 -StartPhase A` and a higher limit.
