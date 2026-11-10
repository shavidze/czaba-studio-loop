# B round 429 → 430 planning (2026-11-10)

**Decision: CONTINUE.** Round 430 = SABA-B-12 stage 1 (STUDIO-VIS-1) on baseline `76f4147` (gate 429 published). Task: `current-task.md`. Decisions D-29z1510 … D-29z1514, `backlog.json` v410. The previous task is archived as `tasks/round-429.md` (a copy; nothing was deleted). The advisor was consulted after orientation and before close.

## 1. Round 429 result (from evidence, not from reports)
- `c-round-429.json`: PASS, 0 bugs, `browserVerified` and `realVerified` true. Gate rows are listed as gate; the fake-bearer row is BLOCKED (backend unavailable in cloud).
- B re-ran:
  - `tools/l57-check.py`: L57 OK (`b-round-429/l57-check-c429.txt`);
  - compare on C's probe JSONs: ALL OK (8 cells) (`b-round-429/recompare/compare.txt`);
  - C's mutant lines: identical to `b-round-428/mutants/summary.txt`;
  - C's auth JSON: pass true.
- Gate 429 published `76f4147` on both remotes. The review has 2 Lows and no Medium or above; both equal A's own Lows.
- Closed or updated (D-29z1510, D-29z1511):
  - **SYS-2 done**;
  - A-R107-SWEEP-HELD-ENTER-TOOLBAR closed;
  - three new A Lows → `deferred_low_polish`;
  - INFO-B-R429-K9-OVERSTATED (origin B spec) closed, because doc 277 was corrected.
- **Architecture checkpoint:** SYS-2 is a feature boundary, so ARCH-CHECKPOINT-SYS-2 is filed with root in `b-round-429-checkpoint-request.md`. It is non-blocking. The gate-429 and A reviewer notes are recorded as signals, not tasks.

## 2. Why round 430 is SABA-B-12 stage 1
- Round 429's fixed outcome says: regression if planning is on or after 2026-11-13, otherwise SABA-B-12. Today is 2026-11-10, so `regression-last` (2026-11-10, round 425) is not due.
- STEM-LANES: no Saba answer and no transcripts.
- There is no open Critical or High finding. The open Mediums are root-only, manual-only or `awaiting_user`, except SABA-B-12, which is Saba's own Medium.
- The root policy table rates STUDIO-VIS-1 High / Immediate.

## 3. SABA-B-12 inventory and stages (D-29z1512)
The product-designer audit (`docs/technical/studio-real-workspace/studio-visual-audit-2026-11-10.md`) is treated as data. B's grep and browser checks added what it missed.

| Control | Where | Stage / ruling |
|---|---|---|
| 3 × `type="number"` spin buttons | ArrangementDetailPanel l.407/1063/1079 | **Stage 1 = round 430** (STUDIO-VIS-1) |
| 6 × `type="radio"` | ArrangementExportDialog | Stage 2 (STUDIO-VIS-2). Rule option (a) `sr-only` vs (b) a styled dot against L1 and `hidden_focusables_rulings_d29z169` |
| `<progress>` | ArrangementExportDialog l.567 | Stage 2 (the audit missed it) |
| `type="search"` native cancel ✕ | ArrangementShortcutSheet l.143 | Stage 3. The Library hides the native one and draws its own clear button; the sheet needs the same pattern, which is a new control |
| 2 × `<select>` | StudioWorkspace ~3386/3475 | Stage 4 (STUDIO-VIS-3). Deferred by **Saba answer 2** → REVIEW-RECOMMENDATIONS |
| checkbox | `app/components/studio/ExportDialog.tsx` | Used only by the protected `studio.$productId.tsx` (legacy purchased Studio). Recorded under SRW-21 (`deferred_user`); not scheduled |
| 7 × number, plus search, select, radio, checkbox, progress | `app/components/recordings/*` | Not in the `/studio-lab` import closure (0 files). Store routes `recordings.$productId` and `scenes.$productId` → STORE-REDESIGN acceptance (TL-R430-10) |
| 3 × range, 1 × file, scrollbars | — | Already custom-styled or hidden (audit "OK") |

The other audit items (L42, with their place in the order):
- STUDIO-VIS-4, 6, 7 and 10 → one **COPY-PD-VIS** round after stage 3 (Saba answers 1, 3, 4);
- STUDIO-VIS-5, 8 and 9 → REVIEW-RECOMMENDATIONS ("Defer" in the root table).

All are in `open_findings` as `saba_approved_task`, with ids that C can look up. STUDIO-VIS-4, 5 and 6 are Medium there, so the active summary's open-Medium count rises from 6 to 9. They are Saba-scheduled tasks, not bug-gate blockers: Saba placed them in COPY-PD-VIS and REVIEW-RECOMMENDATIONS.

**Order after round 430:**
1. REGRESSION-2026-11-13, when due;
2. SABA-B-12 stage 2, then stage 3;
3. COPY-PD-VIS;
4. SYS-1, then SYS-3;
5. STORE-REDESIGN 2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED;
6. the phase-2 queues, under their gates.

STEM-LANES jumps ahead when Saba answers. RETRO-435 runs at round 435.

## 4. B's pre-checks for round 430 (L58: every asserted number is B's own run on the sketch)
- **Sketch:** `b-round-429/sketch-430.patch.txt`, sha256 `a459d97568d5f446442d43e827b23a5a8add5c36e0d9c91ac11dc69cc22de567`. It has 4 files.
- **tech-lead review:** approve-with-lows, no Medium (`sketch-review.md`). Fixes 04, 05, 07 and 08 are applied in the final version; 06 and 10 are ruled.
- **Real Chromium:**
  - HEAD on :5173; the sketch on a second Vite at :5174 with its own `cacheDir`, stopped afterwards;
  - hover gutter diff: 182 px at HEAD vs 0 px on the sketch, in 6/6 cells;
  - three sketch runs (v1 ×2, final ×1);
  - `appearance` changes from auto to textfield; the box stays 80×24; ArrowUp steps as before (`probe/compare.txt`).
- **Mutants:** 6 lines, all red (`mutants/summary.txt`).
- **Tests and tools:**
  - covering set: 32 files, 660/660;
  - typecheck rc 0;
  - lint rc 0 (205 warnings, 1 info, the same as HEAD);
  - Biome rc 0 on the 4 files.
- **Claims:** `claims-430.sh` gives rc 0 with an empty stderr (`claims-430-planning-output.txt`). L58 OK.

## 5. Reference
- Live 12 manual 42.6 *Adjusting Values* (read 2026-11-10) confirms: arrow keys, Shift for fine steps, typing, Enter/Esc, drag with Shift.
- "No stepper arrows in Live" is an **inference**, not a measurement.
- B also measured the focused state (HEAD 168 px inside the border, sketch 0) and typed commits (equal to HEAD) on the final sketch. The sketch-side claims are in `claims-430-sketch-output.txt`. The full vitest on the sketch is 268 files / 4,001, rc 0 (`precheck-full.log`).
- The fields' lack of drag is a pre-existing gap. Under L44 it goes to Saba once as **SABA-Q-NUMBER-FIELD-DRAG** (`awaiting_user`, default: no change). It is not new scope.
- No Live measurement was needed for this bug fix.

## 6. Why we missed it (D-29z1514)
- **Which phases could have caught it:** VISUAL-A (rounds ~150–184), every RETRO whole-screen review, and the C visual rows.
- **Why they did not:** they used screenshots at rest, and Chromium paints number spin buttons only on hover or focus. No task listed a native control's browser-drawn parts as a row.
- **Rule added:** **L61, native control chrome is a row.** `lessons.md` stays at 60 lines because old L9 (engine rounding, 1×) was merged into L15. The previous file is `b-round-429/lessons-before-430.md`.

## 7. Open items carried (not scheduled this round)
- **TLM-SABA-B-12-FIREFOX-SAFARI:** Tech Lead row, deadline RETRO 435.
- **ARCH-CHECKPOINT-SYS-2:** awaiting root's result.
- **Saba-dependent:**
  - STEM-LANES (AGREE note; transcripts absent);
  - the STORE-2b direction;
  - SRW-21 (`deferred_user`);
  - PHASE2-VIDEO-SCORING (user go-ahead).
- **Deferred Lows:** in `deferred_low_polish`, fixed in the polish pass before release.

## 8. Readiness for commit
Round 429 is published. No B-owned change touches store source; this planning wrote only loop artifacts.
