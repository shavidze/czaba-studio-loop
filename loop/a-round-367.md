STOP — needs B ruling on A-REVIEW / A-R367-REVIEW-DEDUP-CANCELLED-WRITE (Medium, code-reviewer, not ruled in `b-round-366/sketch-review.md`)

# A round 367: PERF-9b-ii stem-cache commit discipline

The tree holds B's sketch **verbatim** plus doc 236 stage 3. `git diff -- app` is byte-identical to `b-round-366/sketch.patch.txt` (`cmp`, `a-round-367/app-diff.patch`). Nothing was changed after the review. No commit, no push.

## STOP detail: A-R367-REVIEW-DEDUP-CANCELLED-WRITE

**Reviewer finding (Medium), `stem-cache.client.ts` l.411 (`writes.has(key)` skip), l.311–313, l.323, l.329 (`cancelled()` returns):**
- `writeInBackground` skips a second write for a key while `writes.has(key)` is true. It assumes the first write will land.
- With the sketch, a pending write can wait on `commitChain` behind another key's sweep → list → evict → put. When it runs, it returns quietly if its signal was aborted meanwhile (the L3 fix).
- Scenario: load 1 of key A is aborted after its body was read, while its write is queued. Example: the load effect in `app/contexts/ArrangementContext.tsx` l.4063–4130 re-runs, or StrictMode in dev. Load 2 of A misses, sees `writes.has(A)` and skips. Write 1 then cancels. Both loads succeed, and A is not cached. The next open downloads it again.
- Impact: performance only. There is no data loss and no wrong bytes.
- Reviewer's fix proposal: keep `{ promise, signal }` in `writes`, and allow a new write when the pending write's signal is aborted.

**A's measurement (scratch only, deleted afterwards).** Two temporary rows were appended to a scratch copy of the test file. The block is in `a-round-367/dedup-probe-block.ts.txt`. Each row ran on a `git archive d53d113` scratch and on the same scratch plus the sketch patch.

| Probe | HEAD `d53d113` | Sketch |
|---|---|---|
| P1: sweep held; B write first; A1 body read → abort A1 → A2 (same key) → release → `idle()` | storedA=true, put calls 2 | **storedA=false**, put calls 1 |
| P2: sweep free, B's put held; then the same A1/abort/A2 order | storedA=true, put calls 3 | **storedA=false**, put calls 1 |

Logs: `a-round-367/dedup-probe-head.log`, `a-round-367/dedup-probe-sketch.log`.

Reading of the measurement:
- **P1:** the loss comes from the L3 re-check after the sweep combined with the existing per-key dedup (SC17). On HEAD, A was stored because HEAD ignored the abort, which is the L3 bug this round fixes.
- **P2:** the commit chain widens the window. On HEAD, A1 stored before the abort. With the sketch, A1 waits behind B's put.
- So this is a regression against HEAD that the round introduces, in a cache-efficiency sense.

**Why A did not fix it.**
- Task §4 and the A-REVIEW row make an unruled Medium+ a STOP (L58: a planning FAIL).
- The proposed fix changes the "one in-flight write per key" dedup ruled in stage 1 (SC17, doc 236 "in-flight `writes` map"). Under §1.1 and L11, a fix that changes a ruled behaviour is a STOP.

**Options for B to rule** (A does not choose):
1. Accept it as Low, with a doc 236 TODO and a `deferred_low_polish` entry, and re-dispatch as-is.
2. Fix it in the `writes` map: keep `{ promise, signal }`, and let a new write replace an aborted pending one. Add a new SC row (P2's shape, asserting A is stored) and a named mutant (the aborted-signal check removed).
3. On cancel, clear the `writes` entry early, before the write is dequeued, through an abort listener. This only helps a load that arrives after the abort, as in the scenario.

## Rows (§2.1)

| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | **PASS**: identical to `b-round-366/claims-367-planning-output.txt` | `a-round-367/claims-pre.txt` |
| A-CLAIMS final | **PASS** for the specified items: K1, K11, K12, K14 and K15 equal planning; K2 `d53d113 3`; K7 all 0; K13 l.4 = `**სტატუსი:** Completed (C round 367 PASS)`, pending 0, stage-hits = `232-perf-drag-preview.md` only, headings 7; K16 empty. The other lines equal the sketch output (the only diffs are K2, K7 and K13, as expected) | `a-round-367/claims-final.txt`, `claims-final-vs-sketch.diff` |
| A-TESTS | **PASS**: stem-cache 31/31 (185 ms), source-fetch 6/6. The covering grep gives only these 2 files | `a-round-367/tests.log`, `covering-grep.txt` |
| A-TYPE | **PASS**: `npm run typecheck` rc 0 | `a-round-367/typecheck.log` |
| A-LINT | **PASS**: `npm run lint` rc 0, 205 warnings (= the gate 366 baseline). Biome on the 2 owned code files: rc 0 | `a-round-367/lint.log`, `biome-owned.log` |
| A-MUTANTS | **PASS**: all 13 red, each on exactly B's rows (`diff` against `sketch/mutant-summary.txt`: identical). Restored from `a-round-367/stem-cache.client.ts.orig`; `cmp` OK, and `git diff -- app` still equals the patch | `a-round-367/mutants/*.log`, `mutants/summary.txt` |
| A-REVIEW | **STOP**: 1 unruled Medium (above) | verbatim: `a-round-367/code-review.md`; summary below |
| A-DOC | Written as §1.3: l.4 is exact, l.5 lists stage 3, stage-3 content sits under all 7 headings in order, `grep -rl 'C round [0-9]* pending' docs/implementation` → 0. **Pending re-dispatch:** the reviewer's doc Lows below are not applied, because a STOP means changing nothing else | doc 236 |

A did not run the full suite, verify, perf specs or browser probes, as the task says.

## Code-reviewer (actual `code-reviewer` subagent, score 8/10)

The reviewer had no shell, which is its normal tool set. It rebuilt the diff from the sketch patch and confirmed that SC1–SC21 are unedited and that TL-1…TL-8 are implemented as ruled. Its findings besides the Medium above, all Low:
- **L-a: SC22 overstates.** The `waiting` block fires no event, because `CompletableTransaction` has no `onerror` slot. The real TL-1 guard is SC23 (M-SC22-ONERROR-NULL is red on SC23 only). Affected: the SC22 title, doc 236 stage-3 lines that cite "SC22, SC23" for the error-event rule, and the TL-1 row of `sketch-review.md`.
- **L-b: the quota-retry `cancelled()` check (l.344–346) has no row.** **A ran this mutant:** the check removed, stem-cache 31/31 green (`a-round-367/mutants/own-M-L3-RETRY.diff.txt` and `.log`). The source was restored, `cmp` OK, and `git diff -- app` equals the patch again. Doc 236 credits SC24 with "including the quota retry". The reviewer also says the early return at l.312 is effectively untested, because l.323 still blocks the write. That is **reviewer inference, not run by A**.
- **L-c: `idle()`'s `deletes` wait (l.478) has no row of its own.** M-IDLE-NO-DELETES removes l.478 and l.479 together.
- **L-d: there is no cancel check between victim deletes** (l.326–328). SC24 has only one victim.
- **L-e: TL-5 wording.** The integrity `remove()` re-reads the record, so racing a just-committed same-key put deletes the new valid record (the result is still a miss, not corrupt). Optional fix: delete with the record that `get` already holds.
- **L-f: doc 236.**
  - The stage-1 testing "limitation" line (browser `get` integrity only in browser rows) is not marked as superseded.
  - The stage-1 mermaid still shows "delete entry → network response" in the old order.
  - The stage-3 file list omits `type CompletableTransaction` from the new imports.
  - The probe line says `nosize` is red on truncate only. `probe/probe-summary.txt` l.28–29 shows it red on delete-file too ("failed to load", no-play). However, the phases share one context, and in the delete-file phase middle-east still carries the truncated file from phase 2 (304, not re-stored). So the delete-file redness is carry-over from truncate, not an independent detection. The doc's wording "truncate is red" is therefore not an understatement of independent coverage.
  - The l.4 status can only be true after C passes (L28 form, expected).
- **L-g: SC26 `x-injected` assert** (`stem-cache.test.ts` l.1169) can never fail. The `content-type` assert does the work.

**Architecture note (for B/root, not acted on):** `createCachedSourceFetch` l.293–303 and l.358–367 were changed in rounds 365, 366 and 367, and gained new session state (`commitChain`, `deletes`). The reviewer's verdict is to keep it: it is one session lifecycle and well covered. It is routed to the existing ARCH-CHECKPOINT-PERF9-STEM-CACHE. No extraction was done.

## Changed files (exactly the 3 of §1.1)
- `app/lib/arrangement/stem-cache.client.ts`: the sketch, verbatim.
- `app/lib/arrangement/__tests__/stem-cache.test.ts`: the sketch, verbatim (SC22–SC29, `installFakeBrowserStorage`, the `transactionDone` import).
- `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md`: stage 3 and the l.4 status.

No protected file, config, `package.json`, `perf/**` or other `app/**` change (K7 = 0, K12 OK).

## Known gaps
- A-R367-REVIEW-DEDUP-CANCELLED-WRITE is open (the STOP).
- Reviewer Lows L-a…L-g are not applied.
- B acceptance criteria marked passed: only the rows marked PASS above. A-REVIEW is not passed, and A-DOC is pending re-dispatch.

## Next C checks (after B rules / re-dispatches)
- If option 1: C runs §2.2 as written: CLAIMS, SOURCE-SCOPE, UNIT 31/31, MUTANT-OWN, INTEGRITY and VALIDATOR at both viewports, PLAYBACK-EXPORT (record), G367-AUTH, DOCS.
- If option 2 or 3: also the new SC row and its mutant, and a re-run of the mutants on any row that was touched.
- C's MUTANT-OWN should not reuse own-M-L3-RETRY: A already ran it, and it is green 31/31, a known coverage gap. Pick another mutant from the §2.2 examples (`touch` put outside `onsuccess`, or `deleteAfterPendingWrite` skipping the pending-write wait).
