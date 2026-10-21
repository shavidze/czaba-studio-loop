# C — Round 64 verification: SRW-14 stage 4c-2 (library drop snaps to clip edges, D-29z29) + carried round-63 browser rows

Verifier: C (Claude Opus 5.5) · 2026-10-19 12:11–12:33 +04 · Evidence: `c-round-64/` (checkpoint `c-round-64/checkpoint.md`)

**Verdict: PASS. `browserVerified: true`.** Every REAL-browser row in §4.6, §4.7 and the G64-3 workspace rows ran to a verdict at 1440×900, and the starred rows also ran at 1280×720.
- **Closed this round (both viewports):** C-R62-01 and C-R62-ALT-ENABLE-GROUP-GAP.
- **One new Low finding (C-R64-01):** a §4.8 probe expectation does not match the real browser. It needs a B ruling and does not block the round.

I re-ran everything myself. A's claims were not used as evidence.

## 0. Environment

| Check | Time | `:5173/studio-lab` | `:5199/api/products` | `node.exe` |
|---|---|---|---|---|
| start | 12:11 | 200 | 200 | 7 |
| mid (after the offline block) | 12:20 | 200 | 200 | 7 (8 during PW runs) |
| end | 12:31 | 200 | 200 | 8 → 7 after my gstack server stopped |

- `envStatus` (copied from `env-status.json`): round 64, store 200, backend 200, checked 08:10:34Z, attempt 1.
- **Process reconciliation:** the remaining `node.exe` processes belong to the dev server (7252, 17560), therapy-notes MCP (21600, 9828, 28748) and Codex cua (21740, 21848). None of them is mine.
- **Browsers:**
  - **Drags, Ctrl-clicks, held Alt and ruler/Space playback:** standalone Playwright (installed chromium, fresh context per run), labelled **REAL-mouse (PW)**. Driver: `c-round-64/tools/pw64.cjs`, built on round 62's `pwlib` and fixture scripts.
  - **G64-3:** gstack `/browse`, with its own state file `c-round-64/c-browse.json`; I stopped that server myself.
- **ENV-EXT-LOAD-HANG:** every PW run waited for `domcontentloaded`, then the grid control, then 4 s.

## 1. Offline block

### G64-2 — tree: PASS (start and end)
- **HEAD:** `038ed5a45f94…` at start and end.
- **`git status --short`:** 33 lines, which is case A plus `?? doc 057`. No path outside §3.1 changed (`gates/status-end.txt`).
- **Frozen list and hashes:**
  - frozen list 422/422 OK;
  - protected files 4/4 OK;
  - snapshot `SHA256SUMS` OK;
  - round-63 hashes unchanged: `grid.ts` `5341cd83`, `grid-edges.test.ts` `7e686c0f`, `grid-snap-clip-edges.test.tsx` `785f521d`, doc 056 `1fd9c70b`;
  - `ArrangementClip.tsx` `97a1bf79` unchanged.
- **Owned files:** `ArrangementLane.tsx` `9105781c`, test `fe3e8702`, doc 057 `ed8f808e`. All are LF: 0 CRLF / 950, 893 and 115 LF.

### R64-S — static: PASS, with one info deviation
- **`diff -u` of `ArrangementLane.tsx` against the snapshot:**
  - `libraryDropStart(event, dragged)` follows §0.1 steps 1–5 exactly: `raw`, then `resolveSnapStep(…, event.altKey)`, then `null → raw`, then `isVideo || dragged === null → snapTimeToGrid`, then `clipEdgeTargets(getArrangement().clips, '', track.id)` and `snapMoveStartToGridOrEdges(raw, dragged.duration, …)`.
  - `handleLibraryDragOver` passes its `dragged`.
  - `handleDrop` reads `getLibraryDragSource()` before `dropLibrarySource`.
  - The grid import line is as specified, and `resolveGridTime` has 0 remaining uses.
- **Info deviation (INFO-R64-TYPE-IMPORT):** a second import line also changed. `type LibraryDragSource` was added to the existing `~/contexts/ArrangementContext` import. §0.3 lists only the grid import line.
  - It is a type-only import that the required signature needs, and A disclosed it.
  - I see no behavioural effect. **B to acknowledge.**
- **AST (`scripts/asteq-it.cjs`):**
  - old 27 `it`; 26 identical; only SD6 changed; DE1–DE9 added; new total 36.
  - Negative control (a copy with SD6's Alt half changed from 6.2 to 6.3): detected as changed.
  - The only removed lines are SD6's two first-half `6.2` calls, which became `4.6`. The Alt half `6.2, true` is unchanged.
  - `DROP_EDGE_FIXTURE` is the only new top-level `const`.
  - DE1–DE9 match §2.2 literally: ghost text, `left`, `blocked`, statuses and Undo titles (`gates/diff-test.txt`).
- **Banned patterns:** none in the diff. The only comment in the file is the pre-existing `biome-ignore` at l.923, outside the diff. No `.skip`, `.only`, `.todo`, `retry`, `setConfig` or per-`it` timeout.
- **Literal scan of the added lines:** no character outside Georgian, ASCII and `„“—·…`.
- **Doc 057:** all §2.5 sections are present, and docs 055/056 are unchanged (056 hash OK).

### R64-U — red run and mutations: PASS
- **Scratch:** `c-round-64/scratch/` (a copy of `app/`, a `node_modules` junction and my own vitest config). Restored byte-identical after the run.
- **Red run** (snapshot `ArrangementLane.tsx` with the current test file): **`4 failed | 32 passed (36)`**. The four failures are DE1, DE2, DE3 and DE6 (`gates/red-run.txt`).
- **Mutations** (my own regexes, `scripts/muts64.cjs`, results in `mutations.txt`). Files: loop-drop, track-layout, gesture-guard, grid-snap-ui. Unmutated: 111/111.

| # | Mutation | Killed by |
|---|---|---|
| a | edges → grid only | DE1, DE2, DE3, DE6 ✔ |
| b | lane id `''` | DE4 ✔ |
| c | not-ready source uses edges with duration 0 | DE5 ✔ |
| d | video lane uses edges | DE9 ✔ |
| e | `endEdges` emptied | DE2, DE3 ✔ |
| f | `handleDrop` passes `null` | DE1, DE2, DE3, DE6 ✔ |
| g | Alt bypass ignored (`?? snapSeconds` when Alt) | DE7 ✔ (+SD3, SD5, SD6) |
| h | Alt ignored (`false`) | DE6 ✔ (+SD3–SD6, DE7) |
| i | SD6 back to 6.2 | SD6 ✔ |
| j (extra) | edges taken from the drop lane's clips only | DE3 |
| k (extra) | source read after `dropLibrarySource` (null at drop time) | DE1, DE2, DE3, DE6 |

There were no survivors.

**Durations** (loop-drop alone): 36/36 in 5.18 s. The largest test is SD6 at 96 ms; nothing exceeded 3 s.

### G64-1 — gates: PASS
- **`npm run verify`, attempt 1, quiet:** rc 0 (12:18:56–12:20:16). It covered agents:check, lint, `tsc --noEmit`, vitest **89 files / 1583 passed** and build ✓. `Test timed out` count: 0.
- **Biome `./app` (read-only):** 5 errors / 218 warnings / 1 info. The 5 errors are exactly the baseline CRLF format list (`StudioWorkspace.tsx`, `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `auth.ts`). The 2 owned files have 0 diagnostics.

## 2. §4.6 — carried round-63 browser rows (REAL-mouse PW): all PASS

**Setup:**
- L52 fixture: video 0/6.008, music 7/16, Soft impact (SI) sfx 4/2. Slow rise (SR) is dragged to stems 12.3 with Snap off.
- Snap is set by REAL `g` and the division by REAL `select`.
- Groups are selected by a REAL header click, then Ctrl + REAL click.
- The oracle's candidate lists and bounds are in the run logs.
- At both viewports pps = 40.

| ID | 1440×900 | 1280×720 | Evidence and key numbers |
|---|---|---|---|
| **GE-OOB-STATUS*** | **PASS** | **PASS** (attempt 2) | **Oracle:** winner video end 6.008, delta 2.008, **out of bounds** (bounds [−4, 2]); grid line 6 at delta 2 is in bounds. **Result:** SI 6, SR 14.3, no overlap. **Mid-drag status:** `Snap ჩართულია — ბადე 1 წმ (G)`, not the blocked line. **Release status:** verbatim `გადატანა (2): 2 კლიპი გადავიდა 00:02.000-ით მარჯვნივ.`. **Undo:** `Undo: გადატანა (2)`. **Ctrl+Z:** restored both after the two `Mute — ვიდეო` undos (INFO-R62-GEPLAY-UNDO). **1280 attempt 1 was invalid (harness):** the Middle East setup drop at 19.3 s was at x=1284, outside the 1280 viewport, so no neighbour was placed. Attempt 2 scrolled the timeline (view only, `scrolled 204`) for that setup drop. Logs: `runs/pw64-1440x900-oob_play_bounds_start_cross_alt_crossoob.txt`, `runs/pw64-1280x720-oob_play.txt`, `runs/pw64-1280x720-oob_start_alt.txt`. |
| GE-OOB-PLAY (real audio) | **PASS** ×2 | PASS (info) | **Method:** video Mute, REAL ruler click at 5, REAL Space; sfx meter sampled every 25 ms. **1440:** last −∞ at 6.0113, onset **6.0407** (an earlier run: 6.0007 / 6.102). **1280:** 5.99 / 6.03. All within [5.95, 6.15]. |
| GE-BOUNDS-REG | **PASS** | — | Neighbour at 18.8 (maxDelta 1.5). SI 5, SR 13.3. The blocked status appears mid-drag and stays after release; no success line; no overlap; Ctrl+Z restored. |
| **GE-START-REG*** | **PASS** | **PASS** | Division 10, raw 6.6. SI 7 (music start), SR +3. Verbatim `გადატანა (2): 2 კლიპი გადავიდა 00:03.000-ით მარჯვნივ.`. |
| GE-CROSS-REG | **PASS** | — | SR on sfx at 6.000, music on stems at 0.700, status `გადატანა (2): start 00:06.000.`, no overlap, Ctrl+Z restored. |
| **GE-ALT-ENABLE*** | **PASS** | **PASS** | Snap **off**, division 10, Alt held through the drag, raw 6.85. **Oracle:** music start 7, d 0.15, which is nearer than grid 10 (d 3.15). **Result:** SI 7 and SR +3 (same delta). Snap reads `off` mid-drag and after. Alt reached the gesture (the result is the edge, not the free 6.85). Ctrl+Z restored. |
| GE-CROSS-OOB (info) | ran | — | **Construction 1** (an SI copy on stems at 9): the move was refused by placement. Music would land on stems over the copy, the ghosts were blocked, status `გადატანა (2): ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`, nothing was lost and nothing overlaps. **Construction 2** (`runs/pw64-1440x900-crossoob2.txt`; SI on sfx at 9.2 and SI on music at 4 → bounds [−1, ∞)): SR is dragged to sfx at raw 11.55. The nearest target-lane edge 11.2 (delta −1.1) is **out of the source-lane bounds** and grid 12 (delta −0.3) is in bounds. **Result:** SR on sfx at 12, music on stems at 6.7, status `გადատანა (2): start 00:12.000.`, no overlap, 6/6 clips, Ctrl+Z restored. This is the grid-line result that D-29z28 expects; it is the known Low A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE (11.2 was free on sfx). No new bug. |

**C-R62-01** (GE-OOB-STATUS PASS at both viewports) and **C-R62-ALT-ENABLE-GROUP-GAP** (GE-ALT-ENABLE PASS at both viewports) are **closed**.

## 3. §4.7 — stage 4c-2 browser rows (REAL-mouse PW HTML5 drag from the library): all PASS

**Setup:**
- L52 fixture, then Slow rise is dragged to **sfx at 12.3** with Snap off, which gives non-grid edges 12.3 and 17.3. Stems stays empty for LD-OTHER.
- Snap on (REAL `g`), division 1.
- The dragged item is Soft impact, 2.000 s, ready in ≤ 2 ms at drag time (the library was already loaded).
- Every row logs the full candidate list, and every edge row's margin over the grid line is 0.3 s (required ≥ 0.05).
- The ghost is read mid-drag, before `mouse.up`.

Logs: `runs/pw64-1440x900-ld_play.txt` and `runs/pw64-1280x720-ld.txt`.

| ID | 1440 | 1280 | Key numbers |
|---|---|---|---|
| **LD-EDGE*** | **PASS** | **PASS** | sfx, raw 17.4. **Oracle:** SR end 17.3 (d 0.1) vs grid 17 (d 0.4). **Ghost:** `00:17.300`, not blocked. **Clip:** sfx@17.3 (gap 0 to SR's end, no overlap). **Status:** `„Soft impact“ დაემატა SFX ხაზზე 00:17.300-ზე.` **Undo:** `Undo: დამატება — Soft impact`. Ctrl+Z removed it. |
| LD-EDGE-END | **PASS** | PASS | sfx, raw 10.4. **Oracle:** end-touch with SR start (same lane), start 10.3 (d 0.1) vs grid 10. **Ghost:** `00:10.300`. The dropped clip runs 10.3–**12.3**, ending exactly at SR's start. |
| LD-OTHER | **PASS** | PASS | **Empty** stems lane, raw 12.4. **Oracle:** start-touch with SR's start on sfx, 12.3 (d 0.1) vs grid 12. **Ghost** `00:12.300`; clip stems@12.3; status `… სტემები ხაზზე 00:12.300-ზე.` |
| **LD-ALT-ENABLE*** | **PASS** | **PASS** | Snap **off**, Alt held through the drag and the drop. `dragover.altKey` = true, recorded by the probe. **Ghost:** `00:17.300`. **Clip:** sfx@17.3. Snap is `off` mid-drag and after. No Alt menu or lost drag in headless Chromium. |
| LD-ALT-BYPASS | **PASS** | PASS | Snap on with Alt. **Ghost:** `00:17.400`. **Clip:** sfx@17.4, which equals the raw pointer time. Snap stays on. |
| LD-BLOCK-REG | **PASS** | PASS | **(a) Grid wins and is blocked:** sfx raw 4.6 → grid 5 over SI 4–6. Ghost `00:05.000 · აქ ადგილი არ არის`, `data-blocked=true`, `dropEffect=none`, nothing added. **(b) Edge wins and is blocked** (covers A-R64-REVIEW-BLOCKED-EDGE-WIN in the browser): with a Soft impact copy on stems at 12.3–14.3, stems raw 12.6 → winner start-touch 12.3 (d 0.3) over grid 13 (d 0.4). Ghost `00:12.300 · აქ ადგილი არ არის`, blocked, `dropEffect=none`, nothing added. **Note:** in a real browser a `none` dropEffect means no `drop` event, so no status line is written. The row does not require one; the unit test DE4 asserts the status because jsdom fires `drop` anyway. Info only. The cursor shape itself cannot be observed headless; `dropEffect=none` is the evidence. |
| LD-VIDEO-REG | **PASS** | PASS | Video lane at raw 7.4. **Ghost:** `00:07.000 · აუდიო ვიდეოხაზზე არ ემატება`, blocked. Nothing added. **Status:** `აირჩიე აუდიო ხაზი (მუსიკა, სტემები ან SFX) — ვიდეოხაზზე აუდიო არ ემატება.` |
| LD-PLAY (real audio) | **PASS (adapted method, see below)** | — | **On the LD-EDGE drop:** the meter criterion as written cannot apply, because SR plays on the same sfx lane until 17.3 (meter onset 15.022 comes from SR). I used the scheduled `AudioBufferSourceNode.start` record instead, calibrated by SR's own source (`off` 2.7 at lead 0.05). The new clip is scheduled at 15 + 2.35 − 0.05 = **17.300**. **LD-PLAY-B (the literal meter criterion, on the LD-OTHER drop on the empty stems lane):** ruler click at 10.3, then Space. Last −∞ at 12.2993, onset **12.3393**, window [12.25, 12.45] → PASS. **Export cross-check:** see §6. |

**`dropEffect` probe note (info, no bug):**
- On the non-blocked rows ending at x=1208, the probe read `none`. A focused diagnostic (`runs/diag64c-dropeffect-edge-1440.txt`) shows why:
  - `none` was set at x≈996–1000 (≈12.1 s), en route, where the ghost would genuinely overlap SR;
  - at the final x=1208 the value is `copy`.
- A valid target never shows a no-drop cursor.

## 4. §4.8 — INFO-R62-LIB-LOADING-DROP probe (fresh context, no fixture, no injected scripts)

Runs: `runs/probe64-1440x900.txt` and `runs/probe64-1440x900-immediate.txt`.
- **Step 1:**
  - At +0.66 s all 9 items read `იტვირთება…` and `draggable=false`.
  - By the first 5-s poll (+5.27 s) all 9 were ready with durations: Middle East 01:41.352, hero 02:30.372, Soft impact 00:02.000, Slow rise 00:05.000, the synth mix and 4 stems 00:16.000.
  - The early drags show Soft impact ready by +2.0 s, hero by +3.1 s and pulse stem by +4.2 s.
- **Network:**
  - `/middle-east.mp3` 200, 4,054,080 B at +1.86 s;
  - `/videos/hero/hero-music.mp3` 200, 3,610,677 B at +1.86 s;
  - the synthetic demo items make no network request;
  - other requests: `GET :5199/api/cart` failed (allowed, root) and GA collect was aborted (allowed).
- **Step 2:** a drag at +0.69 s, before the item was ready.
  - The option is `draggable=false`, so no HTML5 drag starts. There is **no ghost, no status change** (the status stays `დემო კოლექცია მზადაა. …`) and nothing is added.
  - The expected `· ხმა ჯერ არ ჩატვირთულა` ghost and the `ეს ხმა ჯერ არ ჩატვირთულა — …` status **do not appear in the real browser**. They are reachable only in jsdom (DE5/SD-not-ready), via `beginLibraryDrag` on a missing source. → **C-R64-01 (Low).**
- **Steps 3–4:** after ready, Soft impact → sfx@8, **hero → stems@18** and **pulse stem → sfx@12** were all added with exact statuses. In the earlier run, hero → music@1 and stem → stems@1 were also added.
  - **Round 62's "never ready" observation does not reproduce.** No item stayed loading beyond about 4 s, and no ready item was refused.
  - **Harness note:** the first run's three "LATE" drags were invalid by my own design: two overlapped the clips I had just added, and one was off-screen. They were replaced by the second run.
- **Severity call-out:** no condition is met. Every item becomes ready, and ready items drop.

## 5. G64-3 — anonymous workspace and purchase protection: PASS

**gstack, fresh state `c-round-64/c-browse.json`** (`runs/g64-3-*.txt`, `shots/g64-3-*.png`):
- **Direct `/studio-lab`:** 4 lanes and the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`. `localStorage` keys `[]`, cookie length 0. Checked at 1440×900 and 1280×720; at 1280 `scrollWidth` = 1280, so there is no horizontal page overflow.
- **Via the header link:** the `Studio Lab Demo` link from `/` lands on `/studio-lab` with the workspace and the badge.
  - The first two click attempts failed on the harness side (an ambiguous selector, then a stale ref).
  - The third, a ref taken in the same chain, PASSED.
- **`/studio/middle-east`:** shows "Sign in required" and no workspace.

**Network:**
- **gstack session:** the only backend request was `GET :5199/api/cart` (pending). `r2.config.ts` appears, but it is a dev module load, not R2.
- **Every PW run** (§4.6, §4.7, §4.8, export): `bad 0` (no `/api/studio-token`, `/api/recording-*`, `/api/download` or R2) and `withAuth 0`.

**Token rows** (backend 200, 12:28:53, `runs/curl-token.txt`): anonymous **401**; fake Bearer **403**. The 403 row has been pending since 2026-10-18 and now passes; INFO-R61-FAKEBEARER-500 did not occur while the backend was up.

## 6. Extra (related regression, not in §4): real export of an edge-snapped drop — PASS (info)

`tools/export64.cjs` → `runs/export64-1440x900.txt` and `.wav`, fresh context.
- **Setup:**
  - Slow rise was placed on music at 1.3 with Snap off;
  - then Snap on, division 1;
  - Soft impact was dragged to sfx at raw 6.4. Ghost `00:06.300`, which is the edge from music's 1.3 + 5 = 6.3.
  - Music was muted and the WAV exported through the dialog: `Export` → `WAV-ის ექსპორტი`. The dialog read `0:00 — 00:08.300`.
- **WAV:** PCM 24-bit, 2 ch, 48 kHz, 398,401 frames = 8.300021 s (+1 frame against 8.3 s).
  - The **first sample above 4 LSB is frame 302400 = 6.300 s exactly** (0 ms error), so the muted music clip is not in the mix.
  - NaN 0. Full-scale 2 samples, peak 1.0: the known DEMO-SFX-FULL-SCALE (Low, Tech Lead).

## 7. Ableton (workflow addendum 2026-10-11): two verdicts each

**Sources:**
- B's captures `b-round-63/ableton-5.10-excerpt-20261019.txt` (Live 12 manual §5.10) and `b-round-46/ableton-6.7-6.10-20261016.txt` (§6.7, §6.10).
- I read those captures. I did not re-browse the manual, watch any video or use any Live installation.

| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| A library item drops into a track at the pointer | **PASS** (LD rows, probe) | **Confirmed** for "drag from browser into tracks" (§5.10); the time position is not described there |
| The drop start snaps to the grid or to other clips' edges | **PASS** (LD-EDGE, LD-EDGE-END, LD-OTHER; both viewports for LD-EDGE) | **Unconfirmed (no source).** §6.7 says that *moving* clips snaps to "edges of other clips"; nothing describes browser drops. Applying it to drops is CZABA's decision. |
| Alt enables snapping while Snap is off and bypasses it while Snap is on | **PASS** (LD-ALT-ENABLE*, LD-ALT-BYPASS, GE-ALT-ENABLE*) | **Confirmed as a general rule** (§6.10: "hold down the Alt … to bypass grid snapping. If the grid is switched off, using the modifier will temporarily enable it"); its application to drops is CZABA's decision |
| A drop that would overlap → red ghost, no drop, nothing added | **PASS** (LD-BLOCK-REG a/b) | **Not applicable / unconfirmed** (no source) |
| Group move edge snap and OOB status (carried) | **PASS** (§4.6) | §6.7 "edges of other clips" for moves: **confirmed** that edges are snap targets; the group-bounds rules are CZABA's |

No row here claims "Ableton does the same" for the unconfirmed or not-applicable rows.

## 8. Bugs and findings for B

- **C-R64-01 (Low) — a still-loading library item gives no drag feedback in the real browser.**
  - **What happens:** on a fresh `/studio-lab` (+0.7 s), dragging an item that reads `იტვირთება…` does nothing. The option has `draggable=false`, so there is no ghost, no `· ხმა ჯერ არ ჩატვირთულა`, no status, and nothing is added.
  - **What §4.8 expected:** that ghost and the status `ეს ხმა ჯერ არ ჩატვირთულა — დაელოდე და სცადე თავიდან.`.
  - **Why:** the not-ready ghost/status path (DE5, SD) is reachable only in jsdom. In the browser it is dead code for library drags, because `ArrangementLibrary` gates `draggable` on `ready`.
  - **The window is short (~2–4 s locally)** and the item itself shows `იტვირთება…`. There is no data loss.
  - **B to rule:** either accept the gating and correct the spec and test expectation, or make loading items draggable so the existing ghost and status appear.
- **Info, no action:**
  - **INFO-R64-TYPE-IMPORT:** the extra type-import line in `ArrangementLane.tsx` (§1).
  - **B-R64-SPEC-LDPLAY:** LD-PLAY's meter criterion cannot hold after LD-EDGE as specified, because the lane's previous clip sounds until the drop start. Future specs should use an empty-lane drop or the scheduled-start check.
  - **INFO-R64-BLOCKED-NO-STATUS:** a real-browser blocked drop writes no status (no `drop` event), while DE4 asserts one in jsdom.
  - **INFO-R64-DROPEFFECT-PROBE:** an en-route probe artefact.
  - **INFO-R64-1280-OFFSCREEN-SETUP:** harness only.
- **Reviewer Lows from A:**
  - **A-R64-REVIEW-BLOCKED-EDGE-WIN:** now browser-covered by LD-BLOCK-REG (b) at both viewports. The unit gap stays Low.
  - **A-R64-REVIEW-SD5-EDGE:** Low, not browser-tested.
  - **R3 (`grid.ts` clamp):** info.
- **Reconfirmed this round:**
  - A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE (GE-CROSS-OOB construction 2);
  - DEMO-SFX-FULL-SCALE (export, 2 full-scale samples);
  - INFO-R62-GEPLAY-UNDO (Mute toggles sit on the Undo stack before the move).

## 9. Not run this round (honest)

- Video sync and C-R27-01 (RF3-1, RF3-2, R5-L6).
- The full find → add → fit video → export flow with WAV checks. Only the §6 export of an edge-snapped drop ran.
- The FB-01..FB-16 stage regression.
- `npm run test:e2e:smoke` (root).
- The round 57–61 menu browser re-run.
- The R64-T Tech Lead manual check (the Tech Lead's Chrome).

**Carried for B and root (unchanged by this round):**
- **`root-pre-push-review.md`** (mtime 2026-10-18 12:46:34):
  - video sync RF3-1, RF3-2 and R5-L6 (C-R27-01) are open; R5-L3 is partial; R5-L5, R5-E1, R6-S2 and R6-S3 are unit-only;
  - **M1:** the loop refill is rAF-only, so a hidden tab goes silent;
  - **M2:** the per-frame `position` in the context value re-renders every consumer;
  - Lows L1–L4 and L6–L8.
- **`publication-checkpoint.json`** (mtime 2026-10-17 11:11:24):
  - SRW-21: the purchased loader hardcodes `middle-east`;
  - portable instruction paths;
  - the SRW-23 scrollbar check at 1280×720 and 1440×900;
  - SRW-11/12 library and stems parity;
  - T12.
- **Root:** ARCH-CHECKPOINT-SRW14-PREFS (requested at this stage-4 boundary); ENV-EXT-LOAD-HANG; the CRLF Biome errors on the auth files; the stray `store/nul`; the scratch junctions (`c-round-64/scratch/node_modules` is mine; I did not delete it, per §3.2).

## 10. Commit readiness (root's call; interim checkpoints, not a release)

- **Round 64:** **ready.** C PASS with `browserVerified: true`, and every offline gate passed on the combined tree.
- **Round 63:** **ready.** Its §4.6 browser rows passed here, so C-R62-01 and the Alt-group gap are closed. It can be published together with round 64.
- **Round 62:** ready (C-R62-01, its open Low, is now closed).
- **Rounds 59–61** and **rounds 50–58 (`cb12805`):** ready per B. I re-verified only the combined working tree (verify rc 0, 89/1583), not each unit separately.

**SRW-14 stage 4 can close.** Per §7, next is SRW-15 stage 1 (FB-09). C-R64-01 is a Low for the Lows batch unless B rules otherwise.

## 11. Resume note (attempt 2)

Attempt 1 ended with a network API error after this report and `c-round-64.json` were written. At resume (12:41) I re-checked the tree: HEAD `038ed5a`, `git status --short` identical to `gates/status-end.txt`, `ArrangementLane.tsx` `9105781c`, and servers 5173/5199 both 200. Nothing changed after verification, so the verdict and evidence above still hold.
