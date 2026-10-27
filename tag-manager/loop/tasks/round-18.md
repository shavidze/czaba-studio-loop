# CURRENT TASK — Round 18: TM-B21 — the file list sort treats a non-string first array element as '' and never throws (A-R17-01) — D-27

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 17 result:** C PASS, realVerified=true (R17-1…R17-5), 0 bugs.
  - Red: 12 tests failed on `cb2d76b`. Green: 43/43. Mutants M1–M4 were all killed.
  - Gate: 135/93/7. The real-app regression was checked with ffprobe and music-metadata.
  - Root published `4f8a578` with review COMMIT OK. TM-B20 and D-26 are done.
- No critical or high bug is open. This is the bug A found in round 17 (A-R17-01), confirmed by C (code reading) and by a B experiment. It is the same class as TM-B20 and needs the same kind of fix.
- **Defect.** B ran experiments `b-round-17-exp-sort3.mts.txt` and `b-round-17-exp-sort.mts.txt` (outputs `…-output.txt`) with tsx against the real `4f8a578` `file-store.ts`, calling `selectRange`, which calls `getSortedFiles`.
  - `src/renderer/src/stores/file-store.ts:125-127` builds the sort key as `Array.isArray(aVal) ? (aVal[0] ?? '') : String(aVal ?? '')` and then calls `aStr.localeCompare(bStr)`.
  - A first element of `[5]`, `[{}]`, `[true]` or `[{}, "Mid"]` throws `aStr.localeCompare is not a function`.
  - With 3 files and the malformed row **in the middle**, it throws in all 4 combinations (2 insertion orders × asc/desc), for both `artists` and `genres`.
  - With 2 files, it throws only when the malformed row is listed second, so the throw depends on order.
  - `[null]` and `[]` do not throw. They sort as `''`.
  - The throw happens inside `useFilteredFiles`' `useMemo`, which makes `FileList` fail to render, and inside `selectRange`.
- **Honest reach:** this cannot happen from the real app today, because main maps every array element to a string (`src/main/ipc/metadata.ts:44,56,136`). The fix is defensive, as in round 17.
  - Its proof is unit and component tests.
  - The real-app check is a regression check of sorting by Artist and Genre, which no test covers today.
  - C does **not** fake a malformed value in the real app.
- **Reference first:** this is a pure fix with no product UX change, so the rule does not apply.

## Baseline
- HEAD `4f8a5780b338ecbdb10377e20764780cb267a4f3`, and the working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `4f8a578`): everything not in the ownership table, in particular:
  - all of `src/**` except `src/renderer/src/stores/file-store.ts`. That includes `src/renderer/src/lib/file-row-display.ts` (D-26), `FileList.tsx`, `MetadataPanel.tsx`, the other stores, `src/shared/types.ts` (`FieldValue` stays `string | string[] | number`, `SortField` unchanged), main and preload;
  - every test except the two owned files, including `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, `tests/renderer/utils/**`, `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**`, `.claude/**`, `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Process rule for this round (A-R17-02)
- In round 17 the read-primitives hook did not fire, and the src file was written with a Bash heredoc.
- **Every repository write goes through the Edit or Write tool.** That means no `cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv` into the repository, or a script that writes repository files. Gitignored build and test outputs from npm commands are the only exception.
- Before the first edit, read `TESTING.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md` and `.claude/prompts/new-store.md` (Zustand store rule). In `a-round-18.md`, state whether the hook fired and when you read each primitive.

## Scope (D-27, see `feature-status.md`)
Follow the `test-on-bugfix` rule: write the failing tests first, then the fix.
- `src/`: semicolons, single quotes, no comments.
- Tests: keep each file's existing double-quote style.
- No `any`, `@ts-ignore` or `as unknown as` anywhere, and no new `as` cast. `tests/**` is type-checked by `npm run typecheck`.

### Target behaviour (D-27)
1. In `getSortedFiles`' `default` branch, for an **array** value the sort key is `value[0]` when `typeof value[0] === 'string'`, otherwise `''`.
   - Change both the `aStr` and the `bStr` line.
   - Use an inline `typeof`. The store does **not** import `file-row-display`.
   - Do not coerce the element with `String()`, and do not search for a later string element (`[{}, "Mid"]` gives `''`).
2. **Unchanged:**
   - the non-array path: both numbers → numeric; otherwise `String(value ?? '')` + `localeCompare` (so a number vs. a missing value compares `"120"` with `""` as today);
   - the `name`/`size`/`modifiedAt` cases, `dir`, every action and `useFilteredFiles`;
   - exported names and types.
   - A small private helper inside `file-store.ts` (e.g. `getSortKey(value: FieldValue | undefined): string`) is allowed if both lines use it, with no export. Otherwise keep the change to the two lines.

### Tests (prescribed)
Malformed data comes from `JSON.parse` annotated with the target type, never a cast (backlog rule from round 16), for example:

```ts
const metadata: Record<string, WavMetadata> = JSON.parse('{"/music/y.wav":{"artists":[5]}}');
```

Do not add a third copy of `parseUntypedMetadata` (RR-R17-02). Inline `JSON.parse` is enough.

**Imports:** the only non-addition allowed in either test file is extending an **existing** import line with more named imports. Examples: `import type { WavFileEntry, WavMetadata } from "~/types";` and adding `fireEvent` to the `@testing-library/react` line. Do not add a second import line from a module that is already imported (RR-R17-01).

1. **`tests/renderer/stores/file-store.test.ts`** (additions only), new `describe("sorting by array fields (TM-B21, D-27)")`. Read the order through the store, not React. A local helper does `setSelectedPaths([])`, then `selectRange(0, files.length - 1)`, and returns `selectedPaths`; after a clear, that is the sorted order.
   - Fixture: `x.wav` with `["Zed"]`, `y.wav` with the value under test, `z.wav` with `["Abe"]`. `y` is always in the middle: insertion orders `[x, y, z]` and `[z, y, x]`, each with `asc` and `desc`. That is 4 combinations, and each test checks all 4.
   - **(a)** `artists`: `y` = `[5]`, `[{}]` and `[true]`, plus `genres` `y` = `[{}]`. For each: no throw. The order is `y, z, x` for asc and `x, z, y` for desc (malformed sorts as `''`).
   - **(b)** `artists` `y` = `[{}, "Mid"]` gives the same order as (a). The rule is "first element only".
   - **(c)** Pins for well-typed data. These must already pass on `4f8a578`, so say so in the red log:
     - `y` = `["Mid"]` gives asc `z, y, x` and desc `x, y, z`;
     - `y` = `[null]` and `y` = `[]` give asc `y, z, x`;
     - `bpm`: `x` = 120, `y` = 9, `z` = 30 gives asc `y, z, x`, which is numeric, not lexicographic;
     - `bpm`: one file with 120 and one with no metadata entry, inserted 120 first, gives asc missing first and desc 120 first.
2. **`tests/renderer/components/file-list.test.ts`** (additions only). Reuse its `vi.hoisted` window workaround, `renderFileListWith` and the existing local `parseUntypedMetadata`.
   - **(R18-e)** Render with the default `name` sort and three rows: `a.wav` `artists: ["Zed"]`, `b.wav` with malformed `artists: [{}]` passed as an override, and `c.wav` `artists: ["Abe"]`.
   - Click the `Artist` header (`fireEvent.click(screen.getByRole("button", { name: "Artist" }))`). Expect no throw, and the row names in DOM order `b.wav, c.wav, a.wav`.
   - Click it again for desc: `a.wav, c.wav, b.wav`.
   - The `Tagged` badge and the artist cells stay as D-26 says: `b.wav` untagged with an empty cell (unless other defaults count — explain in `a-round-18.md`).
3. **Red run on `4f8a578`** (before the fix). Save the log in `a-round-18/`.
   - (a), (b) and (R18-e) must fail with `localeCompare is not a function`, or the React or testing-library error that wraps it. Record the exact messages.
   - (c) must pass. Say so.
4. **Fix** `file-store.ts` per D-27.
5. **No docs change.** D-27 lives in `feature-status.md` (B's file).
6. **`a-round-18.md`** (Georgian) contains:
   - the red and green logs and the diff;
   - the full `verifyCommand`;
   - `xvfb-run -a npx playwright test --retries=0`;
   - `qa-engineer` read-only regression check (required by the bugfix rule);
   - `code-reviewer` read-only check (3 files changed, so the "3+ files" rule applies), with its result recorded;
   - the process statement (hook fired or not, when each primitive was read).

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/stores/file-store.ts` | D-27 sort key (two lines, or one private helper) |
| `tests/renderer/stores/file-store.test.ts` | tests (a)–(c), additions plus the import extension only |
| `tests/renderer/components/file-list.test.ts` | test (R18-e), additions plus the import extension only |

Logs go to `a-round-18/` (A) and `c-round-18/` (C) in the loop folder. Nothing else in the repository may be written, except the gitignored outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R18-1 ownership + process | Run `git status --porcelain --untracked-files=all`, `git diff --stat 4f8a578` and `git diff --quiet 4f8a578 -- . ':!src/renderer/src/stores/file-store.ts' ':!tests/renderer/stores/file-store.test.ts' ':!tests/renderer/components/file-list.test.ts'`. Then read the diff and A's result JSON or transcript. | Only the 3 owned paths differ, all `M`, with no untracked file. In `git diff 4f8a578 -- tests/ \| grep '^-[^-]'`, every removed line is an import line that comes back with the same names plus new ones. The src diff touches only the sort key: no comment, no `any`/`@ts-ignore`/`as` cast, no new export, and `file-row-display` is not imported. `permission_denials` is empty. A wrote no repository file through Bash (`cat >`, heredoc, `tee`, `sed -i`, `cp`/`mv`); report what A's record shows, and if the transcript is not available, say so (as in C-R12-01). |
| R18-2 red/green | Run `git worktree add --detach /tmp/c-r18-old 4f8a578` with `node_modules` symlinked. Never use `git stash`, and do not touch A's tree. Copy A's two test files in and run `npx vitest run -c vitest.config.renderer.ts tests/renderer/stores/file-store.test.ts tests/renderer/components/file-list.test.ts`. Then run the same command on A's tree. | Old code: (a), (b) and (R18-e) fail with `localeCompare is not a function` (or its React or testing-library wrapper); record the names and messages. All (c) pins pass. New code: everything passes, with the exact count. |
| R18-3 mutations | In a throwaway copy of A's tree, run the two test files once per mutant. **M1:** back to `aVal[0] ?? ''` / `bVal[0] ?? ''`. **M2:** `String(aVal[0] ?? '')` (no throw; `[true]` becomes `"true"`). **M3:** the D-27 key is kept for arrays, but the non-array path also returns `''` for numbers when the other side is not a number (number vs. missing ties). **M4:** the first string element anywhere in the array (`find`), else `''`. **M5:** the old code with the whole comparator wrapped in `try { … } catch { return 0; }`. | Each mutant is killed by at least one named test. Expected: M1 by (a)/(R18-e); M2 by (a) `[true]` (it sorts between `Abe` and `Zed`); M3 by (c) bpm vs missing; M4 by (b); M5 by an order assertion in (a). Report the killing test for each. A survivor is a FAIL unless C shows the mutant is equivalent. |
| R18-4 gate | From a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once. | Exit 0. Biome: 0 errors and 9 warnings, the same list as on `4f8a578`. Typecheck 0, including `tsconfig.test.json`. Renderer **135 + new** (exact count; 10 files). Main **93/93**. E2E **7/7**, and **7/7** with `--retries=0`. |
| R18-5 real app sort regression | Use the built app (A's tree), Playwright `_electron` under `xvfb-run`, driven through the UI only (the folder dialog may be stubbed, as in R17). Copy `tests/fixtures/sample.wav` into a temp folder as `a-zed.wav`, `b-untagged.wav` and `c-abe.wav`, and scan it. (1) Through the editor, set `a-zed.wav` to Artists `R18 Zed`, Genres `R18 Rock`, and `c-abe.wav` to Artists `R18 Abe`, Genres `R18 Ambient`. Save each one. (2) Click the `Artist` header: the visible order is `b-untagged, c-abe, a-zed` (screenshot). Click again: `a-zed, c-abe, b-untagged` (screenshot). (3) Click `Genre`: `b-untagged, c-abe, a-zed` (screenshot). (4) Under `Artist` asc, click the first row and shift-click the second row: exactly `b-untagged` and `c-abe` are selected, and `a-zed` is not, so the range follows the sorted order (screenshot). (5) Click `Name`, `Size`, `BPM` and `Date` once each: no page error, and the rows are still listed. (6) Read the two saved files with `music-metadata` and `ffprobe -show_entries format_tags -of json`. (7) Relaunch, rescan, click `Artist`: same order as (2) (screenshot). | All seven hold. `pageErrors` is empty in every phase. Hard reader checks: for both files, ffprobe `genre` and music-metadata `common.genre` equal the saved genre (`IGNR`). Artists are **record only** (TM-B08 / C-R2-01: `IART` and repeated `ISTR`, plus the ID3 chunk from C-R1-01); a mismatch there is a TM-B08 signal, not a FAIL. Name each screenshot in `c-round-18/`. State plainly that the malformed case is checked only by R18-2/R18-3, because it cannot be reached from the real app. |

## What could break (C re-checks)
- **Sorting of well-typed data:** Artist and Genre by first element (R18-5 (2)(3), pins (c)); BPM numeric (pin (c)); Name, Size and Date (R18-5 (5)); a number vs. missing metadata keeps today's order (pin (c), M3).
- **Shift-click range selection** uses the same sorted list (`selectRange`): R18-5 (4) and the existing `selectRange` tests stay green.
- **`selectAll`, search filter and `lastClickRef` reset:** these are untouched. Existing tests stay green, and `FileList.tsx` is frozen.
- **Tagged badge and the artist and genre cells (D-15, D-26):** `file-row-display.ts` is frozen. The R17 tests stay byte-identical and green.
- **Renderer test count:** additions only. No existing test is renamed or removed.

## What realVerified means here
- R18-1…R18-4 are real local checks. R18-2 and R18-3 are the only evidence for the malformed-element behaviour (see "Honest reach").
- R18-5 is a real-app regression check with independent readers. It does not prove the defect fix.
- The cold-runner Actions `Check` run belongs to TM-T0-CI/TM-B14, and root links it.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
1. **TM-B22** (C-R17-01): the Size column is stale after a save. Before scheduling it, B probes where the new size can come from (the `meta:write` result, a stat, or rescanning the saved paths) and whether main or preload has to change (preload is protected).
2. **MetadataPanel polish:**
   - RR-R13-02 + RR-R15-02: remove the `as WavMetadata` casts;
   - RR-R15-01: re-read reason, which needs a D-24 amendment (Saba).
3. **Optional E2E close-helper hardening:** RR-R16-03 + A-R16-01.
4. **Root:**
   - link a `Check` Actions run on `4f8a578` (or any commit since `35ed18b`);
   - check whether the job's `~/.claude/settings.json` installs the read-primitives PreToolUse hook (A-R17-02).
5. **Saba question batch:** unchanged, plus RR-R17-03 (see `b-round-17.md`).
