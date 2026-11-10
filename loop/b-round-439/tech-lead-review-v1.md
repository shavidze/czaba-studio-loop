# tech-lead review of sketch-440 v1 (verbatim result, 2026-11-10, B round 439 → 440 planning)

cb05cfc85fb9152fb91d66ac12f04ff29c1b6ba9e8ac89ccd5da4a70ed65c4b4

**Verdict: nothing is Medium or higher. One Low hole in LRS3 is worth a one-line fix.**

**Q1 – Lost or weakened assertions**
- **detail-panel-polish:** `sansLabels` gives the same check as the old `span.font-sans` list, and `infoLabels` adds `Track`/`Tracks`. Nothing is lost.
- **detail-panel-strings-ui:** the old `text-dim` list is kept unchanged. The group check is now stricter: exactly one `Tracks` span, and it is dim.
- **library-preview:** the old check required the *first* `text-foreground` span in the row to be the lane name. The new check finds the span by text and checks its class. It no longer catches another `text-foreground` span placed before it. **Low.**
- **LRS3 duration (finding L1, Low):** `Node.contains` also returns true for the node itself. Suppose a change drops the inner span and puts `font-mono` on the wrapper span at `ArrangementLibrary.tsx:146`. The wrapper becomes a leaf with text `00:20.000`, it has `font-mono`, `children[1].contains(itself)` is true, and the row-wide mono list is still `['00:20.000']`. So the sketch passes. At HEAD, `children[1].querySelectorAll('span.font-mono')` only searches inside the wrapper, finds 0 and fails. The side effect is that the loading and error text would render in mono. Fix: `expect(durationSpans[0]?.parentElement).toBe(metaRow?.children[1]);`. Otherwise, counting across the whole row is stricter than before.

**Q2 – Vacuity:** I found no new assertion that cannot fail. The label lists filtered by an allowlist cannot catch an unknown extra label, but `sansLabels` and the `text-dim` list partly cover that (Low).

**Q3 – Leaf filter `childElementCount === 0`:** It is sound. It correctly skips the wrapper `<span>`, whose text is also `00:20.000`. Every restructure fails loudly with a count of 0 or a missing class, except the L1 case above.

**Q4 – Other Low findings (no Medium or higher):**
- The `classList.contains(...)` filters feeding `toEqual` select by class in another form (`sansLabels`, the `text-dim` list, the `font-mono` list). Since the result is asserted, I accept them, but it is a judgement call against the SYS-1 rule.
- `.sr-only` is still used as a finder at sketch `detail-panel-strings-ui.test.tsx:272`. It is outside the listed findings, and a few more like it remain (lucide icon classes in other tests); leave them for a later stage.
- The marker and meta row are located by testid, `data-source-id` and text, so RETRO200 is closed in these files.
- The V1–V3 evidence overstates the gap. Each mutant runs a single test file. At HEAD, `strings.test.ts:187-190` and `:271` already pin these texts as literals, so the full suite would have caught them. The patch adds a third copy of each literal. That is acceptable, but the duplication should be noted.

**Q5 – `export-wav.test.ts:510`:** Leave it alone. It is the expected value for a test of trimming and appending the worker's error message, not a constant compared with its own definition. The `wavWorkerFailed` text is already pinned by `strings.test.ts:130/190`.
