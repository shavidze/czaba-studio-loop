# C round 384: PERF-13b-i verification — PASS (browserVerified true)

No bugs found. Source untouched (11 status lines; frozen and protected manifests rc 0 at start and end). Details: `c-round-384.json`, `c-round-384/progress.json`.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS | 11 lines, rc 0 / rc 0 |
| 2 | DOCS-L4 | PASS | l.4 exact; A's diff touches only l.4 |
| 3 | HEAP-RETAINERS-PROD 1440x900 | PASS | `heap-prod-1440.json`: live [2,5,16,16,16,16,16], 16 AudioBuffer nodes, 0 baseQueue |
| 4 | HEAP 1280x720 (prod) | PASS | `heap-prod-1280x720.json`, same. Dev at 1280 not run (optional) |
| 5 | PERF-RES | PASS | `perfres.log`: 22 asserts PASS, 0 FAIL; bytes 29,189,420 / 58,378,796; pcm ready 31.9 MiB, count 7, decode 0; after-add 69.0/8; export delta +37.1 |
| 6 | MUTANTS-UNIT | PASS | `mutants-out/summary.txt`: 19/19 red on named rows, `restored` |
| 7 | PLAY-REFUSE-BROWSER | PASS | `playrefuse.json`: refusal text exact; 2nd Space starts hero 150.37 s |
| 8 | UNIT | PASS | 45 files / 615 tests; perf-lib 3 / 54; C-DEMO sha rc 0 |
| 9 | G384-AUTH | PASS | anonymous context at both viewports: `/studio-lab` opens (auth_user null); `/studio/middle-east` "Sign in required", 0 audio[src]; token API 401 `Please sign in to access Studio.` Premium auth not bypassed. First run had a cold-start timeout (env-invalid) and was replaced |
| 10 | EVICT-B2-COUNT | PASS | `evict-b2-count.json`: 1 stop() (101.35 s), not live after Stop; Add live, Undo gone |
| 11 | CLAIMS | PASS | only K7 differs, 0 MISSING |
| 12 | SOURCE-SCOPE end + L57 | PASS | 11 lines, rc 0/0, l57 OK |

C-R382-01 closes on rows 3 and 5. Blocked: fake-bearer token path (no backend in cloud). The full suite and verify are gate rows (`gates/gate-round-384.json`), not claimed here. The gate*/chainHead L57 fields are null because C ran no sketch gate checks this round.
