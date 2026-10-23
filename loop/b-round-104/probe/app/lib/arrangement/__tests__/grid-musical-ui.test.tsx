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
const SECONDS_LABELS = ['10 წმ', '5 წმ', '2 წმ', '1 წმ', '0.5 წმ', '0.25 წმ', '0.1 წმ'];
const MUSICAL_LABELS = ['1 ტაქტი', '1/2', '1/4', '1/8', '1/16', '1/32'];
const SECONDS_IDS = ['10', '5', '2', '1', '0.5', '0.25', '0.1'];

const musicalCollection: WorkspaceCollection = {
  id: 'grid',
  label: 'grid',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'grid', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'grid', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const MUSICAL_CLIPS: ArrangementClip[] = [
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 8 },
  { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function musicalArrangement(
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

interface MusicalApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function MusicalProbe({ api }: { api: MusicalApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: MusicalApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: MusicalApiRef): number {
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

async function mountMusicalWorkspace(loop: ArrangementLoop | null = null) {
  const api: MusicalApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider
      collection={musicalCollection}
      initialArrangement={musicalArrangement(MUSICAL_CLIPS, loop)}
    >
      <StudioWorkspace />
      <MusicalProbe api={api} />
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

type MusicalView = Awaited<ReturnType<typeof mountMusicalWorkspace>>['view'];

function clipStart(api: MusicalApiRef, clipId: string): number {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip.start;
}

function tempoInput(view: MusicalView): HTMLInputElement {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  return input;
}

function commitTempo(view: MusicalView, text: string) {
  const input = tempoInput(view);
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function divisionSelect(view: MusicalView): HTMLSelectElement {
  const select = view.getByTestId('arrangement-grid-division');
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error('division select missing');
  }
  return select;
}

function chooseDivision(view: MusicalView, value: string) {
  fireEvent.change(divisionSelect(view), { target: { value } });
}

function optionValues(view: MusicalView): string[] {
  return Array.from(divisionSelect(view).options).map((option) => option.value);
}

function gridControl(view: MusicalView): HTMLElement {
  return view.getByTestId('arrangement-grid-control');
}

function statusText(view: MusicalView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function laneBodies(view: MusicalView): HTMLElement[] {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-track-id] [data-grid-lines]'),
  );
}

function undoTitle(view: MusicalView): string {
  const button = view.container.querySelector<HTMLButtonElement>('button[title^="Undo"]');
  if (!button) {
    throw new Error('undo button missing');
  }
  return button.title;
}

function gridMenu(view: MusicalView): HTMLElement | null {
  return view.queryByTestId('arrangement-grid-menu');
}

function openMenu(view: MusicalView): HTMLElement {
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

const press = { button: 0, buttons: 1 };

function dragClip(parts: { root: HTMLElement; header: HTMLElement }, dx: number, pointerId = 1) {
  fireEvent.pointerDown(parts.header, { ...press, pointerId, clientX: 100, clientY: SFX_LANE_Y });
  fireEvent.pointerMove(parts.root, { pointerId, clientX: 100 + dx, clientY: SFX_LANE_Y });
  fireEvent.pointerUp(parts.root, { pointerId, clientX: 100 + dx, clientY: SFX_LANE_Y });
}

function clickRuler(ruler: HTMLElement, x: number) {
  fireEvent.pointerDown(ruler, { ...press, pointerId: 1, clientX: x, clientY: RULER_Y });
  fireEvent.pointerUp(ruler, { pointerId: 1, clientX: x, clientY: RULER_Y });
}

function pressG() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function pressDigit(digit: '1' | '2') {
  fireEvent.keyDown(document.body, { key: digit, code: `Digit${digit}` });
}

function pressArrow(key: 'ArrowLeft' | 'ArrowRight') {
  fireEvent.keyDown(document.body, { key, code: key });
}

const BRACE_X = 200;

function dragBraceBody(element: HTMLElement, dx: number, altKey = false) {
  fireEvent.pointerDown(element, { ...press, pointerId: 3, clientX: BRACE_X, clientY: 30, altKey });
  fireEvent.pointerMove(element, { pointerId: 3, clientX: BRACE_X + dx, clientY: 30, altKey });
  fireEvent.pointerUp(element, { pointerId: 3, clientX: BRACE_X + dx, clientY: 30, altKey });
}

function pressBraceKey(element: HTMLElement, key: 'ArrowLeft' | 'ArrowRight', shiftKey = false) {
  fireEvent.keyDown(element, { key, code: key, shiftKey });
}

function loopOf(api: MusicalApiRef): ArrangementLoop {
  const loop = live(api).arrangement.loop;
  if (!loop) {
    throw new Error('loop missing');
  }
  return loop;
}

function expectLoop(api: MusicalApiRef, start: number, end: number) {
  const loop = loopOf(api);
  expect(loop.start).toBeCloseTo(start, 9);
  expect(loop.end).toBeCloseTo(end, 9);
}

const GRID_LOOP_90: ArrangementLoop = { start: 1.333, end: 2.667, enabled: true };

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

describe('SRW-14 stage 5a musical grid in the workspace (D-29z32)', { timeout: 15_000 }, () => {
  it('GU1 without a BPM offers only the seconds divisions', async () => {
    const { view, laneBody } = await mountMusicalWorkspace();
    const select = divisionSelect(view);
    expect(optionValues(view)).toEqual(SECONDS_IDS);
    expect(Array.from(select.options).map((option) => option.textContent)).toEqual(SECONDS_LABELS);
    expect(select.querySelector('optgroup')).toBeNull();
    expect(gridControl(view).dataset.gridDivision).toBe('1');
    rightClick(laneBody('music'));
    expect(within(openMenu(view)).getAllByRole('menuitemradio')).toHaveLength(7);
  });

  it('GU2 a BPM adds the musical group without switching; choosing 1/4 at 120 sets 0.5 s', async () => {
    const { view } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    const select = divisionSelect(view);
    expect(select.options).toHaveLength(13);
    const groups = select.querySelectorAll('optgroup');
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('ტაქტები · 120 BPM');
    expect(Array.from(groups[0].querySelectorAll('option')).map((o) => o.textContent)).toEqual(
      MUSICAL_LABELS,
    );
    expect(optionValues(view)).toEqual([
      ...SECONDS_IDS,
      'bar',
      '1/2',
      '1/4',
      '1/8',
      '1/16',
      '1/32',
    ]);
    expect(select.value).toBe('1');
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
    chooseDivision(view, '1/4');
    expect(gridControl(view).dataset.gridDivision).toBe('1/4');
    expect(gridControl(view).dataset.gridSeconds).toBe('0.5');
    expect(laneBodies(view)).toHaveLength(3);
    for (const body of laneBodies(view)) {
      expect(body.dataset.gridSeconds).toBe('0.5');
    }
    expect(statusText(view)).toBe('ბადე: 1/4 · 0.5 წმ 120 BPM-ზე (Snap გამორთულია)');
    expect(divisionSelect(view).value).toBe('1/4');
    expect(divisionSelect(view).title).toBe('ბადე 1/4 · 1 — უფრო მჭიდრო, 2 — უფრო ფართო');
  });

  it('GU3 R14-G1 Snap on, 1/4 at 120: a clip drag lands on 0.5 s multiples', async () => {
    const { api, view, clipParts } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    chooseDivision(view, '1/4');
    pressG();
    dragClip(clipParts('s1'), 1.3 * PX_PER_SECOND);
    expect(clipStart(api, 's1')).toBeCloseTo(5.5, 9);
    dragClip(clipParts('s1'), -0.74 * PX_PER_SECOND, 2);
    expect(clipStart(api, 's1')).toBeCloseTo(5, 9);
  });

  it('GU4 90 BPM 1/4: a drag and a ruler click land on 2/3 s lines', async () => {
    const { api, view, ruler, clipParts } = await mountMusicalWorkspace();
    commitTempo(view, '90');
    chooseDivision(view, '1/4');
    pressG();
    dragClip(clipParts('s1'), 0.9 * PX_PER_SECOND);
    expect(clipStart(api, 's1')).toBeCloseTo(4.667, 9);
    clickRuler(ruler, Math.round(6.1 * PX_PER_SECOND));
    expect(positionOf(api)).toBeCloseTo(6, 9);
  });

  it('GU5 90 BPM 1/4: the keyboard nudge steps line by line and never sticks', async () => {
    const { api, view } = await mountMusicalWorkspace();
    commitTempo(view, '90');
    chooseDivision(view, '1/4');
    pressG();
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
    [4.667, 5.333, 4.667, 4, 3.333].forEach((expected, index) => {
      expect(starts[index]).toBeCloseTo(expected, 9);
    });
  });

  it('GU6 a BPM change re-derives the musical step and moves no clip', async () => {
    const { api, view } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    chooseDivision(view, '1/4');
    const before = structuredClone(live(api).arrangement);
    commitTempo(view, '60');
    expect(gridControl(view).dataset.gridSeconds).toBe('1');
    expect(divisionSelect(view).value).toBe('1/4');
    expect(gridControl(view).dataset.gridDivision).toBe('1/4');
    expect(statusText(view)).toBe(tempoStatusMessage(60));
    expect(live(api).arrangement).toEqual(before);
  });

  it('GU7 clearing the BPM returns to the last seconds division and keeps it', async () => {
    const { view } = await mountMusicalWorkspace();
    chooseDivision(view, '0.5');
    commitTempo(view, '90');
    chooseDivision(view, '1/4');
    commitTempo(view, '');
    expect(statusText(view)).toBe(
      'ტემპი წაიშალა — ტაქტების სახაზავი დამალულია. აუდიო არ შეცვლილა. ბადე დაბრუნდა წამებზე: 0.5 წმ.',
    );
    expect(divisionSelect(view).options).toHaveLength(7);
    expect(divisionSelect(view).value).toBe('0.5');
    expect(gridControl(view).dataset.gridDivision).toBe('0.5');
    expect(gridControl(view).dataset.gridSeconds).toBe('0.5');
    commitTempo(view, '90');
    expect(divisionSelect(view).value).toBe('0.5');
    expect(gridControl(view).dataset.gridDivision).toBe('0.5');
    chooseDivision(view, '1/4');
    chooseDivision(view, '0.25');
    expect(gridControl(view).dataset.gridDivision).toBe('0.25');
    expect(gridControl(view).dataset.gridSeconds).toBe('0.25');
    commitTempo(view, '');
    expect(statusText(view)).toBe(tempoStatusMessage(null));
    expect(divisionSelect(view).options).toHaveLength(7);
    expect(divisionSelect(view).value).toBe('0.25');
  });

  it('GU8 the 1 and 2 keys step within the musical list', async () => {
    const { view } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    chooseDivision(view, '1/4');
    const seen: string[] = [];
    const narrowStatuses: (string | null)[] = [];
    for (let count = 0; count < 3; count++) {
      pressDigit('1');
      seen.push(gridControl(view).dataset.gridDivision ?? '');
      narrowStatuses.push(statusText(view));
    }
    expect(seen).toEqual(['1/8', '1/16', '1/32']);
    expect(narrowStatuses).toEqual([
      'ბადე: 1/8 · 0.25 წმ 120 BPM-ზე (Snap გამორთულია)',
      'ბადე: 1/16 · 0.125 წმ 120 BPM-ზე (Snap გამორთულია)',
      'ბადე: 1/32 · 0.063 წმ 120 BPM-ზე (Snap გამორთულია)',
    ]);
    pressDigit('1');
    expect(gridControl(view).dataset.gridDivision).toBe('1/32');
    expect(statusText(view)).toBe('ბადე უკვე ყველაზე მჭიდროა — 1/32 (1)');
    const widened: string[] = [];
    for (let count = 0; count < 5; count++) {
      pressDigit('2');
      widened.push(gridControl(view).dataset.gridDivision ?? '');
    }
    expect(widened).toEqual(['1/16', '1/8', '1/4', '1/2', 'bar']);
    pressDigit('2');
    expect(gridControl(view).dataset.gridDivision).toBe('bar');
    expect(statusText(view)).toBe('ბადე უკვე ყველაზე ფართოა — 1 ტაქტი (2)');
    for (const id of [...seen, ...widened]) {
      expect(SECONDS_IDS).not.toContain(id);
    }
  });

  it('GU9 the lane menu lists both families with a separator and chooses 1/8', async () => {
    const { view, laneBody } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    rightClick(laneBody('music'));
    const menu = openMenu(view);
    const radios = within(menu).getAllByRole('menuitemradio');
    expect(radios).toHaveLength(13);
    [...SECONDS_LABELS, ...MUSICAL_LABELS].forEach((label, index) => {
      expect(radios[index]).toBe(within(menu).getByRole('menuitemradio', { name: label }));
    });
    expect(menu.querySelectorAll('hr')).toHaveLength(2);
    const familySeparator = radios[6].nextElementSibling;
    expect(familySeparator?.tagName).toBe('HR');
    expect(radios[7].previousElementSibling).toBe(familySeparator);
    expect(radios.filter((radio) => radio.getAttribute('aria-checked') === 'true')).toEqual([
      radios[3],
    ]);
    fireEvent.click(within(menu).getByRole('menuitemradio', { name: '1/8' }));
    expect(gridControl(view).dataset.gridDivision).toBe('1/8');
    expect(statusText(view)).toBe('ბადე: 1/8 · 0.25 წმ 120 BPM-ზე (Snap გამორთულია)');
    expect(gridMenu(view)).toBeNull();
    rightClick(laneBody('music'));
    const reopened = within(openMenu(view)).getAllByRole('menuitemradio');
    expect(reopened.filter((radio) => radio.getAttribute('aria-checked') === 'true')).toEqual([
      reopened[10],
    ]);
  });

  it('GU10 Snap on names the musical division', async () => {
    const { view } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    chooseDivision(view, '1/4');
    pressG();
    expect(statusText(view)).toBe('Snap ჩართულია — ბადე 1/4 (G)');
  });

  it('GU11 choosing and stepping a musical division writes no history', async () => {
    const { api, view } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    const undoBefore = undoTitle(view);
    const before = structuredClone(live(api).arrangement);
    chooseDivision(view, '1/4');
    pressDigit('1');
    pressDigit('2');
    pressDigit('2');
    expect(gridControl(view).dataset.gridDivision).toBe('1/2');
    expect(undoTitle(view)).toBe(undoBefore);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).arrangement).toEqual(before);
  });

  it('GU12 a Snap-on nudge from an off-line start reaches the nearest stored line', async () => {
    const { api, view, clipParts } = await mountMusicalWorkspace();
    commitTempo(view, '120');
    dragClip(clipParts('s1'), (0.187 - 4) * PX_PER_SECOND);
    expect(clipStart(api, 's1')).toBeCloseTo(0.187, 9);
    chooseDivision(view, '1/32');
    pressG();
    act(() => live(api).selectClip('s1'));
    const starts: number[] = [];
    for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowLeft'] as const) {
      pressArrow(key);
      starts.push(clipStart(api, 's1'));
    }
    [0.188, 0.25, 0.188, 0.125].forEach((expected, index) => {
      expect(starts[index]).toBeCloseTo(expected, 9);
    });
  });

  it('GU13 a brace body drag keeps the loop length in grid lines; Alt keeps it in ms', async () => {
    const { api, view, brace } = await mountMusicalWorkspace(GRID_LOOP_90);
    commitTempo(view, '90');
    chooseDivision(view, '1/4');
    pressG();
    dragBraceBody(brace(), 0.9 * PX_PER_SECOND);
    expectLoop(api, 2, 3.333);
    dragBraceBody(brace(), 0.7 * PX_PER_SECOND, true);
    expectLoop(api, 2.7, 4.033);
    act(() => live(api).undo());
    expectLoop(api, 2, 3.333);
    dragBraceBody(brace(), -0.667 * PX_PER_SECOND, true);
    expectLoop(api, 1.333, 2.666);
  });

  it('GU14 brace arrow keys move the loop by grid lines and keep its line length', async () => {
    const { api, view, brace } = await mountMusicalWorkspace(GRID_LOOP_90);
    commitTempo(view, '90');
    chooseDivision(view, '1/4');
    pressG();
    pressBraceKey(brace(), 'ArrowRight');
    expectLoop(api, 2, 3.333);
    expect(statusText(view)).toBe('Loop: 00:02.000 — 00:03.333.');
    pressBraceKey(brace(), 'ArrowRight');
    expectLoop(api, 2.667, 4);
    pressBraceKey(brace(), 'ArrowLeft');
    expectLoop(api, 2, 3.333);
    pressBraceKey(brace(), 'ArrowRight', true);
    expectLoop(api, 2, 4);
    pressG();
    pressBraceKey(brace(), 'ArrowRight');
    expectLoop(api, 2.1, 4.1);
  });
});
