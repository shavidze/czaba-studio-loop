import { act, fireEvent, render, within } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import { type ArrangementWavResult, renderArrangementWav } from '~/lib/arrangement/graph.client';
import type { ArrangementMp3Encoder } from '~/lib/arrangement/mp3-encoder.client';
import { studioExportStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

const holdEnterEncoder = vi.hoisted(() => ({
  loadArrangementMp3Encoder: vi.fn<() => Promise<ArrangementMp3Encoder>>(),
  resetArrangementMp3Encoder: vi.fn<() => void>(),
}));

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

vi.mock('~/lib/arrangement/mp3-encoder.client', () => ({
  loadArrangementMp3Encoder: holdEnterEncoder.loadArrangementMp3Encoder,
  resetArrangementMp3Encoder: holdEnterEncoder.resetArrangementMp3Encoder,
}));

const renderWavMock = vi.mocked(renderArrangementWav);
const loadEncoderMock = holdEnterEncoder.loadArrangementMp3Encoder;
const encodeMock = vi.fn<ArrangementMp3Encoder['encode']>();

const WAV_BUTTON = studioExportStrings.formatButtonWav;
const MP3_BUTTON = studioExportStrings.formatButtonMp3;
const CANCELLED = studioExportStrings.exportCancelled;
const CANCELLED_ENC = studioExportStrings.exportCancelledEncoder;
const CLOSE_DISABLED_TOKEN = 'disabled:opacity-40';

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

const holdEnterCollection: WorkspaceCollection = {
  id: 'hold-enter',
  label: 'hold-enter',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'hold-enter', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function holdEnterArrangement(): Arrangement {
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

function HoldEnterHost({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open-export
      </button>
      <ArrangementExportDialog
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setIsOpen(false);
        }}
      />
    </>
  );
}

async function mountHoldEnterDialog() {
  const onClose = vi.fn<() => void>();
  const view = render(
    <ArrangementProvider
      collection={holdEnterCollection}
      initialArrangement={holdEnterArrangement()}
    >
      <HoldEnterHost onClose={onClose} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  fireEvent.click(view.getByRole('button', { name: 'open-export' }));
  return { onClose, view };
}

type HoldEnterView = ReturnType<typeof render>;

function closeButton(view: HoldEnterView): HTMLButtonElement {
  const element = view.getByRole('button', { name: studioExportStrings.closeButton });
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error('Close is not a button');
  }
  return element;
}

function cancelButton(view: HoldEnterView): HTMLButtonElement {
  const element = view.getByRole('button', { name: studioExportStrings.cancelButton });
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error('Cancel is not a button');
  }
  return element;
}

function statusText(view: HoldEnterView) {
  return (
    view.getByTestId('arrangement-export-footer').querySelector('[role="status"]')?.textContent ??
    null
  );
}

function progressLabel(view: HoldEnterView) {
  return view.queryByTestId('arrangement-export-progress-label')?.textContent ?? null;
}

function classTokens(element: HTMLElement) {
  return element.className.split(/\s+/).filter((token) => token.length > 0);
}

async function clickExport(view: HoldEnterView, name: string) {
  await act(async () => {
    fireEvent.click(view.getByRole('button', { name }));
    await Promise.resolve();
  });
}

async function clickCancel(view: HoldEnterView) {
  const cancel = cancelButton(view);
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

interface PendingRender {
  finish: (result: ArrangementWavResult) => void;
}

function pendingRenders(): PendingRender[] {
  const renders: PendingRender[] = [];
  renderWavMock.mockImplementation(
    () =>
      new Promise<ArrangementWavResult>((resolve) => {
        renders.push({ finish: resolve });
      }),
  );
  return renders;
}

const renderedBlob = new Blob(['rendered-wav']);
const downloads: string[] = [];
const URL_STUB_KEYS = ['createObjectURL', 'revokeObjectURL'];
const savedUrlDescriptors = new Map<string, PropertyDescriptor | undefined>();

function restoreUrlStubs() {
  for (const key of URL_STUB_KEYS) {
    const descriptor = savedUrlDescriptors.get(key);
    if (descriptor) {
      Object.defineProperty(URL, key, descriptor);
    } else {
      Reflect.deleteProperty(URL, key);
    }
  }
  savedUrlDescriptors.clear();
}

async function settleRenders(renders: PendingRender[]) {
  await act(async () => {
    for (const pending of renders) {
      pending.finish({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
    }
    await Promise.resolve();
  });
  await flushAsync(5);
}

async function cancelledWavDialog() {
  const renders = pendingRenders();
  const mounted = await mountHoldEnterDialog();
  await clickExport(mounted.view, WAV_BUTTON);
  expect(renders.length).toBe(1);
  await clickCancel(mounted.view);
  return { ...mounted, renders };
}

describe(
  'GATE90-S3/S4 export dialog Done ignores a held Enter (D-29z62)',
  { timeout: 15_000 },
  () => {
    beforeEach(() => {
      downloads.length = 0;
      renderWavMock.mockReset();
      renderWavMock.mockResolvedValue({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
      loadEncoderMock.mockReset();
      loadEncoderMock.mockResolvedValue({ encode: encodeMock });
      holdEnterEncoder.resetArrangementMp3Encoder.mockReset();
      encodeMock.mockReset();
      encodeMock.mockResolvedValue(new Blob(['encoded-mp3']));
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
      for (const key of URL_STUB_KEYS) {
        savedUrlDescriptors.set(key, Object.getOwnPropertyDescriptor(URL, key));
      }
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: () => 'blob:hold-enter-test',
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
      restoreUrlStubs();
    });

    it('HE1 a repeated Enter on Done after a render-phase WAV cancel is prevented: no close, the cancelled status stays and focus stays on Done', async () => {
      const { onClose, view, renders } = await cancelledWavDialog();
      const close = closeButton(view);
      expect(document.activeElement).toBe(close);
      expect(statusText(view)).toBe(CANCELLED);
      expect(fireEvent.keyDown(close, { key: 'Enter', repeat: true })).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(0);
      expect(statusText(view)).toBe(CANCELLED);
      expect(document.activeElement).toBe(close);
      expect(view.queryByRole('dialog')).not.toBeNull();
      await settleRenders(renders);
      expect(downloads.length).toBe(0);
    });

    it('HE2 a fresh Enter on Done is not prevented (jsdom sends no click), and an explicit click closes the dialog once', async () => {
      const { onClose, view, renders } = await cancelledWavDialog();
      const close = closeButton(view);
      expect(fireEvent.keyDown(close, { key: 'Enter', repeat: false })).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(0);
      fireEvent.click(close);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(view.queryByRole('dialog')).toBeNull();
      await settleRenders(renders);
    });

    it('HE3 only Enter is guarded: repeated Space and repeated "a" on Done are not prevented', async () => {
      const { onClose, view, renders } = await cancelledWavDialog();
      const close = closeButton(view);
      expect(fireEvent.keyDown(close, { key: ' ', repeat: true })).toBe(true);
      expect(fireEvent.keyDown(close, { key: 'a', repeat: true })).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(0);
      expect(statusText(view)).toBe(CANCELLED);
      await settleRenders(renders);
    });

    it('HE4 idle dialog: focus starts on Done, a repeated Enter is prevented and a fresh Enter is not', async () => {
      const { onClose, view } = await mountHoldEnterDialog();
      const close = closeButton(view);
      expect(document.activeElement).toBe(close);
      expect(fireEvent.keyDown(close, { key: 'Enter', repeat: true })).toBe(false);
      expect(fireEvent.keyDown(close, { key: 'Enter', repeat: false })).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(0);
      expect(document.activeElement).toBe(close);
    });

    it('HE5 classes: Cancel has no disabled attribute and no disabled: token; Done is disabled during the render with disabled:opacity-40 and enabled after Cancel', async () => {
      const renders = pendingRenders();
      const { view } = await mountHoldEnterDialog();
      await clickExport(view, WAV_BUTTON);
      const cancel = cancelButton(view);
      const close = closeButton(view);
      expect(cancel.hasAttribute('disabled')).toBe(false);
      expect(classTokens(cancel).filter((token) => token.startsWith('disabled:'))).toEqual([]);
      expect(close.disabled).toBe(true);
      expect(classTokens(close).includes(CLOSE_DISABLED_TOKEN)).toBe(true);
      await clickCancel(view);
      expect(closeButton(view).disabled).toBe(false);
      expect(classTokens(closeButton(view)).includes(CLOSE_DISABLED_TOKEN)).toBe(true);
      await settleRenders(renders);
    });

    it('HE6 the guard does not stop propagation: a document keydown listener still receives the repeated Enter on Done', async () => {
      const { view, renders } = await cancelledWavDialog();
      const close = closeButton(view);
      const received: { key: string; repeat: boolean }[] = [];
      const listener = (event: KeyboardEvent) => {
        received.push({ key: event.key, repeat: event.repeat });
      };
      document.addEventListener('keydown', listener);
      try {
        fireEvent.keyDown(close, { key: 'Enter', repeat: true });
      } finally {
        document.removeEventListener('keydown', listener);
      }
      expect(received).toEqual([{ key: 'Enter', repeat: true }]);
      await settleRenders(renders);
    });

    it('HE7 MP3 load-phase cancel: the encoder cancel text stays after a repeated Enter on Done and the dialog stays open', async () => {
      let finishLoad: (encoder: ArrangementMp3Encoder) => void = () => undefined;
      loadEncoderMock.mockImplementationOnce(
        () =>
          new Promise<ArrangementMp3Encoder>((resolve) => {
            finishLoad = resolve;
          }),
      );
      const { onClose, view } = await mountHoldEnterDialog();
      fireEvent.click(view.getByTestId('arrangement-export-format-mp3'));
      await clickExport(view, MP3_BUTTON);
      await flushAsync(5);
      expect(progressLabel(view)).toBe(studioExportStrings.progressEncoderLoad);
      await clickCancel(view);
      const close = closeButton(view);
      expect(statusText(view)).toBe(CANCELLED_ENC);
      expect(document.activeElement).toBe(close);
      expect(fireEvent.keyDown(close, { key: 'Enter', repeat: true })).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(0);
      expect(statusText(view)).toBe(CANCELLED_ENC);
      expect(view.queryByRole('dialog')).not.toBeNull();
      await act(async () => {
        finishLoad({ encode: encodeMock });
        await Promise.resolve();
      });
      await flushAsync();
      expect(encodeMock).toHaveBeenCalledTimes(0);
      expect(downloads.length).toBe(0);
    });

    it('HE8 every button in the Export dialog has a unique accessible name, idle and during a WAV render: Close is only the Modal ✕ and Done is only the footer button (C-R127-01)', async () => {
      const renders = pendingRenders();
      const { view } = await mountHoldEnterDialog();
      const expectUniqueButtonNames = (phase: string) => {
        const dialog = within(view.getByRole('dialog'));
        const modalClose = dialog.getAllByRole('button', { name: 'Close' });
        expect(modalClose.length, phase).toBe(1);
        expect(modalClose[0]?.getAttribute('aria-label'), phase).toBe('Close');
        const footerDone = dialog.getAllByRole('button', {
          name: studioExportStrings.closeButton,
        });
        expect(footerDone.length, phase).toBe(1);
        expect(footerDone[0], phase).toBe(closeButton(view));
        const names = dialog
          .getAllByRole('button')
          .map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '');
        expect(new Set(names).size, `${phase} button names: ${JSON.stringify(names)}`).toBe(
          names.length,
        );
        return { modalClose: modalClose[0], footerDone: footerDone[0] };
      };
      expectUniqueButtonNames('idle');
      await clickExport(view, WAV_BUTTON);
      expect(renders.length).toBe(1);
      const rendering = expectUniqueButtonNames('rendering');
      expect(cancelButton(view).disabled).toBe(false);
      expect(rendering.footerDone?.matches(':disabled')).toBe(true);
      expect(rendering.modalClose?.matches(':disabled')).toBe(false);
      await settleRenders(renders);
    });
  },
);

describe(
  'V-3c-4c-3 export dialog button surfaces and option card radius (D-29z136)',
  { timeout: 15_000 },
  () => {
    const MOTION_TOKENS = [
      'motion-safe:transition-[background-color,color]!',
      'motion-safe:duration-180!',
      'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!',
      'motion-reduce:transition-none!',
    ];
    const SURFACE_FILL_TOKENS = [
      'bg-foreground/5',
      'enabled:hover:bg-foreground/8',
      'enabled:active:bg-foreground/12',
    ];
    const SECONDARY_INCLUDES = [
      'border',
      'border-transparent',
      ...SURFACE_FILL_TOKENS,
      'rounded-md',
      'px-4',
      'py-2',
      'text-sm',
      'text-foreground',
      ...MOTION_TOKENS,
    ];
    const SECONDARY_EXCLUDES = [
      'border-outline',
      'hover:border-outline-hover',
      'rounded-sm',
      'focus-visible:ring-brand',
      'focus-visible:outline-none',
    ];
    const mountedViews: HoldEnterView[] = [];

    function expectSurfaceTokens(
      element: HTMLElement,
      label: string,
      includes: string[],
      excludes: string[],
    ) {
      const tokens = classTokens(element);
      for (const token of includes) {
        expect(tokens.includes(token), `${label} includes ${token}`).toBe(true);
      }
      for (const token of excludes) {
        expect(tokens.includes(token), `${label} excludes ${token}`).toBe(false);
      }
      return tokens;
    }

    async function mountSurfaceDialog() {
      const mounted = await mountHoldEnterDialog();
      mountedViews.push(mounted.view);
      return mounted;
    }

    function optionCardLabels(view: HoldEnterView): HTMLLabelElement[] {
      const radios = Array.from(
        view.getByRole('dialog').querySelectorAll<HTMLInputElement>('input[type="radio"]'),
      );
      return radios.map((radio, index) => {
        const label = radio.closest('label');
        if (!(label instanceof HTMLLabelElement)) {
          throw new Error(`radio ${index} has no card label`);
        }
        return label;
      });
    }

    beforeEach(() => {
      downloads.length = 0;
      renderWavMock.mockReset();
      renderWavMock.mockResolvedValue({ blob: renderedBlob, peak: 0.5, clippedSamples: 0 });
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
      for (const key of URL_STUB_KEYS) {
        savedUrlDescriptors.set(key, Object.getOwnPropertyDescriptor(URL, key));
      }
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: () => 'blob:surface-test',
      });
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: () => undefined,
      });
    });

    afterEach(() => {
      for (const view of mountedViews.splice(0)) {
        view.unmount();
      }
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
      restoreUrlStubs();
    });

    it('ESU1 Export takes the brand-outlined 5 % fill, Done and Cancel lose their outline, all with 8 px radius and the 180 ms motion tokens, idle and during a render', async () => {
      const renders = pendingRenders();
      const { view } = await mountSurfaceDialog();
      const exportButton = view.getByRole('button', { name: WAV_BUTTON });
      expectSurfaceTokens(
        exportButton,
        'Export idle',
        [
          'border',
          'border-brand',
          ...SURFACE_FILL_TOKENS,
          'text-brand',
          'font-medium',
          'rounded-md',
          'px-4',
          'py-2',
          'text-sm',
          ...MOTION_TOKENS,
          'disabled:cursor-not-allowed',
          'disabled:opacity-40',
        ],
        [
          'bg-brand',
          'text-brand-foreground',
          'border-transparent',
          'rounded-sm',
          'focus-visible:ring-brand',
          'focus-visible:outline-none',
        ],
      );
      expect(exportButton.hasAttribute('disabled')).toBe(false);
      const doneIdle = closeButton(view);
      expect(doneIdle.disabled).toBe(false);
      expectSurfaceTokens(
        doneIdle,
        'Done idle',
        [...SECONDARY_INCLUDES, CLOSE_DISABLED_TOKEN],
        SECONDARY_EXCLUDES,
      );
      expect(view.queryByRole('button', { name: studioExportStrings.cancelButton })).toBeNull();
      await clickExport(view, WAV_BUTTON);
      try {
        expect(renders.length).toBe(1);
        const doneRendering = closeButton(view);
        expect(doneRendering.disabled).toBe(true);
        expectSurfaceTokens(
          doneRendering,
          'Done rendering',
          [...SECONDARY_INCLUDES, CLOSE_DISABLED_TOKEN],
          SECONDARY_EXCLUDES,
        );
        const cancel = cancelButton(view);
        const cancelTokens = expectSurfaceTokens(
          cancel,
          'Cancel rendering',
          SECONDARY_INCLUDES,
          SECONDARY_EXCLUDES,
        );
        expect(cancelTokens.filter((token) => token.startsWith('disabled:'))).toEqual([]);
      } finally {
        await settleRenders(renders);
      }
    });

    it('ECR1 the six export option cards take the 8 px radius only and keep their selection borders and fills', async () => {
      const { view } = await mountSurfaceDialog();
      const cards = optionCardLabels(view);
      expect(cards).toHaveLength(6);
      for (const [index, card] of cards.entries()) {
        const cardTokens = expectSurfaceTokens(
          card,
          `card ${index}`,
          ['rounded-md', 'border', 'p-3'],
          ['rounded-sm', 'bg-foreground/5', 'border-transparent'],
        );
        expect(
          cardTokens.filter((token) => token.startsWith('motion-')),
          `card ${index} has no motion token`,
        ).toEqual([]);
      }
      const wavCard = view.getByTestId('arrangement-export-format-wav').closest('label');
      const mp3Card = view.getByTestId('arrangement-export-format-mp3').closest('label');
      if (!(wavCard instanceof HTMLLabelElement) || !(mp3Card instanceof HTMLLabelElement)) {
        throw new Error('format cards are missing');
      }
      expect(cards).toContain(wavCard);
      expect(cards).toContain(mp3Card);
      expectSurfaceTokens(wavCard, 'WAV card selected', ['border-brand', 'bg-brand/10'], []);
      expectSurfaceTokens(mp3Card, 'MP3 card unselected', ['border-outline'], ['bg-brand/10']);
      const videoRadios = Array.from(
        view
          .getByRole('dialog')
          .querySelectorAll<HTMLInputElement>(
            'input[type="radio"][name="arrangement-export-format"]:not([data-testid])',
          ),
      );
      expect(videoRadios).toHaveLength(1);
      expect(videoRadios[0]?.disabled).toBe(true);
      const videoCard = videoRadios[0]?.closest('label');
      if (!(videoCard instanceof HTMLLabelElement)) {
        throw new Error('video card is missing');
      }
      expectSurfaceTokens(videoCard, 'video card', ['border-outline', 'text-dim'], []);
    });
  },
);
