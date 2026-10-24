# C round 148 — V-0.5c verification (video dock + Studio Lab title in English, final RV-4 sweep, RV-1 re-capture)

Verifier: C · 2026-10-24 · Tree: HEAD 34ce551 + A's round-148 working tree (`a-round-148/end-sha256.txt`). Real Playwright Chromium at `http://127.0.0.1:5173/studio-lab`, a fresh context per session, Snap off at start in every session. Viewports 1440×900 and 1280×720.
Env: `env-status.json` store 200 (round 148).

## Verdict: **PASS**. browserVerified = realVerified = true

All browser rows that can run here were run, at both viewports. The only blocked item is the G148-3 fake-Bearer 403, because the backend is unavailable in the cloud.

| Row | Result | Evidence |
|---|---|---|
| T148-TARGETED | PASS | 13 files, 215/215. The per-file `it` counts equal A's: strings 51, video-dock-strings-ui 3, and the rest unchanged (`c-round-148/out/vitest.json`). |
| SOURCE-SCOPE | PASS | <ul><li>Frozen 957 OK at start, before RV1 and before G148-3.</li><li>end-sha256 (11) OK.</li><li>The 11 paths are byte-identical at C start and C end, so no source changed during C's phase.</li><li>`git status` shows 9 ` M` and 2 `??`, nothing else.</li><li>No `zz-rv4-probe.ts`.</li><li>Protected diff vs 34ce551 is empty.</li><li>0 non-comment Georgian lines in the dock and the route.</li><li>End check after G148-3: frozen 957 OK, `git status` unchanged (11 entries).</li></ul> |
| AN-REVIEW | PASS | <ul><li>The dock diff is exactly the 18 uses plus the import (18 −/19 +). Classes, testids and glyphs are unchanged.</li><li>`studioVideoDockStrings` matches §1.1 byte for byte, including U+00B7 and U+2014. The route title matches §1.2.</li><li>The tests use hand-written literals: ST40, ST47, ST50, ST51 (a real `readdirSync` walk with the ≥60 guard), VDS1–3, DS1/DS2 `not.toHaveBeenCalled`, and the purchased-collection pins.</li><li>Doc 120 has only the 2 lines. Doc 121 is in Georgian, follows the TEMPLATE sections and is consistent with the evidence.</li></ul> |
| COPY-DOCK | PASS (both) | <ul><li>(a) `region` "Video". `Arrangement · Overview`. Caption `Video · sound from the video track (M/S/Volume)`. `No video added yet` is visible. `Expand video` aria and title. The `<video>` labels are `Video preview` / `Video preview (standby)`.</li><li>(b) With the video: `beeps-6s-h264-aac.mp4 · sound from the video track (M/S/Volume)`.</li><li>(c) The gap reads `No video · 00:08.000`. With Soft impact on Music at 10 s (end 00:12.000), playing from 8 s moves the gap text 8.249 → 9.149 in real time (ratio 0.997 at 1440, 1.007 at 1280). Ctrl+Z removed the clip (end back to 00:06.000).</li><li>(d) `data-video-floating=true`. The placeholder reads `Video expanded`. Its button shows `Return` and its name is `Return the video to the compact view`; 2 buttons have that name. Drag handle: `Move the video (arrow keys: 16 px)` / `Move the video`. Close: `Close the expanded video` / `Close (Esc)`. ArrowRight moves the box +16.00 px in x and 0 in y.</li><li>Escape, `Return` and ✕ each bring the video back to compact (w 160), with the status `The video went back to the compact view.`</li></ul> |
| PLAY-FAIL | PASS (both) | `play` rejects for `arrangement-video`. The status `Video playback failed — try MP4 (H.264) or WebM.` appears after 38 ms (1440) and 37 ms (1280). The playhead stays at 0 across 3 samples over 500 ms. 1 rejected call. |
| VIDEO-SYNC | PASS (both) | 3 s from 0. Video `currentTime` goes 0.21 → 2.93. Four samples of \|vt − playhead\| are 0.001, 0.003, 0.007, 0.001 s at 1440 and 0.001, 0.004, 0.008, 0.002 s at 1280. The maximum over all ~164 valid frames is 0.007 / 0.008 s (limit 0.12). `createBufferSource` +1. |
| TITLE-LANG | PASS | <ul><li>`document.title` is `Studio Lab — Demo workspace \| CZABA`, with exactly one U+2014.</li><li>The SSR `curl` shows the same `<title>` and `<html lang="en">`.</li><li>In the DOM, `lang` is `en`.</li></ul> |
| NO-GEORGIAN | PASS (both) | <ul><li>Scanned the whole `body` (text, aria-label, title, placeholder and aria-valuetext) plus `document.title`.</li><li>Ten states: ready, previewing, Export dialog open, video, gap, expanded, returned, error (`middle-east.mp3` aborted), and the play-fail session.</li><li>Every hit is ledger content (22–24 nodes per state). **0 non-ledger nodes** in every state, at both viewports.</li></ul> |
| LAYOUT-DOCK | PASS | Against `dockbase148`, every delta over 1 px is explained (the full list is in `out/cmp148.json`):<ul><li>overview label/note dw −52;</li><li>`dock-caption` dx −52 / dw +52 with the right edge fixed (= label dw);</li><li>`dock-caption-note` dw −48 (in a `text-right` parent, right edge fixed);</li><li>placeholder text dw −50 and Return dw −24, both centred (centre fixed);</li><li>`video-empty` 2→1 lines and `video-gap` 3→1 lines, boxes d0.</li></ul>Everything else is ≤ 1 px. No horizontal overflow. |
| LAYOUT-REST | PASS | `rest.{empty,video,expanded}`: 92/95/95 nodes at 1440 and 81/84/84 at 1280. The key sets are equal and 0 nodes move more than 1 px. |
| RV1-RECAPTURE | PASS | `out/bbox-post-v0-{1280,1440}.json`, labelled `post-V-0 RV-1 reference (round-148 tree)`. Determinism: max **0 px** between run 1 and run 2 in S0/S1/S2 at both viewports. Every S1 setup step succeeded, and the final S1 header equals the c-round-125 baseline header. Nothing under `c-round-125/out` changed (sha256 before = after). Tool edits are listed in the JSON (`measurements.rv1.toolEdits`). |
| G148-3 | PASS (403 part BLOCKED) | <ul><li>`/studio-lab` in a fresh anonymous context shows the workspace and the English demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]` at both viewports.</li><li>`GET /api/studio-token` returns 401.</li><li>The fake-Bearer 403 is BLOCKED: backend unavailable in cloud.</li></ul> |
| PX-NET / REG-HYD | PASS | In every session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The only noise is the expected cart noise (2–3 per session). |

Gate rows, not claimed here: full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## Ableton correspondence (rated separately from the CZABA requirement)
- **Overview term (§6.1):** confirmed. `Arrangement · Overview` labels the whole-arrangement strip.
- **Video sound treated like audio (§28.1, §28.2.1):** confirmed. The caption names the video-track M/S/Volume. Real-browser `createBufferSource` +1 shows the video track's sound plays.
- **Video Window (§28.2.2):** deliberate difference. CZABA has an in-page dock plus an expandable panel, with no OS window, no View-menu toggle and no full screen. Only the copy changed.
- **Gaps (§28.2.2.1):** deliberate difference. CZABA shows `No video · <time>` where Live shows a black screen. The behaviour is unchanged, and the time advances live.
- **Play-failure message, empty text, page title:** not applicable (CZABA-only copy).

## Bugs
None.

## Invalid runs
- The first `dockpost148` capture at 1440 failed because the page reloaded during the server's cold start (`grid-control` became null right after `openStudio`). The rerun was valid. The log is at `out/dockpost148-1440-invalid1.log`.

## Notes for B
- **LAYOUT-DOCK judgment call.** R5 literally grants `dock-caption-note` and `dock-placeholder-text` only their own w/glyph. Both nodes also shift x:<ul><li>`dock-caption-note`: dx −48 / dw +48, right edge fixed (`text-right` parent);</li><li>`dock-placeholder-text`: dx +25 / dw −50, centre fixed (centred placeholder).</li></ul>The cause is the fixed alignment anchor. C classified both as explained; B may rule under the §7 literal-criterion row.
- An extra run of `video-dock-strings-ui` after all browser work: 3/3.
- Per §7: V-0 closes once gate 148 publishes. `bbox-post-v0-*` becomes the RV-1 reference only if gate 148 publishes exactly this tree.
- `c-round-125/tools/lib122.cjs` still has Georgian text regexes in `clipInfoSel`, `closeDlg` and `exportWav`. `d6` does not use them, so I left them as they were. Any later export/WAV re-check that uses that chain needs the English strings.
- In COPY-DOCK (d), the Escape return left focus on BODY only because the harness had blurred focus before pressing Escape. `Return` and ✕ gave focus back to the expand toggle. Focus return itself is covered by the green floating-video and library-video-return-focus tests.
- The task's line numbers for the purchased-collection pins were off by one (298–299, not 297–298). A edited the intended lines.

Evidence: `c-round-148/{tools,out,shots}/`. The tools are `c148.cjs`, `dockbase148.cjs`, `cmp148.py`, `d6.cjs` + `d6build.py`, `g148-3.cjs` and `lib.cjs`.
