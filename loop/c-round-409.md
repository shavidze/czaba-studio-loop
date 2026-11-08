# C round 409 — PERF-11c-iii-e-ii (Lane shell + memo inner): PASS

Evidence folder: `c-round-409/`. Browser: Playwright/Chromium against http://127.0.0.1:5173, 1440×900 and 1280×720.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS. Claims differ from planning only on A4's lines. Status = the 4 granted paths. Frozen 1,299 rc 0, protected rc 0 | `claims-start.txt` |
| 2 | PATCH-IDENTITY | PASS. Patch (sha 1beedffbda3e…) applied to `git archive HEAD`; both files `cmp` identical to the working tree | /tmp/c409-pid |
| 3 | LANE-ACTIONS | PASS at both viewports: ok, no error, pageErrors [], 8/8 steps pass (active-track: one lane pressed after click). 1440 first try timed out cold while mutants ran concurrently (L38); retry passed | `lane-*.json/png` |
| 4 | LEAF-PROBE | PASS. Inner `[0,8,4,4,0,0,0,1,1,4,4,0,0,1,1]`, shell `[0,12,4,4,0,0,0,4,4,4,4,4,8,4,4]`, StudioWorkspace equals sketch; solo pressed after click, unpressed after undo; no page errors. Every other leaf equals B's file except LibraryPreviewViewInner last step 11 vs 10 (known ±2 jitter) | `leaf-probe.json` |
| 5 | UNIT + MUTANT | PASS. 914/914 (46 files, rc 0). 9/9 mutants RED naming the expected rows on a committed scratch; pristine before/after rc 0; scratch status 0; result lines identical to B's. tsc guard rc 2, error names `colour` in ArrangementLane.tsx | `vitest.json`, `mutants/summary.txt`, `tsc-guard.log` |
| 6 | AUTH | PASS (both viewports). Demo `/studio-lab`: auth_user null, no "Sign in required", 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` without auth: 401. Fake-bearer path BLOCKED (backend unavailable in cloud) | `auth.json`, screenshots |
| 7 | DOCS | PASS. Doc 262 and 261 l.4 byte-exact; doc 262 has the 7 TEMPLATE headings in order (only the Prompt heading is absent, as expected); 9 mutant rows equal B's; RB-LEAF7/8/9 present; 0 "C round N pending" hits; only docs 261/262 changed | — |
| 8 | SOURCE-SCOPE end + L57 | PASS. Claims at end identical to start; status unchanged; L57 check run | `claims-end.txt`, `l57.txt` |
| gate | full vitest, typecheck, build, Biome, verify | not run by C (gate rows) | — |

## Not covered
- Library drop, video import and lane-drag paths are not in the browser probe; they are unit-covered (A3 set, RB-LEAF9).
- The wider product flow (find → add → fit video → export) is unchanged by this round. Export WAV integrity was **not** re-measured here; it is a gate/unchanged-code matter.

## Findings
No bugs. Low carried to B from A: A-R409-REVIEW-L4-TRACK-FIELD-COVERAGE (no mutant for a wrong compare body of name/volume/groupId/kind; only a missing key is a compile error).
Ableton conformance: not applicable (behaviour-preserving perf round).
