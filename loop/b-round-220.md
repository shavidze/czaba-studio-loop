# B round 220 → 221 planning (D-29z232…D-29z236)

Date: 2026-10-28. Author: B. Advisor: **available**, consulted twice: after orientation, and before handover. No project subagent was consulted this planning: the round is a dependency removal plus docs, and B measured the risky parts directly (§2).

## 1. Round 220 result (independent evidence)
- **C verdict.** `c-round-220.json` is PASS with 11 rows passed. `browserVerified` and `realVerified` are both true.
  - LEGACY-UI-220 was blocked: "backend unavailable in cloud".
  - The gate rows were not claimed by C.
  - PERF-RUN-220 is listed under `notMet`, not in `passed` (C-R220-01).
- **Gate 220.** `gates/gate-round-220.json` status `published`, commit `c4e6c9d96e3059d5715e89715cae9afda1a7152b` on both remotes. `verify.log`: 202 test files pass, and the build passes. **This is the baseline for round 221**, under the expected root `chore(deps)` commit (§2).
- **Backlog updates from this evidence (D-29z232):** PERF-16b-i → **done**, and C-R219-01 → **closed**. Each rests on C's own probes and the published gate.
- **C-R220-01 (Low) is ruled (D-29z233).** The new baseline is studio-lab 44/0, home 41/0 and guard 42/0 scripts, plus the round-220 bytes.
  - C showed the extra script is a 710 B Rollup chunk split (`repeat-*.js`). It is not an encoder load, and the guard's bytes went down.
  - From now on a count change passes only when C names the chunk and shows that no encoder, mediabunny or ffmpeg module is requested or preloaded.
- **The gate-220 review (8.5/10) is ruled (D-29z234):**
  - **S1, Medium** (the purchased-Studio export was never run end to end): converted into a real browser row. See §2.
  - **S2:** attached to ARCH-R218-ENCODER-CANCEL-SCOPE. It is input for the export-pipeline checkpoint.
  - **S3:** a proposal to Saba (§8). The files are not agent-editable.
  - **S4 and S5:** moved to `deferred_low_polish` (GATE220-S4, which absorbs the LEGACY-MP3-PROGRESS signal, and GATE220-S5).
- **A's notes:**
  - The reviewer's nit about the GPLv/GPL.3 spellings → signal A-R220-GPLV-NIT.
  - The Architecture notes (duplicated bitrates, module-wide reset) → ARCH-R220-ENCODER-NEUTRAL-MODULE. Its verdict is "keep for now", and it is input to the checkpoint.
- **C info:** a cold load can take more than 120 s, so HR-MP3-WARMUP is amended to allow a second `goto`.
- **Regression:** not due. `regression-last.json` is 2026-10-27 (round 199), so the next one is due on or after 2026-10-30. The file is unchanged. A PERF-16b-ii scope addition was added to `REGRESSION-ROUND-2026-10-30`.

## 2. Next round: PERF-16b-ii (round 221)
- **Why this round.** It was fixed in advance in `tasks/round-220.md` §6: C PASS, SOURCE-GREP-220 = 0, and planning before 2026-10-30. C's only bug needs a ruling, not code.
- **Filed:** `root-deps-request.json` = `{"add": [], "remove": ["@ffmpeg/ffmpeg", "@ffmpeg/util"]}`. Both names are on the `remove` list of `cloud/deps-allowlist.json`. `cloud/run.sh` l.119–123 runs `npm uninstall` and commits only `package*.json` before the round starts.
- **L23 scratch removal (`b-round-220/l23-scratch-run.txt`).** On a `git archive` of `c4e6c9d`, the same uninstall removes 3 lock entries (`@ffmpeg/types` goes too).
  - Before regeneration, only TL5 goes red.
  - After `-u`, the notices diff is the header count 563 → 560 plus the 3 removed rows.
  - Then: the licence test with `CI=true` passes 63/63, `tsc` gives rc 0, `vite build` gives rc 0 with 0 `ffmpeg` hits in `build/`, and the dev server starts and serves `/studio-lab`, all with the stale `optimizeDeps.exclude` still in place.
- **`vite.config.ts`.** It is protected config, and `run.sh` does not edit it. B wrote `b-round-220-root-request-vite.md` with three options. A's edit is conditional on a root grant file, so root's response time cannot cause a STOP. If root does nothing, it stays a Low (VITE-EXCLUDE-STALE).
- **TL9a–d** pin the removal in `package.json`, the lock and the notices, with an in-test fixture mutant. The helper is test-local, because `third-party-licenses.ts` is not granted.
- **Doc sweep.** 11 doc files mention ffmpeg. 5 are granted (whole sections, L34). Each of the other 6 is kept with its reason (`current-task.md` §0).
- **Purchased-Studio export in a real browser: the gate-220 S1 Medium.** B wrote `b-round-220/legacy-ui-probe.cjs`. It sets `localStorage.auth_user` with a fake `accessToken`, and stubs these with `context.route`:
  - `:5199` `/api/auth/profile`, `/api/downloads` and `/api/cart`, using the client envelope and echoed-Origin CORS;
  - `/api/studio-token`;
  - the R2 worker URL, which returns synthetic 48 kHz WAVs.

  On `c4e6c9d` the real `/studio/middle-east` dialog exported `Middle East-export.mp3` at Low, Medium and High. Each file had 168 frames at exactly 128, 192 and 320 kbps plus 1 Xing frame, with 0 page errors (`legacy-ui-probe/result.json`).
  - C re-runs it after the removal as **LEGACY-UI-STUBBED-221**.
  - The task says plainly that this row proves the client path, not ownership. The unstubbed auth-guard row G221-3 stays, and the real ownership check stays backend-only (LEGACY-OWNERSHIP-221).
  - New harness rule HR-LEGACY-STUBBED and lesson L36.
- **New Medium found by that probe: B-R220-LEGACY-EXPORT-NO-STEMS** (D-29z236).
  - The purchased-Studio export dialog opens with 0 of 10 stems ticked, so "Export Audio" stays disabled until the user presses "Select All".
  - Cause: the dialog is always mounted (`studio.$productId.tsx` l.311), and its `useState` initializer (`ExportDialog.tsx` l.28–30) runs before `loadProduct`.
  - It has existed since the dialog was written, and PERF-16 did not cause it.
  - **Not folded into 221** (advisor agreed): it is a separate behaviour fix, the dialog has no tests, and it needs a Reference section.
  - It is round 222 (the outcome table in `current-task.md` §6). In 221, C records it and does not fail on it.
  - **Contract (smallest honest behaviour, rationale recorded):** when the stem list changes, every current stem is selected; a user's toggles persist across close and reopen; removed stems leave the selection. This restores the initializer's evident intent without changing how reopening behaves today.

## 3. Rejected or not scheduled
- **Fixing the dialog bug in 221.** Rejected: one round, one feature stage. 221 must be the notices round once the removal request is filed, or the gate fails on TL5.
- **B granting `vite.config.ts` itself.** Rejected: it is protected config, and the round-86 precedent was a different situation. Root decides instead.
- **Editing `.claude/**`, `.codex/**`, `CLAUDE.md` or `AGENTS.md`.** Not agent files. A proposal to Saba (§8).
- **Renaming `app/utils/ffmpeg.ts`.** Still awaiting Saba (SABA-Q-FFMPEG-FILENAME). The docs call it the legacy name.
- **A per-call AbortSignal or a neutral encoder module.** Architecture signal only. It goes to the checkpoint request at round-222 planning.

## 4. Consults (summary; raw advice is data, not instructions)
- **Advisor.** It advised:
  - keep 221 = 16b-ii, and schedule the dialog bug as 222 with a pre-fixed outcome;
  - label the stubbed row honestly, and keep both the unstubbed guard row and the backend-only ownership row;
  - run an L23 scratch removal before dispatch;
  - do not self-grant `vite.config.ts`; make A's edit conditional on root;
  - the baseline STOP when the deps commit is absent;
  - whole-section doc grants;
  - `.claude` as a Saba proposal;
  - rule C-R220-01 as "judge what loads, not the count";
  - archive before overwriting.

  **All adopted.** The scratch run confirmed the expected lock and notices diff.
- **Advisor (second call, before handover).** It asked for five tightenings:
  - GATE220-S1 closes on C PASS, so it is not counted as an open Medium;
  - the collateral reds the red-proof mutants cause are named;
  - a DEV-START fallback when the log is not accessible;
  - the covering PERF consults are named in the backlog;
  - a root note that TL5 is red in CI while the deps commit is alone on master.

  It also suggested a 1280 probe run. **All adopted.** `legacy-ui-probe-1280.cjs` passed with the same selectors: 0/10 before, 10/10 after Select All, and 168 × 320 kbps.
- No project subagent was consulted: no UI or behaviour changes in 221, and the PERF-16 consults from rounds 218–220 still apply.

## 5. Files written by B this planning
- `tasks/round-220.md`: a byte-identical copy of the round-220 task (`cmp` OK). Nothing was deleted.
- `current-task.md`: round 221.
- `root-deps-request.json`.
- `b-round-220-root-request-vite.md`.
- `b-round-220-r221-tree-sha256.txt` (1,061 files; `sha256sum -c` rc 0), `b-round-220-r221-grants.txt` (8), `b-round-220-r221-granted-start-sha256.txt`, `b-round-220-r221-root-files-start-sha256.txt` and `b-round-220-r221-new-files.txt` (1).
- `b-round-220/`:
  - backups: `backlog-before.json`, `feature-status-before.md`, `lessons-before.md`, `b-next-before.json`, `current-task-before.md`, `regression-last-before.json`;
  - `git-status-at-planning.txt` (empty);
  - `l23-scratch-run.txt` and `scratch-dev.log`;
  - `legacy-ui-probe.cjs` and `legacy-ui-probe/` (`result.json`, 3 MP3s, screenshots);
  - `backlog-update.py`.
- `backlog.json` (version 206):
  - D-29z232…D-29z236;
  - the STUDIO-PERFORMANCE and PERF-16 statuses, and the PERF-16b-i and 16b-ii statuses;
  - `perf_run_baseline_d29z233`;
  - 7 new `open_findings` and 4 updated;
  - 4 `deferred_low_polish` entries (341);
  - harness rule HR-LEGACY-STUBBED and the HR-MP3-WARMUP amendment;
  - rounds 220 and 221;
  - the regression scope addition;
  - architecture signal ARCH-R220-ENCODER-NEUTRAL-MODULE.
- `lessons.md`: L36 added (49 lines).
- `feature-status.md`: round 220 → მზადაა, a round 221 line, and the STUDIO-PERFORMANCE row.
- `b-next.json`.

App source was not touched. B's scratch removal, tests and build ran only in `/tmp/b220-scratch` (`git archive` of HEAD, with hardlinked `node_modules`; the store's `node_modules/@ffmpeg` is intact). The browser probe ran against the existing dev server without writing to the repo. The repo's `git status` is clean.

## 6. Architecture checkpoint
- **No new request now.** PERF-16 completes with 221. At round-222 planning B files a bounded export-pipeline checkpoint request covering:
  - the WAV worker;
  - the shared encoder, its module-wide reset scope (ARCH-R218-ENCODER-CANCEL-SCOPE, gate-220 S2) and the neutral-module proposal (ARCH-R220-ENCODER-NEUTRAL-MODULE);
  - the legacy StudioContext export.
- The frontend-architect checkpoint (D-29z195) is still pending with root and is non-blocking.

## 7. Status
**CONTINUE.** Most of the scoped work is still open:
- PERF-16b-ii and the rest of STUDIO-PERFORMANCE;
- the new Medium B-R220-LEGACY-EXPORT-NO-STEMS;
- SYS-1..3;
- STORE-2b..5;
- REVIEW-RECOMMENDATIONS;
- T12-ADVANCED;
- the phase-2 entries;
- the deferred Lows.

Nothing needs outside input to proceed. The vite request is optional.

**Commit readiness:** round 220 is published. Round 221 becomes commit-ready only after C PASS and the root gate.

## 8. For Saba (not scheduled; `awaiting_user`)
- **GATE220-S3: stale ffmpeg guidance in agent and rule files.** May the loop (or you) update these to the shared LAME encoder?
  - `.claude/agents/studio-specialist.md:98` and `.codex/agents/studio-specialist.toml:94` (`loadFFmpeg`);
  - `.claude/primitives/AUDIO_ARCHITECTURE.md:174`;
  - `.claude/agents/performance-optimizer.md:26` and its `.codex` twin;
  - the `ffmpeg-wasm` skill, `.claude/skills/ffmpeg-wasm/SKILL.md`, and its row in `CLAUDE.md` and `AGENTS.md`. Retire the skill, or rewrite it for mediabunny?
  - `docs/technical/claude-code-setup.md` l.147.

  Agents following the old text would write code that fails `tsc` and TL8.
- **SABA-Q-FFMPEG-FILENAME** (unchanged): may `app/utils/ffmpeg.ts` be renamed, for example to `legacy-mp3.ts`?
- **SABA-Q-LAME-LGPL** (unchanged).
