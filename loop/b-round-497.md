# B round 497 → 498 planning (2026-11-13)

**Decision: CONTINUE.** The next round is 498: DPG-BUTTON-CLEANUP-2, stage 2a. Four status pages move their CTA links to `buildButtonClassName`.

## Inputs read
- `context/active-summary.md`
- `current-task.md` (round 497), now archived as `tasks/round-497.md`
- `a-round-497.md`, `c-round-497.md`, `c-round-497.json`
- `gates/gate-round-497.json`: **published**, commit `5d12c75` on both remotes. This is the baseline for round 498.
- `gates/round-497/review.md`: 5 Lows and one Architecture note.
- `regression-last.json`: 2026-11-13, next on or after 2026-11-16, so it is **not due**.
- `user-review/`: no new answers. `root-pre-push-review.md` and `publication-checkpoint.json` are old (2026-10-07) and add nothing new.
- `lessons.md` (B section).

## Round 497 result (D-29z1782): from C evidence only
- **C PASS, `browserVerified` and `realVerified` true.** C0–C14 passed. C15 missed its literal criterion; see below.
- **Closed:**
  - B-R496-404-BROWSE-STORE-UNSTYLED (C2/C6);
  - A-R496-CR-GS3-GUARD and A-R496-CR-BC1-PIN (C10/C11);
  - Lows A-R496-CR-BC3-SELF-DERIVED and A-R496-CR-BC4-NEAR-VACUOUS.
- **DPG-BUTTON-CLEANUP stage 1 is C-verified.** It is not "done": stage 2 and the DP gate remain.

## Findings (D-29z1783)
- **C497-HDR-HEIGHT-SIGNED-IN (C, Low)** and **GATE497-L1** confirm A-R496-CR-SIGNED-IN-SKELETON-SHIFT (deferred) and are recorded as `confirmedBy` on it, not as new ids (L7).
- The C15 "±1 px" criterion was an assert B never ran on its sketch. Recorded as **INFO-B497-C15-UNMEASURED-ASSERT** (L58 recurrence, RETRO 510 counter).
- **GATE497-L2** (Hero CTA "56 → 48 px"): **not reproduced.** The stage-1 HEAD measurement was already 252×48 (`b-round-495/measure/head.json`, HERO), because `px-8 py-4` was dead. Closed with no Saba question.
  - B first drafted a Saba question, then found the measurement and removed its own draft (`questions-round-498.md` is not published).
- **GATE497-L3** → `confirmedBy` on A-R496-CR-LINK-DISABLED-VISUAL-ONLY.
- **GATE497-L4** → new PD-R498-404-SECONDARY-ALIGN (Low). product-designer recommends aligning the 404 to ghost lg pill in its own stage.
- **GATE497-L5-BC1B-RENDER-COST** → deferred Low.
- **Architecture note** (gate reviewer + tech-lead) → **SIG-R498-BUTTONLINK-WRAPPER**, a signal only. Keep the code inline; consider a ButtonLink that wraps the Remix Link only after stage 2. **No checkpoint request:** the change is small, isolated and has one owner.

## Stage-2 inventory and split (D-29z1784)
- **Scan:** redone at `5d12c75` with `b-round-497/scan-brand.py` (token-level, so multi-line `cn()` and constants are covered; mutant-proven, `scan-mutant.txt`). Result: 121 hits / 52 solid (`scan-head.json`).
- **Classes:** see `b-round-497/stage2-inventory.md`.
- **Sub-stages:**
  - **2a** (round 498): the status-page CTA groups;
  - **2b**: route and section CTAs;
  - **2c**: the PurchaseHeader purchase path;
  - **2d**: chat;
  - **2e**: LeadMagnet, keep-list restyle only.
- **Not narrowed:** the 30 non-brand hand-rolled buttons are counted as **DPG-BUTTON-CLEANUP-2-NONBRAND** (Medium).
- **Out of item 7:** selected-state paints (SIG-R498-SELECTED-STATE-PAINTS) and fills, bars and badges.
- **Protected files:** ROOT-REQ-DPG-BUTTONS-PROTECTED. **Studio:** outside the Store block.
- **account.tsx:** not touched in 2a, so the D-29z1771 hold wins and the two L8 rows stay deferred.

## Round 498 pre-check (D-29z1785)
- **Consults** (real subagent runs):
  - product-designer: primary → primary/lg/pill, partner → ghost/lg/pill, keep the `<a>` and `releaseLinkFocus`;
  - tech-lead: v1 APPROVE-WITH-CHANGES (ST5 token equality, title, fake timers), then v3 delta APPROVE (`sketch-review.md`).
- **Sketch** `b-round-497/sketch-498-v3.patch.txt`, sha `90786f20…`, on a scratch copy of HEAD:
  - Biome and tsc rc 0;
  - covering tests: 9 files, 120/120;
  - **full suite: 296 files / 4,322 tests, rc 0**;
  - build rc 0, with the CSS bundle hash equal to gate 497's (`app-P1AqvFE3.css`);
  - mutants N1–N11 RED (N11 isolates B2-5);
  - claims rc 0 on HEAD and on the sketch, L58 OK.
- **Advisor closing check** (D-29z1786):
  - the frozen manifest was regenerated without the granted DESIGN_SYSTEM.md (1,401 paths);
  - C6/C7 were measured at HEAD (`measure/head-nav.json`) and are now asserted against that oracle;
  - the e2e sweep root was confirmed (10 specs, 0 hits);
  - N11 was added;
  - K13 now covers the pill row;
  - the C12 delta wording, the doc-320 class rule and the doc-319 status ruling were fixed.
- **Browser, HEAD vs sketch** (`measure/`): all six links go 50 → 48 px tall and 8/12 px → 9999 px radius, and colours equal Button primary/ghost. The FAQ width goes 150 → 134. Ghost contrast is 7.06.

## No source change by B
- B wrote only loop artifacts and the scratch copy `/home/runner/czaba-project/tmp/b497-scratch`, which is outside `store/`.
- At hand-off `git status` in `store/` is clean, and the r498 manifest and the protected manifest are both rc 0.

## Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Still open:
  - DPG-BUTTON-CLEANUP-2 2a–2e and NONBRAND;
  - the rest of DPG P1/P2 and the DP gate;
  - STORE-2c..5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, the STUDIO-PERFORMANCE remainder, T12-ADVANCED, phase 2 and STEM-LANES (awaiting Saba);
  - the High B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (root);
  - all deferred Lows before final acceptance.
- **Not BLOCKED:** round 498 needs no external input.
- **Ready for commit:** nothing new from B. Stage 1 was already published by root.
