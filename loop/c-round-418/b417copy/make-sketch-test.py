# B round 417 -> 418: test half of the SYS-R416-PREVIEW-CONTROLLER sketch. Usage: python3 -I make-sketch-test.py <scratch-root>
import sys
root = sys.argv[1]
p = root + '/app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
s = open(p, encoding='utf-8').read()
def sub(old, new, count):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f'expected {count} of {old!r}, found {n}')
    s = s.replace(old, new)
sub('''    act(() => {
      element.dispatchEvent(new Event('error'));
    });
''', '''    await act(async () => {
      element.dispatchEvent(new Event('error'));
    });
''', 2)
sub('''    act(() => {
      onlyElement().dispatchEvent(new Event('error'));
    });
''', '''    await act(async () => {
      onlyElement().dispatchEvent(new Event('error'));
    });
''', 1)
s += r'''
const SLOW_TITLE = 'Slow Decode';

function decodeCollection() {
  const pending: PendingLoad[] = [];
  const collection: WorkspaceCollection = {
    id: 'decode',
    label: 'decode',
    origin: 'demo',
    sources: [
      { id: 'big', title: BIG_TITLE, collectionLabel: 'decode', kind: 'music', origin: 'demo' },
      { id: 'slow', title: SLOW_TITLE, collectionLabel: 'decode', kind: 'music', origin: 'demo' },
    ],
    loadSource: () =>
      new Promise<AudioBuffer>((resolve, reject) => {
        pending.push({ resolve, reject });
      }),
    canReloadSource: () => true,
    previewUrl: (source) => (source.id === 'big' ? BIG_URL : null),
  };
  return { collection, pending };
}

async function settleAll(pending: PendingLoad[]) {
  while (pending.length > 0) {
    await settleNext(pending, bigBuffer());
  }
}

async function mountDecode() {
  const setup = decodeCollection();
  const api: ProbeRef = { current: null };
  const view = render(
    <ArrangementProvider collection={setup.collection} initialArrangement={streamArrangement()}>
      <StreamProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  await settleAll(setup.pending);
  expect(observedCache().has('big')).toBe(false);
  expect(observedCache().has('slow')).toBe(false);
  return { ...setup, api, view };
}

function bigSources() {
  return startedSources.filter((source) => source.buffer?.duration === BIG_DURATION);
}

describe('SYS-R416 preview controller: request token and deferred fallback', () => {
  beforeEach(() => {
    installGlobals();
    stubTrackedAudioConstructor();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PC1 stop then a re-preview of the same source during its decode starts once, at the second offset', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 5));
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(SLOW_TITLE));
    act(() => live(api).stopLibraryPreview());
    act(() => live(api).startLibraryPreview('slow', 2));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(bigSources()[0]?.startOffset).toBe(2);
    expect(live(api).libraryPreviewSourceId).toBe('slow');
  });

  it('PC2 a stream preview supersedes a pending decode preview of another source', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 0));
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const startsBefore = startedSources.length;
    await settleNext(
      pending,
      new AudioBuffer({ length: SAMPLE_RATE, numberOfChannels: 1, sampleRate: SAMPLE_RATE }),
    );
    expect(observedCache().has('slow')).toBe(true);
    expect(startedSources).toHaveLength(startsBefore);
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
  });

  it('PC3 a stale call whose collection has no live owner writes its refusal and leaves the live preview playing', async () => {
    const { api, view } = await mountDecode();
    const stale = live(api).startLibraryPreview;
    const next = decodeCollection();
    view.rerender(
      <ArrangementProvider collection={next.collection} initialArrangement={streamArrangement()}>
        <StreamProbe api={api} />
      </ArrangementProvider>,
    );
    await flushAsync();
    await settleAll(next.pending);
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => stale('slow', 0));
    expect(live(api).status).toBe(studioLibraryStrings.sourceNotLoaded(SLOW_TITLE));
    expect(live(api).libraryPreviewSourceId).toBe('big');
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
    expect(next.pending).toHaveLength(0);
  });

  it('PC4 a stream error starts the fallback after the media handler returns, never inside it', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const statusBefore = live(api).status;
    act(() => {
      element.dispatchEvent(new Event('error'));
    });
    expect(pending).toHaveLength(0);
    expect(live(api).status).toBe(statusBefore);
    await flushAsync();
    expect(pending).toHaveLength(1);
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });

  it('PC5 a synchronous src throw inside the stream start falls back once, after the start call returns', async () => {
    const NativeAudio = window.Audio;
    vi.stubGlobal(
      'Audio',
      class extends NativeAudio {
        constructor() {
          super();
          Object.defineProperty(this, 'src', {
            configurable: true,
            get: () => '',
            set: () => {
              throw new DOMException('blocked', 'NotSupportedError');
            },
          });
        }
      },
    );
    const { api, pending } = await mountDecode();
    expect(() => act(() => live(api).startLibraryPreview('big', 0))).not.toThrow();
    expect(pending).toHaveLength(0);
    await flushAsync();
    expect(pending).toHaveLength(1);
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(bigSources()[0]?.startOffset).toBe(0);
    expect(createdElements).toHaveLength(1);
  });

  it('PC6 a stop between the stream error and its deferred fallback wins: no decode, no restart, the fallback is still remembered', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => {
      element.dispatchEvent(new Event('error'));
      live(api).stopLibraryPreview();
    });
    await flushAsync();
    expect(pending).toHaveLength(0);
    expect(bigSources()).toHaveLength(0);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    act(() => live(api).startLibraryPreview('big', 0));
    expect(createdElements).toHaveLength(1);
    expect(pending).toHaveLength(1);
  });

  it('PC12 a same-url seek re-targets the stream error: a stall after the seek still falls back, from the element time', async () => {
    const { api, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => live(api).startLibraryPreview('big', 5));
    expect(createdElements).toHaveLength(1);
    expect(element.currentTime).toBe(5);
    await act(async () => {
      element.dispatchEvent(new Event('error'));
    });
    expect(pending).toHaveLength(1);
    expect(live(api).status).toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
    await settleAll(pending);
    expect(bigSources()).toHaveLength(1);
    expect(bigSources()[0]?.startOffset).toBe(5);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });

  it('PC7 unmounting the provider during a decode preview starts nothing when the decode settles', async () => {
    const { api, pending, view } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 0));
    expect(pending).toHaveLength(1);
    const startsBefore = startedSources.length;
    view.unmount();
    await settleAll(pending);
    expect(startedSources).toHaveLength(startsBefore);
  });
});

describe('SYS-R416 preview player re-entrancy and media reads', () => {
  beforeEach(installGlobals);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PC8 a pause fired synchronously inside a same-url seek ends the preview once and throws nothing', () => {
    const scheduler = createFakeStallScheduler();
    const ended = vi.fn();
    const onError = vi.fn();
    const player = streamPlayer(scheduler, ended);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => 0,
      set: () => {
        element.dispatchEvent(new Event('pause'));
      },
    });
    expect(() => player.playLibraryPreviewStream(BIG_URL, 12, onError)).not.toThrow();
    expect(ended).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(element.hasAttribute('src')).toBe(false);
    expect(player.getLibraryPreviewOffset()).toBeNull();
  });

  it('PC9 the stall watchdog reads the element time once per tick and a throwing read is a stream error at the start offset', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 7, onError);
    const element = onlyElement();
    const reads = { count: 0 };
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => {
        reads.count += 1;
        throw new DOMException('gone', 'InvalidStateError');
      },
      set: () => undefined,
    });
    expect(() => scheduler.fire()).not.toThrow();
    expect(reads.count).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(7);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PC10 a media error whose time read throws still reports one stream error at the start offset', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 4, onError);
    const element = onlyElement();
    Object.defineProperty(element, 'currentTime', {
      configurable: true,
      get: () => {
        throw new DOMException('gone', 'InvalidStateError');
      },
      set: () => undefined,
    });
    element.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(4);
    expect(element.hasAttribute('src')).toBe(false);
    expect(scheduler.pending()).toBe(0);
  });

  it('PC11 a stream with a different url releases the previous element before the new one plays', () => {
    const scheduler = createFakeStallScheduler();
    const ended = vi.fn();
    const onError = vi.fn();
    const player = streamPlayer(scheduler, ended);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    player.playLibraryPreviewStream('/other.mp3', 0, onError);
    expect(createdElements).toHaveLength(2);
    const [first, second] = createdElements;
    if (!first || !second) {
      throw new Error('two media elements expected');
    }
    expect(callsOn(mediaCalls.pause, first)).toBe(1);
    expect(first.hasAttribute('src')).toBe(false);
    first.dispatchEvent(new Event('ended'));
    first.dispatchEvent(new Event('error'));
    expect(ended).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(second.getAttribute('src')).toBe('/other.mp3');
    expect(callsOn(mediaCalls.play, second)).toBe(1);
    expect(scheduler.pending()).toBe(1);
  });
});
'''
open(p, 'w', encoding='utf-8').write(s)
print('test sketch applied')
