# C round 266 — SABA-B-11c stage 1 fix-up (C-R265-01 split D3 + C-R265-02 copy)

**Verdict: PASS** — browserVerified = realVerified = true. 1 Low planning-claim finding against B (C-R266-01). No finding against A's work.

Environment: env-status.json store 200 (round 266). Fresh anonymous Playwright Chromium contexts on http://127.0.0.1:5173/studio-lab, 1440×900 and 1280×720, 0 page errors in every run. Source read-only; scope hashes rc 0 at start and end.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: `sha256sum -c` rc 0 (start and end), 16 status entries (11 r265 + 5 granted ` M`), HEAD 2ea196e | `c-round-266/claims.txt` |
| HUNK-SCOPE | PASS: ctx `-1996`,`-1998` (window 1989–2000); model `-293,15`,`-309`,`-311,11`,`-323` (290–324); strings `-24`, `-116,0` insertion, `-289` | `git diff -U0` |
| CLAIMS | **partial**: K1–K10, K12–K16 reproduce (K1 = 16 post-A as expected; K9 at HEAD via `git grep HEAD` = B's list; K13 = `probe-split-sketch.json` 46/46 keys; K14 = B's values, `loopNoRange` now the new text with `statusFits` true). L29 grep: only untagged hits are doc-198 l.4 references (covered by K15). **K11 first command returns nothing** → C-R266-01 | `claims.txt`, `k13.json`, `k14.json` |
| TESTS-TARGETED | PASS: 9 files, 218 tests | `vitest-targeted.txt` |
| REWRITES | PASS: removed lines only `middleId` line + 2 literals, each replaced by equal/stronger; UI file add-only (0 removed, 103 added, l.481–583). A also added MS6, MS7 and a `laneRanges('music')` empty assert in BS1/BS4, beyond §2.6: inside the granted block / add-only file, nothing removed — accepted | `rewrites.diff`, `ui-file.diff` |
| MUTANTS | PASS on C's scratch `/tmp/c266-scratch` (control 65/65 green): M6 red MS1, MS2, MS6, MS7, BS1, BS2, BS4; M7 red MS2, MS6, BS2; M8 red BS2; M9 red MS3, MS7, BS3. Scratch restored (cmp) | `mutants.py`, `mutants-summary.txt`, `mutant-*.txt` |
| SPLIT-PAST-START (both) | PASS: range 06.250–12.500 → Ctrl+E clips [10.000, 12.500], `splitRangeDone`, no range; Delete → [12.500] "Clip deleted; the gap remains."; Ctrl+Z → [10.000, 12.500]; Ctrl+Z → [10.000] "Undo: Split at time selection" | `c266-browser.json`, `shots/split-past-start-*.png` |
| SPLIT-BG-INTO-CLIP (both) | PASS: range 01.000–15.000 → [10.000, 15.000], `splitRangeDone`, no range | same |
| SPLIT-GAP-2 (both) | PASS: gap → [10, 20]; range 11.250–22.500, 1 overlay; Ctrl+E → [10.000, 11.250, 20.000, 22.500], "Clips split at the edges …; the 2 parts inside it are selected.", no range, "2 clips selected"; Delete → [10.000, 22.500] "2 clips deleted; the gap remains."; Ctrl+Z ×2 → [10, 20] (one history entry for the split) | `shots/split-gap-2-*.png` |
| SPLIT-NO-EDGE (both) | PASS: empty 1–7.5 and whole-clip 9–13 both give "Could not split at the time selection.", clips unchanged, range and overlay kept | `shots/split-no-edge-2-*.png` |
| SPLIT-MARKER (both) | PASS: [10.000, 15.000], "Clip split at 00:15.000." | json |
| SPLIT-ALL-TRACKS (both) | PASS: 4 lane overlays, refusal text unchanged, clips [10.000], range kept | json |
| FOCUS-SPLIT (both) | PASS: (1) library option BUTTON before and after Ctrl+E (split happened); (2) after clicking Split: `BUTTON|Split` (1 button). Never BODY | json |
| VIDEO-BG (both) | PASS: mid-drag marquee 0, range already on video row; final "00:01.000 — 00:07.500", exactly 1 overlay inside `[data-track-id="video"]` | `shots/video-bg-*.png` |
| COPY (both) | PASS: Ctrl+L status "To set a loop, first make a time selection (drag in a lane).", scrollWidth = clientWidth (1416/1256); export reason "Make a time selection in the Arrangement (drag in a lane)" 310×16 px, 1 line, fits | `shots/copy-*.png` |
| CARRIED | PASS: scope rc 0, hunks in window, UI file add-only → the 20 r265 rows carried. 1440 smoke: BG-INTO-CLIP range 01–15, 1 overlay, Delete → [15.000] "Deleted 00:01.000 — 00:15.000 on the Music track; the gap remains.", Ctrl+Z → [10.000]; IN-CLIP-SAME range 12.500–20.000, 0 `[data-range-start]` (the in-clip label was not re-read) | json `CAR_*` |
| LESSONS | PASS: L45 (l.31), L46 (l.32) | grep |
| DOC-198 | PASS: l.4 byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 266 PASS)`; headings = TEMPLATE subsequence in order; MS1–MS7, BS1–BS4, BT1–BT9 cited and all exist | grep |
| G266-AUTH | PASS: `/studio-lab` anonymous workspace, demo notice, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`, 0 audio/token requests; `/api/studio-token` no header 401, no token (fake Bearer 500, no token — same as r265) | `g266-auth.json`, `g266-*.png` |
| Gate rows | full vitest, build, Biome full, `npm run verify`, e2e smoke → **gate**, not claimed | — |

### Extra: real audio output (1440×900)
Four project WAV exports (24-bit, 48 kHz, stereo, 111.352 s each, `c-round-266/wav-*.wav`):
- after SPLIT-PAST-START: **byte-identical** to the baseline;
- after SPLIT-GAP-2: maxDiff 0 on 10–12.5 s, 20–30 s and both cut windows (11.15–11.35, 22.4–22.6); 12.6–19.9 s is digital silence (the gap);
- after the marker split: maxDiff 0 over the whole file.
So the D3 split changes no audio sample, and no click or offset shift appears at any cut.

## Findings
- **C-R266-01 (Low, B planning claim).** Task §7 K11's first command `grep -rn 'data-testid="arrangement-video-dropzone"' app/components --include=*.tsx` returns nothing, because the attribute is the JSX expression `data-testid={isVideo ? 'arrangement-video-dropzone' : undefined}` (ArrangementLane.tsx:897). The fact holds: an unquoted grep finds l.897, and the selector resolves to 1 element in the browser at both viewports. Under L29 this is a claim mismatch, so CLAIMS is reported as partial and not counted as passed. It is not a defect in A's work, and as a Low it does not hold the round. **Note on L29:** L29 says a claim mismatch is a planning FAIL. C keeps PASS because the fact is verified and only B's grep pattern is wrong; no earlier C round (245–265) failed a round for this class (c-round-261 N1 was a note under PASS). B or root may overrule.

## Signals for B (not bugs this round)
- **B-R266-1 (raised by A, confirmed in the browser).** `splitRangeDone` says "Clip split at both edges …" when only one edge was cut (SPLIT-PAST-START, SPLIT-BG-INTO-CLIP). The same text appears at HEAD (`c-round-265/nb-head.json`). The task pins this text. Open Low copy signal.
- `splitRangeClipsDone` says "Clips split" even when one of the selected parts is a whole clip that was not cut (MS6).
- **A's deviation (L10):** targets are sorted by `start`, so they follow timeline order; B's sketch used array order. No browser row depends on the difference. B should rule on it.

## Ableton conformance (checked separately from the CZABA requirement)
- Split inside one clip at the marker: **confirmed** by [AV] 6.12.
- SPLIT-PAST-START, SPLIT-BG-INTO-CLIP, SPLIT-GAP-2 and SPLIT-NO-EDGE: **unconfirmed**. These show default D3, which waits on Saba (SABA-Q-11C-SPLIT-SPAN). They are not "matches Live".
- All-tracks refusal: unconfirmed, and it is a question for Saba.

**Not in scope:** relative snap (stage 2), D2 multi-lane partial ranges, the Shift-click extension, Split on all tracks, and the details-panel clamp.
