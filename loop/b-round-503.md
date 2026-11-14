# B round 503 → 504 planning (2026-11-14)

**Decision:** CONTINUE. **Next task:** round 504 = DPG-BUTTON-CLEANUP-2 stage 2c, the PurchaseHeader brass actions (`current-task.md`).
**Advisor:** available; consulted after orientation and at the closing check.
**Archive:** `tasks/round-503.md` is a byte-identical copy of the round-503 task (`cmp` rc 0). Pre-planning copies of `current-task.md`, `backlog.json`, `feature-status.md` and `b-next.json` are in `b-round-503/*-before-504.*`.
**Baseline:** gate 503 is `published` with commit `b806cad` (both remotes), so HEAD is `b806cad`. The store worktree is clean.

## 1. Acceptance of round 503 (C evidence only)
- **C:** `c-round-503.json` PASS, with `browserVerified`/`realVerified` true and 0 bugs. `c-round-503/l57-check.txt` says `L57 OK`. C0–C14 pass, and the cart and recordings rows are `-STUBBED` (L36).
- **Gate 503:** `published` `b806cad`. `verify.log` shows 300/300 files and 4,353 tests. The review says COMMIT OK, 9/10.
- **D-29z1812:** stage 2b-3 is verified ("მზადაა" for the stage; DPG-BUTTON-CLEANUP-2 as a whole is not). B-R502-DOC323-L28-STATUS is closed by C11. CART-REAL-BACKEND-503 folds into CART-REAL-BACKEND.
- **D-29z1813 follow-ups (L7):**
  - **A's findings:** A-R503-CR-1 is the L28 contract and is now true, so it is closed. CR-2 (info), CR-3 and CR-4 (Low) go to `deferred_low_polish`.
  - **Gate's findings:**
    - Low 1 is deviation D3, with no id.
    - Low 2 is `confirmedBy` on GATE498-L2-BARREL-IMPORT.
    - Lows 3 and 4 and the Architecture note are `confirmedBy` on SIG-R501-SHARED-BUTTON-SCANNER and SIG-R498-BUTTONLINK-WRAPPER.
    - Low 5 is the multi-stage L28 rule, with no id.
  - **C's finding:** the 1 px ring info is `confirmedBy` on INFO-C502-CHECKOUT-RING-1PX.
- `root-pre-push-review.md` holds only old round summaries, with no new remaining findings. No new Saba answers have arrived (`user-review/`). SABA-Q-502-UPGRADE-VARIANT is still `awaiting_user` (default brass).

## 2. Round 504: what and why
- **Order:**
  - No Critical, High or Medium finding is open on `PurchaseHeader.tsx`.
  - REGRESSION is not due (last run 2026-11-13; the next is on or after 2026-11-16). The next RETRO is round 510.
  - DPG-FIX is the active entry (P1 item 7), and stage 2c is the inventory's next row (A3).
- **Scope (D-29z1814):** the three solid brass actions in `PurchaseHeader`.
  - "Go to Downloads" becomes a `<Link>` + `buildButtonClassName` primary `lg`.
  - "Upgrade to Premium" and "Unlock Premium" become `<Button type="button" size="lg">`. "Unlock Premium" keeps `disabled` and its "Processing..." children.
  - All three get `min-w-[160px] whitespace-nowrap` and the default 8 px shape.
  - The round also writes the new test `store-button-cleanup-2c.test.tsx` (B2C-0…9), updates the DESIGN_SYSTEM default row and sentence, and adds doc 325.
- **Consults:**
  - **product-designer** (`b-round-503/consult-product-designer.md`) ruled the default shape over pill and over a `rounded-lg` override (no `twMerge`). It did not widen the round to the siblings (no outline variant exists, and `bg-buy` is frozen). It chose brass primary over accent for the upsell, and `<Button disabled>` without `isLoading`. It also gave 7 C rows.
  - **tech-lead:** v1 APPROVE, with no Medium. The B2C-5 title was fixed in v2 and mutant M13 was added. v2 APPROVE. v3 APPROVE (`sketch-review.md`).
  - **Closing check (advisor, D-29z1816):** three doc 325 lines were false against the tree (the doc range 320–324, "four states", and the B2C-9 description). Sketch v3 `84cc9df3…` corrects them (doc text only). The full suite, build and covering run were re-run on v3. The task also gains a ruling line for the S2 "Downloads" sibling, drops L47 from its applied list (record-only), and fixes the C7 wording.
- **Measured (HEAD :5173 vs sketch :5174, `b-round-503/probe/`, stubbed owner states S1P/S1X/S2/S3 plus anonymous S0):**
  - radius 12 → 8 px;
  - 50 → 48 px when alone (52 beside a bordered sibling); cards are at most 2 px shorter;
  - "Upgrade to Premium" text `rgb(0,0,0)` → `rgb(14,13,12)`; contrast 8.32/10.28;
  - siblings `diff none`; card focusables and overflow are equal.
- **Purchase journeys (HEAD = sketch):**
  - "Go to Downloads" goes to `/account/downloads`.
  - "Upgrade to Premium" selects Premium.
  - "Unlock Premium" sends 1 checkout POST on a single click and on a double click.
  - The anonymous Buy Now sends 0 POSTs.
  - The only change is the busy state: now `pointer-events: none` and the rest brass fill (D5, the 2b-2 rule).
- **Pre-check (v2 code; suite, build and covering re-run on v3):**
  - tsc rc 0, lint 179 and Biome rc 0;
  - covering 6/79 (slowest 368 ms on v3);
  - full 301/4,363 rc 0, build rc 0;
  - mutants M1–M13 OK; scanner 100/38 → 96/35;
  - claims on both trees with no MISSING; L58 OK.
- **Screenshots viewed by B:** `probe/sketch/sketch-S1X-375-card.png`, `sketch-S2-1440-card.png` and `sketch-S3-1440-card.png`. The 8 px brass corners beside the 12 px outline siblings are a subtle difference, as product-designer assumed. Nothing overlaps, and the labels stay on one line. At 1440 the S2 row stacks Downloads over Upgrade, as at HEAD (row 113 → 112 px).
- **Reference:** the Store shape rule (DESIGN_SYSTEM; round 501 §1). Ableton does not apply.
- **Screen budget (L39):** nothing is added or removed.
- **Purchase protection:** the handlers block is byte-identical (K6). No granted path is protected (K24). C keeps the anonymous "Sign in required" row and the purchase journeys J1–J5.

## 3. Architecture signals (recorded, not scheduled)
- There is no checkpoint request: one owner, three class or element swaps, following the 2b-2 and 2b-3 precedents.
- SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER (now a fourth scanner copy) are decided at the stage-2 close, after 2e.
- **New deferred items (D-29z1815):**
  - PD-R504-DISABLED-NO-REASON (info): a disabled purchase button never says why. This is pre-existing.
  - TL-R504-STALE-UPGRADE-COMMENT (info).
- **NONBRAND:** it now explicitly includes the PurchaseHeader siblings, so the card goes back to one 8 px system.

## 4. Saba
- There is no new question. If SABA-Q-502-UPGRADE-VARIANT is answered "accent", the PurchaseHeader "Upgrade to Premium" follows in the same round (noted on the finding).

## 5. Artifacts (`b-round-503/`)
- **Sketch:** `sketch-504.patch.txt` (= v3), `sketch-504-v1.patch.txt`, `sketch-504-v2.patch.txt`, `sketch-504-v3.patch.txt`, `sketch-delta-v1-v2.diff.txt`, `sketch-delta-v2-v3.diff.txt`, `sketch-sha.txt`, `sketch-sha-history.txt`, `sketch-review.md`, `l58-check.txt`.
- **Consult:** `consult-product-designer.md`.
- **Pre-check logs:** `precheck-{tsc,lint,biome,covering,full,full-raw,build-sketch}.log` and `covering-files.txt`.
- **Mutants:** `mutants-504.py`, `mutants-504.txt`, `mutant-logs/`.
- **Probes:**
  - scripts: `probe/measure-504.mjs`, `probe/journey-504.mjs`, `probe/compare-504.py`;
  - outputs: `probe/{head,sketch}.out`, `probe/{head,sketch}-journey.out`, `probe/compare-504.txt`, `probe/head/`, `probe/sketch/`.
- **Scanner:** `scan-head.json`, `scan-sketch.json`, `scan-sketch.txt`.
- **Frozen-file lists:** `r504-tree-sha256.txt`, `r504-pre-sha.txt`, `r504-post-sketch-sha.txt`.
- **Claims:** `claims-504.sh`, `claims-504-planning-output.txt`, `claims-504-sketch-output.txt`.
- **Other:** `update-backlog-1.py` (v501), `update-backlog-2.py` (v502), `update-backlog-3.py` (v503, D-29z1816), `checkpoint.md`, `mock.log`, `sketch-dev.log`.

## 6. Ready for commit?
Round 503 is already published (`b806cad`). Round 504 has not started. Nothing new is ready for root.
