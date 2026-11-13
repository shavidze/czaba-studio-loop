# C round 496: DPG-BUTTON-CLEANUP stage 1 — STOPPED, routed to B

**Verdict: BLOCKED.** A wrote STOP (a-round-496.md): two code-reviewer Mediums on sketch test lines (GS3 only matches exact old selectors; BC1 pins primary/md only). Per L22, C ran C0, C13 and C14 only. The round is not complete and nothing is marked PASS beyond those rows. `browserVerified=false` because the §4 browser rows (C1–C7) were not run as acceptance.

## Rows run
| Row | Result |
|---|---|
| C0 / C14 SOURCE-SCOPE | 13 status lines (11 granted paths + new test + doc 319). r496 manifest rc 0; protected manifest rc 0 (before and after my browser run). Source unchanged by C. |
| C13 CLAIMS | `claims-496.sh`: rc 0, stderr empty, 0 MISSING. Differences from sketch output are only the expected ones: K1 head hash, K2 13 lines, K14 (IconButton line 1195), K15 (319). |
| C14 L57 | `l57-check.txt` (see file); the 12 fields are present as values or null. |

## Extra observation (not acceptance; no PASS claimed)
B's `measure.mjs` ran on the applied tree (`c-round-496/browser/after.json`, summary `after-summary.txt`): every row equals `sketch.json` on display, radius, bg, text colour, padding and box (1440, 1280, 1023, 1024, 375). Header Sign In is `display:none` at 1023 and 375, shown at 1024. The one miss was NF-PRIMARY at 1440 (count 0, a cold dev-server load, as B warned); the recheck (`nf-recheck.json`, `NF-*.png`) shows 160×48 pill, bg rgb(201,164,106), text rgb(14,13,12), hover rgb(217,184,127), Tab focus outline 1px colour at 0.8 alpha, offset 2px, 0 nested buttons, at 1440 and 1280. This hints the sketch behaves as designed, but C1–C7 still need a proper run after B's ruling. Not run: press focus (C3 pointer), menu and modal clicks (C4), Enter navigation (C5), journey (C7), mutants (C11), C12 docs diff.

## Bugs
None found by C. The two Mediums are A's code-reviewer findings (guard strength, no live defect per A's 288-combo equivalence run), for B to rule.

## For B
- Rule (a) test-only addendum (scan all `app/**/*.css` for the retired selectors; BC1 variants table) or (b) downgrade to Low. Option (a) is cheap and keeps the guard honest.
- Carry reviewer #7 (signed-in skeleton 96×48 vs 36px user icon) into the full C run.
- Gate rows stay with root: full vitest, build, Biome, `verify`.
