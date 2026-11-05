import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
  useArrangementClipLaneDrag,
  useArrangementPreviewStore,
} from '~/contexts/ArrangementContext';
import type { ClipLaneDragState } from '~/lib/arrangement/clip-lane-drag-store';
import { decodeVideoAudio, probeVideoFile } from '~/lib/arrangement/video.client';

type LaneDragProbeValue = ArrangementContextValue & { clipLaneDrag: ClipLaneDragState | null };

import type {
  Arrangement,
  ArrangementClip,
  ArrangementLoop,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
import { createArrangement } from '../model';
import { DETAIL_RANGE_INVALID_MESSAGE } from '../panels';
import { insertMarkerStatusKind } from '../playback-start';
import {
  type ArrangementPreviewStore,
  OVERVIEW_CLIP_FIELD_ROLES,
  SELECTED_CLIP_FIELD_ROLES,
} from '../preview-store';
import { CLIP_LANE_REFUSAL_MESSAGES, GROUP_MOVE_BLOCKED_MESSAGE } from '../selection';
import { studioClipStrings, studioPlaybackStrings } from '../strings';
import { videoFadeOpacityAt } from '../video-fades';

interface ProbeFiber {
  type: unknown;
  memoizedProps: unknown;
  memoizedState: unknown;
  alternate: ProbeFiber | null;
  child: ProbeFiber | null;
  sibling: ProbeFiber | null;
}

const renderLog = vi.hoisted(() => {
  const counts = new Map<string, number>();
  const seen = new WeakMap<object, { props: unknown; state: unknown }>();
  const componentName = (type: unknown): string | null => {
    if (typeof type === 'function' && 'name' in type && typeof type.name === 'string') {
      return type.name;
    }
    if (
      typeof type === 'object' &&
      type !== null &&
      'displayName' in type &&
      typeof type.displayName === 'string'
    ) {
      return type.displayName;
    }
    return null;
  };
  const recordCommit = (root: ProbeFiber) => {
    const stack: ProbeFiber[] = [root];
    while (stack.length > 0) {
      const fiber = stack.pop();
      if (!fiber) {
        continue;
      }
      const name = componentName(fiber.type);
      if (name) {
        const previous =
          seen.get(fiber) ?? (fiber.alternate ? seen.get(fiber.alternate) : undefined);
        if (
          !previous ||
          previous.props !== fiber.memoizedProps ||
          previous.state !== fiber.memoizedState
        ) {
          counts.set(name, (counts.get(name) ?? 0) + 1);
        }
        seen.set(fiber, { props: fiber.memoizedProps, state: fiber.memoizedState });
        if (fiber.alternate) {
          seen.delete(fiber.alternate);
        }
      }
      if (fiber.sibling) {
        stack.push(fiber.sibling);
      }
      if (fiber.child) {
        stack.push(fiber.child);
      }
    }
  };
  Object.defineProperty(globalThis, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    configurable: true,
    value: {
      isDisabled: false,
      supportsFiber: true,
      renderers: new Map(),
      inject: () => 1,
      checkDCE: () => undefined,
      onCommitFiberRoot: (_rendererId: number, root: { current: ProbeFiber }) =>
        recordCommit(root.current),
      onCommitFiberUnmount: () => undefined,
      onPostCommitFiberRoot: () => undefined,
    },
  });
  return { counts };
});

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

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
const TRIM_START_TITLE = 'Trim — left edge';
const TRIM_END_TITLE = 'Trim — right edge';
const FADE_IN_TITLE = 'Fade In — drag · double-click = 0';
const SOURCE_LENGTHS: Record<string, number> = { song: 4000, hit: 800, film: 4000 };

const previewCollection: WorkspaceCollection = {
  id: 'drag-preview',
  label: 'drag-preview',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'drag-preview', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'drag-preview', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: SOURCE_LENGTHS[source.id] ?? 100,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

const AUDIO_CLIPS: ArrangementClip[] = [
  { id: 'c1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 6 },
  { id: 'c2', trackId: 'sfx', sourceId: 'hit', start: 1, sourceOffset: 0, duration: 2 },
];

const VIDEO_CLIP: ArrangementClip = {
  id: 'v1',
  trackId: 'video',
  sourceId: 'film',
  start: 1,
  sourceOffset: 0,
  duration: 4,
};

function dragPreviewFixture(
  clips: ArrangementClip[],
  loop: ArrangementLoop | null = null,
): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'Video' },
      { id: 'music', kind: 'audio', name: 'Music' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips,
    loop,
  };
}

interface PreviewApiRef {
  current: LaneDragProbeValue | null;
  store: ArrangementPreviewStore | null;
}

function PreviewProbe({ api }: { api: PreviewApiRef }) {
  api.current = {
    ...useArrangement(),
    clipLaneDrag: useArrangementClipLaneDrag((state) => state.drag),
  };
  api.store = useArrangementPreviewStore();
  return null;
}

function live(api: PreviewApiRef): LaneDragProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function previewOf(api: PreviewApiRef): Arrangement | null {
  if (!api.store) {
    throw new Error('preview store not mounted');
  }
  return api.store.getState().preview;
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountPreviewWorkspace(
  clips: ArrangementClip[] = AUDIO_CLIPS,
  loop: ArrangementLoop | null = null,
) {
  const api: PreviewApiRef = { current: null, store: null };
  const view = render(
    <ArrangementProvider
      collection={previewCollection}
      initialArrangement={dragPreviewFixture(clips, loop)}
    >
      <StudioWorkspace />
      <PreviewProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 && ['song', 'hit'].some((id) => !live(api).sourceDurations.has(id));
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
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
    const trimStart = root?.querySelector<HTMLElement>(`[title="${TRIM_START_TITLE}"]`);
    const trimEnd = root?.querySelector<HTMLElement>(`[title="${TRIM_END_TITLE}"]`);
    if (!root || !(header instanceof HTMLElement) || !trimStart || !trimEnd) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header, trimStart, trimEnd };
  };
  return { api, view, clipParts };
}

type PreviewView = Awaited<ReturnType<typeof mountPreviewWorkspace>>['view'];

const press = { button: 0, buttons: 1 };

function pointerDownAt(
  handle: HTMLElement,
  pointerId: number,
  clientX = 0,
  clientY = MUSIC_LANE_Y,
) {
  stubCapture(handle);
  fireEvent.pointerDown(handle, { ...press, pointerId, clientX, clientY });
}

function pointerMoveTo(
  root: HTMLElement,
  pointerId: number,
  clientX: number,
  clientY = MUSIC_LANE_Y,
) {
  fireEvent.pointerMove(root, { pointerId, clientX, clientY });
}

function pointerUpAt(
  root: HTMLElement,
  pointerId: number,
  clientX: number,
  clientY = MUSIC_LANE_Y,
) {
  fireEvent.pointerUp(root, { pointerId, clientX, clientY });
}

function clipIn(arrangement: Arrangement, clipId: string): ArrangementClip {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function textOf(view: PreviewView, testId: string): string {
  return view.getByTestId(testId).textContent ?? '';
}

function overviewBarLefts(view: PreviewView): string {
  return Array.from(view.getByTestId('arrangement-overview').querySelectorAll<HTMLElement>('div'))
    .map((element) => element.style.left)
    .filter((left) => left.endsWith('%'))
    .join(' ');
}

function fadeHandleOf(root: HTMLElement): HTMLElement {
  const fade = root.querySelector<HTMLElement>(`[title="${FADE_IN_TITLE}"]`);
  if (!fade) {
    throw new Error('fade handle missing');
  }
  return fade;
}

function rendersOf(name: string): number {
  return renderLog.counts.get(name) ?? 0;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  renderLog.counts.clear();
  probeVideoMock.mockReset();
  decodeVideoMock.mockReset();
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

describe('PERF-DRAG-PREVIEW stage a — trim and same-lane move previews', () => {
  it('DP2 a trimStart move renders only the dragged lane and its clip, not the workspace', async () => {
    const { clipParts } = await mountPreviewWorkspace();
    const { root, trimStart } = clipParts('c1');
    pointerDownAt(trimStart, 1);
    pointerMoveTo(root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    pointerMoveTo(root, 1, 120);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementTransport')).toBe(0);
    expect(rendersOf('ArrangementLibrary')).toBe(0);
    expect(rendersOf('ArrangementLane')).toBe(2);
    expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementClipViewInner')).toBe(2);
    expect(root.dataset.clipStart).toBe('5.000');
    pointerUpAt(root, 1, 120);
  });

  it('DP3 the release adds exactly one history entry, Undo restores, the store is empty', async () => {
    const { api, clipParts } = await mountPreviewWorkspace();
    const { root, trimStart } = clipParts('c1');
    pointerDownAt(trimStart, 1);
    pointerMoveTo(root, 1, 40);
    pointerMoveTo(root, 1, 80);
    pointerMoveTo(root, 1, 120);
    expect(previewOf(api)).not.toBeNull();
    pointerUpAt(root, 1, 120);
    expect(live(api).undoLabel).toBe(studioClipStrings.trimStartLabel);
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'c1')).toMatchObject({ start: 5, duration: 3 });
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1')).toMatchObject({ start: 2, duration: 6 });
    expect(root.dataset.clipStart).toBe('2.000');
  });

  it('DP4 a window blur mid-trim puts the clip back with no history entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace();
    const { root, trimStart } = clipParts('c1');
    pointerDownAt(trimStart, 1);
    pointerMoveTo(root, 1, 40);
    pointerMoveTo(root, 1, 80);
    expect(root.dataset.clipStart).toBe('4.000');
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(root.dataset.clipStart).toBe('2.000');
    expect(clipIn(live(api).getArrangement(), 'c1')).toMatchObject({ start: 2, duration: 6 });
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
    expect(previewOf(api)).toBeNull();
  });

  it('DP5 a same-lane move keeps the ref on the preview while React holds the original', async () => {
    const { api, clipParts } = await mountPreviewWorkspace();
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 80);
    pointerMoveTo(root, 1, 120);
    pointerMoveTo(root, 1, 160);
    expect(clipIn(live(api).getArrangement(), 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(root.dataset.clipStart).toBe('5.000');
    pointerUpAt(root, 1, 160);
    expect(clipIn(live(api).getArrangement(), 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(5);
    expect(live(api).undoLabel).toBe('Move clip');
  });

  it('DP6 the readout, the detail panel and the overview bar follow the trim preview', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    const { root, trimStart } = clipParts('c1');
    pointerDownAt(trimStart, 1);
    pointerMoveTo(root, 1, 40);
    const readoutFirst = textOf(view, 'arrangement-selected-clip');
    const detailFirst = textOf(view, 'arrangement-detail-content');
    const overviewFirst = overviewBarLefts(view);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    pointerMoveTo(root, 1, 120);
    expect(textOf(view, 'arrangement-selected-clip')).not.toBe(readoutFirst);
    expect(textOf(view, 'arrangement-selected-clip')).toContain('00:05.000');
    expect(textOf(view, 'arrangement-detail-content')).not.toBe(detailFirst);
    expect(textOf(view, 'arrangement-detail-content')).toContain('00:05.000');
    expect(overviewBarLefts(view)).not.toBe(overviewFirst);
    expect(rendersOf('ArrangementOverviewWithPreviewInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementSelectedClipReadoutInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementDetailPanelWithSelectionInner')).toBeGreaterThan(0);
    pointerUpAt(root, 1, 120);
  });

  it('DP7 a trimEnd drag past the project end updates the project-end readout live', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    const { root, trimEnd } = clipParts('c1');
    pointerDownAt(trimEnd, 1, 240);
    pointerMoveTo(root, 1, 280);
    const endFirst = textOf(view, 'arrangement-project-end');
    pointerMoveTo(root, 1, 320);
    pointerMoveTo(root, 1, 360);
    expect(textOf(view, 'arrangement-project-end')).not.toBe(endFirst);
    expect(textOf(view, 'arrangement-project-end')).toContain('00:11.000');
    pointerUpAt(root, 1, 360);
  });

  it('DP8a a release with no commit converges React state to the preview and clears the store', async () => {
    const { api } = await mountPreviewWorkspace();
    const before = live(api).getArrangement();
    const next: Arrangement = {
      ...before,
      clips: before.clips.map((clip) => (clip.id === 'c1' ? { ...clip, start: 9 } : clip)),
    };
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(7, () => undefined);
      live(api).previewClipGeometry(next);
    });
    expect(live(api).arrangement).toBe(before);
    expect(previewOf(api)).toBe(next);
    act(() => {
      if (release) {
        release();
      }
    });
    expect(live(api).arrangement).toBe(next);
    expect(live(api).getArrangement()).toBe(next);
    expect(previewOf(api)).toBeNull();
    expect(live(api).undoLabel).toBeNull();
  });

  it('DP8b a move back to the start adds no entry and leaves the store empty', async () => {
    const { api, clipParts } = await mountPreviewWorkspace();
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 80);
    pointerMoveTo(root, 1, 120);
    pointerMoveTo(root, 1, 40);
    pointerUpAt(root, 1, 40);
    expect(live(api).undoLabel).toBeNull();
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
  });

  it('DP5b same lane → other lane → back → release: one entry at the final place, store empty', async () => {
    const { api, clipParts } = await mountPreviewWorkspace();
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 80);
    expect(clipIn(live(api).getArrangement(), 'c1').start).toBe(3);
    pointerMoveTo(root, 1, 80, SFX_LANE_Y);
    expect(live(api).clipLaneDrag?.ghosts[0]?.trackId).toBe('sfx');
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(clipIn(live(api).getArrangement(), 'c1')).toMatchObject({ start: 2, trackId: 'music' });
    pointerMoveTo(root, 1, 120);
    expect(live(api).clipLaneDrag?.ghosts ?? []).toHaveLength(0);
    expect(clipIn(live(api).getArrangement(), 'c1')).toMatchObject({ start: 4, trackId: 'music' });
    pointerUpAt(root, 1, 120);
    expect(live(api).undoLabel).toBe('Move clip');
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'c1')).toMatchObject({ start: 4, trackId: 'music' });
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1')).toMatchObject({ start: 2, trackId: 'music' });
  });

  it('DP49 cross-lane moves render neither the provider nor the workspace; release adds one entry on the target lane', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 80, SFX_LANE_Y);
    expect(live(api).clipLaneDrag?.ghosts[0]).toMatchObject({ trackId: 'sfx', start: 3 });
    expect(previewOf(api)).toBeNull();
    expect(live(api).getArrangement()).toBe(live(api).arrangement);
    expect(live(api).isArrangementPreviewActive()).toBe(true);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 120, SFX_LANE_Y);
    pointerMoveTo(root, 1, 160, SFX_LANE_Y);
    expect(live(api).clipLaneDrag?.ghosts[0]).toMatchObject({ trackId: 'sfx', start: 5 });
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementTransport')).toBe(0);
    expect(rendersOf('ArrangementLibrary')).toBe(0);
    expect(rendersOf('ArrangementLane')).toBe(2);
    expect(textOf(view, 'arrangement-lane-move-hint')).toBe(
      'Shift — lock the time; only the track changes',
    );
    expect(clipIn(live(api).arrangement, 'c1')).toMatchObject({ start: 2, trackId: 'music' });
    pointerUpAt(root, 1, 160, SFX_LANE_Y);
    expect(live(api).undoLabel).toBe('Move to track — SFX');
    expect(live(api).clipLaneDrag).toBeNull();
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1')).toMatchObject({ start: 5, trackId: 'sfx' });
  });

  it('DP50 a refused cross-lane move shows the refusal in the readout from the store; release keeps the clip', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 40, SFX_LANE_Y);
    expect(live(api).clipLaneDrag?.ghosts).toEqual([
      {
        clipId: 'c1',
        trackId: 'sfx',
        start: 2,
        duration: 6,
        blocked: true,
        message: CLIP_LANE_REFUSAL_MESSAGES.overlap,
      },
    ]);
    expect(textOf(view, 'arrangement-lane-move-refusal')).toBe(
      `${CLIP_LANE_REFUSAL_MESSAGES.overlap} · `,
    );
    expect(textOf(view, 'arrangement-lane-move-hint')).toBe(
      `${CLIP_LANE_REFUSAL_MESSAGES.overlap} · Shift — lock the time; only the track changes`,
    );
    expect(textOf(view, 'arrangement-status')).toBe(CLIP_LANE_REFUSAL_MESSAGES.overlap);
    pointerUpAt(root, 1, 40, SFX_LANE_Y);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).clipLaneDrag).toBeNull();
    expect(view.queryByTestId('arrangement-lane-move-refusal')).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1')).toMatchObject({ start: 2, trackId: 'music' });
  });

  it('DP9a an audio fade-in move renders neither the provider nor the workspace; release adds one entry', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const fade = fadeHandleOf(audio.root);
    pointerDownAt(fade, 1, 0);
    pointerMoveTo(audio.root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(audio.root, 1, 80);
    pointerMoveTo(audio.root, 1, 120);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementTransport')).toBe(0);
    expect(rendersOf('ArrangementLibrary')).toBe(0);
    expect(rendersOf('ArrangementClipViewInner')).toBe(2);
    expect(rendersOf('ArrangementStatusTextInner')).toBe(2);
    expect(audio.root.dataset.fadeIn).toBe('3.000');
    expect(textOf(view, 'arrangement-status')).toBe('Fade In: 3.000 s');
    expect(previewOf(api)).not.toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').fadeIn ?? 0).toBe(0);
    pointerUpAt(audio.root, 1, 120);
    expect(live(api).undoLabel).toBe('Fade In');
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'c1').fadeIn).toBe(3);
    expect(textOf(view, 'arrangement-status')).toBe(
      studioClipStrings.fadeCommitted('Fade In', '3.000'),
    );
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').fadeIn ?? 0).toBe(0);
  });

  it('DP9b a video clip move previews through the store; release adds one Move clip entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    pointerDownAt(video.header, 2, 40, 50);
    pointerMoveTo(video.root, 2, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 2, 120, 50);
    pointerMoveTo(video.root, 2, 160, 50);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementClipViewInner')).toBe(2);
    expect(video.root.dataset.clipStart).toBe('4.000');
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video move preview missing');
    }
    expect(clipIn(shown, 'v1').start).toBe(4);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(clipIn(live(api).getArrangement(), 'v1').start).toBe(4);
    pointerUpAt(video.root, 2, 160, 50);
    expect(live(api).undoLabel).toBe('Move clip');
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
    act(() => live(api).undo());
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(live(api).undoLabel).toBeNull();
  });

  it('DP10 every changed fade readout replaces the status span once; an unchanged one adds nothing', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const region = view.getByTestId('arrangement-status');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 40);
    expect(region.textContent).toBe('Fade In: 1.000 s');
    const first = region.firstElementChild;
    pointerMoveTo(audio.root, 1, 80);
    expect(region.textContent).toBe('Fade In: 2.000 s');
    const second = region.firstElementChild;
    expect(second).not.toBe(first);
    pointerMoveTo(audio.root, 1, 80.01);
    expect(region.textContent).toBe('Fade In: 2.000 s');
    expect(region.firstElementChild).toBe(second);
    expect(region.childElementCount).toBe(1);
    pointerUpAt(audio.root, 1, 80.01);
  });

  it('DP11 a pointercancel mid-fade reverts the fade and keeps the last readout span', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const region = view.getByTestId('arrangement-status');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 40);
    pointerMoveTo(audio.root, 1, 80);
    const span = region.firstElementChild;
    fireEvent.pointerCancel(audio.root, { pointerId: 1, clientX: 80, clientY: MUSIC_LANE_Y });
    expect(audio.root.dataset.fadeIn).toBe('0.000');
    expect(region.textContent).toBe('Fade In: 2.000 s');
    expect(region.firstElementChild).toBe(span);
    expect(live(api).undoLabel).toBeNull();
    expect(previewOf(api)).toBeNull();
    expect(live(api).status).toBe('Fade In: 2.000 s');
  });

  it('DP12 a committed write mid-fade wins; release after a refusal restores the last readout', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const region = view.getByTestId('arrangement-status');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 40);
    act(() => live(api).setStatus('Committed mid-drag.'));
    expect(region.textContent).toBe('Committed mid-drag.');
    pointerMoveTo(audio.root, 1, 80);
    expect(region.textContent).toBe('Fade In: 2.000 s');
    act(() => live(api).addSourceToActiveTrack('song'));
    expect(region.textContent).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    fireEvent.pointerCancel(audio.root, { pointerId: 1, clientX: 80, clientY: MUSIC_LANE_Y });
    expect(region.textContent).toBe('Fade In: 2.000 s');
    expect(live(api).status).toBe('Fade In: 2.000 s');
    expect(previewOf(api)).toBeNull();
  });

  it('DP13 a video fade drag previews through the store and the status readout; release adds one entry', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    const fade = video.root.querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!fade) {
      throw new Error('video fade handle missing');
    }
    const committedStatus = live(api).status;
    pointerDownAt(fade, 3, 40, 50);
    pointerMoveTo(video.root, 3, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 3, 120, 50);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementStatusTextInner')).toBe(1);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video fade preview missing');
    }
    const shownFade = clipIn(shown, 'v1').fadeIn ?? 0;
    expect(shownFade).toBeGreaterThan(0);
    expect(video.root.dataset.fadeIn).toBe(shownFade.toFixed(3));
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
    expect(textOf(view, 'arrangement-status')).toContain(shownFade.toFixed(3));
    expect(live(api).status).toBe(committedStatus);
    pointerUpAt(video.root, 3, 120, 50);
    expect(previewOf(api)).toBeNull();
    expect(live(api).undoLabel).toBe('Video Fade In');
    expect(clipIn(live(api).arrangement, 'v1').fadeIn).toBe(shownFade);
    expect(textOf(view, 'arrangement-status')).toBe(live(api).status);
    act(() => live(api).undo());
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
  });

  it('DP14 a fade dragged back to 0 adds no entry, empties the store and reports no change', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 40);
    pointerMoveTo(audio.root, 1, 0);
    expect(textOf(view, 'arrangement-status')).toBe('Fade In: 0.000 s');
    pointerUpAt(audio.root, 1, 0);
    expect(live(api).undoLabel).toBeNull();
    expect(previewOf(api)).toBeNull();
    expect(audio.root.dataset.fadeIn).toBe('0.000');
    expect(textOf(view, 'arrangement-status')).toBe(studioClipStrings.historyUnchanged('Fade In'));
    expect(live(api).status).toBe(studioClipStrings.historyUnchanged('Fade In'));
  });

  it('DP15 the status preview getter returns the shown readout during the drag and null after it', async () => {
    const { api, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    expect(live(api).getStatusPreviewText()).toBeNull();
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 80);
    expect(live(api).getStatusPreviewText()).toBe('Fade In: 2.000 s');
    pointerUpAt(audio.root, 1, 80);
    expect(live(api).getStatusPreviewText()).toBeNull();
  });

  it('DP16 a stop mid-fade reads the shown readout, so the insert-marker rewrite stays off as at HEAD', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    expect(live(api).isPlaying).toBe(true);
    act(() => live(api).setStatus(studioPlaybackStrings.playingFrom('00:00.000')));
    expect(insertMarkerStatusKind(live(api).status)).toBe('playing-from');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 80);
    expect(textOf(view, 'arrangement-status')).toBe('Fade In: 2.000 s');
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(false);
    expect(textOf(view, 'arrangement-status')).toBe('Fade In: 2.000 s');
    expect(live(api).getStatusPreviewText()).toBe('Fade In: 2.000 s');
    pointerUpAt(audio.root, 1, 80);
    expect(live(api).undoLabel).toBe('Fade In');
    expect(textOf(view, 'arrangement-status')).toBe(
      studioClipStrings.fadeCommitted('Fade In', '2.000'),
    );
  });

  it('DP17 a same-text committed write mid-fade, then a same-value move, keeps the status span node as at HEAD', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const region = view.getByTestId('arrangement-status');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 80);
    expect(region.textContent).toBe('Fade In: 2.000 s');
    const held = region.firstElementChild;
    act(() => live(api).setStatus((current) => current));
    expect(region.firstElementChild).toBe(held);
    expect(region.textContent).toBe('Fade In: 2.000 s');
    pointerMoveTo(audio.root, 1, 80.01);
    expect(region.firstElementChild).toBe(held);
    expect(region.textContent).toBe('Fade In: 2.000 s');
    expect(live(api).getStatusPreviewText()).toBeNull();
    pointerMoveTo(audio.root, 1, 120);
    expect(region.textContent).toBe('Fade In: 3.000 s');
    expect(region.firstElementChild).not.toBe(held);
    pointerUpAt(audio.root, 1, 120);
    expect(region.textContent).toBe(studioClipStrings.fadeCommitted('Fade In', '3.000'));
  });

  it('DP18 a same-text updater from a timer mid-fade adds and removes no status node', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const region = view.getByTestId('arrangement-status');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 80);
    const held = region.firstElementChild;
    const seen: string[] = [];
    const collect = (records: MutationRecord[]) => {
      for (const record of records) {
        if (record.type === 'characterData') {
          seen.push(`~${record.target.textContent}`);
        }
        for (const node of record.addedNodes) {
          seen.push(`+${node.textContent}`);
        }
        for (const node of record.removedNodes) {
          seen.push(`-${node.textContent}`);
        }
      }
    };
    const observer = new MutationObserver(collect);
    observer.observe(region, { childList: true, subtree: true, characterData: true });
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false);
    const current = live(api);
    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          current.setStatus((text) => text);
          resolve();
        }, 0);
      });
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
    } finally {
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
      collect(observer.takeRecords());
      observer.disconnect();
    }
    expect(seen).toEqual([]);
    expect(region.firstElementChild).toBe(held);
    expect(region.textContent).toBe('Fade In: 2.000 s');
    expect(current.getStatusPreviewText()).toBeNull();
    pointerUpAt(audio.root, 1, 80);
    expect(region.textContent).toBe(studioClipStrings.fadeCommitted('Fade In', '2.000'));
  });

  it('DP19 two committed writes in one batch mid-fade adopt the readout once, so the second updater sees the first write', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 80);
    act(() => {
      live(api).setStatus('First write.');
      live(api).setStatus((current) => `${current} Second write.`);
    });
    expect(textOf(view, 'arrangement-status')).toBe('First write. Second write.');
    expect(live(api).getStatusPreviewText()).toBeNull();
    pointerUpAt(audio.root, 1, 80);
    expect(textOf(view, 'arrangement-status')).toBe(
      studioClipStrings.fadeCommitted('Fade In', '2.000'),
    );
  });

  it('DP20 a committed write and a newer readout in one batch mid-fade keep the newer readout', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    pointerDownAt(fadeHandleOf(audio.root), 1, 0);
    pointerMoveTo(audio.root, 1, 80);
    expect(textOf(view, 'arrangement-status')).toBe('Fade In: 2.000 s');
    act(() => {
      live(api).setStatus('Committed write.');
      pointerMoveTo(audio.root, 1, 120);
    });
    expect(textOf(view, 'arrangement-status')).toBe('Fade In: 3.000 s');
    expect(live(api).getStatusPreviewText()).toBe('Fade In: 3.000 s');
    pointerUpAt(audio.root, 1, 120);
    expect(textOf(view, 'arrangement-status')).toBe(
      studioClipStrings.fadeCommitted('Fade In', '3.000'),
    );
  });
});

const LATE_AUDIO_CLIPS: ArrangementClip[] = [
  { id: 'c1', trackId: 'music', sourceId: 'song', start: 6, sourceOffset: 0, duration: 6 },
  { id: 'c2', trackId: 'sfx', sourceId: 'hit', start: 1, sourceOffset: 0, duration: 2 },
];

describe('PERF-DRAG-PREVIEW stage c1 — the project end during a same-lane move', () => {
  it('DP21 a move that extends the project end inside one timeline second renders no workspace', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace(LATE_AUDIO_CLIPS);
    const { root, header } = clipParts('c1');
    const ruler = view.getByTestId('arrangement-ruler');
    const overview = view.getByTestId('arrangement-overview');
    const endAtRest = textOf(view, 'arrangement-project-end');
    const extentAtRest = overview.dataset.extent;
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 50);
    expect(textOf(view, 'arrangement-project-end')).toContain('00:12.250');
    const rulerWidth = ruler.style.width;
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 60);
    pointerMoveTo(root, 1, 70);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementRuler')).toBe(0);
    expect(rendersOf('ArrangementTransport')).toBe(0);
    expect(rendersOf('ArrangementProjectEndTextInner')).toBe(2);
    expect(rendersOf('ArrangementLane')).toBe(2);
    expect(rendersOf('ArrangementOverviewWithPreviewInner')).toBe(2);
    expect(textOf(view, 'arrangement-project-end')).toContain('00:12.750');
    expect(overview.dataset.extent).toBe('12.750');
    expect(ruler.style.width).toBe(rulerWidth);
    pointerUpAt(root, 1, 70);
    expect(textOf(view, 'arrangement-project-end')).toContain('00:12.750');
    expect(overview.dataset.extent).toBe('12.750');
    act(() => live(api).undo());
    expect(textOf(view, 'arrangement-project-end')).toBe(endAtRest);
    expect(textOf(view, 'arrangement-project-end')).not.toContain('00:12.750');
    expect(overview.dataset.extent).toBe(extentAtRest);
  });

  it('DP22 a move that crosses into the next timeline second renders the workspace once and widens the ruler', async () => {
    const { view, clipParts } = await mountPreviewWorkspace(LATE_AUDIO_CLIPS);
    const { root, header } = clipParts('c1');
    const ruler = view.getByTestId('arrangement-ruler');
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 50);
    const rulerWidth = ruler.style.width;
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(ruler.style.width).toBe(rulerWidth);
    pointerMoveTo(root, 1, 90);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(1);
    expect(rendersOf('ArrangementRuler')).toBe(1);
    expect(ruler.style.width).not.toBe(rulerWidth);
    expect(Number.parseFloat(ruler.style.width) - Number.parseFloat(rulerWidth)).toBe(
      PX_PER_SECOND,
    );
    expect(view.getByTestId('arrangement-overview').dataset.extent).toBe('13.250');
    pointerUpAt(root, 1, 90);
    expect(ruler.style.width).not.toBe(rulerWidth);
  });
});

const LOOPED_LATE_AUDIO_CLIPS_LOOP_END = 20;

describe('PERF-DRAG-PREVIEW stage c1 — readers that do not follow the moved end', () => {
  it('DP23 a selection change renders the transport but not the project-end readout', async () => {
    const { api, view } = await mountPreviewWorkspace(LATE_AUDIO_CLIPS);
    const endText = textOf(view, 'arrangement-project-end');
    expect(rendersOf('ArrangementProjectEndTextInner')).toBeGreaterThan(0);
    renderLog.counts.clear();
    act(() => live(api).selectClip('c1'));
    expect(rendersOf('ArrangementTransport')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementProjectEndTextInner')).toBe(0);
    expect(textOf(view, 'arrangement-project-end')).toBe(endText);
    renderLog.counts.clear();
    act(() => live(api).selectClip(null));
    expect(rendersOf('ArrangementTransport')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementProjectEndTextInner')).toBe(0);
  });

  it('DP24 the overview extent keeps a loop that ends past the moved project end', async () => {
    const { view, clipParts } = await mountPreviewWorkspace(LATE_AUDIO_CLIPS, {
      start: 2,
      end: LOOPED_LATE_AUDIO_CLIPS_LOOP_END,
      enabled: true,
    });
    const { root, header } = clipParts('c1');
    const overview = view.getByTestId('arrangement-overview');
    expect(overview.dataset.extent).toBe('20.000');
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 70);
    expect(textOf(view, 'arrangement-project-end')).toContain('00:12.750');
    expect(overview.dataset.extent).toBe('20.000');
    pointerMoveTo(root, 1, 400);
    expect(Number.parseFloat(overview.dataset.extent ?? '')).toBeGreaterThan(
      LOOPED_LATE_AUDIO_CLIPS_LOOP_END,
    );
    pointerUpAt(root, 1, 400);
  });
});

function shownSelectionText(view: PreviewView): string {
  const readout = view.getByTestId('arrangement-selected-clip');
  const detail = view.getByTestId('arrangement-detail-content');
  const values = Array.from(detail.querySelectorAll('input')).map((input) => input.value);
  return [
    readout.textContent ?? '',
    readout.getAttribute('title') ?? '',
    detail.textContent ?? '',
    values.join('|'),
  ].join('\n');
}

const C1_FIELD_VARIANTS: { [Field in keyof ArrangementClip]-?: ArrangementClip } = {
  id: { ...AUDIO_CLIPS[0], id: 'c9' },
  trackId: { ...AUDIO_CLIPS[0], trackId: 'sfx' },
  sourceId: { ...AUDIO_CLIPS[0], sourceId: 'hit' },
  start: { ...AUDIO_CLIPS[0], start: 3 },
  sourceOffset: { ...AUDIO_CLIPS[0], sourceOffset: 0.5 },
  duration: { ...AUDIO_CLIPS[0], duration: 5 },
  gainDb: { ...AUDIO_CLIPS[0], gainDb: -6 },
  fadeIn: { ...AUDIO_CLIPS[0], fadeIn: 1.25 },
  fadeOut: { ...AUDIO_CLIPS[0], fadeOut: 2.5 },
  envelope: {
    ...AUDIO_CLIPS[0],
    envelope: [
      { time: 0, gain: 1 },
      { time: 3, gain: 0.25 },
    ],
  },
};

function shownSelectionMarkup(view: PreviewView): string {
  return [
    view.getByTestId('arrangement-selected-clip').outerHTML,
    view.getByTestId('arrangement-detail-panel').outerHTML,
  ]
    .join('\n')
    .replace(/:r[0-9a-z]+:/g, ':id:');
}

async function mountedSelectionMarkup(clip: ArrangementClip): Promise<string> {
  const { api, view } = await mountPreviewWorkspace([clip, AUDIO_CLIPS[1]]);
  try {
    act(() => live(api).selectClip(clip.id));
    return shownSelectionMarkup(view);
  } finally {
    view.unmount();
  }
}

function commitClipVariant(api: PreviewApiRef, variant: ArrangementClip) {
  const before = live(api).arrangement;
  const next: Arrangement = {
    ...before,
    clips: before.clips.map((clip) => (clip.id === variant.id ? variant : clip)),
  };
  act(() => {
    live(api).commitArrangement(next, 'Variant', before);
  });
}

describe('PERF-DRAG-PREVIEW stage c2a — selected-clip readers that do not show fades', () => {
  it('DP25 an audio fade-in move renders neither the detail panel nor the selected-clip readout', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const fade = fadeHandleOf(audio.root);
    pointerDownAt(fade, 1, 0);
    pointerMoveTo(audio.root, 1, 40);
    const shownAtFirstMove = shownSelectionText(view);
    renderLog.counts.clear();
    pointerMoveTo(audio.root, 1, 80);
    pointerMoveTo(audio.root, 1, 120);
    expect(rendersOf('ArrangementClipViewInner')).toBe(2);
    expect(audio.root.dataset.fadeIn).toBe('3.000');
    expect(previewOf(api)).not.toBeNull();
    expect(rendersOf('ArrangementSelectedClipReadoutInner')).toBe(0);
    expect(rendersOf('ArrangementTimeText')).toBe(0);
    expect(rendersOf('ArrangementDetailPanelWithSelectionInner')).toBe(0);
    expect(rendersOf('ArrangementDetailPanel')).toBe(0);
    expect(rendersOf('ArrangementDetailContentInner')).toBe(0);
    expect(rendersOf('ArrangementDetailWaveformInner')).toBe(0);
    expect(shownSelectionText(view)).toBe(shownAtFirstMove);
    pointerUpAt(audio.root, 1, 120);
    expect(clipIn(live(api).arrangement, 'c1').fadeIn).toBe(3);
    expect(shownSelectionText(view)).toBe(shownAtFirstMove);
  });

  it('DP26 a same-lane move shows the lane-move hint without rendering the readout; the detail panel follows the start', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    expect(view.getByTestId('arrangement-lane-move-hint')).toBeTruthy();
    const detailFirst = textOf(view, 'arrangement-detail-content');
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementSelectedClipReadoutInner')).toBe(0);
    expect(view.getByTestId('arrangement-lane-move-hint')).toBeTruthy();
    expect(view.queryByTestId('arrangement-selected-clip')).toBeNull();
    expect(rendersOf('ArrangementDetailPanelWithSelectionInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementDetailContentInner')).toBeGreaterThan(0);
    expect(textOf(view, 'arrangement-detail-content')).not.toBe(detailFirst);
    expect(textOf(view, 'arrangement-detail-content')).toContain('00:04.000');
    pointerUpAt(root, 1, 80);
    expect(textOf(view, 'arrangement-selected-clip')).toContain('00:04.000');
  });

  it('DP27 a clip that differs only in an ignored field renders the same readout and detail panel markup', async () => {
    const ignored = Object.entries(SELECTED_CLIP_FIELD_ROLES)
      .filter(([, role]) => role === 'ignored')
      .map(([field]) => field);
    expect(ignored.length).toBeGreaterThan(0);
    const baseMarkup = await mountedSelectionMarkup(AUDIO_CLIPS[0]);
    expect(baseMarkup).toContain('Song');
    for (const [field, variant] of Object.entries(C1_FIELD_VARIANTS)) {
      if (ignored.includes(field)) {
        expect({ field, shown: await mountedSelectionMarkup(variant) }).toEqual({
          field,
          shown: baseMarkup,
        });
      }
    }
    expect(await mountedSelectionMarkup(C1_FIELD_VARIANTS.start)).not.toBe(baseMarkup);
  });

  it('DP28 a committed change of an ignored field keeps the shown markup while the clip view redraws', async () => {
    const ignored = Object.entries(SELECTED_CLIP_FIELD_ROLES)
      .filter(([, role]) => role === 'ignored')
      .map(([field]) => field);
    for (const [field, variant] of Object.entries(C1_FIELD_VARIANTS)) {
      if (!ignored.includes(field)) {
        continue;
      }
      const { api, view } = await mountPreviewWorkspace();
      try {
        act(() => live(api).selectClip('c1'));
        const clipRoot = view.container.querySelector<HTMLElement>('[data-clip-id="c1"]');
        const clipBefore = clipRoot?.outerHTML;
        const shownBefore = shownSelectionMarkup(view);
        commitClipVariant(api, variant);
        expect({ field, committed: clipIn(live(api).arrangement, 'c1') }).toEqual({
          field,
          committed: variant,
        });
        expect({ field, clipChanged: clipRoot?.outerHTML !== clipBefore }).toEqual({
          field,
          clipChanged: true,
        });
        expect({ field, shown: shownSelectionMarkup(view) }).toEqual({ field, shown: shownBefore });
      } finally {
        view.unmount();
      }
    }
  });
});

function ignoredFields(roles: Record<keyof ArrangementClip, 'shown' | 'ignored'>): string[] {
  return Object.entries(roles)
    .filter(([, role]) => role === 'ignored')
    .map(([field]) => field);
}

function overviewMarkup(view: PreviewView): string {
  return view.getByTestId('arrangement-overview').outerHTML.replace(/:r[0-9a-z]+:/g, ':id:');
}

async function mountedOverviewMarkup(clip: ArrangementClip): Promise<string> {
  const { view } = await mountPreviewWorkspace([clip, AUDIO_CLIPS[1]]);
  try {
    return overviewMarkup(view);
  } finally {
    view.unmount();
  }
}

describe('PERF-DRAG-PREVIEW stage c2b-i — the overview and the track meters skip unchanged fields', () => {
  it('DP29 an audio fade-in move renders neither the overview nor the track meters', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    const audio = clipParts('c1');
    const fade = fadeHandleOf(audio.root);
    pointerDownAt(fade, 1, 0);
    pointerMoveTo(audio.root, 1, 40);
    const overviewAtFirstMove = overviewMarkup(view);
    renderLog.counts.clear();
    pointerMoveTo(audio.root, 1, 80);
    pointerMoveTo(audio.root, 1, 120);
    expect(rendersOf('ArrangementClipViewInner')).toBe(2);
    expect(rendersOf('ArrangementLane')).toBeGreaterThan(0);
    expect(audio.root.dataset.fadeIn).toBe('3.000');
    expect(previewOf(api)).not.toBeNull();
    expect(rendersOf('ArrangementOverviewWithPreviewInner')).toBe(0);
    expect(rendersOf('ArrangementOverviewInner')).toBe(0);
    expect(rendersOf('ArrangementTrackMeterInner')).toBe(0);
    expect(overviewMarkup(view)).toBe(overviewAtFirstMove);
    pointerUpAt(audio.root, 1, 120);
    expect(clipIn(live(api).arrangement, 'c1').fadeIn).toBe(3);
    expect(overviewMarkup(view)).toBe(overviewAtFirstMove);
  });

  it('DP30 a same-lane move redraws the overview bar but not the track meters', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    const barsFirst = overviewBarLefts(view);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    expect(rendersOf('ArrangementLane')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementDetailWaveformInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementOverviewInner')).toBeGreaterThan(0);
    expect(overviewBarLefts(view)).not.toBe(barsFirst);
    expect(rendersOf('ArrangementTrackMeterInner')).toBe(0);
    pointerUpAt(root, 1, 80);
    expect(textOf(view, 'arrangement-selected-clip')).toContain('00:04.000');
  });

  it('DP31 a trimStart move redraws the peak paths and the overview bar but not the track meters', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    const { root, trimStart } = clipParts('c1');
    pointerDownAt(trimStart, 1, 0);
    pointerMoveTo(root, 1, 40);
    const barsFirst = overviewBarLefts(view);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    expect(rendersOf('ArrangementPeakPathInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementOverviewInner')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementTrackMeterInner')).toBe(0);
    expect(overviewBarLefts(view)).not.toBe(barsFirst);
    pointerUpAt(root, 1, 80);
  });

  it('DP32 a clip that differs only in an overview-ignored field renders the same overview markup', async () => {
    const ignored = ignoredFields(OVERVIEW_CLIP_FIELD_ROLES);
    expect(ignored.length).toBeGreaterThan(0);
    const baseMarkup = await mountedOverviewMarkup(AUDIO_CLIPS[0]);
    for (const [field, variant] of Object.entries(C1_FIELD_VARIANTS)) {
      if (ignored.includes(field)) {
        expect({ field, shown: await mountedOverviewMarkup(variant) }).toEqual({
          field,
          shown: baseMarkup,
        });
      }
    }
    expect(await mountedOverviewMarkup(C1_FIELD_VARIANTS.start)).not.toBe(baseMarkup);
  });
});

function detailRangeInputs(view: PreviewView) {
  const start = view.getByTestId('arrangement-detail-start');
  const end = view.getByTestId('arrangement-detail-end');
  if (!(start instanceof HTMLInputElement) || !(end instanceof HTMLInputElement)) {
    throw new Error('detail range inputs missing');
  }
  return { start, end };
}

describe('PERF-DRAG-PREVIEW stage c2b-ii — the detail Start/End text follows the clip in render', () => {
  it('DP33 a same-lane move renders the detail content once per pointermove and shows the new Start/End', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    try {
      const { root, header } = clipParts('c1');
      pointerDownAt(header, 1, 0);
      pointerMoveTo(root, 1, 40);
      renderLog.counts.clear();
      pointerMoveTo(root, 1, 80);
      expect(rendersOf('ArrangementDetailContentInner')).toBe(1);
      expect(detailRangeInputs(view).start.value).toBe('4');
      expect(detailRangeInputs(view).end.value).toBe('10');
      pointerUpAt(root, 1, 80);
      expect(detailRangeInputs(view).start.value).toBe('4');
    } finally {
      view.unmount();
    }
  });

  it('DP34 a trimStart move renders the detail content once per pointermove and shows the trimmed Start', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    try {
      const { root, trimStart } = clipParts('c1');
      pointerDownAt(trimStart, 1, 0);
      pointerMoveTo(root, 1, 40);
      renderLog.counts.clear();
      pointerMoveTo(root, 1, 80);
      expect(rendersOf('ArrangementDetailContentInner')).toBe(1);
      expect(detailRangeInputs(view).start.value).toBe('4');
      expect(detailRangeInputs(view).end.value).toBe('8');
      pointerUpAt(root, 1, 80);
    } finally {
      view.unmount();
    }
  });

  it('DP35 typed Start/End text survives a committed change that keeps the clip start and duration', async () => {
    const { api, view } = await mountPreviewWorkspace();
    try {
      act(() => live(api).selectClip('c1'));
      const { start, end } = detailRangeInputs(view);
      fireEvent.change(start, { target: { value: '3.5' } });
      fireEvent.change(end, { target: { value: '5.25' } });
      renderLog.counts.clear();
      commitClipVariant(api, C1_FIELD_VARIANTS.gainDb);
      expect(rendersOf('ArrangementDetailContentInner')).toBeGreaterThan(0);
      expect(detailRangeInputs(view).start.value).toBe('3.5');
      expect(detailRangeInputs(view).end.value).toBe('5.25');
    } finally {
      view.unmount();
    }
  });

  it('DP36 typed Start/End text is replaced when the clip start changes, as the layout effect did', async () => {
    const { api, view } = await mountPreviewWorkspace();
    try {
      act(() => live(api).selectClip('c1'));
      const { start, end } = detailRangeInputs(view);
      fireEvent.change(start, { target: { value: '3.5' } });
      fireEvent.change(end, { target: { value: '5.25' } });
      commitClipVariant(api, C1_FIELD_VARIANTS.start);
      expect(detailRangeInputs(view).start.value).toBe('3');
      expect(detailRangeInputs(view).end.value).toBe('9');
    } finally {
      view.unmount();
    }
  });

  it('DP37 a deselect empties the disabled inputs as at HEAD; reselecting the same clip shows its Start/End', async () => {
    const { api, view } = await mountPreviewWorkspace();
    try {
      act(() => live(api).selectClip('c1'));
      fireEvent.change(detailRangeInputs(view).start, { target: { value: '3.5' } });
      act(() => live(api).selectClip(null));
      expect(detailRangeInputs(view).start.disabled).toBe(true);
      expect(detailRangeInputs(view).start.value).toBe('');
      act(() => live(api).selectClip('c1'));
      expect(detailRangeInputs(view).start.disabled).toBe(false);
      expect(detailRangeInputs(view).start.value).toBe('2');
      expect(detailRangeInputs(view).end.value).toBe('8');
    } finally {
      view.unmount();
    }
  });

  it('DP38 a trimEnd move shows the new End and keeps the Start', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    try {
      const { root, trimEnd } = clipParts('c1');
      pointerDownAt(trimEnd, 1, 320);
      pointerMoveTo(root, 1, 300);
      renderLog.counts.clear();
      pointerMoveTo(root, 1, 280);
      expect(rendersOf('ArrangementDetailContentInner')).toBe(1);
      expect(detailRangeInputs(view).start.value).toBe('2');
      expect(detailRangeInputs(view).end.value).toBe('7');
      pointerUpAt(root, 1, 280);
      expect(detailRangeInputs(view).end.value).toBe('7');
    } finally {
      view.unmount();
    }
  });

  it('DP39 a time selection on the clip fills Start/End; one on another lane falls back to the clip bounds', async () => {
    const { api, view } = await mountPreviewWorkspace();
    try {
      act(() => live(api).selectClip('c1'));
      act(() => live(api).setTimeRange({ start: 3, end: 5.5, trackId: 'music' }));
      expect(detailRangeInputs(view).start.value).toBe('3');
      expect(detailRangeInputs(view).end.value).toBe('5.5');
      renderLog.counts.clear();
      act(() => live(api).setTimeRange({ start: 3, end: 6, trackId: 'music' }));
      expect(rendersOf('ArrangementDetailContentInner')).toBe(1);
      expect(detailRangeInputs(view).start.value).toBe('3');
      expect(detailRangeInputs(view).end.value).toBe('6');
      act(() => live(api).setTimeRange({ start: 1, end: 1.5, trackId: 'sfx' }));
      expect(detailRangeInputs(view).start.value).toBe('2');
      expect(detailRangeInputs(view).end.value).toBe('8');
    } finally {
      view.unmount();
    }
  });

  it('DP40 Enter applies a typed range inside the clip; an invalid one keeps the typed text', async () => {
    const { api, view } = await mountPreviewWorkspace();
    try {
      act(() => live(api).selectClip('c1'));
      const { start, end } = detailRangeInputs(view);
      fireEvent.change(start, { target: { value: '3.25' } });
      fireEvent.change(end, { target: { value: '6.5' } });
      expect(textOf(view, 'arrangement-status')).not.toContain('00:03.250');
      fireEvent.keyDown(start, { key: 'Enter' });
      expect(textOf(view, 'arrangement-status')).toContain('00:03.250');
      expect(textOf(view, 'arrangement-status')).toContain('00:06.500');
      expect(detailRangeInputs(view).start.value).toBe('3.25');
      expect(detailRangeInputs(view).end.value).toBe('6.5');
      fireEvent.keyDown(detailRangeInputs(view).start, { key: 'Enter' });
      expect(detailRangeInputs(view).start.value).toBe('3.25');
      fireEvent.change(detailRangeInputs(view).start, { target: { value: '1' } });
      fireEvent.keyDown(detailRangeInputs(view).start, { key: 'Enter' });
      expect(detailRangeInputs(view).start.value).toBe('1');
      expect(textOf(view, 'arrangement-status')).toBe(DETAIL_RANGE_INVALID_MESSAGE);
    } finally {
      view.unmount();
    }
  });

  it('DP41 Undo after a move puts the Start/End text back to the restored clip', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    try {
      const { root, header } = clipParts('c1');
      pointerDownAt(header, 1, 0);
      pointerMoveTo(root, 1, 80);
      pointerUpAt(root, 1, 80);
      expect(detailRangeInputs(view).start.value).toBe('4');
      act(() => live(api).undo());
      expect(detailRangeInputs(view).start.value).toBe('2');
      expect(detailRangeInputs(view).end.value).toBe('8');
    } finally {
      view.unmount();
    }
  });

  it('DP42 typed text in a focused Start input is replaced by the dragged clip start, as at HEAD', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace();
    try {
      act(() => live(api).selectClip('c1'));
      const { start } = detailRangeInputs(view);
      act(() => start.focus());
      expect(document.activeElement).toBe(start);
      fireEvent.change(start, { target: { value: '3.5' } });
      const { root, header } = clipParts('c1');
      pointerDownAt(header, 1, 0);
      pointerMoveTo(root, 1, 80);
      expect(detailRangeInputs(view).start.value).toBe('4');
      pointerUpAt(root, 1, 80);
      expect(detailRangeInputs(view).start.value).toBe('4');
    } finally {
      view.unmount();
    }
  });
});

describe('PERF-DRAG-PREVIEW stage c2b-iii — the peak paths skip moves that keep their drawn fields', () => {
  it('DP43 an audio fade-in move renders no peak path while the clip view redraws', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    try {
      const audio = clipParts('c1');
      pointerDownAt(fadeHandleOf(audio.root), 1, 0);
      pointerMoveTo(audio.root, 1, 40);
      renderLog.counts.clear();
      pointerMoveTo(audio.root, 1, 80);
      pointerMoveTo(audio.root, 1, 120);
      expect(rendersOf('ArrangementClipViewInner')).toBe(2);
      expect(audio.root.dataset.fadeIn).toBe('3.000');
      expect(rendersOf('ArrangementPeakPathInner')).toBe(0);
      pointerUpAt(audio.root, 1, 120);
    } finally {
      view.unmount();
    }
  });

  it('DP44 a same-lane move renders no peak path in the lane or the detail panel', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    try {
      const { root, header } = clipParts('c1');
      pointerDownAt(header, 1, 0);
      pointerMoveTo(root, 1, 40);
      renderLog.counts.clear();
      pointerMoveTo(root, 1, 80);
      pointerMoveTo(root, 1, 120);
      expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
      expect(rendersOf('ArrangementDetailContentInner')).toBe(2);
      expect(detailRangeInputs(view).start.value).toBe('5');
      expect(rendersOf('ArrangementPeakPathInner')).toBe(0);
      pointerUpAt(root, 1, 120);
    } finally {
      view.unmount();
    }
  });

  it('DP45 a trimStart move redraws both peak paths once per pointermove', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    try {
      const { root, trimStart } = clipParts('c1');
      pointerDownAt(trimStart, 1, 0);
      pointerMoveTo(root, 1, 40);
      renderLog.counts.clear();
      pointerMoveTo(root, 1, 80);
      pointerMoveTo(root, 1, 120);
      expect(rendersOf('ArrangementPeakPathInner')).toBe(4);
      pointerUpAt(root, 1, 120);
    } finally {
      view.unmount();
    }
  });

  it('DP46 a trimEnd move redraws both peak paths once per pointermove', async () => {
    const { view, clipParts } = await mountPreviewWorkspace();
    try {
      const { root, trimEnd } = clipParts('c1');
      pointerDownAt(trimEnd, 1, 0);
      pointerMoveTo(root, 1, -40);
      renderLog.counts.clear();
      pointerMoveTo(root, 1, -80);
      pointerMoveTo(root, 1, -120);
      expect(rendersOf('ArrangementPeakPathInner')).toBe(4);
      pointerUpAt(root, 1, -120);
    } finally {
      view.unmount();
    }
  });

  it('DP48 a video fade-in move renders no peak path on the video lane', async () => {
    const { view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    try {
      const video = clipParts('v1');
      const fade = video.root.querySelector<HTMLElement>(
        '[data-testid="arrangement-video-fade-in-handle"]',
      );
      if (!fade) {
        throw new Error('video fade handle missing');
      }
      pointerDownAt(fade, 3, 40, 50);
      pointerMoveTo(video.root, 3, 80, 50);
      renderLog.counts.clear();
      pointerMoveTo(video.root, 3, 120, 50);
      expect(rendersOf('ArrangementProvider')).toBe(0);
      expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
      expect(rendersOf('ArrangementPeakPathInner')).toBe(0);
      pointerUpAt(video.root, 3, 120, 50);
    } finally {
      view.unmount();
    }
  });

  it('DP47 a committed gain change redraws both peak paths; a committed fade-only change redraws none', async () => {
    const { api, view } = await mountPreviewWorkspace();
    try {
      act(() => live(api).selectClip('c1'));
      const c1 = clipIn(live(api).arrangement, 'c1');
      renderLog.counts.clear();
      commitClipVariant(api, { ...c1, fadeIn: 1 });
      expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
      expect(rendersOf('ArrangementPeakPathInner')).toBe(0);
      renderLog.counts.clear();
      commitClipVariant(api, { ...clipIn(live(api).arrangement, 'c1'), gainDb: -6 });
      expect(rendersOf('ArrangementPeakPathInner')).toBe(2);
    } finally {
      view.unmount();
    }
  });
});

const PROJECT_END_CLIP: ArrangementClip = {
  id: 'c3',
  trackId: 'music',
  sourceId: 'song',
  start: 20,
  sourceOffset: 0,
  duration: 2,
};

describe('PERF-DRAG-PREVIEW stage c4-ii — a group move previews through the store', () => {
  it('DP51 a same-lane group move renders neither the provider nor the workspace; release adds one Move (2) entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, PROJECT_END_CLIP]);
    const first = clipParts('c1');
    const second = clipParts('c2');
    act(() => live(api).selectClips(['c1', 'c2']));
    pointerDownAt(first.header, 1, 0);
    pointerMoveTo(first.root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(first.root, 1, 80);
    pointerMoveTo(first.root, 1, 120);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementTransport')).toBe(0);
    expect(rendersOf('ArrangementLibrary')).toBe(0);
    expect(first.root.dataset.clipStart).toBe('5.000');
    expect(second.root.dataset.clipStart).toBe('4.000');
    expect(previewOf(api)).not.toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    pointerUpAt(first.root, 1, 120);
    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(previewOf(api)).toBeNull();
    expect(live(api).arrangement).toBe(live(api).getArrangement());
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'c2').start).toBe(4);
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(clipIn(live(api).arrangement, 'c2').start).toBe(1);
    expect(second.root.dataset.clipStart).toBe('1.000');
  });

  it('DP52 a cross-lane group move renders no provider; release puts both clips on the target lane in one entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([
      { id: 'g1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 0, duration: 2 },
      { id: 'g2', trackId: 'music', sourceId: 'song', start: 6, sourceOffset: 0, duration: 2 },
    ]);
    const { root, header } = clipParts('g1');
    clipParts('g2');
    act(() => live(api).selectClips(['g1', 'g2']));
    pointerDownAt(header, 1, 40);
    pointerMoveTo(root, 1, 80, SFX_LANE_Y);
    expect(live(api).clipLaneDrag?.ghosts).toHaveLength(2);
    expect(previewOf(api)).toBeNull();
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 120, SFX_LANE_Y);
    pointerMoveTo(root, 1, 160, SFX_LANE_Y);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(previewOf(api)).toBeNull();
    expect(live(api).getArrangement()).toBe(live(api).arrangement);
    expect(live(api).clipLaneDrag?.ghosts.map((ghost) => [ghost.trackId, ghost.start])).toEqual([
      ['sfx', 5],
      ['sfx', 9],
    ]);
    pointerUpAt(root, 1, 160, SFX_LANE_Y);
    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(live(api).clipLaneDrag).toBeNull();
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'g1')).toMatchObject({ trackId: 'sfx', start: 5 });
    expect(clipIn(live(api).arrangement, 'g2')).toMatchObject({ trackId: 'sfx', start: 9 });
  });

  it('DP53 a group with a video clip previews through the store; release adds one Move (2) entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([
      AUDIO_CLIPS[0],
      VIDEO_CLIP,
      PROJECT_END_CLIP,
    ]);
    const { root, header } = clipParts('c1');
    const video = clipParts('v1');
    act(() => live(api).selectClips(['c1', 'v1']));
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 120);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('group preview missing');
    }
    expect(clipIn(shown, 'c1').start).toBe(5);
    expect(clipIn(shown, 'v1').start).toBe(4);
    expect(video.root.dataset.clipStart).toBe('4.000');
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    pointerUpAt(root, 1, 120);
    expect(live(api).undoLabel).toBe(studioClipStrings.historyMoveClips(2));
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(5);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
  });

  it('DP57 a video trimEnd move previews through the store; release adds one Trim entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    pointerDownAt(video.trimEnd, 4, 200, 50);
    pointerMoveTo(video.root, 4, 180, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 4, 160, 50);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video trim preview missing');
    }
    expect(clipIn(shown, 'v1').duration).toBe(3);
    expect(clipIn(live(api).arrangement, 'v1').duration).toBe(4);
    pointerUpAt(video.root, 4, 160, 50);
    expect(live(api).undoLabel).toBe(studioClipStrings.trimEndLabel);
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'v1').duration).toBe(3);
  });

  it('DP58 the video gap caption follows a stopped video move from the store', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    const video = clipParts('v1');
    expect(live(api).isPlaying).toBe(false);
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    pointerDownAt(video.header, 5, 60, 50);
    pointerMoveTo(video.root, 5, 40, 50);
    pointerMoveTo(video.root, 5, 20, 50);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(video.root.dataset.clipStart).toBe('0.000');
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    pointerMoveTo(video.root, 5, 60, 50);
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    pointerMoveTo(video.root, 5, 20, 50);
    pointerUpAt(video.root, 5, 20, 50);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(0);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
  });

  it('DP59 the video fade overlay follows a stopped video fade drag from the store', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    const video = clipParts('v1');
    const fade = video.root.querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!fade) {
      throw new Error('video fade handle missing');
    }
    pointerDownAt(fade, 6, 40, 50);
    pointerMoveTo(video.root, 6, 80, 50);
    pointerMoveTo(video.root, 6, 120, 50);
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
    const shownOpacity = overlay.dataset.videoOpacity;
    expect(shownOpacity).not.toBe('1.000');
    pointerUpAt(video.root, 6, 120, 50);
    expect(overlay.dataset.videoOpacity).toBe(shownOpacity);
    act(() => live(api).undo());
    expect(overlay.dataset.videoOpacity).toBe('1.000');
  });

  it('DP60 an audio move with a video clip present renders no video dock', async () => {
    const { view, clipParts } = await mountPreviewWorkspace([
      ...AUDIO_CLIPS,
      VIDEO_CLIP,
      PROJECT_END_CLIP,
    ]);
    const audio = clipParts('c1');
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(rendersOf('ArrangementVideoDock')).toBeGreaterThan(0);
    pointerDownAt(audio.header, 7, 80);
    pointerMoveTo(audio.root, 7, 120);
    renderLog.counts.clear();
    pointerMoveTo(audio.root, 7, 160);
    pointerMoveTo(audio.root, 7, 200);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
    expect(audio.root.dataset.clipStart).toBe('5.000');
    expect(rendersOf('ArrangementVideoDock')).toBe(0);
    expect(view.getByTestId('arrangement-video-fade')).toBe(overlay);
    pointerUpAt(audio.root, 7, 200);
  });

  it('DP61 a pointercancel mid video fade reverts the fade and the overlay with no entry; the readout stays', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    const video = clipParts('v1');
    const fade = video.root.querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!fade) {
      throw new Error('video fade handle missing');
    }
    const undoBefore = live(api).undoLabel;
    pointerDownAt(fade, 8, 40, 50);
    pointerMoveTo(video.root, 8, 80, 50);
    pointerMoveTo(video.root, 8, 120, 50);
    expect(overlay.dataset.videoOpacity).not.toBe('1.000');
    const readout = textOf(view, 'arrangement-status');
    fireEvent.pointerCancel(video.root, { pointerId: 8, clientX: 120, clientY: 50 });
    expect(previewOf(api)).toBeNull();
    expect(live(api).undoLabel).toBe(undoBefore);
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
    expect(video.root.dataset.fadeIn).toBe('0.000');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(textOf(view, 'arrangement-status')).toBe(readout);
  });

  it('DP62 a video move while playing renders no provider; release adds one Move clip entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
    try {
      expect(live(api).isPlaying).toBe(true);
      const video = clipParts('v1');
      pointerDownAt(video.header, 9, 40, 50);
      pointerMoveTo(video.root, 9, 80, 50);
      renderLog.counts.clear();
      pointerMoveTo(video.root, 9, 120, 50);
      pointerMoveTo(video.root, 9, 160, 50);
      expect(rendersOf('ArrangementProvider')).toBe(0);
      expect(rendersOf('StudioWorkspace')).toBe(0);
      expect(clipIn(live(api).getArrangement(), 'v1').start).toBe(4);
      expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
      pointerUpAt(video.root, 9, 160, 50);
      expect(live(api).isPlaying).toBe(true);
      expect(live(api).undoLabel).toBe('Move clip');
      expect(previewOf(api)).toBeNull();
      expect(clipIn(live(api).arrangement, 'v1').start).toBe(4);
    } finally {
      if (live(api).isPlaying) {
        act(() => live(api).togglePlayback());
      }
    }
  });

  it('DP54 a collapsed group overview follows a group move of its hidden clip without a workspace render', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([
      ...AUDIO_CLIPS,
      PROJECT_END_CLIP,
    ]);
    const before = live(api).getArrangement();
    act(() => {
      live(api).commitArrangement(
        {
          ...before,
          tracks: before.tracks.map((track) =>
            track.id === 'sfx' ? { ...track, groupId: 'g1' } : track,
          ),
          groups: [{ id: 'g1', name: 'Group 1', parentId: null }],
        },
        'Group Tracks',
        before,
      );
    });
    fireEvent.click(view.getByTestId('arrangement-group-fold'));
    act(() => live(api).selectClips(['c1', 'c2']));
    const block = () =>
      view.container.querySelector<HTMLElement>('[data-overview-clip-id="c2"]')?.dataset
        .overviewStart;
    expect(block()).toBe('1.000');
    const { root, header } = clipParts('c1');
    pointerDownAt(header, 1, 0);
    pointerMoveTo(root, 1, 40);
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 120);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementProvider')).toBe(0);
    expect(block()).toBe('4.000');
    pointerUpAt(root, 1, 120);
    expect(block()).toBe('4.000');
    act(() => live(api).undo());
    expect(block()).toBe('1.000');
  });

  it('DP55 a blocked group move shows the blocked status and leaves both clips in place', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([
      AUDIO_CLIPS[0],
      { id: 'c2', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 2 },
    ]);
    const { root, header } = clipParts('c1');
    act(() => live(api).selectClips(['c1', 'c2']));
    pointerDownAt(header, 1, 200);
    pointerMoveTo(root, 1, 160);
    pointerMoveTo(root, 1, 120);
    expect(textOf(view, 'arrangement-status')).toBe(GROUP_MOVE_BLOCKED_MESSAGE);
    expect(root.dataset.clipStart).toBe('2.000');
    renderLog.counts.clear();
    pointerMoveTo(root, 1, 80);
    expect(rendersOf('StudioWorkspace')).toBe(0);
    expect(rendersOf('ArrangementProvider')).toBeLessThanOrEqual(1);
    expect(rendersOf('ArrangementLane')).toBe(0);
    pointerUpAt(root, 1, 80);
    expect(clipIn(live(api).arrangement, 'c1').start).toBe(2);
    expect(clipIn(live(api).arrangement, 'c2').start).toBe(0);
    expect(previewOf(api)).toBeNull();
  });

  it('DP56 a window blur mid group move puts both clips back with no history entry', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, PROJECT_END_CLIP]);
    const first = clipParts('c1');
    const second = clipParts('c2');
    act(() => live(api).selectClips(['c1', 'c2']));
    const before = live(api).arrangement;
    pointerDownAt(first.header, 1, 0);
    pointerMoveTo(first.root, 1, 40);
    pointerMoveTo(first.root, 1, 80);
    expect(second.root.dataset.clipStart).toBe('3.000');
    expect(previewOf(api)).not.toBeNull();
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(first.root.dataset.clipStart).toBe('2.000');
    expect(second.root.dataset.clipStart).toBe('1.000');
    expect(live(api).arrangement).toBe(before);
    expect(live(api).getArrangement()).toBe(before);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
    expect(previewOf(api)).toBeNull();
  });
});

describe('PERF-DRAG-PREVIEW stage c6-i — header icons skip drag moves; the dock caption follows the store', () => {
  it('DP63 a stopped trim, move and fade re-render no lane fold or clip header icon', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, PROJECT_END_CLIP]);
    expect(rendersOf('GripVertical')).toBeGreaterThan(0);
    expect(rendersOf('ChevronDown')).toBeGreaterThan(0);
    type ClipParts = ReturnType<typeof clipParts>;
    const gestures: { label: string; handle: (parts: ClipParts) => HTMLElement; from: number }[] = [
      { label: 'trimStart', handle: (parts) => parts.trimStart, from: 0 },
      { label: 'move', handle: (parts) => parts.header, from: 80 },
      { label: 'fade', handle: (parts) => fadeHandleOf(parts.root), from: 0 },
    ];
    for (const gesture of gestures) {
      const parts = clipParts('c1');
      const { root } = parts;
      pointerDownAt(gesture.handle(parts), 1, gesture.from);
      let released = false;
      try {
        pointerMoveTo(root, 1, gesture.from + 40);
        renderLog.counts.clear();
        pointerMoveTo(root, 1, gesture.from + 80);
        pointerMoveTo(root, 1, gesture.from + 120);
        expect(rendersOf('ArrangementClipViewInner'), gesture.label).toBeGreaterThan(0);
        expect(rendersOf('GripVertical'), gesture.label).toBe(0);
        expect(rendersOf('ChevronDown'), gesture.label).toBe(0);
        expect(rendersOf('ChevronRight'), gesture.label).toBe(0);
        pointerUpAt(root, 1, gesture.from + 120);
        released = true;
        act(() => live(api).undo());
      } finally {
        if (!released) {
          pointerUpAt(root, 1, gesture.from + 120);
        }
      }
    }
  });

  it('DP64 the dock caption follows a stopped video move from the store', async () => {
    probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 4, width: 640, height: 360 });
    decodeVideoMock.mockImplementation(() => new Promise(() => undefined));
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS]);
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]);
    });
    await waitFor(() =>
      expect(live(api).arrangement.clips.some((clip) => clip.trackId === 'video')).toBe(true),
    );
    const imported = live(api).arrangement.clips.find((clip) => clip.trackId === 'video');
    if (!imported) {
      throw new Error('imported video clip missing');
    }
    const committedStart = imported.start;
    act(() => live(api).seekTo(committedStart + 1));
    expect(textOf(view, 'arrangement-video-caption')).toBe('film.mp4');
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${imported.id}"]`);
    const header = root?.firstElementChild;
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error('imported video clip not rendered');
    }
    stubCapture(root);
    const pressX = committedStart * PX_PER_SECOND;
    pointerDownAt(header, 10, pressX, 50);
    pointerMoveTo(root, 10, pressX + 40, 50);
    pointerMoveTo(root, 10, pressX + 80, 50);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video move preview missing');
    }
    expect(clipIn(live(api).arrangement, imported.id).start).toBe(committedStart);
    expect(clipIn(shown, imported.id).start).toBeGreaterThan(committedStart + 1);
    expect(textOf(view, 'arrangement-video-caption')).toBe('');
    pointerUpAt(root, 10, pressX + 80, 50);
    expect(textOf(view, 'arrangement-video-caption')).toBe('');
    act(() => live(api).undo());
    expect(textOf(view, 'arrangement-video-caption')).toBe('film.mp4');
  });

  it('DP65 a stopped trim, move and fade re-render no lane mix fader and no detail clip gain', async () => {
    const { api, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, PROJECT_END_CLIP]);
    expect(rendersOf('ArrangementMixFader')).toBeGreaterThan(0);
    expect(rendersOf('ArrangementDetailClipGain')).toBeGreaterThan(0);
    type ClipParts = ReturnType<typeof clipParts>;
    const gestures: { label: string; handle: (parts: ClipParts) => HTMLElement; from: number }[] = [
      { label: 'trimStart', handle: (parts) => parts.trimStart, from: 0 },
      { label: 'move', handle: (parts) => parts.header, from: 80 },
      { label: 'fade', handle: (parts) => fadeHandleOf(parts.root), from: 0 },
    ];
    for (const gesture of gestures) {
      const parts = clipParts('c1');
      const { root } = parts;
      pointerDownAt(gesture.handle(parts), 1, gesture.from);
      let released = false;
      try {
        pointerMoveTo(root, 1, gesture.from + 40);
        expect(live(api).getSelectedClipIds(), gesture.label).toEqual(['c1']);
        renderLog.counts.clear();
        pointerMoveTo(root, 1, gesture.from + 80);
        pointerMoveTo(root, 1, gesture.from + 120);
        expect(rendersOf('ArrangementClipViewInner'), gesture.label).toBeGreaterThan(0);
        expect(rendersOf('ArrangementMixFader'), gesture.label).toBe(0);
        expect(rendersOf('ArrangementDetailClipGain'), gesture.label).toBe(0);
        pointerUpAt(root, 1, gesture.from + 120);
        released = true;
        act(() => live(api).undo());
      } finally {
        if (!released) {
          pointerUpAt(root, 1, gesture.from + 120);
        }
      }
    }
  });
});

const VIDEO_DOCK_COMPONENTS = [
  'ArrangementVideoDock',
  'ArrangementVideoCaption',
  'ArrangementVideoFadeOverlay',
  'ArrangementVideoGapCaption',
];

function videoDockRenders(): Record<string, number> {
  return Object.fromEntries(VIDEO_DOCK_COMPONENTS.map((name) => [name, rendersOf(name)]));
}

const NO_VIDEO_DOCK_RENDERS = Object.fromEntries(VIDEO_DOCK_COMPONENTS.map((name) => [name, 0]));

function videoFadeHandleOf(root: HTMLElement): HTMLElement {
  const fade = root.querySelector<HTMLElement>('[data-testid="arrangement-video-fade-in-handle"]');
  if (!fade) {
    throw new Error('video fade handle missing');
  }
  return fade;
}

function observeVideoOpacity(overlay: HTMLElement): MutationObserver {
  const observer = new MutationObserver(() => undefined);
  observer.observe(overlay, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-video-opacity'],
  });
  return observer;
}

describe('PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 — the video dock reads the drag preview without rendering', () => {
  it('DP66 a video trimStart move renders no dock component; the clip shows the preview; release adds one Trim entry', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(4));
    const video = clipParts('v1');
    expect(rendersOf('ArrangementVideoDock')).toBeGreaterThan(0);
    pointerDownAt(video.trimStart, 11, 40, 50);
    pointerMoveTo(video.root, 11, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 11, 100, 50);
    pointerMoveTo(video.root, 11, 120, 50);
    expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
    expect(videoDockRenders()).toEqual(NO_VIDEO_DOCK_RENDERS);
    expect(video.root.dataset.clipStart).toBe('3.000');
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    const undoBefore = live(api).undoLabel;
    pointerUpAt(video.root, 11, 120, 50);
    expect(undoBefore).not.toBe(studioClipStrings.trimStartLabel);
    expect(live(api).undoLabel).toBe(studioClipStrings.trimStartLabel);
    expect(previewOf(api)).toBeNull();
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(3);
    act(() => live(api).undo());
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(live(api).undoLabel).toBe(undoBefore);
  });

  it('DP67 a video fade-in move renders no dock component; the overlay follows the preview inside the fade', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    const video = clipParts('v1');
    pointerDownAt(videoFadeHandleOf(video.root), 12, 40, 50);
    pointerMoveTo(video.root, 12, 80, 50);
    renderLog.counts.clear();
    pointerMoveTo(video.root, 12, 100, 50);
    const firstPreview = previewOf(api);
    if (!firstPreview) {
      throw new Error('video fade preview missing');
    }
    const firstOpacity = overlay.dataset.videoOpacity;
    expect(firstOpacity).toBe(videoFadeOpacityAt(firstPreview, 2).toFixed(3));
    pointerMoveTo(video.root, 12, 120, 50);
    const secondPreview = previewOf(api);
    if (!secondPreview) {
      throw new Error('video fade preview missing');
    }
    const secondOpacity = overlay.dataset.videoOpacity;
    expect(secondOpacity).toBe(videoFadeOpacityAt(secondPreview, 2).toFixed(3));
    expect(Number(firstOpacity)).toBeLessThan(1);
    expect(Number(secondOpacity)).toBeLessThan(Number(firstOpacity));
    expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBe(0);
    expect(videoDockRenders()).toEqual(NO_VIDEO_DOCK_RENDERS);
    pointerUpAt(video.root, 12, 120, 50);
    expect(live(api).undoLabel).toBe('Video Fade In');
    expect(overlay.dataset.videoOpacity).toBe(secondOpacity);
  });

  it('DP68 a video trimStart that uncovers the playhead shows the gap during the preview; it stays after release; Undo removes it', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(1.5));
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    const video = clipParts('v1');
    pointerDownAt(video.trimStart, 13, 40, 50);
    pointerMoveTo(video.root, 13, 60, 50);
    pointerMoveTo(video.root, 13, 80, 50);
    expect(video.root.dataset.clipStart).toBe('2.000');
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    pointerUpAt(video.root, 13, 80, 50);
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(2);
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    act(() => live(api).undo());
    expect(clipIn(live(api).arrangement, 'v1').start).toBe(1);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
  });

  it('DP69 the fade release writes nothing to the overlay, so the pre-drag opacity never returns', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    const video = clipParts('v1');
    pointerDownAt(videoFadeHandleOf(video.root), 14, 40, 50);
    pointerMoveTo(video.root, 14, 80, 50);
    pointerMoveTo(video.root, 14, 120, 50);
    const shownBeforeRelease = overlay.dataset.videoOpacity;
    expect(shownBeforeRelease).not.toBe('1.000');
    const observer = observeVideoOpacity(overlay);
    try {
      pointerUpAt(video.root, 14, 120, 50);
      const records = observer.takeRecords();
      expect(records.map((record) => record.oldValue)).not.toContain('1.000');
      expect(records).toHaveLength(0);
      expect(overlay.dataset.videoOpacity).toBe(shownBeforeRelease);
      expect(clipIn(live(api).arrangement, 'v1').fadeIn ?? 0).toBeGreaterThan(0);
      expect(previewOf(api)).toBeNull();
    } finally {
      observer.disconnect();
    }
  });

  it('DP70 Undo and Redo of a committed video fade and trim rewrite the overlay and the gap with no preview', async () => {
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS, VIDEO_CLIP]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    const before = live(api).getArrangement();
    const faded: Arrangement = {
      ...before,
      clips: before.clips.map((clip) => (clip.id === 'v1' ? { ...clip, fadeIn: 2 } : clip)),
    };
    const fadedOpacity = videoFadeOpacityAt(faded, 2).toFixed(3);
    expect(fadedOpacity).not.toBe('1.000');
    act(() => {
      live(api).commitArrangement(faded, 'Video Fade In', before);
    });
    expect(previewOf(api)).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
    const trimmed: Arrangement = {
      ...faded,
      clips: faded.clips.map((clip) =>
        clip.id === 'v1' ? { ...clip, start: 2.5, sourceOffset: 1.5, duration: 2.5 } : clip,
      ),
    };
    act(() => {
      live(api).commitArrangement(trimmed, studioClipStrings.trimStartLabel, faded);
    });
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    act(() => live(api).undo());
    expect(previewOf(api)).toBeNull();
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
    act(() => live(api).undo());
    expect(previewOf(api)).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    act(() => live(api).redo());
    expect(previewOf(api)).toBeNull();
    expect(overlay.dataset.videoOpacity).toBe(fadedOpacity);
    expect(view.queryByTestId('arrangement-video-gap')).toBeNull();
    act(() => live(api).redo());
    expect(previewOf(api)).toBeNull();
    expect(view.queryByTestId('arrangement-video-gap')).not.toBeNull();
    expect(overlay.dataset.videoOpacity).toBe('1.000');
  });

  it('DP71 an audio move with a video clip present renders no dock component and writes no video opacity', async () => {
    const { api, view, clipParts } = await mountPreviewWorkspace([
      ...AUDIO_CLIPS,
      { ...VIDEO_CLIP, fadeIn: 2 },
      PROJECT_END_CLIP,
    ]);
    act(() => live(api).seekTo(2));
    const overlay = view.getByTestId('arrangement-video-fade');
    const restingOpacity = overlay.dataset.videoOpacity;
    expect(restingOpacity).not.toBe('1.000');
    const audio = clipParts('c1');
    expect(rendersOf('ArrangementVideoDock')).toBeGreaterThan(0);
    pointerDownAt(audio.header, 15, 80);
    pointerMoveTo(audio.root, 15, 120);
    renderLog.counts.clear();
    const observer = observeVideoOpacity(overlay);
    try {
      pointerMoveTo(audio.root, 15, 160);
      pointerMoveTo(audio.root, 15, 200);
      expect(rendersOf('ArrangementClipViewInner')).toBeGreaterThan(0);
      expect(audio.root.dataset.clipStart).toBe('5.000');
      expect(videoDockRenders()).toEqual(NO_VIDEO_DOCK_RENDERS);
      expect(observer.takeRecords()).toHaveLength(0);
      expect(overlay.dataset.videoOpacity).toBe(restingOpacity);
    } finally {
      observer.disconnect();
      pointerUpAt(audio.root, 15, 200);
    }
  });

  it('DP72 a stopped video move drag seeks the frame to the previewed clip before release', async () => {
    probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 4, width: 640, height: 360 });
    decodeVideoMock.mockImplementation(() => new Promise(() => undefined));
    const seeks: number[] = [];
    vi.spyOn(HTMLMediaElement.prototype, 'currentTime', 'set').mockImplementation(function (
      this: HTMLMediaElement,
      value: number,
    ) {
      if (this instanceof HTMLVideoElement) {
        seeks.push(value);
      }
    });
    const { api, view } = await mountPreviewWorkspace([...AUDIO_CLIPS]);
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]);
    });
    await waitFor(() =>
      expect(live(api).arrangement.clips.some((clip) => clip.trackId === 'video')).toBe(true),
    );
    const imported = live(api).arrangement.clips.find((clip) => clip.trackId === 'video');
    if (!imported) {
      throw new Error('imported video clip missing');
    }
    const playhead = imported.start + 2;
    act(() => live(api).seekTo(playhead));
    await waitFor(() =>
      expect(seeks.at(-1)).toBeCloseTo(playhead - imported.start + imported.sourceOffset, 3),
    );
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${imported.id}"]`);
    const header = root?.firstElementChild;
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error('imported video clip not rendered');
    }
    stubCapture(root);
    const pressX = imported.start * PX_PER_SECOND;
    pointerDownAt(header, 10, pressX, 50);
    pointerMoveTo(root, 10, pressX + 20, 50);
    pointerMoveTo(root, 10, pressX + 40, 50);
    const shown = previewOf(api);
    if (!shown) {
      throw new Error('video move preview missing');
    }
    const shownStart = clipIn(shown, imported.id).start;
    expect(clipIn(live(api).arrangement, imported.id).start).toBe(imported.start);
    expect(shownStart - imported.start).toBeGreaterThan(0.01);
    expect(shownStart).toBeLessThan(playhead);
    const previewTarget = playhead - shownStart + imported.sourceOffset;
    await waitFor(() => expect(seeks.at(-1)).toBeCloseTo(previewTarget, 3));
    const writesBeforeRelease = seeks.length;
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      pointerUpAt(root, 10, pressX + 40, 50);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
    } finally {
      vi.useRealTimers();
    }
    expect(clipIn(live(api).arrangement, imported.id).start).toBe(shownStart);
    expect(seeks).toHaveLength(writesBeforeRelease);
    act(() => live(api).undo());
    await waitFor(() => expect(seeks.length).toBeGreaterThan(writesBeforeRelease));
    await waitFor(() =>
      expect(seeks.at(-1)).toBeCloseTo(playhead - imported.start + imported.sourceOffset, 3),
    );
  });
});
