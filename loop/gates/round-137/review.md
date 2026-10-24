COMMIT: OK

## Code Review: Studio V-0.3d — the rest of StudioWorkspace and waveform-zoom in English (round 137)

Inputs I checked: `diff.patch`, both untracked files (`workspace-strings-ui.test.tsx` and doc 113), `verify.log` (162 test files passed, typecheck clean, build OK) and `c-round-137.md` (PASS, browserVerified, 0 bugs). This reviews the diff only, not the whole module.

### Critical Issues
- None.
- **Protected areas:** No auth, purchase, download or protected-file code is touched. That holds for `paths.txt`, and C's SOURCE-SCOPE row reports an empty protected diff against `7d9fed0`.

### Suggestions (ranked; none blocks this commit)
1. **Low — the selected-clip line is only half moved to the strings module.** `StudioWorkspace.tsx:2566-2579`
   - The `title` comes from `studioWorkspaceStrings.selectedClipTitle(...)`.
   - The visible text still has `· start{' '}`, `· length{' '}` and `· source offset{' '}` written inline in the JSX.
   - If someone changes the formatter later, `title` and `textContent` will quietly stop matching. Only one fixture would catch it (`track-layout.test.tsx:862-622`, the title === textContent check).
   - **Fix:** add a `selectedClipDetail({ start, length, offset })` piece to `studioWorkspaceStrings` and build both the title and the visible tail from it.
   - The `selectedTitle ?? selectedClip.sourceId` fallback on l.2567 is not a problem. `selectedTitle` already falls back to `sourceId` (l.2116-2120), and the existing `detailSelection` uses the same pattern (l.2128). The fallback is only there to satisfy the types and cannot actually run, and it avoids a type assertion.
2. **Low — a pure strings test now imports the whole workspace component.** `strings.test.ts` (diff l.273-276)
   - It imports `VIDEO_RETURNED_*` from `StudioWorkspace` only for ST32. That pulls the heaviest component's imports into a `.ts` unit test.
   - **Fix:** check the values through `studioVideoStrings.returnedCompact` and `returnedLibraryRecollapsed`. Alternatively, move the alias check into `workspace-strings-ui.test.tsx`, which already mounts the component.
3. **Low — ST33's title and doc 113 point at "l.325".** The selector is actually on `StudioWorkspace.tsx:331`.
   - The assertion compares content, so it still works.
   - **Fix:** rename it to "the track-header selector", in the test title and in doc 113's §მიდგომა and TODO.
4. **Low — doc 113's status is out of date.** `docs/implementation/2026/quarter-IV/113-studio-v0-workspace-strings.md:4`
   - It says "In Progress … ბრაუზერის შემოწმება C-ის რაუნდ 137-ს ელოდება" (still waiting for C's round 137), but `c-round-137.json` is PASS.
   - **Fix:** change it to `Completed (C round 137 — PASS, browserVerified)` and drop the C-137 TODO line. It's cheap to do now rather than one round late, as happened with doc 112.
5. **Info — mixed Georgian and English is visible on screen.** The footer says `all tracks`, while the lane overlay still says `ყველა ხაზი`. There is also `ArrangementClip.tsx:701` (Undo label `გადატანა ხაზზე — …`), `ArrangementClipEnvelope.tsx:171` and `ArrangementGroupHeader.tsx`. This is the accepted mixed state (R4), already assigned to V-0.4 and V-0.5 in C's notes.

### Things I checked that tests can't fully cover
- **Browser event order, listener and timer leaks:** No new state, effect, ref, listener or timer was added. All handlers are unchanged and only the string sources moved. C checked the lane-move Shift hint, video expand/return and the envelope toggle in real Chromium.
- **Render cost:** The new formatters are inline template strings computed during render, so `useMemo` isn't needed. `useCallback` dependency arrays didn't change.
- **Accessibility:**
  - The Waveform Zoom `aria-label` keeps its meaning and has no percentage.
  - The `title` on the Env button still includes `(A)`, which matches `aria-keyshortcuts`.
  - `clipsSelected` is always plural, which is correct because it only renders when `length > 1`.
  - The h1 reads `CZABA Studio Lab · Workspace`.
- **Tailwind and tokens:** No class changed. C saw no layout box move more than 1 px at 1440 or 1280.
- **TypeScript strict:**
  - No `any`, no suppression comments and no type assertions.
  - The local interfaces (`StudioWorkspaceRangeText` and `StudioWorkspaceClipText`) are typed correctly.
  - All lines end with semicolons.
- **Module direction:** `waveform-zoom.ts` now imports `./strings`. `strings.ts` has no imports, so there is no cycle.
- **Security:** All text is rendered through React's normal escaping, and there is no `dangerouslySetInnerHTML`. The group name (user input) goes through `“${name}”` into status text, which is safe.

### Good Practices Found
- Removing the ST25 checklist of remaining Georgian lines made the check stricter: ST33 now allows exactly one line, and the guillemet (`«»`) check covers the whole file.
- `renameEmpty` produces the same text as the marker version, and a test checks they match, including a Georgian name.
- WSU1 drives a real lane drag in the mounted workspace, including Shift lock and release, rather than only comparing strings.
- Existing exports keep their names and signatures (`VIDEO_*_MESSAGE` and `waveformZoomStatus(level)`).

### Architecture note
- **Signal 3 — the same region gets an expensive change every round.** `strings.test.ts` (the expected maps and ST25/ST33) plus 7 pin files get rewritten in every V-0 round.
  - **Keep.** This is the intended step-by-step migration, and it ends when V-0.5 does.
  - **Proposal for the planner:** fold the test-to-component dependency (Suggestion 2) into the `strings.ts` split checkpoint already queued for root (`b-round-136-checkpoint-request.md`), rather than opening a new task.
- **Signal 2 — coupling:** `waveform-zoom.ts` depends on `strings.ts`. That's a library module depending on a module with no imports. **Keep**; no risk.
- Signals 1 and 4: none.

### Alternative Approach
- Not applicable. This diff moves display text only; it doesn't touch auth, checkout or the audio pipeline. C's measurement showed the Waveform Zoom change is view-only: about 0.07 dB peak difference at most.

### Score: 9/10