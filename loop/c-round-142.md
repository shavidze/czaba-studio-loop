# C — Round 142 (VISUAL-A V-0.4e) — verification report: FAIL (browserVerified)

Verifier C · 2026-10-24 · target http://127.0.0.1:5173/studio-lab · real Playwright Chromium

## Judgment notes (written before browser work)
- A raised a STOP (video Clip Gain reason 2 lines at 1440) and B has not ruled (no b-round-142 file). C does not adjudicate; C measures. If 2 lines are confirmed, §5 LAYOUT says FAIL (not Low).
- The 1280 open-panel `clippedBelowPanel` item has no B baseline. C runs its own Georgian-swap control; if identical → inconclusive/pre-existing, separate finding for B.

## SOURCE-SCOPE — PASS (start)
- HEAD 6e9f9b1; `git status --short` = exactly 20 ` M` + 2 `??` granted paths.
- Frozen list (941) `sha256sum -c --quiet` OK; `a-round-142/end-sha256.txt` OK; protected diff vs 6e9f9b1 empty.
- C start snapshot of the whole tree: `c-round-142/out/c-start-tree-sha256.txt` (963 files) — re-checked at end.

## Checkpoint 1 (after detail runs)
- T142-TARGETED: PASS — `npx vitest run` on A's 82 files → 1294/1294, 0 failed (A: 1294/1294). `c-round-142/out/vitest-targeted.json`.
- AN-REVIEW: diff vs start copies — strings.ts append-only (2 hunks, no removed line); class/testid attribute multiset identical between - and + lines of the 4 sources; ST44 grep = 0 in all 4 sources; doc 117 only l.4 + TODO l.57. `c-round-142/out/an-review-src.diff`.
- DETAIL-TEXT / DETAIL-STATUS: 42/42 checks OK at 1440 (r3) and 1280 (r1).
- LAYOUT: **FAIL at 1440 video state** — `arrangement-detail-clip-gain-reason` 1→2 lines (box d=(−32.5,−8,+65,+16)), video placeholder d=(+16,−8,−32,0). In-page Georgian-swap control reproduces B's baseline with 0 px delta in all 5 states, and the same node is 1 line with Georgian → caused by the English text. Shot `c-round-142/shots/video-1440-r3.png`.

## Final verdict: **FAIL** (browserVerified = realVerified = true)
One Medium LAYOUT breach that this round caused (C-R142-01). All other rows pass in real Chromium at 1440×900 and 1280×720.

| Row | Result | Evidence |
|---|---|---|
| T142-TARGETED | PASS: 82 files, 1294/1294 (same as A) | out/vitest-targeted.json |
| SOURCE-SCOPE | PASS: 22 granted paths; frozen list OK at start and end; A end hashes OK; protected diff empty; whole-tree sha identical at C start and end (no source change during C) | out/c-start-tree-sha256.txt, out/c-end-tree-sha256.txt |
| AN-REVIEW | PASS. strings.ts is append-only. Class/testid attributes are identical across the − and + lines. ST44 grep = 0. Doc 117 changed only l.4 + the TODO. A's D1–D7 match the diff | out/an-review-src.diff |
| DETAIL-TEXT | PASS (42 checks per viewport). The only Georgian in the panel is the selected clip's source title (R9) | out/c142-1440-r3.json, out/c142-1280-r1.json |
| DETAIL-STATUS | PASS. Exact texts below. Codepoints: invalid −=U+2212 …=U+2026; multi —=U+2014 −=U+2212. Esc reverts to 0.0. The invalid range changes nothing | same |
| CLIP-GAIN-AUDIO | PASS, 3/3 valid: base −22.57/−22.58/−22.58 dBFS; −20 dB → drop 20.04/20.00/20.04 dB; reset → Δ −0.02/−0.03/−0.01 dB | out/audio142-1440-r1.json |
| LIBRARY-LABELS | PASS. Folders Music 2 / SFX 2 / Music 1 / Stems 4. Chips Music/SFX/Stem. `music`=`MUSIC`→3 music; `stem`→4 stems; `მუსიკა`→0; clear→9; Enter add → `“Middle East — საჯარო preview” added to the Music track at 00:02.000.` | out/lib142-*.json, shots/library-*.png |
| GEO-COUNT | PASS: net 0 at both viewports after the listed subtractions (see JSON) | out/lib142-*.json geoScan |
| LAYOUT | **FAIL** at 1440 video (C-R142-01). 1280 open is inconclusive: pre-existing per the Georgian-swap control (C-R142-03) | out/layout-1440-r3.json, out/layout-1280-r1.json |
| REG-141 | PASS: `Group “Group 1” created: Music, Stems.`; `Music — set as the active track` | shots/reg141-*.png |
| G142-3 | PASS: lab workspace + demo badge; /studio/middle-east shows "Sign in required", no workspace, 0 audio[src] (1440 and 1280); studio-token → 401. Fake-Bearer 403 is **BLOCKED** (backend unavailable in cloud) | out/g142-3.json |
| PX-NET / REG-HYD | PASS: every session had 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 errors/pageerror (cart noise only) | net blocks in each out json |

Observed status texts:
- `Time selection: 00:03.500 — 00:07.250 · Music.`
- the §1.1 rangeInvalid text
- `Clip Gain: enter a number in dB (−60…+24).`
- `Clip Gain unchanged: 0.0 dB.`
- the pending `Unsaved` label, with title `Unsaved — Enter saves, Esc reverts` and sr-only ` — Enter saves, Esc reverts`
- `Clip Gain: 2 clips — −3.0 dB.`
- `Clip Gain: 2 clips — 0.0 dB.`

Undo/Redo: `Undo: Clip Gain` / `Redo: Clip Gain`, the same text as in earlier rounds. Range apply creates no history entry.

LAYOUT 1440 other deltas, all allowed or noted:
- apply w +22 and toggle w +2 (both `w-fit`);
- header label d=(−45, 0, +43, 0), because the h2 `Clip details` is shorter (flex-1, not a listed node);
- the panel box and the strict nodes moved 0 px;
- the group block is within 87 px.

### Bugs for B
- **C-R142-01 (Medium):** at 1440 with the video clip selected, the English Clip Gain video reason wraps to 2 lines. The baseline is 1 line, and the placeholder moves x+16 / y−8. This is A's STOP item; under §8 it routes to a bounded fix-up.
- **C-R142-02 (Low):** searching `stems` or `Stems` returns 0 results, although the folder the user sees is labelled `Stems`. B's R8 / §3.2 claim does not hold. Not a regression. Also pre-existing: `sfx` matches the Music previews through their collection label.
- **C-R142-03 (Low, pre-existing):** at 1280 with the panel open (120 px), the bottom line of the detail content is clipped or scrolls. The Georgian-swap control gives the same result.

### Notes for B
- The l.518 aria-label belongs to the **collection** toggle, not to a folder: `სინთეზური დემო · ღამის პულსი — დაკეცვა` / `… — გაშლა`. Folders have no toggle.
- Ableton correspondence for DETAIL-TEXT and LIBRARY-LABELS is **unconfirmed**: the Clip View and Browser chapters are not captured (§6). The CZABA requirement is rated separately above.
- Invalid runs, both C harness issues: 1440 r1 (number-input fill) and 1440 r2 (range detector). See the JSON.

### Addendum (after advisor review)
- LAYOUT 1280 vs B's baseline: at load the collapsed panel box is (288,615,992,36) in both, a 0 px delta. B's 1280 `collapsed` record is actually the **open** toggle after one click (label `დეტალების დაკეცვა`, x1194 w74). C's open toggle is x1192 w76: w +2 (`w-fit`), right edge unchanged. No other 1280 open baseline exists.
- GEO-COUNT round-141 surfaces: after Ctrl+G on Music + Stems, the group row, track headers, master and meters were scanned at both viewports (109/111 text nodes and attributes). Georgian hits = 0. Evidence: `out/geogroup142.json`, no errors or forbidden requests.
