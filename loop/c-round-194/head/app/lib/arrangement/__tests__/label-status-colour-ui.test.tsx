import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementExportDialog } from '~/components/arrangement/ArrangementExportDialog';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { workspaceCollectionCopy } from '~/lib/arrangement/collection';
import {
  type ArrangementRenderOptions,
  type ArrangementWavResult,
  renderArrangementWav,
} from '~/lib/arrangement/graph.client';
import { studioDetailStrings, studioExportStrings } from '~/lib/arrangement/strings';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className} data-testid="arrangement-exit">
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

const renderWavMock = vi.mocked(renderArrangementWav);

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

const LABEL_STATUS_COLLECTION_LABEL = 'label-status-colour';

const labelStatusCollection: WorkspaceCollection = {
  id: 'label-status-colour',
  label: LABEL_STATUS_COLLECTION_LABEL,
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: LABEL_STATUS_COLLECTION_LABEL,
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function labelStatusArrangement(withClips: boolean): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'Video' },
      { id: 'music', kind: 'audio', name: 'Music' },
    ]),
    clips: withClips
      ? [
          {
            id: 'music-1',
            trackId: 'music',
            sourceId: 'song',
            start: 1,
            sourceOffset: 0,
            duration: 4,
          },
          {
            id: 'music-2',
            trackId: 'music',
            sourceId: 'song',
            start: 8,
            sourceOffset: 0,
            duration: 4,
          },
        ]
      : [],
  };
}

const MUSIC_RANGE = { start: 2, end: 3, trackId: 'music' };

interface LabelStatusApiRef {
  current: ArrangementContextValue | null;
}

function LabelStatusProbe({ api }: { api: LabelStatusApiRef }) {
  api.current = useArrangement();
  return null;
}

function liveLabelStatus(api: LabelStatusApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushLabelStatusLoads(api: LabelStatusApiRef) {
  for (let tick = 0; tick < 10 && !liveLabelStatus(api).sourceDurations.has('song'); tick++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
}

async function mountLabelStatusWorkspace() {
  const api: LabelStatusApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={labelStatusCollection}
      initialArrangement={labelStatusArrangement(true)}
    >
      <StudioWorkspace />
      <LabelStatusProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLabelStatusLoads(api);
  return { api, view };
}

async function mountLabelStatusDialog(withClips: boolean) {
  const api: LabelStatusApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={labelStatusCollection}
      initialArrangement={labelStatusArrangement(withClips)}
    >
      <ArrangementExportDialog isOpen onClose={() => undefined} />
      <LabelStatusProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLabelStatusLoads(api);
  return { api, view };
}

type LabelStatusView = ReturnType<typeof render>;

const APP_ROOT = resolve(__dirname, '../../..');
const DETAIL_PANEL_PATH = 'components/arrangement/ArrangementDetailPanel.tsx';
const WORKSPACE_PATH = 'components/arrangement/StudioWorkspace.tsx';
const LIBRARY_PATH = 'components/arrangement/ArrangementLibrary.tsx';
const GRID_MENU_PATH = 'components/arrangement/ArrangementGridMenu.tsx';
const EXPORT_DIALOG_PATH = 'components/arrangement/ArrangementExportDialog.tsx';

function labelStatusTokens(element: Element | null | undefined, label: string): string[] {
  if (!element) {
    throw new Error(`${label} missing`);
  }
  return (element.getAttribute('class') ?? '').split(/\s+/).filter((token) => token.length > 0);
}

function brassLabelTokens(tokens: string[]): string[] {
  return tokens.filter(
    (token) =>
      (token.includes('brand') || token.includes('accent')) &&
      token !== 'focus-visible:ring-brand' &&
      token !== 'accent-foreground',
  );
}

function expectLabelTokens(
  element: Element | null | undefined,
  label: string,
  expected: string[],
  excluded: string[],
) {
  const tokens = labelStatusTokens(element, label);
  for (const token of expected) {
    expect(tokens, `${label} has ${token}`).toContain(token);
  }
  for (const token of excluded) {
    expect(tokens, `${label} keeps ${token}`).not.toContain(token);
  }
  expect(brassLabelTokens(tokens), `${label} brass`).toStrictEqual([]);
}

function expandLabelStatusDetail(view: LabelStatusView) {
  const toggle = view.getByTestId('arrangement-detail-toggle');
  if (toggle.getAttribute('aria-expanded') === 'false') {
    fireEvent.click(toggle);
  }
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
}

function commitLabelStatusTempo(view: LabelStatusView, text: string) {
  const input = view.getByTestId('arrangement-tempo-input');
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function openLabelStatusGridMenu(view: LabelStatusView): HTMLElement {
  const body = view.container.querySelector<HTMLElement>(
    '[data-track-id="music"] [data-grid-seconds]',
  );
  if (!body) {
    throw new Error('music lane body missing');
  }
  fireEvent.pointerDown(body, { button: 2, buttons: 2, pointerId: 9, clientX: 300, clientY: 200 });
  fireEvent.contextMenu(body, { button: 2, clientX: 300, clientY: 200 });
  const menu = view.queryByTestId('arrangement-grid-menu');
  if (!menu) {
    throw new Error('grid menu not open');
  }
  return menu;
}

function readLabelStatusSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function countLabelStatusOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function countLabelStatusWrappedOccurrences(source: string, needle: string): number {
  return source.replace(/\s+/g, ' ').split(needle).length - 1;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  renderWavMock.mockReset();
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

describe('DUX-R-5b-3a labels and status texts go neutral (D-29z143)', () => {
  it('DXL1: the Detail group count is foreground with font-medium and no brass', async () => {
    const { api, view } = await mountLabelStatusWorkspace();
    expandLabelStatusDetail(view);
    act(() => liveLabelStatus(api).selectClips(['music-1', 'music-2']));
    const group = view.getByTestId('arrangement-detail-group');
    const count = group.querySelector('p');
    expectLabelTokens(count, 'group count', ['font-medium', 'text-foreground'], ['text-brand']);
    expect(count?.textContent).toBe(studioDetailStrings.clipCount(2));
  });

  it('DXL2: Apply, 0 dB and the panel toggle hover to foreground and keep only the focus ring brass', async () => {
    const { api, view } = await mountLabelStatusWorkspace();
    expandLabelStatusDetail(view);
    act(() => liveLabelStatus(api).selectClip('music-1'));
    for (const testId of [
      'arrangement-detail-apply',
      'arrangement-detail-clip-gain-reset',
      'arrangement-detail-toggle',
    ]) {
      const element = view.getByTestId(testId);
      const tokens = labelStatusTokens(element, testId);
      expectLabelTokens(
        element,
        testId,
        ['hover:text-foreground', 'text-foreground', 'focus-visible:ring-brand'],
        ['hover:text-brand'],
      );
      expect(
        tokens.filter((token) => token.includes('brand') || token.includes('accent')),
        `${testId} brass tokens`,
      ).toStrictEqual(['focus-visible:ring-brand']);
    }
  });

  it('DXL3: the exit link hovers to foreground and the demo badge is muted with the outline-strong border', async () => {
    const { view } = await mountLabelStatusWorkspace();
    expectLabelTokens(
      view.getByTestId('arrangement-exit'),
      'exit link',
      ['text-muted', 'hover:text-foreground'],
      ['hover:text-brand'],
    );
    const badgeText = workspaceCollectionCopy('demo').badge;
    const badge = Array.from(view.container.querySelectorAll('span')).find(
      (span) => span.textContent?.trim() === badgeText,
    );
    if (!badge) {
      throw new Error(`demo badge "${badgeText}" missing`);
    }
    expectLabelTokens(
      badge,
      'demo badge',
      ['border-outline-strong', 'text-muted'],
      ['border-accent', 'text-accent'],
    );
  });

  it('DXL4: the range Delete hint is muted and the selection count is foreground, both without brass', async () => {
    const { api, view } = await mountLabelStatusWorkspace();
    expect(view.queryByTestId('arrangement-delete-hint')).toBeNull();
    act(() => liveLabelStatus(api).setTimeRange(MUSIC_RANGE));
    expectLabelTokens(
      view.getByTestId('arrangement-delete-hint'),
      'Delete hint',
      ['text-muted'],
      ['text-accent', 'text-foreground'],
    );
    expect(view.queryByTestId('arrangement-selection-count')).toBeNull();
    act(() => liveLabelStatus(api).selectClips(['music-1', 'music-2']));
    expectLabelTokens(
      view.getByTestId('arrangement-selection-count'),
      'selection count',
      ['font-medium', 'text-foreground'],
      ['text-brand'],
    );
  });

  it('DXL5: the Library filter value is foreground inside the muted filter line', async () => {
    const { view } = await mountLabelStatusWorkspace();
    expect(view.queryByTestId('arrangement-library-filter')).toBeNull();
    const sidebar = view.getByRole('navigation', { name: 'Library sidebar' });
    fireEvent.click(within(sidebar).getByRole('button', { name: LABEL_STATUS_COLLECTION_LABEL }));
    const filter = view.getByTestId('arrangement-library-filter');
    expect(filter.textContent).toBe(`Filter: ${LABEL_STATUS_COLLECTION_LABEL}`);
    expectLabelTokens(filter, 'filter line', ['text-muted'], []);
    const value = filter.querySelector('span');
    expect(value?.textContent).toBe(LABEL_STATUS_COLLECTION_LABEL);
    expectLabelTokens(value, 'filter value', ['text-foreground'], ['text-brand']);
  });

  it('DXL6: every Grid menu check slot is foreground and checked items still draw one lucide check', async () => {
    const { view } = await mountLabelStatusWorkspace();
    commitLabelStatusTempo(view, '120');
    fireEvent.change(view.getByTestId('arrangement-grid-division'), { target: { value: '1/8' } });
    fireEvent.click(view.getByTestId('arrangement-snap-toggle'));
    const menu = openLabelStatusGridMenu(view);
    const radios = within(menu).getAllByRole('menuitemradio');
    const checkboxes = within(menu).getAllByRole('menuitemcheckbox');
    const items = [...radios, ...checkboxes];
    expect(
      radios.filter((radio) => radio.getAttribute('aria-checked') === 'true'),
      'exactly one division checked',
    ).toHaveLength(1);
    expect(
      within(menu).getByRole('menuitemcheckbox', { name: 'Snap (G)' }).getAttribute('aria-checked'),
      'Snap checked',
    ).toBe('true');
    let checkedCount = 0;
    for (const item of items) {
      const name = item.textContent ?? '';
      const slot = item.querySelector('span[aria-hidden="true"]');
      expectLabelTokens(slot, `check slot ${name}`, ['text-foreground'], ['text-accent']);
      const icons = slot?.querySelectorAll('svg') ?? [];
      if (item.getAttribute('aria-checked') === 'true') {
        checkedCount += 1;
        expect(icons, `${name} check icon`).toHaveLength(1);
        expect(icons[0]?.classList.contains('lucide-check')).toBe(true);
      } else {
        expect(icons, `${name} has no icon`).toHaveLength(0);
      }
    }
    expect(checkedCount, 'one division plus Snap draw a check').toBe(2);
  });

  it('DXL7a: the Export empty-project note is foreground with no brass', async () => {
    const { view } = await mountLabelStatusDialog(false);
    const note = Array.from(view.baseElement.querySelectorAll('[role="note"]')).find(
      (element) => element.textContent === studioExportStrings.emptyProjectNote,
    );
    if (!note) {
      throw new Error('empty-project note missing');
    }
    expectLabelTokens(note, 'empty note', ['text-sm', 'text-foreground'], ['text-accent']);
  });

  it('DXL7b: the Export overload alert is foreground, neither accent nor destructive', async () => {
    renderWavMock.mockResolvedValue({ blob: new Blob(['x']), peak: 1.1, clippedSamples: 3 });
    const { view } = await mountLabelStatusDialog(true);
    expect(view.queryByTestId('arrangement-export-overload')).toBeNull();
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: studioExportStrings.formatButtonWav }));
      await Promise.resolve();
      await Promise.resolve();
    });
    const alert = view.getByTestId('arrangement-export-overload');
    expect(alert.getAttribute('role')).toBe('alert');
    expectLabelTokens(
      alert,
      'overload alert',
      ['text-foreground'],
      ['text-accent', 'text-destructive'],
    );
  });

  it('DXL7c: the Export progress bar uses accent-foreground during a pending render', async () => {
    const control: { options: ArrangementRenderOptions | undefined } = { options: undefined };
    renderWavMock.mockImplementation(
      (_arrangement, _buffers, _window, options) =>
        new Promise<ArrangementWavResult>(() => {
          control.options = options;
        }),
    );
    const { view } = await mountLabelStatusDialog(true);
    await act(async () => {
      fireEvent.click(view.getByRole('button', { name: studioExportStrings.formatButtonWav }));
      await Promise.resolve();
    });
    const onProgress = control.options?.onProgress;
    if (!onProgress) {
      throw new Error('renderer got no onProgress');
    }
    act(() => onProgress('render', 0.5));
    const progress = view.getByTestId('arrangement-export-progress');
    expect(progress.tagName).toBe('PROGRESS');
    expectLabelTokens(progress, 'export progress', ['accent-foreground'], ['accent-brand']);
  });

  it('DXL8: the source drops the 5b-3a brass, holds the neutral strings and keeps the kept brass', () => {
    const sources: Record<string, string> = {
      [DETAIL_PANEL_PATH]: readLabelStatusSource(DETAIL_PANEL_PATH),
      [WORKSPACE_PATH]: readLabelStatusSource(WORKSPACE_PATH),
      [LIBRARY_PATH]: readLabelStatusSource(LIBRARY_PATH),
      [GRID_MENU_PATH]: readLabelStatusSource(GRID_MENU_PATH),
      [EXPORT_DIALOG_PATH]: readLabelStatusSource(EXPORT_DIALOG_PATH),
    };
    const expectCount = (path: string, needle: string, count: number) => {
      expect(countLabelStatusOccurrences(sources[path], needle), `${needle} in ${path}`).toBe(
        count,
      );
    };

    expectCount(DETAIL_PANEL_PATH, 'hover:text-brand', 0);
    expectCount(DETAIL_PANEL_PATH, 'font-medium text-brand"', 0);
    expectCount(WORKSPACE_PATH, 'hover:text-brand', 0);
    expectCount(WORKSPACE_PATH, 'border border-accent px-2', 0);
    expectCount(WORKSPACE_PATH, 'className="text-accent"', 0);
    expectCount(WORKSPACE_PATH, 'font-medium text-brand"', 0);
    expectCount(WORKSPACE_PATH, 'font-medium text-accent"', 0);
    expectCount(LIBRARY_PATH, '<span className="text-brand">', 0);
    expectCount(GRID_MENU_PATH, 'justify-center text-accent', 0);
    expectCount(EXPORT_DIALOG_PATH, 'text-sm text-accent', 0);
    expectCount(EXPORT_DIALOG_PATH, 'h-2 w-full accent-brand', 0);

    expectCount(DETAIL_PANEL_PATH, 'hover:text-foreground', 3);
    const expectWrappedCount = (path: string, needle: string, count: number) => {
      expect(
        countLabelStatusWrappedOccurrences(sources[path], needle),
        `${needle} in ${path} (whitespace-normalised)`,
      ).toBe(count);
    };
    expectWrappedCount(
      DETAIL_PANEL_PATH,
      '<p className="font-medium text-foreground"> {studioDetailStrings.clipCount',
      1,
    );
    expectCount(WORKSPACE_PATH, 'font-medium text-muted hover:text-foreground', 1);
    expectCount(
      WORKSPACE_PATH,
      'rounded-sm border border-outline-strong px-2 py-0.5 text-xs text-muted',
      1,
    );
    expectCount(WORKSPACE_PATH, 'className="text-muted" data-testid="arrangement-delete-hint"', 1);
    expectCount(
      WORKSPACE_PATH,
      'className="font-medium text-foreground" data-testid="arrangement-selection-count"',
      1,
    );
    expectWrappedCount(
      WORKSPACE_PATH,
      'className="font-medium text-foreground" data-testid="arrangement-lane-move-refusal"',
      1,
    );
    expectCount(LIBRARY_PATH, '<span className="text-foreground">{activeNodeLabel}', 1);
    expectCount(GRID_MENU_PATH, 'justify-center text-foreground', 3);
    expectCount(EXPORT_DIALOG_PATH, 'className="text-sm text-foreground"', 2);
    expectCount(EXPORT_DIALOG_PATH, 'h-2 w-full accent-foreground', 1);

    expectCount(EXPORT_DIALOG_PATH, 'accent-brand', 5);
    expectCount(EXPORT_DIALOG_PATH, 'border-brand bg-brand/10', 5);
    expectCount(WORKSPACE_PATH, 'border border-brand bg-brand/10', 1);
    expectCount(DETAIL_PANEL_PATH, 'bg-accent', 1);
    expectCount(LIBRARY_PATH, "'border-brand bg-brand/10 text-brand'", 1);
  });
});
