# C round 438 — SYS-R435-SOURCE-SCAN-HELPER (test-only): FAIL

**Verdict FAIL.** A stopped for a B ruling (code-reviewer Medium M1). I reproduced it independently, so it is a real finding and not just a claim.

## Bug C-R438-01 (Medium, origin: B spec)
NF2 now selects only lowercase `<input>` tags. A wrapper such as `<Input type="number" />` makes HEAD's NF2 red but leaves the sketch's NF2 green.
- Mutant M17, scratch trees in /tmp/c438: HEAD rc 1, sketch rc 0. Baseline is rc 0 in both.
- Logs: `c-round-438/m17-*.log`.
- No such wrapper exists today.
- Doc 285 line 77 says no assertion was lost. That is false while the narrowing stands.
- Next step for B: either a v4 sketch where NF2 finds number fields by `type` on any tag, with M17 as its red-proof, or a recorded ruling plus a deferred Low and a reworded doc line.

## Rows
| Row | Result |
|---|---|
| C1 start scope | PASS: 9 granted paths only; frozen and protected manifests rc 0 |
| C2 patch identity | PASS: 8/8 files cmp-identical to B's sketch files (the sketch patch was not re-applied to a scratch) |
| C3 no runtime change | PASS |
| C4 covering | PASS: 7 files, 23/23 |
| C5 mutants | PASS for sketch.jsonl: 16/16 equal in id, rc and fails. HEAD run and helper-mutants.py were **not** re-run |
| C6 sweep | not run (partial) |
| C7 auth (browser) | PASS: `auth_user` null on /studio-lab; /studio/middle-east shows "Sign in required" with 0 `audio[src]`; token API 401. Fake bearer BLOCKED (no backend). The first attempt screenshot was blank (cold start); the re-run is the evidence |
| C8 play (browser, both viewports) | PASS: Loading, then ready; second press plays and the clock advances (1.46 s and 1.48 s). The first run timed out on a cold library list; the retry passed |
| C8 export (browser, both viewports) | PASS: 29189420 bytes, RIFF/WAVE, button back to "Export WAV" at opacity 1 |
| C9 claims | PASS: differences only K2, K5, K6, K9, K10 |
| C10 doc | partial: headings present; line 4 matches L28; the line 77 claim is false (above) |
| C11 end scope + L57 | scope unchanged; L57 check in `c-round-438/l57-check.txt` |

Gate rows (full vitest, typecheck, build, Biome, verify) were not run by C.
