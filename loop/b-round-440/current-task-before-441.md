# Round 440: SYS-1 stage 1 — tests find elements by text, not by styling class; self-compares become literal pins (test-only)

**Planned by:** B, at the round 439 → 440 planning, 2026-11-10 (`b-round-439.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-439 task is archived as `tasks/round-439.md` (byte-identical, [K12]).
- **Test-only round.** Only 6 test files under `app/lib/arrangement/__tests__/` and the new doc 286 change [K2, K21]. No runtime file changes.
- Reference-first, `product-designer` and the screen budget do not apply (policy: test-only rounds).
- **Baseline:** gate 439 is `published`, commit `efd71f6` [K1]. The store tree is clean at `efd71f6` [K2]. Round 439's work is committed.

## Decisions (`backlog.json` v425 → v426, `decisions_log_b`) [K15]
- **D-29z1563: round 439 is accepted.** `c-round-439.json` is PASS, with `browserVerified` and `realVerified` true [K16], and gate 439 published `efd71f6` [K1].
  - **SYS-R435-SOURCE-SCAN-HELPER is done.** C-R438-01 and A-R438-REVIEW-L1 are closed.
  - The 9 deferred Lows and the subfolder half of GATE434-S2 are closed, as D-29z1557 named [K13].
- **D-29z1564: ruling on A-R439-REVIEW-M1-RD2-SF2-WRAPPER-TAG**, which C-R439-01 confirms (one id, L7). It is a **Low** and goes to `deferred_low_polish`.
  - B re-ran A's wrapper mutants on clean archives of `142918b` and `efd71f6` (`b-round-439/wrapper-rerun/results.jsonl`, [K22]):
    - W1, W2, W1b and W2b are green on both.
    - The W3/W4 positive controls are red on both.
  - So the gap is equal to HEAD, and no HEAD assertion is lost.
  - **Must land before** (L8): SABA-B-12 stage 4 (STUDIO-VIS-3, selects), or any task that adds a wrapper `Input` of type radio or search. That is the same class as SIG-R438-OTHER-SCANNERS.
  - RETRO-450 input: the round-438 sketch review did not ask the sibling suites (RD2, SF2) the question that C-R438-01 raised for NF2 (B-R439-SIBLING-SUITE-GAP).
- **D-29z1565: SYS-1 is split into two stages.** The full scope is kept.
  - **Stage 1 (this round, test-only):** RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS, C-R127-L1f-SELF-COMPARE-TESTS.
  - **Stage 2 (next):** GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR (both files) and GATE81-S2-UM8-SOURCE-TEXT. These need data hooks in `ArrangementOverview.tsx`, which has no hook on the outline overlay, the lane rows or the bars [K23]. They also need a jsdom render of the export dialog's video-sound line, which no test renders today [K24].
- **D-29z1566:** this dispatch, and the order after it:
  1. SYS-1 stage 2;
  2. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13 [K8];
  3. SYS-3;
  4. STORE-REDESIGN 2b…5;
  5. ARCH-SPLIT (frontend-architect checkpoint through root first);
  6. REVIEW-RECOMMENDATIONS;
  7. T12-ADVANCED;
  8. phase 2 under the skip rule.

  Next RETRO: round 450.

## Read first
`lessons.md`. Apply especially:
- **L4:** no assertion lost; equal or stronger replacements are allowed.
- **L11:** STOP on an unruled reviewer finding of Medium or higher.
- **L23:** every red-proof is a named mutant.
- **L29:** tagged claims.
- **L31:** timeout headroom. The slowest covering test is LRS4 at 1868 ms in a describe with a 15 s timeout, so 12.5 % [K26] (`b-round-439/l31-headroom.txt`).
- **L38:** never run vitest while a browser probe runs.
- **L56:** cited artifacts exist.
- **L58:** the sketch review names the dispatched sha.

## 0. Why this round
- No Critical or High finding is open [K14].
- The open Mediums are not loop-fixable now:
  - root, manual or Saba items: GATE232-S2, GATE274, GATE304-M1, A-R73, GATE271;
  - SABA-B-12 stage 4 and STUDIO-VIS-5, parked by Saba's "defer" in REVIEW-RECOMMENDATIONS (D-29z1512).
- C-R438-01 closes with this planning.
- SYS-1 is next in the queue (D-29z1562).
- REGRESSION is not due until 2026-11-13 [K8].
- L8: these class and positional selectors are the "time bomb" kind of Low. STORE-REDESIGN and ARCH-SPLIT will move the very classes they pin.

## 1. What changes (6 test files; sketch `b-round-439/sketch-440.patch.txt`, sha256 in `b-round-439/sketch-440.sha256`)
**Rule:** a test finds an element by its text, role, testid or a data attribute. A styling class appears only inside an assertion (`classList.contains`, a token list), never as the finder.

| File | HEAD | Sketch | Closes |
|---|---|---|---|
| `detail-panel-polish.test.tsx` (design (d) block) | `info.querySelectorAll('span.font-sans')` finds the labels [K7] | Finds label spans by text (`Track`, `Tracks`, `Start`, `Length`, `Clip origin`). New explicit assert: the `font-sans` spans are exactly `Start`, `Length`, `Clip origin` (group: `Start`, `Length`). The label lists gain `Track`/`Tracks`, which are now found as well | RETRO200 |
| `detail-panel-strings-ui.test.tsx` DPS2, DPS4 | `span.text-dim` finders [K7] | DPS2: label spans by text equal the 4 labels, **and** the `text-dim` spans equal the same 4. DPS4: exactly one span whose text is `Tracks`, and it has `text-dim` | RETRO200 |
| `library-preview.test.tsx` (C-R16-01 row) | `row.querySelector('span.text-foreground')` [K7] | Exactly one span whose text is `მუსიკა`; it has `text-foreground`, and it is the first `text-foreground` span in the row (keeps HEAD's ordering check) | RETRO200 |
| `library-row-strings-ui.test.tsx` LRS3 | `marker.className` and `metaRow.className` pinned with `toBe` [K10]; `children[1].querySelectorAll('span.font-mono')` [K7] | Per-token `toContain` (marker: `flex items-center gap-0.5 whitespace-nowrap text-xs text-foreground`; meta: `flex gap-2 text-xs tabular-nums text-muted`); `not.toContain('flex-wrap')` stays. The duration is found as the **leaf** span whose text is `00:20.000` (the wrapper span has the same text): it has `font-mono`, its `parentElement` is `children[1]`, and the only `font-mono` span in the whole meta row is `00:20.000` (stronger than HEAD's `children[1]`-only count) | RETRO200, GATE146 |
| `export-cancel.test.ts` | `ARRANGEMENT_EXPORT_CANCELLED_MESSAGE` and `…_ENCODER_MESSAGE` compared with the `studioExportStrings` entries they are defined from [K9] | Compared with the literal English strings. The unused `studioExportStrings` import is removed | C-R127 |
| `export-wav.test.ts` EW8f | `ARRANGEMENT_WAV_WORKER_STALLED_MESSAGE` compared with `studioExportStrings.wavWorkerStalled(30)` [K9] | Compared with the literal `Writing WAV stalled — the worker has not responded for 30 seconds.` The title "…the stalled message is exact" becomes true | C-R127 |

**Deliberate drop (ruling S1-R1):** LRS3's exact `className` equality ("no other token") is not ported. GATE146 asked for exactly this. A token reorder (R1, R2) is now green. Removing or renaming any listed token is red (S7, S8). This is the only HEAD check not ported. Every other HEAD assertion has an equal or stronger replacement (`b-round-439/sketch-review.md`, HEAD assertion map).

**Sketch review (L58):**
- tech-lead reviewed v1 (`b-round-439/tech-lead-review-v1.md`): 0 Medium or higher, 2 Lows. Both Lows are fixed in v2 (S9, S10).
- tech-lead re-reviewed the delta v1 → v2 and approved; its reply names the dispatched sha.
- Dispositions are in `b-round-439/sketch-review.md` [K17].

**Out of scope, ruled:**
- `export-wav.test.ts` l.510 (`${studioExportStrings.wavWorkerFailed} boom`) [K25]. It tests how the worker error is composed with a suffix, not a constant against its own definition.
- The UI tests that compare rendered text with `studioExportStrings` (for example `export-cancel-ui.test.tsx`) are render-vs-source checks, not self-compares.
- The `.sr-only` finder in DPS3 and the lucide icon-class finders in other suites (tech-lead v1 Q4) are recorded with the pins below.
- `className).toBe(` style pins outside the closes list: CookieConsent, detail-panel-reason, detail-panel-polish `WAVEFORM_BOX_CLASS`, track-layout, track-group-collapse-ui, render-budget. They are recorded on SYS-1 as a RETRO-450 question (`sys1_other_classname_pins`). No new finding ids.

**Mutant matrix** (`b-round-439/mutants/results.jsonl`, script `b-round-439/mutants/run-mutants.sh`, logs in the same folder) [K18]:

| Id | Mutant (runtime source, scratch only) | Suite | HEAD | Sketch |
|---|---|---|---|---|
| S1 | Detail `Start` label loses `font-sans` | detail-panel-polish | red | red |
| S2 | `sourceOffsetLabel` 'Clip origin' → 'Source offset' | detail-panel-strings-ui | red | red |
| S3 | `Track` label `text-dim` → `text-muted` | detail-panel-strings-ui | red | red |
| S4 | `Tracks` label `text-dim` → `text-muted` | detail-panel-strings-ui | red | red |
| S5 | active-lane name span `text-foreground` → `text-muted` | library-preview | red | red |
| S6 | library duration span loses `font-mono` | library-row-strings-ui | red | red |
| S7 | Playing marker loses `whitespace-nowrap` | library-row-strings-ui | red | red |
| S8 | meta row loses `tabular-nums` | library-row-strings-ui | red | red |
| R1 | marker tokens reordered | library-row-strings-ui | red | **green (ruling S1-R1)** |
| R2 | meta tokens reordered | library-row-strings-ui | red | **green (ruling S1-R1)** |
| V1 | `exportCancelled` text changed | export-cancel | **green (HEAD vacuous)** | red |
| V2 | `exportCancelledEncoder` text changed | export-cancel | **green (HEAD vacuous)** | red |
| V3 | `wavWorkerStalled` text changed | export-wav | **green (HEAD vacuous)** | red |
| S9 | the duration wrapper span takes `font-mono` and the inner span is removed | library-row-strings-ui | red | red |
| S10 | a decoy `text-foreground` span before the active-lane name | library-preview | red | red |

V1–V3 run one test file each. `strings.test.ts` already pins these literals [K27], so at HEAD the full suite caught a text change there. What this round removes is the vacuous self-compare in these two files (tech-lead v1 Q4).

## 2. What A does
**Precondition (STOP if it fails):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-439/claims-440.sh | grep -E '^K(1|2|6) '`. Expect `K1 head efd71f6 gate439 published efd71f6`, `K2 status total 0 outside-grants 0` and `K6 sketch-applies yes`.

1. **Apply the sketch:**
   - Run `git apply --check -p1 ../tmp/studio-real-loop/b-round-439/sketch-440.patch.txt`, then `git apply -p1` with the same file.
   - Do not hand-edit it. A code-reviewer request is applied only if `b-round-439/sketch-review.md` already rules on it. Any other Medium or higher is a STOP (L11).
2. **Doc 286:** `docs/implementation/2026/quarter-IV/286-sys-1-stage-1-test-selectors.md`, following `docs/implementation/TEMPLATE.md` [K21]. Write it in Georgian, with technical terms in English.
   - **Line 4:** `**სტატუსი:** Completed (C round 440 PASS)`.
   - **Content:**
     - the rule above;
     - the table of the 6 files;
     - ruling S1-R1;
     - the mutant matrix ids S1–S10, R1, R2, V1–V3 with their HEAD and sketch results;
     - the out-of-scope list;
     - stage 2's three ids under TODO;
     - the closes: RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS, C-R127-L1f-SELF-COMPARE-TESTS.
   - The doc may cite loop paths only as `tmp/studio-real-loop/b-round-439/…`. The mutant table itself lives in the doc (gate-439 review L5).

### A's checks (the full suite and verify are gate rows)
| # | Check | PASS means |
|---|---|---|
| A1 | From `store/`, `cmp` each path in `b-round-439/sketch-paths.txt` with `../tmp/studio-real-loop/b-round-439/sketch-files/<path>` | 6/6 identical |
| A2 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-439/covering-files.txt)` | rc 0, **6 files, 89/89** (`b-round-439/covering-sketch.json`) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each; lint shows **205 warnings** (= HEAD; `b-round-439/lint-sketch.log`) |
| A4 | `bash ../tmp/studio-real-loop/b-round-439/claims-440.sh` | `diff` against `b-round-439/claims-440-planning-output.txt` equals `b-round-439/claims-440-expected-after-A.diff.txt` exactly. B simulated the apply plus a doc-286 file on a clone of `efd71f6`. The only changes are K2 (`total 7 outside-grants 0`), K5 (`6/6`), K6 (`no`), K7 (`0`), K9 (`0`), K10 (`0 0`), K21 (`doc286 1 last-doc 286-…`) and K26 (the LRS4 line moves from 264 to 276) |

- **code-reviewer: required** (7 changed files). Pass its Architecture note to B.
- Write `a-round-440.md` as you go, with logs in `a-round-440/`.

## 3. Grants (`b-round-439/grants-440.txt`, 7 paths)
- **Granted:** the 6 test paths plus doc 286. Nothing else in `store/` may change.
- **Frozen files:** `b-round-439/r440-frozen-sha256.txt` (1343 entries: every tracked file except the grants; rc 0 at `efd71f6`) [K3].
- **Protected files:** `b-round-318/protected-sha256.txt`; none of them is granted [K4].

## 4. C's acceptance
**Order:**
1. C1.
2. The browser rows C6 and C7. Warm up first.
3. The rest.

**Reports:** write `c-round-440.md`, `c-round-440.json` and `c-round-440/progress.json` as you go.

**Rule:** never run vitest during a browser row (L38).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all`; the frozen and protected manifests | Only the 7 granted paths changed; both manifests rc 0 |
| C2 | **PATCH-IDENTITY** | `git archive HEAD` into a scratch, `git apply -p1 b-round-439/sketch-440.patch.txt`, then `cmp` the 6 paths with the working tree | 6/6 identical |
| C3 | **COVERING** | A2 on the working tree | 6 files, 89/89, rc 0 |
| C4 | **MUTANTS** | Scratch trees with a `node_modules` symlink: head = `git archive HEAD`; new = head plus the 6 working-tree test paths. `bash b-round-439/mutants/run-mutants.sh <head> head <dir>` and `… <new> sketch <dir>` | Every line equals `b-round-439/mutants/results.jsonl` in `id`, `tree`, `rc` and `fails` (the red test titles, first 50 characters, read from each log): S1–S10 red on both; R1/R2 red at head, green on new; V1–V3 green at head, red on new (30 lines) |
| C5 | **SWEEP** | Claims K7, K9 and K10 on the working tree. Then, over the 6 files (B's run on the sketch: `b-round-439/c5-sweep-sketch.txt`, 0 lines [K28]), `grep -nE "querySelector(All)?(<[^>]+>)?\(['\"][a-z]*\.(text-|font-|bg-|border|rounded|ring-|flex|gap-|tabular)"` | K7 `0`, K9 `0`, K10 `0 0`; the grep prints nothing |
| C6 | **G440-AUTH (browser)** | Warm-up: one untimed load of `/studio-lab`. Then a fresh anonymous context: `/studio-lab`, `/studio/middle-east`, and `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization | `auth_user` is null on `/studio-lab`; "Sign in required" with 0 `audio[src]`; token API 401. Fake bearer: BLOCKED (backend unavailable in cloud) |
| C7 | **SMOKE + REAL EXPORT (browser), both viewports** | `cd c-round-440 && node ../b-round-437/probe/play-status.mjs > play-status.json`. Then, from the loop root, `node b-round-436/probe/press-export-probe.mjs http://127.0.0.1:5173 <abs dir under c-round-440/>`. One retry is allowed after a cold-start timeout; record both attempts | **Play:** "Loading …", then "… is ready."; the second press plays and the clock advances. **Export:** `czaba-studio-lab.wav`, 29189420 bytes, `RIFF`…`WAVE`; the button returns to "Export WAV" at opacity 1 |
| C8 | **CLAIMS** | `bash b-round-439/claims-440.sh`, compared with `b-round-439/claims-440-planning-output.txt` | The diff equals `b-round-439/claims-440-expected-after-A.diff.txt`. Anything else is a finding |
| C9 | **DOC** | Doc 286 | TEMPLATE headings in order (L26). Line 4 is exact (L28). It cites every mutant id S1–S10, R1, R2, V1–V3 with the results in C4, ruling S1-R1, and the three stage-2 ids under TODO |
| C10 | **SOURCE-SCOPE** (end) + **L57** | As C1; then `python3 -I tools/l57-check.py c-round-440.json c-round-440/l57-check.txt` | As C1; rc 0 |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** List them under `"gate"`. B's run on the sketch: 273 files, 4029 tests, rc 0 (`b-round-439/precheck-full.clean.log`) [K19] |

- **C's JSON:** all L57 fields. `mutantRedOnSketch` names `b-round-439/mutants/results.jsonl`. Every bug has an enum `origin`.
- **Ableton conformance:** does not apply (test-only).
- **Neighbouring behaviour that could break:**
  - A future second `<span>` with the same text in those rows (e.g. a duplicate lane name) turns the "exactly one" asserts red. That is intended.
  - A token reorder in the Library marker or meta row no longer turns LRS3 red (ruling S1-R1).

## 5. Claims (`b-round-439/claims-440.sh`; B's run `b-round-439/claims-440-planning-output.txt`)
| Claim | What it checks |
|---|---|
| K1 | HEAD and gate 439 |
| K2 | Tree status: total, outside-grants |
| K3 | Frozen manifest |
| K4 | Protected manifest; granted protected files |
| K5 | The 6 test paths equal the sketch |
| K6 | The sketch applies to the tree |
| K7 | Class finders (`span.text-…`/`span.font-…`) in the 6 files |
| K8 | `regression-last.json` |
| K9 | Self-compares on `studioExportStrings.exportCancelled`/`exportCancelledEncoder`/`wavWorkerStalled` in export-cancel and export-wav |
| K10 | LRS3 exact `className).toBe(` pins |
| K11 | Cited artifacts exist |
| K12 | Archive of round 439 against B's planning-time copy `b-round-439/current-task-before-440.md`. It is not an independent source: both were copied from the same file in this planning |
| K13 | Backlog ids |
| K14 | Open Critical/High/Medium ids |
| K15 | Backlog version and last D-ID |
| K16 | C round 439 result |
| K17 | sketch-review names the sha; `l58-check` |
| K18 | Mutant results |
| K19 | B's full run on the sketch |
| K20 | `lessons.md` line count |
| K21 | Doc 286 present; last doc; TEMPLATE.md exists |
| K22 | B's wrapper re-run (D-29z1564) |
| K23 | Data hooks in `ArrangementOverview.tsx` (stage-2 premise) |
| K24 | Tests that render `arrangement-export-video-sound` (stage-2 premise) |
| K25 | Line of the `wavWorkerFailed` composition test in export-wav (out of scope) |
| K26 | LRS describe timeout (15 s) and the LRS4 line |
| K27 | `strings.test.ts` literal pins of the three export texts |
| K28 | B's C5 sweep on the sketch files |
