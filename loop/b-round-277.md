# B round 277 → 278 planning (2026-10-30)

**Advisor:** available and consulted before the approach. A second call follows before finishing.
**Consults:**
- `product-designer` twice: (1) the Q-A…Q-E stage-2 questions; (2) the metronome draft click → variant X;
- `tech-lead` once: file, wrapper, tokens, collisions.

## 1. Inputs and evidence
| Input | Result |
|---|---|
| `c-round-277.json` | **PASS**. 13 rows, `browserVerified: true`, `realVerified: true`, 0 bugs. The gate rows were not claimed. Two info notes: INFO-C277-DOC206-STAGE2-ROUND and INFO-C277-ENV-LOAD-TIMEOUT |
| `a-round-277.md` | done within the grants, no STOP. N1/N2 red as planned. Flagged doc 206 l.9/l.63 (now l.65) for B |
| `gates/gate-round-277.json` | **published**, commit `42872cf` on both remotes (rounds 275–277). This is the new baseline |
| env-status | store 200 (round 277) |
| regression-last.json | round 258, 2026-10-30. The next regression is due on or after 2026-11-02, so it is not due now |
| `tasks/round-277.md` | archived. It did not exist before; it is a copy of the round-277 `current-task.md` |

## 2. Backlog changes (only from evidence)
**Closed (D-29z624):**

| Id | Evidence |
|---|---|
| GATE276-T1 | C 277 PASS and gate 277 published |
| C-R229-01, alias GATE229-S1 | round-276 §11: they close on stage-1 PASS + publication |

**Status changes:**
- Round 277 is done/published.
- **SYS-5 stage 1 is მზადაა.** Its browser rows ran in C round 276 with `browserVerified: true`, and round 277 re-ran B-MATCH in the browser.
- SYS-5 as a whole is still **მუშავდება**, because stage 2 is open.

**Dispatched to round 278:**
- C-R276-01, C-R276-02 (keep row), A-R276-REVIEW-DELETE-NAME and A-R276-ARCH-GUARD-IN-HELPER;
- ROOT-R66-L3 (the reason half) and C-R130-ADD-DISABLED-NO-REASON.

None of these is closed yet.

**New entries:**
- **Info:** INFO-C277-DOC206-STAGE2-ROUND (granted in round 278), INFO-C277-ENV-LOAD-TIMEOUT, B-R277-METRONOME-DRAFT-CLICK (designed out by variant X);
- **Harness fact:** B-R277-PW-ARIA-DISABLED-CLICK;
- **Architecture checkpoint request:** ARCH-CHECKPOINT-SYS5-SOFT-DISABLED (optional).

**Also updated:** `decisions_log_b` (D-29z624…D-29z633), `feature-status.md` and `lessons.md` (L25 gains one clause; still ≤ 60 lines).
**Backups:** `b-round-277/backlog-before-278.json`, `feature-status-before-278.md`, `lessons-before-278.md`.

## 3. Rulings
| D-ID | Ruling |
|---|---|
| D-29z625 | Round 278 = SYS-5 stage 2, the final stage. It goes before the PERF b-ii resume (queue note D-29z319) |
| D-29z626 | **Preview is in scope.** `product-designer` (include it, for Tab consistency with Add) over `tech-lead` (keep it native for now). User-visible trade-offs belong to `product-designer`. The cost is one button in the same file |
| D-29z627 | **Shared `studio-soft-disabled.ts` with `guardSoftDisabledClick`** (`tech-lead`). This settles the A-R276 architecture signal |
| D-29z628 | **Metronome variant X: no mousedown preventDefault on that one button.** B measured HEAD (see §4) and found that the shared pattern would have regressed a real flow |
| D-29z629 | The no-target Delete name is `Delete` |
| D-29z630 | `aria-disabled:cursor-not-allowed!` |
| D-29z631 | The perf predicate grant |
| D-29z632 | The outcome table |
| D-29z633 | Doc grants: 206 is closed, 207 is new. The optional checkpoint. L25 |

## 4. Pre-check (L23 pre-applied this time, the round-277 shape)
- **The sketch:** scratch copy of `42872cf` with all of §2, saved as `b-round-277/sketch.diff`.
  - Targeted: 13 files, 181/181 pass.
  - **Full vitest: 220 files / 3294 tests pass.**
  - `tsc` rc 0, Biome clean.
- **Mutants, all red:** G (SD2/SD2b), C (SD7), D (TC1), A (l.251), M (UI11).
- **Browser:** a second dev server on the scratch copy at :5174, with HEAD at :5173.
  - Metronome: reachable by Tab, ring 1 px brass at 0.8.
  - Cursor: `not-allowed` on the soft-disabled buttons, `pointer` on Fit.
  - Add on the video track: its title, a silent no-op, and focus not moved.
  - Delete name: `Delete`.
  - ΔE2000 against HEAD ≤ 2.83; boxes equal.
  - Old perf predicate: vacuous (`true`) on the video track; the new one is `false`.
- **Variant X:**
  - HEAD already commits the BPM draft and turns the metronome on with one click. The status ends on "Metronome is on — 120 BPM…".
  - The shared pattern would have made that a dead click, so the metronome is exempted.
  - On an invalid draft, focus now lands on the toggle instead of BODY (`probe/variantx.json`).
- **Sweeps:** SW-A 49 → 10 consumer files, and SW-B 7 hits. Each is granted or ruled.
- **Claims:** `b-round-277/claims.sh` → `claims-output-at-42872cf.txt` (K1–K16, SW-A, SW-B).
- **Harness finding:** Playwright `click()` waits on `aria-disabled` buttons. It is written into the C recipe and into L25.
- **Scratch removed** (the a-round-277 precedent). The `sketch.diff` regenerated from the scratch after the mutants compared byte-equal (`cmp`). `diff -rq` over `app/` showed exactly the 13 expected entries (12 modified + the new helper). C re-creates a scratch from `planning-copies/` + A's tree if it needs one.

## 5. Architecture checkpoint (feature boundary)
SYS-5 ends with round 278. B requests one **bounded, optional, non-blocking** checkpoint for root, ARCH-CHECKPOINT-SYS5-SOFT-DISABLED.

**The question:** after round 278 C PASS, is `app/components/arrangement/studio-soft-disabled.ts` the right long-term home? The alternative is a `softDisabled` prop on `~/components/ui` Button when the store-wide cursor/disabled polish (B-R276-CURSOR-UNLAYERED-GLOBAL) is planned.

**Answer format:** keep/extract, with its value, risk and ≤ 3 sentences.

It does not block round 279. The earlier addenda (`b-round-272-checkpoint-request.md`, `b-round-273/274-checkpoint-addendum.md`) are still unanswered and non-blocking.

## 6. Next after round 278
If C passes and the gate publishes:
- SYS-5 is **მზადაა**;
- round 279 is the next STUDIO-PERFORMANCE task (PERF b-ii), with the `performance-optimizer` and `tech-lead` consults first.

If the round-279 planning falls on or after 2026-11-02, REGRESSION goes first.

## 7. Commit readiness
Nothing new is ready. Rounds 275–277 were published as `42872cf`. Round 278 becomes ready for the gate after C PASS (SYS-5 complete; not a release).
