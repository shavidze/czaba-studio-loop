"""Append SS8-SS11 (PERF-10b-i rows) to selection-store.test.tsx in a scratch. Run after apply-sketch.py."""
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / 'app/lib/arrangement/__tests__/selection-store.test.tsx'
t = p.read_text(encoding='utf-8')
t = t.replace("""  useArrangement,
  useArrangementSelection,
  useArrangementSelectionStore,
} from '~/contexts/ArrangementContext';""", """  useArrangement,
  useArrangementActiveTrackId,
  useArrangementSelection,
  useArrangementSelectionStore,
} from '~/contexts/ArrangementContext';""", 1)
t = t.replace("""async function settle() {""", """function ActiveTrackProbe({ seen, count }: { seen: { id: string | null }; count: RenderCount }) {
  seen.id = useArrangementActiveTrackId();
  count.renders += 1;
  return null;
}

async function settle() {""", 1)
t = t.rstrip() + """

describe('PERF-10b-i active track in the selection store', () => {
  async function mountActiveTrackProbes() {
    const api: SelectionApiRef = { current: null };
    const contextCount: RenderCount = { renders: 0 };
    const activeCount: RenderCount = { renders: 0 };
    const seen: { id: string | null } = { id: null };
    render(
      <ArrangementProvider
        collection={selectionCollection}
        initialArrangement={selectionArrangement()}
      >
        <ContextOnlyProbe api={api} count={contextCount} />
        <ActiveTrackProbe seen={seen} count={activeCount} />
      </ArrangementProvider>,
    );
    await settle();
    return { api, contextCount, activeCount, seen };
  }

  it('SS8: changing the active track re-renders its subscriber once and not the context consumer', async () => {
    const probes = await mountActiveTrackProbes();
    const contextBefore = probes.contextCount.renders;
    const activeBefore = probes.activeCount.renders;
    act(() => liveApi(probes.api).setActiveTrack('sfx'));
    expect(probes.seen.id).toBe('sfx');
    expect(probes.activeCount.renders).toBe(activeBefore + 1);
    expect(probes.contextCount.renders).toBe(contextBefore);
  });

  it('SS9: setting the same active track does not notify store listeners', () => {
    const store = createArrangementSelectionStore(NO_SELECTION, 'music');
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.getState().setActiveTrackId('music');
    expect(listener).not.toHaveBeenCalled();
    store.getState().setActiveTrackId('sfx');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().activeTrackId).toBe('sfx');
    unsubscribe();
  });

  it('SS10: the initial active track is the first audio track, not the first track', async () => {
    const probes = await mountActiveTrackProbes();
    expect(probes.seen.id).toBe('music');
  });

  it('SS11: a paste right after an active-track change in the same event lands on the new track', async () => {
    const probes = await mountActiveTrackProbes();
    act(() => liveApi(probes.api).selectClip('m1'));
    act(() => liveApi(probes.api).copySelection());
    act(() => {
      liveApi(probes.api).setActiveTrack('sfx');
      liveApi(probes.api).pasteClipboard();
    });
    const pasted = liveApi(probes.api)
      .getArrangement()
      .clips.filter((clip) => clip.id !== 'm1' && clip.id !== 'm2');
    expect(pasted.map((clip) => clip.trackId)).toEqual(['sfx']);
  });
});
"""
p.write_text(t, encoding='utf-8')
print('SS8-SS11 appended')
