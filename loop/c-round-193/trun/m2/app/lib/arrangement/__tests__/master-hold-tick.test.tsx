import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementMaster } from '~/components/arrangement/ArrangementMaster';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { METER_CEILING_DB, METER_FLOOR_DB } from '~/lib/arrangement/meter';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

const TOP_CLAMPED_HOLD_TRANSFORM = 'translateX(calc(100% - 1px))';
const fakeClock = { base: 0 };
const meterSignal = { value: 0 };

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  outputs: FakeNode[] = [];
  connect(destination: FakeNode) {
    this.outputs.push(destination);
    return destination;
  }
  disconnect() {
    this.outputs = [];
  }
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

class FakeAnalyser extends FakeNode {
  fftSize = 2048;
  getFloatTimeDomainData(target: Float32Array) {
    target.fill(meterSignal.value);
  }
}

class FakeSplitter extends FakeNode {}

class MeteredAudioContext {
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
  createChannelSplitter() {
    return new FakeSplitter();
  }
  createAnalyser() {
    return new FakeAnalyser();
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

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const holdTickCollection: WorkspaceCollection = {
  id: 'hold-tick',
  label: 'hold-tick',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'hold-tick', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function holdTickArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [
      {
        id: 'music-1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 20,
      },
    ],
  };
}

interface HoldTickApiRef {
  current: ArrangementContextValue | null;
}

function HoldTickProbe({ api }: { api: HoldTickApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: HoldTickApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function dbfsToSample(db: number): number {
  return 10 ** (db / 20);
}

function snapshotHoldPercent(db: number): number {
  return ((db - METER_FLOOR_DB) / (METER_CEILING_DB - METER_FLOOR_DB)) * 100;
}

function plainHoldPercent(hold: HTMLElement): number {
  const match = /^translateX\((-?\d+(?:\.\d+)?(?:e-?\d+)?)%\)$/.exec(hold.style.transform);
  return match ? Number(match[1]) : Number.NaN;
}

describe('Master hold tick geometry, structural pins on the written style; jsdom has no layout (MASTER-HOLD-TICK-EDGE, D-29z8)', () => {
  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    meterSignal.value = 0;
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', MeteredAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function runFrames(count = 1) {
    for (let index = 0; index < count; index++) {
      const pending = frames.splice(0, frames.length);
      act(() => {
        for (const frame of pending) {
          frame(performance.now());
        }
      });
    }
  }

  async function mountPlayingMaster() {
    const api: HoldTickApiRef = { current: null };
    const view = render(
      <ArrangementProvider
        collection={holdTickCollection}
        initialArrangement={holdTickArrangement()}
      >
        <ArrangementMaster />
        <HoldTickProbe api={api} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const meter = view.getByTestId('arrangement-master-meter');
    const hold = meter.lastElementChild;
    if (!(hold instanceof HTMLElement)) {
      throw new Error('hold layer missing');
    }
    const tick = hold.firstElementChild;
    if (!(tick instanceof HTMLElement)) {
      throw new Error('hold tick missing');
    }
    const play = async () => {
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
    };
    const stop = () => {
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(false);
    };
    const replay = async () => {
      stop();
      expect(meter.getAttribute('data-hold-db')).toBe('-inf');
      await play();
    };
    const publishDb = (db: number) => {
      meterSignal.value = dbfsToSample(db);
      runFrames(3);
    };
    await play();
    return { meter, hold, tick, publishDb, replay, stop };
  }

  it('HT1: at +6 dB, at +12 dB (its fraction clamps to the top) and at +5.5 dB the hold stops 1 px before the right edge, so the 2 px tick stays inside; +4.9 dB keeps the unclamped position', async () => {
    const { meter, hold, tick, publishDb, replay, stop } = await mountPlayingMaster();
    publishDb(METER_CEILING_DB);
    expect(meter.getAttribute('data-hold-db')).toBe('6.0');
    expect(hold.style.transform).toBe(TOP_CLAMPED_HOLD_TRANSFORM);
    expect(hold.style.visibility).toBe('visible');
    expect(tick.classList.contains('w-0.5')).toBe(true);
    expect(tick.classList.contains('-ml-px')).toBe(true);
    await replay();
    publishDb(12);
    expect(meter.getAttribute('data-hold-db')).toBe('12.0');
    expect(hold.style.transform).toBe(TOP_CLAMPED_HOLD_TRANSFORM);
    await replay();
    publishDb(5.5);
    expect(meter.getAttribute('data-hold-db')).toBe('5.5');
    expect(hold.style.transform).toBe(TOP_CLAMPED_HOLD_TRANSFORM);
    await replay();
    publishDb(4.9);
    expect(meter.getAttribute('data-hold-db')).toBe('4.9');
    expect(plainHoldPercent(hold)).toBeCloseTo(snapshotHoldPercent(4.9), 4);
    stop();
  });

  it('HT2: at 0 dBFS the hold transform is the unclamped position (60/66 of the box), on the 0 dBFS mark', async () => {
    const { meter, hold, publishDb, stop } = await mountPlayingMaster();
    publishDb(0);
    expect(meter.getAttribute('data-hold-db')).toBe('0.0');
    expect(plainHoldPercent(hold)).toBeCloseTo((60 / 66) * 100, 4);
    expect(plainHoldPercent(hold)).toBeCloseTo(snapshotHoldPercent(0), 4);
    expect(hold.classList.contains('inset-0')).toBe(true);
    expect([...hold.classList].some((name) => /^(right|left|inset-x)-/.test(name))).toBe(false);
    expect(hold.style.visibility).toBe('visible');
    stop();
  });

  it('HT3: at −12 dBFS the position follows the snapshot formula and is visible; Pause floors the hold and hides the tick', async () => {
    const { meter, hold, publishDb, stop } = await mountPlayingMaster();
    publishDb(-12);
    expect(meter.getAttribute('data-hold-db')).toBe('-12.0');
    expect(plainHoldPercent(hold)).toBeCloseTo((48 / 66) * 100, 4);
    expect(plainHoldPercent(hold)).toBeCloseTo(snapshotHoldPercent(-12), 4);
    expect(hold.style.visibility).toBe('visible');
    stop();
    expect(meter.getAttribute('data-hold-db')).toBe('-inf');
    expect(hold.style.visibility).toBe('hidden');
  });
});
