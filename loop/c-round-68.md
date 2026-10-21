# C — Round 68 verification: SRW-14 stage 5a fix (D-29z33): C-R67-01, C-R67-02, A-R67-REVIEW-L1

Verifier: C · Date: 2026-10-20 (18:18–18:40 +04) · **Verdict: PASS** · `browserVerified: true` (every REAL-browser row of §4.6, §4.7 and G68-3 ran; GM-GROUP-CLAMP also ran and passed).

## 0. Summary
- **All three bugs are fixed in the real browser:**
  - **C-R67-01:** with Snap off, I dragged a clip to 0.187 (120 BPM, 1/32). The arrow nudges now give **0.188 → 0.250 → 0.188 → 0.125** at both 1440×900 and 1280×720.
  - **C-R67-02:** a brace body move keeps the loop length in grid lines: **2.000—3.333, 2.667—4.000, 4.667—6.000**.
  - **A-R67-REVIEW-L1:** the group clamp puts the anchor on line **0.063** and the other clip at **0.032**.
- **Offline:**
  - The red run on the snapshot sources fails exactly GM10–12 and GU12–14.
  - My own mutations a–i are all killed.
  - tsc 0. Biome is at the 4/218/1 baseline, and the 6 owned code/test files have 0 diagnostics.
  - `npm run verify` rc 0 on the first attempt, with **95 / 1652**.
- **Tree:** HEAD `b5fb12b` at start and end. `git status` has 10 lines. Frozen 431/431, protected 4/4. The owned files did not change during my run.
- **Purchase protection holds:** a fresh anonymous context opens the demo workspace, `/studio/middle-east` asks for sign-in, and the token endpoint answers 401 anonymous and 403 with a fake Bearer.
- **Commit readiness:** rounds 67 + 68 are C-verified and ready as one unit for root's gate (verify, review, commit, push). Tech Lead manual checks R67-T and R68-T are still open.

## 1. Environment
- `env-status.json`: 2026-10-20T14:18:01Z, round 68, backend 200, store 200.
- **My checks:**

  | When | `:5173/studio-lab` | `:5199/api/products` | `node.exe` |
  |---|---|---|---|
  | Start (18:18) | 200 | 200 | 8 |
  | After the offline items (~18:25–18:33) | up: every PW and gstack page loaded with HTTP 200 (no curl run at that moment) | up: the token endpoint answered 401/403 through the store | 8–15 |
  | End (18:35) | 200 | 200 | 8 |

  During the mutation runs and PW pages, `node.exe` peaked at 15.
- **Browser tools:**
  - Standalone Playwright (installed chromium, fresh context per page, headless), labelled **REAL-mouse (PW)**. The scripts are `c-round-68/tools/g68.cjs` plus the round-67 copies (`gb67/ge67/ga67.cjs`, logs prefixed `gb68/ge68/ga68`).
  - gstack `browse` with a fresh state file `c-round-68/c-browse.json`, for G68-3. At the end, `browse stop` answered "Unable to connect": the daemon was already gone or unresponsive (cf. ENV-BROWSE-DAEMON), and the state file no longer existed. `node.exe` was back to 8, and I left no browse process running.
- **ENV-EXT-LOAD-HANG:** every page waited for `domcontentloaded`, then the workspace selector (3.4–3.9 s), then 4 s.
- **INFO-R62-GEPLAY-UNDO:** the Undo title is recorded before every Ctrl+Z (runs logs).
- **Forbidden-host filter:** every page script, regression copies included, uses `studio-token|recording-|/api/download|r2.cloudflarestorage|r2.dev|r2-proxy|workers.dev`.

## 2. G68-2 — tree: PASS
- HEAD `b5fb12b9a6…` at start and end.
- `git status --short` has exactly the 10 §3.1 lines.
- Frozen list: 0 not-OK. Snapshot `SHA256SUMS` 7/7 OK. Protected 4/4 OK.
- The owned sha prefixes are equal at start and end (`gates/owned-sha-start.txt`): `128cba81`, `d7d1269a`, `e57566a7`, `8488f001`, `c565d89c`, `3b1f3ef3`, `0b56044a`. They match A's report.

## 3. R68-S — static: PASS (`gates/src-diff.txt`)

**`grid.ts`:**
- New: `storedGridLine`, `storedGridLineAtOrBelow`, `storedGridLineAtOrAbove` and `adjacentStoredGridLine`.
- `MUSICAL_GRID_INDEX_TOLERANCE` and `gridIndexTolerance` are removed.
- Two `isWholeMillisecondStep` early-outs.
- The candidate order matches §0.1(1)/(2):
  - forward: floor, +1, +2;
  - backward: ceil, −1, −2, `null` when m < 0;
  - floor clamp: floor+1, floor, floor−1;
  - ceil clamp: max(0, ceil)−1, then +1, +2.
- **Against `git show b5fb12b`:** additions only (`10a11,48 19a58,60 45a87,111 46a113,115 66a136,147`). No b5fb12b line was removed or changed, so the whole-ms expressions and the `snapTimeToGrid` whole-ms branch are byte-identical. The musical `snapTimeToGrid` branch now calls `storedGridLine` with the same formula.

**`loop.ts`:** only the `snapTimeToGrid` import, a private `isOnGridLine` (1e-6), and `moveLoop(…, gridStep = null)` with the §0.1(4) branch and the `MIN_LOOP_LENGTH` guard.

**`ArrangementLoopBrace.tsx`:** only the `resolveSnapStep` import, the pointer `moveLoop` third argument, and the key-path third argument `kind === 'move' ? snapSeconds : null`.

**`ArrangementContext.tsx`:** only the `stepLoopRange` interface line, the callback parameter, and `gridStep` passed in the `'move'` branch. The status text, history label and blocked message are unchanged.

**Tests:**
- `grid-musical.test.ts` removes no line.
- `grid-musical-ui.test.tsx` removes 6 helper lines and no `it`.
- **The round-67 `it` regions are byte-identical:** the text from `it('GM1` and `it('GU1` up to the end of the old last `it` appears verbatim in the new files, followed only by GM10–12 and GU12–14. Diff hunks: in the UI file, all old-file ranges are below line 340 (helpers, before GU1) or at 549+ (after GU11, appended); in `grid-musical.test.ts`, at 13 (helpers) and 174+ (after GM9, appended).
- No `any`, `@ts-ignore`, comments, hex colours, `.skip/.only/.todo`, retry, `vi.setConfig` or per-`it` timeouts.
- `as const` appears in the new loops. Round 67's file already had it and 9 other test files use it (info, not counted as a type assertion).

**EOL:** every owned file has 0 CR. Doc 060 has the new status line `Round 67–68 — D-29z32, D-29z33; C-ის შემოწმებას ელოდება` and the section „Round 68 — სიზუსტის შესწორება (D-29z33)“; nothing else changed.

## 4. R68-U — unit and mutation: PASS

My own scratch: `c-round-68/scratch` (a copy of `app/`, a `node_modules` junction, my own vitest config). After the run, scratch == store (`diff -rq` clean).

**Red run** (`gates/red-run.txt`), with the round-68 snapshots of the 4 sources swapped in: **exactly GM10, GM11, GM12, GU12, GU13 and GU14 fail, all on behaviour; 20 pass.**
- GM10: 0.25 ≠ 0.188.
- GM11: 0 ≠ 0.125.
- GM12: `{2, 3.334}` ≠ `{2, 3.333}`.
- GU12: 0.25 ≠ 0.188.
- GU13 and GU14: 3.334 ≠ 3.333.

**Mutations:** my own forms in `tools/muts68.cjs`, run over 13 files (279 tests; `mut/mutations.txt`). The unmutated run: 279/279 pass.

| # | Mutation | Killed by |
|---|---|---|
| a | non-whole-ms `adjacentGridLine` back to the round-67 0.000501 form | GM10, GU12 ✔ |
| b | the reviewer's two-candidate form + mirror | GM7, GM9, GM10, GU5, GU12, GU14 ✔ |
| c | floor clamp back to the round-67 form | GM11 ✔ |
| d | ceil clamp back to the round-67 form | GM11 ✔ |
| e | `moveLoop` ignores `gridStep` | GM12, GU13, GU14 ✔ |
| f | start on-line check removed (grid end with an off-line start) | GM12 ✔ |
| f2 | end on-line check removed | GM12, SK2, SK4 ✔ |
| g | brace pointer passes `null` | GU13 ✔ |
| h | context drops `gridStep` | GU14 ✔ |
| h2 | brace keys pass `null` | GU14 ✔ |
| i | brace pointer passes `snapSeconds` (Alt ignored) | GU13 ✔ (A's strengthened step) |
| j (info) | whole-ms `adjacentGridLine` routed through the stored-line scan | survives: the values are equal, as B expected |
| k (info) | `moveLoop` on-line tolerance 1e-3 | **survives**: test gap, info (A saw the same) |
| l (info) | brace keys pass `snapSeconds` for `'end'` too | survives: an equivalent mutant, because the context ignores `gridStep` for the edges |
| q (C extra) | ceil-clamp first candidate dropped (reviewer L2) | GM8, GM11 ✔. Killed in my form; A's reviewer reported a variant surviving. Info |
| r (C extra) | forward fallthrough `base+3` → `null` | survives: unreachable by B's bound (info) |
| s (C extra) | `MIN_LOOP_LENGTH` guard removed | GM12 ✔ |

**Durations alone** (`gates/alone-durations.txt`): GM10 71 ms, GM11 40 ms, GM12 11 ms, GU12 107 ms, GU13 128 ms, GU14 105 ms. All are well under 2 s. The two files take 4.22 s in total.

**live-probe.ts** (`gates/live-probe.txt`): M1 **0.188**, 999 BPM 1/4 0.36, L1 floor **0.125**, L1 ceil **−0.037**, GM7 0 2 100.667.

## 5. G68-1 — gates: PASS
- `npx tsc --noEmit`: rc 0.
- **Biome `./app` (read-only):** 373 files, **4 errors / 218 warnings / 1 info**. The errors are the baseline CRLF format list: `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`.
- **The 6 owned code/test files:** no diagnostics.
- **`npm run verify`, attempt 1: rc 0.** Test Files 95 passed, **Tests 1652 passed**, build ok (`gates/verify1.txt`). No PW probe ran in parallel. `node.exe` was 8 before and after.

## 6. §4.6 browser rows — fresh `/studio-lab`, 1440×900 (starred rows also at 1280×720)

Pages, one row group each (`runs/`):

| Run file | Rows on that page |
|---|---|
| `g68-1440x900-m1.txt`, `g68-1280x720-m1.txt` | FX-M1 |
| `g68-1440x900-m190.txt` | FX-M1-90 |
| `g68-*-brace-bdt*.txt` | GM-BRACE, one fresh page per distance: 0.9, 1.6 and 3.05 at 1440; 0.9 at 1280 |
| `g68-1440x900-alt.txt` | GM-BRACE-ALT |
| `g68-1440x900-keys.txt` | GM-BRACE-KEYS, then GM-BRACE-PLAY on the same page |
| `g68-1440x900-clamp-try3.txt` | GM-GROUP-CLAMP |
| `gb68-1440x900-g1_p90.txt` | GM-G1 on its own page; GM-90, GM-NUDGE, GM-GROUP, GM-SNAPOFF and GM-UNDO-H on a second page |

| ID | Result | Evidence |
|---|---|---|
| **FX-M1*** | **PASS** at 1440 and 1280 | Soft impact on SFX, BPM 120, Snap off, zoom 320 px/s. A REAL-mouse (PW) fractional drag (dx −580.16 px) put the start at `0.187`. Then `1/32` from the lane menu (REAL right-click + click), `g`, and a click on the clip. The Undo title before the first key was `Undo: კლიპის გადატანა`. REAL → → ← ← gave **0.188, 0.250, 0.188, 0.125** at both viewports. Shots `fx-m1-*.png` |
| **FX-M1-90** | **PASS** | BPM 90, `1/4`, Snap off, max zoom. Drag to **1.332**, Snap on, → gives **1.333**. Snap off, drag to **1.334** (via 1.834), Snap on, ← gives **1.333** |
| **GM-BRACE*** | **PASS** (4/4) | Middle East on music, 90 BPM, `1/4`, Snap on, range drag raw 1.2→2.9, Ctrl+L → `Loop 00:01.333 — 00:02.667` (`Loop შეიქმნა და ჩაირთო…`). REAL-mouse body drag: +0.9 s → **2.000 — 3.333**; +1.6 s → **2.667 — 4.000**; +3.05 s → **4.667 — 6.000**; 1280 +0.9 s → **2.000 — 3.333**. Each move had status `Loop: … .` and Undo `Undo: Loop-ის დიაპაზონი`. A following end-edge drag (+1.55 s) landed on lines 4.667, 5.333, 7.333 and 4.667, with the start unchanged |
| GM-BRACE-ALT | **PASS** | Alt held from before pointerdown to after pointerup, body +0.5 s (20 px) → `1.833 — 3.167`. The start is free (not on a 2/3 line) and the length is exactly **1.334**. **Extra (A §10.5):** Undo (title `Undo: Loop-ის დიაპაზონი`) → 1.333—2.667, then an Alt drag of +26.68 px landing exactly on line 2.000 → **2.000 — 3.334**: the ms length is kept under the bypass, as §0.1(4) specifies (info) |
| GM-BRACE-KEYS | **PASS** | A REAL click on the brace focuses it (`arrangement-loop-brace`). → **2.000—3.333**, → **2.667—4.000**, ← **2.000—3.333**, Shift+→ end **4.000**. Each status is `Loop: 00:0x.xxx — 00:0x.xxx.`. A REAL click on the Snap button turned Snap **off**; a click on the brace, then → gave **2.100 — 4.100** (+0.1 s, length kept), status `Loop: 00:02.100 — 00:04.100.` |
| GM-BRACE-PLAY (real audio) | **PASS** | Two Undos (titles recorded) brought the loop back to `2.000 — 3.333`, then Snap on. Ruler click → `00:02.667`, REAL Space, 7.0 s sampled every 10 ms (701 rows). **5 wraps:** 3.318→2.004, 3.316→2.002, 3.332→2.018, 3.319→2.005, 3.317→2.003, about every 1.336 s. The highest position seen was 3.332. The **music track meter stayed between −15.2 and −10.7 dB** the whole time, including ±150 ms around every wrap: no dropout and no stop. A 1 ms end difference cannot be measured with the meter |
| GM-NUDGE | **PASS** | From 2.000 at 90 BPM 1/4: 2.667, 3.333, 2.667, 2.000, 1.333 |
| GM-GROUP | **PASS** | Group drag raw 2.783: the anchor goes to **2.667** (a line) and the other clip to 6.667→8.001. The offset 5.334 is kept (±0.001, deliberate) |
| GM-GROUP-CLAMP (best effort) | **PASS** (try 3) | 120 BPM, `1/32`, Snap off, max zoom: A (SFX) at **0.069**, B (music, anchor) at **0.100**. REAL click on A, Ctrl+click on B → `2 კლიპი მონიშნულია`. Snap on, REAL drag of B by −600 px → **B 0.063, A 0.032**, Undo `Undo: გადატანა (2)`. Tries 1 and 2 were harness errors, not product evidence: in try 1, B's header was off-screen at 320 px/s; in try 2, `clickEl` clicked the centre of a 101 s clip, which was off-screen, so the Ctrl+click missed and B moved alone to 0. That is consistent with a single-clip drag |
| GM-G1 (control, whole-ms) | **PASS** | 120 BPM 1/4: raw 3.3 / 3.8 / 2.3 → 3.5 / 4.0 / 2.5 |
| GM-90, GM-SNAPOFF, GM-UNDO-H (same page) | PASS (extra) | unchanged against round 67 |

## 7. §4.7 regressions
| ID | Result | Evidence |
|---|---|---|
| SN-REG | **PASS** | No BPM. 1 s: raw 3.6/3.2 → 4/3. `0.5 წმ`: raw 4.15/3.4 → 4/3.5. Keys 1/2 sequence `0.25 0.1 0.1 0.25 0.5 1 2 5 10 10`. End messages unchanged (`ბადე უკვე ყველაზე მჭიდროა — 0.1 წმ (1)` / `… ფართოა — 10 წმ (2)`) |
| LB-REG | **PASS** | No BPM, `1 წმ`, Snap on. Loop 1.000—3.000; body drag +1.4 s → **2.000—4.000**; brace → **3.000—5.000**; Snap off (REAL Snap-button click) and → **3.100—5.100** |
| GM-KEYS-REG | **PASS** | At 120, `1/4`: 1 ×3 → 1/8, 1/16, 1/32, then `ბადე უკვე ყველაზე მჭიდროა — 1/32 (1)`; widening ends with `… ფართოა — 1 ტაქტი (2)` (ga68 page, which also re-passed GM-NOBPM/OPTIONS/LAYOUT/MENU/UNDO at 1440) |
| REG-HYD | **PASS** | No hydration line on any PW or gstack load. The only console errors are root's known `/api/cart` CORS error and the resulting `Failed to load cart` |

## 8. G68-3 — anonymous workspace and purchase protection: PASS
- **gstack, fresh state `c-round-68/c-browse.json`, 1440×900:**
  - **Direct `/studio-lab`:** 4 lanes, the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`, cookie length 0, `localStorage` holds only `czaba_session_id`.
  - **REAL gstack input:** I clicked the BPM field, typed `90`, pressed Enter, then `g` → bars ruler `data-bpm=90`, status `Snap ჩართულია — ბადე 1 წმ (G)` (shot `g68-3-studio-lab-1440.png`).
- **Header link:** from `/`, the visible `a[href="/studio-lab"]` link lands on `/studio-lab` with 4 lanes and the badge.
- **`/studio/middle-east`:** `Sign in required`, 0 lanes.
- **curl:** anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; fake Bearer → **403** (`runs/curl-token.txt`).
- **Network:**
  - gstack (522 lines): no `studio-token`, `recording-`, `/api/download` or `Authorization`. The only R2 request is `czaba-r2-proxy…workers.dev/middle-east/cover.jpg`, and it comes after the `/` homepage navigation (line 184; the allowed homepage cover). The `/studio-lab` loads (lines 1–168) made no R2 request.
  - Every PW page (every `runs/g68*/gb68*/ge68*/ga68*` log): 0 forbidden, 0 `Authorization`.

## 9. Ableton (§0.2): two verdicts per row
| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| Dragging the brace bar moves the loop without changing its length | **PASS** (GM-BRACE ×4, GM-BRACE-ALT, LB-REG) | **Deliberate difference.** The length-kept behaviour itself is confirmed in the captured paragraph (Live 12 manual, Arrangement View, loop brace; B's 2026-10-16 capture). CZABA stores whole ms, so a musical length is kept as a line count, and its ms value can differ by 1 ms between positions (1.334 vs 1.333). Under Snap off or the Alt bypass, the ms length is kept |
| Left/right arrows nudge the loop by the current grid | **PASS** (GM-BRACE-KEYS, LB-REG) | **Confirmed** (same paragraph) for the Snap-on grid nudge. The Snap-off 0.1 s step is CZABA's own rule (D-29z16) and is listed as a deliberate difference |
| Arrow-key nudge of a clip to the adjacent grid line | **PASS** (FX-M1*, FX-M1-90, GM-NUDGE) | **Unconfirmed**: not in the captured text. This is a CZABA rule (D-29z12) |
| Up/down shift the brace by its length; Ctrl+arrows resize | not offered | **Not applicable** (not requested) |

No source was re-fetched, and no video or Live installation was used.

## 10. Bugs
**None found this round.**

**Info for B (not bugs):**
1. **Mutation k survives** (`moveLoop` on-line tolerance 1e-3). This is a small test gap, also found by A. Suggest a GM12 row with a whole-ms off-line edge exactly 1 ms from a line (Lows batch, alongside INFO-C67-MUT-P).
2. **The Alt bypass onto a line keeps the ms length** (2.000—3.334, 1 ms past line 3.333). That is the specified §0.1(4) behaviour. Tech Lead may judge it in R68-T.
3. **The range readout says `1.334 წმ`** for a 1.333—2.667 range (stored-ms difference, visible in shot `gm-brace-keys-1440x900.png`). The range length is outside this round's scope. Recorded only as a pointer for the ARCH-CHECKPOINT (b) time-precision question.
4. **A's reviewer L2** (ceil clamp has only one oracle row): my mutation q (drop the first ceil candidate) is killed by GM8 and GM11. A mirrored ceil sweep remains a reasonable Lows-batch addition.

## 11. Not run this round (honest)
- Video sync and C-R27-01; the full find → add → fit video → export flow (no export code changed); the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root); triplets (stage 5b).
- Round-67 rows that §4.10 names as not re-run: the frozen code stands on their round-67 PASS. Several (GM-NOBPM, OPTIONS, LAYOUT, MENU, UNDO, 90, SNAPOFF) re-passed incidentally on the shared pages at 1440 only.
- **Tech Lead:** R67-T and **R68-T** (real Chrome feel of brace moves at 90 BPM 1/4) remain open.

## 12. Commit readiness
Rounds **67 + 68** are ready for root's gate as one unit:
- C PASS this round, browserVerified;
- the tree is exactly the 10 §3.1 paths;
- verify rc 0 at 95/1652.

Root still owns the e2e smoke, the independent review, the commit and the push.
