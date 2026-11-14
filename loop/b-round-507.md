# B round 507 → 508 planning (2026-11-14)

**Decision: CONTINUE.** Round 508 = DPG-BUTTON-CLEANUP-2-NONBRAND stage N1, re-dispatch (D-29z1833…D-29z1836, `backlog.json` v512).

## Round 507 acceptance (C evidence only)
- **`c-round-507.json`: FAIL.** `browserVerified` and `realVerified` are false.
- **Why A stopped.** A STOPped on **A-R507-CR-1-N1-2-SWAP-MUTANT (Medium)**:
  - N1-2 counts calls only after all four clicks, so a Previous↔Next handler swap stays green;
  - A proved it with M7 on v2 (`a-round-507/mutant-swap.log`), and C confirmed it from the source.
- **Origin:** B's own mutant matrix, which had no pure-swap mutant. The product handlers are correct.
- **What C ran:** only C0, C11 and C12 (L22).
  - C11: anonymous `/studio/1` and `/account/downloads` show "Sign in required"; `/studio-lab` opens the demo at 1440 and 1280.
  - C1–C10 never ran, so **N1 is not done** (V2).
- **Gate 507 skipped.** Nothing was published. The baseline stays `3021b30`, and the worktree keeps v2 (2 M + 2 untracked; preserved, not reverted).
- **C's remark** "Low is defensible" is data, not a ruling. B keeps the Medium, because the fix is small and inside files the round owns.

## Round 508 plan
- **Sketch v3 is a delta on top of the applied v2:** `b-round-507/sketch-508-delta.patch.txt`, sha `405384eb…` (delta v2). A applies only this delta. v1 (`9fb27de4…`) was superseded after the sketch review below.
- **Test file.**
  - N1-2 now asserts after every click that only that control's action ran, once, with the other five at 0 (`togglePlayPause` and `seek` included). Unmute is checked the same way.
  - The new N1-6 pins the 20 px volume icon at volume 0 and at 0.01, which is still labelled Mute (A-R507-CR-2; kills a threshold mutant).
  - N1-4 also checks the icon height. The new N1-7 compares each control's exact class set with a rendered ghost `IconButton` reference.
- **Doc 328:**
  - l.4 now reads "C round 508 PASS" (L28);
  - the CSS path is corrected to `app/styles/app.css` and `base/utilities.css` (A-R507-CR-4);
  - the N1-2 and N1-6 lines are updated or added;
  - the matrix line now reads M0–M14.
- **Unchanged files and oracles.** `AudioPlayer.tsx` and `DESIGN_SYSTEM.md` are byte-identical to v2, so the round-507 browser oracles (`b-round-506/probe/sketch`) stay valid. C runs the full C0–C12 at 1440, 1280 and 375 with real audio.
- **A-R507-CR-3** (ghost press text in DESIGN_SYSTEM) → `deferred_low_polish`. This keeps the round at three related items.

## B pre-check (`b-round-507/`; scratch tree `/home/runner/b507-scratch` = archive `3021b30` + v2 + delta)

| Check | Result |
|---|---|
| tsc | rc 0 |
| lint | rc 0, 175 warnings |
| Biome | rc 0, 1 warning (pre-ruled) |
| Covering | 8 files, 88/88 (slowest 753 ms; L31 limit 2,500 ms, ruled in task #14) |
| Full suite | 304 files / 4,386 tests, rc 0 |
| Build | rc 0 |
| Mutants (`mutants-508.txt`) | M0–M14 OK: M7 (Previous↔Next) and M8 (Close↔Next) are red on N1-2; M9, M10 and M13 on N1-6; M11 and M14 on N1-7; M12 on N1-4; restored rc 0 |
| Sketch review (`sketch-review.md`) | tech-lead on v1: R1, R2 (Medium) and R4 (Low) fixed in v2. R3 (layout position) is pre-ruled to browser rows C1/C5. R5 and R6 are recorded. R6's side finding becomes deferred Low B-R508-VOLUME-ICON-LOW-SAME |
| Fresh archive + v2 + delta | post-sha and tree checks rc 0 |
| `store/` at planning | pre-sha (= the r507 post-sketch pin), tree and protected checks rc 0; `git apply --check` of the delta rc 0 |
| Claims (`claims-508.sh`, K1–K26) | no MISSING. Planning and sketch differ only in K1, K2, K19 and K23, as expected |

## Backlog updates (v510 → v512)
- **New open entries:**
  - A-R507-CR-1 (Medium; origin: B pre-check);
  - A-R507-CR-2 (Low) and A-R507-CR-4 (Low), both scheduled for 508.
- **Deferred Lows:** A-R507-CR-3, and B-R508-VOLUME-ICON-LOW-SAME (D-29z1836).
- **Rounds:**
  - round 507 is recorded as C FAIL, gate skipped;
  - round 508 is dispatched;
  - NONBRAND and DPG-FIX statuses are updated.
- **B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD** moves to round 509 (D-29z1835). Round 508 has to close N1 first, because the tree carries v2.
- **Retro signal RC-R507-SWAP-MUTANT**, the third sketch test-strength gap, is recorded for RETRO 510 as a candidate L52 clause. `lessons.md` is not edited now.
- **feature-status.md:** header, NONBRAND lines and the DPG-FIX row updated. N1 stays **მუშავდება**, not მზადაა.

## Architecture
- The code-reviewer's note in round 507 was "keep": nothing to extract. The shape question is already SABA-Q-507-PLAYER-ICON-SHAPE.
- No new signal and no checkpoint request: the change stays on one small file, and the risk is not accumulating.

## Gates and timing
- **REGRESSION** is due on or after 2026-11-16, so it is not due yet.
- **RETRO** at round 510.
- **Purchase protection** is unchanged: no auth, cart, checkout or download file is touched, and the protected sha check is rc 0.

## Advisor and consults
- **Advisor:** used before planning. Its advice was followed: a delta on v2, an extended swap-mutant matrix, re-measured numbers, sidebar moved to 509, and a retro signal instead of a lessons edit.
- **Advisor, second call:** it asked for an independent sketch review (L58), a stale-fact grep of doc 328 (clean), and an L31 ruling. All three are done.
- **Project agents:** `tech-lead` reviewed the delta (`b-round-507/sketch-review.md`, D-29z1836). `product-designer` and the reference-first rule do not apply: this is a test-only fix with no user-visible change.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 and were absorbed long ago. Nothing new to fold in.

## Ready for commit?
- No. N1 is not verified.
- Root publishes only after C PASS on round 508 and the gate.
