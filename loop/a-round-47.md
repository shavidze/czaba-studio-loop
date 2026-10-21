# A — Round 47 report: SRW-14 stage 1 (FB-13) — seconds grid, Snap, lane grid lines, move snapping

Implementer A (Claude Opus 5.5), 2026-10-16. The round ran in two sessions. Session 1 did the pre-flight, red run, code, green run, mutations and the first gates, then ended on a network error (`a-round-47-network-failure-20261016.json`, ENOTFOUND). Session 2, this report, resumed from `a-round-47/checkpoint.md`. It inspected the partial edits, re-recorded the design-philosopher answer, wrote the docs, ran the code-reviewer, fixed its findings, re-ran mutations and gates, and ran the smoke. **No PASS is claimed.** One contracted gate fails on a frozen test. See §7, **B-EXPECT-R47-RB**.

## 1. Pre-flight gate, design-philosopher, §1.4 re-checks

- **Baseline before any edit** (session 1; `checkpoint.md`):
  - HEAD `d2f6715`, `git status --short` empty.
  - 395 OK; the 4 component snapshots were the same; doc 043 sha `5bc8ff58`.
  - Protected 4/4 OK; node.exe 39.
- **Primitives and templates read:** read-primitives rule, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, studio-feature/new-test prompts and TEMPLATE.md (session 1; session 2 re-read GEORGIAN_DOCS and TEMPLATE before the docs).
- **Pre-flight plan:**
  - Assumptions: state stays local to `StudioWorkspace`; the context is untouched; the snap math is pure in `grid.ts`.
  - Simplicity: one background layer per lane body, no DOM node per line.
  - Scope: exactly §3.2.
  - Success: GM/GS green, mutations (a)–(k) killed, frozen suites green, toolbar 49/87 px.
- **design-philosopher** (asked again in session 2, because session 1's answer was not saved):
  1. Remove the visible `ხაזები`. It would fit (about 178 of 208 px by estimate), but a third word in the 28 px strip is clutter. Snap next to a seconds value already reads as the grid control. Removing it guarantees `0.25 წმ` is never clipped. **Applied:** removed. The agent also suggested `aria-label="ხაზები"` on the select. **Not applied:** §0.2 fixes `aria-label="ბადის დანაყოფი"`, which already gives the select an accessible name.
  2. Keep `--color-outline-light` at its own alpha. It is the outline family, sits one step above the lane background and adds no new colour. `outline`/`outline-hover` would stripe the 0.1/0.25 s grids, and accent/brand stay reserved for state. **Applied.**
- **§1.4 re-checks:**
  - `useState<TimelineFollowMode>` is at `StudioWorkspace.tsx:322` (`followMode`).
  - `KeyG|'g'` in `app/components/arrangement` → 0 before the edit (session 1).
  - `npx biome check` on the 3 owned TS files before the edit: `Checked 3 files … No fixes applied.` (`biome-pre.txt`).

## 2. Red run, mutations, green run

- **Red** (`a-round-47/red-run.txt`, against the untouched working copy before the first edit):
  - `grid.test.ts` failed on the missing module `../grid`, as expected.
  - GS1, GS3, GS4, GS5, GS6, GS8, GS9, GS10, GS11, GS12 and GS13 were red.
  - GS2 and GS14 were green, as expected.
  - **Deviation:** **GS7 was green on the snapshot.** The Shift time lock already keeps the start unchanged, so a Shift test cannot be red before Snap exists. Mutation (d) kills it, so it does guard the precedence.
  - The red run had 11 red and 3 green. B expected 12 red and 2 green.
- **Green:** `green-run.txt` (session 1, 22/22). After the review fixes: `green-run-2.txt` → **23/23** (GM 8 `it`, GS 15 `it`; GS5b was added).
- **Mutations** (`mutations.txt`; scratch copy outside `store/`; `node_modules` junction created and then removed with `cmd /c rmdir`; `MSYS_NO_PATHCONV=1`; the session-1 run is kept in `mutations-v1.txt`). Base: 23/23 green. **Every mutation was killed:**

| # | Mutation | Killing tests |
|---|---|---|
| (a) | single move ignores `snapSeconds` | GS3, GS4, GS6, GS10, GS12, GS13 |
| (b) | group uses the raw delta | GS5, GS5b |
| (c) | single cross-lane `timeDelta` unsnapped | GS6 |
| (d) | Shift no longer wins | GS7 |
| (e) | nudge ignores Snap | GS8, GS9 |
| (f) | G ignores `event.repeat` | GS11 |
| (g) | tie goes earlier | GM1 |
| (h) | 6 px check removed | GM4, GS10 |
| (i) | G before the `modifier` return | GS11 |
| (j) C | `snapGroupDelta` returns the clamped raw delta | GM3 ×2, GS5b |
| (k) C | lines only with Snap on | GS1 |
| (l) A extra | tie tolerance removed (review finding 1) | GM1 |

## 3. Diff summary per file

- **`app/lib/arrangement/grid.ts`** (new): exports exactly the §0.1 names.
  - Private `roundGridTime` and `GRID_TIME_TOLERANCE` (1e-6).
  - `snapTimeToGrid` = `floor((t + 1e-6)/step + 0.5)·step`, rounded to 1 ms, ≥ 0. The tolerance came from the review: without it 0.35/0.1 tied to the earlier line.
- **`StudioWorkspace.tsx`:**
  - `snapEnabled`/`gridSeconds` state plus mirror refs.
  - `toggleSnap` and `changeGridDivision` set the status without history.
  - The ruler header cell keeps 224×28, sticky and border, adds `gap-2` and holds `data-testid="arrangement-grid-control"` with `data-snap`, `data-grid-seconds` and `data-grid-lines`.
  - The Snap button (`aria-pressed`, `aria-keyshortcuts="G"`, exact titles, Loop's pressed classes) and the native select (7 options, exact titles); `ხაზები` removed.
  - G sits after `if (modifier) return;`: `shortcutLetter` `g`, no Alt/Shift, `preventDefault`, toggles when `!repeat`. It is not in the gesture-blocked list.
  - Nudge with Snap: `adjacentGridLine` from the `selectedClipId` start; `null` → status `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` with no call; otherwise `nudgeSelectedClip(target − start)`. Snap off keeps ±0.1.
  - The keydown effect deps add only the stable `toggleSnap`.
  - Lanes get `gridSeconds` and `snapSeconds={snapEnabled ? gridSeconds : null}`.
- **`ArrangementLane.tsx`:**
  - Optional `gridSeconds?`/`snapSeconds?`.
  - The lane body background is `repeating-linear-gradient(var(--color-outline-light) 1px, period gridSeconds·pps)` only when lines are visible.
  - `data-grid-seconds` and `data-grid-lines` are set; `snapSeconds` goes to every clip.
  - Review fix: with no `gridSeconds` there is no background and no attributes (unchanged for other callers).
- **`ArrangementClip.tsx`:**
  - Optional `snapSeconds`, `data-clip-start`.
  - `moveStartOnGrid` and `groupDeltaOnGrid` helpers; `snapStep = timeLocked ? null : snapSeconds`, read on every move.
  - Single same-lane and cross-lane moves use the snapped start/delta; a group uses `snapGroupDelta` for `allowed`.
  - Range overlay `/60` → `/30`.
  - Trim, the range gesture and `finishGesture` are untouched.
- **Tests (new):** `grid.test.ts` (GM1–GM4, plus 0.1 s tie cases); `grid-snap-ui.test.tsx` (GS1–GS14 plus GS5b; 40 px/s set through the context; the readout `40 px/წმ` is asserted exactly).
- **Docs:** doc 043 l.4 changed to the exact T3 text (one line, verified by diff). Doc 044 is new and includes the §4.9 table, the Mermaid diagram, the stages and the review outcomes.

## 4. Smoke and dev-server Δ

Smoke log: `a-round-47/smoke.txt`. Browse daemon through `a-round-47/b.sh`, fresh state `a-round-47/a-browse.json`, `BROWSE_PARENT_PID=0`. The first start printed "Server failed to start within 15s". The CLI's automatic second start worked, so no fallback was used. The daemon was never restarted manually.

- **Fresh 1440×900 (after the review fixes):**
  - Cell 224×28 with `data-snap="off"`, `data-grid-seconds="1"`, `data-grid-lines="visible"`.
  - Select `1`, title `ბადე 1 წმ`; select `scrollWidth` = `clientWidth` = 73, so the value is not clipped (screenshot `shot-1440-header.png`).
  - Lane bodies start at left = 512 = the ruler's left; the background period is 40 px.
  - Toolbar **49 px**. At 1280×720 the toolbar is **87 px** and the cell 224×28 (`shot-1280-header.png`).
- **REAL `G`** (`$B press g`, focus on body) → `data-snap="on"`, `aria-pressed="true"`, status `Snap ჩართულია — ბადე 1 წმ (G)`, Undo title `Undo` (no history).
- **REAL click** on the library row `Soft impact` → REAL click `＋ დამატება` → the clip is placed at 0.000.
- **Drag: not REAL.** The browse CLI has no drag command, and `$B cdp Input.dispatchMouseEvent` → `DENIED … not on the CDP allowlist`. The fallback `server-node.mjs` has the same command set. The **SYNTHETIC** drag (dispatched PointerEvents on the header, pointerId 1, +50 px = 1.25 s at 40 px/s) gave `data-clip-start="1.000"`, status `კლიპის გადატანა: start 00:01.000 …`, Undo `Undo: კლიპის გადატანა`. The REAL drag stays with C (REAL-mouse) and with the Tech Lead (R47-T).
- **1280×720 reads were not a fresh load:** the 87 px toolbar and 224×28 cell at 1280×720 came from `viewport 1280x720` on the already-loaded page, after the 1440 steps. They are not a UI-2 fresh-load PASS.
- **Daemon end state:** `b.sh stop` printed `[browse] Unable to connect…`. Afterwards `a-round-47/a-browse.json` does not exist, so the daemon is most likely stopped. No process was killed.
- **Fallback not used:** the harness rule says to switch to the fallback after one CLI-daemon failure. There was one start failure, but the CLI's own retry succeeded on the same command, so A stayed on the CLI. This is stated so C does not have to infer it.
- **Dev-server warnings:** `grep -c "useLayoutEffect does nothing on the server" ../r42-vite.err.log` was 357 before and 357 after `curl /studio-lab` (200) + `sleep 3`, so **Δ 0**. The log is live: `curl /` grew it from 1 173 198 to 1 175 118 bytes.

## 5. code-reviewer (real agent run) — findings and dispositions

Score 8/10.

1. **Medium:** tie at 0.1 s went earlier (floating point). **Fixed**: tolerance added, 3 GM1 cases, mutation (l).
2. **Low:** the lane default `gridSeconds = 1` drew lines for callers without the prop (for example the `gesture-guard` harness), which goes against §0.3 "defaults keep today's behaviour". **Fixed** (no default; no attributes or background without the prop).
3. **Low, a deviation that needs B's decision:** a **group cross-lane** move passes the snapped *requested* delta to `planClipLaneMove`, not `snapGroupDelta(...)` with the bounds as §0.4 says. `allowed` is used only for the refused-ghost fallback. This keeps the snapshot's structure: `groupMoveBounds` describes neighbours in the source lane and does not apply to the target lane. **Not changed. Recorded as A-R47-GROUP-LANE-DELTA** (doc 044). No test covers group cross-lane under Snap.
4. **Low, test gap:** no group-blocked case under Snap. **Fixed** with GS5b (the blocked status, 5 / 7.7, no overlap, one entry). It kills (b) and (j).
5. **Info:** GS1 did not assert `on` after G, and its readout check was loose. **Fixed.**
6. **Info:** the nudge anchor comes from the render snapshot. With React 18 each keydown re-renders before the next one. No change.
7. **Info:** G placement, deps and `exportKeyEventRef` are correct. No change.
8. **Info:** Space on a focused Snap button plays (global Space). Expected (UI-6).
9. **Info:** the hidden-lines hint is only in the `title`. Consider `aria-describedby` later (stage 4 or later).
10. **Info:** fractional gradient periods may blur lines. The lane-level all-tracks range overlay still uses `bg-foreground/60` (`ArrangementLane.tsx`, outside this round's one-liner) → **stage 2 candidate for B**.
11. **Info:** SSR is safe; the initial values are constants.
12. **Info:** the rest of the scope matches the snapshot.

**Architecture notes (for B; not acted on):**
- `StudioWorkspace.tsx:323-328` adds two more view-preference states with mirror refs next to `followMode`. When stages 2–3 add consumers (trim, ruler, library drop, loop brace), consider one view-preferences hook instead of more Lane → Clip props.
- The window keydown handler grew again (P2 signal, already tracked).
- `ArrangementClip` move branch: parallel requested/allowed shapes for group and single clips (existing structure).

## 6. Command tails (verbatim; session 2 unless marked)

```
git rev-parse HEAD                     → d2f6715df3be47e1a2e31112d7fcde04c54e8d2a
git status --short                     → exactly §3.2 (3 M components, M doc 043, ?? grid.ts, grid.test.ts, grid-snap-ui.test.tsx, doc 044)
sha256sum -c b-round-46-tree-sha256 | grep -vc ': OK$'   → 0
snapshots: ArrangementClip changed · ArrangementLane changed · ArrangementTransport same · StudioWorkspace changed
protected: download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
npx tsc --noEmit                       → exit 0 (tsc-2.txt empty)
new tests (green-run-2.txt)            → Test Files 2 passed (2) · Tests 23 passed (23)   [node.exe 35]
frozen suites, 18 files (frozen-suites-2.txt) → Test Files 1 failed | 17 passed (18) · Tests 1 failed | 413 passed (414)
   FAIL render-budget.test.tsx:309:41  expect(view.getAllByRole('option')).toHaveLength(2) → 9
npx vitest run (full-vitest-2.txt)     → Test Files 1 failed | 81 passed (82) · Tests 1 failed | 1386 passed (1387)   [node.exe 30 → 30]
   only failure: render-budget.test.tsx:309 (same)   1387 = 1364 + 23
npm run build (build-2.txt)            → exit 0 · ✓ built in 8.49s (server)
npx biome check <6 owned TS files>     → Checked 6 files … No fixes applied.
npx biome check ./app (biome-app-2.txt)→ Checked 355 files · Found 2 errors · Found 218 warnings · Found 1 info · 0 diagnostics in owned files
npm run verify (verify-2.txt)          → exit 1 at test:run: Tests 3 failed | 1384 passed (1387) [node.exe 45; ran concurrently with the browse smoke, node.exe up to 56]
   render-budget:309 (option count) + render-budget "moves the playhead…" timeout + track-layout "folds a lane…" timeout; build step not reached in verify (build passes separately)
re-runs alone (verify-timeout-reruns.txt):
   render-budget alone [node.exe 34]: "moves the playhead…" ✓ 1260ms; only :309 fails
   track-layout alone  [node.exe 35]: "folds a lane…" × 5929ms timeout (run 1)
   track-layout -t fold ×2 [37, 33]: ✓ 1430ms, ✓ 670ms; whole file ×2 [33, 33]: 36/36, fold ✓ 673ms, ✓ 806ms
dev-server Δ: 357 → 357
```

**track-layout fold timeout:** load-sensitive. It failed in 2 of 7 runs under load: verify, and one run alone right after verify. It passed in the full vitest run and in 4 later reruns (0.67–1.43 s). Session-1 scratch baseline runs at the snapshot passed at 2.3 s and 2.1 s. Not judged a regression, but C should re-run the file under recorded load.

## 7. Deviations and self-check

- **B-EXPECT-R47-RB (blocks G47-1 as written):**
  - Frozen `render-budget.test.tsx:309` asserts `getAllByRole('option')` is 2 (the library listbox rows). §0.2 requires a native `<select>` with 7 `<option>`s, so the page has 9. The two requirements cannot both hold within A's ownership. A did not touch the frozen test and did not change the select.
  - Evidence that the render budget itself is unaffected: in a scratch copy of the working tree, the unmodified test fails only at :309 (`rb-scratch-unmodified.txt`, 6/7). The same file with **only** that query scoped to the listbox (`within(getByRole('listbox')).getAllByRole('option')`) is **7/7 green** (`rb-scratch-scoped-query.txt`).
  - Proposed fix for B/root: scope the query to the listbox.
  - Note: `render-budget-scratch-diagnostic.txt` from session 1 shows 7/7, but its setup could not be reconstructed. Treat the two session-2 files as the evidence.
- **GS7 green on the red run:** explained in §2.
- **A-R47-GROUP-LANE-DELTA:** §5 item 3; B decides.
- **REAL drag not produced by A** (CLI/CDP limits): §4.
- **Shell-written edits:** in session 2, `ArrangementLane.tsx` (lane default fix), `grid-snap-ui.test.tsx` (GS1 assertions, GS5b) and the doc 044 updates were applied through `node -e` exact-match replacement scripts, not the Edit tool. The project inject-primitives hook therefore did not fire for those writes. The primitive reads for these files are attributed to session 1's pre-flight (§1). `grid.ts`, `grid.test.ts` and doc 043 were edited with the Edit tool (the hook fired). Biome `--write` reformatted only A's own new lines; the diff stats were checked afterwards.
- **Self-check:**
  - No `any`, `@ts-ignore`, `as` assertions or `//` comments in the diff or the new tests; colours only via the `--color-outline-light` token and existing classes.
  - No new component exports; `ArrangementTransport.tsx` byte-identical; the context, model, selection, view and ruler are untouched (395 OK).
  - Edge cases: `adjacentGridLine` returns `null` at 0; there is no anchor when nothing is selected (no call); Snap read mid-drag; an empty `gridSeconds` keeps today's lane.
- **B acceptance items A actually ran green:** GM1–GM4; GS1–GS14 plus GS5b; mutations (a)–(l); tsc 0; build; Biome (2/218/1, 0 in owned files); 395 OK; protected 4/4; Transport identical; status = §3.2; dev-server Δ 0; toolbar 49 px (fresh 1440×900) and 87 px (resized 1280×720, not fresh); cell 224×28 at both.
- **Not passed:** G47-1 (render-budget:309) and `npm run verify` (exit 1).

## 8. Exact next C checks

1. G47-1 with recorded node.exe. Expect exactly 1 failure at `render-budget.test.tsx:309` (B-EXPECT-R47-RB). Re-run `track-layout` alone if the fold test times out.
2. R47-S: diff against the snapshots, and confirm the trim/range branches are byte-identical.
3. R47-U: GS5b and mutation (l) are new; also run C's own (j)/(k).
4. REAL-mouse drags (SN-OFF, SN-1, SN-025, SN-GROUP, SN-LANE, SN-SHIFT, SN-MID, SN-BLOCK, SN-VIDEO). A could not produce them.
5. LN-1: compare tick marks with line x. Lane-body left 512 = ruler left. A measured only tick **label** x (517, 557, …: +5 px label padding), not the tick lines.
6. UI-4 (G in the library search field), UI-5 (Space on the select), AU-1 decode, REG-TRIM and REG-RANGE (overlay `/30`), REG-HYD.

## 9. Scope completed

§0.1–§0.6 and §2.2–§2.4 are done, with the deviations above. The round is not self-marked complete. The backlog is not complete.
