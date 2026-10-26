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
import { arrangementGroups } from '../groups';
import { createArrangement } from '../model';
import { trackEffectiveGains } from '../schedule';
import { trackVolumeFromDb } from '../track-volume-db';

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
  outputs: FakeNode[] = [];
  connect(destination: FakeNode) {
    this.outputs.push(destination);
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

const createdGains: FakeGain[] = [];

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
    const gain = new FakeGain();
    createdGains.push(gain);
    return gain;
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

class GroupVolumeResizeObserver {
  observe() {}
  disconnect() {}
}

const TRACK_IDS = ['video', 'music', 'stems', 'sfx'];
const SOURCE_LENGTHS: Record<string, number> = { song: 4000, stem: 1000, hit: 200 };
const GROUP_NAME = 'Group 1';
const VOLUME_LABEL = 'Volume';

const groupVolumeCollection: WorkspaceCollection = {
  id: 'group-volume-db',
  label: 'group-volume-db',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'group-volume-db',
      kind: 'music',
      origin: 'demo',
    },
    { id: 'stem', title: 'Stem', collectionLabel: 'group-volume-db', kind: 'stem', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'group-volume-db', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: SOURCE_LENGTHS[source.id] ?? 100,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

const GROUP_VOLUME_CLIPS: ArrangementClip[] = [
  { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
  { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 2, sourceOffset: 0, duration: 6 },
  { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function groupVolumeArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: GROUP_VOLUME_CLIPS,
  };
}

interface GroupVolumeApiRef {
  current: ArrangementContextValue | null;
}

function GroupVolumeProbe({ api }: { api: GroupVolumeApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: GroupVolumeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountGroupVolumeWorkspace() {
  const api: GroupVolumeApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={groupVolumeCollection}
      initialArrangement={groupVolumeArrangement()}
    >
      <StudioWorkspace />
      <GroupVolumeProbe api={api} />
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
  fireEvent.click(laneName(view, 'სტემები'));
  fireEvent.click(laneName(view, 'SFX'), { shiftKey: true });
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG', ctrlKey: true });
  return { api, view };
}

type GroupVolumeView = ReturnType<typeof render>;

function laneName(view: GroupVolumeView, name: string): HTMLElement {
  return view.getByRole('button', { name: new RegExp(`^${name} — set as the active track`) });
}

function rangeInput(view: GroupVolumeView, selector: string): HTMLInputElement {
  const input = view.container.querySelector(selector);
  if (!(input instanceof HTMLInputElement) || input.type !== 'range') {
    throw new Error(`range ${selector} missing`);
  }
  return input;
}

function groupFader(view: GroupVolumeView): HTMLInputElement {
  return rangeInput(view, '[data-testid="arrangement-group-volume"]');
}

function groupRow(view: GroupVolumeView): HTMLElement {
  const row = groupFader(view).closest<HTMLElement>('[data-group-id]');
  if (!row) {
    throw new Error('group row missing');
  }
  return row;
}

function storedGroupVolume(api: GroupVolumeApiRef): number | undefined {
  return arrangementGroups(live(api).getArrangement()).find((group) => group.name === GROUP_NAME)
    ?.volume;
}

function storedGroupId(api: GroupVolumeApiRef): string {
  const group = arrangementGroups(live(api).getArrangement()).find(
    (entry) => entry.name === GROUP_NAME,
  );
  if (!group) {
    throw new Error('group missing');
  }
  return group.id;
}

function liveTrackGains(): Record<string, number> {
  const trackGains = createdGains.filter((gain) =>
    gain.outputs.some((output) => output instanceof FakePanner),
  );
  const latest = trackGains.slice(-TRACK_IDS.length);
  return Object.fromEntries(TRACK_IDS.map((id, index) => [id, latest[index]?.gain.value ?? -1]));
}

function storedGains(api: GroupVolumeApiRef): Record<string, number> {
  return Object.fromEntries(trackEffectiveGains(live(api).getArrangement()));
}

function stubFaderWidth(input: HTMLInputElement, width: number) {
  Object.defineProperty(input, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(0, 0, width, 4),
  });
}

function windowPointer(
  type: 'pointermove' | 'pointerup' | 'pointercancel',
  pointerId: number,
  clientX: number,
  shiftKey = false,
) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX, shiftKey }));
  });
}

function pressFader(input: HTMLInputElement, pointerId: number, shiftKey = false) {
  stubFaderWidth(input, 100);
  fireEvent.pointerDown(input, { button: 0, buttons: 1, pointerId, clientX: 50, shiftKey });
}

function dragFader(input: HTMLInputElement, pointerId: number, deltaPx: number, shiftKey = false) {
  pressFader(input, pointerId, shiftKey);
  windowPointer('pointermove', pointerId, 50 + deltaPx, shiftKey);
  windowPointer('pointerup', pointerId, 50 + deltaPx, shiftKey);
}

function undoSteps(api: GroupVolumeApiRef, label: string | null): number {
  let steps = 0;
  while (live(api).undoLabel !== label && live(api).undoLabel !== null) {
    act(() => live(api).undo());
    steps++;
  }
  return steps;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  createdGains.length = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', GroupVolumeResizeObserver);
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

describe('group Volume dB and Shift fine (D-29z83, T12 3b)', { timeout: 20_000 }, () => {
  it('GV1: the group fader uses the lane dB range and texts; the row text stays the name only', async () => {
    const { view } = await mountGroupVolumeWorkspace();
    const fader = groupFader(view);
    expect([fader.min, fader.max, fader.step]).toEqual(['-60', '0', '0.1']);
    expect(fader.value).toBe('0');
    expect(fader.getAttribute('aria-valuetext')).toBe('+0.0 dB');
    expect(fader.getAttribute('title')).toBe('Volume +0.0 dB');
    expect(groupRow(view).textContent?.replace('▣', '').trim()).toBe(GROUP_NAME);
  });

  it('GV2: a −25 px drag stores F(−15) exactly with one entry; Undo clears, Redo restores', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    const groupedLabel = live(api).undoLabel;
    dragFader(groupFader(view), 11, -25);
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-15));
    expect(live(api).undoLabel).toBe(VOLUME_LABEL);
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBe(groupedLabel);
    expect(storedGroupVolume(api)).toBeUndefined();
    act(() => live(api).redo());
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-15));
  });

  it('GV3: a drag past the left end stores exactly 0, shows −∞ dB and silences only the members', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    act(() => live(api).togglePlayback());
    dragFader(groupFader(view), 12, -200);
    expect(storedGroupVolume(api)).toBe(0);
    expect(groupFader(view).getAttribute('aria-valuetext')).toBe('−∞ dB');
    const gains = liveTrackGains();
    expect([gains.stems, gains.sfx, gains.music]).toEqual([0, 0, 1]);
    act(() => live(api).undo());
    expect(storedGroupVolume(api)).toBeUndefined();
    act(() => live(api).togglePlayback());
  });

  it('GV4: a press without a move, or a move back to the start, keeps a context-set 0.72 and writes no entry', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    const groupId = storedGroupId(api);
    act(() => live(api).previewGroupVolume(groupId, 0.72));
    act(() => live(api).commitGroupVolume(groupId));
    expect(storedGroupVolume(api)).toBe(0.72);
    const labelBefore = live(api).undoLabel;
    pressFader(groupFader(view), 13);
    windowPointer('pointerup', 13, 50);
    expect(storedGroupVolume(api)).toBe(0.72);
    expect(live(api).undoLabel).toBe(labelBefore);
    pressFader(groupFader(view), 14);
    windowPointer('pointermove', 14, 40);
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-8.9));
    windowPointer('pointermove', 14, 50);
    windowPointer('pointerup', 14, 50);
    expect(storedGroupVolume(api)).toBe(0.72);
    expect(live(api).undoLabel).toBe(labelBefore);
  });

  it('GV5: a keyboard change plus key-up writes F(dB) with one entry; a double-click resets with one entry', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    const groupedLabel = live(api).undoLabel;
    const fader = groupFader(view);
    fader.focus();
    fireEvent.keyDown(fader, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.change(fader, { target: { value: '-0.1' } });
    fireEvent.keyUp(fader, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-0.1));
    expect(undoSteps(api, groupedLabel)).toBe(1);
    act(() => live(api).redo());
    fireEvent.doubleClick(groupFader(view));
    expect(storedGroupVolume(api)).toBeUndefined();
    act(() => live(api).undo());
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-0.1));
    expect(live(api).undoLabel).toBe(VOLUME_LABEL);
  });

  it('GV6: Shift makes the group fader ten times finer and a mid-drag Shift press re-anchors without a jump', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    const groupedLabel = live(api).undoLabel;
    dragFader(groupFader(view), 15, -25, true);
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-1.5));
    act(() => live(api).undo());
    pressFader(groupFader(view), 16);
    windowPointer('pointermove', 16, 40);
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-6));
    const arrangementBeforeShift = live(api).getArrangement();
    windowPointer('pointermove', 16, 40, true);
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-6));
    expect(live(api).getArrangement()).toBe(arrangementBeforeShift);
    windowPointer('pointermove', 16, 30, true);
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-6.6));
    windowPointer('pointerup', 16, 30, true);
    expect(undoSteps(api, groupedLabel)).toBe(1);
  });

  it('GV7: Shift −20 px on the video lane Volume gives F(−1.2) from 0 dB', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    dragFader(
      rangeInput(view, '[data-track-id="video"] input[aria-label^="Volume — "]'),
      17,
      -20,
      true,
    );
    expect(
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'video')?.volume,
    ).toBe(trackVolumeFromDb(-1.2));
  });

  it('GV8: a group drag during playback starts no new source and the live gains follow the stored mix', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    act(() => live(api).togglePlayback());
    const sources = vi.spyOn(FakeAudioContext.prototype, 'createBufferSource');
    dragFader(groupFader(view), 18, -10);
    expect(storedGroupVolume(api)).toBe(trackVolumeFromDb(-6));
    expect(sources).toHaveBeenCalledTimes(0);
    expect(liveTrackGains()).toEqual(storedGains(api));
    expect(liveTrackGains().stems).toBe(trackVolumeFromDb(-6));
    act(() => live(api).togglePlayback());
  });

  it('GV9 must-not: Pan ignores Shift, while Clip Gain keeps its ten times finer drag', async () => {
    const { api, view } = await mountGroupVolumeWorkspace();
    const pan = () => rangeInput(view, 'input[aria-label="Pan — მუსიკა"]');
    const storedPan = () =>
      live(api)
        .getArrangement()
        .tracks.find((track) => track.id === 'music')?.pan;
    dragFader(pan(), 19, -25);
    const plainPan = storedPan();
    expect(plainPan).toBe(-0.5);
    act(() => live(api).undo());
    dragFader(pan(), 20, -25, true);
    expect(storedPan()).toBe(plainPan);
    act(() => live(api).selectClips(['cm']));
    dragFader(rangeInput(view, '[data-testid="arrangement-detail-clip-gain-fader"]'), 21, 25, true);
    expect(
      live(api)
        .getArrangement()
        .clips.find((clip) => clip.id === 'cm')?.gainDb,
    ).toBe(2.1);
  });
});
