# C round 357 — PERF-10a: FAIL (STOPPED — routed to B), browserVerified false

L22 short round: A reported "STOP — needs B ruling on A-REVIEW (remount status order)" with a diff. C ran CLAIMS, SOURCE-SCOPE, DOCS, the auth guard and the STOP's named check only. The perf, play, follow, video, narrow and mutant rows were not run.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equals A's final | `c-round-357/claims.txt` |
| SOURCE-SCOPE | PASS: 56 entries, no `perf/**` or `package.json`, K6 11/11 | `claims.txt` |
| DOCS | PASS: doc 234 l.4 byte-exact, 7 headings, 0 pending files | — |
| G357-AUTH | PASS at both viewports. Fake-bearer 500 (fails closed, mock down) is BLOCKED | `auth.json` |
| STOP named check | **Reproduced in a real browser: C-R357-01 (Medium)** | `remount3-head.json`, `remount3-atree.json` |
| READ, UNIT, MUTANT, PERF, PLAY, FOLLOW, VIDEO-*, NARROW | NOT RUN (L22) | — |

## C-R357-01
Recipe, with HEAD `d49536b` on a scratch server (:5190, own cacheDir, worktree removed) and A's tree on :5173:
1. Add "Night Pulse · Full mix".
2. Space to play, click the ruler's bottom strip, Space to stop.
3. Resize 800×900, then 1440×900.

Result:
- **HEAD:** the status after remount is "Insert marker (00:23.000) is past the end … Home returns to 0."
- **A's tree:** the same sentence, plus an appended "Tempo 120 BPM from “Night Pulse · Full mix” — … Snap on — grid 1/2 (G)".

The cause matches A's static trace: the leaf's child effect runs before tempo-seed and queues a functional write. The announcement half (span re-key) was not observable, because the span identity resets on remount in both.

B decides between (a) accept it and add a remount regression row, or (b) restore HEAD's text and order. Nothing else is evidenced by C: A's figures (play rows 70→28, 1273/1273, mutants red) are not independently verified.
