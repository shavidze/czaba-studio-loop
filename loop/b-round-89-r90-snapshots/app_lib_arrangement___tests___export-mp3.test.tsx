import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS,
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  WEB_AUDIO_UNAVAILABLE_MESSAGE,
} from '~/contexts/ArrangementContext';
import { formatExportOverloadWarning, renderArrangementWav } from '~/lib/arrangement/graph.client';
import {
  type ArrangementMp3Encoder,
  loadArrangementMp3Encoder,
  resetArrangementMp3Encoder,
} from '~/lib/arrangement/mp3-encoder.client';
import { decodeVideoAudio, probeVideoFile } from '~/lib/arrangement/video.client';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

vi.mock('~/lib/arrangement/mp3-encoder.client', () => ({
  loadArrangementMp3Encoder: vi.fn(),
  resetArrangementMp3Encoder: vi.fn(),
}));

const renderWavMock = vi.mocked(renderArrangementWav);
const loadEncoderMock = vi.mocked(loadArrangementMp3Encoder);
const resetEncoderMock = vi.mocked(resetArrangementMp3Encoder);
const encodeMock = vi.fn<ArrangementMp3Encoder['encode']>();
const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

const WAV_LABEL = 'WAV · 24-bit · 48 kHz · stereo';
const MP3_LABEL = 'MP3 · 48 kHz · stereo';
const MP3_NOTE = 'LAME (ffmpeg.wasm) — encoder პირველ MP3 ექსპორტზე CDN-იდან იტვირთება (~31 MB)';
const BOTH_LABEL = 'WAV + MP3 · ორი ფაილი';
const BOTH_NOTE = 'იგივე მიქსი ორ ფაილად — ან ორივე შეიქმნება, ან არცერთი';
const VIDEO_RENDER_REASON =
  'ვიდეოს რენდერი ამ ციკლში არ კეთდება — ექსპორტი მხოლოდ აუდიოა (ვიდეოს ორიგინალი ხმა შედის, თუ ჩართულია).';
const RETIRED_REASON = 'ამ ეტაპზე ხელმისაწვდომი არ არის';
const WAV_BUTTON = 'WAV-ის ექსპორტი';
const MP3_BUTTON = 'MP3-ის ექსპორტი';
const BOTH_BUTTON = 'WAV + MP3 ექსპორტი';
const ENCODER_LOADING_MESSAGE = 'MP3 encoder იტვირთება (ffmpeg.wasm, პირველად ~31 MB)…';
const LOAD_FAILED_MESSAGE =
  'MP3 encoder ვერ ჩაიტვირთა (ffmpeg.wasm, unpkg CDN) — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.';
const LOAD_TIMEOUT_MESSAGE =
  'MP3 encoder 120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. გადატვირთე გვერდი და სცადე თავიდან, ან აირჩიე WAV.';
const MP3_DONE_MESSAGE = 'MP3 შეიქმნა: 00:20.000, 48 kHz · stereo.';
const MP3_RANGE_DONE_MESSAGE =
  'MP3 შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), 48 kHz · stereo.';
const BOTH_DONE_MESSAGE =
  'WAV და MP3 შეიქმნა: 00:20.000, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.';
const BOTH_RANGE_DONE_MESSAGE =
  'WAV და MP3 შეიქმნა: მონაკვეთი 00:04.000 — 00:09.000 (5.000 წმ), WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.';
const MASTER_MUTED_SUFFIX = ' Master დადუმებულია — ფაილი სიჩუმეა.';
const INVALID_RANGE_MESSAGE = 'მონაკვეთი არასწორია — ფაილი არ შეიქმნა.';
const EMPTY_PROJECT_MESSAGE = 'პროექტი ცარიელია — ფაილი არ შეიქმნა.';
const DECODING_MESSAGE = 'ვიდეოს ხმა ჯერ იშიფრება — დაელოდე და სცადე თავიდან. ფაილი არ შეიქმნა.';

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
  currentTime = 0;
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

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const mp3Collection: WorkspaceCollection = {
  id: 'mp3',
  label: 'mp3',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'mp3', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function mp3Arrangement(extra: ArrangementClip[] = []): Arrangement {
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
      ...extra,
    ],
  };
}

interface Mp3ApiRef {
  current: ArrangementContextValue | null;
}

function Mp3Probe({ api }: { api: Mp3ApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: Mp3ApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function Mp3DialogHost({ api }: { api: Mp3ApiRef }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open-export
      </button>
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Mp3Probe api={api} />
    </>
  );
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountMp3Dialog(
  options: { arrangement?: Arrangement; range?: { start: number; end: number } } = {},
) {
  const api: Mp3ApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={mp3Collection}
      initialArrangement={options.arrangement ?? mp3Arrangement()}
    >
      <Mp3DialogHost api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  const range = options.range;
  if (range) {
    act(() => live(api).setTimeRange({ ...range, trackId: 'music' }));
  }
  fireEvent.click(view.getByRole('button', { name: 'open-export' }));
  return { api, view };
}

function formatRadio(view: ReturnType<typeof render>, format: 'wav' | 'mp3' | 'both') {
  const element = view.getByTestId(`arrangement-export-format-${format}`);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`format radio ${format} missing`);
  }
  return element;
}

function scopeRadio(view: ReturnType<typeof render>, scope: 'project' | 'range') {
  const element = view.getByTestId(`arrangement-export-scope-${scope}`);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`scope radio ${scope} missing`);
  }
  return element;
}

function radioLabelText(radio: HTMLInputElement): string {
  return radio.closest('label')?.textContent ?? '';
}

async function settleExport(api: Mp3ApiRef) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (live(api).exportState.phase !== 'rendering') {
      return;
    }
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  throw new Error('export did not settle');
}

async function clickExportButton(view: ReturnType<typeof render>, api: Mp3ApiRef, name: string) {
  await act(async () => {
    fireEvent.click(view.getByRole('button', { name }));
    await Promise.resolve();
  });
  await settleExport(api);
}

describe('SRW-20 stage 2 MP3 and WAV + MP3 export (D-29z51, R20-X2)', { timeout: 15_000 }, () => {
  const downloads: string[] = [];
  const objectUrlBlobs: Blob[] = [];
  const renderedBlob = new Blob(['rendered-wav']);
  const mp3Blob = new Blob(['encoded-mp3']);

  beforeEach(() => {
    downloads.length = 0;
    objectUrlBlobs.length = 0;
    renderWavMock.mockReset();
    renderWavMock.mockResolvedValue({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
    loadEncoderMock.mockReset();
    loadEncoderMock.mockResolvedValue({ encode: encodeMock });
    resetEncoderMock.mockReset();
    encodeMock.mockReset();
    encodeMock.mockResolvedValue(mp3Blob);
    probeVideoMock.mockReset();
    probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 4, width: 640, height: 360 });
    decodeVideoMock.mockReset();
    decodeVideoMock.mockImplementation(() => new Promise(() => undefined));
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download);
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: (blob: Blob) => {
        objectUrlBlobs.push(blob);
        return 'blob:mp3-test';
      },
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('MX1 WAV is the default, MP3 and WAV + MP3 are enabled with exact texts, video stays disabled, reopen resets to WAV', async () => {
    const { view } = await mountMp3Dialog();
    const wav = formatRadio(view, 'wav');
    const mp3 = formatRadio(view, 'mp3');
    const both = formatRadio(view, 'both');
    expect(wav.checked).toBe(true);
    expect(mp3.checked).toBe(false);
    expect(both.checked).toBe(false);
    expect([wav.disabled, mp3.disabled, both.disabled]).toEqual([false, false, false]);
    expect(radioLabelText(wav).startsWith(WAV_LABEL)).toBe(true);
    expect(radioLabelText(mp3)).toBe(`${MP3_LABEL}${MP3_NOTE}`);
    expect(radioLabelText(both)).toBe(`${BOTH_LABEL}${BOTH_NOTE}`);
    const formatRadios = Array.from(
      view.baseElement.querySelectorAll<HTMLInputElement>(
        'input[name="arrangement-export-format"]',
      ),
    );
    expect(formatRadios.slice(0, 3)).toEqual([wav, mp3, both]);
    const video = formatRadios[3];
    if (!video) {
      throw new Error('video option missing');
    }
    expect(video.disabled).toBe(true);
    expect(radioLabelText(video)).toBe(`ვიდეო (აუდიოთი)${VIDEO_RENDER_REASON}`);
    expect(view.baseElement.textContent).not.toContain(RETIRED_REASON);
    expect(view.getByRole('button', { name: WAV_BUTTON })).toBeTruthy();
    fireEvent.click(mp3);
    expect(mp3.checked).toBe(true);
    expect(view.getByRole('button', { name: MP3_BUTTON })).toBeTruthy();
    fireEvent.click(both);
    expect(both.checked).toBe(true);
    expect(view.getByRole('button', { name: BOTH_BUTTON })).toBeTruthy();
    fireEvent.click(view.getByRole('button', { name: 'დახურვა' }));
    expect(view.queryByRole('dialog')).toBeNull();
    fireEvent.click(view.getByRole('button', { name: 'open-export' }));
    expect(formatRadio(view, 'wav').checked).toBe(true);
    expect(formatRadio(view, 'both').checked).toBe(false);
    expect(view.getByRole('button', { name: WAV_BUTTON })).toBeTruthy();
  });

  it('MX2 MP3 project export renders once, loads the encoder once, converts the rendered blob and downloads only the MP3', async () => {
    renderWavMock.mockResolvedValue({ blob: renderedBlob, peak: 1.1, clippedSamples: 3 });
    const { api, view } = await mountMp3Dialog();
    fireEvent.click(formatRadio(view, 'mp3'));
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    await clickExportButton(view, api, MP3_BUTTON);
    const timeoutCallIndex = setTimeoutSpy.mock.calls.findIndex(
      (call) => call[1] === ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS,
    );
    expect(timeoutCallIndex).toBeGreaterThanOrEqual(0);
    const timeoutId = setTimeoutSpy.mock.results[timeoutCallIndex]?.value;
    expect(clearTimeoutSpy.mock.calls.map((call) => call[0])).toContain(timeoutId);
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(renderWavMock.mock.calls[0]?.[2]).toBeUndefined();
    expect(typeof renderWavMock.mock.calls[0]?.[3]?.onProgress).toBe('function');
    expect(loadEncoderMock).toHaveBeenCalledTimes(1);
    expect(encodeMock).toHaveBeenCalledTimes(1);
    expect(encodeMock.mock.calls[0]?.[0]).toBe(renderedBlob);
    expect(typeof encodeMock.mock.calls[0]?.[1]).toBe('function');
    expect(downloads).toEqual(['czaba-studio-lab.mp3']);
    const expectedWarning = formatExportOverloadWarning(1.1, 3);
    expect(expectedWarning).toBeTruthy();
    expect(live(api).exportState).toEqual({
      phase: 'done',
      message: MP3_DONE_MESSAGE,
      warning: expectedWarning,
    });
    expect(view.getByTestId('arrangement-export-overload').textContent).toBe(expectedWarning);
  });

  it('MX3 MP3 range 4–9 renders exactly that window and names the file -range', async () => {
    const { api, view } = await mountMp3Dialog({ range: { start: 9, end: 4 } });
    expect(scopeRadio(view, 'range').checked).toBe(true);
    fireEvent.click(formatRadio(view, 'mp3'));
    await clickExportButton(view, api, MP3_BUTTON);
    expect(renderWavMock.mock.calls[0]?.[2]).toStrictEqual({ start: 4, end: 9 });
    expect(typeof renderWavMock.mock.calls[0]?.[3]?.onProgress).toBe('function');
    expect(downloads).toEqual(['czaba-studio-lab-range.mp3']);
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_RANGE_DONE_MESSAGE });
  });

  it('MX4 WAV + MP3 renders once and downloads the WAV then the MP3, project and range', async () => {
    const project = await mountMp3Dialog();
    fireEvent.click(formatRadio(project.view, 'both'));
    await clickExportButton(project.view, project.api, BOTH_BUTTON);
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(renderWavMock.mock.calls[0]?.[2]).toBeUndefined();
    expect(typeof renderWavMock.mock.calls[0]?.[3]?.onProgress).toBe('function');
    expect(encodeMock.mock.calls[0]?.[0]).toBe(renderedBlob);
    expect(typeof encodeMock.mock.calls[0]?.[1]).toBe('function');
    expect(downloads).toEqual(['czaba-studio-lab.wav', 'czaba-studio-lab.mp3']);
    expect(objectUrlBlobs).toEqual([renderedBlob, mp3Blob]);
    expect(objectUrlBlobs[0]).toBe(renderedBlob);
    expect(objectUrlBlobs[1]).toBe(mp3Blob);
    expect(live(project.api).exportState).toEqual({ phase: 'done', message: BOTH_DONE_MESSAGE });
    project.view.unmount();
    downloads.length = 0;
    renderWavMock.mockClear();
    const ranged = await mountMp3Dialog({ range: { start: 4, end: 9 } });
    fireEvent.click(formatRadio(ranged.view, 'both'));
    await clickExportButton(ranged.view, ranged.api, BOTH_BUTTON);
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(renderWavMock.mock.calls[0]?.[2]).toStrictEqual({ start: 4, end: 9 });
    expect(downloads).toEqual(['czaba-studio-lab-range.wav', 'czaba-studio-lab-range.mp3']);
    expect(live(ranged.api).exportState).toEqual({
      phase: 'done',
      message: BOTH_RANGE_DONE_MESSAGE,
    });
  });

  it('MX5 a rejected encoder load writes the exact error, downloads nothing, and a retry with a working load succeeds', async () => {
    loadEncoderMock.mockRejectedValue(new Error('cdn blocked'));
    const { api, view } = await mountMp3Dialog();
    fireEvent.click(formatRadio(view, 'mp3'));
    await clickExportButton(view, api, MP3_BUTTON);
    expect(live(api).exportState).toEqual({ phase: 'error', message: LOAD_FAILED_MESSAGE });
    expect(view.getByRole('alert').textContent).toBe(LOAD_FAILED_MESSAGE);
    expect(downloads).toEqual([]);
    expect(encodeMock).not.toHaveBeenCalled();
    expect(view.getByRole('button', { name: 'დახურვა' })).toHaveProperty('disabled', false);
    fireEvent.click(formatRadio(view, 'both'));
    await clickExportButton(view, api, BOTH_BUTTON);
    expect(live(api).exportState).toEqual({ phase: 'error', message: LOAD_FAILED_MESSAGE });
    expect(downloads).toEqual([]);
    expect(encodeMock).not.toHaveBeenCalled();
    loadEncoderMock.mockResolvedValue({ encode: encodeMock });
    fireEvent.click(formatRadio(view, 'mp3'));
    await clickExportButton(view, api, MP3_BUTTON);
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_DONE_MESSAGE });
    expect(downloads).toEqual(['czaba-studio-lab.mp3']);
  });

  it('MX6 an encoder load that never settles times out at exactly 120 s with no file', async () => {
    loadEncoderMock.mockImplementation(() => new Promise(() => undefined));
    const { api, view } = await mountMp3Dialog();
    fireEvent.click(formatRadio(view, 'both'));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: BOTH_BUTTON }));
      await Promise.resolve();
    });
    for (let attempt = 0; attempt < 50 && loadEncoderMock.mock.calls.length === 0; attempt += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    }
    expect(loadEncoderMock).toHaveBeenCalledTimes(1);
    expect(ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS).toBe(120_000);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS - 1);
    });
    expect(live(api).exportState).toEqual({ phase: 'rendering', message: ENCODER_LOADING_MESSAGE });
    expect(downloads).toEqual([]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(live(api).exportState).toEqual({ phase: 'error', message: LOAD_TIMEOUT_MESSAGE });
    expect(downloads).toEqual([]);
    expect(encodeMock).not.toHaveBeenCalled();
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(view.getByRole('button', { name: 'დახურვა' })).toHaveProperty('disabled', false);
  });

  it('MX7 a rejected conversion writes the exact error with its text and downloads nothing', async () => {
    encodeMock.mockRejectedValue(new Error('lame exploded'));
    const { api, view } = await mountMp3Dialog();
    fireEvent.click(formatRadio(view, 'mp3'));
    await clickExportButton(view, api, MP3_BUTTON);
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: 'MP3-ის შექმნა ვერ მოხერხდა — ფაილი არ შეიქმნა. lame exploded',
    });
    expect(downloads).toEqual([]);
    fireEvent.click(formatRadio(view, 'both'));
    await clickExportButton(view, api, BOTH_BUTTON);
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: 'MP3-ის შექმნა ვერ მოხერხდა — ფაილი არ შეიქმნა. lame exploded',
    });
    expect(downloads).toEqual([]);
    expect(objectUrlBlobs).toEqual([]);
  });

  it('MX8 guards and invalid windows match exportWav and never render or load the encoder', async () => {
    const empty: Arrangement = { ...mp3Arrangement(), clips: [] };
    const emptyMount = await mountMp3Dialog({ arrangement: empty });
    for (const includeWav of [false, true]) {
      await act(async () => {
        await live(emptyMount.api).exportMp3(undefined, { includeWav });
      });
      expect(live(emptyMount.api).exportState).toEqual({
        phase: 'error',
        message: EMPTY_PROJECT_MESSAGE,
      });
    }
    emptyMount.view.unmount();

    const decodingMount = await mountMp3Dialog();
    await act(async () => {
      live(decodingMount.api).importVideoFiles([
        new File(['x'], 'film.mp4', { type: 'video/mp4' }),
      ]);
      await Promise.resolve();
    });
    for (let attempt = 0; attempt < 20 && decodeVideoMock.mock.calls.length === 0; attempt += 1) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
    expect(decodeVideoMock).toHaveBeenCalledTimes(1);
    expect(
      [...live(decodingMount.api).videoSources.values()].map((source) => source.audio),
    ).toEqual(['decoding']);
    for (const includeWav of [false, true]) {
      await act(async () => {
        await live(decodingMount.api).exportMp3(undefined, { includeWav });
      });
      expect(live(decodingMount.api).exportState).toEqual({
        phase: 'error',
        message: DECODING_MESSAGE,
      });
    }
    decodingMount.view.unmount();

    const { api } = await mountMp3Dialog();
    for (const invalid of [
      { start: 5, end: 5 },
      { start: 5, end: 5.0005 },
      { start: 9, end: 4 },
      { start: -1, end: 4 },
      { start: 0, end: Number.POSITIVE_INFINITY },
      { start: Number.NaN, end: 4 },
    ]) {
      for (const includeWav of [false, true]) {
        await act(async () => {
          await live(api).exportMp3(invalid, { includeWav });
        });
        expect(live(api).exportState).toEqual({ phase: 'error', message: INVALID_RANGE_MESSAGE });
      }
    }
    vi.stubGlobal('OfflineAudioContext', undefined);
    await act(async () => {
      await live(api).exportMp3();
    });
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: WEB_AUDIO_UNAVAILABLE_MESSAGE,
    });
    await act(async () => {
      await live(api).exportWav();
    });
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: WEB_AUDIO_UNAVAILABLE_MESSAGE,
    });
    expect(renderWavMock).not.toHaveBeenCalled();
    expect(loadEncoderMock).not.toHaveBeenCalled();
    expect(encodeMock).not.toHaveBeenCalled();
    expect(downloads).toEqual([]);
  });

  it('MX9 master mute appends the existing suffix to the MP3 and WAV + MP3 messages', async () => {
    const { api, view } = await mountMp3Dialog();
    act(() => live(api).toggleMasterMute());
    fireEvent.click(formatRadio(view, 'mp3'));
    await clickExportButton(view, api, MP3_BUTTON);
    expect(live(api).exportState.message).toBe(`${MP3_DONE_MESSAGE}${MASTER_MUTED_SUFFIX}`);
    fireEvent.click(formatRadio(view, 'both'));
    await clickExportButton(view, api, BOTH_BUTTON);
    expect(live(api).exportState.message).toBe(`${BOTH_DONE_MESSAGE}${MASTER_MUTED_SUFFIX}`);
  });

  it('MX10 mounting the workspace, opening Export and a WAV export never touch the encoder', async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    const api: Mp3ApiRef = { current: null };
    const view = render(
      <ArrangementProvider collection={mp3Collection} initialArrangement={mp3Arrangement()}>
        <StudioWorkspace />
        <Mp3Probe api={api} />
      </ArrangementProvider>,
    );
    await flushLoads();
    expect(loadEncoderMock).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    expect(loadEncoderMock).not.toHaveBeenCalled();
    await clickExportButton(view, api, WAV_BUTTON);
    expect(downloads).toEqual(['czaba-studio-lab.wav']);
    expect(live(api).exportState.phase).toBe('done');
    expect(loadEncoderMock).not.toHaveBeenCalled();
    expect(encodeMock).not.toHaveBeenCalled();
  });

  it('MX11 X1: the project scope radio stays enabled without a range and the disabled range radio names its reason', async () => {
    const noRange = await mountMp3Dialog();
    const project = scopeRadio(noRange.view, 'project');
    const range = scopeRadio(noRange.view, 'range');
    expect(project.disabled).toBe(false);
    expect(project.checked).toBe(true);
    expect(range.disabled).toBe(true);
    const reason = noRange.view.getByTestId('arrangement-export-scope-range-reason');
    expect(reason.id).not.toBe('');
    expect(range.getAttribute('aria-describedby')).toBe(reason.id);
    expect(document.getElementById(reason.id)).toBe(reason);
    noRange.view.unmount();

    const withRange = await mountMp3Dialog({ range: { start: 4, end: 9 } });
    expect(scopeRadio(withRange.view, 'project').disabled).toBe(false);
    expect(scopeRadio(withRange.view, 'range').disabled).toBe(false);
    expect(scopeRadio(withRange.view, 'range').hasAttribute('aria-describedby')).toBe(false);

    let finishRender: (value: Awaited<ReturnType<typeof renderArrangementWav>>) => void = () =>
      undefined;
    renderWavMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishRender = resolve;
        }),
    );
    await act(async () => {
      fireEvent.click(withRange.view.getByRole('button', { name: WAV_BUTTON }));
      await Promise.resolve();
    });
    expect(live(withRange.api).exportState.phase).toBe('rendering');
    expect(scopeRadio(withRange.view, 'project').disabled).toBe(true);
    expect(scopeRadio(withRange.view, 'range').disabled).toBe(true);
    expect(formatRadio(withRange.view, 'wav').disabled).toBe(false);
    expect(formatRadio(withRange.view, 'mp3').disabled).toBe(false);
    expect(formatRadio(withRange.view, 'both').disabled).toBe(false);
    fireEvent.click(formatRadio(withRange.view, 'mp3'));
    expect(formatRadio(withRange.view, 'mp3').checked).toBe(true);
    await act(async () => {
      finishRender({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
    });
    await settleExport(withRange.api);
    expect(downloads).toEqual(['czaba-studio-lab-range.wav']);
    expect(loadEncoderMock).not.toHaveBeenCalled();
    expect(live(withRange.api).exportState.phase).toBe('done');
  });
});
