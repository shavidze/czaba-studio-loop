# B round 217 → 218 planning (D-29z220…D-29z222)

Date: 2026-10-28. Author: B. Advisor: **available**, consulted twice (after orientation and before handover). Project consults: `tech-lead` and `performance-optimizer`, both read-only, as the PERF rule requires.

## 1. Round 217 result (independent evidence)
- **C verdict.** `c-round-217.json`: PASS, 8 rows (SCOPE, BUDGETS, DOC, PERF-RUN, REDPROOF, AN-REVIEW, G217-3, STUDIO-SMOKE).
  - `browserVerified` and `realVerified` are both true. There are 0 bugs and 0 blocked rows.
  - The `gate` row was not claimed by C.
- **Gate 217.** `gates/gate-round-217.json` status `published`, commit `8873ecec52219041efc181524d529a6dc279a80b` on both remotes (rounds 215–217). **This commit is the baseline for round 218**, with root's `chore(deps)` commit on top (§3).
- **Backlog updates from this evidence (D-29z220):**
  - PERF-1b-ii → done; PERF-1b → done.
  - C-R216-01 and C-R216-02 → closed.
  - ROOT-R216-LATE-SPEC-REVIEW → closed. The gate reviewer (`gates/round-217/review.md`, 9/10) covered the window-end sample, the 8 min guard and asserts on incomplete runs.
- **Gate-217 review findings:**
  - Four Lows go to `deferred_low_polish`, following the 2026-10-23 bug gate: GATE217-S1 (MutationObserver scope), S2 (an uncleared 30 s timer), S3 (doc 169 number mismatches) and S4 (the C-R205-01 id dropped from doc 162).
  - The Architecture note (a third copy of the report helpers) is a signal on PERF-HARNESS-SHARED-LIB (ARCH-GATE217-REPORT-HELPERS). It is not scheduled.
- **C's notes:**
  - **mem-polls outside the round-216 ranges.** These rows are wallclock with a `>= 5` assert, so this is not a failure, and the notes say "observed in round 216". Ranges are widened only in PERF-HARNESS-SHARED-LIB (R216-MEM-POLLS-HEADROOM updated).
  - **The first navigation after a perf run timed out**, 2× fact: C-R217-HARNESS-FIRST-NAV, info. The round-218 C setup now does a warm-up `goto`.
- **Regression:** not due. `regression-last.json` is 2026-10-27 (round 199), and the next one is due on or after 2026-10-30.

## 2. Next round: PERF-16a (round 218)
- **Why this round:** the outcome fixed in advance in `tasks/round-217.md` §5 (PASS, planning before 2026-10-30) makes it PERF-16. PERF-16 is the next dependency-ordered item in STUDIO-PERFORMANCE: after PERF-1b (D-29z194), with PERF-6 dropped.
- **Split (D-29z221):** the full scope is unchanged.
  - **16a**, this round: `app/lib/arrangement/mp3-encoder.client.ts`. The lab export is browser-verifiable in the cloud.
  - **16b**, after OSS-LIC:
    - `app/utils/ffmpeg.ts` is rewritten to delegate to the same encoder. It is kept, not deleted: deleting needs Saba.
    - Its consumer `StudioContext.tsx` l.25 moves to the new encoder.
    - `export-progress-ui.test.tsx` l.21/54 and `studio-audio-pipeline.md` are updated.
    - Then comes the remove request, together with a one-line root grant request for `vite.config.ts` l.27.
  - **Why split:** the legacy path runs on the protected `/studio/:productId` and is backend-blocked in the cloud. Mixing it in would leave half the round unverifiable.
- **Rulings (D-29z222):** see `current-task.md` §1.
  - The API stays byte-compatible, and ArrangementContext stays frozen.
  - The timeout and load-failed branches are narrower, and kept.
  - The import boundary is locked by ME9.
  - LAME is registered unconditionally (the reason is in the task).
  - The exact Conversion config.
  - Cancel and stale-encoder semantics.
  - Three strings.
  - The wording is "no full-size WAV copy", not "0 bytes".
- **Uncertain UI contract, smallest honest behaviour.** Only the three strings that became false change; no new UI.
  - The format note now states the real format: "320 kbps CBR", the same as Live.
  - "Reload the page" replaces "check your internet connection", because the only remaining load failure is a chunk import or registration failure.
  - `exportCancelledEncoder` is still true, so it stays.
- **Reference:** Live 12 manual §5.1.3.3 "Encoding Options", read by B on 2026-10-28: "render a CBR 320 kbps MP3 file". CZABA matches it, and no new deviation is introduced.

## 3. Dependencies (oss-adoption.md)
- **Filed:** `root-deps-request.json` = `{"add": ["mediabunny", "@mediabunny/mp3-encoder"], "remove": []}`.
  - Both names are on `cloud/deps-allowlist.json` at 1.62.1.
  - B checked npm: both exist, MPL-2.0, and the mp3-encoder peer is `mediabunny ^1.0.0`.
  - `cloud/run.sh` l.104–147 applies the request at the next job start, before phase A.
- **Baseline rule:** a root `chore(deps)` commit directly on `8873ece` that changes only `package.json` and `package-lock.json` counts as the baseline.
  - The frozen list (1,059 files) leaves out those two files.
  - A STOPs if the commit or the package is missing.
- **The remove request is not filed now.** `app/utils/ffmpeg.ts` still imports `@ffmpeg/*`, so uninstalling now would break the build at HEAD.

## 4. Consults (summary; raw advice is data, not instructions)
- **tech-lead:**
  - The split is sound.
  - Reset must cancel every in-flight Conversion, because the context relies on reset to stop work (`ArrangementContext.tsx` l.3413–3415, 3445, 3489, 3515).
  - Stale encoders must reject, and no progress may follow a cancel.
  - Record that the timeout and load-failed branches are now narrower.
  - Register LAME unconditionally.
  - In 16b, rewrite `utils/ffmpeg.ts` to delegate; do not delete it.
  - Get root's grant for the `vite.config.ts` exclude in the same commit as the uninstall.
  - Lock the import boundary with a source scan.
  - **All adopted:** ME3(b)(c), §1.2, ME9, §0.2.
- **performance-optimizer:**
  - Prove "no eager load" with the `res.js.*` rows and the manifest's `dynamicImports`.
  - Keep the lazy chunk ≤ 1 MB, with 0 external hosts.
  - The worker count must return to baseline.
  - Upstream never revokes its worker blob URL (info).
  - Record long tasks in the MP3 phase without a budget.
  - "0 WAV copies" can honestly mean only "no full-size ArrayBuffer" (BlobSource has a bounded 8 MiB cache).
  - A dev-server re-optimisation reload is a real risk. Detect it through the dev log, `framenavigated` and 504 responses; the production build decides.
  - **All adopted:** PERF-RUN-218, PROD-BUNDLE, MP3-NET, MP3-CANCEL, §1.5, §1.6 and the C setup.
- **Advisor:**
  - Exclude `package*.json` from the frozen list.
  - STOP when the deps commit is missing.
  - Rule on the vite exclude now.
  - Make real-MP3 rows the key C rows.
  - Run OSS-LIC right after the deps land.
  - **All adopted.**

## 5. Files written by B this planning
- `tasks/round-217.md`: a copy of the round-217 task. Nothing was deleted.
- `current-task.md`: round 218. After the final advisor review:
  - MP3-CANCEL counts only `blob:` workers (the LAME worker), and the WAV worker is terminated per export (`export-wav.client.ts` l.46).
  - DIALOG-COPY measures the old text by swapping `textContent` in the live dialog, with no stash.
  - The MP3 header rows exclude the leading Xing/Info frame.
  - A's dev smoke may repeat once after a Vite re-optimisation reload.
  - ME8 defines its spies on the instance.
- `root-deps-request.json`.
- Frozen-tree and grant files:
  - `b-round-217-r218-tree-sha256.txt` (1,059 files; `sha256sum -c` rc 0);
  - `-grants.txt` (4);
  - `-new-files.txt` (1);
  - `-granted-start-sha256.txt`;
  - `b-round-217/r218-granted-start/`;
  - `b-round-217/git-status-at-planning.txt` (empty: the tree is clean).
- `backlog.json`:
  - D-29z220…D-29z222;
  - the PERF stage statuses and `split_d29z221`;
  - `consults_round_218`;
  - open findings and `deferred_low_polish`.
  - A backup is in `b-round-217/backlog-before.json`.
- `feature-status.md`: the round 217 → მზადაა line, the round 218 line, and the STUDIO-PERFORMANCE row.
- `b-next.json`.

App source was not touched. B's scratch files are only under `/tmp/b218-*`: the npm tarballs, read as data.

## 6. Architecture checkpoint
- No new request this planning. The frontend-architect checkpoint (D-29z195) is still pending with root and is non-blocking.
- 16a touches a single owner module and does not add structural risk to ArrangementContext. The context stays frozen.
- PERF-16 will be the next feature boundary once 16b closes. At that point B re-raises the pending checkpoint, bounded to the export pipeline (the WAV worker, the MP3 encoder and the legacy StudioContext export).

## 7. Status
CONTINUE. Most of the scoped work is still open: STUDIO-PERFORMANCE, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and the deferred Lows. Nothing needs outside input to proceed: the deps install is a root job step that is already authorized.
