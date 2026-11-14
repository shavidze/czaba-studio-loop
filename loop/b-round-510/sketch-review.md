# Sketch review — round 511 (NONBRAND N2)

Reviewed sketch: `b-round-510/sketch-511-purchaseheader.patch.txt` sha256 `de636ad4df0686c10264aa57261e5c747a39fede9178b94423f8fef8ae516d91` (= dispatched; unchanged after review).
Reviewer: `tech-lead` (read-only consult, 2026-11-14; code-reviewer is not on B's consult list, L58 allows tech-lead). B's transcription of the final answer.

Verdict: approve — no Medium or higher.

Findings and B rulings:
1. Low — busy Buy Now gets the builder's `pointer-events-none`, so the not-allowed cursor no longer shows while native-disabled (HEAD showed it). Clicks stay blocked. **Ruled:** accepted as the shared Button behaviour (every Button busy state is like this); recorded as deferred Low B-R510-BUSY-CURSOR-HIDDEN; C row C4 records `pointer-events` none.
2. info — `!` important on `aria-disabled:cursor-not-allowed!` wins over builder `cursor-pointer` regardless of order; hover colour under aria-disabled as at HEAD. No action.
3. info — Buy Now gains `shadow-sm`, `text-base`, 8 px radius; owned-card links lose the brand/accent outline (SABA-Q-507-OUTLINE-VARIANT default no). Intended.
4. Low — missing mutants (Open in Studio `to`, Downloads variant/size, Buy Now size and onClick, CartButton px/text-base, the cursor-not-allowed! class). **Fixed:** M16–M23 added to `test-contract-511.md` (v2).
5. Low — N2-2 lookup ambiguous. **Fixed:** getElementById on aria-describedby.
6. Low — ST5 rewrite alone weaker. **Fixed:** ST5 also asserts the `variant="buy"` tag's className has no `text-*`/`bg-*` token.
Rewrites: B2C-7 equal, B2C-8 stronger, ST5 equal after fix 6.
