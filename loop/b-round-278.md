# B round 278 → 279 planning (2026-10-30/31)

**Advisor:** available and consulted before the approach. A second call follows before finishing.
**Consults (read-only, told not to run heavy jobs during B's perf run):**
- `performance-optimizer`: a ruling for every wait site, the poll-loop leak, mutants, the timeout and the b-ii-2 design;
- `tech-lead`: helper placement, the l.579 ruling, the split, grants and the timeout request.

## 1. Inputs and evidence
| Input | Result |
|---|---|
| `c-round-278.json` | **PASS**: 27 rows, `browserVerified: true`, `realVerified: true`, 0 bugs, 0 failed, 0 blocked. Gate rows were not claimed. Notes: C-R278-ENV-01, C-R278-NOTE-01 and C-R278-NOTE-02 (all info) |
| `a-round-278.md` | done within the grants, no STOP. LPA4 was strengthened. Two code-reviewer Lows and one Architecture note go to B |
| `gates/gate-round-278.json` | **published**, commit `873d835` on both remotes. This is the new baseline |
| `gates/round-278/review.md` | COMMIT OK, 9/10. Four Low/info suggestions and one architecture proposal (signal 3) |
| env-status | store 200 (round 278). After B's runs, :5173 still answers 200, and the `node_modules/.vite/deps/_metadata.json` mtime is unchanged (23:00:10) |
| regression-last.json | round 258, 2026-10-30. The next regression is due on or after 2026-11-02, so it is not due now |
| `tasks/round-278.md` | archived (a copy; it did not exist before) |

## 2. Backlog changes (only from evidence)
**Closed (D-29z634)**, by C round 278 PASS and gate 278 published:

| Id | Row |
|---|---|
| C-R276-01 | B-CURSOR |
| C-R276-02 | C-R276-02-KEEP |
| A-R276-REVIEW-DELETE-NAME | B-DELETE-NAME |
| INFO-C277-DOC206-STAGE2-ROUND | DOC-206-207 |
| C-R130-ADD-DISABLED-NO-REASON | B-ADD-TITLES, B-AX-2, B-TAB-2 |
| ROOT-R66-L3, the disabled-reason half | B-TAB-2, B-AX-2. The 16 px target half stays deferred |
| A-R276-ARCH-GUARD-IN-HELPER | MUTANTS (G) |

**SYS-5 is მზადაა** (stage 1 gate 277, stage 2 gate 278, `browserVerified: true` in both).

**New (D-29z635):**
- **Lows → `deferred_low_polish`:**
  - GATE278-S1: the soft-disabled Add border and fill stay at full strength. This is the accepted ΔE ≤ 3 trade-off, kept for the polish pass;
  - GATE278-S2: the unused `(event)` parameters, merged with A's note;
  - A-R278-REVIEW-METRONOME-SPY.
- **Info:**
  - GATE278-S3: a typed BPM does not commit on a soft-disabled Preview/Add click. The scope decision is written down;
  - GATE278-S4;
  - C-R278-NOTE-01;
  - C-R278-NOTE-02: a 1 px inset ring versus SABA-B-4's 1.5 px wording. A reconcile candidate, not scheduled;
  - C-R278-ENV-01: now a lesson.
- **Architecture signals (recorded, not scheduled):** GATE278-ARCH-SOFT-DISABLED-TOKENS, A-R278-ARCH-METRONOME-KEEPMOUSEFOCUS, B-R279-PERF-READY-WAIT-DUP.
- **Harness fact:** B-R278-LANE-ORDER.
- **Root request:** ROOT-REQ-PERF-TIMEOUT.

**Also updated:**
- `decisions_log_b` (D-29z634…D-29z641);
- the STUDIO-PERFORMANCE queue entry: b-ii is split into b-ii-1 and b-ii-2, plus `consults_round_279` and `execution_order_d29z636`;
- `feature-status.md`: SYS-5 → მზადაა, and the STUDIO-PERFORMANCE row;
- `lessons.md`: L38 gains one clause. It stays at 59 lines.

**Backups:** `b-round-278/*-before-279.*`. **Script:** `b-round-278/backlog-update.py`.

## 3. Rulings
| D-ID | Ruling |
|---|---|
| D-29z636 | Round 279 = PERF-HARNESS-SHARED-LIB-b-ii-1. **Split** (`tech-lead` T4): R216-MEM-POLLS-HEADROOM changes the export window, so it gets its own round, 280, with named exceptions. Nothing is dropped |
| D-29z637 | **Replace:** 1a l.574/l.668, 1b-i l.637/l.703, 1b-ii l.279. **Keep:** 1a l.579 (the hook-live window; `tech-lead` over `performance-optimizer`), 1a l.597/l.600, 1b-ii l.524 (measured), l.180, l.342 and l.659 |
| D-29z638 | PERF-1A-TIMEOUT-HEADROOM → root request now: 15 → 25 min. B measured PERF-1a at 8.4 min (56 %). The state waits save only about 0.2 min |
| D-29z639 | L38: a separate Vite `cacheDir` for a second dev server |
| D-29z640 | Equivalence with **no named exception** against B's own HEAD oracle |
| D-29z641 | The outcome table. Doc 208 is stage 1 of 2 |

## 4. Pre-check (the sketch pre-applied and measured three times)
**HEAD oracle at `873d835`** (git archive, isolated):
- 3/3 pass in 15.2 min;
- 1a and 1b-i deterministic medians identical to `c-round-259`;
- 1b-ii differs only in 7 DOM and JS-bytes rows that app rounds 260–278 moved.

**Sketch v1** (quiet-only waits): `hook-live` went 2 → 3 in 1a and 1b-i, and `used-ready-mib` became nondeterministic.

**Load-tail probe:** the ready commit lands at about 1.1 s, and the collection-ready status commit 470–510 ms later. The fixed 1000 ms had been absorbing it.

**v2** (wait for the status text, then quiet): 1a and 1b-i had 0 problems. 1b-ii still moved `used-ready-mib`: 5.3 → 5.9–6.0.

**v3** (1b-ii l.524 kept): 1b-ii had 0 problems.

**Mutants:** MU-OBS-2 red, MU-OBS-3 (control) green, MU-LANE red. MU-READY is built from `.empty` (advisor: `.loading` could match at once), and A/C run it with MU-CAP and MU-PLAY.

**EQUIV:** C applies the same-machine HEAD re-run clause before failing a deterministic row (fresh cloud machines; `used-ready-mib` is timing-sensitive).

**Lane probe** at both viewports: video, music, stems, sfx. The clip lands on music, and stems is the first later free lane.

**Claims:** `b-round-278/claims.sh` → `claims-output-at-873d835.txt` (K1–K17, SW-A).

**Grants** (`b-round-278-r279-grants.txt`):
- 10 paths: 5 perf code files, 1 new doc, and sections of 4 docs;
- frozen manifest: 1133 files, `sha256sum -c` rc 0 at planning.

**L38:** B's perf runs overlapped only with the read-only consults, which made no heavy calls. No vitest or tsc ran during a perf run.

## 5. Architecture checkpoint
No new request; this round is test-only. ARCH-CHECKPOINT-SYS5-SOFT-DISABLED (`b-round-277.md` §5) is now due, because SYS-5 is complete. It is still optional and non-blocking. The earlier addenda are also unanswered and non-blocking. GATE278-ARCH-SOFT-DISABLED-TOKENS can be considered together with it.

## 6. Next
**If C passes and the gate publishes:**
- round 280 = b-ii-2 (R216-MEM-POLLS-HEADROOM, a re-baseline with named exceptions);
- if the round-280 planning falls on or after 2026-11-02, REGRESSION goes first.

**After b-ii-2:** PERF-2 → … per `execution_order_d29z636`. RETRO is at round 290.

## 7. Commit readiness
Rounds 275–278 are published (`873d835`). Round 279 becomes ready for the gate after C PASS; it is test-only.
