# C round 508 — NONBRAND stage N1 (AudioPlayer ghost IconButtons), v3 delta

**Verdict: PASS. browserVerified/realVerified: true. 0 new bugs.** Evidence in `c-round-508/`.

| Row | Result | Evidence |
|---|---|---|
| C0 scope | 2 M + 2 untracked; frozen checks 1, 2, 4 rc 0 (start and end) | git status, sha checks |
| C1 rest | `after.jsonl` has 0 diffs vs `sketch.jsonl` (±1 px). Prev/Next/Mute 40², Close 32², radius 12px, rgb(163,155,142), opacity 1 | `after/after.jsonl` |
| C2 hover/press | hover bg rgb(29,26,23) / text rgb(236,230,218) on all 4; Close pressed centre = rest centre, scale 0.95 | after.jsonl, behaviour.json |
| C3 focus | `fv` true, offset 2px, 4 controls × 3 viewports; mouse click on Mute → fv false; crops reviewed (Mute all sides; Close right side clipped as at HEAD) | `after/*-focus.png` |
| C4 contrast | 7.2 on all (≥3) | after.jsonl |
| C5 layout | player h 90 / 90 / 243.8; playCx 720 / 640 / 187.5; screenshot shows no overlap | `after/layout.json`, `after-1440-player.png` |
| C6 real audio | plays (t advances 2.47→3.47); Mute vol 0 + Unmute title; Unmute vol 0.7; Close → no button, paused t 0; 0 errors; activeAfterClose BODY (as HEAD, recorded) | `after/behaviour.json` |
| C7 grep | nonbrand 54 hits/28 files; brand 92/31 solid; K3 1/4/0/0 | live output |
| C8 tests | 8 files, 88/88, N1-1…N1-7 present, no test ≥ 1 s | `covering.log` |
| C9 mutants | M0–M14 all OK, restored rc 0, diff vs `mutants-508.txt` empty; M7, M8 red on N1-2; M11, M14 red on N1-7 | `mutants.txt` |
| C10 docs | DESIGN_SYSTEM: one added ghost paragraph; doc 328 l.4 exact, 7 template headings in order, CSS path l.44, N1-6/N1-7 and M0–M14 present; 0 "pending" | grep output |
| C11 protection | fresh contexts: /studio/1 and /account/downloads show Sign in required, no download files; /studio-lab demo opens at both viewports | `c11b/c11.json`, `c11b/studio-lab-*.png` |
| C12 claims/L57 | 0 MISSING; only K1/K2 differ as expected; L57 rc 0 | `claims.txt`, `l57-check.txt` |

## Environment notes (not bugs)
- Warm-up probe failed on the cold Vite dev server; discarded as the task says.
- C11 run 1 hit cold-hydration `useState` null errors, and /studio/1@1440 did not show Sign in. The rerun (`c11b`) was clean. Run 1 is kept as `c11-run1.json`.

## Observations
- The focus ring is 1px at 80% brass, equal to the oracle. It is not 1.5px as in the older SABA-B-4 text. Pre-existing, outside N1.
- The home hero background is still teal (DPG teal-purge scope).
- A's X1/X2 icon-identity mutants were not re-run by C. They fall under pre-ruled #13.
- Gate rows (full suite, build, Biome, verify) are left to the gate.

Closes A-R507-CR-1, CR-2, CR-4. N1 is verified.
