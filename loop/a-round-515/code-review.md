# code-reviewer: round 515 (agent ac874e0867edc480e, diff vs b7cb61f + doc 333), score 8/10 — CONDENSED summary by A (reviewer hand-back not stored verbatim)

Condensed summary of findings, written by A. The text is not verbatim, and the original hand-back does not survive the job:

- **Medium.** `CookieConsent.tsx:27-28`: untested selector branches. An `input` with no `type`, `contenteditable=""` and `contenteditable="plaintext-only"` match the selector, as the doc says, but no test pins them. Fix: add 3 rows to `TEXT_ENTRY_FIELDS`.
- **Low.** `CookieConsent.tsx:27`: mixed-case `contenteditable="FALSE"` matches the selector and is skipped, although the browser treats it as non-editable. Fix: `[contenteditable="false" i]` and `[type="…" i]`, plus one uppercase test.
- **Low.** `CookieConsent.tsx:28`: `input[readonly]` and `inputmode="none"` open no keyboard but are still skipped. Fix: `:not([readonly])`, or document it.
- **Low.** `CookieConsent.test.tsx:327-336`: `enterBannerFrom` never asserts that `outside.focus()` succeeded. T2 covers it indirectly. Fix: `if (outside) expect(document.activeElement).toBe(outside);`.
- **Low.** Doc 333 l.30: the "only keyboard-opening fields" sentence is incomplete. `handleBannerBlur` also changes the pointer result for ordinary elements after focus has left the banner (T3, T7). Fix: reword.
- **Info.** Doc l.22: "no ring" and "value kept" have no unit test. Link them to browser row C1, or add a `toHaveValue` assertion.
- **Info.** Doc flowchart: "logo can't take focus → first header link" is untested. Relabel it "no logo" (F7, T5).
- **Info.** An iOS VoiceOver double-tap may send `detail: 1`, sending a screen-reader user to the logo. This is within doc limitation 3. Candidate VoiceOver row for SABA-DEVICE-CHECKS.
- **Checked correct:**
  - `onBlur` → `focusout` bubbling; the T4 inside-move; null `relatedTarget` (T7);
  - SSR safety; strict TS (no `any`, assertions or comments; semicolons present);
  - no class selectors in tests; T1/T3/T7 spy on `focus` of the old element; T6 pins the `contenteditable="false"` clause;
  - doc test ids exist.
- **Architecture note:** Signal 3 (repeated changes): `CookieConsent.tsx:20-52, 76-86` changed in rounds 512, 514 and 515. **Keep:** one owner, one lifecycle, a single user. Keep the SIG-R513-COOKIE-FOCUS-GROWTH trigger: extract a shared focus-restore helper only when a second non-modal surface needs it.

## A's handling
- **Pinned files untouched** (strengthen-only ruling, frozen check 4). The Medium and all code/test Lows go to "For B" in `a-round-515.md`.
- **Chromium probe** (`selector-probe.mjs` → `selector-probe.json`):
  - no-type input, `contenteditable=""` and `plaintext-only` → `matches: true`. So the Medium is missing rows only, not a behaviour defect, and not a STOP.
  - `contenteditable="FALSE"` → `matches: true` while `isContentEditable: false`, which confirms the Low.
  - `type="CHECKBOX"` → `matches: false`: `type` is case-insensitive, as the reviewer said.
- **Doc findings (l.30, l.22, flowchart):** fixed in doc 333 (doc only). The re-review result is appended below.

## Re-review of doc edits (agent a8e47de9f3cc4e843)
- All three findings resolved (l.30 follow-up sentence is accurate per `handleBannerBlur` and T3/T7; l.22 makes no false unit-test claim; the flowchart "no logo" edge is backed by F7/T5).
- New minor: l.22 cites C1 while the testing section named only P1–P3. A then changed the testing sentence to name C1 (P1/P3/P2), C2, C3 and C4. This was a doc-only change; no code or test changed after either review.
