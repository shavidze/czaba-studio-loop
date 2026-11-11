# C round 450 — RETRO 450 verification

**Verdict: PASS. 0 bugs. browserVerified/realVerified true.** HEAD `a8599a2`, source tree untouched (start and end: 0 status lines, r450 manifest rc 0, protected manifest rc 0). The mock API for row 4 was started from the loop folder and stopped afterwards.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS | status 0 lines; both manifests rc 0 |
| 2 | G450-AUTH (browser, 1440×900 and 1280×720) | PASS | `auth-smoke.json`, `auth-studio-*.png`: `auth_user` null, workspace opens; `/studio/middle-east` shows "Sign in required", 0 `audio[src]`; `/api/studio-token` 401 `{"error":"Please sign in to access Studio."}`. Fake-bearer premium path BLOCKED (backend unavailable in cloud) |
| 3 | STUDIO-SMOKE-450 (browser, both) | PASS | Enter adds 1 clip (0→1); position 00:00.000 → ~00:01.48 after ~1.5 s Play, holds at 00:01.52/00:01.51 after Stop (no drift over 0.8 s); Export dialog opens (WAV 24-bit/48 kHz, MP3, WAV+MP3) and closes with Esc. `smoke-export-*.png`, `smoke-after-*.png`. No export WAV was produced; this round changes no audio, so no sample-integrity measurement applies |
| 4 | RT-SCREEN (browser) | PASS | `screens2/`: line counts 138/168/118/144, outside 97/124/86/101, identical to B; per-cell text arrays equal to B's `screen450.json`. Journey: clips at left 512/1152/1792, status "Melody added … 00:48.000 (nearest free spot)". PNGs match SR-450-1 (Expand › in `sr1-expand-1280.png`, Collapse ⌄ in the demo screenshot), -2 ("0.0" field plus "0 dB"), -3 (filled brass Sign In next to Buy Now), -4 (grey Premium name/price), -5 ("$29.00 USD" vs "$29") |
| 5 | CLAIMS | PASS | `claims-c.txt` identical to B's planning output (diff rc 0), stderr empty, 0 MISSING; last D-ID check inside it unchanged |
| 6 | RT-NUM | PASS | all scripts rerun under `c-round-450/scripts/`, outputs `cmp`-equal to B's `data/`; recomputed totals $264.79 (B 198.56, A 55.61, C 10.62), median 17.87, B median 13.11, min/max 8.14/19.78, A avg 5.47/3.58, 446–449 B average 13.73, 14 PASS/1 FAIL, gate skipped 435/438, stops 439/442 |
| 7 | RT-CAUSE | PASS | C-R438-01 and C-R442-M1 (no `origin`) in the fails-detail output; 439/442 STOP-then-publish; L22/L4/L60 clauses; dead-importers `cmp` same; opinions labelled `tech-lead`/`product-designer`; B-cost cause stays a labelled hypothesis. I did not independently reopen every file in the §3/§5–§8 list (a-round-447, b-round-448, gate reviews): checked via the script outputs and the consult file only |
| 8 | RT-IDS | PASS | `backlog.json` v439; `retro_runs` last = 450 (D-29z1601); `next_due` leads with round 465; the 7 retro candidates carry ruled (D-29z1600) or counter; SYS-R450-STORE-STYLE-SCAN `closes` = exactly the 7 ids, each with `systemic_task` set |
| 9 | RT-LESSONS | PASS | 60 lines, 3 parts; diff hunks 3c3 6c6 9c9 55c55 60c60; l.6/9/55/60 are append-only; l.3 changes only the pointer (retro-450, 435–449) plus the RETRO 450 sentence; the L4, L22 and L60 rule sentences equal the consult text word for word (evidence lists differ as allowed) |
| 10 | RT-CHECKERS | PASS | L57 loop equals B (INCOMPLETE 442, 443, 447); L58 14/14 OK; `l58-check current-task.md` rc 0 "no sketch" |
| 11 | RT-SABA | PASS | retro §12, screen review and questions file frame items as proposals/questions; Q5 labelled a proposal, Q6 states Testimonials is not deleted; 7 defaults present. No approval is claimed as Saba's |
| 12 | SOURCE-SCOPE end + L57 | PASS | 0 lines, both manifests rc 0; `l57-check` rc 0 |

## Notes
- Running `capture.mjs` at the same time as another browser script failed once with "Execution context was destroyed"; a sequential rerun was clean. Harness note only.
- Not tested: WebKit/Firefox (not installed), real premium auth (no backend), Studio audio/export measurement (no code changed).
- The full verify/tests belong to the gate.
