import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useLayoutEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioExportStrings } from '../strings';

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

const restoreCollection: WorkspaceCollection = {
  id: 'restore',
  label: 'restore',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'restore', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function restoreArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return {
    ...base,
    clips: [
      {
        id: 'music-1',
        trackId: 'music',
        sourceId: 'song',
        start: 2,
        sourceOffset: 0,
        duration: 8,
      },
    ],
  };
}

function FocusThief({ active, open }: { active: boolean; open: boolean }) {
  useLayoutEffect(() => {
    if (!active || !open) {
      return;
    }
    const decoy = document.querySelector<HTMLButtonElement>('[data-testid="decoy"]');
    decoy?.focus();
  }, [active, open]);
  return null;
}

function FocusRestoreHarness({ isThiefActive }: { isThiefActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" data-testid="opener" onClick={() => setIsOpen(true)}>
        opener
      </button>
      <button type="button" data-testid="decoy">
        decoy
      </button>
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <FocusThief active={isThiefActive} open={isOpen} />
    </>
  );
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountRestoreHarness(isThiefActive: boolean) {
  const view = render(
    <ArrangementProvider collection={restoreCollection} initialArrangement={restoreArrangement()}>
      <FocusRestoreHarness isThiefActive={isThiefActive} />
    </ArrangementProvider>,
  );
  await settle();
  const opener = view.getByTestId('opener');
  const decoy = view.getByTestId('decoy');
  const openExport = () => {
    opener.focus();
    fireEvent.click(opener);
    return view.getByRole('dialog');
  };
  return { view, opener, decoy, openExport };
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

function dialogContentOf(dialog: HTMLElement): HTMLElement {
  const content = modalCloseButton(dialog).parentElement;
  if (!content) {
    throw new Error('Modal content missing');
  }
  return content;
}

function hiddenWrapperWithButton(label: string): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.hidden = true;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  wrapper.appendChild(button);
  return wrapper;
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

describe('Export dialog focus restore and hidden Tab wrap (D-29z11, R46-U)', () => {
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

  it('FR1: restores focus to the opener after Close although a later layout effect focused a decoy during the opening commit', async () => {
    const { view, opener, openExport } = await mountRestoreHarness(true);
    const dialog = openExport();
    expect(document.activeElement).toBe(dialogButton(dialog, studioExportStrings.closeButton));
    fireEvent.click(dialogButton(dialog, studioExportStrings.closeButton));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('FR2: restores focus to the opener after Esc although a later layout effect focused a decoy during the opening commit', async () => {
    const { view, opener, openExport } = await mountRestoreHarness(true);
    const dialog = openExport();
    const content = dialogContentOf(dialog);
    act(() => {
      content.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(view.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('FR3: restores focus to the opener after Close when nothing else moves focus', async () => {
    const { view, opener, openExport } = await mountRestoreHarness(false);
    const dialog = openExport();
    fireEvent.click(dialogButton(dialog, studioExportStrings.closeButton));
    expect(view.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('FR4: still moves focus to Close inside the dialog after a later layout effect focused a decoy', async () => {
    const { decoy, openExport } = await mountRestoreHarness(true);
    const dialog = openExport();
    expect(document.activeElement).not.toBe(decoy);
    expect(document.activeElement).toBe(dialogButton(dialog, studioExportStrings.closeButton));
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('HD1: Tab from Export WAV wraps to ✕ when a control inside a hidden wrapper is the last element', async () => {
    const { openExport } = await mountRestoreHarness(false);
    const dialog = openExport();
    const content = dialogContentOf(dialog);
    content.appendChild(hiddenWrapperWithButton('hidden-last'));
    const wav = dialogButton(dialog, studioExportStrings.formatButtonWav);
    expect(wav.disabled).toBe(false);
    wav.focus();
    const forward = pressTab(wav);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalCloseButton(dialog));
  });

  it('HD2: Shift+Tab from ✕ wraps to Export WAV when a control inside a hidden wrapper is the first element', async () => {
    const { openExport } = await mountRestoreHarness(false);
    const dialog = openExport();
    const content = dialogContentOf(dialog);
    content.insertBefore(hiddenWrapperWithButton('hidden-first'), content.firstChild);
    const modalClose = modalCloseButton(dialog);
    modalClose.focus();
    const backward = pressTab(modalClose, true);
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(dialogButton(dialog, studioExportStrings.formatButtonWav));
  });

  it('HD3: Tab from Export WAV wraps to ✕ when the last element is a button with its own hidden attribute', async () => {
    const { openExport } = await mountRestoreHarness(false);
    const dialog = openExport();
    const content = dialogContentOf(dialog);
    const hiddenButton = document.createElement('button');
    hiddenButton.type = 'button';
    hiddenButton.hidden = true;
    hiddenButton.textContent = 'hidden-self';
    content.appendChild(hiddenButton);
    const wav = dialogButton(dialog, studioExportStrings.formatButtonWav);
    wav.focus();
    const forward = pressTab(wav);
    expect(forward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalCloseButton(dialog));
  });
});
