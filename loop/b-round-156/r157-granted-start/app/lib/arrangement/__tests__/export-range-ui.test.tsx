import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { renderArrangementWav } from '~/lib/arrangement/graph.client';
import { studioExportStrings } from '~/lib/arrangement/strings';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

const renderWavMock = vi.mocked(renderArrangementWav);

const DONE_MESSAGE = studioExportStrings.wavDone('00:20.000', '');
const RANGE_DONE_MESSAGE = studioExportStrings.wavDone(
  studioExportStrings.exportedRange({
    start: '00:04.000',
    end: '00:09.000',
    seconds: studioExportStrings.rangeSeconds(5),
  }),
  '',
);
const RANGE_LABEL = studioExportStrings.rangeScope(
  `00:04.000 — 00:09.000 (${studioExportStrings.rangeSeconds(5)})`,
);
const PROJECT_LABEL = studioExportStrings.projectScope('00:00.000', '00:20.000');
const PROJECT_DESCRIPTION = studioExportStrings.projectScope('0:00', '00:20.000');
const RANGE_MISSING_REASON = studioExportStrings.rangeMissingReason;
const INVALID_RANGE_MESSAGE = studioExportStrings.invalidRangeNoFile;
const VIDEO_RENDER_REASON = studioExportStrings.videoRenderReason;
const VIDEO_FADES_NOTE = studioExportStrings.videoFadesPreviewNote;
const OVERLOAD_WARNING = studioExportStrings.overloadWarning({
  peakDb: '0.8',
  clippedSamples: 3,
  reductionDb: '0.9',
});

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

const rangeCollection: WorkspaceCollection = {
  id: 'range',
  label: 'range',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'range', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function rangeArrangement(extra: ArrangementClip[] = []): Arrangement {
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

interface RangeApiRef {
  current: ArrangementContextValue | null;
}

function RangeProbe({ api }: { api: RangeApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: RangeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function DialogHost({ api, initialOpen }: { api: RangeApiRef; initialOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open-export
      </button>
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <RangeProbe api={api} />
    </>
  );
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountDialog(
  options: {
    arrangement?: Arrangement;
    range?: { start: number; end: number; allTracks?: true };
    open?: boolean;
  } = {},
) {
  const api: RangeApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={rangeCollection}
      initialArrangement={options.arrangement ?? rangeArrangement()}
    >
      <DialogHost api={api} initialOpen={options.open ?? false} />
    </ArrangementProvider>,
  );
  await flushLoads();
  const range = options.range;
  if (range) {
    act(() => live(api).setTimeRange({ ...range, trackId: 'music' }));
  }
  if (!options.open) {
    fireEvent.click(view.getByRole('button', { name: 'open-export' }));
  }
  return { api, view };
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

function descriptionText(view: ReturnType<typeof render>): string {
  const title = view.getByText('Export');
  return title.nextElementSibling?.textContent ?? '';
}

async function clickExport(view: ReturnType<typeof render>) {
  await act(async () => {
    fireEvent.click(view.getByRole('button', { name: studioExportStrings.formatButtonWav }));
    await Promise.resolve();
    await Promise.resolve();
  });
}

function closeDialog(view: ReturnType<typeof render>) {
  fireEvent.click(view.getByRole('button', { name: studioExportStrings.closeButton }));
}

describe('SRW-20 stage 1 range export dialog (D-29z50, R20-X1/R20-X3)', { timeout: 15_000 }, () => {
  const downloads: string[] = [];

  beforeEach(() => {
    downloads.length = 0;
    renderWavMock.mockReset();
    renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 0.5, clippedSamples: 0 });
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
      value: () => 'blob:range-test',
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('XU1 no range: project checked, range disabled with the reason, whole-project export unchanged', async () => {
    const { api, view } = await mountDialog();
    const project = scopeRadio(view, 'project');
    const range = scopeRadio(view, 'range');
    expect(project.checked).toBe(true);
    expect(range.checked).toBe(false);
    expect(range.disabled).toBe(true);
    expect(view.getByTestId('arrangement-export-scope-range-reason').textContent).toBe(
      RANGE_MISSING_REASON,
    );
    expect(radioLabelText(project)).toBe(PROJECT_LABEL);
    expect(descriptionText(view)).toBe(PROJECT_DESCRIPTION);
    await clickExport(view);
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(renderWavMock.mock.calls[0]?.[2]).toBeUndefined();
    expect(live(api).exportState).toEqual({ phase: 'done', message: DONE_MESSAGE });
    expect(downloads).toEqual(['czaba-studio-lab.wav']);
  });

  it('XU2 a 4–9 range is the default scope and exports exactly that window', async () => {
    renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 1.1, clippedSamples: 3 });
    const { api, view } = await mountDialog({ range: { start: 4, end: 9 } });
    const range = scopeRadio(view, 'range');
    expect(range.checked).toBe(true);
    expect(range.disabled).toBe(false);
    expect(scopeRadio(view, 'project').checked).toBe(false);
    expect(radioLabelText(range)).toBe(RANGE_LABEL);
    expect(view.queryByTestId('arrangement-export-scope-range-reason')).toBeNull();
    expect(descriptionText(view)).toBe(RANGE_LABEL);
    await clickExport(view);
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(renderWavMock.mock.calls[0]?.[2]).toStrictEqual({ start: 4, end: 9 });
    expect(live(api).exportState).toEqual({
      phase: 'done',
      message: RANGE_DONE_MESSAGE,
      warning: OVERLOAD_WARNING,
    });
    expect(view.getByTestId('arrangement-export-overload').textContent).toBe(OVERLOAD_WARNING);
    expect(downloads).toEqual(['czaba-studio-lab-range.wav']);
  });

  it('XU2 an unnormalised 9→4 range on all lanes gives the same label and window', async () => {
    const { api, view } = await mountDialog({ range: { start: 9, end: 4, allTracks: true } });
    expect(scopeRadio(view, 'range').checked).toBe(true);
    expect(radioLabelText(scopeRadio(view, 'range'))).toBe(RANGE_LABEL);
    await clickExport(view);
    expect(renderWavMock.mock.calls[0]?.[2]).toStrictEqual({ start: 4, end: 9 });
    expect(live(api).exportState.message).toBe(RANGE_DONE_MESSAGE);
  });

  it('XU2 range scope names the window in the loop and master-mute notes', async () => {
    const looped: Arrangement = {
      ...rangeArrangement(),
      loop: { start: 2, end: 6, enabled: true },
    };
    const { api, view } = await mountDialog({ arrangement: looped, range: { start: 4, end: 9 } });
    act(() => live(api).toggleMasterMute());
    expect(view.getByTestId('arrangement-export-loop-note').textContent).toBe(
      studioExportStrings.loopRangeNote({
        start: '00:04.000',
        end: '00:09.000',
        seconds: studioExportStrings.rangeSeconds(5),
      }),
    );
    expect(view.getByTestId('arrangement-export-master-mute').textContent).toBe(
      studioExportStrings.masterMutedNote(
        studioExportStrings.formatCreatesWav,
        studioExportStrings.rangeSeconds(5),
      ),
    );
    expect(view.getByTestId('arrangement-export-graph-note').textContent).toBe(
      studioExportStrings.wavNoteRangeLoop,
    );
  });

  it('XU3 choosing the project scope with a range exports the whole project with byte-identical texts', async () => {
    const looped: Arrangement = {
      ...rangeArrangement(),
      loop: { start: 2, end: 6, enabled: true },
    };
    const { api, view } = await mountDialog({ arrangement: looped, range: { start: 4, end: 9 } });
    act(() => live(api).toggleMasterMute());
    fireEvent.click(scopeRadio(view, 'project'));
    expect(scopeRadio(view, 'project').checked).toBe(true);
    expect(scopeRadio(view, 'range').checked).toBe(false);
    expect(descriptionText(view)).toBe(PROJECT_DESCRIPTION);
    expect(view.getByTestId('arrangement-export-loop-note').textContent).toBe(
      studioExportStrings.loopProjectNote('00:00.000', '00:20.000'),
    );
    expect(view.getByTestId('arrangement-export-master-mute').textContent).toBe(
      studioExportStrings.masterMutedNote(studioExportStrings.formatCreatesWav, '00:20.000'),
    );
    expect(view.getByTestId('arrangement-export-graph-note').textContent).toBe(
      studioExportStrings.wavNoteProjectLoop,
    );
    await clickExport(view);
    expect(renderWavMock).toHaveBeenCalledTimes(1);
    expect(renderWavMock.mock.calls[0]?.[2]).toBeUndefined();
    expect(live(api).exportState.message).toBe(
      `${DONE_MESSAGE}${studioExportStrings.masterMutedSuffix}`,
    );
    expect(downloads).toEqual(['czaba-studio-lab.wav']);
    closeDialog(view);
    fireEvent.click(view.getByRole('button', { name: 'open-export' }));
    expect(scopeRadio(view, 'range').checked).toBe(true);
    expect(descriptionText(view)).toBe(RANGE_LABEL);
  });

  it('XU3 the no-sound note keeps the project text and names the range length in range scope', async () => {
    const silent: Arrangement = {
      ...rangeArrangement(),
      clips: [
        {
          id: 'ghost',
          trackId: 'music',
          sourceId: 'missing',
          start: 0,
          sourceOffset: 0,
          duration: 20,
        },
      ],
    };
    const { view } = await mountDialog({ arrangement: silent, range: { start: 4, end: 9 } });
    expect(
      view.getByText(new RegExp(studioExportStrings.noSoundNote('', '').split(' — ')[0]))
        .textContent,
    ).toBe(
      studioExportStrings.noSoundNote(
        studioExportStrings.formatCreatesWav,
        studioExportStrings.rangeSeconds(5),
      ),
    );
    fireEvent.click(scopeRadio(view, 'project'));
    expect(
      view.getByText(new RegExp(studioExportStrings.noSoundNote('', '').split(' — ')[0]))
        .textContent,
    ).toBe(studioExportStrings.noSoundNote(studioExportStrings.formatCreatesWav, '00:20.000'));
  });

  it('XU3 a range cleared while the dialog is open falls back to the whole project', async () => {
    const { api, view } = await mountDialog({ range: { start: 4, end: 9 } });
    expect(scopeRadio(view, 'range').checked).toBe(true);
    act(() => live(api).setTimeRange(null));
    expect(scopeRadio(view, 'project').checked).toBe(true);
    expect(scopeRadio(view, 'range').disabled).toBe(true);
    expect(descriptionText(view)).toBe(PROJECT_DESCRIPTION);
    await clickExport(view);
    expect(renderWavMock.mock.calls[0]?.[2]).toBeUndefined();
    expect(live(api).exportState.message).toBe(DONE_MESSAGE);
    expect(downloads).toEqual(['czaba-studio-lab.wav']);
  });

  it('XU4 a range shorter than 1 ms counts as no range', async () => {
    const { view } = await mountDialog({ range: { start: 5, end: 5.0009 } });
    expect(scopeRadio(view, 'project').checked).toBe(true);
    expect(scopeRadio(view, 'range').disabled).toBe(true);
    expect(view.getByTestId('arrangement-export-scope-range-reason').textContent).toBe(
      RANGE_MISSING_REASON,
    );
    await clickExport(view);
    expect(renderWavMock.mock.calls[0]?.[2]).toBeUndefined();
  });

  it('XU4 exportWav with an invalid window writes the exact error and never renders', async () => {
    const { api } = await mountDialog({ open: true });
    for (const invalid of [
      { start: 5, end: 5 },
      { start: 5, end: 5.0005 },
      { start: 9, end: 4 },
      { start: -1, end: 4 },
      { start: 0, end: Number.POSITIVE_INFINITY },
      { start: Number.NaN, end: 4 },
    ]) {
      await act(async () => {
        await live(api).exportWav(invalid);
      });
      expect(live(api).exportState).toEqual({ phase: 'error', message: INVALID_RANGE_MESSAGE });
    }
    expect(renderWavMock).not.toHaveBeenCalled();
    expect(downloads).toEqual([]);
  });

  it('XU5 WAV, MP3 and WAV + MP3 are enabled, video stays disabled with its reason, and the video-fades note still follows a video fade', async () => {
    const fadedVideo: ArrangementClip = {
      id: 'video-1',
      trackId: 'video',
      sourceId: 'clip-video',
      start: 2,
      sourceOffset: 0,
      duration: 4,
      fadeIn: 1,
    };
    const { view } = await mountDialog({
      arrangement: rangeArrangement([fadedVideo]),
      range: { start: 4, end: 9 },
    });
    const formatRadios = Array.from(
      view.baseElement.querySelectorAll<HTMLInputElement>(
        'input[name="arrangement-export-format"]',
      ),
    );
    expect(formatRadios.map((radio) => radio.disabled)).toEqual([false, false, false, true]);
    expect(formatRadios.map(radioLabelText)).toEqual([
      expect.stringContaining('WAV · 24-bit · 48 kHz · stereo'),
      `MP3 · 48 kHz · stereo${studioExportStrings.mp3FormatNote}`,
      `${studioExportStrings.bothOptionName}${studioExportStrings.bothFormatNote}`,
      `${studioExportStrings.videoOptionName}${VIDEO_RENDER_REASON}`,
    ]);
    expect(view.queryByText('მხოლოდ მონიშნული მონაკვეთი')).toBeNull();
    expect(view.getByTestId('arrangement-export-video-fades').textContent).toBe(VIDEO_FADES_NOTE);
    view.unmount();
    const plain = await mountDialog({ range: { start: 4, end: 9 } });
    expect(plain.view.queryByTestId('arrangement-export-video-fades')).toBeNull();
  });

  it('XU5 with a range both scope radios are enabled in DOM order and Tab still wraps at the ends', async () => {
    const { view } = await mountDialog({ range: { start: 4, end: 9 } });
    const modalClose = view.baseElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Close"]',
    );
    const content = modalClose?.parentElement;
    if (!modalClose || !content) {
      throw new Error('Modal content missing');
    }
    const tabbable = Array.from(
      content.querySelectorAll<HTMLElement>('button, input:not([type="hidden"])'),
    ).filter((element) => !element.matches(':disabled'));
    const wav = view.getByRole('button', { name: studioExportStrings.formatButtonWav });
    expect(tabbable).toEqual([
      modalClose,
      view.getByTestId('arrangement-export-format-wav'),
      view.getByTestId('arrangement-export-format-mp3'),
      view.getByTestId('arrangement-export-format-both'),
      scopeRadio(view, 'project'),
      scopeRadio(view, 'range'),
      view.getByRole('button', { name: studioExportStrings.closeButton }),
      wav,
    ]);
    wav.focus();
    const forward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    wav.dispatchEvent(forward);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalClose);
    const middle = scopeRadio(view, 'range');
    middle.focus();
    const inner = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    middle.dispatchEvent(inner);
    expect(inner.defaultPrevented).toBe(false);
  });
});
