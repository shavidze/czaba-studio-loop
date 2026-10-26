import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { adjacentGridDivision } from '../grid';
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

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const MUSIC_LANE_Y = 150;
const KEYS_TITLE_SUFFIX = ' · 1 — narrower, 2 — wider';
const NARROWEST_STATUS = 'The grid is already at its narrowest — 0.1 s (1)';
const WIDEST_STATUS = 'The grid is already at its widest — 10 s (2)';

const keysCollection: WorkspaceCollection = {
  id: 'grid-keys',
  label: 'grid-keys',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'grid-keys', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'grid-keys', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const DEFAULT_CLIPS: ArrangementClip[] = [
  { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 2 },
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 4 },
  { id: 'm2', trackId: 'music', sourceId: 'song', start: 12.5, sourceOffset: 0, duration: 2 },
  { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4.3, sourceOffset: 0, duration: 1 },
];

function keysArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: DEFAULT_CLIPS };
}

interface KeysApiRef {
  current: ArrangementContextValue | null;
}

function KeysProbe({ api }: { api: KeysApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: KeysApiRef): ArrangementContextValue {
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

async function mountGridWorkspace() {
  const api: KeysApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={keysCollection} initialArrangement={keysArrangement()}>
      <StudioWorkspace />
      <KeysProbe api={api} />
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
  return { api, view, clipParts, laneBody };
}

function clipOf(api: KeysApiRef, clipId: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function snapToggle(view: ReturnType<typeof render>): HTMLButtonElement {
  const button = view.getByTestId('arrangement-snap-toggle');
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('snap toggle missing');
  }
  return button;
}

function divisionSelect(view: ReturnType<typeof render>): HTMLSelectElement {
  const select = view.getByTestId('arrangement-grid-division');
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error('division select missing');
  }
  return select;
}

function gridSeconds(view: ReturnType<typeof render>): string | undefined {
  return view.getByTestId('arrangement-grid-control').dataset.gridSeconds;
}

function snapState(view: ReturnType<typeof render>): string | undefined {
  return view.getByTestId('arrangement-grid-control').dataset.snap;
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function focusedElement(): HTMLElement {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) {
    throw new Error('no focused element');
  }
  return element;
}

const press = { button: 0, buttons: 1 };

function clickClipHeader(parts: { root: HTMLElement; header: HTMLElement }, pointerId: number) {
  fireEvent.pointerDown(parts.header, { ...press, pointerId, clientX: 100, clientY: MUSIC_LANE_Y });
  fireEvent.pointerUp(parts.root, { pointerId, clientX: 100, clientY: MUSIC_LANE_Y });
  fireEvent.click(parts.header, { clientX: 100, clientY: MUSIC_LANE_Y });
}

function rightClick(target: HTMLElement, clientX = 300, clientY = 200): boolean {
  fireEvent.pointerDown(target, { button: 2, buttons: 2, pointerId: 9, clientX, clientY });
  return fireEvent.contextMenu(target, { button: 2, clientX, clientY });
}

function pressDigit(
  digit: '1' | '2',
  target: Element = document.body,
  extra: Partial<KeyboardEventInit> = {},
): boolean {
  return fireEvent.keyDown(target, { key: digit, code: `Digit${digit}`, ...extra });
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

describe('SRW-14 stage 4b-2a adjacentGridDivision', () => {
  it('GD1 narrowing walks from 10 s down to 0.1 s and stops with null', () => {
    const walk: number[] = [10];
    let next = adjacentGridDivision(10, 'narrow');
    while (next !== null) {
      walk.push(next);
      next = adjacentGridDivision(next, 'narrow');
    }
    expect(walk).toEqual([10, 5, 2, 1, 0.5, 0.25, 0.1]);
    expect(adjacentGridDivision(0.1, 'narrow')).toBeNull();
  });

  it('GD2 widening walks from 0.1 s up to 10 s; ends and unknown values give null', () => {
    const walk: number[] = [0.1];
    let next = adjacentGridDivision(0.1, 'widen');
    while (next !== null) {
      walk.push(next);
      next = adjacentGridDivision(next, 'widen');
    }
    expect(walk).toEqual([0.1, 0.25, 0.5, 1, 2, 5, 10]);
    expect(adjacentGridDivision(10, 'widen')).toBeNull();
    expect(adjacentGridDivision(0.3, 'narrow')).toBeNull();
    expect(adjacentGridDivision(0.3, 'widen')).toBeNull();
  });
});

describe('SRW-14 stage 4b-2a narrow/widen keys (D-29z24-K)', { timeout: 15_000 }, () => {
  it('GK1 plain 1 narrows the grid to 0.5 s with the Snap-off status and the select hint', async () => {
    const { view } = await mountGridWorkspace();
    expect(gridSeconds(view)).toBe('1');
    expect(pressDigit('1')).toBe(false);
    expect(gridSeconds(view)).toBe('0.5');
    const select = divisionSelect(view);
    expect(select.value).toBe('0.5');
    expect(statusText(view)).toBe('Grid: 0.5 s (Snap off)');
    expect(select.getAttribute('aria-keyshortcuts')).toBe('1 2');
    expect(select.title).toBe(`Grid 0.5 s${KEYS_TITLE_SUFFIX}`);
  });

  it('GK2 plain 2 widens the grid to 2 s', async () => {
    const { view } = await mountGridWorkspace();
    expect(pressDigit('2')).toBe(false);
    expect(gridSeconds(view)).toBe('2');
    expect(divisionSelect(view).value).toBe('2');
  });

  it('GK3 at the narrowest and widest division the keys stay and report the end', async () => {
    const { view } = await mountGridWorkspace();
    fireEvent.change(divisionSelect(view), { target: { value: '0.25' } });
    expect(pressDigit('1')).toBe(false);
    expect(gridSeconds(view)).toBe('0.1');
    expect(pressDigit('1')).toBe(false);
    expect(gridSeconds(view)).toBe('0.1');
    expect(statusText(view)).toBe(NARROWEST_STATUS);
    fireEvent.change(divisionSelect(view), { target: { value: '5' } });
    expect(pressDigit('2')).toBe(false);
    expect(gridSeconds(view)).toBe('10');
    expect(pressDigit('2')).toBe(false);
    expect(gridSeconds(view)).toBe('10');
    expect(statusText(view)).toBe(WIDEST_STATUS);
  });

  it('GK4 Ctrl, Meta, Alt and Shift digits change nothing; Ctrl and Meta keep the browser default', async () => {
    const { view } = await mountGridWorkspace();
    expect(pressDigit('1', document.body, { ctrlKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    expect(pressDigit('1', document.body, { metaKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    expect(pressDigit('1', document.body, { altKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    expect(fireEvent.keyDown(document.body, { key: '!', code: 'Digit1', shiftKey: true })).toBe(
      true,
    );
    expect(gridSeconds(view)).toBe('1');
    expect(pressDigit('2', document.body, { ctrlKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
  });

  it('GK5 a 1 typed in the library search or pressed with Export open changes nothing', async () => {
    const { view } = await mountGridWorkspace();
    const search = view.getByLabelText('Search the library');
    act(() => search.focus());
    expect(focusedElement()).toBe(search);
    expect(pressDigit('1', search)).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    act(() => search.blur());
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    pressDigit('1');
    expect(gridSeconds(view)).toBe('1');
  });

  it('GK6 an auto-repeated 1 does not step the grid', async () => {
    const { view } = await mountGridWorkspace();
    pressDigit('1', document.body, { repeat: true });
    expect(gridSeconds(view)).toBe('1');
  });

  it('GK7 after 1 with Snap on, ArrowRight nudges a whole-second clip by the new 0.5 s grid', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    fireEvent.click(snapToggle(view));
    expect(snapState(view)).toBe('on');
    clickClipHeader(clipParts('m1'), 3);
    expect(live(api).selectedClipIds).toEqual(['m1']);
    expect(clipOf(api, 'm1').start).toBe(7);
    pressDigit('1');
    expect(gridSeconds(view)).toBe('0.5');
    fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(clipOf(api, 'm1').start).toBe(7.5);
  });

  it('GK8 with Snap on from G, 1 narrows and Snap stays on', async () => {
    const { view } = await mountGridWorkspace();
    fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
    expect(snapState(view)).toBe('on');
    pressDigit('1');
    expect(gridSeconds(view)).toBe('0.5');
    expect(snapState(view)).toBe('on');
    expect(statusText(view)).toBe('Grid: 0.5 s (Snap on)');
  });

  it('GK9 C-R59-01 1 and 2 on the focused division select step the grid instead of type-ahead', async () => {
    const { view } = await mountGridWorkspace();
    const select = divisionSelect(view);
    act(() => select.focus());
    expect(focusedElement()).toBe(select);
    expect(pressDigit('1', select)).toBe(false);
    expect(gridSeconds(view)).toBe('0.5');
    expect(select.value).toBe('0.5');
    expect(statusText(view)).toBe('Grid: 0.5 s (Snap off)');
    expect(focusedElement()).toBe(select);
    expect(pressDigit('2', select)).toBe(false);
    expect(gridSeconds(view)).toBe('1');
    expect(select.value).toBe('1');
    expect(focusedElement()).toBe(select);
  });

  it('GK10 a 1 inside the open grid menu changes nothing and the menu stays open', async () => {
    const { view, laneBody } = await mountGridWorkspace();
    rightClick(laneBody('music'));
    const menu = view.getByTestId('arrangement-grid-menu');
    const item = focusedElement();
    expect(menu.contains(item)).toBe(true);
    pressDigit('1', item);
    expect(gridSeconds(view)).toBe('1');
    expect(view.queryByTestId('arrangement-grid-menu')).not.toBeNull();
  });

  it('GK11 the focused select ignores modified, repeated and other digits, stops at the end and yields to Export', async () => {
    const { view } = await mountGridWorkspace();
    const select = divisionSelect(view);
    act(() => select.focus());
    expect(focusedElement()).toBe(select);
    expect(pressDigit('1', select, { ctrlKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    expect(pressDigit('1', select, { metaKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    expect(pressDigit('1', select, { altKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    expect(fireEvent.keyDown(select, { key: '!', code: 'Digit1', shiftKey: true })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    expect(pressDigit('1', select, { repeat: true })).toBe(false);
    expect(gridSeconds(view)).toBe('1');
    expect(fireEvent.keyDown(select, { key: '5', code: 'Digit5' })).toBe(true);
    expect(gridSeconds(view)).toBe('1');
    fireEvent.change(select, { target: { value: '0.1' } });
    expect(gridSeconds(view)).toBe('0.1');
    expect(pressDigit('1', select)).toBe(false);
    expect(gridSeconds(view)).toBe('0.1');
    expect(statusText(view)).toBe(NARROWEST_STATUS);
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getByRole('dialog')).toBeTruthy();
    expect(pressDigit('1', select)).toBe(true);
    expect(gridSeconds(view)).toBe('0.1');
  });
});
