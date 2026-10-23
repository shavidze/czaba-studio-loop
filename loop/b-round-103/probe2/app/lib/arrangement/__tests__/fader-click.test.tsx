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
import type { Arrangement, ArrangementTrack, WorkspaceCollection } from '~/types/arrangement';
import { relativeFaderValue } from '../fader';
import { createArrangement, trackPanValue } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const PAN_LABEL = 'Pan — მუსიკა';
const VOLUME_LABEL = 'Volume';
const MASTER_VOLUME_LABEL = 'Master Volume';
const CLIP_GAIN_LABEL = 'Clip Gain';

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
  buffer: { id: string } | null = null;
  onended: ((event: Event) => unknown) | null = null;
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

const clickCollection: WorkspaceCollection = {
  id: 'fader-click',
  label: 'fader-click',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'fader-click', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'fader-click', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 2, sampleRate: 100 }),
};

function clickArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    tracks: base.tracks.map((track) => (track.id === 'music' ? { ...track, volume: 0.6 } : track)),
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 4 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 12 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0.5, duration: 2 },
    ],
  };
}

function trackOf(arrangement: Arrangement, id: string): ArrangementTrack {
  const track = arrangement.tracks.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`track ${id} missing`);
  }
  return track;
}

interface ClickApiRef {
  current: ArrangementContextValue | null;
}

function ClickProbe({ api }: { api: ClickApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: ClickApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function undoChainLabels(api: ClickApiRef): string[] {
  const labels: string[] = [];
  for (let label = live(api).undoLabel; label !== null; label = live(api).undoLabel) {
    labels.push(label);
    act(() => live(api).undo());
  }
  return labels;
}

async function mountClickWorkspace() {
  const api: ClickApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={clickCollection} initialArrangement={clickArrangement()}>
      <StudioWorkspace />
      <ClickProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const range = (selector: string) => {
    const input = view.container.querySelector(selector);
    if (!(input instanceof HTMLInputElement) || input.type !== 'range') {
      throw new Error(`range ${selector} missing`);
    }
    return input;
  };
  const controls = {
    pan: () => range('[data-track-id="music"] [data-testid="arrangement-track-pan"]'),
    musicVolume: () => range('[data-track-id="music"] input[aria-label="Volume — მუსიკა"]'),
    sfxVolume: () => range('[data-track-id="sfx"] input[aria-label="Volume — SFX"]'),
    videoVolume: () =>
      range('[data-track-id="video"] input[aria-label="Volume — ვიდეოს ორიგინალი ხმა"]'),
    master: () => range('input[aria-label="Master Volume"]'),
    zoom: () => range('[data-testid="arrangement-zoom"]'),
  };
  const panReset = () => {
    const reset = view.container.querySelector(
      '[data-track-id="music"] [data-testid="arrangement-track-pan-reset"]',
    );
    if (!(reset instanceof HTMLButtonElement)) {
      throw new Error('pan reset missing');
    }
    return reset;
  };
  const clipGainField = () => {
    const field = view.getByTestId('arrangement-detail-clip-gain-input');
    if (!(field instanceof HTMLInputElement)) {
      throw new Error('clip gain field missing');
    }
    return field;
  };
  const startSeparatorGesture = () => {
    const separator = view.getByTestId('arrangement-detail-separator');
    fireEvent.pointerDown(separator, { ...press, pointerId: 41, clientY: 400 });
    expect(live(api).isPointerGestureActive()).toBe(true);
  };
  return { api, view, controls, panReset, clipGainField, startSeparatorGesture };
}

const press = { button: 0, buttons: 1 };

function stubFaderWidth(input: HTMLInputElement, width: number) {
  const rect: DOMRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width,
    height: 4,
    right: width,
    bottom: 4,
    toJSON: () => ({}),
  };
  Object.defineProperty(input, 'getBoundingClientRect', { configurable: true, value: () => rect });
}

function windowPointer(
  type: 'pointermove' | 'pointerup' | 'pointercancel',
  pointerId: number,
  clientX = 0,
) {
  act(() => {
    window.dispatchEvent(new PointerEvent(type, { pointerId, clientX }));
  });
}

function dragFader(
  input: HTMLInputElement,
  options: { pointerId: number; width: number; deltaPx: number; release?: boolean },
) {
  stubFaderWidth(input, options.width);
  const startX = options.width / 2;
  const prevented = !fireEvent.pointerDown(input, {
    ...press,
    pointerId: options.pointerId,
    clientX: startX,
  });
  windowPointer('pointermove', options.pointerId, startX + options.deltaPx);
  if (options.release !== false) {
    windowPointer('pointerup', options.pointerId, startX + options.deltaPx);
  }
  return prevented;
}

function keyboardValue(input: HTMLInputElement, value: string) {
  input.focus();
  fireEvent.change(input, { target: { value } });
  fireEvent.keyUp(input, { key: 'ArrowLeft' });
}

describe('relativeFaderValue (D-29z3)', () => {
  it('P1: Volume start 1, Δ −25 px over 100 px gives exactly 0.75', () => {
    expect(
      relativeFaderValue({ startValue: 1, deltaPx: -25, widthPx: 100, min: 0, max: 1, step: 0.01 }),
    ).toBe(0.75);
  });

  it('P2: the value is clamped to the range', () => {
    expect(
      relativeFaderValue({
        startValue: 1,
        deltaPx: -200,
        widthPx: 100,
        min: 0,
        max: 1,
        step: 0.01,
      }),
    ).toBe(0);
    expect(
      relativeFaderValue({ startValue: 1, deltaPx: 10, widthPx: 100, min: 0, max: 1, step: 0.01 }),
    ).toBe(1);
  });

  it('P3: Master start 0, Δ −24 px over 132 px gives −12 dB', () => {
    expect(
      relativeFaderValue({
        startValue: 0,
        deltaPx: -24,
        widthPx: 132,
        min: -60,
        max: 6,
        step: 0.5,
      }),
    ).toBe(-12);
  });

  it('P4: Pan steps start 0, Δ +10 px over 100 px gives 10', () => {
    expect(
      relativeFaderValue({ startValue: 0, deltaPx: 10, widthPx: 100, min: -50, max: 50, step: 1 }),
    ).toBe(10);
  });

  it('P5: an unusable width or delta keeps the start value; a sub-step move snaps back', () => {
    const volume = { startValue: 0.6, min: 0, max: 1, step: 0.01 };
    expect(relativeFaderValue({ ...volume, deltaPx: -25, widthPx: 0 })).toBe(0.6);
    expect(relativeFaderValue({ ...volume, deltaPx: -25, widthPx: Number.NaN })).toBe(0.6);
    expect(relativeFaderValue({ ...volume, deltaPx: Number.NaN, widthPx: 100 })).toBe(0.6);
    expect(
      relativeFaderValue({
        startValue: 1,
        deltaPx: -0.4,
        widthPx: 100,
        min: 0,
        max: 1,
        step: 0.01,
      }),
    ).toBe(1);
  });

  it('P6: an off-grid drag snaps to the step; a zero delta keeps an off-grid start value', () => {
    const volume = { min: 0, max: 1, step: 0.01, widthPx: 100 };
    expect(relativeFaderValue({ ...volume, startValue: 1, deltaPx: -24.6 })).toBe(0.75);
    expect(relativeFaderValue({ ...volume, startValue: 0.333, deltaPx: 0 })).toBe(0.333);
  });
});

describe('fader press, relative drag and double-click (D-29z3)', () => {
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

  it('F1: a press with no movement keeps the music Volume at 0.6, writes no entry and focuses the fader', async () => {
    const { api, controls } = await mountClickWorkspace();
    const volume = controls.musicVolume();
    stubFaderWidth(volume, 100);
    const statusBefore = live(api).status;
    expect(fireEvent.pointerDown(volume, { ...press, pointerId: 51, clientX: 50 })).toBe(false);
    expect(document.activeElement).toBe(volume);
    expect(live(api).isPointerGestureActive()).toBe(true);
    windowPointer('pointerup', 51, 50);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).status).toBe(statusBefore);
    expect(live(api).undoLabel).toBeNull();
  });

  it('F2: a −25 px drag over 100 px moves the music Volume from 0.6 to 0.35 with one Volume entry; undo restores', async () => {
    const { api, controls } = await mountClickWorkspace();
    expect(dragFader(controls.musicVolume(), { pointerId: 52, width: 100, deltaPx: -25 })).toBe(
      true,
    );
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.35);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBe(VOLUME_LABEL);
    act(() => live(api).undo());
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).undoLabel).toBeNull();
  });

  it('F3: a drag that returns to its start writes no entry', async () => {
    const { api, controls } = await mountClickWorkspace();
    const volume = controls.musicVolume();
    dragFader(volume, { pointerId: 53, width: 100, deltaPx: -25, release: false });
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.35);
    windowPointer('pointermove', 53, 50);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    windowPointer('pointerup', 53, 50);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).undoLabel).toBeNull();
  });

  it('F4: a −24 px Master drag over 132 px gives −12 dB with one Master Volume entry', async () => {
    const { api, controls } = await mountClickWorkspace();
    dragFader(controls.master(), { pointerId: 54, width: 132, deltaPx: -24 });
    expect(live(api).arrangement.master.gainDb).toBe(-12);
    expect(undoChainLabels(api)).toEqual([MASTER_VOLUME_LABEL]);
    expect(live(api).arrangement.master.gainDb).toBe(0);
  });

  it('F5: a +10 px Pan drag over 100 px previews 10R without a history change, then commits 0.2 with one Pan entry', async () => {
    const { api, controls, panReset } = await mountClickWorkspace();
    const pan = controls.pan();
    const presentBefore = live(api).arrangement;
    dragFader(pan, { pointerId: 55, width: 100, deltaPx: 10, release: false });
    expect(live(api).arrangement).toBe(presentBefore);
    expect(live(api).undoLabel).toBeNull();
    expect(panReset().textContent).toBe('10R');
    expect(controls.pan().getAttribute('aria-valuetext')).toBe('10R');
    windowPointer('pointerup', 55, 60);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0.2);
    expect(panReset().textContent).toBe('10R');
    expect(undoChainLabels(api)).toEqual([PAN_LABEL]);
  });

  it('F6: the video-track Volume press writes no entry; a −25 px drag gives 0.75 with one entry', async () => {
    const { api, controls } = await mountClickWorkspace();
    const video = controls.videoVolume();
    stubFaderWidth(video, 100);
    expect(fireEvent.pointerDown(video, { ...press, pointerId: 56, clientX: 50 })).toBe(false);
    expect(document.activeElement).toBe(video);
    windowPointer('pointerup', 56, 50);
    expect(trackOf(live(api).arrangement, 'video').volume).toBe(1);
    expect(live(api).undoLabel).toBeNull();
    dragFader(controls.videoVolume(), { pointerId: 57, width: 100, deltaPx: -25 });
    expect(trackOf(live(api).arrangement, 'video').volume).toBe(0.75);
    expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
  });

  it('F7: a music Volume press during a separator gesture is refused with the blocked status and no focus or value change', async () => {
    const { api, controls, startSeparatorGesture } = await mountClickWorkspace();
    startSeparatorGesture();
    const volume = controls.musicVolume();
    stubFaderWidth(volume, 100);
    const focusedBefore = document.activeElement;
    expect(fireEvent.pointerDown(volume, { ...press, pointerId: 42, clientX: 50 })).toBe(false);
    expect(document.activeElement).toBe(focusedBefore);
    expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    windowPointer('pointermove', 42, 10);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    windowPointer('pointerup', 42, 10);
    windowPointer('pointerup', 41);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).undoLabel).toBeNull();
  });

  it('F8 must-not: a pointercancel during the drag restores the value and writes no entry', async () => {
    const { api, controls } = await mountClickWorkspace();
    dragFader(controls.musicVolume(), { pointerId: 58, width: 100, deltaPx: -25, release: false });
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.35);
    windowPointer('pointercancel', 58, 25);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    windowPointer('pointermove', 58, 10);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
  });

  it('F9 / F9b must-not: a blur during the drag restores the value; later moves, a blur commit and the release change nothing', async () => {
    const { api, controls } = await mountClickWorkspace();
    const volume = controls.musicVolume();
    dragFader(volume, { pointerId: 59, width: 100, deltaPx: -25, release: false });
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.35);
    fireEvent.blur(volume);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).undoLabel).toBeNull();
    windowPointer('pointermove', 59, 10);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    volume.focus();
    fireEvent.blur(volume);
    windowPointer('pointerup', 59, 10);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
  });

  it('D1: a double-click resets the music Volume from 0.4 to 1 with one Volume entry', async () => {
    const { api, controls } = await mountClickWorkspace();
    keyboardValue(controls.musicVolume(), '0.4');
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.4);
    fireEvent.dblClick(controls.musicVolume());
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
    expect(undoChainLabels(api)).toEqual([VOLUME_LABEL, VOLUME_LABEL]);
  });

  it('D2: a double-click resets Master from −12 dB to 0 dB with one Master Volume entry', async () => {
    const { api, controls } = await mountClickWorkspace();
    keyboardValue(controls.master(), '-12');
    expect(live(api).arrangement.master.gainDb).toBe(-12);
    fireEvent.dblClick(controls.master());
    expect(live(api).arrangement.master.gainDb).toBe(0);
    expect(live(api).undoLabel).toBe(MASTER_VOLUME_LABEL);
    expect(undoChainLabels(api)).toEqual([MASTER_VOLUME_LABEL, MASTER_VOLUME_LABEL]);
  });

  it('D3: a double-click resets the music Pan from 25L to C with one Pan entry and disables the readout', async () => {
    const { api, controls, panReset } = await mountClickWorkspace();
    controls.pan().focus();
    fireEvent.change(controls.pan(), { target: { value: '-25' } });
    expect(panReset().textContent).toBe('25L');
    fireEvent.dblClick(controls.pan());
    expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0);
    expect(panReset().textContent).toBe('C');
    expect(panReset().disabled).toBe(true);
    expect(live(api).undoLabel).toBe(PAN_LABEL);
    expect(undoChainLabels(api)).toEqual([PAN_LABEL, PAN_LABEL]);
  });

  it('D4 must-not: a double-click at the default on Volume, Master and Pan writes no entry and leaves the status', async () => {
    const { api, controls } = await mountClickWorkspace();
    const statusBefore = live(api).status;
    fireEvent.dblClick(controls.sfxVolume());
    fireEvent.dblClick(controls.videoVolume());
    fireEvent.dblClick(controls.master());
    fireEvent.dblClick(controls.pan());
    expect(trackOf(live(api).arrangement, 'sfx').volume).toBe(1);
    expect(trackOf(live(api).arrangement, 'video').volume).toBe(1);
    expect(live(api).arrangement.master.gainDb).toBe(0);
    expect(trackPanValue(trackOf(live(api).arrangement, 'music'))).toBe(0);
    expect(live(api).status).toBe(statusBefore);
    expect(live(api).undoLabel).toBeNull();
  });

  it('D5: a double-click during a separator gesture is refused with the blocked status and no entry', async () => {
    const { api, controls, startSeparatorGesture } = await mountClickWorkspace();
    keyboardValue(controls.musicVolume(), '0.4');
    startSeparatorGesture();
    fireEvent.dblClick(controls.musicVolume());
    expect(live(api).status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.4);
    windowPointer('pointerup', 41);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.4);
    expect(undoChainLabels(api)).toEqual([VOLUME_LABEL]);
  });

  it('D6: two presses, two clicks and the double-click add exactly one entry, the reset', async () => {
    const { api, controls } = await mountClickWorkspace();
    keyboardValue(controls.musicVolume(), '0.4');
    const volume = controls.musicVolume();
    stubFaderWidth(volume, 100);
    for (const pointerId of [60, 61]) {
      fireEvent.pointerDown(volume, { ...press, pointerId, clientX: 50 });
      fireEvent.pointerUp(volume, { pointerId, clientX: 50 });
      fireEvent.click(volume);
      expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.4);
    }
    fireEvent.dblClick(volume);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(1);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(undoChainLabels(api)).toEqual([VOLUME_LABEL, VOLUME_LABEL]);
  });

  it('T1: the faders carry touch-none and prevent the press; Zoom stays native', async () => {
    const { controls } = await mountClickWorkspace();
    for (const fader of [
      controls.musicVolume(),
      controls.sfxVolume(),
      controls.videoVolume(),
      controls.pan(),
      controls.master(),
    ]) {
      expect(fader.classList.contains('touch-none')).toBe(true);
    }
    const zoom = controls.zoom();
    expect(zoom.classList.contains('touch-none')).toBe(false);
    expect(fireEvent.pointerDown(zoom, { ...press, pointerId: 62, clientX: 40 })).toBe(true);
    windowPointer('pointerup', 62, 40);
  });

  it('R1: Clip Gain typed "3" then a music Volume press with no move commits only the Clip Gain and focuses the fader', async () => {
    const { api, controls, clipGainField } = await mountClickWorkspace();
    act(() => live(api).selectClip('s1'));
    const field = clipGainField();
    field.focus();
    fireEvent.change(field, { target: { value: '3' } });
    const volume = controls.musicVolume();
    stubFaderWidth(volume, 100);
    fireEvent.pointerDown(volume, { ...press, pointerId: 63, clientX: 50 });
    windowPointer('pointerup', 63, 50);
    expect(document.activeElement).toBe(volume);
    expect(live(api).status).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(live(api).arrangement.clips.find((clip) => clip.id === 's1')?.gainDb).toBe(3);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(undoChainLabels(api)).toEqual([CLIP_GAIN_LABEL]);
  });

  it('must-not: a foreign pointer and a purely vertical move change nothing during the drag', async () => {
    const { api, controls } = await mountClickWorkspace();
    const volume = controls.musicVolume();
    stubFaderWidth(volume, 100);
    fireEvent.pointerDown(volume, { ...press, pointerId: 64, clientX: 50, clientY: 2 });
    windowPointer('pointermove', 65, 10);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { pointerId: 64, clientX: 50, clientY: 42 }),
      );
    });
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    windowPointer('pointerup', 64, 50);
    expect(live(api).isPointerGestureActive()).toBe(false);
    expect(live(api).undoLabel).toBeNull();
  });

  it('must-not: a non-left press is not prevented, starts no gesture and moves no focus', async () => {
    const { api, controls } = await mountClickWorkspace();
    const volume = controls.musicVolume();
    stubFaderWidth(volume, 100);
    const focusedBefore = document.activeElement;
    expect(
      fireEvent.pointerDown(volume, { button: 2, buttons: 2, pointerId: 66, clientX: 50 }),
    ).toBe(true);
    expect(document.activeElement).toBe(focusedBefore);
    expect(live(api).isPointerGestureActive()).toBe(false);
    windowPointer('pointermove', 66, 10);
    windowPointer('pointerup', 66, 10);
    expect(trackOf(live(api).arrangement, 'music').volume).toBe(0.6);
    expect(live(api).undoLabel).toBeNull();
  });

  it('must-not: unmounting during a drag removes the window move listener', async () => {
    const { view, controls } = await mountClickWorkspace();
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');
    dragFader(controls.master(), { pointerId: 67, width: 132, deltaPx: -24, release: false });
    const moveListeners = added.mock.calls
      .filter(([type]) => type === 'pointermove')
      .map(([, listener]) => listener);
    expect(moveListeners).toHaveLength(1);
    view.unmount();
    expect(
      removed.mock.calls.some(
        ([type, listener]) => type === 'pointermove' && listener === moveListeners[0],
      ),
    ).toBe(true);
  });
});
