# B round 437 → 438 planning (2026-11-10)

**Decision: CONTINUE.** Round 438 is **SYS-R435-SOURCE-SCAN-HELPER**, a test-only round, on baseline `142918b`, which gate 437 published.
- **Task:** `current-task.md`.
- **Decisions:** D-29z1554 … D-29z1559; `backlog.json` is now v424.
- **Archive:** `tasks/round-437.md` is a byte-identical copy of the round-437 task. Nothing was deleted.
- **Pre-edit copies:** in `b-round-437/` (`*-before-438.*`, `lessons-before-438.md`). Checkpoint: `b-round-437/checkpoint.md`.
- **Advisor:** available, and used four times:
  - after orientation;
  - before the engine switch. Its advice was to spike the parser and switch if the inventory, typecheck/lint and mutants matched, which they did;
  - for the close review (§6), whose fixes are applied;
  - once more at the very end.
- **Consults:** `tech-lead` reviewed the sketch three times (v1, v2, v3). `product-designer` and `ableton-arrangement-expert` were not needed: this is a test-only round, which the reference-first rule exempts.

## 1. Round 437 result (B's own checks)
- **C's result:** `c-round-437.json` PASS, 14 rows, `browserVerified`/`realVerified` true, 1 Low.
- **B's re-run:** `tools/l57-check.py` gives L57 OK (`b-round-437/l57-check-c437.txt`).
- **Gate 437:** published `142918b` to both remotes; the review says COMMIT OK, 8/10.
- **Now done** (D-29z1554): STUDIO-VIS-7, STUDIO-VIS-10 and SABA-LANE-RESIZE-HANDLE. The fake-bearer row stays open evidence (backend unavailable in cloud).
- **C-R437-01** (D-29z1555): B re-measured it (`b-round-437/probe/play-status.json`, both viewports).
  - The status line does change: "Loading …" at about 50 ms, then "… is ready." at about 260 ms. C's "no status message" was wrong.
  - Play is not resumed afterwards. That is the round-382 F-13b-i refusal contract, not a regression.
  - Result: a Low, deferred. Whether Play should auto-resume is a question for Saba: `user-review/note-round-438-play-after-decode.md` (L44).
- **Gate-437 review and A's notes** (D-29z1556):
  - Deferred as Lows: GATE437-S1-DETAIL-SEPARATOR-NO-DRAG (= A's CR-1/CR-2), GATE437-S4-EXIT-ARROW-FOCUS, GATE437-S5-BUSY-LABEL-CONTRAST, A-R437-REVIEW-CR3 and -CR6.
  - Recorded as `confirmedBy`: suggestion 6 and the Architecture note.
  - A's CR-4: the L61 wording "pointer capture keeps `:hover`" is replaced by the measured fact. `lessons.md` stays at 60 lines.

## 2. Round 438 (D-29z1557, D-29z1558)
**Why this round:**
- **Queue order:** RETRO 435 put it after COPY-PD-VIS and before SYS-1, and it must land before ARCH-SPLIT (L8).
- **REGRESSION is not due** until 2026-11-13.
- **No Critical or High finding is open.** The loop-fixable Mediums are parked by Saba's "defer".

**The engine switch:**
- The v1 sketch used a hand-written tag walker. Tech-lead's v1 review found a Medium (a quote overrun could silently over-run a tag) and six Lows of the same class.
- The v2 sketch uses `typescript`'s `createSourceFile`, which removes that class by construction:
  - a spread is a `JsxSpreadAttribute` node;
  - attribute names are exact;
  - a syntax error throws `path:line`.
- The spike matched on every check:
  - the inventory (3 number, 6 radio, 1 progress, 2 search, 2 Modal, 1 spread owner);
  - typecheck rc 0, and lint 205 warnings, the same as HEAD;
  - the mutants.
- A parse cache and a `ThisNodeHasError` check (in place of `transpileModule`) bring each scanner test down to about 0.6 s, against the 5 s default (L31).
- The v2 review's Lows 1–3 were fixed in v3, which tech-lead approved with Lows, naming its sha `1b88d0ec…` (`b-round-437/sketch-review.md`). The remaining Lows are deferred: TL-R438-02, -04, -N1, -N2 and -N3.

**Evidence on the v3 sketch:**
- Covering set: 7 files, 23/23.
- Biome clean.
- Mutants: M1–M16 on HEAD against the sketch, and H1–H9 on the helper, all as designed (`b-round-437/mutants/`).
- Full suite: `b-round-437/full-suite-sketch.log`.

**What it closes:**
- On C PASS, 9 deferred Lows, plus the subfolder half of GATE434-S2.
- GATE431-REVIEW-L3 is not closed; it lives in other suites.
- New signals: SIG-R438-OTHER-SCANNERS and SIG-R438-IDENTIFIER-PREDICATE.
- An ARCH-SPLIT rule now requires each split stage to update the exact-path pins in the same change.

## 3. Order after round 438
1. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13, with REG-PERF-FULL-SUITE.
2. SYS-1.
3. SYS-3.
4. STORE-REDESIGN 2b…5 (direction A is decided).
5. ARCH-SPLIT, after a frontend-architect checkpoint through root (ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS is still open).
6. REVIEW-RECOMMENDATIONS: SABA-B-12 stage 4 / VIS-3, VIS-5/8/9, and COPY-PD.
7. T12-ADVANCED.
8. Phase 2, under the skip rule.

STEM-LANES jumps ahead as soon as Saba answers. Next RETRO: round 450.

**Architecture checkpoint:** no new request. This is a test-only helper with one owner, and its own Architecture note says "keep".

## 4. Not COMPLETE, not BLOCKED
- **Not COMPLETE.** Open work remains:
  - SYS-R435 (438), SYS-1/3, the STORE stages, ARCH-SPLIT, REVIEW-RECOMMENDATIONS (SABA-B-12 stage 4, STUDIO-VIS-3/5/8/9, COPY-PD), T12-ADVANCED;
  - the phase-2 queues, STEM-LANES (Saba), and SRW-21 (deferred_user);
  - every deferred Low, which must be fixed before final acceptance.
- **Not BLOCKED.** Every round-438 row runs in the cloud except the fake-bearer backend row.

## 5. Readiness for commit
- Round 437 is already published (`142918b`). Round 438 publishes after C PASS and the gate.
- This planning wrote only loop artifacts. The store tree is clean at `142918b` [K2].
- The scratches `/tmp/b438`, `/tmp/b438head` and `/tmp/b438git` are outside the store. No extra server was started; only root's :5173 runs.

## 6. Close review (advisor) fixes (D-29z1559)
- **Count.** SYS-R435 closes 9 deferred Lows plus the subfolder half of GATE434-S2, not 10. Corrected in D-29z1557, `current_task`, `feature-status.md` and this file.
- **Reviews.** Tech-lead's v2 and v3 reviews are saved verbatim (`b-round-437/tech-lead-review-v2.md`, `-v3.md`) and cited in K15. `sketch-review.md` names the v3 sha, and `l58-check` gives L58 OK.
- **A1.** The 8 sketch files are kept in `b-round-437/sketch-files/`, so A1 can `cmp` them after the `/tmp` scratch is gone.
- **Claims:**
  - K3 and K4 now capture the manifest rc in a variable. The inline `$?` after `$(wc …)` read 0, which B verified with `false; echo "$(true) rc $?"`.
  - K7 no longer prints the date, so a run after midnight does not differ.
- **L31.** Loaded headroom from the full-suite run: at most 15 % (`b-round-437/l31-headroom.txt`).
- **Saba.** The play-after-decode question is also in the Saba list at the top of `feature-status.md`.
- **Re-runs after the last edit:**
  - claims, at HEAD and on the sketch scratch, with stderr empty and the diff regenerated;
  - `l58-check`;
  - the untagged-fact grep.
