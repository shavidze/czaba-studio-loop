# C — Round 62 verification (SRW-14 stage 4c-1: a group move snaps its anchor to clip edges, D-29z27)

Verifier: C · 2026-10-19 11:41–12:07 +04 · Evidence: `c-round-62/` (checkpoint.md, mutations.txt, runs/, gates/, tools/pw62.cjs, scripts/).
**Verdict: PASS.** Every acceptance item that could run did run, and passed. **One Low bug for a B ruling** (C-R62-01 = A's R2 signal; it matches the spec as written). The G62-3 token rows were **not run (environment)** because the backend `:5199` was down for the whole round.

## Environment
- Servers, start / mid / end: `:5173/studio-lab` **200** / 200 / 200. `:5199/api/products` **000** / 000 / 000. The backend was never up during C's run; agents do not start servers. Root's §6.1 request was not met.
- `node.exe`: 13 at start, 12–21 during the run (the user's own processes plus my Playwright runs), 12 at the end.
- **Env deviation (harness only):** from 11:51, `page.goto(..., {waitUntil:'load'})` timed out twice. The page's external Google Fonts and GTM requests hung; `tools/diag.cjs` shows the 3 pending URLs. From then on my harness waits for `domcontentloaded` plus the workspace selector plus 4 s. This affects test setup only; Studio's own requests were not involved. Both timed-out attempts are kept (`runs/*attempt2-goto-timeout*`).

## G62-2 — tree: PASS
- HEAD `038ed5a…` at start and end. `git status --short` has **31 lines** (case A + `?? doc 055`), matching §3.1, at both start and end.
- Frozen list: **418/418 OK**. Protected files: **4/4 OK**.
- Owned files match A's report: `d87b9b0c`, `97a1bf79`, `1d216557`, `49b35e40`, doc `e9fddf7a`. All are LF (0 CR).
- Snapshots `SHA256SUMS.txt`: 4/4 OK.
- Evidence: `g62-2-start.txt`, `g62-2-end.txt`.

## R62-S — static: PASS
- **`grid.ts`:** additions only (the new `snapGroupMoveDelta`). All existing functions are byte-identical.
- **`ArrangementClip.tsx`:** 3 hunks, as A reported in R6:
  - the import line (`snapGroupDelta` → `snapGroupMoveDelta`, needed because the old name is no longer used);
  - `groupDeltaOnGrid`;
  - its call site.

  `moveStartOnGrid`, the single-move path, trims, the Shift path and `finishGesture` are unchanged. The null-`snapStep` branch is unchanged apart from destructuring `bounds`.
- **G3 conformance (read against the spec):**
  - The grid path returns `roundGridTime(gridStart − anchorStart)` and `snapGroupDelta`. This is ms rounding, the same value the old code gave (`roundTime`) apart from `-0`.
  - The edge path uses whole µs; out-of-bounds edges fall back to `snapGroupDelta`.
  - Targets are built from non-members with `laneTrackId` = `hoverTrackId`.
  - For a video anchor, `hoverTrackId` = `original.trackId` because of the existing `!isVideo` guard.
- **Tests (AST check with `scripts/asteq-it.cjs`):**
  - `grid-edges`: 6/6 existing `it` identical, plus CE7–CE9.
  - `grid-snap-clip-edges`: 30/30 identical. Only the old CM10 is missing, and its replacement CM10 sits at the same position. Every removed line in the diff lies inside CM10.
  - Negative control: an edit to CM17 plus a renamed CM1 were both detected.
  - The fixtures match §2.2. CM10 asserts the undo label and the verbatim status.
  - CE9 has B's assertions plus A's D1 `expect` at max 5.3 (needed so that mutation f can fail CE9; accepted).
- **A's D2 (accepted):** CG1–CG6 sit in a new describe at the end of the file, with a describe-scoped `selectGroupPair` helper. It is additive. Every removed line in the diff is inside CM10, so no existing harness code, top-level helper or `beforeEach`/`afterEach` changed.
- **Banned patterns:** 0 on added lines (no `any`, assertions, `@ts-ignore`, comments, hardcoded colours, `.only`/`.skip`/`.todo`, retry or timeouts).
- **Doc 055:** status `Round 62 — D-29z27; C-ის შემოწმებას ელოდება`. It has all §2.5 sections, the C-R51-01 ruling, the Ableton table (3 unconfirmed rows, plus the sentence that "Ableton-შიც ასე მუშაობს" is not claimed), and TODO GROUP-SUBMS-GRID-EDGE.

## R62-U — mutations (C's own scratch and patterns, `scripts/cmut62.cjs`): PASS
- **Setup:** scratch `c-round-62/scratch/`, a copy of `app/` plus a `node_modules` junction, with its own config. The run covers 6 files: grid-edges, grid-snap-clip-edges, grid-snap-edit, grid-snap-ui, grid.test and selection.test.
- **Unmutated:** 132/132. Every mutation was restored; at the end, scratch equals `store/app`.

| # | Mutation (C's text) | Failing | Needed | Result |
|---|---|---|---|---|
| a | group helper gets `[]`,`[]` | CM10, CG1, CG3 | CM10, CG1, CG3 | killed |
| b | end targets dropped | CM10 | CM10 | killed |
| c | start targets dropped | CG1, CG3 | CG1 | killed |
| d | `clips` not filtered (only the anchor excluded) | CG2 | CG2 | killed |
| e | edge delta rounded to ms | CE8, CG3 | CG3, CE8 | killed |
| f | edge clamped to `[min,max]` | CE9, CG4 | CG4, CE9 | killed |
| g | placement lane = `original.trackId` | CG5 | CG5 | killed |
| h | grid path in µs | CE7 | CE7 | killed |
| i | `roundTime` removed from the Snap-off branch | CM17 | CM17 | killed |
| j | Shift read only on the first moved step | CM9f, CM9g | CM9f, CM9g | killed |
| k | Shift path `roundTime(original.start)` | CM9c–CM9h | CM9f–CM9h | killed |
| r4a1 | `moveStartOnGrid` → `snapTimeToGrid` | CM1, CM2, CM6, CM8, CM12, CM13, CM16, GS3, GS13 | CM1 | killed |
| r4a2 | `clipEdgeTargets` without the lane rule | CE5, CM14, CM15, CT7, CG5 | CM14 | killed |
| r4a3 | `planClipLaneMove` delta in ms (scratch only) | CM16, SL1 | CM16 | killed |
| n | tie → edge (`<=`) | CE1, CE2, CE4, CE8, CM7 | CE8 | killed |
| p | group with no lane rule (`laneTrackId` = a lane that doesn't exist) | CG5 | record | killed by CG5 |
| q | members excluded only on the anchor's lane | CM1, CG2, SE2 | CG2 | killed |
| x1 (C extra) | grid-vs-edge equality in ms instead of µs | CE8, CG3 | info | killed |
| x2 (C extra) | the 1e-6 bound tolerance on the edge path removed | — | info | **survives** (INFO-R62-EDGE-TOL; the tolerance only matters for float-noise edges at the exact bound) |

- Each run took 14–54 s. Alone, `grid-snap-clip-edges` gave 41/41 in 11.2 s wall time (tests 6.2 s). The slowest single tests were CM9g at 202 ms and CM9f at 189 ms; none took over 3 s.

## G62-1 — gates: PASS (`gates/`)
- tsc: rc 0.
- Full vitest: **89 files / 1569 passed**, 0 `Test timed out` (`node.exe` 12).
- Build: rc 0.
- Biome `./app`: **5 errors / 218 warnings / 1 info**. The 5 errors are the baseline CRLF `format` list: StudioWorkspace, auth-bugs.test, grid.test, render-budget.test, auth.ts.
- Owned files: 0 diagnostics.
- **`npm run verify`: rc 0 on the first quiet attempt** (12:03–12:06, nothing running in parallel).

## §4.6 browser acceptance: REAL-mouse (PW), standalone Playwright, fresh context, no credentials
**Setup:**
- Tool: `tools/pw62.cjs`; logs in `runs/pw62-<vp>-<group>.txt`.
- Fixture (L52, the same as rounds 55/59): video 0/6.008, music `სრული მიქსი` 7/16, SFX `Soft impact` 4/2, pps 40. `Slow rise` was added from the library to the empty stems lane with Snap off and landed at **12.3/5**.
- Snap via REAL `g`, division via REAL `select`.
- Group = REAL click on the anchor header + Ctrl+REAL click on the other header; `sel` is checked before each drag.

**For each row, the log records:**
- every clip's start, duration and lane before the drag;
- the oracle with its full candidate list, computed by C before the drag;
- the mid-drag status and ghosts;
- the result, the status, the undo label, and the Ctrl+Z restore.

**Invalidated attempts (harness, not product):**
- **1440 attempt 1** (`*-start-attempt1-selection-harness.txt`): after Ctrl+Z the pair was still selected, so my Ctrl+click deselected the second clip, and GE-END/GE-ALT ran as single moves. I fixed the harness to Ctrl+click only when the pair is not already selected, then re-ran.
- **GE-BOUNDS attempt 1:** my regex picked the stems copy of `Soft impact`, which I had used as the neighbour. I changed the neighbour to `Middle East` and re-ran.

| ID | 1440×900 | 1280×720 | Evidence (1440 values; 1280 identical) |
|---|---|---|---|
| GE-START* | **PASS** | **PASS** | Raw 6.6. Oracle winner: music start 7 (0.4) over video end 6.008 (0.592) and grid 10. SI 4→**7**, exactly the music start. Slow rise 12.3→15.3: the same delta, 3. Status `გადატანა (2): 2 კლიპი გადავიდა 00:03.000-ით მარჯვნივ.` verbatim; Undo `გადატანა (2)`; Ctrl+Z restores both |
| GE-END | **PASS** | PASS (run) | dx 34 → raw 4.85. Oracle winner: end touch on music start 7 → 5 (0.15) over video end − 2 = 4.008 (0.842) and grid 0 (4.85). SI → **5**, end **7** = music start (|diff| 0). Slow rise +1. Ctrl+Z restores |
| GE-MEMBER | **PASS** | PASS (run) | dx 328 → raw 12.2. Slow rise's **old** start 12.3 is 0.1 away. The oracle, with members excluded, gives grid 10. SI → **10** (not 12.3); Slow rise 12.3→18.3 (+6). Not captured by the member's edge |
| GE-BOUNDS | **PASS** | — | Neighbour `Middle East` on stems at 18.8, so Slow rise has maxDelta 1.5. Division 1, dx 81 → raw 6.025. Nearest = video end 6.008 (0.017 < grid 0.025); its delta 2.008 is out of bounds → fallback **1**. A clamp would give 1.5. Result: SI 5, Slow rise 13.3 (+1 each). Mid-drag status `ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.` No overlaps. Ctrl+Z restores |
| GE-CROSS | **PASS** | — | Group = `Slow rise` (anchor, stems 12.3) + music. Drag −254 px onto SFX. Raw 5.95. Placement lane SFX: SI's end 6 is a start target (0.05) and beats video end 6.008 (0.058). SI's start 4 is not a start target (lane rule). Mid-drag ghosts: SFX 6.000 and stems 0.700, both `blocked=false`. Commit: Slow rise on **SFX at 6** (6.000000000000001, within 1e-9), music on **stems at 0.7**, same delta −6.3. Status `გადატանა (2): start 00:06.000.` verbatim. Ctrl+Z restores |
| GE-ALT | **PASS** | PASS (run) | Alt held, Snap on: SI 6.6 (raw 6.6, free), Slow rise +2.6. No grid or edge capture |
| GE-OFF | **PASS** | PASS (run) | Snap off: SI 6.6, Slow rise 14.9 (+2.6), free |
| GE-PLAY (real audio) | **PASS** | — | After GE-START: video Mute `aria-pressed=true`; REAL ruler click at 5 (division 1); REAL Space. **Anchor** (SI at 7): SFX meter last silent at pos 7.0007, first non-inf at **7.07**, inside the window [6.95, 7.15]. The source starts relative to p0 = 5 are video 0.05 (off 5), SI **2.05** (→ 7.0), Slow rise **10.35** (→ 15.3), music 2.05 (→ 7). **Member** (Slow rise at 15.3, played from 14): stems first non-inf at **15.403**, window [15.25, 15.45]; the source starts at +1.339 → 15.3. After that run's final Ctrl+Z, the clips were unchanged. The likely cause, which I did not observe (I did not log the undo title), is that the last history entry was the video mute toggle, not the move. Ctrl+Z restoring this move is shown by the GE-START runs at 1440×900 (×2) and 1280×720 |
| EG-REG* | **PASS** | **PASS** | EG-1 → 7, with the verbatim status and Undo `კლიპის გადატანა`. EG-LINE → 9. EG-CROSS → stems 7, `გადატანა ხაზზე — სტემები: start 00:07.000.` LN-TOUCH: S = 9.4 → 7.4 exactly |
| EG-GROUP (re-stated) | **PASS** | — | SI + music, division 10, +104. Members excluded, so the only targets are video 0/6.008. Oracle winner: video end **6.008** (0.592) over grid 10 (3.4). SI 4→**6.008** and music 7→**9.008** (delta 2.008 each). Status `გადატანა (2): 2 კლიპი გადავიდა 00:02.008-ით მარჯვნივ.` Under D-29z27 the anchor now snaps to a non-member edge. In round 59 it went to grid 10 |

- **Network** (every PW run): `bad 0`, `withAuth 0`. The only backend URL is the allowed `GET localhost:5199/api/cart`. 0 page errors.
- **Sub-ms (§4.5):** every duration I probed is a whole ms: video 6.008, synth mix 16, Soft impact 2, Slow rise 5, Middle East 101.352. My attempt to add hero and stems did not land a drop (sources still "loading"). **CG3 is unit-only** in this round.

## C extra: C-R62-01 (A's R2) in the browser
Same fixture as GE-BOUNDS, but the neighbour is at **19.3**, so Slow rise has maxDelta **2.0**. Division 1, raw 6.025.
- The nearest edge, video end 6.008, needs delta 2.008, which is out of bounds. The fallback is grid line 6, delta **2**, which is in bounds. Before round 62 this same drag gave the same grid line 6 as a normal, unblocked move.
- **Observed:**
  - both clips moved +2 (SI 6; Slow rise 14.3–19.3, butting the neighbour);
  - Undo `გადატანა (2)`;
  - but both the mid-drag status and the **status after release** read `ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.`
  - The success line `… 2 კლიპი გადავიდა 00:02.000-ით მარჯვნივ.` is not written.
- So a group move that completed to the expected grid line is reported to the user as stopped.
- This conforms to G3 as written ("blocked keeps its meaning"). It is a new status regression compared with round 61 for this specific configuration, so it needs a B ruling. Severity **Low**: the data is correct and only the status text is misleading.

## G62-3 — anonymous workspace and purchase protection
Fresh gstack state `c-round-62/c-browse.json` (`b.sh`, `g62-3.sh`; output `runs/g62-3.txt`). The daemon started normally, with no fallback; `stop` printed "Unable to connect", the state file is gone, and no bun/browse process remains.
- **`/studio-lab` direct: PASS.** The workspace renders with the badge „დემო კოლექცია — ავტორიზაცია არ სჭირდება“. `auth_user` null, no cookies; the only localStorage key is `czaba_session_id`.
- **Via the header link "Studio LabDemo": PASS.** Same result.
- **Session: PASS.** A REAL add (`Middle East … დაემატა მუსიკა ხაზზე`) and REAL Space play/stop produced 0 hooked fetch/XHR `Authorization` headers (`[]`).
- **Network: PASS.** 0 requests to studio-token, recording, download or R2 in the direct, session and header runs, and in all PW runs. The media are `/middle-east.mp3` and `hero-music.mp3`. The API is only `localhost:5199/api/cart`. Other hosts: Google Fonts and GTM/GA (allowed).
- **`/studio/middle-east`: PASS.** "Sign in required"; no workspace.
- **Token rows: not run (environment).** The backend was 000. The codes I recorded: anonymous **401** `Please sign in to access Studio.`; fake Bearer **500** `Unable to prepare Studio access`. Both are fail-closed, but the 403 re-check B asked for could not be done (INFO-R61-FAKEBEARER-500 is still open).

## Ableton (two verdicts each; source: Live 12 manual §6.7/§6.10, B capture `b-round-46/ableton-6.7-6.10-20261016.txt`, re-read by C. No video was watched and no Live installation was used)

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| A dragged clip snaps to the grid and to other clips' edges, now for a group's anchor | PASS (CM10, CG1, GE-START, GE-END, EG-GROUP) | **Confirmed for a single dragged clip** (§6.7: "Clips snap to the editing grid, as well as … the edges of other clips"). Extending this to a selected group is a CZABA decision; §6.7 does not cover multi-selection |
| Which clip of a multi-selection snaps (the anchor only) | PASS (CG2, GE-MEMBER) | **Unconfirmed (no source)** |
| Snap distance and grid-vs-edge priority (nearest in µs, tie → grid) | PASS (CE8, n, GE-START/GE-END oracle) | **Unconfirmed** (§6.7 does not say) |
| Out-of-bounds edge → in-bounds grid fallback | PASS (CG4, CE9, GE-BOUNDS); see C-R62-01 for the status | **Unconfirmed (no source)** |
| Alt bypasses / temporarily enables | **Bypass half PASS** (CG6, GE-ALT: Snap on + Alt → free). The enable half (Snap off + Alt → snap) was **not re-tested for groups** this round; `resolveSnapStep` is unchanged (G4) | **Confirmed** (§6.10, Win Alt) |
| Shift keeps the time while changing lanes | PASS (CM9f–CM9h) | **No source.** CZABA R8-M |

No row claims "Ableton does the same" beyond the two confirmed sentences.

## Not run, or not testable (honest)
- **G62-3 token rows:** environment; the backend was down.
- **Sub-ms group exactness in the browser:** no sub-ms asset was found, so CG3 is unit-only.
- **Tech Lead R62-T:** the real-mouse feel, slowly passing another track's clip, and a real Alt key on Windows (Alt can focus the browser menu). These are not measurable headless.
- **Out of round-62 scope (§4.9), none claimed:**
  - video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
  - the full find → add → fit video → export flow with WAV data, duration and sample checks;
  - the FB-01..FB-16 stage regression;
  - `test:e2e:smoke` (root);
  - the round 57–61 menu browser re-run.
- **§4.7:** INFO-R61-XLEAK is not applicable, because `ArrangementGridMenu.tsx` is unchanged (it is in the frozen list, 418 OK).

## Info for B
- **C-R62-01 (Low, needs a ruling):** see above. Options:
  - (a) accept it;
  - (b) mark the move as blocked only when the **fallback** differs from the in-bounds grid result that the old code would have given;
  - (c) on release, write the success status whenever the commit moved the clips.
- **INFO-R62-EDGE-TOL:** mutation x2 survives. The ±1e-6 bound tolerance on the edge path is not pinned by a test. Optional; low value.
- **INFO-R62-LIB-LOADING-DROP (info, not a bug):** on a bare page, every library option still read „იტვირთება…“ after 25 s. My drags of the not-yet-used hero and stem sources onto lanes did not land (`tools/libdur.cjs`, `tools/durs.cjs`). Why was not investigated. Round 63 (library-drop edges) should look at dropping a source that has not loaded yet.
- **INFO-R62-CROSS-FLOAT:** after a cross-lane group move the anchor start is 6.000000000000001 (float sum; within 1e-9). It is consistent with the existing `planClipLaneMove` µs delta, and the display is fine.
- **A's items, passed through:**
  - R5 (CG5 proves the negative only; a positive placement-lane capture is now shown in the browser by GE-CROSS, where SI's end on the placement lane captured the anchor);
  - A-R62-ARCH-PRECISION-BOUNDARY → ARCH-CHECKPOINT-SRW14-PREFS (b).
- **Scratch:** `c-round-62/scratch/` contains a `node_modules` **junction**. Remove it with `cmd //c rmdir` before deleting the folder. I left it in place.

## Carried follow-ups (unchanged; `root-pre-push-review.md` mtime 2026-10-18 12:46:34, `publication-checkpoint.json` 2026-10-17 11:11:24)
- **Video sync:**
  - RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
  - R5-L3 is partially measured.
  - R5-L5, R5-E1, R6-S2 and R6-S3 are unit-tested only.
- **Medium:**
  - M1: the loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value re-renders every consumer.
- **Lows:** L1–L4 and L6–L8. `root-review-r50-58.md`: L5 is the architecture item.
- **publication-checkpoint:**
  - SRW-21: the purchased loader hardcodes `middle-east`.
  - Portable instruction paths.
  - The SRW-23 scrollbar check at 1280×720 and 1440×900.
  - SRW-11/12 library and stems parity.
  - T12 continuation.
- **Open C items:**
  - C-R41-01.
  - Tech Lead: C-R27-01, C-R6-02, C-R8-01, C-R23-01 and C-R38-01.
  - Round 63 (4c-2): library-drop edges, plus LD-BLOCK as the C-R51-01 regression.
- **Root:**
  - INFO-R61-FAKEBEARER-500. The 403 re-check is still pending because the backend is down.
  - The backend must be up for G63-3.
  - The publisher has never run.
  - The external fonts/GTM hang that blocks the `load` event (ENV-EXT-LOAD-HANG; harness only).
- **Closed by this round's evidence:** C-R52-T1 (CM10 replaced; CG1 plus GE-START/GE-END cover both touch cases), INFO-R55-FREE-ROUND-UNGUARDED (CM17, mutation i), A-R55-REVIEW-SHIFT-MIDDRAG-TEST (CM9f–CM9h, mutations j and k).

## Commit readiness (for root; interim checkpoints, not a release)
- **Round 62:** ready. C PASS; the change is limited to the 4 owned files plus doc 055. C-R62-01 is Low, spec-conformant and awaits a B ruling; it does not block.
- **Round 61:** ready.
- **Rounds 59–60:** ready, each as its own unit.
- **Rounds 50–58 (`cb12805` bundle):** ready. The 4a regressions (EG-1, EG-LINE, EG-CROSS, LN-TOUCH, CM1–CM16) were re-run green this round.
