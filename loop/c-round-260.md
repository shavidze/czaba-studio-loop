# C round 260: RETRO 260 traceability, auth guard and Studio smoke

**Date:** 2026-10-30. **Role:** C, independent and read-only for source. **Baseline:** `7a960c1`. **Verdict:** **FAIL**, on RT-LESSONS only: one Low lost-clause finding against the retro's L29 rewrite. All browser rows PASS. `browserVerified` = `realVerified` = **true**.
Env: `env-status.json` store 200 (04:01:27Z). The backend at :5199 is not running, which is expected in the cloud. Chromium only.

## Rows
| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | At the start and at the end (`c-round-260/scope-end.txt`, 04:09Z): HEAD `7a960c1511bf…`, status 0 lines, `sha256sum -c` rc 0 (1,118 entries). |
| RT-NUM | PASS | B's 9 scripts were re-run from the loop root, with outputs redirected to `c-round-260/rt/`, against a copy of `backlog-before-260.json`. All outputs are byte-identical except `collect.txt`, which now shows round 259's `b_cost` 14.2 because `b-round-259-result.json` exists. `cost.py` shifts B cost one round, so no retro number uses that field. Hand checks: pair costs 58.68 / 56.45 / 47.46 / 41.65 / 26.37; group sum 355.83; top-5, top-6; A 8.04 / 6.05; bugs medium 7 / low 12; 48 findings in 9 `review.md` files (none on the 6 skipped rounds); 72 / 35 with origin splits; 430 (15); 6 Medium+; STOPs `a-round-250.md` l.5 and `a-round-253.md` l.3; 10+19+5 at `tasks/round-247.md` l.117–120; 12 at `tasks/round-246.md` l.112; retro 245's 12/3, $22.81, $11.44, $15.87. Every round group matches its `tasks/round-N.md` title. Raw cost spot checks match. Section 6: 3+2, 1+1, 1+1 and 1 rounds make 6 stages in 10 rounds, 1.67 per stage. |
| RT-CAUSE | PASS | Every row in §3 matches its `c-round-N.json`. 252: `a-round-252.md` l.5 has the heading "Needs B ruling (not STOPs…)" and l.64 "ruling 1"; 256: M-2 at `a-round-256.md` l.157; D-29z479 adds C-R254-01 to L3. The protocol-miss grep returns no lines (rc 1). `window-mediums-hand.txt` matches the before-copy titles. Inferences and consult lines are labelled. |
| RT-IDS | PASS | Every listed id exists in its class (see JSON). One provenance error is filed separately as C-R260-02 (Low). |
| **RT-LESSONS** | **FAIL** | Covers line count, the 3 parts, the 6 changed lines, the prefixes of L11/L23/L50/L51, the new citations and the regex; the failing part is **C-R260-01**. |
| RT-SABA | PASS | §12 phrases everything as proposals or questions. All 6 L46 items are present with a cloud half labelled as such, or "no cloud path". The R49-T question is there. `~/.cache/ms-playwright` has only chromium and ffmpeg. |
| RT-SCREEN | PASS | All 4 PNGs were opened and each candidate is visible as described. The excluded proposals' citations exist. There are no duplicates of SR-230/245. Re-capture with `screens.mjs` → `c-round-260/screens/`: S0 142/121, DEMO 170/147, equal to B's. |
| G260-AUTH (browser) | PASS | Both viewports. Lab: workspace, the badge "Demo collection — no sign-in required", `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`, no workspace. Token endpoint: no header → **401**; fake Bearer → **500**; no token issued; 0 page token responses. At 1440 the first attempt was invalid (a cold-start 150 s timeout in C's own ready-wait, `browser/c260-attempt1.json`). It was replaced once and attempt 2 PASSED (`browser/c260-auth1440-attempt2.json`). |
| STUDIO-SMOKE-260 (browser) | PASS | Both viewports, one demo pulse clip, audio tapped at the destination. `data-playing` goes false → true → false while the name stays `Play` [K5]. The playhead goes 0 → 1.17 → 1.67 and holds at 1.683. RMS is 0.024 playing and 0 stopped. The WAV is 48 kHz / 24-bit / stereo, 16.000 s, sha256 `1fea093b…3f94` [K6], 0 NaN, −24.9 dB in every second. 0 page errors. |
| Claims K1–K7 | match | All re-run verbatim. K7: `strings.ts` imports `{ studioShortcutTitle } from './shortcuts'`. |
| Gate rows | gate | full vitest, typecheck, build, Biome, verify and e2e smoke: not run by C (speed rules). |

## Bugs (to B)
- **C-R260-01 (Low, RT-LESSONS): the L29 rewrite dropped two operative obligations.** All six claim types and all evidence ids survive. What was lost:
  1. **Render condition.** The old text: "…and **the task's state must satisfy that branch**". The new text names only "the render branch of every named … signal". A tagged grep of the branch re-runs green even when the task's state never renders it.
  2. **Changed meaning.** The old text: "when a command's source changes (position, unit, target), **every readout that names the old source is a consumer row**". The new text keeps only the grep instruction. Both the trigger and the hit → acceptance-row rule are gone, and the row rule is exactly what would have caught C-R250-01.

  This is the C-R245-01 failure mode. Retro §8's "known gap" (a narrow root re-runs green) is a different gap. Fix: restore both phrases inside their claim types.
- **C-R260-02 (Low): wrong provenance in retro §8.** The retro says B-R239 → L49 "in retro 245". The backlog says "applied at round-240 planning: L49". The `applied` status itself is correct. No RT row fails on this; it is filed so that the RT-FIX pass corrects the sentence.

## Info
- Retro §5's `SABA-B-1[2-9]` grep of `agent-workflow.md` proves nothing, because that file has no SABA-B ids at all. `backlog.json` (0 hits) and `policy.local.md` (highest id SABA-B-11) still carry the claim.
- `screen260.json` drops child spans ("Active track: · insert marker"), but the PNGs show the full line.
- The L29 regex finds 7 hit lines in `current-task.md`: l.9 [K3], l.63 [K7], l.46 and l.49 are loop artifacts, and l.91, l.92 and l.94 are the claims table. None is an untagged store claim.
- Reference / Ableton conformance: not applicable (RETRO round).

## Outcome (task §4)
An RT row failed, so B corrects L29 (C-R260-01) and the §8 phrase (C-R260-02) at the round-261 planning and records them in `b-round-260.md`. The next C round re-checks only those lines (RT-FIX). Round 261 runs as planned. There is no Medium+ finding and no fix-up round. Nothing changed in `store/`.
