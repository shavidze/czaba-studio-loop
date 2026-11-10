# C round 428: SYS-2 stage 4 (held Enter on sheet / export dialog / Send link): PASS

Verdict PASS, 0 bugs, browserVerified true. Evidence under `c-round-428/`. Details per row in `c-round-428.json`.

| Row | Result | Evidence |
|---|---|---|
| 1 scope+claims | PASS | claims-start.txt/.err (empty), K19 L58 OK, frozen 1320 rc0, protected rc0 |
| 2 patch+unit | PASS | 7 files cmp identical; 59 files 996/996 (a2-vitest.log) |
| 3 mutants | PASS | b427copy/mutants/summary.txt identical to B's 7 lines |
| 4 held-Enter browser | PASS | probe/compare output `ALL OK (13 cells)`; focus targets as specified |
| 5 neighbours | PASS items 1-3; item 4 info | probe/neighbours.json |
| 6 auth | PASS | auth/g428-auth.json pass:true; no bypass in any sample |
| 7 doc 276 | PASS | l4 byte-exact, 7 headings, mutant block identical |
| 8 scope end + L57 | PASS | claims-end == claims-start; l57-check OK |

Environment retries: SFOOTER 1440 cold-load timeout (retry OK); auth attempt 1 hydration error at 1440 on legacy route (no workspace, 0 audio, no bypass), caused most likely by C's own temporary second vite server; retry passed.

Info for B (not a bug): row 5 item 4 expected Space on the focused footer button to open the sheet. It does not, on A's tree and on a HEAD scratch alike, because Space is the global Play shortcut. Pre-existing and unrelated; B may fix the wording of that row.

Gate rows (not run by C): full vitest, typecheck, build, Biome, verify. Blocked: fake-bearer with a real backend (unavailable in cloud).
