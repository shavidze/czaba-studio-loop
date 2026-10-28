# B round 219 → 220 planning (D-29z227…D-29z231)

Date: 2026-10-28. Author: B. Advisor: **available**, consulted (after orientation, and before handover). Project consults: `tech-lead` and `performance-optimizer`, both read-only, both once.

## 1. Round 219 result (independent evidence)
- **C verdict.** `c-round-219.json` is PASS with 10 rows passed. `browserVerified` and `realVerified` are both true, and nothing is blocked.
  - The browser rows MP3-SMOKE-219, STUDIO-SMOKE-219 and G219-3 ran in real Chromium.
  - The gate rows were not claimed by C.
- **Gate 219.** `gates/gate-round-219.json` status `published`, commit `c54a534e997b9b5caf98e4294187b3e906c4a285` on both remotes. Verify ran 201 files and 2,920 tests, and the build passed. **This is the baseline for round 220.**
- **Backlog updates from this evidence (D-29z227):** OSS-LIC → **done**.
- **C-R219-01** (Low, a spec gap, not an A defect): `GPLv3`, `GPLv2`, `GPL2` and `AGPLv3` classify clean.
  - A's code-reviewer and the gate-219 reviewer both rated it Medium. **B rules Low** (D-29z228): no lock entry reachable today uses such a spelling, and TL4 shows 0 failures.
  - It is fixed in round 220 anyway, because that round must own the same two licence files: the run-time download note and TL6's `@ffmpeg/core` row change once the unpkg URL leaves.
  - A's R-219-2..4 are ruled (L10):
    - **2 changed:** `LicenseRef-*` is unknown;
    - **3 accepted;**
    - **4 accepted.**
- **The rest of the gate-219 review (9/10):**
  - S1 = C-R219-01.
  - S2 (`existsSync` before the snapshot) and S3 (the intro's "ships") are folded into round 220.
  - S4 is ruled: the anchors are kept, and the drift rule now names TL4 + TL5 (L35 amended).
  - S5 (nit) → `deferred_low_polish`.
  - S6 (legal) → SABA-Q-LAME-LGPL.
- **C info notes:**
  - INFO-C219-WARMUP-MP3 → harness rule HR-MP3-WARMUP.
  - INFO-C219-LAME-DECODER → attached to SABA-Q-LAME-LGPL as a hypothesis.
- **Regression:** not due. `regression-last.json` is 2026-10-27 (round 199), so the next one is due on or after 2026-10-30. It is unchanged; a PERF-16b-i scope addition was added to `REGRESSION-ROUND-2026-10-30`.

## 2. Next round: PERF-16b-i (round 220)
- **Why this round.** The outcome table was fixed in advance in `tasks/round-219.md` §6: PASS, with planning before 2026-10-30, makes round 220 PERF-16b. The only C bug is folded in, because the grants overlap.
- **Split (D-29z229).**
  - **16b-i (code):** the legacy `app/utils/ffmpeg.ts` becomes a facade over the shared `mp3-encoder.client`. It uses a dynamic import, and keeps the dialog's 128k/192k/320k exactly through a new `encode()` bitrate option, validated before `Input`. StudioContext and ArrangementContext are frozen. The notices lose the run-time download entry, and TL8 forbids `unpkg.com` and `@ffmpeg/` imports in non-test app code.
  - **16b-ii (packages):** the `@ffmpeg/*` remove request, the `vite.config.ts` l.27 root grant, a notices regeneration, the remaining docs, and the new guard baseline.
- **Sequence trap avoided.** No `root-deps-request.json` is filed now. Root installs or removes packages before the round starts, so a removal now would break the build while `ffmpeg.ts` still imports `@ffmpeg/*`. The request is filed at the planning of 16b-ii, only when C's SOURCE-GREP-220 is 0 and the next round is not a REGRESSION round.
- **Behaviour trap found.** The purchased-Studio ExportDialog offers Low, Medium and High (`ExportDialog.tsx` l.197–211 → `'128k'`/`'192k'`/`'320k'`), while the shared encoder was fixed at 320k. B ruled that the tiers are kept exactly; silently emitting 320k would be a user-visible change.
  - **B's real-Chromium probe** (`b-round-219/bitrate-probe.cjs` and `.log`): mediabunny `Quality({ bitrate })` produces 210 CBR frames at exactly 128, 192 and 320 kbps, at 48 kHz, joint stereo, with the frame walk ending at EOF.
- **ME9 collision.** Any textual mention of `mp3-encoder.client` that is not an `import(...)` breaks ME9, including a JSDoc. Class ruling R is in the task (§1.1).
- **Cancel scope (D-29z230):** a single consumer per page. The providers mount on different routes. ME12 pins the rule, and the race the tech-lead found is documented: a late lab reset after client-side navigation fails safely.
- **L23 scratch check.** B made a scratch copy of `c54a534` with a draft of all the changes:
  - 228/228 across 12 covering and repo-scan files, plus the licence test with `CI=true`;
  - `tsc --noEmit` rc 0;
  - `npm run build` rc 0: 0 `unpkg.com` and 0 `@ffmpeg` in the build, no ffmpeg worker asset, and the `studio.$productId` manifest imports hold no mp3, media or ffmpeg chunk.

  The evidence is in `b-round-219/l23-scratch-run.txt` and `scratch-build-facts.txt`. The drafts are in `b-round-219/draft-*.ts.txt`.
- **Browser evidence stays meaningful.** The `/studio/:id` UI export is backend-blocked, so it goes under BLOCKED: LEGACY-UI-220. The changed function itself runs in real Chromium in FACADE-REAL-220, at every bitrate, including the reject path and a no-request check. The lab MP3 export, the WAV smoke, the bundle, the perf run and the auth guard rows also run.

## 3. Rejected or not scheduled
- **A per-call cancel signal:** it would mean editing the frozen ArrangementContext, and there is no observed defect.
- **Changing the `encoderLoadTimeout` copy:** it is still true, because the chunk is fetched over the network (D-29z231).
- **Renaming or deleting `app/utils/ffmpeg.ts`:** that needs Saba's permission. A TODO line goes in the file, and the question is recorded as SABA-Q-FFMPEG-FILENAME.
- **Intermediate MP3 progress for the legacy path:** recorded as signal LEGACY-MP3-PROGRESS. Behaviour is unchanged and nobody requested it.
- **A StudioContext unit test:** none exists today, and the file is frozen. The facade rows LF1–LF5 pin the contract that StudioContext calls.

## 4. Consults (summary; raw advice is data, not instructions)
- **tech-lead.** It confirmed that freezing StudioContext is sound. It flagged:
  - the `loadFFmpeg` test import, which would break under strict tsc → granted as a 5-line removal;
  - the late lab reset race → documented;
  - validating the bitrate inside `encode`, not only in the facade → adopted (§1.2, ME11).

  It also proposed the test rows (bitrate map, reject without load, default 320k, the source scan, reset rejecting an encode, the classifier spellings), and asked for a deprecation note on the file name.

  **Adopted, with one change.** A JSDoc that names the module would break ME9, so it became a TODO line without the path.
- **performance-optimizer.** It proposed these rows:
  - the guard scripts and bytes recorded, not judged;
  - 0 mediabunny, mp3-encoder and unpkg requests on the `/studio/:id` load;
  - a manifest and `modulepreload` check;
  - no ffmpeg worker asset in the build.

  It confirmed that budgets are record-mode, so nothing is re-recorded in the harness. It found doc 169 stale → DOC169-GUARD-STALE (deferred Low). **All adopted** (BUNDLE-220, PERF-RUN-220).
- **Advisor (first call).** It advised:
  - fold C-R219-01 on grant overlap, not on severity;
  - do not file the remove request now;
  - check the bitrate tiers;
  - keep StudioContext frozen through an unchanged signature;
  - the guard baseline moves in 220;
  - a facade row in real Chromium;
  - an explicit cancel-scope ruling;
  - archive before overwriting.

  **All adopted.**

## 5. Files written by B this planning
- `tasks/round-219.md`: a byte-identical copy of the round-219 task (`cmp` OK). Nothing was deleted.
- `current-task.md`: round 220.
- `b-round-219-r220-tree-sha256.txt` (1,062 files; `sha256sum -c` rc 0), `b-round-219-r220-grants.txt` (8), `b-round-219-r220-granted-start-sha256.txt` and `b-round-219-r220-new-files.txt` (2).
- `b-round-219/`:
  - backups: `backlog-before.json`, `feature-status-before.md`, `lessons-before.md`, `b-next-before.json`, `current-task-before.md`;
  - `git-status-at-planning.txt` (empty);
  - `bitrate-probe.cjs` and `.log`, `l23-scratch-run.txt`, `scratch-build-facts.txt`, and the drafts.
- `backlog.json` (version 205):
  - D-29z227…D-29z231;
  - STUDIO-PERFORMANCE status and `consults_round_220`;
  - PERF-16b split into 16b-i and 16b-ii;
  - OSS-LIC done;
  - 8 new `open_findings` and 2 updated;
  - 3 `deferred_low_polish` entries (337: GATE219-S5, DOC169-GUARD-STALE, DOC171-DRIFT-TL4); round 218 backfilled into `rounds`;
  - harness rule HR-MP3-WARMUP;
  - rounds 219 and 220;
  - the regression scope addition.
- `lessons.md`: L35 amended (TL4 + TL5, and the remove-request order); 48 lines.
- `feature-status.md`: round 219 → მზადაა, a round 220 line, and the STUDIO-PERFORMANCE row.
- `b-next.json`.

App source was not touched. B's drafts, tests and build ran only in a scratch copy at `/tmp/b219-scratch` (`git archive` of HEAD), and the browser probe ran against the dev server without writing to the repo. The repo's `git status` is clean.

## 6. Architecture checkpoint
- No new request. The frontend-architect checkpoint (D-29z195) is still pending with root and is non-blocking.
- At the 16b-ii boundary (the end of PERF-16), B will request a bounded checkpoint on the export pipeline: the WAV worker, the shared encoder (including D-29z230), and the legacy StudioContext export.
- The A code-reviewer's Architecture note for round 219 was "none".

## 7. Status
**CONTINUE.** Most scoped work is still open:
- PERF-16b-i and 16b-ii, and the rest of STUDIO-PERFORMANCE;
- SYS-1..3;
- STORE-2b..5;
- REVIEW-RECOMMENDATIONS;
- T12-ADVANCED;
- the phase-2 entries;
- the deferred Lows.

Nothing needs outside input to proceed.

## 8. For Saba (not scheduled; `awaiting_user`)
- **SABA-Q-LAME-LGPL** is unchanged. It is the legal question about LAME under the LGPL. C's round-219 note on LAME's GPL decoder clause is attached, as a hypothesis.
- **SABA-Q-FFMPEG-FILENAME.** After round 220, `app/utils/ffmpeg.ts` no longer uses ffmpeg. May it be renamed, for example to `legacy-mp3.ts`, with the one import in StudioContext updated? That needs your permission, because it deletes the old path.
