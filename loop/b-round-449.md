# B round 449 → 450 planning report

- **Date:** 2026-11-11.
- **Decisions:** D-29z1597 … D-29z1601. `backlog.json` goes from v437 to v439, through `b-round-449/update-backlog-accept.py` (v438) and `update-backlog-retro.py` (v439).
- **Advisor:** available. I consulted it after orientation and before writing, and again before hand-off.
- **Consults (actually run):**
  - `tech-lead`: retro candidates, lessons, the systemic task, counters and the Architecture note (`b-round-449/consult-tech-lead.md`).
  - `product-designer`: the screen and journey review (`b-round-449/consult-product-designer.md`).
  - Not consulted: `qa-engineer`, `consequence-tester`, `design-philosopher` and `first-visit-host`. They are not on B's consult list (2026-11-04 §6).
- **Baseline:** gate 449 is `published`, commit `a8599a2` (both remotes). `git rev-parse HEAD` = `a8599a2`, and the tree is clean. `context/head-sha.txt` (`48e16b8`) is stale.
- **Archive:** `tasks/round-449.md` is a byte-identical copy of the round-449 task. Before-copies of every planning input are `b-round-449/*-before-450.*`. The checkpoint is `b-round-449/checkpoint.md`.

## 1. Round 449 accepted (D-29z1597)
- **C evidence:** `c-round-449.json` is a PASS.
  - `browserVerified` and `realVerified` are true.
  - C1–C7 and C9–C13 passed, with 0 bugs.
  - C8 (WebKit) is BLOCKED because the runner has no WebKit. It is listed under `blocked`.
  - B's run of `tools/l57-check.py` is OK (`b-round-449/l57-check-c449.txt`); `tools/l58-check.py tasks/round-449.md` is OK.
- **Gate 449:** published `a8599a2`; COMMIT OK; review score 9/10.
- **STORE-2b-3a is done.** STORE-2b-3a is a Store stage, not a scoped Studio feature (FB/SRW), so the "browser half" rule is met: C ran C3–C7 and C9–C12 in Chromium.
- **Carried items:**

| Id | Ruling |
|---|---|
| A-R449-REVIEW-GT1-TSX (reviewer: Medium) | **Kept Medium.** By B's own grep at `a8599a2` (`b-round-449/data/dead-importers.txt`, from `dead-importers.sh`; claim K31), the only TSX hit is `CinemaCurtainLoader.tsx:208–210`, which is referenced only by two barrels (dead). No live regression. First routed to row GT1b of 2b-3b (D-29z1597), then moved into SYS-R450-STORE-STYLE-SCAN (D-29z1601) |
| TL-R449-L3-SCAN-ROOTS | Its text said "TSX … 0 hits today", which is wrong (one dead hit); corrected. `confirmedBy` A's Low (`studio.css` outside the scan) |
| A Lows | Parser strings → `confirmedBy` TL-R449-L4. New, both deferred: A-R449-REVIEW-L-FILL-REGEX and A-R449-REVIEW-L-TEST-HYGIENE |
| Gate 449 | Low 1 → `confirmedBy` TLM-R449-WEBKIT-HEADING-INK. Low 2 → GATE449-S2-BARE-SPANS (deferred). Low 3 and the Architecture proposal → LEGACY-DEAD-STORE-COMPONENTS (`confirmedBy` + signal). Info 4 → `confirmedBy` SABA-Q-LEADMAGNET-EYEBROW-TONE. Info 5 stays with STORE-5 |
| C9 control (HEAD-vs-HEAD 8 px in 2 of 3 runs) | INFO-C449-C9-HEAD-CONTROL-FLAKE. It does not affect the PASS, because tree-vs-HEAD was 0 px in every run. B identifies what paints at y309–311 before 2b-3b's Studio pixel rows |
| Mock API down for both A and C | ROOT-REQ-ENV-MOCK-API-HEALTH (root, non-blocking) |

## 2. Round 450 = RETRO 450 (D-29z1598 … D-29z1601)
- **Window:** 435–449, per `retro_policy`. The "436–449" in the old `b-next.json` is corrected.
- **Report:** `retros/retro-450.md` (Georgian). Its data come from `b-round-449/data/`, produced by the copied scripts in `b-round-449/*.py`.
- **Main numbers:**
  - $264.79 in total; round median $17.87; B median $13.11; B share 75.0 %.
  - 14 PASS, 1 FAIL (438).
  - `browserVerified` 15/15.
  - 5 C bugs; 2 A STOPs; 45 deferred Lows.
  - L57 INCOMPLETE on 442, 443 and 447; L58 14/14.
  - New issues Saba found: 0.
  - Screen line counts equal 435's.
- **Lessons** (60 lines; ids unchanged; all from `tech-lead`):
  - L4: "Port preserves HEAD" (4×).
  - L22: an A STOP that names an unruled Medium+ is a short FAIL. Two cases: 442, and 439 (found at the advisor check).
  - L60: no shell string-replace, `git stash` or `git checkout --` in the store tree.
  - L1: one evidence id.
  - The diff is `b-round-449/lessons-diff.txt`.
- **Systemic task:** SYS-R450-STORE-STYLE-SCAN (test-only). One shared style-scan helper for `store-teal-sweep` and `store-gradient-text`. It closes A-R449-REVIEW-GT1-TSX plus 6 Lows, and runs before STORE-2b-3b.
- **Screen:** `user-review/screen-review-450.md`. SR-450-1…5 are `awaiting_user` candidates and are not implemented.
- **Saba:** `user-review/questions-retro-450.md`, Q1–Q7, each with a default.
- **Root:**
  - ROOT-REQ-GATE-L57-UNRULED-MEDIUM (new, proposal): this is the gate half of the new L22 clause.
  - ROOT-REQ-PLAYWRIGHT-FIREFOX is re-raised.
- **Architecture:** SIG-R450-STORE-TEST-RATCHETS is answered by the systemic task. The two smaller signals are recorded. No frontend-architect checkpoint is requested: the risk is test-only and the systemic task covers it, and no app-code owner is accumulating structural risk.
- **Disagreement, recorded rather than averaged:** `tech-lead` reads CLAUDE.md as requiring Saba's permission to delete the dead Store files. B reads Saba's 2026-11-10 legacy-removal policy as that permission. TestimonialsSection is the exception, because of the keep-list. Saba is informed in Q6 and can stop it before 2b-3d.

## 3. Ready for commit
Round 449 is published (`a8599a2`). Round 450 changes no store source, so there is nothing to publish from the code. The loop-state commit records the RETRO.

## 4. For Saba
See `user-review/questions-retro-450.md`:
- Q1: Firefox (root install).
- Q2: the Safari list.
- Q3: real IME.
- Q4: the parked PERF parts.
- Q5: a proposal on `git apply` vs the primitives hook.
- Q6: information on deleting the dead Store files.
- Q7: information on the Overview source pins.

Also SR-450-3: the header "Sign In" button competes with "Buy Now" on the product page. Changing it would change the look of the global header, so it is yours to decide.

Still open:
- AGREE-STEM-LANES;
- RETRO 435 Q4 (From/To);
- SABA-Q-TESTIMONIALS-UNMOUNTED;
- SABA-Q-LEADMAGNET-EYEBROW-TONE;
- SABA-Q-HIREUS-EMAIL-THEME;
- SABA-Q-CHECKOUT-RIPPLE;
- SABA-Q-LEADMAGNET-NAV-RULES;
- SABA-Q-LEADMAGNET-RECORDINGS-SCENES;
- SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE.

## Artifacts
In `b-round-449/`:
- **Claims:** `claims-450.sh`, `claims-450-planning-output.txt` (stderr empty), `k22-ids.txt` and `cited-artifacts.txt`.
- **Manifest:** `r450-tree-sha256.txt` (1,369 entries, rc 0).
- **Retro data:** the scripts `*.py` and `misc-outputs.sh`; their outputs in `data/`; the input files `backlog-retro-input.json` (v438) and `archive-findings-snapshot.json`.
- **Screens:** `screens/` (12 PNGs, `capture.log`, `screen450.json`).
- **Consults:** `consult-*.md`.
- **Updates:** `update-backlog-accept.py`, `update-backlog-retro.py`, `edit-lessons.py` and `update-feature-status.py`, each with a `.done` marker.

## Advisor follow-up (same planning)
- **`audio/Timeline` is confirmed dead.** It has no `<Timeline` use and no import, and 0 files import from the root `~/components` barrel. The word hits in `studio.$productId.tsx`, `TransportBar.tsx` and `SfxSceneBuilder.tsx` are comments or aria text. The evidence is saved as `data/dead-importers.txt` and checked by claim K31.
- **The L22 evidence is 2×.** Round 439 had the same shape as 442: A STOPped on A-R439-REVIEW-M1, C still wrote PASS, and the gate published `efd71f6` before B ruled.
- **RT-LESSONS states exactly what must be equal.** The rule sentences must match word for word. The heading label and the evidence lists may differ.
- **The round-450 row in `feature-status.md` reads მუშავდება** (in progress), not მოწმდება (being verified).
- **SYS-R450 reads the frozen `studio.css` read-only.** So TL-R449-L3 closes whole.
