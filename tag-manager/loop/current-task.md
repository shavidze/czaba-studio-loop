# CURRENT TASK — Round 35: TM-B37 — schema editor Done busy state and latest-Done-wins re-read (D-42, D-43)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 34: C PASS** (R34-1…R34-6, realVerified=true). TM-B36 (D-41) is **done**. Root published `3035ffc`; the review returned COMMIT OK with 0 critical/high/medium findings, 4 low findings and 1 architecture note. `3035ffc` is the baseline.
- **No critical or high bug is open.** TM-B37 (medium) is the next unfinished item. This round fixes three closely related bugs, all in the schema editor's Done flow. That is the policy limit, so nothing else joins this round:
  1. **RR-R33-01 (medium) + QA-R33-02 / A-R33-02(1) / RR-R34-02 (low).** While Done is pending (D-40 wait or a slow re-read), the editor gives no feedback, and every extra click starts another schema re-read.
  2. **QA-R34-01 (low).** Two re-reads can run at once: Done #1 pending → Back → reopen → add a field → Done #2. Whichever finishes last wins. If #1 (older schema) lands last, the new field's values disappear from `metadata` and the form.
  3. **RR-R34-01 (low).** If `onSave` rejects, `handleSave` throws, the editor never closes, and the Done click leaves an unhandled rejection. The busy state needs this path anyway: without it Done would stay disabled forever.
- **B's red reproduction on `3035ffc`** is in a throwaway copy, `b-round-34-exp/`:
  - Test draft: `schema-editor-done-busy.test.ts.txt`, tests (b1)–(b6).
  - `red-run.log`: **284 passed / 3 failed of 287, plus 1 Unhandled Rejection**.
    - (b1): `expect(element).toBeDisabled()`, Done is not disabled.
    - (b2): `expected 3 to be 2`, reads of `b`.
    - (b5): `metadata` is missing `qtwo`.
    - (b4): the Unhandled Rejection `reread failed`.
    - (b3) and (b6) are green pins.
  - `prototype.diff.txt`: `green-run.log` **287/287 in 18 files** (three full runs); Biome 0 errors / 8 warnings; `tsc` for web + test is clean.
  - `mutants.log` (`mut.py.txt`): see R35-3.
- **Not in this round** (new backlog items, todo):
  - **TM-B38** (test-only): C-R34-02, the timing margin. B measured the six new tests here at **11.8 s** with `screen.getByRole` button lookups and **0.84 s** with a `querySelectorAll('button')` text lookup, so `getByRole` is the likely cause of the slow suites. TM-B38 also renames (e5) (C-R34-03).
  - **TM-B39**: C-R34-01, a stale selection after a folder switch.
  - The new test file in this round already uses the fast lookup.
- **Signals, not tasks:**
  - RR-R34-05: `MetadataPanel` could own the whole schema flow with a session token. B keeps the smaller D-42 + D-43, because D-41 already isolates each editor instance.
  - B-R34-02: a TESTING.md rule candidate.
- **B's own error (B-R34-01).** The round 34 task's wording for RR-R33-03, "schema fails to load", was wrong. A rejected `loadSchema` sets `isLoaded` true at once. A and the code-reviewer fixed the docs, and C confirmed the fix.

## Reference (reference-first rule: this changes visible UI)
Searched:
- Mp3tag forum: "writing tag data dialog", "edit while saving", "improper action while saving";
- Microsoft Windows progress-control guidance;
- disabled vs `aria-disabled` / `aria-busy` for a loading button.

Found:
| # | Source | What it says (confirmed / inference) |
|---|---|---|
| R1 | In-app: `MetadataPanel.tsx:369-372`, the Save Tags button | Confirmed. While a save runs it is natively `disabled` and its label reads `Saving...`. This is the closest precedent: same app, same kind of commit button. |
| R2 | Mp3tag, https://community.mp3tag.de/t/feature-request-make-the-writing-tag-data-dialog-not-a-dialog/65295 | Confirmed. Mp3tag shows a "Writing tag-data" progress dialog during a write, and the developer declined to make it non-blocking. Further posts: https://community.mp3tag.de/t/tag-several-files-then-save-or-edit-next-file-while-first-is-saving/66549 says you cannot move on to edit the next file while a save runs; https://community.mp3tag.de/t/improper-action-while-saving/54838 and https://community.mp3tag.de/t/54892 report that clicking during a save misbehaves. Inference: editing is blocked while a commit runs. |
| R3 | Microsoft, https://learn.microsoft.com/windows/apps/design/controls/progress-controls | Confirmed. Use a blocking (indeterminate) indicator when the user must wait for the operation; use a non-modal one when they can keep working. |
| R4 | W3C ARIA Practices list, https://lists.w3.org/Archives/Public/public-aria-practices/2023Jul/0006.html | Confirmed. Use `aria-disabled` if the control should stay focusable, HTML `disabled` otherwise; not both. |
| R5 | GitLab GlButton, https://gitlab.com/gitlab-org/gitlab-services/design.gitlab.com/-/issues/2981; Fluid, https://issues.fluidproject.org/browse/C2LC-109/ | Confirmed. Native `disabled` on a loading button drops keyboard focus. These projects use `aria-disabled` + `aria-busy`, with a guard in the click handler. |

Not found: a tag editor that keeps a field-schema dialog open while it re-reads files. Kid3 and Soundminer were not searched in depth. B does not claim how they behave.

**Target behaviour:**
- While Done is pending, the Done button is disabled and reads `Applying...`. (R1, R2, R3)
- The editing controls can't be used while the re-read runs. (R2)
- Back stays usable as the way out.
- A second click does nothing.
- A failed `onSave` returns the editor to its normal state.

### Deviations (with reasons)
1. **Native `disabled`, not `aria-disabled` + `aria-busy`** (R4, R5). Native disabled drops focus from Done.
   - Kept, because it matches Save Tags (R1).
   - Back stays enabled and focusable.
   - Moving both buttons to `aria-disabled` is an app-wide change for a later round (signal B-R34-02 family). C records it, not a FAIL.
2. **Inline busy state, not a modal progress dialog** (R2, R3). The editor already sits in the right panel, and Back must stay available (D-41). A modal would hide the sidebar, which D-40 keeps usable during a wait.
3. **No spinner or progress bar.** The label `Applying...` follows `Saving...` (R1). There is no determinate count, because the wait covers a folder load whose length is unknown.
4. **Label `Applying...` instead of keeping `Done`.** It names what happens: the new fields are being applied to the open files. It uses ASCII `...`, like `Saving...`.

## Baseline
- HEAD must be `3035ffca98bbb8af4020c3a799b0d5b20515dacf` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `3035ffc` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `3035ffc`): every path not listed under File ownership. In particular:
  - `src/renderer/src/App.tsx`;
  - `src/renderer/src/stores/**`;
  - `src/renderer/src/components/sidebar/FolderBrowser.tsx`;
  - `src/renderer/src/components/file-list/**`;
  - `src/renderer/src/components/ui/**` (the `Button`, `Input`, `Select` components are not changed);
  - `src/renderer/src/lib/**` and `src/renderer/src/types/**`;
  - `src/main/**`;
  - `tests/renderer/helpers/**` and `tests/renderer/setup.ts`;
  - `tests/e2e/**`;
  - **every existing test file**, including `schema-editor-stale-close.test.ts` (the (e5) rename is TM-B38);
  - `.claude/**` (no primitive change this round).
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Rules:**
  - test-on-bugfix: tests first. A records the red run on the baseline src before touching src.
  - CLAUDE.md: no comments in code, semicolons, no `any` / `@ts-ignore`, single quotes in `src/`, Tailwind classes only (no custom CSS), design tokens.
  - Read primitives first: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`.
  - Use Edit/Write only; no Bash writes to repository files (A-R17-02). That includes `biome format --write`: A writes the re-indent inside the new `<fieldset>` by hand, and `npm run check` (Biome format check) must pass.
  - After the change, run `/check`, `code-reviewer` (3+ files changed) and `qa-engineer` (bug fix).

## Scope

### D-42 (`SchemaEditor.tsx` only): busy Done, locked editing area, reject handled
1. Directly after the `isMountedRef` effect (after its closing `}, []);`), add `const [isApplying, setIsApplying] = useState(false);` (exact name; C greps it).
2. `handleSave` becomes exactly:
   ```ts
   const handleSave = useCallback(async () => {
     if (fields.length === 0) return;
     setIsApplying(true);
     try {
       await onSave?.();
     } catch {
       if (isMountedRef.current) setIsApplying(false);
       return;
     }
     if (!isMountedRef.current) return;
     setIsApplying(false);
     onClose();
   }, [fields, onSave, onClose]);
   ```
   Dependencies stay `[fields, onSave, onClose]`. A rejected `onSave` shows no toast here; `MetadataPanel` already toasts read failures.
3. **Editing area.**
   - Today it is `<div className="flex-1 overflow-y-auto p-3 space-y-4">`. It becomes `<div className="flex-1 overflow-y-auto p-3">`.
   - Inside it, a `<fieldset disabled={isApplying} className="min-w-0 space-y-4 disabled:opacity-60">` wraps all three sections: Active Fields, Hidden Standard Fields and Add Custom Field.
   - The children inside the fieldset are re-indented by one level and are otherwise unchanged.
   - No `legend`. Tailwind preflight already removes the fieldset's border, margin and padding, and `min-w-0` removes the default `min-inline-size`.
4. **Done button:**
   - `disabled={isApplying || fields.length === 0}`;
   - label `{isApplying ? 'Applying...' : 'Done'}`;
   - no `aria-*` prop (Deviation 1).
5. **Back** (the header button, outside the fieldset) is unchanged and always enabled. The header, the title text and all other text stay unchanged.
6. **Conventions:** no comments, no new `as`. Biome reports 0 errors and **8** warnings, the same list as `c-round-31/biome-new.txt` (line shifts allowed).

### D-43 (`MetadataPanel.tsx` only): latest Done wins
1. Directly above `const handleSchemaChanged = useCallback(async () => {`, add `const schemaReadIdRef = useRef(0);`.
   - Placing it there keeps every `MetadataPanel.tsx` line ref before `handleSchemaChanged` valid.
   - It is a top-level hook, before the `if (showSchemaEditor)` early return.
2. The first lines of `handleSchemaChanged`, before `await waitForFolderLoadIdle();`, are:
   ```ts
   schemaReadIdRef.current += 1;
   const schemaReadId = schemaReadIdRef.current;
   ```
3. Directly above the existing `if (!isFolderLoadCurrent(loadId)) return;`, add `if (schemaReadId !== schemaReadIdRef.current) return;`.
4. Nothing else changes: the wait (D-40), the generation logic (D-34), the toast, the dependencies `[setMetadata, setEditingMetadata, showToast]`, `handleSave` and the sync effect.

**Behaviour this gives:**
- While Done is pending:
  - the Done button reads `Applying...` and is disabled;
  - the field-name, RIFF-ID and type inputs, Add Field, the arrow/trash/hide buttons and the hidden-standard toggles are disabled;
  - Back works.
- Done in the same editor can start only one re-read.
- Back → reopen → Done #2: the new editor's Done is enabled ((b3)). The re-read of the latest Done wins, whatever order the reads land in ((b5), (b6)).
- **Known limit kept (B-R34-03):** Done #1 pending → Back → reopen → add a field, without pressing Done again.
  - If #1 was still waiting for a folder load, its re-read takes the schema after the wait, so the field **is** read.
  - If #1's read had already started, the field is read at the next Done or Rescan. This is display only.
  - Behaviour is unchanged from before. This becomes docs entry 19.

### Mutant notes (for A and C)
- **BM-6** (`setIsApplying(false)` before `onClose()` removed) survives. It is equivalent only because `MetadataPanel`'s `onClose` unmounts the editor. A standalone `SchemaEditor` with a no-op `onClose` would stay at `Applying...`. Keep the line.
- **DM-9** (the id taken after `waitForFolderLoadIdle()` instead of before it) survives. B's claim, which **C must test or refute**:
  - every `handleSchemaChanged` call that waits is resolved by the same `isScanning → false` store update, and the subscribers run in subscription order, which is click order;
  - a call that does not wait increments in its first microtask, before any later click can run;
  - so the id order equals the click order in every reachable sequence.
  - If C finds a killing sequence, it is a FAIL of the plan, not of A, and B re-plans.

### Tests first
**New file `tests/renderer/components/schema-editor-done-busy.test.ts`:**
- Start from `b-round-34-exp/schema-editor-done-busy.test.ts.txt`.
- Keep one `describe("schema editor Done busy state and latest schema re-read (D-42, D-43)", …)`, the double-quote style, and the test names and IDs below.
- Keep the fast `buttonByText` lookup. Do **not** use `screen.getByRole` for buttons (C-R34-02 / B-R34-02).
- A may tidy the helpers. No `any`; no unused helper or import.

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (b1) | `/fa` open, a selected; Customize; Open Folder `/fb` (scan deferred); add `R35note`; Done | Done is disabled with text `Applying...`; field-name input, RIFF-ID input, type `select` and Add Field are disabled; Back is enabled; after the scan resolves the editor is closed | red |
| (b2) | as (b1), then click the same Done element again; scan resolves `[b]` | exactly **2** `readMetadataBatch` calls include `b` (load + one re-read); `metadata[b].r35note` is set; editor closed | red |
| (b3) pin | as (b1); Back; reselect a; Customize | reopened Done reads `Done` and is enabled; field-name input enabled; after the scan resolves the reopened editor is still open | green |
| (b4) | `SchemaEditor` alone with an `onSave` that rejects | `onSave` called once; `onClose` not called; Done reads `Done` and is enabled; field-name input enabled; no unhandled rejection | red (Unhandled Rejection) |
| (b5) | `/fa` open, no load; Customize, add `Qone`, Done (#1 read deferred); Back; Customize; add `Qtwo`; Done (#2 read deferred); resolve #2, then #1 | after #2 the editor is closed; `metadata` and `editingMetadata` equal #2's result (with `qtwo`) | red |
| (b6) pin | as (b5), but resolve #1 first, then #2 | `metadata` and `editingMetadata` equal #2's result | green |

**Totals and red run:**
- Renderer: 281 + 6 = **287** in **18** files.
- A records the red run on the baseline src (`3035ffc` `SchemaEditor.tsx` and `MetadataPanel.tsx` with A's tests) in `a-round-35.md`:
  - **284 passed / 3 failed** ((b1), (b2), (b5)) **plus 1 Unhandled Rejection** attributed to (b4);
  - the first failing assertion of each, which must be the symptom, not setup.
- A records each new test's duration when run alone. The target is under 1 s each. Do **not** raise any timeout.

### Docs (Georgian, English technical terms) in `docs/bugs/001-save-and-selection-known-limits.md`
- **New entry `## 18.`** "schema editor-ის `Done` ლოდინისას feedback-ს არ აჩვენებდა და ხელახლა დაჭერადი იყო; ორი re-read-იდან ბოლოს დასრულებული იმარჯვებდა", in the layout of entry 17:
  - IDs `RR-R33-01, QA-R33-02, A-R33-02, RR-R34-02, QA-R34-01, RR-R34-01, TM-B37`; severity medium.
  - Files: `SchemaEditor.tsx:<line>` for `isApplying`, `handleSave`, the `<fieldset>` and the Done label, and `MetadataPanel.tsx:<line>` for `schemaReadIdRef` and the guard, all at A's real line numbers.
  - Reproduction before the fix: start state → action → result, for each of the three bugs.
  - Reference R1–R5 in one line, and Deviations 1–4.
  - Nothing on disk changes.
  - Full names of (b1)–(b6).
  - `გასწორდა (D-42, D-43, TM-B37)`.
- **New entry `## 19.`**: known limit B-R34-03 (open, not a Saba question). It says what happens in the two cases, that it is display only, and that the next Done or Rescan shows the value. It carries no test name.
- **D-41 bullet:** replace the clause "`Done` enabled რჩება, busy state-ის გარეშე (TM-B37)" with a pointer to D-42. Update its `SchemaEditor.tsx` line refs to A's lines. Nothing else in it changes.
- **New D-42 and D-43 bullets** after D-41, matching the code.
- **Line refs:**
  - Every `SchemaEditor.tsx:N` ref, and every `MetadataPanel.tsx` ref at or after `handleSchemaChanged`, must point at the described code on A's tree. That includes the bare `:226`/`:227`/`:228`/`:230`/`:246`/`:273` refs in the D-40 bullet and the refs in entries 15–17.
  - A lists every ref changed (old → new) in `a-round-35.md`.
  - `MetadataPanel.tsx` refs before the new line, and refs into other files, stay byte-identical.
- **Header:**
  - fixed list "(3), (9), (11), (12), (13), (14), (15), (16), (17) და (18)";
  - `**წყარო:**` adds `TM-B37 (round 35)`;
  - `**კოდი:**` adds `isApplying` to the `SchemaEditor.tsx` list and `schemaReadIdRef` to the `MetadataPanel.tsx` list.
- **`docs/bugs/README.md`:** row 001's status reads exactly `ცნობილი შეზღუდვების სია (19 ჩანაწერი; 10 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა)`. A recounts first; if the count differs, A writes the true numbers and reports the difference.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/schema/SchemaEditor.tsx` | D-42 |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-43 only (1 ref line + 3 lines in `handleSchemaChanged`) |
| `tests/renderer/components/schema-editor-done-busy.test.ts` (new) | (b1)–(b6) |
| `docs/bugs/001-save-and-selection-known-limits.md` | entries 18, 19; D-41 clause; D-42/D-43 bullets; line refs; header |
| `docs/bugs/README.md` | row 001 count |

A also writes `a-round-35.md` (and any `a-round-35/` logs) in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R35-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 3035ffc`;</li><li>`git diff --quiet 3035ffc -- . ':!<5 owned paths>'`.</li></ul>Read the full diff, and `git diff -w 3035ffc -- src/` for content without the re-indent. | <ul><li>Only owned paths changed; the only untracked file is `schema-editor-done-busy.test.ts`.</li><li>`git diff -w` of `SchemaEditor.tsx` shows exactly D-42 (state line, `handleSave` body, wrapper `div` class, `<fieldset …>` open/close, Done `disabled` + label). The non-`-w` diff differs from it only by indentation inside the fieldset.</li><li>`MetadataPanel.tsx` diff is exactly the 4 D-43 lines.</li><li>No other text changed; Done has no `aria-*`; no comment, `any`, `@ts-ignore` or new `as` in `src/`; no custom CSS.</li><li>No `screen.getByRole` for buttons and no unused helpers/imports in the new test (a leftover is a low finding, not a FAIL).</li><li>No Bash write to repository files; "unknown" if there is no transcript (not a FAIL).</li></ul> |
| R35-2 red → green | In a throwaway copy outside the repository, put the `3035ffc` `SchemaEditor.tsx` and `MetadataPanel.tsx` with A's tests and run the renderer suite. Then run it on A's tree, and each new test alone (anchored `-t "^.*\(bN\) "`). | <ul><li>Baseline src: **284 passed / 3 failed** ((b1), (b2), (b5) on the symptom) + **1 Unhandled Rejection** from (b4). C records each first failing assertion.</li><li>A's tree: **287/287** in 18 files, no unhandled errors.</li><li>Each new test passes alone; C records its duration (target < 1 s; > 2 s is a low finding).</li></ul> |
| R35-3 mutations | In copies of A's tree outside the repository, run `schema-editor-done-busy.test.ts`, `schema-editor-stale-close.test.ts`, `schema-change-during-folder-load.test.ts`, `metadata-panel-schema-change.test.ts`, `schema-editor.test.ts` and `reread-after-folder-switch.test.ts` once per mutant. Start from `b-round-34-exp/mut.py.txt`; run it with the copy's root as cwd. Adjust the patterns if A's text differs, and give each exact edit. | <ul><li>BM-0 control: all pass.</li><li>BM-1 (Done `disabled` ignores `isApplying`): killed by (b1)(b2).</li><li>BM-2 (fieldset `disabled={false}`): (b1).</li><li>BM-3 (catch does not reset): (b4).</li><li>BM-4 (label stays `Done`): (b1).</li><li>BM-5 (`setIsApplying(true)` removed): (b1)(b2).</li><li>DM-8 (id guard removed): (b5).</li><li>DM-10 (guard moved to right after the wait): (b5).</li><li>BM-6 and DM-9: C states whether they are equivalent, with an argument or a killing probe (see Mutant notes).</li><li>D-41 mutants SM-1/SM-2 still killed by (e1)(e2)/(e3).</li><li>Any other survivor C finds is a FAIL unless C shows it is equivalent.</li></ul> |
| R35-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list.</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **287**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R35-5 real app, old vs new | Build `3035ffc` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and a `-r` harness in `c-round-35/` (start from `c-round-33/harness.cjs`). The harness needs:<ul><li>the scan delay for `fast/`;</li><li>**a new per-call knob**: delay only the N-th `meta:read-batch` call after arming;</li><li>a log of every `meta:read-batch` call with its paths and schema keys.</li></ul>Drive the UI only; `dialog.showOpenDialog` may be stubbed.<br>Folders: `slow/` = `s.wav`, `fast/` = `f.wav` (copies of `tests/fixtures/sample.wav`).<br>**Setup** (fresh copies and config per scenario, harness disarmed):<ul><li>open `fast`, click `f.wav`, Category `R35Fast`, Save, wait for `Tags saved`;</li><li>open `slow`, click `s.wav`; Customize Fields; add Text `Qone` with RIFF ID `QONE` and Text `Qtwo` with `QTWO`; Done; enter `Qone`=`V1`, `Qtwo`=`V2`, Category `R35Slow`; Save;</li><li>Customize Fields; hide (trash) `Qone` and `Qtwo`; Done.</li></ul>Record the sha256 of both files and read both with `music-metadata` and `ffprobe -show_entries format_tags -of json`.<br>Scenarios (each from the setup, `slow` open, `s.wav` selected):<ul><li>**P** (scan delay 4000 ms for `fast/`): Customize; Open Folder `fast`; add Text `R35note`; Done. Within 1 s take a screenshot and read the DOM state of Done, the field-name input, Add Field and Back. Click Done again (`force: true`). Wait until `fast` loads plus 2 s; click `f.wav`.</li><li>**PB** (as P up to the first Done): Back; click the `s.wav` row; Customize. Screenshot: reopened Done reads `Done` and is enabled.</li><li>**X** (QA-R34-01; per-call knob: the 1st `meta:read-batch` after arming waits 4000 ms): Customize; add `Qone` (RIFF `QONE`); Done (#1 delayed); Back; Customize; add `Qtwo` (RIFF `QTWO`); Done (#2). Wait for #1's reply plus 2 s. Screenshot the `s.wav` form.</li><li>**N** (disarmed): Customize; add `R35note`; Done.</li></ul>**Idle look:** a screenshot of the open editor before any Done, on both builds. | <ul><li>**New build:**<ul><li>P: Done is `disabled` with text `Applying...`; the field-name input and Add Field are `disabled`; Back is enabled (DOM + screenshot); the editing area looks dimmed.</li><li>P: the harness log shows exactly **one** schema re-read `meta:read-batch` for `f.wav` after the load read (no second from the second click). The editor closes after the load; the `f.wav` form shows Category `R35Fast` and an `R35note` input.</li><li>PB: the reopened Done reads `Done` and is enabled.</li><li>X: after #1's late reply the form shows `Qone`=`V1` and `Qtwo`=`V2`.</li><li>N: the editor closes within 1 s.</li></ul></li><li>**Old build (red):**<ul><li>P: Done stays enabled with text `Done`, and the second click produces a second schema re-read in the log.</li><li>X: after #1's late reply `Qtwo` is empty (or C shows the harness log of why not; then the round is not PASS until B re-plans).</li></ul></li><li>**Both builds:**<ul><li>the idle editor looks the same: same layout, no fieldset border or padding (C compares the two screenshots and notes any pixel difference);</li><li>sha256 of `f.wav` and `s.wav` is unchanged after setup (no save in P/PB/X/N);</li><li>both readers, field by field: `ICAT`=`R35Fast`/`R35Slow`, `QONE`=`V1`, `QTWO`=`V2` for `s.wav`, and no `R35note` value in either file;</li><li>`pageErrors` is empty.</li></ul></li><li>C states that (b4) (reject path) and (b6) are unit-only, and that StrictMode double effects do not run in the production build.</li><li>Artists are record only (TM-B08).</li></ul> |
| R35-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md` and `docs/bugs/README.md` on A's tree, against A's src and D-42/D-43 in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 18 is marked `გასწორდა (D-42, D-43, TM-B37)`. It names (b1)–(b6) by full test name (each full name has exactly 1 match in the docs file and 1 in the tests). It states R1–R5, Deviations 1–4 and that nothing on disk changes.</li><li>Entry 19 states B-R34-03's two cases and that it is display only.</li><li>The D-41 bullet points to D-42 instead of the "busy state-ის გარეშე" clause; the D-42 and D-43 bullets match the code.</li><li>Every `SchemaEditor.tsx` ref and every `MetadataPanel.tsx` ref at or after `handleSchemaChanged` (including the bare D-40 refs) points at the described line on A's tree (C greps each; a wrong number is a FAIL). A's old → new list matches.</li><li>All other `file:line` refs are byte-identical to `3035ffc`.</li><li>Header: (3), (9), (11)–(18) fixed; `წყარო` has TM-B37; `კოდი` lists `isApplying` and `schemaReadIdRef`.</li><li>The README row reads exactly `ცნობილი შეზღუდვების სია (19 ჩანაწერი; 10 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა)`, or A's reported true count, which C recounts.</li></ul> |

## What could break (C re-checks)
- **D-41:** Back during a pending Done closes the editor at once, the reopened editor stays open, and the pending re-read still applies ((e1)–(e5), (b3)).
- **Normal Done:** with no load and an open folder, Done closes after the re-read ((e3), (w6), `metadata-panel-schema-change.test.ts` (s*)). With no folder open (`files` empty), `handleSchemaChanged` returns at once and the editor closes.
- **D-40 (w1)–(w8), D-39 (v*), D-34 schema/write generations:** a single Done still applies its re-read, because the id guard only drops a run when a later Done started.
- **`schema-editor.test.ts`** (reserved ICAT, hidden standards) renders `SchemaEditor` alone with Add Field, the toggles and the inputs. They must stay enabled while idle.
- **Layout:** the fieldset must not add a border, padding or width change, and the editor must still scroll (`overflow-y-auto` stays on the outer div).
- **E2E:** `tests/e2e/**` has no reference to Done or Customize Fields (B grep), so `folder-workflow.spec.ts` is unaffected but still runs.
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R35-1…R35-4 and R35-6 are real local checks.
- R35-5 is the real-app check on two builds, with the files hashed and read by two independent readers.
- PASS on all six closes TM-B37, RR-R33-01, QA-R33-02, A-R33-02, RR-R34-01, RR-R34-02 and QA-R34-01.
- B-R32-01 (the wait has no visible state) closes with D-42. QA-R33-03 (a scan that never settles keeps Done waiting) stays a record: with D-42 the editor shows `Applying...` until Back, Open Folder or Close Folder.
- B-R34-03 stays open as a documented known limit.
- (b1) proves the disabled *state* only. It does not prove that clicks are suppressed. Synthetic events skip the browser's handling of disabled controls; (b2) relies on React ignoring `onClick` on a disabled button. Real click suppression is proven only by R35-5 P (DOM state, plus a second click that produces no extra read in the harness log).
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 36 fixes it first (test-on-bugfix).
- Otherwise round 36 is **TM-B38** (test-only): replace `getByRole` button lookups in the slow component suites, with before/after durations on one runner; rename (e5) together with its docs name.
- Then **TM-B39** (C-R34-01, stale selection after a folder switch), which needs a Reference section.
- After that, the remaining items need Saba or root (Saba's question batch, `b-round-23.md` §5; root's Actions link for TM-T0-CI/TM-B14), or B picks TM-B11 / TM-B05 prep.
