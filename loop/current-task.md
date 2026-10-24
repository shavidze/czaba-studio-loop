# CURRENT TASK — Round 141: VISUAL-A V-0.4d — default group and track names in English (`Group N`, Video / Music / Stems / Audio)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 140)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract` + the R6 clarification of round 133 (leaf module, one object per area, plain strings + small pure formatters, branches stay in the caller, existing exported constants keep their names and take their values from the module).
- **Previous task:** `tasks/round-140.md` (exact copy of the round-140 `current-task.md`, sha256 `dc06b7ec…`). Rationale: `b-round-140.md`. Decision record: **D-29z106** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `6ebbf3ec1c7954e5a33f15e4ac1d20aa2b313414`** (gate 140 published on both remotes; HEAD). Tree **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-140-r141-tree-sha256.txt`, **944 entries** = `git ls-files -co --exclude-standard` (959) minus the 15 existing grants. Grants: `b-round-140-r141-grants.txt` (17 lines; the last 2 are new files). `sha256sum -c --quiet` OK at planning, run from `store/`.
- **Start hashes of the 15 existing grants:** `b-round-140-r141-granted-start-sha256.txt`. **Start copies:** `b-round-140/r141-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there). A checks both first; any difference → A stops and reports.
- **Measured sweep lines:** `b-round-140-r141-prefix-lines.txt` (191 lines = every `ჯგუფი` in `app/lib/arrangement/__tests__` and `e2e/` at `6ebbf3e`; `e2e/` has 0).

## 0. Why this round (D-29z106)
- **Round 140: C PASS**, `browserVerified` = `realVerified` = true. Every browser row passed at 1440 and 1280 and GEO-COUNT was net 0. Real audio confirmed the envelope (≈14 dB paired drop), group Mute/Solo (≈179/180 dB) and the real Master and track over states. Gate 140 published `6ebbf3e` (165 test files / 2478 tests, build OK, review 9/10). **V-0.4c is done.**
- `tasks/round-140.md` §8 set this step: C PASS → **V-0.4d**, re-measured first. Other checks at planning:
  - The regression is due on/after 2026-10-27; today is 2026-10-24, so not yet.
  - No Critical/High/Medium finding is open.
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
  - There is no strings-split checkpoint result yet (fifth planning without it; it does not block).
- **B's measurement at `6ebbf3e`** (non-comment lines with Georgian, V-0.4d area):
  - `app/lib/arrangement/groups.ts` l.4 `export const TRACK_GROUP_NAME_PREFIX = 'ჯგუფი';` (used only in `nextTrackGroupName`, l.313/316).
  - `app/contexts/ArrangementContext.tsx` l.548 `name: 'ვიდეო'`, l.549 `name: 'აუდიო'` (`fallbackArrangement`). It is used when no `initialArrangement` is passed. No test mounts the provider without one, so these lines only show up in ST13. l.3468 (load-error fallback) is **V-0.5** (`area_addition_d29z96`), not this round.
  - `app/routes/studio-lab.tsx` l.13 `'ვიდეო'`, l.14 `'მუსიკა'`, l.15 `'სტემები'` (l.16 `'SFX'` is already Latin). l.8 (the meta title) is **V-0.5** (`forward_constraints_d29z103`). The route exports only `meta` and the default component, not its arrangement.
  - The arrangement has **no persistence** (no localStorage or IndexedDB in `app/lib/arrangement` or the context), so old `ჯგუფი N` names need no migration.
- **Re-measurement moves the route names in (R1).** The backlog said "studio-lab.tsx names stay with V-0.5 unless re-measurement moves them". The route's l.13–15 are the **only default track names a user sees**, because `/studio-lab` always passes `initialArrangement`. If only the context fallback changed, C would have nothing to see in the browser. So they move into V-0.4d.
- **Sweep (forward constraint d29z105: "the default group name prefix changes the Undo labels and all GROUP_NAME fixtures together"):** 191 lines in 10 test files. Counts:
  - track-group-mix-ui 86
  - track-group-collapse-ui 59
  - track-groups-ui 21
  - groups.test 7
  - strings.test 6
  - header-meter-envelope-strings-ui 5
  - track-group-mix.test 4
  - clip-gain-waveform 1
  - fader-touch 1
  - group-volume-db 1

  `e2e/` has 0 hits. B's grep found no case-insensitive `/group/i` or `name: /…Group…/` matcher in the tests, so `Group 1 — group` cannot match twice by accident. A re-greps (§4).
- **Not swept (data, D-29z103 R4):**
  - The ≈200 test-fixture lines with `მუსიკა` / `სტემები` / `ვიდეო` / `აუდიო`. Each test builds its own arrangement, so these are test data, not pins of the default names.
  - The `GROUP_REASON` constants with `აუდიო` (Clip Gain reason). They are **V-0.4e** detail-panel pins.
  - `library-preview.test` l.248, which is library copy (**V-0.5**).

  A does **not** touch them.
- **Layout pre-check:** the group name button is `min-w-0 flex-1 truncate` inside the 224 px header, and so is the track name button (Lane l.692). The boxes do not depend on the text width, so the visible name change must not move the M/S/fader boxes (§5 LAYOUT).

### Rulings D-29z106
- **R1 — scope:** `TRACK_GROUP_NAME_PREFIX` → `Group`; route l.13–15 → `Video`, `Music`, `Stems` (l.16 `SFX` unchanged); context fallback l.548–549 → `Video`, `Audio`. Route l.8 meta title and context l.3468 stay in V-0.5.
- **R2 — where the texts live:**
  - The group prefix becomes the key **`defaultNamePrefix: 'Group'`**, appended to the existing `studioTrackGroupStrings` (`groups.ts` already imports it).
  - `TRACK_GROUP_NAME_PREFIX` keeps its name and export and is defined as `studioTrackGroupStrings.defaultNamePrefix` (the `existing_exports` rule).
  - The **track names stay data literals** in the route and the context, as `'SFX'` already is. They are user-renameable track data, not UI copy. ST13 and the new ST40 pin them.
- **R3 — sweep rule:** in the 10 test files, **every** `ჯგუფი` token becomes `Group`. Nothing else on those lines changes. Examples:
  - `'ჯგუფი 1'` → `'Group 1'`
  - `group:ჯგუფი 1:…` → `group:Group 1:…`
  - `▣ჯგუფი 1` → `▣Group 1`
  - the bare fixture `'ჯგუფი'` in clip-gain-waveform l.183 → `'Group'`

  The ST22 special case and its constant are removed (§3.1). The allowed tool is Edit with `replace_all` on the exact token `ჯგუფი`, one file at a time. Before that, A checks each file's count against §0.
- **R4 — terminology:** the default group name is `Group` + space + number. The numbering rule is unchanged: the lowest free index is used, and a renamed group frees its number. The default track names are `Video`, `Music`, `Stems`, `Audio`, with `SFX` kept. Live 12's default Group Track name is **unconfirmed** (B's capture has the §18.3 title only). CZABA makes no Live claim.
- **R5 — accepted mixed state for one round, named:**
  - detail panel (V-0.4e), including the l.53 `ჯგუფი …` role-word note and the Clip Gain reason;
  - library, dock, route meta title, collection messages, context l.3468 and the demo source titles (V-0.5).
- **R6 — no split:** one round, one owner, because:
  - the sweep is a mechanical token replace in 10 files (similar in size to round 140's 16 files);
  - the source change is 6 lines;
  - the new names are one feature.
- **Folded in (owned, low cost):** gate-140 #1 (doc 116 status still says the browser check is pending) and gate-140 #3 (ST39's hard-coded `toBe(17)`).
- **Ratified:** A's round-140 deviations 1–3: the `track-group-mix-ui` l.405 Solo title pin, the ST33 `typeof` guard, and the Biome one-line wrap in collapse-ui. C and the gate reviewer both checked them.

## 1. What changes (user-visible)
On `/studio-lab` the track headers read **Video, Music, Stems, SFX**. A new group is named **Group 1** (then Group 2, …). Every sentence that already interpolates these names now shows them in English. Examples:
- status `Group “Group 1” created: Music, Stems.`
- Undo label `Mute — Group 1`
- meter title `Music · Peak …`
- aria-label `Group 1 — group, selected`

Nothing else changes: no handler, condition, numbering rule, key binding, gesture, history behaviour, mix or meter logic, `data-testid`, class or glyph.

### 1.1 Exact source edits
| ID | File / line | Before | After |
|---|---|---|---|
| DN1 | `strings.ts`, appended as the **last key** of `studioTrackGroupStrings` | — | `defaultNamePrefix: 'Group',` |
| DN2 | `groups.ts` l.4 | `export const TRACK_GROUP_NAME_PREFIX = 'ჯგუფი';` | `export const TRACK_GROUP_NAME_PREFIX = studioTrackGroupStrings.defaultNamePrefix;` (the import already exists) |
| DN3 | `ArrangementContext.tsx` l.548 / l.549 | `name: 'ვიდეო'` / `name: 'აუდიო'` | `name: 'Video'` / `name: 'Audio'` |
| DN4 | `studio-lab.tsx` l.13 / l.14 / l.15 | `'ვიდეო'` / `'მუსიკა'` / `'სტემები'` | `'Video'` / `'Music'` / `'Stems'` |

**Exact rendered text (examples for pins and C rows):**
- `Group 1 — group, selected`
- `Group 1 — group, folded, 2 clips`
- `Fold or unfold group — Group 1`
- `Mute — Group 1 (group)`
- `Group name — Group 1`
- status `Group “Group 1” created: Music, Stems.`
- status `Group “Group 1” ungrouped.`
- Undo title `Undo: Mute — Group 1`
- track header aria-label `Music — set as the active track` (+ `, selected` when selected)

**Glossary additions (d29z106):** `ჯგუფი N` (default name) → `Group N`; `ვიდეო` / `მუსიკა` / `სტემები` / `აუდიო` (default track names) → `Video` / `Music` / `Stems` / `Audio`.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | DN1 only. Every other object, key and value stays byte-identical. No import. |
| `app/lib/arrangement/groups.ts` | DN2 only. |
| `app/contexts/ArrangementContext.tsx` | DN3 only (2 lines). |
| `app/routes/studio-lab.tsx` | DN4 only (3 lines). l.8 unchanged. |
| `app/lib/arrangement/__tests__/strings.test.ts` | Import specifiers (for example `nextTrackGroupName`, `createArrangement`), plus §3.1 only: the `ჯგუფი` lines, the `studioTrackGroupStrings` plain-string and key lists, the ST13 list and length, ST22, the ST39 count, and the new ST40. |
| The other 9 sweep files (`clip-gain-waveform`, `fader-touch`, `group-volume-db`, `groups.test`, `header-meter-envelope-strings-ui`, `track-group-collapse-ui`, `track-group-mix-ui`, `track-group-mix.test`, `track-groups-ui`) | R3 token replace only. No other edit, no new `it`, and `it` counts stay the same. A Biome-forced rewrap of a changed line is allowed and must be reported. |
| `docs/.../116-studio-v0-header-meter-envelope-strings.md` | l.4 → `Completed (A-ის შემოწმებები მწვანეა რაუნდ 140-ში; C round 140 — PASS, browserVerified; gate 140 — 6ebbf3e)`. In l.76, the sentence about waiting for C round 140 → `C round 140 — PASS (browserVerified).`. Delete the C round 140 TODO line (l.80). Locate the lines by content (`grep -n "C round 140"`). Nothing else changes. |
| **new** `app/lib/arrangement/__tests__/default-track-names-ssr.test.tsx` | DS1–DS2 (§3.3) |
| **new** `docs/implementation/2026/quarter-IV/117-studio-v0-default-names.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections; the status says C round 141 has not run yet. |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Pin rule:** replaced pins are hand-written English literals with the same matcher. No pin imports the module value it checks. In particular, the swept tests write `'Group 1'` literally and do not use `TRACK_GROUP_NAME_PREFIX`.
- **Stop rule:** A stops and reports, without widening scope, if any of these happens:
  - a sweep file's `ჯგუფი` count differs from §0;
  - a non-granted file (outside the R5 list) contains `ჯგუფი` or one of the DN4 names in a way that would fail;
  - a non-granted test fails because of the new names.
- **Edit rule (C-R120-01):** every lasting edit goes through Edit/Write (`replace_all` is allowed for R3). Shell writes are only for temporary mutations, which are restored and sha-verified. A lists every shell write.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (39 → 40 `it`s)
- **Sweep lines** (l.1261–1269 at `6ebbf3e`):
  - the sample names become `'Group 1'` and `'Group 2'`;
  - expected `Group “Group 1” created: მუსიკა, სტემები.` (the member fixture names stay data) and `Group “Group 2” ungrouped.`;
  - l.1269 → `expect(TRACK_GROUP_NAME_PREFIX).toBe('Group');`.
- **`studioTrackGroupStrings` lists:** add `defaultNamePrefix: 'Group'` to its expected plain strings (l.1140 block) and `'defaultNamePrefix'` to its sorted key list (l.1164 block).
- **ST13:** `CONTEXT_REMAINING_GEORGIAN_LINES` keeps **only** the l.3468 error line. The length check at l.1901 becomes `toHaveLength(1)`.
- **ST22:** remove `TRACK_GROUP_PREFIX_LINE` (l.1193) and the prefix exception. `groups.ts` (comments stripped) must have **no** Georgian line at all. Update the `it` title to match (for example `… selection.ts and groups.ts contain no Georgian codepoint`).
- **ST39 (gate-140 #3):** replace `expect(outputs.length).toBe(17)` with a check derived from the objects:
  - the number of outputs is `>=` the number of function-valued keys in `studioClipEnvelopeStrings`, `gh` and `mt` together;
  - every sample list is non-empty.

  The hand-written exact outputs elsewhere stay as they are.
- **ST40 (new, in a new `describe('V-0.4d default names')`):** all expectations are hand-written.
  - `studioTrackGroupStrings.defaultNamePrefix` is `'Group'`.
  - `nextTrackGroupName(createArrangement([{ id: 'a', kind: 'audio', name: 'A' }]))` is `'Group 1'`.
  - In `routes/studio-lab.tsx` with comments stripped, the trimmed Georgian lines are exactly `[` the l.8 meta-title line `]`.
  - The same source contains `name: 'Video'`, `name: 'Music'`, `name: 'Stems'` and `name: 'SFX'`.

### 3.2 Sweep (R3)
The 191 lines of `b-round-140-r141-prefix-lines.txt` change only the token. After the sweep, `grep -rnF 'ჯგუფი' app/lib/arrangement/__tests__ e2e` must print **nothing**. A saves the before and after grep in `a-round-141/`.

### 3.3 New `default-track-names-ssr.test.tsx`
The file starts with `// @vitest-environment node`. Copy the `@remix-run/react` mock and the `renderToString` harness of `ssr-layout-effect.test.tsx`; do not import that file.
- **DS1:** `renderToString(<StudioLabRoute />)` contains four track-name buttons whose `aria-label` starts with `Video — set as the active track`, `Music — set as the active track`, `Stems — set as the active track` and `SFX — set as the active track`. The expectations are hand-written. An optional `, selected` suffix is allowed only if the server HTML really has one.
- **DS2:** the same HTML has no match for `/ჯგუფი \d/`, and no `aria-label` that contains `— set as the active track` also contains `ვიდეო`, `მუსიკა`, `სტემები` or `აუდიო`. A whole-HTML Georgian scan is **not** part of DS2: the detail panel, library and dock still render Georgian on the server (R5; for example the library-preview title `აქტიური ხაზი: ვიდეო …`). That scan belongs to V-0.5 RV-4. The video lane uses the same name button and `activeTrackLabel` format as the audio lanes (Lane l.689–703), so all four labels share one shape.

### 3.4 Forward rule (GATE130-S3)
Each of DN1–DN4 has at least one hand-written literal test:
- DN1/DN2: ST40 and the swept UI tests;
- DN3: ST13;
- DN4: ST40 and DS1/DS2.

A lists the mapping in its report.

### 3.5 Mutations (each turns the named tests red; restore and check by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m77 | `defaultNamePrefix: 'Group'` → `'Grp'` | ST40, the `studioTrackGroupStrings` plain-string check, `track-groups-ui`, `track-group-collapse-ui`, `track-group-mix-ui`, `groups.test` |
| m78 | `groups.ts` l.4 back to the literal `'ჯგუფი'` | ST22, `groups.test`, the swept UI files |
| m79 | `studio-lab.tsx` l.14 `'Music'` → `'მუსიკა'` | ST40, DS1, DS2 |
| m80 | context l.549 `'Audio'` → `'აუდიო'` | ST13 |
| m81 | `nextTrackGroupName` builds `` `${TRACK_GROUP_NAME_PREFIX}${index}` `` (no space) | `groups.test` (l.224/226), ST40 |

## 4. A — checks (speed rules)
- At the start: the frozen list, the 15 start hashes and the start copies are all OK, and `git status --short` is empty.
- Pre-edit greps go to `a-round-141/pre-grep.txt`:
  - `ჯგუფი` in `app/**` and `e2e/**`;
  - `'ვიდეო'|'მუსიკა'|'სტემები'|'აუდიო'` in `app/**` (non-test) and `e2e/**`;
  - any `/group/i`-style or regex-name matcher in the tests.
- `npm run typecheck` and `npm run lint` exit 0. A read-only `npx biome check` on the changed files gives 0 diagnostics.
- `npx vitest run` on these files, saved to `a-round-141/vitest.json`:
  - the 10 sweep files and the new `default-track-names-ssr`;
  - the neighbours `ssr-layout-effect`, `track-volume-db`, `gesture-guard`, `lane-strings-ui`, `clip-strings-ui`, `status-announcement-ui`, `render-budget`, `clip-envelope-ui`, `track-meter-ui`, `meter-ui` and `collection`;
  - every other test file that imports `groups.ts` or `studio-lab` (A greps and lists them).
- Mutations m77–m81 per §3.5.
- The code-reviewer runs, because more than 3 files change. Its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build or e2e (the gate does these).
- At the end:
  - `git status --short` shows exactly the 15 ` M` + 2 `??` granted paths;
  - the frozen list is OK;
  - the protected `git diff 6ebbf3e` is empty;
  - the end sha256 of the changed paths is in `a-round-141/end-sha256.txt`.
- No commit, stash, checkout, install, `--write` or `check:fix`.

## 5. C — rows
Real Playwright Chromium at **1440×900 and 1280×720** on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use `data-testid`s and the new English names. State Snap at the start of each session (default off). Harness notes:
- a **group** fold renders 0 member clips;
- the default demo starts **empty**, and the Master latch trips only at Master +6 dB or with a Clip Gain boost (C round 140; replaces C-R86-OBS);
- the group name button text includes the `▣` glyph.

| Row | Start state → action → expected |
|---|---|
| T141-TARGETED | Run A's named vitest list; the counts equal A's |
| SOURCE-SCOPE | Only granted paths changed. Frozen list OK at start and end. End hashes equal `a-round-141/end-sha256.txt`. Protected diff vs `6ebbf3e` is empty. No source changes during C's phase |
| AN-REVIEW | `diff -u` against `b-round-140/r141-granted-start/`. Expected: the 4 source files change only DN1–DN4; the 9 sweep files change only the `ჯგუფი` token (report any Biome rewrap); strings.test changes only §3.1; doc 116 changes only the named lines; `grep -rnF 'ჯგუფი' app/lib/arrangement/__tests__ e2e` is empty |
| TRACK-NAMES | Fresh load. The track headers show `Video`, `Music`, `Stems` and `SFX`, as visible text and as aria-label `{name} — set as the active track`. Click `Music` → its aria-label gains `, selected`. Add a library sound to Music → the status names `Music` (`… added to the Music track at …`). The Music meter `title` starts `Music · Peak`. No `ვიდეო`/`მუსიკა`/`სტემები` appears anywhere in the workspace outside the R5 surfaces |
| GROUP-DEFAULT | 1. Select Music + Stems, Ctrl+G → status `Group “Group 1” created: Music, Stems.`, name button aria-label `Group 1 — group, selected`, text `Group 1`.<br>2. Select Group 1 + SFX (adjacent), Ctrl+G → `Group 2`; the created status names both members in timeline order (C reports the exact text).<br>3. Ctrl+Shift+G on Group 2 → `Group “Group 2” ungrouped.`.<br>4. Rename Group 1 to `Drums` (F2, Enter) and **keep it**. Select `Drums` + `SFX`, Ctrl+G → the new outer group is **`Group 1`**, not `Group 2`: a renamed group frees its number while it still exists (groups.test l.232).<br>5. Ctrl+Z steps back through these steps, with Undo/Redo titles in English |
| GROUP-MIX-REG | With `Group 1` (Music + Stems, clips placed): Mute aria-label `Mute — Group 1 (group)`; after the click the Undo title is `Undo: Mute — Group 1`. **Real audio (paired, same position, a region where only members sound):** group Mute → output RMS ≥ 20 dB lower; unmute restores it (within 1 dB) |
| GEO-COUNT | At every step, count Georgian in the track headers (text and attributes), group rows, status line, Undo/Redo titles, meters, Master, envelope titles and transport. Expect **0** after these named subtractions (R5): the demo source titles (data, V-0.5), the demo-ready load status (V-0.5), and the detail panel, library, dock and `document.title` (V-0.4e/V-0.5). Track names and `ჯგუფი N` are **no longer** subtractions. List every subtraction |
| LAYOUT | S0/S1/S2 (round-130 harness) against round 140. The track and group name **button boxes** and the M/S/fader boxes must not move, because the names are `flex-1 truncate`; a move >1 px = FAIL. Only text-sized nodes (status line, inner name text spans) may change. The group row is compared against the round-140 stored boxes, which are the same at both viewports: row h 28; fold/name/M/S 24×24 at x 296/322/403/429; name w 79; fader 48×4 at x 455 |
| REG-140 | One sample each: an envelope point add status `Envelope: point added — {t} s · 0.0 dB.`, and the Master Peak label after a reset `Master Peak −∞ dBFS — click to clear` |
| G141-3 (alone, last) | `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?…` → 401. The fake-Bearer 403 check is BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror (the known cart noise is expected) |

Gate rows (C does not claim them): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## 6. Ableton source
Live 12 Reference Manual, B's saved capture `b-round-133/live/arrangement-view.txt`. It is a minified page with the TOC and the Arrangement View chapter; B checked it on 2026-10-24.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Default group name | §18.3 "Group Tracks" | **section title only**; Live's default Group Track name is **not** in the capture | `Group N` with the lowest free number is CZABA's existing rule, now in English; no Live claim | GROUP-DEFAULT |
| Default track names | none captured | **unconfirmed** | Video/Music/Stems/SFX are CZABA's demo-route names (data), not Live defaults | TRACK-NAMES |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- C writes `c-round-141.md` and `c-round-141.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` with subtractions, `measurements`, `invalidRuns`, `notesForB`.
- Evidence goes under `c-round-141/{tools,out,shots}/`. Every run writes a uniquely named output (C-R125-HARNESS-OVERWRITE). C makes no writes under `store/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`. A state that honestly cannot be observed is `inconclusive`, with the reason.
- A writes `a-round-141.md` as it goes. It covers:
  - start checks and the pre-grep;
  - changed files and `it` counts before/after;
  - test results and mutations;
  - the reviewer verdict and Architecture note;
  - shell writes and the end state;
  - deviations and known gaps.

## 8. Outcome, fixed in advance (B at round 142 planning)
| Condition | Round 142 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.4d fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.4d → `c_pass`, then `c_pass_published` after the gate. Round 142 = **V-0.4e**, re-measured first; B decides whether it splits. Its scope: `ArrangementDetailPanel.tsx` (38 lines, incl. the l.53 role word → `group`), `panels.ts` l.8, `clip-gain-multi.ts` l.113 + the `GROUP_REASON` pins, and the `library.ts` kind/folder labels (4). If root's strings-split checkpoint result arrives first, B applies it as its own bounded round before V-0.4e |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Name lookups:** the 3 role-regex files find group buttons by `^{name} — group`, and many tests call `groupName(view, 'ჯგუფი 1')`. If the sweep misses one, that lookup fails. m77/m78 prove the coupling.
- **Numbering:** only the prefix changes. The lowest-free-index rule (`nextTrackGroupName`) is unchanged; m81 and GROUP-DEFAULT check it.
- **Undo labels:** `Mute — {group}`, `Solo — {group}` and `Volume — {group}` come from the context with the group name. They become `… — Group 1` without any context edit.
- **Text change at a data seam:** track names are arrangement data, so any code that compared names to Georgian literals would break. B's grep found none in `app/` outside the route and the context; A's pre-grep confirms.
- **Server rendering:** the route renders on the server. `ssr-layout-effect` is in the neighbour list, and DS1–DS2 also render on the server.
- **Architecture:** the strings-split checkpoint request is still open and does not block. Round-140 addendum: split `strings.test.ts` by feature after V-0.5, and add a shared scan helper.
- **Commit readiness:** after C PASS, root may publish V-0.4d as an interim unit.
