import { createHash } from 'node:crypto';
import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPeakShape } from '~/components/arrangement/ArrangementClip';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { addClipEnvelopePoint } from '../envelope';
import { setClipFade } from '../fades';
import { createArrangement } from '../model';
import { trackVolumeFromDb } from '../track-volume-db';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const CLIP_GAIN_LABEL = 'Clip Gain';

const WG1_PEAKS = new Float32Array([0.2, 0.5, 0.9, 1.0, 0.01]);

const WG1_ROWS: ReadonlyArray<[number, string]> = [
  [
    1,
    'M0 0.800h1V1.200h-1ZM1 0.500h1V1.500h-1ZM2 0.100h1V1.900h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z',
  ],
  [
    10 ** (-6 / 20),
    'M0 0.900h1V1.100h-1ZM1 0.749h1V1.251h-1ZM2 0.549h1V1.451h-1ZM3 0.499h1V1.501h-1ZM4 0.980h1V1.020h-1Z',
  ],
  [
    10 ** (3 / 20),
    'M0 0.717h1V1.283h-1ZM1 0.294h1V1.706h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z',
  ],
  [
    10 ** (-60 / 20),
    'M0 0.980h1V1.020h-1ZM1 0.980h1V1.020h-1ZM2 0.980h1V1.020h-1ZM3 0.980h1V1.020h-1ZM4 0.980h1V1.020h-1Z',
  ],
  [
    10 ** (24 / 20),
    'M0 0.000h1V2.000h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.842h1V1.158h-1Z',
  ],
];

const WG2_PRE_ROUND_SHA256 = 'cc617f0c9a6251120fb9cf2b60a1f3f665568e1a2cf5bd1da5e10313980ced33';

function wg2Peaks(): Float32Array {
  const peaks = new Float32Array(300);
  for (let i = 0; i < 300; i++) {
    peaks[i] = Math.abs(Math.sin(i / 7)) * (0.3 + 0.7 * Math.abs(Math.cos(i / 41)));
  }
  return peaks;
}

const fakeClock = { base: 0 };

class FakeParam {
  value = 0;
  targets: number[] = [];
  setTargetAtTime(target: number) {
    this.targets.push(target);
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
  starts: Array<[number, number, number]> = [];
  start(when: number, offset: number, duration: number) {
    this.starts.push([when, offset, duration]);
  }
  stop() {}
}

const audioLog: { sources: FakeSource[] } = { sources: [] };

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
    const source = new FakeSource();
    audioLog.sources.push(source);
    return source;
  }
}

class FakeOfflineAudioContext {}

class FakeWaveAudioBuffer {
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
  getChannelData(channel: number) {
    const data = new Float32Array(this.length);
    for (let i = 0; i < this.length; i++) {
      const envelope = 0.5 + 0.5 * Math.abs(Math.cos((i + channel) / 97));
      data[i] = 0.15 + 0.6 * Math.abs(Math.sin((i + channel) / 13)) * envelope;
    }
    return data;
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const waveformCollection: WorkspaceCollection = {
  id: 'clip-gain-waveform',
  label: 'clip-gain-waveform',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'clip-gain-waveform',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'clip-gain-waveform', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function waveformArrangement(gains: Readonly<Record<string, number>> = {}): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    groups: [{ id: 'g1', name: 'ჯგუფი', parentId: null }],
    tracks: base.tracks.map((track) =>
      track.id === 'music' ? { ...track, groupId: 'g1' } : track,
    ),
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ].map((clip) => {
      const gainDb = gains[clip.id];
      return gainDb === undefined ? clip : { ...clip, gainDb };
    }),
  };
}

interface WaveformApiRef {
  current: ArrangementContextValue | null;
}

function WaveformProbe({ api }: { api: WaveformApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: WaveformApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function clipOf(api: WaveformApiRef, id: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === id);
  if (!clip) {
    throw new Error(`clip ${id} missing`);
  }
  return clip;
}

function gainOf(api: WaveformApiRef, id: string): number {
  return clipOf(api, id).gainDb ?? 0;
}

const press = { button: 0, buttons: 1 };

function stubFaderWidth(input: HTMLInputElement, width: number) {
  const rect: DOMRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width,
    height: 4,
    right: width,
    bottom: 4,
    toJSON: () => ({}),
  };
  Object.defineProperty(input, 'getBoundingClientRect', { configurable: true, value: () => rect });
}

function windowPointer(type: 'pointermove' | 'pointerup', pointerId: number, clientX: number) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX }));
  });
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function svgPath(svg: Element | null, label: string): { d: string; columns: number } {
  const path = svg?.querySelector('path');
  const viewBox = svg?.getAttribute('viewBox') ?? '';
  const match = /^0 0 (\d+) 2$/.exec(viewBox);
  const d = path?.getAttribute('d');
  if (!match || !d) {
    throw new Error(`${label} waveform missing (viewBox "${viewBox}")`);
  }
  return { d, columns: Number(match[1]) };
}

async function mountWaveformWorkspace(gains: Readonly<Record<string, number>> = {}) {
  const api: WaveformApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={waveformCollection}
      initialArrangement={waveformArrangement(gains)}
    >
      <StudioWorkspace />
      <WaveformProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  const lane = (clipId: string) =>
    svgPath(
      view.container.querySelector(
        `[data-clip-id="${clipId}"] [data-testid="arrangement-clip-waveform"]`,
      ),
      `lane ${clipId}`,
    );
  const detail = () =>
    svgPath(view.getByTestId('arrangement-detail-waveform').querySelector('svg'), 'detail');
  const expectedShape = (clipId: string, columns: number, scale: number) => {
    const clip = clipOf(api, clipId);
    const shape = buildPeakShape(
      live(api).sourcePeaks.get(clip.sourceId),
      clip.sourceOffset,
      clip.duration,
      columns,
      scale,
    );
    if (!shape) {
      throw new Error(`no expected shape for ${clipId}`);
    }
    return shape.path;
  };
  const laneMatchesGain = (clipId: string) => {
    const { d, columns } = lane(clipId);
    return { d, expected: expectedShape(clipId, columns, 10 ** (gainOf(api, clipId) / 20)) };
  };
  const fader = () => {
    const input = view.container.querySelector(
      '[data-testid="arrangement-detail-clip-gain-fader"]',
    );
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('clip gain fader missing');
    }
    return input;
  };
  const select = (clipIds: readonly string[]) => {
    act(() => live(api).selectClips(clipIds));
  };
  return { api, view, lane, detail, expectedShape, laneMatchesGain, fader, select };
}

describe('buildPeakShape display scale (D-29z85, T12 stage 4a)', () => {
  it('WG1: the fixture gives the exact B literals at 0/−6/+3/−60/+24 dB; NaN, Infinity and −1 fall back to scale 1', () => {
    for (const [scale, expected] of WG1_ROWS) {
      expect(buildPeakShape(WG1_PEAKS, 0, 0.05, 5, scale)?.path).toBe(expected);
    }
    const scaleOne = WG1_ROWS[0][1];
    for (const scale of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(buildPeakShape(WG1_PEAKS, 0, 0.05, 5, scale)?.path).toBe(scaleOne);
    }
  });

  it('WG2: scale 1 on a realistic fixture is byte-identical to the pre-round drawing', () => {
    const shape = buildPeakShape(wg2Peaks(), 0.5, 2, 120, 1);
    expect(shape?.columns).toBe(120);
    expect(shape?.path.length).toBe(2530);
    expect(
      createHash('sha256')
        .update(shape?.path ?? '')
        .digest('hex'),
    ).toBe(WG2_PRE_ROUND_SHA256);
  });
});

describe('lane and detail waveforms follow Clip Gain (D-29z85, T12 stage 4a)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    audioLog.sources = [];
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeWaveAudioBuffer);
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

  it('WG3: a −6 dB clip draws the −6 dB shape (not the scale-1 one); a clip without gainDb draws scale 1', async () => {
    const { lane, expectedShape } = await mountWaveformWorkspace({ m1: -6 });
    const music = lane('m1');
    const scaled = expectedShape('m1', music.columns, 10 ** (-6 / 20));
    const unscaled = expectedShape('m1', music.columns, 1);
    expect(music.columns).toBeGreaterThan(10);
    expect(scaled).not.toBe(unscaled);
    expect(music.d).toBe(scaled);
    const sfx = lane('s1');
    expect(sfx.d).toBe(expectedShape('s1', sfx.columns, 1));
  });

  it('WG4: during a single Clip Gain drag the lane follows before release; one entry; Undo restores the exact drawing', async () => {
    const { api, lane, detail, expectedShape, laneMatchesGain, fader, select } =
      await mountWaveformWorkspace();
    select(['m1']);
    const before = lane('m1').d;
    const detailBefore = detail().d;
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 120, clientX: 50 });
    windowPointer('pointermove', 120, 30);
    const previewDb = gainOf(api, 'm1');
    expect(previewDb).toBeLessThan(0);
    const mid = laneMatchesGain('m1');
    expect(mid.d).not.toBe(before);
    expect(mid.d).toBe(mid.expected);
    expect(detail().d).not.toBe(detailBefore);
    expect(detail().d).toBe(expectedShape('m1', 480, 10 ** (previewDb / 20)));
    expect(live(api).undoLabel).toBeNull();
    windowPointer('pointerup', 120, 30);
    expect(gainOf(api, 'm1')).toBe(previewDb);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(lane('m1').d).toBe(before);
  });

  it('WG5: two clips at −6 and +3 draw their own factors; a multi drag changes both and each matches its stored gain', async () => {
    const { api, lane, expectedShape, laneMatchesGain, fader, select } =
      await mountWaveformWorkspace();
    act(() => {
      live(api).setClipGain('m1', -6);
      live(api).setClipGain('s1', 3);
    });
    expect(gainOf(api, 'm1')).toBe(-6);
    expect(gainOf(api, 's1')).toBe(3);
    const music = lane('m1');
    const sfx = lane('s1');
    expect(music.d).toBe(expectedShape('m1', music.columns, 10 ** (-6 / 20)));
    expect(sfx.d).toBe(expectedShape('s1', sfx.columns, 10 ** (3 / 20)));
    select(['m1', 's1']);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 121, clientX: 50 });
    windowPointer('pointermove', 121, 40);
    windowPointer('pointerup', 121, 40);
    expect(gainOf(api, 'm1')).toBeLessThan(-6);
    expect(gainOf(api, 's1')).toBeLessThan(3);
    const musicAfter = laneMatchesGain('m1');
    const sfxAfter = laneMatchesGain('s1');
    expect(musicAfter.d).not.toBe(music.d);
    expect(sfxAfter.d).not.toBe(sfx.d);
    expect(musicAfter.d).toBe(musicAfter.expected);
    expect(sfxAfter.d).toBe(sfxAfter.expected);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
  });

  it('WG6: the detail panel draws the −6 dB shape at 480 columns from the same raw peaks', async () => {
    const { detail, expectedShape, select } = await mountWaveformWorkspace({ m1: -6 });
    select(['m1']);
    const panel = detail();
    expect(panel.columns).toBe(480);
    expect(panel.d).toBe(expectedShape('m1', 480, 10 ** (-6 / 20)));
    expect(panel.d).not.toBe(expectedShape('m1', 480, 1));
  });

  it('WG7 must-not: track Volume, group Volume, Master, Pan, Mute/Solo, a fade-in and an envelope point leave the lane byte-identical', async () => {
    const { api, lane } = await mountWaveformWorkspace({ m1: -6 });
    const before = lane('m1').d;
    const steps: Array<[string, () => void]> = [
      [
        'track volume',
        () => {
          live(api).previewTrackVolume('music', trackVolumeFromDb(-12));
          live(api).commitTrackVolume('music');
        },
      ],
      [
        'group volume',
        () => {
          live(api).previewGroupVolume('g1', trackVolumeFromDb(-12));
          live(api).commitGroupVolume('g1');
        },
      ],
      [
        'master',
        () => {
          live(api).previewMasterGain(-12);
          live(api).commitMasterGain();
        },
      ],
      ['pan', () => live(api).setTrackPan('music', -0.5)],
      ['mute', () => live(api).toggleTrackMute('music')],
      ['solo', () => live(api).toggleTrackSolo('music', false)],
      [
        'fade-in',
        () => {
          const current = live(api).arrangement;
          live(api).commitArrangement(setClipFade(current, 'm1', 'in', 1), 'Fade', current);
        },
      ],
      [
        'envelope point',
        () => {
          const current = live(api).arrangement;
          live(api).commitArrangement(addClipEnvelopePoint(current, 'm1', 3), 'Envelope', current);
        },
      ],
    ];
    for (const [label, step] of steps) {
      const previous = live(api).arrangement;
      act(step);
      expect(live(api).arrangement, label).not.toBe(previous);
      expect(lane('m1').d, label).toBe(before);
    }
    const tracks = live(api).arrangement.tracks.find((track) => track.id === 'music');
    expect(tracks?.mute).toBe(true);
    expect(tracks?.solo).toBe(true);
    expect(tracks?.pan).toBe(-0.5);
    expect(live(api).arrangement.master.gainDb).toBe(-12);
    expect(clipOf(api, 'm1').fadeIn).toBe(1);
    expect(clipOf(api, 'm1').envelope?.length ?? 0).toBeGreaterThan(0);
  });

  it('WG8 must-not (audio): a drag while playing sends exactly 10^(dB/20) to the clip gain node and creates no new sources', async () => {
    const { api, laneMatchesGain, fader, select } = await mountWaveformWorkspace();
    await flushLoads();
    select(['m1']);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const sourceCount = audioLog.sources.length;
    const musicSource = audioLog.sources.find((source) => source.starts[0]?.[1] === 0);
    const clipGainNode = musicSource?.outputs[0];
    if (!(clipGainNode instanceof FakeGain)) {
      throw new Error('music source has no clip gain node');
    }
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 122, clientX: 50 });
    windowPointer('pointermove', 122, 40);
    const previewDb = gainOf(api, 'm1');
    expect(previewDb).toBeLessThan(0);
    expect(clipGainNode.gain.targets.at(-1)).toBe(10 ** (previewDb / 20));
    const mid = laneMatchesGain('m1');
    expect(mid.d).toBe(mid.expected);
    windowPointer('pointerup', 122, 40);
    expect(audioLog.sources.length).toBe(sourceCount);
    expect(live(api).isPlaying).toBe(true);
    act(() => live(api).togglePlayback());
  });
});
