# C round 80: SRW-17 stage 2 (collapse/expand a track group), independent verification

**Verdict: PASS. browserVerified=true, realVerified=true.** 2 Low bugs (both are A's documented deviations and need a B decision). 0 Critical, 0 High, 0 Medium.
Playwright Chromium (Linux), anonymous fresh contexts, `http://127.0.0.1:5173/studio-lab`, **1440x900 and 1280x720**. All input was real `page.mouse` and keyboard.

## Environment and source
- `env-status.json`: store 200 (round 80). Backend `:5199` unavailable (cloud).
- **At C start and end:**
  - HEAD `74eca15`;
  - status 4 M + 3 ?? (as §3 allows);
  - frozen list 465/465 OK; protected 4/4 (`cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`);
  - A's 7 file hashes are identical to A's report (`c-round-80/hashes-start.txt`, re-checked at the end).
- C made no edits in `store/`.

## Setup (both viewports, recorded values)
- Snap off. Clips: music `0.35` (dur 101.352), stems `2` (16 s), sfx `4` (2 s). pxPerSecond 40.
- Lane heights:
  - 1440: 81/81/81/81;
  - 1280: video 61, music/stems/sfx 80;
  - after Ctrl+G at 1280: 55/73/28/73/73.

## CZABA requirement: results
| ID | 1440 | 1280 | Evidence (key values) |
|---|---|---|---|
| FOCUS-GROUP | PASS | PASS | After Ctrl+G with no blur, focus is on `arrangement-group-name` "ჯგუფი 1 — ჯგუფი, მონიშნული"; F2 opens the input. |
| FOLD-BUTTON | PASS | PASS | Collapsed: no stems/sfx `[data-track-id]`, `aria-expanded=false`, `::before` "▸", 2 overview blocks, undo title unchanged ("Undo: Group Tracks"), button 24×24, row 28. Expanded: lanes back with the same heights (±0), "▾". Shots: `fold-collapsed-*`, `fold-expanded-*`. Space on the fold button toggles and does not start playback (src 0, pos 0). |
| FOLD-U | PASS | PASS | (1) `U` collapses, then expands. (2) Music only → "დასაკეცად მონიშნე ჯგუფი — დააწკაპუნე ჯგუფის სახელზე.", no change. (3) `u` in BPM and search → no collapse. (4) Ctrl+U, Shift+U, Alt+U → no collapse. (5) Fader ArrowDown (1 → 0.99, "Undo: Volume") then U → refused, lanes rendered. A truly pending preview (ArrowDown held + U) → refused; keyup commits one Volume entry (undo 0.98 → 0.99). See C80-1 for the case where nothing is pending. |
| FOLD-NESTED | PASS | PASS | Collapsing G1 and then nesting it keeps it collapsed (C10). G2 collapsed → rows video, G2 (lanes: video). G2 overview 3 blocks [0.35, 2, 4], label "…დაკეცილი, 3 კლიპი". After G2 expands, G1 is still collapsed (no stems/sfx); music is visible. |
| FOLD-A11Y | PASS | PASS | Label "ჯგუფი 1 — ჯგუფი, დაკეცილი, 2 კლიპი, მონიშნული". 40 Tabs from G1's name reach no stems/sfx row. 0 focusable controls inside hidden rows. The timeline ariaSnapshot (`aria-collapsed-*.txt`) contains no სტემები/SFX lane controls. |
| FOLD-OVERVIEW | PASS | PASS | Default zoom 40 px/s: blocks start 2 / 4, left 80 / 160, width 640 / 80 (exact). After `+`×2 (62.5 px/s): left 125 / 250, width 1000 / 125 (exact). Blocks are inset (top 4, h 19). Ctrl+A → both blocks have `data-overview-selected` and use a distinct style. |
| FOLD-FIT | PASS | PASS | Recorded at 1440: V=412. At 1280: V=302. At 1280 the refit is G1 expanded 55/73/28/73/73 → collapsed 81/81/28 → expanded 55/73/… exactly. Nested 53/28/64/28/64/64 → G1 collapsed 81/28/81/28 → both collapsed 81/28. Every state: last row bottom ≤ visible bottom, group rows 28, return to the pre-collapse heights ±0, undo back to the 0-group baseline (identical). The M>V branch was not reachable. See the correction note below. |
| FOLD-SELECTION | PASS | PASS | (1) Stems clip selected → collapse → no selected overview block; Delete → "წასაშლელად აირჩიე კლიპი…", undo unchanged; after expand the clip is still there, unselected. (2) Lane range 4.3–5.6 on sfx → cleared by the collapse. (3) After Ctrl+Shift+L ("ყველა ხაზი") → the range is kept through the collapse. |
| FOLD-ACTIVE | PASS | PASS | sfx active → collapse → `data-contains-active=true`, `border-l-brand` (rgb 18,217,200). Library Enter → overview goes from 2 to 3 blocks; the status names SFX; after expand the clip is on sfx. |
| FOLD-DRAG-OVER | PASS | PASS | Rows video, music, G1. The music clip header was dragged down onto G1's row plus 1 s sideways, with a 300 ms pause. elementFromPoint = group; no cross-lane ghost; release → music at 1.35. The ghost semantics were checked separately (`probe-ghost.json`): a ghost renders only for a cross-lane target. |
| FOLD-MARQUEE | PASS | PASS | (1) Music lane (t 0.12) → G1 row: selection [music], no overview block selected. (2) G = {music, stems} collapsed (rows video, G, sfx), marquee from the video lane to sfx: selection [sfx@4]; nothing from music or stems selected (still true after expand). |
| FOLD-AUDIO | PASS | PASS | While playing (video muted by a click): button and `U` collapse/expand, `createBufferSource` 3 → 3. Position advanced 3.068 s in 3.068 s wall time (1280: 3.071 s / 3.078 s), monotonic. Meter never silent (min −14 dB). Music muted with G1 collapsed: 0.3–1.8 s −120 dB; 2.4–3.9 s (stems) −18.6…−10.6 dB; 4.2–5 s (stems+sfx) ≥ −15.6 dB, so hidden lanes keep sounding. WAV collapsed vs expanded: 24-bit/48 kHz/2 ch, 4 881 696 frames, 101.702 s, NaN 0. At 1440 byte-identical; at 1280 max delta 1 LSB, equal RMS and full-scale count, so equal by the round-26 rule. |
| FOLD-UNDO | PASS | PASS | Ctrl+G, collapse, Ctrl+Z → no group row, 4 lanes. A stems clip selected, then Ctrl+Y → the group is back collapsed and the overview block at 2 has `selected=true` (no prune on Redo). Ctrl+Shift+G on the collapsed group → 4 lanes, focus on the "სტემები" name button (not BODY). |
| FOCUS-HIDDEN | PASS | PASS | Ctrl+click G1, then Ctrl+click stems (focus on stems), U → G1 collapsed, focus on G1's name button. |
| HINT | PASS | PASS | "… Ctrl+wheel · Ctrl+G / Ctrl+Shift+G · F2 · U". |
| REG-TG | PASS | PASS | Ctrl+G (focus on the group), F2 rename "ბგერები" ("Undo: Rename Group"), Ctrl+Shift+G ("Undo: Ungroup Tracks"; focus on stems, not BODY), video+music refused "ვიდეო ხაზი ჯგუფში ვერ შევა.", undo unchanged. |
| REG-LANE-FOLD | PASS | PASS | Stems folded 36 px → G1 collapse/expand → still folded 36 → unfold 81 (1280: 73). |
| REG-ZOOM-KEYS | PASS | PASS | Group selected: `+` 40→50, `−` 50→40; collapse state unchanged. |
| REG-HYD | PASS | PASS | No hydration or useLayoutEffect warning and no non-noise error in any script (q1–q4, 8 runs). |
| G80-3 | PASS | PASS | Header link → `/studio-lab`, workspace and demo badge. `/studio/middle-east` anonymous → "Sign in required", no workspace. `/api/studio-token?product&file` anonymous → **401** (context request and in-page fetch). Page network: 0 token/recording/download/R2 requests, 0 Authorization headers. **Fake Bearer → 500 "Unable to prepare Studio access" → BLOCKED (backend unavailable in cloud).** |
| T80-TARGETED | PASS | — | A's list `a-round-80/targeted-list.txt`: **58 files / 1173 tests passed** (`c-round-80/vitest-targeted.txt`). |
| SOURCE-UNCHANGED | PASS | — | See Environment above. |

**Gate rows** (not claimed): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

**Correction note (honesty):**
- *FOLD-FIT.* My first FOLD-FIT judge added a "fill gap ≤ 4 px" condition, which is not in the acceptance. It failed because the fit caps lanes at 81 px; the no-group baseline at 1440 is already 4×81 with an 88 px gap. The re-judge against the written acceptance is stored next to the original as `FOLD-FIT-REJUDGED` in `q3-*.json`.
- *FOLD-DRAG-OVER.* My intermediate check required a ghost to exist. The probe showed that same-lane moves never render one, so I reverted that condition and re-ran q2 at both viewports.
- *FOLD-U (5).* The first run used ArrowUp at volume 1.0, the maximum, which is a no-op. I switched to ArrowDown and re-ran.

## Bugs for B
- **C80-1 (Low).** `U` is refused with the drag message "რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი." when a fader in a hidden-to-be row is merely focused and nothing is pending (`q1-*.json` FOLD-U `s5c`).
  - C3 allows a refusal only during a gesture or a pending preview, so the message is inaccurate.
  - This is A's deviation 3 / reviewer #2. B chooses: keep it with its own message, blur and collapse, or add a context preview flag (the context is frozen).
- **C80-2 (Low).** The fold button `aria-label` is `ჯგუფის დაკეცვა / გახსნა — ჯგუფი 1`, while C2 requires `ჯგუფი 1 — ჯგუფის დაკეცვა / გახსნა`.
  - This is A's deviation 1, forced by the frozen `groupName` regex.
  - It is accessible and unambiguous. B accepts the order or unfreezes the helper.

## Observations (not bugs of this round)
- **O1** The fit caps lanes at 81 px. Refit numbers at 1280 are in the table.
- **O2** The lane-move ghost exists only for cross-lane targets.
- **O3 (pre-existing, out of scope, cause unconfirmed).** In the expanded state, a music clip dragged 1 s right and down onto stems shows a stems ghost. On release it stays on music at **1.025 s** instead of 1.35 s (`probe-ghost.json` "expanded-to-stems"). Suggest B schedules a small repro with the stage-1 drag owner.
- **O4** Both exports have peak 1.0 with 486 full-scale samples. This is the pre-existing mix level and is identical in collapsed and expanded exports.
- **O5** The doc 069 status text is exactly the granted line. It is on line 4, not "l.3"; nothing else in the file changed.
- **Not run:**
  - Tech Lead R80-T (real-Chrome look and feel; not a C row);
  - the optional §6 mutation re-run (A's `mutations.md` only).

## Ableton match (separate from the CZABA requirement)
| Behaviour | Status |
|---|---|
| Fold button in the group title bar (FOLD-BUTTON) | Confirmed (Live 12 §18.3 text) |
| Overview of the contained clips on the folded group (FOLD-OVERVIEW) | Confirmed for the folded state. An overview on an expanded header is unconfirmed (CZABA leaves it empty). |
| `U` collapses/expands grouped tracks (FOLD-U) | Confirmed (§42 text). The mixed-state rule is a CZABA choice (unconfirmed). `U` on plain tracks is not bound (deliberate). |
| Folding has no undo entry (FOLD-UNDO) | Unconfirmed in Ableton; CZABA choice |
| Hidden tracks keep sounding (FOLD-AUDIO) | Inferred, not stated by the source; CZABA behaviour verified |
| Hidden lanes out of the a11y tree | Not applicable (CZABA decision) |
| `+`/`−` zoom instead of show/hide | Deliberate difference |

A test PASS does not prove the Ableton analogy.

## Evidence
`c-round-80/`:
- `q1-*.json` (fold, U, a11y, overview, focus, hint, zoom, lane fold);
- `q2-*.json` (selection, active, drag, marquee, undo, nested, REG-TG);
- `q3-*.json` (fit);
- `q4-*.json` (audio and export), `export-*.wav`;
- `g80-*.json`, `token-api.json`;
- `probe-ghost.json`, `aria-collapsed-*.txt`, `vitest-targeted.txt`;
- `shots/` (36 PNG), `tools/` (scripts).
