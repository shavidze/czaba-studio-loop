# Round 250: SABA-B-10a stage 2a. Edit commands use the Insert Marker, the past-end refusal names its start point, and three findings in the same code are fixed.

The changes:
- Paste, library add and Ctrl+E without a time selection act at the Insert Marker.
- M adds at the Insert Marker when stopped and at the playback position while playing.
- The past-end refusal names its start point.
- Three findings in the same code (two Medium test gaps and one Medium gesture regression) are fixed.

**Planned by:** B, at the round 249 → 250 planning, 2026-10-29 (`date -u` 14:44 at start). **Decisions:** D-29z435…D-29z443.

**Type:** stage 2a of SABA-B-10a. Saba approved SABA-B-9/10/11 on 2026-10-28 together with `transport-grid-review.md` §10a, which says: "Paste, M (stopped), Ctrl+E (no range) and Enter-add use `insertMarker`; during playback M uses the playhead (ABL-R-10's approved variant)."
- One owner for the model (`ArrangementContext.tsx`).
- One-line or few-line call-site changes in 3 components.
- 2 string files and 6 test files.

**Why this round (D-29z435, D-29z436):**
- Round 249 passed C (`browserVerified: true`). Gate 249 published `dcb7eb1` to both remotes, so stage 1 is done.
- C filed two **Medium** test-strength findings in the round's own test file. They come first (bugs before features). They live in the file this stage extends, so they are fixed here.
- Gate 249's suggestion 6 is a **Medium** regression of round 249, reproduced by B in Chromium (§0.3): Ctrl/Cmd+Shift+Space or Home during a range drag. It is fixed here too.
- Stage 2 is split by behaviour family:
  - **2a (this round):** commands that place or edit something at a position;
  - **2b (next):** navigation. That is Follow (C-R235-02), the Ctrl+←/→ origin and the ruler titles.
- **REGRESSION** is due at the first planning on or after 2026-10-30 (`regression-last.json`: 2026-10-27, round 199). This planning is on 2026-10-29, so it is not due yet. **RETRO** is next due at round 260.

**Read first:** `lessons.md` in full. Directly relevant here:
- **L23** (B's pre-check, §0.2) and **L29** (every recipe was run; every signal is grepped, §0.3);
- **L3** (changed strings → widest-state box rows, C-STATUS-BOX-250 and C-TITLES-250);
- **L44** (one new Saba question, §1.6) and **L45** (the unit stays the reference's Insert Marker);
- **L47/L50** (no focus moves here; §1.7 gives the grep);
- **L51** (no new status write, only changed texts; §1.4);
- **L39** (screen budget: nothing persistent is added);
- **L11** (STOP), **L31** (timeouts), **L26** and **L28** (doc 191 becomes stage 2 of 3);
- **L48** (playback timing rows include the 50 ms lead).

**Not this round (sequenced, not dropped):**
- **SABA-B-10a stage 2b** (§7):
  - C-R235-02 Follow pause and resume (Live 6.2);
  - the Ctrl+←/→ origin while stopped (B-R250-NAV-ORIGIN) with the `noneAfter`/`noneBefore` copy;
  - the ruler and range titles that still say "click = playhead" (B-R250-PLAYHEAD-TITLES);
  - the seconds-ruler role (SABA-Q-TIME-RULER-ROLE).
- **SABA-B-10b:** the visible flashing marker. It also retires the hidden signal node (GATE249-S4) and adds the sheet rows for Shift+Space and Ctrl/Cmd+Shift+Space (GATE249-S7).
- **SABA-B-9:** the Stop button, double-click Stop and the "Stop" label (B-R249-PAUSE-LABEL).
- **SABA-B-11c.** SABA-B-7 waits for Saba (`awaiting_user`).
- **REGRESSION-ROUND-2026-10-30.**
- **The rest of ABL-R-10** (M while playing ignores a selection and does not open the name field). It stays in REVIEW-RECOMMENDATIONS.
- **The protected purchased route** (SRW-21, `deferred_user`).
- **New Lows go to `deferred_low_polish` (D-29z439):** GATE249-S3, A-R249-REVIEW-IM14-VACUOUS and A-R249-REVIEW-SETINSERT-SCRUBREF.

## 0. Baseline and scope

**Start state:**
- HEAD = `dcb7eb14127850eecad45f373cdebba2258ee95e`: gate 249 `published`, its `commit`. See `b-round-249/head-at-planning.txt`.
- `git status --short --untracked-files=all` is **empty** at planning (`b-round-249/git-status-at-planning.txt`).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. In that case, re-hash them and continue.

**Frozen:** `b-round-249-r250-tree-sha256.txt`, **1,097** files. That is every tracked file (1,114), minus the 13 granted files and the 4 root files.
- From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-249-r250-tree-sha256.txt` gave rc 0 at planning.
- Each of the 7 protected auth and purchase files appears exactly once (checked):
  - `app/routes/studio.$productId.tsx`;
  - `app/routes/api.studio-token.ts`;
  - `app/routes/account.downloads.tsx`;
  - `app/lib/__tests__/download-routes.test.ts`;
  - `app/lib/auth.ts`;
  - `app/contexts/AuthContext.tsx`;
  - `app/entry.server.tsx`.
- Also frozen:
  - `ArrangementRuler.tsx` (its dead `onSeek` destructure is GATE249-S3, deferred);
  - `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementLibrary.tsx`, `ArrangementVideoDock.tsx`;
  - `position-store.ts`, `grid.ts`, and the clipboard and model libraries;
  - every other test file;
  - every implementation doc except doc 191;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-249-r250-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`), with start hashes in `b-round-249-r250-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-249-r250-grants.txt`; start hashes in `b-round-249-r250-grants-start-sha256.txt`)
The applied diff is `b-round-249/precheck-scratch.diff`: sha256 `928c4950d8ff6de5d6ee6fec33a3dcbb8871fdb705efa6d7ef8f5193c5fe2811`, grants 1–12, against HEAD `dcb7eb1`. On the clean store tree, `git apply --check -p1` gives rc 0. **A may apply it as is**, then write grant 13.

| # | Path | Change (`git diff --numstat`) |
|---|---|---|
| 1 | `app/contexts/ArrangementContext.tsx` | +39/−22. <ul><li>New export `type PlaybackStartOrigin = 'insert-marker' \| 'selection' \| 'playhead'` and a private `PLAYBACK_START_SUBJECT` map.</li><li>`playPastEndMessage(position, end, origin)` gains a required `origin`.</li><li>`startPlaybackAt(current, origin)`: `togglePlayback` passes `'selection'` (time-selection start) or `'insert-marker'`; `continuePlayback` passes `'playhead'`; `playFrom` passes `'insert-marker'` (start and refusal).</li><li>New `getLocatorPosition()`: `isPlayingRef ? livePosition() : insertMarkerRef.current`. It is on the context value and in `ArrangementContextValue`.</li><li>`pasteClipboard` (`at`), `addSourceToActiveTrack` (`desired`) and both `splitSelection` branches without a range (`time`) read `insertMarkerRef.current` instead of `livePosition()`. `livePosition` leaves those three dep lists.</li><li>`splitPlayheadOutside` → `splitInsertMarkerOutside`.</li></ul> |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | +2/−2. In the Space branch, Ctrl/Cmd+Shift+Space calls `moveInsertMarkerToPlayhead` only when `!current.isPointerGestureActive()`. Home calls `returnToStart` only when it is not on a separator and no pointer gesture is active. `preventDefault` still runs in both cases (B-R250-GESTURE-KEYS). |
| 3 | `app/components/arrangement/ArrangementMarkerRow.tsx` | +3/−2: `beginAddMarker` reads `getLocatorPosition()` (the time-selection start still wins). `stepMarker` is unchanged (stage 2b). |
| 4 | `app/components/arrangement/ArrangementTransport.tsx` | +3/−1: the Split title uses `splitAtInsertMarkerTitle` (Biome wraps it). |
| 5 | `app/lib/arrangement/strings.ts` | +19/−7. <ul><li>`playPastEnd({ subject, position, end })`.</li><li>New plain strings `startPointInsertMarker` `'Insert marker'`, `startPointSelection` `'Time selection start'` and `startPointPlayhead` `'Playhead'`.</li><li>New split copy: `splitMissesSelection`, `splitNeedsTarget`, the renamed `splitInsertMarkerOutside` and `splitAtInsertMarkerTitle`.</li><li>Marker `addTitle`.</li></ul> Exact text is in §1.3. |
| 6 | `app/lib/arrangement/shortcuts.ts` | +3/−3: the sheet rows `split`, `marker` and `add-sound` name the insert marker (§1.3). Ids, keys and `ariaKeyShortcuts` are unchanged. |
| 7 | `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` | +168/−7. <ul><li>**IM3** and **IM13** are rewritten (§2.2). IM3's vacuous post-Cmd assert (`toBe('1.000')` with marker = playhead) is replaced by one with separated positions. IM13 now separates the positions before the field presses. Nothing else is removed, and asserts are added.</li><li>**IM11** passes `'insert-marker'`.</li><li>New describe `SABA-B-10a stage 2a edit commands at the insert marker (D-29z436)` `{ timeout: 15_000 }` with **IM15–IM21**.</li><li>Import of `studioEditStrings`.</li></ul> |
| 8 | `app/lib/arrangement/__tests__/strings.test.ts` | +30/−12: <ul><li>the three new plain strings in `EXPECTED_V02B_PLAIN_STRINGS` (ST10);</li><li>the edit and marker literals (ST6, ST28);</li><li>three `playPastEnd` samples (ST12);</li><li>exact texts for all three subjects and `playPastEndMessage` with each origin (ST11).</li></ul> |
| 9 | `app/lib/arrangement/__tests__/ArrangementContext.test.ts` | +6/−2: the D-27 row "refuses Play beyond the end …" expects the `'insert-marker'` subject (Space after `seekTo(5)`). Its paste-at-5 assert is unchanged and still passes (the marker is 5). |
| 10 | `app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | +5/−3: BR8 and BR13 (×2) pass `'insert-marker'`, because the scrub strip is `playFrom`. |
| 11 | `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | +1/−1: NS1, the Split title text. |
| 12 | `app/lib/arrangement/__tests__/marker-strings-ui.test.tsx` | +1/−1: MS1, the Add-marker title text. |
| 13 | `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md` | The whole doc (L34). <ul><li>l.4 becomes exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 250 PASS)` (L28).</li><li>The title line may name stages 1–2.</li><li>Stage 2a is added to every section (§2.3).</li></ul> |

- **No test assertion is removed without a stronger replacement.** Every changed expectation is a text or signature update with the same meaning. The one replaced assertion is IM3's vacuous post-Cmd `toBe('1.000')`: it became the separated-positions check, and its red proof is A-MU-CTRL-ONLY.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (playback start);
  - `REACT_CONTEXT.md` (a new value member);
  - `AGENT_DISCOVERABLE_CODE.md`: new names `PlaybackStartOrigin`, `getLocatorPosition`, `splitInsertMarkerOutside`, `splitAtInsertMarkerTitle`, `startPoint*`;
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B extracted HEAD to `/tmp/b250-scratch` with `git archive` (outside the repo) and applied the change there. Scripts: `b-round-249/proto_stage2a.py` (source) and `proto_tests_2a.py` (tests).
- **Static checks:** `npx tsc --noEmit` rc 0 (`b-round-249/tsc.log`). `npx biome check` on the 12 files is clean (after `--write`, which is in the diff).
- **Collision scan (v1: source only, HEAD tests):** the whole suite gave **3,113/3,123** (`proto-full-v1.json`). The 10 red rows are all text or signature collisions, and each one is granted:
  - the D-27 row in `ArrangementContext.test.ts`;
  - BR8, BR13 and IM11;
  - MS1 and NS1;
  - ST6, ST10, ST11 and ST28.

  **No existing test pinned paste, add, split or M after a Stop:** no behaviour row went red. IM15–IM18 add that coverage.
- **Whole suite on the final scratch, run by B, not A or C:** 215 files, **3,130/3,130** green (`proto-full-final.json`). That is the HEAD count of 3,123 plus IM15–IM21.
- **Covering set** (`b-round-249/covering.txt`): **123 files**. It is every `app/**` test file matching `grep -rlE "StudioWorkspace|ArrangementProvider|ArrangementContext|ArrangementLane|ArrangementRuler|ArrangementTransport|ArrangementMarkerRow|togglePlayback|seekTo|playFrom|Space|'Home'|\{Home\}|pasteClipboard|splitSelection|addSourceToActiveTrack|playPastEnd|shortcuts|studioEditStrings|studioMarkerStrings"`. It equals round 249's 122 files plus `collection.test.ts`.
- **Timeouts (L31):**
  - in the final run the slowest IM row is IM7, 788 ms against 15 s;
  - the `insert-marker-ui` file took 4.06 s in gate 249's `verify.log`;
  - the slowest covering tests are still CP12a–d, about 8 s against 30 s;
  - nothing is near 50 %.
- **L50 focus grep:** the regex `onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)` over every added or removed source line of grants 1–6 in `precheck-scratch.diff` gives **0 hits**.
- **Red proofs.** All runs used grants 7–12. Script: `b-round-249/mutants/run-mutants.sh <fixed-scratch> <logdir>` (set `MUTANTS="…"` to run a subset), with the mutants in `mutate.py`. MU-HEAD was run by hand: the 6 source files from `dcb7eb1`, with the new tests. Summaries: `mutants/logs/summary.txt` and `mutants/logs-pastend/summary.txt`. The runs used copies `/tmp/b250-mut-*`, so no server saw a mutant.

| Run | Change | Red rows |
|---|---|---|
| FIX-CONTROL | none | none |
| MU-HEAD | the 6 source files from `dcb7eb1` | IM15, IM16, IM17, IM18, IM20, MS1, NS1, ST6, ST10, ST11, ST28. IM3, IM13, IM19 and IM21 stay green at HEAD; this is explained under the table |
| MU-PASTE-LIVE | paste reads `livePosition()` | **IM15** |
| MU-ADD-LIVE | add reads `livePosition()` | **IM16** |
| MU-SPLIT-ONE-LIVE | the one-clip split reads `livePosition()` | **IM17** |
| MU-SPLIT-MULTI-LIVE | the several-clips split reads `livePosition()` | **IM17** |
| MU-M-LIVE | `getLocatorPosition` = `livePosition()` (HEAD's M) | **IM18** |
| MU-M-MARKER | `getLocatorPosition` = the marker even while playing | **IM18** |
| MU-STARTAT-PLAYHEAD-SUBJECT | `startPlaybackAt` ignores its origin | **D-27 row (AC), IM11, IM19** |
| MU-PLAYFROM-PLAYHEAD-SUBJECT | `playFrom` refuses with `'playhead'` | **BR8, BR13** |
| MU-SHIFT-AS-MARKER | Shift+Space passes `'insert-marker'` | **IM19** |
| MU-SELECTION-AS-MARKER | Space with a selection passes `'insert-marker'` | **IM19** |
| MU-NO-GESTURE-GUARD-CS | Ctrl/Cmd+Shift+Space without the gesture check | **IM20** |
| MU-NO-GESTURE-GUARD-HOME | Home without the gesture check | **IM20** |
| A-MU-CTRL-ONLY | the Ctrl/Cmd+Shift branch accepts only `ctrlKey` | **IM3** (green in round 249: A-R249-REVIEW-IM3-CMD closed) |
| C-MU-LEAK-CS | the typing-target guard lets Ctrl/Cmd+Shift+Space through | **IM13** (green in round 249: A-R249-REVIEW-IM13-LEAK closed) |
| C-MU-LEAK-SHIFT | the guard also lets Shift+Space through | **IM13** |
| MU-SCRUBEND-NO-RANGE-CLEAR | a stopped handle step writes the marker without clearing the selection | **IM21** |

- **MU-HEAD notes:**
  - IM3 and IM13 are test strengthenings. HEAD's product already works, so their red proofs are A-MU-CTRL-ONLY and C-MU-LEAK-*.
  - IM19 and IM11 compute their expected text with the helper under test, so the subject is pinned by ST11's exact texts and the caller mutants.
  - IM21 pins stage-1 behaviour (GATE249-S1).
- **A weak mutant, kept as evidence:** MU-PASTEND-ONE-SUBJECT mutated the helper itself, and only ST11 and the D-27 row went red. Rows that compute their expectation with the helper cannot see it, so the caller mutants above replace it. Recorded as a RETRO-260 candidate.

### 0.3 Recipes and measurements (L29)
**Browser probes.** Chromium 143 (Playwright), a fresh context per case. Each case waits for `Demo collection ready`, then adds `demo-stem-pulse`: click `[data-source-id="demo-stem-pulse"]`, then the first `Add…` button, then blur. It lands on Music at 0–16 s with 120 BPM, Snap on.
- HEAD was measured on `:5173`. The fix ran on `:5174` from `/tmp/b250-scratch`, with per-entry `node_modules` symlinks so that `.vite` stayed local. That server is now stopped.
- **Script:** `b-round-249/edit-probe-250.cjs <base> <out.json> [caseRegex]`. Cases: `paste`, `split`, `markerM`, `enterAdd`, `pastEnd`, `gestureGuard`, `splitPlaying`, `addPlaying`, `splitNoTarget`. Box and sheet measurements: `box-probe-250.cjs`.
- **Signals:**
  - the playhead is `[data-testid="arrangement-playhead-handle"]` `aria-valuenow`;
  - the marker is `[data-testid="arrangement-insert-marker"]` `data-insert-marker` (renders unconditionally next to the playhead line, `StudioWorkspace.tsx` `ArrangementInsertMarkerSignal`);
  - a clip's start is `[data-clip-id]` `data-clip-start` (`ArrangementClip.tsx` l.866, always rendered), and its track is the closest `[data-track-id]`;
  - flags are `[data-testid="arrangement-marker"]` `aria-label` (`Marker “Marker 1” — 00:02.000`);
  - a time selection is `[data-testid="arrangement-range"]`;
  - playing means the button `aria-label="Pause"` exists.
- **Recipe facts (run by B):**
  - A **clip-body click at y = 75 % of the Music clip's height** selects it and moves the marker and the playhead (stopped). Do not click in the upper half: a press there can start a clip move (round 249 neighbour probe).
  - An **empty-lane click** on SFX moves both, makes SFX the active track, and leaves no clip selected (`splitNoTarget`: 0 selected).
  - A **drag in the clip's lower part** (y = 75 % of the clip box) from 6 s to 8 s makes a time selection while the button is held. An empty-lane drag makes none (HEAD `gestureGuard` attempt 1: `range` false, kept).
  - **Enter on a focused library row** (`[data-source-id="demo-soft-impact"]`) adds the sound to the active track.

| Case (both viewports) | HEAD `dcb7eb1` | Fix (scratch) | Files |
|---|---|---|---|
| clip-body click at 8, Ctrl+C; SFX lane click at 2; Space, 1.5 s, Space (stop 3.483); Ctrl+V | `sfx@3.483`, status `Paste (1): at 00:03.483 · on the SFX track.` | **`sfx@2.000`**, `Paste (1): at 00:02.000 · on the SFX track.` | `edit-head.json`, `edit-proto.json` |
| clip-body click at 5; play/stop (6.491 / 6.483); Ctrl+E | `music@6.491`, `Clip split at 00:06.491.` | **`music@5.000`**, `Clip split at 00:05.000.` | same |
| the same, but Ctrl+E while playing (playhead 6.47) | split at 6.491 | **split at 5.000**; playback continues (7.002) | `edit-head-2.json`, `edit-proto-2.json` |
| ruler 2; play/stop (3.483); M, Enter | `Marker 1 — 00:03.483` | **`00:02.000`**, `Marker “Marker 1” added at 00:02.000.` | `edit-*.json` |
| then Space, 1.2 s, M, Enter (playing) | `00:03.160` | `00:03.172` / `00:03.160` (the live position; unchanged) | same |
| SFX lane click at 3; play/stop (4.491); Enter on the Soft impact row | `sfx@4.491` | **`sfx@3.000`**, `“Soft impact” added to the SFX track at 00:03.000.` (curly quotes, as rendered) | same |
| the same, Enter while playing (≈4.48) | `sfx@4.651` / `4.642` | **`sfx@3.000`**; still playing | `edit-*-2.json` |
| ruler 18 (end 16); Space; Shift+Space | `Playhead (00:18.000) is past …` for both | Space: **`Insert marker (00:18.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.`**; Shift+Space: `Playhead (00:18.000) …` | `edit-*.json` |
| ruler 2; play/stop (3.48); pointerdown on the Music clip at 6 s (y 75 %), move to 8 s; Ctrl+Shift+Space; Home; pointerup | mid-drag: marker **0.000**, playhead **0**, selection gone; after pointerup still gone (**B-R250-GESTURE-KEYS**) | marker `2.000`, playhead 3.483, selection kept mid-drag and after pointerup | `edit-head-gesture.json`, `edit-proto.json` |
| SFX lane click at 3 (nothing selected); Ctrl+E | `To split, select a clip and place the playhead inside it, or make a time selection.` | `To split, click inside a clip to select it and place the insert marker, or make a time selection.`: 16 px, one line, `scrollWidth = clientWidth` (1416 / 1256) | `edit-*-2.json` |
| status box after Space at 18 | 16 px, one line | 16 px, one line (1416 / 1256) | `box-head.json`, `box-proto.json` |
| `?` sheet rows | `Split at the playhead or the selection` 20 px; `Add a marker at the playhead` 20 px; `Add the selected sound at the playhead` 40 px | the insert-marker texts: 20 / 20 / 40 px, equal heights, no overflow | same, `shots-box-*` |

- **Every case had 0 page errors.**
- **Invalid attempts, kept:**
  - `edit-proto-attempt1-timeout.log`: the first cold load of `:5174` timed out waiting for "Demo collection ready". It was re-run.
  - HEAD `gestureGuard` attempt 1 dragged on an empty lane, which makes no selection. It was re-run on the clip (`edit-head-gesture.json`).
- **Code facts (grep at `dcb7eb1`):**
  - `grep -n "livePosition()" app/contexts/ArrangementContext.tsx` gives l.1036 (stop), l.1139 (tick), l.1462 (marker → playhead), l.1567 (add), l.1961/1985 (split) and l.2249 (paste). Only add, split and paste change. The marker row's `getLivePosition` users are `beginAddMarker` l.249 (changes) and `stepMarker` l.269 (stage 2b). The video dock's l.465 follows the playhead (unchanged).
  - `grep -rn "playPastEndMessage\|pb.playPastEnd" app` gives the six granted test call sites and the two context call sites.
  - Copy that names the playhead: `grep -n "playhead" app/lib/arrangement/strings.ts` gives l.113, 118, 119, 143, 229, 356, 365, 367, 493, 494, 496 and 672. Stage 2a changes l.113, 118, 119, 143, 229 and 496. l.356, 365 and 367 describe the playhead handle, zoom and ruler and stay. l.493, 494 and 672 are stage 2b (B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES).

## 1. Rulings

### 1.1 Which position each command uses (D-29z437)
| Command | Stopped | Playing | Reference |
|---|---|---|---|
| Paste (Ctrl+V) | Insert Marker | Insert Marker | Live 6.9: editing is selection-based, and a click in the background "selects a point in time, represented by a flashing insert marker". **No manual sentence says where Paste lands:** "no reference found" (searched ch. 6 and ch. 42 captures), an inference from 6.9 |
| Library add (Enter, double-click, Add button = `addSourceToActiveTrack`) | Insert Marker | Insert Marker | `transport-grid-review.md` §10a (approved 2026-10-28). See the ABL-R-6 note below |
| Ctrl+E, no time selection, one clip or several | Insert Marker | Insert Marker | Live 6.12: "click anywhere within a clip's waveform … then use the shortcut Ctrl+E … to divide the clip at that location" |
| M (add a marker) | time-selection start, else the Insert Marker | time-selection start, else the **playback position** | Live 6.4: "while transport is not running, a locator will be added at the insert marker location or at the start of the time selection"; set "in real time during playback" |
| Ctrl+E with a time selection | the selection edges (unchanged) | unchanged | Live 6.12 |
| Ctrl+←/→ | unchanged in 2a (reads the playhead) | unchanged | stage 2b (B-R250-NAV-ORIGIN) |

- **The ABL-R-6 note.** Saba's 2026-10-25 answer says "Enter or double-click adds at the playhead on the active track". It was written under D-15 (one position). His 2026-10-28 approval of the review replaces D-15, and the review lists Enter-add under `insertMarker`. While stopped, before any Stop, the two are the same point. Recorded under D-29z437, on the ABL-R-6 entry, and as SABA-Q-10A-DEVIATIONS (e) so that Saba sees it once (§1.6).
- **Paste and Ctrl+E while playing.** Ctrl+E while playing was probed in the browser (§0.3). Paste while playing was not probed separately. It is the same source line as paste stopped (`const at = insertMarkerRef.current`), with no playing branch, and MU-PASTE-LIVE pins it in jsdom. C records one paste while playing as info (C-PASTE-250).
- **M while playing keeps opening the name field** and still prefers the selection start. The rest of ABL-R-10 is its own approved task in REVIEW-RECOMMENDATIONS.

### 1.2 The past-end refusal names its start point (D-29z438)
| Origin | When | Subject |
|---|---|---|
| `'insert-marker'` | Space with no time selection; scrub-strip click; flag double-click or "Play from here" | `Insert marker` |
| `'selection'` | Space with a time selection | `Time selection start`. Today this is reachable only through the API, because a selection lies inside a clip. Covered in jsdom (IM19); there is no browser row |
| `'playhead'` | Shift+Space | `Playhead` |

### 1.3 Exact strings (grants 5–6)
- `playPastEnd({ subject, position, end })`: `` `${subject} (${position}) is past the end of the project (${end}) — there is nothing to play here. Home returns to 0.` ``
- `startPointInsertMarker`: `Insert marker`. `startPointSelection`: `Time selection start`. `startPointPlayhead`: `Playhead`.
- `splitMissesSelection`: `The insert marker does not cross any selected clip.`
- `splitNeedsTarget`: `To split, click inside a clip to select it and place the insert marker, or make a time selection.`
- `splitInsertMarkerOutside` (renamed from `splitPlayheadOutside`): `The insert marker must be inside the selected clip.`
- `splitAtInsertMarkerTitle` (renamed from `splitPlayheadTitle`): `studioShortcutTitle('Split at the insert marker', 'split')`, which renders `Split at the insert marker (Ctrl+E)`.
- Marker `addTitle`: `Add a marker at the time selection start, the insert marker, or the playback position while playing (M)`.
- Sheet rows (`shortcuts.ts`):
  - `split`: `Split at the insert marker or the selection`;
  - `marker`: `Add a marker at the insert marker`;
  - `add-sound`: `Add the selected sound at the insert marker`.

### 1.4 Status writes (L51)
**No new status write and no moved write.** Only texts change: the past-end subject, the split refusals and the clip-add or paste time (now the marker's time).
- The paste, split and add statuses are written synchronously by the same action, as at HEAD.
- The clobber class is unchanged: these are action statuses, and any later action status replaces them.
- C-R236-01 (a past-end status stays after playback starts) is a deferred Low and unchanged.

### 1.5 Side effects kept (L49)
- `startPlaybackAt` gains only the `origin` parameter, used in the refusal text. Its body order is unchanged (round-249 §1.5 list).
- `pasteClipboard`, `addSourceToActiveTrack` and `splitSelection` keep every step: `refuseEditDuringGesture`, refusals, `applyEdit` history labels, selection, `setRange(null)` and statuses. Only the time source changes.
- The gesture guards keep `preventDefault` and the `event.repeat` check, so a key during a drag neither scrolls nor reaches a focused button.

### 1.6 Saba questions (L44, D-29z441; `awaiting_user`, non-blocking)
- **SABA-Q-10A-DEVIATIONS gains (e)** (reconciliation, made visible to Saba): ABL-R-6 (2026-10-25) says "Enter or double-click adds at the playhead". Round 250 follows the later review approval (2026-10-28), so the add point is the Insert Marker. It is identical while stopped and differs only after a Stop or a click during playback. Keep?
- **SABA-Q-10A-DEVIATIONS gains (d).** M while playing is not quantized. Live 6.4 says locators set during playback follow the global launch quantization (also the transcript `tBfi` 0:57–1:16, whose CHECK is resolved here against the manual). CZABA has no launch quantization.
- The existing SABA-Q-10A-HOME-PLAYING, SABA-Q-10A-CTRL-ARROW-RANGE (gate 249 S2 asks to keep it) and SABA-Q-TIME-RULER-ROLE are unchanged.

### 1.7 Focus (L47/L50)
No action in this stage unmounts the focused element or moves focus.
- M opens the name editor exactly as at HEAD; only its time changes.
- The L50 grep (§0.2) gives 0 hits.
- The gesture guards return before any action, so focus stays where it was. C-GESTURE-250 records `document.activeElement` before and after.

### 1.8 Findings closed by this round
- **A-R249-REVIEW-IM3-CMD** and **A-R249-REVIEW-IM13-LEAK** (Medium, test strength): IM3 and IM13 now separate the marker and the playhead before the Cmd or field presses. Their red proofs come from A's and C's own mutants.
- **B-R250-GESTURE-KEYS** (Medium, GATE249-S6): reproduced at HEAD (§0.3), fixed by grant 2.
- **GATE249-S1** (Low): pinned by IM21.
- **C-EDIT-DIVERGE-249** and **C-R249-INFO-PASTEND-WORDING** (info): this round's scope.

## 2. Changes

### 2.1 Source (grants 1–6)
Exactly the diff.
- No new dependency.
- New exports: `PlaybackStartOrigin`, plus the strings and `getLocatorPosition` on the context value.
- `ArrangementContextValue` gains 1 member. No test mocks the full value; `tsc` gives rc 0 on the whole scratch.

### 2.2 Rows (grants 7–12)
| Row | Case | Expected |
|---|---|---|
| IM3 (rewritten) | play/stop from 2; Ctrl+Shift+Space; ruler 1, play 1.5 s, stop; **Cmd**+Shift+Space; Space; +2 s; Ctrl+Shift+Space while playing | marker = first stop point, with the exact status; after the second stop (> 2) the marker is still `1.000`; Cmd+Shift → marker = second stop point, with its exact status; Space plays from it; while playing the marker > second stop + 1.5 and playback continues |
| IM11 | as in round 249 | `playPastEndMessage(18, 16, 'insert-marker')` |
| IM13 (rewritten) | play/stop from 2 (stop > 3); Ctrl+Space; in the tempo field Shift+Space, Ctrl+Shift+Space and Cmd+Shift+Space; blur; Alt+Space | not playing; marker `2.000`; the playhead equals the stop point; Alt+Space plays from 2 |
| IM15 | select h1, copy; ruler 2, play 1.5 s, stop; active Music; paste | the new clip is on Music at **2**; the status contains `00:02.000` |
| IM16 | play/stop from 3 (stop > 4); active Music; add `hit`; Undo; Space; +1 s (live > 3.5); add `hit` | Music clip at **3** both times |
| IM17 | copy h1 to Music at 0; ruler 5, play/stop (stop > 6); select h1; Ctrl+E; Undo; select both; Ctrl+E; ruler 18; select h1; Ctrl+E | `splitDone('00:05.000')`, SFX starts [0, 5]; `splitClipsDone({count: 2, time: '00:05.000'})`; `splitInsertMarkerOutside` |
| IM18 | play/stop from 2; M, Enter; blur; Space; +2 s; M, Enter | markers contain **2**; while playing a marker in (3.5, 4.5) |
| IM19 | selection 17–18; Space; ruler 18; Shift+Space; Space | `'selection'`, `'playhead'` and `'insert-marker'` texts in that order, with no playback |
| IM20 | play/stop from 2; selection 5–7; `beginPointerGesture()`; Ctrl+Shift+Space; Home; release; Home | during the gesture: marker `2.000`, playhead = stop point, the selection kept; after release Home → marker `0.000`, selection null |
| IM21 | ruler 3; selection 5–7; handle → (stopped) | selection null; marker `3.100` |
| BR8, BR13 | as before | `'insert-marker'` subject (strip = `playFrom`) |
| D-27 row (`ArrangementContext.test.ts`) | `seekTo(5)`, Play | `'insert-marker'` subject; paste still lands at 5 |
| NS1, MS1, ST6, ST10, ST11, ST12, ST28 | strings | the §1.3 texts |

### 2.3 Doc 191 (grant 13)
- Path `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md`. Georgian, with technical terms in English.
- The seven TEMPLATE headings stay in order (L26).
- l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 250 PASS)` (L28).
- Add stage 2a to each section:
  - `## კონტექსტი`: C-EDIT-DIVERGE-249, the two Mediums and GATE249-S6.
  - `## მიდგომა`:
    - the §1.1 table, the §1.2 origins and the 2a/2b split (D-29z436);
    - the rejected alternatives: one generic "Start point" subject, which loses which point it is; M while playing at the marker, which breaks ABL-R-10 and Live 6.4 real time; moving Ctrl+←/→ in 2a, which would need the 4-file `noneAfter` copy now and belongs to navigation;
    - measured facts (§0.3) kept apart from inference (paste placement: no reference found).
  - `## არქიტექტურა`: extend the Mermaid diagram with `getLocatorPosition` and the three command readers.
  - `## შეცვლილი ფაილები`: add the round-250 files.
  - `## პრობლემები და გადაწყვეტები`, Problem → Solution:
    - the gesture keys (B-R250-GESTURE-KEYS);
    - IM3 and IM13 vacuity;
    - the helper-mutant weakness (MU-PASTEND-ONE-SUBJECT).
  - `## ტესტირება`: IM3, IM11, IM13, IM15–IM21, BR8, BR13, ST11, and the §0.2 runs. Cite only rows that exist (grep the ids, L26).
  - `## TODO / შემდეგი ნაბიჯები`: stage 2b (C-R235-02, B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES, SABA-Q-TIME-RULER-ROLE), 10b, 9, the Saba questions, and GATE249-ARCH-TRANSPORT-POSITIONS.
- `grep -rn 'In Progress (stage' docs/implementation` at planning gives 2 hits:
  - doc 176, tied to PERF-HARNESS-SHARED-LIB-b-ii;
  - doc 191, tied to SABA-B-10a stage 2b.

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- [AV] the Live 12 Reference Manual ch. 6, https://www.ableton.com/en/live-manual/12/arrangement-view. Capture `b-round-71/ableton-arrangement-view-20261021.txt`; 6.4, 6.9 and 6.12 were re-read on 2026-10-29.
- [KS] ch. 42, https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/. Capture `b-round-71/ableton-shortcuts-20261021.txt`; 42.5 Editing (Cut/Copy/Paste Ctrl+X/C/V) was re-read.
- The tutorial notes `reference/youtube/SABA-B-9-10-11-transcripts.md` (root, 2026-10-28).

| Behaviour | Source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Split without a selection | AV 6.12 | "click anywhere within a clip's waveform … Ctrl+E … divide the clip at that location" | At the Insert Marker (the click point), stopped or playing | C-SPLIT-250 |
| Locator (marker) when stopped | AV 6.4 | "while transport is not running … at the insert marker location or at the start of the time selection" | Same | C-M-250 |
| Locator while playing | AV 6.4 | "in real time during playback"; "Locators are quantized according to the global launch quantization" | The live position, not quantized (⚖, SABA-Q-10A-DEVIATIONS (d)) | C-M-250 |
| Paste position | AV 6.9 (selection-based editing; a background click selects a point shown as the insert marker); KS 42.5 Paste Ctrl+V | **no sentence on where Paste lands**: inference | At the Insert Marker on the active track | C-PASTE-250 (parity: inference) |
| Add from the browser | no reference found in ch. 6 or 42 for Enter-to-Arrangement (searched "insert marker", "Enter", "browser") | — | At the Insert Marker (approved review §10a) | C-ADD-250 (parity: n/a) |
| Past-end refusal text | no reference found; a CZABA-only status (D-27) | — | A CZABA status; it names the start point | C-PASTEND-250 |
| Keys during a drag | no Live text | — | Ignored during a pointer gesture, like the other transport keys (KeyO, zoom) | C-GESTURE-250 |

- **Deviations (⚖):**
  - M while playing is not quantized (asked in (d));
  - M while playing still opens the name field (ABL-R-10's own task);
  - the marker is time-only (already SABA-Q-10A-DEVIATIONS).

  "Simpler to build" is not the reason for any of them.
- **Better than Live (claim to test):** the refusal names which start point was refused, and the split refusal says how to place the marker.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):** HEAD, empty status, and `sha256sum -c` on the frozen 1,097 list, the root list and the grant start list.
2. **Apply** `b-round-249/precheck-scratch.diff` (`git apply -p1`), then write grant 13.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–12 clean; `npm run lint` rc 0.
4. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-249/covering.txt)`. Expect 123 files, all green. B's final full run gives the per-file counts in `proto-full-final.json`. Any test above 50 % of its timeout is a STOP at the top of the report (L11).
5. **Mutants:**
   - Make a fixed scratch copy outside `store/`: `git archive` of HEAD plus the 12 changed files.
   - Run `b-round-249/mutants/run-mutants.sh <scratch> <logdir>` (17 runs).
   - Run MU-HEAD by hand: put the 6 source files back from `git show dcb7eb1:<file>` and run the 6 test files.
   - Expect exactly the red rows of §0.2.
   - The repo `git status` must be identical before and after.
6. **code-reviewer:** run it on the diff (3+ files). Pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Run a copy of `b-round-249/edit-probe-250.cjs` (all cases); do not edit it in place. Expect the "Fix" column of §0.3.
8. **Report:** write `a-round-250.md` with:
   - the hunks;
   - the tests run, with counts;
   - the mutants;
   - the reviewer result;
   - any STOP, at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row.
- Wait for `Demo collection ready` (L48), then add `demo-stem-pulse` (the §0.3 recipe).
- Use the §0.3 recipe facts for the clicks: a click at y = 75 % of the clip's height selects it and places the marker, and an empty-lane click picks the track.
- Give every ruler click its own x, with ≥ 850 ms between clicks (INFO-B248-RULER-DBLCLICK).
- Compare with a HEAD control server (`git archive dcb7eb1`, on another port, with its own `.vite`, stopped after use) where the row says "HEAD".

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-250 | HEAD, status, hashes | <ul><li>HEAD is `dcb7eb1`.</li><li>Status is exactly `M` on grants 1–13, with nothing else.</li><li>`sha256sum -c` on `b-round-249-r250-tree-sha256.txt` (1,097) and on the root list gives rc 0.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD -- app` equals `b-round-249/precheck-scratch.diff` file by file.</li></ul> |
| C-UNIT-250 | `b-round-249/covering.txt` (123 files) | All green, including IM1–IM21, BR4b, BR8, BR13, ST6/10/11/12/28, NS1, MS1 and the D-27 row. The full suite is a gate row. |
| C-MUT-250 | the 18 runs of §0.2 (17 scripted plus MU-HEAD), once each, on a scratch copy outside the repo | The red rows are as listed. The repo status is identical before and after. |
| C-PASTE-250 | clip-body click at 8 s on Music (y = 75 % of the clip's height), Ctrl+C; SFX lane click at 2 s; Space, 1.5 s, Space; Ctrl+V | A new SFX clip has `data-clip-start` `2.000`, and the status reads `Paste (1): at 00:02.000 · on the SFX track.` HEAD: 3.48. Info, not a pass condition: undo, Space, and Ctrl+V after 1 s while playing; record where it lands (expected 2.000). |
| C-SPLIT-250 | clip-body click at 5 s, y = 75 % of the Music clip's height; play/stop; Ctrl+E. Then a fresh context: the same click, Space, Ctrl+E after 1.5 s while playing | Stopped: Music clips at `0.000` and `5.000`, status `Clip split at 00:05.000.` Playing: split at `5.000` and playback continues. HEAD: 6.49. |
| C-SPLIT-REFUSAL-250 | SFX lane click at 3 s (nothing selected); Ctrl+E | The exact `splitNeedsTarget` text (§1.3), on one line. |
| C-ADD-250 | SFX lane click at 3 s; play/stop; focus the Soft impact library row, Enter. A fresh context: the same, with Enter while playing | An SFX clip at `3.000`, status `“Soft impact” added to the SFX track at 00:03.000.` (curly quotes, as rendered), both times; playing continues. HEAD: 4.49 / 4.65. |
| C-M-250 | ruler 2 s; play/stop; M, Enter. Then blur, Space, 1.2 s, M, Enter | The first flag is at `00:02.000`. The second is at the live position (3.0–3.4 s) while playing continues. HEAD: the first is at 3.48. |
| C-PASTEND-250 | ruler 18 s (end 16); Space; Shift+Space; then the scrub strip clicked past the end | Space: `Insert marker (00:18.000) is past …` (exact §1.3 text). Shift+Space: `Playhead (00:18.000) …`. Strip: `Insert marker (…) …`. No playback. |
| C-GESTURE-250 | ruler 2 s; play/stop; pointerdown on the Music clip at 6 s, y = 75 % of the clip's height, move to 8 s at the same y; Ctrl+Shift+Space; Home; pointerup | Mid-drag and after pointerup: marker `2.000`, playhead = the stop point, `[data-testid="arrangement-range"]` present. `document.activeElement` is unchanged by the keys. HEAD: marker 0, the selection lost. |
| C-CMD-250 | after a stop with marker ≠ playhead, Meta+Shift+Space (CDP `metaKey`, not a Mac) | The marker equals the stop point, with the exact status. A real Mac stays on TLM-R249-MAC-CMD-SHIFT-SPACE. |
| C-KEYS-250 | with the marker and playhead separated: Space, Shift+Space, Ctrl+Shift+Space and Meta+Shift+Space typed in the BPM field and in the library search | No playback, marker and playhead unchanged. |
| C-TITLES-250 | Split button title with no selection; the marker Add button title; the `?` sheet rows `split`, `marker` and `add-sound` | The exact §1.3 texts. Row heights equal HEAD (20 / 20 / 40 px) and there is no overflow, at both viewports. |
| C-STATUS-BOX-250 | L3: the longest new statuses (the C-PASTEND-250 Space text and `splitNeedsTarget`) | One 16 px line, `scrollWidth = clientWidth`. The transport is not covered. Record the heights. |
| C-BUDGET-250 | L39 | Persistent text lines outside the timeline equal round 249: empty 85/69, demo 101/85 at 1440/1280. |
| C-HANDLE-RANGE-250 | a selection made by a clip drag 5→7 s; focus the playhead handle; → (stopped) | The selection disappears and the marker moves +0.1 (browser twin of IM21). |
| AN-REVIEW-250 | Doc 191 | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z436…438 and the rejected alternatives are explained.</li><li>Every cited row exists.</li><li>The TODO lists stage 2b, 10b, 9 and the questions.</li></ul> |
| LAB-SMOKE-250 | `/studio-lab` | It loads. Space plays and stops; Space again plays from the marker. The export WAV after adding `demo-stem-pulse` has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94` (unchanged; the export reads neither position). 0 page errors. |
| Auth | Standing check | In a fresh context: <ul><li>`/studio-lab` opens anonymously, with `auth_user` null;</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`;</li><li>`/api/studio-token` with no header returns 401.</li></ul> |
| Purchased origin (browser) | The edit commands on the purchased copy | BLOCKED: backend unavailable in cloud. The grants add no origin branch. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

**Ableton parity** (C states it separately from the CZABA requirement):
- **Confirmed:** split (6.12) and M stopped (6.4).
- **Deliberate deviation:** M while playing (not quantized).
- **Inference:** paste.
- **Not applicable:** the past-end text and the gesture keys.
- **Unconfirmed:** add from the browser.

A test PASS does not prove parity.

## 6. Neighbouring behaviour that could break (C probes these first)
- **Paste:**
  - after a ruler click while stopped: the marker equals the playhead, so it lands at the click (SP14 and all-lane clipboard rows stay green in the covering set);
  - all-lane paste (Ctrl+Shift+L range copy) and the overlap refusal texts.
- **Add:** a library drag-and-drop still lands at the drop point (`dropLibrarySource`, unchanged), and the double-click on a library row adds at the marker.
- **Split:** a time-selection split (`splitRangeDone`) and the all-tracks refusal are unchanged. Undo labels are `Split` and `Split at time selection`.
- **Markers:**
  - `M` on an existing marker time focuses that flag (MU4);
  - the name editor focus;
  - Ctrl+←/→ still steps from the playhead (stage 2b; record any surprise as info).
- **Transport:**
  - Space, Shift+Space and Ctrl+Shift+Space outside gestures behave as in round 249 (IM1–IM14);
  - Home while playing still jumps (SABA-Q-10A-HOME-PLAYING);
  - KeyO, zoom and the other gesture-guarded keys are unchanged.
- **The export, video sync, history labels, clip drag and trim** are unchanged. Any change there is a regression.

## 7. Next (D-29z443)
- **PASS and gate:** SABA-B-10a stage 2a is done. These close:
  - A-R249-REVIEW-IM3-CMD, A-R249-REVIEW-IM13-LEAK, B-R250-GESTURE-KEYS and GATE249-S1;
  - C-EDIT-DIVERGE-249 and C-R249-INFO-PASTEND-WORDING.
- **FAIL on a product row:** a fix-up on the same grants first.
- **Then:**
  1. REGRESSION-ROUND-2026-10-30 at the first planning on or after 2026-10-30. It carries every `scope_additions` entry, including C-INSERT-MARKER-249 and the new C-EDIT-MARKER-250.
  2. Else SABA-B-10a **stage 2b**:
     - C-R235-02 Follow (Live 6.2: "Follow will pause if you … click on the beat-time ruler. Follow will start again once you stop or restart playback, or click in the Arrangement or clip scrub area");
     - B-R250-NAV-ORIGIN;
     - B-R250-PLAYHEAD-TITLES;
     - the seconds-ruler role;
     - doc 191 → `Completed (C round N PASS)`.
  3. Then SABA-B-10b, SABA-B-9 and SABA-B-11c. SABA-B-7 runs when Saba answers.
- **Checkpoints (non-blocking):**
  - The new signal GATE249-ARCH-TRANSPORT-POSITIONS will be requested as ARCH-CHECKPOINT-TRANSPORT-POSITIONS at the 10a/10b boundary.
  - ARCH-CHECKPOINT-TEMPO-GRID and ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS are still unanswered (`b-round-248-checkpoint-request.md`).
  - None blocks this round. Its owner is `ArrangementContext`, and the StudioWorkspace change is two guards.
