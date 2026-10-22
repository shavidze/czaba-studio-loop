# B round 77 → round 78 planning (D-29z43)

Date: 2026-10-22 · Author: B · Advisor: **available and used** (two consultations: one before writing, one final review. The final review's fixes are applied: a second on-grid marker 12.000 for REG-MARKERS/REG-SNAP-SEEK, a behaviour-based RU-DBLCLICK row, wider pixel margins at 6.10/6.8, and the ruler-playhead forwarding clause).

## 1. Inputs read (as data)
- `context/active-summary.md`, `context/active-backlog.json` (read first, as required). Specific IDs were looked up in `backlog.json`, `plan.md` and `feature-status.md` with grep.
- `tasks/round-77.md`: this is the round-77 task, an exact `cmp` copy of the old `current-task.md`. It was created this phase and did not exist before.
- `a-round-77.md`, `c-round-77.md`, `c-round-77.json`, `gates/gate-round-77.json`, `gates/round-77/review.md`, `env-status.json`, `regression-last.json`.
- `root-pre-push-review.md` and `publication-checkpoint.json`: no root finding newer than the 2026-10-21 visual-A queue note. That note keeps VISUAL-A-OBSIDIAN after T12 and phase 2 BLOCKED. It is not scheduled now.
- Source at `60006d4`: every `resolveGridTime` / `snapTimeToGrid` call site in `ArrangementRuler.tsx`, `ArrangementClip.tsx`, `ArrangementLoopBrace.tsx`, `StudioWorkspace.tsx`, `grid.ts` and `loop.ts`, plus the frozen MU tests that touch the ruler.

## 2. Round 77 result: C evidence only
- **C PASS, `browserVerified=true`, `realVerified=true`, 0 bugs.**
  - Rows passed at both viewports: EK-ACTIVE, EK-SELECT, EK-RANGE, EK-BUTTONS, EK-MARKER-SEL, EK-AUDIO (real onset 71/82 ms; negative control silent for 1.3 s), EK-PLAYING, EK-ALT-LINUX, EK-GUARDS, REG-NUDGE, REG-MARKERS, T77-TARGETED (9 files / 202 tests), REG-HYD, G77-3 and SOURCE-UNCHANGED.
- **Gate 77:** published `60006d4305c4ef316f5459e6fa29a48e7931b36c` to both remotes. Review 9/10, COMMIT OK. Verify: 107 files, 1824 tests, build OK.
- **Backlog change:** SRW-16 stage 2b-2 → `c_pass_published`, with evidence c-round-77.md/.json and gate-round-77.json.
  - The Apple Option path is covered by vitest only. It is not a browser row, because Linux Chromium cannot be an Apple platform. Tech Lead check R77-T stays open.
  - The fake-Bearer 403 sub-check stays BLOCKED (backend unavailable in cloud). It remains open evidence for a later backend-enabled check and is not a bug.
- **SRW-16 as a whole stays "მუშავდება"** until 2b-3 has C browser evidence.

## 3. Signals recorded (not scheduled unless stated)
| ID | Source | Disposition |
|---|---|---|
| GATE77-S1-MAC-OPTION-NOT-ADVERTISED | review S1 | Lows batch, merged with R77-BUTTON-SHORTCUT-SUPERSET / ROOT-R69-L2 / ROOT-R73-S2 (no platform-dependent render string) |
| GATE77-S2-DOC067-STATUS | review S2 | **Granted in round 78:** one status line, the same pattern as GATE76-S4 |
| GATE77-S3-EDGE-SET | review S3 | Lows batch (optional `Set`) |
| GATE77-S4-EN10-CLOCK | review S4 | Watch; use `fakeClock.base` if it ever flakes |
| ARCH-R77-RESOLVE-ARROW-SHORTCUT | review Architecture note + A note (`timeline-stops`) | Goes into the SRW-16 boundary checkpoint request (§5). Reviewer verdict: keep for now |
| A-R77-CARRIED-POINTS | c-round-77 For B §4 | Lows batch: EN7 Option+Shift nudge, misleading `adjacentMarkerTarget`/`stepMarker` names, Ctrl+← repeat while playing, Alt+← Back |
| C-R77-OBS-RANGE-INTERVAL-WORDING | c-round-77 For B §1 | Acknowledged as **B's spec wording**, not an A defect. `allTracks` means every edge on every track, which matches the Live §6.9 text |
| C-R77-OBS-RANGE-SELECTS-CLIP | c-round-77 For B §2–3 | Harness note (click mid-lane; a range drag also selects its clip) |
| R78-T-TECH-LEAD | new | Real-Chrome feel check of marker capture on the 10 s grid |

## 4. Round 78 choice and rationale
- **Is a regression round due?** No. `regression-last.json` is 2026-10-21 (round 71) and today is 2026-10-22, so the first regression round is due on or after 2026-10-24.
- **Open C bugs:** none. **Critical/High:** none.
- **Next scope in dependency order:** **SRW-16 stage 2b-3.** D-29z41 R2 split stage 2b in three and the scope is fixed; 2b-3 is the last part.
- **Contract: the smallest honest behaviour (T1–T7).** It reuses the 2b-1 rule exactly:
  - At every site where a user time is resolved with a non-null step today, the result is the nearest of the grid line and the marker times.
  - A tie goes to the grid line. There is no pixel radius.
  - The bypass matrix is the one C measured in MS-SNAPOFF-ALT.
  - With no markers, the result is unchanged at every site. This is the invariant that keeps all frozen tests green.
- **Sites (all B-read in the source):** P1 ruler click, P2 ruler playhead scrub, P3 empty-lane click, P4 click in a clip waveform, P5 in-clip range edges, P6 loop brace move and resize.
  - **Loop move:** start **or** end lands on a marker, the same as a clip move. After an off-grid marker snap, `moveLoop` already keeps the length in ms.
- **Not changed (decisions):**
  - Loop arrow keys stay on the grid.
  - The marker drag does not snap to other markers (the collision refusal stays).
  - The playhead arrow keys keep their 0.1 s step.
  - Clip edges are not added as cursor candidates. Nobody requested them, and Live's cursor-to-locator behaviour is unconfirmed.
- **The ruler is unfrozen** for one optional getter prop and three expressions. Markers are read at event time, so there is no `useArrangement` and no render dependency.
  - This is the main regression exposure, so C re-runs the dedicated RU-DBLCLICK script.
- **Ableton:**
  - Clips → locators: confirmed in §6.7.
  - Cursor → grid: confirmed in §6.10.
  - Cursor, time selection or loop brace → locators: **unconfirmed**, recorded as a CZABA decision. It is not to be described as Live behaviour.
- **Real-audio discriminator (MT-AUDIO):**
  - On the 10 s grid, a ruler click at about 4.0 lands on the marker (6.375), where the soloed SFX starts. The meter must rise within 0.3 s.
  - Without the marker candidate, the click lands on 0 and there is 6 s of silence.
  - Negative control: an Alt click is free (about 4.0), so the meter shows no rise for 1 s or more.
- **Owner risk:** this is the largest 2b sub-stage (four components plus `grid.ts`). `StudioWorkspace` is touched only at P3 and the ruler prop; `handleKeyDown` is untouched. A has a stop-and-report clause. The scope is not shrunk.

## 5. After round 78
1. **Round 79:** most likely the **REGRESSION round** (planning on or after 2026-10-24).
   - C re-verifies every done / c_pass item in the browser at both viewports and runs `npm run test:e2e:smoke`.
   - A fixes only what C finds.
   - B updates `regression-last.json` when that round closes.
2. **Checkpoint request to root at the SRW-16 boundary**, once 2b-3 has C evidence. It is bounded and non-blocking:
   - Signals: ARCH-R77-RESOLVE-ARROW-SHORTCUT (pure arrow-shortcut resolver), the `timeline-stops` module idea, ArrangementMarkerRow owner risk, the `isFollowAutoScroll` duplicate, ARCH-R76-SNAP-TARGETS-HELPER (`snapTargetsFor`), GATE76-S2 (MS8c group fallback), and the outstanding ARCH-CHECKPOINT-SRW14-PREFS items.
   - Root uses `store/.claude/references/architecture-checkpoint.md`.
3. Then the GATE75 S1–S3 marker-drag fix-up, then SRW-17 … SRW-20, the Lows batch, SRW-21, the final regression, T12, and VISUAL-A-OBSIDIAN (root order).

## 6. Artifacts written by B this phase
- `tasks/round-77.md`: copy of the old current-task.md.
- `current-task.md`: the round-78 task.
- `b-round-77.md`: this file.
- `b-next.json`.
- `b-round-77-r78-tree-sha256.txt`: 455 entries, 455/455 OK.
- `b-round-77-r78-snapshots/`: 6 files plus SHA256SUMS.
- `b-round-77/`:
  - backups of `backlog.json`, `plan.md` and `feature-status.md` from before this phase;
  - `update_backlog.py`.
- `backlog.json`:
  - version 77;
  - SRW-16 2b-2 marked c_pass_published, and stage 2b-3 added as dispatched;
  - round 77 closed and round 78 added;
  - 9 open findings added.
- `feature-status.md`: header, current round, the Round 77 result, the FB-10 and SRW-16 rows, and the history line.
- `docs/technical/studio-real-workspace/plan.md`: D-29z43 added, and the FB-10 map row updated.

B did not touch app source and did not commit or push. `regression-last.json` is unchanged, because no regression round closed.
