# A — Round 88 report: R87-PROGRESS-BELOW-FOLD-1280 (sticky footer, D-29z53)

Implementer: A (Claude Opus 5.5) · 2026-10-22 · Task: `current-task.md` (round 88). No commit, push or deploy. Servers were not started or stopped (`:5173` reused).

## Baseline (verified before the first edit)
- HEAD `971141d`. Status 7 M + 10 ??. Frozen list 505/505 OK. Snapshots match: dialog `2082951a`, doc 077 `eeeb7327`, Modal `741c2341`. Protected files unchanged (they are covered by the frozen list). StudioContext `caa388e7`, ffmpeg `0995ae78`. CR=0.

## Changed files (exactly the grant)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | **F1:** items 4–7 (status `<p>`, progress label + `<progress>`, overload warning, button row) are wrapped in `<div ref={footerRef} data-testid="arrangement-export-footer" className="sticky bottom-0 -mx-8 space-y-4 border-t border-outline bg-surface px-8 pt-4 pb-4">`. This is the class string from the task, verbatim. The footer is ModalBody's last child. No tabIndex, role or aria. The children are unchanged. **F2:** a new `useEffect([isOpen])` adds a `focusin` listener on `dialogContentRef.current`. When the target is an `HTMLElement` outside the footer, does not contain the footer, and overlaps it (`overlap > 0`), it sets `scrollTop += overlap + ARRANGEMENT_EXPORT_FOOTER_FOCUS_MARGIN_PX` (exported const = 8). The listener is removed on cleanup. No `scrollIntoView`. |
| `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` | **New.** FT1–FT4, 7 tests. The describe name states the jsdom no-layout limitation. |
| `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md` | l.4 replaced with the exact text from the task, plus one Problem → Solution entry, one line under შეცვლილი ფაილები and one under ტესტირება (5 diff lines against the snapshot). CR=0. |

End state: **7 M + 11 ??**. The only new line is `?? app/lib/arrangement/__tests__/export-dialog-footer.test.tsx`. Frozen 505/505 OK at the end. End hashes are in `a-round-88/end-hashes.txt`: dialog `24e53071`, test `5d6d30e4`, doc `605915b0`, Modal `741c2341`, ffmpeg `0995ae78`, StudioContext `caa388e7`.

## Tests actually run
- `npx biome check` on the dialog and the new test (no `--write`): clean. Stdin format diff: identical.
- `npm run typecheck`: clean. `npm run lint`: 0 errors (218 warnings and 1 info, none in the owned files).
- Targeted vitest, `a-round-88/targeted-list.txt` (51 files: the new test, the 7 named files, and every test importing `ArrangementExportDialog` or `StudioWorkspace`): **51/51 files, 919/919 tests PASS**, after the reviewer fixes (`targeted-result-final.txt`). This is not the full suite.
- **Test IDs for C:**
  - FT1 (idle structure);
  - FT2 (render order status → label → bar → button row; done message + overload in the footer before the buttons; `.wav` downloaded);
  - FT3 (Tab sequence X → wav/mp3/both radios → project scope → Close → Export; no positive tabindex; footer has no tabindex, role or aria);
  - FT4 ×4 (overlap 40 → scrollTop 48; above-footer and inside-footer targets do not scroll; the trap wrapper does not scroll, both directly and through a real render start; unmount removes the same listener, and a later focusin does nothing and does not throw).
- **Mutation proofs** were run in a scratch copy, `a-round-88/mut/store` (`mutate.py`, `mutation-results.json`). All 8 are **RED**:
  - (a) no `sticky` → FT1;
  - (b) progress outside the footer → FT2;
  - (c) footer `tabIndex={0}` → FT3;
  - (d) no focusin listener → FT4 overlap + FT4 unmount;
  - (e) no `+ 8` → FT4 overlap;
  - (f) no inside-footer check → FT4 above/inside;
  - (g) no contains-footer check → FT4 trap;
  - (h, added after review) no cleanup → FT4 unmount.

## A's own Playwright smoke (not C evidence)
Script: `a-round-88/pw/smoke88.cjs`. Output: `pw/smoke-output.json`, screenshots in `pw/*.png`. State file: `a-browse.json`. Recipe: 5M (music 0.35, stems 2, sfx 4, snap off, music clip click, Ctrl+D ×2), then WAV, then MP3 in the same page. The load phase appeared. Then the 101.702 s project (no Ctrl+D) on a fresh page.

| | 1280×720 | 1440×900 |
|---|---|---|
| Idle 5M, scrollTop 0 | clientHeight 646, scrollHeight 691. Close/Export at 629–667, in box and hit | clientHeight 691 = scrollHeight 691. Close/Export at 726–764, in box and hit |
| WAV render | phases render, wav: label, bar, busy button and status all in box and hit. scrollTop stayed 0 (same as before the click) | same |
| MP3 render | phases render → wav → load → mp3: all in box and hit. scrollTop stayed 0 | same |
| Done 101.702 s | status 537–557, overload 573–613: in box and hit, scrollTop 0 | 680–700, 716–756: in box and hit |
| Tab cycle, idle + done | 0 covered, 0 outside the dialog | 0 covered, 0 outside the dialog |

- At 1280 the idle 5M body still overflows (scrollHeight 691 > clientHeight 646). Close and Export are visible at scrollTop 0 because the footer is sticky, not because the overflow went away.
- At 1280, in the done state, the guard fired in the real browser. The scope radio's bottom was 539 against a footer top of 520, so scrollTop went 0 → 27 (19 + 8). After that the radio sat at 512.
- Console: 0 non-noise errors or warnings in both viewports.
- **Not measured by A:** rAF gaps (PX-WAV5-R), VIS-SCROLL wheel sampling, VIS-ERROR, VIS-VIDEO, network rows. Those are C's rows.

## Code-reviewer (real subagent, 3 files): score 8/10, no production bug
- **Fixed:**
  - (Medium, test) The unmount test did not prove the listener was removed. It now spies on `addEventListener`/`removeEventListener` and asserts that the same handler is removed. Mutation (h) is RED.
  - (Low, test) FT3 now asserts that the panel has no positive tabindex.
  - (Doc) The reason given for not using `scrollIntoView` was reworded: it ignores the sticky footer.
- **Not changed** (the task specifies them literally; listed for B):
  - `pt-4 pb-4` could be `py-4`.
  - Exporting a constant from a component file affects Vite Fast Refresh. The task requires the export.
- **Edge cases for B (Low, open):**
  1. The guard measures the radio's own rect. A radio can sit above the footer while the description text in its label is under it. A possible change is `target.closest('label') ?? target`, but the task specifies the target's rect.
  2. The guard also fires on mouse focus. A click near the footer edge can make the panel jump; `:focus-visible` gating is optional.
  3. If the footer grows after focus (status or warning appears), no new focusin fires. In practice focus is on the trap or Close at those moments.
  4. At maximum scroll there is a 16 px strip under the footer (ModalBody `py-4`). This is cosmetic.
- **Architecture note (verbatim, for B):** "Signal 4 (new listener and cleanup in an existing owner): `ArrangementExportDialog.tsx:194-217`, the fourth effect attached to the same `content` element. **Keep:** it shares the one `isOpen` lifecycle, the refs stay local, and ownership doesn't change, so pulling it out now would only add prop plumbing. **Proposal for the planner:** if another focus or scroll concern lands here, make it one bounded task to extract a `useExportDialogFocus` hook (opener restore, initial focus, Tab trap, footer guard), with the existing FT1–FT4 and the focus-trap tests as acceptance."

## Known gaps
- jsdom has no layout. FT tests prove structure, order and arithmetic, not visibility. Visibility is C's browser evidence.
- A's smoke is not C evidence.
- The production bundle (worker + MP3) has still not been checked in the cloud (PROD-MP3-UNVERIFIED, gate).
- The full suite, build and `npm run verify` were not run by A (speed rules: these belong to the gate).

## B acceptance status (A side only)
- Done:
  - F1 and F2 implemented as specified.
  - Docs edited as specified.
  - Required tests FT1–FT4 written and passing.
  - Mutation proofs (a)–(g) RED.
  - Scoped biome, typecheck and lint pass.
  - Targeted list passes.
  - Expected end state 7 M + 11 ?? confirmed.
  - Frozen 505/505 confirmed.
  - Code-reviewer run and findings addressed.
- Every §5 C row (VIS-*, FOCUS-NOT-OBSCURED, PX-*, REG-HYD, G88-3, SOURCE-UNCHANGED) is **not claimed**. They need C's browser verification.

## Exact next C checks
VIS-IDLE, VIS-RENDER (both viewports, every phase, no self-scroll), VIS-SCROLL (wheel during a 5M WAV render), VIS-DONE, VIS-ERROR (unpkg abort), VIS-VIDEO (1280), FOCUS-NOT-OBSCURED (three states), PX-PHASES-R, PX-KEYS-R, PX-WAV5-R (1280 rAF ≤ 150 ms), PX-NET, REG-HYD, G88-3, T88-TARGETED (`a-round-88/targeted-list.txt`), SOURCE-UNCHANGED (`a-round-88/end-hashes.txt`).
