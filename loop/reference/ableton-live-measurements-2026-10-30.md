# Measured in Ableton Live 12 (root, on Saba's computer, 2026-10-30)

Root ran Live 12 Trial (Windows) with computer use on Saba's computer and set things up by hand. These are direct observations, which outrank forum posts and our inferences. Values were read from the screen and are approximate (±1 px).

## SABA-B-7: fader taper and clip envelope (answers AGREE-SABA-B-7 facts #4–#6)

**1. Volume fader taper.** Track 2's volume was typed as −12 dB, and the fader's triangle sat exactly on the "12" mark of the mixer scale. The fader and the scale beside it therefore share one taper. Measured on that scale, as a fraction from 0 dB (top) to the bottom:

| dB | 0 | −12 | −24 | −36 | −48 | −60 |
|---|---|---|---|---|---|---|
| Live (measured) | 0 | 0.22 | 0.42 | 0.63 | 0.78 | 0.91 |
| Option A (dB-linear, −60 floor) | 0 | 0.20 | 0.40 | 0.60 | 0.80 | 1.00 (−∞ below) |
| Option B (gain = p³) | 0 | 0.37 | 0.60 | 0.75 | 0.84 | 0.90 |

- From 0 to −36 dB, Live is **dB-linear**: about 33 px per 12 dB on the small mixer.
- Below −36 dB, Live compresses a little (about 21 px per 12 dB) and reaches −∞ at the bottom.
- **Option A matches Live within 0.03 down to −36 dB.** Option B does not match: it puts −12 dB more than a third of the way down.

**2. The clip Gain envelope is linear in its own % axis.**
- A new breakpoint on the clip's Envelopes tab (Clip → Gain) reads "100 %".
- After dragging a second breakpoint to the bottom (0 %), a breakpoint added in the middle of the line reads **49.6 %**. The line is a straight interpolation in the displayed axis.
- Live labels this axis in %, not dB. It does not show the dB a % value maps to, so that mapping stays unmeasured.

**3. Conclusion for B.**
- Option A has the shape Live's volume fader has.
- Our readout keeps dB, as a listed deviation from Live's % label on the clip Gain envelope. Root recommends A to Saba.
- The small compression below −36 dB is not worth copying. A's −60 floor is simpler, and our lane fader already uses it.

## Also observed (for the SABA-B-10/11 owners)

- **Tempo on the first loop.** With an empty Set at 120 BPM, dragging "80s Beat 90 bpm.wav" from the browser into the arrangement changed the Set tempo to **90**. This is a first-hand confirmation of SABA-B-11a's "tempo from the asset". It was seen once, with one loop; Live's exact rule for later loops was not tested.
- **CHECK: the click snaps the insert marker.** At zoom with grid 1/1, clicking in a track lane placed the insert marker on a bar line: the status bar read "Insert Mark 122.1.1 (Time: 5:22:667)". The transport position display followed it while stopped. **CHECK** that our SABA-B-10a Insert Marker snaps on click when Snap is on.
- **Grid readout.** The grid size shows as "1/1" at the bottom-right of the track display, as in the GRGG video.
- **Clip envelope breakpoints show a value label on creation** ("100 %", "49.6 %"), next to the point.
