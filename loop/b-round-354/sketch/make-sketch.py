import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)
# DP69: redundant writtenValues -> stronger: release writes nothing
rep("""      const finalOpacity = overlay.dataset.videoOpacity;
      const writtenValues = [...records.slice(1).map((record) => record.oldValue), finalOpacity];
      expect(records.map((record) => record.oldValue)).not.toContain('1.000');
      expect(writtenValues).not.toContain('1.000');
      expect(finalOpacity).toBe(shownBeforeRelease);""",
"""      expect(records.map((record) => record.oldValue)).not.toContain('1.000');
      expect(records).toHaveLength(0);
      expect(overlay.dataset.videoOpacity).toBe(shownBeforeRelease);""")
# DP70: caption is '' in every state here (no video source), so replace caption/gap with a trim commit that uncovers the playhead
rep("""  it('DP70 Undo and Redo of a committed video fade rewrite the overlay with no preview', async () => {
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    const committedCaption = textOf(view, 'arrangement-video-caption');
    const committedGap = view.queryByTestId('arrangement-video-gap') === null;
    const before = live(api).getArrangement();""",
"""  it('DP70 Undo and Redo of a committed video fade and trim rewrite the overlay and the gap with no preview', async () => {
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    const before = live(api).getArrangement();""")
rep("""    act(() => live(api).undo());
    expect(previewOf(api)).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(textOf(view, 'arrangement-video-caption')).toBe(committedCaption);
    expect(view.queryByTestId('arrangement-video-gap') === null).toBe(committedGap);
    act(() => live(api).redo());
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
  });""",
"""    const trimmed: Arrangement = {
      ...faded,
      clips: faded.clips.map((clip) =>
        clip.id === 'v1' ? { ...clip, start: 2.5, sourceOffset: 1.5, duration: 2.5 } : clip,
      ),
    };
    act(() => {
      live(api).commitArrangement(trimmed, studioClipStrings.trimStartLabel, faded);
    });
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    act(() => live(api).undo());
    expect(previewOf(api)).toBeNull();
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
    act(() => live(api).undo());
    expect(previewOf(api)).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    act(() => live(api).redo());
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    act(() => live(api).redo());
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
  });""")
# DP72: distance guard, exact commit before the count, deterministic timer drain instead of a 20 ms sleep
rep("""    expect(shownStart).toBeGreaterThan(imported.start);
    expect(shownStart).toBeLessThan(playhead);""",
"""    expect(shownStart - imported.start).toBeGreaterThan(0.01);
    expect(shownStart).toBeLessThan(playhead);""")
rep("""    const writesBeforeRelease = seeks.length;
    pointerUpAt(root, 10, pressX + 40, 50);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(seeks).toHaveLength(writesBeforeRelease);
    expect(clipIn(live(api).arrangement, imported.id).start).toBeCloseTo(shownStart, 6);""",
"""    const writesBeforeRelease = seeks.length;
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      pointerUpAt(root, 10, pressX + 40, 50);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
    } finally {
      vi.useRealTimers();
    }
    expect(clipIn(live(api).arrangement, imported.id).start).toBe(shownStart);
    expect(seeks).toHaveLength(writesBeforeRelease);""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
