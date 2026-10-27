import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { decodeVideoAudio, probeVideoFile } from '~/lib/arrangement/video.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

const APP_ROOT = resolve(__dirname, '../../..');
const APP_CSS_PATH = resolve(APP_ROOT, 'styles/app.css');
const OBSIDIAN_SELECTOR =
  '[data-studio-theme="obsidian"],\nbody:has([data-studio-theme="obsidian"]) {';
const PANEL_TOKEN_DECLARATION = '--radius-panel: 0.625rem;';

const EXPECTED_PANEL_CLASS_COUNTS: Record<string, number> = {
  'components/arrangement/ArrangementDetailPanel.tsx': 2,
  'components/arrangement/ArrangementVideoDock.tsx': 2,
  'components/arrangement/ArrangementGridMenu.tsx': 1,
  'components/arrangement/ArrangementMarkerMenu.tsx': 1,
  'components/arrangement/ArrangementOverview.tsx': 3,
};

const PANEL_SITE_CLASSES: { file: string; className: string }[] = [
  {
    file: 'components/arrangement/ArrangementDetailPanel.tsx',
    className:
      'relative min-h-0 min-w-32 flex-1 overflow-hidden rounded-panel border border-outline bg-background text-muted/70 contain-strict',
  },
  {
    file: 'components/arrangement/ArrangementDetailPanel.tsx',
    className:
      'flex min-w-32 flex-1 flex-col gap-0.5 rounded-panel border border-outline bg-background px-2 py-1',
  },
  {
    file: 'components/arrangement/ArrangementVideoDock.tsx',
    className:
      'flex aspect-video w-40 shrink-0 flex-col items-center justify-center gap-1 rounded-panel border border-dashed border-outline bg-background p-2 text-center text-xs text-muted',
  },
  {
    file: 'components/arrangement/ArrangementVideoDock.tsx',
    className: "'aspect-video shrink-0 overflow-hidden rounded-panel bg-background'",
  },
  {
    file: 'components/arrangement/ArrangementGridMenu.tsx',
    className: 'fixed z-50 min-w-36 rounded-panel border border-outline bg-surface p-1 shadow-lg',
  },
  {
    file: 'components/arrangement/ArrangementMarkerMenu.tsx',
    className: 'fixed z-50 min-w-40 rounded-panel border border-outline bg-surface p-1 shadow-lg',
  },
  {
    file: 'components/arrangement/ArrangementOverview.tsx',
    className:
      'relative h-16 w-full cursor-ew-resize touch-none overflow-hidden rounded-panel bg-background',
  },
  {
    file: 'components/arrangement/ArrangementOverview.tsx',
    className: 'pointer-events-none absolute inset-0 rounded-panel border border-outline',
  },
  {
    file: 'components/arrangement/ArrangementOverview.tsx',
    className:
      'pointer-events-none absolute inset-y-0 rounded-panel border border-foreground/70 bg-foreground/5',
  },
];

const OVERVIEW_PATH = 'components/arrangement/ArrangementOverview.tsx';
const OVERVIEW_CLIP_BAR_BASE = "'absolute inset-y-0 rounded-xs',";
const TRANSPORT_PATH = 'components/arrangement/ArrangementTransport.tsx';
const TRANSPORT_READOUT_CLASS =
  'flex items-baseline gap-2 rounded-md bg-background px-3 py-1 font-mono tabular-nums';
const LIBRARY_PREVIEW_PATH = 'components/arrangement/ArrangementLibraryPreview.tsx';
const LIBRARY_PREVIEW_WAVE_BASE =
  "'relative block h-8 w-full overflow-hidden rounded-md bg-background'";
const WORKSPACE_PATH = 'components/arrangement/StudioWorkspace.tsx';
const WORKSPACE_EXIT_CLASS =
  'inline-flex items-center gap-0.75 rounded-sm px-1 text-sm font-medium text-muted hover:text-foreground"';

const MENU_ROW_CONSTANTS: { file: string; name: string }[] = [
  { file: 'components/arrangement/ArrangementGridMenu.tsx', name: 'GRID_MENU_ITEM_CLASS' },
  { file: 'components/arrangement/ArrangementMarkerMenu.tsx', name: 'MARKER_MENU_ITEM_CLASS' },
];

function stripPanelTestComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function countPanelOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

function panelBraceDepthBefore(css: string, index: number): number {
  let depth = 0;
  for (const char of css.slice(0, index)) {
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
  }
  return depth;
}

function listPanelSourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__tests__') {
        files.push(...listPanelSourceFiles(path));
      }
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

function readAppSource(appRelativePath: string): string {
  return readFileSync(resolve(APP_ROOT, appRelativePath), 'utf8');
}

function panelClassTokens(element: Element | null | undefined): string[] {
  return (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
}

function expectPanelTokens(
  element: Element | null | undefined,
  includes: readonly string[],
  excludes: readonly string[],
  label: string,
) {
  const tokens = panelClassTokens(element);
  for (const token of includes) {
    expect(tokens, `${label} includes ${token}`).toContain(token);
  }
  for (const token of excludes) {
    expect(tokens, `${label} excludes ${token}`).not.toContain(token);
  }
}

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

const panelCollection: WorkspaceCollection = {
  id: 'panel-radius',
  label: 'panel-radius',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'panel-radius', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'panel-radius', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function panelArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ],
    markers: [{ id: 'k5', time: 5, name: 'Intro' }],
  };
}

interface PanelApiRef {
  current: ArrangementContextValue | null;
}

function PanelProbe({ api }: { api: PanelApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: PanelApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountPanelWorkspace() {
  const api: PanelApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={panelCollection} initialArrangement={panelArrangement()}>
      <StudioWorkspace />
      <PanelProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return { api, view };
}

function laneBodyOf(view: ReturnType<typeof render>, trackId: string): HTMLElement {
  const body = view.container.querySelector<HTMLElement>(
    `[data-track-id="${trackId}"] [data-grid-seconds]`,
  );
  if (!body) {
    throw new Error(`lane ${trackId} not rendered`);
  }
  return body;
}

function menuRowsOf(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>('[role^="menuitem"]'));
}

describe('10 px panel radius token (V-3c-5a, D-29z137)', () => {
  it('PNR1: --radius-panel is one 0.625rem token inside @theme; the obsidian scope adds no radius', () => {
    const css = stripPanelTestComments(readFileSync(APP_CSS_PATH, 'utf8'));
    expect(countPanelOccurrences(css, PANEL_TOKEN_DECLARATION)).toBe(1);
    expect(countPanelOccurrences(css, '--radius-panel:')).toBe(1);
    const themeIndex = css.indexOf('@theme {');
    expect(themeIndex).toBeGreaterThanOrEqual(0);
    expect(panelBraceDepthBefore(css, themeIndex)).toBe(0);
    const themeOpen = css.indexOf('{', themeIndex);
    let themeEnd = -1;
    let depth = 1;
    for (let index = themeOpen + 1; index < css.length && themeEnd < 0; index += 1) {
      if (css[index] === '{') depth += 1;
      if (css[index] === '}') depth -= 1;
      if (depth === 0) themeEnd = index;
    }
    expect(themeEnd).toBeGreaterThan(themeOpen);
    const tokenIndex = css.indexOf(PANEL_TOKEN_DECLARATION);
    expect(tokenIndex).toBeGreaterThan(themeIndex);
    expect(tokenIndex).toBeLessThan(themeEnd);
    expect(panelBraceDepthBefore(css, tokenIndex)).toBe(1);
    const obsidianIndex = css.indexOf(OBSIDIAN_SELECTOR);
    expect(obsidianIndex).toBeGreaterThan(themeEnd);
    const obsidianBody = css.slice(
      obsidianIndex + OBSIDIAN_SELECTOR.length,
      css.indexOf('}', obsidianIndex + OBSIDIAN_SELECTOR.length),
    );
    expect(obsidianBody).not.toContain('--radius-');
    for (const existing of [
      '--radius-sm: 0.375rem;',
      '--radius-md: 0.5rem;',
      '--radius-lg: 0.75rem;',
    ]) {
      expect(countPanelOccurrences(css, existing), existing).toBe(1);
    }
  });

  it('PNR2: rounded-panel appears only on the nine panel sites; the menu rows keep rounded-sm', () => {
    const counts: Record<string, number> = {};
    for (const root of ['components', 'routes']) {
      for (const path of listPanelSourceFiles(resolve(APP_ROOT, root))) {
        const count = countPanelOccurrences(readFileSync(path, 'utf8'), 'rounded-panel');
        if (count > 0) {
          counts[relative(APP_ROOT, path).split('\\').join('/')] = count;
        }
      }
    }
    expect(counts).toEqual(EXPECTED_PANEL_CLASS_COUNTS);
    for (const site of PANEL_SITE_CLASSES) {
      expect(countPanelOccurrences(readAppSource(site.file), site.className), site.className).toBe(
        1,
      );
    }
    for (const row of MENU_ROW_CONSTANTS) {
      const source = readAppSource(row.file);
      const match = new RegExp(`const ${row.name} =\\s*'([^']*)'`).exec(source);
      const tokens = (match?.[1] ?? '').split(/\s+/).filter(Boolean);
      expect(tokens, row.name).toContain('rounded-sm');
      expect(tokens, row.name).not.toContain('rounded-panel');
    }
  });
});

describe('10 px panel radius in the rendered workspace (V-3c-5a, D-29z137)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
    probeVideoMock.mockReset();
    decodeVideoMock.mockReset();
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

  it('PNR3a: the video box (compact and floating, with a loaded video) and the floating placeholder take rounded-panel', async () => {
    probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 4, width: 640, height: 360 });
    decodeVideoMock.mockResolvedValue({ buffer: null, reason: 'no-audio' });
    const { api, view } = await mountPanelWorkspace();
    try {
      await act(async () => {
        live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]);
      });
      await waitFor(() => {
        expect(live(api).videoSources.size).toBe(1);
      });
      const boxIncludes = ['rounded-panel', 'aspect-video', 'overflow-hidden', 'bg-background'];
      const boxExcludes = ['rounded-sm', 'rounded-md'];
      const compactBox = view.getByTestId('arrangement-video-box');
      expect(compactBox.dataset.videoFloating).toBe('false');
      expectPanelTokens(compactBox, boxIncludes, [...boxExcludes, 'fixed'], 'compact video box');
      fireEvent.click(view.getByTestId('arrangement-video-expand'));
      const floatingBox = view.getByTestId('arrangement-video-box');
      expect(floatingBox.dataset.videoFloating).toBe('true');
      expectPanelTokens(
        floatingBox,
        [...boxIncludes, 'fixed', 'ring-1', 'ring-outline'],
        boxExcludes,
        'floating video box',
      );
      expectPanelTokens(
        view.getByTestId('arrangement-video-placeholder'),
        ['rounded-panel', 'border-dashed', 'border-outline', 'w-40'],
        ['rounded-sm', 'rounded-md'],
        'floating placeholder',
      );
    } finally {
      view.unmount();
    }
  });

  it('PNR3b: the group-state reason box in the Detail panel takes rounded-panel', async () => {
    const { api, view } = await mountPanelWorkspace();
    try {
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
      act(() => live(api).selectClips(['m1', 's1']));
      const reasonBox = view.getByTestId('arrangement-detail-reason').parentElement;
      expectPanelTokens(
        reasonBox,
        ['rounded-panel', 'border', 'border-outline', 'bg-background', 'px-2', 'py-1'],
        ['rounded-sm', 'rounded-md'],
        'reason box',
      );
    } finally {
      view.unmount();
    }
  });

  it('PNR3c: the Grid menu and the Marker menu containers take rounded-panel; their rows keep rounded-sm', async () => {
    const { view } = await mountPanelWorkspace();
    try {
      const menuIncludes = ['rounded-panel', 'border-outline', 'bg-surface', 'p-1', 'shadow-lg'];
      const menuExcludes = ['rounded-md', 'rounded-sm'];
      fireEvent.contextMenu(laneBodyOf(view, 'sfx'), { clientX: 300, clientY: 200 });
      const gridMenu = view.getByTestId('arrangement-grid-menu');
      expect(gridMenu.getAttribute('role')).toBe('menu');
      expectPanelTokens(gridMenu, menuIncludes, menuExcludes, 'grid menu');
      const gridRows = menuRowsOf(gridMenu);
      expect(gridRows.length).toBeGreaterThan(1);
      for (const row of gridRows) {
        expectPanelTokens(row, ['rounded-sm'], ['rounded-panel'], 'grid menu row');
      }
      fireEvent.keyDown(gridMenu, { key: 'Escape', code: 'Escape' });
      expect(view.queryByTestId('arrangement-grid-menu')).toBeNull();

      const flag = view.getByTestId('arrangement-marker');
      fireEvent.pointerDown(flag, {
        button: 2,
        buttons: 2,
        pointerId: 1,
        clientX: 300,
        clientY: 40,
      });
      fireEvent.pointerUp(flag, { button: 2, buttons: 0, pointerId: 1, clientX: 300, clientY: 40 });
      fireEvent.contextMenu(flag, { button: 2, clientX: 300, clientY: 40 });
      const markerMenu = view.getByTestId('arrangement-marker-menu');
      expect(markerMenu.getAttribute('role')).toBe('menu');
      expectPanelTokens(markerMenu, menuIncludes, menuExcludes, 'marker menu');
      const markerRows = menuRowsOf(markerMenu);
      expect(markerRows.length).toBeGreaterThan(0);
      for (const row of markerRows) {
        expectPanelTokens(row, ['rounded-sm'], ['rounded-panel'], 'marker menu row');
      }
    } finally {
      view.unmount();
    }
  });

  it('PNR4: the Overview root, outline overlay and view frame take rounded-panel together; its clip bars keep rounded-xs (V-3c-5b, D-29z138)', async () => {
    const overviewSource = readAppSource(OVERVIEW_PATH);
    expect(countPanelOccurrences(overviewSource, 'rounded-panel')).toBe(3);
    expect(countPanelOccurrences(overviewSource, 'rounded-sm')).toBe(0);
    expect(countPanelOccurrences(overviewSource, OVERVIEW_CLIP_BAR_BASE)).toBe(1);
    const { view } = await mountPanelWorkspace();
    try {
      const overview = view.getByTestId('arrangement-overview');
      expectPanelTokens(
        overview,
        ['rounded-panel', 'overflow-hidden', 'bg-background', 'h-16'],
        ['rounded-sm'],
        'overview root',
      );
      expectPanelTokens(
        overview.firstElementChild,
        ['rounded-panel', 'border', 'border-outline'],
        ['rounded-sm'],
        'overview overlay',
      );
      expectPanelTokens(
        view.getByTestId('arrangement-overview-frame'),
        ['rounded-panel', 'border-foreground/70', 'bg-foreground/5'],
        ['rounded-sm'],
        'overview frame',
      );
      const bars = Array.from(
        overview.children[1]?.querySelectorAll<HTMLElement>(':scope > div > div') ?? [],
      );
      expect(bars.length).toBe(2);
      for (const bar of bars) {
        expectPanelTokens(bar, ['rounded-xs'], ['rounded-panel'], 'overview clip bar');
      }
    } finally {
      view.unmount();
    }
  });

  it('PNR5: the transport readout and the Library preview wave take rounded-md; the exit link keeps rounded-sm (V-3c-5b, D-29z138)', async () => {
    const transportSource = readAppSource(TRANSPORT_PATH);
    const previewSource = readAppSource(LIBRARY_PREVIEW_PATH);
    expect(countPanelOccurrences(transportSource, TRANSPORT_READOUT_CLASS)).toBe(1);
    expect(countPanelOccurrences(previewSource, LIBRARY_PREVIEW_WAVE_BASE)).toBe(1);
    expect(countPanelOccurrences(transportSource, 'rounded-panel')).toBe(0);
    expect(countPanelOccurrences(previewSource, 'rounded-panel')).toBe(0);
    expect(countPanelOccurrences(readAppSource(WORKSPACE_PATH), WORKSPACE_EXIT_CLASS)).toBe(1);
    const { view } = await mountPanelWorkspace();
    try {
      expectPanelTokens(
        view.getByTestId('arrangement-project-end').closest('div'),
        ['rounded-md', 'bg-background', 'font-mono'],
        ['rounded-sm'],
        'transport readout',
      );
      expectPanelTokens(
        view.container.querySelector('header a[href="/"]'),
        ['rounded-sm', 'px-1'],
        ['rounded-md', 'rounded-panel'],
        'exit link',
      );
      const option = view.container.querySelector<HTMLElement>(
        '[role="option"][data-source-id="song"]',
      );
      if (!option) {
        throw new Error('library option song not rendered');
      }
      fireEvent.click(option);
      await waitFor(() => {
        expect(
          view.getByTestId('arrangement-library-preview-wave').getAttribute('aria-disabled'),
        ).toBe('false');
      });
      expectPanelTokens(
        view.getByTestId('arrangement-library-preview-wave'),
        ['rounded-md', 'overflow-hidden', 'cursor-pointer'],
        ['rounded-sm', 'cursor-not-allowed'],
        'preview wave (ready)',
      );
    } finally {
      view.unmount();
    }
    const pendingView = render(
      <ArrangementProvider
        collection={{ ...panelCollection, loadSource: () => new Promise<AudioBuffer>(() => {}) }}
        initialArrangement={panelArrangement()}
      >
        <StudioWorkspace />
      </ArrangementProvider>,
    );
    try {
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      const pendingOption = pendingView.container.querySelector<HTMLElement>(
        '[role="option"][data-source-id="song"]',
      );
      if (!pendingOption) {
        throw new Error('library option song not rendered in the pending view');
      }
      fireEvent.click(pendingOption);
      expect(pendingOption.getAttribute('aria-selected')).toBe('true');
      const waveNotReady = pendingView.getByTestId('arrangement-library-preview-wave');
      expect(waveNotReady.getAttribute('aria-disabled')).toBe('true');
      expectPanelTokens(
        waveNotReady,
        ['rounded-md', 'overflow-hidden', 'cursor-not-allowed'],
        ['rounded-sm', 'cursor-pointer'],
        'preview wave (not ready)',
      );
    } finally {
      pendingView.unmount();
    }
  });
});
