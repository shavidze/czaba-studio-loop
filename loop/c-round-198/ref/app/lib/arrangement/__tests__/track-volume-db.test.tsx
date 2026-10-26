import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { applySchedule } from '~/lib/arrangement/graph.client';
import type { Arrangement, ArrangementTrack, WorkspaceCollection } from '~/types/arrangement';
import { arrangementGroups } from '../groups';
import { createArrangement } from '../model';
import {
  formatTrackVolumeDb,
  formatTrackVolumeReadout,
  TRACK_VOLUME_DB_FLOOR,
  TRACK_VOLUME_DB_MIN,
  trackVolumeFromDb,
  trackVolumeReadoutDb,
  trackVolumeSliderDb,
} from '../track-volume-db';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, applySchedule: vi.fn(actual.applySchedule) };
});

const applyScheduleMock = vi.mocked(applySchedule);

const VOLUME_LABEL = 'Volume';
const MASTER_VOLUME_LABEL = 'Master Volume';
const VIDEO_MIX_LABEL = 'Original video sound';
const TRACK_IDS = ['video', 'music', 'sfx'] as const;

const fakeClock = { base: 0 };

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
  disconnect() {}
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: { id: string } | null = null;
  onended: ((event: Event) => unknown) | null = null;
  start() {}
  stop() {}
}

const audioLog: { sources: FakeSource[]; gains: FakeGain[] } = { sources: [], gains: [] };

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
    const gain = new FakeGain();
    audioLog.gains.push(gain);
    return gain;
  }
  createStereoPanner() {
    return new FakePanner();
  }
  createBufferSource() {
    const source = new FakeSource();
    audioLog.sources.push(source);
    return source;
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

const volumeCollection: WorkspaceCollection = {
  id: 'track-volume-db',
  label: 'track-volume-db',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'track-volume-db',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'track-volume-db', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function volumeArrangement(volumes: Partial<Record<string, number>> = { music: 0.6 }): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) => ({ ...track, volume: volumes[track.id] ?? track.volume })),
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ],
  };
}

interface VolumeApiRef {
  current: ArrangementContextValue | null;
}

function VolumeProbe({ api }: { api: VolumeApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: VolumeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function trackOf(arrangement: Arrangement, id: string): ArrangementTrack {
  const track = arrangement.tracks.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`track ${id} missing`);
  }
  return track;
}

function storedVolume(api: VolumeApiRef, id: string): number {
  return trackOf(live(api).getArrangement(), id).volume;
}

function undoChainLabels(api: VolumeApiRef): string[] {
  const labels: string[] = [];
  for (let label = live(api).undoLabel; label !== null; label = live(api).undoLabel) {
    labels.push(label);
    act(() => live(api).undo());
  }
  return labels;
}

function liveTrackGain(id: (typeof TRACK_IDS)[number]): FakeGain {
  const trackGains = audioLog.gains.filter((gain) =>
    gain.outputs.some((output) => output instanceof FakePanner),
  );
  const gain = trackGains.slice(-TRACK_IDS.length)[TRACK_IDS.indexOf(id)];
  if (!gain) {
    throw new Error(`track gain ${id} missing`);
  }
  return gain;
}

const press = { button: 0, buttons: 1 };

function stubFaderWidth(input: HTMLInputElement, width: number) {
  Object.defineProperty(input, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(0, 0, width, 4),
  });
}

function windowPointer(
  type: 'pointermove' | 'pointerup' | 'pointercancel',
  pointerId: number,
  clientX: number,
  shiftKey = false,
) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX, shiftKey }));
  });
}

function dragFader(
  input: HTMLInputElement,
  options: {
    pointerId: number;
    width?: number;
    deltaPx: number;
    shiftKey?: boolean;
    release?: boolean;
  },
) {
  const width = options.width ?? 100;
  stubFaderWidth(input, width);
  const startX = width / 2;
  const shiftKey = options.shiftKey === true;
  fireEvent.pointerDown(input, {
    ...press,
    pointerId: options.pointerId,
    clientX: startX,
    shiftKey,
  });
  windowPointer('pointermove', options.pointerId, startX + options.deltaPx, shiftKey);
  if (options.release !== false) {
    windowPointer('pointerup', options.pointerId, startX + options.deltaPx, shiftKey);
  }
}

function keyboardValue(input: HTMLInputElement, value: string, key = 'ArrowLeft') {
  input.focus();
  fireEvent.keyDown(input, { key, code: key });
  fireEvent.change(input, { target: { value } });
  fireEvent.keyUp(input, { key, code: key });
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountVolumeWorkspace(volumes?: Partial<Record<string, number>>) {
  const api: VolumeApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={volumeCollection}
      initialArrangement={volumeArrangement(volumes)}
    >
      <StudioWorkspace />
      <VolumeProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  const rangeInput = (selector: string) => {
    const input = view.container.querySelector(selector);
    if (!(input instanceof HTMLInputElement) || input.type !== 'range') {
      throw new Error(`range ${selector} missing`);
    }
    return input;
  };
  const laneVolume = (trackId: (typeof TRACK_IDS)[number]) =>
    rangeInput(`[data-track-id="${trackId}"] input[aria-label^="Volume — "]`);
  const readout = (trackId: (typeof TRACK_IDS)[number]) => {
    const span = laneVolume(trackId).nextElementSibling;
    if (!(span instanceof HTMLSpanElement)) {
      throw new Error(`readout ${trackId} missing`);
    }
    return span;
  };
  const master = () => rangeInput('input[aria-label="Master Volume"]');
  const laneName = (name: string) =>
    view.getByRole('button', { name: new RegExp(`^${name} — set as the active track`) });
  const groupFader = () => rangeInput('[data-testid="arrangement-group-volume"]');
  const heightHandle = (trackId: (typeof TRACK_IDS)[number]) => {
    const handle = view.container.querySelector(
      `[data-track-id="${trackId}"] [data-testid="arrangement-track-height"]`,
    );
    if (!(handle instanceof HTMLElement)) {
      throw new Error(`height handle ${trackId} missing`);
    }
    return handle;
  };
  return { api, view, laneVolume, readout, master, laneName, groupFader, heightHandle };
}

describe('track Volume in dB with −∞ (D-29z81, T12 stage 3a)', () => {
  describe('pure conversion', () => {
    it('TV1: slider dB → stored linear: −60 and below, and NaN, are exactly 0; the top clamps to 1', () => {
      expect(trackVolumeFromDb(TRACK_VOLUME_DB_MIN)).toBe(0);
      expect(trackVolumeFromDb(-60)).toBe(0);
      expect(trackVolumeFromDb(-60.5)).toBe(0);
      expect(trackVolumeFromDb(-59.9)).toBe(10 ** (-59.9 / 20));
      expect(trackVolumeFromDb(-6)).toBe(10 ** -0.3);
      expect(trackVolumeFromDb(0)).toBe(1);
      expect(trackVolumeFromDb(3)).toBe(1);
      expect(trackVolumeFromDb(Number.NaN)).toBe(0);
      expect(trackVolumeFromDb(Number.NEGATIVE_INFINITY)).toBe(0);
      expect(trackVolumeFromDb(Number.POSITIVE_INFINITY)).toBe(0);
      expect(trackVolumeFromDb(-0)).toBe(1);
    });

    it('TV2: stored linear → slider position, readout dB and text', () => {
      const cases: Array<[number, number, string, string]> = [
        [1, 0, '+0.0 dB', '+0.0'],
        [0.5, -6, '−6.0 dB', '−6.0'],
        [0.6, -4.4, '−4.4 dB', '−4.4'],
        [0, -60, '−∞ dB', '−∞'],
        [1e-4, -59.9, '−80.0 dB', '−80.0'],
        [-0.2, -60, '−∞ dB', '−∞'],
        [Number.NaN, -60, '−∞ dB', '−∞'],
        [-0, -60, '−∞ dB', '−∞'],
        [Number.POSITIVE_INFINITY, -60, '−∞ dB', '−∞'],
        [2, 0, '+6.0 dB', '+6.0'],
      ];
      for (const [volume, position, text, visible] of cases) {
        expect(trackVolumeSliderDb(volume), String(volume)).toBe(position);
        expect(formatTrackVolumeDb(volume), String(volume)).toBe(text);
        expect(formatTrackVolumeReadout(volume), String(volume)).toBe(visible);
      }
      expect(trackVolumeReadoutDb(1e-4)).toBe(-80);
      expect(trackVolumeReadoutDb(0)).toBeNull();
      expect(trackVolumeSliderDb(1e-4)).toBe(TRACK_VOLUME_DB_FLOOR);
      expect(Object.is(trackVolumeSliderDb(0.9999), 0)).toBe(true);
      expect(formatTrackVolumeDb(0.9999)).toBe('+0.0 dB');
    });
  });

  describe('lane fader', () => {
    beforeEach(() => {
      fakeClock.base = Date.now() / 1000;
      audioLog.sources = [];
      audioLog.gains = [];
      applyScheduleMock.mockClear();
      vi.stubGlobal('AudioContext', FakeAudioContext);
      vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
      vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
      vi.stubGlobal('ResizeObserver', FakeResizeObserver);
      vi.stubGlobal('requestAnimationFrame', () => 1);
      vi.stubGlobal('cancelAnimationFrame', () => undefined);
      vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
      vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
      vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('TV3: the lane slider, aria-valuetext and readout show dB for 0.6, 1 and 0; the video lane uses the same mapping', async () => {
      const { laneVolume, readout, heightHandle } = await mountVolumeWorkspace({
        music: 0.6,
        sfx: 0,
      });
      const music = laneVolume('music');
      expect(music.value).toBe('-4.4');
      expect(music.min).toBe('-60');
      expect(music.max).toBe('0');
      expect(music.getAttribute('aria-valuetext')).toBe('−4.4 dB');
      expect(readout('music').textContent).toBe('−4.4');
      expect(readout('music').getAttribute('title')).toBe('−4.4 dB');
      expect(readout('music').textContent).not.toContain('%');
      const video = laneVolume('video');
      expect(video.value).toBe('0');
      expect(video.getAttribute('aria-valuetext')).toBe('+0.0 dB');
      expect(readout('video').textContent).toBe('+0.0');
      expect(readout('video').getAttribute('title')).toBe('+0.0 dB');
      const sfx = laneVolume('sfx');
      expect(sfx.value).toBe('-60');
      expect(sfx.getAttribute('aria-valuetext')).toBe('−∞ dB');
      expect(readout('sfx').textContent).toBe('−∞');
      fireEvent.keyDown(heightHandle('video'), { key: 'ArrowUp' });
      expect(Number(heightHandle('video').getAttribute('aria-valuenow'))).toBeLessThan(80);
      expect(laneVolume('video').getAttribute('title')).toBe(VIDEO_MIX_LABEL);
      expect(laneVolume('video').getAttribute('aria-valuetext')).toBe('+0.0 dB');
    });

    it('TV4: a −25 px drag from 0.6 stores trackVolumeFromDb(−19.4) with one entry; Undo/Redo are exact; no-move and move-back write nothing', async () => {
      const { api, laneVolume, readout } = await mountVolumeWorkspace();
      dragFader(laneVolume('music'), { pointerId: 11, deltaPx: -25 });
      expect(storedVolume(api, 'music')).toBe(trackVolumeFromDb(-19.4));
      expect(laneVolume('music').getAttribute('aria-valuetext')).toBe('−19.4 dB');
      expect(readout('music').textContent).toBe('−19.4');
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      act(() => live(api).undo());
      expect(storedVolume(api, 'music')).toBe(0.6);
      expect(live(api).undoLabel).toBeNull();
      act(() => live(api).redo());
      expect(storedVolume(api, 'music')).toBe(trackVolumeFromDb(-19.4));
      act(() => live(api).undo());
      dragFader(laneVolume('music'), { pointerId: 12, deltaPx: 0 });
      expect(storedVolume(api, 'music')).toBe(0.6);
      expect(live(api).undoLabel).toBeNull();
      dragFader(laneVolume('music'), { pointerId: 13, deltaPx: -25, release: false });
      expect(storedVolume(api, 'music')).toBe(trackVolumeFromDb(-19.4));
      windowPointer('pointermove', 13, 50);
      expect(storedVolume(api, 'music')).toBe(0.6);
      windowPointer('pointerup', 13, 50);
      expect(storedVolume(api, 'music')).toBe(0.6);
      expect(live(api).undoLabel).toBeNull();
    });

    it('TV5: a far-left drag stores exactly 0 (−∞); ArrowRight gives −59.9 dB and ArrowLeft returns to 0', async () => {
      const { api, laneVolume, readout } = await mountVolumeWorkspace();
      dragFader(laneVolume('music'), { pointerId: 21, deltaPx: -400 });
      expect(storedVolume(api, 'music')).toBe(0);
      expect(readout('music').textContent).toBe('−∞');
      expect(laneVolume('music').getAttribute('aria-valuetext')).toBe('−∞ dB');
      expect(laneVolume('music').value).toBe('-60');
      keyboardValue(laneVolume('music'), '-59.9', 'ArrowRight');
      expect(storedVolume(api, 'music')).toBe(trackVolumeFromDb(-59.9));
      expect(readout('music').textContent).toBe('−59.9');
      keyboardValue(laneVolume('music'), '-60', 'ArrowLeft');
      expect(storedVolume(api, 'music')).toBe(0);
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL, VOLUME_LABEL, VOLUME_LABEL]);
      expect(storedVolume(api, 'music')).toBe(0.6);
    });

    it('TV6: a far-right drag from 0.6 stores exactly 1', async () => {
      const { api, laneVolume, readout } = await mountVolumeWorkspace();
      dragFader(laneVolume('music'), { pointerId: 31, deltaPx: 400 });
      expect(storedVolume(api, 'music')).toBe(1);
      expect(readout('music').textContent).toBe('+0.0');
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
    });

    it('TV7: from 1, ArrowLeft ×3 (change + keyup each) gives −0.3 dB with three entries', async () => {
      const { api, laneVolume, readout } = await mountVolumeWorkspace();
      for (const value of ['-0.1', '-0.2', '-0.3']) {
        keyboardValue(laneVolume('sfx'), value);
      }
      expect(storedVolume(api, 'sfx')).toBe(trackVolumeFromDb(-0.3));
      expect(readout('sfx').textContent).toBe('−0.3');
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL, VOLUME_LABEL, VOLUME_LABEL]);
      expect(storedVolume(api, 'sfx')).toBe(1);
    });

    it('TV8: a double-click from 0.6 resets to 1 with one entry; a second double-click adds none', async () => {
      const { api, laneVolume, readout } = await mountVolumeWorkspace();
      fireEvent.dblClick(laneVolume('music'));
      expect(storedVolume(api, 'music')).toBe(1);
      expect(readout('music').textContent).toBe('+0.0');
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      fireEvent.dblClick(laneVolume('music'));
      expect(storedVolume(api, 'music')).toBe(1);
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
      expect(storedVolume(api, 'music')).toBe(0.6);
    });

    it('TV9: the video lane change to −6 + keyup stores 10^(−0.3) with one entry', async () => {
      const { api, laneVolume, readout } = await mountVolumeWorkspace();
      keyboardValue(laneVolume('video'), '-6');
      expect(storedVolume(api, 'video')).toBe(10 ** -0.3);
      expect(readout('video').textContent).toBe('−6.0');
      expect(laneVolume('video').getAttribute('aria-valuetext')).toBe('−6.0 dB');
      expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
    });

    it('TV10: a drag during playback reaches the track gain as the linear value without a new schedule or new sources', async () => {
      const { api, laneVolume } = await mountVolumeWorkspace();
      await flushLoads();
      act(() => live(api).togglePlayback());
      expect(live(api).isPlaying).toBe(true);
      const musicGain = liveTrackGain('music');
      expect(musicGain.gain.value).toBe(0.6);
      const schedules = applyScheduleMock.mock.calls.length;
      const sourceCount = audioLog.sources.length;
      dragFader(laneVolume('music'), { pointerId: 41, deltaPx: -25, release: false });
      expect(musicGain.gain.value).toBe(trackVolumeFromDb(-19.4));
      windowPointer('pointermove', 41, 0);
      windowPointer('pointerup', 41, 0);
      expect(storedVolume(api, 'music')).toBe(trackVolumeFromDb(-34.4));
      expect(musicGain.gain.value).toBe(trackVolumeFromDb(-34.4));
      expect(applyScheduleMock.mock.calls.length).toBe(schedules);
      expect(audioLog.sources.length).toBe(sourceCount);
      expect(live(api).isPlaying).toBe(true);
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      act(() => live(api).togglePlayback());
    });

    it('TV11: group fader in dB, Master keeps its drag, context previews stay linear, Shift is ten times finer', async () => {
      const { api, view, laneVolume, readout, master, laneName, groupFader } =
        await mountVolumeWorkspace();
      act(() => live(api).previewTrackVolume('music', 0.72));
      act(() => live(api).commitTrackVolume('music'));
      expect(storedVolume(api, 'music')).toBe(0.72);
      expect(laneVolume('music').value).toBe('-2.9');
      expect(readout('music').textContent).toBe('−2.9');
      dragFader(master(), { pointerId: 51, width: 132, deltaPx: -24 });
      expect(live(api).arrangement.master.gainDb).toBe(-12);
      expect(undoChainLabels(api)).toEqual([MASTER_VOLUME_LABEL, VOLUME_LABEL]);
      dragFader(laneVolume('music'), { pointerId: 52, deltaPx: -20 });
      const plain = storedVolume(api, 'music');
      act(() => live(api).undo());
      dragFader(laneVolume('music'), { pointerId: 53, deltaPx: -20, shiftKey: true });
      expect(plain).toBe(trackVolumeFromDb(-16.4));
      expect(storedVolume(api, 'music')).toBe(trackVolumeFromDb(-5.6));
      expect(storedVolume(api, 'music')).not.toBe(plain);
      act(() => live(api).undo());
      fireEvent.click(laneName('მუსიკა'));
      fireEvent.click(laneName('SFX'), { shiftKey: true });
      fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG', ctrlKey: true });
      expect(arrangementGroups(live(api).getArrangement())).toHaveLength(1);
      dragFader(groupFader(), { pointerId: 54, deltaPx: -25 });
      expect(arrangementGroups(live(api).getArrangement())[0]?.volume).toBe(trackVolumeFromDb(-15));
      expect(groupFader().getAttribute('aria-valuetext')).toBe('−15.0 dB');
      expect(groupFader().getAttribute('title')).toBe('Volume −15.0 dB');
      expect(readout('music').textContent).toBe('−4.4');
      expect(readout('sfx').textContent).toBe('+0.0');
      expect(live(api).undoLabel).toBe(VOLUME_LABEL);
      expect(
        view.container.querySelectorAll('[data-testid="arrangement-group-volume"]'),
      ).toHaveLength(1);
    });
  });
});
