# CURRENT TASK — Round 368: PERF-9b-ii re-dispatch. A same-key load joins the pending write (C-R367-DEDUP-CANCELLED-WRITE); doc 236 Completed

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 367 → 368 planning (`b-round-367.md`).

**Decisions** (`backlog.json` → `decisions_log_b`, v330 → v331):
- **D-29z1206:** round 367 = C FAIL.
  - A STOPped, and C reproduced the Medium.
  - The browser rows passed on v2, but PERF-9b-ii is not done.
  - Gate 367 was skipped. The baseline stays `d53d113`, and the round-367 tree (v2 + doc 236) is uncommitted.
- **D-29z1207:** the reviewer Lows L-c, L-d, L-e and L-g, plus TL3-1, go to `deferred_low_polish`.
- **D-29z1208:** this round's scope (§1) and B's pre-check (§0).
- **D-29z1209:** RETRO moves to **369** (window 353–368). The tree holds unpublishable work and C bugs come first. REGRESSION is due on or after 2026-11-08.

**Why this round, now.**
- Round 367 left a Medium (C-R367-DEDUP-CANCELLED-WRITE) in uncommitted work. A RETRO round changes no code and could not close it.
- No Critical or High is open. The five other open Mediums are tech-lead-manual, awaiting_user or open_root.

**Read first:**
- `lessons.md`. A reads 10, 11, 12, 23, 26, 28 and 58. C also reads 22, 29, 38, 56, 57, 59 and 60.
- This task.
- `b-round-367/sketch-review.md`: the L10 ruling, the ordering table and the tech-lead rulings.
- `b-round-366/sketch-review.md`: the TL-1…TL-8 rulings, which still hold.
- Primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `ERROR_TAXONOMY.md` (no new codes), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the YouTube request and the screen budget. This is storage hardening behind the demo preview loader; nothing on screen changes. Ableton conformance: not applicable.

## Baseline
- HEAD is `d53d113`. Gate 367 was skipped; gate 366 published [K1].
- The status shows exactly 3 changed files: `stem-cache.client.ts`, `stem-cache.test.ts` and doc 236 [K2, K7].
- `git diff -- app` equals `b-round-366/sketch.patch.txt` (v2) [K18].
- Protected files: 11/11 OK [K12]. No dependency change [K14].
- `stem-cache.client.ts` in the tree [K3, K5]:
  - `writeInBackground` skips on `writes.has(key)`;
  - 3 functions take `signal: AbortSignal | null | undefined`;
  - there is no join;
  - `cancelled()` is used 4 times.
- `stem-cache.test.ts` in the tree has 31 `SC` rows, 3 `describe` blocks and no SC30–SC33 [K10]. The gate-366 verify log shows 23 tests in 96 ms, so timeout headroom is ample (L31) [K11].
- Doc 236 [K13]:
  - l.4 is `Completed (C round 367 PASS)`, which is wrong now (C-R367-STATUS-LINE-PREMATURE);
  - it has 7 headings;
  - "SC22, SC23" is credited 3 times (L-a).
- **Root lanes (2026-11-05 parallel policy).** A HEAD that descends from `d53d113` only through other paths is an allowed delta, not a STOP; K2's hash may then differ. Other paths are `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx`, and `docs/` other than doc 236.

## 0. Premises and B's evidence

### 0.1 L10 ruling on round 367's STOP
**C-R367-DEDUP-CANCELLED-WRITE (Medium) is fixed in this round with a join design.**
- A's option 1 (accept as Low) and option 3 (abort listener) are rejected. The reasons are in `b-round-367/sketch-review.md`.
- The ordering table there compares every same-key/abort ordering with HEAD `d53d113`. v3 stores in every ordering where HEAD stored.
- The only accepted loss is "load 1 aborted while its body is still being read". HEAD loses that case too.

### 0.2 B's sketch v3 (L58)
**The patches.** Apply `b-round-367/sketch-delta.patch.txt` on the current tree. The result equals `b-round-367/sketch.patch.txt` against `d53d113`. The shas are in `b-round-367/sketch-dispatched.sha256` [K19].

**Runs on the scratch** (`git archive d53d113` plus the full patch):
- covering: stem-cache 35/35 and source-fetch 6/6 (`b-round-367/sketch-covering.log`);
- `npm run typecheck`: rc 0 (`sketch-typecheck.log`);
- Biome on both files: rc 0 (`sketch-biome.log`);
- full suite (L23) on the final sketch: 250 files / 3688 tests, rc 0 (`b-round-367/precheck-full.log`). The run before the last two test-only edits was 250 files / 3688 tests, rc 0 (`precheck-full-pre-tl.log`).

**Proof that the rows catch the bug.** The v2 client (the round-367 tree) run against the v3 tests is red on **SC30 and SC31 only** (`b-round-367/mutants/round367-client-vs-v3-tests.log`). C's own round-367 DEDUP probe on the v3 scratch gives P1 and P2 `storedA=true putCalls=2` (`b-round-367/dedup-probe-v3.log`).

**Mutants.** There are 19, each red on its row. Summary: `b-round-367/mutants/mutant-summary.txt`. Diffs and logs: `b-round-367/mutants/`. Generator: `b-round-367/mutate.py`. They are the 13 round-366 mutants regenerated on v3, plus these:

| Mutant | Red on |
|---|---|
| `M-V2-NO-JOIN` | SC30, SC31 |
| `M-V2-SOME` | SC30, SC31 |
| `M-V2-LAST-SIGNAL` | SC31 |
| `M-C367-DELETE-SKIPS-PENDING` (C's round-367 green mutant) | SC32 |
| `M-L3-RETRY` (A's round-367 green mutant) | SC33 |
| `M-SC32-NO-WRITE` | SC32 and others |

**Browser probe.** B ran a production build of v3 with `b-round-366/probe/stem-integrity-probe.mjs` at 1440×900 and 1280×720 (`b-round-367/probe/sketch-*.json`, `.summary.txt`). The results match C round 367:
- every phase is ready and plays: pos ≈ 00:02.77, peak 0.31, starts 1;
- truncate and delete-file are re-stored after a 200;
- stale-etag: `If-None-Match "b366-stale"` returns 200 and the stored ETag is updated.

The dedup race has no deterministic browser trigger: it needs an abort between the body read and the queued commit, followed by a same-key reload. The unit rows prove it. The browser rows guard the loader against regression.

**Review.** tech-lead reviewed the **final** v3 sketch: the round-367 lesson is that the dispatched sketch must be the one that was reviewed (L58). It found no Medium+. Its findings TL3-1…TL3-4 are ruled in `sketch-review.md`; TL3-2 and TL3-3 are already fixed in v3.

## 1. Scope (A)

### 1.1 Files (exactly the same 3)
| File | Change |
|---|---|
| `app/lib/arrangement/stem-cache.client.ts` | `b-round-367/sketch-delta.patch.txt`, verbatim |
| `app/lib/arrangement/__tests__/stem-cache.test.ts` | the same delta, verbatim: the SC22 title is narrowed and new rows SC30–SC33 are appended to the third `describe`. **No other row (SC1–SC29) is edited or removed.** |
| `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md` | §1.3 |

**How to apply:**
1. Check the delta's sha256 against `sketch-dispatched.sha256`.
2. Run `git apply b-round-367/sketch-delta.patch.txt` on the current tree. Do not reset first.
3. Check that `git diff -- app | cmp - b-round-367/sketch.patch.txt` reports them equal (K18).

**Limits on changes.**
- A may change the sketch only to fix a code-reviewer finding that neither `sketch-review.md` rules on.
- That change is a STOP if it changes a ruled behaviour (L11). Otherwise A re-runs the mutants of every row it touched and sends the files back to the reviewer.
- No other change to `app/**`, `perf/**`, config, `package.json` or protected files. `stem-cache.ts` and `source-fetch.ts` stay as they are [K7].

### 1.2 Behaviour contract (what C checks)
Items 1–6 of task 367 §1.2 (`tasks/round-367.md`) are unchanged: commit-resolved writes, abort and disable re-checks, non-blocking hit deletes, guards, per-session serialisation, and browser-store integrity. Rows SC22–SC29 cover them. This round adds three items.

7. **Join (C-R367-DEDUP-CANCELLED-WRITE).**
   - A storable same-key load that arrives while a write for that key is pending starts no second write; it adds its signal to the pending write.
   - The pending write is cancelled only when **every** joined signal is aborted, or when the store is off. A load without a signal keeps the write alive.
   - **SC30** has two shapes: load 1 is aborted after its body was read, either behind a held sweep or behind another key's held put. In both, load 2 joins, A is stored and `put:/a.mp3` runs once.
   - **SC31** has three parts:
     - load 2 joins, then load 1 aborts: stored, put once;
     - both loads abort: nothing stored;
     - load 1 stays live and the joining load aborts: stored.
   - SC17 stays green: two live misses give one put.
8. **Delete after a body-reading write (C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN).** A hit 404 that arrives while a same-key 200 is still reading its body deletes after that write's put: the put happened, and the key ends absent. Row: **SC32**. This is a coverage row; v2 already passed it.
9. **Quota-retry cancel (A-R367-REVIEW-L-b).** An abort during the quota-retry eviction makes no retry put. Row: **SC33**.

**Accepted behaviours** (C does not fail these):
- Load 1 aborted while its body is still being read: nothing is stored, the same as HEAD.
- A hit 200 with a newer ETag that joins an older pending write: the older bytes are stored, the same as HEAD. The next conditional request heals it.
- TL3-1: a join in the microtask gap after a write's last `cancelled()`. This is unreachable in a browser.
- The trade-offs accepted in round 367: TL-3, and stale data before `idle()`.

### 1.3 Doc 236 (Georgian, technical terms in English)
- **l.4** is exactly `**სტატუსი:** Completed (C round 368 PASS)` (L28). This closes C-R367-STATUS-LINE-PREMATURE.
- **l.5** names stage 3 as rounds 367–368.
- **Stage-3 content goes under the existing headings:**
  - **მიდგომა:** add contract item 7 (the join) and the ordering table in short form: (a), (b), (b'), (b''), and (c) accepted, equal to HEAD.
  - **პრობლემები და გადაწყვეტები:** add C-R367-DEDUP-CANCELLED-WRITE as Problem → Solution, comparing HEAD, v2 and v3. Do not call the join airtight (TL3-1).
  - **ტესტირება:** add SC30–SC33 by id, the 19 mutant ids with their red rows exactly as in `b-round-367/mutants/mutant-summary.txt`, B's and C's browser rows, and "SC30/SC31 are red on the v2 client".
- **Claim fixes (L26; A-R367-REVIEW-L-a, L-f):**
  - Credit the error-event rule to **SC23 only**: `grep -c 'SC22, SC23'` must return 0.
  - Credit "including the quota retry" to **SC33**.
  - Mark the stage-1 limitation "browser store `get` integrity only in browser rows" as superseded by SC28.
  - The stage-1 mermaid must show the response returned first and the delete queued after it, or be labelled "stage 1, superseded by stage 3".
  - The stage-3 import list names `type CompletableTransaction`.
  - The `nosize` probe line matches `b-round-366/probe/probe-summary.txt`: the delete-file redness is carry-over from truncate.
- **TODO:** keep the round-367 list. Add the five deferred Lows by id (A-R367-REVIEW-L-c, -L-d, -L-e, -L-g and B-R367-TL3-1-JOIN-MICROTASK-GAP) as `deferred_low_polish`.
- **Integrity checks:**
  - Every test id the doc names exists in the test file (L26).
  - The 7 TEMPLATE headings stay in order.
  - `grep -rl 'C round [0-9]* pending' docs/implementation` returns 0.
  - Doc 232 stays unchanged; it is tied to PERF-DRAG-PREVIEW [K13].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-367/claims-368.sh` | equals `b-round-367/claims-368-planning-output.txt` |
| A-CLAIMS final | same | Equal to planning: K1, K11, K12, K14, K19. K2 = `d53d113 3`. K7 all 0. K18 `app-diff-vs-full-sketch equal`. Equal to `b-round-367/claims-368-sketch-output.txt`: K3, K5, K10, K17. K13: l.4 as in §1.3, `pending 0`, stage-hits = `232-perf-drag-preview.md` only, headings ≥ 7, `sc22-credit 0`, `sc30-33-named` = SC30 SC31 SC32 SC33. K16 empty. |
| A-TESTS | `npx vitest run app/lib/arrangement/__tests__/stem-cache.test.ts app/lib/arrangement/__tests__/source-fetch.test.ts` | all green: stem-cache 35/35, source-fetch 6/6 |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-MUTANTS | For each `b-round-367/mutants/mutant-<id>.diff.txt`, run `patch app/lib/arrangement/stem-cache.client.ts < <diff>` (the explicit target ignores the diff's scratch paths), then the stem-cache test file. | Each is red on exactly its rows in `mutants/mutant-summary.txt`. Restore from a copy under `a-round-368/` and prove it with `cmp` (L60). Logs go under `a-round-368/mutants/`. |
| A-REVIEW | `code-reviewer` on the 3 files | No Medium+ that neither `sketch-review.md` rules on (STOP otherwise). Any edit after the review goes back to the reviewer (L11). |
| A-DOC | doc 236 | as in §1.3 |

A does not run the full suite, `npm run verify`, perf specs or browser probes. The gate and C run them.

### 2.2 C rows
**Order:**
1. CLAIMS, SOURCE-SCOPE, UNIT, DEDUP and MUTANT-OWN.
2. `npm run build`, then `PORT=5189 npx remix-serve build/server/index.js`, with output to `c-round-368/serve.log`.
3. One untimed warm-up load (L38).
4. INTEGRITY, VALIDATOR, PLAYBACK-EXPORT and G368-AUTH.
5. Stop the server **by its PID or port**. Never use `pkill -f` with a pattern that matches your own command line.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-367/claims-368.sh` | equals A's final run (§2.1) |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git diff --stat` | Exactly the 3 files of §1.1. `git diff -- app` is cmp-equal to `b-round-367/sketch.patch.txt`, or differs only by A's reviewed deltas listed in `a-round-368.md`. The test-file diff against `d53d113` removes no line outside the import block. |
| UNIT | the stem-cache test file | 35/35; SC1–SC29 bodies unedited apart from the SC22 title |
| DEDUP (C-R367-DEDUP-CANCELLED-WRITE) | C's own round-367 probe: append `a-round-367/dedup-probe-block.ts.txt` to a **scratch copy** of the final test file and run it | P1 and P2: `storedA=true storedB=true putCalls=2` (B once + A once), with exactly one `put:/a.mp3` in the printed log. B's run on the v3 scratch: `b-round-367/dedup-probe-v3.log`. Round 367 sketch: `storedA=false putCalls=1`. HEAD (`c-round-367/dedup-head.log`): P1 `putCalls=2`, P2 `putCalls=3`; HEAD's P2 wrote A twice (no chain; the dedup entry cleared before A2), v3 writes it once by joining. Scratch deleted (L60). |
| MUTANT-OWN (C's own, on a scratch copy, predicted first in `c-round-368/progress.json`) | One mutant that is not among the 19 and is not `own-M-L3-RETRY`. Examples: a joining load replaces the signals array instead of pushing to it; `write()` checks only the first signal after `arrayBuffer()`. | Red on the predicted row, or reported with counts if it stays green. Scratch deleted. |
| INTEGRITY (1440×900 and 1280×720) | `node b-round-366/probe/stem-integrity-probe.mjs http://127.0.0.1:5189 <w>x<h> c-round-368/integrity-<w>x<h>.json 1`; summarise with `python3 -I b-round-366/probe/summarize.py <json>` | **Every phase:** "Demo collection ready", 0 page errors, playhead past 00:02.5 after 2.2 s, `starts` = 1, max analyser sample > 0.01 (B measured 0.31). **truncate:** middle-east 200, re-stored under a new file name, size 4,054,080. **delete-file:** hero 200, re-stored, size 3,610,677. The other stem is 304. **After each phase:** 2 records and 2 OPFS files with equal sizes. If-None-Match and body bytes on miss requests are record only (L37). |
| VALIDATOR | the stale-etag phase of the same JSON | middle-east sends `If-None-Match: "b366-stale"` and gets 200; the stored ETag equals the response ETag; hero 304; plays |
| PLAYBACK-EXPORT (1440×900, record) | copy `c-round-367/export-trunc.mjs` | Record both WAV headers and sha256s. They were bit-identical in round 367. A difference is an observation (keep both files), not a FAIL. |
| G368-AUTH (both viewports) | copy `c-round-367/auth.mjs` | `/studio-lab` opens anonymously; `/studio/<id>` asks for sign-in and loads 0 audio sources; `/api/studio-token` without credentials returns 401 and no token. A fake-bearer 500 that fails closed goes under `blocked`. |
| DOCS | doc 236 | l.4 byte-exact; 7 `## ` headings in TEMPLATE order; every SC and mutant id named exists (L26); `sc22-credit 0`; the quota retry is credited to SC33; `grep -rl 'C round [0-9]* pending' docs/implementation` returns 0 |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke, `npm run test:perf`.

**browserVerified** is false if INTEGRITY (either viewport), VALIDATOR or G368-AUTH does not run. None of them needs the backend.

**L57 fields.** Write all of them in `c-round-368.json`, then run `python3 -I tools/l57-check.py c-round-368.json c-round-368/l57-check.txt` until it exits 0.
- `assertsSpecified`: SC30–SC33; DEDUP P1 and P2; INTEGRITY per phase; VALIDATOR.
- `mutantsRecorded`: the 19 sketch mutants (A's logs), the 2 round-366 probe mutant builds, and C's own.
- `mutantRedOnSketch`: `b-round-367/mutants/mutant-summary.txt`, `b-round-367/mutants/round367-client-vs-v3-tests.log`, `b-round-367/dedup-probe-v3.log`, `b-round-366/probe/mutant-nosize-1440x900.json`, `b-round-366/probe/mutant-nohitrestore-1440x900.json`.
- `gateChecksNamed`: full vitest, typecheck, biome.
- `gateChecksRunOnSketch`: `b-round-367/precheck-full.log`, `b-round-367/sketch-typecheck.log`, `b-round-367/sketch-biome.log`.
- `chainHeadGateRunGreen`: gate 366.
- `affectedChecksNamed`: the stem-cache test file; the integrity probe at both viewports.
- `affectedChecksRunOnSketch`: `b-round-367/sketch-covering.log`, `b-round-367/dedup-probe-v3.log`, `b-round-367/probe/sketch-1440x900.json`, `b-round-367/probe/sketch-1280x720.json`.

## 3. Neighbouring behaviour that could break
- **Demo loading:** every preview load goes through `cachedFetch`. INTEGRITY plays in every phase.
- **SC17 dedup:** two live loads give one put, and the row stays green. A joined load now keeps the write alive.
- **SC12, SC19 and SC24 (abort semantics):** a single aborted load still stores nothing, because `every` over one signal is that signal.
- **SC9, SC21, SC25 and SC29 (hit deletes):** `deleteAfterPendingWrite` now reads `writes.get(key)?.done`.
- **The round-366 perf spec** (`perf/studio-lab-stem-cache.perf.spec.ts`): a gate/root row.
- **Purchased adapter:** it never uses the cache. Purchase protection is covered by G368-AUTH.

## 4. STOP conditions (A)
- The delta does not apply, or its sha256 differs.
- A-CLAIMS pre mismatches, or A-CLAIMS final mismatches outside §2.1.
- Any change is needed outside the 3 files.
- A mutant stays green on its row.
- A covering test fails, or takes more than 50 % of its timeout (L11).
- code-reviewer reports a Medium+ that neither sketch review rules on, or whose fix would change a ruled behaviour.

## 5. Routed, not in scope
- **`deferred_low_polish` (D-29z1207):** A-R367-REVIEW-L-c, -L-d, -L-e, -L-g and B-R367-TL3-1-JOIN-MICROTASK-GAP. The 10 A-R366-REVIEW perf-spec Lows stay there.
- **ARCH-CHECKPOINT-PERF9-STEM-CACHE:** for root, non-blocking, after this round passes. It now also carries the round-367 architecture note as a signal.
- **RETRO 369 inputs:** B-R367-FINAL-SKETCH-UNREVIEWED, B-R367-MUTANTS-MISSED-INTERACTION, B-R366-*.
- **Next (D-29z1209):**
  1. RETRO 369 (window 353–368).
  2. REGRESSION, at the first planning on or after 2026-11-08 that is not the RETRO round.
  3. PERF-11, then PERF-12…15.
  4. SYS-R2-FAKE-FIDELITY, then SYS-CLOCK-DETERMINISM.
  5. STEM-LANES, then SYS-1…3.
  6. STORE-2b…5.
  7. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
  8. Phase 2 (skip rule).

  PERF-9c is awaiting_user; PERF-9d is with root.

## 6. Deliverables
- **A:** `a-round-368.md` with every §2.1 row, plus evidence under `a-round-368/`.
- **C:** `c-round-368.md` and `c-round-368.json` with all L57 fields, plus evidence under `c-round-368/`.

## 7. Claims
Run `bash b-round-367/claims-368.sh` from anywhere. Set `CLAIMS_STORE` to run it on a scratch copy.
- Planning output (current tree): `b-round-367/claims-368-planning-output.txt`.
- Sketch output (scratch, before the doc change): `b-round-367/claims-368-sketch-output.txt`.

| Tag | What it pins |
|---|---|
| K1 | gate 367 status; gate 366 status and commit |
| K2 | HEAD and the status entry count |
| K3 | counts of `requestToPromise(`, `'readwrite'`, `transactionDone(`, `commitChain` and `cancelled()` |
| K5 | `writes.has(key)`, the join push, `isStemWriteAbandoned(`, the `every` line, the `.done` wait, and the old `signal:` params |
| K7 | no change outside the 3 files |
| K10 | the SC row count, new rows SC30–SC33, the `describe` count, and the SC22 title |
| K11 | the gate-366 verify-log time of the stem-cache test file |
| K12 | protected files OK |
| K13 | doc 236: l.4, `pending`, stage hits, headings, the "SC22, SC23" credits, and the SC30–SC33 names |
| K14 | `package.json` and lock sha |
| K16 | every cited `b-round-367/` artifact exists |
| K17 | `idle()` callers in `app/**` (0), and the `transactionDone` export |
| K18 | `git diff -- app` compared with the full v3 patch and with the v2 patch |
| K19 | the sketch and delta sha prefixes |
