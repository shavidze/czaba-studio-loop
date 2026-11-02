# B round 302 → 303 planning

**Date:** 2026-11-02. **Decisions:** D-29z788 to D-29z792. **Next task:** `current-task.md`, round 303, NAME-AND-HINT-b (Saba Q5: a one-time name-bar hint).

The round-302 task is archived as `tasks/round-302.md`. It was copied, not moved; no archive existed before.

## 1. Evidence read
- **C round 302** (`c-round-302.json`, `c-round-302.md`): **PASS**.
  - 21 rows passed, 0 bugs.
  - `browserVerified` and `realVerified` are both true, at 1440×900 and 1280×720.
  - 1 row is BLOCKED, backend unavailable in cloud: the purchased heading in a browser (unit PW1/PW6 cover it).
  - Gate rows are not claimed.
  - The N-JOURNEY row exported a real 16 s, 24-bit, 48 kHz WAV with non-zero samples.
- **A round 302:** 12 paths, byte-equal to B's sketches. Covering set 24 files / 361 tests. Mutants m1–m4 red as planned. The reviewer found 1 Low and some Info items.
- **Gate 302** (`gates/gate-round-302.json`): `published`, commit `1fd0129…`, on both remotes. `gates/round-302/review.md` scored 8/10 with no blocker.
  - F1: `checkout.success.tsx` text only.
  - F2: NM1 trips on TODO comments.
  - F3: the stale e2e "Personal Studio".
  - F4: title pattern.
  - F5: pre-existing log lines.
- **Baseline for round 303:** HEAD = `1fd0129`, clean tree (B re-checked).
- **No new Saba, root or user-review decision files.** `agent-workflow.md` still ends at the 2026-10-31 section.

## 2. Backlog updates (C and gate evidence only)
Script: `b-round-302/update-backlog.py`. The backlog version is now 262. Backups: `b-round-302/backlog-before-303.json` and `feature-status-before-303.md`.
- **D-29z788:**
  - round 302 → `c_pass_published`;
  - NAME-AND-HINT-a → done (`browserVerified` true);
  - NAME-AND-HINT stays in progress until stage b passes.
- **D-29z789 (findings triage):**
  - `A-R302-REVIEW-NM1-NARROW` (A's reviewer Low) and gate F2 share one root cause → **one** `deferred_low_polish` entry. It is not in 303: round 303 does not own `studio-naming.test.tsx`.
  - Gate F3 is attached to `B-R301-E2E-STALE-PERSONAL-STUDIO`.
  - F1, F4 and F5 are recorded as info, `GATE302-INFO`. Purchase protection is unchanged, with behaviour-free text only.
  - The "CZABA CZABA Studio" read-out → a RETRO 305 screen-review candidate.
  - `INFO-C302-BUDGET-METHOD` records the 1fd0129 baselines (empty 95/56 and 78/49; with one clip 113/59 and 95/51; text-node lines / visual rows). Budget rows now compare visual rows.
  - The purchased `<title>` → the architecture signal `A-R302-SIGNAL-PURCHASED-TITLE` (input for SRW-21-PLAN).
- **D-29z790:** the NAME-AND-HINT-b rulings (§3).
- **D-29z791:** `SABA-Q-NAME-HINT-LIFETIME`, `awaiting_user`.
- **D-29z792:** round 303 is dispatched.
  - Not a regression round: `regression-last` is 2026-11-02, so the next one is due 2026-11-05.
  - RETRO stays at 305.
  - ARCH-CHECKPOINT-STUDIO-LINK is still unanswered and does not block.
- **No item became done without a browser:** stage a's browser rows all ran.

## 3. Round 303: NAME-AND-HINT-b
- **Reference:** Live 12 manual, read with WebFetch on 2026-11-02:
  - §6.7: "only the clip bar is draggable";
  - §6.9: dragging in the waveform selects time.

  Our behaviour already matches. Live has no such hint, so this is a CZABA-only aid, by Saba's Q5 decision. The manual's "clip bar" vs Saba's "name bar" is recorded as info, and Saba's copy is kept.
- **The AGREE / YouTube step does not apply.** Saba decided Q5 himself, with the copy and the default. The behaviour is built and confirmed in the manual, and no interaction is designed.
- **product-designer (consulted):** same write, library triggers only, once per page load, no re-arm on Undo, verbatim copy. B took all of it.
- **B adjustments:**
  1. **Tempo seed.** On a BPM source the existing seed effect appends to the current status, so the hint sits between the add sentence and the seed text. The seed code is unchanged (L49).
  2. **"Nearest free spot" as the first add** cannot happen in a browser, because the project starts empty. It became unit row NB7.
- **B's scratch** (`/tmp/b302-scratch`; artifacts in `b-round-302/`):
  - the sketch for 2 source files: `sketch.patch.txt` and `sketch-*.txt`. Typecheck and Biome are clean.
  - **Arrangement folder:** 177 files and 2,671 tests. 12 fail, in 5 files, all exact-text collisions (`sketch-arrangement-run.log`). The 172 other files pass.
  - **Covering set:** 19 files, 376 tests, with the same 12 failures (`sketch-covering-run.log`).
  - **HEAD browser probe** (`probe-status.mjs` / `.json` / `.png`): the seeded composite with the hint is 1,162 px wide in a 1,256 px status output at 1280×720. It stays on 1 line, and the footer stays 53 px at both viewports.
  - **Claims:** `claims-303.sh` → `claims-303-output.txt`, K1–K16, with every artifact `ok`.
- **What C checks, and what counts as success:**
  - H-FIRST-ENTER, H-SECOND, H-FIRST-DROP, H-SEED, H-UNDO, H-RELOAD, H-VIDEO-FIRST, H-BEHAVIOUR, H-BOX, H-SR, H-BUDGET and H-JOURNEY, at both viewports;
  - the unit rows NB1–NB9 and the 12 updated collision rows;
  - SOURCE-SCOPE, CLAIMS, DOC, RV-EN and G303-AUTH.
- **Neighbours at risk:**
  - the tempo seed text;
  - the status-lifetime contracts;
  - grid drops;
  - footer height and timeline fit;
  - screen-reader announcements.

## 4. Consults
- **Advisor:** available, consulted once after orientation. Its main points:
  - the seed ordering;
  - the unreachable browser row;
  - the footer measurement;
  - the collision grants and mutants;
  - the `rewriteStoppedTruth` claim (K8);
  - merging the two NM1 findings;
  - recording the budget method;
  - an explicit note on why AGREE does not apply.

  B followed all of them. A second call happens before hand-off.
- **product-designer:** consulted (§3).
- **Ableton reference:** the manual, §6.7 and §6.9, cited above. `ableton-arrangement-expert` was not needed: no behaviour is uncertain.

## 5. Order after 303
1. Round 304: PERF-3c (STUDIO-PERFORMANCE resumes), or a bounded fix-up first if C finds a Medium or worse.
2. Round 305: RETRO (window 290–304), with the whole-screen and journey review and the For-Saba proposals (`CLAUDE.md` tagline, docs old name).
3. The rest of STUDIO-PERFORMANCE.
4. STEM-LANES.
5. SYS-1…3.
6. STORE-2b…5.
7. REVIEW-RECOMMENDATIONS.
8. T12-ADVANCED.
9. The phase-2 entries, under the skip rule.

SRW-21-PLAN stays parallel. The next regression is due on or after 2026-11-05.

## 6. Frontend-architect checkpoint
NAME-AND-HINT ends a feature boundary. The open request ARCH-CHECKPOINT-STUDIO-LINK (`b-round-300.md` §6) still covers the accumulated signals, so B does not file a second one. The new signal `A-R302-SIGNAL-PURCHASED-TITLE` is added to its inputs for root. It is non-blocking.

## 7. Ready for commit?
- **Round 302:** published as `1fd0129`.
- **Round 303:** after C PASS and the gate, root publishes the 9 granted paths, and NAME-AND-HINT is complete.

## 8. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** these all remain:
  - NAME-AND-HINT-b;
  - STUDIO-PERFORMANCE (PERF-3c…15), STEM-LANES and SYS-1…3;
  - STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - every deferred Low, which must be fixed and verified before final acceptance.

  SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing, and the Saba questions do not block.

## 9. Housekeeping
- **The store tree is untouched.** HEAD is `1fd0129` and `git status` is empty. B wrote only to `/tmp/b302-scratch` and the loop folder.
- **No servers were started.** The HEAD probe used the root-started :5173.
- **`lessons.md` is unchanged** (59 lines). Planning found no new failure class: round 302 had no bug, and the seed ordering is an existing L51 case.
- **`context/active-*`** files are root-generated and were not edited.
