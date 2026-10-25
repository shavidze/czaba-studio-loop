import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { studioEditStrings, studioViewStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className} data-testid="arrangement-exit">
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

const transportCollection: WorkspaceCollection = {
  id: 'transport',
  label: 'transport',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'transport', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function transportArrangement(): Arrangement {
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

interface TransportApiRef {
  current: ArrangementContextValue | null;
}

function TransportProbe({ api }: { api: TransportApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: TransportApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

const TOKENS = (element: Element) => element.className.split(/\s+/);

const BASE_FILL = [
  'bg-foreground/5',
  'enabled:hover:bg-foreground/8',
  'enabled:active:bg-foreground/12',
];

async function mountTransport() {
  const api: TransportApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={transportCollection}
      initialArrangement={transportArrangement()}
    >
      <StudioWorkspace />
      <TransportProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const position = view.getByTestId('arrangement-position');
  const fit = view.getByTestId('arrangement-fit');
  let toolbar: HTMLElement | null = position.parentElement;
  while (toolbar && !(toolbar.classList.contains('flex-wrap') && toolbar.contains(fit))) {
    toolbar = toolbar.parentElement;
  }
  if (!toolbar) {
    throw new Error('transport toolbar not found');
  }
  const transport = toolbar;
  const buttons = () => Array.from(transport.querySelectorAll('button'));
  const byName = (name: string) => {
    const match = buttons().find(
      (button) => (button.getAttribute('aria-label') ?? button.textContent) === name,
    );
    if (!match) {
      throw new Error(`transport button ${name} not found`);
    }
    return match;
  };
  const byText = (text: string) => {
    const match = buttons().find((button) => button.textContent === text);
    if (!match) {
      throw new Error(`transport button with text ${text} not found`);
    }
    return match;
  };
  return { api, view, transport, buttons, byName, byText };
}

function ariaHiddenSvgCount(button: Element) {
  return button.querySelectorAll('svg[aria-hidden="true"]').length;
}

describe('V-3a transport surfaces and icons (D-29z123)', { timeout: 15_000 }, () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
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

  it('TS1 gives all 12 transport buttons the 8 px radius, colour motion and pressed fill, and the plain 10 the borderless foreground fill', async () => {
    const { buttons, byName } = await mountTransport();
    const all = buttons();
    expect(all).toHaveLength(12);
    for (const button of all) {
      const tokens = TOKENS(button);
      expect(tokens).toContain('rounded-md');
      for (const important of [
        'motion-safe:transition-[background-color,color]!',
        'motion-safe:duration-180!',
        'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!',
        'motion-reduce:transition-none!',
      ]) {
        expect(tokens).toContain(important);
      }
      for (const overridden of [
        'motion-safe:transition-[background-color,color]',
        'motion-safe:duration-180',
        'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]',
      ]) {
        expect(tokens).not.toContain(overridden);
      }
      expect(tokens.some((token) => token.startsWith('enabled:active:bg-'))).toBe(true);
      for (const kept of [
        'border',
        'focus-visible:ring-2',
        'focus-visible:ring-brand',
        'disabled:opacity-40',
      ]) {
        expect(tokens).toContain(kept);
      }
      expect(tokens.some((token) => token.startsWith('hover:'))).toBe(false);
      for (const removed of [
        'rounded-sm',
        'border-outline',
        'bg-elevated',
        'hover:border-outline-hover',
      ]) {
        expect(tokens).not.toContain(removed);
      }
    }
    const play = byName('Play');
    const exportButton = byName('Export');
    const plain = all.filter((button) => button !== play && button !== exportButton);
    expect(plain).toHaveLength(10);
    for (const button of plain) {
      const tokens = TOKENS(button);
      expect(tokens).toContain('border-transparent');
      for (const fill of BASE_FILL) {
        expect(tokens).toContain(fill);
      }
    }
  });

  it('TS2 fills Play with foreground in both states and draws the state as a lucide icon plus the label', async () => {
    const { view, byName } = await mountTransport();
    const expectPlaySurface = (button: HTMLElement, iconClass: string) => {
      const tokens = TOKENS(button);
      for (const present of [
        'w-24',
        'bg-foreground',
        'text-background',
        'enabled:hover:bg-foreground/92',
        'enabled:active:bg-foreground/88',
        'border-transparent',
      ]) {
        expect(tokens).toContain(present);
      }
      for (const absent of [
        'bg-foreground/5',
        'enabled:hover:bg-foreground/8',
        'border-brand',
        'text-brand',
        'border-accent',
      ]) {
        expect(tokens).not.toContain(absent);
      }
      expect(ariaHiddenSvgCount(button)).toBe(1);
      expect(button.querySelector('svg')?.classList.contains(iconClass)).toBe(true);
    };
    const play = byName('Play');
    expectPlaySurface(play, 'lucide-play');
    expect(play.textContent).toBe('Play');
    expect(play.textContent).not.toContain('▶');
    expect(view.getByRole('button', { name: 'Play' })).toBe(play);
    fireEvent.click(play);
    const pause = view.getByRole('button', { name: 'Pause' });
    expect(pause).toBe(play);
    expectPlaySurface(pause, 'lucide-pause');
    expect(pause.textContent).toBe('Pause');
    expect(pause.textContent).not.toContain('❚');
    fireEvent.click(pause);
    expect(view.getByRole('button', { name: 'Play' })).toBe(play);
  });

  it('TS3 shows Zoom to selection as one hidden lucide icon with its label unchanged', async () => {
    const { view } = await mountTransport();
    const zoomRange = view.getByTestId('arrangement-zoom-range');
    expect(ariaHiddenSvgCount(zoomRange)).toBe(1);
    expect(zoomRange.querySelectorAll('svg')).toHaveLength(1);
    expect(zoomRange.querySelector('svg')?.classList.contains('lucide-move-horizontal')).toBe(true);
    expect(zoomRange.textContent).toBe('');
    expect(zoomRange.textContent).not.toContain('⇔');
    expect(zoomRange.getAttribute('aria-label')).toBe(studioViewStrings.zoomToSelectionLabel);
  });

  it('TS4 outlines Export in brand instead of filling it', async () => {
    const { byName } = await mountTransport();
    const exportButton = byName('Export');
    const tokens = TOKENS(exportButton);
    for (const present of ['border-brand', 'text-brand', 'font-medium']) {
      expect(tokens).toContain(present);
    }
    for (const absent of ['bg-brand', 'text-brand-foreground', 'border-transparent']) {
      expect(tokens).not.toContain(absent);
    }
    expect(exportButton.textContent).toBe('Export');
  });

  it('TS5 keeps the Loop-on accent fill on hover and press, and the Delete range cue', async () => {
    const { api, byText } = await mountTransport();
    act(() => live(api).setTimeRange({ start: 3, end: 5, trackId: 'music' }));
    const loop = byText('↻ Loop');
    expect(loop.disabled).toBe(false);
    fireEvent.click(loop);
    expect(live(api).arrangement.loop?.enabled).toBe(true);
    expect(loop.getAttribute('aria-pressed')).toBe('true');
    const loopTokens = TOKENS(loop);
    for (const present of [
      'bg-accent/20',
      'enabled:hover:bg-accent/20',
      'enabled:active:bg-accent/20',
    ]) {
      expect(loopTokens).toContain(present);
    }
    expect(loopTokens).not.toContain('enabled:hover:bg-foreground/8');
    expect(loopTokens).not.toContain('bg-foreground/5');
    expect(live(api).range).not.toBeNull();
    const deleteTokens = TOKENS(byText(studioEditStrings.deleteButton));
    expect(deleteTokens).toContain('border-accent');
    expect(deleteTokens).toContain('text-accent');
  });

  it('TS6 leaves the nine other transport labels and glyphs to V-3b without an icon', async () => {
    const { byText } = await mountTransport();
    const untouched = [
      '↤',
      '↶Undo',
      '↷Redo',
      '✂ Split',
      studioEditStrings.deleteButton,
      '↻ Loop',
      '↩ Zoom',
      'Fit',
      'Follow',
    ];
    for (const text of untouched) {
      const button = byText(text);
      expect(button.textContent).toBe(text);
      expect(button.querySelector('svg')).toBeNull();
    }
  });
});
