# CURRENT TASK — Round 49: TM-B06 (Saba Q6, D-52) — Biome lints and formats `tests/` too

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 48: C PASS** (R48-1..R48-6, `realVerified=true`, bugs 0). Renderer 326/326, main 135/135, E2E 7/7 (`--retries=0` 7/7). Mutants M1–M5 were all killed. Root published **2dfd7d6**. **TM-B08 is done**, D-12 is verified and C-R2-01 is closed (behaviour pinned and documented, not changed, per Saba Q3).
- No critical or high bug is open. Root's round-48 findings are low/info signals (RR-R48-01..04) and are not scheduled.
- **Next in Saba's order: Q6 → TM-B06.** Saba (2026-10-28): "yes, Biome lints `tests/**` too (relaxed override), as its own round."
- The other half of TM-B06's title ("tsconfig.test.json not part of check") was closed in round 2 by TM-B04 (`scripts.typecheck` runs `tsc --noEmit -p tsconfig.test.json`). C re-confirms it (R49-4). It is not dropped.
- Today `npm run check` runs `biome check src/`. The CLI path argument limits Biome to `src/`, so changing `biome.json` alone does not change the gate. The three `package.json` scripts have to change too. The backlog rule from round 0 allows this ("B freezes the whole package.json per round unless a task lists scripts as owned"), and round 2 is the precedent. This round lists exactly three script values as owned.

### B probe (HEAD 2dfd7d6, Biome 2.4.4, `/tmp` copies only; `b-round-48/probe-steps.txt`, `probe-a-biome.json`, `probe-a-changed-files.txt`, `probe-a-check.log`)
| Config for `tests/**` | Errors from `biome check tests/` |
|---|---|
| today's rules (single quotes) | 65: 51 format, 12 organizeImports, 2 noUnusedImports; 0 lint warnings |
| **override `quoteStyle: "double"` (chosen)** | 50: 36 format, 12 organizeImports, 2 noUnusedImports |
| formatter off | 14: 12 organizeImports, 2 noUnusedImports |
| formatter + organizeImports off | 2: noUnusedImports |

- Chosen config, then `biome check --write tests/` → only the 2 `noUnusedImports` errors remain: `tests/main/file-system.test.ts` (`vi` in the `vitest` import) and `tests/main/templates.test.ts` (`readdirSync`, `writeFileSync` in the `node:fs` import).
- After removing them: `biome check src/ tests/` → `Checked 85 files`, **0 errors, 8 warnings** (the same 8 `src/` warnings as today).
- In that copy, fixtures + `tsc -p tsconfig.test.json` + `npm test` → EXIT 0 (22 renderer and 15 main files passed).
- **37 test files change** (1142 diff lines: line wrapping, import order, parentheses around `await … as`).

### What "relaxed override" means here (B's reading, D-52)
- Tests keep their **double quotes**. All 51 test files already use them; switching to single quotes would rewrite every string in every file for no gain. That is the relaxation.
- Every other rule is the same as for `src/`: lint rules, `organizeImports`, semicolons, trailing commas, indent, line width 100. CLAUDE.md rule 2 says "semicolons everywhere", and only the formatter enforces it.
- **Not chosen (stated so Saba can overrule):** formatter off for `tests/**`. That would touch 14 files instead of 37, but semicolons and formatting in tests would stay unchecked.

## Reference
Exempt. This is a tooling and config round with no UX or app behaviour change. Biome's own docs on `files.includes` and `overrides` (https://biomejs.dev/reference/configuration/#overrides) are the only reference. B checked the behaviour by running Biome 2.4.4 (table above).

## Deviations / limits (stated, not hidden)
1. **Tests use double quotes, `src/` uses single quotes** (the D-52 override). The quote-style signals RR-R3-04, RR-R5-05, RR-R6-03, RR-R8-02, RR-R12-03 and RR-R37-02 will be closed at the round-49 close on C's evidence, by D-52 rather than by rewriting quotes. They stay open until then.
2. **One Bash write into the repository is sanctioned** (process rule C-R46-01 otherwise holds): `npx biome check --write tests/`, run exactly once, with no `--unsafe`. Hand-reformatting 37 files with Edit would be error-prone. C reproduces it byte for byte (R49-2).
3. **RR-R14-03 predicted** that `create-fixtures.ts`'s empty `catch {}` would trip `noEmptyBlockStatements`. With the recommended set in Biome 2.4.4 it does not fire (0 lint errors besides the 2 imports). C reports what it observes.
4. **No red test in the usual sense.** This is a gate change, so the red/green evidence is a blind-gate contrast (R49-3): an injected defect passes 2dfd7d6's `npm run lint` and fails A's.

## Baseline
- HEAD `2dfd7d6edfc66640336d19e49d74b233226da6f7`, clean working tree (`git status --porcelain --untracked-files=all` empty; generated `tests/fixtures/*.wav` are gitignored).
  - Exception (release-commit rule): a root `chore(release): vX.Y.Z` commit directly on 2dfd7d6 that changes only the two `version` fields counts as the baseline.
  - If HEAD differs or the tree is dirty, **stop and report**.
- **Frozen:** every path not in the ownership table stays byte-identical to 2dfd7d6. That explicitly includes:
  - all of `src/**`;
  - `package-lock.json` and every `package.json` key except the three script values below;
  - `tsconfig*.json`, `vitest.config.*.ts`, `playwright.config.ts`, `electron.vite.config.ts`;
  - `.github/**` (check.yml already runs `npm run check`), `docs/**`, `CLAUDE.md`, and every `.claude/**` file except `BIOME_LINTING.md`;
  - `tests/fixtures/*.wav` (generated, not tracked).
- **Protected (never touch):** `package-lock.json`, `.github/workflows/release.yml`, `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `.claude/settings*`, `.claude/hooks/**`. `package.json` is protected **except** the three owned script values.

## Scope

**Order matters.** Steps 1 and 2 must be done before step 3. If `biome check --write` runs before the override exists, it rewrites every test string to single quotes.

### Step 1. `biome.json` (Edit tool)
- `files.includes` → `["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx"]`.
- Add a top-level `overrides` array with one entry and nothing else in it:
  ```json
  "overrides": [
    {
      "includes": ["tests/**"],
      "javascript": { "formatter": { "quoteStyle": "double" } }
    }
  ]
  ```
- No other key changes (rules, formatter, assist and `$schema` stay as they are).

### Step 2. `package.json` scripts (Edit tool; exactly three values)
- `"lint": "biome check src/ tests/"`
- `"lint:fix": "biome check --write src/ tests/"`
- `"check": "biome check src/ tests/ && npm run typecheck && npm run test"`

### Step 3. Mechanical format of `tests/` (the one sanctioned Bash write)
- Run `npx biome check --write tests/` **once**, from the repository root, with no `--unsafe` and no other flags. Save its full output to `a-round-49/biome-write.log` (the log goes to the loop folder, not the repository).
- Expected: about 37 files fixed and exactly 2 remaining errors, both `lint/correctness/noUnusedImports` (in `file-system.test.ts` and `templates.test.ts`).
- **Stop rule:** if anything else remains (another rule, another file, a parse error), **stop and report**. Do not hand-fix it.

### Step 4. Two unused imports (Edit tool)
- `tests/main/file-system.test.ts`: remove `vi` from the `vitest` import → `import { afterAll, beforeAll, describe, expect, it } from "vitest";`
- `tests/main/templates.test.ts`: remove `readdirSync` and `writeFileSync` → `import { mkdirSync, rmSync } from "node:fs";`
- Nothing else in these two files changes by hand.

### Step 5. Primitive `.claude/primitives/BIOME_LINTING.md` (Edit tool; standing `.claude/**` permission)
- In `## ბრძანებები`: say that `npm run lint` / `lint:fix` / `check` run on `src/` and `tests/`.
- Under the `Formatter:` line, add one Georgian line: `tests/**`-ში იგივე წესებია, ოღონდ ორმაგი ბრჭყალებით (`biome.json` override, D-52).

### Not in this round
- Any change to `src/**`, test logic, test names or assertions. Only Biome's own rewrite (step 3) and the two import edits (step 4) touch `tests/`.
- Moving test helpers (RR-R48-01, RR-R17-02), RR-R48-02, the `clickButton` helper (RR-R36-05).
- Pinning Biome or tsx versions (RR-R3-05; `package.json` deps stay frozen).
- Q7 / TM-T2-DATA / TM-T2 (waiting on Saba), Q9–Q26.

**Process:**
- Every repository write goes through the Edit/Write tools, **except** the single step-3 command. No `sed -i`, no shell redirection into the repository, no `tee`, no other script that writes into the repository. `a-round-49.md` states this and quotes the step-3 command and its "Fixed N files" line.
- Before the first edit, read `.claude/primitives/BIOME_LINTING.md`, `TESTING.md`, `SEMICOLONS.md` and `AGENT_DISCOVERABLE_CODE.md`.
- More than 3 files change, so run the `code-reviewer` subagent (read-only) on the `biome.json`, `package.json` and primitive diffs plus a sample of the reformatted tests. Record its findings in `a-round-49.md`.
- **Stop rule:** if any test fails after step 4, **stop and report** its name and output. Do not edit the test to make it pass.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `biome.json` | Step 1: `files.includes` + `overrides` |
| `package.json` — **only** `scripts.lint`, `scripts.lint:fix`, `scripts.check` | Step 2 |
| `tests/**/*.ts` — **only** as rewritten by the step-3 command, plus the two step-4 import edits | Steps 3–4 (B's probe: 37 files, listed in `b-round-48/probe-a-changed-files.txt`) |
| `.claude/primitives/BIOME_LINTING.md` | Step 5 |

In the loop folder, A writes only `a-round-49.md` (plus `a-round-49/` logs). C writes `c-round-49.md`/`.json` and evidence under `c-round-49/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R49-1 ownership | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all`; `git diff --stat 2dfd7d6`; `git diff 2dfd7d6 -- package.json biome.json`; `git diff --quiet 2dfd7d6 -- src package-lock.json .github docs CLAUDE.md tsconfig.json tsconfig.node.json tsconfig.web.json tsconfig.test.json vitest.config.main.ts vitest.config.renderer.ts playwright.config.ts electron.vite.config.ts .claude/settings.json .claude/hooks`; list of changed `.claude/**` paths | HEAD is 2dfd7d6 (or the release exception). No untracked files. Changed paths ⊆ ownership table. The `package.json` diff is exactly the three script lines. The `biome.json` diff is exactly `files.includes` + the one override. **`src/` unchanged.** |
| R49-2 tests/ change is mechanical | Temp copy of 2dfd7d6 (outside the repo, `node_modules` symlinked) + A's `biome.json` → `npx biome check --write tests/`, then `npx biome check --write --unsafe tests/main/file-system.test.ts tests/main/templates.test.ts` → `diff -r` of that `tests/` against A's `tests/` (`.ts` files) | **No difference.** Any difference is a FAIL (a non-mechanical edit). C also records the changed-file count and compares it with B's 37-file list. |
| R49-3 the gate now sees tests/ (blind-gate contrast) | In temp copies of 2dfd7d6 and of A's tree, inject one defect at a time and run `npm run lint`: **D1** an unused `import { createHash } from "node:crypto";` as the first line of `tests/main/schema.test.ts` (no other import from `node:crypto` in that file, and the line sorts first); **D2** a missing semicolon on one statement in `tests/renderer/utils/utils.test.ts`; **D3** a plain single-quoted string (no `"` inside it) in a test file; **D4** a double-quoted string in `src/renderer/src/lib/utils.ts` (control) | 2dfd7d6: D1, D2, D3 exit 0 (blind); D4 fails. A's tree: D1 fails and its diagnostics include `noUnusedImports`; D2 and D3 fail with a format diagnostic; D4 fails. Extra diagnostics next to the expected one are reported, not a FAIL. Logs in `c-round-49/`. |
| R49-4 gate | Clean `verifyCommand` `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }`, then `xvfb-run -a npx playwright test --retries=0` once; read `package.json` `typecheck` | Exit 0. Biome `Checked 85 files`, **0 errors, 8 warnings**, and the 8 are the same `src/` warnings as 2dfd7d6. Renderer **326/326**, main **135/135**, E2E **7/7** with no retry (same counts as round 48; no test added or lost). `typecheck` still runs `tsc --noEmit -p tsconfig.test.json` (closes the stale half of TM-B06's title). |
| R49-5 fixtures unchanged | Run `tests/fixtures/create-fixtures.ts` (reformatted) and the 2dfd7d6 version into two temp folders | `sample.wav` and `corrupt.wav` sha256 are identical between the two, and match the pins in `create-fixtures.test.ts`. |
| R49-6 real app unchanged | `npm run build` on A's tree and on a 2dfd7d6 copy, compare `out/` file hashes. Then launch A's build via Playwright `_electron` under `xvfb-run` (`--no-sandbox`, temp `XDG_CONFIG_HOME`), open a temp folder holding a copy of `sample.wav` and one ffmpeg sine WAV, select the sine WAV, set Title `R49`, Save Tags | `out/` is identical; if not, C names the differing files and shows they do not come from `src/`. Toast `Tags saved`. ffprobe `format_tags` and music-metadata both show title `R49`. The other file is byte-identical. Screenshot. `pageErrors` empty. |
| R49-7 docs | Read the `BIOME_LINTING.md` diff | Commands say `src/` and `tests/`. One Georgian line names the `tests/**` double-quote override and D-52. Nothing else in the file changes. |

`build:win` / `build:mac` stay BLOCKED ("Windows packaging is not available in the cloud"). That is not a FAIL.

## What could break (C re-checks)
- **Import reordering** in 12 files. Vitest hoists `vi.mock` whatever the import order, and `tests/renderer/setup.ts` is loaded via `setupFiles`, not by import. The full Vitest and E2E counts (R49-4) catch any order dependency.
- **E2E helpers** (`tests/e2e/electron-launch.ts`, `electron-launch-failure.ts`) are reformatted. E2E 7/7 with `--retries=0` and `tests/main/electron-launch-failure.test.ts` cover them.
- **`tests/fixtures/create-fixtures.ts`** runs through `tsx` in `verifyCommand` and in check.yml. R49-5 checks its output bytes.
- **`tests/contract/check-ffprobe-tags.ts`** runs in check.yml's "Tag contract ffprobe cross-check" step. C runs `npx --yes tsx@4 tests/contract/check-ffprobe-tags.ts test-results/recording-tag-contract/contract.wav` after the E2E run, and it must exit 0.
- `npm run lint:fix` now also writes into `tests/`. That is intended (D-52).
- Biome warnings must not grow (8 → 8).

## Next (orientation only, Saba's order)
1. Saba's ordered list (Q2 → Q8 → Q4/Q1 → Q5 → Q3 → Q6) ends with this round.
2. **Q7 → TM-T2-DATA → TM-T2:** still waiting on Saba (UCS list + licence).
3. **Open for Saba (non-blocking):** Q9–Q24 (UX), Q25 (Artists ↔ `IART`, now with RR-R48-03's migration note, C-R48-01 `TPE2` and A-R48-01 `LIST/MID`), Q26 (truncated `data` grows on save), C-R47-01. If they are still unanswered after round 49, B reports which scoped items remain and why.
