# CURRENT TASK — Round 134: VISUAL-A V-0.3a — grid and Snap texts in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 133)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`, with the R6 clarification of round 133:
  - `strings.ts` is a leaf module (it imports nothing), with one object per area;
  - it holds plain strings plus small pure formatters, and no type assertions;
  - formatters take values that are already formatted; a branch that only picks between two texts stays in the caller;
  - **existing exported names keep their names and signatures and get their values from the module**.
- **Previous task:** `tasks/round-133.md` (exact copy of the round-133 `current-task.md`, sha256 `1f8656ad…`). Rationale: `b-round-133.md`. Decision record: **D-29z99** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `ee40ad608a7652e23cb5a55ef84bc0f82360c525`** (gate 133 published; HEAD). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-133-r134-tree-sha256.txt`, **930 entries** = `git ls-files -co --exclude-standard` (946) minus the 16 grants in `b-round-133-r134-grants.txt`. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 16 grants:** `b-round-133-r134-granted-start-sha256.txt`. **Start copies:** `b-round-133/r134-granted-start/` (paths relative to `store/`; `sha256sum -c` was OK there at planning). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z99)
- **Round 133: C PASS.** `browserVerified` = `realVerified` = true.
  - GROUP and LANE texts were exact at both viewports, and their effects were unchanged.
  - GEO-COUNT was 0 over 59 steps; layout stayed within 1 px; the lane hint never wrapped.
  - G133-3 returned 401. The fake-Bearer 403 check is BLOCKED (backend unavailable in cloud).
  - Gate 133 published `ee40ad6` (verify OK, review 9/10). **V-0.2c3 is done, so V-0.2 is complete.**
  - C found one new Low, C-R133-L1 (pre-existing): a successful fold leaves the earlier refusal in the status line. It goes to `deferred_low_polish`.
- **`tasks/round-133.md` §8 fixed this step:** after a PASS comes V-0.3 stage 1, measured first and split by component if it is larger than one round.
  - **The strings-split checkpoint has not run.** There is no frontend-architect result for `b-round-130-checkpoint-request.md` addenda (e)/(f) in `gates/`, the loop folder or `store/.claude/references/` (checked at planning).
  - §8 says that in that case B plans stage 1 on files that do not depend on the split decision. **Rationale:** `ArrangementExportDialog.tsx` l.10 and `ArrangementContext.tsx` l.156 already import from `~/lib/arrangement/strings`. Any split must therefore keep that import path valid, for example `strings/index.ts` with the same names. A new `studioGridStrings` object imported through that same path adds no new dependence on the decision. If root later approves a split, this object moves mechanically with the other twelve.
  - B re-asked root for a bounded checkpoint (addendum (g)). It is not a block.
- **Not due:** the regression round (`regression-last.json` = 2026-10-24, round 122; due on or after 2026-10-27).
- **Nothing open that comes first:** no Critical, High or Medium finding is open. `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
- **B's measurement (exact greps at `ee40ad6`):**
  - **V-0.3 area:** 108 Georgian source lines in 11 files: StudioWorkspace 38, Transport 20, MarkerRow 16, grid-divisions 15, LoopBrace 5, MarkerMenu 4, TempoRow 3, Overview 3, Ruler 2, grid.ts 1, waveform-zoom 1.
  - **Inventory correction:** 3 files that hold Georgian were in no stage:
    - `ArrangementGridMenu.tsx` l.6 (`GRID_MENU_LABEL`, the same text as the StudioWorkspace select aria-label) → **this round**;
    - `panels.ts` l.8 and `clip-gain-multi.ts` l.113 → V-0.4 (detail panel).
  - **V-0.3 split (D-29z99 R1),** by surface and measured coupling:

    | Stage | Scope | Size |
    |---|---|---|
    | **V-0.3a, this round** | Grid and Snap | 22 source lines, **104 test pin lines in 9 files** |
    | V-0.3b | Transport, TempoRow, Ruler, Overview, LoopBrace, MarkerMenu | about 71 test lines in 30 files* |
    | V-0.3c | MarkerRow | about 84 test lines in 15 files* |
    | V-0.3d | The rest of StudioWorkspace + `waveform-zoom.ts` | about 83 test lines in 34 files* |

    \* Fragment-based estimates. Each stage is re-measured at its own planning.
  - **Why V-0.3a is one round, not two:** the 104 pins are mechanical. A label/status split would touch the same pins twice, because every grid status interpolates the division label. It would also leave `Grid: 1 s` and `ბადე: 1 s` mixed for a round. A gets a checkpoint rule (§2) in case the context grows.
- **Ruling D-29z99 R2 — the grid surface moves whole, including its StudioWorkspace lines.** A lib-only round would create new two-language composites on the very surface being cleaned:
  - the Snap status `Snap ჩართულია — ბადე 1 s (G)`;
  - an English `Triplets (3)` item next to the Georgian menu label in one component.

  So this round also takes these lines:
  - the five grid/Snap literals in StudioWorkspace (l.158, l.1276, l.2270–2271, l.2312);
  - `ArrangementGridMenu.tsx` l.6.

  StudioWorkspace is half-migrated for now, as ArrangementContext was during V-0.2a–c1. **Guard:** the ST13-style ratchet ST25 (§3.1).
- **Ruling D-29z99 R3 — `waveform-zoom.ts` waits for V-0.3d.** Its one string is the same sentence as the StudioWorkspace waveform-zoom aria-label/title (l.2370–2371). The pair moves together, so one sentence never exists in two languages.
- **Folded in (the round owns the code, and each costs little):**
  - **GATE133-DOC109-STATUS** (gate-133 reviewer, finding 1): doc 109 l.4 and l.128.
  - **GATE133-GROUP-RENAME tracking** (gate-133 reviewer, finding 2): one TODO line in doc 109. The rename statuses at StudioWorkspace l.953/963 are **not** changed here; they belong to V-0.3d.
  - **GATE133-GEO-RANGE** (gate-133 reviewer suggestion): widen `GEORGIAN_CODEPOINT` in `strings.test.ts` to include Mtavruli U+1C90–1CBF and Nuskhuri U+2D00–2D2F, with a self-check (ST25).

## 1. What changes (user-visible)
One new exported object in `app/lib/arrangement/strings.ts`: **`studioGridStrings`**. Every Georgian literal below moves there, in English.

**Text only.** None of these change:
- the division lists, ids, `beats`, steps or their order;
- `adjacentGridDivisionId`, the family logic, snapping, `gridLinesVisible`, or keys 1/2/3/G;
- the menu behaviour, focus, or any condition or non-string expression.

### 1.1 The English map (exact text; A may not reword it — if a line seems wrong, report it and B rules)
Notation:
- `{label}` = the output of `gridDivisionLabel(id)`;
- `{step}` = `String(step)` or the already-rounded `String(Math.round(step * 1000) / 1000)`, exactly as the caller computes it today;
- `{bpm}` = `formatTempoBpm(bpm)`;
- `{tempoCleared}` = `tempoStatusMessage(null)` (already English).

| # | Where today (baseline line) | Object.key (A may rename the key, not the text) | English |
|---|---|---|---|
| GR1 | `grid.ts` l.177 `formatGridDivision` | `seconds(step)` | `{step} s` (e.g. `0.25 s`, `10 s`) |
| GR2 | `grid-divisions.ts` l.5 bar label | `barLabel` | `1 bar` |
| GR3 | `grid-divisions.ts` l.25 `GRID_TRIPLET_MENU_LABEL` | `tripletMenuLabel` | `Triplets (3)` |
| GR4 | `grid-divisions.ts` l.132 narrow end | `narrowest(label)` | `The grid is already at its narrowest — {label} (1)` |
| GR5 | `grid-divisions.ts` l.134 widen end | `widest(label)` | `The grid is already at its widest — {label} (2)` |
| GR6 | `grid-divisions.ts` l.142 Snap state | `snapOnSuffix` / `snapOffSuffix` | `(Snap on)` / `(Snap off)` (the `snapEnabled ? :` branch stays in the caller) |
| GR7 | `grid-divisions.ts` l.144 status | `status({label, snap})` | `Grid: {label} {snap}` |
| GR8 | `grid-divisions.ts` l.147 musical status | `statusMusical({label, step, bpm, snap})` | `Grid: {label} · {step} s at {bpm} BPM {snap}` |
| GR9 | `grid-divisions.ts` l.151 tempo cleared | `backToSeconds({tempoCleared, label})` | `{tempoCleared} Grid back to seconds: {label}.` |
| GR10 | `grid-divisions.ts` l.155 | `barsGroup(bpm)` | `Bars · {bpm} BPM` |
| GR11 | `grid-divisions.ts` l.159 | `tripletsGroup(bpm)` | `Triplets · {bpm} BPM` |
| GR12 | `grid-divisions.ts` l.164 | `tripletNeedsTempo` | `Triplets need a tempo — enter a BPM first (3)` |
| GR13 | `grid-divisions.ts` l.167 | `tripletNotOnBar` | `1 bar has no triplets — choose 1/2 or narrower (3)` |
| GR14 | `grid-divisions.ts` l.169 | `tripletNeedsBarsGrid` | `Triplets work only on the bars grid — choose 1/2 … 1/32 (3)` |
| GR15 | `grid-divisions.ts` l.175 | `titleLinesVisible(label)` | `Grid {label} · 1 — narrower, 2 — wider` |
| GR16 | `grid-divisions.ts` l.176 | `titleLinesHidden(label)` | `Grid {label} — lines are hidden at this zoom; Snap still works. Zoom in. · 1 — narrower, 2 — wider` |
| GR17 | `ArrangementGridMenu.tsx` l.6 `GRID_MENU_LABEL` **and** `StudioWorkspace.tsx` l.2312 select `aria-label` | `menuLabel` | `Grid division` |
| GR18 | `StudioWorkspace.tsx` l.1276 Snap-on status | `snapOnStatus(label)` | `Snap on — grid {label} (G)` |
| GR19 | `StudioWorkspace.tsx` l.2270 Snap button title (on) | `snapOnTitle` | `Snap on — clips land on the grid (G)` |
| GR20 | `StudioWorkspace.tsx` l.158 `SNAP_OFF_MESSAGE` **and** l.2271 Snap button title (off) — the same text today | `snapOff` | `Snap off — free movement (G)` |

Examples that must come out exactly:
- `gridDivisionStatusMessage('0.5', null, true)` → `Grid: 0.5 s (Snap on)`
- `gridDivisionStatusMessage('1/4', 90, true)` → `Grid: 1/4 · 0.667 s at 90 BPM (Snap on)`
- `gridDivisionStatusMessage('1/4T', 90, false)` → `Grid: 1/4T · 0.444 s at 90 BPM (Snap off)`
- `gridDivisionEndMessage('bar', 'widen')` → `The grid is already at its widest — 1 bar (2)`
- `gridTempoClearedMessage(0.5)` → `Tempo cleared — the bars ruler is hidden. Audio is unchanged. Grid back to seconds: 0.5 s.` (**closes GATE132-TEMPO-CLEARED-MIXED**)
- `gridDivisionTitle('0.1', false)` → `Grid 0.1 s — lines are hidden at this zoom; Snap still works. Zoom in. · 1 — narrower, 2 — wider`

- **Facts that must survive (a dropped one is Medium):**
  - GR4/GR5: the end direction and the key (1)/(2);
  - GR8: the step in seconds **and** the tempo;
  - GR9: the grid went back to seconds, plus its label;
  - GR12–GR14: each refusal reason, its remedy and the (3) key;
  - GR15/GR16: both key hints (1 narrower, 2 wider);
  - GR16: lines hidden, Snap still works, zoom in;
  - GR18: the division label;
  - GR19/GR20: the clip effect (lands on the grid / free movement) and (G).
- **Exported names stay; their values move.**
  - `formatGridDivision(step)` returns `studioGridStrings.seconds(String(step))`.
  - In `MUSICAL_GRID_DIVISIONS`, the bar entry's `label` becomes `studioGridStrings.barLabel`; the array, its `as const` and the other entries are unchanged. `MusicalGridDivisionId` is built from `['id']` only, so the label type change is safe. If typecheck says otherwise, that is a **stop rule**.
  - `GRID_TRIPLET_MENU_LABEL = studioGridStrings.tripletMenuLabel`.
  - `gridDivisionEndMessage`, `gridDivisionStatusMessage`, `gridTempoClearedMessage`, `gridMusicalGroupLabel`, `gridTripletGroupLabel`, `gridTripletRefusalMessage` and `gridDivisionTitle` keep their signatures and branches, and return the module texts.
  - StudioWorkspace keeps the `SNAP_OFF_MESSAGE` name (value `studioGridStrings.snapOff`) and the title ternary. Only the two picked texts change.
  - `ArrangementGridMenu.tsx` keeps the `GRID_MENU_LABEL` name (value `studioGridStrings.menuLabel`). `GRID_MENU_SNAP_LABEL` (`Snap (G)`) is already English and unchanged.
- **Imports:**
  - `grid.ts` and `grid-divisions.ts` import from `./strings`;
  - `StudioWorkspace.tsx` and `ArrangementGridMenu.tsx` import from `~/lib/arrangement/strings` (the path ArrangementExportDialog already uses);
  - `strings.ts` still imports nothing.
- **Unchanged this round** (they stay Georgian; C subtracts them by name):
  - (a) the other 33 Georgian lines of StudioWorkspace, listed exactly in `b-round-133/r134-studioworkspace-remaining-georgian.txt`. They include the Follow/Zoom/Fit statuses, the Envelope toggle, the waveform-zoom label, the range/selection readout, the lane Shift hints (GATE133-LANE-HINT-MIXED), the group rename statuses (GATE133-GROUP-RENAME) and the video/library panel statuses. All go to V-0.3d.
  - (b) Transport, TempoRow, Ruler, Overview, LoopBrace and MarkerMenu (V-0.3b), and MarkerRow (V-0.3c).
  - (c) the track names, the default group names, the lane/clip/detail texts (V-0.4), and the library and video dock (V-0.5).
- **Glossary additions** (doc 110 and the backlog glossary):
  - ბადე = Grid;
  - ბადის დანაყოფი = Grid division;
  - ტრიოლები = Triplets;
  - 1 ტაქტი = 1 bar (CZABA label; unconfirmed as a Live menu name);
  - უფრო მჭიდრო / უფრო ფართო = narrower / wider (Live 12 §6.10 "narrows/widens the grid");
  - Snap ჩართულია / გამორთულია = Snap on / Snap off;
  - თავისუფალი გადაადგილება = free movement;
  - წმ = s (existing).

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add `studioGridStrings` with GR1–GR20. The twelve existing objects are unchanged. It still imports nothing |
| `app/lib/arrangement/grid.ts` | **Only:** the import and l.176–178 (`formatGridDivision` body) |
| `app/lib/arrangement/grid-divisions.ts` | **Only:** the import, l.5 (bar label value), l.25, and the string expressions in l.130–177 as in §1.1. Every condition and non-string line is unchanged |
| `app/components/arrangement/ArrangementGridMenu.tsx` | **Only:** one added import line and l.6 |
| `app/components/arrangement/StudioWorkspace.tsx` | **Only:** one added import (or a name added to an existing import), l.158, l.1276, l.2270–2271, l.2312. Nothing else, including the other 33 Georgian lines |
| `app/lib/arrangement/__tests__/strings.test.ts` | Widen `GEORGIAN_CODEPOINT` (l.50) to `/[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/`. New `describe('V-0.3a grid and Snap strings')` with ST23–ST25 (§3.1). ST1–ST22 are unchanged |
| `app/lib/arrangement/__tests__/grid.test.ts` | l.157–163 → hand-written English |
| `app/lib/arrangement/__tests__/grid-musical.test.ts` | l.44, 57, 106, 108, 111, 113–116, 118, 120–123, 125, 127, 129 → hand-written English |
| `app/lib/arrangement/__tests__/grid-triplet.test.ts` | l.43, 54–56, 151, 152, 157, 160, 162, 166, 168 → hand-written English |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | l.106, 109 (with its continuation line), 295, 298, 299, 301–307, 408, 425, 429, 435, 438, 585 → hand-written English |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | l.109, 111, 112, 403, 411, 423, 450, 458, 468, 473, 476, 602, 672, 725, 783, 863, 891 → hand-written English |
| `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` | l.104–106, 315, 317, 399, 410 → hand-written English |
| `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` | l.112, 113, 399, 421, 423, 490, 522–524, 528, 537, 562, 576 → hand-written English |
| `app/lib/arrangement/__tests__/grid-triplet-ui.test.tsx` | l.113, 114, 118–121, 456, 466, 470, 474, 478, 528, 537, 564 → hand-written English |
| `app/lib/arrangement/__tests__/tempo-ui.test.tsx` | **Only l.104** `SNAP_ON_STATUS` → `'Snap on — grid 1 s (G)'` |
| `docs/implementation/2026/quarter-IV/109-studio-v0-lane-move-group-strings.md` | l.4 → `**სტატუსი:** Completed (A-ის შემოწმებები მწვანეა რაუნდ 133-ში; C round 133 — PASS, browserVerified; gate 133 — ee40ad6)`. l.128 → `- ბრაუზერის შემოწმება (GROUP, LANE, GEO-COUNT, LAYOUT): C round 133 — PASS, browserVerified (c-round-133.json).` Add one TODO line under V-0.3: `GATE133-GROUP-RENAME — ჯგუფის გადარქმევის სტატუსები (StudioWorkspace l.953/963) V-0.3d-ში, studioTrackGroupStrings-ის renamed/renameEmpty-ით და quoted()-ით.` Nothing else |
| **new** `docs/implementation/2026/quarter-IV/110-studio-v0-grid-snap-strings.md` | Sections from TEMPLATE.md, in Georgian: the GR map; rulings R1 (the V-0.3 split and its measurement), R2 (the grid surface moves whole; StudioWorkspace ratchet), R3 (waveform-zoom → V-0.3d), the checkpoint note (§0); the closed GATE132-TEMPO-CLEARED-MIXED; the facts that must survive; the glossary additions; the tests and the mutations. The status line says Completed only after §4 is green, and names C's round as still to come |

- **Test rules (as in rounds 129–133):**
  - Every replaced pin is a **hand-written English literal** with the same matcher (GATE130-S3). Where a file holds a shared constant (`SNAP_ON_STATUS`, `HIDDEN_LINES_TITLE`, `KEYS_TITLE_SUFFIX`, `SECONDS_LABELS`, `MUSICAL_LABELS`, `NO_TEMPO_REFUSAL`, …), change the constant **once**; do not inline it.
  - No `it` is added, removed or renamed outside the new `describe` in `strings.test.ts`. If a test **title** contains a Georgian grid text, report it and leave it.
  - Line numbers are baseline (`ee40ad6`) positions. Find each line by its text.
- **Pre-edit grep (A records it):**
  - For each GR row, grep the old Georgian text in `app/**` and `e2e/**`. Also grep `\d წმ` together with `ბადე|ბადის|ტრიოლ|ტაქტ|Snap ჩართულია|Snap გამორთულია` in `app/lib/arrangement/__tests__`.
  - B's grep found exactly the lines in §2. The fade/envelope/trim texts with `წმ` (`clip-fades-ui`, `clip-envelope-ui`, `video-fades-ui`, `grid-snap-edit` l.112/114, `grid-snap-clip-edges` l.112/114, `status-announcement*`, `delete-selection-ui` l.520) belong to V-0.4 and stay. There are 0 hits in `e2e/`.
  - If A finds another pin of a GR text, that is a stop-rule case.
- **Stop rule:** stop and report (B rules) if any of these happens:
  - a test outside §2 asserts an old text, or turns red;
  - a change needs a frozen file or a non-string line;
  - an import cycle or module-load order problem appears (e.g. a label reads `undefined`);
  - typecheck rejects the bar label change in the `as const` array.
- **Checkpoint rule (large mechanical round):** if your context grows large, stop at a clean point. A clean point means one file fully edited and its vitest green. Write `a-round-134-checkpoint.md` listing:
  - the files done, with their sha256;
  - the files left;
  - the next step.

  Then say STATUS: RESTART-NEEDED. The same phase resumes from it. Never revert finished files.
- **Expected end state:** `git status` shows 16 ` M` + 1 `??` (doc 110) and no other path. The frozen list is OK at the start and at the end. Report the end sha256 of the 17 paths.
- **Protected (unchanged; `git diff ee40ad6` on them is empty):**
  - `app/routes/studio.$productId.tsx`;
  - `app/routes/api.studio-token.ts`;
  - `app/lib/auth.ts`;
  - `app/contexts/AuthContext.tsx`;
  - `app/components/ui/Modal.tsx`;
  - everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check:fix` / any `--write`, `npm run format`.
- **Edit rule (C-R120-01):** lasting edits only with the Edit/Write tool. Shell writes are allowed only for temporary mutations, which are restored and checked by sha256. List every shell write.
- **Before editing, read:**
  - `.claude/primitives-map.json`;
  - `AGENT_DISCOVERABLE_CODE.md` and `FORWARDREF_COMPONENT.md` (two components change);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (and no new `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts`: ST23–ST25 (the file goes from 22 to 25 `it`s)
- **ST23:**
  - Every plain-string property of `studioGridStrings` equals its exact English literal from §1.1 (`toBe`).
  - The key list equals the expected list.
  - `GRID_TRIPLET_MENU_LABEL` is `toBe('Triplets (3)')`.
  - The bar entry of `MUSICAL_GRID_DIVISIONS` has label `'1 bar'`, and the other five labels are unchanged.
- **ST24:** every formatter and every exported grid function returns the exact English (`toBe`):
  - each formatter with Latin inputs;
  - `formatGridDivision` for all seven seconds steps;
  - the six §1.1 examples;
  - `gridDivisionEndMessage` for both directions on the seconds, straight and triplet families;
  - `gridTripletRefusalMessage` for its three branches;
  - `gridMusicalGroupLabel(92.5)` and `gridTripletGroupLabel(92.5)`;
  - `gridDivisionTitle` with both `linesVisible` values.
- **ST25:**
  - No plain value or formatter output of `studioGridStrings` contains a Georgian codepoint.
  - **Self-check of the widened pattern:** `GEORGIAN_CODEPOINT` matches `'ა'` (U+10D0), `'Ა'` (U+1C90) and `'ⴀ'` (U+2D00), and does not match `'abc — · …'`.
  - **Per-file scan** (comments stripped): `grid.ts`, `grid-divisions.ts` and `ArrangementGridMenu.tsx` contain no Georgian codepoint.
  - **StudioWorkspace ratchet** (the ST13 shape): the comment-stripped Georgian lines of `StudioWorkspace.tsx`, trimmed and with `${` → `{`, **equal** a hand-written list of 33 entries. That list is the content of `tmp/studio-real-loop/b-round-133/r134-studioworkspace-remaining-georgian.txt`, copied into the test as literals; the test must not read the loop folder. B generated the list with the narrow U+10A0–10FF grep. A confirms that the widened pattern gives the same 33 lines (StudioWorkspace has no Mtavruli or Nuskhuri). If A's stripper splits a line differently, A reports the difference and keeps the count at 33.

### 3.2 Forward rule (GATE130-S3)
Each formatter that a UI test reaches already has a hand-written UI literal after the §2 replacements:
- seconds labels and `status`: `grid-snap-ui`, `grid-snap-keys`;
- `statusMusical`, `barsGroup`, `backToSeconds`, `narrowest`, `widest`: `grid-musical-ui`;
- `tripletsGroup` and the refusals: `grid-triplet-ui`;
- `snapOnStatus`: `tempo-ui` and `grid-snap-ui`;
- the titles: `grid-snap-ui` l.299/585.

No new `expect` is needed. If A finds a GR text with no UI literal that a UI test reaches, A reports it.

### 3.3 Mutations (each turns the named tests red; restore and check by sha256)
| Mutation | Change | Must turn red |
|---|---|---|
| **m24** | `seconds` returns `` `${step} წმ` `` | ST24, ST25, `grid.test` (the l.157 `it`), `grid-snap-ui` (division options `it`), `grid-snap-menu` (any menu-item `it`) |
| **m25** | `grid-divisions.ts` swaps the `snapOnSuffix` / `snapOffSuffix` picks | ST24, `grid-musical` (status `it`), `grid-snap-keys` (l.399/410 `it`) |
| **m26** | `titleLinesHidden` drops `; Snap still works` | ST24, `grid-snap-ui` (`HIDDEN_LINES_TITLE` `it`), `grid-musical` (l.125) |
| **m27** | StudioWorkspace swaps the Snap title ternary picks | `grid-snap-ui` (the l.295 and l.408 `it`s) |
| **m28** | StudioWorkspace l.2312 aria-label back to `"ბადის დანაყოფი"` | ST25 (ratchet), `grid-snap-ui` (l.298 `it`) |
| **m29** | `backToSeconds` drops `: {label}` | ST24, `grid-musical` (l.118), `grid-musical-ui` (l.490 `it`) |

## 4. A — checks (speed rules)
- Run `npm run typecheck` and `npm run lint`. Run a read-only `npx biome check` on the 15 changed code and test files.
- Run `npx vitest run` on the files below; every one must be green. Name the exact list and counts in the report; C runs the same list.
  - **The granted tests:** `strings`, `grid`, `grid-musical`, `grid-triplet`, `grid-snap-ui`, `grid-snap-menu`, `grid-snap-keys`, `grid-musical-ui`, `grid-triplet-ui`, `tempo-ui`.
  - **The neighbours:** `grid-edges`, `grid-snap-position`, `grid-snap-edit`, `grid-snap-clip-edges`, `grid-snap-loop-drop`, `marker-snap`, `tempo`, `tempo-window-ui`, `metronome-ui`, `waveform-zoom`, `render-budget`, `self-disabling-focus`, `status-announcement-ui`.

  If one of these file names does not exist, report it and do not invent one.
- No full suite and no `npm run verify` (the gate runs them).
- **code-reviewer required** (17 paths). Pass its Architecture note to B.
- **Report `a-round-134.md`:**
  - start HEAD, frozen OK and the 16 start hashes;
  - the pre-edit grep;
  - per granted file, the changed lines (`diff -u` vs `b-round-133/r134-granted-start/`, saved as `a-round-134/granted.diff`);
  - `it` counts before and after, per file;
  - m24–m29;
  - typecheck and lint results;
  - the reviewer's verdict and Architecture note;
  - every shell write;
  - end `git status`, frozen OK, and the 17 end hashes;
  - deviations.

## 5. C — rows
Real Playwright Chromium, a fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`.
- **Tools:** reuse `c-round-133/tools/` (status reading, MutationObserver, GEO count, layout compare). For the grid, start from the Playwright regression harness `c-round-122/tools/` (its grid/snap rows: division select, 1/2/3/G keys, lane context menu, BPM field). The round-57…70 tools ran on gstack/Windows; use them only as a behaviour reference.
  - **Harness change:** select divisions by **option value / id** (`'1'`, `'0.25'`, `'1/4'`, `'1/4T'`), never by the Georgian label text. The labels change this round.
- **Invalid runs:** ENV-FIRST-LOAD — discard one crashed first load and record it under `invalidRuns`. At most 2 replacement attempts per row, and only for runs that are invalid because of the environment.
- **Evidence:** a unique file per run. Open every screenshot with Read and describe it.
- **Reading values:** read the status from the live status region and record every text change with a MutationObserver. Read the select's `title`, `aria-label` and option/optgroup labels, the menu's `aria-label` and item texts, and the Snap button `title`.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T134-TARGETED** | A's exact §4 vitest list | All green; the counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet b-round-133-r134-tree-sha256.txt` (from `store/`); protected `git diff ee40ad6` | 16 ` M` + 1 `??`; frozen OK; protected files unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` of each grant vs `b-round-133/r134-granted-start/`; read doc 110 and the doc 109 hunks | **`strings.ts`:** one new object, nothing else, still no import.<br>**`grid.ts` / `grid-divisions.ts`:** only the imports and the string expressions of §2; every condition, list and number unchanged.<br>**`ArrangementGridMenu.tsx`:** only the import and l.6.<br>**`StudioWorkspace.tsx`:** only the import and the five GR17–GR20 lines; the 33 remaining Georgian lines are byte-identical.<br>**Tests:** every hunk is a Georgian → hand-written English literal with the same matcher, the widened pattern, or ST23–ST25; no `it` added or removed outside `strings.test`; no `skip`, `only` or `todo`.<br>**Meaning check:** side by side with the Georgian, no GR row drops or adds a fact (§1.1 list).<br>Every shell write is listed |
| **GRID-SEC** (both viewports) | Fresh project, no BPM. Read the select options, `aria-label`, `title`. Press 1 until the end, then 2 until the end. Change the division with the select to 0.25 | Options `10 s`, `5 s`, `2 s`, `1 s`, `0.5 s`, `0.25 s`, `0.1 s`; `aria-label` `Grid division`; title `Grid 1 s · 1 — narrower, 2 — wider`. Statuses `Grid: 0.5 s (Snap on)` and so on, then `The grid is already at its narrowest — 0.1 s (1)` and `The grid is already at its widest — 10 s (2)`. **Effect:** the grid step (`data-grid-seconds` or the drawn line spacing) is the same as before for each division |
| **GRID-MUSICAL** (both) | BPM `120`, Enter. Read the optgroup label and options. Choose `1/4`; press 1 until the end, then 2 until the end. Clear the BPM | Optgroup `Bars · 120 BPM`; options `1 bar`, `1/2` … `1/32`. Status `Grid: 1/4 · 0.5 s at 120 BPM (Snap on)` (or `(Snap off)` if Snap is off), `… narrowest — 1/32 (1)`, `… widest — 1 bar (2)`. After clearing: `Tempo cleared — the bars ruler is hidden. Audio is unchanged. Grid back to seconds: 0.5 s.` (no Georgian; closes GATE132-TEMPO-CLEARED-MIXED). **Effect:** grid tempo is not audio stretch — a clip keeps its start and width through every step |
| **GRID-TRIPLET** (both) | (a) No BPM, press 3. (b) BPM 90, choose `1 bar`, press 3. (c) BPM 90, a seconds division, press 3. (d) BPM 90, `1/4`, press 3; read the optgroup, title and status; open the lane menu | (a) `Triplets need a tempo — enter a BPM first (3)`. (b) `1 bar has no triplets — choose 1/2 or narrower (3)`. (c) `Triplets work only on the bars grid — choose 1/2 … 1/32 (3)`. (d) Optgroup `Triplets · 90 BPM`; title `Grid 1/4T · 1 — narrower, 2 — wider`; status `Grid: 1/4T · 0.444 s at 90 BPM …`; the menu item reads `Triplets (3)` and is checked. **Effect:** refusals leave the division unchanged; triplet on gives the same 1/4T step as before |
| **GRID-HIDDEN** (both) | Choose `0.1`. Read the title. If the lines are visible, zoom out until they hide; if they are already hidden (likely at the default zoom), zoom in until they show. Read the title in both states | Hidden: `Grid 0.1 s — lines are hidden at this zoom; Snap still works. Zoom in. · 1 — narrower, 2 — wider`. Visible: `Grid 0.1 s · 1 — narrower, 2 — wider`. **Effect:** the title flips exactly when the drawn lines appear or disappear, as before |
| **SNAP** (both) | Press G twice; read status and button title each time. With Snap on at `1 s`, drag a clip about 0.4 s and release | Off: status `Snap off — free movement (G)`, title the same. On: status `Snap on — grid 1 s (G)`, title `Snap on — clips land on the grid (G)`. **Effect:** with Snap on, the clip lands on a whole second, as before |
| **MENU** (both) | Right-click a lane body; read the menu `aria-label` and items; choose `0.5 s` with the keyboard; Escape | Menu `aria-label` `Grid division`; items are the English labels, plus `Snap (G)`; the choice sets 0.5 and the status `Grid: 0.5 s (Snap on)`; focus and close behaviour as before |
| **GEO-COUNT** (both) | After each row step | Georgian count = 0 in these places: the status region, the select (options, optgroups, `title`, `aria-label`), the grid menu and the Snap button `title`. Outside them, the 33 frozen StudioWorkspace lines, Transport and the rest are expected Georgian and are not counted. Subtract by name, and list: the load-time demo-ready status; the frozen clip move status and the `Undo: კლიპის გადატანა` label written by the SNAP drag (ArrangementClip, V-0.4); the track names; any other item C finds |
| **LAYOUT** (both) | S0/S1 boxes vs `c-round-125/out/bbox-baseline-*.json`; the grid header (select + Snap + zoom) with no BPM, with BPM 120 and with triplets | Every box outside the status region and the grid select is within 1 px. A width change of the select must come from its option text (the RV-1 V-0 text-width exception). Record the grid header `scrollWidth` vs `clientWidth` in all three states and compare with C-R122-02 (deferred Low). A new overflow caused by the English labels is a Low; a removed one is noted |
| **REG-133** (1440, short) | Ctrl+G with no track selected | `To group tracks, select them first — Ctrl+click or Shift+click a track name.` |
| **G134-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | The workspace and the demo badge show. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G134-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (the known cloud cart noise is not reported) |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:**
    - any behaviour change: a different grid step, snap landing, division order, key result or menu focus/close;
    - a wrong or fact-dropping message (§1.1 list);
    - a weakened, removed or skipped test;
    - a non-string hunk in a granted source file;
    - any change to the 33 remaining StudioWorkspace lines.
  - **Low:** wording or style; a new grid-header overflow caused by the English labels.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Narrow / widen the grid | Live 12 Reference Manual §6.10 "Using the Editing Grid", `https://www.ableton.com/en/live-manual/12/arrangement-view/`. Fetched by B on 2026-10-24 (curl; saved `b-round-133/live/arrangement-view.html`, sha256 `be767e38f0867736…`, text `arrangement-view.txt`) | "Ctrl 1 … narrows the grid, doubling the density of the grid lines"; "Ctrl 2 … widens the grid, halving the density" | Existing CZABA behaviour on plain 1/2 (D-29z24, SRW-14). Words "narrower / wider" and "narrowest / widest" follow the manual's verbs | GRID-SEC, GRID-MUSICAL |
| Triplets | Same §6.10: "Ctrl 3 … toggles triplets mode". Shortcut capture `b-round-71/ableton-shortcuts-20261021.txt` (sha256 `2097004e876ee1fd…`) §42.13: "Triplet Grid Ctrl3" | Triplet mode exists and is toggled | "Triplets (3)" and "Triplets · {bpm} BPM". The refusal texts are CZABA's own rules (no source) | GRID-TRIPLET |
| Snap on/off | §6.10: "Ctrl 4 … turns grid snapping on or off. When the grid is off, the cursor does not snap"; §42.13 "Snap to Grid Ctrl4" | Snapping toggle | CZABA binds G (D-29z24). "Snap on / Snap off" are CZABA labels | SNAP |
| Lines hidden at a zoom level | Not in §6.10 (Live has zoom-adaptive/fixed grid) | — | CZABA's own rule (SRW-14, round 58); no Ableton claim | GRID-HIDDEN |
| "1 bar" option label | Not found in the saved captures | — | CZABA label; unconfirmed as a Live menu name | AN-REVIEW |

C rates "CZABA requirement met" and "Ableton correspondence" separately. For this round the Ableton correspondence is **not applicable / unconfirmed** apart from the reused verbs and terms above. Only text changes, and no new Live behaviour is claimed.

## 7. Evidence and reporting
- C writes `c-round-134.md` and `c-round-134.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), and `notesForB`. Evidence goes under `c-round-134/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`; gestures that Chromium truly cannot reach go under `inconclusive` with the reason.
- C makes no `store/` writes.

## 8. Outcome, fixed in advance (B at round 135 planning)
| Condition | Round 135 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.3a fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.3a → `c_pass`, then `c_pass_published` after the gate. Round 135 = **V-0.3b** (Transport, TempoRow, Ruler, Overview, LoopBrace, MarkerMenu), re-measured first and split if larger than one round. If root's strings-split checkpoint result exists, B applies it first (an approved split is its own bounded round with behaviour-preserving tests). If it is still absent, V-0.3b proceeds on the same rationale (§0) |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:**
  - **C harnesses and old evidence** that find options or menu items by `'1 წმ'`, `'1 ტაქტი'` or `'ბადის დანაყოფი'` will not match. Use values/ids (§5).
  - **The grid select width** follows its longest option. `0.25 s` is shorter than `0.25 წმ`, and `1 bar` is shorter than `1 ტაქტი`, so the select may narrow. This is the RV-1 text-width exception. C-R122-02 (deferred Low, grid header overflow with BPM) may change; C records it.
  - **Menu focus by label:** `grid-snap-menu` finds items by text. A text mismatch would show as a red test, not a silent pass.
  - **Module load order:** `MUSICAL_GRID_DIVISIONS` and `GRID_TRIPLET_MENU_LABEL` are evaluated at import from `strings.ts`. A cycle would show as `undefined` labels (stop rule).
  - **StudioWorkspace** is a 2606-line component. Only five literal lines and one import change. The ST25 ratchet and AN-REVIEW protect the other 33 Georgian lines.
- **Architecture:** addendum (g) to `b-round-130-checkpoint-request.md` re-asks root for the bounded strings-split checkpoint before V-0.3b/c/d. It is non-blocking (§0 rationale).
- **Commit readiness:** after C PASS, root may publish V-0.3a as an interim unit.
