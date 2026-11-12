import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ArrangementLibraryPreview,
  type LibraryTrackLabel,
  sameLibraryLeafProps,
  sameLibraryTrackLabels,
} from '~/components/arrangement/ArrangementLibraryPreview';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { useWorkspaceStatusProbe, type WorkspaceStatusProbeValue } from './helpers/workspace-probe';

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

const previewCollection: WorkspaceCollection = {
  id: 'preview',
  label: 'preview',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'preview', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function previewArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
}

interface PreviewApiRef {
  current: WorkspaceStatusProbeValue | null;
}

function PreviewApiProbe({ api }: { api: PreviewApiRef }) {
  api.current = useWorkspaceStatusProbe();
  return null;
}

function activeLaneRow(view: ReturnType<typeof render>): HTMLParagraphElement {
  const row = view.getByTestId('arrangement-library-insert-marker').closest('p');
  if (!row) {
    throw new Error('active-lane row not found');
  }
  return row;
}

describe('ArrangementLibraryPreview active-lane row and insert-marker memo (C-R16-01, M-R10-1/M2, C-R250-01)', () => {
  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    fakeClock.base = Date.now() / 1000;
    renderLog.counts.clear();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function mountPreview(arrangement: Arrangement = previewArrangement()) {
    const api: PreviewApiRef = { current: null };
    const view = render(
      <ArrangementProvider collection={previewCollection} initialArrangement={arrangement}>
        <ArrangementLibraryPreview sourceId="song" />
        <PreviewApiProbe api={api} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    return { api, view };
  }

  function runFrames() {
    const pending = frames.splice(0, frames.length);
    act(() => {
      for (const frame of pending) {
        frame(performance.now());
      }
    });
  }

  it('reserves exactly two clamped lines for the active-lane row on an audio lane (C-R16-01)', async () => {
    const { view } = await mountPreview();
    const row = activeLaneRow(view);
    const tokens = row.className.split(/\s+/);
    expect(tokens).toContain('h-8');
    expect(tokens).toContain('line-clamp-2');
    expect(tokens).not.toContain('truncate');
    expect(row.getAttribute('title')).toBe('Active track: მუსიკა');
    expect(row.getAttribute('title')).toBe(row.textContent?.split('·')[0].trim());
    expect(row.textContent).toContain('· insert marker 00:00.000');
    const laneNames = Array.from(row.querySelectorAll('span')).filter(
      (span) => span.textContent === 'მუსიკა',
    );
    expect(laneNames).toHaveLength(1);
    expect(laneNames[0]?.classList.contains('text-foreground')).toBe(true);
    expect(
      Array.from(row.querySelectorAll('span')).find((span) =>
        span.classList.contains('text-foreground'),
      ),
    ).toBe(laneNames[0]);
  });

  it('keeps the video note in the title and visible text when the video lane is active (C-R16-01)', async () => {
    const { api, view } = await mountPreview();
    act(() => api.current?.setActiveTrack('video'));
    const row = activeLaneRow(view);
    expect(row.getAttribute('title')).toBe('Active track: ვიდეო (audio is not added here)');
    expect(row.getAttribute('title')).toBe(row.textContent?.split('·')[0].trim());
    expect(row.textContent).toContain('· insert marker 00:00.000');
    const add = view.getByRole('button', { name: 'Add' });
    expect(add.getAttribute('aria-disabled')).toBe('true');
    expect(add.hasAttribute('disabled')).toBe(false);
    expect(add.title).toBe('Add — make an audio track active first');
    act(() => api.current?.setActiveTrack('sfx'));
    expect(activeLaneRow(view).getAttribute('title')).toBe('Active track: SFX');
    expect(activeLaneRow(view)).toBe(row);
  });

  it('titles the row with a dash when no lane is active (C-R16-01)', async () => {
    const { view } = await mountPreview(
      createArrangement([{ id: 'video', kind: 'video', name: 'ვიდეო' }]),
    );
    const row = activeLaneRow(view);
    expect(row.getAttribute('title')).toBe('Active track: —');
    expect(row.getAttribute('title')).toBe(row.textContent?.split('·')[0].trim());
  });

  it('advances the library-preview cursor without rendering LibraryInsertMarkerText (M-R10-1/M2)', async () => {
    const { view } = await mountPreview();
    const wave = view.getByTestId('arrangement-library-preview-wave');
    const insertMarkerText = view.getByTestId('arrangement-library-insert-marker');
    expect(renderLog.counts.get('LibraryInsertMarkerText') ?? 0).toBeGreaterThan(0);
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(view.getByTestId('arrangement-library-preview-toggle').textContent).toBe('Stop');
    runFrames();
    renderLog.counts.clear();
    const cursorTexts: string[] = [];
    for (let step = 1; step <= 12; step++) {
      fakeClock.base -= 0.1;
      runFrames();
      cursorTexts.push(wave.getAttribute('aria-valuetext') ?? '');
    }
    expect(new Set(cursorTexts).size).toBe(12);
    expect(renderLog.counts.get('ArrangementLibraryPreviewViewInner') ?? 0).toBeGreaterThanOrEqual(
      10,
    );
    expect(renderLog.counts.get('LibraryInsertMarkerText') ?? 0).toBe(0);
    expect(view.getByTestId('arrangement-library-insert-marker')).toBe(insertMarkerText);
    expect(insertMarkerText.textContent).toBe('00:00.000');
  });

  it('HT1 held Enter on the preview toggle prevents only the repeats (B-R98-H1-PREVIEW-TOGGLE-HOLD)', async () => {
    const { view } = await mountPreview();
    const toggle = view.getByTestId('arrangement-library-preview-toggle');
    expect(toggle.textContent).toBe('Preview');
    expect(fireEvent.keyDown(toggle, { key: 'Enter', repeat: false })).toBe(true);
    expect(toggle.textContent).toBe('Preview');
    expect(fireEvent.keyDown(toggle, { key: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(toggle, { key: 'Enter', repeat: true })).toBe(false);
    expect(toggle.textContent).toBe('Preview');
    fireEvent.click(toggle);
    expect(toggle.textContent).toBe('Stop');
  });

  it('HT2 fresh Enter presses on the preview toggle keep their default (B-R98-H1-PREVIEW-TOGGLE-HOLD)', async () => {
    const { view } = await mountPreview();
    const toggle = view.getByTestId('arrangement-library-preview-toggle');
    expect(fireEvent.keyDown(toggle, { key: 'Enter', repeat: false })).toBe(true);
    expect(fireEvent.keyDown(toggle, { key: 'Enter', repeat: false })).toBe(true);
    expect(toggle.textContent).toBe('Preview');
  });

  it('HT3 the preview toggle guard is Enter-only and keeps propagation (B-R98-H1-PREVIEW-TOGGLE-HOLD)', async () => {
    const { view } = await mountPreview();
    const toggle = view.getByTestId('arrangement-library-preview-toggle');
    expect(fireEvent.keyDown(toggle, { key: 'q', repeat: true })).toBe(true);
    expect(fireEvent.keyDown(toggle, { key: ' ', repeat: true })).toBe(true);
    const seen: Array<{ key: string; repeat: boolean }> = [];
    const listener = (event: KeyboardEvent) => {
      seen.push({ key: event.key, repeat: event.repeat });
    };
    document.addEventListener('keydown', listener);
    try {
      fireEvent.keyDown(toggle, { key: 'Enter', repeat: true });
    } finally {
      document.removeEventListener('keydown', listener);
    }
    expect(seen).toEqual([{ key: 'Enter', repeat: true }]);
  });

  async function mountPreviewFor(
    loadSource: WorkspaceCollection['loadSource'],
    sourceId: string | null,
  ) {
    const api: PreviewApiRef = { current: null };
    const view = render(
      <ArrangementProvider
        collection={{ ...previewCollection, loadSource }}
        initialArrangement={previewArrangement()}
      >
        <ArrangementLibraryPreview sourceId={sourceId} />
        <PreviewApiProbe api={api} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    return { api, view };
  }

  function liveApi(api: PreviewApiRef): WorkspaceStatusProbeValue {
    if (!api.current) {
      throw new Error('provider not mounted');
    }
    return api.current;
  }

  function previewToggle(view: ReturnType<typeof render>): HTMLElement {
    return view.getByTestId('arrangement-library-preview-toggle');
  }

  it('LPA1 a soft-disabled Add on the video track blocks mouse focus, adds no clip and writes no status (SYS-5 stage 2)', async () => {
    const { api, view } = await mountPreview();
    act(() => liveApi(api).setActiveTrack('video'));
    const add = view.getByRole('button', { name: 'Add' });
    expect(add.getAttribute('aria-disabled')).toBe('true');
    const clipsBefore = liveApi(api).arrangement.clips.length;
    const statusBefore = liveApi(api).status;
    expect(fireEvent.mouseDown(add)).toBe(false);
    fireEvent.click(add);
    expect(liveApi(api).arrangement.clips.length).toBe(clipsBefore);
    expect(liveApi(api).status).toBe(statusBefore);
  });

  it('LPA2 Add on an audio track is available, titled for the insert marker, and a click adds one clip', async () => {
    const { api, view } = await mountPreview();
    const add = view.getByRole('button', { name: 'Add' });
    expect(add.hasAttribute('aria-disabled')).toBe(false);
    expect(add.hasAttribute('disabled')).toBe(false);
    expect(add.title).toBe('Add to the active track at the insert marker');
    const clipsBefore = liveApi(api).arrangement.clips.length;
    fireEvent.click(add);
    expect(liveApi(api).arrangement.clips.length).toBe(clipsBefore + 1);
  });

  it('LPA3 the no-sound, loading and failed states give Preview and Add their exact reasons and soft-disable both', async () => {
    const cases: Array<{
      label: string;
      loadSource: WorkspaceCollection['loadSource'];
      sourceId: string | null;
      previewTitle: string;
      addTitle: string;
    }> = [
      {
        label: 'no sound',
        loadSource: previewCollection.loadSource,
        sourceId: null,
        previewTitle: 'Preview — select a sound in the list first',
        addTitle: 'Add — select a sound in the list first',
      },
      {
        label: 'loading',
        loadSource: () => new Promise<AudioBuffer>(() => undefined),
        sourceId: 'song',
        previewTitle: 'Preview — wait for the sound to load',
        addTitle: 'Add — wait for the sound to load',
      },
      {
        label: 'failed',
        loadSource: () => Promise.reject(new Error('decode failed')),
        sourceId: 'song',
        previewTitle: 'Preview — this sound could not load; choose another',
        addTitle: 'Add — this sound could not load; choose another',
      },
    ];
    for (const entry of cases) {
      const { view } = await mountPreviewFor(entry.loadSource, entry.sourceId);
      const preview = previewToggle(view);
      const add = view.getByRole('button', { name: 'Add' });
      expect(preview.getAttribute('aria-disabled'), entry.label).toBe('true');
      expect(preview.hasAttribute('disabled'), entry.label).toBe(false);
      expect(preview.title, entry.label).toBe(entry.previewTitle);
      expect(add.getAttribute('aria-disabled'), entry.label).toBe('true');
      expect(add.hasAttribute('disabled'), entry.label).toBe(false);
      expect(add.title, entry.label).toBe(entry.addTitle);
      view.unmount();
    }
  });

  it('LPA3b the preview strip carries the same unavailable reason as Preview while not ready, and no title once ready (PERF-15b)', async () => {
    const cases: Array<{
      label: string;
      loadSource: WorkspaceCollection['loadSource'];
      sourceId: string | null;
      title: string;
    }> = [
      {
        label: 'no sound',
        loadSource: previewCollection.loadSource,
        sourceId: null,
        title: 'Preview — select a sound in the list first',
      },
      {
        label: 'loading',
        loadSource: () => new Promise<AudioBuffer>(() => undefined),
        sourceId: 'song',
        title: 'Preview — wait for the sound to load',
      },
      {
        label: 'failed',
        loadSource: () => Promise.reject(new Error('decode failed')),
        sourceId: 'song',
        title: 'Preview — this sound could not load; choose another',
      },
    ];
    for (const entry of cases) {
      const { view } = await mountPreviewFor(entry.loadSource, entry.sourceId);
      const strip = view.getByTestId('arrangement-library-preview-wave');
      expect(strip.getAttribute('aria-disabled'), entry.label).toBe('true');
      expect(strip.getAttribute('title'), entry.label).toBe(entry.title);
      expect(previewToggle(view).title, entry.label).toBe(entry.title);
      view.unmount();
    }
    const { view } = await mountPreview();
    const strip = view.getByTestId('arrangement-library-preview-wave');
    expect(strip.getAttribute('aria-disabled')).toBe('false');
    expect(strip.hasAttribute('title')).toBe(false);
  });

  it('LPA4 a click on a soft-disabled Preview starts no preview', async () => {
    const { api, view } = await mountPreviewFor(
      () => new Promise<AudioBuffer>(() => undefined),
      'song',
    );
    const preview = previewToggle(view);
    expect(preview.getAttribute('aria-disabled')).toBe('true');
    const statusBefore = liveApi(api).status;
    expect(fireEvent.mouseDown(preview)).toBe(false);
    fireEvent.click(preview);
    expect(liveApi(api).libraryPreviewSourceId).toBeNull();
    expect(liveApi(api).status).toBe(statusBefore);
    expect(preview.textContent).toBe('Preview');
  });

  it('LPA5 a focused soft-disabled Add keeps focus when an audio track becomes active, and a click then adds exactly one clip', async () => {
    const { api, view } = await mountPreview();
    act(() => liveApi(api).setActiveTrack('video'));
    const add = view.getByRole('button', { name: 'Add' });
    act(() => add.focus());
    expect(document.activeElement).toBe(add);
    expect(add.getAttribute('aria-disabled')).toBe('true');
    act(() => liveApi(api).setActiveTrack('music'));
    expect(add.hasAttribute('aria-disabled')).toBe(false);
    expect(document.activeElement).toBe(add);
    const clipsBefore = liveApi(api).arrangement.clips.length;
    fireEvent.click(add);
    expect(liveApi(api).arrangement.clips.length).toBe(clipsBefore + 1);
  });
});

describe('Library leaf props equality (PERF-11c-iii-b)', () => {
  const video: LibraryTrackLabel = { id: 'video', kind: 'video', name: 'Video' };
  const music: LibraryTrackLabel = { id: 'music', kind: 'audio', name: 'Music' };
  const tracks: readonly LibraryTrackLabel[] = [video, music];

  it('LP-EQ1 track labels compare by id, kind and name, not by identity or other fields', () => {
    const muted = tracks.map((track) => ({ ...track, mute: true }));
    expect(sameLibraryTrackLabels(tracks, muted)).toBe(true);
    expect(sameLibraryTrackLabels(tracks, [video, { ...music, name: 'Score' }])).toBe(false);
    expect(sameLibraryTrackLabels(tracks, [music, video])).toBe(false);
    expect(sameLibraryTrackLabels(tracks, [video])).toBe(false);
    expect(sameLibraryTrackLabels(tracks, [video, { ...music, id: 'music-2' }])).toBe(false);
    expect(sameLibraryTrackLabels(tracks, [video, { ...music, kind: 'video' }])).toBe(false);
  });

  it('LP-EQ2 leaf props are equal only when every other prop is the same value', () => {
    const actions = { run: () => undefined };
    const base = { sourceId: 'song', tracks, actions };
    expect(
      sameLibraryLeafProps(base, { ...base, tracks: tracks.map((track) => ({ ...track })) }),
    ).toBe(true);
    expect(sameLibraryLeafProps(base, { ...base, sourceId: 'hit' })).toBe(false);
    expect(sameLibraryLeafProps(base, { ...base, actions: { run: () => undefined } })).toBe(false);
    expect(
      sameLibraryLeafProps<{ tracks: readonly LibraryTrackLabel[]; sourceId?: string }>(
        { tracks },
        { tracks, sourceId: 'song' },
      ),
    ).toBe(false);
  });
});
