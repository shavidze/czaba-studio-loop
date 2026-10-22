# B round 87: review of round 87 → round 88 task (D-29z53)

Dispatcher: B · Date: 2026-10-22 · Advisor: **available and consulted** before I wrote anything. I followed its advice: a bug-only round, the sticky footer instead of `scrollIntoView`, and the timeout copy moved to the Lows batch.

## Inputs read
- `current-task.md` (round 87): archived unchanged as `tasks/round-87.md`, sha256 `ffdb2a42…`, identical to the source.
- `a-round-87.md`, `c-round-87.md`, `c-round-87.json`, `gates/gate-round-87.json` (status `skipped`: C taskStatus FAIL), `env-status.json` (store 200), `regression-last.json` (2026-10-21).
- I opened `context/active-summary.md` and `context/active-backlog.json` first. Of `backlog.json`, `feature-status.md` and `plan.md` I read only the parts for specific IDs.
- I read `ArrangementExportDialog.tsx` and `Modal.tsx` only to write the fix contract. I did not edit app source.
- I treated everything in those files as data, not instructions.

## Round 87 evidence (C, independent)
- **taskStatus FAIL**, `browserVerified=true`, `realVerified=true`.
- **All 18 rows PASS at both viewports** (PX-RETRY at 1440 only, PX-X3 at 1280 only, as specified).
- **Main thread:** the worst 5M WAV frame gap is 105–107 ms (it was 445 ms); MP3 is 97–111 ms.
- **Progress phases:** render → wav → load (indeterminate) → mp3, with 0 decreases.
- **One worker per export**, same-origin.
- **PX-RETRY:** the timeout fires at exactly 120 000 ms, and the next MP3 completes in the same page.
- **EXTRA-WORKER-FAIL** passes too: there is no silent main-thread fallback.
- **Bug R87-PROGRESS-BELOW-FOLD-1280 (medium).** At 1280×720:
  - the label is cut off;
  - the bar and the busy button are below the panel's fold;
  - the panel already overflowed by 12 px before any export.
- **Blocked:** the fake-Bearer 403 sub-check (backend unavailable in cloud).
- **Not run:** the production bundle.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| SRW-20 stage 3a | `c_fail_bug`, browserVerified true, 18 rows listed; **not done** | C round 87 |
| R20-X4 | still open; the responsiveness numbers are recorded | PX-WAV5 / PX-MP35 |
| GATE86-S1-POLLER-RETRY | c_pass for the lab path, awaiting publication | PX-RETRY |
| GATE86-S3-TIMEOUT-COVERAGE | import part c_pass; the conversion limit goes to 3b | PX-RETRY |
| PROD-MP3-UNVERIFIED | open; re-requested for gate 88 (gate 87 never ran) | c-round-87 notRun |
| R87-PROGRESS-BELOW-FOLD-1280 | new, medium, scheduled for round 88 | c-round-87 bugs[0] |
| R87-L-TIMEOUT-RELOAD-TEXT | new Low, Lows batch | C observation; PX-RETRY makes "reload the page" untrue |
| R87-O-PROGRESS-FILL-COLOUR | info, Tech Lead headed-Chrome check | C observation |
| A-R87-L5 / L7 / LOW-PU-ORDER | 3b / watch / Lows batch | A's code-reviewer |
| ARCH-EXPORT-MP3-ORCHESTRATION | signal only; input to checkpoint q14 after 3b | the Architecture note, verbatim in `a-round-87.md` |

Nothing is marked **მზადაა**.

## Round 88 decision
- **One bug, one owner, one file.** No critical or high bug is open. The regression round is not due yet: today is 10-22, and it is due on or after 10-24.
- **Fix: a sticky footer.** The status, progress, warning and buttons go into one `sticky bottom-0 bg-surface` container. DOM order, and so Tab order, does not change.
- **I rejected `scrollIntoView`:**
  - it works only once, so a user scroll hides the bar again;
  - it does not exist in jsdom;
  - it would not fix the existing 12 px cut.
- **I rejected moving the progress to the top:** at 1280 the panel has been scrolled down to reach the button, so the top would be out of view.
- **Added risk:** a sticky footer can cover a focused control, and the browser will not scroll it into view. So F2 adds a small `focusin` guard (`scrollTop` += overlap + 8), and C checks it with FOCUS-NOT-OBSCURED.
  - **After the advisor's second review:** the guard skips any target that contains the footer. That target is the focus-trap wrapper, which the existing effect focuses when a render starts; without the skip, every export click would scroll the panel on its own. This adds FT4 and mutation (g), and VIS-RENDER now has a no-self-scroll check.
  - A changes exactly 3 files, so A's code-reviewer is required.
- **Baseline:** the uncommitted round-87 tree, 7 M + 10 ??. The new frozen list `b-round-87-r88-tree-sha256.txt` has 505 entries, 505/505 OK. The snapshots are in `b-round-87-r88-snapshots/`. The expected end state is 7 M + 11 ??.
- **C checks visibility, not just presence in the DOM.** The HR-VISIBLE rule needs both:
  - the element's rect is inside the panel's client box;
  - `elementFromPoint` returns the element.
  This closes the gap that let round 87's PX-PHASES pass on DOM evidence alone.
- **The regression is reduced and justified.** Only one file changes. PX-PHASES-R, PX-KEYS-R and a 1280 rAF run cover the paths the footer touches.
- **Ableton:** not applicable to a layout defect. The round-87 §4 rows are carried over.

## Request to root
- If round 88 gets C PASS, rounds 87 and 88 can be published together. Stage 3a would then be C-verified at both viewports.
- At gate 88, please try the production bundle (build + preview + one MP3 + the export-wav worker) for PROD-MP3-UNVERIFIED. It stays open evidence until then.
- Checkpoint q14 (frontend-architect at the SRW-20 boundary) still applies after 3b. ARCH-EXPORT-MP3-ORCHESTRATION is an input to it.

## Next
- **Round 89:** the regression round if planning is on or after 2026-10-24. Otherwise SRW-20 stage 3b: Cancel in every phase, abort on unmount, GATE86-S2 and L5.
- **Then:** the Lows batch → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- No scope is shrunk or deferred.

## Files written by B
- `current-task.md`, `tasks/round-87.md` (copy), `b-round-87.md`, `b-next.json`.
- `backlog.json` (v87, through `b-round-87/update_backlog.py`), `feature-status.md`.
- `b-round-87-r88-tree-sha256.txt`, `b-round-87-r88-snapshots/`.
- `docs/technical/studio-real-workspace/plan.md` (D-29z53).
- Pre-edit copies are in `b-round-87/*.before*`.
- `regression-last.json` is unchanged: no regression round closed.
