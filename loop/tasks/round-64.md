# CURRENT TASK — Round 64: SRW-14 stage 4c-2 — a library drop snaps its ghost and its start to clip edges (D-29z29). C first runs every round-63 browser row that the environment blocked (C-R62-01 browser half, Alt-enable for groups, regressions, G63-3).

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-19
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap; Loop v2 2026-10-19.
- **Decision record:** **D-29z29** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-63.md`.
- **Round size:** one owner (A), **one feature stage** (4c-2) in one component function plus one test file. `grid.ts` and `ArrangementClip.tsx` are **frozen**. C additionally runs the round-63 browser rows; those need no code.
- **Why now:** C round 63 was **BLOCKED (environment)** with `browserVerified: false`. Every offline item passed and C found no bug. C said the code needs no re-implementation, only its browser half. The servers have been down for rounds 62–63, and an environment problem that is not security or data loss does not stop an independent feature (2026-10-09 rule). So 4c-2 proceeds, and the round-63 browser rows are mandatory C rows run **first**.

> **Servers.** B check (2026-10-19 11:38 +04, `b-round-63/gates.txt`): `/studio-lab` **000**, `:5199/api/products` **000**, no listener on either port. Root is asked (§6.1) to start both before A and keep them up through C.
> - Check both servers at the start of A and of C and record the result. Agents never start or stop servers.
> - `/studio-lab` needs no backend for §4.6/§4.7 (only the root-allowed `GET /api/cart`).
>   - **If only the backend is down:** run §4.6/§4.7 and record that; G64-3's token rows are "not run (environment)".
>   - **If `:5173` is down:** write "not run (environment)" for every browser item. The round is then BLOCKED again with `browserVerified: false`; do not mark any browser row PASS.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every drag (clip drags **and HTML5 library drags**), Ctrl-click selection, held press and wheel uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
> - **ENV-EXT-LOAD-HANG:** if Google Fonts or GTM requests hang, wait for `domcontentloaded`, then the workspace selector, then 4 s, and record that you did. Setup only.
> - **INFO-R62-GEPLAY-UNDO:** record the Undo title before every Ctrl+Z.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Do not export `MSYS_NO_PATHCONV=1` for these calls.
> **npx:** do not run `npx <pkg>` for a package that is not in `node_modules` (C-R63-NPX-CACHE). For TypeScript scratch scripts use `node --experimental-strip-types` (Node 22).

## Why this round

**Round 63 result** (`c-round-63.md`, `c-round-63.json`): **BLOCKED (environment), `browserVerified: false`, no bugs.**
- **Offline PASS:** G63-2 (case A, 32 lines; frozen 420; protected 4/4); R63-S; R63-U (red run 3 failed / 52 passed; mutations a–g, r62 a/f/h and p killed; n survives as expected, whole-ms anchors); G63-1 (tsc 0; **89 / 1574**; build; Biome 5/218/1; verify rc 0 on attempt 1).
- **Not run (environment):** every §4.6 row and G63-3. `:5173` and `:5199` were 000 at 11:20, 11:23 and 11:28.
- **Closed by C unit evidence (test-only items):** INFO-R62-EDGE-TOL (CE11, mutation b), A-R62-REVIEW-R5-POSITIVE-LANE (CG8, mutation e; already browser-positive by GE-CROSS in round 62).
- **Still open (browser half):** C-R62-01 (GE-OOB-STATUS), C-R62-ALT-ENABLE-GROUP-GAP (GE-ALT-ENABLE).
- **Ruled by B (D-29z29):** A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE is a known Low limitation of D-29z28. It is not scheduled; CG7, GE-OOB-STATUS and R63-T keep 8 (see `b-round-63.md` §3).

**Stage 4c-2 (planned since D-29z27, moved by D-29z28):** a library drop today snaps only to the grid (`ArrangementLane.libraryDropStart` → `resolveGridTime`). A clip moved by hand also snaps to the edges of other clips (stage 4a). The library drop must follow the same rule, so a sound dragged from the library can butt the clip next to it.

## Baseline

Measured by B on 2026-10-19 11:38 +04 (`b-round-63/gates.txt`, `b-round-63/status-start.txt`).

**The content baseline decides; HEAD may differ.** Root may publish pending units (`cb12805` = rounds 50–58; rounds 59, 60, 61, 62) before or during this round. Round 63 is **not** commit-ready until its browser rows pass. Any of these is valid at the start:
- **(A)** HEAD `038ed5a45f94596a264c14c4ec834607cb407948`, `git status --short` **32 lines** (the round-63 end state; `b-round-63/status-start.txt`).
- **(B)** HEAD `cb128056…` (rounds 50–58 applied), **14 lines**.
- **(C)** a newer **root** commit with rounds 59–60 but not 61: **10 lines**.
- **(D)** a newer **root** commit with round 61 but not 62: **6 lines**.
- **(E)** a newer **root** commit with round 62 but not 63: **4 lines** (` M` `grid.ts`, `grid-edges.test.ts`, `grid-snap-clip-edges.test.tsx`; `?? doc 056`).
- **(F)** a newer **root** commit with round 63: `git status --short` is **empty**.

**In every case:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-63-r64-tree-sha256.txt`, **422** entries, all OK (run from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 2 owned files below.
  - **Newly frozen:** `grid.ts` (`5341cd83`), `grid-edges.test.ts` (`7e686c0f`), `grid-snap-clip-edges.test.tsx` (`785f521d`) and doc 056 (`1fd9c70b`), at C's round-63 end hashes.
- **Snapshots:** `../tmp/studio-real-loop/b-round-63-r64-snapshots/` with `SHA256SUMS.txt`. No owned file may differ from its snapshot at the start:

  | File | sha256 prefix | EOL (CRLF / LF) | `it` |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementLane.tsx` | `c16ba6b0` | 0 / 934 | — |
  | `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | `4a5eb6ea` | 0 / 757 | 27 |

- **B's check:** the round-63 frozen list is still 420/420 OK and the new list is 422/422 OK. Protected files 4/4 OK.
- **Anything else is a stop and report:** a frozen or snapshot mismatch, or a status that fits none of A–F.

**Other measurements:** `node.exe` 4. Full vitest at round-63 end: **89 files / 1574** (A and C rc 0). Biome `./app`: **5 / 218 / 1** (the 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`, `auth-bugs.test.ts`).

**Line endings:** both owned files are LF and stay LF. Never run `biome check --write`, `format --write` or `npm run format`.

**Rules:**
- Do not revert, re-create or reformat anything. The work of rounds 47–63 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z29: the library drop uses the single-move snap rule

Today (`ArrangementLane.tsx` l.177–187): `libraryDropStart(event)` = `resolveGridTime(libraryDropTime(…), snapSeconds, gridSeconds, event.altKey)`.

**New `libraryDropStart`** (shape, not literal code). Inputs: the drag event and the dragged source (`LibraryDragSource | null`).
1. `raw = libraryDropTime({ clientX, laneLeft, pxPerSecond })` — unchanged.
2. `step = resolveSnapStep(snapSeconds, gridSeconds, event.altKey)` — Alt is read from **this** event (dragover for the ghost, drop for the drop), as today.
3. `step === null` → return `raw` (free; unchanged).
4. **Video lane** (`isVideo`) **or** `dragged === null` (source not ready) → return `snapTimeToGrid(raw, step)` (grid only; unchanged result).
5. Otherwise: `const { startEdges, endEdges } = clipEdgeTargets(getArrangement().clips, '', track.id)` and return `snapMoveStartToGridOrEdges(raw, dragged.duration, step, startEdges, endEdges)`.
   - **No exclusion:** the dropped clip does not exist yet. `''` matches no clip id (ids come from `createClipId`). Do **not** change `clipEdgeTargets`' signature.
   - **Lane rule (D-29z18) on the drop lane:** on the drop lane, a clip's end is a start target and its start is an end target; clips on other lanes (including the video lane) give both.
   - Nearest wins in whole µs; a tie goes to the grid line, then the earlier edge (existing `nearestGridOrEdge`).

**Call sites:**
- `handleLibraryDragOver`: it already reads `const dragged = getLibraryDragSource();` — pass it to `libraryDropStart`.
- `handleDrop` (library branch): read `getLibraryDragSource()` **before** calling `dropLibrarySource` (which clears the drag ref), and pass `libraryDropStart(event, dragged)` as the start. `dropLibrarySource` itself is unchanged.
- **Imports:** the `~/lib/arrangement/grid` import line changes to the needed exports (`clipEdgeTargets`, `gridLinesVisible`, `resolveSnapStep`, `snapMoveStartToGridOrEdges`, `snapTimeToGrid`; drop `resolveGridTime` if nothing else in the file uses it — today only l.178 does).

**Unchanged:**
- `canPlaceLibraryClip` and `dropLibrarySource`: the overlap check runs on the snapped start. Touching is allowed (`LIBRARY_PLACEMENT_EPS`). If the winning candidate overlaps a clip, the ghost is red (`· აქ ადგილი არ არის`), `dropEffect` is `none` and nothing is added (LD-BLOCK, C-R51-01 ruling). **Do not** filter candidates by placement.
- Ghost markup, colours, texts, `dropEffect`, the drag-leave logic, the file (video) drop path, `ArrangementContext.tsx`, `grid.ts`, `library.ts`.
- No new UI text, state, props or exports.

**Worked oracle** (B, `b-round-63/oracle/oracle.mts` runs the real `grid.ts` helpers; Hit = 2 s):

| Fixture | Lane | raw | Snap | Old start | New start | Placeable |
|---|---|---|---|---|---|---|
| `DROP_FIXTURE` (m1 music 7/16, s1 sfx 4/2) | sfx | 9.4 | 1 | 9 | 9 | yes (SD2/SD5 unchanged) |
| `DROP_FIXTURE` | sfx | 6.2 | 5 | 5 (blocked) | **6** (s1 end) | **yes** → SD6 would flip; see §2.2 narrow grant |
| `DROP_FIXTURE` | sfx | 4.6 | 5 | 5 (blocked) | 5 (blocked) | no |
| `DROP_EDGE_FIXTURE` (m1 music 7.3/16, s1 sfx 4/2.4) | sfx | 6.55 | 1 | 7 | **6.4** | yes |
| same | music | 5.25 | 1 | 5 | **5.3** | yes |
| same | stems | 4.5 | 1 | 5 | **4.4** | yes |
| same | sfx | 4.5 | 1 | 5 (blocked) | 5 (blocked) | no (lane rule; a wrong lane would give 4.4) |
| same, source not ready | sfx | 6.55 | 1 | 7 | 7 | — |
| same | sfx | 6.55 | off + Alt (grid 1) | 7 | **6.4** | yes |
| same | sfx | 6.55 | on + Alt | 6.55 | 6.55 | yes |
| same | sfx | 6.55 | off | 6.55 | 6.55 | yes |
| same | video | 6.55 | 1 | 7 (refused) | 7 (refused) | — |

**Rejected:**
- **A new helper in `grid.ts`.** Every needed function is already exported; editing `grid.ts` would also change the file whose round-63 browser rows C still has to run.
- **Filtering edges that would overlap.** That would be a new placement-aware snap rule. The single-move rule does not do it, and the red ghost already tells the user.
- **Edges for a not-ready source with duration 0.** That would offer end touches the real clip cannot make; the grid line is the honest result until the duration is known.

### 0.2 Ableton (workflow addendum 2026-10-11)

**Sources:**
- Live 12 Reference Manual §5.10 "Adding Content from the Browser to a Live Set", `https://www.ableton.com/en/live-manual/12/working-with-the-browser/`. B read it with gstack `/browse` on 2026-10-19: `b-round-63/ableton-5.10-excerpt-20261019.txt` (full page text `b-round-63/browser-chapter-20261019.txt`).
- Live 12 manual §6.7 and §6.10, B capture `b-round-46/ableton-6.7-6.10-20261016.txt` (2026-10-16; re-used).
- No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A library item is dropped into a track at the pointer | §5.10 (text: "Items can be dragged and dropped from the browser into tracks in the … Arrangement View") | **confirmed** (drop into a track; the text says nothing about where on the time axis) | existing CZABA behaviour since SRW-11/12 | LD-EDGE, LD-PLAY |
| The drop start snaps to the grid or to the edges of other clips | — (§5.10 is silent; §6.7 describes **moving** clips, not browser drops) | **unconfirmed (no source)** | CZABA decision: the same rule as a single clip move (D-29z17/18), for consistency | DE1–DE4, LD-EDGE, LD-EDGE-END, LD-OTHER |
| Alt temporarily enables snapping while Snap is off, and bypasses it while Snap is on | §6.10 (text) | **confirmed as a general rule** | applied to the library drop (CZABA decision) | DE6, DE7, LD-ALT-ENABLE, LD-ALT-BYPASS |
| A drop that would overlap a clip on the same lane | — | **not applicable / unconfirmed** (Live's overlap handling is not described for drops) | CZABA: red ghost, no-drop cursor, nothing added (D-29z17 Q1, C-R51-01 ruling) | DE4, LD-BLOCK-REG |

Nowhere may a report claim "Ableton does the same" for the unconfirmed or not-applicable rows.

### 0.3 Source

| File | Change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | §0.1 only: `libraryDropStart` takes the dragged source; `handleLibraryDragOver` and `handleDrop` pass it; the grid import line. Nothing else changes. |

- **Frozen:** everything else, including `grid.ts`, `library.ts`, `ArrangementClip.tsx`, `ArrangementContext.tsx`, `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, every other test file and docs 001–056.
- No comments, no `any`, no type assertions, no `@ts-ignore`; semicolons everywhere.

### 0.4 What could be affected (C checks)

- **Drops with Snap off and no Alt:** byte-identical (SD1, DE8, the `track-layout` and `gesture-guard` drop tests).
- **Grid-only results:** SD2–SD5 and SD7 keep their exact results (oracle above).
- **SD6:** its first half flips under the new rule; it is re-fixtured (§2.2) so it still proves "a snapped start that overlaps is refused".
- **Blocked drops in the browser:** LD-BLOCK-REG (red ghost, no-drop cursor, nothing added).
- **Video lane:** refusal ghost unchanged (SD7, DE9, LD-VIDEO-REG).
- **Expected suite: 89 files / 1583** (1574 + 9: DE1–DE9). `grid-snap-loop-drop`: **36** `it`.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. Musical divisions and triplets belong to SRW-14 stage 5, after the SRW-15 BPM. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case A–F;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-63-r64-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - the snapshots' `SHA256SUMS.txt` and `cmp` for each owned file;
   - protected 4/4; Biome numbers; `node.exe`; both servers.
3. **Red run first:**
   - Write the §2.2 tests (and the SD6 change) before the source change and run `grid-snap-loop-drop.test.tsx` on the **unmodified** `ArrangementLane.tsx`.
   - **DE1, DE2, DE3 and DE6 must fail. SD1–SD7 (with the revised SD6), DE4, DE5, DE7, DE8 and DE9 must pass**, because they pin existing behaviour.
   - Expected: `4 failed | 32 passed (36)`. Record the failing assertions. If the red run differs, stop and report to B.
4. Post the pre-flight gate and the red run at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.1 and §0.3.

### 2.2 Tests — `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` (LF)

**Narrow grant — SD6 (C checks by AST):** in SD6's **first half only**, the two calls `dragLibraryOver(laneBody('sfx'), 6.2);` and `dropLibrary(laneBody('sfx'), 6.2);` become `… 4.6);`. Every assertion, the title, and the Alt half (`6.2, true`) stay unchanged. Every other existing `it` and helper is unchanged.

**Add** after the existing `DROP_FIXTURE_IDS` constant:
```ts
const DROP_EDGE_FIXTURE = [clipAt('m1', 'music', 7.3, 16), clipAt('s1', 'sfx', 4, 2.4)];
```
and a new `describe('SRW-14 stage 4c-2 library drop snaps to clip edges (D-29z29)', { timeout: 15_000 }, …)` placed after the stage-3b library-drop `describe`. Every test mounts `mountLoopDropWorkspace(DROP_EDGE_FIXTURE)`, calls `act(() => live(api).beginLibraryDrag(…))`, then `dragLibraryOver` and (where listed) `dropLibrary` with the same time and Alt, using the existing helpers. `addedClips(api, DROP_FIXTURE_IDS)` works for this fixture (ids `m1`, `s1`).

Status literals (copied from the file's SD1 line 367 and `ArrangementContext.tsx` l.1227; same template):
- added (template of SD1): `„Hit“ დაემატა SFX ხაზზე 00:09.400-ზე.` with the lane name and time replaced; lane names `SFX`, `მუსიკა`, `სტემები`;
- blocked: `აქ ადგილი არ არის — ერთ ხაზზე კლიპები ერთმანეთს არ ფარავს.` (`DROP_BLOCKED_STATUS`);
- not ready: `ეს ხმა ჯერ არ ჩატვირთულა — დაელოდე და სცადე თავიდან.`.

| ID | Steps | Must assert |
|---|---|---|
| DE1 a lane clip end captures the drop start | `pressG()`; `beginLibraryDrag('hit')`; sfx, **6.55** | ghost `{ text: '00:06.400', left: '256px', blocked: 'false' }`; after the drop one added clip on `sfx` with `start` `toBeCloseTo(6.4, 9)`; status `„Hit“ დაემატა SFX ხაზზე 00:06.400-ზე.`; Undo title `Undo: დამატება — Hit`; after `pressCtrl('z')` the clip ids equal `DROP_FIXTURE_IDS` |
| DE2 a lane clip start captures the drop end | `pressG()`; `'hit'`; **music**, **5.25** | ghost `{ text: '00:05.300', left: '212px', blocked: 'false' }`; added clip on `music`, start `toBeCloseTo(5.3, 9)`; status `„Hit“ დაემატა მუსიკა ხაზზე 00:05.300-ზე.` |
| DE3 another lane's clip end captures the drop end | `pressG()`; `'hit'`; **stems**, **4.5** | ghost `{ text: '00:04.400', left: '176px', blocked: 'false' }`; added clip on `stems`, start `toBeCloseTo(4.4, 9)`; status `„Hit“ დაემატა სტემები ხაზზე 00:04.400-ზე.` |
| DE4 a lane clip end is not an end target on its own lane | `pressG()`; `'hit'`; sfx, **4.5** | ghost `{ text: '00:05.000 · აქ ადგილი არ არის', left: '200px', blocked: 'true' }`; after the drop nothing is added, status `აქ ადგილი არ არის — ერთ ხაზზე კლიპები ერთმანეთს არ ფარავს.` (the file's `DROP_BLOCKED_STATUS`), Undo title `Undo` |
| DE5 a source that is not ready snaps to the grid only | `pressG()`; `beginLibraryDrag('missing')` (no such source → `getLibraryDragSource()` is `null`); sfx, **6.55** | ghost text `00:07.000 · ხმა ჯერ არ ჩატვირთულა`, `left` `280px`, blocked `true`; after the drop nothing is added and the status is `ეს ხმა ჯერ არ ჩატვირთულა — დაელოდე და სცადე თავიდან.` |
| DE6 Alt with Snap off enables edges for the drop | **no** `pressG()`; `snapState(view)` `off`; `'hit'`; sfx, **6.55**, `altKey: true` (both events) | ghost `{ text: '00:06.400', left: '256px', blocked: 'false' }`; added clip start `toBeCloseTo(6.4, 9)`; `snapState(view)` still `off` |
| DE7 Alt with Snap on bypasses edges | `pressG()`; `'hit'`; sfx, **6.55**, `altKey: true` | ghost text `00:06.550`, blocked `false`; added clip start `toBeCloseTo(6.55, 9)`; `snapState(view)` `on` |
| DE8 Snap off without Alt stays free near an edge | no `pressG()`; `'hit'`; sfx, **6.55** | ghost text `00:06.550`; added clip start `toBeCloseTo(6.55, 9)` |
| DE9 the video lane stays grid-only | `pressG()`; `'hit'`; **video**, **6.55** | ghost `{ text: '00:07.000 · აუდიო ვიდეოხაზზე არ ემატება', left: '280px', blocked: 'true' }`; after the drop the clip ids equal `DROP_FIXTURE_IDS`; Undo title `Undo` |

**Expected count:** vitest **89 files / 1583**; `grid-snap-loop-drop` **36** `it`.

If a ghost `left` string differs only by float formatting, stop and report; do not loosen it to a regex.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Scratch copy with a `node_modules` junction and your own vitest config, as in round 63. **Run on:** `grid-snap-loop-drop`, `track-layout`, `gesture-guard`, `grid-snap-ui`. Each mutation must fail at least the named tests; restore after each one.

| # | Mutation (in `ArrangementLane.tsx`) | Must fail |
|---|---|---|
| a | `libraryDropStart` back to grid only (`resolveGridTime`) | DE1, DE2, DE3, DE6 |
| b | the lane id passed to `clipEdgeTargets` is not the drop lane (e.g. `''`) | DE4 |
| c | a not-ready source uses edges with duration 0 | DE5 |
| d | the video lane uses edges | DE9 |
| e | `endEdges` is `[]` (start targets only) | DE2, DE3 |
| f | `handleDrop` passes `null` as the dragged source (edges only in the ghost) | DE1 (drop assertion) |
| g | edges are used even when `step === null` (Alt bypass ignored) | DE7 |
| h | Alt is ignored when Snap is off (`resolveSnapStep(snapSeconds, gridSeconds, false)`) | DE6 |
| i | the old SD6 coordinates (6.2) restored in the test, on the fixed source | SD6 (proves the narrow grant was needed) |

**Rules:**
- Write `a-round-64/mutations.txt` with the command, each result line and the failing test names.
- If a mutation survives, **strengthen that test** within §2.2. Do not add tests outside the list.
- **Spec-assumption stop:** if any §2.2 assertion fails on the **fixed** tree, stop and report to B; do not rewrite the assertion. The same applies if the red run differs or any existing `it` other than SD6's two coordinates needs a change.

### 2.4 After the change

- **Self-check:** `npx tsc --noEmit` → 0; full `npx vitest run` → **89 / 1583, 0 failures**; `npm run build` → rc 0.
- **Biome:** read-only `npx biome check ./app` → ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info; the 2 owned files → 0 diagnostics.
- **Review:** run the real `code-reviewer` subagent on the diff; put its findings and dispositions in the report. Architecture notes go to B (`a-round-64.md` §6), not into code. Reviewer items outside §0 go to B.
- **`/check`:** `npm run verify` → exit 0, run quietly, no PW probe in parallel. Do not run `npm run test:e2e:smoke` (root's).
- **Browser smoke (`:5173` up):** one gstack load of `/studio-lab` at 1440×900; confirm the workspace and badge render and the network has no forbidden request. Not a PASS claim.

### 2.5 Doc 057

New file `docs/implementation/2026/quarter-IV/057-studio-lab-grid-library-drop-edges.md`. Georgian, technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 64 — D-29z29; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** stage 4c-2 (from D-29z27/D-29z28), the round-63 environment block;
- **Approach:** §0.1 and the oracle table; **alternatives** (§0.1 rejected list);
- **Changed files; problems and solutions; testing** (red run, SD6 narrow grant, DE1–DE9, mutations a–i, gates);
- **Ableton** (the §0.2 table);
- **TODO:** SRW-14 stage 4 closes after C; SRW-15 next; A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE and GROUP-SUBMS-GRID-EDGE (Lows batch); the ARCH checkpoint.

Docs 055 and 056 are **frozen**. Do not edit their status lines.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | A | §0.1 (`libraryDropStart`, `handleLibraryDragOver`, `handleDrop` library branch, the grid import line) |
| `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | A | SD6's two first-half coordinates; `DROP_EDGE_FIXTURE`; the new DE1–DE9 `describe` |
| `docs/implementation/2026/quarter-IV/057-studio-lab-grid-library-drop-edges.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-64.md`, `a-round-64/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-64.md`, `c-round-64.json`, `c-round-64/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end.** Rule by content: the start set, plus one ` M` line for each owned file the start set does not already list, plus `?? doc 057`; nothing else. Both owned files were last changed in round 57, so they are in the start set only in case A (` M` ArrangementLane, `??` the test file); in cases B–F the `cb12805` commit contains them and each adds a ` M` line.

| Case | Lines | Content |
|---|---|---|
| A | **33** | the 32 start lines + `?? doc 057` |
| B | **17** | 14 + 2 ` M` + 1 |
| C | **13** | 10 + 2 ` M` + 1 |
| D | **9** | 6 + 2 ` M` + 1 |
| E | **7** | 4 + 2 ` M` + 1 |
| F | **3** | ` M ArrangementLane.tsx`, ` M` the test file, `?? doc 057` |

The rule in every case: **no path outside §3.1 may appear or change.** The frozen list must stay 422/422 OK.

### 3.2 Frozen this round

- Everything in `b-round-63-r64-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**` and `root-publish/**`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server or the backend; `npm run format`; deleting `playwright-report/`, `store/nul` or any `a-round-6x/scratch/` / `c-round-6x/scratch/` folder (root's call; they hold `node_modules` junctions).

## 4. Acceptance (C)

**Checkpoint order:** G64-2 → R64-S → R64-U → G64-1 → **§4.6 (carried round-63 rows)** → G64-3 → §4.7 (4c-2 rows) → §4.8 (probe).
- Write `c-round-64/checkpoint.md` as you go.
- Check both servers at the start, after the offline items and before the report; record each check. Do not start them.
- `c-round-64.json` `browserVerified` is `true` only if every REAL-browser row in §4.6, §4.7 and G64-3's workspace rows ran.

### 4.1 R64-S — static (read-only)

- **`diff -u` against the snapshots:**
  - **`ArrangementLane.tsx`:** only `libraryDropStart`, its two call sites and the grid import line change. Read it against §0.1: steps 1–5, `''` as the exclusion, the lane id `track.id`, `dragged.duration`, and `getLibraryDragSource()` read before `dropLibrarySource` in `handleDrop`.
  - **Tests:** existing `it` are AST-identical except SD6, where only the two first-half numeric literals change 6.2 → 4.6. Use your `asteq-it.cjs` with a negative control. DE1–DE9 are present with the §2.2 fixtures; `DROP_EDGE_FIXTURE` is the only new top-level constant.
- **Frozen:** `grid.ts` `5341cd83`, `ArrangementClip.tsx` `97a1bf79`, `ArrangementContext.tsx` and `library.ts` in the frozen list.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **EOL:** owned files LF. **Doc 057** exists with the §2.5 sections; docs 055 and 056 unchanged.
- **Literal check:** no character outside Georgian, ASCII and the punctuation already used in the file (`„“—·…`) appears in the new tests (B-R63-SPEC-LITERAL).

### 4.2 R64-U — unit and mutation (C's own scratch, own strings)

- **Red run:** the new tests + the SD6 change on a scratch copy of the snapshot `ArrangementLane.tsx` → `4 failed | 32 passed (36)`; the failing four are DE1, DE2, DE3, DE6.
- **Mutations a–i:** re-run in your own scratch with your own edits; each must kill its named tests.
- **C extras (info), suggested:** (j) the edge targets are computed from the lane's clips only (`clips` filtered to `track.id`) → DE3 should kill it; (k) `getLibraryDragSource()` read **after** `dropLibrarySource` in `handleDrop` → DE1's drop should kill it. Record survivors as test gaps.
- **Durations:** run `grid-snap-loop-drop` alone and record it. A single test over 3 s is info.

### 4.3 G64-1 — gates

- tsc 0; build passes.
- **Biome:** read-only `./app` within the baseline; owned files 0 diagnostics.
- **vitest = 89 files / 1583, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, quietly, at most two quiet attempts, each recorded. If neither gives rc 0, G64-1 is FAIL.
- Record any `Test timed out` with file, test and ms.

### 4.4 G64-2 — tree

- Protected 4/4 OK; frozen 422 OK; the round-63 owned hashes (`5341cd83`, `7e686c0f`, `785f521d`, `1fd9c70b`) unchanged.
- `git status --short` matches §3.1 for the observed case; record HEAD at start and end.

### 4.5 Not run, or not testable

- **If `:5173` is down:** "not run (environment)" for §4.6, §4.7, §4.8 and G64-3's browser rows; `browserVerified: false`.
- **Sub-ms:** no `/studio-lab` asset has a sub-ms duration; (n)-type distinctions stay unit-only.

### 4.6 Carried round-63 browser rows (mandatory, run first) — REAL-mouse (PW), 1440×900, then the starred rows at 1280×720

These are the round-63 §4.6 rows, unchanged (`tasks/round-63.md` §4.6). Setup as written there: the L52 fixture, `tools/pw62.cjs` as a template, Snap via REAL `g`, division via REAL `select`; group selection by REAL header click then Ctrl+REAL click; record every clip's `start`, `duration` and `trackId` before each drag; write the oracle's candidate list in the run log, including whether the winning edge is out of bounds and the grid line's own delta against the bounds; record the Undo title before each Ctrl+Z.

| ID | Steps | Pass |
|---|---|---|
| GE-OOB-STATUS* | C-R62-01's exact steps (`c-round-62.json` `bugs[0].steps`): neighbour `Middle East` at **19.3** (Slow rise maxDelta 2.0), division 1, drag `Soft impact` +81 px (raw 6.025) | SI **6**, Slow rise **14.3**, no overlap; **during the drag the status is not** `ჯგუფის გადატანა შეჩერდა …`; after the release the status is **`გადატანა (2): 2 კლიპი გადავიდა 00:02.000-ით მარჯვნივ.`** (verbatim); Undo `გადატანა (2)`; Ctrl+Z restores both |
| GE-OOB-PLAY (real audio) | After GE-OOB-STATUS (before its Ctrl+Z): video Mute, REAL ruler click at 5 (division 1), REAL Space; sample SI's track meter (the round-62 GE-PLAY method) | SI's meter is −∞ until the readout is ≥ 5.95 and rises by ≤ 6.15 |
| GE-BOUNDS-REG | round-62 GE-BOUNDS (neighbour at **18.8**, maxDelta 1.5, raw 6.025) | as in round 62: SI 5, Slow rise 13.3; **the blocked status appears during the drag** and no success line is written after the release; nothing overlaps |
| GE-START-REG* | round-62 GE-START | SI 7, Slow rise +3, the verbatim round-62 status |
| GE-CROSS-REG | round-62 GE-CROSS | as in round 62: Slow rise on SFX at 6, music on stems at 0.7, status `გადატანა (2): start 00:06.000.` |
| GE-ALT-ENABLE* | Snap **off**. Group `Soft impact` + `Slow rise`. Hold **Alt** through the drag, with SI's raw start within 0.2 s of a non-member edge that is nearer than the grid line (C picks it from the oracle; e.g. GE-START's +104 px) | SI lands on the oracle's edge; Slow rise moves by the same delta; Snap stays off. If the browser's Alt opens a menu or loses the press, record it and mark the row "not testable (harness)", not PASS |
| GE-CROSS-OOB (info) | A cross-lane group move where the nearest edge on the target lane needs a delta outside the **source-lane** bounds while the grid line is in bounds (C builds it from the library) | Record the result. Expected per D-29z28: the grid-line result (the edge is not tried). An overlap, a lost clip or a wrong lane is a bug with its own ID |

A PASS of GE-OOB-STATUS (both viewports) closes C-R62-01; a PASS of GE-ALT-ENABLE (both viewports) closes C-R62-ALT-ENABLE-GROUP-GAP. A FAIL gets its own bug ID and goes first next round.

### 4.7 Stage 4c-2 browser rows — REAL-mouse (PW) HTML5 drag from the library, 1440×900, then the starred rows at 1280×720

**Setup:**
- Fresh `/studio-lab`. Before the first drag, wait until the dragged library item is **ready** (its duration is shown / it previews) and record how long that took (see §4.8).
- Record every clip's `start`, `duration`, `trackId` and the dragged item's duration before each drop. Write the oracle candidate list (grid line, start targets, end targets per D-29z18 on the drop lane) in the run log, then pick a pointer x so the expected winner is an **edge** that is nearer than the grid line by ≥ 0.05 s.
- Read the ghost text during the drag (before the drop) and the status after it.

| ID | Steps | Pass |
|---|---|---|
| LD-EDGE* | Snap on, division 1. Drag a ready library sound onto an audio lane just after a clip on **that lane** so its raw start is within 0.2 s of that clip's end | ghost shows the clip end time and is not red; the dropped clip starts exactly at that end (no gap, no overlap); status `„<title>“ დაემატა <lane> ხაზზე <time>-ზე.` with that time; Undo `Undo: დამატება — <title>`; Ctrl+Z removes it |
| LD-EDGE-END | Snap on. Drop so the dropped clip's **end** is within 0.2 s of the **start** of a clip on the drop lane, with free space before it | the dropped clip ends exactly at that clip's start |
| LD-OTHER | Snap on. Drop onto an empty audio lane near another lane's clip edge (start or end touch) | the dropped start or end matches that edge |
| LD-ALT-ENABLE* | Snap **off**; hold **Alt** through the drag (dragover and drop) at an LD-EDGE position | as LD-EDGE; Snap stays off. If the browser's Alt opens a menu or loses the drag, record it and mark "not testable (harness)", not PASS |
| LD-ALT-BYPASS | Snap on; hold Alt at an LD-EDGE position | the drop lands at the raw pointer time (no grid, no edge) |
| LD-BLOCK-REG | Snap on. Drop where the winning candidate overlaps a clip on the drop lane | ghost red with `· აქ ადგილი არ არის`, no-drop cursor, nothing added (as round 51 / C-R51-01 ruling) |
| LD-VIDEO-REG | Drag a library sound over the video lane | refusal ghost `· აუდიო ვიდეოხაზზე არ ემატება`, nothing added |
| LD-PLAY (real audio) | After LD-EDGE (before its Ctrl+Z): video Mute, REAL ruler click 2 s before the dropped start, REAL Space; sample the drop lane's track meter | the meter stays −∞ until the readout is ≥ (dropped start − 0.05) and rises by ≤ (dropped start + 0.15) |

### 4.8 INFO-R62-LIB-LOADING-DROP probe (required, browser)

On a **fresh** `/studio-lab` page (new context, cache empty):
1. Record, every 5 s for up to 60 s, which library items read "loading" and which are ready.
2. At ~2 s, before the target item is ready, drag it onto an audio lane: record the ghost text (expected `· ხმა ჯერ არ ჩატვირთულა`) and the status after the drop (expected `ეს ხმა ჯერ არ ჩატვირთულა — დაელოდე და სცადე თავიდან.`), and that nothing is added.
3. After the item is ready, drag it again: it must be added.
4. Repeat 1–3 for one hero item and one stem item that C round 62 could not drop.

**Severity call-out:** if an item **never** becomes ready within 60 s while the network shows its audio request finished, or a **ready** item cannot be dropped, that is a bug with its own ID (High if no library sound can be added at all; Medium if some items cannot). Record the network rows for the item's audio request (status, size, time). A demo-asset quirk is info.

### 4.9 G64-3 — anonymous workspace and purchase protection

Use a fresh browse state.
- **Workspace:** `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- **Network:** no requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code. This includes every §4.6–§4.8 run.
- **Sign-in gate:** `/studio/middle-east` shows "Sign in required".
- **Token rows (backend `:5199` must be up):** an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns **401**; a fake Bearer returns **403** (pending since 2026-10-18). **If the backend is down, both are "not run (environment)", not PASS.** Record the codes either way.
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

### 4.10 Not run this round, and carried items (honest)

**Not run this round in any case:** video sync and C-R27-01 (RF3-1, RF3-2, R5-L6); the full find → add → fit video → export flow with WAV checks; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root); the round 57–61 menu browser re-run.

**Open C items:**
- **Carried this round:** C-R62-01, C-R62-ALT-ENABLE-GROUP-GAP (browser halves, §4.6).
- **C-R41-01** (TL-Q-VIEWPORT). **Tech Lead:** C-R27-01, C-R6-02, C-R8-01 (quiet Chrome); C-R23-01 + C-R38-01.

**Open Low / info (Lows batch after SRW-14 stage 4 unless Medium+):**
- **General:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE.
- **Rounds 49–55:** R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE; A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG; A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE; A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP; A-R54-REVIEW-LOWS.
- **Rounds 62–63:** GROUP-SUBMS-GRID-EDGE, A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE, INFO-R62-CROSS-FLOAT, INFO-R62-GEPLAY-UNDO, ENV-EXT-LOAD-HANG, C-R63-NPX-CACHE.
- **Grid-menu batch:** A-R57-REVIEW-TAB-BODY-FOCUS, A-R57-REVIEW-CONTEXTMENU-KEY, A-R57-REVIEW-PAGE-TRANSITION; A-R58-REVIEW-ANDROID-TAP-CLICK; C-R59-02; A-R59-REVIEW-END-INDEX, A-R59-REVIEW-REANNOUNCE, A-R59-REVIEW-PUNCTUATION; A-R60-REVIEW-GK11-EXPORT-STATUS; INFO-R60-FOCUS-RETURN, INFO-R60-SHIFT1-SYNTH; INFO-R61-XSPAN, A-R61-REVIEW-CLOSEST-SCOPE.
- **Architecture:** ROOT-R50-58-L5 + A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP; A-R62-ARCH-PRECISION-BOUNDARY → ARCH-CHECKPOINT-SRW14-PREFS (b).

**`root-pre-push-review.md`** (mtime 2026-10-18 12:46:34, unchanged):
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) open; R5-L3 partially measured; R5-L5, R5-E1, R6-S2, R6-S3 unit tests only.
- **Medium:** M1 (the loop refill is rAF-only, so a hidden tab goes silent); M2 (the per-frame `position` in the context value re-renders every consumer).
- **Lows:** L1–L4 and L6–L8. **`root-review-r50-58.md`:** L1–L4 closed by C (rounds 60–61); L5 is the architecture item.

**`publication-checkpoint.json`** (mtime 2026-10-17 11:11:24, unchanged): SRW-21 (the purchased loader hardcodes `middle-east`; do not claim that every product's stems work); portable instruction paths; the SRW-23 scrollbar check at 1280×720 and 1440×900; SRW-11/12 library and stems parity; T12 continuation.

**Root items:** the publisher (`cb12805`, rounds 59–62 separate units; round 63 after its browser rows); ARCH-CHECKPOINT-SRW14-PREFS and ARCH-CHECKPOINT-SRW13; GSTACK-ACL, GSTACK-NO-MOUSE, ENV-BROWSE-DAEMON, ENV-EXT-LOAD-HANG; the CRLF Biome errors on the auth files; the stray `store/nul`; INFO-R61-FAKEBEARER-500; ENV-BACKEND-DOWN-R61; ENV-SERVERS-DOWN-R63.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T, R57-T … R63-T), plus **R64-T:** in your Chrome on `/studio-lab`, Snap on, drag a library sound next to another clip's end or start — the ghost and the dropped clip butt that edge; with Snap off hold Alt — the same; with Snap on hold Alt — the sound lands where you release it.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-63-r64-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-63-r64-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/ArrangementLane.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-63-r64-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/components/arrangement/ArrangementLane.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A)

1. **Start the Store dev server (`:5173`) and the backend (`:5199`) before A starts, and keep both up through C round 64.** Both were 000 for all of A and C round 63 and at B 11:38 (ENV-SERVERS-DOWN-R63; the backend since the 2026-10-19 restart, ENV-BACKEND-DOWN-R61). This is the third round without browser acceptance.
   - **Env gate:** `loop-v2/env-status.json` does not exist. Please make the loop hold C (not start it) while `:5173` is 000, so a C run is not spent on offline-only checks again.
2. **Commit units** (interim checkpoints, not a release; only via root's publisher flow):
   - **Rounds 50–58** (`cb12805`) and **rounds 59, 60, 61, 62:** ready, each its own unit.
   - **Round 63:** **not ready** — offline C PASS only; ready when §4.6 passes. Rounds 63 and 64 may be published together after C (root's call).
   - **Round 64:** only after C.
3. **ARCH-CHECKPOINT-SRW14-PREFS — re-requested at the SRW-14 stage-4 boundary** (bounded read-only frontend-architect, `store/.claude/references/architecture-checkpoint.md`): (a) snap-preference plumbing vs a non-history edit-preferences slice — wanted before SRW-15 adds BPM consumers; (b) one time-precision rule (A-R62-ARCH-PRECISION-BOUNDARY; C mutation n in round 63); (c) the shared grid test harness; (d) `useArrangementGridMenu` + `isFollowAutoScroll` still keep-for-now? **Answer format:** keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task. **Round 64 does not wait.**
4. **INFO-R61-FAKEBEARER-500:** with the backend unreachable a fake Bearer gets 500 instead of 403/503 (still fail-closed). `api.studio-token.ts` is protected; root's decision.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-64.md`:**
1. the pre-flight gate, the §1.2 baseline (case A–F) and the red run;
2. the diff summary per file with EOL counts;
3. SD6 and DE1–DE9, each with its alone duration;
4. mutations a–i;
5. smoke;
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-64.md` and `c-round-64.json`** (usual schema, with `browserVerified`).
- Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment / not testable).
- Cover R64-S, R64-U, G64-1, G64-2, G64-3, §4.6, §4.7, §4.8 and the Ableton rows, with two verdicts each (CZABA requirement; Ableton match).
- `passed` lists only IDs run this round.
- State **commit readiness** for root, separately for round 64, round 63, round 62, rounds 59–61 and rounds 50–58.

**Next (orientation only):**
- **If §4.6–§4.8 pass:** SRW-14 stage 4 closes. Next is **SRW-15 stage 1 (FB-09):** project BPM and a bars/beats ruler as a **grid model only** (never audio time-stretch), then SRW-14 stage 5 (musical divisions) and the SRW-15 metronome.
- **Then:** SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the Lows batch; SRW-21; full regression and root review; T12.
- C bugs from this round go first.
