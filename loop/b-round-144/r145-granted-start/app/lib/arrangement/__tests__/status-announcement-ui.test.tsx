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
import {
  studioEditStrings,
  studioLibraryStrings,
  studioLoopStrings,
  studioMoveStrings,
  studioPlaybackStrings,
} from '../strings';

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
const NOTHING_TO_PLAY = studioPlaybackStrings.nothingToPlay;
const FAILED_TEXT = studioLibraryStrings.sourceFailed(BAD_TITLE);

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

const NUDGE_BLOCKED_TEXT = studioMoveStrings.nudgeBlocked;
const NUDGE_SNAP_BLOCKED_TEXT = studioMoveStrings.nudgeAtTimeStart;
const GROUP_BLOCKED_TEXT = 'Group move stopped — a neighbouring clip or the start of the timeline.';
const LOOP_BLOCKED_TEXT = studioLoopStrings.stepBlocked;
const MARKER_START_TEXT = 'The marker is at the start of the timeline.';
const MARKER_NEXT_NONE_TEXT = 'No more markers after the playhead';
const CLIP_GAIN_UNCHANGED_TEXT = 'Clip Gain unchanged: 0.0 dB.';

function keyRepeatClip(id: string, start: number) {
  return { id, trackId: 'music', sourceId: 'ok', start, sourceOffset: 0, duration: 5 };
}

function keyRepeatArrangement(overrides: Partial<Arrangement>): Arrangement {
  return { ...emptyArrangement(), ...overrides };
}

async function mountKeyRepeatWorkspace(initial: Arrangement) {
  const api: AnnouncementApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={announcementCollection()} initialArrangement={initial}>
      <StudioWorkspace />
      <AnnouncementProbe api={api} />
    </ArrangementProvider>,
  );
  await flushAsync();
  expect(live(api).sourceStates.ok?.status).toBe('ready');
  const region = view.getByTestId('arrangement-status');
  return { api, view, region };
}

interface KeyRepeatPress {
  readonly target: Element | Window;
  readonly key: string;
  readonly ctrlKey?: boolean;
}

function pressKey(press: KeyRepeatPress, repeat: boolean) {
  act(() => {
    fireEvent.keyDown(press.target, {
      key: press.key,
      code: press.key,
      ctrlKey: press.ctrlKey === true,
      repeat,
    });
  });
}

function expectOneAnnouncementPerPress(
  api: AnnouncementApiRef,
  region: HTMLElement,
  press: KeyRepeatPress,
  text: string,
) {
  const firstWatch = observeRegion(region);
  pressKey(press, false);
  expect(addedTexts(stopWatching(firstWatch))).toEqual([text]);
  expect(region.textContent).toBe(text);
  const firstSpan = region.firstElementChild;
  const firstSequence = live(api).statusSequence;

  const repeatWatch = observeRegion(region);
  pressKey(press, true);
  pressKey(press, true);
  pressKey(press, true);
  expect(addedTexts(stopWatching(repeatWatch))).toEqual([]);
  expect(region.firstElementChild).toBe(firstSpan);
  expect(region.textContent).toBe(text);
  expect(live(api).statusSequence).toBe(firstSequence);

  const againWatch = observeRegion(region);
  pressKey(press, false);
  expect(addedTexts(stopWatching(againWatch))).toEqual([text]);
  expect(region.firstElementChild).not.toBe(firstSpan);
  expect(region.textContent).toBe(text);
  expect(region.childElementCount).toBe(1);
  expect(live(api).statusSequence).toBe(firstSequence + 1);
}

describe('a held key announces the same refusal once (GATE105-S1, D-29z71)', () => {
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

  it('SK1 a held ArrowLeft on a single clip blocked by its left neighbour with Snap off announces the refusal once per press', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c0', 0), keyRepeatClip('c1', 5)] }),
    );
    act(() => live(api).selectClip('c1'));
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: document.body, key: 'ArrowLeft' },
      NUDGE_BLOCKED_TEXT,
    );
    expect(live(api).arrangement.clips.map((clip) => clip.start)).toEqual([0, 5]);
  });

  it('SK2 a held ArrowLeft on a clip at 0 with Snap on announces the time-start refusal once per press', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    const snapToggle = view.getByTestId('arrangement-snap-toggle');
    act(() => {
      fireEvent.click(snapToggle);
    });
    expect(snapToggle.getAttribute('aria-pressed')).toBe('true');
    act(() => live(api).selectClip('c1'));
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: document.body, key: 'ArrowLeft' },
      NUDGE_SNAP_BLOCKED_TEXT,
    );
    expect(live(api).arrangement.clips[0]?.start).toBe(0);
  });

  it('SK3 a held ArrowLeft on a two-clip group at 0 announces the group refusal once per press', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0), keyRepeatClip('c2', 5)] }),
    );
    act(() => live(api).selectClips(['c1', 'c2']));
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: document.body, key: 'ArrowLeft' },
      GROUP_BLOCKED_TEXT,
    );
    expect(live(api).arrangement.clips.map((clip) => clip.start)).toEqual([0, 5]);
  });

  it('SK4 a held ArrowLeft on the loop brace at 0 announces the loop refusal once per press', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ loop: { start: 0, end: 4, enabled: true } }),
    );
    const brace = view.getByTestId('arrangement-loop-brace');
    act(() => brace.focus());
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: brace, key: 'ArrowLeft' },
      LOOP_BLOCKED_TEXT,
    );
    expect(live(api).arrangement.loop).toEqual({ start: 0, end: 4, enabled: true });
  });

  it('SK5 a held ArrowLeft on a marker flag at 0 announces the time-start refusal once per press', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ markers: [{ id: 'm1', time: 0, name: 'Hit' }] }),
    );
    const flag = view.getByTestId('arrangement-marker');
    act(() => flag.focus());
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: flag, key: 'ArrowLeft' },
      MARKER_START_TEXT,
    );
    expect(live(api).arrangement.markers).toEqual([{ id: 'm1', time: 0, name: 'Hit' }]);
  });

  it('SK6 a held Ctrl+ArrowRight past the last stop announces the end text once per press', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({
        clips: [keyRepeatClip('c1', 0)],
        markers: [{ id: 'm1', time: 1, name: 'Hit' }],
      }),
    );
    const press: KeyRepeatPress = { target: document.body, key: 'ArrowRight', ctrlKey: true };
    pressKey(press, false);
    pressKey(press, false);
    expect(live(api).getLivePosition()).toBe(5);
    expectOneAnnouncementPerPress(api, region, press, MARKER_NEXT_NONE_TEXT);
    expect(live(api).getLivePosition()).toBe(5);
  });

  it('SK7 a held ArrowLeft keeps nudging and announces the refusal once when the hold reaches the neighbour', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c0', 0), keyRepeatClip('c1', 5.3)] }),
    );
    act(() => live(api).selectClip('c1'));
    const press: KeyRepeatPress = { target: document.body, key: 'ArrowLeft' };
    const watch = observeRegion(region);
    const starts: (number | undefined)[] = [];
    pressKey(press, false);
    starts.push(live(api).arrangement.clips.find((clip) => clip.id === 'c1')?.start);
    for (let i = 0; i < 4; i++) {
      pressKey(press, true);
      starts.push(live(api).arrangement.clips.find((clip) => clip.id === 'c1')?.start);
    }
    const added = addedTexts(stopWatching(watch));

    expect(starts).toEqual([5.2, 5.1, 5, 5, 5]);
    expect(added.filter((text) => text === NUDGE_BLOCKED_TEXT)).toEqual([NUDGE_BLOCKED_TEXT]);
    expect(added).toEqual([NUDGE_BLOCKED_TEXT]);
    expect(region.textContent).toBe(NUDGE_BLOCKED_TEXT);
    expect(region.childElementCount).toBe(1);
  });

  it('SK8 a held Enter in the unchanged Clip Gain input announces the no-change text once per press', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).selectClip('c1'));
    act(() => {
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    });
    const input = view.getByTestId('arrangement-detail-clip-gain-input');
    act(() => input.focus());
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: input, key: 'Enter' },
      CLIP_GAIN_UNCHANGED_TEXT,
    );
    expect(live(api).arrangement.clips[0]?.gainDb ?? 0).toBe(0);
  });

  it('SK9 a held ArrowLeft on a marker flag announces the time-start refusal once when the first refusal arrives on a repeat', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ markers: [{ id: 'm1', time: 0.1, name: 'Hit' }] }),
    );
    const flag = view.getByTestId('arrangement-marker');
    act(() => flag.focus());
    const press: KeyRepeatPress = { target: flag, key: 'ArrowLeft' };
    pressKey(press, false);
    expect(live(api).arrangement.markers).toEqual([{ id: 'm1', time: 0, name: 'Hit' }]);
    const watch = observeRegion(region);
    pressKey(press, true);
    pressKey(press, true);
    pressKey(press, true);
    expect(addedTexts(stopWatching(watch))).toEqual([MARKER_START_TEXT]);
    expect(region.textContent).toBe(MARKER_START_TEXT);
  });

  it('SK10 a held Ctrl+ArrowRight announces the end text once when the first refusal arrives on a repeat', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({
        clips: [keyRepeatClip('c1', 0)],
        markers: [{ id: 'm1', time: 1, name: 'Hit' }],
      }),
    );
    const press: KeyRepeatPress = { target: document.body, key: 'ArrowRight', ctrlKey: true };
    const watch = observeRegion(region);
    pressKey(press, false);
    expect(live(api).getLivePosition()).toBe(1);
    pressKey(press, true);
    expect(live(api).getLivePosition()).toBe(5);
    pressKey(press, true);
    pressKey(press, true);
    pressKey(press, true);
    expect(addedTexts(stopWatching(watch))).toEqual([MARKER_NEXT_NONE_TEXT]);
    expect(region.textContent).toBe(MARKER_NEXT_NONE_TEXT);
  });

  it('SK11 a held ArrowLeft into a neighbouring marker announces the conflict once per press', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({
        markers: [
          { id: 'm1', time: 0.5, name: 'Intro' },
          { id: 'm2', time: 0.6, name: 'Hit' },
        ],
      }),
    );
    const flag = view
      .getAllByTestId('arrangement-marker')
      .find((element) => element.getAttribute('aria-label')?.startsWith('Marker “Hit”') === true);
    if (!flag) {
      throw new Error('marker flag not found');
    }
    act(() => flag.focus());
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: flag, key: 'ArrowLeft' },
      'A marker already exists at this time: “Intro”',
    );
    expect(live(api).arrangement.markers).toEqual([
      { id: 'm1', time: 0.5, name: 'Intro' },
      { id: 'm2', time: 0.6, name: 'Hit' },
    ]);
  });

  it('SK12 a held Enter in the detail range start input announces the applied range once per press', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).selectClip('c1'));
    act(() => {
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    });
    const input = view.getByTestId('arrangement-detail-start');
    act(() => input.focus());
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: input, key: 'Enter' },
      'Time selection: 00:00.000 — 00:05.000 · მუსიკა.',
    );
  });
});

const LOOP_OFF_TEXT = studioLoopStrings.off;
const LOOP_ON_TEXT = studioLoopStrings.on;
const COPY_ONE_CLIP_TEXT = studioEditStrings.copyClipsDone(1);

interface OneShotPress {
  readonly target: Element;
  readonly key: string;
  readonly code: string;
  readonly ctrlKey?: boolean;
  readonly shiftKey?: boolean;
}

function dispatchOneShotKey(press: OneShotPress, repeat: boolean): boolean {
  let allowed = true;
  act(() => {
    allowed = fireEvent.keyDown(press.target, {
      key: press.key,
      code: press.code,
      ctrlKey: press.ctrlKey === true,
      shiftKey: press.shiftKey === true,
      repeat,
    });
  });
  return allowed;
}

function preventedBeforeWindow(press: OneShotPress, repeat: boolean): boolean {
  const seen = { prevented: false };
  const probe = (event: KeyboardEvent) => {
    seen.prevented = event.defaultPrevented;
  };
  document.addEventListener('keydown', probe);
  dispatchOneShotKey(press, repeat);
  document.removeEventListener('keydown', probe);
  return seen.prevented;
}

function clipStart(api: AnnouncementApiRef, id: string): number | undefined {
  return live(api).arrangement.clips.find((clip) => clip.id === id)?.start;
}

describe('a held shortcut or a held Enter acts once (C-R106-01/02, F5/F6, D-29z72)', () => {
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

  it('HK1 a held Ctrl+L disables the loop once with one announcement and one history entry', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ loop: { start: 0, end: 4, enabled: true } }),
    );
    const press: OneShotPress = { target: document.body, key: 'l', code: 'KeyL', ctrlKey: true };
    const watch = observeRegion(region);
    const allowed = [dispatchOneShotKey(press, false)];
    const enabled = [live(api).arrangement.loop?.enabled];
    for (let i = 0; i < 3; i++) {
      allowed.push(dispatchOneShotKey(press, true));
      enabled.push(live(api).arrangement.loop?.enabled);
    }

    expect(allowed).toEqual([false, false, false, false]);
    expect(enabled).toEqual([false, false, false, false]);
    expect(addedTexts(stopWatching(watch))).toEqual([LOOP_OFF_TEXT]);
    expect(live(api).undoLabel).toBe(studioLoopStrings.historyOff);
    expect(view.queryAllByTitle(`Undo: ${studioLoopStrings.historyOff}`).length).toBe(1);

    act(() => live(api).undo());
    expect(live(api).arrangement.loop?.enabled).toBe(true);
    expect(live(api).undoLabel).toBeNull();

    const offWatch = observeRegion(region);
    expect(dispatchOneShotKey(press, false)).toBe(false);
    expect(live(api).arrangement.loop?.enabled).toBe(false);
    expect(addedTexts(stopWatching(offWatch))).toEqual([LOOP_OFF_TEXT]);

    const onWatch = observeRegion(region);
    expect(dispatchOneShotKey(press, false)).toBe(false);
    expect(live(api).arrangement.loop?.enabled).toBe(true);
    expect(addedTexts(stopWatching(onWatch))).toEqual([LOOP_ON_TEXT]);
  });

  it('HK2 a held Ctrl+E splits the selected clip once and adds only the split text', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).selectClip('c1'));
    act(() => live(api).seekTo(2.5));
    expect(live(api).getLivePosition()).toBe(2.5);
    const press: OneShotPress = { target: document.body, key: 'e', code: 'KeyE', ctrlKey: true };
    const watch = observeRegion(region);
    const allowed = [dispatchOneShotKey(press, false)];
    const counts = [live(api).arrangement.clips.length];
    for (let i = 0; i < 3; i++) {
      allowed.push(dispatchOneShotKey(press, true));
      counts.push(live(api).arrangement.clips.length);
    }

    expect(allowed).toEqual([false, false, false, false]);
    expect(counts).toEqual([2, 2, 2, 2]);
    expect(addedTexts(stopWatching(watch))).toEqual([studioEditStrings.splitDone('00:02.500')]);
  });

  it('HK3 a held Ctrl+Shift+L extends the range to all lanes with one announcement', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).setTimeRange({ start: 1, end: 3, trackId: 'music' }));
    const press: OneShotPress = {
      target: document.body,
      key: 'L',
      code: 'KeyL',
      ctrlKey: true,
      shiftKey: true,
    };
    const watch = observeRegion(region);
    const allowed = [dispatchOneShotKey(press, false)];
    for (let i = 0; i < 3; i++) {
      allowed.push(dispatchOneShotKey(press, true));
    }

    expect(allowed).toEqual([false, false, false, false]);
    expect(addedTexts(stopWatching(watch))).toEqual([
      studioEditStrings.extendDone({ start: '00:01.000', end: '00:03.000' }),
    ]);
    expect(live(api).range).toEqual({ start: 1, end: 3, trackId: 'music', allTracks: true });
  });

  it('HK4 a held Ctrl+C copies with one announcement and a separate press announces again', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).selectClip('c1'));
    expect(window.getSelection()?.isCollapsed).toBe(true);
    const press: OneShotPress = { target: document.body, key: 'c', code: 'KeyC', ctrlKey: true };
    const watch = observeRegion(region);
    const allowed = [dispatchOneShotKey(press, false)];
    for (let i = 0; i < 3; i++) {
      allowed.push(dispatchOneShotKey(press, true));
    }

    expect(allowed).toEqual([false, false, false, false]);
    expect(addedTexts(stopWatching(watch))).toEqual([COPY_ONE_CLIP_TEXT]);

    const againWatch = observeRegion(region);
    expect(dispatchOneShotKey(press, false)).toBe(false);
    expect(addedTexts(stopWatching(againWatch))).toEqual([COPY_ONE_CLIP_TEXT]);
    expect(region.childElementCount).toBe(1);
  });

  it('HK5 a held Ctrl+Z still undoes one step per keydown', async () => {
    const { api } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).selectClip('c1'));
    const nudge: KeyRepeatPress = { target: document.body, key: 'ArrowRight' };
    pressKey(nudge, false);
    pressKey(nudge, false);
    expect(clipStart(api, 'c1')).toBe(0.2);
    const undoPress: OneShotPress = {
      target: document.body,
      key: 'z',
      code: 'KeyZ',
      ctrlKey: true,
    };
    expect(dispatchOneShotKey(undoPress, false)).toBe(false);
    expect(clipStart(api, 'c1')).toBe(0.1);
    expect(dispatchOneShotKey(undoPress, true)).toBe(false);
    expect(clipStart(api, 'c1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('HK6 Ctrl+C with selected page text is left to the browser and copies no clip', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).selectClip('c1'));
    const paragraph = document.createElement('p');
    paragraph.textContent = 'page text';
    document.body.appendChild(paragraph);
    const pageRange = document.createRange();
    pageRange.selectNodeContents(paragraph);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(pageRange);
    expect(window.getSelection()?.isCollapsed).toBe(false);
    const press: OneShotPress = { target: paragraph, key: 'c', code: 'KeyC', ctrlKey: true };
    const watch = observeRegion(region);
    const allowed = [dispatchOneShotKey(press, false), dispatchOneShotKey(press, true)];
    const added = addedTexts(stopWatching(watch));
    window.getSelection()?.removeAllRanges();
    paragraph.remove();

    expect(allowed).toEqual([true, true]);
    expect(added).toEqual([]);
  });

  it('HE1 a repeated Enter on the previous and next marker buttons is prevented and a fresh one is not', async () => {
    const { view } = await mountKeyRepeatWorkspace(keyRepeatArrangement({}));
    const prev = view.getByTestId('arrangement-marker-prev');
    const next = view.getByTestId('arrangement-marker-next');
    const enterOn = (target: Element): OneShotPress => ({ target, key: 'Enter', code: 'Enter' });

    expect(dispatchOneShotKey(enterOn(prev), true)).toBe(false);
    expect(dispatchOneShotKey(enterOn(next), true)).toBe(false);
    expect(dispatchOneShotKey(enterOn(prev), false)).toBe(true);
    expect(dispatchOneShotKey(enterOn(next), false)).toBe(true);
    expect(preventedBeforeWindow({ target: prev, key: ' ', code: 'Space' }, true)).toBe(false);
    expect(preventedBeforeWindow(enterOn(prev), true)).toBe(true);
  });

  it('HE2 a repeated Enter on the add marker button is prevented and a fresh one is not', async () => {
    const { view } = await mountKeyRepeatWorkspace(keyRepeatArrangement({}));
    const add = view.getByTestId('arrangement-marker-add');

    expect(dispatchOneShotKey({ target: add, key: 'Enter', code: 'Enter' }, true)).toBe(false);
    expect(dispatchOneShotKey({ target: add, key: 'Enter', code: 'Enter' }, false)).toBe(true);
  });

  it('HE3 a repeated Enter in the marker name editor keeps it open and a fresh Enter commits once', async () => {
    const { api, view } = await mountKeyRepeatWorkspace(keyRepeatArrangement({}));
    act(() => {
      fireEvent.click(view.getByTestId('arrangement-marker-add'));
    });
    const input = view.getByTestId('arrangement-marker-name-input');
    const press: OneShotPress = { target: input, key: 'Enter', code: 'Enter' };

    expect(dispatchOneShotKey(press, true)).toBe(false);
    expect(dispatchOneShotKey(press, true)).toBe(false);
    expect(view.queryAllByTestId('arrangement-marker-name-input').length).toBe(1);
    expect(live(api).arrangement.markers ?? []).toEqual([]);
    expect(live(api).undoLabel).toBeNull();

    expect(dispatchOneShotKey(press, false)).toBe(false);
    expect(view.queryAllByTestId('arrangement-marker-name-input').length).toBe(0);
    expect((live(api).arrangement.markers ?? []).map((marker) => marker.name)).toEqual([
      'Marker 1',
    ]);
  });

  it('HE4 a repeated Enter on the detail range apply and Clip Gain reset buttons is prevented', async () => {
    const { api, view } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [{ ...keyRepeatClip('c1', 0), gainDb: 0 }] }),
    );
    act(() => live(api).selectClip('c1'));
    act(() => {
      fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    });
    const apply = view.getByTestId('arrangement-detail-apply');
    const reset = view.getByTestId('arrangement-detail-clip-gain-reset');
    expect(apply.hasAttribute('disabled')).toBe(false);
    expect(reset.hasAttribute('disabled')).toBe(false);

    expect(dispatchOneShotKey({ target: apply, key: 'Enter', code: 'Enter' }, true)).toBe(false);
    expect(dispatchOneShotKey({ target: reset, key: 'Enter', code: 'Enter' }, true)).toBe(false);
    expect(dispatchOneShotKey({ target: apply, key: 'Enter', code: 'Enter' }, false)).toBe(true);
    expect(dispatchOneShotKey({ target: reset, key: 'Enter', code: 'Enter' }, false)).toBe(true);
  });

  it('NZ1 a deliberate ArrowLeft on a single clip at 0 with Snap off states the time-start refusal', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    expect(view.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed')).toBe('false');
    act(() => live(api).selectClip('c1'));
    const undoBefore = live(api).undoLabel;
    const watch = observeRegion(region);
    pressKey({ target: document.body, key: 'ArrowLeft' }, false);

    expect(addedTexts(stopWatching(watch))).toEqual([NUDGE_SNAP_BLOCKED_TEXT]);
    expect(clipStart(api, 'c1')).toBe(0);
    expect(live(api).undoLabel).toBe(undoBefore);
  });

  it('NZ2 a held ArrowLeft on a single clip at 0 with Snap off announces the refusal once per press', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    act(() => live(api).selectClip('c1'));
    expectOneAnnouncementPerPress(
      api,
      region,
      { target: document.body, key: 'ArrowLeft' },
      NUDGE_SNAP_BLOCKED_TEXT,
    );
    expect(clipStart(api, 'c1')).toBe(0);
    expect(live(api).undoLabel).toBeNull();
  });

  it('NZ3 a held ArrowLeft keeps nudging to 0 and then states the time-start refusal once', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0.3)] }),
    );
    act(() => live(api).selectClip('c1'));
    const press: KeyRepeatPress = { target: document.body, key: 'ArrowLeft' };
    const watch = observeRegion(region);
    const starts: (number | undefined)[] = [];
    pressKey(press, false);
    starts.push(clipStart(api, 'c1'));
    for (let i = 0; i < 4; i++) {
      pressKey(press, true);
      starts.push(clipStart(api, 'c1'));
    }

    expect(starts).toEqual([0.2, 0.1, 0, 0, 0]);
    expect(addedTexts(stopWatching(watch))).toEqual([NUDGE_SNAP_BLOCKED_TEXT]);
    expect(region.textContent).toBe(NUDGE_SNAP_BLOCKED_TEXT);
    expect(region.childElementCount).toBe(1);
  });

  it('NZ4 a single clip at 0 with Snap on states the same time-start text as with Snap off', async () => {
    const { api, view, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({ clips: [keyRepeatClip('c1', 0)] }),
    );
    const snapToggle = view.getByTestId('arrangement-snap-toggle');
    act(() => {
      fireEvent.click(snapToggle);
    });
    expect(snapToggle.getAttribute('aria-pressed')).toBe('true');
    act(() => live(api).selectClip('c1'));
    const watch = observeRegion(region);
    pressKey({ target: document.body, key: 'ArrowLeft' }, false);

    expect(addedTexts(stopWatching(watch))).toEqual([NUDGE_SNAP_BLOCKED_TEXT]);
    expect(clipStart(api, 'c1')).toBe(0);
  });

  it('SA-DEL Delete on one clip and then on two clips states the English delete texts', async () => {
    const { api, region } = await mountKeyRepeatWorkspace(
      keyRepeatArrangement({
        clips: [keyRepeatClip('c1', 0), keyRepeatClip('c2', 6), keyRepeatClip('c3', 12)],
      }),
    );
    act(() => live(api).selectClip('c1'));
    pressKey({ target: document.body, key: 'Delete' }, false);

    expect(region.textContent).toBe(studioEditStrings.deleteClipDone);
    expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(['c2', 'c3']);

    act(() => live(api).selectClips(['c2', 'c3']));
    pressKey({ target: document.body, key: 'Delete' }, false);

    expect(region.textContent).toBe(studioEditStrings.deleteClipsDone(2));
    expect(live(api).arrangement.clips).toEqual([]);
  });
});
