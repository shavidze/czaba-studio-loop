import sys
root = sys.argv[1] + '/app/lib/arrangement/__tests__/'
def edit(name, pairs):
    p = root + name; s = open(p).read()
    for old, new, n in pairs:
        assert s.count(old) == n, (name, old[:90], s.count(old))
        s = s.replace(old, new)
    open(p, 'w').write(s)

V = 'ArrangementTransportViewInner'
edit('render-budget.test.tsx', [
  ("const CONTEXT_CONSUMERS = [\n  'ArrangementTransport',\n", "const CONTEXT_CONSUMERS = [\n  'StudioWorkspace',\n", 1),
  ("    expect(countsOf(CONTEXT_CONSUMERS)).toEqual({\n      ArrangementTransport: 0,\n",
   "    expect(countsOf(CONTEXT_CONSUMERS)).toEqual({\n      StudioWorkspace: 0,\n", 1),
  ("    for (const name of CONTEXT_CONSUMERS) {\n      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);\n    }\n",
   "    for (const name of CONTEXT_CONSUMERS) {\n      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);\n    }\n    expect(renderLog.counts.get('%s') ?? 0).toBe(0);\n" % V, 1),
  ("expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBe(0);", "expect(renderLog.counts.get('%s') ?? 0).toBe(0);" % V, 3),
  ("        'StudioWorkspace',\n        'ArrangementTransport',\n", "        'StudioWorkspace',\n        '%s',\n" % V, 1),
  ("      StudioWorkspace: 0,\n      ArrangementTransport: 0,\n", "      StudioWorkspace: 0,\n      %s: 0,\n" % V, 1),
  ("  it('RB-MEMO3 a workspace commit", '''  it('RB-LEAF4 the transport renders only the group whose input changed (PERF-11c-iii-c1)', async () => {
    const { api, view } = await mountWorkspace();
    for (const name of TRANSPORT_LEAVES) {
      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);
    }
    renderLog.counts.clear();
    act(() => api.current?.resetExportState());
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(countsOf(TRANSPORT_LEAVES)).toEqual(TRANSPORT_STEP_COUNTS.reset);
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackMute('music'));
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(countsOf(TRANSPORT_LEAVES)).toEqual(TRANSPORT_STEP_COUNTS.mute);
    expect(view.getByTestId('arrangement-transport-edit').textContent).toContain('Undo:');
    renderLog.counts.clear();
    const zoomBefore = view.getByTestId('arrangement-zoom-readout').textContent;
    act(() => api.current?.setPxPerSecond((api.current?.pxPerSecond ?? 20) * 2));
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(countsOf(TRANSPORT_LEAVES)).toEqual(TRANSPORT_STEP_COUNTS.zoom);
    expect(view.getByTestId('arrangement-zoom-readout').textContent).not.toBe(zoomBefore);
    renderLog.counts.clear();
    act(() => api.current?.setTimeRange({ start: 2, end: 4, trackId: 'music' }));
    expect(countsOf(TRANSPORT_LEAVES)).toEqual(TRANSPORT_STEP_COUNTS.range);
    renderLog.counts.clear();
    act(() => api.current?.toggleLoopSelection());
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(countsOf(TRANSPORT_LEAVES)).toEqual(TRANSPORT_STEP_COUNTS.loop);
    expect(view.getByRole('button', { name: 'Loop' }).getAttribute('aria-pressed')).toBe('true');
    act(() => api.current?.setTimeRange(null));
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackMute('music'));
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(countsOf(TRANSPORT_LEAVES)).toEqual(TRANSPORT_STEP_COUNTS.mute);
    renderLog.counts.clear();
    act(() => api.current?.undo());
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(countsOf(TRANSPORT_LEAVES)).toEqual(TRANSPORT_STEP_COUNTS.undo);
    expect(view.getByTestId('arrangement-transport-edit').textContent).toContain('Redo:');
  });

  it('RB-MEMO3 a workspace commit''', 1),
  ("const CONTEXT_CONSUMERS = [", '''const TRANSPORT_LEAVES = [
  'ArrangementTransportViewInner',
  'ArrangementTransportEditGroupInner',
  'ArrangementTransportCentreGroupInner',
  'ArrangementTransportViewGroupInner',
] as const;

const TRANSPORT_STEP_COUNTS = {
  reset: { ArrangementTransportViewInner: 0, ArrangementTransportEditGroupInner: 0, ArrangementTransportCentreGroupInner: 0, ArrangementTransportViewGroupInner: 0 },
  mute: { ArrangementTransportViewInner: 1, ArrangementTransportEditGroupInner: 1, ArrangementTransportCentreGroupInner: 0, ArrangementTransportViewGroupInner: 0 },
  zoom: { ArrangementTransportViewInner: 1, ArrangementTransportEditGroupInner: 0, ArrangementTransportCentreGroupInner: 0, ArrangementTransportViewGroupInner: 1 },
  range: { ArrangementTransportViewInner: 0, ArrangementTransportEditGroupInner: 1, ArrangementTransportCentreGroupInner: 1, ArrangementTransportViewGroupInner: 1 },
  loop: { ArrangementTransportViewInner: 1, ArrangementTransportEditGroupInner: 1, ArrangementTransportCentreGroupInner: 1, ArrangementTransportViewGroupInner: 0 },
  undo: { ArrangementTransportViewInner: 1, ArrangementTransportEditGroupInner: 1, ArrangementTransportCentreGroupInner: 0, ArrangementTransportViewGroupInner: 0 },
} as const;

const CONTEXT_CONSUMERS = [''', 1),
])
edit('selection-wrappers-render.test.tsx', [
  ("      act(() => live(api).resetExportState());\n      expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0);",
   "      act(() => live(api).resetExportState());\n      expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);", 2),
  ("expect(renderLog.counts.get('ArrangementTransport') ?? 0).toBe(0);", "expect(renderLog.counts.get('%s') ?? 0).toBe(0);" % V, 1),
  ("""      const { api, view } = await mountCollapsedGroup();
      renderLog.counts.clear();
      act(() => live(api).setStatus('GH1 positive control'));""",
   """      const { api, view } = await mountCollapsedGroup();
      expect(renderLog.counts.get('%s') ?? 0).toBeGreaterThan(0);
      renderLog.counts.clear();
      act(() => live(api).setStatus('GH1 positive control'));""" % V, 1),
])
edit('drag-preview-render.test.tsx', [
  ("expect(rendersOf('ArrangementTransport')).toBe(0);", "expect(rendersOf('%s')).toBe(0);" % V, 5),
  ("""    expect(rendersOf('ArrangementProjectEndTextInner')).toBeGreaterThan(0);
    renderLog.counts.clear();
    act(() => live(api).selectClip('c1'));
    expect(rendersOf('ArrangementTransport')).toBeGreaterThan(0);""",
   """    expect(rendersOf('ArrangementProjectEndTextInner')).toBeGreaterThan(0);
    expect(rendersOf('%s')).toBeGreaterThan(0);
    renderLog.counts.clear();
    act(() => live(api).selectClip('c1'));
    expect(rendersOf('ArrangementTransportEditGroupInner')).toBeGreaterThan(0);
    expect(rendersOf('%s')).toBe(0);""" % (V, V), 1),
  ("""    act(() => live(api).selectClip(null));
    expect(rendersOf('ArrangementTransport')).toBeGreaterThan(0);""",
   """    act(() => live(api).selectClip(null));
    expect(rendersOf('ArrangementTransportEditGroupInner')).toBeGreaterThan(0);
    expect(rendersOf('%s')).toBe(0);""" % V, 1),
])
print('ok')
