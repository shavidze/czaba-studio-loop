import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementLoop,
  WorkspaceCollection,
} from '~/types/arrangement';
import { gridTempoClearedMessage } from '../grid-divisions';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { tempoStatusMessage } from '../tempo';

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

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const SFX_LANE_Y = 250;
const RULER_Y = 10;
const SECONDS_LABELS = ['10 s', '5 s', '2 s', '1 s', '0.5 s', '0.25 s', '0.1 s'];
const STRAIGHT_LABELS = ['1 bar', '1/2', '1/4', '1/8', '1/16', '1/32'];
const TRIPLET_LABELS = ['1/2T', '1/4T', '1/8T', '1/16T', '1/32T'];
const SECONDS_IDS = ['10', '5', '2', '1', '0.5', '0.25', '0.1'];
const STRAIGHT_IDS = ['bar', '1/2', '1/4', '1/8', '1/16', '1/32'];
const NO_TEMPO_REFUSAL = 'Triplets need a tempo — enter a BPM first (3)';
const BAR_REFUSAL = '1 bar has no triplets — choose 1/2 or narrower (3)';
const SECONDS_REFUSAL = 'Triplets work only on the bars grid — choose 1/2 … 1/32 (3)';
const TRIPLET_MENU_LABEL = 'Triplets (3)';
const SNAP_MENU_LABEL = 'Snap (G)';

const tripletCollection: WorkspaceCollection = {
  id: 'grid',
  label: 'grid',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'grid', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'grid', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const TRIPLET_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 8 },
  { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function tripletArrangement(
  clips: ArrangementClip[],
  loop: ArrangementLoop | null = null,
): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return loop ? { ...base, clips, loop } : { ...base, clips };
}

interface TripletApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function TripletProbe({ api }: { api: TripletApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: TripletApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: TripletApiRef): number {
  if (!api.position) {
    throw new Error('position store not mounted');
  }
  return api.position.getPosition();
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountTripletWorkspace(loop: ArrangementLoop | null = null) {
  const api: TripletApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider
      collection={tripletCollection}
      initialArrangement={tripletArrangement(TRIPLET_CLIPS, loop)}
    >
      <StudioWorkspace />
      <TripletProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const ruler = view.getByTestId('arrangement-ruler');
  stubCapture(ruler);
  const clipParts = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header };
  };
  const laneBody = (trackId: string) => {
    const body = view.container.querySelector<HTMLElement>(
      `[data-track-id="${trackId}"] [data-grid-seconds]`,
    );
    if (!body) {
      throw new Error(`lane ${trackId} not rendered`);
    }
    return body;
  };
  const brace = () => {
    const element = view.getByTestId('arrangement-loop-brace');
    stubCapture(element);
    return element;
  };
  return { api, view, ruler, clipParts, laneBody, brace };
}

type TripletView = Awaited<ReturnType<typeof mountTripletWorkspace>>['view'];

function clipStart(api: TripletApiRef, clipId: string): number {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip.start;
}

function tempoInput(view: TripletView): HTMLInputElement {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  return input;
}

function commitTempo(view: TripletView, text: string) {
  const input = tempoInput(view);
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function divisionSelect(view: TripletView): HTMLSelectElement {
  const select = view.getByTestId('arrangement-grid-division');
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error('division select missing');
  }
  return select;
}

function chooseDivision(view: TripletView, value: string) {
  fireEvent.change(divisionSelect(view), { target: { value } });
}

function optionValues(view: TripletView): string[] {
  return Array.from(divisionSelect(view).options).map((option) => option.value);
}

function gridControl(view: TripletView): HTMLElement {
  return view.getByTestId('arrangement-grid-control');
}

function divisionOf(view: TripletView): string | undefined {
  return gridControl(view).dataset.gridDivision;
}

function statusText(view: TripletView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function laneBodies(view: TripletView): HTMLElement[] {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-track-id] [data-grid-lines]'),
  );
}

function undoTitle(view: TripletView): string {
  const button = view.container.querySelector<HTMLButtonElement>('button[title^="Undo"]');
  if (!button) {
    throw new Error('undo button missing');
  }
  return button.title;
}

function gridMenu(view: TripletView): HTMLElement | null {
  return view.queryByTestId('arrangement-grid-menu');
}

function openMenu(view: TripletView): HTMLElement {
  const menu = gridMenu(view);
  if (!menu) {
    throw new Error('grid menu not open');
  }
  return menu;
}

function rightClick(target: HTMLElement, clientX = 300, clientY = 200): boolean {
  fireEvent.pointerDown(target, { button: 2, buttons: 2, pointerId: 9, clientX, clientY });
  return fireEvent.contextMenu(target, { button: 2, clientX, clientY });
}

function menuCheckboxNames(menu: HTMLElement): (string | null)[] {
  return within(menu)
    .getAllByRole('menuitemcheckbox')
    .map((item) => item.textContent);
}

function tripletMenuItem(menu: HTMLElement): HTMLElement {
  return within(menu).getByRole('menuitemcheckbox', { name: TRIPLET_MENU_LABEL });
}

const press = { button: 0, buttons: 1 };

function dragClip(
  parts: { root: HTMLElement; header: HTMLElement },
  dx: number,
  pointerId = 1,
  altKey = false,
) {
  fireEvent.pointerDown(parts.header, {
    ...press,
    pointerId,
    clientX: 100,
    clientY: SFX_LANE_Y,
    altKey,
  });
  fireEvent.pointerMove(parts.root, { pointerId, clientX: 100 + dx, clientY: SFX_LANE_Y, altKey });
  fireEvent.pointerUp(parts.root, { pointerId, clientX: 100 + dx, clientY: SFX_LANE_Y, altKey });
}

function clickRuler(ruler: HTMLElement, x: number) {
  fireEvent.pointerDown(ruler, { ...press, pointerId: 1, clientX: x, clientY: RULER_Y });
  fireEvent.pointerUp(ruler, { pointerId: 1, clientX: x, clientY: RULER_Y });
}

function pressG() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function pressDigit(digit: '1' | '2' | '3', options: Partial<KeyboardEventInit> = {}): boolean {
  return fireEvent.keyDown(document.body, { key: digit, code: `Digit${digit}`, ...options });
}

function pressArrow(key: 'ArrowLeft' | 'ArrowRight') {
  fireEvent.keyDown(document.body, { key, code: key });
}

const BRACE_X = 200;

function dragBraceBody(element: HTMLElement, dx: number) {
  fireEvent.pointerDown(element, { ...press, pointerId: 3, clientX: BRACE_X, clientY: 30 });
  fireEvent.pointerMove(element, { pointerId: 3, clientX: BRACE_X + dx, clientY: 30 });
  fireEvent.pointerUp(element, { pointerId: 3, clientX: BRACE_X + dx, clientY: 30 });
}

function pressBraceKey(element: HTMLElement, key: 'ArrowLeft' | 'ArrowRight') {
  fireEvent.keyDown(element, { key, code: key });
}

function expectLoop(api: TripletApiRef, start: number, end: number) {
  const loop = live(api).arrangement.loop;
  if (!loop) {
    throw new Error('loop missing');
  }
  expect(loop.start).toBeCloseTo(start, 9);
  expect(loop.end).toBeCloseTo(end, 9);
}

const TRIPLET_LOOP_90: ArrangementLoop = { start: 0.889, end: 1.778, enabled: true };

async function mountQuarterTriplet90(loop: ArrangementLoop | null = null) {
  const mounted = await mountTripletWorkspace(loop);
  commitTempo(mounted.view, '90');
  chooseDivision(mounted.view, '1/4');
  pressDigit('3');
  expect(divisionOf(mounted.view)).toBe('1/4T');
  return mounted;
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
  cleanup();
  fireEvent.pointerDown(window);
  fireEvent.click(document.body);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SRW-14 stage 5b triplet grid in the workspace (D-29z34)', { timeout: 15_000 }, () => {
  it('TU1 without a BPM the 3 key refuses and the menu has no triplet item', async () => {
    const { view, laneBody } = await mountTripletWorkspace();
    expect(pressDigit('3')).toBe(false);
    expect(divisionOf(view)).toBe('1');
    expect(statusText(view)).toBe(NO_TEMPO_REFUSAL);
    expect(divisionSelect(view).getAttribute('aria-keyshortcuts')).toBe('1 2');
    rightClick(laneBody('music'));
    const menu = openMenu(view);
    expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(7);
    expect(menuCheckboxNames(menu)).toEqual([SNAP_MENU_LABEL]);
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toBe(
      within(menu).getByRole('menuitemcheckbox', { name: SNAP_MENU_LABEL }),
    );
  });

  it('TU2 with a BPM a seconds or bar division refuses the triplet and stays', async () => {
    const { view } = await mountTripletWorkspace();
    commitTempo(view, '90');
    expect(divisionSelect(view).getAttribute('aria-keyshortcuts')).toBe('1 2 3');
    pressDigit('3');
    expect(divisionOf(view)).toBe('1');
    expect(divisionSelect(view).value).toBe('1');
    expect(statusText(view)).toBe(SECONDS_REFUSAL);
    chooseDivision(view, 'bar');
    pressDigit('3');
    expect(divisionOf(view)).toBe('bar');
    expect(statusText(view)).toBe(BAR_REFUSAL);
    expect(optionValues(view)).toEqual([...SECONDS_IDS, ...STRAIGHT_IDS]);
  });

  it('TU3 the 3 key toggles 1/4 to 1/4T and back with the select families', async () => {
    const { view } = await mountQuarterTriplet90();
    expect(Number(gridControl(view).dataset.gridSeconds)).toBeCloseTo(0.4444444444, 9);
    expect(laneBodies(view)).toHaveLength(3);
    for (const body of laneBodies(view)) {
      expect(Number(body.dataset.gridSeconds)).toBeCloseTo(0.4444444444, 9);
    }
    expect(statusText(view)).toBe('Grid: 1/4T · 0.444 s at 90 BPM (Snap off)');
    const select = divisionSelect(view);
    expect(select.value).toBe('1/4T');
    expect(select.options).toHaveLength(12);
    expect(Array.from(select.options).map((option) => option.textContent)).toEqual([
      ...SECONDS_LABELS,
      ...TRIPLET_LABELS,
    ]);
    const groups = select.querySelectorAll('optgroup');
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Triplets · 90 BPM');
    expect(Array.from(groups[0].querySelectorAll('option')).map((o) => o.textContent)).toEqual(
      TRIPLET_LABELS,
    );
    expect(select.title).toBe('Grid 1/4T · 1 — narrower, 2 — wider');
    pressDigit('3');
    expect(divisionOf(view)).toBe('1/4');
    expect(gridControl(view).dataset.gridSeconds).toBe(String(60 / 90));
    expect(statusText(view)).toBe('Grid: 1/4 · 0.667 s at 90 BPM (Snap off)');
    expect(divisionSelect(view).options).toHaveLength(13);
    const straightGroups = divisionSelect(view).querySelectorAll('optgroup');
    expect(straightGroups).toHaveLength(1);
    expect(straightGroups[0].label).toBe('Bars · 90 BPM');
    expect(
      Array.from(straightGroups[0].querySelectorAll('option')).map((o) => o.textContent),
    ).toEqual(STRAIGHT_LABELS);
  });

  it('TU4 drag and ruler snap to triplet lines; Alt keeps the drag free', async () => {
    const { api, view, ruler, clipParts } = await mountQuarterTriplet90();
    pressG();
    expect(gridControl(view).dataset.snap).toBe('on');
    dragClip(clipParts('s1'), (0.95 - 4) * PX_PER_SECOND);
    expect(clipStart(api, 's1')).toBeCloseTo(0.889, 9);
    clickRuler(ruler, 2.9 * PX_PER_SECOND);
    expect(positionOf(api)).toBeCloseTo(3.111, 9);
    dragClip(clipParts('s1'), (1.05 - 0.889) * PX_PER_SECOND, 2, true);
    expect(Math.abs(clipStart(api, 's1') - 1.05)).toBeLessThanOrEqual(0.001);
  });

  it('TU5 the keyboard nudge steps along stored triplet lines', async () => {
    const { api, clipParts } = await mountQuarterTriplet90();
    pressG();
    dragClip(clipParts('s1'), (1.2 - 4) * PX_PER_SECOND);
    expect(clipStart(api, 's1')).toBeCloseTo(1.333, 9);
    act(() => live(api).selectClip('s1'));
    const starts: number[] = [];
    for (const key of [
      'ArrowRight',
      'ArrowRight',
      'ArrowLeft',
      'ArrowLeft',
      'ArrowLeft',
    ] as const) {
      pressArrow(key);
      starts.push(clipStart(api, 's1'));
    }
    [1.778, 2.222, 1.778, 1.333, 0.889].forEach((expected, index) => {
      expect(starts[index]).toBeCloseTo(expected, 9);
    });
  });

  it('TU6 the 1 and 2 keys stay inside the triplet family', async () => {
    const { view } = await mountQuarterTriplet90();
    const narrowed: string[] = [];
    for (let count = 0; count < 3; count++) {
      pressDigit('1');
      narrowed.push(divisionOf(view) ?? '');
    }
    expect(narrowed).toEqual(['1/8T', '1/16T', '1/32T']);
    pressDigit('1');
    expect(divisionOf(view)).toBe('1/32T');
    expect(statusText(view)).toBe('The grid is already at its narrowest — 1/32T (1)');
    const widened: string[] = [];
    for (let count = 0; count < 4; count++) {
      pressDigit('2');
      widened.push(divisionOf(view) ?? '');
    }
    expect(widened).toEqual(['1/16T', '1/8T', '1/4T', '1/2T']);
    pressDigit('2');
    expect(divisionOf(view)).toBe('1/2T');
    expect(statusText(view)).toBe('The grid is already at its widest — 1/2T (2)');
    for (const id of [...narrowed, ...widened]) {
      expect([...SECONDS_IDS, ...STRAIGHT_IDS]).not.toContain(id);
    }
  });

  it('TU7 the lane menu triplet item toggles the mode and closes the menu', async () => {
    const { view, laneBody } = await mountTripletWorkspace();
    commitTempo(view, '90');
    chooseDivision(view, '1/4');
    rightClick(laneBody('music'));
    const menu = openMenu(view);
    expect(within(menu).getAllByRole('menuitemradio')).toHaveLength(13);
    expect(menu.querySelectorAll('hr')).toHaveLength(2);
    expect(menuCheckboxNames(menu)).toEqual([SNAP_MENU_LABEL, TRIPLET_MENU_LABEL]);
    expect(tripletMenuItem(menu).getAttribute('aria-checked')).toBe('false');
    expect(tripletMenuItem(menu).previousElementSibling).toBe(
      within(menu).getByRole('menuitemcheckbox', { name: SNAP_MENU_LABEL }),
    );
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement).toBe(tripletMenuItem(menu));
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(within(menu).getAllByRole('menuitemradio')[0]);
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(tripletMenuItem(menu));
    fireEvent.click(tripletMenuItem(menu));
    expect(divisionOf(view)).toBe('1/4T');
    expect(statusText(view)).toBe('Grid: 1/4T · 0.444 s at 90 BPM (Snap off)');
    expect(gridMenu(view)).toBeNull();
    rightClick(laneBody('music'));
    const reopened = openMenu(view);
    const radios = within(reopened).getAllByRole('menuitemradio');
    expect(radios).toHaveLength(12);
    expect(radios.map((radio) => radio.textContent?.replace('✓', ''))).toEqual([
      ...SECONDS_LABELS,
      ...TRIPLET_LABELS,
    ]);
    expect(radios.filter((radio) => radio.getAttribute('aria-checked') === 'true')).toEqual([
      within(reopened).getByRole('menuitemradio', { name: '1/4T' }),
    ]);
    expect(tripletMenuItem(reopened).getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(reopened, { key: 'End' });
    fireEvent.keyDown(tripletMenuItem(reopened), { key: 'Enter' });
    expect(divisionOf(view)).toBe('1/4');
    expect(gridMenu(view)).toBeNull();
    chooseDivision(view, 'bar');
    rightClick(laneBody('music'));
    fireEvent.click(tripletMenuItem(openMenu(view)));
    expect(divisionOf(view)).toBe('bar');
    expect(statusText(view)).toBe(BAR_REFUSAL);
    expect(gridMenu(view)).toBeNull();
    chooseDivision(view, '1/8');
    rightClick(laneBody('music'));
    const spaceMenu = openMenu(view);
    fireEvent.keyDown(spaceMenu, { key: 'End' });
    fireEvent.keyDown(tripletMenuItem(spaceMenu), { key: ' ' });
    expect(divisionOf(view)).toBe('1/8T');
    expect(gridMenu(view)).toBeNull();
  });

  it('TU8 the focused select takes 3; text fields, repeat, Shift and Alt do not', async () => {
    const { view } = await mountTripletWorkspace();
    commitTempo(view, '90');
    chooseDivision(view, '1/4');
    const select = divisionSelect(view);
    act(() => select.focus());
    expect(fireEvent.keyDown(select, { key: '3', code: 'Digit3' })).toBe(false);
    expect(divisionOf(view)).toBe('1/4T');
    expect(divisionSelect(view).value).toBe('1/4T');
    expect(fireEvent.keyDown(select, { key: '3', code: 'Digit3', repeat: true })).toBe(false);
    expect(divisionOf(view)).toBe('1/4T');
    const input = tempoInput(view);
    act(() => input.focus());
    for (const digit of ['1', '3', '0']) {
      expect(fireEvent.keyDown(input, { key: digit, code: `Digit${digit}` })).toBe(true);
    }
    commitTempo(view, '130');
    expect(statusText(view)).toBe(tempoStatusMessage(130));
    expect(divisionOf(view)).toBe('1/4T');
    expect(Number(gridControl(view).dataset.gridSeconds)).toBeCloseTo(((2 / 3) * 60) / 130, 9);
    pressDigit('3', { repeat: true });
    expect(divisionOf(view)).toBe('1/4T');
    pressDigit('3', { shiftKey: true });
    expect(divisionOf(view)).toBe('1/4T');
    pressDigit('3', { altKey: true });
    expect(divisionOf(view)).toBe('1/4T');
    expect(statusText(view)).toBe(tempoStatusMessage(130));
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    pressDigit('3');
    expect(divisionOf(view)).toBe('1/4T');
    fireEvent.keyDown(divisionSelect(view), { key: '3', code: 'Digit3' });
    expect(divisionOf(view)).toBe('1/4T');
    expect(statusText(view)).toBe(tempoStatusMessage(130));
  });

  it('TU9 toggles write no history; a BPM change re-derives and a clear forgets', async () => {
    const { api, view, clipParts } = await mountTripletWorkspace();
    commitTempo(view, '90');
    const undoBefore = undoTitle(view);
    const before = structuredClone(live(api).arrangement);
    chooseDivision(view, '1/4');
    pressDigit('3');
    pressDigit('1');
    pressDigit('2');
    pressDigit('3');
    pressDigit('3');
    expect(divisionOf(view)).toBe('1/4T');
    expect(undoTitle(view)).toBe(undoBefore);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).arrangement).toEqual(before);
    pressG();
    dragClip(clipParts('s1'), (0.95 - 4) * PX_PER_SECOND);
    expect(clipStart(api, 's1')).toBeCloseTo(0.889, 9);
    commitTempo(view, '120');
    expect(divisionOf(view)).toBe('1/4T');
    expect(Number(gridControl(view).dataset.gridSeconds)).toBeCloseTo(1 / 3, 9);
    expect(clipStart(api, 's1')).toBeCloseTo(0.889, 9);
    commitTempo(view, '');
    expect(statusText(view)).toBe(gridTempoClearedMessage(1));
    expect(divisionSelect(view).options).toHaveLength(7);
    expect(divisionOf(view)).toBe('1');
    commitTempo(view, '90');
    expect(divisionSelect(view).value).toBe('1');
    expect(divisionOf(view)).toBe('1');
    expect(divisionSelect(view).options).toHaveLength(13);
  });

  it('TU10 the brace drag and brace keys move a loop along triplet lines', async () => {
    const { api, brace } = await mountQuarterTriplet90(TRIPLET_LOOP_90);
    pressG();
    dragBraceBody(brace(), 0.9 * PX_PER_SECOND);
    expectLoop(api, 1.778, 2.667);
    act(() => live(api).undo());
    expectLoop(api, 0.889, 1.778);
    pressBraceKey(brace(), 'ArrowRight');
    expectLoop(api, 1.333, 2.222);
    pressBraceKey(brace(), 'ArrowRight');
    expectLoop(api, 1.778, 2.667);
    pressBraceKey(brace(), 'ArrowLeft');
    expectLoop(api, 1.333, 2.222);
  });
});
