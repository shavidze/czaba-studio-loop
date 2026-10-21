# A — Round 51 report: SRW-14 stage 3b (FB-13): library drop and loop brace follow the grid

Implementer: A (Claude Opus 5.5) · Date: 2026-10-17 · Task: `current-task.md` (D-29z16) · Dev server: the existing `http://127.0.0.1:5173` (orchestrator override; not started or stopped by A).

I do not claim PASS. C verifies the round.

## 1. Pre-flight gate and baseline

**Pre-flight gate**
- **Read in full before the first edit:**
  - `.claude/rules/read-primitives.md`;
  - the primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and GEORGIAN_DOCS;
  - `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md` and `skills/pre-flight/SKILL.md`.
  - The project hook re-injected these primitives before the edits.
- **Assumptions:**
  - Baseline case (A) holds.
  - A ready library source is available through `beginLibraryDrag` in the live API, as `gesture-guard` does it.
  - jsdom rects are 0, so `clientX = time × 40` (40 px/s, checked through `arrangement-zoom-readout`).
- **Smallest version:**
  - Lane: 1 import and 1 wrapped expression.
  - Brace: 1 import, 2 optional props, 2 wrapped expressions and the key handler.
  - Workspace: 1 JSX element.
- **Files:** exactly the §3.1 list.
- **Success criteria:**
  - the new file is green;
  - the red run matches §2.2;
  - every mutation (a)–(m) fails its named test;
  - tsc 0;
  - full vitest = 85 / 1438 + N;
  - `npm run verify` exits 0.

**Baseline (before any edit): case (A)**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`.
- `git status --short` listed exactly the 7 round-50 paths.
- Frozen list: 0 mismatches.
- Snapshots: `SHA256SUMS.txt` 3/3 OK, and `cmp` reported all 3 owned files the same as their snapshots.
- Protected files: 4/4 OK.
- Biome `./app`: 5 errors / 218 warnings / 1 info (`a-round-51/biome-app-baseline.txt`; same as B's `gates.txt`).
- node.exe: 37.

## 2. Red run, mutations, green run

### Red run (`a-round-51/red-run.txt`)

The new tests ran against the 3 snapshot sources in scratch (`a-round-51/scratch`, outside `store/`; node.exe 37). The first version of the file had 22 cases.

**Result: 14 failed, 8 passed. This matches §2.2 exactly.**
- **Green:** SD1, SD3, SL1, SL3, SK1, SK4, SK7, and SL7.
  - **SL7 is green on the snapshot.** The raw start is 0.3 − 0.75 = −0.45. `moveLoop` clamps it to 0 with or without snapping, so the test checks the clamp, not the snap. It keeps B's fixture.
  - **SK4** is green because the old ±0.1 path is already blocked at 0.
- **Red:**
  - SD2, SD4, SD5;
  - SD6: the unsnapped ghost `00:06.200` fits, so the drop is not blocked;
  - SD7: the ghost text shows `00:09.400`;
  - SL2, SL4, SL5;
  - SL6: the end goes to 12.45;
  - SL8: the raw preview moves to 12.2;
  - SK2, SK3;
  - SK5: the first press gives 12.8;
  - SK6.

**Red run v2 (`a-round-51/red-run-v2.txt`), after the code-review strengthening in §5:** 16 failed, 7 passed, 23 cases. It differs from §2.2 only as expected:
- **SK7 is now red on the snapshot.** It now asserts the exact 13–14.8; the snapshot gives 12.4. Its second claim, that the clip stays at 4, holds on both.
- **The new SL9 is red.** The start edge goes to 11.75 on the snapshot.

### Mutations (`a-round-51/mutations.txt`; scratch copy; final run with the 23-case file)

Unmutated base: 23/23 passed.

| # | Mutation | Must fail | Failed |
|---|---|---|---|
| (a) | ghost snapped, drop unsnapped | SD2 | SD2, SD4, SD5, SD6 ✔ |
| (b) | drop snapped, ghost unsnapped | SD2 | SD2, SD4, SD6, SD7 ✔ |
| (c) | drop ignores Alt | SD3, SD4 | SD3, SD4, SD6 ✔ |
| (d) | Alt taken from the last stored `dragover` (ref) | SD5 | SD5 ✔ |
| (e) | brace move snaps the end | SL2 | SL2, SL4 ✔ |
| (f) | brace drag unsnapped | SL2, SL5 | SL2, SL4, SL5, SL6, SL8, SL9 ✔ |
| (g) | brace drag ignores Alt (2 sites) | SL3, SL4 | SL3, SL4 ✔ |
| (h) | snap applied after `resizeLoop` (no re-clamp) | SL6 | SL6 ✔ |
| (i) | keys stay ±0.1 with Snap on | SK2 | SK2, SK3, SK5, SK6, SK7 ✔ |
| (j) | keys step ± `snapSeconds` | SK2 or SK6 | SK2, SK3, SK6, SK7 ✔ |
| (k) | brace gets `snapSeconds={gridSeconds}` regardless of Snap | SL1, SK1 | SL1, SL4, SK1 ✔ |
| (l) | `target === null` → return | SK4 | SK4 ✔ |
| (m) | keys snap with Snap off using `gridSeconds` | SK1 | SK1 ✔ |
| (x1) | A extra (from review): start-edge resize unsnapped | SL9 | SL9 ✔ |

- No mutation survived.
- The scratch `node_modules` junction was removed with `cmd /c rmdir`; `store/node_modules` is intact (618 entries).
- The runner scripts are in `a-round-51/tools/`.

### Green run

- Store, 22 cases: 22/22 (`green-run.txt`).
- Final, 23 cases: 23/23 (`green-run-v2.txt`).

## 3. Diff summary per file (EOLs counted with node)

| File | Change | EOL |
|---|---|---|
| `ArrangementLane.tsx` | the `grid` import gains `resolveGridTime`; `libraryDropStart` returns `resolveGridTime(libraryDropTime({…unchanged}), snapSeconds, gridSeconds, event.altKey)`. Nothing else changed. | LF 927 / CRLF 0 |
| `ArrangementLoopBrace.tsx` | `grid` import (`adjacentGridLine`, `resolveGridTime`); optional `snapSeconds?: number \| null` (default `null`) and `gridSeconds?: number`, with the signature wrapped by Biome; in `handleLoopPointerMove` the move start and the resize edge go through `resolveGridTime(roundLoopTime(…), …, event.altKey)` before `moveLoop`/`resizeLoop`; in `handleLoopKeyDown`, Snap off or no loop takes the unchanged ±0.1 path, and Snap on uses `adjacentGridLine` from `getArrangement().loop`, falling back to `stepLoopRange(kind, -0.1)` when `null` | LF 260 / CRLF 0 |
| `StudioWorkspace.tsx` | only the `<ArrangementLoopBrace>` JSX: 1 line → 6 lines with `snapSeconds={snapEnabled ? gridSeconds : null}` and `gridSeconds={gridSeconds}`, edited by a node script with `\r\n` joins (`a-round-51/tools/edit-workspace.cjs`) | CRLF 1673 = LF 1673 (1668 + 5) |
| new `grid-snap-loop-drop.test.tsx` | 23 cases: SD1–7, SL1–9, SK1–7 | LF 681 |
| new doc `047-studio-lab-grid-snap-stage-3b.md` | per TEMPLATE, with the §4.9 table | LF 131 |

**Unchanged:**
- `beginLoopGesture`, `finishLoopGesture`, `endStaleLoopGesture` and the brace JSX.
- No new state, effect, listener, export or status text.
- The `+export function ArrangementLoopBrace({` line in `git diff` is the existing export, with its parameter list wrapped onto several lines.

The full diff against the snapshots is in `a-round-51/diff.txt`.

**Test harness notes:**
- The stubs are copied from `grid-snap-position.test.tsx`.
- `loadSource` returns 2 s for `hit` and 40 s for `song`, so SD6 can use a short SFX. Mount waits until both sources are ready.
- **SD6 fixture:** division 5, `s1` on SFX at 4–6, raw drop at 6.2.
  - Snapped to 5, the 2 s clip spans 5–7 and overlaps `s1` → refused.
  - With Alt it lands at 6.2 and fits.
- Drag events use the `DragEvent` stub from `track-layout`.
- `dataTransfer = { types: [LIBRARY_DRAG_MIME], files: [], dropEffect: 'none' }`.
- Undo is read from the button whose `title` starts with `Undo`.

## 4. Browser smoke (gstack, own state `a-round-51/a-browse.json`, `b.sh`; not a PASS claim)

- **Setup:** `/studio-lab` at 1440×900 loaded (200).
- **Snap toggle:** a REAL `g` set `data-snap` to `on`. The zoom readout showed `40 px/წმ`.
- **Brace part: not run (GSTACK-NO-MOUSE).**
  - The lab starts with no clips and no loop.
  - REAL Ctrl+A then Ctrl+L gave the status `Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.`.
  - A loop needs a body range, which needs a mouse drag; gstack has none.
  - C's LF fixture (PW) covers this.
- **Console:** only the known root `GET /api/cart` `ERR_CONNECTION_REFUSED` / "Failed to load cart".
- **Cleanup:** the `stop` command printed "Unable to connect", and no state file remains. A process scan at 13:34 found no browse, bun or headless-Chromium process started in the last hour. Only the user's own Brave and Codex processes were present, and they were not touched.
- **Log:** `a-round-51/smoke.txt`.

## 5. code-reviewer (real subagent, read-only), dispositions, Architecture note

The actual `code-reviewer` agent ran on `a-round-51/diff.txt` and the new test. Score 8.5/10. No Critical, High or Medium findings.

| Finding | Severity | Disposition |
|---|---|---|
| SK7 `toBeGreaterThan(12.3)` was weak; (i)/(j) were caught only through SK2/SK6 | Low | **Fixed (test):** SK7 now asserts `{13, 14.8}`; (i) and (j) now also fail SK7 |
| Start-edge snap is untested; a mutation that skips snap for `kind === 'start'` would survive | Low | **Fixed (test):** added SL9 (start edge −22 px → 12, status `Loop: 00:12.000 — 00:14.100.`). New mutation (x1) is killed by SL9 |
| SL7 does not tell snapping from clamping | Low | **Kept per B's fixture; stated in §2.** This test gap is open for B. A test that does tell them apart: loop 0.6–1.8, bar −10 px (raw 0.35 → line 0) |
| `toBeCloseTo(…, 9)` could be `toBe` | Info | Not changed. Not blocking |
| C's (n) (re-snap on `pointerup` from the release x) will probably survive, because no test releases at a different x or Alt than the last move | Info | Expected by §4.2. C records it as a test gap |
| A stale ghost if Alt changes after the last `dragover` without moving; native Windows Alt during an HTML5 drag | Info | Accepted (Q1, SD5). Tech Lead check R51-ALT-NATIVE-DRAG |
| The brace has no right-hand bound, so the end can pass `seconds` | Info | Already true before this round with ±0.1; not new. For B |

**Architecture note (for B; nothing done).**
- **What the reviewer flagged:** the brace is now the fourth component that receives the snap props (ruler, lanes, clips, brace), so `StudioWorkspace.tsx` passes the same snap values in four places.
- **Reviewer's verdict:** keep for now; the cost is low.
- **Where it belongs:** the existing **ARCH-CHECKPOINT-SRW14-PREFS**, which B already renewed. It is not a new task.
- **Alternatives considered:** re-snapping on `pointerup`, or snapping inside `loop.ts`. The reviewer kept the current approach: it is what you see is what you get, it matches clip move/trim, and the frozen libraries stay untouched.

## 6. Command tails (verbatim)

```
$ git rev-parse HEAD
038ed5a45f94596a264c14c4ec834607cb407948
$ git status --short
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/ArrangementLoopBrace.tsx
 M app/components/arrangement/ArrangementRuler.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
 M app/lib/arrangement/grid.ts
?? app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
?? docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md
$ sha256sum -c ../tmp/studio-real-loop/b-round-50-r51-tree-sha256.txt | grep -vc ': OK$'
0
$ (cd ../tmp/studio-real-loop/b-round-50-r51-snapshots && sha256sum -c SHA256SUMS.txt)
ArrangementLane.tsx: OK
ArrangementLoopBrace.tsx: OK
StudioWorkspace.tsx: OK
$ cmp loop (owned files vs snapshots)
app/components/arrangement/ArrangementLane.tsx changed
app/components/arrangement/ArrangementLoopBrace.tsx changed
app/components/arrangement/StudioWorkspace.tsx changed
$ protected
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ npx vitest run <18 frozen suites incl. the new file>   (node.exe 37; 22-case version)
 Test Files  18 passed (18)
      Tests  348 passed (348)
$ npx tsc --noEmit
(exit 0, empty)
$ npx vitest run   (node.exe 33; 22-case version, before the review strengthening)
 Test Files  85 passed (85)
      Tests  1460 passed (1460)
$ npm run build
✓ built in 4.70s   (exit 0)
$ npx biome check ./app
Checked 358 files in 807ms. No fixes applied.
Found 5 errors.
Found 218 warnings.
Found 1 info.
$ npx biome check ./app --diagnostic-level=error   (all 5 = the baseline CRLF format list)
app\components\arrangement\StudioWorkspace.tsx format
app\lib\__tests__\bug-hunting\auth-bugs.test.ts format
app\lib\arrangement\__tests__\grid.test.ts format
app\lib\arrangement\__tests__\render-budget.test.tsx format
app\lib\auth.ts format
$ npx biome check <new test> ArrangementLane.tsx ArrangementLoopBrace.tsx
Checked 3 files in 31ms. No fixes applied.
$ npx biome lint app/components/arrangement/StudioWorkspace.tsx
Checked 1 file in 35ms. No fixes applied.
$ StudioWorkspace LF copy (tr -d '\r') | biome format → cmp
WS LF copy: format no changes
$ npm run verify   (final, 23-case file; node.exe 40 at start)
 Test Files  85 passed (85)
      Tests  1461 passed (1461)
✓ built in 14.04s
✓ built in 6.02s
verify exit 0
$ tasklist | grep -ci node.exe
40
```

- **Full vitest, final:** 85 files / **1461 = 1438 + 23**, 0 failures. This is the run inside `npm run verify`, after the review strengthening.
- **Earlier standalone full run:** 1460 with the 22-case version.
- **Frozen suites after the change:** the 18-suite run above used the 22-case file. Only the new file changed afterwards, and it is 23/23.
- **Outputs:** everything is under `a-round-51/`: `tsc.txt`, `full-vitest.txt`, `frozen-suites.txt`, `build.txt`, `verify.txt`, `biome-*.txt` and `final-state.txt`.
- **Self-applied Biome fix:** `npx biome check --write` ran on my new LF test file only, for formatting (a function signature and an object literal). It was never run on `StudioWorkspace.tsx` or any other file.

## 7. Deviations and known gaps

1. **Two extra or stricter test cases** beyond §2.2, from the code review: SL9 (new) and a stricter SK7. The `it` count is therefore **23**, not 22, and the full-vitest target is 1438 + 23 = 1461. SK7 is red on the snapshot, where §2.2 expected green; the reason is in §2.
2. **Browser smoke: the brace part was not run** (GSTACK-NO-MOUSE; no keyboard path to a range). Only page load and the `g` toggle were exercised.
3. **A process incident during the run.** My helper command (`python3 - || node -e …`) hung. I identified its process tree by command line (the bash PIDs 31508 → 29984 → 49848) and stopped only that tree with `taskkill /T`. No other process was touched. The mutation script was then rerun from scratch and completed.
4. **Open test gap (Low, for B/C):** SL7 cannot tell snapping from clamping; see §5 for a fixture that can. C's (n) will probably survive.
5. **Pre-existing artifacts:** `a-round-51-result.json` (0 bytes) and `a-round-51-prompt.txt` were already there from 12:48, written by the loop runner. There was no `a-round-51/` directory, and `cmp` showed no partial edits. Nothing was duplicated or overwritten.
6. **Not done by A (as instructed):** `npm run test:e2e:smoke`, commits, pushes, installs.

## Acceptance criteria A actually checked (B's §2, not C's acceptance)

- §0.1–§0.3 implemented within ownership; `git status` matches §3.1 case (A); frozen list 0 mismatches; protected 4/4; no EOL churn.
- §2.2 tests written first; the red run matches the expectation, with every difference explained; all mutations (a)–(m), plus (x1), fail their named tests.
- §2.3: tsc 0; vitest 85 / 1461, 0 failures; build passes; Biome within baseline; owned LF files 0 diagnostics; `biome lint StudioWorkspace.tsx` 0; `npm run verify` exit 0; the real code-reviewer ran and its findings are dispositioned.
- §3.3 doc 047 written. It contains the Mermaid diagram, Q1–Q6, the §4.9 table, the PW/CDP method note and the TODO list.

## Exact next C checks

1. G51-2 → R51-S:
   - snapshot diffs: only the import and `libraryDropStart` in the lane; the import, props, move sample and key handler in the brace; only the brace JSX in the workspace, with CRLF 1673/1673;
   - frozen list and protected files;
   - `git status` as above.
2. R51-U:
   - re-run (a)–(m) and (x1) in C's own scratch;
   - C's (n): design a release at a different x; a survivor is a test gap (Low);
   - C's (o): ghost `left` raw while the text is snapped → expected to fail SD2.
3. R51-DROP (PW): LD-OFF, LD-1, LD-ALT / LD-ALT-ON (record `altKey` from a read-only `dragover` listener), LD-BLOCK (division 5, ~6.2 s), LD-VIDEO, LD-1280.
4. R51-LOOP (PW), using the LF fixture: LB-OFF, LB-MOVE, LB-ALT, LB-ALT-ON, LB-END, LB-CLAMP, LB-SAME, LB-1280. Also the start edge, which SL9 covers in units.
5. R51-KEYS (REAL `$B click` on the brace + `$B press`): LK-OFF, LK-1, LK-SHIFT, LK-ZERO, LK-025, LK-CLIP.
6. R51-PLAY (LP-LOOP, LP-LOOP-ALT, LP-DROP, LP-DROP-OFF), R51-REG / REG-HYD, G51-1, G51-3.

## Carried, for C/B follow-up (from `root-pre-push-review.md` and the task)

- **From `root-pre-push-review.md`:** the remaining findings RF3-1, RF3-2 and R5-L6 are still carried under C-R27-01 (Tech Lead quiet Chrome). A did not touch them this round.
- **From `publication-checkpoint.json`:**
  - Overall status: published at `1cefea1…`, both remotes verified.
  - Latest open list (`round49.open`):
    - C-R49-01 and C-R49-02: closed in round 50 per the task;
    - C-R48-01;
    - R49-T manual checks;
    - GSTACK-NO-MOUSE (pending methodology deviation);
    - ARCH-CHECKPOINT-SRW14-PREFS.
  - Older `remaining` notes:
    - round 38: real touch/double-click unverified; SSR C-R38-01; video sync;
    - round 40: C-R40-01 (disabled-reason clipping) — current status is for B;
    - round 41: C-R41-01.
  - Apart from C-R40-01, which B should confirm, nothing here is missing from the list below.
- **Still open:**
  - C-R48-01, C-R41-01, C-R6-02, C-R8-01, C-R23-01 and C-R38-01;
  - A-R50-REVIEW-CLIP-CANCEL-SEEK (→ stage 4);
  - R49-OUTWARD-TRIM-SHRINK and R49-WIDE-DIVISION-RANGE (→ stage 4);
  - ARCH-CHECKPOINT-SRW14-PREFS (renewed; the brace is its fourth consumer);
  - ABLETON-LOOP-KEYS-NOT-REQUESTED;
  - R51-T, including R51-ALT-NATIVE-DRAG.
- **Commit readiness:** for root to decide after C.
  - Round 51 adds 4 paths: `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, the new test and doc 047.
  - `StudioWorkspace.tsx` is shared with round 50, which is still uncommitted; HEAD is unchanged at `038ed5a`.
