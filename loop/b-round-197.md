# B: Round 197 → 198 planning (D-29z163)

Date: 2026-10-26, planned at 22:34 UTC (`date -u`) · Author: B · Advisor: **available and used**: two calls, one before writing and one review after writing. Both were adopted; see §7.

## 1. Inputs read
- `current-task.md` (round 197), `a-round-197.md` (with the reviewer's Architecture note), `c-round-197.md` and `c-round-197.json`.
- `gates/gate-round-197.json`: **published**, commit `250525200f42…` on both remotes. The baseline for round 198 is HEAD `2505252`, and `git status` is clean.
- `env-status.json`: store 200. `regression-last.json`: 2026-10-24 (round 122).
- `backlog.json`, by id: SABA-B-4, C-R196-*, the `closes_on_stage1_pass` ids, `rounds`, `narrow_grants`, `deferred_low_polish` and the STORE-REDESIGN queue entry.
- `feature-status.md`, by grep only. FB-01..FB-16 map to the SRW items; all of them are done, `c_pass_tech_lead_manual` or `verified_except_manual*`, except SRW-21, which is `deferred_user`.
- Source, read-only:
  - `StudioWorkspace.tsx`: `refreshTrackLaneLayout` at l.695, the ResizeObserver at l.1103, `handleTimelineScroll` at l.1473, the scroller at l.2255, the chrome at l.2266 and the lane map at l.2465.
  - `app/lib/focus-source.ts`.
  - The two `focus()` sites: `ArrangementRuler.tsx:151` and `ArrangementMarkerRow.tsx:202`.
- **Archive:** `tasks/round-197.md` = round-197 `current-task.md` (`cmp` OK). It was created before the new task was written.
- **Backups:** `b-round-197/backlog-before-r198.json`, `feature-status-before-r198.md` and `b-next-before-r198.json`.

## 2. Acceptance results used (independently evidenced by C)
- **C round 197: PASS**, `browserVerified=true`, `realVerified=true`. 12 rows passed. FOCUS-REVEAL-197 was `notRun` under the pre-written R89 stop rule. T-RUN-197 and RING-KEY-197 were partial for that reason only. Nothing was blocked.
- **Backlog changes, from this evidence only:**
  - **SABA-B-4 stage 1 → done** (მზადაა for the stage, not for the item; stage 2 remains). The row is browser-verified in rounds 196 and 197 and published as `2505252`.
  - Closed:
    - **C-R196-01**, by FLAG-RING-197.
    - The pre-written `closes_on_stage1_pass` ids: C-R169-N1-SEARCH-DOUBLE-RING and GATE191-PAN-RESET-DOUBLE-RING (both moved out of `deferred_low_polish` into `closed_findings_d29z163`), ARCH-R191-PAN-RING-COUPLING, C-R177-WZOOM-FOCUS-ON-PRESS and C-R173-N1-OVERVIEW-MOUSE-FOCUS-RING.
    - The Studio half of GLOBAL-FOCUS-VISIBLE-UNLAYERED. Its store half stays open for stage 2.
  - **C-R196-02 stays an open Medium.** C measured it still present (i69–71 and i74 at 1280 rich, 0 ring px, tree = ref).
  - **C-R197-01 (Low)** was added to `deferred_low_polish`, which now has **272** entries (273 − 2 closed + 1).
  - **R88 scope ruling:** A's `isolate` on the flag and `-z-1` on the stem are accepted as part of the R88 flag structure. C's scope note, locked by SFR6 mutants m13/m15.
  - **Process note:** A appended doc 159 once with a shell heredoc. The content stayed inside the grant; this is recorded only.
  - `rounds[197]` → PASS/published. `rounds[198]` and five `narrow_grants` entries were added.

## 3. Decision: round 198 = C-R196-02, ahead of the regression round
- **Policy basis:**
  - The 2026-10-23 bug gate puts Mediums before new scope.
  - The regression rule applies "when … 3 or more days old at the time B plans". Today, 2026-10-26, is 2 days after 2026-10-24, so the regression round is **not due** at this planning.
  - Round 197 §7 said "right after the regression round". That text assumed this planning would fall on or after 2026-10-27. It did not, so the Medium goes first. This is the only deviation from §7, and it is recorded here.
- **Order:** 198 C-R196-02 → 199 REGRESSION (due by then; it also covers the new reveal) → 200 RETRO (policy: at round 200 or the STORE-REDESIGN exit, whichever comes first) → 201 SABA-B-4 stage 2 → STORE-2b.

## 4. Mechanism experiments (B, live, no source change)
B ran these on `:5173` with Chromium 143.0.7499.4. Scripts and JSON are in `b-round-197/`.
- **Start state:** C's rich scene at 1280×720, scroller at its maximum `scrollTop` (46), chrome height 84.
- **Actions:**
  - Tab and Shift+Tab across a full cycle.
  - Playhead grab.
  - Flag `focus()`.
  - F2 rename.
  - Tab onto Snap, then 5 more Tabs.
  - Mouse clicks on Snap and on a lane Mute.

| Mode | Result |
|---|---|
| HEAD | 6 hidden forward / 6 backward |
| `scroll-margin` | no effect (6/6) |
| `scroll-padding` | 0/0 hidden, but grab, flag and F2 jump to **0** |
| `scroll-padding` + negative `scroll-margin` on the chrome | F2 and Tab through the chrome still jump to 0 |
| **keyboard-gated reveal** | 0/0 hidden, every chrome and pointer step stays at 46; 1440 unchanged |

- **Confirmed fact:** a minimal page shows Chromium 143 honours `scroll-margin` only for `block:'start'`, not for `focus()` or `block:'nearest'`.
- **Inference:** the reveal should be element-level, skip the chrome, and be gated on the R85 keyboard signal.
- **Not yet confirmed:** behaviour in Firefox and Safari. They are not available in the cloud and are not claimed.
- **Result:** R91 in the task explicitly lifts round 197's "no focusin handler" ban, for exactly one React `onFocus` on the scroller. Every other scroll mechanism stays forbidden.
- **Smallest honest contract:** vertical only, keyboard source only, chrome excluded. Horizontal reveal under the sticky lane headers is out of scope, because no evidence of hidden horizontal focus exists.

## 5. Scope check (nothing shrunk, nothing deferred without authorisation)
- FB-01..FB-16 and the prototype flows: unchanged. No feature request was relabelled as deferred.
- Professional plugins, effects, pitch and multi-video layers stay out of scope. Grid tempo is not audio stretching.
- Saba's three new queue entries (PHASE2B-SPOTTING, STUDIO-AGENT-COMMANDS, RECORDING-META-S1) were already in `post_current_stage_queue`. Their order is unchanged.
- Protected auth files and `studio.$productId.tsx` are untouched. SRW-21 stays `deferred_user`. `/studio-lab` stays demo-only and public. Real audio and video behaviour is unaffected: the change is a scroll-only focus handler.

## 6. Architecture checkpoint request (to root, bounded, non-blocking)
- **Why now:** SABA-B-4 stage 1 is a feature-stage boundary. The focus area has changed in three consecutive rounds (196–198), all with `StudioWorkspace.tsx` (2645 lines) as one of the owners.
- **Question for the read-only frontend-architect** (per `store/.claude/references/architecture-checkpoint.md`), keep or extract, in at most three sentences:
  1. Should the Studio focus behaviour (the R85 focus-source mount and the R91 reveal handler) stay in `StudioWorkspace`, or move into one small hook?
  2. Should the source-parsing focus tests (SFR1/SFR3/SFR6 exact counts; ARCH-R197-FOCUS-TEST-COST) be replaced by behavioural assertions?
- It does not block round 198. Any approved change becomes its own B task with one owner.
- **Signals recorded, not scheduled:**
  - ARCH-R197-FOCUS-TEST-COST (reviewer Signal 3).
  - A-R196 Signal 4 (the R85 mount owner).
  - ARCH-R193-THEME-REGION.
  - Round 197's Signal 4 on `refreshTrackLaneLayout` is moot, because R89 was reverted.

## 7. Advisor
- **Availability:** the configured advisor was available and was called before writing.
- **Adopted:**
  - Order 198 → 199 → 200, with the UTC timestamp recorded.
  - Two more probes before choosing: scroll-padding with a negative chrome margin, and the keyboard-gated reveal.
  - The round-197 ban is lifted explicitly in the task and in AN-REVIEW-198.
  - React `onFocus` instead of `addEventListener`.
  - The `it.todo` stub is replaced, not deleted.
  - The R89-catching rows are carried over (chrome focus, pointer, load, Shift+Tab, with 1440 as the control).
- **Adopted from the review call:**
  - The task now says that B's probe used a raw `focusin` listener. That the React `onFocus` path has the same timing is an inference, confirmed only by A's live proof.
  - FR-e is marked as a smoke row; SIDE-198 is the real check.

## 8. Readiness for root
- Rounds 196 and 197 were already published (`2505252`). Nothing is pending publication from B.
- Round 198 baseline: clean `2505252`. Frozen list: 1027 entries. 3 grants and 2 new files.
