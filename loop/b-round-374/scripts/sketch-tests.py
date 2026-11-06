import sys, pathlib
root = pathlib.Path(sys.argv[1])
def edit(rel, pairs):
    p = root / rel
    s = p.read_text()
    for old, new, count in pairs:
        assert s.count(old) == count, (rel, old[:90], s.count(old))
        s = s.replace(old, new)
    p.write_text(s)

RB = 'app/lib/arrangement/__tests__/render-budget.test.tsx'
edit(RB, [
("""import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
""", """import { studioLibraryPanelStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
""", 1),
("""const CONTEXT_CONSUMERS = [
  'ArrangementTransport',
  'ArrangementRuler',
  'ArrangementLibrary',
  'ArrangementLane',
  'ArrangementDetailPanel',
] as const;
""", """const CONTEXT_CONSUMERS = [
  'ArrangementTransport',
  'ArrangementRuler',
  'ArrangementLane',
  'ArrangementDetailPanel',
] as const;
""", 1),
("""      for (const parent of ['ArrangementRuler', 'ArrangementLibrary', 'ArrangementLane']) {
        expect(renderLog.counts.get(parent) ?? 0).toBe(0);
      }
""", """      for (const parent of ['ArrangementRuler', 'ArrangementLibraryViewInner', 'ArrangementLane']) {
        expect(renderLog.counts.get(parent) ?? 0).toBe(0);
      }
""", 1),
("""      act(() => api.current?.resetExportState());
      for (const parent of ['ArrangementRuler', 'ArrangementLibrary', 'ArrangementLane']) {
        expect(renderLog.counts.get(parent) ?? 0).toBeGreaterThan(0);
      }
""", """      act(() => api.current?.resetExportState());
      for (const parent of ['ArrangementRuler', 'ArrangementLane']) {
        expect(renderLog.counts.get(parent) ?? 0).toBeGreaterThan(0);
      }
      expect(renderLog.counts.get('ArrangementLibraryViewInner') ?? 0).toBe(0);
""", 1),
("""    expect(countsOf(CONTEXT_CONSUMERS)).toEqual({
      ArrangementTransport: 0,
      ArrangementRuler: 0,
      ArrangementLibrary: 0,
      ArrangementLane: 0,
      ArrangementDetailPanel: 0,
    });
""", """    expect(countsOf(CONTEXT_CONSUMERS)).toEqual({
      ArrangementTransport: 0,
      ArrangementRuler: 0,
      ArrangementLane: 0,
      ArrangementDetailPanel: 0,
    });
    expect(renderLog.counts.get('ArrangementLibraryViewInner') ?? 0).toBe(0);
""", 1),
("""    expect(renderLog.counts.get('ArrangementLibrary') ?? 0).toBe(0);
    act(() => api.current?.resetExportState());
""", """    expect(renderLog.counts.get('ArrangementLibraryViewInner') ?? 0).toBe(0);
    act(() => api.current?.resetExportState());
""", 1),
("""    for (const name of CONTEXT_CONSUMERS) {
      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);
    }
""", """    for (const name of CONTEXT_CONSUMERS) {
      expect(renderLog.counts.get(name) ?? 0).toBeGreaterThan(0);
    }
    expect(renderLog.counts.get('ArrangementLibraryViewInner') ?? 0).toBe(0);
""", 1),
("""    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementMasterViewInner') ?? 0).toBe(0);
""", """    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementMasterViewInner') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementMaster') ?? 0).toBe(0);
""", 1),
("""  it('RB-MEMO3 a workspace commit""", """  it('RB-LEAF3 a lane mute, a zoom step and an Undo render neither the Library nor its preview; an active-lane change renders only the preview (PERF-11c-iii)', async () => {
    const { api, view } = await mountWorkspace();
    act(() => api.current?.selectSource('song'));
    act(() => api.current?.setActiveTrack('music'));
    const preview = view.getByTestId('arrangement-library-preview');
    const add = within(preview).getByRole('button', { name: studioLibraryPanelStrings.add });
    expect(add.getAttribute('aria-disabled')).toBeNull();
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackMute('music'));
    act(() => api.current?.setPxPerSecond((api.current?.pxPerSecond ?? 20) * 2));
    act(() => api.current?.undo());
    expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
    expect(renderLog.counts.get('ArrangementLibraryViewInner') ?? 0).toBe(0);
    expect(renderLog.counts.get('ArrangementLibraryPreviewViewInner') ?? 0).toBe(0);
    renderLog.counts.clear();
    act(() => api.current?.setActiveTrack('video'));
    expect(renderLog.counts.get('ArrangementLibraryPreviewViewInner') ?? 0).toBe(1);
    expect(renderLog.counts.get('ArrangementLibraryViewInner') ?? 0).toBe(0);
    expect(add.getAttribute('aria-disabled')).toBe('true');
    expect(add.getAttribute('title')).toBe(studioLibraryPanelStrings.addNeedsAudioTrackTitle);
    act(() => api.current?.setActiveTrack('music'));
    expect(add.getAttribute('aria-disabled')).toBeNull();
    renderLog.counts.clear();
    act(() => api.current?.selectSource('hit'));
    expect(renderLog.counts.get('ArrangementLibraryViewInner') ?? 0).toBe(1);
    expect(within(preview).getByText('Hit')).toBeTruthy();
  });

  it('RB-MEMO3 a workspace commit""", 1),
])

DP = 'app/lib/arrangement/__tests__/drag-preview-render.test.tsx'
edit(DP, [("rendersOf('ArrangementLibrary'))", "rendersOf('ArrangementLibraryViewInner'))", 4)])

LP = 'app/lib/arrangement/__tests__/library-preview.test.tsx'
edit(LP, [("expect(renderLog.counts.get('ArrangementLibraryPreview') ?? 0).toBeGreaterThanOrEqual(10);",
           "expect(renderLog.counts.get('ArrangementLibraryPreviewViewInner') ?? 0).toBeGreaterThanOrEqual(10);", 1)])
print('tests ok')
