# CURRENT TASK — Round 364: PERF-10b-ii-b re-dispatch. Fix C-R363-01 (DC-KINDS guard does not know the new drag) and C-R363-02 (docs not written), apply two reviewer Lows (PERF-10 stage 5 of 5, closing)

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 363 → 364 planning (`b-round-363.md`).

**Decisions** (`backlog.json` → `decisions_log_b`, v326 → v327):
- **D-29z1184:** round 363 closes as **C FAIL** (`c-round-363.json`: taskStatus FAIL, browserVerified true). Gate 363 skipped [K1]. The parts that passed (RB-MEMO + mutants, PERF 95/95 0 DIFF, BG-RANGE, G363-AUTH, SOURCE-SCOPE) are kept as A's partial tree; nothing is reverted.
- **D-29z1185:** C-R363-01 ruled **option (a)**: grant `perf/lib/report.test.ts`, extend the DC-KINDS regex with `background-range` and `toHaveLength(16)` → `18`. Origin is B-spec: B never ran perf-lib against the budgets change in round 363 (L23/L58 pre-check gap). Options (b) (rename metric to dodge the guard) and (c) (drop the rows) are rejected: (b) defeats the guard, (c) shrinks the D-29z1181 measurement.
- **D-29z1186:** rulings on A's round-363 code-reviewer results (§1.3) and the Insert Marker probe fact (§0.2).
- **D-29z1187:** the scope of this round (§1).
- **D-29z1188:** the order after this round is unchanged from D-29z1183 (§5).

**Why this round, now.** C-R363-01 and C-R363-02 are open Mediums that can be fixed in the cloud, so they come before new scope (policy rule 2). They are two tightly related bugs on one stage. REGRESSION is not due: `regression-last.json` says 2026-11-05, next on or after 2026-11-08; today is 2026-11-06.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28, 30, 31, 34, 38 and 58. C also reads 22, 37, 38, 57, 59 and 60.
- `tasks/round-363.md` (the round-363 task: §1.2, §1.3 and §2 still define the stage; this task overrides only what it says), `a-round-363.md`, `c-round-363.md`, and §0 below.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the YouTube request and the screen budget (test-and-harness round, no `app/` source change, nothing new on screen). Ableton conformance: not applicable.

## Baseline
- HEAD is `9da8daa` (gate 362; gate 363 skipped) [K1]. The tree has **3 modified files**, A's round-363 partial work: `render-budget.test.tsx`, `perf/studio-lab-interactions.perf.spec.ts`, `perf/budgets.interactions.json` [K2, K3, K7, K12]. They equal `a-round-363/claims-final.txt` on K3, K7 and K12. **Keep them; do not revert or re-apply.**
- Protected files 11/11 OK [K6]. No dependency change [K8]. Budgets: 264 rows, 95 asserted, 12 background-range `record` rows [K3].
- `perf/lib/report.test.ts` has the old DC-KINDS regex and `toHaveLength(16)` [K19].
- **Root lanes (2026-11-05 parallel policy).** A HEAD that descends from `9da8daa` through only `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` outside docs 234 and 168 is an allowed delta, not a STOP.

## 0. Premises and B's evidence

### 0.1 Option (a), sketched (L58, closes the round-363 pre-check gap)
Scratch `/home/runner/b364-scratch/sc` = `git archive 9da8daa` + A's 3 modified files + B's patch. It does not survive the job.
- **Patch:** `b-round-363/sketch-perflib.patch.txt` (only `perf/lib/report.test.ts`, 2 lines; sha256 in `b-round-363/sketch-perflib-dispatched.sha256`). `git apply --check` passes on the current tree.
  - l.379–380: `/^interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move(\.6x)?$/` → `/^interact\.drag\.(range|fade|trim|move|background-range)\.(stopped|playing)\.commits-per-move(\.6x)?$/`
  - l.385: `expect(drag).toHaveLength(16);` → `expect(drag).toHaveLength(18);`
- **Result:** perf-lib **40/40**, rc 0 (`b-round-363/sketch-perf-lib.log`). `npm run typecheck` rc 0 on the scratch (`b-round-363/sketch-typecheck.log`). Claims on the scratch: `b-round-363/claims-364-sketch-output.txt` (K9 `perf-lib-sha 3a3291c7bdb3`, K19 new regex 1, len-18 1).
- **Mutants on the sketch** (`b-round-363/mutants/`, budgets restored byte-equal afterwards):

| Mutant | Change (scratch budgets only) | Result |
|---|---|---|
| MU-K | `interact.drag.background-range.stopped.commits-per-move` `kind` → `deterministic` | **Red on DC-KINDS only**, 39/40 (`MU-K-perf-lib.log`) |
| MU-N | remove `interact.drag.background-range.stopped.commits-per-move.6x` | **Red on DC-KINDS only**, 39/40 (`MU-N-perf-lib.log`) |

So the guard keeps its meaning: every windowed drag commits-per-move row (now 18) is `wallclock`, and no other `commits-per-move` row exists in the interactions file. The 12 measured values from rounds 363 A and C still apply.

### 0.2 Insert Marker and clip state around the background drag (probe, dev, both viewports)
`b-round-363/im-probe.mjs` (C's `c-round-363/bg.mjs` plus reads of `data-insert-marker` [K20], the audio clip's `data-clip-start` and width, and the Undo title). Output `b-round-363/im-probe-1440x900.json` and `-1280x720.json`:
- `data-insert-marker` is `0.000` at every read point (before the drag, after press, mid, after release, after the name-bar reset). The marker element is `hidden` while the range exists and visible again after the reset.
- The clip's start `0.000` and width `640` are unchanged; the Undo title is unchanged.
- **De-confounded probe** (`b-round-363/im-probe2.mjs`, output `im-probe2-1440x900.json` and `-1280x720.json`). The first probe could not separate "unchanged" from "snapped back to 0", because the clip, the grab point and the marker all sat at 0 s. So the second probe first clicks the video-lane background 200 px to the right, which puts the marker at **5.000**. Then it runs the same drag and reset, then a second scenario: a background click (marker **7.000**) followed directly by a name-bar click.
  - Both viewports give the same result. The marker stays **5.000** after the press, mid-drag (range 00:00.000–00:02.000), after release (range 00:00.000–00:03.000), just before the reset and after the reset. It stays **7.000** after the direct name-bar click. Clip start/width and the Undo title are unchanged throughout.
  - Confirmed fact (dev build, Chromium): neither the background-range press/drag nor the name-bar click moves the Insert Marker. This holds the round-363 premise [K18] in the browser.
- R-L3 still compares the marker across the **reset click** (just before it → after it), because that is the reset contract. It compares the clip start/width across the whole step.

## 1. Scope (A)

### 1.1 Files (exactly 6; the first 3 are already modified)
| # | File | Change |
|---|---|---|
| 1 | `app/lib/arrangement/__tests__/render-budget.test.tsx` | **No change.** Keep A's round-363 state (K7 = `rb-memo-rows 3 rb-tests 13 rb-sha f67004381b1c`) |
| 2 | `perf/studio-lab-interactions.perf.spec.ts` | §1.3 (two reviewer Lows only) |
| 3 | `perf/budgets.interactions.json` | **No change.** K3/K4 stay `rows 264 … ` / `d249eb747730` |
| 4 | `perf/lib/report.test.ts` | **New grant.** From the store root: `git apply ../tmp/studio-real-loop/b-round-363/sketch-perflib.patch.txt`, unchanged. Afterwards K19 = `dc-kinds-regex-new 1 dc-kinds-regex-old 0 drag-len-18 1 drag-len-16 0 report-test-sha 20f761a88bb4` and K9 `perf-lib-sha 3a3291c7bdb3` |
| 5 | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | §1.4 |
| 6 | `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | §1.4 (as round-363 §1.3) |

Nothing else. No `app/` source file; other `perf/lib` files, the other perf specs and `budgets.json`/`budgets.resources.json` unchanged (K9 `other-specs-sha 4ea9c8b2886d`); no e2e, config or protected file. A change needed outside these 6 files, or a code-reviewer Medium+, is a STOP (L11).

### 1.2 C-R363-01
Apply B's patch (file 4) exactly. Do not rename metrics, drop rows or touch other perf-lib tests.

### 1.3 Reviewer Lows in `measureBackgroundRangeDrag` (D-29z1186)
- **R-L1 (apply):** the reset problem also fires when `selectedAfter !== selectedBefore`. The problem text stays the existing "reset failed: clip selected before …, after …" line [K20 `selected-before`].
- **R-L3 (apply):**
  - Read `readClipState(clip)` once **before** `t0 = await nowIn(page)` (outside the measured window) and once after the reset's `waitForQuiet`. Push a problem `${label}: clip start/width changed by the background range drag or reset: …` unless `start` and `width` are equal.
  - Read the `data-insert-marker` attribute of `[data-testid="arrangement-insert-marker"]` [K20] **after `snapshot(...)` and before the reset click**, and again after the reset's `waitForQuiet`. Push a problem `${label}: Insert Marker moved by the name-bar reset: <before> -> <after>` unless they are equal (string compare; `null` on both sides counts as a harness problem too: push `${label}: Insert Marker not found`).
  - These checks write **problems only**. They do not change the liveness rule or any row value.
- **R-L2 (accepted, no change):** the liveness value including the reset is the round-363 contract (`tasks/round-363.md` §1.2).
- **Info items (no change):** the not-found sentinel message, `liveId` naming, absent rows on early return, RB-MEMO2's mount positive (RB-MEMO1 covers it).
- **Architecture note (signal only):** near-duplicate row blocks in `measureDrag` and `measureBackgroundRangeDrag`; recorded as SIG-R363-DRAG-ROW-WRITER; a `writeDragRows` helper only if a third copy appears. Not this round.

### 1.4 Docs (Georgian, technical terms in English)
**Doc 234** — exactly as `tasks/round-363.md` §1.3, with these changes:
- **l.4 (L28 re-dispatch):** exactly `**სტატუსი:** Completed (C round 364 PASS)` (K14 md5 prefix `bd0682b1` including the newline).
- **Stage heading:** exactly `### ეტაპი 5: PERF-10b-ii-b (rounds 363–364, D-29z1182, D-29z1187)` (en dash).
- In stage 5 also: the DC-KINDS ruling (regex + 16 → 18, MU-K/MU-N table from §0.1) and the two reviewer checks of §1.3; the 12 values cite A's round-364 run (or round 363 where they are equal) and C's round-364 PERF.
- **`## პრობლემები და გადაწყვეტები`:** one Problem → Solution bullet for C-R363-01 (perf-lib 39/40 → option (a)).
- **`## შეცვლილი ფაილები`:** add `perf/lib/report.test.ts` to the round-363 list (4 dated bullets).
- **`## ტესტირება`:** the stage-5 bullet also cites `b-round-363/sketch-perf-lib.log`, `b-round-363/mutants/summary.txt` and C's round-364 PERF-LIB row.
- Mermaid fix (A-R362-DOC-STALE-MERMAID), the struck **PERF-10b-ii-b** TODO bullet and the 7 `## ` headings as round-363 §1.3.

**Doc 168:** as round-363 §1.3 (sequence sub-bullet under item 5 naming the reset by the clip name bar; one `## მეტრიკები` bullet: 12 rows, `record`, owner PERF-10b-ii-b, D-29z1181). l.4 unchanged [K16].

No other doc is in the PERF-10 feature: `grep -rn 'In Progress (stage' docs/implementation` gives doc 234 and doc 232 (PERF-DRAG-PREVIEW, a different feature, not granted).

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-363/claims-364.sh` (loop root) | equals `b-round-363/claims-364-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K1, K3, K4, K5, K6, K7, K8, K10, K11, K13, K15, K17, K18 equal planning.</li><li>K2 = `9da8daa 6`.</li><li>K9 = `perf-lib-sha 3a3291c7bdb3 other-specs-sha 4ea9c8b2886d perf-lib-files 10`.</li><li>K12: `bg-mentions` ≥ 4, `dragNames 1`, `lane-drag-stopped-step 1` (spec-sha recorded).</li><li>K14 = `doc234-l4 bd0682b1 doc234-h2 7 doc234-stage5 1 mermaid-old-T-edge 0 mermaid-old-M-edge 0`, `dc-kinds-mention` ≥ 1.</li><li>K16: `doc168-seq-heading 1 doc168-l4 ca98da32`, `doc168-bg` ≥ 1.</li><li>K19 as §1.1 row 4.</li><li>K20: `insert-marker-reads` ≥ 1, `selected-before` ≥ 3, the rest equal planning.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-TESTS | `npx vitest run --reporter=verbose app/lib/arrangement/__tests__/render-budget.test.tsx` | 13/13 (unchanged file; regression check) |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` | **40/40** |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-363/latest-interactions.json <A's latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` []; `problems` [] in every pass (the new R-L1/R-L3 problems must not fire).</li><li>264 rows; 95/95 asserted pass; 0 NEW.</li><li>`interact.harness.drag-background-range-live` = 1 at 1× and 6×.</li><li>Every non-wallclock row equals C363 (the new reads are outside the measured windows). A difference in a row measured before or in the background step is reported as INFO with its values; a difference in any row after it is a STOP.</li><li>`durationMs` ≤ 560000, recorded.</li></ul> |
| A-REVIEW | `code-reviewer` on the final 6 files | No unruled Medium+ (STOP). Any edit after the review goes back to the reviewer (L11); an edit to the spec after A-PERF means A-PERF runs again |
| A-DOC | docs 234 and 168 | as §1.4 |

### 2.2 C rows
Warm dev server first (L38). If `:5173` returns "504 Outdated Optimize Dep", restart it.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-363/claims-364.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check ../tmp/studio-real-loop/b-round-363/sketch-perflib.patch.txt`; `git apply -R --check ../tmp/studio-real-loop/b-round-362/sketch.patch.txt`; `git diff --stat` | 6 modified, 0 untracked; both patches reverse-apply; no `app/` file except `render-budget.test.tsx` changed |
| PERF-LIB | A-PERF-LIB | 40/40 |
| MUTANT-PERFLIB (C's own, scratch under `c-round-364/`, predicted first in `c-round-364/progress.json`) | One budgets mutant that is not MU-K or MU-N, e.g. add a `interact.drag.background-range.playing.commits-per-move` row with `kind: "deterministic"`, or set the `.6x` background row's `metric` to `commits-per-move` on a non-drag id. Run perf-lib on it | Red on DC-KINDS, or reported with its counts if green. Scratch deleted (L60); `store/` unchanged |
| RB-MEMO | A-TESTS' command | 13/13 (the round-363 mutant evidence stands; the file is unchanged, K7) |
| PERF (browser, production, alone) | A-PERF's command and comparison against `c-round-363/latest-interactions.json` | As A-PERF; C records the 12 background values and `durationMs` |
| BG-RANGE (browser, dev, both viewports) | As `tasks/round-363.md` §2.2 BG-RANGE (`c-round-363/bg.mjs` may be copied), **plus** reading `data-insert-marker` just before and after the name-bar click and the clip start/width before the drag and after the click | Round-363 criteria, plus: Insert Marker attribute equal across the click; clip start/width unchanged |
| MARKER-NONE-PLAYING-BACK (best effort, 1440×900) | As `tasks/round-363.md` §2.2 | Pass or "not observable" with values; does not count toward browserVerified |
| G364-AUTH (browser, both viewports) | `c-round-363/auth.mjs` copied to `c-round-364/` | `/studio-lab` opens anonymously; `/studio/<id>` shows sign-in required with 0 audio sources; `/api/studio-token` without credentials 401 and no token. Fake-bearer 500 that fails closed goes under `blocked` |
| DOCS | docs 234 and 168 | <ul><li>Doc 234 l.4 byte-exact `**სტატუსი:** Completed (C round 364 PASS)`; stage heading byte-exact (§1.4).</li><li>7 `## ` in TEMPLATE order (L26); no old mermaid edge (K14).</li><li>Every count in stage 5 matches the live budgets file, B's perf-lib evidence and C's PERF run (L34); every named test exists (L26).</li><li>Doc 168 l.4 unchanged (K16).</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` → 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if PERF, BG-RANGE or G364-AUTH does not run. None needs the backend.

**L57: write all L57 fields** in `c-round-364.json` and run `python3 -I tools/l57-check.py c-round-364.json c-round-364/l57-check.txt` until it exits 0:
- `assertsSpecified`: `DC-KINDS` (the changed assert) plus RB-MEMO1, RB-MEMO2, RB-MEMO3 (unchanged, regression).
- `mutantsRecorded`: MU-K, MU-N and C's own perf-lib mutant.
- `mutantRedOnSketch`: `b-round-363/mutants/MU-K-perf-lib.log`, `b-round-363/mutants/MU-N-perf-lib.log` (and the round-363 RB-MEMO logs `b-round-362/mutants/MU-P|MU-W|MU-R-render-budget.log`).
- `gateChecksNamed`: full vitest, typecheck, biome. `gateChecksRunOnSketch`: `b-round-363/sketch-typecheck.log`, `b-round-363/sketch-perf-lib.log`; the full suite was not run by B on this sketch (the gate runs it) — write that as the reason. `chainHeadGateRunGreen`: gate 362's run.
- `affectedChecksNamed`: perf-lib tests, the interactions perf spec, `render-budget.test.tsx`. `affectedChecksRunOnSketch`: `b-round-363/sketch-perf-lib.log`, `b-round-363/mutants/summary.txt`; the spec's R-L1/R-L3 checks have no B perf run (problems-only checks; the probe `b-round-363/im-probe-*.json` is the premise evidence).

## 3. Neighbouring behaviour that could break
- **Later perf rows:** the new reads must stay outside the measured windows; A-PERF/PERF require every non-wallclock row equal to C363.
- **R-L3 false positive:** if the name-bar click does move the Insert Marker in the production pass, A-PERF reports a problem. That is a STOP with the two values, not a reason to drop the check; B then rules on whether it is an app bug (the round-363 premise [K18]) or a harness read issue.
- **Other perf-lib tests:** only DC-KINDS changes; 40/40 guards the rest.
- **App behaviour:** unchanged (no `app/` source). G364-AUTH guards purchase protection.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1 (root-lane HEAD deltas excepted).
- B's patch does not apply, or perf-lib is not 40/40 after it.
- Any change needed outside the 6 files.
- A-PERF: an asserted row fails; any NEW row; any `problems` entry; the live row is 0; a non-wallclock row after the background step differs from C363; `durationMs` > 560000.
- A code-reviewer Medium+.

## 5. Routed, not in scope
- **SIG-R363-DRAG-ROW-WRITER** (A's reviewer Architecture note): signal only.
- **B-R363-PRECHECK-PERFLIB** (B's own origin note for C-R363-01): a RETRO-368 input — "a task that adds a row to a budgets file runs every perf/lib test that reads that file on the sketch". B does not edit `lessons.md`; RETRO does.
- **Architecture checkpoint:** PERF-10 closes with this round; the bounded root request `b-round-362/root-request-arch-checkpoint.md` stays open and non-blocking.
- **D-29z1188, next:** REGRESSION if the next planning is on or after 2026-11-08 → PERF-9 → PERF-11 (absorbs GATE361-S1, SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE, SIG-R361-CONTEXT-LEAF-CONSUMERS, A-R362-REVIEW-PLAYBACK-CTX-ERROR-TEXT) → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule). RETRO at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Deliverables
- **A:** `a-round-364.md` with every §2.1 row and evidence under `a-round-364/`, the 12 background values, the code-reviewer result.
- **C:** `c-round-364.md`, `c-round-364.json` (all L57 fields), evidence under `c-round-364/`.

## 7. Claims
Run `bash b-round-363/claims-364.sh` from the loop root (`CLAIMS_STORE` points it at a scratch).

| Output | File |
|---|---|
| Planning, on `9da8daa` + A's 3 files | `b-round-363/claims-364-planning-output.txt` |
| Sketch (scratch + perf-lib patch) | `b-round-363/claims-364-sketch-output.txt` |

| Tag | What it pins |
|---|---|
| K1 | gate 362 status/commit; gate 363 status/reason |
| K2 | HEAD and the status entry count |
| K3 / K4 | budgets rows, asserted, background rows/record/owner; budgets sha |
| K5 | the four `memo` lines |
| K6 | protected files OK |
| K7 | RB-MEMO rows, test count, sha of `render-budget.test.tsx` |
| K8 | `package.json` sha |
| K9 | sha over `perf/lib`; sha over the other perf specs and budget files; perf/lib file count |
| K10 | cited artifacts missing |
| K11 | `allTracks` writers and the lane-selector branch |
| K12 | interactions spec: background mentions, `dragNames`, lane-drag step, sha |
| K13 | quarter-IV doc count; `pending` docs |
| K14 | doc 234: l.4 md5, `## ` count, stage-5 heading, old mermaid edges, DC-KINDS mention |
| K15 | DP43–48 and the waveform positive in `drag-preview-render.test.tsx` |
| K16 | doc 168: sequence heading, l.4 md5, background mentions |
| K17 | detail/range test ids |
| K18 | lane-range test id; clip range clear, `seekTo(` and `setInsertMarker` in `ArrangementClip.tsx`; `emptyLanePointAfterClip` callers; marker EPS/null return |
| K19 | `report.test.ts`: new/old DC-KINDS regex, `toHaveLength(18|16)`, sha |
| K20 | spec: `data-insert-marker` reads, background functions, `selectedBefore` count; `StudioWorkspace.tsx` insert-marker test id and attribute |

L29 check for C: every backticked `store/` fact in the Baseline and §0 carries a `[K#]`; an untagged one is a B-spec Low.
