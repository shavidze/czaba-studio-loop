# Round 426: SYS-2 stage 2a — a held Enter acts once on the lane, group, master and tempo-row buttons

**Planned by:** B, at the round 425 → 426 planning, 2026-11-10 (`b-round-425.md`). The advisor was used after orientation and before close. The round-425 task is archived as `tasks/round-425.md` [K12].
**Decisions:** D-29z1487 … D-29z1491 (`backlog.json` v402) [K14].

## Read first
- **`lessons.md` in full** [K23]. Most relevant: L4, L10, L11, L23, L28, L29, L31, L47, L52, L56, L57, L58, L59, L60.
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Template round:** `tasks/round-422.md` (SYS-2 stage 1) with `c-round-422.md`. Where this task differs, this task wins.
- **Claims:** `bash b-round-425/claims-426.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-425/claims-426-planning-output.txt` (stderr `claims-426-planning.err`, empty).
  - Output on a scratch with the sketch applied (no doc): `b-round-425/claims-426-sketch-output.txt`.
  - Expected differences: `b-round-425/claims-426-planning-vs-sketch.diff`.
  - K13 is compared by "every id located, none `NOT-FOUND`" (the optimizer may archive an id between B and C, L56).
- **Sketch review (L58):** `b-round-425/sketch-review.md` names the dispatched sha256, the verdict (tech-lead: approve-with-lows), the post-review delta and the delta re-review (approve-with-lows on `c97f080f`; TL-R425-09/10 deferred, D-29z1491). K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `f6c76f4`, clean tree
- Gate 424 is `published` at `f6c76f4…`; gate 425 is `skipped` (no real changes), so `f6c76f4` stays the baseline [K1]. Status is empty [K2].
- **Frozen:** `b-round-425/r426-frozen-sha256.txt` has **1,316** entries: every tracked file except the 6 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `f6c76f4` at A1 (root published in between), a root-only commit that leaves `git diff f6c76f4 HEAD -- app` empty is accepted with a note; A re-runs the claims and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 425 passed** (D-29z1487): C PASS, `browserVerified` true, 1 Low [K21]. **REGRESSION-2026-11-10 is closed**; `regression-last.json` = 2026-11-10 / 425 [K7]. The next regression is due on or after 2026-11-13.
- **C-R425-01** (one empty first dev load of `/studio/middle-east`) is ruled Low and deferred, cause unattributed (D-29z1488): production 8/8 was clean, B's 4 further dev loads on the same (already warm) server were clean, and nothing was exposed. A true cold replicate is a carry of the next regression.
- **STEM-LANES still waits for Saba** (no answer in `AGREE-STEM-LANES.md`, no transcripts [K22]). The fixed outcome of task 425 §10 opens **SYS-2 stage 2a** (D-29z1489).
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **The defect, in real Chromium at HEAD** (`b-round-425/probe/head/*.json`): a held Enter on a focused button clicks again on every auto-repeat. It toggles track Mute and Solo, track and group folds, group Mute and Solo, Master Mute and the metronome back and forth, and opens the video file chooser again.

## 1. What the code does today (tagged)
- `ArrangementTransport.tsx` has a private `preventRepeatedEnterKeyDown` (11 buttons use it) and the Export button carries a second inline copy [K8: local-fn 1, helper 11, inline 2 (Export's copy plus the function's own body)].
- **In the four stage-2a files** (Enter-specific scanner `b-round-425/button-guard-scan-enter.py` [K9]): 14 buttons; 11 have no `onKeyDown`, and 3 have one that does not handle Enter (track fold and group fold guard only a repeated Space; the group name button handles F2 only).
- **Scanner note (INFO-B425-SCANNER-SPACE-AS-ENTER):** the round-421 scanner counted the Space-only group-fold guard as an Enter guard. The new scanner resolves named handlers and needs `'Enter'` with `repeat` (or the helper). Run on the whole folder at HEAD: 62 buttons, 23 ENTER-GUARD, 7 KEYDOWN-NO-ENTER, 32 NONE (`b-round-425/data/scan-all-head.txt`; stage 2b is sized from it).
- `SoftDisabledButtonProps` is `{ 'aria-disabled'?; onMouseDown? }`. On Split, Loop and Zoom to range the `onKeyDown` guard sits before `{...softDisabledButtonProps(...)}`, so a future `onKeyDown` in that type would silently override it (A-R422-REVIEW-L1).

## 2. Rulings (B, D-29z1489)
1. **One shared helper** (decides SIG-R422-REPEAT-SAFE-BUTTON-PROPS): new `app/components/arrangement/studio-repeat-safe.ts` exports `preventRepeatedEnterKeyDown(event: KeyboardEvent<HTMLElement>): boolean`. It calls `preventDefault()` and returns `true` only for `key === 'Enter' && repeat`; otherwise it returns `false` and does nothing. No `stopPropagation`.
2. **Transport:** the private function is deleted and the shared one imported; the Export inline copy becomes `onKeyDown={preventRepeatedEnterKeyDown}`. Behaviour is identical. **Fit stays unguarded** (TH5 lock; K17 `fit-onKeyDown 0`).
3. **Guards added** (`onKeyDown={preventRepeatedEnterKeyDown}`, or `if (preventRepeatedEnterKeyDown(event)) { return; }` as the first statement of an existing handler):
   - `ArrangementLane.tsx`: track Mute, Solo, active-track name button, video import (full and compact), Pan reset, track fold (`handleFoldKeyDown`).
   - `ArrangementGroupHeader.tsx`: group fold (inline handler), group name button (`handleNameKeyDown`), group Mute, group Solo.
   - `ArrangementMaster.tsx`: Master Mute, master peak reset.
   - `ArrangementTempoRow.tsx`: metronome toggle.
4. **Group name input:** a repeated Enter or Escape is still prevented and stopped, but it no longer settles the editor; a fresh Enter commits and a fresh Escape cancels exactly as today. This is a defensive guard (TL-R425-04): a repeat rarely reaches a just-opened editor.
5. **Pan reset is guarded too** (TL-R425-02): normally its click moves focus to the Pan slider, so repeats land on the slider and change nothing; when the reset is refused (an active pointer gesture), focus stays on the button and the guard stops a re-announced refusal on every repeat.
6. **Type guard** (closes A-R422-REVIEW-L1): `SoftDisabledButtonProps` gains `onKeyDown?: never;`. HM15 checks it with `expectTypeOf` (enforced by `npm run typecheck`) and at runtime (`'onKeyDown' in softDisabledButtonProps(true | false)` is false).
7. **Per press, nothing changes.** A fresh Enter, Space, F2, Escape and a mouse click (with or without Ctrl/Cmd/Shift) act exactly as at HEAD. No text, label, title, class or layout changes; nothing mounts or unmounts. The screen-budget and product-designer rows do not apply.
8. **Focus targets (L47):** after a fresh Enter on Pan reset, focus is on that track's Pan slider; after a fresh Enter or Escape in the group name editor, focus is on the group name button. Both are today's behaviour and are rows (C row 6).
9. **Stage 2b (next):** library, video dock, detail panel, grid menu, marker menu and editor Escape, export dialog, shortcut sheet, narrow screen, footer buttons; plus folding every remaining inline `key === 'Enter' && event.repeat` copy onto the helper with a grep row (TL-R425-06). The marker-flag inline guard folds there.
10. **Doc:** `274-sys-held-enter-mixer.md` [K6: 273 is the last].

## Reference
- **No Ableton reference applies.** The change removes Chromium's auto-repeat activation of a focused button; no per-press behaviour changes, so there is no Live behaviour to match. Ableton conformance: არ ეხება (does not apply). The reference is the project's own convention (rounds 108 and 422).
- **Deviations:** none.

## 3. What A changes (sketch `b-round-425/sketch-426.patch.txt`, sha256 `c97f080f…` [K10])
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-425/sketch-426.patch.txt`, then `git apply` the same file (8 files: 6 modified, 2 new). **Do not edit those eight files afterwards.** If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11); do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 426 PASS)` (L28: a stage of a longer feature).
   - It has TEMPLATE's 7 `## ` headings, in order (L26).
   - Content:
     - rulings 1–10;
     - the closed or advanced ids, each with its rows: A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER → HM15 (closed); A-R107-SWEEP-HELD-ENTER-TOOLBAR → HM1–HM14 (partial; stays open for stage 2b); SIG-R422-REPEAT-SAFE-BUTTON-PROPS → decided (ruling 1);
     - the scanner note and the HEAD counts from §1;
     - a mutant block that copies the 18 lines of `b-round-425/mutants/summary.txt` byte for byte;
     - the browser HEAD-vs-sketch table (from `b-round-425/probe/compare.txt`);
     - TODO: SYS-2 stage 2b (ruling 9).
   - It cites only rows and files that exist (L26).
4. Write `a-round-426.md` as you go:
   - changed files;
   - each check with its rc and log path (`a-round-426/`);
   - reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-425/grants-426.txt`, 9 paths)
- `app/components/arrangement/ArrangementGroupHeader.tsx` (sketch only)
- `app/components/arrangement/ArrangementLane.tsx` (sketch only)
- `app/components/arrangement/ArrangementMaster.tsx` (sketch only)
- `app/components/arrangement/ArrangementTempoRow.tsx` (sketch only)
- `app/components/arrangement/ArrangementTransport.tsx` (sketch only)
- `app/components/arrangement/studio-repeat-safe.ts` (new, sketch only)
- `app/components/arrangement/studio-soft-disabled.ts` (sketch only)
- `app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx` (new, sketch only)
- `docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 6 ` M` lines and 3 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-425/claims-426.sh` at the start | Equals `claims-426-planning-output.txt`; stderr empty |
| A2 | `npx vitest run $(grep '^app/' ../tmp/studio-real-loop/b-round-425/covering-files.txt)` from `store/` (57 files: every test file that references the changed buttons, labels, testids or `repeat: true`, the render-count files `drag-preview-render`, `track-layout`, `tempo-window-ui`, and the new file) | rc 0; **57 files, 1015/1015** (`b-round-425/precheck-a2.log` [K18]). `mixer-held-enter-ui` alone is 17/17 |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info (`precheck-lint.log`) |
| A4 | `npx biome check` on the 8 granted code files | rc 0, no fixes (`precheck-biome8.log`) |
| A5 | Claims at the end | Differs from the planning output only in the lines `claims-426-planning-vs-sketch.diff` lists, except: K1 stays `f6c76f4…`; K2 becomes `3 ?? 6 M total 9` (the scratch shows `2 ??` because it has no doc); K6 shows the doc 274 name and its l.4. K8, K9 and K17 equal `claims-426-sketch-output.txt`. K2b 0; K3 1,316 rc 0; K4 rc 0 |
| A6 | `code-reviewer` on the diff and doc 274 (9 files) | No Critical, High or Medium in the sketch logic (otherwise STOP, L11). Rulings 1–10 and TL-R425-01…08 are not new findings. Fix doc findings in the doc |

## 6. C's acceptance
**Before hand-off:** write `c-round-426.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-425/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-426.json c-round-426/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4–7 (browser), then the rest. Write `c-round-426/progress.json` after every row. Never run vitest while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation and **stderr is empty**. K19 prints `L58 OK`. K13 lists every id with a location, none `NOT-FOUND`. Status shows only the 9 granted paths; frozen 1,316 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-426.patch.txt` to a `git archive HEAD` scratch and `cmp` the 8 files against the working tree: identical. A2's command gives 57 files, 1015/1015. The patch has 8 `diff --git` headers. `transport-centre-ui.test.tsx` and `export-toolbar-hold-enter.test.tsx` are byte-identical to HEAD (TH5 keeps Fit unguarded) |
| 3 | **MUTANTS** | Base = **HEAD with nothing applied**: `git archive HEAD \| tar -x -C /tmp/c426-mut`, symlink `node_modules`, then `git init && git add -A && git commit`. Copy `b-round-425` to `c-round-426/b425copy/`. Run `python3 -I c-round-426/b425copy/mutants/run.py /tmp/c426-mut $PWD/c-round-426/b425copy`. The script asserts a clean HEAD base, applies the sketch itself and writes `summary.txt` into `<arg2>/mutants/`. Never write into `b-round-425/`. **Pass = the same 18 lines as B's `summary.txt`:** MU-HEAD-SRC turns HM1–HM14 incl. HM6b/HM11b red (16 of 17); each single-site mutant turns exactly its row red (LANE-MUTE→HM1, LANE-SOLO→HM2, LANE-FOLD→HM3, LANE-NAME→HM4, PAN-RESET→HM5, LANE-VIDEO→HM6, LANE-VIDEO-COMPACT→HM6b, GROUP-FOLD→HM7, GROUP-MUTE→HM8, GROUP-SOLO→HM9, MASTER-MUTE→HM12, MASTER-PEAK→HM13, METRONOME→HM14); GROUP-NAME→HM10,HM11; GROUP-INPUT→HM11,HM11b; HELPER→15 rows; SPREAD-TYPE fails `tsc` (rc 2); every vitest log shows 17 tests [K16] |
| 4 | **HELD-ENTER BROWSER** | Real Chromium, `/studio-lab` on :5173 (A's tree), **1440×900 and 1280×720**, fresh context per cell. Copy `b-round-425/probe/{held-enter-2a.mjs,compare.py}` to `c-round-426/probe/` and B's HEAD results `b-round-425/probe/head/*.json` to `c-round-426/probe/head/`. Run `OUT=<abs>/c-round-426/probe/sketch node <abs>/c-round-426/probe/held-enter-2a.mjs`, then `python3 -I c-round-426/probe/compare.py c-round-426/probe`. The lib import `../../c-round-382/lib.mjs` resolves from `c-round-426/probe/` too. **Pass: `ALL OK (28 cells)`** [K15]: the first Enter acts (MPEAK excepted: a reset with no peak is idempotent), three repeated Enter keydowns change nothing, 0 page errors, and PANRESET ends with focus on the Pan slider. The HEAD JSONs are context only (HEAD changes state on LMUTE, LSOLO, LFOLD, LVIDEO, GFOLD, GMUTE, GSOLO, MMUTE, METRO). Warm `/studio-lab` once before the first cell (L38); a cold first load that times out is environment-invalid and retried |
| 5 | **PER-PRESS MOUSE + SPACE SMOKE** (browser, both viewports) | With a demo clip: one mouse click on a track Mute, a track Solo, Master Mute and (with tempo 120) the metronome flips each `aria-pressed` once, and a second click flips it back. Ctrl+click on a second track's Solo adds it to the solo (both pressed). After Ctrl+G on two tracks, one click on the group fold collapses it and a second expands it. Space plays (position advances ≥ 0.9 s in ≥ 1 s wallclock, L48) and Space stops (position frozen for 500 ms). 0 page errors (ignore the documented cloud cart and connection errors). **Script and baseline:** copy `b-round-425/probe/smoke-focus.mjs` (it runs rows 5 and 6) and run it with `OUT=<abs>/c-round-426/probe/sketch`; B's HEAD output `b-round-425/probe/head/smoke-focus-*.json` [K24] is the expected value (clicks `false,true,false` for each toggle, `ctrlSolo` `true,true`, `groupFold` `true,false,true`, clock 00:01.1x after 1.2 s then frozen). The sketch changes no per-press behaviour, so equal to HEAD is the pass |
| 6 | **FOCUS TARGETS (L47)** (browser, both viewports) | (a) Move a track's Pan off centre with ArrowRight, focus its Pan reset, press Enter once: the pan readout shows C, `document.activeElement` is that track's Pan slider (`input[type=range]`) and its focus ring is visible (computed `outline-style` not `none` or a non-zero ring box-shadow). (b) Ctrl+G on two tracks, focus the group name, F2, type `Bed`, Enter: the name is `Bed` and `document.activeElement` is the group name button with a visible ring. (c) F2 again, type `X`, Escape: the name stays `Bed`, focus on the group name button. Never BODY. **Ring, as measured by B on HEAD** (`smoke-focus-*.json` [K24]): the focused element matches `:focus-visible` and its computed `outline-style` is `solid` with `outline-width` `1px`; C asserts that, not a box-shadow |
| 7 | **LANE NAME PROBE** (browser, dev :5173 = A's tree; **1440×900 only**) | Copy `b-round-425/probe/fade-names.mjs` to `c-round-426/probe/` and run it with `fade`, then `trim`. **Assert** equal to B's sketch outputs `b-round-425/probe/names-sketch-{fade,trim}.json` (identical to the HEAD outputs `names-head-*`) [K20]: fade maxSize = meanSize = 4; trim maxSize = meanSize = 15; `ArrangementLane` 0 and `Memo(ArrangementLaneViewInner)` 0 in `freq`; `ArrangementLaneViewInner` = the commit count; 0 errors. **Record** the commit count (wallclock, L37; B saw 59) |
| 8 | **AUTH** (fresh context, no credentials, both viewports) | Copy `c-round-390/tools/g390-auth.cjs` (with the mock API from `mock-api/server.mjs` on :5199 if you start it; record its PID in `c-round-426/mock.pid` and stop only that PID). The demo `/studio-lab` opens with the demo badge and `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=mix.wav` without auth → 401; bare `/api/studio-token` → 400; no token in any body. **BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud); it does not make `browserVerified` false |
| 9 | **DOC** | Doc 274 l.4 is byte-exact `**სტატუსი:** In Progress (stage 2 of 3; C round 426 PASS)`. The 7 TEMPLATE headings are in order. Its mutant block equals the 18 lines of `b-round-425/mutants/summary.txt` byte for byte. A-R422-REVIEW-L1 names HM15; A-R107 names HM1–HM14 as partial. Every row id it cites exists in the test file. No other doc differs from HEAD |
| 10 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims. `git diff HEAD --stat` lists only the 6 granted modified files. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows; `"gate"` in the JSON, never `"passed"`). B's full vitest on the sketch: 265 files / 3,974 tests, rc 0 (`b-round-425/precheck-full.log` [K25]) |

**Retries (rows 4–8):** a cold-server first load, a port already in use or an overlapped job is an environment problem (L38). Retry at most twice; it is never a FAIL. A row that fails on a valid setup is a finding.

## 7. The new rows and their mutants (`b-round-425/mutants/run.py`; logs in `b-round-425/mutants/`)
| Row | Closes / advances | What it proves | Red under |
|---|---|---|---|
| HM1 | A-R107 (track Mute) | a fresh Enter mutes; 3 repeated Enters are prevented and change no snapshot field | HEAD-SRC, LANE-MUTE, HELPER |
| HM2 | A-R107 (track Solo) | as HM1 for Solo | HEAD-SRC, LANE-SOLO, HELPER |
| HM3 | A-R107 (track fold) | a fresh Enter folds the SFX lane once | HEAD-SRC, LANE-FOLD, HELPER |
| HM4 | A-R107 (track name) | a fresh Ctrl+Enter toggles the selection once and sets the active track | HEAD-SRC, LANE-NAME, HELPER |
| HM5 | TL-R425-02 | Pan reset centres once, focus moves to the Pan slider, repeats on the slider change nothing, repeats on the reset are prevented | HEAD-SRC, PAN-RESET, HELPER |
| HM6 / HM6b | A-R107 (video import) | full and compact buttons open the file chooser once | HEAD-SRC, LANE-VIDEO / LANE-VIDEO-COMPACT, HELPER |
| HM7 | A-R107 (group fold) | a fresh Enter collapses the group once | HEAD-SRC, GROUP-FOLD, HELPER |
| HM8 / HM9 | A-R107 (group Mute / Solo) | mute once; solo `data-solo` off → on once | HEAD-SRC, GROUP-MUTE / GROUP-SOLO, HELPER |
| HM10 | A-R107 (group name) | a fresh Ctrl+Enter toggles the group selection once | HEAD-SRC, GROUP-NAME, HELPER |
| HM11 / HM11b | A-R107 (group name editor) | a repeated Enter/Escape does not settle; a fresh Enter commits `Bed` (focus to the name button, later repeats prevented); a fresh Escape cancels | HEAD-SRC, GROUP-NAME (HM11), GROUP-INPUT |
| HM12 / HM13 | A-R107 (Master Mute, peak) | Master mutes once; the peak reset's repeats are prevented | HEAD-SRC, MASTER-MUTE / MASTER-PEAK, HELPER |
| HM14 | A-R107 (metronome) | with tempo 120, the metronome switches on once | HEAD-SRC, METRONOME, HELPER |
| HM15 | A-R422-REVIEW-L1, ruling 1 | the helper prevents only a repeated Enter (not a fresh Enter, Space or F2); `SoftDisabledButtonProps['onKeyDown']` is `undefined` (typecheck) and absent at runtime | HELPER (vitest), SPREAD-TYPE (`tsc`) |

The snapshot in every row is: the arrangement JSON, the Undo title, the status sequence, the active track, the track folded/selected attributes, the group selected/collapsed attributes, every `aria-pressed`, the name-input presence and the file-chooser click count.

**Neighbouring behaviour that could break:**
- TC/HE rows in `transport-centre-ui` and TH1–TH5 in `export-toolbar-hold-enter` (the helper moved; Export guarded, Fit not);
- the Space-repeat fold guards (track and group fold keep their Space branch after the new Enter line);
- the group name F2 editor (open, commit, cancel, blur) and its focus return;
- the soft-disabled spread on Split, Loop and Zoom to range (type only);
- mouse clicks with modifiers on Solo and the name buttons (row 5);
- lane render counts (row 7; TL-R425-07: no perf impact expected).

**Ableton conformance:** does not apply (see Reference).
