# A — Round 114 report: T12 stage 1, the Clip Gain fader (D-29z79)

**Implementer:** A (Claude Opus 5.5) · **Date:** 2026-10-23 · **Status:** implementation done, waiting for C. Nothing is committed or pushed.

## Start state
- HEAD `c2837f1cb72e702742a7cf51362214009983d30b`. `git status --short --untracked-files=all` was clean.
- Frozen list `b-round-113-r114-tree-sha256.txt`: **OK** at the start.
- Pre-flight run. Primitives read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, AUDIO_ARCHITECTURE, DESIGN_TOKENS, TAILWIND_FIRST, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, and `prompts/studio-feature.md`.

## R7 mechanism: option (b), a Master-style pair
- **Chosen:** (b). New context functions: `previewClipGainFader(clipId, dB)`, `commitClipGainFader(clipId?)`, `beginClipGainFaderGesture(clipId, pointerId)`, `blurClipGainFader(clipId)`. Internal: `flushPendingClipGain`, `revertClipGainFaderPreview`, `cancelClipGainFaderGesture`.
- **Why not (a):** `previewVolumeTarget`, `commitVolumeTarget` and `flushPendingVolume` hard-code the label `Volume` and contain group-specific flush branching. A `'clip'` kind would change the shared track/group path, which goes against R7's hard constraint.
- **How (b) touches the existing code:** `flushPendingClipGain()` was added next to `flushPendingMaster()` in `applyEdit`, `undo`, `redo`, `beginVolumeTargetGesture`, `beginTrackPanGesture` and `beginMasterGainGesture`. It was also added to the "first preview" branch of `previewVolumeTarget` and `previewMasterGain`. It does nothing unless a clip-gain preview is pending, so track, group and Master behaviour is unchanged. Their existing tests pass without edits.

## Diff summary per file
| File | Change |
|---|---|
| `app/hooks/useRelativeFaderDrag.ts` | New optional `fineDivisor?: number`. The `onPointerDown` body is restructured into a re-anchorable `anchorX`/`anchorValue`/`anchorFine` plus `lastX`. Fine mode is on when `fineDivisor` is set and `move.shiftKey` is true; it uses an effective width of `width × fineDivisor`. When fine mode toggles, the drag re-anchors at the **previous** pointermove x and the last previewed value, so the toggle move itself is computed in the new mode. With `fineDivisor` undefined, every computed value is the same as before. |
| `app/contexts/ArrangementContext.tsx` | Interface plus the four functions above. New refs `clipGainBeforeRef`, `clipGainClipIdRef`, `clipGainGestureRef`. A pending preview for a different clip is flushed first. The gesture is released in the unmount cleanup. Values are exposed in the context value and its memo deps. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | New optional props (`getArrangement` plus the four functions). New fader `data-testid="arrangement-detail-clip-gain-fader"`: min −60, max 24, step 0.1, value `gainDb ?? 0`, aria-label `Clip Gain — fader`, aria-valuetext `formatMasterGainDb`. It uses `useRelativeFaderDrag` with `fineDivisor: 10`. `readStoredValue` reads `getArrangement()` (R5). Double-click resets through preview(0) and commit, so at 0 it writes no entry. Keyboard: change → preview, keyup → commit. Blur → `blurClipGainFader`. Disabled, `title` and `aria-describedby` match the field. Pointerdown and double-click are ignored while disabled. **Layout:** the fader sits in the existing `0 dB` row, before the button (`w-24`). The block went from `w-32` to `w-48`. DOM and tab order: field → fader → `0 dB`. |
| `app/components/arrangement/StudioWorkspace.tsx` | Passes `getArrangement` and the four functions to `ArrangementDetailPanel` only. |
| `app/lib/arrangement/__tests__/clip-gain-fader.test.tsx` (new) | CF1–CF14. |
| `docs/implementation/2026/quarter-IV/098-studio-clip-gain-fader.md` (new) | Georgian implementation doc. l.4: „Round 114 — C-ის შემოწმებას ელოდება (D-29z79; T12 ეტაპი 1).“ |
| `docs/implementation/2026/quarter-IV/097-studio-fader-touch-no-jump.md` | R9: l.4 now reads „Round 113 — C PASS (`c-round-113.json`, gate 113 `c2837f1`).“ The TC/MC/KB TODO row is marked `[x]`. R38-T and TOUCH-DOUBLE-TAP-RESET stay open. |

**Conditional tests:** none changed. All of them pass unchanged with the new fader, as do `markers-ui`, `marker-edge-nav-ui`, `track-layout`, `render-budget` and `detail-panel`.

## Interpretation to note (R2 re-anchor point)
- B's text says Shift "re-anchors at the current pointer x".
- **Problem with the literal reading:** pointer events only report Shift on the next move. Anchoring at that move's own x drops its delta, so +10 px coarse then +10 px fine would give 8.4.
- **What I did:** I anchor at the previous pointermove x (the pointer position when Shift changed), and compute the toggle move in the new mode. That gives 9.2, which is what CF4 and C's CG-FINE-TOGGLE formula (`10/w×84 + 10/w×8.4`) expect. This is the reading that makes B's own acceptance reachable.

## Deviation to note (R8 layout)
- **First layout:** the fader on its own `w-full` row inside the `w-32` block.
- **Problem:** my Playwright probe showed that at **1280×720**, with the panel open at its default height, the `0 dB` button was **outside** the content's visible box. The content scrolled vertically and there was no spare height.
- **Fix:** I kept the panel height and the number of rows. The fader moved into the `0 dB` row, and the block widened to `w-48` (Tailwind only, no CSS file).
- **Re-measured at both viewports:** the fader (96 px) and `0 dB` are inside the box; the block's `scrollWidth` 192 equals its `clientWidth` 192; the pending marker is visible (≈49 px, truncating, as before).
- **Side effects:** the waveform column (flex-1) is 64 px narrower. At 1280 the detail content still has `scrollHeight` 98 > `clientHeight` 83. This vertical overflow comes from the info column, not the Clip Gain block:
  - Both 1280 screenshots, before the layout fix and after it (the earlier capture was overwritten at the same path; the current one is `a-round-114/probe/out/fader-1280x720.png`), show the info column's 5th line „წყარო უცვლელი რჩება“ cut off.
  - The Clip Gain block's own height is unchanged: label, field, one row.

## Tests
- **New file, 14/14 pass.**
  - CF1 range, value, aria-valuetext (0.0 / −6.0 / +3.0) and tab order;
  - CF2 +25 px gives +21.0 over two moves, one entry, the field follows, Undo restores;
  - CF3 Shift gives +2.1, one entry;
  - CF4 re-anchor: +8.4, then the Shift toggle move gives 9.2 (step ≤ 0.9), then Shift released gives 17.6, one entry;
  - CF5 a press with no move writes nothing;
  - CF6 double-click from −6.0 writes one entry, double-click at 0.0 writes none;
  - CF7 ArrowRight ×3 gives +0.3 with **3 entries, one per press** (the R3 rule; C's CG-KEY must match);
  - CF8 disabled for video, two clips and no selection, with the same reason id as the field;
  - CF9 typed −3 then a drag gives two entries, 18.0 then −3.0 then 0.0;
  - CF10 a press during the separator gesture is refused with the gesture status, no entry;
  - CF11 must-not: Volume 0.35 and Master −12 are the same with Shift;
  - CF12 a drag while playing ramps the clip gain node to `10^(dB/20)`, with 0 new `applySchedule` calls and 0 new sources;
  - CF13 (added from review) blur or pointercancel mid-drag reverts, writes no entry and releases the gesture;
  - CF14 (added from review) a pending keyboard preview becomes its own `Clip Gain` entry before a Master change and before an Undo.
- **Exact §3 list:** 16 files, **277/277 pass**. Per-file counts are in `a-round-114/vitest-s3-list.log`; this is the number to use for T114-TARGETED.
- **Wider targeted run:** 21 files, **378/378 pass** (364 existing + 14 new). Files: clip-gain-fader, clip-gain, fader-click, fader-guards, fader-touch, fader-focus-order, pan-release-recovery, master-ui, track-group-mix-ui, self-disabling-focus, detail-panel-fit, detail-panel-reason, detail-panel-polish, pending-status, context-hygiene, gesture-guard, plus render-budget, detail-panel, markers-ui, marker-edge-nav-ui and track-layout. Log: `a-round-114/vitest-targeted.log`.
- **Mutations** (temporary edits, reverted, `cmp` confirmed; logs in `a-round-114/mut-m*.log`):
  - m1, ignore Shift: CF3 and CF4 go red.
  - m2, no re-anchor: CF4 red.
  - m3, commit on every move: CF2 and CF4 red. The first version of CF2 had one move and missed m3, so I strengthened it to two moves.
  - m4, fine mode by default: CF11 red.
  - m5, the double-click writes 0 → 0.1 → 0: CF6 red. My first m5 was structurally deduped by `commitHistory` and proved nothing, so I replaced it.
  - m6 (extra), drop the clip-gain flush in `previewMasterGain`: **survived**. In the tested sequence the flush in `applyEdit` produces the same history, so that line is defensive. Not claimed.
- `npm run typecheck`: exit 0.
- `git diff` hunks in ArrangementContext: all 22 are new code or dependency arrays I touched. There is no stray reformatting.
- `npm run lint`: 0 errors, 218 warnings. The scoped `biome check` on the 5 owned code files has 0 diagnostics; the 218 warnings come from other files. `biome format --write` was applied to the owned files only.
- Full suite, `verify` and e2e smoke were not run (speed rules; these are gate rows).
- **Browser sanity (A, not a C acceptance):** `a-round-114/probe/fader-probe.cjs`, out/ and screenshots, both viewports on :5173.
  - +20 px gives +17.5 (expected 20/96 × 84 = 17.5).
  - Shift gives +1.8 (expected 1.75 ± step).
  - Ctrl+Z gives 0.0; double-click gives 0.0; a 15 % press with a 100 ms hold changes nothing.
  - 0 page errors, 0 hydration errors, 0 forbidden requests, 0 Authorization headers.

## Code review (code-reviewer subagent, actually run)
- **Score 8.5/10.** No Critical, High or Medium findings.
- **Lows:**
  - (1)(2) Test gaps for blur/cancel and the pending-fold rules: **fixed** with CF13 and CF14.
  - (3) The early return in the hook is existing behaviour. Informational.
  - (4) Optional props: if `previewClipGainFader` is missing, the fader is disabled without a reason. Not reachable in the app; left as is.
  - (5) A 1 px move between the two clicks of a double-click can write an extra entry before the reset. Master and group faders behave the same; C's CG-DBL should note it.
  - (6) `fineDivisor` is not validated (only the constant 10 is passed).
  - (7) The fader uses `disabled:opacity-50`; the field uses `disabled:text-dim`. Cosmetic.
  - (8) Existing: `previewArrangement` does not flush pending previews (Volume and Master have the same exposure). Not changed (out of scope).
- **Architecture note for B/root (proposal only, no refactor done):** ArrangementContext now has three volume-like pending-preview machines, and the flush trio appears at about 9 places. The reviewer says keep it for now: R7 forbade touching track/Master, and the tests are green. After T12 stage 2, consider one scoped task that merges them into a single tagged pending slot with one `flushPending()`, with the Volume, Master and Clip Gain tests unchanged. This relates to the ARCH-R81 trigger ("a third target kind").

## End state
- `git status --short --untracked-files=all`:
  - ` M` ArrangementDetailPanel.tsx, StudioWorkspace.tsx, ArrangementContext.tsx, useRelativeFaderDrag.ts and doc 097;
  - `??` clip-gain-fader.test.tsx and doc 098.
  - This matches §2.
- Frozen list: **OK** at the end.
- Protected hashes are unchanged: studio.$productId `fa2cf0bc`, api.studio-token `13914809`, auth.ts `56f5b76f`, AuthContext `bf9ee257`.
- No commit, push, stash, checkout, server restart or install.

## B acceptance criteria I truly met (A side)
- R1–R7 and R9 are implemented, and their unit tests pass.
- **R8:** measured in my Playwright sanity probe at both viewports, but it is **C's row (CG-LAYOUT) to accept**.
- **§3:** CF1–CF12 plus CF13 and CF14 are green. Mutations m1–m5 are red as required. Typecheck and lint pass. The listed vitest files are green. The code-reviewer ran and its findings were addressed or reported.
- **Not claimed:**
  - all C rows (CG-*, G-T*, NB-*, PX-NET, REG-HYD, G114-3, DOC-*);
  - the export rows G-T1/T2/T8/T9 and G-NONDESTRUCT (I did not run any export);
  - CG-TOUCH and CG-PLAY in a real browser.

## Exact next C checks
- **Layout:** CG-PRESENT and CG-LAYOUT at both viewports. The fader is now 96 px wide and sits in the `0 dB` row; use the measured `w` in the Δ formulas.
- **Drag rows:** CG-NOJUMP, CG-DRAG, CG-FINE and CG-FINE-TOGGLE (Shift pressed with no pointer move produces nothing until the next move; the toggle move uses the new mode from the previous x).
- **Keyboard:** CG-KEY expects **3 entries for 3 presses**.
- **Reset and field:** CG-DBL (keep the mouse still between the clicks; see review Low 5), CG-SYNC, CG-PENDING-DRAG, CG-DISABLED.
- **Touch and playback:** CG-TOUCH and CG-PLAY.
- **Export:** G-T1/T2/T8/T9 and G-NONDESTRUCT.
- **Neighbours:** NB-TRACK-SHIFT, NB-MASTER, NB-RESET-BTN.
- **Scope, security and docs:** SOURCE-SCOPE, T114-TARGETED (the §3 list: 16 files / 277 tests; my wider run: 21 / 378), AN-REVIEW, PX-NET, REG-HYD, G114-3, DOC-098, DOC-097-L4.
- **Layout regression:** check that the narrower waveform column in the detail panel still looks fine (the block grew by 64 px).
