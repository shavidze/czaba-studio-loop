# tech-lead review of sketch-458 delta (read-only consult, 2026-11-12, B round 457 → 458 planning)

Reviewed: `b-round-457/sketch-458-delta.patch.txt`; sha256 is in `sketch-458-delta.sha256`, and tech-lead checked that it matches. Scratch: `/tmp/b458`, commit "sketch-458" on top of "tree-457". Evidence used: `probe/vite-resolution.txt`, `probe/sweep-fix-v3.txt`, `mutants/mutants.txt`.

**Verdict: APPROVE.** No Medium or higher finding. Four Lows, each with zero occurrences in `app/`, go on TL-R455-WALKER-LIMITS.

1. **New fail-open or over-reach.**
   - No new fail-open: the new arms only add to the union.
   - The one edge that narrows is the `'index'` form, which no longer follows a sibling file. Neither real resolver picks the file for that form.
   - Over-reach in today's app is nil:
     - no specifier outside tests ends in `/` or `/index`;
     - `lib/utils` is imported only as plain `'~/lib/utils'`;
     - the sweep is byte-identical to round 456 (reached 294).
2. **The 3-form rule** is correct for the forms it models:
   - `./u/index.tsx` becomes the 'index' form;
   - `~/lib/u//` becomes the 'directory' form;
   - `~/` resolves to null and is reported unfollowed.
3. **Grammar and quoting.**
   - The clause grammar is sound for valid TypeScript.
   - QUOTED_OR_COMMENT is not aware of regex literals. That leaves one remaining name-loss form (L1). It has zero occurrences in `app/`.
4. **Stop-loss.** tech-lead agrees, with two amendments:
   - (a) make "occurs in app/" a CI tripwire, not a manual grep;
   - (b) trigger the parser replacement after a third Medium-class form even if no verdict flips.
5. **Findings (Low):**
   - **L1** `style-scan.ts:359`: a regex literal containing `/*` or a backtick blinds both comment-stripping arms (name loss).
   - **L2** `style-scan.ts:92–94`: `'.'`, `'..'` and `…/.` are classified as 'module'.
   - **L3** `style-scan.ts:447`: an explicit `.tsx` loses to a sibling `.ts`. This was already true in the tree.
   - **L4** `store-live-teal.test.ts:239–240`: the lookbehind still rejects a leading `_`. This fails closed.

**B disposition (D-29z1623).**
- L1–L4 are recorded as TL-R458-L1..L4 in `deferred_low_polish` and on TL-R455-WALKER-LIMITS.
- Amendment (b) is adopted as the stop-loss in the task.
- Amendment (a) is adopted as a C row (C8b, a grep that returns 0 at HEAD and on the tree) plus a deferred CI-guard item, TL-R458-TRIPWIRE-GUARD. It is not added to this sketch, because it would need another pin and review cycle for forms with zero uses.

## Re-review on the dispatched sha 39839288 (2026-11-12)
- **Verdict: APPROVE.** No new Medium or higher finding.
- **Only the fixture changed.** tech-lead hashed both reflog commits: `git diff 4606e76 49f8da8` = 7 lines in `store-live-teal.test.ts`, the one LT9 row; `style-scan.ts` is untouched.
- **The fixture is correct and fails without the arm.** With M21a, LT9 fails at the new row; M22a fails at different rows. `mutants.txt` has 42 lines: BASE and C1 green, the rest red.
- **New Low (housekeeping).** The pre-fixture survivor file was misleading. It is renamed to `mutants/SUPERSEDED-mutants-single-arm-before-fixture.txt`.
