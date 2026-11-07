import sys
p=sys.argv[1]+'/app/lib/arrangement/__tests__/render-budget.test.tsx'
s=open(p).read()
imp="import { createArrangement } from '../model';\n"
assert s.count(imp)==1
s=s.replace(imp,"import { addMarker } from '../markers';\n"+imp)
anchor="  it('RB-MEMO3 a workspace commit re-renders the workspace and not the range readout;"
assert s.count(anchor)==1
row='''  it('RB-LEAF6 a lane mute, a Master mute and their Undo do not render the marker row; a marker edit, its Undo and a zoom step do (PERF-11c-iii-c2b)', async () => {
    const { api, raw, view } = await mountWorkspace();
    const before = raw.current?.getArrangement();
    if (!before) {
      throw new Error('workspace not mounted');
    }
    const added = addMarker(before, 1, 'Intro');
    const next = added.arrangement;
    if (next === null) {
      throw new Error('marker not added');
    }
    renderLog.counts.clear();
    act(() => raw.current?.commitArrangement(next, 'Add Marker', before));
    expect(renderLog.counts.get('ArrangementMarkerRowViewInner') ?? 0).toBe(1);
    expect(view.getByTestId('arrangement-marker-strip').textContent).toContain('Intro');
    const markers = api.current?.arrangement.markers;
    expect(markers?.length).toBe(1);
    for (const commit of [
      () => api.current?.toggleTrackMute('music'),
      () => api.current?.toggleMasterMute(),
      () => api.current?.undo(),
      () => api.current?.undo(),
    ]) {
      renderLog.counts.clear();
      act(() => {
        commit();
      });
      expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementMarkerRowViewInner') ?? 0).toBe(0);
      expect(api.current?.arrangement.markers).toBe(markers);
    }
    renderLog.counts.clear();
    fireEvent.click(view.getByRole('button', { name: 'Play' }));
    expect(api.current?.isPlaying).toBe(true);
    fireEvent.click(view.getByRole('button', { name: 'Stop' }));
    expect(api.current?.isPlaying).toBe(false);
    act(() => api.current?.setTimeRange({ start: 2, end: 4, trackId: 'music' }));
    expect(renderLog.counts.get('ArrangementMarkerRowViewInner') ?? 0).toBe(0);
    const current = raw.current?.getArrangement();
    if (!current) {
      throw new Error('workspace not mounted');
    }
    const projectEnd = raw.current?.projectEnd;
    const longer = {
      ...current,
      clips: current.clips.map((clip) =>
        clip.id === 'music-1' ? { ...clip, duration: 40 } : clip,
      ),
    };
    renderLog.counts.clear();
    act(() => raw.current?.commitArrangement(longer, 'Trim Clip', current));
    expect(raw.current?.projectEnd).not.toBe(projectEnd);
    expect(api.current?.arrangement.markers).toBe(markers);
    expect(renderLog.counts.get('ArrangementMarkerRowViewInner') ?? 0).toBe(1);
    act(() => api.current?.undo());
    act(() => api.current?.setTimeRange(null));
    renderLog.counts.clear();
    act(() => api.current?.setPxPerSecond((api.current?.pxPerSecond ?? 20) * 2));
    expect(renderLog.counts.get('ArrangementMarkerRowViewInner') ?? 0).toBe(1);
    renderLog.counts.clear();
    act(() => api.current?.undo());
    expect(api.current?.arrangement.markers ?? []).toHaveLength(0);
    expect(renderLog.counts.get('ArrangementMarkerRowViewInner') ?? 0).toBe(1);
    expect(view.getByTestId('arrangement-marker-strip').textContent).not.toContain('Intro');
    fireEvent.keyDown(document.body, { key: 'm', code: 'KeyM' });
    expect(view.getByTestId('arrangement-marker-name-input')).toBe(document.activeElement);
  });

'''
s=s.replace(anchor,row+anchor)
open(p,'w').write(s)
print('ok')
