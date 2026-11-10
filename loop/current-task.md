# Round 442: SYS-3 stage 1 — an IME composition's Enter or Escape never commits or cancels a Studio inline editor

**Planned by:** B, at the round 441 → 442 planning, 2026-11-10 (`b-round-441.md`).
- The advisor was available and was consulted after orientation and before hand-off.
- The round-441 task is archived as `tasks/round-441.md` (byte-identical, [K12]).
- **Runtime change:** one new helper and a guard in five existing key handlers. The visible UI does not change. 4 source files change, plus 1 new source file, 1 new test file and the new doc 288 [K2].
- **What does not apply, and why:**
  - Reference-first, `product-designer` and the screen budget: this is a bug-fix round with no visible change and no new feature.
  - No Ableton reference applies. The behaviour is the platform text-input standard: W3C UI Events `KeyboardEvent.isComposing`, plus WebKit's keyCode 229 on the Enter that commits a composition. This is recorded as "no Ableton reference; platform standard".
- **Baseline:** gate 441 is `published`, commit `5d81795` [K1]. The store tree is clean at `5d81795` [K2].
- **Regression:** not due. `regression-last.json` is 2026-11-10 (round 425), and the next one is due on or after 2026-11-13.

## Decisions (`backlog.json` v427 → v428, `decisions_log_b`) [K15]
- **D-29z1570: round 441 is accepted.**
  - `c-round-441.json` is PASS, with `browserVerified` true and 0 bugs [K16]. Gate 441 published `5d81795` [K1].
  - SYS-1 is done (stages 1 and 2). GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR and GATE81-S2-UM8-SOURCE-TEXT are closed.
  - A-R441-REVIEW-L1-OUTLINE-ORDER was ruled from the test file itself. A's reviewer is right: in the full state the two tests check only the parent, and only the empty-state test pins the order. It is Low, origin B spec, and goes to `deferred_low_polish`.
  - Gate-441 review Lows 1 and 2 become GATE441-L1-VIDEO-CLIENT-MOCK-FILEWIDE and GATE441-L2-UM8B-POLL-LOOP, both deferred.
  - The gate's Architecture note becomes SIG-R441-SOURCE-PIN-RULING: a signal only, a RETRO-450 question.
- **D-29z1571: this dispatch.**
  - SYS-3 is split into two stages; no scope is dropped.
  - Stage 2 (next) covers:
    - `focus-source.ts`, for A-R203-REVIEW-M1 and A-R203-REVIEW-I1;
    - the Library search's Escape and ArrowDown;
    - the shortcut sheet's Escape through the shared Modal's document listener [K11]. A tech-lead question decides between a Modal guard and a sheet-local guard.
  - The platform half goes to the Tech Lead list as TLM-SYS3-IME-PLATFORMS, deadline RETRO 450 (L46).
- **D-29z1572: the order.**
  1. SYS-3 stage 2.
  2. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13. It goes first if it is due.
  3. STORE-REDESIGN 2b…5.
  4. ARCH-SPLIT (frontend-architect checkpoint through root first).
  5. REVIEW-RECOMMENDATIONS.
  6. T12-ADVANCED.
  7. Phase 2 under the skip rule.

  Next RETRO: round 450.

## Read first
`lessons.md`. Apply especially:
- **L4:** no assertion lost.
- **L11:** STOP on an unruled reviewer finding of Medium or higher.
- **L23:** collision sweep. B ran all 60 covering files and the full suite (274 files, 4041 tests [K19]) on the dispatched sketch v2, plus the scoped Biome check (`b-round-441/biome-scoped-sketch.log`, rc 0).
- **L29:** tagged claims.
- **L38:** never run vitest while a browser probe runs.
- **L47:** focus target.
- **L50:** inventory by grep.
- **L56:** cited artifacts exist.
- **L58:** the sketch review names the dispatched sha.

## 0. Why this round
- No Critical or High finding is open. 7 Mediums are open [K14]. All of them are root, manual or Saba items, or are parked in REVIEW-RECOMMENDATIONS (`context/active-summary.md`). None of them is loop-fixable now.
- SYS-3 is the next queue step after SYS-1 (D-29z1569).
- **The bug is real in the cloud browser.** B ran real Chromium at HEAD:
  1. an IME composition through CDP `Input.imeSetComposition`;
  2. one real Enter or Escape keydown, which reaches the page with `isComposing: true`.

  At HEAD, every one of the 9 cells × 2 viewports commits or cancels the editor [K21]:
  - BPM blurs and sets 96 BPM;
  - the marker is added as "7";
  - the group is renamed "7";
  - the From field applies a time selection;
  - Clip Gain applies +7 dB;
  - each Escape cancels.

  `probe/compare-head.txt` is `NOT ALL OK (18 of 18 failing)`. A user typing Japanese, Chinese, Korean or another IME text loses the editor when confirming a candidate.
- No grep hit for `isComposing` exists under `app/components/arrangement/` at HEAD [K7].

## 1. What changes (sketch `b-round-441/sketch-442.patch.txt`, sha256 in `b-round-441/sketch-442.sha256`, 6 paths in `b-round-441/sketch-paths.txt`)

**Helper (new `app/components/arrangement/studio-ime-composition.ts`, absent at HEAD [K13]):**
- `isImeCompositionKeyDown(event)` returns `event.nativeEvent.isComposing || event.keyCode === 229`.
- Its parameter is the structural `ImeCompositionKeyEvent`, so there is no type assertion anywhere.

**Guards (each handler exists once at HEAD [K8]):**

| Site | Handler | Guard placement |
|---|---|---|
| BPM field (`arrangement-tempo-input` [K10]) | `handleTempoKeyDown`, `ArrangementTempoRow.tsx` | first line: return |
| Marker name editor (`arrangement-marker-name-input`) | inline Enter/Escape branch, `ArrangementMarkerRow.tsx` | `stopPropagation()` → guard return → `preventDefault()` → repeat check → settle |
| Group name editor (`arrangement-group-name-input`) | inline Enter/Escape branch, `ArrangementGroupHeader.tsx` | same order as the marker editor |
| Detail From / To (`arrangement-detail-start` / `-end`) | `handleRangeInputKeyDown`, `ArrangementDetailPanel.tsx` | first line: return |
| Detail Clip Gain (`arrangement-detail-clip-gain-input`) | `handleClipGainKeyDown`, `ArrangementDetailPanel.tsx` | first line: return |

**Rulings (tech-lead, `b-round-441/sketch-review.md`):**
- **R1, the guard order.** In the marker and group editors, a composing key is still stopped from reaching ancestors, as at HEAD, but is not default-prevented, so the browser finishes the composition. The NOSTOP and PD mutants pin this order.
- **R2, keep keyCode 229.** Safari's committing Enter has `isComposing` false and keyCode 229. Android keys that send 229 carry `key: "Unidentified"` and never reach an Enter/Escape branch.
- **R3, out of scope:**
  - blur mid-composition (Low): the browser finalizes the composition before blur;
  - the Library search, the shortcut sheet and `focus-source.ts`: stage 2.

**Inventory (L50):**
- The grep over `app/components/arrangement` finds 19 `<input`/`textarea`/`contentEditable` lines [K9]. Seven of them are text-entry fields with a key handler [K9]:
  - the five sites above (the range handler has two fields);
  - the Library search, which is stage 2.
- The shortcut-sheet search has no `onKeyDown`. Its Escape comes from Modal [K11], which is stage 2.
- `StudioWorkspace`'s window `handleKeyDown` returns early for typing targets [K11], so it never acts on these fields.
- B's list is in `b-round-441/inventory-inputs.txt`.

**Focus (L47):** a composing key leaves focus in the same field (no unmount). A later plain Enter or Escape behaves exactly as at HEAD, with the same focus targets.

**Neighbours that could break:**
- the held-Enter guards in the same handlers (`preventRepeatedEnterKeyDown` and `event.repeat`);
- Escape propagation from the marker and group editors;
- the blur commit path;
- the perf spec's Detail locator [K22]: its name is unchanged, and so is its non-composing behaviour.

## 2. A — implementation (Claude Opus 5.5)
1. Precondition: `bash b-round-441/claims-442.sh | grep -E '^K(1|2|6) '` must print `K1 head 5d81795 gate441 published 5d81795`, `K2 status total 0 outside-grants 0` and `K6 sketch-applies yes`. Anything else is a STOP.
2. In the store, run `git apply --check -p1 <loop>/b-round-441/sketch-442.patch.txt`, then `git apply -p1 <loop>/b-round-441/sketch-442.patch.txt`. Do not hand-edit the sketch.
3. Write `docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md` (number 288 is free [K13]):
   - follow `docs/implementation/TEMPLATE.md` [K25] in Georgian, with English technical terms;
   - line 4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 442 PASS)` (L28);
   - include the site table, rulings R1–R3, the mutant table from `sketch-review.md`, the HEAD browser repro (18/18) and the stage-2 TODO (M1/I1, Library search, Modal/sheet Escape);
   - include TLM-SYS3-IME-PLATFORMS.
4. **Grants (exactly 7 paths):** `b-round-441/grants-442.txt`. Any other changed path is a STOP.

**A's checks (only these; the full suite is a gate row):**

| # | Check | Pass |
|---|---|---|
| A1 | `cmp` each path in `sketch-paths.txt` against `b-round-441/sketch-files/<path>` | 6/6 identical |
| A2 | `npx vitest run $(cat <loop>/b-round-441/covering-files.txt)` | rc 0, 60 files, 1114 tests [K20] |
| A3 | `npm run typecheck`; `npm run lint`; scoped `npx biome check` on the 6 sketch paths | rc 0; 205 warnings [K24]; rc 0 |
| A4 | `bash b-round-441/claims-442.sh`, diffed against `b-round-441/claims-442-planning-output.txt` | equals `b-round-441/claims-442-expected-after-A.diff.txt` (only K2, K5, K6, K7 change) |

- A runs `code-reviewer`, because 7 files change, and passes its Architecture note to B.
- A Medium+ finding that `sketch-review.md` does not rule is a STOP (L11).

## 3. C — verification (rows)
Write `c-round-442/progress.json` after every row (L59). Run C6 before any vitest (L38).

| Row | What | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status` paths ⊆ `grants-442.txt`; K3 frozen rc 0; K4 protected rc 0 | 7 granted paths only |
| C2 PATCH-IDENTITY | the 6 sketch paths in the tree vs the sketch applied on a `git archive HEAD` copy | 6/6 identical |
| C3 COVERING | `npx vitest run $(cat b-round-441/covering-files.txt)` | rc 0, 60 files, 1114/1114 |
| C4 MUTANTS | copy `b-round-441/mutants/run-mutants.py` into `c-round-442/`, point its scratch path at C's own `git archive HEAD` + sketch copy and its output folder at `c-round-442/mut/` (env `SCRATCH` and `OUT`; `OUT` must start empty, because the runner appends to `results.jsonl`), run all 14 | each line's `id`, `rc` and failed-row count equal `b-round-441/mutants/results.jsonl` (14 red) |
| C5 CLAIMS | run `claims-442.sh` verbatim; run the L29 tag grep over this task | diff equals the expected-after-A diff; no untagged store fact |
| **C6 IME-BROWSER** | `BASE=http://127.0.0.1:5173 node b-round-441/probe/ime-sites.mjs ALL 1440x900,1280x720 > c-round-442/ime-sites-tree.json`, then `python3 -I b-round-441/probe/compare.py c-round-442/ime-sites-tree.json` | `ALL OK (18 cells)`: at both viewports, for every site, the composing key is seen; focus, value, status, markers, group name and the open editor stay; then, after the IME commit, a plain Enter commits (96 BPM, marker "7", group "7", time selection 00:07.000, Clip Gain +7.0 dB) |
| C6-HEAD control | start HEAD on :5177 (`b-round-440/probe/head-server.sh start <dir> 5177`, stopped by PID), warm it with one `/studio-lab` page load, run the same probe with `BASE=http://127.0.0.1:5177`, compare | zero cells with `error`, and the compare output equals `b-round-441/probe/compare-head.txt` line for line (the bug reproduces in C's own job). A cold-start error cell is environment-invalid and is re-run (one of the 2 replacement attempts), never counted as a HEAD failure |
| C7 SMOKE + AUTH | anonymous `/studio-lab` opens (auth_user null, "Sign in required" on the protected path, 0 `audio[src]`, studio token 401, recipe as in round 441); Play at both viewports reaches ready and plays | as round 441 |
| C8 HELD-ENTER neighbour | `record — not run on sketch: jsdom held-Enter rows for the marker and group editors are in the covering set (C3)`; optional browser cells MEDIT (`b-round-428/probe/held-enter-s5.mjs`) and GEDIT (`b-round-425/probe/held-enter-2a.mjs`): firstActed true, heldChanged [], pageErrors [] | record |
| C9 DOC-288 | TEMPLATE headings in order; line 4 exact; site table, R1–R3, the 14 mutant ids, TLM-SYS3-IME-PLATFORMS and the stage-2 TODO present; every test it names exists (L26) | all present |
| C10 SOURCE-SCOPE-END | rerun C1 at the end | unchanged |
| gate | full vitest, typecheck, build, Biome, verify | `gate` (not claimed by C) |

**Ableton conformance:** not applicable (platform text-input standard; no Ableton reference). **CZABA requirement:** IME users can type in every stage-1 editor without losing it.

**Tech Lead manual (does not block):**
- TLM-SYS3-IME-PLATFORMS: macOS and Windows IME in Chrome and Safari, plus a plain Enter on an Android soft keyboard.
- Deadline RETRO 450.

## Claims (`b-round-441/claims-442.sh`; planning output `b-round-441/claims-442-planning-output.txt`)

| Tag | Claim | Command (in the script) | Expected at planning |
|---|---|---|---|
| [K1] | HEAD and gate 441 | `git rev-parse` + gate JSON | `5d81795 gate441 published 5d81795` |
| [K2] | clean tree | `git status --short` | `total 0 outside-grants 0` |
| [K3] | frozen manifest | `sha256sum -c r442-frozen-sha256.txt` | `1347 rc 0` |
| [K4] | protected files | `sha256sum -c b-round-318/protected-sha256.txt` | `rc 0 granted-protected 0` |
| [K5] | tree vs sketch | `cmp` | `0/6` |
| [K6] | sketch applies | `git apply --check` | `yes` |
| [K7] | no IME guard today | grep `isComposing` / helper calls in `app/components/arrangement` | `0` / `0` |
| [K8] | the five handlers | grep counts | `tempo 1 range 1 gain 1 marker-editor 1 group-editor 1` |
| [K9] | input inventory | grep `<input`/textarea/contentEditable | `19`, text-entry with keydown `7` |
| [K10] | testids | grep `data-testid=` | each `=1` |
| [K11] | listeners | grep `isTypingTarget(event.target)` early return, Modal Escape, Library `handleSearchKeyDown` | `1 1 1` |
| [K12] | archive | `cmp tasks/round-441.md` | `identical` |
| [K13] | new paths | `git cat-file -e`, doc folder | `absent absent doc288 0 last-doc 287-…` |
| [K14] | open Critical/High/Medium | backlog filter | `7` |
| [K15] | backlog | version, last D-ID | `v428 D-29z1572` |
| [K16] | C round 441 | JSON | `PASS True 0` |
| [K17] | sketch review | sha in `sketch-review.md`; `tools/l58-check.py` | `2 L58 OK` |
| [K18] | mutants | `results.jsonl` | `14 red 14` |
| [K19] | full suite on the dispatched sketch v2 | `precheck-full-v2.log` | `274 / 4041 rc 0` |
| [K20] | covering on v2 | `covering-sketch.log` | `60`, `1114`, `rc 0` |
| [K21] | browser | `compare-sketch.txt` / `compare-head.txt` | `ALL OK (18 cells)` / `NOT ALL OK (18 of 18 failing)` |
| [K22] | perf locators | grep in `perf/studio-lab-interactions.perf.spec.ts` | `1` |
| [K23] | artifacts | `test -f` list | `artifacts checked`, no MISSING |
| [K24] | lint warnings on sketch | `lint-sketch.log` | `205` |
| [K25] | doc template exists | `test -f docs/implementation/TEMPLATE.md` | `yes` |
