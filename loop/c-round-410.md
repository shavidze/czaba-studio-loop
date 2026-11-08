# C round 410 — PERF-15a (precomputed peaks, stage 1 of 2): PASS

Verdict: **PASS**, 0 bugs, `browserVerified`/`realVerified` true. PERF-15 is **not done**: 15b is open. Evidence is in `c-round-410/`; JSON is `c-round-410.json` (L57 checker OK).

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS: claims differ from planning only on the A4 lines; status is the 6 granted paths; frozen 1301 rc 0; protected rc 0 | `claims-start*.txt`, `claims-start-vs-planning.diff` |
| 2 | PATCH-IDENTITY | PASS: sha 8f22c005… = dispatched; 5 files `cmp` identical to a git-archive HEAD plus the patch | `patch-identity.txt` |
| 3 | DEMO-UNCHANGED (browser) | PASS at 1440x900 and 1280x720: ok, no error, pageErrors [], peaksRequests [], 9 sources × 96 rects | `peaks-*.json/.png` |
| 4 | LANE-PATH (browser) | PASS at both: ok, 8/8 steps, pageErrors []. 1440 attempt 1 hit a cold-server timeout (L38), retry passed | `lane-*.json/.png`, `lane-1440x900-attempt1-timeout.*` |
| 5 | UNIT+MUTANT | PASS: covering 16 files 274/274 (slowest 3004 ms of 15000, 20%); 17/17 mutants RED naming their expected row; pristine before/after rc 0; scratch status 0 | `covering.json`, `mutants-summary.txt` |
| 6 | AUTH (browser, fresh context, no credentials) | PASS: demo opens, `auth_user` null, no "Sign in required"; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; token endpoint 401. Premium is not bypassed. Fake-bearer path BLOCKED (no backend in cloud) | `auth.json`, `auth-*.png` |
| 7 | DOCS | PASS: doc 263 l.4 byte-exact; 7 TEMPLATE headings in order; 17 mutant lines equal B's summary; PP1–PP7 and PPC1–PPC11 present; 0 `C round N pending` | — |
| 8 | SOURCE-SCOPE end + L57 | PASS: end claims equal start claims; status still the 6 granted paths | `claims-end.txt` |

## Limits (honest)
- No collection sets `peaksUrl`, so the "waveform before ready" path runs only in jsdom (PPC rows). There is no browser proof until 15b. Row 3 proves only that the demo is unchanged.
- The product flow find → add → fit video → export was not changed here, and export WAV integrity was not re-measured. It is a gate or unchanged item.
- Gate rows (full vitest, typecheck, build, Biome, verify) were not run by C.
- Ableton conformance does not apply: the round is behaviour-neutral perf.

## For B (A's reviewer Lows, not C bugs)
A-R410-REV-S1: the peaks fetch uses default credentials, while `source-fetch.ts` uses `'omit'`. A-R410-REV-S2: the body is not cancelled on non-ok or over-cap responses. A-R410-REV-S3: peaks fetches start before any `loadSource`, and an unguarded `peaksUrl` throw blocks decoding. A-R410-REV-S4: the bucket-count match is a weak identity check. Decide the credentials policy before 15b and the protected purchased `peaksUrl`.
