# B round 365 → 366: sketch review log (PERF-9b-i)

Sketch: `b-round-365/sketch.patch.txt` (two new files: `perf/studio-lab-stem-cache.perf.spec.ts`, `perf/budgets.stem-cache.json`). Its sha256 is in `sketch-dispatched.sha256`. Scratch: `/home/runner/b365-scratch` = `git archive 413218e` + the patch (does not survive the job).

## v1 → v2 (B's own production runs)
- v1 measured the warm reopen with `Network.setCacheDisabled(true)`: 200 with the full body (`perf-sketch/run1.log`). `perf-sketch/headers-prod.json` shows why: DevTools cache-disabled mode adds `Cache-Control: no-cache` and `Pragma: no-cache`; the production static server (remix-serve, express `send`/`fresh`) then ignores `If-None-Match` and answers 200. A real visitor (HTTP cache kept or evicted) gets 304. v2 makes the evicted-HTTP-cache reopen (`Network.clearBrowserCache`) the primary warm scenario and keeps the DevTools case as record rows `stem.warm-nocache.*`.
- v2 replaced `encodedBodySize` by network body bytes (`transferSize > 0 ? encodedBodySize : 0`), so a memory/disk-cache hit counts 0 like a 304.

## performance-optimizer consult (round 365 planning)
- Keep the 6 asserts; the two mutants separate them (cache-off: every row except liveness red; counter-zero: only liveness red). Ratio `<= 0.5` sound (0.17 to 0.25 loaded). Throttle sound (cold time network-bound).
- Adopted in v3: `stem.blocked.entries == 2` (assert); CDP `dataReceived` byte cross-check per open (`cdp-mp3-bytes`, `cdp-media-bytes`, record, wallclock because the aborted media request stops at a timing-dependent byte count); machine details in the report.
- Adopted as a C row, not a harness pass: 1280×720 (`probe/stem-prod-probe.mjs`).
- Not adopted this round, routed: a changed-ETag browser row (→ PERF-9b-ii, with the hit-200 replacement path); forced revalidation on every hit (→ PERF-CAND-STEM-BACKGROUND-REVALIDATE, Low candidate, after a validator question is settled).
- Rejected premise: "Medium, owner deploy config" for the `immutable` + mtime-ETag headers. The consult itself asked B to confirm the host first. `vercel.json` (`framework: remix`) shows production is Vercel, not remix-serve; remix-serve is only the perf harness host. Recorded as info B-R365-HARNESS-HOST-HEADERS; Vercel's static headers were not measured (no production access from the cloud), so no claim is made about them.

## tech-lead review (on v2) and rulings applied in v3
- **Medium, Resource Timing read before the hero stem finished** (`waitForLibraryReady` waits for the previewed source only): **fixed** - every open now also runs `waitForCollectionReady` (fails on a failed status) and, except the blocked open, `waitForStemFetches` (both stem paths have a fetch entry, cap 30 s) before reading.
- **Medium, `stem.warm-ready-ratio <= 0.5` noisy** (ready counts from navigation; `clearBrowserCache` also re-downloads JS under throttle): **kept as assert, ruled.** The cold open downloads the same JS under the same throttle with an empty cache, so the JS cost is on both sides. Evidence: 12 unloaded samples 0.166-0.177 (run2, run4-assert, run-v3, counter-zero), loaded replicate 0.220-0.252 (run3, on v2; v3 changed only waits after the ready timestamp), cache-off 0.981-0.995. Budget 0.5 = about 2x the loaded maximum. The window ratio stays record; its 0 fallback now records a problem and a NaN sample.
- **Low, `indexedDB.open` without a version can create an empty DB:** **fixed** - `onupgradeneeded` aborts the transaction, so the probe returns -1 and creates nothing (cache-off v3 shows -1).
- **Low, blocked step proves only the previewed stem:** **fixed** - `waitForCollectionReady` on the blocked open; navigation timeout lowered 120 s -> 60 s.
- **Low, hard-coded DB name:** **fixed** - imports `STEM_CACHE_DB_NAME` from `../app/lib/arrangement/stem-cache` (as `lib/app-labels.ts` imports app strings). The store name `entries` stays a literal (not exported; exporting it would change `app/`).
- **Low, Resource Timing buffer:** **fixed** - `performance.setResourceTimingBufferSize(2000)` init script.
- **Info:** units in the exact set; error handling fine; warm-http equals warm (forced `no-store`) - kept as a regression signal.
- **Keep/extract:** keep a separate spec file (five throttled navigations per pass, CDP cache changes; merging would put the resources rows under the throttle).

## v3 evidence
- `perf-sketch/run-v3.log` + `run-v3-latest.json`: 46 rows, 7 asserts PASS, 0 failures, machine 4 cpus.
- `perf-sketch/mutant-cache-off-v3.log`: 6 asserts red (entries -1, warm body 7.5 MB, 304 0, ratio 0.987, blocked ready 0, blocked entries -1); liveness green.
- `perf-sketch/mutant-counter-zero.log` (diff `mutant-counter-zero.diff.txt`, on v3): liveness red only.
- v2 patch kept as `sketch-v2/sketch-v2.patch.txt`.

## v3 → v4 (advisor, before hand-off)
- `stem.cold.body-bytes`, `stem.cold.transfer-bytes`, `stem.warm-nocache.body-bytes`, `stem.warm-nocache.transfer-bytes` → `kind: wallclock` (record rows). A plain fetch can reuse the partial HTTP-cache entry of the concurrent `<audio>` 206 request; the cache-off mutant showed 7,664,757 / 7,515,518 / 7,517,018 B, and `report.ts` applies the exact-match rule to record rows too. The spec file is unchanged; the mutant logs on v3 stand for v4 (no re-kinded row is an assert). `perf-sketch/run-v4.log`: 7 asserts PASS, 0 failures. v3 patch kept as `sketch-v3/sketch-v3.patch.txt`.
