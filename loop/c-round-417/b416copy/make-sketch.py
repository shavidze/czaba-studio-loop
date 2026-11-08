import sys

root = sys.argv[1] + '/app/lib/arrangement/__tests__/'


def sub(path, old, new):
    p = root + path
    t = open(p).read()
    assert t.count(old) == 1, (path, old[:70], t.count(old))
    open(p, 'w').write(t.replace(old, new))


# EN10: freeze Date.now, exact landing, deterministic advance while playing
sub('marker-edge-nav-ui.test.tsx', """      const { api } = await mountEdgeWorkspace();
      act(() => live(api).seekTo(0));
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      pressStep('ArrowRight');
      expect(live(api).isPlaying).toBe(true);
      expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(2.25);
      expect(live(api).getLivePosition()).toBeLessThan(2.75);
      act(() => live(api).togglePlayback());
""", """      const { api } = await mountEdgeWorkspace();
      vi.spyOn(Date, 'now').mockReturnValue(Date.now());
      act(() => live(api).seekTo(0));
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      pressStep('ArrowRight');
      expect(live(api).isPlaying).toBe(true);
      expect(live(api).getLivePosition()).toBe(2.25);
      fakeClock.base -= 0.3;
      expect(live(api).getLivePosition()).toBeCloseTo(2.5, 6);
      expect(live(api).isPlaying).toBe(true);
      act(() => live(api).togglePlayback());
""")

# VDS3: freeze Date.now after import; step past the start hold explicitly
sub('video-dock-strings-ui.test.tsx', """    expect(live(api).getLivePosition()).toBe(0);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    await waitFor(() => {
      flushFrames();
      expect(playSpy).toHaveBeenCalled();
""", """    expect(live(api).getLivePosition()).toBe(0);
    vi.useFakeTimers({ toFake: ['Date', 'performance'] });
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    flushFrames();
    expect(playSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    flushFrames();
    expect(playSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
""")

sub('video-dock-strings-ui.test.tsx', """  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('VDS1:""", """  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('VDS1:""")

# SF11: assert the setInterval stub; replace the two real 150 ms waits by fake-clock steps
sub('schedule-failure-ui.test.tsx', """const { startFailure, createdSources, meterSignal, frames, armStartFailure, install, runFrames } =
  createFakeWebAudio();""", """const {
  fakeClock,
  startFailure,
  createdSources,
  meterSignal,
  frames,
  armStartFailure,
  install,
  runFrames,
} = createFakeWebAudio();""")
sub('schedule-failure-ui.test.tsx', """    await flushAsync();
    const master = view.getByTestId('arrangement-master-meter');
    const tracks = view.getAllByTestId('arrangement-track-meter');
    expect(tracks).toHaveLength(2);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    meterSignal.value = 10 ** (-20 / 20);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    runFrames(3);""", """    await flushAsync();
    expect(window.setInterval(() => undefined, 1_000)).toBe(0);
    vi.spyOn(Date, 'now').mockReturnValue(Date.now());
    const master = view.getByTestId('arrangement-master-meter');
    const tracks = view.getAllByTestId('arrangement-track-meter');
    expect(tracks).toHaveLength(2);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    meterSignal.value = 10 ** (-20 / 20);
    fakeClock.base -= 0.15;
    runFrames(3);""")
sub('schedule-failure-ui.test.tsx', """    for (let i = 0; i < 20 && startFailure.thrown === 0; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
      runFrames(1);
    }""", """    for (let i = 0; i < 20 && startFailure.thrown === 0; i++) {
      fakeClock.base -= 0.15;
      runFrames(1);
    }""")

# BW5: replace the wall-clock bound by a deterministic read count on the window object
sub('tempo-window.test.ts', """    const rulerWindow = { fromPx: 1e8, toPx: 1e8 + 3648 };
    const started = performance.now();
    const marks = barsRulerMarks(360_000, 320, 999, rulerWindow);
    const elapsed = performance.now() - started;
""", """    const rulerWindow = { fromPx: 1e8, toPx: 1e8 + 3648 };
    const windowReads = { count: 0 };
    const countedWindow = {
      get fromPx() {
        windowReads.count += 1;
        return rulerWindow.fromPx;
      },
      get toPx() {
        windowReads.count += 1;
        return rulerWindow.toPx;
      },
    };
    const marks = barsRulerMarks(360_000, 320, 999, countedWindow);
""")
sub('tempo-window.test.ts', """    expect(elapsed).toBeLessThan(100);
  });
""", """    expect(windowReads.count).toBeLessThanOrEqual(1_000);
  });
""")

# IM24 (C-R326-01): the playing tail ends with the real end-stop tick, as in the browser
sub('insert-marker-ui.test.tsx', """      key({ key: 'Home', code: 'Home' });
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      key({ key: 'ArrowLeft', code: 'ArrowLeft', ctrlKey: true });""", """      const frames: FrameRequestCallback[] = [];
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      });
      key({ key: 'Home', code: 'Home' });
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      key({ key: 'ArrowLeft', code: 'ArrowLeft', ctrlKey: true });""")
sub('insert-marker-ui.test.tsx', """      for (let step = 0; step < 5; step += 1) {
        key(ctrlRight);
        playingVisits.push(Math.round(live(mounted.api).getLivePosition() * 1000) / 1000);
      }
      expect(playingVisits).toEqual([2, 6, 10, 16, 16]);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(statusText(mounted)).toBe('No more markers after the playhead');
      key(SPACE);""", """      for (let step = 0; step < 4; step += 1) {
        key(ctrlRight);
        playingVisits.push(Math.round(live(mounted.api).getLivePosition() * 1000) / 1000);
      }
      expect(playingVisits).toEqual([2, 6, 10, 16]);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(frames.length).toBeGreaterThan(0);
      advance(0.05);
      const pending = frames.splice(0, frames.length);
      act(() => {
        for (const frame of pending) {
          frame(performance.now());
        }
      });
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(positionOf(mounted.api)).toBe(16);
      key(ctrlRight);
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(positionOf(mounted.api)).toBe(16);
      expect(insertMarkerOf(mounted)).toBe('16.000');
      expect(statusText(mounted)).toBe('No more markers after the insert marker');""")

print('sketch applied')
