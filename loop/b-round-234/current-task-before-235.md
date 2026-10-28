# Round 234: SABA-B-11a stage 1 — project tempo from the asset's catalogue BPM; musical grid and Snap on when a BPM exists; seconds when none (never invent 120)

**Planned by:** B, at the round 233 → 234 planning, 2026-10-28. **Decisions:** D-29z321…D-29z326.

**Type:** feature stage (Saba-approved, Medium). First stage of `SABA-B-9-10-11-TRANSPORT-GRID` → `SABA-B-11a` (stage 1 of 2). Stage 2 (round 235 or later) makes the bars ruler interactive and adds the top-strip click that starts playback (Saba decision 2).

**Why this and not SABA-B-7.** SABA-B-7 has its own pre-dispatch condition: the experts must confirm Live's exact taper with a manual source. That condition is unmet, because both consults found no published taper. The taper changes how projects sound, so under L44 it is Saba's decision.
- It is filed as `user-review/AGREE-SABA-B-7.md` and is `awaiting_user` (D-29z322).
- SABA-B-11a is already agreed by Saba and does not wait.
- The regression is not due (2026-10-28 < 2026-10-30).

**Read first:** `lessons.md` in full (57 lines).
- Directly relevant to this round:
  - L23 (pre-check done, §0.2);
  - L29 (B ran every recipe below in Chromium, §0.3);
  - L31, L39 (screen budget, row C-BUDGET), L40, L42;
  - **L43–L46 (new at this planning)**, especially **L45: build the reference's unit first**.
- For A: L11/L32/L33 (STOP), L12 (no class selectors), L26/L28 (doc 182).

**Not this round:**
- the bars ruler click, the scrub-strip playback and the seconds ruler's role (SABA-B-11a stage 2);
- adaptive grid and keys 4/5 (SABA-B-11b);
- Insert Marker (SABA-B-10a/b);
- the transport layout (SABA-B-9);
- empty-lane time selection and relative snap / F1-ABSOLUTE-SNAP (SABA-B-11c);
- the purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 is `deferred_user`). It will pass `bpm` once SRW-21 resumes; this round only adds the optional field;
- the clip envelope taper (SABA-B-7, `awaiting_user`).

## 0. Baseline and scope

**Baseline:** HEAD = `db5c297946e3295fec7b2647a2e66dd4cad10692` (gate 233 `published`, its `commit`). At the start, `git status --short --untracked-files=all` must be empty. B's check: `b-round-233/git-status-at-planning.txt` has 0 lines.
- If HEAD differs or any path is dirty at the start: **STOP** (L11).
- One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-233-r234-tree-sha256.txt` lists 1,085 tracked files: every tracked file except the 6 grants and the 4 root files. From `store/`, `sha256sum -c --quiet` gives rc 0 at planning. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/routes/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `entry.server.tsx`;
- `.claude/**`, `CLAUDE.md` and every config file;
- `ArrangementContext.tsx`, `tempo.ts`, `grid.ts`, `grid-divisions.ts`, `demo-synth.ts` and `ArrangementTempoRow.tsx`;
- `tempo-ui.test.tsx` and every other test.

**Root-owned, must equal HEAD:** the files in `b-round-233-r234-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Their start hashes are in `b-round-233-r234-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants
| # | Path | Change |
|---|---|---|
| 1 | `app/types/arrangement.ts` | `WorkspaceSource` gains `bpm?: number;` (§2.1). Nothing else. |
| 2 | `app/data/studio-lab-demo.ts` | §2.2: `bpm` on the 5 synthetic-composition sources only. |
| 3 | `app/lib/arrangement/strings.ts` | §2.4: one new formatter, `studioTempoStrings.seeded`. Nothing else. |
| 4 | `app/components/arrangement/StudioWorkspace.tsx` | §2.5 only: the seed refs, the seed effect, and one flag line each in `toggleSnap`, `changeGridDivision` and `changeTempo`, plus the imports they need. |
| 5 | `app/lib/arrangement/__tests__/strings.test.ts` | §2.6 only. Existing assertions unchanged. |
| 6 | `app/data/__tests__/studio-lab-demo.test.ts` | Add case DL-BPM (§2.6). Existing cases unchanged. |
| N1 | `app/lib/arrangement/tempo-seed.ts` | New (§2.3). |
| N2 | `app/lib/arrangement/__tests__/tempo-seed.test.ts` | New unit tests TS1–TS6 (§2.6). |
| N3 | `app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx` | New UI tests TU1–TU8 and mutant MU-A (§2.6). |
| N4 | `docs/implementation/2026/quarter-IV/182-saba-b-11a-tempo-seed.md` | New implementation doc (§2.7). |

The grants' start hashes are in `b-round-233-r234-granted-start-sha256.txt`. The lists are `b-round-233-r234-grants.txt` and `b-round-233-r234-new-files.txt`. None of the 4 new files exists at HEAD.

### 0.2 B's collision pre-check (L23, done)
B applied a sketch of §2 on a scratch copy (`git archive HEAD` → `/tmp/b233-scratch`, with `node_modules` symlinked), outside the repo and the loop folder. The diff is `b-round-233/precheck-scratch.diff` and the apply script is `b-round-233/precheck-apply.py`.
- **Static:** `tsc --noEmit` rc 0. `npx biome check` on the 5 touched source files is clean after `biome check --write`, which only reordered imports.
- **Covering set:** `b-round-233/covering-files.txt` lists every test file that mentions `StudioWorkspace`, `studio-lab-demo`, `studioTempoStrings`, `grid-divisions` or `tempo` (101 files).
  - First run: **100 files green, 1 red.** `strings.test.ts` ST17 and ST19 failed, because they pin the key list and the formatter-sample list of `studioTempoStrings`.
  - After the grant-5 edit: `strings.test.ts` 64/64 green.
  - Log: `b-round-233/precheck-covering.log` (1,530 passed plus the 2 granted collisions; 191 s).
- **Grep for demo-source pins:** only `app/data/__tests__/studio-lab-demo.test.ts` and `library-notice-ui.test.tsx` name the synthetic source ids. Neither deep-equals a source object (their `toEqual`/`toStrictEqual` hits are on other values), so adding `bpm` breaks nothing there.
- **No other fixture seeds:** every other UI test builds its own collection without `bpm`. The seed never runs there, so their default-grid assertions (seconds `1`, Snap off) stay true. This is why the sketch left 100 files green.
- **Browser, scratch build** (port 5174, now stopped; `b-round-233/probe-fix/seed.json`):
  - Add `demo-stem-pulse` → tempo `120`, `data-grid-division` `1/4`, `data-grid-seconds` `0.5`, `data-snap` `on`, 92 bars marks at 1440 (76 at 1280). The status is the placement text, then the seeded sentence, then `Snap on — grid 1/4 (G)`. 0 page errors.
  - Add `demo-soft-impact` or `demo-middle-east` → unchanged: `1`, `off`, empty tempo.

### 0.3 Render conditions, recipes, timeouts and testids (L29, L31, L40)
**Recipes (L29).** B ran all of these in Chromium at the baseline (`b-round-233/probe/seed.json`, `probe/recipes.json`, `probe/drag.json`, `probe/undo.json`).
- **Add by button:** wait until a button whose text starts with `Add` is enabled. Click `[data-source-id="<id>"]`, then click that `Add` button. The clip lands on the active (Music) track at 00:00.000.
- **Add by keyboard:** focus `[data-source-id="demo-synth-mix"]` and press Enter → one clip; the status reads "… added to the Music track at 00:00.000."
- **Grid by hand:** `selectOption('[data-testid="arrangement-grid-division"]', '0.5')` → `data-grid-division` `0.5`; the status reads "Grid: 0.5 s (Snap off)".
- **Snap by hand:** blur the active element and press `g` → `data-snap` `on`; the status reads "Snap on — grid 0.5 s (G)". Press `g` again → `off`.
- **Tempo by hand:** fill `[data-testid="arrangement-tempo-input"]` with `90` and press Enter → value `90`; the status reads "Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched."
- **Undo by keyboard:** right after Add (focus stays on the Add button), Ctrl+Z removes the clip; the status reads "Undo: Add — ღამის პულსი · პულსი" (`probe/undo.json`).
- **Clip drag:** press on the first `[data-clip-kind="audio"]` at its horizontal centre, **6 px below its top edge** (the header strip; a press in the waveform middle selects a range instead and does not move the clip). Move in 10 steps, then release.
  - At the default zoom the 16 s stem is 640 px wide (40 px/s; pxPerSecond = width / 16).
  - With Snap on at 0.5 s, a 0.7 s drag gives `data-clip-start` `0.500`.
  - With Alt held, a 0.3 s drag lands free (`0.800`).
- **State signals:**
  - `[data-testid="arrangement-grid-control"]` carries `data-snap`, `data-grid-division` and `data-grid-seconds` (`StudioWorkspace.tsx` l.2392–2396, always rendered).
  - `[data-testid="arrangement-bars-ruler"]` is always rendered. `[data-testid="arrangement-bars-mark"]` renders only when a tempo exists (0 marks at the baseline).
  - Each clip has `data-clip-start` (`ArrangementClip.tsx` l.866).

**Status line fit (L3).** `[data-testid="arrangement-status"]` is `white-space: normal` and 16 px high. B set the longest seeded status into it at the baseline: 188 chars, with the `demo-synth-mix` title twice. It stayed 16 px with `scrollWidth == clientWidth`, at 1280 (1,256 px) and at 1440 (1,416 px) (`b-round-233/probe/status-width.json`).

**Timeouts (L31).**
- In B's loaded covering run, the slowest single test is CP12d: 10.5 s of its declared 30 s (35 %). Gate 233 measured 8.0 s.
- At gate 233: `strings.test.ts` 162 ms, `studio-lab-demo.test.ts` 30 ms, `tempo-ui.test.tsx` 3.3 s for 12 tests (describe timeout 15 s).
- New UI file N3: declare `{ timeout: 15_000 }` on its describe, as `tempo-ui.test.tsx` does.

**Testids (L40).** No element with a `data-testid` changes structure or classes. Only attribute values change at runtime.

## 1. Why
Saba's decision 3 (2026-10-28):
- An asset with a BPM: Studio takes the tempo from the asset's catalogue BPM. The default grid is musical and Snap is on.
- No asset in the project has a BPM: the default grid is seconds. **Never invent 120 BPM.**
- A mixed project takes its tempo from the music asset.
- The user can switch the grid family by hand.
- The min:sec ruler always stays visible. Audio is never stretched.

Today `tempoBpm` starts as `null` (`StudioWorkspace.tsx` l.535) and only the user can type it. `WorkspaceSource` has no BPM field (`app/types/arrangement.ts` l.78–85), although the catalogue has one (`MusicAsset.bpm`, `app/types/asset.ts` l.23). So every project starts on a 1 s grid with Snap off (l.524, l.528–530), and the musical divisions are unreachable until the user types a BPM.

### Why we missed it (SABA-B-11; from `transport-grid-review.md` §3.5)
- **Which phase should have caught it:** B's spec at round 47 (SRW-14 stage 1). The original request FB-13 was musical. Round 47's own text said the musical divisions "need a tempo, SRW-15 … 120 is not silently assumed".
- **Why it did not:**
  - B built a seconds grid as a stand-in, and the stand-in stayed the default.
  - D-29z30 R4 decided "no default (120 is not assumed)" but never considered the product BPM, because `/studio-lab` is demo-only and `WorkspaceSource` had no BPM field.
  - The ABL review then recorded "fixed grid" as a deliberate difference (SRW-14 `note_round67`), and nobody sent it to Saba.
- **The rules that would have caught it:**
  - **L45:** build the reference's unit first. A stand-in unit never becomes the default without Saba, and "never assume X" names the real source.
  - **L44:** a planner's deviation is not a Saba decision.

  Both are added to `lessons.md` at this planning (D-29z323). C checks them in C-LESSON-234.

## 2. Changes

### 2.1 `WorkspaceSource.bpm`
`bpm?: number` is the asset's catalogue tempo in BPM. It is optional; a missing value means "unknown", never a default.

### 2.2 Demo data (`studio-lab-demo.ts`)
- `demo-synth-mix` and the four `demo-stem-*` sources get `bpm: 60 / DEMO_STEM_BEAT_SECONDS` (= 120).
  - This is the composition's real tempo: `demo-synth.ts` l.32 generates it at 0.5 s per beat, and l.51 uses 4 beats per bar. It is a fact of the asset, not an invented default.
  - Import the existing export; `demo-synth.ts` is frozen.
- `demo-middle-east`, `demo-hero-music`, `demo-soft-impact` and `demo-slow-rise` get **no `bpm`**. Their catalogue BPM is not available to `/studio-lab` (no backend), and SFX have none.

### 2.3 `tempo-seed.ts` (new, pure)
`findAssetTempoSeed(clips, tracks, sources): { bpm: number; source: WorkspaceSource } | null`
- It considers only clips on `audio` tracks whose source exists and qualifies:
  - the source's `kind` is `music` or `stem`. An `sfx` source is ignored even if it carries a `bpm` ("a mixed project takes its tempo from the music asset");
  - the source has a valid `bpm`: finite, rounded to 2 decimals as `parseTempoBpm` does, and within `TEMPO_BPM_MIN`…`TEMPO_BPM_MAX` (20…999). An invalid value counts as "no BPM".
- It returns the qualifying clip with the earliest `start`; ties keep array order. Otherwise it returns `null`.

### 2.4 String (`strings.ts`)
`studioTempoStrings.seeded({ bpm, title })` returns exactly:
`Tempo ${bpm} BPM from “${title}” — bars ruler on. Grid only: audio is not stretched.`
- `bpm` is formatted with `formatTempoBpm`; the title is the source's `title`.
- "audio is not stretched" stays in the status, per the CALM rule.

### 2.5 Seeding (`StudioWorkspace.tsx`)
**State:** three refs. `tempoSeedOpen` is true at mount; `gridHandChosen` and `snapHandChosen` are false at mount. None is in the undo history, the same as today's tempo, grid and Snap (D-29z30 R4).

1. **When:** an effect over `arrangement.clips`, `arrangement.tracks` and `collection.sources`. It runs only while `tempoSeedOpen` is true and the tempo is `null`. So it covers every path that adds a clip (Add, Enter, drag-drop, paste, duplicate, Redo), and an initial arrangement that already has clips.
2. **Seed:** if `findAssetTempoSeed` returns a seed, close the seed (`tempoSeedOpen = false`), set the tempo to `seed.bpm`, then:
   - if `gridHandChosen` is false → the musical division **`1/4`** (refs and state updated the same way `changeGridDivision` does);
   - if `snapHandChosen` is false → Snap **on**.
3. **Status:** one message, built from:
   - the current status text;
   - a space and `seeded(...)`;
   - only when step 2 turned Snap on: a space and the existing `studioGridStrings.snapOnStatus(gridDivisionLabel(<current division id>))`.

   Example from B's scratch build: `“ღამის პულსი · პულსი” added to the Music track at 00:00.000. Tempo 120 BPM from “ღამის პულსი · პულსი” — bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/4 (G)`. The placement announcement must not be lost.
4. **Hand choices:**
   - Any `changeTempo` call sets `tempoSeedOpen = false`. The user's tempo always wins, and clearing a set tempo is a choice too, so nothing re-seeds.
     - **Fact (B, `ArrangementTempoRow.tsx` l.157–172, l.183–206):** the row calls `onTempoChange` only when the committed value **changes**. An empty commit on an already empty field, re-committing the same value, Escape, and a blur with no edit call nothing. So tabbing through the field, or pressing Enter in the empty field, does **not** close the seed.
   - A division change that `changeGridDivision` accepts sets `gridHandChosen`. Set the flag **after** its two refusal guards (a musical id while there is no tempo; an unknown seconds step), so a refused change does not set it.
     - **Fact (B, grep at `db5c297`):** every hand path reaches `changeGridDivision`: the select (l.2423), keys 1/2 via `stepGridDivision` (l.1414), the triplet key via `toggleGridTriplet` (l.1428) and the grid menu (l.1458). The only other `setMusicalGridDivision` call is the tempo-clear path in `changeTempo` (l.1383), which is not a hand grid choice.
   - Any `toggleSnap` call sets `snapHandChosen`. **Fact:** `g` (l.2039), the grid menu's Snap item (l.1465) and the Snap button all call `toggleSnap`; `setSnapEnabled` has no other caller (l.1324).
   - So grant 4's three flag lines cover every hand path; no other call site needs a change.
5. **One-shot:** after a seed, nothing re-seeds in this session. Deleting the clip, an Undo of the placement, or adding a second asset with another BPM leaves the tempo, grid and Snap as they are. Undo leaves them because they are outside the history; this is recorded as a deviation (§3).
6. **No BPM:** if no clip has a qualifying source, nothing changes: the tempo is empty, the grid stays seconds `1`, Snap stays off, there are no bars marks, and no "120" appears anywhere.
7. **Audio:** the seed changes only the tempo, grid and Snap. No clip moves, and playback and export are unchanged.

### 2.6 Tests
**N2 `tempo-seed.test.ts`:**
- TS1: no clips → `null`.
- TS2: one stem clip with `bpm 90` → `{ bpm: 90, source }`.
- TS3: an `sfx` source with `bpm 140` is ignored; a `music` source with no `bpm` is ignored.
- TS4: two qualifying clips (90 at 4 s, 140 at 1 s) → 140 (earliest start). With equal starts, the first in array order wins.
- TS5: invalid values (`NaN`, `Infinity`, `0`, `19.99`, `1000`) → `null`; `92.456` → `92.46`.
- TS6: a clip on a video track whose source has a `bpm` is ignored.

**N3 `tempo-seed-ui.test.tsx`.** It uses its own fixture collection: a `stem` with `bpm: 90`, a `stem` with `bpm: 140`, an `sfx` with no `bpm` and a `music` source with no `bpm`. Clips are added with the library's Add button or Enter.
- TU1: the mount state is unchanged: empty tempo, division `1`, Snap off, 0 bars marks.
- TU2: adding the bpm-90 stem gives:
  - tempo field `90`, `data-grid-division` `1/4`;
  - `data-grid-seconds` = 60/90 (0.6667; compare with `toBeCloseTo`);
  - `data-snap` `on`, bars marks > 0;
  - a status that equals the placement text + `seeded` + `Snap on — grid 1/4 (G)` exactly.
- TU3: adding the sfx and the bpm-less music first changes nothing; adding the bpm-90 stem afterwards seeds 90.
- TU4: a tempo typed first (100, Enter) is kept when the stem is added, and the status has no seeded sentence. A tempo set and then cleared (100, Enter; empty, Enter) stays empty after the stem is added. **Must-seed case:** Enter in the still-empty field, or focus and blur it without typing, does not close the seed: adding the stem then seeds 90.
- TU5: a division chosen by hand first (`0.5`) is kept: tempo 90, division `0.5`, Snap on. Snap toggled by hand first (G, G → off) stays off: tempo 90, division `1/4`, and no "Snap on" part in the status.
- TU6, one-shot: after the seed, adding the bpm-140 stem leaves the tempo at 90. Undo of both placements leaves tempo 90, `1/4` and Snap on.
- TU7: after the seed, a clip drag snaps to multiples of 60/90 s (use one existing drag helper). The Alt bypass is unchanged.
- TU8: an initial arrangement that already contains the bpm-90 stem clip seeds at mount.
- **Mutant MU-A (red-proof of the effect):** remove the seed effect; TU2, TU3, TU6 and TU8 must turn red. Apply and revert it in the working copy, and report it in `a-round-234.md`. The final file contains no mutant.

**Grant 5 (`strings.test.ts`):**
- add `'seeded'` to `EXPECTED_V02C2_KEYS.studioTempoStrings`;
- add a `seeded` entry to `V02C2_FORMATTER_SAMPLES.studioTempoStrings` with a Latin title (`'Night pulse · Pulse'`), so ST19 holds;
- add one assertion of its exact English output;
- add `'../tempo-seed.ts'` to the ST19 no-Georgian source list.

**Grant 6 (`studio-lab-demo.test.ts`), DL-BPM:** the 5 synthetic sources have `bpm === 120`, and the 4 others have no `bpm` property (`'bpm' in source` is false).

### 2.7 Doc N4 (182)
Written in Georgian, with technical terms in English.
- L26 headings.
- l.4 is exactly `In Progress (stage 1 of 2; C round 234 PASS)` (L28, multi-stage).
- It records the seed rules (§2.5), the 1/4 choice (D-29z324), the deviations (§3) and the open stage 2, and cites L45.
- It cites only tests that exist (TS1–TS6, TU1–TU8, DL-BPM).

## 3. Reference: how Ableton Live 12 does it
**Sources:**
- the Live 12 manual, checked by B with WebFetch on 2026-10-28: [9 Audio Clips, Tempo, and Warping](https://www.ableton.com/en/live-manual/12/audio-clips-tempo-and-warping/) (9.1.1, 9.1.4, 9.2, 9.2.1, 9.2.4.1, 9.2.5.1; the fetch read 100k of 123k chars);
- [6 Arrangement View](https://www.ableton.com/en/live-manual/12/arrangement-view/) 6.1 and 6.10, quoted in `transport-grid-review.md` §3.1;
- video findings in `reference/youtube/SABA-B-9-10-11-transcripts.md` (root, 2026-10-28).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Where the project tempo comes from | 9.1.1 "The Control Bar's tempo field lets you adjust the playback tempo of your Live Set" | Tempo is a Set value the user sets. **Nothing read in chapter 9 says Live changes the Set tempo when a clip is added.** Making the Set follow a clip is a separate action (9.1.4 Leader; 9.2.5.1) | **Deviation (Saba decision 3, 2026-10-28):** the first music or stem asset with a catalogue BPM seeds the project tempo once | C-SEED-STEM, C-SEED-ENTER |
| Grid unit | 6.10 "grid lines that represent the meter subdivisions of the song tempo"; video riOD 2:22 (`SABA-B-9-10-11-transcripts.md`): clip moves and edge trims snap to the edit grid, Alt bypasses while dragging | A musical grid; snapping clip moves; Alt bypass | A musical `1/4` after a seed (L45: the reference unit) | C-SEED-STEM, C-SNAP |
| Tempo does not stretch audio | 9.2 "When the Warp switch is off, the sample plays at its original tempo, unaffected by the Set's current tempo" | Stretching comes from warping, not tempo | CZABA has no warping; the tempo is grid-only (D-29z30) | C-EXPORT |
| Two rulers | 6.1: a beat-time ruler (bars-beats-sixteenths) and a time ruler (min-sec-ms) | Both exist | The min:sec ruler stays visible; the bars ruler shows marks once a tempo exists. Their interaction roles change in stage 2 | C-SEED-STEM (marks), C-SHOTS-234 |
| Default grid and Snap in a new Set | — | **Not found** in the manual (Live's default tempo and Snap state are unconfirmed) | **Saba decision:** Snap on with a BPM; seconds and today's Snap off without one | C-NO-BPM |
| Default division | 6.10: adaptive or fixed; the default width is not stated | Not found | A fixed `1/4` until 11b adds adaptive (D-29z324) | C-SEED-STEM |
| A tempo change is undoable | 9.1.1 (the tempo is part of the Set) | Inference only: Set changes are in Live's undo history | **Deviation (existing, D-29z30 R4):** tempo, grid and Snap are outside CZABA's history, so an Undo of the placement keeps them. Sent to Saba once as `SABA-Q-TEMPO-UNDO` (L44) | C-ONESHOT |
| Seconds grid | 6.10; `transport-grid-review.md` §3.4: Live has no seconds grid | Confirmed absent | **Saba decision:** seconds when there is no BPM, as in Logic and Pro Tools | C-NO-BPM |

**Deviations, with their reasons:**
- the asset-BPM seed and the seconds fallback are Saba's decisions;
- the undo exclusion is the existing D-29z30 R4, and it goes to Saba as a question;
- `1/4` is a stand-in until adaptive (11b).

None of them is there because it is "simpler to build".

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. `npm run typecheck` rc 0. `npm run lint` clean (or `npx biome check` on every changed file).
2. Run `npx vitest run $(cat ../tmp/studio-real-loop/b-round-233/covering-files.txt) app/lib/arrangement/__tests__/tempo-seed.test.ts app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx`. Everything must be green. Report at the top any test over 50 % of its timeout (L32).
3. Mutant MU-A (§2.6), applied and reverted.
4. `code-reviewer` (3+ files changed). Pass its Architecture note to B.
5. Self-check (L15/L39): no new persistent text. In your own Playwright run on `/studio-lab`, the §2.5 status example stays on one line at 1280×720 (screenshot).
6. Write `a-round-234.md`: the changed files, the tests run with counts, MU-A, the reviewer's result, and any STOP at the top.

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720, fresh context per row)
| Row | What | Pass when |
|---|---|---|
| C-SCOPE-234 | HEAD, status, hashes | <ul><li>HEAD is `db5c297`;</li><li>only the 6 grants are `M`, plus the 4 new files;</li><li>`sha256sum -c` on the frozen and root lists gives rc 0;</li><li>protected files: `git diff --quiet HEAD` gives rc 0.</li></ul> |
| C-UNIT-234 | The 2 new test files, `strings.test.ts`, `studio-lab-demo.test.ts` and `tempo-ui.test.tsx` | All green. C runs only these; the full suite is a gate row. |
| C-SEED-STEM | Add `demo-stem-pulse` by button (§0.3) | <ul><li>tempo field `120`;</li><li>`data-grid-division` `1/4`, `data-grid-seconds` `0.5`, `data-snap` `on`;</li><li>bars marks > 0;</li><li>the status is the placement text + ` Tempo 120 BPM from “ღამის პულსი · პულსი” — bars ruler on. Grid only: audio is not stretched.` + ` Snap on — grid 1/4 (G)`;</li><li>0 page errors; screenshot.</li></ul> |
| C-SEED-ENTER | Enter on `demo-synth-mix` | The same as C-SEED-STEM, with that title. |
| C-NO-BPM | In separate contexts: Add `demo-soft-impact`; Add `demo-middle-east`; Add `demo-slow-rise` then `demo-hero-music` | Tempo empty, division `1`, Snap `off`, 0 bars marks; `document.body.innerText` contains no `120 BPM`. |
| C-MIXED | Add `demo-soft-impact`, then `demo-stem-bass` | Nothing changes after the first. After the second: the seed (120, `1/4`, on). |
| C-USER-WINS | (a) tempo 90 + Enter, then Add pulse; (b) tempo 90 + Enter, then empty + Enter, then Add pulse; (c) focus the empty tempo field, press Enter, then Add pulse | (a) the tempo stays `90` and the status has no `from “`; (b) the tempo stays empty and the division `1`; (c) **seeds** (120, `1/4`, on): an untouched empty field is not a choice. |
| C-HAND | (a) grid `0.5` by select, then Add pulse; (b) `g`, `g`, then Add pulse | (a) tempo 120, division `0.5`, Snap on; (b) tempo 120, division `1/4`, Snap `off`, and the status has no `Snap on`. |
| C-ONESHOT | (a) after C-SEED-STEM: tempo field 100 + Enter, then Add `demo-stem-lead`; (b) a new context: Add pulse, then Ctrl+Z | (a) the tempo stays `100`; (b) the clip is gone; tempo `120`, `1/4` and Snap on remain. |
| C-SNAP | After a seed, the clip-drag recipe (§0.3): 0.7 s, then 0.3 s with Alt | The first ends at `data-clip-start` `0.500` (a multiple of 0.5 s, ±1 ms); the Alt drag lands free (`0.800`). |
| C-EXPORT | In one context: Add pulse (seeded) and export a WAV; clear the tempo field (Enter) and export a WAV again | The two WAVs are byte-identical (sha256), and the clip did not move. |
| C-STATUS-FIT | The C-SEED-ENTER status | The status box is 16 px high and `scrollWidth <= clientWidth`, at both viewports (L3). |
| C-BUDGET | L39 screen budget | Count the persistent text lines outside the timeline on the empty project and after C-SEED-STEM. Compare with B's baseline screenshots `b-round-233/probe/baseline-after-add-*.png`. No new persistent line outside the timeline; the bars numerals are timeline content. |
| C-REF-234 | §3 | Each row matches or is a listed deviation. |
| C-LESSON-234 | `lessons.md` | L43–L46 are present, the file has ≤ 60 lines, and doc 182 cites L45. |
| AN-REVIEW-234 | Doc 182 | L26 headings; l.4 byte-exact; it cites only existing test ids. |
| LAB-SMOKE-234 | `/studio-lab` | It loads; Play/Pause works in a seeded project; 0 page errors. |
| C-SHOTS-234 | Evidence | Before/after full-window screenshots at both viewports, of the empty and the seeded project. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate` in `c-round-234.json`, not claimed in `passed`. |

The different-BPM and initial-arrangement cases (TU4–TU8, with 90 and 140) cannot be reproduced in `/studio-lab`, where every demo BPM is 120. They are unit and UI rows only.

## 6. Neighbouring behaviour that could break (C probes these first)
- **Snap on after a seed can make clips jump** on small drags. That is F1-ABSOLUTE-SNAP (Medium, accepted, closed by SABA-B-11c). Record it as known if you see it. It is not a new bug of this round unless a jump is larger than one 1/4 division.
- The tempo field, its clearing and the metronome (which needs a tempo) behave as in `tempo-ui.test.tsx`.
- Grid menu and select: with a tempo, the musical divisions are listed, and choosing seconds still works.
- The loop brace and marker snapping use the grid, which is 0.5 s after a seed.
- The status announcement after Add still names the clip and the track (a11y).
- Render budget: the effect must not add renders on playback frames (`render-budget.test.tsx` is in the covering set).

## 7. Outcomes for B's next planning
- **PASS and gate published:** SABA-B-11a stage 2 (the bars ruler becomes interactive, the scrub strip starts playback, the seconds ruler's role). If planning is on or after 2026-10-30, the REGRESSION round comes first.
- **FAIL:** a fix-up on the same grants.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.

## 8. Root notes
- `user-review/AGREE-SABA-B-7.md` is for Saba (Georgian). It asks for transcripts of 4 picked videos, to go to `reference/youtube/SABA-B-7-transcripts.md`.
- The checkpoint request `b-round-231-checkpoint-request.md` (ARCH-CHECKPOINT-SABA-B-8-END) now has a round-233 addendum and is ready for root (non-blocking).
- New Saba question `SABA-Q-TEMPO-UNDO` (§3) is recorded in `backlog.json`.
