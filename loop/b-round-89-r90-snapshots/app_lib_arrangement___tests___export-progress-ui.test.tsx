import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import {
  ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS,
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import {
  type ArrangementRenderOptions,
  type ArrangementWavResult,
  renderArrangementWav,
} from '~/lib/arrangement/graph.client';
import type { ArrangementMp3Encoder } from '~/lib/arrangement/mp3-encoder.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { convertWavToMp3, loadFFmpeg } from '~/utils/ffmpeg';
import { createArrangement } from '../model';

const encoderImportGate = vi.hoisted(() => {
  let release: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    opened,
    release: () => release(),
    loadArrangementMp3Encoder: vi.fn<() => Promise<ArrangementMp3Encoder>>(),
    resetArrangementMp3Encoder: vi.fn<() => void>(),
  };
});

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

vi.mock('~/lib/arrangement/mp3-encoder.client', async () => {
  await encoderImportGate.opened;
  return {
    loadArrangementMp3Encoder: encoderImportGate.loadArrangementMp3Encoder,
    resetArrangementMp3Encoder: encoderImportGate.resetArrangementMp3Encoder,
  };
});

vi.mock('~/utils/ffmpeg', () => ({ loadFFmpeg: vi.fn(), convertWavToMp3: vi.fn() }));

const renderWavMock = vi.mocked(renderArrangementWav);
const loadEncoderMock = encoderImportGate.loadArrangementMp3Encoder;
const resetEncoderMock = encoderImportGate.resetArrangementMp3Encoder;
const encodeMock = vi.fn<ArrangementMp3Encoder['encode']>();
const loadFFmpegMock = vi.mocked(loadFFmpeg);
const convertWavToMp3Mock = vi.mocked(convertWavToMp3);

const WAV_BUTTON = 'WAV-ის ექსპორტი';
const MP3_BUTTON = 'MP3-ის ექსპორტი';
const WAV_DONE_MESSAGE = 'WAV შეიქმნა: 00:20.000, 24-bit · 48 kHz · stereo.';
const MP3_DONE_MESSAGE = 'MP3 შეიქმნა: 00:20.000, 48 kHz · stereo.';
const LOAD_TIMEOUT_MESSAGE =
  'MP3 encoder 120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. გადატვირთე გვერდი და სცადე თავიდან, ან აირჩიე WAV.';
const LOAD_FAILED_MESSAGE =
  'MP3 encoder ვერ ჩაიტვირთა (ffmpeg.wasm, unpkg CDN) — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.';
const ENCODER_LOADING_MESSAGE = 'MP3 encoder იტვირთება (ffmpeg.wasm, პირველად ~31 MB)…';

class FakeNode {
  connect(destination: FakeNode) {
    return destination;
  }
  disconnect() {}
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

const progressCollection: WorkspaceCollection = {
  id: 'progress',
  label: 'progress',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'progress', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function progressArrangement(): Arrangement {
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

interface ProgressApiRef {
  current: ArrangementContextValue | null;
  renders: number;
}

function ProgressProbe({ api }: { api: ProgressApiRef }) {
  api.current = useArrangement();
  api.renders += 1;
  return null;
}

function live(api: ProgressApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function ProgressDialogHost({ api }: { api: ProgressApiRef }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open-export
      </button>
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <ProgressProbe api={api} />
    </>
  );
}

async function mountProgressDialog() {
  const api: ProgressApiRef = { current: null, renders: 0 };
  const view = render(
    <ArrangementProvider collection={progressCollection} initialArrangement={progressArrangement()}>
      <ProgressDialogHost api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  fireEvent.click(view.getByRole('button', { name: 'open-export' }));
  return { api, view };
}

function progressLabel(view: ReturnType<typeof render>) {
  return view.queryByTestId('arrangement-export-progress-label')?.textContent ?? null;
}

function progressBar(view: ReturnType<typeof render>): HTMLProgressElement | null {
  const element = view.queryByTestId('arrangement-export-progress');
  if (element === null) {
    return null;
  }
  if (!(element instanceof HTMLProgressElement)) {
    throw new Error('progress element is not <progress>');
  }
  return element;
}

function chooseMp3(view: ReturnType<typeof render>) {
  const radio = view.getByTestId('arrangement-export-format-mp3');
  fireEvent.click(radio);
}

async function flushAsync(rounds = 20) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

interface RenderControl {
  options: ArrangementRenderOptions | undefined;
  finish: (result: ArrangementWavResult) => void;
  fail: (error: Error) => void;
}

function controlledRender(): { current: RenderControl | null } {
  const control: { current: RenderControl | null } = { current: null };
  renderWavMock.mockImplementation(
    (_arrangement, _buffers, _window, options) =>
      new Promise<ArrangementWavResult>((resolve, reject) => {
        control.current = { options, finish: resolve, fail: reject };
      }),
  );
  return control;
}

function reportProgress(
  control: { current: RenderControl | null },
  phase: 'render' | 'wav',
  fraction: number,
) {
  const onProgress = control.current?.options?.onProgress;
  if (!onProgress) {
    throw new Error('renderer got no onProgress');
  }
  act(() => onProgress(phase, fraction));
}

describe('SRW-20 stage 3a export progress in the dialog (D-29z52)', { timeout: 15_000 }, () => {
  const downloads: string[] = [];
  const renderedBlob = new Blob(['rendered-wav']);
  const mp3Blob = new Blob(['encoded-mp3']);

  beforeEach(() => {
    downloads.length = 0;
    renderWavMock.mockReset();
    renderWavMock.mockResolvedValue({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
    loadEncoderMock.mockReset();
    loadEncoderMock.mockResolvedValue({ encode: encodeMock });
    resetEncoderMock.mockReset();
    encodeMock.mockReset();
    encodeMock.mockResolvedValue(mp3Blob);
    loadFFmpegMock.mockReset();
    convertWavToMp3Mock.mockReset();
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
      value: () => 'blob:progress-test',
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

  it('PU4 the 120 s timer covers the encoder import, the timeout clears the progress, and a module that arrives later never starts a load and resets', async () => {
    const { api, view } = await mountProgressDialog();
    chooseMp3(view);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: MP3_BUTTON }));
      await Promise.resolve();
    });
    for (let i = 0; i < 20 && live(api).exportState.message !== ENCODER_LOADING_MESSAGE; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    }
    expect(live(api).exportState).toEqual({ phase: 'rendering', message: ENCODER_LOADING_MESSAGE });
    expect(progressLabel(view)).toBe('MP3 encoder-ის ჩატვირთვა…');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS - 1);
    });
    expect(live(api).exportState).toEqual({ phase: 'rendering', message: ENCODER_LOADING_MESSAGE });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(live(api).exportState).toEqual({ phase: 'error', message: LOAD_TIMEOUT_MESSAGE });
    expect(progressBar(view)).toBeNull();
    expect(progressLabel(view)).toBeNull();
    expect(live(api).exportProgress.getProgress()).toBeNull();
    expect(downloads).toEqual([]);
    expect(resetEncoderMock).not.toHaveBeenCalled();
    vi.useRealTimers();
    encoderImportGate.release();
    await flushAsync();
    expect(loadEncoderMock).not.toHaveBeenCalled();
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState).toEqual({ phase: 'error', message: LOAD_TIMEOUT_MESSAGE });
  });

  it('PU4 with the module loaded, a never-settling load resets once at the timeout and the next export loads again and succeeds', async () => {
    loadEncoderMock.mockImplementationOnce(() => new Promise(() => undefined));
    const { api, view } = await mountProgressDialog();
    chooseMp3(view);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: MP3_BUTTON }));
      await Promise.resolve();
    });
    for (let i = 0; i < 50 && loadEncoderMock.mock.calls.length === 0; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    }
    expect(loadEncoderMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS);
    });
    expect(live(api).exportState).toEqual({ phase: 'error', message: LOAD_TIMEOUT_MESSAGE });
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(progressBar(view)).toBeNull();
    expect(live(api).exportProgress.getProgress()).toBeNull();
    vi.useRealTimers();
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: MP3_BUTTON }));
      await Promise.resolve();
    });
    await flushAsync();
    expect(loadEncoderMock).toHaveBeenCalledTimes(2);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_DONE_MESSAGE });
    expect(downloads).toEqual(['czaba-studio-lab.mp3']);
  });

  it('PU1 WAV export shows render then wav progress during the render and nothing before or after; exportState has no progress field', async () => {
    const control = controlledRender();
    const { api, view } = await mountProgressDialog();
    expect(progressBar(view)).toBeNull();
    expect(progressLabel(view)).toBeNull();
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: WAV_BUTTON }));
      await Promise.resolve();
    });
    expect(control.current?.options?.onProgress).toBeTypeOf('function');
    expect(progressBar(view)).toBeNull();
    reportProgress(control, 'render', 0.5);
    expect(progressLabel(view)).toBe('რენდერი · 50%');
    expect(progressBar(view)?.getAttribute('value')).toBe('0.5');
    expect(progressBar(view)?.getAttribute('max')).toBe('1');
    expect(progressBar(view)?.getAttribute('aria-label')).toBe('ექსპორტის პროგრესი');
    expect(progressBar(view)?.tabIndex).toBe(-1);
    reportProgress(control, 'render', 1);
    reportProgress(control, 'wav', 0.25);
    expect(progressLabel(view)).toBe('WAV-ის ჩაწერა · 25%');
    expect(progressBar(view)?.getAttribute('value')).toBe('0.25');
    expect(live(api).exportState).toEqual({
      phase: 'rendering',
      message: 'რენდერი და 24-bit WAV-ის შექმნა…',
    });
    await act(async () => {
      control.current?.finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
      await Promise.resolve();
    });
    await flushAsync(2);
    expect(live(api).exportState).toEqual({ phase: 'done', message: WAV_DONE_MESSAGE });
    expect(progressBar(view)).toBeNull();
    expect(progressLabel(view)).toBeNull();
    expect(live(api).exportProgress.getProgress()).toBeNull();
    expect(downloads).toEqual(['czaba-studio-lab.wav']);
  });

  it('PU1 a failed WAV render clears the progress', async () => {
    const control = controlledRender();
    const { api, view } = await mountProgressDialog();
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: WAV_BUTTON }));
      await Promise.resolve();
    });
    reportProgress(control, 'render', 0.3);
    expect(progressLabel(view)).toBe('რენდერი · 30%');
    await act(async () => {
      control.current?.fail(new Error('render broke'));
      await Promise.resolve();
    });
    await flushAsync(2);
    expect(live(api).exportState.phase).toBe('error');
    expect(progressBar(view)).toBeNull();
    expect(live(api).exportProgress.getProgress()).toBeNull();
  });

  it('PU2 MP3 shows an indeterminate load bar without a value attribute, then the mp3 percent; done clears it', async () => {
    renderWavMock.mockImplementation(async (_arrangement, _buffers, _window, options) => {
      options?.onProgress?.('render', 1);
      options?.onProgress?.('wav', 1);
      return { blob: renderedBlob, peak: 0.5, clippedSamples: 0 };
    });
    let finishLoad: (encoder: ArrangementMp3Encoder) => void = () => undefined;
    loadEncoderMock.mockImplementation(
      () =>
        new Promise<ArrangementMp3Encoder>((resolve) => {
          finishLoad = resolve;
        }),
    );
    let encodeProgress: ((fraction: number) => void) | undefined;
    let finishEncode: (blob: Blob) => void = () => undefined;
    encodeMock.mockImplementation(
      (_wav, onProgress) =>
        new Promise<Blob>((resolve) => {
          encodeProgress = onProgress;
          finishEncode = resolve;
        }),
    );
    const { api, view } = await mountProgressDialog();
    chooseMp3(view);
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: MP3_BUTTON }));
      await Promise.resolve();
    });
    await flushAsync(5);
    expect(loadEncoderMock).toHaveBeenCalledTimes(1);
    expect(progressLabel(view)).toBe('MP3 encoder-ის ჩატვირთვა…');
    expect(progressBar(view)?.hasAttribute('value')).toBe(false);
    await act(async () => {
      finishLoad({ encode: encodeMock });
      await Promise.resolve();
    });
    await flushAsync(2);
    expect(progressLabel(view)).toBe('MP3-ის შექმნა · 0%');
    expect(progressBar(view)?.getAttribute('value')).toBe('0');
    act(() => encodeProgress?.(0.426));
    expect(progressLabel(view)).toBe('MP3-ის შექმნა · 42%');
    expect(progressBar(view)?.getAttribute('value')).toBe('0.426');
    await act(async () => {
      finishEncode(mp3Blob);
      await Promise.resolve();
    });
    await flushAsync(2);
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_DONE_MESSAGE });
    expect(progressBar(view)).toBeNull();
    expect(progressLabel(view)).toBeNull();
    expect(live(api).exportProgress.getProgress()).toBeNull();
  });

  it('PU2 a load failure and a conversion failure each clear the progress and reset after the load failure', async () => {
    loadEncoderMock.mockRejectedValueOnce(new Error('cdn blocked'));
    const { api, view } = await mountProgressDialog();
    chooseMp3(view);
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: MP3_BUTTON }));
      await Promise.resolve();
    });
    await flushAsync();
    expect(live(api).exportState).toEqual({ phase: 'error', message: LOAD_FAILED_MESSAGE });
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(progressBar(view)).toBeNull();
    expect(live(api).exportProgress.getProgress()).toBeNull();
    encodeMock.mockRejectedValueOnce(new Error('lame exploded'));
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: MP3_BUTTON }));
      await Promise.resolve();
    });
    await flushAsync();
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: 'MP3-ის შექმნა ვერ მოხერხდა — ფაილი არ შეიქმნა. lame exploded',
    });
    expect(progressBar(view)).toBeNull();
    expect(live(api).exportProgress.getProgress()).toBeNull();
    expect(downloads).toEqual([]);
  });

  it('PU3 progress updates do not re-render the provider or useArrangement consumers', async () => {
    const control = controlledRender();
    const { api, view } = await mountProgressDialog();
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: WAV_BUTTON }));
      await Promise.resolve();
    });
    reportProgress(control, 'render', 0.01);
    const valueBefore = live(api);
    const rendersBefore = api.renders;
    for (let i = 2; i <= 11; i++) {
      reportProgress(control, 'render', i / 20);
    }
    expect(progressLabel(view)).toBe('რენდერი · 55%');
    expect(api.renders).toBe(rendersBefore);
    expect(live(api)).toBe(valueBefore);
    expect(live(api).exportProgress).toBe(valueBefore.exportProgress);
    await act(async () => {
      control.current?.finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
      await Promise.resolve();
    });
    await flushAsync(2);
  });

  it('PU5 the context never touches ~/utils/ffmpeg and imports the lab encoder only dynamically', async () => {
    const { api, view } = await mountProgressDialog();
    chooseMp3(view);
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: MP3_BUTTON }));
      await Promise.resolve();
    });
    await flushAsync();
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_DONE_MESSAGE });
    expect(loadEncoderMock).toHaveBeenCalledTimes(1);
    expect(loadFFmpegMock).not.toHaveBeenCalled();
    expect(convertWavToMp3Mock).not.toHaveBeenCalled();
    const source = readFileSync(
      resolve(__dirname, '../../../contexts/ArrangementContext.tsx'),
      'utf8',
    );
    expect(source).not.toContain('utils/ffmpeg');
    expect(source).not.toContain('@ffmpeg/');
    expect(source).not.toMatch(/from '~\/lib\/arrangement\/mp3-encoder\.client'/);
    expect(source).toContain("import('~/lib/arrangement/mp3-encoder.client').then(");
  });
});
