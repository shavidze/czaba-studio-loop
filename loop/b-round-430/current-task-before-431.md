# Round 430: SABA-B-12 stage 1 (STUDIO-VIS-1) — the Detail panel number fields lose the browser spin buttons

**Planned by:** B, at the round 429 → 430 planning, 2026-11-10 (`b-round-429.md`). The advisor was consulted after orientation. The round-429 task is archived as `tasks/round-429.md` [K12].
**Decisions:** D-29z1510 … D-29z1514 (`backlog.json` v410) [K14].

## Read first
- **`lessons.md` in full.** Most relevant: L4, L11, L12, L13, L15, L23, L26, L28, L31, L38, L56, L57, L58, L59, L60, and the new **L61** (native control chrome is a row).
- **Primitives, before you apply the sketch:**
  - `AGENT_DISCOVERABLE_CODE.md`
  - `FORWARDREF_COMPONENT.md`
  - `TAILWIND_FIRST.md`
  - `DESIGN_TOKENS.md`
  - `TESTING_QUALITY_GATES.md`
  - `BUG_HUNTING_TESTS.md`
  - `GEORGIAN_DOCS.md`
  - `docs/implementation/TEMPLATE.md`
- **Template round:** `tasks/round-429.md` with `c-round-429.md`. Where this task differs, this task wins.
- **Claims:** run `bash b-round-429/claims-430.sh`. You can override `ROOT=` and `LOOP=`.
  - B's planning output on the real store is `b-round-429/claims-430-planning-output.txt`, and its stderr file `claims-430-planning.err` is empty.
  - B also ran it on a scratch copy with the sketch applied (no doc): `b-round-429/claims-430-sketch-output.txt`. The expected differences are in `b-round-429/claims-430-planning-vs-sketch.diff`.
  - K13 passes when every id is located, in the backlog or the archive, and none is `NOT-FOUND`. It is checked by location, not byte for byte.
- **Sketch review (L58):** `b-round-429/sketch-review.md` names the dispatched sha256 `a459d975…`. The tech-lead verdict was approve-with-lows, with no Medium. Its 04, 05, 07 and 08 test fixes are already in the sketch. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `76f4147`, clean tree
- Gate 429 is `published` at `76f4147…` on both remotes, and that commit is the baseline [K1]. `git status` is empty [K2].
- **Frozen files:** `b-round-429/r430-frozen-sha256.txt` has **1,329** entries. That is every tracked file except the 2 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected files:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none of them is granted [K4]. This round touches no auth, route, purchase or download file.
- If K1 is not `76f4147` at A1 because root published in between, accept a root-only commit that leaves `git diff 76f4147 HEAD -- app` empty, and note it. STOP only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 429 passed** (D-29z1510): C PASS, 0 bugs, `browserVerified` true [K20].
  - B re-ran C's checks: L57 OK, compare `ALL OK (8 cells)`, mutant lines identical, auth pass true [K25].
  - Gate 429 published `76f4147`. Its review lists 2 Lows and no Medium or above [K23]. Both Lows are A's own Lows, recorded as `confirmedBy` (D-29z1511).
  - **SYS-2 is done**, A-R107-SWEEP-HELD-ENTER-TOOLBAR is closed, and ARCH-CHECKPOINT-SYS-2 is filed with root (non-blocking).
- **Round 429's fixed outcome says:** REGRESSION-2026-11-13 if planning falls on or after 2026-11-13, otherwise SABA-B-12.
  - Today is 2026-11-10, so the regression is not due [K7].
  - STEM-LANES still has no Saba answer and no transcripts [K21].
- **SABA-B-12** (Saba 2026-11-10, Medium) is the next round. The root table rates its first stage, STUDIO-VIS-1, **High / Immediate**.
  - Saba saw browser-default spin arrows (▲▼) on the Clip details number fields: "უფრო სოლიდური, და ესთეტიური უნდა იყოს".
  - B reproduced it in real Chromium at HEAD [K15]. Hovering the right gutter of each field paints the native spin buttons: **182 changed px in all 6 cells** (3 fields × 2 viewports), with computed `appearance: auto`. Screenshot: `b-round-429/probe/head/arrangement-detail-start-hover-1440.png`.
- **The stages of SABA-B-12** (D-29z1512; full inventory in `b-round-429.md`):
  1. **This round:** the 3 number fields.
  2. The 6 Export-dialog radios plus its `<progress>`.
  3. The Shortcut-sheet search field's native cancel ✕.
  4. The 2 `<select>`s. Saba's answer 2 defers them to REVIEW-RECOMMENDATIONS.

## 1. What the code does today (tagged)
- **Number inputs:** 3 non-test `type="number"` inputs exist in `app/components/arrangement`, all in `ArrangementDetailPanel.tsx`: Clip Gain at l.407, From at l.1063 and To at l.1079 [K8].
  - All three take their classes from one `inputClass` string (l.988). From and To use it directly. Clip Gain gets it through a prop and wraps it in `cn(inputClass, 'shrink-0', isPending && 'border-warning')` [K8b].
- **Keyboard and wheel:**
  - ArrowUp and ArrowDown step the fields natively. The probe measured `0.0 → 0.1` (Clip Gain), `0 → 0.001` (From) and `101.352 → 101.353` (To).
  - The panel's wheel guard `preventFocusedNumberInputWheel` keys on `target.type === 'number'`, not on a class [K9].
- **Other native controls in the arrangement folder** [K8c]: 6 radios, 1 progress, 2 search fields, 2 selects, 3 range inputs and 1 file input.
  - The range inputs are already custom-styled (`studio-fader.ts`). The file input is hidden.
  - The Library search already hides the native cancel button. The Shortcut-sheet search does not [K8d].
  - None of these is touched this round.

## 2. Rulings (B, D-29z1513)
1. **One shared class:** the new `app/components/arrangement/studio-number-field.ts` exports `STUDIO_NUMBER_FIELD_CLASS`. It contains:
   - `[appearance:textfield]` (Firefox; also Chromium's computed value);
   - `[&::-webkit-inner-spin-button]:appearance-none` (Chromium, Safari);
   - `[&::-webkit-outer-spin-button]:appearance-none`.

   It follows the `studio-fader.ts` pattern.
2. **It is appended to the existing `inputClass` template string,** so all three fields get it in every state: disabled, enabled and pending.
   - Nothing else changes: no text, label, size, colour, border, layout, keyboard or wheel behaviour.
   - The box stays **80×24** px, as measured at HEAD and on the sketch.
3. **The spin buttons are not replaced by custom steppers.** Keyboard stepping stays (Live 42.6), the Clip Gain fader stays, and typing with Enter/Esc stays. The only loss is click-to-step for mouse users, which is the purpose (see Reference).
4. **Scope of the guard (NF2):** NF2 checks that every non-test `.tsx` file directly in `app/components/arrangement` with a number input applies the class outside its imports.
   - Out of scope, ruled with TL-R430-06: `type={variable}`, spreads, wrappers and sub-folders. None exists today [K8]. Doc 278 lists this in its TODO.
5. **Firefox and Safari:** the cloud has only Chromium. That half is the Tech Lead row **TLM-SABA-B-12-FIREFOX-SAFARI**, with deadline RETRO 435 (L46). It does not make `browserVerified` false.
6. **Screen budget:** nothing persistent is added or removed. The screen-budget row does not apply. The product-designer consult does not apply either, because this is a bug fix whose design source is the product-designer's own audit.
7. **Docs:** new doc `278-saba-b-12-number-spinbuttons.md` [K6: 277 is the last]. Its l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 430 PASS)` (L28).

## Reference: how Ableton Live 12 does it
| Point | Source | Confirmed or inferred | CZABA after this round | C check |
|---|---|---|---|---|
| Value fields change with the up and down arrow keys (Shift for fine), typed digits, Enter to confirm and Esc to cancel | Live 12 manual **42.6 Adjusting Values**, https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/ (read 2026-11-10) | Confirmed (manual text) | ArrowUp/Down step natively; typed value plus Enter commits; Esc reverts. All unchanged | Row 4: ArrowUp still steps on all 3 fields |
| Live's value fields have no stepper arrows | The same section documents keys and drag only, and no stepper | **Inferred**, not confirmed: the manual does not mention steppers. The UI was not measured in Live | No spin buttons at rest, hover or focus | Row 4: gutter diff 0 px |
| Drag up or down on a value field changes it | Live 12 manual 42.6, "Finer Resolution When Dragging: Shift" | Confirmed that drag exists | **Pre-existing gap, unchanged by this round:** our number fields have no drag; Clip Gain has its own fader beside it. Sent to Saba once as **SABA-Q-NUMBER-FIELD-DRAG** (`awaiting_user`, L44); not built until he answers | none |

Ableton conformance for C: matches on keys (confirmed). No steppers (inferred). Drag on the fields is a pre-existing gap with an open Saba question, not part of this round.

## Why we missed it (SABA-B-12, D-29z1514)
- **Which phase should have caught it:** VISUAL-A (rounds ~150–184) and every RETRO whole-screen review (C rows and `design-philosopher`/`first-visit-host`/`product-designer` screenshots).
- **Why it did not:** every review used screenshots at rest. Chromium paints number spin buttons only on hover or focus (B's probe: 0 px at rest, 182 px on hover, 168 px on focus). No task listed a native control's browser-drawn parts as a row.
- **Rule that would have caught it:** **L61, native control chrome is a row.** It was added to `lessons.md` in this planning, and old L9 was merged into L15 to stay at 60 lines. C's row 6 checks that it exists.

## 3. What A changes (sketch `b-round-429/sketch-430.patch.txt`, sha256 `a459d975…` [K10])
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-429/sketch-430.patch.txt`, then `git apply` the same file.
   - It touches 4 files: 2 modified and 2 new.
   - **Do not edit those four files afterwards.**
   - If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11). Do not edit around it.
3. **Docs:** create `docs/implementation/2026/quarter-IV/278-saba-b-12-number-spinbuttons.md` in Georgian, with English technical terms. It contains:
   - l.4 exactly `**სტატუსი:** In Progress (stage 1 of 4; C round 430 PASS)`;
   - TEMPLATE's 7 `## ` headings, in order (L26);
   - rulings 1–7;
   - the HEAD fact: 182 px at hover and `appearance: auto` in 6 cells;
   - the browser table from `b-round-429/probe/compare.txt`;
   - a mutant block that copies the 6 lines of `b-round-429/mutants/summary.txt` byte for byte;
   - the stage list from §0;
   - TODO: TL-R430-06 limits, stages 2–4, TLM-SABA-B-12-FIREFOX-SAFARI.

   Cite only rows and files that exist (L26).
4. Write `a-round-430.md` as you go. Include:
   - the changed files;
   - each check with its rc and its log path (`a-round-430/`);
   - the reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-429/grants-430.txt`, 5 paths)
- `app/components/arrangement/ArrangementDetailPanel.tsx` (sketch only: 1 import + the `inputClass` line)
- `app/components/arrangement/studio-number-field.ts` (new, sketch only)
- `app/lib/arrangement/__tests__/detail-panel-fit.test.tsx` (sketch only: imports + F10)
- `app/lib/arrangement/__tests__/studio-number-field.test.ts` (new, sketch only: NF1, NF2)
- `docs/implementation/2026/quarter-IV/278-saba-b-12-number-spinbuttons.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 2 ` M` lines and 3 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-429/claims-430.sh` at the start | Equals `claims-430-planning-output.txt` (K13 by location); stderr empty |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-429/covering-files.txt)`. The list has 32 files: every test file that references the Detail panel, its number-field test ids, `appearance`, or the new constant, plus `render-budget` | rc 0; **32 files, 660/660** (`b-round-429/precheck-a2.log` [K18]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0; lint rc 0 with 205 warnings and 1 info, the same as HEAD |
| A4 | `npx biome check` on the 4 granted code and test files | rc 0, no fixes (`precheck-biome4.log`) |
| A5 | Claims at the end | Differs from the planning output only in the lines listed in `claims-430-planning-vs-sketch.diff`, with these exceptions:<br>• K1 stays `76f4147…`;<br>• K2 becomes `3 ?? 2 M total 5`;<br>• K6 shows doc 278 as the last doc, with its l.4.<br>K5 `no`, K8 (`:408 :1063 :1079`; the import line moves Clip Gain down by 1), K8b and K17 equal `claims-430-sketch-output.txt`. K2b is 0; K3 is 1,329 rc 0; K4 is rc 0; K19 is `L58 OK` |
| A6 | `code-reviewer` on the diff and the doc (5 files) | No Critical, High or Medium in the sketch logic; otherwise STOP (L11). The TL-R430-* items in `sketch-review.md` are not new findings. Fix doc findings in the doc only |

**Timeout headroom (L31) [K24]:**
- `detail-panel-fit`: 7 tests in 1,640 ms at gate 429, with no timeout declaration (default 5 s per test). On the sketch, the file with F10 took under 1 s.
- `studio-number-field` takes a few ms.
- No covering test is near 50 % of its timeout.

## 6. C's acceptance
**Before hand-off:** write `c-round-430.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-429/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-430.json c-round-430/l57-check.txt`.

**Order (L59):**
- Run row 3 (mutants) first, then rows 4 and 5 (browser), then the rest.
- Write `c-round-430/progress.json` after every row.
- Never run vitest while a browser probe runs (L38).
- Never run a second dev server while row 5 (auth) runs.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation (planning output + `claims-430-planning-vs-sketch.diff` + the A5 exceptions; K13 by location), and **stderr is empty**. K19 prints `L58 OK`. Status shows only the 5 granted paths. Frozen: 1,329 rc 0. Protected: rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-430.patch.txt` to a `git archive HEAD` scratch and `cmp` the 4 files against the working tree: they are identical. The patch has 4 `diff --git` headers [K10]. A2's command gives 32 files, 660/660 |
| 3 | **MUTANTS** | **Base = HEAD + the sketch, nothing else:**<br>1. `git archive HEAD \| tar -x -C /tmp/c430-mut`;<br>2. symlink `node_modules`;<br>3. `git apply` the sketch;<br>4. `git init && git add -A && git commit`;<br>5. copy `b-round-429/mutants/run.py` to `c-round-430/mutants/`;<br>6. run `python3 -I c-round-430/mutants/run.py /tmp/c430-mut $PWD/c-round-430/mutants`.<br>Never write into `b-round-429/`.<br>**Pass = the same 6 lines as B's `summary.txt`** [K16]:<br>• MU-NF-CLASS turns F10 and NF2 red;<br>• MU-NF-INNER and MU-NF-TEXTFIELD turn NF1 red;<br>• MU-NF-NEW-FIELD turns NF2 red;<br>• MU-NF-4TH-FIELD turns F10 red;<br>• MU-NF-IMPORT-ONLY turns F10 and NF2 red |
| 4 | **SPIN BUTTONS IN THE BROWSER (L61)** | Real Chromium on `/studio-lab` at :5173 (A's tree), at **1440×900 and 1280×720**, with a fresh context per viewport.<br>**Setup:**<br>• Copy `b-round-429/probe/{spin-probe.mjs,compare.py}` to `c-round-430/probe/`.<br>• Copy B's HEAD results `b-round-429/probe/head/` to `c-round-430/probe/head/`.<br>• Run `OUT=<abs>/c-round-430/probe/after node <abs>/c-round-430/probe/spin-probe.mjs`, then `python3 -I c-round-430/probe/compare.py c-round-430/probe after`.<br>**Pass: `ALL OK (6 cells)`** (B's run on the final sketch: `b-round-429/probe/compare.txt`, `probe/sketch-final/`). Each field (Clip Gain, From, To) at each viewport must show:<br>• **hover:** HEAD showed the spin buttons (182 px); the hover-vs-rest gutter diff is now under 6 px (B's sketch: 0);<br>• **focus (L61):** HEAD showed them after a click into the field (168 px inside the border, mouse moved away); the focused-vs-rest inner diff is now under 6 px (B's sketch: 0), with the field focused;<br>• computed `appearance` is `textfield`;<br>• the box equals HEAD (80×24);<br>• ArrowUp steps the value exactly as at HEAD;<br>• **typed commit:** the probe types a value and presses Enter (Clip Gain `2`, From `1`, To `3`); value, From, To, pending marker and status text equal HEAD's (B: Clip Gain `2.0` with status `Clip Gain: … +2.0 dB.`, From and To with `Time selection: …`);<br>• 0 page errors.<br>**Also:** look at the `*-hover-*.png` and `*-focus-*.png` crops yourself and confirm there is no ▲▼.<br>Warm `/studio-lab` once before the first cell. A cold first load that times out is environment-invalid and is retried |
| 5 | **AUTH** (fresh context, no credentials, both viewports) | Copy `b-round-429/probe/g430-auth.cjs` and run it with `OUT=<abs>/c-round-430/auth`. Baseline: `c-round-429/auth/g428-auth.json`, pass true [K25].<br>Pass:<br>• the demo `/studio-lab` opens with the demo badge and `auth_user` null;<br>• `/studio/middle-east` shows "Sign in required" on every read at 0.5, 3 and 10 s, with 0 `audio[src]` and no workspace;<br>• `/api/studio-token?product=middle-east&file=mix.wav` without auth returns 401;<br>• bare `/api/studio-token` returns 400;<br>• no body contains a token.<br>Any read with a workspace or with `audio[src]` > 0 is a **Critical** finding.<br>**BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud). It does not make `browserVerified` false |
| 6 | **DOCS** | l.4 of doc 278 is byte-exact `**სტატუსი:** In Progress (stage 1 of 4; C round 430 PASS)`.<br>Doc 278:<br>• has the 7 TEMPLATE headings, in order;<br>• has a mutant block equal to the 6 lines of `b-round-429/mutants/summary.txt`;<br>• cites only row ids that exist in the test files (NF1, NF2, F10);<br>• states the NF2 limits (ruling 4) and the Firefox/Safari Tech Lead row.<br>`grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits.<br>**Why-we-missed lesson:** `lessons.md` has L61 and is ≤ 60 lines [K22] |
| 7 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims. `git diff HEAD --stat` lists only the 2 granted modified files, and the 3 new files are untracked. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** These are gate rows: put them under `"gate"` in the JSON, never under `"passed"`. B's full vitest on the final sketch: 268 files, 4,001 tests, rc 0 (`b-round-429/precheck-full.log` [K27]) |

**Retries (rows 4–5):** a cold-server first load, a port already in use or an overlapped job is an environment problem (L38). Retry at most twice; it is never a FAIL. A row that fails on a valid setup is a finding.

**Ableton conformance (C reports it separately):**
- keys: confirmed match;
- no steppers: inferred (`დაუდასტურებელი` for the Live side);
- drag on the fields: a pre-existing gap (SABA-Q-NUMBER-FIELD-DRAG awaiting Saba), not checked.

## 7. The new rows and their mutants (`b-round-429/mutants/run.py`; logs in `b-round-429/mutants/`)
| Row | File | What it proves | Red under |
|---|---|---|---|
| NF1 | studio-number-field | The shared class carries exactly the three spin-button tokens (token contract) | MU-NF-INNER, MU-NF-TEXTFIELD |
| NF2 | studio-number-field | The only arrangement file with a number input is the Detail panel, and it uses the constant outside its imports | MU-NF-CLASS, MU-NF-NEW-FIELD, MU-NF-IMPORT-ONLY |
| F10 | detail-panel-fit | The panel has exactly 3 spinbuttons (From, To, Clip Gain), and each carries the tokens when disabled, enabled and pending | MU-NF-CLASS, MU-NF-4TH-FIELD, MU-NF-IMPORT-ONLY |

**Neighbouring behaviour that could break:**
- F1–F9 in `detail-panel-fit` (pending marker, border swap, title, reasons);
- Clip Gain commit, Esc revert and 0 dB reset;
- the range Apply;
- the wheel guard;
- render counts (`render-budget` is in the covering set).

## 8. Outcome, fixed in advance (for the 430 → 431 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | The gate publishes, and SABA-B-12 stage 1 is done. Round 431 is REGRESSION-2026-11-13 if planning falls on or after 2026-11-13. Otherwise it is **SABA-B-12 stage 2** (Export-dialog radios + progress; rule `sr-only` vs a styled dot against L1 and `hidden_focusables_rulings_d29z169` first), unless Saba answers STEM-LANES |
| A Medium+ finding in the changed code | Round 431 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |
