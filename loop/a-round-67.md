# A — Round 67 report: SRW-14 stage 5a (FB-13) musical grid divisions, R14-G1 (D-29z32)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-20 · Status: implementation done; **not a PASS claim** — awaiting C.

Note: this session resumed an interrupted A run (attempts 1–5 ended on network/API errors). Earlier A work in this round (baseline, red run, source, tests, doc, mutations, smoke) was kept and inspected, not redone. This session added: tree re-check, code-reviewer, `npm run verify` with rc, and this report.

## 1. Pre-flight, baseline, red run

- **Pre-flight:** scope = §3.1 exactly; success = §2.2 counts (95/1646), mutations a–n killed, §2.4 gates. The earlier session's `checkpoint.md` records the baseline and the red run but **does not record** the §1 primitive/template reads, so I cannot verify them from here. This session edited no source or test file (only the report and checkpoint).
- **Static self-check (this session):** the 3 new files have no `.skip/.only/.todo/retry/vi.setConfig`, no per-`it` timeout (only the `describe` `{ timeout: 15_000 }`), no `any`, `@ts-`, non-null `!`, comments or regex assertions. The only `as` is `as const` (the module's table is `as const` per §0.3; the tests use it on two literal loop arrays).
- **Baseline (before edits, `a-round-67/checkpoint.md`):** HEAD `b5fb12b`, `git status --short` empty, frozen 431/431 OK, snapshots OK, protected 4/4 OK, servers 200/200, `node.exe` 7.
- **Re-check this session (end state):** HEAD `b5fb12b9a6334c80e34dabd9bd94b6ce4184fc00`; frozen list `grep -vc ': OK$'` → **0**; protected 4/4 **OK**; `:5173/studio-lab` **200**, `:5199/api/products` **200**; `node.exe` **7**.
- **Red run** (`a-round-67/red-run.txt`, both test files before any source): **2 files failed / 11 failed tests** — `grid-musical.test.ts` fails at import (`../grid-divisions` unresolved), all 11 GU rows fail.

## 2. Diff summary (EOL: CR / LF, counted with node)

| File | Status | CR / LF | Change |
|---|---|---|---|
| `app/lib/arrangement/grid-divisions.ts` | `??` new | 0 / 119 | Pure module, imports only `./grid` and `./tempo`. All §0.3 exports; `(beats * 60) / bpm`. |
| `app/lib/arrangement/grid.ts` | ` M` | 0 / 222 | Private `MUSICAL_GRID_INDEX_TOLERANCE = 0.000501`, `isWholeMillisecondStep`, `gridIndexTolerance`. Non-whole-ms branch at the top of `snapTimeToGrid`. 4 tolerance substitutions (`adjacentGridLine` ×2, `snapGroupDelta` floor/ceil ×2). In-bounds checks keep 1e-6. No signature changes. |
| `app/components/arrangement/ArrangementGridMenu.tsx` | ` M` | 0 / 219 | Props `divisions: readonly GridDivisionOption[]`, `checkedId`, `onChooseDivision(id)`. `Fragment` with one `<hr className="my-1 border-outline" />` before the first musical option. `formatGridDivision` import removed. |
| `app/components/arrangement/StudioWorkspace.tsx` | ` M` | 0 / 1920 | The ten §0.3 edits only (imports; seconds/musical state + derived `gridSeconds`/`gridDivisionId` + refs; `changeGridDivision(id)`; `toggleSnap` label; `changeTempo(null)` fallback; `stepGridDivision` via module; `GRID_NARROWEST/WIDEST_MESSAGE` removed; `chooseGridMenuDivision(id)`; select with optgroup and `gridDivisionTitle`; `data-grid-division`; menu props). No `gridSeconds=`/`snapSeconds=` prop site touched. |
| `app/lib/arrangement/__tests__/grid-musical.test.ts` | `??` new | 0 / 179 | GM1–GM9 (9 `it`). |
| `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` | `??` new | 0 / 552 | GU1–GU11 (11 `it`), one `describe` `{ timeout: 15_000 }`, harness copied (not imported) from frozen tests. |
| `docs/implementation/2026/quarter-IV/060-studio-lab-musical-grid-divisions.md` | `??` new | 0 / 103 | §2.5 sections. |

`git status --short`: exactly the 7 expected lines (3 ` M`, 4 `??`).

## 3. Tests — GM1–GM9, GU1–GU11, alone durations (`a-round-67/alone-durations.txt`)

Two new files alone: **2 files / 20 tests passed**, Duration 3.43 s.

| ID | ms | | ID | ms |
|---|---|---|---|---|
| GM1 | 2 | | GU1 | 285 |
| GM2 | 1 | | GU2 | 99 |
| GM3 | 1 | | GU3 (R14-G1) | 119 |
| GM4 | 1 | | GU4 | 77 |
| GM5 | 1 | | GU5 | 86 |
| GM6 | 0 | | GU6 | 61 |
| GM7 | 0 | | GU7 | 66 |
| GM8 | 0 | | GU8 | 99 |
| GM9 (property) | 70 | | GU9 | 180 |
| | | | GU10 | 46 |
| | | | GU11 | 52 |

No test > 3 s; GM9 well under 1 s. No spec-assumption stop was hit (every oracle row passed unchanged).

## 4. Mutations a–n (`a-round-67/mutations.txt`, `mut-run2.log`; scratch copy with `node_modules` junction, own vitest config, 12 files / 249 tests)

Unmutated: 12/12 files, 249/249. **All a–n killed**, every named test included:

| # | Failing tests (named ones in bold) |
|---|---|
| a | **GM6, GM9, GU4**, GM8 |
| b | **GM6, GM9**, GU4 |
| c | **GM7, GM9, GU5** |
| d | **GM8** |
| e | **GM6**, grid.test.ts GM1 ×2, GM3 tie row |
| f | **GM1, GM2, GU3**, GM5, GU2, GU4, GU5, GU6 |
| g | **GM3, GU1**, frozen grid-snap-menu GM1, GM7 (the frozen `grid-snap-ui` options row did *not* fail; the frozen menu rows did) |
| h | **GU7** |
| i | **GM4, GU8**, frozen grid-snap-keys GK3, GK11 |
| j | **GU6**, GU4, GU5 |
| k | **GU2**, GU7, GU9, frozen tempo-ui **U3**, U6, U8, U9 |
| l | **GU9** |
| m | **GM5, GU2**, GU8, GU9 |
| n | **GM5, GU8** |
| r1 (extra) menu family `<hr>` removed | GU9 |
| r2 (extra) seconds choice does not clear the musical state | GU7 |
| r3 (extra) menu `aria-checked` only for seconds | GU9 |

All four source files reported `restored=true` after the run. Deviation note: `grid-musical-ui.test.tsx` was last edited at 14:32, between mutation run 1 (14:26, a–n all killed) and run 2 (14:37, a–n + r1–r3 all killed); run 2 is on the final tree.

## 5. Browser smoke (gstack `/browse`, `:5173`, not a PASS claim)

Files: `smoke-1440.txt`, `smoke-2.txt`, `smoke-1440-bar.png`, `smoke-1440-1-32.png`, `smoke-1280-bar.png`, `smoke-1280-1-32.png`. Division chosen with **keyboard on the focused select** (REAL).

| Viewport | State | division / data-grid-seconds | options / optgroup | cell scrollW = clientW | select.right ≤ cell.right | chrome |
|---|---|---|---|---|---|---|
| 1440×900 | no BPM | `1` / `1` | 7 / none | 223 = 223 | 421.88 ≤ 512 | 64 |
| 1440×900 | BPM 120 | `1` / `1` (no auto-switch) | 13 / `ტაქტები · 120 BPM` | 223 = 223 | 438.88 ≤ 512 | 64 |
| 1440×900 | `1 ტაქტი` | `bar` / `2` (lane gradient 80 px) | 13 | 223 = 223 | 438.88 ≤ 512 | 64 |
| 1440×900 | `1/32` | `1/32` / `0.0625` (lines hidden title) | 13 | 223 = 223 | 438.88 ≤ 512 | 64 |
| 1280×720 | no BPM / `1 ტაქტი` / `1/32` / `0.5 წმ` | as above | 7 / 13 | 223 = 223 | ≤ 512 | 64 |

Statuses observed verbatim: `ბადე: 1 ტაქტი · 2 წმ 120 BPM-ზე (Snap გამორთულია)`, `ბადე: 1/32 · 0.063 წმ 120 BPM-ზე (Snap გამორთულია)`. No horizontal page overflow (`scrollWidth` = viewport). Console on load: only the known root `GET /api/cart` CORS error. Own browse state under `a-round-67/`; daemon stopped; `node.exe` back to 7.

## 6. code-reviewer (real subagent) — findings and dispositions

The real `code-reviewer` subagent ran on the diff vs the snapshots and §0.1/§0.3/§2.2. Score **8/10**. No Critical or High findings.

| # | Finding | Disposition |
|---|---|---|
| **M1** | **A defect in the spec rule (§0.1(9)), not an implementation deviation.** The fixed 0.000501 index tolerance in `adjacentGridLine` (`grid.ts:62/64`) assumes the input time is already on a stored line. From an off-line whole-ms time inside the window, the forward neighbour skips one line. Example at 120 BPM 1/32: `adjacentGridLine(0.187, 0.0625, 1)` = **0.25**, while `snapTimeToGrid(0.187, 0.0625)` = 0.188. Off-line inputs are real: clips kept in seconds after a BPM change, Snap-off/Alt drags, edge snaps. Callers are the Snap-on nudge and the loop-brace keys. | **Confirmed by A** with `a-round-67/m1-probe.ts` (node, against the live `grid.ts`). Over every whole-ms time 0–60 s × 7 BPMs × the non-whole-ms musical steps (1 500 000 inputs): **484 forward mismatches, 0 backward**. The expected value is the nearest stored line `round(k·step, 3)` strictly above/below. **Not changed in code:** §0.1(9) prescribes exactly this tolerance and R67-S checks for exactly 4 substitutions, so a fix would be an unapproved spec deviation. **Routed to B as a §0.1(9) amendment, proposed ID `A-R67-REVIEW-M1-ADJ-OFFLINE`, Medium.** Reviewer's fix (non-whole-ms branch only, O(1)): forward `k = floor(t/step)`, return `L(k) > t + 1e-6 ? L(k) : L(k+1)`; backward mirror; `L(k) = roundGridTime(k·step)`. Test gap: GM9 only starts from stored lines; add a ±2 ms whole-ms sweep. The §4.6 rows as written start on stored lines, so they are not expected to show it. A browser repro would need a clip at an off-line time such as 0.187 at 120 BPM 1/32 with Snap on, then ArrowRight (expected 0.188; the current rule gives 0.250). A has not run that in a browser. |
| L1 | Same class in `snapGroupDelta`'s floor branch (`grid.ts:84`): `anchorStart + high` just under a line → the candidate overshoots `high` by 1 ms, fails the in-bounds check, returns 0 instead of the reachable lower line. | **Confirmed by A:** `snapGroupDelta(0, 0.1875, 0.0625, -10, 0.187)` = **0** (0.125 is reachable). Needs a finite `maxDelta`. Not changed (spec rule). Routed to B with M1. |
| L2 | No test for the two guards (musical id with no BPM is a no-op; a select value outside the options is rejected). | Declined this round: §2.3 says "add no tests outside the list". No mutation survived to justify strengthening. Routed to B (Lows batch / next grid round). |
| L3 | No keyboard-navigation assertion across the family `<hr>` in the 13-item menu. | Declined (same rule). C's GM-MENU row checks ArrowDown across the boundary in the browser. |
| N1 | `bar` `beats: 4` is hardcoded rather than `TEMPO_BEATS_PER_BAR`. | Kept. §0.1(1) gives the table literally, and §0.3 limits the `./tempo` imports to `formatTempoBpm` and `tempoStatusMessage`. |
| N2 | `adjacentGridDivision` in `grid.ts` is now used only by the frozen `grid-snap-keys.test.tsx`. | Kept (`grid.ts` is frozen outside §0.1(9)). Backlog note for B. |
| N3 | GM2's 120 row uses `toEqual` on an array, and GM9 asserts `{count, first}`. | Noted. The values are numbers, so this is as strong as `toBe`. B decides if the exact form matters. |
| N4 | The menu's `activeIndex` could exceed `divisions` if the list shrinks while it is open. | Not reachable today: an outside press closes the menu before the BPM field can change. Info. |

**Architecture note (to B, not code):**
- Signal 3: the grid-control region of `StudioWorkspace.tsx` has changed in rounds 64–67, and 5b will change it again.
- Signal 4: this round adds two state values and four render-written mirror refs.
- Reviewer verdict: **keep for now**. Proposal after 5b: one local hook exposing exactly `gridSeconds`, `gridSecondsRef`, `gridDivisionId`, `changeGridDivision`, `stepGridDivision` and the tempo-change handling. Invariants: synchronous refs, not in history, no consumer prop site changes. GU1–GU11 and the frozen grid/tempo tests are the acceptance.
- This feeds ARCH-CHECKPOINT-SRW14-PREFS (a). Reviewer's alternative for (b): compare against stored lines instead of an index tolerance (the M1 fix).

## 7. Gates (actually run)

- `npx tsc --noEmit` → **0** (`tsc.txt` empty).
- `npx vitest run` → **95 files / 1646 passed, 0 failed** (`vitest-full.txt`, and again inside verify-2 on the final tree).
- `npm run build` → rc 0 (`build.txt`).
- `npx biome check ./app` (read-only) → **Found 4 errors / 218 warnings / 1 info** (= baseline CRLF list) (`biome-app.txt`).
- `npx biome check` on the 6 owned code/test files → **Checked 6 files, 0 diagnostics**.
- **`npm run verify` → rc=0** (`a-round-67/verify-2.txt`): agents:check, test:agents, lint (218 warnings, 1 info), typecheck, vitest **95/1646**, build. No PW probe in parallel. (`verify.txt` from the earlier session has no rc line; `verify-2.txt` is authoritative.)
- `tasklist | grep -ci node.exe` → **7**.
- Not run (root's): `npm run test:e2e:smoke`.

## 8. Deviations, known gaps, next C checks

- **Open spec issue (B):** A-R67-REVIEW-M1-ADJ-OFFLINE (Medium) and the L1 sibling. §0.1(9)'s fixed index tolerance skips a line when the input is off-line (484/1 500 000 forward cases, reproduced). Implemented as specified; a fix needs a B amendment of §0.1(9) plus an off-line sweep in GM9.
- **Deviations:** none from §0.3 found in my own diff read. `adjacentGridDivision` (seconds-only helper in `grid.ts`) is no longer imported by StudioWorkspace but stays exported (grid.ts may change only for §0.1(9)).
- **Mutation g:** the frozen `grid-snap-ui` options row did not fail; GM3, GU1 and two frozen `grid-snap-menu` rows did — the named GM3/GU1 kill it.
- **Not done by A:** every §4.6/§4.7 REAL-mouse row (GM-G1, GM-90, GM-POS, GM-TRIM-RANGE, GM-DROP, GM-BRACE, GM-NUDGE, GM-GROUP, GM-PLAY real audio, MT-SCRUB-INFO, SN/TB/MT/RU/REG-HYD), G67-3. These are C's.
- **Next C checks (in order):** G67-2 tree (7 lines, frozen 431/431, protected 4/4) → R67-S diffs vs snapshots → R67-U red run + a–n + extras o/p/q → G67-1 → §4.6 with GM-NUDGE, GM-KEYS, GM-TEMPO, GM-CLEAR and GM-LAYOUT first (precision and family rules), then GM-PLAY real audio → §4.7 → G67-3.
- **Acceptance criteria truly passed by A (offline only):** §2.2 counts (9 + 11, suite 95/1646), §2.3 a–n killed, §2.4 tsc/build/Biome/verify. R14-G1 is passed **only in jsdom (GU3)**; the browser R14-G1 row (GM-G1) is not run by A. Nothing here is a C PASS.
