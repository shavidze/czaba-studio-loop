# CURRENT TASK — Round 129: VISUAL-A V-0.2a — edit-command messages in English (Split, Delete, Ctrl+Shift+L, Duplicate, Copy, Cut, Cut Time, Paste)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned from ~07:00 UTC)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). The module contract is in `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract` (leaf module, one object per area, plain strings plus small pure formatters, no type assertions).
- **Previous task:** `tasks/round-128.md` (exact copy, `cmp` OK, 23320 bytes). Rationale: `b-round-128.md`. Decision record: **D-29z94** in `plan.md`.
- **Baseline: commit `77f2763b5e968d7f09683637602668e4a710501d`** (gate 128 published; rounds 123–128). At planning the tree was **clean** (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-128-r129-tree-sha256.txt`, **929 entries** (`git ls-files -co --exclude-standard` minus the 11 existing grants). `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 11 existing grants:** `b-round-128-r129-granted-start-sha256.txt`. **Start copies:** `b-round-128/r129-granted-start/` (paths relative to `store/`). A checks both at the start; if a hash differs, A stops and reports.

## 0. Why this round (D-29z94)
- **Round 128: C PASS**, `browserVerified` = `realVerified` = true; gate 128 published `77f2763`. **V-0.1 (Export copy) is done.**
- The gate reviewer's Medium note: the Studio is now **mixed-language** (Export English, everything else Georgian) until V-0 finishes, so V-0.2 runs next.
- **V-0.2 is split** (scope unchanged; the full V-0.2 is still required). B measured it: the Context's remaining 85 Georgian lines plus the helpers are asserted in about 46 test files, too many for one checkable round.
  - **V-0.2a (this round):** the edit commands in `ArrangementContext.tsx` from `splitSelection` to `pasteClipboard` (l.1766–2056) and the 6 constants that only they use. Real dependent tests: **8 files** (exact grep, not fragment matching).
  - **V-0.2b:** playback, library add/drop, loop, move/nudge (Context l.178–187, 192, 521, 1200–1765) and the gesture constants.
  - **V-0.2c:** video import messages (Context l.2171–2262, 3403), the helper modules (`groups.ts`, `selection.ts`, `library.ts`, `video.ts`, `video.client.ts` incl. `source.audioNote`, `tempo.ts`, `metronome.ts`, `view.ts`).
- Regression is not due (`regression-last.json` 2026-10-24 → due on or after 2026-10-27). No Critical/High/Medium finding is open. `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.

## 1. What changes (user-visible)
A new exported object **`studioEditStrings`** in `app/lib/arrangement/strings.ts`. Every Georgian literal in the scope below moves there, in English. **Text only:** no change to any condition, order of checks, state update, selection, history push, clipboard or timing.

### 1.1 The English map (exact text; A may not reword — if a line seems wrong, report it, B rules)
Notation: `{t}` = an already formatted time (`formatArrangementTime`), `{track}` = a track name as it is today. Plurals: the formatter picks the singular when the number is 1 (as `overloadWarning` does).

| # | Where (today) | Key (suggested; A may rename the key, not the text) | English |
|---|---|---|---|
| E1 | split, all-track selection | `splitAllTracksRefused` | `Split does not work on a selection across all tracks — make a time selection on one track.` |
| E2 | `GROUP_SPLIT_MISS_MESSAGE` | `splitMissesSelection` | `The playhead does not cross any selected clip.` |
| E3 | history `გაყოფა (n)` | `historySplitClips(count)` | `Split ({n})` |
| E4 | split of 2+ selected clips | `splitClipsDone({count, time})` | `{n} clips split at {t}; the right parts are selected.` / n=1: `1 clip split at {t}; the right part is selected.` |
| E5 | range split failed | `splitRangeFailed` | `Could not split at the time selection.` |
| E6 | history `გაყოფა მონაკვეთზე` | `historySplitRange` | `Split at time selection` |
| E7 | range split done | `splitRangeDone` | `Clip split at both edges of the time selection; the middle part is selected.` |
| E8 | split, nothing selected | `splitNeedsTarget` | `To split, select a clip and place the playhead inside it, or make a time selection.` |
| E9 | split, playhead outside | `splitPlayheadOutside` | `The playhead must be inside the selected clip.` |
| E10 | history `გაყოფა` | `historySplit` | `Split` |
| E11 | single split done | `splitDone(time)` | `Clip split at {t}.` |
| E12 | delete range, nothing there | `deleteRangeEmpty` | `Nothing to delete in the time selection — nothing changed.` |
| E13 | history `წაშლა მონაკვეთზე` / `… (ყველა ხაზი)` | `historyDeleteRange`, `historyDeleteRangeAllTracks` | `Delete time selection` / `Delete time selection (all tracks)` |
| E14 | delete range done | `deleteRangeDone({start, end, lanes})` | `⌫ Deleted {start} — {end} {lanes}; the gap remains.` |
| E14a | its `lanes` phrase | `onAllTracks`, `onTrack(track)` | `on all tracks` / `on the {track} track` (the `—` fallback name stays) |
| E15 | history `კლიპების წაშლა (n)` | `historyDeleteClips(count)` | `Delete clips ({n})` |
| E16 | delete 2+ clips done | `deleteClipsDone(count)` | `{n} clips deleted; the gap remains.` / n=1: `1 clip deleted; the gap remains.` |
| E17 | delete, nothing selected | `deleteNeedsTarget` | `To delete, select a clip or make a time selection.` |
| E18 | history `კლიპის წაშლა` | `historyDeleteClip` | `Delete clip` |
| E19 | delete one clip done | `deleteClipDone` | `Clip deleted; the gap remains.` |
| E20 | Ctrl+Shift+L without a range | `extendNeedsRange` | `Make a time selection first to extend it to all tracks (Ctrl+Shift+L).` |
| E21 | Ctrl+Shift+L done | `extendDone({start, end})` | `Selection on all tracks: {start} — {end}.` |
| E22 | `DUPLICATE_RANGE_MESSAGE` | `duplicateRangeRefused` | `Duplicate works on clips; there is no Duplicate Time.` |
| E23 | `DUPLICATE_EMPTY_MESSAGE` | `duplicateNeedsClip` | `Select a clip to duplicate.` |
| E24 | duplicate conflict | `duplicateConflict({track, start, end})` | `Duplicate failed: {start}–{end} on the {track} track is occupied. Nothing changed.` |
| E25 | history `დუბლირება (n)` | `historyDuplicate(count)` | `Duplicate ({n})` |
| E26 | duplicate done | `duplicateDone({count, from})` | `Duplicate ({n}): copies start at {t}.` / n=1: `Duplicate (1): the copy starts at {t}.` |
| E27 | copy range, no sound | `copyRangeEmpty` | `No sound to copy in the time selection — the clipboard did not change.` |
| E28 | copy range done | `copyRangeDone({lane, start, end, parts})` | `Copy: {lane} {start}–{end} ({n} parts).` / n=1: `(1 part)`. `{lane}` = `all tracks` (`allTracks`) or the track name |
| E29 | copy, nothing selected | `copyNeedsTarget` | `To copy, select a clip or make a time selection — the clipboard did not change.` |
| E30 | copy clips done | `copyClipsDone(count)` | `Copy: {n} clips on the clipboard.` / n=1: `Copy: 1 clip on the clipboard.` |
| E31 | cut range, no sound | `cutRangeEmpty` | `No sound to cut in the time selection — nothing changed.` |
| E32 | cut, nothing selected | `cutNeedsTarget` | `To cut, select a clip or make a time selection.` |
| E33 | cut done | `cutDone(parts)` | `Cut: {n} parts on the clipboard; the gap remains.` / n=1: `1 part` |
| E34 | `CUT_TIME_NEEDS_RANGE_MESSAGE` | `cutTimeNeedsRange` | `Make a time selection first for Cut Time (Ctrl+Shift+X).` |
| E35 | Cut Time, nothing to cut | `cutTimeNothing({start, end})` | `Cut Time {start} — {end}: no time to cut — nothing changed, the clipboard did not change.` |
| E36 | Cut Time done | `cutTimeDone({start, end, clipboard, suffix})` | `Cut Time {start} — {end}: {clipboard}; the gap was closed on all tracks.{suffix}` |
| E36a | its `clipboard` phrase | `cutTimeParts(parts)`, `cutTimeNoSound` | `{n} parts on the clipboard` (n=1: `1 part …`) / `no sound in the time selection, the clipboard did not change` |
| E36b | its suffix parts | `loopRemoved` (was `LOOP_REMOVED_MESSAGE`), `markersRemoved(count)` | `The loop range was shorter than 0.1 s after the deletion, so it was removed.` / ` {n} markers deleted.` (n=1: ` 1 marker deleted.`, leading space as today) |
| E37 | paste overlap | `pasteOverlap({track, start, end})` | `Paste failed: {start}–{end} on the {track} track is occupied. Nothing changed.` |
| E38 | paste lane kind | `pasteLaneKind({track, at})` | `Paste failed: this material does not fit on the {track} track from {t} (audio and video do not swap tracks). Nothing changed.` |
| E39 | paste missing | `pasteMissing` | `Paste failed: the source or track is unavailable. Nothing changed.` |
| E40 | `CLIPBOARD_EMPTY_MESSAGE` | `clipboardEmpty` | `The clipboard is empty — Copy or Cut first.` |
| E41 | history `ჩასმა (n)` | `historyPaste(count)` | `Paste ({n})` |
| E42 | paste done | `pasteDone({count, at, trackSuffix})` + `pasteTrackSuffix(track)` | `Paste ({n}): at {t}{trackSuffix}.` with suffix ` · on the {track} track` or empty |
| X1 | `studioExportStrings.invalidRangeNoFile` (reviewer Low (d), round 128) | value only | `The time selection is invalid — no file was created.` |

- **Unchanged:** the history labels `Cut` and `Cut Time` (already English); the `Undo: ` / `Redo: ` prefixes (owned by `ArrangementTransport.tsx`, V-0.3); `⌫`, `·`, `—`, `–`; time formats.
- **Conditional copy stays in the Context.** `range.allTracks ? …`, the paste-refusal ternary, `hasMaterial ? …`, the loop/marker suffix concatenation and the track-name lookup stay where they are; they only pick module values/formatters. Formatters take already-formatted strings and numbers (leaf rule: `strings.ts` imports nothing). This round does **not** decide the "conditional copy in formatters" question; that ruling is due before V-0.3.
- **Track names are not translated this round.** They come from `studio-lab.tsx` (`ვიდეო`, `მუსიკა`, `სტემები`, `SFX`) and the fallback in the Context (l.546–547): V-0.4/V-0.5. So a status may read `on the მუსიკა track` for now. C subtracts track names from the Georgian count, as `source.audioNote` was subtracted in V-0.1. **Smallest honest choice:** moving the names now would change lane widths (RV-1) and many unrelated tests.
- **Glossary additions** (doc 105 and the backlog glossary): Split, Delete clip, Delete time selection, Duplicate, Copy, Cut, Cut Time, Paste, clipboard, gap (`სიცარიელე`), part (`ნაწილი`), playhead, time selection, `on the {track} track`, `on all tracks`.

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add `export const studioEditStrings = { … }` with the E1–E42 entries; X1's value. `studioExportStrings` keeps every other key and value. Imports nothing |
| `app/contexts/ArrangementContext.tsx` | **Only:** (a) the import of `studioEditStrings`; (b) the 6 constants `LOOP_REMOVED_MESSAGE`, `CLIPBOARD_EMPTY_MESSAGE`, `DUPLICATE_RANGE_MESSAGE`, `DUPLICATE_EMPTY_MESSAGE`, `GROUP_SPLIT_MISS_MESSAGE`, `CUT_TIME_NEEDS_RANGE_MESSAGE` (l.190–191, 197–201): either point them at the module or replace their uses with module references — no other constant, and **`LOOP_STEP_BLOCKED_MESSAGE` (l.192, V-0.2b) stays**; (c) string literals inside `splitSelection`, `deleteSelection`, `extendRangeToAllTracks`, `duplicateSelection`, `copySelection`, `cutSelection`, `cutTimeSelection`, `pasteClipboard` (l.1766–2056) → module values/formatters. No condition, dependency array, call order or non-string expression changes |
| `app/lib/arrangement/__tests__/strings.test.ts` | New `describe('studioEditStrings (V-0.2a)')` with ST6–ST9 (§3.1). X1's literal in ST1. ST1–ST5 keep their structure |
| 8 tests (literal → module reference only): `delete-selection-ui.test.tsx`, `all-lane-clipboard.test.tsx`, `ArrangementContext.test.ts`, `markers-ui.test.tsx`, `status-announcement-ui.test.tsx`, `fader-guards.test.tsx`, `self-disabling-focus.test.tsx`, `grid-snap-position.test.tsx` (all under `app/lib/arrangement/__tests__/`) | Every assertion that pins one of the E1–E42 Georgian texts uses the module value/formatter with the same inputs, and **the same matcher** (`toBe` stays `toBe`, `endsWith` stays `endsWith`, `toEqual([...])` stays). Georgian **track names** inside expected text stay as they are (they are interpolated). Add the import. No other line changes: no `it` added/removed/renamed except a title that quotes a migrated Georgian text, which becomes English |
| new `docs/implementation/2026/quarter-IV/105-studio-v0-edit-strings.md` | TEMPLATE.md sections, in Georgian: the E/X map, the split rationale (V-0.2a/b/c), the track-name rule, glossary additions, the tests and mutations. Status Completed only after §4 is green |

- **Pre-edit grep (A records it).** For each E row, grep the old Georgian text (and the 6 constant names) in `app/**/__tests__/**` and `e2e/**`. B's exact grep found them only in the 8 files above (`grid-snap-position` l.487–488: paste status and `undoLabel`). B read the frozen hits (read-only): `ArrangementTransport.tsx` l.72, l.74 and l.177 (`წაშლა მონაკვეთზე…`, `კლიპის წაშლა — სიცარიელე დარჩება`, `გაყოფა მონაკვეთის ორივე საზღვარზე…`) are its own hint text (V-0.3). It only **displays** `undoLabel` (l.149 `title`, l.153 visible span) and compares it with nothing; no source file compares `undoLabel`/`redoLabel` to a literal. `StudioWorkspace.tsx` l.2540 and `ArrangementLane.tsx` l.1001 `ყველა ხაზი` are their own range labels (V-0.3/V-0.4). All of these stay frozen. Also grep the old X1 text `The range is invalid` (B found it only in `strings.ts` and `strings.test.ts`).
- **Stop rule:** if a test outside §2 asserts an old E-text or the old X1 text, or turns red, or a change needs a frozen file or a non-string line in the Context, **stop and report**; B rules.
- **Expected end state:** `git status` = 11 ` M` + 1 `??` (doc 105), no other path. Frozen list OK at start and end. Report the end sha256 of the 12 grants.
- **Protected (unchanged; `git diff 77f2763` on them is empty):** `app/routes/studio.$productId.tsx` `fa2cf0bc`, `app/routes/api.studio-token.ts` `13914809`, `app/lib/auth.ts` `56f5b76f`, `app/contexts/AuthContext.tsx` `bf9ee257`, `app/components/ui/Modal.tsx` `741c2341`, and everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check` (`--write`), `npm run format`.
- **Edit rule (C-R120-01):** lasting edits only with the Edit/Write tool. Shell writes only for temporary mutations, restored and checked by sha256. List every shell write.
- **Before editing, read:** `.claude/primitives-map.json`, `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (also no `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts`: ST6–ST9 (the only `it`s added in the round: strings 5 → 9)
- **ST6:** every plain-string property of `studioEditStrings` equals its exact English literal from §1.1 (`toBe`), and the key list equals the expected list.
- **ST7:** every formatter returns the exact English for its inputs, `toBe`. **Each plural formatter is sampled at 1 and at 3** (E4, E16, E26, E28, E30, E33, E36a, E36b). E14/E24/E37/E38/E42 are sampled with a real track name (`SFX`) and with the `—` fallback.
- **ST8:** no plain value and no formatter output (all ST7 samples; the formatter key list equals the sample list) contains a Georgian codepoint.
- **ST9:** source guard: the `ArrangementContext.tsx` slice from `const splitSelection = useCallback(` to `const restoreHistory = useCallback(` has no Georgian codepoint after comments are stripped (both anchors found, end after start), and the 6 constants of §2(b), if they still exist, have no Georgian codepoint on their declaration lines.

### 3.2 Mutations (each turns the named test red; restore and check by sha256)
- **m1:** `deleteClipDone` back to `კლიპი წაიშალა; სიცარიელე დარჩა.` → ST6 and ST8 red.
- **m2:** put `'გაყოფა'` back as the history label in `splitSelection` → ST9 red.
- **m3:** make a plural formatter ignore the count (e.g. `copyClipsDone` always `clips`) → ST7 red.
- **m4:** in `deleteSelection`, swap the single-clip status with `deleteClipsDone(1)` → a `delete-selection-ui` (or `status-announcement-ui`) test red. This proves the UI tests still bind the right message after the switch to module references.

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the 11 changed code files.
- `npx vitest run` on: `strings`, the 8 test files of §2, and the neighbours `delete-selection`, `clipboard`, `clip-gain`, `grid-snap-edit`, `model`, `gesture-guard`, `export-dialog-a11y-copy`, `export-range-ui`, `export-range`, `export-wav`. Every file green. Name the exact list and counts in the report; C runs the same list.
- No full suite and no `npm run verify` (the gate runs them).
- **code-reviewer required** (12 files). Pass its Architecture note to B.
- **Report `a-round-129.md`:** start HEAD, frozen OK and the 11 start hashes; the pre-edit grep; per granted file the changed keys/lines (`diff -u` vs `b-round-128/r129-granted-start/`, saved as `a-round-129/granted.diff`); `it` counts before/after per file; m1–m4; typecheck/lint; reviewer verdict and Architecture note; every shell write; end `git status`, frozen OK, 12 end hashes; deviations.

## 5. C — rows
Real Playwright Chromium, fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`. Reuse `c-round-127/tools/` / `c-round-128/tools/` (S0/S1/S2 setups) and `c-round-106/tools/kr106.cjs` (keys). Media: `tmp/studio-real-loop/media/`. ENV-FIRST-LOAD: discard one crashed first load and record it under `invalidRuns`. Unique file per run. Open every screenshot with Read and describe it. At most 2 replacement attempts per row, only for environment-invalid runs. Read the status text from the live status region (the element the UI tests call `statusText`) and the Undo button `title`.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T129-TARGETED** | A's exact §4 vitest list | All green; counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet b-round-128-r129-tree-sha256.txt` (from `store/`); protected hashes | 11 ` M` + 1 `??`; frozen OK; protected unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` each grant vs `b-round-128/r129-granted-start/` | `strings.ts`: one new object + X1 value; no `studioExportStrings` key change; no import. Context: only the import, the 6 constants and string literals inside the 8 commands; **no condition, dependency array or call-order change** (list every hunk). Tests: every hunk is literal → module reference with the same matcher, or the import; track names kept. Meaning check: no E row drops or adds a fact vs the Georgian original (C consults the Georgian original side by side). Every shell write listed |
| **EDIT-COPY** (both viewports) | S1-like setup (music clip on `მუსიკა`, stem on `სტემები`, SFX clip). In order, read the status after each: **(a)** Ctrl+E with nothing selected (E8); select one clip, playhead outside → Ctrl+E (E9); playhead inside → Ctrl+E (E11); select 2 clips crossed by the playhead → Ctrl+E (E4 plural); time selection inside one clip → Ctrl+E (E7). **(b)** Delete: one clip (E19), two clips (E16), time selection on one track (E14 `on the … track`), Ctrl+Shift+L on it (E21), then Delete (E14 `on all tracks`), Delete with no target (E17), Ctrl+Shift+L with no range (E20). **(c)** Ctrl+D with nothing (E23), with a clip (E26 n=1), with a time selection (E22). **(d)** Ctrl+C clip (E30 n=1), Ctrl+C time selection (E28), Ctrl+V (E42), Ctrl+X clip (E33), Ctrl+V into an occupied spot (E37) if reachable. **(e)** Ctrl+Shift+X with no range (E34), on a range (E36 incl. a marker inside → E36b) | Each status equals the §1.1 English exactly (with today's track names). Georgian count in the status region = 0 after subtracting track names (list them). Every action has the same **effect** as before (clip count, selection, gap/closed gap, clipboard paste result); C states the effect next to each message. Rows not reachable in the browser (e.g. E5, E35, E38, E39) are `inconclusive`, covered by ST7 only |
| **UNDO-LABEL** (1440) | After E11, E19, E16, E14, E26, E42 and a Cut Time: read the Undo button `title`, then Undo once and check the effect reverted | `Undo: Split`, `Undo: Delete clip`, `Undo: Delete clips (2)`, `Undo: Delete time selection` / `(all tracks)`, `Undo: Duplicate (1)`, `Undo: Paste (n)`, `Undo: Cut Time`; Undo restores the state each time |
| **EDIT-LAYOUT** (both) | S0/S1 boxes vs `c-round-125/out/bbox-baseline-*.json` (outside the status region); status region box after the longest message (E38 or E14); the toolbar Undo button after `Delete time selection (all tracks)` | Every box outside the status region within 1 px, except the Undo button, whose visible text is `Undo: {label}` (`ArrangementTransport.tsx` l.153, `truncate`): its width/clip may change only by its label text (RV-1 V-0 exception), with no toolbar wrap or overflow. The status region keeps its position; any height/wrap change is attributable to the message text (RV-1 V-0 text-width exception); no new horizontal overflow |
| **REG-EXPORT-COPY** (1440) | Open Export once (S2) | The dialog copy equals round 128 (`Done`, `Export WAV`, …); `invalidRangeNoFile` is not reachable → inconclusive, ST1 only |
| **G129-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | Workspace + demo badge; the product route shows "Sign in required", no workspace, 0 `audio[src]`; the token API returns **401**. Fake-Bearer 403: **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G129-3), `/api/recording-*`, `/api/download`, the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (known cloud cart noise not reported) |

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:** **Medium:** any behaviour change (effect, selection, history, clipboard), a wrong or fact-dropping message, a weakened/removed/skipped test, a non-string Context hunk. **Low:** wording/style.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Terms Split / Cut Time / Paste Time / Duplicate Time / Delete Time / time selection | Live 12 manual ch. 6 "Arrangement View", §6.11 "Using the …Time Commands" (Cut/Paste/Duplicate/Delete Time) and §6.12 "Splitting Clips"; B capture `b-round-71/ableton-arrangement-view-20261021.txt` (captured 2026-10-21, reused) | **Confirmed terms** | Messages use the same terms. CZABA has no Duplicate Time (E22 says so honestly) | EDIT-COPY |
| Delete on a time selection leaves a gap; Cut Time closes it on all tracks | same §6.11 for Cut Time; Delete-leaves-gap is the **user's decision 2026-10-11** (`delete-selection-update.md`) | Cut Time: **confirmed**. Delete-leaves-gap: **conscious difference** (user decision) | Unchanged behaviour; text only | EDIT-COPY effects |
| Undo history label wording | — | **Unconfirmed**; no claim | CZABA naming | UNDO-LABEL |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- C writes `c-round-129.md` and `c-round-129.json` as it goes: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted track names), `notesForB`. Evidence under `c-round-129/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.
- C makes no `store/` writes.

## 8. Outcome, fixed in advance (B at round 130 planning)
| Condition | Round 130 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.2a fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.2a → `c_pass`, `c_pass_published` after the gate. Round 130 = **V-0.2b** (playback, library add/drop, loop, move/nudge messages and the gesture constants) |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Where it could break:** the status announcement de-duplication (`status-announcement-ui`, it compares texts), history labels used by Undo/Redo tooltips, the gesture refusal before every command (untouched), and paste/duplicate conflict text that interpolates track names.
- **Architecture:** `ArrangementContext.tsx` (3765 lines) is edited by every V-0.2 stage; this is a string-only change. Recorded signals: A-R128 note (titles embed visible words), gate-128 nits (alias constants, `exportFailed('')` trailing space). B requests the bounded frontend-architect checkpoint (strings module shape, conditional copy) from root when V-0.2c closes, before V-0.3.
- **Commit readiness:** after C PASS, root may publish V-0.2a as an interim unit.
