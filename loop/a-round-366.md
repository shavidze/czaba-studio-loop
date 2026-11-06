# A round 366 — PERF-9b-i: stem-cache perf rows on the production build (doc 236 stage 2)

No STOP. Note for B: A's code-reviewer found **two Medium findings on B's dispatched sketch** that `b-round-365/sketch-review.md` did not rule. Per §1.1 ("A may change the sketch only to fix a code-reviewer finding"), A fixed them inside the 2 perf files, re-ran A-PERF and both mutants, and sent the files back to the reviewer. The re-review returned both **Resolved** with no new Medium+. Under L58 an unruled Medium on the sketch is RETRO 368 input (B-origin). The spec and budgets are therefore **not** byte-identical to the sketch (see "Deviations from the sketch").

## Changed files (exactly 3)
| File | Change |
|---|---|
| `perf/studio-lab-stem-cache.perf.spec.ts` | new; sketch (sha OK) + the Medium 2 fix (CDP byte window) |
| `perf/budgets.stem-cache.json` | new; sketch + 4 `audio-requests` rows re-kinded to `wallclock` + reworded notes on the `cdp-*` and `warm-nocache` byte rows. Asserts unchanged (K4 equals the sketch output) |
| `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md` | l.4 = `**სტატუსი:** In Progress (stage 2 of 3; C round 366 PASS)`; stage-2 content in კონტექსტი, მიდგომა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO |

Final sha256: `a-round-366/final.sha256` (spec `5af89359…`, budgets `e8b694fe…`). Pre-fix copies: `a-round-366/spec.v1.ts`, `a-round-366/budgets.v1.json` (these are the sketch versions).

No `app/**`, `perf/lib/**`, existing spec/budgets, `package.json`, config, protected or doc 168 changes (K7 all 0; K5 protected-ok 11). A temporary Biome copy `app/__a366_biome_tmp.ts` (A's own) was created and removed in the same command.

## Deviations from the sketch (code-reviewer fixes, §1.1)
1. **Medium 1. The `stem.*.audio-requests` rows were `deterministic` counts, but their value depends on timing.** The hidden narrow-screen `<audio preload="metadata">` adds its Resource Timing entry only when its load finishes or is cancelled. Fix: the 4 rows are now `kind: wallclock` (still `record`, no budget). `fetch-requests` stays deterministic: a second fetch would be a real double-fetch. The re-reviewer accepted this and added a Low: as a record row, a consistent 4/4/4 would pass silently, so it would need to be an assert to catch a double-fetch.
2. **Medium 2. CDP mp3 bytes could be credited to the next open.** Fix: a new `putMp3Bytes()` records each open's CDP totals just before the next navigation, and `putReading` no longer takes CDP bytes. The `cdp-*` notes no longer call the rows a "cross-check of body-bytes", and they say why `dataReceived` is used (it counts aborted requests).
   - All spec edits are below line 85, so B's `85c85` counter-zero diff still applies verbatim.
3. **Low 9 (budget note).** The `warm-nocache` byte-row notes now say the kind follows B's v4 ruling and that A saw no variance there.
4. **Doc Lows.**
   - l.97 now reads that the blocked step does not rely on network rows.
   - l.98 wording fixed after the re-review (no claim of warm-nocache variance; the audio-requests reason is a different one).
   - These are doc-only edits made after the second review.

Reviewer Low **rejected by rule:** doc l.4 "C round 366 PASS" is mandated by L28. The re-reviewer accepted this.

## Acceptance rows (§2.1), actually run
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: sha256 of `sketch.patch.txt` = `sketch-dispatched.sha256`; `git apply --check` OK; output identical to `claims-366-planning-output.txt` | `a-round-366/claims-pre.txt` |
| A-CLAIMS final | PASS, see the list below the table | `a-round-366/claims-final-v3.txt` (equal to `claims-final.txt`) |
| A-TYPE | PASS, rc 0 (before and after the fixes) | `a-round-366/typecheck.log`, `typecheck-v2.log` |
| A-LINT | PASS, rc 0, 205 warnings (≤ 205); Biome on a temporary `app/` copy of the final spec rc 0 (L30: Biome does not cover `perf/`) | `lint.log`, `lint-v2.log`, `biome-spec-v2.log` |
| A-PERF | PASS: run 1 (sketch) exit 0 and run 2 (final) exit 0; 7/7 asserts PASS, every row 3 samples, `failures: []` | `perf.log` + `latest-stem-cache.json`; final: `perf-v2.log` + `latest-stem-cache-v2.json` |
| A-MUTANTS | PASS on both sketch and final, see below the table | `a-round-366/mutants/` |
| A-REVIEW | PASS after fixes: pass 1 found 2 Medium (fixed); pass 2 found both Resolved, 0 new Medium+ | summarised below |
| A-DOC | PASS: l.4 byte-exact; 7 TEMPLATE `## ` headings in order; `grep -rl 'C round [0-9]* pending' docs/implementation` → 0 | — |

**A-CLAIMS final, detail:**
- K1, K5, K6, K9, K10 and K11 equal planning.
- K2 = `413218e 3`.
- K3 = `spec 1 budgets 1`.
- K4 equals the sketch output (46 rows, 7 asserts).
- K7 = all 0.
- K8: l.4 is as §1.3, `pending 0`.
- K12 = `doc236-headings 7`.
- K13 is empty.

**A-MUTANTS, detail:**
- **cache-off:** red on 6 asserts (`warm.body-bytes`, `warm.status-304`, `cold.entries-stored` −1, `warm-ready-ratio`, `blocked.ready` 0, `blocked.entries` −1). Liveness stays green.
  - Final run values: warm body 7,532,018 B, ratio 0.993.
  - It also reports `nondeterministic count stem.warm.{body,transfer}-bytes` (mutant path only; the same on the sketch).
- **counter-zero:** red only on `stem.harness.cold-body-live` (0). `warm.body-bytes` 0 stays green.
- Each mutant was restored from a saved copy and checked with `cmp` (`*.restore.txt`).
- Logs: `mutant-cache-off.log` and `mutant-counter-zero.log` (sketch), `mutant-cache-off-v2.log` and `mutant-counter-zero-v2.log` (final).

**A's measured medians (final run, 1440×900, 4 CPUs, CPU rate 1, throttle 40 ms / 1,250,000 / 375,000 B/s):**
- cold: ready 7527 ms, body 7,664,757 B, stem window ≈ 6.18 s, entries stored 2.
- warm (evicted): ready 1409 ms, body 0, 2 × 304, transfer 600 B; **ready ratio 0.187**.
- warm-http: ready 777 ms, 2 × 304.
- warm-nocache: 2 × 200, 7,664,757 B (the DevTools case, record only).
- blocked: ready 1, entries 2.
- audio-requests: cold 1, warm 0, warm-http 0, nocache 1.
- cdp-mp3: cold 7,791,496, warm 0, warm-http 0, nocache 7,791,496.

A ran no full vitest suite, no `npm run verify` and no other perf spec (gate rows). Every perf run ran alone (L38).

## Code-reviewer
- **Pass 1** (`code-reviewer` subagent, score 8/10): Medium 1 and Medium 2 above, and Lows 3–12.
- **Pass 2** (score 9/10): both Mediums Resolved; no new Medium+. New Lows:
  - (a) `fetch-requests` is record-only, so a consistent double-fetch passes silently; candidate: `assert == 2` on `stem.warm.fetch-requests`.
  - (b) A late double-fetch after the read is not detected.
  - (c) Residual CDP window: old-page bytes between `takeMp3Bytes()` and the navigation commit.
  - (d) Doc l.98 wording; fixed.
- **Lows routed to B (for 9b-ii or the polish pass; not fixed, scope):**
  - A-R366-REVIEW-QUIET-NOOP: `waitForQuietState` is a no-op because the spec does not install `installPerfInstrumentation`.
  - A-R366-REVIEW-NOCACHE-REWRITE: the warm-nocache background rewrite is not awaited before the blocked step. The reviewer traced `put()`; every interruption leaves a consistent pair.
  - A-R366-REVIEW-QUOTA-DETAIL: low quota silently skips caching; record `navigator.storage.estimate().quota`.
  - A-R366-REVIEW-PAGEERROR: page errors are not counted.
  - A-R366-REVIEW-NAMING: `stemEntriesTimeoutMs` → `stemFetchTimeoutMs`.
  - A-R366-REVIEW-DOUBLE-REPORT: a blocked-open failure is reported twice.
  - A-R366-REVIEW-ABOUT-BLANK: repeat same-URL `goto` may count as a reload.
  - A-R366-REVIEW-STEM-PATHS: `stemPaths` duplicates the private `demoUrls`.
  - A-R366-REVIEW-FETCH-ASSERT: Low (a) above.
  - A-R366-REVIEW-CDP-RESIDUAL: Low (c) above.
- **Architecture note (proposal for B, not done):** the spec hardcodes `'entries'`, a copy of the private `STORE_NAME` in `stem-cache.client.ts`. Proposal for 9b-ii: export `STEM_CACHE_STORE_NAME` from `stem-cache.ts` and import it in the spec (SC1–SC21 unchanged). Keep it as is for 9b-i, because `app/` is frozen.

## Known gaps
- The spec/budgets differ from the sketch, so C's PERF row runs the final files, not the sketch. B's sketch logs remain valid for the unchanged asserts.
- Vercel production headers are not measured (ROOT-Q-R365-VERCEL-STATIC-HEADERS).
- A did not run the PROBE, AUDIO or G366-AUTH rows (C rows) or any 1280×720 measurement (the spec is 1440×900 only by design).
- `test-results/perf/latest-stem-cache.json` in the store now holds the last mutant run; the real final report is `a-round-366/latest-stem-cache-v2.json`. C's PERF run overwrites it.

## Exact next C checks
1. CLAIMS: `bash b-round-365/claims-366.sh` must equal `a-round-366/claims-final-v3.txt`.
2. SOURCE-SCOPE: there are 2 untracked perf files and doc 236 is modified; nothing else. Compare the sha256 with `a-round-366/final.sha256`.
3. PERF alone: the 7 asserts PASS, 3 samples per row, no failures. Also check that the `audio-requests` rows are now `wallclock` and that `cdp-*` totals are 0 on warm and warm-http.
4. MUTANT-OWN on a scratch. Note that the counter-zero diff still applies at line 85.
5. PROBE at 1440×900 and 1280×720, then AUDIO, then G366-AUTH, then DOCS (l.4 byte-exact, 7 headings, every named row and mutant log exists under `a-round-366/`).

## Scope completed
All §2.1 A rows pass. This round does not complete PERF-9b (9b-ii is open), and it does not complete the backlog.
