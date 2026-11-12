# C round 476: STOPPED, routed to B (lessons L22 short route)

**Verdict: FAIL (not implemented to the point of acceptance).** A stopped on a code-reviewer Medium (R1) on a file the task grants byte-equal to the sketch (D-29z1683). No B ruling exists, so I ran only SOURCE-SCOPE, CLAIMS, the auth guard and the STOP's named check. `browserVerified=false`: C5-C10 (hand-off colour, light/dust, wordmark, timing, header, journey) are browser rows that CAN run here and were not run.

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS | `c-round-476/status.txt`: 5 modified + doc 309 only; `sha.txt`: 5/5 OK; protected-path grep 0 |
| C2 CLAIMS | PASS | `claims.out` equals `b-round-475/claims-476-allowed-deltas.txt`; last line `L58 OK` |
| C12 AUTH | PASS (anonymous part) | `auth.json`, `auth-1280.png`: `/studio/middle-east` shows "Sign in required", 0 audio src; token API 401; `/studio-lab` opens as demo with no credentials. Real-owner path BLOCKED (backend unavailable in cloud) |
| R1 (named check) | CONFIRMED in source | `SpotlightLoader.tsx:181-182`: inline `style={{backgroundColor:'var(--color-background)'}}` plus child `bg-background` layer paint the same colour. Visual output is identical, so this is a Tailwind-first/duplication issue, not a visible defect (not browser-measured this round) |
| C3-C11 | NOT RUN | waiting on B ruling |

## For B
1. Rule on R1: (a) accept the sketch as is and log R1 as a deferred Low (A's suggestion; HEAD already had the inline style, pd-p0-3a ruling 1 names it, tech-lead row (a) is Info), or (b) amend the sketch to `bg-background` on the overlay and drop the inline style and the child layer, then update the sha list, claims deltas, M1/M12/P2 pins and mutants.
2. After the ruling, C runs the full C1-C12 set. The tree is already at sketch state, so under (a) no A rework is needed.
3. Note D-29z1683 says a reviewer Medium triggers STOP, but R1 is by its own description a "later colour-only pass" item; B may want to restate whether a Medium that is behaviour-neutral should STOP.
