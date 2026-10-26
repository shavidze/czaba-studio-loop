# CURRENT TASK — Round 2: TM-B04 real type-check in `npm run check` (+ TM-B07 `check.yml` report path)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-26

## Why this round
Round 1 (T-0 baseline): **C PASS**, published by root as `c34ee5a`. TM-B01, TM-B02, TM-B03 and TM-T0-DOC are done. TM-T0-CI and TM-T0 stay open (realVerified=false) until root links a green GitHub Actions run. That run is root's job, not this round's.

This round fixes **TM-B04 (high, gate integrity)**. Right now `npx tsc --noEmit` in `npm run check` type-checks **0 files**, so a green check has never been evidence of type safety. T-1 (the tag contract) must not start on a gate that cannot fail.

It is bundled with **TM-B07 (low, C-R1-02)**, a closely related CI-gate bug: `check.yml` uploads `playwright-report/`, but nothing creates that folder.

**Authority (decision D-11, B):** `requirements.md:65` freezes only `package.json` `version` + `build` (electron-builder config). It freezes `src/preload/*` "unless the round says otherwise". So this round owns `scripts.check` and a new `scripts.typecheck`. `src/preload/**` stays **byte-identical**; `src/preload/index.d.ts` is only *referenced* from a tsconfig `include`. Saba may still object (b-round-1.md Q1).

### B's measurements at `c34ee5a` (this runner, TypeScript 5.9.3)
`npx tsc --noEmit -p tsconfig.{node,web,test}.json` reports 10 errors (node), 32 (web) and 31 (test).

In a scratch copy (`/tmp/bexp2`), B applied only the config fixes below: `target ES2022`, `lib`, `skipLibCheck`, and the preload `.d.ts` in `include`. That removed every node_modules error, every TS2802 (Set iteration) error and the renderer's `window.api` errors. **These 21 code-level errors remain:**

| File | Errors | Cause |
|---|---|---|
| `src/main/ipc/metadata.ts:118,170,173` | 3× TS2339 `tags` not on `Tag`, 3× TS7006 | `RiffFile.tag` is typed `Tag`; at runtime it is `RiffTags extends CombinedTag` |
| `src/renderer/src/components/file-list/FileList.tsx:94,95` | 2× TS7053 | `meta?.artists?.[0]`, and `FieldValue` includes `number` |
| `src/renderer/src/lib/utils.ts:63` | 1× TS2345 | the inline schema type has `type: string`, but `readMetadataBatch` takes `FieldDefinition[]` |
| `tests/e2e/app-launch.spec.ts` (5), `tests/e2e/folder-workflow.spec.ts` (6) | TS2339 on `Page` | the Page variable is named `window` and shadows the global inside `evaluate()` callbacks |
| `tests/renderer/setup.ts:30` | 1× TS2352 | `globalThis.window as Record<string, unknown>` |

If A's real configuration surfaces more errors or different ones, A **stops and reports** them with file:line. A does not widen the ownership.

## Baseline
- HEAD `c34ee5ad834eef4561c50f03e87934623705cb53`, working tree clean. If HEAD differs, or the tree is dirty in paths you don't own, stop and report.
- Frozen files (must stay byte-identical):
  - `src/preload/**`, `src/shared/**`, and every other `src/**` file not in the ownership table
  - `tsconfig.json` (root), `.github/workflows/release.yml`, `package-lock.json`, `playwright.config.ts`, `vitest.config.renderer.ts`, `vitest.config.main.ts`, `electron.vite.config.ts`, `biome.json`
  - `.claude/**`, `src/renderer/src/styles/app.css` (design tokens)
  - `tests/fixtures/**`, `tests/main/global-setup.ts`, `tests/e2e/electron-launch.ts`, `node_modules/**`
- Protected inside an owned file: in `package.json`, everything except `scripts.check` and the new `scripts.typecheck` (`version`, `build`, the dependencies and all other scripts).

## Scope
1. **Real type-check gate (TM-B04).**
   - `package.json`:
     - add `"typecheck": "tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.web.json && tsc --noEmit -p tsconfig.test.json"`;
     - change `check` to `biome check src/ && npm run typecheck && npm run test`.
     - These three `-p` calls are proven to run with `composite: true` without a config error. Do not use `tsc -b` unless A shows with `--listFiles` that it checks the same file set.
   - `tsconfig.node.json`: add `target: "ES2022"`, `lib: ["ES2022"]` and `skipLibCheck: true`.
   - `tsconfig.web.json`: add `target: "ES2022"`, `lib: ["ES2022", "DOM", "DOM.Iterable"]` and `skipLibCheck: true`. Add `src/preload/index.d.ts` to `include`.
   - `tsconfig.test.json`: add the same `target`, `lib` and `skipLibCheck`. Add `src/preload/index.d.ts` to `include`.
   - `tsconfig.json` (root) stays **frozen**: `tsconfig.test.json` is not composite, and a reference to it would raise TS6306 and break R2-3's old-check reproduction.
   - Safety note: `src/**` has no `class` declarations (B grep), so `target ES2022` does not change class-field semantics in the vite/esbuild build. A re-checks this with `grep -rn "class " src` and records the result.
2. **Code fixes. Types only; runtime behaviour must stay identical.**
   - `src/main/ipc/metadata.ts`: type the three `file.tag.tags` uses correctly. For example, narrow with `file.tag instanceof CombinedTag` (import `CombinedTag` from `node-taglib-sharp`), or add one small typed helper such as `getRiffInfoTags(file)` (name it per `AGENT_DISCOVERABLE_CODE.md`). **The InfoTag write and read path must behave exactly as before.**
   - **Test first (`test-on-bugfix`).** `tests/main/metadata.test.ts` has no test for the InfoTag path, so the `keywords` → `IKEY` custom chunk path is unpinned. Before touching `metadata.ts`, add a test there:
     - write `{ keywords: 'door, slam' }` with the default `STANDARD_FIELDS` schema to a copy of `sample.wav`;
     - assert (a) `readMetadata` returns `keywords === 'door, slam'`;
     - assert (b) the raw file bytes contain ASCII `IKEY`, then a little-endian size, then the bytes `door, slam`.
     - The test must be **green before and after** the change: it pins behaviour. The red proof for TM-B04 is the gate itself (R2-3).
   - `src/renderer/src/components/file-list/FileList.tsx:94-95`: an array shows its first element (`?? ''`), as today. A non-empty string shows the whole string. This is the one intended display change: today `"abc"[0]` renders `"a"`. It is a latent display fix, and `test-on-bugfix` needs no test for it (it is not a store, IPC or utility change). Anything else shows `''`. No styling change.
   - `src/renderer/src/lib/utils.ts`: type the batch-read helper's `schema` parameter as `FieldDefinition[]` (import from the shared types). Same name, same behaviour.
   - `tests/e2e/app-launch.spec.ts`, `tests/e2e/folder-workflow.spec.ts`: rename the Page variable `window` → `page`. **Test names, assertions and launch code stay unchanged.**
   - `tests/renderer/setup.ts:30`: fix the cast (for example `as unknown as Record<string, unknown>`). The mock API stays unchanged.
   - Not allowed: `any`, `@ts-ignore`/`@ts-expect-error`, `biome-ignore`, and code comments (CLAUDE.md rules 1 and 3).
3. **CI report path (TM-B07).**
   - `.github/workflows/check.yml`: give the E2E step `--reporter=list,html` plus `env: PLAYWRIGHT_HTML_OPEN: never`, so `playwright-report/` really exists. Other steps stay unchanged; typecheck already runs inside `npm run check`.
   - `docs/plans/002-recording-tag-contract.md`: keep the report-upload sentence true, and add one Georgian sentence saying that from round 2 on `npm run check` runs a real type-check (`npm run typecheck`).

**Explicitly NOT in this round:**
- Biome coverage of `tests/` (TM-B06).
- The `category`/`ICAT` field (T-1).
- The empty-`IKEY` policy (D-10, waiting for Saba).
- Any fixture-script change.
- SHA pinning of actions.
- `needs: check` in `release.yml`.
- `.claude/primitives/TESTING.md` (frozen, C-R1-03).
- Installing packages.

Read first: `.claude/primitives/TYPESCRIPT_STRICT.md`, `TESTING.md`, `WAV_METADATA.md`, `AGENT_DISCOVERABLE_CODE.md`, `GIT_RULES.md` (no commit) and `.claude/rules/test-on-bugfix.md`.

Capture the red runs before fixing:
- (a) the per-project `tsc -p` error counts;
- (b) in a `/tmp` copy, the **old** check command `biome check src/ && npx tsc --noEmit && npm run test` accepting a deliberately broken `src/main/index.ts`.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `package.json` | `scripts.check` + new `scripts.typecheck` **only** |
| `tsconfig.node.json`, `tsconfig.web.json`, `tsconfig.test.json` | target, lib, skipLibCheck; preload `.d.ts` include |
| `src/main/ipc/metadata.ts` | typed `CombinedTag`/InfoTag access, no behaviour change |
| `src/renderer/src/components/file-list/FileList.tsx` | `FieldValue` narrowing (lines 94-95) |
| `src/renderer/src/lib/utils.ts` | `schema: FieldDefinition[]` |
| `tests/main/metadata.test.ts` | new IKEY pin test (added; existing tests unchanged) |
| `tests/e2e/app-launch.spec.ts`, `tests/e2e/folder-workflow.spec.ts` | `window` → `page` rename only |
| `tests/renderer/setup.ts` | cast fix only |
| `.github/workflows/check.yml` | E2E step reporter + env only |
| `docs/plans/002-recording-tag-contract.md` | report sentence + type-check sentence |

Generated and ignored files (`tests/fixtures/*.wav`, `out/`, `test-results/`, `playwright-report/`) may appear. They are not committed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R2-1 (type-check is real) | `npx tsc --noEmit -p tsconfig.X.json --listFiles \| grep -v node_modules` for node, web and test | Each list is non-empty. It names `src/main/ipc/metadata.ts` (node); `src/renderer/src/App.tsx` **and** `src/preload/index.d.ts` (web); `tests/e2e/app-launch.spec.ts` **and** `tests/renderer/setup.ts` (test). Paste the counts and the grep hits. |
| R2-2 (0 errors) | `npm run typecheck`, and each `-p` on its own | exit 0, 0 errors in all three projects; `package.json` `check` calls `typecheck`. |
| R2-3 (red proof: the gate can fail) | Copy the repo to `/tmp/c-r2-red` (`rsync -a --exclude node_modules`, then `ln -s <repo>/node_modules`; if Vitest trips on the symlink, use `cp -al` hardlinks). In the copy, append `export const brokenTypeProbe: number = 'x';` to `src/main/index.ts` and run `npm run check`. Repeat with the probe in `src/renderer/src/App.tsx`, then in `tests/renderer/setup.ts`. Then, with the `src/main` probe, run the **old** check command `npx biome check src/ && npx tsc --noEmit && npm run test`. Never edit the working tree. | The three new-check runs are red at the tsc step with TS2322 (paste the log tails with file:line). The old command with the probe is green, which reproduces the bug. The working-tree `npm run check` is green. |
| R2-4 (no test regression) | Simulated clean state `rm -rf out test-results playwright-report tests/fixtures/*.wav`, then the full `verifyCommand`. Also paste `npm run build && xvfb-run -a npx playwright test --retries=0 --reporter=list` separately. | exit 0; Biome 0 errors; renderer 75/75; main **31/31** (30 + the IKEY test); E2E 6/6 with `--retries=0`. |
| R2-5 (IKEY pin test can fail) | Read the new test. In a `/tmp` copy, make `metadata.ts` skip `setValuesFromStrings` (or return `[]` for InfoTags), then run the main tests. | The new test is red in the copy and green on the real tree. A test that cannot fail is not acceptance. |
| R2-6 (real-app save regression; `metadata.ts` changed) | Like R1-9: `_electron` under `xvfb-run` (`--no-sandbox`), clean `XDG_CONFIG_HOME`, folder dialog stubbed to a temp folder holding copies of `sample.wav`. Through the UI: open the folder, select a file, type Title `C R2 Title`, Comment `C r2 comment` and Keywords `door, slam`, then click Save. Read the file with `music-metadata` `parseFile` **and** `ffprobe -v error -show_entries format_tags -of json`, and dump `LIST/INFO`. | Screenshots before and after Save in `c-round-2/`. Both readers show the title and comment. `IKEY` = `door, slam` in the raw INFO and in ffprobe. `data` chunk sha256 unchanged. The file-list row still renders (`FileList` change). |
| R2-7 (TM-B07) | `rm -rf playwright-report; npm run build; PLAYWRIGHT_HTML_OPEN=never xvfb-run -a npx playwright test --retries=0 --trace=retain-on-failure --reporter=list,html` (the exact command from `check.yml`). Parse `check.yml` with `js-yaml`. | `playwright-report/index.html` exists; the list output still prints; the command exits (no report server left open). The YAML is valid, and `git diff c34ee5a` shows the other steps unchanged. TM-T0-CI's real Actions run stays realVerified=false. |
| R2-8 (frozen) | `git diff --stat c34ee5a`; `git diff c34ee5a -- package.json`; `git diff --quiet c34ee5a -- tsconfig.json src/preload src/shared .github/workflows/release.yml package-lock.json playwright.config.ts vitest.config.renderer.ts vitest.config.main.ts electron.vite.config.ts biome.json .claude tests/fixtures tests/main/global-setup.ts tests/e2e/electron-launch.ts` | Only paths from the ownership table changed. The `package.json` diff touches only `check` plus the added `typecheck`. The frozen-path diff is empty. No added `any`, `@ts-ignore`, `@ts-expect-error` or `biome-ignore`: `git diff c34ee5a \| grep -E '^\+.*(: any\b\|as any\|@ts-ignore\|@ts-expect-error\|biome-ignore)'` prints nothing. |
| R2-9 (E2E rename only) | Read the diff of both specs | Only the identifier `window` → `page` and its call sites changed. Test names and `expect` lines are otherwise identical. |

## What could break (C re-checks)
- **InfoTag write/read in `metadata.ts`.** A wrong `instanceof` guard would silently stop writing custom INFO chunks: keywords/IKEY and any custom field a user adds. R2-5 and R2-6 catch this. `readMetadata` on `corrupt.wav` must still return empty metadata (existing main test).
- **The build.** `npm run build` still succeeds, and the renderer and main bundles still start (E2E 6/6).
- **Vitest.** The renderer config and the main `globalSetup` are unchanged. Counts stay 75 / 31.
- **The renderer file list.** The artist and genre columns still show the first value of an array.
- **`check.yml`.** The html reporter must not hang the CI step (R2-7: the command exits).
- **Windows dev.** `typecheck` uses only `tsc` and `&&`, so it is cross-platform. Checked by code read only; Windows is not available here.

## Next (orientation only)
Round 3: **T-1** tag contract. Scope: `category` → INFO `ICAT`, the IKEY and ICMT round-trip, audio and recorder chunks preserved (T1-1…T1-10).

Open with Saba before it starts:
- D-01: is `ICAT` final?
- D-07 and D-08.
- New **D-10**: should empty fields be written at all? Today an empty Keywords field produces `IKEY=""` (C-R1-01).

If these are still unanswered, B plans T-1 with the defaults recorded in `feature-status.md`, and C pins those defaults with tests.
