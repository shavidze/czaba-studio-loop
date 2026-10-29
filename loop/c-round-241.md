# C round 241: verification of SABA-B-11b stage 2a (menu groups + one check, `4` = Snap, GATE239-S4)

**Verdict: FAIL.** One Medium bug, C-R241-01. It is pre-existing, so A did not cause it. Every new feature behaviour was met in real Chromium at 1440×900 and 1280×720. The FAIL comes from one explicit acceptance clause, "focus returns to the Snap toggle, never BODY" (C-MENU-CHOOSE-241 (a) and C-MENU-REG-241 Escape). It does not hold in a real browser, and it did not hold at HEAD `04c2a5b` either.

- `browserVerified: true`, `realVerified: true`. Every browser row ran at both viewports with a fresh context per row and 0 page errors.
- **Scripts:**
  - `c-round-241/c241.cjs`: C's own script. Its helpers are copied from `c-round-240/c240.cjs`, and its rows are new.
  - `c-round-241/focus-probe.cjs`.
- **Data:** `c-round-241/out/c241.json`, `out/focus-work.json`, `out/focus-head.json` and screenshots in `c-round-241/out/`.
- **Chromium:** Playwright bundled. The store dev server is `:5173`. A temporary HEAD copy ran on `:5174` (outside the repo) only for the focus comparison, and it was stopped and deleted afterwards.

## Rows

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-241 | PASS | <ul><li>HEAD `04c2a5b`. Exactly the 14 granted paths are `M`, and `git diff app/` is byte-identical to `b-round-240/precheck-scratch.diff`.</li><li>`sha256sum -c`: tree list (1,090) rc 0 and root list rc 0. The 7 protected files give `git diff --quiet` rc 0.</li><li>Grant 2: the hunks are only the §0.1 items (import, `chooseGridMenuAdaptiveDensity`, window `Digit4`, select list and branch, two aria values, 3 props). The 5 named functions and the select `title` are untouched.</li><li>`expect(` removed → added: GAU 1→46, musical 3→4, snap-keys 1→1, snap-menu 3→4, snap-ui 1→1, triplet 5→5, label 0→0, strings 0→0.</li><li>Grants 3, 4 and 13 have 0 `-` lines.</li></ul> |
| C-UNIT-241 | PASS | `covering.txt` gives 49 files, 780/780 green in 106.5 s (`c-round-241/covering.log`). The GAU file has GAU1–GAU23. |
| C-MUT-241 | PASS | Run on the scratch copy `/tmp/c241-scratch`, now deleted. MU-MENU-FLAG-MISSING turns GAU21 red. MU-CHECK-PICK-IN-ADAPTIVE turns GAU18, GAU19 and GAU20 red. The repo `git status` is identical before and after (`git-status-{before,after}-mutants.txt`, `mutants/*.log`). |
| C-MENU-GROUPS-241 | PASS | <ul><li>Order: Widest, Wide, Medium, Narrow, Narrowest (legend "Adaptive grid"), then 10 s…0.1 s (legend "Fixed grid"). With a BPM, the Fixed group adds `1 bar`…`1/32`. After `3` it shows the triplet list `1/2T`…`1/32T` instead. Then Snap (G) and, with a BPM, Triplets (3). Separators: 2 without a BPM, 3 with one.</li><li>The box is inside the viewport in every state (top / height / bottom spare):<ul><li>1440: mount 315/436/149; BPM 255/641/4; triplet 283/613/4.</li><li>1280: mount 280/436/4; BPM **75/641/4**; triplet 103/613/4.</li></ul></li><li>`scrollHeight == clientHeight` everywhere.</li><li>`menu-{mount,bpm,triplet}-*.png`</li></ul> |
| C-MENU-CHECK-241 | PASS | Exactly one `aria-checked=true` across the menu in each state: (a) Medium; (b) after `5`: `1 s`; (c) after choosing 0.25 s: `0.25 s`; (d) after the seed: Medium. Focus on open is that item every time. `:focus-visible` on a mouse open (info): true in (a), (b) and (d), false in (c). `check-*.png` |
| C-MENU-CHOOSE-241 | **FAIL (focus clause of (a) only)** | (a) After Tab ×30 to the Snap toggle, a right-click and Narrow give adaptive `0.5` with the exact text `Adaptive grid — Narrow, now 0.5 s`, and the menu closes. **`document.activeElement` = BODY** (C-R241-01). Each `=` press, compared with the finest seconds step whose painted period is ≥ 24 px: <ul><li>`=` 1: 50 px/s. Expected Medium 0.5, Narrow 0.25. Measured `0.25`, period 12.5 px.</li><li>`=` 2: 62.5 px/s. Measured `0.25`, period 15.6 px.</li><li>`=` 3: 78.125 px/s. Measured `0.25`, period 19.5 px.</li></ul>Each step is one family step finer than Medium.<br>(b) `5` (fixed 1), then Wide: adaptive `2`, exact `Adaptive grid — Wide, now 2 s`. The title ends with the adaptive suffix.<br>(c) Focus opens on Medium. One ArrowDown gives Narrow with `:focus-visible` true: a 1px solid brass outline at 0.8, no box-shadow. A second ArrowDown gives Narrowest, then Enter gives exact `Adaptive grid — Narrowest, now 0.25 s`, and the menu closes.<br>(d) Narrow, then the seed: tempo 120, adaptive `0.5` is kept, and the status ends `Snap on — grid 0.5 s (G)`.<br>0 page errors. `choose-*.png` |
| C-KEY4-241 | PASS | <ul><li>Body `4` gives `Snap on — grid 1 s (G)`; again gives `Snap off — free movement (G)`.</li><li>Held `4` (3 keydowns, 2 with `repeat:true`, all prevented) flips Snap once.</li><li>Ctrl+4: not prevented, and Snap is unchanged.</li><li>`4` is typed into the library search, the BPM field, the marker name editor and the `?` sheet search, and Snap is unchanged. The old keys sampled in fields (`5` library, `1` BPM, `2` marker, `5` sheet search) are typed too, and the grid is unchanged. `3` was not sampled in a field: without a BPM, `3` does nothing, so it proves nothing there; `5` was sampled twice instead.</li><li>Export dialog open: `4` changes nothing.</li><li>Focused select: one prevented keydown on SELECT. Snap goes on → off, the value stays `1` and the mode stays adaptive.</li><li>Aria: the toggle has `G 4`. The select has `1 2 4 5`, and `1 2 3 4 5` with a BPM. The toggle title stays `(G)`, as D-29z370 rules.</li><li>The sheet search for `4` leaves exactly one row, `snap` "Snap on / off", with the kbds `G` and `4`.</li><li>`(G 4)` and `(4)` appear nowhere in the DOM.</li><li>`sheet-4-*.png`</li></ul> |
| C-S4-AX-241 | PASS | CDP combobox "Grid division", both viewports. Adaptive: `Grid 1 s · 1 — narrower, 2 — wider · Adaptive: follows zoom — 5 for fixed`. After `5`: `… · Fixed at every zoom — 5 for adaptive`. |
| C-GRID-REG-241 | PASS | <ul><li>Mount, `=` ×6, `-` ×10: the divisions `1,0.5,0.5,0.5,0.25,0.25,0.25,0.25,0.25,0.5,0.5,0.5,1,1,1,2,2` are identical to the C239 reference. Painted periods match.</li><li>The aria-live MutationObserver count stays 0 on zoom.</li><li>Density `1` ×3 then `2` ×5: divisions and exact statuses are identical to the reference.</li><li>C-HAND-240 (a): `Grid: 0.5 s (Snap off)`, then after the seed 120 BPM, adaptive `0.5`, ending `Snap on — grid 0.5 s (G)`.</li></ul> |
| C-MENU-REG-241 | **FAIL (focus clause only)** | <ul><li>After Tab to the Snap toggle, a right-click and Escape, the menu closes and nothing changes, but **activeElement = BODY** (C-R241-01).</li><li>Choosing 0.25 s while playing keeps playback. The playhead goes 1.622 → 2.121 s, master RMS is 0.042 (1440) / 0.037 (1280), and the division becomes `0.25`.</li><li>Swallow: open the menu, then click Play. The menu closes and nothing plays. A second click plays.</li><li>A right-click on the track header opens no grid menu, and `contextmenu` is not prevented (native).</li></ul> |
| C-BUDGET-241 | PASS | Empty 85/69 and demo 101/85 (1440/1280). The line-set diff against round 239's inventory is empty both ways. |
| C-REF-241 | PASS | See the table below. `SABA-Q-11B-MENU-OFF` and `SABA-Q-11B-MAC-BYPASS` each appear exactly once as an `"id"` in `backlog.json` (l.25231 and l.25239). |
| AN-REVIEW-241 | PASS | <ul><li>l.4 is byte-exact: `**სტატუსი:** In Progress (stage 2 of 3; C round 241 PASS)`.</li><li>The 7 TEMPLATE headings are in order.</li><li>The cited GAU ids are GAU1–GAU23, all of which exist.</li><li>`GAU1–GAU23` is at l.169 (the task said l.128; the lines drifted).</li><li>D-29z368, 369 and 370 are present.</li><li>Info for B: the stale stage-1 text (l.1 title, the R6/R8 rows, "39 ფაილი") is outside the grants.</li></ul> |
| LAB-SMOKE-241 | PASS | <ul><li>Space plays: the playhead moves 0 → 0.882. Space pauses: 0.890 stays 0.890.</li><li>Export WAV: 48 kHz, 24-bit, 2 ch, 768000 frames = 16.000 s, −24.91 dB RMS, peak 0.2967, 0 NaN.</li><li>sha256 `1fea093b…3f94` matches rounds 237–240 at both viewports.</li></ul> |
| Auth | PASS | <ul><li>A fresh context opens `/studio-lab` with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401 `Please sign in to access Studio.`</li></ul> |
| Purchased origin (browser) | BLOCKED | The backend is unavailable in the cloud. `origin` in the grant-1/2 diff hunks: 0. |
| gate | gate | Full vitest, typecheck, lint, build, verify and e2e smoke are not claimed. |

## C-R241-01 (Medium): focus is lost to BODY after a mouse-opened grid menu closes

- **Steps:**
  1. Open `/studio-lab` and Tab until the Snap toggle has focus.
  2. Right-click an empty lane point.
  3. Press Escape, or click `0.5 s`, or click `Narrow`.
- **Expected:** focus goes back to the Snap toggle (task C-MENU-CHOOSE-241 (a) and C-MENU-REG-241; L47).
- **Actual:** BODY, in all 3 cases at both viewports. The focus events are `out:arrangement-snap-toggle`, then `in:<menu item>`, then `out:<menu item>`, and focus never comes back.
- **HEAD `04c2a5b`:** identical for Escape and for a division (`out/focus-head.json`). The bug is pre-existing (SRW-14 menu), not a regression by A, and the new width items inherit it.
- **Why the unit tests stay green:** GM11/GM18 fire `contextMenu` without a real right-button mousedown.
- **Cause (measured; `out/focus-work-cause.json`, `focus-probe2.cjs`):** capture listeners show this order at both viewports, in all 3 cases:
  1. `pointerdown` and `mousedown`: `activeElement` = the Snap toggle;
  2. `focusout` from the Snap toggle (the browser's default mousedown on the non-focusable lane body);
  3. **`contextmenu`: `activeElement` = BODY.**

  So `handleGridMenuRequest` (`StudioWorkspace.tsx` l.1625–1626) stores BODY as the return target, and `closeGridMenu` skips the restore on purpose (l.1615).
  - Fix direction for B: capture the return target at `pointerdown`/`mousedown` capture (the right button), before the default blur.
  - A jsdom row needs a real `pointerdown`/`mousedown` followed by a blur before `contextmenu`.
- **Severity rationale:** WCAG 2.4.3. A keyboard user loses their place (30 Tabs back), and it fails a written acceptance clause. It is not data loss.

## Ableton comparison (C-REF-241)

| # | CZABA requirement | Live match |
|---|---|---|
| M1 widths in the lane context menu | met (browser) | confirmed (6.10) |
| M2 group names | met ("Adaptive grid" / "Fixed grid") | partly confirmed (Live 10/11 sources); sentence case is a deliberate difference |
| M3 five widths | met | unconfirmed for Wide/Medium (inferred) |
| M4 coarse → fine, Medium the default | met | unconfirmed (inference) |
| M5 one check across the menu | met | **no reference found**; a CZABA decision (D-29z369) |
| M6 flat groups | met | deliberate difference ⚖3 (Live is inferred to use submenus) |
| M7 `4` toggles Snap | met (plain `4`) | deliberate difference ⚖1 (Live uses Ctrl/Cmd+4) |
| M8 Snap off = no snapping | unchanged; not re-measured this round (2b) | confirmed (6.10); no "Off" item, ⚖4 |
| M9 "Off" as a fixed choice | not added | deliberate difference ⚖4 → SABA-Q-11B-MENU-OFF |
| M10 bypass modifier | unchanged (judged from source and the round-239 evidence) | deliberate difference ⚖5 (Option vs Cmd on Mac) → SABA-Q-11B-MAC-BYPASS |

None of these is upgraded to "confirmed" by C's browser pass.

## Notes for B

1. **Menu height:** with a BPM at 1280×720 the bottom spare is **4 px**, not the 79 px in §0.3, which was top + bottom combined. It fits both acceptance viewports. Signal B-R240-MENU-HEIGHT: any window shorter than about 649 px clips the menu, and there is no `max-h` or `overflow`.
2. **Menu focus ring:** computed as 1px solid brass at 0.8. Recorded only; the focus style is not in this round's scope.
3. **Environment:** the HEAD focus-probe attempt 1 timed out on cold Vite dependency optimisation, so it is environment-invalid. Attempt 2 was valid.
4. **Fix-up scope suggestion:** C-R241-01 is pre-existing and touches `handleGridMenuRequest`/`closeGridMenu`, which this round did not grant. B decides whether to:
   - fold it into the 2b round as a bounded item with its own browser row, or
   - schedule it as a separate small fix. It is Medium, so it is not deferrable under the 2026-10-23 gate.

   All stage-2a feature rows met their criteria.
