# B round 344 sketch: c5-ii tests in drag-preview-render.test.tsx. Usage: python3 -I apply-tests.py <store-root>
import pathlib, sys
p = pathlib.Path(sys.argv[1]) / 'app/lib/arrangement/__tests__/drag-preview-render.test.tsx'
text = p.read_text()


def sub(old, new):
    global text
    assert text.count(old) == 1, (old[:70], text.count(old))
    text = text.replace(old, new)


sub('''  it('DP9b a video clip move keeps the provider path', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    pointerDownAt(video.header, 2, 40, 50);
    pointerMoveTo(video.root, 2, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 2, 120, 50);
    pointerMoveTo(video.root, 2, 160, 50);
    expect(rendersOf('ArrangementProvider')).toBe(2);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
    expect(previewOf(api)).toBeNull();
    pointerUpAt(video.root, 2, 160, 50);
    expect(live(api).undoLabel).toBe('Move clip');
  });
''', '''  it('DP9b a video clip move previews through the store; release adds one Move clip entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    pointerDownAt(video.header, 2, 40, 50);
    pointerMoveTo(video.root, 2, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 2, 120, 50);
    pointerMoveTo(video.root, 2, 160, 50);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementClipViewInner')).toBe(2);
    expect(video.root.dataset.clipStart).toBe('4.000');
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video move preview missing');
    }
    expect(clipIn(shown, 'v1').start).toBe(4);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(clipIn(live(api).getArrangement(), 'v1').start).toBe(4);
    pointerUpAt(video.root, 2, 160, 50);
    expect(live(api).undoLabel).toBe('Move clip');
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
    act(() => live(api).undo());
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(live(api).undoLabel).toBeNull();
  });
''')

sub('''  it('DP13 a video fade drag keeps the provider path and the committed status', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    const fade = video.root.querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!fade) {
      throw new Error('video fade handle missing');
    }
    pointerDownAt(fade, 3, 40, 50);
    pointerMoveTo(video.root, 3, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 3, 120, 50);
    expect(rendersOf('ArrangementProvider')).toBe(1);
    expect(previewOf(api)).toBeNull();
    expect(live(api).status).toBe(textOf(view, 'arrangement-status'));
    pointerUpAt(video.root, 3, 120, 50);
  });
''', '''  it('DP13 a video fade drag previews through the store and the status readout; release adds one entry', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    const fade = video.root.querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!fade) {
      throw new Error('video fade handle missing');
    }
    const committedStatus = live(api).status;
    pointerDownAt(fade, 3, 40, 50);
    pointerMoveTo(video.root, 3, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 3, 120, 50);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementStatusTextInner')).toBe(1);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video fade preview missing');
    }
    const shownFade = clipIn(shown, 'v1').fadeIn ?? 0;
    expect(shownFade).toBeGreaterThan(0);
    expect(video.root.dataset.fadeIn).toBe(shownFade.toFixed(3));
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
    expect(textOf(view, 'arrangement-status')).toContain(shownFade.toFixed(3));
    expect(live(api).status).toBe(committedStatus);
    pointerUpAt(video.root, 3, 120, 50);
    expect(previewOf(api)).toBeNull();
    expect(live(api).undoLabel).not.toBeNull();
    expect(clipIn(live(api).arrangement, 'v1').fadeIn).toBe(shownFade);
    expect(textOf(view, 'arrangement-status')).toBe(live(api).status);
    act(() => live(api).undo());
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
  });
''')

sub('''      pointerMoveTo(video.root, 3, 120, 50);
      expect(rendersOf('ArrangementProvider')).toBe(1);
      expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
''', '''      pointerMoveTo(video.root, 3, 120, 50);
      expect(rendersOf('ArrangementProvider')).toBe(0);
      expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
''')

sub('''  it('DP53 a group with a video clip keeps the history preview, as at HEAD', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([AUDIO_CLIPS[0], VIDEO_CLIP]);
    const { root, header } = clipParts('c1');
    act(() => live(api).selectClips(['c1', 'v1']));
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    pointerMoveTo(root, 1, 120);
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
''', '''  it('DP53 a group with a video clip previews through the store; release adds one Move (2) entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([
      AUDIO_CLIPS[0],
      VIDEO_CLIP,
      PROJECT_END_CLIP,
    ]);
    const { root, header } = clipParts('c1');
    const video = clipParts('v1');
    act(() => live(api).selectClips(['c1', 'v1']));
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 120);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('group preview missing');
    }
    expect(clipIn(shown, 'c1').start).toBe(5);
    expect(clipIn(shown, 'v1').start).toBe(4);
    expect(video.root.dataset.clipStart).toBe('4.000');
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
''')

sub('''    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
''', '''    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
''')

anchor = '''  it('DP54 a collapsed group overview follows a group move of its hidden clip without a workspace render', async () => {'''
new_tests = '''  it('DP57 a video trimEnd move previews through the store; release adds one Trim entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    pointerDownAt(video.trimEnd, 4, 200, 50);
    pointerMoveTo(video.root, 4, 180, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 4, 160, 50);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video trim preview missing');
    }
    expect(clipIn(shown, 'v1').duration).toBe(3);
    expect(clipIn(live(api).arrangement, 'v1').duration).toBe(4);
    pointerUpAt(video.root, 4, 160, 50);
    expect(live(api).undoLabel).toBe(studioClipStrings.trimEndLabel);
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'v1').duration).toBe(3);
  });

  it('DP58 the video gap caption follows a stopped video move from the store', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    expect(live(api).isPlaying).toBe(false);
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    pointerDownAt(video.header, 5, 60, 50);
    pointerMoveTo(video.root, 5, 40, 50);
    pointerMoveTo(video.root, 5, 20, 50);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(video.root.dataset.clipStart).toBe('0.000');
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    pointerMoveTo(video.root, 5, 60, 50);
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    pointerMoveTo(video.root, 5, 20, 50);
    pointerUpAt(video.root, 5, 20, 50);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(0);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
  });

  it('DP59 the video fade overlay follows a stopped video fade drag from the store', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    const video = clipParts('v1');
    const fade = video.root.querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!fade) {
      throw new Error('video fade handle missing');
    }
    pointerDownAt(fade, 6, 40, 50);
    pointerMoveTo(video.root, 6, 80, 50);
    pointerMoveTo(video.root, 6, 120, 50);
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
    const shownOpacity = overlay.dataset.videoOpacity;
    expect(shownOpacity).not.toBe('1.000');
    pointerUpAt(video.root, 6, 120, 50);
    expect(overlay.dataset.videoOpacity).toBe(shownOpacity);
    act(() => live(api).undo());
    expect(overlay.dataset.videoOpacity).toBe('1.000');
  });

  it('DP60 an audio move with a video clip present renders no video dock', async () => {
    const { clipParts } = await mountPreviewWorkspace([
      ...AUDIO_CLIPS,
      VIDEO_CLIP,
      PROJECT_END_CLIP,
    ]);
    const audio = clipParts('c1');
    pointerDownAt(audio.header, 7, 80);
    pointerMoveTo(audio.root, 7, 120);
    renderLog.counts.clear();
    pointerMoveTo(audio.root, 7, 160);
    pointerMoveTo(audio.root, 7, 200);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
    expect(audio.root.dataset.clipStart).toBe('5.000');
    expect(rendersOf('ArrangementVideoDock')).toBe(0);
    pointerUpAt(audio.root, 7, 200);
  });

  it('DP61 a pointercancel mid video fade reverts the fade and the overlay with no entry; the readout stays', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    const video = clipParts('v1');
    const fade = video.root.querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!fade) {
      throw new Error('video fade handle missing');
    }
    const undoBefore = live(api).undoLabel;
    pointerDownAt(fade, 8, 40, 50);
    pointerMoveTo(video.root, 8, 80, 50);
    pointerMoveTo(video.root, 8, 120, 50);
    expect(overlay.dataset.videoOpacity).not.toBe('1.000');
    const readout = textOf(view, 'arrangement-status');
    fireEvent.pointerCancel(video.root, { pointerId: 8, clientX: 120, clientY: 50 });
    expect(previewOf(api)).toBeNull();
    expect(live(api).undoLabel).toBe(undoBefore);
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
    expect(video.root.dataset.fadeIn).toBe('0.000');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(textOf(view, 'arrangement-status')).toBe(readout);
  });

  it('DP62 a video move while playing renders no provider; release adds one Move clip entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    expect(live(api).isPlaying).toBe(true);
    const video = clipParts('v1');
    pointerDownAt(video.header, 9, 40, 50);
    pointerMoveTo(video.root, 9, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 9, 120, 50);
    pointerMoveTo(video.root, 9, 160, 50);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(clipIn(live(api).getArrangement(), 'v1').start).toBe(4);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    pointerUpAt(video.root, 9, 160, 50);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).undoLabel).toBe('Move clip');
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
    act(() => live(api).togglePlayback());
  });

'''
sub(anchor, new_tests + anchor)
p.write_text(text)
print('ok')
