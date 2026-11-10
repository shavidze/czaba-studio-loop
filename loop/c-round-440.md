# C round 440 — SYS-1 stage 1 (test-only): PASS

browserVerified = true. No bugs. Evidence in `c-round-440/`; JSON `c-round-440.json`.

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS: 7 paths (6 tests + doc 286), K2 total 7 / outside-grants 0, frozen 1343 rc 0, protected rc 0 | `claims-c.txt` |
| C2 PATCH-IDENTITY | PASS 6/6 `cmp` after applying the sketch to `git archive HEAD` | — |
| C3 COVERING | PASS 6 files, 89/89, rc 0 | `c3-covering.log` |
| C4 MUTANTS | PASS: 30 lines equal `b-round-439/mutants/results.jsonl` (id, tree, rc, red titles). S1–S10 red on both; R1/R2 red at head and green on new; V1–V3 green at head and red on new | `mut/` |
| C5 SWEEP | PASS: K7 0, K9 0, K10 0 0, grep prints nothing | `claims-c.txt` |
| C6 G440-AUTH (browser) | PASS: `auth_user` null on /studio-lab; /studio/middle-east shows "Sign in required", 0 `audio[src]`; token API 401. Fake bearer BLOCKED (no backend) | `auth.json`, `auth2.json`, `auth-studio-product.png` |
| C7 SMOKE + EXPORT (browser) | PASS at 1440x900 and 1280x720. Play: Loading, then ready; second press plays, clock 1.47 s / 1.48 s. Export `czaba-studio-lab.wav` 29189420 bytes, RIFF/WAVE, button back to "Export WAV" at opacity 1. Lane-height handle moved 20 px in all three press positions | `play-status.json`, `export/press-export.json` |
| C8 CLAIMS | PASS: claims diff equals `claims-440-expected-after-A.diff.txt` | `claims-c.diff` |
| C9 DOC | PASS: TEMPLATE headings in order, l.4 exact, S1–S10/R1/R2/V1–V3 with results matching C4, S1-R1, stage-2 ids in TODO, three closes | doc 286 |
| C10 END SCOPE + L57 | PASS: same 7 paths; l57-check OK | `l57-check.txt` |

## Limits (stated, not hidden)
- WAV check is header and size only; the probe does not save the file, so no sample integrity or duration was measured.
- `auth-probe.mjs` printed `signIn: 0` (probe artefact); `auth2.mjs` counted 3 and the screenshot shows the page.
- Gate rows (full vitest, typecheck, build, Biome, verify) not run by C.
- Reviewer nits 4/5 in `library-row-strings-ui.test.tsx` (:241, :268) remain Low/info, as A recorded.
