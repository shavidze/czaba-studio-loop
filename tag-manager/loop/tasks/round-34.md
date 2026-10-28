# CURRENT TASK — Round 34: TM-B36 — schema editor reopened while Done is pending (D-41)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 33: C PASS** (R33-1…R33-6, realVerified=true). TM-B35 (D-40) is **done**. Root published `9f5ac51`; the review returned COMMIT OK with 1 medium and 2 low findings. `9f5ac51` is the baseline.
- **No critical or high bug is open.** C reported two new low bugs. This round fixes the first, pins the second, and closes two doc nits in files it already owns.
  - **C-R33-02 (= QA-R33-01 = A-R33-02 part 2).** C reproduced it in the real app (`c-round-33/run-new-Q.txt`, `r33-5-new-Q-*.png`).
    - Steps: Done is pending (the D-40 wait, or a slow schema re-read) → Back → Customize Fields again → type a field name.
    - Result: when the pending Done finishes, the reopened editor closes by itself and the typed name is lost.
    - Cause: `SchemaEditor.tsx` `handleSave` calls the `onClose` it captured after `await onSave()`. `MetadataPanel` passes `() => setShowSchemaEditor(false)`, which also closes the new editor.
    - The bug existed before round 33: the old build closes the editor at 3.3 s with a slow re-read (`run-old-QD.txt`). D-40 widened the window to a whole folder load.
    - Severity: A's qa-engineer said medium, C said low. **B: low.** Nothing on disk changes; only text typed into the editor is lost. It is still first in this round.
  - **C-R33-01 (test gap).** DM-3 (taking `folderLoadId` before the D-40 wait) passes every existing test, but it is **not** equivalent. **B's round-32 claim B-R32-02 was wrong.**
    - C's (k1): Done while B's scan is pending → Open Folder C supersedes B → C's first read rejects.
    - With A's code the re-read after the wait fills C. With DM-3, `metadata` stays `{}`.
    - This round adds (k1) as pin (w8).
  - **RR-R33-03 (doc).** If the schema fails to load at startup, a drop keeps `isScanning` true for up to 5 s (`App.tsx:47`, `:50-55`), so Done waits up to 5 s. This becomes one sentence in the D-40 bullet.
  - **A-R33-04 (doc).** The README row "8 გასწორდა, 5 მათგანი Saba-ს კითხვაა" reads as if the 5 were among the fixed 8. This round rewords it with the new count.
- **B's red reproduction on `9f5ac51`**, in a throwaway copy, `b-round-33-exp/`:
  - `b-r34-stale-close.test.ts.txt` (tests (e1)–(e5)) and `w8-addition.diff.txt`.
  - `red-run.log`: **279 passed / 2 failed of 281**. (e1) and (e2) fail on the symptom, `expected undefined to be 'QTyped'` (the reopened editor is gone). (e3)–(e5) and (w8) are green pins.
  - `prototype.diff.txt`: `green-run.log` **281/281 in 17 files**; Biome 0 errors and 8 warnings; `tsc` for web + test is clean.
  - `mutants.log` (`mut.py.txt`):
    - SM-1 (guard removed), SM-3 (guard before the `await`) and SM-4 (cleanup removed) are killed by (e1)(e2);
    - SM-2 (the mount effect never sets `true`, which breaks Done under StrictMode) is killed by (e3);
    - DM-3 is killed by (w8).
- **Not in this round (backlog item TM-B37, todo, medium):** RR-R33-01 (Done gives no feedback while it waits) and QA-R33-02 (two Done clicks start two re-reads).
  - Both need a visible UX decision: `disabled` vs `aria-disabled` + `aria-busy`, and what happens to a field added while Done is pending.
  - The reference-first rule applies to that decision. B's first search found mixed guidance: Opquast and accessibility posts prefer `aria-disabled` + `aria-busy`, while Mp3tag forum users ask for controls to be disabled during a save. TM-B37 gets its own Reference section in the next round.
  - This round changes **nothing visible**: Done stays enabled and clickable as today.
- **Reference-first rule:** exempt. This is a pure bug fix with no new element and no changed text. It restores the expected behaviour: an editor the user opened stays open until the user closes it or presses Done in that same editor.
- **Signals, not tasks:** RR-R33-02 (the subscription can outlive the panel), A-R33-01 (D-40 relies on the synchronous `handleCloseFolder`), A-R33-03 (subscription leak between tests). All three are recorded in the backlog.

## Baseline
- HEAD must be `9f5ac51fa93096b1940b6609db203d92ff53fdfc` and the working tree **clean** (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report BLOCKED.
  - Exception (baseline rule): HEAD may be one root `chore(release): vX.Y.Z` commit directly on `9f5ac51` that changes only the `version` fields of `package.json`/`package-lock.json`. That commit counts as the baseline.
- **Frozen** (byte-identical to `9f5ac51`): every path not listed under File ownership. In particular:
  - `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` (D-40 stays exactly as published);
  - `src/renderer/src/App.tsx`;
  - `src/renderer/src/stores/**`;
  - `src/renderer/src/components/sidebar/FolderBrowser.tsx`;
  - `src/renderer/src/components/ui/**`;
  - `src/renderer/src/lib/**` and `src/renderer/src/types/**`;
  - `src/main/**`;
  - `tests/renderer/helpers/**` and `tests/renderer/setup.ts`;
  - `tests/e2e/**`;
  - every existing test file except `schema-change-during-folder-load.test.ts`, which gets additions only (see Scope).
  - `.claude/primitives/**` (no primitive change this round).
- **Protected** (never edit): `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.
- **Rules:**
  - test-on-bugfix: tests first. They must be red on the baseline src where marked, and A records the red run before touching src.
  - CLAUDE.md: no comments in code, semicolons, no `any` / `@ts-ignore`, single quotes in `src/`.
  - Read primitives first: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (the component is not a `ui/` component; do not convert it).
  - Use Edit/Write only; no Bash writes to repository files (A-R17-02).
  - After the change, run `/check`. With 3+ files changed, run `code-reviewer`. After the bug fix, run `qa-engineer`.

## Scope

### D-41 (decision, renderer only, `SchemaEditor.tsx` only)
1. Change the React import to `import { useCallback, useEffect, useRef, useState } from 'react';`.
2. Right after `const [fieldError, setFieldError] = useState('');`, add (exact name; C greps it):
   ```ts
   const isMountedRef = useRef(false);

   useEffect(() => {
     isMountedRef.current = true;
     return () => {
       isMountedRef.current = false;
     };
   }, []);
   ```
   The effect must set `true` itself. `useRef(true)` with only a cleanup breaks Done under `React.StrictMode` (`main.tsx:7`), because the StrictMode effect replay leaves the ref `false`. That is mutant SM-2, killed by (e3).
3. In `handleSave`, after `await onSave?.();`, add `if (!isMountedRef.current) return;` and keep `onClose();` as the last line. The dependencies `[fields, onSave, onClose]` stay unchanged.
4. **Unchanged:**
   - Back (`onClick={onClose}`) and every other handler;
   - Done stays enabled, with no `aria-busy`. Busy state is TM-B37;
   - all text;
   - `MetadataPanel.tsx`, including `handleSchemaChanged` / D-40, which still runs to the end and applies its re-read after an unmount.
5. **Conventions:** no comments, no new `as`. Biome: 0 errors and **8** warnings, the same list as `c-round-31/biome-new.txt` (line shifts allowed).

Behaviour this gives:
- Done with the editor still open closes it after the re-read, as today ((e3), (e4)).
- Back while Done is pending closes the editor at once. The re-read still applies ((e5)), and a later reopened editor stays open ((e1), (e2)).

### Tests first
**New file `tests/renderer/components/schema-editor-stale-close.test.ts`:**
- Start from `b-round-33-exp/b-r34-stale-close.test.ts.txt`.
- Keep one `describe("schema editor closed and reopened while Done is pending (D-41)", …)`, the double-quote style, and the test names and IDs below.
- A may tidy helpers. No `any`; no unused helper or import.
- After Back, the tests reselect `a.wav` with `setSelectedPaths([PATH_A])`, because Open Folder's begin clears the selection and the test does not render `FileList`. C covers the row click in the real app (R34-5).

| Test | Scenario | Assert | Baseline |
|---|---|---|---|
| (e1) | `/fa` (a) open, a selected. Customize Fields; Open Folder `/fb` with its scan deferred; add `R34note`; Done. Back; reselect a; Customize Fields; type `QTyped` in the field-name input; the `/fb` scan resolves `[b]`. | field-name input still present with value `QTyped`; `metadata` `{b: B + r34note "BN"}` | red |
| (e2) | as (e1), rendered inside `React.StrictMode` | value `QTyped` | red |
| (e3) pin | StrictMode, no load pending: Customize, add `R34note`, Done | editor closed (no field-name input); `metadata` `{a: A + "AN"}` | green |
| (e4) pin | as (e1) up to Done; editor left open; the scan resolves | editor closed; `metadata` `{b: B + "BN"}` | green |
| (e5) pin | as (e1) up to Done; Back; not reopened; the scan resolves | no editor; `files` `[b]`; `metadata` `{b: B + "BN"}`; toast null | green |

**`tests/renderer/components/schema-change-during-folder-load.test.ts`:** additions only. Append **(w8)** as the last test of the existing describe, as in `b-round-33-exp/w8-addition.diff.txt`. Name: `(w8) C-R33-01: Done while B's scan is pending, Open Folder C supersedes B and C's first read rejects: the schema re-read after the wait fills C`. It asserts `files` `[c]`, exactly 2 reads that include `c`, and `metadata` `{c: C + "CN"}`. It is green on the baseline and kills DM-3. Lines 1 to the end of (w7) stay byte-identical; C checks the diff.

**Totals and red run:**
- Renderer: 275 + 5 + 1 = **281** in **17** files.
- A records the red run on the baseline src (`9f5ac51` `SchemaEditor.tsx` with A's tests) in `a-round-34.md`:
  - **279 passed / 2 failed**, failing (e1) and (e2);
  - for each, the first failing assertion, which must be the symptom (the reopened editor is gone), not setup.
- A also records each new test's duration when run alone. Do **not** raise any timeout. Report any test that needs more than 4 s alone.

### Docs (Georgian, English technical terms)
**`docs/bugs/001-save-and-selection-known-limits.md`:**
- **New entry `## 17.`** "pending `Done` ხელახლა გახსნილ schema editor-ს ხურავდა", in the layout of entry 16:
  - ID `C-R33-02, QA-R33-01, A-R33-02, TM-B36`; severity low;
  - files: `src/renderer/src/components/schema/SchemaEditor.tsx:<line>` for `isMountedRef`, the effect lines, and the guard line in `handleSave`, all at A's real line numbers;
  - reachability: Back is always available in the editor; the sidebar stays usable during a pending Done (C-R27-01, D-40);
  - reproduction: start state → action → result before the fix. Use the folder-load case, and also the slow-re-read case with no load (C's `run-old-QD.txt`);
  - nothing on disk changes; the pending re-read still applies;
  - why a mount ref inside the editor rather than a token in `MetadataPanel` (the stale callback belongs to the unmounted instance; `MetadataPanel` stays frozen), and why the effect sets `true` (StrictMode, SM-2 / (e3));
  - Done's busy state and re-entrancy are **not** changed (TM-B37, RR-R33-01, QA-R33-02);
  - decision D-41;
  - the full names of (e1)–(e5);
  - `გასწორდა (D-41, TM-B36)`.
- **Entry 16:** in its `ტესტი` line, add the full name of (w8) after (w7). Nothing else in entry 16 changes.
- **D-40 bullet:** append one sentence (RR-R33-03). If the schema has not loaded at startup, a drop (App `openFolder`) sets `isScanning` to true before its up-to-5 s schema wait (`App.tsx:47`, `:50-55`), so a Done pressed then waits up to 5 s.
- **New D-41 bullet** after D-40, matching the code.
- **Header:**
  - fixed list "(3), (9), (11), (12), (13), (14), (15), (16) და (17)";
  - `**წყარო:**` adds `TM-B36 (round 34)`;
  - `**კოდი:**` adds `src/renderer/src/components/schema/SchemaEditor.tsx` (`handleSave`, `isMountedRef`).
- **Line refs:** `MetadataPanel.tsx`, `App.tsx`, `FileList.tsx`, `FolderBrowser.tsx`, `file-store.ts` and `utils.ts` are unchanged, so every existing `file:line` stays as it is. The docs file has no `SchemaEditor.tsx` refs today.

**`docs/bugs/README.md`:** row 001's status reads exactly `ცნობილი შეზღუდვების სია (17 ჩანაწერი; 9 გასწორდა; დანარჩენი 8-დან 5 Saba-ს კითხვაა)`.
- Before writing it, A counts the entries: 17 in total; fixed are (3), (9), (11)–(17); of the 8 open entries, 5 are marked as Saba questions.
- If the count differs, A writes the true numbers and reports the difference in `a-round-34.md`.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| `src/renderer/src/components/schema/SchemaEditor.tsx` | D-41: `isMountedRef`, mount effect, guard in `handleSave`, React import |
| `tests/renderer/components/schema-editor-stale-close.test.ts` (new) | (e1)–(e5) |
| `tests/renderer/components/schema-change-during-folder-load.test.ts` | append (w8) only |
| `docs/bugs/001-save-and-selection-known-limits.md` | entry 17, entry 16 test line, D-40 sentence, D-41 bullet, header |
| `docs/bugs/README.md` | row 001 wording and count |

A also writes `a-round-34.md` (and any `a-round-34/` logs) in the loop folder. Gitignored output (`out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`) is allowed.

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R34-1 ownership + process | Run:<ul><li>`git status --porcelain --untracked-files=all`;</li><li>`git diff --stat 9f5ac51`;</li><li>`git diff --quiet 9f5ac51 -- . ':!<5 owned paths>'`.</li></ul>Read the full diff. | <ul><li>Only owned paths changed; the only untracked file is `schema-editor-stale-close.test.ts`.</li><li>The `SchemaEditor.tsx` diff is exactly D-41: the import, `isMountedRef` + effect (body as above), and one guard line after `await onSave?.();`.</li><li>`MetadataPanel.tsx`, `App.tsx`, `stores/**` and `FolderBrowser.tsx` are byte-identical.</li><li>No text changed; Done has no new `disabled`/`aria-*` prop.</li><li>No comment, `any`, `@ts-ignore` or new `as` in `src/`.</li><li>`schema-change-during-folder-load.test.ts`: the diff only adds (w8) at the end of the describe.</li><li>No unused helpers or imports in the new test (a leftover is a low finding, not a FAIL).</li><li>No Bash write to repository files; "unknown" if there is no transcript (not a FAIL).</li></ul> |
| R34-2 red → green | In a throwaway copy outside the repository, put the `9f5ac51` `SchemaEditor.tsx` with A's tests and run the renderer suite. Then run the suite on A's tree, and each new test alone (anchored `-t` patterns: `-t "(e1)"` is a regex, see C-R33 note). | <ul><li>Baseline src: (e1) and (e2) fail on the symptom; (e3)–(e5), (w8) and all 275 old tests pass (expected **279 passed / 2 failed**). C records the first failing assertion of each.</li><li>A's tree: **281/281** in 17 files.</li><li>Each new test passes alone; C records its duration.</li></ul> |
| R34-3 mutations | In copies of A's tree outside the repository, run `schema-editor-stale-close.test.ts`, `schema-change-during-folder-load.test.ts`, `schema-editor.test.ts`, `metadata-panel-schema-change.test.ts` and `reread-after-folder-switch.test.ts`, once per mutant. Give the exact edit for each; use `b-round-33-exp/mut.py.txt` as the start. It uses repo-relative paths, so run it with the copy's root as cwd. (w8)'s killing assertion for DM-3 is the `metadata` one; `readsOfC === 2` only pins the read count, because DM-3 still reads a second time. | <ul><li>SM-0 control: all pass;</li><li>SM-1 (guard removed): killed by (e1)(e2);</li><li>SM-2 (`useRef(true)`, effect does not set `true`): killed by (e3);</li><li>SM-3 (guard moved before `await onSave?.()`): killed by (e1)(e2);</li><li>SM-4 (cleanup removed): killed by (e1)(e2);</li><li>DM-3 on `MetadataPanel.tsx` (`folderLoadId` before the wait): killed by (w8).</li></ul>Any other survivor C finds is a FAIL unless C shows that it is equivalent. |
| R34-4 gate | On A's tree, from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`. | <ul><li>Exit 0.</li><li>Biome: 0 errors and **8** warnings, the same list (line shifts allowed).</li><li>Typecheck 0, including `tsconfig.test.json`.</li><li>Renderer **281**, main **93/93**, E2E **7/7**.</li><li>`--retries=0`: **7/7**.</li></ul> |
| R34-5 real app, old vs new | Build `9f5ac51` ("old") and A's tree ("new"), each in its own copy outside the working tree. Launch each with Playwright `_electron` under `xvfb-run`, `--no-sandbox`, an isolated `XDG_CONFIG_HOME`, and `-r harness.cjs` from `c-round-33/` (scan delay for `fast/`; read-batch delay for `slow/`). Drive the UI only; `dialog.showOpenDialog` may be stubbed.<br>Folders: `slow/` = `s.wav`, `fast/` = `f.wav` (copies of `tests/fixtures/sample.wav`).<br>**Setup** (fresh copies and config per scenario, harness disarmed): open `fast`, click `f.wav`, Category `R34Fast`, `Save Tags`, `Tags saved`; open `slow`, click `s.wav`, Category `R34Slow`, Save. Record the sha256 of both files and read both with `music-metadata` (`exif:ICAT`) and `ffprobe -show_entries format_tags -of json`.<br>Scenarios (each starts from the setup, with `slow` open and `s.wav` selected):<ul><li>**Q** (scan delay 4000 ms): Customize Fields; Open Folder `fast`; add Text field `R34note`; Done (the editor stays open); Back; **click the `s.wav` row**; Customize Fields; type `QTyped` in the field-name input. Wait until `fast` has loaded plus 3 s. Screenshot. Then click `Add Field`, then Done.</li><li>**QD** (no Open Folder; read-batch delay 3000 ms for `slow/`): Customize Fields; add `R34note`; Done; Back; Customize Fields; type `QTyped`; wait for the delayed read plus 3 s. Screenshot.</li><li>**N** (harness disarmed): Customize Fields, add `R34note`, Done.</li></ul> | <ul><li>**New build:**<ul><li>Q and QD: the reopened editor is still open after the wait, with `QTyped` in the input (screenshot).</li><li>Q: after `Add Field`, the editor's Active Fields list has `R34note` and `QTyped`; Done then closes the editor.</li><li>Q: the pending re-read applied. Open Folder clears the selection, so C clicks the `f.wav` row first; `f.wav`'s form then shows Category `R34Fast` and an `R34note` input.</li></ul></li><li>**Old build (red):** Q and QD: the reopened editor closes by itself when the pending Done finishes and `QTyped` is lost (as in `c-round-33/run-new-Q.txt` / `run-old-QD.txt`). If the old build does not show it, C reports it with the harness log. The round is not PASS until B re-plans, unless C shows the timing made it a no-op on both builds; then C reruns with longer delays.</li><li>**Both builds:**<ul><li>N closes the editor within 1 s.</li><li>`f.wav` and `s.wav` sha256 are unchanged after setup (no save in Q/QD/N).</li><li>Both readers, field by field: `ICAT=R34Fast` for `f.wav` and `R34Slow` for `s.wav`; no `R34note`/`QTyped` value in either file.</li><li>`pageErrors` is empty.</li></ul></li><li>C states that StrictMode is active in the built renderer (`main.tsx:7`; React's dev-only double effects do not run in a production build, so StrictMode safety is proven by (e2)(e3) only) and that (e5) is unit-only.</li><li>Artists are record only (TM-B08).</li></ul> |
| R34-6 docs | Read `docs/bugs/001-save-and-selection-known-limits.md` and `docs/bugs/README.md` on A's tree, against A's src and D-41 in `feature-status.md` / `backlog.json` `decisions`. | <ul><li>Georgian with English technical terms.</li><li>Entry 17:<ul><li>marked `გასწორდა (D-41, TM-B36)`;</li><li>names (e1)–(e5) by full test name (grep: each full name has exactly 1 match in the docs file and 1 in the tests);</li><li>states reachability, that nothing on disk changes, that the re-read still applies, the StrictMode reason, and that Done's busy state is TM-B37.</li></ul></li><li>Entry 16's test line has the full (w8) name (1 match in docs, 1 in tests); nothing else in entry 16 changed.</li><li>The D-40 bullet has the RR-R33-03 sentence, and `App.tsx:47` / `:50-55` point at the described code.</li><li>The D-41 bullet matches the code.</li><li>Every `SchemaEditor.tsx:N` ref points at the described line on A's tree (C greps each; a wrong number is a FAIL).</li><li>All other `file:line` refs are byte-identical to `9f5ac51`.</li><li>Header: (3), (9), (11)–(17) fixed; `წყარო` has TM-B36; `კოდი` lists `SchemaEditor.tsx`.</li><li>README row reads exactly `ცნობილი შეზღუდვების სია (17 ჩანაწერი; 9 გასწორდა; დანარჩენი 8-დან 5 Saba-ს კითხვაა)`, or A's reported true count, which C recounts.</li></ul> |

## What could break (C re-checks)
- **Normal Done:** with the editor open, Done closes it after the re-read, with and without an open folder (`files` empty → `handleSchemaChanged` returns at once and the editor closes). Tests: (e3), (e4), (w6), `metadata-panel-schema-change.test.ts` (s*).
- **Back:** still closes the editor at once and never cancels the pending re-read ((e5)).
- **D-40 (w1)–(w7) and D-39 (v*):** unchanged, since `MetadataPanel.tsx` is frozen.
- **`schema-editor.test.ts`** (reserved ICAT, hidden standards): it renders `SchemaEditor` alone with `onClose: () => undefined` and must stay green.
- **StrictMode in the real app:** if the effect does not set `true`, Done would never close the editor. (e3) guards this in unit tests; R34-5 N guards it in the built app.
- **E2E `folder-workflow.spec.ts`.**
- **Biome:** exactly 8 warnings, the same list.

## What realVerified means here
- R34-1…R34-4 and R34-6 are real local checks.
- R34-5 is the real-app check on two builds, with the files hashed and read by two independent readers.
- PASS on all six closes TM-B36, C-R33-02, QA-R33-01, A-R33-02 part 2, C-R33-01, RR-R33-03 and A-R33-04.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 35 fixes it first (test-on-bugfix).
- Otherwise round 35 is **TM-B37** (medium): Done gives no feedback and can be clicked again while it is pending. B writes a Reference section (tag editors, WAI-ARIA `aria-busy`/`aria-disabled`, platform guidance) and a Deviations list. B also decides what happens to a field added while Done is pending.
- After that, the remaining items need Saba or root (Saba's question batch, `b-round-23.md` §5; root's Actions link for TM-T0-CI/TM-B14), or B picks TM-B11 / TM-B05 prep.
