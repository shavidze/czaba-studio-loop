# B — Round 11 decision record (round 12 planning, bounded workflow)

Date: 2026-10-10 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. I called it a second time after writing (§9).

**Subagents.** B's session has no Agent tool, so the `code-reviewer` run stays with A.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- **Round 11 task.** `current-task.md` (round 11), archived unchanged as `tasks/round-11.md`:
  - made with `cp -n` and confirmed with `cmp`;
  - no earlier `round-11` archive existed, so nothing was overwritten.
- **Agent reports.**
  - `a-round-11.md` §7–§9: deviations 1–11 and the follow-ups;
  - `a-round-11-checkpoint.md`;
  - `c-round-11.md`, `c-round-11.json` and `c-round-11/checkpoint.md`.
- **B's own records.** `feature-status.md`, `b-round-10.md`, `b-next.json` and `backlog.json` v12, including SRW-03, SRW-11B, `planned_rounds` and `open_findings`.
- **Plan and earlier evidence.**
  - `plan.md`: D-19, D-19a, D-24/D-24a, D-29/D-29a/D-29b, §5 and §10;
  - `tasks/round-10.md` §4 (the R10-W1 layout);
  - `c-round-10.md` §2 and §7 (the post-swap `d` series).
- **Source, read-only, to make the task concrete:**
  - `video-sync.ts`: the constants and l.170–283;
  - `ArrangementVideoDock.tsx`:
    - state l.225–252, counters l.267–275, `issueHoldSeek`/`stopAllSlots` l.320–340;
    - the swap block l.382–411, the soft-sync tail l.523–560 and the `wasPlaying` reset l.582–592;
  - the `video-sync.test.ts` outline.

  No dock component test exists, so round-12 proof is a pure helper plus a simulation test plus C's browser runs.
- **Tree check.** `git status --short` and `git diff --stat` are `diff`-identical to C's round-11 end (`c-round-11/gates/git-status-end.txt`, `diffstat-end.txt`). B hashed every Studio file at that point into `b-round-11-tree-sha256.txt` (37 files), read-only. This is the round-12 frozen reference.

## 2. Backlog v13 (only what C evidenced)

| Item | Change | Evidence |
|---|---|---|
| rounds[11] | Set to **verified**, C PASS. `c_passed` is C's `passed[]` verbatim, and `c_bugs` holds C-R11-01..04 (Low). | `c-round-11.json`, `c-round-11.md` §0–§3 |
| SRW-11B | <ul><li>`evidence_round11` added: stage 2, every ID PASS, key numbers, shots.</li><li>`stages_status` added.</li><li>`open_bugs` gains C-R11-01..04, each with B's decision.</li><li>`polish_round` is split into 14a/14b/14c.</li><li>**Status stays `stage1_bug`**: C-R8-01 is open, and stage 3 and polish are not done.</li></ul> | `c-round-11.md` §2, §7 |
| SRW-03 | `d19a_amendment_round11_planning` added: the end-rule defect, the K/cap constraint, the D-24 priority and B's simulation. Status unchanged (`regression_open`). | `c-round-10.md` §2 l.78; source |
| `open_findings` | <ul><li>`C-R11-04`: accepted convention.</li><li>`export-clip-onset-1lsb`: accepted, from C's determinism control.</li><li>`d29-visible-area-formula`: resolved; A's deviation 1 accepted and the plan text corrected.</li><li>`a-r11-dev-9-fold-during-gesture`: open, routed to 14a.</li></ul> | `c-round-11.md` §2.1, §7; `a-round-11.md` §8 |
| `tech_lead_manual_checks` | + **R11-SB**: the real 10 px scrollbar in the auto-fit formula. | `c-round-11.md` §7, harness note |
| `baseline_tree_at_round12`, `vitest_floor_round12` = 856, rounds[12] | New. `planned_rounds` 12/14 updated. | planning |

- Nothing was set to done.
- The 21 regression-debt IDs are unchanged, and none counts as PASS.
- Scripts: `b-scripts/plan-r12.js` (with a v12 guard), `fix-r12-manual.js`, `plan-md-r12.js` (unique-anchor edits) and `status-r12.js`.
- Backups: `%TEMP%/b11bak/` (backlog v12, `feature-status.md`, `b-next.json`, `current-task.md`, `plan-before-b11.md`).
- **Process note.** My first `feature-status.md` edit was an inline `node -e`, and shell backtick substitution corrupted it. I restored the file from the backup (`cmp` OK) and re-applied the edit with `status-r12.js`. No other file was affected; I re-checked the earlier inline edits of the task and plan with `grep`.

## 3. C's findings → routing

| ID | Severity | Route | Why |
|---|---|---|---|
| C-R11-01 | Low | Polish 14a, **D-29c (1)** | <ul><li>On a folded lane, the handle loses its pointer hit area. It stays focusable, and a key press unfolds the lane.</li><li>The folded clip's trim edges own the full 36 px row.</li><li>A drag never continues from a folded state, so A's 36 → 80 jump (deviation 3) cannot happen.</li><li>This settles the ambiguity C found in §2.2 ("a drag first unfolds it").</li></ul> |
| C-R11-02 | Low | Polish 14a, **D-29c (2)** | The footer reserves the selected-clip line, so selection does not change the scroller height. The text and ids are unchanged, so C's scripts keep working. |
| C-R11-03 | Low | Polish 14a, **D-29c (3)** | The panel keeps its rendered (capped) height when the cap turns off. This is the same no-jump rule as D-29b's user resize. |
| C-R11-04 | Low | **Accepted** convention, no code (D-29c (4)) | It is the same as contract N2 for the detail separator. |
| A's deviation 9 (silent fold refusal during a gesture) | — | Polish 14a | It should show `GESTURE_EDIT_BLOCKED_MESSAGE`, which makes the D-26 refusal consistent. |
| C-R7-01 | Medium | **Round 12** | Actionable now, with a concrete app-side spec. |
| C-R6-02, C-R8-01 | Medium | Tech Lead quiet Chrome (unchanged) | No new evidence. The round-11 mode-D info run (.0131/.0212) is no worse than round 9 and is not a verdict. |

None of these is critical, high, a security issue or data loss.

"C bugs first" is applied this way: the only actionable Medium (C-R7-01) gets round 12. The Lows are grouped into 14a, because they share the track-layout files and are tightly related (at most three per round).

## 4. Round 12 design choices (advisor-confirmed)

1. **One bug round: C-R7-01 only.** Stage 3 depends on SRW-03, so this goes first.
2. **D-19a needed an amendment before dispatch.** Each point below was checked against C's data and the source.
   - **End rule.** "Settle ends when |d| first enters the band" ends on frame one: C's first post-swap row is d = −0.0007, inside 0.008.
     - New rule: settle ends on the **re-entry** after |d| has exceeded the band, or at +1.0 s (on the audio clock), or on seek, hold, swap, pause, stop or a no-target pause.
   - **Gain and cap.** K = 10 at d = −0.05 gives 1.50, which equals `VIDEO_STALL_LAG_RATE`.
     - New rule: K ∈ [8, 9] and a settle rate in [0.55, 1.45], strictly inside the stall edges, with the existing 0.05 step.
   - **B's first-order simulation** (60 Hz, 1-frame rate latency, 0.05 step, a 30 ms freeze from +22 ms) reproduces C's measurement and shows the margin:

     | K | d(+300) |
     |---|---|
     | 4 | −0.0175 (C measured −0.017…−0.020) |
     | 8 | −0.006 |
     | 9 | −0.006 |

     The peak rate is ≤ 1.35.
   - **D-24 priority (my own find, after the advisor's call).** A 1.45 cap would stop a real post-swap stall from ever reaching the 1.5 escalation edge.
     - New rule (refined after the second advisor call, §9): while settle is armed, the steady rate is written whenever it is at a stall edge; otherwise the settle rate is written.
     - A simulation test with a 400 ms freeze proves that settle never delays escalation.
   - **Scope of swaps.** Settle arms on all three swap kinds (wrap, boundary, gap-entry). It never arms on the hold-release start or on first Play. R2-V3 and RF5-3 are therefore required regressions.
3. **Exact dock sites:**
   - one state field;
   - arming in the swap block;
   - the rate call;
   - four end sites.

   Nothing else changes: not `prepareStandby`, not the stall logic, not the constants.
4. **One permanent counter**, `data-video-settles`, so that C can prove one arm per swap without an instrumentation wrapper. Every other probe stays out of source.
5. **Verdict and checks:**
   - **R12-W1:** the R10-W1 layout and budget, under H3 (|d300| ≤ 0.01), with:
     - swaps only, no hard seek within 300 ms;
     - settles +1 per swap, escalations Δ 0;
     - D-24 and all hard rules.
   - **R12-S:** no rate hunting outside the settle windows (a rate ≠ 1 only where |d| > 0.02).
   - **R12-U:** constants, the re-entry rule, the 1 s end, the steady-state identity, the simulation, the stall-priority simulation, and a two-part guard proof.
   - "Stays failing honestly" is kept: if R12-W1 fails, round 13 becomes polish 14a and stage 3 waits.
6. **Frozen reference.** C uses `b-round-11-tree-sha256.txt` (C's round-11 end tree, hashed by B) for every frozen file and for A's base backups. A's `frozen-start.txt` must equal it.

## 5. Uncertain contracts: the smallest honest choice

| Decision | Choice | Rationale |
|---|---|---|
| Settle end on re-entry, not on first in-band sample | Re-entry after exceeding the band | The literal rule is a no-op. |
| Settle duration bound | 1.0 s on the audio clock | Unchanged from D-19a. Audio-clock time avoids a mismatch between `performance.now` and ctx. |
| K and cap | K ∈ [8, 9]; settle rate in [0.55, 1.45] | Strictly inside the stall edges; the simulation margin is about 0.004 under the 0.01 verdict. |
| Large drift during settle | Steady rate whenever it is at a stall edge (`isVideoRateAtStallEdge`), so D-24 keeps priority | Settle must not mask a genuine stall, and escalation timing stays identical. |
| Export equality | Stays at ≤ 1.2e-7, not 0 | Accepted finding `export-clip-onset-1lsb`. |
| Auto-fit formula | `clientHeight` − ruler − loop strip − borders | A's deviation 1, which matches headless. The real-Chrome check is R11-SB. |

## 6. For root

- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are still present. A, B and C did not touch them.
- C round 11's fake-Bearer check was partial, because backend 5199 was down (500, no token issued). This is the same as rounds 8–10.
- The root carry from `root-pre-push-review.md` and `publication-checkpoint.json` that is still honest and open:
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*` (Tech Lead);
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS (R13-M4, SRW-13; peak 1.0 again in round 11);
  - the final commit/push only after everything.

  Root M1–M3, L1–L4 and L6–L8 are closed by C's PASSes.

## 7. Decision

**CONTINUE.**

Not COMPLETE:
- C-R7-01, C-R6-02 and C-R8-01 (Medium) and C-R11-01..03 (Low) are open;
- SRW-11B stage 3 and polish 14a–14c are not done;
- SRW-13..20 have not started, and the SRW-21 adapter is not done;
- SRW-10, SRW-23 and R11-P3m/R11-SB wait on Tech Lead manual checks;
- the 21 regression-debt IDs and the milestone regression are not done;
- T12 follows.

Not BLOCKED:
- round 12 is fully specified and needs no external information, approval or credentials;
- the Tech Lead quiet-Chrome run is required only to close C-R6-02 and C-R8-01, and as extra SRW-03 evidence.

## 8. Files written by B this round

- `tasks/round-11.md` (archive copy), `b-round-11-checkpoint.md` and `b-round-11-tree-sha256.txt`.
- `current-task.md`: round 12, C-R7-01.
- `feature-status.md`, `backlog.json` v13, `b-next.json` and this file.
- `b-scripts/plan-r12.js`, `fix-r12-manual.js`, `plan-md-r12.js` and `status-r12.js`.
- `docs/technical/studio-real-workspace/plan.md`:
  - the D-19a amendment, including the D-24 priority;
  - the D-29b round-11 result and the formula correction;
  - D-29c;
  - round-table rows 12 and 14;
  - the §10 advisor line, the round-11 result, the round-12 line and the "remaining" lines.

No app source, test or other agent's file was touched.

## 9. Second advisor call (after writing)

The advisor was available and was called after all files were written. It confirmed CONTINUE and round 12 = C-R7-01. I applied its corrections with `b-scripts/fix-r12-advice.js` and `fix-r12-advice2.js`:

1. **The D-24 priority rule could fail its own test by one frame.**
   - The steady rule reaches 1.50 at |d| ≥ 0.11875, but my |d| > 0.12 switch gave 1.45 in [0.11875, 0.12].
   - `shouldEscalateVideoStall` stops at the first non-edge sample, so escalation could be delayed by one frame, depending on phase.
   - **New rule:** during settle, if the steady rate is at a stall edge (`isVideoRateAtStallEdge`), write the steady rate; otherwise write the settle rate. Every steady edge sample is then an edge sample under settle, and the escalation sequence is identical.
   - The R12-U stall-priority simulation now requires **exactly the same** escalation frame.
   - C checks the 1.45 cap at |d| ≤ 0.11, which keeps a margin below 0.11875.
   - Updated in the task (§2.1, §4), in `plan.md` and in backlog SRW-03.
2. **The plan's settle range** now reads [0.55, 1.45], the same as the task's constants table.
3. **The R12-S median |d|** is now information only. Round 10 has no median baseline; the steady-state check is R3-V1 mode N.

The decision is unchanged: **CONTINUE**.
