COMMIT: OK

Nothing in the diff blocks the commit. I read the diff and grepped all callers. I did not run the app in a browser or re-run the tests.

**Behavior and regressions**
- **Same scale as before:** `waveformScaleForGainDb(draftGainDb ?? gainDb, isVideo, zoom)` gives the same scale as the old `{ ...clip, gainDb: draftGainDb }` branch. `useMixDraftValue` returns `number | undefined`, so `??` is exact, and a draft of `0` is not swallowed.
- **Same peak shape:** `useMemo` depends on `sourceOffset` and `duration`, so trim and slip still redraw. WG9, WG10, DP45 and DP46 pin this.
- **Same gain formula:** `clipLinearGain` now calls `gainDbLinearGain`, so audio gain and waveform scale share one dB formula. Both `ArrangementContext.tsx:1402` and `:3469` still go through `clipLinearGain`.
- **Callers:** there are only two `ArrangementPeakPath` call sites (`ArrangementClip.tsx:1015` and `ArrangementDetailPanel.tsx:241`), and both pass all four props. The detail panel omits `isVideo` and `zoom`, as before. That call sits in the `!selection.isVideo` branch, and the defaults match the old behavior.

**Browser, leaks and cost**
- There are no new listeners, timers or effects. The only subscription is the existing `useSyncExternalStore` keyed by `clipId`, and the key is unchanged.
- Render cost goes down. The component list for a fade move drops from 11 to 10, and a move from 21 to 19. Trim redraws are unchanged, which is correct because the path really changes.
- There is no accessibility change. The SVG path markup is untouched.
- There is no Tailwind or token change and no new CSS.

**TypeScript strict**
- I found no `any`, `@ts-ignore` or type assertions in the diff.
- The prop types are primitives plus `Float32Array | undefined`.

**Auth, purchase and download**
- None of these are touched. The changes are limited to `app/components/arrangement`, `app/lib/arrangement` and docs, so the SECURITY_AUDIT items on tokens, XSS and CORS do not apply.
- ERROR_TAXONOMY is not relevant to this diff.

**Findings, ranked**
1. **Low, `app/lib/arrangement/waveform-zoom.ts:26`.**
   - `clipWaveformScale` now has no production caller. Only `waveform-zoom.test.tsx:16`, `:110` and `:445-450` use it.
   - Fix in a later round: edit WZ1 to call `waveformScaleForGainDb(clip.gainDb, …)`, then delete the wrapper. The implementation doc already records this as SIG-R334-INLINE-DB-GAIN.
2. **Low, `app/contexts/ArrangementContext.tsx` (inline `10 ** (gainDb / 20)`).**
   - The doc names this as a duplicate of the dB formula that should become `gainDbLinearGain`. I did not locate the line in this review.
   - Fix: replace the inline formula with `gainDbLinearGain` in a separate round, since it touches the audio gain path.
3. **Info, `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`.**
   - The doc quotes sketch numbers from B ("C measures the real values this round"). C round 334 is marked PASS, but the doc does not repeat C's measured figures.
   - Optional fix: replace the sketch numbers with C's measured ones.
4. **Info, `drag-preview-render.test.tsx` (DP43–DP48).**
   - These tests assert exact render counts, such as `ArrangementPeakPathInner` at 0 or 4. They are tied to the current memo structure and will need updating whenever the component tree changes, such as a later `ArrangementLane` memo. That is expected for this perf stage.

**Architecture note**
- Signal: `ArrangementClip.tsx:313-360` (`ArrangementPeakPath` is exported from the clip view file and imported by `ArrangementDetailPanel.tsx:55`).
  - This is a coupling signal: the detail panel depends on a leaf living inside the lane clip file, which is already about 1000 lines.
  - Keep for now, because the change is small, `buildPeakShape` and the draft key sit in the same file, and the render-log names the tests rely on stay stable.
  - Proposal for the planner, bounded: move `ArrangementPeakPath`, `buildPeakShape` and the props type into `ArrangementPeakPath.tsx`.
    - Acceptance: the `ArrangementPeakPathInner` name is kept, DP43–DP48, WG1–WG10 and WZ1 are unchanged and green, and there is no behavior change.
    - Wait until c3–c5 finish so the render-count pins don't churn.
- This note covers the diff only. It is not an audit of the whole module, and it should not be fixed in this round.