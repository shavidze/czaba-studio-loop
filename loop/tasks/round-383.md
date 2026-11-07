# Round 383: PERF-13b-i fix. The last decoded MP3 is no longer kept alive by a React updater; collection reset keeps video audio

**Planned by:** B, at the round 382 → 383 planning, 2026-11-07 (`b-round-382.md`).

**Decisions** (`backlog.json` v348 → v349, `decisions_log_b`):
- **D-29z1276:** round 382 is accepted as a C FAIL. Gate 382 was `skipped`, so the baseline stays HEAD `5745526`. The round-382 work stays uncommitted in the tree (11 status lines), and root publishes 382 and 383 together after a C PASS.
- **D-29z1277:** **C-R382-01 is confirmed and diagnosed** by B's heap snapshot (`b-round-382/probe/`).
  - **The holder.** The provider's alternate `FiberNode` keeps a `useState` hook `baseQueue`. Its last update's `action` is the load path's `setSourcePeaks((previous) => …)` updater. That closure's V8 context chain reaches the `.then((buffer) => …)` scope, where `buffer` is context-allocated because the `onPeaks` closure references it [K13, K14].
  - **It is pre-existing.** The same updater exists at HEAD (l.4058 and l.2639 [K4]). It was masked because nothing was ever evicted.
  - **C-R382-02 is reclassified as a test-step issue.** C's `.first()` clicked the **transport** Stop (`aria-label="Stop"`) while the library preview kept playing: 0 `stop()` calls, and the 101.35 s buffer was legitimately pinned. B then clicked the library preview's own Stop: the buffer was released, Add made it live, and Undo released it again [K13]. B does not close the finding. C closes it with row EVICT-B2.
- **D-29z1278:** **ruling on A's STOP (code-reviewer M2).** Option (b): a collection reset deletes exactly the old collection's source ids, through a new cache method `deleteMany(ids)`, and clears the in-flight decode map. Video-audio entries stay. No pin is touched by the reset:
  - `clips` pins are recomputed from history;
  - `preview` and `export` pins are released by their own lifecycles.

  EV7 is reworded accordingly.
- **D-29z1279:** records only, nothing is scheduled:
  - the transport Stop does not stop a library preview. This is HEAD parity: `stopPlayback` has 0 preview references [K11]. It is a candidate question, not a bug.
  - two controls share the accessible name "Stop" (Low, deferred);
  - A's note "an error source is skipped by export and Play" is a ruling candidate for 13b-ii;
  - the code-reviewer's `useDecodedSourceBuffers` proposal becomes the signal SIG-R382-USE-DECODED-SOURCE-BUFFERS, joined to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING.

**Why this round.** At ready, `/studio-lab` still keeps one decoded MP3 alive (the hero, 150.37 s, 55.07 MiB). Live PCM is 86.9 MiB instead of the expected 31.9 MiB, and it misses the perf plan's ≤ 60 MB target (C-R382-01, Medium). The cache releases its own reference correctly (DC4). The buffer is kept alive by a stale React update queue, through a closure that shares its scope with `buffer`.

**What the user notices:** nothing visible. Memory at ready drops by about 55 MiB. All behaviour stays as specified in `tasks/round-382.md` §1–§2.

**Read first:**
- `tasks/round-382.md`: the round-382 contract. It still holds, except where this task amends it.
- `lessons.md`: A reads 11, 12, 23, 26, 28, 30, 31, 49 and 58. C also reads 38, 56, 57, 59 and 60.
- Primitives: `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
- `b-round-382/probe/heap-ready2.json` and `heap-ready3-ctx.json`: the retainer path.

**Not applicable:** reference-first, `product-designer`, the YouTube request and the screen budget (a performance bug round; nothing visible changes).

## Baseline
- **HEAD:** `5745526`, with 11 status lines, which are A's round-382 work [K1, K2].
- **The retaining updaters** [K3, K5]:
  - load path: `requestSourcePeaks(buffer, controller.signal, (peaks) => {` at l.4288, with the updater at l.4296;
  - video audio: `requestSourcePeaks(buffer, signal, (peaks) => {` at l.2835, with the updater at l.2841.

  Both build `setSourcePeaks((previous) => new Map(previous).set(id, peaks))` inside a scope that binds `buffer`.
- **Reset:** `resetDecodedBuffers` at l.4247, which calls `decodedBuffers.clear()` (l.4253) [K6]. The video-audio set is at l.2839, with `evictable: false` [K7].
- **Cache API:** `get/has/set/delete/clear/setPinned/totalBytes/evict/asReadonlyMap` (+ `isPinned`); `deleteMany` has 0 hits [K8].
- **Tests:** EV1–EV9 exist (14 `it`s) [K9].
- **Doc 248, l.4:** `… C round 382 PASS` [K10]. It must change, because round 382 failed.
- **Manifests:**
  - frozen: `b-round-382/r383-frozen-sha256.txt`, 1,275 entries (every tracked and untracked file of the current tree except the 5 grants), rc 0 [K16];
  - protected: `b-round-318/protected-sha256.txt`, rc 0 [K15].

## 1. Behaviour that must not change
- Everything in `tasks/round-382.md` §1:
  - sources without `canReloadSource` are never evicted;
  - export bytes are identical to HEAD: `res.export.1.bytes` 29,189,420 and `res.export.2.bytes` 58,378,796, at 1× and 6×;
  - all 22 asserts pass;
  - the waveform, duration and peaks of an evicted source stay;
  - purchase protection is unchanged.
- **Peaks state:** `sourcePeaks` holds the same entries in the same order of arrival. Source states, status texts and the settle count are unchanged.
- **Unchanged files:** the round-382 files outside the grants (`types`, `studio-lab-demo.ts`, `perf/**`) stay exactly as they are (the frozen manifest).

## 2. What A changes (grants: `b-round-382/grants-383.txt`, 5 paths)
1. **`app/contexts/ArrangementContext.tsx`: no updater closure may be created in a scope that binds an `AudioBuffer`.**
   - Add one component-scope helper, for example `const storeSourcePeaks = useCallback((id: string, peaks: Float32Array) => setSourcePeaks((previous) => new Map(previous).set(id, peaks)), [])`. Its updater captures only `id` and `peaks`.
   - Both `onPeaks` callbacks (load path and video audio) call it instead of building the updater inline.
   - **SWEEP rule (L49):** in every callback that has an `AudioBuffer` in scope, no `set…(` call may receive an inline function. That covers the bodies of `.then((buffer) => …)`, the `onPeaks` callbacks, the `decodeVideoAudio` result handler and `ensureDecoded`.
     - A runs `grep -nE "\(buffer\)|requestSourcePeaks\(buffer|const buffer = " app/contexts/ArrangementContext.tsx` and pastes the hit list.
     - For each hit, A states either "no updater-form setter in scope" or the change made.
     - A does not change logic, order or dependencies beyond this.
2. **`app/lib/arrangement/decoded-buffer-cache.ts`:** add `deleteMany(ids: Iterable<string>)`. It removes those entries and their LRU positions, and never touches pins or other entries.
3. **`ArrangementContext.tsx`, collection reset (D-29z1278):**
   - `resetDecodedBuffers` aborts and clears the in-flight map as now.
   - It calls `decodedBuffers.deleteMany(<the effect's collection.sources ids>)` instead of `clear()`.
   - It calls no `setPinned`.
   - `clear()` stays in the cache API; the provider calls it nowhere.
4. **`app/lib/arrangement/__tests__/decoded-buffer-cache.test.ts`:** **DC8**: `deleteMany` removes only the named ids, keeps pins, and a later `evict()` still respects the remaining entries' LRU order.
5. **`app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx`:**
   - **EV7 reworded:** a collection change calls `deleteMany` with exactly the old collection's ids and never calls `clear`, observed through the existing `vi.mock` spy. An old decode in flight never `set`s (the current assertion is kept).
   - **EV10 (new), the peaks arrival guard.**
     - Two fake sources resolve their peaks in the same tick.
     - Through the provider's context value, `sourcePeaks` then holds one entry per ready source, each with its own peaks array.
     - Mutant **MU-383-NONFUNCTIONAL-PEAKS**: the helper builds the next Map from a captured `sourcePeaks` value instead of `previous`, which must make EV10 red.
     - This row guards the helper's functional update. It is not a retention proof: jsdom cannot see V8 context retention, and HEAP-RETAINERS is the proof.
   - Every other EV row stays green and unchanged.
6. **Doc 248:**
   - l.4 byte for byte: `**სტატუსი:** In Progress (stage 1 of 2; C round 383 PASS)`.
   - Add a "პრობლემები და გადაწყვეტები" entry: Problem (C-R382-01: a stale hook `baseQueue` updater retained the last decoded MP3 through the shared closure context) → Solution (the component-scope `storeSourcePeaks` helper and the SWEEP rule).
   - Amend the reset text to `deleteMany` (D-29z1278), and add DC8, EV10 and the new mutants.
   - The `preview` pin line and the EV9 line say "**the library preview's** Stop" (not the transport Stop).
   - The heading order follows TEMPLATE (L26).

## 3. A: checks (speed rules)
- **Static checks:** `npm run typecheck` and `npm run lint`.
- **Tests:**
  - the two decoded-buffer test files;
  - the covering files from `grep -rlE "decodedBuffers|startLibraryPreview|renderArrangementWav|canReloadSource|setSourcePeaks|sourcePeaks" app --include=*.test.*`. Paste the hit list and the results;
  - the 10 C-DEMO files of `b-round-381/fixture-grants-382.txt`, run only, with **no edits** (they are frozen this round).
- **Mutants:** extend `a-round-382/mutants/run-mutants-382.sh` into `a-round-383/mutants/run-mutants-383.sh`, in the same `TREE=<copy> OUT=<abs> MODE=` style.
  - All round-382 unit mutants must still be red.
  - **MU-383-RESET-CLEAR:** reset calls `clear()` again → EV7 red.
  - **MU-383-DELETE-MANY-ALL:** `deleteMany` clears everything → DC8 red.
  - **MU-383-NONFUNCTIONAL-PEAKS:** see EV10 → EV10 red.
- **Heap mutant for C:** A adds `MODE=heap MUTANT=MU-383-INLINE-PEAKS-UPDATER` to the runner.
  - The mutant restores the inline `setSourcePeaks((previous) => …)` in the load-path `onPeaks`.
  - The runner applies it to `TREE` and prints `applied`. With `RESTORE=1` it undoes the change and prints `restored`.
  - C starts the copy's dev server on a second port (for example 5174) and runs `heap-retainers.mjs <copy-base>`.
  - Expected: the 150.37 s buffer is live at ready, and its path contains `baseQueue`.
- **Required heap self-check.** jsdom cannot see this bug, so A checks it once in the browser before handover:
  - run `node b-round-382/probe/heap-retainers.mjs http://127.0.0.1:5173 <abs>/a-round-383/heap-self.json` once on the dev server;
  - report the live list, the number of `native:AudioBuffer` nodes, and the number of paths that contain `baseQueue`;
  - **STOP (L11):** if any buffer other than the 7 synthetic ones is still live through a path that does not contain `baseQueue`, A pastes that path into the report and does not guess at a second holder.

  This check does not replace C's HEAP-RETAINERS row.
- **No full suite, no perf run.**
- **`code-reviewer`:** required (3+ files). Write `a-round-383.md` as you go, including the Architecture note verbatim.

## 4. C: what to verify
C writes `c-round-383.md` and `c-round-383.json` as it goes, with **all L57 fields**.
- `mutantRedOnSketch`: "none: B ran no sketch; perf rows stay record (13b-ii flips them)".
- `python3 -I tools/l57-check.py c-round-383.json c-round-383/l57-check.txt` must exit 0.
- Write `progress.json` after every row (L59). Copies and destructive commands stay under `c-round-383/` (L60). Run perf and mutants alone, after a warm-up (L38).

**Locator rule:** the library preview button has **no `aria-label`**. Its text toggles `Preview` ↔ `Stop` (`studioLibraryStrings.previewPlay`/`previewStop`, strings.ts l.867–868 [K18]). The transport Stop has `aria-label="Stop"` and title `Stop (Space)`. C records the `outerHTML` (first 120 chars) of every Stop it clicks.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At start and end: `git status --short --untracked-files=all`; then `sha256sum -c --quiet b-round-382/r383-frozen-sha256.txt` and the protected manifest, from `store/` | The status lines are the 11 round-382 lines (+ none new outside `grants-383.txt`); both checks rc 0 |
| **CLAIMS** | `bash b-round-382/claims-383.sh`, compared with `claims-383-output.txt` | Differences only where the grants change lines (K3 updater sites gone or moved into the helper, K5/K6/K7 line shifts, K8 `deleteMany` present, K9 rows with DC8/EV10, K10 l.4). No `MISSING`. Each difference explained |
| **SWEEP** | Read A's grep list and every hit in the source | No updater-form `set…(` inside a scope that binds an `AudioBuffer`. Both `onPeaks` sites call the helper |
| **UNIT** | The two test files, the covering hits, the 10 C-DEMO files, and the perf lib (scratch config `b-round-334/vitest.perf-lib.config.mjs`) | All pass. DC1–DC8 and EV1–EV10 present by name. C-DEMO files unchanged (sha) |
| **MUTANTS-UNIT** | A's runner on a `cp -a` copy, `MODE=unit` | Every round-382 mutant plus MU-383-RESET-CLEAR, MU-383-DELETE-MANY-ALL and MU-383-NONFUNCTIONAL-PEAKS red on the named row. `restored` printed |
| **HEAP-RETAINERS** | B's probe `b-round-382/probe/heap-retainers.mjs`, copied to `c-round-383/`, on the dev server and on the production build, at 1440×900 (and the live list only at 1280×720) | At ready after GC ×2, the hard criteria are: live = exactly `[2,5,16,16,16,16,16]` s (7 buffers, about 31.9 MiB), and 0 `native:AudioBuffer` paths contain `baseQueue`. How many paths pass through `decodedBuffers` is recorded for information only, because the BFS shortest path can change |
| **HEAP-MUTANT** | A's runner `MODE=heap MUTANT=MU-383-INLINE-PEAKS-UPDATER` on a `cp -a` copy; the copy's dev server on a second port; `heap-retainers.mjs <copy-base>`; then `RESTORE=1` | The 150.37 s buffer is live at ready, and its path contains `baseQueue` (red). Restored afterwards |
| **PERF-RES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, alone (it builds) | 0 FAIL and 0 problems; 22/22 asserts; export bytes as §1 at 1× and 6×. **Record:** `pcm-live-mib-ready` ≈ 31.9, `count-ready` 7, `decode-mib-ready` 0, `after-add` ≈ 69.0 / 8, after-export delta ≈ +37.1. A difference that is not explained per buffer is a finding |
| **EVICT-BROWSER** | `c-round-382/evict.mjs`, adapted, at both viewports | (a) At ready no 150.37 s or 101.35 s buffer is live. (c) Add middle-east → live; Undo + GC ×2 → gone; Redo → live. Screenshots |
| **EVICT-B2** (closes or keeps C-R382-02) | Both viewports: Preview middle-east; while it plays, a 101.35 s buffer is live. Click the **library preview** Stop (locator rule); GC ×2. Then Add, wait for the decode, Undo, GC ×2 | After the library Stop: at least one `stop()` call is recorded on the 101.35 s source, and no 101.35 s buffer is live. After Add, it is live; after Undo, gone. **Record separately:** the same steps with the **transport** Stop (the preview keeps playing, as at HEAD), as an observation |
| **PLAY-REFUSE-BROWSER** | Quick re-check, one viewport (1440×900), CPU 6× | As round 382: the refusal text is exact if the window is caught, and the second Space starts the hero |
| **EXPORT-BROWSER** | One viewport (1440×900) | WAV sha256 = `5fadd97a…8202` (c-round-382 `exp.json`); evicted after Undo + GC ×2 |
| **RESET-UNREACHABLE** | Read only: `studioLabDemoCollection` is a module constant, and `createPurchasedWorkspaceCollection` has 0 route callers | Recorded as "not browser-reachable; covered by EV7 + MU-383-RESET-CLEAR". Not a FAIL |
| **G383-AUTH (browser)** | Fresh anonymous context, both viewports | As G382-AUTH: `/studio-lab` workspace with `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; token API 401 without a token. The fake bearer goes under `blocked` |
| **DOCS** | Doc 248 | l.4 byte for byte; TEMPLATE headings in order; the C-R382-01 Problem → Solution entry; reset = `deleteMany`; "library preview's Stop"; every DC/EV/MU it names exists; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 hits |

**`browserVerified`:** true only if HEAP-RETAINERS (dev + prod), HEAP-MUTANT, PERF-RES (prod), EVICT-BROWSER and EVICT-B2 (both viewports), PLAY-REFUSE, EXPORT and G383-AUTH all ran in this round.

## 5. Neighbour risk
- **Peaks arrival.** The helper must keep the functional-update form. A plain `setSourcePeaks(new Map(sourcePeaks)…)` would lose concurrent arrivals; EV10 and the waveform screenshots guard this.
- **Video audio.** The same helper is used, but video audio is never evicted, so its memory does not change. The video peaks still render (existing video tests in the covering set).
- **Collection reset.** It now keeps video entries. A stale entry of a removed collection id cannot remain, because `deleteMany` removes exactly the old ids.
- **No change to:** the export, Play refusal or preview paths. If a covering test goes red there, A stops (L11).

## 6. Order after this round
1. REGRESSION-2026-11-08, at the first planning on or after 2026-11-08.
2. PERF-13b-ii.
3. RETRO 384, which is also the deadline for ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING and PERF-11c-iii-d/e.
4. PERF-13c, PERF-13d, PERF-14 and PERF-15.
5. SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
6. STEM-LANES, then SYS-1…3, then STORE-2b…5.
7. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
8. The phase-2 entries, under the skip rule.

## 7. Claims
Run `bash b-round-382/claims-383.sh` from the loop root. The output at planning is in `b-round-382/claims-383-output.txt` (0 `MISSING`).

| Tag | Claim |
|---|---|
| K1 | gate 382 `skipped` (C FAIL); HEAD `5745526` |
| K2 | 11 status lines (round-382 work) |
| K3 | updater-form `setSourcePeaks` at l.2841 and l.4296 |
| K4 | the same updaters at HEAD (l.2639, l.4058) |
| K5 | `onPeaks` sites l.2835 and l.4288 |
| K6 | `resetDecodedBuffers` l.4247, `clear()` l.4253 |
| K7 | video audio `evictable: false` l.2839 |
| K8 | cache API; `deleteMany` 0 hits |
| K9 | EV rows (EV1–EV9, 14 `it`s) |
| K10 | doc 248 l.4 and its Stop lines |
| K11 | `stopPlayback` has 0 preview references, in the tree and at HEAD |
| K12 | B's heap evidence files exist |
| K13 | heap numbers: 8 native buffers, 7 via the cache, 1 via `baseQueue`; transport Stop: 0 stops and 101.35 s live; library Stop: released, live after Add, released after Undo |
| K14 | context vars on the retainer path: `buffer`, `peaks` |
| K15 | protected rc 0 |
| K16 | frozen r383 1,275 entries, rc 0 |
| K17 | regression date 2026-11-05; lessons 60 lines |
| K18 | library preview strings `Preview`/`Stop` |
