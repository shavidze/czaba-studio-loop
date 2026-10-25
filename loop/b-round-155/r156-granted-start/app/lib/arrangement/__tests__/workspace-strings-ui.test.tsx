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

const stringsCollection: WorkspaceCollection = {
  id: 'strings',
  label: 'strings',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'strings', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function stringsArrangement(): Arrangement {
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

interface StringsApiRef {
  current: ArrangementContextValue | null;
}

function StringsProbe({ api }: { api: StringsApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: StringsApiRef): ArrangementContextValue {
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

async function mountStringsWorkspace() {
  const api: StringsApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={stringsCollection} initialArrangement={stringsArrangement()}>
      <StudioWorkspace />
      <StringsProbe api={api} />
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

describe('V-0.3d workspace footer strings in the real StudioWorkspace', () => {
  it('WSU1: the lane-move hint says the Shift time lock in English and gives way to the shortcut hint on release', async () => {
    const { api, view, laneY, clipParts } = await mountStringsWorkspace();
    const music = clipParts('music-1');
    expect(view.getByTestId('arrangement-shortcut-hint')).toBeTruthy();
    expect(view.queryByTestId('arrangement-lane-move-hint')).toBeNull();
    fireEvent.pointerDown(music.header, {
      ...press,
      pointerId: 7,
      clientX: 100,
      clientY: laneY('music'),
    });
    fireEvent.pointerMove(music.root, { pointerId: 7, clientX: 140, clientY: laneY('stems') });
    expect(live(api).clipLaneDrag?.timeLocked).toBe(false);
    expect(view.getByTestId('arrangement-lane-move-hint').textContent).toBe(
      'Shift — lock the time; only the track changes',
    );
    expect(view.queryByTestId('arrangement-shortcut-hint')).toBeNull();
    fireEvent.pointerMove(music.root, {
      pointerId: 7,
      clientX: 140,
      clientY: laneY('stems'),
      shiftKey: true,
    });
    expect(live(api).clipLaneDrag?.timeLocked).toBe(true);
    expect(live(api).clipLaneDrag?.ghosts[0]?.start).toBe(2);
    expect(view.getByTestId('arrangement-lane-move-hint').textContent).toBe(
      'Shift — the time is locked; only the track changes',
    );
    fireEvent.pointerUp(music.root, {
      pointerId: 7,
      clientX: 140,
      clientY: laneY('stems'),
      shiftKey: true,
    });
    expect(live(api).clipLaneDrag).toBeNull();
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'music-1')).toMatchObject({
      trackId: 'stems',
      start: 2,
    });
    expect(view.queryByTestId('arrangement-lane-move-hint')).toBeNull();
    expect(view.getByTestId('arrangement-shortcut-hint')).toBeTruthy();
  });

  it('WSU2: two selected clips show the English selection count; one selected clip shows no count', async () => {
    const { api, view } = await mountStringsWorkspace();
    expect(view.queryByTestId('arrangement-selection-count')).toBeNull();
    act(() => live(api).selectClips(['music-1', 'music-2']));
    expect(live(api).selectedClipIds).toHaveLength(2);
    expect(view.getByTestId('arrangement-selection-count').textContent).toBe('2 clips selected');
    act(() => live(api).selectClip('music-1'));
    expect(live(api).selectedClipIds).toEqual(['music-1']);
    expect(view.queryByTestId('arrangement-selection-count')).toBeNull();
    expect(view.getByTestId('arrangement-selected-clip').textContent).toBe(
      'Clip: Song · start 00:02.000 · length 00:04.000 · source offset 00:00.000',
    );
  });
});
