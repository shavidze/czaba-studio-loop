# B round 420 -> 421: test half of the SYS-R418-PREVIEW-LIFECYCLE sketch.
# Usage: python3 -I make-sketch-test.py <scratch-root>
import sys
root = sys.argv[1]
T = 'app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
p = root + '/' + T
s = open(p, encoding='utf-8').read()


def sub(old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f'{T}: expected 1 of {old!r}, found {n}')
    s = s.replace(old, new)


# A-R418-REVIEW-L3: the title says what the body drives (an error after the seek).
sub("  it('PC12 a same-url seek re-targets the stream error: a stall after the seek still falls back, from the element time', async () => {",
    "  it('PC12 a same-url seek re-targets the stream error: an error after the seek still falls back, from the element time', async () => {")

if not s.endswith('});\n'):
    sys.exit('unexpected file end')

s += '''
function rerenderWith(
  view: ReturnType<typeof render>,
  api: ProbeRef,
  collection: WorkspaceCollection,
) {
  view.rerender(
    <ArrangementProvider collection={collection} initialArrangement={streamArrangement()}>
      <StreamProbe api={api} />
    </ArrangementProvider>,
  );
}

function throwingTimeAfter(element: HTMLAudioElement) {
  const reads = { count: 0 };
  Object.defineProperty(element, 'currentTime', {
    configurable: true,
    get: () => {
      reads.count += 1;
      throw new DOMException('gone', 'InvalidStateError');
    },
    set: () => undefined,
  });
  return reads;
}

describe('SYS-R418 preview lifecycle: collection change, unmount and guarded reads', () => {
  beforeEach(() => {
    installGlobals();
    stubTrackedAudioConstructor();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PL1 a collection change stops a playing stream preview: the element is released and the preview id clears', async () => {
    const { api, view } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    expect(live(api).libraryPreviewSourceId).toBe('big');
    const next = decodeCollection();
    act(() => rerenderWith(view, api, next.collection));
    await flushAsync();
    expect(callsOn(mediaCalls.pause, element)).toBe(1);
    expect(element.hasAttribute('src')).toBe(false);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).getLibraryPreviewOffset()).toBeNull();
  });

  it('PL2 a stream fallback queued before a collection change never starts a source of the new collection', async () => {
    const { api, view, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const next = decodeCollection();
    act(() => {
      element.dispatchEvent(new Event('error'));
      rerenderWith(view, api, next.collection);
    });
    await flushAsync();
    await settleAll(next.pending);
    expect(createdElements).toHaveLength(1);
    expect(pending).toHaveLength(0);
    expect(next.pending).toHaveLength(0);
    expect(bigSources()).toHaveLength(0);
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceNotLoaded(BIG_TITLE));
    expect(live(api).status).not.toBe(studioLibraryStrings.sourceDecoding(BIG_TITLE));
  });

  it('PL3 a decode preview pending across a collection change starts nothing when its decode settles', async () => {
    const { api, view, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('slow', 0));
    expect(pending).toHaveLength(1);
    const startsBefore = startedSources.length;
    const next = decodeCollection();
    act(() => rerenderWith(view, api, next.collection));
    await flushAsync();
    await settleAll(pending);
    await settleAll(next.pending);
    expect(startedSources).toHaveLength(startsBefore);
    expect(live(api).libraryPreviewSourceId).toBe(null);
  });

  it('PL4 lock: a stream error queued before the provider unmounts starts nothing after it (defence; no observable effect by design)', async () => {
    const { api, view, pending } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    const startsBefore = startedSources.length;
    act(() => {
      element.dispatchEvent(new Event('error'));
      view.unmount();
    });
    await flushAsync();
    expect(createdElements).toHaveLength(1);
    expect(pending).toHaveLength(0);
    expect(startedSources).toHaveLength(startsBefore);
  });

  it('PL5 a provider re-render with the same collection keeps the stream preview playing', async () => {
    const { api, view, collection } = await mountDecode();
    act(() => live(api).startLibraryPreview('big', 0));
    const element = onlyElement();
    act(() => rerenderWith(view, api, collection));
    await flushAsync();
    expect(callsOn(mediaCalls.pause, element)).toBe(0);
    expect(element.getAttribute('src')).toBe(BIG_URL);
    expect(live(api).libraryPreviewSourceId).toBe('big');
  });
});

describe('SYS-R418 preview player: the read fallback follows the seek', () => {
  beforeEach(installGlobals);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PL6 after a same-url seek a media error whose time read throws reports the seek offset, not the first start', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    player.playLibraryPreviewStream(BIG_URL, 6, onError);
    throwingTimeAfter(element);
    element.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(6);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PL7 a watchdog armed at a real time whose tick read throws reports a stall at the armed time', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    element.currentTime = 3;
    element.dispatchEvent(new Event('waiting'));
    expect(scheduler.pending()).toBe(1);
    const reads = throwingTimeAfter(element);
    expect(() => scheduler.fire()).not.toThrow();
    expect(reads.count).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(3);
    expect(element.hasAttribute('src')).toBe(false);
  });

  it('PL8 the preview offset never throws: a throwing read returns the latest seek offset while the stream is active', () => {
    const scheduler = createFakeStallScheduler();
    const onError = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, onError);
    const element = onlyElement();
    player.playLibraryPreviewStream(BIG_URL, 6, onError);
    throwingTimeAfter(element);
    expect(() => player.getLibraryPreviewOffset()).not.toThrow();
    expect(player.getLibraryPreviewOffset()).toBe(6);
    expect(onError).not.toHaveBeenCalled();
    expect(element.getAttribute('src')).toBe(BIG_URL);
  });

  it('PL9 a same-url seek then a stall falls back through the newest request at the seek time', () => {
    const scheduler = createFakeStallScheduler();
    const first = vi.fn();
    const second = vi.fn();
    const player = streamPlayer(scheduler);
    player.playLibraryPreviewStream(BIG_URL, 0, first);
    const element = onlyElement();
    element.dispatchEvent(new Event('playing'));
    player.playLibraryPreviewStream(BIG_URL, 5, second);
    expect(scheduler.pending()).toBe(0);
    element.dispatchEvent(new Event('waiting'));
    expect(scheduler.pending()).toBe(1);
    scheduler.fire();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(5);
    expect(element.hasAttribute('src')).toBe(false);
  });
});
'''
open(p, 'w', encoding='utf-8').write(s)
print('test sketch applied')
