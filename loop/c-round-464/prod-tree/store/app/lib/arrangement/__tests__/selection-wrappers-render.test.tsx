import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
import { createArrangement } from '../model';

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
  const groupHeaderIds: string[] = [];
  const groupIdOf = (props: unknown): string | null => {
    if (typeof props !== 'object' || props === null || !('group' in props)) {
      return null;
    }
    const group = props.group;
    if (typeof group !== 'object' || group === null || !('id' in group)) {
      return null;
    }
    return typeof group.id === 'string' ? group.id : null;
  };
  const seen = new WeakMap<object, { props: unknown; state: unknown }>();
  const componentName = (type: unknown): string | null =>
    typeof type === 'function' && 'name' in type && typeof type.name === 'string'
      ? type.name
      : null;
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
          const groupId = name === 'ArrangementGroupHeader' ? groupIdOf(fiber.memoizedProps) : null;
          if (groupId !== null) {
            groupHeaderIds.push(groupId);
          }
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
  return { counts, groupHeaderIds };
});

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

const resizeCallbacks = new Set<() => void>();

class ControlledResizeObserver {
  private readonly callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  observe() {
    resizeCallbacks.add(this.callback);
  }
  disconnect() {
    resizeCallbacks.delete(this.callback);
  }
}

const SOURCE_LENGTHS: Record<string, number> = { song: 4000, stem: 1000, hit: 200 };

const wrappersCollection: WorkspaceCollection = {
  id: 'selection-wrappers',
  label: 'selection-wrappers',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'selection-wrappers',
      kind: 'music',
      origin: 'demo',
    },
    {
      id: 'stem',
      title: 'Stem',
      collectionLabel: 'selection-wrappers',
      kind: 'stem',
      origin: 'demo',
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'selection-wrappers', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: SOURCE_LENGTHS[source.id] ?? 100,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

const WRAPPER_CLIPS: ArrangementClip[] = [
  { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
  { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 2, sourceOffset: 0, duration: 6 },
  { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function wrappersArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: WRAPPER_CLIPS,
  };
}

interface WrappersApiRef {
  current: ArrangementContextValue | null;
}

function WrappersProbe({ api }: { api: WrappersApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: WrappersApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountGroupsWorkspace() {
  const api: WrappersApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={wrappersCollection} initialArrangement={wrappersArrangement()}>
      <StudioWorkspace />
      <WrappersProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 && ['song', 'stem', 'hit'].some((id) => !live(api).sourceDurations.has(id));
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => live(api).setPxPerSecond(40));
  return { api, view };
}

type WrappersView = ReturnType<typeof render>;

function laneName(view: WrappersView, name: string): HTMLElement {
  return view.getByRole('button', {
    name: new RegExp(`^${name} — set as the active track`),
  });
}

function clickLane(view: WrappersView, name: string, modifiers: MouseEventInit = {}) {
  fireEvent.click(laneName(view, name), modifiers);
}

function pressGroupKey(shift = false, target: Element = document.body) {
  fireEvent.keyDown(target, {
    key: shift ? 'G' : 'g',
    code: 'KeyG',
    ctrlKey: true,
    shiftKey: shift,
  });
}

function foldButton(view: WrappersView, name: string): HTMLElement {
  return view.getByRole('button', { name: `Fold or unfold group — ${name}` });
}

function overviewBlocks(view: WrappersView): HTMLElement[] {
  return Array.from(view.container.querySelectorAll<HTMLElement>('[data-overview-clip-id]'));
}

function selectedOverviewBlocks(view: WrappersView): HTMLElement[] {
  return overviewBlocks(view).filter((block) => block.dataset.overviewSelected === 'true');
}

async function mountCollapsedGroup() {
  const mounted = await mountGroupsWorkspace();
  const { view } = mounted;
  clickLane(view, 'სტემები');
  clickLane(view, 'SFX', { shiftKey: true });
  pressGroupKey();
  fireEvent.click(foldButton(view, 'Group 1'));
  expect(foldButton(view, 'Group 1').getAttribute('aria-expanded')).toBe('false');
  expect(overviewBlocks(view).map((block) => block.dataset.overviewClipId)).toEqual(['cs', 'cx']);
  expect(selectedOverviewBlocks(view)).toHaveLength(0);
  return mounted;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  resizeCallbacks.clear();
  renderLog.counts.clear();
  renderLog.groupHeaderIds.length = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
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

describe('PERF-8b selection wrappers render only on their own inputs (SS8, C-R323-02)', () => {
  it(
    'SS8a a folded group header does not re-render on a workspace commit that changes none of its props',
    {
      timeout: 20_000,
    },
    async () => {
      const { api, view } = await mountCollapsedGroup();
      renderLog.counts.clear();
      act(() => live(api).setStatus('Positive control'));
      expect(view.getByTestId('arrangement-status').textContent).toContain('Positive control');
      act(() => live(api).resetExportState());
      expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
    },
  );

  it(
    'SS8b selecting every clip re-renders the folded group header and marks each overview block selected',
    {
      timeout: 20_000,
    },
    async () => {
      const { view } = await mountCollapsedGroup();
      renderLog.counts.clear();
      fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA', ctrlKey: true });
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBeGreaterThan(
        0,
      );
      expect(foldButton(view, 'Group 1').getAttribute('aria-expanded')).toBe('false');
      const blocks = overviewBlocks(view);
      expect(blocks).toHaveLength(2);
      expect(blocks.map((block) => block.dataset.overviewSelected)).toEqual(['true', 'true']);
    },
  );
});

describe('PERF-11c-i the group header leaf reads no workspace context (GATE361-S1, SIG-R361)', () => {
  it(
    'GH1 a status write renders neither the folded group wrapper nor the header leaf',
    {
      timeout: 20_000,
    },
    async () => {
      const { api, view } = await mountCollapsedGroup();
      expect(renderLog.counts.get('ArrangementTransportViewInner') ?? 0).toBeGreaterThan(0);
      renderLog.counts.clear();
      act(() => live(api).setStatus('GH1 positive control'));
      expect(view.getByTestId('arrangement-status').textContent).toContain('GH1 positive control');
      expect(renderLog.counts.get('ArrangementTransportViewInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBe(0);
      act(() => live(api).resetExportState());
      expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBe(0);
    },
  );

  it(
    'GH2 an arrangement edit outside the folded group renders neither the wrapper nor the header leaf',
    {
      timeout: 20_000,
    },
    async () => {
      const { api, view } = await mountCollapsedGroup();
      const undoBefore = live(api).undoLabel;
      renderLog.counts.clear();
      act(() => live(api).toggleTrackMute('music'));
      expect(live(api).arrangement.tracks.find((track) => track.id === 'music')?.mute).toBe(true);
      expect(live(api).undoLabel).not.toBe(undoBefore);
      expect(renderLog.counts.get('StudioWorkspace') ?? 0).toBeGreaterThan(0);
      expect(renderLog.counts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0).toBe(0);
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBe(0);
      expect(overviewBlocks(view).map((block) => block.dataset.overviewStart)).toEqual([
        '2.000',
        '4.000',
      ]);
    },
  );

  it(
    'GH3 a nudge of a member clip re-renders the header and moves its overview block',
    {
      timeout: 20_000,
    },
    async () => {
      const { api, view } = await mountCollapsedGroup();
      act(() => live(api).selectClips(['cs']));
      renderLog.counts.clear();
      fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
      const moved = live(api).arrangement.clips.find((clip) => clip.id === 'cs')?.start ?? 2;
      expect(moved).toBeGreaterThan(2);
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBeGreaterThan(0);
      expect(
        overviewBlocks(view).find((block) => block.dataset.overviewClipId === 'cs')?.dataset
          .overviewStart,
      ).toBe(moved.toFixed(3));
    },
  );

  it(
    'GH4 soloing a member lane updates the folded group Solo state, and clearing it returns to off',
    {
      timeout: 20_000,
    },
    async () => {
      const { api, view } = await mountCollapsedGroup();
      const solo = view.getByTestId('arrangement-group-solo');
      expect(solo.dataset.solo).toBe('off');
      renderLog.counts.clear();
      act(() => live(api).toggleTrackSolo('stems', false));
      expect(solo.dataset.solo).toBe('mixed');
      expect(solo.getAttribute('aria-pressed')).toBe('mixed');
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBeGreaterThan(0);
      act(() => live(api).toggleTrackSolo('stems', false));
      expect(solo.dataset.solo).toBe('off');
      fireEvent.click(solo);
      expect(solo.dataset.solo).toBe('on');
      fireEvent.click(view.getByTestId('arrangement-group-mute'));
      expect(view.getByTestId('arrangement-group-mute').getAttribute('aria-pressed')).toBe('true');
    },
  );
  it(
    'GH5 muting a second group renders that group header only, never the folded first group',
    {
      timeout: 20_000,
    },
    async () => {
      const { api, view } = await mountCollapsedGroup();
      clickLane(view, 'მუსიკა');
      pressGroupKey();
      expect(view.getAllByTestId('arrangement-group-header')).toHaveLength(2);
      const mutes = view.getAllByTestId('arrangement-group-mute');
      renderLog.counts.clear();
      renderLog.groupHeaderIds.length = 0;
      fireEvent.click(mutes[0]);
      expect(mutes[0].getAttribute('aria-pressed')).toBe('true');
      expect(mutes[1].getAttribute('aria-pressed')).toBe('false');
      expect(renderLog.counts.get('ArrangementGroupHeader') ?? 0).toBe(1);
      const muted = (live(api).arrangement.groups ?? []).filter((group) => group.mute === true);
      expect(muted).toHaveLength(1);
      expect(muted[0].id).not.toBe('g1');
      expect(renderLog.groupHeaderIds).toEqual([muted[0].id]);
    },
  );
});
