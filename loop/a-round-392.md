# A round 392: PERF-13b-ii re-dispatch (D-29z1331 settle rule, D-29z1332 null owner, C-R391-01)

No STOP. Every item in task §3 is implemented. One reviewer **Medium** comes to B as a finding (§5, `A-R392-REVIEW-M1`). It cannot be reached in production. Fixing it would extend B's ruling, so A did not change the code for it.

## 1. Changed files (all within `b-round-391/grants-392.txt`)
- `app/contexts/ArrangementContext.tsx` (on top of A's round-391 work, which was not reverted):
  - **Helper.** A module-level, non-exported `decideDecodeSettle(awaiting, sourceStates, signal)` returns `failed{sourceId} | ready | none`. It checks failure first: the first awaited id whose status is `'error'`. Then it returns `ready` if `!signal.aborted`, otherwise `none`.
  - **`startPlaybackAt`, refusal branch.**
    - The owner is read at call time with the exact two lines `ensureDecoded` uses.
    - Null owner → `setStatus(sourceNotLoaded(title))` and return: no `ensureDecoded` and no loading text.
    - Otherwise the loading text is written, then `ensureDecoded`. Its `.then` does one of: failed → `sourceFailed` (unconditional); ready → the conditional swap to `sourceReady`; none → no write.
  - **`startLibraryPreview`, ready-but-not-cached branch.**
    - `stopLibraryPreview()` runs first, as before.
    - Then the owner is read. Null → `sourceNotLoaded(source.title)` and return. This happens before `ensureAudioContext`, with no `previewRequestRef` and no preview pin.
    - Otherwise the same settle rule as Play. After it come the unchanged supersession gate and the cache-based start or `releasePreviewPin`.
  - **Deleted:** `awaiting.every((id) => decodedBuffers.has(id))` and `} else if (decodedBuffers.has(sourceId)) {` (K10 `0 0`).
  - **Dependency arrays.**
    - `startPlaybackAt`: `collection.sources` → `collection`, and **`decodedBuffers` removed**. **This deviates from the task text** ("no other dependency change"). `decodedBuffers` is no longer referenced in that callback; round 391 had added it only for the deleted `every(has)`. Removing it restores the pre-391 array, and Biome accepts the result.
    - `startLibraryPreview`: `collection.sources` → `collection`.
  - `ensureDecoded`'s body, the cache, the pins, the collection effect, `prepareExportSources` and the Play warning are untouched.
- `app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx`: 31 → 35 rows.
  - **EV9 superseded, rewritten.** `statusBefore` / `toBe(statusBefore)` are replaced by `toBe(sourceReady(BIG_TITLE))` and `not.toBe(sourceDecoding(BIG_TITLE))`. The row also checks that the loading text appears before the supersede. It keeps `not.toBe(sourceNotLoaded)`, the preview = `keep` check and the cache-not-kept check. No assertion was dropped.
  - **Added:**
    - EV9 stop (`EV9: a preview stopped before its decode settles…`);
    - EV23;
    - EV24, with a test-local `vi.mock` of `~/lib/arrangement/mp3-encoder.client` (an `encode` stub) that applies to the whole file; only `exportMp3` loads that module;
    - EV25.
  - **EV12, extended.** It now records every status, asserts the final `sourceNotLoaded(BIG_TITLE)`, asserts that `sourceDecoding` never appears, asserts no `['preview',['big']]` pin call, and asserts preview = null. The old assertions are kept.
- `docs/implementation/2026/quarter-IV/251-perf-decode-status-and-failed-sources.md` (new). It is in Georgian, follows TEMPLATE's 7 headings in order, and l.4 reads `**სტატუსი:** Completed (C round 392 PASS)` (the doc 250 format). Every EV id it cites exists in the test file (checked by grep: EV3, EV9, EV12, EV16–EV25).
- `perf/budgets.resources.json`, `strings.ts`, `strings.test.ts`: no change this round (round-391 state).

## 2. Commands (from `store/`; logs in `a-round-392/`)
| Command | rc | Log |
|---|---|---|
| `claims-392.sh` at start | 0, identical to the planning output | `claims-start.txt` |
| `npx vitest run` on the eviction file | 0: 35/35, 1.9 s | `vitest-eviction.log` |
| covering set (11 files: re-grep `covering-grep.txt` with the widened pattern = the same 7 files, plus the 4 named) | 0: 11 files, 290 tests | `vitest-covering.log` |
| `npm run typecheck` | 0 | `typecheck.log` |
| `npm run lint` | 0 (205 warnings, 1 info; none in the owned files) | `lint.log` |
| `npx biome check` on the 4 owned source/test paths | 0 | `biome-scoped.log` |
| `sha256sum -c` on `b-round-390/r391-frozen-sha256.txt` | 0, 0 failures | `frozen-check.log` |
| `sha256sum -c` on `b-round-318/protected-sha256.txt` | 0, 11 OK | `protected-check.log` |
| `claims-392.sh` at end | 0 | `claims-end.txt`, `claims-diff.txt` |

- **Claims diff at the end.** Only §6 facts differ:
  - K2 5 → 6;
  - K8 2 → 4;
  - K10 `1 1` → `0 0`;
  - K13 owner-check and owner-read 1 → 3;
  - K16: 31 → 35; statusBefore 1 → 0; EV23–25 0 → 3.
  - K21: doc251 1, last 251.
  - K17 and every other fact are unchanged.
- **L31.** No test in the covering set was listed as slow. The eviction file took 1.9 s alone and 3.8 s in the set.
- **`git status --short`:** 6 lines. These are the 5 `M` files from round 391 (strings.ts, strings.test.ts and budgets are unchanged this round) plus `?? docs/…/251-…md`.

**K8: the `sourceNotLoaded` call sites now (4):**
- l.1736: Play null owner (new);
- l.1837: preview null owner (new);
- l.1880: the preview's not-`ready` branch;
- l.2085: Add/drop.

## 3. Mutants (scratch tar copy outside `store/`, `node_modules` symlinked; removed afterwards by absolute path)
The script is `a-round-392/mutants/run-mutants.py`. The summary is in `mutants/out/summary.txt`, with logs `out/<id>.log` and `out/pristine.<id>.log`. Every pristine run had rc 0, and the tree was restored (`cmp` OK).

| Mutant | Row | Result | Red reason |
|---|---|---|---|
| MU-392-SUCCESS-BY-CACHE (preview success = `decodedBuffers.has`) | EV9 superseded + EV9 stop | RED (2 fail) | stays `Loading “Big Preview”…` |
| MU-392-LOADING-ON-NULL-OWNER (the null branch writes loading and sets the pin) | EV12 | RED | `Loading…` ≠ `has not loaded yet.` |
| MU-392-SUPERSEDED-FAILURE-SILENT (failure gated on `previewRequestRef === sourceId`) | EV23 | RED | stays `Loading…` |
| MU-392-MP3-DROPS-WINDOW (`renderWindow` dropped at the MP3 `prepareExportSources`) | EV24 | RED | exportState = the forbidden error |
| MU-392-IGNORE-ABORT (`return { kind: 'ready' }`) | EV25 | **SURVIVED (equivalent)** | — |
| MU-392-FAILURE-FIRST-ONLY (`awaiting.slice(0,1).find`) | EV17 failure | RED | `is ready` ≠ second-source failure |
| MU-391-NO-SETTLE-SWAP-PLAY | EV3 | RED | stays `Loading…` |
| MU-391-NO-SETTLE-SWAP-PREVIEW (preview swap removed) | EV9 first case | RED | stays `Loading…` |
| MU-392-PREVIEW-NO-FAILURE-WRITE | EV18 | RED | stays `Loading…` |
| MU-391-UNCONDITIONAL-SWAP | EV16 | RED | `is ready` overwrote the add text |
| MU-391-CONDITIONAL-FAILURE | EV16 failure | RED | failure text missing |
| MU-391-PREVIEW-NO-LOADING | EV9 first case | RED | no loading write |
| MU-391-EXPORT-NO-ERROR-CHECK | EV19 | RED | render called |
| MU-391-ERROR-CHECK-IGNORES-WINDOW | EV20 | RED | render not called |
| MU-391-PLAY-NO-WARNING | EV21 | RED | add text shown instead |

- **The mapping deviates from §4.** §4 names MU-391-NO-SETTLE-SWAP for EV18, but EV18 is a failure row, and removing the success swap cannot turn it red. So NO-SETTLE-SWAP-PREVIEW runs on EV9's first case, where it is red. EV18 is covered by MU-392-PREVIEW-NO-FAILURE-WRITE (the preview failure write removed), also red.
- **IGNORE-ABORT is equivalent (L52).**
  - On a collection change, the collection effect writes first: `setStatus(copy.empty)`, or `loadingCollectionStatus`, which replaces any text that does not start with the collection loading copy (K25). Only then does the old decode settle.
  - So `Loading “X”…` is no longer on the line, and the conditional swap cannot fire whether or not the abort is checked.
  - EV25's asserts still hold: they would fail if the collection effect stopped replacing the text. But the abort branch itself has no red-proof, so EV25 is a record row for that branch.
- **Recorded statuses:**
  - EV12: `["Loading the demo collection…","“Big Preview” has not loaded yet." ×4]`.
  - EV25: `collectionStatus="Loading the demo collection…"`, `afterSettle="Loading the demo collection…"`.
  - EV22 (unchanged): `“Big Preview” is ready.`, preview null.

## 4. Code review (the real `code-reviewer` subagent, 1 pass, score 7/10)
- **No Critical or High.**
- **Medium:** see §5, `A-R392-REVIEW-M1`. A reproduced it.
- **Lows.** Each is recorded for B; none changes code:
  1. **Failure is checked before abort.** An aborted caller could write `sourceFailed(old title)` if a new collection had a source with the same id that failed. That order is B's ruling (D-29z1331 §3 order, D-29z1333 unconditional). It is a question for B.
  2. **A stale call stops the live preview.** `stopLibraryPreview()` runs before the null-owner check. B wrote "has still run `stopLibraryPreview()` first, as today". Recorded.
  3. **The supersession gate keys on a sourceId, not a per-request token.** Stop, then a re-preview of the same id during its decode, starts with the first call's `offset`. This is pre-existing and a backlog signal.
  4. **Doc wording on EV25.** Fixed in doc 251's ტესტირება section; no assertion was removed.
- **Architecture note (a signal for B, not a refactor here).** The decode/status region (`ArrangementContext.tsx` ~l.1711–1915 plus `decideDecodeSettle`) has changed across several rounds, each needing wide mocks. The proposal is to move the settle rule, plus an "awaited id exists in the collection" check, into `lib/arrangement/` with unit tests, keeping `ensureDecoded` and the hook shape. This adds to ARCH-CHECKPOINT-DECODE-REGION.

## 5. For B: A-R392-REVIEW-M1 (reviewer: Medium; A: Low today because it is unreachable; severity is B's call)
- **Case.** After the provider's `collection` prop changes, the arrangement still holds a clip of an old source (`initialArrangement` is used only once). That source's `sourceStates` entry still reads `ready`, and its buffer is gone.
  - Play then finds a non-null owner, and `ensureDecoded` skips the id (`!source`).
  - `Promise.all([])` resolves, and the settle writes `“big” is ready.`, with the title falling back to the id. Playback never starts, and every Play repeats this.
- **Evidence.** A scratch-only probe row: `a-round-392/probe/probe.log`.
  - Statuses: `Demo collection ready…` → `Loading “big”…` → `“big” is ready.` → `“big” is ready.`
  - `playing=false`, and the clip list is `["big"]`.
- **History of the same path:**
  - pre-391: `sourceNotLoaded`;
  - round 391: stuck on `Loading “big”…`;
  - round 392: a false ready.
- **Reachability.** `app/routes/studio-lab.tsx:114` mounts the module constant `studioLabDemoCollection`. No production route changes the prop, so no browser row can reach this today. It becomes real with a collection swap (SRW-21 or STEM-LANES).
- **Candidate one-line fix.** Treat an awaited id with no `collection.sources` entry like the null owner (same branch, so K8 stays 4), plus a row "Play after a collection switch with an old clip → `sourceNotLoaded`". A did not apply it: D-29z1332 covers only the null owner, and extending the rule is B's ruling to make.

## 6. Next for C (task §5)
- **Run:** B7 SUPERSEDED, B8 PREVIEW-THEN-SPACE, B9 SUPERSEDED-FAILURE (with C's own `__delayFailDecodes`), B1, B2 (without the level clause), B3, B4 (WAV and MP3), PERF-RES (alone), SOURCE-SCOPE, DOC-251, and the neighbours.
- **SOURCE-SCOPE.** Expect the end-claims diff in §2: K2 6, K8 4, K10 `0 0`, K13 3/3, K16 35/0/1/3, K21 1/251. Frozen 0 failures, protected 11.
- **Expected in the browser:**
  - B7 ends on `“Middle East — public preview” is ready.`, with Full mix playing.
  - B9 ends on the `failed to load` text.
- **The null-owner path cannot be reached in `/studio-lab`** (constant collection). It is proven by jsdom EV12 only.

## 7. Scope status
- **Done:** task §3 items 1–3, plus the §4 rows and mutants, and the §4 "A also runs" list.
- **B acceptance A truly passed (jsdom / static only):**
  - EV9 superseded, EV9 stop, EV12 extended, EV23, EV24 (binding clause plus MP3 render once plus encode once plus pins released), EV25 (record for the abort branch);
  - EV3, EV16 ×2, EV17 ×2, EV18, EV19–EV22 re-run against their mutants;
  - typecheck, lint, scoped Biome, the covering set, claims, frozen and protected checks;
  - doc 251's structure and L26 ids.
- **Not run by A:** every browser row (they are C's), the full suite, `verify` and build (gate).
- **Not claimed:** C-R391-01 closed (that needs C's B7), or the stage or backlog complete.
