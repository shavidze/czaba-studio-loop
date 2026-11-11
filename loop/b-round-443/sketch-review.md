# Sketch review — round 444 (SYS-3 stage 2a)

Reviewed sha256: 567728dfdf67dafdaeae56b6044b29748e398d40b1c2da5414ad79e5c97a0418 (`b-round-443/sketch-444.patch.txt`)
Dispatched sha256: 567728dfdf67dafdaeae56b6044b29748e398d40b1c2da5414ad79e5c97a0418 (identical; no edit after review)
Reviewer: `tech-lead` (read-only), 2026-11-11, after mutants (8/8 red, `mutants/results.jsonl`) and the full-suite pre-check (`logs/precheck-full.log`: 275 files, 4053 tests, rc 0).
Verdict: approve-with-changes. The changes are follow-ups only and nothing blocks this round. 0 Critical/High/Medium.

## Rulings on B's questions
- **Q1 sheet-local guard vs `ui/Modal.tsx`:** sheet-local is right for this round. Changing Modal would alter Escape for ~22 importers, including the protected `app/components/studio/**`, without evidence. AuthModal, CommandPalette and StemsPlayerModal have their own Escape listeners anyway. The sheet's capture-phase `window` listener runs before Modal's bubble listener on `document`; `stopPropagation` there stops the event reaching the target and `document`. The Workspace capture listener `markExportKeyEvent` on `window` still runs and is harmless. Modal fix → TL-R444-L2 (debt).
- **Q2 composing Escape in `type=search`:** do not call `preventDefault`; the IME owns the key, as in stage 1. With a real IME the key goes to the IME first and the search-clear default does not run. The CDP `rawKeyDown` skips the IME, so the native clear in B's probe is a synthetic artefact. One manual check → TL-R444-L1.
- **Q3 modifier early return moved after the composing/AltGraph checks:** safe. A plain Ctrl+K still switches to keyboard; AltGr typing a character correctly stays on pointer; Ctrl/Meta+Alt+O already excludes AltGraph. Side effect: a stray `Unidentified` key with a modifier in a text field stays on pointer (affects only the focus ring).
- **Q4 defects:** none at Medium or above. Ordering is correct, a plain Escape still reaches Modal, and the tests can fail (IME10's `document` spy, IME9's frame queue and return values, FT7–FT9 init flags), as the 8 red mutants show.

## Findings and B's ruling on each
| Id | Sev | Finding | B ruling (D-29z1577) |
|---|---|---|---|
| TL-R444-L1 | Low | "Native clear is synthetic only" is unverified on a real IME | Added as a step to TLM-SYS3-IME-PLATFORMS (deadline RETRO 450). Browser row C5 records the LIB-ESC query and does not assert it |
| TL-R444-L2 | Low | Modal/AuthModal/CommandPalette/StemsPlayerModal close on composing and repeated Escape | `deferred_low_polish`, store-wide; a separate round, never touching protected files |
| TL-R444-L3 | Low | FT7 asserts a composing Tab stays on pointer | Kept as intended: during composition Tab goes to the IME (candidate navigation) and does not move focus. If an engine does move focus, the next keyboard key restores the ring (fail-safe). The doc records it; sketch unchanged |
| TL-R444-I1 | Info | `focus-source` also counts `key === 'Unidentified'`, the native helper does not | Intended: the focus ring and editor key handling are different concerns. Doc 289 says so (A row A5) |
| TL-R444-I2 | Info | A held Escape can never close the sheet; only a fresh press can | Intended; matches the held-Enter rule (SYS-2) |

## B correction after review (D-29z1577)
B's Q1 said Modal has ~22 importers. That was the count of all `~/components/ui` importers. Modal itself has 3: `ArrangementShortcutSheet`, `ArrangementExportDialog`, and the protected legacy `app/components/studio/ExportDialog.tsx` (claims K25). The ruling stands: a Modal change still alters a protected consumer with no loop evidence, and AuthModal, CommandPalette and StemsPlayerModal keep their own listeners. The sketch is unchanged and so is its sha.
