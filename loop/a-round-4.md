# A — Round 4 report (Track S: D-19 sync + bugs; Track U: SRW-22/23/12/11A)

Status: A's work for both tracks is in place. C has not verified anything yet. **Do not read this as PASS.**
Sessions: the first A session (≈ 19:30–21:07) wrote all of the Track S code and most of the Track U code, then stopped before writing the report. This session (21:19–) inspected that partial work, ran every gate again, re-ran browser checks on the current code, wrote doc 013, ran the real code-reviewer, and wrote this report. No work was reverted or duplicated.

## 1. Pre-flight gate (posted before editing, first session)

- **Assumptions**
  - D-19: the dock renders exactly two `<video>` elements. Roles swap imperatively through `data-video-role`, classList opacity and z-index; the JSX props stay constant, so React never rewrites them.
  - The control step runs from a rAF loop that is always alive while the dock is mounted and idles when stopped, so `frameInterval` is always measured. It reads `getLivePosition()` and a new `getPlaybackClock()` (ctx time, `holdUntil`, the active loop).
  - `resolveVideoTarget` drops the round-2 preroll and preload modes, which the standby replaces, and returns the clip under the position plus `continuous`.
  - Rule 7 (start) and rule 5 (seek-and-hold) share one pure `holdRelease(frame, unclampedLiveTarget, frameInterval)`.
  - L2: a reschedule while the previous anchor still holds stops the old graph before it sounds, and re-holds until the new `startAt`.
  - M1: the loop refill is a pure function, driven from rAF and from a 200 ms timer, with a 2.0 s horizon.
  - D-20: the context counts pointer gestures, and Undo/Redo are refused while the count is above 0. Releasing the last gesture clears the preview-active flag; unmount and capture failure release.
  - Track U: the library tree is derived from `collectionLabel` + `kind`. The only `WorkspaceSource`/`WorkspaceCollection` type change is one optional field, `WorkspaceCollection.notice?: string`, used for the honesty caption.
- **Smallest version:** S1 is a dock rewrite plus `video-sync.ts`. S2 fixes are surgical. S3 is measure-first. Each Track U item is the smallest version that meets its acceptance criteria.
- **Files:** a subset of §2 (listed in §3 below).
- **Success commands:** the §11 list, plus headless drift runs on adapted copies of C's harness in `%TEMP%/a-r4/`.
- **Baselines taken before editing:** Biome on `Header.tsx` gave 0 errors and 6 warnings (pre-existing, not touched). `docs/implementation/2026/quarter-IV/` held 001–012, so 013 was free.

## 2. design-philosopher ruling (actual subagent, read-only, first session), quoted

> **(a) Library tree and preview.** Keep the prototype's two-column body. At 720 px high, stacking the tree above the list would leave room for only about 3 visible rows. Top to bottom:
> 1. Header row (`h-10 border-b border-outline`): "ბიბლიოთეკა" (`text-sm font-semibold`) with ◀ on the right.
> 2. Search block (`p-3 border-b border-outline`): input `bg-background border border-outline rounded-sm text-xs` with × absolute right; a kept-filter line under it, `text-xs text-muted` with the value in `text-brand` (e.g. `ფილტრი: სტემები`), making LIB-04 retention visible; the honesty caption `სინთეზური დემო — არა CZABA-ს კატალოგის სტემები` in `text-xs text-muted`, which wraps and is never truncated; no amber, because the lab header already carries it.
> 3. Body (`flex flex-1 min-h-0`):
>    - Tree (`w-24 shrink-0 border-r border-outline text-xs`), in this order: `ყველა ფაილი` → collection ▸/▾ (`aria-expanded`) → indented `pl-4` folders მუსიკა / სტემები / SFX. Active node: `border-l-2 border-brand bg-brand/10 text-brand` + `aria-current="true"`. Inactive node: `border-l-2 border-transparent text-muted hover:bg-elevated hover:text-foreground`.
>    - List (`role="listbox"`, `flex-1 min-w-0`) with options carrying `aria-selected`. Selected: `bg-brand/10`; focus: `ring-1 ring-inset ring-brand`. Line 1 is the title (`truncate` + `title`). Line 2 is kind and duration (`text-muted tabular-nums`), plus `▶ ისმის` in `text-brand` while previewing. Empty state: `ხმა ვერ მოიძებნა…`, centred, `text-muted`.
> 4. Preview panel (`shrink-0 border-t border-outline p-3`): name (`text-sm truncate`) with the duration right (`text-xs text-muted tabular-nums`); waveform `h-8 rounded-sm bg-background cursor-pointer`, unplayed bars `bg-dim`, played bars `bg-brand`; the existing "აქტიური ხაზი: … · playhead …" line moves here so the add target is named (LIB-07); `▶ მოუსმინე` `text-brand`, `■ შეჩერება` `text-accent` (matches transport Pause); `＋ დამატება` keeps `border-brand bg-brand/10 text-brand`, `disabled:opacity-40`.
>
> Collapse and resize: collapsed rail `w-10` with ▶. Keep the content `min-w-72` inside `overflow-hidden`, so the 300 ms width transition does not reflow text. Separator `w-1 bg-outline hover:bg-brand/40 focus-visible:bg-brand`. Conflicts: none.
>
> **(b) Compact video dock (D-22).** A new strip row at the top of the right (timeline) column, above the scroller, not in the transport row: `flex shrink-0 items-end justify-end gap-3 border-b border-outline bg-surface px-3 py-2`.
> - The caption moves left of the box (`text-xs text-muted truncate`), so the box sets the strip height.
> - The dock is in normal flow and never absolute, so it cannot cover the ruler, lanes or headers.
> - Its parent never mounts conditionally, so the library collapse cannot remount it.
> - The transport row is wrong: it wraps (2 rows at 1280), and a 90 px item there breaks the C-R3-06 stable boxes.
>
> Sizes (estimates; C's screenshots confirm):
> - 1280×720: `w-40 aspect-video` (160×90), strip ≈ 107 px. Height left for the timeline ≈ 720 − 33 header − 89 transport − ~70 footer − 107 ≈ 421 px. The timeline needs 28 + 16 + 4×80 + 10 scrollbar = 374 px.
> - 1440×900: `[@media(min-height:860px)]:w-48` (192×108), strip ≈ 125 px, height left ≈ 578 px.
> - Risk: if the transport ever wraps to 3 rows at 1280, only about 7 px is spare. Keep it at 2 rows or fewer.
>
> **(c) Store header entry.**
> - Desktop: `getNavLinkClass('/studio-lab')` + `whitespace-nowrap`, label `Studio Lab`. Badge: `ml-1.5 align-middle rounded-sm border border-accent/40 px-1.5 py-px text-[10px] font-semibold uppercase leading-none tracking-wider text-accent` with text `Demo` (amber already means "demo" in the lab header).
> - Mobile: `getMobLinkClass('/studio-lab')` with the same badge kept inline; `flex` would clash with the helper's `block`.
> - Copy the siblings' `prefetch` and `onClick` (close menu).
> - Wrap risk at 1280 is moderate. The link adds ≈ 170 px, so the nav is ≈ 690 px inside 1216 px of content, leaving ≈ 320 px for the actions column. If the screenshot shows wrapping, the real fix is `gap-8 xl:gap-12` on `<nav>`, which R22-2 forbids — record it as a conflict for B and do not make it.
>
> **(d) Scrollbar tokens.**
> - Track: `surface`. Thumb: `dim` (≈ 3.6:1 against `surface`; `outline-hover` ≈ 1.8:1). Hover and drag: `brand`. Corner: `surface`.
> - Classes: `[scrollbar-gutter:stable] [&::-webkit-scrollbar]:size-2.5 [&::-webkit-scrollbar]:bg-surface [&::-webkit-scrollbar-track]:bg-surface [&::-webkit-scrollbar-corner]:bg-surface [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-dim [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-surface [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb:hover]:bg-brand [&::-webkit-scrollbar-thumb:active]:bg-brand` — a 10 px bar with a 6 px pill thumb.
> - No inherited `scrollbar-color` or `scrollbar-width` on `html`, `*` or `.studio-container`; only `.styled-scrollbar` and `.stems-loader-list` use them.
> - Apply `[scrollbar-gutter:stable]` only to vertical scrollers. Conflicts: none.

**Deviations from the ruling (all small):**
- Badge: uses `text-xs` and no `py-px`. The arbitrary `text-[10px]` was avoided to stay on the token scale.
- Dock: `w-40` (160×90) at every height. The 1440×900 `w-48` media variant was not added; 160×90 meets the ≥ 160×90 floor (measured 160.0×90.0).
- `[scrollbar-gutter:stable]` sits in the single shared constant, so it also lands on the two-axis timeline scroller. The task asks for one constant. The timeline scroller is also a vertical scroller, so this is harmless; no phantom gutter was visible.
- Header did **not** wrap at 1280×720, so no `gap` conflict arose.

## 3. Files changed (all within §2)

`git status --short` (this session, 21:4x):
```
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/ArrangementLibrary.tsx
 M app/components/arrangement/ArrangementLoopBrace.tsx
 M app/components/arrangement/ArrangementRuler.tsx
 M app/components/arrangement/ArrangementTransport.tsx
 M app/components/arrangement/ArrangementVideoDock.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/components/layout/Header.tsx
 M app/contexts/ArrangementContext.tsx
 M app/data/studio-lab-demo.ts
 M app/lib/arrangement/__tests__/transport.test.ts
 M app/lib/arrangement/__tests__/video.test.ts
 M app/lib/arrangement/demo-synth.ts
 M app/lib/arrangement/loop.ts
 M app/lib/arrangement/transport.ts
 M app/lib/arrangement/video.ts
 M app/types/arrangement.ts
?? app/components/arrangement/ArrangementLibraryPreview.tsx
?? app/components/arrangement/studio-scrollbar.ts
?? app/lib/arrangement/__tests__/ArrangementContext.test.ts
?? app/lib/arrangement/__tests__/demo-synth.test.ts
?? app/lib/arrangement/__tests__/library.test.ts
?? app/lib/arrangement/__tests__/position-store.test.ts
?? app/lib/arrangement/__tests__/video-sync.test.ts
?? app/lib/arrangement/library.ts
?? app/lib/arrangement/position-store.ts
?? app/lib/arrangement/preview.client.ts
?? app/lib/arrangement/video-sync.ts
?? docs/implementation/2026/quarter-IV/013-studio-lab-sync-library.md
 18 files changed, 1960 insertions(+), 518 deletions(-)   <- pre-review-fix snapshot; final: 18 files changed, 2014 insertions(+), 520 deletions(-) (§6)
```
Plus `../tmp/studio-real-loop/a-round-4.md` and `a-browse.json`.

Not touched: `app/routes/studio-lab.tsx`, `graph.client.ts`, `model.ts`, `schedule.ts`, `selection.ts`, `peaks.ts`, `video.client.ts`, `index.ts`, `ArrangementExportDialog.tsx`, `app/styles/**`, `root.tsx`, `public/**`, `package.json`.

`git diff app/components/layout/Header.tsx`: exactly two added `<Link to="/studio-lab" prefetch="intent">` blocks (desktop: `getNavLinkClass('/studio-lab') whitespace-nowrap`; mobile: `getMobLinkClass('/studio-lab')` + `onClick={() => setIsOpen(false)}`), each with a `Demo` badge span. +21 lines, 0 removed.

## 4. Command tails (this session, before the review fixes; post-fix gates are in §6)

```
$ npx tsc --noEmit
(no output, exit 0)

$ npx vitest run app/lib/arrangement
 Test Files  13 passed (13)
      Tests  189 passed (189)

$ npx vitest run
 Test Files  45 passed (45)
      Tests  653 passed (653)
   Duration  65.24s

$ npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts app/routes/studio-lab.tsx app/components/layout/Header.tsx
Checked 44 files in 347ms. No fixes applied.
Found 6 warnings.          <- all 6 are pre-existing Header.tsx useButtonType etc.; 0 errors

$ npx biome check ./app
Checked 306 files in 1252ms. No fixes applied.
Found 218 warnings.
Found 1 info.              <- 0 errors

$ npm run build
build/server/index.js                    1,126.78 kB
✓ built in 5.58s

$ protected hash check
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
```
`npm run check` was **not** run: the `./app` run reports 218 warnings in files outside my ownership, so the §11 rule says no. No `--write` was run on `Header.tsx`.

## 5. Changed tests (contract changes, with reasons)

`video.test.ts`
- `hard-seeks while playing only above 0.3 s` → `… only above 1.0 s (D-19: soft sync handles the rest)`. D-19 rule 4/5 moved the band to 1.0.
- `is clamped to [0.85, 1.15]` → `is clamped to [0.5, 2.0] (D-19 rule 4)`.
- `slows an ahead video and speeds up a late one, symmetrically` → `… symmetrically while unclamped (|K·d| ≤ 0.5)`, because K and the clamp changed.
- `returns the clip under the playhead when stopped` → `returns the clip under the position with its media time`. Stopped and playing modes merged.
- `preloads the next clip in a gap without playing it` → `returns null in a gap: the standby element, not the active one, prepares the next clip` (D-19 rule 6 replaces preload).
- `prerolls a different source 50 ms before an adjacent boundary` → `marks a different-source clip at an adjacent boundary as not continuous` (rule 3/6 replaces preroll).
- `does not preroll across a continuous split of the same source` → `marks the right half of a continuous split of the same source as continuous` (rule 3, `continuous` on `VideoTarget`).

`transport.test.ts`
- `stays continuous when the previous anchor is still holding` → replaced by `re-holds until the new startAt when rescheduled inside the previous hold (L2)` and `a reschedule inside the hold keeps the transport stopped before the sounding startAt (R4-B5)`.
- Added `keeps the continuous handoff once the previous anchor is running`.

New test files: `video-sync.test.ts` (RF4-U), `library.test.ts` (R12-U, 11 tests), `demo-synth.test.ts` (length/rate, peak ≤ −6 dBFS, |ρ| < 0.5, mix = sum ≤ 1e-6, determinism and pulse onsets), `position-store.test.ts` (R4-M2: a `useArrangement()` consumer renders 0 extra times across 10 `seekTo` calls, while a `useArrangementPosition()` consumer renders 10), and `ArrangementContext.test.ts` (R4-B1 undo guard, R4-B2 preview-active cleared after an aborted gesture, R4-B6 AudioContext failure, R4-B7 fake-timer loop refill with rAF absent).

## 6. code-reviewer (actual subagent) — findings and fixes

The actual `code-reviewer` subagent ran read-only this session. Its summary, quoted:

> "Score: 8/10. The round looks solid for both tracks. The D-19 dock follows the spec closely and its pure decision functions are well tested. The undo guard, preview lifecycle, position store and library logic are clean, and I found no forbidden patterns or security exposure. What's left is edge-case behaviour, not architecture: edit shortcuts that still work during a drag, a preview that keeps playing with no stop button, a separator drag that lags behind the pointer, and arrow and Enter keys that reach the global shortcuts from the wrong focus targets. The re-seek during a hold should be written up as a deviation in the a-round-4 report."

Critical: none. High: none.

| # | Finding | Action |
| --- | --- | --- |
| M1 | Delete, Ctrl+E, ←/→, Ctrl+L and Enter still edit mid-gesture, which corrupts the "before" of the drag's history entry | **Fixed.** The context exposes `isPointerGestureActive()`. The `StudioWorkspace` key handler refuses those keys during any gesture, with the status `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` (exported as `GESTURE_EDIT_BLOCKED_MESSAGE`). Ctrl+A (selection only) is still allowed. New test: `reports an active gesture until every nested gesture is released`. |
| M2 | The old preview keeps playing when ↓ moves to an unready source, a search hides its row, or the library collapses | **Fixed.** `startLibraryPreview` stops the preview before refusing. A library effect stops the preview when the library collapses or the previewing row leaves the results. Browser check: after preview → collapse → expand, the toggle reads `▶ მოუსმინე` and there is no `▶ ისმის`. |
| M3 | The separator drag lags because of the always-on 300 ms width transition | **Fixed.** An `isResizing` flag disables the transition during a pointer drag, and collapse/expand keep it. Browser check: the mid-drag width is 352 one frame after a +64 px move. |
| L4 | ←/→ on library options reach the global nudge; Enter on the separator reaches global add | **Fixed.** Options stop ←/→ propagation, and the global Enter handler excludes `role="separator"`. |
| L5 | During a hold, a mapping jump > 0.08 can issue a new seek (rule 5 says never re-seek while holding) | **Not changed; recorded as deviation 6.** A user seek or edit during a hold must retarget, otherwise the video would hold on a stale target. The 250 ms per-element limit and the pending guard still apply. |
| L6 | The standby is visible on first paint, before the effect toggles its classes | **Fixed.** The JSX starts the active element with `z-10` and the standby with `pointer-events-none opacity-0`. Browser: active opacity 1, standby 0 at load. |
| L7 | The ghost says "audio is not added to the video lane" for a not-loaded or foreign drag on an audio lane | **Fixed.** A separate `notReady` flag adds the label ` · ხმა ჯერ არ ჩატვირთულა`. |
| L8 | The preview panel re-renders at 60 fps | **Fixed.** The state holds the played-column integer, so React skips repeated values. |
| L9 | `<p>` inside the listbox; a keyboard click on the waveform seeks to 0 | **Partly.** The empty message is now `<output>` (implicit status role) but still sits inside the listbox container. Keyboard waveform activation still restarts at 0: left as a known Low. |
| L10 | Synchronous stem synthesis and an idle dock rAF | Accepted, as the reviewer noted. |

Gates after the fixes (this session, final code):
```
$ npx tsc --noEmit                      -> no output
$ npx vitest run                        -> Test Files 45 passed (45); Tests 654 passed (654)
$ npx biome check <owned paths>         -> Checked 44 files. Found 6 warnings (pre-existing Header). 0 errors
$ npx biome check ./app                 -> Checked 306 files. Found 218 warnings. Found 1 info. 0 errors
$ npm run build                         -> ✓ built in 5.80s
$ protected hashes                      -> 4 × OK
$ git diff --stat                       -> 18 files changed, 2014 insertions(+), 520 deletions(-)
```
`biome check --write` ran only on `app/components/arrangement` and `ArrangementContext.tsx`; it formatted 1 file. Browser re-check after the fixes: lib1 (R12-L1/L2) gives identical results, and one R3-V1 run (k1) passed with median 0.0103, max 0.0215, 0 hard seeks and 1 swap.

## 7. D-19 constants (read from `app/lib/arrangement/video-sync.ts`)

| Constant | Value |
| --- | --- |
| `K` (`VIDEO_RATE_GAIN`) | **4** |
| Rate clamp | **[0.5, 2.0]**, quantised in steps of 0.05 (`VIDEO_RATE_STEP`) |
| Dead band | 0.02 s |
| Soft-sync limit (hard seek above) | 1.0 s |
| `L` (`VIDEO_HOLD_SEEK_LEAD_SECONDS`) | **0.3 s** |
| Pending-seek timeout | **1500 ms** |
| Standby horizon | **1.0 s** |
| Hard-seek interval | 250 ms per element |
| Start early cap | 0.02 s (`min(frameInterval, 0.02)`) |
| Continuity | `VIDEO_CONTINUITY_SECONDS` 0.03; mapping jump treated as discontinuity above 0.08 s |
| Loop refill timer / horizon (M1) | 200 ms / 2.0 s |

## 8. Drift measurements (own headless gstack runs; adapted copies of C's `mon.js`/`vfc.js`/`r3v1.js`/`l6.js`/`rf32.js` in `%TEMP%/a-r4/`; `[data-video-role="active"]` re-resolved on every sample; setter spies on the prototype)

First session (code as of ≈ 20:44):
- **RF4-1 R3-V1:** 10 same-load runs + 5 with reload → **15/15** within limits. Worst run max 0.0637 (median 0.0119). Hard seeks 0 in every run, 1 swap per run (the 6→8 gap entry), 0 writes while seeking, rate within [1, 1.35], rate 1/1 after Pause, 2 videos, multi-playing 0.
- **RF4-1 R2-V3:** the first attempt had 1/5 failing (v2: max 1.005 s). After a fix, 3 same-load + 2 reload → **5/5**: worst max 0.0247, 2 swaps per run, **no seek and no swap at the continuous 2.0 boundary**, hard seeks 0.
- **RF4-2 (loop 2–4, play from 1.0, 8.6 s):** **5/5**, 3 wraps each, all through the standby swap (0 fallbacks), frames inside [2, 4] 300 ms after each wrap.
- **RF4-3:** 3/3, with `play()` at `startAt` − 10 ms.

This session (final code, after the 21:07 dock and context edits):
- R3-V1, 5 same-load runs (e1–e5): **5/5**, worst max 0.0563 (median 0.0112), hard seeks 0, 0 writes while seeking, worst counted frame gap 0.085 s.
- R2-V3, 2 same-load runs (g1, g2): **2/2**, worst max 0.020, hard seeks 0, 2 swaps per run.
- RF4-2, 2 runs (h1, h2): **2/2**, worst max 0.0531, 3 swaps per run, 0 fallbacks, in-loop after 300 ms true. **h2 had 1 hard seek** near the start, at the same time as rAF gaps of 183 ms and 117 ms (main-thread contention). The run still met every threshold, with a worst frame gap of 0.175 s.
- RF4-3, 2 fresh-load runs (f1, f2): `play()` at `startAt` + 0.7 ms and `startAt` − 10 ms. Drift max over 0–100 ms was 0.048 / 0.038, and over 100–300 ms 0.042 / 0.035.
  - **Spec tension:** in f2, `play()` came 10 ms early (rule 7 allows up to 20 ms). So in the last pre-`startAt` sample the active element was not paused and had advanced 1.8 ms. C's hold check ("paused while `ctx.currentTime < startAt`") may flag this, even though rule 7 permits it. **B needs to decide which rule governs.**
- R11A-1 sync while collapsing and expanding during play (rough, text-based position): the second run stayed within ±0.013. The **first Play right after a fresh video import** showed |d| 0.129 at 250 ms and 0.211 at 500 ms, then converged. It was not repeatable on the second run. C should watch the first run after import in RF4-1.

## 9. M2 numbers and decision

- **Before the store** (first session, temporary `<Profiler>` on the context provider, R3-V1 at 1440×900, 8 s of playback): mean React commit time per animation frame **7.0–7.8 ms**. This is above the 4 ms threshold, so the position store was implemented.
- **After the store:** about **1.0 ms** per frame.
- The rAF-gap-coinciding-with-commit numbers were measured but not kept in the first session's checkpoint, so I cannot quote them. The decision rests on the commit-time criterion alone.
- The Profiler instrumentation was removed: `grep Profiler|__m2` over `app/` finds nothing, and the test-time backup `ctx.backup.tsx` never contained it.
- Test: `position-store.test.ts` asserts the exact R4-M2 contract (0 vs 10 renders across 10 `seekTo` calls).
- C should re-measure once, per §5.

## 10. Track U browser evidence (this session, final code, gstack browse with `a-browse.json`)

- **R22-1:** from `/` at 1280×720, a click on the visible header `Studio Lab` link went to `/studio-lab` by client navigation (a window marker survived). Robots is `noindex`. `← CZABA` (`data-testid="arrangement-exit"`) returned to `/`, again client-side.
- **R22-3:** the header shots from the first session, taken after Header's last edit (`hdr-1440x900.png`, `hdr-1280x720.png`, `hdr-390.png` in `%TEMP%/a-r4/`), show no wrapping or overlap. The mobile menu shows `Studio Lab DEMO`.
- **R22-4 / G4-3 (partial):** after header navigation, the resource entries are only `/middle-east.mp3` and `/videos/hero/hero-music.mp3`. Synthetic stems make no request. The 401 and `/studio/middle-east` results are in §12. The per-request `Authorization` header audit was not run by A.
- **R12-L1:** `ბასი დემო` and `დემო ბასი` both give `["ღამის პულსი · ბასი"]`. `zzz` gives `ხმა ვერ მოიძებნა…` with the wave, ▶ and ＋ disabled. Clearing restores 9 items.
- **R12-L2:** the `სტემები` folder shows exactly the 4 stems, with `aria-current="true"` and `text-brand`. SFX + `slow` → ×: SFX filter kept, `ფილტრი: SFX` visible. Real `$B press`: ↓ from search focuses and selects the first stem, ↓↓ moves on, and Enter adds to the active audio track (`მუსიკა`) at the playhead. That gives one Undo `დამატება — ღამის პულსი · პადი`, and the status names the track and the time.
- **R12-L3:** ▶ starts 1 live source. A waveform click at 50 % restarts at offset 8.000 (duration 16). A real ↓ while previewing switches the source, and 1 source remains. Play stops the preview (label back to ▶, transport playing). Starting the preview pauses the transport. The preview is not part of the export: it uses `ctx.destination` directly, and the export graph is offline.
- **R12-L4** (synthetic `DragEvent`s on a clean load): the bass ghost at 10 s reads `00:10.000`, the clip lands at 400 px (expected 400 at 40 px/s), and Undo removes it. Over an occupied place the ghost is amber (`data-blocked="true"`, `· აქ ადგილი არ არის`), with no change. On the video lane it is refused (`· აუდიო ვიდეოხაზზე არ ემატება`), with history unchanged. **A real-mouse drag was not possible in this tool.**
- **R12-L5:** a `tone-2s.wav` File drop on music, stems, SFX and video is refused with the existing message, with history unchanged.
- **R12-S1:** the unit tests cover length, rate, peak, ρ and mix = sum. The in-browser `collection.loadSource` buffer oracle and the 3-stem export oracle were **not** run by A. The stereo transform duplicates the channel, which is linear, and the export runs at 48 kHz (`ARRANGEMENT_EXPORT_SAMPLE_RATE`), so no resampling is expected.
- **R12-S2:** with the bass dropped at 10 s, Play from 9.0 gives a master-tap onset at ctx 1.0507 (Play at ctx 0 + 0.05 lookahead → 1.0 s into playback = 10.0). RMS is −240 dB before and −21.9 dB after. The export WAV (48 kHz/24-bit) has its onset at **10.0002 s**, silent before (−240 dB).
- **R11A-1:** at 1440×900 the library goes from 288 to 40 px on ◀, the scroller from 1152 to 1400 px (+248), and ▶ restores 288. Both `<video>` nodes are identical (`===`) before and after. The dock measures 160×90.
- **R11A-2:** separator ←/→ (real presses) step by 16 (288→320, clamped at 480 and 288), and `aria-valuenow` matches. Pointer drag +100 px gives 388, and it is clamped at 480 and 288. The selected clip did not move, and Undo still reads the earlier add.
- **R11A-3:** in `u-1280.png`, `u-1280-collapsed.png`, `u-1440.png` and `scroll-1280.png`, all 4 lanes, the ruler and the loop strip are visible, and the dock does not overlap. C should take the authoritative shots.
- **R23:**
  - In computed style, all 15 webkit-scrollbar rules are generated; list and scroller have `scrollbar-gutter: stable` and `scrollbar-color`/`scrollbar-width` of `auto`.
  - **Headless Chromium hides native scrollbars, so A could not see the visual in screenshots.** The visual check, hover/drag mint, thumb drag and wheel go on the Tech Lead real-mouse list.
  - Keyboard scrolling: the list scrolls (`scrollTop` 0→209 via focused options). The timeline scrolls on ArrowRight when focused (A added a temporary `tabindex` in the test only).
  - R23-3: the filter `zzz` (overflow → no overflow) leaves the list width at 192/182 px, with no shift.
  - R23-4: no `app/styles` change.

## 11. Deviations

1. Design-ruling deviations are listed in §2.
2. `WorkspaceCollection.notice?: string` is a new optional field, for the honesty caption. It is optional, as the SRW-21 adapter contract requires.
3. **Biome ignores:** one `biome-ignore lint/a11y/useSemanticElements` on the library separator, with the reason that §9 mandates a focusable `role="separator"`. The two round-3 brace ignores are unchanged.
4. RF4-3: rule 7's early cap and C's hold check may disagree for up to 20 ms (see §8).
5. M2: the "before" number comes from the first session; the rAF-gap numbers were not kept.
6. D-19 rule 5 says "never re-seek while the hold is waiting". The dock re-seeks during a hold when the mapping jumps by more than 0.08 s (a user seek, scrub or edit), still under the pending guard and the 250 ms limit, so the video never holds on a stale target (code-reviewer L5).
7. The edit-shortcut guard during gestures (review M1) extends D-20 beyond Undo/Redo, with its own status text.

## 12. Not ready / not verified by A

**Track S — not ready:** none known.
**Track S — not independently re-verified by A this session:**
- R4-B2 browser part (import within ≤ 3 s after an aborted brace gesture);
- R4-B5 browser part (edit within 30 ms of the first Play);
- R4-B7 browser rAF-stub run.

The first session smoke-tested R4-B1, B3, B4, B6 and B7. Unit tests cover B1, B2, B5, B6 and B7.

**Track U — not ready:** none known, with these unverified parts:
- R23-1 hover/drag visuals and R23-2 thumb drag and wheel: Tech Lead real mouse, because headless hides scrollbars.
- R12-L4: real-mouse HTML5 drag not exercised, only synthetic `DragEvent`s.
- R12-S1 browser buffer and export oracles: not run by A.
- G4-3: A checked 401 and `/studio/middle-east` (see below). The per-request `Authorization` header audit was not run by A.

**Fixed this session:** if ↓ moved to a source that was not yet `ready` while a preview played, the old preview kept playing while the selection had moved. `startLibraryPreview` now stops the running preview before refusing an unready source (`ArrangementContext.tsx`). After the fix, tsc gives 0 and arrangement vitest 189/189.

**Extra checks run this session:**
- **R4-B6 (browser):** `window.AudioContext` was stubbed to throw before the first Play. The status reads `ამ ბრაუზერში Web Audio მიუწვდომელია — დაკვრა და ექსპორტი ვერ იმუშავებს.`, Play stays Play, and there were 0 window errors or unhandled rejections. The Export dialog shows the same reason after `WAV-ის ექსპორტი` is pressed, but not before.
- **G4-3 (part):**
  - Anonymous `GET /api/studio-token?product=middle-east&file=Drums.wav` → **401** `Please sign in to access Studio.`
  - With `Authorization: Bearer fake.token` → **500** `Unable to prepare Studio access`. No token is returned. That route is protected and unchanged, and the 500 is likely the backend being unreachable; C should confirm.
  - `/studio/middle-east` in the browser shows `Sign in required`.

## 13. Exact next checks for C

1. Track S: RF4-1 (watch the first run after import), RF4-2, RF4-3 (note the §8 rule-7 tension), RF4-U, R4-B1..B7, R4-M2 re-measure.
2. Track U: R22-1..4 including G4-3 auth and 401; R23-1..4; R12-L1..L5; R12-S1 in-browser oracles; R12-S2; R11A-1..3 with screenshots at 1280×720 and 1440×900.
3. Gates G4-1, G4-2 (the `Header.tsx` diff), G4-R regression.

## 14. Root-review and publication-checkpoint items still open (for B and C follow-up)

- Root review **M3** (docs honesty), **L6** (export dialog "graph" wording when the loop is on), **L7** (unbounded history, accepted for the demo) and **L5** (accepted biome-ignores) are not addressed this round, and were not in scope.
- `publication-checkpoint.json` follow-ups not addressed here:
  - the purchased `/studio/:product` loader hardcodes middle-east (inherited, protected, SRW-21);
  - instruction files need portable paths;
  - the T12 Gain/Volume phase remains after the original scope.
- The whole backlog is **not** complete.
