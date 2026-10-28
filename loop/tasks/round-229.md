# Round 229: SABA-B-8 CALM-2a — move the canvas and dock helper text to quieter homes (BPM, Loop, Overview label, video caption note, empty monitor)

**Planned by:** B, at the round 228 → 229 planning, 2026-10-28. **Decisions:** D-29z285…D-29z291.
**Type:** feature stage. CALM-2 is split into **2a** (this round: the timeline canvas and the dock) and **2b** (the detail panel, the library notice and its dismiss, the first-run status, and the DUX-R-4(a) empty-lane hint). This is a split of Saba's approved scope, not a deferral (D-29z286). Saba decision 2 (policy "SABA-B-8 Calm Studio"): "the BPM and Loop sentences, the video caption note and the 'Arrangement · Overview' label move to tooltip, title, aria or a one-time status; the dock's 'No video added yet' becomes a quiet empty monitor … Facts that move must stay reachable."

**Read first:** `lessons.md` in full (B, A and C). These apply directly:
- L4: one element, one rule (§2.4);
- L8 and L12: no new class pins; tests find elements by role, name, text or `data-testid`;
- L11, L32 and L33: STOP rules;
- L23: B's pre-check is done (§0.2);
- L26 and L28: the doc cites only ids that exist, and its status line is final;
- L29: every signal this task names renders in the stated state (§0.3);
- L31: timeout headroom (§0.3);
- L39: this round **removes** persistent text; C counts it (C-BUDGET-229);
- L40: changed `data-testid` elements (§0.3).

**Not this round:**
- CALM-2b: the detail empty state, the library notice and its dismiss, the first-run status and DUX-R-4(a). It comes after RETRO (round 230).
- CALM-3: the Overview empty state and Ctrl+Alt+O. The Overview itself, its aria-label, its title and every interaction stay byte-identical.
- The DUX-R-4(b) disabled reasons for Split, Undo, Redo and Delete. Only the **Loop** disabled reason is in this round, because the Loop sentence moves there (calm doc §1, row "Loop hint").
- A BPM placeholder "—". Saba's decision does not list it, and DUX-B-3 (field boundary) is its own finding (D-29z287).
- Rewording "Active track:" in the library ("Adds to …"). Saba's decision 2 does not list it (D-29z287).
- Every gate-228 review suggestion (rulings are in `b-round-228.md` §3).

## 0. Baseline and scope

**Baseline:** HEAD = `499c82167aeba92c6edf71af2dd1ddd880b5e098`. Gate 228 has status `published` and pushed it to both remotes.
- At the start, `git status --short` must be **empty**.
- If HEAD differs, or any path is dirty at the start: **STOP** (L11).
- One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-228-r229-tree-sha256.txt` holds 1,067 tracked files: every tracked file except the 15 existing grants and the 4 root files. It gives rc 0 at planning; run it from `store/`. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/lib/auth.ts`, `AuthContext.tsx`, `app/routes/api.studio-token.ts` and `entry.server.tsx`;
- `StudioWorkspace.tsx`, `ArrangementOverview.tsx`, `ArrangementShortcutSheet.tsx`, `shortcuts.ts`, `ArrangementMixFader.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementLibrary.tsx`, `collection.ts`, `studio-lab-demo.ts` and `track-layout.test.tsx`.

**Root-owned, must equal HEAD:** `b-round-228-r229-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes: `b-round-228-r229-root-files-start-sha256.txt`.

### 0.1 Grants (`b-round-228-r229-grants.txt`; start sha in `b-round-228-r229-granted-start-sha256.txt`; start copies in `b-round-228/granted-start/`)
| # | Path | What may change |
|---|---|---|
| 1 | `app/lib/arrangement/strings.ts` | Exactly the §2.1 table: delete 6 entries, add `studioLoopStrings.needsSelectionTitle` and `studioLaneStrings.videoMuteTitle`, and introduce the `STUDIO_VIDEO_MIX_LABEL` constant that `videoMixLabel` and `videoMuteTitle` both read. Nothing else. |
| 2 | `app/lib/arrangement/tempo.ts` | Delete the `TEMPO_EMPTY_HINT` export. Nothing else. |
| 3 | `app/components/arrangement/ArrangementTempoRow.tsx` | The bars ruler renders nothing when `bpm === null` (the hint `span` goes). Remove the `TEMPO_EMPTY_HINT` import. The strip element, its classes and its `data-*` stay. |
| 4 | `app/components/arrangement/ArrangementLoopBrace.tsx` | With no loop, the strip renders no child (the hint `span` goes). Remove `LOOP_HINT`. Nothing else. |
| 5 | `app/components/arrangement/ArrangementTransport.tsx` | Only the Loop button `title` expression (§2.2). Its `disabled`, `aria-pressed`, `aria-keyshortcuts`, classes and children stay. |
| 6 | `app/components/arrangement/ArrangementVideoDock.tsx` | Three changes (§2.3): the "Arrangement · Overview" label `span` goes, and its row gains `min-h-4` so it keeps its 16 px height; the caption shows only the file name; the empty overlay keeps its box and loses its text, gaining `data-testid="arrangement-video-empty"`. Nothing else. |
| 7 | `app/components/arrangement/ArrangementLane.tsx` | On the **video** track only: the Mute, Solo and Volume `title` (§2.4). Audio tracks stay byte-identical. |
| 8 | `app/lib/arrangement/__tests__/strings.test.ts` | ST10, ST17, ST36 and ST50: the literal maps, key lists and the count (17 → 13) follow §2.1. Remove the `TEMPO_EMPTY_HINT` import and the identity line at l.1086. Remove the two `startsWith(middleDot)` lines for the deleted keys. **New case ST-C2a** (§2.5). |
| 9 | `app/lib/arrangement/__tests__/tempo.test.ts` | T10: remove the `TEMPO_EMPTY_HINT` import and its identity line. Nothing else. |
| 10 | `app/lib/arrangement/__tests__/tempo-ui.test.tsx` | U1 and U8: `toContain(TEMPO_EMPTY_HINT)` and the literal become `expect(<strip>.textContent).toBe('')`. U1 gains the "fact stays reachable" line (§2.5) and its title drops "hint". Fix the import. |
| 11 | `app/lib/arrangement/__tests__/tempo-window-ui.test.tsx` | BU7: the same swap to `toBe('')`. Remove the import. |
| 12 | `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | NS4: the loop-strip literal becomes `toBe('')`. **New case NS6** (§2.5). |
| 13 | `app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx` | VDS1: the three dock text lines (§2.5). **New case VDS4** (§2.5). |
| 14 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | TH9: "six" → "five" in the title; `toHaveLength(6)` → 5; `labelTexts` without `'Arrangement'`; the caption/overview slice block becomes `expect(html).not.toContain('· Overview')` and `expect(html).not.toContain('>Arrangement<')`. Nothing else. |
| 15 | `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` | **New case LSU8** (§2.5). Existing cases unchanged. |
| 16 | `docs/implementation/2026/quarter-IV/178-calm-2a-canvas-dock-copy.md` | **New file** (number 178 is free at planning). §2.6. |

Nothing else changes. The only new file is the doc.

### 0.2 B's collision pre-check (L23, done)
- **Scratch:** `/tmp/b229` = `git archive 499c821`.
- **App edits:** B applied §2.1–§2.4 with `b-round-228/precheck-apply.py`. `tsc` shows errors **only** in 4 test files (the deleted exports and keys). Biome is clean after `--write` (one reflow in `ArrangementTempoRow.tsx`).
- **Sweep:** `npx vitest run app/lib app/components app/hooks app/routes` → **6 files, 10 tests red** (`b-round-228/l23-precheck-red.txt`, raw log `l23-sweep-raw.log`):

  | File | Red cases | Cause |
  |---|---|---|
  | navigation-strings-ui | NS4 | loop-strip literal |
  | strings | ST10, ST17, ST36, ST50 | literal maps and key lists |
  | studio-theme-obsidian | TH9 | the "Arrangement" label tag and the overview slice |
  | tempo-ui | U1, U8 | the empty hint |
  | tempo-window-ui | BU7 | the empty hint (through its `vi.mock` of `tempo`) |
  | video-dock-strings-ui | VDS1 | dock texts |

  Every one is a pinned copy or key list; none is a behaviour failure.
- **Typecheck-only collision:** `tempo.test.ts` T10 stays **green** under vitest, because `undefined === undefined`, but `tsc` fails on its import. That is why grant 9 exists. A vacuous pass is not proof (L23).
- **After the test fixes** (`b-round-228/precheck-tests.py` plus the TH9 edit recorded at its end): those 7 files plus 11 neighbours (lane-strings-ui, track-layout, transport-surface-ui, shortcuts, grid-snap-loop-drop, floating-video, track-group-mix-ui, header-meter-envelope-strings-ui, fader-touch, fader-click, track-volume-db) → **18 files, 319 tests green** (`l23-precheck-fixed.log`). `tsc` rc 0, and Biome is clean on all 14 code and test paths.
- **Reference diff:** `b-round-228/precheck-scratch.diff` (38 hunks over grants 1–14). A may use it. A owns the result. The new cases of §2.5 are not in it.
- **`e2e/` and `perf/` (frozen, run by the gate):** `grep -rnE "Mute\b.*title|getByTitle\('Mute|Solo \(Ctrl|Original video sound|Loop on / off|tracking-label|Arrangement ·" e2e perf` → 0 hits, and the five removed sentences give 0 hits there too (B's earlier grep over `app e2e perf`).
- **D-29z283 obligation:** `track-layout.test.tsx` is in the pre-check set and in A's covering set. This round does not touch the footer.

### 0.3 Render conditions, timeouts and testids (L29, L31, L40)
- **L29, the signals this task names:**
  - `arrangement-bars-ruler` renders always; the hint branch is `bpm === null` (TempoRow l.95).
  - `arrangement-loop-strip` renders always; the hint branch is `loop === null` (LoopBrace l.275).
  - `arrangement-video-caption` renders always in the dock (VideoDock l.894).
  - The empty overlay renders when `hasVideoClips` is false (VideoDock l.958). After this round it carries `data-testid="arrangement-video-empty"`.
  - The Loop button is disabled when `!range && !loop` (Transport l.230).
  - The video-track Volume fader renders unless the lane is folded (Lane l.812).
  - "Original sound" renders only in `density === 'full'` (Lane l.848).
- **L31, times in the gate-228 `verify.log`** (default 5 s per test unless declared):

  | File | Time | Tests |
  |---|---|---|
  | lane-strings-ui | 4.8 s | 11 |
  | navigation-strings-ui | 4.7 s | 6 |
  | video-dock-strings-ui | 3.2 s | 5 |
  | tempo-ui | 3.2 s | 12 (15 s describe) |

  No single test is near its limit. NS6, VDS4 and LSU8 each add one workspace render. If any case in those files exceeds 50 % of its timeout, STOP (L32).
- **L40:** `arrangement-video-caption` changes content; its parent row gains `min-h-4`. The empty overlay changes from `p` to `div` and gains a testid. `arrangement-bars-ruler` and `arrangement-loop-strip` lose a child. A greps `arrangement-video-caption|arrangement-video-box|arrangement-video-dock|arrangement-bars-ruler|arrangement-loop-strip|arrangement-video-empty` in `app/**/__tests__` and adds every hit file to the covering set.

## 1. Why
- Saba (2026-10-28): the Studio screen is overloaded. The calm review (`docs/technical/studio-real-workspace/calm-studio-review.md` §1, §4) counts 13 instructional sentences on the empty demo.
- CALM-1 (rounds 226–228, done) removed the shortcut line and put the keys into the tooltips.
- This stage removes the 5 sentences that sit **on the timeline canvas and in the dock**, the places closest to the content (calm doc "Quiet Luxury"):
  - "Bars: set a BPM — grid only, audio is not stretched";
  - "Loop: make a time selection and press Loop (Ctrl+L)";
  - "Arrangement · Overview";
  - "Video · sound from the video track (M/S/Volume)";
  - "No video added yet".
- **Why we missed it** (SABA-B-8 as a whole) is in `tasks/round-226.md` §1.1, with lesson L39. This stage adds no new Saba-found issue.

## 2. Changes

### 2.1 `strings.ts` (exact)
| Object.key | Before | After |
|---|---|---|
| `studioTempoStrings.emptyHint` | `Bars: set a BPM — grid only, audio is not stretched` | **deleted** |
| `studioLoopStrings.braceHint` | `Loop: make a time selection and press Loop (Ctrl+L)` | **deleted** |
| `studioLoopStrings.needsSelectionTitle` (new, after `toggleTitle`) | — | `studioShortcutTitle('Loop: make a time selection first', 'loop')` → `Loop: make a time selection first (Ctrl+L)` |
| `studioVideoDockStrings.overviewNote` | `· Overview` | **deleted** |
| `studioVideoDockStrings.captionFallback` | `Video` | **deleted** |
| `studioVideoDockStrings.captionSoundNote` | `· sound from the video track (M/S/Volume)` | **deleted** |
| `studioVideoDockStrings.empty` | `No video added yet` | **deleted** |
| `studioLaneStrings.videoMixLabel` | `'Original video sound'` | `STUDIO_VIDEO_MIX_LABEL` (the same value; the const is declared just above `studioLaneStrings`) |
| `studioLaneStrings.videoMuteTitle` (new, after `videoMixLabel`) | — | `` `Mute — ${STUDIO_VIDEO_MIX_LABEL}` `` → `Mute — Original video sound` |

- **Why delete instead of leaving dead strings:** one source. A string with no consumer would let the strings tests pin text that no user sees.
- `grep -rn "emptyHint\|braceHint\|overviewNote\|captionFallback\|captionSoundNote\|studioVideoDockStrings.empty\b\|TEMPO_EMPTY_HINT" app` must give 0 at the end.
- **The facts stay reachable (Saba):**
  - "audio is not stretched" is already in `studioTempoStrings.fieldTitle` (the BPM field `title`) and in `studioTempoStrings.set` (the status written after a BPM is set). Both are unchanged.
  - The Loop reason moves to the disabled Loop button's `title` (§2.2).
  - "The Overview is the whole project" is already in the Overview's `aria-label` ("Overview — entire project …") and `title`. Both are unchanged and frozen.
  - "The video track controls the video's sound" moves to the video track's M/S/Volume `title`s (§2.4), next to the existing "Original sound" label.

### 2.2 Loop button `title` (`ArrangementTransport.tsx`)
```
range ? selectionTitle : loop ? toggleTitle : needsSelectionTitle
```
| State | `disabled` | `title` |
|---|---|---|
| no time selection, no loop (S0, S1) | yes (unchanged) | `Loop: make a time selection first (Ctrl+L)` |
| a time selection (S2) | no | `Loop the time selection (Ctrl+L)` (unchanged) |
| no time selection, a loop exists (on or off) | no | `Loop on / off (Ctrl+L)` (unchanged) |

- `aria-keyshortcuts` stays `Control+L Meta+L` in all three states.
- **This intentionally changes a value C-TITLES-228 verified in S0** ("Loop on / off (Ctrl+L)"). The new value still ends in `(Ctrl+L)`, so NS5 and C-PARITY still hold.
- The wording mirrors the existing `zoomToSelectionNeedsRangeTitle` ("Zoom to selection: make a time selection first (Z)"): one pattern for "needs a time selection" (L4).

### 2.3 The dock (`ArrangementVideoDock.tsx`)
1. **Overview label:** the `span.shrink-0` that holds "Arrangement" and `overviewNote` is deleted. The row `div` that held it and the caption gains `min-h-4`, so it keeps its 16 px height when the caption is empty. The Overview element, its position and its box do not change (C-BBOX).
2. **Caption:** `ArrangementVideoCaption` renders `source.name` when a video source is under the playhead, and nothing otherwise. No fallback word, no note `span`. The element, its `data-testid`, `truncate` and `text-right` stay.
3. **Empty monitor:** the overlay shown when `!hasVideoClips` stays as a box with the same position, inset and `bg-background`, so the empty `<video>` elements stay hidden behind it. It has **no text**: a `div` with `data-testid="arrangement-video-empty"`, classes `absolute inset-0 z-20 bg-background`.
   - **No sr-only copy (D-29z287):** the two `<video>` elements keep their `aria-label`s, and the video lane still says "No video — use “Your own video” or drop a file here" (it is kept per the calm doc §1). The fact stays reachable without a hidden duplicate.
   - Gap captions, the floating placeholder, and the Expand, Drag and Close buttons are unchanged.

### 2.4 Video-track titles (`ArrangementLane.tsx`; video track only)
| Control | Before (video) | After (video) | Audio tracks |
|---|---|---|---|
| Mute `title` | `Mute` | `studioLaneStrings.videoMuteTitle` = `Mute — Original video sound` | `Mute` (unchanged) |
| Solo `title` | `Solo (Ctrl/Cmd+click = add to solo)` | `studioLaneStrings.soloLabel(mixLabel)` = `Solo — Original video sound (Ctrl/Cmd+click = add to solo)` | unchanged |
| Volume `title` | `Original video sound` only when `density !== 'full'`; none in full | `Original video sound` in **every** density (`formatTitle={isVideo ? videoMixFaderTitle : undefined}`) | none (unchanged) |

- `aria-label`s, the visible "M"/"S" text and the "Original sound" line are unchanged.
- **Wording (L4, D-29z287):** the calm doc row 7 says "sound from the video". The product already names this fact "Original video sound" (the three `aria-label`s, `videoSoundLabel`) and "Original sound" (visible). One fact gets one wording, so the titles use "Original video sound". This is a listed deviation from the doc's wording, not from Saba's decision.
- Ctrl/Cmd in `soloLabel` stays as it is today (`strings.ts` l.656; outside the D-29z279 scope, which covered only transport titles).

### 2.5 Tests: the new and changed cases
- **ST-C2a (`strings.test.ts`):**
  - `studioLoopStrings.needsSelectionTitle` is `Loop: make a time selection first (Ctrl+L)`, and it equals `studioShortcutTitle('Loop: make a time selection first', 'loop')`.
  - `studioLaneStrings.videoMuteTitle` is `Mute — Original video sound`, and it equals `` `Mute — ${studioLaneStrings.videoMixLabel}` ``.
  - The six deleted keys are absent: `'braceHint' in studioLoopStrings` is false, and the same for the other five.
- **U1 (`tempo-ui.test.tsx`), the facts stay reachable:**
  - the strip `textContent` is `''`;
  - the BPM field `title` contains `audio is not stretched`.

  U2 already pins the set status literal "… Grid only: audio is not stretched." (no change).
- **NS6 (`navigation-strings-ui.test.tsx`)**, real workspace:
  1. Fresh (no range, no loop): the Loop button is disabled; `title` = `studioLoopStrings.needsSelectionTitle`; `aria-keyshortcuts` = `studioShortcutAria('loop')`.
  2. After `setTimeRange(MUSIC_RANGE)`: `title` = `selectionTitle`, enabled.
  3. After `toggleLoopSelection()` and then `setTimeRange(null)`: `title` = `toggleTitle`, enabled.
  4. In all three states the title ends with `` ` (${findStudioShortcut('loop')?.keys[0]})` ``.
- **VDS1 (`video-dock-strings-ui.test.tsx`):**
  - `caption.previousElementSibling` is `null`;
  - `caption.textContent` is `''`;
  - `queryByText('No video added yet')` is `null`;
  - `getByTestId('arrangement-video-empty').textContent` is `''`.
- **VDS4 (`video-dock-strings-ui.test.tsx`, or `lane-strings-ui.test.tsx` if the mount is only available there; both are granted):** with one video clip at the playhead, the caption `textContent` equals the clip source's file name exactly, and `queryByTestId('arrangement-video-empty')` is `null`. B checked the mount: `lane-strings-ui.test.tsx` has `importVideo(api, 'film.mp4')` (l.187, used by LSU5a), and `live(api).videoSources` holds the imported source. **Fallback (no STOP):** if the harness cannot place the playhead over the clip or the source has no `name`, VDS4 asserts only that `arrangement-video-empty` is absent after the import; the file-name half is then C-MONITOR-229 (SV). A says which variant it wrote.
- **LSU8 (`lane-strings-ui.test.tsx`):**
  - On the video track in the default density: Mute `title` = `Mute — Original video sound`, Solo `title` = `studioLaneStrings.soloLabel('Original video sound')`, and the Volume slider (`aria-label` "Volume — Original video sound") `title` = `Original video sound`.
  - After the video lane's height is reduced to a non-full, non-folded density, the Volume `title` is still `Original video sound`. Use the lane height control: `getByRole('separator', { name: studioLaneStrings.heightLabel(<video track name>) })` (`ArrangementLane.tsx` l.1050; `track-layout.test.tsx` l.1134 drives the same control). **Fallback (no STOP):** if that density cannot be reached from this mount, LSU8 asserts the default density only, and C-VIDEO-TITLES-229 covers the small height in the browser. A says which variant it wrote.
  - On the music track: Mute `title` = `Mute`, Solo `title` = `studioLaneStrings.soloTitle`, and the Volume slider has no `title` attribute.
- **TH9:** as in grant 14.
- **No `any`, no `as`, no `@ts-ignore`.** Narrow with `if (!x) throw new Error(...)`. Find elements by role, name, text or `data-testid` (L12).

### 2.6 Doc 178 (new)
- Path: `docs/implementation/2026/quarter-IV/178-calm-2a-canvas-dock-copy.md`, following `docs/implementation/TEMPLATE.md`. Georgian, with English technical terms.
- l.4, exactly: `**სტატუსი:** In Progress (stage 1 of 2; C round 229 PASS)` (L28; CALM-2 has 2 stages).
- Sections:
  - კონტექსტი: SABA-B-8 decision 2; the 5 sentences.
  - მიდგომა: the move map of §2.1; the deleted strings; the one-wording rule of §2.4; why there is no sr-only copy; why there is no BPM placeholder.
  - შეცვლილი ფაილები: grants 1–15.
  - პრობლემები და გადაწყვეტები: the vacuous T10 pass (the typecheck-only collision); the 16 px row.
  - ტესტირება: ST-C2a, U1, NS4, NS6, VDS1, VDS4, LSU8, TH9 and the mutants.
  - TODO: CALM-2b and CALM-3.
- Cite only ids that exist (L26).

## 3. Reference: how Ableton Live 12 does it
Sources fetched 2026-10-28 (WebFetch):
- Live 12 manual ch. 6 "Arrangement View": https://www.ableton.com/en/live-manual/12/arrangement-view/ (6.1 item 1 Overview; 6.6 "The Arrangement Loop").
- ch. 28 "Working with Video": https://www.ableton.com/en/live-manual/12/working-with-video/ (28.1, 28.2.2, 28.2.2.1, 28.3).
- ch. 2 "First Steps", 2.2.2 Info View: https://www.ableton.com/en/live-manual/12/first-steps/.
- ch. 3 "Live Concepts", Control Bar "Tempo Settings and Metronome": https://www.ableton.com/en/live-manual/12/live-concepts/ (WebSearch result text; the section body was not fetched).

| # | Behaviour | Source | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|---|
| R1 | Tempo without a value | ch. 3 Control Bar: "controls for … setting your Set's tempo and time signature" | A Set always has a tempo field. The fetched text shows no "set a tempo" prompt. The default value was **not** confirmed. | **Existing deviation (SRW-15):** CZABA's BPM is optional (empty means no bars ruler). The prompt sentence goes; the fact "grid only, audio is not stretched" stays in the field `title` and in the set status. | C-FACTS-229 |
| R2 | Turning the loop on | 6.6: "activate the Arrangement Loop using the toggle in the Control Bar"; Ctrl/Cmd+L toggles it; "If no clip(s) or time is selected, the loop brace will cover the entire Arrangement." | Live can loop with no selection: the brace then covers the whole Arrangement. No instruction text is described. | **Existing deviation (not changed here):** CZABA's Loop needs a time selection, so the button is disabled until there is one. The reason moves from the strip to the disabled button's `title`. The strip is empty; the manual describes no text in that strip. | C-LOOP-229 |
| R3 | Overview label | 6.1 item 1: "displays the Arrangement's entire layout of clips from start to end and can be used for zooming and navigation" | The manual describes no caption or label on the Overview. | **Match:** no visible label. The `aria-label` and `title` still say what it is. | C-TEXT-229, C-OVERVIEW-229 |
| R4 | Video window without video | 28.2.2: a separate floating window, toggled with a View-menu command; 28.3: it "will appear to display the video component" after a movie is added; 28.2.2.1: "During gaps in video, Live's Video Window will display a black screen." | The window appears with video. What it shows with **no** video clip is not described. | **Deviation:** CZABA's monitor is docked and always present (existing layout; collapsing the row is not approved). Empty = a quiet dark box with no text. *Inference, not a confirmed match:* this is closest to Live's black screen in gaps. | C-MONITOR-229 |
| R5 | Where a video's sound is controlled | 28.1: "video clips in the Arrangement View are treated just like audio clips"; 28.3: the movie is dropped into an audio track | The movie's sound plays on the audio track it sits on, with that track's normal mixer. Specific mute or volume text is not described. | **Deviation (existing):** CZABA has a dedicated video track. Its M/S/Volume `title`s now name "Original video sound", so hovering a control says what it controls. | C-VIDEO-TITLES-229 |
| R6 | Where help text lives | 2.2.2: "The Info View displays the name and function of whatever element of the UI that you hover over with the mouse." | Hover help is a panel. | As in round 228 K1: CZABA has no Info View, so the native `title` tooltip carries it. | C-FACTS-229 |

- "Live has no helper text in empty strips" is **not** stated as a fact. The fetched sections simply describe none ("manual does not describe").
- **Better than Live (claimed carefully):** the disabled Loop button tells you why it is disabled and which key to use, right where the pointer is. The manual describes the toggle only.

**Screen budget (L39):** this round adds nothing permanently visible. It removes 4 persistent text lines from the empty project (the dock label row, the monitor text, the BPM strip and the Loop strip) and adds only `title`s, which show on hover.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start:**
   - HEAD is `499c821`;
   - `git status --short` is empty;
   - `sha256sum -c` gives rc 0 for the tree, granted-start and root-files lists.
2. `npm run typecheck` rc 0. `npm run lint` rc 0, with no new warnings in the granted files. `npx biome check` on grants 1–15 is clean.
3. **Covering set:** `npx vitest run` on:
   - the 18 pre-check files (§0.2);
   - every extra hit of A's greps: the L40 testid grep (§0.3), and `grep -rlnE "Bars: set|Loop: make|Arrangement ·|· Overview|No video added|sound from the video|captionFallback|braceHint|emptyHint|TEMPO_EMPTY_HINT|title=\"Mute\"|Original video sound|needsSelectionTitle|videoMuteTitle" app --include=*.test.*`.

   Everything must be green. Report the per-test times, with any test above 50 % at the top (L32).
4. **Mutants** (restore each one and verify its sha):
   - **MU-1:** restore the Loop hint `span` with any text. NS4 must go red.
   - **MU-2:** the Loop `title` falls back to `toggleTitle` when there is no loop. NS6 must go red.
   - **MU-3:** the video Mute `title` back to `"Mute"`. LSU8 must go red.
   - **MU-4:** the Volume `formatTitle` back to `isVideo && density !== 'full'`. LSU8 must go red.
   - **MU-5:** the caption shows `'Video'` when there is no source. VDS1 must go red.
   - **MU-6:** remove `min-h-4` from the dock row. Name the test that goes red. If none does (jsdom does not lay out), write "browser-only: C-BBOX-229" and do not add a class pin (L12).
5. **Optional, short browser self-check** at 1280×720: the empty demo shows no text in the BPM strip, the Loop strip, the dock label row or the monitor; hovering over the disabled Loop button shows the new title.
6. **code-reviewer:** run it (15 files). Forward its Architecture notes.
7. **End:**
   - `git status` shows the changed grants as `M` and exactly one `??` (doc 178);
   - the frozen and root lists give rc 0;
   - write `a-round-229/changed-end-sha256.txt` and `a-round-229/granted-hunks.diff` (diff against `b-round-228/granted-start/`).

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720)
States:
- **S0:** fresh anonymous empty demo.
- **S1:** one clip added (the first "Add"), then a click at (5, 5) to clear focus. This is exactly the S1 of `b-round-228/text-inventory/inventory.mjs`.
- **S2:** S1 plus a one-track time selection.
- **S3:** S2, then Loop on (Ctrl+L), then the time selection cleared with Escape with focus on the workspace (the method of C round 228, `c-round-228/c228.cjs`). Confirm the state: the loop brace exists and the Split title is the playhead form (no range).
- **SV:** S1 plus one video file imported on the video track (the file chooser rule is L25).

| Row | What | Pass |
|---|---|---|
| C-SCOPE-229 | HEAD, `git status`, the hash lists, the hunks | HEAD is `499c821`. Only granted paths are changed: grants 1–15 as `M` and doc 178 as the only `??`. The frozen and root lists give rc 0. A's `changed-end-sha256.txt` gives rc 0. The protected files show `git diff --quiet HEAD` rc 0. **Hunk scope:** `diff -u b-round-228/granted-start/<path> store/<path>` shows only what §0.1 permits. For grants 8–11 and 14, compare with `b-round-228/precheck-scratch.diff`; extra hunks are allowed only for the new cases of §2.5. |
| C-UNIT-229 | `npx vitest run` on strings, tempo, tempo-ui, tempo-window-ui, navigation-strings-ui, video-dock-strings-ui, studio-theme-obsidian and lane-strings-ui | Green. ST-C2a, NS6, VDS4 and LSU8 exist. The §2.1 deleted-key grep gives 0 in `app`. |
| C-TEXT-229 | Visible text inventory: run `b-round-228/text-inventory/inventory.mjs <out> after` and diff it against `b-round-228/text-inventory/before.json` (B's capture of `499c821`, same states S0/S1, both viewports) as a multiset of `(region, text)` | In each of the 4 state × viewport keys, **exactly these 7 entries are removed** and nothing else: (`arrangement-video-dock`, `Arrangement`), (`arrangement-video-dock`, `· Overview`), (`arrangement-video-caption`, `Video`), (`arrangement-video-caption`, `· sound from the video track (M/S/Volume)`), (`arrangement-video-box`, `No video added yet`), (`arrangement-bars-ruler`, `Bars: set a BPM — grid only, audio is not stretched`), (`arrangement-loop-strip`, `Loop: make a time selection and press Loop (Ctrl+L)`). **Added: 0.** Any other difference is listed with its cause; an unexplained one is a FAIL. |
| C-BUDGET-229 | L39 persistent lines outside the timeline content, S0 and S1, both viewports | **Baseline:** C round 228 counted only footer lines (`geom-after.json`). For the other regions, the before count comes from `b-round-228/text-inventory/before.json`: its 7 removed entries sit on 4 lines (the dock label row, the monitor, the BPM strip and the Loop strip). **Pass:** C's after-run shows those 4 lines gone (0 visible text in those 4 regions), no new line anywhere, and footer lines equal to round 228's `geom-after.json`. |
| C-BBOX-229 | `c-round-228/bbox-after.mjs` against `c-round-228/bbox-after.json` (S0, S1) | 0 deltas over 1 px, except: `arrangement-video-caption` (its x, w and h may change, because the label beside it is gone and it is empty), and the new key `arrangement-video-empty`, whose box equals `arrangement-video-box` ±1 px. Also measured: the caption's parent row height is 16 ±1 px in S0 and SV. The Overview, the video box, the dock, the bars ruler and the loop strip have deltas ≤ 1 px. |
| C-LOOP-229 | Loop button | S0 and S1: disabled, `title` = `Loop: make a time selection first (Ctrl+L)`. S2: `Loop the time selection (Ctrl+L)`, enabled. S3: `Loop on / off (Ctrl+L)`, enabled. `aria-keyshortcuts` = `Control+L Meta+L` in all of them. Real-mouse hover ≥ 1.5 s in S0: screenshot (the native tooltip may not paint headless; that is recorded, not a FAIL). Ctrl+L in S2 still turns the loop on (one before/after measurement), and the strip then shows the brace. |
| C-FACTS-229 | Moved facts stay reachable | The BPM field `title` contains `audio is not stretched`. Type `120` and Enter: the status line contains `Grid only: audio is not stretched.` The Overview `aria-label` and `title` are byte-equal to round 228 (`Overview — entire project (← → = 5 s, double-click = Fit)` and `Overview: click = centre here · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit`). |
| C-VIDEO-TITLES-229 | Video-track titles | The video track's Mute `title` = `Mute — Original video sound`; Solo = `Solo — Original video sound (Ctrl/Cmd+click = add to solo)`; Volume = `Original video sound`, at the default height and after dragging the video lane's height to its smallest unfolded size. The music track's Mute = `Mute`, Solo = `Solo (Ctrl/Cmd+click = add to solo)`, and its Volume has no `title`. The `aria-label`s are unchanged. |
| C-MONITOR-229 | Empty and filled monitor | S0: the monitor box is present at its round-228 position and size, with 0 visible characters inside it, and its colour is the dark `bg-background` (screenshot crop). SV: the video frame shows, `arrangement-video-empty` is absent, and the caption shows exactly the imported file name. Move the playhead into a gap: the gap caption still shows ("No video ·"), and the dock caption is empty. |
| C-OVERVIEW-229 | Neighbour | Overview click centres, drag scrolls, and double-click fits (one measurement each, at 1440). Its box is unchanged (C-BBOX). |
| G229-3 | Auth guard | `/studio/middle-east` → "Sign in required", 0 `audio`. `/api/studio-token` with no header → 401. A fresh `/studio-lab` shows the demo badge, and `auth_user` is null. |
| LAB-SMOKE-229 | Add a clip, then Export WAV | 24-bit, 48 kHz, stereo. The RMS segments are identical to round 228. 0 page errors. |
| AN-REVIEW-229 | Doc 178 | l.4 is byte-exact (§2.6). Every cited id exists. The changed-files list equals grants 1–15. |
| C-REF-229 | §3 R1–R6 | Each one is a match or a listed deviation. Any other difference is a bug (Medium if the user must learn it, else Low). |
| C-SHOTS-229 | Calm doc row 12 | Full-window screenshots at S0 and S1, both viewports, after. The before images are C round 228's `after-full-S{0,1}-*.png` and B's `b-round-228/text-inventory/before-full-*.png`. |
| gate | full suite, build, lint, `verify`, e2e smoke | Not claimed by C. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Video import and float (SV):** Expand, Drag, Return and Close still work. The placeholder "Video expanded" still shows when floating. The overlay change did not cover the video when clips exist.
- **The tempo field:** typing works, Esc restores, an empty value clears (U8 behaviour), and the metronome stays disabled without a BPM.
- **Loop brace keyboard:** with a loop, the brace still takes focus and ← → nudges (the keyboard hint is unchanged).
- **1280×720 header row:** the video lane header did not grow (titles do not lay out).

## 7. Outcomes for B's next planning
- **C PASS and gate PASS:** CALM-2a is done. Next is **RETRO (round 230)**, with the whole-screen review; REGRESSION goes first if the planning date is on or after 2026-10-30. Then CALM-2b, then CALM-3, then STUDIO-PERFORMANCE b-ii.
- **C FAIL:** a fix-up on the same grants.
- **Gate fail:** B re-runs L23 against the actual tree and grants the fix precisely.
