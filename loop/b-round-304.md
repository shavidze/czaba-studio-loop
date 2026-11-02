# B round 304 → 305 planning (2026-11-02)

**Decision: CONTINUE.** The next task is round 305, RETRO 305 (window 290–304), in `current-task.md`. It changes no app code. The round-304 task is archived as `tasks/round-304.md`, a byte-identical copy (`cmp` equal; claim K19).

**Advisor:** available. I consulted it before the substantive work, and I call it once more after this hand-off is written.

## 1. Evidence read
- **`c-round-304.json`:** `taskStatus: PASS`, `browserVerified: true`, `realVerified: true`. 8 rows passed, PERF-RUN and PROBE-EQUIV among them. PROBE-EQUIV ran at 1440×900 and 1280×720. 2 Lows (C-R304-01/02) and 5 infos.
  - EXIT: **not met**. `out.keydown-max-ms` samples 80/80/80; `in` median 24; commits `detail.max` 1 on in, out and wheel.
- **`gates/gate-round-304.json`:** `published`, commit `adf959d` on both remotes. **The round-305 baseline is `adf959d`.** The tree is clean, and the 1,176 tracked files are frozen in `b-round-304-r305-tree-sha256.txt`.
- **`gates/round-304/review.md`:** score 8.5. It raised **two Mediums**: M1, the `perf/lib` tests are not in the gate; M2, the `== 60` tripwire rows. It also raised Lows 3–5 and an Architecture note.
- **`a-round-304.md`:** no STOP. One deviation: the LoAF rows use an overlap rule (l.19–23). The changes made after review were not re-reviewed (l.107).
- **`regression-last.json`:** 2026-11-02, round 301. The next REGRESSION is due on or after 2026-11-05, so it is not due now.
- **`retro_policy.next_due`:** round 305. **RETRO is due.**
- **Advisor's point:** C's `lessons.md missing` is a false alarm. `tmp/studio-real-loop` is a symlink, and `find` without `-L` does not descend into it.

## 2. Backlog changes (version 264; `b-round-304/update-backlog.py`, one-shot; before-copy `b-round-304/backlog-before-305.json`)
| Id | Change |
|---|---|
| PERF-3c | **მზადაა** (done), from independent C evidence: C PASS, browserVerified true, gate published. PERF-3 stays `in_progress` (D-29z799) |
| C-R304-01 | **Ruling: the overlap rule is the contract**, so the finding is closed. Reasons: the reviewer graded start-inside a Medium, and each step ends with ≥ 200 ms of quiet, longer than any observed LoAF (85 ms max). Its process half goes to L11 |
| C-R304-02 (= GATE304-L4) | open → fixed early in PERF-3d (same file) |
| INFO-C304-REVIEW-POSTFIX | closed by evidence: the gate review read the whole diff |
| INFO-C304-LESSONS-MISSING, -C303-SHOT, -AUTH-ATTEMPT1, -FAKEBEARER-500 | recorded. The first is a false alarm; the first two led to the L38 clause |
| GATE304-M1 (Medium) | `open_root` = ROOT-REQ-VITEST-PERF-INCLUDE, re-raised. It does not block the loop. PERF tasks cite the scratch-config run until it lands (D-29z800) |
| GATE304-M2 (Medium), GATE304-L3 | open → PERF-3d, round 306. The task grants both `== 60` rows with their post-fix values |
| GATE304-L5-COSMETIC | `deferred_low_polish` |
| GATE304-ARCH-ZOOM-LIVE-RULE | architecture signal. It has the same owner as B-R303-PERF-HARNESS-METRIC-FAMILY and is not scheduled |
| PERF-3d | status and scope updated. C's step-4 vs step-7 data is attached |
| RETRO 305 | `retro_runs` 305 added; `retro_policy.next_due` = round 320 or the end of STUDIO-PERFORMANCE |
| HR-C-MANIFEST-FIELDS | moved into `lessons.md` L57 |
| Retro candidates | <ul><li>RC-R290-PRECHECK-FULL-SUITE: adopted.</li><li>RC-R295-CLAIMS-FROM-SKETCH: merged into L56.</li><li>RC-R284, RC-R290-AX-TREE-ROW, RC-R290-L50: retired.</li><li>RC-R305-LESSON-CHAR-CAP: new.</li></ul> |
| SR-305-1…10 | screen-review candidates, `awaiting_user`. A-R302-INFO-CZABA-DOUBLE-READOUT → SR-305-10 |
| B-R301-DOCS-OLD-NAME | a For-Saba proposal (retro §12) |

## 3. RETRO 305 (detail in `retros/retro-305.md`)
**The numbers:**
- 15 rounds: C PASS 13, C FAIL 2 (290, 292), gate failed 1 (293).
- Cost $304.14, of which B spent 48%. B's planning median is $9.75 (retro 290: $12.77).
- **All three failures, and the 296 → 299 fix-up chain ($45.75), originate in B's spec or pre-check.**

**`claims-count.txt` command** (run from the loop root):

```bash
echo "round sweepHits uniqueK stopLines manifestFields"
for n in $(seq 290 304); do
  s=$(grep -c SWEEP tasks/round-$n.md)
  k=$(grep -oE '\[K[0-9]+\]' tasks/round-$n.md | sort -u | wc -l)
  st=$(grep -c 'STOP — needs B ruling' a-round-$n.md)
  m=$(grep -c '"manifestPaths"' c-round-$n.json)
  echo "$n $s $k $st $m"
done
```

**Experiments:**
- **EXP-R290-ARTIFACT-MANIFEST is refuted** on all three of its own conditions (`consequence-tester` agrees).
- Rounds 300–304 are uncheckable: those tasks stopped naming the rule, so C stopped writing the fields.
- **New: EXP-R305-SKETCH-MUTANT** (`consequence-tester`).

**Lessons:** `lessons.md` stays at 59 lines (diff in `b-round-304/lessons-diff.txt`).
- L43 is merged into L44 (`tech-lead`).
- **L57 is new:** C writes the harness fields every round.
- L11, L23 (full suite on the sketch), L38 and L56 gain one clause each.

**Disagreements with `tech-lead`, recorded in retro §7:**
- He proposed a separate harness-rules file. L57 already does that job: `lessons.md` is the file every round reads.
- He proposed a per-lesson character cap. It is a watch item for RETRO 320, not adopted now.

**Screen and journey review:** `user-review/screen-review-305.md`.
- The capture ran on the mock backend, which I stopped afterwards (`b-round-304/mock.log`). `laneErrors` was none.
- My first two capture runs failed on a lane-name selector: the header now reads "Music · active". I fixed the selector, and nothing else changed.
- `first-visit-host` noted a limit: the journey added Night Pulse stems, not the Middle East track it arrived for. The review records this.
- The weakest step is SR-305-3: "Try it in the Studio" lands on an empty timeline.
- SR-305-7 rests on the source (K13). The 90 BPM figure came from the mock fixture and is unconfirmed.
- I checked the store tree after every consult: `sha256sum -c` rc 0, and the status was clean.

## 4. Queue and cadence
1. Round 305: RETRO.
2. Round 306: PERF-3d, plus GATE304-M2/L3 and C-R304-02. Before writing it, B consults `performance-optimizer` and `tech-lead` and re-measures HEAD.
3. REGRESSION: on or after 2026-11-05.
4. The rest of STUDIO-PERFORMANCE.
5. STEM-LANES.
6. SYS-1…3.
7. STORE-2b…5 (direction gate).
8. REVIEW-RECOMMENDATIONS.
9. T12-ADVANCED.
10. The phase-2 entries (skip rule).

**No frontend-architect checkpoint:** PERF-3c was a test-only change on one owner. GATE304-ARCH-ZOOM-LIVE-RULE stays a signal, a candidate for after PERF-3d. ARCH-CHECKPOINT-STUDIO-LINK is still unanswered and non-blocking.

**Ready for commit:** round 304 is already published (`adf959d`). Round 305 changes no store file; root records the loop state.

## 5. Not COMPLETE, not BLOCKED
- **Not COMPLETE:** these all remain:
  - PERF-3d and the rest of STUDIO-PERFORMANCE;
  - STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED;
  - the phase-2 entries;
  - the deferred Lows, the parked Mediums and the Saba-owned manual items.
- **Not BLOCKED:** nothing external is missing for round 305.
