# B round 289 → 290 planning (2026-10-31)

**Decision: CONTINUE.** The next task is round 290, RETRO 290 (window 275–289), in `current-task.md`. No app code changes in it. The round-289 task is archived as `tasks/round-289.md`, a byte-identical copy (`cmp` equal).

**Advisor:** available. I consulted it before the substantive work, and I call it once more after this hand-off is written.

## 1. Evidence read
- **`c-round-289.json`:** `taskStatus: PASS`, `browserVerified: true`, `realVerified: true`, 0 bugs. 13 rows passed at both viewports. They include the exact add/tempo status, real playback (analyser RMS) and a WAV export bit-identical to HEAD.
  - **BLOCKED (backend unavailable in cloud):** the buyer-side single-run view. Unit test LG5 carries it.
- **`gates/gate-round-289.json`:** `published`, commit `5a911ff` on both remotes. **The round-290 baseline is `5a911ff`.** The tree is clean, and the 1,157 tracked files are frozen in `b-round-289-r290-tree-sha256.txt`.
- **`gates/round-289/review.md`:** score 8.5. It raised two **Medium** findings (S1: the heading may be read twice by a screen reader; S2: doc 216 says "always shows"), plus Lows S3 and S5 and infos S4 and S6.
- **`a-round-289.md`:** reviewer Lows L1–L4 and one Architecture note.

## 2. Backlog changes (version 250; `b-round-289/update-backlog.py` + `update-backlog-2.py` + `update-backlog-3.py` (in-place text fix: HR-C-MANIFEST-FIELDS from round 290; retro_runs lessons names the L4 clause; no new D-ID); backups `b-round-289/*-before-290.*`)
| Id | Change |
|---|---|
| FIX-PD-1b | **მზადაა** (done), from independent C evidence: C PASS, browserVerified true, gate published. F7 and SR-230-6 are closed |
| C-R282-01/02/03, A-R282-REVIEW-DW11 | closed (L7 bookkeeping). Round 283 fixed them and was published, but their status still read "fix dispatched" |
| GATE289-S1, GATE289-S2 (Medium) | open → **FIX-PD-1b2, round 291** |
| GATE289-S3 (+ A-R289-REVIEW-L1 merged), A-R289-REVIEW-L2 | open; fixed early in round 291 (same owner, small cost) |
| GATE289-S5, A-R289-REVIEW-L3, A-R289-REVIEW-L4-MTAVRULI | moved to `deferred_low_polish` |
| SABA-Q-LIB-SINGLE-RUN | `awaiting_user` (C-R289-INFO-02 + S2 product half; asked together with SR-275-6) |
| BACKEND-EVIDENCE-F7, A-R289-ARCH-GROUP-RUNS | evidence item and architecture signal; not scheduled |
| RETRO 290 | `retro_runs` 290 added and `retro_policy.next_due` = round 305 |
| Harness rules | HR-C-MANIFEST-FIELDS and HR-CAPTURE-LANE-BY-NAME added; HR-C-SHADOW-FIELDS retired |
| SYS-VACUOUS-ROWS | added; closes 4 deferred Lows |
| SR-290-1…10 | added as screen-review candidates |
| TLM-R274-SR-HELD-REPEAT | L46 deadline passed; it stays a Saba-owned final-acceptance item |
| Retro candidates | every "RETRO 290" entry dispositioned (D-29z718) |

## 3. RETRO 290 (detail in `retros/retro-290.md`)
**The numbers:**
- 15 rounds: C PASS 12, C FAIL 3 (275, 282, 287), gate failed 1 (276).
- Cost $358.81, of which B spent 51%.
- **All four failures originate in B:** the retro inventory, the SWEEP scope, the pre-check and a clause conflict.

**Experiments:**
- **SWEEP:** refuted.
- **RC-R260-ROW-SEVERITY:** rejected on its own adoption rule. Round 287's Low-only FAIL needed fix-up round 288.
- **New: EXP-R290-ARTIFACT-MANIFEST** (from `consequence-tester`).

**Lessons:** `lessons.md` now has 59 lines.
- L27 is merged into L52, and L17 is folded into L2.
- L56 is new: every cited artifact must exist at hand-off.
- L4 gains a ruling-line clause.

**Disagreements with `tech-lead`, recorded in retro §7:**
- He wanted the row-severity shadow extended and enforced. I rejected the candidate on the data instead.
- He wanted a full-suite pre-check. It is not adopted yet; the cheaper rule is tested first.

**Screen and journey review:** `user-review/screen-review-290.md`.
- The journey was captured on the mock backend: product page, then Studio with stems added and played, then the export dialog. I stopped the mock after the capture.
- **Capture error, reported openly:** my script's lane click hit the pan slider. A separate probe confirms SR-290-3: with Music active by default, Add puts a Stem on Music.
- **Not new:** the toolbar wrapping at 1280 is already SABA-Q-9-TRANSPORT.
- I checked the store tree after every consult: `sha256sum -c` rc 0, status clean.

## 4. Queue and cadence
1. Round 290: RETRO.
2. Round 291: FIX-PD-1b2 (the gate-289 Mediums).
3. REGRESSION: due at the first planning on or after 2026-11-02, after the Medium fix.
4. FIX-PD-1c.
5. SYS-VACUOUS-ROWS.
6. STUDIO-LINK.
7. NAME-AND-HINT.
8. PERF-3c and the rest of STUDIO-PERFORMANCE.
9. STEM-LANES.
10. SYS-1…3.
11. STORE-2b…5, behind the direction gate (`direction-decision.md` is absent).
12. REVIEW-RECOMMENDATIONS.
13. T12-ADVANCED.
14. The phase-2 entries, under the skip rule.

**No frontend-architect checkpoint:** round 289 was one small change on one owner. A-R289-ARCH-GROUP-RUNS stays a signal.

**Ready for commit:** round 289 is already published (`5a911ff`). Round 290 changes no store file; root records the loop state.

## 5. Not COMPLETE, not BLOCKED
- **Not COMPLETE:** FIX-PD-1b2/1c, STUDIO-LINK, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-1…3, SYS-VACUOUS-ROWS, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, the deferred Lows and the Saba-owned manual items all remain.
- **Not BLOCKED:** nothing external is missing for the next round.
