import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementLane } from '~/components/arrangement/ArrangementLane';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioMoveStrings } from '../strings';

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
const SFX_LANE_Y = 250;
const SNAP_ON_STATUS = 'Snap ჩართულია — ბადე 1 წმ (G)';
const NUDGE_AT_ZERO_STATUS = studioMoveStrings.nudgeAtTimeStart;
const HIDDEN_LINES_TITLE =
  'ბადე 0.1 წმ — ამ მასშტაბზე ხაზები დამალულია; Snap მაინც მუშაობს. გაადიდე Zoom. · 1 — უფრო მჭიდრო, 2 — უფრო ფართო';
const GROUP_BLOCKED_STATUS = 'ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.';
const MOVE_BLOCKED_STATUS =
  'გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.';

const gridCollection: WorkspaceCollection = {
  id: 'grid',
  label: 'grid',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'grid', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'grid', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const DEFAULT_CLIPS: ArrangementClip[] = [
  { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 2 },
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 4 },
  { id: 'm2', trackId: 'music', sourceId: 'song', start: 12.5, sourceOffset: 0, duration: 2 },
  { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4.3, sourceOffset: 0, duration: 1 },
];

function gridArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface GridApiRef {
  current: ArrangementContextValue | null;
}

function GridProbe({ api }: { api: GridApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: GridApiRef): ArrangementContextValue {
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

async function mountGridWorkspace(clips: ArrangementClip[] = DEFAULT_CLIPS) {
  const api: GridApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={gridCollection} initialArrangement={gridArrangement(clips)}>
      <StudioWorkspace />
      <GridProbe api={api} />
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
  return { api, view, clipParts };
}

function clipOf(api: GridApiRef, clipId: string): ArrangementClip {
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

function laneBodies(view: ReturnType<typeof render>): HTMLElement[] {
  return Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-track-id] [data-grid-lines]'),
  );
}

const press = { button: 0, buttons: 1 };

function dragClip(
  parts: { root: HTMLElement; header: HTMLElement },
  moves: { dx: number; y?: number; shiftKey?: boolean }[],
  pointerId = 1,
  startY = MUSIC_LANE_Y,
) {
  fireEvent.pointerDown(parts.header, { ...press, pointerId, clientX: 100, clientY: startY });
  for (const move of moves) {
    fireEvent.pointerMove(parts.root, {
      pointerId,
      clientX: 100 + move.dx,
      clientY: move.y ?? startY,
      shiftKey: move.shiftKey ?? false,
    });
  }
  const last = moves.at(-1);
  fireEvent.pointerUp(parts.root, {
    pointerId,
    clientX: 100 + (last?.dx ?? 0),
    clientY: last?.y ?? startY,
    shiftKey: last?.shiftKey ?? false,
  });
}

function pressG(target: Element = document.body, extra: Partial<KeyboardEventInit> = {}) {
  fireEvent.keyDown(target, { key: 'g', code: 'KeyG', ...extra });
}

function undoAll(api: GridApiRef): number {
  let steps = 0;
  while (live(api).undoLabel !== null && steps < 20) {
    act(() => live(api).undo());
    steps++;
  }
  return steps;
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

describe('SRW-14 stage 1 grid control and lines', { timeout: 15_000 }, () => {
  it('GS1 starts with Snap off, 1 s division and visible lines in every lane', async () => {
    const { view } = await mountGridWorkspace();
    expect(view.getByTestId('arrangement-zoom-readout').textContent).toBe('40 px/წმ');
    const control = view.getByTestId('arrangement-grid-control');
    expect(control.dataset.snap).toBe('off');
    expect(control.dataset.gridSeconds).toBe('1');
    expect(control.dataset.gridLines).toBe('visible');
    const toggle = snapToggle(view);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(toggle.textContent).toBe('Snap');
    expect(toggle.getAttribute('aria-keyshortcuts')).toBe('G');
    expect(toggle.title).toBe('Snap გამორთულია — თავისუფალი გადაადგილება (G)');
    const select = divisionSelect(view);
    expect(select.value).toBe('1');
    expect(select.getAttribute('aria-label')).toBe('ბადის დანაყოფი');
    expect(select.title).toBe('ბადე 1 წმ · 1 — უფრო მჭიდრო, 2 — უფრო ფართო');
    expect(Array.from(select.options).map((option) => [option.value, option.textContent])).toEqual([
      ['10', '10 წმ'],
      ['5', '5 წმ'],
      ['2', '2 წმ'],
      ['1', '1 წმ'],
      ['0.5', '0.5 წმ'],
      ['0.25', '0.25 წმ'],
      ['0.1', '0.1 წმ'],
    ]);
    const bodies = laneBodies(view);
    expect(bodies).toHaveLength(3);
    for (const body of bodies) {
      expect(body.dataset.gridLines).toBe('visible');
      expect(body.dataset.gridSeconds).toBe('1');
      expect(body.style.backgroundImage).toContain('repeating-linear-gradient');
      expect(body.style.backgroundImage).toContain('40px');
    }
    pressG();
    expect(control.dataset.snap).toBe('on');
    for (const body of laneBodies(view)) {
      expect(body.dataset.gridLines).toBe('visible');
      expect(body.style.backgroundImage).toContain('40px');
    }
  });

  it('GS15 a lane rendered without gridSeconds keeps its previous body: no lines, no grid attributes', async () => {
    function BareLanes({ gridSeconds }: { gridSeconds?: number }) {
      const { arrangement } = useArrangement();
      return (
        <div>
          {arrangement.tracks
            .filter((track) => track.kind === 'audio')
            .map((track) => (
              <ArrangementLane
                key={track.id}
                track={track}
                timelineWidth={800}
                onBackgroundPointerDown={() => undefined}
                gridSeconds={gridSeconds}
              />
            ))}
        </div>
      );
    }
    const bare = render(
      <ArrangementProvider collection={gridCollection} initialArrangement={gridArrangement([])}>
        <BareLanes />
      </ArrangementProvider>,
    );
    expect(bare.container.querySelector('[data-track-id]')).not.toBeNull();
    expect(bare.container.querySelector('[data-grid-lines]')).toBeNull();
    expect(bare.container.querySelector('[data-grid-seconds]')).toBeNull();
    const gradients = Array.from(bare.container.querySelectorAll<HTMLElement>('*')).filter(
      (element) => element.style.backgroundImage.includes('repeating-linear-gradient'),
    );
    expect(gradients).toHaveLength(0);
    bare.unmount();
    const gridded = render(
      <ArrangementProvider collection={gridCollection} initialArrangement={gridArrangement([])}>
        <BareLanes gridSeconds={1} />
      </ArrangementProvider>,
    );
    expect(gridded.container.querySelectorAll('[data-grid-lines="visible"]')).toHaveLength(2);
  });

  it('GS14 keeps the transport toolbar unchanged and without a Snap control', async () => {
    const { view } = await mountGridWorkspace();
    const toolbar = view.getByRole('button', { name: 'Play' }).parentElement;
    if (!(toolbar instanceof HTMLElement)) {
      throw new Error('toolbar missing');
    }
    const labels = Array.from(toolbar.querySelectorAll('button')).map(
      (button) => button.getAttribute('aria-label') ?? button.textContent?.trim() ?? '',
    );
    expect(labels).toHaveLength(12);
    expect(labels[0]).toBe('Play');
    expect(labels[1]).toBe('დასაწყისზე დაბრუნება');
    expect(labels[2]).toContain('Undo');
    expect(labels[3]).toContain('Redo');
    expect(labels[4]).toContain('Split');
    expect(labels[5]).toContain('წაშლა');
    expect(labels[6]).toContain('Loop');
    expect(labels[7]).toContain('Follow');
    expect(labels[8]).toBe('Zoom მონიშნულზე (Z)');
    expect(labels[9]).toBe('↩ Zoom');
    expect(labels[10]).toBe('Fit');
    expect(labels[11]).toBe('Export');
    expect(toolbar.querySelector('[data-testid="arrangement-zoom"]')).not.toBeNull();
    expect(toolbar.textContent).not.toContain('Snap');
    expect(toolbar.querySelector('select')).toBeNull();
  });
});

describe('SRW-14 stage 1 snapping of clip moves', { timeout: 15_000 }, () => {
  it('GS2 Snap off keeps free millisecond placement', async () => {
    const { api, clipParts } = await mountGridWorkspace();
    dragClip(clipParts('m1'), [{ dx: 37 }]);
    expect(clipOf(api, 'm1').start).toBe(7.925);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
  });

  it('GS3 G turns Snap on without history; a drag lands on the 1 s grid; a sub-half drag locks onto a nearer clip edge', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    const before = live(api).arrangement;
    pressG();
    expect(view.getByTestId('arrangement-status').textContent).toBe(SNAP_ON_STATUS);
    expect(view.getByTestId('arrangement-grid-control').dataset.snap).toBe('on');
    expect(snapToggle(view).getAttribute('aria-pressed')).toBe('true');
    expect(snapToggle(view).title).toBe('Snap ჩართულია — კლიპი ბადეზე ჯდება (G)');
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).arrangement).toBe(before);
    dragClip(clipParts('m1'), [{ dx: 37 }]);
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(clipParts('m1').root.dataset.clipStart).toBe('8.000');
    dragClip(clipParts('m1'), [{ dx: 15 }], 2);
    expect(clipOf(api, 'm1').start).toBe(8.5);
    expect(clipParts('m1').root.dataset.clipStart).toBe('8.500');
    expect(undoAll(api)).toBe(2);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('GS4 a 0.25 s division snaps a 0.325 s drag to 7.25', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    fireEvent.change(divisionSelect(view), { target: { value: '0.25' } });
    expect(view.getByTestId('arrangement-status').textContent).toBe(
      'ბადე: 0.25 წმ (Snap გამორთულია)',
    );
    fireEvent.click(snapToggle(view));
    expect(view.getByTestId('arrangement-status').textContent).toBe(
      'Snap ჩართულია — ბადე 0.25 წმ (G)',
    );
    expect(view.getByTestId('arrangement-grid-control').dataset.gridSeconds).toBe('0.25');
    dragClip(clipParts('m1'), [{ dx: 13 }]);
    expect(clipOf(api, 'm1').start).toBe(7.25);
    fireEvent.change(divisionSelect(view), { target: { value: '2' } });
    expect(view.getByTestId('arrangement-status').textContent).toBe('ბადე: 2 წმ (Snap ჩართულია)');
    fireEvent.click(snapToggle(view));
    expect(view.getByTestId('arrangement-status').textContent).toBe(
      'Snap გამორთულია — თავისუფალი გადაადგილება (G)',
    );
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
  });

  it('GS5 a group follows the grabbed clip onto the grid with one history entry', async () => {
    const { api, clipParts } = await mountGridWorkspace();
    act(() => live(api).selectClip('s1'));
    act(() => live(api).toggleClipSelection('m1', 'toggle'));
    pressG();
    dragClip(clipParts('s1'), [{ dx: 36 }], 1, SFX_LANE_Y);
    expect(clipOf(api, 's1').start).toBe(5);
    expect(clipOf(api, 'm1').start).toBe(7.7);
    expect(clipOf(api, 's1').trackId).toBe('sfx');
    expect(live(api).undoLabel).toBe('გადატანა (2)');
    expect(undoAll(api)).toBe(1);
    expect(clipOf(api, 's1').start).toBe(4.3);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('GS5b a group blocked by an unselected neighbour stops on the last grid line before it', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    act(() => live(api).selectClip('s1'));
    act(() => live(api).toggleClipSelection('m1', 'toggle'));
    pressG();
    const parts = clipParts('s1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 7,
      clientX: 100,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, { pointerId: 7, clientX: 204, clientY: SFX_LANE_Y });
    expect(view.getByTestId('arrangement-status').textContent).toBe(GROUP_BLOCKED_STATUS);
    expect(clipOf(api, 's1').start).toBe(5);
    expect(clipOf(api, 'm1').start).toBe(7.7);
    fireEvent.pointerUp(parts.root, { pointerId: 7, clientX: 204, clientY: SFX_LANE_Y });
    expect(clipOf(api, 's1').start).toBe(5);
    expect(clipOf(api, 'm1').start).toBe(7.7);
    expect(clipOf(api, 'm1').start + clipOf(api, 'm1').duration).toBeLessThanOrEqual(
      clipOf(api, 'm2').start,
    );
    expect(live(api).undoLabel).toBe('გადატანა (2)');
    expect(undoAll(api)).toBe(1);
    expect(clipOf(api, 's1').start).toBe(4.3);
  });

  it('GS6 a cross-lane move shows a grid ghost and lands on the grid with one entry', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    pressG();
    const parts = clipParts('s1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 3,
      clientX: 100,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, { pointerId: 3, clientX: 120, clientY: MUSIC_LANE_Y });
    const ghosts = view.getAllByTestId('arrangement-lane-move-ghost');
    expect(ghosts.map((ghost) => ghost.dataset.ghostStart)).toEqual(['5.000']);
    fireEvent.pointerUp(parts.root, { pointerId: 3, clientX: 120, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 's1').trackId).toBe('music');
    expect(clipOf(api, 's1').start).toBe(5);
    expect(live(api).undoLabel).toBe('გადატანა ხაზზე — მუსიკა');
    expect(undoAll(api)).toBe(1);
  });

  it('GS6b a group moved to another lane puts the off-grid anchor on the grid despite a same-lane neighbour', async () => {
    const clips: ArrangementClip[] = [
      ...DEFAULT_CLIPS.map((clip) => (clip.id === 'm1' ? { ...clip, start: 7.3 } : clip)),
      { id: 'm3', trackId: 'music', sourceId: 'song', start: 15, sourceOffset: 0, duration: 2 },
    ];
    const { api, view, clipParts } = await mountGridWorkspace(clips);
    act(() => live(api).selectClip('m2'));
    act(() => live(api).toggleClipSelection('m1', 'toggle'));
    pressG();
    const parts = clipParts('m1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 8,
      clientX: 100,
      clientY: MUSIC_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, { pointerId: 8, clientX: 136, clientY: SFX_LANE_Y });
    expect(
      view
        .getAllByTestId('arrangement-lane-move-ghost')
        .map((ghost) => ghost.dataset.ghostStart)
        .sort(),
    ).toEqual(['13.200', '8.000']);
    fireEvent.pointerUp(parts.root, { pointerId: 8, clientX: 136, clientY: SFX_LANE_Y });
    expect(clipOf(api, 'm1').trackId).toBe('sfx');
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(clipOf(api, 'm2').trackId).toBe('sfx');
    expect(clipOf(api, 'm2').start).toBe(13.2);
    expect(clipOf(api, 'm3').start).toBe(15);
    expect(live(api).undoLabel).toBe('გადატანა (2)');
    expect(undoAll(api)).toBe(1);
    expect(clipOf(api, 'm1').trackId).toBe('music');
    expect(clipOf(api, 'm1').start).toBe(7.3);
  });

  it('GS7 Shift keeps the time on a cross-lane move even with Snap on', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    pressG();
    const parts = clipParts('s1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 4,
      clientX: 100,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, {
      pointerId: 4,
      clientX: 130,
      clientY: MUSIC_LANE_Y,
      shiftKey: true,
    });
    expect(
      view.getAllByTestId('arrangement-lane-move-ghost').map((ghost) => ghost.dataset.ghostStart),
    ).toEqual(['4.300']);
    fireEvent.pointerUp(parts.root, {
      pointerId: 4,
      clientX: 130,
      clientY: MUSIC_LANE_Y,
      shiftKey: true,
    });
    expect(clipOf(api, 's1').trackId).toBe('music');
    expect(clipOf(api, 's1').start).toBe(4.3);
  });

  it('GS10 a 0.1 s division hides the lines at 40 px/s but still snaps a drag', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    fireEvent.change(divisionSelect(view), { target: { value: '0.1' } });
    const control = view.getByTestId('arrangement-grid-control');
    expect(control.dataset.gridLines).toBe('hidden');
    expect(divisionSelect(view).title).toBe(HIDDEN_LINES_TITLE);
    for (const body of laneBodies(view)) {
      expect(body.dataset.gridLines).toBe('hidden');
      expect(body.dataset.gridSeconds).toBe('0.1');
      expect(body.style.backgroundImage).toBe('');
    }
    pressG();
    dragClip(clipParts('m1'), [{ dx: 13 }]);
    expect(clipOf(api, 'm1').start).toBe(7.3);
    act(() => live(api).setPxPerSecond(60));
    expect(view.getByTestId('arrangement-grid-control').dataset.gridLines).toBe('visible');
    expect(divisionSelect(view).title).toBe('ბადე 0.1 წმ · 1 — უფრო მჭიდრო, 2 — უფრო ფართო');
    for (const body of laneBodies(view)) {
      expect(body.dataset.gridLines).toBe('visible');
      expect(body.style.backgroundImage).toContain('6px');
    }
  });

  it('GS12 G pressed mid-drag snaps the next move and the drag stays one Undo step', async () => {
    const { api, clipParts } = await mountGridWorkspace();
    const parts = clipParts('m1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 5,
      clientX: 100,
      clientY: MUSIC_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, { pointerId: 5, clientX: 120, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 'm1').start).toBe(7.5);
    pressG();
    fireEvent.pointerMove(parts.root, { pointerId: 5, clientX: 137, clientY: MUSIC_LANE_Y });
    fireEvent.pointerUp(parts.root, { pointerId: 5, clientX: 137, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    expect(undoAll(api)).toBe(1);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('GS13 a snapped move never overlaps a neighbour; the clip keeps its last free place', async () => {
    const { api, view, clipParts } = await mountGridWorkspace();
    pressG();
    const parts = clipParts('m1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 6,
      clientX: 100,
      clientY: MUSIC_LANE_Y,
    });
    fireEvent.pointerMove(parts.root, { pointerId: 6, clientX: 156, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 'm1').start).toBe(8.5);
    expect(view.getByTestId('arrangement-status').textContent).not.toBe(MOVE_BLOCKED_STATUS);
    fireEvent.pointerMove(parts.root, { pointerId: 6, clientX: 176, clientY: MUSIC_LANE_Y });
    expect(view.getByTestId('arrangement-status').textContent).toBe(MOVE_BLOCKED_STATUS);
    expect(clipOf(api, 'm1').start).toBe(8.5);
    fireEvent.pointerUp(parts.root, { pointerId: 6, clientX: 176, clientY: MUSIC_LANE_Y });
    const moved = clipOf(api, 'm1');
    const neighbour = clipOf(api, 'm2');
    expect(moved.start).toBe(8.5);
    expect(moved.start + moved.duration).toBeLessThanOrEqual(neighbour.start);
    expect(undoAll(api)).toBe(1);
  });
});

describe('SRW-14 stage 1 keyboard', { timeout: 15_000 }, () => {
  it('GS8 arrows nudge to the next and previous grid line with Snap on, 0.1 s with Snap off', async () => {
    const clips = DEFAULT_CLIPS.map((clip) => (clip.id === 'm1' ? { ...clip, start: 7.3 } : clip));
    const { api } = await mountGridWorkspace(clips);
    act(() => live(api).selectClip('m1'));
    pressG();
    fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(clipOf(api, 'm1').start).toBe(8);
    expect(live(api).undoLabel).toBe(studioMoveStrings.historyNudgeClip);
    fireEvent.keyDown(document.body, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(clipOf(api, 'm1').start).toBe(7);
    fireEvent.keyDown(document.body, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(clipOf(api, 'm1').start).toBe(6);
    expect(undoAll(api)).toBe(3);
    expect(clipOf(api, 'm1').start).toBe(7.3);
    pressG();
    fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(clipOf(api, 'm1').start).toBe(7.4);
  });

  it('GS8b a group nudge steps the primary (last selected) clip to the next grid line', async () => {
    const { api } = await mountGridWorkspace();
    act(() => live(api).selectClip('m1'));
    act(() => live(api).toggleClipSelection('s1', 'toggle'));
    expect(live(api).selectedClipId).toBe('s1');
    pressG();
    fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(clipOf(api, 's1').start).toBe(5);
    expect(clipOf(api, 'm1').start).toBe(7.7);
    expect(live(api).undoLabel).toBe('გადატანა (2)');
    fireEvent.keyDown(document.body, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(clipOf(api, 's1').start).toBe(4);
    expect(clipOf(api, 'm1').start).toBe(6.7);
    expect(undoAll(api)).toBe(2);
    expect(clipOf(api, 's1').start).toBe(4.3);
    expect(clipOf(api, 'm1').start).toBe(7);
  });

  it('GS8c two ArrowRight presses before a re-render step two grid lines from the live start', async () => {
    const clips = DEFAULT_CLIPS.filter((clip) => clip.id !== 'm2').map((clip) =>
      clip.id === 'm1' ? { ...clip, start: 7.3 } : clip,
    );
    const { api } = await mountGridWorkspace(clips);
    act(() => live(api).selectClip('m1'));
    pressG();
    act(() => {
      fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
    });
    expect(clipOf(api, 'm1').start).toBe(9);
    expect(undoAll(api)).toBe(2);
    expect(clipOf(api, 'm1').start).toBe(7.3);
  });

  it('GS9 ArrowLeft at 0 with Snap on writes no history and reports the start of time', async () => {
    const clips = DEFAULT_CLIPS.map((clip) => (clip.id === 's1' ? { ...clip, start: 0 } : clip));
    const { api, view } = await mountGridWorkspace(clips);
    act(() => live(api).selectClip('s1'));
    pressG();
    const before = live(api).arrangement;
    fireEvent.keyDown(document.body, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(live(api).arrangement).toBe(before);
    expect(live(api).undoLabel).toBeNull();
    expect(view.getByTestId('arrangement-status').textContent).toBe(NUDGE_AT_ZERO_STATUS);
  });

  it('GS11 G is ignored in the select, with Ctrl, on auto-repeat and while Export is open', async () => {
    const { view } = await mountGridWorkspace();
    const snapState = () => view.getByTestId('arrangement-grid-control').dataset.snap;
    const select = divisionSelect(view);
    select.focus();
    pressG(select);
    expect(snapState()).toBe('off');
    select.blur();
    pressG(document.body, { ctrlKey: true });
    expect(snapState()).toBe('off');
    pressG(document.body, { repeat: true });
    expect(snapState()).toBe('off');
    pressG(document.body, { altKey: true });
    expect(snapState()).toBe('off');
    pressG(document.body, { shiftKey: true });
    expect(snapState()).toBe('off');
    fireEvent.click(view.getByRole('button', { name: 'Export' }));
    pressG();
    expect(snapState()).toBe('off');
  });

  it('GS16 a select value outside the seven divisions changes nothing', async () => {
    const { view } = await mountGridWorkspace();
    const status = view.getByTestId('arrangement-status').textContent;
    fireEvent.change(divisionSelect(view), { target: { value: '3' } });
    const control = view.getByTestId('arrangement-grid-control');
    expect(control.dataset.gridSeconds).toBe('1');
    expect(view.getByTestId('arrangement-status').textContent).toBe(status);
    for (const body of laneBodies(view)) {
      expect(body.dataset.gridSeconds).toBe('1');
    }
  });
});
