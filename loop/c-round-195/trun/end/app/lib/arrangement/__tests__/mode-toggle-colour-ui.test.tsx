import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

const modeToggleCollection: WorkspaceCollection = {
  id: 'mode-toggle-colour',
  label: 'mode-toggle-colour',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'mode-toggle-colour',
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function modeToggleArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'Video' },
      { id: 'music', kind: 'audio', name: 'Music' },
    ]),
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 8 },
    ],
  };
}

const MUSIC_RANGE = { start: 3, end: 5, trackId: 'music' };

interface ModeToggleApiRef {
  current: ArrangementContextValue | null;
}

function ModeToggleProbe({ api }: { api: ModeToggleApiRef }) {
  api.current = useArrangement();
  return null;
}

function liveModeToggle(api: ModeToggleApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountModeToggleWorkspace() {
  const api: ModeToggleApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={modeToggleCollection}
      initialArrangement={modeToggleArrangement()}
    >
      <StudioWorkspace />
      <ModeToggleProbe api={api} />
    </ArrangementProvider>,
  );
  for (let tick = 0; tick < 10 && !liveModeToggle(api).sourceDurations.has('song'); tick++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  const toolbar = view.getByRole('button', { name: 'Play' }).parentElement;
  if (!toolbar) {
    throw new Error('transport toolbar missing');
  }
  const toolbarButton = (label: string): HTMLButtonElement => {
    const match = Array.from(toolbar.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === label,
    );
    if (!match) {
      throw new Error(`transport button ${label} missing`);
    }
    return match;
  };
  return { api, view, toolbarButton };
}

type ModeToggleView = ReturnType<typeof render>;

const ON_TOKENS = [
  'border-foreground',
  'bg-foreground/20',
  'enabled:hover:bg-foreground/20',
  'enabled:active:bg-foreground/20',
];
const DROPPED_TOKENS = [
  'border-transparent',
  'bg-foreground/5',
  'enabled:hover:bg-foreground/8',
  'enabled:active:bg-foreground/12',
];

const APP_ROOT = resolve(__dirname, '../../..');
const TRANSPORT_PATH = 'components/arrangement/ArrangementTransport.tsx';
const TEMPO_ROW_PATH = 'components/arrangement/ArrangementTempoRow.tsx';
const WORKSPACE_PATH = 'components/arrangement/StudioWorkspace.tsx';
const LOOP_BRACE_PATH = 'components/arrangement/ArrangementLoopBrace.tsx';
const LIBRARY_PREVIEW_PATH = 'components/arrangement/ArrangementLibraryPreview.tsx';
const LIBRARY_PATH = 'components/arrangement/ArrangementLibrary.tsx';

function modeToggleTokens(element: Element | null | undefined, label: string): string[] {
  if (!element) {
    throw new Error(`${label} missing`);
  }
  return (element.getAttribute('class') ?? '').split(/\s+/).filter((token) => token.length > 0);
}

function brassModeTokens(tokens: string[]): string[] {
  return tokens.filter(
    (token) =>
      (token.includes('brand') || token.includes('accent')) && token !== 'focus-visible:ring-brand',
  );
}

function expectModeTokens(
  element: Element | null | undefined,
  label: string,
  expected: string[],
  excluded: string[],
) {
  const tokens = modeToggleTokens(element, label);
  for (const token of expected) {
    expect(tokens, `${label} has ${token}`).toContain(token);
  }
  for (const token of excluded) {
    expect(tokens, `${label} keeps ${token}`).not.toContain(token);
  }
  expect(brassModeTokens(tokens), `${label} brass`).toStrictEqual([]);
}

function byModeTestId(view: ModeToggleView, testId: string): HTMLElement {
  return view.getByTestId(testId);
}

function readModeSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function countModeOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function commitModeTempo(view: ModeToggleView, text: string) {
  const input = byModeTestId(view, 'arrangement-tempo-input');
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

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

describe('DUX-R-5b-2b mode toggles go neutral (D-29z142)', () => {
  it('DXT1: Loop on takes the neutral border and fill, and Loop off returns to the base fill', async () => {
    const { api, toolbarButton } = await mountModeToggleWorkspace();
    act(() => liveModeToggle(api).setTimeRange(MUSIC_RANGE));
    const loop = toolbarButton('Loop');
    fireEvent.click(loop);
    expect(liveModeToggle(api).arrangement.loop?.enabled).toBe(true);
    expect(loop.getAttribute('aria-pressed')).toBe('true');
    expectModeTokens(loop, 'Loop on', [...ON_TOKENS, 'text-foreground'], DROPPED_TOKENS);
    fireEvent.click(loop);
    expect(liveModeToggle(api).arrangement.loop?.enabled).toBe(false);
    expect(loop.getAttribute('aria-pressed')).toBe('false');
    expectModeTokens(
      loop,
      'Loop off',
      ['border-transparent', 'bg-foreground/5'],
      ['border-foreground', 'bg-foreground/20'],
    );
  });

  it('DXT2: Delete with a range takes the foreground border, without a range the transparent one', async () => {
    const { api, toolbarButton } = await mountModeToggleWorkspace();
    act(() => liveModeToggle(api).selectClip('music-1'));
    expect(liveModeToggle(api).range).toBeNull();
    const remove = toolbarButton('Delete');
    expect(remove.disabled).toBe(false);
    expectModeTokens(remove, 'Delete without range', ['border-transparent'], ['border-foreground']);
    act(() => liveModeToggle(api).setTimeRange(MUSIC_RANGE));
    expectModeTokens(
      toolbarButton('Delete'),
      'Delete with range',
      ['border-foreground'],
      ['border-transparent', 'text-accent'],
    );
  });

  it('DXT3: Follow is bordered and filled on at mount, plain when off and dashed when paused', async () => {
    const { api, view } = await mountModeToggleWorkspace();
    const follow = () => byModeTestId(view, 'arrangement-follow');
    expect(follow().dataset.followMode).toBe('on');
    expect(follow().getAttribute('aria-pressed')).toBe('true');
    expectModeTokens(follow(), 'Follow on', ON_TOKENS, [
      'border-dashed',
      'border-transparent',
      'bg-foreground/5',
    ]);
    fireEvent.click(follow());
    expect(follow().dataset.followMode).toBe('off');
    expect(follow().getAttribute('aria-pressed')).toBe('false');
    expectModeTokens(follow(), 'Follow off', ['border-transparent', 'bg-foreground/5'], ON_TOKENS);
    fireEvent.click(follow());
    expect(follow().dataset.followMode).toBe('on');
    act(() => liveModeToggle(api).togglePlayback());
    expect(liveModeToggle(api).isPlaying).toBe(true);
    const scroller = byModeTestId(view, 'arrangement-timeline-scroller');
    scroller.scrollLeft += 200;
    fireEvent.scroll(scroller);
    expect(follow().dataset.followMode).toBe('paused');
    expect(follow().getAttribute('aria-pressed')).toBe('false');
    expect(follow().textContent).toBe('Follow ‖');
    expectModeTokens(
      follow(),
      'Follow paused',
      ['border-dashed', 'border-foreground', 'bg-foreground/5'],
      ['bg-foreground/20', 'border-transparent'],
    );
    act(() => liveModeToggle(api).togglePlayback());
    expect(liveModeToggle(api).isPlaying).toBe(false);
  });

  it('DXT4: Snap, Env and Metronome on take the neutral border, fill and text', async () => {
    const { view } = await mountModeToggleWorkspace();
    commitModeTempo(view, '120');
    for (const testId of [
      'arrangement-snap-toggle',
      'arrangement-envelope-toggle',
      'arrangement-metronome-toggle',
    ]) {
      const toggle = byModeTestId(view, testId);
      expect(toggle.getAttribute('aria-pressed'), `${testId} starts off`).toBe('false');
      expectModeTokens(toggle, `${testId} off`, ['text-muted'], ['border-foreground']);
      fireEvent.click(toggle);
      expect(byModeTestId(view, testId).getAttribute('aria-pressed'), `${testId} on`).toBe('true');
      expectModeTokens(
        byModeTestId(view, testId),
        `${testId} on`,
        [...ON_TOKENS, 'text-foreground', 'hover:text-foreground'],
        [...DROPPED_TOKENS, 'text-muted', 'hover:text-accent'],
      );
    }
  });

  it('DXT5: Waveform Zoom away from 100 % takes the neutral border and fill, 100 % the outline', async () => {
    const { view } = await mountModeToggleWorkspace();
    const zoom = () => byModeTestId(view, 'arrangement-waveform-zoom');
    expectModeTokens(
      zoom(),
      'Zoom 100 %',
      ['border-outline', 'bg-surface'],
      ['border-foreground', 'bg-foreground/20'],
    );
    fireEvent.change(zoom(), { target: { value: '2' } });
    expect(byModeTestId(view, 'arrangement-grid-control').dataset.waveformZoom).toBe('2');
    expectModeTokens(
      zoom(),
      'Zoom 200 %',
      ['border-foreground', 'bg-foreground/20', 'text-foreground'],
      ['border-outline', 'bg-surface'],
    );
    fireEvent.change(zoom(), { target: { value: '1' } });
    expectModeTokens(
      zoom(),
      'Zoom back to 100 %',
      ['border-outline', 'bg-surface'],
      ['border-foreground', 'bg-foreground/20'],
    );
  });

  it('DXT6: the enabled Loop brace and its label are neutral, the disabled brace stays dashed muted', async () => {
    const { api, view, toolbarButton } = await mountModeToggleWorkspace();
    act(() => liveModeToggle(api).setTimeRange(MUSIC_RANGE));
    fireEvent.click(toolbarButton('Loop'));
    const brace = () => byModeTestId(view, 'arrangement-loop-brace');
    const braceLabel = () => brace().querySelector('span');
    expect(brace().dataset.loopEnabled).toBe('true');
    expectModeTokens(
      brace(),
      'enabled brace',
      ['border-foreground', 'bg-foreground/20'],
      ['border-dashed', 'border-muted', 'bg-transparent'],
    );
    expectModeTokens(braceLabel(), 'enabled brace label', ['text-foreground'], ['text-muted']);
    fireEvent.click(toolbarButton('Loop'));
    expect(brace().dataset.loopEnabled).toBe('false');
    expectModeTokens(
      brace(),
      'disabled brace',
      ['border-dashed', 'border-muted', 'bg-transparent'],
      ['border-foreground', 'bg-foreground/20'],
    );
    expectModeTokens(braceLabel(), 'disabled brace label', ['text-muted'], ['text-foreground']);
  });

  it('DXT7: the library Preview toggle and the previewing label are neutral', async () => {
    const { api, view } = await mountModeToggleWorkspace();
    const toggle = () => byModeTestId(view, 'arrangement-library-preview-toggle');
    const row = view.container.querySelector<HTMLElement>('[data-source-id="song"]');
    if (!row) {
      throw new Error('library row song missing');
    }
    fireEvent.click(row);
    expect(toggle().textContent).toBe('Preview');
    expectModeTokens(
      toggle(),
      'Preview idle',
      ['text-foreground', 'border-transparent'],
      ['text-brand', 'border-foreground'],
    );
    fireEvent.click(toggle());
    expect(liveModeToggle(api).libraryPreviewSourceId).toBe('song');
    expect(toggle().textContent).toBe('Stop');
    expectModeTokens(
      toggle(),
      'Preview previewing',
      ['border-foreground', 'text-foreground'],
      ['border-transparent'],
    );
    const previewingLabel = row.querySelector(
      '[data-testid="arrangement-library-option-previewing"]',
    );
    expectModeTokens(previewingLabel, 'previewing label', ['text-foreground'], ['text-brand']);
    fireEvent.click(toggle());
    expect(liveModeToggle(api).libraryPreviewSourceId).toBeNull();
  });

  it('DXT8: the source holds the neutral 5b-2b strings, no retired brass and the kept brass once', () => {
    const transport = readModeSource(TRANSPORT_PATH);
    const tempoRow = readModeSource(TEMPO_ROW_PATH);
    const workspace = readModeSource(WORKSPACE_PATH);
    const loopBrace = readModeSource(LOOP_BRACE_PATH);
    const libraryPreview = readModeSource(LIBRARY_PREVIEW_PATH);
    const library = readModeSource(LIBRARY_PATH);
    const sources: Record<string, string> = {
      [TRANSPORT_PATH]: transport,
      [TEMPO_ROW_PATH]: tempoRow,
      [WORKSPACE_PATH]: workspace,
      [LOOP_BRACE_PATH]: loopBrace,
      [LIBRARY_PREVIEW_PATH]: libraryPreview,
      [LIBRARY_PATH]: library,
    };
    const expectCount = (path: string, needle: string, count: number) => {
      expect(countModeOccurrences(sources[path], needle), `${needle} in ${path}`).toBe(count);
    };

    for (const path of [TRANSPORT_PATH, TEMPO_ROW_PATH, WORKSPACE_PATH]) {
      expectCount(path, "'border-accent bg-accent/20 text-accent", 0);
    }
    expectCount(LOOP_BRACE_PATH, "'border-accent bg-accent/20'", 0);
    expectCount(TRANSPORT_PATH, "'border-accent text-accent'", 0);
    expectCount(LIBRARY_PREVIEW_PATH, "'border-accent text-accent'", 0);
    expectCount(TRANSPORT_PATH, "&& 'text-brand'", 0);
    expectCount(LIBRARY_PREVIEW_PATH, ": 'text-brand'", 0);
    expectCount(LIBRARY_PATH, 'text-xs text-brand"', 0);
    expectCount(LOOP_BRACE_PATH, "? 'text-accent'", 0);

    const fullOn =
      "'border-foreground bg-foreground/20 text-foreground enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'";
    const transportOn =
      "'border-foreground bg-foreground/20 enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'";
    expectCount(WORKSPACE_PATH, fullOn, 2);
    expectCount(TEMPO_ROW_PATH, fullOn, 1);
    expectCount(TRANSPORT_PATH, transportOn, 2);
    expectCount(WORKSPACE_PATH, "'border-foreground bg-foreground/20'", 1);
    expectCount(LOOP_BRACE_PATH, "'border-foreground bg-foreground/20'", 1);
    expectCount(TRANSPORT_PATH, "'border-dashed border-foreground'", 1);
    expectCount(TRANSPORT_PATH, "range && 'border-foreground'", 1);
    expectCount(LIBRARY_PREVIEW_PATH, "'border-foreground text-foreground' : 'text-foreground'", 1);
    expectCount(LIBRARY_PATH, 'text-xs text-foreground"', 1);
    expectCount(LOOP_BRACE_PATH, "? 'text-foreground' : 'text-muted'", 1);

    expectCount(TRANSPORT_PATH, 'border-brand font-medium text-brand', 1);
    expectCount(WORKSPACE_PATH, 'border border-brand bg-brand/10', 1);
    expectCount(
      WORKSPACE_PATH,
      'rounded-sm border border-accent px-2 py-0.5 text-xs text-accent',
      0,
    );
    expectCount(LIBRARY_PREVIEW_PATH, 'fill-brand', 1);
    expectCount(LIBRARY_PATH, "'border-brand bg-brand/10 text-brand'", 1);
  });
});
