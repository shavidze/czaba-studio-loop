# C round 506: DPG-BUTTON-CLEANUP-2 stage 2e (LeadMagnet actions on `Button`)

**Verdict: PASS.** browserVerified/realVerified = true. No new bugs. Real Chromium (Playwright), fresh no-credential contexts, 1440×900 / 1280×720 / 375×812. Evidence under `c-round-506/`; machine-readable result in `c-round-506.json`.

| Row | Result | Evidence |
|---|---|---|
| C0 scope (start) | PASS: 3 M + 2 ?? only; frozen checks 1, 2, 4 rc 0 | `c0.txt` |
| C1 rest | PASS: all 3 actions BUTTON 320×48, bg rgb(201,164,106), color rgb(14,13,12), 16px/600 uppercase, ls 0.4px, pad 12px 24px, radius 8px, shadow set; types button/submit/button. 0 diffs vs `sketch.jsonl` (±1 px) at all 3 widths. Close X 32 px at y 24 | `analyze.out`, `after/after.jsonl` |
| C2 hover/press | PASS: hover rgb(217,184,127); press opacity 0.9, matrix(0.98…) | `analyze.out` |
| C3 keyboard focus | PASS: fv true, solid, offset 2px on all 3 at 3 widths; crops viewed (free 1280, continue 1440, back 375): ring visible, unclipped. Carried 505 crops (Start Chat, Send ready): ring visible, unclipped (record) | `after/*-focus.png` |
| C4 contrast | PASS: 8.32 rest / 10.28 hover on all 3 (HEAD CONTINUE 6.09) | `analyze.out` |
| C5 validation/error (unstubbed) | PASS: empty -> "Please enter your email address", 0 POSTs; unstubbed -> "Server configuration error", stays on email, INPUT focused, CONTINUE enabled | `analyze.out` |
| C6 sending/success (STUBBED) | PASS: SENDING..., disabled, opacity 0.5, pointer-events none, brass bg, no spinner/"Loading..." (`after-1440-sending.png` viewed); postsTotal 2; success focus BACK TO SITE; Enter closes; lm submitted true. Client path only | `analyze.out` |
| C7 focus targets | PASS: open=Close, email=INPUT, error=INPUT, success=BACK TO SITE; Esc closes, 0 page errors, all 3 widths | `analyze.out` |
| C8 grep | PASS: scanner "92 hits; 31 solid"; K4 `1 3`; K5 `0 0 0`; K6 `1 1 1 1 1 1`; K9 two count-0 lines | `c8-scan.txt`, `claims.out` |
| C9 tests | PASS: 5 files, 108/108, B2E-1..6 present, slowest 923 ms (<2,500) | `covering.log` |
| C10 mutants | PASS: M1-M14 all RED on expected rows, `restored rc 0` | `mutants.out` |
| C11 docs | PASS: DESIGN_SYSTEM only default row changed (LeadMagnet added); doc 327 has 7 template headings in order, l.4 byte-equal, D1-D3 numbers (57.6->48, padding, 6.09->8.32/10.28, rgb values) match measurements; 0 "C round N pending" | git diff, doc 327 |
| C12 protection + studio | PASS: `/studio/1` and `/account/downloads` show "Sign in required", no download links (only /free-downloads) at both viewports; `/studio-lab` opens demo no-credential (6 clips, no pageerror) at 1440 & 1280; check 2 rc 0. Premium not bypassed | `c12.json`, `studio-lab-*.png` |
| C13 claims | PASS: no MISSING; diff vs sketch output only K2 (worktree dirty, expected) | `claims.out` |
| C14 scope (end) + L57 | PASS: same 5 paths; checks rc 0; `l57-check` OK | `c14-*`, `l57-check.txt` |

## Notes
- Warm-up: first cold run failed (dev compile, `documentElement` null) = environment-invalid, replaced (L38). Real run valid first try; no replacement budget spent on it.
- Not run by C (speed rule): full suite, build, verify = gate rows.
- BLOCKED (does not lower browserVerified): real Brevo subscribe, backend unavailable in cloud.
- Studio audio/export integrity: not applicable (Store popup only); `/studio-lab` smoke only.
- Ableton: not applicable. CONTINUE red -> brass is B's listed deviation D2; SABA-Q-506-LM-CONTINUE-COLOUR open (default brass). Not a bug.
- A's CR-1 Low (hooks mock via barrel) and pre-ruled Lows #1-#11 stand; not re-raised as bugs.
- Lesson check: no Saba-found issue in this round.
