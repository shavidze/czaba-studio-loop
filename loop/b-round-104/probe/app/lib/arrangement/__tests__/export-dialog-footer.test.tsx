import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ARRANGEMENT_EXPORT_FOOTER_FOCUS_MARGIN_PX,
  ArrangementExportDialog,
} from '~/components/arrangement/ArrangementExportDialog';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import {
  type ArrangementRenderOptions,
  type ArrangementWavResult,
  renderArrangementWav,
} from '~/lib/arrangement/graph.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

const renderWavMock = vi.mocked(renderArrangementWav);

const WAV_BUTTON = 'WAV-ის ექსპორტი';
const BUSY_BUTTON = 'მიმდინარეობს…';
const CLOSE_BUTTON = 'დახურვა';

const FROZEN_FOCUSABLE_SELECTOR = [
  'button:not([tabindex="-1"])',
  'input:not([type="hidden"]):not([tabindex="-1"])',
  'select:not([tabindex="-1"])',
  'textarea:not([tabindex="-1"])',
  'a[href]:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

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

const footerCollection: WorkspaceCollection = {
  id: 'footer',
  label: 'footer',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'footer', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function footerArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return {
    ...base,
    loop: { start: 0, end: 4, enabled: false },
    master: { gainDb: -3, mute: false },
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

function FooterDialogHost() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        open-export
      </button>
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

async function mountFooterDialog() {
  const view = render(
    <ArrangementProvider collection={footerCollection} initialArrangement={footerArrangement()}>
      <FooterDialogHost />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  fireEvent.click(view.getByRole('button', { name: 'open-export' }));
  const dialog = view.getByRole('dialog');
  return { view, dialog };
}

function dialogButton(dialog: HTMLElement, name: string): HTMLButtonElement {
  const button = Array.from(dialog.querySelectorAll('button')).find(
    (entry) => entry.textContent?.trim() === name,
  );
  if (!button) {
    throw new Error(`dialog button ${name} missing`);
  }
  return button;
}

function modalCloseButton(dialog: HTMLElement): HTMLButtonElement {
  const button = dialog.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
  if (!button) {
    throw new Error('Modal X missing');
  }
  return button;
}

function dialogPanel(dialog: HTMLElement): HTMLElement {
  const panel = modalCloseButton(dialog).parentElement;
  if (!panel) {
    throw new Error('Modal panel missing');
  }
  return panel;
}

function exportFooter(dialog: HTMLElement): HTMLElement {
  const footer = dialog.querySelector<HTMLElement>('[data-testid="arrangement-export-footer"]');
  if (!footer) {
    throw new Error('export footer missing');
  }
  return footer;
}

function byTestId(dialog: HTMLElement, testId: string): HTMLElement {
  const element = dialog.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`${testId} missing`);
  }
  return element;
}

function focusTrapOf(dialog: HTMLElement): HTMLElement {
  const trap = dialogButton(dialog, CLOSE_BUTTON).closest<HTMLElement>('[tabindex="-1"]');
  if (!trap || !dialog.contains(trap)) {
    throw new Error('focus trap wrapper missing');
  }
  return trap;
}

function frozenFocusSequence(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FROZEN_FOCUSABLE_SELECTOR)).filter(
    (element) => !element.matches(':disabled') && element.closest('[hidden]') === null,
  );
}

function isBefore(first: Element, second: Element): boolean {
  return (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

function mockBottom(element: HTMLElement, top: number, bottom: number) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, top, 600, bottom - top),
  );
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
}

function controlledRender(): { current: RenderControl | null } {
  const control: { current: RenderControl | null } = { current: null };
  renderWavMock.mockImplementation(
    (_arrangement, _buffers, _window, options) =>
      new Promise<ArrangementWavResult>((resolve) => {
        control.current = { options, finish: resolve };
      }),
  );
  return control;
}

async function startControlledRender(dialog: HTMLElement) {
  const control = controlledRender();
  await act(async () => {
    fireEvent.click(dialogButton(dialog, WAV_BUTTON));
    await Promise.resolve();
  });
  for (let i = 0; i < 50 && control.current === null; i++) {
    await flushAsync(1);
  }
  const onProgress = control.current?.options?.onProgress;
  if (!control.current || !onProgress) {
    throw new Error('renderer was not called with onProgress');
  }
  act(() => onProgress('render', 0.5));
  return control.current;
}

describe('R87-PROGRESS-BELOW-FOLD-1280 export dialog sticky footer (D-29z53) — jsdom has no layout: structure, order and focus-guard arithmetic only; visibility is C browser evidence', () => {
  const downloads: string[] = [];

  beforeEach(() => {
    downloads.length = 0;
    renderWavMock.mockReset();
    renderWavMock.mockResolvedValue({
      blob: new Blob(['rendered-wav']),
      peak: 0.5,
      clippedSamples: 0,
    });
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
      value: () => 'blob:footer-test',
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

  it('FT1 idle: the footer is sticky, opaque, holds Close and Export only, and is the last child of ModalBody', async () => {
    const { dialog } = await mountFooterDialog();
    const footer = exportFooter(dialog);
    const classes = footer.className.split(/\s+/);
    expect(classes).toEqual(expect.arrayContaining(['sticky', 'bottom-0', 'bg-surface']));
    expect(footer.contains(dialogButton(dialog, CLOSE_BUTTON))).toBe(true);
    expect(footer.contains(dialogButton(dialog, WAV_BUTTON))).toBe(true);
    const formatFieldset = byTestId(dialog, 'arrangement-export-format-wav').closest('fieldset');
    const scopeFieldset = byTestId(dialog, 'arrangement-export-scope');
    const loopNote = byTestId(dialog, 'arrangement-export-loop-note');
    const gainNote = byTestId(dialog, 'arrangement-export-master-gain');
    expect(formatFieldset).not.toBeNull();
    for (const element of [formatFieldset, scopeFieldset, loopNote, gainNote]) {
      expect(element && footer.contains(element)).toBe(false);
    }
    const body = footer.parentElement;
    expect(body?.contains(scopeFieldset)).toBe(true);
    expect(body?.lastElementChild).toBe(footer);
    expect(isBefore(gainNote, footer)).toBe(true);
  });

  it('FT2 during a render the status, label and bar sit in the footer in order status → label → bar → buttons; after done the message and overload warning stay in the footer before the buttons', async () => {
    const { dialog } = await mountFooterDialog();
    const control = await startControlledRender(dialog);
    const footer = exportFooter(dialog);
    const status = footer.querySelector('[role="status"]');
    const label = byTestId(dialog, 'arrangement-export-progress-label');
    const bar = byTestId(dialog, 'arrangement-export-progress');
    const busy = dialogButton(dialog, BUSY_BUTTON);
    const buttonRow = busy.parentElement;
    expect(status).not.toBeNull();
    expect(buttonRow).not.toBeNull();
    for (const element of [status, label, bar, buttonRow]) {
      expect(element && footer.contains(element)).toBe(true);
    }
    if (!status || !buttonRow) {
      throw new Error('status or button row missing');
    }
    expect(isBefore(status, label)).toBe(true);
    expect(isBefore(label, bar)).toBe(true);
    expect(isBefore(bar, buttonRow)).toBe(true);
    expect(buttonRow.parentElement).toBe(footer);

    await act(async () => {
      control.finish({ blob: new Blob(['loud']), peak: 1.5, clippedSamples: 120 });
      await Promise.resolve();
    });
    await flushAsync();
    const doneFooter = exportFooter(dialog);
    const done = doneFooter.querySelector('[role="status"]');
    const overload = byTestId(dialog, 'arrangement-export-overload');
    const doneRow = dialogButton(dialog, CLOSE_BUTTON).parentElement;
    expect(done?.textContent).toMatch(/^WAV შეიქმნა/);
    expect(doneFooter.contains(overload)).toBe(true);
    expect(dialog.querySelector('[data-testid="arrangement-export-progress"]')).toBeNull();
    if (!done || !doneRow) {
      throw new Error('done message or button row missing');
    }
    expect(isBefore(done, overload)).toBe(true);
    expect(isBefore(overload, doneRow)).toBe(true);
    expect(downloads).toEqual(['czaba-studio-lab.wav']);
  });

  it('FT3 the Tab sequence is unchanged (X → format radios → enabled scope radios → Close → Export) and the footer is not focusable', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    expect(frozenFocusSequence(panel)).toEqual([
      modalCloseButton(dialog),
      byTestId(dialog, 'arrangement-export-format-wav'),
      byTestId(dialog, 'arrangement-export-format-mp3'),
      byTestId(dialog, 'arrangement-export-format-both'),
      byTestId(dialog, 'arrangement-export-scope-project'),
      dialogButton(dialog, CLOSE_BUTTON),
      dialogButton(dialog, WAV_BUTTON),
    ]);
    expect(
      Array.from(panel.querySelectorAll('[tabindex]')).filter(
        (element) => Number(element.getAttribute('tabindex')) > 0,
      ),
    ).toEqual([]);
    expect(footer.hasAttribute('tabindex')).toBe(false);
    expect(footer.hasAttribute('role')).toBe(false);
    expect(footer.getAttributeNames().filter((name) => name.startsWith('aria-'))).toEqual([]);
  });

  it('FT4 a focused control covered by the footer scrolls the panel by overlap + margin', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const radio = byTestId(dialog, 'arrangement-export-scope-project');
    expect(panel.scrollTop).toBe(0);
    mockBottom(footer, 560, 680);
    mockBottom(radio, 584, 600);
    act(() => radio.focus());
    expect(document.activeElement).toBe(radio);
    expect(ARRANGEMENT_EXPORT_FOOTER_FOCUS_MARGIN_PX).toBe(8);
    expect(panel.scrollTop).toBe(0 + 40 + 8);
  });

  it('FT4 a control fully above the footer, and a control inside the footer, never scroll the panel', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const radio = byTestId(dialog, 'arrangement-export-format-mp3');
    const close = dialogButton(dialog, CLOSE_BUTTON);
    const exportButton = dialogButton(dialog, WAV_BUTTON);
    mockBottom(footer, 560, 680);
    mockBottom(radio, 300, 316);
    mockBottom(close, 620, 660);
    mockBottom(exportButton, 620, 660);
    act(() => radio.focus());
    expect(panel.scrollTop).toBe(0);
    act(() => exportButton.focus());
    expect(panel.scrollTop).toBe(0);
    act(() => close.focus());
    expect(document.activeElement).toBe(close);
    expect(panel.scrollTop).toBe(0);
  });

  it('FT4 focusing the focus-trap wrapper (it contains the footer) never scrolls the panel, directly or through a real render start', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const trap = focusTrapOf(dialog);
    expect(trap.contains(footer)).toBe(true);
    mockBottom(footer, 560, 680);
    mockBottom(trap, 40, 900);
    act(() => trap.focus());
    expect(document.activeElement).toBe(trap);
    expect(panel.scrollTop).toBe(0);
    act(() => dialogButton(dialog, CLOSE_BUTTON).focus());
    expect(document.activeElement).toBe(dialogButton(dialog, CLOSE_BUTTON));
    await startControlledRender(dialog);
    expect(dialogButton(dialog, CLOSE_BUTTON).disabled).toBe(true);
    expect(document.activeElement).toBe(trap);
    expect(panel.scrollTop).toBe(0);
  });

  it('FT4 after the dialog unmounts, the focusin listener is removed and a focusin on the old panel does nothing and throws nothing', async () => {
    const addListener = vi.spyOn(EventTarget.prototype, 'addEventListener');
    const { view, dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const radio = byTestId(dialog, 'arrangement-export-scope-project');
    const focusinHandlers = addListener.mock.calls.flatMap(([type, handler], index) =>
      type === 'focusin' && addListener.mock.contexts[index] === panel ? [handler] : [],
    );
    expect(focusinHandlers).toHaveLength(1);
    const removeListener = vi.spyOn(panel, 'removeEventListener');
    mockBottom(footer, 560, 680);
    mockBottom(radio, 584, 600);
    fireEvent.click(dialogButton(dialog, CLOSE_BUTTON));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(panel.isConnected).toBe(false);
    expect(removeListener).toHaveBeenCalledWith('focusin', focusinHandlers[0]);
    expect(() => radio.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))).not.toThrow();
    expect(panel.scrollTop).toBe(0);
  });

  it('FS1 strip lock (className only — jsdom has no layout; the 0 px gap is C browser evidence STRIP-1280/STRIP-1440): ModalBody drops its bottom padding and the footer owns py-4', async () => {
    const { dialog } = await mountFooterDialog();
    const footer = exportFooter(dialog);
    const body = footer.parentElement;
    if (!body) {
      throw new Error('ModalBody missing');
    }
    const bodyClasses = body.className.split(/\s+/);
    expect(bodyClasses).toEqual(expect.arrayContaining(['pb-0', 'space-y-4']));
    expect(body.lastElementChild).toBe(footer);
    const footerClasses = footer.className.split(/\s+/);
    expect(footerClasses).toEqual(
      expect.arrayContaining(['py-4', 'px-8', '-mx-8', 'sticky', 'bottom-0', 'bg-surface']),
    );
    expect(footerClasses.filter((token) => token === 'pt-4' || token === 'pb-4')).toEqual([]);
  });

  it('FV1 the progress bar aria-valuetext equals the visible progress label in the render and wav phases, and the bar is gone after done', async () => {
    const { dialog } = await mountFooterDialog();
    const control = await startControlledRender(dialog);
    const bar = byTestId(dialog, 'arrangement-export-progress');
    const label = byTestId(dialog, 'arrangement-export-progress-label');
    expect(bar.getAttribute('aria-valuetext')).toBe('რენდერი · 50%');
    expect(label.textContent).toBe('რენდერი · 50%');
    expect(bar.getAttribute('aria-label')).toBe('ექსპორტის პროგრესი');

    act(() => control.options?.onProgress?.('wav', 0.25));
    const wavBar = byTestId(dialog, 'arrangement-export-progress');
    const wavLabel = byTestId(dialog, 'arrangement-export-progress-label');
    expect(wavBar.getAttribute('aria-valuetext')).toBe('WAV-ის ჩაწერა · 25%');
    expect(wavLabel.textContent).toBe('WAV-ის ჩაწერა · 25%');
    expect(wavBar.getAttribute('aria-label')).toBe('ექსპორტის პროგრესი');

    await act(async () => {
      control.finish({ blob: new Blob(['wav']), peak: 0.5, clippedSamples: 0 });
      await Promise.resolve();
    });
    await flushAsync();
    expect(dialog.querySelector('[data-testid="arrangement-export-progress"]')).toBeNull();
  });

  it('FV2 lock: the progress bar has no aria-live and no role during a render (the status message announces phases)', async () => {
    const { dialog } = await mountFooterDialog();
    await startControlledRender(dialog);
    const bar = byTestId(dialog, 'arrangement-export-progress');
    expect(bar.hasAttribute('aria-live')).toBe(false);
    expect(bar.hasAttribute('role')).toBe(false);
  });

  it('FC1 the focus guard counts the option label card: card 11 px under the footer scrolls by 11 + 8 (guard arithmetic on mocked rects only — the pixel acceptance is C browser row CARD-1280)', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const radio = byTestId(dialog, 'arrangement-export-scope-project');
    const card = radio.closest<HTMLElement>('label');
    if (!card) {
      throw new Error('scope-project label card missing');
    }
    expect(panel.contains(card)).toBe(true);
    expect(panel.scrollTop).toBe(0);
    mockBottom(footer, 560, 680);
    mockBottom(radio, 530, 546);
    mockBottom(card, 517, 571);
    act(() => radio.focus());
    expect(document.activeElement).toBe(radio);
    expect(panel.scrollTop).toBe(19);
  });

  it('FC2 the focused control still counts when its label card is higher: radio 40 px under the footer scrolls by 40 + 8', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const radio = byTestId(dialog, 'arrangement-export-scope-project');
    const card = radio.closest<HTMLElement>('label');
    if (!card) {
      throw new Error('scope-project label card missing');
    }
    mockBottom(footer, 560, 680);
    mockBottom(radio, 584, 600);
    mockBottom(card, 300, 350);
    act(() => radio.focus());
    expect(document.activeElement).toBe(radio);
    expect(panel.scrollTop).toBe(48);
  });

  it('FC3 a label card fully above the footer never scrolls, and Close (no label, inside the footer) never scrolls', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const radio = byTestId(dialog, 'arrangement-export-scope-project');
    const card = radio.closest<HTMLElement>('label');
    const close = dialogButton(dialog, CLOSE_BUTTON);
    if (!card) {
      throw new Error('scope-project label card missing');
    }
    expect(close.closest('label')).toBeNull();
    mockBottom(footer, 560, 680);
    mockBottom(radio, 300, 316);
    mockBottom(card, 290, 330);
    mockBottom(close, 620, 660);
    act(() => radio.focus());
    expect(document.activeElement).toBe(radio);
    expect(panel.scrollTop).toBe(0);
    act(() => close.focus());
    expect(document.activeElement).toBe(close);
    expect(panel.scrollTop).toBe(0);
  });

  it('FC4 a body control without a label (the Modal X) is measured by its own rect: 12 px under the footer scrolls by 12 + 8', async () => {
    const { dialog } = await mountFooterDialog();
    const panel = dialogPanel(dialog);
    const footer = exportFooter(dialog);
    const closeX = modalCloseButton(dialog);
    expect(closeX.closest('label')).toBeNull();
    expect(footer.contains(closeX)).toBe(false);
    mockBottom(footer, 560, 680);
    mockBottom(closeX, 540, 572);
    act(() => closeX.focus());
    expect(document.activeElement).toBe(closeX);
    expect(panel.scrollTop).toBe(20);
  });

  it('FA1 the progress text is read once: the visible label is aria-hidden and the bar carries the same text as aria-valuetext with a stable name', async () => {
    const { dialog } = await mountFooterDialog();
    const control = await startControlledRender(dialog);
    const label = byTestId(dialog, 'arrangement-export-progress-label');
    const bar = byTestId(dialog, 'arrangement-export-progress');
    expect(label.getAttribute('aria-hidden')).toBe('true');
    expect(label.textContent).toBe('რენდერი · 50%');
    expect(bar.getAttribute('aria-valuetext')).toBe('რენდერი · 50%');
    expect(bar.getAttribute('aria-label')).toBe('ექსპორტის პროგრესი');

    act(() => control.options?.onProgress?.('wav', 0.25));
    const wavLabel = byTestId(dialog, 'arrangement-export-progress-label');
    const wavBar = byTestId(dialog, 'arrangement-export-progress');
    expect(wavLabel.getAttribute('aria-hidden')).toBe('true');
    expect(wavLabel.textContent).toBe('WAV-ის ჩაწერა · 25%');
    expect(wavBar.getAttribute('aria-valuetext')).toBe('WAV-ის ჩაწერა · 25%');
    expect(wavBar.getAttribute('aria-label')).toBe('ექსპორტის პროგრესი');
  });
});
