# A round 264: L46-CONTRACT-CHECKS (Meta shortcut handler rows)

**STOP conditions (L11): none hit.**
- No row needed a change outside the two granted new files.
- Every Meta half is green on unmodified code. No product bug was found.
- M1 turns every Meta half red.
- `sha256sum -c` was rc 0 before and after.
- No covering test is above 50 % of its timeout (see Timing).

## Changed files (only the 2 granted new files)
- `app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx` (new, 11 tests)
- `docs/implementation/2026/quarter-IV/197-l46-meta-shortcut-contract.md` (new). l.4 = `**სტატუსი:** Completed (C round 264 PASS)` (L28, the same form as doc 195). The `## ` headings are TEMPLATE's seven, in order (L26). The doc cites only MS1–MS6.

No app byte changed. No existing test changed.

## Rows (id → what is asserted)
MS1–MS5 use `it.each(HALVES)`, so each runs twice:
- **Ctrl half:** `ctrlKey: true, metaKey: false`.
- **Meta half:** `ctrlKey: false, metaKey: true`.

Keys are dispatched on `document.body`, and each half gets a fresh mount. The scaffolding is copied from `overview-visibility-ui.test.tsx`; nothing is imported from another test file. Each row asserts the effect first. The `dispatchEvent` return (not prevented) is stored and checked only after the effect.

| Row | Setup | Asserted |
|---|---|---|
| MS1 Z | `addSourceToActiveTrack('song')` → 1 clip | clips 1 → 0; `undoLabel` null; Undo `title` = `undoTitle(null)`; Redo `title` = `redoTitle(addLabel)`; prevented |
| MS2 Shift+Z | add, then `undo()` via the API (so M1 pins the Shift+Z step itself) | clips 0 → 1; `undoLabel` = addLabel; Undo/Redo `title` restored/cleared; prevented |
| MS3 Y | add, then `undo()` | clips 0 → 1; `redoLabel` null; Undo `title` = `undoTitle(addLabel)`; prevented |
| MS4 E | add, `selectClip`, `setInsertMarker(start+5)` | clips 1 → 2; starts `[0, 5]`; status `splitDone('00:05.000')` ("Clip split at 00:05.000."); prevented |
| MS5 L, L | add, `setTimeRange({2.5, 7.5, music})`; Loop button = the only button with `aria-keyshortcuts="Control+L Meta+L"` | `aria-pressed` false → true, loop `{2.5, 7.5, enabled:true}`, status "Loop created and turned on: 00:02.500 — 00:07.500."; the second L gives `aria-pressed` false, loop `enabled:false`, status "Loop is off; the range is kept."; both prevented |
| MS6 Alt only | the MS4 and MS5 state together (selected clip, marker 5 s, range) | for each of Z, E, L with `altKey` only: clip count 1, `undoLabel` unchanged, loop null, `aria-pressed` false, status unchanged, not prevented |

There are no class selectors (L12). Elements are found by role and name, `data-testid="arrangement-status"`, and the `aria-keyshortcuts` attribute.

## Red-proofs (L23, L52)
The scratch copy is `/home/runner/czaba-project/tmp/a264-scratch`: an rsync of `store/` without `node_modules`, `build`, `test-results` and `.git`, with `node_modules` symlinked. It was left in place, outside `store/`. Each run executed the new file only: `npx vitest run app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx`.

- **Control** (unmodified copy, `StudioWorkspace.tsx` diff-identical to store): 11/11 green.
- **M1:** `StudioWorkspace.tsx` l.2232 `const modifier = event.ctrlKey || event.metaKey;` → `const modifier = event.ctrlKey;`. Result: **5 failed, 6 passed**. All five Ctrl halves and MS6 are green. Every Meta half fails on an effect line:
  - MS1 Meta: `meta-shortcuts-ui.test.tsx:219` (clip count expected 0, got 1);
  - MS2 Meta: `:233` (the Shift+Z step: expected 1, got 0);
  - MS3 Meta: `:248` (expected 1, got 0);
  - MS4 Meta: `:266` (expected 2, got 1);
  - MS5 Meta: `:284` (`aria-pressed` expected "true", got "false").
- **M2:** in the `key === 'y'` branch, l.2325 `current.redo();` deleted. Result: **2 failed, 9 passed**. MS3 Ctrl and MS3 Meta are both red at `:248` (expected 1, got 0). MS2 stays green as expected, because it uses the z branch.
- After the mutants, the scratch file was restored and is diff-identical to store.

After the advisor review, MS2's setup undo was changed from a keyboard Z to `undo()` via the API, and control, M1 and M2 were re-run on the final file. An earlier draft also put `expect(press(...)).toBe(false)` before the effect, so M1 went red first on the `defaultPrevented` line. The rows were reordered so the first red line is the effect. The numbers above are from the final file.

## Commands (from `store/`)
- `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-263-r264-tree-sha256.txt`: **rc 0 before** (at start) and **rc 0 after** (final).
- `git status --short --untracked-files=all` (final): exactly `?? app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx` and `?? docs/implementation/2026/quarter-IV/197-l46-meta-shortcut-contract.md`. HEAD `28c4f83bf3a9c59606ee141032ee4f267137dfc2`.
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0 (205 pre-existing warnings; the summary truncates the list, so the per-file proof is the direct Biome check below).
- `npx biome check app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx`: clean. The first run flagged formatting only (`it.each` wrapping). `biome check --write` on that one file fixed it, and the re-run says "No fixes applied".
- `npx vitest run app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx app/lib/arrangement/__tests__/insert-marker-ui.test.tsx`: **3/3 files, 47/47 tests passed** (11 + 7 + 29), final file.
- Doc 197 `grep -n '^## '`: 7 headings in TEMPLATE order (l.7, 13, 22, 38, 43, 48, 66). `grep -c "'MS[1-6] "` on the test file = 6.

## Timing (L11, L31)
- The new file has no declared timeout. The vitest default is 5000 ms; `vitest.config.ts` sets no `testTimeout`.
- The slowest new test is MS1 Ctrl: **1202–1301 ms** in the 3-file runs (≤ 26 %) and 712–741 ms when the file runs alone. That is below 50 %.
- The file total is 4560–4639 ms in the 3-file run, spread over 11 tests.
- Neighbour files: `insert-marker-ui.test.tsx` took 5259 ms in the 3-file run (gate 263 `verify.log`: 5012 ms) with a describe timeout of 15 000 ms. These are file totals, not per test, and that file is unchanged.

## Not run (speed rules / task §2.4)
The full suite, `npm run verify`, build and e2e are not run; they are gate rows. No code-reviewer was run: 2 files is below the 3-file rule, and the task says so explicitly. No browser was used: A has no browser rows this round.

## Template note
`.claude/prompts/new-test.md` is a service-test template, so it does not fit a UI handler test. The file follows the `app/lib/arrangement/__tests__` conventions instead (row id in the name, a fresh mount per test). Both primitives were read: TESTING_QUALITY_GATES and BUG_HUNTING_TESTS. The rows assert intended behaviour and were shown red under the mutants.

## Known gaps
- This is jsdom only. A Linux Chromium event with `metaKey` is C's CC-META.
- The real macOS Cmd, Windows AltGr, VoiceOver/NVDA and Safari stay with Saba (platform half). None of them is claimed here.
- GATE244-S4 is not touched. It stays `deferred_low_polish`, and A has no `StudioWorkspace.tsx` grant.

## Next C checks (task §3)
SOURCE-SCOPE, MS-REVIEW, TESTS-TARGETED, MUTANTS (re-run M1/M2 on C's own scratch), CC-META-1440/-1280, CC-ALTGR-1440/-1280, CC-SR-ORDER-1440/-1280, CC-CTRLCLICK-1440/-1280 (observe and record), G264-AUTH. C should also check doc 197: l.4 byte for byte, the headings subsequence, and that it cites only MS1–MS6.

## Scope completed (A's part only)
§2 items 1–6 are done. B's C acceptance rows are not self-marked; C verifies them.
