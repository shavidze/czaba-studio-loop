# Design & UX review: Saba's decisions

Recorded by root from Saba's chat answers. Items not listed here are still **pending** (`awaiting_user`); do not implement them.

## 2026-10-25

- **DUX-R-5: approve.** One colour rule. Waveforms and content use a neutral colour. The accent (brass in Obsidian) is reserved for selection, the playhead, the primary button and focus. Do it inside VISUAL-A (fitsVisualA: true), as its own bounded stage, before M1. Keep the contrast thresholds from D6.
- **V-2b-DISPLAY: Saba delegates the decision to the design agents.** In the planning round, B consults `design-philosopher` and `design-auditor` (C may add evidence in the browser). They decide where, if anywhere, the display serif (Cormorant) belongs in Studio, for example a project or panel title, or nowhere. Their decision is applied in VISUAL-A. Limits: no position, layout or behaviour change. A size change is allowed only for the chosen title text itself, and it must not move or resize anything else by more than 1 px. Record the decision and its reasoning in `design-ux-review.md` as an addendum ("V-2b-DISPLAY decision"). If the best answer needs a bigger layout change, do not apply it; write it in the addendum as a question for Saba.
