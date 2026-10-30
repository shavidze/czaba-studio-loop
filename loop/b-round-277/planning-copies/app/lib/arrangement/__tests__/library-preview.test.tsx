import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementLibraryPreview } from '~/components/arrangement/ArrangementLibraryPreview';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
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
  current: ArrangementContextValue | null;
}

function PreviewApiProbe({ api }: { api: PreviewApiRef }) {
  api.current = useArrangement();
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
    expect(row.querySelector('span.text-foreground')?.textContent).toBe('მუსიკა');
  });

  it('keeps the video note in the title and visible text when the video lane is active (C-R16-01)', async () => {
    const { api, view } = await mountPreview();
    act(() => api.current?.setActiveTrack('video'));
    const row = activeLaneRow(view);
    expect(row.getAttribute('title')).toBe('Active track: ვიდეო (audio is not added here)');
    expect(row.getAttribute('title')).toBe(row.textContent?.split('·')[0].trim());
    expect(row.textContent).toContain('· insert marker 00:00.000');
    expect(view.getByRole('button', { name: 'Add' }).hasAttribute('disabled')).toBe(true);
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
    expect(renderLog.counts.get('ArrangementLibraryPreview') ?? 0).toBeGreaterThanOrEqual(10);
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
});
