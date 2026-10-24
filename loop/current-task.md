# CURRENT TASK — Round 132: VISUAL-A V-0.2c2 — tempo, metronome and zoom-readout texts in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 131)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). The module contract is in `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`:
  - a leaf module (`strings.ts` imports nothing), one object per area;
  - plain strings plus small pure formatters that take **already-formatted values**;
  - no type assertions;
  - **existing exported names keep their names and signatures and get their values from the module**.
- **Previous task:** `tasks/round-131.md` (exact copy, `cmp` OK, 30835 bytes). Rationale: `b-round-131.md`. Decision record: **D-29z97** in `plan.md`.
- **Baseline: commit `c8ff326cab55e06838487d9ebd9c0a2d50c85f58`** (gate 131 published). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-131-r132-tree-sha256.txt`, **926 entries**. It is `git ls-files -co --exclude-standard` (944) minus the 18 grants in `b-round-131-r132-grants.txt`. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 18 grants:** `b-round-131-r132-granted-start-sha256.txt`. **Start copies:** `b-round-131/r132-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there at planning). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z97)
- **Round 131: C PASS**, `browserVerified` = `realVerified` = true. 15 reachable video texts were exact at both viewports, with unchanged effects. Gate 131 published `c8ff326` (verify OK, review 9/10). **V-0.2c1 is done.** One new Low, C-R131-01 (a browser-recorded WebM with no Duration element is rejected with "could not open"), is pre-existing and goes to `deferred_low_polish`.
- `tasks/round-131.md` §8 fixed this step: after a V-0.2c1 PASS, round 132 = **V-0.2c2**: `tempo.ts`, `metronome.ts` and `view.ts`, with the exported names unchanged. B measured the test coupling first (below).
- The regression round is not due: `regression-last.json` is dated 2026-10-24 (round 122), so the next one is due on or after 2026-10-27. No Critical, High or Medium finding is open. `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
- **B's measurement (exact greps at `c8ff326`):**
  - Source: 4 Georgian lines in `tempo.ts` (l.11, 12, 43, 45), 4 in `metronome.ts` (l.10, 11, 115, 117), and 1 in `view.ts` (l.258).
  - Tests with a literal pin: 14 lines in 9 files (§2). The module-built users (`tempo-ui`, `metronome-ui`, `grid-triplet-ui`, `tempo-window-ui`, and the other `grid-musical-ui` lines) need no change.
  - **The ArrangementContext is not touched in this round.**
- **Ruling D-29z97 R3 — one status becomes two-language for a while (a tracked exception):**
  - `gridTempoClearedMessage` (`grid-divisions.ts` l.150–152, V-0.3) builds `${tempoStatusMessage(null)} ბადე დაბრუნდა წამებზე: ${formatGridDivision(step)}.`.
  - `formatGridDivision` (`grid.ts` l.177, `${step} წმ`) is the label of every seconds grid division. Its output is pinned in 88 test lines in 11 files (the select options and menu items). Changing it is the grid-label work of V-0.3.
  - So in this round, clearing the BPM while a musical division is chosen shows `Tempo cleared — the bars ruler is hidden. Audio is unchanged. ბადე დაბრუნდა წამებზე: 0.5 წმ.`.
  - This differs from ruling D-29z96 (c). There, the whole line could move together at low cost. Here, the Georgian tail is the shared grid label owned by V-0.3, and the cost is outside c2. Leaving `tempoStatusMessage(null)` Georgian instead would split one tempo area across two languages and stop `tempo.ts` passing its per-file scan.
  - The exception is tracked under GATE128-S1 as **GATE132-TEMPO-CLEARED-MIXED**. V-0.3 must close it, and V-0.3 gains `grid.ts` (`formatGridDivision`).
- **Ruling D-29z97 R4:** `ArrangementTransport.tsx` l.245 `aria-label="Zoom (px/წმ)"` stays in V-0.3 with the rest of the Transport (no half-migrated file). Its `aria-valuetext` (from `formatZoomReadout`) becomes `px/s` in this round. C subtracts that aria-label by name.
- **Folded in (cheap; the round already owns the code or it is one line):**
  - **GATE131-S6 (doc 107 status line):** l.4 still says "the browser check is C's round". One line changes.
  - **GATE130-S3 forward rule:** each new formatter gets **one hand-written English literal in a UI test**. Here, these are extra `expect` lines inside existing `it`s (§3.2). No `it` is added.

## 1. What changes (user-visible)
There are three new exported objects in `app/lib/arrangement/strings.ts`: **`studioTempoStrings`**, **`studioMetronomeStrings`** and **`studioViewStrings`**. Every Georgian literal below moves there, in English.

**Text only.** None of these change:
- tempo parsing (`TEMPO_TEXT_PATTERN`, `parseTempoBpm`), `formatTempoBpm`, the bounds;
- the bars ruler marks;
- metronome scheduling and click samples;
- the zoom rounding `Math.round(pxPerSecond * 10) / 10`;
- any condition, the order of checks, or any non-string expression.

### 1.1 The English map (exact text; A may not reword it — if a line seems wrong, report it and B rules)
Notation:
- `{bpm}` = the output of `formatTempoBpm(bpm)`, called in `tempo.ts` / `metronome.ts`.
- `{beatsPerBar}` = `TEMPO_BEATS_PER_BAR` (4).
- `{min}` / `{max}` = `TEMPO_BPM_MIN` / `TEMPO_BPM_MAX`.
- `{value}` = the rounded zoom number from `view.ts`.

These are passed in, because `strings.ts` imports nothing.

| # | Where today (baseline line) | Object.key (A may rename the key, not the text) | English |
|---|---|---|---|
| T1 | `tempo.ts` l.11 `TEMPO_INVALID_MESSAGE` | `studioTempoStrings.invalid({min, max})` | `Tempo must be {min}–{max} BPM (e.g. 90 or 92.5) — not changed.` → `Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.` |
| T2 | `tempo.ts` l.12 `TEMPO_EMPTY_HINT` | `studioTempoStrings.emptyHint` | `Bars: set a BPM — grid only, audio is not stretched` |
| T3 | `tempo.ts` l.43, `tempoStatusMessage(null)` | `studioTempoStrings.cleared` | `Tempo cleared — the bars ruler is hidden. Audio is unchanged.` |
| T4 | `tempo.ts` l.45, `tempoStatusMessage(bpm)` | `studioTempoStrings.set({bpm, beatsPerBar})` | `Tempo {bpm} BPM · {beatsPerBar}/4 — bars ruler updated. Grid only: audio is not stretched.` |
| M1 | `metronome.ts` l.10 `METRONOME_NEEDS_TEMPO_TITLE` | `studioMetronomeStrings.needsTempoTitle` | `Metronome — set a BPM first` |
| M2 | `metronome.ts` l.11 `METRONOME_TITLE` | `studioMetronomeStrings.title(beatsPerBar)` | `Metronome — a click on every beat during playback ({beatsPerBar}/4, the first beat of each bar is louder). Master volume and Mute also apply to it. Not included in the export.` |
| M3 | `metronome.ts` l.115, `metronomeStatusMessage(null)` | `studioMetronomeStrings.off` | `Metronome is off.` |
| M4 | `metronome.ts` l.117, `metronomeStatusMessage(bpm)` | `studioMetronomeStrings.on({bpm, beatsPerBar})` | `Metronome is on — {bpm} BPM, {beatsPerBar}/4: a click on every beat, louder on the first beat of each bar. Not included in the export.` |
| Z1 | `view.ts` l.258 `formatZoomReadout` | `studioViewStrings.zoomReadout(value)` | `{value} px/s` (e.g. `40 px/s`, `35.3 px/s`) |

- **Facts that must survive (a dropped one is Medium):** "grid only", "audio is not stretched" or "Audio is unchanged" in T2–T4; "not included in the export", "Master volume and Mute also apply" and "louder on the first beat of each bar" in M2 and M4; the bounds and examples in T1. The user's constraint is that grid tempo is **not** audio stretch, so these words stay.
- **Exported names stay; their values move.**
  - `TEMPO_INVALID_MESSAGE = studioTempoStrings.invalid({min: TEMPO_BPM_MIN, max: TEMPO_BPM_MAX})`.
  - `TEMPO_EMPTY_HINT = studioTempoStrings.emptyHint`.
  - `METRONOME_NEEDS_TEMPO_TITLE = studioMetronomeStrings.needsTempoTitle`.
  - `METRONOME_TITLE = studioMetronomeStrings.title(TEMPO_BEATS_PER_BAR)`.
  - `tempoStatusMessage`, `metronomeStatusMessage` and `formatZoomReadout` keep their names, parameters and return types. Their bodies return module values.
  - These importers stay frozen: `StudioWorkspace.tsx`, `ArrangementTempoRow.tsx`, `ArrangementTransport.tsx` and `grid-divisions.ts`.
- **Conditional copy stays where it is.** The `bpm === null` branches stay in `tempo.ts` and `metronome.ts` and only pick module values.
- **Imports:** `tempo.ts`, `metronome.ts` and `view.ts` may import their object from `./strings` (the leaf rule allows this direction). Today `tempo.ts` imports `./view`, and `metronome.ts` imports `./tempo`. No cycle appears, because `strings.ts` imports nothing.
- **Unchanged this round** (they stay Georgian; C subtracts them by name):
  - (a) the tempo row's own texts in `ArrangementTempoRow.tsx`: the BPM field `aria-label` `პროექტის ტემპი (BPM)`, its `title`, and the `მეტრონომი` button label (V-0.3);
  - (b) the Transport zoom `aria-label` `Zoom (px/წმ)` and the other Transport titles (V-0.3, R4);
  - (c) every `grid-divisions.ts` and `grid.ts` text: division labels `… წმ`, `1 ტაქტი`, grid statuses, and the tail `ბადე დაბრუნდა წამებზე: … წმ.` of the tempo-cleared grid status (V-0.3, R3).
- **Glossary additions** (doc 108 and the backlog glossary):
  - Tempo (`ტემპი`), BPM;
  - Bars (`ტაქტები`), bars ruler (`ტაქტების სახაზავი`);
  - grid only — audio is not stretched (`მხოლოდ ბადე, აუდიო არ იწელება`);
  - Metronome (`მეტრონომი`);
  - Not included in the export (`ექსპორტში არ შედის`);
  - `px/s` (`px/წმ`; the unit `s` is from the round-127 glossary).

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add the three objects with T1–T4, M1–M4 and Z1. The seven existing objects are unchanged. It still imports nothing |
| `app/lib/arrangement/tempo.ts` | **Only:** the import and l.11, 12, 43 and 45 (module values or formatters) |
| `app/lib/arrangement/metronome.ts` | **Only:** the import and l.10, 11, 115 and 117 |
| `app/lib/arrangement/view.ts` | **Only:** the import and l.258 (`return studioViewStrings.zoomReadout(Math.round(pxPerSecond * 10) / 10);` or the same rounding in a local) |
| `app/lib/arrangement/__tests__/strings.test.ts` | New `describe('V-0.2c2 tempo, metronome and view strings')` with ST17–ST19 (§3.1). ST1–ST16 are unchanged |
| `app/lib/arrangement/__tests__/tempo.test.ts` | l.135–145: the Georgian literals → `studioTempoStrings` values or formatters, same matchers. l.138 `toContain('92.5 BPM')` stays |
| `app/lib/arrangement/__tests__/metronome.test.ts` | l.259–267: the same (l.262 `toContain('92.5 BPM')` stays) |
| `app/lib/arrangement/__tests__/view.test.ts` | l.266–268 → `studioViewStrings.zoomReadout(0.5)`, `(40)`, `(35.3)`, same `toBe` |
| `app/lib/arrangement/__tests__/tempo-ui.test.tsx` | **Add** the forward-rule literal lines of §3.2 (T-UI1–T-UI4) inside the existing `it`s. Nothing else |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | **Add** M-UI1–M-UI4 (§3.2) inside the existing `it`s. l.288 (`'მეტრონომი'`) stays |
| `marker-time-snap-ui.test.tsx` l.391, `grid-snap-ui.test.tsx` l.285, `grid-snap-edit.test.tsx` l.340, `grid-snap-position.test.tsx` l.308 and l.349, `grid-snap-loop-drop.test.tsx` l.360 (all in `app/lib/arrangement/__tests__/`) | `'40 px/წმ'` → the hand-written `'40 px/s'`, same matcher (`toBe` / `not.toBe`). These are the UI literal pins for Z1 (forward rule) |
| `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` l.490 and `grid-musical.test.ts` l.118 | The hand-written literal → `'Tempo cleared — the bars ruler is hidden. Audio is unchanged. ბადე დაბრუნდა წამებზე: 0.5 წმ.'`, same `toBe` (the R3 exception, pinned honestly; V-0.3 changes the tail). No other line in these files changes |
| `docs/implementation/2026/quarter-IV/107-studio-v0-video-import-strings.md` | **Only l.4** → `**სტატუსი:** Completed (A-ის შემოწმებები მწვანეა რაუნდ 131-ში; C round 131 — PASS, browserVerified; gate 131 — c8ff326)` |
| **new** `docs/implementation/2026/quarter-IV/108-studio-v0-tempo-metronome-view-strings.md` | Sections from TEMPLATE.md, in Georgian: the T/M/Z map; rulings R3 (the mixed tempo-cleared grid status, GATE132-TEMPO-CLEARED-MIXED, closes in V-0.3 with `grid.ts`) and R4; the facts that must survive; the glossary additions; the tests and the mutations. The status line says Completed only after §4 is green, and names C's round as still to come |

- **Test rules (as in rounds 129–131):**
  - In existing unit tests, every assertion that pins one of these texts uses the module value or formatter, with the same inputs and **the same matcher**.
  - The UI pins in §2 and §3.2 use **hand-written English literals** (GATE130-S3).
  - No `it` is added, removed or renamed outside the new `describe` in `strings.test.ts`.
  - Line numbers are baseline (`c8ff326`) positions. Find each by its text.
- **Pre-edit grep (A records it):** for each T/M/Z row, grep the old Georgian text in `app/**` and `e2e/**`. B's grep found only the lines in §2, and none in `e2e/`. If A finds another pin, that is a stop-rule case.
- **Stop rule:** stop and report (B rules) if any of these happens:
  - a test outside §2 asserts an old text, or turns red;
  - a change needs a frozen file or a non-string line;
  - an import cycle or a module-load order problem appears (e.g. a `TEMPO_*` constant reads `undefined`).
- **Expected end state:** `git status` shows 18 ` M` + 1 `??` (doc 108) and no other path. The frozen list is OK at the start and at the end. Report the end sha256 of the 19 paths.
- **Protected (unchanged; `git diff c8ff326` on them is empty):**
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
  - `AGENT_DISCOVERABLE_CODE.md`;
  - `AUDIO_ARCHITECTURE.md` (metronome module; strings only);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (and no new `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts`: ST17–ST19 (the file goes from 16 to 19 `it`s)
- **ST17:**
  - Every plain-string property of the three objects equals its exact English literal from §1.1 (`toBe`).
  - The key list of each object equals the expected list.
  - `TEMPO_EMPTY_HINT` and `METRONOME_NEEDS_TEMPO_TITLE` are `toBe` the module values.
- **ST18:** every formatter returns the exact English, with `toBe`:
  - `invalid({min: 20, max: 999})`;
  - `set({bpm: '90', beatsPerBar: 4})` and `set({bpm: '92.5', beatsPerBar: 4})`;
  - `title(4)`;
  - `on({bpm: '40', beatsPerBar: 4})`;
  - `zoomReadout(0.5)`, `(40)` and `(35.3)`.

  It also checks these exported values `toBe` the hand-written English:
  - `TEMPO_INVALID_MESSAGE`;
  - `tempoStatusMessage(90)` and `tempoStatusMessage(null)`;
  - `METRONOME_TITLE`;
  - `metronomeStatusMessage(40)` and `metronomeStatusMessage(null)`;
  - `formatZoomReadout(35.26)` → `35.3 px/s`.
- **ST19:**
  - No plain value or formatter output of the three objects contains a Georgian codepoint.
  - **Per-file scan:** after comments are stripped, `tempo.ts`, `metronome.ts` and `view.ts` contain no Georgian codepoint. `grid-divisions.ts` and `grid.ts` are **not** in the scan (V-0.3).

### 3.2 Forward-rule UI literals (extra `expect` lines in existing `it`s)
Each line is a hand-written English literal. It is added next to the existing module-built assertion, which stays.
- `tempo-ui.test.tsx`:
  - **T-UI1** in U2, after l.301: status `toBe('Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.')`.
  - **T-UI2** after l.353: status `toBe('Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.')` This anchor is inside the `for` loop over `1000`/`abc`/`999.5`. The text is the same for all three, so the literal **stays inside the loop**. This is not a deviation.
  - **T-UI3** after l.393: status `toBe('Tempo cleared — the bars ruler is hidden. Audio is unchanged.')`.
  - **T-UI4** after l.394: the strip `toContain('Bars: set a BPM — grid only, audio is not stretched')`.
- `metronome-ui.test.tsx`:
  - **M-UI1** after l.292: the toggle title `toBe('Metronome — set a BPM first')`.
  - **M-UI2** after l.304: the toggle title `toBe` the full M2 text with `4/4`.
  - **M-UI3** after l.307: status `toBe('Metronome is on — 120 BPM, 4/4: a click on every beat, louder on the first beat of each bar. Not included in the export.')`.
  - **M-UI4** after l.335: status `toBe('Metronome is off.')`.
- If an anchor line is inside a loop or helper, so the literal would run more than once with other values, A puts it at the nearest single-value point in the same `it` and reports where.

### 3.3 Mutations (each turns the named tests red; restore and check by sha256)
| Mutation | Change | Must turn red |
|---|---|---|
| **m14** | `set` drops ` · {beatsPerBar}/4` | ST18 **and T-UI1** |
| **m15** | `emptyHint` back to the Georgian text | ST17, ST19 and T-UI4 |
| **m16** | `title` drops ` Not included in the export.` | ST18 and M-UI2 |
| **m17** | `view.ts` `formatZoomReadout` returns the old `` `${…} px/წმ` `` literal | ST19 (per-file scan), `view.test` and the `'40 px/s'` UI pins (name at least `grid-snap-ui`) |
| **m18** | `metronomeStatusMessage` swaps the `null` and non-null branches | ST18, M-UI3 and M-UI4 |

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the 17 changed code and test files.
- `npx vitest run` on these files. Every one must be green. Name the exact list and counts in the report; C runs the same list.
  - The granted tests: `strings`, `tempo`, `metronome`, `view`, `tempo-ui`, `metronome-ui`, `marker-time-snap-ui`, `grid-snap-ui`, `grid-snap-edit`, `grid-snap-position`, `grid-snap-loop-drop`, `grid-musical-ui`, `grid-musical`.
  - The name-only importers and neighbours: `tempo-window-ui`, `grid-triplet-ui`, `grid-triplet`, `grid`, `grid-snap-menu`, `status-announcement-ui`, `render-budget`, `video-import-status-ui`. If one of these file names does not exist, report it and do not invent one.
- No full suite and no `npm run verify` (the gate runs them).
- **code-reviewer required** (19 paths). Pass its Architecture note to B.
- **Report `a-round-132.md`:**
  - start HEAD, frozen OK and the 18 start hashes;
  - the pre-edit grep;
  - per granted file, the changed keys and lines (`diff -u` vs `b-round-131/r132-granted-start/`, saved as `a-round-132/granted.diff`);
  - `it` counts before and after, per file;
  - m14–m18;
  - typecheck and lint results;
  - the reviewer's verdict and Architecture note;
  - every shell write;
  - end `git status`, frozen OK, and the 19 end hashes;
  - deviations.

## 5. C — rows
Real Playwright Chromium, a fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`.
- **Tools:** reuse `c-round-130/tools/` (status reading, Undo title, GEO count) and `c-round-131/tools/` (MutationObserver on the status region). Find the BPM field by `aria-label="პროექტის ტემპი (BPM)"` (frozen) or its test id; find the metronome toggle and zoom readout (`data-testid="arrangement-zoom-readout"`) the way rounds 65–66 / 130 did. For a clip, use the library add (**＋ დამატება, or Enter on a focused option**).
- **Invalid runs:** ENV-FIRST-LOAD — discard one crashed first load and record it under `invalidRuns`. At most 2 replacement attempts per row, and only for runs that are invalid because of the environment.
- **Evidence:** a unique file per run. Open every screenshot with Read and describe it.
- **Reading values:**
  - Read the status from the live status region, and record every text change with a MutationObserver.
  - Read `title`, `aria-valuetext` and `textContent` from the DOM.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T132-TARGETED** | A's exact §4 vitest list | All green; the counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet b-round-131-r132-tree-sha256.txt` (from `store/`); protected `git diff c8ff326` | 18 ` M` + 1 `??`; frozen OK; protected files unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` of each grant vs `b-round-131/r132-granted-start/`; read doc 108 | **`strings.ts`:** three new objects and nothing else changed; still no import.<br>**`tempo.ts` / `metronome.ts` / `view.ts`:** only the import and the string lines. Parsing, bounds, rounding, scheduling and the `null` branches are unchanged.<br>**Doc 107:** only l.4.<br>**Tests:** every hunk is an import, a literal → module change with the same matcher, a `px/s` or tempo-cleared hand-written literal, an added forward-rule `expect`, or ST17–ST19; no `it` added or removed outside `strings.test`; no `skip`, `only` or `todo`.<br>**Meaning check:** side by side with the Georgian, no T/M/Z row drops or adds a fact (§1.1 list).<br>Every shell write is listed |
| **TEMPO** (both viewports) | Fresh project with one library clip. (a) Type `90`, Enter. (b) Type `1000`, Enter. (c) Clear the field, Enter (seconds division). (d) Choose division `0.5`, type `90`, choose `1/4`, clear, Enter | (a) `Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.`; the bars strip shows bars.<br>(b) `Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.`; the field returns to 90.<br>(c) `Tempo cleared — the bars ruler is hidden. Audio is unchanged.`; the bars strip shows `Bars: set a BPM — grid only, audio is not stretched`.<br>(d) The R3 exception, exactly `Tempo cleared — the bars ruler is hidden. Audio is unchanged. ბადე დაბრუნდა წამებზე: 0.5 წმ.` (the tail is subtracted by name).<br>**Effect:** the clip's start and width are unchanged by every tempo step (no stretch), and the division select behaves as before. C states the effect next to each message |
| **METRO** (both) | (a) Before a BPM is set: the metronome toggle. (b) BPM 120: the toggle `title`. (c) Click the toggle. (d) Play 2 s, then Stop. (e) Click it again | (a) Disabled, `title` `Metronome — set a BPM first`.<br>(b) The full M2 text with `4/4`.<br>(c) `aria-pressed="true"` and status M4 for 120 BPM.<br>(d) Playback runs and stops as before (the position moves; no `pageerror`).<br>(e) `aria-pressed="false"`, status `Metronome is off.` |
| **ZOOM** (both) | Read the zoom readout and the slider `aria-valuetext` at load; press `+` once; press `−` once | The readout `textContent` and `aria-valuetext` are equal at each step and match `^\d+(\.\d)? px/s$`. The value changes with `+`/`−` as before. The slider's `aria-label` `Zoom (px/წმ)` is frozen (R4) and subtracted by name |
| **GEO-COUNT** (both) | After each row | Georgian in the status region, the metronome `title`, the zoom readout and `aria-valuetext`, and the bars-strip hint = 0, after removing **by name**: the R3 tail, the BPM field `aria-label`/`title`, the `მეტრონომი` button label, `Zoom (px/წმ)`, the grid division labels, **the fully Georgian grid statuses written by a division change** (e.g. `ბადე: 1/4 · … (Snap ჩართულია)`, V-0.3; the observer records them, and they are not a finding), the track names and clip/sound titles. List each subtracted item |
| **LAYOUT** (both) | S0/S1 boxes vs `c-round-125/out/bbox-baseline-*.json`, outside the status region; the tempo row, bars strip and zoom readout boxes | Every box outside the status region, the bars-strip hint and the zoom readout is within 1 px. A width or wrap change of those three must come from their text (the RV-1 V-0 text-width exception). If a neighbour moves because the readout became narrower, C records the measurement as a Low. No new horizontal overflow |
| **REG-131** (1440, short) | `beeps-6s-h264-aac.mp4` through the video input on a fresh project | `“beeps-6s-h264-aac.mp4” added to the video track: 00:00.000 — 00:06.000` |
| **G132-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | The workspace and the demo badge show. The product route shows "Sign in required", no workspace and 0 `audio[src]`. The token API returns **401**. The fake-Bearer 403 check is **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G132-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (the known cloud cart noise is not reported) |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:**
    - any behaviour change: tempo accepted or refused differently, a clip moved or stretched, the bars ruler, the metronome schedule or toggle state, zoom steps;
    - a wrong or fact-dropping message (§1.1 list);
    - a weakened, removed or skipped test;
    - a non-string hunk in `tempo.ts`, `metronome.ts` or `view.ts`.
  - **Low:** wording or style; a neighbour box moved by the narrower readout text.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Setting the tempo | Live 12 Reference Manual §9.1.1 "Setting the Tempo", `https://www.ableton.com/en/live-manual/12/audio-clips-tempo-and-warping/`. Saved excerpt `b-round-64/tempo-9.1.1-excerpt-20261019.txt` (captured 2026-10-19, used in round 65) | Live has a project tempo in BPM. In Live, warped clips follow it; that is **not** CZABA's behaviour | Deliberate difference (D-10, SRW-15): BPM drives only the grid and bars ruler, and audio is never stretched. The text says so. This round changes text only | TEMPO (effect column) |
| Metronome | Live 12 §19.4.1 "Metronome Settings", `https://www.ableton.com/en/live-manual/12/recording-new-clips/`. Saved excerpt `b-round-65/metronome-excerpt-20261019.txt` (used in round 66) | A metronome toggle exists in Live | Existing CZABA behaviour (SRW-15 stage 2): a click on every beat, accented bar, not exported. Text only | METRO |
| Words "Tempo", "Metronome", "bars" | The same two excerpts (term reuse only) | Term reuse; "bars ruler" is a CZABA term, unconfirmed as a Live name | "Tempo", "Metronome", "Bars", "bars ruler", "px/s" | AN-REVIEW |

C rates "CZABA requirement met" and "Ableton correspondence" separately. For this round the Ableton correspondence is **not applicable / unconfirmed**: only text changes, and no new Live behaviour is claimed.

## 7. Evidence and reporting
- C writes `c-round-132.md` and `c-round-132.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), and `notesForB`. Evidence goes under `c-round-132/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.
- C makes no `store/` writes.

## 8. Outcome, fixed in advance (B at round 133 planning)
| Condition | Round 133 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.2c2 fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.2c2 → `c_pass`, then `c_pass_published` after the gate. Round 133 = **V-0.2c3**: `selection.ts` + `groups.ts`. B first re-measures the `ჯგუფი N` fixture hits and decides whether `TRACK_GROUP_NAME_PREFIX` moves with c3 or with the V-0.4 default track names; split again if it is larger than this round |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:**
  - **Module load order.** `metronome.ts` evaluates `METRONOME_TITLE` at import, using `TEMPO_BEATS_PER_BAR` from `tempo.ts` and now the `strings.ts` formatter. A cycle would show as `undefined` text (stop rule).
  - **The grid tempo-cleared status:** it shares `tempoStatusMessage(null)` (R3).
  - **The Transport zoom slider:** `aria-valuetext` now has a different unit from its `aria-label` until V-0.3 (R4).
  - **The tempo row:** the hint text width changes.
- **Architecture:** no Context change this round. The pending checkpoint (`b-round-130-checkpoint-request.md`) gets an addendum from the round-131 notes: should `strings.ts` (now 7 objects, 10 after this round) split per area under `lib/arrangement/strings/` with the same exported names, and should a shared Context UI test harness replace copied mock preambles? It does not block A or C.
- **Commit readiness:** after C PASS, root may publish V-0.2c2 as an interim unit.
