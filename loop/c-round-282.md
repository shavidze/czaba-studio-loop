# C — round 282 (PERF-2: demo synth in a module Web Worker)

**Verdict: FAIL.** A reported a STOP (DW3/DW9 cannot pass against the byte-frozen sketch), and doc 211 plus the doc 163/169 sections were not written. Everything else that C could run was run independently on A's tree. The code is byte-identical to B's sketch, so the browser evidence below stays valid for a test-only and docs-only fix-up under option (a).

- HEAD `000da42`; tree = 4 `M` + 3 `??` (all §5 paths; the 3 doc paths are absent).
- Env: `env-status.json` round 282, store 200. Dev server :5173 up. C's own production build of A's tree ran on :5288 (scratch `/tmp/c282/prod`). Its `node_modules` is a symlink, and no Vite dev optimiser ran, so :5173 was untouched.
- Ableton conformity: **does not apply** (performance round, no user-visible change).

## Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: `sha256sum -c b-round-281-r282-tree-sha256.txt` rc 0 at the start and again at the end, after every C run; `git status` 4 M + 3 ?? = §5 paths only | shell |
| HUNK-SCOPE | PASS for code: the six code files `cmp`-identical to `git archive 000da42` + `sketch.diff`; the test file is new. The doc part is **not applicable**: no doc hunks exist | `/tmp/c282/base` |
| CLAIMS | PASS: `claims.sh` on a clean archive = `claims-output-at-000da42.txt` except K1 `(archive)` (predicted). Script rc 1 = the exit status of its last grep (K22 count 0), not an error. L29 sweep: 27 untagged hits, all grant/path/instruction lines or this round's new files; no untagged fact about current code | `c-round-282/logs/claims.txt` |
| SWEEP | PASS. SW-A: new names only in the 7 granted files (no doc yet). SW-B: `perf/budgets.json`, `perf/studio-lab.perf.spec.ts` only. SW-C: same 4 consumer files; `studio-lab.perf.spec.ts` goes from 1 to 3 hits, and the 2 new hits are the granted `measureSettled` (l.533–534). 1b-i EQUIV: see PERF | shell |
| TYPECHECK | PASS rc 0 | `c-round-282/logs/tsc.log` |
| UNIT | **FAIL**: 5 files, 98/100 passed; **DW3 and DW9 red** (`toBe` on the wrapper). DW1–DW10 exist by name (DW6 has two cases, a/b) | `c-round-282/logs/vitest.log` |
| UNIT-MUTANTS | PASS: C's own scratch copies. MU-U1 red DW2 (+DW3, DW9). MU-U2 red DW4 (+DW3, DW9). MU-U3 red DW10 (+DW3, DW9). DW3/DW9 are red on the unmutated tree anyway | `c-round-282/logs/muU*.log` |
| PERF-RUN | see §Perf | `c-round-282/perf/` |
| EQUIV | see §Perf | |
| SCRIPT-MAX | see §Perf | |
| SYNC-FALLBACK | see §Perf | |
| WORKER-BROWSER | PASS (real Chromium, prod build, 1 untimed warm-up, 3 runs × 2 viewports). (a) a `demo-synth.worker-bXZ66geB.js` script request and a dedicated worker in every run. (b) the longest script in a LoAF from navigation to `Demo collection ready`: 43/49/46 at 1440 and 43/67/52 at 1280, so **0 scripts ≥ 100 ms**. `Worker.onmessage` appears as a LoAF script in 4/6 runs, and in at least one run per viewport. In the other 2 runs its frame stayed under the 50 ms LoAF threshold, so it left no entry. (c) 0 page errors | `c-round-282/worker-probe.json`, `worker-probe.cjs` |
| LIBRARY-STATES | PASS, both viewports: ids, item text, durations, Add enabled (no `aria-disabled`), 96 wave rects ×9, the final status and the status log `Loading the demo collection…` → `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` all equal `library-head.json`; 0 errors | `c-round-282/library-c282.json` |
| EXPORT-BITEXACT | PASS, both viewports. Pulse: sha256 `1fea093b…3f94`, 4 608 044 B, 48 kHz 24-bit stereo, 16.000 s, peak 0.297. All (7 clips): sha256 `72228706…b574e`, 25 056 044 B, 87.000 s, peak 0.963. 0 errors | `c-round-282/export-c282.json`, `export-probe-c282.cjs` |
| SSR | PASS: `curl` on :5288 `/studio-lab` 200, and the HTML contains `Demo collection — no sign-in required` | `c-round-282/logs/ssr-grep.txt` |
| G282-AUTH | PASS, fresh context, no credentials, both viewports, on :5173 (dev, A's tree) and :5288 (prod). `/studio-lab`: workspace 1, badge 1, `auth_user` null, 0 cookies at start. `/studio/middle-east`: `Sign in required`, `audio[src]` 0, no workspace. `/api/studio-token` without a header: 401 `Please sign in to access Studio.`; with a fake bearer: 500 `Unable to prepare Studio access`, no token. The first :5173 attempt threw an uncaught error (its stack was not captured; it was the first browser load of the dev server in this job, a case L38 names as a cold start) and was replaced by the second attempt, which passed. :5173 still returned 200 at the end of C's phase | `c-round-282/auth-*.json`, `auth-{lab,guard}-{dev,prod}-*.png` |
| DOC-211 | **FAIL, not implemented**: `docs/implementation/2026/quarter-IV/211-*` does not exist; docs 163/169 unchanged (GATE281-S2's sentence not added). `grep 'In Progress (stage'` = 0 | shell |
| gate | full vitest, build, Biome, verify and smoke are the root gate's and are not claimed | |

## Bugs (for B)
- **C-R282-01 (medium, planning):** DW3/DW9 cannot pass as specified. `demo-synth.client.ts` l.35 `return { mix, stems: { pulse, bass, pad, lead } };` builds a new wrapper object to narrow the type without `as`. `toBe(composition)` on the wrapper can therefore never hold. The five `Float32Array`s keep their identity. B wrote `toBe` rows against its own sketch without running them on the scratch (L23: "the scratch pre-check applies a sketch of every behaviour change"). C confirms A's STOP independently. A's option (a), equality of the wrapper plus `toBe` per array plus a single shared result, is the stronger property, and it keeps the code bytes and all browser evidence valid.
- **C-R282-02 (medium, not implemented):** doc 211 and the doc 163/169 §5 sections (including GATE281-S2's sentence) are missing. The fix-up writes them after the DW ruling.
- **C-R282-03 (low):** DW10's sample-by-sample loop is vacuous in jsdom. The worker module and the test share one `demo-synth` module instance (`vi.resetModules()` runs only in `beforeEach`), so the posted arrays and `getDemoStemComposition()` are the same objects. Proof: C added `expect(composition.mix).toBe(expected.mix)` on a scratch copy (client unmutated), and DW10 still passed (`c-round-282/logs/dw10-identity-proof.diff`, `dw10-identity-proof.log`). Only the transfer `toBe` checks carry weight. Fix: reset modules (or import the synth fresh) between the worker import and the expected composition, or assert `not.toBe` before the sample loop.

## Passed through from A's code-reviewer (not C's findings; for B)
- The `postMessage`-throw fallback (client l.72–76) has no row (proposal DW11).
- Architecture note: the worker imports from its own launcher (`demo-synth.worker.ts:2` → `demo-synth.client`). Proposal: move the protocol into a neutral module. The build handles the self-reference: C's prod worker chunk is 1959 B and contains no `new Worker`.

## Perf (C's own runs, alone; scratch copies of A's tree)
- **PERF-RUN: PASS.** `CI=true npx playwright test --config playwright.perf.config.ts`: `3 passed (13.1m)`, rc 0. PERF-1a 6.8 min, PERF-1b-i 5.1 min (45 % of the 15 min test timeout; ROOT-REQ-PERF-TIMEOUT unchanged). Nothing else ran. `c-round-282/perf/run.log`, `latest*.json`.
- **SCRIPT-MAX: PASS.** `load.script-max` is an assert PASS with median 44 [41, 53, 44], budget < 100. `load.ready-ms` [913, 1032, 886]; `load.settled-ms` [1537, 1639, 1814], so settled ≥ ready in every pass. No `harness.loaf-scripts` problem (0 hits in the log). Records: `load.longtask-max` 70 (53–73), `load.settled.longtask-max` 70 (53–73), `load.settled.longtasks-over-50` 1, `load.commits` [5, 6, 5], `load.components` [371, 464, 371]. This is the race that B predicted and that made these rows wallclock.
- **EQUIV: PASS, all 5 with rc 0 and 0 problems** (`c-round-282/equiv.txt`).
  - 1a vs sketch: 320 rows.
  - 1a vs C281: reclass commits [5,5,5]→[5,6,5], components [366×3]→[371,464,371].
  - 1b-i vs C281: 144 rows.
  - 1b-ii vs sketch: tolerated only `res.mem.used-ready-mib` 5.4→5.3. Bytes rows exact: studio-lab 366987 / 1162601, home 263571, studio-guard 286181.
  - 1b-ii vs C281: the moved lines are exactly the four `res.js.*` bytes rows; `res.mem.used-ready-mib` did not move; tolerated `res.export.1.peak-backing-delta-mib` 65.1→65.
- **SYNC-FALLBACK:** **PASS.** C applied the exact one-line `b-round-281/mu-sync-fallback.diff` to a scratch copy (`c-round-282/mu-sync-fallback-applied.diff` is `cmp`-identical) and ran `run-1a.sh` alone: `assert failed load.script-max: measured median 371 [371, 368, 372], budget < 100`, `1 failed`, 7.1 min. The median is ≥ 300, so the row catches a worker that never runs. `c-round-282/mu-sync-fallback/run.log`.

## browserVerified
`true`. Every real-browser row (PERF-RUN, SYNC-FALLBACK, WORKER-BROWSER, LIBRARY-STATES, EXPORT-BITEXACT, G282-AUTH) ran in real Chromium at both viewports where relevant. The round still **FAILS** on UNIT (C-R282-01) and DOC-211 (C-R282-02). These are test and doc rows, not browser rows. Because the six code files are byte-identical to the sketch, a fix-up limited to the test file and the docs (option (a)) does not invalidate this browser and perf evidence. C would then re-run SOURCE-SCOPE, HUNK-SCOPE, UNIT, UNIT-MUTANTS and DOC-211, and confirm by `cmp` that the code bytes are unchanged.

## Not run
None of C's rows. No row is blocked by the backend.
