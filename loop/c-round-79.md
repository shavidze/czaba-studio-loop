# C round 79 — SRW-17 (FB-12) stage 1: track groups (D-29z44)

Verifier: C (Claude Opus 5.5) · 2026-10-22 · **Verdict: PASS** · `browserVerified=true` · `realVerified=true` · no bugs.

Environment: Linux cloud runner. Playwright Chromium (headless, `--autoplay-policy=no-user-gesture-required`), a new incognito context for each part with no credentials, `http://127.0.0.1:5173/studio-lab`. `env-status.json`: store 200 (round 79). The backend at `:5199` is unavailable, which is expected. Every interaction used real `page.mouse` and `page.keyboard` events. The fixture is demo media only; nothing was uploaded.

Tools and raw evidence are in `c-round-79/`. Scripts are in `tools/` (`h.cjs` helpers, `p1`–`p4`, `g79`, `tok`). Results are `p1..p4-<vp>.json`, `g79-<vp>.json` and `token-api.json`. Screenshots are in `shots/`, the exported WAVs are `export-*.wav`, and the vitest log is `vitest-targeted.txt`.

## Setup (actual values, both viewports)
- Fresh load with Snap off. Snap is off by default; the empty-selection refusal was checked first, before any name click.
- Dropped by real library drag:
  - **Middle East** on music at 0.35 s (101.352 s long);
  - the synthetic stem **ღამის პულსი · პულსი** (`demo-stem-pulse`) on stems at 2.000 s (16 s);
  - **Soft impact** on sfx at 4.000 s (2 s).
- Lane order is video, music, stems, sfx.
- Lane heights before any grouping:
  - 1440x900: 81/81/81/81 px;
  - 1280x720: auto-fit gives 61/80/80/80 px.
- Header `paddingLeft` is 8 px on every lane.

## Acceptance rows (CZABA requirement)
| ID | 1440x900 | 1280x720 | Evidence |
|---|---|---|---|
| TG-SELECT | PASS | PASS | `data-track-selected` was {music} → {music,stems} → {music,stems,sfx} → {music,stems}. `aria-pressed` (the active lane) followed every click: music → stems → sfx → sfx. Label suffix `, მონიშნული` |
| TG-GROUP | PASS | PASS | Rows: video, `ჯგუფი 1`@0, music, stems, sfx. `music.previousElementSibling` is the group row, and both share one parent. Padding is music/stems 20 px and sfx 8 px. Group row 28 px, name button 24 px. Status `ჯგუფი «ჯგუფი 1» შეიქმნა: მუსიკა, სტემები.` Undo `Undo: Group Tracks`. Selection becomes {group}. Ctrl+Z gives 4 rows; Ctrl+Y gives 5 |
| TG-NEST | PASS | PASS | Rows: video, `ჯგუფი 2`@0, music (20 px), `ჯგუფი 1`@1 (20 px), stems (32 px), sfx (32 px). Status `… «ჯგუფი 2» შეიქმნა: მუსიკა, ჯგუფი 1.` Exactly two history entries: two Ctrl+Z return to the pre-group undo title and 4 rows; Ctrl+Y ×2 restores both |
| TG-UNGROUP | PASS | PASS | Outer → rows video, music, `SFX ქუჩა`@0, stems, sfx; selection {music, inner group}. Inner → selection {stems, sfx}. Each step is `Undo: Ungroup Tracks`. End rows, padding and heights equal the setup exactly |
| TG-RENAME | PASS | PASS | Focus the group button, then F2: an input opens. Real Space/`g`/`m` keydowns in the input reached the draft (`SFX ქუჩა gm`); Snap, marker count and position were unchanged. Enter → `Undo: Rename Group`, status `ჯგუფის სახელი: «SFX ქუჩა».`, focus back on the group button. F2+Escape keeps the name with no history. F2 + clear + Enter → `სახელი ცარიელია — დარჩა «SFX ქუჩა»` with no history. F2 + Enter on the same name adds no history. Undo/Redo of the rename work |
| TG-REFUSE (1–5) | PASS | PASS | (1) video: `ვიდეო ხაზი ჯგუფში ვერ შევა.` (2) gap {music,sfx}: `…მეზობელი ხაზები…` (3) inner + top-level: `…სხვადასხვა ჯგუფშია.` (4) Ctrl+Shift+G with tracks only: `დასაშლელად მონიშნე ჯგუფი…` (5) empty selection on a fresh load: `დასაჯგუფებლად ჯერ მონიშნე ხაზები…`. In every case the undo title and the group-row count were unchanged |
| TG-DRAG-OVER-GROUP | PASS | PASS | Setup: `ჯგუფი 1` over {stems, sfx}, with the group row between music and stems. `elementFromPoint` at the target = group row. **(1)** A music clip header was dragged onto the group row with a 300 ms pause. The clip preview stayed on music and no cross-lane ghost appeared; the old fallback would have shown an sfx ghost. Release → the clip stays on music and is moved +1 s (ordinary `Undo: კლიპის გადატანა`, no lane-change status), and Undo restores 0.35. **Sanity check of the ghost selector:** a drag into stems shows the ghost on stems. Moving on onto the group row keeps the ghost on stems, which is A's documented "previous target kept". Returning to music and releasing leaves it unchanged. **(2)** The sfx clip went up onto the group row and back. There was no ghost on another lane, the clip stayed on sfx, and the move was a "no change" no-op. DOM: 0 `[data-group-id]` elements carry `data-track-id`, and they share the lanes' parent |
| TG-MARQUEE | PASS | PASS | The marquee started on empty sfx lane area (7.2 s) and ended on music (1 s) above the group row. The selection was {music, stems, sfx}. The selection indicator was validated first with a single click on the sfx clip |
| TG-FIT | PASS | PASS | 1440: V=412, M=236/264/292 for 0/1/2 groups. In every case `M ≤ V`, and the last lane bottom (599/627/655) ≤ the visible bottom (687); lanes stay at 81, with no overflow. 1280: V=302 and M ≤ V for every case. Lanes refit: 0 groups → 61/80/80/80; 1 group → 55/28/73/73/73; 2 groups also fit. The last bottom is 614/615/614 against a visible bottom of 615 (≤, overflow 0). Group rows are 28 px. After Undo the layout returns to the exact 0-group heights. The `M > V` branch did not occur at these viewports |
| TG-AUDIO | PASS | PASS | Video Mute was turned on by a real click, and every Solo was off. Play, then click names + Ctrl+G, then group click + Ctrl+Shift+G while playing. `createBufferSource` stayed at 3 → 3 across the edits (a 2.4 s window). The position rose monotonically (1.18 → 3.58 s; advance 2.40 s for 2.41 s wall time). Master meter during the edits: −14.1…−7.9 dB, with 0 silent samples. **Export:** no groups vs two nested groups at both viewports. Both are RIFF, PCM 24-bit stereo 48 kHz, 4,881,696 frames = 101.702 s (= 0.35 + 101.352). NaN 0/0, full-scale count 486/486, RMS 0.174645488 (Δ < 1e-9), max\|Δ\| = 1 LSB, not byte-identical (round-26 rule) |
| REG-ACTIVE-TRACK | PASS | PASS | The library Enter adds to the active lane. Plain music → added on music. sfx then Ctrl+stems → active stems, added on stems. stems then Shift+sfx (inside the group) → active sfx, added on SFX. A group-name click does not change the active lane (G4) |
| REG-SNAP-G | PASS | PASS | Plain `g` with two lanes selected: Snap off → on → off; 0 groups created |
| REG-LANE-CONTROLS | PASS | PASS | On grouped `stems` (indent 20 px): Mute on/off, Solo on/off, Volume 1→0.99→1 (arrow keys), Pan 0→1→reset 0, height handle drag 81→111, fold → 36 px → unfold. The group row stays |
| TG7 (Ctrl+G in text fields) | PASS | PASS | Ctrl+G in the BPM field and in the library search: 0 groups, undo unchanged |
| Modifier block (Ctrl+C/X/V/D/L/A/Y/Z) | PASS | PASS | With one sfx clip selected: Copy status, Ctrl+V +1 (`ჩასმა (1)`), Ctrl+D +1 (`დუბლირება (1)`), Ctrl+X −1 (`Cut`), Ctrl+Z restores, Ctrl+Y re-cuts, Ctrl+A selects all 3, Ctrl+L on range 2–4 creates Loop 2–4 |
| REG-HYD | PASS | PASS | Every part at both viewports had no hydration or `useLayoutEffect` warning and no non-noise error or warning |
| G79-3 | PASS | PASS | The header link `Studio Lab Demo` opens `/studio-lab` with the demo badge. Anonymous `/studio/middle-east` shows "Sign in required" with 0 workspace. Anonymous `/api/studio-token?product=…&file=…` → **401** (also in-page). Page network: no forbidden request (token/recording/download/R2) and 0 Authorization headers. `localStorage` holds only `czaba_spotlight_last_shown` and `czaba_session_id`. The 2 token requests are C's own probes |
| T79-TARGETED | PASS | — | A's list: **72 files / 1357 tests passed** (84 s), the same counts A reported |
| SOURCE-UNCHANGED | PASS | — | At C start and end: A's 10 end hashes 10/10, frozen 459/459, protected 4/4 (case-insensitive), HEAD `c062147`, `git status` 5 M + 5 ??. The doc 068 diff is exactly the granted status line. The new files have CR=0 |

**BLOCKED:** the fake-Bearer request with params returns **500** "Unable to prepare Studio access", because the backend is unavailable in the cloud. The expected 403 cannot be checked here.
**Gate rows** (not claimed): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
**Not a C row:** Tech Lead R79-T (the Chrome find bar on Ctrl+G; Windows and Mac).

## Ableton match (separate from the requirement)
| Behaviour | Status |
|---|---|
| Group Tracks on the selection; the same command nests (§18.3) | **Confirmed (text)**, and CZABA matches: TG-GROUP, TG-NEST |
| Ctrl+G / Ctrl+Shift+G (§42) | **Confirmed (text)**, and the keys match. The real Chrome accelerator layer is untested (R79-T) |
| Ungroup reverts to individual tracks (§18.3) | **Confirmed (text)**, and CZABA matches. Group delete does not apply (CZABA has no track delete) |
| Shift = adjacent, Ctrl = non-adjacent multi-select (§18.2) | **Confirmed (text)**, and CZABA matches. The Shift range is limited to one parent (CZABA rule) |
| Non-adjacent grouping | **Unconfirmed** in Live. In CZABA it is a **deliberate difference** (refused) |
| Empty selection + Ctrl+G | **Unconfirmed**. CZABA decision: refused with a hint |
| Rename via F2 instead of Ctrl+R | **Deliberate difference** |
| Video track in a group | **Deliberate difference** (refused). Live's video case is n/a |
| Group mixer, fold, overview, half-solo | **n/a this round** (stages 2–3). No such controls are rendered, as verified |

## Deviations from the written C steps (stated plainly)
- **TG-MARQUEE** was dragged from sfx up to music, not from music to sfx. After 0.35 s the music lane has no empty area, because Middle East covers 0.35–101.7 s. The rectangle still spans music, the group row, stems and sfx.
- **TG-FIT minimums.** `M` uses row heights that include `TRACK_ROW_BORDER_PX`: video 53 and audio 61. B listed minimums of 52 and 60. With either value, the branch is `M ≤ V` at both viewports.
- **TG-REFUSE (3)** used the nested state: stems (parent `ჯგუფი 1`) plus music (parent `ჯგუფი 2`). That differs from "inside lane plus a top-level lane", but it takes the same `mixed-parents` refusal path.
- **Doc 069** states the group-row height of 28 px and the 24 px button (G4 line), and it contains the Ableton section.

## Observations for B (not bugs against the contract)
- **O1:** track selection is never cleared by Escape, a clip or background click, or Ctrl+A (A's review #9). Because selection is not cleared, Ctrl+G can group lanes chosen long before. This is unspecified; consider adding it in stage 2.
- **O2 (corrected by the no-blur probe `c-round-79/focus-after-group.json`, both viewports):**
  - After Ctrl+G, focus stays on the last-clicked track name button (`სტემები — აქტიური ხაზის არჩევა`). This confirms A's review #8.
  - F2 pressed right after Ctrl+G opens no editor (0 inputs) until the group button is focused.
  - After you click the group and press Ctrl+Shift+G, the focused group button unmounts and focus falls to `BODY` (an a11y focus-loss Low candidate).
  - The P1–P4 harness blurred before every Ctrl+G, so those runs say nothing about focus after the command.
- **O3:** with the pointer on a group row, a clip drag keeps the last valid lane target (documented G10 choice). After a drag that passed stems, the ghost therefore stays on stems while the pointer is on the group row. This is consistent with the contract, and B can record it as accepted.
- **O4:** the TG-FIT `M > V` branch did not occur at 1280x720 or 1440x900. It is covered only by A's jsdom TG10.

## Next C checks
- Stage 2: collapse/expand (button and `U`), hidden children removed from the a11y tree, and the overview band.
- Re-check O1/O2 if B adds them.
