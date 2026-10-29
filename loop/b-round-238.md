# B round 238 → 239 planning

**Date:** 2026-10-29. **Decisions:** D-29z352…D-29z359. **Next task:** `current-task.md` = round 239, SABA-B-11b stage 1 (zoom-adaptive grid). The previous task is archived unchanged as `tasks/round-238.md` (byte-identical copy).

**Advisor:** available, and used twice:
- **After orientation, before writing.** I followed every point of its advice: triage gate 238 first, close from evidence, write checkpoint addendum 4, put the chooser in a pure function, keep the zoom silent, run the real L23 pre-check, split into 2 stages, and ask Saba the questions.
- **Before declaring done.**

## 1. Inputs read
- `context/active-summary.md`, `lessons.md`, `tasks/round-238.md` (as `current-task.md`), `a-round-238.md`, `c-round-238.md` / `c-round-238.json`.
- `gates/gate-round-238.json`: status `published`, commit `15a0b412…`, both remotes. Also `gates/round-238/review.md`, `env-status.json` (store 200), `regression-last.json`.
- `backlog.json` (ids looked up only).
- `transport-grid-review.md` §4.3, `reference/youtube/SABA-B-9-10-11-transcripts.md`, `user-review/ableton-review.md` (ABL-R-8).
- Live 12 manual 6.10 through WebFetch, and one WebSearch.

## 2. Round 238 result → backlog (independent evidence only)
- **C PASS:** `c-round-238.json` has 13 passed rows, `browserVerified: true`, `realVerified: true` and 0 bugs. The purchased-origin browser row is BLOCKED (backend unavailable in the cloud); it stays open evidence. The gate rows are listed as `gate`.
- **Gate 238 published** `15a0b41` on both remotes (rounds 237 + 238).
- **Closed (D-29z352):** C-R237-01, A-R237-REVIEW-L1, A-R234-REVIEW-M1, B-R235-READY-CLOBBER, GATE234-S2, GATE234-S3, C-R236-02.
- **The SABA-B-11a block is complete:** stages 234/235 plus fixes 236/237/238, all C PASS in the browser and published.

## 3. New findings and rulings
| Id | Severity (B) | Ruling |
|---|---|---|
| GATE238-S1 | Low (the reviewer said Low–Medium) | D-29z353, `deferred_low_polish`. The mount "Loading…" text is no longer announced, because the functional write with equal text leaves `sequence` at 0. Only the transient text is lost: ready/failed is still announced 1–2 s later, and a seed still advances the sequence. The fix candidate rides with A-R237-ARCH-STATUS-PARTS (an explicit announce flag). |
| GATE238-S2 | Low | `deferred_low_polish`. Doc 185 and `settledCollectionStatus` disagree on the case "failed + seed tail". `/studio-lab` cannot reach that case. Decide code or doc in the polish pass. |
| GATE238-S3 | Low | `deferred_low_polish`. The seed is announced twice when ready replaces the loading prefix. The reviewer calls this accepted. |
| A-R238-LRS4-HEADROOM | info | D-29z354. LRS4 was at 53 % of the 5 s default in A's first run (47 % in the final run, 36 % at gate 236). No row is added to that file. The next round that owns `library-row-strings-ui.test.tsx` declares `{ timeout: 15_000 }` (L31). |
| A-R238-ARCH-STATUS-PREFIX | info, signal | D-29z355. Folded into A-R237-ARCH-STATUS-PARTS and addendum 4 of `b-round-234-checkpoint-request.md`. Not scheduled; both reviewers say keep the current design. |

No open Critical, High or Medium blocks new scope. The Medium items that remain open are on the Tech Lead / manual list (GATE232-S2 AltGr, and the quiet-Chrome items) or `awaiting_user` (SABA-B-7), as before.

## 4. Why round 239 is SABA-B-11b stage 1
- Regression is **not due**: the last one was on 2026-10-27, so it is due on or after 2026-10-30. RETRO is not due (next at 245). There is no C bug to fix first.
- The queue order is SABA-B-9-10-11: 11a ✓ → **11b** → 10a → 10b → 9 → 11c (the policy table). SABA-B-7 is still `awaiting_user`, and STORE-2…5 still have no `direction-decision.md`.
- **Split (D-29z356):** the policy's "~1.5 rounds" becomes two browser-verifiable stages.
  - Stage 1 (round 239): the adaptive chooser, the adaptive default, `5`, and `1`/`2` density.
  - Stage 2 (round 240): `4` = Snap, the menu Adaptive/Fixed and density items, and no snap on an invisible grid.
  - The full scope stays the same, including ABL-R-8.

## 5. Design decisions (smallest honest behaviour, with reasons)
- **D-29z357, the threshold is 24 px:** the pick is the finest division whose lines are ≥ 24 px apart.
  - Measured on a scratch copy: 20 px turned 83 tests in 13 files red, 24 px turned 2 red (string key lists), and the final sketch was 3,044/3,044 green.
  - Reason 1: 24 CSS px is the WCAG 2.5.8 minimum target size.
  - Reason 2: it keeps HEAD's 1 s grid at the default 40 px/s, so the first view does not change.
  - Live's threshold is unpublished, so SABA-Q-11B-DENSITY asks Saba.
- **Both families are adaptive.** ABL-R-8 names both "0.1 s" and "10 s"; Saba decision 3 keeps seconds for no-BPM projects.
- **Choosing a division makes the grid fixed.** The select, the menu, and fixed-mode `1`/`2` keep today's fixed behaviour. In adaptive mode `1`/`2` change one of 5 density levels: Narrowest … Widest, default Medium (Live 10/11 tutorial wording; the manual says only "context menu").
- **Zooming is silent.** No status and no announcement (Live's readout simply changes, GRGG 0:00).
- **D-29z359:** a 120 BPM seed at 40 px/s now shows `1/2`, not `1/4`. At 90 BPM, and in fixed mode, it stays `1/4`. The browser rows from rounds 234–238 that pinned `1/4` for the 120 BPM pulse are superseded by C-ADAPT-MUS-239. The next regression round must use the adaptive contract.
- **Plain `5`, not Ctrl+5.** This is the deviation form the policy approved (Chrome tab keys, D-29z24).

## 6. For Saba (non-blocking; recorded as `awaiting_user`)
- **SABA-Q-11B-READOUT (L43):** Live shows the grid spacing above the time ruler, bottom-right. CZABA shows it in the grid control's select, top-left. Should it move, or be duplicated bottom-right, next to where SABA-B-9 puts the master?
- **SABA-Q-11B-DENSITY (L44):** adaptive lines are at least 24 px apart. With a 120 BPM track at the default zoom, the grid is 1/2. Should it be denser (1/4) or sparser?
- **SABA-Q-11B-PLAIN-DIGITS (L44):** Live uses Ctrl/Cmd+1…5 for the grid; CZABA uses plain digits, because Ctrl+digit switches Chrome tabs. Is that OK?
- **Still open:** `user-review/AGREE-SABA-B-7.md`, and SABA-Q-TIME-RULER-ROLE / -SCRUB-* / -SEED-STATUS-LENGTH / -TEMPO-UNDO from earlier rounds.

## 7. Architecture checkpoint
- Addendum 4 was appended to `b-round-234-checkpoint-request.md`. It stays non-blocking, and round 239 answers question 3 provisionally by its design.
- The re-ask trigger is **before SABA-B-10a**, which rewrites the play/stop contract that writes status.
- Root: please run the read-only `frontend-architect` checkpoint before round 241 if possible.

## 8. Commit readiness
Rounds 237 + 238 are already published (`15a0b41`). No new store change exists at planning. My scratch work is in `/tmp/b239-scratch`, outside the repo: `git status` in `store/` is empty, and HEAD is `15a0b41`.

## 9. Files written by B
- `current-task.md` (round 239), `tasks/round-238.md` (archive), `b-round-238.md`, `b-next.json`.
- `b-round-238-r239-grants.txt`, `-tree-sha256.txt` (1,091), `-root-files.txt`, `-root-files-start-sha256.txt`, `-grants-start-sha256.txt`.
- `b-round-238/`:
  - `precheck-scratch.diff`, `precheck-runs.json`, `precheck-diffstat.txt`, `precheck-covering.log`, `covering-files.txt`;
  - `probe.cjs`, `probe-musical.cjs`, `probe-scratch-2.json`, `probe-musical-scratch.json`;
  - `head-at-planning.txt`, `git-status-at-planning.txt`;
  - backups `backlog-before-r239-planning.json` and `feature-status-before-r239-planning.md`.
- Updated: `backlog.json`, `feature-status.md` (header, round-238 row, new round-239 row, queue row), `b-round-234-checkpoint-request.md` (addendum 4).
- `lessons.md` is unchanged: there is no Saba-reported issue this round, and the file is at 58 lines.
- **Edits after the second advisor call:**
  - `current-task.md`:
    - C-ADAPT-MUS-239 reads the seed label before the first zoom;
    - the L44 reason for dispatching R9 rather than parking it;
    - GA2 names its BPMs;
    - the deferred-Lows pointer;
    - SABA-Q-11B-PLAIN-DIGITS.
  - `backlog.json`:
    - the `REGRESSION-ROUND-2026-10-30` scope addition carries the adaptive contract (D-29z359);
    - new `open_findings` entry SABA-Q-11B-PLAIN-DIGITS.
  - `b-next.json` Saba list.
