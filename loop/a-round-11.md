# A — Round 11 report: SRW-11B stage 2 (track fold, track height, lane auto-fit, D-29b)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-10 · Task: `current-task.md` (round 11).
- Nothing was committed, stashed, pushed or deployed.
- The dev server `http://127.0.0.1:5173` was used as is: not started, not stopped.
- All browser work went through gstack browse with the state file `a-browse.json`. Its session was sent `stop` at the end; the CLI replied "Unable to connect".
- Artifacts are in `a-round-11/`:
  - `runs/`, `shots/`, `gates/`;
  - `guard-proof.txt`, `review-{1,2,3}-summary.md`;
  - `round11-delta-v4.diff`, the final delta against the pre-round baseline in `bak/*.base.*`.

**This report claims no PASS.** Everything below is A's evidence, pending C.

## 1. Pre-flight gate

**Assumptions**
- Fold, heights, auto-fit, the cap and the user-resize flag are view state in `StudioWorkspace`. They are not stored in `Arrangement`, history or context.
- "Height" (60–180, video 52–180, default 80, `aria-valuenow`) means the lane's inner height.
  - An open row is height + 1 px border, so the default row is 81.
  - A folded row is exactly 36 px including its border (35 px inner).
- Frozen callers (`render-budget.test.tsx`, `gesture-guard.test.tsx`) render `ArrangementLane` without the new props. All new lane props are therefore optional, with defaults equal to today's behaviour.
- jsdom measures 0. "Unmeasured" therefore means: default heights, and no cap.
- On a folded lane, a key or a pointerdown on the handle only unfolds it. This mirrors the detail separator: on a collapsed panel, a key only opens it.

**§2.4 step 1 (measured before any source edit)**
- Setup: anonymous `/studio-lab`, library open, video clip imported, default lanes, no audio clip selected.
- Files: `runs/budget-1280x720.json` and `runs/budget-1440x900.json`.

| | scroller collapsed | scroller open 144 | column | ruler + loop strip | rows | horizontal scrollbar (offsetHeight − clientHeight) |
|---|---|---|---|---|---|---|
| 1280×720 | 406 | 298 | 442 | 28 + 16 | 4 × 81 (header 80 = lane 80) | 0 (headless; offsetWidth − clientWidth = 10 is the stable vertical gutter) |
| 1440×900 | 624 | 516 | 660 | 28 + 16 | 4 × 81 | 0 |

**Computed cap**
- **1280×720:** 442 − 44 − 236 = **162** > 144, so the cap does not engage. With a real 10 px scrollbar it would be 152, which still does not engage.
- **1440×900:** 380 > 280, so there is no cap.

**Later observation**
- When an audio clip is selected, the footer grows a second line (`arrangement-selected-clip`). At 1280×720 the scroller is then 386 collapsed, so the column is 422.
- The cap then **does** engage: 422 − 44 − 236 = **142**.
- Both cases are recorded below. C's numbers depend on whether a clip is selected.

**Smallest design**
- Pure helpers in `panels.ts`.
- One layout state object plus callbacks in `StudioWorkspace`, recomputed inside the existing `ResizeObserver` callback (no new observer).
- In `ArrangementLane`: one row height via `style`, a density-based header, a fold button and a separator handle.
- In `ArrangementClip`: a `folded` prop.
- In `ArrangementDetailPanel`: a cap prop and a user-resize callback.

**Files and why**
- `panels.ts`: the maths.
- `StudioWorkspace.tsx`: the state and the recompute.
- `ArrangementLane.tsx`: the UI.
- `ArrangementClip.tsx`: the folded body.
- `ArrangementDetailPanel.tsx`: the D-29b cap.
- Tests: `panels.test.ts`, `detail-panel.test.tsx`, new `track-layout.test.tsx`.
- Docs: 019 (status/TODO) and new 020.

**Success commands**
- `npx vitest run` ≥ 812 + new tests with 0 failures.
- `npx tsc --noEmit` exits 0.
- Biome reports 0 errors.
- `npm run build` passes.
- Frozen and protected hashes match.
- The browser layout probes listed in §5.

## 2. Design

**View-state shape (`StudioWorkspace`)**
- `TrackLaneLayout { autoFit, detailUserResized, folded: Record<trackId, boolean>, heights: Record<trackId, number>, detailCap: number | null, isMotionArmed }`.
- A metrics ref `{ scrollerClientHeight, panelRenderedHeight, timelineChromeHeight }` holds the last values measured in the observer callback.

**Auto-fit (`fitLaneHeights`), as implemented**
- visible = scroller `clientHeight` − chrome. Chrome is the `offsetHeight` of the sticky ruler + loop-strip block, read through a ref (28 + 16 = 44).
- The horizontal scrollbar is not subtracted again, because `clientHeight` already excludes it.
  - **Deviation:** §2.3 says to subtract `offsetHeight − clientHeight` separately. Doing that would count it twice. In headless Chrome it is 0, so the result is the same.
- free = visible − folded rows × 36 − open rows × 1.
- If open lanes × 80 ≤ free, every lane stays at 80.
- Otherwise:
  - video = clamp(52, 80, min(round(free × 0.2), free − audioCount × 60));
  - each open audio lane = clamp(60, 80, floor((free − video) / audioCount));
  - no lane ever goes above 80.
  - The `min(…, free − n × 60)` term is an addition from code-reviewer L14. It only changes the result with 5 or more audio lanes; with 4 lanes it is identical to the prototype.
- **When it recomputes**
  - In the existing observer callback.
  - After fold or unfold.
  - On snapshot restore.
  - On the detail panel's `transitionend` (height).
- **Transition transient: settle, not transient.** While `panel.getAnimations()` is non-empty, the callback stores the metrics and returns without a state update. Lanes refit once on `transitionend`.
- An unchanged recompute returns the same state object, so it causes no render.

**D-29b (`detailPanelOpenHeightCap`)**
- column = scroller `clientHeight` + panel rendered `offsetHeight`. This is the invariant frame.
- cap = floor(column − chrome − Σ(folded ? 36 : min + 1)).
- If cap ≥ 280, there is no cap (`null`). If cap < 120, it is 120.
- The cap only applies while `autoFit && !detailUserResized`.
- The panel renders min(stored, cap) while expanded.
- `aria-valuenow` = rendered height. When collapsed, `aria-valuetext` is `დაკეცილია · {min(stored, cap)} px`.
- **What turns the cap off, and what does not**
  - The user's first separator **vertical** pointermove, or a key on the **open** panel, turns the cap off.
  - It does so through `onUserResize()`, which returns an undo function. Cancel and registry-abort call that undo.
  - A drag or key step starts from the rendered height.
  - A key or pointerdown on a collapsed panel only opens it (stage-1 semantics), and the cap stays.
- A cap-driven height change has no transition: a layout effect disarms it when the cap and the open height changed but the panel's own `size` did not. The next toggle animates again.
- The panel element is found as `scroller.nextElementSibling`. This is documented in doc 020; `ArrangementDetailPanel` takes no ref prop this round.

**Header layout by height**
- **Folded (row 36):** one row with fold · name · (video: icon `＋`) · M · S. Uses `pt-0 pb-1.5`. Volume and `ორიგინალი ხმა` are hidden, and `· აქტიური` is hidden.
  - The video `＋ საკუთარი ვიდეო` becomes an icon `＋` with the same `aria-label` and `title` `საკუთარი ვიდეო`.
  - File drop on the video lane still works: the lane body keeps its handlers.
- **52–59 (video only):** two rows, `gap-0.5 pt-0 pb-1.5`, icon `＋`. **M, S and Volume all stay visible at 52** (browser-checked).
- **60–79:** two rows, `gap-1 pt-0.5 pb-1.5`. The video `ორიგინალი ხმა` line is hidden, and the video volume gets `title` `ვიდეოს ორიგინალი ხმა`.
- **80+:** full layout.
- `pb-1.5` keeps every control above the 6 px handle.
- `justify-center-safe` sends any overflow to the bottom, so `scrollHeight` can see it.

**design-philosopher ruling** (actual subagent, read-only; quoted from its reply)
> "1. Make it borderless with no fill, `h-5 w-5 shrink-0 rounded-sm` … `text-muted hover:text-foreground` … It uses only `aria-expanded`, never `aria-pressed` … Leaving out the border and fill is what makes it read as a disclosure and not a third toggle." · "2. It must be a sibling of the name button, not inside it." · "4. Keep M and S at `h-6 w-6`." · "5. When folded, hide the '· აქტიური' suffix." · "6. Leave it invisible when idle." · "7. Use the same classes as the detail-panel separator: `hover:bg-accent/60`, `focus-visible:ring-2 ring-inset ring-brand`." · "9. … Make '＋' `h-5 w-5` …" · "10. … At 60–75 the labelled '＋ საკუთარი ვიდეო' still fits … keep it there." · "12. Hiding 'ორიგინალი ხმა' below 76 px passes … add `title="ვიდეოს ორიგინალი ხმა"` to the video volume range when compact."

**Applied, with three deviations (all recorded as follow-ups)**
- **(a) Handle z-index.** The ruling asked for **`z-30`**. A uses **`z-20`**, because the sticky ruler block is `z-30` and earlier in the DOM, so a `z-30` handle would paint over the ruler under vertical scroll. `z-20` later in the DOM still paints over the `z-20` sticky header.
- **(b) Fold button spacing.** The fold button has `-ml-1 -mr-0.5` and the labelled `＋` uses `px-1`. The browser showed the video name truncated to "ვი…" (it needs 48 px and had 40.4; it now has 50 of 50).
- **(c) Sub-line threshold.** The video sub-line threshold is 80, not 76, because the header arithmetic gives 80 px of content at full layout.

## 3. Files changed this round

**Changed files (a subset of §3.2)**
- `app/components/arrangement/StudioWorkspace.tsx`
  - The layout state, refs and callbacks: `refreshTrackLaneLayout`, `handleDetailPanelTransitionEnd`, `toggleTrackFold` (ignored while a pointer gesture is active), `changeTrackHeight`, `snapshotTrackLaneLayout(trackId)` and `markDetailPanelUserResized`.
  - One extra line in the existing observer callback and its mount call.
  - `onTransitionEnd` on the right column wrapper.
  - A `ref` on the sticky chrome block.
  - New props passed to `ArrangementLane` and `ArrangementDetailPanel`.
  - **Key handlers: no change.** The ↑/↓ and Space handling for the new controls lives in `ArrangementLane`, using `preventDefault` + `stopPropagation`. `isSeparatorTarget` already guards ←/→ and Enter on the handle (test: ←/→ on the handle do not nudge).
  - Transport, Follow, ruler, marquee maths and footer: no change.
- `app/components/arrangement/ArrangementLane.tsx`
  - The fold button, the height handle, row height via `style`, the density header, `folded` passed to clips.
  - Lane-body and header refs, used for drop forwarding from the handle (only right of the sticky header).
- `app/components/arrangement/ArrangementClip.tsx`
  - Only the `folded` prop: no range body when folded, and the folded `title` line on the root and the header strip.
- `app/components/arrangement/ArrangementDetailPanel.tsx`
  - Only §2.4: `openHeightCap`, `onUserResize`, `openHeight`, the cap-resize transition guard, steps starting from the rendered height, and aria.
- `app/lib/arrangement/panels.ts`
  - New exports: `TrackLaneKind`, `TRACK_*` constants, `TrackLaneFitEntry`, `TrackLaneFitInput`, `DetailPanelCapInput`, `trackMinHeight`, `clampTrackHeight`, `stepTrackHeight`, `trackRowHeight`, `minimumLaneRowsHeight`, `fitLaneHeights`, `detailPanelOpenHeightCap`.
  - Existing exports are unchanged.
- `app/lib/arrangement/__tests__/panels.test.ts` and `detail-panel.test.tsx`: tests added only.
- New: `app/lib/arrangement/__tests__/track-layout.test.tsx`.
- Docs: `019-studio-lab-round10-wrap-ruler.md` (status and TODO lines only) and new `020-studio-lab-track-fold-autofit.md`.

**Confirmations**
- **No round-6..10 file was reverted.** All edits were applied on top of the dirty tree. `git status` shows the same 15 M + Studio `??` set, plus `track-layout.test.tsx` and doc 020.
- **§3.3 frozen files:** 27/27 match `a-round-11/gates/frozen-start.txt` (`gates/frozen-check.txt`). This set includes Header, docs 015–018, the context, preview, position-store, render-budget, dock, `video-sync` (+ test), library, overview, transport, ruler, loop brace, view (+ test), gesture-guard, context test, types, schedule, transport, loop, model and graph.
- **Detail playhead-writer region:** from `function ArrangementDetailPlayhead` through `const ArrangementDetailContent = memo` (284 lines: writer, waveform, overlay, inputs, content), it is **byte-identical** to the round-10 base (`gates/detail-region-cmp.txt`).
- **`Header.tsx`:** `git diff HEAD` produces 0 lines. Against `cc1e531` it is +21/−0.
- **Protected files:** all 4 OK (`gates/protected.txt`).
- **Untracked foreign files:** `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` were not read, edited or deleted. They are reported to root.
- **Doc 019:** `git diff --no-index bak/019.base.md` shows exactly 2 hunks: the status line (`@@ -1,7 +1,7 @@`) and the TODO bullets (`@@ -112,5 +112,5 @@`) (`gates/doc019-diff.txt`).
- **HEAD:** `git log --oneline -1` → `c5ed47b`, so nothing was committed (`gates/git-log.txt`).
- **One slip, no damage:** once, `npx biome format --write app/components/arrangement app/lib/arrangement` was run on whole directories. Hashes were re-checked immediately: all frozen files OK, and `git status` was unchanged. Every later Biome write was given exact file paths.

## 4. Command tails (actual)

```
npx vitest run app/lib/arrangement
 Test Files  21 passed (21)
      Tests  392 passed (392)
npx vitest run
 Test Files  53 passed (53)
      Tests  856 passed (856)        (812 baseline + 44 new: panels +16, detail-panel +5, track-layout 23)
npx tsc --noEmit                      → exit 0
npx biome check <8 owned files>       → Checked 8 files … No fixes applied. (exit 0)
npx biome check app/lib/arrangement app/components/arrangement → Checked 52 files … No fixes applied. (exit 0)
npx biome check ./app                 → Checked 319 files … No fixes applied. Found 218 warnings. Found 1 info. (exit 0, 0 FIXABLE)
npm.cmd run check                     → exit 0, No fixes applied; git diff --stat identical before/after
npm run build                         → ✓ built in 1.75s (exit 0)
git diff app/components/layout/Header.tsx → (empty)
protected-baseline: download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
git diff --stat → 15 files changed, 1768 insertions(+), 261 deletions(-)   (tracked files; new files are ??)
```
- The `sfx-library.test.tsx` load flake did **not** recur. Both full runs were green.

## 5. A's browser checks (evidence, not a verdict)

Headless Chrome, gstack browse.
- Setup: `/studio-lab` anonymous, a video clip imported, then library drops: `სრული მიქსი` → music, `პულსი` → stems, `Soft impact` → SFX.
- Synthetic pointers use `buttons: 1`. Keys use real `$B press` where noted.
- Files are in `a-round-11/runs/`.

**1440×900** (`a-1440-part1.json`, `a-1440-part2.json`, `a-1440-registry.json`, `a-1440-fold-fresh.json`)
- **Defaults:** all rows 81 (header 80 = lane 80). The panel starts open at 144 with `aria-valuenow` 144, and **the cap does not engage**.
- **Fold music:**
  - The row is **36**, with header 35 = lane 35. `aria-expanded` = false; label and title are as specified. Volume is hidden.
  - Folded M: `aria-pressed` false → true → false, and a status is shown.
  - Folded clip: there is no range body, and both titles contain `ხაზი დაკეცილია — დროის მოსანიშნად გაშალე`. A drag on the lower area starts no range.
- **SFX handle:**
  - A drag of +60 gives **140** (row 141).
  - `$B press ArrowUp` ×3 gives **116** (row 117).
  - The selected clip's left edge is unchanged (1112 → 1112), and the undo title is unchanged.
- **Registry:**
  - During an SFX handle drag, a second pointer on the music clip is ignored: left 552 → 552, not selected, undo unchanged.
  - Mute is refused with `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, and `aria-pressed` stays false.
  - `pointercancel` restores 140.
- **Space on the focused fold button (`$B press Space`):** stems folds and unfolds. Play stays `Play` and the position stays `00:00.000`.
- **Mixed heights (music folded, SFX 140):**
  - A header drag music → stems lands on stems.
  - A header drag stems → folded music lands on music, and music stays folded.
  - A marquee from the stems background into SFX selects exactly the 2 expected clips (`2 კლიპი მონიშნულია`).
  - A library drop (`Slow rise`) on SFX lands on SFX at 00:37.500.
  - All rows lie inside the scroller (516), and every header has `scrollHeight ≤ clientHeight`.

**1280×720** (`a-1280-part1.json` … `part3`, `a-1280-fold-fresh.json`, `a-1280-autofit-off-resize.json`, `a-1280-final-sanity.json`)
- **Mount:** the panel starts **collapsed** at 36, with `aria-valuetext` `დაკეცილია · 142 px`. The scroller is 386 because the footer has 2 lines with a selected clip.
- **After the toggle:**
  - The panel is **142** (in [120,144]) and equals `aria-valuenow` 142. The cap is engaged: column 422 − 44 − 236 = 142.
  - Lanes are **52/60/60/60** (rows 53/61/61/61), filling the scroller exactly (280 = 280). The ruler, the loop strip and all 4 rows are inside, with no vertical scroll.
  - Every lane is at or above its minimum.
- **Fold music under auto-fit:** rows 53/36/72/72. The freed height goes back to the other lanes, up to their defaults. The panel goes to 144, because the cap becomes 167.
- **Unfold:** back to 53/61/61/61 with the panel at 142.
- **User override:** dragging the detail separator up 60 gives **202** (142 + 60, starting from the rendered height). `aria-valuenow` is 202, the cap is off, and the timeline scrolls (client 220 < scrollHeight).
  - Note for C: if C expects 144 + 60 = 204, the cap was engaged at the start, so the rendered start was 142.
- **Auto-fit off:** after the SFX drag to 140, resizing the window from 1280×720 to 1280×800 leaves every lane height unchanged (53/36/61/141; the scroller grew from 220 to 300).
- **Fresh fold-1280 state (music folded, SFX 140, panel collapsed):** rows 81/36/81/141, all inside 386, with no scroll.
- **Header sweep** (`a-header-sweep-1280.json`):
  - Video at 52/56/72/76/84 (and folded), stems at 60 and 180, music folded, SFX 140.
  - Every header fits (`scrollHeight ≤ clientHeight`). Every control is inside the header and above the handle.
  - Volume is present at all unfolded heights, video 52 included. The compact `＋` appears at video 52–59 and when folded.
  - (The step labelled `video80` is actually 84.)
- **Video name at full density:** `scrollWidth` 50 = `clientWidth` 50, so it is no longer truncated.

**Shots** (`a-round-11/shots/`)
- `fold-1440.png`: music folded, SFX 140, panel open at 144.
- `fold-1280.png`: music folded, SFX 140, panel collapsed.
- `panels-1280.png`: detail opened, auto-fit 52/60/60/60, panel 142.
- What I saw in the shots:
  - Nothing in the header, transport, dock, lanes, panel or footer overlaps or is clipped.
  - The footer shortcut hint is one line.
  - At 1280 the transport wraps to 2 rows (R10-N8 layout).
  - The compact dock is 160×90.

**Not run by A (C's checks)**
- The export oracles (music muted through the folded M is silent; folded-but-not-muted equals unfolded within 1.2e-7). Fold does not touch `Arrangement`.
- Lane render counts during a detail toggle in the browser, and the RF7-P2 browser profiler.
- R3-V1 mode D.
- G11-3 network checks. No network or auth code was touched.

## 6. Tests

**New `track-layout.test.tsx` (23)**
- **Fold, M/S and the video lane**
  - fold + compact M/S `aria-pressed` and click;
  - the video compact `＋` and the hidden sub-line.
- **History**
  - no history from fold, height or auto-fit, and Undo leaves heights alone.
- **Registry and pointer gestures**
  - the handle claims the registry: a second pointer is ignored, Mute is refused, `pointercancel` restores;
  - a handle pointerdown is ignored during another gesture;
  - a registry abort (window blur) restores the height and auto-fit;
  - a committed drag turns auto-fit off, and moving back to the start Y is honoured;
  - a fold click during a gesture is ignored.
- **Keys and folded lanes**
  - ↓/↑ ±8 with clamp per kind, no nudge, and the transition class on key steps;
  - a key on a folded handle only unfolds;
  - a pointerdown on a folded handle only unfolds;
  - Space on the fold button does not start the transport, and repeat is ignored.
- **Row and clip**
  - one height on the row: the body loses `h-20`, and header and body have no own height;
  - folded clip: the range body is present before the fold and absent after, the title line is present, a lower-area drag starts no range, and a folded trimStart changes the clip by 1 s with one history entry ("Trim — მარცხენა კიდე").
- **Auto-fit**
  - auto-fit 53/67/67/67, fold give-back 53/36/81/81, resize back to defaults, then a manual key turns it off;
  - auto-fit stays on after a fold and after a cancelled drag;
  - the panel-animation skip plus `transitionend` refit: 0 then 1 Profiler commit;
  - no workspace commit on unchanged observer ticks. This comes after one warm-up tick for React's eager-bailout render; a 1 px change gives exactly 1 commit.
- **D-29b cap**
  - cap 130: kept after a click and after a cancelled drag, dropped after a manual lane change (→144);
  - a cap-only change resizes the panel without a transition, and the next toggle animates;
  - a separator key on a collapsed panel only opens it and keeps the cap, a horizontal-only drag keeps the cap, and the first key step on the open panel keeps its transition.
- **Hit testing and drop forwarding**
  - cross-lane drags on stubbed row rectangles 81/36/81/141: music → stems, stems → folded music, music → SFX;
  - drop forwarding from the handle: the ring and the drop only right of the header, including a horizontally scrolled case, and a dragleave into the handle keeps the ring.

**`panels.test.ts` (+16)**
- track clamp and step per kind, row-height convention, minimum rows;
- `fitLaneHeights`: fits, at the limit, 1 px below, 254 → 52/66, 244 → 52/62, short → minimums, video share with 6 lanes, folded subtracted, never above 80, unmeasured;
- cap: fits → null, short → 162/130, impossible → 120, invariant collapsed = open = mid-transition (1280 frame 406 + 36 ≡ 298 + 144 → 162), folded at 36, unmeasured → null.

**`detail-panel.test.tsx` (+5)**
- the cap limits the rendered height, with `aria-valuenow` and `aria-valuetext`;
- a key step starts from the rendered height and turns the cap off;
- a drag starts from the rendered height without a jump;
- a cancelled first drag restores the capped height;
- the cap does not engage on a 660 px column.

**Changed existing assertions:** none. Existing tests were not edited; only new `it`/`describe` blocks were appended.

**Guard proofs** (`a-round-11/guard-proof.txt`; each restored, `cmp` identical)
1. Removing "never above default" in `fitLaneHeights`: 4 tests fail (3 in panels, 1 in track-layout).
2. Computing the cap from the live scroller (+144) instead of the invariant column: 5 tests fail (1 in panels, 4 in detail-panel).
3. Cap-resize classification without the `size`-identity check: 1 test fails (track-layout).

## 7. code-reviewer (actual subagent, four passes)

**Pass 1** (full delta; score 7/10, no High; `review-1-summary.md`)
> "The feature follows the contract in its structure … The real risks are in the timing between the panel transition and the cap … There is also a 6 px drop dead zone under every lane, a jump from 36 to 80 px when dragging a folded lane, a 2 px header overflow for the video lane at 76–77 px … and a no-op drag at exactly the start position."

Fixes:
- **M1:** no state update at all while the panel animates.
- **M2:** `onUserResize` fires on the first real move and returns an undo for cancel and abort.
- **M3:** no transition for a cap-driven resize.
- **M4:** drag events are forwarded from the handle.
- **L5:** a folded handle only unfolds.
- **L7:** a `hasMoved` flag.
- **L8:** bail-out when nothing changes.
- **L9:** comparison against the default.
- **L10/L11:** threshold 80, `pb-1.5`, `justify-center-safe`.
- **L12:** fold is ignored during a gesture, and only a partial snapshot is restored.
- **L13:** the chrome is read through a ref.
- **L14:** the video share is limited by what the audio minimums need.
- **L16:** tests added.
- Not changed: **L6** (contract-literal), **L15** (documented).

**Pass 2** (fix delta 1; score 7.5/10, no High; `review-2-summary.md`)
> "The fixes are substantive and mostly correct … What remains is one fragile spot (M3's one-render suppression), one new wrong behaviour from M4 (drops at 0:00 in the header strip), an asymmetry where opening the panel by key still turns the cap off, and video header heights that fit exactly with no margin."

Fixes:
- The layout-effect disarm.
- The drop gate.
- A key on a collapsed panel only opens it.
- The same-Y guard.
- `pt-0.5`.
- The video name width fix (found in the browser).
- Items 7 and 8 are recorded as follow-ups.

**Pass 3** (fix delta 2; score 7.5/10, no High; `review-3-summary.md`)
> "Item 1 handles the case it was written for … But 'cap changed AND openHeight changed' can't tell a cap-only change from a user step that also clears the cap, so the first keyboard step in the default state still jumps. Item 2 is right at scroll 0 but compares against the wrong edge once the timeline is scrolled sideways."

Fixes:
- The `size`-identity check, with guard proof 3.
- The drop gate now uses `max(body.left, header.right)`, with a scrolled test case.
- `ring-inset` on the two new 20 px buttons.

**Pass 4** (final delta; score 9/10)
> "All three findings from round 3 are fixed. A keyboard step on a capped panel now keeps its animation, while a cap-only change still skips it. Dropping onto the handle strip now respects the sticky header after scrolling, and both new buttons draw their focus ring inside their own bounds. The only remaining note is the optional `ring-inset` on the track-name button."

That last item is pre-existing and out of scope, recorded as a follow-up.

## 8. Deviations (with reasons)

1. **Visible lane area.** The horizontal scrollbar is not subtracted a second time, because `clientHeight` already excludes it. B's formula would count it twice. The result is identical in headless Chrome (0).
2. **Transition transient.** Lanes refit once after the panel's height transition settles (`getAnimations` skip plus `transitionend`); there is no per-frame recompute.
3. **Folded handle.** A key **or a pointerdown** on a folded lane's handle only unfolds it, like the detail separator. §2.2 says "a drag or a key first unfolds it". A drag does not continue in the same gesture, because under auto-fit a folded lane's stored height is the 80 px placeholder, which would make the drag jump.
4. **Folded `aria-valuenow`.** On a folded lane, `aria-valuenow` shows the stored open height, with `aria-valuetext` `დაკეცილია · {h} px` (the detail panel's N2 convention). A folded row is 36 px, which is below `aria-valuemin`.
5. **Handle z-index.** The handle uses `z-20`, not the design ruling's `z-30` (ruler stacking).
6. **Fold button spacing.** The fold button has `-ml-1 -mr-0.5` and the labelled `＋` uses `px-1`, so the video name fits.
7. **Video sub-line threshold.** The sub-line threshold is 80, not 76 (header arithmetic).
8. **Video share limit.** The `free − n × 60` limit on the video share: no effect with 4 lanes.
9. **Fold during a gesture.** Fold is ignored silently while a pointer gesture is active (reviewer L12). Whether it should show `GESTURE_EDIT_BLOCKED_MESSAGE` is a contract question for B.
10. **Cap after a manual lane change.** When a manual lane change turns auto-fit off, the cap is dropped and a capped panel grows to its stored height (reviewer L6). This keeps the contract literal ("cap only while auto-fit is on"). It is inert at the measured budgets unless a clip is selected at 1280×720.
11. **Two cap budgets at 1280×720.** The step-1 budget had no selected audio clip. With a selected clip the footer adds a line, the scroller shrinks by 20 px, and the cap engages at 142. C's R11-P2a numbers will depend on the selection.

## 9. Not ready / not verified by A

- No acceptance ID is claimed as PASS: R11-P2, R11-P2k, R11-P2a, R11-P4, R11-U and R11-Doc are all **pending C**.
- **Not exercised by A:**
  - **R11-P2:** the two export oracles.
  - **R11-P2a:** the browser lane render count during one detail toggle (covered only by the jsdom Profiler test).
  - **§6 RF7-P2 browser profiler, R3-V1 mode D and G11-3:** not run.
- **Follow-ups for B** (panel polish round, recorded in doc 020 TODO):
  - the silent fold refusal during a gesture;
  - the cap dropping on a manual lane change;
  - folded `aria-valuenow`;
  - no `aria-controls` on the fold button;
  - Home on separators triggers the global seek;
  - `ring-inset` on the track-name button;
  - the panel found through `nextElementSibling`;
  - the detail panel opening jump when the user then changes a lane.
- **Root carry:** the root pre-push review items listed as still carried in task §6.5 are untouched by this round:
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction paths;
  - export hard-clip (R13-M4);
  - the final commit and push.
- **Foreign untracked agent files:** reported to root as is.

## 10. Exact next checks for C

1. **R11-P2 at 1440×900**
   - Fold music: row 36 ±1, header = lane.
   - Folded M/S `aria-pressed`.
   - Export oracles.
   - SFX drag +60 → 140, then `$B press ArrowUp` ×3 → 116, with the selected clip not nudged.
   - Clamps at 60/180, video 52.
   - Mixed heights: music → stems, stems → folded music, marquee stems → SFX, library drop on SFX.
   - Undo after view-state changes.
   - Folded-clip title, lower-area no-range, folded trim with one history entry.
2. **R11-P2k:** Space on the fold button; a second pointer and Mute during a handle drag; `pointercancel`.
3. **R11-P2a at 1280×720**
   - Record whether a clip is selected:
     - no selection → panel 144, lanes 52/66/66/66;
     - a selected audio clip → panel 142, lanes 52/60/60/60.
   - Check that all rows are inside with no scroll and that the panel equals `aria-valuenow`.
   - D-29a mount state at both viewports.
   - User override +60, which starts from the rendered height.
   - Auto-fit off, then a window resize.
   - 1440 defaults.
   - Fold give-back.
   - Lane render count during one detail toggle. A expects one lane render after `transitionend`. A later observer tick may produce one StudioWorkspace commit that is React's eager-bailout render with **zero** lane renders. If the probe counts workspace commits rather than lane renders, that commit is not a lane render.
4. **R11-P4:** shots and header `scrollHeight` at both viewports.
5. **R11-U and R11-Doc:** re-run the test files; read docs 019 and 020.
6. **§6 regressions:** R11-P1b (the cap does not engage at 1440), R11-P1c, R9-D3 (`gates/detail-region-cmp.txt`), RF7-P2, R8-M1/R6-S2/R12-L3 on default heights, R10-N8/R11A-3, R3-V1 mode D (information only), G11-1..3.
