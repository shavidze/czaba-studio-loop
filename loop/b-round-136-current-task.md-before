# CURRENT TASK — Round 136: VISUAL-A V-0.3c — Marker row and marker menu in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 135)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract` with the R6 clarification of round 133:
  - `strings.ts` is a leaf module (it imports nothing), with one object per area;
  - it holds plain strings plus small pure formatters, and no type assertions;
  - formatters take values that are already formatted; a branch that only picks between two texts stays in the caller;
  - existing local names keep their names and get their values from the module.
- **Previous task:** `tasks/round-135.md` (exact copy of the round-135 `current-task.md`, sha256 `c8124336…`). Rationale: `b-round-135.md`. Decision record: **D-29z101** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `70f1e4270028a8b46a734ae9647bbc0db7982244`** (gate 135 published; HEAD). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-135-r136-tree-sha256.txt`, **940 entries** = `git ls-files -co --exclude-standard` (949) minus the 9 existing grants in `b-round-135-r136-grants.txt` (11 lines; the last 2 are new files). `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 9 existing grants:** `b-round-135-r136-granted-start-sha256.txt`. **Start copies:** `b-round-135/r136-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there at planning). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z101)
- **Round 135: C PASS.** `browserVerified` = `realVerified` = true, every row ran at 1440 and 1280, effects unchanged, GEO-COUNT 0 (46 + 45 steps). Gate 135 published `70f1e42` (verify OK 160 files / 2444 tests, build OK, review 9/10). **V-0.3b is done.** C's only new bug, **C-R135-01** (Low: brace hint `(Ctrl+L)` vs Transport `(Ctrl/Cmd+L)`), goes to `deferred_low_polish`. Its pin is in `navigation-strings-ui`, outside this surface, so it is not folded in.
- **`tasks/round-135.md` §8 fixed this step:** after a PASS comes **V-0.3c** (MarkerRow + MarkerMenu), re-measured first. The strings-split checkpoint (`b-round-130-checkpoint-request.md` (e)–(g)) still has no root result (checked in `gates/`, the loop folder and `store/.claude/references/`). The gate-134 and gate-135 reviewers and A's reviewer all advise running it **after V-0.3d**. B repeats that request in `b-round-135.md`. It does not block this round.
- **Not due:** the regression round (`regression-last.json` = 2026-10-24, round 122; due on or after 2026-10-27). **No Critical/High/Medium finding is open.** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
- **B's re-measurement at `70f1e42`:**
  - Source: MarkerRow **16** Georgian lines (l.54, 55, 219, 241, 299, 314, 323, 342, 352, 367, 384, 397, 692, 708, 724, 831) and MarkerMenu **4** (l.13, 14, 15, 124) = **20**. MarkerRow also has **2 non-Georgian quote lines** (l.775 flag aria-label `Marker «…» — …`, l.780 flag title `«…» — …`). `markers.ts` has no Georgian.
  - Test pins: **23 lines in 4 files**:
    - `markers-ui`: l.277, 290, 319, 343, 370, 417, 426, 437, 443, 516;
    - `marker-edge-nav-ui`: l.371, 375, 398;
    - `markers-move-ui`: l.181, 318, 453, 480, 481, 482;
    - `status-announcement-ui`: l.404, 405, 678 (selector `startsWith('Marker «Hit»')`), 687.
  - **0 in `e2e/`.** History labels (`Add Marker`, `Rename Marker`, `Delete Marker`, `Move Marker`) and the header aria-labels (`Add marker (M)`, `Previous marker (Ctrl+←)`, `Next marker (Ctrl+→)`) are already English and stay unchanged.
  - False matches, **not** V-0.3c (do not touch): Georgian **fixture data** in test literals (marker names `აქ შედის მუსიკა`, `რეკლამა`, `ბლური`, `ფოკუსი`, …; track names `ვიდეო`, `მუსიკა`, `სტემები`). They are user/track data, not UI copy, so they stay inside the new English literals. Also untouched: `track-groups-ui` l.613/627 and `strings.test` ST25 l.1336–1337 (group rename, V-0.3d), the `[title^="drag = დროის მონიშვნა"]` lane selectors (V-0.4) and the `marker-snap` clip labels (V-0.4).
- **Ruling D-29z101 R1: one new object, `studioMarkerStrings`.** D-29z100 R3 ruled "no new object" because every V-0.3b text had an existing area object. Markers have no area object, and the module contract says one object per area. The checkpoint rationale is unchanged: the import path `~/lib/arrangement/strings` is the same, the module stays a leaf, and any later split keeps that path.
- **Ruling D-29z101 R2: «» → “” on the whole marker surface.** The V-0.3c backlog entry already lists this. Every other object uses “” (`studioLibraryStrings`, `studioVideoStrings`, `studioTrackGroupStrings.quoted`). It covers the 2 non-Georgian flag lines (l.775, l.780) and the selector pin `status-announcement-ui` l.678. These are explicitly granted.
- **Ruling D-29z101 R3: one notation per control.** The prev/next titles use `Ctrl+←` / `Ctrl+→`, the same notation as their existing English aria-labels and `aria-keyshortcuts` (C-R135-01 shape avoided).
- **Ruling D-29z101 R4: shared sentence with the group rename.** MarkerRow l.342 (`სახელი ცარიელია — დარჩა «…»`) has the same Georgian as StudioWorkspace l.954 (group rename, V-0.3d, GATE133-GROUP-RENAME). The marker version becomes English now. **Forward constraint (recorded in the V-0.3d stage entry):** the V-0.3d group formatter must emit the same English shape as MK12. StudioWorkspace is frozen this round and ST25 stays at 23.
- **Folded in (owned doc, low cost):** **GATE135-DOC111-STATUS** (gate-135 reviewer finding 1). Change doc 111 l.4, l.146 and l.150 only. This is the same pattern as doc 110 last round.

## 1. What changes (user-visible)
**Text and quote marks only.** None of these change: any handler, condition, key binding (M, F2, Delete, ← →, Ctrl+← / Ctrl+→, Shift+F10, Esc, Enter), the duplicate-at-time rule, the key-repeat de-duplication (`status !== message`), focus hand-off, menu order, the history labels, the default name `Marker N`, or any class name.

### 1.1 The English map (exact text; A may not reword it. If a line seems wrong, A reports it and B rules)
Line numbers are at `70f1e42`. `{name}` is the marker name as passed today. `{time}` is the value the caller already formats today (`formatArrangementTime(...)` or the local `time`).

| # | Where today | `studioMarkerStrings.` key (A may rename the key, not the text) | English |
|---|---|---|---|
| MK1 | MarkerMenu l.13 | `menuRename` | `Rename (F2)` |
| MK2 | MarkerMenu l.14 | `menuPlay` | `Play from here` |
| MK3 | MarkerMenu l.15 | `menuDelete` | `Delete (Delete)` |
| MK4 | MarkerMenu l.124 menu `aria-label` | `menuLabel(name)` | `Marker “{name}”` |
| MK5 | MarkerRow l.53–54 `MARKER_FLAG_HINT` | `flagHint` | `Click: jump here · Double-click: play from here · Drag or ← →: move · F2: rename · Delete: delete · Right-click or Shift+F10: menu` |
| MK6 | MarkerRow l.55 `MARKER_AT_TIME_START_MESSAGE` | `atTimeStart` | `The marker is at the start of the timeline.` |
| MK7 | MarkerRow l.219, l.314, l.384 | `existsAtTime(name)` | `A marker already exists at this time: “{name}”` (no final period, as today) |
| MK8 | MarkerRow l.241, `direction === 1` | `noneAfter` | `No more markers after the playhead` |
| MK9 | MarkerRow l.241, else | `noneBefore` | `No more markers before the playhead` |
| MK10 | MarkerRow l.299 | `notAdded` | `Marker not added` |
| MK11 | MarkerRow l.323 | `added({ name, time })` | `Marker “{name}” added at {time}.` |
| MK12 | MarkerRow l.342 | `renameEmpty(name)` | `The name is empty — “{name}” is kept` |
| MK13 | MarkerRow l.352 | `renamed(name)` | `Marker name: “{name}”.` |
| MK14 | MarkerRow l.367 | `deleted(name)` | `Marker “{name}” deleted.` |
| MK15 | MarkerRow l.397 | `moved({ name, time })` | `Marker “{name}” moved to {time}.` |
| MK16 | MarkerRow l.692 add `title` | `addTitle` | `Add a marker at the playhead or at the start of the time selection (M)` |
| MK17 | MarkerRow l.708 prev `title` | `previousTitle` | `Jump to the previous marker (Ctrl+←)` |
| MK18 | MarkerRow l.724 next `title` | `nextTitle` | `Jump to the next marker (Ctrl+→)` |
| MK19 | MarkerRow l.831 name field `aria-label` | `nameFieldLabel` | `Marker name` |
| MK20 | MarkerRow l.775 flag `aria-label` (quotes only) | `flagLabel({ name, time })` | `Marker “{name}” — {time}` |
| MK21 | MarkerRow l.780 flag `title`, first line (quotes only) | `flagHeading({ name, time })` | `“{name}” — {time}` |

- **Caller shapes (the only non-literal edits allowed):**
  - MarkerMenu l.12–16: `MARKER_MENU_ITEMS` keeps its name, type, order and actions. Only the three `label` values change to `studioMarkerStrings.menuRename` / `menuPlay` / `menuDelete`.
  - MarkerRow l.241: `direction === 1 ? studioMarkerStrings.noneAfter : studioMarkerStrings.noneBefore`. This is the same condition and pick order.
  - MarkerRow l.780: ``title={`${studioMarkerStrings.flagHeading({ name: marker.name, time })}\n${MARKER_FLAG_HINT}`}``. The `\n` and the hint stay in the caller.
  - Local names stay and take module values: `MARKER_FLAG_HINT`, `MARKER_AT_TIME_START_MESSAGE`, `MARKER_MENU_ITEMS`. The l.384 `const message = …` stays a local `const`, so the `status !== message` repeat check is unchanged.
  - Biome may re-wrap the edited `setStatus(...)` calls. This is not a deviation.
- **Facts that must survive (dropping one is a Medium):**
  - MK7: the name of the **existing** marker, and that it is at this time.
  - MK8/MK9: two directions; the caller picks exactly as today.
  - MK10 vs MK11: cancel versus add; MK11 includes the name and the time.
  - MK12: the old name is kept.
  - MK15: the name and the new time.
  - MK16: both places (playhead, start of the time selection) and the key M.
  - MK17/MK18: each direction and its key.
  - MK5: all six gestures and keys.
  - MK3: the key Delete.
  - MK1: F2.
- **Imports:** MarkerRow and MarkerMenu import `studioMarkerStrings` from `~/lib/arrangement/strings`. `strings.ts` still imports nothing.
- **Unchanged this round** (they stay Georgian; C subtracts them by name):
  - (a) the 23 StudioWorkspace lines in `b-round-134/r135-studioworkspace-remaining-georgian.txt` → V-0.3d. This includes the group rename statuses, which share the MK12 sentence (R4).
  - (b) lanes, clips, detail panel, track names → V-0.4.
  - (c) library and video dock → V-0.5.
  - (d) marker names typed by the user (data).
- **Glossary additions** (doc 112 and the backlog glossary):

| Georgian | English | Note |
|---|---|---|
| მარკერი | marker | Live: "locator", §6.4. CZABA keeps "marker", already used in the English aria-labels. Deliberate difference |
| სახელის შეცვლა | Rename | Live §6.4 "Rename" |
| დაკვრა აქედან | Play from here | — |
| გადასვლა | jump | Live §6.4 "jump between triggered locators" |
| გადათრევა | drag | — |
| მარჯვენა ღილაკი | right-click | — |
| მენიუ | menu | — |
| დროის დასაწყისი | start of the timeline | Same as `nudgeAtTimeStart` |
| მონიშვნის დასაწყისი | start of the time selection | Live §6.4 |
| სახელი ცარიელია | The name is empty | — |

## 2. A — files you own (everything else is frozen)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Add **one** new object `studioMarkerStrings` with MK1–MK21. Existing objects are byte-identical. Still no import. A may add a small local interface for `{ name, time }` |
| `app/components/arrangement/ArrangementMarkerMenu.tsx` | **Only:** one import, l.13–15 labels, l.124 aria-label |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | **Only:** one import (a new line or a name added to an existing `~/lib/arrangement/strings` import), l.53–55, 219, 241, 299, 314, 323, 342, 352, 367, 384, 397, 692, 708, 724, 775, 780, 831 |
| `app/lib/arrangement/__tests__/strings.test.ts` | **Only:** the import of `studioMarkerStrings`, and a new `describe('V-0.3c marker strings')` with ST28–ST30 (§3.1). ST1–ST27 unchanged; ST25 stays 23 |
| `app/lib/arrangement/__tests__/markers-ui.test.tsx` | Only l.277, 290, 319, 343, 370, 417, 426, 437, 443, 516 (§3.2) |
| `app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx` | Only l.371, 375, 398 |
| `app/lib/arrangement/__tests__/markers-move-ui.test.tsx` | Only l.181 (the constant), 318, 453, 480–482 |
| `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | Only l.404, 405 (the constants), 678 (selector → `'Marker “Hit”'`), 687 |
| **new** `app/lib/arrangement/__tests__/marker-strings-ui.test.tsx` | §3.3 |
| `docs/implementation/2026/quarter-IV/111-studio-v0-transport-navigation-strings.md` | l.4 → `**სტატუსი:** Completed (A-ის შემოწმებები მწვანეა რაუნდ 135-ში; C round 135 — PASS, browserVerified; gate 135 — 70f1e42)`. l.146 → `- ბრაუზერის შემოწმება (TRANSPORT, FOLLOW, ZOOM-FIT, RULER-OVERVIEW, LOOP, TEMPO, GEO-COUNT, LAYOUT): C round 135 — PASS, browserVerified (c-round-135.json).` Delete l.150 (`- C round 135: …`). Nothing else |
| **new** `docs/implementation/2026/quarter-IV/112-studio-v0-marker-strings.md` | Sections from TEMPLATE.md, in Georgian: the MK map; rulings R1–R4; the re-measurement; facts that must survive; glossary; tests and mutations. Status Completed only after §4 is green, naming C round 136 as still to come |

- **Test rules (as in rounds 129–135):** every replaced pin is a **hand-written English literal** with the same matcher (GATE130-S3). Where a file has a shared constant (`MARKER_AT_START_STATUS`, `MARKER_START_TEXT`, `MARKER_NEXT_NONE_TEXT`), change it once. No `it` is added, removed or renamed outside the new `describe` in `strings.test.ts` and the new test file. Line numbers are baseline positions; find each line by its text.
- **Negative pins (must keep biting):**
  - `markers-ui` l.290 and l.343: `not.toContain('უკვე არის')` → `not.toContain('already exists')`.
  - `marker-edge-nav-ui` l.398: `not.toContain('მარკერი აღარ არის')` → `not.toContain('No more markers')`. This is the common part of MK8 and MK9.
  - m40/m41 (§3.4) prove that both negative pins still bite.
- **Pre-edit grep (A records it):**
  - For each MK row, grep the old Georgian text in `app/**` and `e2e/**`.
  - Grep `«` in `app/**` and `e2e/**`.
  - Grep the test files for regex or partial forms (`name: /`, `getByTitle(`, `getByLabelText(`, `toContain(`, `startsWith(`) with Georgian or `«` near `marker|Marker|flag|menu`.
  - B found exactly the pins in §0. Any other pin of an MK text is a **stop-rule** case.
- **Stop rule:** stop and report (B rules) if:
  - a test outside §2 asserts an old text or turns red;
  - a change needs a frozen file, or a non-string line beyond the §1.1 caller shapes;
  - an import cycle or an `undefined` label appears;
  - the new UI test cannot reach a state (report which one; do not fake it).
- **Checkpoint rule:** if your context grows large, stop at a clean point (one file fully edited and its vitest green). Write `a-round-136-checkpoint.md` (files done with sha256, files left, next step) and say STATUS: RESTART-NEEDED. Never revert finished files.
- **Expected end state:** `git status` shows 9 ` M` + 2 `??` (the new test file and doc 112) and no other path. The frozen list is OK at the start and at the end. Report the end sha256 of the 11 paths.
- **Protected (unchanged; `git diff 70f1e42` on them is empty):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, and everything in `global_forbidden_files` / `global_forbidden_actions` of `backlog.json`.
- **Forbidden actions:** commit, push, stash, checkout, reset, deploy, dev-server restart, `npm install`, `npm run check:fix` / any `--write`, `npm run format`.
- **Edit rule (C-R120-01):** lasting edits only with Edit/Write. Shell writes only for temporary mutations, restored and checked by sha256. List every shell write.
- **Before editing, read:**
  - `.claude/primitives-map.json`;
  - `AGENT_DISCOVERABLE_CODE.md` and `FORWARDREF_COMPONENT.md` (components change);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `.claude/prompts/new-test.md` (new test file);
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`.
- **Project rules:** TypeScript strict, no `any`, no `@ts-ignore`, no `as T` (no new `as const`), semicolons, no code comments.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (27 → 30 `it`s)
- **ST28:** every plain-string property of `studioMarkerStrings` equals its exact §1.1 literal (`toEqual` on a hand-written expected map). The plain key list equals the expected map's keys.
- **ST29:** each formatter returns the exact English for Latin inputs (`toBe`). The formatter key list equals the sample keys:
  - `menuLabel('Intro')`, `existsAtTime('Drop')`, `renameEmpty('Intro')`, `renamed('Intro')`, `deleted('Intro')`;
  - `added({ name: 'Intro', time: '00:05.000' })`, `moved({ name: 'Intro', time: '00:07.000' })`;
  - `flagLabel({ name: 'Hit', time: '00:00.500' })`, `flagHeading({ name: 'Hit', time: '00:00.500' })`.
- **ST30:** no value or formatter output of `studioMarkerStrings` contains a Georgian codepoint or `«`/`»`. A per-file scan (comments stripped) shows that `ArrangementMarkerRow.tsx` and `ArrangementMarkerMenu.tsx` contain no Georgian codepoint (the widened pattern of ST27) and no `«`/`»`.

### 3.2 Pin replacements (hand-written; fixture names stay as they are)
| File:line | New literal |
|---|---|
| `markers-ui` l.277 | `'Marker name'` |
| `markers-ui` l.290, l.343 | `not.toContain('already exists')` |
| `markers-ui` l.319 | `'Marker not added'` |
| `markers-ui` l.370 | `'A marker already exists at this time: “აქ შედის მუსიკა”'` |
| `markers-ui` l.417, l.437 | `'No more markers after the playhead'` |
| `markers-ui` l.426, l.443 | `'No more markers before the playhead'` |
| `markers-ui` l.516 | `'The name is empty — “რეკლამა” is kept'` |
| `marker-edge-nav-ui` l.371 / l.375 | `'No more markers after the playhead'` / `'No more markers before the playhead'` (matching today's Georgian direction word by word: `წინ` → after, `უკან` → before) |
| `marker-edge-nav-ui` l.398 | `not.toContain('No more markers')` |
| `markers-move-ui` l.181 | `'The marker is at the start of the timeline.'` |
| `markers-move-ui` l.318 | `'Marker “Intro” moved to 00:07.000.'` |
| `markers-move-ui` l.453 | `'A marker already exists at this time: “Drop”'` |
| `markers-move-ui` l.480–482 | `'Rename (F2)'`, `'Play from here'`, `'Delete (Delete)'` |
| `status-announcement-ui` l.404 / l.405 | `'The marker is at the start of the timeline.'` / `'No more markers after the playhead'` |
| `status-announcement-ui` l.678 | `startsWith('Marker “Hit”')` |
| `status-announcement-ui` l.687 | `'A marker already exists at this time: “Intro”'` |

### 3.3 New `marker-strings-ui.test.tsx` (renders `StudioWorkspace` in jsdom with the mount helpers of `markers-ui.test.tsx`)
Required behavioural assertions. Each is a hand-written English literal (`toBe`), read from the real DOM title, aria-label or text and from the live status region:
- **MS1 (titles and labels):**
  - the add, previous and next button titles are MK16–MK18, and their aria-labels are still `Add marker (M)`, `Previous marker (Ctrl+←)` and `Next marker (Ctrl+→)`;
  - after M, the name field aria-label is MK19;
  - for a marker `Hit` at 0.5 s, the flag aria-label is `Marker “Hit” — 00:00.500` and its title is exactly `“Hit” — 00:00.500\n` + the MK5 text (use the exact time format the flag shows today).
- **MS2 (statuses):**
  - add with Enter → MK11 with the name and the formatted time;
  - add then Esc → MK10;
  - F2, type a new name, Enter → MK13;
  - F2, clear the field, Enter → MK12 with the old name;
  - Delete on a focused flag → MK14;
  - ArrowRight on a flag → MK15;
  - ArrowLeft on a flag at 0 → MK6.
- **MS3 (menu):** right-click a flag and Shift+F10 on a flag. In both cases the menu `aria-label` is `Marker “{name}”` and the item texts are MK1–MK3 in order.

### 3.4 Forward rule (GATE130-S3)
After §3.2 and §3.3, every MK key has at least one hand-written UI literal. If one does not, A reports it.

### 3.5 Mutations (each turns the named tests red; restore and check by sha256)
| Mutation | Change | Must turn red |
|---|---|---|
| **m38** | `existsAtTime` drops the name | ST29, `markers-ui` (l.370 `it`), `markers-move-ui` (l.453 `it`), `status-announcement-ui` (l.687 `it`) |
| **m39** | MarkerRow swaps the `direction === 1` picks | `markers-ui`, `marker-edge-nav-ui`, `status-announcement-ui` |
| **m40** | The l.323 add status becomes `existsAtTime(result.marker.name)` | `markers-ui` (the l.290 `it`), MS2 |
| **m41** | `stepMarker` also calls `setStatus(studioMarkerStrings.noneAfter)` on the success path | `marker-edge-nav-ui` (the l.398 `it`; `pressStep` is Ctrl+Arrow, which enters `stepMarker`). If the l.398 path does not reach the success branch, A records why; this is not a stop, and m39 still proves the fragment's meaning |
| **m42** | `flagLabel` uses `«»` | `status-announcement-ui` (l.678 `it`), MS1, ST30 |
| **m43** | MarkerMenu swaps the `menuPlay` and `menuDelete` labels | `markers-move-ui` (l.480 `it`), MS3 |
| **m44** | `MARKER_FLAG_HINT` back to the Georgian | ST30, MS1 |

## 4. A — checks (speed rules)
- `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the 9 changed or new code/test files.
- `npx vitest run` on the list below, all green. Name the exact list and counts (C runs the same list):
  - **granted/new:** `strings`, `markers-ui`, `marker-edge-nav-ui`, `markers-move-ui`, `status-announcement-ui`, `marker-strings-ui`;
  - **neighbours:** `markers`, `marker-snap`, `marker-time-snap`, `marker-time-snap-ui`, `track-groups-ui`, `navigation-strings-ui`, `edge-navigation`, `self-disabling-focus`, `pending-status`, `render-budget`.
  - If a name does not exist, report it and do not invent one.
- No full suite and no `npm run verify` (the gate runs them). The **code-reviewer is required** (11 paths); pass its Architecture note to B.
- **Report `a-round-136.md`:**
  - start HEAD, frozen OK, and the 9 start hashes;
  - the pre-edit grep;
  - per-file `diff -u` against `b-round-135/r136-granted-start/`, saved as `a-round-136/granted.diff`;
  - `it` counts before and after, per file;
  - m38–m44;
  - typecheck and lint;
  - the reviewer verdict and Architecture note;
  - every shell write;
  - end `git status`, frozen OK, and the 11 end hashes;
  - deviations.

## 5. C — rows
Real Playwright Chromium, a fresh context per session, **1440×900 and 1280×720**, `http://127.0.0.1:5173/studio-lab`.
- Reuse `c-round-135/tools/` and `c-round-134/tools/` (status reading, MutationObserver, GEO count, layout compare).
- **Find controls by `data-testid`** (`arrangement-marker-add`, `arrangement-marker-prev`, `arrangement-marker-next`, `arrangement-marker`, `arrangement-marker-name-input`), role and position. **Never find them by Georgian text or by `Marker «`** (the quotes change).
- State the Snap state (default **off**) and every precondition in each run record.
- **Invalid runs:** ENV-FIRST-LOAD — discard one crashed first load and record it under `invalidRuns`. At most 2 replacement attempts per row, only for environment-invalid runs. Use a unique evidence file per run. Open every screenshot with Read and describe it.

| ID | Action | Expected (PASS) |
|---|---|---|
| **T136-TARGETED** | A's exact §4 vitest list | All green; counts equal A's |
| **SOURCE-SCOPE** | `git status`; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-135-r136-tree-sha256.txt` (from `store/`); protected `git diff 70f1e42` | 9 ` M` + 2 `??`; frozen OK; protected unchanged; no source change during C's phase |
| **AN-REVIEW** | `diff -u` of each grant against `b-round-135/r136-granted-start/`; read the new test and doc 112 | See the checklist after this table |
| **MARKER-HEADER** (both) | Fresh project. Read title and aria-label of add, previous and next | MK16–MK18 titles; aria-labels unchanged |
| **MARKER-ADD** (both) | Precondition for (a)–(c): **no time range** (fresh project, or clear it by an empty lane click as in round 135 `transportNoneState`, and confirm no range). (a) playhead at 3 s, `+` → read the field aria-label, type `Intro`, Enter. (b) playhead still at 3 s, M → duplicate. (c) playhead at 5 s, M, Esc. (d) make a time range starting at 8 s, M, Enter (default name) | (a) MK19 then `Marker “Intro” added at 00:03.000.`; a flag at 3 s with aria-label `Marker “Intro” — 00:03.000` and title `“Intro” — 00:03.000` + newline + MK5. (b) `A marker already exists at this time: “Intro”`, no new flag. (c) MK10, no new flag. (d) a flag at the **range start** 8 s named `Marker N`, with status MK11 (M targets the range start whenever a range exists). Undo removes each added marker |
| **MARKER-EDIT** (both) | No time range; a marker `Intro` at 3 s (add it first in this session) plus one neighbour flag. On `Intro`: F2, type `Drop`, Enter; F2, clear, Enter; Delete | `Marker name: “Drop”.`; `The name is empty — “Drop” is kept` (name unchanged); `Marker “Drop” deleted.` (flag gone, focus moves to the neighbour flag or to `+`). Undo restores each |
| **MARKER-MOVE** (both) | No time range. Flags at 1 s and 3 s. Focus the 1 s flag: ArrowRight; drag it to 3 s; ArrowLeft repeatedly until 0, then hold ArrowLeft | `Marker “…” moved to 00:01.100.`; the drag onto 3 s → `A marker already exists at this time: “…”` with the flag back at its place; at 0 → MK6, announced **once** while the key is held (MutationObserver) |
| **MARKER-NAV** (both) | Playhead before the first flag: previous (button and Ctrl+←); playhead after the last flag: next (button and Ctrl+→); then previous/next between flags | `No more markers before the playhead` / `No more markers after the playhead`; between flags the playhead jumps to the flag and no edge status appears |
| **MARKER-MENU** (both) | Right-click a flag; Esc; Shift+F10 on a focused flag; choose each item in turn (on fresh flags) | Menu aria-label `Marker “{name}”`; items `Rename (F2)`, `Play from here`, `Delete (Delete)` in this order. Rename opens the name field, Play from here starts playback at the flag, Delete deletes with MK14 |
| **GEO-COUNT** (both) | After each row step | Georgian count = 0 and `«`/`»` count = 0 on the marker surface (header button titles and labels, flags' aria-label and title, the name field, the menu label and items) and in the status region for every MK status. Subtract by name and list: user-typed marker names, the 23 StudioWorkspace lines when shown, the load-time demo-ready status, frozen clip/lane statuses (V-0.4), track names, and any other item C finds |
| **LAYOUT** (both) | S0/S1 boxes against `c-round-125/out/bbox-baseline-*.json`; the marker row with 2 flags; the open menu (`min-w-40 whitespace-nowrap`) | Every box outside the changed text nodes is within 1 px. A flag label width may change with the text only where the label is the name (unchanged here). The menu may change width with its item text (RV-1 V-0 text-width exception); it must stay inside the viewport at both sizes. A new overflow or a clipped menu item is a **Low** |
| **REG-135** (1440, short) | Read the Transport Follow title | `Follow: the view follows the playback position` |
| **G136-3** (alone, last) | `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav` | Workspace + demo badge; the product route shows "Sign in required", no workspace, 0 `audio[src]`; the token API returns **401**; fake-Bearer 403 is **BLOCKED (backend unavailable in cloud)** |
| **PX-NET / REG-HYD** | every session | 0 requests to `/api/studio-token` (outside G136-3), `/api/recording-*`, `/api/download` or the R2 host; 0 `Authorization` headers; 0 hydration errors; 0 `pageerror` (the known cloud cart noise is not reported) |

**AN-REVIEW checklist:**
- `strings.ts`: only the new `studioMarkerStrings` object; the other objects are byte-identical; no import.
- Components: only the import and the §2 lines, in the §1.1 caller shapes.
- Tests: §3.2 literals with the same matcher; ST28–ST30; the new file; no `skip`, `only` or `todo`.
- Meaning check: MK1–MK21 side by side with the Georgian (the §1.1 facts list).
- Every shell write is listed.

- **Gate rows (C does not claim them):** full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Severity guide:**
  - **Medium:** any behaviour change (add, rename, delete, move, jump, menu action, keys, focus, repeat de-duplication); a wrong or fact-dropping message (§1.1 facts list); a weakened, removed or skipped test; a non-string hunk beyond the §1.1 caller shapes; any change to the 23 StudioWorkspace lines.
  - **Low:** wording or style; a new overflow or clip caused by the English text.

## 6. Ableton source
Sources (read as data):
- Live 12 Reference Manual, Arrangement View, §6.4 "Launching the Arrangement with Locators", `https://www.ableton.com/en/live-manual/12/arrangement-view/`. Fetched by B on 2026-10-24: `b-round-133/live/arrangement-view.txt`, sha256 `2b9a3007…`. B re-read §6.4 at this planning.
- Shortcut capture `b-round-71/ableton-shortcuts-20261021.txt` (sha256 `2097004e…`).

| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Add a marker | §6.4: "If you use the Set Locator button while transport is not running, a locator will be added at the insert marker location or at the start of the time selection" | Confirmed | Same two places (MK16). Live calls it a **locator**; CZABA keeps **marker**, as in its English aria-labels. This is a deliberate difference | MARKER-ADD |
| Play from a marker | §6.4: "If the transport is stopped, double-clicking on a locator will select it and start playback from that point" | Confirmed | Double-click and the menu item "Play from here" (MK2, MK5) | MARKER-MENU |
| Move | §6.4: "Selected locators can be moved by clicking and dragging or by using the arrow keys" | Confirmed | Same gestures. CZABA steps 0.1 s with Snap off and refuses a time that is already taken (MK7). The refusal is a CZABA rule, not confirmed in Live | MARKER-MOVE |
| Rename | §6.4: "rename selected locators using the Rename option in the Edit menu or the shortcut Ctrl R (Win) / Cmd R (Mac)" | Confirmed | Word "Rename" is the same. The key is **F2**: a deliberate difference | MARKER-EDIT |
| Delete | §6.4: "To delete a locator, use the Delete key, the Delete Locator option in the Create menu, or the Delete Locator button" | Confirmed | Delete key and the menu item (MK3) | MARKER-EDIT |
| Previous / next | §6.4: "The Previous and Next Locator buttons launch playback for locators … quantized based on the global launch quantization value" | Confirmed | CZABA buttons and Ctrl+← / Ctrl+→ move the playhead with no launch quantization. This is a deliberate difference; the Ctrl+arrow keys are a CZABA choice | MARKER-NAV |
| Context menu | §6.4 mentions "the locator's context menu" (Edit Info Text, Loop to Next Locator) | Partly confirmed | The CZABA menu has 3 items. Shift+F10 is an OS context-menu convention, not a Live claim | MARKER-MENU |

C rates "CZABA requirement met" and "Ableton correspondence" separately. Only text changes; no new Live behaviour is claimed.

## 7. Evidence and reporting
- C writes `c-round-136.md` and `c-round-136.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` (with the subtracted items), `invalidRuns`, `notesForB`. Evidence goes under `c-round-136/{tools,out,shots}/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`. Gestures that Chromium truly cannot reach go under `inconclusive`, with the reason. C makes no `store/` writes.

## 8. Outcome, fixed in advance (B at round 137 planning)
| Condition | Round 137 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.3c fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.3c → `c_pass`, then `c_pass_published` after the gate. Round 137 = **V-0.3d** (the 23 StudioWorkspace lines + `waveform-zoom.ts`; it removes the ST25 ratchet for a per-file scan; group rename uses the MK12 shape, R4), re-measured first and split if it is larger than one round. If root's strings-split checkpoint result exists, B applies it first (an approved split is its own bounded round with behaviour-preserving tests) |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **C harnesses** that find flags by `Marker «` or buttons by Georgian titles (e.g. older `c-round-10x/tools/` marker scripts) will not match. Use the test ids.
- **Repeat de-duplication:** MK6 and MK7 are compared with `status !== message` during key repeat. They must stay stable strings or deterministic formatter outputs. MARKER-MOVE checks "announced once".
- **Width:** the menu items are `whitespace-nowrap` in a `min-w-40` box; `Delete (Delete)` and `Play from here` are short. Flag labels show the user's name, so they are unchanged.
- **Mixed for one round (accepted, named):** the group rename statuses in StudioWorkspace (same sentence as MK12) stay Georgian until V-0.3d.
- **Architecture:** the strings-split checkpoint (addenda e–g, re-asked as (h) in `b-round-134.md` and again in `b-round-135.md`) is still unanswered and non-blocking. Every reviewer suggests running it after V-0.3d.
- **Commit readiness:** after C PASS, root may publish V-0.3c as an interim unit.
