COMMIT: OK

The round-42 commit is safe. Standard fields still behave as before, existing flows are unchanged, and the new check cannot be bypassed from the UI.

**What I checked**
- **The click guard holds.** `SchemaEditor.tsx:101` runs the same conflict check against fresh store state before adding a field. A chip still on screen when the store changes underneath it can't create a duplicate; test T-e covers this.
- **No duplicate React keys.** Warnings are keyed by the standard field's key, which is unique, and chips use their own keys.
- **The warning colour comes from the design system.** `text-warning` uses the `--color-warning` token (`app.css:38`).
- **Project code rules are followed.** No comments in code, no `any`, semicolons present, no hardcoded colours.
- **Test-on-bugfix rule is met.** Tests T-a to T-g cover both conflict types (key and RIFF ID), removing the conflicting field (chip comes back), a field other than Category (Publisher), the stale-chip race, which conflicting field gets named, warning order, and the "key and RIFF ID both match" case.
- **Doc line numbers match the new file.** `:31-43`, `:67`, `:69-74`, `:75`, `:101`, `:181-193`, `:209`/`:322`, `:230`/`:238`, `:246`/`:254`/`:275`, `:282-286` and `:331-334` all point at the right code.
- **Performance is fine.** The check runs on every render, but at 13 × N fields that cost is negligible.

**Findings**
- **Medium:** none.
- **Low:**
  - `SchemaEditor.tsx:38` compares RIFF IDs case-sensitively. A hand-edited `schema.json` with a custom field using `riffChunkId: "icat"` would not block `+ Category (UCS)`, and could still produce two writers to ICAT if the writer uppercases IDs. The form uppercases IDs, so the UI can't create this; only a hand-edited file can. Fix: compare `field.riffChunkId?.toUpperCase() === standardField.riffChunkId`, or normalise IDs when the schema loads.
  - `SchemaEditor.tsx:282-286`: the warning is a plain `<p>` with nothing linking it to the chip it replaces, so screen-reader users only find it by reading through the list. That's acceptable because the message names the field. Optionally, add `role="note"` or put the warnings in a list.
  - D-47 applies the block to all 13 standard fields, not just Category. That's still an open choice waiting for Saba's sign-off. It's correctly recorded in D-47 and Deviation (2), so it doesn't block the commit.

**Architecture note (proposal only)**
`handleAddCustomField` (standard-key and reserved-ID rejection) and `findStandardFieldConflict` now encode the same rule: one key or RIFF ID belongs to one field. Moving that rule into `schema-store` as a single function, say `findFieldSlotConflict(candidate, fields)` with case-normalised RIFF IDs, would let the form, the chip toggle and a future `schema.json` load-time repair (B-R42-01 / Q18) share one definition, so the case mismatch above couldn't creep in.