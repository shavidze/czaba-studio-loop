# B round 495 → 496 planning (2026-11-13)

**Decision: CONTINUE.** Round 496 = DPG-BUTTON-CLEANUP stage 1 (`current-task.md`).

## Round 495 accepted (D-29z1772)
- C round 495 (RETRO 495): PASS, 13 rows, 0 bugs, `browserVerified`/`realVerified` true. The fake-bearer row is BLOCKED (backend unavailable in cloud), which does not make the round unverified.
- Gate 495: `skipped` (no real changes). The baseline stays `3bcf8cb`.
- C's note (find-ids prints the older archive copy first) → INFO-C495-FINDIDS-FIRST-COPY, deferred info.
- `tasks/round-495.md` is a byte-identical archive of the RETRO task.
- No C bugs, so the next task opens the next dependency-ordered scope: DPG P1 (Saba: before STORE-3 and all other work).

## Round 496 plan
- **Scope:** Saba's DPG P1 item 7, stage 1:
  - delete `.btn-primary(:hover,:active)`, `.button` and `.button-primary(:hover)` from `app.css`;
  - add `buildButtonClassName` + `shape: 'default' | 'pill'` to `Button.tsx`;
  - migrate the 404 page (Back Home + the dead `btn-secondary` Browse Store), `/account/login`, `/search`, the Hero, Header ×2 and `AssetListingPage`;
  - port GS3;
  - add the BC1–BC6 tests and the DESIGN_SYSTEM `### Buttons` docs + implementation doc 319.
- **Evidence behind the plan:**
  - **Inventory:** 14 hits in 6 files, from a mutant-proven scanner (`b-round-495/scan-head.txt`, `scan-mutant.txt`).
  - **HEAD browser measure:** `measure/head.json`. The Hero padding is dead, Back to Home is 68 px tall and Browse Store is unstyled.
  - **Sketch measure:** `measure/sketch.json`. Only the planned deltas: login/search 154×48 pill, header radius 6 → pill.
  - **Consults:** product-designer (`consult-product-designer.md`), tech-lead mechanism (`consult-tech-lead.md`), tech-lead sketch review v1 → 6 Lows folded → v2 APPROVE (`sketch-review.md`, names sha 997099ef…).
  - **Pre-check:** typecheck rc 0, lint rc 0, full suite 295/4315 rc 0, 8 mutants red, claims script (`claims-496.sh`, 27 claims, stderr empty), frozen manifest (1,394 entries) rc 0, l58 OK.
- **Disagreement ruled:** product-designer wanted `text-brand-foreground` on Button primary. Tech-lead required byte-identical output for Button's importers, and both tokens are #0e0d0c. Ruled for byte-identity this round; the token rename goes to DPG-COLOR-CONSOLIDATE (PD-R496-PRIMARY-TEXT-TOKEN). Recorded in §1 D3.
- **account.tsx hold vs the two L8 rows:** the hold wins. There are 0 hits in `account.tsx` for stage 1. Stage 2 hits `account.tsx` (4 `bg-brand` lines), so the rows may ride along there (D-29z1771/D-29z1773).

## Advisor closing check (D-29z1777)
The advisor found six gaps; all are fixed.
- **C13:** it compares with the claims script run on a sketch-applied copy (`claims-496-sketch-output.txt`). The doc-driven K14/K15 are named separately.
- **C9:** the command moved out of the table, because the escaped pipes made it vacuous. On HEAD it reads 6.
- **Mutants:** saved as `mutants.sh`; 8/8 red on v2.
- **C8:** a content grep (K28).
- **Rows B had not run:** C3/C4/C5/C7 now ran on HEAD and on v2 in the browser (`measure/head-probe.json`, `sketch2-probe.json`). Every value equals HEAD except the planned visual deltas. `sketch.json` was re-measured on v2, with 0 diffs against v1.
- **Reviewer Lows on sketch lines:** they go to B. A does not edit them, so the sha stays valid.
- **K11:** widened to the e2e specs.

## Not shrunk, not deferred without authority
- "Use Button.tsx component only" stays in scope as DPG-BUTTON-CLEANUP-2: the 115 `bg-brand` lines are scheduled next, not deferred.
- `.btn-icon` stays until DPG-INTERACTION-FIX (a P2 item Saba already listed). It is not in item 7.

## New backlog ids
- DPG-BUTTON-CLEANUP-2 (scheduled).
- PD-R496-PRIMARY-TEXT-TOKEN.
- SABA-Q-496-BUTTONS (awaiting_user; `user-review/questions-round-496.md`).
- Deferred: B-R496-LOGIN-SEARCH-INLINE-STYLES, SIG-R496-LINK-NO-PRESS-SCALE, SIG-R496-UNLAYERED-A-TRANSITION, INFO-C495-FINDIDS-FIRST-COPY.
- Backlog v488, D-29z1772…D-29z1777.
- From the advisor closing check (D-29z1777): B-R496-404-BROWSE-STORE-UNSTYLED (Medium, pre-existing; fixed by round 496) and B-R496-HOME-NESTED-BUTTONS-IN-LINKS (Low, deferred).

## Architecture notes
- No new reviewer Architecture note came in round 495 (RETRO).
- The tech-lead info (the desktop Sign In now sizes as flex instead of inline-block, same measured box) is recorded in `sketch-review.md` for the next visual stage.
- No frontend-architect checkpoint is requested: `Button.tsx` gains one pure function, and no owner has accumulated structural risk this round. ARCH-CHECKPOINT-ACCOUNT-PROFILE and -ENTRANCE-LOADING are still pending with root.

## Why not COMPLETE / BLOCKED
- **Not COMPLETE:**
  - DPG P1/P2, the DP gate, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 and STEM-LANES remain;
  - the High B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED is open with root;
  - the deferred Lows must be fixed before final acceptance.
- **Not BLOCKED:** round 496 needs no external input.

## Ready for commit
Nothing new; gate 495 published nothing (RETRO). After C PASS on round 496, its diff is a stable boundary for root's gate.
