# Round 225: PERF-HARNESS-SHARED-LIB-b-i fix-up. Three findings on the round-224 determinism contract (C-R224-01, A-R224-REVIEW-TENTHS-NAN, C-R224-02)

**Planned by:** B, at the round 224 → 225 planning, 2026-10-28. **Decisions:** D-29z259…D-29z265.
**Type:** test-only (`perf/**` report core, one budget file, the unit test, two implementation docs). **No `app/**` change.**
**Why this round, not CALM-1:** this is the pre-fixed outcome in `tasks/round-224.md` §8, row 5: a deterministic row was shown to depend on scheduling, so B rules its kind and then a fix-up follows. There are also 2 open Medium findings. Under the 2026-10-23 bug gate they are fixed before new scope. This is one round with 3 tightly related findings in the same 3 files. **Saba's SABA-B-8 "Calm Studio" (CALM-1…3) comes next, as rounds 226–228, before PERF-HARNESS-SHARED-LIB-b-ii** (D-29z262).
**Read first:** `lessons.md` (B, A and C), in full. L10, L11, L23, L26, L28, L30, L32, L34, and the new L37/L38 apply directly.
**Reference first:** not in scope. This is a test-only round with no user-visible behaviour (policy exclusion).

## 0. Baseline and scope

**Baseline:** HEAD = `bbaea50e44191342c09dde274db83347bf1d8289`. Gate 224 published it on both remotes. The tree is clean (`b-round-224/git-status-at-planning.txt` is empty).
- If HEAD differs, or the tree is not clean at the start, **STOP** (L11).
- The one exception is a root commit that touches only `package.json`, `package-lock.json`, `vite.config.ts` or `vitest.config.ts` (§0.3). In that case, re-hash those 4 files and continue.

**Frozen:** `b-round-224-r225-tree-sha256.txt` lists 1,072 files. That is every tracked file except the 5 grants and the 4 files in `b-round-224-r225-root-or-granted.txt`. `sha256sum -c` gives rc 0 at planning. The frozen files include:
- `perf/lib/determinism.ts`, `perf/lib/{stats,budgets,page,instrumentation}.ts`;
- all 3 perf specs;
- `perf/budgets.json` and `perf/budgets.resources.json`;
- docs 163, 169 and 175;
- all of `app/**`.

**Root-owned, must equal HEAD:** `package.json`, `package-lock.json` and `vite.config.ts`. `vitest.config.ts` also stays equal to HEAD unless §0.3 case 1 or 2 applies. Start hashes: `b-round-224-r225-root-files-start-sha256.txt`.

### 0.1 Grants (`b-round-224-r225-grants.txt`, start sha in `b-round-224-r225-granted-start-sha256.txt`)
| # | Path | What may change |
|---|---|---|
| 1 | `perf/lib/report.ts` | **Only** the `case 'tenths'` branch of `determinismFailure` (§2.2). No other line. |
| 2 | `perf/lib/report.test.ts` | Add the 3 named cases in §2.3. Existing cases stay byte-identical. The rules from round 224 §0.2 still apply: l.1 pragma, explicit vitest imports, never import `page.ts` or `instrumentation.ts`. **New:** a value import of `loadPerfBudgets` from `./budgets`, plus `node:url` (and `node:path` if needed), is allowed for DC-KINDS. |
| 3 | `perf/budgets.interactions.json` | **Only:** `"kind": "deterministic"` becomes `"kind": "wallclock"` on exactly the 16 rows matching `^interact\.drag\.(range\|fade\|trim\|move)\.(stopped\|playing)\.commits-per-move(\.6x)?$`. Nothing else changes: no other byte, no note, no key order. B applied this on a scratch copy, and `json.dumps(indent=2, ensure_ascii=False)` + `\n` reproduces the file byte for byte, so a parse-and-dump edit is safe. The `\|` in this cell is markdown escaping; the canonical regex (also for DC-KINDS and BUDGETS-DIFF-225) is `RECLASS` in `b-round-224/scripts/equiv-check-b2.py`: `interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move(\.6x)?`, full match. |
| 4 | doc `176-perf-determinism-contract.md` | The whole file except l.1 (L34): l.4, §Contract-ის ცხრილი, §Failure-ის ახალი ტექსტები, §გადაკლასიფიცირებული სტრიქონები, §არქიტექტურა, §შეცვლილი ფაილები, §პრობლემები და გადაწყვეტები, §ტესტირება and §TODO. l.4 becomes exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 225 PASS)` (L28). |
| 5 | doc `168-perf-interactions-baseline.md` | §მეტრიკები (l.81–97, the "Determinism (round 224-იდან)" paragraph must say the 16 drag `commits-per-move` rows are wallclock from round 225 and why), and §TODO. Do not change l.4. |

**New files:** none (`b-round-224-r225-new-files.txt` is empty).

### 0.3 `vitest.config.ts` (root request `b-round-223-root-request-vitest.md`, D-29z253, still open)
At start, A checks one thing. The first match applies:
1. **`root-grant-r225-vitest.json` exists with `"granted": true`.** A appends `'perf/**/*.test.ts'` to the l.9 `include` array, and changes nothing else.
2. **HEAD already contains that include** (a root commit). A changes nothing.
3. **Neither** (the state at planning). A leaves `vitest.config.ts` untouched and runs the test with a scratch config: top-level `root` = store, `test.include` = `['perf/**/*.test.ts']`, `test.environment` = `'node'`. Doc 176 §ტესტირება keeps the sentence "not gate-covered until root adds the include". Low PERF-REPORT-TEST-INCLUDE stays open. This is not a STOP, and not a C FAIL.

## 1. Why (evidence)
- **C-R224-01 (Medium, C):**
  - In C's run-1 attempt (`c-round-224/run1-contaminated/latest-interactions.json`), `interact.drag.fade.playing.commits-per-move` (1×) gave `windowCommits` [60, 59, 60] with `movesInWindow` [60, 60, 60]. That attempt ran under C's own concurrent CPU load.
  - In the same run, `componentsSum` was 5782 in all 3 passes, `move-components-per-move` was [96.367 ×3], and **`release-commits` stayed [1, 1, 1]**. So the missing commit did not move into the release window.
  - The clean re-run gave 60/60 ×3. The 6× rate gives 59/60 on every pass.
- **B's replay (`b-round-224/commit-count-replay.txt`; script `b-round-224/scripts/commit-count-replay.py`):** 25 saved reports from rounds 210–224 (A, B and C), covering 185 commit/component rows. **Only that one observation varies.** The 24 PERF-1a fader `commits-per-move` rows count the whole gesture (`rendered.length`, studio-lab spec l.346–349), not a time window, and never varied.
- **Fact vs inference:**
  - Confirmed: the windowed commit count of a drag changed under load while the render work did not.
  - Inference: commit timing or coalescing depends on scheduling. Whether that happens at the start boundary (`t > firstMove`) or through a no-render commit is a hypothesis, not tested.
- **performance-optimizer consult:**
  - Reclassify only the 16 windowed drag rows. Keep the 24 whole-gesture fader rows exact.
  - Keep the other commit-count rows exact and watch them (no evidence yet).
  - No objection to the non-finite fix.
- **A-R224-REVIEW-TENTHS-NAN:** `Math.round(NaN)` makes `spread > 1` false, so a MiB row with a NaN or ±Infinity sample passes. C confirmed this by replay (`c-round-224/replay-ctl.log`). **B assesses it as Medium (D-29z260):** it is fail-open in a contract whose stated purpose is fail-closed. A real occurrence is unlikely, because the values are CDP heap numbers.
- **C-R224-02 (Low, C):** no case pins the boundary of 2 tenths. C's CM-3 mutant (`spread > 2`) survives. The round owns the file and the fix is one case, so it is fixed now, not deferred.

**B's pre-check of the full change on a scratch copy (L23):** grants 1 and 3 were applied in `/tmp/b225` (`b-round-224/replay/`).
- The existing 16 unit cases stay green.
- Replay through the changed core with the changed budgets:
  - `c-round-224/reports/{latest,latest-interactions,latest-resources}.json`: 0 failures each.
  - **`c-round-224/run1-contaminated/latest-interactions.json`: 0 failures.** On HEAD, C's replay gives 1 failure.
  - A NaN injected into `res.mem.backing-ready-mib`: exactly 1 failure, `nondeterministic MiB res.mem.backing-ready-mib: [140.3, NaN, 140.3] (non-finite sample)`.

  Evidence: `b-round-224/replay/replay-plan.json`, `replay-nan.json`.
- **Equivalence script `b-round-224/scripts/equiv-check-b2.py`** (oracle: `c-round-224/reports/*`). Its only planned change is the 16 kinds; every other field, notes included, must be identical. Controls (`b-round-224/ctl/controls.log`):
  - rc 0 on the 3 planned reports;
  - rc 1 on the unchanged interactions report (kinds not flipped);
  - rc 1 on a +1 median shift;
  - rc 1 on a note change.

## 2. Changes

### 2.1 Kind ruling (D-29z259), grant 3
The 16 PERF-1b-i drag `commits-per-move` rows (range, fade, trim and move; stopped and playing; 1× and 6×) become `wallclock`. They are `mode: "record"` with `budget: null`, so no assert is lost. They are still measured and reported. The render work of the same window stays exactly checked through `move-components-per-move` (`componentsSum`/`movesInWindow`, ratio) and `move-components-max` (exact).
**Unchanged:**
- `perf/lib/determinism.ts`. The `commits-per-move` → ratio entry still applies to the 24 deterministic fader rows through `commits`/`moves`. If a drag row is ever set back to deterministic, it is checked again through `windowCommits`/`movesInWindow`.
- `budgets.json`, `budgets.resources.json`, and every other row.

**Watch item (not changed, D-29z259):** R224-WINDOW-BOUNDARY-WATCH covers:
- the fader `release-commits` assert rows and the drag `release-commits` rows (both split at `pointerup`);
- `move-components-per-move` (same window).

If a valid loaded or clean run ever shows variation in one of them, B reclassifies those classes together, with evidence.

### 2.2 Non-finite MiB samples fail closed (D-29z260), grant 1
In `case 'tenths'`, directly after `if (values.length === 0) return null;`, insert:
```ts
      if (!values.every((value) => Number.isFinite(value))) {
        return `nondeterministic MiB ${row.id}: [${values.join(', ')}] (non-finite sample)`;
      }
```
The spread line, `spread > 1` and the "spread over 0.1" text stay byte-identical. The position in `failures` is unchanged (same branch). Exact and ratio contracts are not touched; a NaN already fails them through `===`.

### 2.3 New unit cases (`report.test.ts`, grant 2). The test name starts with the id
| Id | Input | Expected |
|---|---|---|
| **DC-MIB-EDGE** (C-R224-02) | MiB row `res.mem.used-ready-mib`, samples [65.2, 65, 65] | exactly `['nondeterministic MiB res.mem.used-ready-mib: [65.2, 65, 65] (spread over 0.1)']` |
| **DC-MIB-NONFINITE** (TENTHS-NAN) | same row: (a) [140.3, NaN, 140.3]; (b) [Infinity, Infinity, Infinity]; (c) [65, 65, -Infinity] | each exactly one failure, `nondeterministic MiB res.mem.used-ready-mib: [<values joined by ', '>] (non-finite sample)`: (a) `[140.3, NaN, 140.3]`, (b) `[Infinity, Infinity, Infinity]`, (c) `[65, 65, -Infinity]` |
| **DC-KINDS** (C-R224-01 ruling pin) | the real files, through `loadPerfBudgets`, with paths resolved from the test file (`fileURLToPath(new URL('../budgets.interactions.json', import.meta.url))`; never `process.cwd()`) | `budgets.interactions.json`: exactly 16 rows match the §0.1 grant-3 regex, and all are `wallclock`; every other `commits-per-move` row there: none. `budgets.json`: all 24 `commits-per-move` rows are `deterministic`, and `determinismContract` of each is `{ kind: 'ratio', … }` |

**Red-proofs (named mutants, on scratch copies outside the store; A reports each one):**
- **MU-7:** remove the §2.2 guard. DC-MIB-NONFINITE turns red.
- **MU-8:** change `spread > 1` to `spread > 2`. DC-MIB-EDGE turns red.
- **MU-9:** set `interact.drag.fade.playing.commits-per-move` back to `deterministic` in a scratch budgets copy. Point DC-KINDS at the scratch copy through a scratch test copy; it turns red.
- **MU-10:** set one fader `commits-per-move` row in `budgets.json` to `wallclock` (scratch). DC-KINDS turns red.

## 3. Doc changes (grants 4–5)
- **Doc 176:**
  - Add the 16 rows to §გადაკლასიფიცირებული სტრიქონები, with the evidence in §1 and the reason the fader rows stay exact.
  - Add the `non-finite sample` text to the failure table.
  - Add one Problem → Solution entry each for C-R224-01, TENTHS-NAN and C-R224-02.
  - §ტესტირება lists the 19 DC ids that exist after this round, and MU-7…10. Every cited id must exist as a test name (L26).
  - §TODO keeps b-ii and adds R224-WINDOW-BOUNDARY-WATCH.
- **Doc 168:** the Determinism paragraph and §TODO, as in grant 5.
- **Doc language:** Georgian, technical terms in English.

## 4. A's checks (covering runs only; the speed rule applies)
1. Start: HEAD, a clean tree, and frozen / grants / root-files `sha256sum -c` all rc 0. Otherwise STOP.
2. `report.test.ts` through §0.3: 19/19 green. MU-7…MU-10 each turn red as stated.
3. **Replay** (A's own replay, or C's `c-round-224/replay/replay.test.ts` pattern), on the final tree:
   - (a) the 3 `c-round-224/reports/*`: 0 failures;
   - (b) `c-round-224/run1-contaminated/latest-interactions.json`: 0 failures;
   - (c) a NaN in `res.mem.backing-ready-mib`: exactly the 1 failure text of §1.
4. **Real Chromium, isolated (L38):** with nothing else CPU-heavy running, run **PERF-1b-i and PERF-1b-ii**. PERF-1a has no MiB row and no changed row; replay (a) covers it. Then run `python3 -I b-round-224/scripts/equiv-check-b2.py c-round-224/reports/<file> <new file>` for both: rc 0. Report both durations.
5. `npm run typecheck` rc 0. `npm run lint` rc 0 (it does not cover `perf/`, L30; say so). Do **not** run the full suite (gate row).
6. The code-reviewer is optional: only 3 code/data files change. If it runs, forward its findings and any Architecture note.
7. `git status` at the end shows only the grants as `M` (and `vitest.config.ts` only under §0.3 case 1).

## 5. What C checks (`c-round-225.json`; gate rows are never claimed)
| Row | Check |
|---|---|
| SCOPE-225 (start + end) | HEAD `bbaea50`. Frozen `sha256sum -c` rc 0 at start and end. Only grants changed. Root files equal HEAD (§0.3). Every changed file's sha256 is equal at C's start and end. |
| BUDGETS-DIFF-225 | C's own script, HEAD vs tree: exactly 16 `kind` changes deterministic→wallclock, on exactly the regex rows; 0 other byte changes in `budgets.interactions.json`; `budgets.json` and `budgets.resources.json` equal HEAD. |
| CODE-225 | The `report.ts` diff is exactly the §2.2 insertion. The text is byte-exact. No other line changed. `determinism.ts` equals HEAD. |
| UNIT-225 | 19/19 green under §0.3, with all 3 new ids present. **C's own mutants**, at minimum: the `spread > 2` mutant (CM-3, which survived in round 224) must now be killed; the guard removed; the guard checking only `values[0]`; one drag row flipped back. Report killed / survived. |
| REPLAY-225 | C's own replay of (a), (b) and (c) from §4.3, plus a control: the HEAD core + HEAD budgets on (b) still gives the 1 `nondeterministic ratio` failure. |
| EQUIV-225 (real Chromium) | PERF-1b-i and PERF-1b-ii on the final tree, **run isolated (L38)**. `equiv-check-b2.py` rc 0 for both against `c-round-224/reports/*`. `complete` true, `failures` [], 0 aborts, 0 page errors. Budget: 3 valid runs + 2 replacements (workflow rule); a replaced attempt is kept as evidence and its invalidity cause is named. A failure on a valid isolated run is a FAIL. |
| DET-REMAINING-225 | In the EQUIV-225 reports, every deterministic row (122 − 16 = 106 in 1b-i, 37 in 1b-ii) passed its contract. C lists any row whose samples vary but which still passed (expected: none). |
| LAB-SMOKE-225 | `/studio-lab` anonymous at 1440×900 and 1280×720 in fresh contexts: status 200, demo badge, workspace present, `auth_user` null. Find → Add gives 1 clip. Export WAV is identical to round 224 (RIFF/WAVE PCM 24-bit, 48 kHz, stereo, 4,864,896 frames). 0 page errors. |
| G225-3 | `/studio/middle-east` unstubbed at both viewports: "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token` with no header returns 401. Premium protection holds. |
| AN-REVIEW-225 | Doc 176 l.4 is byte-exact (§0.1 grant 4). Every DC/MU id cited exists. Doc 168 hunks fall only inside the granted sections, and its l.4 is unchanged. |
| gate | Full suite, build, Biome, verify, e2e smoke. Not claimed. |

**Ableton conformance:** not applicable (test-only).

## 6. Adjacent behaviour that could break
- **A rerun of PERF-1a would be unchanged:** no 1a file changed. Replay (a) covers it.
- **The 1b-ii MiB rows:** finite values must give the same result as before. EQUIV-225 and DC-MIB / DC-MIB-OK / DC-MIB-EDGE check this.
- **Failure order:** the new text sits in the same branch. DC-ORDER must stay green unchanged.
- **The `crossRateMetrics` path:** untouched (1a only).

## 7. Outcome, fixed in advance
| C result | B at round-226 planning |
|---|---|
| PASS, and REGRESSION is not due (planning before 2026-10-30) | b-i is done. C-R224-01, A-R224-REVIEW-TENTHS-NAN and C-R224-02 close. Round 226 = **CALM-1** (SABA-B-8), with its `Why we missed it` section and a lesson. |
| PASS, planning on or after 2026-10-30 | Round 226 = **REGRESSION** (carry every `scope_additions` entry, L6). Then CALM-1. |
| A STOP | B rules first (L10). No re-dispatch without a ruling. |
| EQUIV-225 fails on a valid isolated run, and the failing row is not one of the 16 | That row is shown to depend on scheduling → B rules its kind with the evidence. Then a fix-up, but **CALM-1 goes first unless the row is Medium+ and blocks a gate**. |
| UNIT-225, REPLAY-225 or CODE-225 fails | A bounded fix-up in the same files. |

## 8. Queued after this round (recorded now, not part of round 225)
1. **CALM-1** (SABA-B-8, Saba 2026-10-28, approved). Spec: `docs/technical/studio-real-workspace/calm-studio-review.md`. It covers the shortcut sheet (`?`, footer button "Shortcuts ?", Esc), removing the permanent shortcut line, keys in every transport title with `aria-keyshortcuts`, one source constant, and the lane-move hint in the contextual line. It closes DUX-R-2 in REVIEW-RECOMMENDATIONS.
2. **CALM-2:** copy moves, the empty-lane hint rule, the dismissible one-line library notice, and the first-run status.
3. **CALM-3:** the Overview empty state and Ctrl+Alt+O.
4. **PERF-HARNESS-SHARED-LIB-b-ii** (D-29z252): GATE214-S1, R216-MEM-POLLS-HEADROOM, GATE214-S2 (D-29z254), GATE223-S2, PERF-1A-TIMEOUT-HEADROOM. Then PERF-2…15.
5. **RETRO** at round 230 (15 rounds after 215). It includes the new whole-screen review.

## 9. For root
- **Publication after C PASS:** the changed subset of grants 1–5, plus `vitest.config.ts` if §0.3 case 1 applied. Suggested message: `test(perf): fail closed on non-finite MiB samples; drag commits-per-move rows are wallclock (C-R224-01)`. Reviewer focus:
  - the 16-row regex;
  - fader rows unchanged;
  - the guard text.
- **Still open, non-blocking:**
  - `b-round-223-root-request-vitest.md` (the include; PERF-REPORT-TEST-INCLUDE);
  - `b-round-221-checkpoint-request.md`;
  - `b-round-220-root-request-vite.md` (C-R223-OBS-01 recurred in round 224);
  - `b-round-215-root-request-l28.md`;
  - D-29z195.
