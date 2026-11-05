import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)
rep("it('DP69 the fade release never writes the pre-drag opacity back to the overlay'",
    "it('DP69 the fade release writes nothing to the overlay, so the pre-drag opacity never returns'")
rep("""    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    act(() => live(api).undo());
    expect(previewOf(api)).toBeNull();
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();""",
"""    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    act(() => live(api).undo());
    expect(previewOf(api)).toBeNull();
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();""")
rep("""    act(() => live(api).redo());
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    act(() => live(api).redo());
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
  });""",
"""    act(() => live(api).redo());
    expect(previewOf(api)).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    act(() => live(api).redo());
    expect(previewOf(api)).toBeNull();
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
  });""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
