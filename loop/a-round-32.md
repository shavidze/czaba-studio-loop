# A — Round 32 report (C-R31-02, C-R31-01, R31-U-GAP-B2; D-29w)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-13 · No commit/push/deploy. No PASS claimed — C decides.
Gate output: `a-round-32/` (red-first.txt, green.txt, adjacent.txt, tsc.txt, vitest-full.txt, build.txt, biome.txt, biome-errors.txt, static-gates.txt, diff-*.txt, smoke-volume-delete.txt, b.sh).

## 1. Pre-flight gate

**Baseline (before any edit):**
- HEAD `1cefea18500ac98c523caae6bf9626c811254b9e` (root had not committed round 31).
- `git status --short` = the 7 round-31 lines exactly.
- `sha256sum -c b-round-31-tree-sha256.txt` → 375 OK, 0 not-OK.
- Owned files vs snapshot: StudioWorkspace `d993cc97…`, ArrangementLane `718e0ca3…`, doc 036 `b8dfb711…` — all identical.
- Protected 4/4 OK. `node.exe` = 7.
- Pre-existing `a-round-32-prompt.txt` / empty `a-round-32-result.json` (runner files); no prior A work for round 32 existed.

**Read:** read-primitives rule; primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS (+ DESIGN_TOKENS/TAILWIND_FIRST injected by hook); `prompts/studio-feature.md` (cleanup/checklist); `skills/pre-flight`. No `/check` skill exists in store `.claude/skills/`; applied as Biome on owned paths + read-only `./app` per B.

- Assumptions: (1) the guard is native `input[type=range]` only, in the non-modifier Delete/Backspace branch, after the gesture-blocked branch (so that branch is unchanged); (2) "ignore" means no draft/preview/entry until the same pointer's window pointerup/pointercancel or a new successful Pan pointerdown; (3) the context does not expose `history.past`, so "past length unchanged" is checked by `arrangement` identity + `undoLabel` + a final undo-chain walk (`undoChainLabels`) with a sentinel entry (`Mute — ვიდეო`). **This is a proxy, stated here.**
- Smallest version: ~7 lines in StudioWorkspace, ~30 lines in the lane, one test file.
- Files: StudioWorkspace (§2.1 guard), ArrangementLane (§2.2), doc 036 (§2.4), new `fader-guards.test.tsx` (§2.5). Nothing else.
- Success: new file green, red-first on snapshot as predicted, frozen adjacent tests green, tsc 0, vitest 1193+17, build ✓, Biome = 2 baseline errors / ≤218 warnings, git status 9 lines.

### §1.4 Delete/Backspace tests (contract-conflict check)

| File | What presses Delete/Backspace | Focused target | Expects deletion? |
|---|---|---|---|
| `track-pan.test.tsx` l.822–831 | Delete, Backspace | Pan `input[type=range]` | **No** (consistent) |
| `clip-gain.test.tsx` l.797–798 | Delete, Backspace | Clip Gain number field | No |
| `delete-selection-ui.test.tsx` l.410–430 | Delete/Backspace ± Shift | `document.body` | Yes (gap) |
| `delete-selection-ui.test.tsx` l.467–485 | Backspace/Delete | detail number input, library search, body w/o selection | No |
| `detail-panel.test.tsx` l.422–428 | Delete (among others) | detail number inputs | No |
| `all-lane-clipboard.test.tsx` l.490/501 | — (hint text only) | — | — |
| `ArrangementContext.test.ts` l.523 | — (test title "Delete Time") | — | — |
| `transport.test.ts` l.93 | — (test title "Delete Time") | — | — |

**No frozen test expects Delete on a focused `input[type="range"]` to delete. No contract conflict.**

### §1.4 `syncPlayback(` call sites — enumeration (R31-U-GAP-B2)

Question per row: can it run with `gestureCountRef.current > 0` **and** take the non-reschedule branch? Second column: can that happen while `panOverrideRef` is non-null (= a Pan gesture is the active gesture)?

| Line | Caller | During gesture & non-reschedule? | …with Pan override set? |
|---|---|---|---|
| 920 | `resyncLoopRef` (tick, loop fill) | `force=true` → always reschedules | n/a (reschedule; `startGraph` honours override) |
| 963 | `applyEdit` | only via callers below | see callers |
| — | applyEdit callers with `refuseEditDuringGesture` / `gestureCount` guard (add, drop, loop toggle, split, delete, duplicate, cut, cutTime, paste, mute, solo, setTrackPan, master mute, clip gain, commitTrackVolume, commitMasterGain) | No (refused) | No |
| 1486 | `stepLoopRange` (loop-brace keyboard, **unguarded**) | can run during a gesture, but `next !== arrangement` means the loop changed → `scheduleKey` changed → reschedule | No non-reschedule |
| 1504/1522 | `nudgeSelectedClip` (workspace arrows) | arrows are caught by the gesture-blocked branch first; moves change clips → reschedule anyway | No |
| 1985 | `runVideoImport` | `stopPlayback()` first when playing → `syncPlayback` returns early; clip append → reschedule | No |
| 1309 | `commitArrangement` (clip drag ends ArrangementClip l.488/505; loop brace) | only inside that component's own gesture; only one active gesture (`claimPointerGesture` refuses a second pointer id) | No (override null — Pan not active) |
| 1452 | `previewLoopArrangement` | loop-brace gesture only (incl. its abort `endStaleLoopGesture`, which runs inside a same-pointer claim's `active.abort()` before Pan begins) | No (override null) |
| 1463 | `commitLoopRange` 2nd sync (always non-reschedule after applyEdit's sync) | brace calls `gesture.release()` **before** `commitLoopRange` → count 0 | No |
| 1824 | `restoreHistory` (undo/redo) | undo/redo refuse at count > 0 | No |
| 1893 | `decodeVideoSourceAudio` | `force=true` | n/a (reschedule) |
| 2068 | `previewTrackVolume` | only for the own Volume gesture's track; otherwise refused | No (Volume gesture active ⇒ Pan not) |
| 2078 | `revertTrackVolumePreview` | **Yes**: Volume cancel / claim abort runs it before `release()` | No (Pan not active; same-pointer Pan claim aborts Volume *before* Pan sets anything) |
| 2319 | `previewMasterGain` | own Master gesture only | No |
| 2329 | `revertMasterGainPreview` | **Yes** (same as 2078) | No |

**Result:** non-reschedule syncs during *some* gesture exist (2078, 2329), but **none can run while the Pan override is set**: the override exists only while the Pan gesture is the single active gesture; `claimPointerGesture` refuses other pointer ids and a same-pointer claim aborts Pan (override cleared) first; edits/undo are refused; the remaining unguarded paths reschedule (`startGraph` honours the override — round-31 mutation (h)). So the non-reschedule override term is unreachable today. **No reachable path → `ArrangementContext.tsx` untouched.** Decision 4 confirmed, with the refinement above (B's "none can run during a gesture" is broader than the code; the precise statement is "none with the Pan override set").

## 2. Red-first, then green

**Red on the unchanged (snapshot) sources** — `a-round-32/red-first.txt`: 9 failed | 8 passed (17).

| Test | Snapshot | Why |
|---|---|---|
| Delete/Backspace on musicVolume | **red** | `fireEvent.keyDown` returned false (workspace preventDefault + delete) |
| … sfxVolume | **red** | same |
| … master | **red** | same (`ArrangementMaster` has no onKeyDown) |
| … zoom | **red** | same (`ArrangementTransport` has no onKeyDown) |
| … pan | green (expected) | deviation 1 `stopPropagation` still present |
| positive control `document.body` | green (expected) | |
| playhead `role="slider"` still deletes | green (expected) | ruler handler returns early for non-arrow keys |
| Pan Delete reaches a window listener | **red** | `expected [] to deeply equal [...]` — stopPropagation hid it |
| gesture-blocked branch (information) | green (expected) | |
| blur-continue: nothing written | **red** | slider `-40` instead of `10` (post-blur inputs became entries) |
| fresh drag after release → 1 entry | **red** | post-blur input already made a `Pan` entry |
| pointercancel then key → 1 entry | **red** | same |
| new pointer 42 while suppressed | **red** | same |
| Volume blur-continue reference | green (expected: freezes today) | |
| Home on Volume/Master | green (coverage) | |
| pending Volume → Pan order | green (coverage) | |
| pending Master → Pan order | green (coverage) | |

**Green after the fix** — `a-round-32/green.txt`: `Tests 17 passed (17)`.

## 3. Diff summary per file

- **`StudioWorkspace.tsx`** (+7): hunk 1 adds `isRangeInputTarget` after `isSliderTarget` (no change to `isSliderTarget`); hunk 2 returns before `preventDefault`/`deleteSelection` in the non-modifier Delete/Backspace branch when the target is a native range. All other branches byte-identical.
- **`ArrangementLane.tsx`** (+29 / −7): new ref `panBlurSuppressionCleanupRef`; unmount effect next to the existing pan effect; `suppressPanPointerAfterBlur(pointerId)` (window pointerup/pointercancel for that id clears it); `handlePanPointerDown` clears suppression after a successful `beginTrackPanGesture`; `handlePanChange` returns early while suppressed; `handlePanBlur` captures `panDragPointerRef.current` and suppresses before the existing cancel+cleanup; removed `handlePanKeyDown` and the Pan input's `onKeyDown`. `KeyboardEvent` import stays (fold/height handlers use it). Row 2, meter, fold, height handle untouched.
- **doc 036**: header status line updated; appended `## Round 32 — fader-ის კლავიშები და blur-ის შემდეგ drag` (C-R31-02, C-R31-01, R31-U-GAP-B2, tests, Ableton note). Earlier sections untouched.
- **`fader-guards.test.tsx`** (new, 19 `it`; 17 red-first + 2 post-review): real `StudioWorkspace` + `ArrangementProvider`, fixture video+music+SFX with a clip each (L32-like starts 0/7/4), SFX clip selected.

## 4. Code-reviewer

Ran the actual `code-reviewer` subagent (read-only; it had no shell, so it compared files by reading them and did not run tests). Score 8/10, no Critical/High.

| # | Severity | Finding | Disposition |
|---|---|---|---|
| 1 | Medium (contract gap) | Suppression can stay on if the held button is released outside the window, so no pointerup/pointercancel arrives for that id. While it is on, Pan keyboard changes are dropped silently. Suggested fix: clear it in a Pan `onKeyDown`. | **Not fixed. Reported to B as `A-R32-REVIEW-1`.** The fix would add a Pan `onKeyDown` (§2.2 / decision 2 removes it) and change the §0 contract ("every further input is ignored … until that pointer's pointerup/pointercancel"). It is documented as a residual risk in doc 036. Mitigation: a mouse pointer id is normally constant, so any later click with the same id, or a new successful Pan pointerdown, clears it. A touch/pen id may never return. |
| 2 | Low | No test for a refused pointerdown while suppressed | **Fixed:** new test "a pointerup of another pointer and a refused pointerdown keep the suppression" |
| 3 | Low | No test for unmount with a pending suppression | **Fixed:** new test "unmounting with a pending suppression removes its window listeners" (spies on add/removeEventListener) |
| 4 | Low | No test that another pointer's pointerup keeps the suppression | **Fixed:** covered by the test from #2 (pointerup id 99) |
| 5 | Low (doc) | Old TODO line l.185 (Volume Delete deletes) is stale | **Fixed** by appending inside the Round 32 section ("closed by C-R31-02"). l.185 is not edited (append-only). |
| 6 | Low (doc) | Stuck-suppression risk not documented | **Fixed:** residual-risk paragraph added to the Round 32 section |
| 7 | Nit | Delete on Pan during its own drag now shows the gesture-blocked status (before, `stopPropagation` hid it) | Accepted. This is the §0 gesture-blocked row (unchanged branch). Tested on Volume only. |
| 8 | Nit | Tests use `change`; real drags fire `input` | Accepted. React handles both through `onChange`. |

The reviewer confirmed that the closure/ref identity pattern is safe, that the controlled snap-back is correct, and that the failed-pointerdown path keeps the suppression. After the fixes, `fader-guards.test.tsx` has **19** `it`, all green (`a-round-32/green-after-review.txt`). The two new tests were written after the fix, so they are not red-first. By reading the code, each one would fail if the pointer-id check were dropped from the release listener or if the unmount effect were removed. **A did not run these mutations.**

## 5. Command tails (verbatim)

```
$ git rev-parse HEAD
1cefea18500ac98c523caae6bf9626c811254b9e            (start and end)
$ sha256sum -c ../tmp/studio-real-loop/b-round-31-tree-sha256.txt | grep -vc ': OK$'
0
$ npx vitest run app/lib/arrangement/__tests__/fader-guards.test.tsx
 ✓ app/lib/arrangement/__tests__/fader-guards.test.tsx (17 tests) 838ms
 Test Files  1 passed (1)
      Tests  17 passed (17)
$ npx vitest run <the 10 frozen adjacent files>
 Test Files  10 passed (10)
      Tests  206 passed (206)
$ npx tsc --noEmit
tsc exit 0
$ npx vitest run            (before review fixes)
 Test Files  69 passed (69)
      Tests  1210 passed (1210)        (1193 + 17)
$ npx vitest run            (FINAL, after review fixes; a-round-32/vitest-full-final.txt)
 Test Files  69 passed (69)
      Tests  1212 passed (1212)        (1193 + 19)
$ final re-run: build exit 0 · tsc 0 · Biome ./app: 2 errors (same auth CRLF) / 218 warnings / 1 info · git status 9 lines · tree-not-ok 0 · protected 4/4 OK · HEAD 1cefea1 · node.exe 7
$ npm run build
build exit 0 … ✓ built in 2.21s
$ npx biome check --write <3 owned code files>
Checked 3 files in 42ms. No fixes applied.
$ npx biome check ./app
Checked 338 files in 468ms. No fixes applied.
Found 2 errors.      (app\lib\auth.ts format, app\lib\__tests__\bug-hunting\auth-bugs.test.ts format — baseline CRLF, root's)
Found 218 warnings.
Found 1 info.
$ git status --short          (9 lines)
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/graph.client.ts
 M app/lib/arrangement/model.ts
 M app/types/arrangement.ts
?? app/lib/arrangement/__tests__/fader-guards.test.tsx
?? app/lib/arrangement/__tests__/track-pan.test.tsx
?? docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
$ protected
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ tasklist | grep -ci node.exe
7 (baseline) · 6 (before/after full vitest) · 7 (end, gstack browse server added)
```

**Browser smoke (A, not a PASS claim)** — gstack `/browse`, own state `a-browse.json`, wrapper `a-round-32/b.sh`, running server :5173, 1440×900. Placed `Middle East` on music via library click + real Enter; real click on the clip; focus music Volume → real `press Delete`, `press Backspace` → clip stays, Undo title unchanged, value `1`; focus music Pan → `press Delete` → clip stays; blur → `press Delete` → clip deleted (`Undo: კლიპის წაშლა`); `Control+z` restores. Console: only the known anonymous `/api/cart` connection-refused errors. Output: `a-round-32/smoke-volume-delete.txt`.

## 6. Deviations and §2.6 self-check

**Deviations:** none from §2.1/§2.2. Notes:
- The suppression keeps one ref (the cleanup function; the pointer id lives in its closure) instead of a separate `panCancelledPointerRef` — B's name was "for example"; the grep-friendly name is `panBlurSuppressionCleanupRef` / `suppressPanPointerAfterBlur`.
- Test count 19 (≥12): 17 red-first plus 2 added after the review. Extra case: the gesture-blocked branch on a focused Volume (information row of §0).
- History-length proxy as stated in §1.
- Mutation checks were not run by A (optional for A; C runs (a)–(g) + b2 in a scratch copy).

**Self-check:**
- Blur during a Pan drag while playing: covered by the blur-continue test (playing; panner gets −0.2, −0.4, then the 0.2 revert, and nothing after) — green.
- pointercancel after a blur clears the suppression: covered ("after a pointercancel … one keyboard-style change gives exactly one Pan entry") — green.
- Provider/lane unmount with a pending suppression: the new unmount effect removes both window listeners. Covered by the post-review unmount test (green).
- Delete on a focused range during a clip/other gesture: the gesture-blocked branch runs first, unchanged — covered (status = `GESTURE_EDIT_BLOCKED_MESSAGE`, no entry).
- Backspace in the library search still edits text: `isTypingTarget` returns first; frozen `delete-selection-ui` l.467 green.
- Keyboard change while suppressed (focus returned while the button is still held): ignored until release — intended by the contract ("every further input is ignored … until that pointer's pointerup/pointercancel").
- A failed Pan pointerdown (another gesture owns a different pointer) does not clear suppression (clear only after `beginTrackPanGesture` returns true).

## 7. Known gaps / next C checks

- **Known gaps:** **A-R32-REVIEW-1** (suppression can stay on after an out-of-window release; Medium per the reviewer, needs B's contract decision); real-Chrome behaviour of range `input` after blur with the button held remains Tech Lead R31-T; history length measured by proxy; A did not run mutations.
- **Harness notes for C:**
  - The Volume reference test, the fresh-drag test and the id-42 test release with an **element** `pointerUp`, which fires the lane's `onPointerUp`. The blur-continue tests release with a window `pointerup`.
  - If C's `vol-blur-continue` sends only a window pointerup, the Volume entry may come later (at the next flush), not at release. Reconcile the harness first; this is not a bug.
  - The A smoke used a `Middle East` music clip, not the L32 layout.
- **Information row (reviewer #7):** Delete on Pan **during its own drag** now shows `GESTURE_EDIT_BLOCKED_MESSAGE` (the unchanged gesture-blocked branch). Before, deviation 1's `stopPropagation` kept it silent. Expected; not a regression.
- **Exact next C checks:** R32-DK (5 controls must-not-edit, body/clip/playhead must-delete, overview/library-preview record-only, gesture-blocked info, SRW-24 range/Ctrl+Shift+L/Ctrl+Shift+X, re-run `runs/volume-delete-key.txt`); R32-BC (`pg.js blur-continue` + setTargetAtTime hook, pointercancel, id 42 while suppressed, `vol-blur-continue` = 1 entry); R32-K; R32-S (diffs in `a-round-32/diff-*.txt`); R32-U mutations (a)–(g), b2 expected to survive; R32-Doc; G32-1..3.
- **Carried for C/B (root-pre-push-review / publication-checkpoint, unchanged by this round):** SRW-21 middle-east hardcode, Lenis on `/studio/*`, portable instruction paths, export hard-clip at 0 dBFS, second-remote reconcile, CRLF Biome errors on auth files, `frontend-architect.md` Write/Bash grant, `Modal.tsx` focus gap, GA `scroll` with consent denied, fake Bearer 500, CDP allowlist, `Content-Type` charset, dev-server availability. Round 31's 7 files + this round's 2 new lines are ready for root's checkpoint after C.

## Scope completed (B acceptance this A run can truthfully claim)

- §1 pre-flight, baseline, §1.4 tables — done.
- §2.1, §2.2, §2.3 (enumeration, no code), §2.4, §2.5 (17 tests, red-first shown) — done.
- §2.6: Biome scoped + read-only, tsc, full vitest, build, smoke and the real code-reviewer are done; findings 2–6 fixed and #1 reported (§4).
- R32-DK/BC/K/S/U/Doc and G32-1..3 are **C's**; not claimed here.
