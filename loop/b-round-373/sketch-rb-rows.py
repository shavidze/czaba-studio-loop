# B round 373 -> 374 sketch: render-budget rows RB-LEAF1 (Master) and RB-LEAF2 (closed Export dialog). Run from the tree root.
p = 'app/lib/arrangement/__tests__/render-budget.test.tsx'
s = open(p).read()
anchor = "  it('RB-MEMO3 a workspace commit re-renders the workspace"
assert s.count(anchor) == 1
rows = """  it('RB-LEAF1 a lane commit or a zoom step does not render the Master strip; a Master mute does (PERF-11c-iii)', async () => {
    const { api, view } = await mountWorkspace();
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackMute('music'));
    act(() => api.current?.setPxPerSecond((api.current?.pxPerSecond ?? 20) * 2));
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementMasterViewInner') ?? 0).toBe(0);
    renderLog.counts.clear();
    act(() => api.current?.toggleMasterMute());
    expect(renderLog.counts.get('ArrangementMasterViewInner') ?? 0).toBe(1);
    expect(
      within(view.getByTestId('arrangement-master'))
        .getByRole('button', { name: 'Master Mute' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('RB-LEAF2 the closed Export dialog renders nothing on a lane commit; opening mounts its content (PERF-11c-iii)', async () => {
    const { api, view } = await mountWorkspace();
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackMute('music'));
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementExportDialogShell') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementExportDialogContent') ?? 0).toBe(0);
    expect(view.queryByRole('dialog')).toBeNull();
    renderLog.counts.clear();
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    expect(renderLog.counts.get('ArrangementExportDialogContent') ?? 0).toBeGreaterThan(0);
  });

"""
s = s.replace(anchor, rows + anchor)
open(p, 'w').write(s)
print('ok')
