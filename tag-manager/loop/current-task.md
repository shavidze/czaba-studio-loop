# CURRENT TASK — Round 36: TM-B38 — renderer component test speed and hygiene (shared `getButtonByText`, (e5) rename, pins (b7)/(b8), D-40/D-41 docs wording, TESTING.md rule 6)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 35: C PASS** (R35-1…R35-6, realVerified=true). TM-B37 (D-42, D-43) is **done**. Root published `46bd74b`; the review returned COMMIT OK with 0 critical/high/medium findings. `46bd74b` is the baseline.
- **No critical, high or medium bug is open.** TM-B38 (low, test-only) is next in dependency order (TM-B37 → TM-B38 → TM-B39). It is one hygiene item with no behaviour change, and it carries five findings, all in test files and test docs:
  - C-R34-02 / B-R34-02: component tests run close to the 5 s default timeout;
  - C-R34-03: the (e5) name is wrong;
  - C-R35-03: BM-6 and the DM-9 shape are pinned only by C's probes;
  - C-R35-02: two docs phrases went stale after D-43.

  Nothing else joins this round. No code from TM-B39, TM-B40 or `src/` belongs here.
- **B's measurement on `46bd74b`** (`b-round-35-exp/`; `durations.py` prints per-file sums from `vitest --reporter=json`). Two baseline runs, both 287/287:

  | File | Baseline (2 runs) | Prototype |
  |---|---|---|
  | `schema-change-during-folder-load` | 23.1 / 22.1 s (slowest test 4.05 s) | 1.9 s (slowest test 0.5 s) |
  | `metadata-panel-schema-change` | 21.2 / 24.4 s | 1.7–2.0 s |
  | `schema-editor-stale-close` | 14.8 / 14.3 s (slowest test 3.9 s) | 1.0–1.6 s |
  | `reread-after-folder-switch` | 10.1 / 9.5 s | 1.2 s |
  | `schema-editor` | 4.4 s | 0.5 s |
  | Slowest test, all files | 4.05 s | **0.61 s** |

  - The prototype (`proto/prototype.diff.txt`) passed 287/287 three times, then **289/289** with (b7)/(b8) (`proto-run4.json`).
  - `tsc -p tsconfig.test.json` is clean.
  - This confirms the round 34 hypothesis: `screen.getByRole("button", { name })` computes accessible names for the whole tree, and that is the cost.
- **Pins for C-R35-03.** B checked them in throwaway copies:
  - (b7) = C's probe (k1). Red on `3035ffc` src with `expected 'STALE1' to be 'B'`; green on `46bd74b`.
  - (b8) = C's probe (k2). Red on the BM-6 mutant; green on `46bd74b`.
  - With the migrated `schema-editor-done-busy.test.ts` on `3035ffc` src, (b1), (b2) and (b5) still fail on the same symptoms as round 35, and (b4) still gives the Unhandled Rejection. Migrating that file keeps its red evidence.
- **Reference-first: exempt.** This is a test-only and docs round; no visible behaviour changes.
- **Signals and new items, not tasks this round:**
  - RR-R35-05 (a store-level schema-read id / `isApplyingSchema`) is recorded as a signal.
  - New item **TM-B40** (todo, UX, after TM-B39) collects four findings:
    - RR-R35-01: focus is lost on Done / Save Tags;
    - RR-R35-04: (b2) can't fail on its own;
    - C-R35-01: the arrows are double-dimmed;
    - RR-R35-02 (optional): a timeout for an `onSave` that never settles.
  - RR-R35-03 is "by design, do not fix".

## Baseline
- HEAD `46bd74b4f8d18121e981038c9b8a0659070f017e`; working tree clean. If HEAD differs, stop and report. The one exception is the release-commit rule in the project policy: a root `chore(release)` commit that changes only the two `version` fields counts as the baseline.
- **Frozen (byte-identical to `46bd74b`):**
  - everything under `src/`;
  - `tests/renderer/setup.ts`, `tests/renderer/helpers/reset-stores.ts`, `tests/renderer/helpers/window-api-mocks.ts`;
  - `tests/renderer/stores/**`, `tests/renderer/utils/**`, `tests/main/**`, `tests/e2e/**`, and the tracked files in `tests/fixtures/**`;
  - `docs/bugs/README.md` and every other `docs/**` file except `docs/bugs/001-…`;
  - `package.json`, `package-lock.json`, `vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, `tsconfig*.json`, `electron.vite.config.ts`, `.github/**`;
  - every `.claude/**` file except `.claude/primitives/TESTING.md`.
- **Protected (never touch):** `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope

### 1. Shared helper: new file `tests/renderer/helpers/dom-queries.ts`
Export exactly one function, as in `b-round-35-exp/proto/dom-queries.ts.txt`:
```ts
export function getButtonByText(name: string | RegExp): HTMLButtonElement
```
- **Candidates:** `document.querySelectorAll("button")`. A button's text is `(button.textContent ?? "").trim()`.
- **Matching:** a `string` name needs exact equality; a `RegExp` name matches when `name.test(text)` is true.
- **Errors:** it throws `button <name> not found` on 0 matches and `button <name> matched <n> buttons` on more than 1. This keeps the uniqueness `getByRole` gave. Do not return the first match.
- **Style:** one private, non-exported matcher function is allowed. No comments. Use semicolons and double quotes, as the existing test files do. No `any`.
- **Why this is equivalent here:** no `<button>` in `src/renderer/src` has an `aria-label` or `title` (B grep), so a button's accessible name is its text content. The Customize Fields icon button is found with `getByTitle`, and that lookup stays.

### 2. Migrate every `screen.getByRole("button", …)` in `tests/renderer/components/`
There are 24 call sites in 10 files:

| File | Call sites |
|---|---|
| `file-list.test.ts` | 2 |
| `folder-read-during-save.test.ts` | 2 |
| `folder-read-overlap.test.ts` | 1 |
| `folder-read-rejected-chunk.test.ts` | 2 |
| `metadata-panel-batch-save.test.ts` | 7 |
| `metadata-panel-schema-change.test.ts` | 3 |
| `reread-after-folder-switch.test.ts` | 2 |
| `schema-change-during-folder-load.test.ts` | 2 |
| `schema-editor-stale-close.test.ts` | 1 |
| `schema-editor.test.ts` | 2 |

**Rules:**
- **The replacement:** `screen.getByRole("button", { name: X })` becomes `getButtonByText(X)` with the same `X`, whether `X` is a string, a RegExp or a variable. `screen.getByRole("button", { name })` becomes `getButtonByText(name)`.
- **The import:** add `import { getButtonByText } from "../helpers/dom-queries";` in sorted position among the relative `../helpers/` imports. The prototype put it at the top of the file; that was a sed artefact, so don't copy it.
- **`screen`:** remove it from an import only if it becomes unused. `tsc -p tsconfig.test.json` must stay clean.
- **Nothing else changes in these files:** no assertion, no timing, no `waitMs`, no `act`, no test name. The one exception is (e5) in §3.
- **`schema-editor-done-busy.test.ts`:**
  - Delete its local `buttonByText` and use `getButtonByText` everywhere. `b-round-35-exp/proto/schema-editor-done-busy.test.ts.txt` shows the result.
  - The shared helper trims and requires a unique match; the local one did neither. Run this file on its own and report the result.
  - If any existing (b1)–(b6) lookup now matches 0 buttons or more than 1, stop and report. Do not loosen the helper.
- **Lookups that stay:** `getByText`, `getByPlaceholderText`, `getByTitle` and `within(...)`. They are not the measured cost and are out of scope.
- **Timeouts:** no test timeout may be added or raised. No `{ timeout }`, no `testTimeout`, no `vi.setConfig`.

### 3. Rename (e5) (C-R34-03)
- **Old name**, in `schema-editor-stale-close.test.ts`: `(e5) pin: Done during a pending Open Folder, Back, not reopened: the re-read still applies and the panel stays on the form`.
- **New name:** **`(e5) pin: Done during a pending Open Folder, Back, not reopened: the re-read still applies and the editor stays closed`**.
- **Why:** the body asserts that the editor is closed (`fieldNameInput()` is null), plus the store's `files`/`metadata` and that there is no toast. Open Folder clears the selection, so "stays on the form" was wrong. The new name describes only what is asserted. The body does not change.
- **Docs:** change the same name in `docs/bugs/001-save-and-selection-known-limits.md`, in entry 17's test list (currently line 260).

### 4. Pins (b7)/(b8) for C-R35-03: append to `schema-editor-done-busy.test.ts`
Put them inside its `describe`, after (b6). Take the bodies from C's (k1)/(k2) in `c-round-35/c-probes.test.ts.txt`, with `buttonByText` → `getButtonByText`, exactly as in B's prototype file. Names:
- `(b7) pin for C-R35-03 (DM-9): two Done calls both waiting on the same pending Open Folder, re-reads land #2 first then #1: store keeps #2`
- `(b8) pin for C-R35-03 (BM-6): standalone SchemaEditor with a no-op onClose returns to Done after a resolved onSave`

These pin a test gap, not a bug, so both are **green on `46bd74b`**. The red evidence comes from older source and mutants:
- (b7) is red on `3035ffc` src and on mutant DM-8.
- (b8) is red on mutant BM-6.

### 5. Docs (Georgian, English technical terms)
**`docs/bugs/001-save-and-selection-known-limits.md`**: exactly these three text changes. Nothing else changes, and every `file:line` ref stays byte-identical because `src/` does not change.

| Change | Old | New |
|---|---|---|
| C-R35-02, D-40 bullet | `` `handleSchemaChanged` პირველივე ხაზზე `await waitForFolderLoadIdle();`-ს იძახებს (`:229`) `` | `` `handleSchemaChanged` D-43-ის ორი id ხაზის შემდეგ (`:227-228`) `await waitForFolderLoadIdle();`-ს იძახებს (`:229`) `` |
| C-R35-02, D-41 bullet | `ამიტომ pending re-read unmount-ის შემდეგაც ბოლომდე სრულდება და store-ში წერს. ჩანაწერი (17).` | ``ამიტომ pending re-read unmount-ის შემდეგაც ბოლომდე სრულდება და store-ში წერს, თუ მის შემდეგ ახალი `Done` არ დაწყებულა (D-43). ჩანაწერი (17).`` |
| (e5) name in entry 17 | old name from §3 | new name from §3 |

- Each "old" string occurs exactly once (B grep).
- Entry 18's test list does **not** get (b7)/(b8): they pin mutants, not a listed limit.
- `docs/bugs/README.md` stays unchanged (19 / 10 / 5).

**`.claude/primitives/TESTING.md`.** Standing permission, path (b): Edit tool only, no Bash write to `.claude/**`.
- **Where:** add `### 6. ღილაკის ძებნა component ტესტებში` directly after rule 5's code block and before `## Main Process ტესტის pattern`.
- **Content:** 3–6 lines of Georgian with English terms, saying that:
  - component suites use `getButtonByText` from `tests/renderer/helpers/dom-queries.ts`, not `screen.getByRole("button", …)`;
  - the reason is that `getByRole` computes accessible names for the whole tree. Give B's numbers from one runner: 23 s → 1.9 s per file, slowest test 4.05 s → 0.61 s;
  - the helper requires exactly one match;
  - test timeouts are not raised to hide slowness.
- Nothing else in the file changes. `.claude/primitives-map.json` stays unchanged.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/helpers/dom-queries.ts` (new) | §1 |
| `tests/renderer/components/file-list.test.ts` | §2 |
| `tests/renderer/components/folder-read-during-save.test.ts` | §2 |
| `tests/renderer/components/folder-read-overlap.test.ts` | §2 |
| `tests/renderer/components/folder-read-rejected-chunk.test.ts` | §2 |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | §2 |
| `tests/renderer/components/metadata-panel-schema-change.test.ts` | §2 |
| `tests/renderer/components/reread-after-folder-switch.test.ts` | §2 |
| `tests/renderer/components/schema-change-during-folder-load.test.ts` | §2 |
| `tests/renderer/components/schema-editor-stale-close.test.ts` | §2, §3 |
| `tests/renderer/components/schema-editor.test.ts` | §2 |
| `tests/renderer/components/schema-editor-done-busy.test.ts` | §2 (local helper removed), §4 (b7)/(b8) |
| `docs/bugs/001-save-and-selection-known-limits.md` | §5, three text changes |
| `.claude/primitives/TESTING.md` | §5, rule 6 |

A also writes `a-round-36.md` (and any `a-round-36/` logs) in the loop folder. Gitignored output is allowed: `out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`, `coverage/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R36-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 46bd74b`;</li><li>`git diff --quiet 46bd74b -- . ':!<14 owned paths>'`;</li><li>`git diff --quiet 46bd74b -- src/ package.json package-lock.json tsconfig*.json vitest.config.*.ts playwright.config.ts biome.json electron.vite.config.ts tests/e2e tests/main tests/renderer/setup.ts tests/renderer/helpers/reset-stores.ts tests/renderer/helpers/window-api-mocks.ts docs/bugs/README.md .claude/primitives-map.json`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; the only untracked file is `dom-queries.ts`.</li><li>Both `--quiet` checks exit 0.</li><li>`grep -rn 'getByRole("button"' tests/renderer` returns nothing.</li><li>`grep -rn "buttonByText" tests/renderer` finds only `getButtonByText`.</li><li>No `timeout` added anywhere in the diff.</li><li>No comment and no `any` in `dom-queries.ts`.</li><li>No Bash write to `.claude/**` or to repository files. If there is no transcript, record "unknown"; that is not a FAIL.</li></ul> |
| R36-2 assertions unchanged | For each of the 11 test files, run `git diff -w 46bd74b -- <file>`. | <ul><li>The only changed lines are:<ul><li>lookup expressions (`screen.getByRole("button", { name: X })` → `getButtonByText(X)`, with an identical `X`);</li><li>the import line(s);</li><li>the removed local `buttonByText` in done-busy;</li><li>the (e5) name;</li><li>the appended (b7)/(b8).</li></ul></li><li>No `expect(...)` line changed, except for the lookup inside it.</li><li>The test count per file is unchanged, except done-busy (6 → 8).</li><li>The (b7)/(b8) bodies match C's (k1)/(k2) apart from the helper name and the test name.</li></ul> |
| R36-3 helper semantics + mutants | In throwaway copies of A's tree outside the repository, run each case below once and record the exact edit.<br>**Known src mutants:**<ul><li>SM-1: `if (!isMountedRef.current) return;` after `await onSave` removed → (e1)(e2);</li><li>SM-2 → (e3);</li><li>DM-3, "loadId before wait" as in `c-round-34/mut.py` → (w8);</li><li>BM-1: `disabled={fields.length === 0}` → (b1)(b2);</li><li>DM-8: id guard removed → (b5)(b7);</li><li>BM-6: `setIsApplying(false);` before `onClose()` removed → (b8).</li></ul>**Red base:** `3035ffc`'s `SchemaEditor.tsx` + `MetadataPanel.tsx` with A's tests.<br>**Helper mutants:**<ul><li>HM-1: the `> 1` check removed, so the first match is returned;</li><li>HM-2: the string compare `===` → `includes`;</li><li>HM-3: `.trim()` removed.</li></ul> | <ul><li>Every listed src mutant is killed by the tests named for it.</li><li>The red base fails as listed: (b7) on `expected 'STALE1' to be 'B'`; (b1)(b2)(b5) on the round 35 symptoms; plus the (b4) Unhandled Rejection.</li><li>DM-9 is still green on (b7). It stays argued-equivalent; record it, not a FAIL.</li><li>For HM-1…HM-3, C records which tests fail.<ul><li>A survivor is acceptable only with C's argument that no current call site tells it apart. Record which; it is a low finding, not a FAIL.</li><li>Any test that passes on A's tree **only because** the helper picked the wrong button is a FAIL.</li></ul></li></ul> |
| R36-4 durations | Same runner, sequential runs, nothing else running.<ul><li>Run `npx vitest run --config vitest.config.renderer.ts --reporter=json --outputFile=…` twice on a copy at `46bd74b` ("before") and twice on A's tree ("after").</li><li>Summarise with `b-round-35-exp/durations.py`, plus a list of the slowest test per file.</li><li>Then run each component file alone once on A's tree.</li></ul> | <ul><li>After: **289/289** in 18 files, in both runs.</li><li>Every component test < **1.5 s** in both full runs. A test of 1.5–2 s is a low finding; > 2 s is a FAIL.</li><li>`schema-change-during-folder-load`, `metadata-panel-schema-change`, `schema-editor-stale-close` and `reread-after-folder-switch` are each at least **5×** faster (sum of test durations, mean of the 2 runs).</li><li>(b1)–(b8) are each < 1 s.</li><li>C lists before/after for all 11 component files.</li></ul> |
| R36-5 gate (includes the real-app run) | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-35/biome-new.txt`.</li><li>Typecheck 0, including `tsconfig.test.json`, which must pick up `dom-queries.ts`.</li><li>Renderer **289**, main **93/93**, E2E **7/7** (real Electron under xvfb).</li><li>`--retries=0`: **7/7**.</li></ul> |
| R36-6 docs | Read `git diff 46bd74b` of `docs/bugs/001-…` and of `.claude/primitives/TESTING.md`. | **`docs/bugs/001`:**<ul><li>The diff is exactly the three §5 changes. C greps:<ul><li>the new (e5) name: 1 match in the docs file and 1 in `schema-editor-stale-close.test.ts`;</li><li>the old (e5) name: 0 matches in both;</li><li>each new D-40/D-41 phrase: 1 match.</li></ul></li><li>Every `file:line` ref in the file is byte-identical to `46bd74b`: `git diff --word-diff` shows no ref change.</li><li>With `sed -n`, C checks that the D-40 phrase's refs point at the right lines of `MetadataPanel.tsx`: `:227-228` at the D-43 id lines, `:229` at `await waitForFolderLoadIdle();`.</li></ul>**TESTING.md:**<ul><li>Rule 6 sits between rule 5 and `## Main Process ტესტის pattern`.</li><li>It is in Georgian with English terms. It names the helper path, the unique-match rule and "no timeout raise", and gives the before/after numbers.</li><li>Nothing else in the file changed.</li></ul> |

## What could break (C re-checks)
- **A lookup now matches a different button than before.** The unique-match throw catches ambiguity, and R36-3 HM-1 shows whether any call site depends on it. Cases to watch:
  - an icon-only button whose empty text matches `""`;
  - `/Done/` vs `/^Done$/` while both a Done and an `Applying...` label exist;
  - `Save Tags` vs `Save to 2 files`.
- **A test relied on the slow lookup for its timing**, for example an `act` flush that happened by accident during the 1–2 s `getByRole`. Watch for a test that fails or flakes only after migration: run the full suite twice and each file alone (R36-4). A flake is a FAIL of the round; a timeout must not paper over it.
- **Existing assertions:** (e1)–(e5), (w1)–(w8), (s*), (b1)–(b6) and D-35 (r*)/(k*) all keep theirs. R36-2 checks the diff; R36-3 checks the mutants.
- **`schema-editor.test.ts`:** the reserved-ICAT tests and the `+ Category (UCS)` string match. An exact string must still match after `trim()`.
- **E2E:** untouched (`tests/e2e/**` is frozen), but it still runs in the gate.

## What realVerified means here
- `src/` and every runtime file are byte-identical to `46bd74b` (the R36-1 `git diff --quiet` checks). The app's behaviour therefore cannot have changed, and no old/new real-app comparison is needed this round.
- **Real-app evidence** is the gate's E2E: the built Electron app under `xvfb-run`, **7/7**, plus `--retries=0` 7/7 (R36-5). No harness, metadata readers or screenshots are required, because this round saves nothing.
- R36-1…R36-4 and R36-6 are real local runs.
- B's numbers in "Why this round" are a hypothesis until C measures them on its own runner (R36-4).
- PASS on all six closes TM-B38, C-R34-02, B-R34-02, C-R34-03, C-R35-02 and C-R35-03.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 37 fixes it first.
- Otherwise round 37 is **TM-B39** (C-R34-01, stale selection after a folder switch). It needs a red reproduction, a Reference section (Explorer / Mp3tag / Kid3 selection on folder change), and a decision between pruning and clearing the selection.
- Then **TM-B40**: focus-keeping busy buttons and arrow opacity, with its Reference taken from R35's R4/R5 sources.
- After that, the remaining items need Saba or root:
  - Saba's question batch (`b-round-23.md` §5);
  - TM-T2 / TM-T2-DATA, blocked on Saba's UCS list and its licence;
  - root's Actions link for TM-T0-CI / TM-B14.

  Otherwise B picks TM-B11 or TM-B05 prep.
