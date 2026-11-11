# B round 453 → 454 planning

**Date:** 2026-11-11.
**Advisor:** available. Consulted after orientation, before writing. The advice was followed:
- close round 453 first;
- rebuild the inventory (the first scan missed multi-line selectors and keyframes, and covered `app.css` only);
- decide the split from a HEAD browser probe;
- keep the helper fix as its own sub-stage;
- add ruling lines for the player, ProductCard on the protected downloads page, and palette contrast.

**Consults:**
- `product-designer`: teal-free states for the 5 live groups.
- `tech-lead`: sketch review, read-only, own clone `/tmp/tl454` (result in `b-round-453/sketch-review.md`).

## Inputs read
- **Round 453:** `current-task.md`, archived byte-identical as `tasks/round-453.md`. `a-round-453.md`, `c-round-453.md`, `c-round-453.json`.
- **Gate:** `gates/gate-round-453.json` (`published`, `db641ec`); `gates/round-453/review.md`.
- **Context:** `context/active-summary.md`, `lessons.md` (B part), `regression-last.json` (2026-11-10, round 425 → next due 2026-11-13).
- **Specific backlog ids:** STORE-REDESIGN STORE-2 split (2b-3c/2b-3d), D-29z1604, D-29z1609, D-29z1610, A-R451-REVIEW-L2, INFO-TL-R451-GLOW-CALC.
- **Spec:** `docs/technical/store-redesign/store-redesign-spec.md` (rule 1, rows STORE-2 and STORE-5), `direction-decision.md`.
- **User files:** `user-review/` has no decision file newer than round 452.
- **Backups:** `b-round-453/{current-task,backlog,feature-status,b-next}-before-454.*`.

## Round 453 result (only C's independent evidence counts) — D-29z1611
- **C round 453 PASS:** C1–C13 + C4b, `browserVerified`/`realVerified` true, 0 bugs, mutants equal to B's 21 lines.
  - C11 measured the legacy stubbed playhead and the Export hover: teal `0 0 40px` → none.
  - C12: Studio and anonymous purchase protection equal to HEAD.
  - BLOCKED (backend unavailable in cloud): fake-bearer, isLoading, legacy ownership.
- **Gate 453:** published `db641ec` (COMMIT OK, 8/10).
- **STORE-2b-3b: მზადაა.**
- **A's reviewer:**
  - **Medium (stale `DESIGN_TOKENS.md:89`, `button.md`, `DESIGN_SYSTEM.md`):** ruled Low as A-R453-REVIEW-L-DESIGN-DOCS-STALE, owner STORE-5 (the spec row STORE-5 updates exactly those docs).
    - Why Low: docs only, with no user effect, and GS1/GS2 fail any re-added glow.
    - An interim warning line goes in every STORE-2b task (it is in the round-454 task).
  - **Lows:** A-R453-REVIEW-L-GS-TEST-GAPS → 2b-3c-2; A-R453-REVIEW-L-BOXSHADOW-TRANSITION → 2b-3d.
- **Gate findings:**
  - 1, 4 and 5: info. GATE453-I1 closed; GATE453-I4 closed with C's measurement; GATE453-I5 → 2b-3c/2b-3d inventory.
  - 2 and 3 → GATE453-L2-L3-INERT-GLOW-CLASSNAMES (2b-3d / legacy removal).
- **Architecture notes:** signals only, not scheduled — SIG-R453-APPCSS-SIZE (an ARCH-SPLIT input) and SIG-R453-CSSRULEBODIES (considered at 2b-3c-2).
- **Script:** `b-round-453/update-backlog-454a.py` (backlog v445).

## Next task: round 454 = STORE-2b-3c-1, live teal CSS (D-29z1612)
Regression is not due before 2026-11-13. The task is in `current-task.md`; the evidence is in `b-round-453/`.

**STORE-2b-3c split:**
- **3c-1:** every live teal rule.
- **3c-2:** the test-only helper fail-open forms plus the GS test gaps, with a golden test.

**Inventory** (`inv/`): all 5 tracked CSS files; reachability from routes, root and entries (259 of 349 modules).
- **Live (5 groups):**
  - global AudioPlayer;
  - ProductCard light (`::after`, and a teal stop in `::before`);
  - 404 page;
  - palette selected row;
  - `.styled-scrollbar`.
- **Dead → 2b-3d:** the list is in the backlog split, including the `inline` preview variant, which no caller uses [K7].
- **Frozen legacy-only:** `.stems-loader-list` and `slider-thumb-teal`.

**Sketch v4** (sha `9f6fcb40…`, 3 files + doc 297; v4 = v2 plus the fixes from two `tech-lead` delta reviews), checked on the sketch:

| Check | Result |
|---|---|
| Covering | 14 files / 134 tests |
| Typecheck | rc 0 |
| Lint | 205 warnings (= HEAD) |
| Biome on the new test | clean |
| Full suite | 284 / 4138 |
| Build | rc 0 |
| HEAD control | LT1, LT2, LT3, LT5 red; LT4, LT6 green |
| Mutants | 24 red on their rows; BASE, C1 and C2 green (27 lines) |
| Browser compare, HEAD `:5182` vs sketch `:5181` | 19 rows ALL_OK at 1440 and 1280 |
| Extras: CSSOM live-teal sweep over 8 states, default motion, thumb focus, palette longest and empty, dialog-scoped scrollbar | 8 rows ALL_OK at 1440 and 1280; the sweep finds teal on HEAD (2/7/8/3/3/3) and 0 on the tree |
| L58 check | OK (`b-round-453/l58-check.txt`) |
| HEAD vs HEAD control | fails, as it must |
| Scrollbar pixels | `15,94,87` (1046 / 524 px) → `115,107,96` |
| C12 (Studio and purchase protection) | equal |
| Claims dry run (patch + placeholder doc) | only K10 and K12 differ |
| Obsidian block | byte-identical |

v1 differed only by the `::before` stop, which the v1 browser run caught (artifacts in `v1-superseded/`).

**`tech-lead` review of v2:** APPROVE-WITH-CHANGES. v3 fixes all six findings (`b-round-453/sketch-review.md`; v2 artifacts in `v2-superseded/`):
- **M1** (teal via token var or 8-digit hex) → LT6, mutants M17 and M18.
- **M2** (count-neutral swap, second override rule) → LT5 and the LT1 header counts, mutants M19 and M20.
- **L1** stale comment deleted.
- **L2** dead stagger pin dropped.
- **L3** `color-mix` with the foreground token instead of raw ink literals.
- **L4** legacy mixed-scrollbar ruling line.

**Other notes:**
- **Environment:** a cold sketch server reloaded during the first `/studio-lab` digest (a Vite dependency optimisation). The run was repeated after warming, and the task tells C to warm twice.
- **New ids:** TLM-R454-FIREFOX-SCROLLBAR (deadline RETRO 465).
- **Architecture checkpoint:** none requested. This is a Store CSS stage on a single owner with deletions only.
- **Script:** `b-round-453/update-backlog-454b.py` (backlog v446).

## Advisor final check (D-29z1614)
- **Reviewed equals dispatched.** Two `tech-lead` delta reviews were run (v2→v3, v3→v4), giving v4. The one remaining Low, TL-R454-L-BRACE-PREFIX-HEADER, is ruled to 2b-3c-2. `l58-check` OK.
- **`product-designer` states mapped to rows,** with the new C6b extras and CSSOM sweep. The stagger and no-image rows are ruled out with reasons, and Safari is added to the TLM row.
- **INFO-B454-PREVIEW-AUDIO-ELEMENT** verified in source: the preview plays through `new Audio()`; the sampled DOM `<audio>` is the hero music.
- **User files:** the decision files in `user-review/` were not reopened; mtimes are job-restore times, so a `-newer` check proves nothing.
- **`agent-workflow.md` on disk** lacks the post-2026-10-19 sections that the prompt snapshot carries → ROOT-NOTE-R454-WORKFLOW-DOC-SNAPSHOT.
- **Backlog:** v446 + D-29z1613/D-29z1614.

## Queue after 454
- **Round 455:** REGRESSION-2026-11-13 (if planned on or after 11-13) or STORE-2b-3c-2.
- **Then:** 2b-3d, 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule.
- **Next RETRO:** round 465.

## Readiness
- **Ready for commit:** none. Gate 453 already published round 453. Round 454 is not implemented.
- **Not COMPLETE:** STORE-REDESIGN and the rest of the queue remain, along with the deferred Lows, the Tech Lead manual checks, SRW-21 (`deferred_user`) and STEM-LANES (awaiting Saba).
- **Not BLOCKED:** every round-454 browser row runs in the cloud.
- **Board:** `feature-status.md` is updated (round 453 მზადაა; round 454 მუშავდება).
