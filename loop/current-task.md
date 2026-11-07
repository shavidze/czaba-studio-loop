# Round 396: PERF-13c-ii-b (stage 3 of 3). Purchased previews stream too; the harness proves a preview decodes nothing

**Planned by:** B, at the round 395 → 396 planning, 2026-11-07 (`b-round-395.md`).
**Decisions:** D-29z1351 … D-29z1354 (`backlog.json` v363, `decisions_log_b`).
**Type:** final stage of PERF-13c (performance). No new screen element and no new behaviour a user must learn. Purchased-collection behaviour changes, but no route mounts that collection yet (SRW-21 is `deferred_user`).

**Read first:**
- `lessons.md` in full. Most relevant here: L11, L23, L26, L28, L29, L31, L36, L38, L56, L57, L58, L59.
- This file. `tasks/round-395.md` and `tasks/round-394.md` hold the stage-2 contract (PS16–PS26, R1–R7). Open them only to look up a row.
- **Claims:** `b-round-395/claims-396.sh`, run from the loop root.
  - Planning output: `b-round-395/claims-396-planning-output.txt`.
  - Output on B's sketch: `b-round-395/claims-396-on-sketch.txt`.
  - A runs the claims before editing. C runs them at SOURCE-SCOPE start (must equal the planning output) and at the end (only the §7 facts may differ).

## Baseline: `cf81dff`, clean tree
- Gate 395 is `published`, commit `cf81dff` on both remotes [K1]. HEAD is `cf81dff` with 0 modified files [K2].
- Protected files: 11/11 [K3]. Frozen manifest `b-round-395/r396-frozen-sha256.txt`: 1279 entries, 0 failures [K4]. It covers every tracked file except the 8 grants.
- Grants: `b-round-395/grants-396.txt` (§4).

## 0. Why this round
- C round 395 PASS, `browserVerified` true, 0 bugs [K7]. Gate 395 published it. PERF-13c-ii-a is done, and its Mediums are closed (D-29z1351).
- **No open C bug.** Every open Critical/High/Medium is manual-only, `awaiting_user` or `open_root` (2026-10-23 rule), apart from TL-B395-SKETCH-M2-CROSSORIGIN, which this round fixes.
- Regression is not due: the last one was 2026-11-07, round 390 [K5]; the next is due on or after 2026-11-10. RETRO is at round 400.
- PERF-13c-ii-b is the last stage of PERF-13c. It is the next dependency-ordered item in STUDIO-PERFORMANCE.

## 1. Rulings (B)

### D-29z1352: scope of 13c-ii-b
1. **Purchased adapter `previewUrl`.**
   - `createPurchasedWorkspaceCollection` returns `previewUrl: (source) => stemUrls.get(source.id) ?? null`, reading the Map that `loadSource` already uses [K8].
   - The provider then streams a purchased stem exactly as it streams a demo URL. This needs no provider change: the provider already calls `collection.previewUrl?.(source)` [K10].
2. **Seek key stays the URL (A-R393-REVIEW-L6 closed by this ruling).**
   - The Map is built once, so `previewUrl` returns the identical string for a source for the collection's lifetime (PV2). The player's same-URL test [K9 `same-url`] is therefore a stable key.
   - A future signed-URL refresh must build a new collection object. That object also resets the fallback (item 3), so URL equality fails safe.
   - `ArrangementContext.tsx` is not touched.
3. **Fallback lifetime = the collection object (GATE393-L4).**
   - No timer. The remembered "stream failed → decode" set is scoped to the collection object [K10 `fallback-scoped`]. A new collection streams the same source again.
   - Row PS27 pins this.
4. **No cache warm (SIG-R393-PREVIEW-NO-CACHE-WARM, ruled).**
   - The stream branch writes no decoded cache, no pin and no stem cache [K10 `cache-in-stream-branch` 0; PS6, PS27].
   - A stall or abort fallback goes through the ordinary decode path, unchanged. Purchased sources behave the same.
5. **`crossOrigin = 'anonymous'` on the stream element (TL-B395-SKETCH-M2-CROSSORIGIN, Medium, found on B's sketch by `tech-lead`).**
   - Without it, the media element requests the URL in no-cors mode with credentials, unlike the decode fetch (`credentials: 'omit'`). This matters for the first time now, because the purchased adapter hands it signed stem URLs.
   - Placement: `element.crossOrigin = 'anonymous';` is set right after `createAudioElement()` in `playLibraryPreviewStream`, before `src`.
   - For same-origin demo URLs nothing changes. B's browser probe shows the stream playing (`b-round-395/probe/rows-R8.json` [K20]), and C's round-395 stall rows give the same values on the sketch.
6. **Purchased browser half: BLOCKED "no mount point: SRW-21 deferred_user".**
   - L36 was tried, and there is nothing to stub. `createPurchasedWorkspaceCollection` has 0 callers outside tests in `app/**`, `perf/**` and `e2e/**` [K14 lists only its own file]. No route or page builds it; the purchased route mount is SRW-21, deferred by the user.
   - Unit rows PV1/PV2 and the provider rows PS6–PS14 (they run against any `previewUrl`) carry it.
   - Under the cloud rule, this row does not make `browserVerified` false: SRW-21 counts as deferred.
7. **Perf harness rows, asserted (L58).**
   - A 1×-only step `a2` follows "pcm ready" in `perf/studio-lab-resources.perf.spec.ts`. It clicks the library Preview toggle on the default selection (Middle East [K16]) and waits until a media element plays at ≥ 1 s (15 s).
   - It then reads live PCM after GC ×2, stops the preview and waits for the `Preview` label. It wraps `HTMLMediaElement.prototype.play` in the page and restores it in a `finally`.
   - Three rows, all `assert`:
     - `res.harness.preview-stream-playing` ≥ 1: the liveness guard, so a stall cannot pass the memory rows;
     - `res.mem.pcm-live-preview-delta-mib` ≤ 0;
     - `res.mem.pcm-live-preview-decode-count` ≤ 0.
   - B's production sketch gave 1 / 0 / 0. The fix-removed mutant MU-396-DEMO-NO-STREAM (demo `previewUrl` → `null`) gave 0 / 37.1 / 1, red on all three [K18].
   - Every other assert, `res.mem.pcm-*` and `res.harness.*` row equals C's round-395 run, except `res.harness.mem-polls-1.6x` (18 → 20, a poll count; its assert passes). Record rows outside those groups were not compared.

### D-29z1353 / D-29z1354: Lows in this round
- **A-R395-REVIEW-L2-THROW-WHILE-ARMED:** row PS28 (the test file is owned).
- **B-R395-DOC248-STATUS:** doc 248 l.4 is granted (L28: PERF-13b-ii passed C round 392, but doc 248 still says `In Progress (stage 1 of 2; C round 384 PASS)` [K13]).
- **Deferred, not this round:** A-R395-REVIEW-L1-SEEK-REENTRANT, GATE395-L1-CURRENTTIME-READ, GATE395-L3-IOS-PAUSE-INTERRUPTION, B-R395-PURCHASED-DUP-URL, B-R395-PERF-RESTORE-CATCH. A changes no line for them.

### Side effects of the code this round touches (L49)
| Effect | Ruling |
|---|---|
| Purchased Preview of a ready, evicted stem: before the change it decoded; now it streams | Intended. No route mounts it today (§1.6) |
| `crossOrigin` set before `src` on every stream element, demo included | Kept. Same-origin demo unaffected (R8, R1b, R1–R7 rows) |
| A cross-origin asset host must now send CORS headers for the stream | Accepted. The decode fetch already needs them; a missing header becomes a stream error and then the decode fallback, which fails the same way it fails today |
| The perf step creates the AudioContext at preview time in 1× passes | No budgeted row moves (sketch run) |
| Stage-2 rows PS16–PS26 | Unchanged and green; no assert removed |

### Ruling lines (L4)
- **Seek vs URL refresh:** the seek key is the URL. A refresh requires a new collection object.
- **Fallback memory:** it lives with the collection object; there is no timer.
- **Status line:** this round writes none.

## 2. Reference
- This is a performance round, so the policy exempts it from the full reference section and the `product-designer` consult.
- **Alignment with Live 12:** manual ch. 5, browser preview. A preview plays the file without loading it into the Set; when it cannot play, it stops. CZABA: a preview streams and decodes nothing. Status: "consistent in direction", `not applicable / perf`.
- **Screen budget (L39):** nothing new is visible.

## 3. What A changes
Apply `b-round-395/sketch-396.patch.txt` (sha256 `91c5d73012eeb0b4…` [K19]; `git apply --check` passes on the tree). It covers 6 paths: the code, the tests and the perf files. The docs are A's.

1. **`app/lib/arrangement/collection.ts`:** the `previewUrl` line (§1.1) only.
2. **`app/lib/arrangement/preview.client.ts`:** the `crossOrigin` line (§1.5) only.
3. **`app/lib/arrangement/__tests__/collection.test.ts`:** a new describe `PERF-13c-ii-b purchased adapter previewUrl (D-29z1352)` with PV1 and PV2, appended. PC1–PC10 and CR1–CR4 are unchanged.
4. **`app/lib/arrangement/__tests__/library-preview-stream.test.tsx`:**
   - PS27 is appended to the `PERF-13c-i library preview of a URL source streams without decoding` describe.
   - PS28 and PS29 are appended to the `PERF-13c-ii-a stream lifecycle robustness` describe.
   - PS1–PS26 are unchanged.
5. **`perf/studio-lab-resources.perf.spec.ts`:** step `a2`, the sequence line, `measurePreviewStream` / `runPreviewStream`, the `classifyPcmProbe` import and the `previewStreamTimeoutMs` constant.
6. **`perf/budgets.resources.json`:** the three rows of §1.7, inserted after `res.mem.pcm-live-decode-mib-ready`. Every other row is byte-identical.
7. **`docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`** (the whole doc is granted, L34):
   - l.1 range becomes `(rounds 393–396)`.
   - l.4 becomes, byte-exact: `**სტატუსი:** Completed (C round 396 PASS)`.
   - The changed-project line also names `collection.ts` and the two perf files.
   - Stage 3 (Georgian, under the existing 7 TEMPLATE headings; **no new `## ` heading**) records:
     - the five rulings of §1 and why;
     - the purchased half BLOCKED and its reason;
     - the perf rows, with B's sketch numbers and their file `b-round-395/perf-sketch.log`;
     - the mutant MU-396-DEMO-NO-STREAM;
     - PV1, PV2, PS27–PS29 and the unit mutants of §5.
   - The TODO stage-3 bullet becomes done. Its "ყოველ გამოძახებაზე ახალი signed URL" premise is corrected by ruling §1.2.
   - The TODO keeps the progress-trickle gap and the SRW-21-PLAN rows. It adds the architecture checkpoint (ARCH-CHECKPOINT-PREVIEW-AFTER-13C) and the memoise-adapter note (TL-B395-SRW21-MEMO-ADAPTER).
   - Cite only ids that exist (L26).
8. **`docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md`:** l.4 only, byte-exact `**სტატუსი:** Completed (C round 392 PASS)`.

**B's sketch evidence:**
- `tsc` rc 0, scoped Biome rc 0 (`b-round-395/sketch-tsc.log`, `sketch-biome.log`).
- Full suite on the sketch: 258 files, 3832 tests, rc 0 (`precheck-full.log`).
- Covering set: 19 files, 314 tests, rc 0 (`precheck-covering.log`) [K21].
- Unit mutants 7/7 red, pristine rc 0 [K17]. Perf sketch and perf mutant as in §1.7 [K18].
- `tech-lead` reviewed the sketch twice, and the reviewed sha equals the dispatched one (`b-round-395/sketch-review.md`).

**No `as`, `any` or `@ts-ignore`.** A deviation from §1's semantics is a STOP (L11).

**Forbidden:**
- every path outside the grants, in particular `ArrangementContext.tsx` (K10 must stay equal), `studio-lab-demo.ts`, `types/arrangement.ts`, `strings.ts`, `perf/lib/**` and the other budgets files;
- the global forbidden files and actions, the protected files and `package.json`;
- commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-395/grants-396.txt`)
- `app/lib/arrangement/collection.ts`
- `app/lib/arrangement/preview.client.ts`
- `app/lib/arrangement/__tests__/collection.test.ts`
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx`
- `perf/studio-lab-resources.perf.spec.ts`
- `perf/budgets.resources.json`
- `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`
- `docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md` (l.4 only)

## 5. A: tests
Row ids are binding. Each row names the mutant that must turn it red. A runs the unit mutants on a scratch copy outside `store/` with B's runner: `python3 -I b-round-395/mutants/run.py <scratch-root> a-round-396/mutants` (the second argument is the output folder; never omit it, or the run overwrites B's evidence). B's result is `b-round-395/mutants/summary.txt`.

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **PV1** | Purchased collection of 4 stems | `previewUrl` is a function; per sorted source it returns that stem's URL (lead, drums, bass, pad); an unknown source returns `null`; `fetchAudio` is never called | MU-396-PURCHASED-NO-PREVIEW, MU-396-UNKNOWN-NOT-NULL |
| **PV2** | Read drums' URL; mutate the input stem's `audioUrl`; read again | Both reads equal `SECRET_URL` (stable; input changes do not reach it) | MU-396-PREVIEW-LIVE-INPUT, MU-396-PURCHASED-NO-PREVIEW |
| **PS27** | Provider: stream error → decode fallback (remembered: the second Preview decodes, 1 element); re-render with a new collection object; settle its load; Preview | A second element streams `BIG_URL`; 0 pending decodes; load count unchanged; preview id `big` | MU-396-FALLBACK-ANY-COLLECTION (provider condition without the collection check) |
| **PS28** | Player: stream at 3 (armed, no `playing`); `currentTime` setter throws; same-URL seek to 50 | No throw; `onError(3)` once; 0 pending timers; no `src`; offset `null` | MU-394-SYNC-THROW-SEEK, MU-394-STALL-SURVIVES-STOP |
| **PS29** | Player: stream | Element attribute `crossorigin` = `anonymous`; `src` = the URL | MU-396-NO-CROSSORIGIN |

All rows PS1–PS26 stay green. No assert is removed or weakened.

**Collision rows (L23):**
- The covering set is `b-round-395/covering-files.txt` (19 files): the round-393 set plus `collection.test.ts`, `collection-load-status.test.tsx`, `purchased-collection-ui.test.tsx`, `source-fetch.test.ts` and `label-status-colour-ui.test.tsx` (every test file that imports `collection.ts`).
- **Timeout headroom (L31):** the slowest covering test is LRS4 at about 2.0 s, under a 15 s describe timeout [K21]. The new rows take milliseconds.
- The perf spec is typechecked (`npm run typecheck` includes `perf/**`). Biome ignores `perf/**` (L30), so no Biome row for it.

**A also runs:**
- `npm run typecheck`, `npm run lint`, and scoped `npx biome check` on the 4 `app/**` paths;
- `npx vitest run` on the covering set;
- the claims script at start and end;
- the `code-reviewer` (8 files changed).

A reviewer Medium whose fix falls outside §1 is a STOP (L11). A does not run the full suite, `verify`, the build, the perf spec or a browser.

**A's report, `a-round-396.md`:** the changed lines; each command with its rc and a log path under `a-round-396/`; the mutant logs; any deviation from the sketch; the reviewer's notes (Architecture notes go to B as signals).

## 6. C: browser rows
Run at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`, with a fresh context per row.
- **Probes:** use `b-round-395/probe/rows.mjs`. Copy it into `c-round-396/`, set `OUT`, set `base` back to `'http://127.0.0.1:5173'` and change both `lib.mjs` imports (in `rows.mjs` and the copied `warm.mjs`) from `'../../c-round-382/lib.mjs'` to `'../c-round-382/lib.mjs'`. It is C's round-395 script plus row `R8_crossOrigin`. Use `c-round-395/warm.mjs`. Warm the server in a browser before any timed row (L38).
- B's run on the sketch server: `b-round-395/probe/rows-*.json`.
- `preview.client.ts` changed, so the stage-2 rows run again.

| Row | Steps | PASS when |
|---|---|---|
| **PERF-RES** (run alone, first) | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`; results to `c-round-396/perf-results/` | **Assert:** `res.harness.preview-stream-playing` median ≥ 1; `res.mem.pcm-live-preview-delta-mib` ≤ 0; `res.mem.pcm-live-preview-decode-count` ≤ 0. The spec's `failures` are empty. `res.mem.pcm-live-mib-ready` ≤ 60 and `res.mem.pcm-live-decode-mib-ready` ≤ 0 as before. **Record:** every `res.mem.pcm-*` median next to C round 395 (`c-round-395/perf-results/latest-resources.json`) and B's sketch (`b-round-395/perf-sketch-latest-resources.json`) |
| **R8 CROSSORIGIN** | Select Middle East; Preview; wait 4 s | The element's `crossOrigin` is `anonymous`; it is playing (`paused` false, time ≥ 1 s; sketch 3.95 s); 0 decodes; 0 buffer starts; toggle `Stop` (sketch [K20]) |
| **R1b SEEK-DURING-STALL** | as round 395 | as round 395: fallback; 1 decode and 1 start of 101.35 s; click → start 7.5–11 s (sketch 8291/8287 ms [K20]) |
| **R1 STALL-FALLBACK**, **R2 EXTERNAL-PAUSE**, **R3 NORMAL-20S**, **R4 END**, **R5 ABORT**, **R6 STOP**, **R7 PLAY-STOPS-PREVIEW** | as round 395 | as round 395 (`c-round-395.md`); R3 still 0 decodes and 0 starts with the element playing at about 14.9 s |
| **PURCHASED-PREVIEW-BROWSER** | — | **BLOCKED** "no mount point: SRW-21 deferred_user". C re-runs K14 (0 non-test callers) as the evidence. List it under `blocked`. It does not set `browserVerified` false (§1.6) |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo; `/studio/<premium handle>` shows sign-in with no workspace; `/api/studio-token` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | Claims at start and end; `git status`; `sha256sum -c` on `b-round-395/r396-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | Start equals the planning output. End: only the 8 grants modified; K4 0 failures; K3 11; K10 unchanged; only the §7 facts differ |
| **DOCS** | Read doc 252 and doc 248 | Doc 252: Georgian; the 7 TEMPLATE headings in order, none added; l.4 exact as in §3; title range `(rounds 393–396)`; the five §1 rulings present; every cited row and mutant id exists; cited files exist. Doc 248: only l.4 differs from `cf81dff` (`git diff` shows 1 line). `grep -rln 'In Progress (stage' docs/implementation` gives 4 files. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- **jsdom-only note** (not in `passed`/`blocked`, no effect on `browserVerified`): PV1, PV2, PS27, PS28 (a browser cannot force a setter throw), relying on A's `a-round-396/mutants/summary.txt`.
- **Ableton:** "consistent in direction", status `not applicable / perf`.
- **All L57 fields in `c-round-396.json`:**
  - `manifestPaths` = `b-round-395/r396-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`;
  - `missingPaths`, `countMismatches`, `claimCheckMinutes`;
  - an `origin` per finding;
  - `assertsSpecified`, `mutantsRecorded`;
  - `mutantRedOnSketch` = `b-round-395/mutants/summary.txt`;
  - `mutantRedOnTree`;
  - `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-395/precheck-full.log`, `precheck-covering.log`);
  - `chainHeadGateRunGreen` (gate 395 published `cf81dff`);
  - `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-395/perf-sketch.log`, `b-round-395/mutants/perf-MU-396-DEMO-NO-STREAM.log`, `b-round-395/probe/rows-R8.json`, `rows-R1b.json`, `rows-R1.json`, `rows-R2.json`, `rows-R3.json`, `rows-R6.json`);
  - `progressFile`, `stopSignal`.
- **Before hand-off:** run `tools/l57-check.py`. Run the heaviest rows first: PERF-RES (alone), then R1b, R1, R3. Write `c-round-396/progress.json` after each row (L59).

## 7. Claims that may change during the round
Taken from `diff b-round-395/claims-396-planning-output.txt b-round-395/claims-396-on-sketch.txt`, plus the docs:
- **K2:** `cf81dff 0` → `cf81dff 8`.
- **K8:** `preview-url` 0 → 1.
- **K9:** `cross-origin` 0 → 1. Everything else in K9 unchanged.
- **K11:** `collection-PV` 0 → 2; `stream` 25 → 28; `last` PS26 → PS29; `PS27`/`PS28`/`PS29` 0 → 1.
- **K12:** `spec-rows` 0 → 3; `restore` 0 → 4; `budgets-rows` 0 → 3; `budgets-total` 67 → 70.
- **K13:** doc252 l.4 → the §3 string; l.1 → `(rounds 393–396)`; `headings` 7; doc248 l.4 → `**სტატუსი:** Completed (C round 392 PASS)`; `in-progress-docs` 6 → 4.
- **K15:** adds `app/lib/arrangement/collection.ts`.
- **K19:** `applies-to-tree` yes → no.

Every other fact must equal the planning output, including K10 (the provider) and K14.

## 8. Out of scope (recorded, not dropped)
- **Architecture checkpoint (due when this round passes):** `b-round-393/root-request-arch-checkpoint-preview.md` (ARCH-CHECKPOINT-PREVIEW-AFTER-13C, together with ARCH-CHECKPOINT-DECODE-REGION). New signals: GATE395-ARCH-STREAM-FACTORY and A-R394-ARCH-STREAM-WATCHDOG-UNIT. Root runs it; it does not block the next PERF stage.
- **Deferred Lows** (§1): A-R394-REVIEW-L3, A-R395-REVIEW-L1, GATE395-L1, GATE395-L3, B-R395-PURCHASED-DUP-URL, B-R395-PERF-RESTORE-CATCH.
- **SRW-21-PLAN input:** TL-B395-SRW21-MEMO-ADAPTER.
- **Next:** PERF-13d → PERF-14 → PERF-15 (PERF-12b and PERF-11c-iii-d/e are `awaiting_user`). The regression round is due at the first planning on or after 2026-11-10. RETRO is at round 400.
