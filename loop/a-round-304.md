# A round 304 — PERF-3c: zoom harness rows in both directions, Ctrl+wheel, and the PERF-3 exit numbers

No STOP condition was hit. No `app/**`, protected, frozen-outside-§5 or config file changed. No commit and no push. The step-by-step checkpoint log is in `a-round-304/checkpoints.md`.

## Scope completed
- Every §5 grant is implemented, and only those 8 paths changed:

  | Path | Change |
  |---|---|
  | `perf/studio-lab-interactions.perf.spec.ts` (M) | Added `runZoomProbeSteps`, `measureZoomPath('in' \| 'out')`, `measureZoomWheel`, the helpers `sumOf`/`maxOf`/`wrongZoomSteps`, the calls in the §4 order (`measureZoom(30)` → in → out → play/fade/stop → wheel, last) and the imports (`median`, `./lib/zoom-probe`). The only removed line is the old `stats` import line. `measureZoom` and every other existing function are byte-identical. |
  | `perf/lib/zoom-probe.ts` (new) | `installZoomProbe` / `readZoomProbe` / `resetZoomProbe` / `disconnectZoomProbe`. MutationObserver on `document.body`; `takeRecords()` flush on read and reset; `connected` flag; reads return zeros after disconnect. Self-contained for `page.evaluate` serialisation. |
  | `perf/lib/zoom-probe.test.ts` (new) | jsdom tests ZP1–ZP6. ZP1 is B's required case: waveform `d` 1, fade `d` 0, ruler +1/−1 = 2, an outside node 0. ZP4 checks that nothing counts after disconnect, with async delivery. ZP6 checks that a re-install disconnects the first probe. |
  | `perf/budgets.interactions.json` (M) | 18 rows inserted as text after `interact.zoom.30.key-window-longest-ms`, owner `PERF-3c`. The diff has 0 removed lines; no existing row changed. |
  | `perf/budgets.resources.json` (M) | Only the 2 `note` strings of `res.dom.ruler-1` and `res.dom.ruler-2`. |
  | doc 212 (M) | l.4 and l.101, exactly the §5 text. |
  | doc 213 (M) | l.4, plus l.78–80 replaced by the one §5 line. |
  | doc 222 (new) | `222-perf-zoom-harness-rows.md`. l.4 = `**სტატუსი:** Completed (C round 304 PASS)`. TEMPLATE's 7 headings are in order, it has the EXIT numbers, and it names PERF-3d. Every full row id it cites exists in the budgets file. |

- **A deviation from the literal §2 wording, made after code review (for B to note).** The LoAF rows (`in/out.loaf-max-ms`, `wheel.loaf-max-ms`) count an entry when it **overlaps** the step window (`t ≤ tEnd && t + duration ≥ t0`), instead of the snapshot's `t ∈ [t0, tEnd]`.
  - Reason: in full run 1, `out.loaf-max-ms` was 73.1, 0, 0, while keydown was 80–96 in the same passes.
  - With the overlap rule, run 2 sees the key-3 and key-8 LoAF in all 3 passes.
  - Existing rows keep their snapshot filter. The row notes describe the overlap rule.
  - The overlap rule cannot pick up a frame from the previous step. Each step ends only after at least 200 ms with no commits (`waitForQuiet`, minimum 300 ms), which is longer than any observed LoAF (≤ 85 ms). The per-key lists also show 0 on every key except the crossing keys.

## Tests actually run

### A-PERF-RUN: `npm run test:perf`
I ran it twice, each time **alone**. Run 1 was before the review; run 2 was on the final tree.
- **Run 2:**
  - rc 0, 3 passed, 13.9 min wall.
  - Interactions `durationMs` was **337,541 ms = 37.5 %** of 900 s (under the 50 % STOP line).
  - Run 1 took 339,158 ms (37.7 %), with rc 0 and all asserts PASS.
- **Reports:** all reports have `complete` true, `failures` [], 0 problems and 0 page errors. All 23 interaction assert rows PASS. Every new id has 3 samples.
- **Evidence:**
  - run 2: `a-round-304/perf/latest-*.json` and `a-round-304/perf-run.log`;
  - run 1: `a-round-304/perf-run-1/` and `perf-run-1.log`.

| New row (run 2) | samples | median |
|---|---|---|
| `interact.harness.zoom-30-in-path-live` | 1,1,1 | 1 PASS |
| `interact.zoom.30.in.keydown-max-ms` | 24,24,16 | 24 |
| `interact.zoom.30.in.keydown-median-ms` | 16,16,16 | 16 |
| `interact.zoom.30.in.loaf-max-ms` | 0,0,0 | 0 |
| `interact.zoom.30.in.commits-per-key` | 1,1,1 (detail.max 1) | 1 |
| `interact.zoom.30.in.path-rewrites` | 0,0,0 | 0 PASS |
| `interact.zoom.30.in.ruler-mutations` | 90,90,90 (perKey 9,7,6,5,18,18,5,6,7,9) | 90 |
| `interact.harness.zoom-30-out-path-live` | 1,1,1 | 1 PASS |
| `interact.zoom.30.out.keydown-max-ms` | 80,80,88 (perKey e.g. 16,24,48,16,16,16,16,80,16,16) | **80** |
| `interact.zoom.30.out.keydown-median-ms` | 16,16,16 | 16 |
| `interact.zoom.30.out.loaf-max-ms` | 83.3,83.4,84.4 (perKey key 3 = 50.5–55.2, key 8 = 83.3–84.4) | 83.4 |
| `interact.zoom.30.out.commits-per-key` | 1,1,1 (detail.max 1) | 1 |
| `interact.zoom.30.out.path-rewrites` | 60,60,60 (perKey 0,0,30,0,0,0,0,30,0,0) | 60 PASS |
| `interact.zoom.30.out.ruler-mutations` | 202,202,202 (perKey 29,7,9,50,6,6,50,9,7,29) | 202 |
| `interact.harness.zoom-30-wheel-live` | 1,1,1 (slider 678 → 570 → 678) | 1 PASS |
| `interact.zoom.30.wheel.loaf-max-ms` | 68.5,69.6,75.1 (step 7 only) | 69.6 |
| `interact.zoom.30.wheel.commits-per-step` | 1,1,1 (detail.max 1) | 1 |
| `interact.zoom.30.wheel.path-rewrites` | 60,60,60 (perStep 0,0,0,30,0,0,30,0,0,0) | 60 PASS |

- **Crossing keys equal B's probe:** in none, out keys 3 and 8, wheel steps 4 and 7. The ruler `perKey` lists equal B's 1440 probe exactly.
- **Neighbouring rows:**
  - `interact.harness.drag-fade-30-live` 1,1,1;
  - `interact.drag.fade.30.playing.move-components-per-move` 103.25 ×3;
  - `release-restarts` 30 ×3;
  - the existing `interact.zoom.30.*` rows are in their usual class (commits 1, components 247).
- **The EXIT numbers that A sees (C decides):**
  - The target is **not met**: out `keydown-max-ms` median 80 ≥ 50, while in is 24.
  - Every `commits` `detail.max` = 1, so the commit half of the target holds.

### A-UNIT
- Config: `/tmp/a304/vitest.perf.config.mjs`, outside `store/`. It has `root` = store, `include: ['perf/lib/*.test.ts']` and its own `cacheDir`.
- Result: 2 files, **29/29 PASS** (`report.test.ts` 23, `zoom-probe.test.ts` 6). Log: `a-round-304/unit-perf-lib.log`.

### A-MUTANTS (scratch only)
- **Setup:** the scratch copy is `/tmp/a304/scratch` (`git archive HEAD` + A's files + a `node_modules` symlink).
- **Scratch spec:** only the 1× rate and 1 pass (`cpuRates [1]`, `passesPerRate 1`). The config has no webServer.
- **Server:** the production `build/` from the perf run, served by `remix-serve` on scratch port 5189. I stopped it afterwards; 5173 was not touched.
- **Why not 5173:** the dev server on 5173 failed this harness at load (4 page errors in dev mode), so that first control was invalid and is not counted.
- **What counts as red:** each scratch run's rc is 1 only because of the expected missing `.6x` rows. Red and green are read from the named rows.
- **Final-spec runs:** m2–m4 were re-run on the final spec after the review change. The logs below are from the final runs.

| Mutant | Change | Result | Log |
|---|---|---|---|
| control | none | all 6 new assert rows green, no non-`.6x` failure | `mut-control.log` |
| m1 | probe filter `closest(waveform)` → `true` | **ZP1 red** (1 failed / 5 passed); control 29/29 | `mut-m1.log`, `mut-m1.diff`, `mut-m1-control.log` |
| m2 | out path presses `=` first | **`zoom-30-out-path-live` 0 and `out.path-rewrites` 0, red**. The slider also clamps at 1000, so `wheel.path-rewrites` = 0 as collateral. | `mut-m2.log` |
| m3 | `keyboard.down('Control')` removed | **`zoom-30-wheel-live` 0, red**; slider stays at 678 | `mut-m3.log` |
| m4 | disconnect right after install | **`out.path-rewrites` 0 and `wheel.path-rewrites` 0, red**; plus a "zoom probe not connected" problem | `mut-m4.log` |
| m5 (extra, review) | `observer.disconnect()` removed | **ZP4 and ZP6 red** | `mut-m5-zp4.log` |

After every mutant, the files were restored and `cmp`-checked.

### A-TYPE/LINT
- `npm run typecheck`: rc 0.
- `npm run lint`: rc 0, with 205 warnings and 1 info project-wide, the same as round 295. Biome's `files` scope is `app/**` only, so lint does not see the perf paths.
- **Scoped Biome:** I ran `npx biome check` on the 5 perf paths in scratch, with `files` removed from the scratch `biome.json` only. It gave **rc 0**. The first try showed 2 formatter-only diffs; I applied them in store.

### Claims after the change
Saved as `a-round-304/claims-after.txt`.
- K2 = 8; K4 = 5 (the 5 modified paths).
- K5–K8 and K21 are content-equal, with shifted line numbers.
- K18 and K19 l.4 equal the §5 text. K19 l.78–80 now has md5 `b309213306b2`; l.78 is the §5 line.
- K22 = 1; K23 = `222-perf-zoom-harness-rows.md`; K24 = 19 (4 + 15).
- Every other K line is identical to HEAD.
- `git diff HEAD --stat -- app` is empty. `sha256sum -c` fails on exactly the 5 modified paths.

### A-REVIEW
The real `code-reviewer` subagent reviewed the 8 paths: **8/10, no Critical or High findings.** The reviewer did not see the post-review changes (overlap rule, notes, ZP4/ZP6). They were verified by run 2, the final-spec mutants and m5, but **not** re-reviewed by the subagent.

| Finding | Sev | Handling |
|---|---|---|
| out LoAF row misses frames (t-window filter) | Medium | **Fixed** inside the grants: overlap rule, notes, re-run. Run 2 shows the LoAF on keys 3 and 8 in all passes. |
| late keydown entries could drop out | Low | Not changed. The ≥ 300 ms settle makes this unlikely, and C's PROBE-EQUIV class check covers it. |
| exact-unit record rows can fail the run when they are not stable | Low | Observed stable over 2 full runs (90 / 202 / max 1). The STOP rule applies. |
| ZP4 did not test async delivery | Low | **Fixed**: ZP4 now awaits, and m5 proves it. |
| no re-install test | Low | **Fixed**: ZP6. |
| filter is `closest` rather than direct child | Low | Kept, because §1 specifies `closest`. |
| `records.length === keys.length` unreachable | Low | Kept; harmless. |
| an error in the `finally` disconnect can hide the first error | Low | Kept. The abort is still recorded. |

**Architecture note (for B, not acted on):**
- The live-rule block and the per-key loop now exist twice: `measureZoom` and `measureZoomPath`/`runZoomProbeSteps`.
- Keep this round as it is, because `measureZoom` had to stay byte-identical.
- Proposal: under `B-R303-PERF-HARNESS-METRIC-FAMILY`, one bounded task after PERF-3d moves `measureZoom` onto `runZoomProbeSteps` and a shared `zoomLiveRule`, with the existing `interact.zoom.*` values in the same class as proof.

## Known gaps
- `lessons.md` was not found anywhere under `/home/runner/czaba-project`, including a case-insensitive `find -iname 'lesson*'`. I followed the lessons the task cites (L23, L29, L31, L38, L52, L56) from the task text.
- `interactionSequence`, the report's `sequence` text, does not list the new steps. It is outside the literal grant, so I left it; B decides.
- The gate does not run `perf/lib/*.test.ts` yet (ROOT-REQ-VITEST-PERF-INCLUDE).
- The PERF-3 exit is not met. The fix is PERF-3d, and I made no app change.
- A note for PERF-3d from this round's data: the out-path keydown is 48–56 ms on key 3 and 80–88 ms on key 8, where the LoAF is 50–55 and 83–84 ms. Only key 8 is over 80 on both measures; both are band-crossing keys.

## Exact next C checks
1. SOURCE-SCOPE: 5 M + 3 new; `sha256sum -c` fails only on those 5; `app` diff empty; the budgets diff has added lines only; the resources diff touches only the two notes; docs 212 and 213 change only the §5 lines.
2. CLAIMS: re-run `claims-304.sh` and compare with the expectations above.
3. PERF-RUN (alone): in 0, out 60, wheel 60. Every assert is PASS, the existing `interact.drag.fade.30.*` rows included. Runtime under 450 s.
4. PROBE-EQUIV at 1440×900 and 1280×720: per-key `d` lists equal to the harness `detail.perKey`; out keydown in the same class (≥ 50).
5. EXIT decision from C's PERF-RUN: in and out `keydown-max-ms` medians, and `commits` `detail.max`.
6. G304-AUTH.
7. DOC-222.
8. MUTANTS: read `a-round-304/mut-*.log` and the `.diff` files.
9. Probe the overlap-rule LoAF deviation, and the `interactionSequence` gap.

## B acceptance rows A truly passed
- **A-PERF-RUN:** PASS.
- **A-UNIT:** PASS.
- **A-MUTANTS:** m1–m4 all red, control green.
- **A-TYPE/LINT:** PASS. No new finding in a granted path.
- **A-REVIEW:** done, and the Medium is fixed.

C's rows (PERF-RUN, PROBE-EQUIV, EXIT, G304-AUTH, SOURCE-SCOPE, CLAIMS, DOC, MUTANTS) and the gate rows are not claimed.
