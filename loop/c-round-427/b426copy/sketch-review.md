# Sketch review — round 427 (SYS-2 stage 2b-i), L58

- **Dispatched sketch:** `b-round-426/sketch-427.patch.txt`, sha256 `aef454cd7b9f80ddaecb51a4db5ee5227bf142e147077de41f5eb7dff280eaa2`. The same value is in `b-round-426/sketch-427.sha256` (claims K10/K11). It is the reviewed v1 sketch plus the test-only delta below. Nothing else changed.
- **First review:** `tech-lead` (read-only project agent), 2026-11-10. It reviewed v1, `b-round-426/sketch-427-v1-82a785ce.patch.txt`, sha256 `82a785ce286fc910473997c7bdd9ae09aaf5125c12ab54fff0a606e0434cd9ec`, applied in `/tmp/b427/s`. **Verdict: approve-with-lows.** No Critical, High or Medium.
- **Delta re-review (L58, reviewed = dispatched):** `tech-lead`, 2026-11-10, on `b-round-426/sketch-delta-82a785ce-to-final.patch.txt` (82a785ce… → aef454cd…).
  - The reviewer diffed the two sketches itself and confirmed the delta is test-only: only `mixer-held-enter-ui.test.tsx` and `panel-held-enter-ui.test.tsx` change.
  - **Verdict: approve-with-lows on aef454cd.** TL-R426-03, 04 and 05 are closed. Nothing new was found.

## Findings and what B did
| id | Sev | Finding | B action |
|---|---|---|---|
| TL-R426-01 | Info | All 13 new guards sit on toggle, select or dismiss buttons where a repeat has no valid meaning (none is a stepper). There is no stopPropagation, so the window handler is unchanged. The only `defaultPrevented` readers are Escape and drop | none needed |
| TL-R426-02 | Info | The folds are behaviour-identical. Spread order does not matter (`onKeyDown?: never`). The detail toggle guard returns only for a repeated Enter, so Space is unchanged | none needed |
| TL-R426-03 | Low | HM5b is characterization (green at HEAD, no mutant). It should assert that `statusSequence` is unchanged across the repeats | Delta: HM5b is relabelled "characterization (TL-R425-09, D-29z1493)" and asserts that the whole snapshot equals `afterFirst` after 3 repeats (green). The task says "green at HEAD by design" (ruling 6) |
| TL-R426-04 | Low | HP9 has no focus assert; only MU-VIDEO-EXPAND proves focus → Expand | Delta: HP9 asserts `document.activeElement` is the Expand button |
| TL-R426-05 | Low | The snapshot lacks `aria-current`, the fold `aria-expanded` and the detail `aria-expanded`. HP3 and HP6 caught the bug only through the odd repeat count | Delta: the HP snapshot records library `aria-expanded`/`aria-current`, the detail `aria-expanded` and the video Expand label. The mutant summary is unchanged (12 lines) |
| TL-R426-06 | Low | HP6's Space half is partial in jsdom (no keyup click synthesis) | Accepted: the Space code is unchanged, and the browser smoke (task row 5) presses Space in Chromium |
| TL-R426-07 | Info | Focus targets are correct: dismiss → search (explicit focus); Close/Return → Expand (dock effect cleanup) | Task ruling 5; C row 4 checks `focusedAfterHeld` |
| TL-R426-08 | Info | A held Enter on the search field after dismiss does nothing: `isTypingTarget` covers `type=search`, there is no Enter branch and no form. The HP5 tail is characterization | Task row HP5 marks the tail as characterization |
| TL-R426-09 | Info | 7 inline copies remain: LibraryMenu (1), ExportDialog (1), MarkerRow (5) | In scope of 2b-ii (D-29z1494), plus the closing grep row |
| Architecture | — | The stage strengthens the case for a check rather than a wrapper: a grep/lint row banning inline `key === 'Enter' && event.repeat` outside `studio-repeat-safe.ts`, after folding the 7 copies. A `StudioButton` wrapper collides with `onKeyDown?: never` and with buttons that have their own key handlers | Recorded on SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT (D-29z1495). The 2b-ii closing grep row implements the check; the wrapper stays a signal for the architecture checkpoint |
| Item 3 (status per repeat) | Info | `reduceArrangementStatus` keeps the previous entry for identical text while a gesture is active, so a steady-state repeat does not bump the sequence. A drag that also writes preview text might bump it | B's Low B-R426-GESTURE-REFUSAL-REPEAT-STATUS is withdrawn (D-29z1496). The moving-drag case is INFO-TL-R426-MOVING-DRAG-REPEAT (hypothesis) |

## Re-run evidence on the dispatched sketch (aef454cd)
- **Mutants:** `mutants/summary.txt`, 12 lines, the same as on v1. There is one `mutant-<id>.log` per mutant.
- **Covering:** `precheck-a2.log`, 68 files / 1226 tests, rc 0.
- **Full suite:** `precheck-full.log`, 266 / 3984, rc 0.
- **typecheck, lint, Biome:** `precheck-typecheck.log` rc 0; `precheck-lint.log` rc 0 (205 warnings, 1 info); `precheck-biome7.log` rc 0.
- **Browser:** `probe/compare.txt` (ALL OK, 18 cells) and `probe/smoke-compare.txt` (EQUAL both viewports). These ran on the v1 source, whose 5 component files are byte-identical in aef454cd.
