# A round 380 — PERF-12a: WAV export streams chunks, worker returns a Blob

**Status:** implementation complete; code-reviewer run twice (full review + delta re-review), every Medium fixed in A-owned test files, no source edit. No STOP (reasoning in §6).
**Store HEAD:** `ed634d5`, working tree = 19 status lines, all in `b-round-379/grants-380.txt` (`a-round-380/status.txt`; `comm` against the grants is empty).

## 1. Sketch application (§2.1)
- `b-round-379/sketch-dispatched.sha256`: 3/3 OK.
- `patch -p1` src → fakes → budgets applied cleanly, in order.
- `sketch-files-stable-sha256.txt`: 14/14 OK after the patches, and again after Biome and all my edits (§4).
- **No source edit beyond the patch.** I did not touch the 4 source files, the helper, the 7 fake files, track-pan or the budgets file by hand. Biome `--write` ran only on my 4 authored test files.

## 2. Changed files (19 = grants)
- **From the patches (14 stable + 2 later edited by me):** `export-wav.ts`, `export-wav.client.ts`, `export-wav.worker.ts`, `graph.client.ts`, `perf/budgets.resources.json`, `__tests__/helpers/fake-rendered-buffer.ts`, `export-range`, `master`, `clip-fades`, `envelope`, `track-group-mix`, `meter`, `track-meter`, `track-pan`, plus the fake hunks in `export-cancel` and `export-wav`.
- **Authored by A:**
  - `__tests__/export-wav.test.ts` (migration);
  - `__tests__/export-cancel.test.ts` (migration);
  - `__tests__/export-wav-in-place.test.ts` (rewritten to the SW1 writer rows);
  - `__tests__/export-wav-stream.test.ts` (new);
  - `docs/implementation/2026/quarter-IV/246-perf-export-wav-stream.md` (new).

## 3. Row map: old → new (§2.3)
| Old row (HEAD) | File at HEAD | New row(s) | File now |
|---|---|---|---|
| EW4 without a Worker global … identical bytes | export-wav | `SW1 without a Worker global the fallback returns a Blob whose bytes, peak and clipped equal the oracle` (3 chunks, copyFromChannel offsets, progress 0…1) | export-wav-stream |
| EW5 worker path posts transferred channels … terminates | export-wav | `SW2a begin has the exact shape, one chunk … terminates once` | export-wav-stream |
| EW5 worker error, onerror and onmessageerror … | export-wav | `SW2b …` (exact messages, terminate exactly 1, late ack ignored) | export-wav-stream |
| EW5 a Worker constructor that throws … | export-wav | `SW2c …` (+ no copyFromChannel) | export-wav-stream |
| EW7 worker module posts whole-percent progress … | export-wav | `SW3 begin is silent, each chunk acks …, complete carries a Blob with the oracle bytes` + `SW3 … each post the exact error` | export-wav-stream |
| EW8a … EW8e | export-wav | `EW8a SW5` … `EW8e SW5`, re-pointed: "progress" → "ack". EW8b is now two rows: (1) 3·65,536 frames, acks at 29 s and 58 s keep it alive past 30 s and 60 s, stall at 88 s; (2) the last ack (after `finish`) re-arms too. EW8d asserts the `copyFromChannel` count stays at 2 after the abort and a late ack | export-wav |
| EW8f | export-wav | unchanged | export-wav |
| EC4 pre-aborted signal … no Worker | export-cancel | `SW6 a pre-aborted signal …, constructs no Worker and copies nothing` | export-cancel |
| EC4 no-Worker fallback checks the signal | export-cancel | `SW6 the no-Worker fallback checks the signal before it encodes` (+ no copy) | export-cancel |
| EC4 abort mid-encode … later complete changes nothing | export-cancel | `SW6 an abort mid-stream terminates once, …, a late ack or complete changes nothing` (posts, copies and progress frozen) | export-cancel |
| EC4 removes the abort listener on complete and on a worker failure | export-cancel | `SW6 removes the abort listener …` (+ the second listener identity) | export-cancel |
| EC4 a 3-argument call behaves as before | export-cancel | `SW6 a 3-argument call streams as before …` + SW2a | export-cancel, export-wav-stream |
| IP1 bytes equal the oracle, report on unclamped samples | in-place | `SW1 writer bytes, peak and clipped equal encodeArrangementWav at lengths 1, 65,535, 65,536, 65,537 and 2·65,536+123`, `SW1 chunk sizes 1, 7, 65,536 and one whole chunk …`, `SW1 the data covers NaN, ±1.5, exactly MAX_24BIT_SAMPLE and −1 …` | in-place |
| IP2 the same arrays hold the clamped samples | in-place | **Retired by ruling** → `SW1 the writer leaves its input chunks untouched (replaces IP2 …)` | in-place |
| IP3 in-place progress never decreases and ends at 1 | in-place | `SW4 on the fallback …` (replaces IP3), plus two SW4 worker-path rows | export-wav-stream |
| IP4 worker module encodes in place … transfers only the bytes | in-place | both SW3 rows | export-wav-stream |
| IP5 encodeArrangementWav leaves input untouched, matches in-place | in-place | `SW1 encodeArrangementWav still leaves its input untouched and equals the stream writer (replaces IP5)` | in-place |

**Further new rows:**
- SW1: mono odd-length pad byte; early-chunk peak and clipped; late-chunk peak (review fix); length 0 / non-integer / bad channel count; empty, shape and too-many-frames errors; short finish; cumulative `written`; fallback rejecting length 0.
- SW2d (failing post 0–3, `finish` included), SW2e.
- SW4 ×2 on the worker path.
- SW7.

**Counts (`it(` / `expect(`), HEAD → A:**

| File | HEAD | A |
|---|---|---|
| export-wav | 18 / 100 | 15 / 90 |
| export-cancel | 19 / 63 | 19 / 73 |
| export-wav-in-place | 5 / 26 | 12 / 64 |
| export-wav-stream | — | 12 / 93 |
| **Total** | **42 / 189** | **58 / 320** |

export-wav falls because EW4, EW5 ×3 and EW7 moved to export-wav-stream.

**jsdom Blob reading:**
- `Blob.prototype.arrayBuffer` is undefined in this jsdom.
- `new Response(blob).arrayBuffer()` returns 13 bytes, the string `[object Blob]`. Measured with a temporary probe test that I deleted.
- So neither of the task's two options works. The tests read Blobs with the existing **FileReader** `blobBytes` helper, the same one the EW6 rows use.

## 4. Checks run (A, speed rules)
- `npm run typecheck`: rc 0 (`a-round-380/typecheck.log`).
- `npm run lint`: rc 0, 205 warnings and 1 info (`a-round-380/lint.log`). The run reports warnings for the whole repository. Biome on my files is clean.
- `npx biome check` on the 4 source files, the helper and my 4 test files: clean. `--write` was applied to my 4 test files only.
- `node -e JSON.parse(perf/budgets.resources.json)`: ok.
- **perf `lib` tests** (scratch config `b-round-334/vitest.perf-lib.config.mjs`, GATE304-M1): 2 files, 40/40 pass (`a-round-380/perf-lib.log`).
- **Covering set** (`grep -rlE "renderArrangementWav|export-wav|startRendering" app …`): 32 files, i.e. HEAD's 31 plus `export-wav-stream.test.ts`. Final run after the review fixes: all 32 pass, 511/511 tests (`a-round-380/vitest-covering.log`, `vitest-covering.json`, `covering-files.txt`).
- **Shuffle:** the 4 migrated/new files with `--sequence.shuffle --sequence.seed=42` pass 58/58 (`a-round-380/vitest-shuffle42.log`).
- **Timeouts (L31):** from `vitest-covering.json`, the slowest test is master-ui at 1.76 s, against its declared 15 s. Next are export-dialog-tab-stops TR1 at 0.97 s and export-dialog-focus at 0.88 s, against the default 5 s. No test is above 50 % of its timeout.
- **Scope:**
  - `sha256sum -c --quiet r380-frozen-sha256.txt`: rc 0.
  - `sha256sum -c --quiet b-round-318/protected-sha256.txt`: rc 0.
- **Claims** (`bash b-round-379/claims-380.sh` → `a-round-380/claims-380-A.txt`):
  - K3, K5 and K6 are empty, and K8 lists only the 2 dialog files, all as on the sketch. K11 is 14/14.
  - K7 lists only `export-wav-stream.test.ts`, which is in the grants. It imports the worker module for SW3.
  - K1, K9 and K10 equal HEAD. K2 is 19. K19 shows doc 246 present.
- **Doc 246:**
  - l.4 matches the required line byte for byte.
  - The TEMPLATE headings appear in order.
  - Every cited row id, mutant id and artifact exists.
  - `grep 'C round [0-9]* pending' docs/implementation` gives 0 hits.

## 5. Mutants (§3)
Command: `TREE=a-round-380/tree OUT=<abs>/a-round-380/mutants bash b-round-379/mutants/run-mutants-380.sh`. The tree is an rsync copy with `node_modules` symlinked. `summary.txt` ends with `restored`.

- **Run 1** (before the review fixes): `a-round-380/mutants-run1/summary.txt`, all 8 red.
- **Run 2** (final tests, fresh rsync): `a-round-380/mutants/summary.txt`, all 8 red. The table below is run 2.

| Mutant | rc | Red on the required row |
|---|---|---|
| MU-12A-NO-CLAMP | 1 | SW1 (6 writer rows, the fallback row, SW2e, SW3, SW7 and EW6) ✔ |
| MU-12A-OFFSET | 1 | SW1 (lengths, chunk sizes, pad, early peak, specials, IP5 replacement, fallback), SW2e, SW3 ✔ |
| MU-12A-PEAK-LAST | 1 | `SW1 peak and clipped … early chunk`, plus SW1 lengths and chunk sizes ✔ |
| MU-12A-CLIPPED-LAST | 1 | `SW1 peak and clipped … early chunk` and the other SW1 rows ✔ |
| MU-12A-ALL-IN-FLIGHT | 1 | **SW2a** ✔, plus SW2e, SW6 mid-stream and EW8d |
| MU-12A-NO-ABORT | 1 | **SW6** mid-stream and listener rows ✔, plus EW8d |
| MU-12A-NO-REARM | 1 | **both EW8b SW5 rows** ✔ |
| MU-12A-NO-FINISH-CHECK | 1 | **SW1** `finish with fewer frames …` and **SW3** error row ✔ |

No anchor was missing and no mutant stayed green.

**Ad-hoc mutants** (A's own, informational, for the review findings; logs in `a-round-380/A-MU-*.log`; tree diff-checked as restored):
- **A-MU-OFFSET-AFTER-POST** (`offset +=` moved after the transfer `post`): red on SW2a, SW2e and SW4 worker path. The detaching fake catches it.
- **A-MU-PEAK-FIRST** (`if (peak === 0) peak = report.peak`): red on `SW1 peak equals … later chunk`.

## 6. code-reviewer
**Why no STOP:**
- The task says "a Medium or above is a STOP (L11)". L11's STOP classes are:
  - a failing or slow covering test;
  - a Medium+ regression whose fix is **outside the grants**;
  - a spec conflict;
  - a change to a ruled formula, filter or window.
- All three Mediums were test-strength gaps in files A authored. They were fixed inside the grants with no source edit, and SKETCH-EQUAL stays 14/14.
- Per L11 the changed code went back to the reviewer. B may overrule this reading.

**Review 1** (full diff, score 8/10; the reviewer had read and grep tools only). No source defects. Findings and fixes:

| Id | Severity | Finding | Fix |
|---|---|---|---|
| R1-M1 | Medium | The fake workers never detach transferred buffers, so the copy → offset → transfer order is untested | `StreamFakeWorker` snapshots chunk channels with `slice()` and detaches the originals with `structuredClone(transfer, { transfer })`. SW2a asserts transfer identity against the originals and that the originals have byteLength 0 and length 0. A full-message `structuredClone` gave cross-realm Float32Arrays, which failed `instanceof`. A-MU-OFFSET-AFTER-POST is now red |
| R1-M2 | Medium | The SW4 worker rows leave pending promises with a live 30 s timer | Both rows drive `complete` and await it; the afterEach resets `throwOnPost` |
| R1-M3 | Medium | No late-chunk peak test, so "first chunk wins" passes | New row `SW1 peak equals measureExportOverload … later chunk` (`latePeakChannels`, 1.3 in chunk 2). A-MU-PEAK-FIRST is now red |
| R1-L1 | Low | The SW3 worker module state is shared across tests | The beforeEach reset asserts exactly the 'no begin message' error, so leaked state fails loudly |
| R1-L2 | Low | Vacuous asserts | Removed `message === undefined`, the SW3 oracle-vs-measure line and `raw[0] toBe left`. The SW6 transfer check now uses `toBe` per index. **Not changed:** the pre-existing EW1 line (HEAD code) |
| R1-L3 | Low | Dynamic imports in export-wav.test.ts | Replaced with static imports |
| R1-L4 | Low | SW2d does not cover `finish` | It covers posts 0–3 |
| R1-L5 | Low | Re-arm is tested only on the final ack | EW8b is split into two rows (acks at 29 s and 58 s; and the last ack) |
| R1-I1 | Info | The worker-path bytes are not checked end to end in unit tests | Stated in doc 246; the coverage is SW3 + SW1 + SW7 + C's E1–E4 |
| R1-I2 | Info | TL-R380-B1 behaviour change | Doc 246 now says it: the 'wav' phase swallows the throw, the 'render' phase still rejects (EW6) |
| R1-D1 | Doc | The `reportProgress(0)` wording | Fixed: "after `begin` and the first chunk" |

**Review 2** (delta re-review, score 9/10): every item above is resolved and there are no regressions. New findings, left as they are so nothing changes after the review:
- **A-R380-REVIEW-INFERRED-ANY (Low).** At `export-wav-stream.test.ts` ~l.75, `channel` in `snapshotWorkerMessage`'s `.map` is inferred as `any`, because `Array.isArray` on `unknown` gives `any[]`. It is not an explicit `any`, and typecheck and Biome are clean. Fix: annotate `(channel: unknown) =>`. For `deferred_low_polish`, or the next round that owns the file.
- **Info.** The fakes in export-wav and export-cancel do not detach. Only SW2a pins the order, and doc 246 says so.
- **Info.** Doc 246's mutant list omits the two ad-hoc mutants. They are recorded here in §5 instead, because editing the doc would need another review.

**Architecture note (for B, proposal only, not acted on):**
- The 44-byte WAV header is now written in two places: `app/lib/sfx-edit.ts` (`encodeSfxWav`) and `app/lib/arrangement/export-wav.ts` (`createArrangementWavStreamWriter`).
- The reviewer says keep it for now. SW1 and EW1 check both copies byte for byte, and tech-lead ruled it so.
- Possible bounded task: share a `writeWav24Header(view, length, channelCount, sampleRate)` helper, with SW1, EW1 and the sfx-edit tests unchanged and green.
- The review also called the wallclock asserts on the two `longtask-max.6x` rows low flake risk (median of 3, observed 0 against a limit of 100). The task already allows wallclock asserts.

## 7. Known gaps / notes for B
- **No browser or perf runs by A**, as the task rules. WAV-BYTES, CANCEL-BROWSER, MP3-BROWSER, G380-AUTH and PERF-RES are C's.
- **The SW4 same-percent row** drives the client with fake ack `written` values (65,536 and then 65,600 inside one percent). The client reports progress from `message.written`; a real worker acks only at chunk boundaries. The fallback SW4 row covers real chunk boundaries.
- **The worker path with length 0** is not rejected before a Worker is made. `begin` throws in the worker, the worker posts `error`, and the export rejects with the "worker failed" prefix plus `WAV stream: invalid length or channel count`. The empty-project guard in ArrangementContext refuses before any render, so the export path does not reach this. The writer and the fallback reject at once (SW1).
- **SW1 data.** `seededChannel` in the in-place file also writes the special values into the last 8 samples, when the length is more than 16. So NaN, ±1.5, MAX and −1 are in both the first and the last chunk.
- **The lint run** reports 205 warnings for the whole repository. I did not compare them with HEAD's count. Biome is clean on all my files.

## 8. Exact next checks for C
- **Final A state:** 19 status lines, all in the grants. frozen rc 0, protected rc 0, sketch-stable 14/14. Claims: K2 19; K7 lists only `export-wav-stream.test.ts`; K9 rc 0; K10 rc 0 with 1,254 entries; K11 14/14; K19 present; 0 `MISSING`.

Every row of §4 of the task: SOURCE-SCOPE, CLAIMS, SKETCH-EQUAL, ROW-MAP (use §3 above), UNIT (+ the shuffle seed 42 on export-wav-stream, export-wav and export-cancel), MUTANTS-UNIT, PERF-RES, PERF-MUTANTS, WAV-BYTES, CANCEL-BROWSER, MP3-BROWSER, G380-AUTH and DOCS.

## 9. B acceptance items A can claim
- §2.1 sketch applied, 14/14: done.
- §2.2 budgets: by the patch only; JSON parses and the perf lib tests pass 40/40.
- §2.3 migration and new rows SW1–SW7: done, with the row map in §3.
- §2.4 doc 246: done.
- §3 typecheck, lint, Biome, the covering vitest set and the mutants: done, all green or red as required.
- §3 code-reviewer: §6.
- **Browser and perf acceptance: not claimed (C).**
