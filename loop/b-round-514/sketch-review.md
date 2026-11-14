# Sketch review: round 515 (B round 514 -> 515 planning, 2026-11-14)

Patch: `b-round-514/sketch-515.patch.txt`, sha256 `353e4239b7caca842a96843a59daeb812b67bea4ba55b71b67604705565a397d`.
Reviewer: `tech-lead` (read-only project agent). This is B's transcription of the final answer; the agent wrote no files. The reviewer stated that it read the four required primitives (project-rule compliance, L10). It ran CookieConsent + store-internal-links (49/49) and `tsc --noEmit` (clean).

**Verdict: approve-with-changes.** Both changes are applied in the sha above.

## Findings and B's dispositions
1. **Low, Q1 ordering is safe.** The ref is read when the arguments are passed, before `candidate.focus()` fires focusout. The blur handler also clears the ref on a blur to nothing (`relatedTarget` null).
   - The reviewer asked for a row: enter from A, `control.blur()` to BODY, pointer Accept, expect the logo and no `A.focus` call, red on HEAD. **Applied: R515-T7** (red on HEAD, `r515-rows-on-head.log`; mutant M3 red).
   - Window switch while a banner control has focus: a keyboard Enter on return goes to the logo. **Not a regression:** on HEAD the return fires `focus` on the control with `relatedTarget` null, which already sets the stored element to null. This is round 514's pre-ruled limit 4, kept as is. The optional `document.hasFocus()` guard was not added (reviewer: only with a browser probe).
2. **Medium, Q2 selector breadth.** Take the narrowed list: textarea, contenteditable (not "false") and text-type inputs; select, checkbox, radio, range and the button-like inputs are returnable. **Applied** (`COOKIE_CONSENT_KEYBOARD_FIELD_SELECTOR`; rows R515-T6 select/checkbox; product-designer gave the same ruling, `consult-product-designer.md`).
3. **Low, Q3 rows.** They are meaningful; each of M1-M8 is red on its row. Two cases were missing.
   - `contenteditable="false"`: **applied**, as the R515-T6 third case, killed by M11.
   - A skipped field with no header, focus to BODY: **not added**. L47 bars BODY as an expected value for a rule. The no-header edge is already pinned by R514-F8 (BODY now asserted, A-R514 R3), and no mutant it would kill exists.
4. **None, Q4 neighbours.** The extra helper fields break no existing row (no textbox, combobox or checkbox query, no `getAllByRole`). IL4, R514-F6, CC1-CC6 and N3 are unaffected. Reviewer run: CookieConsent + store-internal-links 49/49, tsc clean (on the intermediate tree).
5. **Info.** The `vite.config.ts` cacheDir is kept out of the patch (`git diff -- app/`). Mutants re-run on the frozen final tree (`mut-logs/mutants-summary.json`, M1-M11 red).

## Not re-reviewed
After the review, B made only the test-only additions the reviewer asked for (T7, the contenteditable="false" case). The component source is byte-equal to the narrowed version the reviewer read. C's code-reviewer row in the task sees the final diff.
