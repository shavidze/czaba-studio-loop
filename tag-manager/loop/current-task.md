# CURRENT TASK — Round 39: TM-B41 — test hygiene: `getButtonByText` semantics pinned and `g`/`y` RegExp rejected; D-44 order pin; empty-list Done pin; TESTING.md §6

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 38: C PASS** (R38-1…R38-6, realVerified=true). Root published `96f1e45`. The review returned COMMIT OK with 0 critical/high/medium findings. TM-B40 (D-45) is **done**. `96f1e45` is the baseline.
- **No critical, high or medium bug is open.** TM-B41 is next in dependency order (TM-B40 → TM-B41). It is a **test-only** round: no file under `src/` changes. It has three groups. All of them are test gaps or test-helper defects:
  1. **`getButtonByText` helper (`tests/renderer/helpers/dom-queries.ts`):**
     - **C-R36-01:** helper mutants HM-1 (the uniqueness throw is removed), HM-2 (string `===` becomes `includes`) and HM-3 (no `trim`) survive every suite. No test pins what the helper does.
     - **RR-R36-03 = R36-A-02: a real helper bug (B probe on `96f1e45`, `b-round-38-exp/gflag-probe.log`).** With a `g` or `y` RegExp, `.test()` moves `lastIndex`:
       - `getButtonByText(/Done/g)` returns `Done` on the first call, then throws `button /Done/g not found` on the second call with the same RegExp;
       - with two `Done` buttons, `/Done/g` returns one button instead of throwing. The uniqueness check is defeated. Plain `/Done/` throws `matched 2 buttons`, as it should;
       - `/Done/y` behaves the same as `g`.

       No caller uses `g` or `y` today (grep, C R36 probe). So it is latent, but it is a defect in the helper itself, not only a missing test.
  2. **Missing pins for decisions that already ship:**
     - **C-R37-01:** PM-6 (the pruned selection rebuilt in `files` order) survives. D-44's "existing order" clause is not pinned.
     - **C-R38-01:** CM-3 (Done `aria-disabled={isApplying}`, dropping `fields.length === 0`) survives. Nothing pins an empty-field-list Done as `aria-disabled="true"` (D-45).
     - **RR-R38-03:** (b1)'s name still says "is disabled", although round 38 changed it to check `aria-disabled`.
  3. **TESTING.md §6:**
     - **RR-R36-04:** "B-ის გაზომვით" names a loop agent. It becomes "measured on one runner".
     - **RR-R36-02:** a11y-name checks still use `getByRole`.
     - **B-R37-02:** jsdom does not model focus loss on native `disabled`.
     - One sentence records the helper's whole-string and `g`/`y` contract.
- **Reference-first rule: exempt.** This is a test-only and docs-only round with no change to visible behaviour (project rule "Reference first": pure fix, refactor, test-only and docs-only rounds are exempt). There is no Reference section, and C does not look for one.
- **Not in this round:**
  - **RR-R38-01 / RR-R38-04** (hover colour on an `aria-disabled` Button; middle arrows keep their hover inside the disabled fieldset). The fix would change `src/`, so it cannot go in a test-only round. They become new item **TM-B42** (low, todo), which starts with an old-vs-new real-app measurement.
  - **RR-R38-02** is recorded only (one caller; (f2) covers it).
  - **RR-R38-05** is an architecture signal.
  - **RR-R35-02** (timeout) stays an open **Saba question**. It is not dropped and not deferred.
  - **R36-A-01** (inner whitespace is not collapsed) is recorded and unreachable. Its semantics are not changed.
- **B's prototype on `96f1e45`** (`b-round-38-exp/`, throwaway copy from `git archive`):
  - `prototype.diff`: the full diff for all 7 owned paths;
  - drafts `dom-queries.test.ts.txt` and `dom-queries.ts.txt`;
  - `red-run.log`: draft tests with the HEAD helper → **1 failed ((q4)) / 309 passed of 310**;
  - green runs: `green-run-1.log`, `green-run-2.log` → **310/310 in 21 files, twice**;
  - `tsc` (test and web) 0; Biome on `src/` 0 errors / 8 warnings;
  - `mutants.log` (`mut.py.txt`): HM-1…HM-5, PM-6, CM-3 and CM-8 are all killed (see R39-3).

## Baseline
- HEAD `96f1e45ff18fb23b77a348af90139a233f51f8e6`; working tree clean (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (project policy release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `96f1e45` that changes only the two `version` fields counts as the baseline.
- **Frozen (byte-identical to `96f1e45`):** every path not listed under File ownership. In particular:
  - **all of `src/**`**, which is what makes this round test-only;
  - every other test file, `tests/renderer/helpers/reset-stores.ts`, `tests/renderer/helpers/window-api-mocks.ts`, `tests/renderer/setup.ts`, `tests/e2e/**`, `tests/main/**`, `tests/fixtures/**`;
  - every `docs/**` file except `docs/bugs/001-save-and-selection-known-limits.md`, and in that file every line except 279, 310 and 328. `docs/bugs/README.md` does not change: no new entry, and the counts stay 21/12/5;
  - every `.claude/**` file except `.claude/primitives/TESTING.md`, and in that file every section except §6;
  - `vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, `tsconfig*.json`, `electron.vite.config.ts`, `.github/**`.
- **Protected (never touch):** `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope
All test code follows the sibling suites' style: double quotes, semicolons, no comments, no `any`, no `{ timeout }`. A copies B's drafts as they are (C compares byte for byte, see R39-1). The canonical text of every change is `b-round-38-exp/prototype.diff`. Apply it as is with `patch -p1 < <loop>/b-round-38-exp/prototype.diff` from the repository root. `-p1` removes the `b39head/` and `b39/` prefixes; do not strip them by hand. B dry-ran this on a fresh `git archive` of `96f1e45`, and all 7 files applied. Copying the drafts also works.

### 1. Tests first (test-on-bugfix for the helper bug)
**1a. New file `tests/renderer/helpers/dom-queries.test.ts`** = `b-round-38-exp/dom-queries.test.ts.txt`, byte for byte. It has one describe block, `getButtonByText (TM-B41)`, with four tests:
- **(q1) C-R36-01 HM-1:** two buttons with the same text throw instead of returning the first. Both the string `"Done"` and `/^Done$/` must throw `matched 2 buttons`.
- **(q2) C-R36-01 HM-2:** a string matches the whole button text, not a part of it. `"Save"` throws `button Save not found`; `"Save Tags"` returns the first button.
- **(q3) C-R36-01 HM-3:** leading and trailing whitespace of the button text is ignored. A `<div>Done</div>` sits next to `<button>\n  Done  \n</button>`; `"Done"` and `/^Done$/` both return the button.
- **(q4) RR-R36-03:** a RegExp with the `g` or `y` flag is rejected, because `lastIndex` would carry over between buttons and calls. Both `/Done/g` and `/Done/y` throw `button /Done/<flag>: g and y flags are not supported`.

The file uses `document.body.innerHTML` and clears it in `afterEach`. It needs no `vi.hoisted` window swap: `document` is jsdom's global. B ran it this way.

**Red first:** run the new file against the **HEAD** helper, before you change `dom-queries.ts`. (q4) must fail with `expected [Function] to throw an error`, and (q1)–(q3) must pass, because they pin today's semantics. Record this in `a-round-39.md`. Full renderer suite: 1 failed / 309 passed of 310 once 1b is in.

**1b. Pins added to existing files**, appended at the end of their describe blocks. Nothing else in these files changes:
- **`tests/renderer/components/selection-after-folder-switch.test.ts`:** after (x7), add
  `(x8) C-R37-01: setFiles keeps the remaining selectedPaths in their existing order, not in files order`.
  - Seed: `files: [ENTRY_A, ENTRY_A2, ENTRY_A3]`, `selectedPaths: [PATH_A3, PATH_B, PATH_A]`.
  - Call `setFiles([ENTRY_A, ENTRY_A2, ENTRY_A3])`.
  - Expect `selectedPaths` to equal `[PATH_A3, PATH_A]`. `PATH_B` is pruned, so the rebuild path runs; PM-6 would give `[PATH_A, PATH_A3]`.
- **`tests/renderer/components/busy-buttons-focus.test.ts`:** after (f8), add
  `(f9) C-R38-01: with an empty field list Done is aria-disabled, not busy, keeps focus, and a click runs no onSave`.
  - Set `useSchemaStore.setState({ fields: [] })`, render a standalone `SchemaEditor`, then `focusAndClick(Done)`.
  - Expect: text `Done`; no `disabled` attribute; `aria-disabled="true"`; `aria-busy="false"`; `activeElement` is Done; `onSave` and `onClose` are not called.
- **`tests/renderer/components/schema-editor-done-busy.test.ts`, line 155, rename only (RR-R38-03):**
  - old: `… reads Applying... and is disabled, the editing controls …`
  - new: `… reads Applying... and is aria-disabled, the editing controls …`
  - The test body does not change.

(x8) and (f9) are **pins**. They pass on HEAD `src/`, which is correct, because the behaviour already ships. Their red signal is a mutant (R39-3), not HEAD.

### 2. Helper fix: `tests/renderer/helpers/dom-queries.ts` = `b-round-38-exp/dom-queries.ts.txt`
Three lines are inserted at the top of `getButtonByText`, before `matches` is computed:
```ts
  if (typeof name !== "string" && (name.global || name.sticky)) {
    throw new Error(`button ${String(name)}: g and y flags are not supported`);
  }
```
- `matchesButtonName`, the export and the other two error messages are unchanged.
- **Chosen:** reject `g`/`y`. It is stateless, and a caller learns about the problem at once.
- **Rejected:** resetting `lastIndex` before each `.test()`. It would silently mutate the caller's RegExp and needs a second rule to explain.
- No D-ID: this is test infrastructure, not product behaviour.

### 3. TESTING.md §6 (`.claude/primitives/TESTING.md`; Edit tool, path (b); only §6 changes)
Exactly the §6 hunk of `prototype.diff`:
- **RR-R36-04:** `ეს ძვირია. B-ის გაზომვით ერთ runner-ზე ერთი ფაილი` → `ეს ძვირია. ერთ runner-ზე გაზომილი: ერთი ფაილი`.
- **New line** after the "ზუსტად ერთ დამთხვევას" line. It says that a string must match the whole trimmed `textContent`, that a `g`/`y` RegExp throws because `lastIndex` carries over, and that `dom-queries.test.ts` pins this.
- **RR-R36-02, new line** after the `getByTitle` line: the helper ignores visibility and `aria-label`, so a test that checks an accessible name uses `screen.getByRole("button", { name })`.
- **B-R37-02, new line:** jsdom keeps `document.activeElement` on a focused button that becomes natively `disabled`. Only the real app (Playwright `_electron`) proves a focus bug; a unit test checks the attribute and the click guard.
- The last line, `სინელის დასამალად test timeout-ს არ ვზრდით.`, stays last.

Use the Edit tool. Never write `.claude/**` through Bash. If Edit is refused, stop and report BLOCKED for this item only. Do not work around the refusal.

### 4. docs/bugs/001 test-name index (only lines 279, 310, 328)
- **Line 279 (entry 18):** the (b1) name is updated to match §1b.
- **Line 310 (entry 20):** after the (x7) name, append ``, `(x8) C-R37-01: setFiles keeps the remaining selectedPaths in their existing order, not in files order` (round 39, TM-B41)``.
- **Line 328 (entry 21):** after the (f8) name, append ``, `(f9) C-R38-01: with an empty field list Done is aria-disabled, not busy, keeps focus, and a click runs no onSave` (round 39, TM-B41)`` before `. 12 assertion`.
- `docs/bugs/README.md` does not change.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/helpers/dom-queries.test.ts` (new) | §1a |
| `tests/renderer/helpers/dom-queries.ts` | §2, three inserted lines |
| `tests/renderer/components/selection-after-folder-switch.test.ts` | §1b (x8), appended only |
| `tests/renderer/components/busy-buttons-focus.test.ts` | §1b (f9), appended only |
| `tests/renderer/components/schema-editor-done-busy.test.ts` | §1b, line 155 name only |
| `.claude/primitives/TESTING.md` | §3, §6 only |
| `docs/bugs/001-save-and-selection-known-limits.md` | §4, lines 279/310/328 only |

A also writes `a-round-39.md` (and any `a-round-39/` logs) in the loop folder. Gitignored output is allowed: `out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`, `coverage/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R39-1 ownership | <ul><li>`git diff --quiet 96f1e45 -- src/` **first**;</li><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 96f1e45`;</li><li>`git diff --quiet 96f1e45 -- . ':!<7 owned paths>'`.</li></ul>Read the full diff and compare it with `b-round-38-exp/prototype.diff`. | <ul><li>`src/` exit 0.</li><li>Only owned paths changed; the only untracked file is `dom-queries.test.ts`.</li><li>`dom-queries.test.ts` and `dom-queries.ts` are `cmp`-identical to B's drafts.</li><li>The hunks of the other 5 files equal `prototype.diff` (C diffs the `+`/`-` lines).</li><li>TESTING.md: only §6 changes; `.claude/settings*` / `hooks/**` untouched; A reports the Edit tool, no Bash write.</li><li>docs/bugs/001: only lines 279/310/328 differ (`diff <(git show 96f1e45:…) …`); README unchanged.</li><li>No comment, no `any`, no `{ timeout }`.</li></ul> |
| R39-2 red → green | <ul><li>In a throwaway copy, run A's tests with the HEAD `dom-queries.ts`.</li><li>Then run A's tree.</li><li>Then each changed test file alone.</li></ul> | <ul><li>**Red:** only (q4) fails (`expected [Function] to throw an error`); **1 failed / 309 passed of 310**; no other failure.</li><li>**Green:** renderer **310/310 in 21 files, twice**.</li><li>Each changed file alone is green; each new test < 1.5 s.</li></ul> |
| R39-3 mutants | On copies of A's tree, run `b-round-38-exp/mut.py.txt`, plus C's own mutants. The third column of B's `mutants.log` is noise: the regex picked up the `Failed Tests` rule line. The killed-by column is the evidence. | <ul><li>Killed at least by: HM-1 (q1), HM-2 (q2), HM-3 (q3), HM-4 (`g`/`y` guard removed = HEAD helper) (q4), HM-5 (only `g` rejected) (q4), PM-6 (x8), CM-3 (f9), CM-8 (Done guard without `fields.length === 0`) (f9).</li><li>A survivor is acceptable only with C's equivalence argument, recorded as a low finding.</li><li>The copy is restored afterwards (`diff -r` empty).</li></ul> |
| R39-4 gate (real Electron) | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-35/biome-new.txt`.</li><li>Typecheck node/web/test 0.</li><li>Renderer **310**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R39-5 docs | Read `git diff 96f1e45 -- .claude/ docs/`. | <ul><li>Georgian with English technical terms.</li><li>TESTING.md §6 holds the four changes in §3; no agent name is left in §6; the last line is unchanged.</li><li>Each of the 4 new or renamed test names has exactly 1 match in its test file. The (x8), (f9) and new (b1) names each have 1 match in docs/bugs/001; the old (b1) name has 0.</li><li>TESTING.md §6 states the three rules the helper enforces: whole trimmed string, 0 or >1 matches throw, `g`/`y` throws. C reads both files.</li></ul> |

## What could break (C re-checks)
- **Every component suite** goes through `getButtonByText`. The new guard must not reject any existing call: no caller passes `g` or `y`. 310/310 proves this. C also greps `tests/` for RegExp literals with `g`/`y` flags passed to `getButtonByText` or `clickButton`. The expected result is none.
- **(x8)** must not change (x6)/(x7) results. It seeds the store directly and does not render.
- **(f9)** sets `useSchemaStore` fields to `[]`. `resetAllStores` in `beforeEach` restores `STANDARD_FIELDS`, so no state leaks to the next test. C runs the file alone and in the full suite.
- **E2E** does not use the helper (`tests/e2e` has no import of `dom-queries`); 7/7 is a regression guard.

## What realVerified means here
- `src/` is byte-identical to `96f1e45` (R39-1), so the built app is the one C verified in the real app in round 38 (R38-4). This round's real checks are:
  - the tests themselves, run red/green with mutants (R39-2, R39-3);
  - the gate's real Electron E2E under xvfb (R39-4).

  No new UI scenario is required, because no behaviour changes. No file is saved, so ffprobe and music-metadata do not apply.
- B's red/green numbers are a hypothesis until C reproduces them (R39-2).
- PASS on all five closes:
  - TM-B41;
  - findings C-R36-01, RR-R36-02, RR-R36-03, R36-A-02, RR-R36-04, C-R37-01, B-R37-02, C-R38-01, RR-R38-03.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 40 fixes it first.
- Otherwise round 40 is **TM-B42** (RR-R38-01, RR-R38-04). It starts with C/B measuring the computed hover background of a busy and a clean Save Tags in `ea4a1cb` (native `disabled`) vs `96f1e45` (`aria-disabled`). It is a fix only if they differ, and as a UX change it needs Reference + Deviations.
- After that, the remaining items need Saba or root:
  - Saba's question batch (`b-round-23.md` §5; B-R36-01 list lock during a scan; RR-R35-02 timeout);
  - TM-T2 / TM-T2-DATA (UCS list and its licence);
  - root's Actions link for TM-T0-CI / TM-B14.
