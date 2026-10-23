import { act, fireEvent, render } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import {
  ArrangementTransport,
  type ArrangementTransportNavigation,
} from '~/components/arrangement/ArrangementTransport';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
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

const toolbarCollection: WorkspaceCollection = {
  id: 'toolbar',
  label: 'toolbar',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'toolbar', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function toolbarArrangement(): Arrangement {
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

const navigation: ArrangementTransportNavigation = {
  followMode: 'off',
  canZoomBack: false,
  onToggleFollow: () => undefined,
  onZoomToRange: () => undefined,
  onZoomBack: () => undefined,
  onFit: () => undefined,
  onZoomSlider: () => undefined,
};

function ToolbarExportHarness({ onOpenExportSpy }: { onOpenExportSpy: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ArrangementTransport
        onOpenExport={() => {
          onOpenExportSpy();
          setIsOpen(true);
        }}
        navigation={navigation}
      />
      <ArrangementExportDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
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

async function mountToolbarExportHarness() {
  const onOpenExportSpy = vi.fn();
  const view = render(
    <ArrangementProvider collection={toolbarCollection} initialArrangement={toolbarArrangement()}>
      <ToolbarExportHarness onOpenExportSpy={onOpenExportSpy} />
    </ArrangementProvider>,
  );
  await settle();
  const exportButton = view.getByRole('button', { name: 'Export' });
  const closeAfterClick = () => {
    exportButton.focus();
    fireEvent.click(exportButton);
    const dialog = view.getByRole('dialog');
    const close = dialogButton(dialog, 'დახურვა');
    expect(document.activeElement).toBe(close);
    fireEvent.click(close);
  };
  return { view, exportButton, onOpenExportSpy, closeAfterClick };
}

describe('Toolbar Export ignores a held Enter after the dialog closes (GATE97-S1, D-29z63)', () => {
  const documentListeners: Array<(event: KeyboardEvent) => void> = [];

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
    for (const listener of documentListeners.splice(0)) {
      document.removeEventListener('keydown', listener);
    }
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('TH1: a repeated Enter on Export after closing from დახურვა is prevented and does not re-open the dialog', async () => {
    const { view, exportButton, onOpenExportSpy } = await mountToolbarExportHarness();
    exportButton.focus();
    fireEvent.click(exportButton);
    const dialog = view.getByRole('dialog');
    const close = dialogButton(dialog, 'დახურვა');
    expect(document.activeElement).toBe(close);
    expect(onOpenExportSpy).toHaveBeenCalledTimes(1);
    fireEvent.click(close);
    expect(view.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(exportButton);
    const notPrevented = fireEvent.keyDown(exportButton, { key: 'Enter', repeat: true });
    expect(notPrevented).toBe(false);
    expect(onOpenExportSpy).toHaveBeenCalledTimes(1);
    expect(view.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(exportButton);
  });

  it('TH2: a fresh Enter on Export is not prevented and a following click opens the dialog again (jsdom sends no click, so the click is explicit)', async () => {
    const { view, exportButton, onOpenExportSpy, closeAfterClick } =
      await mountToolbarExportHarness();
    closeAfterClick();
    expect(document.activeElement).toBe(exportButton);
    const notPrevented = fireEvent.keyDown(exportButton, { key: 'Enter', repeat: false });
    expect(notPrevented).toBe(true);
    fireEvent.click(exportButton);
    expect(view.queryAllByRole('dialog').length).toBe(1);
    expect(onOpenExportSpy).toHaveBeenCalledTimes(2);
  });

  it('TH3: repeated Space and repeated a on Export are not prevented', async () => {
    const { exportButton, closeAfterClick } = await mountToolbarExportHarness();
    closeAfterClick();
    expect(fireEvent.keyDown(exportButton, { key: ' ', repeat: true })).toBe(true);
    expect(fireEvent.keyDown(exportButton, { key: 'a', repeat: true })).toBe(true);
  });

  it('TH4: a bubble-phase document keydown listener still receives the repeated Enter on Export (no stopPropagation)', async () => {
    const { exportButton, closeAfterClick } = await mountToolbarExportHarness();
    closeAfterClick();
    const seen: Array<{ key: string; repeat: boolean }> = [];
    const listener = (event: KeyboardEvent) => {
      seen.push({ key: event.key, repeat: event.repeat });
    };
    documentListeners.push(listener);
    document.addEventListener('keydown', listener);
    fireEvent.keyDown(exportButton, { key: 'Enter', repeat: true });
    expect(seen.length).toBe(1);
    expect(seen[0]?.key).toBe('Enter');
    expect(seen[0]?.repeat).toBe(true);
  });

  it('TH5: a repeated Enter on the toolbar Fit button is not prevented', async () => {
    const { view } = await mountToolbarExportHarness();
    const fit = view.getByRole('button', { name: 'Fit' });
    expect(fireEvent.keyDown(fit, { key: 'Enter', repeat: true })).toBe(true);
  });
});
