# B round 407 -> 408: PERF-11c-iii-e-i test sketch (AC7 keys from the Pick source, no count literal; AC8 lane paths).
import sys
p = sys.argv[1] + '/app/lib/arrangement/__tests__/actions-context.test.tsx'
s = open(p).read()
def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:80], s.count(old))
    s = s.replace(old, new)
rep("""const ACTION_KEY_COUNT = 36;
""", """const CONTEXT_SOURCE = resolve(__dirname, '../../../contexts/ArrangementContext.tsx');
const ACTIONS_PICK = /type ArrangementActions = Pick<\\s*ArrangementContextValue,([^>]*)>;/;

function declaredActionKeys(): string[] {
  const match = ACTIONS_PICK.exec(readFileSync(CONTEXT_SOURCE, 'utf8'));
  if (match === null) {
    throw new Error('ArrangementActions Pick not found');
  }
  return [...match[1].matchAll(/'([A-Za-z]+)'/g)].map((key) => key[1]).sort();
}
""")
rep("""and hands out all 36 provider callbacks (C-R404-A-AC1-COVERAGE)""", """and hands out every provider callback the ArrangementActions Pick declares (C-R404-A-AC1-COVERAGE, TL-R406-SK-L1)""")
rep("""    const entries = Object.entries(currentActions(probe));
    expect(entries).toHaveLength(ACTION_KEY_COUNT);
""", """    const entries = Object.entries(currentActions(probe));
    const declared = declaredActionKeys();
    expect(declared.length).toBeGreaterThan(0);
    expect(entries.map(([key]) => key).sort()).toEqual(declared);
""")
rep("""  it('AC6 throws a named error outside the provider', () => {""", """  it('AC8 keeps one actions object across the lane paths: solo, a volume and a pan commit, a clip selection, a time range, the active track and the insert marker (PERF-11c-iii-e-i)', async () => {
    const probe = await mountProbe();
    const actions = currentActions(probe);
    const music = () => currentValue(probe).arrangement.tracks.find((track) => track.id === 'music');
    act(() => actions.toggleTrackSolo('music', false));
    expect(music()?.solo).toBe(true);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.previewTrackVolume('music', 0.5));
    act(() => actions.commitTrackVolume('music'));
    expect(music()?.volume).toBe(0.5);
    expect(currentActions(probe)).toBe(actions);
    act(() => {
      actions.setTrackPan('music', 0.5);
    });
    expect(music()?.pan).toBe(0.5);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.selectClip('music-1'));
    expect(actions.getSelectedClipIds()).toEqual(['music-1']);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.setTimeRange({ start: 1, end: 3, trackId: 'music' }));
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.setActiveTrack('video'));
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.setInsertMarker(4));
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.undo());
    expect(music()?.pan ?? 0).toBe(0);
    expect(currentActions(probe)).toBe(actions);
  });

  it('AC6 throws a named error outside the provider', () => {""")
open(p, 'w').write(s)
print('ok')
