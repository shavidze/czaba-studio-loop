# CURRENT TASK — Round 140: VISUAL-A V-0.4c — clip envelope editor, group header, track meter and Master Peak texts in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 139)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract` with the R6 clarification of round 133 (leaf module, one object per area, plain strings + small pure formatters, formatters take already formatted values, a branch that only picks between two texts stays in the caller, local names keep their names).
- **Previous task:** `tasks/round-139.md` (exact copy of the round-139 `current-task.md`, sha256 `6649610b…`). Rationale: `b-round-139.md`. Decision record: **D-29z105** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `3f2c187118ee4e3a1a3f71251fbbc05bf00a711e`** (gate 139 published on both remotes; HEAD). Tree **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-139-r140-tree-sha256.txt`, **943 entries** = `git ls-files -co --exclude-standard` (957) minus the 14 existing grants. Grants: `b-round-139-r140-grants.txt` (16 lines; the last 2 are new files). `sha256sum -c --quiet` OK at planning, run from `store/`.
- **Start hashes of the 14 existing grants:** `b-round-139-r140-granted-start-sha256.txt`. **Start copies:** `b-round-139/r140-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there). A checks both first; any difference → A stops and reports.

## 0. Why this round (D-29z105)
- **Round 139: C PASS**, `browserVerified` = `realVerified` = true, every browser row at 1440 and 1280, GEO-COUNT net 0, real Solo audio (soloed music → digital silence on the stems-only region), 2 pre-existing Lows. Gate 139 published `3f2c187` (164 test files / 2470 tests, build OK, review 9/10). **V-0.4b is done.**
- `tasks/round-139.md` §8 fixed this step: C PASS → **V-0.4c**, re-measured first. No strings-split checkpoint result exists (fourth planning without it; non-blocking). Regression due on/after 2026-10-27 (not yet). No Critical/High/Medium open. `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
- **B's measurement at `3f2c187`** (non-comment lines with Georgian or `«»`):
  - `ArrangementClipEnvelope.tsx` (407 lines): **10** — l.22, 23, 24, 25, 70, 171, 266, 300, 326, 336.
  - `ArrangementGroupHeader.tsx` (363): **10** — l.32, 33, 61, 62, 217, 241, 273, 289, 290, 310.
  - `ArrangementTrackMeter.tsx` (104): **2** — l.18, 101. `ArrangementMaster.tsx` (205): **2** — l.32, 33.
  - `e2e/`: 0 hits.
- **Pins (measured; literal grep `-F` plus partial-phrase grep incl. role-name regexes and `Mute|Solo|Volume —` selectors). 30 lines in 6 files:**
  - `clip-envelope-ui`: l.117, 118, 119 (`ADD_LABEL`/`MOVE_LABEL`/`REMOVE_LABEL` constants), 433, 477, 483, 526, 593, 649 (status `toBe`)
  - `track-group-mix-ui`: l.212 (role-name regex `^${name} — ჯგუფი`), 397, 403, 411 (Mute/Solo/Volume aria-label `toBe`), 425, 680, 689, 694 (fold role-name)
  - `track-groups-ui`: l.219 (role-name regex)
  - `track-group-collapse-ui`: l.220 (role-name regex), 415 (fold role-name), 473 (fold title), 660, 667, 671 (group name aria-label `toBe`)
  - `track-meter-ui`: l.475 (`toContain` sr-only), 477 (title `toBe`), 485, 529 (`not.toContain('გადააჭარბა')`)
  - `meter-ui`: l.278 `CLEAR_SUFFIX`, l.279 `OVER_SUFFIX`
- **Not pins (checked):** `track-group-mix-ui` l.244 `^Volume — ${name}` and l.419, `track-group-collapse-ui` l.665 `/Mute — (სტემები|SFX)/`, `gesture-guard` l.144, `group-volume-db` l.411 and `track-volume-db` l.293 (`aria-label^="Volume — "`) match prefixes that stay identical. `track-group-mix-ui` l.443/533 (`Mute — ჯგუფი 1`, `Solo — ჯგუფი 1`) are **Undo labels** built from the default group name — data, V-0.4d. `const GROUP_NAME = 'ჯგუფი 1'` (group-volume-db l.116, fader-touch l.23, …) is fixture data. StudioWorkspace finds the group name button by `data-testid="arrangement-group-name"` (l.329), not by text.
- **UI pin gaps (no existing literal):** Envelope editor `title` (l.336), Envelope point `title` (l.70), group name button `title` (l.32), group name input aria-label (l.241), group Solo `title` (l.290), the singular folded text (`1 clip`). They get tests in the new `header-meter-envelope-strings-ui.test.tsx`.
- **Not V-0.4c, do not touch (named mixed state, R5):** default group name `ჯგუფი N` (`groups.ts` l.4, V-0.4d) and default track names (`მუსიკა`, `სტემები`, `SFX`, `ვიდეო`, V-0.4d) stay inside the new English literals. `ArrangementDetailPanel.tsx` (incl. l.53 `(ჯგუფი)`) → V-0.4e. Library, VideoDock, route → V-0.5.

### Rulings D-29z105
- **R1 — objects:** envelope editor texts are **appended to the existing `studioClipEnvelopeStrings`** (one object per feature: the Envelope mode toggle texts live there already; grant: ST31's key list). Two new objects, appended after `studioLaneStrings`: **`studioGroupHeaderStrings`** and **`studioMeterStrings`** (precedent: V-0.4b `studioLaneStrings` beside `studioLaneMoveStrings`).
- **R2 — reuse, no copies (R4 forward constraints of D-29z104):** GroupHeader l.33 = `` `${studioLaneStrings.foldTitle} (U)` ``; GroupHeader l.290 title = `studioLaneStrings.soloTitle`; GroupHeader l.62 selected suffix = `studioLaneStrings.selectedSuffix`; Envelope l.25 = `studioClipStrings.historyUnchanged('Envelope')`; every Envelope time unit = `studioClipStrings.seconds(time.toFixed(3))` (caller formats, the formatter receives `6.000 s`).
- **R3 — branches stay in the caller:** the folded group text (`clipCount === 1 ? foldedOneClip : foldedClips(clipCount)`), the selected suffix, the meter over/normal titles, the Master over/normal labels, the Envelope preview vs committed status.
- **R4 — terminology:** CZABA already says **point** (`studioClipEnvelopeStrings.toggleOnTitle` “double-click a clip to add a point”) → keep “point”; Live 12 calls them breakpoints (§26.6.1 title in B's capture) — deliberate difference, recorded. `ჯგუფი` as a role word → lowercase `group`. Group/ungroup → Live 12 §18.3 “Group Tracks” / the existing Undo labels `Group Tracks` / `Ungroup Tracks` (StudioWorkspace l.909/937). `გადატვირთვა` → existing glossary `Overload`, lowercase after an em dash (C-R127-L1 (c) rule).
- **R5 — accepted mixed state for one round, named:** default group/track names inside English sentences (V-0.4d), detail panel (V-0.4e), library/dock/route (V-0.5).
- **R6 — every text and its matchers change in the same round**, including role-name regexes and exact aria-label `toBe`s.
- **Folded in (owned, low cost):** gate-139 #2 (doc 113 l.21 still says StudioWorkspace keeps one Georgian line) and gate-139 #4 (doc 115 status → Completed).
- **Not folded:** gate-139 #1 + A's Architecture note (`trackRowNameButton` selector ↔ `activeTrackLabel`; proposal `data-testid="arrangement-track-name"`) → architecture signal + checkpoint addendum (Lane/StudioWorkspace not granted). Gate-139 #3 (`videoEmptyPlaceholder` formatter) → `deferred_low_polish`. C-R139-01 / C-R139-02 → `deferred_low_polish` (§9).

## 1. What changes (user-visible)
**Text only.** None of these change: any handler, condition, threshold, key binding, gesture, history behaviour, Mute/Solo/Volume/fold logic, meter latch or reset logic, any `data-testid`, class name, glyph (`▸`, `▾`, `▣`, `M`, `S`), the dB/dBFS formats (`formatClipEnvelopeGain`, `formatPeakDbfs`, `formatTrackVolumeDb`) or `toFixed(3)`.

### 1.1 The English map (exact text; A may not reword it. If a line seems wrong, A reports it and B rules)
`{…}` are values passed by the caller. `{time}` is always `studioClipStrings.seconds(t.toFixed(3))`, e.g. `6.000 s`.

**Envelope → appended to `studioClipEnvelopeStrings`**
| ID | Source line in `ArrangementClipEnvelope.tsx` | Key | Exact English |
|---|---|---|---|
| EV1 | l.22 `ENVELOPE_ADD_LABEL` | `addPointLabel` | `Envelope: add point` |
| EV2 | l.23 `ENVELOPE_MOVE_LABEL` | `movePointLabel` | `Envelope: move point` |
| EV3 | l.24 `ENVELOPE_REMOVE_LABEL` | `deletePointLabel` | `Envelope: delete point` |
| EV4 | l.25 `ENVELOPE_NO_CHANGE` | (reuse) `studioClipStrings.historyUnchanged('Envelope')` | `Envelope: nothing changed — the Undo history is unchanged.` |
| EV5 | l.70 `envelopePointTitle` | `pointTitle({ time, gain })` | `Envelope: {time} · {gain} — drag · double-click = delete` |
| EV6 | l.171 | `pointAdded({ time, gain })` | `Envelope: point added — {time} · {gain}.` |
| EV7 | l.266 (preview) | `pointPreview({ time, gain })` | `Envelope: {time} · {gain}` |
| EV8 | l.300 (commit) | `pointCommitted({ time, gain })` | `Envelope: {time} · {gain}.` |
| EV9 | l.326 | `pointDeleted(time)` | `Envelope: point deleted — {time}.` |
| EV10 | l.336 | `editorTitle` | `Envelope — double-click = add point` |

**Group header → new `studioGroupHeaderStrings`**
| ID | Source line in `ArrangementGroupHeader.tsx` | Key | Exact English |
|---|---|---|---|
| GH1 | l.32 `TRACK_GROUP_NAME_TITLE` | `nameTitle` | `F2: Rename · Ctrl+G: Group Tracks · Ctrl+Shift+G: Ungroup Tracks` |
| GH2 | l.33 `TRACK_GROUP_FOLD_TITLE` | (reuse) `` `${studioLaneStrings.foldTitle} (U)` `` | `Fold / unfold (U)` |
| GH3 | l.62 | `nameLabel(name)` | `{name} — group` |
| GH4 | l.61 (one clip) | `foldedOneClip` | `, folded, 1 clip` |
| GH5 | l.61 (other counts) | `foldedClips(count)` | `, folded, {count} clips` |
| GH6 | l.62 selected | (reuse) `studioLaneStrings.selectedSuffix` | `, selected` |
| GH7 | l.217 | `foldLabel(name)` | `Fold or unfold group — {name}` |
| GH8 | l.241 | `nameInputLabel(name)` | `Group name — {name}` |
| GH9 | l.273 | `muteLabel(name)` | `Mute — {name} (group)` |
| GH10 | l.289 | `soloLabel(name)` | `Solo — {name} (group, Ctrl/Cmd+click = add to solo)` |
| GH11 | l.290 | (reuse) `studioLaneStrings.soloTitle` | `Solo (Ctrl/Cmd+click = add to solo)` |
| GH12 | l.310 | `volumeLabel(name)` | `Volume — {name} (group)` |

`trackGroupNameLabel` keeps its name and signature; body: `` `${nameLabel(name)}${collapsed ? (clipCount === 1 ? foldedOneClip : foldedClips(clipCount)) : ''}${selected ? selectedSuffix : ''}` `` (Biome may wrap; the two ternaries stay in the caller).

**Meter → new `studioMeterStrings`**
| ID | Source line | Key | Exact English |
|---|---|---|---|
| MT1 | TrackMeter l.19 (normal, already English; moved so the pair lives together) | `trackPeakTitle({ name, peak })` | `{name} · Peak {peak} dBFS` (byte-identical to today) |
| MT2 | TrackMeter l.18 (over) | `trackPeakOverTitle({ name, peak })` | `{name} · Peak {peak} dBFS — went above 0 dBFS. Click Master Peak to clear` |
| MT3 | TrackMeter l.101 (sr-only) | `trackOverAnnouncement(name)` | `{name}: the level went above 0 dBFS` |
| MT4 | Master l.33 (normal) | `masterPeakLabel(peak)` | `Master Peak {peak} dBFS — click to clear` |
| MT5 | Master l.32 (over) | `masterPeakOverLabel(peak)` | `Master Peak {peak} dBFS — overload (Clip). Click to clear` |

`trackMeterTitle` and `masterPeakLabel` (component-local functions) keep their names and signatures and pick the formatter.

**Exact rendered text that pins and C rows must match (examples):**
- Envelope: Undo button `Undo: Envelope: add point`; statuses `Envelope: point added — 6.000 s · 0.0 dB.`, `Envelope: 6.000 s · −2.5 dB` (while dragging), `Envelope: 6.000 s · −2.5 dB.` (after release), `Envelope: point deleted — 10.000 s.`, `Envelope: nothing changed — the Undo history is unchanged.`; editor title `Envelope — double-click = add point`.
- Group (default name kept): `ჯგუფი 1 — group`, `ჯგუფი 1 — group, selected`, `ჯგუფი 1 — group, folded, 2 clips, selected`, `ჯგუფი 1 — group, folded, 2 clips`; regex `` new RegExp(`^${escapeRegExp(name)} — group`) ``; `Mute — ჯგუფი 1 (group)`, `Solo — ჯგუფი 1 (group, Ctrl/Cmd+click = add to solo)`, `Volume — ჯგუფი 1 (group)`; fold `Fold or unfold group — ჯგუფი 2`, title `Fold / unfold (U)`.
- Meter: `SFX · Peak +3.5 dBFS — went above 0 dBFS. Click Master Peak to clear`; `SFX: the level went above 0 dBFS`; `Master Peak −12.0 dBFS — click to clear`; `Master Peak +3.5 dBFS — overload (Clip). Click to clear`.
- Local constant names stay (`ENVELOPE_ADD_LABEL`, `ENVELOPE_MOVE_LABEL`, `ENVELOPE_REMOVE_LABEL`, `ENVELOPE_NO_CHANGE`, `TRACK_GROUP_NAME_TITLE`, `TRACK_GROUP_FOLD_TITLE`) and take their values from the module.

**Glossary additions (d29z105):**
| Georgian | English | Source |
|---|---|---|
| `წერტილი` (envelope) | point | existing `toggleOnTitle`; Live 12 “breakpoint” (§26.6.1) — deliberate difference |
| `წერტილის დამატება / გადატანა / წაშლა` | add / move / delete point | Undo label noun pattern (`Delete clip`) |
| `ჯგუფი` (role word) | group | Live 12 §18.3 Group Tracks |
| `დაჯგუფება / დაშლა` | Group Tracks / Ungroup Tracks | existing Undo labels |
| `ჯგუფის სახელი` | Group name | CZABA label |
| `0 dBFS-ს გადააჭარბა` | went above 0 dBFS | CZABA label |
| `გასასუფთავებლად დააჭირე` | click to clear | CZABA label |
| `გადატვირთვა (Clip)` | overload (Clip) | glossary `Overload` (V-0.1), lowercase after a dash |

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | Append EV keys to `studioClipEnvelopeStrings` (its 4 existing keys byte-identical); append `studioGroupHeaderStrings` and `studioMeterStrings` after `studioLaneStrings`. Other objects, keys and values byte-identical. No import. |
| `app/components/arrangement/ArrangementClipEnvelope.tsx` | A new strings import, plus exactly the EV lines. Biome-style wraps allowed. |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | A new strings import, plus exactly the GH lines (incl. the `trackGroupNameLabel` body). |
| `app/components/arrangement/ArrangementTrackMeter.tsx` | A new strings import, `trackMeterTitle` body (l.17–19) and l.101. |
| `app/components/arrangement/ArrangementMaster.tsx` | A new strings import, `masterPeakLabel` body (l.31–33). |
| `app/lib/arrangement/__tests__/strings.test.ts` | Import specifiers; ST31: `studioClipEnvelopeStrings` key list + `EXPECTED_CLIP_ENVELOPE_STRINGS` gain the EV plain strings, plus formatter samples for EV5–EV9 (the 4 existing values unchanged). New `describe('V-0.4c header, meter and envelope strings')` with ST38–ST39 (§3.1). |
| The 6 pin files of §0 | Exactly the listed lines. No other line, no new `it`, `it` counts unchanged. |
| `docs/.../113-studio-v0-workspace-strings.md` | l.21: the sentence “ამიტომ StudioWorkspace-ში ზუსტად ერთი ქართული ხაზი რჩება. ST33 ამას pin-ავს.” gets the suffix ` (round 138-ის მდგომარეობა; V-0.4b-ში, round 139, ეს ხაზი გადაითარგმნა და ST33 ახლა 0-ს ამოწმებს)`. Nothing else. |
| `docs/.../115-studio-v0-lane-strings.md` | l.4 → `Completed (A-ის შემოწმებები მწვანეა რაუნდ 139-ში; C round 139 — PASS, browserVerified; gate 139 — 3f2c187)`; l.72 last sentence → C round 139 PASS; delete the C round 139 TODO line (l.76). Locate by content (`grep -n "C round 139"`). |
| **new** `app/lib/arrangement/__tests__/header-meter-envelope-strings-ui.test.tsx` | HM1–HM6 (§3.3) |
| **new** `docs/implementation/2026/quarter-IV/116-studio-v0-header-meter-envelope-strings.md` | Georgian, `docs/implementation/TEMPLATE.md` sections; status says C round 140 is still to come. |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, everything in `backlog.json` `global_forbidden_files`.
- **Pin rule:** each replaced pin is a **hand-written English literal** with the same matcher (`toBe` stays `toBe`, `toContain` stays `toContain`, `not.toContain` stays `not.toContain` with the new English over phrase `went above 0 dBFS`, a RegExp stays a RegExp with the same anchors). No pin imports the module value it checks. Fixture names (`ჯგუფი 1`, `SFX`, …) stay.
- **Stop rule:** if the pre-edit grep finds a Georgian V-0.4c text (§1.1) in a non-granted file other than the R5 list, or a pin line differs from §0, A stops and reports. A does not widen scope.
- **Edit rule (C-R120-01):** every lasting edit via Edit/Write; shell writes only for temporary mutations, restored and sha-verified; A lists every shell write. Before editing an untracked granted file, store a pre-edit copy with sha256 under `a-round-140/`.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (37 → 39 `it`s)
- **ST31 (edit):** the `studioClipEnvelopeStrings` key list gains `addPointLabel`, `deletePointLabel`, `editorTitle`, `movePointLabel`, `pointAdded`, `pointCommitted`, `pointDeleted`, `pointPreview`, `pointTitle`; plain values equal the EV literals; hand-written samples: `pointTitle({ time: '6.000 s', gain: '0.0 dB' })` = `Envelope: 6.000 s · 0.0 dB — drag · double-click = delete`, `pointAdded(…)` = `Envelope: point added — 6.000 s · 0.0 dB.`, `pointPreview` / `pointCommitted` with and without the final `.`, `pointDeleted('10.000 s')` = `Envelope: point deleted — 10.000 s.`. The loop over plain values must still check every string key (adjust the loop to skip functions, not to skip keys).
- **ST38:** exact key sets of `studioGroupHeaderStrings` and `studioMeterStrings`; every plain string equals its §1.1 literal; every formatter returns the exact English for Latin samples (`nameLabel('Drums')`, `foldedClips(2)`, `foldLabel('Drums')`, `nameInputLabel('Drums')`, `muteLabel('Drums')`, `soloLabel('Drums')`, `volumeLabel('Drums')`, `trackPeakTitle({ name: 'SFX', peak: '−3.0' })`, `trackPeakOverTitle({ name: 'SFX', peak: '+3.5' })`, `trackOverAnnouncement('SFX')`, `masterPeakLabel('−12.0')`, `masterPeakOverLabel('+3.5')`).
- **ST39 (per-file scans):** the new values and all sample outputs have no Georgian and no `«»`; `ArrangementClipEnvelope.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementTrackMeter.tsx`, `ArrangementMaster.tsx` (comments stripped) have **no** Georgian line and no `«»`.

### 3.2 Pin replacements
Each §0 pin gets the §1.1 English with fixture names unchanged. Examples: `clip-envelope-ui` l.117–119 → `'Envelope: add point'` / `'Envelope: move point'` / `'Envelope: delete point'`; l.433 → `'Envelope: point added — 6.000 s · 0.0 dB.'`; l.477 → `'Envelope: 6.000 s · −2.5 dB'`; l.483 → `'Envelope: 6.000 s · −2.5 dB.'`; l.526 → `'Envelope: nothing changed — the Undo history is unchanged.'`; l.593 → `'Envelope: 11.000 s · −12.0 dB.'`; l.649 → `'Envelope: point deleted — 10.000 s.'`; role regexes → `` new RegExp(`^${escapeRegExp(name)} — group`) ``; fold role names → `'Fold or unfold group — ჯგუფი 1'` / `` `Fold or unfold group — ${name}` ``; l.473 title → `'Fold / unfold (U)'`; l.660/667/671 → `'ჯგუფი 1 — group, selected'`, `'ჯგუფი 1 — group, folded, 2 clips, selected'`, `'ჯგუფი 1 — group, folded, 2 clips'`; `meter-ui` `CLEAR_SUFFIX = 'dBFS — click to clear'`, `OVER_SUFFIX = 'dBFS — overload (Clip). Click to clear'`; `track-meter-ui` l.475 → `'SFX: the level went above 0 dBFS'`, l.477 → the MT2 example, l.485/529 → `not.toContain('went above 0 dBFS')`.

### 3.3 New `header-meter-envelope-strings-ui.test.tsx` (real `StudioWorkspace` in jsdom; copy the mount harness of `clip-envelope-ui.test.tsx` / `track-group-collapse-ui.test.tsx`, do not import them)
- **HM1:** in Envelope mode, the editor overlay (`arrangement-clip-envelope-editor`) has `title` `Envelope — double-click = add point`; after a double-click adds a point, the point (`arrangement-clip-envelope-point`) has `title` `Envelope: {t} s · {gain} — drag · double-click = delete` with the real values (hand-written for the fixture).
- **HM2:** after Ctrl+G on two tracks, the group name button (`arrangement-group-name`) has `title` `F2: Rename · Ctrl+G: Group Tracks · Ctrl+Shift+G: Ungroup Tracks`; F2 opens the input (`arrangement-group-name-input`) with aria-label `Group name — ჯგუფი 1`.
- **HM3:** the group Solo button (`arrangement-group-solo`) has `title` `Solo (Ctrl/Cmd+click = add to solo)`.
- **HM4:** a collapsed group whose members hold exactly one clip has the name aria-label `ჯგუფი 1 — group, folded, 1 clip` (if no fixture path gives one clip without non-granted changes, A reports it instead of faking it).
- **HM5:** the track meter `title` without overload equals `{track} · Peak {peak} dBFS` for a known frame (drive the store the way `track-meter-ui.test.tsx` does).
- **HM6:** the Master Peak button aria-label after a reset is `Master Peak −∞ dBFS — click to clear` (hand-written).

### 3.4 Forward rule (GATE130-S3)
Every EV/GH/MT key has at least one hand-written UI literal in a pin file or in HM1–6. A lists the key → test mapping in its report.

### 3.5 Mutations (each turns the named tests red; restore and check by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m69 | GH3 `— group` → `— grp` | ST38, the role-regex files (`track-group-mix-ui`, `track-groups-ui`, `track-group-collapse-ui`) |
| m70 | the caller's `clipCount === 1` branch inverted | `track-group-collapse-ui` l.667/671 and HM4 |
| m71 | EV4 uses a new literal `Envelope: no change.` instead of `historyUnchanged('Envelope')` | `clip-envelope-ui` l.526 |
| m72 | the Envelope time unit built inline as `` `${t.toFixed(3)} sec` `` in the status call sites | `clip-envelope-ui` l.433/477/483 |
| m73 | the Master over/normal branch swapped | `meter-ui` (CLEAR/OVER rows) |
| m74 | `trackMeterTitle` over/normal branch swapped | `track-meter-ui` l.477/485 and HM5 |
| m75 | GroupHeader l.290 `title="Solo"` literal instead of `studioLaneStrings.soloTitle` | HM3 |
| m76 | a Georgian letter added inline to GroupHeader l.32 | ST39 |

## 4. A — checks (speed rules)
- At the start: the frozen list, the 14 start hashes and the start copies all OK. `git status --short` empty.
- Pre-edit grep for every §1.1 Georgian text (full and partial phrases) in `app/**` and `e2e/**`, saved to `a-round-140/pre-grep.txt`.
- `npm run typecheck` and `npm run lint` exit 0. Read-only `npx biome check` on the changed code and test files: 0 diagnostics.
- `npx vitest run` on: `strings`, the 6 pin files, `header-meter-envelope-strings-ui`, and neighbours `clip-envelope-ui`, `clip-gain-waveform`, `group-volume-db`, `fader-touch`, `gesture-guard`, `track-volume-db`, `lane-strings-ui`, `clip-strings-ui`, `status-announcement-ui`, `render-budget`. Save to `a-round-140/vitest.json`.
- Mutations m69–m76 per §3.5.
- The code-reviewer (more than 3 files change). Its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build, e2e (the gate does these).
- At the end: `git status --short` shows exactly the 14 ` M` + 2 `??` granted paths (if a pin file needed no change, say so). Frozen list OK. Protected `git diff 3f2c187` empty. End sha256 of the changed paths → `a-round-140/end-sha256.txt`. No commit, stash, checkout, install, `--write` or `check:fix`.

## 5. C — rows
Real Playwright Chromium at **1440×900 and 1280×720** on `http://127.0.0.1:5173/studio-lab`, fresh context per session. Use `data-testid`s and the **new English** labels. State Snap at the start of each session (default off). Harness notes from round 139: a **track** fold keeps clips visible at 27 px; a **group** fold renders 0 clips of its members; the video `Original sound` line needs a row ≥ 80 px.

| Row | Start state → action → expected |
|---|---|
| T140-TARGETED | Run A's named vitest list; counts equal A's |
| SOURCE-SCOPE | Only granted paths changed; frozen list OK at start and end; end hashes equal `a-round-140/end-sha256.txt`; protected diff vs `3f2c187` empty; no source change during C's phase |
| AN-REVIEW | `diff -u` against `b-round-139/r140-granted-start/`: only §1.1 lines and the imports change; no handler, condition, class or testid change; pins hand-written with the same matchers/anchors; strings.test changes only the imports, ST31 (envelope keys + samples) and ST38–39; docs 113/115 only the named lines |
| ENVELOPE | Envelope mode on (`A` or the toggle). Editor title EV10. Double-click a clip → status EV6 with the real time/gain, Undo title `Undo: Envelope: add point`. Drag the point down to ≤ −12 dB → live status EV7 (no final `.`), release → EV8 (with `.`), Undo title `Undo: Envelope: move point`. Point title EV5 with the shown values. Double-click the point → EV9, Undo title `Undo: Envelope: delete point`. A drag that returns to the start → EV4 and the Undo title unchanged. **Behaviour:** Ctrl+Z after the move restores the point (status/title back); **real audio**: paired output-tap or range-export RMS at the point time with the point at ≤ −12 dB vs after Undo of the move is ≥ 6 dB lower (same position; C-R82-LIVE-ORACLE-PAIRED) |
| GROUP-HEADER | Select two adjacent audio tracks, Ctrl+G → a group row; name button aria-label `ჯგუფი 1 — group, selected` (selected after creation: `replaceTrackSelection([group.id])`, StudioWorkspace l.912) and title GH1; fold button aria-label `Fold or unfold group — ჯგუფი 1`, title `Fold / unfold (U)`; click fold → `aria-expanded=false`, 0 member clips rendered, name label `ჯგუფი 1 — group, folded, {n} clips…` with the real member clip count (singular `1 clip` if a one-clip group is produced); unfold restores. F2 → input aria-label `Group name — ჯგუფი 1`; Escape keeps the name |
| GROUP-MIX | Group Mute aria-label `Mute — ჯგუფი 1 (group)`; Solo `Solo — ჯგუფი 1 (group, Ctrl/Cmd+click = add to solo)`, title `Solo (Ctrl/Cmd+click = add to solo)`; Volume `Volume — ჯგუფი 1 (group)` and ArrowLeft changes `aria-valuetext`. **Real audio (paired, same position, a region where only group members sound):** group Mute → output RMS ≥ 20 dB lower; unmute restores; group Solo → a non-member track's region is silent (≥ 20 dB lower); Ctrl/Cmd+click Solo on a non-member track adds it (both soloed) |
| METER | Play the default demo: the Master Peak button reaches the over state (default project export peaks above 0 dBFS, C-R86-OBS; if the live latch does not trip at Master 0 dB, raise Master Volume to +6 dB (its max) and play again; report which) → aria-label MT5 with the shown peak; click it → MT4 with `−∞`, no new Undo entry, no status text. Drive one track above 0 dBFS (e.g. Clip Gain +12 dB on a loud clip, or another real way) → its meter `title` = MT2 and the header contains the sr-only MT3; a track that did not go over has the MT1 title only. Clicking Master Peak clears the track latch too (title back to MT1). If no track can be driven over in the browser, the track-over texts are inconclusive with the reason (unit pins only) |
| GEO-COUNT | At every step count Georgian in the envelope editor/points (titles), group header (all attributes + text), track meters, Master, status line, Undo/Redo titles. Expect **0** after the named subtractions (R5): default group name `ჯგუფი N`, track names, detail panel, library, dock, demo badge. List every subtraction |
| LAYOUT | S0/S1/S2 (round-130 harness) against round 139: any change >1 px only from a granted text (status line). Plus one group-row snapshot (group row height, name/M/S/fader boxes) against the round-139 tree measured in the same session if C has no stored group baseline — report which |
| REG-139 | One sample each: TRACK-SELECT aria-label `მუსიკა — set as the active track, selected` and `Solo — მუსიკა (Ctrl/Cmd+click = add to solo)` |
| G140-3 (alone, last) | `/studio-lab` shows the workspace and demo badge. `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`. `GET /api/studio-token?…` → 401. Fake-Bearer 403 BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror (known cart noise expected) |

Gate rows (C does not claim them): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## 6. Ableton source
Live 12 Reference Manual, B's saved capture `b-round-133/live/arrangement-view.txt` (re-grepped 2026-10-24 for this task; the capture holds the table of contents and the Arrangement View chapter).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Envelope points | §26.6.1 “Adding Automation Envelope Breakpoints”, §42.7 “Commands for Breakpoint Envelopes” | **section titles only** (TOC); body text not captured | CZABA says “point” (existing English); add by double-click is CZABA's existing behaviour, unchanged | ENVELOPE |
| Group tracks | §18.3 “Group Tracks” | **section title only** (TOC) | Undo labels `Group Tracks` / `Ungroup Tracks` already exist; header labels are CZABA's | GROUP-HEADER |
| Overload indicator | §38.3 “The Overload Indicator” | **section title only**; that is the CPU overload indicator, not the meter clip indicator | Master Peak `overload (Clip)` is CZABA's label; no Live claim | METER |
| Solo Ctrl/Cmd+click adds | Mixer chapter not captured | **unconfirmed** | CZABA rule (unchanged) | GROUP-MIX |

C rates “CZABA requirement met” and “Ableton correspondence” separately.

## 7. Evidence and reporting
- C writes `c-round-140.md` and `c-round-140.json` as it goes (`taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` with subtractions, `measurements`, `invalidRuns`, `notesForB`). Evidence under `c-round-140/{tools,out,shots}/`. Every run writes a uniquely named output (C-R125-HARNESS-OVERWRITE). No `store/` writes.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`; an honestly unobservable state is `inconclusive` with its reason.
- A writes `a-round-140.md` as it goes: start checks, pre-grep, changed files, `it` counts before/after, test results, mutations, reviewer verdict and Architecture note, shell writes, end state, deviations and known gaps.

## 8. Outcome, fixed in advance (B at round 141 planning)
| Condition | Round 141 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.4c fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.4c → `c_pass`, then `c_pass_published` after the gate. Round 141 = **V-0.4d** (default track names, ArrangementContext l.547/548 area, and `TRACK_GROUP_NAME_PREFIX` with the fixture sweep; GATE133-GROUP-PREFIX, ST22 allowance → 0), re-measured first; B decides whether the ~180-line fixture sweep needs its own split. If root's strings-split checkpoint result arrives first, B applies it as its own bounded round before V-0.4d |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Role-name matchers:** 3 test files find the group name button by `^… — ჯგუფი`, and 2 find the fold button by its full aria-label; a label change without them makes those tests fail to find the button. m69 proves it.
- **Prefix selectors that must keep matching:** `^Volume — ${name}` (track-group-mix-ui l.244), `aria-label^="Volume — "` (group-volume-db l.411, track-volume-db l.293), `Volume — ${trackName}` (gesture-guard l.144). The group labels keep the `Volume — {name}` / `Mute — {name}` prefix, so these stay green; A confirms with the neighbour runs.
- **Imperative attributes:** `ArrangementTrackMeter` writes `title` via `setAttribute` in a frame callback (l.62) and Master writes the Peak label similarly; only the text source changes, not when it is written. `render-budget` is in the neighbour list.
- **Undo labels:** the three Envelope history labels change; group Mute/Solo/Volume Undo labels (`Mute — ჯგუფი 1`) do not (they come from the context, not GroupHeader).
- **C-R139-01** (no status after a blocked library release; = INFO-R64-BLOCKED-NO-STATUS, dropEffect none → no drop event) and **C-R139-02** (library drop ghost stays after an Escape-cancelled drag in Playwright Chromium; real-Chrome dragleave unconfirmed → Tech Lead check) are pre-existing Lows in `deferred_low_polish`; not this round.
- **Architecture:** strings-split checkpoint request still open and non-blocking (round-139 addendum: gate-139 Signal 2 `data-testid="arrangement-track-name"` proposal).
- **Commit readiness:** after C PASS, root may publish V-0.4c as an interim unit.
