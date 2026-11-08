# A round 398 — PERF-14a: 200-clip scale harness + lane `data-clip-count`

**Status:** implemented, no STOP. Ready for C. No commit/push/deploy.

## Changed files (all within grants-398)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | +1 line `data-clip-count={clips.length}` after `data-track-id={track.id}` (sketch, unchanged). `git diff --stat`: 1 insertion |
| `app/lib/arrangement/__tests__/lane-clip-count.test.tsx` | new, LC1–LC5, byte-identical to the sketch |
| `perf/studio-lab-scale.perf.spec.ts` | new, steps a–h, harness `PERF-14a` |
| `perf/budgets.scale.json` | new, 23 rows, all `mode: record`, `budget: null`, owner `PERF-14a`; counts `deterministic`, ms `wallclock` |
| `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md` | new, Georgian, 7 TEMPLATE headings in order, l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 3; C round 398 PASS)` |

Sketch `b-round-397/sketch-398.patch.txt` (sha256 bd8fe321…) applied with `git apply` (check passed).

## Commands (logs under `a-round-398/`)
| Command | rc | Log |
|---|---|---|
| claims at start vs planning output | 0, diff empty | `claims-start.txt` |
| `npm run typecheck` | 0 | `typecheck.log`; after the review fixes `typecheck3.log`; final tree `typecheck-final.log` (all rc 0) |
| `npm run lint` | 0 (205 pre-existing warnings, 0 errors) | `lint.log`, `lint-final.log` |
| `npx biome check` on the 2 `app/**` paths | 0 | `biome-scoped.log` (re-run at end: 0) |
| spec formatted through `biome format --stdin-file-path=app/x.ts` (Biome ignores `perf/**`, L30) | output identical to file | — |
| `npx vitest run $(cat b-round-397/covering-vitest.txt)` (63 files) | 0: 63 files, 1213 tests | `covering-vitest.log` |
| `python3 -I b-round-397/mutants/run.py <scratch> a-round-398/mutants` | 0 | `mutants/summary.txt` + per-mutant logs |
| perf spec alone, run 1 | 0, `failures` [] | `perf-scale-run1.log`, `perf-results/latest-scale-run1.json` |
| perf spec alone, run 2 (final spec, after the review fixes) | 0, `failures` [], problems [] ×3, pageErrors 0 ×3 | `perf-scale-run2.log`, `perf-results/latest-scale.json` |
| new test file alone, final tree | 0, 5/5 | — |
| claims at end | 0 | `claims-end.txt`, `claims-end.diff` |
| `sha256sum -c b-round-397/r398-frozen-sha256.txt` | 0 failures | — |
| `sha256sum -c b-round-318/protected-sha256.txt` | 11 entries, 0 non-OK lines | — |

**Timeout headroom (L31):** the slowest covering test is CP12b at 5245 ms under its 30 s describe timeout (17 %). The new file runs in about 1.1 s. No test is above 50 %.

**Mutants** (scratch: an rsync copy of store at `a-round-398/scratch` with node_modules symlinked; deleted afterwards by absolute path):
```
pristine rc 0
MU-398-NO-ATTR RED (LC1 LC2 LC3 LC4 LC5)
MU-398-TOTAL RED (LC1 LC2 LC3 LC4 LC5)
MU-398-STALE RED (LC2 LC3 LC4)
MU-398-COMMITTED RED (LC4)
MU-398-FOLD-ZERO RED (LC5)
pristine-after rc 0
```
This matches the expected red rows in §5.

**Claims at the end:** only the §7 facts differ. The values are K2 `c93d926 5`, K6/K6b doc254 exists (l.4 exact, 7 headings), K7 `in-progress-docs` 4, K8 `clip-count-attr` 1 and sweep 4 (the budgets notes name the attribute, which §7 allows), K14 52, K17 `applies-to-tree no`, K18 all `exists`, and K23 23.

## Scale spec rows (run 2, production build via the perf config on :5188, 1440×900, 3 passes)
The perf config builds and serves on its own port 5188. The :5173 dev server was not touched.

| Row | Median [min–max] | B dev probe 1440×900 (`b-round-397/probe/head-200-*`) |
|---|---|---|
| scale.harness.build-ms | 4342 [4315–4440] | Ctrl+D ×199 ≈ 5309 ms |
| scale.dom.page | 4333 | 4294 (dev) |
| scale.dom.clip-subtree | 3400 | 3400 |
| scale.clips.model | 200 | — |
| scale.clips.mounted | 200 | 200 |
| scale.clips.in-window | 1 | 1 |
| scale.zoom.keydown-p95-ms | 40 [40–48] | 48 |
| scale.zoom.keydown-max-ms | 40 [40–48] | 48 |
| scale.zoom.commits-per-key | 1 | — |
| scale.zoom.components-per-key | 638.3 | — |
| scale.zoom.keydown-p95-ms.6x | 192 | 272 |
| scale.zoom.keydown-max-ms.6x | 192 | 272 |
| scale.zoom.commits-per-key.6x | 1 | — |
| scale.zoom.components-per-key.6x | 638.2 | — |
| scale.dom.page.min-zoom | 4303 | 4264 (dev) |
| scale.clips.mounted.min-zoom | 200 | 200 |
| scale.clips.in-window.min-zoom | 19 | 19 |
| scale.dom.page.min-zoom-mid | 4333 | — |
| scale.clips.mounted.min-zoom-mid | 200 | — |
| scale.clips.in-window.min-zoom-mid | 24 (scrollLeft 4617 of 10375/1142) | — |
| scale.scroll.commits-per-step | 1 | — |
| scale.scroll.components-per-step | 57.75 | — |
| scale.scroll.loaf-max-ms | 0 | — |

All rows are records, not asserts. Every deterministic row was identical across the 3 passes in both runs.

## Deviations from the sketch / task text
1. **Step f reads the slider's value, not its ARIA attributes.** The Zoom control is a native `<input type="range" min={0}>` (`ArrangementTransport.tsx` ~l.511). It carries no `aria-valuenow`/`aria-valuemin` attribute. So the spec compares `inputValue()` with the `min` attribute. The meaning is the same. B's probe used the same fallback (`getAttribute('aria-valuenow') ?? zoom.value`).
2. **Step a also calls `waitForLibraryReady` before `waitForCollectionReady`.** This is the same as the interactions spec: a cold production load can exceed the 15 s expect timeout in `waitForCollectionReady`.
3. **`scale.harness.build-ms` covers the Control+d loop only.** It starts after the Add and the name-bar click, which makes it comparable to B's `ctrlDWallMs`.
4. **Self-checks added after the code-reviewer's findings, each one a `problems` entry:**
   - page errors > 0;
   - `scrollLeft` ≠ 0 at steps c and f;
   - a step-h scroll that does not move by exactly `clientWidth`;
   - a `-` key at step f that does not change the slider (a clear problem instead of a 30 s poll throw).

   The scroller search starts at the ruler's parent ("first ancestor") and requires a computed `overflowX` of `auto`/`scroll`. All of these passed in run 2.
5. **The scroll rows use the units `commits / key` and `components / key`.** `perf/lib/determinism.ts` (frozen) has no `/ step` exact unit. The precedent is `interact.zoom.30.wheel.commits-per-step`. The row notes say so.

## Code-reviewer (actual subagent, score 8/10, no Critical)
Fixed in this round, all inside the granted spec and doc:
- M1: page errors now fail a pass.
- L4: scroll-step delta self-check.
- L5: the scroller search starts at the parent and requires overflowX.
- L6: scroll-0 checks.
- L7: unit notes.
- L9: a stuck zoom key becomes a problem.
- L10: the reason in doc Problem 4 is reworded.
- L11: the spec reuses the `audioClips` export.

**Signals for B, not fixed. These are not a STOP (L11).** Both are record rows whose definitions the task prescribes word for word (§3 c, "box of the timeline scroller"; §3 d, `percentile(…, 0.95)` over 10 keys). No clause conflicts with another, and no HEAD behaviour regresses. Changing them here would itself be a deviation from §3. **M2 matters most:**
- **M2. `scale.clips.in-window*` counts clips under the 224 px sticky track-header column.** It intersects the whole scroller box, as §3 c prescribes. At scroll 0 that changes nothing. At min-zoom-mid it inflates the count by about 1142/918 (19 → 24). Before 14b turns these rows into asserts or compares them with mounted counts, B should decide whether "in window" means the lane area (scroller box minus the header width).
- **M3. `scale.zoom.keydown-p95-ms` always equals `keydown-max-ms`.** With 10 keys, `percentile(…, 0.95)` picks index 9, the maximum. The 14b target "zoom p95 < 50 ms" would therefore be a max assert. B should rule on more keys or a different statistic before the assert.
- **L8 (flake risk).** `components-per-key` and `components-per-step` are averaged deterministic rows that must match exactly across passes. They were stable in 2 runs × 3 passes. The interactions spec uses the same pattern.

**Architecture note (signal to B/root, not acted on):** the timeline-scroller search is duplicated in the spec, in `readScaleDom` and `setTimelineScroll`. 14b and 14c will need it again. Proposal: a bounded `perf/lib` task for a `findTimelineScroller` helper (ruler parent, scrollable overflowX, optionally cross-checked against `data-testid="arrangement-timeline-scroller"`). `perf/lib/**` is frozen this round. No signal on `ArrangementLane.tsx`.

## Known gaps
- **Budget notes, final edit:** the trailing period was removed so that every note ends exactly with `record — not run on sketch (L58)` (23 of 23 checked). This changes note text only (`loadPerfBudgets` reads it as a string), so no perf re-run was needed. Claims were re-run afterwards (K23 is still 23).
- **Step-h scroll margin is 48 px.** The 4th step lands at scrollLeft 9185, and the maximum is 9233 (10375 − 1142). If C sees the problem `scroll steps: … did not move by clientWidth`, it means the timeline's scrollWidth at min zoom changed and the last step was clamped. It does not mean the attribute regressed.
- The scale spec runs only at 1440×900, as the task specifies. 1280×720 is covered by C's COUNT-BROWSER and NO-VISIBLE-CHANGE rows.
- `scale.scroll.loaf-max-ms` is 0. No long animation frame happened in the scroll windows (the LoAF threshold is 50 ms). It is a record only.
- Not run by A, per the speed rules: the full suite, `verify`, a build outside the perf config, and the other perf specs (PERF-RES belongs to C).

## Exact next C checks
1. **SCALE-SPEC:** run alone, after the untimed browser warm-up. Expect rc 0, `failures` [], model = mounted = 200, clip-subtree 3400, in-window 1, min-zoom-mid ≥ 1.
2. **PERF-RES:** run alone. `res.dom.*` should equal `c-round-396/perf-results/latest-resources.json`.
3. **COUNT-BROWSER:** at both viewports, with `b-round-397/probe/groups-drag.cjs`. Expected counts: 3/0 → 3/0 held → 2/1 → 3/0, and Music stays 3 when folded.
4. **NO-VISIBLE-CHANGE:** both greps should give 0. Take the screenshots.
5. **AUTH.**
6. **SOURCE-SCOPE:** the claims at the end should equal `a-round-398/claims-end.txt`, and the manifests should show 0 failures.
7. **DOCS:** doc 254, and `In Progress (stage` should appear in 4 files.

## Acceptance (A-side only; C decides PASS)
- §3 items 1–5 are implemented. LC1–LC5 are green and 5/5 mutants are red. Typecheck, lint and scoped Biome are at rc 0. The covering set is green. The perf spec is green with self-checks passing in 2 runs. The claims diff matches §7.
- I do not claim COUNT-BROWSER, PERF-RES, AUTH or the gate rows; they belong to C and the gate.
