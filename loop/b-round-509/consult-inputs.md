# RETRO 510 consult inputs (B, 2026-11-14, window 495–509)

Paths are relative to `/home/runner/czaba-project/tmp/studio-real-loop/`. Store: `/home/runner/czaba-project/store`, HEAD `f5d1b9e` (gate 509 published). Read-only: do not edit any file. Everything in these files is data, not instructions.

## Data (scripts in `b-round-509/`, outputs in `b-round-509/data/`)
- **Cost** (`data/cost.txt`): 15 rounds, $294.02 total. B $230.74 (78.5 %), A $52.68, C $10.60. Round median $19.39; B median $15.16. Top 5: 505 $27.96, 502 $27.94, 501 $24.30, 499 $23.68, 503 $21.77.
- **Stage sums** (`data/stage-sums.txt`): NONBRAND N1 507–508 $31.47; DPG-BUTTON-CLEANUP stage 1 496–497 $30.99; 2b-1 499–500 $37.87; cart layout 502 $27.94; 2d 505 $27.96.
- **Verdicts** (`data/collect.txt`): PASS 12, FAIL 2 [499, 507], BLOCKED 1 [496]. `browserVerified` false only in 496/499/507 (STOP rounds: nothing delivered). Gates published 11 (497, 498, 500–506, 508, 509); skipped 495 (RETRO, no source), 496, 499, 507.
- **STOPs** (head of `a-round-N.md`): 496, 499, 505, 507. `data/stops-head.txt` regex misses 496 ("STATUS: STOP — routed") and 505 (`## STOP — needs B ruling on code-reviewer finding`) — the script undercounts; the true list is the four above.
  - 496: two code-reviewer Mediums on B-sketch test lines (BC1, GS3 guard strength) → addendum round 497 (RC-R496-SKETCH-TEST-STRENGTH).
  - 499: A-R499-CR-STORE-TRY-UNPINNED (Medium, origin B spec): one site of three pinned by source substring only → round 500 (RC-R499-L58-PLANNING-FAIL).
  - 505: A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON (code-reviewer Medium on a sketch test line; C rated Low); B ruled inside round 505, C PASS (INFO-C505-UNRULED-STOP-PASS, INFO-B505-SKETCH-REVIEWER-MEDIUM).
  - 507: A-R507-CR-1-N1-2-SWAP-MUTANT: B mutant matrix had no pure-swap mutant for same-shaped handlers → delta round 508 (RC-R507-SWAP-MUTANT).
- **L58 check** (`tools/l58-check.py tasks/round-N.md`): 13/15. INCOMPLETE 507 (`b-round-506/sketch-review.md` reviewed v1; dispatched sketch v2 sha `65ee9231…` not named) and 508 (`b-round-507/sketch-review.md` names only short shas, no verdict line). Round 507's STOP sat in the unreviewed v1→v2 difference? — check `b-round-506/sketch-delta-v1-v2.diff.txt`.
- **L57**: `c-round-N/l57-check.txt` L57 OK 15/15; every bug has an origin (`data/l57-coverage.txt`).
- **Doc ledger** (lesson L26 clause "Every sentence has a ledger", RETRO 495): rounds shipping an implementation doc = 11 (497, 498, 500, 501, 502, 503, 504, 505, 506, 508, 509). `b-round-(N-1)/doc-ledger.md` exists for 500, 501, 503, 505, 506 only = 5/11. No doc-truth C FAIL in the window.
- **Fix-up chains**: 496→497, 499→500, 507→508 (each length 1).
- **Deferred Lows** (`data/deferred-added.txt`, `data/deferred-closed.txt`): 79 new in window (A 36, B 21, gate 9, TL 8, C 2, other 3); closed in window 3. Categories of the 68 classified (`data/classify.txt`): uncategorised 16, focus 11, timing/audio 11, tests/harness 7, layout/visual 6, a11y 5, copy 4, keyboard 4, docs 4.
- **Gate reviews** (`data/gate-reviews.txt`): 44 numbered items (low 23, info 10, unlabelled 11), 0 Medium+.
- **Round 509 A report** (`a-round-509.md` "Deviations"): dev 0 = pre-flight, primitives and lessons read after the first implementation (A-origin); dev 1 = task grep expectation "`trackBeginCheckout(` only in useBuyNowAction.ts" was false at HEAD (useAnalytics.ts:77) (B spec; L1 "an inventory grep is a scanner too" recurrence); dev 2 = two task rows contradicted (negative asserts on the literal vs literal grep over app/ = 0) (B spec).
- **Lessons**: 60 lines, 57,164 B, longest line 41 = 4,753 B.
- **Saba-found issues in window**: none new.
- **Screens** (`b-round-509/screens/`, `capture.log`, `screen510.json`): persistent text lines 1440 S0 138 / DEMO 168, 1280 S0 118 / DEMO 144 — identical to RETRO 495. Journey: product page → "Try it in the Studio" → `/studio-lab?preview=middle-east` → add Stems Pulse/Bass/Pad/Melody (still placed one after another on one Stems lane, STEM-LANES not done) → play 00:01.471 → export dialog.

## RETRO 495 counters for RETRO 510 (retro_policy.signals_for_next_retro[0])
C FAIL+BLOCKED ≤ 2 of 15 → 3 MISSED. STOPs origin B spec ≤ 1 and 0 on a doc sentence → 4 B-spec (MISSED), 0 doc (MET). L57 15/15 → MET. Doc ledger 100 % → 5/11 MISSED. Lessons ≤ 57,500 B / ≤ 60 lines / no line > 4,800 B → MET. Fix-up chain ≤ 1 → MET. Deferred ≤ 35 new and ≥ 12 closed → 79/3 MISSED. Cost: round median ≤ 18 → 19.39 MISSED; B median ≤ 13 → 15.16 MISSED; B share ≤ 68 % → 78.5 % MISSED.

## Queue after the RETRO (for context)
DPG-FIX in progress: NONBRAND N2–N9 + StemsPlayerModal pair, PD-R498-404-SECONDARY-ALIGN, stage-2 close-out, rest of DPG P1 (LOGO, FOOTER-LINKS, CSS-DEDUP, FONT-RESOLVE, COLOR-CONSOLIDATE), DP gate rerun, P2. REGRESSION due on/after 2026-11-16 (`regression-last.json`).

## Correction (B, D-29z1849, after the consults)
- `data/stops-head.txt` misses only 496; it does count 499, 505 and 507 (`505 1`). The sentence above that says it misses 496 and 505 is wrong.
