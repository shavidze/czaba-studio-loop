# CURRENT TASK — Round 77: SRW-16 (FB-10) stage 2b-2 — Ctrl/Option+←/→ also stop at clip edges of the selected tracks (D-29z42)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` and the LOOP POLICY / Loop v2 / cloud-runner / speed rules in your prompt (they win over older text).
- **Previous task:** `tasks/round-76.md` (exact copy). Rationale for this round: `b-round-76.md`. Decision record D-29z42 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage (2b-2), one owner (A). Stage 2b stays split in three, none deferred: 2b-1 (round 76) is done; **2b-2 is this round**; 2b-3 (range/playhead snap to markers) follows.

## Why this round
C round 76 (`c-round-76.md`, `.json`): **PASS, `browserVerified=true`, `realVerified=true`, no bugs.** Root gate 76 published `db9cc255e29d8792e2c67a391519515a0ec2230e` to both remotes. Stage 2b-1 (clips snap to markers) is done. The next dependency-ordered open scope is 2b-2: the Live 12 §6.9 keyboard rule, plus the macOS binding requested by gate-73 reviewer S1 (ROOT-R73-S1-MAC-CTRL-ARROWS: macOS reserves Ctrl+←/→ for Spaces, so on a Mac the shortcut is unreachable today). No Critical/High bug is open. The regression round is due on or after 2026-10-24 (`regression-last.json` = 2026-10-21); not this round.

Gate-76 review suggestions (S1 marker list computed 3× per pointermove, S2/MS8c group fallback, S3 video clip onto marker untested, S5 snapshot vs live) are backlog signals (GATE76-*), not in this round, except **S4 (doc 066 status line)**, which is granted below as one line. `ArrangementClip.tsx`, `ArrangementLane.tsx` and `grid.ts` are frozen again.

## Baseline (measured by B, 2026-10-22)
- **HEAD `db9cc255e29d8792e2c67a391519515a0ec2230e`** (gate 76 published commit), clean tree: `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-76-r77-tree-sha256.txt`, **453** entries, 453/453 OK (`cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-76-r77-tree-sha256.txt`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned existing files below. Frozen includes **every existing test file** (`markers-ui.test.tsx`, `markers-move-ui.test.tsx`, `grid-snap-keys.test.tsx`, `marker-snap.test.tsx` …), `ArrangementContext.tsx`, `view.ts`, `grid.ts`, `ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementRuler.tsx`, `ArrangementMarkerMenu.tsx`, docs 064/065.
- **Snapshots:** `../tmp/studio-real-loop/b-round-76-r77-snapshots/` (`SHA256SUMS.txt`), all LF, CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/lib/arrangement/markers.ts` | `168cd442` | 193 |
  | `app/components/arrangement/ArrangementMarkerRow.tsx` | `8e0bb133` | 812 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `753cecba` | 2021 |
  | `docs/implementation/2026/quarter-IV/066-studio-lab-clip-snap-markers.md` | `8576ba44` | 108 |
- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers (B, Linux cloud):** `:5173/studio-lab` 200 per `env-status.json`; backend `:5199` unavailable (expected). A and C re-check at phase start. Never start or stop servers. A row that truly needs the backend is "BLOCKED: backend unavailable in cloud", never PASS.
- **NEVER** stash, reset, checkout, clean or re-create anything. A mismatch (different HEAD, non-empty status, a changed frozen file) means stop and report. Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`.

## 1. What changes (A)

### Today (read by B in the source)
- `StudioWorkspace.tsx` ~l.1442–1459: `Ctrl` (no Meta/Alt/Shift) + ←/→ → `markerRowRef.current?.stepMarker(±1)`, unless the target is a slider, separator, loop brace or the overview. Typing targets return earlier (~l.1296). During a pointer gesture the block at ~l.1352 refuses Ctrl+arrows **and** plain arrows (`!modifier` + ArrowLeft/Right) with `GESTURE_EDIT_BLOCKED_MESSAGE`.
- `ArrangementMarkerRow.tsx` `stepMarker` (~l.222–240) → `adjacentMarkerTarget(arrangement, livePosition, direction, projectEnd)` (`markers.ts` ~l.143): next/previous marker, else project end / 0, else `null` → status `წინ მარკერი აღარ არის` / `უკან მარკერი აღარ არის`. A marker stop sets the selected (`aria-current`) marker. The ◀ ▶ buttons call the same `stepMarker`.
- The plain-arrow clip nudge (~l.1513–1539) has **no `altKey` exclusion**, so today Alt+←/→ with a selected clip nudges the clip on every platform. The flag key handler (`handleFlagKeyDown` ~l.604) ignores Ctrl/Meta/Alt, so modified arrows on a focused flag bubble to the workspace (MV7).
- The frozen MU6/MU6b/MU11/MV7 fixtures have one clip `m1` on `music` covering 0–50 (= project end), so their edges coincide with 0/end and those tests stay green under the new rule. B checked this; no test amendment is granted or needed.

### Contract (B decision: smallest honest behaviour consistent with FB-10, Live 12 §6.9 and §6.4)
| # | Rule |
|---|---|
| N1 | **Keyboard step stops.** Ctrl+←/→ (and on Apple platforms also Option+←/→, N6) moves the playhead to the nearest stop strictly before/after the live position (existing `MARKER_TIME_EPS`). Stops = **marker times ∪ start and end of every clip on the selected tracks (N2)**. When no stop exists in that direction, the existing fallback applies unchanged: project end (forward) / 0 (backward), else the existing refusal strings. |
| N2 | **Selected tracks** (B decision; Live: "the selected track or tracks"): the union of (a) `activeTrackId`, (b) the `trackId` of every clip in `selectedClipIds`, (c) the time range: `range.allTracks` → every track, otherwise `range.trackId`. Unknown ids are ignored. Video tracks follow the same rule (a video clip's edges count when its track is selected). |
| N3 | **Coincidence:** a marker and a clip edge within `MARKER_TIME_EPS` are one stop, and it is the **marker** stop (it selects that marker). |
| N4 | **Marker selection:** a marker stop selects the marker exactly as today. A clip-edge stop and the end/0 fallback leave the marker selection unchanged (same as today's end/0 fallback). No status text on a successful stop (as today). |
| N5 | **Buttons stay marker-only.** ◀ ▶ (`arrangement-marker-prev/next`) keep today's behaviour: markers, then project end / 0 (Live 12 §6.4 Previous/Next Locator). Their labels, `title` and `aria-keyshortcuts` are byte-unchanged (frozen MU6 locks `Control+ArrowLeft/Right`; see the Low signal R77-BUTTON-SHORTCUT-SUPERSET in §7). |
| N6 | **macOS Option binding.** When the platform is Apple (N7), Option(Alt)+←/→ without Ctrl/Meta/Shift does exactly what Ctrl+←/→ does (N1), with the same target guards (slider, separator, loop brace, overview; typing targets already return earlier). Ctrl+←/→ keeps working on Apple platforms too. This branch must run **before** the plain-arrow clip nudge, so Option+arrow on a Mac with a selected clip steps the playhead and does **not** move the clip. During a pointer gesture the existing block (~l.1352, `!modifier` + arrows) already refuses it; keep that. |
| N7 | **Platform check at key time only.** A pure predicate decides "Apple" from `navigator.platform` / `navigator.userAgent` strings (`Mac`, `iPhone`, `iPad`, `iPod`; `userAgentData` is not required). It is evaluated **inside the keydown handler**, never during render (no hydration difference). No rendered string depends on the platform. |
| N8 | **Non-Apple Alt+arrows unchanged.** On Windows/Linux, Alt+←/→ behaves byte-for-byte as in round 76 (the nudge branch is not edited). |
| N9 | **Nothing else changes.** No history entry, no arrangement change, no marker change, playback keeps playing (seek while playing as today). With no clip edge on the selected tracks strictly between the stops of round 76, results equal round 76 (frozen MU6/MU6b/MU11/MV7 stay green unchanged). |

### Files (exact grants)
- **New `app/lib/arrangement/edge-navigation.ts`:** pure exports, names may differ if A explains: `navigationTrackIds(arrangement, { activeTrackId, selectedClipIds, range }): string[]` (N2), `clipEdgeTimesOnTracks(arrangement, trackIds): number[]` (sorted, unique), `isApplePlatform(platform: string, userAgent: string): boolean` (N7). No React, and no `navigator` access inside the module (the caller passes the strings).
- **`app/lib/arrangement/markers.ts`:** `adjacentMarkerTarget` gains an optional last parameter `edgeTimes: readonly number[] = []` implementing N1/N3; existing callers and results unchanged when it is omitted. No other byte change.
- **`app/components/arrangement/ArrangementMarkerRow.tsx`:** only `stepMarker` and `ArrangementMarkerRowHandle.stepMarker` gain an optional `edgeTimes` argument passed through to `adjacentMarkerTarget`. The buttons keep calling `stepMarker(±1)` with no edges (N5). Nothing else (drag code and GATE75 S1–S3 stay as they are).
- **`app/components/arrangement/StudioWorkspace.tsx`:** only the Ctrl+←/→ branch (~l.1442–1459): compute the edge times from `current.getArrangement()`, `current.activeTrackId`, `current.selectedClipIds`, `current.range` through the new helpers and pass them to `stepMarker`; add the Apple Option condition (N6/N7) in this same branch, which already sits before the `if (modifier) return;` line and therefore before the nudge branch. **Untouched:** the gesture block, the nudge branch, `timelineNavigationKey`, every other key.
- **`docs/implementation/2026/quarter-IV/066-studio-lab-clip-snap-markers.md`:** only the status line (l.4), replaced by exactly this line (one line, nothing else; GATE76-S4):

  > **სტატუსი:** Round 76 — C PASS (browserVerified), გამოქვეყნდა `db9cc25` (D-29z41)

- **New tests:** `app/lib/arrangement/__tests__/edge-navigation.test.ts` (unit) and `app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx` (workspace). Copy the harness from `markers-ui.test.tsx` into the new UI file; do not edit any existing test.
- **New `docs/implementation/2026/quarter-IV/067-studio-lab-marker-edge-navigation.md`:** Georgian, LF, per `docs/implementation/TEMPLATE.md`: N1–N9, the N2/N5 rationale, the Ableton table, files, tests, mutations. Status: awaiting C.

If N1–N9 cannot be met inside these grants (for example, a frozen handler swallows Option+arrow first), **stop and report**. Do not edit elsewhere.

### Required tests (behavioural; new files only)
UI fixture (B suggestion): tracks video, music (audio, default active), sfx (audio); clips music `2.250–7.750`, sfx `4.100–5.900`, video `1.750–30.000` on the video track (off-grid interior edge 1.750, so the video edge is not the 0/end fallback); markers `6.300` "A" and `12.000` "B"; the project end is then 30.000 (record the value you get). Off-grid values ensure a pass comes only from the new stops.
- **EU1 `navigationTrackIds`:** active only; active + selected clips' tracks (deduplicated); `range.trackId`; `range.allTracks` → all tracks; unknown ids ignored; nothing selected and `activeTrackId=null` → `[]`.
- **EU2 `clipEdgeTimesOnTracks`:** start and end of clips on the given tracks only; sorted, unique; other tracks excluded; `[]` tracks → `[]`.
- **EU3 `adjacentMarkerTarget` with edges:** forward/backward nearest of marker/edge; marker+edge coincident within EPS → marker returned (N3); omitted/empty `edgeTimes` → identical to the old results on a table of ≥6 positions × both directions; end/0 fallback and `null` unchanged.
- **EU4 `isApplePlatform`:** `MacIntel`, `iPhone`, `iPad` → true; `Win32`, `Linux x86_64` → false; empty platform with a `Macintosh` user agent → true; empty both → false.
- **EN1:** fresh mount (active = music, no selection), from 0: Ctrl+→ repeatedly → `[2.25, 6.3, 7.75, 12, end]`; sfx edges 4.1/5.9 and the video edge 1.75 skipped.
- **EN2:** click the sfx clip (active sfx, selected sfx) → from 0: `[4.1, 5.9, 6.3, 12, …]` (music edges skipped); then Ctrl+click the music clip → `[2.25, 4.1, 5.9, 6.3, 7.75, 12, …]`.
- **EN3:** a time range on the sfx track set through the context API (`setTimeRange`, no clip selected, active track music) → sfx edges are stops; after Ctrl+Shift+L (`allTracks`) → music, sfx and video edges (incl. 1.75) are stops. This is the clean discriminator for N2(c); the browser row EK-RANGE may mix it with the selected-clip rule.
- **EN4:** backward symmetry down to 0, then the refusal `უკან მარკერი აღარ არის`; forward refusal `წინ მარკერი აღარ არის` at the end.
- **EN5:** a marker stop sets that flag `aria-current="true"`; a following clip-edge stop leaves the same flag `aria-current` (N4); coincident edge+marker (a clip edge at 12.000 on the active track) selects marker B.
- **EN6:** the ◀ ▶ buttons skip clip edges (`[6.3, 12, end]` and back) with the EN1 fixture (N5).
- **EN7 (Apple stub):** with `navigator.platform` stubbed to `MacIntel` (restored after), Option+→ gives the EN1 sequence; with a selected clip, Option+→ steps the playhead and the clip start and `undoLabel` are unchanged; Ctrl+→ still steps.
- **EN8 (non-Apple):** with `Win32` and `Linux x86_64` stubs, Alt+→ with a selected clip gives exactly the plain-→ result (clip nudged as in round 76) and the playhead does not jump to a stop.
- **EN9 guards:** Option+→ (Apple) and Ctrl+→ with focus in the BPM input and on a volume fader → position unchanged; during a claimed pointer gesture Option+→ (Apple) → position unchanged and `GESTURE_EDIT_BLOCKED_MESSAGE`.
- **EN10:** while playing, Ctrl+→ to a clip edge keeps playing; position ≥ edge and < edge + 0.5.
- **EN11:** focused flag, Option+→ (Apple) → navigates to the next stop, marker times unchanged, `undoLabel` null (as MV7).
- **Mutation proofs (A runs each, records it, restores and `cmp`s):** (a) the workspace passes `[]` edges → EN1 red; (b) `navigationTrackIds` drops selected-clip tracks → EN2 red; (c) it drops the range → EN3 red; (d) the Apple Option condition removed → EN7 red; (e) the Option condition without the platform check → EN8 red; (f) the buttons also pass edges → EN6 red; (g) coincidence prefers the edge → EU3/EN5 red.
- **A's checks (speed rules):** `npm run typecheck`, `npm run lint`, and `npx vitest run app/lib/arrangement/__tests__/edge-navigation.test.ts app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/markers-move-ui.test.tsx app/lib/arrangement/__tests__/marker-snap.test.tsx app/lib/arrangement/__tests__/grid-snap-keys.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/view.test.ts`, plus every other test file that references `stepMarker` or `adjacentMarkerTarget` (`grep -rl "stepMarker\|adjacentMarkerTarget" app`). All green. No full suite, no `npm run verify` (root gate). **Code-reviewer is required** (3+ files); pass its Architecture note to B as a signal.

## 2. Pre-flight for A
Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `prompts/studio-feature.md`. Verify the baseline: HEAD, 0 status lines, frozen 453/453, snapshots 4/4, protected 4/4, EOL. Process count: `pgrep -c node`.

## 3. File ownership (exact)
Writable: `app/lib/arrangement/edge-navigation.ts` (new), `app/lib/arrangement/markers.ts` (`adjacentMarkerTarget` optional parameter only), `app/components/arrangement/ArrangementMarkerRow.tsx` (`stepMarker` + handle type only), `app/components/arrangement/StudioWorkspace.tsx` (Ctrl+←/→ branch only), doc 066 (status line only), new `edge-navigation.test.ts`, new `marker-edge-nav-ui.test.tsx`, new doc 067. A's report → `a-round-77.md` (+ `a-round-77/` scratch in the loop folder). Everything else read-only, including `.claude/**`, the protected files, `package*.json` and every existing test file.

Expected end `git status --short`: at most 4 `M` lines (markers.ts, ArrangementMarkerRow.tsx, StudioWorkspace.tsx, doc 066) plus 4 `??` lines (edge-navigation.ts, the two tests, doc 067). Only root commits.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Ctrl (Win) / Option (Mac) + ←/→ snaps to locators **and clip edges of the selected track(s)** | Live 12 manual §6.9 "Selecting Clips and Time", https://www.ableton.com/en/live-manual/12/arrangement-view/ ; B capture 2026-10-21 `b-round-71/ableton-arrangement-view-20261021.txt` (re-read 2026-10-22) | **Confirmed (text):** "Holding Ctrl (Win) / Option (Mac) while pressing the left and right arrow keys snaps the insert marker to locators and the edges of clips in the selected track or tracks." | N1, N6. **Deliberate mapping:** Live moves the *insert marker*; CZABA moves the playhead, as stage 1 already does (D-29z37). CZABA keeps Ctrl on Mac too (harmless) | EK-ACTIVE, EK-SELECT, EK-RANGE, EK-AUDIO |
| What "selected tracks" means | §6.9 (no definition) | **Unconfirmed** | N2: active track ∪ tracks of selected clips ∪ range track(s) (CZABA decision) | EK-SELECT, EK-RANGE |
| Previous/Next Locator buttons | §6.4 "Launching the Arrangement with Locators", same capture | **Confirmed (text):** "You can jump to locators … by using the Previous and Next Locator buttons … After jumping to the first or last locator … jump to the Arrangement start or end" | N5: buttons marker-only, unchanged | EK-BUTTONS |
| Coincident locator + clip edge | — | **Unconfirmed** | N3: one stop, the marker | vitest EN5 only |
| Windows Alt+←/→ | — | Not a Live shortcut for this | N8: unchanged | EK-ALT-LINUX |
| Insert marker between tracks (↑/↓) | §6.9 | Confirmed in Live | **Not applicable** (CZABA has no insert marker separate from the playhead; not requested) | — |
B did no new web research; the stored capture is the source. C judges **CZABA requirement** and **Ableton match** separately.

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous)
The Apple Option path **cannot run here** (Linux Chromium has no Apple platform; spoofing `navigator.platform` is a simulation). It is covered by vitest EN7/EN9/EN11 and Tech Lead check R77-T; it is **not** a C browser row, so it does not affect `browserVerified`.

Setup (record actual values): fresh load; Snap **off**. Note the initial clips and the active track (the `aria-pressed` lane name button). With Snap off, drop a library SFX (immediate onset, e.g. "Soft impact") on the **stems** track at ≈4.700, then a second SFX on the **sfx** track at ≈3.450 (the last drop makes sfx active and selects that clip). Add a marker at ≈6.300 (ruler click with Snap off, M, Enter). Read clip starts/durations from `data-clip-start` / the detail panel, marker times from `data-marker-time`, the position from the playhead (`arrangement-playhead`) or the transport readout as in MK-NAV. In every row, record the active track and the selected clips, and include every clip edge of those tracks (also initial demo clips) in the expected stops.

| ID | Action | Pass evidence |
|---|---|---|
| EK-ACTIVE | REAL-click an empty part of the **sfx** lane (e.g. at 15 s; active sfx, no clip selected), Home, then Ctrl+→ repeatedly up to the marker; then Ctrl+← back to 0 | forward stops = sfx clip start, sfx clip end, marker 6.300 (±0.001), in order; the stems clip start ≈4.700 is **skipped**; backward mirror, ending at 0 |
| EK-SELECT | REAL-click the sfx clip, Ctrl+click the stems clip; Home; Ctrl+→ repeatedly | stops now include the stems clip start and end, merged in time order with the sfx edges and the marker |
| EK-RANGE | Click an empty part of the **sfx** lane (clears clip selection and range, sfx active). Then drag a time range **inside the stems clip's body** (an empty-lane drag is the clip marquee, not a range; ranges are made in a clip waveform, INFO-C71-LOOP-FIXTURE). Record whether that drag also selects the stems clip or changes the active track. Home; Ctrl+→ steps; then Ctrl+Shift+L and repeat | range on stems → stems edges are stops (plus the edges of the recorded active track / selected clips); after Ctrl+Shift+L, the edges of every lane's clips in the interval are stops (e.g. an initial demo clip on another lane). The clean N2(c) proof is vitest EN3 + mutation (c) |
| EK-BUTTONS | Same setup as EK-ACTIVE; REAL-click ▶ from 0, then ◀ | ▶ goes straight to the marker 6.300 (clip edges skipped), then project end; ◀ mirrors |
| EK-MARKER-SEL | After a Ctrl+→ stop on the marker, then a Ctrl+→ stop on a later clip edge (add one if needed) | the marker flag is `aria-current="true"` after both stops; no status text on success |
| EK-AUDIO (real audio, discriminating) | From the EK-ACTIVE state (empty sfx lane click first: sfx active, no clip selected). Solo the sfx track, REAL-click video **Mute** on (round-44 rule). (1) Home; Ctrl+→ once (stop = sfx clip start ≈3.450); Space. (2) Stop; Home; REAL-click ▶ once (marker-only, stop = 6.300); Space | (1) position reads the clip start before play; master meter rises (≥3 dB to ≥-15 dB detector, 10 ms sampler, round-70 rule) within **0.3 s** of play start. The round-76 behaviour (markers only) would land on 6.300, where the soloed SFX does not sound → no rise; so (1) can only pass with the new clip-edge stop. (2) **no rise for ≥1 s** (negative control; also audio evidence that the buttons skip clip edges). Both viewports; record levels and timestamps. Restore Solo/Mute |
| EK-PLAYING | During playback, Ctrl+→ | transport keeps playing; the position continues from the next stop |
| EK-ALT-LINUX | Select the sfx clip, Snap on, Alt+→ | identical to plain →: the clip moves to the next grid line (round-76 behaviour), the playhead does not jump to a stop |
| EK-GUARDS | Ctrl+→ with focus in the BPM input and on a volume fader; Ctrl+→ on a focused flag | BPM/fader: no step (they keep their own behaviour); focused flag: steps, the marker does not move (MV7) |
| REG-NUDGE | Plain ←/→ with a selected clip (Snap on and off) | as round 76 (grid step / 0.1 s nudge), one history entry each |
| REG-MARKERS | Marker drag with Snap, right-click menu, Play from here | as round 76 REG-MARKERS |
| T77-TARGETED | Run A's targeted vitest list once (not the full suite) | green; record counts |
| REG-HYD | Console during the rows | no hydration / `useLayoutEffect` warning, no non-noise error |
| G77-3 | Header link → `/studio-lab` with the demo badge; `/studio/<id>` anonymous → "Sign in required", no workspace; anonymous `/api/studio-token` 401; page network has no `/api/studio-token`, `/api/recording-*`, `/api/download`, no R2 host, no Authorization header | as stated. fake-Bearer 403 → BLOCKED (backend unavailable in cloud) |
| SOURCE-UNCHANGED | A's end hashes at C start and end; frozen 453/453; protected 4/4; status per §3 | equal |

Gate rows (C marks them `gate`, never `passed`): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
Neighbours that can break: plain-arrow clip nudge (grid step / 0.1 s), marker flag arrows (marker nudge), the MU6 sequence, Ctrl+arrow guards (slider, separator, loop brace, overview, typing), Space/playback, the ruler's own arrow keys.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutation (a) or (e) on a scratch copy outside `store/`, or reason from A's recorded output. C never edits `store/`.

## 7. After this round
- **Round 78:** stage 2b-3 (range/time selection and playhead snap to markers; CZABA decision). Round-78 planning may fall on or after 2026-10-24; then the **regression round takes precedence** and 2b-3 moves one round, unchanged.
- Then B asks root for a bounded frontend-architect checkpoint at the SRW-16 boundary (ArrangementMarkerRow owner risk, `isFollowAutoScroll` duplicate, the `snapTargetsFor` helper proposal from gate 76, the GATE75 marker-drag findings), then the GATE75 S1–S3 fix-up, then SRW-17.
- New Low signal recorded by B (not this round): **R77-BUTTON-SHORTCUT-SUPERSET** — the ◀ ▶ buttons announce `Control+ArrowLeft/Right` while the key now also stops at clip edges; batched with ROOT-R69-L2 / ROOT-R73-S2 in the Lows batch (the string is locked by frozen MU6).
- Tech Lead manual check **R77-T**: on a real Mac, Option+←/→ steps markers and clip edges of the selected tracks; Option+→ with a selected clip does not move it; Ctrl+←/→ is taken by Spaces as expected.
