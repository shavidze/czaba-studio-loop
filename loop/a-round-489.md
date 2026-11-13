# A round 489: SABA-B-17-ENTRANCE-3-4S (byte-equal apply of B's sketch v3)

## STOP — needs B ruling on A-R489-REVIEW-NONZOOM-CLASSIFY (Medium, origin: A's code-reviewer)
- **Finding.** In the covering tests, the non-zoom side of the scroll-skip classifier is never exercised with a real event.
  - `dispatchScrollGesture` (`store-entrance-loader.test.tsx:62-64`) dispatches a plain `new Event(type)`. It has no `ctrlKey` and no `touches`, and it is not a `WheelEvent` or `TouchEvent`. S1, S2 and E8c therefore never reach `isZoomGesture`'s `WheelEvent`/`TouchEvent` branches with a non-zoom event (`SpotlightLoader.tsx:54-59`), or the boot script's `e.ctrlKey` / `e.touches` checks with a non-zoom event (`EntranceCover.tsx:41`).
  - An over-broad zoom classifier therefore stays green. That is the very defect this round fixes: the page scrolls under the cover.
- **Measured by A on a scratch copy** (`/tmp/a489-mut`, node_modules symlinked; never on `store/`). Each mutant was applied alone to the sketch-applied source, and `store-entrance-loader.test.tsx` was run.
  | Mutant | Change | Result |
  |---|---|---|
  | MA | overlay: `if (event instanceof WheelEvent) return true;` (any wheel = zoom) | **61/61 green (survives)** |
  | MB | overlay: `event.touches.length >= 1` (one-finger swipe = zoom) | **61/61 green (survives)** |
  | MC | boot: `e.touches.length>=1` | **61/61 green (survives)** |
  | MD | boot: `if(!e.ctrlKey&&!e.deltaY&&…)` (any real wheel = not blocked) | **61/61 green (survives)** |
  - **Positive controls in the same scratch:** B's M20 went red (2 failed / 59 passed) and B's M18 went red (1 failed / 60 passed), so the scratch tests run against the scratch source.
  - Every mutant's diff and test output: `a-round-489/review-mutants.log`. The earlier "grep count 2" for MA was the edited line plus an unrelated pre-existing `return true;`.
  - None of B's 22 mutants (`b-round-488/mutants/mutants-summary.txt`) covers this. M18–M20 only turn zoom gestures into blocked ones, which is the opposite direction.
- **Coverage elsewhere (for B's ruling, not A's).**
  - Real Chromium row C8 (`wheel`, overlay path; `wheel50`, boot path) would catch MA and MD for wheel.
  - Nothing automated catches MB or MC (one-finger touch). Touch is "jsdom only" in C8, and the real-phone half is TLM-R489-TOUCH-SWIPE.
- **Why STOP.** L11 and §2: a Medium+ finding from A's code-reviewer that is not ruled in this task. The task does not rule on the test event type. The grants forbid changing any sketch line, the test file included.
- **Possible fix (proposal for B, not applied).** `dispatchScrollGesture` sends `new WheelEvent('wheel', {bubbles, cancelable, deltaY: 100})` and a `TouchEvent('touchmove')` with `touches` `{ length: 1 }` (same `Object.defineProperty` pattern as `dispatchZoomGesture`). Add MA–MD to `mutants-489.py`. The sketch changes, so its sha, K14, the mutant summary and the reviews change with it.
- **Tree state.** The sketch is applied byte-equal (K14 `====`), and the tree was left exactly there. A changed no line. The scratch copy was restored and is not part of the store.

- **Doc 316 read in full at hand-over: no false line found.** It does not claim that the unit tests prove a real wheel or a one-finger touch is classified correctly. l.65 says touch is jsdom-only, and the wheel claim is B's browser probe. The l.20 wording ("the first event of the gesture does not scroll; later events scroll after the cover is removed") stays true in the React path. Its listeners are removed in the effect cleanup after the commit (`SpotlightLoader.tsx:182-189`), so 1–2 extra events in a burst may also be blocked, but they still do not scroll.
- **K17 against L29/L10:** L29 makes a claims mismatch a planning FAIL for C, and the task's single STOP clause (§2, L10) does not list it for A. K17 is therefore reported as an environment finding that needs a B/root ruling, not as a second STOP item.

**Status:** STOP (sketch applied and checked; review found an unruled Medium). The other reviewer findings and the Architecture note are below.

## Environment finding: K17 differs (not a STOP)
- `claims-489.sh` matches `claims-489-planning-output.txt` on every line except **K17**. Two cited files are missing: `b-round-488/probe/rec/saba-b-17-entrance-before-1440.webm` and `…-after-1440.webm`.
- **Cause:** `*.webm` is gitignored in the loop folder (`../.gitignore:3`), so the fresh cloud machine did not restore B's recordings. The 6 `.png` stills are present.
- This is B evidence in the loop folder, not store-tree state. It is not on the §2 STOP list. Doc 316 does not mention `webm` or `probe/rec` (grep: 0 hits), and the sketch patch sha256 matches `sketch-489.sha256` (`4a15bff3…`).
- **For C/B/root:** C2 allows only K16 to differ, but C will see the same K17 mismatch at start and end. B or root must rule on it. C13 makes fresh recordings, and those should also be copied into `user-review/img/`. A did not recreate the files.

## Start
- HEAD `73f994d`; `git status --short` was empty (clean).
- Start check: `a-round-489/claims-start.txt` (stderr empty). It differs from `claims-489-planning-output.txt` on K17 only (above).

## Apply
- `git apply ../tmp/studio-real-loop/b-round-488/sketch-489.patch.txt`: rc 0, no output (`a-round-489/apply.log`).
- `git status --untracked-files=all`: 3 ` M` (`EntranceCover.tsx`, `SpotlightLoader.tsx`, `store-entrance-loader.test.tsx`) and 1 `??` (doc 316). `git diff --numstat 73f994d -- app/root.tsx` is empty.
- **K14:** `sketch-files ==== patch=4a15bff396cb6fb0`, after the apply and again after all tools ran.
- Post-apply claims: `a-round-489/claims-after.txt` (stderr empty). It equals `claims-489-sketch-output.txt` except K17 (same cause).

## Checks (run by A)
| Command | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-489/typecheck.log` |
| `npm run lint` | rc 0 (187 repo-wide warnings, 1 info; no errors) | `a-round-489/lint.log` |
| `npx biome check app/components/loading/ app/lib/__tests__/store-entrance-loader.test.tsx` | rc 0. Exactly the 3 known warnings: 2 `noDangerouslySetInnerHtml` at `EntranceCover.tsx:59`/`:61`, 1 `noArrayIndexKey` at `TrackListSkeleton.tsx:11` | `a-round-489/biome.log` |
| `npx vitest run` (4 covering files) | **4 files / 92 tests passed**, 1.99 s. No test took over 100 ms, so none is near its timeout | `a-round-489/covering.log` |

- Not run by A, as the task says: the full suite, `npm run verify`, the build, browser probes and mutants.
- The fixing commands (`check:fix`, `--write`) were never run.

## Code review (real `code-reviewer` subagent, 4 files, agentId a195f0cd78fd2b547)
Verdict: "Approve with minor changes", 8/10. No Critical or High.

The reviewer confirmed:
- The timing math: floor 3500, cap 5000, takeover at 1999 → 4999.
- Listener add/remove symmetry, capture flags included.
- SSR guards and `aria-hidden`.
- All 10 row ids doc 316 cites exist in the test file.

| Id | Sev | Finding | A's disposition |
|---|---|---|---|
| A-R489-REVIEW-NONZOOM-CLASSIFY | Medium | Non-zoom gestures are dispatched as a plain `Event`, so a wrong classifier stays green | **STOP** (top). Reproduced with 4 surviving mutants |
| A-R489-REVIEW-L3-CLASS | Low | L3's new assert uses `classList.contains('pointer-events-none')` (L12: no styling-class selectors); L4 already did the same at HEAD | Ruled in substance by the task's L3 port line ("one new assert at 2999 ms (pointer events still on)"). Only the class mechanism is left for B (L12). Not changed |
| A-R489-REVIEW-DOC-STATUS | Low | Doc 316 l.4 `Completed (C round 489 PASS)` before C has run | Ruled by L28 (the final form is intended). No action |
| A-R489-REVIEW-E8D-LITERAL | Low | E8d uses `ENTRANCE_FAILSAFE_MS + 250` instead of `ENTRANCE_EXIT_MS` | Not changed (sketch line). For B |
| Info | — | React path: "first event only" is exact in the boot script; in React a trackpad burst can block 1–2 more events before the commit | Inside the accepted exit-fade ruling. Doc wording: for B |
| Info | — | E6b checks the pure function only; `as const` is new (an accepted pattern); the tracker ignores add/remove order (correct here) | None |

**Architecture note (verbatim gist, for B/root; not a refactor instruction).**
- Signal 4: the `SpotlightLoader` effect (`:146-190`) now manages 4 timers plus keydown, click and 2 window capture listeners plus the handshake. Keep it as is: it is one lifecycle with symmetric cleanup.
- Signal 2: the zoom rule exists twice. One copy is the boot-script string (`EntranceCover.tsx:41`), the other is `isZoomGesture`, and only `ENTRANCE_SCROLL_SKIP_EVENTS` is shared. Proposal: one bounded task in `app/components/loading/`, either generating the boot check from the same rule or adding a parity test over {plain wheel, ctrl wheel, 1 touch, 2 touches} through both paths.

## Known gaps / not done
- The task's covering command passes (4 / 92), but the STOP above stands until B rules.
- K17 environment mismatch: B or root must rule on it (top of this file).
- No browser, build, full suite or mutants run by A (the task forbids or does not ask for them). `realVerified` is not claimed.

## Exact next C checks (only if B rules the STOP non-blocking, or after a fix-up)
- C1: 3 ` M` + 1 `??`, `root.tsx` without a diff.
- C2: K17 is expected to differ (missing `.webm`) until B or root rules.
- C3: K14 `====`.
- C4: covering 4 / 92, plus B's mutants. Add MA–MD if B adopts them.
- C8 matters most for MA and MD: the real-wheel `scrollY` must be 0 on both `wheel` and `wheel50`.
- Then C5–C18 as written in the task.

## Acceptance criteria A truly passed
- §2 start check (except K17, explained).
- `git apply` rc 0.
- K14 `====`.
- typecheck rc 0, lint rc 0.
- Scoped Biome: exactly the 3 known warnings.
- Covering vitest: 4 files / 92 tests.
- Code-reviewer run.

**Not passed:** "no unruled Medium+ finding" (the STOP).
