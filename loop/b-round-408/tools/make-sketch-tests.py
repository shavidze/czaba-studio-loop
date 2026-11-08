# B round 408 -> 409: adds RB-LEAF7 / RB-LEAF8 to render-budget.test.tsx in scratch S (argv[1]).
import sys
S = sys.argv[1]
p = f'{S}/app/lib/arrangement/__tests__/render-budget.test.tsx'
src = open(p).read()
anchor = "  it('RB-MEMO3 a workspace commit re-renders the workspace and not the range readout;"
assert src.count(anchor) == 1
imp_old = "import { studioLibraryPanelStrings } from '~/lib/arrangement/strings';"
assert src.count(imp_old) == 1
src = src.replace(imp_old, "import { studioClipStrings, studioLibraryPanelStrings } from '~/lib/arrangement/strings';")
rows = r"""  function laneHeader(view: ReturnType<typeof render>, trackId: string): HTMLElement {
    const lane = view.container.querySelector<HTMLElement>(`[data-track-id="${trackId}"]`);
    if (!lane) {
      throw new Error(`lane ${trackId} not mounted`);
    }
    return within(lane).getByTestId('arrangement-track-header');
  }

  function laneButtonPressed(
    view: ReturnType<typeof render>,
    trackId: string,
    name: RegExp,
  ): string | null {
    return within(laneHeader(view, trackId)).getByRole('button', { name }).getAttribute('aria-pressed');
  }

  it('RB-LEAF7 a lane mute, its Undo, a clip move inside the project length and a pan commit render only the lane they change; a zoom step renders every lane; an exclusive solo renders only the lanes whose Solo flips (PERF-11c-iii-e-ii)', async () => {
    const { api, raw, view } = await mountWorkspace();
    const inner = () => renderLog.counts.get('ArrangementLaneViewInner') ?? 0;
    const shells = () => renderLog.counts.get('ArrangementLane') ?? 0;
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackMute('music'));
    expect(shells()).toBeLessThanOrEqual(3);
    expect(inner()).toBe(1);
    expect(laneButtonPressed(view, 'music', /^Mute — /)).toBe('true');
    expect(laneButtonPressed(view, 'sfx', /^Mute — /)).toBe('false');
    renderLog.counts.clear();
    act(() => api.current?.undo());
    expect(shells()).toBeLessThanOrEqual(3);
    expect(inner()).toBe(1);
    expect(laneButtonPressed(view, 'music', /^Mute — /)).toBe('false');
    renderLog.counts.clear();
    act(() => api.current?.setPxPerSecond((api.current?.pxPerSecond ?? 20) * 2));
    expect(inner()).toBe(3);
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackSolo('music', false));
    expect(api.current?.arrangement.tracks.map((track) => track.solo)).toEqual([
      false,
      true,
      false,
    ]);
    expect(inner()).toBe(1);
    expect(laneButtonPressed(view, 'music', /^Solo — /)).toBe('true');
    renderLog.counts.clear();
    act(() => api.current?.toggleTrackSolo('sfx', false));
    expect(api.current?.arrangement.tracks.map((track) => track.solo)).toEqual([
      false,
      false,
      true,
    ]);
    expect(inner()).toBe(2);
    expect(laneButtonPressed(view, 'music', /^Solo — /)).toBe('false');
    expect(laneButtonPressed(view, 'sfx', /^Solo — /)).toBe('true');
    const before = raw.current?.getArrangement();
    if (!before) {
      throw new Error('workspace not mounted');
    }
    const moved = {
      ...before,
      clips: before.clips.map((clip) => (clip.id === 'hit-1' ? { ...clip, start: 6 } : clip)),
    };
    const projectEnd = raw.current?.projectEnd;
    renderLog.counts.clear();
    act(() => raw.current?.commitArrangement(moved, 'Move Clip', before));
    expect(raw.current?.projectEnd).toBe(projectEnd);
    expect(inner()).toBe(1);
    expect(api.current?.arrangement.clips.find((clip) => clip.id === 'hit-1')?.start).toBe(6);
    renderLog.counts.clear();
    act(() => api.current?.setTrackPan('music', 0.5));
    expect(inner()).toBe(1);
    expect(
      within(laneHeader(view, 'music')).getByRole('slider', { name: /^Pan — / }).getAttribute('value'),
    ).toBe('25');
  });

  it('RB-LEAF8 every audio clip shows its waveform once its peaks arrive, and the clip titles come from the lane sources (PERF-11c-iii-e-ii)', async () => {
    const { view } = await mountWorkspace();
    for (const [trackId, title] of [
      ['music', 'Song'],
      ['sfx', 'Hit'],
    ] as const) {
      const lane = view.container.querySelector<HTMLElement>(`[data-track-id="${trackId}"]`);
      if (!lane) {
        throw new Error(`lane ${trackId} not mounted`);
      }
      expect(within(lane).getAllByTestId('arrangement-clip-waveform')).toHaveLength(1);
      expect(within(lane).getAllByTitle(studioClipStrings.moveTitle(title))).toHaveLength(1);
    }
  });

  it('RB-LEAF9 a lane-move ghost on another lane shows the dragged clip title; a blocked ghost renders only the target lane, a valid one also the source lane; clearing the drag removes it (PERF-11c-iii-e-ii)', async () => {
    const { raw, view } = await mountWorkspace();
    const sfx = view.container.querySelector<HTMLElement>('[data-track-id="sfx"]');
    if (!sfx) {
      throw new Error('lane sfx not mounted');
    }
    const ghostAt = (blocked: boolean) => ({
      ghosts: [
        {
          clipId: 'music-1',
          trackId: 'sfx',
          start: 8,
          duration: 20,
          blocked,
          message: null,
        },
      ],
      timeLocked: false,
    });
    renderLog.counts.clear();
    act(() => raw.current?.setClipLaneDrag(ghostAt(true)));
    expect(renderLog.counts.get('ArrangementLaneViewInner') ?? 0).toBe(1);
    expect(within(sfx).getByTestId('arrangement-lane-move-ghost').getAttribute('data-blocked')).toBe(
      'true',
    );
    expect(within(sfx).getByTestId('arrangement-lane-move-ghost-label').textContent).toContain(
      'Song',
    );
    renderLog.counts.clear();
    act(() => raw.current?.setClipLaneDrag(ghostAt(false)));
    expect(renderLog.counts.get('ArrangementLaneViewInner') ?? 0).toBe(2);
    expect(within(sfx).getByTestId('arrangement-lane-move-ghost').getAttribute('data-blocked')).toBe(
      'false',
    );
    expect(within(sfx).getByTestId('arrangement-lane-move-ghost-label').textContent).toContain(
      'Song',
    );
    act(() => raw.current?.setClipLaneDrag(null));
    expect(within(sfx).queryByTestId('arrangement-lane-move-ghost')).toBeNull();
  });

"""
src = src.replace(anchor, rows + anchor)
open(p, 'w').write(src)
print('tests written')
