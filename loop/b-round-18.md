# B — Round 18 decision record (round 19 planning, bounded workflow)

Dispatcher: B · Date: 2026-10-11 · Workflow: `docs/technical/studio-real-workspace/agent-workflow.md`.
B owns only planning artifacts. No app source, test or store doc was touched by B in this step.

Advisor: **available**. Called once after orientation and before writing (§4), and once before declaring done (§9).

## 1. Inputs read

- `current-task.md` (round 18). It was archived **as a copy** to `tasks/round-18.md` before any edit. No archive existed, and `cmp` confirmed it was identical.
- `a-round-18.md` (full), `c-round-18.md` (full), `c-round-18.json`.
- `backlog.json` v19, `feature-status.md`, `b-next.json`, `b-round-17-checkpoint.md`, `b-scripts/status-r18.js`, `plan-md-r18.js`, `feature-status-r18.js`.
- `plan.md` (initial full plan): D-29i, §5 rounds table and dependency graph, §10 status.
- `ArrangementDetailPanel.tsx` l.288–347 (info column, labels, width token).
- Test-impact grep (advisor §9): `start, წმ`, `end, წმ`, `start`, `offset` and `w-56` in `detail-panel`, `detail-panel-polish`, `track-layout` and `render-budget` tests. The only hit is the frozen footer string at `track-layout.test.tsx` l.851, and the footer does not change. No frozen or existing test queries the changed labels or the width token.
- Root carry from `root-pre-push-review.md` and `publication-checkpoint.json`, as already tracked in `feature-status.md` §6 and C §8. C's new carry line (CDP allowlist) was added to the task.
- Live tree check:
  - `sha256sum -c b-round-17-tree-sha256.txt` → 46 OK, 2 FAILED. The failures are exactly the two round-18 owned files, the same as C's G18-2;
  - live hashes of the panel `9ba5fa3b…`, the test `58cbe600…`, doc 026 `70b1fd62…` and doc 027 `d1691838…` all equal C's and A's records;
  - `git status --short` has 42 lines; HEAD is `c5ed47b`.

## 2. C's round-18 result, as evidenced

- **taskStatus FAIL, only on R18-D.** C-R18-01 (Medium): design (d) was not delivered. A stopped under the §1.4 stop rule, and C re-measured and confirmed the stop to ±0 px.
- **PASS:** R18-L4, R18-W, R18-B, R18-L6, R18-A and R18-Doc. Adjacent checks also passed: R8 detail quick, R16-H1 quick, R16-F1 quick, R9-D3/RF7-P2 and the range on the lane. G18-1..3 passed, with vitest 996/996.
- **R18-U:** green for L4, W, (b) and R9-D3, and guards M1–M7 each caught their mutation. The (d) part and guard 6 are missing.
- **C's notes for B:**
  - the "1280 at 142" group condition cannot be reached (panel 122, D-29g residual);
  - `ArrangementLane.tsx:661` has a different `biome-ignore` reason (L6 analogue);
  - the `Control+a` harness note;
  - the CDP allowlist carry.

## 3. Decisions

### 3.1 Status changes, only from C evidence

- **Backlog v20.**
  - Round 18 is set to `c_fail`, with C's passed list.
  - C-R18-01 is opened under SRW-11B.
  - `evidence_round18` is added.
  - L4, L11, (b) and L6 are recorded as DONE follow-ups on C's evidence. These are evidence lines; no feature item is promoted.
- **SRW-11B and FB-08 stay ბაგია**, because C-R8-01 and C-R18-01 are open.
- SRW-01 and SRW-22 gain `c-round-18.md` evidence lines (G18-3, export sanity, header link).
- **Nothing is closed without C evidence.**

### 3.2 A's deviations and C's notes (D-29j)

- **A deviation 2 is accepted:** post-Apply normalization keeps today's display. C verified it with guard M6.
- **A deviations 4–7 are accepted:** measurement by page-state width, row labels read from `header`, 1280 group panel 122, and as-is shots.
- **The "1280 at 142" group wording was a B error.** Round 19 compares fit with the round-18 record instead: group at 1280 = panel 122, 106/85.
- **`ArrangementLane.tsx:661` reason text:** recorded for the milestone fix round or SRW-17. That file is frozen now.

### 3.3 Round 19 = C-R18-01 (bug before feature)

**Decision: widen the info column `w-56` → `w-72` (288 px) and apply the five D-29i texts.**

Why this width:
- the blocking line needs 259.81 px, which leaves 28 px of headroom at 288 px;
- `w-68` would leave only 12 px. That is fragile against real Windows Georgian font metrics, the same concern as R17-T;
- the single state stays 11111;
- the group stays 1112: the 395 px group note already wraps, and the start · length line now fits. So no new scroll;
- the price is −64 px of waveform (704 → 640 at 1440/288, 352 → 288 at 1280/480). That stays ≥ 128 everywhere.

Rejected options (recorded in D-29j):
- **two rows:** +18 px against 3 px of slack;
- **a shorter label:** it departs from the prototype wording;
- **range labels only:** a partial (d) and a half-Georgian panel;
- **`w-68`:** too little headroom.

Safety:
- A measures 288 px in page state first;
- A stops if any line wraps (except the group note), a truncate row is below 16 px, `scrollHeight` exceeds the round-18 record, the waveform is below 128 px, or a range label exceeds 80 px;
- there is no further fallback width. Stopping returns the decision to B.

Scope and ownership:
- **Owned:** the panel (5 text nodes and 1 token), `detail-panel-polish.test.tsx` (add only; the 13 existing tests stay byte-identical), and doc 027 (status and a (d) section). No new doc number, because 027 already covers 14b.
- **Frozen:** everything else, against `b-round-18-tree-sha256.txt`.
- **Tech Lead:** new manual check R19-T (labels in real Windows Chrome).

## 4. Advisor advice applied

The advisor was called after orientation and before writing. Its advice and what B did with it:
- **Take `w-72` as the single measured candidate** (28 px headroom), instead of B's draft order `w-68` → `w-72`. **Applied.**
- **Round 19 is C-R18-01 only**, owning the panel, the polish test and doc 027, with vitest floor 996 and guards 6 and 7. **Applied.** B added guard 6b (a range label).
- **Fix both wording items:** the 1280 group panel is 122, and fit is compared with the record. **Applied.**
- **Backlog v20 with round 18 `c_fail`**, deviation 2 accepted, the Lane:661 note, and the baseline note. **Applied.** B checked that `tech_lead_manual_checks` already holds `R18-T` (renamed in round 17), so no fix was needed.
- **SRW-11B and FB-08 stay bug**, with no per-item promotion. **Applied.**
- **CONTINUE**, with C-R18-01 added to the remaining list. **Applied.** `POLISH-14B` was replaced by C-R18-01, which carries its last open part.

## 5. Artifacts written

| Artifact | Note |
|---|---|
| `tasks/round-18.md` | copy of the round-18 task (archive) |
| `b-round-18-tree-sha256.txt` | 50 files: the round-17 list re-hashed, plus the polish test and doc 027. All 50 are OK on the live tree |
| `backlog.json` v20 | `b-scripts/status-r19.js`, backup `backlog.before-r19.json`; R19-T added |
| `docs/technical/studio-real-workspace/plan.md` | D-29j, the rounds table (row 19), §10 status; script `plan-md-r19.js`, backup `plan.before-r19.md` |
| `feature-status.md` | `b-scripts/feature-status-r19.js`, backup `feature-status.before-r19.md` |
| `current-task.md` | round 19 (D-29j) |
| `b-next.json` | CONTINUE; backup `b-scripts/b-next.before-r19.json` |
| `b-round-18-checkpoint.md` | progress checkpoint |

## 6. Round-19 acceptance summary

| ID | What it checks |
|---|---|
| R19-D1 | The five texts, the verbatim `aria-label`s and the verbatim footer |
| R19-D2 | One line per info `<p>` (except the group note), truncate rows 16 px, `scrollHeight` = the round-18 record, info 288, waveform = A's record and ≥ 128, labels ≤ 80, panel heights 144 / 142 / 122 |
| R19-A | Apply quick: button and invalid input |
| R19-U | The (d) tests and the `w-72` token test; guards 6, 6b and 7; C re-runs round-18 guards M1 and M5 |
| R19-Doc | Doc 027 |

- **Adjacent checks:** R8 detail, R18-B, R18-W, R16-H1/F1 and RF7-P2 (Play from Home).
- **Gates:** G19-1..3.

## 7. Remaining scope (not shrunk)

- **C-R18-01** (round 19).
- **Milestone full regression:** 21 regression-debt IDs, C-R12-01 under RF5-3, SRW-11B end to end, one quick per ready FB.
- **Milestone fix round:** A's round-11 follow-ups and the `ArrangementLane.tsx:661` reason text.
- **SRW-13** (FB-04/05/14, export hard-clip, M1/L8 if the Tech Lead run has not happened), then SRW-14/15 (FB-13/09/11, grid tempo only), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07) and SRW-20.
- **SRW-21 adapter.** The route mount needs Tech Lead or auth-owner permission.
- **T12** after all of the above.
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3 and the manual list (now with R19-T).
- **Root carry** as listed in the task §6.5.
- **Out of scope** for the whole project: plugins/effects, pitch, multiple video layers and audio time-stretch.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - SRW-13..20 (FB-04..07, FB-09..14) are not started;
  - SRW-11B has two open Mediums;
  - the milestone regression and the Tech Lead checks are pending.
- **Not BLOCKED:** round 19 needs no external information, approval or credentials.

No critical or high bug is open.

## 9. Second advisor call

Called after every artifact was written. Advice and action:
- **Grep the frozen and owned tests for the changed strings and the width token before closing.** Done (§1). It is clean: only the frozen footer string matched, and the footer does not change. No test grant is needed, and the 13 existing polish tests stay byte-identical.
- **Say how the width test finds the wrapper, which has no test id.** Applied in R19-U: it uses the first element child of `arrangement-detail-content`, and no attribute is added to the component.
- The rest (D-29j rationale, the 122 / 106/85 wording, floor 996, the 50-file manifest, CONTINUE with C-R18-01) was confirmed as consistent with C's numbers. Round planning complete.
