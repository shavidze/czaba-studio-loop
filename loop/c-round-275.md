# C — round 275 (RETRO 275 traceability + auth guard + Studio smoke)

**Verdict: FAIL (RT-IDS, two Low document findings only).** `browserVerified` / `realVerified`: **true**. Baseline HEAD `a4c0e24`, clean, frozen list rc 0 at start and end. No app-code defect. Per task §4: RT-FIX lines at the round-276 planning; round 276 runs as planned (SYS-5 stage 1, or REGRESSION if on/after 2026-11-02).

Evidence: `c-round-275/` (scripts `c275-smoke.cjs` = B's `b274-smoke.cjs` with outDir changed, `probe.cjs`, `rt/*` = B's analysis scripts re-run on a byte-identical copy of `backlog-before-275.json`, `screens/`).

| Row | Result | Notes |
|---|---|---|
| SOURCE-SCOPE | PASS | HEAD `a4c0e24…`, `git status` 0 lines, `sha256sum -c` rc 0 (1138), start and end |
| RT-NUM | PASS | All B scripts re-run into `c-round-275/rt/`: every output identical to B's (cost.txt differs only in dict order; rounds json differs in round 274 `b_cost`, see INFO-C275-03, totals unaffected). Totals $154.14/$101.42/$79.38/$334.94, medians 10.51/7.11/5.26, round median 24.12, top-5/top-6, FAIL 260/265/267 = $75.19, gate 11/3/1, groups 188.14/48.79/76.08/21.93, alternatives +19.78 = 68.57 and +21.50 = 70.29, pairs 60.67/35.80/32.18, 9/7 = 1.29, A 6.63/6.79, C bugs M2/L9, 53 items in 11 `review.md` (260/262/265/267 absent), window ids 42 (16/14/6/6; L18 M8 I16) and 34 (14/14/4/2), deferred 462 (16), open Medium+ 5, claims 7…24 (max 265, min 263), 1 STOP (267). Group-by-title checked against `tasks/round-260..274.md` l.1. Retro-260 comparison figures present in `retro-260.md` |
| RT-CAUSE | PASS | §3/§4/§9 trace to the cited jsons, `verify.log` l.1982 (FAIL track-layout), `tasks/round-263.md` §0 l.20, `a-round-267.md` l.3. 8 window Mediums match §4. §9 verdict labelled as `consequence-tester`'s. §7 quote "Test it with a real screen reader in Chromium before deciding" exact (`gates/round-274/review.md` l.19). See INFO-C275-02 |
| RT-IDS | **FAIL** | All named ids reproduce (closures D-29z605, GATE274-S1 Medium `open_tech_lead_manual`, TLM deadline RETRO 290, deferred 464 with the four new Lows, GATE274-ARCH-NUDGE-DESCRIBE, ARCH-CHECKPOINT-SYS6-STATUS-TAG names the addendum, retro_runs 260 done / 275, next_due 290, SR-275-* awaiting_user, final acceptance list, HR-*, D-29z605…612; 11/11 `retro_candidates` dispositioned). **C-R275-01, C-R275-02** below |
| RT-LESSONS | PASS | 59 lines, three parts; diff only l.3, 18, 34; check prints `True True`; L49 clause concrete (grep, `SWEEP` tag, roots, hit count, row or exclusion, C re-runs); citations C-R265-01/02, GATE266-S1, B-R269-DETAIL-ALLTRACKS-DROP, gate 262, C-R272-01 (§3.7 premise false, `c-round-272.md` l.27) open and say what is claimed |
| RT-SABA | PASS | §12 and screen review phrased as proposals/questions; SR-275-2 and Q1 are questions. All seven L46 items carry `l46_retro275` ("passed twice: RETRO 260, RETRO 275") and are in `final_acceptance_saba_manual_items`. F1-ABSOLUTE-SNAP `closed (D-29z592)`. `~/.cache/ms-playwright`: chromium-1200, chromium_headless_shell-1200, ffmpeg-1011 only |
| RT-SCREEN | PASS | 4 PNGs exist; SR-275-1…8 and Q1 visible as described (SR-275-1 wording: INFO-C275-05) (S0 status + Music hint text exact; DEMO-1280 collection label 3 lines; Clip/MASTER share bottom row at 1280). No duplicate of SR-230/245/260. Browser capture `screens.mjs` → `c-round-275/screens/c275.json`: **142/170/121/147, equal to B** |
| G275-AUTH (browser) | PASS | Both viewports, fresh context, 0 cookies/storage: `/studio-lab` workspace 1, badge "Demo collection — no sign-in required", `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`, no workspace; token no header **401**, fake Bearer **500** (no :5199), no token in any body, no page token response. 1440 needed one env re-run (INFO-C275-04) |
| STUDIO-SMOKE-275 (browser) | PASS | Both viewports: `data-playing` false→true→false, name "Play" constant; playhead 0 → 1.172 → 1.691, holds 1.691 after stop; real AudioDestination analyser RMS ≈0.020 playing, 0 stopped. Export WAV 48 kHz / 24-bit / 2 ch, 768000 frames = 16.000 s, 0 NaN, peak 0.2967, flat −24.9 dB every second, **sha256 `1fea093b…f94` = K6**. 0 page errors |

Gate rows (not claimed): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
Claims K1–K7 re-run verbatim: all give the expected output.

## Bugs for B (both Low, against the retro documents, not the app; both sit outside `retro_candidates`, within the retro policy's "every finding that was opened")
- **C-R275-01 (RT-IDS).** `RC-R265-AT-RISK-NO-ROW` is named a "RETRO-275 candidate" in D-29z565 and again ("2nd instance") in D-29z575 and B-R267-GESTURE-ARROW-SPEC-CONFLICT's status. It has no `retro_candidates` entry and no disposition in retro-275 §8 (0 hits in `retro-275.md`). It may already be covered by the round-268 L4 evidence clause, but the retro has to say so.
- **C-R275-02 (RT-IDS).** `architecture_signals` GATE264-ARCH-TEST-HELPER still says "candidate for RETRO 275 / a systemic test-only task", unchanged by this planning and not mentioned in the retro. It needs a disposition.

## Info
- **INFO-C275-01:** the comment in `stops.txt` says no other a-round file has STOP at lines 1–3; that grep actually matches 13 files, all negations ("No STOP"). The count (1 STOP, round 267) is right.
- **INFO-C275-02:** L29's new clause counts C-R273-01 toward "2×", while §9 says C-R273-01 "does not count" (the fact was true; the regex found it) and `consequence-tester` counted it once. §8 discloses this, so it is not a misquote, but "1× + 1 mechanism hit" would be more accurate.
- **INFO-C275-03:** re-running `collect.py` now fills round 274's `b_cost` (16.67), because `b-round-274-result.json` (the round-275 planning) now exists. `cost.py` uses the b-round-(N−1) offset, so `cost-rows.json` and every total are byte-identical.
- **INFO-C275-04 (env):** the first auth@1440 attempt timed out after 150 s waiting for "Demo collection ready". Probable cause (an inference; the compile was not observed): the dev server's cold start. A probe a minute later was ready in 5 s, and the re-run passed. One environment retry was used.

- **INFO-C275-05 (was C-R275-03, downgraded):** SR-275-1 says the four gain formats are visible "(ოთხივე screenshot)". This holds if it means the inconsistency is visible in all four screenshots: "+0.0" ×4 and Master "0.0 dB" appear in all of them. It does not hold if it means all four formats appear in every screenshot: at 1280×720 Clip details is collapsed, so the Clip Gain field "0.0" and the "0 dB" readout are absent. B may narrow the wording.

`shadowRowSeverityVerdict`: PASS (all findings Low). `claimRerunMinutes`: about 3.

Ableton conformance: not applicable (a RETRO round; reference-first policy "Not in scope"). Optional `consequence-tester` consult not used.
