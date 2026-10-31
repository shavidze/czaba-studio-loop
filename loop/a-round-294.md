# A round 294 — FIX-PD-1c3 (GATE293-T1 ST6 fix-up)

No STOP. All §8 STOP conditions checked and none fired.

## Changed files (exactly the 3 §4 grants)
1. `app/lib/__tests__/store-theme-tokens.test.ts`: ST6 only, byte-equivalent to `b-round-293/sketch-st6.diff`. Totals `{ total: 4, script: 2 }`, and `'components/arrangement/StudioNarrowScreen.tsx': 1` added as the first map key. The file is now 746 lines.
2. `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`: the TH4 title at l.187 only, as in `sketch-th4-title.diff`.
3. `docs/implementation/2026/quarter-IV/218-fix-pd-narrow-studio-state.md`:
   - l.4 is `**სტატუსი:** Completed (C round 294 PASS)`;
   - l.21 now names `togglePlayback` and `stopLibraryPreview`;
   - a GATE293-T1 Problem → Solution entry was added after C-R292-01;
   - the ST6/TH4 sentence was appended to the TH4 testing line, which moved to l.67.

No app source, Store, protected, package or lock file was touched. No new doc was created.

## Checks actually run
- **Claims before editing:** `claims-294.sh` output was identical to `claims-294-output.txt` (`diff` empty).
- **Claims after editing**, with deltas only where §6 CLAIMS allows them:
  - K2: 10 lines;
  - K3: rc 1, failing only on the 3 §4 paths;
  - K6: 746 lines, ST6 at l.684, `totals l.` empty, `StudioNarrowScreen in file: 1`;
  - K9: old-title hit 0, map still 1;
  - K10: `Completed (C round 294 PASS)`;
  - K11: `stopLibraryPreview on l.21: 1`, `ST6/GATE293 mentions: 2`, TH4 testing line l.67 (moved by the one added entry line).

  Every other K line is identical.
- **`sha256sum -c` on `b-round-293-r294-tree-sha256.txt`:** FAILED only on `store-theme-tokens.test.ts`, `studio-theme-obsidian.test.tsx` and doc 218. `git status` shows 10 paths.
- **STOP grep** of `data-studio-theme` across the `app perf e2e tests` test roots: 5 files, exactly the K8 list.
- **`npm run typecheck`:** rc 0.
- **`npm run lint`:** rc 0, with 205 warnings and 1 info across the repo. A did not run lint before editing, so it cannot say which warnings are older. What A did verify: Biome on the 2 changed test files is clean, and the doc is not linted.
- **`npx biome check`** on the 2 test files: rc 0, "No fixes applied", no new ignore.
- **Covering set** (`npx vitest run` on the 6 §5 files): **6 files and 90 tests passed**, duration 3.84 s.
  - ST6 passed (21 ms) and TH4 passed under its new title (10 ms).
  - The slowest test was NG5 at 742 ms against a 15 000 ms timeout. The next slowest were PNR3a at 297 ms and PNR3c at 203 ms, both against the 5 000 ms default. No test was above 50 % of its timeout.
  - L11 cross-check against the file totals in gate-293 `verify.log`:
    - `studio-narrow-gate-ui`: 4 807 ms for all 16 tests, so no single test can reach 7 500 ms, half of its 15 000 ms timeout;
    - `panel-radius-ui`: 1 655 ms in all, under 2 500 ms, half of the 5 000 ms default;
    - `studio-theme-obsidian`: 394 ms;
    - `store-focus-ring`: 313 ms;
    - `studio-focus-ring`: 150 ms;
    - `store-theme-tokens`: 195 ms.
- **Consulted before or alongside the edits:**
  - lessons L11, L12, L23, L28, L29, L52 and L56;
  - `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md` (read in full at the head, before editing);
  - `prompts/new-test.md` (the head) and the section headings of `BUG_HUNTING_TESTS.md` and `AUDIO_ARCHITECTURE.md`, which A skimmed only after the edits.

  None of them contradicts this change: it applies a pre-authored test-map diff and a doc update, with no new tests, audio code or styling.
- **Mutants**, run on the scratch copy `/tmp/a294-scratch` (rsync of `store/` with `node_modules` symlinked), never in `store/`:
  - (a) `data-studio-theme="obsidian"` on the first `<footer` in `Footer.tsx`: **ST6 red**, `expected { total: 5, script: 3 } to deeply equal { total: 4, script: 2 }`.
  - (b) The old ST6 map and totals restored by reverse-applying the sketch: **ST6 red**, `expected { total: 4, script: 2 } to deeply equal { total: 3, script: 1 }`.
  - Restore: both files compared equal (`cmp`) to `store/`. `diff -r -q` between the scratch copy and `store/` (excluding `.git`, `build` and `node_modules`) was empty.
- **Build:** not run. It is a gate row (§5).

## code-reviewer subagent (actually invoked, score 9/10)
- **Low, A-R294-REVIEW-L-DOC-FILELIST:** doc 218's "შეცვლილი ფაილები" list (l.44–53) does not name `app/lib/__tests__/store-theme-tokens.test.ts`. This is **not fixed**: the doc grant covers only l.4, l.21 and the §3.3 additions, so the fix belongs to B. The suggested bullet is `` `app/lib/__tests__/store-theme-tokens.test.ts` — ST6: ზუსტ map-ში `StudioNarrowScreen.tsx` (total 4, script 2). ``
- **Info:** `GATE293-T1`, `C-R292-01` and "C round 294 PASS" appear in the repo only in this doc. They exist in the loop's gate and backlog records. l.4 is the post-PASS value written under L28.
- **Info:** the marker in `StudioNarrowScreen.tsx` is conditional (`themeMarker ? 'obsidian' : undefined`). The source scans count it either way, which is right for what they guard.
- **Info:** ST6's totals check repeats what the exact map already proves. This predates the round and is harmless.
- The reviewer confirmed that the guard still fails on any Store marker (a new key in the exact map), and that ST6 and TH4 agree on `{StudioNarrowScreen.tsx: 1, StudioWorkspace.tsx: 1, styles/app.css: 2}`.
- **Architecture note:** none, because the change is only tests and a doc.

## B acceptance status (A's side only; C verifies)
- CLAIMS, SOURCE-SCOPE (as seen by A), TYPECHECK, UNIT and UNIT-MUTANTS ran green, as described above.
- **Not run by A:**
  - the browser rows B-MARKER, B-DESK-SAME and G294-AUTH;
  - the DOC-218 row, which is C's check;
  - the gate rows: full suite, build, verify and smoke.

## Known gaps
- A-R294-REVIEW-L-DOC-FILELIST (Low): the doc 218 file list, outside the grant.

## Next C checks
- §6 rows: CLAIMS, SOURCE-SCOPE, TYPECHECK, UNIT, UNIT-MUTANTS, B-MARKER (1440/1280 wide, 390 narrow, and `/` and `/store` with 0 markers), B-DESK-SAME, G294-AUTH and DOC-218.
- Use the server already running on `http://127.0.0.1:5173`.
