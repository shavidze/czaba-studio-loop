# product-designer consult (RETRO 465 screen + journey review), returned 2026-11-12

Inputs: b-round-464/screens/*.png, screen465.json, compare-450.txt, user-review/screen-review-450.md. Prompt: b-round-464/consult-inputs.md context + screen-review request. All of the below is the agent's opinion (verbatim summary of its report).

## 1. Changes since 450
- No visible Studio change; only measured difference is the playhead after play at 1440 (1.471 -> 1.462 s), timing noise.
- Store product page unchanged at both sizes; the round-455 seek thumb and the round 459-461 entrance cannot be judged from stills (first frame fully settled).
- SR-450-1..5 all still hold: Expand/Collapse chevrons; Clip Gain "0.0" + "0 dB"; filled brass Sign In; dimmed unselected Premium name/$99; "$29.00 USD" vs "$29".
- Not repeated (already logged, unchanged): SR-245-7, SR-305-10, SR-230-5, SR-353-4/SR-290-2, COPY-PD F11, SR-290-1, SR-435-1, STEM-LANES (Melody at 00:48 off screen), STORE-4 ("1 audio files").

## 2. New candidates
| id | Sev | Where | Change | Why |
|---|---|---|---|---|
| SR-465-1 | Low | journey465-1-product-*, Premium card | chip "✦ PREMIUM" above the name "Premium" repeats the word; chip text could say what Premium adds ("Includes stems"), or drop the chip if Saba prefers | duplicated label |
| SR-465-2 | Low | journey465-1-product-*, both version cards | "WAV" and "24-bit / 48 kHz" identical on both cards; state the shared format once (default: inside "What's included"), cards show only differences | faster comparison; 2 repeated rows |
| SR-465-3 | Low | journey465-2-studio-playing-* (both sizes), library list top | after Melody is selected the list scroll leaves the top row half cut; scroll by whole rows | half-cut row reads as broken layout; behaviour only |
- Nothing at Medium; Medium-level frictions already logged (STEM-LANES, SR-305-3, SR-230-5).
- Question for Saba (only if SR-465-2 approved): shared format line under "Select version" or in "What's included" (default "What's included").

## 3. Journey
Reads as one product, as at 450; two known seams: demo-collection/synthetic-stems note right after a CZABA product (SR-230-5) and the stem set landing off screen at 00:48 (STEM-LANES). Must not change: export dialog's single filled "Export WAV" with quiet "Done".
