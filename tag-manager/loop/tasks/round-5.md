# CURRENT TASK — Round 5: TM-B09 "Tagged" badge counts every non-empty field (D-15) + RR-R2-02 regression test for formatFirstFieldValue

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 4 (TM-T0-CI apt hardening + RR-R3-02) got **C PASS** on R4-1…R4-8, with realVerified=false because the Actions run is pending. Root review gave COMMIT OK and root published `7879ee0`. RR-R3-02 is closed. TM-T0-CI stays `in_progress` until root links a green Actions run on `7879ee0` or later. An earlier run, `40331357825` on `c768567`, was already green; it is now recorded as evidence. TM-T0-CI's follow-up (C-R4-01/RR-R4-02 step budget, RR-R4-05 docs) is backlog item **TM-T0-CI-FU**. It waits for the first Actions timings on `7879ee0`, so it is not in this round.

No critical or high bug is open. Why the open mediums are not this round:
- **RR-R1-01** (CI Build step) waits for the `7879ee0` Actions run.
- **RR-R2-01** (`getRiffInfoTags`) cannot be reached for WAV and would reopen the frozen `metadata.ts`.
- **RR-R3-01 / TM-T1-DUP** needs Saba's decision.
- **RR-R4-01** (xauth) is refuted: `xauth` is a Depends of `xvfb`, and C's container run confirmed it.

**TM-B09** (C-R3-01) is the only user-visible bug that can be planned now. It sits in the same component as **RR-R2-02** (root review R2: the `formatFirstFieldValue` display fix has no test). Both are in `FileList.tsx`, one tightly related pair.

**D-15 (B default, awaiting Saba, reversible, UI-only):** the badge shows when any field in the file's read metadata has a non-empty value. Empty means `""`, whitespace-only, `[]`, `[""]`/blank-only arrays, `0`, or a non-finite number. `meta:read` (`readTagsFromFile` in `src/main/ipc/metadata.ts`) returns exactly the schema keys, defaulting to `''` / `[]` / `0`. So "any key in `meta`" equals "any schema field", and recorder chunks outside the schema (e.g. ISFT) never count. Every editor save writes empty `ICAT`/`IKEY` (D-10, RR-R3-03), so a file whose only values are empty must stay **untagged**.

## Baseline
- HEAD `7879ee03fce194ec9ccbd544ba862cad9e80e42c`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files: everything not listed under File ownership. They must stay byte-identical. In particular:
  - `src/main/**`, `src/preload/**`, `src/shared/**`;
  - every `src/renderer/**` file except `FileList.tsx` and the new lib module;
  - `src/renderer/src/lib/utils.ts`, `src/renderer/src/styles/app.css` (protected);
  - `package.json`, `package-lock.json`, all `tsconfig*.json`, `biome.json`, `playwright.config.ts`, `vitest.config.*.ts`, `electron.vite.config.ts`;
  - `.github/**` (including `check.yml`, `apt-install.sh` and the protected `release.yml`);
  - `tests/fixtures/**`, `tests/renderer/setup.ts`, `tests/renderer/helpers/**`, every existing test file;
  - `tests/main/**`, `tests/e2e/**`, `tests/contract/**`;
  - `.claude/**`, `docs/**`.

## Scope
1. **New `src/renderer/src/lib/file-row-display.ts`**, a pure module with no React and no store imports. It has two named exports:
   - `formatFirstFieldValue(value: FieldValue | undefined): string`, **moved unchanged** from `FileList.tsx`:
     - an array gives its first element or `''`;
     - a string gives the string itself;
     - anything else gives `''`.
   - `hasAnyTagValue(meta: WavMetadata | undefined): boolean`, following D-15:
     - `undefined` gives `false`;
     - it is `true` if any value in `Object.values(meta)` is: a string whose `trim()` is non-empty; an array with at least one element whose `trim()` is non-empty; or a number that is `Number.isFinite` and `> 0`;
     - otherwise it is `false`.
   - Types are imported from `~/types`. No `any`, no casts beyond what TS strictly needs, no comments, semicolons. Follow `AGENT_DISCOVERABLE_CODE.md` naming.
2. **`src/renderer/src/components/file-list/FileList.tsx`.** Only these changes:
   - delete the local `formatFirstFieldValue` and import both helpers from `~/lib/file-row-display`;
   - replace the `hasTags` expression with `hasAnyTagValue(meta)`.

   Nothing else changes: markup, classes, Badge text "Tagged", columns, selection and play handlers.
3. **Tests (red first, `test-on-bugfix`).**
   - **`tests/renderer/components/file-list.test.ts` (new)** renders the real `FileList` with `createElement`. It seeds `useFileStore` with `folderPath`, `files` (full `WavFileEntry`) and `metadata`. Use the `vi.hoisted` window workaround from `schema-editor.test.ts` (A-R3-01; `setup.ts` stays frozen), and use `resetAllStores`. Cases:
     - (a) a row whose metadata has only `category: 'DOORWood'` (title `''`, artists `[]`, bpm `0`, everything else default) shows `Tagged`;
     - (b) only `keywords: ['door', 'slam']` shows `Tagged`;
     - (c) only `comment: 'მძიმე კარი'` shows `Tagged`;
     - (d) all defaults plus `category: ''`, `keywords: ['']` and `comment: '   '` show **no** `Tagged`;
     - (e) regression: `title: 'X'`, or `artists: ['A']`, or `bpm: 120` each show `Tagged`;
     - (f) RR-R2-02: `artists: 'Foo'` (string) renders `Foo`, not `F`, and `artists: ['A', 'B']` renders `A` in the artist column.
     - Assert per row, for example with `within` on the row containing the file name, so one row's badge cannot satisfy another row's assertion.
   - **`tests/renderer/utils/file-row-display.test.ts` (new)** gives boundary coverage of both exports:
     - `hasAnyTagValue`: `undefined`, `{}`, `""`, `"  "`, `[]`, `[""]`, `["", " "]`, `["", "x"]`, `0`, `-1`, `NaN`, `Infinity`, `1`;
     - `formatFirstFieldValue`: `undefined`, number, `""`, `[]`, string, array.
   - **Red proof:** run `file-list.test.ts` against the unchanged `FileList.tsx` **before** the fix. Cases (a)–(c) must fail; (d)–(f) may pass. Save the output as `a-round-5/red-before-fix.log`. Then implement and save the green run as `a-round-5/green-after-fix.log`.

**Explicitly NOT in this round:**
- Any `metadata.ts` or IPC change (RR-R2-01, D-10 empty-value policy, TM-B05, TM-B08).
- CI changes (TM-T0-CI-FU, RR-R1-01/03).
- Schema migration or duplicate handling (TM-T1-MIG / TM-T1-DUP).
- Biome on `tests/` (TM-B06).
- New badge variants, wording or styling.
- Package installs.

Read first: `.claude/primitives/AGENT_DISCOVERABLE_CODE.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md`, `SEMICOLONS.md`, `STATE_MANAGEMENT.md` (store seeding), `.claude/rules/test-on-bugfix.md`, and `tests/renderer/components/schema-editor.test.ts` (pattern).

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/lib/file-row-display.ts` (new) | pure `hasAnyTagValue` (D-15) + moved `formatFirstFieldValue` |
| `src/renderer/src/components/file-list/FileList.tsx` | import the helpers; badge uses `hasAnyTagValue` |
| `tests/renderer/components/file-list.test.ts` (new) | red-first render test for TM-B09 + RR-R2-02 display |
| `tests/renderer/utils/file-row-display.test.ts` (new) | boundary unit tests |

Generated or ignored output (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) is not committed. Reports and logs go to `a-round-5/` in the loop folder.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R5-1 (red/green TM-B09) | Read A's `red-before-fix.log`. In `/tmp/c-r5-red` (rsync + `node_modules` symlink), restore `git show 7879ee0:src/renderer/src/components/file-list/FileList.tsx` (keep the new lib and tests) and run `npx vitest run --config vitest.config.renderer.ts tests/renderer/components/file-list.test.ts`. Then run it on the real tree. | Red: cases (a), (b) and (c) fail against the old `FileList.tsx`. Green: all cases pass on the real tree. |
| R5-2 (RR-R2-02 mutation) | In a `/tmp` copy, change `formatFirstFieldValue` back to the pre-R2 behaviour (`meta?.artists?.[0] ?? ''`, i.e. index a string), then run both new test files. Second mutation: make `hasAnyTagValue` treat any defined string as non-empty (drop `trim`). | Mutation 1: case (f) fails (`F` instead of `Foo`). Mutation 2: case (d) and the whitespace/`[""]` boundary cases fail. This proves the tests check real behaviour. |
| R5-3 (gate) | Clean state: `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then the full `verifyCommand`. Also run E2E with `--retries=0`. | Exit 0. Biome 0 errors (no new warnings in the owned files). Typecheck 0 errors (node/web/test). Renderer **79 + A's new count**, all green. Main **42/42**. E2E **7/7** with `--retries=0`. |
| R5-4 (real app: contract-only file is Tagged) | Built app with `_electron` under `xvfb-run -a` (`--no-sandbox`, clean `XDG_CONFIG_HOME`, dialog stubbed to a temp folder). Two files, both shown in the same folder. **Primary, from an independent producer:** `comment-only.wav` = `ffmpeg -i tests/fixtures/sample.wav -metadata comment='მძიმე კარი' -c copy comment-only.wav`. ffmpeg also adds an `ISFT` encoder tag, which is outside the schema. **Secondary, from the UI:** `contract.wav`, a copy of `sample.wav`, where only Category `DOORWood` is set through the editor and saved. Rescan or reopen the folder, and click a row to confirm the metadata panel opens. | **comment-only.wav:** `ffprobe -show_entries format_tags -of json` shows `comment` and `encoder`/ISFT, and no title/artist. `music-metadata` agrees. The row shows `Tagged` (`c-round-5/r5-4-comment-only-tagged.png`). The badge comes from `comment`: ISFT is not a schema key, so `meta:read` does not return it. **contract.wav:** ffprobe shows `ICAT=DOORWood` and no **non-empty** title/artist. Empty sub-chunks written by the save (D-10) are allowed; attach the raw INFO dump so they are visible. The row shows `Tagged` (`r5-4-contract-tagged.png`). Optional "before" screenshot: the same folder on the `7879ee0` build (the R5-1 `/tmp` tree after `npm run build`) shows no badge on either file. |
| R5-5 (real app: emptied value stays untagged) | In the same session, on a fresh copy `blank.wav` of `sample.wav`, use the T1-10 path: set Category `x` and save; clear Category and save again; rescan. No other field is ever set. (`isDirty` is set on any edit, `metadata-store.ts:37-52`, so Save is enabled after clearing.) | ffprobe or the raw INFO dump after the second save shows `ICAT` present and **empty** (D-10 option (a)), and no non-empty schema value. The row shows **no** `Tagged` badge (`r5-5-blank-untagged.png`). After the first save, before clearing, the row did show `Tagged` (`r5-5-x-tagged.png`), so the check can discriminate. If the second save leaves no empty `ICAT`, report it as a finding (D-10 behaviour change), not a PASS. |
| R5-6 (real app regression) | In the same session, set only Title `X` on a third copy, save, rescan. In a file with two artists (`A`, `B`), the artist column shows `A`. | `Tagged` is shown for the title-only file. The artist column shows `A`, not `A, B` and not a single character. Screenshots `r5-6-*.png`. ffprobe confirms the title. |
| R5-7 (frozen/ownership) | `git status --porcelain --untracked-files=all`; `git diff --stat 7879ee0`; `git diff --quiet 7879ee0 -- . ':!src/renderer/src/components/file-list/FileList.tsx' ':!src/renderer/src/lib/file-row-display.ts' ':!tests/renderer/components/file-list.test.ts' ':!tests/renderer/utils/file-row-display.test.ts'` (everything except the four owned paths). Read the `FileList.tsx` diff. | Only the four owned paths changed or were added. The `FileList.tsx` diff is limited to the import and the `hasTags` line, plus removing the local function. No `any`, `@ts-ignore`, `@ts-expect-error`, `biome-ignore` or comments added. |

## What could break (C re-checks)
- **Badge noise:** if `hasAnyTagValue` counts defaults (`0`, `[]`, `''`) or the empty `ICAT` from D-10, every file saved once would look tagged (R5-5).
- **Sorting by artist/genre** (`file-store.ts:120`) is unaffected: the store is frozen. C clicks the Artist sort header once in R5-6 and confirms the rows still render.
- **Row selection and double-click play:** handlers are unchanged. C clicks a row in R5-4 and confirms the metadata panel opens.
- **Renderer test isolation:** the new render test must not leak store state into the existing store tests. The full renderer suite must pass in one run (R5-3).
- **Large folders:** the predicate is O(fields) per row, with no new store subscriptions.

## Next (orientation only)
1. Root reports the first `Check` Actions run on `7879ee0`:
   - **green:** TM-T0-CI and TM-T0 close, and TM-T0-CI-FU (step budget + docs note) becomes a small CI round;
   - **red, or the apt step is slow:** the per-attempt timing lines decide that round's scope.
2. Saba question batch: D-07 (TM-T1-MIG), D-10, D-12/TM-B08, TM-T1-DUP (RR-R3-01), D-15 (badge rule), RR-R1-07, RR-R3-05, and TM-T2-DATA (T-2 stays BLOCKED until it arrives).
3. Remaining low items that need no decision: TM-B06 needs `package.json` (protected), so it is a Saba question too. RR-R2-01 can join a later `metadata.ts` round.
