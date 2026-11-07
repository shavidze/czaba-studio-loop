# Round 381: PERF-13a. The perf harness measures decoded audio (PCM) kept alive in the page

**Planned by:** B, at the round 380 → 381 planning, 2026-11-07 (`b-round-380.md`).

**Decisions** (`backlog.json` v346 → v347, `decisions_log_b`):
- **D-29z1267:** round 380 accepted. C PASS with `browserVerified` true and 0 bugs; gate 380 published `9a05c82`. PERF-12a is done.
- **D-29z1268:** the gate 380 review and the A/C notes: two Lows deferred, info findings closed, two architecture signals recorded.
- **D-29z1269:** PERF-12b → `awaiting_user` (SABA-Q-PERF12B-TOLERANCE). This supersedes the D-29z1265 "built and measured" clause: a C PASS publishes automatically, and no tolerance has been accepted. PERF-13 starts.
- **D-29z1270:** PERF-13 premise re-measured (L37) and split into four stages (§6). Round 381 is stage 1 (13a), harness only.
- **D-29z1271:** the order after this round (§6).

**Why this round.** The perf plan's PERF-13 target is "backing store at ready ≤ 60 MB (140)". The row that measures it, `res.mem.backing-ready-mib`, now reads 19.3 MiB (`c-round-380/perf-res.log`), so the target looks met. It is the wrong metric, though. In Chromium a decoded `AudioBuffer` costs no page backing until `getChannelData` is called (measured in round 379, `b-round-379/sketch-review.md` §1). B measured the decoded audio itself at HEAD (`b-round-380/probe/pcm-head-381.json`) [K14]:
- `/studio-lab` keeps **124.04 MiB of decoded PCM alive at ready, in 9 buffers**. The result was identical in 6 of 6 runs (1440×900 and 1280×720, 3 each).
- 92.18 MiB of that comes from the two decoded MP3 files (101.35 s and 150.37 s); 31.86 MiB from the 7 synthesized sources (2 s, 5 s, 5 × 16 s) [K5, K6].
- Nothing ever removes a decoded buffer: `buffersRef` has 2 `set` sites and 0 `delete`/`clear` sites [K3, K4].

PERF-13b (the decoded-buffer cache with a budget) needs a row it can assert against. This round adds that measurement, as `record` rows, and changes no app code.

**What the user notices:** nothing. This round changes only `perf/**` and a doc.

**Read first:**
- `lessons.md`: A reads 11, 23, 26, 28, 30, 31, 37 and 58. C also reads 38, 56, 57, 59 and 60.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `GEORGIAN_DOCS.md`.
- `b-round-380/probe/pcm-probe-381.mjs`: B's probe. Port its registry into `perf/lib/pcm-live.ts`; do not copy its loose style (it has no types).

**Not applicable:** reference-first, `product-designer`, the YouTube request, the Ableton conformance check and the screen budget. This is a measurement round with no visible change (the 2026-10-27 rule).

## Baseline
- **HEAD and tree:** HEAD is `9a05c82` (gate 380 published); the store tree is clean, 0 status lines [K1, K2].
- **Where decoded audio lives:** `ArrangementContext` holds `buffersRef`, a `Map<string, AudioBuffer>` [K3]. Every collection source is decoded at load. The two demo URL sources are static files under `public/` [K5], so the scenario has no network dependency.
- **The harness today:**
  - `perf/studio-lab-resources.perf.spec.ts` reads the heap after GC with `readHeapAfterGc` and installs its init scripts with three `context.addInitScript` calls [K10].
  - Its ready point is `measureLoadReady`, which only waits for `waitForLibraryReady` (Add enabled). That is not "every source decoded". `perf/lib/page.ts` already exports `waitForCollectionReady` (status settled on "ready", then studio quiet), and the resources spec does not call it today [K22].
  - At HEAD the resources run reports no problems: every `problems` array is empty [K23].
  - `perf/budgets.resources.json` has 3 `res.mem.*` rows [K8].
  - The only consumer of the budgets file is the spec itself [K11].
  - The determinism contract treats MiB rows to 0.1 and `count` rows exactly [K9].
- **Types:** `tsconfig.json` targets ES2022 with lib ES2022, so `WeakRef` typechecks with no config change [K21].
- **Expected count:** the library source list is `page.getByRole('listbox', { name: 'Sounds' }).getByRole('option')`. B counted 9 at both viewports [K20].
- **Instrumentation safety:** the registry replaces `window.AudioBuffer` with a subclass. That is safe only because nothing in `app/**`, `perf/**` or `e2e/**` uses `instanceof AudioBuffer` (0 hits) [K7]. If A's code adds one, that is a STOP.
- **Manifests:**
  - Protected files: `b-round-318/protected-sha256.txt` [K12].
  - Frozen manifest: `b-round-380/r381-frozen-sha256.txt`, every tracked file except the grants, 1,271 entries [K13].
- **Docs:** number 247 is free [K15]. The `In Progress (stage` hits are docs 232, 238 and 246. Each belongs to an open stage (PERF-DRAG-PREVIEW, PERF-11c-iii d/e, PERF-12b); none is granted here [K16].

## 1. Behaviour that must not change
- **No file under `app/**` changes.** Studio, export and auth behave exactly as at HEAD.
- **Existing perf rows:** all 22 asserts still pass, and every existing `res.*` row keeps its value within its determinism contract compared with `c-round-380/perf-res.log`. That includes `res.export.{1,2}.bytes` (29,189,420 and 58,378,796) and `res.mem.backing-ready-mib` (19.3). The registry only observes; it must not change what the app does.

## 2. What A changes (grants: `b-round-380/grants-381.txt`, 5 paths)
1. **`perf/lib/pcm-live.ts` (new).** It exports:
   - **`installPcmLiveRegistry`**, a self-contained function for `context.addInitScript`. It wraps four creation points and records each result as `{ ref: new WeakRef(buffer), origin }`:
     - `BaseAudioContext.prototype.decodeAudioData` (`'decode'`). Pass every argument through and wrap the returned promise, so callers that use either form keep working.
     - `BaseAudioContext.prototype.createBuffer` (`'createBuffer'`).
     - the `AudioBuffer` constructor (`'ctor'`), through a subclass assigned to `window.AudioBuffer`.
     - `OfflineAudioContext.prototype.startRendering` (`'render'`).

     It exposes `window.__czabaPcm` with a `read()` that returns one entry `{ length, numberOfChannels, origin }` for each buffer whose `deref()` still resolves.
   - **`summarizePcmLive(entries)`** (pure): `{ count, bytes, byOrigin }`, where bytes = Σ `length × numberOfChannels × 4`.
   - **`pcmLiveProblems(reading, expectedCount)`** (pure). It returns problem strings, in this order:
     - "pcm registry missing", when `window.__czabaPcm` is absent;
     - "pcm registry did not count its probe buffer";
     - "pcm live count N ≠ M library sources".
   - **`readPcmLiveAfterGc(cdp, page)`.** It works in three steps:
     1. A `page.evaluate` creates one probe buffer, `new AudioBuffer({ length: 1, numberOfChannels: 1, sampleRate: 48000 })`, and keeps it on `window`.
     2. `HeapProfiler.collectGarbage`, then about 100 ms, then `collectGarbage` again.
     3. One `page.evaluate` reads the registry, reports whether the probe was counted, removes the probe from the totals and releases it.

     **GC ordering rule:** never call `deref()` in the same job before the GC. `deref` keeps its target alive until that job ends, so the order is always GC ×2 → read.
2. **`perf/lib/pcm-live.test.ts` (new)**, run through the scratch config (GATE304-M1). Its rows:
   - **PL1:** `summarizePcmLive` sums `length × channels × 4` and splits by origin (mono and stereo, two origins).
   - **PL2:** an empty list gives count 0 and bytes 0.
   - **PL3:** each problem string fires alone for its case, and no problem fires when the reading is valid (count equals the expected count, probe counted).
   - **PL4:** the probe is excluded from the totals.
3. **`perf/studio-lab-resources.perf.spec.ts`:**
   - Install `installPcmLiveRegistry` with the other init scripts.
   - At ready, in the 1× record pass, after the existing heap read, first call `waitForCollectionReady(page, result.problems, 'pcm ready')`, then `readPcmLiveAfterGc`. The existing heap read stays exactly where it is, so `res.mem.backing-ready-mib` is unchanged (L48: a reading after a fresh load waits for "collection ready").
   - `expectedCount` is the count of `page.getByRole('listbox', { name: 'Sounds' }).getByRole('option')` [K20]. It is never a literal 9.
   - Push every `pcmLiveProblems` string into `result.problems`.
   - Write the samples `res.mem.pcm-live-mib-ready`, `res.mem.pcm-live-count-ready` and `res.mem.pcm-live-decode-mib-ready`.
   - After the 1-clip export, where `res.mem.backing-after-export-delta-mib` is read, read again and write `res.mem.pcm-live-after-export-delta-mib`: export MiB minus ready MiB.
   - Nothing else in the spec changes.
4. **`perf/budgets.resources.json`:** add 4 rows after `res.mem.backing-after-export-delta-mib`, in the same shape as the existing `res.mem.*` rows. Every other row stays byte for byte.

   | Row | unit | kind | mode | Note must say |
   |---|---|---|---|---|
   | `res.mem.pcm-live-mib-ready` | MiB | deterministic | record | 1× only. Live decoded PCM after GC ×2 (`perf/lib/pcm-live.ts`). B's HEAD dev probe: 124.04 (`b-round-380/probe/pcm-head-381.json`). Budget owner: PERF-13b. Replaces backing-ready as the PERF-13 target |
   | `res.mem.pcm-live-count-ready` | count | deterministic | record | Live buffers at ready; equals the library source count (harness guard) |
   | `res.mem.pcm-live-decode-mib-ready` | MiB | deterministic | record | The `'decode'` part (decoded files). B's HEAD dev probe: 92.18. 13b eviction input |
   | `res.mem.pcm-live-after-export-delta-mib` | MiB | deterministic | record | record — not run on sketch: B ran no export probe. About 0 expected (the render buffer is released). A positive value is a 13b input, not a failure |

   - `owner` is `PERF-13a` and `budget` is `null`.
   - Do not add a note to `res.mem.backing-ready-mib`; doc 247 records why it is no longer the PERF-13 target.
5. **Doc 247** (`docs/implementation/2026/quarter-IV/247-perf-pcm-live-baseline.md`, new):
   - l.4 is byte for byte `**სტატუსი:** In Progress (stage 1 of 4; C round 381 PASS)` (L28).
   - The TEMPLATE headings appear in order (L26).
   - It records:
     - the premise (19.3 MiB backing versus 124.04 MiB PCM, and why);
     - the registry design and its four creation points;
     - the GC ordering rule;
     - the instanceof caveat;
     - the four rows (its contract section, L34);
     - the guard and its mutants;
     - the four PERF-13 stages (§6);
     - the tech-lead rule for 13b: pin only the sources of `present.clips` plus the one being previewed or exported, never history.
   - Loop paths keep their full `tmp/studio-real-loop/…` form, labelled as outside the repository.
   - It cites only rows and mutants that exist (L26).

## 3. A: checks (speed rules)
- **Static checks:** `npm run typecheck` (it covers `perf/**`; Biome does not, L30) and `npm run lint`.
- **Budgets JSON:** `node -e "JSON.parse(require('fs').readFileSync('perf/budgets.resources.json','utf8'))"`.
- **Perf lib tests** through `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs`: all 3 files pass (2 at HEAD [K19] + `pcm-live.test.ts`).
- **No full suite, no browser and no perf run.** Those belong to C and the gate.
- **Mutants:** A writes `a-round-381/mutants/run-mutants-381.sh` in the `TREE=<copy> OUT=<abs>` style of `b-round-379/mutants/run-mutants-380.sh`. Each mutant uses one anchored `sed`, checks that the anchor matched, and restores the tree.
  - **Unit mutant, which A runs:** MU-13A-SUM-NO-CHANNELS (bytes ignore `numberOfChannels`) must be red on PL1.
  - **Browser mutants, which C runs:**
    - MU-13A-NO-DECODE-WRAP: drop the `decodeAudioData` wrap. Expected: the count is 7, so a "pcm live count 7 ≠ 9" problem.
    - MU-13A-NO-CTOR-WRAP: drop the subclass. Expected: "probe" and count problems.

    A states each one's expected problem string.
- **`code-reviewer`:** required (3+ files). A Medium+ follows L11.
- Write `a-round-381.md` as you go.

## 4. C: what to verify
C writes `c-round-381.md` and `c-round-381.json` as it goes, with **all L57 fields**. `mutantRedOnSketch` is the string "none: B ran no sketch; the rows are record and the mutants are harness guards written by A" (a string, not JSON `null`). `python3 -I tools/l57-check.py c-round-381.json c-round-381/l57-check.txt` must exit 0.

Working rules:
- Write `c-round-381/progress.json` after every row (L59).
- Copies and destructive commands stay under `c-round-381/` (L60).
- Run perf and mutants alone (L38).
- Warm up the browser before timed probes (L38).
- Gate rows (full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke) go under `"gate"`.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all`. From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-380/r381-frozen-sha256.txt` and `…/b-round-318/protected-sha256.txt` | Every status line is a path in `grants-381.txt` (≤ 5 lines), and none is under `app/`. Both checks rc 0 |
| **CLAIMS** | From the loop root: `bash b-round-380/claims-381.sh`, compared with `b-round-380/claims-381-output.txt` | K2 counts A's lines; K15 shows 247 present. Every other line equals the HEAD output. No `MISSING` |
| **UNIT-PERF-LIB** | The scratch-config command from §3 | 3 files pass, PL1–PL4 among them. Record the counts |
| **PERF-RES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, alone (it builds) | 0 FAIL and 0 problems (HEAD had none [K23]). Every existing row as in §1 (list any record row that moved). The new rows: `pcm-live-mib-ready` within 0.1 of 124.0, count 9, decode within 0.1 of 92.2, and the after-export delta recorded with its value. **Pre-ruling:** if the after-export row alone trips the determinism check across passes, C records both values. That is planning info for B, not a FAIL, and A does not change its `kind`. A production value that differs from B's dev probe is not a FAIL if C explains it per source; an unexplained difference is a finding |
| **PCM-PROBE-BROWSER** | `node b-round-380/probe/pcm-probe-381.mjs http://127.0.0.1:5173 c-round-381/pcm-probe.json` (dev server) | Both viewports × 3: 124.04 MiB and 9 live, equal to `pcm-head-381.json` (app is unchanged, so this is the browser control for the registry) |
| **HARNESS-MUTANTS** | A's runner on a `cp -a` copy under `c-round-381/`, alone. Run the two browser mutants through PERF-RES and the unit mutant through UNIT-PERF-LIB | MU-13A-NO-DECODE-WRAP and MU-13A-NO-CTOR-WRAP each produce A's stated problem string, and the spec reports it. MU-13A-SUM-NO-CHANNELS is red on PL1. `restored` is printed |
| **G381-AUTH (browser)** | A fresh anonymous context at both viewports, warmed up | `/studio-lab` shows the workspace with `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`. `/api/studio-token` with no token returns 401 with no token in the body. The fake bearer's 500 goes under `blocked` (backend unavailable) |
| **DOCS** | Doc 247 | l.4 byte for byte; the TEMPLATE headings in order; every row, mutant and file it names exists (L26); `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |

**`browserVerified`:** true only if PERF-RES ran on the production build and PCM-PROBE-BROWSER and G381-AUTH ran at both viewports in this round.

## 5. Neighbour risk
- **The registry changes the page it measures.** The subclassed `AudioBuffer` and the wrapped methods run in every resources pass. The PERF-RES row (existing rows unchanged, export bytes equal) is the check that the app behaves the same.
- **WeakRef timing.** A read in the same job as a `deref` would count garbage as live. The GC ordering rule and the probe guard cover this.
- **Other perf specs** do not install the registry. They are unchanged.

## 6. PERF-13 stages and the order after this round (D-29z1270, D-29z1271)
**PERF-13 stages.** The full scope stays.
1. **13a (this round):** the PCM rows (record).
2. **13b:** a decoded-buffer cache module (`app/lib/arrangement/decoded-buffer-cache.ts`, tech-lead surface: `get`/`set`/`delete`/`clear`/`setPinned`/`totalBytes`/`asReadonlyMap`, `estimateBufferBytes`).
   - It is wired into `ArrangementContext` with a finite budget for sources no clip uses. It pins the sources of `present.clips` plus the one being previewed or exported, never history.
   - It clears on collection reset.
   - It decodes again on place, preview and export.
   - It separates "known" (duration and peaks) from "decoded". The `sourceNotLoaded` preview text is fixed.
   - Browser check on `/studio-lab`: under the chosen budget the unplaced 150 s source is evicted, its duration and peaks stay, and placing or previewing it decodes it again.
   - The `pcm-live-mib-ready` budget flips to assert, with a mutant.
   - It may split into two rounds.
3. **13c:** library preview through a media element (streaming), so an unplaced source is never decoded just to preview it.
4. **13d:** R314-DEMO-BUFFER-LONGTASK-6X and PERF2-STEREO-COPY (demo buffer creation off the 6× long task).

**Order after this round:**
1. REGRESSION-2026-11-08, at the next planning on or after 2026-11-08.
2. PERF-13b.
3. RETRO 384. It is also the deadline for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING and for PERF-11c-iii-d/e.
4. PERF-13c and PERF-13d, then PERF-14 and PERF-15.
5. SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
6. STEM-LANES, then SYS-1…3, then STORE-2b…5.
7. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
8. The phase-2 entries, under the skip rule.

PERF-12b and PERF-11b go first among the not-started PERF stages as soon as Saba or root answers.

## 7. Claims (L29 + L56)
Run `bash b-round-380/claims-381.sh` from the loop root. HEAD output: `b-round-380/claims-381-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 380 published `9a05c82`; store HEAD |
| K2 | status line count |
| K3 | the `buffersRef` declaration in ArrangementContext (l.798) |
| K4 | `buffersRef` set sites 2, delete/clear sites 0 |
| K5 | the two demo URL sources and their files under `public/` |
| K6 | `DEMO_STEM_DURATION = 16` |
| K7 | `instanceof AudioBuffer` hits in `app/**`, `perf/**`, `e2e/**` = 0 |
| K8 | 3 `res.mem.*` rows in the budgets file |
| K9 | `count` is an exact determinism unit |
| K10 | `readHeapAfterGc`, the ready heap sample and the 3 `addInitScript` calls in the resources spec |
| K11 | the only consumer of the budgets file is the resources spec |
| K12 | protected sha |
| K13 | frozen sha (r381, 1,271 entries) |
| K14 | B's HEAD probe: 6 runs, 124.04 MiB, 9 live; per-buffer seconds |
| K15 | doc 247 free / present; doc 246 l.4 |
| K16 | `In Progress (stage` docs |
| K17 | regression date, lessons lines |
| K18 | every cited artifact exists |
| K19 | perf lib test files (2 at HEAD) |
| K20 | the library `Sounds` listbox has 9 options at both viewports (`b-round-380/probe/lib-count-head-381.json`) |
| K21 | tsconfig target and lib ES2022 |
| K22 | `waitForCollectionReady` exported from `perf/lib/page.ts`; the resources spec ready point is `waitForLibraryReady` only |
| K23 | HEAD resources `problems` arrays are all empty (`b-round-380/probe/head-resources-c380.json`) |
