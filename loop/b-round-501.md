# B round 501 → 502 planning (2026-11-14)

**Decision: CONTINUE.** The advisor was available. B consulted it three times: after orientation, after finding the cart bug, and for the closing check.

## Inputs read
- `context/active-summary.md`, the B section of `lessons.md` (truncated per line), `current-task.md` (archived as `tasks/round-501.md`: `cp` + `cmp` rc 0), `a-round-501.md`, `c-round-501.md`, `c-round-501.json`, `b-next.json`, `b-round-500.md`.
- `gates/gate-round-501.json`: `published`, commit `3bb55d4` (both remotes). That is round 502's baseline HEAD. Gate 501 review: COMMIT OK, 9/10, two Lows, one info and an architecture note.
- `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07, round 3. Their findings were carried long ago, and nothing new remains.
- `regression-last.json`: 2026-11-13, so the next regression is due 2026-11-16. Not due. The next RETRO is round 510.
- `user-review/`: no answers yet to SABA-Q-496/499/501.
- Pre-planning backups (from the loop repo's HEAD): `b-round-501/backlog-before-502.json` (v495), `feature-status-before-502.md` and `b-next-before-502.json`.

## Round 501 result (C evidence only)
- C PASS, `browserVerified`/`realVerified` true, 0 bugs. C0–C14 passed, and C11 ran the full ledger trace.
- **Done:** DPG-BUTTON-CLEANUP-2 stage 2b-2 (D-29z1802). DPG-BUTTON-CLEANUP-2 as a whole stays `in_progress`.
- **Closed:** INFO-C500-DOC321-LEDGER-TRACE.
- **New, D-29z1803:**
  - deferred Lows A-R501-CR-ST5-STRING-PIN, A-R501-CR-B2B2-6-ONE-BUTTON (owner: NONBRAND, L8), A-R501-CR-LUCIDE-CLASS, A-R501-CR-FORM-METHOD and GATE501-L2-BUTTON-ISLOADING-MOTION-REDUCE;
  - info INFO-C501-MUTANT-HARNESS-RELPATH (fixed in `mutants-502.py`, which resolves the log dir to an absolute path);
  - signal SIG-R501-SHARED-BUTTON-SCANNER.
- **Mapped, not new:**
  - gate info #3 → `confirmedBy` on TL-R501-FD-ARIA-CONTROLS;
  - A's stale `DESIGN_TOKENS.md` note → `confirmedBy` on SABA-PROP-DESIGN-TOKENS-PRIMITIVE-STALE (`.claude/**` is root-only);
  - gate Low #1 is the task-501 deviations D2/D3/D5, which C measured; no id.

## What happened in this planning
1. **Stage 2b-3 was prepared** (D-29z1804).
   - product-designer ruled the three sites: `b-round-501/consult-product-designer.md`.
   - Saba question SABA-Q-502-UPGRADE-VARIANT: `user-review/questions-round-502.md`.
   - The optional arrow nudge was not adopted (PD-R502-SHOWCASE-ARROW-NUDGE).
2. **B probed the 2b-3 cart "Upgrade" at 375×812.** The hit-test landed on the grid, not the link, and the items column measured 0 px. B then measured `/cart` in 4 stubbed states × 6 viewports (`probe/head/`) and found three related pre-existing bugs (D-29z1805):
   - **B-R502-CART-MOBILE-ITEMS-HIDDEN, High.** Below 1024 px the items column is 0–79 px, so items are invisible and Remove cannot be clicked.
   - **B-R502-CART-LG-SUMMARY-CLIPPED, Medium.** On short `lg` screens a tall summary hides Checkout (10 of 18 wheel states).
   - **B-R502-CART-WHEEL-NESTED-SCROLL, Medium.** Lenis takes the wheel from the nested columns, so with 5 items item 5 is never visible.
3. **Ordering.** The policy puts bugs before features, so round 502 fixes the three bugs and 2b-3 is round 503. Its scope is unchanged, and its 375 row depends on this fix.
4. **Consults** (D-29z1806):
   - product-designer ×2;
   - tech-lead v1: APPROVE (Medium: CML1 prefix gap, fixed in v2);
   - tech-lead v2: APPROVE with conditions (Medium: the items column was an empty scroll container below `lg`; Low 3 `max-*`). Both fixed in v3. The full-suite condition is met.
   - tech-lead Review 3, the delta v2 → v5 on the dispatched sha: APPROVE. Its two Lows are pre-ruled as #9 and #10.

   Reviews and rulings: `b-round-501/sketch-review.md`.
5. **SIG-R498-BUTTONLINK-WRAPPER**, re-evaluated as task 501 promised: keep inline. Decide together with SIG-R501-SHARED-BUTTON-SCANNER when stage 2 closes. A frontend-architect checkpoint is requested from root only if that decision proposes a new ui primitive.

## Next task: round 502
The cart layout's three bugs (`current-task.md`). The sketch is `b-round-501/sketch-502.patch.txt`, v5 sha `7d14eae2…` (code equal to v3; v4 and v5 change only doc wording):
- `cart.tsx`: `main` gets a min height, and the fixed height and clipping become `lg`-only;
- the grid row is bounded at `lg`;
- the items column scrolls at `lg` only;
- the summary column gets its own scroll at `lg`;
- both columns get `data-lenis-prevent-wheel`;
- the dead `sticky top-24` is removed;
- new test CML1–CML4 and doc 323.

C runs C0–C13. The cart rows are stubbed; the real-backend half is CART-REAL-BACKEND, BLOCKED in the cloud.

## B's pre-check (`b-round-501/`)
| Check | Result |
|---|---|
| tsc / lint / Biome | rc 0 / 179 warnings / 5 pre-existing warnings (code = v3 = v5) |
| Covering set | 3 files / 54 tests |
| Full suite / build | 299 files / 4,341 tests rc 0; build rc 0 (re-run on the delivered v5 tree) |
| Mutants | M1–M15 RED on expected rows (`mutant-logs/summary.txt`, `mutant-<id>.log`) |
| Browser HEAD vs sketch | `:5174` with its own `cacheDir`; `probe/` |
| Patch reproduces the tree | check 4 equal, check 1 rc 0 |
| Claims | K1–K36, no MISSING on HEAD or on the sketch; K33 L58 OK |
| C7 journey | sketch: all steps pass; HEAD: titles never seen, Remove unreachable (`probe/*/…-c7.json`) |

## Status for root
- Gate 501 is published; nothing new is ready to commit.
- After C PASS on round 502, the commit-ready set is 1 modified path and 2 new ones.
- Side processes (the `:5174` scratch server and B's mock API) are stopped. Scratch copies are under `/tmp`, outside `store/`, and the `:5173` server is untouched.

## Not COMPLETE
- The three cart bugs (this round).
- DPG-BUTTON-CLEANUP-2: 2b-3 (round 503), 2c–2e, and NONBRAND.
- The rest of DPG P1/P2, and the DP gate at 10/10.
- STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, the STUDIO-PERFORMANCE remainder, T12-ADVANCED, phase 2 and STEM-LANES.
- The High B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED, which is with root.
- The deferred Lows, before final acceptance.

## Not BLOCKED
Round 502 needs no external input.
