"""B round 356: build the three named mutants of the PERF-10a sketch under /home/runner/b356-scratch/mu/<id>."""
import os, subprocess, sys
SC = '/home/runner/b356-scratch/sc'
MU = '/home/runner/b356-scratch/mu'
def build(mid, path, old, new):
    d = os.path.join(MU, mid)
    subprocess.run(['rsync', '-a', '--delete', '--exclude', 'node_modules', '--exclude', '.git', '--exclude', 'build', '--exclude', 'test-results', SC + '/', d + '/'], check=True)
    if not os.path.exists(os.path.join(d, 'node_modules')):
        os.symlink('/home/runner/czaba-project/store/node_modules', os.path.join(d, 'node_modules'))
    p = os.path.join(d, path); s = open(p).read()
    assert s.count(old) == 1, (mid, old)
    open(p, 'w').write(s.replace(old, new))
    print(mid, 'ok')
build('m-b1', 'app/contexts/ArrangementContext.tsx',
      '  const [playbackStore] = useState(() => createArrangementPlaybackStore());\n',
      '  const [playbackStore] = useState(() => createArrangementPlaybackStore());\n  const playingMutant = useStore(playbackStore, (state) => state.isPlaying);\n')
p = os.path.join(MU, 'm-b1', 'app/contexts/ArrangementContext.tsx'); s = open(p).read()
old = '      selectedSourceId,\n      activeTrackId,\n      pxPerSecond,\n'
idx = [i for i in range(len(s)) if s.startswith(old, i)]
assert len(idx) == 2, len(idx)
i = idx[1]; s = s[:i] + '      selectedSourceId,\n      activeTrackId,\n      playingMutant,\n      pxPerSecond,\n' + s[i + len(old):]
open(p, 'w').write(s)
build('m-b2', 'app/components/arrangement/StudioWorkspace.tsx',
      '  const workspace = useArrangement();\n', '  const workspace = useArrangement();\n  useArrangementIsPlaying();\n')
build('m-b3', 'app/components/arrangement/StudioWorkspace.tsx',
      '    committedRef.current = isPlaying;\n', '')
build('m-b4', 'app/components/arrangement/StudioWorkspace.tsx',
      '            ? current.describeSpaceStart()\n            : text,\n', '            ? current.describeSpaceStart()\n            : current.describeSpaceStart(),\n')
p = os.path.join(MU, 'm-b4', 'app/components/arrangement/StudioWorkspace.tsx'); s4 = open(p).read()
cond = 'if (insertMarkerStatusKind(shownStatus) === null && shownStatus !== FOLLOW_PAUSED_MESSAGE) {'
assert s4.count(cond) == 1
open(p, 'w').write(s4.replace(cond, 'if (shownStatus === null) {'))
print('m-b4 early return removed')
