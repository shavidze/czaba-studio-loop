# CURRENT TASK — Round 112: C-only cloud measurement round (C-R6-02, C-R8-01, C-R27-01, A-R38-REVIEW-TOUCH)

Dispatcher: B · Implementer: A (one doc line only) · Verifier: C · Date: 2026-10-23 (B planned ~14:36–15:20 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner, speed rules, the 2026-10-23 bug-gate decision and the root clarification about `open_tech_lead_*` Mediums. Those rules take precedence over older text.
- **Previous task:** `tasks/round-111.md` (exact copy). Rationale: `b-round-111.md`. Decision record: **D-29z77** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** **measurement round**. The only change is one doc status line (A). C spends the whole round measuring in the real browser. No app code changes, so nothing here can regress Studio behaviour.
- **Baseline:** HEAD `6abd3f39cb24f0334076081d4624da7feb6bb57c` (gate 111 published, both remotes), `git status` clean (B checked at planning time).

## 0. Why this round, and what it decides
- Round 111 (C-R110-01) is C PASS, `browserVerified: true`, and published in `6abd3f3`. No Critical/High is open. No reproducible Medium is open.
- The four Mediums left before T12 were all measured only on the old loaded Windows host, or never measured at all:
  - **C-R6-02** (SRW-03 / FB-16): R3-V1 video drift with app-attributed LoAFs. After round 9: mode N 3/3 PASS, RF5-3 3/3 PASS, mode D 2/3. Closing needs mode D too.
  - **C-R8-01** (SRW-11B / FB-08): R3-V1 drift with the detail panel open and a clip selected (mode D). After round 9: 2/3 valid PASS; `D_3` failed 0.1564 s inside the second video clip, with app LoAF 0 and forced layout 0.
  - **C-R27-01** (SRW-13): a video drift sample with the level meters running. 4 of 5 runs were above the 30.1 ms oracle on the loaded host. Attribution is open.
  - **A-R38-REVIEW-TOUCH** (SRW-13 faders): unverified reviewer hypothesis that a touch press jumps the range faders natively.
- The root clarification (2026-10-23) says a Medium whose only remaining step is a manual check, and that has **no reproducible failure in the cloud browser**, does not block T12. Nobody has tried to reproduce these four in the cloud yet. This round makes that statement evidence-based.
- **The outcome is fixed in advance (§5).** B will apply that table as written, whatever the numbers are.
- **Regression round:** `regression-last.json` is 2026-10-21. Today is 2026-10-23, so it is not due. The first B planning on or after 2026-10-24 is the regression round.

## 1. A — the only change
| File | Change |
|---|---|
| `docs/implementation/2026/quarter-IV/096-studio-video-return-library-focus.md` | **Line 4 only (the status line, today „Round 111 — C-ის შემოწმებას ელოდება (D-29z76; C-R110-01).“):** say Round 111 is C PASS and published in `6abd3f3` (gate 111). Use the same wording pattern that doc 095 l.4 used in round 111. |

- Nothing else changes: no file under `app/`, no test and no other doc. No new files in `store/`.
- **Expected end state:** `git status --short --untracked-files=all` = exactly ` M docs/implementation/2026/quarter-IV/096-studio-video-return-library-focus.md`.
- **Frozen list:** `b-round-111-r112-tree-sha256.txt` (every tracked file except doc 096). A checks it at the start and at the end and reports OK/FAIL.
- **A's checks:** `git diff` shows one hunk on line 4 of doc 096. A does not need typecheck/lint/vitest, because no code changed. A does not run the full suite. A does not need a code-reviewer (one file, a doc).
- **A's report** (`a-round-112.md`) states: start HEAD and status, the diff, the frozen-list result at the start and at the end, and the end status.
- **Forbidden:** everything in `global_forbidden_files`/`global_forbidden_actions` of `backlog.json`, including the protected auth/purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`). No commit, push, stash, checkout or deploy. No dev-server restarts. No probes that write into `store/`.

## 2. C — environment record (first, written to `c-round-112/env.json`)
Record, before any measurement:
- `nproc`, `free -m`, `uptime` (load average), the Chromium version (`browser.version()`), and headless or headed.
- `env-status.json` (store 200 is required to start).
- In the page: `HTMLVideoElement.prototype.canPlayType` for `video/webm; codecs="vp9, opus"` and `video/mp4; codecs="avc1.42E01E, mp4a.40.2"`, and `PerformanceObserver.supportedEntryTypes` (does it contain `long-animation-frame`?).
- `git -C store rev-parse HEAD` and `git status --short` at the start and at the end.

If `long-animation-frame` is not supported, the stall exclusion of D-24 cannot be computed. Then every drift layout is run and reported on the raw series, the drift verdicts are **inconclusive (environment)**, and §5 row "environment" applies. Do not invent a substitute exclusion.

## 3. C — the harness (cloud rebuild; the round-5…9 Windows scripts are gone)
Write it under `tmp/studio-real-loop/c-round-112/tools/`. Evidence goes under `c-round-112/runs/`, `c-round-112/out/` and `c-round-112/shots/`. The harness instruments the **page** with `page.addInitScript`. It never edits `store/`.

**Browser.** Playwright Chromium, a fresh context per run, no storage state, no credentials. Viewport **1440×900** for every drift layout (the original layouts were 1440). Media from `tmp/studio-real-loop/media/` (check `SHA256SUMS.txt` first), loaded through `[data-testid=arrangement-video-input]` with `setInputFiles`, as in `c-round-84/tools/lib81.cjs`.

**In-page sampler** (light: no per-frame `getComputedStyle`, no layout reads), started just before the Play click and stopped at the end of the run. Every `requestAnimationFrame` it pushes `{ t: performance.now(), pos, vt, paused, rate, role }`:
- `pos` = `Number([data-testid=arrangement-playhead-handle].getAttribute('aria-valuenow'))`. The ruler position writer sets it on every written frame, in seconds rounded to 1 ms (`ArrangementRuler.tsx` l.101).
- `vt` = `currentTime` of `video[data-video-role=active]`; `paused` and `playbackRate` of the same element.
- **Drift** `d = vt − (pos − clip.start + clip.offset)` for the video clip that covers `pos`. Samples where no video clip covers `pos` are not drift samples.
- The 1 ms rounding of `pos`, and the possibility that the sampler's rAF runs before the app's writer in a frame (up to one frame of skew), are known harness limits. Report them. They are the same for every layout and run.

**Other instruments** (same init script):
- A `PerformanceObserver` for `long-animation-frame` (`buffered: true`). Keep the `scripts[]` attribution with `sourceURL` and `duration`. "App script" = a script whose `sourceURL` is served from the store dev server's `/app/` modules (or the app's optimised chunks). Record the rule you used.
- A spy that wraps `HTMLMediaElement.prototype.play` and `pause`, and the `currentTime` setter, recording `performance.now()` and the element role. This is used for RF5-3 and for the hard-seek windows.
- `seeking`/`seeked` listeners on both `<video>` elements.
- At the end of each run: the dock counters from the `data-video-*` attributes of the dock root (`videoSwaps`, `videoFallbacks`, `videoHardSeeks`, `videoEscalations`, `videoSettles`; `ArrangementVideoDock.tsx` l.350–357), and `getVideoPlaybackQuality()` of both elements.

**Rules, unchanged (D-24, D-24a; `tasks/round-5.md` §(2)):**
- **Thresholds per run:** median |d| ≤ **0.05 s** and max |d| ≤ **0.1 s**. These are not relaxed.
- **Exclusions, and only these:**
  - **stall windows:** from the start of a LoAF ≥ 50 ms with < 10 ms of app script, or of a rAF gap ≥ 50 ms with no app-attributed script, to its end + 300 ms;
  - **hard-seek windows:** from a `currentTime` write issued by the app to that element's `seeked` + 300 ms;
  - samples where no video clip covers `pos`.
- An app-attributed long task (≥ 10 ms of app script) is **not** excluded and counts against the app.
- **Verdict** on the stall-excluded series. Report the raw series next to it, per run.
- **Validity:**
  - a run whose stall windows cover > 10 % of its sampled time is **invalid (environment)**;
  - a run where the active element shows dropped/total frames > 20 % is **invalid (decoder-starved environment)**. `getVideoPlaybackQuality()` is cumulative, so read it on both elements at the Play click and at the end, and apply the rule to the **delta**. This is a B harness rule for the cloud runner, recorded in D-29z77. Report the ratio for every run, valid or not, **together with the rate statistics** (share of samples with `playbackRate ≠ 1`, min/max rate, escalations).
  - **Exception:** if the drops coincide with the app's rate correction (rate ≠ 1 for > 20 % of the run, or ≥ 1 escalation), the run is **not** environment-invalid. Judge it as a normal valid run, because the app's own correction may be what starves the decoder;
  - every invalid run is reported and replaced.
- **Budget per layout:** 3 valid runs, plus at most **2** replacements for runs that are invalid because of the environment. A run that is valid and fails is **not** replaced. A third environment-invalid run means "budget exhausted"; it is not a PASS.
- **Do not change** a threshold, an exclusion or a layout after seeing a number. If C thinks a rule is wrong, report it as a note to B. The verdict still uses the rule as written.

## 4. C — rows

### 4.1 Drift layouts (1440×900; cloud adaptation of R3-V1 — say so in the report)
**Setup for every drift run** (`/studio-lab` → Decline the cookie banner → wait until „იტვირთება…“ is gone):
1. Load `beeps-6s-vp9-opus.webm`. The video clip lands at 0. Select it and press **Ctrl+D** (D-25 duplicate), so that a second video clip follows the first one. If Ctrl+D refuses on the video clip, record the status text, run with the single clip, and mark C-R8-01 "second-clip window not covered" (§5 inconclusive).
2. Add audio at the insert marker with the library (focus the option, Enter, on the active lane): Middle East on **music** at 0; one stem of the CZABA hero collection on **stems** at 2 s; the soft-impact SFX on **SFX** at 4 s. If one of these sources is not offered, use the nearest demo item and record it. Music and stems must cover the 0–13 s window; record the actual ends.
3. Record the clip table (`lane, start, end, offset, source`) in `runs/<layout>-<n>.json`. All runs of one layout must use the same table.
4. Snap off. Return the playhead to 0. Blur the focus. Then Play from 0 for **13 s**, Pause.

| Layout | State before Play | Verdict for |
|---|---|---|
| **D** | the **music** clip selected; detail panel open at its default height (144 px at 1440×900; record the measured height) | C-R8-01 (R9-D1) and C-R6-02 (R9-L3 mode D) |
| **N** | detail panel open; nothing selected | C-R6-02 (R9-L3 mode N); attribution control for C-R8-01 |
| **P** | music selected; detail panel collapsed | attribution control only: 3 runs, no verdict, no replacements |

Alternate D, N and P in one browser process (D1, N1, P1, D2, …). Each run is a fresh context.

**Report per run:** valid/invalid and why; n samples; raw and stall-excluded median/max |d| and the time of the max; stall coverage %; app-attributed LoAFs (start, duration, top script URL); hard-seek and escalation counts; dock counters; dropped/total frames; whether the max lies inside the second video clip. Per layout: the D − N and D − P difference of median |d|, for information.

### 4.2 RF5-3 (C-R6-02; first Play after a fresh load and import)
Same setup as layout **N**. The run starts with the **first** Play after the import, with no earlier Play in that context. Criterion, verbatim from `tasks/round-5.md` l.136:
- during the start hold the active element is **paused until `play()` is issued**;
- `play()` lands within [`startAt` − min(frameInterval, 20 ms), `startAt` + one measured rAF interval, max 34 ms];
- the shown media time must not advance before `startAt` by more than one frame;
- drift ≤ 0.1 for `startAt`..+100 ms and ≤ 0.06 for +100..+300 ms.

**Harness definitions** (B, for the cloud rebuild):
- `frameInterval` = the run's median rAF delta.
- `startAt` = `t − (pos − p0)` for the first sample whose `pos` is greater than the Play position `p0` (linear back-extrapolation at rate 1).
- `play()` issue time = the spy's timestamp for the active element.

3 valid runs + 2 replacements. Same validity rules as §3.

### 4.3 VM — C-R27-01 (meters running)
- **Layout `lay11-cloud`:** video `beeps-6s-vp9-opus.webm` at 0 (0–6.008); music starting at 0, stems starting at 2, SFX starting at 4 (round-27 `lay11` starts). The demo sources have their own lengths: Middle East is 101.352 s (INFO-C71-ME-LENGTH). Require the starts and that music and stems cover 0–7 s; record the actual ends. Every run uses the same table. **The music lane is muted** (the round-28 vm layout). Nothing selected; detail panel as it opens.
- **Before Play,** check that the level meters are live: the Master meter and the stems meter move during the first second (one screenshot `shots/vm-meters-1440.png`).
- Play from 0 for **7 s**, Pause.
- **Oracle, unchanged:**
  - max |d| ≤ **30.1 ms** over 0–6.008 s (round-26 reference 20.1 ms + 10 ms) on the stall-excluded series;
  - dock `videoHardSeeks` 0 → 0.
- This is the round-27 number. It is not relaxed, although the reference came from another machine.
- 3 valid runs + 2 replacements. Report the raw series too.

### 4.4 H.264 (diagnostic, not a verdict)
- If `canPlayType` for the H.264/AAC MP4 is `probably` or `maybe`, **and** `beeps-6s-h264-aac.mp4` actually plays in the dock (currentTime advances), run layout **D** 3 times with that file. Report the numbers as a diagnostic.
- Otherwise record **BLOCKED (environment: no H.264 in this Chromium build)**.
- VP9 + H.264 in a quiet real Chrome stays the Tech Lead's check either way.

### 4.5 TOUCH — A-R38-REVIEW-TOUCH
- **Context:** `hasTouch: true`, `isMobile: false`, 1440×900. Use the CDP session `Input.dispatchTouchEvent` (touchStart → touchMove × 5 → touchEnd). Use the sounds layout of §4.1 (no video needed), Stop state.
- **Targets:** a track **Volume** fader, a track **Pan** fader, the **Master** volume fader, and the **Zoom** slider (`[data-testid=arrangement-zoom]`) as the positive control. Zoom has no relative drag, and MN-Z says it still jumps.
- **For each target:**
  - read the value (`input.value`), the thumb's x, and the input box;
  - touchStart at a point **far from the thumb**: 15 % of the width from the end opposite the thumb;
  - read the value 100 ms after the touchStart, before any move;
  - then 5 touchMoves of +4 px each, read the value, touchEnd, read the value again;
  - also record any status text and the undo history count (Undo button enabled/disabled, and its title).
- **Discriminator:**
  - **Zoom jumps** toward the touch point on touchStart, or on its first touchMove → the CDP touch path reaches the native slider; the harness is valid.
  - **Zoom does not jump** → the harness does not reach the native path. TOUCH is **inconclusive**, not PASS.
- **Verdict (only with a valid harness):**
  - **FADER-NO-JUMP PASS** if, for Volume, Pan and Master:
    - the value does not change on touchStart, and does not move toward the touch point on the first touchMove;
    - over the 5 moves (20 px in total), any change is no larger than the value equivalent of 20 px of the input's width.
    - A value that does not move at all during the moves is still a PASS for this hypothesis, which is about jumping. Record it as "touch does not start the relative drag" (info for the Tech Lead).
  - **FAIL** if any of the three jumps toward the touch point.
- **Runs:** 3 per target. Do one extra mouse control per fader (mouse press at the same far point; it must not jump, as in round 38). Shots: `shots/touch-<target>-1440.png`.

### 4.6 Neighbours and protection (short)
- **SOURCE-UNCHANGED:** at the start and at the end, the only difference from `6abd3f3` is doc 096 l.4. The frozen list `b-round-111-r112-tree-sha256.txt` is OK. Record A's diff.
- **DOC-096-L4:** one line, says C PASS and published in `6abd3f3`.
- **PX-NET:** in every session, 0 requests to forbidden hosts (R2/r2-proxy/workers.dev, Shopify, Firebase auth, Brevo) and 0 `Authorization` headers.
- **REG-HYD:** in every session, 0 hydration errors, 0 `pageerror`, and no console errors except the known cloud noise ("Failed to load cart", `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`).
- **G112-3 (alone, last):**
  - `/studio-lab` shows the workspace and „დემო კოლექცია — ავტორიზაცია არ სჭირდება“;
  - `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;
  - `/api/studio-token?product=middle-east&file=stem1.wav` returns **401**;
  - the fake-Bearer 403 sub-check is BLOCKED (backend unavailable in cloud).

### 4.7 Gate rows (not claimed by C)
full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## 5. Outcome table (fixed now; B applies it as written)
| Result in this round | C-R6-02 | C-R8-01 | C-R27-01 | A-R38-REVIEW-TOUCH |
|---|---|---|---|---|
| **PASS:** 3 valid runs pass in each verdict layout of the finding | closed (D 3/3 here; N and RF5-3 3/3 here; round 9 is history) | closed (D 3/3) | closed (vm 3/3) | closed for Chromium; a real touch device stays a Tech Lead info note |
| **FAIL with app attribution:** a valid run fails and, in its failing window, there is an app-attributed LoAF/script ≥ 10 ms, or the D − N difference shows the cost follows the app state | **bounded A bug round next** (one owner, the named cost, the same rows as the verdict) | same | same | **bounded A round:** the pre-specified amendment (a native non-passive `touchstart` with `preventDefault` on Volume, Pan and Master only; Zoom excluded) |
| **FAIL, no app attribution:** a valid run fails with no app script in its window | stays open as `open_tech_lead_quiet_chrome` with the cloud evidence; **does not block T12** (root clarification) | same | same | — |
| **Environment:** budget exhausted, LoAF unsupported, decoder-starved, or the TOUCH harness invalid | same as the row above: `open_tech_lead_*` with evidence; not PASS; does not block T12 | same | same | stays `open_tech_lead_check`; does not block T12 |

- **SRW items (applies with the table):**
  - In the **PASS**, **FAIL without attribution** and **Environment** rows, the owning items move to `c_pass_tech_lead_manual`, with the finding named, e.g. `c_pass_tech_lead_manual (C-R6-02 open_tech_lead_quiet_chrome)`, once no other C bug is open on them. The owners are SRW-03 (C-R6-02), SRW-11B (C-R8-01) and SRW-13 (C-R27-01, A-R38-REVIEW-TOUCH).
  - In the **FAIL with app attribution** row, the item keeps its status until the bug round's C PASS.
  - SRW-11B's accepted Lows (C-R11-04, C-R15-01) and SRW-01's C-R6-01 are Low/accepted and do not hold an item back (2026-10-23 rule).
- **Why the "no app attribution" row does not block T12:** the root clarification names exactly this case. The app work these findings asked for was done in rounds 7–9. The tolerances stay unchanged, and they still need the Tech Lead's quiet Chrome before final acceptance.
- **T12 opens at the next planning** unless this round produces the "FAIL with app attribution" row. Then that one bounded bug round comes first. A regression round due on or after 2026-10-24 also comes first.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Video stays in sync with the transport | Live 12 manual, ch. 24 "Video" (not re-opened in this round) | not applicable: this round measures CZABA's own sync tolerance, D-24 | CZABA tolerance D-24 (median ≤ 0.05 s, max ≤ 0.1 s) | §4.1–4.3 |
| Touch on a fader does not jump | none (Live is a desktop application, not a browser range input) | not applicable | D-29z3 relative drag | §4.5 |

Ableton correspondence for every row: **არ ეხება**. Make no Ableton claim.

## 7. Evidence and reporting
- `c-round-112.md` (Georgian or English, as before) and `c-round-112.json` with `taskStatus`, `passed`, `failed`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, plus a `measurement` object: per finding, the §5 row that applies and the run IDs.
- Write the report files **as you go**. A job can be stopped at its time limit.
- `taskStatus` is PASS when every row was run as written and the A part is correct, **whatever** the measurement outcome. A measured drift FAIL is reported as a finding with its §5 row; it is not a FAIL of A's one-line doc change. Report a measured drift or touch FAIL in `bugs` under the **existing** finding ID (C-R6-02, C-R8-01, C-R27-01, A-R38-REVIEW-TOUCH), not a new ID, with its §5 row. Rows blocked by the environment go under `blocked` with the reason: LoAF unsupported, budget exhausted, H.264 unplayable, Ctrl+D refused, or the touch harness invalid. `browserVerified` is round-level: it is false only if a browser row that **can** run here was not run.
- Consult only the read-only agents in C's list, if needed. No `store/` writes.
