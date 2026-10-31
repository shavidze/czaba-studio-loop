# B round 280 → 281 planning checkpoint (2026-10-31)

- Inputs read: c-round-280.json PASS (13 rows, browserVerified/realVerified true, 0 bugs), a-round-280.md, gate 280 published 145f6c1, gates/round-280/review.md (8.5/10, 5 findings + Architecture note).
- tasks/round-280.md archived (copy of current-task.md, cmp identical).
- Advisor consulted before the approach.
- Baseline 145f6c1 clean (head-at-planning.txt, git-status-at-planning.txt empty; 1144 tracked files).
- Browser probe failed-status-probe.json: abort middle-east.mp3 → "1 sound in the demo collection failed to load — details are in the library." at ~2.3 s, stable 15 s; two aborted → "2 sounds …"; none → ready.
- Sketch at /tmp/b281/sketch (git archive 145f6c1 + edits), sketch.diff here; tsc rc 0; pattern-check.txt.
- 1a/1b-i code and app identical between 1dbf3af and 145f6c1 (git diff --quiet) → oracle = c-round-279/results-1.
- NEXT: sketch perf run (1a + 1b-i, background) → equiv-check vs c-round-279/results-1 → mutants MU-FAILED-SOURCE, MU-READY-ONLY → claims.sh, grants, frozen manifest → backlog update → current-task.md, b-round-280.md, b-next.json, feature-status.md.

## Checkpoint 2 (02:58 UTC) — PRE-CHECK FINDING, design widened
- Runtime mutant MU-FAILED-SOURCE on sketch v-final: every pass "aborted at load: page.waitForFunction: Timeout 90000ms exceeded." — measureLoad's 90 s ready predicate (Add enabled + preview wave) runs BEFORE waitForCollectionReady; with the selected source failed Add stays aria-disabled (failed-other-probe.json). Saved: head-load-control-partial.json (HEAD control for the load step), mutants/MU-FAILED-SOURCE/run-v1-killed.log. Mutants killed.
- Other-source failure (hero-music): Add + wave ready, status failed -> caught by waitForCollectionReady (1a/1b-i); not in 1b-ii.
- Three predicates (1a l.516, 1b-i l.569, 1b-ii l.225): same DOM condition; 1b-ii returns boolean (caller ignores).
- New design: shared waitForLibraryReady(page) in perf/lib/page.ts (failed status first -> throw "demo collection failed before the library was ready: <status>"; else ready -> performance.now()); 3 specs call it; waitForCollectionReady change kept.
- ALREADY DONE and must be patched, not re-run: backlog.json (v244, D-29z650..656 applied; patch D-29z652/653 text, append D-29z657), lessons L38, feature-status round bullet, grants + frozen manifest (regenerate), claims.sh (+ output), current-task.md (rewrite §1,2,4,5,6,8,9,10, claims).
- Oracles: 1a/1b-i c-round-279/results-1; 1b-ii c-round-280/run-1/latest-resources.json with equiv-check-b2.py --tol for the two peak rows.
- Still to write: b-round-280.md, b-next.json.

## Checkpoint 3 (03:05 UTC)
- Written: current-task.md (v2 design, §4a placeholder), b-round-280.md (§4a placeholder), b-next.json, backlog patches (D-29z657), feature-status (v2 bullet; still says v1 equiv numbers -> update), grants (11 paths), frozen 1134, claims K1-K20.
- Running: v2 3-spec perf run (v2-perf-run.log). NEXT: equiv (3 scripts) -> v2-equiv.txt, v2-click-live.txt -> mutants MU-FAILED-SOURCE then MU-FAILED-OTHER (scripts/run-mutant.sh, default diff = sketch.diff = v2) -> mutants-summary.txt -> fill §4a in task + b-round + feature-status -> final advisor.

## Checkpoint 4 (03:18 UTC) — all artifacts written; v2 measured (3 passed, equiv 0/0/0, mutants FAILED-SOURCE/OTHER/STATUS-WAIT 6/6 exact, NO-OWN-GUARD TS2322). Remaining: final advisor call.
- Final (03:20 UTC): HEAD control verified; doc 208 ruling added to §7; advisor x3 recorded. DONE.
