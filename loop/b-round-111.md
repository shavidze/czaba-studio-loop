# B — Round 111 result and Round 112 plan (D-29z77)

Author: B · Date: 2026-10-23 (~14:36–15:20 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 112). Archive: `tasks/round-111.md` (exact copy of the round-111 task, made with `cp -n` + `cmp` before overwriting).

## 1. Inputs read
- **Context:** `context/active-summary.md`, `context/active-backlog.json` (open findings and open items only).
- **Round 111:** `tasks/round-111.md`, `a-round-111.md`, `c-round-111.md`, `c-round-111.json`.
- **Gate 111:** `gates/gate-round-111.json`: **published**, commit `6abd3f39cb24f0334076081d4624da7feb6bb57c`, both remotes on the same hash. Also `gates/round-111/review-result.json` (9/10, COMMIT: OK) and the end of `verify.log` (build OK).
- **Lookups by ID only:** `backlog.json` (C-R6-02, C-R8-01, C-R27-01, A-R38-REVIEW-TOUCH, C-R7-01, T12-GAIN-VOLUME, SRW-03/05/10/11B/12/13/23); `tasks/round-5.md` (RF5-3 and the stall rules), `tasks/round-9.md` §4 (modes D/N/P, R9-D1/L3), `tasks/round-26.md`/`round-27.md` (vm oracle, `lay11`), `c-round-27.md` §7, `checkpoint-r38-review.md`, `b-round-108.md` (the measurement-round plan), `plan.md` D-24/D-24a.
- **Source, read only:** `ArrangementRuler.tsx` l.85–107 (the position writer sets `aria-valuenow` every frame), `ArrangementVideoDock.tsx` l.345–357 (the `data-video-*` counters), `app/routes/studio-lab.tsx`, and the fader/zoom testids.
- **Baseline:** `git rev-parse HEAD` = `6abd3f3…` (the gate commit), and `git status` is clean.

## 2. Backlog changes (only from independent evidence)
| ID | Before | After | Evidence |
|---|---|---|---|
| C-R110-01 (Medium) | dispatched r111 | **done / მზადაა** | C r111 PASS, `browserVerified: true`, `realVerified: true`. VR-HAZARD, VR-ESC-BUTTON and VR-ESC-OPTION ran at 1280 and 1440; VR-SCROLL, VR-OUTSIDE (a–d), VR-SEARCH, VR-NOT-FOR-VIDEO, FV-710 and LF-QUICK also pass. C ran its own mutations. Published `6abd3f3`. |
| GATE110-S4-DOC095-STATUS | dispatched r111 | **done** | C DOC-095-L4 PASS |
| GATE111-S3-DOC096-STATUS (Low) | — | dispatched r112 (one line) | gate-111 review #3 |
| GATE111-S1-TESTID-SELECTOR (Low) | — | `deferred_low_polish` (now 145) | gate-111 review #1 |
| GATE111-S2-DEPSFREE-EFFECT, GATE111-SUGG-E2E-S5 | — | info / signal | gate-111 review #2 and the e2e suggestion (not scheduled) |
| ARCH-R111-FOCUS-OWNERSHIP | — | `architecture_signals` + addendum (w) in `b-round-91-checkpoint-request.md` | Both reviewers say keep inline. Not scheduled. It merges ARCH-R110. |
| C-R6-02, C-R8-01 (Medium) | `open` (routed to the Tech Lead) | `open_tech_lead_quiet_chrome`, dispatched to the r112 measurement | Normalized: the app work that rounds 7–9 named is done. Only measurement remains (`round9_result`). |
| C-R27-01, A-R38-REVIEW-TOUCH | open_tech_lead_* | unchanged; `round112` note added | — |

- `backlog.json` is now version 110. The pre-edit copies are in `b-round-111/`.
- **Not changed:** SRW item statuses; the T12 gate; `regression-last.json`; SRW-21 (`deferred_user`); B-R107-ENTER-ON-BODY (still the user's open question; C's VR-HAZARD confirms the current contract).

## 3. Why round 112 is the cloud measurement round
- **No Critical, no High, and no reproducible Medium is open.**
- **The regression round is not due:** `regression-last.json` is 2026-10-21 and today is 2026-10-23.
- **The queue** (D-29z74 R9 and the b-round-108 plan) puts the C-only cloud measurement next. Its first prerequisite was the focus Mediums, which are now closed. Running it before the regression round wastes nothing, because no app code changes.
- **What T12 waits for:**
  - The root clarification (2026-10-23) says an `open_tech_lead_*` Medium with no reproducible failure in the cloud browser does not block T12.
  - These four were never tried in the cloud. Their blocking status today rests on an untested reading.
  - One bounded C round settles it with evidence. The outcome table is fixed in advance (current-task §5), so B cannot rationalise after seeing numbers.

## 4. Decision D-29z77 (summary; the full text is in `plan.md` and `current-task.md`)
- **A:** doc 096 l.4 only. The expected end state is 1 M. The frozen list `b-round-111-r112-tree-sha256.txt` holds all 919 tracked files except doc 096, checked OK at `6abd3f3`. The protected auth/purchase hashes are unchanged: `studio.$productId` `fa2cf0bc`, `api.studio-token` `13914809`, `auth.ts` `56f5b76f`, `AuthContext` `bf9ee257`.
- **C:** rebuilds the harness, because the Windows round-5…9 scripts are gone from the runner.
  - It is page-only: `addInitScript` with an rAF sampler over `aria-valuenow` and the active `<video>`, LoAF attribution, a play/pause/currentTime spy, and the dock counters.
  - **Layouts:** D, N and P (an R3-V1 cloud adaptation with two VP9 video clips via Ctrl+D), RF5-3, VM `lay11-cloud` (music muted), H.264 as a diagnostic, and TOUCH with Zoom as the positive control.
- **Tolerances:** unchanged (D-24/D-24a; the 30.1 ms vm oracle). The budget is 3 + 2 per layout.
- **New harness rule (B; environment validity only):** a run with dropped/total frames > 20 % is decoder-starved and invalid.
  - **Why:** software decode on a cloud runner can starve the decoder without any app cost. Without this rule, such a run would be either a false FAIL or a reason to loosen the tolerance.
  - **What it does not change:** the drift thresholds. Every run reports the ratio.
- **Smallest honest contract for the uncertain parts:**
  - `startAt` = linear back-extrapolation of the first advancing sample.
  - "App script" = a LoAF script whose `sourceURL` is from the app's `/app/` modules.
  - If LoAF is unsupported, the drift verdicts are inconclusive. No other exclusion is substituted.
  - If Ctrl+D refuses on a video clip, C-R8-01's second-clip window is not covered, and that is inconclusive.

- **After the advisor's second review:**
  - The §5 table now also covers the SRW item transitions: SRW-03, SRW-11B and SRW-13 move to `c_pass_tech_lead_manual` with the finding named, except in the app-attribution row.
  - The doc 096 status line is l.4, not l.3 as the gate review said. B checked the file and corrected every artifact.
  - The decoder-starved rule uses the playback-quality delta. It does not apply when the drops coincide with the app's rate correction.
  - The lay11-cloud starts are fixed and the ends are recorded.
  - The touch PASS is bounded by 20 px.
  - Drift FAILs are reported under the existing IDs.

## 5. Ownership and protection
- **A owns:** doc 096 l.4 only.
- **C owns:** `tmp/studio-real-loop/c-round-112/**` and its reports.
- **Public `/studio-lab`** stays demo-only (G112-3: `/studio/middle-east` shows "Sign in required"; the token API returns 401; the fake-Bearer 403 is BLOCKED by the backend).

## 6. COMPLETE / BLOCKED check
- **Not COMPLETE:**
  - four Mediums are under measurement;
  - SRW-03, SRW-11B and SRW-13 are still `ბაგია` until they are measured;
  - T12, ABLETON-EXPERT-REVIEW, VISUAL-A, the 145 deferred Lows and the final regression are not done.
- **Not BLOCKED:** round 112 needs no outside information, approval or credentials. SRW-21 is `deferred_user`. Phase 2 waits for the user only after T12 and VISUAL-A.

## 7. Root / architecture
- Addendum (w) (ARCH-R111-FOCUS-OWNERSHIP) has been appended. The focus-handoff region changed in 4 rounds, which is the same-owner accumulated-risk trigger. A bounded `frontend-architect` checkpoint is requested from root. It is **non-blocking**: rounds 112 and T12 do not wait for it.
- **Gate 112:** the diff will be one doc line. Root may publish it alone or batch it with round 113.
- The B-R107-ENTER-ON-BODY user question is still open (via root).

## 8. Advisor
The advisor was available and consulted once, before writing. B followed it on these points:
- the framing: this round decides whether these Mediums block T12, under the root clarification;
- the three lookups (the `lay11`/vm oracle rule, the per-frame transport readout, the baseline);
- a self-contained harness spec with an environment-validity gate;
- the pre-committed outcome table;
- Zoom as the touch positive control;
- A explicitly limited to one line;
- normalising the C-R6-02/C-R8-01 statuses.

One deviation: the advisor called A "a no-op". B gave A the one-line doc 096 status fix (gate-111 #3). It is the established pattern, it costs nothing, and it keeps the source tree frozen.
