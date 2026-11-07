# Round 380: PERF-12a. WAV export copies out in chunks and the worker returns a Blob

**Planned by:** B, at the round 379 → 380 planning, 2026-11-07 (`b-round-379.md`).

**Decisions** (`backlog.json` v345 → v346, `decisions_log_b`):
- **D-29z1262:** round 379 accepted. C PASS with `browserVerified` true and 0 bugs; gate 379 published `ed634d5`. PERF-11c-iii-c2b is done.
- **D-29z1263:** the gate 379 review: two Lows deferred, the info findings closed, and one architecture signal (the eighth echo of the leaf-plumbing checkpoint).
- **D-29z1264:**
  - REGRESSION is still not due: 2026-11-05 → 2026-11-07 is 2 days.
  - VideoDock and Lane (d/e) wait for the checkpoint or RETRO 384. PERF-11b is awaiting_user.
  - So PERF-12 is next. It is split into 12a (this round) and 12b (windowed renders, later).
- **D-29z1265:** the order after this round (§6).
- **D-29z1266:** SABA-Q-PERF12B-TOLERANCE recorded as a question for Saba (§7).

**What this round does.** WAV export keeps its single `OfflineAudioContext` render. Three things change after the render:
- **No full copies on the page.** The page no longer calls `getChannelData(i).slice()`, which made two full copies of the song. Instead it copies 65,536-frame chunks out with `copyFromChannel` and transfers each chunk to the WAV worker, one chunk in flight.
- **The worker writes as it goes.** It writes the 24-bit WAV into a buffer sized up front, using the same clamp, rounding and header as today.
- **A Blob comes back.** On `finish` the worker posts a Blob, so the page never holds the WAV bytes.

The result shape `{ blob, peak, clippedSamples }` is unchanged, so both callers in ArrangementContext (WAV, and MP3 including `includeWav`) stay as they are [K4].

**What the user notices.** The same file, byte for byte, and the same dialog states. During export the page holds about 0.1 MiB instead of 65 MiB (130 MiB for 2 clips), and the 6× long tasks disappear.

**Read first:**
- `lessons.md`. A reads 11, 12, 23, 26, 28, 30, 31 and 58. C also reads 37, 38, 56, 57, 59 and 60.
- `b-round-379/sketch-review.md` (consults, rulings, measurements).
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `ERROR_TAXONOMY.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**Not applicable:**
- reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance change with no visible change (the 2026-10-27 rule).
- **Screen budget:** nothing visible is added or removed.

## Baseline
- **HEAD and tree:** HEAD is `ed634d5` (gate 379 published) and the store tree is clean, 0 status lines [K1, K2].
- **The copy that goes away:**
  - `graph.client.ts` copies both channels with `getChannelData(index).slice()` [K3] and passes them to `encodeArrangementWavOffMainThread`.
  - That function's only consumer is `graph.client.ts`. `encodeArrangementWavInPlace`'s only consumer is the worker. K5 and K6 also list the file that defines each function.
  - Tests that name either function or the worker module: `export-cancel`, `export-wav-in-place`, `export-wav` [K7].
- **Test fakes.** 11 test files have a `startRendering` fake that returns `{ sampleRate, getChannelData }` only [K8].
  - The fakes patch switches 9 of them.
  - The other two, `export-dialog-focus` and `export-dialog-tab-stops`, never reach the stream; they passed unchanged on the sketch.
  - `track-pan` pins the source text of `renderArrangementWav` instead.
- **Premise, measured by B** (`b-round-379/sketch-review.md` §1) [K14]:
  - In Chromium a rendered AudioBuffer costs 0 page backing until `getChannelData` is called (+37.1 MiB).
  - `slice` adds +37.1 MiB and the page-side WAV bytes add +27.8 MiB.
  - HEAD rows (`c-round-377/perf-resources.log`): export.1 peak-backing 65 MiB, export.2 129.9 MiB, longtask-max at 6× 171 / 304 ms.
- **Sketch v2** (the patches A applies; v1 → v2 is the tech-lead fixes in `sketch-v1-to-v2.interdiff.txt`):
  - **Unit:** render tests 475 / 495. The 20 failures are exactly the old-API rows A migrates in §2.3 [K13].
  - **Perf, 3 runs each** (`perf-res-sketch-v2.log`, 24 `res.export` rows [K15]): peak-backing 0.1 / 0.2 MiB; longtask-max 0 at 1× and 6×; longtasks-over-50 0; wall-ms 455 / 882 (HEAD 524 / 947) and 6× 1011 / 1768 (HEAD 1081 / 1819); bytes 29,189,420 and 58,378,796, equal to HEAD.
  - **Perf with the four rows asserting** (`perf-res-sketch-v2-assert.log`, sketch v2 + the budgets patch): all four PASS (0.1 / 0.2 MiB; 0 / 0 ms at 6×).
  - **Perf mutants on v2 with the asserts flipped** (`mutants/sketch-perf-v2/perf-summary.txt`; v1 run kept in `mutants/sketch-perf/`): MU-12A-PERF-GCD peak-backing 37.2 / 74.4; MU-12A-PERF-FALLBACK longtask-max.6x 1419 / 2513. Both make the spec fail.
  - **Perf `lib` tests on the sketch with the flipped budgets:** 40/40 (`sketch-perf-lib.log`, config `b-round-334/vitest.perf-lib.config.mjs`).
  - **Biome:** clean on all 15 patched `app/**` files (the helper was reformatted before the fakes patch was generated).
  - **Browser** (`probe/wav-head-380.json` vs `probe/wav-sketch-380.json`, dev servers, both viewports): steps E1–E4 have equal sha256, bytes and file names. Sketch attempt 1 hit a cold-start re-optimise reload (environment-invalid, kept as `wav-sketch-380-attempt1.log`).
  - **E4 does not clip on either tree** (Master +6.0 dB on Bass, overload empty), so the overload text is not exercised in the browser. SW1 and the PEAK-LAST / CLIPPED-LAST mutants cover it.
- **Manifests:**
  - Protected files: `b-round-318/protected-sha256.txt` [K9].
  - Frozen manifest: `b-round-379/r380-frozen-sha256.txt`, every tracked file except the grants, 1,254 entries [K10].
- **Budgets and doc:** `perf/budgets.resources.json` has 24 `res.export` rows [K18]. Doc number 246 is free [K19].

## 1. Behaviour that must not change
- **Exported files:** every WAV is byte-identical to HEAD's for the same project and scope. This covers the whole project, after Ctrl+D, a time selection, and Master at its maximum. The file name is unchanged, and so are the overload warning text (peak, clipped samples, reduction).
- **MP3 and WAV + MP3:** these exports encode from the same WAV Blob, so they are unchanged.
- **The export dialog:** states and progress (render → wav → done), the "WAV created" text, Cancel during the WAV phase (cancelled message, no download, a later export still works), and the 30 s stall message.
- **Edge cases:** an empty project is still refused before any render, and an invalid range is still refused.
- **Other routes:** the purchased Studio route (`/studio/:productId`) does not use this path. Its guard stays: no workspace, and 0 `audio[src]` when signed out.

## 2. What A changes (grants: `b-round-379/grants-380.txt`, 19 paths)
1. **Apply the sketch:**
   - From `b-round-379/`, `sha256sum -c sketch-dispatched.sha256` must report 3 OK [K12].
   - From `store/`, apply in this order:
     1. `patch -p1 < ../tmp/studio-real-loop/b-round-379/sketch-src.patch.txt`
     2. `patch -p1 < ../tmp/studio-real-loop/b-round-379/sketch-fakes.patch.txt`
     3. `patch -p1 < ../tmp/studio-real-loop/b-round-379/sketch-budgets.patch.txt`
   - Then `sha256sum -c ../tmp/studio-real-loop/b-round-379/sketch-files-stable-sha256.txt` must give 14/14 OK [K11].
   - What the source patch does:
     - **`export-wav.ts`:**
       - `ARRANGEMENT_WAV_CHUNK_FRAMES` (65,536);
       - the types `ArrangementWavChunkSource`, `ArrangementWavStreamResult`, `ArrangementWavStreamRequest` and `ArrangementWavStreamResponse`;
       - `createArrangementWavStreamWriter`, which rejects a bad length or channel count, a chunk shape mismatch, an empty chunk, more frames than declared, and fewer frames at `finish`;
       - `encodeArrangementWavInPlace` and the old request/response types are removed;
       - `encodeArrangementWav` stays as the independent reference oracle (it goes through `encodeSfxWav`).
     - **`export-wav.client.ts`:** `encodeArrangementWavStreamOffMainThread(source, onProgress, signal)`, which replaces `encodeArrangementWavOffMainThread`. It handles:
       - the no-Worker fallback with the same writer;
       - one chunk in flight;
       - the stall timer, re-armed on each `ack`;
       - abort: terminate, reject `ArrangementExportCancelledError`, no further copies;
       - a whole-percent 'wav' progress that starts at 0, ends at 1 and swallows a callback throw. The next chunk is posted before progress is reported.
     - **`export-wav.worker.ts`:** `begin` → `ack` per chunk with the cumulative written count → `finish` → `complete` with a Blob; `error` with the message.
     - **`graph.client.ts`:** returns `encodeArrangementWavStreamOffMainThread(rendered, …)`. No `getChannelData` and no `.slice()` on the rendered buffer.
   - What the fakes patch does:
     - adds `__tests__/helpers/fake-rendered-buffer.ts` (`fakeRenderedBuffer(channels, sampleRate)` with `length`, `numberOfChannels`, `getChannelData` and `copyFromChannel`);
     - points the `startRendering` fakes of the 9 files at it. No assertion changes;
     - changes the one `track-pan` source pin to `return encodeArrangementWavStreamOffMainThread(`.
   - **Make no source edit beyond the patch.** An edit beyond it is a STOP (L11). Test files get only the edits in §2.3.
   - **Rulings, not STOPs:**
     - the ack window stays at 1 (PO-R380-W1, `sketch-review.md` §4);
     - the writer's invariant messages (`WAV stream: …`) are English internals. They reach the UI only through the existing "worker failed" prefix, as the old `'WAV encoding failed'` did;
     - **a throwing `onProgress` no longer fails the export, on either path.** At HEAD it rejected the no-Worker fallback, because `encodeSfxWav` called it synchronously; in the worker path it was already harmless. The throw-safe reporter (TL-R380-B1) makes both paths complete. SW2e covers both.
2. **Budgets (`perf/budgets.resources.json`).** The third patch makes this change; A makes no hand edit to the file. It flips exactly four rows to `"mode": "assert"`:

   | Row | Budget |
   |---|---|
   | `res.export.1.peak-backing-delta-mib` | `{ "op": "<=", "value": 5 }` |
   | `res.export.2.peak-backing-delta-mib` | `{ "op": "<=", "value": 5 }` |
   | `res.export.1.longtask-max.6x` | `{ "op": "<=", "value": 100 }` |
   | `res.export.2.longtask-max.6x` | `{ "op": "<=", "value": 100 }` |

   - In the notes of the four `peak-backing-delta-mib` rows (1× and 6×), it replaces "the worker and the rendered AudioBuffer are outside it" with the measured fact: the rendered AudioBuffer counts only after `getChannelData`, which the export no longer calls, and the worker is outside it.
   - In the two flipped `longtask-max.6x` notes, it removes the "trend only" words.
   - In each flipped row's note, it adds "PERF-12a: asserted (round 380)".
   - Every other field and row stays unchanged.
   - Wallclock asserts already exist in this file (4 rows), so the contract allows them.
   - Doc 246 carries the contract section for these rows (L34). Docs 169 and 209 stay as historical baselines; no edit.
3. **Test migration** (`export-wav.test.ts`, `export-cancel.test.ts`, `export-wav-in-place.test.ts`) **and new rows** (`export-wav-stream.test.ts`, new). Rules:
   - No test file is deleted, and every migrated file keeps at least one `it(` row. `export-wav-in-place.test.ts` (whose theme is the encoder the worker runs) holds the SW1 writer rows, or at least one of them.
   - Each removed `it(` row gets a replacement that is equal or stronger, listed in `a-round-380.md` as a table: old row → new row(s).
   - A removal with no replacement is a Medium bug, except the IP2 ruling below.
   - New rows may live in `export-wav-stream.test.ts` or in the migrated files; the row id goes in the `it(` name.
   - **Rows to write:**
     - **SW1, writer and fallback bytes.**
       - Bytes equal `encodeArrangementWav` at lengths 1, 65,535, 65,536, 65,537 and 2·65,536+123, with NaN, ±1.5, exactly `MAX_24BIT_SAMPLE` and −1 in the data.
       - Chunk sizes 1, 7, 65,536 and one whole chunk. A mono odd-length case covers the pad byte.
       - Peak and clipped equal `measureExportOverload` on the whole input, with the loudest sample in an early chunk.
       - Length 0 and a non-integer length reject at once.
       - The writer leaves its input chunks untouched.
       - Replaces EW4, IP1, IP5, and IP2 as ruled.
     - **SW2a, the pump.**
       - `begin` has the exact shape.
       - Exactly one chunk is posted before the first ack (transfer list = the chunk buffers); then one chunk per ack, `finish` after the last ack.
       - `complete` resolves the Blob, peak and clipped, and the worker is terminated once.
       - Replaces the EW5 worker path and the EC4 3-argument row.
     - **SW2b:** error, `onerror` and `onmessageerror` each reject with the exact message and terminate once (replaces the EW5 error row and EW8e).
     - **SW2c:** a throwing constructor (replaces the EW5 constructor row).
     - **SW2d:** `postMessage` throws mid-stream and the export rejects with the constant.
     - **SW2e:** a throwing `onProgress` still completes, on the worker path and on the no-Worker fallback (TL-R380-B1 and the ruling in §2.1).
     - **SW3, the worker module:**
       - silent on `begin`;
       - acks with the cumulative `written`;
       - the `complete` Blob bytes equal the oracle;
       - errors for a chunk before `begin`, a shape mismatch, too many frames, a short `finish` and an empty chunk.
       - Replaces EW7 and IP4.
     - **SW4, 'wav' progress:**
       - it starts at 0, never decreases and ends at exactly 1;
       - two acks inside the same whole percent give one callback.
       - Replaces IP3.
     - **SW5, stall:**
       - EW8a, EW8b, EW8c and EW8d are re-pointed at the new function, with "progress" replaced by "ack";
       - an ack at 29 s keeps the stream alive past 30 s;
       - EW8d also asserts that the `copyFromChannel` call count stops changing after the abort;
       - EW8f stays as it is.
     - **SW6, abort (EC4 re-pointed):**
       - a pre-aborted signal makes no Worker and no `copyFromChannel` call;
       - the no-Worker fallback checks the signal before it encodes;
       - abort mid-stream terminates once and rejects cancelled, and a late `ack` or `complete` changes nothing;
       - the abort listener is removed on `complete` and on a failure.
     - **SW7, graph pin:** `renderArrangementWav` over a `fakeRenderedBuffer` whose `getChannelData` throws gives a Blob equal to the oracle for its channels.
   - **IP2 ruling:** IP2 ("in-place arrays hold the clamped samples") is retired with `encodeArrangementWavInPlace`. Its replacement is SW1's "the writer leaves its input chunks untouched".
   - **jsdom:** read Blob bytes with `blob.arrayBuffer()` if jsdom has it, otherwise with `new Response(blob).arrayBuffer()`. Say which in the report.
4. **Doc 246** (`docs/implementation/2026/quarter-IV/246-perf-export-wav-stream.md`, new):
   - l.4 is byte for byte `**სტატუსი:** In Progress (stage 1 of 2; C round 380 PASS)` (L28: PERF-12 has two stages).
   - The TEMPLATE headings in order (L26).
   - It records:
     - the premise table;
     - the protocol (begin / chunk / ack / finish / complete / error);
     - the ack-window ruling;
     - the four asserted rows, their bounds and their mutants;
     - the old → new row map;
     - the tech-lead rulings (TL-R380-B1, -L1, -L2, -L3, -12B);
     - SIG-R380-WORKER-DOUBLE-BUFFER as a TODO;
     - 12b as the next stage, with the tolerance question for Saba.
   - Loop paths keep their full `tmp/studio-real-loop/…` form, labelled as outside the repository.
   - Cite only rows that exist (L26).

## 3. A: checks (speed rules)
- `npm run typecheck`, `npm run lint`, and `npx biome check` on the changed `app/**` files. Biome does not check `perf/` (L30). For the budgets file, run `node -e "JSON.parse(require('fs').readFileSync('perf/budgets.resources.json','utf8'))"`, then the perf `lib` tests through the scratch config (GATE304-M1) so the budget loader parses the new rows.
- `npx vitest run` on the files that `grep -rlE "renderArrangementWav|export-wav|startRendering" app --include=*.test.ts --include=*.test.tsx` lists (31 at HEAD), plus `export-wav-stream.test.ts`. All must pass.
- **Mutants:** on a `cp -a` copy under `a-round-380/`, run `TREE=<copy> OUT=<abs>/a-round-380/mutants bash ../tmp/studio-real-loop/b-round-379/mutants/run-mutants-380.sh`. Every mutant must be red on at least the row named here:

  | Mutant | Red on |
  |---|---|
  | NO-CLAMP | SW1 |
  | OFFSET | SW1 |
  | PEAK-LAST | SW1 |
  | CLIPPED-LAST | SW1 |
  | ALL-IN-FLIGHT | SW2a |
  | NO-ABORT | SW6 |
  | NO-REARM | SW5 |
  | NO-FINISH-CHECK | SW1 or SW3 |

  An anchor that is missing, or a mutant that stays green, is a STOP: write the row and the reason. Record `summary.txt`.
- **Timeouts:** report any test above 50 % of its declared timeout (L31).
- **`code-reviewer`:** required (3+ files). A Medium or above is a STOP (L11). An Architecture note goes to B.
- **No browser or perf runs:** A runs neither; they are C's.
- Write `a-round-380.md` as you go, including the row map.

## 4. C: what to verify
C writes `c-round-380.md` and `c-round-380.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified`, `mutantsRecorded`;
- `mutantRedOnSketch` = `b-round-379/mutants/sketch-perf-v2/` (perf mutants on the dispatched v2 with the asserts flipped; the unit mutants have no B sketch run because A writes those rows; give that reason);
- `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`;
- `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-380.json c-round-380/l57-check.txt` must exit 0.

Working rules:
- Write `c-round-380/progress.json` after every row (L59).
- Copies and destructive commands stay under `c-round-380/` (L60).
- Run perf and mutants alone (L38).
- Warm up the browser before timed probes (L38).
- A HEAD comparison uses a copy at `ed634d5` on another port with its own Vite `cacheDir` (L38). A cold-start re-optimise reload is environment-invalid and uses a replacement attempt.
- **Gate rows** (full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke) go under `"gate"`, never under `"passed"`.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all`. From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-379/r380-frozen-sha256.txt` and `…/b-round-318/protected-sha256.txt` | Every status line is a path in `grants-380.txt` (≤ 19 lines); both rc 0 |
| **CLAIMS** | From the loop root: `bash b-round-379/claims-380.sh`, compared with `b-round-379/claims-380-output.txt` (HEAD) and `claims-380-sketch-output.txt` (sketch). Their diff is `claims-380-allowed-delta.txt` | K3, K5, K6, K8 and K11 equal the sketch output. K7 lists only test files in the grants. K1, K9 and K10 equal the HEAD output (rc 0). K2 counts A's lines. K19 shows doc 246 present. Every other line equals the HEAD output. No `MISSING` |
| **SKETCH-EQUAL** | `sha256sum -c ../tmp/studio-real-loop/b-round-379/sketch-files-stable-sha256.txt` from `store/` | 14/14 OK |
| **ROW-MAP** | Read A's old → new table against the HEAD and A versions of the three migrated files | Every `it(` removed since HEAD has a listed replacement that asserts the same behaviour or more (IP2 as ruled). A missing replacement is a Medium bug. Also record the `expect(` and `it(` counts of the four files at HEAD and on A's tree |
| **UNIT** | The §3 vitest set on A's tree, then `export-wav-stream`, `export-wav` and `export-cancel` with `--sequence.shuffle --sequence.seed=42` | All pass. Record the counts. Report any test above 50 % of its timeout |
| **MUTANTS-UNIT** | On a `cp -a` copy under `c-round-380/`, alone: `TREE=<copy> OUT=<abs>/c-round-380/mutants bash b-round-379/mutants/run-mutants-380.sh` | Each of the 8 mutants is red on its row from the §3 table. `restored` is printed |
| **PERF-RES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` on A's tree, alone (it builds) | Every assert passes, including the four flipped rows. `res.export.{1,2}.bytes` are equal to HEAD (29,189,420 and 58,378,796). The record export rows are listed next to `b-round-379/perf-res-sketch-v2.log`; a wall-ms more than 30 % above the sketch is reported as info |
| **PERF-MUTANTS** | On a copy under `c-round-380/`, alone: `TREE=<copy> OUT=<abs>/c-round-380/perf-mutants bash b-round-379/mutants/run-perf-mutants-380.sh` | MU-12A-PERF-GCD: both peak-backing rows above 5. MU-12A-PERF-FALLBACK: both longtask-max.6x rows above 100. `restored` is printed |
| **WAV-BYTES (browser, dev)** | `node b-round-379/probe/wav-bytes-380.mjs <A base> c-round-380/wav-A.json`, and the same on the HEAD copy | At 1440×900 and 1280×720, steps E1 (whole, 1 clip), E2 (whole, 2 clips), E3 (time selection) and E4 (Master at +6.0 dB) have equal `sha256`, `bytes`, `file`, `overload` and `progressLabel` on A and HEAD. B's run gave these HEAD sha prefixes: E1 `8f9b42a7`, E2 `12414b40`, E3 `5f9c3032`, E4 `2af840dc` (`b-round-379/probe/wav-head-380.json`). The E4 overload is empty on both trees; record that, it is not an overload PASS |
| **CANCEL-BROWSER (browser)** | Both viewports, on A's tree and the HEAD copy. Add Bass, Ctrl+D ×3, Export WAV. Click Cancel as soon as the progress label first shows the WAV phase (poll every 20 ms). Then Export WAV again | Cancelled text and dialog state equal HEAD. No download from the cancelled attempt. The second export's sha equals HEAD's for the same project. If the WAV phase is too short to catch on either tree, record it with the poll log and rely on SW6 (not a FAIL) |
| **MP3-BROWSER (browser)** | Both viewports, A's tree and HEAD: 1 clip, Export MP3, then "WAV + MP3" | Every download is present with the same name and byte length as HEAD; the WAV of "WAV + MP3" has E1's sha. MP3 sha equality is recorded: equal, or HEAD itself differs between two runs |
| **G380-AUTH (browser)** | A fresh anonymous context at both viewports, warmed up | `/studio-lab` shows the workspace with `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`. `/api/studio-token` with no token returns 401 with no token in the body. The fake bearer's 500 goes under `blocked` (backend unavailable) |
| **DOCS** | Doc 246 | l.4 byte for byte; TEMPLATE headings in order; every row id, mutant id and file it names exists (L26); `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |

**`browserVerified`:** true only if WAV-BYTES, CANCEL-BROWSER, MP3-BROWSER and G380-AUTH ran at both viewports in this round and PERF-RES ran on the production build. If the budget runs out, it is false and B plans the remainder (V2 rule).

**Job limit:** a row that cannot finish before the job limit is marked not run with the real stop signal (L59), never PASS.

## 5. Neighbour risk
- **MP3 path.** It encodes from `rendered.blob` [K4]. The Blob now comes from the worker, not from page bytes. MP3-BROWSER covers it.
- **Range export.** `renderWindow` changes only the render length, and the stream reads `rendered.length`. Covered by XR1–XR4 (fakes only) and E3.
- **Overload report.** The peak is a max over chunks and clipped is a sum over chunks, both measured before the clamp. Covered by SW1, PEAK-LAST and CLIPPED-LAST. The browser recipe does not clip.
- **Progress UI.** The 'wav' phase still starts at 0 and ends at 1. Its fractions now follow acks instead of the worker's percent loop. The export progress UI tests are in the §3 set.
- **Stall and cancel.** The 30 s timer re-arms per ack. A 5-minute export sends about 220 chunks, so any one gap longer than 30 s still stalls, as before. Covered by SW5, SW6 and CANCEL-BROWSER.
- **Worker memory.** The worker briefly holds the WAV buffer and the Blob, about 2 × the WAV size, in the worker only (SIG-R380-WORKER-DOUBLE-BUFFER, not in 12a).
- **Not covered by the page metric.** The rendered AudioBuffer still exists in the renderer process for the whole export. Only 12b's windowed renders remove it.

## 6. Order after this round (D-29z1265)
1. After C PASS, round 380 goes to the gate: 4 source files, the budgets file, the tests and doc 246.
2. **REGRESSION-2026-11-08** at the next planning on or after 2026-11-08.
3. **PERF-12b** (windowed renders). Acceptance is a tolerance per TL-R380-12B. 12b does not wait for Saba's answer to SABA-Q-PERF12B-TOLERANCE: it is built and measured, and it publishes only with his answer or within the strictest tolerance he has accepted.
4. VideoDock and Lane (11c-iii-d/e), after ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING or at RETRO 384.
5. RETRO 384.
6. Then:
   - PERF-11b, if answered;
   - PERF-13…15;
   - SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM;
   - STEM-LANES;
   - SYS-1…3;
   - STORE-2b…5;
   - REVIEW-RECOMMENDATIONS;
   - T12-ADVANCED;
   - the phase-2 entries, under the skip rule.

## 7. Root notes
- **ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING is still unanswered.** This is its eighth echo: SIG-R379-GATE-ACTIONS-CONTEXT from gate 379. The request is in `b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`.
- **Question for Saba, SABA-Q-PERF12B-TOLERANCE (D-29z1266).**
  - The perf plan says a chunked export is "bit-exact vs full render". Tech-lead rules that this cannot hold for windowed renders, because ramps restart at window edges and sources start at fractional times.
  - The question: may a windowed export differ from a one-pass export by at most 1 LSB of 24-bit, at a bounded number of samples near the 30 s edges, with identical peak and clipped counts?
  - The alternative is to keep 12a only, which leaves the full AudioBuffer in renderer memory.

## 8. Claims (L29 + L56)
Run `bash b-round-379/claims-380.sh` from the loop root.
- HEAD output: `b-round-379/claims-380-output.txt`.
- Sketch output: `b-round-379/claims-380-sketch-output.txt` (run with `S=<scratch>`; K1, K2, K9 and K10 are not meaningful there).

| Tag | Claim |
|---|---|
| K1 | gate 379 published `ed634d5`; store HEAD |
| K2 | status line count |
| K3 | the `getChannelData(index).slice()` line in graph.client.ts (l.585) |
| K4 | 4 `await renderArrangementWav(` calls in ArrangementContext |
| K5 | files outside tests naming `encodeArrangementWavOffMainThread` |
| K6 | files outside tests naming `encodeArrangementWavInPlace` |
| K7 | tests that name the old functions or the worker module |
| K8 | `startRendering` fake files without `fakeRenderedBuffer` (11 at HEAD, 2 on the sketch) |
| K9 | protected sha |
| K10 | frozen sha (r380, 1,254 entries) |
| K11 | stable sketch files sha (14: 4 source, budgets, helper, 7 fake files, track-pan) |
| K12 | patch sha = dispatched (3 patches) |
| K13 | B's v2 sketch unit run (20 failed / 475 passed) |
| K14 | backing-model probe rows (10) |
| K15 | perf sketch v2 export rows (24) |
| K16 | every cited artifact exists |
| K17 | regression date, lessons lines |
| K18 | `res.export` rows in the budgets file (24) |
| K19 | doc 246 free / present |
