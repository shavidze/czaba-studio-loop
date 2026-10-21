# A — Round 64 report: SRW-14 stage 4c-2: a library drop snaps to clip edges (D-29z29)

Implementer: A (Claude Opus 5.5) · 2026-10-19 11:51–12:08 +04 · Evidence: `a-round-64/`

**Status: implementation complete. Every A gate passed. Not a PASS claim:** all §4 acceptance rows belong to C, including the browser rows §4.6–§4.8 and G64-3.

## 1. Pre-flight, baseline, red run

**Pre-flight gate:**
- **Assumptions:** §0.1 is literal: steps 1–5, `''` as the exclusion, the lane `track.id`, and `dragged.duration`. `getLibraryDragSource()` is read before `dropLibrarySource`, which clears the ref.
- **Smallest version:** about 15 changed source lines in one function, its two call sites and the import line.
- **Files:**
  - `ArrangementLane.tsx`: the rule.
  - `grid-snap-loop-drop.test.tsx`: the SD6 grant and DE1–DE9.
  - doc 057.
- **Success criteria:**
  - the red run gives `4 failed | 32 passed (36)`;
  - the fixed file gives 36/36;
  - the full suite gives 89/1583;
  - tsc 0, build rc 0, verify rc 0, and 0 Biome diagnostics on the owned files.

**Primitives read:** `read-primitives.md`, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md` and `skills/pre-flight`. The hook also injected DESIGN_TOKENS and TAILWIND_FIRST.

**Baseline at 11:51 — case A:**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`.
- `git status --short` had **32** lines, matching the round-63 end state.
- Frozen list: 0 non-OK lines out of 422.
- Snapshots `SHA256SUMS.txt`: both OK. `cmp`: both owned files were the same as their snapshots.
- Protected files: 4/4 OK.
- `node.exe`: 6.
- Servers: **`:5173` 200** and **`:5199` 200**. Both were up for the whole A run; I neither started nor stopped them.

**Red run** (test file edited, source unmodified; `a-round-64/red-run.txt`): **`4 failed | 32 passed (36)`**. This is exactly the expected result. The failing assertions were:
- DE1: ghost `{text:'00:07.000'…}` received, `00:06.400` expected.
- DE2: `00:05.000` received, `00:05.300` expected.
- DE3: `00:05.000` received, `00:04.400` expected.
- DE6: `00:07.000` received, `00:06.400` expected.

SD1–SD7 (with the revised SD6), DE4, DE5, DE7, DE8 and DE9 passed.

I re-ran the red run on the **final** test file in scratch, with the snapshot `ArrangementLane.tsx` (`a-round-64/red-run-final.txt`). It gave the same result: 4 failed (DE1, DE2, DE3, DE6), 32 passed (36).

## 2. Diff per file (all LF, 0 CR)

| File | sha256 | Lines | Change |
|---|---|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | `9105781c` | 950 | See the list below. Patch: `a-round-64/diff-lane.patch`. |
| `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | `fe3e8702` | 893 | SD6 first half: only the two calls `dragLibraryOver(…sfx, 6.2)` and `dropLibrary(…sfx, 6.2)` changed to 4.6; the assertions, the title and the Alt half (`6.2, true`) are unchanged. Added the `DROP_EDGE_FIXTURE` constant right after `DROP_FIXTURE_IDS`. Added the new `describe('SRW-14 stage 4c-2 library drop snaps to clip edges (D-29z29)', { timeout: 15_000 }, …)` with DE1–DE9 right after the stage-3b library-drop describe. 36 `it`. Patch: `a-round-64/diff-test.patch`. |
| `docs/implementation/2026/quarter-IV/057-studio-lab-grid-library-drop-edges.md` | `ed8f808e` | 115 | New. Georgian, with the sections listed in §2.5. The Ableton table includes the "C check" column from §0.2. |

**`ArrangementLane.tsx` changes:**
- The `ArrangementContext` import gains `type LibraryDragSource`.
- The grid import becomes `clipEdgeTargets, gridLinesVisible, resolveSnapStep, snapMoveStartToGridOrEdges, snapTimeToGrid`. `resolveGridTime` is removed; there are 0 remaining uses.
- `libraryDropStart(event, dragged)` follows §0.1 steps 1–5.
- `handleLibraryDragOver` passes its existing `dragged`.
- The `handleDrop` library branch now reads `const dragged = getLibraryDragSource();` before calling `dropLibrarySource(track.id, libraryDropStart(event, dragged))`.
- Nothing else changed.

**Frozen files after the change:** `grid.ts` is still `5341cd83` and `ArrangementClip.tsx` is still `97a1bf79`.

## 3. SD6 and DE1–DE9, each with its alone duration

`grid-snap-loop-drop` run alone (`a-round-64/alone-owned-test.txt`): **36 passed (36)**, total 3.09 s.

| Test | ms |
|---|---|
| SD6 | 58 |
| DE1 | 44 |
| DE2 | 36 |
| DE3 | 38 |
| DE4 | 36 |
| DE5 | 32 |
| DE6 | 33 |
| DE7 | 36 |
| DE8 | 37 |
| DE9 | 41 |

No single test took more than 3 s. Every §2.2 assertion is present verbatim. The ghost `left` strings were exact (`256px`, `212px`, `176px`, `200px`, `280px`), so no float-formatting stop was needed.

## 4. Mutations a–i

Scratch: `a-round-64/scratch/` (a copy of `app/`, a `node_modules` junction and my own `vitest.config.mts`). The script is `a-round-64/mut.mjs`; the results are in `a-round-64/mutations.txt`.

Files run: `grid-snap-loop-drop`, `track-layout`, `gesture-guard`, `grid-snap-ui`. Unmutated: **111/111** passed. After the run both scratch files were restored and identical to `store/`.

| # | Mutation | Result | Killed by |
|---|---|---|---|
| a | edge path replaced by grid only | 4 failed | DE1, DE2, DE3, DE6 ✔ |
| b | `clipEdgeTargets(…, '', '')`, so the lane is not the drop lane | 1 failed | DE4 ✔ |
| c | a not-ready source uses edges with duration 0 | 1 failed | DE5 ✔ |
| d | the video lane uses edges | 1 failed | DE9 ✔ |
| e | `endEdges` → `[]` | 2 failed | DE2, DE3 ✔ |
| f | `handleDrop` passes `null` as the source | 4 failed | DE1, DE2, DE3, DE6 (drop assertions; the ghost path is unchanged) ✔ |
| g | edges used even when `step === null`, with step `snapSeconds ?? 1` | 6 failed | DE7 ✔, plus SD1, SD3, SD5, SD6, DE8 |
| h | Alt ignored (`resolveSnapStep(…, false)`) | 6 failed | DE6 ✔, plus SD3, SD4, SD5, SD6, DE7 |
| i | SD6's first half set back to 6.2 on the fixed source | 1 failed | SD6 ✔ (the narrow grant was needed) |
| j (extra, info) | edge targets taken only from the drop lane's clips | 1 failed | DE3 |

There were no survivors, so no test needed strengthening. After the whitespace-only Biome re-indent (§8), I re-ran the whole set on the final test file and got the same results.

## 5. Browser smoke (gstack; not a PASS claim)

Evidence: `a-round-64/smoke.txt` and `smoke-1440.png`. Browse state: `a-round-64/a-browse.json`.
- `/studio-lab` at 1440×900 returned 200, and `arrangement-grid-division` appeared.
- 4 lanes rendered, the grid control was present, and the demo badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება` was visible.
- Network: 163 requests. The only API call was `GET http://localhost:5199/api/cart` (pending), which root allows. There were no requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2.
- I ran `browse stop` on my own server afterwards. The CLI printed "Unable to connect". At 12:10 I checked that the server had exited:
  - the `a-browse.json` state file no longer exists;
  - `Get-CimInstance Win32_Process` shows no browse, bun or server-node process.
- I killed no process.
- I did not do any drag in the browser. GSTACK-NO-MOUSE applies, and the §4.6–§4.8 rows are C's.

## 6. Code review (real `code-reviewer` subagent, read-only)

**Verdict:** no Critical, High or Medium findings; score 9/10. The reviewer confirmed:
- §0.1 steps 1–5 are implemented as specified;
- `''` is a safe exclusion;
- the lane rule is applied on `track.id`;
- `dragged` is read before `dropLibrarySource` clears the ref (argument evaluation order);
- `getArrangement()` is the same `historyRef.current.present` that `dropLibrarySource` checks, so the ghost and the drop agree;
- imports are clean and there are no banned patterns;
- DE1–DE9 discriminate the mutations.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| R1 | Low | No unit test has a winning **edge** candidate that is blocked; DE4 and SD6 are grid-wins. | **To B.** It would add a test outside the §2.2 list, which §2.3 forbids unless a mutation survives, and none did. C's LD-BLOCK-REG can pick a browser case where an edge wins and is blocked. Proposed ID: A-R64-REVIEW-BLOCKED-EDGE-WIN (Low). |
| R2 | Low | No test has Alt on dragover but not on drop on the edge path (an SD5 analogue). SD5 already covers the shared line. | **To B**, Lows batch: A-R64-REVIEW-SD5-EDGE (Low). |
| R3 | Info | An edge candidate of about −1e-7 could round to 0 µs and pass the `< 0` filter in `nearestGridOrEdge` (`grid.ts:154`). The reviewer found no reachable path, because near 0 the grid line is already 0. If it were reached, `canPlaceLibraryClip` would refuse it with a red ghost. This is behaviour shared with clip moves. | **To B.** `grid.ts` is frozen. The reviewer suggests clamping with `Math.max(0, …)` in a future grid round. |
| R4 | Info | `getArrangement()` is called twice per dragover. It is a cheap ref read. | No action. |

**Architecture note:** none. No new state, effect or ref, and ownership did not move.

## 7. Command tails (verbatim; full output in `a-round-64/`)

```
$ npx tsc --noEmit                      → exit 0
$ npx vitest run (vitest-full.txt)      → Test Files  89 passed (89) | Tests  1583 passed (1583) | Duration 82.18s ; "Test timed out" count 0
$ npm run build (build.txt)             → rc 0
$ npx biome check ./app (biome-app.txt) → Checked 363 files … Found 5 errors. Found 218 warnings. Found 1 info.
$ npx biome check <2 owned files>       → Checked 2 files in 30ms. No fixes applied.   (0 diagnostics)
$ npm run verify (verify.txt)           → rc 0 ; agents:check pass ; Test Files 89 passed (89) ; Tests 1583 passed (1583) ; ✓ built in 9.13s / ✓ built in 2.92s
$ targeted 4 files (fixed-run.txt)      → Test Files 4 passed (4) | Tests 111 passed (111)
$ end state (end-state.txt, 12:07)      → HEAD 038ed5a4… ; git status --short 33 lines (32 + "?? docs/…/057-studio-lab-grid-library-drop-edges.md") ;
                                          frozen 422: 0 non-OK ; protected 4/4 OK ; grid.ts 5341cd83 ; ArrangementClip.tsx 97a1bf79 ;
                                          node.exe 7 ; 5173=200 ; 5199=200
```

**`node.exe` 6 → 7, reconciled at 12:10 with `Get-CimInstance`:**

| PID | Process | Started |
|---|---|---|
| 21600, 22796 | therapy-notes-mcp | 10:02, 11:50 |
| 21740, 21848 | Codex cua `server.mjs` | 10:02 |
| 7252, 17560 | the `:5173` Remix dev server (npx and cli) | 11:50 |
| **21252** | **`firebase-tools … firebase.js login`** | **11:58** |

- PID 21252 is the added process. A and its tools did not start it, so I left it running.
- None of these processes is mine.

`npm run verify` ran once, quietly. Nothing else ran in parallel except the read-only code-reviewer subagent, which only reads files.

## 8. Deviations

- **Biome re-indent.** The first version of the new `describe` header was longer than the line width, which gave 1 format error on the test file (Biome `./app` showed 6 errors). I re-wrapped the block by hand into the multi-line `describe(\n  '…',\n  { timeout: 15_000 },\n  () => {` form that SL10's describe already uses. I did not use `--write`. The change is whitespace only, and the title and options are verbatim from §2.2. After the re-wrap I re-ran the red run, mutations a–j, the targeted run, the full vitest suite and verify.
- **Smoke port.** The smoke used `:5173`, as the orchestrator override requires.
- Nothing else deviated: no install, commit, stash or format, and no process started or stopped other than my own browse server.

## 9. Scope completed and what remains (honest)

**Done by A:**
- §0.1 and §0.3 source;
- §2.2 tests;
- §2.3 mutations a–i, all killed;
- §2.4 self-check, Biome, review, verify and smoke;
- §2.5 doc 057.

**Not claimed:** any §4 acceptance row. `browserVerified` is C's call.

**Exact next checks for C** (§4 order):
1. **G64-2 tree:** status 33 lines (case A); frozen 422 OK; protected 4/4 OK; hashes `5341cd83`, `7e686c0f`, `785f521d`, `1fd9c70b` unchanged.
2. **R64-S static:** `diff -u` against the snapshots; `asteq-it` with only SD6's two literals changed; `DROP_EDGE_FIXTURE` is the only new top-level constant; LF; doc 057 sections; literal check.
3. **R64-U:** red run, then mutations a–i in C's own scratch, plus extras j and k.
4. **G64-1:** tsc, vitest 89/1583, build, Biome, verify.
5. **§4.6:** the carried round-63 browser rows, first: GE-OOB-STATUS*, GE-OOB-PLAY, GE-BOUNDS-REG, GE-START-REG*, GE-CROSS-REG, GE-ALT-ENABLE*, GE-CROSS-OOB (info).
6. **G64-3:** network, the sign-in gate, and the token rows 401/403 (the backend was up at 12:07).
7. **§4.7:** LD-EDGE*, LD-EDGE-END, LD-OTHER, LD-ALT-ENABLE*, LD-ALT-BYPASS and LD-BLOCK-REG. If possible, LD-BLOCK-REG should use a case where an edge candidate wins and is blocked, which covers R1. Then LD-VIDEO-REG and LD-PLAY.
8. **§4.8:** the INFO-R62-LIB-LOADING-DROP probe.

**Carried for B and root (unchanged by this round):**
- **`root-pre-push-review.md`:**
  - video sync RF3-1, RF3-2 and R5-L6 (C-R27-01) are open;
  - M1: the loop refill is rAF-only, so a hidden tab goes silent;
  - M2: the per-frame `position` in the context value re-renders every consumer;
  - Lows L1–L4 and L6–L8.
- **`publication-checkpoint.json`:**
  - SRW-21: the purchased loader hardcodes `middle-east`;
  - portable instruction paths;
  - the SRW-23 scrollbar check at 1280×720 and 1440×900;
  - SRW-11/12 library and stems parity;
  - T12.
- **Root:**
  - ARCH-CHECKPOINT-SRW14-PREFS (§6.3);
  - INFO-R61-FAKEBEARER-500;
  - the env gate request (§6.1).
- **Scratch:** `a-round-64/scratch/` holds a `node_modules` junction. Root decides whether to remove it; I deleted nothing.
- **Commit readiness:** round 64 is not ready until C passes it.
