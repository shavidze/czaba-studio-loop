# C round 239: SABA-B-11b stage 1 (adaptive grid, `5`, `1`/`2` density): verification

**Verdict: PASS.** No Critical, High or Medium finding. There is one new Low (C-R239-01), and it goes to B for a ruling (`deferred_low_polish` under the 2026-10-23 gate). browserVerified = realVerified = **true**: every browser row that can run in the cloud ran in real Chromium (Playwright 1440×900 and 1280×720, a fresh context per row). The purchased-origin row is BLOCKED because the backend is unavailable in the cloud.

C did not take A's claims on trust. C re-ran:
- the scope and hash checks;
- the covering set;
- 2 mutants;
- every browser row, with its own scripts.

A HEAD copy (`git archive HEAD` → `/tmp/c239-head`, outside the repo, on `:5174`) was the "before" reference for the screen budget and the export hash.

Evidence: `c-round-239/`. The scripts are `c239.cjs` and `density-skip.cjs`. Raw results are in `out/c239.json` and `out/density-skip.json`. Screenshots are in `shots/`. Unit and mutant logs: `unit.log`, `mutant-MU-*.log`.

## Acceptance rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-239 | PASS | <ul><li>HEAD is `15a0b41`. Exactly the 13 granted paths changed: 10 `M` and 3 `??`.</li><li>`sha256sum -c` gives rc 0 on the tree list (1,091), the root list, and A's end hashes.</li><li>The 7 protected files: `git diff --quiet HEAD` rc 0.</li><li>`-expect(`/`+expect(` per granted test file: snap-keys 3/3, snap-ui 3/3, triplet-ui 3/3, musical-ui 1/1, shortcuts 0/0, strings 0/0. The removed lines are exactly the §0.1 statements: aria lists, title suffixes, and the GK11 `5`→`6`.</li><li>Grant 1 has 0 removed lines; grant 3 has 0 removed lines.</li><li>`origin` appears 0 times in the grant-2 hunks.</li><li>A's deviations from B's pre-check (the `changeTempo` clear branch, the density loop, and the null-BPM guard) are inside grants 1 and 2.</li></ul> |
| C-UNIT-239 | PASS | The covering set (39) plus the 2 new files: **41 files, 676/676** green, rc 0 (`unit.log`). The full suite is a gate row. |
| C-MUT-239 | PASS | Each mutant ran on the scratch copy `/tmp/c239-scratch`. **MU-FIXED-DEFAULT** turns GAU1–4 and GAU6–13 red, which includes GAU1 and GAU2. **MU-ZOOM-STATUS** turns GAU2, 3, 6, 11 and 13 red, which includes GAU2. Afterwards the scratch file is `cmp`-equal to the repo, the repo status is identical before and after, and the hashes are unchanged. |
| C-ADAPT-SEC-239 | PASS (both viewports) | <ul><li>At mount: `adaptive`, division `1`, and a painted period of 40 px.</li><li>`=`×6: 0.5 (25, 31.25, 39.06 px), then 0.25 (24.41, 30.52, 38.15 px).</li><li>`−`×10: back through 0.5 and 1 to `2` at 16.38 px/s (40.96 and 32.77 px).</li><li>At every step, the painted period equals `data-grid-seconds × px/s` within 0.5 px. Px/s was taken independently from two ruler ticks. Every spacing is ≥ 24 px, and the next finer step is always < 24 px.</li><li>No hidden lines appeared in adaptive mode.</li></ul> |
| C-ADAPT-MUS-239 | PASS (both viewports) | <ul><li>The seed is Enter on `demo-synth-mix`. Right after it: division `1/2`, Snap on, `data-bpm` 120, and the status ends exactly `Snap on — grid 1/2 (G)`.</li><li>`=`×5: `1/4` (25, 31.25, 39.06 px), then `1/8` (24.41, 30.52 px).</li><li>The invariant holds at every step, and `data-bpm` stays 120.</li></ul> |
| C-SILENT-239 | PASS | A MutationObserver watched `output[aria-live]` (childList, subtree and characterData). The count did not change on any of the 16 seconds-family zoom steps, the 5 musical steps, or the 3+3 zoom steps in the mode row. The status text was unchanged on every zoom step. The count rose only on key presses. |
| C-MODE-239 | PASS (both viewports) | <ul><li>`5` → `fixed`, with the exact `Fixed grid — 1 s at every zoom (5)`. `=`×3 keeps `1` (50, 62.5, 78.1 px).</li><li>`5` → `adaptive 0.5`, with the exact `Adaptive grid — follows zoom, now 0.5 s (5)`.</li><li>Choosing `0.1` in the select → `fixed 0.1`, which stays through `−`×3.</li><li>The title suffixes are byte-exact in both modes, for example `Grid 1 s · 1 — narrower, 2 — wider · Adaptive: follows zoom — 5 for fixed`.</li><li>Musical: `5` → `Fixed grid — 1/4 at every zoom (5)` and `5` → `Adaptive grid — follows zoom, now 1/4 (5)`.</li></ul> |
| C-DENSITY-239 | PASS (both viewports) | At 40 px/s:<ul><li>`1` → `Grid: 0.5 s (Snap off)`, then `Grid: 0.25 s (Snap off)`.</li><li>The third `1` gives the exact `The adaptive grid is already at its narrowest density — now 0.25 s (1)`.</li><li>`2`×5 goes 0.5 → 1 → 2 → 5, then the exact `The adaptive grid is already at its widest density — now 5 s (2)`.</li></ul>The mode stays adaptive throughout. See C-R239-01 for a stored-density edge case. |
| C-MUS-239 | PASS | After `=`×5 (1/8 at 122 px/s), `3` gives `adaptive 1/4T` (40.69 px) with the status `Grid: 1/4T · 0.333 s at 120 BPM (Snap on)`. Through `−`×3 the triplet invariant holds: 1/4T 32.55 and 26.04 px, then 1/2T 41.67 px. A second `3` returns to the straight `1/4` (31.25 px). The mode stays adaptive. |
| C-KEYS-239 | PASS (both viewports) | <ul><li>Library search, the marker name editor (opened with M) and the BPM field each receive the `5`, and the mode is unchanged.</li><li>With Export open: mode, division and status are unchanged, and the dialog stays open.</li><li>On the focused select at the load zoom: adaptive → fixed, the value stays `1` (no type-ahead), focus stays on the select, and the status is `Fixed grid — 1 s at every zoom (5)`. A second `5` returns to adaptive.</li><li>Ctrl+5: `defaultPrevented` false and the mode unchanged.</li><li>Held `5` (1 keydown + 4 `repeat:true`): exactly 1 `data-grid-mode` change.</li><li>The `?` sheet's own search receives the `5`, and the mode is unchanged.</li></ul> |
| C-SNAP-239 | PASS (both viewports) | Snap on, adaptive:<ul><li>**Load zoom** (`1/2` = 1 s at 40 px/s): a drag of 1.37 s lands at 1.000, and Undo restores 0. An Alt-drag lands at 1.370 (bypassed). `→` nudges to 1.000. A ruler click at 2.37 s puts the playhead at 2.000; with Alt, 2.370.</li><li>**After `=`×4** (`1/8` = 0.25 s at 97.66 px/s): a drag of 0.3425 s lands at 0.250, and Undo restores 0. Alt gives 0.343. `→` gives 0.250. A ruler click at 3.5925 s gives 3.500; with Alt, 3.592.</li></ul> |
| C-BUDGET-239 | PASS | Persistent text lines outside the timeline, HEAD (`:5174`) against the work tree (`:5173`), counted the same way on both servers:<ul><li>empty project: 85/85 at 1440 and 69/69 at 1280;</li><li>demo project: 101/101 and 85/85.</li></ul>Both servers show the identical line set at each viewport. The sheet has `Adaptive / fixed grid 5` in GRID & SNAP, and searching "adaptive" finds that row alone. The first 1440 budget attempt timed out on a cold Vite start of the HEAD copy; that attempt is environment-invalid and kept as `out/c239-after-budget-timeout.json`. |
| Grid menu (§6 probe) | PASS (probe) | At `=`×4 in adaptive mode, a lane right-click shows the checked `menuitemradio` equal to `data-grid-division`: `0.25 s`, and `1/8` with the 120 BPM seed. Choosing another item (`10 s`) sets `data-grid-mode` to fixed with the normal status `Grid: 10 s (Snap off)` / `(Snap on)`, and `−`×3 keeps `10`. Both viewports, 0 page errors (`menu.cjs`, `out/menu.json`, `out/menu-*.png`). |
| C-SHOTS-239 | PASS (with one note) | `shots/shot-{mount,zoom4-adaptive,fixed,musical,select-hover,sheet-adaptive}-{1440x900,1280x720}.png` and `budget-*`. **Note:** headless Chromium does not paint native `title` tooltips, so `shot-select-hover-*` shows the hover state without the tooltip. The tooltip text was verified byte-exact through the `title` attribute in both modes (C-MODE row). |
| C-REF-239 | PASS (table below) | `SABA-Q-11B-READOUT`, `SABA-Q-11B-DENSITY` and `SABA-Q-11B-PLAIN-DIGITS` each appear once in `backlog.json`. |
| AN-REVIEW-239 | PASS | <ul><li>Line 4 is byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 239 PASS)`.</li><li>The 7 TEMPLATE `## ` headings appear in order.</li><li>Every cited GA1–GA8 and GAU1–GAU13 id exists in the new test files.</li><li>The doc states the 120 BPM `1/2` change (l.40–41, l.129, D-29z359), the 24 px rule, and the 20 px measurement with its 83 red tests.</li></ul> |
| LAB-SMOKE-239 | PASS (both viewports) | Space plays: position 0.882 after 0.9 s, RMS > 0. Space pauses: the position is stable at 0.89 across 400 ms. Export WAV: 48 kHz, 24-bit, stereo, 768,000 frames = 16.000 s, −24.91 dBFS, peak 0.2967, 0 NaN. The **sha256 `1fea093b…3f94` is identical to HEAD's** (`:5174`, same steps) at both viewports, and identical to rounds 237 and 238. 0 page errors. |
| Auth | PASS | Fresh context, no credentials: `/studio-lab` opens with `auth_user` null. `/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`. `/api/studio-token` with no header returns 401 `Please sign in to access Studio.` Premium auth is not bypassed. |
| Purchased origin (browser) | BLOCKED | Backend unavailable in the cloud. The grant-2 hunks contain `origin` 0 times. |
| gate | gate | Full vitest, typecheck, lint, build, `npm run verify` and e2e smoke belong to the root gate and are not claimed here. |

## Ableton reference (C-REF-239)
Source: [Live 12 manual, Arrangement View 6.10 "Using the Editing Grid"](https://www.ableton.com/en/live-manual/12/arrangement-view/), read by C through WebFetch on 2026-10-29. It confirms:
- "either zoom-adaptive or fixed";
- Ctrl/Cmd+1 "narrows the grid, doubling the density" and Ctrl/Cmd+2 widens it;
- Ctrl/Cmd+3 toggles triplets;
- Ctrl/Cmd+4 turns snap on or off;
- Ctrl/Cmd+5 "toggles fixed and adaptive grid modes";
- the spacing is shown "above the time ruler, in the lower right corner";
- Alt (Win) / Cmd (Mac) bypasses snapping;
- the widths are set "using the context menu" (no item names given).

Each row below is judged twice: CZABA against its own requirement, and CZABA against Live.

| # | CZABA requirement | Live conformance |
|---|---|---|
| R1 two modes | met (C-MODE) | **confirmed** (manual quote) |
| R2 adaptive default | met (mount `adaptive`) | **unconfirmed** for Live 12. Live 10/11 tutorials only; C did not watch them |
| R3 mode key | met with plain `5` | **deliberate difference** (Live: Ctrl/Cmd+5), awaiting Saba as SABA-Q-11B-PLAIN-DIGITS |
| R4 `1`/`2` density | met (C-DENSITY). The straight musical family doubles per step, as Live does | **confirmed** for the keys' meaning (plain digits as R3). The 5-level density model is CZABA's own; the Live manual does not describe it, so it is **unconfirmed** |
| R5 triplets | met (C-MUS), and adaptive stays adaptive | **confirmed** (plain `3`, as R3) |
| R6 Snap key `4` | stage 2 | n/a this round |
| R7 spacing readout | met in the existing select, which shows the live pick (`0.25 s` at 97.7 px/s in `shot-zoom4-adaptive-*`; `1/4` at 62.5 px/s in `shot-musical-*`); no new text (C-BUDGET) | **deliberate difference** (Live: lower right above the ruler), awaiting Saba as SABA-Q-11B-READOUT |
| R8 context-menu widths | stage 2 | n/a this round. The manual confirms the menu exists, not its items |
| R9 24 px threshold | met (GA8, invariant measured) | **no reference found**, awaiting Saba as SABA-Q-11B-DENSITY |
| R10 a choice = fixed | met (select 0.1 → fixed) | **unconfirmed** (inference from tutorials) |
| R11 silent zoom | met (C-SILENT) | **unconfirmed** by C. B cites a video observation from root's summary; C did not watch it |
| R12 seconds family | met (C-ADAPT-SEC) | n/a (Live has no seconds grid) |
| Alt bypass | met (C-SNAP) | **confirmed** for Windows. Live's Mac modifier is Cmd; CZABA's is not tested here |

"Better than Live" claim: the select title names the mode and its key, the `?` sheet lists `5`, and the toggle status names the mode. All three were verified. Whether this is actually *better* is a judgement for Saba.

## Findings for B

### C-R239-01 (Low): the stored adaptive density skips levels at a family end, so a zoom-back shows a wider grid than the user's net choice
- **Steps** (`density-skip.cjs`, both viewports, 0 page errors):
  1. Open `/studio-lab` fresh, at 40 px/s, adaptive `1`.
  2. Press `1` `1`. The grid shows 0.25 s (narrowest density).
  3. Press `=` ×10 to the 320 px/s maximum. The grid shows 0.1 s, the family end.
  4. Press `2` once. The grid shows 0.25 s, one visible step wider (correct).
  5. Press `−` ×10. The zoom returns to 34.4 px/s.
- **Expected** (task §2.2: "adaptive: the density moves one level"): the net density is −2 + 1 = −1, so at 34.4 px/s the grid would be **0.5 s** (Medium 1 s minus one level).
- **Actual:** **`2` s**. The stored density jumped from −2 to +1 in one key press, because A's reviewer fix loops until the visible pick changes. The user pressed narrower twice and wider once, yet ends with a grid wider than Medium. `5` `5` resets it.
- **Evidence:** `c-round-239/out/density-skip.json`. A flagged this deviation in `a-round-239.md` §6 as "needs a B ruling" and §5b. GAU12 pins the current behaviour.
- **Why Low:** it needs a zoom to the family end and back, it is recoverable, and it touches no audio or data. B rules: keep A's model and record it as deliberate, or keep the density level-based and make a key press at a clamped end move the level only once while still changing the visible pick.

### Info (not rows)
- **INFO-C239-ZOOM-DURING-DRAG** (1440 only): pressing `−` during a clip drag did not change the zoom. The grid stayed `1/8` and the clip committed on the 0.25 s grid (start 1.000), with no crash and no off-grid commit. Ctrl+wheel during a drag was not tried, because Ctrl held during a drag may act as a copy modifier.
- **INFO-C239-STATUS-STALE-AFTER-ZOOM** (by design, R11): after `5` → `Adaptive grid — follows zoom, now 0.5 s (5)`, a later zoom changes the pick to `1`, but the status still says "now 0.5 s" until the next key. This is the intended silent zoom; the select shows the live value. It is listed for SABA-Q-11B-READOUT context only.
- **The HEAD dev server** (`:5174`, `/tmp/c239-head`) was stopped by the background time limit after the budget and smoke rows had finished. Nothing depends on it now.

## Side effects
No app source edits, commits or settings changes. The scratch copies `/tmp/c239-head` and `/tmp/c239-scratch` are outside the repo. The repo's `git status` and the 13 granted hashes are identical before and after.
