import sys
root = sys.argv[1]


def sub(path, old, new, count=1):
    p = root + '/' + path
    s = open(p, encoding='utf8').read()
    n = s.count(old)
    if n != count:
        raise SystemExit(f'COUNT {n} != {count} in {path}: {old[:90]!r}')
    s = s.replace(old, new)
    open(p, 'w', encoding='utf8').write(s)


T = 'app/lib/arrangement/__tests__/'
ST = T + 'strings.test.ts'
AC = T + 'ArrangementContext.test.ts'
BR = T + 'bars-ruler-ui.test.tsx'
IM = T + 'insert-marker-ui.test.tsx'
NS = T + 'navigation-strings-ui.test.tsx'
MS = T + 'marker-strings-ui.test.tsx'

OLD5 = "'Playhead (00:05.000) is past the end of the project (00:02.000) — there is nothing to play here. Home returns to 0.'"

# strings.test.ts
sub(ST, "  splitMissesSelection: 'The playhead does not cross any selected clip.',\n",
    "  splitMissesSelection: 'The insert marker does not cross any selected clip.',\n")
sub(ST, "  splitNeedsTarget:\n    'To split, select a clip and place the playhead inside it, or make a time selection.',\n  splitPlayheadOutside: 'The playhead must be inside the selected clip.',\n",
    "  splitNeedsTarget:\n    'To split, click inside a clip to select it and place the insert marker, or make a time selection.',\n  splitInsertMarkerOutside: 'The insert marker must be inside the selected clip.',\n")
sub(ST, "  splitPlayheadTitle: 'Split at the playhead (Ctrl+E)',\n",
    "  splitAtInsertMarkerTitle: 'Split at the insert marker (Ctrl+E)',\n")
sub(ST, "  addTitle: 'Add a marker at the playhead or at the start of the time selection (M)',\n",
    "  addTitle:\n    'Add a marker at the time selection start, the insert marker, or the playback position while playing (M)',\n")
sub(ST, "    projectEndPrefix: '/ end',\n  },\n",
    "    projectEndPrefix: '/ end',\n    startPointInsertMarker: 'Insert marker',\n    startPointSelection: 'Time selection start',\n    startPointPlayhead: 'Playhead',\n  },\n")
sub(ST, "    playPastEnd: [\n      pb.playPastEnd({ position: '00:05.000', end: '00:02.000' }),\n      pb.playPastEnd({ position: '01:00.250', end: '00:30.000' }),\n    ],\n",
    "    playPastEnd: [\n      pb.playPastEnd({ subject: 'Playhead', position: '00:05.000', end: '00:02.000' }),\n      pb.playPastEnd({ subject: 'Insert marker', position: '01:00.250', end: '00:30.000' }),\n      pb.playPastEnd({ subject: 'Time selection start', position: '00:17.000', end: '00:16.000' }),\n    ],\n")
sub(ST, "    expect(pb.playPastEnd({ position: '00:05.000', end: '00:02.000' })).toBe(\n      " + OLD5 + ",\n    );\n    expect(pb.playPastEnd({ position: '01:00.250', end: '00:30.000' })).toBe(\n      'Playhead (01:00.250) is past the end of the project (00:30.000) — there is nothing to play here. Home returns to 0.',\n    );\n",
    "    expect(pb.playPastEnd({ subject: 'Playhead', position: '00:05.000', end: '00:02.000' })).toBe(\n      " + OLD5 + ",\n    );\n    expect(\n      pb.playPastEnd({ subject: 'Insert marker', position: '01:00.250', end: '00:30.000' }),\n    ).toBe(\n      'Insert marker (01:00.250) is past the end of the project (00:30.000) — there is nothing to play here. Home returns to 0.',\n    );\n    expect(\n      pb.playPastEnd({ subject: 'Time selection start', position: '00:17.000', end: '00:16.000' }),\n    ).toBe(\n      'Time selection start (00:17.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.',\n    );\n")
sub(ST, "    expect(playPastEndMessage(5, 2)).toBe(\n      pb.playPastEnd({ position: '00:05.000', end: '00:02.000' }),\n    );\n",
    "    expect(playPastEndMessage(5, 2, 'playhead')).toBe(" + OLD5 + ");\n    expect(playPastEndMessage(5, 2, 'insert-marker')).toBe(\n      'Insert marker (00:05.000) is past the end of the project (00:02.000) — there is nothing to play here. Home returns to 0.',\n    );\n    expect(playPastEndMessage(17, 16, 'selection')).toBe(\n      'Time selection start (00:17.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.',\n    );\n")

# ArrangementContext.test.ts (Space after seekTo = insert marker)
sub(AC, "    expect(result.current.status).toBe(playPastEndMessage(5, 2));\n    expect(result.current.status).toBe(\n      studioPlaybackStrings.playPastEnd({ position: '00:05.000', end: '00:02.000' }),\n    );\n",
    "    expect(result.current.status).toBe(playPastEndMessage(5, 2, 'insert-marker'));\n    expect(result.current.status).toBe(\n      studioPlaybackStrings.playPastEnd({\n        subject: studioPlaybackStrings.startPointInsertMarker,\n        position: '00:05.000',\n        end: '00:02.000',\n      }),\n    );\n")

# bars-ruler-ui (strip = playFrom = insert marker)
sub(BR, "playPastEndMessage(positionOf(mounted.api), 16));", "playPastEndMessage(positionOf(mounted.api), 16, 'insert-marker'));")
sub(BR, "playPastEndMessage(16, 16));", "playPastEndMessage(16, 16, 'insert-marker'));", count=2)

# navigation / marker strings ui
sub(NS, "    expect(workspace.split().title).toBe('Split at the playhead (Ctrl+E)');\n",
    "    expect(workspace.split().title).toBe('Split at the insert marker (Ctrl+E)');\n")
sub(MS, "    expect(add.title).toBe(\n      'Add a marker at the playhead or at the start of the time selection (M)',\n    );\n",
    "    expect(add.title).toBe(\n      'Add a marker at the time selection start, the insert marker, or the playback position while playing (M)',\n    );\n")

# insert-marker-ui: IM3 / IM11 / IM13 rewrites and new rows
sub(IM, """    clickRuler(mounted, 1);
    expect(insertMarkerOf(mounted)).toBe('1.000');
    key({ ...SPACE, metaKey: true, shiftKey: true });
    expect(insertMarkerOf(mounted)).toBe('1.000');
    key(SPACE);
    expect(positionOf(mounted.api)).toBe(1);
    advance(2);
""", """    clickRuler(mounted, 1);
    expect(insertMarkerOf(mounted)).toBe('1.000');
    key(SPACE);
    advance(1.5);
    key(SPACE);
    const secondStop = Math.round(positionOf(mounted.api) * 1000) / 1000;
    expect(secondStop).toBeGreaterThan(2);
    expect(insertMarkerOf(mounted)).toBe('1.000');
    key({ ...SPACE, metaKey: true, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(insertMarkerOf(mounted)).toBe(secondStop.toFixed(3));
    expect(statusText(mounted)).toBe(
      studioPlaybackStrings.insertMarkerToPlayhead(formatArrangementTime(secondStop)),
    );
    key(SPACE);
    expect(positionOf(mounted.api)).toBe(secondStop);
    advance(2);
""")
sub(IM, "    expect(Number(insertMarkerOf(mounted))).toBeGreaterThan(2.5);\n",
    "    expect(Number(insertMarkerOf(mounted))).toBeGreaterThan(secondStop + 1.5);\n")
sub(IM, "    expect(statusText(mounted)).toBe(playPastEndMessage(18, 16));\n",
    "    expect(statusText(mounted)).toBe(playPastEndMessage(18, 16, 'insert-marker'));\n")
sub(IM, """    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 2);
    key({ ...SPACE, ctrlKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    const tempo = mounted.view.getByTestId('arrangement-tempo-input');
    act(() => tempo.focus());
    fireEvent.keyDown(tempo, { ...SPACE, shiftKey: true });
    fireEvent.keyDown(tempo, { ...SPACE, ctrlKey: true, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(insertMarkerOf(mounted)).toBe('2.000');
""", """    const mounted = await playStopFrom(2);
    const stopPoint = positionOf(mounted.api);
    expect(stopPoint).toBeGreaterThan(3);
    key({ ...SPACE, ctrlKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    const tempo = mounted.view.getByTestId('arrangement-tempo-input');
    act(() => tempo.focus());
    fireEvent.keyDown(tempo, { ...SPACE, shiftKey: true });
    fireEvent.keyDown(tempo, { ...SPACE, ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(tempo, { ...SPACE, metaKey: true, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(insertMarkerOf(mounted)).toBe('2.000');
    expect(positionOf(mounted.api)).toBe(stopPoint);
""")

NEW_ROWS = """
describe('SABA-B-10a stage 2a edit commands at the insert marker (D-29z436)', { timeout: 15_000 }, () => {
  it('IM15 Paste lands at the insert marker, not at the stop point', async () => {
    const mounted = await mountMarkerWorkspace();
    act(() => live(mounted.api).selectClip('h1'));
    act(() => live(mounted.api).copySelection());
    clickRuler(mounted, 2);
    key(SPACE);
    advance(1.5);
    key(SPACE);
    expect(positionOf(mounted.api)).toBeGreaterThan(3);
    act(() => live(mounted.api).setActiveTrack('music'));
    act(() => live(mounted.api).pasteClipboard());
    const pasted = live(mounted.api).arrangement.clips.find(
      (clip) => clip.id === live(mounted.api).selectedClipId,
    );
    expect(pasted).toMatchObject({ trackId: 'music', start: 2 });
    expect(statusText(mounted)).toContain('00:02.000');
  });

  it('IM16 Add from the library lands at the insert marker, stopped and while playing', async () => {
    const mounted = await playStopFrom(3);
    expect(positionOf(mounted.api)).toBeGreaterThan(4);
    act(() => live(mounted.api).setActiveTrack('music'));
    act(() => live(mounted.api).addSourceToActiveTrack('hit'));
    const first = live(mounted.api).arrangement.clips.find(
      (clip) => clip.id === live(mounted.api).selectedClipId,
    );
    expect(first).toMatchObject({ trackId: 'music', start: 3 });
    act(() => live(mounted.api).undo());
    expect(live(mounted.api).arrangement.clips.filter((clip) => clip.trackId === 'music')).toEqual([]);
    key(SPACE);
    advance(1);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(live(mounted.api).getLivePosition()).toBeGreaterThan(3.5);
    act(() => live(mounted.api).addSourceToActiveTrack('hit'));
    const second = live(mounted.api).arrangement.clips.find(
      (clip) => clip.id === live(mounted.api).selectedClipId,
    );
    expect(second).toMatchObject({ trackId: 'music', start: 3 });
  });

  it('IM17 Ctrl+E without a time selection splits at the insert marker (one clip and several)', async () => {
    const mounted = await mountMarkerWorkspace();
    act(() => live(mounted.api).selectClip('h1'));
    act(() => live(mounted.api).copySelection());
    clickRuler(mounted, 0);
    act(() => live(mounted.api).setActiveTrack('music'));
    act(() => live(mounted.api).pasteClipboard());
    const copyId = live(mounted.api).selectedClipId;
    expect(copyId).not.toBeNull();
    clickRuler(mounted, 5);
    key(SPACE);
    advance(1.5);
    key(SPACE);
    expect(positionOf(mounted.api)).toBeGreaterThan(6);
    act(() => live(mounted.api).selectClip('h1'));
    key({ key: 'e', code: 'KeyE', ctrlKey: true });
    expect(statusText(mounted)).toBe(studioEditStrings.splitDone('00:05.000'));
    expect(
      live(mounted.api)
        .arrangement.clips.filter((clip) => clip.trackId === 'sfx')
        .map((clip) => clip.start)
        .sort((a, b) => a - b),
    ).toEqual([0, 5]);
    act(() => live(mounted.api).undo());
    act(() => live(mounted.api).selectClips(['h1', copyId ?? '']));
    key({ key: 'e', code: 'KeyE', ctrlKey: true });
    expect(statusText(mounted)).toBe(
      studioEditStrings.splitClipsDone({ count: 2, time: '00:05.000' }),
    );
    clickRuler(mounted, 18);
    act(() => live(mounted.api).selectClip('h1'));
    key({ key: 'e', code: 'KeyE', ctrlKey: true });
    expect(statusText(mounted)).toBe(studioEditStrings.splitInsertMarkerOutside);
  });

  it('IM18 M stopped adds at the insert marker; M while playing adds at the playback position', async () => {
    const mounted = await playStopFrom(2);
    expect(positionOf(mounted.api)).toBeGreaterThan(3);
    key({ key: 'm', code: 'KeyM' });
    const input = mounted.view.getByTestId('arrangement-marker-name-input');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(live(mounted.api).arrangement.markers?.map((marker) => marker.time)).toContain(2);
    act(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    key(SPACE);
    advance(2);
    expect(live(mounted.api).isPlaying).toBe(true);
    key({ key: 'm', code: 'KeyM' });
    const playingInput = mounted.view.getByTestId('arrangement-marker-name-input');
    fireEvent.keyDown(playingInput, { key: 'Enter', code: 'Enter' });
    const times = live(mounted.api).arrangement.markers?.map((marker) => marker.time) ?? [];
    expect(times.some((time) => time > 3.5 && time < 4.5)).toBe(true);
  });

  it('IM19 the past-end refusal names the start point: insert marker, time selection start or playhead', async () => {
    const mounted = await mountMarkerWorkspace();
    act(() => live(mounted.api).setTimeRange({ start: 17, end: 18, trackId: 'sfx' }));
    key(SPACE);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(statusText(mounted)).toBe(playPastEndMessage(17, 16, 'selection'));
    clickRuler(mounted, 18);
    key({ ...SPACE, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(statusText(mounted)).toBe(playPastEndMessage(18, 16, 'playhead'));
    key(SPACE);
    expect(statusText(mounted)).toBe(playPastEndMessage(18, 16, 'insert-marker'));
  });

  it('IM20 Ctrl+Shift+Space and Home do nothing during a pointer gesture', async () => {
    const mounted = await playStopFrom(2);
    const stopPoint = positionOf(mounted.api);
    act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
    let release: () => void = () => undefined;
    act(() => {
      release = live(mounted.api).beginPointerGesture();
    });
    key({ ...SPACE, ctrlKey: true, shiftKey: true });
    key({ key: 'Home', code: 'Home' });
    expect(insertMarkerOf(mounted)).toBe('2.000');
    expect(positionOf(mounted.api)).toBe(stopPoint);
    expect(live(mounted.api).range).not.toBeNull();
    act(() => release());
    key({ key: 'Home', code: 'Home' });
    expect(insertMarkerOf(mounted)).toBe('0.000');
    expect(live(mounted.api).range).toBeNull();
  });

  it('IM21 a stopped playhead-handle step clears a time selection and moves the insert marker', async () => {
    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 3);
    act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
    const handle = mounted.view.getByTestId('arrangement-playhead-handle');
    fireEvent.keyDown(handle, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(live(mounted.api).range).toBeNull();
    expect(insertMarkerOf(mounted)).toBe('3.100');
  });
});
"""
p = root + '/' + IM
s = open(p, encoding='utf8').read()
s = s.rstrip('\n') + '\n' + NEW_ROWS
s = s.replace("import { studioPlaybackStrings } from '../strings';", "import { studioEditStrings, studioPlaybackStrings } from '../strings';")
open(p, 'w', encoding='utf8').write(s)
print('tests applied')
