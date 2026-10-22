import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const fakeClock = { base: 0 };

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
}

class FakeOfflineAudioContext {}

const offlineRender: { reject: ((error: Error) => void) | null } = { reject: null };

class ControlledOfflineAudioContext extends FakeAudioContext {
  startRendering() {
    return new Promise<AudioBuffer>((_resolve, reject) => {
      offlineRender.reject = reject;
    });
  }
}

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

const focusCollection: WorkspaceCollection = {
  id: 'focus',
  label: 'focus',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'focus', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function focusArrangement(withClips: boolean): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return {
    ...base,
    clips: withClips
      ? [
          {
            id: 'music-1',
            trackId: 'music',
            sourceId: 'song',
            start: 2,
            sourceOffset: 0,
            duration: 8,
          },
          {
            id: 'video-1',
            trackId: 'video',
            sourceId: 'film',
            start: 0,
            sourceOffset: 0,
            duration: 4,
          },
        ]
      : [],
  };
}

interface FocusApiRef {
  current: ArrangementContextValue | null;
}

function FocusProbe({ api }: { api: FocusApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: FocusApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountWorkspace(withClips = true) {
  const api: FocusApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={focusCollection}
      initialArrangement={focusArrangement(withClips)}
    >
      <StudioWorkspace />
      <FocusProbe api={api} />
    </ArrangementProvider>,
  );
  await settle();
  const exportButton = view.getByRole('button', { name: 'Export' });
  const openExport = () => {
    exportButton.focus();
    fireEvent.click(exportButton);
    return view.getByRole('dialog');
  };
  return { api, view, exportButton, openExport };
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

function enabledFormatRadio(dialog: HTMLElement): HTMLInputElement {
  const radio = dialog.querySelector<HTMLInputElement>('input[type=radio]:not(:disabled)');
  if (!radio) {
    throw new Error('enabled format radio missing');
  }
  return radio;
}

function modalCloseButton(dialog: HTMLElement): HTMLButtonElement {
  const button = dialog.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
  if (!button) {
    throw new Error('Modal X missing');
  }
  return button;
}

function focusTrapOf(dialog: HTMLElement): HTMLElement {
  const trap = dialogButton(dialog, 'დახურვა').closest<HTMLElement>('[tabindex="-1"]');
  if (!trap || !dialog.contains(trap)) {
    throw new Error('focus trap wrapper missing');
  }
  return trap;
}

function pressTab(target: HTMLElement, shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

describe('Export dialog focus (C-R13-03, D-29e, R14-U)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('moves focus to დახურვა inside the dialog when it opens', async () => {
    const { openExport } = await mountWorkspace();
    const dialog = openExport();
    expect(document.activeElement).toBe(dialogButton(dialog, 'დახურვა'));
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('wraps Tab from the last control to the first and Shift+Tab from the first to the last', async () => {
    const { openExport } = await mountWorkspace();
    const dialog = openExport();
    const radio = enabledFormatRadio(dialog);
    const close = dialogButton(dialog, 'დახურვა');
    const wav = dialogButton(dialog, 'WAV-ის ექსპორტი');
    expect(wav.disabled).toBe(false);
    const modalClose = modalCloseButton(dialog);
    const inner = pressTab(close);
    expect(inner.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(close);
    wav.focus();
    const forward = pressTab(wav);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalClose);
    const backward = pressTab(modalClose, true);
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(wav);
    const innerBack = pressTab(wav, true);
    expect(innerBack.defaultPrevented).toBe(false);
    radio.focus();
    const radioBack = pressTab(radio, true);
    expect(radioBack.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(radio);
  });

  it('skips disabled controls when it wraps (empty project: WAV disabled)', async () => {
    const { openExport } = await mountWorkspace(false);
    const dialog = openExport();
    const radio = enabledFormatRadio(dialog);
    const close = dialogButton(dialog, 'დახურვა');
    expect(dialogButton(dialog, 'WAV-ის ექსპორტი').disabled).toBe(true);
    const modalClose = modalCloseButton(dialog);
    const forward = pressTab(close);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalClose);
    const backward = pressTab(modalClose, true);
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
    radio.focus();
    const radioBack = pressTab(radio, true);
    expect(radioBack.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(radio);
  });

  it('ignores every key except Tab and never stops propagation (Esc still reaches the Modal)', async () => {
    const { view, openExport } = await mountWorkspace();
    const dialog = openExport();
    const close = dialogButton(dialog, 'დახურვა');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    act(() => {
      close.dispatchEvent(enter);
    });
    expect(enter.defaultPrevented).toBe(false);
    expect(view.getByRole('dialog')).toBeTruthy();
    act(() => {
      close.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(view.queryByRole('dialog')).toBeNull();
  });

  it('restores focus to the remembered opener when the dialog closes', async () => {
    const { view, exportButton, openExport } = await mountWorkspace();
    const dialog = openExport();
    fireEvent.click(dialogButton(dialog, 'დახურვა'));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(exportButton);
  });

  it('does not focus an opener that was removed while the dialog was open', async () => {
    const api: FocusApiRef = { current: null };
    let removeOpener: () => void = () => undefined;
    function OpenerHarness() {
      const [isOpen, setIsOpen] = useState(false);
      const [hasOpener, setHasOpener] = useState(true);
      removeOpener = () => setHasOpener(false);
      return (
        <>
          {hasOpener ? (
            <button type="button" data-testid="opener" onClick={() => setIsOpen(true)}>
              გახსნა
            </button>
          ) : null}
          <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    }
    const view = render(
      <ArrangementProvider collection={focusCollection} initialArrangement={focusArrangement(true)}>
        <OpenerHarness />
        <FocusProbe api={api} />
      </ArrangementProvider>,
    );
    await settle();
    const opener = view.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);
    const dialog = view.getByRole('dialog');
    expect(document.activeElement).toBe(dialogButton(dialog, 'დახურვა'));
    const openerFocus = vi.spyOn(opener, 'focus');
    act(() => removeOpener());
    expect(opener.isConnected).toBe(false);
    fireEvent.click(dialogButton(dialog, 'დახურვა'));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(openerFocus).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(opener);
    expect(live(api).exportState.phase).toBe('idle');
  });

  it('does not swallow Enter on დახურვა, and its activation closes without starting an export', async () => {
    const { api, view, openExport } = await mountWorkspace();
    const dialog = openExport();
    const close = dialogButton(dialog, 'დახურვა');
    expect(document.activeElement).toBe(close);
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    act(() => {
      close.dispatchEvent(enter);
    });
    expect(enter.defaultPrevented).toBe(false);
    fireEvent.click(close);
    expect(view.queryByRole('dialog')).toBeNull();
    expect(live(api).exportState.phase).toBe('idle');
    expect(live(api).exportState.message).toBeFalsy();
  });

  it('keeps Space on a dialog button away from the transport', async () => {
    const { api, view, openExport } = await mountWorkspace();
    const dialog = openExport();
    const close = dialogButton(dialog, 'დახურვა');
    const positionBefore = view.getByTestId('arrangement-position').textContent;
    act(() => {
      close.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true }),
      );
    });
    expect(live(api).isPlaying).toBe(false);
    expect(view.getByTestId('arrangement-position').textContent).toBe(positionBefore);
    expect(view.getByRole('dialog')).toBeTruthy();
  });

  it('returns focus to ✕ of the expanded video after Esc closes Export, and keeps the video expanded', async () => {
    const { view } = await mountWorkspace();
    fireEvent.click(view.getByTestId('arrangement-video-expand'));
    const box = view.getByTestId('arrangement-video-box');
    expect(box.dataset.videoExpanded).toBe('true');
    const videoClose = view.getByTestId('arrangement-video-close');
    videoClose.focus();
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    const dialog = view.getByRole('dialog');
    expect(document.activeElement).toBe(dialogButton(dialog, 'დახურვა'));
    act(() => {
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(view.queryByRole('dialog')).toBeNull();
    expect(box.dataset.videoExpanded).toBe('true');
    expect(document.activeElement).toBe(videoClose);
  });

  it('keeps focus inside the dialog while a WAV render disables its buttons, then returns it to დახურვა', async () => {
    offlineRender.reject = null;
    vi.stubGlobal('OfflineAudioContext', ControlledOfflineAudioContext);
    const { api, openExport } = await mountWorkspace();
    const dialog = openExport();
    const trap = focusTrapOf(dialog);
    const close = dialogButton(dialog, 'დახურვა');
    const wav = dialogButton(dialog, 'WAV-ის ექსპორტი');
    wav.focus();
    await act(async () => {
      fireEvent.click(wav);
      await Promise.resolve();
    });
    expect(live(api).exportState.phase).toBe('rendering');
    expect(close.disabled).toBe(true);
    expect(wav.disabled).toBe(true);
    expect(document.activeElement).toBe(trap);
    const tab = pressTab(trap);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalCloseButton(dialog));
    trap.focus();
    await act(async () => {
      offlineRender.reject?.(new Error('render stopped by the test'));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(live(api).exportState.phase).toBe('error');
    expect(document.activeElement).toBe(close);
  });

  it('leaves focus on an enabled control while a render starts and ends', async () => {
    offlineRender.reject = null;
    vi.stubGlobal('OfflineAudioContext', ControlledOfflineAudioContext);
    const { api, openExport } = await mountWorkspace();
    const dialog = openExport();
    const radio = enabledFormatRadio(dialog);
    radio.focus();
    await act(async () => {
      fireEvent.click(dialogButton(dialog, 'WAV-ის ექსპორტი'));
      await Promise.resolve();
    });
    expect(live(api).exportState.phase).toBe('rendering');
    expect(document.activeElement).toBe(radio);
    await act(async () => {
      offlineRender.reject?.(new Error('render stopped by the test'));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(live(api).exportState.phase).toBe('error');
    expect(document.activeElement).toBe(radio);
  });

  it('sends Tab to the first control and Shift+Tab to the last when focus sits on the dialog itself', async () => {
    const { openExport } = await mountWorkspace();
    const dialog = openExport();
    const trap = focusTrapOf(dialog);
    trap.focus();
    const forward = pressTab(trap);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalCloseButton(dialog));
    trap.focus();
    const backward = pressTab(trap, true);
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(dialogButton(dialog, 'WAV-ის ექსპორტი'));
  });

  it('does not focus an opener that became disabled while the dialog was open', async () => {
    let disableOpener: () => void = () => undefined;
    function DisabledOpenerHarness() {
      const [isOpen, setIsOpen] = useState(false);
      const [isOpenerDisabled, setIsOpenerDisabled] = useState(false);
      disableOpener = () => setIsOpenerDisabled(true);
      return (
        <>
          <button
            type="button"
            data-testid="opener"
            disabled={isOpenerDisabled}
            onClick={() => setIsOpen(true)}
          >
            გახსნა
          </button>
          <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      );
    }
    const view = render(
      <ArrangementProvider collection={focusCollection} initialArrangement={focusArrangement(true)}>
        <DisabledOpenerHarness />
      </ArrangementProvider>,
    );
    await settle();
    const opener = view.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);
    const dialog = view.getByRole('dialog');
    const openerFocus = vi.spyOn(opener, 'focus');
    act(() => disableOpener());
    fireEvent.click(dialogButton(dialog, 'დახურვა'));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(openerFocus).not.toHaveBeenCalled();
  });

  it('keeps X → radio → დახურვა → WAV-ის ექსპორტი in DOM order and intercepts Tab only at the ends (C-R14-02)', async () => {
    const { openExport } = await mountWorkspace();
    const dialog = openExport();
    const modalClose = modalCloseButton(dialog);
    const content = modalClose.parentElement;
    if (!content) {
      throw new Error('Modal content missing');
    }
    const cycle = [
      modalClose,
      enabledFormatRadio(dialog),
      dialogButton(dialog, 'დახურვა'),
      dialogButton(dialog, 'WAV-ის ექსპორტი'),
    ];
    const tabbable = Array.from(
      content.querySelectorAll<HTMLElement>('button, input:not([type="hidden"])'),
    ).filter((element) => !element.matches(':disabled'));
    expect(tabbable).toHaveLength(cycle.length);
    tabbable.forEach((element, index) => {
      expect(element).toBe(cycle[index]);
    });
    cycle.forEach((control, index) => {
      control.focus();
      const forward = pressTab(control);
      const isLast = index === cycle.length - 1;
      expect(forward.defaultPrevented).toBe(isLast);
      expect(document.activeElement).toBe(isLast ? cycle[0] : control);
      control.focus();
      const backward = pressTab(control, true);
      const isFirst = index === 0;
      expect(backward.defaultPrevented).toBe(isFirst);
      expect(document.activeElement).toBe(isFirst ? cycle[cycle.length - 1] : control);
    });
  });

  it('keeps Shift+Tab from the X inside the dialog (the exact C-R14-02 repro)', async () => {
    const { api, view, openExport } = await mountWorkspace();
    const dialog = openExport();
    const modalClose = modalCloseButton(dialog);
    const wav = dialogButton(dialog, 'WAV-ის ექსპორტი');
    modalClose.focus();
    const back = pressTab(modalClose, true);
    expect(back.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(wav);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(view.getByRole('dialog')).toBeTruthy();
    expect(live(api).exportState.phase).toBe('idle');
  });

  it('does not steal focus from the X while a render starts and ends', async () => {
    offlineRender.reject = null;
    vi.stubGlobal('OfflineAudioContext', ControlledOfflineAudioContext);
    const { api, openExport } = await mountWorkspace();
    const dialog = openExport();
    const modalClose = modalCloseButton(dialog);
    modalClose.focus();
    await act(async () => {
      fireEvent.click(dialogButton(dialog, 'WAV-ის ექსპორტი'));
      await Promise.resolve();
    });
    expect(live(api).exportState.phase).toBe('rendering');
    expect(modalClose.disabled).toBe(false);
    expect(document.activeElement).toBe(modalClose);
    await act(async () => {
      offlineRender.reject?.(new Error('render stopped by the test'));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(live(api).exportState.phase).toBe('error');
    expect(document.activeElement).toBe(modalClose);
  });

  it('handles only Tab on the X: Enter is not prevented and Esc still closes the Modal', async () => {
    const { view, openExport } = await mountWorkspace();
    const dialog = openExport();
    const modalClose = modalCloseButton(dialog);
    modalClose.focus();
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    const enterSeenByDocument = vi.fn();
    document.addEventListener('keydown', enterSeenByDocument);
    try {
      act(() => {
        modalClose.dispatchEvent(enter);
      });
    } finally {
      document.removeEventListener('keydown', enterSeenByDocument);
    }
    expect(enter.defaultPrevented).toBe(false);
    expect(enterSeenByDocument).toHaveBeenCalledTimes(1);
    expect(view.getByRole('dialog')).toBeTruthy();
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    act(() => {
      modalClose.dispatchEvent(escape);
    });
    expect(escape.defaultPrevented).toBe(false);
    expect(view.queryByRole('dialog')).toBeNull();
  });

  it('removes the Tab listener from the Modal content when the dialog closes', async () => {
    const { view, exportButton, openExport } = await mountWorkspace();
    const dialog = openExport();
    const modalClose = modalCloseButton(dialog);
    const content = modalClose.parentElement;
    if (!content) {
      throw new Error('Modal content missing');
    }
    const radio = enabledFormatRadio(dialog);
    fireEvent.click(dialogButton(dialog, 'დახურვა'));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(content.isConnected).toBe(false);
    expect(document.activeElement).toBe(exportButton);
    const forward = pressTab(radio);
    const backward = pressTab(modalClose, true);
    expect(forward.defaultPrevented).toBe(false);
    expect(backward.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(exportButton);
  });

  it('leaves Enter and Space alone on the last control and Enter on the first, so focus stays put (C-R15-03, D-29g)', async () => {
    const { view, openExport } = await mountWorkspace();
    const dialog = openExport();
    const wav = dialogButton(dialog, 'WAV-ის ექსპორტი');
    const modalClose = modalCloseButton(dialog);
    expect(wav.disabled).toBe(false);
    const pressKeyOn = (target: HTMLElement, key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      act(() => {
        target.dispatchEvent(event);
      });
      return event;
    };
    for (const key of ['Enter', ' ']) {
      wav.focus();
      const event = pressKeyOn(wav, key);
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(wav);
    }
    modalClose.focus();
    const enterOnFirst = pressKeyOn(modalClose, 'Enter');
    expect(enterOnFirst.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(modalClose);
    expect(view.getByRole('dialog')).toBeTruthy();
  });
});
