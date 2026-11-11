# Round 445: SYS-3 stage 2b (last) — one key-intent helper for the five inline editors, and a held Escape no longer collapses the floating video

**Planned by:** B, at the round 444 → 445 planning, 2026-11-11 (`b-round-444.md`).
- The advisor was available and was consulted after orientation and before hand-off.
- The round-444 task is archived as `tasks/round-444.md` (byte-identical copy made before this file was rewritten) [K11].
- **Runtime change, one user-visible behaviour:** with the floating video expanded, a held Escape that closes the shortcut sheet, the Export dialog, the BPM edit or the marker editor no longer collapses the video through its auto-repeat keydowns. A fresh Escape still returns the video as before. The five inline-editor handlers move onto one helper with **no** behaviour change (HEAD truth table pinned, IME12). 6 source files, 4 test files and 3 docs change (13 paths, `b-round-444/grants-445.txt`).
- **What does not apply, and why:** reference-first, `product-designer` and the screen budget. This is a bug-fix and refactor round with nothing added to the screen. There is no Ableton reference for IME or auto-repeat handling; the rule is the platform text-input standard (W3C UI Events `KeyboardEvent.isComposing`, `KeyboardEvent.repeat`) and the loop's "a held key acts once" rule (L4 ruling from round 443). Recorded as "no Ableton reference; platform standard".
- **Baseline:** gate 444 is `published`, commit `616729c` [K1]. The store tree is clean [K2].
- **Regression:** not due. `regression-last.json` is 2026-11-10 [K25]; the next one is due on or after 2026-11-13.

## Decisions (`backlog.json` v430 → v431, `decisions_log_b`)
- **D-29z1579: round 444 accepted** from C evidence: `c-round-444.json` PASS, `browserVerified` true, 0 bugs [K12]; gate 444 published `616729c`.
  - A-R203-REVIEW-M1 is closed.
  - A-R203-REVIEW-I1 is closed for the **AltGr half only**. Gate-444 finding 1: Chrome and Safari on macOS do not report AltGraph for Option+character, so that path is unchanged. It is split out as **GATE444-L1-MACOS-OPTION** (Low, `deferred_low_polish`, plus a TLM step). No macOS heuristic is chosen without a real Mac.
  - A-R444-REVIEW-L1 (Cmd+Option and `metaKey`) → **A-R444-REVIEW-L1-ALTGRAPH-META**, `deferred_low_polish`. `focus-source.ts` is not owned by this stage (tech-lead R3).
  - A-R444-REVIEW-I1 (rated Info by A's reviewer) is **reproduced in real Chromium by B** and raised to Low: **A-R444-REVIEW-I1-HELD-ESC-VIDEO**, fixed in this round.
  - Gate-444 finding 2 needs no fix. Finding 3 (the Library repeat Escape does not stop propagation) is noted in doc 290. Finding 4 is info.
  - Gate Architecture note → SIG-R444-COMPOSING-LIB-HELPER (signal only). A's Architecture note → `confirmedBy` on TL-R444-L2.
- **D-29z1580: round 445 = SYS-3 stage 2b.**
  - **Why a Low is fixed now:** under the 2026-10-23 rule, a new Low is fixed early only when the round owns the code and the cost is small. A-R444-REVIEW-I1 qualifies: it is the same held-key class as TL-R443-G3, the fix is one guarded line, and HEAD is red in 8 browser cells.
  - Closes on C PASS: TL-R443-G3-PLAIN-HELD-ROWS, A-R443-REVIEW-L1/L2, A-R444-REVIEW-I1-HELD-ESC-VIDEO, and SIG-R442-INLINE-EDITOR-KEYS (implemented).
  - **GATE443-L1 is ruled "no user-visible effect"** (tech-lead R1 confirmed). The Workspace window handler returns for typing targets [K26]. Tempo blurs on the fresh press, so its repeats target the body and are handled by this round's fix. B's probe shows Clip Gain and Library-search held Escape leave the video expanded at HEAD (`b-round-444/probe/head.json`, GAIN and LIBSEARCH cells). Propagation stays as at HEAD (IME12). The finding closes when C's run of the same cells passes.
  - New items: TL-R445-R4-LEADMAGNET-INLINE-COMPOSING (store-side Low, deferred) and TL-R445-I1-SCAN-NESTED-DESTRUCTURING (signal only).
- **D-29z1581: order after this round.**
  1. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13. It goes first if due.
  2. STORE-REDESIGN 2b…5.
  3. ARCH-SPLIT (root's frontend-architect checkpoint first).
  4. REVIEW-RECOMMENDATIONS.
  5. T12-ADVANCED.
  6. Phase 2 under the skip rule.

  The next RETRO is round 450. SYS-3 is complete on this round's C PASS.

## Read first
Read `lessons.md`. These apply most:
- L4: one element, one rule. The "held key acts once" clause wins over "Esc returns the video" for repeat keydowns.
- L11: STOP.
- L23 and L58: every asserted number below comes from B's run on the dispatched sketch.
- L26 and L28: docs.
- L31: timeout headroom is checked; the files that gain rows peak at 807 ms against the 5 s default (`b-round-444/logs/l31-headroom.txt`).
- L38: no vitest during a browser probe.
- L47: focus targets.
- L49: kept side effects.
- L50: focus origins.

## 1. What changes
- Sketch: `b-round-444/sketch-445.patch.txt`, sha256 in `b-round-444/sketch-445.sha256` [K6].
- 10 paths are listed in `b-round-444/sketch-paths.txt`, with copies in `b-round-444/sketch-files/`.
- Review: `b-round-444/sketch-review.md`. tech-lead gave v1 approve-with-changes with 0 Medium+; L1–L3 and Info 1 are applied in v2; the v2 delta was approved. The reviewed sha equals the dispatched sha.

| Site | HEAD (`616729c`) [K7][K8] | After |
|---|---|---|
| `studio-ime-composition.ts` | `isImeCompositionKeyDown`, `isNativeImeCompositionKeyDown` | Adds `InlineEditorSettleKey` (`'Enter' \| 'Escape'`), `INLINE_EDITOR_SETTLE_KEYS`, `INLINE_EDITOR_ENTER_ONLY_KEYS` and `inlineEditorKeyIntent(event, keys)`. It returns `other` (the key is not in the list), then `composing` (`isComposing` or keyCode 229), then `held` (`repeat`), else `settle`. It is pure and has no side effects |
| BPM `handleTempoKeyDown` | inline composing check, then Enter / Escape branches with their own repeat checks | `other`/`composing` → return; else `preventDefault`; `held` → return; Escape → skip commit + drop the draft; then `blur()` |
| Marker and group name editors | Enter/Escape: `stopPropagation` first, then the composing return, `preventDefault` and the repeat check | Same order through the intent: `other` → return; `stopPropagation`; `composing` → return; `preventDefault`; `settle` → `settleEditor` |
| Detail From/To `handleRangeInputKeyDown` | composing return; Enter → `preventDefault`, apply when not repeated | `INLINE_EDITOR_ENTER_ONLY_KEYS`; `other`/`composing` → return; `preventDefault`; `settle` → apply |
| Clip Gain `handleClipGainKeyDown` | composing return; Enter or Escape → `preventDefault`, act when not repeated | `other`/`composing` → return; `preventDefault`; `held` → return; Enter → commit; `else if` Escape → revert the text |
| `StudioWorkspace` window Escape branch, video expanded | `preventDefault` + `returnFloatingVideo()` for every Escape, repeats included [K24] | `preventDefault` always; `returnFloatingVideo()` only when `!event.repeat`. No later Escape branch exists in that handler (tech-lead R2) |

- **Kept side effects (L49):** every handler keeps its HEAD `preventDefault`, `stopPropagation`, blur, commit, cancel and revert calls, in HEAD order, for every key × {composing, held, plain} cell. IME12 pins the HEAD table (`defaultPrevented`, reached `document`); B ran it unchanged on a clean `616729c` copy: 10 passed, rc 0 [K22] (`b-round-444/logs/headrun-truth-table.log`). The only removed effect is the video return on a repeat Escape, which is the fix.
- **Focus targets (L47):** a swallowed held key leaves focus where the fresh press put it. In the browser, measured by B (`b-round-444/probe/head.json` vs `sketch-merged.json` `afterFresh`, `FRESH ALL SAME (14 cells)` [K16]):

  | Fresh Escape on | Focus after it |
  |---|---|
  | Sheet | the footer button "Keyboard shortcuts (?)" |
  | Export | its opener, the toolbar button "Export" (`b-round-444/probe/export-focus-head.json`, both viewports) |
  | Tempo | focus leaves the field, through the HEAD `blur()` (round 443 wording). This round neither changes nor rules that target; it is pre-existing and out of scope here |
  | Marker editor | `arrangement-marker-add` |
  | Clip Gain | stays in the field |
  | Library search | stays in the field |

  Nothing new unmounts.
- **Focus origins (L50):** `grep -nE 'onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)'` over the 6 granted source files finds 62 hits at HEAD [K23] (`b-round-444/logs/l50-focus-origins.txt`). The sketch changes one source line that matches: the group editor's `settleEditor(...)`, which is re-indented under `intent === 'settle'`, the same guard as HEAD's `!event.repeat` after the composing return (`b-round-444/logs/l50-changed-lines.txt`). One class ruling: no hit gets a new origin.
- **Element rulings (L4):**
  - Held Escape with the video expanded: "held key acts once" wins. Only a fresh Escape returns the video.
  - GATE443-L1: HEAD propagation is kept and not unified (tech-lead: `stopPropagation` legitimately differs per editor).
- **Tests:**
  - **`ime-composition-ui.test.tsx`: IME6 is split** into 3 editors × 2 forms, titled `IME6 held key after a composing key, %s editor (%s): …`. Clip Gain's final assertion becomes `toBe(shown)` (A-R443-REVIEW-L1/L2).
  - **New `ime-composition-stage2b-ui.test.tsx`:**
    - **IME11:** helper table.
    - **IME12** (×5 editors): HEAD truth table.
    - **IME13** (5 rows, TL-R443-G3): a plain held Enter/Escape (repeat only, no IME) on BPM, marker, group, From and Clip Gain changes nothing; then a fresh key acts once.
  - **New `ime-composition-source-scan.test.ts`:**
    - **IME14:** no inline `isComposing`, keyCode/which 229 or destructured `isComposing` in `app/components/arrangement` outside the helper [K9]. The 4 editor files call `inlineEditorKeyIntent`; only Library and the shortcut sheet call the composition helper directly.
    - **IME15:** pattern self-test.
  - **`floating-video.test.tsx`: FV-HELD.** Three repeat Escapes on `window` are prevented and keep the video floating; a fresh Escape returns it.
- **Neighbours that could break:** the stage-1/2a IME suites, `floating-video`, the tempo, marker, group, Detail and Clip Gain suites, and `held-enter-*`. All are in the 60-file covering set, which passes on the sketch with 1082 tests [K14]. The full suite passes on the sketch: 277 files, 4071 tests, rc 0 [K15].

## 2. A — implementation (Claude Opus 5.5)
1. **Precondition:** run `bash b-round-444/claims-445.sh | grep -E '^K(1|2|5|6) '`. It must print:
   - `K1 head 616729c gate444 published 616729c`
   - `K2 status total 0 outside-grants 0`
   - `K5 sketch-applies yes`
   - `K6 sketch-sha 07714283ff34c710 expected 07714283ff34c710`

   Anything else is a STOP.
2. In the store, run `git apply --check -p1 <loop>/b-round-444/sketch-445.patch.txt`, then `git apply -p1 <loop>/b-round-444/sketch-445.patch.txt`. Do not hand-edit the sketch.
3. **Doc 288** (`docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md` [K10]), granted lines only:
   - l.4 becomes exactly `**სტატუსი:** Completed (C round 445 PASS)` [K10].
   - In the test-title list, the IME6 bullet (today the old title, ×1 [K28]) becomes the new title verbatim (copy it from the test file), followed by ` (round 443; round 445-ში editor-ებად დაიყო)`.
4. **Doc 289**, granted lines only:
   - l.4 becomes exactly `**სტატუსი:** Completed (C round 445 PASS)` [K10].
   - In l.13, `(Windows AltGr, macOS Option)` (×1 today [K28]) becomes `(Windows/Linux AltGr)`.
   - Directly after the FT9 title bullet, add one sentence: FT9 proves AltGr only (a synthetic `AltGraph` modifier), and macOS Option+character in Chrome/Safari is not covered (GATE444-L1-MACOS-OPTION, deferred).
5. **New doc 290:** `docs/implementation/2026/quarter-IV/290-sys-3-stage-2b-inline-editor-key-intent.md`, absent today [K10]. Write it in Georgian with English terms, using the `TEMPLATE.md` headings (L26). l.4 is exactly `**სტატუსი:** Completed (C round 445 PASS)`. Content:
   - the site table above;
   - the HEAD truth table and why it is kept (IME12; GATE443-L1 ruling);
   - the held-Escape video fix with both browser lines (HEAD `NOT ALL OK (8 of 14 failing)`, sketch `ALL OK (14 cells)` / `FRESH ALL SAME (14 cells)`), and the note that FV-HELD is synthetic while the Chromium probe is the main evidence (tech-lead Info 2);
   - gate-444 finding 3 (the Library repeat Escape is prevented and not stopped; harmless);
   - the 12 mutant ids from `b-round-444/mutants/results.jsonl`;
   - the test titles IME6 (new), IME11–IME15 and FV-HELD;
   - the tech-lead keep note.

   In TODO, list:
   - GATE444-L1-MACOS-OPTION;
   - A-R444-REVIEW-L1-ALTGRAPH-META;
   - SIG-R444-COMPOSING-LIB-HELPER;
   - TL-R445-I1;
   - TLM-SYS3-IME-PLATFORMS (deadline RETRO 450).

   Every test the doc names must exist (L26).
6. **Grants:** exactly 13 paths, `b-round-444/grants-445.txt`. Any other changed path is a STOP.

**A's checks (only these; the full suite is a gate row):**

| # | Check | Pass |
|---|---|---|
| A1 | `cmp` each path in `sketch-paths.txt` against `b-round-444/sketch-files/<path>` | 10/10 identical |
| A2 | `npx vitest run $(cat <loop>/b-round-444/covering-files.txt)` | rc 0, 60 files, 1082 tests [K14] |
| A3 | `npm run typecheck`; `npm run lint`; `npx biome check $(cat <loop>/b-round-444/sketch-paths.txt)` | rc 0; rc 0 with `Found 205 warnings` [K17]; rc 0 |
| A4 | After all edits, run `bash b-round-444/claims-445.sh` and diff it against `b-round-444/claims-445-sketch-output.txt`. That file is the script's output on B's clone of `616729c` with the sketch applied and the three doc l.4 lines in their final state [K10]. It differs from the planning output only in K2 (`total 13 outside-grants 0`), K4 (`10/10`), K5 (`no`), K7, K8, K9, K10 and K28 | no diff |
| A5 | `grep -c` in doc 290: each of the 12 mutant ids, `FV-HELD` and `GATE443-L1` | ≥ 1 each |

- 13 files change, so A runs `code-reviewer` (3+ files rule) and passes its Architecture note to B. A Medium+ finding that `sketch-review.md` does not rule is a STOP (L11).

## 3. C — verification (rows)
Write `c-round-445/progress.json` after every row (L59). Run C5–C7 before any vitest (L38). Write all L57 fields and run `tools/l57-check.py` before hand-off.

| Row | What | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status` paths ⊆ `grants-445.txt`; K3 protected rc 0 | the 13 granted paths only |
| C2 PATCH-IDENTITY | the 10 sketch paths vs `b-round-444/sketch-files/` | 10/10 identical |
| C3 COVERING | `npx vitest run $(cat b-round-444/covering-files.txt)` | rc 0, 60 files, 1082/1082 |
| C4 MUTANTS | `SCRATCH=<a directory containing store/: C's own git archive of HEAD + the sketch, with node_modules symlinked> OUT=c-round-445/mut python3 -I b-round-444/mutants/run-mutants.py` (OUT must start empty) | 12 lines; each `id`, `rc` and `failedRows` equals `b-round-444/mutants/results.jsonl` [K13] |
| **C5 HELD-ESC-VIDEO** | `BASE=http://127.0.0.1:5173 node b-round-444/probe/held-escape-video.mjs ALL 1440x900,1280x720 > c-round-445/tree.json`. Then start HEAD on :5177 (`b-round-440/probe/head-server.sh start <dir> 5177`, own cacheDir; stop it by port), warm `/studio-lab` once, and run the same probe there → `c-round-445/head.json`. Then `python3 -I b-round-444/probe/compare-video.py c-round-445/tree.json c-round-445/head.json` and `python3 -I b-round-444/probe/compare-video.py c-round-445/head.json` | tree: `ALL OK (14 cells)` and `FRESH ALL SAME (14 cells)`; HEAD: `NOT ALL OK (8 of 14 failing)` with the same cells as `b-round-444/probe/compare-head.txt` [K16]. A cold-start `error` cell is environment-invalid: re-run it (max 2 replacements); it is never a FAIL. The GAIN and LIBSEARCH cells close GATE443-L1 |
| C6 NEIGHBOURS | On :5173: `node b-round-441/probe/ime-sites.mjs` + `b-round-441/probe/compare.py`; `node b-round-442/probe/ime-held.mjs` + `compare-held.py`; `COMPOSE=so node b-round-443/probe/ime-stage2.mjs` + `b-round-443/probe/compare.py` (each with `ALL 1440x900,1280x720`, output under `c-round-445/`) | all three `ALL OK (18 cells)` [K21] |
| C7 PLAIN HELD (no IME) | `node b-round-442/probe/plain-held.mjs ALL 1440x900,1280x720` on :5173 → `c-round-445/plain-tree.json` and on :5177 → `plain-head.json`; `python3 -I b-round-442/probe/compare-plain.py c-round-445/plain-tree.json c-round-445/plain-head.json` | `ALL SAME (18 cells)` [K21] |
| C8 SMOKE + AUTH | anonymous `/studio-lab`: `auth_user` null; `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, studio token 401; Play reaches Playing and Stop returns to Stopped at both viewports (as in `c-round-444/smoke.mjs`) | as round 444 |
| C9 DOCS | doc 290: TEMPLATE headings in order, l.4 exact, the 12 mutant ids, both browser lines, `GATE443-L1`, the TODO ids, and every named test exists (L26). Docs 288 and 289: l.4 exact; the IME6 bullet equals the test title; l.13 says AltGr only; the FT9 sentence is present. `grep -rn 'C round [0-9]* pending' docs/implementation` returns 0 [K27] | all present |
| C10 SOURCE-SCOPE-END | rerun C1 | unchanged |
| C11 CLAIMS | run `bash b-round-444/claims-445.sh` and diff it against `b-round-444/claims-445-sketch-output.txt`; run the L29 tag grep over this task | no diff; every store fact is tagged |
| gate | full vitest, typecheck, build, Biome, verify | `gate` (not claimed by C) |

- **CZABA requirement:**
  - A held key acts once. A held Escape that closes a dialog or an editor does not also collapse the expanded video.
  - Every inline editor ignores composing keys and auto-repeat exactly as before, now through one rule.
- **Ableton conformance:** not applicable (platform standard).
- **Tech Lead manual (does not block):** TLM-SYS3-IME-PLATFORMS gains this step: on macOS Chrome and Safari, type Option+e or Option+2 in the Library search after focusing it by mouse, and record whether the ring appears (expected today: it does, GATE444-L1-MACOS-OPTION). Deadline RETRO 450.

## Claims (`b-round-444/claims-445.sh`; planning output `b-round-444/claims-445-planning-output.txt`; expected after A `b-round-444/claims-445-sketch-output.txt`)

| Tag | Claim | Expected at planning (HEAD `616729c`) |
|---|---|---|
| [K1] | HEAD and gate 444 | `616729c gate444 published 616729c` |
| [K2] | clean tree | `total 0 outside-grants 0` |
| [K3] | protected files | `rc 0 granted-protected 0` |
| [K4] | tree vs sketch | `0/10` |
| [K5] | sketch applies | `yes` |
| [K6] | sketch sha | `07714283ff34c710` |
| [K7] | composing-helper calls (`app/components/arrangement` Tempo, Marker, Group, Detail, Library) | `tempo 1 marker 1 group 1 detail 2 library 1` |
| [K8] | intent helper absent; video Escape branch has no repeat guard (`StudioWorkspace.tsx`) | `intent-helper 0 video-escape-repeat-guard 0 video-escape-unguarded 1` |
| [K9] | new rows absent | `IME11 0 IME12 0 IME13 0 IME14 0 IME15 0 FV-HELD 0 IME6-split 0` |
| [K10] | docs | doc 288 l.4 `… stage 1 of 3; C round 443 PASS)`, doc 289 l.4 `… stage 2 of 3; C round 444 PASS)`, doc 290 absent (`0`) |
| [K11] | archive | `archive444 present` |
| [K12] | C round 444 | `PASS True 0` |
| [K13] | mutants | `12 red 12` |
| [K14] | covering on sketch | `files 60 1082 passed` |
| [K15] | full suite on sketch | `277 files 4071 tests` |
| [K16] | browser | sketch `ALL OK (14 cells)` / `FRESH ALL SAME (14 cells)`; head `NOT ALL OK (8 of 14 failing)` |
| [K17] | typecheck / lint / scoped Biome on sketch | `typecheck-errors 0 lint 'Found 205 warnings' biome-errors 0` |
| [K18] | artifacts | `22/22` |
| [K19] | `tools/l58-check.py current-task.md` | `L58 OK` |
| [K20] | probe server source = sketch | `10/10` |
| [K21] | neighbour probes on B's sketch server | sites, held and stage2a `ALL OK (18 cells)`; plain `ALL SAME (18 cells)` |
| [K22] | IME12/IME13 rows run on unmodified HEAD | `10 passed rc 0` |
| [K23] | L50 focus-origin hits at HEAD | `62` |
| [K24] | Workspace Escape branches (`event.key === 'Escape' &&`) | `1` |
| [K25] | `regression-last.json` date | `2026-11-10` |
| [K26] | Workspace typing-target returns (`isTypingTarget(event.target)`) | `4` |
| [K27] | `pending` status lines in `docs/implementation` | `0` |
| [K28] | doc facts A edits: doc 289 phrase `(Windows AltGr, macOS Option)`; doc 288 old IME6 title `IME6 held key after a composing key (%s): ` | `289-option-phrase 1 288-old-ime6 1` |

Mutant red rows (`b-round-444/mutants/results.jsonl`):

| Mutant | Red rows |
|---|---|
| M1-TEMPO-HELD | IME13, IME6 |
| M2-TEMPO-COMPOSE | IME1, IME12, IME6, IME7 |
| M3-MARKER-STOP | IME12, IME2 |
| M4-GROUP-HELD | IME13 |
| M5-RANGE-HELD | IME13 |
| M6-GAIN-HELD | IME13, IME6 |
| M7-GAIN-REVERT-VALUE | IME13, IME6, IME7 |
| M8-HELPER-REPEAT-FIRST | IME11 |
| M9-HELPER-KEYS | IME11, IME12 |
| M10-VIDEO-HELD | FV-HELD |
| M11-SCAN-INLINE-COMPOSING | IME14 |
| M12-SCAN-INTENT-BYPASS | IME14 |
