# Round 251: SABA-B-10a stage 2a fix-up. The library line above Add names the Insert Marker, and the paste/split-while-playing test gap is closed.

The changes:
- The library line `Active track: SFX · playhead 00:04.491` becomes `Active track: SFX · insert marker 00:03.000`. It names the point where Add places the sound, stopped and while playing (C-R250-01, Medium, a regression of round 250).
- IM15 and IM17 get a playing branch, so a paste or split that reads the live position while playing turns them red (A-R250-REVIEW-PASTE-SPLIT-PLAYING, Medium, test strength).
- In the same test file, two Low assertion gaps are closed at little cost: M prefers the time selection start (new IM23), and IM20 asserts `preventDefault` and a `metaKey` variant (A-R250-REVIEW-IM18-IM20-ASSERTS).

**Planned by:** B, at the round 250 → 251 planning, 2026-10-29. **Decisions:** D-29z444…D-29z451.

**Type:** a fix-up round (bug gate: a Medium regression caused by the round comes before new scope). It has 3 tightly related findings, all in the code that stage 2a changed. There is one owner: `ArrangementLibraryPreview.tsx` (one component), with one string key and 5 test files.

**Why this round (D-29z444):**
- C round 250 is a **FAIL**, with `browserVerified` and `realVerified` both true. Every runnable §5 row passed at both viewports. The round failed on C-R250-01, a user-visible Medium regression outside the listed rows (precedent: C-R202-01).
- Gate 250 is `skipped` (`gates/gate-round-250.json`: "C taskStatus FAIL"). Nothing from round 250 is published. Its 13 changed files are still in the working tree (`M`).
- **Gate 251 publishes rounds 250 and 251 together** after a C PASS.
- **REGRESSION** is not due yet: `regression-last.json` is 2026-10-27, and this planning is on 2026-10-29. It is due at the first planning on or after 2026-10-30, which is very likely the next one (§7). **RETRO** is due at round 260.

**Read first:** `lessons.md` in full. Directly relevant here:
- **L29**, with its new clause: a changed position source means every readout that names it is a consumer, grepped over `app/**` (§0.3);
- **L3** (the changed line → widest-state rows, C-CAPTION-WIDE-251);
- **L12** (a changed `data-testid` → grep and run every hit file; done in §0.2, 0 hits outside the grants);
- **L10/L11** (B rules on A's round-250 STOP below);
- **L23** (pre-applied on a scratch copy);
- **L26/L28** (doc 191);
- **L39** (no new persistent element: the text of an existing line changes);
- **L50** (focus grep: 0 hits, §0.2).

**B ruling on A's round-250 STOP (L10, D-29z447):** `export-progress-ui.test.tsx` failed 2 rows in A's first covering run, which ran under concurrent load.
- **Ruling: a load flake, not a regression.** The evidence:
  - A's 3 isolated reruns were green, and A's second covering run was 1841/1841;
  - C's covering run alone was 1841/1841;
  - B's full scratch run was 3132/3132 (§0.2);
  - the round-250 and round-251 diffs touch no encoder, export or timer code.
- It is recorded as the watch finding **EXPORT-PROGRESS-LOAD-FLAKE-250**.
- A and C run the covering set **alone**, with no reviewer subagent, scratch extraction or browser job at the same time.
- If gate 251's `verify.log` reproduces it, B plans a test-only isolation task for that file next, before new scope.

**Not this round (sequenced, not dropped):**
- **REGRESSION-ROUND-2026-10-30** (§7).
- **SABA-B-10a stage 2b:**
  - C-R235-02 Follow;
  - B-R250-NAV-ORIGIN, with `noneAfter`/`noneBefore`;
  - B-R250-PLAYHEAD-TITLES (`rulerTitle`, `rangeBodyTitle`);
  - SABA-Q-TIME-RULER-ROLE;
  - the new info B-R251-PASTEND-AT-END: a play exactly at the end reads "(00:16.000) is past the end … (00:16.000)" (A reviewer info 7).
- **SABA-B-10b.** It adds the sheet rows for Shift+Space and Ctrl/Cmd+Shift+Space (GATE249-S7) and now also owns the sheet `marker` row copy (A-R250-REVIEW-SHEET-MARKER-COPY, D-29z449).
- **SABA-B-9**, **SABA-B-11c**, and **SABA-B-7** (`awaiting_user`).
- **The protected purchased route** (SRW-21, `deferred_user`).
- **New Lows go to `deferred_low_polish` (D-29z449):** A-R250-REVIEW-STALE-PASTE-TITLE (`ArrangementContext.test.ts:487` title "pastes at the playhead"; that file is frozen).

## 0. Baseline and scope

**Start state:**
- **HEAD** = `dcb7eb14127850eecad45f373cdebba2258ee95e`, unchanged since gate 249 (`b-round-250/head-at-planning.txt`).
- **The working tree is not clean, by design.** `git status --short --untracked-files=all` shows exactly 13 `M` paths: the round-250 grants (`b-round-250/git-status-at-planning.txt`). Nothing is untracked.
- **STOP (L11)** if HEAD differs, if the status shows any other path, or if any hash check below fails. One exception: a root commit that touches only the 4 root files. In that case, re-hash them and continue.

**Frozen:** `b-round-250-r251-tree-sha256.txt`, **1,102** files. That is every tracked file (1,114), minus the 8 round-251 grants and the 4 root files, **hashed from the working tree**.
- So the 9 round-250 files that this round does not touch are frozen **at their round-250 content**:
  - `ArrangementContext.tsx`, `StudioWorkspace.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementTransport.tsx` and `shortcuts.ts`;
  - `ArrangementContext.test.ts`, `bars-ruler-ui.test.tsx`, `navigation-strings-ui.test.tsx` and `marker-strings-ui.test.tsx`.
- From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-250-r251-tree-sha256.txt` gave rc 0 at planning.
- Each of the 7 protected auth and purchase files appears exactly once (checked), and `git diff --quiet HEAD` gives rc 0 on each:
  - `app/routes/studio.$productId.tsx`;
  - `app/routes/api.studio-token.ts`;
  - `app/routes/account.downloads.tsx`;
  - `app/lib/__tests__/download-routes.test.ts`;
  - `app/lib/auth.ts`;
  - `app/contexts/AuthContext.tsx`;
  - `app/entry.server.tsx`.
- **Also frozen:**
  - every other component;
  - `position-store.ts`;
  - every other test file;
  - every implementation doc except doc 191;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-250-r251-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`), with start hashes in `b-round-250-r251-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-250-r251-grants.txt`; start hashes in `b-round-250-r251-grants-start-sha256.txt`; start copies in `b-round-250/r251-granted-start/`)
**The diff:** `b-round-250/precheck-251.diff`, sha256 `77b07ca817f44f871d839793ba7205d69d2dcd37b3ac71057e79ea0ae5fb0fef` (`precheck-251.sha256`). It covers grants 1–7 and applies against the **working tree** (HEAD + round 250).
- On the planning tree, `git apply --check -p1` gives rc 0.
- Applied to a tar copy of the working tree, it reproduces the scratch files byte for byte.
- The expected final hashes of grants 1–7 are in `b-round-250/expected-final-sha256.txt`.
- **A may apply it as is,** then write grant 8.

| # | Path | Change (`git apply --numstat`) |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementLibraryPreview.tsx` | +21/−19. <ul><li>`LibraryPlayheadText` → **`LibraryInsertMarkerText`**, and its memo → `LibraryInsertMarkerTextMemo`.</li><li>It reads `useArrangementInsertMarkerStore()` and writes `textContent` in a `useEffect` that calls the writer once and returns `insertMarkerStore.subscribePosition(writer)`. This is the same pattern as `ArrangementInsertMarkerSignal` (`StudioWorkspace.tsx` l.497–519).</li><li>No React state and no position-frame writer: `useArrangementPositionStore`/`useArrangementPositionWriter` leave this file's imports.</li><li>`data-testid` `arrangement-library-playhead` → **`arrangement-library-insert-marker`**. Classes stay `font-mono tabular-nums`.</li><li>The line's literal `· playhead ` becomes `· {studioLibraryPanelStrings.insertMarker} `.</li></ul> |
| 2 | `app/lib/arrangement/strings.ts` | +1/−0: `studioLibraryPanelStrings.insertMarker: 'insert marker'` (after `videoTrackNote`). |
| 3 | `app/lib/arrangement/__tests__/insert-marker-ui.test.tsx` | +92/−2 (round-250 rows kept). <ul><li>**IM15:** after the stopped paste: Undo, Space, +1 s (live > 2.5, playing), paste. The clip is on Music at **2**, the status contains `00:02.000`, and playback continues.</li><li>**IM17:** after the first Undo: Space, +1 s (live > 5.5), select h1, Ctrl+E. The status is `splitDone('00:05.000')`, the SFX starts are [0, 5], and playback continues. Then Space (stop), Undo, and the existing several-clips part.</li><li>**IM20:** the three blocked keys are sent with `fireEvent.keyDown(...)` and each must return `false` (default prevented): Ctrl+Shift+Space, **Meta+Shift+Space** (new) and Home. The marker, playhead and selection asserts are unchanged.</li><li>New **IM22** and **IM23** (§2.2). Nothing is removed.</li></ul> |
| 4 | `app/lib/arrangement/__tests__/library-preview.test.tsx` | +10/−10: the new testid and component name; `· playhead 00:00.000` → `· insert marker 00:00.000` (×2); the describe/it titles name the insert marker. The memo row keeps all its asserts. |
| 5 | `app/lib/arrangement/__tests__/render-budget.test.tsx` | +26/−11. <ul><li>`LibraryPlayheadText` → `LibraryInsertMarkerText` in the playback-frames row.</li><li>New `InsertMarkerStoreProbe`.</li><li>**R9-L1 is rewritten to the new contract** (§2.2). Its old "text changes on every position frame" asserts are replaced by stronger ones: the text is unchanged over 60 frames, and two marker writes update it, all with 0 renders.</li></ul> |
| 6 | `app/lib/arrangement/__tests__/strings.test.ts` | +3/−1: ST49 gets the `insertMarker` key and literal, and the count goes 23 → 24. |
| 7 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | +7/−2: TH-row testid `arrangement-library-insert-marker` (`font-mono`, `tabular-nums`). |
| 8 | `docs/implementation/2026/quarter-IV/191-saba-b-10a-insert-marker.md` | The whole doc (L34). l.4 becomes exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 251 PASS)` (L28 re-dispatch clause). Add a "round 251 fix-up" part to each section (§2.3). Do not rewrite the stage-2a text. |

- **No assertion is removed without a stronger replacement.** The one contract change is R9-L1: "the line follows the playhead" becomes "the line follows the Insert Marker". Its red proofs are MU-CAPTION-POSITION and MU-CAPTION-REACT-STATE.
- **Read before editing:**
  - `FORWARDREF_COMPONENT.md` and `AGENT_DISCOVERABLE_CODE.md` (the new name `LibraryInsertMarkerText`, the testid, the string key);
  - `AUDIO_ARCHITECTURE.md` (position stores);
  - `TAILWIND_FIRST.md` (classes unchanged);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
**Scratch copy:** `/tmp/b251-scratch`, a tar copy of the **working tree** (not `git archive`, which would lack round 250). It was made outside the repo, with its own `node_modules` directory of per-entry symlinks so that `.vite` stayed local.
- **Scripts:**
  - `b-round-250/proto_src_251.py` (source) and `proto_tests_251.py` (tests);
  - IM23's assertions were then changed by hand: the fixture already has a marker at 10, so the row uses `toContain`, not `toEqual`. Its first playing assert ("no marker in (2.5, 4.5)") was vacuous, because Space with the 9–10 selection plays from 9, so it was replaced by "one marker added, exactly one at 9". After that, `insert-marker-ui` was re-run alone (23/23) and FIX-CONTROL and MU-M-NO-RANGE were re-run (`mutants/logs-im23/summary.txt`: none / IM23). Then `biome check --write`.
  - **The diff is the source of truth.**
- **Static checks:**
  - `npx tsc --noEmit` rc 0 (`tsc-251.log`);
  - `npx biome check` on the 7 files: "No fixes applied", rc 0 (`biome-251.log`).
- **Whole suite on the scratch, run by B, not A or C:** 215 files, **3,132/3,132** green, rc 0 (`proto-full-251.json`). That is the round-250 count of 3,130 plus IM22 and IM23.
- **Collisions (L12/L23):**
  - `grep -rn "arrangement-library-playhead\|LibraryPlayheadText" app e2e` on the scratch gives **0 hits**.
  - The working tree has hits only in grants 1, 4, 5 and 7.
  - ST49 pins the `studioLibraryPanelStrings` keys, so it is granted (grant 6).
- **Covering set:** `b-round-250/covering-251.txt`, **123 files**. This is the round-250 grep plus `ArrangementLibraryPreview|studioLibraryPanelStrings|arrangement-library-`, and it adds no file to round 250's 123.
- **Timeouts (L31):**
  - in B's run, IM22 took 130 ms and IM23 89 ms, against 15 s;
  - the `render-budget` file took 5.2 s, with its slowest row at 2.3 s against its 15 s declaration;
  - CP12a–d stay near 8 s against 30 s;
  - nothing is near 50 %.
- **L50 focus grep:** the regex `onPointerDown(Capture)?|onBlur|settleEditor\(|\.focus\(|^\s*\{[^}]*(\.map\(|&&|\?)` over every added or removed source line of grants 1–2 gives **0 hits** (`l50-grep-251.txt`). Nothing moves focus, and nothing that can hold focus unmounts: the span is not focusable.
- **Red proofs.** Script: `b-round-250/mutants/run251.sh <fixed-scratch> <logdir>` (set `MUTANTS="…"` for a subset), with the mutants in `mutate251.py`. Each run uses its own copy `/tmp/b251-mut-*` and runs grants 3–7. Summary: `b-round-250/mutants/logs/summary.txt`.

| Run | Change | Red rows |
|---|---|---|
| FIX-CONTROL | none | none |
| MU-CAPTION-POSITION | the span reads `useArrangementPositionStore()` (the round-250 behaviour) | **IM22, R9-L1** |
| MU-CAPTION-REACT-STATE | the span also re-renders through `useState` on every marker change | **R9-L1** (render count) |
| MU-CAPTION-STATIC | no subscription (written once on mount) | **IM22, R9-L1** |
| MU-PASTE-SPLIT-LOCATOR | paste and both no-range split branches read `isPlaying ? livePosition() : marker` (C's C-MU-PASTE-SPLIT-LOCATOR) | **IM15, IM17** (0 red in round 250) |
| MU-PASTE-LOCATOR | paste only | **IM15** |
| MU-SPLIT-LOCATOR | both split branches only | **IM17** |
| MU-M-NO-RANGE | `beginAddMarker` ignores the time selection | **IM23** |
| MU-GESTURE-CS-NO-PREVENT | Ctrl/Cmd+Shift+Space calls `preventDefault` only outside a gesture | **IM20** |
| MU-GESTURE-HOME-NO-PREVENT | Home calls `preventDefault` only outside a gesture | **IM20** |

### 0.3 Recipes and measurements (L29)
**Copy sweep (the L29 lesson from C-R250-01).** On the scratch: `grep -rniE "playhead|play head" app --include=*.tsx --include=*.ts | grep -v __tests__` → `b-round-250/copy-sweep-251.txt` (114 lines). After code identifiers are removed, the user-visible Studio-workspace texts that still name the playhead are:
- `strings.ts` l.244 `Insert marker moved to the playhead …`: correct;
- l.367 `zoomSliderTitle`: correct, because zoom anchors on the playhead;
- `ArrangementRuler.tsx` l.210 `aria-label="Playhead"`: correct, it is the handle;
- l.378 `rulerTitle` and l.684 `rangeBodyTitle`: B-R250-PLAYHEAD-TITLES, stage 2b;
- l.504/505 `noneAfter`/`noneBefore`: B-R250-NAV-ORIGIN, stage 2b.

The other hits are code identifiers, comments, the old `studio/` and `audio/` components or `recordings/SfxSceneBuilder.tsx` (another feature, not this workspace). No other inline JSX literal names a position that the round-250 commands ignore.

**Browser probe.** Chromium (Playwright), a fresh context per case, at both viewports.
- Each case waits for `Demo collection ready`, then adds `demo-stem-pulse` (the round-250 §0.3 recipe).
- Then it clicks the SFX lane at 3 s; Space, 1.5 s, Space; clicks the `demo-soft-impact` row; reads the line; and clicks **+ Add**.
- "playing" presses Space again (playing from 3) and waits 1 s before reading.
- "video" makes the Video lane active through its name button (`[data-track-id="video"] button[aria-pressed]`), which is the widest built-in state (`videoTrackNote`).
- **Runs:** the working tree on `:5173` (round 250) and the scratch on `:5174` (now stopped).
- **Script:** `b-round-250/caption-probe-251.cjs <base> <out.json>`.
- **Line count:** distinct `top` values of the line's text rects (a `Range` over the `<p>`).

| Case (both viewports, library width 288 px, `<p>` 264 × 32 px) | Round 250 (`caption-head.json`) | Fix (`caption-proto.json`) |
|---|---|---|
| stopped (marker 3.000, playhead ≈ 4.5) | `Active track: SFX · playhead 00:04.552`; Add → `sfx@3.000` | **`Active track: SFX · insert marker 00:03.000`**, 1 line; Add → `sfx@3.000`, status `“Soft impact” added to the SFX track at 00:03.000.` |
| playing (from 3, ≈ 4.0) | `· playhead 00:04.009` | **`· insert marker 00:03.000`**; Add → `sfx@3.000` |
| Video lane active (widest) | `Active track: Video (audio is not added here) · playhead 00:04.593`, 2 lines | `… · insert marker 00:03.000`: **2 lines**, the time inside the box, `sh = ch = 32`, `sw = cw = 264` |

- Every case had 0 page errors.
- **Invalid attempt, kept:** `caption-proto-attempt1-timeout.log`. The first cold `:5174` load timed out on "Demo collection ready", and the probe was re-run (the same class as rounds 249 and 250).
- **Code facts:**
  - `addSourceToActiveTrack` reads `insertMarkerRef.current` (`ArrangementContext.tsx` l.1590) and has **no** time-selection branch, so the add point is always the marker.
  - `addClip` → `findFreeStart(…, desiredStart)` (`model.ts` l.147) can move the clip to the next free slot when the marker point is occupied. The line names the marker, which is where Add **tries** to place the sound, and the status reports where it landed. That is honest, and it is the same as round 250.
  - `insertMarkerStore` is written only by marker moves (`ArrangementContext.tsx` l.815), never per playback frame.

## 1. Rulings

### 1.1 What the line shows (D-29z445)
- **The text names the insert marker**, in its time format: `Active track: <lane> · insert marker 00:03.000`.
  - **Rejected: dropping the time.** The marker is invisible until SABA-B-10b, so this line is the only readout of the add point, and the add point is what the user needs before pressing Add.
  - **Rejected: showing the playhead while playing.** Add ignores the playhead in every state (D-29z437).
- Lowercase `insert marker` matches the rest of the line (`· playhead` was lowercase) and the sheet rows (`… at the insert marker`).
- **The line updates without a React render:** a direct `textContent` write on each insert-marker store change. It is unchanged by playback frames. This keeps the R9-L1 budget (0 renders).
- **The video lane keeps its note.** The line stays 2 lines at the widest built-in state.
  - A user-renamed long lane name can still clamp the line. This is the same at round 250, and the `title` carries the lane name. Recorded as info, not changed.

### 1.2 Tests that pin the old contract
`library-preview` and `studio-theme-obsidian` change their testid and text only. R9-L1 changes its contract on purpose (§0.1, grant 5). No row is deleted.

### 1.3 Lows (D-29z449)
- **A-R250-REVIEW-IM18-IM20-ASSERTS:** fixed here (IM20 and IM23), because this round owns the file and it costs little (2026-10-23 bug-gate exception).
- **A-R250-REVIEW-SHEET-MARKER-COPY:** scheduled in **SABA-B-10b**, which owns `shortcuts.ts` and adds sheet rows there anyway. It is not deferred. 10b carries the C-TITLES row-height check.
- **A-R250-REVIEW-STALE-PASTE-TITLE** (`ArrangementContext.test.ts:487`): goes to `deferred_low_polish`, because the file is frozen this round.

### 1.4 Status writes (L51)
No status write is added, moved or changed. The add status text is unchanged.

### 1.5 Focus (L47/L50)
Nothing moves focus. The L50 grep gives 0 hits.

### 1.6 Screen budget (L39)
**No new persistent element.** The existing line's text changes:
- `playhead` (8 characters) becomes `insert marker` (13 characters);
- it stays within the line's 2-line box at the widest built-in state (§0.3).

C-BUDGET-251 counts the persistent lines.

## 2. Changes

### 2.1 Source (grants 1–2)
Exactly the diff.
- No new dependency.
- No new export: the new names are file-local. `studioLibraryPanelStrings` gains one key.

### 2.2 Rows (grants 3–7)
| Row | Case | Expected |
|---|---|---|
| IM15 (+playing) | as in round 250, then Undo; Space; +1 s; paste | Music clip at 2 again; the status contains `00:02.000`; playing |
| IM17 (+playing) | as in round 250, the playing split inserted after the first Undo | `splitDone('00:05.000')`, SFX [0, 5], playing; then the several-clips and outside parts unchanged |
| IM20 (+preventDefault, +Meta) | as in round 250, with Meta+Shift+Space added | each of the 3 keyDowns returns `false`; marker `2.000`, playhead = stop point, selection kept; after release Home → `0.000`, null |
| **IM22** | play/stop from 3 (stop > 4); read the line; Space, +1 s; Space; ruler click at 6; add `hit` on Music | `00:03.000` and `· insert marker 00:03.000`, with no `playhead` in the line; still `00:03.000` while playing (live > 3.5); `00:06.000` after the click; the add lands at 6 |
| **IM23** | play/stop from 2; selection 5–7; M, Enter; blur; selection 9–10; Space, +1 s; M, Enter | the markers contain 5 and not 2; while playing exactly one marker is added and it is at 9 (the selection start, not the live ≈ 10 that Space plays from) |
| R9-L1 (rewritten) | `StudioWorkspace` with the position and insert-marker store probes; 60 position frames; marker → 3; marker → 4.5 | the line contains `· insert marker 00:00.000`; the classes are exactly `font-mono tabular-nums`; the text is `00:00.000` on all 60 frames; then `00:03.000`, then `00:04.500`; `LibraryInsertMarkerText` renders 0 times; the same node throughout |
| playback-frames row | as before | `LibraryInsertMarkerText: 0` |
| library-preview C-R16-01 rows and the memo row | as before | the new text and testid; the memo row is unchanged in substance |
| ST49 | strings | 24 keys, `insertMarker: 'insert marker'` |
| TH row (obsidian) | SSR html | the new testid has `font-mono` and `tabular-nums` |

### 2.3 Doc 191 (grant 8)
- Georgian, with technical terms in English. The seven TEMPLATE headings stay in order (L26).
- l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 251 PASS)`.
- Add a "round 251 fix-up" part to each section:
  - **`## კონტექსტი`:** C-R250-01 (the line named the playhead while Add used the marker) and A-R250-REVIEW-PASTE-SPLIT-PLAYING.
  - **`## მიდგომა`:**
    - D-29z445, with the two rejected alternatives (drop the time; playhead while playing);
    - the direct-write pattern;
    - the `findFreeStart` note;
    - Live 4.10 (§3), kept apart from the inference.
  - **`## არქიტექტურა`:** the Mermaid diagram gains `insertMarkerStore → LibraryInsertMarkerText`.
  - **`## შეცვლილი ფაილები`:** the round-251 files.
  - **`## პრობლემები და გადაწყვეტები`:**
    - C-R250-01: the copy sweep covered only `strings.ts` → L29 now requires the sweep over `app/**`;
    - the stopped-only IM15/IM17 → playing branches.
  - **`## ტესტირება`:** IM15, IM17, IM20, IM22, IM23, R9-L1, ST49, and the §0.2 runs. Cite only rows that exist (grep, L26).
  - **`## TODO / შემდეგი ნაბიჯები`:**
    - add REGRESSION;
    - add B-R251-PASTEND-AT-END to the stage-2b list;
    - add the sheet `marker` copy to 10b.

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- [BR] the Live 12 Reference Manual ch. 4 "Working with the Browser", https://www.ableton.com/en/live-manual/12/working-with-the-browser/: 4.9 Previewing Files and 4.10 Adding Content from the Browser to a Live Set. Read on 2026-10-29 through WebFetch; only the first 100,000 characters of the page were read, and they include 4.9 and 4.10.
- [AV] ch. 6, the capture `b-round-71/ableton-arrangement-view-20261021.txt` (6.9 insert marker).

| Behaviour | Source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Enter or double-click on a sample, Arrangement | BR 4.10 | "In the Arrangement View, double-clicking or pressing Enter on a device or sample in the browser will load the item onto whatever track is currently selected." | The active track (as in Live) | C-ADD-251 (track: **confirmed**) |
| Where on that track | BR 4.10, AV 6.9 | **no sentence** on the time position; 6.9 defines the insert marker as the editing point | At the insert marker (approved review §10a) | C-ADD-251 (position: inference) |
| A position readout near the browser's add action | BR 4.9/4.10 | **no reference found**: 4.9 describes the Preview tab waveform, and neither section mentions a time readout | CZABA shows `insert marker <time>` in its existing line | C-CAPTION-251 (n/a) |
| Paste and split while playing | AV 6.9, 6.12 | as in round 250 (split at the clicked location) | At the insert marker | C-UNIT-251 (IM15, IM17) |

- **Better than Live (claim to test):** Live's insert marker is the only cue to where an Enter-added sample lands. CZABA also names the time next to Add, and it stays correct after a Stop and while playing.
- **Deviations (⚖):** none new. The ABL-R-6 reconciliation (SABA-Q-10A-DEVIATIONS (e)) is unchanged and still `awaiting_user`.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):**
   - HEAD;
   - exactly the 13 `M` paths;
   - `sha256sum -c` on the frozen 1,102 list, the root list and the grant start list.
2. **Apply** `b-round-250/precheck-251.diff` (`git apply -p1`, against the working tree), then write grant 8. `sha256sum -c b-round-250/expected-final-sha256.txt` from `store/` must give rc 0.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–7 clean; `npm run lint` rc 0.
4. **Covering set, run alone (D-29z447):** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-250/covering-251.txt)`. Expect 123 files, all green (1,843 tests: round 250's 1,841 plus IM22 and IM23). Any test above 50 % of its timeout is a STOP at the top of the report (L11).
5. **Mutants:**
   - Make a fixed scratch copy outside `store/`: a tar copy of the working tree after step 2, excluding `node_modules` and `.git`, with `node_modules` symlinked.
   - Run `b-round-250/mutants/run251.sh <scratch> <logdir>` (10 runs). Expect exactly the §0.2 table.
   - The repo `git status` must be identical before and after.
6. **code-reviewer:** run it on the round-251 diff (more than 3 files), after the covering run, never at the same time. Pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Run a copy of `b-round-250/caption-probe-251.cjs`; do not edit it in place. Expect the "Fix" column of §0.3.
8. **Report:** write `a-round-251.md` with:
   - the hunks;
   - the tests run, with counts;
   - the mutants;
   - the reviewer result;
   - any STOP, at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row.
- Wait for `Demo collection ready` (L48), then add `demo-stem-pulse` (the round-250 §0.3 recipe).
- Clicks are as in round 250 (§0.3 there): an empty-lane click picks the track and places the marker.
- Give every ruler click its own x, with ≥ 850 ms between clicks (INFO-B248-RULER-DBLCLICK); C-CAPTION-MOVE-251 has three.
- **The control is the round-251 start state, not HEAD.** Make a tar copy of the working tree (excluding `node_modules`, `.git`, `build` and `.vite*`), restore grants 1–8 from `b-round-250/r251-granted-start/`, and check it with `sha256sum -c` on the grant start list. Serve it on its own port with its own `.vite`, and stop it after use. `git archive dcb7eb1` lacks round 250 and is the wrong control.
- **Round-250 evidence carries over:** gate 251 publishes rounds 250 and 251 together. The round-250 rows ran on files that this round freezes byte for byte (C-SCOPE-251), so C does not re-run them all. It re-runs the add, paste and split rows that touch the changed line and the smoke row.

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-251 | HEAD, status, hashes | <ul><li>HEAD is `dcb7eb1`.</li><li>Status is exactly `M` on 17 paths: the 13 round-250 grants plus `ArrangementLibraryPreview.tsx`, `library-preview.test.tsx`, `render-budget.test.tsx` and `studio-theme-obsidian.test.tsx`. Nothing is untracked.</li><li>`sha256sum -c` on `b-round-250-r251-tree-sha256.txt` (1,102), on the root list and on `b-round-250/expected-final-sha256.txt` gives rc 0.</li><li>The 7 protected files give `git diff --quiet HEAD` rc 0.</li></ul> |
| C-UNIT-251 | `b-round-250/covering-251.txt` (123 files), run alone | All green, including IM1–IM23, R9-L1, the library-preview rows, ST49 and the TH row. The full suite is a gate row. |
| C-MUT-251 | the 10 runs of §0.2, once each, on a scratch copy outside the repo | The red rows are as listed. The repo status is identical before and after. |
| C-CAPTION-251 | SFX lane click at 3 s; Space, 1.5 s, Space; click the Soft impact row; read the line; + Add. A fresh context: the same, then Space (plays from 3), 1 s, read, + Add | Both times the line reads exactly `Active track: SFX · insert marker 00:03.000`, with no `playhead`, and the clip lands at `sfx@3.000` with `“Soft impact” added to the SFX track at 00:03.000.`. Playing continues. Control: `· playhead 00:04.5…` (stopped) and the live time (playing). |
| C-CAPTION-MOVE-251 | the line after each step: ruler click at 6 (stopped); Space, then a ruler click at 9 while playing; Space (stop); Ctrl+Shift+Space; Home | `00:06.000`; `00:09.000` while playback continues; the line does not change between frames while playing (sample it 10 times over 1 s); after Ctrl+Shift+Space it equals the stop point; Home gives `00:00.000` |
| C-CAPTION-WIDE-251 | L3: the Video lane active (its name button), library at its default width (288 px) | The line is 2 lines with the time inside its 32 px box (the last text rect's bottom ≤ the `<p>` bottom), `scrollWidth = clientWidth`. The control is 2 lines too. Record the width and the line count. |
| C-ADD-251 | Enter on the focused Soft impact row and a double-click on it, after a stop that differs from the marker | Each lands at the marker that the line names. The track is the active track (Live 4.10, confirmed). |
| C-PASTE-SPLIT-251 | the round-250 C-PASTE-250 and C-SPLIT-250, including the playing variants, at one viewport (1440) | `sfx@2.000` stopped and playing; split at `5.000` stopped and playing |
| C-BUDGET-251 | L39 | Persistent text lines outside the timeline equal round 250: empty 85/69, demo 101/85 at 1440/1280. |
| C-LESSON-251 | `lessons.md` | L29 contains `C-R250-01` and the words `app/**`; the file is ≤ 60 lines. |
| AN-REVIEW-251 | Doc 191 | <ul><li>l.4 is byte-exact `**სტატუსი:** In Progress (stage 2 of 3; C round 251 PASS)`.</li><li>The 7 headings are in order.</li><li>D-29z445 and the rejected alternatives are explained.</li><li>Every cited row exists (IM22 and IM23 included).</li><li>The TODO lists REGRESSION, stage 2b with B-R251-PASTEND-AT-END, 10b with the sheet copy, 9 and the questions.</li></ul> |
| LAB-SMOKE-251 | `/studio-lab` | It loads. Space plays and stops; Space again plays from the marker. The export WAV after adding `demo-stem-pulse` has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94`. 0 page errors. |
| Auth | Standing check | In a fresh context: <ul><li>`/studio-lab` opens anonymously, with `auth_user` null;</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and no `audio[src]`;</li><li>`/api/studio-token` with no header returns 401.</li></ul> |
| Purchased origin (browser) | The library line on the purchased copy | BLOCKED: backend unavailable in cloud. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. Gate 251's `verify.log` decides EXPORT-PROGRESS-LOAD-FLAKE-250. |

**Ableton parity** (C states it separately from the CZABA requirement):
- **Confirmed:** Enter or double-click adds to the selected track (4.10).
- **Inference:** the time position (the insert marker).
- **Not applicable:** the readout (Live has none).

A test PASS does not prove parity.

## 6. Neighbouring behaviour that could break (C probes these first)
- **The library preview:**
  - Play/Stop of the preview and the waveform cursor still move without renders (the library-preview memo row);
  - the Add button is disabled on the Video lane;
  - the `title` on the line is unchanged (`Active track: …`, without the time).
- **Drag-and-drop from the library:** still lands at the drop point, not at the marker (`dropLibrarySource`, unchanged).
- **The playhead readouts that stay:**
  - the transport clock;
  - the ruler handle `aria-valuenow`;
  - the detail-panel playhead;
  - the Overview playhead.

  All of them still move per frame while playing (the playback-frames row).
- **The export, video sync, history labels, clip drag and trim** are unchanged. Any change there is a regression.

## 7. Next (D-29z451)
- **PASS and gate:**
  - SABA-B-10a stage 2a is done (rounds 250 and 251, published together).
  - Closed: C-R250-01, A-R250-REVIEW-PASTE-SPLIT-PLAYING and A-R250-REVIEW-IM18-IM20-ASSERTS.
  - Also closed: the round-250 list (A-R249-REVIEW-IM3-CMD, A-R249-REVIEW-IM13-LEAK, B-R250-GESTURE-KEYS, GATE249-S1, C-EDIT-DIVERGE-249 and C-R249-INFO-PASTEND-WORDING).
- **FAIL on a product row:** a fix-up on the same grants first.
- **Then:**
  1. **REGRESSION-ROUND-2026-10-30** at the first planning on or after 2026-10-30, which is almost certainly the next one. It carries every `scope_additions` entry, including C-INSERT-MARKER-249, C-EDIT-MARKER-250 and the new C-CAPTION-251.
  2. **SABA-B-10a stage 2b:**
     - C-R235-02 Follow;
     - B-R250-NAV-ORIGIN;
     - B-R250-PLAYHEAD-TITLES;
     - the seconds-ruler role;
     - B-R251-PASTEND-AT-END;
     - doc 191 → `Completed (C round N PASS)`.
  3. Then SABA-B-10b (with the sheet `marker` copy), SABA-B-9 and SABA-B-11c. SABA-B-7 runs when Saba answers.
- **Checkpoints (non-blocking):**
  - A's round-250 Architecture note (a pure position-source resolver) is recorded as addendum 1 of GATE249-ARCH-TRANSPORT-POSITIONS. ARCH-CHECKPOINT-TRANSPORT-POSITIONS is requested at the 10a/10b boundary, after stage 2b.
  - ARCH-CHECKPOINT-TEMPO-GRID and ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS are still unanswered.
  - None blocks this round. This round does not touch `ArrangementContext.tsx`.
