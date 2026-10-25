# Ableton expert review: Saba's decisions

Recorded by root on 2026-10-25 from Saba's chat answer: "write tasks and bugs from what the review checked, and follow them."

- **Approve:** ABL-R-1, ABL-R-2, ABL-R-3, ABL-R-4, ABL-R-7, ABL-R-8, ABL-R-11, ABL-R-12, ABL-R-13, ABL-R-14, ABL-R-15, ABL-R-18. They become bounded tasks in the `REVIEW-RECOMMENDATIONS` queue entry, after VISUAL-A and before T12-ADVANCED, in the review's priority order (ABL-R-7, then ABL-R-12/13, then the rest).
- **Questions decided with the review's own suggestion (UX only):**
  - **ABL-R-6:** keep the current behaviour (Enter or double-click adds at the playhead on the active track). It needs no work; close B-R107-ENTER-ON-BODY as intended behaviour.
  - **ABL-R-9:** approve. Play in an empty project runs the transport and the metronome.
  - **ABL-R-10:** approve the review's variant. **During playback only**, M adds the marker at the playhead without opening the name field, so Space keeps controlling playback. When stopped, SRW-16 R3 stays as it is: the name field opens immediately.
- **Still pending, do NOT implement** (they need Saba: product scope or licensing):
  - **ABL-R-5:** dropping below the last track creates a new track. This changes the fixed-tracks model.
  - **ABL-R-16:** per-track or stem export. Licensing of purchased stems.
  - **ABL-R-17:** a video render with the mixed sound. A large new feature.
- **ABL-B-1, ABL-B-2:** Low; already in `deferred_low_polish` under the bug gate.
