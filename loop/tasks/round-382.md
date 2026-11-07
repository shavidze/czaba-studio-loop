# Round 382: PERF-13b-i. Decoded audio that no clip uses is released and decoded again on demand

**Planned by:** B, at the round 381 → 382 planning, 2026-11-07 (`b-round-381.md`).

**Decisions** (`backlog.json` v347 → v348, `decisions_log_b`):
- **D-29z1272:** round 381 accepted (C PASS, `browserVerified` true, 0 bugs; gate 381 published `5745526`). PERF-13a is done.
- **D-29z1273:** gate 381 review and the A/C notes are ruled (three Lows deferred; code-reviewer M1 closed by C's evidence; M3 folded into this round).
- **D-29z1274:** PERF-13b is split. 13b-i (this round) adds the cache, eviction, pins and re-decode. 13b-ii adds the known-vs-decoded source state and the preview text, and flips the PCM row to `assert` with a mutant once this round's production value is on file (L58).
- **D-29z1275:** behaviour rulings for this round: what may be evicted, the budget, the pins, Play refused while decoding, and the re-decode failure (§2). This round edits `ArrangementContext` while ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING is still open. That is allowed: the checkpoint is non-blocking, and this is core PERF scope, not a structural refactor. The change is recorded as the tenth echo, SIG-R382-DECODED-CACHE-IN-PROVIDER.

**Why this round.** At ready, `/studio-lab` keeps **124 MiB of decoded audio alive** even though the initial arrangement has no clips (`c-round-381/res-rows.txt`; K20, K23). Nothing ever releases a decoded buffer: `buffersRef` has 2 `set` sites and 0 `delete`/`clear` sites [K3, K4]. Two of the nine sources are decoded MP3 files:
- `demo-hero-music`: 150.37 s, 55.07 MiB;
- `demo-middle-east`: 101.35 s, 37.12 MiB [K24].

Both are fetched again cheaply through the public-preview stem cache [K6, K26]. The perf plan's target is ≤ 60 MB at ready. This round releases decoded audio that no clip uses and decodes it again when a clip, a preview or an export needs it.

**What the user notices:**
- Previewing or placing one of the two MP3 sounds can take a moment longer the first time, because the file is decoded again.
- If Play is pressed while a just-placed MP3 clip is still decoding, Play does not start, and the status line shows the existing text `“<title>” has not loaded yet.` [K9]. Nothing else changes.

**Read first:**
- `lessons.md`: A reads 11, 12, 23, 26, 28, 30, 31, 37, 49, 51 and 58. C also reads 38, 56, 57, 59 and 60.
- Primitives: `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Also `.claude/prompts/new-test.md`.
- `b-round-381/tech-lead-382.md`: the consult this design follows.

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check (a performance round, per the 2026-10-27 rule). The screen budget is also not applicable: nothing persistent is added, and the one visible status reuses an existing string.

## Baseline
- **HEAD and tree:** HEAD is `5745526` (gate 381 published); the store tree is clean [K1, K2].
- **Where buffers live and who reads them** (SWEEP, 9 hits [K5]):
  - declaration at l.798 [K3];
  - set by the collection load after peaks (l.4057), with a resync when a clip uses the source (l.4066) [K10];
  - set by video audio (l.2638);
  - read by `applySchedule` (l.1145), `startLibraryPreview` (l.1555) and the four `renderArrangementWav` calls (l.3722, 3723, 3816, 3820) [K11].
- **Gates:** placement, drag and paste check only `sourceStates[…].status === 'ready'` (l.1747, 1813, 2524). Preview also checks the buffer (l.1556) [K8].
- **Initial selection:** the default selected source is the collection's first source, `demo-middle-east` [K22]. The resources perf spec's "library Add" therefore places middle-east, and both exports render it [K23].
- **`WorkspaceCollection`** (`app/types/arrangement.ts` l.88) has no reload hint today: `canReloadSource` has 0 hits [K7].
- **Harness:** at HEAD, the PCM count guard requires live count = library sources [K21]. This round makes that rule wrong by design, so the guard changes too (§2.5).
- **Tests:**
  - 130 test files name `loadSource`, `sourceNotLoaded` or the "has not loaded yet" text [K12]. The new field is optional and absent means "never evict", so these files keep their behaviour.
  - 10 test files load the real demo collection or the `/studio-lab` route [K13]. They are the **C-DEMO** covering set.
- **Manifests:**
  - Protected: `b-round-318/protected-sha256.txt` [K14].
  - Frozen: `b-round-381/r382-frozen-sha256.txt`, 1,259 entries: every tracked file except the 11 grants and the 10 C-DEMO files [K15].
- **Docs:**
  - Number 248 is free [K16].
  - `In Progress (stage` hits are docs 232, 238, 246 and 247 [K17]. Docs 232, 238 and 246 belong to open stages (PERF-DRAG-PREVIEW, PERF-11c-iii-d/e, PERF-12b). Doc 247 belongs to PERF-13, and stays `stage 1 of 4`, not granted.

## 1. Behaviour that must not change
- **Everything outside `canReloadSource`:** every source whose collection does not return `true` from `canReloadSource` behaves exactly as at HEAD. That covers purchased stems, the 7 synthesized demo sources and video audio: decoded once, never evicted.
- **Export bytes:** identical to HEAD. `res.export.1.bytes` = 29,189,420 and `res.export.2.bytes` = 58,378,796, at 1× and 6× [K23]. The re-decoded middle-east buffer must render the same samples.
- **Asserts:** all 22 assert rows still pass [K25].
- **Waveform, duration and peaks** of an evicted source stay on screen. `sourceStates[id]` stays `ready`, with the same duration.
- **Purchase protection and the auth files:** untouched (the protected sha check).

## 2. What A changes (grants: `b-round-381/grants-382.txt`, 11 paths, plus the conditional fixture grant in §2.7)
1. **`app/lib/arrangement/decoded-buffer-cache.ts` (new), pure and generic over the buffer type, so it can be unit-tested.** It exports:
   - `estimateBufferBytes({ length, numberOfChannels })`: `length × numberOfChannels × 4`.
   - `createDecodedBufferCache<B>({ budgetBytes, estimate })` with these methods:
     - `get`, `has`, `set(id, buffer, { evictable })`, `delete`, `clear`;
     - `setPinned(owner, ids)`: pins are kept per owner (`'clips'`, `'preview'`, `'export'`), and an id is pinned while any owner holds it;
     - `totalBytes()` and `evictableUnpinnedBytes()`;
     - `evict()`: removes the least recently used entries until `evictableUnpinnedBytes() ≤ budgetBytes`, and returns the removed ids. Only entries that are both `evictable` and unpinned can go. `get` and `set` count as a use;
     - `asReadonlyMap()`: one stable `ReadonlyMap` instance for the cache's whole lifetime, never replaced.
   - `UNPINNED_DECODED_BUDGET_BYTES = 32 * 1024 * 1024`. Each demo MP3 is larger than this on its own [K24], so at ready both are evicted whatever order they load in.
2. **`app/types/arrangement.ts`:** `WorkspaceCollection` gains `canReloadSource?: (source: WorkspaceSource) => boolean`. When it is absent, nothing is evictable.
3. **`app/data/studio-lab-demo.ts`:** the demo collection returns `true` only for sources that have a `demoUrls` entry [K6]. The purchased adapter is not changed: its URLs are signed and may expire. It becomes a 13b-ii or SRW-21 question.
4. **`app/contexts/ArrangementContext.tsx`**, following `b-round-381/tech-lead-382.md`:
   - **The cache.**
     - `buffersRef` becomes the cache.
     - Every read site in K5 reads it through the cache. `applySchedule` and `renderArrangementWav` receive `asReadonlyMap()`; both parameters are already typed `ReadonlyMap` [K31], so `graph.client.ts` is not granted and needs no change.
     - The load path (l.4057) calls `set(…, { evictable: collection.canReloadSource?.(source) === true })`.
     - Video audio (l.2638) sets `evictable: false`.
     - After each set, `evict()` runs.
   - **Pins.**
     - **Clips:** `'clips'` pins = the set of `sourceId`s in `history.present.clips`. They are recomputed inside `updateHistory` (l.887 [K30]), and skipped when `next.present.clips` is the same array as the current one. History past and future are never pinned.
     - **Preview:** `'preview'` pins the source being previewed and releases it when the preview ends.
     - **Export:** `'export'` pins every clip source from the start of an export until `renderArrangementWav` settles. It is released in `finally`, including on cancel and on error.
     - After every pin change, `evict()` runs.
   - **Decoding again on demand: `ensureDecoded(ids)`.**
     - **Which ids:** it decodes only ids that are in the collection, have state `ready` and have no cached buffer. Calls for the same id share one decode while it is in flight.
     - **How:** it calls `collection.loadSource` with the collection effect's `AbortController` signal, held in a ref, and checks `aborted` before `set`. It does **not** call `requestSourcePeaks`, because the peaks are kept.
     - **When the decode settles:**
       - `set` the buffer, then run `evict()`. A source unpinned in the meantime is dropped again at once.
       - If `present.clips` still uses the source, call `syncPlayback(present, undefined, true)` (the l.4066 pattern).
       - On failure, patch the source state to `error` with the existing failure text and the existing error path. A clip is never skipped silently while its source says `ready`.
     - **Who triggers it:**
       - a pin change that adds a missing id;
       - preview;
       - export;
       - Play.
   - **Preview.** When the source is `ready` but not cached, `startLibraryPreview` pins it, awaits `ensureDecoded`, and then plays only if that source is still the requested preview. The existing `sourceNotLoaded` branch stays for sources that are really not `ready` (this is ruled in D-29z1275; the new text belongs to 13b-ii).
   - **Export.** Export pins its sources and awaits `ensureDecoded` before it renders. The cancel and error paths behave as at HEAD.
   - **Play.** Play does not start when a clip in `present.clips` has a `ready` source without a cached buffer. That covers every path that starts playback: the five `startGraph(` callers (l.1344, 1512, 1609, 1690, 1710 [K29]) where they begin playback, and the Play, Space and play-from paths. A caller that only reschedules while already playing follows the "already playing" rule below.
     - The status becomes `studioLibraryStrings.sourceNotLoaded(<first such source title>)`, and `isPlaying` stays false. There is no auto-start.
     - **L51 overwrite:** the refusal writes over whatever text the status line shows.
     - **L51 lifetime:** the refusal stays until the next status write. Once the decode settles, the next Play starts normally.
     - **Already playing:** while playback is running, a newly placed clip joins through the resync when its decode settles. Playback never stops for it.
   - **Collection reset.** When the collection effect cleans up, it calls `clear()` on the same Map instance and clears all pins it owns.
5. **`perf/lib/pcm-live.ts` and `perf/lib/pcm-live.test.ts`**, the harness guard, changed because eviction breaks "count = sources" by design:
   - **The count rule becomes a bound,** with a new problem string `pcm live count N outside [P, M]`. Here P = the number of placed clip sources, M = the number of library sources, and N must satisfy P ≤ N ≤ M. It replaces the `≠ M library sources` string [K21]. The probe buffer is excluded as before.
   - **Probe shapes:** the three probes are told apart by shape. The kept probe is 1 frame mono (as now), the dropped probe is 2 frames mono, and the decode probe is 480 frames mono.
   - **New decode liveness guard, independent of the app.** `readPcmLiveAfterGc` first decodes a tiny WAV built in the page (44-byte header + 480 frames of mono 16-bit silence at 48,000 Hz) through an `OfflineAudioContext` whose sample rate is also 48,000 Hz, so that `decodeAudioData` does not resample, and keeps it alive. The reading must contain exactly one live `'decode'` entry with that length, or the problem `pcm registry did not count its decode probe` is reported. It is then excluded from the totals.
   - **New dropped-probe guard (code-reviewer M3, round 381).** A second probe buffer is created and its reference is dropped before GC ×2. If it is still counted as live, the problem `pcm registry kept a dropped probe` is reported.
   - **Unit rows:**
     - **PL1–PL4** stay, with PL3 rewritten for the bound.
     - **PL5:** each new problem string fires alone for its case.
     - **PL6:** a reading with N = P and one with N = M are both valid.
     - **PL7:** both probes are excluded from the totals.
6. **`perf/studio-lab-resources.perf.spec.ts` and `perf/budgets.resources.json`:**
   - **Expected counts:**
     - P = the number of audio clips on the page at the reading (0 at ready);
     - M = the library `Sounds` option count, as now.
   - **New record rows** in the 1× pass:
     - `res.mem.pcm-live-mib-after-add`: live PCM after the first Add has settled. The quiet wait cannot see an off-thread decode, so the spec polls `window.__czabaPcm.read()` (timeout 15 s, a problem string on timeout) until a live `'decode'` entry other than the probe exists, and then does GC ×2 → read;
     - `res.mem.pcm-live-count-after-add`.
   - **Existing record rows:** unchanged in kind and mode. Only the notes of the four `res.mem.pcm-live-*` rows are updated to state the expected ready values (31.9 MiB, 7 live, 0 decode).
   - **No row turns into `assert` this round:** B ran no production sketch (L58). 13b-ii flips them.
   - **GATE381-L1:** fixed here, because this round already owns these lines. The registry is installed only in the record pass.
7. **Conditional fixture grant (L23; B could not pre-apply a behaviour that is not yet written):** the 10 C-DEMO files in `b-round-381/fixture-grants-382.txt` [K13].
   - A may edit them **only** so that their fetch or loader mocks answer a second request for the same URL (re-decode).
   - No assertion may be removed or weakened. The `expect(` count per file must not fall below `b-round-381/fixture-expect-counts-head.txt`.
   - Any other kind of red in those files is a STOP (L11).
8. **`app/lib/arrangement/__tests__/decoded-buffer-cache.test.ts` (new):**
   - **DC1:** LRU order. `get` refreshes an entry.
   - **DC2:** a pinned entry is never evicted. When the last owner unpins it, it is evicted.
   - **DC3:** a non-evictable entry is never evicted, even over the budget.
   - **DC4:** an entry larger than the budget on its own is evicted once it is unpinned.
   - **DC5:** `asReadonlyMap()` returns the same instance after `set`, `delete`, `clear` and `evict`.
   - **DC6:** `estimateBufferBytes` gives mono ×4 and stereo ×8.
   - **DC7:** `setPinned` with an empty list releases only that owner's pins.
9. **`app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx` (new, jsdom, provider with a fake collection: 1 evictable URL-like source of 40 MiB-equivalent length, and 1 non-evictable source).**
   - The rows observe the cache through `vi.mock` of `~/lib/arrangement/decoded-buffer-cache`, wrapping the real factory with spies.
   - No provider prop or test-only export is added to `ArrangementContext`.
   - Each row names its mutant, which A runs, and each mutant must be red:

   | Row | What it checks | Mutant that must be red |
   |---|---|---|
   | **EV1** | After load, the evictable source's buffer is gone, the non-evictable one stays, and both are still `ready` with the same duration | MU-EV-NO-EVICT (`evict()` call at load removed) |
   | **EV2** | Placing the evicted source calls `loadSource` again, exactly once, even when the place gesture repeats while the decode is in flight. After it settles, the buffer is cached | MU-EV-NO-DEDUPE |
   | **EV3** | Play pressed while that decode is in flight: `isPlaying` stays false and the status equals `sourceNotLoaded(title)`. After the decode settles, Play starts | MU-EV-PLAY-NO-REFUSE |
   | **EV4** | Undo of the place, after the decode, evicts the buffer again. Redo re-decodes it | MU-EV-NO-CLIPS-PIN-RECOMPUTE |
   | **EV5** | Export with the evicted source placed awaits its decode, and `renderArrangementWav` receives a map that holds the buffer. After export settles and the clip is undone, the source is evicted again. A cancelled export also releases its pins | MU-EV-EXPORT-NO-AWAIT, MU-EV-EXPORT-PIN-LEAK |
   | **EV6** | A failed re-decode sets the state to `error` and shows the existing failure text | MU-EV-FAIL-SILENT |
   | **EV7** | A collection change clears the cache, and a decode in flight from the old collection never `set`s | MU-EV-NO-ABORT-CHECK |
   | **EV8** | A volume edit that keeps `clips` identity does not recompute pins (spy on the cache's `setPinned`, count 0) | MU-EV-PIN-EVERY-UPDATE |
10. **Doc 248** (`docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md`, new):
    - l.4 is byte for byte `**სტატუსი:** In Progress (stage 1 of 2; C round 382 PASS)`.
    - The TEMPLATE headings appear in order (L26).
    - It records:
      - the eviction rule and the budget arithmetic;
      - the pins;
      - Play refusal;
      - the failure path;
      - the harness guard change;
      - each row and mutant that exists.

## 3. A: checks (speed rules)
- **Static checks:** `npm run typecheck` and `npm run lint`.
- **Tests:**
  - the two new test files;
  - the 10 C-DEMO files;
  - the covering files found by `grep -rlE "buffersRef|startLibraryPreview|renderArrangementWav|canReloadSource" app --include=*.test.*`. Paste the hit list and the results into the report;
  - the perf lib, through `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (3 files, PL1–PL7).
- **No full suite, no browser and no perf run.**
- **Mutants:** A writes `a-round-382/mutants/run-mutants-382.sh` in the `TREE=<copy> OUT=<abs>` style. A runs every EV mutant and these unit harness mutants, and each must be red:
  - MU-13B-BOUND-OFF (the bound always valid) → PL3/PL6;
  - MU-13B-DECODE-PROBE-OFF → PL5.
- **Browser harness mutants, for C:** state the expected problem string for each.
  - MU-13B-NO-DECODE-WRAP (drop the `decodeAudioData` wrap) → `pcm registry did not count its decode probe`;
  - MU-13B-STRONG-REFS (the registry keeps strong refs) → `pcm registry kept a dropped probe`.
- **`code-reviewer`:** required (3+ files). A Medium+ follows L11.
- Write `a-round-382.md` as you go. It includes the code-reviewer's Architecture note.

## 4. C: what to verify
C writes `c-round-382.md` and `c-round-382.json` as it goes, with **all L57 fields**.
- `mutantRedOnSketch` is the string "none: B ran no sketch; the new perf rows are record and the EV/PL mutants are A's".
- `python3 -I tools/l57-check.py c-round-382.json c-round-382/l57-check.txt` must exit 0.
- Write `c-round-382/progress.json` after every row (L59).
- Copies and destructive commands stay under `c-round-382/` (L60).
- Run perf and mutants alone, and warm up first (L38).
- Gate rows go under `"gate"`.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all`. Then `sha256sum -c --quiet` of `b-round-381/r382-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` from `store/` | Every status line is a path in `grants-382.txt` or `fixture-grants-382.txt`. Both checks rc 0 |
| **FIXTURE-ONLY** | For each changed C-DEMO file: the `expect(` count compared with `fixture-expect-counts-head.txt`, and a diff read | The count is not lower, and the diff touches only fetch/loader mocks |
| **CLAIMS** | `bash b-round-381/claims-382.sh`, compared with `b-round-381/claims-382-output.txt` | Differences appear only where A's grants change the line (K2, K3–K5, K7, K8–K11 line shifts, K16, K17 with doc 248 added, K21, K28–K30 line shifts). K31 and K32 must be unchanged. Each difference is explained. No `MISSING` |
| **UNIT** | The two new test files, the C-DEMO files, the perf lib (scratch config) | All pass. DC1–DC7, EV1–EV8 and PL1–PL7 are present by name |
| **MUTANTS-UNIT** | A's runner on a `cp -a` copy, `MODE=unit` | Every EV and PL mutant is red on its named row. `restored` is printed |
| **PERF-RES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, alone (it builds) | 0 FAIL and 0 problems. All 22 asserts PASS. Export bytes are as in §1 at 1× and 6×. Record the new values: `pcm-live-mib-ready` (expected ≈ 31.9), `count-ready` (7), `decode-mib-ready` (0), `after-add` (≈ 69.0, 8), and the after-export delta. **Pre-ruling:** a value that differs from these expectations is not a FAIL if C explains it per buffer from the registry detail. An unexplained difference is a finding |
| **HARNESS-MUTANTS** | `MODE=browser` on a copy, alone | MU-13B-NO-DECODE-WRAP and MU-13B-STRONG-REFS each report A's string in the spec |
| **EVICT-BROWSER** | The dev server, B's probe adapted under `c-round-382/` (`b-round-380/probe/pcm-probe-381.mjs` + steps), at 1440×900 and 1280×720 | (a) At ready, after GC ×2, no live buffer has the 150.37 s or the 101.35 s length (the other holders release it [K32]), the 7 synth buffers are live, and both MP3 waveforms and durations show in the library. (b) Preview middle-east: audio starts (the preview store / Stop button shows playing), and a 101.35 s buffer is live while it plays. After Stop and GC ×2 it is gone. (c) Add middle-east and wait for the decode: a 101.35 s buffer is live. Undo, then GC ×2: it is gone. Redo: it is live again. (d) Screenshots at every step |
| **PLAY-REFUSE-BROWSER** | Both viewports: select hero, Add, and press Space within 50 ms (throttle CPU 6× if needed to catch the window; say which) | If the window was caught: Play did not start, and the status is `“CZABA hero — public preview” has not loaded yet.`. Then Space after the decode starts playback, and the Music lane meter reads > 0 within 500 ms. If the window was never caught in 5 tries, write that as `record`, with the timings |
| **EXPORT-BROWSER** | Both viewports: Add middle-east from a fresh load (evicted), Export WAV at once | The download's sha256 equals the HEAD WAV of the same 1-clip project (`c-round-380`'s E1 if comparable; otherwise the control export at HEAD on a `ctrl-head` copy). The source is evicted again after an Undo plus GC ×2 |
| **G382-AUTH (browser)** | A fresh anonymous context at both viewports, warmed up | `/studio-lab` shows the workspace with `auth_user` null. `/studio/middle-east` shows "Sign in required", with 0 `audio[src]`. `/api/studio-token?product=…&file=…` without a token returns 401 with no token in the body. The fake bearer's 500 goes under `blocked` |
| **DOCS** | Doc 248 | l.4 byte for byte. TEMPLATE headings in order. Every row and mutant it names exists. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |

**`browserVerified`:** true only if PERF-RES ran on the production build, and EVICT-BROWSER, PLAY-REFUSE-BROWSER, EXPORT-BROWSER and G382-AUTH ran at both viewports in this round.

## 5. Neighbour risk
- **Export re-decode during the perf export scenario.** Placing middle-east now triggers a decode. That can move `peak-backing-delta-mib` (asserted ≤ 5) or `longtask-max.6x` (asserted ≤ 100). A red assert is a FAIL, which comes to B for a ruling. It is not loosened in this round.
- **Play refusal.** A user who presses Play very quickly after placing a 150 s MP3 sees "has not loaded yet". This is ruled as the smallest honest behaviour (D-29z1275, tech-lead option ii). Starting playback silently without the clip, or auto-starting it later, is rejected.
- **The purchased Studio** is unchanged, because `canReloadSource` is absent. This is a later stage.
- **Peaks and the waveform** are kept, so the overview, clips and library must look identical. C's screenshots compare them with HEAD.

## 6. Order after this round (D-29z1274)
1. REGRESSION-2026-11-08, at the first planning on or after 2026-11-08.
2. PERF-13b-ii.
3. RETRO 384. It is also the deadline for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING and for PERF-11c-iii-d/e.
4. PERF-13c, then PERF-13d, then PERF-14 and PERF-15.
5. SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
6. STEM-LANES, then SYS-1…3, then STORE-2b…5.
7. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
8. The phase-2 entries, under the skip rule.

PERF-12b and PERF-11b go first among the not-started PERF stages once they are answered.

## 7. Claims (L29 + L56)
Run `bash b-round-381/claims-382.sh` from the loop root. HEAD output: `b-round-381/claims-382-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 381 published `5745526` = store HEAD |
| K2 | status line count (0) |
| K3 | `buffersRef` declaration (l.798) |
| K4 | `buffersRef` set sites 2, delete/clear sites 0 |
| K5 | SWEEP: 9 `buffersRef` hits in `app/**` + `perf/**` (non-test), all in ArrangementContext |
| K6 | demo URL sources, the loader branch and the MP3 file sizes |
| K7 | `WorkspaceCollection` at l.88; `canReloadSource` hits = 0 |
| K8 | `ready` gates (l.1556, 1747, 1813, 2524) |
| K9 | preview buffer guard (l.1555) and the `sourceNotLoaded` text |
| K10 | load path set (l.4057) and the resync (l.4066) |
| K11 | schedule and render consumers |
| K12 | 130 test files name the load or not-loaded path |
| K13 | the 10 C-DEMO files |
| K14 | protected sha rc 0 |
| K15 | frozen sha r382 (1,259 entries) rc 0 |
| K16 | doc 248 free; doc 247 l.4 |
| K17 | `In Progress (stage` docs: 232, 238, 246, 247 |
| K18 | regression date 2026-11-05; lessons 60 lines |
| K19 | every cited artifact exists |
| K20 | the studio-lab initial arrangement has no clips |
| K21 | the PCM guard strings at HEAD |
| K22 | the default selected source is the first source, `demo-middle-east` |
| K23 | C round 381 production rows (PCM 124 / 9 / 92.2 / 0; export bytes; asserted export rows) |
| K24 | per-buffer seconds and MiB at ready (150.37 s = 55.07, 101.35 s = 37.12) |
| K25 | 22 assert rows in the budgets file |
| K26 | `publicPreviewSourceFetch` (stem cache) |
| K27 | 3 perf lib test files |
| K28 | collection load effect dependency line (l.4085) |
| K29 | the five `startGraph(` callers |
| K30 | `updateHistory` declaration (l.887) |
| K31 | `applySchedule` and `renderArrangementWav` already take `ReadonlyMap` |
| K32 | other buffer holders release it: the peaks job `active = null` (4 sites), the preview player (2 sites), and 0 `AudioBuffer` in the stem cache client |
