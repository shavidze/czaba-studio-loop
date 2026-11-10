COMMIT: OK

I read the diff, the new doc and the shared helper, and I did not run anything. I did not open the browser probe files that doc 276 cites (`tmp/studio-real-loop/b-round-427/probe/*`), so I haven't checked those Chromium results myself. `verify.log` is the only gate output I read, and I only saw its first lines, so I'm relying on your note that verify passed.

The commit adds `onKeyDown={preventRepeatedEnterKeyDown}` to six buttons:
- the footer Shortcuts button in `StudioWorkspace`
- the sheet Close in `ArrangementShortcutSheet`
- Send link in `StudioNarrowScreen`
- Cancel, Export and Done in `ArrangementExportDialog`

Done's old inline Enter-repeat check is replaced by the shared helper, which has the same logic. Nothing touches auth, purchase or download code. The `StudioWorkspace` import of the helper already exists at `StudioWorkspace.tsx:218`, so that hunk compiles.

**Findings, ranked (none blocking)**

1. **Low – the HQ1 `value === ''` assert almost never fails** (`shortcut-sheet-ui.test.tsx`, HQ1, `expect(sheetSearch(view).value).toBe('')`). Enter doesn't type into an input, so only an app-side query change would trip it. The doc already admits this. The `toBe(true)` per repeat and the `aria-expanded` check carry the real weight. Fix: leave it, or drop it later.
2. **Low – `pressHeldEnter` is copied into three test files** (`export-cancel-ui.test.tsx:103`, `shortcut-sheet-ui.test.tsx:184`, `studio-narrow-gate-ui.test.tsx:245`). The three copies can drift apart. Fix: move it to a shared test util in stage 5.
3. **Low – HX1 and HX2 are preventive, not proven to fail on HEAD.** The doc says Chromium showed no defect on HEAD for Export and Cancel. The mutants do turn them red in jsdom. This is acceptable as a consistency rule, not a bug fix.
4. **Info – search field and Send link repeat behaviour.**
   - The sheet search field is deliberately unguarded. Enter does nothing there, and HQ1 records that.
   - Send link keeps focus on itself after a press, so the guard is required there, and HN1 covers it.
   - Event ordering: `keydown` is prevented before the browser synthesises the click, which is the right place. Space activates on `keyup` and is unaffected.

**Other checks**
- **Leaks, render cost, Tailwind, TS strict:**
  - The change adds no listeners, timers or effects.
  - It adds no per-render allocations, because it passes a module-level function reference.
  - It adds no CSS and no `any` or assertions.
- **Accessibility:** unchanged. Labels, `aria-expanded` and focus targets stay the same, and a single Enter, Space or click behaves as on HEAD.

**Architecture note**
- Signal (repeated costly change to one region): `studio-repeat-safe.ts` and its call sites across `app/components/arrangement/*`. SYS-2 has now taken four rounds (422, 426, 427, 428), each hand-adding the same `onKeyDown` to individual buttons.
- Keep it: the shared helper is the right unit and its public shape is stable. An automatic wrapper for every `<button>` would risk the audio, gesture and Undo/Redo invariants for no gain.
- Proposal for the planner (one bounded task, folded into stage 5): add a grep-based test that finds `type="button"` with `onClick` but no Enter guard, with an explicit allowlist. Add a shared `pressHeldEnter` test util. That would stop the per-round manual sweep from recurring. The cost is low.
- This note covers only the diff, not a full module audit.