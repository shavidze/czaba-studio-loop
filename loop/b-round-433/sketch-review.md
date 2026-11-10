# Sketch review — round 434 (SABA-B-12 stage 3b)

Dispatched sketch: `b-round-433/sketch-434.patch.txt` sha256 `8aed38f329cada7bcb16c6bd5242a26616915d0a0f0de7f5b9ca764940920975` (5 diff headers). Reviewed = dispatched; no edit after the review.

**Verdict: tech-lead approve-with-lows** (2026-11-10, B round 433 -> 434). No Critical, High or Medium.

## B's runs on this sketch (L58)
- Mutants `mutants/summary.txt`: M1–M8 red, sketch green 4/4.
- Covering `covering-files.txt` (30 files): `precheck-covering.log` 30 files, 442/442 rc 0.
- `npm run typecheck` rc 0; `npm run lint` rc 0, 205 warnings + 1 info (= HEAD); Biome on the 5 files: 0 errors (Modal.tsx 5 warnings = HEAD).
- Real Chromium 143, visible scrollbars: `probe/compare.txt` ALL OK (2 cells) on the sketch at :5174; `probe/compare-head.txt` NOT ALL OK on HEAD at :5173.
- In-page experiments on HEAD (`probe/exp-studio-only-classes`, `probe/exp-studio`): adding the Studio classes alone keeps the teal bar; forcing scrollbar-color auto while `styled-scrollbar` stays gives a 4 px bar with an invisible thumb. So `styled-scrollbar` must be removed, not overridden.

## Tech-lead findings and B's rulings
| id | finding | ruling |
|---|---|---|
| TL-R434-01 | Firefox ignores ::-webkit-scrollbar: Studio dialogs get the OS default scrollbar there (same as the Studio lanes today) | Doc 282 records it (A); Firefox half joins TLM-SABA-B-12-FIREFOX-SAFARI |
| TL-R434-02 | DS4 scans only top-level `app/components/arrangement/*.tsx` | Ruled: same reach as SF2/PG2 (round 433 ruling 8); every Studio Modal lives there today [K8d]; doc states the scope. Not a finding |
| TL-R434-03 | DS4 matches the exact prop string | Accepted: intended coupling (mutants M2/M3) |
| TL-R434-04 | `scrollbarClassName` accepts any class | Doc 282 states "replaces the default skin; Studio passes STUDIO_DIALOG_SCROLLBAR_CLASS only" (no code comment, project rule) |
| TL-R434-05 | DS1/DS2 read `dialog.firstElementChild` | Accepted: `modalPanelTokens` throws loudly if the structure changes; deferred_low_polish |

## Correctness notes (tech-lead)
- Four Modal users: the two Studio dialogs, `ConfirmModal` (Modal.tsx) and legacy `app/components/studio/ExportDialog.tsx`; the last two keep the default.
- `styled-scrollbar`'s overscroll-behavior-y is already covered by the panel's `overscroll-contain`.
- No existing test asserts `styled-scrollbar`.
