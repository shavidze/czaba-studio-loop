# CURRENT TASK — Round 343: PERF-DRAG-PREVIEW stage c4-ii. A group move previews through the store, so dragging two or more selected clips no longer re-renders the provider and the whole workspace on every move. A collapsed group's overview still follows the drag. The group perf rows become asserts

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 342 → 343 planning.

## Dispatch as round 343 (B, 2026-11-05; D-29z1075 … D-29z1078)
- **D-29z1075: the regression is closed.** Round 342 is PASS from C's evidence (`c-round-342.json`):
  - all 12 rows of the closed list have an allowed result (9 PASS, 3 recorded);
  - 0 new bugs and 0 Medium+;
  - `browserVerified` and `realVerified` are true.
  
  REGRESSION-ROUND-2026-11-05 ran in rounds 340–342 and is now done. `regression-last.json` = 2026-11-05 / round 342, so the next regression is due on or after 2026-11-08.
- **D-29z1076: oracles recorded for the next regression.**
  - POSCTL: `c-round-342` run, `valid=false`, `starts=1` at both viewports.
  - FONT-PIXEL baseline: `c-round-341/out/fonts/`.
  - The three re-seen Lows (C-R186-02, C-R301-01, C-R331-01) are already deferred and stay so.
- **D-29z1077: this task is the c4-ii package, unchanged in substance.** The baseline is still `99a5912`: gates 340, 341 and 342 were `skipped` (no change). So the carry-forward needs no re-measurement, as the draft's rule (1) says. B checked this at this planning:
  - `git apply --check`: 3/3 OK on `99a5912`;
  - `b-round-339/claims-340.sh` output equals `claims-340-planning-output.txt`, before `regression-last` changed;
  - round 341's RR-PERF on this HEAD gave rowcmp 0 DIFF against `c-round-339`, so the perf oracle stands.
  
  Changes from the draft:
  - "round 340" becomes 343 in the doc and budget text;
  - the budgets patch is regenerated as `b-round-342/sketch/budgets.patch.txt` by `b-round-342/sketch/apply-budgets-343.py`. It applies cleanly; its diff to the old patch is the note text and the git header only; K6 on the patched tree is `219 26 12 55 10`;
  - the claims script is `b-round-342/claims-343.sh`, because K8 moved to 2026-11-05.
- **D-29z1078: the auth oracle follows reality.** The draft's fake-Bearer expectation of 500 is replaced by **403 while the mock is up**, as C measured in rounds 341 and 342. 500 is accepted only when the mock is down.
- `context/head-sha.txt` now reads `99a5912`. The "still says 662ed42" line in the history block below was true at the round-340 planning only.
- The scratch trees under `/home/runner/b339-scratch/` and `/home/runner/b342-scratch/` do not survive the job. Acceptance depends only on files in `b-round-339/` and `b-round-342/`.

