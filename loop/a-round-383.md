# A round 383 — PERF-13b-i fix (C-R382-01 holder + D-29z1278 reset)

STATUS: DONE (handed to C). Nothing committed, pushed or deployed. No installs.

## Changed files (exactly the 5 grants in `b-round-382/grants-383.txt`)
- `app/contexts/ArrangementContext.tsx`
  - new component-scope helper `storeSourcePeaks(id, peaks)` (l.768, `useCallback(..., [])`), whose updater `setSourcePeaks((previous) => new Map(previous).set(id, peaks))` captures only `id` and `peaks`;
  - video audio `onPeaks` (l.2844) and collection-load `onPeaks` (l.4307) call it; `storeSourcePeaks` added to the deps of `decodeVideoSourceAudio` (l.2860) and of the collection effect (l.4340). No other logic, order or dependency change;
  - collection effect: `const collectionSourceIds = collection.sources.map((source) => source.id)` at effect start; `resetDecodedBuffers` aborts, clears the in-flight map, then `decodedBuffers.deleteMany(collectionSourceIds)` (l.4264). No `setPinned`. `decodedBuffers.clear(` has 0 hits in the provider.
- `app/lib/arrangement/decoded-buffer-cache.ts` — `deleteMany(ids: Iterable<string>)` on the interface and implementation: deletes from `entries` and `buffers` (same Map instance as `asReadonlyMap`), never touches `pins` or `clock`. `clear()` stays.
- `app/lib/arrangement/__tests__/decoded-buffer-cache.test.ts` — **DC8**.
- `app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx` — `vi.mock` spy also wraps `deleteMany` (records `[...ids]`) and `clear`; **EV7** reworded (deleteMany calls after the rerender = `[['big','keep']]`, `clear` 0 calls, old in-flight decode never sets — kept); **EV10** new (two pending loads resolved inside one `act`; `sourcePeaks` keys `['first','second']`, two distinct `Float32Array`s, both sources `ready`). EV1–EV9 unchanged.
- `docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md` — l.4 byte for byte `**სტატუსი:** In Progress (stage 1 of 2; C round 383 PASS)`; Peaks-state/SWEEP bullet in მიდგომა; reset text → `deleteMany` (D-29z1278, video audio kept, pins untouched); C-R382-01 and code-reviewer M2 Problem → Solution entries; DC8, EV7 (+MU-383-RESET-CLEAR), EV10 (+MU-383-NONFUNCTIONAL-PEAKS, "not a retention proof"), heap mutant MU-383-INLINE-PEAKS-UPDATER; `preview` pin line and EV9 say "**library preview-ის** Stop"; runner path → 383; the M2 TODO removed (ruled). Headings in TEMPLATE order. `grep -rn 'C round [0-9]* pending' docs/implementation` = 0.

## SWEEP (L49) — `grep -nE "\(buffer\)|requestSourcePeaks\(buffer|const buffer = " app/contexts/ArrangementContext.tsx` (`a-round-383/sweep-grep.txt`)
| Hit | Scope | Verdict |
|---|---|---|
| 1169 `const buffer = new AudioBuffer({` | metronome `createClickBuffer` | no updater-form setter in scope (buffer goes to a ref) |
| 1432 `(buffer) => {` | `ensureDecoded` `.then` | no updater-form setter in scope (`decodedBuffers.set/evict`, `syncPlayback`; `patchSourceState` is in the sibling error handler, value arg) |
| 1745 `const buffer = decodedBuffers.get(sourceId);` | `startLibraryPreview` | no updater-form setter in scope (`setLibraryPreviewSourceId(sourceId)`, `setStatus(string)` are values; the `onEnded` closure does not reference `buffer`) |
| 2837 / 2838 video audio `const buffer` + `requestSourcePeaks(buffer, …)` | `decodeVideoSourceAudio` try block + `onPeaks` | **changed**: `storeSourcePeaks(sourceId, peaks)`. `settle` is defined in the outer function scope and calls `patchVideoSource` with an object |
| 4295 / 4299 load path `.then((buffer)` + `requestSourcePeaks(buffer, …)` | collection effect | **changed**: `storeSourcePeaks(source.id, peaks)`. `patchSourceState` gets an object (`buffer.duration` copied as a number); `settle(false)` calls `setStatus((current) => …)` but `settle` is defined at effect scope (l.4278), so that updater's context chain does not include the `.then` scope |

## Checks actually run (logs in `a-round-383/`)
- `npm run typecheck` rc 0 (`typecheck.log`; re-run after the review fix with `tsc --noEmit`, rc 0).
- `npm run lint` rc 0 (205 warnings, none in owned files; `lint.log`).
- /check scoped: `npx biome check <4 owned code paths>` rc 0 (`biome-owned.log`). One format fix applied with `biome format --write` to the owned EV test file only.
- Two decoded-buffer files: 2 files, **23/23** pass (DC1–DC8 = 8, EV = 15 `it`s; `decoded-tests.log`).
- Covering grep `grep -rlE "decodedBuffers|startLibraryPreview|renderArrangementWav|canReloadSource|setSourcePeaks|sourcePeaks" app --include=*.test.*`: 35 files (`covering-hits.txt`) → **35 files, 515 tests pass** (`covering-run.log`).
- 10 C-DEMO files (`b-round-381/fixture-grants-382.txt`), run only: **10 files, 100 tests pass** (`cdemo-run.log`); sha256 before/after identical (`cdemo-sha-before.txt`, `-c` rc 0).
- Scope: `sha256sum -c --quiet b-round-382/r383-frozen-sha256.txt` rc 0; `b-round-318/protected-sha256.txt` rc 0; `git status --short --untracked-files=all` = the 11 round-382 lines, nothing new. (A diagnostic screenshot briefly landed in `store/` as `diag-1440.png`; A moved its own file to `a-round-383/browse/`; status is back to 11.)
- CLAIMS pre-run: `bash b-round-382/claims-383.sh > a-round-383/claims-383-after.txt` (rc 1 as at planning; 0 `MISSING`). Diff vs `claims-383-output.txt`: K3 the two inline updaters (l.2841, l.4296) are gone and the only `setSourcePeaks((previous)` is the helper at l.769; K5 `onPeaks` l.2838 / l.4299; K6 `resetDecodedBuffers` l.4258, the `decodedBuffers.clear()` line gone; K7 l.2842; K8 cache lines shift by +1/+7 with `deleteMany` at l.86, and the `deleteMany` count is 2 (interface + implementation); K9 adds `1 EV10`; K10 l.4 → round 383 and the two Stop lines say "library preview-ის". No other difference.
- L11 timing check on the covering runs: slowest single tests CP12a–d 5.2–5.8 s against a declared 30 s timeout (< 20 %); the footer test 2.0 s against the 5 s default (41 %). Nothing above 50 %.
- No full suite, no perf run, no build (speed rules; root gate does them).

## Mutants — `a-round-383/mutants/run-mutants-383.sh` (`TREE=<copy> OUT=<abs> MODE=unit|browser|all|heap`)
Run `MODE=unit` on `a-round-383/mutants/tree` (tar copy of the store tree, node_modules symlinked) after the final edit: `mutants/unit-run.txt`, full red lines in `mutants/out/summary.txt`. **19/19 red on the named row, `restored`**:
- round-382: MU-EV-NO-EVICT→EV1, NO-DEDUPE→EV2, PLAY-NO-REFUSE→EV3, NO-CLIPS-PIN-RECOMPUTE→EV4, EXPORT-NO-AWAIT→EV5 waits, EXPORT-PIN-LEAK→EV5 cancelled, FAIL-SILENT→EV6, EXPORT-FAIL-SILENT→EV6 export, NO-ABORT-CHECK→EV7, PIN-EVERY-UPDATE→EV8, NO-PLAYING-RESYNC→EV3 playing, REPLACED-EXPORT-RELEASES→EV5 replaced, PREVIEW-NO-STOP-RELEASE→EV9 plays, PREVIEW-NO-SUPERSEDE→EV9 superseded, MU-13B-BOUND-OFF→PL3, MU-13B-DECODE-PROBE-OFF→PL5;
- new: **MU-383-RESET-CLEAR**→EV7, **MU-383-NONFUNCTIONAL-PEAKS** (helper builds from captured `sourcePeaks`, `[]` deps)→EV10, **MU-383-DELETE-MANY-ALL**→DC8.
- `MODE=browser` (MU-13B-NO-DECODE-WRAP, MU-13B-STRONG-REFS) not run by A (perf build; C runs them alone).
- **Heap mutant** `MODE=heap MUTANT=MU-383-INLINE-PEAKS-UPDATER`: anchor `            storeSourcePeaks(source.id, peaks);` → inline `setSourcePeaks((previous) => new Map(previous).set(source.id, peaks));`. Smoke on the copy: prints `applied` (1 inline hit), `RESTORE=1` prints `restored`, file then byte-identical to store (`mutants/heap-smoke/`). **The heap red itself was NOT run by A** (needs a second dev server; C's HEAP-MUTANT row).

## Heap self-check (required; dev server 127.0.0.1:5173; does not replace HEAP-RETAINERS)
- Run 1 (`heap-self-cold-run1.json`): `liveReady []`, 0 `native:AudioBuffer` nodes — **invalid measurement**: first page load right after the source edits (cold Vite recompile), nothing decoded yet. A diagnostic run right after (`browse/diag.mjs`, screenshot `browse/diag-1440.png`) showed the library loaded and live = `[2,5,16,16,16,16,16]` at load and at +8 s, 0 console errors.
- Run 2 (`heap-self.json`, the valid one): `node b-round-382/probe/heap-retainers.mjs http://127.0.0.1:5173 …/a-round-383/heap-self.json` → **live `[2,5,16,16,16,16,16]`** (7 buffers, no 150.37 / 101.35), **7 `native:AudioBuffer` nodes, 0 paths containing `baseQueue`**; all 7 paths end `context:decodedBuffers → get closure → context:buffers → Map` (info only). No buffer beyond the 7 synthetic ones → the L11 STOP condition did not trigger.

## code-reviewer (actual subagent, run once)
Verdict: 0 Critical/High/Medium, 4 Low, 9/10. Sweep confirmed clean per hit; `deleteMany` with ids snapshotted at effect start judged correct.
- **L1 (reported, not fixed — logic change outside this round):** `ensureDecoded` reads `collectionControllerRef.current` at call time but `collection` from its closure; a stale `ensureDecoded` running after a collection change could decode an old-collection source under the new controller, and with `deleteMany(newIds)` that entry would stay until unmount (before, the next `clear()` removed it). Not browser-reachable today (collection changes only on unmount). Proposed guard for B: check `controller === collectionControllerRef.current` and that `collection` is current before `set`.
- **L2 (accepted as is):** EV7 has no non-collection (video-audio) entry; "video kept" is proven through the exact `deleteMany` args + DC8 (task §5 accepts).
- **L3 (fixed):** EV10 asserted different peak-array lengths, which ties it to the bucket policy. Removed; separateness is still asserted by `not.toBe`. Re-ran: 23/23 pass, all 19 mutants red again.
- **L4 (noted):** doc l.4 says "C round 383 PASS" before C runs — the task mandates this text byte for byte.

### Architecture note (verbatim from code-reviewer)
> - **Signal 3 (the same costly region changed repeatedly)** at `/home/runner/czaba-project/store/app/contexts/ArrangementContext.tsx:4253-4343` and :1409-1470.
>   - Rounds 381, 382 and 383 each changed this decode → peaks → cache → reset region, and each round needed the `vi.mock` spy extended plus heap evidence.
>   - **Keep it this round.** The invariants hold: abort order, `set` only after peaks, pin owners, and the shape of `useArrangement()`.
>   - **Proposal for the planner (one bounded task, not a refactor instruction):** move the source-load orchestration (`loadSource` → peaks → cache `set` → `ready`) into a unit in `lib/arrangement/` that takes the cache and callbacks as parameters, so the DC/EV rows can be tested without the provider.
>
> Alternative: manage `sourcePeaks` with `useReducer` (module-level reducer, `{ type: 'peaks', id, peaks }` action) so no updater closure is ever queued and the SWEEP rule would no longer be needed. Verdict: keep the current approach for this round.

Proposal for B/root only (joins SIG-R382-USE-DECODED-SOURCE-BUFFERS / ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING); nothing extracted.

## B acceptance — what A truly passed
- §2.1 helper + both `onPeaks` call it + SWEEP list: done (above).
- §2.2 `deleteMany`: done. §2.3 reset through `deleteMany`, no `setPinned`, `clear()` kept and unused: done.
- §2.4 DC8, §2.5 EV7 reworded + EV10 + MU-383-NONFUNCTIONAL-PEAKS red: done.
- §2.6 doc 248: written (C checks the DOCS row).
- §3 static checks, the two files, covering set, C-DEMO run-only, unit mutants, heap-mode runner, heap self-check, code-reviewer: done as reported.
- NOT claimed: HEAP-RETAINERS (dev+prod), HEAP-MUTANT red, PERF-RES, EVICT-BROWSER, EVICT-B2, PLAY-REFUSE, EXPORT, G383-AUTH, DOCS — C rows.

## Known gaps
- Heap mutant red not demonstrated by A (needs C's second server).
- Prod build heap not measured by A.
- Reviewer L1 (stale `ensureDecoded` across a collection change) is open as a note for B.
- A's scratch copy `a-round-383/mutants/tree` (168 MB) was removed after the runs (A's own scratch, so it does not land in the loop-state commit); the evidence stays in `mutants/out/` (summary, `.orig` and `pristine.*` files) and `mutants/heap-smoke/`. C makes its own `cp -a` copy under `c-round-383/`.

## Next C checks (exact)
1. SOURCE-SCOPE: `git status --short --untracked-files=all` (expect the 11 lines), `sha256sum -c --quiet b-round-382/r383-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` from `store/`.
2. CLAIMS: `bash b-round-382/claims-383.sh` vs `claims-383-output.txt` (expected diffs: K3 inline updaters gone → l.768 helper; K5 `onPeaks` now l.2838 / l.4299; K6 reset l.4258, `deleteMany` l.4264; K7 video `evictable: false` shifted; K8 `deleteMany` present; K9 DC8/EV10; K10 l.4).
3. SWEEP: `a-round-383/sweep-grep.txt` + the table above.
4. UNIT + MUTANTS-UNIT: `TREE=<c copy> OUT=<abs> MODE=unit bash a-round-383/mutants/run-mutants-383.sh` → 19 red + `restored`.
5. HEAP-RETAINERS dev + prod (1440×900; live list at 1280×720) and HEAP-MUTANT (`MODE=heap MUTANT=MU-383-INLINE-PEAKS-UPDATER`, copy server on 5174, then `RESTORE=1`). Warm the dev server first: A's first probe after the edits read `[]` (cold Vite compile).
6. PERF-RES, EVICT-BROWSER, EVICT-B2 (library preview Stop = button text `Stop` with no `aria-label`), PLAY-REFUSE, EXPORT, G383-AUTH, RESET-UNREACHABLE, DOCS as in task §4.
