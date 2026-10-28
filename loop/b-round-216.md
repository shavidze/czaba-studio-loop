# B round 216 → 217 planning (2026-10-28)

**Decisions:** D-29z218 (C round 216 result and a bounded fix-up), D-29z219 (rulings on C-R216-02, A deviation 5 (the 0.1 MiB asymmetry) and A deviations 1–4).
**Advisor:** available and used twice: before writing, and before declaring done. Its points were adopted, with no conflicts.
**Subagent consults:** none. This is a docs/budgets-label fix-up, not a new PERF stage, so no `performance-optimizer`/`tech-lead` consult was needed.
**Archive:** `tasks/round-216.md` is a copy of the round-216 `current-task.md`; nothing was deleted.
**Snapshots:** `b-round-216/` holds `backlog-before-217.json`, `feature-status-before-217.md`, `b-next-before-217.json`, `git-status-at-planning.txt` and `r217-granted-start/`.

## 1. Evidence read
- **`c-round-216.json`:** FAIL. `browserVerified` and `realVerified` are true, and none of the 4 browser rows was blocked.
  - **PASS:** SCOPE-216, RT-FIX-216, PROBE-216, REDPROOF-216, AN-REVIEW-216, G216-3 and STUDIO-SMOKE-216 (a real WAV download, 24-bit, non-silent, at both viewports).
  - **FAIL:** DOC-216 with C-R216-01 (Low). Doc 169 has no `## არქიტექტურა` heading; the Mermaid diagram sits inside `## მიდგომა`.
  - **FAIL:** PERF-RUN-216 with C-R216-02 (Low). Four `mem-polls` rows are labelled `deterministic`, but their values vary between runs. All other sub-criteria passed.
- **`gates/gate-round-216.json`:** skipped (C FAIL). The baseline stays `eb9e76e`.
- **`a-round-216.md`:** implemented with no STOP.
  - Deviations 1–4.
  - Ruling request 5 (the 0.1 MiB asymmetry).
  - Code-reviewer score 7.5. Its Architecture note: a third copy of the harness helpers; keep, and leave the extraction to PERF-HARNESS-SHARED-LIB.
  - Four late spec changes were never re-reviewed.
- **Regression:** `regression-last.json` is round 199, 2026-10-27, so the next one is due on or after 2026-10-30. Planning is 2026-10-28, so the regression is **not due**.

## 2. Measured data behind the rulings (A1, A2, C1, C2; samples per run)
| Row | A1 | A2 | C1 | C2 |
|---|---|---|---|---|
| mem-polls-1 | 7,7,7 | 9,9,8 | 8,7,8 | 8,7,8 |
| mem-polls-2 | 14,15,14 | 14,14,14 | 13,14,14 | 14,14,15 |
| mem-polls-1.6x | 11,12,9 | 11,12,11 | 10,12,10 | 10,11,10 |
| mem-polls-2.6x | 19,19,18 | 20,20,19 | 19,19,19 | 18,17,19 |
| used-ready-mib | 5.1×3 | 5.1×3 | 5.1×3 | 5.2,5.1,5.1 |
| export.1.peak-backing-delta-mib | 65×3 | 65.1,65,65 | 65×3 | 65×3 |

Sources: `a-round-216/final-run-{1,2}.json`, `c-round-216/perf-run-{1,2}.json`.

The spec's determinism check (l.803–808) fires only for `kind === 'deterministic'` **and** a metric listed in `resourceDeterminismMetrics` (l.59–77).
- `mem-polls-*` is not in that set, so relabelling those rows changes no harness behaviour.
- `used-ready-mib` and `peak-backing-delta-mib` are both in it. `countsAgree` (`perf/lib/stats.ts` l.23–28) tolerates ±max(2, 10 %).

So the fix needs no spec change.

## 3. Rulings (D-29z219)
1. **C-R216-02.** A liveness row whose value is a poll or sample count depends on timing, so it is `wallclock`.
   - This applies to all four `mem-polls` rows (`-1`, `-2`, `-1.6x` and `-2.6x`). Their mode stays `assert >= 5`.
   - Each `note` gives the observed range across the 4 runs: 1× 7–9 and 13–15; 6× 9–12 and 17–20.
   - Set-membership liveness rows stay `deterministic`. These are `clips-*`, `export-*-produced` and `js-*-seen`: they are all-or-nothing, as in `budgets.interactions.json`.
   - This follows `budgets.json`, which labels its timing-dependent liveness rows `wallclock` (`harness.move-latency-live.*`).
2. **A deviation 5 (0.1 MiB asymmetry).** One rule now covers both rows.
   - **The rule:** a MiB row rounded to 0.1 stays deterministic when its median is identical in every run (A and C) and no sample differs from the median by more than one 0.1 step.
   - **Effect:** `res.mem.used-ready-mib` returns to `deterministic`. Its median is 5.1 in all four runs, with one sample at 5.2. `res.export.1.peak-backing-delta-mib` stays `deterministic`: its median is 65 in all four runs, with one sample at 65.1.
   - **Reason:** §2.5's "a count that differs … leaves the set" was written for counts. The same §2.5 puts MiB rows "rounded to 0.1" in the deterministic set. A one-step rounding flip with an identical median is rounding noise, not a behaviour change. The literal rule would also remove the PERF-12 key row from the deterministic set for no gain.
   - **Unchanged:** `res.export.2.longtasks-over-50` is a count with a threshold-borderline task ([0,1,0] in A1), so it stays `wallclock`.
3. **A deviations 1–4 are accepted.** C passed them in REDPROOF-216 and PERF-RUN-216:
   - the window-end heap sample for the peak;
   - the 6× throttle after ready and Add;
   - asserts evaluated on incomplete runs;
   - the `MutationObserver` end of the window.

   Because of deviation 1, the four `peak-backing-delta-mib` notes in the budgets file (1× and `.6x`, 1 and 2 clips) still say "polled every 50 ms in the window", which no longer matches doc 169 l.51. They get the end sample in the same fix-up (L34: the contract file matches its doc).
4. **Late spec changes not re-reviewed:** a root signal for the gate's independent reviewer. The spec is frozen this round and unchanged since C verified it.
5. **mem-polls-1 headroom:** the minimum is 7 against a limit of 5, confirmed by C. This is a watch item on PERF-HARNESS-SHARED-LIB (a page-timestamped export-window helper). It is not scheduled now.

## 4. Round 217 = bounded fix-up (D-29z218)
- **Why:** `tasks/round-216.md` §6 says that when "a PERF or DOC row fails", the bounded fix-up of the failing rows comes first. The regression is not due, and PERF-16 waits.
- **Grants:**
  - `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md`: the whole file, under L34, but only the enumerated edits;
  - `perf/budgets.resources.json`: `kind` and `note` fields of the enumerated rows only.
- **Frozen:** 1,063 files in `b-round-216-r217-tree-sha256.txt`. These are every tracked file, including the 4 SYS-4 docs at their current working content, plus the untracked spec, minus the 2 grants. B checked it: rc 0.
- **Expected git status:** unchanged, 4 M + 3 ??.
- **Provenance:** the spec hash in the frozen list and the start hashes of the 2 grants equal C round 216's end hashes (`c-round-216/new-files-sha256-end.txt`). Nothing touched the tree between C's phase and this planning.
- **Doc 169 l.4:** `Completed (C round 217 PASS)`, under the L28 re-dispatch rule.
- **Reference first:** not in scope (docs and test-only).

## 5. Backlog changes (only from C evidence)
- **`rounds[216]`:** `c_fail_lows`. Add `rounds[217]` as dispatched.
- **`open_findings`:** C-R216-01 and C-R216-02 are added, with status "fix-up dispatched round 217". C stated these are deliverable defects, not product Lows, so they do not go to `deferred_low_polish`.
- **Closes on publication** (C PASS in round 216 on the SCOPE/DOC diffs):
  - SYS-4: GATE214-DOC168-STATUS, B-R214-DOC160-161-STATUS and GATE205-DOC162-STATUS;
  - GATE206-S5: C confirmed the section exists.
  - They become "closed" when root publishes rounds 216 and 217 together.
- **Stage status:**
  - PERF-1b-ii: `c_fail_lows_fixup_217`. It is not "done": `browserVerified` was true, but the round failed.
  - RT-FIX-216: C PASS (retro-215 corrected). It is published together with round 217, because nothing in the loop folder is gated by root.
- **Signals:**
  - the A-R216 Architecture note goes to `architecture_signals` (merged with PERF-HARNESS-SHARED-LIB);
  - ROOT-R216-LATE-SPEC-REVIEW is a root signal;
  - R216-MEM-POLLS-HEADROOM is a watch item.
- **New backlog key `retro_candidates`:** it holds RC-R216-DOC-TEMPLATE-HEADINGS. The next RETRO reads this key.
- **Lessons:** `lessons.md` is unchanged. "Doc headings ⊇ TEMPLATE `##` list" is a RETRO candidate; the DOC-217 row carries the check now.

## 6. Pre-fixed outcome for round-218 planning
| C 217 | Round 218 |
|---|---|
| PASS, and planning on or after 2026-10-30 | **REGRESSION**; then PERF-16 with `root-deps-request.json` |
| PASS, and planning before 2026-10-30 | **PERF-16**, with `root-deps-request.json` `{"add":["mediabunny","@mediabunny/mp3-encoder"],"remove":[]}` filed in that planning step (D-29z216) |
| DOC or BUDGETS row fails | Fix-up again, the failing rows only |
| SCOPE fails | Stop; root inspects |
| G217-3 or the smoke row finds Medium+ | Bounded fix-up first |

## 7. Non-blocking, carried
- The frontend-architect checkpoint (D-29z195) is pending with root.
- Root request `b-round-215-root-request-l28.md`.
- Saba questions as listed in `b-next.json`.
