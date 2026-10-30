# YouTube findings: SABA-B-7 (root, 2026-10-30)

Root read the transcripts of B's four picks on Saba's computer and summarised what matters for B's facts #4–#6 in `AGREE-SABA-B-7.md`. These are summaries with timestamps, not transcripts.

| Video | What it settles |
|---|---|
| [Learn Live: Clip automation](https://www.youtube.com/watch?v=IdQYUk8w5jM) (Ableton) | Breakpoint editing (1:38–2:46) |
| [Envelope Automation: Arrangement View](https://www.youtube.com/watch?v=Ib_f2XGzZM4) | Only how to draw and clear envelopes. **No dB values on screen in the narration.** Nothing for #4–#6 |
| [The Ultimate Guide to Clip Automation](https://www.youtube.com/watch?v=OkAXHx5Ajyk) (Sonic Bloom) | Automation vs modulation (18:12–19:30) |
| [Basic Clip Envelopes](https://www.youtube.com/watch?v=FEzmmTb0fFA) (Noiselab) | The clip Volume modulation envelope in use (4:36–6:47) |

## Findings

- **NEW — the clip Volume modulation is shown in percent, not dB.**
  - FEzm 5:04: the first breakpoint reads "100 %", meaning 100 % of the clip's current volume (0 dB). Dragging a point to the bottom gives 0 %, and the clip fades completely out.
  - OkAX 19:05: "modulation goes from zero to 100 %, because it's relative". Track volume automation, by contrast, is absolute and shown in dB ("from minus infinite dB to minus 3 dB", 18:35).

  So Live's relative clip envelope readout is a percentage of the clip volume. The videos do not say whether 50 % means half the fader position or half the gain.
- **Fact #6 is answered in part.** Clip modulation and track automation are **not** on the same displayed scale: one is percent, the other dB. What #6 still cannot tell us is whether they share the same underlying taper.
- **#4 and #5 are not answered** (fader taper, and which space interpolation runs in). No video shows dB values midway along a line. Saba's 2-minute measurement in Live (AGREE question 3) remains the only way to settle them.
- **Also relevant, and not in our envelope today:**
  - breakpoints snap to the grid, and Alt (Win) or Cmd (Mac) moves them freely (IdQY 1:52–2:05);
  - right-click a breakpoint → Edit Value types an exact value (2:13);
  - Alt/Option-drag near a segment bends it into a **curve** (2:24–2:38).

  B lists the ones we lack as later candidates, not in SABA-B-7's scope.
- **Consequence for the options.** Root's view, for Saba: a percent readout would match Live's label but is less useful to a film editor than dB. This supports option A, with dB on the readout and the same scale as our lane fader, kept as a listed deviation from Live's percent label.
