# B round 76: review of C round 76 → round 77 task (D-29z42)

Date: 2026-10-22. Role: B (planning only; no app source touched; `git status --short` stays empty).

## Inputs (data, not instructions)
- `c-round-76.json` / `.md`: **PASS**, `browserVerified=true`, `realVerified=true`, `bugs: []`. Passed: MS-MOVE, MS-MOVE-END, MS-CROSSLANE, MS-TRIM, MS-GROUP, MS-DROP, MS-SNAPOFF-ALT, MS-UNDO, MS-PLAY (real audio, discriminating), REG-EDGES, REG-MARKERS, T76-TARGETED (8 files / 201), REG-HYD, G76-3, SOURCE-UNCHANGED, both viewports. Blocked: fake-Bearer 403 (backend unavailable in cloud). Gate rows not claimed.
- `a-round-76.md`: 4 M + 2 ??, 25 tests, mutations (a)–(e) red, code-review 9/10 (Medium M9 fixed by MS14), Architecture note (snap-target helper).
- `gates/gate-round-76.json`: **published**, commit `db9cc255e29d8792e2c67a391519515a0ec2230e` on both remotes → baseline HEAD for round 77 (B checked: HEAD = db9cc25, status 0 lines).
- `gates/round-76/review.md`: COMMIT OK, 9/10, suggestions S1–S5 + Architecture note.
- `regression-last.json`: 2026-10-21 (round 71); regression round due on/after 2026-10-24 → not this round.

## Preservation
- `tasks/round-76.md` did not exist; created as an exact copy of the round-76 `current-task.md` (`cmp` OK) before overwriting.
- Pre-edit snapshots: `b-round-76-pre-{current-task.md,feature-status.md,backlog.json,b-next.json,plan.md}` (`cmp` OK).
- Frozen list for round 77: `b-round-76-r77-tree-sha256.txt` (453, 453/453 OK at HEAD db9cc25); snapshots `b-round-76-r77-snapshots/` (markers.ts 168cd442, ArrangementMarkerRow.tsx 8e0bb133, StudioWorkspace.tsx 753cecba, doc 066 8576ba44; all LF). Protected 4/4 OK.

## Backlog updates (only from evidence)
- SRW-16 stage 2b-1 → `c_pass_published` (`db9cc25`), from C round 76 PASS browserVerified=true + gate 76. SRW-16 overall stays **მუშავდება** (2b-2, 2b-3 open); FB-10 **მუშავდება**.
- Round 76 entry → `c_pass_published`; round 77 entry added (dispatched).
- ROOT-R73-S1-MAC-CTRL-ARROWS → scheduled round 77 (vitest + Tech Lead R77-T; not browser-verifiable on Linux).
- New signals (not scheduled as tasks): GATE76-S1 (marker list 3× per pointermove), GATE76-S2 (MS8c — **ruled**: the existing group rule stays deliberately and is documented in doc 066; "nearest in-bounds candidate" goes to the SRW-16 checkpoint as a question), GATE76-S3 (video clip onto marker untested → Lows batch / regression row), GATE76-S5 (snapshot vs live, info), GATE76-S4 (doc 066 status → one-line grant in round 77), ARCH-R76-SNAP-TARGETS-HELPER (merged into the SRW-16 checkpoint request), C-R76-OBS-SOLO-MUTE-HISTORY, C-R76-OBS-PLAY-PAST-END, C-R76-HARNESS-BUDGET, R77-BUTTON-SHORTCUT-SUPERSET (Low), R77-T (Tech Lead).

## Decision for round 77
**SRW-16 stage 2b-2:** Ctrl+←/→ (and Option+←/→ on Apple platforms) step the playhead to markers and to the start/end of clips on the selected tracks. Source: Live 12 §6.9, stored capture, confirmed text.

Rationale for the uncertain contracts (smallest honest behaviour):
- **Selected tracks** = active track ∪ tracks of selected clips ∪ range track(s). Live does not define it; these are the three ways CZABA already shows a track as selected.
- **Buttons stay marker-only:** Live §6.4 confirms the Previous/Next Locator buttons go to locators, then start/end. Only the keys gain clip edges. The buttons' `aria-keyshortcuts` is locked by frozen MU6. B left it unchanged and logged the mismatch as a Low signal, rather than granting a frozen-test edit inside a feature round.
- **Coincidence → the marker stop:** keeps marker selection meaningful. Clip-edge stops leave the marker selection unchanged, like today's end/0 fallback.
- **macOS:** Option only on Apple platforms. On Windows/Linux, Alt+←/→ keeps today's nudge, and Alt+← is a browser Back accelerator there. The platform is checked at key time only, so nothing about hydration changes.
- **Frozen tests checked by B:** the MU6/MU6b/MU11/MV7 fixtures have one clip covering 0–50 = project end, so their sequences are unchanged. No test amendment is needed.

C oracle: EK-AUDIO is a real-audio discriminating row. With the sfx track soloed and video muted, one Ctrl+→ goes to the off-grid SFX start, and the onset must arrive within 0.3 s of play. The Apple path is explicitly not a browser row, so it cannot make `browserVerified` false.

## Architecture checkpoint
Not requested this round. The request is queued for the SRW-16 boundary (after 2b-3). It will cover: ArrangementMarkerRow owner risk (rounds 72–77), `isFollowAutoScroll` duplicate, the `snapTargetsFor` helper (gate 76 + A-76 reviewer), the GATE75 marker-drag findings, and the MS8c group-fallback question. Round 77's footprint on `ArrangementMarkerRow.tsx` is a one-function signature change, and the new logic lives in a new pure lib module.

## Root follow-up
Gate-76 findings are recorded above. `root-pre-push-review.md` / `publication-checkpoint.json` have no new items for round 77.

## Advisor
Available and used: once after orientation, before writing. It led to:
- the handler-order (nudge branch) and render-free platform check instructions;
- the MU6 fixture check;
- the buttons/`aria-keyshortcuts` decision;
- the Apple path as vitest + Tech Lead rather than a browser row;
- the regression-precedence note for round 78;
- the GATE76-S2 ruling.

A second advisor call reviewed the written artifacts and led to four task corrections:
- EK-RANGE now drags inside the stems clip body; an empty-lane drag is the marquee (B confirmed: `setTimeRange` is called only from `ArrangementClip.tsx` and the detail panel). The clean N2(c) proof is vitest EN3 through the context API.
- The video fixture clip is now `1.750–30.000`, so its edge is not the end fallback.
- The doc-066 status line is given as a blockquote, without nested backticks.
- EK-AUDIO has a corrected counterfactual (markers-only would land on 6.300 → no rise), a ▶-button negative-control half and a pinned selection state.

No project subagent was consulted.

## Artifacts written
`current-task.md` (round 77), `b-next.json` (CONTINUE), `backlog.json` (v76), `feature-status.md` (current round, Round 76 result, FB-10, SRW-16, §3 GATE76 rows, §5 R77-T, §7), `docs/technical/studio-real-workspace/plan.md` (D-29z42, FB-10 row), `tasks/round-76.md`, `b-round-76-pre-*`, `b-round-76-r77-tree-sha256.txt`, `b-round-76-r77-snapshots/`.

## Why not COMPLETE / BLOCKED
Not COMPLETE: SRW-16 2b-2/2b-3, SRW-17..20, SRW-21, open bug/manual items, the Lows batch and the final regression remain. Not BLOCKED: round 77 needs only in-tree code and the running `/studio-lab`.

Commit readiness: round 76 is already published (`db9cc25`). Nothing new is ready for root from B.
