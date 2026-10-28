# CURRENT TASK — Round 44: TM-B44 completion — flip the unowned (w7) save-stats mock from `scanFolder` to `statFiles` (C-R43-01); the round-43 tree is carried unchanged

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 43: C FAIL. The only cause is C-R43-01 (medium, B's planning gap).** C ran every check against a real build (`realVerified=true`):
  - R43-1, R43-3, R43-4, R43-5, R43-6 and R43-7 PASS.
  - Real app: Size/Date refresh after single, nested and 3-file batch saves. Three independent readers (raw INFO, `music-metadata`, `ffprobe`) confirm the tags.
  - On a 5000-WAV tree the median single-save click→toast time fell from 388 ms (`cf4e147`) to 19 ms.
  - Main 98/98, E2E 7/7.
- **The gate is red** because `tests/renderer/components/schema-change-during-folder-load.test.ts` (w7) still feeds the save's stats refresh through `window.api.scanFolder` (`:315`). The save now calls `statFiles`, and the reset mock returns `[]`. Result: renderer 319/320, `verifyCommand` rc=1.
  - Round 43's B3 did not give A ownership of that test, so A stopped as instructed. Nothing in the product is wrong.
- **This round:** a one-line test flip, so TM-B44 (Saba Q8, D-48) can pass the gate and be published. The C-R42-01 docs correction already sits in the carried tree.
- **B's probe on a scratch copy (not the repository):**
  - With the exact line below, the renderer suite is **320/320** on A's tree.
  - The same flipped (w7), run with `cf4e147`'s `MetadataPanel.tsx`, **fails** (1 failed / 7 passed in the file).
- No critical or high bug is open.
- **Rules:**
  - `test-on-bugfix`: the flip is the test change. It turns (w7) into a real pin of D-48: red on baseline `src/`, green on the fix.
  - Reference-first: exempt (test-only round).

## Baseline
- HEAD `cf4e147d2516a549b4a8c6ae7eebbf65c51a6e42`.
  - Exception (project release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `cf4e147` that changes only the two `version` fields counts as the baseline.
- **The working tree is expected to be dirty with exactly these 13 modified files from round 43.** `git status --porcelain --untracked-files=all` must show these 13 ` M` lines and nothing else.
- Before any edit, A runs `sha256sum` on them and C repeats it. Every hash must match the table. If HEAD, the file list or any hash differs, **stop and report**.

| sha256 (round-43 content) | path |
|---|---|
| `ba07f735494a1c55094a0b91553adae2ccc6719c1dafc89e4b1255222e593776` | `.claude/primitives/ELECTRON_IPC.md` |
| `e4b812c2413164285d0605dc5283c607612f3b2b1c7acdec96f6756ea07527e5` | `.claude/primitives/STATE_MANAGEMENT.md` |
| `f37fca5f82586eda6cece6480e77e284e8068e9b1e4d80315590007feedbc4c6` | `docs/bugs/001-save-and-selection-known-limits.md` |
| `c78553102bf9f4281068688ca418f39b80aad47f2dab281f6ed10155cd22c09f` | `src/main/ipc/channels.ts` |
| `d0c00ff2fe74853e96e50991be3da04f952b18b3aeccd8f99bf35674e68c8ba1` | `src/main/ipc/file-system.ts` |
| `2664c47bfeabf46ab386328c9619538f0b81d6d4a3dc033574ae41d02d7b2126` | `src/preload/index.d.ts` |
| `be08bbe03943a1d11dd09f164ee1a91e595c2d58dfffa4705e54d75183037711` | `src/preload/index.ts` |
| `9e0cf8291249851d8a042944df9f02b6fafdc1997b09673c9379d9deb98b93be` | `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` |
| `32320ea43d84ab0278997d35f5db25c76ee4af58d5c8d9fceae2ec5af4d125ba` | `tests/e2e/app-launch.spec.ts` |
| `37d941d5a15dd0fb701969b035df2798399c308e59b186509291cef3f57d9342` | `tests/main/file-system.test.ts` |
| `f64fd3cfb783718faa405d81e9b19b0bfa2631186bd12e55ce400e4a73c8e38d` | `tests/renderer/components/metadata-panel-batch-save.test.ts` |
| `94bf4b1feb4b00b8848a4f68ece864a29479f01e7a7c653b68df22a79a24f545` | `tests/renderer/helpers/window-api-mocks.ts` |
| `9850083f4944f6a4e29f206de40feb599089b4b6e72aa2724f7fd3ff66c13d6f` | `tests/renderer/setup.ts` |

- The owned test file is unchanged from `cf4e147` at the start: sha256 `91e030ce9b7c1e0c57d469af613cf9cf7152504b53cfd60b735319bae0ebdf0e`.
- **Frozen:**
  - the 13 files above, at their round-43 content (the hashes above). Do not "improve" them; that is preserved work which C has already verified in a real build;
  - every other path except the one owned file, byte-identical to `cf4e147`.
- **Protected (never touch):** `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`.
  - `src/preload/index.ts` and `src/preload/index.d.ts` keep exactly the round-43 Saba-Q8 additions. Their hashes are in the table, and nothing else may change in them.

## Scope
**A1. `tests/renderer/components/schema-change-during-folder-load.test.ts`, test (w7) only, line 315 only.** Replace this line:
```ts
    vi.mocked(window.api.scanFolder).mockResolvedValue([{ ...FILE_A, size: 2 }, FILE_A2]);
```
with this line:
```ts
    vi.mocked(window.api.statFiles).mockResolvedValue([{ ...FILE_A, size: 2 }]);
```
- Keep the 4-space indentation, double quotes and everything else in the file. The test title and all other tests stay byte-identical. Expected `git diff --numstat cf4e147 -- <file>`: `1 1`.
- Why `FILE_A2` is dropped: the save stats only `[PATH_A]`, and D-48's per-chunk filter discards any entry outside the chunk. The intent of (w7) does not change: a save's stats refresh replaces the `files` array while the schema re-read is pending, and the schema re-read still applies.
- Use the Edit tool only (rule from round 18). No Bash writes to the repository.
- **Step 0 (red, recorded in `a-round-44.md`):**
  - Before the edit, run `npx vitest run -c vitest.config.renderer.ts tests/renderer/components/schema-change-during-folder-load.test.ts`. (w7) fails with `expected 1 to be 2` (round-43 state).
  - After the edit, the same run passes 8/8.
  - Then do the baseline-src red: copy the repository to a temp dir outside the repo (`node_modules` symlinked), put `git show cf4e147:src/renderer/src/components/metadata-editor/MetadataPanel.tsx` into the copy, and run the flipped test there. (w7) must fail. Delete the temp dir afterwards.
- If any other test fails after the flip, **stop and report** the test name. Do not edit anything else.

**Not in this round:** any `src/` change. TM-B11 (Q4) and later items. A-R43-01 (`lstat` hardening) and A-R43-02 (EACCES test) are signals, not tasks.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/components/schema-change-during-folder-load.test.ts` | A1: line 315 in (w7), one line replaced |

A writes only `a-round-44.md` (and `a-round-44/` logs) in the loop folder. C writes `c-round-44.md`/`.json` and evidence under `c-round-44/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R44-1 ownership + carried tree | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all`; `sha256sum` of the 13 carried files; `git diff --numstat cf4e147`; `git diff cf4e147 -- tests/renderer/components/schema-change-during-folder-load.test.ts`; `git diff cf4e147 -- src/preload` | HEAD is `cf4e147` (or the release-commit exception). Exactly 14 modified paths: the 13 carried, all 13 hashes equal to the Baseline table, plus the owned test file. The test file's numstat is `1 1`, the `-` line and the `+` line are exactly the two A1 lines, and the hunk sits inside (w7). Preload has zero `-` lines and only the round-43 additions (`11 0`, `1 0`). Protected and frozen paths pass `git diff --quiet cf4e147 -- <path>`. No untracked files. |
| R44-2 red/green for (w7) | **(a)** Run the file on A's tree. **(b)** Temp copy of the tree (outside the repo, `node_modules` symlinked) with `MetadataPanel.tsx` from `cf4e147`, then run the file. **(c)** Optional: the unflipped (w7) on A's tree, i.e. the round-43 state | (a) 8/8 pass. (b) (w7) fails (`files[0].size` stays 1) and the other 7 pass. Logs saved under `c-round-44/`. The temp copy is removed afterwards. |
| R44-3 gate | Clean `verifyCommand` `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }`, plus `xvfb-run -a npx playwright test --retries=0` once | Exit 0. Renderer **320/320**, main **98/98**, E2E 7/7 with no retry. Biome 0 errors, warnings ≤ 8. |
| R44-4 real app, fresh smoke | Built app via Playwright `_electron` under `xvfb-run`, `XDG_CONFIG_HOME` temp; the round-43 harness `c-round-43/r43-probe.mjs` may be reused. Fixture WAVs with an old mtime (e.g. 2020-01-15). **(a)** select one WAV, set Category `DOORWood`, Save Tags. **(b)** select 3 WAVs, set Keywords `door, slam`, `Save to 3 files`. **(c)** `page.evaluate` → `window.api.statFiles([existing, missing])` and `statFiles("x")` | (a), (b): each saved row's Size = `formatFileSize(fs.statSync(p).size)`, Date shows the new mtime, unsaved rows unchanged (screenshots before/after). For every saved file, `music-metadata` + `ffprobe -show_entries format_tags -of json` + raw INFO parse give `ICAT=DOORWood` (a) and `IKEY=door, slam` (b), field by field. (c): only the existing entry is returned, matching `fs.statSync`; `"x"` rejects with `Invalid paths`. `pageErrors` is empty. |
| R44-5 round-43 evidence carried | Only after R44-1 confirms all 13 hashes and that `src/` diff = round 43's | C may cite `c-round-43.md` R43-3/R43-4/R43-5(b) speed/R43-6/R43-7 as evidence for the unchanged `src/` and docs. It must say so explicitly, with the hash check as the reason. If any hash differs, C re-runs R43-4..R43-6 in full instead. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- Nothing in `src/` changes. The real risk is A touching anything outside line 315, or a carried file drifting (R44-1 hashes).
- Shared mock reset: `window-api-mocks.ts` (carried) resets `statFiles` to `[]` in each `beforeEach`. Check that (w7)'s `mockResolvedValue` does not leak into (w8), i.e. the whole file passes in order and the full renderer suite is 320/320.
- Other suites that mock `scanFolder` (`folder-read-during-save`, `folder-read-overlap`, `folder-read-rejected-chunk`, `schema-editor-done-busy`, `schema-editor-stale-close`, other tests in this file) serve Open Folder / Rescan / drop loads, not the save's refresh. They stay untouched and green; B grepped them (B-R43-01).

## Next (orientation only, Saba's order)
1. **Q4 → TM-B11 / D-10:** skip empty text and unset numbers, and keep a meaningful `0`. T1-10 in `recording-tag-contract.test.ts` and the K-4 docs must flip (B-R42-02). Touches `src/main/ipc/metadata.ts`.
2. **Q5 → TM-B05:** a per-file error "audio data is empty, cannot tag", with a test.
3. **Q3 → TM-B08:** docs/test pin only (D-12 decided).
4. **Q6 → TM-B06:** Biome over `tests/**` with a relaxed override.
5. **Q7 → TM-T2-DATA → TM-T2:** still waiting on Saba's UCS list and licence.
6. **Open for Saba:** Q9–Q17, Q18 (B-R42-01), Q19 (RR-R42-03).
