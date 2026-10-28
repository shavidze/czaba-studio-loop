# CURRENT TASK — Round 221: PERF-16b-ii — `@ffmpeg/ffmpeg` and `@ffmpeg/util` leave the project (root removes the packages; A regenerates the notices, pins the removal with a test and updates the docs); the purchased-Studio MP3 export is checked in a real browser with stubbed backend responses

Decisions:
- **D-29z232:** round 220 is closed. C PASS (11 rows), `browserVerified` and `realVerified` true, LEGACY-UI-220 backend-blocked. Gate 220 published `c4e6c9d`. **PERF-16b-i is done.**
- **D-29z233:** C-R220-01 (Low) is ruled. The new script baseline is studio-lab 44/0, home 41/0 and guard 42/0, plus the bytes in `c-round-220/perf-run-1.json`. The cause is a Rollup chunk split (`repeat-*.js`, 710 B), not an eager load. From now on a script-count change is judged by what loads, not by the count (§3 PERF-RUN-221).
- **D-29z234:** the gate-220 review is ruled.
  - **S1 (Medium, purchased-Studio export never run end to end):** converted into the browser row LEGACY-UI-STUBBED-221. B's probe already ran it on `c4e6c9d` (§0).
  - S2: architecture signal for the export-pipeline checkpoint.
  - S3: root/Saba proposal (`.claude/**`, `.codex/**` are not agent files).
  - S4 and S5: moved to `deferred_low_polish`.
- **D-29z235:** this round is PERF-16b-ii. B filed `root-deps-request.json` = `{"add": [], "remove": ["@ffmpeg/ffmpeg", "@ffmpeg/util"]}` and the root request `b-round-220-root-request-vite.md` (non-blocking).
- **D-29z236:** B found a pre-existing Medium in the purchased Studio: **B-R220-LEGACY-EXPORT-NO-STEMS**. The export dialog opens with 0 of 10 stems ticked, so "Export Audio" is disabled until the user presses "Select All". It is **not** fixed in this round; it is round 222 (§6). In this round C records it and does not fail on it.

Planned by B on 2026-10-28. Dispatcher: B. Implementer: A. Verifier: C. The advisor was consulted before dispatch (`b-round-220.md` §4).

**Read first:**
- `lessons.md`. L10, L11, L12, L23, L26, L28, L32, L33, L34, L35 and the new L36 apply.
- `/home/runner/czaba-project/docs/technical/performance/oss-adoption.md`: the "Dependencies: how they get in" section and the PERF-16 row.
- Project primitives:
  - `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
  - `.claude/prompts/new-test.md`.
- `tasks/round-220.md` §1.4, §1.5 and §1.9 (the notices and drift rules).

## Baseline
- **Expected HEAD:** root's `chore(deps): remove @ffmpeg/ffmpeg @ffmpeg/util (root, OSS plan approved by Saba)` commit, directly on `c4e6c9d96e3059d5715e89715cae9afda1a7152b` (gate 220).
  - Per the oss-adoption baseline rule, that commit counts as the baseline when it changes only `package.json` and `package-lock.json`.
  - It may also delete `vite.config.ts` l.26–28 (the `optimizeDeps` block), if root chose option 2 of `b-round-220-root-request-vite.md`. Nothing else.
  - `root-deps-done.json` gets a new entry for it.
- **STOP (L11, short round L22)** in either case:
  - HEAD is still `c4e6c9d`, so the removal commit is absent. A does no partial docs-only round.
  - The deps commit changes anything else.
- **Expected deps commit content** (B's scratch run of the same `npm uninstall`, `b-round-220/l23-scratch-run.txt`):
  - `package.json` loses 2 lines (`@ffmpeg/ffmpeg`, `@ffmpeg/util`).
  - `package-lock.json` loses the 2 root `dependencies` lines and the 3 entries `node_modules/@ffmpeg/ffmpeg`, `node_modules/@ffmpeg/types` and `node_modules/@ffmpeg/util`. Nothing else.
- **Working tree at planning:** clean (`b-round-220/git-status-at-planning.txt` is empty).
- **Frozen:** every tracked file except the 8 grants, `package.json`, `package-lock.json` and `vite.config.ts`. That is 1,061 files in `b-round-220-r221-tree-sha256.txt`. From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-220-r221-tree-sha256.txt`. B checked it: rc 0.
  - `package.json` and `package-lock.json` are root's. A never edits them.
  - `vite.config.ts`: see grant 9.
- **Grants (8 existing files):** listed in `b-round-220-r221-grants.txt`, with start hashes in `b-round-220-r221-granted-start-sha256.txt`.
  1. `THIRD_PARTY_NOTICES.md`: regenerated only, never edited by hand.
  2. `app/lib/__tests__/third-party-licenses.test.ts`: new rows TL9 only (§1.2). Existing rows stay as they are.
  3. `docs/technical/studio.md`: these whole sections (L34):
     - `### Tech Stack`;
     - `### Core Components` (the file tree);
     - `### Architecture` under `## Export System`;
     - `### FFmpeg.wasm Integration`, which gets a new heading;
     - `### 3. Why FFmpeg.wasm?`, which gets a new heading;
     - `## File Structure`;
     - `### Export` under `## Testing Checklist`;
     - `## Dependencies`;
     - the `**Last Updated**` line.
  4. `docs/technical/debug-studio.md`: `### 5. Export fails` and `## Testing Checklist`.
  5. `docs/design/components/audio-player.md`: `## ExportDialog`, including `### Export Flow` (l.171–192).
  6. `docs/learning/README.md`: `## Tech Stack`.
  7. `docs/learning/architecture/02-audio-studio-system.md`: these whole sections:
     - `## ტერმინოლოგია`;
     - `### User Journey: Preview-დან Studio-მდე`;
     - `### Export Pipeline`;
     - `## Trade-offs`;
     - `## Key Takeaways`.
  8. `docs/implementation/2026/quarter-IV/172-perf-16b-i-legacy-mp3-shared-encoder.md`: **l.4 only**. It becomes exactly `**სტატუსი:** Completed (C round 221 PASS)`, because stage 2 of 2 closes PERF-16b (L28).
  9. **`vite.config.ts` (conditional).**
     - If `root-grant-r221-vite.json` exists in the loop folder with `"granted": true` when A starts, A deletes l.26–28 (the `optimizeDeps` block) and nothing else.
     - If root already deleted it in the deps commit, A leaves the file as it is.
     - Otherwise A leaves the file byte-identical (start sha in `b-round-220-r221-root-files-start-sha256.txt`) and writes "VITE-EXCLUDE-STALE: no root grant" in its report. **That is not a STOP.**
- **New file (1):** `docs/implementation/2026/quarter-IV/173-perf-16b-ii-remove-ffmpeg-packages.md` (172 is the last; B checked that 173 is free).
- **Protected as always:**
  - the auth and purchase files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`;
  - `app/contexts/StudioContext.tsx` and `app/contexts/ArrangementContext.tsx` (frozen);
  - `app/components/studio/ExportDialog.tsx` (frozen; its bug is round 222);
  - `app/utils/ffmpeg.ts`, which keeps its name and path (SABA-Q-FFMPEG-FILENAME);
  - `.claude/**`, `.codex/**`, `CLAUDE.md`, `AGENTS.md`, `package*.json`, `vitest.config.ts`, `biome.json` and every other config file;
  - `perf/**` and `e2e/**`.
- **Not allowed:**
  - installing, updating or removing packages;
  - deleting or renaming files;
  - editing any doc line outside the granted sections. The historical docs under `docs/implementation/`, `docs/plans/` and `docs/bugs/` stay as written.

## 0. Why this round
- **The outcome table was fixed in advance** (`tasks/round-220.md` §6): "PASS, SOURCE-GREP-220 0 hits, and planning before 2026-10-30 → Round 221 = PERF-16b-ii". C passed round 220, SOURCE-GREP-220 gave 0 hits, and B is planning on 2026-10-28. Regression is due on or after 2026-10-30.
- **C bugs first.** The only C finding, C-R220-01 (Low), needs a ruling, not code (D-29z233).
- **The spec** (`oss-adoption.md`): "Remove `@ffmpeg/*` and the unpkg URL." The unpkg URL left in round 220, and the packages leave now. `@ffmpeg/core` is GPL-2.0+; it was only ever downloaded at run time, never installed.
- **Facts B measured (2026-10-28, `b-round-220/`):**
  - **Scratch removal (L23).** On a `git archive` of `c4e6c9d` with hardlinked `node_modules`, `npm uninstall --no-audit --no-fund @ffmpeg/ffmpeg @ffmpeg/util` gave rc 0 and "removed 3 packages" (`@ffmpeg/types` goes too). The covering files then ran with `CI=true`: only TL5 was red.
  - After `-u`, the notices diff is exactly:
    - the header `## Runtime packages (563)` → `(560)`;
    - the 3 removed `@ffmpeg/*` rows.

    The licence test with `CI=true` then gave 63/63. `tsc --noEmit` rc 0. `vite build` rc 0 with 0 `ffmpeg` hits in `build/`. The dev server served `/studio-lab` and `/app/utils/ffmpeg.ts` with 200, with the stale `optimizeDeps.exclude` still in place and no error line (`l23-scratch-run.txt`, `scratch-dev.log`). So the `vite.config.ts` block is dead but harmless (Low).
  - **Remaining mentions.** `grep -rli ffmpeg docs`, outside `implementation/`, `plans/` and `bugs/`, finds 11 files. Each is ruled:
    - **Granted, because they describe today's CZABA export as FFmpeg.wasm:** `studio.md`, `debug-studio.md`, `audio-player.md`, `learning/README.md`, `learning/architecture/02-audio-studio-system.md`.
    - **Kept:**
      - `technical/overview.md` l.138 and l.441 name the file `utils/ffmpeg.ts` with "MP3 conversion", which is still true.
      - `studio-audio-pipeline.md` l.275 names the path, which is still true.
      - `claude-code-setup.md` l.147 describes the `.claude` studio-specialist agent's knowledge, which still says FFmpeg. That goes in the root/Saba proposal (§1.4).
      - `learning/features/01-social-media-automation.md` l.391 is server-side video ffmpeg, a different tool.
      - `PRE_PRODUCTION_CHECKLIST.md` l.124 is a historical checklist; recorded as a Low.
      - `prompts/industry-kits/music-audio-store.md` is a generic template for other projects.
  - **The purchased-Studio export in a real browser** (`b-round-220/legacy-ui-probe.cjs` and `legacy-ui-probe/result.json`, on `c4e6c9d` with the packages present). The technique is in §3 LEGACY-UI-STUBBED-221.
    - `/studio/middle-east` loaded 10 stubbed stems, and the real ExportDialog exported `Middle East-export.mp3` at Low, Medium and High.
    - Each file had 168 audio frames at exactly 128, 192 and 320 kbps, plus 1 Xing frame, and the walk ended at EOF.
    - 0 page errors.
    - B re-ran High at 1280×720 (`legacy-ui-probe-1280.cjs`, `legacy-ui-probe-1280/result.json`): the same selectors work, 168 frames at 320 kbps plus 1 Xing.
    - **The dialog opened with 0 of 10 stems ticked every time** (B-R220-LEGACY-EXPORT-NO-STEMS). The cause: `ExportDialog` is always mounted (`studio.$productId.tsx` l.311), and its `useState(new Set(state.stems.map(...)))` initializer (`ExportDialog.tsx` l.28–30) runs before `loadProduct` fills the stems.

## 1. Rulings. Required.
### 1.1 Notices (L35)
- **Regenerate:** `npx vitest run app/lib/__tests__/third-party-licenses.test.ts -u`, then a `CI=true` run without `-u` must pass.
- **The diff against `c4e6c9d` must be only:**
  - the header count 563 → 560;
  - the 3 `@ffmpeg/*` table rows removed.

  Any other change means the lock changed more than B's scratch run did. That is a STOP: report the extra diff and do not hand-edit.

### 1.2 TL9: the removal is pinned (new rows in `third-party-licenses.test.ts`)
A test-local helper reads the real `package.json` and `package-lock.json` (the files TL4 and TL6 already read).

| Row | Asserts |
|---|---|
| **TL9a** | `package.json` `dependencies` and `devDependencies` have no key starting with `@ffmpeg/`. |
| **TL9b** | `package-lock.json` `packages` has no key containing `node_modules/@ffmpeg/`, and the root entry `packages[""]` has no `@ffmpeg/` dependency. |
| **TL9c** | The rendered notices (`renderThirdPartyNotices(realLock)`) contain no `@ffmpeg/` row. |
| **TL9d** | **Named mutant inside the test:** the same helper, given the `c4e6c9d` lock **content** as a fixture, flags all 3 `@ffmpeg/*` keys. Do not shell out to git in the test. Inline a minimal fixture object with those 3 keys and one clean key; the helper must return exactly the 3. |

- The helper is test-local. Do not add an export to `third-party-licenses.ts`; that file is not granted.
- Row names start with `TL9`, so C can grep them.

### 1.3 Docs (Georgian with English technical terms; whole granted sections only)
- **What the granted sections must say.** Today's MP3 export, in both the purchased Studio and the lab, uses the shared LAME encoder (`mediabunny` + `@mediabunny/mp3-encoder`). It is loaded on demand from the same origin, in its own lazy chunk.
  - The purchased Studio offers 128, 192 or 320 kbps, from the dialog's Low, Medium and High. The lab writes 320 kbps CBR.
  - `app/utils/ffmpeg.ts` keeps its name for now (Saba question) and is a thin facade that exports only `convertWavToMp3`.
- **Remove:**
  - every `FFmpeg.wasm`, `@ffmpeg/*` and `loadFFmpeg` claim, and the old code sample (`studio.md` "FFmpeg.wasm Integration" and `debug-studio.md` §5);
  - the "3–5MB" and "~31 MB" load claims.
- **Code samples.** Where a section had a code sample, either remove it, or replace it with the real current signature only (`convertWavToMp3(wavBlob: Blob, bitrate?: '128k' | '192k' | '320k'): Promise<Blob>`). Do not invent internals.
- **Headings.** A renamed heading such as "MP3 encoding (LAME via mediabunny)" or "Why LAME via mediabunny?" keeps its level.
- **Allowed mentions.** After the edit, a mention of `ffmpeg` in a granted section is allowed only as the path `app/utils/ffmpeg.ts` (or `utils/ffmpeg.ts`, or the file-tree name `ffmpeg.ts`), together with a note that it is the legacy name.
- **Mermaid** blocks in `02-audio-studio-system.md` (§User Journey l.178 and §Export Pipeline l.258) must still parse: rename the participant or subgraph text, keep the structure, and leave no dangling node.
- **`studio.md` `## Dependencies`** lists only real current runtime dependencies for the Studio export: `wavesurfer.js`, `mediabunny` and `@mediabunny/mp3-encoder`. Take each version from the real `package.json` (`^7.x` style is fine for wavesurfer, as today; the mediabunny pair are exact `1.62.1`).
- **Doc 173.**
  - It has the 7 TEMPLATE `##` headings in order.
  - l.4 is exactly `**სტატუსი:** Completed (C round 221 PASS)` (L28).
  - It covers:
    - root's deps commit (hash, and that root made it, not A);
    - the 3 removed lock entries;
    - the notices diff;
    - TL9;
    - the doc sweep and the kept mentions with their reasons;
    - the `vite.config.ts` outcome (granted, done by root, or VITE-EXCLUDE-STALE);
    - C-R220-01's new baseline;
    - LEGACY-UI-STUBBED-221 as evidence, and what it does **not** prove (ownership);
    - TODOs: SABA-Q-FFMPEG-FILENAME, the `.claude/**` and `.codex/**` proposal, B-R220-LEGACY-EXPORT-NO-STEMS (round 222), and the export-pipeline checkpoint.
  - Every test it cites exists (L26).

### 1.4 Not A's: recorded for root and Saba
These are stale ffmpeg instructions inside agent and rule files. Agents may not edit them; `b-round-220.md` §8 asks Saba.
- `.claude/agents/studio-specialist.md:98` (`loadFFmpeg`);
- `.codex/agents/studio-specialist.toml:94`;
- `.claude/primitives/AUDIO_ARCHITECTURE.md:174`;
- `.claude/agents/performance-optimizer.md:26` and its `.codex` twin;
- `.claude/skills/ffmpeg-wasm/SKILL.md`;
- the `ffmpeg-wasm` skill row in `CLAUDE.md` and `AGENTS.md`.

### 1.5 Red-proof (A runs each one; each is a temporary edit or a temp copy, followed by a sha256 restore check)
| Mutant | Must go red |
|---|---|
| (a) TL9's helper is pointed at a temp copy of the `c4e6c9d` lock (`git show c4e6c9d:package-lock.json > /tmp/...`), through a temporary local edit of the path constant | TL9b, naming the 3 keys |
| (b) A temp copy of `c4e6c9d`'s `package.json`, the same way | TL9a |
| (c) `THIRD_PARTY_NOTICES.md` restored to the `c4e6c9d` version (then restored back) | TL5 |
| (d) TL9d's helper body made to return `[]` | TL9d |

**Expected collateral reds, not findings:**
- (a) and (b) also turn TL5, TL6 and TL4-anchors red where those rows read the same constant (as with C's round-220 probe locks).
- (c) turns only TL5 red.

The logs name the intended row; other reds are listed as collateral.

## 2. A: the files you own. Everything else is frozen.
1. `THIRD_PARTY_NOTICES.md`: §1.1.
2. `app/lib/__tests__/third-party-licenses.test.ts`: TL9a–d (§1.2).
3. The 5 granted docs: §1.3.
4. Doc 172, l.4 only; doc 173 (new).
5. `vite.config.ts`, only under grant 9's condition.

**Checks A runs (speed rules):**
- `npm run typecheck`;
- `npm run lint`;
- `npx vitest run` on these files, with per-test times (L31/L32):
  - `app/lib/__tests__/third-party-licenses.test.ts`;
  - `app/utils/__tests__/ffmpeg.test.ts`;
  - `app/lib/arrangement/__tests__/mp3-encoder.test.ts`;
  - `app/lib/arrangement/__tests__/export-progress-ui.test.tsx`;
  - `app/lib/arrangement/__tests__/export-mp3.test.tsx`;
- the licence test again with `CI=true`;
- the mutants in §1.5;
- `sha256sum -c` of the frozen list, which must give rc 0;
- `grep -n -i "ffmpeg" <each granted doc>`: every remaining hit is a path mention allowed by §1.3; list them in the report;
- `git status --short --untracked-files=all`, which must show at most the 8 grants as `M`, plus `vite.config.ts` only under grant 9, and the 1 new file as `??`.

A does not run the full suite, `npm run verify` or `npm run build`. With 9 or more files, A asks the `code-reviewer` and reports its Architecture note for B.

**STOP rules (L11, L32, L33):**
- the baseline conditions above;
- a frozen file has to change;
- the notices diff is more than §1.1;
- ME9, LF1–LF5 or any covering file goes red;
- TL4 reports a new copyleft or unknown runtime entry.

## 3. C: rows
**Setup.**
- Use Playwright Chromium, with the dev server at `http://127.0.0.1:5173`. Do not run the full vitest suite or `npm run verify`.
- **Warm-up (HR-MP3-WARMUP, amended):** one `goto('/studio-lab')` plus one throwaway lab MP3 export before any measured MP3 row. If the first cold load exceeds 120 s, a second `goto` is allowed and is not a finding (C-R220 info).
- **The dev server must have started after the deps commit.** In the cloud, each job starts it fresh, so record the server start time against the HEAD commit time. If a running server predates the removal, restart it (record the restart). Otherwise Vite's dep cache can hide a missing package.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-221** (start + end) | <ul><li>`git log -2`;</li><li>`git show --stat HEAD`;</li><li>`git status --short --untracked-files=all`;</li><li>`sha256sum -c` of the 1,061-file list;</li><li>`root-deps-done.json`.</li></ul> | <ul><li>HEAD is root's `chore(deps): remove @ffmpeg/ffmpeg @ffmpeg/util` directly on `c4e6c9d`. It changes only `package.json` and `package-lock.json`, plus, if root chose option 2, only the deletion of `vite.config.ts` l.26–28.</li><li>The working tree has at most the 8 grants as `M` and the 1 new file as `??`.</li><li>`vite.config.ts` is either byte-identical to HEAD, or differs from it only by deleting l.26–28 while `root-grant-r221-vite.json` exists with `granted: true`.</li><li>Frozen rc 0.</li></ul> |
| **DEPS-221** | <ul><li>`git diff c4e6c9d HEAD -- package.json package-lock.json`;</li><li>`ls node_modules/@ffmpeg`;</li><li>`npm ls @ffmpeg/ffmpeg @ffmpeg/util`.</li></ul> | <ul><li>The diff is exactly B's scratch result (`b-round-220/l23-scratch-run.txt`): 2 `package.json` lines, the 2 root dependency lines and the 3 `node_modules/@ffmpeg/*` entries in the lock.</li><li>No `node_modules/@ffmpeg` directory.</li><li>`npm ls` shows neither package.</li></ul> |
| **UNIT-221** | Run A's 5 files and the licence test with `CI=true`. Grep TL9a–TL9d. | All pass, and the 4 ids exist. |
| **REDPROOF-221** | <ul><li>Read A's logs (a)–(d).</li><li>C's own probe (never edit the repo lock): a lock copy with a `node_modules/@ffmpeg/core` entry (`license: "GPL-2.0-or-later"`), fed through a vite transform plugin or a `/tmp` copy as in round 220.</li></ul> | <ul><li>(a)–(d) are each red on the named row.</li><li>C's probe turns TL9b red (and TL4 red as copyleft).</li><li>The repo lock sha256 is unchanged.</li></ul> |
| **NOTICES-221** | <ul><li>`git diff c4e6c9d -- THIRD_PARTY_NOTICES.md`;</li><li>C's `c-round-219/notices-indep.cjs` against the new lock.</li></ul> | <ul><li>The diff is only `(563)` → `(560)` and the 3 removed `@ffmpeg/*` rows.</li><li>The independent check gives 560 rows: 0 missing, 0 extra, 0 mismatches.</li><li>0 `@ffmpeg` in the file.</li></ul> |
| **LEGACY-UI-STUBBED-221** (browser; 1440×900 and 1280×720; Low, Medium and High at 1440, plus High at 1280; a fresh context each) | **Stubbed client path** (B's technique, `b-round-220/legacy-ui-probe.cjs`; C writes its own script):<ul><li>an init script sets `localStorage.auth_user` = `{accessToken, refreshToken, email}` (fake values);</li><li>`context.route` on `http(s)://(localhost\|127.0.0.1):5199/**` answers with the client envelope `{success, data}` and CORS headers echoing the Origin:<ul><li>`OPTIONS` → 204;</li><li>`/api/auth/profile` → a profile;</li><li>`/api/downloads` → `products: [{productId: 1, handle: 'middle-east', licenseType: 'Standard', category: 'Track', isAvailable: true}]`;</li><li>`/api/cart` → an empty cart;</li><li>everything else → 404;</li></ul></li><li>`**/api/studio-token?**` → `{token, expiresIn}`;</li><li>`https://czaba-r2-proxy.sabashavidze.workers.dev/**` → a synthetic 4 s, 48 kHz, stereo, 16-bit sine WAV, a different frequency per stem, with `Access-Control-Allow-Origin: *`.</li></ul>Then open `/studio/middle-east` and wait for "Export Mix" (`button[title="Export Mix"]`) to be enabled. Click it, then MP3, then the quality. **Record** the checked-checkbox count. Click "Select All", then "Export Audio", and save the download. Frame-walk and decode it. | <ul><li>`Middle East-export.mp3`.</li><li>Every audio frame is MPEG-1 Layer III, 48 kHz, stereo or joint stereo, at exactly 128, 192 or 320 kbps for Low, Medium or High.</li><li>The audio frame count is 168 ± 1, plus at most 1 Xing frame, and the walk ends at EOF.</li><li>Decoded: 2 ch, RMS above −40 dBFS.</li><li>0 page errors.</li><li>Between the Export Audio click and the download: 0 requests to `unpkg.com` or to any origin other than the page origin and the stubbed hosts.</li></ul>**Pre-existing, not a FAIL of this round:** the initial checked count is 0 of 10 (B-R220-LEGACY-EXPORT-NO-STEMS, D-29z236). Record it, with a screenshot at each viewport. Any other value is news: report it.<br>**This row proves the client export path through the real dialog in real Chromium. It proves nothing about ownership or auth**; that stays BACKEND-ONLY (see LEGACY-OWNERSHIP-221). |
| **LEGACY-OWNERSHIP-221** | The real `/api/downloads` ownership decision for a purchased user. | **BLOCKED:** "backend unavailable in cloud". Under `blocked`, not in `passed`. It does not make `browserVerified` false. |
| **LAB-MP3-221** (browser, 1440, dev) | The round-220 LAB-MP3, after the warm-up. | <ul><li>`czaba-studio-lab.mp3`;</li><li>every audio frame is 320 kbps, 48 kHz;</li><li>the duration is in [101.352, 101.452] s;</li><li>RMS within 0.1 dB of round 220 (−15.29 dBFS);</li><li>0 page errors.</li></ul> |
| **STUDIO-SMOKE-221** (browser, 1280, dev) | The round-220 WAV smoke. | <ul><li>PCM, 2 ch, 48 kHz, 24-bit;</li><li>the length matches "WAV created" within 1 frame;</li><li>not all zeros;</li><li>0 page errors.</li></ul> |
| **DEV-START-221** | Use the dev-server log from the start after the deps commit. If that log is not accessible to C, record "log not available". Then check the browser console on `/studio-lab` for any `optimizeDeps` or `@ffmpeg` message instead. | <ul><li>No error line, or none in the console when the log is not available.</li><li>Any `optimizeDeps` warning that names `@ffmpeg` is **recorded** as VITE-EXCLUDE-STALE evidence (info), not a FAIL.</li><li>`/studio-lab` → 200.</li></ul> |
| **BUNDLE-221** | Run your own `npm run build`, then remove `build/`. | <ul><li>rc 0.</li><li>0 `ffmpeg`, `unpkg.com` or `@ffmpeg` hits in `build/client` and `build/server`.</li><li>`mp3-encoder.client-*.js` contains `AGFzbQ` once.</li><li>The `routes/studio.$productId` manifest imports contain no mp3-encoder or mediabunny chunk.</li></ul> |
| **PERF-RUN-221** | Run `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` once, alone, with sentinels. Compare with `c-round-220/perf-run-1.json` (the new baseline, D-29z233). | <ul><li>rc 0, `complete`, `failures []`.</li><li>For studio-lab, home and guard, third-party scripts are 0 and the encoded and decoded bytes are within 4,096 B of round 220.</li><li>Script counts equal to 44, 41 and 42 pass. **A different count passes only if** C names the added or removed chunk and shows that no mp3-encoder, mediabunny or ffmpeg module is requested or `modulepreload`ed on that page load. An eager encoder load is a FAIL.</li></ul> |
| **SOURCE-GREP-221** | <ul><li>`grep -rn "@ffmpeg/\|unpkg" app --include=*.ts --include=*.tsx`, excluding `__tests__`;</li><li>`grep -n -i "ffmpeg" <the 5 granted docs>`.</li></ul> | <ul><li>0 hits in app.</li><li>In the docs, every hit is a §1.3 path mention. List them.</li></ul> |
| **G221-3** (browser; **not stubbed**; fresh contexts at 1440×900 and 1280×720) | <ul><li>`/studio-lab` anonymous;</li><li>`/studio/middle-east`;</li><li>`/api/studio-token?product=middle-east&file=stem1.wav`, with no header and with a fake Bearer.</li></ul> | <ul><li>`/studio-lab` opens anonymously with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it.</li><li>**No token is issued.**</li></ul> |
| **AN-REVIEW-221** | Read doc 173, doc 172 l.4 and the granted sections. | <ul><li>Doc 173: the 7 headings in order, l.4 byte-exact, every cited row exists, and every §1.3 topic is present.</li><li>Doc 172: only l.4 changed (`git diff`), byte-exact.</li><li>`git diff` hunks in each granted doc lie only inside the granted sections.</li><li>Each changed Mermaid block parses (`mermaid.parse` in a page, as in round 220).</li><li>0 `loadFFmpeg`, `FFmpeg.wasm` or `@ffmpeg` in the granted sections.</li></ul> |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke at the gate. | Not claimed by C. |

**`browserVerified`:** LEGACY-UI-STUBBED-221, LAB-MP3-221, STUDIO-SMOKE-221, PERF-RUN-221 and G221-3 are browser rows that can run here. If any one of them does not run, the flag is false. LEGACY-OWNERSHIP-221 is backend-blocked and does not count.

## 4. Reference: how Ableton Live 12 does it
**Not applicable.** This is a dependency-removal, test and docs round with no UI or behaviour change (agent-workflow "Reference first" excludes these). Ableton conformance for C is "not applicable" on every row. Live 12 manual §5.1.3.3 "Encoding Options" (CBR 320 kbps MP3) was already the reference for the lab's 320k in round 217; nothing changes it.

**Deviations from today's CZABA behaviour:** none.

## 5. Adjacent behaviour that could break
- **Dev dependency optimisation.** With the packages gone, a stale `optimizeDeps.exclude` is dead config. B's scratch dev start shows it is harmless; DEV-START-221 confirms it on the real tree.
- **The notices drift guards.** TL5 fails until regenerated (expected; §1.1). TL4's anchors don't name `@ffmpeg`.
- **The legacy MP3 path.** It no longer imports any `@ffmpeg` module (SOURCE-GREP-220 = 0), so the removal cannot change it. LEGACY-UI-STUBBED-221 checks this in the browser.
- **The lab MP3 and WAV exports.** LAB-MP3-221 and STUDIO-SMOKE-221 cover them.
- **Purchase protection.** No auth or purchase file is touched. G221-3 (not stubbed) checks it.

## 6. Outcome, fixed in advance
| C result | B at round-222 planning |
|---|---|
| PASS, and planning before 2026-10-30 | Round 222 = **B-R220-LEGACY-EXPORT-NO-STEMS** (Medium, purchased-Studio ExportDialog). Contract: when the dialog's stem list changes, the selection becomes every current stem; a user's toggles persist across close and reopen; stems that disappear leave the selection. Its own test file; LEGACY-UI-STUBBED as the browser row, with an initial checked count of 10/10. It includes a Reference section (Live's Export Audio/Video dialog default selection). PERF-16 is then complete, so B files the export-pipeline architecture checkpoint request at that planning (WAV worker, shared encoder and its reset scope (gate-220 S2), the legacy StudioContext export). Then PERF-HARNESS-SHARED-LIB and the rest of STUDIO-PERFORMANCE. |
| PASS, and planning on or after 2026-10-30 | Round 222 = **REGRESSION**. `scope_additions` include LEGACY-UI-STUBBED (with the 0/10 recorded as the open Medium), PERF-16a MP3, the OSS-LIC test, the PERF-16b-i facade and PERF-16b-ii DEPS. The ExportDialog fix follows. |
| A STOP (no deps commit; an unexpected lock diff) | B rules first (L10). No re-dispatch until it is ruled. If root's deps step failed, B asks root and the round is re-dispatched unchanged. |
| A row fails (unit, red-proof, notices, docs) | A bounded fix-up inside the same files. |
| PERF-RUN-221 or BUNDLE-221 shows an eager load, or the legacy export breaks | Fix-up first. The packages are already gone, so the fix is in code, never a re-add. |
| A smoke or G221-3 finds Medium+ | A bounded fix-up first. A Low goes to `deferred_low_polish`. |

## 7. Publication
- After C PASS, root gates this tree: the deps commit plus the 8 grants and 1 new file (and `vite.config.ts` under grant 9).
- Suggested commit message: `chore(studio): remove the ffmpeg.wasm packages from docs and notices; pin the removal (TL9)`.
- **Root reviewer, please cover:**
  - TL9 and its fixture mutant;
  - the notices diff (exactly 3 rows and the count);
  - that the docs make no claim the code does not back;
  - that `vite.config.ts` follows grant 9.
- **Root, please answer `b-round-220-root-request-vite.md`** (non-blocking).
- **Root, note: TL5 is red at HEAD while the deps commit sits alone on master.** It stays red until round 221 publishes the regenerated notices (L35; B's scratch run confirms it). The store has `.github/workflows/ci.yml`, so a red CI run on the deps-only push is expected and is not a regression.
- Still pending with root, non-blocking: the frontend-architect checkpoint (D-29z195) and `b-round-215-root-request-l28.md`.
