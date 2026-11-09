# Round 419: SYS-R369-STEM-CACHE-WRITE-COORDINATOR — the stem cache gets one per-key operation model, an integrity delete that only removes what it read, and unique file names (closes 8 Lows)

**Planned by:** B, at the round 418 → 419 planning, 2026-11-09 (`b-round-418.md`). The advisor was used after orientation. The round-418 task is archived as `tasks/round-418.md` [K13].

## Read first
- `lessons.md` in full. Most relevant here: L4, L10, L11, L22, L23, L26, L28, L29, L31, L37, L38, L52, L56, L57, L58 (review = dispatched sha, ordering matrix, `l58-check`), L59, L60.
- Primitives: `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `API_ERROR_HANDLING.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-418/claims-419.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-418/claims-419-planning-output.txt` (stderr empty).
  - Sketch output on B's scratch: `b-round-418/claims-419-sketch-output.txt` (stderr empty).
  - Expected differences: `b-round-418/claims-419-planning-vs-sketch.diff` (K1 is the scratch commit; K2 is the scratch's 2 ` M` lines; K5 is `no` because the patch is already in; K9/K10 are the sketch counts).
- **Sketch review (L58):** `b-round-418/sketch-review.md` names the dispatched sha256, holds the per-key ordering matrix and the verdict. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `3579fcc`, clean tree
- **Gate 418 is `published`** at `3579fcc` [K7]. HEAD is `3579fcc…` [K1] and the tree is clean (K2 `total 0`).
- `context/head-sha.txt` may still say `061068d` (written before the gate commit). It is stale; K1 is the baseline.
- **Frozen:** `b-round-418/r419-frozen-sha256.txt` has **1,316** entries: every tracked file except the 2 granted source/test files. `sha256sum -c` rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `3579fcc` at A1 (root published in between), A re-runs the claims and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 418 passed:** C PASS, `browserVerified` true, gate 418 published `3579fcc` (D-29z1458). SYS-R416-PREVIEW-CONTROLLER is done.
- **Next in the recorded order (D-29z1457, D-29z1461): SYS-R369-STEM-CACHE-WRITE-COORDINATOR**, the L46 default of ARCH-CHECKPOINT-PERF9-STEM-CACHE (D-29z1374). B searched the loop folder for a root answer on 2026-11-09 and found none, so the code stays in `stem-cache.client.ts` (no sibling module).
- **Why before STEM-LANES:** public demo previews load through `publicPreviewSourceFetch` → the stem cache [K9 demo-import]; purchased stems use their own `fetchAudio`. STEM-LANES adds a whole stem set at once, so several keys go through the same commit chain together. The per-key model lands first.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **Schedule:** REGRESSION is not due (`regression-last.json` 2026-11-07, due on or after 2026-11-10) [K8]. It is the next round if the next planning is on or after 2026-11-10. The next RETRO is round 431.
- **Round-418 findings (all Low), ruled in D-29z1459:** A-R418-REVIEW-L1/L2/L3, their C confirmations and GATE418-L4 → `deferred_low_polish`. The reviewers' Architecture note is recorded as signal SIG-R418-PREVIEW-CONTROLLER-EXTRACT, not scheduled.

## 1. What the code does today (all tagged; K9 counts the HEAD lines)
`createCachedSourceFetch` keeps a `writes` map [K9 writes-map = 1] and a separate `deletes` set [K9 deletes-set = 1]. The browser store's `get` deletes a damaged entry with `remove(key)` [K9 integrity-remove-key = 2]. Eight problems follow:
1. **A-R368-REVIEW-L1:** a hit 200 starts write W; a hit 404 queues a delete after W; a third storable 200 **joins W**. W lands, then the delete runs, so the key ends absent (HEAD before round 368 kept it).
2. **B-R367-TL3-1:** a load that joins a write after that write already decided to abandon (all signals aborted) is lost. It needs a joiner inside a microtask gap, so it is unreachable in a browser today.
3. **A-R367-REVIEW-L-c:** `idle()`'s wait on deletes has no row of its own.
4. **A-R367-REVIEW-L-d:** the victim loop has no `cancelled()` check between victim deletes [K9 victim-loop-unchecked = 1].
5. **A-R367-REVIEW-L-e:** an integrity miss calls `remove(key)`, which re-reads the record. If a same-key put committed meanwhile, the new valid record and file are deleted.
6. **GATE368-L1:** on a failed put, `removeFile(record.fileName)` deletes the file the previous record still points to when the two names are equal. Names are `time-random` [K9 name-no-counter = 1], so equal names are possible in one millisecond only by chance.
7. **A-R368-REVIEW-L3:** the chain-start `cancelled()` check has no mutant.
8. **A-R367-REVIEW-L-g:** SC26's `x-injected` assert can never fail [K9 x-injected = 1].

## 2. Rulings (B, D-29z1460; details and the ordering matrix in `b-round-418/sketch-review.md`)
1. **One per-key operation map.** `writes` and `deletes` become `operations: Map<key, write | delete>`. A write holds `signals` and an `open` flag; a delete holds only its `done`. An operation leaves the map only if it is still the current one for its key (`settle`).
2. **Tombstone (A-R368-REVIEW-L1).** A storable response joins a pending write only while that write is `open`. If the key's current operation is a delete or a closed write, the response starts its own write. Its body is read at once; its commit waits for the previous operation's `done`. So 200 → 404 → 200 ends with the third response stored (SC34).
3. **Atomic close (B-R367-TL3-1).** A write sets `open = false` in the same synchronous step as its abandon decision, so no later load can join a write that has given up. MU-JOIN-IGNORES-OPEN is an **accepted equivalent mutant**, for a structural reason (tech-lead, TL-R419-L1): between the moment `abandoned()` sets `open = false` and `settle()`, no path waits on a store or network call, and a joiner can only arrive from a task (a fetch or IndexedDB event), so none can run in that window. `open` stays as insurance: an awaited cleanup added later after a `cancelled()` return would make the mutant live. The mutant is recorded green in the summary.
4. **`idle()` (A-R367-REVIEW-L-c)** waits in a loop until no per-key operation is left, then for the commit chain. SC35 pins it; MU-IDLE-WRITES-ONLY turns SC25, SC32 and SC35 red, and MU-IDLE-COMMIT-ONLY turns 14 rows red. **Accepted behaviour change (TL-R419-L3):** `idle()` now also waits for operations started after it was called (HEAD waited on a snapshot). It has no production caller (tests and teardown only).
5. **Victim loop (L-d).** `cancelled()` is checked before each victim delete (SC36).
6. **Integrity miss deletes only what it read (L-e).** `get` uses `removeIfCurrent(record)`: one `readwrite` transaction reads the key and deletes it only if its `fileName` equals the one `get` read; then that file is removed (SC37; SC15 and SC28 unchanged). `delete(key)` (used for victims and 404s) is unchanged.
7. **Unique names and a name guard (GATE368-L1).** File names become `time-counter-random` (a per-session counter; the first segment stays the base-36 time that `sweep` reads) (SC38). The browser store's `put` rejects with `InvalidStateError`, before touching any file, a record whose `fileName` equals the stored record's (SC39). The write path then turns the store off (non-quota error), which is the existing rule for any failed put; with unique names it is unreachable in one session.
8. **SC40** pins the chain-start check (A-R368-REVIEW-L3). **SC26** replaces the vacuous assert with `expect([...served.headers.keys()]).toEqual([])` (L-g). Every other assertion in SC26 is kept; this is a stronger replacement (L4).
9. **SC41 is a lock row:** the cached fetch exposes exactly `{ fetchSource, idle }`.
10. **GATE368-L3 (queued buffer retention) is not in this round** (D-29z1460). A cap needs a measured limit: the number of preview stems that load together, which STEM-LANES changes. It is re-ruled at STEM-LANES planning with a measured count. The per-key model already limits a key to one pending buffer.
11. **No user-visible change.** Browser rows equal HEAD (row 4). Every other existing `it()` body is byte-identical to HEAD; the test file also gains a `holdNextGetFile` hook on the fake OPFS harness.
12. **Doc:** `270-sys-stem-cache-write-coordinator.md` [K6: 269 is the last].

## 3. What A changes (sketch `b-round-418/sketch-419.patch.txt`, sha256 `fb665319…` [K11]; generators `b-round-418/make-sketch-src.py` and `make-sketch-test.py`; the patch is the Biome-formatted result)
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-418/sketch-419.patch.txt`, then `git apply ../tmp/studio-real-loop/b-round-418/sketch-419.patch.txt` (2 files). **Do not edit those two files afterwards.** If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11); do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/270-sys-stem-cache-write-coordinator.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** Completed (C round 419 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings in order (L26).
   - Content: rulings 1–12; the 8 closed ids, each with its row; the `open` invariant of ruling 3 in its own paragraph (the structural reason and why `open` stays); the `idle()` drain change of ruling 4; the known gaps TL-R419-L4 (a joiner lost when the first load aborts during the shared body read; a newer 200 joining an open write stores the older bytes; a throwing injected `now()`) and GATE368-L3 (both buffer-holding points: `await after` and the commit chain) as TODO items with their reasons; a mutant block that copies the lines of `b-round-418/mutants/summary.txt` byte for byte; a Mermaid diagram of the per-key states (write open → closed/landed, delete queued → landed) and the commit chain.
   - It cites only rows and files that exist (L26).
4. Write `a-round-419.md` as you go: changed files, each check with its rc and log path (`a-round-419/`), reviewer findings, and a For B section with any Architecture note.

## 4. Grants (`b-round-418/grants-419.txt`, 3 paths)
- `app/lib/arrangement/stem-cache.client.ts` (sketch only)
- `app/lib/arrangement/__tests__/stem-cache.test.ts` (sketch only)
- `docs/implementation/2026/quarter-IV/270-sys-stem-cache-write-coordinator.md` (new, whole)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 2 ` M` lines and 1 `??` line.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-418/claims-419.sh` at start | Equals `claims-419-planning-output.txt`; stderr empty |
| A2 | `npx vitest run app/lib/arrangement/__tests__/stem-cache.test.ts app/lib/arrangement/__tests__/source-fetch.test.ts` | rc 0; **2 files, 49/49** (stem-cache 43 = HEAD 35 + SC34–SC41; source-fetch 6). B ran this exact command on the sketch: 49/49 (`b-round-418/precheck-a2.log`). The stem-cache file alone, loaded with 2 busy loops: 43/43 in 1.6 s (`b-round-418/precheck-loaded.log`); the last gate ran it in 403 ms (`gates/round-418/verify.log`), far under the 5 s default timeout (L31) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`b-round-418/precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info, the same as HEAD (`b-round-418/precheck-lint.log`) |
| A4 | `npx biome check` on the 2 granted code files | rc 0, no fixes (`b-round-418/precheck-biome2.log`) |
| A5 | Claims at end | Differs from the planning output only in K2 (`1 ?? 2 M total 3`), K5 (`no`), K6 (doc 270 l.4), K9 and K10 (equal to the lines in `claims-419-sketch-output.txt`). K3 1,316 rc 0, K4 rc 0, K2b 0 |
| A6 | `code-reviewer` on the diff and doc 270 (3 files) | No Critical/High/Medium in the sketch logic (otherwise STOP, L11). Rulings 1–12 are not new findings. Fix doc findings in the doc |

**Sketch review (L58):** `tech-lead` — **approve with changes**, documentation only (TL-R419-L1…L4, ruled in `b-round-418/sketch-review.md`; the doc items are in step 3 above).

## 6. C's acceptance
**Before hand-off:** write `c-round-419.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-418/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-419.json c-round-419/l57-check.txt`.

**Order (L59):** row 3 (mutants), then rows 4, 5 and 6 (browser), then the rest. Write `c-round-419/progress.json` after every row. Never run vitest or a build while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation, **stderr is empty**, and K19 prints `L58 OK`. K14 lists all 9 ids with a status, none `NOT-FOUND`. Status = the 3 granted paths. Frozen 1,316 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-419.patch.txt` to a `git archive HEAD` scratch and `cmp` the 2 files against the working tree: identical. A2's command gives 49/49. `git diff -U0` on the test file removes exactly 1 line (the SC26 `x-injected` assert) and otherwise adds only the `holdNextGetFile` harness lines, the SC26 replacement and the appended `SYS-R369` describe block; equal to B's `b-round-418/precheck-testdiff.txt` (6 hunks) |
| 3 | **MUTANTS** | The scratch base must be **HEAD, with nothing applied**: `git archive HEAD \| tar -x -C /tmp/c419-scratch`, symlink `node_modules`, then `git init && git add -A && git commit`. Copy `b-round-418` to `c-round-419/b418copy/` (with `sketch-419.patch.txt` and `mutants/run.py`) and run `python3 -I c-round-419/b418copy/mutants/run.py /tmp/c419-scratch $PWD/c-round-419/b418copy`. The script checks the HEAD base, applies the sketch itself, and writes `summary.txt` into `<arg2>/mutants/`. Never write into `b-round-418/`. **Pass = the same lines as B's `summary.txt`** (table in section 7). Then add **one C-own loaded replicate**: run the stem-cache file with 2 × `node -e "for(;;){}"` in the background, 43/43 (L37) |
| 4 | **STEM-CACHE BROWSER (behaviour unchanged)** | Real Chromium on a **production build**, as rounds 366–368 ran this probe, **1440×900 and 1280×720**. Copy `b-round-418/probe/` to `c-round-419/probe/` and B's HEAD results `b-round-418/probe/out/head/*.json` to `c-round-419/probe/out/head/`. From the loop folder: `bash c-round-419/probe/run-probe.sh <tree> sketch 5182 $PWD/c-round-419/probe/out`, where `<tree>` is a `git archive HEAD` copy **with the working-tree versions of the 2 granted files copied in** (node_modules symlinked; do not build inside `store/`). Then `python3 -I c-round-419/probe/compare.py c-round-419/probe/out`. **Pass: `ALL EQUAL`** (compare.py also fails unless every sketch phase is ready with `starts` 1 and a peak > 0, 0 page errors and new-form names). Four phases per viewport: cold (both previews stored), truncate (a cut OPFS file → re-stored under a new name), delete-file (a missing file → re-stored), stale-etag (changed validator → one 200, re-stored); each with playback (starts 1, a non-zero peak) and 0 page errors. The sketch's file names have the `time-counter-random` form (an `INFO` line, part of the pass). Screenshots per phase are written beside the JSON. A first cold load that times out is environment-invalid and is retried (at most twice) |
| 5 | **PLAY-STOP SMOKE** (browser, both viewports) | On the root dev server `:5173`, with a demo clip: Space plays; the position advances (≥ 1 s of wallclock ≈ ≥ 0.9 s of position, L48); Space stops and the position is frozen for 500 ms; 0 page errors (ignore the documented cloud cart and connection errors) |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy the auth probe from `c-round-418/` or `c-round-416/scripts/`. Demo `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` without auth → 401. **BLOCKED:** the fake-bearer path (backend unavailable in the cloud) |
| 7 | **DOC** | Doc 270 l.4 is byte-exact `**სტატუსი:** Completed (C round 419 PASS)`; the 7 TEMPLATE headings are in order; its mutant block equals `b-round-418/mutants/summary.txt` byte for byte; the 8 closed ids each name an existing SC row (B-R367-TL3-1 names ruling 3 and the accepted-equivalent mutant with its structural reason); the `idle()` drain change is stated; GATE368-L3 (with both holding points) and the three TL-R419-L4 gaps are TODO items; every row id it cites exists. No other doc differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end; end claims equal start claims; `git diff HEAD --stat` lists only the 2 granted files; `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch full run: `b-round-418/precheck-full.log` [K18] |

**Retries (rows 4–6):** a cold-server first load or a port in use is an environment problem (L38). Retry at most twice; it is never a FAIL.

## 7. The new rows and their mutants (`b-round-418/mutants/run.py`; logs in `b-round-418/mutants/`)
| Row | Closes | What it proves | Red under |
|---|---|---|---|
| SC34 | A-R368-REVIEW-L1 | 200 → hit 404 (delete queued behind the pending write) → storable 200: the key ends stored with the third body; log `put, delete, put` | MU-HEAD-SRC, MU-WRITE-NOT-AFTER-DELETE |
| SC35 | A-R367-REVIEW-L-c | `idle()` stays pending while a delete waits for a same-key write still reading its body, and while the delete itself is held | MU-IDLE-COMMIT-ONLY, MU-IDLE-WRITES-ONLY |
| SC36 | A-R367-REVIEW-L-d | an abort during the first of two victim deletes stops before the second victim and the put | MU-HEAD-SRC, MU-NO-VICTIM-LOOP-CHECK |
| SC37 | A-R367-REVIEW-L-e | fake IndexedDB + OPFS: an integrity miss racing a same-key put keeps the new record and file | MU-HEAD-SRC, MU-INTEGRITY-REREAD, MU-INTEGRITY-NO-CHECK |
| SC38 | GATE368-L1 | same clock value and random part: two writes get two different names; the first segment is the base-36 time | MU-HEAD-SRC, MU-NAME-NO-COUNTER |
| SC39 | GATE368-L1 | fake IndexedDB + OPFS: a same-name put is refused before the file is touched; the old entry stays readable | MU-HEAD-SRC, MU-PUT-NO-NAME-GUARD |
| SC40 | A-R368-REVIEW-L3 | a queued write whose load aborts before its turn calls neither `list` nor `put` | MU-NO-CHAIN-START-CHECK |
| SC41 | (ruling 9, lock) | the public surface is exactly `{ fetchSource, idle }` | none (lock row) |
| SC26 (changed assert) | A-R367-REVIEW-L-g | a stored content type that `Headers` rejects is served with no header at all | MU-SERVED-EXTRA-HEADER (with the HEAD test file the same mutant stays green: MU-SERVED-EXTRA-HEADER-HEAD-TEST) |
| (ruling 3) | B-R367-TL3-1 | `open` closes in the same step as the abandon decision | MU-JOIN-IGNORES-OPEN: accepted equivalent (green) |
| SC28 (unchanged) | ruling 6 | the integrity path still removes the damaged file | MU-INTEGRITY-NO-FILE |

**Neighbouring behaviour that could break:**
- joins and aborts: SC17, SC30, SC31 (a load that joins before the abandon decision still revives the write);
- 404/410/unstorable deletes behind a write: SC9, SC21, SC25, SC32;
- quota retry and eviction: SC4, SC11, SC27, SC33;
- integrity: SC15, SC28; browser store commit order: SC23;
- the demo collection load through `publicPreviewSourceFetch` (row 4) and playback (rows 4–5).

**Ableton conformance:** does not apply (a cache-internal fix round; no user-visible behaviour). **Reference-first / `product-designer` / screen budget:** N/A (row 4 proves equality with HEAD).
