# C round 505: DPG-BUTTON-CLEANUP-2 stage 2d (/support chat buttons + focus)

**Verdict: PASS for product behaviour** (browserVerified true; 1 Low finding awaiting B's ruling). JSON: `c-round-505.json`.

**Scope note:** this is a Store `/support` round, not a Studio audio/video round. No audio graph, WAV export or video transport was in scope; `/studio-lab` got a smoke check only.

## A's STOP
A stopped on A-R505-CR-1 (B2D-7 never focuses "Start Chat" before the guest form unmounts). No B ruling existed. I ran the browser rows anyway (L22 asks only for C0/C13/C14).
- Confirmed by reading B2D-7: the gap is real.
- I rate it **Low**, not Medium: the real path is browser-measured (`activeAfterStart` = TEXTAREA at 1440, 1280 and 375) and mutants M6–M8 are red.
- **For B:** rule (a) Low, deferred, or (b) grant the one-line `.focus()` edit and re-issue the post-sketch sha.

## Results (evidence in `c-round-505/`)
| Row | Result | Evidence |
|---|---|---|
| C0/C14 scope | 7 modified + 2 untracked; checks 2 and 4 rc 0 | `c0-status.txt` |
| C1–C7 browser (3 viewports) | `after.out` equals `probe/sketch.out` except timestamps; differs from `head.out` | `after.out`, `after/` |
| C1 | Start Chat 398×48, radius 8, brass; Send 40×40, radius 12, icon 20; empty Send disabled, opacity 0.5, pointer-events none; card 337 px | `after.out` |
| C7 | After Start Chat focus is TEXTAREA (HEAD: BODY); in-flight focus stays on "Back to support options"; Enter-send keeps field focus, `focusVisible` true | `after.out` |
| C8 | 94 hits / 33 solid | scanner |
| C9 | 6 files, 80/80, B2D-0..9 present | `covering.log` |
| C10 | M1–M15 RED on expected rows, restored rc 0 | `mutants.out` |
| C12 | Fresh no-credential context: `/studio/1`, `/account/downloads` show "Sign in required", no owned download link; `/studio-lab` opens demo at both viewports (premium auth not bypassed) | `c12.out`, `studio-lab-*.png` |
| C13 | 0 MISSING; only K2 differs (expected) | `claims.out` |

## Not verified / limits
- Blocked: real chat backend, SignalR and admin replies ("backend unavailable in cloud"). Chat rows after Start Chat are stubbed (client path only).
- I did not separately re-measure the 2px focus offset (`outline` read "solid 1px" in the probe, equal to the sketch). I viewed only `studio-lab-1280.png` among the screenshots.
- I did not fully trace DESIGN_SYSTEM prose or doc 326 D1–D4 numbers (C11 is partial).
- Gate rows (full vitest, build, biome, verify) belong to the root gate.
