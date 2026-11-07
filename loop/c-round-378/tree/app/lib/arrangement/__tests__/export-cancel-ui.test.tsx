import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import {
  ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE,
  ARRANGEMENT_EXPORT_CANCELLED_MESSAGE,
} from '~/lib/arrangement/export-cancel';
import {
  type ArrangementRenderOptions,
  type ArrangementWavResult,
  renderArrangementWav,
} from '~/lib/arrangement/graph.client';
import type { ArrangementMp3Encoder } from '~/lib/arrangement/mp3-encoder.client';
import { studioExportStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

const cancelEncoderGate = vi.hoisted(() => {
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
  await cancelEncoderGate.opened;
  return {
    loadArrangementMp3Encoder: cancelEncoderGate.loadArrangementMp3Encoder,
    resetArrangementMp3Encoder: cancelEncoderGate.resetArrangementMp3Encoder,
  };
});

const renderWavMock = vi.mocked(renderArrangementWav);
const loadEncoderMock = cancelEncoderGate.loadArrangementMp3Encoder;
const resetEncoderMock = cancelEncoderGate.resetArrangementMp3Encoder;
const encodeMock = vi.fn<ArrangementMp3Encoder['encode']>();

const WAV_BUTTON = studioExportStrings.formatButtonWav;
const MP3_BUTTON = studioExportStrings.formatButtonMp3;
const BOTH_BUTTON = studioExportStrings.formatButtonBoth;
const WAV_DONE_MESSAGE = studioExportStrings.wavDone('00:20.000', '');
const MP3_DONE_MESSAGE = studioExportStrings.mp3Done('00:20.000', '');
const ENCODER_LOADING_MESSAGE = studioExportStrings.encoderLoading;
const MP3_ENCODING_MESSAGE = studioExportStrings.mp3Encoding;
const CANCELLED_PLAIN = { phase: 'cancelled', message: ARRANGEMENT_EXPORT_CANCELLED_MESSAGE };
const CANCELLED_ENCODER = {
  phase: 'cancelled',
  message: ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE,
};

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

const cancelCollection: WorkspaceCollection = {
  id: 'cancel',
  label: 'cancel',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'cancel', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function cancelArrangement(): Arrangement {
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

interface CancelApiRef {
  current: ArrangementContextValue | null;
}

function CancelProbe({ api }: { api: CancelApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: CancelApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function CancelDialogHost({ api }: { api: CancelApiRef }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open-export
      </button>
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <CancelProbe api={api} />
    </>
  );
}

async function mountCancelDialog() {
  const api: CancelApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={cancelCollection} initialArrangement={cancelArrangement()}>
      <CancelDialogHost api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  fireEvent.click(view.getByRole('button', { name: 'open-export' }));
  return { api, view };
}

type CancelView = ReturnType<typeof render>;

function cancelButton(view: CancelView): HTMLButtonElement | null {
  const element = view.queryByTestId('arrangement-export-cancel');
  if (element !== null && !(element instanceof HTMLButtonElement)) {
    throw new Error('Cancel is not a button');
  }
  return element;
}

function requireCancelButton(view: CancelView): HTMLButtonElement {
  const element = cancelButton(view);
  if (!element) {
    throw new Error('Cancel button missing');
  }
  return element;
}

function dialogButton(view: CancelView, name: string): HTMLButtonElement {
  const button = Array.from(view.getByRole('dialog').querySelectorAll('button')).find(
    (entry) => entry.textContent?.trim() === name,
  );
  if (!button) {
    throw new Error(`dialog button ${name} missing`);
  }
  return button;
}

function progressLabel(view: CancelView) {
  return view.queryByTestId('arrangement-export-progress-label')?.textContent ?? null;
}

function statusText(view: CancelView) {
  const footer = view.getByTestId('arrangement-export-footer');
  return {
    status: footer.querySelector('[role="status"]')?.textContent ?? null,
    alert: footer.querySelector('[role="alert"]')?.textContent ?? null,
  };
}

function chooseFormat(view: CancelView, format: 'mp3' | 'both') {
  fireEvent.click(view.getByTestId(`arrangement-export-format-${format}`));
}

async function clickExport(view: CancelView, name: string) {
  await act(async () => {
    fireEvent.click(view.getByRole('button', { name }));
    await Promise.resolve();
  });
}

async function clickCancel(view: CancelView) {
  const cancel = requireCancelButton(view);
  await act(async () => {
    cancel.focus();
    fireEvent.click(cancel);
    await Promise.resolve();
  });
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

function controlledRenders(): RenderControl[] {
  const controls: RenderControl[] = [];
  renderWavMock.mockImplementation(
    (_arrangement, _buffers, _window, options) =>
      new Promise<ArrangementWavResult>((resolve, reject) => {
        controls.push({ options, finish: resolve, fail: reject });
      }),
  );
  return controls;
}

function controlAt(controls: RenderControl[], index: number): RenderControl {
  const control = controls[index];
  if (!control) {
    throw new Error(`render ${index} was not started`);
  }
  return control;
}

function signalOf(control: RenderControl): AbortSignal {
  const signal = control.options?.signal;
  if (!signal) {
    throw new Error('renderer got no signal');
  }
  return signal;
}

function reportProgress(control: RenderControl, phase: 'render' | 'wav', fraction: number) {
  const onProgress = control.options?.onProgress;
  if (!onProgress) {
    throw new Error('renderer got no onProgress');
  }
  act(() => onProgress(phase, fraction));
}

function pendingEncode() {
  const pending: { finish: (blob: Blob) => void; fail: (error: Error) => void } = {
    finish: () => undefined,
    fail: () => undefined,
  };
  encodeMock.mockImplementation(
    () =>
      new Promise<Blob>((resolve, reject) => {
        pending.finish = resolve;
        pending.fail = reject;
      }),
  );
  return pending;
}

const downloads: string[] = [];
const renderedBlob = new Blob(['rendered-wav']);
const mp3Blob = new Blob(['encoded-mp3']);

function setUpCancelEnvironment() {
  downloads.length = 0;
  renderWavMock.mockReset();
  renderWavMock.mockResolvedValue({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
  loadEncoderMock.mockReset();
  loadEncoderMock.mockResolvedValue({ encode: encodeMock });
  resetEncoderMock.mockReset();
  encodeMock.mockReset();
  encodeMock.mockResolvedValue(mp3Blob);
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
    value: () => 'blob:cancel-test',
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: () => undefined,
  });
}

function tearDownCancelEnvironment() {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
}

describe('SRW-20 stage 3b-1 cancel while the encoder module is still importing (D-29z55)', () => {
  beforeEach(setUpCancelEnvironment);
  afterEach(tearDownCancelEnvironment);

  it('CU3 load-phase cancel before the import resolves (runs first in this file, while the import gate is still closed): the import resets exactly once, never loads, and the next MP3 export succeeds', async () => {
    const { api, view } = await mountCancelDialog();
    chooseFormat(view, 'mp3');
    await clickExport(view, MP3_BUTTON);
    await flushAsync(5);
    expect(live(api).exportState).toEqual({ phase: 'rendering', message: ENCODER_LOADING_MESSAGE });
    expect(progressLabel(view)).toBe(studioExportStrings.progressEncoderLoad);
    await clickCancel(view);
    expect(live(api).exportState).toEqual(CANCELLED_ENCODER);
    expect(statusText(view)).toEqual({
      status: ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE,
      alert: null,
    });
    expect(live(api).exportProgress.getProgress()).toBeNull();
    cancelEncoderGate.release();
    await flushAsync();
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(loadEncoderMock).not.toHaveBeenCalled();
    expect(encodeMock).not.toHaveBeenCalled();
    expect(downloads).toEqual([]);
    expect(live(api).exportState).toEqual(CANCELLED_ENCODER);
    await clickExport(view, MP3_BUTTON);
    await flushAsync();
    expect(loadEncoderMock).toHaveBeenCalledTimes(1);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_DONE_MESSAGE });
    expect(downloads).toEqual(['czaba-studio-lab.mp3']);
  });
});

describe('SRW-20 stage 3b-1 export Cancel in every phase (D-29z55)', { timeout: 15_000 }, () => {
  beforeEach(() => {
    cancelEncoderGate.release();
    setUpCancelEnvironment();
  });
  afterEach(tearDownCancelEnvironment);

  it('CU1 render-phase WAV cancel: Cancel only while rendering, cancelled status, no progress, Done enabled and focused, signal aborted, and a late render downloads nothing', async () => {
    const controls = controlledRenders();
    const { api, view } = await mountCancelDialog();
    expect(cancelButton(view)).toBeNull();
    await clickExport(view, WAV_BUTTON);
    const control = controlAt(controls, 0);
    expect(cancelButton(view)?.textContent).toBe(studioExportStrings.cancelButton);
    expect(cancelButton(view)?.type).toBe('button');
    reportProgress(control, 'render', 0.4);
    expect(progressLabel(view)).toBe(studioExportStrings.progressRendering(40));
    expect(signalOf(control).aborted).toBe(false);
    await clickCancel(view);
    expect(live(api).exportState).toEqual(CANCELLED_PLAIN);
    expect(statusText(view)).toEqual({ status: ARRANGEMENT_EXPORT_CANCELLED_MESSAGE, alert: null });
    expect(live(api).exportProgress.getProgress()).toBeNull();
    expect(progressLabel(view)).toBeNull();
    expect(view.queryByTestId('arrangement-export-progress')).toBeNull();
    expect(cancelButton(view)).toBeNull();
    const close = dialogButton(view, studioExportStrings.closeButton);
    expect(close.disabled).toBe(false);
    expect(document.activeElement).toBe(close);
    expect(dialogButton(view, WAV_BUTTON).disabled).toBe(false);
    expect(signalOf(control).aborted).toBe(true);
    reportProgress(control, 'render', 0.9);
    expect(live(api).exportProgress.getProgress()).toBeNull();
    await act(async () => {
      control.finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
      await Promise.resolve();
    });
    await flushAsync(5);
    expect(downloads).toEqual([]);
    expect(live(api).exportState).toEqual(CANCELLED_PLAIN);
  });

  it('CU2 cancelled wins over a later render error', async () => {
    const controls = controlledRenders();
    const { api, view } = await mountCancelDialog();
    await clickExport(view, WAV_BUTTON);
    await clickCancel(view);
    await act(async () => {
      controlAt(controls, 0).fail(new Error('render broke after cancel'));
      await Promise.resolve();
    });
    await flushAsync(5);
    expect(live(api).exportState).toEqual(CANCELLED_PLAIN);
    expect(statusText(view).alert).toBeNull();
    expect(downloads).toEqual([]);
  });

  it('CU3 load-phase cancel with a hanging load: the encoder message, one reset, and a late load adds no reset, encode or download; the next MP3 export loads again', async () => {
    let finishLoad: (encoder: ArrangementMp3Encoder) => void = () => undefined;
    loadEncoderMock.mockImplementationOnce(
      () =>
        new Promise<ArrangementMp3Encoder>((resolve) => {
          finishLoad = resolve;
        }),
    );
    const { api, view } = await mountCancelDialog();
    chooseFormat(view, 'mp3');
    await clickExport(view, MP3_BUTTON);
    await flushAsync(5);
    expect(loadEncoderMock).toHaveBeenCalledTimes(1);
    expect(progressLabel(view)).toBe(studioExportStrings.progressEncoderLoad);
    await clickCancel(view);
    expect(live(api).exportState).toEqual(CANCELLED_ENCODER);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      finishLoad({ encode: encodeMock });
      await Promise.resolve();
    });
    await flushAsync();
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(encodeMock).not.toHaveBeenCalled();
    expect(downloads).toEqual([]);
    expect(live(api).exportState).toEqual(CANCELLED_ENCODER);
    await clickExport(view, MP3_BUTTON);
    await flushAsync();
    expect(loadEncoderMock).toHaveBeenCalledTimes(2);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_DONE_MESSAGE });
    expect(downloads).toEqual(['czaba-studio-lab.mp3']);
  });

  it('CU4 mp3-phase cancel of WAV + MP3: the encoder message, one reset, and a late encode delivers neither file', async () => {
    const encode = pendingEncode();
    const { api, view } = await mountCancelDialog();
    chooseFormat(view, 'both');
    await clickExport(view, BOTH_BUTTON);
    await flushAsync();
    expect(live(api).exportState).toEqual({ phase: 'rendering', message: MP3_ENCODING_MESSAGE });
    expect(progressLabel(view)).toBe(studioExportStrings.progressMp3Encode(0));
    await clickCancel(view);
    expect(live(api).exportState).toEqual(CANCELLED_ENCODER);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      encode.finish(mp3Blob);
      await Promise.resolve();
    });
    await flushAsync();
    expect(downloads).toEqual([]);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState).toEqual(CANCELLED_ENCODER);
  });

  it('CU5 render-phase cancel of an MP3 export: the plain message, no reset, and no load after the late render', async () => {
    const controls = controlledRenders();
    const { api, view } = await mountCancelDialog();
    chooseFormat(view, 'mp3');
    await clickExport(view, MP3_BUTTON);
    const control = controlAt(controls, 0);
    reportProgress(control, 'render', 0.3);
    await clickCancel(view);
    expect(live(api).exportState).toEqual(CANCELLED_PLAIN);
    expect(resetEncoderMock).not.toHaveBeenCalled();
    await act(async () => {
      control.finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
      await Promise.resolve();
    });
    await flushAsync();
    expect(resetEncoderMock).not.toHaveBeenCalled();
    expect(loadEncoderMock).not.toHaveBeenCalled();
    expect(downloads).toEqual([]);
    expect(live(api).exportState).toEqual(CANCELLED_PLAIN);
  });

  it('CU6 a new export right after a cancel keeps its progress when the old render settles, and completes normally', async () => {
    const controls = controlledRenders();
    const { api, view } = await mountCancelDialog();
    await clickExport(view, WAV_BUTTON);
    await clickCancel(view);
    await clickExport(view, WAV_BUTTON);
    const fresh = controlAt(controls, 1);
    expect(signalOf(fresh).aborted).toBe(false);
    reportProgress(fresh, 'render', 0.6);
    expect(progressLabel(view)).toBe(studioExportStrings.progressRendering(60));
    await act(async () => {
      controlAt(controls, 0).finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
      await Promise.resolve();
    });
    await flushAsync(5);
    expect(progressLabel(view)).toBe(studioExportStrings.progressRendering(60));
    expect(live(api).exportProgress.getProgress()).toEqual({ phase: 'render', fraction: 0.6 });
    expect(live(api).exportState.phase).toBe('rendering');
    expect(downloads).toEqual([]);
    await act(async () => {
      fresh.finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
      await Promise.resolve();
    });
    await flushAsync(5);
    expect(live(api).exportState).toEqual({ phase: 'done', message: WAV_DONE_MESSAGE });
    expect(downloads).toEqual(['czaba-studio-lab.wav']);
    expect(live(api).exportProgress.getProgress()).toBeNull();
  });

  it('CU7 unmount during the mp3 phase aborts, resets once, and a late encode downloads nothing and logs no console error', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const controls: RenderControl[] = [];
    renderWavMock.mockImplementation(async (_arrangement, _buffers, _window, options) => {
      controls.push({ options, finish: () => undefined, fail: () => undefined });
      return { blob: renderedBlob, peak: 0.5, clippedSamples: 0 };
    });
    const encode = pendingEncode();
    const { view } = await mountCancelDialog();
    chooseFormat(view, 'mp3');
    await clickExport(view, MP3_BUTTON);
    await flushAsync();
    expect(progressLabel(view)).toBe(studioExportStrings.progressMp3Encode(0));
    const signal = signalOf(controlAt(controls, 0));
    view.unmount();
    expect(signal.aborted).toBe(true);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    encode.finish(mp3Blob);
    await flushAsync();
    expect(downloads).toEqual([]);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('CU7 unmount during the render phase aborts and a late render downloads nothing', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const controls = controlledRenders();
    const { view } = await mountCancelDialog();
    await clickExport(view, WAV_BUTTON);
    const control = controlAt(controls, 0);
    view.unmount();
    expect(signalOf(control).aborted).toBe(true);
    control.finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
    await flushAsync();
    expect(downloads).toEqual([]);
    expect(resetEncoderMock).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('CU8 L5 a failed conversion resets the encoder once, keeps the failure message, and the next MP3 export loads again', async () => {
    encodeMock.mockRejectedValueOnce(new Error('lame exploded'));
    const { api, view } = await mountCancelDialog();
    chooseFormat(view, 'mp3');
    await clickExport(view, MP3_BUTTON);
    await flushAsync();
    expect(live(api).exportState).toEqual({
      phase: 'error',
      message: studioExportStrings.mp3Failed('lame exploded'),
    });
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(downloads).toEqual([]);
    await clickExport(view, MP3_BUTTON);
    await flushAsync();
    expect(loadEncoderMock).toHaveBeenCalledTimes(2);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
    expect(live(api).exportState).toEqual({ phase: 'done', message: MP3_DONE_MESSAGE });
    expect(downloads).toEqual(['czaba-studio-lab.mp3']);
  });

  it('CU9 keyboard: during a render the stops are X, the format radios and Cancel; a click on the focused Cancel moves focus to Done; Escape does not cancel', async () => {
    const controls = controlledRenders();
    const { api, view } = await mountCancelDialog();
    await clickExport(view, WAV_BUTTON);
    const dialog = view.getByRole('dialog');
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([tabindex="-1"]), input:not([type="hidden"]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.matches(':disabled'));
    expect(
      focusable.map(
        (element) =>
          element.getAttribute('data-testid') ?? element.getAttribute('aria-label') ?? '',
      ),
    ).toEqual([
      'Close',
      'arrangement-export-format-wav',
      'arrangement-export-format-mp3',
      'arrangement-export-format-both',
      'arrangement-export-cancel',
    ]);
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(view.queryByRole('dialog')).not.toBeNull();
    expect(live(api).exportState.phase).toBe('rendering');
    expect(signalOf(controlAt(controls, 0)).aborted).toBe(false);
    const cancel = requireCancelButton(view);
    act(() => {
      cancel.focus();
    });
    const tabFromCancel = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      cancel.dispatchEvent(tabFromCancel);
    });
    expect(tabFromCancel.defaultPrevented).toBe(true);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close');
    act(() => {
      cancel.focus();
    });
    await clickCancel(view);
    expect(live(api).exportState).toEqual(CANCELLED_PLAIN);
    expect(document.activeElement).toBe(dialogButton(view, studioExportStrings.closeButton));
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(view.queryByRole('dialog')).toBeNull();
  });
});

describe('SRW-20 stage 3b-1 cancel between the settled encode and the downloads (C-R90-MUT-B-CU4-GAP)', () => {
  beforeEach(() => {
    cancelEncoderGate.release();
    setUpCancelEnvironment();
  });
  afterEach(tearDownCancelEnvironment);

  it('CU10 a cancel after the MP3 encode settled but before the downloads: neither file downloads, the encoder message, and one reset', async () => {
    const encode = pendingEncode();
    const signals: AbortSignal[] = [];
    renderWavMock.mockImplementation(async (_arrangement, _buffers, _window, options) => {
      if (options?.signal) {
        signals.push(options.signal);
      }
      return { blob: renderedBlob, peak: 0.5, clippedSamples: 0 };
    });
    const { api, view } = await mountCancelDialog();
    chooseFormat(view, 'both');
    await clickExport(view, BOTH_BUTTON);
    await flushAsync();
    expect(live(api).exportState).toEqual({ phase: 'rendering', message: MP3_ENCODING_MESSAGE });
    expect(resetEncoderMock).not.toHaveBeenCalled();
    const signal = signals[0];
    if (!signal) {
      throw new Error('renderer got no signal');
    }
    const abortRemovals = vi.spyOn(signal, 'removeEventListener');
    await act(async () => {
      encode.finish(mp3Blob);
      await Promise.resolve();
      expect(abortRemovals).toHaveBeenCalledTimes(1);
      live(api).cancelExport();
    });
    await flushAsync();
    expect(downloads).toEqual([]);
    expect(live(api).exportState).toEqual(CANCELLED_ENCODER);
    expect(resetEncoderMock).toHaveBeenCalledTimes(1);
  });
});
