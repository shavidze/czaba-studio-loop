import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementMarker, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const fakeClock = { base: 0 };

function fakeNow(): number {
  return Date.now() / 1000 - fakeClock.base;
}

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
    return fakeNow();
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

const markerStringsCollection: WorkspaceCollection = {
  id: 'markers',
  label: 'markers',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'markers', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 6000, numberOfChannels: 1, sampleRate: 100 }),
};

const PROJECT_END = 50;

const MARKER_FLAG_HINT_TEXT =
  'Click: jump here · Double-click: play from here · Drag or ← →: move · F2: rename · Delete: delete · Right-click or Shift+F10: menu';

const LABEL_MARKERS: ArrangementMarker[] = [
  { id: 'k0', time: 0, name: 'Start' },
  { id: 'kh', time: 0.5, name: 'Hit' },
  { id: 'k12', time: 12, name: 'Drop' },
];

function markerStringsArrangement(markers?: ArrangementMarker[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  const arrangement: Arrangement = {
    ...base,
    clips: [
      {
        id: 'm1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: PROJECT_END,
      },
    ],
  };
  return markers ? { ...arrangement, markers } : arrangement;
}

interface MarkerApiRef {
  current: ArrangementContextValue | null;
}

function MarkerProbe({ api }: { api: MarkerApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MarkerApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountMarkerStringsWorkspace(initial: Arrangement = markerStringsArrangement()) {
  const api: MarkerApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={markerStringsCollection} initialArrangement={initial}>
      <StudioWorkspace />
      <MarkerProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return { api, view };
}

type MarkerView = ReturnType<typeof render>;

function flagById(view: MarkerView, id: string): HTMLElement {
  const flag = view
    .queryAllByTestId('arrangement-marker')
    .find((entry) => entry.dataset.markerId === id);
  if (!flag) {
    throw new Error(`no marker ${id}`);
  }
  return flag;
}

function nameInput(view: MarkerView): HTMLInputElement {
  const input = view.getByTestId('arrangement-marker-name-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('name input missing');
  }
  return input;
}

function statusText(view: MarkerView): string {
  return view.getByTestId('arrangement-status').textContent ?? '';
}

function markerMenu(view: MarkerView): HTMLElement {
  const menu = view.queryByTestId('arrangement-marker-menu');
  if (!menu) {
    throw new Error('marker menu not open');
  }
  return menu;
}

function menuItemTexts(view: MarkerView): (string | null)[] {
  return Array.from(markerMenu(view).querySelectorAll('[role="menuitem"]')).map(
    (item) => item.textContent,
  );
}

function rightClickFlag(flag: HTMLElement) {
  fireEvent.pointerDown(flag, { button: 2, buttons: 2, pointerId: 1, clientX: 300, clientY: 40 });
  fireEvent.pointerUp(flag, { button: 2, buttons: 0, pointerId: 1, clientX: 300, clientY: 40 });
  fireEvent.contextMenu(flag, { button: 2, clientX: 300, clientY: 40 });
}

function pressF2(flag: HTMLElement) {
  flag.focus();
  fireEvent.keyDown(flag, { key: 'F2', code: 'F2' });
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('marker row and menu English strings (V-0.3c)', { timeout: 15000 }, () => {
  it('MS1: header titles, the name field label and the flag label and title are English', async () => {
    const { api, view } = await mountMarkerStringsWorkspace(
      markerStringsArrangement(LABEL_MARKERS),
    );
    const add = view.getByTestId('arrangement-marker-add');
    const previous = view.getByTestId('arrangement-marker-prev');
    const next = view.getByTestId('arrangement-marker-next');
    expect(add.title).toBe(
      'Add a marker at the playhead or at the start of the time selection (M)',
    );
    expect(previous.title).toBe('Jump to the previous marker (Ctrl+←)');
    expect(next.title).toBe('Jump to the next marker (Ctrl+→)');
    expect(add.getAttribute('aria-label')).toBe('Add marker (M)');
    expect(previous.getAttribute('aria-label')).toBe('Previous marker (Ctrl+←)');
    expect(next.getAttribute('aria-label')).toBe('Next marker (Ctrl+→)');
    const hit = flagById(view, 'kh');
    expect(hit.getAttribute('aria-label')).toBe('Marker “Hit” — 00:00.500');
    expect(hit.title).toBe(`“Hit” — 00:00.500\n${MARKER_FLAG_HINT_TEXT}`);
    act(() => live(api).seekTo(3));
    fireEvent.keyDown(document.body, { key: 'm', code: 'KeyM' });
    expect(nameInput(view).getAttribute('aria-label')).toBe('Marker name');
  });

  it('MS2: add, cancel, rename, empty rename, delete, move and the start refusal announce English', async () => {
    const { api, view } = await mountMarkerStringsWorkspace(
      markerStringsArrangement(LABEL_MARKERS),
    );
    act(() => live(api).seekTo(3));
    fireEvent.keyDown(document.body, { key: 'm', code: 'KeyM' });
    let input = nameInput(view);
    fireEvent.change(input, { target: { value: 'Intro' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(statusText(view)).toBe('Marker “Intro” added at 00:03.000.');
    expect(live(api).undoLabel).toBe('Add Marker');

    act(() => live(api).seekTo(5));
    fireEvent.keyDown(document.body, { key: 'm', code: 'KeyM' });
    input = nameInput(view);
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    expect(statusText(view)).toBe('Marker not added');

    pressF2(flagById(view, 'k12'));
    input = nameInput(view);
    fireEvent.change(input, { target: { value: 'Finale' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(statusText(view)).toBe('Marker name: “Finale”.');
    expect(live(api).undoLabel).toBe('Rename Marker');

    pressF2(flagById(view, 'k12'));
    input = nameInput(view);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(statusText(view)).toBe('The name is empty — “Finale” is kept');

    const hit = flagById(view, 'kh');
    hit.focus();
    fireEvent.keyDown(hit, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(statusText(view)).toBe('Marker “Hit” moved to 00:00.600.');
    expect(live(api).undoLabel).toBe('Move Marker');

    const start = flagById(view, 'k0');
    start.focus();
    fireEvent.keyDown(start, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(statusText(view)).toBe('The marker is at the start of the timeline.');

    const finale = flagById(view, 'k12');
    finale.focus();
    fireEvent.keyDown(finale, { key: 'Delete', code: 'Delete' });
    expect(statusText(view)).toBe('Marker “Finale” deleted.');
    expect(live(api).undoLabel).toBe('Delete Marker');
  });

  it('MS3: right-click and Shift+F10 open a menu labelled with the marker name and English items in order', async () => {
    const { view } = await mountMarkerStringsWorkspace(markerStringsArrangement(LABEL_MARKERS));
    rightClickFlag(flagById(view, 'kh'));
    expect(markerMenu(view).getAttribute('aria-label')).toBe('Marker “Hit”');
    expect(menuItemTexts(view)).toEqual(['Rename (F2)', 'Play from here', 'Delete (Delete)']);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape', code: 'Escape' });
    expect(view.queryByTestId('arrangement-marker-menu')).toBeNull();

    const drop = flagById(view, 'k12');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'F10', code: 'F10', shiftKey: true });
    expect(markerMenu(view).getAttribute('aria-label')).toBe('Marker “Drop”');
    expect(menuItemTexts(view)).toEqual(['Rename (F2)', 'Play from here', 'Delete (Delete)']);
  });

  it('MS4: the marker step buttons show hidden chevron icons and the add button keeps its + text (D-29z131)', async () => {
    const { view } = await mountMarkerStringsWorkspace(markerStringsArrangement(LABEL_MARKERS));
    const add = view.getByTestId('arrangement-marker-add');
    const steps = [
      {
        button: view.getByTestId('arrangement-marker-prev'),
        iconClass: 'lucide-chevron-left',
        label: 'Previous marker (Ctrl+←)',
        title: 'Jump to the previous marker (Ctrl+←)',
        shortcut: 'Control+ArrowLeft',
      },
      {
        button: view.getByTestId('arrangement-marker-next'),
        iconClass: 'lucide-chevron-right',
        label: 'Next marker (Ctrl+→)',
        title: 'Jump to the next marker (Ctrl+→)',
        shortcut: 'Control+ArrowRight',
      },
    ];
    for (const { button, iconClass, label, title, shortcut } of steps) {
      const svgs = button.querySelectorAll('svg');
      expect(svgs).toHaveLength(1);
      const icon = svgs[0];
      expect(icon.classList.contains(iconClass)).toBe(true);
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.classList.contains('size-2.25')).toBe(true);
      expect(icon.classList.contains('shrink-0')).toBe(true);
      expect(icon.getAttribute('stroke-width')).toBe('2.4');
      expect(button.textContent).toBe('');
      expect(button.className.split(' ')).toEqual(
        expect.arrayContaining(['inline-flex', 'items-center', 'justify-center']),
      );
      expect(button.getAttribute('aria-label')).toBe(label);
      expect(button.title).toBe(title);
      expect(button.getAttribute('aria-keyshortcuts')).toBe(shortcut);
    }
    expect(add.textContent).toBe('+');
    expect(add.querySelector('svg')).toBeNull();
    expect(add.className.split(' ')).not.toContain('inline-flex');
    const header = add.parentElement;
    if (!header) {
      throw new Error('marker header not found');
    }
    expect(header.textContent).not.toMatch(/[◀▶]/u);
  });

  it('MS5: the marker header buttons get the borderless 8 px fill and the name field the 8 px radius (D-29z132)', async () => {
    const { api, view } = await mountMarkerStringsWorkspace(
      markerStringsArrangement(LABEL_MARKERS),
    );
    const tokensOf = (element: Element) => element.className.split(/\s+/);
    const SURF = [
      'border',
      'border-transparent',
      'bg-foreground/5',
      'enabled:hover:bg-foreground/8',
      'enabled:active:bg-foreground/12',
      'rounded-md',
      'motion-safe:transition-[background-color,color]!',
      'motion-safe:duration-180!',
      'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!',
      'motion-reduce:transition-none!',
    ];
    const add = view.getByTestId('arrangement-marker-add');
    const previous = view.getByTestId('arrangement-marker-prev');
    const next = view.getByTestId('arrangement-marker-next');
    for (const button of [add, previous, next]) {
      const tokens = tokensOf(button);
      for (const token of [...SURF, 'text-muted', 'hover:text-foreground']) {
        expect(tokens).toContain(token);
      }
      expect(tokens).not.toContain('border-outline');
      expect(tokens).not.toContain('rounded-sm');
    }
    for (const button of [previous, next]) {
      expect(tokensOf(button)).toEqual(
        expect.arrayContaining(['inline-flex', 'items-center', 'justify-center']),
      );
    }
    expect(tokensOf(add)).not.toContain('inline-flex');
    act(() => live(api).seekTo(3));
    fireEvent.keyDown(document.body, { key: 'm', code: 'KeyM' });
    const inputTokens = tokensOf(nameInput(view));
    expect(inputTokens).toContain('rounded-md');
    expect(inputTokens).toContain('border-brand');
    expect(inputTokens).not.toContain('rounded-sm');
  });
});
