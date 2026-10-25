# Design & UX review: Saba's decisions

Recorded by root from Saba's chat answers. Items not listed here are still **pending** (`awaiting_user`); do not implement them.

## 2026-10-25

- **DUX-R-5: approve.** One colour rule. Waveforms and content use a neutral colour. The accent (brass in Obsidian) is reserved for selection, the playhead, the primary button and focus. Do it inside VISUAL-A (fitsVisualA: true), as its own bounded stage, before M1. Keep the contrast thresholds from D6.
- **V-2b-DISPLAY: Saba delegates the decision to the design agents.** In the planning round, B consults `design-philosopher` and `design-auditor` (C may add evidence in the browser). They decide where, if anywhere, the display serif (Cormorant) belongs in Studio, for example a project or panel title, or nowhere. Their decision is applied in VISUAL-A. Limits: no position, layout or behaviour change. A size change is allowed only for the chosen title text itself, and it must not move or resize anything else by more than 1 px. Record the decision and its reasoning in `design-ux-review.md` as an addendum ("V-2b-DISPLAY decision"). If the best answer needs a bigger layout change, do not apply it; write it in the addendum as a question for Saba.

## 2026-10-25 (later): Saba: "write tasks and bugs from what the reviews checked, and follow them"

- **Approve all DUX-R recommendations: DUX-R-1 to DUX-R-9.** DUX-R-5 is already scheduled inside VISUAL-A. DUX-R-3 has two options: auto-reveal the selected clip, or auto-collapse the panel at 1280. Let `design-philosopher` and `flow-sage` choose, with browser evidence, and record the choice and its reason in the task.
- **DUX-B bugs:** handled under the 2026-10-23 bug gate, as before.
- **Order:** approved recommendations from both reviews become bounded tasks **after VISUAL-A-OBSIDIAN**, in the reviews' own priority order (Top 5 first). They come **before T12-ADVANCED** and before phase 2. B adds a queue entry `REVIEW-RECOMMENDATIONS` with one item per approved id.
