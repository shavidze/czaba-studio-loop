# A — Round 108 report: a self-disabling button hands keyboard focus to its partner (C-R107-01, FL-HISTORY, FL-ZOOM; D-29z73)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · STATUS: implementation complete, waits for C. No commit/push.

## Start state
- HEAD `fc086179b6f16d6ca6a523c79d333a5e6248c599`; `git status --short` empty; frozen list 539/539 OK; owned files = B snapshots. `:5173/studio-lab` 200. No servers started/stopped.

## End state
- HEAD unchanged. Status = **3 M + 2 ??** (exactly the five owned paths). Frozen list 539/539 OK at end.
- End hashes (`a-round-108/end-hashes.txt`):
  - `bf699db8…` app/components/arrangement/ArrangementDetailPanel.tsx
  - `9de0cde4…` app/components/arrangement/ArrangementTransport.tsx
  - `76415503…` app/lib/arrangement/__tests__/self-disabling-focus.test.tsx (new)
  - `f1822830…` docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md (l.4 only; diff = 1 line)
  - `a5017124…` docs/implementation/2026/quarter-IV/093-studio-self-disabling-button-focus.md (new)
- Hunks vs snapshots:
  - DetailPanel: l.384–405 (`clipGainInputRef` declared directly above `resetClipGain`, plus `resetClipGain`), l.544 (`ref` on the Clip Gain input), l.573 (0 dB `onClick`).
  - Transport: l.1 (`type KeyboardEvent` import), l.8 (new `useIsomorphicLayoutEffect` import), after l.73 (refs, `armFocusHandoff`, layout effect, `preventRepeatedEnterKeyDown`), Undo, Redo, ⌫, ↩ Zoom and Fit (`ref` only).
  - Untouched: Play, ↤, position, Split, Loop, Follow, slider, ⇔, Export, `commitClipGain`, `handleClipGainKeyDown`.

## What changed
- **F1:**
  - Each of Undo, Redo, ⌫ and ↩ Zoom arms a local ref `{source, partner}` in its `onClick`, but only if `document.activeElement === event.currentTarget`, and then calls its action.
  - `useIsomorphicLayoutEffect` (no deps array) reads and clears the ref on every render. If the source is now `.disabled`, the partner is enabled, and activeElement is the source, BODY or null, it calls `partner.focus()`.
  - Partners: Undo→Redo, Redo→Undo, ⌫→Undo, ↩ Zoom→Fit.
  - `0 dB`: `resetClipGain(button)` records held focus at click time (after the gesture guard). After a successful `setClipGain(…, 0)` it focuses the Clip Gain input. The mouse path is unchanged: `onMouseDown` preventDefault means the button never holds focus, so focus does not move.
- **F2:** Undo, Redo, ⌫ and ↩ Zoom get `onKeyDown` that calls preventDefault on a repeated Enter (no stopPropagation).
- **NOT DONE — the Fit F2 guard (blocked by a frozen test; reported to B):**
  - `app/lib/arrangement/__tests__/export-toolbar-hold-enter.test.tsx:269–272` (TH5) pins "a repeated Enter on the toolbar Fit button is not prevented". Per task l.134 I did not edit it and stopped that part. m9 was not run.
  - Consequence: in Chromium, a held Enter on ↩ Zoom moves to Fit on the last step, and the remaining repeats each trigger Fit. No C row in round 108 holds Enter on ↩ Zoom. B needs to decide: change TH5 or drop the Fit guard.

## Commands and results (actually run)
- `npm run typecheck`: exit 0.
- `npm run lint -- --max-diagnostics=500`: exit 0; 0 diagnostics in the owned files (repository total: 218 warnings and 1 info, none in owned files).
- `npx biome check` on the 3 owned code/test files: exit 0, "No fixes applied" (no `--write`).
- Targeted vitest (`a-round-108/targeted-list.txt`, the exact grep from §1): **66 files, 1126 tests, all pass**.
  - B expected about 70 files: the same grep gives 66 here. C should re-run the grep.
  - Logs: `a-round-108/targeted.log`. File list: `targeted-list.txt`.
- New file alone: 10/10 pass.
- Full suite and `npm run verify`: not run (speed rules; gate).

## Fail-before (scratch `a-round-108/mut/`: the two code files = B snapshots, final test file; Vitest `cacheDir` inside scratch, `node_modules` symlink)
- Red: FL1, FL3 (2nd click, l.310), FL4 (2nd click, l.325), FL5, FL6, FL9, FL10. Green: FL2, FL7, FL8.
- This matches B's §1 expectation. FL10 is extra: it was added after review and is expected red.
- Raw output: `mut/results/fail-before.raw`. Summary: `mut/results/summary.txt`.

## Mutations (scratch; `mut/mutate.py`; control 10/10 green before and after)
| ID | Mutation | Red |
|---|---|---|
| m1 | drop `clipGainInputRef.current?.focus()` | FL1 |
| m2 | `if (isReset)` without held-focus check | FL2 |
| m3 | effect without the `source.disabled` check | FL3 (1st click, l.306), FL4 (l.321) |
| m4 | drop arm in Redo | FL4 |
| m5 | drop arm in ⌫ | FL5 |
| m6 | drop arm in ↩ Zoom | FL6, FL10 |
| m7 | arm without `activeElement === source` | FL7 |
| m8 | drop `onKeyDown` guard from Undo | FL9 |
| m9 | Fit guard | **not run**: guard not implemented (TH5) |
| m10 (extra) | drop the `activeElement === document.body` branch | FL10 |

FL8 uses the refusal "Undo during `beginPointerGesture()`" and asserts `status === GESTURE_UNDO_BLOCKED_MESSAGE`, Undo enabled and focus kept.

## Code-reviewer (actual subagent `code-reviewer`; score 8/10, no Critical)
Dispositions:
- **Low: stale arm after a 2nd identical refusal during a gesture.** `reduceArrangementStatus` skips the re-render, so the arm can survive until the next render.
  - **Not fixed; reported to B.** The fix needs `isPointerGestureActive` from the context. That means changing the `useArrangement()` destructure (l.52–68, outside the narrow owned range) or adding a second hook call.
  - The outcome is benign: focus goes to the partner instead of BODY, and only if that next render disabled the source while focus was on it or on BODY.
  - Doc 093 states this residual. My first draft of doc 093 wrongly said setStatus always re-renders; I corrected it.
- **Low: FL9 tested disabled buttons.** **Fixed:** FL9 now makes edits, undoes once and selects a clip, asserts all four buttons are enabled, then checks the guard.
- **Low: the Chromium BODY branch was not unit-covered.** **Fixed:** FL10 (the harness blurs to BODY before the commit), guarded by m10.
- **Low: FL6 uses a wrapper, not the real `zoomTimelineBack`.** **Documented** in doc 093. StudioWorkspace is frozen; C's FL-ZOOMBACK covers the real path.
- **Low (accepted asymmetry): 0 dB uses synchronous focus.** It relies on the invariant "success ⇒ gainDb undefined ⇒ disabled", which FL1 pins.
- **Info (not in this rule):** exhausting history with the Ctrl+Z shortcut while Undo is focused still drops focus to BODY, because the shortcut path never arms.

**Architecture note (verbatim):**
> Architecture note: signals #4 (a new handoff ref and a deps-free layout-effect lifecycle inside `ArrangementTransport.tsx:78-107`) and #3 (the repeated-Enter guard region, edited in rounds 107 and 108, with `ARCH-R107-SHARED-ENTER-GUARD` still pending; separate handoff mechanisms now exist in Transport, `ArrangementDetailPanel.tsx:394-404`, `ArrangementLane.tsx:720-723` and `ArrangementMarkerRow.tsx:172-191`) → keep for now, since it is one ref and one effect, the partners are in-file refs and there is no prop plumbing, so value is low and the risk of extracting is moderate (gesture lifecycle, Undo/Redo atomicity). Proposal for the planner: once the sweep hits below are confirmed, a single scoped task for a shared "self-disabling or self-unmounting focus handoff plus repeated-Enter guard" for Library collapse/expand/search-clear, with refusing the handoff during a pointer gesture as an acceptance test.

**Self-disabling sweep (reviewer, read-only; no fix; for B):**
- **Hits** (focus can drop to BODY):
  - `ArrangementLibrary.tsx:391-400` (◀ collapse) and `:376-385` (▶ expand): each unmounts itself and mounts the counterpart, with no refocus.
  - `ArrangementLibrary.tsx:414-424` (× search clear): it unmounts when the query clears. The natural partner is the search input at `:404`.
  - Possible hit: `ArrangementVideoDock.tsx:902-910`, the placeholder "დაბრუნება", which unmounts itself. Whether `floatFocusRef` covers it is unverified.
- **Inconsistent with the new rule:** `ArrangementLane.tsx:718-732`, track pan reset. It focuses the slider unconditionally: no held-focus check, no mouseDown preventDefault, no repeat guard.
- **Handled by existing code:**
  - Export dialog Start/Cancel: focus effect at `ArrangementExportDialog.tsx:164-180`. There is a short passive-effect window on BODY; the reviewer did not verify that the window Enter gate covers it.
  - Marker menu delete (`focusMarkerTarget`).
  - Grid menu.
  - Group header editor.
  - Video dock Close.
- **Non-hits:** Split, Loop, ⇔, Detail Apply, Metronome, Library preview ▶/＋, Lane/Group folds, Master.

## Browser self-check (A evidence, NOT C acceptance; Chromium 1280×720, `a-round-108/browser/selfcheck.cjs`, JSON and PNG there)
- **FL-UNDO:**
  - 2 clips. Enter 1 → 1 clip, focus on Undo.
  - Enter 2 → 0 clips, Undo disabled, focus on `Redo: დამატება — Middle East — საჯარო preview`.
  - Enter 3 → 1 clip at 0.000, status `Redo: დამატება — …`, Redo still enabled.
- **FL-DELETE:**
  - Enter 1 → 0 clips, focus on `Undo: კლიპის წაშლა`.
  - Enter 2 → 1 clip at 0.000, Redo `Redo: კლიპის წაშლა`, status `Undo: კლიპის წაშლა`.
- **FL-GAIN-KEYBOARD:**
  - Reset → status `Clip Gain: Middle East — საჯარო preview — 0.0 dB.`, 0 dB disabled, focus on the clip-gain input, value 0.0.
  - Enter 2 → `Clip Gain უცვლელია: 0.0 dB.`, clip count 1, Undo stays `Undo: Clip Gain`.
- All three: 0 console errors, 0 forbidden requests.
- **Environment note:** the very first page load (before these runs) showed "Invalid hook call" / hydration pageerrors and no library. An identical immediate retry was clean, so this looks like a transient Vite dependency re-optimization on the shared dev server, not this change. C should watch REG-HYD on its first load.
- Not self-checked: FL-GAIN-HOLD, FL-GAIN-MOUSE, FL-UNDO-HOLD, FL-REDO, FL-ZOOMBACK, FL-UNDO-MOUSE, 1440 viewport.

## B acceptance status (only what A truly ran)
- Passed by A: fail-before list (§1), m1–m8 red as specified, targeted vitest green, typecheck and lint clean, Biome clean on the owned files, scope 3M+2??, frozen 539/539, doc 092 l.4 only, doc 093 written.
- **Not passed / open:** F2 on Fit (TH5 conflict), m9.
- All C browser rows are for C.

## Exact next C checks
- FL-GAIN-KEYBOARD (1280 + 1440), FL-GAIN-HOLD, FL-GAIN-MOUSE, FL-UNDO (1280 + 1440), FL-UNDO-HOLD, FL-REDO, FL-DELETE (1280 + 1440), FL-ZOOMBACK, FL-UNDO-MOUSE.
- Regressions: HK-UNDO-STILL-REPEATS, R12-L2-ENTER-ADD, HE-MARKER-ADD, SR-TEXT-REG, PX-NET, REG-HYD (watch the first load), G108-3.
- AN-REVIEW: re-run m1, m3, m5, m7, m8 with C's own strings. Note that FL3/FL4 fail-before lines are 310/325 and the m3 lines are 306/321.
- T108-TARGETED: re-run the grep; A got 66 files.
- DOC-092-L4, DOC-093, SOURCE-UNCHANGED.
- Also record (not a FAIL of A's rows): a held Enter on ↩ Zoom repeats Fit (TH5 gap).

## Open items for B
1. TH5 vs the D-29z73 Fit guard: a decision is needed.
2. Stale arm under a repeated gesture refusal (Low): needs `isPointerGestureActive` in `armFocusHandoff`, which is outside this round's range.
3. Sweep hits: Library collapse/expand/search-clear, pan-reset inconsistency, possible video-dock placeholder.
4. The Ctrl+Z shortcut exhausting history while Undo is focused still drops focus to BODY (not in rule F1).

## Addendum: transient first-load error, evidence
- The failed first `selfcheck.cjs undo` run wrote `browser/undo-1280x720.json`, and the clean retry **overwrote** it. The only record of the "Invalid hook call" / "Cannot read properties of null (reading 'useState')" / hydration pageerrors is my console output in this session; there is no saved artifact.
- `store/node_modules/.vite/deps/_metadata.json` mtime is **2026-10-23 11:36:03 UTC**, which coincides with that first browser load. So the dev server re-optimized its deps on that load. My store-level vitest runs started at ~11:31:59; `node_modules/.vite/vitest/` was created at 11:32:02, in the same `.vite` folder.
- Causation is **unverified**. Infrastructure note for root: a Vitest run in `store/` may trigger a dev-server dep re-optimization, which breaks the next first page load. This is not a code bug of this round. C should treat a first-load REG-HYD failure as suspect and retry once while recording it.

## Targeted file list (66 files; `a-round-108/targeted-list.txt`)
- app/lib/arrangement/__tests__/ArrangementContext.test.ts
- app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx
- app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx
- app/lib/arrangement/__tests__/clip-fades-ui.test.tsx
- app/lib/arrangement/__tests__/clip-gain.test.tsx
- app/lib/arrangement/__tests__/collection-load-status.test.tsx
- app/lib/arrangement/__tests__/context-hygiene.test.tsx
- app/lib/arrangement/__tests__/delete-selection-ui.test.tsx
- app/lib/arrangement/__tests__/detail-panel-fit.test.tsx
- app/lib/arrangement/__tests__/detail-panel-polish.test.tsx
- app/lib/arrangement/__tests__/detail-panel-reason.test.tsx
- app/lib/arrangement/__tests__/detail-panel.test.tsx
- app/lib/arrangement/__tests__/export-cancel-ui.test.tsx
- app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx
- app/lib/arrangement/__tests__/export-dialog-focus.test.tsx
- app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx
- app/lib/arrangement/__tests__/export-mp3.test.tsx
- app/lib/arrangement/__tests__/export-progress-ui.test.tsx
- app/lib/arrangement/__tests__/export-range-ui.test.tsx
- app/lib/arrangement/__tests__/export-toolbar-hold-enter.test.tsx
- app/lib/arrangement/__tests__/fader-click.test.tsx
- app/lib/arrangement/__tests__/fader-focus-order.test.tsx
- app/lib/arrangement/__tests__/fader-guards.test.tsx
- app/lib/arrangement/__tests__/failed-source-refusal.test.tsx
- app/lib/arrangement/__tests__/floating-video.test.tsx
- app/lib/arrangement/__tests__/gesture-guard.test.tsx
- app/lib/arrangement/__tests__/gesture-reentry.test.tsx
- app/lib/arrangement/__tests__/grid-musical-ui.test.tsx
- app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx
- app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
- app/lib/arrangement/__tests__/grid-snap-keys.test.tsx
- app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
- app/lib/arrangement/__tests__/grid-snap-menu.test.tsx
- app/lib/arrangement/__tests__/grid-snap-position.test.tsx
- app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
- app/lib/arrangement/__tests__/grid-triplet-ui.test.tsx
- app/lib/arrangement/__tests__/held-enter-add.test.tsx
- app/lib/arrangement/__tests__/library-preview.test.tsx
- app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx
- app/lib/arrangement/__tests__/marker-snap.test.tsx
- app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx
- app/lib/arrangement/__tests__/markers-move-ui.test.tsx
- app/lib/arrangement/__tests__/markers-ui.test.tsx
- app/lib/arrangement/__tests__/master-hold-tick.test.tsx
- app/lib/arrangement/__tests__/master-ui.test.tsx
- app/lib/arrangement/__tests__/meter-ui.test.tsx
- app/lib/arrangement/__tests__/metronome-horizon-ui.test.tsx
- app/lib/arrangement/__tests__/metronome-ui.test.tsx
- app/lib/arrangement/__tests__/pan-release-recovery.test.tsx
- app/lib/arrangement/__tests__/pending-status.test.tsx
- app/lib/arrangement/__tests__/position-store.test.ts
- app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx
- app/lib/arrangement/__tests__/render-budget.test.tsx
- app/lib/arrangement/__tests__/self-disabling-focus.test.tsx
- app/lib/arrangement/__tests__/status-announcement-ui.test.tsx
- app/lib/arrangement/__tests__/tempo-ui.test.tsx
- app/lib/arrangement/__tests__/tempo-window-ui.test.tsx
- app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx
- app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx
- app/lib/arrangement/__tests__/track-groups-ui.test.tsx
- app/lib/arrangement/__tests__/track-header-stacking.test.tsx
- app/lib/arrangement/__tests__/track-layout.test.tsx
- app/lib/arrangement/__tests__/track-meter-ui.test.tsx
- app/lib/arrangement/__tests__/track-pan.test.tsx
- app/lib/arrangement/__tests__/video-fades-ui.test.tsx
- app/lib/arrangement/__tests__/view.test.ts
