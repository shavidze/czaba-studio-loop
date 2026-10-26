# CURRENT TASK — Round 199: REGRESSION round (phase 1 + T12 V1 + everything done since round 122), four doc status lines in three docs for A

Dispatcher: B · Implementer: A (doc status lines only) · Verifier: C · Date: 2026-10-26 (B planned from 23:40 UTC, `date -u`) · Decision: **D-29z164** (`backlog.json` → `rounds[199]`, `narrow_grants` round 199)

- **Rules:**
  - `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules ("Regression round every 3 days"), and the 2026-10-23 bug gate. These rules take precedence over older text.
  - `loop/lessons.md` does not exist yet; the RETRO creates it.
- **Previous task:** `tasks/round-198.md` is an exact copy of the round-198 `current-task.md` (`cmp` OK). B's reasoning is in `b-round-198.md`.
- **Round type:** this is the **REGRESSION round**, using the round-122 pattern: a C-only browser sweep, plus a doc-only change by A.
  - **No app code changes in this round.** A edits four status lines in three docs.
  - C re-checks in the real browser every item that is done or c_pass, including everything finished since round 122 (VISUAL-A, SABA-B-1…4 stage 1, ROOT-RECON-*, STORE-0/1/2a).

## Baseline: HEAD `980cfbe`, clean tree
- `gates/gate-round-198.json` is `published`, commit `980cfbee1ba0…`, on both remotes. `git status --short` is empty (`b-round-198/git-status-at-planning.txt`).
- **Frozen list:** `b-round-198-r199-tree-sha256.txt`, **1029 entries** (the 1032 tracked files minus the 3 grants). `sha256sum -c --quiet` gave OK at planning.
- **Grants:** `b-round-198-r199-grants.txt` (3 docs).
- **Start hashes:** `b-round-198-r199-granted-start-sha256.txt`.
- **Start copies:** `b-round-198/r199-granted-start/`.
- **A's first step.** Run everything from `store/`. If anything differs, stop and report.
  1. HEAD is `980cfbe`.
  2. `git status --short` is empty.
  3. `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-198-r199-tree-sha256.txt` is OK.
  4. `sha256sum -c ../tmp/studio-real-loop/b-round-198-r199-granted-start-sha256.txt` is OK.

## 0. Why this round (D-29z164)
- **Round 198 passed and is published.**
  - C round 198: PASS, `browserVerified=true`, `realVerified=true`. 12 rows passed and nothing was blocked.
  - Gate 198 published `980cfbe`.
  - **C-R196-02 is closed**, and SABA-B-4 stage 1 (Studio) is complete.
- **Round 198 §7 fixed this outcome in advance:** "C PASS → round 199 is the REGRESSION round".
- **The 3-day timestamp.** `regression-last.json` = 2026-10-24 (round 122), and B planned at 2026-10-26 23:40 UTC. Strictly, that is 2 days. The regression round still goes now:
  - **Nothing outranks it.** 0 Critical, High or Medium findings reproduce in the cloud. Round 197's deviation was justified only by the open Medium C-R196-02, which is now closed.
  - C's run falls on 2026-10-27, when the rule is due anyway.
  - **Shared infrastructure changed.** The workflow's "შემოწმების მოცულობა" clause asks for a full re-check after such a change. SABA-B-4 stage 1 changed the focus style of every Studio control, and STORE-2a changed the store `@theme`.
  - 76 rounds of changes (123–198) have had no regression sweep.
  - **No scope is displaced:** SABA-B-4 stage 2 and STORE-2b follow unchanged.
- **How bugs found here are fixed.** The loop runs B → A → C, so A cannot fix what C finds after A's phase.
  - A Critical, High or Medium finding (including a regression) becomes **round 200, a bounded fix-up**: at most three related bugs, Critical first. The RETRO then moves to the round after it.
  - §7 fixes the outcome in advance.

## 1. A — the only change (docs, Edit tool only)
| File | Line | Today | Replace with exactly |
|---|---|---|---|
| `docs/implementation/2026/quarter-IV/156-store-1d-entrance-loader.md` | **4** | `**სტატუსი:** In Progress (awaiting C round 190)` | ``**სტატუსი:** Completed — Rounds 189–190 (STORE-1d). C PASS (round 190), გამოქვეყნებულია `338564e`-ში (gate 190).`` |
| `docs/implementation/2026/quarter-IV/158-store-2a-colour-tokens.md` | **4** | `**სტატუსი:** In Progress (awaiting C round 195)` | ``**სტატუსი:** Completed — Rounds 192–195 (STORE-2a). C PASS (round 195), გამოქვეყნებულია `7339cd5`-ში (gate 195).`` |
| `docs/implementation/2026/quarter-IV/159-saba-b-4-studio-focus-ring.md` | **4** | `**სტატუსი:** In Progress (ელოდება C-ის შემოწმებას, რაუნდი 196)` | ``**სტატუსი:** ეტაპი 1 (Studio) Completed — C PASS რაუნდებში 197 და 198, გამოქვეყნებულია `2505252`-სა (rounds 196–197) და `980cfbe`-ში (round 198). ეტაპი 2 (store-ის გვერდები) ჯერ არ დაწყებულა.`` |
| same file 159 | **69** | `**თარიღი:** 2026-10-26 · **სტატუსი:** R88 და R90 A-მ დაასრულა და C-ის შემოწმებას ელოდება; R89 stop rule-ით დაბრუნდა · **გადაწყვეტილება:** D-29z162 (R88–R90, საბას ვეტოს უფლებით)` | ``**თარიღი:** 2026-10-26 · **სტატუსი:** R88 და R90 — C PASS (რაუნდი 197), გამოქვეყნებულია `2505252`-ში; R89 stop rule-ით დაბრუნდა, C-R196-02 დაიხურა R91-ით (რაუნდი 198, `980cfbe`) · **გადაწყვეტილება:** D-29z162 (R88–R90, საბას ვეტოს უფლებით)`` |

- The backticks around the commit hashes are part of the text.
- Doc 159 says "stage 1 Completed" only. **Do not** mark the SABA-B-4 item Completed: stage 2 remains.
- **Nothing else changes:**
  - no file under `app/`, no test and no other doc;
  - no new file in `store/`.
  - The Round-198 section of doc 159 has no status line; leave it alone.
- **Expected end state:**
  - `git status --short --untracked-files=all` shows exactly ` M` on these three docs.
  - `git diff --numstat` shows `1 1`, `1 1` and `2 2`, one hunk per changed line.
- **A's checks:**
  - Read the `GEORGIAN_DOCS.md` primitive first.
  - Use the Edit tool only; no shell writes into `store/` (C-R120-01 rule).
  - Run the frozen list at the start and at the end.
  - No code changes, so no typecheck, lint, vitest or code-reviewer.
- **Report:** `a-round-199.md`, with:
  - the start HEAD and status;
  - the four diffs;
  - the frozen-list results;
  - the end status;
  - `a-round-199/end-sha256.txt` for the 3 grants.
- **Forbidden:**
  - `global_forbidden_files` and `global_forbidden_actions`, including the protected auth/purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`);
  - commit, push, stash, checkout and deploy;
  - dev-server restarts.
- **If interrupted:** resume from the checkpoint. A line that is already replaced is not replaced again.

## 2. C — scope, method and budget
- **What C does:**
  - re-checks in the real browser, at **1440×900 and 1280×720**, the key acceptance of every done or c_pass item: §3 (Studio phase 1 + T12 V1) and §4 (since round 122);
  - runs the parked rows (§5);
  - runs `npm run test:e2e:smoke` (§6).
- **C does not run the full vitest suite or `npm run verify`.** Those are gate rows.
- **One short check per item and viewport.** This is not a replay of every historical acceptance ID.
  - When a check fails, C may run the next listed ID of the same item once, to locate the regression.
  - Do not widen the sweep beyond that.
- **No reference tree this round.** The expected values are stated below.
  - For a pixel row, compare with the cited earlier C evidence.
  - To locate a suspected regression, C may build a ref from an older published commit (scratch copy, own port and `cacheDir`) and say how.
- **Tooling:**
  - Playwright with the installed Chromium, a fresh anonymous context per session, DPR 2 for pixel rows, `--disable-lcd-text`. Record the engine version. Base URL: `http://127.0.0.1:5173/studio-lab`.
  - **Base everything on the newest library:**
    - `c-round-198/tools/lib.cjs` (`openStudio`, `addAt`, `loadVideo`, `selectClip`, `seekTo`, `setSnapOff`, `clipsDom`, `detailInfo`, `status`);
    - `c-round-198/tools/rk-lib.cjs`;
    - `c-round-197/tools/rich.cjs` (the rich scene).
  - **Older per-item scripts** (`c-round-112/tools/drift.cjs`, `c-round-114/tools/ui.cjs`, `c-round-115/tools/multi.cjs`, `c-round-120/tools/wg.cjs`, `c-round-121/tools/wz.cjs`, `wav.cjs`, `am.cjs`, `c-round-90/tools/run-mp3.cjs` and the rest of round 122's table) predate V-0 (English) and the round-179 badge-selector change.
    - Use them only after fixing their selectors and strings.
    - List each fix as **"lookup, not deviation"**.
  - Post-122 scripts: `c-round-164/tools` (SABA-B-1/2), `c-round-181..183/tools` (M1/M3/M4), `c-round-186..190/tools` and `c-round-195/tools` (store), `c-round-191/tools` (faders), `c-round-196..198/tools` (focus).
  - Copy what you use into `c-round-199/tools/` and say which scripts you adapted.
  - Media come from `tmp/studio-real-loop/media/`; check `SHA256SUMS.txt` first.
- **Visible text:**
  - Every Studio UI string is now English. `app/lib/arrangement/strings.ts` is the source of truth.
  - A Georgian string in an old script is a lookup error, not a finding. Prefer testid and aria selectors.
  - Default track names are Video / Music / Stems / Audio, and groups are `Group N` (V-0.4d).
- **Setup rules:**
  - **ENV-FIRST-LOAD-GRID-NULL:** if the first `/studio-lab` load of the job crashes the setup (the scroller or the grid control is null), discard that run once and record it under `invalidRuns`.
  - **Store rows (§4.S):** start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199 if it is not running, and stop only the PID you started.
  - **Store home rows:** wait until the entrance loader has unmounted and hit-test the target before clicking (the C-R187-I1 harness rule).
- **Budget per row:**
  - A measurement is valid when the setup completed. A row that fails on a valid setup is a finding; do not replace it.
  - Up to **2 replacement attempts** per row, only for environment-invalid runs.
  - Drift rows use the round-112 rules unchanged. Thresholds are **not relaxed**.
- **Network and console, every session (PX-NET / REG-HYD):**
  - On Studio pages, 0 requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or the R2 host (`r2-proxy|workers.dev`).
  - 0 `Authorization` headers, 0 hydration messages and 0 `pageerror`.
  - Report any console error other than the known cloud noise (`Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`).
- **Write `c-round-199.json` and `c-round-199.md` incrementally, after every row.** A job may stop at its time limit, and the next job resumes from the last completed row.
  - Keep `c-round-199/progress.json`: `{"done":["RG-01-1440", …],"next":"…"}`.
  - **Order:** SOURCE-SCOPE start → §3 → §4 Studio → §4.S store → §5 → §6 smoke → G199-3 → SOURCE-SCOPE end.
- **Blocked rows:**
  - Only rows that truly need the real .NET backend go under `blocked`, with "backend unavailable in cloud":
    - the SRW-21 purchased-route mount;
    - **R80-RECORDINGS-FIELD-BORDERS** (Medium, source done in round 195). Its fields live on the signed-in `recordings.$productId` / `scenes.$productId` routes. The mock answers `/api/products/*/recordings`, `/api/sfx-library` and `/api/sfx-scenes` with sign-in-required (`mock-api/server.mjs` `SIGN_IN_REQUIRED_PATHS`);
    - F11–F13 (`/account`) and F16 (`ChatInput`), as in round 195.
  - They never count as failed and do not make `browserVerified` false.
  - The studio-token fake-Bearer **403 is mock-backed** (as in G198-3), so it is a normal row.
- **Ableton:** no new behaviour is introduced, so the workflow's Ableton source table does not apply.
  - C judges only the **CZABA requirement**.
  - Parity statuses stay as recorded in the original rounds and in `user-review/ableton-review.md`. Make no new parity claim.

## 3. C — Studio phase 1 + T12 V1 rows (one per item; both viewports unless stated)
- All times are in seconds on the timeline.
- **"Undo exact"** means one Ctrl+Z restores the clip table (`lane, start, end, offset`) captured before the action, and Ctrl+Shift+Z re-applies it.
- The **meter rule** of `tasks/round-122.md` §3 applies unchanged: the output tap reads exactly 0 from 150 ms, or a track meter `data-peak` is ≤ −60 dB within 4 s. Report which method you used.
- Where a control name or key differs from an older doc, use the current UI (`strings.ts`, testids) and record it as a lookup.

| Row | Item | Action | Expected (PASS only if all hold) |
|---|---|---|---|
| SOURCE-SCOPE | — | **At the start and at the end:**<ul><li>HEAD;</li><li>`git status --short --untracked-files=all`;</li><li>the frozen list (from `store/`);</li><li>`git diff 980cfbe --stat`.</li></ul> | <ul><li>HEAD is `980cfbe`.</li><li>The status shows exactly the three ` M` docs of §1 (A runs before C, so a missing edit is a SCOPE FAIL), and the frozen list is OK.</li><li>The diff is exactly the §1 lines.</li><li>The protected files are unchanged.</li></ul> |
| AN-REVIEW | — | Read `a-round-199.md` and the diffs | <ul><li>Each change is the exact §1 text.</li><li>Nothing else changed.</li></ul> |
| RG-01 | SRW-01 | <ul><li>Open `/studio-lab` anonymously and wait for the workspace structurally (`[data-testid=arrangement-timeline-scroller]` present, as `lib.cjs` `openStudio` does), not by a string.</li><li>Demo music on Music at 0.</li><li>Split at 4, select the second part, Delete.</li><li>Undo, then Redo.</li></ul> | <ul><li>The workspace and the demo badge show.</li><li>The split gives 0–4 and 4–end, and the second part's offset is the first part's offset + 4.</li><li>Delete leaves a gap.</li><li>Undo and Redo are exact.</li></ul> |
| RG-02 | SRW-02 | <ul><li>Load `beeps-6s-vp9-opus.webm`, then `clip-4s-vp9-opus.webm` (`[data-testid=arrangement-video-input]`).</li><li>Undo.</li></ul> | <ul><li>Video clips at 0–6 and 6–10 (±1 frame), with no overlap.</li><li>One Undo removes only the second clip.</li></ul> |
| RG-03 | SRW-03 | **1440 only.**<ul><li>Video at 0 plus music at 0. Play for 5 s with the round-112 sampler.</li><li>While playing, toggle `Original video sound` off and on.</li></ul> | <ul><li>Median \|d\| ≤ 0.05 and max \|d\| ≤ 0.1 on the stall-excluded series; report the raw values too.</li><li>The video keeps playing, the playhead stays monotonic (no jump > 0.1), and `video.muted` follows the toggle.</li><li>A failure that matches C-R6-02 is recorded as "C-R6-02 recurrence (known)".</li></ul> |
| RG-04 | SRW-04 | <ul><li>Stopped: drag the playhead handle from 2 to 6.</li><li>Play from 6, and after ~1 s select a 1 s body range.</li><li>Pause at about 8, then Play.</li><li>Home.</li></ul> | <ul><li>The handle tracks the pointer within ±1 px, and the position ends at 6 ±0.05.</li><li>Selecting the range makes no jump: monotonic, no step > 0.1.</li><li>Play resumes from the paused position ±0.05.</li><li>Home gives 0.</li></ul> |
| RG-05 | SRW-05 | <ul><li>Range 2–4, Ctrl+L. Range 6–8, Ctrl+L.</li><li>Undo.</li><li>Loop off, then on.</li><li>With the 2–4 loop on, play from 1.5 for 4 s.</li></ul> | <ul><li>One brace at 6–8, and the status starts with `Loop replaced`. Undo gives 2–4.</li><li>When the loop is off, the brace stays (dashed).</li><li>The playhead wraps 4 → 2 at least once, with no position > 4.05.</li></ul> |
| RG-06 | SRW-06 | <ul><li>Click a clip, Ctrl+click a second, Shift+click a third.</li><li>Ctrl+click a selected clip.</li><li>Escape, then a marquee across two lanes.</li></ul> | <ul><li>The counts are 2, then 3.</li><li>Ctrl+click removes the clip from the selection.</li><li>The marquee selects exactly the intersected clips.</li></ul> |
| RG-07 | SRW-07 | Music 0–L selected, Ctrl+D | <ul><li>A copy at L.000 on the same lane, with the same offset and duration.</li><li>Only the copy is selected.</li><li>One Undo removes it.</li></ul> |
| RG-08 | SRW-08 | <ul><li>Drag a clip by its header down one audio lane and +1 s.</li><li>Repeat on another clip, pressing Shift after the drag starts.</li></ul> | <ul><li>**Plain:** the lane changes, start +1 (±1 px), no copy is left, Undo is exact.</li><li>**Shift:** start is exactly unchanged, the lane changes, and the Shift hint is visible.</li></ul> |
| RG-09 | SRW-09 | <ul><li>Ctrl+C, seek 20, Ctrl+V.</li><li>Range 2–3, Ctrl+X.</li><li>Undo.</li><li>Range 2–3, Ctrl+Shift+X.</li></ul> | <ul><li>The paste lands at 20.000 with the same offset and duration.</li><li>Ctrl+X keeps a 2–3 gap.</li><li>Ctrl+Shift+X closes it on all lanes; later clips move −1.000.</li></ul> |
| RG-10 | SRW-10 | <ul><li>Playhead at 10: `+` twice, then `−` once.</li><li>Range 4–6, `Z`, then `X`.</li><li>A ruler click < 4 px while stopped.</li></ul> | <ul><li>The screen x of 10 holds within ±1 px.</li><li>`Z` frames the range at about 60 %, centred.</li><li>`X` restores px/s and scroll exactly.</li><li>The ruler click seeks on release only, with no playback and no history entry.</li></ul> |
| RG-11A | SRW-11A | <ul><li>Collapse the library, then expand it.</li><li>Separator: ArrowRight ×2, ArrowLeft ×2.</li></ul> | <ul><li>The rail is 40 ±1 px; expanding restores the width.</li><li>±16 px steps, `aria-valuenow` matches, clamped to 288/480, no history entry.</li><li>Focus moves to the expand button after collapsing, and back to the collapse button after expanding (lucide icons now, same buttons).</li></ul> |
| RG-11B | SRW-11B | <ul><li>Detail panel: collapse, expand, then the separator arrows.</li><li>GATE111-S5: float the video, focus the detail collapse control, press Escape, then Enter.</li></ul> | <ul><li>Collapsed height is 36 px. Resizing stays within 120–280 in ±16 steps. The timeline is never covered.</li><li>Escape returns from floating with the same `<video>` nodes.</li><li>Enter adds 0 clips.</li></ul> |
| RG-12 | SRW-12 | <ul><li>Search `impact soft`.</li><li>ArrowDown, Enter.</li><li>Preview one item, then ArrowDown during the preview.</li></ul> | <ul><li>The AND match finds the item.</li><li>Enter adds it at the insert marker on the active lane.</li><li>One preview plays at a time, and the transport does not play.</li></ul> |
| RG-13 | SRW-13 | Isolated stems clip:<ul><li>Clip Gain `+6`, Enter; export WAV and compare with a 0 dB export.</li><li>Master mute while playing.</li><li>Pan: focus, ArrowLeft ×5.</li></ul> | <ul><li>The ratio is 1.9953 ±0.5 %.</li><li>Master mute is silent by the meter rule.</li><li>Pan moves left in 5 steps, and its valuetext matches.</li></ul> |
| RG-14 | SRW-14 | <ul><li>BPM empty, Snap on, 1 s grid: drag a clip from 2 to ≈3.3.</li><li>`G` (Snap off), then drag to ≈4.37.</li></ul> | <ul><li>The snapped start is 3.000.</li><li>The free start is within ±1 px of the pointer.</li><li>The grid lines follow the division.</li></ul> |
| RG-15 | SRW-15 | **1440:** BPM 90; metronome on → export WAV; metronome off → export again (isolated stems clip).<br>**1280:** BPM 90, bars visible. | <ul><li>Bars 1, 2 and 3 show under an unchanged seconds ruler.</li><li>The UI says the audio is not stretched.</li><li>The two exports are byte-identical or ≤ 1 LSB apart.</li></ul> |
| RG-16 | SRW-16 | <ul><li>Insert marker at 12, `M`, type `აქ შედის მუსიკა` (Georgian user input stays covered), Enter.</li><li>Seek 0 and click the marker.</li><li>Seek 0 and use the next-marker key.</li><li>Undo the add.</li></ul> | <ul><li>The flag shows at 12 with that name.</li><li>The click and the key give 12.000.</li><li>Undo removes the marker.</li></ul> |
| RG-17 | SRW-17 | <ul><li>Select Music and Stems, Ctrl+G, rename the group `SFX ქუჩა` (Georgian user input).</li><li>Collapse, then expand.</li><li>Group Mute while playing.</li></ul> | <ul><li>A group row appears with indented children; collapsing hides them.</li><li>Mute: the children are silent by the meter rule, and the SFX lane still sounds (> −60 dB).</li></ul> |
| RG-18 | SRW-18 | Fade-in 1 s on the isolated stems clip at S; export | <ul><li>RMS rises over the 4 quarter windows of [S, S+1].</li><li>Outside [S, S+1.01], the export is within ≤ 1 LSB of the no-fade export.</li></ul> |
| RG-19 | SRW-19 | Video fade-in 1 s at 0; stopped, seek 0.5 | <ul><li>Overlay opacity 0.5 ±0.02.</li><li>The Export dialog states that video rendering is not available.</li></ul> |
| RG-20 | SRW-20 | **1440:** range 4–9, Export (range is the default), WAV; then MP3 once.<br>**1280:** the dialog shows the range default and the footer. | <ul><li>**WAV:** 240000 frames ±1, 24-bit, 48 kHz, stereo; equal to project frames [192000, 432000) within ≤ 1 LSB.</li><li>**MP3:** decodes at 5.0 ±0.06 s, or, if the ffmpeg CDN fails, the clear error text shows. An encode that never ran is **inconclusive (environment)**.</li></ul> |
| RG-22 | SRW-22 | <ul><li>Open `/`, wait for the loader, and click the header **`Studio`** link (STORE-1c renamed it from `Studio Lab - Demo`).</li><li>Use the exit link.</li><li>At **390×844**, open the mobile menu.</li></ul> | <ul><li>Client navigation renders the workspace, and the exit returns to `/`.</li><li>The mobile menu shows the link.</li><li>No wrap or overlap at 1440 or 1280.</li></ul> |
| RG-23 | SRW-23 | Zoomed crops of the library and timeline scrollbars with overflowing content | <ul><li>No arrows and no white rail. A graphite track and a rounded muted thumb.</li><li>The mouse wheel scrolls.</li><li>Filtering keeps the library width within ±1 px.</li></ul> |
| RG-24 | SRW-24 | <ul><li>Music 0–10, range 3–5, Delete.</li><li>Undo, then Backspace.</li><li>Undo, then Ctrl+Shift+L.</li><li>Then Ctrl+Shift+X.</li></ul> | <ul><li>0–3 and 5–10 remain, the second offset is +5, and nothing joins.</li><li>Ctrl+Shift+L extends the range to every lane.</li><li>Ctrl+Shift+X removes 3–5 on all lanes; later clips move −2.</li></ul> |
| RG-T1 | T12 stage 1 | Clip Gain fader: focus, ArrowUp ×3, double-click | <ul><li>+0.1 per press, to +0.3; the field and the fader stay in sync.</li><li>Double-click resets to 0.0.</li><li>Each change is one `Undo: Clip Gain` entry.</li></ul> |
| RG-T2 | T12 stage 2 | Two clips at −6.0 and 0.0, both selected, +3.0 (the `c-round-115/tools/multi.cjs` method) | <ul><li>−3.0 and +3.0; the mixed range text shows.</li><li>One Undo restores both.</li></ul> |
| RG-T3A | T12 stage 3a | Isolated stems clip: lane Volume to the bottom; export | <ul><li>The readout is `-∞`, and the stored value is exactly 0.</li><li>The lane's export window has 0 non-zero samples.</li></ul> |
| RG-T3B | T12 stage 3b | <ul><li>Group Volume dragged −20 px.</li><li>Master: the same distance plain and with Shift.</li></ul> | <ul><li>The group valuetext is in dB.</li><li>The Shift move is about 1/10 of the plain move.</li></ul> |
| RG-T4A | T12 stage 4a | Clip Gain −6 on stems (the `wg.cjs` rule) | <ul><li>The waveform ratio is 0.501187 within the round-120 tolerance.</li><li>Undo restores the exact drawing (same `d` sha).</li></ul> |
| RG-T4B | T12 stage 4b | Waveform Zoom 2× (click + ArrowDown + Enter, `wz.cjs`); reload | <ul><li>The ratio rule holds with s = 2, and the video `d` is unchanged.</li><li>After reload: `1×` and `data-waveform-zoom="1"`.</li></ul> |

## 4. C — items finished since round 122 (one short check each; both viewports)
"As in round N" means: reuse that round's C script and threshold, adapted only for later intended changes (each row lists them).

| Row | Item (rounds) | Action | Expected |
|---|---|---|---|
| RV-EN | VISUAL-A V-0 English copy (127–148) | Collect `innerText`, `aria-label` and `title` at rest, in the rich scene (`c-round-197/tools/rich.cjs`), in the Export dialog, the library, the marker menu and the detail panel | <ul><li>0 Georgian characters (U+10A0–U+10FF) in any visible text or accessible name in the workspace, demo collection names included.</li><li>User-entered text is excluded: RV-EN runs in its own fresh session, without the Georgian names typed in RG-16/RG-17.</li><li>A hit is a regression: Medium on a control name, Low otherwise.</li></ul> |
| RV-TOKENS | V-1 tokens, V-2 fonts, DUX-R-5 one colour rule (149–157, 174–180) | Computed styles at rest and in the rich scene | <ul><li>The workspace root has `data-studio-theme="obsidian"`.</li><li>UI text uses Instrument Sans and timecodes IBM Plex Mono (`document.fonts.check` is true for both).</li><li>Clip waveforms and Overview bars are neutral, with no brass fill on content; brass appears only where round 180 allowed it (selection, playhead, focus ring).</li><li>0 computed teal colours (hue 160–190°, saturation > 40 %) inside the `[data-studio-theme]` root. B's grep found no teal class or `--color-video-sync` consumer under `app/components/arrangement/` (`video-sync` there is a module name). The store header outside the root is excluded, because its teal sweep is STORE-2b.</li></ul> |
| RV-ICONS | V-3b/V-3c icons and surfaces (160–173) | Transport, library, lane, group, dock, marker and detail controls | <ul><li>Every former glyph button renders a lucide `svg`, and no stray glyph text (`▶ ◀ ✕ ⤢ ⠿ ▾ ▸ ↶ ↷ ✂ ⌫ ↻ ↩ ↤`) remains in `innerText`.</li><li>Toolbar and header buttons have no visible border (5 % fill, 8 px radius).</li><li>The panel radius is 10 px on the Overview root and on the detail and dock frames.</li></ul> |
| RV-M | M1, M3, M4 (181–183) | Transport Play; the library list; the bottom of `/studio-lab` and `/studio/middle-east` | <ul><li>Play is a round, icon-only button, 32×32 ±0.5, with empty `innerText`.</li><li>The library option gap is 4 ±0.5 px. STATE-M3 is re-worded per C-R182-STATE-M3-WORDING: the inset ring equals the row box, and the global `:focus-visible` outline is excluded.</li><li>No cookie banner on either Studio path: no Accept/Decline and no fixed bottom element from it. `elementFromPoint` at the status line hits the status line.</li></ul> |
| RV-SABA-1-2 | SABA-B-1, SABA-B-2 (164) | <ul><li>Env on, a breakpoint on a selected, an unselected and a hovered clip (the round-164 ENV-VIS setup).</li><li>The Overview corners at DPR 4, in the empty project and scrolled to the far right.</li></ul> | <ul><li>The envelope line and handle are ≥ 3:1 against the clip body in every state, re-measured on today's neutral clip body (DUX-R-5).</li><li>The corner notch metric is 0 (the round-164 `notch-metric` tool, unchanged). The radius is now 10 px (V-3c-5b); that is intended.</li></ul> |
| RV-SABA-3-4 | SABA-B-3, SABA-B-4 stage 1 (191, 196–197) | Track Volume, Pan, group Volume, Master and Clip Gain:<ul><li>a mouse press held 200 ms, a mid-drag, a release;</li><li>then keyboard Tab + ArrowLeft.</li></ul> | <ul><li>No filled box in any state.</li><li>After a mouse press, **no ring**. On keyboard focus, one 1.5 px brass ring (≤ 80 %) with a 2 px offset that follows the control's radius, as in RING-KEY-197.</li><li>One thumb size (12–14 px) and colour, `rgb(236,230,218)`, on every slider.</li><li>The ring is ≥ 3:1.</li></ul> |
| RV-REVEAL | R91 (198) | The rich scene at 1280, and the same at 1440 as the control:<ul><li>a full Tab cycle forward, then Shift+Tab back;</li><li>at maximum scroll, Tab onto Snap and a mouse click on Snap.</li></ul> | <ul><li>Every scroller stop outside the chrome has top ≥ chrome bottom − 0.5.</li><li>The chrome and pointer steps leave `scrollTop` unchanged.</li><li>At 1440 nothing scrolls (as in round 198).</li></ul> |
| RV-MARKER-ENTER | ROOT-RECON-MARKER-ENTER (165) | <ul><li>Hold a clip drag (pointer down and moved), open the marker add editor by keyboard, type a name, press Enter, then release.</li><li>Repeat with rename.</li></ul> | <ul><li>During the held gesture, Enter does not commit: no new marker, and the editor stays open with the text.</li><li>After release, Enter commits once with exactly one Undo entry.</li><li>The same holds for rename.</li></ul> |

### 4.S — store rows (mock API on :5199; both viewports)
| Row | Item (rounds) | Action | Expected |
|---|---|---|---|
| RS-1A | STORE-1a (186) | An inactive product handle from the mock; an active product page; the home page | <ul><li>The inactive product gives the 404 page.</li><li>The active product's `<meta name=description>` comes from its data.</li><li>SpecialOffers loads the local `gift-card.png` (200, not remote).</li></ul> |
| RS-1B | STORE-1b (187) | <ul><li>Play a product preview in AudioPlayer.</li><li>Compare the SSR HTML of AudioPreviewButton with its first client render.</li></ul> | <ul><li>The progress and volume fills are visible (a non-transparent computed background).</li><li>No SSR/CSR label flip: the label text is identical before and after hydration, with 0 hydration messages.</li></ul> |
| RS-1C | STORE-1c (188) | Header and footer on `/` and on a product page | <ul><li>The nav matches round 188 NAV-188: Collections, Studio, About, the sign-in control, and **Free Samples (kept)**.</li><li>Gift Cards and Hire Us are in the footer.</li><li>A plain wordmark without a gradient.</li><li>Exactly 1 `h1` per page; the footer name as in FOOT-188.</li></ul> |
| RS-1D | STORE-1d (189–190) | <ul><li>A fresh context on `/`: sample every 100 ms for 7 s.</li><li>A skip.</li><li>Reload in the same session.</li><li>`prefers-reduced-motion: reduce`.</li></ul> | <ul><li>The loader is gone within 1.2 s, and a skip removes it at once.</li><li>It is not shown again in the session, and it is off under reduced motion.</li><li>At most 1 `h1` at every sample; the overlay is `aria-hidden`.</li><li>The card Play is hit within 1250 ms.</li><li>CLS-FRESH as in round 190 (≤ 0.1).</li></ul> |
| RS-2A | STORE-2a (192–195) | `/`, a product page, `/support` and the LeadMagnet popup | <ul><li>The store `@theme` resolves to round 195's Obsidian & Brass values. Spot-check `--color-background`, `--color-brand` and body text `#cfc7ba`.</li><li>Brass-filled controls have dark text.</li><li>The LeadMagnet placeholder and the `/support` guest-form borders are visible (≥ 3:1, as in rounds 194–195).</li><li>The keep-list is present: the LeadMagnet "FREE DOWNLOAD" popup, Free Samples, SpecialOffers, the "Limited" badges, the testimonials and the stats.</li></ul> |

## 5. C — parked rows and observations
| Row | Source | Action | Expected / how B rules it |
|---|---|---|---|
| RP-METRO-MUTE | C-R167-METRONOME-UNDER-MUTE (info) | Metronome on, play, Master Mute on | **Record only:** is the click audible (tap or meter)? It is not PASS or FAIL. No requirement is stated and no Ableton claim is made; B rules it at round-200 planning. |
| RP-SPACE-EMPTY | C-R149-OBS-SPACE-EMPTY (info) | Empty project, press Space | **Record only:** does the playhead advance? ABL-R-9 (approved, not yet implemented) will change this, so today's behaviour is not a finding. |
| RP-VIDEO-MARKER | GATE76-S3-VIDEO-CLIP-MARKER-UNTESTED (Low, deferred) | Move a video clip onto a marker position with Snap on | Record the start versus the marker time. A wrong snap is Low and stays deferred. A lost clip or a broken Undo is Medium. |

## 6. C — smoke, gate rows, auth guard
- **RG-SMOKE:** run `npm run test:e2e:smoke` in `store/`, **after** every browser row and **not concurrently** with them.
  - It starts its own dev server on 5187, which shares `node_modules/.vite`.
  - It covers only `/cart`, not the Studio. Report it as the deterministic smoke gate.
  - Leave its git-ignored output in place.
  - **Valid setup:** the 5187 `webServer` started and Chromium launched.
    - A launch, port or timeout failure is **inconclusive (environment)**, with one retry after the cause is gone.
    - An assertion failure on a valid setup is a finding.
- **G199-3:**
  - `/studio-lab` shows the workspace and the demo badge.
  - `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.
  - `/api/studio-token` with no header → **401**; with a fake Bearer → **403** (mock-backed).
  - The SRW-21 purchased-route mount is **BLOCKED (backend unavailable in cloud; SRW-21 deferred_user)**.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 7. Outcome, fixed in advance
| C result | B at round-200 planning |
|---|---|
| Every row PASS, smoke PASS | <ul><li>**First**, set `regression-last.json` = `{"date": <C's completion date>, "round": 199}`.</li><li>Round 200 = **RETRO**. It changes no app code, and it creates `loop/lessons.md` and `loop/retros/retro-200.md`.</li><li>Then SABA-B-4 stage 2 (store pages, with C-R196-03), then STORE-2b.</li></ul> |
| Any Critical, High or Medium finding, including a regression | <ul><li>Round 200 = a **bounded fix-up** (at most three related bugs, Critical first), and C re-runs the failed rows.</li><li>The RETRO follows it.</li><li>`regression-last.json` is still updated, because the sweep ran.</li></ul> |
| Low findings only | <ul><li>They go to `deferred_low_polish` with id, severity, evidence and repro.</li><li>Otherwise the same as the all-PASS row.</li></ul> |
| Rows not run (time limit) or inconclusive past the budget | <ul><li>The missing rows continue first in round 200.</li><li>`regression-last.json` is updated only when every row has run.</li><li>An inconclusive row is never PASS.</li></ul> |
| A browser row that could run here did not run | `browserVerified=false`, and B re-plans that half. |

- **Ordering rule for the round-200 planner:** `regression-last.json` still reads 2026-10-24. If C ran every row, **update it from round 199's C result first**, and only then apply the 3-day rule. Otherwise a second regression round would be planned by mistake.
- **Item status:** a failed row does not change its item's earlier status by itself. It opens a finding linked to the item. The item drops from done or c_pass only when B rules the finding a reproducible regression.

## 8. Neighbour risk
| Risk | Check |
|---|---|
| A probe accidentally writes into `store/` | SOURCE-SCOPE |
| The smoke dev server or the mock disturbs the 5173 tabs | The serial order; the mock is started and stopped by its PID |
| The job time limit | Incremental reports and `progress.json` |
| False FAILs from pre-V-0 scripts or strings | §2 "lookup, not deviation" |

## 9. Deliverables
- **A:** `a-round-199.md` and `a-round-199/end-sha256.txt`.
- **C:**
  - `c-round-199.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `observations` and `invalidRuns`;
  - `c-round-199.md`;
  - evidence under `c-round-199/{tools,out,shots}`.
- Every bug gets an id `C-R199-NN`, a severity, the item, the steps, the evidence path and "regression yes/no (since which round's pass)".

## 10. Root notes
- **Gate on C PASS:** round 199 against `980cfbe`, 3 modified docs only. The publish is doc-only.
- **Still requested from root (non-blocking):** the frontend-architect checkpoint at the SABA-B-4 stage-1 boundary (`b-round-197.md` §6). The round-198 reviewer adds a weak Signal 3 on the scroller/chrome focus region, with the verdict "keep" (`b-round-198.md` §4).
- **For Saba (vetoable, non-blocking):** R83–R91.
