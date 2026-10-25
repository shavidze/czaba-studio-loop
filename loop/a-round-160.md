# A round 160: V-3b, the 7 remaining transport glyphs become lucide icons (D-29z125)

Implementer: A · Date: 2026-10-25 · Task: `current-task.md` · Evidence: `a-round-160/`

## Start checks (all OK)
- HEAD = `ad0df770e7fec74c6feb236a8ab59a738f12c79a`. `git status --short` was empty, and `git ls-files -co --exclude-standard` listed 978 files.
- The frozen 969 matched (`sha256sum -c --quiet`). All 9 granted start hashes matched.
- Dev server on 5173 was already running (`/studio-lab` HTTP 200). A did not start or stop any server.

## Changed files (9 grants + new doc 129)
| ID | File | Change |
|---|---|---|
| I0 | `ArrangementTransport.tsx` | The import is `ArrowLeftToLine, Delete, MoveHorizontal, Pause, Play, Redo2, Repeat, Scissors, Undo2`; Biome wraps it multi-line and accepts the order. |
| I1 | same | Back to start: `↤` → `<ArrowLeftToLine className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />`. |
| I2 | same | Undo/Redo: the glyph span → `Undo2` / `Redo2` (`size-3 shrink-0`, stroke 2, aria-hidden). The truncate label, `w-28`, refs and handlers are unchanged. |
| I3 | same | Split: `cn(toolButtonClass, 'gap-0.75')`, plus `Scissors` (size-3, 2) and `<span>Split</span>`. |
| I4 | same | Delete: `cn(toolButtonClass, 'gap-0.5', range && 'border-accent text-accent')`, plus `Delete` (size-5, 1.2) and `<span>{studioEditStrings.deleteButton}</span>`. |
| I5 | same | Loop: `cn(toolButtonClass, 'gap-0.75', loop?.enabled && '…unchanged…')`, plus `Repeat` (size-3, 2) and `<span>Loop</span>`. |
| I6 | same | Zoom back: `cn(toolButtonClass, 'gap-0.5 px-2 text-xs')`, plus `Undo2` (size-2.5, 2.4) and `<span>Zoom</span>`. |
| S1 | `strings.ts` | Only `deleteClipLabel`, `deleteButton` and `braceHint` changed (R9). l.157 `⌫ Deleted …` is untouched. |
| N2 | `strings.test.ts` | l.418–419 and l.686 follow S1. l.517–522 are untouched. |
| N3 | `transport-surface-ui.test.tsx` | TS5 uses `byText('Loop')`. TS6 is the new V-3b lock (spec list below). The import adds `studioPlaybackStrings`, for the Back to start `aria-label`. TS1–TS4 are unchanged and none of them used a glyph. |
| N4 | `self-disabling-focus.test.tsx` | Prefixes are now `'Undo'`/`'Redo'`/`'Delete'`. FL5/FL6/FL9/FL10 titles lose their glyphs ("Delete", "Zoom back"). No assertion changed. |
| N5 | `navigation-strings-ui.test.tsx` | Prefixes are now `'Split'`/`'Delete'`/`'Loop'`. The expected values at l.226/228/278/361 follow S1. |
| N6 | `grid-snap-ui.test.tsx` | `labels[9]` is `'Zoom'`. |
| N7 | `delete-selection-ui.test.tsx` | The helper uses `getAllByRole('button')` filtered by `textContent === studioEditStrings.deleteButton` and asserts `toHaveLength(1)`. |
| D4 | doc 128 | The three edits only: status `Completed (C round 159 PASS; published ad0df77)`; the l.50 claim replaced by a pointer to the C-R158-01 entry; the "შემდეგ" row shows the 4 `!` tokens and `motion-reduce:transition-none!`. The task said "l.3"; the status is actually l.4, and l.3 is the date. |
| D3 | doc 129 (new) | In Georgian, per TEMPLATE. It covers R2' with the probe table, R8–R11, the before/after table, Problem → Solution, tests and mutations, and TODO. Status: `In Progress (awaiting C round 160)`. |

**TS6 asserts:**
- Each of the 7 buttons has exactly 1 svg, which is `aria-hidden="true"`.
- Each icon has its lucide class (`lucide-arrow-left-to-line`, `lucide-undo-2` ×2, `lucide-redo-2`, `lucide-scissors`, `lucide-delete`, `lucide-repeat`), its `size-*` token, `shrink-0` and its `stroke-width` attribute.
- `textContent` is exactly `''`/`Undo`/`Redo`/`Split`/`Delete`/`Loop`/`Zoom`.
- No transport button contains any of `↤↶↷✂⌫↻↩`.
- Split and Loop have `gap-0.75`, Delete and Zoom back have `gap-0.5`, and none of these 4 has `gap-1`. Undo and Redo have `gap-1` and `w-28`.
- Fit and Follow have no svg.

Lucide 0.561 also renders the no-dash alias classes `lucide-undo2` / `lucide-redo2`. TS6 asserts only the dashed names B listed, and both are present.

**`expect(` counts (start → end):**
- strings.test 520 → 520
- transport-surface 42 → 56
- self-disabling 47 → 47
- navigation-strings 65 → 65
- grid-snap 149 → 149
- delete-selection 84 → 85

No assertion was removed. There is no `style=`, hex value, arbitrary `[...]` value or new token.

## Commands and tests actually run
- **Baseline:** the 25 files (`a-round-160/vitest-files.txt` = `b-round-159-r160-vitest-base.txt`): **386/386** (`vitest-baseline.json`).
- **After the edits:** the same 25 files: **386/386**, with TS1–TS6 green (`vitest-after.json`). No new `it` was added.
- `npm run typecheck`: exit 0 (`typecheck.log`).
- `npm run lint`: exit 0. It reports 218 warnings and 1 info, all pre-existing. A full-diagnostic run shows none in the 8 owned files (`lint.log`).
- `npx biome check` (read-only) on the 8 code and test files: "Checked 8 files … No fixes applied". I re-ran it at the end.
- **Tailwind generation** (`tailwind-css-check.json`, `served-app.css`, `served-app-pre.css`; HTTP 200): `allOk: true`.
  - `.gap-0\.75 { gap: calc(var(--spacing) * 0.75) }` is present, with `--spacing: 0.25rem`.
  - `.gap-0\.5`, `.size-2\.5`, `.size-3` (`var(--spacing-3)` = 0.75rem) and `.size-5` (`var(--spacing-5)` = 1.25rem) are all present.
  - `.gap-0\.75`, `.size-3` and `.size-5` were absent before the edits, so this change is what generates them.
  - This proves generation only; layout belongs to C.
- **Mutations** (Edit → transport test file → restore by Edit → sha256 = post-edit `e032ddee…`; `a-round-160/mutations/`, runner `a-round-160/tools/run-mutation.sh`):
  - **m158:** swapped Undo2 ↔ Redo2. TS6 **killed** it, and the restore was verified.
  - **m159:** Delete icon `size-5` → `size-4`. TS6 **killed** it, and the restore was verified.
  - **m160:** removed `aria-hidden="true"` from Scissors. It **SURVIVED** as an equivalent mutant. lucide-react 0.561 adds `aria-hidden="true"` itself when an icon has no a11y prop and no children (`node_modules/lucide-react/dist/esm/Icon.js` l.32–33, confirmed by the reviewer and by `renderToStaticMarkup`). The rendered DOM is identical, so no DOM test can kill it. The task's expectation ("TS6 turns red") was not met, and I am not claiming it was.
  - **m160b** (extra, observable variant): `aria-hidden="false"`. TS6 **killed** it, and the restore was verified.
  - **m161:** removed `gap-0.75` from Split. TS6 **killed** it, and the restore was verified.
- **Not run by A** (speed rules): the full suite, `npm run verify`, the build, e2e and every browser row.

## Code-reviewer (actual subagent, 10 files)
- **Verdict:** 9/10, with no Critical, High or Medium findings. It confirmed:
  - I0–I6 and S1 are exact.
  - No assertion was weakened.
  - The prefix lookups are safe: they are scoped to the transport, and no other button text starts with Undo/Redo/Split/Delete/Loop.
  - The a11y result is good: Delete's name now starts with its visible label.
  - Tailwind-first and TS-strict are respected, and the docs match the code.
- **Info:** the m160 equivalence is confirmed. **For B:** replace m160 with m160b in future mutation lists. Keeping the explicit prop guards against lucide changing its default.
- **Low, for B and not changed (outside N3's scope):** the `describe` title at `transport-surface-ui.test.tsx:207` still reads "V-3a transport surfaces and icons (D-29z123)".
- **Info:** the N7 helper fails loudly if a second workspace button ever has the exact text `Delete`. That is intended, but brittle.
- **Info:** TS6 does not assert that the icon comes before the label; C's screenshots cover that.
- **Info:** the `Delete` import name is easy to misread in grep. An alias is not possible under I0.
- **Architecture note (verbatim, for B/root; not acted on):**
  > - სიგნალი 3 (განმეორებითი ძვირი ცვლილება): /home/runner/czaba-project/store/app/components/arrangement/ArrangementTransport.tsx:157-317 — size/strokeWidth/gap სამეული ახლა ხელით მეორდება შვიდ ღილაკზე, და ეს რეგიონი 158–160 რაუნდებში ყოველ ჯერზე ბრაუზერის გაზომვას და d6-ს საჭიროებს. → keep: glyph-ების მიგრაცია ამ ფაილზე აქ სრულდება; V-3-ის შუაში extraction ტესტების churn-ს მოიტანს ქცევითი სარგებლის გარეშე. ახალი proposal არ არის — ეს აძლიერებს უკვე pending ARCH-R158-TOOL-BUTTON-RECIPE-ს V-3c-მდე frontend-architect checkpoint-ისთვის.

## End checks
- The frozen 969 are OK. HEAD is still `ad0df77`. `git ls-files -co --exclude-standard` lists 979 files (978 + doc 129).
- `git status --short` shows exactly the 9 grants as ` M` and doc 129 as `??`. All 9 grants were needed.
- The protected diff vs `ad0df77` is empty for `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, AuthContext, StudioContext, root, `app/styles/**`, `app/components/icons/**`, StudioWorkspace, ArrangementLoopBrace, studio-lab and doc 127. No changed path matches auth/Modal/Toast/CookieConsent/obsidian.
- `a-round-160/end-sha256.txt` has the 10 paths; the component is `e032ddee…`.
- `a-round-160/diff-vs-start.patch` is against `b-round-159/r160-granted-start/`, with doc 129 as new.
- `a-round-160-result.json` is the harness's session output and is not written by A.

## B acceptance (A's part) actually passed
- I0–I6, S1, N2–N7, D3 and D4 are done within the exact scope.
- The 25-file baseline and post-edit runs are 386/386, and TS1–TS6 are green.
- typecheck, lint and the scoped Biome check are clean.
- The Tailwind generation check is OK.
- m158, m159 and m161 were killed by TS6, with the restore hashes verified.
- A real code-reviewer ran, and its findings are recorded or handed to B.
- The end-state checks are OK.

**Not passed as written:** m160 did not turn TS6 red, because it is equivalent; m160b replaces it. **Not claimed:** every C browser row (ICON-V3B, RV1-V3B, SURFACE-SPOT, FUNC-SMOKE-7, BRACE-HINT, G160-3, PX-NET/REG-HYD).

## Known gaps
- jsdom cannot measure layout. The ±1 px boxes, the rendered icon sizes, computed `stroke` = `color` and the CDP accessible names are C-only.
- TS6 cannot tell an explicit `aria-hidden` from lucide's default (m160).
- Zoom back's accessible name is now just "Zoom", next to the slider "Zoom (px/s)". This is A11Y-R160-ZOOMBACK-NAME, recorded per R11 and not changed.
- The `⌫ Deleted …` status string remains, for V-3c.
- Doc 129 and the test file contain class-like text (`gap-1`, `size-4`) that Tailwind may scan. This is harmless, because only element classes affect the cascade.

## Exact next C checks
1. **T160-TARGETED:** re-run `a-round-160/vitest-files.txt` and expect 386/386 with TS1–TS6 green.
2. **SOURCE-SCOPE:** check the frozen 969 and `a-round-160/end-sha256.txt`. `git status` should be 9 ` M` + 1 `??`, and the protected diff empty.
3. **AN-REVIEW:** read `a-round-160/diff-vs-start.patch` and compare the `expect(` counts above.
4. **ICON-V3B:** at both viewports, check the svg boxes are 12/10/20 ±0.5 px, the stroke-width is 2/2.4/1.2, computed stroke equals color (Delete in accent with a range), and the accessible names, including Delete = `Delete — the selected clip; leaves a gap` when idle.
5. **RV1-V3B:** run d6 with the 6 renames and check every delta is within ±1 px (the probe predicts ≤ 0.53 px).
6. Then **SURFACE-SPOT**, **FUNC-SMOKE-7** (record the `⌫ Deleted …` status text), **BRACE-HINT** (`Loop: make a time selection and press Loop (Ctrl+L)`), **G160-3** and **PX-NET/REG-HYD**. Watch for ENV-FIRST-LOAD-LUCIDE on the first cold load.
