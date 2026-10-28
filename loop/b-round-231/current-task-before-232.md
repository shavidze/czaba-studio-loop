# Round 231: SABA-B-8 CALM-2b — one-line detail empty state, a shorter dismissible library notice, a first-run status that teaches, and the active empty-lane hint (+ RT-FIX-231)

**Planned by:** B, at the round 230 → 231 planning, 2026-10-28. **Decisions:** D-29z299…D-29z305.
**Type:** feature stage, the **final stage of CALM-2** (2a = round 229, done). Saba decision 2 (policy "SABA-B-8 Calm Studio"):
- "the Clip details empty state becomes one line, and the fields keep their geometry";
- "the library notice becomes one line ('Synthetic demo stems — not CZABA catalogue audio.'), and the viewer can dismiss it (remembered per browser)";
- "the first-run status teaches drag, Enter and `?`";
- "the DUX-R-4(a) empty-lane hint shows only on the active empty lane and only before the first clip".

**Read first:** `lessons.md` in full (B, A and C). **L26 changed at this planning** (C-R230-01); read the new wording. These lessons apply directly:
- L4 (§2 rulings);
- L12 (no class pins; `sr-only` is checked in the browser, not by a class assertion);
- L11, L32 and L33 (STOP);
- L23 (pre-check done, §0.2);
- L26 and L28 (doc headings and status lines, §2.8);
- L29 (every named signal and recipe was run, §0.3);
- L31 (§0.3);
- L39 (this round adds one empty-state line and removes others; C counts, §3);
- L40 (changed testid elements, §0.3).

**Not this round:**
- CALM-3: the Overview empty state and Ctrl+Alt+O. The Overview and the dock stay byte-identical (GATE229-S2 waits for CALM-3).
- DUX-R-4(b)/SYS-5: disabled reasons that are reachable by keyboard. The detail panel keeps its native `disabled` fields; this round keeps their reasons in the accessibility tree (§2.2) and does no more.
- The screen-review candidates SR-230-1…10. They await Saba. In particular, the "Synthetic demo ·" labels on the library cards (SR-230-6, `SYNTHETIC_COLLECTION_LABEL`) and the "Active track:" line (SR-230-7) stay unchanged.
- Rewording "Active track:" as "Adds to …". This is not in Saba's decision 2 (D-29z287 stands).

## 0. Baseline and scope

**Baseline:** HEAD = `5da0f506a8d09d851cf34fe7d663b1c4a223b2eb`. Gate 230 has status `skipped` (C taskStatus FAIL in a no-code RETRO round), so the baseline stays the gate-229 commit.
- At the start, `git status --short --untracked-files=all` must be empty (B checked it: `b-round-230/git-status-at-planning.txt`).
- If HEAD differs, or any path is dirty at the start: **STOP** (L11).
- One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-230-r231-tree-sha256.txt` lists 1,065 tracked files: every tracked file except the 18 grants and the 4 root files. Run it from `store/`; it gives rc 0 at planning. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx` and `entry.server.tsx`;
- `.claude/**`, `CLAUDE.md` and every config file;
- `StudioWorkspace.tsx`, `ArrangementVideoDock.tsx`, `ArrangementOverview.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementTransport.tsx`, `shortcuts.ts`, `ArrangementContext.tsx` and `track-layout.test.tsx`.

**Root-owned, must equal HEAD:** `b-round-230-r231-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Their start hashes are in `b-round-230-r231-root-files-start-sha256.txt`.

### 0.1 Grants
- The list is `b-round-230-r231-grants.txt`. Start hashes are in `b-round-230-r231-granted-start-sha256.txt`; start copies are in `b-round-230/granted-start/`.
- The new files are listed in `b-round-230-r231-new-files.txt`.

| # | Path | What may change |
|---|---|---|
| 1 | `app/lib/arrangement/strings.ts` | Exactly §2.1. Nothing else. |
| 2 | `app/lib/arrangement/collection.ts` | The two `ready` strings (§2.4). Drop the now-unused `studioLibraryPanelStrings` import. |
| 3 | `app/data/studio-lab-demo.ts` | `studioLabDemoCollection.notice` only (§2.3). `SYNTHETIC_COLLECTION_LABEL` and every other line stay. |
| 4 | `app/components/arrangement/ArrangementDetailPanel.tsx` | §2.2 only: remove `DETAIL_NOTHING_SELECTED`; `headerLabel` is `''` when nothing is selected; the two reason `<p>` elements get `sr-only` in the none state. |
| 5 | `app/components/arrangement/ArrangementLane.tsx` | §2.5: the audio empty-lane hint, and the video Solo `title` → `studioLaneStrings.videoSoloTitle` (§2.6). Nothing else. |
| 6 | `app/components/arrangement/ArrangementLibrary.tsx` | §2.3: the notice row with its dismiss button, the `useSyncExternalStore` read, and the imports these need. Nothing else. |
| 7 | `app/lib/arrangement/__tests__/strings.test.ts` | ST36, ST41 and ST49 maps, key lists and the count (22 → 23), as in `b-round-230/precheck-tests.py`. **New case ST-C2b** (§2.7). |
| 8 | `app/lib/arrangement/__tests__/collection.test.ts` | PC9: the two `ready` literals and the `toContain('(Enter or Add)')` line. **New case PC10** (§2.7). |
| 9 | `app/lib/arrangement/__tests__/collection-load-status.test.tsx` | The `DEMO_READY` and `PURCHASED_READY` literals only. |
| 10 | `app/lib/arrangement/__tests__/purchased-collection-ui.test.tsx` | The two ready literals only. |
| 11 | `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | `DEMO_READY` and LRS5's `toContain` line only. **No new cases** (L31, D-29z303). |
| 12 | `app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx` | DPS1: the header label becomes `''` and the hint gets the new literal. |
| 13 | `app/lib/arrangement/__tests__/detail-panel.test.tsx` | The hint literal (l.400) only. |
| 14 | `app/data/__tests__/studio-lab-demo.test.ts` | DL-VAL: the notice literal only. |
| 15 | `app/lib/arrangement/__tests__/detail-panel-reason.test.tsx` | **New case RF7** (§2.7). Existing cases stay unchanged; RF3 must stay green as written. |
| 16 | `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` | **New case LSU9** (§2.7). LSU8 additionally asserts the video Solo `title` equals `studioLaneStrings.videoSoloTitle`. |
| 17 | `docs/implementation/2026/quarter-IV/178-calm-2a-canvas-dock-copy.md` | l.4 → exactly `**სტატუსი:** Completed (C round 231 PASS)` (L28: the final stage of CALM-2). Add **one** sentence in `## პრობლემები და გადაწყვეტები` or `## მიდგომა` (GATE229-S5): the empty overlay `div` is still `absolute inset-0 z-20`, so it still catches the pointer, and that is why drag and float did not change. |
| 18 | `docs/implementation/2026/quarter-IV/170-perf-16a-mp3-mediabunny.md` | l.4 → exactly `**სტატუსი:** Completed (C round 221 PASS)` (D-29z297). Nothing else. |
| N1 | `app/lib/arrangement/library-notice.ts` | **New.** §2.3. |
| N2 | `app/lib/arrangement/__tests__/library-notice-ui.test.tsx` | **New.** §2.7. |
| N3 | `docs/implementation/2026/quarter-IV/179-calm-2b-detail-library-firstrun.md` | **New** (number 179 is free at planning). §2.8. |

Nothing else changes.

### 0.2 B's collision pre-check (L23, done)
- **Scratch:** `/tmp/b231` = `git archive 5da0f50`.
- **App edits:** B applied §2.1–§2.6 with `b-round-230/precheck-apply.py`.
  - `tsc` was clean: no test imports a deleted key, so no typecheck-only collision exists this time. B checked this explicitly (L23, deleted export `nothingSelected`): `grep -rn nothingSelected app` finds only the `strings.test.ts` literal map.
  - Biome `--write` reflowed 2 files.
- **Sweep:** `npx vitest run app` on the scratch → **8 files, 19 tests red, 2,961 green** (`b-round-230/l23-sweep-raw.log`):

  | File | Red cases | Cause |
  |---|---|---|
  | strings | ST36, ST41, ST49 | maps, key lists and the count |
  | collection | PC9 | ready literals |
  | collection-load-status | LS3, LS3b, LS4 ×2, LS5, LS6, LS7, PM1 | ready literals |
  | purchased-collection-ui | PW2, PW5, PW6 | ready literals |
  | library-row-strings-ui | LRS5 | ready literal |
  | detail-panel-strings-ui | DPS1 | header and hint literals |
  | detail-panel | "disables the inputs … no selection …" | hint literal |
  | studio-lab-demo | DL-VAL | notice literal |

  Every red case is pinned copy or a key list; none is a behaviour failure.
- **After the test fixes** (`b-round-230/precheck-tests.py`, both rounds): the 8 files plus 11 neighbours → **19 files green** (`b-round-230/l23-precheck-fixed.log`, then the 3-file re-run).
  - The 11 neighbours are detail-panel-reason, lane-strings-ui, track-layout, clip-gain-fader, clip-gain-multi, clip-gain-pointer-preview, clip-gain, detail-panel-fit, markers-ui, panel-radius-ui and pending-status.
  - The second round of fixes covers PC9 and LRS5 `toContain('(Enter or Add)')`, the ST41 key list and the ST49 count; the first run found them.
  - `tsc` rc 0 and Biome clean after the fixes.
- **Reference diff:** `b-round-230/precheck-scratch.diff` (36 hunks, 15 files). A may use it, and A owns the result. It does not contain the new cases of §2.7 or the docs.
- **`e2e/` and `perf/` (frozen, run by the gate):** `grep -rnE "Nothing selected|Select a clip|synthetic demo|library-notice|Choose a track|collection ready|Enter or Add" e2e perf` → 0 hits. `perf/` detects "ready" by the enabled Add button and the preview wave, not by the status text.
- **Browser recipe check (L29), on the scratch at both viewports** (`b-round-230/probe-calm2b.mjs` → `probe/scratch.json`, baseline `probe/baseline.json`):
  - **Enter adds:** fresh page, click at (5, 5), press Enter → 1 clip on Music at 00:00.000.
  - **Drag adds:** `dragTo` of the first library option onto the SFX lane → 1 clip on SFX.
  - **The hint follows the active lane:** clicking the Stems name button moves the hint to Stems; clicking the Video name button leaves 0 hints.
  - **The hint returns after Undo:** Ctrl+Z back to 0 clips → 1 hint again.
  - **Dismiss:** focus moves to `arrangement-library-search`. The key `czaba-studio-notice-dismissed:studio-lab-demo` = `1`. After a reload the notice is absent, with 0 `layout-shift` entries. A fresh context shows it again.
  - 0 page errors.
- **Box check:** C's `c-round-229/bbox-after.mjs`, run on base and scratch → `b-round-230/bbox/delta.txt`. The allowed deltas in C-BBOX-231 come from it.

  > **Incident:** B's first copy of that script still had C's hard-coded output folder. Three runs rewrote `c-round-229/after-full-S0-*.png` (3–4 bytes each; the JSON files came out byte-identical). B restored both PNGs with `git checkout` in the loop repo and re-ran the script into `b-round-230/bbox/`. `git status -- c-round-229/` is clean.

### 0.3 Render conditions, timeouts and testids (L29, L31, L40)
**L29, the signals this task names:**
- `arrangement-detail-header-label` renders always. After this round its text is `''` when `selection === null && group === null`.
- `arrangement-detail-hint` renders in the none state (DetailPanel l.917). `arrangement-detail-reason` and `arrangement-detail-clip-gain-reason` render when `inputsReason` or `clipGainReason` is non-null. In the none state they sit in the input column (l.986) and in the Clip Gain column (l.1028).
- `arrangement-library-notice` renders when `collection.notice` is set, and after this round also when the notice is not dismissed. Only the demo collection sets `notice` (`grep -rn "notice" app/data app/lib/arrangement/collection.ts`).
- `arrangement-lane-empty-hint` is new; its condition is in §2.5. The lane already reads `arrangement.clips` (Lane l.226), so no frozen file is needed.
- The `[data-track-id]` lane rows exist (Lane l.692).
- Global Enter adds the selected sound to the active track when the target is not a button, slider or separator (StudioWorkspace l.2072–2081, frozen). The library option's Enter adds too (Library l.298).

**L31, times in the gate-229 `verify.log`** (no `testTimeout` is configured, so the default is 5 s per test):

| File | File time | Slowest test |
|---|---|---|
| library-row-strings-ui | 4.1 s | LRS4 1,756 ms (35 %) |
| lane-strings-ui | 3.7 s | — |
| detail-panel | 3.7 s | — |
| detail-panel-reason | 1.3 s | — |

- In B's loaded full-suite scratch sweep, LRS4 took 3,003 ms (60 %) and LSU1 1,881 ms (38 %).
- **Ruling (D-29z303):** library-row-strings-ui gets no new rows; the notice cases go to the new N2.
- If any test in a file you add rows to (lane-strings-ui, detail-panel-reason, strings, collection) runs above 50 % in your covering run, that is a STOP (L32).

**L40, changed elements that carry a `data-testid`:**
- `arrangement-detail-header-label` (its content);
- `arrangement-detail-hint` (its content);
- `arrangement-detail-reason` and `arrangement-detail-clip-gain-reason` (their class, none state);
- `arrangement-library-notice` (a new wrapper row and a narrower box);
- the lane body (a new child).

A greps `arrangement-detail-header-label|arrangement-detail-hint|arrangement-detail-reason|arrangement-detail-clip-gain-reason|arrangement-library-notice|arrangement-lane-empty-hint|arrangement-video-dropzone|arrangement-library-search` in `app/**/__tests__` and adds every hit file to the covering set. B's hits at `5da0f50` are 12 files, all already in the 19 pre-check files of §0.2: clip-gain-fader, clip-gain-multi, clip-gain-pointer-preview, clip-gain, detail-panel-fit, detail-panel-reason, detail-panel-strings-ui, detail-panel, markers-ui, panel-radius-ui, pending-status and track-layout. The `arrangement-library-search` part adds 8 more: delete-selection-ui, fader-guards, floating-video, library-focus-handoff, library-video-return-focus, studio-theme-obsidian, track-group-collapse-ui and track-groups-ui (all green in B's full scratch sweep; library-row-strings-ui and markers-ui are already listed). They join the covering set.

### 0.4 RT-FIX-231 (round 230 close-out, no app code)
- `lessons.md` changed only at the header history line and L26, and the final newline was restored (C-R230-01, N2; D-29z299). The before copy is `b-round-230/lessons-before-231.md`.
- `user-review/screen-review-230.md` gained an appended addendum (N3, N4; D-29z300). Every byte before it equals `b-round-230/screen-review-230-before-231.md`.
- A does not touch either file.

## 1. Why
- Saba (2026-10-28): the Studio screen is overloaded (`calm-studio-review.md` §1, §4). CALM-1 and CALM-2a removed the shortcut line and the canvas and dock sentences. This stage finishes the empty-project copy.
- **Measured on the baseline at S0 (rows of text, `b-round-230/probe-rows.mjs`):**
  - **1440×900, 8 rows:** status 1, "Nothing selected" 1, hint 1, two visible "Select a clip first" 2, and the library notice 3 (48 px).
  - **1280×720, 5 rows** (the detail panel starts collapsed): status 1, "Nothing selected" 1, notice 3.
- **After, on the scratch:**
  - **1440×900, 5 rows:** status 1, hint 1, notice 2, lane hint 1.
  - **1280×720, 4 rows:** status 1, notice 2, lane hint 1.
- The status now teaches drag, Enter and `?`. Today drag is not written anywhere (ABL-B-1, DUX §1 T1).
- **Why we missed it:** no new Saba-found issue in this stage. SABA-B-8's section is `tasks/round-226.md` §1.1, with lesson L39.

## 2. Changes

### 2.1 `strings.ts` (exact)
| Object.key | Before | After |
|---|---|---|
| `studioDetailStrings.nothingSelected` | `Nothing selected` | **deleted** (no consumer after §2.2; one source) |
| `studioDetailStrings.noSelectionHint` | `Select a clip to see its details` | `Select a clip to edit its time selection and Clip Gain.` (calm doc l.45) |
| `studioDetailStrings.noneReason` | `Select a clip first` | unchanged (fields' `title` and the sr-only reason) |
| `studioLaneStrings.videoSoloTitle` (new, after `videoMuteTitle`) | — | `` `Solo — ${STUDIO_VIDEO_MIX_LABEL} (Ctrl/Cmd+click = add to solo)` `` → `Solo — Original video sound (Ctrl/Cmd+click = add to solo)` (GATE229-S3) |
| `studioLaneStrings.audioEmptyHint` (new, after `videoEmptyHint`) | — | `Drag a sound here, or press Enter to add it` |
| `studioLibraryPanelStrings.dismissNotice` (new, after `clearSearch`) | — | `Dismiss this notice` |

- Wording of the lane hint: it uses the same verbs as the status and as Live 4.10 ("dragged and dropped … into tracks"; "pressing Enter … will load the item onto whatever track is currently selected"). It has no trailing full stop, like the video hint next to it (`No video — use … or drop a file here`).
- The value of `videoSoloTitle` equals today's `soloLabel(STUDIO_VIDEO_MIX_LABEL)`, so the video Solo title the user sees does not change; only its source does.

### 2.2 Detail panel empty state (`ArrangementDetailPanel.tsx`)
| State | Header label | Body line | Reasons ("Select a clip first") | Fields |
|---|---|---|---|---|
| none (no clip, no group) | `''` (the element stays; "Clip details" `h2` stays) | `arrangement-detail-hint` = the new `noSelectionHint`, the **only** visible line | both `<p>` keep their `id`, text and column, and get `sr-only`. `aria-describedby` of From, To, Apply and Clip Gain still resolves to them | unchanged: disabled, `title` = `Select a clip first`, same boxes |
| one clip, group, video | unchanged | unchanged | unchanged and **visible** (group and video reasons are different texts and stay visible, RF1, RF2, RF6) | unchanged |

- Use `cn('text-dim', isNoneState && 'sr-only')` or equivalent. Do not change the `isGroupState` or video branches.
- **Why `sr-only` and not deletion (L4, D-29z301):** the reasons are the `aria-describedby` targets of four disabled fields. Deleting them would remove the only non-hover reason, which SYS-5 is about to strengthen. `sr-only` keeps them in the accessibility tree and removes 2 visible rows.
- **Why the line lives in the body and the header is empty:** at 1280×720 the panel starts collapsed. A sentence in the header would stay permanently visible there, while the body line shows only when the panel is open (the quieter home, L39). The calm doc places the line in the panel body (l.45).
- **Geometry (D-29z302):** the field boxes keep x, y and w ±1 px. The one allowed change is `arrangement-detail-apply` height 18 → 24 px at 1280×720 when expanded. On the baseline the visible reason squeezed it; `probe/baseline.json` vs `probe/scratch.json`.

### 2.3 Library notice and dismiss (`studio-lab-demo.ts`, `ArrangementLibrary.tsx`, new `library-notice.ts`)
- **Text:** `studioLabDemoCollection.notice` = `Synthetic demo stems — not CZABA catalogue audio.` (Saba's exact wording).
- **Rows, a measured fact (D-29z301):** the sentence is 291 px wide at the Studio's 12 px text. The library content box is 264 px at the default 288 px library width, and 236 px beside the dismiss button. It therefore renders as **one sentence on 2 rows** (32 px; it was 3 rows, 48 px). Do not shrink the font, truncate or change the wording.
  - Saba's "one line" read as one visual row cannot be met with his exact wording at the default width. B records it as `SABA-Q-NOTICE-ONE-ROW` (awaiting_user): keep it, use a shorter wording, or widen the library.
- **Row markup:** a `div` (`flex items-start gap-1`) holds:
  - the `p` (`data-testid="arrangement-library-notice"`, `min-w-0 flex-1 text-xs text-muted`, no truncation);
  - a `button type="button"` (`data-testid="arrangement-library-notice-dismiss"`, `aria-label` and `title` = `studioLibraryPanelStrings.dismissNotice`). It copies the search-clear button pattern (Library l.478–487): `flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted hover:text-foreground`, with `<X className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />`. There is no custom focus class: the global SABA-B-4 `:focus-visible` ring applies.
- **Click** (or keyboard activation of the button) → `dismissLibraryNotice(collection.id)`, then `librarySearchInputRef.current?.focus()`, so focus never falls to `body`.
- **`library-notice.ts` contract:**
  - `libraryNoticeStorageKey(id)` = `czaba-studio-notice-dismissed:${id}`. It is per collection and per browser, and it holds no personal data.
  - `readLibraryNoticeDismissed(id)`: `true` if the in-memory set has the id, or `localStorage.getItem(key) === '1'`. It returns `false` on the server (`typeof window === 'undefined'`) and when storage throws.
  - `dismissLibraryNotice(id)`: adds the id to the in-memory set, tries `localStorage.setItem(key, '1')` (a storage error is swallowed, and the notice still hides for this page), then notifies the subscribers.
  - `subscribeLibraryNoticeDismissal(listener)` returns an unsubscribe function.
  - No `any`, no `as`, no comments except a TODO. B's sketch is in `precheck-scratch.diff`.
- **Read:** `useSyncExternalStore(subscribeLibraryNoticeDismissal, () => readLibraryNoticeDismissed(collection.id), () => false)`. The server snapshot is "visible" because `/studio-lab` is server-rendered (`curl` shows the notice in the HTML). In a dismissed browser the notice is in the server HTML and is removed during hydration. This is the honest minimum; C records it (C-NOTICE-231).
- Test isolation: the in-memory set is module state. Tests that dismiss must use a distinct collection id or `vi.resetModules()`; do not add a test-only export.

### 2.4 First-run status (`collection.ts`)
| Origin | Before | After |
|---|---|---|
| demo | `Demo collection ready. Choose a track and add a sound (Enter or Add).` | `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` |
| purchased | `Purchased collection ready. Choose a track and add a sound (Enter or Add).` | `Purchased collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` |

- One pattern for both origins (L4). The purchased text is checked by unit tests only, because the route needs the backend.
- `?` is the key of the shortcut sheet: `shortcuts.ts` l.158, `{ id: 'shortcuts', keys: ['?'] }`. PC10 pins that parity (§2.7).
- The status is a one-time status: it is replaced by the next action (unchanged).

### 2.5 Active empty-lane hint (`ArrangementLane.tsx`, DUX-R-4(a))
- **Markup:** inside the lane body, just before the `isFileDragOver` block, mirroring the video hint (Lane l.883–887):
  ```
  !isVideo && isActive && density !== 'folded' && arrangement.clips.length === 0 && !isFileDragOver && libraryGhost === null
  → <p className="pointer-events-none sticky left-56 flex h-full max-w-md items-center px-3 text-sm text-muted" data-testid="arrangement-lane-empty-hint">{studioLaneStrings.audioEmptyHint}</p>
  ```
- **"Only before the first clip" (D-29z301):**
  - The rule is project-level, not lane-level: the hint shows while the arrangement has 0 clips of any kind (a video clip counts).
  - It returns when the project is empty again, for example after Undo or deleting every clip. It is an empty-state line (one of L39's quieter homes), not a one-time tip.
  - It needs no new stored state. B chose this as the smallest honest reading; Saba can ask for "never again after the first clip".
- **Only on the active lane:** exactly one hint, on the active **audio** track. The video track keeps its own action hint (calm doc l.38, keep), so when Video is active there is no audio hint.
- **Hidden** while a library drag ghost or an OS file drag is over that lane (the ghost and the drop text take that place), and on a folded lane.
- **`pointer-events-none`:** the lane background keeps every gesture. A drag on the hint area still makes a time selection.

### 2.6 GATE229-S3 (`ArrangementLane.tsx`)
The video Solo `title` reads `studioLaneStrings.videoSoloTitle`. The audio Solo `title` stays `soloTitle`, and the `aria-label` stays `soloLabel(mixLabel)`.

### 2.7 Tests: new and changed cases
**ST-C2b (`strings.test.ts`):**
- `'nothingSelected' in studioDetailStrings` is false.
- `noSelectionHint`, `audioEmptyHint` and `dismissNotice` equal the §2.1 literals.
- `videoSoloTitle` equals `studioLaneStrings.soloLabel(studioLaneStrings.videoMixLabel)`.

**PC10 (`collection.test.ts`):** for both origins, `ready` ends with `` `Press ${findStudioShortcut('shortcuts')?.keys[0]} for shortcuts.` ``, contains `Drag a sound onto a track` and `press Enter to add it`, and does not contain `(Enter or Add)`.

**RF7 (`detail-panel-reason.test.tsx`)**, real workspace, nothing selected:
- the header label `textContent` is `''`;
- the hint `textContent` is the new `noSelectionHint`;
- From, To and the Clip Gain field have `aria-describedby` that resolves (`document.getElementById`) to an element with text `Select a clip first`;
- after `selectClip`, the header label is the clip title and the reasons are gone.

Do not assert the `sr-only` class (L12). Whether the reasons are visually hidden is checked in the browser (C-DETAIL-231).

**LSU9 (`lane-strings-ui.test.tsx`)**, real workspace:
1. Fresh: exactly one `arrangement-lane-empty-hint`. `closest('[data-track-id]')` is the Music lane, and the text is `audioEmptyHint`.
2. After making Stems active (its name button `studioLaneStrings.activeTrackLabel('Stems')`): one hint, in Stems.
3. After making Video active: 0 hints.
4. Music active again, then one clip added (`addSourceToActiveTrack` or the Add button): 0 hints. After Undo: 1 hint, in Music.
5. **Folded:** the active Music lane folded with its fold button → 0 hints.

**Fallback (no STOP):** if step 5 cannot be reached in this mount, assert 1–4 only; C-LANEHINT-231 covers the fold in the browser. A says which variant it wrote.

**LSU8:** add one line, `video Solo title === studioLaneStrings.videoSoloTitle`.

**N2 `library-notice-ui.test.tsx`** (new):
- **LN1:** the demo workspace shows the notice with the exact text, and a button named `Dismiss this notice`.
- **LN2:** clicking it removes the notice, sets `localStorage['czaba-studio-notice-dismissed:studio-lab-demo'] === '1'`, and focus is on the library search field (`getByRole('searchbox', { name: 'Search the library' })` or its testid).
- **LN3:** with the key preset to `'1'` before the mount, the notice is absent and nothing else in the library changes (the search field and the list render). A preset key for **another** id leaves the notice visible.
- **LN4:** with `Storage.prototype.setItem` throwing, a click still hides the notice for the page.
- **LN5:** `renderToString` of the library (or the workspace) with the key preset contains the notice text: the server snapshot is visible.
- **LN6:** Enter on the focused dismiss button hides the notice and adds **no** clip (the global Enter handler ignores buttons).
- Clean `localStorage` in `afterEach`. Isolate the in-memory set (§2.3).

Rules for every case: no `any`, no `as`, no `@ts-ignore`; narrow with `if (!x) throw new Error(...)`. Find elements by role, name, text or `data-testid` (L12).

### 2.8 Docs
- **Doc 179 (new):** `docs/implementation/2026/quarter-IV/179-calm-2b-detail-library-firstrun.md`, following `docs/implementation/TEMPLATE.md`. Georgian, with English technical terms.
  - l.4, exactly: `**სტატუსი:** Completed (C round 231 PASS)` (L28: CALM-2 has 2 stages and this is the last).
  - Headings per the new **L26**: the seven TEMPLATE headings after `## Prompt`, in order.
  - Content:
    - კონტექსტი: Saba decision 2, and the row counts of §1.
    - მიდგომა: the rulings of §2.2–§2.5: sr-only reasons; the body line; the 2-row notice fact with SABA-Q-NOTICE-ONE-ROW; the dismiss key and the server snapshot; one pattern for both origins; the project-level "before the first clip".
    - შეცვლილი ფაილები: grants 1–16, N1 and N2.
    - პრობლემები და გადაწყვეტები: the `aria-describedby` targets; the hydration flash.
    - ტესტირება: ST-C2b, PC10, RF7, LSU9, LN1–LN6 and the mutants.
    - TODO: CALM-3, SYS-5 and SABA-Q-NOTICE-ONE-ROW.
  - Cite only ids and tests that exist (L26).
- **Doc 178:** grant 17. **Doc 170:** grant 18.
- After this round, `grep -rn 'In Progress (stage' docs/implementation` must give only doc 176, which is tied to the open stage PERF-HARNESS-SHARED-LIB-b-ii (D-29z304).

## 3. Reference: how Ableton Live 12 does it
Sources fetched 2026-10-28 (WebFetch / WebSearch):
- ch. 4 "Working with the Browser", 4.10 "Adding Content from the Browser to a Live Set": https://www.ableton.com/en/live-manual/12/working-with-the-browser/
- ch. 6 "Arrangement View", 6.1 Layout, item 12 "Mixer Drop Area": https://www.ableton.com/en/live-manual/12/arrangement-view/
- ch. 2 "First Steps", 2.2.2 Info View: https://www.ableton.com/en/live-manual/12/first-steps/ (already cited in round 229 R6).
- An Ableton forum thread (2009, Live 8 era) mentions a "Drop Files and Devices Here" area: https://forum.ableton.com/viewtopic.php?p=861782. This is user discussion, not documentation, and not confirmed for Live 12.

| # | Behaviour | Source | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|---|
| R1 | Put a sound on a track by dragging | 4.10: "Items can be dragged and dropped from the browser into tracks in the Session or Arrangement View." | Drag from the browser onto a track places it. | **Match.** The status and the lane hint teach it ("Drag a sound onto a track"). | C-FIRSTRUN-231 |
| R2 | Put a sound on the selected track with a key | 4.10: "In the Arrangement View, double-clicking or pressing Enter on a device or sample in the browser will load the item onto whatever track is currently selected." | Enter or double-click loads onto the selected track. | **Match.** CZABA: Enter (and double-click in the library) adds the selected sound to the active track at the playhead. The status and the hint say "press Enter to add it". | C-FIRSTRUN-231 |
| R3 | Text in an empty part of the Arrangement | 6.1 item 12: "You can add new tracks to the Arrangement by dragging instruments and devices into the Mixer Drop Area underneath tracks." The forum (2009) quotes a "Drop Files and Devices Here" label. | The manual describes a drop **area** that creates a new track. A visible label is **not** stated in the manual (the forum label is a hypothesis for Live 12). | **Deviation:** CZABA has a fixed set of tracks and no "new track" drop area. The hint sits on the active empty lane, and a drop there adds to that lane. Saba's DUX-R-4(a) decision limits it to the active lane before the first clip. | C-LANEHINT-231 |
| R4 | Where help and teaching text lives | 2.2.2: "The Info View displays the name and function of whatever element of the UI that you hover over with the mouse." | Hover help sits in a panel. | **Deviation (existing, round 228 K1):** no Info View. The one-time status line teaches the first steps, and native `title`s carry the rest. "No reference found" for a first-run status message: searched the 4.10, 6.1 and 2.2.2 text. | C-FIRSTRUN-231 |
| R5 | Detail panel with nothing selected | — | No reference found. The Clip View sections were not fetched for an empty state; B does not claim Live's behaviour. | CZABA: one line, fields kept in place and disabled. | C-DETAIL-231 |
| R6 | A dismissible notice in the browser | — | No reference found (Live's browser has no such notice; it is a CZABA demo fact). | CZABA-only: a per-browser dismiss. The fact stays reachable on every library card ("Synthetic demo ·") and in a fresh browser. | C-NOTICE-231 |

**Deviations, listed:**
- English-only labels (policy).
- No Info View (R4).
- The lane hint is on a fixed track, not a new-track area (R3).
- The notice takes 2 rows at the default width (SABA-Q-NOTICE-ONE-ROW).

**Better than Live (claimed carefully):** the very first screen names both ways to place a sound and how to see every key. Live's manual teaches them in a chapter.

**Screen budget (L39):**
- **Adds:** one empty-state-only line, the lane hint. Saba approved it (DUX-R-4(a) inside CALM-2). B rejected the other homes:
  - a tooltip (the user does not know where to hover);
  - the `?` sheet (it does not show where to drop);
  - first-run only (the status is first-run only already and is replaced by the next action; the hint must stay while the lane is the target);
  - the status (it already carries the sentence, but far from the lane).
- **Removes:** 4 rows at 1440 S0 (header, 2 reasons and 1 notice row), and 2 rows at 1280 S0 (header and 1 notice row).
- **Net:** −3 rows at 1440 and −1 at 1280 (§1). C counts them (C-BUDGET-231).

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start:** HEAD is `5da0f50`; `git status --short --untracked-files=all` is empty; `sha256sum -c --quiet` gives rc 0 for the tree, granted-start and root-files lists.
2. `npm run typecheck` rc 0. `npm run lint` rc 0, with no new warnings in the granted files. `npx biome check` on grants 1–16 and N1–N2 is clean.
3. **Covering set:** `npx vitest run` on:
   - the 19 pre-check files (§0.2);
   - N2;
   - every extra hit of the L40 grep (§0.3);
   - every hit of `grep -rlnE "Nothing selected|nothingSelected|noSelectionHint|Choose a track|Enter or Add|synthetic demo|library-notice|audioEmptyHint|videoSoloTitle|dismissNotice|lane-empty-hint" app --include=*.test.*`.

   Everything must be green. Report the per-test times, with any test above 50 % at the top (L32).
4. **Mutants** (restore each one and verify its sha):
   - **MU-1:** `headerLabel` back to a non-empty text in the none state → DPS1 and RF7 red.
   - **MU-2:** drop `arrangement.clips.length === 0` from the hint condition → LSU9 red.
   - **MU-3:** drop `isActive` → LSU9 red.
   - **MU-4:** drop `!isVideo` → LSU9 step 3 red.
   - **MU-5:** `dismissLibraryNotice` does not write storage → LN2 red.
   - **MU-6:** the server snapshot returns `readLibraryNoticeDismissed(...)` → LN5 red.
   - **MU-7:** the demo `ready` string back to the old text → PC10 red.
   - **MU-8:** remove the `sr-only` from the none-state reasons. Name the test that goes red; if none does, write "browser-only: C-DETAIL-231", and do not add a class pin.
   - **MU-9:** the reason `<p>` deleted in the none state → RF7 red (`aria-describedby` no longer resolves).
5. **Optional browser self-check** at 1280×720:
   - the hint is on Music;
   - the notice has 2 rows with the X;
   - with the panel expanded, the only body line is the new hint;
   - after a dismiss and a reload, the notice is gone.
6. **code-reviewer:** run it (21 files). Forward its Architecture notes.
7. **End:**
   - `git status` shows grants 1–18 as `M` and exactly three `??`: N1, N2 and N3;
   - the frozen and root lists give rc 0;
   - write `a-round-231/changed-end-sha256.txt` and `a-round-231/granted-hunks.diff` (diff against `b-round-230/granted-start/`).

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720)
**States:**
- **S0:** a fresh anonymous empty demo (empty storage).
- **S0x:** S0 with the detail panel expanded (at 1280 click `arrangement-detail-toggle`).
- **S1:** one clip added (the first "Add"), then a click at (5, 5); this is exactly the S1 of `b-round-230/text-inventory/inventory.mjs`.
- **SD:** S0, dismiss the notice, reload.

**Tools (copy them; do not edit B's):**
- `b-round-230/probe-calm2b.mjs <base> <outdir> <label>`;
- `b-round-230/text-inventory/inventory.mjs <outdir> <label> <base>`;
- `b-round-230/bbox/bbox.mjs <outdir>` (env `BASE`).

**Text rows:** count with `Range.getClientRects()` unique tops on the element's text nodes, not box height / line-height. The lane hint box is the full lane height.

| Row | What | Pass |
|---|---|---|
| C-SCOPE-231 | HEAD, `git status`, hash lists, hunks | HEAD is `5da0f50`. Grants 1–18 are `M` and N1–N3 are the only `??`. The frozen and root lists give rc 0, and A's `changed-end-sha256.txt` gives rc 0. Protected files: `git diff --quiet HEAD` rc 0. **Hunk scope:** `diff -u b-round-230/granted-start/<path> store/<path>` shows only what §0.1 permits. For grants 1–14 compare with `b-round-230/precheck-scratch.diff`; extra hunks are allowed only for the new cases of §2.7 and the two doc lines. |
| C-UNIT-231 | `npx vitest run` on grants 7–16 and N2 | Green. ST-C2b, PC10, RF7, LSU9 and LN1–LN6 exist. `grep -rn nothingSelected app` → 0. |
| RT-FIX-231 | Round-230 close-out | (1) `diff b-round-230/lessons-before-231.md lessons.md` shows only the header history line, L26 and the final newline; `tail -c1 lessons.md` is `\n`; ≤ 60 lines; three parts. (2) The new L26 is checkable: `python3 -I b-round-230/l26-check.py` gave 171 of 175 at `5da0f50` (B's `b-round-230/l26-check.txt`). After A's doc 179 exists it must give **172 of 176**; the non-passing docs in both runs are exactly 005, 006, 009 and 076, which predate the rule. (3) `screen-review-230.md`: the bytes before `## დამატება — round 231` equal `b-round-230/screen-review-230-before-231.md`. N3 says ~0:18 at 1280. The N4 table cites `calm-studio-review.md` l.44, l.46, l.50 and l.152, and each cited line says what the table claims. |
| C-TEXT-231 | `inventory.mjs` after-run, diffed against `b-round-230/text-inventory/before.json` as a multiset of `(region, text)` | Exactly the entries of `b-round-230/text-inventory/diff-before-vs-scratch.txt`, per key; nothing else. In 1440-S0: −2× reason, −header, −old hint, −old notice, −old status; +new hint, +lane hint, +new notice, +new status. 1280-S0 and both S1 have the subsets listed there. |
| C-BUDGET-231 (L39) | Text rows at S0 (both viewports) and SD | **1440 S0:** 8 → 5 (status 1, hint 1, notice 2, lane hint 1). **1280 S0:** 5 → 4 (status 1, notice 2, lane hint 1). **SD:** the notice rows → 0. The footer line count and line heights equal `b-round-230/bbox/base/geom-after.json` (the status stays 1 row at both viewports); the footer text differs only by the status change. |
| C-BBOX-231 | `bbox.mjs` after, vs `b-round-230/bbox/base/bbox-after.json` (S0, S1) | 0 deltas over 1 px, except exactly those in `b-round-230/bbox/delta.txt`. **Allowed:** library tree, list, folders, option rows and their buttons y −16 (tree and list h +16); `arrangement-library-notice` w −28, h −16; `arrangement-detail-header-label` (empty: y +8, h −16); the two reasons in S0 (sr-only); new `arrangement-lane-empty-hint` and `arrangement-library-notice-dismiss`. `geom-after.json` (footer and scroller) equal to base. |
| C-DETAIL-231 | Detail empty state (S0x both viewports, S1) | **S0x:** <ul><li>the header label is empty;</li><li>the only visible body text is `Select a clip to edit its time selection and Clip Gain.`;</li><li>both reasons are in the DOM with text `Select a clip first`, and they are visually hidden (box ≤ 1×1 px, or clipped);</li><li>CDP `Accessibility.getPartialAXTree` (or `getFullAXTree`) of From, To and Clip Gain gives description `Select a clip first`;</li><li>`title` is unchanged;</li><li>field boxes equal base ±1 px, except Apply h 18 → 24 at 1280.</li></ul> **S1:** <ul><li>the header shows the clip title;</li><li>the field boxes do not move between S0x and S1 (±1 px).</li></ul> **Group** (Ctrl+click two clips): the range and Clip Gain reasons are **visible** as before. |
| C-NOTICE-231 | Notice and dismiss | <ul><li>Text exact; 2 rows (32 ±1 px) at the default width. Also record the library width at which it becomes 1 row (drag `arrangement-library-separator`); this is info.</li><li>**Keyboard:** Tab reaches the dismiss button after the search field; its name is `Dismiss this notice`; the SABA-B-4 ring is visible on keyboard focus (outline ≥ 1 px painted, ≥ 3:1 against the panel), and there is no ring after a mouse press.</li><li>**Enter on the focused button:** the notice goes, focus is on the search field, and clips stay 0.</li><li>**Mouse click (fresh context):** the same.</li><li>`localStorage['czaba-studio-notice-dismissed:studio-lab-demo'] === '1'`.</li><li>**SD:** absent after settle. Record the `layout-shift` entries and a screenshot taken as early as possible after `domcontentloaded`. A visible notice flash ≥ 100 ms is a Low finding, not a FAIL.</li><li>A **fresh context** shows the notice again.</li></ul> |
| C-FIRSTRUN-231 | Status and the taught actions (fresh, both viewports) | <ul><li>The status is exactly `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.`;</li><li>a click at (5, 5) then Enter → one clip on Music at 00:00.000;</li><li>in a fresh context, a real-mouse drag of a library option onto the SFX lane → one clip on SFX;</li><li>in a fresh context, `?` → the shortcut sheet opens and Esc closes it.</li></ul> |
| C-LANEHINT-231 | Lane hint | <ul><li>**S0:** exactly one hint, in the Music lane, with the §2.1 text.</li><li>**Active lane:** click the Stems name button → the hint is in Stems; click the Video name button → 0 hints.</li><li>**First clip:** Music active, Enter → 0 hints; Ctrl+Z → 1 hint again.</li><li>**Fold:** fold the active lane → 0 hints; unfold → 1.</li><li>**Gestures:** a real-mouse drag across the hint area makes a time selection, as elsewhere in the lane (the range hint appears).</li><li>**Library drag:** during a drag over the lane (mouse down on an option, move over the lane, screenshot, then drop), the hint is hidden. If Playwright cannot hold an HTML5 drag mid-way, record the method and treat this sub-row as info.</li><li>**1280:** the hint is one text row.</li></ul> |
| C-VIDEO-SOLO-231 | Neighbour | The video Solo `title` is still `Solo — Original video sound (Ctrl/Cmd+click = add to solo)`. The music Solo `title` and every `aria-label` are unchanged. |
| G231-3 | Auth guard | <ul><li>`/studio/middle-east` → "Sign in required", 0 `audio[src]`;</li><li>`/api/studio-token` with no header → 401;</li><li>a fake Bearer → 403 with the `:5199` mock, or 500 without it;</li><li>no token is issued;</li><li>a fresh `/studio-lab` shows the demo badge, and `auth_user` is null.</li></ul> |
| LAB-SMOKE-231 | Add a clip, then Export WAV | 24-bit, 48 kHz, stereo. The RMS segments are identical to C round 230's undone export (−65.21 / −21.59 / −21.54 dB). 0 page errors. |
| AN-REVIEW-231 | Docs | <ul><li>Doc 179 l.4, doc 178 l.4 and doc 170 l.4 are byte-exact.</li><li>Doc 178 gained one sentence (GATE229-S5).</li><li>Doc 179 headings pass `l26-check.py`, and every cited id or test exists.</li><li>`grep -rn 'In Progress (stage' docs/implementation` → only doc 176.</li></ul> |
| C-REF-231 | §3 R1–R6 | Each one is a match or a listed deviation. Any other difference is a bug (Medium if it changes what the user must learn, else Low). |
| C-SHOTS-231 | Calm doc row 12 | Full-window screenshots S0, S0x, S1 and SD, both viewports, after. The before images are `b-round-230/probe/baseline-S0-*.png`, `baseline-S0x-*.png` and C round 229's `after-full-S1-*.png`. |
| gate | full suite, build, lint, `verify`, e2e smoke | Not claimed by C. |

**`browserVerified`:** true only if C-TEXT, C-BUDGET, C-BBOX, C-DETAIL, C-NOTICE, C-FIRSTRUN, C-LANEHINT, G231-3 and LAB-SMOKE ran at both viewports. RT-FIX-231 and AN-REVIEW-231 are document checks.

## 6. Neighbouring behaviour that could break (C probes these first)
- **The global Enter handler:** Enter on the focused dismiss button must not add a clip (LN6, C-NOTICE). Enter in the library search field keeps its behaviour.
- **Library keyboard order:** search → clear (when there is text) → dismiss → tree → list. The library resize separator still works, and the notice re-wraps.
- **The detail panel group and video states:** the reasons stay visible there (RF1, RF2, RF6 unchanged).
- **Lane drag and drop:** a library ghost and an OS file drop still show over an empty active lane. The video lane hint is unchanged.
- **Purchased route:** not mountable in the cloud. Its status text is unit-checked only (PW2, LS*). No protected file is touched.

## 7. Outcomes for B's next planning
- **C PASS and gate PASS:** CALM-2 is done, and RT-FIX-231 closes RETRO 230. Round 232 is **CALM-3** (Overview empty state + Ctrl+Alt+O; it carries GATE229-S2 and the GATE229-S4 C row), if round-232 planning is before 2026-10-30. Otherwise REGRESSION comes first (D-29z305). Then SABA-B-7, SYS-5 and PERF b-ii.
- **C FAIL on a feature row:** a fix-up on the same grants.
- **C FAIL only on RT-FIX-231:** B fixes the loop file; the next round re-checks the changed lines.
- **Gate fail:** B re-runs L23 against the actual tree and grants the fix precisely.

## 8. Root notes
- **Re-forward to Saba:** the addendum at the end of `user-review/screen-review-230.md` (D-29z300), and the new question `SABA-Q-NOTICE-ONE-ROW` (backlog `open_findings`).
- **Still pending and non-blocking:** `b-round-229-checkpoint-request.md` (SABA-B-7 envelope addendum; wanted before SABA-B-7 is dispatched after CALM-3), and the `b-round-211`, `-221` and `-225` requests.
- **Loop folder:** B's planning briefly rewrote two of C's round-229 screenshots and restored them with `git checkout` (§0.2 incident). `git status -- c-round-229/` is clean.
