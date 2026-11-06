import sys
root=sys.argv[1]+'/app/lib/arrangement/__tests__/'
def edit(path, pairs):
    p=root+path; s=open(p).read()
    for old,new,cnt in pairs:
        n=s.count(old); assert n==cnt,(path,old[:70],n); s=s.replace(old,new)
    open(p,'w').write(s)
edit('render-budget.test.tsx',[
("""      act(() => api.current?.setStatus('Positive control'));
      for (const parent of ['ArrangementRuler', 'ArrangementLibrary', 'ArrangementLane']) {""",
"""      act(() => api.current?.resetExportState());
      for (const parent of ['ArrangementRuler', 'ArrangementLibrary', 'ArrangementLane']) {""",1),
("""    act(() => api.current?.setStatus('Positive control'));
    expect(api.current).not.toBe(valueAtPlay);
    expect(raw.current).not.toBe(rawAtPlay);""",
"""    act(() => api.current?.resetExportState());
    expect(api.current).not.toBe(valueAtPlay);
    expect(raw.current).not.toBe(rawAtPlay);""",1),
("""  it('RB-MEMO3 a status write re-renders the workspace and not the range readout (C-R320-01)', async () => {""",
"""  it('RB-MEMO3 a workspace commit re-renders the workspace and not the range readout; a status write renders only the status text (C-R320-01, SIG-R360)', async () => {""",1),
("""    act(() => api.current?.setStatus('Memo control one'));
    act(() => api.current?.setStatus('Memo control two'));
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementRangeReadoutInner') ?? 0).toBe(0);
  });""",
"""    act(() => api.current?.resetExportState());
    act(() => api.current?.resetExportState());
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementRangeReadoutInner') ?? 0).toBe(0);
    renderLog.counts.clear();
    act(() => api.current?.setStatus('Memo control one'));
    act(() => api.current?.setStatus('Memo control two'));
    expect(view.getByTestId('arrangement-status').textContent).toContain('Memo control two');
    expect(renderLog.counts.get('ArrangementStatusTextInner') ?? 0).toBe(2);
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementRangeReadoutInner') ?? 0).toBe(0);
  });""",1),
])
edit('selection-wrappers-render.test.tsx',[
("""      act(() => live(api).setStatus('Positive control'));
      expect(view.getByTestId('arrangement-status').textContent).toContain('Positive control');
      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);""",
"""      act(() => live(api).resetExportState());
      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);""",1),
("""      act(() => live(api).setStatus('GH1 positive control'));
      expect(view.getByTestId('arrangement-status').textContent).toContain('GH1 positive control');
      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBe(0);""",
"""      act(() => live(api).setStatus('GH1 positive control'));
      expect(view.getByTestId('arrangement-status').textContent).toContain('GH1 positive control');
      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBe(0);
      act(() => live(api).resetExportState());
      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBe(0);""",1),
])
edit('selection-wrappers-render.test.tsx',[
("""      renderLog.counts.clear();
      act(() => live(api).resetExportState());
      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
    },""","""      renderLog.counts.clear();
      act(() => live(api).setStatus('Positive control'));
      expect(view.getByTestId('arrangement-status').textContent).toContain('Positive control');
      act(() => live(api).resetExportState());
      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
    },""",1)])
