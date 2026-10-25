# A round 157 — V-2b-3b: Export timecodes in mono, css2 trim, Export start fixed from "0:00" to "00:00.000" (D-29z122)

**Status:** A's implementation is complete and handed to C. Not marked done: this needs C's browser rows. The backlog is not complete.

## Start checks
- HEAD was `cbcd3d9` and `git status --short` was empty.
- The frozen 968 were OK, the 7 start hashes were OK, and doc 127 was absent.
- Primitives read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, AUDIO_ARCHITECTURE, prompts/new-route, GEORGIAN_DOCS, TESTING_QUALITY_GATES and BUG_HUNTING_TESTS. The pre-flight gate (assumptions, smallest version, files, success command) was posted in the A chat before the first edit.

## Changed files (8 = 7 ` M` + 1 `??`)
| ID | File | Change |
|---|---|---|
| S1 | `app/lib/arrangement/strings.ts` | `exportProjectScope`, `exportRangeScope`, `exportLoopRangeNote` and `exportLoopProjectNote` were added after `selectedClipDetail`. Every id starts with `export-`. A non-exported `StudioExportTimeBounds` interface was added. The two with seconds reuse `StudioTimeSpanText`. `studioExportStrings`, `studioWorkspaceStrings` and the round-156 builders are untouched. |
| E0–E4 | `app/components/arrangement/ArrangementExportDialog.tsx` | Import changes. `rangeLabel` was removed. The description, project option, range option and loop note now render through `ArrangementTimeText`. The only literal change is `'0:00'` → `'00:00.000'` in the description (R3). |
| F1 | `app/routes/studio-lab.tsx` | Instrument Sans 700 and Plex Mono 500 were dropped (the R4 URL). |
| T1 | `__tests__/strings.test.ts` | ST-TP3: the title ("six builders"), the 6 keys and the 4 builders in its Georgian loop. ST-TP4 and ST-TP5 were appended. ST-TP3 also gained one local sample constant (`exportSpan`) that feeds the four new builders into its Georgian loop. Nothing else in the existing describe changed. |
| T2 | `__tests__/studio-theme-obsidian.test.tsx` | TH7: the new href, plus `not.toContain('700')` and `not.toMatch(/IBM\+Plex\+Mono:wght@[^&]*500/)`. |
| T3 | `__tests__/export-range-ui.test.tsx` | l.39 `PROJECT_DESCRIPTION` → `'00:00.000'`. Appended a describe with XU6–XU8 (with its own AudioContext stubs). XU6 also checks the project radio's accessible name; the reviewer asked for this. |
| D1 | doc 126 | Status → `Completed (C round 156 PASS, gate 156 cbcd3d9)`. |
| D2 | doc 127 (new) | Georgian, follows the template: R1–R6, the four sites, EXPORT-ZERO as Problem → Solution, the css2 before/after URL, tests and mutations, TODO. |

## Tests actually run (A only; not full suite / verify / build / e2e / browser)
- **Targeted vitest**, 43 files (`a-round-157/vitest-files.txt`):
  - Baseline: 679/679 (`vitest-baseline.json`).
  - After: **684/684** (`vitest-after.json`).
  - Diff: ST-TP3 was renamed. ST-TP4, ST-TP5, XU6, XU7 and XU8 are new. No test that passed at baseline was lost.
  - `PROJECT_DESCRIPTION` changed on purpose under R3. Its users (XU1, XU3 ×2) are green with the new value.
- `npm run typecheck`: 0 errors.
- `npm run lint`: exit 0, 218 warnings + 1 info. These are the same counts as the round-156 log, and none are in the owned files.
- `npx biome check` on the 6 code and test files: clean (`biome-scoped.log`).
- **Mutations** (`a-round-157/mutations/`; each was restored by Edit, and the sha256 equals the post-edit hash):
  - **m147** (E1 range description as a plain string): XU7 is red at the MONO assertion (l.572), and its text assertions passed.
  - **m148** (`' — '` → `' - '` in `exportRangeScope`): ST-TP4 is red at its first (literal) assertion; the join-equality comes after it in the same `it` and is not reached. XU7, XU2 ×2 and XU3 are also red.
  - **m149** (`'0:00'` back in E1): XU6, XU1, XU3 (project scope) and XU3 (range cleared) are red.
  - **m150** (`700` back in Instrument Sans): TH7 is red.
  - m147–m149 ran before the reviewer's single added XU6 assertion. That assertion only adds coverage, and the final 684/684 run includes it.
- **Code-reviewer:** a real subagent, score 9/10, 0 Critical/High/Medium. Its Low was fixed (the XU6 accessible name). The infos were kept, with reasons in `a-round-157/code-review.md`.

## End state
- The frozen 968 are OK. The protected diff vs `cbcd3d9` is empty (purchase/auth files, Modal, Toast, root, CookieConsent, app/styles, and the round-156 component files including ArrangementTimeText.tsx).
- `git status --short` = the 7 ` M` + the 1 `??` exactly (`a-round-157/git-status-end.txt`).
- `a-round-157/end-sha256.txt` (8 paths) and `a-round-157/diff-vs-start.patch` (vs `b-round-156/r157-granted-start/`, plus doc 127 in full).

## Architecture note → B (verbatim in `a-round-157/code-review.md`)
The four Export sentence templates now exist twice: in `studioTimeTextParts.export*` and in `studioExportStrings.*`. Only ST-TP4 keeps them in step. The reviewer proposes one bounded task after ARCH-CHECKPOINT-V2: build `studioExportStrings` from the parts, and decide on the `rangeScope({ start, end, seconds })` signature. This is a proposal only, not refactored. A second info for B: `StudioExportTimeBounds` duplicates the shape of `StudioTimeRangeText`.

## B acceptance (A-side only)
- §3 A-side items passed: baseline saved, post-edit green except the intentional PROJECT_DESCRIPTION change, typecheck, lint, scoped biome, m147–m150, code-reviewer, end state.
- No existing guard test turned red (export-dialog-* files, export-progress-ui, export-cancel-ui, export-mp3, TH1–TH11).
- **Not claimed:** every C row (TEXT-BYTES-E, MONO-STYLE-N13…N16, LAYOUT-FIT-E, CSS2-TRIM, FONT-INVENTORY, FONT-FAIL, FUNC-SMOKE-E, G157-3, PX-NET/REG-HYD). No browser was run by A.

## Known gaps / risks for C
- Whether the trimmed weights are unused is only shown from source reading. The real proof is FONT-INVENTORY and CSS2-TRIM in the browser.
- The width of the mono timecodes vs sans in the Export dialog at 1280×720 (footer overlap) is unmeasured: LAYOUT-FIT-E.

## Exact next C checks
1. T157-TARGETED: `npx vitest run $(cat a-round-157/vitest-files.txt)` → 684/684, with ST-TP4/5, XU6–XU8 and TH7 present.
2. SOURCE-SCOPE: `sha256sum -c a-round-157/end-sha256.txt`, the frozen 968 list, and git status as above.
3. Browser rows TEXT-BYTES-E (a)–(d), MONO-STYLE-N13…N16, LAYOUT-FIT-E, CSS2-TRIM, FONT-INVENTORY, FONT-FAIL, FUNC-SMOKE-E, G157-3 and PX-NET/REG-HYD on http://127.0.0.1:5173/studio-lab at 1440×900 and 1280×720.
