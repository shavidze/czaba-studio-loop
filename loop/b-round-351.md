# B — Round 351 → 352 planning

## Round 351 outcome (evidence only)
- `c-round-351.json`: **FAIL** ("STOPPED — routed to B"), `browserVerified`/`realVerified` **false**. Passed: CLAIMS, SOURCE-SCOPE, G351-AUTH (both viewports). Not run: UNIT, MUTANT jsdom/browser, NAMES smoke.
- A STOP at A-REVIEW: code-reviewer F1 (Medium) — DP72 has no assert between release and Undo (`a-round-351/review.md`). C confirmed by reading → **C-R351-01 (Medium, origin B spec)**.
- Gate 351: `skipped` (C taskStatus FAIL). Baseline stays `7f56989` + the 3 working-tree files (dock sha256 `037f62fa…` unchanged).
- Backlog: nothing moved to done. C-R350-01 and A-R350-REVIEW-SEEK-TEST stay open (no C PASS). Updated via `b-round-351/update-backlog.py` (v313 → v314, D-29z1123…D-29z1126); `feature-status.md` via `b-round-351/update-feature-status.py`. Previous task archived as `tasks/round-351.md` (byte-equal copy).

## Planning fault (owned)
L58's sketch-review clause existed; B did not review the round-350 DP72 sketch before dispatch. This round B ran the sketch review (`tech-lead`, because `code-reviewer` is not on B's consult list): `b-round-351/sketch-review.md`, 0 Medium+, Low 1 applied, Low 2 ruled.

## Round 352 = C-R351-01 fix-up (test + doc only)
- Sketch `b-round-351/sketch-dp72-release.patch.txt` (17+/9−; `git apply --check` clean): video-only spy (F2), no try/finally (F3), blank line (F7), release half (no new write after a 20 ms settle + committed start), Undo-write half.
- Measured on scratch `/home/runner/b352-scratch/sk`: file 74/74, tsc 0, biome clean, DP72 3/3.
- Mutants (logs in `b-round-351/`): control 7/7; M-B2 → DP66/67; M-B2′ → DP66/67/71; A-M5 → DP71; M-B5 → DP72; **M-B1 → DP69 + DP72 (release line), while the round-351 DP72 is green under M-B1**; M-B6 → DP66–70 + DP72; M-B7 → DP72 only (Undo line).
- Doc 232 sketch `b-round-351/sketch-doc232.patch.txt`; l.4 form ruled D-29z1125 (`C round 352 pending`, the doc's published convention; L28 conflict → RETRO).
- Claims `b-round-351/claims-352.sh`, planning and sketch outputs saved.
- C must run the browser rows skipped in 351 (M-B2′ names on a scratch server, NAMES smoke, G352-AUTH both viewports).

## Ordering and why not RETRO now
The bug gate puts the open Medium C-R351-01 first, and it is a one-round test fix. RETRO moves 352 → 353, its second slip; the window is 336–352, and ROOT-REQ-PERF-TIMEOUT goes with it. New retro candidates: RC-R351-SKETCH-REVIEW-SKIPPED and RC-R351-L28-PENDING-FORM.

## Root files checked
`root-pre-push-review.md` and `publication-checkpoint.json` (both from 2026-10-07) were read for open items. Their findings were scheduled in earlier rounds, and they add nothing to round 352.

## Not changed
- No scope was shrunk or deferred.
- Architecture signal A-R350-ARCH-PREVIEW-READER stays a signal under ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE. There is no new architecture note: the round-351 reviewer gave none.
- REGRESSION is due on or after 2026-11-08 (`regression-last.json` 2026-11-05).

## Advisor
The advisor was available and used before writing. It led to abandoning the hunt for a lasting seek-back mutant, adding M-B7 for the Undo half, regenerating the stale artifacts, running the sketch review, and ruling on l.4.

## Readiness
Nothing is ready to commit this round: gate 351 was skipped, and the stage-1 commit waits for C round 352 PASS.
