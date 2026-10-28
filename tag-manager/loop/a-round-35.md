# A — round 35 (TM-B37, D-42, D-43)

STATUS: DONE (A side). realVerified for A's own checks: true. R35-5 (real app, two builds) was NOT run by A; it is C's.

## Baseline
- HEAD `3035ffca98bbb8af4020c3a799b0d5b20515dacf`, tree clean at start (`git status --porcelain --untracked-files=all` empty). package.json shows 1.4.0 = baseline content (no root release commit on top).

## Changed files (only owned paths)
| File | Change |
|---|---|
| `src/renderer/src/components/schema/SchemaEditor.tsx` | D-42: `isApplying` state (line 45, directly after the mount effect's `}, []);`), `handleSave` exactly as the plan (137-149), wrapper div `flex-1 overflow-y-auto p-3`, `<fieldset disabled={isApplying} className="min-w-0 space-y-4 disabled:opacity-60">` (165, close 271) with the three sections re-indented one level by hand (Edit tool), Done `disabled={isApplying \|\| fields.length === 0}` + `{isApplying ? 'Applying...' : 'Done'}` (280-282), no `aria-*` |
| `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` | D-43: `const schemaReadIdRef = useRef(0);` (225, directly above `handleSchemaChanged`), id lines 227-228 before the wait (229), guard at 249 directly above `if (!isFolderLoadCurrent(loadId)) return;` (250). 4 added lines, nothing else |
| `tests/renderer/components/schema-editor-done-busy.test.ts` (new, untracked) | (b1)–(b6), B's draft verbatim (double quotes, `buttonByText` querySelectorAll lookup, no `getByRole`); all imports/helpers used |
| `docs/bugs/001-save-and-selection-known-limits.md` | header, D-41 clause, D-42/D-43 bullets, entries 18 and 19, line refs |
| `docs/bugs/README.md` | row 001 count |

`git diff -w 3035ffc -- src/` shows exactly the D-42 hunks (state line, handleSave body, wrapper class, fieldset open/close, Done disabled+label) and the 4 D-43 lines. No Bash write to any repository file (all repo edits via Edit/Write; Bash only wrote into the loop folder).

**Note for C's mutants (`mut.py.txt`):** B's prototype placed `isApplying` before `isMountedRef` (line 37) and `schemaReadIdRef` at line 106. A followed the task text instead: `isApplying` at SchemaEditor:45, `schemaReadIdRef` at MetadataPanel:225. Adjust anchors that rely on position; the text of each line is identical to the prototype.

## Tests actually run
1. **Red (baseline src + A's test), full renderer suite** (`a-round-35/red-run.log`): **284 passed / 3 failed of 287 in 18 files, plus 1 Unhandled Rejection**.
   - (b1) first failure `expect(element).toBeDisabled()` — Done not disabled (test line 163).
   - (b2) `expected 3 to be 2` — reads of `/fb/b.wav` (line 182).
   - (b5) `metadata` deep-equal fails: `qtwo` missing (line 240).
   - (b4) Unhandled Rejection `Error: reread failed` (line 204:47, via `SchemaEditor.tsx:138`), attributed to (b4).
   - (b3), (b6) green pins.
2. **Green, full renderer suite** (`green-run.log`): **287/287 in 18 files**, no unhandled errors.
3. **Each new test alone** (`-t "^.*\(bN\) "`, `alone.log`): b1 257 ms, b2 234 ms, b3 294 ms, b4 119 ms, b5 308 ms, b6 307 ms (all < 1 s). No timeout raised.
4. **Full verifyCommand from clean state** (`rm -rf out test-results playwright-report tests/fixtures/*.wav`; `verify.log`): exit 0.
   - Biome (`biome check src/`): 0 errors, **8 warnings**, same list as `c-round-31/biome-new.txt` (`a-round-35/biome-new.txt`, identical file/rule list). Note: `biome.json` ignores `tests/**`, so the new test file is not linted (same as all existing tests).
   - Typecheck node/web/test: 0 errors.
   - Renderer **287/287**, main **93/93**, build OK, E2E **7/7**.
5. `xvfb-run -a npx playwright test --retries=0` (`e2e-retries0.log`): **7/7**, exit 0.

## Docs: line refs changed (old → new)
MetadataPanel.tsx (refs at/after `handleSchemaChanged`):
- D-33 bullet: `:258-262` → `:262-266`
- D-34 bullet: `:237` → `:240`, `:251` → `:255`, `:258-261` → `:262-265`, `:266` → `:270`
- D-36 bullet: `:271` → `:275`
- D-39 bullet: `:226` → `:229`, `:227` → `:230`, `:228` → `:231`, `:246` → `:250`
- D-40 bullet: `:226` → `:229`, `:227` → `:230`, `:228` → `:231`, `:230` → `:233`, `:273` → `:277`, `:246` → `:250`
- entry 3: `:225-273` → `:226-277`, `:266` → `:270`
- entry 9: `:239` → `:242`, `:262` → `:266` (file line and reproduction 4), `:266` → `:270` (file line and decision (b)), `:237` → `:240`, `:251` → `:255`
- entry 10: `:266` → `:270`, `:268` → `:272`
- entry 15: `:227` → `:230`, `:246` → `:250`
- entry 16: `:226` → `:229`, `:227` → `:230`, `:228` → `:231`, `:246` → `:250`

SchemaEditor.tsx:
- D-41 bullet: `:139` → `:146`, `:140` → `:148`, `:148` → `:156` (`:37`, `:39-44` unchanged)
- entry 17: `:139` → `:146` (`:37`, `:39-44` unchanged)

All MetadataPanel refs before line 225 and all refs into other files are byte-identical (checked with `git diff --word-diff`).

New refs: D-42 bullet / entry 18 use SchemaEditor `:45`, `:137-149`, `:139`, `:142-145`, `:143`, `:146`, `:147`, `:148`, `:165`, `:271`, `:280-282`; D-43 / entry 18 use MetadataPanel `:225`, `:227-228`, `:229`, `:249`, `:250`; entry 19 uses `:229`, `:232`. A printed each line with `sed -n` and checked it.

Other doc changes:
- Header: fixed list now ends `(17) და (18)`; `წყარო` adds `TM-B37 (round 35)`; `კოდი` adds `schemaReadIdRef` (MetadataPanel) and `isApplying` (SchemaEditor).
- D-41 clause "`Done` enabled რჩება, busy state-ის გარეშე (TM-B37)" → "`Done`-ის busy state D-42-შია". Nothing else in D-41 changed apart from the refs.
- Entry 18 has the full (b1)–(b6) names. A checked with `grep -cF` that each name has 1 match in the docs file and 1 in the test file. The entry also states R1–R5, Deviations 1–4, that nothing on disk changes, and `გასწორდა (D-42, D-43, TM-B37)`.
- Entry 19 (B-R34-03): both cases, display only, the next Done or Rescan shows the value, no test, status `ცნობილი შეზღუდვა`.
- README: `ცნობილი შეზღუდვების სია (19 ჩანაწერი; 10 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა)`. Recount from the `**სტატუსი:**` lines: fixed = 3, 9, 11–18 (10); Saba = 4, 5, 6, 7, 10 (5); known limit = 1, 2, 8, 19 (4). The count matches the task.

## Reviews
- **code-reviewer:** 0 critical/high/medium. Every doc ref checked was correct, and the README count matched. Low findings:
  1. The D-41 bullet still says "`MetadataPanel.tsx` (D-40-ის ჩათვლით) უცვლელია, ამიტომ pending re-read unmount-ის შემდეგაც ბოლომდე სრულდება და store-ში წერს". Since D-43 this holds only if no later Done started. **Not changed:** the task says nothing else in the D-41 bullet changes. **B to decide** (one-line qualification next round).
  2. Architecture note: a superseded re-read still sends all of its chunk reads before the guard at `:249` (waste at 1000+ files). The shape was mandated by the plan. Proposal for B: an id check inside the chunk loop.
  3. The bare `catch` at SchemaEditor `:142` hides programming errors (no log). This is intentional per the plan.
  4. Cosmetic: during Applying, the fieldset `disabled:opacity-60` multiplies with the edge arrows' own `disabled:opacity-30` (about 18%). C should note this in the screenshot.
  5. Focus is lost when Done becomes disabled. This is Deviation 1, already recorded.
  - Test gaps (low, not added because the task fixes the test list and the 287 total): no StrictMode variant, no unmount-then-reject test, (b1) doesn't check the arrow/trash/hide buttons, and no test has both Done calls waiting on the same `isScanning` change.
- **qa-engineer:** no regressions. The six related suites pass (47 tests). It wrote scratch probes x1–x8 in `/tmp/qa-r35/copy` (StrictMode, unmount+reject, no folder, Close Folder during the wait, two Done calls both waiting on a scan, Open Folder between Done calls, fields emptied while Applying, clicks separated by a microtask); all pass. Its argument for DM-9: the id is bumped synchronously at click time before any `await`, so id order equals click order. Low, not reachable from the UI: two clicks inside one synchronous task (one `act`) call `onSave` twice, because the disabled state lands a microtask later. D-43 drops the extra result anyway. It provided a draft pin; A did not add it (outside the test list).

## Known gaps / notes for B
- The D-40 bullet's "პირველივე ხაზზე" (first line) is now technically stale: the two D-43 id lines come before the wait. A changed only its refs, as the scope says. The D-43 bullet states the order explicitly.
- D-41 bullet stale clause: see review item 1.
- Windows packaging: BLOCKED (Windows packaging is not available in the cloud).

## Exact next checks for C
- R35-1: `git diff --quiet 3035ffc -- . ':!src/renderer/src/components/schema/SchemaEditor.tsx' ':!src/renderer/src/components/metadata-editor/MetadataPanel.tsx' ':!docs/bugs/001-save-and-selection-known-limits.md' ':!docs/bugs/README.md'`. The only untracked file should be the new test.
- R35-2: red copy should give 284/3 + 1 Unhandled Rejection; A's tree 287/287. Run each test alone.
- R35-3: mutants with the anchors above. Adjudicate BM-6 and DM-9 (see qa's argument).
- R35-4: rerun the gate from clean.
- R35-5: real app on old and new builds (A did not run it). Check the dimmed look in P, including the arrow opacity note.
- R35-6: grep each ref from the list above.

## Acceptance IDs A actually passed (own runs; C must verify)
- R35-1: self-checked (diff scope, -w content, no comments/any/as/aria).
- R35-2: red and green both run on this runner. The red run used the repo with the test added before the src edits, not a throwaway copy.
- R35-4: full verifyCommand plus `--retries=0`, both green.
- R35-6: refs and counts self-checked.
- R35-3 not run by A (mutants are C's). R35-5 not run by A.
