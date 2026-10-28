# B — Round 233 → 234 planning (2026-10-28)

**Decision: CONTINUE.** Round 234 is **SABA-B-11a stage 1**: the project tempo comes from the asset's catalogue BPM; the grid becomes musical and Snap turns on when a BPM exists; with no BPM the grid stays seconds, and 120 is never invented. The task is in `current-task.md`. The round-233 task is archived at `tasks/round-233.md` (a new copy; nothing was overwritten). Decisions: D-29z321…D-29z326. I consulted the advisor before writing the plan.

## 1. Round 233 result (evidence, not claims)
| Source | Result |
|---|---|
| `c-round-233.json` | taskStatus **PASS**, `browserVerified` true, `realVerified` true. 13 rows passed. Blocked: TLM-R232-MAC and TLM-R232-ALTGR-WIN (manual only). Gate rows not claimed. Three Lows: C-R233-01/02/03. |
| `gates/gate-round-233.json` | `published`, commit `db5c297946e3295fec7b2647a2e66dd4cad10692` on both remotes. **That commit is the round-234 baseline.** |
| `gates/round-233/review.md` | 8.5/10. No Critical or Medium findings. Lows S1–S3, info S4–S5, one Architecture note. |
| `store/` at planning | HEAD `db5c297`; `git status` empty (`b-round-233/git-status-at-planning.txt`). |

**Rulings.** The backlog goes from v218 to v219. Script: `b-round-233/update-backlog.py`. Before-copies of the backlog, task, b-next, feature-status and lessons are in `b-round-233/`.
- **D-29z321:** round 233 is accepted, and GATE232-S1 is closed.
- **D-29z325:** the other round-233 findings.
  - **C-R232-01 is invalid.** Its premise was false (C-R233-01). The l.377 `15000` is accepted and kept: the test is about 1.1 s and no assertion changed. This closes C-R233-01 and GATE233-S2.
  - C-R233-02 (ring over the video), C-R233-03 (doc 181 provenance), GATE233-S1 (production code queries a testid) and GATE233-S3 (no fallback) go to `deferred_low_polish`.
  - GATE233-S4 becomes TLM-R233-SR-ORDER. GATE233-S5 is the same as B-R232-DOC180-FOCUS-STALE.
- **D-29z326:** **SABA-B-8 is done.** CALM-1/2/3 and the follow-up all have C PASS with browser evidence, and all are published. DUX-R-2 was already closed by CALM-1. The gate-233 Architecture note (GATE233-ARCH-DOCK-FOCUS-RESCUE) stays a signal. It is appended as addendum 2 to `b-round-231-checkpoint-request.md`, which is ready for root.

## 2. Why SABA-B-7 is not round 234 (D-29z322)
SABA-B-7 is next in the queue, but its own pre-dispatch condition requires that the experts "confirm Live's exact taper … with a manual source". Both round-232 consults found **no published taper and no interpolation space**.
- The two candidate tapers differ by 7–10 dB at every interior point. Choosing one is a sound decision, not a planning detail, so under L44 it is Saba's.
- Root's YouTube candidate file says transcripts come "when B asks in its AGREE-WITH-SABA note".

So I wrote **`user-review/AGREE-SABA-B-7.md`** in Georgian for Saba. It contains:
- the reference table (what is confirmed and what was not found);
- taper A (dB-linear with a −60 dB floor, the **same scale as CZABA's lane Volume fader** in `track-volume-db.ts`; recommended) against B (p³) and the current linear taper, at 25/50/75 %;
- the saved-project consequence: stored gains are kept, but the curve between points changes, and a −6 dB point moves on screen from 50 % to about 90 %;
- a request to measure in Live;
- four video picks for root's transcripts;
- the scheduling choice (short linear ramps).

SABA-B-7 is now `awaiting_user`. The policy says that while a feature waits, B dispatches the next task that does not wait. NEEDS_ATTENTION is not set, because other work can run.

## 3. Round 234 design (D-29z324)
| Item | Ruling | Evidence |
|---|---|---|
| Scope | SABA-B-11a stage 1 of 2. Stage 2 (bars ruler click, top strip starts playback, seconds ruler role) comes next. | Saba decisions 2 and 3; `transport-grid-review.md` §4.3 |
| Seed rule | One-shot. The first music or stem clip (earliest start) whose source has a valid BPM seeds the tempo. SFX are ignored. A typed or cleared tempo, a hand-chosen grid and a hand-toggled Snap all win. | task §2.5 |
| Demo BPM | The synthetic composition carries its **real** 120 BPM (`demo-synth.ts` l.32: 0.5 s beats). Public previews and SFX carry none, because their catalogue BPM is unavailable offline. This is not an invented 120. | `demo-synth.ts` l.32, l.51 |
| Default division | `1/4`, a stand-in until 11b adds the adaptive grid. Live's default width is not documented. | manual 6.10 |
| Undo | Tempo, grid and Snap stay outside the history (D-29z30 R4). This is a deviation from Live (inference), sent to Saba once as **SABA-Q-TEMPO-UNDO** (L44). | task §3 |
| L23 | Sketch on a scratch copy: `tsc` 0, Biome clean. Covering run of 101 files: 100 green; `strings.test.ts` ST17/ST19 are the only collisions and are granted (64/64 green after the grant). | `b-round-233/precheck-*` |
| L29 | Every C recipe was run in Chromium at the baseline: Add, Enter, grid select, `g`, the tempo field, Ctrl+Z, and a clip drag from the 6 px header strip. A drag in the waveform middle does not move the clip, which I found and corrected in the recipe. The seed was also run on a scratch build. | `b-round-233/probe/*.json`, `probe-fix/seed.json` |
| L3 | The longest seeded status (188 chars) stays on one line, 16 px high, at 1280 and 1440. | `probe/status-width.json` |
| L31 | CP12d is the slowest covering test: 10.5 s of 30 s (35 %); gate 233 measured 8.0 s. | `precheck-covering.log` |
| Reference | Live 12 manual ch. 9 (fetched by me): Live does not change the Set tempo when a clip is added, and tempo does not stretch unwarped audio. 6.1/6.10 come from the review. Every difference is listed as a deviation with its reason. | task §3 |

**Lessons (D-29z323).** L43–L46 are added as the policy requires at SABA-B-11a planning. The file has 57 lines, so nothing was dropped. L44's evidence is now 2× (the SABA-B-11 fixed grid and the SABA-B-7 AGREE note).

**Scope check:** nothing is shrunk or deferred without authority.
- SABA-B-7 waits for Saba under the policy's own pre-dispatch condition.
- The other new findings are Lows, deferred under the 2026-10-23 bug gate.
- The purchased route stays untouched (SRW-21 is `deferred_user`; the file is protected).

## 4. Ready for commit?
Round 233 is already published (`db5c297`). Round 234 is dispatched, so nothing in `store/` is ready yet.

The loop state is ready for root's loop-state commit:
- `tasks/round-233.md` and `current-task.md`;
- backlog v219, `feature-status.md`, `lessons.md`, `b-next.json`;
- `user-review/AGREE-SABA-B-7.md`;
- checkpoint addendum 2;
- the round-234 grant and hash files (`b-round-233-r234-*.txt`);
- `b-round-233/`.

## 5. For root and Saba
- **Saba:** `user-review/AGREE-SABA-B-7.md`: taper A or B, saved projects, an optional Live measurement. Also the new question SABA-Q-TEMPO-UNDO.
- **Root:** please write the transcripts of the 4 videos picked in the AGREE note to `reference/youtube/SABA-B-7-transcripts.md`. Also please run `b-round-231-checkpoint-request.md` (non-blocking). An answer to its question 2 before SABA-B-10a would help.
- **Tech Lead:** TLM-R233-SR-ORDER (new), TLM-R232-ALTGR-WIN, TLM-R232-MAC.
- `root-pre-push-review.md` and `publication-checkpoint.json` are the October 7 originals and were triaged earlier, so they were not re-triaged.

## 6. Method notes
- **Scratch:** `/tmp/b233-scratch` (`git archive HEAD`, `node_modules` symlinked) and a dev server on port 5174, both outside the repo and the loop folder. The server is stopped. No vitest run overlapped a browser probe (L38).
- **`store/`:** never written. At the end, HEAD is `db5c297`, the status is empty, and `b-round-233-r234-tree-sha256.txt` gives rc 0.
- **Advisor:** consulted before the plan. Its advice was to send SABA-B-7 to an AGREE note and dispatch SABA-B-11a. I followed it.
- **Advisor, second review (after the files were written):** it asked for two greps, and both changed the task.
  - **Hand paths:** every division path reaches `changeGridDivision` (select, keys 1/2, triplet, menu), and every Snap path reaches `toggleSnap`. Grant 4's three flag lines are enough. The task now names these call sites, and says that the grid flag is set after the refusal guards.
  - **Tempo commits:** `ArrangementTempoRow` calls `onTempoChange` only when the value changes. My first C-USER-WINS (b) recipe ("empty + Enter" on an empty field) would therefore still have seeded, so the row was wrong. It now sets 90 and then clears it, and a new case (c) checks that an untouched empty field still seeds. TU4 has the same must-seed case.
  - **Also:** the C-SNAP reference now cites video riOD 2:22. FB-13, SRW-14 and SRW-15 in `feature-status.md` point to SABA-B-11a. The smoke spec (`playwright.smoke.config.ts` → `agent-system-smoke.spec.ts`) does not touch the grid.

## 7. Next after round 234
- **C PASS and gate PASS:** SABA-B-11a stage 2, or the REGRESSION round if planning is on or after 2026-10-30.
- **C FAIL:** a fix-up on the same grants.
- **Saba answers the AGREE note:** SABA-B-7 is scheduled right after the running stage.
