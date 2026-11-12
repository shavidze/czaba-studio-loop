# C round 466: FAIL, STOPPED, routed to B (lesson 22)

A stopped on an unruled code-reviewer Medium (TS8 cannot detect removal of the `/shadow/i` pre-check). A's diff exists, so I ran the short route: SOURCE-SCOPE, CLAIMS, the STOP's named check and the auth guard. I did not run C4–C7 or C9; a published round needs B's ruling first.

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS. HEAD `6d321c7`, 3 `M` plus 1 `??` (doc 304). The r465 manifest fails only on those 3 paths. Doc 299 diff is line 4 only. Protected rc 0 | `c-round-466/data/status.txt`, `manifest.txt` |
| C2 (part) | Both post-image shas OK | in the C1 command |
| C3 COVERING | PASS. 4 files, 31 tests | `data/covering.txt` |
| STOP check: pre-check removal | **Reproduced.** I copied `6d321c7` plus the sketch to `c-round-466/tree-mut` and deleted the 3 lines of `if (!/shadow/i...) return 0`. All 4 files / 31 tests still pass, so TS8 stays green | `data/nopcheck-vitest.txt` |
| C8 AUTH (browser, 1440×900 and 1280×720) | PASS. `auth_user` null. `/studio-lab` showed `Demo collection ready` and Enter on "Full mix" took the clips from 6 to 8. `/studio/middle-east` showed "Sign in required" with 0 `audio[src]`. `/api/studio-token` returned 401. Fake-bearer path BLOCKED (backend unavailable in cloud). The first load timed out on a cold start (env-invalid, L38) and was replaced by the second run | `auth.mjs`, `data/auth.json`, `premium-*.png`, `lab-added-*.png` |
| C11 CLAIMS | Matches `claims-466-expected-after-A.txt` for K2, K3, K4, K6, K7, K8; 0 MISSING | `data/claims.txt` |
| C4–C7, C9, C10, C12 | Not run (short route) | – |

## Bug
**C-R466-01 (Medium, origin: B spec):** TS8's title says the pre-check "skips only sources without the word shadow", but line 161 returns 0 with or without the pre-check. Only the case-insensitivity lines 162–163 can go red. None of B's 13 mutants removes the pre-check. This confirms A-R466-REVIEW-M1. B's three options (retitle, observable test, or rule it Low) are in `a-round-466.md` §3.

Gate: not claimed. The Studio user flow (add, play, export) was not changed (test-only round), and the auth guard held.
