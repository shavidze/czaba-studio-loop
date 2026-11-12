import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { gridTempoClearedMessage } from '../grid-divisions';
import { createArrangement } from '../model';
import { studioGridStrings } from '../strings';
import { useWorkspaceStatusProbe, type WorkspaceStatusProbeValue } from './helpers/workspace-probe';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const MUSIC_LANE_Y = 150;
const ADAPTIVE_SUFFIX = ' · Adaptive: follows zoom — 5 for fixed';
const FIXED_SUFFIX = ' · Fixed at every zoom — 5 for adaptive';
const SNAP_ON_QUARTER = 'Snap on — grid 1/4 (G)';
const ZOOM_TEN_STEPS_OUT_FROM_320 = 34.359738368;
const WIDTH_LABELS = ['Widest', 'Wide', 'Medium', 'Narrow', 'Narrowest'];
const SECONDS_LABELS = ['10 s', '5 s', '2 s', '1 s', '0.5 s', '0.25 s', '0.1 s'];

const adaptiveCollection: WorkspaceCollection = {
  id: 'grid-adaptive',
  label: 'grid-adaptive',
  origin: 'demo',
  sources: [
    {
      id: 'stem-90',
      title: 'Slow stem',
      collectionLabel: 'grid-adaptive',
      kind: 'stem',
      origin: 'demo',
      bpm: 90,
    },
    {
      id: 'stem-120',
      title: 'Pulse stem',
      collectionLabel: 'grid-adaptive',
      kind: 'stem',
      origin: 'demo',
      bpm: 120,
    },
    { id: 'song', title: 'Song', collectionLabel: 'grid-adaptive', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const DEFAULT_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 4 },
];

function adaptiveArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: DEFAULT_CLIPS };
}

interface AdaptiveApiRef {
  current: WorkspaceStatusProbeValue | null;
}

function AdaptiveProbe({ api }: { api: AdaptiveApiRef }) {
  api.current = useWorkspaceStatusProbe();
  return null;
}

function live(api: AdaptiveApiRef): WorkspaceStatusProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountAdaptiveWorkspace() {
  const api: AdaptiveApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={adaptiveCollection} initialArrangement={adaptiveArrangement()}>
      <StudioWorkspace />
      <AdaptiveProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  const layoutRows = () => {
    view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
      const top = index * LANE_HEIGHT_PX;
      Object.defineProperty(row, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
      });
    });
  };
  layoutRows();
  const addSource = (sourceId: string) => {
    const found = view
      .getAllByRole('option')
      .find((entry) => entry.getAttribute('data-source-id') === sourceId);
    if (!found) {
      throw new Error(`option ${sourceId} not rendered`);
    }
    fireEvent.click(found);
    act(() => {
      fireEvent.click(view.getByRole('button', { name: 'Add' }));
    });
  };
  const clipParts = (clipId: string) => {
    layoutRows();
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header };
  };
  return { api, view, addSource, clipParts };
}

type AdaptiveView = Awaited<ReturnType<typeof mountAdaptiveWorkspace>>['view'];

function gridControl(view: AdaptiveView): HTMLElement {
  return view.getByTestId('arrangement-grid-control');
}

function gridMode(view: AdaptiveView): string | undefined {
  return gridControl(view).dataset.gridMode;
}

function divisionOf(view: AdaptiveView): string | undefined {
  return gridControl(view).dataset.gridDivision;
}

function divisionSelect(view: AdaptiveView): HTMLSelectElement {
  const select = view.getByTestId('arrangement-grid-division');
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error('division select missing');
  }
  return select;
}

function laneGridSeconds(view: AdaptiveView): Array<string | undefined> {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-track-id] [data-grid-seconds]'),
  ).map((body) => body.dataset.gridSeconds);
}

function statusText(view: AdaptiveView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function tempoInput(view: AdaptiveView): HTMLInputElement {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  return input;
}

function gridMenu(view: AdaptiveView): HTMLElement | null {
  return view.queryByTestId('arrangement-grid-menu');
}

function openGridMenu(view: AdaptiveView): HTMLElement {
  const body = view.container.querySelector<HTMLElement>('[data-track-id] [data-grid-lines]');
  if (!body) {
    throw new Error('lane body missing');
  }
  fireEvent.pointerDown(body, { button: 2, buttons: 2, pointerId: 9, clientX: 300, clientY: 200 });
  fireEvent.contextMenu(body, { button: 2, clientX: 300, clientY: 200 });
  const menu = gridMenu(view);
  if (!menu) {
    throw new Error('grid menu not open');
  }
  return menu;
}

function menuGroupRadios(menu: HTMLElement, name: 'Adaptive grid' | 'Fixed grid'): HTMLElement[] {
  return within(within(menu).getByRole('group', { name })).getAllByRole('menuitemradio');
}

function checkedRadioNames(menu: HTMLElement): Array<string | null> {
  return within(menu)
    .getAllByRole('menuitemradio')
    .filter((radio) => radio.getAttribute('aria-checked') === 'true')
    .map((radio) => radio.textContent);
}

function blurActive() {
  act(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });
}

function pressKey(
  digit: '1' | '2' | '3' | '4' | '5',
  target: Element = document.body,
  extra: Partial<KeyboardEventInit> = {},
): boolean {
  return fireEvent.keyDown(target, { key: digit, code: `Digit${digit}`, ...extra });
}

const press = { button: 0, buttons: 1 };

function dragClip(parts: { root: HTMLElement; header: HTMLElement }, dx: number, pointerId = 1) {
  fireEvent.pointerDown(parts.header, { ...press, pointerId, clientX: 100, clientY: MUSIC_LANE_Y });
  fireEvent.pointerMove(parts.root, { pointerId, clientX: 100 + dx, clientY: MUSIC_LANE_Y });
  fireEvent.pointerUp(parts.root, { pointerId, clientX: 100 + dx, clientY: MUSIC_LANE_Y });
}

function clipStart(api: AdaptiveApiRef, clipId: string): number | undefined {
  return live(api).arrangement.clips.find((clip) => clip.id === clipId)?.start;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SABA-B-11b adaptive grid in the workspace (D-29z356)', { timeout: 15_000 }, () => {
  it('GAU1 mounts adaptive at 1 s with the adaptive title suffix and the 5 key listed', async () => {
    const { view } = await mountAdaptiveWorkspace();
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('1');
    expect(divisionSelect(view).title.endsWith(ADAPTIVE_SUFFIX)).toBe(true);
    expect(divisionSelect(view).getAttribute('aria-keyshortcuts')).toBe('1 2 4 5');
  });

  it('GAU2 zooming follows 0.5 → 0.25 → 0.1 s in every lane and writes no status', async () => {
    const { api, view } = await mountAdaptiveWorkspace();
    const statusBefore = statusText(view);
    const sequenceBefore = live(api).statusSequence;
    const steps: Array<[number, string]> = [
      [50, '0.5'],
      [100, '0.25'],
      [320, '0.1'],
    ];
    for (const [zoom, division] of steps) {
      act(() => live(api).setPxPerSecond(zoom));
      expect(divisionOf(view)).toBe(division);
      expect(gridControl(view).dataset.gridSeconds).toBe(division);
      const lanes = laneGridSeconds(view);
      expect(lanes.length).toBeGreaterThan(0);
      for (const seconds of lanes) {
        expect(seconds).toBe(division);
      }
      expect(gridMode(view)).toBe('adaptive');
    }
    expect(statusText(view)).toBe(statusBefore);
    expect(live(api).statusSequence).toBe(sequenceBefore);
  });

  it('GAU3 5 freezes the pick as fixed through a zoom; 5 again re-picks adaptively', async () => {
    const { api, view } = await mountAdaptiveWorkspace();
    expect(pressKey('5')).toBe(false);
    expect(gridMode(view)).toBe('fixed');
    expect(statusText(view)).toBe(studioGridStrings.fixedOn('1 s'));
    expect(statusText(view)).toBe('Fixed grid — 1 s at every zoom (5)');
    expect(divisionSelect(view).title.endsWith(FIXED_SUFFIX)).toBe(true);
    act(() => live(api).setPxPerSecond(320));
    expect(divisionOf(view)).toBe('1');
    expect(gridMode(view)).toBe('fixed');
    pressKey('5');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('0.1');
    expect(statusText(view)).toBe('Adaptive grid — follows zoom, now 0.1 s (5)');
  });

  it('GAU4 adaptive 1 and 2 move the density one level; the third 1 reports the narrowest density', async () => {
    const { view } = await mountAdaptiveWorkspace();
    pressKey('1');
    expect(divisionOf(view)).toBe('0.5');
    expect(gridMode(view)).toBe('adaptive');
    expect(statusText(view)).toBe('Grid: 0.5 s (Snap off)');
    pressKey('1');
    expect(divisionOf(view)).toBe('0.25');
    expect(statusText(view)).toBe('Grid: 0.25 s (Snap off)');
    pressKey('1');
    expect(divisionOf(view)).toBe('0.25');
    expect(statusText(view)).toBe(studioGridStrings.adaptiveNarrowest('0.25 s'));
    expect(statusText(view)).toBe(
      'The adaptive grid is already at its narrowest density — now 0.25 s (1)',
    );
    pressKey('2');
    expect(divisionOf(view)).toBe('0.5');
    expect(gridMode(view)).toBe('adaptive');
  });

  it('GAU5 choosing 0.1 s in the select makes the grid fixed at any zoom', async () => {
    const { api, view } = await mountAdaptiveWorkspace();
    fireEvent.change(divisionSelect(view), { target: { value: '0.1' } });
    expect(gridMode(view)).toBe('fixed');
    expect(divisionOf(view)).toBe('0.1');
    act(() => live(api).setPxPerSecond(2));
    expect(divisionOf(view)).toBe('0.1');
    act(() => live(api).setPxPerSecond(320));
    expect(divisionOf(view)).toBe('0.1');
    expect(gridMode(view)).toBe('fixed');
  });

  it('GAU6 a 90 BPM seed picks 1/4 in adaptive and in fixed mode with the same seed text', async () => {
    const adaptive = await mountAdaptiveWorkspace();
    adaptive.addSource('stem-90');
    expect(tempoInput(adaptive.view).value).toBe('90');
    expect(gridMode(adaptive.view)).toBe('adaptive');
    expect(divisionOf(adaptive.view)).toBe('1/4');
    expect(statusText(adaptive.view)?.endsWith(SNAP_ON_QUARTER)).toBe(true);
    adaptive.view.unmount();

    const fixed = await mountAdaptiveWorkspace();
    pressKey('5');
    expect(gridMode(fixed.view)).toBe('fixed');
    fixed.addSource('stem-90');
    expect(gridMode(fixed.view)).toBe('fixed');
    expect(divisionOf(fixed.view)).toBe('1/4');
    expect(statusText(fixed.view)?.endsWith(SNAP_ON_QUARTER)).toBe(true);
  });

  it('GAU7 5 on the focused select toggles without type-ahead; modified and repeated 5 change nothing', async () => {
    const { view } = await mountAdaptiveWorkspace();
    const select = divisionSelect(view);
    act(() => select.focus());
    expect(document.activeElement).toBe(select);
    expect(pressKey('5', select)).toBe(false);
    expect(gridMode(view)).toBe('fixed');
    expect(select.value).not.toBe('5');
    expect(select.value).toBe('1');
    expect(pressKey('5', select, { ctrlKey: true })).toBe(true);
    expect(gridMode(view)).toBe('fixed');
    expect(pressKey('5', select, { metaKey: true })).toBe(true);
    expect(gridMode(view)).toBe('fixed');
    expect(pressKey('5', select, { altKey: true })).toBe(true);
    expect(gridMode(view)).toBe('fixed');
    expect(fireEvent.keyDown(select, { key: '%', code: 'Digit5', shiftKey: true })).toBe(true);
    expect(gridMode(view)).toBe('fixed');
    pressKey('5', select, { repeat: true });
    expect(gridMode(view)).toBe('fixed');
    expect(select.value).toBe('1');
    blurActive();
    expect(pressKey('5', document.body, { ctrlKey: true })).toBe(true);
    expect(gridMode(view)).toBe('fixed');
    pressKey('5', document.body, { repeat: true });
    expect(gridMode(view)).toBe('fixed');
  });

  it('GAU8 a 5 typed in the library search or the BPM field, or with Export open, keeps the mode', async () => {
    const { view } = await mountAdaptiveWorkspace();
    const search = view.getByLabelText('Search the library');
    act(() => search.focus());
    expect(pressKey('5', search)).toBe(true);
    expect(gridMode(view)).toBe('adaptive');
    const tempo = tempoInput(view);
    act(() => tempo.focus());
    expect(pressKey('5', tempo)).toBe(true);
    expect(gridMode(view)).toBe('adaptive');
    blurActive();
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    pressKey('5');
    expect(gridMode(view)).toBe('adaptive');
  });

  it('GAU9 with Snap on at 100 px/s a 0.7 s drag lands on the adaptive 0.25 s grid; Undo restores', async () => {
    const { api, view, clipParts } = await mountAdaptiveWorkspace();
    blurActive();
    fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
    expect(gridControl(view).dataset.snap).toBe('on');
    act(() => live(api).setPxPerSecond(100));
    expect(divisionOf(view)).toBe('0.25');
    expect(clipStart(api, 'm1')).toBe(7);
    dragClip(clipParts('m1'), 70);
    expect(clipStart(api, 'm1')).toBe(7.75);
    act(() => live(api).undo());
    expect(clipStart(api, 'm1')).toBe(7);
  });

  it('GAU10 3 with a BPM keeps the adaptive mode and switches to the triplet family and back', async () => {
    const { view, addSource } = await mountAdaptiveWorkspace();
    addSource('stem-120');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('1/2');
    blurActive();
    pressKey('3');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('1/2T');
    pressKey('3');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('1/2');
  });
  it('GAU11 clearing the BPM while adaptive at 320 px/s re-picks 0.1 s and names it in the status', async () => {
    const { api, view, addSource } = await mountAdaptiveWorkspace();
    addSource('stem-90');
    expect(divisionOf(view)).toBe('1/4');
    act(() => live(api).setPxPerSecond(320));
    expect(divisionOf(view)).toBe('1/32');
    const input = tempoInput(view);
    act(() => input.focus());
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(tempoInput(view).value).toBe('');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('0.1');
    expect(statusText(view)).toBe(gridTempoClearedMessage(0.1));
  });

  it('GAU12 after a zoom the stored density never swallows a key: 1 1, zoom to 320, 2 widens at once', async () => {
    const { api, view } = await mountAdaptiveWorkspace();
    pressKey('1');
    pressKey('1');
    expect(divisionOf(view)).toBe('0.25');
    act(() => live(api).setPxPerSecond(320));
    expect(divisionOf(view)).toBe('0.1');
    pressKey('1');
    expect(divisionOf(view)).toBe('0.1');
    expect(statusText(view)).toBe('The grid is already at its narrowest — 0.1 s (1)');
    pressKey('2');
    expect(divisionOf(view)).toBe('0.25');
    expect(statusText(view)).toBe('Grid: 0.25 s (Snap off)');
    pressKey('2');
    expect(divisionOf(view)).toBe('0.5');
    act(() => live(api).setPxPerSecond(40));
    expect(divisionOf(view)).toBe('5');
    expect(gridMode(view)).toBe('adaptive');
  });

  it('GAU13 5 back to adaptive resets the density to Medium', async () => {
    const { view } = await mountAdaptiveWorkspace();
    pressKey('1');
    expect(divisionOf(view)).toBe('0.5');
    pressKey('5');
    expect(gridMode(view)).toBe('fixed');
    expect(divisionOf(view)).toBe('0.5');
    pressKey('5');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('1');
    expect(statusText(view)).toBe('Adaptive grid — follows zoom, now 1 s (5)');
  });

  it('GAU14 C-R239-01 zoom-back: 1 1, zoom to 320, one 2, zoom to 34.4 px/s shows 2 s (density re-anchored to the visible pick)', async () => {
    const { api, view } = await mountAdaptiveWorkspace();
    pressKey('1');
    pressKey('1');
    act(() => live(api).setPxPerSecond(320));
    expect(divisionOf(view)).toBe('0.1');
    pressKey('2');
    expect(divisionOf(view)).toBe('0.25');
    act(() => live(api).setPxPerSecond(ZOOM_TEN_STEPS_OUT_FROM_320));
    expect(divisionOf(view)).toBe('2');
    expect(gridMode(view)).toBe('adaptive');
  });

  it('GAU15 mirror at the widest end: 2 2, zoom to 0.5 px/s, one 1 narrows at once, zoom to 40 shows 0.5 s', async () => {
    const { api, view } = await mountAdaptiveWorkspace();
    pressKey('2');
    pressKey('2');
    expect(divisionOf(view)).toBe('5');
    act(() => live(api).setPxPerSecond(0.5));
    expect(divisionOf(view)).toBe('10');
    pressKey('1');
    expect(divisionOf(view)).toBe('5');
    expect(statusText(view)).toBe('Grid: 5 s (Snap off)');
    act(() => live(api).setPxPerSecond(40));
    expect(divisionOf(view)).toBe('0.5');
  });

  it('GAU16 GATE239-S2 an adaptive 1 before a BPM seed is a hand choice: the seed keeps the seconds grid', async () => {
    const { view, addSource } = await mountAdaptiveWorkspace();
    pressKey('1');
    expect(divisionOf(view)).toBe('0.5');
    addSource('stem-90');
    expect(tempoInput(view).value).toBe('90');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('0.5');
    expect(statusText(view)?.endsWith('Snap on — grid 0.5 s (G)')).toBe(true);
  });

  it('GAU17 a refused adaptive key (family end) is not a hand choice: the seed still picks the musical grid', async () => {
    const { api, view, addSource } = await mountAdaptiveWorkspace();
    act(() => live(api).setPxPerSecond(320));
    expect(divisionOf(view)).toBe('0.1');
    pressKey('1');
    expect(divisionOf(view)).toBe('0.1');
    expect(statusText(view)).toBe('The grid is already at its narrowest — 0.1 s (1)');
    addSource('stem-90');
    expect(tempoInput(view).value).toBe('90');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('1/32');
    expect(statusText(view)?.endsWith('Snap on — grid 1/32 (G)')).toBe(true);
  });
  it('GAU18 the lane menu shows an Adaptive grid group and a Fixed grid group with one checked item: Medium at mount', async () => {
    const { view } = await mountAdaptiveWorkspace();
    const menu = openGridMenu(view);
    expect(menuGroupRadios(menu, 'Adaptive grid').map((radio) => radio.textContent)).toEqual(
      WIDTH_LABELS,
    );
    expect(menuGroupRadios(menu, 'Fixed grid').map((radio) => radio.textContent)).toEqual(
      SECONDS_LABELS,
    );
    expect(checkedRadioNames(menu)).toEqual(['Medium']);
    expect(document.activeElement).toBe(
      within(menu).getByRole('menuitemradio', { name: 'Medium' }),
    );
  });

  it('GAU19 choosing Narrow keeps the grid adaptive one level finer, names it in the status and follows the zoom', async () => {
    const { api, view } = await mountAdaptiveWorkspace();
    fireEvent.click(within(openGridMenu(view)).getByRole('menuitemradio', { name: 'Narrow' }));
    expect(gridMenu(view)).toBeNull();
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('0.5');
    expect(statusText(view)).toBe('Adaptive grid — Narrow, now 0.5 s');
    expect(checkedRadioNames(openGridMenu(view))).toEqual(['Narrow']);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    act(() => live(api).setPxPerSecond(80));
    expect(divisionOf(view)).toBe('0.25');
    expect(gridMode(view)).toBe('adaptive');
  });

  it('GAU20 in fixed mode the fixed pick is the only checked item; choosing Wide switches to adaptive at that level', async () => {
    const { view } = await mountAdaptiveWorkspace();
    pressKey('5');
    expect(gridMode(view)).toBe('fixed');
    const menu = openGridMenu(view);
    expect(checkedRadioNames(menu)).toEqual(['1 s']);
    expect(document.activeElement).toBe(within(menu).getByRole('menuitemradio', { name: '1 s' }));
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'Wide' }));
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('2');
    expect(statusText(view)).toBe('Adaptive grid — Wide, now 2 s');
    expect(divisionSelect(view).title.endsWith(ADAPTIVE_SUFFIX)).toBe(true);
    expect(checkedRadioNames(openGridMenu(view))).toEqual(['Wide']);
  });

  it('GAU21 a width chosen in the menu before a BPM seed is a hand choice: the seed keeps the adaptive seconds grid', async () => {
    const { view, addSource } = await mountAdaptiveWorkspace();
    fireEvent.click(within(openGridMenu(view)).getByRole('menuitemradio', { name: 'Narrow' }));
    expect(divisionOf(view)).toBe('0.5');
    addSource('stem-90');
    expect(tempoInput(view).value).toBe('90');
    expect(gridMode(view)).toBe('adaptive');
    expect(divisionOf(view)).toBe('0.5');
    expect(statusText(view)?.endsWith('Snap on — grid 0.5 s (G)')).toBe(true);
  });

  it('GAU22 plain 4 toggles Snap like G with the same status texts; held, modified and typed 4 do nothing to Snap', async () => {
    const { view } = await mountAdaptiveWorkspace();
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(pressKey('4')).toBe(false);
    expect(gridControl(view).dataset.snap).toBe('on');
    expect(statusText(view)).toBe('Snap on — grid 1 s (G)');
    expect(pressKey('4', document.body, { repeat: true })).toBe(false);
    expect(gridControl(view).dataset.snap).toBe('on');
    expect(pressKey('4')).toBe(false);
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(statusText(view)).toBe('Snap off — free movement (G)');
    expect(pressKey('4', document.body, { ctrlKey: true })).toBe(true);
    expect(pressKey('4', document.body, { altKey: true })).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(pressKey('4', tempoInput(view))).toBe(true);
    expect(gridControl(view).dataset.snap).toBe('off');
    expect(view.getByTestId('arrangement-snap-toggle').getAttribute('aria-keyshortcuts')).toBe(
      'G 4',
    );
  });

  it('GAU23 4 on the focused division select toggles Snap and leaves the division and mode unchanged', async () => {
    const { view } = await mountAdaptiveWorkspace();
    const select = divisionSelect(view);
    select.focus();
    expect(pressKey('4', select)).toBe(false);
    expect(gridControl(view).dataset.snap).toBe('on');
    expect(select.value).toBe('1');
    expect(divisionOf(view)).toBe('1');
    expect(gridMode(view)).toBe('adaptive');
    expect(select.getAttribute('aria-keyshortcuts')).toBe('1 2 4 5');
  });
});
