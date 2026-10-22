# C — Round 81 verification: SRW-17 stage 3 (group Mute / Solo / Volume, nesting, half-solo) + X1 (C80-1)

Verifier: C · 2026-10-22 · **Verdict: PASS** · `browserVerified=true` · `realVerified=true`
Bugs: 2 Low (C81-1 UX signal, C81-2 doc), 0 Critical/High/Medium.

## Environment and source integrity
- `env-status.json`: store 200 (round 81, attempt 1). Backend `:5199` unavailable (expected).
- Start and end state:
  - HEAD `68383fa`; 11 `M` + 3 `??` (exactly §3);
  - frozen list 461/461 OK; A's `end-hashes.txt` 14/14 OK;
  - protected 4/4 (`cd68eb6e 9f738237 13914809 fa2cf0bc`).
- C changed no source. Exported WAVs were measured, then deleted (stats and sha prefixes are in the JSON).
- Browser: Playwright Chromium, fresh context per script (no credentials, no state file needed), real `page.mouse`/keyboard, `/studio-lab`.
- Every acceptance row ran at **1440x900 and 1280x720**.
- Setup per session (both viewports):
  - Snap off;
  - a **synthetic video** `media/beeps-6s-h264-aac.mp4` loaded (video lane 0–6 s, beeping audio);
  - clips: Middle East on music @0.35 s (101.352 s), `ღამის პულსი · პულსი` on stems @2 s (16 s), Soft impact on sfx @4 s (2 s);
  - video Mute by a real click (except GX-SOLO and GX-EXPORT-DIALOG, where it was off).
- Exports: WAV 24-bit / 48 kHz / stereo, 4 881 696 frames (101.702 s), RIFF, NaN 0. Window W_s = 2.4–3.9 s, W_x = 4.2–5.0 s.
- Tools: `c-round-81/tools/` (`lib81.cjs`, `r1`–`r4`, `p5`, `g81`, `tok`). Results: `c-round-81/{r1,r2,r3,r4,p5,g81}-<vp>.json`.

## Acceptance rows (each row: both viewports)

| ID | Result | Evidence (identical at both viewports unless stated) |
|---|---|---|
| GX-CONTROLS | PASS | **Row and order.** 28 px row; DOM order fold→name→M→S→Volume; M/S 24×24; Volume 48 px; `min-w` 48 px; range 0–1, step 0.01.<br>**Labels.** `Mute — ჯგუფი 1 (ჯგუფი)`; `Solo — ჯგუფი 1 (ჯგუფი, Ctrl/Cmd+click ამატებს)`; `Volume — ჯგუფი 1 (ჯგუფი)`; `aria-valuetext` `100%`; title `Volume 100%`.<br>**Glyphs.** `::before` `"M"`/`"S"`; buttons have no text.<br>**Text nodes.** Only `▣` and the name; `rowOrder` is the stage-1 form.<br>**States.** Expanded and collapsed. Depth 1 (G1 in G2): name 67 px. No group controls exist when there is no group.<br>Screenshots: `shots/controls-{expanded,collapsed,nested}-<vp>.png` |
| GX-VOL (R17-G2) | PASS | **Export.** Keyboard 50×ArrowDown → `50%`. W_s ratio 50%/100% = **0.50000001** (−6.0206 dB), W_x 0.5000000. W_s full-scale count at 100% = 0, so the oracle is valid. 0% → W_s and W_x maxAbs **0 LSB**.<br>**Live.** Drag → 0 at 2.61 s: master L0 −10.6, floor in 2.449–2.463 s (limit 2.57 s); no rise afterwards (sfx 4–6 s stays silent). Double-click → 100%: master returns to −10.6 dB. `createBufferSource` count constant (4) |
| GX-MUTE | PASS | **Live (2.6 s).** M click → `aria-pressed=true`, `Undo: Mute — ჯგუფი 1`. Master floor in 2.46–2.50 s (limit 2.57 s), no rise. Unmute → −10.6 dB. Ctrl+Z → muted again; floor in 2.29–2.34 s (limit 2.40–2.41 s). Sources constant.<br>**Export muted.** Whole file peak 0 |
| GX-NESTED (R17-G3) | PASS | **G2 muted.** Live master/music/stems/sfx −inf; export peak 0.<br>**Inner controls while silent.** Stems 0.5 and G1 50% were changed by keyboard; each press is one `Volume` entry. Ctrl+Z×50 → G1 100%, one more Ctrl+Z → stems 0.51, then Redo×51 → both 0.5.<br>**After unmute** (music muted): W_s ratio vs the all-100% export = **0.24999999** (−12.0412 dB) |
| GX-SOLO | PASS | Video Mute **off**. Baseline export: video window 0–0.3 s RMS 0.205 (the video sound is really present).<br>(1) G1 S → `Solo — ჯგუფი 1`; G1 `on`, G2 `mixed`. Export: 0.1–1.9 s and 0–0.3 s are 0 LSB. Live: video/music/master meters −inf before 2 s; stems −10.6 and sfx −2.6/−2.9 dB.<br>(2) Music S plain → G1 `off`, music soloed; export equals the "G1 muted + video muted" reference (max\|Δ\| **0**).<br>(3) Ctrl+click G1 S → additive; export equals the "video muted only" reference (max\|Δ\| 0).<br>(4) G1 soloed + muted → export peak 0 (mute beats solo) |
| GX-HALF | PASS | (1) Stems lane S → G1 and G2 `aria-pressed="mixed"`, `data-solo="mixed"`. Computed `background-image: linear-gradient(to right, rgb(18,217,200) 50%, transparent 50%)`, border brand, glyph `rgb(238,239,241)`.<br>(2) G1 S → G1 `on`, G2 `mixed`, stems solo cleared.<br>(3) G1 S again → all `off`.<br>**Audio (`h6-<vp>.json`).** Stems lane-soloed inside G1 ⊂ G2, video muted. The export equals a solo-free "sfx M + music M" reference (max\|Δ\| **0**); W_s RMS 0.0568; 0.1–1.9 s is 0 LSB. Live 4.2–5.0 s: sfx and music meters −inf, stems −10.6 dB. A soloed track silences its same-group sibling when the ancestor is only `mixed`.<br>Screenshots: `shots/half-solo-<vp>.png`. The S glyph is legible on the half fill; the final judgement is the Tech Lead's (R81-T) |
| GX-METER | PASS | **G1 → 0 at 2.6 s.** Stems meter floor in 2.449/2.461 s (limit 2.57 s); returns to −10.6 at 100%.<br>**G1 → 0 at 4.36 s.** sfx L0 −5.0/−5.2: floor in 2.743/2.746 s (limit 2.84/2.85 s). Without the change, the clip end at 6 s gives ≥ 4.5 s, so the row discriminates. Stems floor 2.22 s (limit 2.31–2.32 s). Master floor 2.82 s (limit 2.93 s). This confirms CZABA choice M3 (post-group child meters) |
| GX-UNDO | PASS | Each action is exactly one entry; Ctrl+Z restores the exact value and the earlier label (`Undo: Mute — ვიდეო`); Ctrl+Y restores the exact value:<br>• drag 0.99→0.68;<br>• ArrowDown+keyup 0.68→0.67;<br>• **double-click 0.67→1**;<br>• M (`Mute — ჯგუფი 1`);<br>• S (`Solo — ჯგუფი 1`) |
| GX-UNGROUP | PASS | **Before.** G1 muted, music and video muted: master −inf.<br>**Ctrl+Shift+G during play.** Master ≥ −22.7 dB; export W_s/W_x ratio vs 100% = **1.000**.<br>**Ctrl+Z.** G1 back (`@0`), muted; live floor in 2.62 s (limit 2.72 s); export 0 LSB |
| GX-COLLAPSED | PASS | On a collapsed G1:<br>• M → `Mute — ჯგუფი 1`;<br>• S → `on`, G2 `mixed`;<br>• Volume key → `Volume`;<br>• the overview stays (2 blocks);<br>• `U` expands and collapses.<br>Collapsed muted export = expanded muted export (same sha `e6efba8a…`, peak 0). **Audio was measured for Mute only.** Solo and Volume on the collapsed header were checked by attributes and history; they use the same effective-gain path |
| GX-NO-RESTART | PASS | During playback: Ctrl+G (G2 around music), G2 M×2, G1 S×2, G1 Volume drag, Ctrl+Shift+G. `createBufferSource` 20→20. Position advanced 2.670/2.679 s over 2.661/2.682 s wall time; monotonic |
| GX-EXPORT-DIALOG | PASS | Baseline `ვიდეოს ორიგინალი ხმა (beeps-6s-h264-aac.mp4): შედის`. With G1 soloed: `… : გამორთულია (M/Solo)`, the same text as with music S plain. Cleared → `შედის`. This is the rendered DOM line (it closes A's open L6b) |
| X1-FOCUS | PASS | (1) Tab-focused idle stems fader + `U` → collapsed. The undo label stays `Group Tracks`; no drag message; focus on G1's name button.<br>(2) `keyboard.down(ArrowDown)`, `u`, `keyboard.up` → collapsed; exactly one `Volume` entry (stems 0.99). Ctrl+Z → 1.0 / `Group Tracks`. The trailing keyup added nothing.<br>(3) G1 group fader with ArrowDown held + G2 fold click → G2 collapsed; one `Volume` entry (G1 0.99). Focus is on **G2's fold button**, because the mouse click owns focus (recorded, as B anticipated).<br>**Pointer drag + `u`** → refused (`რედაქტირება drag-ის დროს არ მუშაობს…`); not collapsed; the drag commits on release |
| REG-FOLD | PASS | **FOLD-BUTTON:** stems/sfx leave the DOM; `▸`; undo unchanged; lane heights restored (1440: 81/81/81/81; 1280: 55/73/73/73).<br>**FOLD-U:** (1) collapses, then expands; (2) the C3 status; (3) search typing and Shift+U → no collapse.<br>**FOLD-OVERVIEW:** blocks 2 and 4 s; left/width 80/640 px at 40 px/s; Ctrl+A selects both.<br>**FOLD-SELECTION (1):** Delete while collapsed does nothing; the clip is kept.<br>**FOCUS-HIDDEN:** focus moves to the G1 name |
| REG-TG | PASS | F2 rename → `დრამები` (`Undo: Rename Group`) keeps mute and 99%. Video + Ctrl+G → `ვიდეო ხაზი ჯგუფში ვერ შევა.`. Ctrl+Shift+G → `Undo: Ungroup Tracks` |
| REG-TRACK-MIX | PASS | No groups.<br>**Mute/Solo.** Music M → `Mute — მუსიკა`, export pre-2 s 0 LSB. Stems S → `Solo — სტემები…`; Ctrl+click sfx is additive; the solo export equals the reference (ratio 1.000).<br>**Volume.** Stems keyboard 50% → W_s ratio 0.50000001. Drag → one `Volume` entry; undo is exact.<br>**Pan.** Stems pan `50L` → W_s right-channel RMS 0 (left 0.0568) |
| REG-HYD | PASS | No hydration or `useLayoutEffect` warning, and no non-noise error or warning, in every session (r1–r4 ×2, h6 ×2, p5, g81 ×2, tok) |
| G81-3 | PASS (one part BLOCKED) | **Pages.** The header link opens `/studio-lab` with the `დემო კოლექცია` badge. `/studio/middle-east` anonymous → "Sign in required", no workspace.<br>**API.** `/api/studio-token?product=middle-east&file=stem1.wav` anonymous → **401** (context request and in-page fetch).<br>**Network.** No token/recording/download/R2 request from the page and 0 Authorization headers.<br>**Fake Bearer** → 500 "Unable to prepare Studio access" → **BLOCKED: backend unavailable in cloud** |
| T81-TARGETED | PASS | A's list `a-round-81/targeted-list.txt`: **54 files, 983/983** passed (86.9 s), `c-round-81/vitest-targeted.txt` |
| SOURCE-UNCHANGED | PASS | Start = end: HEAD, 11M + 3??, frozen 461/461, A hashes 14/14, protected 4/4 |

**Gate rows** (`gate`, not claimed): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

### Extra probes (1440x900; not acceptance rows, all OK) — `p5-1440x900.json`
- **Soloed track + soloed group, plain click on the track:** the track stays soloed and the group solo is cleared (the GM6 shape).
- **Ctrl+G nesting a muted G1** keeps its mute (depth 1); export W_s/W_x 0 LSB (M6).
- **Ctrl+Shift+G on inner G1:** stems/sfx move up into G2 and are audible; Undo → G1 back, muted.
- **Tab order:** group name → M → S → Volume → next row.
- **Space parity (A's review L7, r1 SPACE-PARITY):** Space on a focused lane M, lane S, group M or group S toggles transport only. `aria-pressed` and the undo label are unchanged on keydown and keyup, the same for all four.
- **Keys:** `u` on a focused group M and on a lane M collapses the selected group identically; `m` opens the marker name input from both.

## Not browser-verified (stated explicitly)
- **M5 pointercancel reverts** (group Volume): Playwright cannot raise a real `pointercancel`. It is covered only by A's jsdom UM3, not browser-verified. It is not part of B's §5 C table, so `browserVerified` stays true.

## C script corrections (honesty note)
Several first-run FAILs were C oracle errors and were fixed in the scripts, not by re-trying until green:
- `U` acts on the selected group, not the focused one;
- ArrowUp at 100% is a no-op;
- the meter check during a live decay needed "no rise after the event" instead of "≤ −60 at 4.2 s" (the −42.9 dB values are the 20 dB/s decay tail);
- 50 key presses are 50 history entries (per-press contract);
- the lane fader has no `aria-valuetext`;
- two stems-S clicks clear the solo;
- pan steps are ±50.

No product tolerance was weakened.

## Bugs for B
- **C81-1 (Low, UX signal).** At depth ≥ 1 the group name shows only `ჯგუ…` (name button 67 px at depth 1; A measured 55 px at depth 2), so nested groups can't be told apart by name at either viewport. Contract M4 (≥ 40 px) holds. This is A's known gap 4, now seen in the browser. Evidence: `shots/half-solo-full-1280x720.png`, `controls-nested-*.png`.
- **C81-2 (Low, docs).** Doc 070 l.72 (problems section) still says collapse is refused when a focused fader is in a row that would be hidden. In the browser it now blurs and collapses (X1-1/X1-2). This is A's review L9 and was outside A's grant.

## Ableton match (separate from the CZABA requirement)

| Behaviour | Status |
|---|---|
| Group as a summing container with mixer controls (§18.3 l.90/92) | **Confirmed (text).** Effective gain is acoustically equal: export ratios 0.5000 and 0.2500 |
| Exclusive Solo, Ctrl/Cmd additive (§18.1 l.42–43) | **Confirmed (text)**, observed for groups |
| Half-coloured Solo (§18.3 l.112) | **Confirmed (text)**, observed `mixed` |
| Solo keeps the feeding chain (§18.6 l.169) | Confirmed (text, general) |
| Child meter shows the post-group level | **Unconfirmed in Live**; CZABA choice M3, verified as implemented |
| Ungroup drops the group's mix state | Partly confirmed (text: tracks return); the mixer state part is a CZABA choice (M6), verified |
| Undo granularity | Unconfirmed; CZABA choice (one entry per click, gesture or key press), verified |

## For B and root
- SRW-17 stage 3 meets the CZABA requirement in the real browser at both viewports. R17-G2 and R17-G3 are verified by export audio and live meters.
- **Ready for the root gate.** Root still owns the gate rows above and the open Tech Lead question R81-T (headphones listening; legibility of the half-coloured S; whether a falling child meter is understandable).
