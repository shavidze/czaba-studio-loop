import sys, pathlib
root = pathlib.Path(sys.argv[1])
p = root/'app/lib/arrangement/__tests__/drag-preview-render.test.tsx'
s = p.read_text()
old = "import { CLIP_LANE_REFUSAL_MESSAGES } from '../selection';"
assert s.count(old) == 1
s = s.replace(old, "import { CLIP_LANE_REFUSAL_MESSAGES, GROUP_MOVE_BLOCKED_MESSAGE } from '../selection';")
s += r"""
const PROJECT_END_CLIP: ArrangementClip = {
  id: 'c3',
  trackId: 'music',
  sourceId: 'song',
  start: 20,
  sourceOffset: 0,
  duration: 2,
};

describe('PERF-DRAG-PREVIEW stage c4-ii — a group move previews through the store', () => {
  it('DP51 a same-lane group move renders neither the provider nor the workspace; release adds one Move (2) entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, PROJECT_END_CLIP]);
    const first = clipParts('c1');
    const second = clipParts('c2');
    act(() => live(api).selectClips(['c1', 'c2']));
    pointerDownAt(first.header, 1, 0);
    pointerMoveTo(first.root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(first.root, 1, 80);
    pointerMoveTo(first.root, 1, 120);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementTransport')).toBe(0);
    expect(rendersOf('ArrangementLibrary')).toBe(0);
    expect(first.root.dataset.clipStart).toBe('5.000');
    expect(second.root.dataset.clipStart).toBe('4.000');
    expect(previewOf(api)).not.toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    pointerUpAt(first.root, 1, 120);
    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'c2').start).toBe(4);
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(clipIn(live(api).arrangement, 'c2').start).toBe(1);
    expect(second.root.dataset.clipStart).toBe('1.000');
  });

  it('DP52 a cross-lane group move renders no provider; release puts both clips on the target lane in one entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([
      { id: 'g1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 2 },
      { id: 'g2', trackId: 'music', sourceId: 'song', start: 6, sourceOffset: 0, duration: 2 },
    ]);
    const { root, header } = clipParts('g1');
    clipParts('g2');
    act(() => live(api).selectClips(['g1', 'g2']));
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 80, SFX_LANE_Y);
    expect(live(api).clipLaneDrag?.ghosts).toHaveLength(2);
    expect(previewOf(api)).toBeNull();
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 120, SFX_LANE_Y);
    pointerMoveTo(root, 1, 160, SFX_LANE_Y);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(previewOf(api)).toBeNull();
    expect(live(api).getArrangement()).toBe(live(api).arrangement);
    expect(live(api).clipLaneDrag?.ghosts.map((ghost) => [ghost.trackId, ghost.start])).toEqual([
      ['sfx', 5],
      ['sfx', 9],
    ]);
    pointerUpAt(root, 1, 160, SFX_LANE_Y);
    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(live(api).clipLaneDrag).toBeNull();
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'g1')).toMatchObject({ trackId: 'sfx', start: 5 });
    expect(clipIn(live(api).arrangement, 'g2')).toMatchObject({ trackId: 'sfx', start: 9 });
  });

  it('DP53 a group with a video clip keeps the history preview, as at HEAD', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([AUDIO_CLIPS[0], VIDEO_CLIP]);
    const { root, header } = clipParts('c1');
    act(() => live(api).selectClips(['c1', 'v1']));
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    pointerMoveTo(root, 1, 120);
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
    pointerUpAt(root, 1, 120);
    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
  });

  it('DP54 a collapsed group overview follows a group move of its hidden clip without a workspace render', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, PROJECT_END_CLIP]);
    const before = live(api).getArrangement();
    act(() => {
      live(api).commitArrangement(
        {
          ...before,
          tracks: before.tracks.map((track) =>
            track.id === 'sfx' ? { ...track, groupId: 'g1' } : track,
          ),
          groups: [{ id: 'g1', name: 'Group 1', parentId: null }],
        },
        'Group Tracks',
        before,
      );
    });
    fireEvent.click(view.getByTestId('arrangement-group-fold'));
    act(() => live(api).selectClips(['c1', 'c2']));
    const block = () =>
      view.container.querySelector<HTMLElement>('[data-overview-clip-id="c2"]')?.dataset
        .overviewStart;
    expect(block()).toBe('1.000');
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 120);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(block()).toBe('4.000');
    pointerUpAt(root, 1, 120);
    expect(block()).toBe('4.000');
    act(() => live(api).undo());
    expect(block()).toBe('1.000');
  });

  it('DP55 a blocked group move shows the blocked status and leaves both clips in place', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([
      AUDIO_CLIPS[0],
      { id: 'c2', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 2 },
    ]);
    const { root, header } = clipParts('c1');
    act(() => live(api).selectClips(['c1', 'c2']));
    pointerDownAt(header, 1, 200);
    pointerMoveTo(root, 1, 160);
    pointerMoveTo(root, 1, 120);
    expect(textOf(view, 'arrangement-status')).toBe(GROUP_MOVE_BLOCKED_MESSAGE);
    expect(root.dataset.clipStart).toBe('2.000');
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementProvider')).toBeLessThanOrEqual(1);
    expect(rendersOf('ArrangementLane')).toBe(0);
    pointerUpAt(root, 1, 80);
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(clipIn(live(api).arrangement, 'c2').start).toBe(0);
    expect(previewOf(api)).toBeNull();
  });
});
"""
p.write_text(s)
print('tests ok')
