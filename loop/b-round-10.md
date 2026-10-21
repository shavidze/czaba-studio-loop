# B — Round 10 decision record (round 11 planning, bounded workflow)

Date: 2026-10-10 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing. §4 lists the advice I applied. A second call followed after writing (§9).

**Subagents.** B's session has no Agent tool. The `design-philosopher` and `code-reviewer` runs stay with A.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- `current-task.md` (round 10), archived unchanged as `tasks/round-10.md`.
  - The archive was made with `cp -n`.
  - No earlier `round-10` archive existed, so nothing was overwritten.
- `a-round-10.md`, `c-round-10.md` and `c-round-10.json`.
- `backlog.json` v11 (SRW-03, SRW-05, SRW-10, SRW-11B), `feature-status.md`, `b-round-9.md`, `b-next.json`, `publication-checkpoint.json` and `root-pre-push-review.md` (L8).
- `plan.md`: D-19, D-29, D-29a (with its round-9 lines), §4, §5 and §10.
- `tasks/round-5.md:135`. The original RF5-2 is `vt ∈ [2, 4]` 300 ms after each wrap, plus the D-19 drift thresholds.
- `tasks/round-7.md:159`. Here B wrote the regression window [2.29, 2.31], taken from C round 6's observed values (`c-round-6.md:61`).
- `tasks/round-7-before-bounded-policy.md` §7.2 and §7.4 (the stage-2 draft).
- Source, read-only, to make the task concrete:
  - `ArrangementVideoDock.tsx` l.378–560. The swap block seeds `lastSample`; the rate write is at l.547 (`videoRateCorrection(drift)`). A post-swap flag can gate the deadband at that one call without touching `issueHoldSeek` or the stall path.
  - `video-sync.ts` constants: deadband 0.02, gain 4, step 0.05.
  - `panels.ts`.
  - `ArrangementDetailPanel.tsx` l.375–560 (size state, separator handlers).
  - `ArrangementLane.tsx`: a row `flex`, header and an `h-20` body.
  - `ArrangementClip.tsx`: `laneTrackIdAtPointer` is rect-based; there is an `h-5` header, a range body and trim edges.
  - `StudioWorkspace.tsx`: the scroller `ResizeObserver` l.204–218, marquee rows l.485+, `isSeparatorTarget` l.115/733/743 and the layout l.862–1039.
- `git status --short`: HEAD `c5ed47b` + 15 M + 9 Studio `??` + 2 foreign `??`, which matches C's round-10 end state.

## 2. Backlog v12 (only what C evidenced)

| Item | Change | Evidence |
|---|---|---|
| rounds[10] | **verified**, C FAIL on R10-W1 only. `c_passed` is C's `passed[]` verbatim. The adjacent PASSes are listed separately, and R10-W3 is "not applicable". | `c-round-10.json`, `c-round-10.md` §1–§4 |
| SRW-10 / C-R7-02 | **resolved**. The R10-R1/R10-R2 evidence and the named exception R10-N5-U (before and after) are recorded. `remaining` is now only the Tech Lead real-mouse/wheel check, so the item stays `verified_except_manual`. | `c-round-10.md` §3 |
| SRW-03 / C-R7-01 | Stays **open**. It gains `round10_result` (27/27 wraps settle at about −0.02), `spec_finding` (where the window came from) and a route to round 12 under D-19a. | `c-round-10.md` §2, §7; `a-round-10.md` §1.1 |
| SRW-05 | `evidence_round10` (R5-L3, R5-E1 PASS); route → round 12. | `c-round-10.md` §4 |
| SRW-11B | Stage 2 is dispatched in round 11 with the D-29b acceptance. Stage 3 moves to round 13. A new `polish_round` (round 14) holds L11, M1, M-R10-1/M2, L2–L8 and design (a)–(d). | planning |
| `open_findings` | New: `harness-H3` (resolved, a B decision), `vitest-sfx-library-timeout-flake` (watch) and `c-r10-stale-root-L8` (resolved). The foreign-file note is updated. | §5 |
| `planned_rounds`, rounds[11], `baseline_tree_at_round11`, `vitest_floor_round11` = 812 | New. | planning |

- Nothing was set to done: SRW-10 stays `verified_except_manual`.
- The 21 regression-debt IDs are unchanged, and none counts as PASS.
- Scripts: `b-scripts/plan-r11.js` (backlog, with a v11 guard) and `plan-md-r11.js` (`plan.md`, unique-match replacements).
- Backups: `%TEMP%/b10bak/` (backlog v11, `feature-status.md`, `b-next.json`, `plan-before-b10.md`).

## 3. C's bugs → routing

| Bug | Severity | Route | Why |
|---|---|---|---|
| C-R7-02 | Low | **Closed** | <ul><li>R10-R1 PASS: overflow 0.5/0.48 px, 0 at the empty default, 0 overlap or cut labels, and `nLabels` identical to round 7.</li><li>R10-R2 PASS: C's own esbuild guard.</li></ul> |
| C-R7-01 | Medium | **Round 12 under D-19a** | <ul><li>A refuted (a), (b), (d) and (m) with 18 instrumented wraps.</li><li>C saw the same systematic d(+300) of −0.017 to −0.020 in 9/9 valid wraps on clean source.</li><li>The ±0.01 window is B's own round-7 rule, while the original RF5-2 is [2, 4] plus D-19. D-19 stops correcting at 0.02, so the two B rules contradict.</li><li>As with B-R5-01 → D-24a, B resolves its own contradiction. It does so in the **stricter** direction: the app converges tighter after a swap, and the window is not widened.</li><li>The headless post-start freeze is still environment, so the Tech Lead quiet-Chrome RF7-3 run remains required evidence.</li></ul> |
| C-R6-02 | Medium | Tech Lead quiet Chrome (unchanged) | No new evidence; its files stay frozen. |
| C-R8-01 | Medium | Tech Lead quiet Chrome (unchanged) | No new evidence. Round 11 adds one mode-D info run; the playhead-writer region is frozen and diffed by C. |

None is critical, a security issue or a data-loss bug, and none blocks stage 2. "C bugs first" is therefore applied as follows:
- the actionable bug (C-R7-01) gets the next bug round (12), with a concrete app-side spec;
- the other two stay with their external evidence.

Round 11 starts the next independent feature, as the workflow requires. Stage 2 had already slipped three times.

## 4. Round 11 design choices (advisor-confirmed)

1. **One feature: stage 2 only.** It covers fold, height, auto-fit and the D-29b reconciliation. The policy forbids mixing bug work in, so the panel polish items move to a named round 14 instead of riding along.
   - They are recorded in `backlog.json` → SRW-11B `polish_round`.
   - Their files must stay frozen anyway: `ArrangementContext.tsx` and `ArrangementLibraryPreview.tsx` for the Tech Lead C-R8-01/C-R6-02 run, and the dock/`video-sync.ts` for round 12.
2. **D-29b (a B decision on D-29a's open question).**
   - At 1280×720 the draft R11-P2a was about 8–12 px impossible: lanes get about 224 px, and the minimum is about 236 px.
   - The smallest honest fix keeps D-29's lane minimums (agreed prototype values) and lets the detail panel yield first, down to 120 px. It has 24 px of slack.
   - The user's own separator action wins and turns the cap off for the session. The drag and key step start from the rendered height, so nothing jumps.
   - D-29a's mount decision is unchanged.
   - A re-measures the budget on the current layout before code. If the cap never engages, A reports it, and C checks that.
   - R11-P2a is rewritten to "panel rendered height in [120, 144], 4 lanes, ruler and loop visible, no vertical scroll". There is also a user-override check.
3. **Detail panel edit is fenced.**
   - Only the cap prop, the user-resize callback, the drag/key starting point and `aria-valuenow`/`aria-valuetext` may change.
   - The playhead-writer region (R9-D3), the waveform, the overlay and the inputs are byte-unchanged; C diffs that region.
4. **Meaningful checks rather than assumptions:**
   - mixed-height cross-lane drag both ways (onto and off a folded lane);
   - marquee and library drop;
   - folded-export equality (maxDiff ≤ 1.2e-7);
   - folded M silencing the music oracle;
   - Space on the fold button not starting the transport;
   - the registry claim on the height handle;
   - header overflow (`scrollHeight ≤ clientHeight + 1`) at every height;
   - one guard proof on the pure maths.
5. **Design check.** A invokes the real `design-philosopher` on the fold button, the folded/compact header and the handle affordance. Acceptance IDs win over a conflicting ruling, which is recorded as a follow-up.
6. **Regression scope (focused):**
   - R11-P1b, R11-P1c quick, R9-D3 quick plus the region diff;
   - RF7-P2 (the test, plus a browser render count of 0 for lanes and clips on position updates);
   - R8-M1, R6-S2 and R12-L3 on default heights;
   - R10-N8/R11A-3 shots;
   - one mode-D R3-V1 info run;
   - G11-1..3.

## 5. Uncertain contracts: the smallest honest choice

- **H3 (wrap landing rule, from round 12's verdict).** Evaluate on one row: |vt − expected(ctx)| ≤ 0.01 at the first rAF with ctx ≥ wrap + 0.300. Alternatively, interpolate to exactly +0.300 (C's `d300`).
  - Today a fixed 2.30 is compared with a sample whose phase varies by about 10 ms, so the same lag reads as PASS or FAIL (W_5 vs W_2).
  - H3 does not re-score round 10: R10-W1 fails under both forms.
- **D-19a, chosen over a window change.**
  - Re-deriving the window from D-19's settle would read as relaxing a tolerance, which the approved workflow forbids without the Tech Lead.
  - The settle band applies only after a swap, because A's steady-state data (median |d| 0.010–0.013) shows that a global deadband cut would cause rate hunting.
  - The Tech Lead can still choose to revisit the window; that alternative is recorded in D-19a.
- **Fold/height details left to A, with a check:**
  - the compact header layout at 36 and 52–60 px. M, S and the fold button stay reachable; Volume is reachable at every unfolded height ≥ 60;
  - the row-height convention (81 px today, including the border).

  C asserts no overflow and ±1 px alignment.
- **Folded clip.** Range creation is not possible (no body); the title tells the user to unfold. This is the D-29 text, made testable with an exact Georgian string.
- **Stale carry.**
  - C round 10 §9 listed root L8 (`new AudioContext` not wrapped) again. It was closed in round 4: R4-B6, `c-round-4.md` §7, line 303. The round-11 task names it in the closed list.
  - Still carried and honest: the purchased loader hardcodes middle-east (SRW-21), Lenis on `/studio/*` (Tech Lead), portable instruction-file paths, the export 0 dBFS hard-clip (R13-M4, SRW-13), and the final commit/push only after everything.
- **Not a new bug:**
  - the 8.44–8.47 s hard seek is the Pause snap known since round 5;
  - the `sfx-library.test.tsx` timeout is an unreproduced load flake, now a `watch` finding.

## 6. For root

- The two foreign untracked files are still present at the end of round 10: `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml`. A, B and C did not touch them. Root should confirm where they came from.
- C round 10's fake-Bearer studio-token check was partial, because backend 5199 was down (500, no token issued). This is the same as rounds 8 and 9. A full check needs the backend running.

## 7. Decision

**CONTINUE.** Not COMPLETE:
- C-R7-01, C-R6-02 and C-R8-01 (Medium) are open;
- SRW-11B stages 2 and 3 and the polish round are not done;
- SRW-13..20 have not started, and the SRW-21 adapter is not done;
- SRW-10 and SRW-23 wait on Tech Lead manual checks;
- the 21 regression-debt IDs are unverified;
- T12 follows.

Not BLOCKED:
- Round 11 is fully specified, and nothing in it needs external information, approval or credentials.
- Round 12 is also specified (D-19a).
- The Tech Lead quiet-Chrome run is required evidence to *close* C-R6-02 and C-R8-01, and extra evidence for C-R7-01. No other work waits on it.

## 8. Files written by B this round

- `tasks/round-10.md` (archive copy) and `b-round-10-checkpoint.md`.
- `current-task.md`: round 11, SRW-11B stage 2.
- `feature-status.md`, `backlog.json` v12, `b-next.json` and this file.
- `b-scripts/plan-r11.js` and `plan-md-r11.js`.
- `docs/technical/studio-real-workspace/plan.md`:
  - D-19a (after D-19) and D-29b (after D-29a);
  - the FB-01, FB-08 and FB-16 rows;
  - the round table (11 stage 2, 12 C-R7-01, 13 stage 3, 14 polish, then 15–22);
  - the advisor line;
  - §10: the round-10 result, the round-11 line and the "remaining" lines.

No app source, test or other agent's file was touched.

## 9. Second advisor call (after writing)

The advisor was available and was called after all files were written. It confirmed CONTINUE, round 11 = stage 2 and round 12 = D-19a. I applied its corrections with `b-scripts/fix-r11-advice.js`:

1. **D-19a was infeasible under D-19's own gain bound** (K ∈ [2, 5]).
   - With K = 4 the time constant is 0.25 s. From the −0.05 peak at about +90 ms, the lag is still about −0.02 at +300 ms, which is what C measured, whatever the deadband.
   - Reaching 0.01 needs about K ≈ 8.
   - D-19a (in `plan.md`, the task §9 and the backlog) now allows **K ≤ 10 during settle only**. The steady-state K and the rate band [0.5, 2.0] are unchanged.
   - Round 12 must also prove **0 stall escalations** in the simulation and in the verdict runs, because a settle rate near 1.5 approaches `VIDEO_STALL_LAG_RATE`.
   - The round-12 verdict ID is **R12-W1** (the R10-W1 rule under H3), so the evidence trail stays unambiguous.
2. **The doc-019 wording claimed a resolution.** It now says "routed to round 12 under D-19a", not "resolved by".
3. **The D-29b cap needed a stable reference frame.**
   - The cap is now computed from the invariant column height: scroller `clientHeight` + the panel's rendered height. This avoids a feedback loop when the panel opens, and a unit test proves the invariance.
   - The detail panel's 300 ms transition fires the scroller `ResizeObserver` on every animation frame. A either recomputes once after it settles, or keeps the recomputes render-free. C counts lane renders during a toggle; more than one lane render per changed height value fails R11-P2a.
4. **The frozen check now uses C's own round-10 hashes** (`c-round-10/frozen-check.txt`, `hashes.txt` and the `cmp` of the dock and `video-sync`) wherever they cover the file. A's start list is used only for the rest.
5. **The FB table's round column in `plan.md`** now uses the new numbering (15–22) for FB-04/05/06/07/09/10/11/12/13/14.

The decision is unchanged: **CONTINUE**.
