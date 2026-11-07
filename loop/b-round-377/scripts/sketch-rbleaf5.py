import sys
p=sys.argv[1]+'/app/lib/arrangement/__tests__/render-budget.test.tsx'
s=open(p).read()
anchor="  it('RB-MEMO3 a workspace commit re-renders the workspace and not the range readout;"
assert s.count(anchor)==1
row='''  it('RB-LEAF5 a lane mute, a Master mute and an Undo do not render the loop brace; a loop toggle and a zoom step do (PERF-11c-iii-c2a)', async () => {
    const { api, view } = await mountWorkspace();
    act(() => api.current?.setTimeRange({ start: 2, end: 4, trackId: 'music' }));
    act(() => api.current?.toggleLoopSelection());
    const loop = api.current?.arrangement.loop ?? null;
    expect(loop).not.toBeNull();
    expect(view.getByTestId('arrangement-loop-brace').getAttribute('data-loop-enabled')).toBe('true');
    for (const commit of [
      () => api.current?.toggleTrackMute('music'),
      () => api.current?.toggleMasterMute(),
      () => api.current?.undo(),
    ]) {
      renderLog.counts.clear();
      act(() => {
        commit();
      });
      expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementLoopBraceViewInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementLoopBrace') ?? 0).toBe(0);
      expect(api.current?.arrangement.loop).toBe(loop);
    }
    renderLog.counts.clear();
    act(() => api.current?.setPxPerSecond((api.current?.pxPerSecond ?? 20) * 2));
    expect(renderLog.counts.get('ArrangementLoopBraceViewInner') ?? 0).toBe(1);
    renderLog.counts.clear();
    act(() => api.current?.toggleLoopSelection());
    expect(api.current?.arrangement.loop?.enabled).toBe(false);
    expect(renderLog.counts.get('ArrangementLoopBraceViewInner') ?? 0).toBe(1);
    expect(view.getByTestId('arrangement-loop-brace').getAttribute('data-loop-enabled')).toBe('false');
  });

'''
s=s.replace(anchor,row+anchor)
open(p,'w').write(s); print('ok')
