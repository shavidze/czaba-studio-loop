# Sketch review: round 452 (SYS-R450-STORE-STYLE-SCAN re-dispatch, sketch v5)

**Dispatched sketch:** `b-round-451/sketch-452-delta-v4-v5.patch.txt` (v4 → v5 = `git diff 3c9f60e 30d9a95` in `/tmp/b452-scratch`), sha256 2acc367278eb3a96aa982b4da675b3086460b40ebd0de20e77534130406b008c

**Fallback (only if A's tree no longer holds v4; see task §1 step 2):** `b-round-451/sketch-452-full-v5.patch.txt` (`git diff a8599a2 30d9a95`), sha256 c7b048d484a8b50ef969fa1014b95c8a7b2d61f588af8675c95c7c0b824de57a. It is v4 (reviewed 3×, `b-round-450/sketch-review.md`, last APPROVE on sha a555d6e2…) plus exactly the delta above.

- **Reviewer:** `tech-lead`, read-only, on its own clone `/tmp/tl452` (commits a8599a2 HEAD, 3c9f60e v4, 30d9a95 v5). The clone was clean after its mutants.
- **Reviewed commit:** 30d9a95; the delta sha it checked equals the dispatched sha above. Reviewed = dispatched (L58).

## Review 4 (delta v4 → v5)

**Verdict: APPROVE.** No Critical, High or Medium.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Info | `BARREL_FILES` is HEAD's 3 again; GT5 uses it as HEAD does. Reviewer re-ran N11/N11b: red at HEAD, red on v5, green on v4 | Fixes A-R451-REVIEW-M1-GT5-BARREL-SCOPE |
| 2 | Info | GT5b on v5 is also stricter than v4 in a second way: reviewer mutant TL-a (`export { Timeline as TL } from '../audio';` appended to `components/home/index.ts`) is red on v5, green on v4 (v4's 5 shared barrels hid HEAD's 3 barrels from GT5b) | Logged; no change |
| 3 | Low/Info | `helpers/style-scan.ts` quote blanking of `{};` can move a hit to a different selector (`.a{x:y' } .b{background-clip:text; z:'w }` keys `.a` on v5, `.b` at HEAD). The hit count never drops, so it fails loud (unexpected key or drift on the exact count) | INFO-TL-R452-SELECTOR-SHIFT, logged; no change |
| 4 | Low (not in this delta) | `IMPORT_STATEMENT` needs `from` or `import(`; a bare side-effect `import '~/lib/email.server';` stays green | Same as deferred TL-R451-L2-SIDE-EFFECT-IMPORT → `confirmedBy: TL review 4 (round 452 planning)` (L7) |

**Scope parity (reviewer's own check, not only B's `scope-sweep.md`):** nothing on v5 scans fewer files or excludes more than HEAD. B's sweep left out one HEAD row: `stripComments` → `blankCommentsAndQuotedDelimiters`. The reviewer compared both on 5 hostile CSS strings: v5 finds every HEAD hit, plus a `"/*"`-in-string case HEAD missed.

**GT5b soundness:** email.server has no barrels, so only its own file is excluded (TL-b, a root-barrel import, is red). Timeline excludes both its barrels (TL-c sibling import red, TL-d `export * from '../audio'` in the loading barrel red). The only re-exporters of the dead modules are `components/audio/index.ts:7` and `components/index.ts:3`. `types/index.ts` `export * from './audio'` targets `types/audio` and does not match.

**B rulings checked by the reviewer:**
- (a) **Agree.** The alias hole through HEAD's own barrels is green at HEAD (10/10) and on v5 (14/14), so it is pre-existing. It is the existing deferred Low TL-R449-D2-BARREL-ALIAS → `confirmedBy`.
- (b) A-R451-REVIEW-L1: **agree**, it fails safe → `deferred_low_polish`.
- (b) A-R451-REVIEW-L3: **agree**, polish → `deferred_low_polish`.
- (b) A-R451-REVIEW-L2: **agree to defer.** It fails open, but the zero-offset glow scanner is new in this sketch, so it is not a regression against HEAD. The reviewer confirmed `'0rem 0rem 20px'`, `'-0 0 20px'`, `'0 -0 20px'` and `shadow-[0rem_0_20px_red]` score 0. It is **separate** from INFO-TL-R451-GLOW-CALC (blur-value forms, `GLOW_BLUR` :57). L2 sits in the offset `0(?:px)?` part (:61-64). Two ids, both causes written.

## Evidence on the dispatched sketch
- Mutants v5: `mutants.txt` (57 lines; BASE and the M6 control green; N8h, N11 and N11b red at GT5b / GT5 / GT5). Per-mutant logs: `mutant-<id>.log`.
- HEAD control: `head-mutants/mutants.txt` (37 lines; N11 and N11b red GT5; the rest equal `b-round-450/head-mutants/mutants.txt`).
- v4 control: `v4-mutants/mutants.txt` (N11 and N11b green = the bug; N8h EDIT-FAILED, no such function in v4).
- Golden G1 on v5: `golden/golden-sketch-v5.json` (`equal: true`; identical JSON to `b-round-450/golden/golden-sketch.json`).
- Prechecks on v5: `precheck-typecheck.log` rc 0, `precheck-lint.log` 205 warnings rc 0, `precheck-covering.log` 3 files / 16 tests, `precheck-full.log` 282 files / 4,128 tests rc 0.
- Apply: `apply-check.txt` (delta on A's round-451 tree rc 0; delta on clean HEAD rc 1; full v5 on clean HEAD rc 0).
