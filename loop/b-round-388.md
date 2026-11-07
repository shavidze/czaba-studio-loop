# B round 388 → 389 planning (2026-11-07)

**Decision:** CONTINUE. **Next:** round 389 = REGRESSION-2026-11-08 part 1 (C-only; A changes nothing). Backlog v355 → v356, D-29z1310 … D-29z1315.

## 1. Round 388 result (evidence read by B)
- `c-round-388.json`: PASS, 14 rows, `browserVerified` true, `realVerified` true, 0 bugs. Fake-bearer row BLOCKED (backend unavailable in cloud), not a failure.
- B checked the evidence files directly:
  - `c-round-388/meter-1440.json` and `meter-1280.json`: meters −19.5 dB while playing, all `-inf` after the failure, clock frozen at 00:00.761, `errors` [];
  - `c-round-388/unit-summary.txt`: 239 suites, 1026/1026, AR1–AR5 and SF1–SF11 present, 66 files;
  - mutants 16/16 red (`c-round-388/mutants/`).
- `gates/gate-round-388.json`: `published`, commit `11ca746` on both remotes. The store tree is clean at `11ca746`.
- **Closed (D-29z1310):** C-R387-01, GATE-B385-M2, A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS, TL-R387-M1, A-R386-REVIEW-L1.

## 2. A's reviewer notes
- Lows L1–L4 → `deferred_low_polish` (D-29z1312). L5 was fixed by A (doc only).
- L1 (the `late` resync branch has no unit row) also becomes the browser end-state row R389-RESYNC-METER. The browser cannot tell which path threw, so path attribution stays a unit candidate (SF12).
- **Architecture note** (signal 3, fourth consecutive round on the pump/tick/stop region): recorded as SIG-R388-FAKE-WEB-AUDIO-HELPER and candidate SYS-R388-FAKE-WEB-AUDIO-HELPER (test-only, not scheduled). Not joined to SYS-R2-FAKE-FIDELITY, which is about the R2 worker fake.
- **Request to root (accumulated risk on one owner):** addendum `b-round-388/root-request-arch-addendum-389.md` to the existing ARCH-CHECKPOINT-DECODE-REGION request. Non-blocking; wanted before PERF-13b-ii.

## 3. Why the regression now (D-29z1311)
- `regression-last.json` = 2026-11-05 (round 342). The 3-day rule makes it mandatory from 2026-11-08; today is 2026-11-07.
- D-29z1309 had already fixed "open it at the next planning". Independent reason: rounds 385–388 changed shared playback infrastructure, which the workflow names as a trigger for re-checking unchanged features.
- No Critical, High or cloud-reproducible Medium is open. The open Mediums are root-only (GATE304-M1) or manual-only (A-R73, GATE232-S2, GATE274-S1) or awaiting Saba (GATE271-S1).

## 4. Round 389 shape (D-29z1314)
- The REGRESSION-2026-11-08 entry had no `scope_additions`. B wrote SA-1 … SA-17: each item finished in rounds 343–388 is a named row in round 389; SA-17 (everything up to 342, by the round-340 template) is part 2 = round 390.
- Order is newest risk first: schedule-failure, resync meter, decoded cache, WAV streaming export, leaf memos, status store, lazy signalr, stem cache, range background, selection/transport, playback store, video drag, faders/icons, group move, journey. Then RR-PERF alone, PERF-LIB (the GATE304-M1 scratch config), RG-SMOKE, G389-AUTH.
- RR-PERF has no C full-run oracle on `7295618` (when `perf/` last changed); C saves a new oracle and reports counts.
- Every cited script exists: `b-round-388/claims-389.sh` K10, planning output `claims-389-planning-output.txt` (K1 published 11ca746, K2 0 lines, K3 11, K4 0/1284, K6 :5199 000 and :5173 200).
- Frozen tree: `b-round-388/r389-tree-sha256.txt` (1284 tracked files at `11ca746`).

## 5. Not applicable this round
- Reference-first, `product-designer`, YouTube, screen budget: no new behaviour and nothing new on screen.
- No consult agent was called. A regression round adds no feature to design, and the evidence questions were settled by the files above.

## 6. Order after the regression (unchanged from D-29z1298)
PERF-13b-ii → PERF-13c → PERF-13d → PERF-14 → PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 entries under the skip rule. PERF-11c-iii-d/e still wait for Saba (RETRO 400 default). The next RETRO is due by count at round 400.

## 7. Ready for commit
Nothing to publish from round 389 (no source change). Round 388's change is already published (`11ca746`).

## 8. Files written by B
`tasks/round-388.md` (copy), `current-task.md`, `backlog.json` (v356; backup `b-round-388/backlog-before-389.json`), `feature-status.md` (backup in `b-round-388/`), `b-next.json` (backup in `b-round-388/`), `b-round-388/` (claims, manifest, scripts, addendum, checkpoint).

## 9. Advisor and hygiene notes
- **Advisor:** available and used twice: after orientation (before writing), and at the close. Its changes: the SA list for REGRESSION-2026-11-08, the R389-RESYNC-METER row, the two-part split, the addendum instead of a new request; at close, the queue position of SYS-R388 in `b-next.json`, the RR-PERF wording (checked `playwright.perf.config.ts`: one production server on :5188 for all 4 specs), and the R389-FADERS-ICONS threshold (now round 346's own outerHTML comparison, L58). Recorded in `backlog.json` `advisor_used_by_B`.
- **C hygiene (for RETRO 400):** C's round-388 mutant copy `c-round-388/tree/` is still in the loop folder (L60 asks for deletion after use). Not B's to delete.
