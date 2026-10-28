COMMIT: OK

This round changes only documentation: three Markdown files and no source code. I compared every claim in the new text against the code at HEAD `e386cca` and they all match. C's verdict and the passing verify run aren't contradicted by anything I found.

**Checked against the code**
- **`button.tsx`**: all five button styles use `enabled:not-aria-disabled:hover:` on lines 10–15, so the "five variants" claim holds. The `aria-disabled:opacity-50 aria-disabled:cursor-not-allowed` classes cited for D-45 are still on line 36.
- **`SchemaEditor.tsx`**:
  - The line numbers in D-46 and entry (22) are right: Back at line 157 keeps plain `hover:`; Trash2 (202), Hide X (210) and the chip (230) use `enabled:hover:`.
  - `reorderArrowClassName` at the end of the file (291) gives `text-dim enabled:hover:text-foreground p-0.5`, plus `opacity-30` only on the edge arrow.
  - Done at 280–281 has `aria-disabled` and `aria-busy` as stated.
- **New SchemaEditor spec**: the outer container, header, content, fieldset (`disabled:opacity-60`), footer, the field-row padding change to `py-1.5`, and Add Field being a ghost `Button` all match lines 152–288. The spec's old `mt-3 … border-brand` container was out of date, and this change fixes it.
- **Counts in `README.md`**: 22 entries with 13 fixed leaves 9 open, consistent with the 001 status line, which now lists (22) as fixed.
- **No unit test for (22)**: the doc says why. Only Tailwind classes changed, which falls under the styling exception in `test-on-bugfix`, and the doc names the real-app hover measurement and the built CSS selectors as the evidence instead.

**Findings**
- critical / high / medium: none.
- low: the new prose in `docs/design/component-specs.md` (lines 67 and 104–106 in the diff) is in English, while the project rules ask for Georgian docs. The rest of that file is already English, so this keeps its existing style rather than breaking a convention. No change needed for this commit.
- low: the new D-46 and entry (22) pin exact line numbers (`:157`, `:202`, `:210`, `:230`). They're accurate now but will go stale with the next edit to SchemaEditor, as other line references in this file already have. Naming the symbol or class next to each number, or using symbols alone, would last longer.

**Architecture note (proposal only)**
The "only change hover colour when the button can act" rule is now repeated in two places: the `Button` variants and the raw `<button>` elements inside SchemaEditor. A shared helper or class constant (e.g. `interactiveHover(x)`) would keep the two from drifting, and could also handle the open B-R39-02 item (the cursor stays `default` on arrows disabled by the fieldset). A small check in the build output for the `:enabled:hover` selectors would also stop this fix from relying only on manual real-app measurement.