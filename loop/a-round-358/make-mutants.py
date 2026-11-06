"""A round 358: M-B1..M-B6 on scratch copies of A's round-358 tree (git archive HEAD + working diff + untracked files)."""
import os, shutil, subprocess, sys
STORE = '/home/runner/czaba-project/store'
BASE = sys.argv[1]
SC = os.path.join(BASE, 'sc')
MU = os.path.join(BASE, 'mu')

def make_base():
    os.makedirs(SC, exist_ok=True)
    arch = subprocess.run(['git', 'archive', 'HEAD'], cwd=STORE, capture_output=True, check=True).stdout
    subprocess.run(['tar', '-x', '-C', SC], input=arch, check=True)
    diff = subprocess.run(['git', 'diff', '--binary'], cwd=STORE, capture_output=True, check=True).stdout
    subprocess.run(['git', 'apply', '-'], cwd=SC, input=diff, check=True)
    untracked = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], cwd=STORE, capture_output=True, text=True, check=True).stdout.split()
    for rel in untracked:
        dst = os.path.join(SC, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(os.path.join(STORE, rel), dst)
    print('base ok, untracked', len(untracked))

def build(mid, path, old, new):
    d = os.path.join(MU, mid)
    subprocess.run(['rsync', '-a', '--delete', SC + '/', d + '/'], check=True)
    os.symlink(os.path.join(STORE, 'node_modules'), os.path.join(d, 'node_modules'))
    p = os.path.join(d, path); s = open(p).read()
    assert s.count(old) == 1, (mid, old)
    open(p, 'w').write(s.replace(old, new))
    print(mid, 'ok')
    return d

make_base()
os.makedirs(MU, exist_ok=True)
d1 = build('m-b1', 'app/contexts/ArrangementContext.tsx',
      '  const [playbackStore] = useState(() => createArrangementPlaybackStore());\n',
      '  const [playbackStore] = useState(() => createArrangementPlaybackStore());\n  const playingMutant = useStore(playbackStore, (state) => state.isPlaying);\n')
p = os.path.join(d1, 'app/contexts/ArrangementContext.tsx'); s = open(p).read()
old = '      selectedSourceId,\n      activeTrackId,\n      pxPerSecond,\n'
idx = [i for i in range(len(s)) if s.startswith(old, i)]
assert len(idx) == 2, len(idx)
i = idx[1]; s = s[:i] + '      selectedSourceId,\n      activeTrackId,\n      playingMutant,\n      pxPerSecond,\n' + s[i + len(old):]
open(p, 'w').write(s)
build('m-b2', 'app/components/arrangement/StudioWorkspace.tsx',
      '  const workspace = useArrangement();\n', '  const workspace = useArrangement();\n  useArrangementIsPlaying();\n')
build('m-b3', 'app/components/arrangement/StudioWorkspace.tsx',
      '    committedRef.current = isPlaying;\n', '')
d4 = build('m-b4', 'app/components/arrangement/StudioWorkspace.tsx',
      '            ? current.describeSpaceStart()\n            : text,\n', '            ? current.describeSpaceStart()\n            : current.describeSpaceStart(),\n')
p = os.path.join(d4, 'app/components/arrangement/StudioWorkspace.tsx'); s4 = open(p).read()
cond = 'if (insertMarkerStatusKind(shownStatus) === null && shownStatus !== FOLLOW_PAUSED_MESSAGE) {'
assert s4.count(cond) == 1
open(p, 'w').write(s4.replace(cond, 'if (shownStatus === null) {'))
print('m-b4 early return removed')
build('m-b5', 'app/components/arrangement/StudioWorkspace.tsx',
      '  useEffect(() => {\n    syncFollowWithPlayback(committedIsPlayingRef.current, true);\n  }, [syncFollowWithPlayback]);\n', '')
build('m-b6', 'app/components/arrangement/StudioWorkspace.tsx',
      '        if (previewText !== null || atMount) {\n', '        if (previewText !== null) {\n')
