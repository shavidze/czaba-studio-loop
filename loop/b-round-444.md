# B round 444 → 445 planning

**Advisor:** available; consulted after orientation (before the sketch) and before hand-off.
**Archive:** `tasks/round-444.md` = the round-444 task, copied byte-identical (`cmp` OK) before `current-task.md` was rewritten. The pre-edit copies `b-round-444/backlog-before-445.json` and `feature-status-before-445.md` were saved first.
**Baseline:** gate 444 `published`, commit `616729c` (`gates/gate-round-444.json` field `commit`); store tree clean at the end of planning (`git status` 0 lines).
**Regression:** not due (`regression-last.json` 2026-11-10 → due ≥ 2026-11-13). Next RETRO: round 450.

## 1. Round 444 accepted (D-29z1579), from C evidence only
- `c-round-444.json`: PASS, `browserVerified`/`realVerified` true, 0 bugs.
  - C5: IME search `ALL OK (18 cells)`; HEAD control `14 of 18 failing`.
  - C6: `ALL OK`. C7: `ALL SAME`.
  - Gate 444 published `616729c` on both remotes.
- Closed: A-R203-REVIEW-M1.
- A-R203-REVIEW-I1 is closed for the **AltGr half only**. Gate-444 finding 1 shows that macOS Option in Chrome and Safari is unchanged, so that half becomes GATE444-L1-MACOS-OPTION (Low, `deferred_low_polish`, plus a TLM step). No Mac heuristic is guessed without a real Mac.
- A-R444-REVIEW-L1 → A-R444-REVIEW-L1-ALTGRAPH-META (deferred; focus-source is not owned by stage 2b).
- **A-R444-REVIEW-I1 is reproduced by B in real Chromium.** At HEAD, holding Escape to close the sheet, Export, the BPM edit or the marker editor collapses the expanded video: 8 of 14 cells (`b-round-444/probe/compare-head.txt`). It is raised from Info to Low and fixed in round 445.
- Gate-444 findings 2–4: no fix; finding 3 is noted in doc 290. Architecture notes: SIG-R444-COMPOSING-LIB-HELPER (signal); A's note → `confirmedBy` on TL-R444-L2.

## 2. Round 445 = SYS-3 stage 2b, the last stage (D-29z1580)
- **Scope:**
  - `inlineEditorKeyIntent` (other / composing / held / settle) for the five inline editors, with per-handler side effects kept;
  - the Workspace video Escape branch ignores repeats;
  - IME6 split + `toBe(shown)`;
  - IME11–IME15, FV-HELD;
  - docs 288/289 → Completed, doc 289's FT9 prose → AltGr only, new doc 290.
- **Equivalence evidence:** IME12 pins the HEAD truth table (`defaultPrevented`, reached document) for every editor × Enter/Escape × composing/held/plain. B ran IME12/IME13 unchanged on a clean `616729c`: 10/10 pass.
- **B's pre-check on sketch v2 (sha `07714283`):**
  - typecheck 0;
  - lint 205 warnings (= HEAD);
  - scoped Biome 0;
  - covering 60 files / 1082 tests;
  - full suite 277 files / 4071 tests, rc 0;
  - mutants 12/12 red;
  - real Chromium on a sketch server: video probe `ALL OK (14 cells)` with `FRESH ALL SAME (14 cells)` vs HEAD; stage-1 sites/held and stage-2a search `ALL OK (18 cells)`; plain held keys `ALL SAME (18 cells)` vs HEAD. One cold-start cell was re-run (environment).
  - L31 headroom OK (`logs/l31-headroom.txt`); L50: 62 hits and one class ruling.
- **tech-lead** (`b-round-444/sketch-review.md`):
  - v1: approve-with-changes, 0 Medium+. L1–L3 and Info 1 applied.
  - v2 delta: approve.
  - R1: GATE443-L1 has no user-visible effect; it closes when C's run of the GAIN/LIBSEARCH probe cells passes.
  - R2: swallowing the repeat is correct.
  - R3: the deferral is confirmed, but doc 289 prose is corrected this round.
  - R4: LeadMagnet → TL-R445-R4 (store Low).
  - Keep the helper; no flag-driven extraction.
- **Ruled out:** unifying `stopPropagation` across the editors. It legitimately differs per editor, and HEAD has no red cell for it.

## 2b. Additions after the advisor's hand-off check
- L29 grep over the task: 0 untagged hits. The doc text A edits is pinned by K28 (doc 289 Option phrase ×1; doc 288 old IME6 title ×1). The simulated post-A clone also applies those two edits, so `claims-445-sketch-output.txt` holds the real expected values.
- L47: no BODY expected value. Export's fresh Escape returns focus to the toolbar "Export" button (`probe/export-focus-head.json`). Tempo's blur is HEAD behaviour, neither changed nor ruled here (round 443 wording).
- L50: command pasted into the task. L56: K18 covers 22 artifacts. L58: `sketch-review.md` opens with the dispatched sha256, and `l58-check` is OK.
- D-29z1580 states why a new Low is fixed now (2026-10-23 exception).
- `tools/l57-check.py c-round-444.json`: L57 OK (`b-round-444/l57-check-c444.txt`).
- Checked for new Saba input: no new `agent-workflow.md` section after 2026-11-10, and no STEM-LANES answer, so "awaiting Saba" stands.

## 3. Order (D-29z1581)
1. Round 445 (SYS-3 stage 2b; SYS-3 is complete on its C PASS).
2. REGRESSION-2026-11-13 (first planning on or after 2026-11-13).
3. STORE-REDESIGN 2b…5.
4. ARCH-SPLIT (root's frontend-architect checkpoint first).
5. REVIEW-RECOMMENDATIONS.
6. T12-ADVANCED.
7. Phase 2 under the skip rule.

No new architecture checkpoint request. SYS-3 adds one small pure helper (tech-lead: keep), and ARCH-SPLIT already carries its root checkpoint step. Signals recorded: SIG-R444-COMPOSING-LIB-HELPER and TL-R445-I1.

## 4. Files written by B
- `current-task.md` and `tasks/round-444.md`.
- `backlog.json` (v431; deep-diff vs `b-round-444/backlog-before-445.json` touches only the intended keys).
- `feature-status.md` and `b-next.json`.
- `b-round-444/`: sketch v1/v2, review, grants, claims and both outputs, probes, mutants, logs, `update-backlog.py`.

Scratch dirs outside the loop (`/tmp/b444-*`) do not survive the job and are not cited as evidence.

Commit readiness for root: round 444 is published. B has nothing new to commit (loop state only).
