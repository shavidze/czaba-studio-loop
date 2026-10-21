# A — Round 13 report: SRW-11B stage 3, floating expanded video (VID-06, D-29d)

Date 2026-10-10 · Implementer A (Claude Opus 5.5) · Task `current-task.md` (round 13) · **No PASS is claimed. Everything below is A's evidence, pending C.** Nothing was committed.

## 1. Pre-flight gate

**Assumptions**
- D-29d wins over D-29 and the prototype where they differ. The prototype is behaviour reference only and was not run or edited.
- Placement uses the real `<aside>` rect. While waiting for the library transition, the box stays compact in the dock and no placeholder shows. The prototype hides the box instead; hiding a playing `<video>` is a sync risk, so the box is never hidden.
- ⠿ is the drag handle, so a pointer drag that starts on ⠿ is allowed. Only ⤢ and ✕ (`data-video-float-action`) are excluded from drag start. This reads "excluding its buttons" as excluding the action buttons.
- Space semantics are unchanged (§2.2). Enter activates the focused button.

**Containing-block measurement (before code).** Ancestors of the dock box after load: `section` → `div.flex-col` → `div.flex` → `div.studio-container` → `div.page-transition-wrapper` → `body` → `html`. Every one reports `transform: none`, `filter: none`, `contain: none`, `will-change: auto`, `perspective: none` and `backdrop-filter: none`. This holds both on direct load (`a-round-13/runs/containing-block-1440.json`) and after the header-link navigation (`containing-block-1440-headerlink.json`). The wrapper carries `opacity: 0; transform: translateY(4.94px)` about 100 ms into the route enter and resets to `transform: none` when the animation ends. The video cannot be expanded in that window (state starts compact on mount), so this is **not** a stop condition. The site `Header.tsx` (z-50) is not mounted on `/studio-lab`: the only `<header>` is the studio's own static bar.

**Design-philosopher (FB-08), actual subagent, read-only. Verdict quoted:**
> "**Verdict: APPROVE WITH NOTES.** Nothing in the proposal conflicts with D-29d, so there is nothing to report to B. … (a) The position is right. The floating box covers the library, the area you need least while judging picture against sound … A 640 px cap keeps it a reference monitor … (b) 24 px meets WCAG 2.2 AA (2.5.8) … Keep the controls always visible … Give ⠿ an aria-label and `tabIndex=0` … the ⤢, ✕ and ⠿ buttons should set `cursor-pointer` or `cursor-grab`. (c) Good: a dashed outline, muted text, and a quiet text button … Keep the border radius identical to the video box … (d) z-40 is correct … the shared `Modal` uses `z-[1000]` … One related risk: `Header.tsx:50` is `sticky top-0 z-50` … a note, not a contract conflict."

All notes were applied. The header note does not apply because the header is not mounted, as measured above. **No conflict for B.**

**Smallest design:**
- view state plus a few handlers in `StudioWorkspace`;
- the library becomes controlled;
- the dock box toggles classes and inline styles, plus a placeholder and three buttons;
- three pure functions in `panels.ts`.

**Files touched, with reasons:**
- `StudioWorkspace.tsx`: view state, Esc, placement timing, props.
- `ArrangementLibrary.tsx`: controlled collapse and `asideRef`.
- `ArrangementVideoDock.tsx`: the layout-only box change.
- `panels.ts`: the maths.
- `panels.test.ts`: added tests.
- `floating-video.test.tsx`: new component tests.
- Doc 021: status and TODO.
- Doc 022: new implementation doc.

**Success commands (§7):** listed in §4 below with their tails.

**Before the first edit:**
- `sha256sum -c b-round-12-tree-sha256.txt` gave 38/38 OK (`a-round-13/gates/sha-start-all.txt`).
- `frozen-start.txt` (31 files) equals B's hashes (`frozen-expected.txt`, diff empty).
- Base backups are in `a-round-13/bak/*.base.*`, 6 files. Each matches `b-round-12-tree-sha256.txt`, and the dock base is byte-equal to `a-round-12/bak/ArrangementVideoDock.final.tsx`.

## 2. Design

**State lift.** `StudioWorkspace` owns:
- `isLibraryCollapsed`
- `isVideoExpanded`
- `libraryOpenedForVideo`
- `videoFloatAnchor` (the initial placement rect)
- `libraryAsideRef`

None of these are in `Arrangement`, history or `ArrangementContext`. Undo and export ignore them.

Props:
- `ArrangementLibrary` gets `isCollapsed`, `onCollapsedChange` and `asideRef?` (a plain `RefObject` prop, not `forwardRef`, so render-budget's function names are unchanged).
- `ArrangementVideoDock` gets `isVideoExpanded`, `videoFloatAnchor`, `onVideoExpandedChange` and `claimPointerGesture`.

Handlers:
- `expandFloatingVideo` sets the expand status and, if the library was collapsed, the temporary-opening status.
- `returnFloatingVideo` collapses the library again if it was opened for the video.
- `changeLibraryCollapsed` runs ◀ while expanded: video compact, library collapsed, `libraryOpenedForVideo` cleared, and the verbatim status. ▶ also clears `libraryOpenedForVideo`, as the prototype does.

**Dock layout and same nodes.**
- The existing 16:9 box (the parent of both `<video>`s) only switches classes: `relative w-40` becomes `fixed z-40 cursor-move touch-none shadow-lg ring-1 ring-outline`.
- While floating it gets inline `left`/`top`/`width`; `aspect-video` gives the height.
- No portal, reparent, key or remount. Both `<video>` elements keep their refs, roles, `muted`, test ids and classes.
- The placeholder is a sibling rendered *before* the box in a stable conditional slot, so the box keeps its child index. It is 160×90 (`w-40 aspect-video`, dashed `border-outline`), with `ვიდეო გაფართოებულია` and a `დაბრუნება` button (`aria-label` `ვიდეოს პატარა ხედზე დაბრუნება`).
- Controls sit top-right at z-30, above the z-20 gap captions:
  - ⠿ (`ვიდეოს გადატანა (ისრებით 16 px)`) and ✕ (`გაფართოებული ვიდეოს დახურვა`) render only while floating;
  - ⤢ is always there, and its `aria-label` toggles between `ვიდეოს გაფართოება` and `ვიდეოს პატარა ხედზე დაბრუნება`.
- Drag position is dock-local. While dragging, `box.style.left/top` is written imperatively, so there is no React render per move. The position is committed to state once at gesture end, clamped to the current viewport. While a drag is active, ⠿ arrows and the resize re-clamp do not move the box.
- `data-testid="arrangement-video-box"`, `data-video-expanded` and `data-video-floating` were added for tests and C.
- **The two sync `useEffect`s and `publishCounters` are byte-identical** (`a-round-13/gates/dock-effects-eq.txt`: block l.236–663 of the round-12 final, 428 lines / 14,280 bytes, `identical: true`).

**Esc precedence.** The Esc branch sits in the existing workspace `keydown`, right after the early return and before Space and navigation. It acts only when `!event.defaultPrevented && isVideoExpanded`, then calls `preventDefault()` and returns the video. The early return is now `exportOpenRef.current || exportKeyEventRef.current === event || isTypingTarget(target)`; see the bug in §8.1. The library search's own Esc calls `preventDefault`, so a focused search clears first.

**Placement timing:**
- Library already open and not animating: placed immediately in the click handler.
- Library open but its width transition still running (▶ then ⤢ within 300 ms, detected by a width `CSSTransition` in `aside.getAnimations()`): wait as below.
- Library collapsed: the library opens and `libraryOpenedForVideo` is set. If a width transition is active (`transitionProperty` includes `width` or `all` with a duration > 0), the box is placed on the aside's own `transitionend` or `transitioncancel` with `propertyName === 'width'`. A single fallback timer (duration + delay + 100 ms) covers a missing event. Otherwise the box is placed on one `requestAnimationFrame`.
- No rAF polling.

**Maths (`panels.ts`, pure, no DOM):**
- `FLOATING_VIDEO_OFFSET_PX` 8, `FLOATING_VIDEO_MAX_WIDTH_PX` 640, `FLOATING_VIDEO_LIBRARY_INSET_PX` 16, `FLOATING_VIDEO_KEY_STEP_PX` 16, `FLOATING_VIDEO_ASPECT_RATIO` 16/9.
- `placeFloatingVideoOverLibrary(library, viewport)`.
- `clampFloatingVideoRect(rect, viewport)`: [0, v − size]; 0 when the viewport is smaller than the box; 0 for non-finite input.
- `stepFloatingVideoRect(rect, key, viewport)`: arrows step 16 px; any other key, including `'constructor'`, returns null (a `Map` is used, not an object).
- Existing exports are byte-unchanged; only additions.

## 3. Files actually changed (subset of §3.2)

- `app/components/arrangement/StudioWorkspace.tsx`
- `app/components/arrangement/ArrangementLibrary.tsx`
- `app/components/arrangement/ArrangementVideoDock.tsx`
- `app/lib/arrangement/panels.ts`
- `app/lib/arrangement/__tests__/panels.test.ts` (tests added only; all 28 existing tests unchanged, so there is no named exception)
- `app/lib/arrangement/__tests__/floating-video.test.tsx` (new)
- `docs/implementation/2026/quarter-IV/021-studio-lab-post-swap-settle.md` (status and TODO lines only)
- `docs/implementation/2026/quarter-IV/022-studio-lab-floating-video.md` (new; every result marked "pending C")

Confirmations:
- **No revert of the round-6..12 work.** `sha256sum -c b-round-12-tree-sha256.txt` at the end shows exactly the 6 owned pre-existing files as changed, and the other 32 OK (`gates/sha-end-changed.txt`).
- **Frozen subset.** `frozen-start.txt` equals B's hashes, and all of those files still verify OK at the end.
- **`Header.tsx`** equals HEAD (`git diff --quiet HEAD` passes; vs `cc1e531` still +21/−0).
- **Dock effects diff** is 0 (above). Diff hunks vs the round-12 final are `1c1,11 8a19,24 26a43 36a54,60 208a233,236 211c239,245 664a699,833 681c850,887 707a914,953`. All of them are imports, constants, the helper, props, and the new state, handlers and JSX after l.663 (`a-round-13/diff-dock.txt`).
- **Instrumentation** grep is 0 (`gates/instrumentation-grep.txt`). Guard mutations were restored with `cmp` each time.
- Final owned hashes: `gates/owned-final-sha256.txt`.

## 4. Command tails (final code)

```
sha256sum -c b-round-12-tree-sha256.txt   → 6 FAILED (exactly the owned files above), rest OK
npx vitest run panels.test.ts floating-video.test.tsx → 37 + 28 passed
npx vitest run app/lib/arrangement        → (intermediate) 21 files / 422 passed before new tests; final all-suite below
npx vitest run                            → Test Files 54 passed (54) · Tests 914 passed (914)
npx tsc --noEmit                          → exit 0
npx biome check app/lib/arrangement app/components/arrangement → Checked 53 files … No fixes applied (0 errors, 0 warnings in owned files)
npx biome check ./app                     → Checked 320 files … No fixes applied · Found 218 warnings · 1 info (0 errors; same 218 as rounds 11–12, none in owned files)
npm run build                             → ✓ built in 2.67s · BUILD_EXIT=0
git status --short                        → §3.1 baseline + ?? floating-video.test.tsx + ?? 022 doc (gates/git-status-end.txt); foreign .claude/.codex frontend-architect files untouched
git diff --stat                           → 17 files changed, 2609 insertions(+), 272 deletions(-)
git diff app/components/layout/Header.tsx → empty (== HEAD)
diff a-round-12/bak/ArrangementVideoDock.final.tsx … → only hunks listed in §3
protected-baseline                        → 4/4 OK
```

Vitest grew from 877 to 914: +9 in panels and +28 in floating-video. The `sfx-library` flake did not recur.

`/check`: `--write` was used only on owned files (`ArrangementVideoDock.tsx`, `StudioWorkspace.tsx`, `panels.test.ts`, `floating-video.test.tsx`). `npm run check` was not run, and neither was `npm run format`.

## 5. A's browser runs (headless gstack browse, `a-browse.json`, dev server 127.0.0.1:5173; evidence, not a verdict)

Setup is C's harness (`setup.sh` + `c-round-7/scripts/r3v1lay.js`). Raw files are in `a-round-13/runs/`.

**Code version per result.** The F1–F4 numbers, the reduced-motion and preview checks, and the F6 shots were taken before the last change: the functional ⠿ arrow update (§8.2, 4 lines in the key handler, `diff-fix-delta-3.txt`). The F3 Export/Space/Enter re-check ran after the Export fix (§8.1). F5F_1..3, G13-3 and the console check ran on the final hashes (`gates/owned-final-sha256.txt`). The last change cannot affect the earlier measurements, apart from the arrow burst, which is now +48.

**Console:** `$B console --errors` after ⤢ and a synthetic drag +200/+100 on the final code shows "(no console errors)". The drag landed at 208,192 (`runs/console-errors-drag.txt`).

**R13-F1 (expand and place).** Files: `runs/f1-1440.json`, `runs/f1-1280.json`.

| Viewport | Library rect | Expected L/T/W | Box after ⤢ | Placeholder | Dock h | Lanes | Detail h |
|---|---|---|---|---|---|---|---|
| 1440×900 | 0,84,288 | 8 / 92 / 272 | fixed 8,92,272×153 | 1268,92,160×90 | 107→107 | 81×4 → 81×4 | 144→144 |
| 1280×720 | 0,122,288 | 8 / 130 / 272 | fixed 8,130,272×153 | 1108,130,160×90 | 107→107 | 81×4 → 81×4 | 36→36 |

At both sizes:
- the expand status is verbatim and the `aria-label` toggles;
- the `<video>` nodes are the same;
- both videos stay muted, with exactly one visible (`active`).

**R13-F2 (move and clamp), 1440:**
- Drag +200/+100 from 8/92 lands at 208/192.
- A drag beyond bottom-right lands at 1168/747 (= 1440 − 272, 900 − 153); beyond top-left at 0/0.
- ⠿ with three real `$B press ArrowRight`: 0 → 48. The selected clip stays at start 00:00.000, the position at 00:00.000, zoom 678, scrollLeft 0.
- Bottom-right 1168/747, then viewport 1280×720, re-clamps to 1008/567.
- In-browser, the second-pointer and history checks are covered by unit tests only (see §6). The Follow/no-scroll check was not measured in the browser.

**R13-F3 (returns), on the final code where it matters:**
- ✕, the placeholder button and Esc (real `$B press Escape`, focus on body) each return the box to `relative` 1268,92,160×90 with `style=""` and no placeholder; after ✕, focus is on ⤢.
- Search "pulse": the 1st Esc clears the field and the video stays fixed; the 2nd Esc (after blur) returns it.
- **Export open:** the dialog covers the box centre (`elementFromPoint` is outside the box, box z 40). A real Esc closed the dialog and the video stayed `fixed 8,92`. On the pre-fix code this failed; see §8.1.
- Space on ⤢, ✕ and ⠿ toggles Play/Pause, and the video stays expanded. Enter on ✕ returns the video, focus goes to ⤢, and Enter on ⤢ expands again.

**R13-F4 (library interplay), 1440:**
- ◀ while expanded gives compact plus library 40 px, with the status `ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.`
- ⤢ from the rail: per-frame samples show floating `false` at 16 ms (library 40), then `true` at 336 ms (library 288). Box 8,92,272. The temporary-opening status is verbatim.
- ✕, and separately Esc, collapse the library back to 40.
- ▶/◀ without the video work as before.
- Preview: "■ შეჩერება" while playing; after ◀/▶ it shows "▶ მოუსმინე" and "▶ ისმის" is gone.
- Separator via keys: 480 max, 288 min.
- Reduced-motion simulation (`transition-property: none` set on the aside, which is what the media query applies): computed is `none|0.3s`, and the box is placed on the next frame (floating at 32 ms), at 8,92,272.

**R13-F5 (same nodes and sync, R3-V1 layout, 1440).** Script `a-round-13/scripts/rf13.js`: C's `rf7.js` plus actions at 1.0 s ⤢, 2.5 s synthetic drag +200/+100, 3.5 s ⠿ ×3 ArrowRight (synthetic keydown), 5.0 s Esc, running to 8.5 s. Three valid runs on the **final** code (`runs/f5-final-summary.txt`):

| Run | median \|d\| | max \|d\| (excl.) | raw max | over 0.1 | writes while seeking | rate | same nodes | paused in clip | layout counters (before → +300 ms) | counters (before → after) |
|---|---|---|---|---|---|---|---|---|---|---|
| F5F_1 | 0.0122 | 0.0186 | 0.0263 | 0 | 0 | 1–1.40 | always | 0 rows | all 0, no change | swaps 0→1, settles 0→1, fallbacks/hardSeeks/escalations 0 |
| F5F_2 | 0.0090 | 0.0158 | 0.0212 | 0 | 0 | 1–1.45 | always | 0 rows | all 0, no change | same |
| F5F_3 | 0.0134 | 0.0187 | 0.0187 | 0 | 0 | 1–1.45 | always | 0 rows | all 0, no change | same |

Every run also had: one visible `<video>` and muted throughout, `afterOk` true, 0 ms of multi-playing, worst frame gap 0.055–0.065 s. The box positions are 8,92 → 208,192 → 256,192 → compact 1268,92.

The harness `hardSeeks` list shows one active `currentTime` write at about 8.46 s on `v2` (0.46 s after the clip-2 swap; seek 10–12 ms), while dock `data-video-hard-seeks` stays 0. It is 3.5 s after the last layout change and comes from the unchanged sync code. I report it rather than interpret it.

An earlier 3-run set on the pre-final code (`runs/f5-summary.txt`, F5_1..3) also passed (max |d| 0.016–0.019). It exposed the arrow-burst stale-rect bug (+16 instead of +48), which was fixed (§8.2).

**R13-F6 (shots, `a-round-13/shots/`):**
- `video-expanded-1440.png`
- `video-expanded-1280.png`
- `video-expanded-libcollapsed-1280.png` (temporary opening)
- `video-compact-after-1280.png`
- `export-open-over-video-1440.png`

Layout numbers for each are in this report. The footer hint is 1 line in all of them. The box overlaps only the library, and the compact box or placeholder is 160×90. R10-N8 transport conformance was not separately audited by A.

**G13-3 (anonymous):** `runs/network-direct.txt`, `runs/network-headerlink.txt`.
- No `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 host.
- Media requests are only `/middle-east.mp3` and `/videos/hero/hero-music.mp3`.
- Other requests are the known root `GET localhost:5199/api/cart` and GA with consent denied. The header-link run also loads the home page's Unsplash image, which is home content, not the workspace.
- Anonymous `curl /api/studio-token?product=middle-east&file=mix.mp3` returns **401**. A fake Bearer returns **500 `{"error":"Unable to prepare Studio access"}`**, with no token.
- `/studio/middle-east` shows "Sign in required".

## 6. Tests

**`panels.test.ts`: +9 tests, 37/37.** Coverage:
- constants;
- narrow library (288 → 272×153; 480 → 464×261), 640 cap with 16:9, and the clamped initial placement;
- non-finite and too-narrow library gives width 0;
- clamp at every edge, a viewport smaller than the box, and non-finite inputs;
- the four arrows, other keys including `'constructor'` returning null, and the step clamp at each edge.

No existing test changed.

**`floating-video.test.tsx`: 28/28.**
- Original 18:
  - expand keeps the same box and both `<video>` nodes, and renders the placeholder;
  - placement 8/96/272, the status and the label toggle;
  - ✕, the placeholder button and Esc each return, with the same nodes;
  - Esc does nothing when `defaultPrevented`, in a plain text field or with Export open;
  - search precedence;
  - ◀ while expanded, with the status;
  - the temporary opening and re-collapse, plus the 40 px rail;
  - reduced motion (`transition-property: none`, `0.3s`) gives next-frame placement;
  - `transitionend` filtering (child target and opacity are ignored);
  - ⠿ arrows: no clip nudge, no undo, no zoom, no seek;
  - pointer drag with clamp and the registry (a second pointer on a clip is ignored, release on up);
  - ⤢ and ✕ don't start a drag;
  - return releases an active drag;
  - resize re-clamps and a library width change doesn't move the box;
  - Space stays the transport toggle.
- Added after the reviews and browser findings (10):
  - the fallback timer;
  - a pending placement cancelled by ◀ or Esc is never placed (×2);
  - the drag position is committed;
  - blur abort;
  - ⠿ gets focus on pointerdown;
  - focus returns to ⤢ (and not after ◀);
  - arrows and resize are ignored during a drag, then the clamped commit;
  - Export + Esc in real browser order (`flushSync` between listeners, with an in-listener assertion that the dialog is already gone);
  - a synchronous arrow burst applies every step (+48).
- The drag-release test was hardened: it moves before Esc, then re-expands and checks that a leaked listener cannot move the box. `cancelAnimationFrame` became a real stub that removes the frame. `as const` was replaced by a typed array.

**Guard proof** (`a-round-13/guard-proof.txt`; every mutation restored, confirmed with `cmp`):
1. Box `key` on the expanded state (remount): 18/18 fail, then 22/25 on the post-review code, including the same-node test.
2. Esc branch hoisted above the early return:
   - pre-review code: the plain-text-field and Export-open tests fail (2). The search-precedence test stays green there, because the search's own `preventDefault` plus the kept `defaultPrevented` check still protect it. The task's "(search-precedence … fail)" is therefore only true together with 2b.
   - **final code via `hoist2.cjs`**: 3 fail (text field, Export, Export real-order).
   - Two log entries made with the stale `hoist.cjs` are marked INVALID in the file: no mutation was applied.

   2b. Hoisted and without `defaultPrevented`: 4 fail on pre-review code, 5 on the final code, search precedence included.
3. ⠿ without `stopPropagation`: the arrow test fails (clip 2 → 2.2).
4. No focus on ⠿ at pointerdown: the focus test fails.
5. No focus return to ⤢: the focus-return test fails.
6. No commit at drag end: the commit test fails.
7. Arrows applied during a drag: the drag-interplay test fails.
8. Early return without the capture-phase Export mark: the real-order Export test fails (with the in-listener flush assertion passing).
9. Non-functional arrow update: the burst test fails.

## 7. Code-reviewer (actual `code-reviewer` subagent), three passes

**Review 1 (full diff), 8/10:**
> "I found no Critical or High issues … Medium 1. Focus is lost on return … 2. Clicking ⠿ with a mouse never focuses it … 3. The whole dock re-renders on every pointermove … Low 4. The fallback timer isn't in the contract … also listen for `transitioncancel` … 5. The 'library already open' path can measure mid-animation … 6. The status text goes stale after ✕ or Esc … 7. `as const` in the test … Test weaknesses …"

Fixes:
- M1: focus returns to ⤢ if it was inside the float and is now lost.
- M2: ⠿ is focused on pointerdown.
- M3: imperative moves plus one commit at the end.
- L4: the timer is kept, `transitioncancel` was added, and both are documented as a deviation.
- L5: the `getAnimations` check.
- L7: a typed array.
- All test weaknesses were addressed, except "real layering" in jsdom, which was checked in the browser (§5 F3).
- **L6 was not changed** (see §9).

**Review 2 (fix delta), 8/10:**
> "M1, M2, L4, L5 and L7 are fixed correctly. One Medium regression … A React write can snap the box back mid-drag … Resize … Arrow keys … Fix: make both handlers do nothing while `floatDragCleanupRef.current` is set … Re-entry order … The line is redundant … ◀ focus depends on the browser …"

Fixes: arrows and the resize re-clamp are ignored during a drag, the commit at drag end clamps to the current viewport (test plus Guard 7), and the redundant line was removed. The ◀ focus test's weakness is acknowledged, not fixed (Safari behaviour; the test checks only "not ⤢").

**Review 3 (second delta: the Export real-order fix and the drag-interplay fix), 8/10:**
> "Both fixes look correct. Nothing blocks merge … [Medium] … never checks that the flush actually happened … Add a check inside `flushBetweenListeners` that `[role=dialog]` is already gone … [Low] The ref keeps the last KeyboardEvent … harmless … [Low] Ending a drag now always calls `setFloatRect` … one extra render."

Fix: the in-listener assertion was added and Guard 8 was re-run (the mutant fails on the video assertion while the flush assertion passes). The two Lows were accepted as they are.

**Review 4 (final arrow-update delta, `diff-fix-delta-3.txt`):**
> "No blocking findings. The functional update … is correct. Event pooling: React 18 no longer pools events … The `next` gate: `next` (line 820) is now only used to check that the key is an arrow key … Low, :820/:827: the viewport is read twice … Low, :824-826: during a drag the arrow key is still blocked … That looks intended."

Both Lows were accepted without a code change: they are cosmetic, and changing the code would re-hash the owned files after the final browser runs.

## 8. Deviations and findings, each with its reason

1. **Bug found in the browser, fixed: Export + Esc.** With Export open, a real Esc closed the dialog **and** returned the video. The browser runs a microtask checkpoint between listeners, so React flushed the Modal's `document`-listener `onClose` before the workspace `window` listener ran, and `exportOpenRef` was already false. jsdom's synchronous `dispatchEvent` hides this.

   Fix: a capture-phase `window` keydown listener marks the event when Export is open, and the early return also checks that mark. This touches the early-return line that §2.1 describes. The only newly ignored keys are keys where Export was open at capture time and closed before bubble. C should re-check "Esc with Export open" with a real press.
2. **Bug found in the browser, fixed: arrow burst.** Three synchronous ArrowRight keydowns moved the box 16 px instead of 48, because of a stale rect between renders. Fixed with a functional `setState`. Real `$B press` gave +48 even before the fix.
3. **Reduced-motion condition.** Tailwind's `motion-reduce:transition-none` emits only `transition-property: none` (verified in the page CSS and in the computed `none|0.3s`). §2.2's literal "computed `transitionDuration` non-zero" would wait forever for `transitionend` under reduced motion. The gate is therefore "width (or `all`) in `transitionProperty` **and** duration > 0".
4. **Fallback timer** (duration + delay + 100 ms) and the **`transitioncancel`** listener: not named in D-29d; added so placement cannot hang (for example when a separator drag starts mid-open and removes the transition class). Not polling.
5. **Already-open library still animating:** the box waits for the transition instead of measuring a mid-animation width (review L5).
6. **⠿ starts a pointer drag** (it is the handle). Only ⤢ and ✕ are excluded from drag start.
7. **Unplaced state:** while waiting for the library transition the box stays compact and no placeholder shows (prototype: box hidden). This keeps the video visible during the ≤ 300 ms wait.
8. **Focus management** (review M1/M2) is beyond the contract's text but within its accessibility intent.
9. **Imperative drag positioning** (review M3): `left`/`top` are written to the box style during a drag and committed to state at the end. This only touches the box's inline style; no sync line changed.
10. A's F5 used synthetic keydown for the ⠿ arrows inside the timed script (`$B press` cannot run inside the in-page timeline). C's F5 uses real presses.

## 9. Not ready / open (do not mark PASS from this report)

**Full acceptance IDs not ready:** none. Every R13 item is implemented, but none is verified by C. All of R13-F1..F6, R13-U and R13-Doc are pending C.

**Not measured by A** (C should run them):
- R12-W1 ×1 with the video expanded (L6 `drift12.sh`);
- R12-S read from the first arm;
- RF5-3 ×1 counters;
- RF7-P2 (A only ran `render-budget.test.tsx` green: it is in the 914, and its sha is unchanged);
- the F2 second pointer in the browser and the Follow/no-scroll check during a drag;
- the full R10-N8 transport audit in the shots.

**For B:**
- **L6:** the expand status (`… Esc ან ✕ აბრუნებს.`) stays in the footer after the video returns. Neither the contract nor the prototype sets a return status. Decide whether to add one, for example with polish 14a.
- Deviations 1, 3 and 4 above touch contract wording (the early return in §2.1, the reduced-motion condition and the fallback timer in §2.2 / D-29d). Consider recording them in D-29d.
- The ◀ focus-return test only asserts "not ⤢". Browser-dependent focus-on-click (Safari) is unverified.

**Carried, unchanged:**
- The Tech Lead's R11-P3m (drag with a real mouse) and R11-SB (1280×720 temporary opening vs a real scrollbar).
- The quiet-Chrome RF7-3, C-R6-02 and C-R8-01.
- C-R12-01 goes to the milestone RF5-3.
- Root carry: the purchased loader hardcodes middle-east (SRW-21); Lenis on `/studio/*`; portable instruction paths; the export hard-clip at 0 dBFS (SRW-13); the final commit/push only after everything; the uncommitted round-6..13 tree.
- The foreign `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` are untouched; root decides about them.

## 10. Exact next C checks

1. **G13-2.**
   - Run `sha256sum -c a-round-13/gates/owned-final-sha256.txt`: 8 OK.
   - Verify the frozen subset against `b-round-12-tree-sha256.txt`.
   - Run the dock effects comparison: `node a-round-13/scripts/effects-eq.cjs a-round-12/bak/ArrangementVideoDock.final.tsx store/app/components/arrangement/ArrangementVideoDock.tsx`, which should report `identical: true`.
2. **R13-F3 with real presses**, focused on Esc with Export open (the bug fixed in §8.1) and the search precedence.
3. **R13-F5 ×3** with real presses for the ⠿ arrows and Esc. Also look at the about-8.46 s active `currentTime` write noted in §5.
4. **R12-W1 ×1 with ⤢ expanded before Play** (L6), plus R12-S from the first arm and RF5-3 ×1 compact.
5. **R13-F2 in the browser:** a second pointer during the drag (D-26), and Follow while playing (no timeline scroll during the drag).
6. **The dock quick check (compact) and R11A-1 quick**, at both viewports.
7. **G13-1 and G13-3 as specified.**

## Appendix: verbatim command tails (final code)

```
$ tail -4 gates/vitest-all.txt
      Tests  914 passed (914)
   Start at  21:18:41
   Duration  30.35s (transform 6.36s, setup 0ms, import 17.05s, tests 24.99s, environment 55.72s)

$ tail -4 gates/tsc.txt
TSC_EXIT=0

$ tail -4 gates/biome-owned.txt
Checked 53 files in 156ms. No fixes applied.

$ tail -4 gates/biome-app.txt
Diagnostics not shown: 199.
Checked 320 files in 483ms. No fixes applied.
Found 218 warnings.
Found 1 info.

$ tail -4 gates/build.txt
build/server/assets/app-LqrELMFE.css       195.17 kB
build/server/index.js                    1,274.09 kB
✓ built in 2.23s
BUILD_EXIT=0

$ sha256sum -c b-round-12-tree-sha256.txt (non-OK lines)
app/components/arrangement/ArrangementLibrary.tsx: FAILED
app/components/arrangement/ArrangementVideoDock.tsx: FAILED
app/components/arrangement/StudioWorkspace.tsx: FAILED
app/lib/arrangement/__tests__/panels.test.ts: FAILED
app/lib/arrangement/panels.ts: FAILED
docs/implementation/2026/quarter-IV/021-studio-lab-post-swap-settle.md: FAILED
sha256sum: WARNING: 6 computed checksums did NOT match

$ protected-baseline
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK

$ sha256sum -c gates/owned-final-sha256.txt
app/components/arrangement/StudioWorkspace.tsx: OK
app/components/arrangement/ArrangementLibrary.tsx: OK
app/components/arrangement/ArrangementVideoDock.tsx: OK
app/lib/arrangement/panels.ts: OK
app/lib/arrangement/__tests__/panels.test.ts: OK
app/lib/arrangement/__tests__/floating-video.test.tsx: OK
docs/implementation/2026/quarter-IV/021-studio-lab-post-swap-settle.md: OK
docs/implementation/2026/quarter-IV/022-studio-lab-floating-video.md: OK
$ dock effects
{"found":true,"lenA":14280,"lenB":14280,"identical":true,"linesA":428}
```
