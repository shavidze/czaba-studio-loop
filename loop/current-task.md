# CURRENT TASK — Round 122: REGRESSION round (phase 1 + T12 V1), doc status lines only for A

Dispatcher: B · Implementer: A (two doc status lines only) · Verifier: C · Date: 2026-10-24 (B planned from 00:18:55 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`. Also apply the LOOP POLICY, Loop v2, the cloud-runner and speed rules ("Regression round every 3 days"), the 2026-10-23 bug-gate decision and the root clarification. These rules take precedence over older text.
- **Previous task:** `tasks/round-121.md`, an exact copy (`cmp` OK, 29441 bytes). Rationale: `b-round-121.md`. Decision record: **D-29z87** in `docs/technical/studio-real-workspace/plan.md`.
- **Round type:** this is the **REGRESSION round** under the speed rules, using the round-112 pattern: a C-only round plus a one-file doc change by A.
  - Why now: `regression-last.json` = 2026-10-21 and B planned on 2026-10-24, which is 3 days.
  - **No app code changes in this round.** A edits only two doc status lines.
  - C spends the round re-checking in the real browser every item that is already done or c_pass.
- **Baseline: clean commit `425a80705c7b57d6157796810bdd878f1c7b061c`.** Gate 121 is `published` on both remotes. `git status --porcelain` is empty.
  - Frozen list: `tmp/studio-real-loop/b-round-121-r122-tree-sha256.txt`, 935 entries. That is every tracked file except the two docs in §1.
  - `sha256sum -c --quiet` gave OK at planning, run from `store/`.

## 0. Why this round (D-29z87)
- **Round 121 passed and is published.**
  - C round 121: PASS (`c-round-121.json`, `browserVerified: true`, `realVerified: true`, 0 bugs, 23 rows passed).
  - The only blocked row is the fake-Bearer 403, because the backend is unavailable in the cloud.
  - Gate 121 published `425a807`.
  - So **T12 stage 4b is `c_pass_published`**, and **T12 V1 (T12.27 items 1–8 = stages 1, 2, 3a, 3b, 4a, 4b) is complete**.
- **The regression round is due now** (3 days since 2026-10-21). The speed rules put it ahead of new scope. It is also the natural point to check the whole phase 1 + T12 V1 surface before ABLETON-EXPERT-REVIEW starts judging it.
- **Nothing is open at Critical, High or Medium that reproduces in the cloud.**
  - C-R6-02 and C-R8-01 are `open_tech_lead_quiet_chrome` with no app attribution.
  - A-R73-SAFARI-FLAG-FOCUS is `environment_webkit_unavailable`.
  - None of these three block anything, per the root clarification.
- **How bugs found here are fixed:** the loop runs B → A → C, so A cannot fix inside this round what C finds after A's phase. A Critical, High or Medium finding (including a regression) becomes **round 123, a bounded fix-up** (at most three related bugs, the 116→117 pattern). Section 6 fixes the outcome in advance.

## 1. A — the only change
| File | Change |
|---|---|
| `docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md` | **Line 4 only.** Today it reads `**სტატუსი:** In Progress — Round 120 (T12 ეტაპი 4a, D-29z85). A-ის ტესტები მწვანეა; C-ის ბრაუზერის შემოწმება და root-ის gate ჯერ წინაა.`<br>Replace it with exactly: ``**სტატუსი:** Completed — Round 120 (T12 ეტაპი 4a, D-29z85). C PASS, გამოქვეყნებულია `0a75ba8`-ში (gate 120).`` |
| `docs/implementation/2026/quarter-IV/103-studio-waveform-vertical-zoom.md` | **Line 4 only.** Today it reads `**სტატუსი:** In Progress — Round 121 (T12 ეტაპი 4b, D-29z86). A-ის ტესტები მწვანეა; C-ის ბრაუზერის შემოწმება და root-ის gate ჯერ წინაა.`<br>Replace it with exactly: ``**სტატუსი:** Completed — Round 121 (T12 ეტაპი 4b, D-29z86). C PASS, გამოქვეყნებულია `425a807`-ში (gate 121).``<br>This closes gate-121 reviewer suggestion 6. |

- In both replacement texts, the backticks around the commit hash are part of the text.
- **Nothing else changes:**
  - no file under `app/`, no test and no other doc;
  - no new file in `store/`.
- **Expected end state.** `git status --short --untracked-files=all` shows exactly ` M` for these two docs.
  - `git diff --numstat` shows `1 1` per file, with one hunk at line 4.
- **Frozen list.** A runs `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-121-r122-tree-sha256.txt` from `store/` at the start and at the end, and reports OK or FAIL.
- **Pre-edit sha256** (both files are tracked, so `git show 425a807:<path>` also restores them):
  - doc 102: `d829d7e5…f52d`;
  - doc 103: `22a6c287…4569`.
- **A's checks:**
  - before editing, read the `GEORGIAN_DOCS.md` primitive;
  - make the edits with the Edit tool only; no shell writes into `store/` (C-R120-01 rule).
  - No code changes, so A does **not** run typecheck, lint or vitest, and does not need a code-reviewer.
- **A's report** (`a-round-122.md`) states: the start HEAD and status, both diffs, the frozen-list result at the start and at the end, and the end status.
- **Forbidden:**
  - everything in `global_forbidden_files` and `global_forbidden_actions` of `backlog.json`, including the four protected auth/purchase files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts` and `app/contexts/AuthContext.tsx`;
  - commit, push, stash, checkout and deploy;
  - dev-server restarts, and probes that write into `store/`.
- **If A is interrupted:** resume from the checkpoint. If a line is already replaced, do not replace it again.

## 2. C — scope, method and budget
- **What C does:**
  - re-checks in the real browser, at **1440×900 and 1280×720**, the key acceptance of every item that is done or c_pass (§3);
  - runs the rows that earlier findings parked "for the regression round" (§4);
  - runs `npm run test:e2e:smoke` (§5).
- **C does not run the full vitest suite or `npm run verify`.** Those are `gate` rows (§5).
- **One short check per item and viewport.** This is not a re-run of every historical acceptance ID.
  - When a check fails, C may run the next listed ID of the same item once, to locate the regression.
  - Do not widen the sweep beyond that.
- **Tooling:** Playwright with the installed Chromium, a fresh context per session, no storage state and no credentials. Base URL `http://127.0.0.1:5173/studio-lab`.
  - Build on `c-round-121/tools/lib.cjs`: `openStudio`, `addAt`, `loadVideo`, `selectClip`, `seekTo`, `setSnapOff`, `clipsDom`, `detailInfo`, `status`.
  - Build on `c-round-121/tools/wav.cjs`: `parse`, `stats`, `cmp`.
  - Copy what you need into `c-round-122/tools/`, and say which scripts you adapted.
  - Media come from `tmp/studio-real-loop/media/`; check `SHA256SUMS.txt` first.
  - Scripts that passed an item before, for reuse:

| Area | Script(s) to reuse |
|---|---|
| groups | `c-round-79/tools/g79.cjs`, `c-round-81/tools/lib81.cjs` |
| fades and envelope | `c-round-82/tools/lib82.cjs`, `c-round-83/tools/lib83.cjs` |
| video fades | `c-round-84/tools/lib84.cjs` |
| range export | `c-round-85/tools/lib85.cjs` |
| MP3 export | `c-round-90/tools/run-mp3.cjs` |
| markers | `c-round-74/tools/mk74.cjs`, `c-round-75/tools/mk75.cjs` |
| library focus | `c-round-110/tools/reg.cjs`, `lf-basic.cjs` |
| video return / float | `c-round-111/tools/vr.cjs` |
| drift sampler | `c-round-112/tools/drift.cjs` |
| touch | `c-round-112/tools/touch.cjs`, `c-round-113/tools/touch.cjs` |
| Clip Gain | `c-round-114/tools/ui.cjs`, `c-round-115/tools/multi.cjs` |
| lane Volume | `c-round-116/tools/lane.cjs` |
| group Volume | `c-round-118/tools/ui.cjs` |
| waveform gain | `c-round-120/tools/wg.cjs` |
| waveform zoom | `c-round-121/tools/wz.cjs` |

  - If no cloud script exists for an item, write a short one on top of `lib.cjs`.
- **Setup rule (ENV-FIRST-LOAD-GRID-NULL):** if the first `/studio-lab` load of the job crashes the setup (the grid control is null), discard that run once and replace it. Record it under `invalidRuns`.
- **Budget per row:** the measurement is valid when the setup completed. A row that fails on a valid setup is a finding; do not replace it.
  - Up to **2 replacement attempts** per row, only for environment-invalid runs.
  - Drift rows use the round-112 rules unchanged (§3 RG-03).
  - Thresholds and tolerances below are **not relaxed**.
- **Network and console, every session (PX-NET / REG-HYD):**
  - 0 requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or the R2 host (`r2-proxy|workers.dev`);
  - 0 `Authorization` headers, 0 hydration messages, 0 `pageerror`;
  - console errors other than the known cloud noise (`Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`) are reported.
- **Write `c-round-122.json` and `c-round-122.md` incrementally, after every row.** A job may stop at its time limit, and the next job resumes from the last completed row.
  - Keep `c-round-122/progress.json`: `{"done":["RG-01-1440", …],"next":"…"}`.
  - Order: SOURCE-SCOPE start → §3 rows in the listed order (1440, then 1280 per row) → §4 → §5 smoke → G122-3 → SOURCE-SCOPE end.
- **Backend-dependent sub-checks** go under `blocked` with "backend unavailable in cloud": the fake-Bearer 403, the purchased route mount (SRW-21, `deferred_user`) and anything that needs `:5199`. They never count as `failed`, and they do not make `browserVerified` false.
- **Ableton:** no new behaviour is introduced, so the Ableton source table of the workflow does not apply to this round. C judges only the **CZABA requirement** (the expected values below); the Ableton correspondence statuses stay as recorded in the original rounds. Ableton parity is the job of ABLETON-EXPERT-REVIEW, which comes next.

## 3. C — regression rows (one per item; both viewports unless stated)
All times are in seconds on the timeline. "Undo exact" means one Ctrl+Z restores the clip table (`lane, start, end, offset`) captured before the action, and Ctrl+Shift+Z re-applies it.

| Row | Item | Action | Expected (PASS only if all hold) |
|---|---|---|---|
| SOURCE-SCOPE | — | **At the start and at the end:**<br>• `git -C store rev-parse HEAD`;<br>• `git status --short --untracked-files=all`;<br>• `sha256sum -c --quiet b-round-121-r122-tree-sha256.txt`, run from `store/`;<br>• `git diff 425a807 --stat`. | • HEAD is `425a807`.<br>• The status is exactly the two ` M` docs of §1, and the frozen list is OK.<br>• The diff is exactly the two line-4 hunks of §1.<br>• The four protected files are unchanged. |
| AN-REVIEW | — | Read `a-round-122.md` and the two diffs | Each change is the exact text of §1, and nothing else changed |
| RG-01 | SRW-01 | Open `/studio-lab` anonymously and wait until „იტვირთება…“ is gone. Place the demo music on the music lane at 0. Split it at 4 (insert marker at 4, then the split command used in the earlier rounds). Select the second part and press Delete. Then Undo, then Redo | • The workspace and the demo badge show.<br>• The split gives 0–4 and 4–end, and the second part's offset is the first part's offset + 4.<br>• Delete leaves a gap; later clips do not move.<br>• Undo and Redo are exact. |
| RG-02 | SRW-02 | Load `beeps-6s-vp9-opus.webm`, then `clip-4s-vp9-opus.webm`, through `[data-testid=arrangement-video-input]`. Then Undo | • Two video clips at 0–6 and 6–10 (±1 frame), with no overlap.<br>• One Undo removes only the second clip. |
| RG-03 | SRW-03 | **1440 only.** Video at 0 (beeps webm) plus music at 0.<br>• Play from 0 for 5 s, with the round-112 sampler (`c-round-112/tools/drift.cjs`): drift `d = video.currentTime − (pos − start + offset)`.<br>• Then, while playing, toggle `ვიდეოს ორიგინალი ხმა` off and on. | • **Drift:** median \|d\| ≤ 0.05 and max \|d\| ≤ 0.1, on the stall-excluded series (round-112 rules; report raw values too).<br>• **Mute toggle:** the video keeps playing (`paused` false); the playhead stays monotonic with no jump > 0.1; `video.muted` follows the toggle.<br>• A failure that matches C-R6-02 (one sample at a clip cut, app LoAF 0) is recorded as "C-R6-02 recurrence (known)", not as a new bug. Any other failure is a finding. |
| RG-04 | SRW-04 | • Stopped: drag the playhead handle from 2 to 6.<br>• Play from 6, and after ~1 s select a 1 s range in a clip body.<br>• Pause at about 8.<br>• Play.<br>• Home. | • The handle follows the pointer (±1 px), and the position ends at 6 ±0.05.<br>• Selecting the range does not make the position jump: monotonic, with no step > 0.1.<br>• After Pause, Play resumes from the paused position ±0.05.<br>• Home gives 0. |
| RG-05 | SRW-05 | • Range 2–4, Ctrl+L.<br>• Range 6–8, Ctrl+L.<br>• Undo.<br>• Toggle the loop off and on.<br>• With the 2–4 loop on: play from 1.5 for 4 s. | • After the second Ctrl+L there is one brace at 6–8, with the status `Loop ჩანაცვლდა` (prefix match); Undo gives 2–4.<br>• When the loop is off, the brace stays (dashed).<br>• With the loop on, the playhead wraps at 4 → 2 (at least one wrap, with no position > 4.05). |
| RG-06 | SRW-06 | • Music at 0 and SFX at 3: click music, then Ctrl+click SFX. Shift+click a third clip (the stems demo at 6).<br>• Then press Escape, and drag a marquee on empty background across two lanes. | • The selection counts are 2 and then 3, as the detail panel and the selected attributes show.<br>• Ctrl+click on a selected clip removes it.<br>• The marquee selects exactly the intersected clips. |
| RG-07 | SRW-07 | Select a music clip 0–L, then Ctrl+D | • A copy at L.000 on the same lane, with the same offset and duration.<br>• Only the copy is selected.<br>• One Undo removes the copy. |
| RG-08 | SRW-08 | • Drag a clip by its header down one audio lane and +1 s.<br>• Then repeat on another clip, pressing Shift after the drag starts. | • **Plain drag:** the lane changes and start is +1 (±1 px); no copy is left behind; Undo is exact.<br>• **With Shift:** start is exactly unchanged, the lane changes, and the Shift hint is visible during the drag. |
| RG-09 | SRW-09 | • Select music 0–L, Ctrl+C, seek 20, Ctrl+V.<br>• Range 2–3 on music, Ctrl+X.<br>• Undo.<br>• Range 2–3, Ctrl+Shift+X. | • **Copy/paste:** the copy lands at 20.000 with the same offset and duration.<br>• **Ctrl+X:** keeps a 2–3 gap; other lanes are unchanged.<br>• **Ctrl+Shift+X:** closes the gap on **all lanes**; clips that start later move by −1.000. |
| RG-10 | SRW-10 | • `+` twice, then `−` once, with a playhead at 10.<br>• Range 4–6, then `Z`.<br>• Then `X`.<br>• A ruler click < 4 px while stopped. | • The zoom is anchored: the screen x of 10 stays within ±1 px.<br>• `Z` frames the range at about 60 % of the viewport, centred.<br>• `X` restores the zoom (px/s) and the scroll exactly.<br>• The ruler click seeks on release only; it does not start playback and adds no history entry. |
| RG-11A | SRW-11A | • Collapse the library with its button, then expand it.<br>• Focus the separator, then press ArrowRight ×2 and ArrowLeft ×2. | • Collapsed width 40 ±1 px; expanding restores the previous width.<br>• The separator steps ±16 px, `aria-valuenow` matches, it is clamped to 288/480, and no history entry is added.<br>• **Focus (B-R108-LIB-FOCUS-LOSS):** after collapsing with `◀`, focus is on `▶`; after expanding with `▶`, focus is on `◀`. |
| RG-11B | SRW-11B | • Collapse and expand the detail panel, then resize it with the separator arrows.<br>• Then the **GATE111-SUGG-E2E-S5** scenario: load a video, expand it to floating, focus the detail-panel collapse control, press Escape, then Enter. | • **Collapse/resize:** collapsed height 36 px; resizing stays within 120–280 in steps of ±16; the timeline is never covered.<br>• **S5:** Escape returns from floating, the same `<video>` DOM nodes remain, and Enter adds **0 clips** (clip count unchanged). |
| RG-12 | SRW-12 | • Type `impact soft` in the library search.<br>• ArrowDown into the results, then Enter.<br>• Preview one item, then press ArrowDown while it previews. | • The search finds the soft-impact item (AND match).<br>• Enter adds it to the active lane at the insert marker.<br>• Only one preview source plays at a time, and the transport does not play during the preview. |
| RG-13 | SRW-13 | **Isolated stems clip** (music and SFX muted, no video):<br>• Clip Gain field `+6` Enter, then export WAV;<br>• compare it with a 0 dB export.<br>• Master mute while playing.<br>• Pan: focus it, then ArrowLeft ×5. | • The export ratio, peak and RMS, is 1.9953 ±0.5 % (+6 dB ±0.02).<br>• Master mute: silence by the **meter rule** below.<br>• Pan moves left in 5 steps, and its valuetext matches. |
| RG-14 | SRW-14 | • BPM empty, Snap on, grid 1 s: drag a clip from 2 to about 3.3.<br>• Then Snap off (`G`) and drag it to about 4.37. | • Snap on: start = 3.000.<br>• Snap off: a free start, within ±1 px of the pointer.<br>• The grid lines follow the division. |
| RG-15 | SRW-15 | **1440:**<br>• Type BPM 90 in the bars field.<br>• Turn the metronome on, export WAV, then turn it off and export again (the same isolated stems clip as RG-13).<br>**1280:** BPM 90, bars visible. | • Bar numbers 1, 2, 3 appear under the seconds ruler; the seconds ruler is unchanged.<br>• The UI says the audio is not stretched.<br>• The two exports are byte-identical, or ≤ 1 LSB apart: the metronome is not in the export. |
| RG-16 | SRW-16 | • Insert marker at 12, press `M`, type `აქ შედის მუსიკა`, Enter.<br>• Seek 0 and click the marker.<br>• Seek 0 and use the next-marker key of the SRW-16 doc (round 72 MK-NAV).<br>• Undo the add. | • The flag shows at 12 with that name.<br>• The click and the next key put the insert marker at 12.000.<br>• Undo removes the marker. |
| RG-17 | SRW-17 | • Select the music and stems lanes, press Ctrl+G, rename the group `SFX ქუჩა`, then collapse it.<br>• Expand it, then group Mute while playing. | • A group row appears with the two children indented; collapsing hides them.<br>• Group Mute: the children are silent by the **meter rule**, and the SFX lane still sounds (its tap or track-meter peak stays above −60 dB). |
| RG-18 | SRW-18 | Fade-in 1 s via the handle on the isolated stems clip at S, then export | • The export RMS over [S, S+1] rises monotonically in 4 quarter windows.<br>• Outside [S, S+1.01], the export equals the no-fade export (≤ 1 LSB). |
| RG-19 | SRW-19 | Video fade-in 1 s on the video clip at 0. Stopped, seek 0.5 | • The overlay opacity is 0.5 ±0.02 (overlay = 1 − value).<br>• The export dialog states that video rendering is not available. |
| RG-20 | SRW-20 | **1440:**<br>• Range 4–9, Export: the range radio is the default; export WAV.<br>• Then MP3 once (`run-mp3.cjs` method).<br>**1280:** open the dialog; the range default and the footer are visible. | • **WAV:** 240000 frames (±1), 24-bit, 48 kHz, stereo; content equals project frames [192000, 432000) within 1 LSB.<br>• **MP3:** the file decodes (duration 5.0 ±0.06 s), or, if the ffmpeg CDN fails in the cloud, the clear error text is shown. An encode that never ran is **inconclusive (environment)**, not PASS. |
| RG-22 | SRW-22 | • Open `/` anonymously and click the header `Studio Lab` link, then the exit link.<br>• Also at **390×844**: open the mobile menu. | • Client navigation renders the workspace; the exit returns to `/`.<br>• The mobile menu shows the link; there is no wrap or overlap at 1440/1280. |
| RG-23 | SRW-23 | Screenshots plus zoomed crops of the library and timeline scrollbars with overflowing content (add enough clips or zoom in) | • No arrows and no white rail; graphite track; rounded muted thumb.<br>• Wheel scrolling works.<br>• Filtering the library leaves its width stable (±1 px). |
| RG-24 | SRW-24 | • Music 0–10, range 3–5, Delete.<br>• Undo, then Backspace.<br>• Undo, then range 3–5 + Ctrl+Shift+L.<br>• Then Ctrl+Shift+X. | • **Delete and Backspace:** 0–3 and 5–10 remain; the second part's offset is +5; no join.<br>• **Ctrl+Shift+L:** extends the range to every lane.<br>• **Ctrl+Shift+X:** removes 3–5 on all lanes and moves later clips by −2. |
| RG-T1 | T12 stage 1 | Single audio clip: focus the Clip Gain fader, then ArrowUp ×3, then double-click it | • The value goes +0.1 per press (to +0.3), and the field and fader stay in sync.<br>• Double-click resets to 0.0.<br>• Each change is one Undo entry (`Undo: Clip Gain`). |
| RG-T2 | T12 stage 2 | Two audio clips at −6.0 and 0.0, both selected. Raise them by +3.0 with the stage-2 method of `c-round-115/tools/multi.cjs` | • The clips become −3.0 and +3.0; the mixed range text shows.<br>• One Undo entry restores both. |
| RG-T3A | T12 stage 3a | **Isolated stems clip** (music and SFX muted, no video, as in RG-13): drag the stems lane Volume fader to the bottom, then export | • The readout shows `-∞`, and the stored value is exactly 0.<br>• The export window of that lane is 0 non-zero samples. |
| RG-T3B | T12 stage 3b | • Group Volume (RG-17 group) dragged −20 px: read `aria-valuetext`.<br>• Master: the same pixel distance plain vs with Shift (round-119 SH-MASTER). | • The group valuetext is in dB.<br>• Master Shift moves about 1/10 of the plain move (round 119: −2.5 vs −27.5). |
| RG-T4A | T12 stage 4a | Clip Gain −6 on the stems clip (`wg.cjs` ratio rule) | • The lane and detail waveform ratio is 0.501187 within the round-120 tolerance.<br>• Undo restores the exact drawing (same `d` sha). |
| RG-T4B | T12 stage 4b | Waveform Zoom 2× via a real click plus ArrowDown + Enter (`wz.cjs`), then reload | • The ratio rule holds with s = 2, and the video `d` is unchanged.<br>• After reload, `1×` and `data-waveform-zoom="1"`. |

**Meter rule** (RG-13, RG-17): meters fall at 20 dB/s, as noted in C-R118-OBS-GV-INF-METER-BALLISTICS, so the visible fall is not instant. "Silent" means either of these:
- the real output tap (`c-round-121/tools/am.cjs`, `tap()`) reads exactly 0 from 150 ms after the click;
- for a single track, the track meter `data-peak` is ≤ −60 dB within 4 s.

Report which method was used. For a group mute, use the children's track meters, and the tap for "the SFX lane still sounds".

Where a row's exact control name or key differs from the current UI (for example the split command or the next-marker key), use the one in the item's implementation doc, and record which one you used. This is a lookup, not a deviation.

## 4. C — rows parked for the regression round (both viewports unless stated)
| Row | Source | Action | Expected / how B rules a failure |
|---|---|---|---|
| RP-RANGE-1280 | C-R83-S-1280-RANGE-SHIFT | At 1280×720 with the demo stems clip, make a body range selection. Record the stems clip box (`y`, `h`) before and after | • Expected: unchanged within ±0.5 px.<br>• **Ruling:** a shift with no mis-hit (the next pointer action still lands on the intended lane) is **Low** and goes to `deferred_low_polish`. If the shift makes a click or drag land on the wrong lane or clip, it is **Medium**. |
| RP-ROW-HANDLE | GATE85-S6-ROW-BOUNDARY-HANDLES | Select a clip on lane N whose fade-out handle sits within 4 px of lane N's bottom edge (use the smallest lane height). Use `elementFromPoint` at the handle centre, then drag the handle 20 px | • `elementFromPoint` returns the handle, not lane N+1.<br>• The drag changes the fade; no clip on N+1 moves or gets selected.<br>• **Ruling:** if the handle is covered, this is **Medium** (a fade becomes unreachable). |
| RP-TOUCH-LONG | TOUCH-LONGPRESS-CONTEXTMENU | **1440 only.** A CDP long touch (≥ 800 ms, no move) on the stems lane Volume fader, the Pan fader and the Master fader (`touch.cjs` method) | • Record whether `contextmenu` fires.<br>• Expected: the value is unchanged and no Undo entry is added.<br>• **Ruling:** a value change or an Undo entry is a **regression of A-R38-REVIEW-TOUCH (Medium)**. A `contextmenu` with no menu is information only. |
| RP-HEADER-WIDTH | gate-121 reviewer suggestion 7 | BPM 90, the widest musical division label offered (a triplet division), Snap on, Env on and Waveform Zoom 8× | • `[data-testid=arrangement-grid-control]` has `scrollWidth ≤ clientWidth`.<br>• The grid row is 28 px and the four chrome rows are unchanged.<br>• Screenshot.<br>• **Ruling:** visible overflow or clipping of a control is **Low** if all controls stay operable, and **Medium** if one becomes unreachable. |

## 5. C — smoke, gate rows, auth guard
- **RG-SMOKE:** run `npm run test:e2e:smoke` in `store/`, **after** every browser row and **not at the same time** as them.
  - The config starts its own dev server on port 5187, which shares `node_modules/.vite` (ENV-VITE-REOPTIMIZE-RELOAD).
  - Record the result and the counts.
  - What it covers: `e2e/agent-system-smoke.spec.ts` checks only `/cart` (the empty cart and the sign-in modal with Escape). It is **not Studio coverage**; report it as the deterministic smoke gate only.
  - The connection-refused API errors to `:51999` are expected.
  - Its `playwright-report/` and `test-results/` output is git-ignored (`.gitignore` l.19–20). Do not delete or commit it.
  - **Valid setup for this row:** the 5187 `webServer` started and Chromium launched.
    - A `webServer` timeout, a busy port 5187 or a Chromium launch failure is **inconclusive (environment)**. Record the log, and allow one retry after the cause is gone.
    - A test assertion failure on a valid setup is a finding.
    - This smoke has not been run on the cloud runner before. B found no smoke result in `gates/round-121`.
- **G122-3** (auth guard, same as G121-3):
  - `/studio-lab` shows the workspace and the demo badge;
  - `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;
  - `/api/studio-token` returns **401**;
  - the fake-Bearer 403 is **BLOCKED (backend unavailable in cloud)**.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 6. Outcome, fixed in advance
| C result | B at round 123 planning |
|---|---|
| Every §3/§4 row PASS, smoke PASS | • **First**, before applying the 3-day rule at round 123 planning, set `regression-last.json` = `{"date": <C's completion date>, "round": 122}`.<br>• Round 123 = **ABLETON-EXPERT-REVIEW, part 1** (C-only review round; A changes no code). |
| Any Critical, High or Medium finding, including a regression | • Round 123 = a **bounded fix-up** (at most three related bugs, Critical first), followed by C re-running the failed rows.<br>• `regression-last.json` is still updated, because the sweep ran. |
| Low findings only | • Add them to `deferred_low_polish` with id, severity, evidence and repro.<br>• Otherwise the same as the all-PASS row. |
| Rows not run (time limit) or environment-inconclusive past the budget | • The missing rows continue in round 123.<br>• `regression-last.json` is updated only when every row has run.<br>• An inconclusive row is never PASS. |

**Ordering rule for the round-123 planner:** at round 123 planning, `regression-last.json` still reads 2026-10-21. If C ran every row, **update it from round 122's C result first**, and only then apply the 3-day rule. Otherwise a second regression round would be planned by mistake.

A failed row does not change its item's earlier status by itself. It opens a finding linked to the item, and the item drops from c_pass only when B rules the finding a reproducible regression.

## 7. Neighbour risk
No app code changes, so this round cannot regress Studio behaviour. The risks are in the process:
- an accidental write into `store/` by a probe (SOURCE-SCOPE catches it);
- the smoke dev server reloading the 5173 tabs (hence the serial order);
- the job time limit (hence the incremental reports).

## 8. Deliverables
- **A:** `a-round-122.md` (§1).
- **C:**
  - `c-round-122.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs` and `invalidRuns`;
  - `c-round-122.md`;
  - evidence under `c-round-122/{tools,out,shots}`.
- Every bug gets: an id `C-R122-NN`, a severity, the item, the steps, the evidence path and "regression yes/no (since which round's pass)".
