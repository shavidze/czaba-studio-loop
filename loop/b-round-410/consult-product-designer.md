# product-designer consult (B round 410 -> 411, PERF-15b-i), 2026-11-08
Question: is the existing dimmed state right for an already-visible waveform while the MP3 loads?
Answer (verbatim summary):
- Framing: a film editor picks a sound while it is downloading; real dimmed peaks answer "what does it look like" and "when can I scrub it". Dimming means "not seekable yet", not "fake data".
- Chosen: keep opacity-40 / not-allowed / aria-disabled / tabIndex -1, plus one tooltip-only addition: the strip gets the same title={previewUnavailableTitle} as the Preview button. No new persistent text.
- Rejected: shimmer/pulse (reads as placeholder); hide peaks until ready (throws away honest info); live-region announce on ready (source row + status line already carry it); softer dim (no token reason, weakens the signal).
- Ableton: could not confirm browser preview timing; not relied on. (B found Live 12 manual 5.1.2: the waveform is grayed out until fully drawn and cannot be played back.)
- States: loading with peaks = dimmed real waveform, readout "—", not focusable, tooltip; loading without peaks = dimmed empty strip; ready = full opacity, pointer, tabIndex 0, duration; error = dimmed, tooltip says what failed (previewFailedTitle; 15a drops early peaks on error, so the strip is empty).
- Acceptance rows: (1) hover dimmed strip: not-allowed cursor + reason tooltip, click does nothing; (2) Tab skips the strip while loading, lands on it when ready, ArrowRight changes the readout; (3) at ready the opacity changes but column heights do not jump.
B adoption: D-29z1429 (all three rows -> C rows 3/4; tooltip = contract item 5).
