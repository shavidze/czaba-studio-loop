# Sketch review: DPG-BUTTON-CLEANUP-2 stage 2e (round 506)

Dispatched sketch: `b-round-505/sketch-506.patch.txt`, sha256 b52088bdbb36ea032842badf2bbafc9b0935505c8e8dced61702c11d1b073e0d (v2).
History: v1 e859573cf31866aa9f46fb3cad7db4fde8e67188450d7271ad709a864ff31beb (`sketch-506-v1.patch.txt`); delta v1 -> v2 = two doc wording lines (`sketch-delta-v1-v2.diff.txt`).

## Review 1: tech-lead on v1 e859573cf31866aa9f46fb3cad7db4fde8e67188450d7271ad709a864ff31beb
**Verdict: APPROVE WITH CONDITIONS** (code ready; conditions on doc 327 and its evidence).
- Medium: doc 327 cited `precheck-full.log`, `precheck-build-sketch.log`, `mutants-506.txt` before they existed, and l.4 pre-writes "C round 506 PASS".
  - **Ruling:** the artifacts now exist (claims K29 `test -f`). l.4 is the L28 post-PASS contract form (multi-stage `In Progress (stage 2e of DPG-BUTTON-CLEANUP-2; C round 506 PASS)`, the same form docs 320–326 use and C has checked byte for byte since round 498). Accepted by Review 2.
- Low: the DESIGN_SYSTEM row put `max-w-[320px]` on all three actions (CONTINUE has none; its form caps the width). **Fixed in v2.**
- Low: doc 327 l.21 called the focus landing points a sequence. **Fixed in v2.**
- Low: B2E-2's `bg-brand`/`bg-destructive` token checks repeat the class equality. **Pre-ruled Low #1** (kept, harmless; not selecting by class).
- Low: B2E-6 bans every `bg-brand` literal in the popup, also future non-button uses. **Pre-ruled Low #2**; noted for NONBRAND.
- Project rules on every touched line: no `any`/`ts-ignore`/assertions, semicolons, no colour literals, no new comments, `Button` forwards `ref`. OK.
- Each B2E row can fail (named mutants M1–M14); removing ST5's dark-text-on-red assert loses no protection (destructive variant, Modal and ChatButton still pinned; CONTINUE's dark text comes from `primaryTokens` and the B2E-2/3 equality).
- Focus trap and focus return: no regression risk (native `<button disabled>`, forwardRef, refocus after a failed submit confirmed by the probe).

## Review 2: tech-lead delta on v2 b52088bdbb36ea032842badf2bbafc9b0935505c8e8dced61702c11d1b073e0d
**Verdict: APPROVE WITH CONDITIONS.** Both wording changes match the code (l.187/l.275 `max-w-[320px]`, l.245 CONTINUE, form l.210; focus l.46/62/63/66–72). The L28 explanation resolves the v1 Medium.
- Medium (new): `mutants-506.txt` run 1 had M4 MISMATCH (red B2E-1, B2E-6, ST5; expected B2E-1, B2E-6).
  - **Ruling:** the expectation was wrong, not the test. M4 restores HEAD's hand-rolled FREE DOWNLOAD, whose `className` literal holds `bg-brand`, so the new ST5 count-0 pin goes red, as designed. Expected set corrected to B2E-1, B2E-6, ST5; run 1 kept as `mutants-506-run1.txt`, run 2 is `mutants-506.txt` (all OK required, claim K26).
- Low: the status line is "stage 2e of DPG-BUTTON-CLEANUP-2", not "stage k of n". **Ruling:** that is the agreed form for this feature (docs 320–326, L28 multi-stage clause); C compares against the exact string in the task.
- Low: the B2E-2 / B2E-6 notes are unchanged (pre-ruled Lows #1, #2).
