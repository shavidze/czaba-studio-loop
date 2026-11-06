# B round 367 → 368 planning

**Date:** 2026-11-06. **Decision:** CONTINUE (`b-next.json`). **Next:** round 368, PERF-9b-ii re-dispatch (`current-task.md`). The previous task is archived as `tasks/round-367.md` (a copy).

## 1. Round 367 result (from C's evidence, D-29z1206)
- `c-round-367.json`: taskStatus **FAIL**, browserVerified true, realVerified true. Gate 367: `skipped` (C FAIL). The baseline stays `d53d113`. The round-367 tree (v2 sketch + doc 236) is uncommitted, and round 368 builds on it.
- **Cause:** A STOPped on a code-reviewer Medium that B had not ruled. C reproduced it independently: **C-R367-DEDUP-CANCELLED-WRITE**. On the sketch, a same-key load that arrives after load 1 was aborted skips its write. Load 1's write then cancels, so A is not cached. Evidence: `c-round-367/dedup-sketch.log` (`storedA=false`) and `dedup-head.log` (`storedA=true`). It costs cache efficiency only: no wrong bytes, no data loss.
- **Passed on v2:** CLAIMS, SOURCE-SCOPE, UNIT 31/31, INTEGRITY and VALIDATOR at both viewports, G367-AUTH, and the PLAYBACK-EXPORT record (bit-identical WAV).
- **Not passed:** A-REVIEW (the STOP) and the DOCS l.4 claim. **PERF-9b-ii is not done.** Nothing moves to მზადაა.
- **Other C findings:**
  - C-R367-STATUS-LINE-PREMATURE (Low)
  - C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN (Low)

## 2. Ruling (L10) and scope of round 368
The ruling is in `b-round-367/sketch-review.md`.

**Fix: join.** A same-key load joins the pending write by pushing its signal. The write is cancelled only when every joined signal is aborted.
- Against HEAD, this stores in every ordering where HEAD stored. The only loss it accepts, an abort while the body is still being read, HEAD loses too.
- I tried a replacement-write variant and dropped it: its mutant stayed green, because join already covers that case, and the variant adds an identity trap.

**Round 368 owns the same 3 files.** It applies `b-round-367/sketch-delta.patch.txt` on the current tree.

| Finding | Closed by |
|---|---|
| C-R367-DEDUP-CANCELLED-WRITE (Medium) | SC30, SC31 |
| C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN | SC32 (the mutant is not equivalent; it matters while the body is still being read) |
| C-R367-STATUS-LINE-PREMATURE | doc l.4 = `Completed (C round 368 PASS)` |
| A-R367-REVIEW-L-a, L-b, L-f | the SC22 title, SC33, and doc claim fixes. These are fixed now, not deferred, because the doc claims them (L26). |

**Deferred (D-29z1207):** A-R367-REVIEW-L-c, L-d, L-e, L-g and TL3-1 go to `deferred_low_polish`.

## 3. B pre-check (L58) on the final sketch v3
Scratch: `git archive d53d113` + `b-round-367/sketch.patch.txt`.

- **Covering tests:** stem-cache 35/35, source-fetch 6/6.
- **Rows catch the bug:** the v2 client is red on SC30 and SC31 only (`mutants/round367-client-vs-v3-tests.log`).
- **C's round-367 DEDUP probe on v3:** P1 and P2 `storedA=true putCalls=2` (`dedup-probe-v3.log`); it was `storedA=false` on v2.
- **Mutants:** 19, each red on its row (`mutants/mutant-summary.txt`). The 13 round-366 mutants were regenerated, and 6 are new.
- **Static checks:** typecheck rc 0. Biome rc 0.
- **Full suite:** 250 files / 3688 tests, rc 0 (`precheck-full.log`).
- **Production probe:** run at 1440×900 and 1280×720 (`probe/sketch-*.summary.txt`). The result is identical to C round 367: every phase ready and plays, truncate and delete-file re-stored, the stale ETag replaced.
- **Claims:** `claims-368.sh`, with planning and sketch outputs. K16 is empty after the last artifact.

## 4. Consults and advisor
- **Advisor:** available; used before the ruling and for the final check (follow-ups: DEDUP probe on v3, log rename, TODO count of five). It asked for these, all done:
  - rule the whole ordering class, not only P1/P2;
  - regenerate the mutants on the new sketch;
  - give A an explicit apply path (the delta);
  - review the final sketch;
  - move RETRO to 369.
- **tech-lead (read-only):** reviewed the final v3 and found no Medium+.
  - TL3-2 (SC32 vacuous without a put) and TL3-3 (no "joiner aborts" part) are fixed in v3. Their new mutants are red.
  - TL3-1 is accepted (unreachable in a browser).
  - TL3-4 is a wording note.
- **Not consulted:** performance-optimizer, because no budget changed; product-designer, because nothing on screen changed; ableton-arrangement-expert, because it does not apply.

## 5. Backlog and board
- **`backlog.json` v330 → v331** (`b-round-367/update-backlog.py`; backup in `backlog-before-368.json`):
  - open_findings: the 3 C findings plus A-R367-REVIEW-L-ABF, all targeted at round 368;
  - deferred_low_polish: 5 new entries;
  - the architecture note becomes signal `signals_round_367` on ARCH-CHECKPOINT-PERF9-STEM-CACHE. It is a signal, not a task;
  - retro_candidates: B-R367-FINAL-SKETCH-UNREVIEWED and B-R367-MUTANTS-MISSED-INTERACTION, both B origin;
  - STUDIO-PERFORMANCE: status, consults_round_368 and execution_order_d29z1209;
  - retro_policy.next_due: 369;
  - rounds 367/368; D-29z1206…D-29z1209.
- **`feature-status.md`:** round 367 is **ბაგია** (C FAIL), and round 368 is **მუშავდება**.
- **REGRESSION:** not due, because `regression-last.json` is 2026-11-05 and the next one is due on or after 2026-11-08. **RETRO** moves to 369 (D-29z1209).

## 6. Root / architecture
ARCH-CHECKPOINT-PERF9-STEM-CACHE stays requested from root. It is non-blocking and runs after round 368 passes (`b-round-366/root-request-arch-checkpoint.md`). After C PASS, round 368 is a stable boundary ready for commit: PERF-9b-ii closes the cloud part of PERF-9.

## 7. Order after round 368 (D-29z1209)
1. RETRO 369 (window 353–368).
2. REGRESSION, at the first planning on or after 2026-11-08 that is not a RETRO round.
3. PERF-11, then PERF-12…15.
4. SYS-R2-FAKE-FIDELITY, then SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3.
6. STORE-2b…5.
7. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
8. Phase 2 (skip rule).

PERF-9c is awaiting_user. PERF-9d is with root.
