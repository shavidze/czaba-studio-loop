import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
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

const heldEnterCollection: WorkspaceCollection = {
  id: 'held',
  label: 'held',
  origin: 'demo',
  sources: [
    { id: 'first', title: 'First', collectionLabel: 'held', kind: 'music', origin: 'demo' },
    { id: 'second', title: 'Second', collectionLabel: 'held', kind: 'music', origin: 'demo' },
    { id: 'third', title: 'Third', collectionLabel: 'held', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 400, numberOfChannels: 1, sampleRate: 100 }),
};

function heldEnterArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
}

async function mountHeldEnterWorkspace() {
  const view = render(
    <ArrangementProvider
      collection={heldEnterCollection}
      initialArrangement={heldEnterArrangement()}
    >
      <StudioWorkspace />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const option = (sourceId: string): HTMLElement => {
    const found = view
      .getAllByRole('option')
      .find((entry) => entry.getAttribute('data-source-id') === sourceId);
    if (!found) {
      throw new Error(`option ${sourceId} not rendered`);
    }
    return found;
  };
  const clipCount = () => view.container.querySelectorAll('[data-clip-id]').length;
  return { view, option, clipCount };
}

function activeTarget(): Element {
  const active = document.activeElement;
  if (!active) {
    throw new Error('no active element');
  }
  return active;
}

function enterOnActive(repeat: boolean): boolean {
  let result = true;
  act(() => {
    result = fireEvent.keyDown(activeTarget(), { key: 'Enter', code: 'Enter', repeat });
  });
  return result;
}

function focusRow(row: HTMLElement) {
  act(() => row.focus());
  expect(document.activeElement).toBe(row);
}

function moveFocusToBody() {
  act(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });
  expect(document.activeElement).toBe(document.body);
}

const documentListeners: ((event: KeyboardEvent) => void)[] = [];
const pendingFrames = new Map<number, FrameRequestCallback>();
const frameCounter = { next: 0 };

function runPendingFrames() {
  const frames = Array.from(pendingFrames.values());
  pendingFrames.clear();
  act(() => {
    for (const frame of frames) {
      frame(performance.now());
    }
  });
}

beforeEach(() => {
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  pendingFrames.clear();
  frameCounter.next = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frameCounter.next += 1;
    pendingFrames.set(frameCounter.next, callback);
    return frameCounter.next;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    pendingFrames.delete(id);
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  for (const listener of documentListeners.splice(0, documentListeners.length)) {
    document.removeEventListener('keydown', listener);
  }
  pendingFrames.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('B-R98-HELD-ENTER-MULTI-ADD — one held Enter adds one clip (D-29z64)', () => {
  it('HA1 a held Enter on a focused ready row adds exactly one clip and keeps focus on the row', async () => {
    const { option, clipCount } = await mountHeldEnterWorkspace();
    const row = option('first');
    expect(row.getAttribute('draggable')).toBe('true');
    focusRow(row);
    const before = clipCount();
    expect(enterOnActive(false)).toBe(false);
    expect(clipCount()).toBe(before + 1);
    expect(document.activeElement).toBe(row);
    expect(enterOnActive(true)).toBe(false);
    expect(enterOnActive(true)).toBe(false);
    expect(clipCount()).toBe(before + 1);
    expect(document.activeElement).toBe(row);
  });

  it('HA2 two fresh Enter presses on a row add two clips', async () => {
    const { option, clipCount } = await mountHeldEnterWorkspace();
    focusRow(option('first'));
    const before = clipCount();
    expect(enterOnActive(false)).toBe(false);
    expect(clipCount()).toBe(before + 1);
    expect(enterOnActive(false)).toBe(false);
    expect(clipCount()).toBe(before + 2);
  });

  it('HA3 a held global Enter on body with a selected source adds exactly one clip', async () => {
    const { option, clipCount } = await mountHeldEnterWorkspace();
    const row = option('first');
    expect(row.getAttribute('draggable')).toBe('true');
    fireEvent.click(row);
    expect(row.getAttribute('aria-selected')).toBe('true');
    moveFocusToBody();
    const before = clipCount();
    expect(enterOnActive(false)).toBe(false);
    expect(clipCount()).toBe(before + 1);
    expect(enterOnActive(true)).toBe(false);
    expect(enterOnActive(true)).toBe(false);
    expect(clipCount()).toBe(before + 1);
  });

  it('HA4 two fresh global Enter presses on body add two clips', async () => {
    const { option, clipCount } = await mountHeldEnterWorkspace();
    expect(option('first').getAttribute('draggable')).toBe('true');
    fireEvent.click(option('first'));
    moveFocusToBody();
    const before = clipCount();
    expect(enterOnActive(false)).toBe(false);
    expect(clipCount()).toBe(before + 1);
    expect(document.activeElement).toBe(document.body);
    expect(enterOnActive(false)).toBe(false);
    expect(clipCount()).toBe(before + 2);
  });

  it('HA5 ＋ დამატება prevents only the repeated Enter; a click still adds one clip', async () => {
    const { view, option, clipCount } = await mountHeldEnterWorkspace();
    fireEvent.click(option('first'));
    const add = view.getByRole('button', { name: '＋ დამატება' });
    expect(add.hasAttribute('disabled')).toBe(false);
    act(() => add.focus());
    expect(document.activeElement).toBe(add);
    const before = clipCount();
    expect(enterOnActive(true)).toBe(false);
    expect(enterOnActive(false)).toBe(true);
    expect(clipCount()).toBe(before);
    act(() => {
      fireEvent.click(add);
    });
    expect(clipCount()).toBe(before + 1);
  });

  it('HA6 the ＋ guard ignores other repeated keys and does not stop propagation', async () => {
    const { view, option } = await mountHeldEnterWorkspace();
    expect(option('first').getAttribute('draggable')).toBe('true');
    fireEvent.click(option('first'));
    const add = view.getByRole('button', { name: '＋ დამატება' });
    act(() => add.focus());
    const received: { key: string; repeat: boolean }[] = [];
    const listener = (event: KeyboardEvent) => {
      received.push({ key: event.key, repeat: event.repeat });
    };
    document.addEventListener('keydown', listener);
    documentListeners.push(listener);
    let qResult = false;
    act(() => {
      qResult = fireEvent.keyDown(activeTarget(), { key: 'q', code: 'KeyQ', repeat: true });
    });
    expect(qResult).toBe(true);
    enterOnActive(true);
    expect(received.length).toBe(2);
    expect(received[0]).toEqual({ key: 'q', repeat: true });
    expect(received[1]).toEqual({ key: 'Enter', repeat: true });
  });

  it('HA7 held ArrowDown on a row still moves the selection and focus one row per repeat', async () => {
    const { view, clipCount } = await mountHeldEnterWorkspace();
    const rows = view
      .getAllByRole('option')
      .filter((entry) => entry.hasAttribute('data-source-id'));
    expect(rows.map((entry) => entry.getAttribute('data-source-id'))).toEqual([
      'first',
      'second',
      'third',
    ]);
    focusRow(rows[0]);
    const before = clipCount();
    act(() => {
      fireEvent.keyDown(activeTarget(), { key: 'ArrowDown', code: 'ArrowDown', repeat: true });
    });
    runPendingFrames();
    expect(document.activeElement).toBe(rows[1]);
    act(() => {
      fireEvent.keyDown(activeTarget(), { key: 'ArrowDown', code: 'ArrowDown', repeat: true });
    });
    runPendingFrames();
    expect(document.activeElement).toBe(rows[2]);
    expect(rows[2].getAttribute('aria-selected')).toBe('true');
    expect(rows[0].getAttribute('aria-selected')).toBe('false');
    expect(clipCount()).toBe(before);
  });

  it('HA8 one Ctrl+Z after a held Enter on a row removes the one added clip', async () => {
    const { option, clipCount } = await mountHeldEnterWorkspace();
    focusRow(option('first'));
    const before = clipCount();
    enterOnActive(false);
    enterOnActive(true);
    enterOnActive(true);
    expect(clipCount()).toBe(before + 1);
    moveFocusToBody();
    act(() => {
      fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    });
    expect(clipCount()).toBe(before);
  });
});
