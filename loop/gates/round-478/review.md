COMMIT: OK

## Code Review: docs-only diff (16 paths, round 478)

I read the diff and compared it with `app/styles/app.css` and the cited source docs. `app/**` is untouched, so none of the runtime items in the review focus apply to this diff: event ordering, listener and timer leaks, render cost, TS strict. No auth, purchase or download code is touched.

### Critical Issues
- None.

### Findings, ranked (all non-blocking)
1. **`docs/design/design-tokens.json:76-80` (`color.info`, left unchanged).** `#3b82f6` is a cool blue. The same goes for `DESIGN_SYSTEM.md` "Semantic Colors" `--color-info`. Doc 310 already defers this to DPG-COLOR-CONSOLIDATE, so no fix is needed now. Keep the follow-up task.
2. **`docs/design/awwwards-improvements.md:292-322`.** The snippets still recommend glow (`box-shadow: 0 0 8px …`), which contradicts the no-glow rule from round 453. Only the colors were migrated. This is logged as SIG-R478-AWWWARDS-GLOW and sent to P2, which is fine. Fix: delete or rewrite the glow snippets in DPG-INTERACTION-FIX.
3. **`docs/design/DESIGN_SYSTEM.md` (the `--shadow-*` block, ~1071).** `--shadow-sm` is shown as unchanged, but the other shadows were rewritten. The hsl(220…) base color is still the cold blue tint. This matches `app.css:140-145`, so the doc is correct. The shadow base hue is a possible design inconsistency, not a docs error. Fix: decide in DPG-COLOR-CONSOLIDATE whether the shadow tint should be warm.
4. **`docs/design/wcag-audit.md:657-670`.** The ratios are hand-computed. I recomputed brand on background: relative luminance ≈0.40 against ≈0.004 gives ≈8.3, which matches the 8.32 in the doc. C also checked ten ratios. The "AA" label on muted/surface (6.68) is correct, because it is below 7. Nothing to fix.
5. **`DESIGN_SYSTEM.md:433`.** `color: #C9A46A` appears inside a ❌ "wrong" example about non-token values. This is intentional, since the point of the example is hardcoding.

### Suggestions
- Doc 310 says no Tailwind arbitrary-value classes were added to `docs/**`, because `docs/**` is a Tailwind candidate source. I saw none in the added lines.

### Good Practices Found
- Every token value in the diff matches `app.css` `@theme` (lines 47-87, 133, 140-145). I checked all of them.
- The quotes cited in "რატომ Obsidian & Brass?" exist in `brand-vision.md:27` and `direction-decision.md:11,18,27`. The wording is faithful, including "ოქროსფერი/ელექტრული ლურჯი".
- Dated audits keep their text and get a historical banner instead of being rewritten, so history is preserved.
- The `direction-decision.md` token names are now correct. The old `--color-obsidian-*` and `--color-brass-*` names don't exist in `app.css`.
- The residual 18 old-hue hits in `docs/design` are the intended ones: historical audits, competitor facts, the Gold box colors and the v2.1 changelog row.
- Doc 310 follows the Georgian implementation-doc template, and the status lines of docs 307-309 are updated.

### Architecture note
- none. A docs-only diff shows none of the four signals. One observation for the planner, not a finding: the design docs duplicate hex values from `app.css`, so they can drift again. The checker described in D-29z1694 is not committed in this diff. A bounded task for the planner would be to keep that token-vs-docs checker as a CI step or `npm` script, owned by the docs/tooling side. It would pass when `FAILS 0`, with a mutant test. This is a proposal only. It also depends on `.claude/primitives/DESIGN_TOKENS.md` still carrying the old colors (ROOT-REQ-DPG-PRIMITIVES-PATCH), which this commit doesn't touch.

### Alternative Approach
- Not critical logic, so not applicable.

### Score: 9/10