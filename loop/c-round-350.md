# C round 350 — PERF-CAND-VIDEO-TRIM-FADE-COST stage 1

**Verdict: FAIL (one Low spec/test-guard finding; product behaviour and perf all verified).** Machine-readable: `c-round-350.json`. Evidence: `c-round-350/`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equals A final | claims.txt |
| SOURCE-SCOPE | PASS: 3 files modified, 0 untracked; dock patch reverse-applies | |
| UNIT | PASS 5 files / 143 tests | vitest-unit.log |
| MUTANT M-B1 | PASS: DP69 red; browser release probe on mutated scratch dev server logs opacity mutation with old `1.000` | mutant-M-B1.log, release-MB1-1440x900.json |
| MUTANT M-B2 | **FAIL as written**: DP66, DP67 red, **DP71 passes** | mutant-M-B2.log |
| MUTANT M-B3 / M-B4 | PASS: DP68 / DP70 red | mutant-M-B3.log, mutant-M-B4.log |
| PERF (production, alone) | PASS: rc 0, complete, 252 rows, 70/70, 0 failures, 9 DIFF exactly §2.3 values, 458650 ms | perf-rowcmp.txt |
| NAMES 1440 | PASS: trim 13, fade 3, move 11 (4th move sample 82 = same as HEAD, outside scope) | names.json |
| NAMES 1280 | fade 3, move 11 PASS; trim not measured (probe hits fade handle) | names-C-1280.json |
| BEHAVIOUR | PASS both viewports; equals B baseline and HEAD (1280 needs trim grab at y+8) | behaviour-*.json |
| RELEASE | PASS both: 0 writes; Undo restores | release-*.json |
| PLAY-SYNC | PASS both: \|drift\| ≤ 0.014 s with trim/fade/move+Undo between windows | playsync-*.json |
| G350-AUTH | PASS both: demo opens, auth_user null; /studio/1 "Sign in required", 0 audio[src]; token API 400/405 | auth.json |
| DOCS | PASS | |
Gate rows (not claimed): full vitest, build, Biome, typecheck, verify, e2e smoke.

## Bug for B
**C-R350-01 (Low).** The task requires M-B2 to turn DP71 red. Independently reproduced: it does not (shallow-deduped `useArrangementPreviewLaneClips` never re-renders the dock on an audio drag). Same as A's STOP. B should rule: (a) M-B2′ (non-shallow subscribe; A reports DP66/67/71 red) or A-M5, or (b) keep DP71 as a HEAD-equivalent guard without a mutant row. Product code needs no change.

## Observations for B
- Pre-existing on HEAD at 1280×720: the fade-in handle covers the centre of the trim-left-edge handle (hit-test: fade handle at the trim box centre); trim works near the top of the edge. Candidate Low.
- A-R350-REVIEW-SEEK-TEST and the cachedLane.tracks note remain B candidates.
