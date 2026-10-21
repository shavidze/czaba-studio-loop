# CURRENT TASK — Round 34: C bugs first — a timeline click also releases a focused text field (FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, scrollbar gutter)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-13
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorization 2026-10-13).
- Decision record: **D-29y** in `docs/technical/studio-real-workspace/plan.md`; rationale in `b-round-33.md`.
- Round size: **three tightly related bugs in one handler** (workflow rule "one feature or at most three related bugs"). No feature work this round.

> **Environment prerequisite (root, not BLOCKED):** the dev server `http://127.0.0.1:5173/studio-lab` answered **200** during C round 33 (15:20 +04:00). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** B counted **8 → 7** `node.exe` during its gate run. Every A and C run records the count (`tasklist | grep -ci node.exe`).

## Why this round

C round 33 (`c-round-33.md`, `c-round-33.json`) is a **PASS**: G33-1..3, R33-FT, R33-KO, R33-G, R33-K, R33-S, R33-U (mutations a–f killed) and R33-Doc. B re-ran the gates independently (`b-round-33/gates.txt`): HEAD `1cefea1`, the same 9 status lines, 376 OK, protected 4/4, tsc 0, vitest 69 files / **1230/1230**, build ✓, Biome 2 baseline CRLF errors + 218 warnings + 1 info.

C-R32-01 and C-R31-02 are closed. C's record-only items (§4.5) found two bugs in the **same focus path**, and A's code review found one Low residual in the same handler:

**1. FOCUS-TEXT-STALE (Medium, confirmed by C):**
- **Steps (real clicks):** click the library search, type `ab`, click the `Soft impact` clip header (it becomes selected), press Delete, then Backspace.
- **Result:** focus stays in the search field. Delete does nothing to the clip. Backspace silently edits the hidden search text (`ab` → `a`), so the library filter changes. No status.
- **Cause:** the same as C-R32-01. Timeline pointerdowns call `preventDefault()`, so focus never leaves the field, and the keydown handler returns early for `isTypingTarget(event.target)`. Round 33's capture handler releases only native range inputs.
- **Evidence:** `c-round-33/runs/rec-text-stale.txt` REC-1.

**2. CLIP-GAIN-CLICK-DISCARD (Medium, new ID from C's REC-2):**
- **Steps (real clicks):** select the SFX clip, click the Clip Gain field, Ctrl+A, type `3` (no Enter), click the music clip header.
- **Result:** the typed `3` is **silently lost**. No `Clip Gain` entry, SFX gain unchanged, no status. Focus goes to BODY.
- **Cause (B, source reading):** `ArrangementDetailContent` is keyed by the selected clip id (`ArrangementDetailPanel.tsx:801`). The clip pointerdown changes the selection, React remounts the content, and the focused input is removed. A removed element fires no `blur`, and `commitClipGain` also returns early once `isContentMountedRef` is false. This breaks the round-30 contract (D-29u): **"commit on Enter/blur = one history entry `Clip Gain`"**. Leaving the field by clicking elsewhere is a blur for the user.
- **Evidence:** `c-round-33/runs/rec-text-stale.txt` REC-2.

**3. A-R33-REVIEW-SCROLLBAR (Low; it becomes a hazard with item 1):**
- A's code-reviewer (`a-round-33.md` §4): a pointerdown on the scroller's own scrollbar (`event.target === scroller`) blurs the fader. Browsers do not move focus on a scrollbar click.
- With item 1, the same click would also blur the search field. A user typing a search, then dragging the timeline scrollbar, then pressing Backspace to fix a typo would **delete the selected clip** instead of editing the text. That needs to be fixed in the same handler now.

All three are fixed by **one predicate change** in the round-33 handler. The fix for item 1 fixes item 2 too: the capture blur runs before the clip's handler changes the selection, so the field's existing `onBlur` commits the typed value to the clip it was typed for.

**References:**
- Backlog v35: `backlog.json` (`open_findings` FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD, A-R33-REVIEW-SCROLLBAR, A-R33-REVIEW-TOUCH; `rounds` 34; SRW-13 `decisions_round34`).
- Progress board: `feature-status.md`.
- C's reproduction material (read-only for A): `c-round-33/runs/rec-text-stale.txt`, `rec-outside.txt`, `c-round-33/scripts/`.
- A's round-33 report: `a-round-33.md` (§4 review findings, §6 self-check).
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Previous round:** archived as `tasks/round-33.md` (`cmp`-identical to the dispatched round-33 task).

## Baseline

B verified on 2026-10-13 (~15:20, `b-round-33/gates.txt`):
- HEAD is **`1cefea1`**.
- `git status --short` = **9** lines (saved in `../tmp/studio-real-loop/b-round-33-git-status.txt`):
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
- `sha256sum -c ../tmp/studio-real-loop/b-round-33-tree-sha256.txt` → **376 OK**.
  - It is round 32's list unchanged (the same 3 files are owned again). It covers every tracked or untracked file under `app/` and `docs/implementation/` **except your 3 files** below. `ArrangementDetailPanel.tsx`, `ArrangementLibrary.tsx` and `clip-gain.test.tsx` are in it, so they are frozen.
- Protected 4/4 OK; tsc 0; build ✓; vitest **69 files, 1230/1230**.
- Biome `./app`: **2 errors** + 218 warnings + 1 info.
  - Both errors are `format` errors (CRLF) on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. They belong to root.
  - **Do not touch those files.** Your files must add 0 errors.
- Dispatch snapshots of your 3 files are in `../tmp/studio-real-loop/b-round-33-snapshots/`:

  | File | sha256 (first 8) |
  |---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `be01135c` |
  | `app/lib/arrangement/__tests__/fader-guards.test.tsx` | `9a973aef` |
  | `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | `91c1547b` |

- **Rounds 31, 32 and 33 are C-verified and ready for root's checkpoint commit (all 9 lines).** If root commits before you start:
  - record the new HEAD;
  - check that `b-round-33-tree-sha256.txt` is still 376 OK. If root normalises the CRLF auth files, those lines may change; report that, and do not treat it as yours;
  - check that none of your 3 files differs from its snapshot. If one does, **stop and report**.

Rules for the baseline:
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `AGENTS.md` and the agent files are root's.
- Nobody but root commits or pushes.

## 0. Scope

**The contract after this round** (it extends round 33's table; rows not listed are unchanged):

| Action | Result |
|---|---|
| The focused element is a native range input (track Volume, track Pan, Master, Zoom) **or a text-entry field** (`isTypingTarget`: library search, Clip Gain, detail start/end, any text/number input, textarea, select, contentEditable), and a `pointerdown` lands inside the timeline scroller on an element that is **not a native range input** and **not in the scroller's scrollbar gutter** | The focused element is **blurred** before any handler of the clicked element runs. Keys then reach the workspace as if focus were on `document.body`. |
| The same, but a pointer gesture is already active (`isPointerGestureActive()`) | **No blur** (unchanged from round 33). |
| The `pointerdown` lands on a native range input | **No blur by the new code** (unchanged from round 33). |
| The `pointerdown` target is the scroller element itself **and** the point is outside its client box (the scrollbar gutter: `x ≥ clientWidth` or `y ≥ clientHeight`, measured from the padding edge) | **No blur**, for faders and text fields alike. This amends round 33. |
| The `pointerdown` target is the scroller element itself **inside** its client box (empty area below the last lane, if there is one) | **Blur** (as round 33). |
| Clip Gain has a typed, uncommitted value and the click lands on **another** clip, the **same** clip, or an empty lane | The existing `onBlur` commits it **to the clip it was typed for**: exactly the result a Tab-blur gives for the same text (one `Clip Gain` entry if the value changes; the existing invalid/unchanged status and 0 entries otherwise). The entry is written **before** the clicked element's gesture claims the pointer and before the selection changes. |
| Library search had focus, typed text, then a timeline click | Search **text and filter are unchanged**; focus leaves the field. Delete/Backspace then act on the timeline selection (SRW-24: delete with a gap). |
| A focused detail start/end field (no `onBlur` commit), then a timeline click | Focus leaves the field; the typed range text is not applied (unchanged contract: Enter or the Apply button applies it). |
| A `pointerdown` **outside** the scroller (library, detail panel, overview, header, transport) | **Unchanged.** B decision 4 below. |
| Keys while a text field **really** has focus (no click in between) | **Unchanged:** the workspace ignores them (`isTypingTarget`), so Backspace edits the text. |

**Decisions (B, D-29y), with the reasons:**
1. **Extend the focus release, keep everything else.** Round 33 decision 1 holds: blurring reproduces what the browser does without `preventDefault`. A text field is the same class of focus retention. The keydown handler, `isTypingTarget`, `isSliderTarget`, `isRangeInputTarget` and the round-32 guard stay byte-identical.
2. **Commit, not discard, for Clip Gain.** The round-30 contract (D-29u) says blur commits. Discarding the typed value silently is the bug. Committing to the clip it was typed for is the smallest honest behaviour, and the existing `commitClipGain('blur')` already does it when the blur happens before the remount. `ArrangementDetailPanel.tsx` stays frozen: no new commit path, no unmount flush.
3. **Exclude only the scrollbar gutter, by geometry.** `event.target === scroller` matches both the scrollbar and any empty area of the scroller below the lanes. Excluding the whole element would bring C-R32-01 back for that empty area. The CSSOM client box (`clientWidth`/`clientHeight`) excludes the scrollbar, and the scroller has `scrollbar-gutter: stable` (`studio-scrollbar.ts`), so a point outside the client box is a scrollbar point. Rejected: excluding `target === currentTarget` without geometry (regression in the empty area); leaving the residual (with item 1 it turns a scroll into a later accidental clip delete).
4. **Outside-scroller clicks stay unchanged (C's `rec-outside.txt`).** After a click on a library item, focus is on that button and Delete deletes the selected timeline clip. B accepts this: the library has no delete action, and the workspace keys act on the timeline selection whenever focus is not in a text field or on a native range. No code change, no new verdict.
5. **The touch residual stays Low and goes to stage 4b (round 35).** A-R33-REVIEW-TOUCH: a touch scroll on the timeline blurs a fader on pointerdown, so a pending keyboard preview commits early. It has no data loss (the entry is written, not lost), C cannot produce trusted touch input, and 4b reworks the fader gesture machine.
6. **The new hazard is stated, not hidden.** After typing in the search and clicking a clip, Backspace now deletes the clip (undoable, one entry, a gap). That is the browser's behaviour without `preventDefault`, consistent with round 33 and SRW-24. The Tech Lead checks it with a real mouse (R34-T).

**In (A):** §2.1 (the predicate change), §2.2 (a doc 036 section), §2.3 (tests appended to `fader-guards.test.tsx`, red-first).

**In (C):** §4.

**Not in this round** (each one is queued, not deferred scope):
- **stage 4b (round 35):** the no-jump fader click; double-click reset (Live §18.1); FADER-KEY-ENTRIES; A-R29-REVIEW-1; the pending-commit order; MASTER-HOLD-TICK-EDGE; A-R31-REVIEW-2; A-R32-REVIEW-1; **A-R33-REVIEW-TOUCH**; the stale refusal status; Volume's blur-continue behaviour if 4b changes the gesture machine;
- **stage 4c + polish (round 36):** round-9 M1/L8, C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE;
- any change to outside-scroller pointerdowns, to `role="slider"` key handling, or to `ArrangementDetailPanel.tsx`/`ArrangementLibrary.tsx`.

**Out of scope for the whole project:** plugins and effects (including compressor/limiter/normalise), pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- round 33's fader rows (R33-FT subset, R33-G gesture exclusion, round-32 must-not rows);
- Clip Gain Enter commit, Escape revert and the 0 dB reset;
- library search typing, its own keys and the clear button;
- the detail start/end fields and Apply;
- clip drag/trim, marquee and lane click started while a text field has focus;
- the empty area below the lanes and the scrollbar gutter.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives.**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md` (read them in full **before** the first edit; round 33 read some after);
   - `prompts/studio-feature.md`, then run the `pre-flight` skill.
2. **Check the baseline** and report it before any edit:
   - `git rev-parse HEAD`;
   - `git status --short` (the 9 lines above, or the post-commit equivalent);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-33-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - your 3 files against the snapshot shas;
   - protected 4/4;
   - the `node.exe` count.
3. **Read:**
   - `StudioWorkspace.tsx`: l.206–235 (the predicates), `releaseFaderFocusOnTimelinePointerDown` (~l.884–898), the keydown handler (~l.1000–1200), the scroller JSX (~l.1364–1370);
   - `ArrangementDetailPanel.tsx` (read-only): `commitClipGain` (~l.325–354), the Clip Gain input (~l.493–512), the start/end inputs (~l.446–475), the `key` on `ArrangementDetailContent` (~l.801), `isContentMountedRef`;
   - `ArrangementLibrary.tsx` (read-only): the search input and `handleSearchKeyDown` (~l.400–420);
   - `ArrangementContext.tsx` `setClipGain` (~l.2292) and `applyEdit` (~l.948) (read-only);
   - `studio-scrollbar.ts` (read-only);
   - `clip-gain.test.tsx` `detail panel UI` (the Clip Gain fixture and how it reaches the input) and your own `fader-guards.test.tsx` harness.
4. **Grep yourself and report:**
   - every element inside the scroller subtree that is a typing target (B found none: the lane has range and hidden file inputs only). If one exists, **stop and report**;
   - every existing test that asserts a text field keeps focus, or that a typed Clip Gain is discarded, after a pointerdown inside the timeline. **If a frozen test expects that, stop and report** (contract conflict for B);
   - whether the `fader-guards.test.tsx` fixture renders the detail panel with an enabled Clip Gain input for the selected SFX clip. If it does not and the fixture cannot reach it with local helpers in your file, **stop and report**. Do not widen file ownership.
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 The predicate (`StudioWorkspace.tsx`)

Change **only** `releaseFaderFocusOnTimelinePointerDown` (you may rename it to a grep-friendly name such as `releaseEditFocusOnTimelinePointerDown`; then update its one JSX use and report it).

- Blur the focused element when **all** of these hold:
  - it is an `HTMLElement` and `isRangeInputTarget(focused) || isTypingTarget(focused)`;
  - `!isRangeInputTarget(event.target)`;
  - the pointer is **not** in the scrollbar gutter: when `event.target === event.currentTarget`, compute the point relative to the scroller's padding box (`clientX − rect.left − clientLeft`, `clientY − rect.top − clientTop`) and treat `x ≥ clientWidth || y ≥ clientHeight` as the gutter. When the target is a descendant, it is never the gutter;
  - `!workspaceRef.current.isPointerGestureActive()`.
- Nothing else: no `preventDefault`, no `stopPropagation`, no focus moved to another element, no status text.
- You may add one small, named, module-level helper for the gutter test (for example `isScrollerGutterPointer`). Do **not** change `isTypingTarget`, `isSliderTarget`, `isRangeInputTarget`, the keydown handler, the round-32 guard, `handleLaneBackgroundPointerDown` or any other branch.

### 2.2 Doc 036 (`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`)

Append one section in Georgian, with technical terms in English (for example `## Round 34 — timeline-ზე click ტექსტურ ველსაც ათავისუფლებს`). Cover:
- FOCUS-TEXT-STALE and CLIP-GAIN-CLICK-DISCARD: the steps, the cause (the keyed remount in `ArrangementDetailPanel.tsx:801`, no blur on a removed element, `isContentMountedRef`), and why the capture blur fixes both;
- the rule: the four conditions, the gutter geometry and `scrollbar-gutter: stable`, the empty-area behaviour;
- decisions 2, 4, 5 and 6 (commit not discard; outside-scroller accepted; A-R33-REVIEW-TOUCH → 4b; the Backspace hazard and R34-T);
- correct the round-33 section's residual list: the scrollbar residual is now handled (do not rewrite the round-33 text; add the correction in the new section). State that A-R33-REVIEW-SCROLLBAR is a **code-review finding, not reproduced** in a browser (headless shows a 0 px scrollbar), so the gutter rule is preventive and the real check is the Tech Lead's R34-T;
- the new tests and the C verification IDs;
- the Ableton note of §4.6.

Update the doc's header status/date line. Do not rewrite the earlier sections.

### 2.3 Tests (written first; red on the snapshot sources)

**Order:**
1. Append the tests to `fader-guards.test.tsx` against the **unchanged** `StudioWorkspace.tsx`.
2. Run them and paste which fail and why.
3. Implement, then re-run.

**File:** `app/lib/arrangement/__tests__/fader-guards.test.tsx`, **append only**: one new `describe`, for example `'a timeline pointerdown releases text-field focus (FOCUS-TEXT-STALE, CLIP-GAIN-CLICK-DISCARD; D-29y)'`, placed inside the outer `describe` like round 33's. You may add small local helpers. **All 37 existing tests and the helpers they use stay byte-identical** (a helper may only gain an optional parameter; report it). **No other test file changes.**

jsdom does not move focus on pointerdown and has no layout, so the tests assert the explicit blur, and the gutter tests stub `getBoundingClientRect`, `clientWidth`, `clientHeight`, `clientLeft` and `clientTop` on the scroller element instance. At least **12** new `it` blocks, through the real `StudioWorkspace` and provider, on the existing fixture (video + music + SFX, SFX clip selected):

1. **Search → clip header → Delete:** focus the library search, type `ab` (a `change`), `pointerDown`/`pointerUp` on the SFX clip header. `document.activeElement` is not the search, the search value is still `ab`, and Delete (dispatched on `document.activeElement`) deletes the SFX clip, leaves a gap and adds one entry.
2. **Search → clip header → Backspace:** the same with Backspace. The clip is deleted and the search value is still `ab`.
3. **Search → empty lane body:** focus is released.
4. **Clip Gain → another clip:** select SFX, focus Clip Gain, `change` to `3` (no Enter), `pointerDown` on the **music** clip header. Exactly **one** new `Clip Gain` entry, the SFX clip's `gainDb` is 3, the music clip is now selected, and the entry was written before the music clip's gesture (the history tail before `pointerUp` is `Clip Gain`). Then Delete deletes the music clip: the tail is `[Clip Gain, კლიპის წაშლა]`.
5. **Clip Gain → the same clip header:** typed `3` → `pointerDown`/`pointerUp` on the SFX header → one `Clip Gain` entry, focus released. Delete → tail `[Clip Gain, კლიპის წაშლა]` and the SFX clip is gone.
6. **Clip Gain → empty lane body** (deselect): typed `3` → one `Clip Gain` entry on the SFX clip.
7. **Clip Gain, unchanged text → another clip:** 0 new entries.
8. **Clip Gain, a text that a Tab-blur rejects or leaves unchanged** (A picks one the `type=number` field keeps in jsdom and reports it): the click gives exactly the history and status a plain blur of the same text gives. 0 `Clip Gain` entries.
9. **Detail start field → clip header:** focus the detail start field and type a value (no Enter). Focus is released, no entry is written, the range is not applied.
10. **Gutter, search:** focus the search; `pointerDown` on the **scroller element itself** at a point inside the stubbed gutter (`x ≥ clientWidth`). The search keeps focus.
11. **Gutter, fader:** the same with the music Volume focused. Volume keeps focus.
12. **Scroller's own client area:** focus the search, then `pointerDown` on the scroller element itself at a point **inside** the stubbed client box. Focus is released.
13. **Regression in the same `describe`:** focus the search, type `ab`, press Backspace with no click in between. The search text edits, and the clip table and history are unchanged.

### 2.4 After the code

- **Self-check** (report each one):
  - a clip drag started while the search has focus moves the clip and writes one entry;
  - a Clip Gain Enter commit and Escape revert still work (the frozen `clip-gain.test.tsx` is green);
  - round 33's 18 tests are green unchanged;
  - Backspace in the library search still edits text when nothing was clicked.
- **Biome:** run `npx biome check --write` **only** on your own files, then a read-only `npx biome check ./app`. Expect exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent (3 files changed). Report its findings and your dispositions.
- **Mutation checks:** only in a scratch copy outside `store/`. Never mutate in place.
- **Commands:** run the §5 commands. One browser smoke check is allowed if the server is up.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `1cefea1` plus the 9 lines, or root's newer commit that contains rounds 31–33.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | A | §2.1 only (the handler's predicate, an optional rename, one optional module-level gutter helper) |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | §2.3 only (append one `describe`; the existing 37 tests byte-identical) |
| `docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md` | A | §2.2 only (append + header status line) |
| `../tmp/studio-real-loop/a-round-34.md`, `a-round-34/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-34.md`, `c-round-34.json`, `c-round-34/` | C | report, runs, shots and gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end:**
- if root has **not** committed: exactly the same **9** lines as the baseline;
- if root **has** committed all 9 files of rounds 31–33: exactly **3** lines:
  ```
   M app/components/arrangement/StudioWorkspace.tsx
   M app/lib/arrangement/__tests__/fader-guards.test.tsx
   M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
  ```
- any other root commit: record it, and check every line against this section.

### 3.3 Frozen this round

**Frozen:**
- all **376** files in `b-round-33-tree-sha256.txt`, and everything else under `store/`;
- that includes `ArrangementDetailPanel.tsx`, `ArrangementLibrary.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementContext.tsx`, `ArrangementMaster.tsx`, `ArrangementTransport.tsx`, `ArrangementOverview.tsx`, `studio-scrollbar.ts` and `clip-gain.test.tsx`;
- docs 001–035;
- **every existing test** (the 37 existing tests of `fader-guards.test.tsx` included).

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

**Viewport:** 1440×900 (plus one 1280×720 spot check in R34-TS).

**Harness rules (unchanged):**
- A "real click" means `$B click` at the element centre. Keys mean real `$B press`/`$B type`.
- Range drags, blur, pointercancel and any pointerdown at computed gutter coordinates are synthetic; label them.
- C may hook browser APIs (`AudioParam.prototype.setTargetAtTime`, `AudioBufferSourceNode.prototype.start`), labelled as such. No source instrumentation.
- Mutations run only in a scratch copy outside `store/`.
- **Every run and every gate records the `node.exe` count.**

**Layout L34** = L33: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4. Before and after every step, record the clip table `[id, track, start, duration, gainDb]`, `history.past.length` and tail, the search value, the Clip Gain field text, and **`document.activeElement`** (aria-label or tag).

**Checkpoint order if the session may end:** G34 → R34-TS → R34-CG → R34-R33 → R34-SB → rest. Write `c-round-34/checkpoint.md` as you go.

### 4.1 R34-TS — search → timeline click → key (FOCUS-TEXT-STALE; real clicks)

- Real click on the search, type `ab`. Record the visible library item count.
- Then a real click on each target below. Record `activeElement`, the search value and the visible item count. Then Delete (Undo after a deletion), and repeat the sequence with Backspace.

| Target | Expected |
|---|---|
| SFX clip header | BODY; search `ab`, item count unchanged; Delete and Backspace each delete the clip (+1 `კლიპის წაშლა`, gap) |
| empty SFX lane body, then the clip header | the same |
| clip body (waveform area) | focus released; record Delete |
| ruler (away from the playhead handle) | focus released; record Delete |

- **Must-not:** search focused, type `ab`, no click, Backspace → the search becomes `a`; clips and `past` unchanged.
- **1280×720 spot check:** search → header → Backspace deletes; search text unchanged.
- **PASS** = every row as stated, Delete and Backspace alike.

### 4.2 R34-CG — Clip Gain typed value is committed, not lost (CLIP-GAIN-CLICK-DISCARD; real clicks)

Start each case with the SFX clip selected (real click on its header), a real click into the Clip Gain field, Ctrl+A, then real typing **without Enter**.

| Case | Then | Expected |
|---|---|---|
| CG-1 type `3` | real click on the music clip header | +1 `Clip Gain` (SFX stored `+3.0 dB`, visible again when SFX is reselected), music selected, focus BODY. Then Delete → tail `[Clip Gain, კლიპის წაშლა]`, music deleted |
| CG-2 type `3` | real click on the SFX header itself | +1 `Clip Gain`; Delete → tail `[Clip Gain, კლიპის წაშლა]`, SFX deleted |
| CG-3 type `3` | real click on an empty lane | +1 `Clip Gain` on SFX, selection cleared |
| CG-4 type the current value | real click on the music header | 0 entries |
| CG-5 an invalid text the field accepts (C picks and records it) | real click on the music header | the same status and 0 entries as a real **Tab** from the same text (run the Tab control and record both) |
| CG-6 type `3`, **playing**, `setTargetAtTime` + `start` hooks | real click on the music header | see the CG-6 procedure below |

- **CG-6 procedure (live audio):** the SFX clip has a live source only while the playhead is inside `[4, 6)`. First set a loop around it (for example a range 3.5–6.5 on the SFX lane, then Ctrl+L). Start playback with Space while the body has focus. Then select SFX, click into Clip Gain, type `3` and click the music header. **Record the playhead at the click.**
  - playhead inside `[4, 6)`: exactly **one** `setTargetAtTime(≈1.4125, τ 0.015)` on the SFX clip gain path and **0** new `start` calls at the click (the round-30 R30-GV live oracle), +1 `Clip Gain`;
  - playhead outside `[4, 6)` (control; record it): **0** live calls at the click, the `Clip Gain` entry is still written, and the next loop iteration starts the SFX source at gain ≈1.4125 (the R30-GL oracle);
  - a run that misses the window is a replaceable invalid attempt (3 valid runs, at most 2 replacements); report every attempt.
- **Unchanged contract (one run each):** Enter commits once (+1); Escape reverts the text (0); the `0 dB` reset (+1).
- **PASS** = every row as stated. Undo after CG-1 restores SFX gain to 0 with one Undo.

### 4.3 R34-SB — scrollbar gutter and empty area (synthetic, labelled)

- Read the scroller's `getBoundingClientRect`, `clientLeft/Top`, `clientWidth/Height`, `offsetWidth/Height` and the computed `scrollbar-gutter`, and record them. Headless may report a 0 px scrollbar (round 11 R11-SB).
- If the gutter is wider than 0: with the search focused, dispatch a synthetic `pointerdown`/`pointerup` on the scroller element at a gutter point → the search keeps focus. Repeat with the music Volume focused → it keeps focus.
- If the gutter is 0: record that, and that the real-scrollbar check is the Tech Lead's (R34-T).
- **Empty area:** if the lanes leave an empty area of the scroller at 1440×900 (record the geometry), a real click there with the search focused, then with the music Volume focused → focus released → Delete deletes the selected clip. If there is no empty area, record that (the unit test covers it).

### 4.4 R34-R33 — round-33 regression (short)

- R33-FT rows: music Volume → SFX header → Delete; Master → ruler → Delete; music Pan → empty lane → header → Backspace. Each deletes with one entry.
- R33-G: the Pan drag id 41 + header pointerdown id 42 (synthetic, `setTargetAtTime` hook): Pan keeps focus, 0 revert calls at id 42, +1 `Pan — მუსიკა` at the window `pointerup` 41.
- Round-32 must-not: music Volume focused with `focus()`, no click → Delete and Backspace → nothing changes.

### 4.5 R34-K — adjacent behaviour (one run each, a text field focused first)

- A clip drag (synthetic) moves the clip with 1 entry; a trim works; a marquee over two clips selects both; an empty-lane click sets the playhead.
- A ruler click seeks; the loop brace drag works and the brace has focus afterwards; a real click on the playhead handle focuses it and Delete deletes the selection.
- Space toggles playback after a search → clip click.
- The search clear button (`×`) still clears; the search's own keys (`handleSearchKeyDown`) behave as before.
- The detail start/end fields + Apply still apply a range.
- **Record only:** with the search focused, a real click on a library item and on the detail panel background (outside the scroller): `activeElement` and what Delete does. B decision 4 accepts the current behaviour; report only if it changed from `rec-outside.txt`.

### 4.6 R34-S, R34-U, R34-Doc, Ableton

**R34-S** (static, read-only): `diff -u` of `b-round-33-snapshots/` against the live files.
- `StudioWorkspace.tsx`: only the handler's predicate (and the optional rename + its JSX use, and the optional gutter helper). The keydown handler, the round-32 guard, `isTypingTarget`, `isSliderTarget`, `isRangeInputTarget` and every other branch are byte-identical.
- `fader-guards.test.tsx`: only appended lines. The 37 existing tests are byte-identical.
- Doc 036: append and header only.
- The other frozen files: 376 OK.
- No hardcoded colour, no `any`/`@ts-ignore`, and no new `// comment`.

**R34-U:**
- The §2.3 cases exist and are green.
- A's red-first output shows cases 1–6 and 9 failing on the snapshot `StudioWorkspace.tsx`. Cases 7, 8, 11 and 13 may be green there (exclusions and regressions); 10 and 12 depend on the snapshot's behaviour (A labels each one).
- C runs these mutations in a scratch copy outside `store/`; each must make a test fail. Report how each was done:
  - (a) `|| isTypingTarget(focused)` removed → cases 1–6, 9 and 12 fail;
  - (b) the gutter condition removed → cases 10 and 11 fail;
  - (c) the gutter condition replaced by `event.target === event.currentTarget` (no geometry) → case 12 fails;
  - (d) the typing branch narrowed to `type === 'search'` → cases 4–6 and 9 fail;
  - (e) the gesture condition removed → round 33's gesture-exclusion test fails;
  - (f) in `ArrangementDetailPanel.tsx` (scratch only), `commitClipGain('blur')` made a no-op → cases 4–6 fail. This proves the oracle depends on the existing blur commit.
- Round 33's mutation set is not re-run, except (e).

**R34-Doc:** doc 036's new section covers §2.2 and matches the code.

**Ableton source and compliance (workflow addendum 2026-10-11).** This is a bug round.
- **Source:** the Ableton Live 12 Reference Manual §18.1 "The Live Mixer", captured as `b-round-29/ableton-mixing-20261012.txt` (gstack `/browse`, 2026-10-12). It describes the mixer controls and the double-click reset.
- It says nothing about keyboard focus after a click in the Arrangement, about the Browser search field, or about when a typed value in a value box is committed. No video is used. B did not browse a new source; no Ableton claim is made.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A click in the timeline moves the edit context away from a focused text field | none captured | **Unconfirmed** | CZABA requirement (FOCUS-TEXT-STALE; SRW-24 flow) | R34-TS |
| A typed, uncommitted value box value is committed when the user clicks elsewhere | none captured | **Unconfirmed** | CZABA requirement: the round-30 contract (commit on blur, D-29u) | R34-CG |
| A click on the scrollbar does not take keyboard focus from a field | none captured | **Unconfirmed** | CZABA requirement (native browser behaviour) | R34-SB |
| Pan/Volume reset by double-click | §18.1 | **Confirmed** | Still stage 4b (round 35) | — (not this round) |

C reports **two separate verdicts** per row: the CZABA requirement (PASS/FAIL) and the Ableton compliance (დადასტურებული / შეგნებული განსხვავება / დაუდასტურებელი / არ ეხება). Never write "Ableton does it this way" for an unconfirmed row.

### 4.7 Gates

**G34-1:**
- tsc 0;
- vitest = **1230** + A's new tests (≥ 12 new `it`), 0 failures. Record `node.exe`. If a failure is a timeout under load, re-run that file alone and report both runs;
- the build passes;
- Biome `./app` (read-only): exactly the 2 baseline CRLF errors, 0 errors in Studio files, and warnings ≤ 218 + 1 info;
- these frozen tests are green: `clip-gain.test.tsx`, `detail-panel.test.tsx`, `track-pan.test.tsx`, `delete-selection-ui.test.tsx`, `all-lane-clipboard.test.tsx`, `track-layout.test.tsx`, `gesture-guard.test.tsx`, `master-ui.test.tsx`, `ArrangementContext.test.ts`, `render-budget.test.tsx`, and the library tests that cover the search (C lists which files).

**G34-2:**
- protected hashes 4/4 OK;
- `sha256sum -c b-round-33-tree-sha256.txt` → 376 OK (or the documented CRLF exception);
- `git status --short` = §3.2 (9 or 3 lines);
- HEAD recorded at start and end.

**G34-3:** anonymous `/studio-lab`, opened directly and via the header link:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code (during R34-TS, R34-CG and a drag);
- media only from the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, the dev-module `GET /app/lib/r2.config.ts`, and the homepage hero image from `images.unsplash.com` before header navigation.

**Not re-run this round:** the exports, the audio graph checks (R31-PE/PV/PL), the PUI geometry, R32-BC, the video sync checks and the C-R27-01 table. Nothing in the audio graph, the export, the scheduler, the video, the layout or the lane changes. R34-S and R34-K prove that.

### 4.8 Carried, honest (not PASS, not new bugs unless they change)

**Open C bugs:**
- C-R27-01, C-R6-02 and C-R8-01 (all Tech Lead);
- C-R23-01 (Tech Lead). Record the NUL count and offsets of `curl -s http://127.0.0.1:5173/studio-lab`; round 33: 2 at 28013/28014, 63 520 bytes;
- C-R30-01 (polish).

**Open low items:**
- R26-M1;
- MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, A-R31-REVIEW-2, A-R32-REVIEW-1 and A-R33-REVIEW-TOUCH (stage 4b);
- R9-REVIEWER-M1-L8 (4c);
- DEMO-SFX-FULL-SCALE; L3; LIB-SEP-REASON; R27-T; DOC034-UNREACHABLE-NOTE; DOC035-NOTES.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`, `b-round-33.md` §7):
- **rounds 31 + 32 + 33 (all 9 status lines) are C-verified and ready for root's checkpoint commit**; root runs its own gates and review first;
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
- the `feature-status.md` §5 list, including R30-T, R31-T and R33-T;
- **R34-T (new):** with a real mouse in real Chrome: (1) type in the library search, click a clip, press Backspace → the clip is deleted and the search text is unchanged; (2) type a Clip Gain value without Enter, click another clip → the value is kept on the first clip (one `Clip Gain` entry); (3) with the search focused, drag the timeline scrollbar, then type → the text still goes into the search;
- TL-Q-FB05-FB11.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
sha256sum -c ../tmp/studio-real-loop/b-round-33-tree-sha256.txt | grep -vc ': OK$'
npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
npx vitest run app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
diff -u ../tmp/studio-real-loop/b-round-33-snapshots/StudioWorkspace.tsx app/components/arrangement/StudioWorkspace.tsx
diff -u ../tmp/studio-real-loop/b-round-33-snapshots/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

If the server is up, A may do one browser smoke check (`a-browse.json`): a real click on the search, type `ab`, a real click on a clip, Backspace, and the clip is deleted with the search text unchanged. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, write that into the report and do the offline items (G34-1/2, R34-S, R34-U, R34-Doc). Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-34.md`:**
1. the pre-flight gate, including the §1.4 grep results;
2. the red-first output, then the green output;
3. the diff summary per file (hunk purposes);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails, including the `node.exe` count;
6. deviations and the §2.4 self-check results.

Do not claim PASS.

**C → `c-round-34.md` and `c-round-34.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (with the reason);
- the R34-TS and R34-CG tables with `activeElement`, search value and history tail;
- the R34-SB geometry;
- the hook counts;
- the mutation table;
- the record-only results;
- the Ableton two-verdict table (§4.6);
- the gates;
- the C-R23-01 record;
- the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **C-R23-01** as soon as the Tech Lead answers. **C-R27-01** when the Tech Lead's quiet-Chrome result arrives.
- **Round 35 — SRW-13 stage 4b** (fader UX for Volume, Master and Pan): no jump to the click point; double-click reset (Live §18.1); per-key entry coalescing; A-R29-REVIEW-1; the pending-commit order; MASTER-HOLD-TICK-EDGE; A-R31-REVIEW-2; A-R32-REVIEW-1; A-R33-REVIEW-TOUCH; the stale refusal status.
- **Round 36:** stage 4c (round-9 M1/L8), then polish (C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE).
- **Then:**
  - SRW-14 (FB-13) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06, including the edge fades) → SRW-19 (FB-07);
  - SRW-20;
  - R26-M1 hardening;
  - the SRW-21 adapter;
  - the full regression and the root check;
  - then T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 34 -StartPhase A` and a higher limit.
