# B round 452 → 453 planning

**Date:** 2026-11-11.
**Advisor:** available. Consulted twice: after orientation (before writing) and at the final check. The final check found the K10/K17 claims-equality defect and the unearned BLOCKED on the legacy row; both were fixed (D-29z1610).
**Consults:**
- `product-designer`: primary-button feedback without the glow.
- `tech-lead`: sketch review on v1, then a delta review on v2. Read-only; own clone `/tmp/tl453`.

## Inputs read
- **Round 452:** `current-task.md`, archived byte-identical as `tasks/round-452.md`. `a-round-452.md`, `c-round-452.md`, `c-round-452.json`.
- **Gate:** `gates/gate-round-452.json` (`published`, `ee7cf7c`); `gates/round-452/review.md` and `verify.log`.
- **Context and lessons:** `context/active-summary.md`, `lessons.md` (B part), `regression-last.json` (2026-11-10, round 425).
- **Specific backlog ids:** STORE-REDESIGN split 2b-3a…d, D-29z1604, INFO-C449-C9-HEAD-CONTROL-FLAKE, the 8 ids SYS-R450 closes.
- **Root and user files:** `root-pre-push-review.md` and `publication-checkpoint.json` are old (2026-10-07) and have nothing new. `user-review/` has no new decision file.
- **Backups:** `b-round-452/{current-task,backlog,feature-status,b-next}-before-453.*`.

## Round 452 result (only C's independent evidence counts) — D-29z1608
- **C round 452 PASS:** C1–C12, `browserVerified`/`realVerified` true, 0 bugs. The fake-bearer path is BLOCKED (backend).
- **Gate 452:** published `ee7cf7c` (review COMMIT OK, 8.5/10, verify green).
- **SYS-R450-STORE-STYLE-SCAN: მზადაა.** Closed:
  - A-R449-REVIEW-GT1-TSX;
  - A-R451-REVIEW-M1-GT5-BARREL-SCOPE;
  - TL-R449-L3-SCAN-ROOTS;
  - A-R447-REVIEW-L2 and A-R447-REVIEW-L3;
  - TL-R449-L4-PARSER-QUOTES;
  - A-R449-REVIEW-L-FILL-REGEX and A-R449-REVIEW-L-TEST-HYGIENE.
- **A's reviewer Lows:**
  - R452-CR-L1 becomes `confirmedBy` on TL-R449-D2-BARREL-ALIAS.
  - R452-CR-L2 becomes A-R452-REVIEW-L2-USESDEAD-RETURN-TYPE in `deferred_low_polish` (not C-verified).
  - R452-CR-L3 is logged as info only.
- **Gate review:**
  - L1 → GATE452-L1-GLOW-REGEX-WHOLE-SOURCE (`deferred_low_polish`).
  - L4 → GATE452-L4-DOC295-LOOP-EVIDENCE (`deferred_low_polish`).
  - L2 → `confirmedBy` on TL-R451-L1, L2 and L3.
  - L3 → `confirmedBy` on INFO-TL-R451-FILL-FORMS.
- **Architecture note:** recorded as `confirmedBy` on SIG-R451-STYLE-SCAN-ENGINE-POLICY. It is a signal only and is not scheduled. Round 453 therefore adds no helper scanner; it uses only a local matcher in its own test.

## Next task: round 453 = STORE-2b-3b, glow shadows (D-29z1609)
Regression is not due before 2026-11-13. The task is in `current-task.md`; the evidence is in `b-round-452/`.
- **Scope:**
  - the `--shadow-glow` tokens;
  - the `.btn-primary` and `.button-primary` glows (the stubs also had 2.36:1 hover contrast at HEAD);
  - ui/Button primary and the 2 chat buttons;
  - the D-29z1604-c inventory: the PurchaseHeader "Added" glow and the inert `/store` overlay.
- **Dead and frozen sites** are allow-listed and inert. The frozen legacy playhead and the legacy Export Audio hover lose their teal halo. This is measured on the stubbed client path (HR-LEGACY-STUBBED, C11; B: HEAD `0 0 40px` teal → `none` at both viewports). TLM-R453-LEGACY-PLAYHEAD is superseded.
- **Sketch v2** (sha `6e771091…`, 8 files), checked on the sketch:

  | Check | Result |
  |---|---|
  | Typecheck | rc 0 |
  | Lint | 205 warnings (= HEAD) |
  | Scoped Biome | 6 warnings (= HEAD) |
  | Full suite | 283 files / 4132 tests |
  | Build | rc 0 |
  | Mutants | 21 lines; every mutant red on its rows; BASE, M11 and M20 green |
  | HEAD control | GS1–GS4 red |
  | Browser compare, HEAD vs sketch | 22 rows ALL_OK |
  | HEAD vs HEAD control | fails, as it must |
  | "Added" state (stubbed cart POST) | HEAD glow → `none` |
  | `/store` card | no glow on either tree |
  | `/studio-lab` computed-style digest | equal to HEAD |
  | Smoke and auth guard | equal to HEAD |
  | `tech-lead` | v1 APPROVE-WITH-CHANGES (5 Lows, all fixed); v2 APPROVE |
  | Claims dry run (patch + placeholder doc 296 on a clone) | only K2, K10 and K15 differ, as the task states |
  | Pointer press | no ring on any of the 14 enabled targets, on both trees |
- **Leftover glows** are assigned to one stage each: live ones to 2b-3c, dead ones to 2b-3d. The helper's fail-open forms (A-R451-REVIEW-L2, INFO-TL-R451-GLOW-CALC) go to 2b-3c.
- **INFO-C449 flake:** ruled. Studio rows use a computed-style digest instead of pixels.
- **New ids:**
  - INFO-TL-R453-RULE-MATCHER-NESTING;
  - INFO-B453-STUB-CONTRAST-HEAD;
  - TLM-R453-LEGACY-PLAYHEAD (added, then superseded by the stubbed row C11, D-29z1610).
- **Architecture checkpoint:** none requested. This is a Store CSS stage with no structural risk on a runtime owner.

## Queue after 453
- **Round 454:** REGRESSION-2026-11-13 (if planned on or after 11-13) or STORE-2b-3c.
- **Then:** 2b-3d, 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
- **Next RETRO:** round 465.

## Readiness
- **Ready for commit:** none. Gate 452 already published round 452. Round 453 is not implemented.
- **Not COMPLETE:** STORE-REDESIGN and the rest of the queue remain, along with the deferred Lows, the Tech Lead manual checks, SRW-21 (`deferred_user`) and STEM-LANES (awaiting Saba).
- **Not BLOCKED:** every round-453 row runs in the cloud. Only the backend halves stay BLOCKED: legacy ownership and the fake-bearer path.
- **Board:** `feature-status.md` is updated (round 452 მზადაა; round 453 მუშავდება). Backlog v444.
