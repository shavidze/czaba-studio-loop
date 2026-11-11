# Round 444: SYS-3 stage 2a — IME composition in the Library search, the shortcut-sheet search and focus-source

**Planned by:** B, at the round 443 → 444 planning, 2026-11-11 (`b-round-443.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-443 task is archived as `tasks/round-443.md` (byte-identical copy, [K12]).
- **Runtime change:** while an IME composes, our handlers in the Library search and the shortcut-sheet search no longer clear the query, move focus or close the sheet, and typing with an IME, Android or AltGr no longer turns the focus ring on. The query value under a composing Escape belongs to the IME and the browser (see the element rulings). A held Escape after a swallowed composing Escape clears or closes nothing. Visible UI does not change for non-IME users. 4 source files, 2 test files, doc 288 l.4 [K11] and new doc 289 change (8 paths, `b-round-443/grants-444.txt`).
- **What does not apply, and why:** reference-first, `product-designer` and the screen budget. This is a bug-fix round with no visible change. There is no Ableton reference; the behaviour is the platform text-input standard (W3C UI Events `KeyboardEvent.isComposing`, `KeyboardEvent.repeat`, `getModifierState('AltGraph')`). Recorded as "no Ableton reference; platform standard".
- **Baseline:** gate 443 is `published`, commit `1eefb4c` [K1]. The store tree is clean at `1eefb4c` [K2].
- **Regression:** not due. `regression-last.json` is 2026-11-10 (round 425); the next is due on or after 2026-11-13.

## Decisions (`backlog.json` v429 → v430, `decisions_log_b`)
- **D-29z1576: round 443 accepted.** `c-round-443.json` is PASS with `browserVerified` true [K13]; gate 443 published `1eefb4c`.
  - Closed: C-R442-M1-HELD-KEY-UNRULED, A-R442-REVIEW-L1 and A-R442-REVIEW-L2.
  - A's review Lows A-R443-REVIEW-L1/L2 (origin B spec) are queued for stage 2b.
  - A's Architecture note is recorded as `confirmedBy` on SIG-R442-INLINE-EDITOR-KEYS (L7).
  - Gate-443 review (`gates/round-443/review.md`): GATE443-L1 (Tempo and Clip Gain repeat Escape is prevented but not stopped, so it bubbles; HEAD did the same) is a Low queued for stage 2b, which owns those handlers. Finding 2 needs no fix and finding 3 is covered by TLM-SYS3-IME-PLATFORMS. The gate's Architecture note is `confirmedBy` on SIG-R442 (stage 2b).
  - `docs/technical/store-redesign/direction-decision.md` exists, so STORE-2b…5 are not gated on Saba. They wait only for their place in the queue.
- **D-29z1577: SYS-3 stage 2 is split, and the stage-2a ruling.**
  - **2a (this round):** focus-source (A-R203-REVIEW-M1, A-R203-REVIEW-I1), Library search and the shortcut-sheet search. These are three bugs of one class.
  - **2b (next round):** the shared settle-key helper plus scan (SIG-R442-INLINE-EDITOR-KEYS), TL-R443-G3-PLAIN-HELD-ROWS and A-R443-REVIEW-L1/L2.
  - **Stage numbering (L28):** SYS-3 now has 3 stages. Doc 288 l.4 (today `… stage 1 of 2 …` [K11]) becomes `In Progress (stage 1 of 3; C round 443 PASS)`. New doc 289 l.4 reads `In Progress (stage 2 of 3; C round 444 PASS)`. Stage 2b grants both l.4 lines to `Completed`.
  - **Sheet-local guard, not `ui/Modal.tsx`** (tech-lead Q1). Modal has 3 importers: the two Studio dialogs and the protected legacy `app/components/studio/ExportDialog.tsx` [K25]. B's question to tech-lead said ~22; that was the count of all `~/components/ui` importers. The corrected count does not change the ruling, because a Modal change would still alter a protected file's behaviour with no loop evidence (`sketch-review.md` note). Modal and the other store dialogs → TL-R444-L2, `deferred_low_polish`.
  - **No `preventDefault` on composing keys** (tech-lead Q2, same rule as stage 1). The IME owns the key.
  - Tech-lead findings are ruled in `b-round-443/sketch-review.md`. L1 is a new TLM step. L2 goes to `deferred_low_polish`. L3, I1 and I2 are intended behaviour.
- **D-29z1578: order.**
  1. This round.
  2. SYS-3 stage 2b.
  3. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13. It goes first if it is due.
  4. STORE-REDESIGN 2b…5.
  5. ARCH-SPLIT (root's frontend-architect checkpoint first).
  6. REVIEW-RECOMMENDATIONS.
  7. T12-ADVANCED.
  8. Phase 2 under the skip rule.

  The next RETRO is round 450.

## Read first
Read `lessons.md`. These apply most: L4 (one element, one rule), L11 (STOP), L23 (the full suite ran on the sketch: 275 files / 4053 tests, rc 0 [K20]), L26, L28, L38 (no vitest during a browser probe), L47 (focus target), L50 (focus origins [K23]) and L56/L58 (every asserted number below comes from B's run on the dispatched sketch).

## 1. What changes
- Sketch: `b-round-443/sketch-444.patch.txt`; sha256 in `b-round-443/sketch-444.sha256` [K6].
- 6 paths are listed in `b-round-443/sketch-paths.txt`, with copies in `b-round-443/sketch-files/`.
- Review: `b-round-443/sketch-review.md` (tech-lead approve-with-changes, 0 Medium+, follow-ups only; reviewed sha = dispatched sha).

| Site | HEAD (`1eefb4c`) [K7][K8][K10] | After |
|---|---|---|
| `isFocusSourceFieldEditingKey` (focus-source) | First returns false on Ctrl/Meta/Alt or a non-string key. A composing, `Unidentified` (keyCode 229) or AltGraph character key in a text field switches the source to keyboard | (1) Return false only for a non-string key. (2) Return false for a non-text target, as before. (3) In a text field, `isComposing`, `key === 'Unidentified'`, keyCode 229, or a 1-char key with `getModifierState('AltGraph')` count as editing and keep `pointer`. (4) Then the Ctrl/Meta/Alt return, then the old key sets |
| Library search, `handleSearchKeyDown` | ArrowDown: `preventDefault` and focus the first result. Escape: `preventDefault` and clear | A composing key (`isImeCompositionKeyDown`) returns first: no `preventDefault`, no clear, no move. A repeat Escape still calls `preventDefault` but does not clear |
| Shortcut sheet, capture `keydown` on `window` | Escape: `preventDefault`. The Modal `document` listener then closes the sheet | A composing Escape (`isNativeImeCompositionKeyDown`): `stopPropagation`, no `preventDefault`, sheet stays open. A repeat Escape: `preventDefault` + `stopPropagation`, sheet stays open. A plain Escape is unchanged |
| `studio-ime-composition.ts` | `isImeCompositionKeyDown` (React event) | Adds `isNativeImeCompositionKeyDown` (native event: `isComposing` or keyCode 229). The React helper delegates to it |

- **Focus targets (L47):** a swallowed key leaves focus in the same field; nothing unmounts.
  - A fresh plain Escape in the Library search clears it and focus stays in the search.
  - A plain ArrowDown focuses the first result option, through the existing `requestAnimationFrame` [K31].
  - A plain Escape in the sheet closes it and focus returns to the opener. From the body this is the footer button "Keyboard shortcuts (?)", the same as HEAD (SS2).
- **Focus origins (L50):** the regex over the 4 granted source files finds 30 hits [K23] (`b-round-443/logs/l50-focus-origins.txt`). One class ruling covers them all: the sketch changes none of those lines. It only adds early returns that keep focus where it is, so no hit gets a new origin.
- **Inventory (L1):** 19 `input`/`textarea`/`contentEditable` sites in `app/components/arrangement` [K22] (`b-round-443/logs/inventory-inputs.txt`).
  - Stage 1 covers Tempo, marker, group, Detail From/To and Clip Gain.
  - This round covers the Library and sheet search.
  - The rest are `range`, `radio` and `file` inputs, plus the read-only narrow-screen link field. None has a text key handler, so they are out of scope.
  - Three window/document `keydown` listeners [K22] (`logs/inventory-global-keydown.txt`). The Workspace handler returns early for typing targets (`isTypingTarget(event.target)` [K30]).
- **Element rulings (L4):**
  - Library search and sheet search with a composing Escape: the "IME owns the key" clause wins over "Escape clears". **Measured fact** (B, sketch server): under the synthetic CDP sequence the query still empties, through the browser's default action of that keydown. A page capture listener that calls `preventDefault` on it keeps the query (`drso`, `plso`) [K28]. **Inference** (tech-lead Q2, not measured): a real IME takes the key first, so the default never runs. **Ruling:** we do not call `preventDefault` on composing keys, the query value is recorded and not asserted, and the real-IME check is a TLM step (TL-R444-L1).
  - AltGraph: **measured fact**, Playwright's `keyboard.down('AltGraph')` and CDP modifiers do not set `getModifierState('AltGraph')` in this Chromium [K29]. So the AltGraph half has no browser row: it is proved by jsdom FT9 and mutant M3, and the platform half (Windows AltGr, macOS Option) is a TLM step. A-R203-REVIEW-I1 closes at contract level on C PASS; its platform half stays on TLM-SYS3-IME-PLATFORMS.
  - Sheet with a repeat Escape: the "held key acts once" clause wins over "Esc closes the sheet". Only a fresh press closes it (TL-R444-I2).
- **Tests:**
  - `focus-source-typing.test.tsx` gains:
    - **FT7:** composing Enter, Escape, ArrowDown, Tab and Ctrl+K in text, search and textarea keep pointer; a button and the body still switch.
    - **FT8:** `Unidentified` and keyCode 229 keep pointer in a text field; a range input and a plain Escape still switch.
    - **FT9:** AltGraph `@`, `€` and `{` keep pointer, even with Ctrl+Alt. Ctrl+Alt without AltGraph, AltGraph+ArrowLeft and a button still switch.
  - New `ime-composition-stage2-ui.test.tsx`:
    - **IME8:** helper truth table.
    - **IME9** (×2 forms): Library search. The composing Escape keeps the query; the composing ArrowDown keeps focus and queues no focus frame; 3 held Escape repeats are prevented and clear nothing; the snapshot stays equal; a plain Escape clears; a plain ArrowDown queues one frame that focuses the "Hit" option.
    - **IME10** (×2 forms): sheet. The composing Escape does not reach a `document` listener; the sheet stays open with focus and query; the held repeats are prevented and keep it open; a plain Escape closes it and focus moves to the footer button.
- **Neighbours that could break:** `shortcut-sheet-ui` (SS2, SC4–SC6 Escape and Clear), the library suites (`library-row-strings-ui` Escape clears, `library-focus-handoff`, `library-video-return-focus`), `focus-source.test.tsx`, `store-focus-ring`, `studio-focus-ring`, and stage-1 `ime-composition-ui`.
  - All are in the 25-file covering set, which passes on the sketch with 440 tests [K15].
  - focus-source is store-wide. The full suite passes on the sketch [K20].

## 2. A — implementation (Claude Opus 5.5)
1. Precondition: `bash b-round-443/claims-444.sh | grep -E '^K(1|2|5|6) '` prints:
   - `K1 head 1eefb4c gate443 published 1eefb4c`
   - `K2 status total 0 outside-grants 0`
   - `K5 sketch-applies yes`
   - `K6 sketch-sha 567728dfdf67dafd expected 567728dfdf67dafd`

   Anything else is a STOP.
2. In the store, run `git apply --check -p1 <loop>/b-round-443/sketch-444.patch.txt`, then `git apply -p1 <loop>/b-round-443/sketch-444.patch.txt`. Do not hand-edit the sketch.
3. Doc 288 [K11]: change l.4 only, to exactly `**სტატუსი:** In Progress (stage 1 of 3; C round 443 PASS)`.
4. Create `docs/implementation/2026/quarter-IV/289-sys-3-stage-2a-ime-search-fields.md` (absent today [K11]). Write it in Georgian with English technical terms, following `docs/implementation/TEMPLATE.md` (L26 headings).
   - l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 444 PASS)`.
   - Content:
     - the 4-site table;
     - the sheet-local vs Modal decision (TL-R444-L2);
     - the IME-owns-the-key rule and the recorded native search clear (TL-R444-L1);
     - **A5:** a sentence saying that focus-source counting `Unidentified` while the native helper does not is intended (TL-R444-I1);
     - the composing Tab ruling (TL-R444-L3);
     - the 8 mutant ids from `b-round-443/mutants/results.jsonl`;
     - the browser lines (HEAD `NOT ALL OK (14 of 18 failing)`, sketch `ALL OK (18 cells)`);
     - FT7–FT9 and IME8–IME10.
   - In TODO, list stage 2b (shared settle-key helper + scan, TL-R443-G3, A-R443-REVIEW-L1/L2) and TLM-SYS3-IME-PLATFORMS with the new search-field step. Every test the doc names must exist (L26).
5. **Grants:** exactly 8 paths, `b-round-443/grants-444.txt`. Any other changed path is a STOP.

**A's checks (only these; the full suite is a gate row):**

| # | Check | Pass |
|---|---|---|
| A1 | `cmp` each path in `sketch-paths.txt` against `b-round-443/sketch-files/<path>` | 6/6 identical |
| A2 | `npx vitest run $(cat <loop>/b-round-443/covering-files.txt)` | rc 0, 25 files, 440 tests [K15] |
| A3 | `npm run typecheck`; `npm run lint`; `npx biome check $(cat <loop>/b-round-443/sketch-paths.txt)` | rc 0; rc 0 with `Found 205 warnings.` (HEAD and sketch both 205 [K17]); rc 0 |
| A4 | `bash b-round-443/claims-444.sh` after the change, diffed against `b-round-443/claims-444-sketch-output.txt`. That file is the script's output on B's clone of `1eefb4c` with the sketch applied and both doc l.4 lines in their final state. Against the planning output it differs only in K2 (`total 8 outside-grants 0`), K4 (`6/6`), K5 (`no`), K8, K9, K10 (`0`) and K11 | no diff (identical) |
| A5 | doc 289 contains `TL-R444-I1` and the 8 mutant ids | grep 1 each |

- 8 files change, so A runs `code-reviewer` (3+ files rule) and passes its Architecture note to B. A Medium+ finding that `sketch-review.md` does not rule is a STOP (L11).

## 3. C — verification (rows)
Write `c-round-444/progress.json` after every row (L59). Run C5–C6 before any vitest (L38). Write all L57 fields and run `tools/l57-check.py` before hand-off.

| Row | What | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status` paths ⊆ `grants-444.txt`; K3 protected rc 0 | the 8 granted paths only |
| C2 PATCH-IDENTITY | the 6 sketch paths vs `b-round-443/sketch-files/` | 6/6 identical |
| C3 COVERING | `npx vitest run $(cat b-round-443/covering-files.txt)` | rc 0, 25 files, 440/440 |
| C4 MUTANTS | `SCRATCH=<a directory that contains store/: C's own git archive of HEAD + sketch, node_modules symlinked> OUT=c-round-444/mut python3 -I b-round-443/mutants/run-mutants.py` (OUT must start empty) | 8 lines; each `id`, `rc` and `failedRows` equal `b-round-443/mutants/results.jsonl` [K24] |
| **C5 IME-SEARCH-BROWSER** | `BASE=http://127.0.0.1:5173 COMPOSE=so node b-round-443/probe/ime-stage2.mjs ALL 1440x900,1280x720 > c-round-444/tree.json`; `python3 -I b-round-443/probe/compare.py c-round-444/tree.json` | `ALL OK (18 cells)` [K16]. A cold-start `error` cell is environment-invalid: re-run it (max 2 replacements); it is never a FAIL. The LIB-ESC query value is recorded only (synthetic native clear, tech-lead Q2). This row proves the handler contract; real IME platforms stay TLM |
| C5-HEAD control | Start HEAD on :5177 (`b-round-440/probe/head-server.sh start <dir> 5177`, own cacheDir; stop by port), warm `/studio-lab` once in a browser, then run the same probe and compare | `NOT ALL OK (14 of 18 failing)`, with the same failing cells as `b-round-443/probe/compare-head.txt` |
| C6 NEIGHBOURS | `BASE=http://127.0.0.1:5173 node b-round-441/probe/ime-sites.mjs ALL 1440x900,1280x720 > c-round-444/sites.json` + `python3 -I b-round-441/probe/compare.py c-round-444/sites.json`; `BASE=… node b-round-442/probe/ime-held.mjs ALL 1440x900,1280x720 > c-round-444/held.json` + `python3 -I b-round-442/probe/compare-held.py c-round-444/held.json` | both `ALL OK (18 cells)`, as on B's sketch server [K26] |
| C7 FOCUS TARGETS (L47) | `SHOTS=c-round-444 BASE=http://127.0.0.1:5173 node b-round-443/probe/focus-targets.mjs > c-round-444/c7-tree.json`, and the same on C's HEAD server :5177 → `c-round-444/c7-head.json`; `python3 -I b-round-443/probe/compare-c7.py c-round-444/c7-tree.json c-round-444/c7-head.json`. Steps: (a) Library search, type `dr`, plain Escape; (b) plain ArrowDown from the search; (c) `?` then plain Escape. "Ring" = the focused element's computed `outline-style` is not `none` and `outline-width` > 0, or `box-shadow` is not `none` | `ALL SAME (6 cells)` with the ring true in each (B's sketch vs HEAD [K27]): (a) search focused, value `''`; (b) an `option`; (c) "Keyboard shortcuts (?)". Screenshots `c7a/b/c-<width>.png` |
| C8 SMOKE + AUTH | anonymous `/studio-lab`: `auth_user` null; `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, studio token 401; Play reaches Playing and Stop returns to Stopped at both viewports | as round 443 |
| C9 DOCS | doc 289: TEMPLATE headings in order, l.4 exact, 8 mutant ids, both browser lines, TL-R444-I1/L3 rulings, the TLM step; every named test exists (L26). doc 288 l.4 exact. `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 [K32] | all present |
| C10 SOURCE-SCOPE-END | rerun C1 | unchanged |
| C11 CLAIMS | run `bash b-round-443/claims-444.sh` and diff against `b-round-443/claims-444-sketch-output.txt`; run the L29 tag grep over this task | no diff; every store fact is tagged |
| gate | full vitest, typecheck, build, Biome, verify | `gate` (not claimed by C) |

- **CZABA requirement:** while an IME user composes in either Studio search field, CZABA's own handlers do not clear the query, move the focus or close the sheet (the query under a real IME's Escape is the TLM half). Typing with an IME, Android or AltGr does not turn the focus ring on mid-word.
- **Ableton conformance:** not applicable (platform standard).
- **Tech Lead manual (does not block):** TLM-SYS3-IME-PLATFORMS gains this step: on macOS Chrome with the Japanese IME and Windows Chrome with MS-IME, a composing Escape in the Library search and the sheet search keeps the query, and the sheet stays open (TL-R444-L1). Android: no focus ring while typing in the Library search. Windows AltGr `@`: no ring. Deadline RETRO 450.

## Claims (`b-round-443/claims-444.sh`; planning output `b-round-443/claims-444-planning-output.txt`; sketch output `b-round-443/claims-444-sketch-output.txt`)

| Tag | Claim | Expected at planning (HEAD `1eefb4c`) |
|---|---|---|
| [K1] | HEAD and gate 443 | `1eefb4c gate443 published 1eefb4c` |
| [K2] | clean tree | `total 0 outside-grants 0` |
| [K3] | protected files | `rc 0 granted-protected 0` |
| [K4] | tree vs sketch | `0/6` |
| [K5] | sketch applies | `yes` |
| [K6] | sketch sha | `567728dfdf67dafd` |
| [K7] | the handlers (`app/components/arrangement` Library/Sheet, `app/lib/focus-source.ts`, `app/components/ui/Modal.tsx`) | `library-search 1 sheet-capture 1 fs-predicate 1 modal-escape 1 search-types 1/1` |
| [K8] | IME guards absent | `library 0 sheet 0 focus-source 0 native-helper 0` |
| [K9] | new rows absent | `FT7 0 FT8 0 FT9 0 stage2-file absent` |
| [K10] | modifier early return first | `1` |
| [K11] | docs | doc 288 l.4 `… stage 1 of 2; C round 443 PASS)`, doc289 absent |
| [K12] | archive | `current-is-new archive443 present` |
| [K13] | C round 443 | `PASS True 0` |
| [K14] | mutants | `8 red 8` |
| [K15] | covering on sketch | `25`, `440 passed`, `rc 0` |
| [K16] | browser | sketch `ALL OK (18 cells)` / head `NOT ALL OK (14 of 18 failing)` |
| [K17] | typecheck / Biome / lint on sketch | `rc 0` / `rc 0` / `Found 205 warnings` both |
| [K18] | artifacts | `checked` |
| [K19] | `tools/l58-check.py current-task.md` | `L58 OK` |
| [K20] | full suite on sketch | `275 passed files 4053 passed tests rc 0` |
| [K21] | probe server source = sketch | `4/4` |
| [K22] | inventory | `inputs 19 global-keydown 3` |
| [K23] | L50 focus-origin hits | `30` |
| [K26] | stage-1 probes on B's full-sketch server | `sites 'ALL OK (18 cells)' held 'ALL OK (18 cells)'` |
| [K27] | C7 on B's sketch vs HEAD | `'ALL SAME (6 cells)'` |
| [K28] | native-clear experiment (sketch, 1440) | `prevent drso/plso control ''/''` |
| [K29] | AltGraph in Playwright Chromium | `altGraph-true 0 of 3 keydowns` |
| [K30] | Workspace typing-target checks (`StudioWorkspace.tsx`) | `4` |
| [K31] | Library option focus through rAF (`ArrangementLibrary.tsx`) | `1` |
| [K32] | `pending` status lines in `docs/implementation` | `0` |
| [K25] | Modal importers (`app/**/*.tsx`, excluding `__tests__`) | `3 protected 1` |
| [K24] | mutant red rows | `M1-FS-COMPOSE=FT7/FT8 M2-FS-MODIFIER-ORDER=FT7/FT9 M3-FS-ALTGRAPH=FT9 M4-LIB-GUARD=IME9 M5-LIB-REPEAT=IME9 M6-SHEET-GUARD=IME10 M7-SHEET-REPEAT=IME10 M8-NATIVE-229=IME10/IME8/IME9` |
