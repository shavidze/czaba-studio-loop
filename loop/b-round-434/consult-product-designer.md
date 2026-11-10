# product-designer consult, RETRO 435 whole-screen and journey review (returned 2026-11-10; read-only; verbatim result below)
Input: b-round-434/consult-inputs.md "Screen" section + b-round-434/screens/*.png, screen435.json, capture.log; user-review/screen-review-420.md.

**Compared with RETRO 420:** nothing got worse. Persistent text lines 138/168/118/144 and lines outside the timeline and library 97/124/86/101, both exactly as in 420 (capture.log). Journey unchanged: Middle East product page, arrival with Middle East selected and focused, four stems at 512/1152/1792 px..., export 00:00.000 — 01:04.000.

**Better than 420 (SABA-B-12, visible):** Detail panel From/To and Clip Gain fields have no spin buttons (screen435-full-DEMO-1440x900, journey435-2-...-1440x900). Export radios are brass and match the tint of the selected row (journey435-3-export-*).

**Not verified, because these screens do not show them:** the themed export progress bar, the clear button on the shortcut-sheet search, the Studio scrollbar in dialogs. Do not count them as checked.

| id | Sev | What / where | Why | Fix | Saba? |
|---|---|---|---|---|---|
| SR-435-1 | Medium | STUDIO-VIS-6 (pending) drops ", s". The fields show bare seconds "48" / "64" next to "Start 00:48.000" (journey435-2-...-1440x900, Detail panel). | With the unit gone, two formats for one concept and no unit; reads as frames or bars. The audit itself allows "From (s)". | Do VIS-6 as "From (s)" / "To (s)", or show values as 00:48.000. Settle before COPY-PD-VIS ships. | No (copy); it changes how an approved task is carried out, so tell Saba in one line. |
| SR-435-2 | Low | Second status line says "...source offset 00:00.000" lower case (screen435-full-DEMO-1440x900, journey435-2-*-1280x720, bottom left). | If VIS-4 renames only the Detail panel, one concept gets two names. | Not a new task: VIS-4 scope names selectedClipDetail (taken to be this footer line; not checked in code). Add a COPY-PD-VIS acceptance row: no "source offset" in the DOM at either size. | No |

**Already recorded, do not repeat:** SR-245-7, SR-275-6, SR-245-1, SR-305-7, SR-290-1/2, SR-353-4, SR-290-4, SR-353-3 / SR-230-3, SR-245-8, SR-275-3, SR-305-6 / SR-275-4, SR-230-7, SR-321-6, COPY-PD F11, STORE-4 "1 audio files", SR-420-1/2 and stems one after another (STEM-LANES), pending COPY-PD-VIS items and the lane handle.

**STEM-LANES symptom:** in journey435-2-*-1440x900 Clip details shows "Night Pulse · Melody" at 00:48 while that clip is off screen and the playhead runs at 00:01. Add to SR-420-2's S4 acceptance, not a new id.

**Must not change:** the arrival state (Middle East selected and focused, Music active, "Drag a sound here, or press Enter to add it" in the empty lane); the status "...(nearest free spot)" until STEM-LANES lands.
