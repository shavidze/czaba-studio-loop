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
import { createArrangement } from '../model';
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

const SCROLLER_TEST_ID = 'arrangement-timeline-scroller';
const HEADER_PX = 224;
const VIEWPORT_PX = 1216;
const LANE_ROW_PX = 100;
const layout = { scrollerWidth: VIEWPORT_PX + HEADER_PX };

const windowCollection: WorkspaceCollection = {
  id: 'window',
  label: 'window',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'window', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 20000, numberOfChannels: 1, sampleRate: 100 }),
};

const WINDOW_CLIPS: ArrangementClip[] = [
  { id: 'near', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 50 },
  { id: 'far', trackId: 'music', sourceId: 'song', start: 150, sourceOffset: 0, duration: 50 },
];

function windowArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: WINDOW_CLIPS };
}

interface WindowApiRef {
  current: ArrangementContextValue | null;
}

function WindowProbe({ api }: { api: WindowApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: WindowApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountWindowWorkspace(pxPerSecond: number) {
  const api: WindowApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={windowCollection} initialArrangement={windowArrangement()}>
      <StudioWorkspace />
      <WindowProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(pxPerSecond));
  const mounted = (): string[] =>
    [...view.container.querySelectorAll<HTMLElement>('[data-clip-id]')]
      .map((clip) => clip.dataset.clipId ?? '')
      .sort();
  const musicCount = (): string | null =>
    view.container
      .querySelector<HTMLElement>('[data-track-id="music"]')
      ?.getAttribute('data-clip-count') ?? null;
  const scrollTo = (left: number) => {
    const scroller = view.getByTestId(SCROLLER_TEST_ID);
    scroller.scrollLeft = left;
    fireEvent.scroll(scroller);
  };
  const header = (clipId: string): HTMLElement => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const first = root?.firstElementChild;
    if (!root || !(first instanceof HTMLElement)) {
      throw new Error(`clip ${clipId} not mounted`);
    }
    for (const [name, value] of [
      ['setPointerCapture', () => undefined],
      ['hasPointerCapture', () => false],
      ['releasePointerCapture', () => undefined],
    ] as const) {
      Object.defineProperty(root, name, { configurable: true, value });
    }
    return first;
  };
  return { api, view, mounted, musicCount, scrollTo, header };
}

beforeEach(() => {
  fakeClock.base = 0;
  layout.scrollerWidth = VIEWPORT_PX + HEADER_PX;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function stubClientWidth(
    this: Element,
  ) {
    return this.getAttribute('data-testid') === SCROLLER_TEST_ID ? layout.scrollerWidth : 0;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('PERF-14b lane clip virtualization', { timeout: 15_000 }, () => {
  it('VZ1 an unmeasured viewport mounts every clip', async () => {
    layout.scrollerWidth = 0;
    const { mounted, musicCount } = await mountWindowWorkspace(40);
    expect(mounted()).toEqual(['far', 'near']);
    expect(musicCount()).toBe('2');
  });

  it('VZ2 a measured viewport mounts only the clips inside the page window; the count stays the model', async () => {
    const { mounted, musicCount } = await mountWindowWorkspace(40);
    expect(mounted()).toEqual(['near']);
    expect(musicCount()).toBe('2');
  });

  it('VZ3 scrolling across pages mounts and unmounts clips', async () => {
    const { mounted, scrollTo, musicCount } = await mountWindowWorkspace(40);
    scrollTo(3000);
    expect(mounted()).toEqual(['near']);
    scrollTo(4000);
    expect(mounted()).toEqual(['far']);
    scrollTo(0);
    expect(mounted()).toEqual(['near']);
    expect(musicCount()).toBe('2');
  });

  it('VZ4 zooming out brings a far clip into the window', async () => {
    const { api, mounted } = await mountWindowWorkspace(40);
    act(() => live(api).setPxPerSecond(20));
    expect(mounted()).toEqual(['near']);
    act(() => live(api).setPxPerSecond(10));
    expect(mounted()).toEqual(['far', 'near']);
  });

  it('VZ5 a clip under an active pointer gesture stays mounted until the pointer is released', async () => {
    const { mounted, scrollTo, header } = await mountWindowWorkspace(40);
    fireEvent.pointerDown(header('near'), { button: 0, buttons: 1, pointerId: 7, clientX: 300 });
    scrollTo(4000);
    expect(mounted()).toEqual(['far', 'near']);
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 300 });
    scrollTo(5000);
    expect(mounted()).toEqual(['far']);
  });

  it('VZ6 a lane-move source outside the window stays mounted while the move is held', async () => {
    const { api, mounted } = await mountWindowWorkspace(40);
    act(() =>
      live(api).setClipLaneDrag({
        ghosts: [
          {
            clipId: 'far',
            trackId: 'sfx',
            start: 150,
            duration: 50,
            blocked: false,
            message: null,
          },
        ],
        timeLocked: false,
      }),
    );
    expect(mounted()).toEqual(['far', 'near']);
    act(() => live(api).setClipLaneDrag(null));
    expect(mounted()).toEqual(['near']);
  });

  it('VZ7 select-all does not mount clips outside the window, and Delete still reaches them', async () => {
    const { api, mounted, musicCount } = await mountWindowWorkspace(40);
    act(() => live(api).selectAllClips());
    expect(live(api).getSelectedClipIds()).toEqual(expect.arrayContaining(['near', 'far']));
    expect(mounted()).toEqual(['near']);
    act(() => live(api).deleteSelection());
    expect(musicCount()).toBe('0');
    expect(mounted()).toEqual([]);
  });

  it('VZ8 a window blur during a press unpins the clip, so the next scroll unmounts it', async () => {
    const { mounted, scrollTo, header } = await mountWindowWorkspace(40);
    fireEvent.pointerDown(header('near'), { button: 0, buttons: 1, pointerId: 8, clientX: 300 });
    scrollTo(4000);
    expect(mounted()).toEqual(['far', 'near']);
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    scrollTo(5000);
    expect(mounted()).toEqual(['far']);
  });

  it('VZ9 unmounting the workspace during a press removes every window listener the press added', async () => {
    const { view, header } = await mountWindowWorkspace(40);
    const target = header('near');
    const pressTypes = new Set(['pointerup', 'pointercancel', 'blur']);
    const addSpy = vi.spyOn(window, 'addEventListener');
    fireEvent.pointerDown(target, { button: 0, buttons: 1, pointerId: 6, clientX: 300 });
    const added = addSpy.mock.calls.filter(([type]) => pressTypes.has(type));
    addSpy.mockRestore();
    expect(added.filter(([type]) => type === 'blur').length).toBeGreaterThanOrEqual(2);
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    view.unmount();
    const removed = removeSpy.mock.calls;
    const captureOf = (options: boolean | EventListenerOptions | undefined): boolean =>
      typeof options === 'boolean' ? options : (options?.capture ?? false);
    const leftover = added.filter(
      ([type, listener, options]) =>
        !removed.some(
          ([removedType, removedListener, removedOptions]) =>
            removedType === type &&
            removedListener === listener &&
            captureOf(removedOptions) === captureOf(options),
        ),
    );
    expect(leftover.map(([type]) => type)).toEqual([]);
  });

  it('VZ10 a same-lane group member outside the window mounts at its preview position mid-gesture', async () => {
    const { api, view, mounted, scrollTo, header } = await mountWindowWorkspace(40);
    view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
      Object.defineProperty(row, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(0, index * LANE_ROW_PX, 800, LANE_ROW_PX),
      });
    });
    act(() => live(api).selectClips(['near', 'far']));
    const grip = header('near');
    const root = view.container.querySelector<HTMLElement>('[data-clip-id="near"]');
    if (!root) {
      throw new Error('near not mounted');
    }
    const y = LANE_ROW_PX * 1.5;
    fireEvent.pointerDown(grip, { button: 0, buttons: 1, pointerId: 9, clientX: 300, clientY: y });
    fireEvent.pointerMove(root, { buttons: 1, pointerId: 9, clientX: 340, clientY: y });
    fireEvent.pointerMove(root, { buttons: 1, pointerId: 9, clientX: 380, clientY: y });
    expect(mounted()).toEqual(['near']);
    scrollTo(4000);
    expect(mounted()).toEqual(['far', 'near']);
    const far = view.container.querySelector<HTMLElement>('[data-clip-id="far"]');
    expect(far?.dataset.clipStart).toBe('152.000');
    fireEvent.pointerUp(root, { pointerId: 9, clientX: 380, clientY: y });
    expect(
      live(api)
        .getArrangement()
        .clips.find((clip) => clip.id === 'far')?.start,
    ).toBe(152);
  });
});
