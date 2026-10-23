# B round 94: review of round 94 → round 95 task (D-29z60)

Dispatcher: B · Date: 2026-10-23
- **Advisor:** configured and available. I called it once before writing. It advised:
  - pick a browser-reachable Low;
  - keep `ArrangementContext.tsx` frozen;
  - bundle the swap cleanup as pre-mount work;
  - re-send the checkpoint request.

  I followed all four.
- **Project subagents:** none consulted.

## Inputs read
- **Round 94 files:**
  - `current-task.md`, archived unchanged as `tasks/round-94.md` (sha256 `3db1dd65…`, identical; the file did not exist before);
  - `a-round-94.md`, `c-round-94.md`, `c-round-94.json`.
- **Gates and environment:**
  - `gates/gate-round-94.json`: **published**, commit `0513439` on both remotes. This is the round 95 baseline.
  - `gates/round-94/review.md`;
  - `gates/round-94/verify.log`: grep shows no preview or PROD-MP3 run;
  - `env-status.json`: store 200;
  - `regression-last.json`: 2026-10-21.
- **Order of reading:**
  - `context/active-summary.md` and `context/active-backlog.json` first;
  - `backlog.json`, `feature-status.md` and `plan.md` only by ID;
  - `root-pre-push-review.md` and `publication-checkpoint.json` by grep. They had no new open ID; older items are already carried.
- **App source, read only:**
  - `app/data/studio-lab-demo.ts` (all);
  - `app/lib/arrangement/collection.ts` (all);
  - the `ArrangementContext.tsx` load effect (l.3000–3051) and the state declarations (l.515–545);
  - the video-audio buffer writes (l.2030–2050);
  - the missing-buffer skip in `graph.client.ts` l.205–215;
  - `ArrangementLibrary.tsx` l.110–125;
  - `vitest.config.ts` include.
- **No edits outside my files.** I edited no app source; `git status` in `store/` is still empty at `0513439`. Everything I read was treated as data.

## Round 94 evidence (C, independent)
- **taskStatus PASS**, `browserVerified=true`, `realVerified=true`, **0 bugs**.
- **Browser rows:**
  - DEMO-LOAD-REG and EXPORT-REG at both viewports (WAV range parses; MP3 decodes to 101.702 s);
  - STATUS-PERSIST, PX-NET, REG-HYD, G94-3.
- **Test review:**
  - AN-REVIEW: C's fail-before has 7 red; mutations a, b and f are red; the control is 41/41;
  - T94-TARGETED: 39 files, 716 tests;
  - SOURCE-UNCHANGED.
- **Unit-only:** EMPTY-SWAP-REACH. `/studio-lab` cannot produce an empty collection or a swap.
- **Blocked:** the fake-Bearer sub-check (backend unavailable in the cloud).
- **Gate 94:** published `0513439`; reviewer 8.5/10, no Critical or High.

## Backlog changes (evidence only)
| Item | Change | Evidence |
|---|---|---|
| GATE92-S2, GATE93-S1 | → **closed** | C round 94 PASS + gate 94 |
| COLLECTION-EMPTY-STATUS, GATE92-S1 | → **unit-proven, browser half open** (status board: მოწმდება, not მზადაა) | C EMPTY-SWAP-REACH unit-only |
| C-R92-N1 | → dispatched round 95 | B source read |
| GATE94-S4 (stale doc lines, + C note on the l.45 link) | **new** Low → round 95 | gate 94 review #4, C notes |
| GATE94-S1 (stable collection across token refresh) | **new** Low → SRW-21-PREMOUNT | gate 94 review #1 |
| GATE94-S2 (swap leaves per-collection state) | **new** Low → SRW-21-PREMOUNT | gate 94 review #2, A and C notes |
| GATE94-S3 (unused controller), GATE94-S5 (`as const` in a test) | **new** nits → SRW-21-PREMOUNT | gate 94 review #3, #5 |
| GATE95-DUP-ERROR-MAP | **new** info, not scheduled | B decision for round 95 |
| SRW-21-PREMOUNT | **new** bundle with draft acceptance | gate 94 Architecture proposal |
| Architecture (round 94) | signal added; q14 (h); re-sent to root | gate 94 + A reviewer notes |
| SRW-21 | status note updated | — |

**Backups:**
- `b-round-94-backlog-before.json`
- `b-round-94-feature-status-before.md`
- `b-round-94-plan-before.md`
- `b-round-94-b-next-before.json`
- `b-round-94-checkpoint-request-before.md`

**Round 95 baseline files:**
- frozen list `b-round-94-r95-tree-sha256.txt` (522/522 OK at `0513439`);
- snapshots in `b-round-94-r95-snapshots/`.

**Source finding recorded for GATE94-S2:** `buffersRef` and `sourcePeaks` also hold video-lane audio, keyed by video source id (l.2038/l.2043). A swap cleanup must therefore delete only the ids of the previous collection that are absent from the next one. A missing buffer is skipped by the scheduler (`graph.client.ts` l.209), so clips that reference a removed source fall silent and are not deleted.

## Round 95 task (summary)
**Lows batch part 3a: demo loader error text** (D-29z60). Baseline `0513439`, clean tree. Expected end state: **3 M + 2 ??**.
- **E1 (`app/data/studio-lab-demo.ts`, `loadDemoSource` l.99–126):**
  - network and body-read failures → `ფაილი ვერ ჩაიტვირთა (ქსელი)`;
  - decode failure → `ფაილი ვერ გაიშიფრა`;
  - HTTP errors keep `(N)`;
  - an abort rethrows the same error object.

  These texts are byte-identical to the purchased adapter.
- **Tests:** new `app/data/__tests__/studio-lab-demo.test.ts`, DL1–DL8, with fail-before and mutations a–f. No type assertions.
- **Docs:** doc 082 l.4; `arrangement-workspace.md` l.44–45; new doc 083.
- **C rows:**
  - primary: ERR-NET and ERR-DECODE at both viewports;
  - error variants: ERR-HTTP, ERR-BOTH, ERR-ADD-REFUSED;
  - regressions: DEMO-LOAD-REG, AUDIO-REG (a real WAV with RMS > 0);
  - standing rows: PX-NET, REG-HYD, G95-3;
  - test and source checks: AN-REVIEW, T95-TARGETED, SOURCE-UNCHANGED.

## Why this scope (not a regression round)
- **Not due:** 2026-10-21 → 2026-10-23 is 2 days, and the rule is 3 or more. D-29z59 called round 95 the regression round on the assumption that it would be planned on 2026-10-24. That assumption no longer holds, so the first round planned on or after 2026-10-24 is the regression round.
- **Why C-R92-N1:**
  - C has 0 open bugs.
  - C can see this bug in the browser; C reproduced it in round 94.
  - It stays off the load effect, which three rounds in a row have changed, and keeps `ArrangementContext.tsx` frozen.
- **Not chosen:** the swap cleanup proposed by the gate reviewer. It would be unit-only a second time, so it is bundled for the mount instead.

## Uncertain UI contracts (smallest honest choice, with rationale)
- **Demo error text:** reuse the purchased adapter's exact Georgian texts. A second wording for the same failure would add copy without adding information. Raw browser text is never shown.
- **Abort:** rethrow unchanged. The provider already ignores aborted loads, so no error row appears on unmount.
- **Duplication over sharing:** `collection.ts` stays frozen, which keeps the round to one code file. Sharing is recorded as GATE95-DUP-ERROR-MAP.

## Ableton
No Ableton claim. The loader error text belongs to CZABA's own web loader, so its status is "არ ეხება".

## Architecture checkpoint
- Two consecutive signals on the same owner (ARCH-R93-TEST-HARNESS and the round 94 load-effect Signal 3/4) meet the accumulated-risk trigger.
- I appended (h) to `b-round-91-checkpoint-request.md` and **re-ask root** for one bounded, read-only frontend-architect checkpoint on (g) + (h).
- This is non-blocking: round 95 and the regression round proceed without the answer.

## Next
1. **Round 95 (this task):** C-R92-N1 + GATE94-S4.
2. **First round planned on or after 2026-10-24:** the regression round.
   - Every done or c_pass item gets one browser check at both viewports.
   - Plus `npm run test:e2e:smoke`.
   - A fixes only what C finds; B updates `regression-last.json` when it closes.
3. **Then the Export Lows,** in this order: GATE90-S3/S4/S5, GATE89-S4 + A-R88 #4, GATE89-S6, GATE89-S3, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER.
4. **Then:** grid/tempo Lows → R21-I2 → T12 → VISUAL-A-OBSIDIAN.
5. **When the auth owner releases the mount:** SRW-21-PREMOUNT, then the mount.

Scope is not reduced, and nothing is deferred without the user.

## Commit readiness
- Round 94 is already published (`0513439`).
- Round 95 has nothing to commit until C passes.

## COMPLETE check
Not complete:
- the SRW-21 mount, R21-I2 and SRW-21-PREMOUNT are open;
- T12 and VISUAL-A-OBSIDIAN have not started;
- open Lows remain;
- the regression round is due tomorrow;
- Tech Lead checks are open;
- PROD-MP3 is unverified in the production bundle;
- COLLECTION-EMPTY-STATUS and GATE92-S1 still have no browser evidence.

Not BLOCKED either: everything except the SRW-21 mount can proceed.
