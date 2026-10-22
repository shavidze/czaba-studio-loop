# C round 75: SRW-16 stage 2a fix-up (C-R74-01, A-R74-MU8E-POINTERUP, C-R74-02)

Verifier: C · 2026-10-21 · Playwright + installed Chromium, headless, a fresh context per run, anonymous, no credentials. Target `http://127.0.0.1:5173/studio-lab` (env-status store 200; backend :5199 unavailable, as expected).

**Verdict: PASS. `browserVerified=true`, `realVerified=true`.** No bugs found.

## Source unchanged
- HEAD `6b574e8`. `git status --short` = the 10 baseline lines at start and end.
- The 6 owned files match A's reported end sha256 at start and end. The frozen list is 449/449 OK and the protected files are 4/4.
- Grant scope checked by diff against B's snapshots:
  - `markers-ui.test.tsx` changed only in the MU8 title, l.526 `toBe('Move Marker')`, the added `markerTimes` assertion, the two MU8e `pointerUp`s and `isPointerGestureActive()` false.
  - In `markers-move-ui.test.tsx` the MV1–MV14 prefix is byte-identical, and MV15–MV17 are appended.
  - `ArrangementMarkerMenu.tsx` is untouched.
  - In `StudioWorkspace.tsx` the diff is only inside `handleTimelineScroll`.
  - In `ArrangementMarkerRow.tsx` the diff is only `closeMenu` and the `pxPerSecond` layout effect.
- C edited no app source.

## Acceptance (both 1440x900 and 1280x720 unless stated)
| ID | Result | Evidence |
|---|---|---|
| MK-MENU-SCROLL | PASS | Menu opened by right-click and by Shift+F10, then a 300 px horizontal wheel over a lane. scrollLeft went 0→300 and was still 300 after 400 ms, so focus return did not re-scroll. The flag moved 300 px. The menu was removed from the DOM and `activeElement` was the flag. Position, undo label, clip selection and markers were identical. A second wheel kept focus on the flag and did not reopen the menu. `mk75-*.json`, `shots/scroll-*` |
| MK-MENU-VSCROLL | PASS | Real overflow from REAL track-height drags: 112 px at both viewports. A vertical wheel moved scrollTop 0→112 with scrollLeft still 0. The menu stayed open, and the menu and flag rects were unchanged (0 px). Escape returned focus to the flag. |
| MK-MENU-ZOOM | PASS | Ctrl+wheel zoomed 40→46 px/s and closed the menu, with focus on the flag and no seek (position 0). Anchoring held: the time under the pointer went 19.450→19.457 s at 1440 and 15.450→15.457 s at 1280. Zooming with no menu open moved no focus. |
| MK-MENU-FOLLOW | PASS | Zoomed to 161.8 px/s first, then Follow on, Home, Play, menu opened on the marker at 1.000. Follow auto-scrolled 0→589 at 1440 and 0→482 at 1280. In every 100 ms poll the menu was open and Follow stayed `on`. Play from here jumped and kept playing: 1.098→1.597 and 1.101→1.600. After reopening, a user wheel of 300 closed the menu and set Follow to `paused`, and playback continued (2.648→3.049 and 2.631→3.031). |
| MK-MENU-DOCK | PASS (both) | Loaded owned synthetic media `media/beeps-6s-h264-aac.mp4`, expanded the video and dragged the floating box under the marker row. The menu overlapped the box by about 11520 px² at 1440 and about 10536 px² at 1280. It is portalled to body with z-50. `elementFromPoint` hit every menu item. A Play click by coordinates played 1.362→1.873, and a Delete click removed the marker. `shots/dock-menu-*.png` |
| MK-74-RECHECK | PASS | Re-ran the whole round-74 `mk74` script at both viewports, which covers more than the listed rows. Every row passed. Its MK-MENU-SCROLL info row now reports `menuAfterScroll 0` (round 74 reported 1). `mk74r-*.json` |
| T75-TARGETED | PASS | `npx vitest run` markers-ui and markers-move-ui: 2 files, 40 passed, 0 failed. A verbose `-t MU8` run lists MU8 green by name. `vitest-markers.txt`, `vitest-mu8.txt` |
| REG-HYD | PASS | In every run: no hydration warning, no `useLayoutEffect` server warning, no non-noise console error. |
| G75-3 | PASS (non-backend) / BLOCKED (fake Bearer) | The header link opens `/studio-lab` with the demo badge. `/studio/middle-east` shows "Sign in required" with no workspace. Anonymous `/api/studio-token?product&file` returns 401, also from inside the page. 0 forbidden page requests and 0 Authorization headers. Fake Bearer returns 500 "Unable to prepare Studio access": **BLOCKED, backend unavailable in cloud.** |
| Neighbour NB-GRID-SCROLL | PASS | The lane grid menu closes on a horizontal user wheel. The grid-menu Follow exemption was not separately re-run; that code is byte-identical. |
| gate rows | gate | Full vitest, typecheck, build, Biome, verify and e2e smoke are not claimed. |

Ableton: every row is არ ეხება (a CZABA UI rule; Live 12 §6.4 does not cover context-menu dismissal).

## Not run
- A's Low 4 probe (a leftward user wheel at the clamped right end during Follow) was not run. It is not an acceptance row, and reaching the clamp would need about 95 s of playback at 162 px/s. Recorded as an open question for a later Follow regression.
- The native ContextMenu key path is untestable here because CDP sends keys only (INFO-C74 class). Only Chromium was tested; no WebKit or Firefox.

## Info for B (not bugs)
- **INFO-C75-ZOOM-STOPPED-FOLLOW:** Ctrl+wheel while stopped leaves Follow `on`; it only pauses during playback. The task's harness note applies to playback, so this does not break the contract.
- **INFO-C75-DELETE-LAST-FOCUS:** deleting the only marker from the menu moves focus to the marker add button.
- **Harness note:** with the 101 s clip the track-height handle is 5504 px wide, so drag it near its left end. My first VSCROLL attempt failed for this reason, which was a harness miss and not an app defect.
- A's architecture note (a duplicated Follow auto-scroll predicate; proposal `isFollowAutoScroll`) and reviewer Low 2 (same-zoom `applyTimelineView` scrolls do not close the menu) are forwarded as signals. Neither can be reached by a user today.

## Files
`c-round-75.json`; `c-round-75/` (tools/*.cjs, run-*.txt, mk75-*, mk74r-*, dock75-*, g75-*, token-api via run-tok.txt, vitest-markers.txt, shots/). Browser state: `c-browse.json`.
