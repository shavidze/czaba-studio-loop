import { act, fireEvent, render, within } from '@testing-library/react';
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
import { STUDIO_SHORTCUT_GROUPS } from '../shortcuts';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

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
  currentTime = 0;
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

const sheetCollection: WorkspaceCollection = {
  id: 'sheet',
  label: 'sheet',
  origin: 'demo',
  sources: [{ id: 'song', title: 'Song', collectionLabel: 'sheet', kind: 'music', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function sheetArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 4 },
      {
        id: 'music-2',
        trackId: 'music',
        sourceId: 'song',
        start: 10,
        sourceOffset: 0,
        duration: 4,
      },
    ],
    loop: null,
  };
}

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 80;
const press = { button: 0, buttons: 1 };

interface SheetApiRef {
  current: ArrangementContextValue | null;
}

function SheetProbe({ api }: { api: SheetApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: SheetApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function stubCapture(element: Element) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountSheetWorkspace() {
  const api: SheetApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={sheetCollection} initialArrangement={sheetArrangement()}>
      <StudioWorkspace />
      <SheetProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  const rowTops = new Map<string, number>();
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    rowTops.set(row.dataset.trackId ?? '', top);
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const laneY = (trackId: string) => {
    const top = rowTops.get(trackId);
    if (top === undefined) {
      throw new Error(`lane ${trackId} not rendered`);
    }
    return top + LANE_HEIGHT_PX / 2;
  };
  const clipParts = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header };
  };
  return { api, view, laneY, clipParts };
}

beforeEach(() => {
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

const SHEET_NAME = 'Keyboard shortcuts';
const FOOTER_NAME = 'Keyboard shortcuts (?)';
const QUESTION = { key: '?', code: 'Slash', shiftKey: true };

type SheetView = Awaited<ReturnType<typeof mountSheetWorkspace>>['view'];

function sheet(view: SheetView): HTMLElement | null {
  return view.queryByRole('dialog', { name: SHEET_NAME });
}

function footerButton(view: SheetView): HTMLElement {
  return view.getByRole('button', { name: FOOTER_NAME });
}

function sheetSearch(view: SheetView): HTMLInputElement {
  const dialog = sheet(view);
  if (!dialog) {
    throw new Error('sheet not open');
  }
  const input = within(dialog).getByRole('searchbox', { name: 'Search shortcuts' });
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('search missing');
  }
  return input;
}

function sheetClose(view: SheetView): HTMLElement {
  const dialog = sheet(view);
  if (!dialog) {
    throw new Error('sheet not open');
  }
  return within(dialog).getByRole('button', { name: 'Close (Esc)' });
}

function pressQuestion(target: Element, init: Partial<KeyboardEventInit> = {}): boolean {
  return fireEvent.keyDown(target, { ...QUESTION, ...init });
}

function openFromBody(view: SheetView) {
  act(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  pressQuestion(document.body);
  expect(sheet(view)).toBeTruthy();
}

function shortcutRow(dialog: HTMLElement, id: string): HTMLElement | null {
  return dialog.querySelector<HTMLElement>(`[data-shortcut-id="${id}"]`);
}

function rowKeys(row: HTMLElement): string[] {
  return Array.from(row.querySelectorAll('kbd')).map((kbd) => kbd.textContent ?? '');
}

describe('CALM-1a keyboard shortcut sheet in the real StudioWorkspace', { timeout: 20_000 }, () => {
  it('SS1: the permanent shortcut line is gone and the footer button names the sheet', async () => {
    const { view } = await mountSheetWorkspace();
    expect(view.queryByTestId('arrangement-shortcut-hint')).toBeNull();
    const button = footerButton(view);
    expect(button.textContent).toBe('Shortcuts?');
    expect(button.getAttribute('aria-keyshortcuts')).toBe('Shift+/');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('title')).toBe(FOOTER_NAME);
  });

  it('SS2: ? opens the sheet with focus in search, Esc closes it and focus returns to the opener or the footer button', async () => {
    const { view } = await mountSheetWorkspace();
    openFromBody(view);
    const dialog = sheet(view);
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(sheetSearch(view));
    expect(footerButton(view).getAttribute('aria-expanded')).toBe('true');
    expect(fireEvent.keyDown(sheetSearch(view), { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(sheet(view)).toBeNull();
    expect(document.activeElement).toBe(footerButton(view));

    const snap = view.getByTestId('arrangement-snap-toggle');
    act(() => snap.focus());
    pressQuestion(snap);
    expect(sheet(view)).toBeTruthy();
    const closeFromSnap = sheetClose(view);
    act(() => closeFromSnap.focus());
    expect(fireEvent.keyDown(closeFromSnap, { key: 'Escape', code: 'Escape' })).toBe(false);
    expect(sheet(view)).toBeNull();
    expect(document.activeElement).toBe(snap);

    const button = footerButton(view);
    act(() => button.focus());
    pressQuestion(button);
    expect(sheet(view)).toBeTruthy();
    fireEvent.keyDown(sheetSearch(view), { key: 'Escape', code: 'Escape' });
    expect(sheet(view)).toBeNull();
    expect(document.activeElement).toBe(button);

    fireEvent.click(footerButton(view));
    expect(sheet(view)).toBeTruthy();
    expect(document.activeElement).toBe(sheetSearch(view));
  });

  it('SS3: ? is left alone in text fields, in Export, with modifiers, in a menu, during a gesture, and a held ? opens once', async () => {
    const { api, view, laneY, clipParts } = await mountSheetWorkspace();
    const expectTyped = (target: HTMLElement) => {
      act(() => target.focus());
      expect(pressQuestion(target)).toBe(true);
      expect(sheet(view)).toBeNull();
      expect(document.activeElement).toBe(target);
    };
    expectTyped(view.getByRole('searchbox', { name: 'Search the library' }));
    expectTyped(view.getByTestId('arrangement-tempo-input'));
    act(() => live(api).selectClips(['music-1']));
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    expectTyped(view.getByTestId('arrangement-detail-clip-gain-input'));
    act(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    fireEvent.keyDown(document.body, { key: 'm', code: 'KeyM' });
    expectTyped(view.getByTestId('arrangement-marker-name-input'));
    fireEvent.keyDown(view.getByTestId('arrangement-marker-name-input'), {
      key: 'Escape',
      code: 'Escape',
    });

    for (const modifier of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
      expect(pressQuestion(document.body, modifier)).toBe(true);
      expect(sheet(view)).toBeNull();
    }

    expect(pressQuestion(document.body, { repeat: true })).toBe(true);
    expect(sheet(view)).toBeNull();

    const laneBody = view.container.querySelector<HTMLElement>(
      '[data-track-id="music"] [data-grid-seconds]',
    );
    if (!laneBody) {
      throw new Error('lane body missing');
    }
    fireEvent.pointerDown(laneBody, {
      button: 2,
      buttons: 2,
      pointerId: 9,
      clientX: 300,
      clientY: 120,
    });
    fireEvent.contextMenu(laneBody, { button: 2, clientX: 300, clientY: 120 });
    const menu = view.getByRole('menu');
    const item = within(menu).getAllByRole('menuitemradio')[0] ?? menu;
    expect(pressQuestion(item)).toBe(true);
    expect(sheet(view)).toBeNull();
    fireEvent.keyDown(item, { key: 'Escape', code: 'Escape' });

    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, {
      ...press,
      pointerId: 7,
      clientX: 100,
      clientY: laneY('music'),
    });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: laneY('stems') });
    expect(live(api).isPointerGestureActive()).toBe(true);
    expect(pressQuestion(document.body)).toBe(true);
    expect(sheet(view)).toBeNull();
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 140, clientY: laneY('stems') });

    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    expect(view.getAllByRole('dialog')).toHaveLength(1);
    expect(pressQuestion(document.body)).toBe(true);
    expect(sheet(view)).toBeNull();
  });

  it('SS3 held key: a held ? (first press plus 3 auto-repeats) opens the sheet once and leaves it open', async () => {
    const { view } = await mountSheetWorkspace();
    openFromBody(view);
    for (let index = 0; index < 3; index += 1) {
      pressQuestion(document.body, { repeat: true });
      expect(sheet(view)).toBeTruthy();
    }
    expect(pressQuestion(sheetSearch(view), { repeat: true })).toBe(false);
    expect(sheet(view)).toBeTruthy();
    expect(pressQuestion(sheetSearch(view))).toBe(true);
  });

  it('SS4: the key and the code paths both open the sheet; a plain slash does not', async () => {
    const { view } = await mountSheetWorkspace();
    expect(pressQuestion(document.body, { key: '_', code: 'Slash', shiftKey: true })).toBe(false);
    expect(sheet(view)).toBeTruthy();
    fireEvent.keyDown(sheetSearch(view), { key: 'Escape', code: 'Escape' });
    expect(pressQuestion(document.body, { key: '?', code: 'Minus', shiftKey: true })).toBe(false);
    expect(sheet(view)).toBeTruthy();
    fireEvent.keyDown(sheetSearch(view), { key: 'Escape', code: 'Escape' });
    expect(pressQuestion(document.body, { key: '/', code: 'Slash', shiftKey: false })).toBe(true);
    expect(sheet(view)).toBeNull();
  });

  it('SS5: with the sheet open Studio keys do nothing; ? on Close closes, ? in search types', async () => {
    const { api, view } = await mountSheetWorkspace();
    act(() => live(api).selectClips(['music-2']));
    fireEvent.keyDown(document.body, { key: 'Delete', code: 'Delete' });
    expect(live(api).arrangement.clips).toHaveLength(1);
    const undoBefore = live(api).undoLabel;
    expect(undoBefore).not.toBeNull();
    act(() => live(api).selectClips(['music-1']));
    const snapBefore = view.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed');
    const markersBefore = live(api).arrangement.markers?.length ?? 0;
    openFromBody(view);
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    expect(live(api).isPlaying).toBe(false);
    fireEvent.keyDown(document.body, { key: 'Delete', code: 'Delete' });
    expect(live(api).arrangement.clips).toHaveLength(1);
    fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    expect(live(api).undoLabel).toBe(undoBefore);
    expect(live(api).arrangement.clips).toHaveLength(1);
    fireEvent.keyDown(document.body, { key: 'm', code: 'KeyM' });
    expect(live(api).arrangement.markers?.length ?? 0).toBe(markersBefore);
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
    expect(view.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed')).toBe(
      snapBefore,
    );
    expect(sheet(view)).toBeTruthy();

    expect(pressQuestion(sheetSearch(view))).toBe(true);
    expect(sheet(view)).toBeTruthy();
    const close = sheetClose(view);
    act(() => close.focus());
    expect(fireEvent.keyUp(close, { key: ' ', code: 'Space' })).toBe(true);
    expect(sheet(view)).toBeTruthy();
    expect(pressQuestion(close)).toBe(false);
    expect(sheet(view)).toBeNull();

    fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
    expect(view.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed')).not.toBe(
      snapBefore,
    );
  });

  it('SS6: Tab and Shift+Tab wrap inside the sheet', async () => {
    const { view } = await mountSheetWorkspace();
    openFromBody(view);
    const dialog = sheet(view);
    if (!dialog) {
      throw new Error('sheet not open');
    }
    const close = sheetClose(view);
    const search = sheetSearch(view);
    act(() => search.focus());
    expect(fireEvent.keyDown(search, { key: 'Tab', code: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(close);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(fireEvent.keyDown(close, { key: 'Tab', code: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(search);
    expect(dialog.contains(document.activeElement)).toBe(true);
    act(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    expect(fireEvent.keyDown(document.body, { key: 'Tab', code: 'Tab' })).toBe(false);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('SS7: search filters the rows and says when nothing matches', async () => {
    const { view } = await mountSheetWorkspace();
    openFromBody(view);
    const dialog = sheet(view);
    if (!dialog) {
      throw new Error('sheet not open');
    }
    expect(dialog.querySelectorAll('[data-shortcut-id]').length).toBe(
      STUDIO_SHORTCUT_GROUPS.reduce((total, group) => total + group.rows.length, 0),
    );
    fireEvent.change(sheetSearch(view), { target: { value: 'split' } });
    const split = shortcutRow(dialog, 'split');
    expect(split && rowKeys(split)).toEqual(['Ctrl+E']);
    fireEvent.change(sheetSearch(view), { target: { value: 'cut' } });
    const cutKeys = Array.from(dialog.querySelectorAll<HTMLElement>('[data-shortcut-id]')).flatMap(
      rowKeys,
    );
    expect(cutKeys).toContain('Ctrl+X');
    expect(cutKeys).toContain('Ctrl+Shift+X');
    fireEvent.change(sheetSearch(view), { target: { value: 'zzzz' } });
    expect(dialog.querySelectorAll('[data-shortcut-id]')).toHaveLength(0);
    expect(within(dialog).getByText('Nothing matches “zzzz”.')).toBeTruthy();
  });

  it('SS8: the contextual slot shows the lane-move hint during a drag, the selected clip after, and the button throughout', async () => {
    const { api, view, laneY, clipParts } = await mountSheetWorkspace();
    expect(view.getByTestId('arrangement-selected-clip-reserve')).toBeTruthy();
    expect(footerButton(view)).toBeTruthy();
    const music = clipParts('music-1');
    fireEvent.pointerDown(music.header, {
      ...press,
      pointerId: 7,
      clientX: 100,
      clientY: laneY('music'),
    });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: laneY('stems') });
    expect(live(api).clipLaneDrag).not.toBeNull();
    expect(view.getByTestId('arrangement-lane-move-hint')).toBeTruthy();
    expect(view.queryByTestId('arrangement-selected-clip')).toBeNull();
    expect(view.queryByTestId('arrangement-selected-clip-reserve')).toBeNull();
    expect(footerButton(view)).toBeTruthy();
    fireEvent.pointerUp(music.root, { pointerId: 7, clientX: 140, clientY: laneY('stems') });
    expect(view.queryByTestId('arrangement-lane-move-hint')).toBeNull();
    expect(view.getByTestId('arrangement-selected-clip')).toBeTruthy();
    expect(footerButton(view)).toBeTruthy();
    act(() => live(api).selectClips([]));
    expect(view.getByTestId('arrangement-selected-clip-reserve')).toBeTruthy();
  });

  it('SS9: every button name and the search box are unique inside the sheet', async () => {
    const { view } = await mountSheetWorkspace();
    openFromBody(view);
    const dialog = sheet(view);
    if (!dialog) {
      throw new Error('sheet not open');
    }
    const buttons = within(dialog).getAllByRole('button');
    for (const button of buttons) {
      const name = button.getAttribute('aria-label') ?? button.textContent ?? '';
      expect(within(dialog).getAllByRole('button', { name }), name).toHaveLength(1);
    }
    expect(within(dialog).getAllByRole('searchbox')).toHaveLength(1);
  });

  it('SS10: a backdrop click closes the sheet and focus returns to the opener', async () => {
    const { view } = await mountSheetWorkspace();
    openFromBody(view);
    const dialog = sheet(view);
    if (!dialog) {
      throw new Error('sheet not open');
    }
    fireEvent.click(dialog);
    expect(sheet(view)).toBeNull();
    expect(document.activeElement).toBe(footerButton(view));
    const button = footerButton(view);
    act(() => button.focus());
    fireEvent.click(button);
    const reopened = sheet(view);
    if (!reopened) {
      throw new Error('sheet not reopened');
    }
    fireEvent.click(within(reopened).getByRole('button', { name: 'Close (Esc)' }));
    expect(sheet(view)).toBeNull();
    expect(document.activeElement).toBe(button);
  });
});
