# B round 333 → 334 planning (2026-11-04)

**Decision: CONTINUE.** Round 334 = PERF-DRAG-PREVIEW stage c2b-iii (`ArrangementPeakPath` primitive props) on `3f945e3`. The task is in `current-task.md`; the round-333 task is archived as `tasks/round-333.md` (a copy).

## 1. Round 333 closed from evidence
- **C:** `c-round-333.json`: PASS, with `browserVerified` and `realVerified` both true.
  - 10 rows passed: CLAIMS, SOURCE-SCOPE, UNIT, MUTANT, DRAG-NAMES, PERF, DETAIL-TEXT, D-ROWS, G333-AUTH and DOCS. 0 bugs, 0 blocked.
  - The gate rows (full vitest, build, Biome, typecheck, verify, smoke) are not claimed by C.
- **Gate:** `gates/gate-round-333.json` is `published`, commit `3f945e3`, and both remotes equal it. The review is 9/10 with no Critical. **The baseline for round 334 is `3f945e3`.**
- **Backlog:** PERF-DRAG-PREVIEW stage c2b-ii → done (D-29z995). The item itself stays `in_progress`, because c2b-iii and c3–c5 remain. Nothing was marked done without C's browser evidence.

## 2. Rulings on the round-333 findings
| Id | Origin | Ruling |
|---|---|---|
| A-R333-DP42-FOCUS-PREMISE | A | info, closed (D-29z995). HEAD behaviour; C saw the same on A and HEAD |
| GATE333-S1-S2 | gate reviewer | info, accepted as is (D-29z996) |
| GATE333-S3-TYPED-TEXT-DRAG | gate reviewer | `deferred_low_polish`, a product question for Saba. Behaviour is not changed without him (D-29z996) |
| GATE333-S4-DOC-SKETCH-NUMBERS | gate reviewer | Low, fixed in round 334 §1.3; closes on C DOCS |
| Gate Architecture note (keep) | gate reviewer | Evidence on ARCH-R331-PREVIEW-READERS. It is a backlog signal, not a task |

There are no open Critical or High findings in this stream. The Medium findings in `open_findings` are all root-only or manual (Tech Lead), and the 2026-10-23 clarification says they do not block.

## 3. Why c2b-iii now, and the evidence
- **REGRESSION is not due.** `regression-last` is 2026-11-02, and today is 2026-11-04: 2 days, where the rule needs 3 (D-29z997). REGRESSION-ROUND-2026-11-05 stays the first round planned on or after 2026-11-05. Its `scope_additions` gain a c2b-iii row.
- **Next in the D-29z994 order:** c2b-iii (PERF-CAND-PEAK-PRIMITIVE-PROPS, D-29z990). It does not touch `StudioWorkspace.tsx` or the context, so it does not wait for checkpoint D-29z915 (D-29z1002).
- **Sketch** (scratch `/home/runner/b333-scratch/sc`, tree = `3f945e3^{tree}`; `b-round-333/sketch/sketch.patch.txt`, 6 files):
  - jsdom covering: 155 files, 2459/2459;
  - typecheck rc 0; Biome clean;
  - 9/9 mutants red. Two of them (detail offset, stale `useMemo` deps) survived the first sketch; WG9 and WG10 were added until both went red.
- **Production perf** (`perf-rowcmp-vs-c333.txt`): fade 10.817 → 9.833 per move (max 11 → 10), move 26.233 → 24.267 (max 103 → 101); trim, range, click and hook-live are EQUAL. 104 rows EQUAL, 17 lower.
- **Browser names** (`names-compare.txt`): only `ArrangementPeakPathInner` is lost, 1 per fade commit and 2 per move commit. The warm-up crashed on a cold compile; it is environment-invalid and kept.
- **Browser drawing** (`wd-compare.txt`): every lane and detail `path d` equals HEAD at 22 samples, at 1440×900 and 1280×720.
  - **Limit:** the probe's trim-end drag did not change the clip; at 1280×720, trim-start did not change it either.
  - C gets its own trim-end sample, and jsdom DP46 and WG10 cover the path.
- **Consults (read-only):** `performance-optimizer` (safe; keep rows record; helper in `model.ts`; two test gaps, now closed) and `tech-lead` (approve; video row DP48; STOP list). The tech-lead `Pick<>` option was not chosen (D-29z999).
  - **Signals recorded, not scheduled:** SIG-R334-INLINE-DB-GAIN (`ArrangementContext.tsx:3402`) and SIG-R334-CLIPWAVEFORMSCALE-TEST-ONLY.

## 4. Scope and policy checks
- **Ownership:** A owns 7 files: the 6 patch files and doc 232. No protected file is touched; protected sha is 11/11 [K8].
- **Not applicable:** reference-first, `product-designer`, the screen budget and the YouTube request. This is a perf round with no visible or audible change.
- **No full suite for A or C:** the full suite stays a gate row.
- **Lessons:** unchanged. A candidate for RETRO 336 (seen once): a perf sketch's mutant set must include a "stale derived value" mutant (memo deps, a dropped prop) next to the render-count mutants. Here the render counts alone missed two wiring mutants.

## 5. Architecture checkpoint
- D-29z915 is still unanswered by root. Round 334 does not wait for it (D-29z1002).
- c3 waits for the checkpoint if it has been answered by then.
- No new request: there is no new structural risk on one owner. `ArrangementClip.tsx` changes only in its PeakPath block.

## 6. Order after round 334
1. REGRESSION: the first round planned on or after 2026-11-05.
2. c3, then c4, then c5.
3. The record → assert conversions.
4. PERF-9…15, then SYS-R2-FAKE-FIDELITY, then SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3, then STORE-2b…5.
6. REVIEW-RECOMMENDATIONS, then T12-ADVANCED, then the phase-2 entries (skip rule).

The next RETRO is at round 336 or at the end of STUDIO-PERFORMANCE, whichever comes first.

## 7. Commit readiness
Round 333 is already published (`3f945e3`). Round 334 is ready only after C PASS and the root gate.

## 8. Advisor
The configured advisor was available. It was used before the approach (the bookkeeping, the sketch process and the extra waveform-equality row) and again before declaring the planning done.

## 9. Housekeeping
- **Scratch:** `/home/runner/b333-scratch/sc` holds the final sketch. Vite cache: `/tmp/b333-vite-cache`. Neither touches `store/`.
- **Dev server:** `:5198` is stopped, and the scratch `vite.config.ts` is restored.
- **Store:** unchanged; `git status` shows 0 entries.
- **Backups:** `b-round-333/backlog-before.json`, `b-next-before.json` and `feature-status-before.md`.
- **Update scripts:** `update-backlog.py` and `update-feature-status.py`.
