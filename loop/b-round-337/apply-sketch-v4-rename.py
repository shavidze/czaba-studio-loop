# Usage: python3 -I apply-sketch-v4-rename.py <store-root>  (run after apply-sketch.py, DP49 and apply-sketch-v3.py;
# v4 = tech-lead TL-2/TL-3: names and no type re-export). Refuses to run inside the real store.
import sys, pathlib, re
root = pathlib.Path(sys.argv[1]).resolve()
if str(root) == '/home/runner/czaba-project/store':
    sys.exit('refusing to edit the real store')
old_file = root / 'app/lib/arrangement/lane-drag-store.ts'
new_file = root / 'app/lib/arrangement/clip-lane-drag-store.ts'
if not old_file.exists():
    sys.exit('lane-drag-store.ts missing (already renamed?)')
RENAMES = [
    ('ArrangementLaneDragState', 'ArrangementClipLaneDragStoreState'),
    ('ArrangementLaneDragStore', 'ArrangementClipLaneDragStore'),
    ('ArrangementLaneDragContext', 'ArrangementClipLaneDragContext'),
    ('createArrangementLaneDragStore', 'createArrangementClipLaneDragStore'),
    ('useArrangementLaneDragStore', 'useArrangementClipLaneDragStore'),
    ('useArrangementLaneDrag', 'useArrangementClipLaneDrag'),
    ('laneDragStore', 'clipLaneDragStore'),
    ("'~/lib/arrangement/lane-drag-store'", "'~/lib/arrangement/clip-lane-drag-store'"),
]
files = [old_file] + [p for p in (root / 'app').rglob('*.ts*') if p != old_file]
for p in files:
    s = p.read_text()
    t = s
    for a, b in RENAMES:
        t = re.sub(r'(?<![A-Za-z])' + re.escape(a) + r'(?![A-Za-z])', b, t) if not a.startswith("'") else t.replace(a, b)
    if t != s:
        p.write_text(t)
old_file.rename(new_file)

ctx = root / 'app/contexts/ArrangementContext.tsx'
s = ctx.read_text()
reexport = "export type { ClipLaneDragState, ClipLaneGhost } from '~/lib/arrangement/clip-lane-drag-store';\n"
if s.count(reexport) != 1:
    sys.exit('re-export not found')
s = s.replace(reexport, '')
ctx.write_text(s)

clip = root / 'app/components/arrangement/ArrangementClip.tsx'
s = clip.read_text()
m = re.search(r"import \{\n((?:  .*\n)+?)\} from '~/contexts/ArrangementContext';\n", s)
if not m:
    sys.exit('clip context import not found')
body = m.group(1)
moved = [l for l in body.splitlines() if l.strip() in ('type ClipLaneDragState,', 'type ClipLaneGhost,')]
if len(moved) != 2:
    sys.exit(f'clip type imports: {moved}')
kept = [l for l in body.splitlines() if l not in moved]
new_import = "import {\n" + '\n'.join(kept) + "\n} from '~/contexts/ArrangementContext';\nimport type { ClipLaneDragState, ClipLaneGhost } from '~/lib/arrangement/clip-lane-drag-store';\n"
s = s[:m.start()] + new_import + s[m.end():]
clip.write_text(s)

for p in (root / 'app/lib/arrangement/__tests__').glob('*.test.tsx'):
    s = p.read_text()
    if '  type ClipLaneDragState,\n' not in s:
        continue
    s = s.replace('  type ClipLaneDragState,\n', '', 1)
    s = s.replace("} from '~/contexts/ArrangementContext';\n",
                  "} from '~/contexts/ArrangementContext';\nimport type { ClipLaneDragState } from '~/lib/arrangement/clip-lane-drag-store';\n", 1)
    p.write_text(s)
print('sketch v4 rename applied')
