COMMIT: OK

## Code Review: round 374, PERF-11c-iii-a (Master strip, Export dialog, hook names)

I reviewed the diff and the files it touches. I did not review the rest of the module. I did not run the browser. The browser rows are C's, and I'm relying on the passing verify log and `c-round-374.json`.

### Critical Issues
- None.
- Auth, purchase and download code is untouched. The 8 paths are all in `arrangement/`, `ArrangementContext`, tests and one doc. I saw no `any`, `@ts-ignore` or type assertions, and no `dangerouslySetInnerHTML`.

### Findings, ranked
1. **Low, `ArrangementExportDialog.tsx:84-186` (dead branches).** `ArrangementExportDialogContent` is only ever rendered with `isOpen` true, so the `if (!isOpen)` branches are dead. This includes the effect at lines 163-168 that resets `scopeChoice` and `exportFormat`.
   - The doc already records this as B-R373-EXPORT-CONTENT-DEAD-ISOPEN.
   - Fix: in a later round, drop the `isOpen` prop from Content and delete the dead effect. Reset now happens through unmount. Keep this out of the current commit.
2. **Low, `ArrangementMaster.tsx:199-203` and `render-budget.test.tsx` RB-LEAF1 (coverage gap).** If someone swaps `<ArrangementMasterView>` back to `<ArrangementMaster />` in `StudioWorkspace`, RB-LEAF1 stays green. The wrapper's child is memoized, so the test can't see the regression. The doc accepts this and says the perf spec's PERF-INTERACT row catches it.
   - Fix: optionally add `ArrangementMaster` to the render log and assert it renders 0 times on a lane commit.
3. **Low, `ArrangementExportDialog.tsx:155-160` (focus ordering).** Focus now returns to the opener in the layout-effect cleanup, before the portal DOM is removed. Before, the DOM went first. I found no `blur` or `focusout` listeners in this code, and Modal's `useScrollLock` still restores `body` on unmount. The doc lists these differences as accepted.
   - Fix: none needed. Real-browser focus return after Esc, the Close button and a backdrop click is covered by C's browser rows. I'm relying on those rows and did not run them.

### Things I checked
- **Listener and timer leaks:** none added. The pointer listeners in `beginMasterGainGesture` are unchanged. The Export dialog's keydown and focusin listeners now exist only while it is mounted, and each has a cleanup, so there is less to leak.
- **Event ordering and gestures:** `handleClose` still refuses while an export is rendering, so Esc and backdrop clicks can't unmount Content mid-render. `setIsExportOpen(false)` is called only from `closeExportDialog`, and `onOpenExport` only sets true. No other code path can close the dialog behind the `isRendering` guard.
- **Stable memo inputs:** the 9 Master callbacks come from `useCallback` and ref-based dependencies (`historyRef`, `gestureCountRef`, `masterGestureRef`). RB-LEAF1 shows empirically that `masterActions` doesn't change identity on a lane commit or zoom. A Master mute re-renders the strip once, with `aria-pressed` updated.
- **`master` prop:** `arrangement.master` in `StudioWorkspace` is the same object as `workspace.master` in the wrapper.
- **Hook error names:** the helpers take `hookName`, and the public hooks stay zero-argument. L8e and L8f cover all 10 wrappers and a direct store-hook call.
- **Accessibility, Tailwind and tokens:** no markup or class changes. Only the render boundaries moved.
- **S5b-same-act:** this adds a test only, with no production change.

### Good Practices Found
- The `XInner` plus `memo` pattern lets the render log see components by name.
- The shell/content split is documented with equivalence reasoning.
- Mutants were run against the new tests, and the implementation doc is thorough.
- The public `useArrangement()` shape and the `ArrangementMaster` signature are unchanged.

### Architecture note
- **Signal 2 (ownership and coupling):** `StudioWorkspace.tsx:1031` and `ArrangementMaster.tsx:60-98`. `StudioWorkspace` now builds the Master actions object through a hook exported from a component file. The leaves are being fed by `Pick`-ed props taken from the monolithic `ArrangementContextValue`. This is the plumbing the doc defers to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (D-29z1238).
  - **Keep for this commit:** it's cohesive, low cost, and it works with the existing tests.
  - **Proposal for the planner:** if PERF-11c-iii-b to -e repeat this per leaf, schedule one bounded task. It would introduce a stable actions context, or move the `use*Actions` hooks next to the provider. The criteria would be the `useArrangement()` shape unchanged, the render-budget rows unchanged, and no change to gesture or Undo behaviour.
- **Signal 4 (lifecycle):** none. Export state still lives in the provider, and Content only owns UI state.

### Alternative Approach
This isn't auth, checkout or the audio pipeline, but it does touch the gesture and export UI.
- **Current:** memo view with `Pick` props, a thin wrapper, and a shell that mounts Content only while open.
- **Alternative:** split the provider into stable actions and data contexts so the leaves need no prop plumbing.
- **Verdict:** keep the current approach. The alternative is the larger architectural change already queued as D-29z1238. It would change the public hook shape and has more regression risk for a 6-component saving per commit.

### Score: 9/10