p = 'current-task.md'
s = open(p, encoding='utf-8').read()
R = [
("<li>**Notch metric:** in each crop, count the device pixels of the outline colour (rgb(36,33,30) ±6) that lie outside the bright frame curve, i.e. between the frame border and the root curve. Expected **0**. Run the same count on B's baseline crops (`b-round-163/out/saba-probe2-*-corner-empty-*.png`, `out/corner-1440-*.png`); it must be > 0 there, which shows the metric detects the bug.</li><li>Put the crops side by side with B's.</li></ul> |",
 "<li>**Notch metric** (B's tool `b-round-163/notch-metric.cjs`; copy it unchanged and record its sha256). Count the device pixels in the outline band rgb(36,33,30) ±6 that are **not** within 1 device px (8-neighbourhood) of a bright pixel (relative luminance > 0.3). This excludes the anti-aliased edge of the bright arc itself.</li><li>**B's numbers per corner tl/tr/bl/br**, identical at both viewports (`b-round-163/out/notch-baseline-files.json`, `notch-render.json`):<ul><li>baseline (empty project): **3 / 13 / 3 / 15**;</li><li>DOM-simulated `rounded-sm` frame: **1 / 0 / 1 / 0**. The single left pixels are the anti-aliased join of the square overview playhead at 0 % with the curve; they are not the notch.</li></ul></li><li>**Pass:** every corner the frame touches is ≤ 1, and each is below its baseline value. C re-runs the tool on B's baseline crops first, to confirm the baseline numbers. If they differ, the metric run is invalid.</li><li>In state (b), only the corners the frame touches (the right ones) are judged.</li><li>Put the crops side by side with B's.</li></ul> |"),
("<li>Expected: no key missing or added, and every x/y/w/h within ±1 px. B predicts 0 px; only radii and colours change.</li>",
 "<li>Expected: no key missing or added, and every x/y/w/h within ±1 px. B predicts 0 px: the frame changes only its radius, and the envelope handle (8 → 10 px by R2) renders only in Env mode with a point. Env mode is outside d6's S0–S2, so no d6 key covers the handle. Its size is checked in ENV-VIS, not here.</li>"),
("(d) the `music` lane muted; (e)",
 "(d) the `music` lane muted (B found that a muted lane does not change the clip's rendering, so (d) is expected to equal (b); record it, and do not treat the equality as a finding); (e)"),
("  - With Env off and the same clip (the line still drawn), the two-polyline rule holds.\n",
 "  - With Env off and the same clip (the line still drawn), the two-polyline rule holds.\n  - On SVG elements `className` is an `SVGAnimatedString`. Read polyline and svg classes with `getAttribute('class')` or `classList.contains`, not `className.includes`.\n"),
("**Real audio:** with one point dragged to the bottom (gain 0), Play from 0 for 1 s.",
 "**Real audio** (live playback applies the clip envelope: `graph.client.ts` schedules `envelopeGain` per clip, l.123–143 and l.230): with one point dragged to the bottom (gain 0), Play from 0 for 1 s."),
("The tools and output are in `b-round-163/` (`saba-probe.cjs`, `saba-probe2.cjs`, `saba-sim.cjs`, `corner-zoom.cjs`, `out/`).",
 "The tools and output are in `b-round-163/` (`saba-probe.cjs`, `saba-probe2.cjs`, `saba-sim.cjs`, `corner-zoom.cjs`, `notch-metric.cjs`, `out/`)."),
]
for a, b in R:
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
