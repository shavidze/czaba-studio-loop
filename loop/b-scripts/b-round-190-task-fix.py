L='/home/runner/czaba-project/tmp/studio-real-loop/'
p=L+'current-task.md'; s=open(p).read()
reps=[
("`title`, `data-testid` and its **layout box (width and height)**. The relative drag maths, Shift-fine drag, touch, double-click reset, keyboard steps and commit-on-release must behave exactly as before.</li>",
 "`title`, `data-testid` and its **width**. The relative drag maths, Shift-fine drag, touch, double-click reset, keyboard steps and commit-on-release must behave exactly as before.</li><li>**Height, so the ring can enclose the thumb.** Three of the level faders are `h-1` (4 px), and the ≈ 16 px thumb overflows that box. A ring that follows such a box would cut through the thumb. **The input's height may grow so that its box encloses the thumb**, provided that: the visible track keeps its current thickness; the thumb keeps its size; and the row and panel heights and the M/S/readout boxes stay unchanged ± 1 px (the rows are `items-center` with `h-5` buttons). Prefer this to a ring on a wrapper; if A uses a wrapper (`:has(:focus-visible)`), record why. The same rule applies to Pan and Zoom (K3).</li>"),
("<li>Exactly one ring, with no second concentric band.</li>",
 "<li>Exactly one ring, with no second concentric band.</li><li>**The ring does not cross the thumb:** the thumb bbox lies inside the ring's inner edge, and the gap criterion holds along the ring's whole perimeter, including at the thumb's x-position.</li>"),
("| **LAYOUT-191** | Lane rows, group header, Master bar, detail panel and transport, 2 viewports. | The boxes of the six inputs, the M/S buttons and the readouts, and each row and panel height, are unchanged ± 1 px vs the round-190 baseline. |",
 "| **LAYOUT-191** | Lane rows, group header, Master bar, detail panel and transport, 2 viewports. \"Fader rect\" = the input box ∪ the thumb bbox. | Each input's **width and x-position** are unchanged ± 1 px vs the round-190 baseline. The M/S buttons, the readouts, the fader rect's vertical centre, and each row and panel height are unchanged ± 1 px. The input's own height may grow (K1). |"),
("with the four level-fader boxes masked (+ 4 px). | **0 changed px outside the mask.** Pan and Zoom are not masked, so they must be 0 px.",
 "with the four level faders masked: fader rect (input box ∪ thumb bbox) + 4 px. | **0 changed px outside the mask.** Pan and Zoom are not masked, so they must be 0 px at rest."),
("- `appearance-none` changes the input's box, so the drag maths or the hit area shift → LAYOUT-191, BEHAVIOUR-191 and the neighbour suites.",
 "- `appearance-none` or a taller input changes the input's box, so the drag maths, the hit area or the row height shift → LAYOUT-191, BEHAVIOUR-191 and the neighbour suites."),
]
for a,b in reps:
    assert s.count(a)==1, a[:60]
    s=s.replace(a,b)
open(p,'w').write(s)
p=L+'b-round-190.md'; s=open(p).read()
a="## For Saba (vetoable)\n**R68 changes the rest look of the track, group, Master and Clip Gain faders.** Their fill goes from neutral ivory to brass, while the thumb stays ivory, as you described. Pan and Zoom keep the neutral look and get only the single thin focus ring.\n"
assert a in s
s=s.replace(a,"""## Changes after the final advisor review
- **Ring geometry.** Three level faders are `h-1`, and the ≈ 16 px thumb overflows them, so a ring that follows the input box would cut through the thumb. Changes:
  - K1 now keeps the input's **width** fixed but lets its **height** grow so that its box encloses the thumb. The track thickness, the thumb size, and the row, panel and M/S/readout boxes stay within ± 1 px.
  - PRESS-191 adds: "the ring does not cross the thumb".
  - LAYOUT-191 and the STUDIO-RV-191 mask use the fader rect (the input box ∪ the thumb bbox).
- The backlog `SABA-B-3` entry records the same relaxation.

## For Saba (vetoable)
- **R68 changes the rest look of the track, group, Master and Clip Gain faders.** Their fill goes from neutral ivory to brass, and the thumb stays ivory, as you described.
- **Wider than the four faders you named:** Pan (in the same lane file) and the transport **Zoom** slider (`ArrangementTransport.tsx`) carry the identical class string and the same box bug. They get **only** the single thin focus ring (R69/R70). Their look is otherwise unchanged, with no brass fill.
""")
open(p,'w').write(s)
import json
d=json.load(open(L+'backlog.json'))
e=[x for x in d['open_findings'] if x.get('id')=='SABA-B-3'][0]
e['rulings']['K1_geometry']='input width fixed; input height may grow to enclose the thumb (track thickness, thumb size, row/panel/M-S/readout boxes +-1 px) so the single ring does not cross the thumb; PRESS-191 checks it'
e['scope_note']='Pan (ArrangementLane) and Zoom (ArrangementTransport) included for the focus-ring fix only (identical class string, same bug); named for Saba in b-round-190.md'
json.dump(d,open(L+'backlog.json','w'),ensure_ascii=False,indent=1)
json.load(open(L+'backlog.json')); print('ok')
