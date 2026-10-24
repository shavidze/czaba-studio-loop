Review is done and the verdict is ready; writing it up now.

COMMIT: OK — the diff only moves Export copy into `strings.ts` and switches it to English. It doesn't change behaviour, and it doesn't touch auth, purchase or download code.

## Code Review: Studio V‑0.1 — Export strings (round 128)

Checked against HEAD `608187f`, all 27 paths in `paths.txt`, the full `diff.patch` and the 3 new files. `verify.log` shows 158 test files and 2412 tests passing, and both builds succeed. This is a review of the diff only, not of the whole modules.

### Critical Issues
- None.
  - No auth, purchase or protected‑download code is touched. The download code in `ArrangementContext.tsx` (anchor, `revokeObjectURL` timer, file names) is unchanged; only the message text around it changed.
  - No elements, ids, `aria-*`, `data-testid`, classes, disabled rules, effects, listeners or timers are added or changed in `ArrangementExportDialog.tsx`.
  - `root.tsx:44` already has `lang="en"`, so screen readers will pronounce the English copy correctly.

### Suggestions (ranked)
1. **Medium (UX, browser): mixed languages until V‑0.2.** The Export dialog is now English, but other Context messages, such as `CUT_TIME_NEEDS_RANGE_MESSAGE` (`ArrangementContext.tsx:~202`), are still Georgian. `source.audioNote` still shows Georgian inside an English list item (`ArrangementExportDialog.tsx:65`). The implementation doc lists both as V‑0.2. Fix: C should check EX‑COPY in a real browser with a video that has no audio, and V‑0.2 should be scheduled next so a half‑translated Studio doesn't ship.
2. **Low (UX copy): "Done" after an error or cancel.** After an error or a cancelled export, the footer still says `Done` (`ArrangementExportDialog.tsx:~566`). It reads a little oddly, but it's a sound choice given the duplicate "Close" accessible names. Keep it unless C reports confusion; a label that changes by phase would break the name‑stability tests (HE8, FT3).
3. **Low (tests): many assertions now compare the code with itself.** Most UI tests compare against `studioExportStrings.*`, so a wrong English string would only be caught by ST1/ST2 (`strings.test.ts:109–248`). The doc accepts this. Make sure ST1/ST2 stay the only place with literal strings and are never relaxed.
4. **Low (test fragility):**
   - `export-dialog-a11y-copy.test.tsx:681–689` builds `NAME_LEAK` by splitting copy (`split(' — ')[1]`). If `noUncheckedIndexedAccess` is ever turned on this won't compile, and a copy edit silently changes what the test checks. Fix: use fixed fragments (`'either both'`, `'Video is not'`, `'Make a time'`).
   - The same splitting appears in `master.test.ts:2143–2152` and `export-dialog-footer.test.tsx:1156`. Fix: assert with `toContain`/`toMatch` on the exact formatter output.
5. **Nit:**
   - Several constants are now just aliases: `MP3_FORMAT_NOTE`, `BOTH_FORMAT_NOTE` and others in the dialog (`:36–52`), and `MASTER_MUTED_EXPORT_SUFFIX` (`ArrangementContext.tsx:295`). They're harmless; inline them when V‑0.2 next touches these files.
   - `exportFailed('')` leaves a trailing space. That was already true before this change; trimming it in V‑0.2 is optional.

### Areas checked with no problems
- **Event ordering, focus and leaks:** focus and Tab handling are untouched, and no listeners or timers were added. `encoderLoadTimeout(ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS / 1000)` gives the same 120 s as the timer.
- **Render cost:** neutral. The formatters are cheap pure string functions and add no state or memo dependencies.
- **Accessibility:** HE8 confirms that every dialog button name is unique, both idle and during a render. Changing the visible text instead of adding an `aria-label` keeps the visible label and the accessible name the same (WCAG 2.5.3).
- **Tailwind and design tokens:** no class changes.
- **Strict TypeScript:** no `any`, no `@ts-ignore`, no type assertions. The `StudioTimeSpanText` interface is typed. Semicolons are present.

### Good Practices Found
- `strings.ts` imports nothing, so `graph.client.ts` and `export-wav.client.ts` can use it without import cycles.
- The existing exported constants keep their names, so other code that imports them doesn't change.
- The stall and timeout seconds are computed from the timeout constants, so the message and the timer can't drift apart.
- ST3/ST4 check that no Georgian characters remain in the Export source files.
- The duplicate "Close" decision is written up with the rejected options and the frozen `Modal.tsx`.

### Architecture note
- **Signal 2 (ownership/coupling):**
  - **Where:** `strings.ts` is now imported by the dialog component, the Context and four `lib/` files.
  - **Assessment:** this dependency points only one way and adds no state or lifecycle. Keep it as is: the dependency direction is right and nothing needs to be split out.
  - **Proposal for the planner:** when V‑0.2 lands, decide whether the key/namespace layout is `studioExportStrings` / `studioArrangementStrings` per feature or one `studioStrings` object. Acceptance: no key collisions, and ST‑style literal tests for each namespace. This is a proposal only; it doesn't need fixing this round.
- **Existing signal `ARCH-R127-MODAL-CLOSE-LABEL`:** still deferred, because the frozen `Modal.tsx:123` is shared with the auth modal. Pass it to root, not to the implementer.

### Alternative Approach
- **Current:** a flat object of constants plus pure formatters, single language.
- **Alternative:** an i18n library (e.g. i18next) with a locale switch.
- **Verdict:** keep the current approach. There is only one language (R1), so the flat object adds no bundle weight and stays fully typed. An i18n runtime would bring ICU parsing and async loading without solving any real need. Revisit only if a second locale is approved.

### Score: 8.5/10