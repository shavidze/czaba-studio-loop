# A round 72 — SRW-16 (FB-10) named markers, stage 1 (D-29z37) + ROOT-R71-L1

Implementer: A (Claude Opus 5.5) · 2026-10-21 · Linux cloud runner · artifacts: `a-round-72/`

## 0. Environment and baseline
- `:5173/studio-lab` → 200; `:5199/api/products` → 000 (backend unavailable in cloud; expected). Server not started/stopped by A.
- HEAD `1e469e59` (unchanged at end), `git status` empty at start.
- Snapshots 5/5 OK, `cmp` same 5/5; protected 4/4 OK (start and end).
- Frozen list: 425/442 OK at start. **17 mismatches are Windows-EOL artifacts** in B's hash list. For 16 of them, LF→CRLF reproduces B's hash exactly. The 17th, `docs/implementation/2026/quarter-IV/007-studio-video-sync.md`, did not reproduce with the simple CRLF variants I tried, but it is byte-identical to the HEAD blob. Git status is clean, and none of the 17 is owned or touched. The count is the same 17 at the end. B/C should regenerate the list on Linux.
- Process count: `tasklist` does not exist on Linux, so A used `pgrep -c node` (1 at start).

## 1. Pre-flight (summary)
- Read: CLAUDE.md, `.claude/rules/*`, primitives-map, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, REACT_CONTEXT, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts new-component/new-test/studio-feature, skill pre-flight.
- Assumptions:
  - markers live in `Arrangement.markers?`, and the key is absent when empty;
  - insert time = `range.start`, or else the live position;
  - marker edits go through `commitArrangement` with no resync;
  - Cut Time is the only time-removal path.
- Files: exactly the 10 owned paths.
- **design-philosopher (read-only)** advice, which was followed:
  - markers are neutral: line `bg-muted`, tag `bg-foreground/10 border-outline`, name `text-foreground`;
  - the selected marker is `brand` (`bg-brand` line, `bg-brand/20 border-brand text-brand`);
  - focus uses `ring-brand ring-offset-1 ring-offset-surface`;
  - **no `accent`** in the row (the playhead and loop are accent);
  - header buttons are `h-4`, in the Snap resting style;
  - the row is `h-5`, not tinted.

## 2. Red run (before source) — `a-round-72/red-run.txt`
- `markers.test.ts`: `Failed to resolve import "../markers"` (whole file red).
- `markers-ui.test.tsx`: **15 failed / 1 passed**. MU12 (typing `m` in the search) is a no-regression guard and is green on the baseline by design.

## 3. Changes (git status = 10 lines: 5 M, 5 ??)
| File | Change |
|---|---|
| `app/types/arrangement.ts` | additive: `ArrangementMarker`, optional `markers?` |
| `app/lib/arrangement/markers.ts` (new) | constants `MARKER_NAME_MAX_LENGTH`, `MARKER_DEFAULT_NAME_PREFIX`, `MARKER_TIME_EPS = 0.0005`; `arrangementMarkers`, `nextDefaultMarkerName`, `normalizeMarkerName`, `markerAtTime`, `addMarker`, `renameMarker`, `deleteMarker`, `adjacentMarkerTarget`, `remapMarkersAfterDeleteTime`. **Extra exports:** `roundMarkerTime` (used by the row for the duplicate check at press time) and `replaceArrangementMarkers` (the normal-form setter used by `deleteTime`). No React, no `model.ts` import. |
| `app/lib/arrangement/model.ts` | import + `deleteTime` returns remapped markers only when the input has the key; the rest is byte-identical |
| `app/contexts/ArrangementContext.tsx` | `cutTimeSelection` only: inline `markersRemoved` count + suffix ` {N} მარკერი წაიშალა.`; no import, `scheduleKey` untouched |
| `app/components/arrangement/ArrangementMarkerRow.tsx` (new) | `forwardRef` + `useImperativeHandle` `{ beginAddMarker, stepMarker }`; header `Markers` + / ◀ / ▶ (aria/keyshortcuts/testids/Georgian titles as specified); flags with `data-marker-id/-time`, aria-label, title, `aria-current`; label width `min(160, Δx − 4)` (the label is `invisible` below 12 px, the flag line always shows); sibling name input (`maxLength 64`, aria-label, testid), settles once (Enter/Escape/blur), `before = getArrangement()` at commit; F2 rename; Delete/Backspace on a flag (stopPropagation); click = seek + select; double-click while stopped = seek + play. No timers, intervals, window listeners or AudioContext; no position-store subscription. |
| `app/components/arrangement/StudioWorkspace.tsx` | §2.1 only: import, `markerRowRef`, `isMarkerTarget`, row element between TempoRow and the Loop row, `m` (non-modifier) and Ctrl+←/→ (modifier) in the gesture refusal, Ctrl+←/→ branch before `if (modifier) return;` (excluded on slider/separator/loop brace/overview), M branch after it, `isMarkerTarget` exclusion on the Delete and plain-arrow branches |
| `docs/.../064-studio-lab-markers.md` (new) | TEMPLATE sections, status `Round 72 — D-29z37; C-ის შემოწმებას ელოდება`, stage-2 TODO |
| `docs/.../063-…metronome-horizon.md` | exactly 2 edits (status line; sentence appended to the Gates bullet, l.84). LF 92 kept |

**Wiring and design decisions:**
- **Gesture guard placement.** For keys, the window refusal list is the only guard (that is how mutation (l) is killed). The header buttons and the flag's Delete, which do not pass through the window list, use the row's `runUnlessGesture`. F2 during a gesture is not refused, because opening the rename editor is not an edit.
- **Add-Escape focus.** It restores focus to the element that was focused before the editor opened. Rename settles focus on the flag.
- **Status lines added** beyond the spec:
  - add: `მარკერი «…» დაემატა: mm:ss.mmm.`
  - rename: `მარკერის სახელი: «…».`
  - delete: `მარკერი «…» წაიშალა.`
- **The selection is cleared** when the selected marker is deleted.

## 4. Tests (actually run)
- `markers.test.ts`: 26 passed (MK1–MK10 + extras).
- `markers-ui.test.tsx`: **18 passed** (MU1–MU14 + MU2b, MU6b, MU8b, layout row). MU13 and MU14 were added after the code review. MU2 was strengthened so that focus starts on the Snap button, which makes the settle-once mutation (n) observable. MU11 also checks the next button and Delete on a flag during a gesture.
- Related: the 6 arrangement files (markers ×2, delete-selection ×2, clipboard, model): 114 passed. **Final tree: all 44 files that import `StudioWorkspace`/`ArrangementContext` (+ `markers.test.ts`): 835 passed** (`a-round-72/related-final.txt`). Alone, the two new files passed 3/3 at about 3.5 s each (`alone-runs.txt`; these runs came before MU13/MU14).
- `npx tsc --noEmit`: 0.
- Biome (read-only): the 8 owned code/test files have **0 diagnostics**. `./app` has **0 errors / 218 warnings / 1 info**, 383 files, within 4/218/1. The 4 baseline errors do not reproduce on this LF checkout. The new files were formatted with `biome format --stdin-file-path` into the same file; no `--write` was run on any path.
- `npm run build`: rc 0 (`a-round-72/build.txt`).
- **Not run by A (speed rules 2026-10-21 override task §2.4):** the full `npx vitest run` (expected 103 files) and `npm run verify`. Both belong to the root gate.

## 5. Mutations — `a-round-72/mutations.txt`
Scratch `a-round-72/scratch` (a copy of `app/` with a symlink to store's `node_modules`), script `a-round-72/tools/mut.py`, files restored after each mutation. `diff -rq scratch/app store/app` was identical at the end.

| Mutation | Killed by |
|---|---|
| a | MK9, MU9 |
| b | MK8 (+MK9, MU9) |
| c | MK7, MU6 |
| d | MK7, MU6 |
| e | MK1, MK6 (+MK9) |
| f | MU10 |
| g | MU2, MU7 |
| h | MU8 |
| i | MU3 |
| j | MU5 |
| k (both sites) | MK2, MU4 (k1, `markers.ts` only: MK2) |
| l | MU11 |
| **m** | **survives — equivalent mutant**: the input is a sibling of the flags, so the flag handler never receives its events; the window handler returns on typing targets |
| n | MU2, MU7 |
| o (C extra) | the layout test |
| p (C extra) | MU6 |
| q (C extra) | MU2, MU13, MU14 |
| r (blur commits during a gesture, review #1) | MU13 |
| s (blur moves focus, review #2) | MU14 |

Mutation (l) first survived, because `beginAddMarker` repeated the gesture guard. I moved the key-path guard to the window list only, and (l) now dies.

## 6. A smoke (not a PASS) — `a-round-72/smoke-1440.txt`, `smoke-1440.png`
Standalone Playwright (installed chromium, fresh context) at 1440×900. The first attempt hit a page without the row, most likely a Vite re-optimise right after the new files appeared. A probe and a re-run were fine.

**Layout**
- The row is at y 239, h 20, between tempo (220.5) and loop (259); the first lane starts at 275.

**Add**
- REAL-mouse (PW) drop of Middle East on music at 0.050 s, then a REAL ruler click at 12 s → 12.000.
- M → editor `Marker 1` → typed `აქ შედის მუსიკა` → Enter:
  - the marker is at 12.000;
  - flag x − ruler x = 480.00 px = 12 × 40 px/s;
  - Undo title `Undo: Add Marker`;
  - focus is on the flag.

**Jump and play**
- Home, then a click on the flag → 00:12.000.
- Home, then a dblclick → playing; 1 s later 00:12.972.
- M + `x` + Enter while playing:
  - the marker was added at 12.980;
  - `createBufferSource` was called **0 times** during the add.

**Navigation**
- Home, then Ctrl+→ ×4: 12.000 → 12.980 → 01:41.402 (end) → status `წინ მარკერი აღარ არის`.

**Network and console**
- Forbidden requests 0, Authorization headers 0, hydration lines 0.
- Console errors: only the expected cart/backend `ERR_CONNECTION_REFUSED`.

## 7. Code review (real `code-reviewer` subagent, 7/10) — findings and actions

**#1 High: a blur commit during a pointer gesture.** If you click a clip while the editor is open, the blur commits the marker, but the clip gesture's `before` snapshot then overwrites it. The marker disappears and a dead `Add Marker` entry stays in the history.
- **Fixed.** `settleEditor(reason)`: when a blur happens during an active gesture, the editor settles without committing and shows `GESTURE_EDIT_BLOCKED_MESSAGE`.
- Test MU13; mutation r is killed.
- This deviates from the spec text "blur commits", and B should confirm it. The typed name is discarded in that case.
- **Browser probe** (`a-round-72/blur-probe.txt`, PW Chromium, 1440×900). The editor was open with a typed name, and then each surface below was used:

  | Surface | Result |
  |---|---|
  | REAL ruler click at 20 s | committed (`Add Marker`), position 20, marker survives |
  | REAL-mouse (PW) clip drag 10 px | committed, marker survives |
  | REAL-mouse (PW) empty-lane marquee | committed, marker survives (its time was the existing `range.start` 7.55, per R6) |

  Chromium fires the blur **before** these surfaces claim the gesture, so the new guard never triggered in practice. It is defence-in-depth (multi-pointer or programmatic focus loss), and these flows lost nothing.
- In every case, focus stayed on BODY after the click, not on the flag.
- The reviewer's scenario (a marker silently lost, then a dead Undo entry) was not reproduced with or without the guard on these surfaces in Chromium. The guard was not mutated in the browser.

**#2 Medium: a blur commit pulled focus back to the flag.**
- **Fixed.** Focus now moves only on Enter (to the flag) or Escape (add: restore; rename: the flag). On blur, focus stays where the user put it.
- Test MU14 (real focus move to the search, add and rename); mutation s is killed.
- **This deviates from R6's literal wording** ("Enter or blur … focus returns to its flag"). It applies to blur only, and B should confirm it. It affects blur by any route: the ruler, marquee, loop brace, clips, or another control. C's MK rows all commit with Enter, so no C row changes.

**#3 Low–Medium: a stale `pendingFocusRef`.**
- **Fixed.** The effect consumes the pending target once, and rename focuses only after the marker is confirmed to exist.

**Not changed (proposals for B):**
- **#4:** `maxLength={64}` counts UTF-16 units, so astral names are capped at 32 code points. I kept it because the spec literally asks for `maxLength={64}`, and `normalizeMarkerName` still enforces 64 code points.
- **#5:**
  - the timeline extent ignores markers past the end (`timelineSeconds` is outside the §2.1 wiring);
  - Ctrl+→ goes to a past-end marker before the end, because the spec's `adjacentMarkerTarget` order is markers first, then the end.
- **#6 a11y:**
  - every flag is a Tab stop; a roving tabindex would fit stage 2;
  - `aria-current` is used for selection, as the spec mandates;
  - the input has no hint for Enter/Escape;
  - ◀ and ▶ may render as emoji on macOS.
- **#7 tests:**
  - there is no render-count probe for "no re-render on position frames";
  - MU5 and MU6b use the real clock with a 0.5 s window;
  - the UI test lives in `lib/__tests__` because the task fixed that path.
- **#8 (info):** `commitArrangement` clears the preview flag. This is harmless after #1.

**Architecture note (for B/root, not acted on):** this is signal 4 / signal 1 at the `StudioWorkspace` keydown handler. The single window handler now also routes marker keys and marker exclusions (the 7th routing clause, ARCH (e)), and stage 2 will add more. Verdict: **keep for now** (one listener, a shared gesture-refusal order). After SRW-16 is complete, extract a shortcut-dispatch table as a bounded task, with MU6/8/11/12 and SRW-24 as acceptance tests. The UI harness is now in its 5th copy (ARCH (c)).

## 8. Known gaps / deviations
- The full vitest/verify gates were not run by A (speed rules).
- **Spec deviations to confirm (B):** a blur during a gesture does not commit (review #1); a blur never moves focus (review #2).
- MU10 covers the no-resync rule in jsdom. The browser check covered only the add (0 sources); rename and delete while playing were not checked in the browser by A.
- The workspace's shortcut hint strip does not list M or Ctrl+←/→, because §2.1 limits the `StudioWorkspace` delta.
- Markers beyond the project end are allowed (for example after clips are removed). `adjacentMarkerTarget` visits markers before the end fallback, so with a marker past the end, Ctrl+→ goes to the marker and skips the end.
- The frozen hash list has the 17 Windows-EOL entries described in §0.
- **Loop-folder hygiene:** `find -H tmp/studio-real-loop -maxdepth 3 (node_modules|.vitest-cache|.vite)` finds only `a-round-72/scratch/node_modules`, which is a **symlink** to store's `node_modules` that I created for the mutation scratch. No cache dir was created in the loop folder. Nothing was deleted.

## 9. Exact next C checks
**Deviation rows for C to add:** (D1) type a name, then a REAL ruler click → is it committed, and does focus stay off the flag? (D2) type a name, then REAL Tab or a click into the library search → is it committed, and is focus in the search? Tech-lead R72-T addition: "type a name, then click the ruler — what happens?"

G72-2 → R72-S → R72-U → G72-1 (gate rows `gate`) → §4.6 MK-ADD* (both viewports), MK-ADD-RANGE, MK-ADD-PLAYING/MK-NO-RESYNC, MK-ESC, MK-DUP, MK-JUMP, MK-PLAYFROM* (both viewports, meter), MK-NAV, MK-RENAME, MK-DELETE, MK-CUT-TIME, MK-LAYOUT* (both viewports), MK-TYPING → §4.7 MK-EXPORT-REG, REG-CHROME (ruler dblclick Fit, loop brace drag, BPM 90, playhead, marquee y offsets after +20 px), REG-KEYS, REG-HYD → G72-3. The token rows need `:5199`, which is down in the cloud, so they are BLOCKED.

## 10. Scope status
Implemented: R1–R10 and ROOT-R71-L1 (doc 063, 2 edits); doc 064 written.

B acceptance items A truly passed:
- red-first;
- the owned-file set (10 lines);
- tsc 0;
- Biome owned 0 and ./app within budget;
- the new tests plus 43 related files green;
- mutations a–l and n, plus o, p, q, r, s (m equivalent);
- build rc 0;
- the A smoke.

Not claimed: the full vitest/verify (root gate) and every C browser row.
