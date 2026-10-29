# B round 250 -> 251 pre-check: test changes on a scratch copy. Usage: python3 -I proto_tests_251.py <scratch-root>
import sys, pathlib
root = pathlib.Path(sys.argv[1])
T = 'app/lib/arrangement/__tests__/'
def sub(path, old, new, count=1):
    p = root / path
    t = p.read_text(encoding='utf-8')
    assert t.count(old) == count, (path, old[:70], t.count(old))
    p.write_text(t.replace(old, new), encoding='utf-8')

# library-preview.test.tsx
L = T + 'library-preview.test.tsx'
sub(L, "view.getByTestId('arrangement-library-playhead').closest('p')", "view.getByTestId('arrangement-library-insert-marker').closest('p')")
sub(L, "expect(row.textContent).toContain('· playhead 00:00.000');", "expect(row.textContent).toContain('· insert marker 00:00.000');", 2)
sub(L, "describe('ArrangementLibraryPreview active-lane row and playhead memo (C-R16-01, M-R10-1/M2)'", "describe('ArrangementLibraryPreview active-lane row and insert-marker memo (C-R16-01, M-R10-1/M2, C-R250-01)'")
sub(L, "it('advances the library-preview cursor without rendering LibraryPlayheadText (M-R10-1/M2)'", "it('advances the library-preview cursor without rendering LibraryInsertMarkerText (M-R10-1/M2)'")
sub(L, "const playhead = view.getByTestId('arrangement-library-playhead');", "const insertMarkerText = view.getByTestId('arrangement-library-insert-marker');")
sub(L, "renderLog.counts.get('LibraryPlayheadText')", "renderLog.counts.get('LibraryInsertMarkerText')", 2)
sub(L, """    expect(view.getByTestId('arrangement-library-playhead')).toBe(playhead);
    expect(playhead.textContent).toBe('00:00.000');""", """    expect(view.getByTestId('arrangement-library-insert-marker')).toBe(insertMarkerText);
    expect(insertMarkerText.textContent).toBe('00:00.000');""")

# render-budget.test.tsx
R = T + 'render-budget.test.tsx'
sub(R, "expect(countsOf([...POSITION_CONSUMERS, 'LibraryPlayheadText'])).toEqual({", "expect(countsOf([...POSITION_CONSUMERS, 'LibraryInsertMarkerText'])).toEqual({")
sub(R, "      LibraryPlayheadText: 0,\n", "      LibraryInsertMarkerText: 0,\n")
sub(R, """function PositionStoreProbe({ store }: { store: { current: ArrangementPositionStore | null } }) {
  store.current = useArrangementPositionStore();
  return null;
}
""", """function PositionStoreProbe({ store }: { store: { current: ArrangementPositionStore | null } }) {
  store.current = useArrangementPositionStore();
  return null;
}

function InsertMarkerStoreProbe({
  store,
}: {
  store: { current: ArrangementPositionStore | null };
}) {
  store.current = useArrangementInsertMarkerStore();
  return null;
}
""")
sub(R, """  it('writes the library playhead text on 60 position frames without rendering LibraryPlayheadText (R9-L1, C-R6-02)', async () => {
    const store: { current: ArrangementPositionStore | null } = { current: null };
    const view = render(
      <ArrangementProvider collection={budgetCollection} initialArrangement={budgetArrangement()}>
        <StudioWorkspace />
        <PositionStoreProbe store={store} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const libraryText = view.getByTestId('arrangement-library-playhead');
    expect(libraryText.closest('p')?.textContent).toContain('· playhead 00:00.000');
    expect(libraryText.className).toBe('font-mono tabular-nums');
    expect(libraryText.textContent).toBe('00:00.000');
    expect(renderLog.counts.get('LibraryPlayheadText') ?? 0).toBeGreaterThan(0);
    renderLog.counts.clear();
    const texts: string[] = [];
    for (let frame = 1; frame <= 60; frame++) {
      act(() => store.current?.setPosition(frame * 0.1));
      texts.push(libraryText.textContent ?? '');
    }
    expect(renderLog.counts.get('LibraryPlayheadText') ?? 0).toBe(0);
    expect(texts[0]).toBe(formatArrangementTime(0.1));
    expect(texts[59]).toBe(formatArrangementTime(6));
    expect(new Set(texts).size).toBe(60);
    expect(view.getByTestId('arrangement-library-playhead')).toBe(libraryText);
  });""", """  it('keeps the library insert-marker text on 60 position frames and writes marker moves without rendering LibraryInsertMarkerText (R9-L1, C-R6-02, C-R250-01)', async () => {
    const store: { current: ArrangementPositionStore | null } = { current: null };
    const markerStore: { current: ArrangementPositionStore | null } = { current: null };
    const view = render(
      <ArrangementProvider collection={budgetCollection} initialArrangement={budgetArrangement()}>
        <StudioWorkspace />
        <PositionStoreProbe store={store} />
        <InsertMarkerStoreProbe store={markerStore} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const libraryText = view.getByTestId('arrangement-library-insert-marker');
    expect(libraryText.closest('p')?.textContent).toContain('· insert marker 00:00.000');
    expect(libraryText.className).toBe('font-mono tabular-nums');
    expect(libraryText.textContent).toBe('00:00.000');
    expect(renderLog.counts.get('LibraryInsertMarkerText') ?? 0).toBeGreaterThan(0);
    renderLog.counts.clear();
    const texts: string[] = [];
    for (let frame = 1; frame <= 60; frame++) {
      act(() => store.current?.setPosition(frame * 0.1));
      texts.push(libraryText.textContent ?? '');
    }
    expect(store.current?.getPosition()).toBeCloseTo(6, 6);
    expect(new Set(texts)).toEqual(new Set(['00:00.000']));
    act(() => markerStore.current?.setPosition(3));
    expect(libraryText.textContent).toBe(formatArrangementTime(3));
    act(() => markerStore.current?.setPosition(4.5));
    expect(libraryText.textContent).toBe(formatArrangementTime(4.5));
    expect(renderLog.counts.get('LibraryInsertMarkerText') ?? 0).toBe(0);
    expect(view.getByTestId('arrangement-library-insert-marker')).toBe(libraryText);
  });""")

# studio-theme-obsidian.test.tsx
O = T + 'studio-theme-obsidian.test.tsx'
sub(O, "for (const testId of ['arrangement-library-playhead', 'arrangement-detail-clip-gain-reset']) {", "for (const testId of ['arrangement-library-insert-marker', 'arrangement-detail-clip-gain-reset']) {")
sub(O, "expect(classTokensByTestId(html, 'arrangement-library-playhead')).toContain('tabular-nums');", "expect(classTokensByTestId(html, 'arrangement-library-insert-marker')).toContain(\n      'tabular-nums',\n    );")

# strings.test.ts (ST49)
S = T + 'strings.test.ts'
sub(S, """        'fold',
        'library',""", """        'fold',
        'insertMarker',
        'library',""")
sub(S, "expect(Object.keys(EXPECTED_LIBRARY_PANEL_STRINGS)).toHaveLength(23);", "expect(Object.keys(EXPECTED_LIBRARY_PANEL_STRINGS)).toHaveLength(24);")
sub(S, """  videoTrackNote: ' (audio is not added here)',
  previewPlay: 'Preview',""", """  videoTrackNote: ' (audio is not added here)',
  insertMarker: 'insert marker',
  previewPlay: 'Preview',""")

# insert-marker-ui.test.tsx
I = T + 'insert-marker-ui.test.tsx'
sub(I, """      expect(pasted).toMatchObject({ trackId: 'music', start: 2 });
      expect(statusText(mounted)).toContain('00:02.000');
    });""", """      expect(pasted).toMatchObject({ trackId: 'music', start: 2 });
      expect(statusText(mounted)).toContain('00:02.000');
      act(() => live(mounted.api).undo());
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(2.5);
      act(() => live(mounted.api).pasteClipboard());
      const pastedPlaying = live(mounted.api).arrangement.clips.find(
        (clip) => clip.id === live(mounted.api).selectedClipId,
      );
      expect(pastedPlaying).toMatchObject({ trackId: 'music', start: 2 });
      expect(statusText(mounted)).toContain('00:02.000');
      expect(live(mounted.api).isPlaying).toBe(true);
    });""")
sub(I, """      ).toEqual([0, 5]);
      act(() => live(mounted.api).undo());
      act(() => live(mounted.api).selectClips(['h1', copyId ?? '']));""", """      ).toEqual([0, 5]);
      act(() => live(mounted.api).undo());
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(5.5);
      act(() => live(mounted.api).selectClip('h1'));
      key({ key: 'e', code: 'KeyE', ctrlKey: true });
      expect(statusText(mounted)).toBe(studioEditStrings.splitDone('00:05.000'));
      expect(
        live(mounted.api)
          .arrangement.clips.filter((clip) => clip.trackId === 'sfx')
          .map((clip) => clip.start)
          .sort((a, b) => a - b),
      ).toEqual([0, 5]);
      expect(live(mounted.api).isPlaying).toBe(true);
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(false);
      act(() => live(mounted.api).undo());
      act(() => live(mounted.api).selectClips(['h1', copyId ?? '']));""")
sub(I, """      key({ ...SPACE, ctrlKey: true, shiftKey: true });
      key({ key: 'Home', code: 'Home' });
      expect(insertMarkerOf(mounted)).toBe('2.000');""", """      expect(fireEvent.keyDown(document.body, { ...SPACE, ctrlKey: true, shiftKey: true })).toBe(
        false,
      );
      expect(fireEvent.keyDown(document.body, { ...SPACE, metaKey: true, shiftKey: true })).toBe(
        false,
      );
      expect(fireEvent.keyDown(document.body, { key: 'Home', code: 'Home' })).toBe(false);
      expect(insertMarkerOf(mounted)).toBe('2.000');""")
sub(I, """    it('IM21 a stopped playhead-handle step clears a time selection and moves the insert marker', async () => {""", """    it('IM22 the library line names the insert marker, after a stop and while playing (C-R250-01)', async () => {
      const mounted = await playStopFrom(3);
      const caption = mounted.view.getByTestId('arrangement-library-insert-marker');
      expect(positionOf(mounted.api)).toBeGreaterThan(4);
      expect(caption.textContent).toBe('00:03.000');
      expect(caption.closest('p')?.textContent).toContain('· insert marker 00:03.000');
      expect(caption.closest('p')?.textContent).not.toContain('playhead');
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(3.5);
      expect(caption.textContent).toBe('00:03.000');
      key(SPACE);
      clickRuler(mounted, 6);
      expect(caption.textContent).toBe('00:06.000');
      act(() => live(mounted.api).setActiveTrack('music'));
      act(() => live(mounted.api).addSourceToActiveTrack('hit'));
      const added = live(mounted.api).arrangement.clips.find(
        (clip) => clip.id === live(mounted.api).selectedClipId,
      );
      expect(added?.start).toBe(6);
    });

    it('IM23 M prefers the time selection start, stopped and while playing', async () => {
      const mounted = await playStopFrom(2);
      act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
      key({ key: 'm', code: 'KeyM' });
      fireEvent.keyDown(mounted.view.getByTestId('arrangement-marker-name-input'), {
        key: 'Enter',
        code: 'Enter',
      });
      expect(live(mounted.api).arrangement.markers?.map((marker) => marker.time)).toEqual([5]);
      act(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      act(() => live(mounted.api).setTimeRange({ start: 9, end: 10, trackId: 'sfx' }));
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      key({ key: 'm', code: 'KeyM' });
      fireEvent.keyDown(mounted.view.getByTestId('arrangement-marker-name-input'), {
        key: 'Enter',
        code: 'Enter',
      });
      expect(live(mounted.api).arrangement.markers?.map((marker) => marker.time)).toEqual([5, 9]);
    });

    it('IM21 a stopped playhead-handle step clears a time selection and moves the insert marker', async () => {""")
print('ok')
