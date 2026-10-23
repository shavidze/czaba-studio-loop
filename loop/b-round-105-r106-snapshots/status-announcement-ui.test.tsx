import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
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

const OK_TITLE = 'Ready Song';
const BAD_TITLE = 'Broken Song';
const LOADER_ERROR = 'ფაილი ვერ ჩაიტვირთა (ქსელი)';
const NOTHING_TO_PLAY = 'დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.';
const FAILED_TEXT = `„${BAD_TITLE}“ ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`;

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

function announcementCollection(): WorkspaceCollection {
  return {
    id: 'announcement',
    label: 'announcement',
    origin: 'demo',
    sources: [
      { id: 'ok', title: OK_TITLE, collectionLabel: 'announcement', kind: 'music', origin: 'demo' },
      {
        id: 'bad',
        title: BAD_TITLE,
        collectionLabel: 'announcement',
        kind: 'music',
        origin: 'demo',
      },
    ],
    loadSource: (source) => {
      if (source.id === 'bad') {
        return Promise.reject(new Error(LOADER_ERROR));
      }
      return Promise.resolve(
        new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
      );
    },
  };
}

function emptyArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
}

interface AnnouncementApiRef {
  current: ArrangementContextValue | null;
}

function AnnouncementProbe({ api }: { api: AnnouncementApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: AnnouncementApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushAsync(rounds = 10) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function mountAnnouncementWorkspace() {
  const api: AnnouncementApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={announcementCollection()}
      initialArrangement={emptyArrangement()}
    >
      <StudioWorkspace />
      <AnnouncementProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  expect(live(api).sourceStates.ok?.status).toBe('ready');
  expect(live(api).sourceStates.bad?.status).toBe('error');
  expect(live(api).arrangement.clips.length).toBe(0);
  const region = view.getByTestId('arrangement-status');
  return { api, view, region };
}

function pressSpace() {
  act(() => {
    fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });
  });
}

interface RegionWatch {
  observer: MutationObserver;
  records: MutationRecord[];
}

function observeRegion(region: HTMLElement): RegionWatch {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((batch) => {
    records.push(...batch);
  });
  observer.observe(region, { childList: true, subtree: true, characterData: true });
  return { observer, records };
}

function stopWatching(watch: RegionWatch): MutationRecord[] {
  const all = [...watch.records, ...watch.observer.takeRecords()];
  watch.observer.disconnect();
  return all;
}

function addedTexts(records: readonly MutationRecord[]): string[] {
  return records
    .filter((record) => record.type === 'childList')
    .flatMap((record) => Array.from(record.addedNodes, (node) => node.textContent ?? ''));
}

describe('a repeated status sentence is announced again (GATE96-S2, D-29z69)', () => {
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

  it('SU1 Space twice on an empty arrangement replaces the inner span inside the same live region', async () => {
    const { api, view, region } = await mountAnnouncementWorkspace();
    pressSpace();
    expect(view.getByTestId('arrangement-status')).toBe(region);
    expect(region.textContent).toBe(NOTHING_TO_PLAY);
    expect(live(api).isPlaying).toBe(false);
    const first = region.firstElementChild;
    const sequenceBefore = live(api).statusSequence;
    const watch = observeRegion(region);

    pressSpace();
    const records = stopWatching(watch);

    expect(region.textContent).toBe(NOTHING_TO_PLAY);
    expect(view.getByTestId('arrangement-status')).toBe(region);
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.firstElementChild).not.toBe(first);
    expect(region.firstElementChild?.textContent).toBe(NOTHING_TO_PLAY);
    expect(addedTexts(records)).toContain(NOTHING_TO_PLAY);
    expect(live(api).statusSequence).toBe(sequenceBefore + 1);
    expect(live(api).isPlaying).toBe(false);
  });

  it('SU2 activating a failed library row twice announces the failed text both times', async () => {
    const { api, view, region } = await mountAnnouncementWorkspace();
    act(() => live(api).addSourceToActiveTrack('bad'));
    expect(view.getByTestId('arrangement-status')).toBe(region);
    expect(region.textContent).toBe(FAILED_TEXT);
    const first = region.firstElementChild;
    const watch = observeRegion(region);

    act(() => live(api).addSourceToActiveTrack('bad'));
    const records = stopWatching(watch);

    expect(region.textContent).toBe(FAILED_TEXT);
    expect(view.getByTestId('arrangement-status')).toBe(region);
    expect(region.firstElementChild).not.toBe(first);
    expect(addedTexts(records)).toContain(FAILED_TEXT);
    expect(live(api).arrangement.clips.length).toBe(0);
  });

  it('SU3 the live region node stays the same with exactly one element child across distinct texts', async () => {
    const { api, view, region } = await mountAnnouncementWorkspace();
    pressSpace();
    expect(view.getByTestId('arrangement-status')).toBe(region);
    expect(region.textContent).toBe(NOTHING_TO_PLAY);
    expect(region.childElementCount).toBe(1);

    act(() => live(api).addSourceToActiveTrack('bad'));
    expect(region.textContent).toBe(FAILED_TEXT);

    expect(view.getByTestId('arrangement-status')).toBe(region);
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.childElementCount).toBe(1);
    expect(region.firstElementChild?.textContent).toBe(FAILED_TEXT);
  });

  it('SU4 the post-gesture restore brings back the old text and an unchanged restore keeps the same span', async () => {
    const { api, region } = await mountAnnouncementWorkspace();
    pressSpace();
    expect(region.textContent).toBe(NOTHING_TO_PLAY);

    const gesture: { release: (() => void) | null } = { release: null };
    act(() => {
      gesture.release = live(api).claimPointerGesture(1, () => undefined);
    });
    expect(gesture.release).not.toBeNull();
    act(() => live(api).addSourceToActiveTrack('ok'));
    expect(region.textContent).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(live(api).arrangement.clips.length).toBe(0);
    act(() => gesture.release?.());
    expect(region.textContent).toBe(NOTHING_TO_PLAY);
    expect(live(api).isPointerGestureActive()).toBe(false);

    const spanBefore = region.firstElementChild;
    const sequenceBefore = live(api).statusSequence;
    act(() => {
      gesture.release = live(api).claimPointerGesture(2, () => undefined);
    });
    expect(gesture.release).not.toBeNull();
    act(() => gesture.release?.());
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(region.textContent).toBe(NOTHING_TO_PLAY);
    expect(region.firstElementChild).toBe(spanBefore);
    expect(live(api).statusSequence).toBe(sequenceBefore);
  });

  it('SU5 the same text during a claimed gesture keeps the span until the gesture ends', async () => {
    const { api, region } = await mountAnnouncementWorkspace();
    const held = 'Fade In: 2.000 წმ';
    const gesture: { release: (() => void) | null } = { release: null };
    act(() => {
      gesture.release = live(api).claimPointerGesture(5, () => undefined);
    });
    expect(gesture.release).not.toBeNull();
    expect(live(api).isPointerGestureActive()).toBe(true);

    act(() => live(api).setStatus(held));
    expect(region.textContent).toBe(held);
    const heldSpan = region.firstElementChild;
    const sequenceHeld = live(api).statusSequence;

    act(() => live(api).setStatus(held));
    act(() => live(api).setStatus(held));
    expect(region.firstElementChild).toBe(heldSpan);
    expect(region.textContent).toBe(held);
    expect(live(api).statusSequence).toBe(sequenceHeld);

    act(() => live(api).addSourceToActiveTrack('ok'));
    expect(region.textContent).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    const refusalSpan = region.firstElementChild;
    expect(refusalSpan).not.toBe(heldSpan);
    expect(live(api).statusSequence).toBe(sequenceHeld + 1);
    act(() => live(api).addSourceToActiveTrack('ok'));
    expect(region.firstElementChild).toBe(refusalSpan);
    expect(region.textContent).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(live(api).statusSequence).toBe(sequenceHeld + 1);
    expect(live(api).arrangement.clips.length).toBe(0);

    act(() => gesture.release?.());
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(region.textContent).toBe(held);
    expect(region.firstElementChild).not.toBe(refusalSpan);
    expect(live(api).statusSequence).toBe(sequenceHeld + 2);
    const restoredSpan = region.firstElementChild;

    act(() => live(api).setStatus(held));
    expect(region.textContent).toBe(held);
    expect(region.firstElementChild).not.toBe(restoredSpan);
    expect(region.childElementCount).toBe(1);
    expect(live(api).statusSequence).toBe(sequenceHeld + 3);
  });

  it('SU6 a changing readout during a claimed gesture is announced at every change', async () => {
    const { api, region } = await mountAnnouncementWorkspace();
    const gesture: { release: (() => void) | null } = { release: null };
    act(() => {
      gesture.release = live(api).claimPointerGesture(6, () => undefined);
    });
    expect(gesture.release).not.toBeNull();
    const watch = observeRegion(region);
    const spans: (Element | null)[] = [];

    act(() => live(api).setStatus('A'));
    spans.push(region.firstElementChild);
    expect(region.textContent).toBe('A');
    act(() => live(api).setStatus('B'));
    spans.push(region.firstElementChild);
    expect(region.textContent).toBe('B');
    act(() => live(api).setStatus('A'));
    spans.push(region.firstElementChild);
    expect(region.textContent).toBe('A');
    const records = stopWatching(watch);

    expect(spans[1]).not.toBe(spans[0]);
    expect(spans[2]).not.toBe(spans[1]);
    expect(spans[2]).not.toBe(spans[0]);
    expect(addedTexts(records)).toEqual(['A', 'B', 'A']);
    expect(region.childElementCount).toBe(1);
    act(() => gesture.release?.());
    expect(live(api).isPointerGestureActive()).toBe(false);
  });
});
