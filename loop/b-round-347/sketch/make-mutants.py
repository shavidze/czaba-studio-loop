# B round 347 -> 348: build mutant trees from a sketch tree (HEAD source + conversions budgets).
# Usage: python3 -I make-mutants.py <sketch-tree> <out-dir>   (refuses the store path)
import pathlib, shutil, sys

src = pathlib.Path(sys.argv[1]).resolve()
out = pathlib.Path(sys.argv[2]).resolve()
assert 'czaba-project/store' not in str(src) and 'czaba-project/store' not in str(out), 'refusing the store tree'

def sub(tree, rel, old, new, count=1):
    p = tree / rel
    t = p.read_text()
    assert t.count(old) == count, (rel, old, t.count(old))
    p.write_text(t.replace(old, new))

def copy(name):
    dst = out / name
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst, symlinks=True, ignore=shutil.ignore_patterns('build', '.cache', 'test-results'))
    return dst

# MU-FINE-CLIPGAIN: one extra component per trim/move commit (DetailClipGain memo removed).
t = copy('mu-fine-clipgain')
sub(t, 'app/components/arrangement/ArrangementDetailPanel.tsx',
    'const ArrangementDetailClipGain = memo(ArrangementDetailClipGainInner);',
    'const ArrangementDetailClipGain = ArrangementDetailClipGainInner;')

# MU-GROSS-PREVIEW: clip trim/move/fade preview goes through the provider (previewArrangement), not the drag-preview store.
t = copy('mu-gross-preview')
sub(t, 'app/components/arrangement/ArrangementClip.tsx',
    'const previewGeometry = previewClipGeometry ?? previewArrangement;',
    'const previewGeometry = previewClipGeometry ? previewArrangement : previewArrangement;')

# MU-COMBO: MixFader memo removed (two extra components per commit with lane faders) + flushSync around the trim/move release commit (an extra release commit). Orthogonal metrics: per-move/max vs release-commits.
t = copy('mu-combo')
sub(t, 'app/components/arrangement/ArrangementMixFader.tsx',
    'const ArrangementMixFader = memo(ArrangementMixFaderInner);',
    'const ArrangementMixFader = ArrangementMixFaderInner;')
sub(t, 'app/components/arrangement/ArrangementClip.tsx',
    "import { Film, GripVertical } from 'lucide-react';",
    "import { Film, GripVertical } from 'lucide-react';\nimport { flushSync } from 'react-dom';")
sub(t, 'app/components/arrangement/ArrangementClip.tsx',
    'const committed = commitArrangement(getArrangement(), label, gesture.before);',
    'const committed = flushSync(() => commitArrangement(getArrangement(), label, gesture.before));')
print('mutants ok', out)
