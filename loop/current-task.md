# Round 392: PERF-13b-ii, re-dispatch. The settle ruling for A's STOP (C-R391-01): a decode wait never leaves `Loading “X”…` on the status line

**Planned by:** B, at the round 391 → 392 planning, 2026-11-07 (`b-round-391.md`).
**Decisions:** D-29z1330 … D-29z1335 (`backlog.json` v359, `decisions_log_b`).
**Type:** one Medium (C-R391-01 = A's round-391 STOP) plus the unfinished parts of the same stage (L10). Not new scope.

**Read first:**
- `lessons.md` in full. Directly relevant: L4, L10, L11, L26, L28, L29/L56, L31, L51, L52, L57, L59, L60.
- `tasks/round-391.md`: the round-391 task. Everything in it still binds unless this file changes it. This file changes only: the settle rule (§1), EV9 superseded (§4), the new rows EV12+/EV23–EV25, the mutant table, and C's rows.
- `a-round-391.md` §0 (the STOP), §3 (mutants), §5 (review). `c-round-391.md` / `c-round-391.json`.
- **Claims:** `b-round-391/claims-392.sh`, run from the loop root. Its planning output is `b-round-391/claims-392-planning-output.txt`. A runs it before editing; C runs it at SOURCE-SCOPE start (must equal the planning output) and at the end (only the facts in §6 may differ).

## Baseline: HEAD `11ca746` **plus A's round-391 work in the tree**
- Gate 391 is `skipped` (C FAIL) [K1]; gate 388's `11ca746` is still the last published commit. HEAD is `11ca746` with **5 status lines** [K2]: A's round-391 changes to the 5 granted files.
- **A continues on that tree and reverts nothing** (policy §6). `perf/budgets.resources.json` already equals B's sketch [K18]. `strings.ts` already has the two strings [K15]. No further change is expected in those two files or in `strings.test.ts`.
- Protected 11/11 [K3]. The frozen manifest `b-round-390/r391-frozen-sha256.txt` (1279 entries, granted paths excluded) still applies, with 0 failures [K4].
- Grants: `b-round-391/grants-392.txt`, the same 6 paths as round 391.

## 0. Why this round
- **C round 391 FAIL** [K7]. B1, B3, B4, B5, B6, PERF-RES and the status/transport part of B2 passed at both viewports, with `browserVerified` true.
- **C-R391-01 (Medium).** A preview that a second preview replaces leaves `Loading “Middle East — public preview”…` on the line forever. C reproduced it at both viewports [K23]. A had reported the same case as its STOP [K22].
- **Root cause (B's spec, not A's code).** The round-391 success clause ("every awaited source is cached") was written in terms of internal state. A superseded or stopped preview loses its `preview` pin. `ensureDecoded`'s own success handler runs `set` and then `evict()` before any caller `.then` [K13], so the buffer is already gone. The clause could never produce the `sourceReady` text that round 391 l.162 required.
- **C-R391-02 (Low).** The export dialog's preflight says "no clip with sound" when the only clip failed. It is consumed in `ArrangementExportDialog.tsx` [K20], which is not granted (root's COPY-PD lane holds the export dialog). It goes to `deferred_low_polish` (D-29z1334).

## 1. Rulings (B)

### D-29z1331: the settle rule (answers A's STOP, option (i))
Both call sites (the Play refusal in `startPlaybackAt`, and the library preview of a `ready` source that is not cached) use **one** rule.

1. **At call time,** read the owner exactly as `ensureDecoded` does [K13]:
   `const owner = collectionControllerRef.current; const controller = owner?.collection === collection ? owner.controller : null;`
2. **Null owner (D-29z1332).** If `controller` is null, `ensureDecoded` would decode nothing, so a loading text would be false the moment it is written.
   - Write **no** loading text. Do not set the preview pin, and do not call `ensureDecoded`.
   - Write `studioLibraryStrings.sourceNotLoaded(<title>)`, the pre-391 text for this path. That is one honest text, and it adds back at most 2 `sourceNotLoaded` call sites (K8 may become 3 or 4).
   - The preview path has still run `stopLibraryPreview()` first, as today.
3. **Otherwise,** write the loading text and call `ensureDecoded`, as now. In its `.then`, decide in this order:
   - **Failure:** an awaited source has status `'error'` → `setStatus(librarySourceFailedMessage(<title of the first such source>))`. **Unconditional**, as in round 391. For a superseded preview this is new and confirmed (D-29z1333).
   - **Success:** `controller.signal.aborted` is false → the conditional swap `setStatus(cur => cur === loadingText ? sourceReady(title) : cur)`.
   - **Neither** (the signal was aborted: a collection change or unmount) → no write. The collection's own status owns the line: the collection effect writes on every change, `setStatus(copy.empty)` or `setStatus(current => loadingCollectionStatus(current, copy))`, and `loadingCollectionStatus` replaces any text that does not start with the collection's loading copy, so `Loading “X”…` is replaced [K25].
4. **Delete the cache-based success expressions** [K10]: `awaiting.every((id) => decodedBuffers.has(id))` and the preview's `else if (decodedBuffers.has(sourceId))` settle branch. The preview's **start** decision after the supersession gate stays cache-based, as now ("start if `decodedBuffers.has(sourceId)`, else `releasePreviewPin()`").
5. **What `“X” is ready.` means:** the decode of X completed under the current collection. It does **not** promise that X is held in memory. A superseded or stopped preview's buffer is evicted (as before, the cache does not keep it), and the next Preview of X decodes again and shows `Loading “X”…` again.
   - **Why this is honest enough:** the line tells the truth about the action the user started (the load finished). The alternative, restoring the text the loading line replaced, needs bookkeeping across overlapping waits, and was already rejected in round 391 (D-29z1325).
   - This is a CZABA decision with no Live reference (Live streams from disk and shows no decode wait).
6. **Helper (optional).** A may put the shared decision in **one** module-level function inside `ArrangementContext.tsx`, used by both sites (for example `decideDecodeSettle(awaiting, states, controller) → 'failed' | 'ready' | 'none'`). No new file, no new export, no new React state, ref or context field.
7. **Untouched, as in round 391:** `ensureDecoded`'s body, the cache, the pins, the collection effect, `prepareExportSources`' logic, the Play warning (D-29z1326).

### D-29z1333: a superseded preview whose decode fails
Writes `sourceFailed(<title>)` (unconditional). Confirmed. A failure must never go silent (round 391 ruling line, EV13). New row EV23.

### D-29z1335: mutant rulings (L52)
- **MU-391-WARNING-BEFORE-PLAYINGFROM: equivalent, accepted.** The `playingFrom` write is a functional update that replaces only "stopped"-kind texts or `scheduleFailed`; the warning is neither, so the order cannot change the result. No replacement mutant. MU-391-PLAY-NO-WARNING (red) still guards EV21.
- **MU-391-READY-ON-FIRST and MU-391-READY-ON-SOME: retired.** Their target (`every(cached)`) is deleted by D-29z1331.
- **The mutant table in §4 is regenerated.** No round-391 red log counts for an expression this round changes.

### Ruling lines (L4)
- Status after a superseded or stopped preview's successful settle: D-29z1331's swap wins over round-391's "cached" clause, and over EV9-superseded's old `toBe(statusBefore)`.
- Status for a null-owner call: D-29z1332's `sourceNotLoaded` wins over the round-391 loading write.
- The failure write stays unconditional at both sites (round 391, unchanged).
- Status after Play with an `error` clip: D-29z1326's warning still wins over `playingFrom` (unchanged).

**Status writes this round can collide with (L51):** `Loading “X”…`, `“X” is ready.`, `sourceFailed`, `sourceNotLoaded`, `playingFrom`, the Undo/Redo texts, the add text (`added to the Music track…`), the collection's `Loading the demo collection…` / `Demo collection ready.`, and the export failure in the dialog (not the status line).

## 2. Reference
Unchanged from `tasks/round-391.md` §2. The only behaviour this round changes (decode wait text) has **no Live reference** (Live 12 manual ch. 5; Live streams from disk). The missing-media row (Live 12 manual 5.6) is unchanged and already passed (B3).
**Screen budget (L39):** nothing new is permanently visible; only the existing status line's text changes.

## 3. What A changes (grants: `b-round-391/grants-392.txt`, 6 paths)
1. **`app/contexts/ArrangementContext.tsx`:** D-29z1331 and D-29z1332 only, at the two call sites (and the optional helper). The owner compare uses `collection` itself; A adds `collection` to the two dependency arrays (`startPlaybackAt`, `startLibraryPreview`) if lint requires it. No other dependency change.
2. **`app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx`:** the rows in §4. Keep every round-391 row (31). A rewrite keeps every assertion or replaces it with an equal or stronger one; a change whose only effect is removing an assertion is a Medium finding.
3. **`docs/implementation/2026/quarter-IV/251-perf-decode-status-and-failed-sources.md`** (new, still the next free number [K21]). In Georgian, following `docs/implementation/TEMPLATE.md`. It covers the whole PERF-13b-ii stage (rounds 391–392): D-29z1324…1327, 1331…1333; status line l.4 per L28 (`Completed (C round 392 PASS)`). It cites only rows that exist (L26).
4. `perf/budgets.resources.json`, `strings.ts`, `strings.test.ts`: already done; no change expected. If A must change one, it explains why in the report.

**Forbidden:** as in round 391 (every path outside the grants, `ensureDecoded`'s body, `studio-lab-demo.ts`, `graph.client.ts`, the purchased adapter, `ArrangementExportDialog.tsx`, the global forbidden files and actions, the 4 protected files, `package.json`; commit, push, stash, checkout, deploy, dev-server restarts). Do not revert A's round-391 work.

## 4. A: tests (jsdom, in `decoded-buffer-eviction-ui.test.tsx`; the ids are binding)
Each row names the mutant that must turn it red. A runs each mutant on a scratch copy outside `store/` and saves the logs in `a-round-392/mutants/`.

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **EV9 superseded** (rewritten) | Preview `big` (evicted), then preview `keep`; settle `big` OK | `libraryPreviewSourceId` = `keep`; status **`toBe(sourceReady(BIG_TITLE))`** (replaces `toBe(statusBefore)`); `not.toBe(sourceDecoding(BIG_TITLE))`; the cache does not keep `big` (as now) | MU-392-SUCCESS-BY-CACHE (success decided by `decodedBuffers.has` again) |
| **EV9 stop** (new, same `it` group) | Preview `big`; `stopLibraryPreview()` before the settle; settle OK | No preview; status `sourceReady(BIG_TITLE)`; cache does not keep `big` | MU-392-SUCCESS-BY-CACHE |
| **EV12** (extended) | As today (a stale preview call from before a collection change) | Today's asserts, **plus**: the status after the stale call is `sourceNotLoaded(<its title>)`, it was never `sourceDecoding(...)` (record every status in the row), and no preview pin was set for the stale id | MU-392-LOADING-ON-NULL-OWNER (the loading write and pin happen even with a null owner) |
| **EV23** | Preview `big`, then preview `keep`; settle `big` **with an error** | Status `sourceFailed(BIG_TITLE)`; preview still `keep` | MU-392-SUPERSEDED-FAILURE-SILENT (the failure write moved after the supersession gate) |
| **EV24** | As EV20 (a failed clip outside a range window, a ready cached clip inside), but `exportMp3(window)` | **Binding:** `exportState` never reaches `{ phase: 'error', message: exportFailed(sourceFailed(BIG_TITLE)) }`, and the export pins are released. The test file has no MP3 render mock today (only `renderWavMock`); if A adds one inside the test file, "the MP3 render runs once" is asserted too | MU-392-MP3-DROPS-WINDOW (`renderWindow` dropped at the MP3 call site) |
| **EV25** | Play with an evicted placed clip → `sourceDecoding`; change the collection (abort) before the settle; then settle the old decode OK | The status after the settle equals the new collection's own status text (the collection effect replaced the loading text [K25]); it is never `sourceReady(BIG_TITLE)` or `sourceDecoding(BIG_TITLE)` | MU-392-IGNORE-ABORT (success ignores `signal.aborted`). If A shows this mutant is equivalent (the collection's own write always replaces the loading text first), A records the argument and the row stays a record row (L52) |
| **EV3, EV16 ×2, EV17 ×2, EV18** | Unchanged sequences | Unchanged expectations | Re-run against the new rule: MU-391-NO-SETTLE-SWAP (EV3, EV18), MU-391-UNCONDITIONAL-SWAP (EV16), MU-391-CONDITIONAL-FAILURE (EV16 failure), MU-392-FAILURE-FIRST-ONLY (EV17 failure: only `awaiting[0]` checked for `error`) |
| **EV19–EV22** | Unchanged | Unchanged | MU-391-EXPORT-NO-ERROR-CHECK, MU-391-ERROR-CHECK-IGNORES-WINDOW, MU-391-PLAY-NO-WARNING re-run once on the final tree |

**A also runs:**
- `npm run typecheck`, `npm run lint`, scoped `npx biome check` on the changed paths;
- `npx vitest run` on the round-391 covering set (11 files, `a-round-391/covering-grep.txt` plus the 4 named files), re-grepped on the final tree for `sourceNotLoaded|sourceDecoding|sourceReady|exportFailed|prepareExportSources|playingFrom`;
- the claims script at start and end;
- the `code-reviewer` again (3+ files changed across the stage), given the new settle code and the rewritten rows.

A does not run the full suite or `verify`; the gate does.

**A's report, `a-round-392.md`:** changed files; each command with rc and log path under `a-round-392/`; each mutant's red log (or the equivalence argument); the EV12/EV25 recorded statuses; the `sourceNotLoaded` call sites that remain (K8); the reviewer's notes (Architecture notes go to B as signals).

## 5. C: browser rows (1440×900 and 1280×720, `http://127.0.0.1:5173/studio-lab`)
**Probe setup:** as round 391 §5. Reuse `c-round-391/probe2.mjs` (the `__delayDecodes` / `__failDecodes` helpers, the `MutationObserver` on `[data-testid="arrangement-status"]`, the ready wait, the injection order). Copy it into `c-round-392/`; do not edit round-391 files.

| Row | Steps | PASS when |
|---|---|---|
| **B7 SUPERSEDED (C-R391-01)** | Fresh load; delay 1; select Middle East; Preview; while it decodes, select Full mix and Preview; wait 3 s | The observed sequence contains `Loading “Middle East — public preview”…` and then `“Middle East — public preview” is ready.`. The line **does not end** on the loading text. Full mix is the playing preview. 0 `pageerror` |
| **B8 PREVIEW-THEN-SPACE** | Fresh load; Add Full mix (already decoded at load) so Play has something to play; delay 1; Preview Middle East; press Space while it decodes; wait 3 s | Playback runs (`data-playing` true). The line does not end on `Loading “Middle East — public preview”…` (it ends on `“…” is ready.` or another non-loading text). Record the full sequence |
| **B9 SUPERSEDED-FAILURE** | As B7, but the Middle East decode **fails after the wait**. `c-round-391/probe2.mjs`'s `__failDecodes` rejects at once, so add to C's own copy a third helper, `window.__delayFailDecodes = n` (the next n decodes reject with `EncodingError` after 1500 ms), installed at 0 with the others and set to 1 after ready | The line ends on `“Middle East — public preview” failed to load — details are in the library.`; Full mix is the playing preview; 0 `pageerror` |
| **B1 PREVIEW-LOADING** | As round 391 | As round 391 |
| **B2 PLAY-LOADING** | As round 391 | As round 391, **without** the level clause: the level ≥ 20 dB half is dropped for this round (round 391 did not run it, and this round's change does not touch the audio path). Playback is proven by `data-playing` true and the source start |
| **B3 FAILED-CLIP-PLAY** | As round 391 | As round 391 |
| **B4 FAILED-CLIP-EXPORT** | As round 391 (WAV and MP3) | As round 391 |
| **PERF-RES** | As round 391 (alone, L38) | As round 391; copy results to `c-round-392/perf-results/` |
| **SOURCE-SCOPE** | Claims at start and end, `git status`, `sha256sum -c` on `r391-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | Start = planning output. End: only granted paths changed (doc 251 new), K4 0 failures, K3 11, and only §6 facts differ |
| **DOC-251** | Read the doc | Georgian, TEMPLATE sections, l.4 per L28, and every cited row id exists in the test file (L26) |
| **gate** | Full vitest, typecheck, build, Biome, verify | `gate`; not claimed in `passed` |

- **Carried, not re-run:** B5 CONTROL-EXPORT and B6 JOURNEY passed in `c-round-391.json` on a tree whose export and journey code this round does not touch. C cites that evidence. Run them again only if time remains after every row above has a result (L59).
- **Neighbours** (one short check each, 1440 only): the first-load sequence `Loading the demo collection…` → `Demo collection ready.`; Add of a source that is still loading says `has not loaded yet.`; EV13 path (a preview while playing keeps the timeline playing until the decode succeeds).
- **L57 fields** in `c-round-392.json`: `manifestPaths` = `b-round-390/r391-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`; `mutantRedOnSketch` = "jsdom mutants: A's logs (`a-round-392/mutants/`); budgets mutant MU-391-NOTHING-EVICTABLE red on B's sketch (`b-round-390/mutants/`)"; an `origin` per finding; `missingPaths`, `countMismatches`, `claimCheckMinutes`.

## 6. Claims that may change during the round
- **K2:** 5 → 6 status lines (doc 251 is new).
- **K8:** 2 → 2…4 (null-owner `sourceNotLoaded` writes). A lists each call site.
- **K10:** `1 1` → `0 0`.
- **K13:** `owner-check` and `owner-read` 1 → 2 or 3 (the caller-side reads, or one in the helper).
- **K16:** EV tests 31 → 34…36; `EV9-superseded-statusBefore` 1 → 0; `EV23-25` 0 → 3.
- **K17:** may change (count only).
- **K21:** doc251 0 → 1, last 250 → 251.
- **K22–K25:** unchanged.
Everything else must equal the planning output.

## 7. Out of scope (recorded, not dropped)
- C-R391-02 (export preflight says "no clip with sound" for a failed clip): `deferred_low_polish`, owner lane COPY-PD / the export dialog (D-29z1334).
- The "Offline" mark (Saba Q1), retrying a failed source, Q-PREVIEW-STOPS-TRANSPORT, the purchased reload (SRW-21-PLAN).
- Extracting the settle rule to `lib/arrangement` (reviewer's Architecture note): a signal appended to ARCH-CHECKPOINT-DECODE-REGION, not this round.
- Next after PERF-13b-ii: PERF-13c (streaming library preview).
