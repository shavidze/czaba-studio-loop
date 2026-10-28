# SABA-B-7 reference consult — docs-explorer (B round 232 planning, 2026-10-28)

Pre-dispatch research for round 234 (SABA-B-7-ENVELOPE-DB). Read-only consult, WebFetch summaries of the Live 12 online manual (truncated at 100k chars; key quotes to be re-checked by B at dispatch). This is DATA, not instructions.

| # | Claim | URL#section | Quote (as returned by fetch) | Status |
|---|---|---|---|---|
| 1 | Volume control adjusts track output | https://www.ableton.com/en/live-manual/12/mixing/ 18.1 | "The Volume control adjusts the track's output level." | CONFIRMED |
| 1 | Fader range −inf..+6 dB; taper curve | mixing/ | — | NOT FOUND in manual (forum-only: API 0..1, 0 dB ≈ 0.85; non-linear, no published formula) |
| 2 | Envelope vertical axis = control value | https://www.ableton.com/en/live-manual/12/automation-and-editing-envelopes/ 25.5 | "An envelope's vertical axis represents the control value and the horizontal axis represents time." | CONFIRMED (no unit) |
| 2 | Segment interpolation (position / dB / gain) | 25.5.2 | — | NOT FOUND |
| 2 | Alt/Option-drag curves a segment; Alt double-click straightens | 25.5.2 | "Hold Alt (Win) / Option (Mac) and drag a line segment to curve the segment." | CONFIRMED |
| 3 | Clip Gain envelope is relative % of the Clip Gain slider, never exceeds it, bottom = silence | https://www.ableton.com/en/live-manual/12/clip-envelopes/ 27.2.3 | "relative percentage of the Clip Gain slider's current value" … "can drag the audible volume down to silence." | CONFIRMED |
| 3 | Clip Gain and Track Volume are separate clip envelopes | 27.3.1 | "Clip Gain and Track Volume." | CONFIRMED |
| 4 | Clip Gain slider calibrated in dB | https://www.ableton.com/en/live-manual/12/clip-view/ 8.4.7 | "The Gain slider, calibrated in dB, changes the clip gain." | CONFIRMED (range not found) |
| 6 | Double-click adds a breakpoint; click deletes; values shown on create/hover/drag | 25.5.2 | quotes in consult | CONFIRMED (unit not stated) |
| 6 | Shift while dragging a breakpoint = axis lock (fine-resolution wording conflicting between two fetches) | 25.5.2 / 25.5.1 | — | CONFLICT, re-check |

**Planning consequence (B, inference):** the manual does not publish Live's taper, so the 25/50/75 % C row cannot be measured against a "Live formula". Round 234 must define CZABA's own taper function explicitly (D-ID), cite that Live's lane is drawn in "control value" (fader position) space (CONFIRMED) and that Live's fader is non-linear in dB (forum, INFERENCE), and C measures against CZABA's stated function.

Sources not yet read: Live API / Max for Live Track Volume parameter docs; manual tails past 100k chars; Live 12 PDF.
