# B round 407 -> 408: PERF-11c-iii-e-i sketch (actions +23 Lane callbacks; livePosition -> getLivePosition; Lane reads callbacks from actions).
import re, sys
root = sys.argv[1]
NEW = sorted("previewClipGeometry previewStatus selectClip toggleClipSelection getSelectedClipIds setTimeRange setActiveTrack setInsertMarker toggleTrackMute toggleTrackSolo previewTrackVolume commitTrackVolume beginTrackVolumeGesture blurTrackVolume setTrackPan beginTrackPanGesture previewTrackPan commitTrackPan cancelTrackPan importVideoFiles getLibraryDragSource dropLibrarySource setClipLaneDrag".split())
assert len(NEW) == 23
p = root + '/app/contexts/ArrangementContext.tsx'
s = open(p).read()
# 1. rename internal livePosition -> getLivePosition (identifier only)
n = len(re.findall(r'\blivePosition\b', s))
assert n == 13, n
s = s.replace('getLivePosition: livePosition,', 'getLivePosition,')
assert len(re.findall(r'getLivePosition: ', s)) == 1  # the interface member l.361
s = re.sub(r'\blivePosition\b', 'getLivePosition', s)
# 2. Pick keys
m = re.search(r"type ArrangementActions = Pick<\n  ArrangementContextValue,\n((?:  \| '[A-Za-z]+'\n)+)>;", s)
keys = re.findall(r"'([A-Za-z]+)'", m.group(1))
assert len(keys) == 36, len(keys)
allk = sorted(set(keys) | set(NEW))
assert len(allk) == 59
s = s[:m.start(1)] + ''.join(f"  | '{k}'\n" for k in allk) + s[m.end(1):]
# 3. actions memo object + deps
m = re.search(r"  const actions = useMemo<ArrangementActions>\(\n    \(\) => \(\{\n((?:      [A-Za-z]+,\n)+)    \}\),\n    \[\n((?:      [A-Za-z]+,\n)+)    \],\n  \);", s)
assert m, 'actions memo'
obj = re.findall(r'([A-Za-z]+),', m.group(1)); deps = re.findall(r'([A-Za-z]+),', m.group(2))
assert obj == keys, (obj, keys)
assert sorted(deps) == sorted(keys), 'deps'
body = ''.join(f'      {k},\n' for k in allk)
s = s[:m.start(1)] + body + s[m.end(1):m.start(2)] + body + s[m.end(2):]
open(p, 'w').write(s)
# 4. Lane
p = root + '/app/components/arrangement/ArrangementLane.tsx'
s = open(p).read()
old_start = s.index('  const {\n    arrangement,\n    collection,')
old_end = s.index('  } = useArrangement();\n', old_start) + len('  } = useArrangement();\n')
block = s[old_start:old_end]
names = re.findall(r'^    ([A-Za-z]+),$', block, re.M)
assert len(names) == 35, len(names)
DATA = ['arrangement', 'collection', 'sourcePeaks', 'sourceDurations', 'pxPerSecond', 'videoSources']
assert all(d in names for d in DATA)
cbs = [x for x in names if x not in DATA]
assert len(cbs) == 29, len(cbs)
assert set(cbs) <= set(allk), set(cbs) - set(allk)
new_block = '  const { ' + ', '.join(DATA) + ' } = useArrangement();\n  const {\n' + ''.join(f'    {c},\n' for c in cbs) + '  } = useArrangementActions();\n'
s = s[:old_start] + new_block + s[old_end:]
imp = re.search(r"import \{([^}]*)\} from '~/contexts/ArrangementContext';", s)
items = [x.strip() for x in imp.group(1).split(',') if x.strip()]
assert 'useArrangementActions' not in items
items.append('useArrangementActions')
items.sort(key=lambda x: x.replace('type ', '').lower())
s = s[:imp.start()] + "import {\n" + ''.join(f'  {x},\n' for x in items) + "} from '~/contexts/ArrangementContext';" + s[imp.end():]
open(p, 'w').write(s)
print('ok')
