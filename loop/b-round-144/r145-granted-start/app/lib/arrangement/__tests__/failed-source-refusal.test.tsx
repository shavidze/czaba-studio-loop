import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  formatArrangementTime,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioLibraryStrings } from '../strings';

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  connect(destination: FakeNode) {
    return destination;
  }
  disconnect() {}
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  get currentTime() {
    return Date.now() / 1000 - fakeClock.base;
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return new FakeGain();
  }
  createStereoPanner() {
    return new FakePanner();
  }
  createBufferSource() {
    return new FakeSource();
  }
}

class FakeOfflineAudioContext {}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  getChannelData() {
    return new Float32Array(this.length);
  }
}

const OK_TITLE = 'Ready Song';
const BAD_TITLE = 'Broken Song';
const SLOW_TITLE = 'Slow Song';
const LOADER_ERROR = 'ფაილი ვერ ჩაიტვირთა (ქსელი)';
const NO_SOURCE = studioLibraryStrings.selectSoundFirst;

function failedText(title: string): string {
  return studioLibraryStrings.sourceFailed(title);
}

function loadingText(title: string): string {
  return studioLibraryStrings.sourceNotLoaded(title);
}

interface SlowLoad {
  resolve: (buffer: AudioBuffer) => void;
  reject: (error: Error) => void;
}

function refusalCollection() {
  const slow: { current: SlowLoad | null } = { current: null };
  const collection: WorkspaceCollection = {
    id: 'refusal',
    label: 'refusal',
    origin: 'demo',
    sources: [
      { id: 'ok', title: OK_TITLE, collectionLabel: 'refusal', kind: 'music', origin: 'demo' },
      { id: 'bad', title: BAD_TITLE, collectionLabel: 'refusal', kind: 'music', origin: 'demo' },
      { id: 'slow', title: SLOW_TITLE, collectionLabel: 'refusal', kind: 'music', origin: 'demo' },
    ],
    loadSource: (source) => {
      if (source.id === 'bad') {
        return Promise.reject(new Error(LOADER_ERROR));
      }
      if (source.id === 'slow') {
        return new Promise<AudioBuffer>((resolve, reject) => {
          slow.current = { resolve, reject };
        });
      }
      return Promise.resolve(
        new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
      );
    },
  };
  return { collection, slow };
}

function refusalArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
}

interface RefusalApiRef {
  current: ArrangementContextValue | null;
}

function RefusalProbe({ api }: { api: RefusalApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: RefusalApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushAsync(rounds = 5) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function mountRefusal() {
  const { collection, slow } = refusalCollection();
  const api: RefusalApiRef = { current: null };
  render(
    <ArrangementProvider collection={collection} initialArrangement={refusalArrangement()}>
      <RefusalProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  expect(live(api).sourceStates.ok?.status).toBe('ready');
  expect(live(api).sourceStates.bad?.status).toBe('error');
  expect(live(api).sourceStates.slow?.status).toBe('loading');
  return { api, slow };
}

describe('library refusal text for a failed source (C-R95-N1)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('FS1 refuses to add a failed source with the failed text and no loader detail', async () => {
    const { api } = await mountRefusal();
    const clipsBefore = live(api).arrangement.clips.length;
    act(() => live(api).addSourceToActiveTrack('bad'));
    expect(live(api).status).toBe(failedText(BAD_TITLE));
    expect(live(api).status).not.toContain('(ქსელი)');
    expect(live(api).arrangement.clips.length).toBe(clipsBefore);
    expect(live(api).undoLabel).toBe(null);
  });

  it('FS2 gives the failed text when the failed source is the selection', async () => {
    const { api } = await mountRefusal();
    act(() => live(api).selectSource('bad'));
    act(() => live(api).addSourceToActiveTrack());
    expect(live(api).status).toBe(failedText(BAD_TITLE));
    expect(live(api).arrangement.clips.length).toBe(0);
  });

  it('FS3 keeps the loading text for a source that is still loading', async () => {
    const { api } = await mountRefusal();
    act(() => live(api).addSourceToActiveTrack('slow'));
    expect(live(api).status).toBe(loadingText(SLOW_TITLE));
    expect(live(api).arrangement.clips.length).toBe(0);
  });

  it('FS4 stops a running preview and gives the failed text when previewing a failed source', async () => {
    const { api } = await mountRefusal();
    act(() => live(api).startLibraryPreview('ok', 0));
    expect(live(api).libraryPreviewSourceId).toBe('ok');
    act(() => live(api).startLibraryPreview('bad', 0));
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).toBe(failedText(BAD_TITLE));
    expect(live(api).arrangement.clips.length).toBe(0);
  });

  it('FS5 keeps the loading text when previewing a source that is still loading', async () => {
    const { api } = await mountRefusal();
    act(() => live(api).startLibraryPreview('slow', 0));
    expect(live(api).libraryPreviewSourceId).toBe(null);
    expect(live(api).status).toBe(loadingText(SLOW_TITLE));
  });

  it('FS6 keeps the selection prompt for an unknown id', async () => {
    const { api } = await mountRefusal();
    act(() => live(api).addSourceToActiveTrack('nope'));
    expect(live(api).status).toBe(NO_SOURCE);
    expect(live(api).arrangement.clips.length).toBe(0);
  });

  it('FS7 still adds exactly one clip for a ready source', async () => {
    const { api } = await mountRefusal();
    act(() => live(api).addSourceToActiveTrack('ok'));
    expect(live(api).arrangement.clips.length).toBe(1);
    expect(live(api).arrangement.clips[0]?.sourceId).toBe('ok');
    expect(live(api).arrangement.clips[0]?.start).toBe(0);
    expect(live(api).status).toBe(
      studioLibraryStrings.clipAdded({
        title: OK_TITLE,
        track: 'მუსიკა',
        time: formatArrangementTime(0),
        suffix: '',
      }),
    );
  });

  it('FS8 follows the current state when a loading source fails later', async () => {
    const { api, slow } = await mountRefusal();
    act(() => live(api).addSourceToActiveTrack('slow'));
    expect(live(api).status).toBe(loadingText(SLOW_TITLE));
    const pending = slow.current;
    if (!pending) {
      throw new Error('slow load not started');
    }
    pending.reject(new Error(LOADER_ERROR));
    await flushAsync();
    expect(live(api).sourceStates.slow?.status).toBe('error');
    act(() => live(api).addSourceToActiveTrack('slow'));
    expect(live(api).status).toBe(failedText(SLOW_TITLE));
    expect(live(api).arrangement.clips.length).toBe(0);
  });
});
