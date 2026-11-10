# Round 438: SYS-R435-SOURCE-SCAN-HELPER: one shared JSX source scanner, built on the TypeScript parser, for the six Studio source-scan tests (test-only)

**Planned by:** B, at the round 437 → 438 planning, 2026-11-10 (`b-round-437.md`).
- The advisor was consulted after orientation, before the engine switch, and before hand-off.
- The round-437 task is archived as `tasks/round-437.md` [K16].
- **Test-only round.** No file outside `app/lib/arrangement/__tests__/` changes, except doc 285.
- Reference-first and the `product-designer` consult do not apply (policy: refactor and test-only rounds).

## Decisions (`backlog.json` v422 → v424, `decisions_log_b`) [K19]
- **D-29z1554:** round 437 is accepted.
  - C PASS, `browserVerified` true, 1 Low [K22].
  - Gate 437 published `142918b` [K1].
  - STUDIO-VIS-7, STUDIO-VIS-10 and SABA-LANE-RESIZE-HANDLE are done [K17].
- **D-29z1555:** C-R437-01 is a pre-existing Low and is deferred.
  - B's probe shows the status line does change ("Loading …", then "… is ready."), which corrects C's "no status message" (`b-round-437/probe/play-status.json`).
  - Play not resuming after the decode is the round-382 F-13b-i refusal contract [K23].
  - Auto-resume would be a behaviour change. It is a question for Saba in `user-review/note-round-438-play-after-decode.md` (L44), not a scheduled task.
- **D-29z1556:** the gate-437 review and A's round-437 notes are recorded.
  - The Lows are deferred; confirmations go in as `confirmedBy`.
  - L61's "pointer capture keeps `:hover`" is replaced by the measured fact [K20].
- **D-29z1557:** the sketch: the engine switch to the TypeScript parser, the rulings below, and the tech-lead reviews (`b-round-437/sketch-review.md`).
- **D-29z1558:** this dispatch and the order after it.
- **D-29z1559 (after the advisor's close review):**
  - the closes count is corrected to 9 Lows plus the GATE434-S2 subfolder half;
  - tech-lead's v2 and v3 reviews are saved verbatim;
  - the sketch files are saved;
  - claims K3/K4 now capture the manifest rc, and K7 no longer prints a date;
  - the L31 loaded headroom is added.

## Read first
- `lessons.md` (60 lines). The lessons that apply here:
  - **L23:** a repo-scan test cannot be shown red on the start copy, so every red-proof is a named mutant (§2 table).
  - **L29:** tagged claims (§7).
  - **L30:** every test root is pre-run. These tests live under `app/**` and run in `npm run test:run`.
  - **L31:** timeout headroom. Under full-suite load the slowest covering file takes 746 ms, at most 15 % of the 5 s default (`b-round-437/l31-headroom.txt`).
  - **L56–L58:** cited artifacts exist, and every asserted number is the saved output of the command on B's sketch.
  - **L57:** C's JSON fields.
  - **L8:** a deferred Low on a test selector is a time bomb. That is why this round lands before ARCH-SPLIT.
- **L38:** never run vitest while a browser probe runs.
- **L59/L60:** run every row to a result, and write `c-round-438/progress.json` after each row. Mutants run only in scratch copies under `/tmp` or `c-round-438/`, never in `store/`.

## Baseline: HEAD `142918b`, clean tree
- `git rev-parse HEAD` is `142918b` (gate 437 published) [K1]. At planning, `git status --short --untracked-files=all` is empty [K2].
- **Frozen files:** `b-round-437/r438-frozen-sha256.txt` lists every tracked file except the 9 grants: **1340** entries, rc 0 [K3].
  - Check it from `store/` with `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-437/r438-frozen-sha256.txt`.
  - The 11 protected files (`b-round-318/protected-sha256.txt`) give rc 0, and none of them is granted [K4].

## 0. Why this round
- **Order.** In `systemic_tasks`, SYS-R435-SOURCE-SCAN-HELPER is "after COPY-PD-VIS, before SYS-1; must land before the first ARCH-SPLIT stage" (RETRO 435, D-29z1542) [K17]. COPY-PD-VIS stage 2 passed in round 437.
- **Nothing outranks it** [K18]:
  - no Critical or High finding is open;
  - the loop-fixable open Mediums are STUDIO-VIS-5 and SABA-B-12 stage 4 (STUDIO-VIS-3). Saba's "defer" parks both in REVIEW-RECOMMENDATIONS (D-29z1512);
  - every other open Medium is a Tech Lead, root or Saba item.
- **C's round-437 bug** C-R437-01 is a Low with a designed cause (D-29z1555).
- **REGRESSION is not due.** `regression-last.json` says 2026-11-10, so it is due at the first planning on or after 2026-11-13 [K7]. Next RETRO: round 450.
- **No new Saba answer** changes the order [K26].
- **Why now (L8):** five of the six scanners read only the top level of `app/components/arrangement` [K8] [K9]. ARCH-SPLIT will move files into subfolders, and a moved file would then pass silently.

## 1. What the tests do today (tagged)
- Five scanners list files with a non-recursive `readdirSync` of `app/components/arrangement`; HS1 has its own recursive walker [K9]. The folder has **0 subfolders** and 25 top-level `.tsx` files [K8].
- **Known blind spots,** each a deferred Low [K17]. The old patterns are still in place [K10].
  - NF2's `NUMBER_INPUT` has no left boundary before `type=` (A-R430-…-TYPE-BOUNDARY).
  - NF2's import stripper can swallow code after a side-effect import (A-R430-…-SIDE-EFFECT-IMPORT).
  - NF2 rejects a bare `className={STUDIO_NUMBER_FIELD_CLASS}` (A-R430-…-CLASSNAME-CONST).
  - RD2 does not see a spread after the literal type (A-R431-…-L1), counts `data-type=` as `type=` (…-L2), and rejects `datetime-local` (…-L3).
  - PG2 passes when a spread or `style=` on the same tag overrides the class, and misses `createElement('progress')` (A-R432-…-RV432-5).
  - SF2 misses a spread, and an apostrophe in a `//` comment inside a tag (A-R433-…-SF2).
  - DS4 reads the top-level folder only (GATE434-S2).
  - HS1's second branch matches `!event.repeat && event.key === 'Enter'` (A-R429-…-NEGATED-REPEAT).
- **Spread attributes on `<input>`:** exactly one, `ArrangementMixFader.tsx` l.60 (a range input), whose props type omits `'type'` [K11]. `ArrangementMarkerRow.tsx` has an object spread inside an `onChange` expression, which is not a spread attribute [K11].
- **Number fields:** the shared class reaches the three `type="number"` inputs through the `inputClass` template constant and an `inputClass` prop, not through a `className={CONSTANT}` on the tag [K12].
- **Tags today** [K13]:
  - 6 radios and 1 progress, all in `ArrangementExportDialog.tsx`;
  - search fields in `ArrangementLibrary.tsx` and `ArrangementShortcutSheet.tsx`;
  - `Modal` in `ArrangementExportDialog.tsx` and `ArrangementShortcutSheet.tsx`.
- **Docs 277–282** describe these scanners for their own rounds. Doc 282 point 7 states DS4's top-level scope [K14]. All six are records of their rounds and stay unedited; doc 285 states what it supersedes.

## 2. Rulings (D-29z1557)
- **(0) Engine: the TypeScript parser** (`ts.createSourceFile`, TSX; `typescript` is already a dependency).
  - The v1 sketch used a hand-written tag walker. Tech-lead's v1 review found that it reproduced the blind-spot class this task exists to close: a quote overrun (Medium), a silent skeleton fallback, `style = {x}` whitespace, nested-expression literals, and unescaped names (`b-round-437/tech-lead-review-v1.md`, findings 1, 3–6).
  - The parser removes all of them by construction:
    - a spread is a `JsxSpreadAttribute` node;
    - an attribute name is exact;
    - nested JSX is a separate node.
  - A source the parser marks with `ThisNodeHasError` throws `path:line` (SS2, H6), so the scanner never passes on a file it cannot read.
  - The v1 artifacts are kept in `b-round-437/v1/`.
- **(a) NF2** (tightened per tech-lead v1 finding 7 and v2 findings 1 and 3):
  - Each number tag's `className` is exactly `{inputClass}`, `{STUDIO_NUMBER_FIELD_CLASS}`, or `{cn(inputClass | STUDIO_NUMBER_FIELD_CLASS, …)}`. A ternary or any other carrier is red (M16).
  - When a tag uses `inputClass`:
    - the file declares `inputClass` exactly once, and its initializer contains the identifier `STUDIO_NUMBER_FIELD_CLASS` (AST, so the order inside the template is free);
    - every `inputClass=` hand-off attribute in the file is exactly `{inputClass}` (M15; `ArrangementDetailPanel.tsx` passes it to the Clip Gain field).
  - The owner file uses the constant outside its imports, counted by AST identifiers (imports, strings and comments do not count).
  - NF2 pins 3 tags and rejects a spread or `style` on any number tag.
  - The rendered half is F10 (the Detail panel render test, unchanged).
- **(b) The MixFader spread.** IN1 allows exactly one spread-attribute owner, `ArrangementMixFader.tsx`, and checks that its props type is `Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | …>`.
  - This is a **compile-time guard only.** A JSX spread of a wider object can still pass `type` at runtime, because `{...props}` comes after `type="range"`.
  - The app fix (move the spread before `type`) is filed as TL-R438-02-MIXFADER-SPREAD-ORDER, a deferred Low, and is not done in this test-only round.
  - **Ruling line (L4): on the `ArrangementMixFader` `<input>`, the IN1 allow-list wins over the "no spread on an input" rule.**
- **(c) RD2 and IN1 are split** (tech-lead v1 finding 8).
  - RD2 keeps the radio rule: 6 tags, each `className` exactly `{STUDIO_RADIO_CLASS}`, with no spread and no style.
  - The new id **IN1** holds the guards that protect every input: every arrangement `<input>` has a literal `type` matching `^[a-z-]+$`, and the only spread owner is the one allowed in (b).
- **(d) Scope** stays `app/components/arrangement`, now recursive. `app/components/studio/` is frozen legacy (Legacy removal policy, 2026-11-10). DS4 still pins only the legacy `ExportDialog.tsx` default [K14].
- **(e) HS1** stays a text regex over `.ts` and `.tsx` under `app/` and `perf/`, through the shared recursive walker. `REPEAT` gains the lookbehind `(?<![!\w.?])`, and HS2 gains two negated-repeat fixtures.
- **(f) Not closed by this round:**
  - **GATE431-REVIEW-L3-STRING-COUNT-PINS** lives in DXA7/DXL8. Those are other suites and string counts, not a scanner. It stays deferred, and its `systemic_task` tag is removed.
  - **GATE434-S2-DS4-SOURCE-SCAN-SCOPE** is closed for its subfolder half (M11). Its "StudioDialog render test" half stays with the ARCH-SPLIT checkpoint, under a new status.
  - The four suites with their own recursive walkers (`studio-focus-ring`, `studio-theme-obsidian`, `panel-radius-ui`, `strings`) are recorded as the signal SIG-R438-OTHER-SCANNERS. That is duplication, not a hole.
- **(g) Paths.** The helper resolves the store root from `__dirname`, so DS4 and SF2 no longer depend on `process.cwd()`.
  - Owner lists are paths relative to `app/components/arrangement`. Today these are the bare file names [K8] [K13].
  - A file moved into a subfolder shows up as `sub/File.tsx`, so the owner pins go red on purpose. ARCH-SPLIT must update them in the same change (added to the ARCH-SPLIT rules).
- **Closes, with each red-proof.** B's runs are in `b-round-437/mutants/head.jsonl`, `sketch.jsonl` and `helper.jsonl` [K24]:

| Id | Mutant | HEAD tests | Sketch tests |
|---|---|---|---|
| A-R430-REVIEW-NF2-TYPE-BOUNDARY | M1: `data-input-type="number"` on a text input | red NF2 (false red) | green |
| A-R430-REVIEW-NF2-CLASSNAME-CONST | M2: the three number tags take `className={STUDIO_NUMBER_FIELD_CLASS}` directly, and `inputClass` drops the constant | red NF2 (false red) | green |
| A-R430-REVIEW-NF2-SIDE-EFFECT-IMPORT | H3: the helper counts identifiers inside imports | — | red SS5 |
| A-R431-REVIEW-L1-RD2-SPREAD-AFTER-TYPE | M3: `{...radioOverrides}` on a radio | green (false pass) | red IN1, RD2 |
| A-R431-REVIEW-L2-RD2-DATA-TYPE | M4: `data-type="radio"` on a text input | red RD2 (false red) | green |
| A-R431-REVIEW-L3-RD2-DATETIME-LOCAL | M5: `type="datetime-local"` | red RD2 (false red) | green |
| A-R432-REVIEW-RV432-5-PG2-SPREAD | M6: spread; M7: `style=`; M8: `createElement('progress')` | green ×3 (false pass) | red PG2 ×3 |
| A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS | M9: spread on a search tag; M10: a `// …'s >` comment in the tag | M9 green (false pass); M10 green | M9 red SF2; M10 green (the parser reads comments by construction; SF1/SS1 comment fixtures) |
| GATE434-S2 (subfolder half) | M11: a new `dialogs/ArrangementNewDialog.tsx` with an unskinned `Modal` | green (false pass) | red DS4 |
| A-R429-REVIEW-SCAN-NEGATED-REPEAT | M12: `!event.repeat && event.key === 'Enter'` | red HS1 (false red) | green |
| (new guards, tech-lead v1 finding 7 and v2 finding 1) | M13: `style=` on a number input; M14: one number tag drops `inputClass`; M15: the `inputClass` hand-off becomes a string; M16: a ternary `className` carrier | green ×4 | red NF2 ×4 |
| helper rows | H1: no recursion; H2: no spread hazard; H4: no style hazard; H5: no `{'…'}` literal; H6: no syntax throw; H7: tag-name prefix match; H8: any call argument; H9: property-access names counted | — | red SS6; IN1 + SS4; SS4; SF1 + SS3; SS2; DS4 + SS2; SS7; SS5 |

## 3. What A changes (sketch `b-round-437/sketch-438.patch.txt`, sha256 `1b88d0ec860ff1bf14d9fcd9230686347fa8199d89e8b10391b6111aba1683ad`, 8 `diff ` headers) [K5] [K21]
From `store/`, run `git apply --check -p1 ../tmp/studio-real-loop/b-round-437/sketch-438.patch.txt`, then `git apply -p1 ../tmp/studio-real-loop/b-round-437/sketch-438.patch.txt`.
- Do not hand-edit the sketch.
- If the code-reviewer asks for a change, apply it only if `b-round-437/sketch-review.md` already rules on it. Anything else is a STOP (L11).

1. **New** `app/lib/arrangement/__tests__/helpers/source-scan.ts`:
   - `STORE_ROOT`, `ARRANGEMENT_COMPONENTS_DIR`;
   - `listSourceFiles` / `readSourceFiles`: recursive and sorted; they skip `__tests__`, `node_modules` and `*.test|spec.*`, and return posix relative paths;
   - `parseSource`: TSX via `ts.createSourceFile`, cached per path and text; throws `path:line` on `ThisNodeHasError`;
   - `jsxOpeningTags` / `scanJsxOpeningTags`: each result has `{ path, line, tag, attributes, attributeTexts, hazards }`;
   - `identifierUsesOutsideImports` (skips imports, `export { … }` and property-access names);
   - `callsWithStringArgument`;
   - `jsxAttributeTextsByName`, `variableInitializersUsing`.
2. **New** `app/lib/arrangement/__tests__/source-scan.test.ts`: fixtures SS1–SS8. SS6 builds a temp tree under `os.tmpdir()` and removes it in `afterEach`.
3. **Ported to the helper:**
   - `studio-number-field.test.ts` (NF2);
   - `studio-radio.test.ts` (RD2 and the new IN1);
   - `studio-progress.test.ts` (PG2);
   - `studio-search-field.test.ts` (SF1 gains the comment fixture, plus SF2);
   - `studio-dialog-scrollbar.test.tsx` (DS4);
   - `held-enter-source-scan.test.ts` (HS1 walker; HS2 fixtures).

   NF1, RD1, PG1 and DS1–DS3 are unchanged. No assertion is lost; there are only equal or stronger replacements (L4).
4. **Doc** `docs/implementation/2026/quarter-IV/285-sys-r435-source-scan-helper.md`. TEMPLATE headings in order. Line 4 is exactly `**სტატუსი:** Completed (C round 438 PASS)`. It contains:
   - the rulings (0) and (a)–(g);
   - the closes table with each mutant;
   - "docs 277–282 describe the old per-file scanners; doc 282 point 7 is superseded: DS4 is now recursive";
   - the not-closed items (f).

**STOP (L11)** if the sketch does not apply, a covering file is red, or any file outside the grants changes.

## 4. Grants (`b-round-437/grants-438.txt`, 9 paths)
The 8 sketch paths plus doc 285. Nothing else in `store/` may change.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | PASS means |
|---|---|---|
| A1 | `git apply --check -p1` the sketch, then apply it; from `store/`, `cmp` each path in `b-round-437/sketch-paths.txt` with `../tmp/studio-real-loop/b-round-437/sketch-files/<path>` | All 8 identical |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-437/covering-files.txt)` | rc 0. On B's sketch: **7 files, 23/23** (`b-round-437/covering-sketch.log`) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 for each; lint gives **205 warnings**, the same as HEAD (`b-round-437/lint-sketch.log`) |
| A4 | `bash ../tmp/studio-real-loop/b-round-437/claims-438.sh` | Differs from `b-round-437/claims-438-planning-output.txt` only in the lines of `b-round-437/claims-438-planning-vs-sketch.diff.txt`, plus K2 (A's tree) and K6 (doc 285 present) |

- **code-reviewer: required** (3+ files). A Medium+ it finds is a STOP unless `sketch-review.md` already rules on it. Its Architecture note goes into A's report for B.
- **Full suite:** B ran it on the v3 sketch: **273 files, 4028 tests, rc 0** (`b-round-437/full-suite-sketch.log`) [K25]. HEAD's last gate run was 272/4019; the change adds 1 file and 9 tests (SS1–SS8, IN1). It is a gate row.

## 6. C's acceptance
**Order:** C1, then the browser rows C7–C8, then the rest.
- Write `c-round-438.md` and `c-round-438.json` as you go.
- Never run vitest during a browser row (L38).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all`; the r438 manifest; the protected manifest | Only granted paths changed; both manifests give rc 0 |
| C2 | **PATCH-IDENTITY** | Apply the sketch to a `git archive HEAD` scratch and `cmp` the 8 files with the working tree | All identical; doc 285 is the only extra path |
| C3 | **NO-RUNTIME-CHANGE** | `git status --short` | Every changed path is under `app/lib/arrangement/__tests__/`, or is doc 285 |
| C4 | **COVERING** | A2 on the working tree | 7 files, 23/23, rc 0 |
| C5 | **MUTANTS** | Build two scratch trees, each with a `node_modules` symlink to `store/node_modules`: `git archive HEAD` (old), and the same plus the 8 working-tree test paths (new). Run `python3 -I b-round-437/mutants/mutate.py <old>`, then `… <new>`, then `python3 -I b-round-437/mutants/helper-mutants.py <new>`. The helper script reads `b-round-437/covering-files.txt`. Never run them in `store/` | Each output line equals B's `head.jsonl`, `sketch.jsonl` and `helper.jsonl` in `id`, `rc` and `fails`/`red` (the §2 table) |
| C6 | **SWEEP** | K11 and K13 on the working tree; `grep -n readdirSync` over the six ported files | One spread owner (`ArrangementMixFader.tsx`); tags as in §1; 0 `readdirSync` hits in the six files |
| C7 | **G438-AUTH (browser)** | Fresh anonymous context: open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake bearer: BLOCKED (backend unavailable in cloud) |
| C8 | **SMOKE + REAL EXPORT (browser), both viewports** | `cd c-round-438 && node ../b-round-437/probe/play-status.mjs > play-status.json` (the PNGs land in `c-round-438/`), then `node b-round-436/probe/press-export-probe.mjs http://127.0.0.1:5173 <abs dir under c-round-438/>` from the loop root | **Play** (a record row for C-R437-01): the status goes "Loading …", then "… is ready."; the second press plays and the clock advances (as in `b-round-437/probe/play-status.json`). **Export:** `czaba-studio-lab.wav`, 29189420 bytes, `RIFF`…`WAVE`, and the button returns to "Export WAV" at opacity 1 (the `export` key of `b-round-436/probe/sketch-press/press-export.json`) |
| C9 | **CLAIMS** | `bash b-round-437/claims-438.sh`, compared with `b-round-437/claims-438-planning-output.txt` | Allowed differences: `b-round-437/claims-438-planning-vs-sketch.diff.txt`, plus K2 (tree) and K6 (doc 285). Anything else is a finding |
| C10 | **DOC** | Doc 285 | TEMPLATE headings in order (L26); line 4 exact (L28); rulings (0) and (a)–(g), the closes table, the docs 277–282 note and (f) are present; the cited tests exist |
| C11 | **SOURCE-SCOPE** (end) + **L57** | As C1; then `python3 -I tools/l57-check.py c-round-438.json c-round-438/l57-check.txt` | As C1; then rc 0 |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** List them under `"gate"` |

- **C's JSON:** all L57 fields. `mutantRedOnSketch` names `b-round-437/mutants/sketch.jsonl` and `helper.jsonl`. Every bug carries an enum `origin`.
- **Ableton conformance:** does not apply (test-only).
- **Neighbouring behaviour that could break:**
  - other suites with their own scanners (DXA7/DXL8 string counts, SIG-R438-OTHER-SCANNERS) are untouched;
  - test-time temp files (SS6 must clean up);
  - the gate's Biome and timing (the covering set takes about 3 s).

## 7. Claims
- **Script:** `b-round-437/claims-438.sh`.
- **B's run at planning:** `b-round-437/claims-438-planning-output.txt`, with stderr in `claims-438-planning.err`.
- **On the sketch scratch** (`git clone --local` at `142918b` plus the sketch): `claims-438-sketch-output.txt`, diffed against the planning run in `claims-438-planning-vs-sketch.diff.txt`.

| Claim | What it checks |
|---|---|
| K1 | HEAD and gate 437 |
| K2 | Tree status: total, and paths outside the grants |
| K3 | The frozen manifest |
| K4 | The protected manifest, and how many protected files are granted |
| K5 | The sketch applies |
| K6 | The last implementation doc; doc 285 is absent |
| K7 | The regression date (`regression-last.json`) |
| K8 | Subfolders and the top-level `.tsx` count in `app/components/arrangement` |
| K9 | `readdirSync` in the six scanner files; whether the helper exists |
| K10 | The old patterns (`NUMBER_INPUT`, `RADIO_TYPE`, `LITERAL_TYPE [a-z]+`, `REPEAT` without the lookbehind) |
| K11 | SWEEP: spread-attribute owners on `<input>`; MixFader omits `type`; the MarkerRow object spread |
| K12 | The number-field class reaches its inputs through `inputClass` |
| K13 | Tag owners: radio, progress, search, Modal |
| K14 | Doc 282 point 7; the legacy `Modal` count |
| K15 | The cited artifacts exist |
| K16 | The archived task |
| K17 | Backlog ids (`tools/find-ids.py`) |
| K18 | The open Critical/High/Medium ids |
| K19 | The backlog version and the last D-ID |
| K20 | The `lessons.md` line count; the old L61 wording is gone (0) |
| K21 | The review names the sha; `l58-check` |
| K22 | C round 437 and its L57 check |
| K23 | The decode-refusal branch in `startPlaybackAt` (the cause of C-R437-01) |
| K24 | The mutant result files |
| K25 | The full run on the sketch: 273 files, 4028 tests, rc 0 |
| K26 | Saba's answer files, and the store-redesign direction decision |
