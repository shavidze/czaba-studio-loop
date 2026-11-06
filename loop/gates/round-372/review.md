COMMIT: OK

This is a test-only change. I read the full diff, the untracked doc, and the grep results from `verify.log`. I did not re-run the suite.

**Scope check**
- The 18 paths are 16 test files, `helpers/workspace-probe.ts` and the new doc 239.
- No app code, auth, purchase or download code is touched.
- No `any`, suppression directives or type assertions were added.
- The three fields the helper reads (`status`, `statusSequence`, `statusKey`) exist on `ArrangementContextValue` at `app/contexts/ArrangementContext.tsx:325-327`. At HEAD the helper reads them from `useArrangement()`, so behaviour is unchanged.
- `verify.log` shows green output for the visible lines I grepped, including the `render-budget` and `context-hygiene`-area suites.

**Findings, ranked**

1. **Low – `workspace-probe.ts:391-393`.** `useWorkspaceStatusProbe` calls `useArrangement()` twice per component, once directly and once inside `useWorkspaceStatus()`.
   - It is the same context, so it adds no subscription, listener, timer or extra render.
   - The doc says `range-store.test.tsx` RS4 still passes.
   - Fix: none now. In round 373, `useWorkspaceStatus` becomes a separate subscription. Re-check RS4 and the PV1–PV4 render counts then, because the spread will stop being free.

2. **Low – `workspace-probe.ts:391-393`.** The spread order is `{...useArrangement(), ...useWorkspaceStatus()}`.
   - The status fields are overridden last, which is correct for round 373.
   - Fix: none. Keep this order so the store-backed values win.

3. **Info – `gesture-guard.test.tsx:12-14`.** The `type LaneDragProbeValue` alias sits above the remaining `import` statements. This was already the case before the change; the diff only edits the alias.
   - Fix: optional. Move the alias below the imports the next time the file is touched.

4. **Info – `docs/implementation/.../239-perf-status-probe-migration.md`.** It follows the template sections.
   - Its "36 files" and "241 errors" claims for removing the fields can't be re-derived from the diff, but they are plausible.
   - Fix: none.

**Not applicable to this diff:** real-browser event ordering, accessibility and Tailwind/tokens (no UI or CSS touched), and listener or timer leaks (no new listeners or effects). About 61 other test files still call `useArrangement()` directly. They don't read status, so removing the fields won't break them.

**Architecture note**
- Signal: `helpers/workspace-probe.ts:386-393` → keep. The change adds one seam, `useWorkspaceStatus`, so the planned status-store move in round 373 changes a single function body in the tests. That is cohesive and low-cost.
- Risk to watch: two status paths (context and store) will exist briefly during 11c-ii-b. Proposal for the planner: in that task, require RS4, PV1–PV4 and `fader-pointer-preview` parent-render counts to hold or decrease. Also make the helper subscribe to the committed entry only, with equality on text, sequence and key.
- This is a review of the diff only; I did not audit the whole module.

**Alternative approach**
- Current: one status helper, with the behaviour change in a separate round.
- Alternative: do the store migration and the test migration in one round.
- Verdict: the current split is better. A red test can be blamed on either the migration or the behaviour change, but not both, and the compiler checks that the migration is complete.

**Score: 9/10**