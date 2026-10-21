# B — Round 3 decision record

Date: 2026-10-07 · Author: B (task writer / dispatcher)

**Advisor.** The advisor was available. I called it once, after orientation and before writing, and received advice that I applied:
- two independent tracks;
- a rewritten "one `<video>`" contract;
- naming the continuity bug;
- measuring M2 before refactoring;
- the Chrome 121 scrollbar pitfall;
- splitting SRW-11.

I make a second call after writing (§7).

**Subagents.** B's session has no Agent tool, so I could not run the `design-philosopher` subagent. I read `.claude/agents/design-philosopher.md`, and the round-4 task requires A to invoke it before any Track U UI.

**MCP connectors.** Several connectors (Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo, marketing Amplitude/Slack) need authorisation in claude.ai connector settings, or via `/mcp` in an interactive session. None were needed here.

## 1. Inputs read

**Previous task.** `tasks/round-3.md` is a byte-identical copy of the round-3 `current-task.md` (checked with `cmp`). The original was replaced by round 4, not deleted.

**Loop documents:**
- `a-round-3.md` and `c-round-3.md` / `c-round-3.json`;
- `backlog.json` (v3), `plan.md`, `b-initial.txt` (the original full scope), `orchestrator-decisions.md`, `b-round-2.md`;
- `root-pre-push-review.md`, `publication-checkpoint.json`, `all-files-review.md`, `all-files-security.md`;
- `next-stage-t12/README.md`.

**Spot-checks of C's evidence:**
- `c-round-3/gates-done.txt`, `build.txt` `BUILD_EXIT=0`, `hashes-final.txt` 4× OK;
- `r3v1_7.summary.json`: max 0.2877, pass=false, 0 writes while seeking;
- `r3v1_4.summary.json`: pass=true;
- `l6_5.json`: max 1.3287, seek at 6.518 with pending.

All of these match C's tables.

**Source read:**
- `ArrangementVideoDock.tsx` (whole file; the seek decision is at 168–200 and the `clipChanged` hard seek at line 176);
- `video.ts` (whole file);
- `ArrangementContext.tsx`: tick, hold, `fillLoopIterations`, `startGraph`, `syncPlayback`, `previewArrangement`/`commitArrangement`, undo/redo;
- `StudioWorkspace.tsx`, `ArrangementLibrary.tsx`, `ArrangementTransport.tsx` (the Delete label);
- `studio-lab-demo.ts`, `demo-synth.ts`, `types/arrangement.ts`, `routes/studio-lab.tsx`;
- `components/layout/Header.tsx`;
- `app/styles/base/utilities.css` (`.styled-scrollbar`);
- `app.css` tokens.

**Prototype library markup** (`index.html` 11–19) and the Ableton LIB-01..08 and PRE-01..05 rows.

**Fixtures:**
- `ffprobe`: 640×360 VP9 at 30 fps;
- the H.264 fixture has a single keyframe.

## 2. Backlog changes (only what C evidenced)

| Item | Before | After | Evidence |
| --- | --- | --- | --- |
| SRW-06 | in_progress | **done** | C PASS R6-S1..S5, R6-U1, including the marquee while playing and the group move heard at its new time. No R6 bug. |
| SRW-05 | in_progress | **in_progress** | C PASS R5-L1..L5, E1 and U1. **R5-L6 FAIL** (C-R3-02). C-R3-04 and C-R3-06 are attached. |
| SRW-03 | in_progress | **in_progress** | R3-V1 failed again under RF3-1 (5/15). C-R2-01 → **superseded** by C-R3-01: the seek-while-seeking and learned-lead mechanisms are gone, but the tolerance still fails. C-R2-02 → **resolved**, per C ("C-R2-02 itself is fixed"); the residual is tracked as C-R3-03 (Low). |
| SRW-02 | in_progress | **in_progress** | R2-V3 playback is 3/5 under RF3-1. The offset maths are still exact. |
| SRW-01 | done | done + open bug **C-R3-05** (Medium) | Gesture/history core. Routed to R4-B1. COMPLETE needs it closed. |
| SRW-11 | todo | split into **SRW-11A** (round 4, in_progress) and **SRW-11B** (todo) | See D-22. This is scope reorganisation, not a reduction. |
| SRW-12 | todo | **in_progress** (round 4) | User priority. Stem acceptance added: R12-S1, R12-S2, R12-U. |
| SRW-22, SRW-23 | — | **new, in_progress** | User requests in `publication-checkpoint.json` (entry, scrollbars). |
| Root review | — | `open_findings` | L2, L3, L4, L8, M1 and M2 are open and routed. L1 → C-R3-04/05. L5 and L7 are accepted. L6 is noted for SRW-20. M3 is resolved (C §8). |
| Round 3 | dispatched | verified: FAIL 18/21 | `c-round-3.json` |

The gates were re-run by C: tsc 0, vitest 604/604, build OK, biome 0 errors, 4 hashes OK.

Purchase protection was preserved:
- anonymous `/api/studio-token` returns 401;
- a fake Bearer token returns 500 and no token is issued;
- `/studio/middle-east` shows "Sign in required";
- `/studio-lab` makes no auth or R2 traffic.

## 3. C's bugs → routing (bugs first)

| Bug | Decision | Where |
| --- | --- | --- |
| C-R3-01 (High), C-R3-02 (High) | **D-19** (§4). | RF4-1, RF4-2 |
| C-R3-03 (Low) | `play()` fires at `startAt − measured frameInterval`, not via a React state. The criterion is refined with a rationale: startAt to +100 ms ≤ 0.1 (decoder ramp, the global max), then ≤ 0.06. `play()` timing stays strict (±20 ms). | RF4-3 |
| C-R3-04, C-R3-05 (Medium), root L1/L4 | **D-20**: Undo/Redo is ignored during an active gesture, with a status message. Gestures clear their state and the preview-active flag on unmount or when capture fails. | R4-B1, R4-B2 |
| C-R3-06 (Low) | Transport positions stay stable (±1 px) across the 4 selection states. The R1-B5 "closes the gap" meaning stays visible. | R4-B3 |
| root L3, L2, L8, M1 | Delete ignores repeat. Running flag after the **sounding** `startAt`. A Web Audio failure shows a status instead of throwing. A timer-driven loop refill, so wraps survive without rAF. | R4-B4..B7 |
| root M2 | Measure first. The position store is built only if the commit time is > 4 ms per frame, or a rAF gap > 50 ms coincides with a commit. This follows the project's ban on drive-by refactors. | R4-M2 |

## 4. Why D-19, and not more constants

C's data separates the causes:
- **(ა)** A running seek takes 0.3–0.9 s headless, so any lead ≤ 0.15 lands behind and cascades.
- **(ბ)** The 1.15 rate ceiling is too slow. The rate is pinned at 1.1–1.15 even in passing runs, which is a systematic lag.
- **(გ)** A plain bug: a hard seek at continuous boundaries.

The fixtures are only 640×360, so decode load is not the explanation.

The fixes, cause by cause:
- **For (გ):** a `continuous` flag on `VideoTarget`.
- **For (ბ):** a wider band ([0.5, 2.0], |d| ≤ 1.0). This is safe because the element is always muted (D-13), so pitch never matters.
- **For (ა):** latency cannot be removed, so predictable discontinuities (wraps, non-continuous boundaries, gap entries) are moved to a pre-seeked **standby `<video>`** and swapped at the exact audio time. Unpredictable seeks use seek-and-hold, the same mechanism as the start hold that already passes.
- **The sync loop leaves React render.** This removes up to 250 ms of render lag (A's own deviation note) and the C-R3-03 detection lag.

**Contract change.** "Exactly one `<video>`" becomes "exactly two, both muted, one visible, at most one playing outside a ≤ 34 ms swap". C samples `[data-video-role="active"]`.

**Thresholds.** They are **not** relaxed: median ≤ 0.05 and max ≤ 0.1 per run, over 15 + 5 runs, with the starvation rule unchanged. The only new exclusion is the window after a hard seek (issue → `seeked` + 300 ms): no frame can be presented during a seek. Under D-19, R3-V1, R2-V3 and the loop runs should contain no hard seeks after the start.

**Diagnostic.** C adds a reported H.264 diagnostic that does not affect the verdict.

## 5. Round 4 scope and rationale

**User steering** (`publication-checkpoint.json`, 2026-10-07) explicitly asks for these immediately after the critical sync fixes, and says the next task must include the entry alongside them:
- scrollbars;
- the library tree, stems and left panel;
- a discoverable Studio Lab entry.

So round 4 has two tracks:
- **Track S:** sync and bugs. Done first and verified first.
- **Track U:** SRW-22, SRW-23, SRW-12 and SRW-11A.

Separate "not ready" lists keep an unfinished Track U from hiding Track S. This adds user-requested scope; nothing was removed or deferred.

The smallest honest choices for uncertain UI contracts:
- **Header entry (SRW-22).** `Header.tsx` is a narrow grant: exactly two `Link` additions, under the user's "allowed non-auth header/navigation ownership". The label `Studio Lab` has a `Demo` badge, because header nav is English. `noindex` stays, and the sitemap is not touched. A `← CZABA` exit is added because the lab is full screen.
- **Scrollbars (SRW-23).** One class-string constant using webkit pseudo-elements; no `scrollbar-color` on the same element, because Chrome 121+ would ignore the pseudos. `scrollbar-gutter: stable`. The thumb has ≥ 3:1 contrast, so `dim` or `muted` rather than `outline-hover`. Mint on hover. `app/styles/**` stays forbidden.
- **Demo stems (D-21).** 4 separately synthesised parts of one composition, plus their exact sum as the full mix. This gives an export oracle and pairwise distinctness. Everything is labelled synthetic. The public MP3s are never presented as stems, and no R2 or purchased audio is used.
- **Add target (D-21).** Enter and ＋ keep adding to the active audio track, as verified in R1-B1 and matching Ableton's selected-track rule. Drag supplies placement by lane and time.
- **Dock placement (D-22).** Collapsing a library that also contains the video dock would hide the video. The prototype's agreed place for the compact box is above the timeline, on the right. A's `design-philosopher` run confirms or records a conflict. Floating video stays SRW-11B.

## 6. Decision

**CONTINUE.**

COMPLETE is not met:
- 2 High bugs are open (C-R3-01 and C-R3-02), and so are 2 Medium and 2 Low;
- SRW-02, SRW-03 and SRW-05 have failing acceptance;
- SRW-07..SRW-23 (except SRW-21's blocked mount) are not evidenced;
- T12 is queued.

BLOCKED does not apply: no external information, approval or credentials are needed. SRW-21's route mount stays blocked only for the protected file, and its adapter part is independent.

**Recorded for root and the Tech Lead** (not acted on by B; also in `backlog.json` `tech_lead_notes`, `final_commit_push_authorization` and `post_current_stage_queue`):
- `cc1e531` committed the protected files plus `.agents/`, `.codex/` and `AGENTS.md`. The hashes still match the baseline.
- The purchased loader hardcodes `middle-east`, so other products get token 200 and then worker 403.
- `api.studio-token` doesn't trim the category, and Studio and download derive `userId` differently (auth agent).
- `AGENTS.md` and the `.codex` agent reference `.Codex/*` paths that don't exist.
- The cookie banner covers the footer (root).
- Export clipping (→ SRW-13 R13-M4).
- The user's T12 reaffirmation and the final-only commit/push authorisation, which belong to root.

## 7. Files written by B this round

- `tmp/studio-real-loop/tasks/round-3.md` (copy, verified identical)
- `tmp/studio-real-loop/current-task.md` (round 4)
- `tmp/studio-real-loop/backlog.json` (v4)
- `tmp/studio-real-loop/b-round-3.md`, `tmp/studio-real-loop/b-next.json`
- `docs/technical/studio-real-workspace/plan.md` (D-19..D-22, FB-08 row, rounds table, status)

Helper scripts used to patch the JSON and markdown live in the system temp directory (`%TEMP%\b-r3\`), outside the repo.

No app source, protected file or other agent's file was touched.

## 8. Second advisor call (after writing) and fixes applied

The advisor reviewed the written artifacts and found three criteria that would have failed falsely. All are now fixed in `current-task.md`:

1. **R12-S1.** It asked for 4 stems at 0, which is impossible: 3 audio lanes and no overlaps. It is now:
   - a buffer oracle: the JS sum of the 4 stems equals the full mix, max diff ≤ 1e-6;
   - an export oracle: 3 stems on 3 lanes equal the JS sum of those 3.
   The backlog R12-S1 entry was updated to match.
2. **R4-B7.** A no-op rAF stub would permanently break the self-re-arming tick. It is now a queue-then-flush stub, which mirrors a hidden tab.
3. **RF4-3 vs rule 7.** The early side is capped: `startAt − min(frameInterval, 20 ms)`. The late bound is one measured rAF interval, max 34 ms.

Also added:
- C harness notes: spy on both `<video>` nodes, because `vfc.js` patches one instance (confirmed by reading it); re-resolve the active role on every sample; the R3-V4 and R4-P1 wording under D-19.
- The mint hover check falls back to Tech Lead if the tool cannot hover the thumb.
- The `00:10.000` format.
- `Header.tsx`: do not fix its pre-existing diagnostics.
- The SRW-18/SRW-19 wording.
- The plan.md dependency graph now shows SRW-11A/11B, SRW-22 and SRW-23.

SRW-01 stays `done` with an open Medium bug (C-R3-05). The COMPLETE gate requires zero open bugs, so this cannot pass silently.
