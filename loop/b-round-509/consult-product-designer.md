# product-designer consult: RETRO 510 whole-screen and journey review (B, 2026-11-14; read-only)

Input: `b-round-509/screens/` (12 PNGs, `screen510.json`, `capture.log`), `user-review/screen-review-495.md`. Returned text, condensed only by removing blank lines.

Nothing on screen has changed since RETRO 495 apart from the header Sign In button; one new candidate (Low). All 12 PNGs opened. RETRO 495 never visually opened the four `screen*-full-*` screens, so this is the first look at them since RETRO 480. Before giving anything a new ID, `user-review/screen-review-*.md` was searched.

**What the screenshots can and cannot show**
- Header Sign In is the only pixel change against `journey495-1-product-1440x900.png`: 8px corners → pill. `DESIGN_SYSTEM.md:1157-1159` says header Sign In is a pill and Buy Now/Add to Cart keep 8px on purpose. Follows the rule; not a candidate.
- Not captured, not reviewed: the cart layout and the "Get it free" button (the captured product costs $29). A $0 product and `/cart` need to be added to `capture.mjs`.
- Studio code did not change, so anything below is newly noticed, not newly introduced.

## (a) New candidates
| ID | What / where | Why | Quieter change | Sev. | Moves a position? |
|---|---|---|---|---|---|
| SR-510-1 | The first ruler label "0:00" is half hidden under the playhead or start edge at 0 s (`screen510-full-S0-1440x900.png`, about x 517; all four full screens) | Signifiers: the reference point everyone reads first is the one that is clipped | Start the first label a few px inside the edge, or draw the playhead's top marker beside the text, not over it. No new element | Low | No |

Not new: the long DEMO status sentence (SR-245/353 thread); empty Clip Gain "0.0" (SR-275-4); selected clip off-screen at 00:48 (SR-230-9, 435 note); "Undo: Ad…" truncation (F-10, acceptable); "1 audio files" (STORE-4); 90 → 120 BPM jump (SR-305-7).

## (b) Older candidates still visible
SR-480-1 ("← CZABA" plain text colour); SR-480-2 (play button covers the "CZABA AUDIO BUNDLE" mark on `journey510-1-product-*`; mock cover; position question is Saba's); SR-480-3 (bordered "Demo collection — no sign-in required" badge); SR-290-1 ("Time selection" cut off under the footer in `journey510-3-export-1280x720.png`); re-seen SR-275-4, SR-305-7, STORE-4, SR-290-5, COPY-PD F11 ("LAME (mediabunny)", "the same graph as playback", "Done"). The rest of RETRO 495's "also unchanged" list was not re-checked one by one (Studio code unchanged, line counts identical 138/168/118/144).

## (c) Journey: the three biggest frictions
1. Arrival does nothing audible (`journey510-1b-studio-arrival-1440x900.png`): Middle East selected and focused, timeline empty, end 00:00.000, BPM blank; the editor must press Add or drag before anything plays. Known: SR-305-3.
2. The stems play one after another, not together (`journey510-2-studio-playing-1440x900.png`, `screen510.json`): clips at top 441, left 512/1152/1792; at 00:01.491 only Pulse is under the playhead; Melody at "00:48.000 (nearest free spot)", off-screen. STEM-LANES, queued, not built.
3. Export carries the problem to the end (`journey510-3-export-1440x900.png`): "Entire project · 00:00.000 — 01:04.000" = 64 s of stems in a row, not one 16 s mix; Middle East is not in it. Known: SR-321-6.
Alternative third: product page BPM 90 vs project grid 120 after a stem is added (SR-305-7).
Must not change: the export footer, a quiet "Done" next to one filled "Export WAV".

## (d) Medium or worse functional bugs
None seen. Playback moves forward (00:01.491), the track meter moves, the export dialog shows at both sizes, `?preview=middle-east` selection arrives. Sequential stem placement is the known STEM-LANES gap.

Questions for Saba: no new position questions. Q-SR-385-1, SR-480-2 and AGREE-STEM-LANES still wait. Building STEM-LANES would fix frictions 2 and 3 at once.
