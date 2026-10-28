# CURRENT TASK — Round 38: TM-B40 — busy Done / Save Tags keep keyboard focus; reorder arrows not double-dimmed (D-45)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 37: C PASS** (R37-1…R37-6, realVerified=true). Root published `ea4a1cb`; the review returned COMMIT OK with 0 critical/high/medium findings. TM-B39 (D-44) is **done**. `ea4a1cb` is the baseline.
- **No critical, high or medium bug is open.** TM-B40 is next in dependency order (TM-B39 → TM-B40 → TM-B41). It holds three closely related low bugs in the same two commit buttons, which is the policy limit:
  1. **RR-R35-01 + RR-R35-04: focus is lost.** Done (`SchemaEditor.tsx:280`) and Save Tags / `Save to N files` (`MetadataPanel.tsx:373`) become natively `disabled` while they run. A focused button that becomes disabled drops keyboard focus to `<body>`, so a keyboard or screen-reader user must Tab back from the top of the page.
     - Save Tags also becomes natively disabled when the save completes (`!isDirty`), so focus is lost after **every** successful save.
     - Because React never fires `onClick` on a natively disabled button, (b2) cannot fail on its own (RR-R35-04). Neither `handleSave` guards against a click while busy.
  2. **C-R35-01: the arrows are almost invisible.** While Done is `Applying...`, the fieldset's `disabled:opacity-60` multiplies with the reorder arrows' own `disabled:opacity-30` (`SchemaEditor.tsx:186`, `:194`). The arrows end up at about 18 %. The fieldset's `disabled` also matches every arrow, so even arrows that are normally usable get their own dim.
  3. **RR-R36-01 (test only):** (b7)'s `reads[1].schema.some(qtwo)` cannot tell Done #1's read from Done #2's, because both read the schema when they run.
- **Docs follow-ups ride along** because this round edits `docs/bugs/001` anyway: C-R37-02 = A-R37-01 (the header was not updated for entry 20 / D-44) and RR-R37-01 (entry 20's line refs need function names).
- **Not in this round:**
  - **RR-R35-02** (a timeout for an `onSave` that never settles) is a product decision. It stays open as a **Saba question** (see `b-round-37.md` §4). It is not dropped and not marked deferred.
  - The `.claude/` TESTING.md note about jsdom and focus goes with TM-B41, which edits TESTING.md §6 anyway (B-R37-02).
- **B's red reproduction and prototype on `ea4a1cb`** (`b-round-37-exp/`):
  - Draft test file `busy-buttons-focus.test.ts.txt`, (f1)–(f8).
  - `red-run.log`: on HEAD src, (f1) and (f3)–(f8) fail on the symptom. (f2) is a pin and is green on HEAD, because native `disabled` swallows the click. The 12 migrated assertions (§1b) also fail on HEAD, because the attribute they now read is missing. In total: 30 failed / 274 passed of 304; 23 of the failures are existing tests that reach a migrated assertion.
  - `prototype-src.diff`: renderer **304/304 in 20 files, twice** (`green-run-1.log`, `green-run-2.log`); `tsc` web + test clean; Biome 0 errors / 8 warnings (`biome.txt`, same list).
  - `mutants.log` (`mut.py.txt`): GM-1…GM-11 are all killed; see R38-3.
  - **Measured fact (B probe):** in jsdom a focused button that becomes natively `disabled` **keeps** `document.activeElement`. jsdom does not drop focus. The unit tests therefore prove the attributes and the click guard. **Only the real app proves focus** (R38-4). The `activeElement` assertions in (f1) and (f3)–(f7) are pins for the new build, not the red signal.

## Decision D-45 (renderer only, `contract_with: none`)
Done and Save Tags / `Save to N files` signal "unavailable" with `aria-disabled` instead of native `disabled`. While they run, they also carry `aria-busy`. A click while unavailable does nothing.
- **Done** (`SchemaEditor.tsx`):
  - `aria-disabled={isApplying || fields.length === 0}` and `aria-busy={isApplying}` replace `disabled={…}` (lines 280–281).
  - `handleSave` returns at once when `isApplying` is true: `if (fields.length === 0 || isApplying) return;` (line 138). Its deps become `[fields, isApplying, onSave, onClose]` (line 149).
- **Save Tags / Save to N files** (`MetadataPanel.tsx`):
  - `aria-disabled={isSaving || !isDirty}` and `aria-busy={isSaving}` replace `disabled={…}` (lines 373–374).
  - `handleSave` returns at once when `isSaveBlocked()` is true (line 143). `isSaveBlocked()` is a private module-level function appended at the end of the file. It reads `useMetadataStore.getState()` (`isSaving || !isDirty`), so the guard sees the store synchronously and the `useCallback` deps do not change.
- **`Button`** (`ui/button.tsx`): one class line is added after the `disabled:` line: `'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed'`. It looks like the native disabled state. It has no effect on any Button without `aria-disabled="true"`; today no other Button sets it.
- **Reorder arrows:** each arrow keeps native `disabled` for its own edge (`index === 0` / last). Its class comes from a private function appended at the end of `SchemaEditor.tsx`:
  ```ts
  function reorderArrowClassName(isEdge: boolean): string {
    return cn('text-dim hover:text-foreground p-0.5', isEdge && 'opacity-30');
  }
  ```
  - The own dim follows the arrow's own reason, not the fieldset's `:disabled`. While Applying, a middle arrow is at the fieldset's 60 % and an edge arrow at 18 % (the same as before).
- **Unchanged:**
  - the fieldset (`disabled={isApplying}`, `disabled:opacity-60`);
  - Back;
  - the labels `Applying...` / `Saving...`;
  - every other control and Button;
  - D-41/D-42/D-43 flow, D-29/D-30/D-39 save flow, toasts.
- **Line stability:** both helpers are appended at the end of their files. Every existing `file:line` ref in `docs/bugs/001` up to `SchemaEditor.tsx:279` and `MetadataPanel.tsx:372` keeps its number.
- **Rejected alternatives:**
  - `aria-disabled` only while busy, native `disabled` when not dirty. Focus would still drop after every successful save.
  - A ref instead of state for the Done guard. It is equivalent here (GM-1 and GM-11 are killed either way), but it adds a line and shifts every D-41/D-42 ref.
  - Moving focus elsewhere after Done succeeds. That needs a focus-return design (B-R37-01 signal).

## Reference (reference-first rule: this changes visible keyboard / a11y behaviour)
Searched:
- desktop tag editors (Mp3tag, Kid3): native toolkits that do not expose this layer, and no statement about focus on a busy Save was found;
- W3C ARIA APG keyboard interface;
- MDN `aria-disabled`;
- round 35 R1–R5 (`tasks/round-35.md`).

| # | Source | What it says | Kind |
|---|---|---|---|
| R1 | In-app: `MetadataPanel.tsx:369-377` (Save Tags) and `SchemaEditor.tsx:275-284` (Done) on `ea4a1cb` | Both commit buttons are natively `disabled` while they run, with the labels `Saving...` / `Applying...` | confirmed (code) |
| R2 | W3C ARIA Practices list, https://lists.w3.org/Archives/Public/public-aria-practices/2023Jul/0006.html (R35 R4) | Use `aria-disabled` if the control should stay focusable, HTML `disabled` otherwise; not both | confirmed (R35) |
| R3 | GitLab GlButton https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com/-/issues/2981 ; Fluid https://issues.fluidproject.org/browse/C2LC-109/ (R35 R5) | Native `disabled` on a loading button drops keyboard focus; these projects use `aria-disabled` + `aria-busy` with a guard in the click handler | confirmed (R35) |
| R4 | APG "Focusability of disabled controls", https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ | "Browsers remove HTML input elements with the `disabled` attribute from the tab sequence." The guide asks authors to adopt "consistent pattern-based conventions": controls that must stay discoverable stay focusable; controls that can be inferred from their neighbours (example: a disabled Up button for the first list item) are removed | confirmed (docs, paraphrased except the quotes) |
| R5 | MDN `aria-disabled`, https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled | `aria-disabled` "does not change the focusability"; "Web developers must manually ensure such elements have their functionality suppressed"; for native controls the `disabled` attribute is the default; focusable disabled controls may need styling that still passes contrast | confirmed (docs) |

**Target behaviour:**
- **While Done or Save runs:** the button keeps focus and reads `Applying...` / `Saving...`. It is announced as unavailable and busy. Enter, Space or a click does nothing (R2, R3, R5).
- **After the run:**
  - Done closes on success (unchanged);
  - Done keeps focus and works again after a rejected `onSave`;
  - Save Tags keeps focus and is unavailable until the next edit.
- **Reorder arrows:** each one dims for its own reason only. The fieldset dims everything once (R4 convention 1 for the edge arrows).

### Deviations (with reasons)
1. **`aria-disabled` on a native `<button>`**, although MDN's default for native controls is `disabled` (R5). Reason: focus has to stay on the commit button (R2, R3). The click guard covers what native `disabled` did (R5).
2. **A clean Save Tags stays in the Tab order** (APG: a disabled control is usually removed, R4). Reason: the save button is the only commit control in the panel and must stay discoverable (R4 convention 2). Removing it again after each save would bring back the focus loss. The same applies to Done with an empty field list, which is rare.
3. **Edge arrows keep native `disabled`** and stay out of the Tab order (R4 convention 1, the APG's own example). Only their dim class changes.
4. **No focus move after Done succeeds.** The editor unmounts and focus goes to `<body>`, as today. Returning focus to the `Customize Fields` button is a separate design (B-R37-01 signal).
5. **Contrast:** the dim stays at `opacity-50`, the same look as the native disabled state today (R5's contrast note). Changing the dim is out of scope; C records the measured opacity.
6. **No timeout for a never-settling run** (RR-R35-02): Saba question, not part of this round.

## Baseline
- HEAD `ea4a1cb5c439b47565bce1c3883f8e41ca775511`; working tree clean (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (project policy release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `ea4a1cb` that changes only the two `version` fields counts as the baseline.
- **Frozen (byte-identical to `ea4a1cb`):** every path not listed under File ownership. In particular:
  - every other `src/` file: `App.tsx`, `stores/**`, `FolderBrowser.tsx`, `file-list/**`, `ui/` except `button.tsx`, `lib/**`, `types/**`, `main/**`;
  - every other test file, `tests/renderer/helpers/**`, `tests/renderer/setup.ts`, `tests/e2e/**`;
  - every `docs/**` file except the two below;
  - `.claude/**` (TESTING.md is not touched this round);
  - `vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, `tsconfig*.json`, `electron.vite.config.ts`, `.github/**`.
- **Protected (never touch):** `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope

### 1. Tests first (test-on-bugfix)
**1a. New file `tests/renderer/components/busy-buttons-focus.test.ts`**
- **Content:** take `b-round-37-exp/busy-buttons-focus.test.ts.txt` with its 8 tests (f1)–(f8). Keep the names and assertions unchanged. The describe block is `busy commit buttons keep focus (TM-B40, D-45)`.
- **A may adjust:** import order and formatting only, in the style of the sibling suites (double quotes, semicolons, `getButtonByText`, no comments, no `any`, no `{ timeout }`).
- **What the tests cover:**
  - (f1) Done focused + clicked with `onSave` pending: text `Applying...`, no `disabled` attribute, `aria-disabled="true"`, `aria-busy="true"`, `activeElement` is Done;
  - (f2) two more clicks while busy → `onSave` once; resolve → `onClose` once (pin on HEAD, red on GM-1/GM-11);
  - (f3) `onSave` rejects: text `Done`, `aria-disabled="false"`, not busy, still focused; the next click calls `onSave` again;
  - (f4) Save Tags focused + clicked with the write pending: `Saving...`, busy, `aria-disabled="true"`, focused; a second click → `writeMetadata` once;
  - (f5) after the write resolves: toast `Tags saved`, `isDirty` false, text `Save Tags`, no `disabled`, `aria-disabled="true"`, not busy, focused; a click → still one write;
  - (f6) clean batch `Save to 2 files`: no `disabled`, `aria-disabled="true"`, focusable; a click → no `writeMetadataBatch`;
  - (f7) dirty batch save: busy + focused while writing; a second click → `writeMetadataBatch` once;
  - (f8) while Applying, only the first Up arrow and the last Down arrow carry an own `opacity-30` class (also `disabled:opacity-30`, since the regex matches any variant prefix).
- **Red first:** before touching `src/`, run the file on `ea4a1cb` src. In `a-round-38.md`, record that (f1) and (f3)–(f8) fail (with each message) and (f2) passes.

**1b. Migrate the native-disabled assertions** (they would pass vacuously or fail once the buttons use `aria-disabled`; jest-dom's `toBeDisabled` ignores `aria-disabled`). Exactly these lines, as in `b-round-37-exp/*.test.diff.txt`:
- `tests/renderer/components/metadata-panel-batch-save.test.ts`: lines 99, 171, 193, 211, 381, 953, 994, 1006, 1071.
  - `.toBeEnabled()` → `.toHaveAttribute("aria-disabled", "false")`;
  - `.toBeDisabled()` → `.toHaveAttribute("aria-disabled", "true")`.
  - No other change in the file.
- `tests/renderer/components/schema-editor-done-busy.test.ts`:
  - lines 158 (`done`), 189 (`reopenedDone`), 207 (`done`): the same mapping. The other `toBeDisabled` / `toBeEnabled` lines (fieldset controls, Back) stay, because those controls are still natively disabled.
  - **RR-R36-01:** after line 294, insert `    expect(reads[2].schema).toEqual(reads[1].schema);`. This states that the schema cannot tell the two re-reads apart, so the `STALE1` outcome check is what pins latest-wins.
  - No test name changes, no other change.

### 2. Fix (D-45), exactly as `b-round-37-exp/prototype-src.diff`
- `src/renderer/src/components/schema/SchemaEditor.tsx`:
  - line 138: the guard;
  - line 149: the deps;
  - lines 186 and 194: `className={reorderArrowClassName(…)}`;
  - lines 280–281: `aria-disabled` and `aria-busy` replace `disabled`;
  - the appended `reorderArrowClassName`.
- `src/renderer/src/components/metadata-editor/MetadataPanel.tsx`:
  - line 143: `if (selectedFiles.length === 0 || isSaveBlocked()) return;`;
  - lines 373–374: `aria-disabled` and `aria-busy` replace `disabled`;
  - the appended `isSaveBlocked`.
- `src/renderer/src/components/ui/button.tsx`: the one added class line 35.
- **Style:** single quotes, no comments, no new export, no other change in these files.

### 3. Docs (Georgian, English technical terms)

**`docs/bugs/001-save-and-selection-known-limits.md`**

(a) **Header (lines 3–22), unfrozen for these edits only (C-R37-02 / A-R37-01):**
- line 3: add **(20) and (21)** to the fixed list; (19) stays a known limit;
- `წყარო`: add `TM-B39 (round 37), TM-B40 (round 38)`;
- `კოდი`:
  - add `withListedSelection` to the `file-store.ts` list;
  - add `isSaveBlocked` to the `MetadataPanel.tsx` list;
  - add `reorderArrowClassName` to the `SchemaEditor.tsx` list;
  - add `src/renderer/src/components/ui/button.tsx` (`aria-disabled:` classes);
- **D-41 bullet:** its "dependencies `[fields, onSave, onClose]` უცვლელია" now says D-45 added `isApplying`;
- **D-42 bullet:**
  - `Done` (`:280-282`) becomes `:280-283`. The sentence "`disabled={isApplying || fields.length === 0}` … `aria-*` prop არ აქვს (native `disabled`, როგორც Save Tags-ს)" is replaced by a pointer to D-45;
  - the deps sentence is updated the same way;
  - nothing else in the bullet changes;
- **new D-44 and D-45 bullets** after D-43, in the same style (from `feature-status.md` / this task).

(b) **Entry 18:** append one sentence to its Deviations line: Deviation (1) was replaced in round 38 by D-45 (entry 21). No other change.

(c) **Entry 20 (RR-R37-01):** in its `ფაილი` field, add the function name next to each line ref:
- `FolderBrowser.tsx:103`/`:108` (`handleOpenFolder`) and `:161`/`:166` (`handleRescan`);
- `App.tsx:48`/`:61` (`openFolder`);
- `FileList.tsx:68` (`handleClick`);
- `file-store.ts:55` (`setFiles`) is already named.

No other change in entry 20.

(d) **New entry `## 21. busy Done / Save Tags keyboard focus-ს კარგავდა; ისრები Applying-ის დროს თითქმის უხილავი იყო`**, laid out like entries 18–20:
- ID: RR-R35-01, RR-R35-04, C-R35-01, RR-R36-01; TM-B40. Severity: low.
- `ფაილი`: the new refs (`SchemaEditor.tsx:138`, `:149`, `:186`, `:194`, `:280-281`, `reorderArrowClassName`; `MetadataPanel.tsx:143`, `:373-374`, `isSaveBlocked`; `button.tsx:35`).
- Reproduction (before the fix): focus drops to `<body>` (real app; jsdom does not show it).
- Disk: nothing on disk changes.
- Reference R1–R5, one line each.
- Deviations 1–6, one line each.
- Decision: D-45, plus the rejected alternatives.
- Test: all 8 full test names; mention the 12 migrated assertions and the (b7) line.
- Status: `გასწორდა (D-45, TM-B40)`.
- RR-R35-02 is named as an open Saba question.

**`docs/bugs/README.md`:** in row 001, change `20 ჩანაწერი; 11 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა` to `21 ჩანაწერი; 12 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა`. Recount after editing and report the counts.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `tests/renderer/components/busy-buttons-focus.test.ts` (new) | §1a |
| `tests/renderer/components/metadata-panel-batch-save.test.ts` | §1b, the 9 listed lines only |
| `tests/renderer/components/schema-editor-done-busy.test.ts` | §1b, lines 158/189/207 + one inserted line after 294 |
| `src/renderer/src/components/schema/SchemaEditor.tsx` | §2 |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | §2 |
| `src/renderer/src/components/ui/button.tsx` | §2, one class line |
| `docs/bugs/001-save-and-selection-known-limits.md` | §3 (a)–(d) |
| `docs/bugs/README.md` | §3, row 001 counts |

A also writes `a-round-38.md` (and any `a-round-38/` logs) in the loop folder. Gitignored output is allowed: `out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`, `coverage/`.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R38-1 ownership | <ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat ea4a1cb`;</li><li>`git diff --quiet ea4a1cb -- . ':!<8 owned paths>'`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; the only untracked file is the new test.</li><li>The `src/` diff equals `b-round-37-exp/prototype-src.diff` hunk for hunk.</li><li>The test diffs equal `b-round-37-exp/*.test.diff.txt` (`git diff -w`: only the 12 mapped assertion lines and the one inserted line).</li><li>The new test file matches B's draft (names and assertions; `diff -w`, import order ignored).</li><li>No comment, no `any`, no new export, no `{ timeout }` / `testTimeout`.</li><li>Every `SchemaEditor.tsx` line ≤ 279 and `MetadataPanel.tsx` line ≤ 372 is unchanged apart from the listed lines (C diffs `head -n`).</li></ul> |
| R38-2 red → green | In a throwaway copy, A's tests on `ea4a1cb` src; then A's tree. Also each changed test file alone. | <ul><li>Red: the new file fails (f1) and (f3)–(f8) on the symptom (attribute / class); (f2) passes; the existing tests that reach the 12 migrated assertions (23 tests, some through the shared `expectEditsKept`) fail on the missing `aria-disabled`; no other failure. B measured **30 failed / 274 passed of 304** (`b-round-37-exp/red-run.log`).</li><li>Green: renderer **304/304** in 20 files, twice.</li><li>Each changed file alone is green; every new test < 1.5 s.</li></ul> |
| R38-3 mutants | On copies of A's tree, run B's GM-1…GM-11 (`b-round-37-exp/mut.py.txt`), plus C's own. | <ul><li>Each GM is killed at least by the tests in `mutants.log`: GM-1 (b2)(f2); GM-2 (f4)–(f7); GM-3 (f5)(f6); GM-4 (f4)(f7); GM-5 (f4)(f7); GM-6 (b4)(f3); GM-7 (f8); GM-8 ≥ (f4)–(f7); GM-9 (f1); GM-10 (b1)(b3)(b4)(f1)(f3); GM-11 (b2)(f2).</li><li>A survivor is acceptable only with C's equivalence argument, recorded as a low finding.</li><li>The `button.tsx` class line has no unit-test kill; R38-4 covers it.</li></ul> |
| R38-4 real app, old `ea4a1cb` vs new | Build both (`npm run build`). Run Playwright `_electron` under `xvfb-run -a` with `--no-sandbox` and an isolated `XDG_CONFIG_HOME` per scenario. Stub `dialog.showOpenDialog`. Use a harness like `c-round-37/harness.cjs`, extended to delay `meta:write` / `meta:write-batch` ≥ 3000 ms when armed. Drive with keyboard and mouse only. Fixture folders hold real WAVs (copies of `tests/fixtures`). Focus is read with `page.evaluate(() => document.activeElement?.textContent)`. **Playwright note:** Playwright treats `aria-disabled="true"` as disabled for actionability, so `locator.click()` on a busy or clean button waits and times out. That is not a FAIL of A's work. Drive those buttons with `locator.focus()` + `page.keyboard.press('Enter' | 'Space')` (or `click({ force: true })`). Playwright's `expect(locator).toBeDisabled()` honours `aria-disabled` and may be used for the K2 after-save and K3 states.<ul><li>**K1 (Done busy):** open `/fa` (3+ files) → Customize Fields → add a field → start Open Folder `/fb` (scan delayed) → focus Done → press **Enter**, then Enter and Space again during the wait → let `/fb` load.</li><li>**K2 (Save Tags single):** select `a.wav`, type Category `R38Focus`, focus Save Tags, press **Enter** (write delayed); during the write press Enter again; after the save, read focus, press Enter once more.</li><li>**K3 (clean Save + Tab):** select one file with no edits; Tab from the Category input until Save Tags is reached or Tab leaves the panel.</li><li>**K4 (batch):** select 2 files, type Category `R38Batch`, focus `Save to 2 files`, Enter (delayed), Enter again.</li><li>**O (opacity):** while K1's `Applying...` shows, compute the effective opacity (product of `getComputedStyle(el).opacity` over the element and its ancestors) of the first Up arrow, a middle Up arrow and the Done button. Measure the same at rest.</li></ul> | <ul><li>**K1 new:** `activeElement` is Done (`Applying...`) during the wait; `aria-busy="true"`; IPC log shows exactly one schema re-read batch for `/fb` per Done (no extra from Enter/Space); the editor closes after the load. **K1 old:** `activeElement` is `BODY` (or null) during the wait.</li><li>**K2 new:** focus stays on the button during the write and after it; one `meta:write` only; after the save the button is `aria-disabled="true"`. **K2 old:** focus drops to `BODY` during the write.</li><li>**K2 file check:** `a.wav` read with `ffprobe -show_entries format_tags -of json` and `music-metadata` gives `ICAT=R38Focus` in both, compared field by field with the form. sha256 of every other file is unchanged.</li><li>**K3 new:** Tab reaches Save Tags (`aria-disabled="true"`), Enter → no `meta:write`. **K3 old:** Tab skips it. C records both.</li><li>**K4 new:** one `meta:write-batch`, focus kept; both files are written (ffprobe + music-metadata `ICAT=R38Batch`).</li><li>**O new:** middle arrow 0.6, first Up arrow 0.18, Done 0.5 while Applying; at rest middle 1, edge 0.3, Done 1. **O old:** middle arrow 0.18 while Applying. Values within ±0.01.</li><li>Busy and clean buttons in the new build look like the old build's disabled state (screenshots side by side; `cursor: not-allowed`).</li><li>`pageErrors` empty in every run. Screenshots are saved as `r38-4-<build>-<scen>-NN.png`.</li></ul> |
| R38-5 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list as `c-round-35/biome-new.txt`.</li><li>Typecheck node/web/test 0.</li><li>Renderer **304**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R38-6 docs | Read `git diff ea4a1cb -- docs/`. | <ul><li>Georgian with English terms.</li><li>Header: (20), (21) in the fixed list; TM-B39/TM-B40 in `წყარო`; the four code names; D-41/D-42 sentences updated as §3(a); D-44 and D-45 bullets match the code.</li><li>Entry 18: only the appended sentence. Entry 20: only the function names added.</li><li>Entry 21 has every §3(d) field; each of the 8 test names has 1 match in the docs and 1 in the test file.</li><li>Every `file:line` ref in the header and in entries 20–21 points at the named code on A's tree (C checks with `sed -n`).</li><li>Entries 1–17 and 19 are byte-identical to `ea4a1cb`.</li><li>README row 001 is `21 / 12 / 5`; C recounts.</li><li>C checks R4 and R5 against their URLs and confirms Deviations 1–6 are what the app does.</li></ul> |

## What could break (C re-checks)
- **Save flow:** Save Tags still writes on a dirty form (single and batch). D-29/D-30/D-39 results are unchanged; the full `metadata-panel-batch-save` suite covers this. The guard must not block the first click: `isDirty` is true and `isSaving` false before it.
- **Done flow:** D-41 (Back + reopen), D-42 (fieldset disabled, `Applying...`), D-43 (latest Done wins), (b1)–(b8). The guard must not stop a Done after a rejected run (f3).
- **Other buttons:** every Button without `aria-disabled` looks and behaves as before. Examples: Rescan `disabled={isScanning}`, Add Field inside the fieldset, toolbar, TemplatePicker. C checks one natively disabled Button (Rescan during a scan) at opacity 0.5 in both builds.
- **Fieldset controls:** still natively disabled while Applying ((b1)); Back still enabled.
- **E2E:** no E2E spec clicks Save Tags or Done (B grep of `tests/e2e` for `Save Tags|Done|Saving|Applying`: no match), so the actionability change does not reach the gate's specs. 7/7 is a regression guard only.

## What realVerified means here
- `src/` changes, so real-app evidence is required: R38-4 old vs new with keyboard focus measured, plus the gate's E2E (R38-5).
- K2 and K4 save files, and those are checked with ffprobe and music-metadata. In K1/K3/O the evidence is the UI state, the IPC log and unchanged sha256.
- jsdom cannot show focus loss (B probe), so a green unit suite alone does not verify RR-R35-01.
- B's red/green numbers are a hypothesis until C reproduces them (R38-2).
- PASS on all six closes TM-B40 (RR-R35-01, RR-R35-04, C-R35-01, RR-R36-01) and C-R37-02 / A-R37-01 / RR-R37-01, and verifies D-45. RR-R35-02 stays open as a Saba question.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 39 fixes it first.
- Otherwise round 39 is **TM-B41** (test-only):
  - `dom-queries` unit tests (C-R36-01, HM-1…HM-3);
  - RegExp `g`/`y` `lastIndex` (RR-R36-03);
  - D-44 order pin (C-R37-01);
  - TESTING.md §6: a11y names via `getByRole` (RR-R36-02); "measured on one runner" (RR-R36-04); jsdom does not model focus loss on native `disabled`, so focus needs a real-app check (B-R37-02).
- After that, the remaining items need Saba or root:
  - Saba's question batch (`b-round-23.md` §5; B-R36-01 list lock during a scan; RR-R35-02 timeout);
  - TM-T2 / TM-T2-DATA (UCS list and its licence);
  - root's Actions link for TM-T0-CI / TM-B14.
