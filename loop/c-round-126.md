# C — Round 126: DESIGN-UX-REVIEW part 2 (D3, D4, D5) — PASS

Verifier C · 2026-10-24 04:27–04:55 UTC · baseline `608187f` · Playwright Chromium headless, fresh context per session, no credentials, `http://127.0.0.1:5173/studio-lab`. Scrollbar rows run with real scrollbars (HR-REAL-SCROLLBARS).

**Result:** taskStatus PASS · browserVerified true · realVerified true · allRowsRan true · reviewComplete true · sectionsSpilled [].
**Bugs (new):** DUX-B-2 Low (2.5.8 resize separators 4–6 px / folder fold 16 px), DUX-B-3 Low (1.4.11 input boundary 1.51:1), DUX-B-4 Low (selected library row `muted` 4.38:1). No Critical/High/Medium → per task §7, round 127 = VISUAL-A V-0 stage 1 (regression due ≥ 2026-10-27).
**Ideas:** DUX-R-3…9 (all awaiting_user); DUX-R-1 extended to group. Top 5: DUX-R-5 (fitsVisualA), DUX-R-3, DUX-R-1, DUX-R-4, DUX-R-6.

## Guard rows
- SOURCE-SCOPE start (04:27) and end (04:54, re-checked 04:59 after the last reruns): HEAD 608187f, `git status` empty, `sha256sum -c --quiet b-round-125-r126-tree-sha256.txt` OK. No store/ change. A's report (`a-round-126.md`): the same three checks, no changes; consistent with C's own run.
- Part-1 backup: `c-round-126/design-ux-review-part1.md`, sha256 cea8a65f…dbf38. PART1-INTEGRITY: 126/126 table rows of §2/3/6/7 and 8/8 part-1 verdict bullets present unchanged; only the title, header, §1 heading and §4 placeholder lines changed (`out/part1-integrity.json`).
- G126-3: lab workspace + demo badge; `/studio/middle-east` "Sign in required" at 1440 and 1280, no workspace, 0 `audio[src]`; `/api/studio-token?product=middle-east&file=stem1.wav` → 401; 0 forbidden requests, 0 Authorization headers. Fake-Bearer 403: blocked (backend unavailable in cloud).
- Network/console in every session (each script's netOk = ok, except the one ENV-FIRST-LOAD run). Note: g126-3 outputs carry no run stamp (single run, nothing overwritten); only known cloud noise. Invalid run: 1 (d3a-withGroup-hidden-0428, ENV-FIRST-LOAD hydration + invalid hook call; discarded once, rerun clean).

## D3-A (1280×720) — friction, not a bug
- With group: panel 120 = aria 120 (D-29b fallback), scroller 292/348, SFX 516–577 with 5 px visible; clip not clickable. Wheel ×1 → scrollTop 56 (max), SFX visible, click selects. Scrollbar drag ×1 → 56. Collapse → panel 36, all visible. Separator drag down: stays 120.
- Without group: panel 120, scroll 320, SFX 33 px visible, clip clickable; same paths.
- Auto-fit was on (no UI toggle; lanes 80→61 on expand, 70 on collapse). Hidden-scrollbar comparison: client 302, SFX 15 px.
- Ruling line 2 → DUX-R-3.

## D3-B
- Export range card (1280): no range → disabled card 45/62 px under footer (mid-click hits footer); active range → 13 px, mid clickable, ArrowDown scrolls fully visible, subtitle names the range. Acceptable; cited ARCH-R101-MODALBODY-PADDING-SLOT / GATE102-S3.
- Group volume: dB only in title (−3.0 after 30×↓), status unchanged → DUX-R-1.
- Under-24: faders hit 16 px (box 4); separators hit = box (4–6 px) and folder fold hit 16 px wide (box 16×58, `d3c-hit2`), spacing fails → DUX-B-2 Low (the 1280-S1 count also includes SFX controls hidden under the panel); playhead handle hit 7 px (ruler equivalent); radios in labels.
- AltGr: `shortcutLetter()` uses `event.code`; trusted CDP Ctrl+Alt '€'/KeyE splits at 5.000 and '@'/KeyV pastes at 10.000 on the timeline (1-step Undo); in 4 text fields (search, BPM, Clip Gain, marker name; 8/8 rows, BPM rerun 04:58 after a selector fix) nothing → info, not a bug. Text insertion: blocked: CDP.
- Volume "6 px dead zone": harness artifact (part-1 press at x=459 = input border, hit DIV). Inside the input the value moves from the first px.

## D3-C
- Focus: 67 stops (S0) / 82 (S1) at both viewports; every stop 2 px teal outline 9.48–11.13:1, `:focus-visible` true; 0 missing → no Medium. Export = stop 10 (S0) / 14 (S1); first lane control 38; clips 0 stops → DUX-R-6.
- Boundaries: `border-outline` 1.51:1 on inputs → DUX-B-3 Low; selected library row `muted` 4.38:1 (12 px) → DUX-B-4 Low; slider unfilled track 2.34 (thumb 10.43) acceptable.
- Density: 0 text < 12 px; truncations 1/2 with title.
- Feedback (both viewports): add 6–8 ms, move/trim first visual 21–23 ms after first move and status 4 ms after up, Undo 4 ms, mute 3.6 ms (button only), export footer 0.5–2 ms.
- First visit: sound 1 click (output peak 0.374), clip 1 click, export 2 clicks → WAV 101.352 s, 48 kHz/24-bit/stereo, 4 864 896 frames (= 101.352 × 48000), NaN 0; overload notice on the default export (→ ABL-R-18). Empty audio lanes without hint; disabled Split/Undo/Redo/Loop/Delete titles give no reason → DUX-R-4.

## Screenshots opened and described
- `D3A-S1-withGroup-real-…0431.png`: SFX lane hidden; a 5 px teal sliver of the selected Soft impact clip shows above the detail panel, which displays "Soft impact · SFX"; vertical scrollbar thumb at the right edge.
- `D3A-P1wheel-…0431.png`: after the wheel, the group row, music, stems and the SFX lane with the selected clip are visible; the video lane is under the sticky ruler.
- `D3A-P2scrollbar-…0431.png`: thumb at the bottom, SFX visible.
- `D3A-P3collapse-…0431.png`: panel collapsed ("გაშლა ▸"), all four lanes and the group visible.
- `D3A-S1-withoutGroup-real-…0431.png`: SFX header and clip top visible; M/S cut.
- `D3B-export-1280-…0436.png`: Export dialog; under "მონაკვეთი" only the project card; the next card is a 3 px sliver above the footer line; teal scrollbar on the right.
- `D3B-export-1280-…0437.png`: with range 06–10 s, the subtitle names it and the range card is visible except its bottom 13 px.
- `D3B-group-1280-…png`: group row "ჯგუფი 1", M, S and a focused fader with no dB text; the lanes above/below show "+0.0".
- `D3C-S0-1440/1280-…png`: empty S0; filled teal Export, teal-outlined Play and "＋ დამატება", amber demo badge; video lane hint text; music/stems/SFX lanes empty with no text; status line guidance.
- `D3C-S1-1440-…png`: teal waveforms dominate, then the colour-bar video thumbnail, then the teal-bordered selected SFX clip; selection and waveform share the same teal.
- `D3C-fb-move-1440-…png`: SFX clip moved to 5.000, detail panel 5 → 7, status line names the move.
- `D3C-first-add-1440-…png`: Middle East on the music lane at 0, selected, detail panel filled.
- `D3C-first-export-1280-…png`: first-visit export dialog; the disabled range card is half visible above the footer.
- `D3A-P4separator-withGroup-real-…png`: after the separator drag the panel is still 120 and SFX is still a sliver.
- `D3C-S1-1280-…png`: same layout as the D3-A S1 shot; SFX hidden under the panel.
- `g126-3-protected-1440.png`: same sign-in card as at 1280.
- `g126-3-protected-1280.png`: lock icon, "Sign in required", Sign In button, nothing else. `g126-3-lab-1440.png`: full Studio with the demo badge.

## Roles (read as checklists; no subagent tool)
design-philosopher → F-9/DUX-R-5/verdict; design-auditor → F-9/F-10/F-11; flow-sage → D3-A/F-12/DUX-R-3; first-visit-host → F-14/DUX-R-4; ableton-arrangement-expert → D4 Live column (F quotes only); accessibility-auditor → F-4/F-11/F-13.

## Ableton conformance
Confirmed only where an F quote is given (42.2, 42.5, 42.6, 42.9, 42.16, 42.19 from `b-round-71/ableton-shortcuts-20261021.txt`); other comparisons are "Live ?" (unconfirmed). No Live application on the runner.

## Not reachable / blocked
Fake-Bearer 403 (backend); AltGr text insertion into fields (CDP); real touch, Ctrl+digit, browser-reserved keys (CDP; not needed this round). `gate` rows (full vitest, typecheck, build, Biome, verify) were not run by C.

## Notes for B
See `c-round-126.json` `notesForB`: close C-R125-OBS-VOLUME-DEADZONE-6PX as a harness artifact; the AltGr guard idea; the VISUAL-A outline token vs DUX-B-3; DUX-R-3 context; whether WCAG 2.1.1 should become a contract (DUX-R-6); D4 rejections.
