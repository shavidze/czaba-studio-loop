# B338 sketch v3: sequence strings without interpolation use single quotes (TL-7 note). Usage: python3 -I apply-sketch-v3.py <tree root>
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / 'perf/studio-lab-interactions.perf.spec.ts'
s = p.read_text()
for old, new in [
    ("  `group setup: click the clip name bar, Ctrl+D (a copy right after it), Ctrl+click the first clip's name bar (2 clips selected)`,\n",
     "  'group setup: click the clip name bar, Ctrl+D (a copy right after it), Ctrl+click the name bar of the first clip (2 clips selected)',\n"),
    ("  `group drag playing: Space, then the same gesture after Home (seek to 0); reset with Ctrl+Z; Space (interact.drag.group.playing.*, interact.harness.drag-group-live)`,\n",
     "  'group drag playing: Space, then the same gesture after Home (seek to 0); reset with Ctrl+Z; Space (interact.drag.group.playing.*, interact.harness.drag-group-live)',\n"),
]:
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)
p.write_text(s)
print('v3 ok')
