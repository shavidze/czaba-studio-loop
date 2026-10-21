# A — Round 8 report (SRW-11B stage 1: Clip Detail panel, PNL-01 / FB-08)

Date: 2026-10-09 · Implementer: A (Claude Opus 5.5) · Task: `current-task.md` (round 8, bounded)
Baseline: HEAD `c5ed47b` + the 14 modified / 2 untracked round-6/7 files (none reverted, none reformatted). No commits, stash, checkout, push, deploy or installs. Dev server `http://127.0.0.1:5173` reused (not started or stopped). Browser only through gstack browse, state `tmp/studio-real-loop/a-browse.json`. Harness copies and evidence are in `%TEMP%/a8` (C's `c-round-*` files were only read).

**No PASS is claimed. Everything below is A's own evidence and is pending C.**

## 1. Pre-flight gate

- **Assumptions:**
  1. Timeline range selection works on every clip body, including video. `ArrangementClip.tsx` `beginGesture('range')` on the body div has no kind gate. So the inputs are enabled for any single clip.
  2. The 0-render goal is met by a `memo` content component (`ArrangementDetailContentInner`) that gets only stable props from `StudioWorkspace` and does not call `useArrangement()`.
  3. No `ArrangementContext` change is needed: `setTimeRange`, `setStatus`, `claimPointerGesture`, `isPointerGestureActive`, `sourcePeaks` and `useArrangementPositionWriter` already exist.
  4. Space on the toggle can be fixed inside the panel. The window keyup handler calls `preventDefault` on Space, which kills native button activation. So the toggle handles Space on keydown and stops both events. `StudioWorkspace`'s global handler is unchanged.
  5. `isTypingTarget` already includes `type="number"` (`StudioWorkspace.tsx` `TEXT_INPUT_TYPES`).
- **Smallest version:**
  - `panels.ts`: about 70 lines of pure maths.
  - The panel component: about 560 lines including JSX.
  - `StudioWorkspace`: about 60 lines (mount, memos, metrics callback).
  - `ArrangementClip`: a one-word `export`.
- **Files and why:** see §3.
- **Success criteria:**
  - vitest ≥ 779 + new tests with 0 failures, and tsc 0.
  - Biome: 0 errors on the owned paths and on `./app`. Build OK.
  - Hashes OK and `Header.tsx` unchanged.
  - Browser numbers in §5 and §8.

## 2. design-philosopher ruling (real subagent, read-only), quoted

> 1. **Title:** `კლიპის დეტალები`. In the header: title (text-muted), then the clip name (text-foreground, truncate). With several clips selected it shows `{n} კლიპი`. With nothing selected it shows `არაფერია არჩეული`.
> 2. **Labels:** Info labels `ხაზი` · `start` · `სიგრძე` · `offset`. Inputs: visible labels `start, წმ` and `end, წმ`; aria-labels `range-ის დასაწყისი (წამი)` and `range-ის დასასრული (წამი)`. Button `მონიშვნა`. Toggle text `დაკეცვა` / `გაშლა`, aria-label `დეტალების დაკეცვა` / `დეტალების გაშლა`, plus aria-expanded and aria-controls. Separator aria-label `დეტალების სიმაღლე`. No-selection hint `აირჩიე კლიპი, რომ დეტალები ნახო`. Multi note `ჯგუფი ერთად გადაადგილდება · Delete შლის · Ctrl+D აორმაგებს`. Video placeholder `ვიდეოკლიპი · ტალღა არ ჩანს`. Disabled reasons: multi = `range ერთ კლიპზე ისმება — აირჩიე ერთი`, none = `ჯერ აირჩიე კლიპი`. Link each to the inputs with aria-describedby.
> 3. **Tokens:** Panel `bg-surface border-t border-outline text-xs`; header `h-9 bg-surface border-b border-outline px-3`; info labels `text-dim`, values `text-foreground font-mono tabular-nums`; waveform box `bg-background border border-outline rounded-sm`; range overlay `border-x-2 border-foreground bg-foreground/60` (same as on clips); detail playhead `w-px bg-accent`; inputs `h-6 bg-background border border-outline px-1 font-mono tabular-nums focus-visible:ring-2 focus-visible:ring-brand disabled:text-dim`; button `h-6 border border-outline text-foreground hover:text-brand disabled:text-dim`; separator `hover:bg-accent/60` + brand focus ring; video placeholder `bg-elevated text-muted`, centred.
> 4. **Density and order:** read → see → act, left to right. Left column (w-56): name · `ხაზი` · `start` + `სიგრძე` · `offset` · `წყარო უცვლელი რჩება`. Middle: waveform `flex-1 min-w-32`. Right column (w-44): start/end side by side, `მონიშვნა`, reason line only when disabled. Multi-select: `{n} კლიპი` · lanes · earliest start · span length · note line; the waveform area becomes an empty `bg-background` box. Nothing selected: only the hint, all inputs disabled.
> 5. **Follow-ups (recorded, not applied):** (a) the footer `arrangement-selected-clip` line repeats the open panel (consider showing it only when collapsed); (b) `bg-foreground/60` may hide the waveform in the detail view (check before suggesting `/30`); (c) the clip name appears in both header and content (acceptable, review in stage 2); (d) the Latin `start`/`offset` vs Georgian `სიგრძე` mix should be settled once for the whole workspace.

**Applied:** all of points 1–4, with one exception. The ruling's text contained a stray non-Georgian character in `ხაზი`, so I used the correct Georgian word.
**Not applied:**
- Follow-ups (a)–(d) are for B. (a) would change the footer, which the task forbids.
- The toggle shows `დაკეცვა ▾` / `გაშლა ▸`. The arrows come from the round-7 §7.1 text.

## 3. Files actually changed this round (a subset of §2.2)

- **New:**
  - `app/components/arrangement/ArrangementDetailPanel.tsx`
  - `app/lib/arrangement/panels.ts`
  - `app/lib/arrangement/__tests__/panels.test.ts`
  - `app/lib/arrangement/__tests__/detail-panel.test.tsx`
  - `docs/implementation/2026/quarter-IV/017-studio-lab-detail-panel.md`
- **Modified:**
  - `app/components/arrangement/StudioWorkspace.tsx`:
    - imports and four more destructured members (`sourcePeaks`, `setTimeRange`, `setStatus`, `isPointerGestureActive`);
    - the `detailSelection`/`detailGroup` memos, `detailPeaks` and `measureTimelineFit`;
    - the `<ArrangementDetailPanel>` mount between the scroller and the end of the right column.
    - Footer, test ids and the keydown handler are unchanged.
  - `app/components/arrangement/ArrangementClip.tsx`: only `export` on `buildPeakShape`.
  - `app/lib/arrangement/__tests__/render-budget.test.tsx`:
    - adds `PositionStoreProbe` and one new test;
    - adds a `15000` ms timeout on the first existing test (see §9). No existing assertion changed.
  - `docs/implementation/2026/quarter-IV/016-studio-lab-round7-fixes.md`: status line and 2 TODO lines only.
- **Not changed:**
  - `ArrangementContext.tsx` (no new member needed);
  - `types/arrangement.ts`, `view.ts`, `video-sync.ts`, `position-store.ts`;
  - Lane, VideoDock, Library, LibraryPreview, Overview, Ruler and Transport;
  - routes, styles and all protected files.
- **Temporary edits, all removed:**
  - **Detail-writer timing wrapper.** Removed by restoring the backup (`cmp` identical). `grep czabaPositionCost` gives 0.
  - **Guard revert.** Restored byte-for-byte (`cmp` identical).
  - **A/B "panel not mounted".** Restored (`cmp` identical).
- No round-6/7 file was reverted. All round-8 edits sit on top of the working tree.
- `Header.tsx`: `git diff` is empty (byte-identical to HEAD); against `cc1e531` it is +21/−0.

## 4. Command tails (actually run, final state after all review fixes)

```
npx vitest run app/lib/arrangement   → Test Files 20 passed (20) · Tests 342 passed (342)
npx vitest run                       → Test Files 52 passed (52) · Tests 806 passed (806)   (779 + 27 new)
npx tsc --noEmit                     → exit 0
npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement
                                     → Checked 52 files. No fixes applied. (0 errors)
npx biome check ./app                → Checked 318 files. No fixes applied. Found 218 warnings. Found 1 info. (0 errors; same 218 as round 7)
npm run build                        → ✓ built in 4.57s
hash check                           → download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
git diff app/components/layout/Header.tsx → empty; git diff cc1e531 --stat Header.tsx → 21 insertions(+)
git status --short                   → the 14 baseline M files + untracked: ArrangementDetailPanel.tsx, detail-panel.test.tsx,
                                       panels.test.ts, render-budget.test.tsx, panels.ts, doc 016, doc 017
git diff --stat (tracked)            → 14 files changed, 1135 insertions(+), 165 deletions(-)
```

`--write` was used only on my own new files (`ArrangementDetailPanel.tsx`, `panels.ts`, `panels.test.ts`, `detail-panel.test.tsx`), and those runs made format-only changes. `npm run check` and `npm run format` were not run.

Flakiness seen on the way (all unowned or pre-existing):
- Before the timeout was added, `render-budget` test 1 timed out at 5 s in 3 full runs.
- `sfx-library.test.tsx` timed out once at 5 s. It passes alone and in the next full run.

## 5. Constants and the D-29a decision

**Constants:**
- default 144 px;
- range 120–280 px;
- ↑/↓ ±16 px;
- collapsed 36 px;
- separator: 0 px of layout, with a 6 px hit area over the top of the header;
- range tolerance ±0.01 s, after which both ends are clamped into the clip;
- `motion-safe:transition-[height] motion-safe:duration-300`, armed on the first user action and off while dragging.

**Rule (`detailPanelStartsOpen`):** open iff `scroller.clientHeight − (144 − 36) ≥ timeline content height`. `clientHeight` excludes the horizontal scrollbar. The content height is the timeline div's `offsetHeight` = ruler + loop strip + lanes. `scrollHeight` cannot be used here because it is never smaller than `clientHeight`.

Measured in gstack Chromium (`lay8.js`). This headless Chromium uses overlay scrollbars, so `offsetHeight − clientHeight` = 0. On a Chrome with classic ~10 px scrollbars, `clientHeight` is about 10 px smaller.

| Viewport / state | scroller client H | lane total | ruler | loop strip | content | h-scrollbar | panel | decision |
|---|---|---|---|---|---|---|---|---|
| 1440×900 fresh | 516 (open) → 624 collapsed equivalent | 4 × 81 = 324 | 28 | 16 | 368 | 0 | **144, open**, no transition (`transitionDuration 0s`) | 624 − 108 = 516 ≥ 368 |
| 1440×900 demo + R3-V1 videos | 516 | 324 | 28 | 16 | 368 | 0 | 144 open | all 4 lanes in view, no vertical scroll, dock videos 160×90 |
| 1280×720 fresh | 406 | 324 | 28 | 16 | 368 | 0 | **36, collapsed** | 406 − 108 = 298 < 368 |
| 1280×720 demo + R3-V1 | 386 | 324 | 28 | 16 | 368 | 0 | 36 collapsed | all 4 lanes in view, no vertical scroll (18 px spare; ≈ 8 px with a classic scrollbar), dock 160×90 |
| 1280×720 demo, after opening | 278 | — | — | — | 368 | — | 144 (`0.3s`) | timeline scrolls vertically; stems/sfx below the fold (R11-P2a, stage 2); nothing overlaps |

- With the panel collapsed at 1280, the scroller is 386 px. That is C's round-7 422 minus 36, which matches D-29a's 44 px slack.
- Footer at 1280 with a selected clip: 69 px (3 lines: status, range/selected, hint). Fresh: 49 px. The footer itself was not changed this round, and R10-N8 is for C to judge.
- Panel top equals scroller bottom exactly (707 / 615 / 507). The panel bottom equals the footer top. No overlap.

## 6. Tests (new or changed), why, and the guard proof

- **`panels.test.ts`** (12, R11-U1):
  - clamp and non-finite input;
  - the ±16 step at both ends;
  - D-29a: fits 650/368, does not fit 412/368, exactly at the limit 476 (open) and 475 (collapsed), unmeasured (0/NaN);
  - range validation: inside, ±0.01, end ≤ start, NaN/±∞, outside;
  - `clampDetailRangeToClip`: clamps to 2–10, collapses at either edge → null;
  - the exact refusal text.
- **`detail-panel.test.tsx`** (14, real `StudioWorkspace` + provider):
  - collapse/expand and the restored previous height (160), with no history entry; the transition classes appear after the first toggle;
  - separator keys: collapsed → open first; ±16; clamped at 120 and 280; `aria-valuenow`/min/max/orientation; ArrowLeft/Right on the separator do not nudge the selected clip; no history entry;
  - **registry claim:** separator drag → `isPointerGestureActive()` true, 184 px. A second pointer on a clip header gives no selection and no move. Mute is refused with `GESTURE_EDIT_BLOCKED_MESSAGE` and stays unmuted. Clamped at 280. After release the gesture is inactive and there is no history entry;
  - a separator pointerdown while another pointer holds the registry is ignored;
  - blur mid-drag → back to 36/collapsed (the pre-drag state); pointercancel → back to 144;
  - range 3.5/7.25 via the button: `arrangement-range` shows `00:03.500 — 00:07.250`, the delete hint is shown, the status is exactly `მონიშვნა: 00:03.500 — 00:07.250 · მუსიკა.`, the overlay width is 46.875 %; then 4/5 via Enter; no history entry;
  - the exact invalid-range text for out-of-clip, end ≤ start, equal and empty values, with the range unchanged; 1.995/10.005 is clamped to 2/10;
  - the exact invalid text for a tolerated range that collapses at the edge (10.005/10.01); after nudging the clip by +0.5 the inputs follow (2.5/10.5) and apply;
  - during an active gesture: exact `GESTURE_EDIT_BLOCKED_MESSAGE`, range unchanged;
  - multi-select: `2 კლიპი`, lanes `მუსიკა, SFX`, earliest start and span shown, inputs disabled with the exact reason `title`. No selection: exact hint and reason. A video clip: exact placeholder text, inputs enabled;
  - `+ - z x Space Delete ArrowLeft` typed in a number input: zoom, playback and clips are unchanged;
  - Space on the focused toggle: keydown is default-prevented, the panel toggles and playback does not start. Positive control: Space on body starts and then stops playback;
  - D-29a with mocked metrics: 650/368 opens at 144 with no `transition` class; the first toggle then has the transition. 412/368 stays collapsed with no transition.
- **`render-budget.test.tsx`** (+1, R11-P1e):
  - mount counts > 0 for `ArrangementDetailContentInner` and `ArrangementDetailPlayhead`;
  - 60 `positionStore.setPosition` frames → 0 renders of both, the detail playhead `left` strictly increases (1.5 % → 90 %), and it is hidden at 25 s (outside the 0–20 s clip);
  - Play → Pause → Play (260 ms waits + frames) → 0 renders of both, with the positive control `ArrangementDetailPanel` > 0;
  - the four RF7-P2 lists are still 0. The existing RF7-P2 assertions are unchanged and pass.
- **Guard proof.** I temporarily replaced the separator's `claimPointerGesture(...)` call with a stub that returns a release function and never claims (backup in `%TEMP%/a8/bak`, restored and verified with `cmp`; no git stash or checkout). Result (`%TEMP%/a8/a8-guard-revert.txt`): **3 failed | 10 passed** (13 tests at that time):
  - the registry-claim test: `expected false to be true`;
  - the ignore-while-another-gesture test: `expected 244 to be 36`;
  - the blur/cancel restore test: `expected 194 to be 36`.

## 7. code-reviewer (actual subagent), both runs

**Run 1 (full round-8 diff):** "The Detail panel mostly meets D-29/D-29a and D-26, but two Medium issues should be fixed this round: a near-edge input can set an inverted range, and the range inputs go stale after the selected clip moves. Nothing is Critical or High. **Score: 7.5/10**"

| # | Finding | Action |
|---|---|---|
| M1 | Tolerated near-edge input → reversed range (`10.005/10.01` → `{10.005, 10}`) | **Fixed:** `clampDetailRangeToClip` clamps both ends, then re-checks `end > start`; unit + component tests |
| M2 | Inputs stale after the clip moves or is trimmed | **Fixed:** one effect on `[range, rangeOnClip, clipStart, clipDuration]`; component test (nudge +0.5) |
| L3 | No `setPointerCapture` on the separator | **Not applied:** it throws for synthetic pointers in Chrome. Window listeners + registry abort match the existing marquee gesture. Run 2 accepted this |
| L4 | Same-pointer restart read `before` before the claim's abort | **Fixed:** `before` is re-read after the claim; the abort writes `sizeRef.current` |
| L5 | Focus ring clipped by `overflow-hidden` | **Fixed:** `focus-visible:ring-inset`. The hit area stays 6 px, so it does not cover the toggle button |
| L6 | `aria-valuenow` while collapsed | Kept: the stored expanded height, with `aria-valuetext` `დაკეცილია · {h} px` (see §9) |
| L7 | Plain `useLayoutEffect` (SSR) | Kept: consistent with `StudioWorkspace` |
| L8 | Exported unused `detailRangeAppliedMessage`; `?.` and ref-in-render | Un-exported. The `?.` is needed (closure type). The ref-in-render pattern matches `StudioWorkspace` |
| L9 | Group count from `selectedClipIds.length` | **Fixed:** `clips.length` |
| L10 | New timeout on an existing test | Explained in §9 |
| L11 | Mouse wheel on a focused number input | Not in the spec, recorded |

**Run 2 (fix delta only):** "All six applied fixes (M1, M2, L4, L5, L8, L9) are correct and none of them adds a regression. I accept the L3 rationale. **Score: 9/10**". Three new Lows, all fixed:
- the inputs now sync in `useLayoutEffect`, so there is no empty first paint;
- inputs show the range ∩ clip overlap for a partly overlapping range;
- the group summary requires ≥ 2 existing clips.

After these fixes: tsc 0, 806/806, biome 0 errors, build OK (§4). The browser `fn8.js` re-run gives identical results (§8). Run 2 was not repeated on these three Low fixes.

## 8. A's browser checks (gstack, synthetic pointers with `buttons: 1`, real `$B press`)

Scripts are in `%TEMP%/a8`. The setup is C's (`setup.sh` → `c-round-7/scripts/r3v1lay.js`).

- **1440×900, demo + R3-V1 (`fn8.js`, run before and after the review fixes with the same results):**
  - Content vs footer: footer `start 00:00.000 · length 00:16.000 · source offset 00:00.000`; the panel shows lane `მუსიკა`, start 00:00.000, `სიგრძე` 00:16.000, offset 00:00.000 and `წყარო უცვლელი რჩება`. The header shows the clip name.
  - Range 3.5/7.25 + `მონიშვნა`: `arrangement-range` = `მონიშვნა: 00:03.500 — 00:07.250 · სიგრძე 00:03.750 · …`; the delete hint is shown; the overlay is `left 21.875 %; width 23.4375 %`; Undo stays `Undo: კლიპის გადატანა` (no entry).
  - 1/30 and 6/5 give the exact refusal text, and the range is unchanged.
  - Separator drag −40 px: panel 144 → 184, scroller client height −40, `aria-valuenow` 184, transition `0s` while dragging.
  - Second pointer (id 8) on a video clip header during the drag: the clip did not move. Mute was refused with `GESTURE_EDIT_BLOCKED_MESSAGE` and stayed unpressed.
  - Clamp: 120 / 280. After release: 184, and Undo unchanged. Mute works again after release (pressed = true), which shows the registry was released.
  - pointercancel mid-drag: 144 → 184 (pre-drag). Blur mid-drag: 244 → 184 (pre-drag).
- **Real keys (`$B press`):**
  - Separator focused: ↑↑ → 216, ↓ → 200. ArrowLeft/Right left the clip at 0 px and Undo unchanged.
  - Toggle focused: Space → collapsed (36), Space → open (200). Exactly one toggle per press, and no playback.
  - Start input focused: `+ - z x Space Delete Backspace` → zoom stays 40 px/s, no playback, still 3 clips.
- **Playback (`play8.js`, `hid8.js`):**
  - Fit = 57.1 px/s before and after two toggles; scroller width 1142 unchanged (R10-N5).
  - Play with the panel open: the detail playhead `left` rises monotonically (0.39 % → 24.3 % over 4 s, display block). The timeline playhead stays in view (R10-N4 light; the Fit view shows the whole project, so Follow scrolling was not strongly exercised).
  - Seek to 18 s (outside the 0–16 s clip) → `display: none`; seek to 4 s → block, 25 %.
- **Shots (`%TEMP%/a8`; R11-P4d is C's):**
  - `detail-1440-open.png` (taken at height 200 after the key test, position 18 s);
  - `detail-1440-collapsed.png`;
  - `detail-1280-default.png` and `detail-1280-open.png` (fresh, the root cookie banner is visible);
  - `detail-1280-default-setup.png`, `detail-1280-open-setup.png`, `detail-1440-open-final.png`.
- **R3-V1 light harness:** A's round-7 `drift.sh` = C's `rf5.js`/`rf5an.js` + `perfon.js`/`perfread.js`, 13 s at 1440×900, panel open at 144, the music clip (0–16 s) selected so the detail writer runs every frame. Budget: 3 valid runs, 0 replacements.

| Run | Verdict | raw max / ex max (s) | CPU med/max % | app LoAF ≥ 10 ms | app forced style+layout (steady) | detail writer p50/p95/max (ms, n) | `tick` sync p50/p95 | `tick` + microtasks p50/p95 |
|---|---|---|---|---|---|---|---|---|
| D_1 | PASS | 0.0614 / 0.0614 | 41 / 48 | 0 | 0 | 0.0 / 0.1 / 0.9 (770) | 0.4 / 1.0 | **1.7 / 3.7** |
| D_2 | PASS | 0.0935 / 0.0467 | 31 / 43 | 0 | 0 | 0.0 / 0.1 / **1.3** (766) | 0.4 / 0.7 | **1.4 / 3.1** |
| D_3 | PASS | 0.0237 / 0.0237 | 30 / 46 | 0 | 0 | 0.0 / 0.1 / 0.4 (774) | 0.4 / 0.7 | **1.5 / 2.6** |
| Round-7 A "after" (reference) | — | — | 14–19 / 33–53 | 0 | 0 | — | 0.2–0.3 / 0.4–0.5 | 0.7–0.8 / 1.1–1.5 |
| Diagnostic N_1, panel **not mounted** (same session) | PASS | 0.035 / 0.035 | 31 / 46 | 0 | 0 | — | 0.3 / 0.7 | 1.4 / 2.8 |
| Diagnostic N_2, panel not mounted | INVALID (16 stalls) | 0.0568 / 0.0484 | 26 / 51 | 0 | 0 | — | 0.3 / 0.6 | 1.4 / 2.4 |

- **Detail writer:** p50 ≤ 0.1 and p95 ≤ 0.2 in all runs. The max is ≤ 1 ms in D_1 and D_3. **D_2 has a max of 1.3 ms.** That is one sample (`performance.now` is coarsened to 0.1 ms). Whether that frame was preempted cannot be shown from the stats the harness keeps, so per §8 it is **not shown to be within the envelope**.
- **`tick` + microtasks** is 0.6–0.9 ms (p50) and 1.1–2.2 ms (p95) above A's round-7 "after" numbers, which is **more than the 0.2 ms allowance**. In the same session, the two diagnostic runs without the panel mounted give 1.4 / 2.4–2.8. So most of the rise is the environment (CPU 26–41 % today vs 14–19 % in round 7). The panel's own share looks like about 0–0.3 ms at p50 and up to about 0.9 ms at p95, but it is within noise and not proven.
- **This criterion is open (not ready) on A's evidence.** C must re-measure with the same wrapper. The wrapper was a temporary block in `writeDetailPlayhead` pushing `performance.now()` deltas to `window.__czabaPositionCost['detail-playhead']`, and it has been removed.
- No steady-playback app script had `forcedStyleAndLayoutDuration` > 1 ms. The LoAFs that did appear are React click/scheduler frames at Play (rel −534 / +177 ms), outside the steady window.

## 9. Deviations

1. **`aria-valuenow` while collapsed** reports the stored expanded height (for example 144), and `aria-valuetext` says `დაკეცილია · 144 px`. The rendered 36 is below `aria-valuemin` 120. When open, it equals the rendered height.
2. **`render-budget.test.tsx` test 1 got a `15000` ms timeout.** It timed out at 5 s in 3 full-suite runs. An A/B run alone took 2.5–3.5 s both with and without the panel mounted, so the panel does not slow the mount. The extra parallel jsdom load from the new test file pushes it over 5 s. No assertion changed.
3. **The transition is armed on the first user action** (toggle, key or drag), not right after the mount decision. This is needed so that the D-29a decision is applied without animation. Before the first action, computed `transitionDuration` is `0s`.
4. **The toggle handles Space itself** (keydown toggles, keyup is swallowed). `StudioWorkspace`'s global handler was not changed.
5. **The range is clamped into the clip** after the ±0.01 s tolerance check, so the stored range never extends outside the clip. The lane overlay requires the range to sit inside the clip.
6. **The content is hidden with `hidden` while collapsed**, so its inputs are not tab-focusable. It stays mounted, so the writer keeps running and there is no remount.
7. **A ↑/↓ key on a collapsed panel only opens it** (restoring the previous height). The next key steps by 16 px.
8. **Changed in place:** `detail-1440-open.png` was taken at 200 px, not 144.
9. **One `{/* biome-ignore lint/a11y/useSemanticElements: … */}` JSX comment** on the separator `div`. The root rules ban `//` comments, but `role="separator"` with `aria-value*` is required, and Biome otherwise demands `<hr>`. This follows the existing precedent in `ArrangementLibrary.tsx` and `ArrangementLoopBrace.tsx`.
10. **Collapsed content is really hidden:** in the browser, computed `display` of the `aria-controls` target is `none` when collapsed (Tailwind preflight `[hidden]`).
11. **Round-8 tracked delta, for G8-2:** the cumulative tracked diff is 1135+/165− against round 7's 1069+/164−, so round 8's tracked share is about +66/−1. That share is `StudioWorkspace.tsx` plus the one-line `export` in `ArrangementClip.tsx`. Doc 016 and all new round-8 files are untracked, so they are not in this number.

## 10. Not ready / open (on A's evidence)

- **R3-V1 adjacent attribution (§8.2):**
  - the detail writer's max is 1.3 ms in D_2, and preemption cannot be shown;
  - `tick` + microtasks is more than 0.2 ms above round-7 "after", although the same-session baseline without the panel is similar.
  - Both need C's re-measurement. I do not claim this item.
- **R11-P1d "footer is one line":** at 1280×720 with a clip selected the footer is 3 lines (69 px). This comes from the unchanged footer (status + range/selected + hint), not from the panel, and is for C to judge against R10-N8.
- **R10-N4 (Follow while playing with the panel open)** was only lightly checked: the Fit view showed the whole project, so Follow scrolling was not exercised.
- **Not done by A:**
  - R26-1..3 in the browser beyond the separator cases;
  - R4-M2 MutationObserver counts;
  - G8-3 network checks;
  - the R11-P4d shots in C's exact states.
- **Carried and not touched:**
  - C-R7-01, C-R6-02 and C-R7-02 (round 9);
  - R11-P2/P2a/P3 (stages 2/3);
  - R11-P3m (Tech Lead real-mouse separator drag);
  - the 21 regression-debt IDs.
- **Follow-ups for B:**
  - design-philosopher (a)–(d) (§2);
  - code-reviewer L11 (number-input mouse wheel).
- **Publication files (read this round; not touched by round 8), for B/C follow-up:**
  - `root-pre-push-review.md`:
    - **M1** — loop refill only from the rAF tick: a hidden tab goes silent about 0.5 s later. Not addressed by any round A knows of; still open unless `feature-status.md` says otherwise.
    - **M2** — position in the single context: addressed by the position store and the round-7 writers. The round-8 detail playhead follows the same pattern.
    - **L1** — Undo during a gesture: covered by D-26 since round 6.
  - `publication-checkpoint.json`:
    - the purchased Studio loader hardcodes `middle-east` (an inherited limitation, SRW-21 purchased adapter; do not claim all product stems work);
    - instruction-file portable-path follow-up;
    - the final commit/push is authorized only after everything is complete;
    - scrollbar, library and discoverability requests: status per `feature-status.md`. A did not re-verify them.

## 11. Exact next C checks

1. **R11-P1b at 1440×900:**
   - toggle 144 ↔ 36 ↔ the previous height, and computed `transitionDuration` 0.3 s after the first toggle (0 s under reduced motion);
   - drag ±40 and `$B press` ↑/↓ ±16, clamped at 120/280, `aria-valuenow` = height, scroller client height Δ = panel Δ;
   - a second pointer on a clip header during the drag; Mute refused; release, then Mute works;
   - blur and pointercancel restore the pre-drag height; Undo label unchanged.
2. **R11-P1d:**
   - fresh `/studio-lab` with the demo + video clip: 1440 → 144 open, 1280 → 36 collapsed, no load animation;
   - all 4 lanes, ruler and loop strip in view; the dock ≥ 160×90;
   - at 1280, open: vertical scroll, no overlap.
3. **R11-P1c:**
   - content vs footer line;
   - 3.5/7.25 via the button and via Enter;
   - the invalid cases (exact text);
   - `2 კლიპი` / none / video placeholder;
   - keys typed in the inputs;
   - the detail playhead is monotone and hidden outside the clip.
4. **R11-P1e:** `npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx`.
5. **R11-P4d:** the four shots.
6. **R11-U1:** `npx vitest run app/lib/arrangement/__tests__/panels.test.ts app/lib/arrangement/__tests__/detail-panel.test.tsx`.
7. **R8-D1:** docs 016/017 (no PASS claims).
8. **Adjacent regressions:**
   - R4-M2 with the detail playhead as a new position consumer;
   - RF7-P2;
   - R10-N8 / R11A-3;
   - R10-N4;
   - R10-N5;
   - R26-1..3;
   - **R3-V1 attribution re-measurement** (§8 table, same wrapper method).
9. **Gates G8-1..3.**
