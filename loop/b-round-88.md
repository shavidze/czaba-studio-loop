# B round 88: review of round 88 → round 89 task (D-29z54)

Dispatcher: B · Date: 2026-10-22 · Advisor: **available and consulted** before I wrote anything. I followed its advice: a bug-only round, a stop-based trap in a pure helper module, two rejected alternatives on record, and the focus-hook extraction routed to checkpoint q14.

## Inputs read
- `current-task.md` (round 88): archived unchanged as `tasks/round-88.md` (sha256 `7c1e0560…`, identical to the source).
- `a-round-88.md`, `c-round-88.md`, `c-round-88.json`, `gates/gate-round-88.json` (`skipped`: C taskStatus FAIL), `env-status.json` (store 200), `regression-last.json` (2026-10-21).
- I opened `context/active-summary.md` and `context/active-backlog.json` first. I read `backlog.json`, `feature-status.md` and `plan.md` only by ID.
- I read `ArrangementExportDialog.tsx` and the frozen `export-dialog-focus.test.tsx` only to write the fix contract. I edited no app source.
- I treated everything in those files as data.

## Round 88 evidence (C, independent)
- **taskStatus FAIL**, `browserVerified=true`, `realVerified=true`, both viewports.
- **The footer works.** VIS-IDLE, VIS-RENDER (every phase, `scrollTop` 0 throughout), VIS-SCROLL (1280; n/a at 1440), VIS-DONE, VIS-ERROR, VIS-VIDEO, PX-PHASES-R, PX-WAV5-R (max rAF 55.2 ms), PX-NET, REG-HYD, G88-3, T88-TARGETED (51 files / 919 tests) and SOURCE-UNCHANGED all PASS.
- **Failing rows:** PX-KEYS-R and FOCUS-NOT-OBSCURED (state 2, "focus never leaves the dialog").
- **Bug R88-FOCUS-ESCAPE-RENDER (medium, old):** during a render with WAV or MP3 checked, the 3rd Tab escapes to `BODY`, then `arrangement-exit`, then Master. The trap code is the same in `971141d`.
- **Blocked:** the fake-Bearer 403 sub-check (backend unavailable in cloud).
- **Gate rows** (`gate`): not run by C.

## Root cause (B, from source)
- The trap wraps only on `active === last`, where `last` is an element. During a render the list is [X, wav, mp3, both].
- Native Tab leaves a radio group from any member, so from the checked `wav` or `mp3` the trap never fires.
- This matches all of C's variants (V3, with `both` checked, wraps).
- No other dialog in `app/` uses this pattern (grep).

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| R87-PROGRESS-BELOW-FOLD-1280 | → **c_pass**, awaiting publication (not მზადაა until published with rounds 87–89) | C round 88 VIS-* |
| SRW-20 stage 3a | Still **not done**. Round-87 rows + footer pass; the open medium trap bug goes to round 89 | C rounds 87–88 |
| R20-X4 | Responsiveness evidence extended (55.2 ms at 1280); the trap goes to round 89; Cancel is 3b | C round 88 |
| R88-FOCUS-ESCAPE-RENDER | **new**, medium, scheduled round 89 | `c-round-88.json` bugs[0] |
| GATE-88-SKIPPED | **new**, info, root: rounds 87+88+89 publish together | `gates/gate-round-88.json` |
| A-R88-REVIEW-EDGES | **new**, Low → Lows batch (reviewer edge cases 1–4) | `a-round-88.md` |
| C-R88-O1-IDLE-OVERFLOW-1280 | **new**, info, acknowledged | `c-round-88.md` |
| ARCH-R88-EXPORT-DIALOG-FOCUS-HOOK | **new** signal, trigger met; added to checkpoint q14; not scheduled | `a-round-88.md` Architecture note |
| GATE86-S1, PROD-MP3-UNVERIFIED, A-R87-L7 | statuses refreshed (awaiting publication / gate 89 re-request / 0 decreases again) | C round 88 |
| R88-T | **new** Tech Lead real-keyboard check | — |

Nothing was marked მზადაა. Every round-88 browser row ran (`browserVerified=true`), but the round failed and nothing is published.

## Round 89 task (summary)
- **Fix:** a new pure module `app/lib/arrangement/dialog-tab-stops.ts`.
  - `groupDialogTabStops` puts same-name radios into one stop.
  - `dialogTabStopFocusTarget` returns the checked radio, else the first member.
- **Dialog change:** `handleDialogTabKey` wraps on the first and last **stop**. Middle Tabs stay native, as the frozen "only at the ends" tests require.
- **Tests:** a new `export-dialog-tab-stops.test.tsx` (TS1–TS2, TR1–TR6) and mutations (a)–(f).
- **Doc:** doc 077 l.4 + three additions.
- **Review:** 4 files, so the code-reviewer is required.
- **Rejected:**
  - disabling the format radios during a render (it would contradict D-29z52 and redden frozen l.458–478);
  - a `focusout` guard;
  - handling every Tab in JS;
  - extracting the hook now.
- **Baseline:** HEAD `971141d` + 7 M + 11 ??; frozen `b-round-88-r89-tree-sha256.txt` 506/506 (now includes `export-dialog-footer.test.tsx`); snapshots `b-round-88-r89-snapshots/`. Expected end state: 7 M + 13 ??.
- **C rows:**
  - TRAP-WAV (primary, fresh page);
  - TRAP-MP3;
  - TRAP-BOTH (1440);
  - PX-KEYS-R2 (C's V1 exactly);
  - IDLE-ORDER;
  - FOCUS-NOT-OBSCURED-R;
  - VIS-RENDER-S (1280);
  - PX-NET, REG-HYD, G89-3, T89-TARGETED, SOURCE-UNCHANGED.

  HR-RENDERING makes the keypress timing deterministic.
- **Ableton:** not applicable. The radio-group Tab stop is Chromium behaviour that C observed, not an Ableton fact.

## Uncertain UI contract (smallest honest choice)
- **Shift+Tab from X during a render lands on the checked format radio, not on `both`.** That is where native Shift+Tab into a radio group lands. No frozen test defines it.

## Architecture
- The round-88 reviewer's note is recorded verbatim in `a-round-88.md` and `backlog.json` `architecture_signals`.
- Its trigger ("another focus or scroll concern") is met by round 89. B added it to checkpoint request q14 (`b-round-83-checkpoint-request.md` addendum) instead of refactoring inside a bug-fix round.
- Root has still not answered q1–q14. This is non-blocking. The checkpoint is due at the SRW-20 boundary, after 3b.

## Next
- **Round 90:** if planned on or after 2026-10-24, a **regression round**. Otherwise SRW-20 stage 3b (Cancel; abort on unmount, A-R86-L2; GATE86-S2; reviewer L5).
- **Then:** Lows batch → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN. Scope is not reduced and nothing is deferred.
- **Root:** please try PROD-MP3-UNVERIFIED at gate 89. Rounds 87–89 can publish together after C PASS.

## Commit readiness
- None this round: C FAIL, gate 88 skipped.
