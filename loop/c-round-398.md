# C round 398 — PERF-14a: PASS (browserVerified true)

Baseline c93d926; HEAD unchanged; only the 5 grants differ (1 modified, 4 new). `ArrangementLane.tsx` diff is the single line `data-clip-count={clips.length}`.

| Row | Result | Evidence |
|---|---|---|
| SCALE-SPEC (alone, first) | PASS rc 0, failures [], 3 passes, problems [] and pageErrors 0 in each pass, 23 rows with 3 samples each | `c-round-398/perf-scale.log`, `perf-results/latest-scale.json` |
| PERF-RES (alone) | PASS rc 0, failures []. `res.dom.page-0/1/2` 684/751/769, `clip-subtree` 17, `ruler-1/2` 95/95, identical to c-round-396 | `perf-res.log`, `perf-results/latest-resources.json` |
| COUNT-BROWSER, 1440x900 and 1280x720 | PASS. At every step and on every lane `data-clip-count` equals the mounted `[data-clip-id]` count: dup 3/0, held 3/0, released 2/1, undo 3/0, fold Music keeps 3 (`data-track-folded` true) | `count-<vp>.json`, 5 screenshots per viewport, script `count-browser.cjs` |
| NO-VISIBLE-CHANGE | PASS. Both greps (css and `[data-clip-count` in app) give 0 hits. Empty and demo screenshots at both viewports are a plain record | `nvc-*.png` |
| AUTH | PASS. Fresh context without credentials opens the `/studio-lab` demo. `/studio/<handle>` shows "Sign in required" with 0 workspace elements. `/api/studio-token` returns 401 | `auth.json`, `auth-premium.png` |
| SOURCE-SCOPE | PASS. Claims at start equal the planning output apart from the §7 facts. Claims at end equal A's `claims-end.txt`. K4 has 0 failures, K3 is 11/11 | `claims-start.txt`, `claims-end.txt` |
| DOCS | PASS. Doc 254 is Georgian with the 7 TEMPLATE headings in order. l.4 is exact. `In Progress (stage` appears in 4 files and `C round N pending` in 0. All cited mutant, LC and file ids exist. The 4 `.6x` ids are covered by the doc's suffix rule in step e | doc 254 |
| gate | Full vitest, typecheck, build, Biome, verify: not run by C and not claimed | `gates/gate-round-398.json` |

## Scale spec medians (1440x900, production build, 3 passes)
page 4333, clip-subtree 3400, model 200, mounted 200, in-window 1, zoom keydown p95 and max 40 ms at 1× and 192 ms at 6×, in-window at min zoom 19 and at min-zoom-mid 24, scroll commits per step 1, loaf 0. All of them are close to B's dev probe: page 4294, subtree 3400, 48 ms and 272 ms.

## Signals for B (not bugs)
- M2: `in-window*` counts clips under the sticky header column, so min-zoom-mid reads 24 where about 19 are in the lane area. B should define "window" before 14b turns these rows into asserts.
- M3: with 10 keys, p95 equals max. The 14b target "zoom p95 < 50 ms" needs more keys or a different statistic.
- The timeline-scroller search is duplicated in the spec. A `perf/lib` helper is a candidate.
- The first COUNT-BROWSER run at 1440 exited with a Node error. The reruns passed (`C-R398-NOTE-FIRST-RUN-1440`, environment).
- Not run by C: the 5 LC mutants (A's record).
