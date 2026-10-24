COMMIT: OK

Nothing here blocks the commit. The change only moves marker text into `strings.ts`: no handler, condition, key, focus path, history label, timer, listener or class changed. Auth, purchase and download code are not touched. verify.log shows 161 test files and 2450 tests passing, a clean typecheck, a successful build, and lint with only older warnings in files outside this diff. `c-round-136.json` reports PASS with browserVerified true.

## Code Review: V-0.3c marker strings (round 136)

### Critical Issues
- None.

### Findings (most important first)
1. **Low — doc 112 will be committed with an out-of-date status.** Lines 4, 115 and 119 of `docs/implementation/2026/quarter-IV/112-studio-v0-marker-strings.md` still say the browser check is waiting for C round 136. C has already passed it. This is the same lag doc 111 had, which this round fixes.
   **Fix:** before committing, change line 4 to `Completed (…; C round 136 — PASS, browserVerified; gate 136 — <sha>)`. Change line 115 to cite `c-round-136.json`. Delete the C-round TODO on line 119. If you don't fix it now, it becomes a GATE136-DOC112-STATUS item for next round.
2. **Low — two local aliases now just point at the string module.** In `ArrangementMarkerRow.tsx:54-55`, `MARKER_FLAG_HINT` and `MARKER_AT_TIME_START_MESSAGE` simply re-export values from `studioMarkerStrings`. The doc says keeping them was deliberate, to keep the diff small, and they cost nothing. I'd keep them for now and inline them later when `strings.ts` is split. This needs no action.
3. **Note — the left-over Georgian `renameEmpty` text belongs to the next round.** The group-rename status at `StudioWorkspace.tsx:954` and `:964` is still Georgian with `«»` quotes. That file is outside this round's scope and is listed for V-0.3d (decision R4). When V-0.3d does it, it should reuse the exact `The name is empty — “{name}” is kept` wording so the marker and group messages don't drift apart.

### Things tests can't catch
- **Event order and leaks:** nothing changed. The repeat-key check `status !== message` still compares two plain strings built the same way, so a held key still announces a refusal only once.
- **Render cost:** the plain strings are fixed values. The formatter functions are module-level and build a short string per render, just as the old template literals did. No new objects end up in dependency arrays.
- **Accessibility:** the `aria-label`s on the header buttons were already English and are unchanged. The `title`s now match them, including the `Ctrl+←/→` hints and `aria-keyshortcuts`. The flag `title` keeps its `\n` and the hint is still added by the calling code. Screen readers will read the curly quotes “” the same way as the old «».
- **TypeScript strict:** no `any`, no type assertions, no suppression comments. `StudioMarkerTimeText` is a local interface and every formatter declares its return type. `strings.ts` still imports nothing, so no import cycle.
- **Tailwind:** no class or style changes.
- **Security:** marker names reach `title`, `aria-label` and the status text only through React attributes and text, which React escapes. No `dangerouslySetInnerHTML`.

### Good Practices Found
- ST28 and ST29 check that the set of keys matches exactly, so adding a string without a test fails.
- ST30 checks both component sources for any Georgian character or `«»`. This is a real regression guard.
- Mutations m38–m44 show that the negative `not.toContain` checks still fail when the text is wrong.
- `marker-strings-ui.test.tsx` tests the real `StudioWorkspace`, not a stand-in, and it covers both ways of opening the menu (right-click and Shift+F10).

### Architecture note
- **Signal 3 (one region changed repeatedly), at `app/lib/arrangement/strings.ts:528`:** this is the third string object added in three consecutive rounds (V-0.3a/b/c), and the file keeps growing. **Keep for now:** it imports nothing, and V-0.3d (StudioWorkspace plus `waveform-zoom.ts`) is the last planned addition. **Proposal for the planner, run after V-0.3d:** split `strings.ts` into one file per area under `app/lib/arrangement/strings/` with an `index.ts` barrel that keeps the `~/lib/arrangement/strings` import path.
  - Acceptance: strings.test ST1–ST30 pass unchanged, and no consumer has to change its import.
  - Owner: `frontend-architect` checkpoint, then A.
  - This is a proposal, not approved scope.
- No other signals. No state, effect or ownership moved between files.

### Alternative Approach
Not needed: this is text, not auth, checkout or audio logic.

### Score: 9/10