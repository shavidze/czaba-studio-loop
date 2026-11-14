# product-designer consult: round 515 focus target after a pointer dismissal from a field (B round 514 -> 515, 2026-11-14)

Read-only consult; B's transcription of the final answer (the agent wrote no files).

**Ruling:** keep the pointer-only skip and send focus to the header logo (preventScroll, no ring, no scroll). Narrow the skip list to fields that open the on-screen keyboard.

1. **Logo, not BODY.** A sighted user sees no difference: no ring and no scroll either way. The logo is the round-514 target when nothing was focused, so "a skipped field counts as no previous element" adds no new concept. BODY would bring back the lost-focus case for screen readers if a VoiceOver tap reports as a pointer click (`detail` 1; not confirmed). **Trade-off accepted:** mid-page, the next Tab starts at the header, and a screen-reader cursor may jump to the top (preventScroll does not stop it). This is better than a keyboard the user never asked for.
2. **Skip only what opens a keyboard:** textarea, `[contenteditable]` (not "false"), and text-type inputs (every type except checkbox, radio, range, button, submit, reset, file, color, image, hidden). Do **not** skip select, checkbox, radio or range: returning to them opens nothing and keeps the Tab position. T1 changes accordingly; add a checkbox case on the returning side.
3. **Rows for C:**
   - touch 375, type "abc", tap Accept: the active element is not an input, scrollY is unchanged, the value is kept, the logo has no ring;
   - one Tab afterwards: record where it lands, as the known cost, not a fail;
   - keyboard: back in the field with its value;
   - pointer: tick a checkbox, then Decline: back on the checkbox, no scroll;
   - WebKit tap on Accept: ends on the logo, nothing throws.

**Open for Saba:** none (not a product decision).

## B's notes on the rows
- **WebKit:** not installed in the cloud runner, so it goes to SAFARI-CHECKS (manual), not a C row.
- **Keyboard into the banner from a field:** not reachable in the real page DOM. The banner is the last focusable region, so Tab from a field passes the footer first. jsdom R515-T2 covers the logic. The browser keyboard rows stay those of round 514 (C3 equivalence).
- **Checkbox in the browser:** `grep -rln 'type="checkbox"' app` (no tests) finds only the recordings SFX tools and the legacy Studio ExportDialog. No ordinary Store page has one, and `/hire-us` has text inputs, one select and one textarea. So the browser row for a "returnable field" is the `/hire-us` select (P3), and the checkbox case is jsdom R515-T6.
