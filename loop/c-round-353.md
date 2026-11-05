# C round 353 — RETRO 353 verification: PASS (browserVerified true, 2 Low findings against B text)

Evidence is in `c-round-353/`; scripts in `c-round-353/scripts/`. No file in `store/` was touched. Dev server 5173 was already running. The mock API was not running, so I started it (log: `c-round-353/mock.log`) and stopped it afterwards.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | HEAD `a55543b`, 0 status lines, frozen sha256 list rc 0, at the start and at the end |
| CLAIMS | PASS | `claims-out.txt` is identical to `b-round-352/claims-353-output.txt`; stderr empty |
| RT-NUM | PASS | I re-ran B's scripts from copies writing to `c-round-353/out/`. cost, retro-numbers, classify, gate-reviews, fails-detail, exp-fields, manifest-fields, l57-coverage, awaiting-user, mentions, deferred-totals, task-titles, stops-count, c-models and open-medium-plus are byte-identical to B's. Totals $160.75 / 86.52 / 30.38 / 277.65, median 17.01, B 57.9 %, B median 9.98, retro groups, chain 43.44, FAIL/STOP 31.43, C 14/2/1, gate published 11 / skipped 6, 5 of 16 L57-complete, 90 awaiting, 634 deferred, B 9.93 / A 5.35 for 322–337, L23 5058, L58 2803 → 2908 all equal. One difference: `collect.txt` b_cost for round 352 is 13.25 now (0 in B's snapshot). `b-round-352-result.json` was written after B's collect run. cost.py takes planning cost from that file, so no total changes |
| RT-CAUSE | PASS | Sampled sources match the retro text: c-round-340/341/350/351/352 statuses, bugs and browserVerified, a-round-350/351 l.3 STOP lines, b-round-349 has no M-B2 log (only sketch1 mutants), C models all Sonnet 5.5 (Fable also in 341 and 347). Inferences (C cost drop, B share, STOP route) are labelled |
| RT-IDS | PASS | Round 352 closure and the five closed ids are in the archive with status `closed (D-29z1127)…`. The new Lows, GATE352-ARCH-DOCK-LIFECYCLE, question_4, SYS-R353-DP-TEST-POLISH (`closes` has 4 ids), the retro_runs 353 entry and next_due 368 are all present. ROOT-REQ-PERF-TIMEOUT starts with "question to Saba". Of the 27 inventory ids, the 12 D-ids are covered by the §8 line "D-29z1094 … D-29z1126 historical". Other spellings of retro/round 351–353 are only in rounds/decisions text |
| RT-LESSONS | PASS with Low C-R353-01 | 60 lines, hunks 3c3 41c41 50c50 58c58 (`lessons-diff.txt`). L28 and L57 only append a clause. In L58, rule and evidence ids are kept (C-R327-01, A-R327-REVIEW-SAME-TEXT-REMOUNT, "planning FAIL"; C-R350-01 and C-R351-01 added). Lost: the old "fixed in the sketch or ruled" alternative, and B running the code-reviewer is now a parenthetical |
| RT-L57 | PASS | c352: rc 1 with 9 absent (as K11). c339: rc 0. c339 with `claimCheckMinutes` deleted: rc 1. My own JSON: rc 0 (`l57-check.txt`) |
| RT-SABA | PASS | SR-353-1…5 and §12 are questions or proposals; §12.1 is one question |
| RT-SCREEN (browser) | PASS | `capture.mjs` re-run with the mock at both viewports: row counts 138 / 168 / 118 / 144; no laneErrors; the journey reaches `/studio-lab?preview=middle-east`; position after Play 00:01.483 (1440) and 00:01.471 (1280). **SR-353-1 confirmed:** the last clip (left 2432, right 3072) lies beyond the scroller's right edge (1440 / 1280), scrollLeft 0. **SR-353-4 confirmed by measurement:** at 1280×720 the dialog's scroll area is scrollHeight 691 vs clientHeight 646, so the "Time selection" row is partly hidden until scrolled (`screens/export-dialog-1280x720.png`). At 1440×900 there is no overflow. SR-353-2 (name shown 4× in the lower strip) and SR-353-3, -5 text exist (screen353.json) |
| G353-AUTH (browser) | PASS | Fresh context, both viewports: `/studio-lab` shows the workspace and the demo badge, `auth_user` null. `/studio/middle-east` shows "Sign in required", 0 timeline scrollers and 0 `audio[src]`. `/api/studio-token?product=middle-east&file=stem.wav`: no header 401, fake bearer 403 (mock on). Bodies carry no token. Without query parameters the route returns 400 first (C-R353-02) |
| STUDIO-SMOKE-353 (browser) | PASS | Add Bass, Play: position 00:01.483 / 00:01.471; `data-playing` false → true → false. Dragged the clip stems → sfx: the lane is sfx, Undo title "Undo: Move to track — SFX (Ctrl+Z)", Ctrl+Z restores stems. WAV: RIFF/WAVE, PCM 24-bit, 2 ch, 48 kHz, 768000 frames = 16.000 s, peak 0.2171, 1,535,844 of 1,536,000 samples non-zero, RIFF and data sizes consistent, identical at both viewports |

## Findings (Low, both against B text, not the app)
- **C-R353-01:** L58 lost its "fixed in the sketch or ruled" alternative (see RT-LESSONS).
- **C-R353-02:** the smoke row expected "Undo: Move clip"; the cross-lane label is "Move to track — <lane>" (strings.ts l.701, "Move clip" is the same-lane label). The token row should name the query parameters.

## Gate rows (not claimed here)
full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

## Not done
The optional `product-designer` consult on SR-353 was not run. Product code was not changed or measured beyond the rows above.
