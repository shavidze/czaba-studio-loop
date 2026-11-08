# Round 410: PERF-15a — precomputed audiowaveform peaks: parser, optional `peaksUrl` on the collection, and the worker fallback in the collection load (stage 1 of 2; behaviour-neutral for `/studio-lab`)

**Planned by:** B, at the round 409 → 410 planning, 2026-11-08 (`b-round-409.md`). The advisor was used after orientation and before hand-off.

## Read first
- `lessons.md` in full. The most relevant lessons are L4, L11, L23, L26, L28, L29, L30, L31, L49, L51, L56, L57, L58 and L59.
- This file. Background only: `docs/technical/performance/perf-plan.md` (the PERF-15 row) and the backend handoff note `docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md`. Both are outside `store/`.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `API_ERROR_HANDLING.md`, `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`, plus `docs/implementation/TEMPLATE.md`. `.claude/prompts/new-service.md` covers the new module.
- **Claims:** `bash b-round-409/claims-410.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-409/claims-410-planning-output.txt`, with empty stderr.
  - Output on the committed sketch scratch: `b-round-409/claims-410-sketch-output.txt`.
  - The two differ only on the lines in `b-round-409/claims-410-planning-vs-sketch.diff`.

## Baseline: HEAD `9616d3a`, clean tree
- Gate 409 published `9616d3a` on both remotes [K16]. HEAD is `9616d3a…` [K1], and `git status --short --untracked-files=all` is empty [K2].
- **Frozen:** `b-round-409/r410-frozen-sha256.txt` has **1,301** entries: every tracked file except the 2 tracked grants. `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **Grants:** `b-round-409/grants-410.txt` (6 paths, §4).
- **No root patch pending:** `cloud/root-commits/` and `root-deps-request.json` do not exist in the loop folder at planning. If K1 at A1 is not `9616d3a`, A re-runs the claims on the new HEAD and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 409 passed and is published.** PERF-11c-iii-e-ii is done (C round 409 PASS, `browserVerified`/`realVerified` true, 0 bugs, gate `9616d3a`). That closes PERF-11c-iii and PERF-11c (D-29z1421).
- **No Critical or High finding is open.** The open Mediums are root-only, manual or `awaiting_user`, and none reproduces in the cloud browser. C reported no bugs in round 409.
- **REGRESSION-2026-11-10 is not due.** `regression-last.json` says 2026-11-07 [K17]. **RETRO** is due at round 416.
- **Order (D-29z1420): PERF-15 is next.** The architecture checkpoint ARCH-CHECKPOINT-PERF11C-III-BOUNDARY has no root result yet. It is non-blocking (D-29z1422).
- **What PERF-15 promises** (perf-plan): "waveform visible before decode", using backend-precomputed peaks (BBC audiowaveform), with the browser worker as the fallback. The .NET backend is not in the cloud, so the loop builds the client side, and B wrote the backend handoff note [K22].
- **Premise, measured at HEAD (L37):**
  - Peaks are computed only after `loadSource` resolves. The collection load has one `loadSource` → `requestSourcePeaks` → `storeSourcePeaks` + ready chain [K7].
  - The library preview draws `sourcePeaks` in any load state. While a source is loading, the wave is dimmed (`opacity-40`) [K8]. So peaks stored before `ready` become a visible waveform there.
  - Lane clips need `ready`: `sourceDurations` holds ready sources only [K9], and a source cannot be added before it is ready. **So in this feature the "before decode" gain is in the library preview only.** That limit is written into the PERF-15 row.
  - The re-decode path (PERF-13 evicted sources) never recomputes peaks [K7: two `requestSourcePeaks(buffer` calls, the collection load and the video site]. Re-decoding therefore never fetches peaks again.
- **Split (D-29z1424):**
  - **15a (this round)** adds the parser, the optional `peaksUrl` hook and the fallback wiring. No collection sets `peaksUrl` yet [K10: 0 hits at HEAD], so `/studio-lab` behaves exactly as at HEAD. The jsdom rows prove the new path.
  - **15b (next)** gives the demo's URL-backed sources a `peaksUrl` and proves "waveform before ready" in a real browser with `page.route` stubs. It also adds the purchased adapter input, consults `product-designer` on the dimmed loading waveform, and closes PERF-15.
  - 15a's unit PASS does **not** make PERF-15 done.

## 1. Rulings (B)

### D-29z1423: the 15a contract
1. **New module `app/lib/arrangement/precomputed-peaks.ts`.** It is pure, apart from `fetch` through `SourceFetch`.
   - **`parseAudiowaveformPeaks(data: unknown): PrecomputedPeaks | null`.** It reads audiowaveform JSON v1 (mono, `channels` absent or 1) or v2 (`channels` ≥ 1). The fields are `sample_rate`, `samples_per_pixel`, `bits` 8|16, `length` and `data`: interleaved min/max per pixel per channel, with `data.length === length × channels × 2`. Every value must be an integer in `[-2^(bits-1), 2^(bits-1) − 1]`.
     - Each pixel's value is the max over channels of `max(|min|, |max|)`, divided by 128 (8-bit) or 32768 (16-bit), and clamped to 1.
     - The pixels are resampled onto `PEAK_BUCKETS_PER_SECOND` (100/s) by max-pooling every pixel that overlaps a bucket's sample range. The bucket count is `peakBucketCount(length × spp, sample_rate, 100)`, the same count `computePeaks` gives.
     - **Reject (null)** a file coarser than 100/s (`samples_per_pixel > sample_rate / 100`). Pooling only ever goes downward.
     - Any malformed field also gives null.
     - Format source: the audiowaveform DataFormat page (checked 2026-11-08, see the handoff note).
   - **`precomputedPeaksMatchDecodedLength(peaks, decodedLength, sampleRate)`** is true when `|peaks.length − peakBucketCount(decodedLength, sampleRate, 100)| ≤ PRECOMPUTED_PEAKS_BUCKET_TOLERANCE` (1), and false when the expected count is 0. It compares buckets (durations), never raw sample counts.
   - **`fetchPrecomputedPeaks(url, signal, fetchPeaks = plainSourceFetch)`** never throws and resolves `null` when:
     - the status is not ok;
     - the declared `content-length` is above `PRECOMPUTED_PEAKS_MAX_BYTES` (4 MiB; a missing header passes);
     - the JSON or the data is bad;
     - the fetch rejects;
     - the signal aborted while the body was read.

     It passes the caller's `signal` to the fetch.
2. **`WorkspaceCollection.peaksUrl?: (source: WorkspaceSource) => string | null`** is optional. `undefined` or `null` means the HEAD path, with no fetch.
3. **Collection-load wiring** (`ArrangementContext.tsx`, the effect that runs `collection.loadSource` for every source):
   - For each source with a url, `fetchPrecomputedPeaks` starts with the effect's `controller.signal`, in parallel with `loadSource`.
   - **Early store:** when it resolves non-null, the signal is not aborted, and that source's peaks are not yet decided, the peaks are kept per effect run and stored with `storeSourcePeaks`. The state stays `loading`.
   - **At decode:** the source is marked decided. If the kept precomputed peaks are **16-bit** and match the decoded length, the ready step uses them **without a worker job**. Otherwise `requestSourcePeaks` runs as at HEAD, and its peaks replace the early ones (the decoded result always wins). **8-bit peaks are only a placeholder** (the `performance-optimizer` consult: normalising quiet stems makes 8-bit steps visible).
   - **Late arrival:** peaks that resolve after the decode never replace anything.
   - **Decode error:** the source is marked decided. If precomputed peaks were stored for it, they are removed with a new `dropSourcePeaks` (a no-op when the id is absent), so an error source shows no waveform. The error state and text are unchanged.
   - **Abort** (unmount or collection swap) is the existing controller abort, and it cancels the fetch.
   - **Swap cleanup (TL-R410-SK-2):** the effect's cleanup also removes, with `dropSourcePeaks`, the early peaks of every source that never became ready in that run. A source that became ready keeps its peaks across a swap, exactly as decoded peaks do at HEAD (`peaksReady`, set in the ready step).
4. **Unchanged:**
   - the ready patch and its order (decodedBuffers set and evict, then peaks, then `ready`, then `settle`, then `resyncAfterDecode`);
   - the video peaks site, the re-decode path and the status texts;
   - the demo and purchased collections, which set no `peaksUrl`.
   - **No status write is added (L51 not triggered). No focus changes (L50 not triggered). Nothing visible changes (L39 not triggered).**

### D-29z1425: consult and review rulings
- **`performance-optimizer`** (`b-round-409/consult-performance-optimizer.md`). Adopted:
  - reject data coarser than 100/s;
  - skip the worker only for 16-bit peaks with a matching length;
  - the 4 MiB cap;
  - parse on the main thread in this stage;
  - the PP4 fixture row (within 1/32768 plus one neighbouring bucket);
  - the backend asks: `-b 16`, `--split-channels`, `spp = sample_rate/100`, the same decoded asset, and protected `peaksUrl`s for purchased files.

  The stage-b browser row design comes from the same consult.
- **`tech-lead` on v1** (sha `ac774c3c…`, kept as `b-round-409/sketch-410-v1.patch.txt`) gave APPROVE WITH LOWS:
  - **SK-2** (early peaks survived a collection swap): fixed in v2 (swap cleanup; PPC10, PPC11).
  - **SK-4** (rows missing): fixed in v2 (PPC9 decode-fails-first, PPC10 swap, PPC11 ready-survives-swap; the describe title corrected).
  - **SK-1** (the 4 MiB cap is advisory: no header passes, and gzip shows the compressed size): written into the handoff note and doc 263 as defence in depth.
  - **SK-3** (the `peaksUrl` call is unguarded, like `previewUrl` at HEAD): a deferred Low, to be fixed together with `previewUrl` (TL-R410-SK-3).
  - **SK-5/SK-6** (Info: an MP3 trimming offset, versioned URLs): in the handoff note.
  - **SK-7** (Info): recorded.
- **`tech-lead` on v2:** a delta re-review on the dispatched sha gave **APPROVE WITH LOWS**, with no Medium or higher (`b-round-409/sketch-review.md`, which names both shas). The only new item is TL-R410-SK-8: record the equivalent mutant. It is fixed in `b-round-409/mutants/equivalent.txt`.
- **Equivalent mutant (recorded, not a row):** removing the context-level `controller.signal.aborted` check from the early store stays green, because `fetchPrecomputedPeaks` already returns null after an abort (PP7d). It is kept as defence. The record is `b-round-409/mutants/equivalent.txt`.

### D-29z1426: the dispatched patch (L58: reviewed = dispatched)
**Patch:** `b-round-409/sketch-410.patch.txt` (v2), sha256 `8f22c005447dc388…` in `b-round-409/sketch-dispatched.sha256` [K13]. It touches 5 files, and `git apply --check` is clean on HEAD [K5]. **A applies it byte-for-byte and does not edit those 5 files afterwards.**

**Evidence on the sketch (committed scratch `/tmp/b410`):**
- `tsc` rc 0, Biome on the 5 files clean, `npm run lint` rc 0 (`precheck-lint.log`).
- **Full vitest: 264 files, 3,906/3,906, rc 0** [K19]. HEAD has 262 files / 3,885 tests; the sketch adds 2 files / 21 tests.
- **Covering set** (`sketch-logs/covering.txt`, 16 files): **274/274** [K20]. The slowest test is 2,715 ms, in `render-budget` under a 15,000 ms timeout (18 %). No test is above 50 % (L31, `sketch-logs/slowest.txt`).
- **Mutants: 17/17 red**, with pristine rc 0 before and after and 0 scratch status lines [K15] (`mutants/summary.txt`). The v1 runs are kept under `mutants/v1/`.
- **Browser regression probe** (`probe/peaks-probe-410.mjs`): HEAD (:5173) and the v2 sketch (:5174, own Vite cache) both give `ok` at both viewports (the v1 runs are in `probe/v1/`). All 9 demo sources show 96 preview columns, with 0 `peaks` fetch/xhr requests and 0 page errors [K21]. The sketch server's first warm-up timed out cold (L38, `probe/sketch-cold-warmup-note.txt`).
- **Lane probe** (round 409's `b-round-408/lane/lane-actions-probe.mjs`): `ok`, 8/8 steps and 0 page errors on HEAD and on the v2 sketch at both viewports (`lane/summary.txt`) [K23].

### Doc 263 (new; L26, L28)
**New doc:** `docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md`. 263 is the next free number [K6].
- **Form:** the title is `PERF-15a: წინასწარ გამოთვლილი peaks (audiowaveform) და worker fallback`, in Georgian with technical terms in English. It uses the 7 TEMPLATE headings, in order.
- **l.4, byte-exact:** `**სტატუსი:** In Progress (stage 1 of 2; C round 410 PASS)`.
- **What it contains:**
  - the contract of D-29z1423 in prose;
  - the stated limit "before decode = the library preview only";
  - **ტესტირება:** the PP1–PP7 and PPC1–PPC11 rows, and the 17 mutant lines copied from `b-round-409/mutants/summary.txt`;
  - the 4 MiB cap is described as defence in depth (TL-R410-SK-1);
  - **TODO:** PERF-15b and the backend handoff note (cited by its full path, outside the repo).
- Loop evidence is cited by its full loop path and marked as outside the repo.

After this round, the count of `In Progress (stage` docs goes from 7 to 8 [K6b], and `C round N pending` stays at 0. No other doc changes.

### Ruling lines (L4)
- **Patch files:** "apply the patch byte-for-byte" wins over any style preference of A's reviewer. A Medium+ in the patch logic is a STOP (L11), not an edit.
- **`ArrangementContext.tsx`:** the patch is the only change. The frozen-manifest rule does not apply to it, because it is a grant.
- **Doc findings** are fixed in doc 263 only.

### Side effects (L49)
| Effect | Ruling | Proof |
|---|---|---|
| Peaks may now land in `sourcePeaks` before `ready` | Intended (library preview only; lanes need ready [K9]) | PPC1, PPC2 |
| The ready step skips the worker for matched 16-bit peaks | Intended | PPC1 (identity kept); MU-410-NO-SKIP red |
| The 409 rationale "peaks land in the same commit as ready" (K12 of round 409) no longer holds for a collection with `peaksUrl` | Recorded. Lanes re-render on the early store through the whole-map `laneSources` deps, and no stale view is possible (SIG-R409-SOURCE-DURATIONS-IDENTITY) | covering `render-budget` unchanged; 15b adds a browser row |
| A decode error after an early store | The peaks are removed | PPC5; MU-410-ERROR-KEEPS-PEAKS red |
| A decode error before the peaks arrive | The late peaks are not stored | PPC9; MU-410-ERROR-NOT-DECIDED red |
| A collection swap while a source is loading | Its early peaks are removed; a ready source keeps its peaks (HEAD behaviour) | PPC10, PPC11; MU-410-SWAP-KEEPS-EARLY, MU-410-READY-NOT-MARKED red |
| No `peaksUrl` | HEAD path, no fetch | PPC6; the browser probe (0 peaks requests) |
| The 16-bit skip path stores the identical array again in the ready step | Intended: the ready step has one shape for both paths; the extra `Map` identity lands in the same batched commit as `ready` (extra renders only) | PPC1 (`toBe(early)`) |

## 2. Reference
Not applicable. This is a performance round with no visible or behavioural change in `/studio-lab`, which the reference-first rule excludes. No screen-budget change. The `product-designer` consult belongs to 15b, where the loading-state waveform first becomes visible.

## 3. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-409/sketch-410.patch.txt`, then `git apply` the same file. Do not edit the 5 files after that.
3. Write doc 263 as above.
4. Run the §5 checks. Write `a-round-410.md` as you go: changed files, checks with their rc and file paths, reviewer findings, and a For B section (include any Architecture note).

## 4. Grants (`b-round-409/grants-410.txt`)
- **Patch only:**
  - `app/lib/arrangement/precomputed-peaks.ts` (new)
  - `app/lib/arrangement/__tests__/precomputed-peaks.test.ts` (new)
  - `app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx` (new)
  - `app/contexts/ArrangementContext.tsx`
  - `app/types/arrangement.ts`
- **New doc:** `docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md`.
- **Nothing else:** no protected, auth, route, config, package, data, component, perf or other doc file.
- At the end, `git status --short --untracked-files=all` shows exactly 2 ` M` lines and 4 `??` lines.

## 5. A's checks
Under the speed rules, the full suite and verify belong to the gate.

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-409/claims-410.sh` at start | Equals `claims-410-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check` on the 5 patch files | rc 0 each |
| A3 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-409/sketch-logs/covering.txt)` (16 files) | 274/274 pass. Report the slowest test against its declared timeout. L31: none may be above 50 %; otherwise STOP |
| A4 | Claims at end | Differs from planning only on K2 (6), K5 (`no`), K6 (`1` plus the doc 263 l.4), K6b (8, pending 0), K7, K10, K11 and K12. K7, K10, K11 and K12 equal `claims-410-sketch-output.txt`. K3 stays 1,301 with rc 0 |
| A5 | `code-reviewer` (6 files) | No Critical, High or Medium in the patch logic. A Medium+ there is a STOP (L11). Doc findings are fixed in doc 263 |

## 6. C's acceptance
Write `c-round-410.json` with **all L57 fields**, including `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed` and `affectedChecksRunOnSketch`, and one result per row. `mutantRedOnSketch` = `b-round-409/mutants/summary.txt`. Run `python3 -I tools/l57-check.py` before hand-off.

**Order (L59):** run the heaviest rows first: row 5, then row 4, then row 3. Write `c-round-410/progress.json` after every row.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the planning output except the A4 lines. Status = the 6 granted paths. Frozen 1,301 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply the patch to a `git archive HEAD` scratch and `cmp` its 5 files against the working tree: 0 differences |
| 3 | **DEMO-UNCHANGED** (browser, 1440×900 and 1280×720, working tree) | Run `node b-round-409/probe/peaks-probe-410.mjs http://127.0.0.1:5173 <out>.json <WxH>`. **Assert:** `ok` true, no `error`, `pageErrors` [], `peaksRequests` []. All 9 sources in `sourceIds` have `rects` 96, as in B's HEAD and sketch runs [K21]. Keep the screenshot per viewport |
| 4 | **LANE-PATH** (browser, both viewports, working tree) | Run `node b-round-408/lane/lane-actions-probe.mjs http://127.0.0.1:5173 <out>.json <WxH>` (round 409's probe; its `bass-waveform` step adds Bass and waits for the clip waveform, which goes through the restructured ready step). **Assert:** `ok` true, no `error`, `pageErrors` [], all 8 steps `pass` true, as in B's HEAD and sketch runs [K23]. Keep the screenshot per viewport |
| 5 | **UNIT + MUTANT** | The A3 set passes, 274/274. Then run the mutants on a committed scratch copy of the working tree (steps in the notes). Pass = 17/17 RED, each naming its expected row; pristine before and after rc 0 with `failed []`; scratch status 0 lines |
| 6 | **AUTH** (browser, both viewports) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 7 | **DOCS** | Doc 263 l.4 is byte-exact. Doc 263 has the 7 TEMPLATE headings in order (L26). Its 17 mutant lines equal `b-round-409/mutants/summary.txt`. PP1–PP7 and PPC1–PPC11 exist in the two test files. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. No other doc changed |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. Claims at end equal claims at start, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch run is in `b-round-409/precheck-full.log` |

**Notes on the rows:**
- **Rows 3, 4 and 6, retries:** a first-load timeout on a cold server is an environment problem (L38: warm `/studio-lab` once in a browser first). Retry at most twice; it is never a FAIL.
- **Row 3, scope:** the demo sets no `peaksUrl`, so this row proves only that nothing changed. The "waveform before ready" browser proof is 15b's. C records this, and it is not a FAIL.
- **Row 5, mutant steps:**
  1. Copy the working tree to `/tmp/c410-scratch` and symlink `node_modules`.
  2. Run `git init && git add -A && git commit`.
  3. Run `S=/tmp/c410-scratch OUT=<loop>/c-round-410/mutants python3 -I b-round-409/mutants/run.py`. Never use the default `OUT`, which holds B's evidence.
  4. The runner prints `SCRATCH-STATUS N lines`. On C's committed scratch, 0 lines is the pass value.

**Neighbouring behaviour that could break:**
- The collection load order and its status texts (`collection-load-status`, `failed-source-refusal`, `pending-status`).
- The worker peaks and the `ready` timing (`peaks-worker` PW11/PW18).
- The decoded-buffer eviction and re-decode (`decoded-buffer-eviction-ui`).
- The library preview (`library-preview`, `library-preview-stream`).
- The render counts on load (`render-budget`).

## 7. For C: the mutants (`b-round-409/mutants/run.py`)
| Mutant | Site | Expected red |
|---|---|---|
| MU-410-NO-SKIP | the matched 16-bit branch removed (always the worker) | PPC1 |
| MU-410-SKIP-8BIT | the skip accepts any bits | PPC2 |
| MU-410-NO-LENGTH-CHECK | the length match is always true | PPC3 |
| MU-410-LATE-OVERWRITE | the decided check is dropped from the early store | PPC4 |
| MU-410-ERROR-KEEPS-PEAKS | no `dropSourcePeaks` on error | PPC5 |
| MU-410-NO-EARLY-STORE | no early `storeSourcePeaks` | PPC1 |
| MU-410-FIRST-CHANNEL-ONLY | only channel 0 is read | PP1 |
| MU-410-MAX-ONLY | `min` is ignored | PP2 |
| MU-410-COARSE-ACCEPTED | the 100/s guard is removed | PP5 |
| MU-410-POOL-FIRST-PIXEL | pooling takes the first pixel | PP3 |
| MU-410-NO-SIZE-CAP | the size cap is removed | PP7c |
| MU-410-NO-SIGNAL | the fetch gets no signal | PP7a |
| MU-410-TOLERANCE-ANY | the tolerance is 2 | PP6 |
| MU-410-ERROR-NOT-DECIDED | the error path does not mark the source decided | PPC9 |
| MU-410-SWAP-KEEPS-EARLY | the swap cleanup does not drop early peaks | PPC10 |
| MU-410-READY-NOT-MARKED | the ready step does not mark `peaksReady` | PPC11 |
| MU-410-ABORT-IGNORED | an abort during the body read is ignored | PP7d |
