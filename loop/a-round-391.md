**STOP — needs B ruling on the D-29z1325 success rule for an unpinned library preview (EV9 superseded case, and preview → Stop preview)** (L11: two task clauses disagree). Everything else in the round is implemented and checked. The tree is consistent and green (see §3). A did not rule on the conflict.

## 0. The conflict
- **The clauses (`current-task.md`):**
  - l.68: "**Success:** every awaited source is cached → `sourceReady(...)`".
  - l.162, EV9 superseded case: "the status is `sourceReady(BIG_TITLE)` … and the cache does not keep `big`".
  - l.73: "Its settle still swaps its own loading text … so a stale “Loading” never stays".
- **Mechanism:**
  - A preview that is superseded or stopped loses its `preview` pin (`stopLibraryPreview` → `releasePreviewPin`).
  - When its decode resolves, `ensureDecoded`'s own success handler runs `decodedBuffers.set` and then `evict()`. That code is untouched and its body is forbidden to edit. It runs **before** any caller `.then`, so the buffer is already gone.
  - At settle the source is not cached and not `error`, so the literal rule writes nothing and `Loading “Big Preview”…` stays.
  - `sourceStates` cannot separate a success from an abort either. A collection change never clears old entries, because `patchSourceState` merges, so an aborted id still reads `ready`.
- **Evidence:** `a-round-391/stop-probes.log` (probe rows kept verbatim in `stop-probes.test-snippet.tsx`; removed from the test file):
  - `PROBE-SUPERSEDED`: after the settle, status = `Loading “Big Preview”…`, preview = `keep`, cached = false.
  - `PROBE-STOP-PREVIEW` (preview `big`, Stop preview, settle): status stays `Loading “Big Preview”…`, cached = false.
  - `PROBE-UNDO` (Play → Undo before the settle): **not stale.** Undo writes its own status, `Undo: Add — Big Preview`, so the conditional swap leaves it alone. The code-reviewer had first claimed Play + Undo was stale; it withdrew that claim after this probe.
  - The **Play path is not in conflict:** the `clips` pin keeps every successful decode cached at settle.
- **EV9 superseded is left at today's text** (l.531–542; `statusBefore` captured at l.536, `toBe(statusBefore)` at l.539, `not.toBe(sourceNotLoaded)` at l.540). It still PASSES, but only because `statusBefore` is the loading text and the status never leaves it. **The row now pins the stale text.** A did not rewrite it, because rewriting it means choosing the rule.
- **Options for B (A has not chosen one):**
  - (i) For the preview (or both sites), success = no awaited source is `'error'` **and** the owner controller captured at call time is not aborted. That is the same two-line owner check `ensureDecoded` uses at its head, done on the caller's side. EV12 (a stale closure under a new collection) is the case that forces the owner check; without it, a source that was never decoded would read "ready". Code-reviewer round 1 recommended this direction.
  - **Related shape B may rule on at the same time:** in the EV12 path (a stale closure after a collection change), the preview branch now writes `Loading “Big Preview”…` **before** `ensureDecoded`'s owner check fails. The settle then writes nothing, so that call leaves a loading text under the new collection; before this round it wrote `has not loaded yet`. No row asserts it, because EV12 checks only loads and the cache. Question for B: should the loading write itself be skipped when the caller-side owner check is null?
  - (ii) Keep "cached" and rewrite the EV9 superseded expectation to accept the stale `Loading` text. This contradicts l.73.
  - (iii) B's own rule.
- **Also confirm:** a superseded preview whose decode **fails** now writes `sourceFailed(<title>)`. The failure write sits before the supersession gate, per "unconditional at both call sites". No EV row pins this combination; before this round, a superseded failure wrote nothing.

## 1. Changed files (5 of the 6 granted paths; doc 251 deferred)
- `perf/budgets.resources.json`: B's `sketch-391.patch.txt`, applied with `patch -p0` (the absolute `---` path makes `git apply` fail). `cmp` against `b-round-390/sketch-391-budgets.resources.json`: identical.
- `app/lib/arrangement/strings.ts`: `sourceDecoding` and `sourceReady`, with the exact D-29z1325 texts. Nothing else changed.
- `app/lib/arrangement/__tests__/strings.test.ts`: two formatter-sample rows next to `sourceNotLoaded`, and two exact-text `expect`s in ST11.
- `app/contexts/ArrangementContext.tsx`:
  - **Play refusal** (`startPlaybackAt`): writes `sourceDecoding(<title of awaiting[0]>)`. The `.then` of its own `ensureDecoded` call then does one of:
    - an awaited source is `error` → `sourceFailed(<first such>)`, unconditional;
    - every awaited source is cached → a functional swap to `sourceReady(title)` when the line still shows the loading text;
    - otherwise no write.
  - **Play with an `error` clip:** starts as before. After the existing `playingFrom` write, it writes `sourceFailed(<the first error clip's source title>)`.
  - **Preview of a `ready` source that is not cached:** writes the loading text, then applies the same settle rule (the failure write is unconditional). Only after that comes the existing supersession gate, then start or `releasePreviewPin`. The old `sourceNotLoaded` fallback in that `.then` is gone; that case now writes nothing.
  - **`prepareExportSources`:** gains an optional third parameter, `renderWindow`, and both callers (WAV, MP3) pass it. The existing `awaiting && !has` check is unchanged and runs first. A second, added check returns `librarySourceFailedMessage` for the first clip whose source is `'error'` and that overlaps the window (`clip.start < end && clip.start + clip.duration > start`), or any such clip when there is no window. Pins before the `await`, the callers' `signal.aborted` check and the `finally` release are unchanged.
  - **No ref and no state added.** Each call site's loading text is a `const` in its closure, and its `.then` captures it.
  - `ensureDecoded`'s body, the cache, the pins and the collection effect are untouched.
  - One dependency was added: `decodedBuffers` in `startPlaybackAt`'s array. It is stable, from `useState`.
- `app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx`: 22 → 31 rows.
  - **Rewritten:** EV3 (refusal, decoding, ready, then Play) and EV9 first case (loading, then ready). Every old assertion is kept or replaced by a stronger one.
  - **Added:** EV16 ×2, EV17 ×2 (a dedicated `twoEvictableCollection` factory; the shared fixture is unchanged), EV18, EV19, EV20, EV21, EV22.
  - **Observer:** gained `setPinnedArgs()`. EV19 asserts the export's pin calls are exactly `[['export',['big','keep']],['export',[]]]`.
- **Not written:** `docs/implementation/2026/quarter-IV/251-perf-decode-status-and-failed-sources.md`. Its central sentence is the open rule, so it waits for the re-dispatch.

**K8 after the change:** 2 `sourceNotLoaded` call sites remain.
- l.1850: the preview not-`ready` branch.
- l.2055: Add/drop.

The Play refusal and the preview `.then` fallback are gone.

## 2. Commands (from `store/`; logs in `a-round-391/`)
| Command | rc | Log |
|---|---|---|
| `claims-391.sh` at start | 0, identical to the planning output | `claims-start.txt` |
| `npm run typecheck` | 0 | `typecheck.log` |
| `npm run lint` | 0 (205 warnings, 1 info; none in the owned files) | `lint.log` |
| `npx biome check <5 owned paths>` | 0 | `biome-scoped.log` |
| `npx vitest run` on the covering set (11 files) | 0: 11 files, 286 tests | `vitest-covering.log` |
| `sha256sum -c` `r391-frozen-sha256.txt` / `b-round-318/protected-sha256.txt` | 0 / 0 | `frozen-check.log`, `protected-check.log` |
| `claims-391.sh` at end | see below | `claims-end.txt`, `claims-diff.txt` |

- **The covering set** is the 7 files that match the `sourceNotLoaded|exportFailed|prepareExportSources|playingFrom` grep (`covering-grep.txt`) plus the 4 files the task names: `grid-snap-loop-drop`, `export-range-ui`, `export-range`, `schedule-failure-ui`.
  - The grep's 7 files: decoded-buffer-eviction-ui, drag-preview-render, failed-source-refusal, name-bar-hint-ui, playback-start, status-lifetime, strings.
- **Timing (L31):** the eviction file ran 31 tests in 2356 ms.
- **End claims diff:**
  - K2: 5 status lines.
  - K8: 4 → 2.
  - K9: 1 → 0.
  - K15 `new-keys`: 0 → 2.
  - K16 tests: 22 → 31. Its line pins read 0 because they are fixed line numbers that moved. The old EV3/EV9 lines are rewritten as above; EV9 superseded is unchanged at l.531–542.
  - K18: `assert assert record record`.
  - **K11 changed, and §6 does not list it:** `prepareExportSources-calls 2 → 0`. K11 greps the literal two-argument call. Both call sites still exist, now `await prepareExportSources(arrangement, controller, renderWindow);`, because D-29z1326's window rule needs the window. `exportFailed-uses` is still 2. C: please count with the three-argument form.

## 3. Mutants (scratch copy outside `store/`; script and logs in `a-round-391/mutants/`)
- **Script:** `run-mutants.py`. The summary is in `out/summary.txt`; each mutant's log is in `out/<id>.log`, and each pristine row run in `out/pristine.<id>.log`.
- **The scratch copy** was a tar copy with `node_modules` symlinked. A removed it after the runs, following the round-383 precedent.
- Every pristine run had rc 0, and every mutant was restored.

| Mutant | Row | Result | Red reason |
|---|---|---|---|
| MU-391-OLD-PLAY-TEXT | EV3 | RED | `has not loaded yet` ≠ `Loading…` |
| MU-391-NO-SETTLE-SWAP (Play swap removed) | EV3 | RED | stays `Loading…` |
| MU-391-NO-SETTLE-SWAP (preview settle removed) | EV18 | RED | stays `Loading…` |
| MU-391-UNCONDITIONAL-SWAP | EV16 | RED | `is ready` overwrote the second write |
| MU-391-CONDITIONAL-FAILURE | EV16 failure | RED | failure text missing |
| MU-391-READY-ON-FIRST | EV17 | RED | second failure not reported |
| MU-391-READY-ON-SOME (`every`→`some`, reviewer's suggestion) | EV17 success | **SURVIVED** (equivalent) | — |
| MU-391-PREVIEW-NO-LOADING | EV9 | RED | no loading write |
| MU-391-EXPORT-NO-ERROR-CHECK | EV19 | RED | render was called |
| MU-391-ERROR-CHECK-IGNORES-WINDOW | EV20 | RED | render was not called |
| MU-391-PLAY-NO-WARNING | EV21 | RED | `added to the Music track…` shown instead |
| MU-391-WARNING-BEFORE-PLAYINGFROM | EV21 | **SURVIVED** (equivalent) | — |

**Why the two survivors are equivalent (L52):**
- **WARNING-BEFORE-PLAYINGFROM:** the `playingFrom` write is a functional update. It replaces only a "stopped"-kind text or `scheduleFailed`, and the warning is neither. So the order of the two writes can never change the result, and no assertion can tell them apart. B named this mutant; it needs a ruling that it is equivalent, or a different mutant.
- **READY-ON-SOME:** the Play `.then` runs only after `Promise.all`, and the `clips` pin keeps every success cached. So `some` and `every` differ only in the evicted-on-arrival case, which is the open conflict.
- The code-reviewer agrees with both.

**Mutant ids that the re-ruling changes:** NO-SETTLE-SWAP, READY-ON-FIRST and UNCONDITIONAL-SWAP target the success expression B may re-rule. They are red now, but they must run again after the re-dispatch.

## 4. EV22 record (`tech-lead`'s mid-gesture risk)
Sequence: Play → `sourceDecoding`; `beginPointerGesture()`; settle OK; release the gesture.
- Final committed status: `“Big Preview” is ready.`
- `getStatusPreviewText()`: `null`.
- The row asserts only that the status is not the loading text.

## 5. Code review (the actual `code-reviewer` subagent, 2 passes)
- **Pass 1, score 6/10:**
  - **High:** the superseded-preview stale `Loading`. This is the STOP above; the reviewer also says "raise with B".
  - Its Play + Undo variant was withdrawn after A's probe.
  - **Medium:** the WARNING-BEFORE-PLAYINGFROM mutant is equivalent. Recorded in §3.
  - **Medium:** EV19's `cache.has('keep')` could not fail. **Fixed:** EV19 now asserts the exact export pin calls.
  - **Low:** the EV16 title was wrong. **Fixed** (renamed).
  - **Low:** EV17 had no both-succeed row. **Added**; its mutant is the equivalent READY-ON-SOME.
  - **Low:** no `exportMp3(window)` row. **Open for B:** a mutant that drops `renderWindow` at the MP3 call site (l.4136) would stay green.
  - **Low:** the "first error clip → title or id" lookup appears three times. Left as is: three local uses, and no helper outside the ownership. Passed to B.
- **Pass 2 (test changes only), score 9/10:** no Critical or High. The changes are correct and can fail.
  - **Optional Low:** filter the EV19 pin calls by `owner === 'export'` for robustness. Not applied.
- **Architecture note (signal for B, not a refactor here):** the same settle rule is now written at two call sites in `ArrangementContext.tsx`, and this round's open issue sits in that duplicated rule. The reviewer proposes one bounded task: a pure `decideDecodeSettle(awaiting, sourceStates) → 'failed' | 'ready' | 'none'` with unit tests. Keep it in mind for D-29z1328 (the region checkpoint is unanswered).

## 6. For B
- **Behaviour note:** after the refusal → `“X” is ready.` → Space again, playback starts and the line **keeps** `“X” is ready.`. `playingFrom` replaces only "stopped"-kind texts, and the `has not loaded yet` text had the same property before this round. B2 does not assert it, so this is recorded only.
- **Superseded preview failure:** see the end of §0.

## 7. Next for C (only after B's ruling and A's re-dispatch)
- The re-dispatch must:
  - apply the re-ruled success rule;
  - rewrite EV9 superseded and add a preview → Stop preview row;
  - re-run NO-SETTLE-SWAP, READY-ON-FIRST and UNCONDITIONAL-SWAP;
  - write doc 251;
  - send the changed code to the code-reviewer again.
- **Not ready for C now.** If C runs anyway:
  - B1, B2 (a non-superseded preview and Play), B3, B4, B5, B6 and PERF-RES exercise implemented code;
  - the stale `Loading` after a superseded preview or Stop preview reproduces by design of the open rule.
- **SOURCE-SCOPE:** K11 changed as explained in §2.

## 8. Scope status
- **Done:** §3 items 1–4. Item 5 is done except the EV9 superseded rewrite, which is blocked by the STOP.
- **Not done:** item 6 (doc 251).
- **B acceptance A truly passed (jsdom only):**
  - EV3, EV9 first case, EV16 ×2, EV17 ×2, EV18, EV19, EV20, EV21, EV22 (record);
  - the budgets `cmp`;
  - typecheck, lint, scoped Biome and the covering vitest set.
- **Not passed:** EV9 superseded (STOP). No browser rows were run; they are C's.
- **Not claimed:** the whole backlog or the round as complete.
