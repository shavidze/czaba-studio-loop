# B round 400 → 401 planning (2026-11-08)

## Accepted from independent evidence
- **Round 400 PERF-14b-i completion: C PASS.** Source: `c-round-400.json`.
  - 12 rows passed; `browserVerified` and `realVerified` are both true; 0 bugs.
  - Gate 400 published `c17d0e9` on both remotes (`gates/gate-round-400.json`), so `c17d0e9` is the baseline for round 401.
  - **PERF-14b-i is done.**
  - Closed: C-R399-01 and TL-R398-SK-M2 (D-29z1371).
- **A's reviewer findings:**
  - The four spec Lows → A-R400-REVIEW-SPEC-LOWS (deferred; an input to PERF-14b-ii).
  - The architecture note → signal A-R400-ARCH-READBESIDECLIP. Not scheduled.
- `tasks/round-400.md` is a byte-identical copy of the round-400 task (claim K15).

## Next: round 401 = RETRO 401 (window 385–400)
The task is in `current-task.md`. Grants: none. The frozen tree is `b-round-400/r401-tree-sha256.txt` (1,294 entries, rc 0). A implements nothing. C checks traceability and runs three browser rows.

**Outputs written by B:**
- `retros/retro-401.md` (Georgian, 13 sections).
- `user-review/screen-review-401.md`: no new candidates. The Studio text is identical to retro 385. "1 audio files" is already covered by STORE-4 F3.
- `lessons.md`: still 60 lines. L4 gains "Degraded state × gesture"; L58 gains "Pre-step rules and the review claim".
- `backlog.json` v369 (D-29z1371…D-29z1376).
- `feature-status.md`: round 400 is marked done; a RETRO 401 row was added. After the script ran, B corrected the RETRO 401 table row by hand to the table's two columns.
- Data, scripts and screens are under `b-round-400/`.
- `claims-401.sh`: 0 `MISSING`, stderr empty.

**Findings of the retro:**
- **Results:** C PASS 12, FAIL 4 (387, 391, 394, 399), BLOCKED 0.
- **Cost:** $294.13. Fix chains account for $156.23 of it (53.1 %).
- **All four FAILs began as A STOPs.** All four are B-origin: an unruled sketch Medium, conflicting task clauses, a missing gesture-in-degraded-state row, and a pre-step rule that was not run on the sketch.
- **Four plannings shipped a sketch without `sketch-review.md`:** 388, 391, 394 and 395. L58 now requires a `[K#]` claim for this.
- **L57:** only 12 of 16 C JSONs carry all 12 fields.
- **No Saba-found bug in the window.**

**RETRO-400 deadlines.** Defaults were applied under L46, because no answer has arrived:
- SYS-R385 is queued after PERF-14c.
- SYS-R369 is queued before STEM-LANES.
- SYS-R388 is queued next to SYS-R2.
- ARCH-CHECKPOINT-PREVIEW-AFTER-13C gets deadline RETRO 416, with a default preview-controller task. No new SYS id was created.

## Order (D-29z1375)
1. RETRO 401.
2. PERF-14b-ii. If REGRESSION-2026-11-10 is due at that planning, it goes first. Before 14b-ii is dispatched, the lane sketch gets the TL-R398-SK-M1/L1 fixes, a re-run of VZ and the mutants, and a delta review.
3. PERF-14c.
4. SYS-R385.
5. PERF-15.
6. SYS-R2 + SYS-R388.
7. SYS-CLOCK-DETERMINISM.
8. SYS-R369.
9. STEM-LANES.
10. SYS-1…3.
11. STORE-2b…5.
12. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
13. Phase 2, under the skip rule.

## Consults
- **`tech-lead`:** used for the retro: causes, lessons, the systemic task, the defaults and the countermetrics.
- **`product-designer`:** used for the screen and journey review.
- **advisor:** available and used for the planning approach. A final check is requested below.
- **Not called:** `consequence-tester` and `qa-engineer`, because they are not on B's list (ROOT-REQ-B-RETRO-CONSULTS).

## For root
- **ROOT-NOTE-R387-STOP-NOT-HONOURED (4×):** proposal to route an A STOP straight to B.
- **ARCH-CHECKPOINT-PREVIEW-AFTER-13C** is still due, with ARCH-CHECKPOINT-DECODE-REGION. It does not block.
- **Gate `review.md` for 395, 396 and 400** has no "Score" line. This is information only.
- **Publish:** nothing to publish in round 401, because no source changes. Round 400 is already published.
- `root-pre-push-review.md` and `publication-checkpoint.json` (2026-10-07) carry nothing new.
