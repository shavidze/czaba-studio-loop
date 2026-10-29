# A round 241 — SABA-B-11b stage 2a (menu groups + one check, `4` = Snap, GATE239-S4)

**STOP:** none. **Slow covering tests (L32):** none above 50 % of their timeout (slowest: UM9 3.94 s and UC5 3.98 s of 20 s; grid files ≤ 15 s describe timeouts, slowest grid file total 11.98 s for 39 tests).

**code-reviewer:** run (project `code-reviewer` subagent, read-only, 2026-10-29). Critical 0, High 0, Medium 0, Low 7, score 8.5/10. Details §7.

## 1. Start state (task §0, §4.1)
- HEAD `04c2a5b4517c70fa2a040fd845c6f257fab24d33`; `git status --short --untracked-files=all` empty before work.
- `sha256sum -c --quiet`: tree list (1,090) rc 0; root list rc 0; grant-start list rc 0.
- `git apply --check -p1 b-round-240/precheck-scratch.diff` rc 0.

## 2. Changed files (exactly the 14 grants)
Grants 1–13 = `b-round-240/precheck-scratch.diff` applied verbatim (`git apply -p1`), no edits on top. `git diff --stat`: 13 files, +343 / −68. Grant 14 written by A.

| # | Path | Hunks |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementGridMenu.tsx` | props `gridMode`, `adaptiveDensity`, `onChooseAdaptiveDensity`; `GRID_MENU_GROUP_LABEL_CLASS`; index math (`widthCount`, `snapIndex`, `checkedWidthIndex`, `checkedDivisionIndex`, `checkedIndex` fallback 0, `tripletIndex = snapIndex + 1`); `chooseGridMenuItem` routes triplet → snap → width → division; two `<fieldset>`/`<legend>` groups; one check (`gridMode === 'adaptive' && density match` / `gridMode === 'fixed' && id match`); Snap item uses `snapIndex`. Dismiss/swallow/position/Escape/Tab/focus-return untouched. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | import `GRID_ADAPTIVE_WIDTH_OPTIONS`; `chooseGridMenuAdaptiveDensity` (flag, mode ref+state, density ref+state, `resolveAdaptiveGrid`, status `adaptiveWidthOn`, `closeGridMenu`); window `Digit4` (before `Digit5`, no Alt/Shift, repeat ignored); select `onKeyDown` list + branch `Digit4 → toggleSnap()`; Snap toggle `aria-keyshortcuts="G 4"`; select `'1 2 3 4 5'` / `'1 2 4 5'`; 3 new props at the mount. `stepGridDivision`, `toggleGridMode`, `changeGridDivision`, `toggleSnap`, select `title`: 0 changed lines. |
| 3 | `app/lib/arrangement/grid-divisions.ts` | append `GridAdaptiveWidthOption`, `GRID_ADAPTIVE_WIDTH_OPTIONS` (2…−2). |
| 4 | `app/lib/arrangement/strings.ts` | 8 properties in `studioGridStrings`. |
| 5 | `app/lib/arrangement/shortcuts.ts` | `snap` keys `['G', '4']`. |
| 6–13 | tests | as in B's diff (GAU18–GAU23 + helpers; GAU1 aria; GAU14 `ZOOM_TEN_STEPS_OUT_FROM_320`; `fixedGridRadios` scope in musical/snap-menu/triplet; aria values; DXL8 3 → 4; strings additions). |
| 14 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | l.4 `**სტატუსი:** In Progress (stage 2 of 3; C round 241 PASS)`; `## მიდგომა`: paragraphs D-29z368 split, menu groups + one check + L49 side-effect rulings (D-29z369), `4` (D-29z370), GATE239-S4, Ableton 2a summary (M-rows, ⚖3/⚖4/⚖5, SABA-Q-11B-MENU-OFF / MAC-BYPASS); `## შეცვლილი ფაილები`: l.128 `GAU1–GAU23` + stage-2a list; `## პრობლემები და გადაწყვეტები`: GATE239-S4, D-29z369 GM1/GU9 contract change, GATE240-S2; `## ტესტირება`: GAU18–GAU23 + 5 mutants; `## TODO`: stage 2b with the §7 facts. 7 TEMPLATE headings still in order; GAU ids cited: GAU1–GAU23 only (all exist). l.1 title and the stage-1 R-table left unchanged (not granted). |

## 3. Checks actually run
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-241/typecheck.log` |
| `npm run lint` | rc 0 (205 warnings, 1 info — pre-existing repo-wide; none new reported on grants by biome check) | `a-round-241/lint.log` |
| `npx biome check` on the 13 granted `app/` paths | rc 0, "Checked 13 files … No fixes applied" | `a-round-241/biome.log` |
| `npx vitest run $(cat b-round-240/covering.txt)` | **49 files, 780/780 passed**, 107.5 s | `a-round-241/covering.log` |
| Mutants (scratch `/tmp/a241-scratch`, outside repo; script `a-round-241/mutate.py` = B's with paths edited) | MU-MENU-FLAG-MISSING → GAU21 red; MU-MENU-MODE-MISSING → GAU20; MU-MENU-DENSITY-MISSING → GAU19, GAU20, GAU21; MU-CHECK-PICK-IN-ADAPTIVE → GAU18, GAU19, GAU20; MU-4-REPEAT → GAU22. All exactly as B's §0.2 table. Repo `git status` identical before/after. | `a-round-241/mutants/*.log` |
| Playwright `:5173` (copy of `b-round-240/probe-241.cjs`, unedited), 1440×900 and 1280×720, fresh context per recipe | 0 page errors in all 4 runs. Results byte-identical (JSON) to B's `probe-241-scratch.json`. | `a-round-241/probe-241-after.json`, `a-round-241/shots/` |

Probe attempt 1 timed out on `Demo collection ready` (60 s; cold Vite after the source change) — environment-invalid, kept as `a-round-241/probe-attempt1.err`. A diagnostic load (`diag.cjs`) then reached ready in 5.5 s (only the expected cloud cart/`ERR_CONNECTION_REFUSED` console errors), and attempt 2 passed.

**Browser results vs §0.3 "After":**
- Mount menu: groups "Adaptive grid" (Widest…Narrowest) and "Fixed grid" (10 s…0.1 s), checked only `Medium`, focus `Medium`, 144×436 px — match.
- Click Narrow: `adaptive 0.5`, status `Adaptive grid — Narrow, now 0.5 s` — match.
- `4`, `4`: `Snap on — grid 0.5 s (G)` then `Snap off — free movement (G)`; aria `G 4` / `1 2 4 5` — match.
- `5` + menu: `fixed 0.5`, checked only `0.5 s`, focus `0.5 s` — match.
- AX description (CDP): adaptive `Grid 1 s · 1 — narrower, 2 — wider · Adaptive: follows zoom — 5 for fixed`; fixed `… · Fixed at every zoom — 5 for adaptive` — match.
- 120 BPM seed + menu: 18 radios, checked only `Medium`, 641 px tall; 1280×720 box y 75 → 716; 1440×900 y 255 → 896 — match.

## 4. Known gaps / notes for B
- **Menu height margin (signal B-R240-MENU-HEIGHT):** §0.3 says "79 px spare" at 1280×720 with a BPM. Measured: top 75, height 641, bottom 716 → **720 − bottom = 4 px** (the `GRID_MENU_VIEWPORT_MARGIN_PX` clamp; the 79 px figure appears to be top + bottom spare combined). It fits, so not a failure at the acceptance viewports, but any window shorter than ~649 px (or one more menu row) would overflow; there is no `max-h`/`overflow-y`. Same numbers as B's scratch run.
- The `?` sheet row and the sheet search for `4`, the text-field/dialog/Export cases and focus-return to the Snap toggle were covered only by jsdom rows (GAU22/GAU23, existing GM/sheet tests) in A's run, not by A's browser probe; they are C rows (C-KEY4-241, C-MENU-CHOOSE-241, C-MENU-REG-241).
- Snap tooltip `(G)` vs `aria-keyshortcuts="G 4"` mismatch is deliberate (D-29z370, signal B-R240-SNAP-ARIA-TOOLTIP-MISMATCH).
- Stage 2b (no snap on an invisible grid) not started, as ruled.
- Not run by A (gate rows): full vitest suite, `npm run build`, `npm run verify`, e2e smoke.

## 5. Next C checks (exact)
C-SCOPE-241, C-UNIT-241, C-MUT-241, C-MENU-GROUPS-241 (record top / height / 720 − bottom; expect 4 px bottom spare at 1280×720 with BPM), C-MENU-CHECK-241, C-MENU-CHOOSE-241, C-KEY4-241, C-S4-AX-241, C-GRID-REG-241, C-MENU-REG-241, C-BUDGET-241, C-REF-241, AN-REVIEW-241, LAB-SMOKE-241, Auth; Purchased origin BLOCKED (backend unavailable in cloud); gate rows to gate.

## 6. Acceptance status claimed by A
Only what A ran: start state, typecheck, lint, biome on grants, covering 49/780, 5 mutants, browser probe recipes of §0.3 at both viewports. All C rows remain C's to verify; nothing in §5 is claimed passed by A.

## 7. code-reviewer result and handling
Verified by the reviewer: index math (items 0–4 widths, 5…5+n−1 divisions, snapIndex, tripletIndex; wrap, Home/End, `checkedIndex` fallback; GM7 13 items / Home+9 → `0.5 s`), `Digit4` guards (Ctrl/Meta via the modifier early return, Alt/Shift explicit, repeat, typing targets incl. `<select>` so no double toggle, Export/sheet), no stale closures in `chooseGridMenuAdaptiveDensity`, §2.2 side effects as ruled.

| # | Low | Handling |
|---|---|---|
| R1 | Menu has no `max-h`/`overflow-y`; now 641 px with a BPM; clipped on windows ≲ 649 px tall (e.g. 1366×768 with toolbars) | Out of grants. For B: signal B-R240-MENU-HEIGHT got ~190 px worse this round; measured bottom spare at 1280×720 is 4 px (§4). A fix also needs scroll-into-view since focus uses `preventScroll`. |
| R2 | `fieldset` groups make screen readers count per group ("1 s, 4 of 7"); the single cross-group check is not conveyed as one set | Valid ARIA 1.2; record only. For B / C-S4-AX-241 context. |
| R3 | `width?.label ?? ''` silent fallback in `chooseGridMenuAdaptiveDensity` (unreachable today) | Out of the applied pre-check diff; proposal for B: pass the option object instead of the density. Not changed (C-SCOPE checks the hunks against B's diff). |
| R4 | GAU22 does not pin Shift+4 / Meta+4, nor `4` with Export open | Covered by shared guard paths and C-KEY4-241; proposal for B to add in a later touch of the file. |
| R5 | No unit test for focus return after a width choice | Shared `closeGridMenu` (GM11/GM18); C-MENU-CHOOSE-241 (a) checks it in the browser. |
| R6 | Doc 186: premature "შესრულდა" in TODO; covering count "39"; stale stage-1 text l.1 title "ეტაპი 1", R6 "ეტაპი 2 (დღეს G)", R8 "ეტაპი 2" in the `## მიდგომა` table | **Fixed in grant 14:** TODO line reworded to point at l.4 (status after C); added the stage-2a covering line (49 files / 780). **Not changed (outside the granted paragraphs):** l.1 title and the R6/R8 table rows — B to rule (grant them in 2b or the final-stage task). l.4 stays byte-exact per L28. Mutant citation is valid: A re-ran all 5 after the `checkedIndex` fallback fix (§3). |
| R7 | `fixedGridRadios` duplicated in 3 test files | Acceptable under frozen scope; candidate for ROOT-RECON-GRID-HARNESS. |

Suggestions passed on (not applied): derive the Snap toggle `aria-keyshortcuts` from the `snap` row in `shortcuts.ts`; `key={option.density}` instead of the label.

**Architecture note (for B, not an in-round refactor):** `ArrangementGridMenu.tsx` l.218–317 now repeats the item `<button>` markup and check span 4× (DXL8 3 → 4); keep for now (roving index / refs / focus-return contracts must stay byte-stable). If a later round adds more items, extract a local `GridMenuItem` with GM/GU/TU/GAU/DXL8 rows as the guard. `gridHandChosenRef` now has a third writer — already tracked under ARCH-CHECKPOINT-TEMPO-GRID after 2b; a shared `setAdaptiveDensity(level, source)` primitive for `toggleGridMode`/`stepGridDivision`/menu is the reviewer's candidate for that checkpoint.

After the doc-only fix: `git status --short` = exactly the 14 granted paths (`M`); no code re-run needed (grant 14 is a doc; Biome does not include `docs/`).

## 8. C-SCOPE counts measured by A (`git diff -U0`, after the final doc fix)
- Removed → added `expect(` lines: grid-adaptive-ui 1 → 46; grid-musical-ui 3 → 4; grid-snap-keys 1 → 1; grid-snap-menu 3 → 4; grid-snap-ui 1 → 1; grid-triplet-ui 5 → 5; label-status-colour-ui 0 → 0 (DXL8 count 3 → 4 inside the call); strings.test 0 → 0. Equal to B's §0.1 counts.
- `-` lines in grants 3, 4 and 13 (`grid-divisions.ts`, `strings.ts`, `strings.test.ts`): 0.
- `origin` in the grant 1/2 hunks (case-insensitive): 0.
- `sha256sum -c` tree list (1,090) rc 0 and root list rc 0, re-run after all edits.

**Doc 186 line drift (for AN-REVIEW-241 and B):** the task's "l.128" (`GAU1–GAU23`) is now **l.169** after the `## მიდგომა` paragraphs; grep `GAU1–GAU23`. Stale stage-1 text left for B's ruling: l.1 title "ეტაპი 1", **l.83** R6 "ეტაპი 2 (დღეს G)", **l.85** R8 "ეტაპი 2", **l.283** "covering set (39 ფაილი)" (the stage-1 line; the new stage-2a covering line sits just above it). l.4 = `**სტატუსი:** In Progress (stage 2 of 3; C round 241 PASS)`.

**Scope completed by A:** stage 2a implementation per §0.1/§2 and A's §4 checks 1–8. Not claimed: any C acceptance row, ABL-R-8 (closes at 2b), the backlog as a whole.
