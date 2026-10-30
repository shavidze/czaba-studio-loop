# A round 276 — SYS-5 stage 1: soft-disabled transport buttons

## STOP — needs B ruling on V-HOVER-SOFT `cursor: not-allowed` (one criterion only; pre-existing at HEAD)
V-HOVER-SOFT expects `cursor: not-allowed` on a hovered soft-disabled button. Measured in Chromium on `/studio-lab` (1440×900 and 1280×720): computed `cursor` is **`pointer`** on all seven. Cause: `app/styles/app.css` l.483 `button { cursor:pointer }` is **unlayered** CSS, so it beats every Tailwind utility in `@layer utilities` whatever the specificity. HEAD has the same line and the same result. Control injected into the same page (`a-round-276/probe-1440.json` `cursorControl`): a native `<button disabled class="disabled:cursor-not-allowed">` (HEAD's exact token) computes `pointer` as well, and so does `<button aria-disabled="true" class="aria-disabled:cursor-not-allowed">`. So this is **not a regression** against HEAD. The fix needs l.483, which is outside the §5 grant (`app.css` l.380–381 only). Per §10/L11 I did not edit it. The token `aria-disabled:cursor-not-allowed` is in place (SD7 pins it), so a later granted change to l.483 (e.g. `button:not(:disabled):not([aria-disabled="true"]) { cursor:pointer }`, or putting it in `@layer base`) would make it work. Everything else in the round is complete and the tree is consistent.
- **An in-grant form exists that would win the cascade:** `aria-disabled:cursor-not-allowed!` (an `!important` declaration in a layer beats an unlayered normal one). `toolButtonClass` already uses the `!` suffix on its motion tokens. I did not apply it because §2.3 names the exact token `aria-disabled:cursor-not-allowed` and SD7 pins it. If B picks this form, it is a one-token change in `toolButtonClass` plus SD7's token list.
- **Untagged premise (L29 note):** HEAD's computed cursor was never probed. B's `baseline.cjs` reads `disabled` and `title`, not the computed `cursor`.

## Grant-reference deviation (B-R276-SHARED-TEST-CONSTANTS)
Two test constants are shared between transport buttons and frozen non-transport controls that still carry `enabled:` tokens:
- `BASE_FILL` (`transport-surface-ui` l.152) is used by TS1 (transport) and TS8 (Snap/Env/Master).
- `ON_TOKENS`/`DROPPED_TOKENS` (`mode-toggle-colour-ui` l.180–191) are used by DXT1 and DXT3 (transport) and DXT4 (Snap/Env/Metronome).

The non-test grep `grep -rn "enabled:hover:bg-foreground/8\|enabled:hover:bg-foreground/20" app` still hits StudioWorkspace.tsx l.2865/2867/2953/2955, ArrangementTempoRow.tsx l.321/323, ArrangementMaster.tsx l.127/189 and others.

I applied the grant's rule ("token lists naming the transport's tokens"). I added transport-only sibling constants of the same length (`TRANSPORT_FILL`, `TRANSPORT_ON_TOKENS`, `TRANSPORT_DROPPED_TOKENS`) and pointed the transport assertions at them. The originals stay on the non-transport consumers. B's hint l.551–558 names the Snap/Env assertions in TS8, so those lines are unchanged, as are l.594–604. No assertion was removed and no frozen file was touched.

## Pre-step (§2.3): Tailwind 4.1.18 emits the children rule
- `a-round-276/tw-prestep.mjs` (`@tailwindcss/node` compile), output `a-round-276/tw-prestep.out`:
  ```
  .aria-disabled\:\*\:opacity-40 { &[aria-disabled="true"] { :is(& > *) { opacity: 40%; } } }
  ```
- Production build (`npm run build`, rc 0), from `build/client/assets/*.css`:
  - `:is(.aria-disabled\:\*\:opacity-40[aria-disabled=true]>*){opacity:.4}`
  - `.not-aria-disabled\:hover\:bg-foreground\/8:not([aria-disabled=true]):hover{…}`
  - `.aria-disabled\:cursor-not-allowed[aria-disabled=true]{cursor:not-allowed}` (overridden; see the STOP above)
  - `button:active:not(:disabled):not([aria-disabled=true]),[role=button]:active:not(:disabled):not([aria-disabled=true]){transform:scale(.98)}`

  This matches `[aria-disabled="true"] > *`, so it is not a §10 STOP.

## Changed files (all within §5)
- `app/components/arrangement/ArrangementTransport.tsx`:
  - module-local `softDisabledButtonProps(isUnavailable)`, `preventSoftDisabledMouseFocus`, `isSoftDisabledButton(button)`;
  - the 7 buttons lose `disabled`, get `aria-disabled="true"` plus mousedown `preventDefault` only when unavailable (absent otherwise), and an `onClick` guard as the first statement, before `armFocusHandoff` and before the action;
  - Split/Delete title selection per §2.2;
  - `toolButtonClass` and the 4 `enabled:` overrides → `not-aria-disabled:` / `aria-disabled:`;
  - handoff predicate rekeyed on `aria-disabled`.

  Play/Stop handlers, the position writer and the grid classes are untouched; Delete's `aria-label` is unchanged.
- `app/lib/arrangement/strings.ts`: `undoTitle`/`redoTitle` null branches; `splitNeedsTargetTitle`, `deleteNeedsTargetTitle`.
- `app/styles/app.css` l.380–381, `app/styles/base/utilities.css` l.73–74: `:not([aria-disabled="true"])` appended.
- Tests:
  - `self-disabling-focus.test.tsx`: 10 transport `.disabled` reads → `aria-disabled` read + `hasAttribute('disabled') === false`. FL1's `reset().disabled` (l.280, detail panel, not transport) is unchanged. New describe SD1–SD7.
  - `transport-surface-ui.test.tsx`, `mode-toggle-colour-ui.test.tsx`: see the deviation above; `loop.disabled` / `remove.disabled` → aria reads; `transportOn` string → `not-aria-disabled:` (count stays 2).
  - `waveform-zoom.test.tsx`: `transportButton` returns `ariaDisabled`.
  - `strings.test.ts`: new null-branch texts; the 2 new keys in the static inventory table. They are static strings, so they were not added to `EDIT_FORMATTER_SAMPLES`.
- `docs/implementation/2026/quarter-IV/206-sys-5-disabled-reasons-stage-1.md` (new). l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 276 PASS)`. It has the 7 TEMPLATE headings in order, and every row id it cites (SD1–SD7, FL3–FL6, FL10, ST-K1) exists.

## Commands run (results)
- Claims K1–K14 and SW1 at HEAD before editing: all match the task (SW1 40 files; 20/7/1/11). After the change, the perf needle [K12] still matches: `ArrangementTransport.tsx` l.180 `<span className="truncate">Undo` (`perf/lib/app-labels.ts` l.83).
- `npx vitest run` on the 20 §6.3 files: first run 378 passed; **final run after SD2b: 20 files, 379 tests passed**, 29.3 s (`a-round-276/vitest-covering-final.log`; slowest single test 1.49 s). First run's slowest single test 1.56 s (SS2 in shortcut-sheet-ui, 5 s default timeout) and slowest file grid-snap-menu at 12.0 s; nothing is above 50 % of its timeout. `self-disabling-focus`: 18 tests (FL1–FL10, SD1–SD7, SD2b). typecheck, lint, scoped Biome and the manifest check were re-run after SD2b: all rc 0.
- `npm run typecheck`: rc 0. `npm run lint`: rc 0 (repository warnings unchanged; none in the owned files).
- `npx biome check` scoped to the 7 owned TS/TSX files: clean. Biome's config does not process the two CSS files.
- `npm run build`: rc 0.
- `sha256sum -c b-round-275-r276-tree-sha256.txt`: rc 0. `git status --short` shows only §5 paths.

## Mutants (scratch: copy, mutate, run, restore, sha256 verified; `a-round-276/mutants.py`, `mutants.log`)
| Mutant | Red rows | Expected |
|---|---|---|
| M1 Split guard deleted | SD2 | SD2 ✔ |
| M2 mousedown preventDefault deleted | SD3 | SD3 ✔ |
| M3 handoff predicate back to `.disabled` | FL3, FL4, FL5, FL6, FL10, SD5 | FL3/FL5 + SD5 ✔ (the task calls Delete → Undo "FL3"; in the file it is FL5, and both are red) |
| M6/M7 (review follow-up) Undo / Redo guard deleted | SD2b / SD2b | ✔ |
| M4 `undoTitle(null)` → `'Undo'` | SD1, ST-K1 | ✔ |
| M5 `disabled:opacity-40` instead of the children token | SD7 | ✔ |

## SD5b: not written (no reachable state)
Each handoff partner is available at the moment its source becomes soft-disabled:
- **Undo → Redo:** Undo becomes unavailable only after an undo, which pushes that entry onto redo, so Redo is available.
- **Redo → Undo:** symmetric.
- **Delete → Undo:** Delete becomes unavailable only after a successful delete, which adds an undo entry. A refused delete changes neither the selection nor the range, so Delete stays available.
- **Zoom back → Fit:** Fit has no unavailable state.

The "partner unavailable → focus stays on the source" branch of §2.4 is coded (the early return leaves focus where it is; the source is still focusable), but jsdom cannot reach it.

## Own browser probe (A's check, not C evidence)
`a-round-276/probe.cjs`, `probe-1440.cjs`, `probe.json`, `probe-1440.json`, screenshots `a276-1280.png`, `a276-1440.png`; the 1440 run was repeated because the first pass did not load. All probes used fresh, anonymous browser contexts; no persisted browser state was created or needed (`a-browse.json` was not used).
- Transport Tab stops at both viewports (14): Undo, Redo, Split, Delete, Follow, Play, Stop, Back to start, Loop, Zoom (px/s), Zoom to selection, Zoom back, Fit, Export. The seven have `aria-disabled="true"`.
- Ring on a focused soft-disabled button: `solid 1px` brass at 80 %, button opacity 1, identical to Fit.
- Each soft-disabled button:
  - hover background equals rest;
  - pressed `transform: none`;
  - first child opacity 0.4;
  - mouse click leaves `document.activeElement` on the previously focused element;
  - Enter changes nothing (status string identical).
- Cursor `pointer`: see the STOP above.

## Code-reviewer (actual `code-reviewer` subagent, given the full diff; score 8/10, no Critical/High)
| Finding | Severity | Disposition |
|---|---|---|
| SD2 does not catch a deleted Undo/Redo guard: empty-history `undo()`/`redo()` write no status (ArrangementContext l.2413–2439) | Medium | **Fixed in grant:** new row **SD2b** in the SD describe. All seven are clicked during an active `beginPointerGesture()`, when undo/redo/split/delete/loop would write a refusal; status and sequence are unchanged. Mutants (`a-round-276/mutants-sd2b.log`): M6 (Undo guard deleted) and M7 (Redo guard deleted) both make SD2b red; file restored, sha verified |
| Delete's `aria-label` "Delete — the selected clip; leaves a gap" contradicts the no-selection title | Low | Not changed: §2.2 freezes the `aria-label` in every state. **For B:** proposed id `A-R276-REVIEW-DELETE-NAME` (deferred_low_polish or stage 2), e.g. `rangeDeleteHint ?? (selectedClipId ? deleteClipLabel : deleteButton)` |
| Doc 206 states the partner-unavailable branch without saying it is untested | Low | Fixed: doc gives the per-pair unreachability reason (same as SD5b below) |
| Doc 206 says Space "changes nothing" | Low | Fixed: "click and Enter run nothing; Space keeps the workspace play/stop" |
| mousedown `preventDefault` no longer blurs a focused text field (marker rename, tempo) when a greyed button is clicked; HEAD's native disabled did blur it in Chrome | Low (FYI, intended by §2.1 / B-MOUSE-FOCUS) | Noted in doc 206. **For B/C:** C may want one probe (marker editor open → click a soft-disabled button → editor stays open, not committed) |

**Architecture note (for B/root; not acted on):** the two-line guard is hand-copied into seven `onClick`s, separate from `softDisabledButtonProps(...)`. A button that gets the props but misses the guard would run its action while it looks disabled. Keep this round. Stage-2 proposal: the shared helper also owns the click wrapper (`softDisabledButtonProps(isUnavailable, onActivate)` returning `onClick` + `aria-disabled` + `onMouseDown`), with guard → `armFocusHandoff` → action order unchanged, and SD1–SD7, FL3–FL10 and an SD2b variant run over all nine users. The reviewer prefers the DOM-attribute guard to a closure guard (one source of truth).

## Known gaps / not done by A
- The cursor STOP above.
- B-R275-FOCUS-REASON-VISIBLE and B-R275-SPLIT-HELD-ENTER stay deferred (task §2.6).
- No HEAD second server was run. V-REST, V-HOVER-ENABLED, B-AX, B-SPACE, B-SHORTCUTS and B-SHEET-RESTORE are C rows.

## Exact next C checks
- SOURCE-SCOPE and HUNK-SCOPE.
- M1 and M3 re-run.
- B-TAB (plus 375×812 and backward), B-AX, B-NOOP, B-MOUSE-FOCUS, B-HANDOFF-DELETE/ZOOM/UNDO, B-ENABLE-WHILE-FOCUSED, B-SPACE, B-SHORTCUTS, B-SHEET-RESTORE.
- V-REST (fill no longer dimmed, by design), V-HOVER-SOFT (background half; cursor half awaits B's ruling), V-HOVER-ENABLED, V-PRESS, V-RING, SCREEN-BUDGET.
- G276-AUTH, DOC-206, RT-FIX-276, STUDIO-SMOKE-276.

## Acceptance status (A's view; C decides)
- Passed by A's runs: SD1–SD7, SD2b, the §6.1 conversions, M1–M5 red, the targeted tests, typecheck, lint, scoped Biome, build, manifest.
- Not claimed: every browser row (C), and V-HOVER-SOFT's cursor half (STOP above).
