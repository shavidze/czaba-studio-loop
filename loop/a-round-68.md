# A — Round 68 report: SRW-14 stage 5a fix (D-29z33): C-R67-01, C-R67-02, A-R67-REVIEW-L1

Implementer: A (Claude Opus 5.5) · Date: 2026-10-20 · Status: **implemented, awaiting C**. This report claims no PASS. `realVerified` (browser) belongs to C.

## 1. Pre-flight gate, baseline, red run

**Files read in full before the first edit** (also in `a-round-68/checkpoint.md`):
- `.claude/rules/read-primitives.md`;
- primitives `AGENT_DISCOVERABLE_CODE`, `REACT_CONTEXT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`;
- `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`, `skills/pre-flight/SKILL.md`, `.claude/primitives-map.json`.

The project hook also injected `FORWARDREF_COMPONENT`, `DESIGN_TOKENS` and `TAILWIND_FIRST` for the brace edit. No styling changed.

**Pre-flight gate:**
- **Assumptions:** §0.1 is exact. The whole-ms branches use the b5fb12b expressions with `GRID_TIME_TOLERANCE`. GU12 reaches 0.187 with a fractional px delta (−152.52 px at the harness 40 px/s); jsdom keeps it, so the drag assertion passes.
- **Smallest version:** about 45 source lines across 4 files, plus 6 appended tests.
- **Files:** only the 7 owned files (§3.1).
- **Success:** the red run fails exactly GM10–12 and GU12–14. After the change: vitest 95/1652, tsc 0, build 0, live-probe 0.188 / 0.125 / −0.037.

**Baseline (before edits):**

| Item | Result |
|---|---|
| HEAD | `b5fb12b9a6334c80e34dabd9bd94b6ce4184fc00` |
| `git status` | exactly the 7 round-67 lines |
| Frozen list | 431/431 OK |
| Snapshots | `SHA256SUMS` 7/7 OK; `cmp` 7/7 same |
| Protected files | 4/4 OK |
| Biome `./app` | 4 / 218 / 1 |
| `node.exe` | 7 |
| Servers | `:5173/studio-lab` 200; `:5199/api/products` 200 |
| EOL | every owned file 0 CR |
| live-probe | M1 0.25; L1 floor 0; L1 ceil −0.038 |

**Red run:**
- **In `store/`, tests added before any source edit** (`a-round-68/red-run.txt`): 6 failed, 20 passed. GM10 (0.25≠0.188), GM11 (0≠0.125), GU12 (0.25≠0.188), GU13 and GU14 (3.334≠3.333) failed on behaviour.
  - **GM12 failed on a fixture error:** my `loopArrangement` had no video track and `createArrangement` threw. That was my test bug, and I fixed it before any source edit.
- **Red again in scratch** (outside `store/`), with the four round-68 snapshot sources swapped in. Re-run on the **final** tests (`a-round-68/mut-red.log`, also at the end of `mutations.txt`):
  - **exactly GM10, GM11, GM12, GU12, GU13 and GU14 fail, all on behaviour.** GM12 fails with `{2, 3.334}` ≠ `{2, 3.333}`.
  - GM1–GM9 and GU1–GU11 stay green.

## 2. Diff per file (against the round-68 snapshots; all LF, 0 CR)

| File | +/− | Final CR/LF | sha256 prefix | Change |
|---|---|---|---|---|
| `app/lib/arrangement/grid.ts` | +77/−10 | 0/289 | `128cba81` | see below |
| `app/lib/arrangement/loop.ts` | +21/−2 | 0/192 | `d7d1269a` | see below |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | +7/−2 | 0/265 | `e57566a7` | see below |
| `app/contexts/ArrangementContext.tsx` | +3/−3 | 0/2906 | `8488f001` | see below |
| `__tests__/grid-musical.test.ts` | +193/−0 | 0/372 | `c565d89c` | see below |
| `__tests__/grid-musical-ui.test.tsx` | +99/−6 | 0/645 | `3b1f3ef3` | see below |
| `docs/implementation/2026/quarter-IV/060-…md` | +42/−1 | 0/144 | `0b56044a` | see below |

**`grid.ts`:**
- New private helpers: `storedGridLine` (= L(m)), `storedGridLineAtOrBelow`, `storedGridLineAtOrAbove` and `adjacentStoredGridLine`.
- `adjacentGridLine`: non-whole-ms steps go through the stored-line scan (§0.1(1)). The whole-ms branch is the b5fb12b text.
- `snapGroupDelta`: a non-whole-ms clamp branch (§0.1(2)). The whole-ms candidate is the b5fb12b text. The in-bounds early return and the final 1e-6 check are unchanged.
- `MUSICAL_GRID_INDEX_TOLERANCE` and `gridIndexTolerance` are removed.
- `snapTimeToGrid`'s musical branch calls `storedGridLine` (identical result).

**`loop.ts`:**
- `import { snapTimeToGrid } from './grid'` (no cycle: `grid.ts` imports types only).
- Private `isOnGridLine`.
- `moveLoop(arrangement, start, gridStep = null)` with the §0.1(4) branch and the `MIN_LOOP_LENGTH` guard.

**`ArrangementLoopBrace.tsx`:**
- The `resolveSnapStep` import.
- The pointer `moveLoop(…, resolveSnapStep(snapSeconds, gridSeconds, event.altKey))`.
- The Snap-on key path `stepLoopRange(kind, …, kind === 'move' ? snapSeconds : null)`.

**`ArrangementContext.tsx`:**
- The `stepLoopRange` interface line.
- The callback parameter `gridStep: number | null = null`, passed only in the `'move'` branch.
- The status text, history label and blocked message are byte-identical.

**`grid-musical.test.ts`:** helpers `storedLine`, `roundMs`, `loopArrangement`, plus GM10–GM12. GM1–GM9 are untouched.

**`grid-musical-ui.test.tsx`:**
- The type import was split over several lines (it adds `ArrangementLoop`).
- `musicalArrangement(clips, loop = null)` and `mountMusicalWorkspace(loop = null)`. Without `loop`, the arrangement object is the same as before.
- A `brace()` accessor (with `stubCapture`), `dragBraceBody`, `pressBraceKey`, `loopOf`, `expectLoop` and `GRID_LOOP_90`.
- GU12–GU14. GU1–GU11 are untouched.

**Doc 060:** the status line `Round 67–68 — D-29z32, D-29z33; C-ის შემოწმებას ელოდება`, plus the appended section „Round 68 — სიზუსტის შესწორება (D-29z33)“. Nothing else changed (the diff shows only `4c4` and `103a104,144`).

**`grid.ts` against `git show b5fb12b:app/lib/arrangement/grid.ts`** (`a-round-68/grid-vs-b5fb12b.diff`):
- **additions only**: hunks `10a11,48`, `19a58,60`, `45a87,111`, `46a113,115`, `66a136,147`;
- no b5fb12b line is removed or changed, so every whole-ms expression is byte-identical;
- the added code is the helpers, the `snapTimeToGrid` musical branch, and the two `isWholeMillisecondStep` early-outs.

**Removed lines in the test files (`diff -u` against the snapshots):**
- `grid-musical.test.ts`: none.
- `grid-musical-ui.test.tsx`: exactly 6, all in helpers and none inside an `it`:
  - `import type { Arrangement, ArrangementClip, WorkspaceCollection } …`
  - `function musicalArrangement(clips: ArrangementClip[]): Arrangement {`
  - `return { ...base, clips };`
  - `async function mountMusicalWorkspace() {`
  - `initialArrangement={musicalArrangement(MUSICAL_CLIPS)}`
  - `return { api, view, ruler, clipParts, laneBody };`

**`git status --short`:** exactly the 10 lines of §3.1. `ArrangementGridMenu.tsx`, `StudioWorkspace.tsx` and `grid-divisions.ts` are unchanged (frozen list 431/431 OK at the end).

## 3. New tests (alone durations, final tree)

| ID | Alone | What it asserts |
|---|---|---|
| GM10 | 60 ms | every §0.1 `adjacentGridLine` oracle row, including `(0.3, 60/999, +1)` = 0.36 and the GM7 rows. Sweep: 7 BPM × 6 divisions × every whole ms 0–10 s (≈420k inputs) against a brute-force stored-line scan (m from floor−3 to +4, 1e-9) |
| GM11 | 35 ms | the 2 new rows (0.125, −0.037), the 3 GM8 rows, and the floor sweep exactly as §2.2. Only out-of-bounds cases count; `clamped > 0` is asserted |
| GM12 | 13 ms | all 7 §0.1 `moveLoop` rows, including the guard row `{0.063, 0.126}`. **Plus 2 rows from the reviewer's Low 3:** `{1.333, 2.7}`→2 gives `{2, 3.367}`; `{1.333, 2.667}`→−1 gives `{0, 1.333}`. Sweep: 3 steps × k 0–200 × w (with `w·step ≥ MIN_LOOP_LENGTH`) × d; `checks > 0` asserted |
| GU12 | 175 ms | 120 BPM, Snap off, drag to `0.187`, `1/32`, `g`, select; arrows → 0.188, 0.25, 0.188, 0.125 |
| GU13 | 218 ms | 90 BPM `1/4`, Snap on, loop `{1.333, 2.667}`: +0.9 s → `{2, 3.333}`; Alt +0.7 s → `{2.7, 4.033}`. **Strengthened (mutation i survived without it):** Undo → `{2, 3.333}`, then Alt −0.667 s onto line 1.333 → `{1.333, 2.666}` (ms length kept) |
| GU14 | 124 ms | keys on the brace: → `{2, 3.333}` with status `Loop: 00:02.000 — 00:03.333.`; → `{2.667, 4}`; ← `{2, 3.333}`; Shift+→ end 4; `g` (Snap off) then → `{2.1, 4.1}` |

Each value is `toBeCloseTo(…, 9)` except where §0.1 says `toBe`. There is no regex, `.skip`/`.only`, retry or per-`it` timeout.

## 4. Mutations (`a-round-68/mutations.txt`; script `a-round-68/mut.mjs`)

- **Scratch:** `a-round-68/scratch/` (a copy of `app/`, with a `node_modules` junction and its own vitest config). Each mutation is restored after its run; the scratch was re-synced to the final tree and verified with `cmp` 6/6.
- **Test set:** 12 files, as §2.3 lists them. The unmutated run: 240/240 pass.

| # | Mutation | Killed by |
|---|---|---|
| a | non-whole-ms `adjacentGridLine` → round-67 0.000501 form | GM10, GU12 |
| b | reviewer's two-candidate form + mirror | GM7, GM9, GM10, GU5, GU12, GU14 |
| c | floor clamp → round-67 index form | GM11 |
| d | ceil clamp → round-67 index form | GM11 |
| e | `moveLoop` ignores `gridStep` | GM12, GU13, GU14 |
| f | grid end even with an edge off-line | GM12 + 10 frozen `grid-snap-loop-drop` SL/SK rows |
| g | brace pointer passes `null` | GU13 |
| h | `stepLoopRange` drops `gridStep` | GU14 |
| h2 | brace keys pass `null` | GU14 |
| i | brace pointer passes `snapSeconds` (Alt ignored) | GU13 (after strengthening; it **survived on the first run**, see §8) |
| m (extra, reviewer Low 3) | end-edge on-line check removed | GM12, SK2, SK4 |
| j (C extra, info) | whole-ms `adjacentGridLine` routed through the stored-line scan | **survives**, as expected (the values are equal) |
| k (C extra, info) | `moveLoop` on-line tolerance 1e-3 | **survives**: test gap, info for C/B |

On k: a whole-ms off-line edge is nominally ≥ 1 ms from a line, but the float difference can come out as 0.000999…. That is the only place 1e-3 behaves differently, which is why k survives. No §0.1 oracle row hits that boundary, so I did not add one.

## 5. Browser smoke (not a PASS claim)

- **Script and environment:** `a-round-68/smoke68.cjs`, standalone Playwright (installed chromium, fresh context, no install, headless), 1440×900, the existing `:5173` server. No gstack state file was used, because the smoke needed a REAL-mouse range drag (GSTACK-NO-MOUSE).
- **Logs:** `a-round-68/smoke-1440.txt` (final tree) and `smoke-1440-pre-low1.txt` (before the Low-1 loop change); screenshot `smoke-1440-brace.png`.

**Steps:**
- ENV-EXT-LOAD-HANG: the selector appeared after 3.5 s, then a 4 s wait.
- REAL drag-drop of `Middle East — საჯარო preview` onto music at 0.100.
- BPM 90 (REAL typing).
- `1/4` via the lane menu (REAL right-click + click); Snap via REAL `g` → `Snap ჩართულია — ბადე 1/4 (G)`.
- Zoom 40 px/s; a REAL-mouse range drag from raw 1.2 to 2.9 → `00:01.333 — 00:02.667`.
- Ctrl+L → `Loop 00:01.333 — 00:02.667`.
- A REAL click on the brace (active = `arrangement-loop-brace`, Undo title `Undo: Loop შეიქმნა`), then REAL ArrowRight.

**Readout:**
- `Loop 00:02.000 — 00:03.333`; status `Loop: 00:02.000 — 00:03.333.`; Undo `Undo: Loop-ის დიაპაზონი`.
- 168 requests: 0 forbidden (filter includes `r2-proxy` and `workers.dev`), 0 `Authorization` headers. 0 hydration messages, 0 page errors.
- Both runs (before and after Low 1) gave the same readout.

## 6. Code review (real `code-reviewer` subagent, on the diff against the snapshots)

**Score 8.5/10.** No Critical, High or Medium findings.

| Finding | Disposition |
|---|---|
| **L1:** non-finite `time` (Infinity) hung the candidate `for` loops, since `index++` on Infinity never ends | **Fixed** in `grid.ts`: bounded offset loops (`offset` 0..2 or +1..−1). The candidates, order and m<0 handling are unchanged. Scratch probe `a-round-68/inf-probe.ts`: `adjacentGridLine(Infinity, q, ±1)` → Infinity / null, NaN → NaN, `snapGroupDelta` with Infinity → 0, no hang. Mutations re-run afterwards |
| **L2:** the ceil clamp is covered by one oracle row only; dropping its first candidate would survive | **Not changed** (the spec defines GM11's sweep as floor-only). **Proposal for B:** a mirrored ceil sweep |
| **L3:** no test with an on-line start and an off-line end; no negative start with `gridStep` | **Fixed:** 2 GM12 rows, plus mutation m to show the new row kills the removed end check |
| **L4:** GU13's spec Alt step (to 2.7) cannot detect Alt being ignored | Already handled: the strengthened GU13 step (Undo, then Alt onto line 1.333). C should keep it |
| **L5:** the 1e-6 on-line tolerance is wider than 1 µs rounding; non-whole-µs loop values could differ from `msEnd` by 1 µs | No action: UI paths store whole ms |
| The forward fallthrough `storedGridLine(base + 3)` | The reviewer confirms B's bound makes it unreachable, and warns **not** to return `null` there (the brace maps `null` to −0.1 s). Kept |

**Architecture note (proposal for B/root, not implemented — ARCH-CHECKPOINT-SRW14-PREFS (b)):**
- **The issue:** rounds 65–68 each reworked `grid.ts` precision. Every helper now has a whole-ms branch and a stored-line branch.
- **The proposal:** one internal line-index model (`lineAt(index)` + floor/ceil index lookup) with whole-ms as a special case. It would keep GM6/GM9, the frozen `grid.test.ts` and the public signatures. It only applies once the byte-identity requirement for whole-ms is lifted.
- **New coupling:** `isOnGridLine` is a grid concept that now lives in `loop.ts`, because §0.3 limited the import to `snapTimeToGrid`. The same model would move it into `grid.ts`.
- **This round:** kept as is.

## 7. Command tails (final tree)

```
git rev-parse HEAD                      -> b5fb12b9a6334c80e34dabd9bd94b6ce4184fc00 (start and end)
git status --short | wc -l              -> 10 (the §3.1 lines)
sha256sum -c b-round-67-r68-tree-sha256.txt | grep -vc ': OK$' -> 0
protected-baseline                      -> download-routes.test.ts OK, account.downloads.tsx OK, api.studio-token.ts OK, studio.$productId.tsx OK
node --experimental-strip-types live-probe.ts
  M1 adj(0.187,1/32@120,+1) 0.188 snap 0.188
  999 1/4 adj(0.3,+1) 0.36
  L1 floor snapGroupDelta(0,0.1875,0.0625,-10,0.187) 0.125
  L1 ceil snapGroupDelta(0.1,-0.0697,0.0625,-0.069,10) -0.037
  GM7 0 2 100.667
npx tsc --noEmit                        -> rc 0
npx vitest run                          -> Test Files 95 passed (95); Tests 1652 passed (1652); 57.6 s
npm run build                           -> rc 0
npx biome check ./app                   -> Checked 373 files; Found 4 errors / 218 warnings / 1 info
                                           (errors = baseline CRLF list: auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts)
npx biome check <6 owned code/test files> -> Checked 6 files; no diagnostics
npm run verify                          -> rc 0 (lint 218 warnings / 1 info, vitest 95/1652, build ok)
                                           a-round-68/verify-final.txt; the first verify (before Low 1) was also rc 0 (verify.txt)
tasklist | grep -ci node.exe            -> 7 at start, 8 at end. The extra one is `node C:/therapy-notes-mcp/dist/index.js` (PID 3648, started 18:04), an MCP server of the harness, not started by A. No A process is left running; the dev server (PIDs 7252/17560) was untouched
curl :5173/studio-lab -> 200; curl :5199/api/products -> 200 (start and end)
```

No `npm run test:e2e:smoke` (root's). Verify did not run alongside a PW probe.

## 8. Deviations and honest notes

1. **The GM12 red failure in `store/` came from a fixture error** (no video track), not from the behaviour. I corrected the fixture and established the behavioural red run in scratch against the snapshot sources (all 6 fail on behaviour). Neither run changed source.
2. **GU13 has one extra step beyond the §2.2 wording**, because mutation i survived. The step is an Undo, then an Alt drag of −0.667 s onto line 1.333, asserting `{1.333, 2.666}`. The spec's steps and values are unchanged.
3. **GM12 has two extra oracle rows**, from the reviewer's Low 3, derived directly from §0.1(4): `{2, 3.367}` and `{0, 1.333}`.
4. **The `grid.ts` loop shape** (offset counter) was changed after review for non-finite safety. The candidate order is still exactly §0.1(1)/(2). The forward fallthrough `storedGridLine(base + 3)` is kept as the unreachable return value; it is not `null`, for the reason in §6.
5. **No spec-assumption stop:** every §0.1 oracle row passed as written.
6. **C's suggested extras j and k survive** (§4). k is a small test gap (info).
7. **Not done by A:** C's browser rows (FX-M1, GM-BRACE, GM-BRACE-ALT, GM-BRACE-KEYS, GM-BRACE-PLAY, GM-GROUP-CLAMP), the Ableton verdicts, G68-3 and R68-T. The smoke above is not a substitute.

## 9. Acceptance criteria A can honestly mark

- **§2.1 source per §0.1/§0.3: done.** Only the owned files changed.
- **§2.2 six tests appended: done**, with the extensions in §8. GM1–GM9 and GU1–GU11 are byte-identical.
- **§2.3 mutations a–i: all killed** (i after strengthening GU13).
- **§2.4 gates:** tsc 0, vitest 95/1652, build 0, Biome within baseline, owned files 0 diagnostics, verify rc 0, real code-reviewer run with findings addressed, smoke recorded.
- **§2.5 doc 060 amended.**
- **Not marked:** any C row (§4.x), the Ableton match, or the backlog/feature status. Rounds 67 + 68 are not commit-ready until C passes round 68.

## 10. Next C checks (exact)

1. G68-2 → R68-S: `diff -u` against the snapshots. Also diff the whole-ms expressions in `grid.ts` against `git show b5fb12b:app/lib/arrangement/grid.ts` (the reviewer could not run git).
2. R68-U: red run with the snapshots, mutations a–i (and j/k/l info), and alone durations.
3. G68-1 gates.
4. Browser rows §4.6 (FX-M1*, FX-M1-90, GM-BRACE*, GM-BRACE-ALT, GM-BRACE-KEYS, GM-BRACE-PLAY, GM-NUDGE, GM-GROUP, GM-GROUP-CLAMP best effort, GM-G1), then §4.7 (SN-REG, LB-REG, GM-KEYS-REG, REG-HYD), then G68-3.
5. **Extra suggestion:** a REAL Alt body drag that lands exactly on a line, from a `1.333 — 2.667` loop. The expected result is the ms length 1.334, not 1.333; this mirrors GU13's strengthened step.
