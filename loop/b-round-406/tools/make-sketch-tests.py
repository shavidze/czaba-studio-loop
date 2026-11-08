import sys
p = sys.argv[1] + '/app/lib/arrangement/__tests__/drag-preview-render.test.tsx'
s = open(p).read()
old = """const VIDEO_DOCK_COMPONENTS = [
  'ArrangementVideoDock',
  'ArrangementVideoCaption',"""
assert s.count(old) == 1
s = s.replace(old, """const VIDEO_DOCK_COMPONENTS = [
  'ArrangementVideoDock',
  'ArrangementVideoDockViewInner',
  'ArrangementVideoCaption',""")
assert s.endswith('});\n')
s += """
describe('PERF-11c-iii-d-ii — the video dock inner skips commits that keep its own props', () => {
  it('DP73 zoom, an audio move, an audio mute, Undo and Redo render the dock shell but no dock inner or caption', async () => {
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const box = view.getByTestId('arrangement-video-box');
    const overlay = view.getByTestId('arrangement-video-fade');
    renderLog.counts.clear();
    act(() => live(api).setPxPerSecond(PX_PER_SECOND * 2));
    const before = live(api).getArrangement();
    const moved: Arrangement = {
      ...before,
      clips: before.clips.map((clip) => (clip.id === 'c1' ? { ...clip, start: 3 } : clip)),
    };
    act(() => {
      live(api).commitArrangement(moved, 'Move', before);
    });
    const muted: Arrangement = {
      ...moved,
      tracks: moved.tracks.map((track) => (track.id === 'music' ? { ...track, mute: true } : track)),
    };
    act(() => {
      live(api).commitArrangement(muted, 'Mute', moved);
    });
    act(() => live(api).undo());
    act(() => live(api).undo());
    act(() => live(api).redo());
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(3);
    const shellRenders = rendersOf('ArrangementVideoDock');
    expect(shellRenders).toBeGreaterThan(0);
    expect(videoDockRenders()).toEqual({ ...NO_VIDEO_DOCK_RENDERS, ArrangementVideoDock: shellRenders });
    expect(view.getByTestId('arrangement-video-box')).toBe(box);
    expect(view.getByTestId('arrangement-video-fade')).toBe(overlay);
  });

  it('DP74 a stopped video-clip move, its Undo and Redo render no dock inner while the gap and overlay follow', async () => {
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS, { ...VIDEO_CLIP, fadeIn: 2 }]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    const restingOpacity = overlay.dataset.videoOpacity;
    expect(restingOpacity).not.toBe('1.000');
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    renderLog.counts.clear();
    const before = live(api).getArrangement();
    const moved: Arrangement = {
      ...before,
      clips: before.clips.map((clip) => (clip.id === 'v1' ? { ...clip, start: 3 } : clip)),
    };
    act(() => {
      live(api).commitArrangement(moved, 'Move', before);
    });
    expect(previewOf(api)).toBeNull();
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    act(() => live(api).undo());
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe(restingOpacity);
    act(() => live(api).redo());
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(rendersOf('ArrangementVideoDock')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementVideoDockViewInner')).toBe(0);
  });

  it('DP75 the dock inner renders when the first video clip arrives and when the box expands', async () => {
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS]);
    expect(view.queryByTestId('arrangement-video-empty')).not.toBeNull();
    renderLog.counts.clear();
    const before = live(api).getArrangement();
    act(() => {
      live(api).commitArrangement({ ...before, clips: [...before.clips, VIDEO_CLIP] }, 'Add', before);
    });
    expect(rendersOf('ArrangementVideoDockViewInner')).toBeGreaterThan(0);
    expect(view.queryByTestId('arrangement-video-empty')).toBeNull();
    renderLog.counts.clear();
    fireEvent.click(view.getByTestId('arrangement-video-expand'));
    expect(rendersOf('ArrangementVideoDockViewInner')).toBeGreaterThan(0);
    expect(view.getByTestId('arrangement-video-box').dataset.videoExpanded).toBe('true');
  });
});
"""
open(p, 'w').write(s)
print('ok')
