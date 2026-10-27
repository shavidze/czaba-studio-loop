# CURRENT TASK — Round 17: TM-B20 — file row helpers treat non-string array elements as empty and never throw; the first-value display returns strings only (RR-R5-02, B-R16-01) — D-26

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-27

## Why this round
- **Round 16 result:** C PASS, realVerified=true (R16-1…R16-6), 0 bugs.
  - Mutants M1–M5 were killed by unit tests, and M6 by a real launch.
  - Real launches with injectors gave the exact D-25 texts, the Electron pid was gone before the catch, and no orphans were left.
  - Root published `cb2d76b` with review COMMIT OK. TM-B19 and D-25 are done.
- No critical or high bug is open. Most of the remaining backlog waits on Saba (see Next). This is the next unblocked low, as round 16's "Next" announced.
- **Defect** (B experiment E1, `b-round-16-exp-row-display.mts.txt`, run with tsx against the real `cb2d76b` module):
  - `hasAnyTagValue({ artists: [null] })` throws `Cannot read properties of null (reading 'trim')`.
  - `[5]` and `[{}]` throw `item.trim is not a function` (RR-R5-02).
  - `formatFirstFieldValue([5])` returns the number `5`, and `formatFirstFieldValue([{}])` returns the object `{}` (B-R16-01). `FileList.tsx:91-92` renders that value as a React child, and an object as a child makes the row render throw.
- **Honest reach:** this cannot happen from the real app today. Main maps every array element through `stripRiffNulTerminator` / `getValuesAsStrings` (`src/main/ipc/metadata.ts:44,56,136`), and the store only receives main's results.
  - The fix is defensive, against IPC data that does not match the declared types.
  - Its acceptance is unit and component tests, plus a real-app regression check that well-typed rows are unchanged.
  - C does **not** fake a malformed value in the real app.
- **Reference first:** this is a pure fix with no product UX change, so the reference rule does not apply.

## Baseline
- HEAD `cb2d76b0b1dbb0e5e73a70ace2c8c618c0a68ffd`. The working tree must be **clean** (`git status --porcelain` empty). If HEAD differs or the tree is dirty, stop and report.
- **Frozen** (byte-identical to `cb2d76b`): everything not in the ownership table. In particular:
  - `src/**` except `src/renderer/src/lib/file-row-display.ts`. This includes `FileList.tsx`, `src/shared/types.ts` (`FieldValue` stays `string | string[] | number`), main and the stores;
  - every test except the two owned files. That includes `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, all of `tests/main/**`, `tests/e2e/**` and `tests/fixtures/**`;
  - `docs/**`, `.claude/**`, `.github/**`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts` and the tsconfigs.
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope (D-26, see `feature-status.md`)
Read `TESTING.md`, `TYPESCRIPT_STRICT.md` and `AGENT_DISCOVERABLE_CODE.md` before editing; the hook injects them anyway. Follow the `test-on-bugfix` rule: failing tests first, then the fix.
- `src/`: semicolons, single quotes, no comments.
- Tests: keep the existing double-quote style of the two test files.
- No `any`, no `@ts-ignore`, no `as unknown as` anywhere. `tests/**` is type-checked by `npm run typecheck`.

### Target behaviour (D-26, amends D-15 for malformed data only)
1. **`isNonEmptyFieldValue`, array branch:** an element counts as non-empty only if `typeof item === 'string'` and `item.trim() !== ''`.
   - Every non-string element (`null`, number, object, boolean) counts as empty.
   - Nothing throws.
   - `['x', null]` stays non-empty.
2. **`formatFirstFieldValue`:** returns `value[0]` only when it is a string, otherwise `''`.
   - No `String()` coercion.
   - No search for a later string element, so `['', 'x']` still gives `''` and `[{}, 'A']` gives `''`.
   - The string and non-array branches stay as today.
3. **Unchanged:**
   - the whole-value rules of D-15 (string non-blank; number finite and > 0; anything else empty);
   - the exported names and signatures (`formatFirstFieldValue(value: FieldValue | undefined): string`, `hasAnyTagValue(meta: WavMetadata | undefined): boolean`);
   - the `FieldValue` type;
   - `FileList.tsx`.
   - Every existing test in both owned files stays byte-identical and green. Only additions are allowed.

### How the tests build malformed data (prescribed; B checked that it type-checks)
`FieldValue` cannot hold `null` or `{}`, so build the value from JSON, the way untyped IPC data arrives:
- `const meta: WavMetadata = JSON.parse('{"artists":[null]}');`
- or a small helper, e.g. `function parseUntypedMetadata(json: string): WavMetadata { return JSON.parse(json); }`.
- For a single value: `const value: FieldValue = JSON.parse('[{}]');`.

`JSON.parse` returns an implicit `any`, so there is no written `any` and no cast. B's probe passed `tsc` with the repository's `tsconfig.test.json` settings (`b-round-16-exp-untyped-probe.test.ts.txt`). `undefined` cannot appear in JSON; cover it with `[null]`.

### Steps
1. **Red tests first.**
   - **`tests/renderer/utils/file-row-display.test.ts`** (add only):
     - (a) `hasAnyTagValue` for `{"artists":[null]}`, `{"genres":[5]}`, `{"keywords":[{}]}`, `{"artists":[true]}`. For each: no throw, and the result is `false`.
     - (b) `{"artists":["x",null]}` gives `true`, and so does `{"artists":[null," y "]}`.
     - (c) a malformed array next to another real field (`{"artists":[null],"comment":"ok"}`) gives `true`, and next to empty defaults gives `false`.
     - (d) `formatFirstFieldValue` of `[null]`, `[5]`, `[{}]` and `[true]` gives `''`, with `typeof` `"string"`. `[{}, "A"]` gives `''`, and `["A", null]` gives `"A"`.
   - **`tests/renderer/components/file-list.test.ts`** (add only; reuse its existing `vi.hoisted` window workaround and helpers):
     - (e) render `FileList` with one row whose metadata (from JSON) has `artists: [{}]` and `genres: [null]`, plus a normal tagged row.
       - Rendering does not throw.
       - Both rows are present.
       - The malformed row shows no `Tagged` badge, and its artist and genre cells are empty.
       - The normal row still shows `Tagged` and its first artist.
       - Note: `renderFileListWith` merges overrides onto string defaults, so pass the malformed values as overrides. Explain in `a-round-17.md` how the row's metadata reaches the store.
   - **Red run on `cb2d76b`** (before the fix). Record the log in `a-round-17/` and list which tests fail and with which error.
     - (a), (c), (e) and the `[null," y "]` case of (b) must fail with a throw (on the old code `null.trim()` runs first).
     - The `[5]`/`[{}]`/`[true]` and `[{}, "A"]` cases of (d) must fail on type or value.
     - The `["x",null]` case of (b) and the `[null]`/`["A", null]` cases of (d) may already pass. Say which ones.
2. **Fix** `src/renderer/src/lib/file-row-display.ts` per D-26. Keep it minimal: one `typeof` check in the array branch of each function.
3. **No docs change.** D-26 lives in `feature-status.md` (B). `docs/learning/data-flow.md` does not describe the Tagged rule.
4. **`a-round-17.md`** (Georgian). A writes it with:
   - the red and green logs;
   - the diff;
   - the full `verifyCommand` result;
   - `npx playwright test --retries=0`;
   - the `qa-engineer` read-only regression check, per the read-primitives rule after a bug fix. 3 files change, so `code-reviewer` (read-only) is required by the read-primitives rule ("3+ files"); record its result.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/lib/file-row-display.ts` | D-26 `typeof` guards |
| `tests/renderer/utils/file-row-display.test.ts` | tests (a)–(d), additions only |
| `tests/renderer/components/file-list.test.ts` | test (e), additions only |

Logs go to `a-round-17/` (A) and `c-round-17/` (C) in the loop folder. Nothing else in the repository may be written except the gitignored build and test outputs (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R17-1 ownership | `git status --porcelain --untracked-files=all`; `git diff --stat cb2d76b`; `git diff --quiet cb2d76b -- . ':!src/renderer/src/lib/file-row-display.ts' ':!tests/renderer/utils/file-row-display.test.ts' ':!tests/renderer/components/file-list.test.ts'`; read the diff | Only the 3 owned paths differ, all `M`, with no untracked file. The test diffs contain only added lines (`git diff cb2d76b -- tests/ \| grep '^-[^-]'` is empty). The src diff has no comment, `any`, `@ts-ignore` or `as`-cast. The exported signatures are unchanged. A's result shows `permission_denials` empty. |
| R17-2 red/green | `git worktree add --detach /tmp/c-r17-old cb2d76b` with `node_modules` symlinked (never `git stash`, never touch A's tree). Copy A's two test files in and run `npx vitest run -c vitest.config.renderer.ts tests/renderer/utils/file-row-display.test.ts tests/renderer/components/file-list.test.ts`; then run the same on A's tree | Old: (a), (c), (e), the `[null," y "]` case of (b) and the non-null cases of (d) fail. Record the failing test names and the thrown messages (`reading 'trim'`, `item.trim is not a function`, React's object-child error, or a type/value mismatch). New: all pass, with the exact count. |
| R17-3 mutations | In a throwaway copy of A's tree, run the two test files against each mutant. **M1:** drop the `typeof` check in `isNonEmptyFieldValue` (back to `item.trim()`). **M2:** `formatFirstFieldValue` returns `value[0] ?? ''` unconditionally (today's code). **M3:** the array branch of `isNonEmptyFieldValue` returns `value.length > 0`. **M4:** `formatFirstFieldValue` returns the first string element anywhere in the array, or `''`. | Each mutant is killed by at least one named test: M1 by (a)/(c)/(e); M2 by (d)/(e); M3 by (a) or an existing empty-element test; M4 by (d) (`[{}, "A"]` must give `''`). Report the killing test for each. A survivor is a FAIL unless C shows it is equivalent. |
| R17-4 gate | Clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Biome: 0 errors and 9 warnings, the same list as on `cb2d76b`. Typecheck 0, including `tsconfig.test.json`. Renderer **120 + new** (exact; 10 files). Main **93/93**. E2E **7/7**, and **7/7** with `--retries=0`. |
| R17-5 real app regression | Built app (A's tree), Playwright `_electron` under `xvfb-run`, driven through the UI. Copy the fixtures into a temp folder and scan it. (1) An untagged fixture row has no `Tagged` badge (screenshot). (2) Through the editor, set Artists to two values (e.g. `R17 Artist A`, `R17 Artist B`), Genres to one value (e.g. `R17Genre`), and Category to `R17Cat` on that file, then save. (3) The row shows `Tagged`, the artist column shows only `R17 Artist A`, and the genre column shows `R17Genre` (screenshot). (4) Read the saved file with `music-metadata` and `ffprobe -show_entries format_tags -of json`, and compare field by field. (5) Relaunch, rescan, and the row looks the same (screenshot). | All five hold. Hard reader checks: `music-metadata` and ffprobe both show category `R17Cat` (`ICAT`) and genre `R17Genre` (`IGNR`; B experiment `b-round-16-exp-genre.cjs.txt`: node-taglib-sharp genres → `IGNR`, ffprobe `genre`, music-metadata `common.genre` both `R17Genre`). Artists are **record only**: node-taglib-sharp writes repeated `ISTR` (TM-B08 / C-R2-01); in B's experiment ffprobe showed only `ISTR: "R17 Artist B"` (the last) and music-metadata had no `common.artists`, only native `ISTR` ×2; the app's save may add more chunks (C-R1-01). Record what each reader shows for artists; a mismatch is a signal for TM-B08, not a FAIL of this round. Name each screenshot in `c-round-17/`. State plainly that the malformed-element case is checked only by R17-2/R17-3, because it cannot be reached from the real app. |

## What could break (C re-checks)
- **The `Tagged` badge (D-15) for well-typed data:** the existing tests in `file-row-display.test.ts` and `file-list.test.ts` (a)–(f) stay byte-identical and green (R17-1, R17-4), and the real app shows the badge as before (R17-5).
- **The artist and genre columns (RR-R2-02):** a string value is shown whole, and an array shows its first element only (existing test (f), R17-5 (3)).
- **Batch/single save and the store sync (D-21…D-24)** are untouched, because `FileList.tsx`, `MetadataPanel.tsx` and the stores are frozen. R17-5 (2) saves through the real UI.
- **Renderer test count:** only additions. No existing test is renamed or removed.

## What realVerified means here
- R17-1…R17-4 are real local checks. R17-2/R17-3 are the only evidence for the malformed-element behaviour, because main never produces such data (see "Honest reach").
- R17-5 is a real-app regression check with independent readers. It does not prove the defect fix.
- The Actions part (a cold-runner `Check` run) belongs to TM-T0-CI/TM-B14, and root links it.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
1. **A MetadataPanel polish round:**
   - RR-R13-02 + RR-R15-02: remove the `as WavMetadata` casts. The preload types already fit, so no protected edit is needed.
   - RR-R15-01: re-read reason. This changes the D-24 wording, so it needs a D-24 amendment. B proposes one technical default and flags it for Saba.
2. **An optional E2E close-helper hardening** (RR-R16-03 + A-R16-01, plus a docs line for RR-R16-02). This is low value, and B decides after round 17.
3. **Root:** please link the `Check` Actions run on `cb2d76b` (or any commit since `35ed18b`). A green run closes TM-T0-CI, TM-T0, TM-T0-CI-FU and the Actions part of TM-B14.
4. **Saba question batch** (unchanged; see `b-round-16.md`):
   - D-07 (TM-T1-MIG);
   - D-10 + TM-B11;
   - D-12/TM-B08 + B-R6-01;
   - TM-T1-DUP (RR-R3-01, medium);
   - D-15 + RR-R5-01 (+ D-26 for information);
   - B-R7-02/RR-R8-04;
   - TM-B05;
   - TM-B06 (+ RR-R14-03/05, RR-R16-01, A-R16-02);
   - RR-R1-07;
   - RR-R3-05;
   - TM-T2-DATA;
   - RR-R13-01;
   - RR-R15-03;
   - RR-R15-05;
   - C-R15-01;
   - optional RR-R12-02.
