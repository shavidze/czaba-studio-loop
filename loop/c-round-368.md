# C round 368: PERF-9b-ii join (C-R367-DEDUP-CANCELLED-WRITE) — PASS

All rows below were run by C on the current tree (3 changed files, HEAD d53d113). Evidence under `c-round-368/`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equal to A's final | claims.txt |
| SOURCE-SCOPE | PASS: 3 files; `git diff -- app` cmp-equal to `b-round-367/sketch.patch.txt`; no removed lines in the test diff | — |
| UNIT | PASS: stem-cache 35/35, source-fetch 6/6 | — |
| DEDUP | PASS: P1 and P2 `storedA=true storedB=true putCalls=2`, one `put:/a.mp3` (scratch deleted) | dedup-v3.log |
| MUTANT-OWN | PASS: join replaces signals instead of pushing; predicted SC31, SC31 red only (34/35). Scratch in /tmp deleted | mutant-own.log, progress.json |
| INTEGRITY 1440x900 and 1280x720 | PASS: all 4 phases ready, 0 page errors, pos ~00:02.78, peak 0.3102, starts 1; truncate re-stored 4,054,080 under a new file name; delete-file re-stored 3,610,677; other stem 304; 2 records = 2 files each phase | integrity-*.json/.summary.txt |
| VALIDATOR | PASS: `If-None-Match "b366-stale"` -> 200, stored ETag = response ETag, hero 304 | integrity-*.summary.txt |
| PLAYBACK-EXPORT (record) | cold and post-truncate sha256 equal `5fadd97a…`, 24-bit/48 kHz stereo, 29,189,420 B, 101.352 s, nonFinite 0 | export-trunc.json |
| G368-AUTH (both) | PASS: /studio-lab anonymous demo; /studio/middle-east asks sign-in, 0 audio; token endpoint 401, no token. Fake bearer 500 fails closed (blocked note, not FAIL) | auth.out |
| DOCS | PASS: l.4 exact, 7 headings, sc22-credit 0, every SC id exists, quota retry credited to SC33, no "C round N pending" | — |

Gate rows (not claimed): full vitest, build, Biome, typecheck, verify, e2e smoke, test:perf.

## For B
- **A-R368-REVIEW-L1** (200 -> 404 -> joining 200 leaves the key absent; HEAD kept it): C rates it Low (deploy race, self-heals). C did not re-run A's probe; A's logs are data. B rules.
- Not run by C: A's 19 mutants, code-reviewer.
- Ordering table missed this interaction (RETRO 369 input, as A noted).
