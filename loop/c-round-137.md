# C round 137 — VISUAL-A V-0.3d (StudioWorkspace + Waveform Zoom in English)

**taskStatus: PASS** · browserVerified = realVerified = **true** · bugs: **0** · env: store 200 (env-status.json, 14:25:51Z)

Real Playwright Chromium, fresh context per row, at **1440×900** (final run r2) and **1280×720** (r1), `http://127.0.0.1:5173/studio-lab`. Snap was **off** at the start of every session. Expected texts were written by hand from task §1.1, not imported.

## Rows
| Row | Result | Evidence |
|---|---|---|
| T137-TARGETED | PASS: 16 files, 303/303, and every file count matches A's | out/vitest-16.json |
| SOURCE-SCOPE | PASS. At start and end: frozen list (939) OK, `a-round-137/end-sha256.txt` OK, 12 ` M` + 2 `??` only, protected diff vs 7d9fed0 empty, HEAD 7d9fed0. No source change during C's phase | shell checks |
| AN-REVIEW | PASS. Only the §1.1 lines and imports changed. The l.325 selector (now l.331) is unchanged. No handler, condition, key or class changed. The pins are hand-written English with the same matchers. ST25 only deletes the block and gets the exact new title. Doc 112 changes only l.4/115/119. A's disclosed deviations were checked: the floating-video l.134 two-line wrap and the all-lanes span wrap (`{studioEditStrings.allTracks} ·{' '}`) are formatting-only on granted lines, and their text is byte-equal to §1.1. The `??` fallback is note 2 under Notes for B | out/an-diff-src.txt |
| HEADING | PASS: `CZABA Studio Lab · Workspace` | shots/heading-* |
| LANE-HINT | PASS. While held: WS1. With Shift held: WS2, and the ghost is on stems at the clip's original x (±1 px). On release the clip is on stems at 00:02.000 with an Undo entry, the shortcut hint comes back, and one Ctrl+Z restores music@2 | shots/lanehint-* |
| VIDEO-STATUS | PASS (beeps-6s-h264-aac.mp4). (a) WS3 (b) WS6 (c) WS4 with the library opened temporarily, then WS7 and the library collapsed again (d) WS5. Paused state and currentTime unchanged in every case. Extra playing case: ct 2.26→3.11→3.94 with paused=false the whole time | shots/video-* |
| GROUP-RENAME | PASS. `Group name: “Drums”.` with Undo `Undo: Rename Group`. Empty name gives `The name is empty — “Drums” is kept`; name and undo unchanged. An empty marker rename gives the same shape: `The name is empty — “Intro” is kept` | shots/group-* |
| ENVELOPE | PASS. Title WS13 / aria-pressed false while off. A gives WS10, title WS12, pressed true. Double-click adds 1 point (polyline `0,0 200,0` → `0,0 100,0 200,0`). A gives WS11. Clicking the button gives the same texts | shots/env-* |
| WAVEFORM-ZOOM | PASS. aria WS14, title 100%, options ½×…8× unchanged. At 2×: status `Waveform Zoom 200% — view only, the sound does not change.`, title 200%, and the path changes. Real output peak over the same 2 s: 1440 −15.682 vs −15.751 dBFS (Δ −0.069 dB); 1280 −15.682 vs −15.695 (Δ −0.013 dB). Back at 1×, the path is byte-equal to the first 1× path. ½× gives 50% | shots/wz-2x-* |
| RANGE-READOUT | PASS. The real `textContent` equals both §1.1 lines exactly, and the all-lanes span is `all tracks · `. Delete on the all-tracks range: gap on music and stems, next clip still at 7.000. Delete on a one-track range: only music has a gap, stems@4 untouched. Undo restores both | shots/range-* |
| SELECTION | PASS: `2 clips selected` / `3 clips selected`. With one clip the count is absent, the line reads `Clip: Slow rise · start 00:02.000 · length 00:05.000 · source offset 00:00.000`, and title === textContent | shots/sel-* |
| GEO-COUNT | PASS. 36 steps per viewport. Raw Georgian/«» on the V-0.3d surface was **0 before any subtraction**. The status line had 0 net after the subtractions below | json georgianCounts |
| LAYOUT | PASS. Against round 136, S0/S1/S2: 0 boxes moved >1 px at both viewports; only the header's text key changed, and its box is the same. At 1280 with all tracks: range 739=739, status 1256=1256, document 1280=1280. Lane hint has no overflow | out/layout-compare.json |
| REG-136 | PASS. M at 3 s, then Enter: `Marker “Marker 1” added at 00:03.000.` Esc gives `Marker not added` | json |
| G137-3 (alone, last) | PASS (partial). Lab shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`, at 1440 and 1280. Token API returns 401. **Fake-Bearer 403: BLOCKED (backend unavailable in cloud)** | out/g137-3.json |
| PX-NET / REG-HYD | PASS. Over 9+9+layout sessions: 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror. Only the expected cart noise | json sessions |

Gate rows (not claimed by C): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## GEO-COUNT subtractions (status line only)
- Demo-ready load-time text: collection.ts:18 (V-0.5).
- Track names მუსიკა / სტემები inside English clip-added sentences (track data).
- Lane-move status and history label `გადატანა ხაზზე — {track}…`: ArrangementClip.tsx:701 (V-0.4).
- `Envelope: წერტილი დაემატა — … წმ · … dB.`: ArrangementClipEnvelope.tsx:171 (V-0.4, task §0).

The accepted mixed state outside the surface (R4): lane overlay `ყველა ხაზი`, library, dock, detail panel and track headers.

## Requirement vs Ableton
- CZABA requirement: met for every §5 row.
- Ableton correspondence:
  - Time selection readout: term confirmed (§6). The readout itself is a CZABA addition.
  - Env toggle with A: deliberate difference (Live uses Draw Mode B).
  - F2 group rename: deliberate difference (Live uses Ctrl+R).
  - Shift time-lock and Waveform Zoom: **unconfirmed** (no Live source).
  - Floating video: not applicable.
  - No new Live claim is made.

## Harness note (honesty)
The 1440 r1 development runs failed only because of harness assumptions:
- the envelope line selector was wrong;
- Ctrl+Shift+L was assumed to toggle back;
- Esc was used where Enter confirms a new marker;
- a plain click inside a multi-selection was assumed to select one clip, but it keeps the group by design for group drags.

These were fixed in the harness, not the app. The final runs are 1440 r2 and 1280 r1, with **78/78 checks each**.

## Notes for B
1. Georgian still remaining outside V-0.3d, to assign to V-0.4/V-0.5:
   - ArrangementClip.tsx:701, the lane-move status and Undo label. It appears as `Undo: გადატანა ხაზზე — სტემები` next to `Undo: Rename Group`.
   - ArrangementClipEnvelope.tsx:171.
   - studio-lab.tsx:8, the meta title.
   - ArrangementGroupHeader.tsx:241 aria-label and l.32 title.
2. Observation, not a bug: the WS23 call passes `selectedTitle ?? selectedClip.sourceId` to the title, while the visible span shows `selectedTitle`. If that were ever null, the title would no longer match the visible text. In the browser the two were equal at every step.
3. Unverified hypothesis, out of scope: a click on an empty lane and Esc did not clear a 2-clip selection. Live 12's behaviour for this was not checked against the manual.
4. R4 forward constraint for V-0.5: use "compact view" in the dock return label.
