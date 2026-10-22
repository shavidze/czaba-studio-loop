# B round 85 review → round 86 task (D-29z51)

Author: B · Date: 2026-10-22 · Decision: **CONTINUE** (`b-next.json`)

## 1. Inputs read
- `context/active-summary.md`, `context/active-backlog.json` (full `backlog.json` only by ID);
- the round-85 task (`current-task.md`, archived as `tasks/round-85.md`, exact copy, sha256 `7b5037d3…`);
- `a-round-85.md`, `c-round-85.md`, `c-round-85.json`, `gates/gate-round-85.json` (**published**, commit `51e024af0defc5d1774a693c7d003e4dc685299d` on both remotes → baseline HEAD for round 86), `gates/round-85/review.md` (8.5/10, COMMIT OK), `env-status.json` (store 200), `regression-last.json` (2026-10-21, round 71).
- App source at `51e024a`, read-only: `ArrangementExportDialog.tsx`, `ArrangementContext.tsx` (`exportWav`), `graph.client.ts` (`renderArrangementWav`), `app/utils/ffmpeg.ts`, `StudioContext.tsx` (its only other caller), `vite.config.ts`, and the tests `export-dialog-focus.test.tsx`, `export-range-ui.test.tsx`, `export-dialog-focus-restore.test.tsx` (by grep).
- Live 12 manual §5.1.3.2 from the stored round-84 capture `b-round-84/web/managing-files.txt` l.200–236 (untrusted data).
- **Advisor:** the configured advisor tool was available and was consulted twice: before writing and on the written artifacts. The second review led to: a second probe (two scripted downloads; both arrive in Playwright Chromium), the doc 075 line as a fenced block, the C-R14-02 title added to the grant, the 0.98–0.99 correlation band marked "report, B triages", and the 120 s disabled-Close note in §5 and doc 076. Adopted: bundle C-R85-L2 with MP3 under one frozen-test grant; rule C-R85-L1 as a signal; keep `ffmpeg.ts` frozen and wrap with a timeout; grant `vite.config.ts` after checking `global_forbidden_files` (it is not listed); allow unpkg in C's network row; MP3 oracle with lag/tolerance; disclose the probe.

## 2. Evidence-based backlog updates (C evidence only)
| Item | Before | After | Evidence |
|---|---|---|---|
| SRW-20 stage 1 | dispatched | **c_pass_published** `51e024a`, `browserVerified=true`; **R20-X1 pass, R20-X3 pass**; XR-PASTEND not reachable (unit XR4) | `c-round-85.json` passed[], gate 85 |
| SRW-20 | in_progress | in_progress (stage 2 dispatched round 86; stage 3 planned) | — |
| C-R84-M1 (Medium) | scheduled X1 | **closed** | M1-HANDLE/SELECTED/GHOST/VISIBLE/ENV both viewports |
| C-R84-M1-AUDIO-STATUS, GATE83-M1 | open/reproduced | **closed** (moot / via C-R84-M1) | M1-HANDLE |
| C-R84-L1 | open | open, evidence extended (jitter also without video); harness rule widened | `c-round-85.json` observations |
| C-R85-L1 | — | **ruled: not a contract** → signal ESCAPE-CANCEL-GESTURE | see §3 |
| C-R85-L2 | — | open → round 86 X1 | `xr-*.json` |
| Gate-85 reviewer #1–#6 | — | #2 and #3 scheduled in round 86; #1, #4, #5 Lows batch; #6 regression-round row | `gates/round-85/review.md` |
| FFMPEG-DEV-WORKER | — | **new, Medium, B probe evidence** → round 86 (`vite.config.ts`) | `b-round-85/probe/PROBE-SUMMARY.md` |
| FFMPEG-LOAD-POLLER-HANG | — | signal for the `ffmpeg.ts` owner (frozen, shared with the protected Studio) | source + probe |
| R86-T | — | Tech Lead manual check added | — |

SRW-20 is not marked **მზადაა**: stages 2 and 3 remain, and Tech Lead R85-T is open. No browser half is missing for stage 1 (`browserVerified=true`).

## 3. Round 86 decision and rationale
- **C bugs first.** Both are Low.
  - **C-R85-L2** is a real deviation from the round-85 spec, caused only by the frozen C-R14-02 count. Enabling MP3 forces that same test to change, so fixing the project radio costs nothing extra → X1, together with the gate-85 #2 `aria-describedby` on the same radio.
  - **C-R85-L1** is not a defect against any CZABA contract. B's round-85 row assumed Escape cancels a drag. A grep shows no workspace pointer gesture handles Escape, Live's behaviour is unconfirmed, and the user never asked for it. Scheduling it would add an unrequested cross-cutting feature, so it is a recorded signal for a user/Tech Lead decision, not a deferral of a requested feature.
- **Regression round not due** (due on/after 2026-10-24; today 2026-10-22). Next dependency-ordered scope: **SRW-20 stage 2** (R20-X2, "MP3 via existing ffmpeg, clear error if CDN load fails, WAV+MP3").
- **Small experiment before the contract** (policy rule 8). Start state: `/studio-lab` on the dev server, no source change. Action: dynamic-import `/app/utils/ffmpeg.ts` in the page and call `loadFFmpeg()`. Result: the ffmpeg worker request `node_modules/.vite/deps/worker.js` fails and the promise never settles (150 s). Scratch Vite with `optimizeDeps.exclude` → loaded in 3.2 s; the same scratch without it → same failure. **Confirmed:** dev pre-bundling breaks the worker; **inference** for C to confirm: the same line fixes `/studio-lab`. Without this, any MP3 task would have hung in C's browser.
- **Uncertain UI contracts, smallest honest choices:**
  - "WAV+MP3" is read as Live's "MP3 on its own or together with PCM": one radio WAV / MP3 / WAV + MP3, both-or-none downloads.
  - `ffmpeg.ts` stays frozen (shared with the protected purchased Studio). Its hang is bounded in the context by a 120 s timeout with an honest "reload" message, because a hung load keeps the util in its loading state.
  - No bitrate claim in the UI: the frozen command makes VBR; Live is CBR 320 → conscious difference, C reports the header.
  - Dynamic import so the 31 MB encoder is never fetched unless an MP3 is requested; C checks the network.
  - Format radios stay enabled while rendering because frozen tests keep focus on the WAV radio during a render.
  - The render-window helper (gate-85 #3, A's Architecture note) is scheduled now only because `exportMp3` would otherwise add a third copy.
- **Not verifiable here:** MP3 in the production bundle (no preview server in the cloud). C lists it as not run.

## 4. Architecture
- A's round-85 Architecture note and the gate-85 note are recorded as `architecture_signals` (round 85). Signal 2 is scheduled as R0 because of the third consumer; signal 4 keep.
- SRW-20 stage 1 is a stage boundary, and the dialog has now been changed by three rounds. B appended **q13** (Export dialog format × scope axes, plus the `ffmpeg.ts` poller signal) to `b-round-83-checkpoint-request.md`. Root still has not answered the SRW-16 / round-83 request. **Request to root:** please run the bounded frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`) on q1–q13 at the next publish. It does not block round 86.

## 5. Artifacts written (B-owned only)
- `tasks/round-85.md` (copy); `current-task.md` (round 86);
- `b-round-85-r86-tree-sha256.txt` (487 entries, 487/487 OK at `51e024a`) and `b-round-85-r86-snapshots/` (7 files + `SHA256SUMS.txt`);
- `backlog.json` v85 (pre-copy `b-round-85-pre-backlog.json`; script `b-round-85/update_backlog.py`);
- `feature-status.md` (pre-copy `b-round-85-pre-feature-status.md`; script `b-round-85/update_fs.py`);
- `docs/technical/studio-real-workspace/plan.md` D-29z51 (pre-copy `b-round-85/plan.before-b-round-85.md`; text `b-round-85/d-29z51.md`);
- `b-round-83-checkpoint-request.md` addendum q13 (pre-copy `b-round-85/checkpoint-request.before-addendum.md`);
- `b-next.json` (previous copy `b-round-85/b-next.before.json`); `b-round-85-checkpoint.md`;
- probe `b-round-85/probe/` (scripts, outputs, `PROBE-SUMMARY.md`).

## 6. Disclosure (environment side effects of the probe)
- B started and stopped two scratch Vite servers on `127.0.0.1:5191` (own root and `cacheDir` under `b-round-85/probe/`, deleted afterwards). `:5173` stayed 200 throughout.
- `ffprobe.cjs` dynamic-imported `/app/utils/ffmpeg.ts` through the running `:5173` dev server. `store/node_modules/.vite/deps/` contains `@ffmpeg_ffmpeg.js` / `@ffmpeg_util.js`; B cannot tell whether they pre-existed (the purchased Studio imports the same util). No tracked file changed: `git status --short` = 0 lines before and after; no source, test or config was edited by B.
- `dl2.cjs` opened `/studio-lab` in two fresh Playwright contexts and clicked two blob anchors (no app change); both downloads arrived.
- Round 86 changes `vite.config.ts`, which makes Vite restart itself once during A's phase; A records it, C re-checks env.

## 7. Commit readiness
Round 85 is already published by root (`51e024a`). B has nothing for root to publish. Round 86 starts from a clean tree.

## 8. Task summary
Round 86: **X1** — Export's "whole project" radio always enabled, the range reason linked by `aria-describedby` (C-R85-L2, gate-85 #2); **R0** — one pure `render-window.ts` rule; **SRW-20 stage 2** — format WAV / MP3 / WAV + MP3, `exportMp3` through the frozen `ffmpeg.ts` (dynamic import, 120 s timeout, exact errors, both-or-none, `czaba-studio-lab[-range].mp3`), plus `vite.config.ts` `optimizeDeps.exclude` so the encoder works in dev. C verifies 18 rows at 1440x900 and 1280x720 (MP-TIMEOUT at one viewport). Next: regression round from 2026-10-24, otherwise SRW-20 stage 3.
