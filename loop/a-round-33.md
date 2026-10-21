# A — Round 33 report: C-R32-01 (a timeline click releases fader focus)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-13 · Decision: D-29x · Task: `current-task.md` (round 33).
**No PASS is claimed.** C verifies. No commit, push, stash, install or server start/stop.

## 1. Pre-flight gate

**Read before editing:**
- `.claude/rules/read-primitives.md`;
- the primitives `AGENT_DISCOVERABLE_CODE`, `TESTING_QUALITY_GATES` and `GEORGIAN_DOCS`, read in full before editing;
- `AUDIO_ARCHITECTURE`: lines 1–80 read before editing, the full text delivered by the hook at the first edit;
- `FORWARDREF_COMPONENT`, `DESIGN_TOKENS` and `TAILWIND_FIRST`: delivered in full by the hook at the first `StudioWorkspace.tsx` edit;
- `BUG_HUNTING_TESTS`: lines 1–60 read before editing, the rest after implementation (before this report);
- `REACT_CONTEXT`: read only after implementation (before this report). No context code changed this round;
- deviation: the new tests do not use the `_REGRESSION` name suffix from `BUG_HUNTING_TESTS`. They follow the existing `fader-guards.test.tsx` naming style, and they are red-first acceptance tests (§2);
- `prompts/studio-feature.md`, the `pre-flight` skill and `.claude/commands/check.md`.

**Baseline (before any edit):**
- HEAD `1cefea18500ac98c523caae6bf9626c811254b9e` (= `1cefea1`). Root has not committed.
- `git status --short` gives the 9 baseline lines.
- `sha256sum -c b-round-32-tree-sha256.txt | grep -vc ': OK$'` → `0`.
- Snapshot shas match: StudioWorkspace `0bf51b45`, fader-guards `c7b071e8`, doc 036 `4aede19f`.
- Protected files 4/4 OK.
- `node.exe` count: 7.
- `GET /studio-lab` → 200.

**Assumptions:**
1. The fix is the B-specified blur, applied in the capture phase on the scroller.
2. Master and Zoom render outside the scroller, but they are still blurred when the pointerdown lands inside it.
3. `isRangeInputTarget` returns `boolean`, not a type predicate, and it is frozen. So I added `focused instanceof HTMLElement` purely for type narrowing.

**Simplicity:**
- React `onPointerDownCapture` plus one `useCallback` (16 lines). No native listener, so there is no effect or cleanup.
- Cut: no button filter, no text-field handling, no outside-scroller handling (all out of scope).

**§1.4 grep — pointerdowns inside the scroller that call `preventDefault()`:**

| Handler | File:line | `preventDefault` | Focuses itself afterwards |
|---|---|---|---|
| clip `beginGesture` (header, body/range, trims) | `ArrangementClip.tsx:228` | yes (+ `stopPropagation`) | no |
| lane background `handleLaneBackgroundPointerDown` | `StudioWorkspace.tsx:~908` | yes | no |
| ruler `handlePointerDown` | `ArrangementRuler.tsx:320` | yes | no |
| height handle `handleHeightPointerDown` | `ArrangementLane.tsx:421` | yes (+ `stopPropagation`) | no |
| playhead `handlePlayheadPointerDown` | `ArrangementRuler.tsx:127` | yes | yes, `:138` |
| loop brace | `ArrangementLoopBrace.tsx:68` | yes | yes, `:91` |

This matches B's list. The other `preventDefault` calls in `ArrangementLane.tsx` (170/209/228/236/371/380/389) belong to drag/drop and key handlers, not to pointerdowns.

**§1.4 grep — existing tests that assert `document.activeElement` after a pointerdown in the timeline:**
- `detail-panel-polish` 295/315/326 (detail inputs);
- `export-dialog-focus` (dialog);
- `fader-guards:312` (playhead `.focus()`);
- `floating-video` 703–725 (video dock);
- `track-layout:1117` (separator key);
- `track-pan:780` (Pan reset **click** → the slider has focus).

None of them expects a fader to keep focus after a pointerdown on a non-range timeline element. **No contract conflict.**

## 2. Red-first, then green

Red: 13 new tests against the unchanged `StudioWorkspace.tsx` (sha `0bf51b45`). Full output in `a-round-33/red.txt`. Result: `Tests 10 failed | 22 passed (32)`.

| # | Case (§2.3) | Snapshot result | Why |
|---|---|---|---|
| 1a–d | Volume / Pan / Master / Zoom → clip header → Delete | **fail** | `expected <input type="range"> not to be <input type="range">`: the fader keeps focus |
| 2 | Volume → lane body → header → Delete | **fail** | same |
| 3 | Volume → clip body | **fail** | same |
| 4 | Volume → ruler → Delete | **fail** | same |
| 5 | pending Volume → header → Delete | **fail** | `expected null to be 'Volume'`: no commit before the clip gesture |
| 6 | Volume → header → ArrowRight | **fail** | `expected true to be false`: the key is not handled |
| 7 | pointerdown on the focused Volume itself | green (exclusion) | |
| 8 | Pan drag id 41 + header id 42 | green (exclusion; decision-3 oracle) | |
| 9 | plain Pan blur, no suppression | **fail** | its `not.toBe(pan)` focus-release assertion; the suppression part is the exclusion |
| 10 | round-32 regression (Delete on a focused Volume) | green (regression pin) | |

Green after the change: `a-round-33/green.txt`, **`Tests 37 passed (37)`** (19 existing + 18 new).

The 18 new tests are the 13 above plus:
- 3 §2.4 self-checks;
- 2 tests added after the review: the pending Master → header → Delete order, and Pan-reset blur/refocus.

These 5 were added after the change and were **not** run on the snapshot. By reading the code, the two review tests would fail there (no Master commit; `not.toBe(pan)`). That was not executed: mutation runs are only allowed outside `store/`, and I did not build a scratch vitest environment.

Enter and Home after a fader → clip click have no unit test. B's §2.3 list does not require them, and C checks them in R33-KO.

The ruler click **keeps** the selection (`['s1']`), so case 4 asserts the deletion itself.

## 3. Diff summary (saved as `a-round-33/diff-*.txt`)

- **`app/components/arrangement/StudioWorkspace.tsx`** (+16 lines, 0 removed; two hunks):
  - **Hunk 1** (after the marquee-cleanup effect) adds `releaseFaderFocusOnTimelinePointerDown`. It is a `useCallback` with `[]` deps that reads `event.currentTarget.ownerDocument.activeElement`. It calls `blur()` only if:
    - that element is an `HTMLElement` **and** `isRangeInputTarget(focused)`;
    - **and** `!isRangeInputTarget(event.target)`;
    - **and** `!workspaceRef.current.isPointerGestureActive()`.

    It does no `preventDefault`, `stopPropagation`, focus move or status.
  - **Hunk 2** adds `onPointerDownCapture={releaseFaderFocusOnTimelinePointerDown}` on the `scrollerRef` div.
  - The keydown handler, the round-32 guard, `isSliderTarget`, `isRangeInputTarget`, `handleLaneBackgroundPointerDown` and every other branch are unchanged. Every snapshot line is still present. Lines shift by +15 between the two hunks (the keydown handler included) and by +16 after hunk 2.
- **`app/lib/arrangement/__tests__/fader-guards.test.tsx`** (append only, 0 removed lines):
  - The new describe `'a timeline pointerdown releases fader focus (C-R32-01)'` is placed **inside** the outer describe, so the existing `beforeEach` stubs apply.
  - The first 550 lines are byte-identical to the snapshot (`diff` of `head -n 550` is empty). No existing helper changed.
  - New local helpers:
    - `stubTimelineCapture` (the gesture-guard pattern);
    - `timelineParts`: clip root/header/body, the SFX lane body via the fold button's `aria-controls`, and the ruler;
    - `pressOnFocused`: the key is dispatched on `document.activeElement`, which makes the red-first evidence genuine;
    - `clickClipHeader`.
- **`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`**:
  - The header status line now names round 33 / D-29x.
  - New section `## Round 33 — timeline-ზე click fader-იდან focus-ს აშორებს`. It covers:
    - the bug, its cause, and why the round-32 tests missed it;
    - the rule (3 conditions, any button), with coverage and non-coverage (outside the scroller; FOCUS-TEXT-STALE);
    - the reviewer's Low residuals (scrollbar, touch scroll);
    - the pending-commit order, and Arrow/Enter/Home;
    - decision 5 (A-R32-REVIEW-1 → 4b);
    - the **mutation (d) wording correction**: test 391 does not protect the pointerup clear, because its id-43 pointerdown clears the suppression anyway. Test 445 (window `pointerup` 41 → change → entry) protects the pointerup clear, and test 409 protects the pointercancel clear;
    - the tests, the jsdom limitation, the C IDs and the Ableton note (unconfirmed; §18.1 is silent).
  - Earlier sections are not rewritten. The only removed line is the old header status line.

## 4. Code review (real `code-reviewer` subagent)

Verdict: 8.5/10, no Critical or High findings.

| Finding | Severity | Disposition |
|---|---|---|
| A click on the scroller's own scrollbar (`target === scroller`) now blurs; browsers don't do that | Low | **Documented** in doc 036 as a residual for B. The code is unchanged because the spec covers the whole scroller. B decides whether to exclude `event.target === event.currentTarget` later. |
| A touch-scroll on the timeline blurs on pointerdown (a pending preview commits early) | Low | **Documented** as a residual. |
| The doc doesn't say that any button releases focus | Low | **Fixed** (doc sentence added; the code correctly ignores `button`). |
| Test gap: pending Master → timeline click | Low | **Fixed**: new test `review: a pending keyboard Master preview…` |
| Test gap: Pan readout reset (blur, then refocus) | Low | **Fixed**: new test `review: the Pan readout reset…` |
| Test gap: pending Volume → clip **drag** | Low | Not added. The commit happens at pointerdown, before the drag (case 5 pins that). C covers drags in R33-K. |
| The cross-fader self-check doesn't assert focus | Nit | **Fixed**: it now asserts `activeElement === musicVolume` after the SFX Volume pointerdown. |
| The redundant `instanceof HTMLElement` check | Nit | Kept. It is needed for TS narrowing, because `isRangeInputTarget` is frozen and returns `boolean`. |
| jsdom proves the blur, not the real-browser cause | Nit | **Fixed** (doc note). The cause relies on C's real-click reproduction. My smoke check below adds one real-browser data point. |

The reviewer also confirmed:
- React capture ordering runs before the clip's and height handle's `stopPropagation`;
- the pending commit lands in `historyRef.current.present` before `beginGesture` reads `getArrangement()`;
- the counts in the doc and the accuracy of the mutation (d) correction.

## 5. Command tails (all run by A)

```
$ git rev-parse HEAD
1cefea18500ac98c523caae6bf9626c811254b9e
$ sha256sum -c ../tmp/studio-real-loop/b-round-32-tree-sha256.txt | grep -vc ': OK$'
0            (376 OK)
$ npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
      Tests  37 passed (37)
$ npx vitest run <10 frozen files: track-pan, delete-selection-ui, detail-panel, clip-gain, all-lane-clipboard, track-layout, gesture-guard, master-ui, ArrangementContext, render-budget>
 Test Files  10 passed (10)
      Tests  206 passed (206)
$ npx tsc --noEmit
tsc exit 0
$ npx vitest run
 Test Files  69 passed (69)
      Tests  1230 passed (1230)        (1212 baseline + 18 new)
$ npm run build
✓ built in 3.40s   build exit 0
$ npx biome check ./app
Found 2 errors.  Found 218 warnings.  Found 1 info.
  errors = format (CRLF) on app/lib/auth.ts and app/lib/__tests__/bug-hunting/auth-bugs.test.ts (root's baseline; untouched)
$ npx biome check --write <StudioWorkspace.tsx, fader-guards.test.tsx>
  formatting of the new test lines only (pre/post copies in a-round-33/); final run: "No fixes applied"
$ git status --short
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/graph.client.ts
 M app/lib/arrangement/model.ts
 M app/types/arrangement.ts
?? app/lib/arrangement/__tests__/fader-guards.test.tsx
?? app/lib/arrangement/__tests__/track-pan.test.tsx
?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
   (= the 9 baseline lines)
$ protected-baseline.json check
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ tasklist | grep -ci node.exe
7 (start) · 6 (final gate start) · 8 (after the gates) · 8 (end)
```

Outputs are saved in `a-round-33/`:
- `red.txt`, `green.txt`, `frozen.txt`;
- `tsc.txt`, `vitest-full.txt`, `build.txt`, `biome-app.txt`;
- the `node-count-*.txt` files and the `diff-*.txt` files.

There was an earlier full run before the review tests were added: 1228/1228, build OK, and the same Biome numbers.

Not run: `npm run verify` and `npm run test:e2e:smoke` (the /check skill's full form). Per B's §2.4/§5, I ran Biome scoped to my files, then a read-only `./app` check, tsc, the full vitest and the build. Root runs the repository-wide gate.

## 6. Deviations and self-check

**Deviations:**
- `focused instanceof HTMLElement` was added next to `isRangeInputTarget(focused)`. This is required for TS strict, and `isRangeInputTarget` stays unchanged.
- 18 new tests instead of the minimum 11. 5 of them were added after the change (3 self-checks and 2 from the review); they are labelled in §2.
- No Enter or Home unit test (C checks them in R33-KO).

**§2.4 self-check:**

| Check | Result |
|---|---|
| A clip drag started while Volume is focused moves the clip and writes one entry | **Unit test green.** s1 4 → 5 after a 1 s drag, 1 entry, focus released. |
| A marquee started while Master is focused | **Not unit-tested.** The marquee needs lane/clip rect stubs. Code path: the capture blur runs first, then `handleLaneBackgroundPointerDown` runs unchanged. Case 2 shows a lane-body pointerdown/up completes with no gesture left. → C, R33-K. |
| A Volume drag on another track's Volume while the music Volume is focused | **Unit test green.** One `Volume` entry; music stays 0.6; the music Volume is **not** blurred by the new code (condition 2). |
| Provider unmount | N/A. A React prop, not a native listener, so there is nothing to remove. |
| Backspace in the library search still edits text | **Unit test green.** The key is not prevented, the focus stays on the search box, and the clips and history are unchanged. |
| Pan reset (§4.4 last bullet) | **Unit test green** (review). The pointerdown blurs Pan; the click resets to C (one entry) and focuses the slider again. The frozen `track-pan` readout test is also green. |

**Browser smoke check** (one run, not a PASS claim; output in `a-round-33/smoke.txt`):
- Setup: gstack browse, own state `a-browse.json`, wrapper `a-round-33/b.sh`, the running :5173, 1440×900.
- Placed `Soft impact` (it landed on music) with a library click and a real Enter.
- Real click on `Volume — მუსიკა` → active = that Volume. The click wrote `Undo: Volume` (0.5): the known jump to the click point, which is stage 4b.
- Real click on the clip header → active = **BODY**.
- `press Delete` → clips `[]`, `Undo: კლიპის წაშლა`.
- `Control+z` restores the clip.
- Console: only the known anonymous `/api/cart` connection-refused errors.
- The first browse start timed out twice under the vitest load; the run after that worked.

## 7. Known gaps and the next C checks

**Known gaps:**
- The reviewer's Low residuals: scrollbar click and touch scroll (doc 036; B decides).
- FOCUS-TEXT-STALE is not touched (record only).
- Clicks outside the scroller are unchanged.
- Marquee, Enter and Home after fader → clip have no unit test.

**Exact next C checks:**
- R33-FT (real clicks, the full fader × target table, Delete and Backspace, steps B/C/D of `dk-focus-retention.txt`, and the round-32 must-not-edit rows);
- R33-KO (pending Volume/Master order; ArrowRight, Enter, Home);
- R33-G (synthetic Pan/Volume drag exclusions with the `setTargetAtTime` hook, same-fader and other-fader pointerdowns, no new suppression);
- R33-K (drag/trim, marquee, lane click, ruler seek/scrub, loop brace focus, playhead focus + Delete, Space, fader key steps, Pan reset refocus);
- §4.5 record-only;
- R33-S (`diff -u` against the snapshots);
- R33-U (mutations a–f in a scratch copy);
- R33-Doc;
- G33-1/2/3.

**Scope completed (A):**
- §2.1 implemented;
- §2.2 written;
- §2.3 written red-first; all 37 tests green;
- §2.4 self-check, Biome, review and commands done.

B's acceptance criteria are C's to mark; I mark none as passed.

**Root and carried items** (from `root-pre-push-review.md`, `publication-checkpoint.json` and `b-round-32.md` §7, unchanged by this round):
- SRW-21: the purchased loader hardcodes middle-east;
- Lenis on `/studio/*`;
- portable instruction paths;
- the export hard-clip at 0 dBFS;
- the CRLF Biome errors on the auth files;
- the `frontend-architect.md` Write/Bash grant;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the fake Bearer gets 500;
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability.

**Commit readiness:** for root, after C passes round 33. Rounds 31+32+33 can go together, because `ArrangementLane.tsx` and doc 036 contain more than one round's changes.
