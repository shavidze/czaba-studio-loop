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
import { decodeVideoAudio, probeVideoFile } from '~/lib/arrangement/video.client';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { clipLinearGain, createArrangement } from '../model';
import {
  clipWaveformScale,
  parseWaveformZoom,
  WAVEFORM_ZOOM_DEFAULT,
  WAVEFORM_ZOOM_LEVELS,
  waveformZoomLabel,
  waveformZoomPercent,
  waveformZoomStatus,
} from '../waveform-zoom';

const graphLog = vi.hoisted(() => ({ setClipGain: 0 }));

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return {
    ...actual,
    applySchedule: vi.fn((...args: Parameters<typeof actual.applySchedule>) => {
      const handle = actual.applySchedule(...args);
      const setClipGain = handle.setClipGain;
      handle.setClipGain = (clipId: string, value: number) => {
        graphLog.setClipGain += 1;
        setClipGain(clipId, value);
      };
      return handle;
    }),
  };
});

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

const CLIP_GAIN_LABEL = 'Clip Gain';
const ZOOM_SELECT = 'arrangement-waveform-zoom';

const WZ1_PEAKS = new Float32Array([0.2, 0.5, 0.9, 1.0, 0.01]);

const WZ1_ZOOM_ROWS: ReadonlyArray<[number, string]> = [
  [
    0.5,
    'M0 0.900h1V1.100h-1ZM1 0.750h1V1.250h-1ZM2 0.550h1V1.450h-1ZM3 0.500h1V1.500h-1ZM4 0.980h1V1.020h-1Z',
  ],
  [
    2,
    'M0 0.600h1V1.400h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z',
  ],
  [
    4,
    'M0 0.200h1V1.800h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.960h1V1.040h-1Z',
  ],
  [
    8,
    'M0 0.000h1V2.000h-1ZM1 0.000h1V2.000h-1ZM2 0.000h1V2.000h-1ZM3 0.000h1V2.000h-1ZM4 0.920h1V1.080h-1Z',
  ],
];

const WZ1_MINUS_SIX_TIMES_TWO =
  'M0 0.800h1V1.200h-1ZM1 0.499h1V1.501h-1ZM2 0.098h1V1.902h-1ZM3 0.000h1V2.000h-1ZM4 0.980h1V1.020h-1Z';

const WZ1_MINUS_SIXTY_TIMES_EIGHT =
  'M0 0.980h1V1.020h-1ZM1 0.980h1V1.020h-1ZM2 0.980h1V1.020h-1ZM3 0.980h1V1.020h-1ZM4 0.980h1V1.020h-1Z';

const WZ1_LABELS: ReadonlyArray<[number, string, number]> = [
  [0.5, '½×', 50],
  [1, '1×', 100],
  [2, '2×', 200],
  [4, '4×', 400],
  [8, '8×', 800],
];

function wz1Clip(gainDb?: number): ArrangementClip {
  const clip: ArrangementClip = {
    id: 'w1',
    trackId: 'music',
    sourceId: 'song',
    start: 0,
    sourceOffset: 0,
    duration: 0.05,
  };
  return gainDb === undefined ? clip : { ...clip, gainDb };
}

function wz1Path(clip: ArrangementClip, isVideo: boolean, zoom: number): string | undefined {
  return buildPeakShape(WZ1_PEAKS, 0, 0.05, 5, clipWaveformScale(clip, isVideo, zoom))?.path;
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
      data[i] = 0.05 + 0.3 * Math.abs(Math.sin((i + channel) / 13)) * envelope;
    }
    return data;
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const zoomCollection: WorkspaceCollection = {
  id: 'waveform-zoom',
  label: 'waveform-zoom',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'waveform-zoom', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'waveform-zoom', kind: 'sfx', origin: 'demo' },
    { id: 'pad', title: 'Pad', collectionLabel: 'waveform-zoom', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function zoomArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ],
  };
}

interface ZoomApiRef {
  current: ArrangementContextValue | null;
}

function ZoomProbe({ api }: { api: ZoomApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: ZoomApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function clipOf(api: ZoomApiRef, id: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === id);
  if (!clip) {
    throw new Error(`clip ${id} missing`);
  }
  return clip;
}

function gainOf(api: ZoomApiRef, id: string): number {
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

async function mountZoomWorkspace() {
  const api: ZoomApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={zoomCollection} initialArrangement={zoomArrangement()}>
      <StudioWorkspace />
      <ZoomProbe api={api} />
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
  const zoomSelect = () => {
    const select = view.getByTestId(ZOOM_SELECT);
    if (!(select instanceof HTMLSelectElement)) {
      throw new Error('waveform zoom select missing');
    }
    return select;
  };
  const chooseZoom = (value: string) => {
    fireEvent.change(zoomSelect(), { target: { value } });
  };
  const gridControl = () => view.getByTestId('arrangement-grid-control');
  const fader = () => {
    const input = view.container.querySelector(
      '[data-testid="arrangement-detail-clip-gain-fader"]',
    );
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('clip gain fader missing');
    }
    return input;
  };
  const transportButton = (prefix: string) => {
    const button = Array.from(view.container.querySelectorAll('button')).find((entry) =>
      (entry.getAttribute('title') ?? '').startsWith(prefix),
    );
    if (!button) {
      throw new Error(`${prefix} button missing`);
    }
    return { title: button.getAttribute('title'), disabled: button.disabled };
  };
  const select = (clipIds: readonly string[]) => {
    act(() => live(api).selectClips(clipIds));
  };
  return {
    api,
    view,
    lane,
    detail,
    expectedShape,
    zoomSelect,
    chooseZoom,
    gridControl,
    fader,
    transportButton,
    select,
  };
}

function stubWorkspaceGlobals() {
  fakeClock.base = Date.now() / 1000;
  audioLog.sources = [];
  graphLog.setClipGain = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeWaveAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: () => undefined,
  });
  probeVideoMock.mockReset();
  probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 4, width: 640, height: 360 });
  decodeVideoMock.mockReset();
  decodeVideoMock.mockImplementation(async () => ({
    buffer: new AudioBuffer({ length: 1000, numberOfChannels: 2, sampleRate: 100 }),
    reason: null,
  }));
}

describe('waveform-zoom module (D-29z86, T12 stage 4b)', () => {
  it('WZ1: exact B literals for zoom and gain × zoom; video, invalid zooms, parsing and labels', () => {
    const plain = wz1Clip();
    for (const [zoom, expected] of WZ1_ZOOM_ROWS) {
      expect(wz1Path(plain, false, zoom)).toBe(expected);
    }
    expect(wz1Path(wz1Clip(-6), false, 2)).toBe(WZ1_MINUS_SIX_TIMES_TWO);
    expect(wz1Path(wz1Clip(-60), false, 8)).toBe(WZ1_MINUS_SIXTY_TIMES_EIGHT);
    expect(clipWaveformScale(wz1Clip(-6), false, 2)).toBe(10 ** (-6 / 20) * 2);
    expect(clipWaveformScale(plain, true, 8)).toBe(1);
    expect(clipWaveformScale(wz1Clip(-6), true, 8)).toBe(clipLinearGain(wz1Clip(-6)));
    for (const zoom of [Number.NaN, 0, -1, Number.POSITIVE_INFINITY]) {
      expect(clipWaveformScale(wz1Clip(-6), false, zoom)).toBe(clipLinearGain(wz1Clip(-6)));
      expect(clipWaveformScale(plain, false, zoom)).toBe(clipLinearGain(plain));
    }
    expect(parseWaveformZoom('2')).toBe(2);
    expect(parseWaveformZoom('0.5')).toBe(0.5);
    for (const value of ['3', '', 'abc', 'Infinity']) {
      expect(parseWaveformZoom(value)).toBeNull();
    }
    expect(WAVEFORM_ZOOM_LEVELS).toEqual([0.5, 1, 2, 4, 8]);
    expect(WAVEFORM_ZOOM_DEFAULT).toBe(1);
    for (const [level, label, percent] of WZ1_LABELS) {
      expect(waveformZoomLabel(level)).toBe(label);
      expect(waveformZoomPercent(level)).toBe(percent);
      expect(waveformZoomStatus(level)).toBe(
        `Waveform Zoom ${percent}% — view only, the sound does not change.`,
      );
    }
  });
});

describe('Waveform Zoom in the workspace (D-29z86, T12 stage 4b)', () => {
  beforeEach(stubWorkspaceGlobals);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('WZ2: 2× scales every audio lane by its gain × 2, shows the state and status; 1× restores the exact drawings', async () => {
    const { api, lane, expectedShape, zoomSelect, chooseZoom, gridControl } =
      await mountZoomWorkspace();
    expect(zoomSelect().value).toBe('1');
    expect(gridControl().dataset.waveformZoom).toBe('1');
    expect(gridControl().lastElementChild).toBe(zoomSelect());
    expect(Array.from(zoomSelect().options).map((option) => option.textContent)).toEqual([
      '½×',
      '1×',
      '2×',
      '4×',
      '8×',
    ]);
    const before = { m1: lane('m1'), s1: lane('s1') };
    expect(before.m1.columns).toBeGreaterThan(10);
    chooseZoom('2');
    const laneIds: ReadonlyArray<'m1' | 's1'> = ['m1', 's1'];
    for (const id of laneIds) {
      const after = lane(id);
      expect(after.columns).toBe(before[id].columns);
      expect(after.d).toBe(expectedShape(id, after.columns, clipLinearGain(clipOf(api, id)) * 2));
      expect(after.d).not.toBe(before[id].d);
    }
    expect(gridControl().dataset.waveformZoom).toBe('2');
    expect(zoomSelect().value).toBe('2');
    expect(live(api).status).toBe(waveformZoomStatus(2));
    expect(zoomSelect().getAttribute('aria-label')).toBe(
      'Waveform Zoom — view only, the sound does not change',
    );
    expect(zoomSelect().title).toBe('Waveform Zoom 200% — view only, the sound does not change');
    expect(zoomSelect().classList.contains('appearance-none')).toBe(true);
    expect(zoomSelect().classList.contains('border-foreground')).toBe(true);
    chooseZoom('1');
    expect(lane('m1').d).toBe(before.m1.d);
    expect(lane('s1').d).toBe(before.s1.d);
    expect(gridControl().dataset.waveformZoom).toBe('1');
    expect(zoomSelect().title).toBe('Waveform Zoom 100% — view only, the sound does not change');
    expect(zoomSelect().classList.contains('border-foreground')).toBe(false);
  });

  it('WZ3: −6 dB at 2× draws gain × zoom; a Clip Gain drag at 2× follows previewed dB × 2 before release', async () => {
    const { api, lane, expectedShape, chooseZoom, fader, select } = await mountZoomWorkspace();
    act(() => {
      live(api).setClipGain('m1', -6);
    });
    expect(gainOf(api, 'm1')).toBe(-6);
    chooseZoom('2');
    const music = lane('m1');
    const combined = expectedShape('m1', music.columns, 10 ** (-6 / 20) * 2);
    expect(music.d).toBe(combined);
    expect(combined).not.toBe(expectedShape('m1', music.columns, 10 ** (-6 / 20)));
    expect(combined).not.toBe(expectedShape('m1', music.columns, 2));
    select(['m1']);
    const input = fader();
    stubFaderWidth(input, 100);
    fireEvent.pointerDown(input, { ...press, pointerId: 131, clientX: 50 });
    windowPointer('pointermove', 131, 30);
    const previewDb = Number(input.value);
    expect(previewDb).toBeLessThan(-6);
    expect(gainOf(api, 'm1')).toBe(-6);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    const mid = lane('m1');
    expect(mid.d).toBe(expectedShape('m1', mid.columns, 10 ** (previewDb / 20) * 2));
    expect(mid.d).not.toBe(music.d);
    windowPointer('pointerup', 131, 30);
    expect(gainOf(api, 'm1')).toBe(previewDb);
  });

  it('WZ4 must-not: a video clip lane drawing is byte-identical at 1× and 8×', async () => {
    const { api, view, chooseZoom } = await mountZoomWorkspace();
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'film.webm', { type: 'video/webm' })]);
      await Promise.resolve();
    });
    for (
      let attempt = 0;
      attempt < 40 &&
      !live(api).arrangement.clips.some(
        (clip) => clip.trackId === 'video' && live(api).sourcePeaks.has(clip.sourceId),
      );
      attempt += 1
    ) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
    const videoClip = live(api).arrangement.clips.find((clip) => clip.trackId === 'video');
    if (!videoClip) {
      throw new Error('video clip missing');
    }
    expect(live(api).sourcePeaks.has(videoClip.sourceId)).toBe(true);
    const videoLane = () =>
      svgPath(
        view.container.querySelector(
          `[data-clip-id="${videoClip.id}"] [data-testid="arrangement-clip-waveform"]`,
        ),
        'video lane',
      );
    const musicLane = () =>
      svgPath(
        view.container.querySelector(
          '[data-clip-id="m1"] [data-testid="arrangement-clip-waveform"]',
        ),
        'music lane',
      );
    const before = videoLane();
    const musicBefore = musicLane();
    expect(before.columns).toBeGreaterThan(10);
    chooseZoom('8');
    expect(videoLane().d).toBe(before.d);
    expect(musicLane().d).not.toBe(musicBefore.d);
  });

  it('WZ5 must-not: the detail panel drawing is byte-identical at 1× and 4×', async () => {
    const { detail, lane, chooseZoom, select } = await mountZoomWorkspace();
    select(['m1']);
    const before = detail();
    const laneBefore = lane('m1');
    expect(before.columns).toBe(480);
    chooseZoom('4');
    expect(detail().d).toBe(before.d);
    expect(lane('m1').d).not.toBe(laneBefore.d);
  });

  it('WZ6: the zoom is not history — Undo/Redo states are unchanged and Ctrl+Z / Ctrl+Shift+Z move only the edit', async () => {
    const { api, zoomSelect, chooseZoom, gridControl, transportButton } =
      await mountZoomWorkspace();
    act(() => {
      live(api).setClipGain('m1', -6);
    });
    const undoBefore = transportButton('Undo');
    const redoBefore = transportButton('Redo');
    expect(undoBefore).toEqual({ title: `Undo: ${CLIP_GAIN_LABEL}`, disabled: false });
    expect(redoBefore).toEqual({ title: 'Redo', disabled: true });
    chooseZoom('4');
    expect(transportButton('Undo')).toEqual(undoBefore);
    expect(transportButton('Redo')).toEqual(redoBefore);
    expect(live(api).undoLabel).toBe(CLIP_GAIN_LABEL);
    act(() => {
      fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    });
    expect(gainOf(api, 'm1')).toBe(0);
    expect(zoomSelect().value).toBe('4');
    expect(gridControl().dataset.waveformZoom).toBe('4');
    act(() => {
      fireEvent.keyDown(document.body, { key: 'Z', code: 'KeyZ', ctrlKey: true, shiftKey: true });
    });
    expect(gainOf(api, 'm1')).toBe(-6);
    expect(zoomSelect().value).toBe('4');
    expect(gridControl().dataset.waveformZoom).toBe('4');
  });

  it('WZ7: the zoom is not audio — same arrangement reference; during play 0 new sources, 0 setClipGain, position advances', async () => {
    const { api, chooseZoom } = await mountZoomWorkspace();
    await flushLoads();
    const arrangementBefore = live(api).getArrangement();
    chooseZoom('2');
    expect(live(api).getArrangement()).toBe(arrangementBefore);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const sourceCount = audioLog.sources.length;
    expect(sourceCount).toBeGreaterThan(0);
    const clipGainCalls = graphLog.setClipGain;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    const positionBefore = live(api).getLivePosition();
    chooseZoom('4');
    chooseZoom('1');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expect(audioLog.sources.length).toBe(sourceCount);
    expect(graphLog.setClipGain).toBe(clipGainCalls);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThan(positionBefore);
    act(() => live(api).togglePlayback());
  });

  it('WZ8: an audio clip added from the library at 2× is drawn × 2 from its first render', async () => {
    const { api, lane, expectedShape, chooseZoom } = await mountZoomWorkspace();
    chooseZoom('2');
    act(() => {
      live(api).setActiveTrack('sfx');
      live(api).seekTo(8);
    });
    act(() => live(api).addSourceToActiveTrack('pad'));
    const added = live(api).arrangement.clips.find((clip) => clip.sourceId === 'pad');
    if (!added) {
      throw new Error('library clip was not added');
    }
    const drawn = lane(added.id);
    expect(drawn.columns).toBeGreaterThan(10);
    expect(drawn.d).toBe(expectedShape(added.id, drawn.columns, 2));
    expect(drawn.d).not.toBe(expectedShape(added.id, drawn.columns, 1));
  });

  it('WZ9: keys on the focused zoom select never edit, move or play; Digit1 on the grid-division select still narrows', async () => {
    const { api, view, zoomSelect, gridControl, transportButton, select } =
      await mountZoomWorkspace();
    act(() => {
      live(api).setClipGain('m1', -6);
    });
    select(['s1']);
    const zoom = zoomSelect();
    act(() => zoom.focus());
    expect(document.activeElement).toBe(zoom);
    const startBefore = clipOf(api, 's1').start;
    const countBefore = live(api).arrangement.clips.length;
    const undoBefore = transportButton('Undo');
    for (const [key, code] of [
      ['ArrowLeft', 'ArrowLeft'],
      ['ArrowRight', 'ArrowRight'],
      ['Delete', 'Delete'],
      [' ', 'Space'],
    ]) {
      act(() => {
        fireEvent.keyDown(zoom, { key, code });
      });
      expect(clipOf(api, 's1').start, key).toBe(startBefore);
      expect(live(api).arrangement.clips.length, key).toBe(countBefore);
      expect(live(api).isPlaying, key).toBe(false);
      expect(transportButton('Undo'), key).toEqual(undoBefore);
    }
    const division = view.getByTestId('arrangement-grid-division');
    const secondsBefore = Number(gridControl().dataset.gridSeconds);
    act(() => division.focus());
    act(() => {
      fireEvent.keyDown(division, { key: '1', code: 'Digit1' });
    });
    expect(Number(gridControl().dataset.gridSeconds)).toBeLessThan(secondsBefore);
  });
});
