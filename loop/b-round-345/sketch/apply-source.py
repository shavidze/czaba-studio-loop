# B345 sketch c6-i: hoist lucide icon elements in ArrangementLane.tsx and ArrangementClip.tsx. Usage: python3 -I apply-source.py <store-root>
import pathlib, sys
root = pathlib.Path(sys.argv[1])
lane = root / 'app/components/arrangement/ArrangementLane.tsx'
s = lane.read_text()
reps = [
    ('              <ChevronRight className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />', '              LANE_FOLD_CHEVRON_RIGHT'),
    ('              <ChevronDown className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />', '              LANE_FOLD_CHEVRON_DOWN'),
    ('                  <Plus className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />', '                  {LANE_ADD_PLUS_ICON}'),
]
for old, new in reps:
    n = s.count(old)
    assert n >= 1, old
    s = s.replace(old, new)
print('lane replacements', [s.count(x[1].strip()) for x in reps])
anchor = '\nexport function ArrangementLane({'
assert s.count(anchor) == 1
consts = (
    '\nconst LANE_FOLD_CHEVRON_RIGHT = (\n  <ChevronRight className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />\n);\n'
    'const LANE_FOLD_CHEVRON_DOWN = (\n  <ChevronDown className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />\n);\n'
    'const LANE_ADD_PLUS_ICON = (\n  <Plus className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />\n);\n'
)
s = s.replace(anchor, consts + anchor, 1)
lane.write_text(s)
clip = root / 'app/components/arrangement/ArrangementClip.tsx'
c = clip.read_text()
reps = [
    ('          <Film className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />', '          CLIP_HEADER_VIDEO_ICON'),
    ('          <GripVertical className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />', '          CLIP_HEADER_GRIP_ICON'),
]
for old, new in reps:
    assert c.count(old) == 1, old
    c = c.replace(old, new)
print('clip ok')
clip.write_text(c)
c = clip.read_text()
anchor = 'const FADE_HANDLE_PX = 10;\n'
assert c.count(anchor) == 1
c = c.replace(anchor, anchor + 'const CLIP_HEADER_VIDEO_ICON = (\n  <Film className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />\n);\nconst CLIP_HEADER_GRIP_ICON = (\n  <GripVertical className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />\n);\n', 1)
clip.write_text(c)
print('clip consts ok')
