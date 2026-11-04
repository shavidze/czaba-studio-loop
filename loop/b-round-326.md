# B round 326 → 327 planning report

**Date:** 2026-11-04. **Decision:** CONTINUE. **Advisor:** available and used three times.
- **Before the sketch:** it confirmed that a fade costs two writes per move (geometry and status), and asked for the status consumer sweep, the DP9 rewrite ruling and the round-326 closeout.
- **Before the acceptance table:** it found a parity hole. Six status-text comparison reads would see the pre-drag text during a fade drag; the stop effect is reachable at the project end. It also asked for a drag-back-to-0 row and a check of the budgets diff. All of these were added to the sketch and to the task.
- **Final check:** before `b-next.json` (§8).

## 1. What I read
- **Round 326:** `current-task.md` (archived unchanged as `tasks/round-326.md`, K15 `archive-equal`), `a-round-326.md`, `c-round-326.md`, `c-round-326.json`, `gates/gate-round-326.json` (`published`, `234ccdd`).
- **Context:** `context/active-summary.md`, `lessons.md`, `regression-last.json`, `b-round-325.md`, `b-next.json`.
- **Lookups only:** PERF-DRAG-PREVIEW, GATE325-IM24-WALLCLOCK, B-R299-IM24-LOAD-SIGNAL, SYS-CLOCK-DETERMINISM, SYS-R2-FAKE-FIDELITY, D-29z436 / D-29z915 in `backlog.json`; the round-252/253 marker-step rows in `tasks/`.
- **Store source (read-only):**
  - `ArrangementClip.tsx` (fade branch, gesture ends);
  - `ArrangementContext.tsx` (status reducer, `beginPointerGesture`, preview functions, context value);
  - `status-announcement.ts`, `preview-store.ts`;
  - `StudioWorkspace.tsx` (footer status, stop effect, nudge);
  - `ArrangementMarkerRow.tsx`, `drag-preview-render.test.tsx`, `status-announcement-ui.test.tsx`;
  - `perf/budgets.interactions.json`, the perf spec's drag window, docs 232 and 168.
- **Before-copies:** `b-round-326/before-{current-task.md,backlog.json,feature-status.md,lessons.md,b-next.json}`.
- `root-pre-push-review.md` and `publication-checkpoint.json` are from 2026-10-07. Their findings were handled long ago, so nothing carries.

## 2. Rounds 325 + 326 result (from C's evidence and the gate)
- **Round 326:** C PASS, with `browserVerified` and `realVerified` both true.
  - The IM24 freeze is green alone and under CPU load. Without the spy, MU-DELAY-60 and C's own mutants go red.
- **Gate 326** published `234ccdd` on both remotes, with all 17 paths of rounds 325 + 326.
- **Done (D-29z928):** PERF-DRAG-PREVIEW stage a and GATE325-IM24-WALLCLOCK. B-R299-IM24-LOAD-SIGNAL is closed.
- **C-R326-01 (Low)** → `deferred_low_polish`, joining SYS-CLOCK-DETERMINISM (D-29z929).
  - **Origin: B spec.** Round 253 had already ruled that the playing "after the playhead" tail is jsdom-only. My B-IM24 row still asked the browser for it.
  - C routed it to SYS-R2-FAKE-FIDELITY. That task covers the R2 worker fake, so I moved it to SYS-CLOCK-DETERMINISM.
  - L29 gains this as evidence; `lessons.md` stays at 59 lines.
- **The two infos (D-29z930):**
  - The marker step while playing matches the round-252/253 planner contract. LIVE-MEAS-MARKER-STEP-PLAYING was added to `user-review/live-checks.md` (L44).
  - The stale status after an end-stop becomes signal SIG-R326-END-STOP-STATUS.

## 3. Round 327 design (consults and evidence)
- **Re-measure at HEAD.** C round 325 measured the tree that is now HEAD: fade 103.25 components per move, max 105, 0 restarts during the move, 1 restart at release (K19). Per move, the provider renders twice:
  - `previewArrangement` (setHistory);
  - the `setStatus` fade text, which goes through the context value.
- **`tech-lead`:**
  - Keep a separate status-preview store.
  - Drop my first `baseSequence` rule. Updaters (insert-marker, playback start), refusal recovery and a ref that lags one render would all see the wrong text.
  - Wrap `setStatus` so that each committed write first adopts the pending preview.
  - Flush once, through the gesture release.
  - Keep the span key when a preview becomes committed with the same text, so there is no second `aria-live` announcement.
  - All adopted.
- **`performance-optimizer`:**
  - Expected 22–26 per move; measured 21.633.
  - Assert per-move, max and move restarts, with about 10 % headroom.
  - It also suggested three further savings (primitive readout, a detail panel that ignores fades, skipping an unchanged fade). They are recorded as stage-c signals (D-29z935), not scheduled.
- **Sketch** (`b-round-326/sketch/`, scratch `/home/runner/b326-scratch`):
  - **Perf on a production build** (C's command): fade 21.633 per move, max 22, 0 restarts, at 1× and 6×. Stopped `release-commits` goes 1 → 2. The probe shows the extra commit renders 0 components, 5–9 ms after the release commit.
  - **Combined perf mutant:** 110.133 per move and 59 restarts, so the asserts go red.
  - **Full suite:** 3555/3555 (`precheck-full-v3.log`).
  - **jsdom mutants:** 7, each red on its row.
  - **HEAD parity:** DP10, DP11, DP12 and DP14 are also green on a HEAD copy.
  - **Lint:** Biome warnings are unchanged (15). `setStatus` was added to the 33 dependency arrays the rule flags; nothing else changed in them.
- **Parity hole closed (advisor).** Six reads compare the status text: the stop effect, nudge, and the marker row ×3. All of them now read `getStatusPreviewText() ?? status`. C's B-FADE-END-STOP row checks the reachable case against HEAD.
- **Not applicable:** reference-first, product-designer and the screen budget. This is a perf round, and nothing visible changes.

## 4. Decisions D-29z928…D-29z936 (`backlog.json` v286)
- **D-29z928:** closeout of rounds 325 and 326.
- **D-29z929:** C-R326-01.
- **D-29z930:** the infos and the Live check.
- **D-29z931:** the round-327 contract.
- **D-29z932:** budgets. Five fade rows become asserts. The trim/move per-move conversion moves to stage c.
- **D-29z933:** DP9 is rewritten as DP9a/DP9b, and DP10–DP15 are added (`expect(` 68 → 112).
- **D-29z934:** doc 232 is the feature doc, and l.4 becomes stage 2 of 3.
- **D-29z935:** the target stays at ≤ 15; the remaining gap and three signals go to stage c.
- **D-29z936:** the next round is REGRESSION if it is planned on or after 2026-11-05. `regression-last.json` is unchanged.

## 5. Scope kept
- **Nothing is shrunk or deferred without authority.** PERF-DRAG-PREVIEW keeps its full target (fade, trim and move at ≤ 15 per move; one entry per gesture). Stage c is queued with the group move, cross-lane, video, project end and the trim/move asserts.
- **No Saba question arises.** The Live measurement only feeds a possible later question.
- **Feature boundary and owner risk.** `ArrangementContext.tsx` gains a fourth per-provider store. The open checkpoint D-29z915 gets an addendum (`b-round-326-checkpoint-addendum.md`); this is not a new request and does not block.

## 6. Round 327 in short
- **A** adds:
  - the status-preview store and its context functions;
  - the fade branch on `previewClipGeometry`/`previewStatus`;
  - the footer memo subscriber;
  - the six shown-text reads;
  - the 5 budget asserts;
  - DP9a–DP15 and SP1–SP3;
  - docs 232 and 168.
- **C checks:**
  - the claims;
  - the mutants;
  - perf on a production build, alone;
  - in the browser against HEAD at both viewports: the status text per step, cancel, end-stop, playing, WAV export sha, video fade and G327-AUTH.

## 7. Commit readiness
- No unpublished app work. HEAD `234ccdd` is clean.
- Round 327 is ready to dispatch.

## 8. Final advisor check
See the final note appended below.

**Final advisor note (attempt 2, 2026-11-04).** Attempt 1 stopped during this check; attempt 2 resumed from `b-round-326/checkpoint.md` and redid nothing. The advisor confirmed that the artifacts are consistent: `tasks/round-326.md` is archive-equal; `backlog.json` v286 has D-29z928…D-29z936; `feature-status.md` l.300–301; `b-next.json` is valid; `lessons.md` is 56 lines; the store tree is clean on `234ccdd`; REGRESSION is not due before 2026-11-05. It also confirmed CONTINUE with round 327 = PERF-DRAG-PREVIEW stage b. Nothing in the plan changed. The only edit was closing this §8 placeholder. `b-round-326-result.json` is harness-written session metadata (the same shape as `b-round-325-result.json`), so B did not write it.
