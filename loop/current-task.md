# Round 304: PERF-3c. Zoom harness rows in both directions plus Ctrl+wheel, and the recorded PERF-3 exit decision

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-02 · Decisions: **D-29z793 … D-29z798** (`backlog.json` → `decisions_log_b`, `rounds[304]`, `post_current_stage_queue[7]` stage `PERF-3c`).

**Owner:** A. **Verifier:** C. **Type:** perf harness only (test infrastructure plus docs). **No `app/**` change.**

**Grants (§5):**
- 5 modified paths;
- 3 new paths.

## Baseline: HEAD `53fc8df` [K1], clean tree [K2]
- `gates/gate-round-303.json` is `published`, commit `53fc8dfe…`, on both remotes. That commit is the baseline.
- The 7 protected files have no diff [K3].
- **Frozen list:** `b-round-303-r304-tree-sha256.txt`, 1,173 entries from `git ls-files` at HEAD. `sha256sum -c` (run from `store/`) gives 0 failures [K4].
- **Claims:** run `b-round-303/claims-304.sh` from `store/`. Its output at HEAD is `b-round-303/claims-304-output.txt`.
- **Line-number ruling (D-29z793, from INFO-C303-K9K10-LINESHIFT):** a claim that names a line in a file that a §5 grant edits is compared by **content** after A's change, not by line number.
- **L29 note:** untagged hits in this task are expected values, new row ids, new-file names or grant descriptions (what the harness will be), not facts about current code.

## 0. Read first
- `lessons.md` in full. Directly relevant:
  - L23 (mutants);
  - L29 (claims);
  - L31 (timeout headroom);
  - L38 (perf runs alone);
  - L52 (asserts that can fail);
  - L56 (artifacts exist).
- PERF-3 target (`/home/runner/czaba-project/docs/technical/performance/perf-plan.md` l.29 [K31]): "zoom keydown p95 < 50 ms with 30 clips; ≤ 1 commit per step".
- Stage history:
  - doc 212 (PERF-3a, waveform column bands);
  - doc 213 (PERF-3b, seconds ruler tick window);
  - `c-round-285/timing-table.md`.
- `oss-adoption.md`: read for PERF tasks, as policy requires. It has no zoom-specific adoption. PERF-5/PERF-14 build the peak pyramid in-house, so nothing applies here.
- B's reasoning is in `b-round-303.md`. The previous task is archived as `tasks/round-303.md`.

## 1. What changes, and why
Today's harness measures zoom with 30 clips only on the "in-first" path. `measureZoom` [K5] (call [K6]) presses `=` ×5, then `-` ×5, from the default 40 px/s [K25]. That path never crosses the 25 px/s waveform column band (`waveformPeakColumns` [K16]). Its rows are all `record`, and none uses Event Timing.

B re-measured HEAD on a production build: Chromium, 30 clips, 2 runs per viewport (`b-round-303/probe/*.json`).

| Path (30 clips) | Event Timing keydown per key (ms) | LoAF max (ms) | waveform `d` rewrites per key |
|---|---|---|---|
| in-first (`=`×5, `-`×5), 1440 and 1280 | 16–24 on every key | 0 | 0 on every key |
| out-first (`-`×5, `=`×5), 1440 | key 3: **56**; key 8: **80 / 88**; others ≤ 24 | 50–82 on keys 3/8 | `[0,0,30,0,0,0,0,30,0,0]` |
| out-first, 1280 | key 3: **56**; key 8: **80 / 88**; others ≤ 24 | 61–82 | same |
| Ctrl+wheel out-first (real `keyboard.down('Control')` + `mouse.wheel` ±100) | (no Event Timing for wheel) | step 7: **75 / 76**; others 0 | `[0,0,0,30,0,0,30,0,0,0]` |

**The PERF-3 exit target is not met at HEAD on the band-crossing keys.** PERF-3c makes the harness see it, records it, and records the exit decision. The fix is a separate stage, **PERF-3d** (D-29z795), because a round holds one stage.

**The change:** the interactions spec gets two new measurements and a small probe module.
1. **`measureZoomPath(page, direction, result)`** (30 clips, 1× CPU only).
   - It runs with `direction: 'in'` and then `'out'`, right after the existing `measureZoom(page, 30, result)` [K6].
   - The existing `measureZoom` and every existing row stay byte-identical.
2. **`measureZoomWheel(page, result)`** (30 clips, 1× CPU only).
   - It runs **last**, right after the `stop with ${clipsTarget} clips` step [K21].
   - Wheel zoom anchors on the cursor and moves `scrollLeft`, so it must not run before the fade-drag rows.
3. **`perf/lib/zoom-probe.ts`** (new) installs a MutationObserver only around these measurements and disconnects it afterwards. Today there is no MutationObserver in the interactions spec or `perf/lib` [K22]. It counts:
   - **waveform `d` rewrites:** `attributes` mutations with `attributeName === 'd'` on a `path` whose `closest('[data-testid="arrangement-clip-waveform"]')` exists [K15]. The waveform `path` is a direct child of the `svg` that carries that testid [K30]. Fade-ramp and envelope paths do not count. A fade ramp's `d` depends on its pixel width, so it would change on zoom if a clip had a fade.
   - **ruler child mutations:** `childList` added and removed nodes on targets inside `closest('[data-testid="arrangement-ruler"]')`. Observe a stable ancestor (for example `document.body`), so that a ruler remount cannot detach the observer.

## 2. Rows
All rows are new, owned by `PERF-3c` and `1x only`. Use the ids exactly as written. For each `D` in `in` and `out`:

| id | unit | kind | mode | budget | value |
|---|---|---|---|---|---|
| `interact.harness.zoom-30-D-path-live` | `boolean (1 = true)` | deterministic | assert | `== 1` | 1 when every key moved the Zoom slider the expected way, the path returned along the same values, and it never reached the slider min or max (the existing zoom-live rule) |
| `interact.zoom.30.D.keydown-max-ms` | `ms` | wallclock | record | null | the maximum, over the 10 keys, of the per-key Event Timing `keydown` duration. A key with no entry counts as 0 ("below the 16 ms threshold" [K13]). `detail.perKey` = the 10 values |
| `interact.zoom.30.D.keydown-median-ms` | `ms` | wallclock | record | null | the median of the same 10 values (`median` [K27]) |
| `interact.zoom.30.D.loaf-max-ms` | `ms` | wallclock | record | null | the maximum LoAF duration in the key windows. `detail.perKey` |
| `interact.zoom.30.D.commits-per-key` | `commits / key` | deterministic | record | null | commits / 10. `detail.perKey` = the commits per key; `detail.max` = their maximum |
| `interact.zoom.30.D.path-rewrites` | `count` | deterministic | **assert** | `in`: `== 0`; `out`: `== 60` | the total waveform `d` rewrites over the 10 keys. `detail.perKey` |
| `interact.zoom.30.D.ruler-mutations` | `count` | deterministic | record | null | the total ruler child mutations. `detail.perKey` |

**Wheel** (B's recipe is `b-round-303/zoom-probe-realwheel.cjs`):
- the path is out-first: 5 steps with `deltaY +100`, then 5 with `-100`;
- the pointer sits at the timeline scroller's left + 224 + 300 px, top + 60 px;
- `Control` is held with `keyboard.down` / `keyboard.up` around each `mouse.wheel`;
- each step settles with the same `waitForQuiet` as the keys.

| id | unit | kind | mode | budget | value |
|---|---|---|---|---|---|
| `interact.harness.zoom-30-wheel-live` | `boolean (1 = true)` | deterministic | assert | `== 1` | 1 when the slider moved the expected way on every step (down for the first 5, up for the last 5). There is no symmetry or clamp rule, because the wheel factor need not invert exactly |
| `interact.zoom.30.wheel.loaf-max-ms` | `ms` | wallclock | record | null | the maximum LoAF over the 10 step windows. `detail.perStep` |
| `interact.zoom.30.wheel.commits-per-step` | `commits / key` | deterministic | record | null | commits / 10. `detail.perStep`, `detail.max`. It reuses the exact unit [K12], and its note says "step" |
| `interact.zoom.30.wheel.path-rewrites` | `count` | deterministic | **assert** | `== 60` | the total `d` rewrites. `detail.perStep` |

**Rules for the rows:**
- `count` and `commits / key` are already exact units [K12]; do not add a unit. A deterministic row with an unknown unit fails closed [K11].
- Every measured id needs its budget row [K10].
- No `.6x` rows: the new functions run at 1× only (`cpuRates` [K8]).
- **No wall-clock assert.** The 50 ms target is a decision row for C (§3.2 EXIT), not a CI gate on a shared runner. Both consults agree (`b-round-303.md` §3).
- Every existing row in `perf/budgets.interactions.json` keeps its bytes. The new rows are appended after the last `interact.zoom.30.*` row; there are 4 today [K24].
- In `perf/budgets.resources.json`, only the `note` of `res.dom.ruler-1` and `res.dom.ruler-2` [K20] changes. The new note says that since PERF-3b (doc 213) the ruler renders a three-viewport page window, so the count no longer grows with project length.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-PERF-RUN | `npm run test:perf` runs once, **alone** (L38). rc 0, 0 harness problems, every assert row PASS, and every new id is in `latest-interactions.json` with 3 samples. A reports the value of every new row and the interactions test's total runtime against its 15-minute timeout [K9]; above 50 % is a STOP (L31) |
| A-UNIT | `vitest.config.ts` includes `app/**` only [K29], so A runs the perf/lib tests with a **scratch config outside `store/`** (as in round 295), for example `/tmp/a304/vitest.perf.config.ts` with the store as `root` and `include: ['perf/lib/*.test.ts']`. `perf/lib/report.test.ts` [K28] and the **required** `perf/lib/zoom-probe.test.ts` are green. The new test runs the real exported install function in jsdom (`// @vitest-environment jsdom`). It builds `svg[data-testid="arrangement-clip-waveform"] > path`, a fade-ramp `svg > path`, and a `[data-testid="arrangement-ruler"]` with children. It then changes `d` on both paths, adds and removes a ruler child, and asserts waveform rewrites 1, ruler mutations 2, and 0 counts after disconnect |
| A-MUTANTS | Run on A's scratch, with its own `cacheDir`. Use one perf run per mutant, or one scratch-only spec that calls the new functions with the same recipe. Logs go under `a-round-304/`. **m1** (unit): the probe's filter becomes `true` (no `closest` check), so `zoom-probe.test.ts` turns red (the fade-ramp `d` counts). **m2:** `measureZoomPath('out')` presses `=` first, so `zoom-30-out-path-live` or `out.path-rewrites == 60` turns red. **m3:** the wheel step drops `keyboard.down('Control')`, so `zoom-30-wheel-live` = 0. **m4:** the observer is disconnected before the keys, so `out.path-rewrites` = 0 and turns red. m2–m4 run as perf runs or as one scratch-only spec |
| A-TYPE/LINT | `npm run typecheck` exits 0. `npm run lint` reports no new finding in a granted path |
| A-REVIEW | `code-reviewer` on the §5 paths. Act on Medium+ inside the grants; a Medium+ regression is a STOP. The Architecture note goes to B |

### 3.2 C's rows
**Browser rows.** Real Chromium. The app is unchanged, so these rows prove the harness against an independent probe.

| Row | Action | Expected |
|---|---|---|
| PERF-RUN | `npm run test:perf` once, alone, on A's tree (L38) | rc 0. All three reports have `complete` true, `failures` [], 0 problems and 0 page errors. Every assert row PASSes, the existing ones included. The new ids have 3 samples. `in.path-rewrites` = 0, `out.path-rewrites` = 60, `wheel.path-rewrites` = 60. Every existing `interact.drag.fade.30.*` assert row PASSes |
| PROBE-EQUIV | On a production build of A's tree, run `b-round-303/zoom-probe.cjs` in modes `in` and `out`, and `zoom-probe-realwheel.cjs` in mode `wheel-out`, at **1440×900 and 1280×720**, 1 run each | The per-key `d` rewrite lists equal the harness's `detail.perKey`: in all 0; out `[0,0,30,0,0,0,0,30,0,0]`; wheel `[0,0,0,30,0,0,30,0,0,0]`. On the out path, the probe's keydown values and the harness's `keydown-max-ms` fall in the same class: both ≥ 50 or both < 50 |
| EXIT | From the PERF-RUN report | C writes the PERF-3 exit decision with numbers: `in` and `out` `keydown-max-ms` (median of 3) and `commits-per-key` `detail.max` (both paths and the wheel). **Met** only if both directions' `keydown-max-ms` median is < 50 **and** every `commits` `detail.max` is ≤ 1. B expects **not met** on `out` at HEAD. This row PASSes when the decision is written with traceable numbers, whatever the outcome; it is not a performance pass |
| G304-AUTH | As G303-AUTH | Anonymous `/studio-lab` works with `auth_user` null. `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`. `/api/studio-token` with no header returns 401, with no token in any body |

**Offline rows:**
- **SOURCE-SCOPE.**
  - `git status --short --untracked-files=all` lists exactly the §5 paths: 5 modified and 3 new.
  - `sha256sum -c` fails only on the 5 modified paths.
  - `git diff HEAD --stat -- app` is empty. The protected files have no diff.
  - `perf/budgets.interactions.json`: the diff has only added lines after the last `interact.zoom.30.*` row, plus the comma the append needs.
  - `perf/budgets.resources.json`: the diff touches only the two `note` lines.
  - Docs 212 and 213: the diff touches only the §5 lines.
- **CLAIMS.** Re-run `claims-304.sh`.
  - K1, K3, K12–K17, K20 and K25 equal the HEAD output.
  - K2 = 8. K4 = 5.
  - K22 ≥ 1. K23 = `222-…`. K24 = 4 + the new `interact.zoom.30.*` rows.
  - K5–K8 and K21 are content-equal (D-29z793).
  - K18 (l.4, l.101) and K19 l.4 equal the §5 text. K19's l.78–80 md5 is a before-check only; after the change, C compares l.78 to the §5 line.
  - K27–K32 equal the HEAD output (K32 is a loop artifact).
- **DOC.**
  - New `docs/implementation/2026/quarter-IV/222-perf-zoom-harness-rows.md`: TEMPLATE's 7 headings in order, and l.4 exactly `**სტატუსი:** Completed (C round 304 PASS)`.
  - It cites only rows that exist, states the EXIT decision with numbers, and names PERF-3d.
- **MUTANTS.** C reads A's logs: each listed row is red under its mutant and green on A's tree.
- **Gate rows** are not claimed by C: full vitest, build and `npm run verify`.

**BLOCKED:** none expected. `/studio-lab` needs no backend.

## 4. Rulings
- **Not a performance fix.** If A sees an app change that would make the target pass, A writes it in the report for PERF-3d and does not make it.
- **Wall-clock rows are `record`.** With 10 keys, `percentile(…, 0.95)` is the maximum [K14], and Event Timing has 8 ms granularity. The exit is a decision row (EXIT), not a CI assert.
- **The deterministic asserts can fail (L52).**
  - `in.path-rewrites == 0` fails if a band crossing appears on the in path.
  - `out == 60` and `wheel == 60` fail if a crossing stops rewriting or rewrites twice.
  - The live rows fail on a key that moves the wrong way.
  - Mutants m1–m4 show each one red.
- **Order inside the 1× pass:**
  1. `measureZoom(30)` [K6];
  2. `measureZoomPath('in')`;
  3. `measureZoomPath('out')`;
  4. play, fade drag and stop, as today;
  5. `measureZoomWheel`, last.

  Every key path returns to its start value (the live rule).
- **Docs 212 and 213 close as stage docs.** Each one documents one finished change (3a, 3b), so it closes with its stage (L28). The PERF-3 exit lives in doc 222, and then in PERF-3d's doc. PERF-3 itself stays `in_progress` in the backlog. Round 285 kept them `In Progress` as PERF-3 trackers; doc 222 takes over that role (tech-lead consult; ruling D-29z796).
- **Settle:** reuse `keySettleMs` [K7] and the `waitForQuiet`/`snapshot` helpers. No new fixed waits.
- **Architecture signal** (tech-lead; recorded, not acted on): each perf spec has its own report builder, and a new metric family touches the spec, the budgets JSON and sometimes `determinism.ts`. B logs it as `B-R303-PERF-HARNESS-METRIC-FAMILY`. This round keeps the probe in its own lib module and does not refactor.

## 5. Grants
A edits only these paths.

**Modified (5):**
1. `perf/studio-lab-interactions.perf.spec.ts`: add `measureZoomPath`, `measureZoomWheel`, their calls (§4 order) and the imports. Existing functions and rows stay byte-identical.
2. `perf/budgets.interactions.json`: append the §2 rows only.
3. `perf/budgets.resources.json`: the two `note` strings only (§2).
4. `docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md`, two lines:
   - l.4 [K18] becomes exactly `**სტატუსი:** Completed (PERF-3a stage; C round 284 PASS; PERF-3 exit → doc 222)`;
   - l.101 [K18] becomes exactly `- PERF-3-ის საბოლოო მიზანი 30 clip-ით PERF-3c-ზე გაიზომა (doc 222); exit-ის გადაწყვეტილება და PERF-3d იქაა.`
5. `docs/implementation/2026/quarter-IV/213-perf-ruler-tick-window.md`:
   - l.4 [K19] becomes exactly `**სტატუსი:** Completed (PERF-3b stage; C round 285 PASS; PERF-3 exit → doc 222)`;
   - l.78–80 [K19] are replaced by one line, exactly `` - PERF-3c (doc 222): harness-ის row-ები ორივე მიმართულებით და Ctrl+wheel; exit-ის გადაწყვეტილება და `res.dom.ruler-1/2`-ის შენიშვნები იქაა. ``

**New (2):**
6. `perf/lib/zoom-probe.ts`: install, read, reset and disconnect the observer. It runs in the page through `page.evaluate`.
7. `docs/implementation/2026/quarter-IV/222-perf-zoom-harness-rows.md`.

**New, required (1):**
8. `perf/lib/zoom-probe.test.ts`: **required** (A-UNIT, m1). Run it with the scratch config. Do not edit `vitest.config.ts`; ROOT-REQ-VITEST-PERF-INCLUDE is still open with root, so the gate will not run it yet.

Nothing else is granted: not `app/**`, `perf/lib/report.ts`, `determinism.ts`, `budgets.ts`, `playwright.perf.config.ts`, `package.json`, `docs/technical/**`, or any protected file.

## 6. A's checks (speed rules)
1. Run `bash ../tmp/studio-real-loop/b-round-303/claims-304.sh` before editing. The output must equal `claims-304-output.txt`.
2. `npm run typecheck`, `npm run lint`, and the perf/lib tests with the scratch config (A-UNIT).
3. A-PERF-RUN, alone. A-MUTANTS, on scratch.
4. `code-reviewer`.
5. Write `a-round-304.md` as you go: every new row's values, the runtime, the mutant table and the claims after the change.

## 7. Neighbouring behaviour at risk (C probes)
- **Existing interaction rows:** in particular `interact.drag.fade.30.*` (the state after the new zoom paths) and `interact.zoom.30.*` (ids unchanged, values in their usual class).
- **Total perf runtime** against the 15-minute test timeout [K9] (L31). In C round 285 the interactions test took 300.7 s [K32], which is 33 %. The new steps add about 20 keys and 10 wheel steps per 1× pass, about 1–1.5 min over 3 passes, which comes to about 41–43 %. The STOP line is 450 s.
- **An observer leaking into later rows.** The observer must be disconnected after each measurement. C compares the drag rows' components and LoAF with C round 285 (`c-round-285/perf/latest-interactions.json`).

## 8. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-304.md` and changes nothing else when:
- the claims output before editing differs from `claims-304-output.txt`;
- a change is needed outside §5, or in `app/**`;
- an existing assert row turns red, or a new deterministic assert is not stable across the 3 passes;
- the crossing keys in the harness differ from B's probe (in: none; out: keys 3 and 8; wheel: steps 4 and 7);
- the interactions test runtime goes above 50 % of its 15-minute timeout;
- typecheck fails;
- lint reports a new finding in a granted path;
- a mutant stays green;
- the reviewer reports a Medium+ regression.

## 9. Next
- **Round 305** is RETRO (window 290–304), including the whole-screen and journey review, the For-Saba proposals and the awaiting-user questions.
- **Round 306** is PERF-3d, the band-crossing fix.
  - B consults again, using the LoAF numbers from this round.
  - Candidate options, measured first: (a) integer path heights in a scaled viewBox; (b) a per-source shape cache.
  - The exit target stays as the plan states it.
- A Medium+ from C comes first.
- The next REGRESSION is due on or after 2026-11-05.

## 10. Commit readiness
After C PASS and the gate, root publishes the §5 paths. PERF-3 stays `in_progress` until PERF-3d meets the exit target.

## Claims block
Run `bash ../tmp/studio-real-loop/b-round-303/claims-304.sh` from `store/`. The expected output at HEAD is `b-round-303/claims-304-output.txt` (K1–K32, with every K26 artifact `ok`).
